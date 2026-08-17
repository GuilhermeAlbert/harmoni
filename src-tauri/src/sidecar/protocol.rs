#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub(crate) enum AgentMethod {
    AgentInfo,
    AudioDevices,
    AudioSetDefaultInput,
    AudioSetDefaultOutput,
    AudioSetMute,
    AudioSetVolume,
    AudioWatchDeviceEvents,
    CameraDevices,
    CameraSetExposure,
    CameraSetZoom,
    CameraStartPreview,
    CameraWatchDeviceEvents,
    DevelopmentEmitDeviceEvent,
    HidDevices,
    HidWatchDeviceEvents,
    PermissionsOpenSettings,
    PermissionsStatus,
}

impl AgentMethod {
    pub(crate) const fn as_str(self) -> &'static str {
        match self {
            Self::AgentInfo => "agent.info",
            Self::AudioDevices => "audio.devices",
            Self::AudioSetDefaultInput => "audio.setDefaultInput",
            Self::AudioSetDefaultOutput => "audio.setDefaultOutput",
            Self::AudioSetMute => "audio.setMute",
            Self::AudioSetVolume => "audio.setVolume",
            Self::AudioWatchDeviceEvents => "audio.watchDeviceEvents",
            Self::CameraDevices => "camera.devices",
            Self::CameraSetExposure => "camera.setExposure",
            Self::CameraSetZoom => "camera.setZoom",
            Self::CameraStartPreview => "camera.startPreview",
            Self::CameraWatchDeviceEvents => "camera.watchDeviceEvents",
            Self::DevelopmentEmitDeviceEvent => "development.emitDeviceEvent",
            Self::HidDevices => "hid.devices",
            Self::HidWatchDeviceEvents => "hid.watchDeviceEvents",
            Self::PermissionsOpenSettings => "permissions.openSettings",
            Self::PermissionsStatus => "permissions.status",
        }
    }
}

#[cfg(test)]
mod tests {
    use super::AgentMethod;

    #[test]
    fn agent_methods_preserve_wire_protocol_values() {
        assert_eq!(AgentMethod::AgentInfo.as_str(), "agent.info");
        assert_eq!(
            AgentMethod::DevelopmentEmitDeviceEvent.as_str(),
            "development.emitDeviceEvent"
        );
        assert_eq!(
            AgentMethod::AudioSetDefaultInput.as_str(),
            "audio.setDefaultInput"
        );
        assert_eq!(
            AgentMethod::CameraStartPreview.as_str(),
            "camera.startPreview"
        );
    }
}
