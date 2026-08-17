use serde::{Deserialize, Serialize};

use crate::sidecar::NativeAgentError;

pub(crate) const PROFILE_SCHEMA_VERSION: u16 = 2;

#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "lowercase")]
pub(crate) enum ProfileOrigin {
    Local,
    Seeded,
}

#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "lowercase")]
pub(crate) enum ProfilePreset {
    Private,
    Recording,
    Work,
}

#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProfilePreferences {
    pub(crate) audio_input_id: Option<String>,
    #[serde(default)]
    pub(crate) set_audio_input_default: bool,
    pub(crate) audio_output_id: Option<String>,
    pub(crate) camera_id: Option<String>,
    pub(crate) input_volume: Option<u8>,
    pub(crate) microphones_muted: Option<bool>,
    #[serde(default)]
    pub(crate) stop_camera_preview: bool,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct Profile {
    pub(crate) id: String,
    pub(crate) name: String,
    pub(crate) description: Option<String>,
    pub(crate) origin: ProfileOrigin,
    pub(crate) preset: Option<ProfilePreset>,
    pub(crate) active: bool,
    pub(crate) preferences: ProfilePreferences,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProfileStore {
    pub(crate) version: u16,
    pub(crate) active_profile_id: Option<String>,
    pub(crate) profiles: Vec<Profile>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProfileOperationResult {
    pub(super) operation: &'static str,
    pub(super) status: ProfileOperationStatus,
    pub(super) error: Option<NativeAgentError>,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq, Serialize)]
#[serde(rename_all = "kebab-case")]
pub(super) enum ProfileOperationStatus {
    Failed,
    MissingDevice,
    SkippedNotRequested,
    SkippedUnsupported,
    Success,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProfileApplicationResult {
    pub(super) profile_id: String,
    pub(super) fully_applied: bool,
    pub(super) operations: Vec<ProfileOperationResult>,
    pub(super) profiles: Vec<Profile>,
}

impl ProfileStore {
    pub(crate) fn is_valid(&self) -> bool {
        self.profiles.len() <= 256
            && self.profiles.iter().all(Profile::is_valid)
            && self.profiles.iter().enumerate().all(|(index, profile)| {
                self.profiles[..index]
                    .iter()
                    .all(|other| other.id != profile.id)
            })
            && self.active_profile_id.as_ref().is_none_or(|id| {
                self.profiles
                    .iter()
                    .any(|profile| &profile.id == id && profile.active)
            })
            && self
                .profiles
                .iter()
                .filter(|profile| profile.active)
                .count()
                <= 1
    }
}

impl Profile {
    pub(super) fn is_valid(&self) -> bool {
        !self.id.is_empty()
            && self.id.len() <= 128
            && !self.name.trim().is_empty()
            && self.name.len() <= 40
            && self
                .description
                .as_ref()
                .is_none_or(|value| value.len() <= 120)
            && self
                .preferences
                .input_volume
                .is_none_or(|value| value <= 100)
            && [
                self.preferences.audio_input_id.as_deref(),
                self.preferences.audio_output_id.as_deref(),
                self.preferences.camera_id.as_deref(),
            ]
            .iter()
            .flatten()
            .all(|id| !id.is_empty() && id.len() <= 1024)
            && (!self.preferences.set_audio_input_default
                && self.preferences.input_volume.is_none()
                && self.preferences.microphones_muted.is_none()
                || self.preferences.audio_input_id.is_some())
    }
}
