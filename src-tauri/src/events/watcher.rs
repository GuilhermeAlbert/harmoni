use std::{sync::Mutex, time::Duration};

use serde::Serialize;
use tauri_plugin_shell::process::CommandChild;

pub(crate) const MAX_RESTART_ATTEMPTS: u32 = 4;
const INITIAL_RETRY_DELAY_MS: u64 = 250;
const MAX_RETRY_DELAY_MS: u64 = 2_000;

#[derive(Default)]
pub(crate) struct WatcherProcess(Mutex<WatcherSlot>);

#[derive(Default)]
struct WatcherSlot {
    child: Option<CommandChild>,
    running: bool,
    stopping: bool,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(crate) enum WatcherState {
    Retrying,
    Running,
    Stopped,
    Stopping,
}

impl WatcherProcess {
    pub(crate) fn begin(&self) -> bool {
        let Ok(mut slot) = self.0.lock() else {
            return false;
        };
        if slot.running {
            return false;
        }
        slot.running = true;
        slot.stopping = false;
        true
    }

    pub(crate) fn store(&self, child: CommandChild) -> Result<(), CommandChild> {
        let Ok(mut slot) = self.0.lock() else {
            return Err(child);
        };
        if slot.stopping || slot.child.is_some() {
            return Err(child);
        }
        slot.child = Some(child);
        Ok(())
    }

    pub(crate) fn take(&self) -> Option<CommandChild> {
        self.0.lock().ok()?.child.take()
    }

    pub(crate) fn is_stopping(&self) -> bool {
        self.0.lock().map_or(true, |slot| slot.stopping)
    }

    pub(crate) fn status(&self) -> WatcherState {
        let Ok(slot) = self.0.lock() else {
            return WatcherState::Stopped;
        };
        if slot.stopping {
            WatcherState::Stopping
        } else if slot.child.is_some() {
            WatcherState::Running
        } else if slot.running {
            WatcherState::Retrying
        } else {
            WatcherState::Stopped
        }
    }

    pub(crate) fn stop(&self) {
        if let Ok(mut slot) = self.0.lock() {
            slot.stopping = true;
            if let Some(child) = slot.child.take() {
                let _ = child.kill();
            }
        }
    }

    pub(crate) fn finish(&self) {
        if let Ok(mut slot) = self.0.lock() {
            slot.running = false;
            slot.stopping = false;
            slot.child = None;
        }
    }
}

pub(crate) fn retry_delay(attempt: u32) -> Duration {
    Duration::from_millis(
        INITIAL_RETRY_DELAY_MS
            .saturating_mul(2_u64.saturating_pow(attempt))
            .min(MAX_RETRY_DELAY_MS),
    )
}

#[cfg(test)]
mod tests {
    use super::{retry_delay, WatcherProcess, WatcherState, MAX_RESTART_ATTEMPTS};
    use std::time::Duration;

    #[test]
    fn retries_use_bounded_exponential_backoff() {
        assert_eq!(MAX_RESTART_ATTEMPTS, 4);
        assert_eq!(retry_delay(0), Duration::from_millis(250));
        assert_eq!(retry_delay(1), Duration::from_millis(500));
        assert_eq!(retry_delay(2), Duration::from_millis(1_000));
        assert_eq!(retry_delay(3), Duration::from_millis(2_000));
        assert_eq!(retry_delay(20), Duration::from_millis(2_000));
    }

    #[test]
    fn rejects_duplicate_supervisors_and_allows_a_clean_restart() {
        let watcher = WatcherProcess::default();
        assert_eq!(watcher.status(), WatcherState::Stopped);
        assert!(watcher.begin());
        assert_eq!(watcher.status(), WatcherState::Retrying);
        assert!(!watcher.begin());
        watcher.stop();
        assert_eq!(watcher.status(), WatcherState::Stopping);
        assert!(watcher.is_stopping());
        watcher.finish();
        assert_eq!(watcher.status(), WatcherState::Stopped);
        assert!(watcher.begin());
    }
}
