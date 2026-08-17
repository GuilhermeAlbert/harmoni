use super::{CameraCapability, CameraDevice, CameraDiscovery};
use crate::sidecar::{parse_agent_result, AgentOutput, NativeAgentError};

pub(super) fn parse_camera_discovery(
    output: &AgentOutput,
) -> Result<CameraDiscovery, NativeAgentError> {
    let result: CameraDiscovery = parse_agent_result(output)?;
    let identifiers: HashSet<_> = result
        .cameras
        .iter()
        .map(|camera| camera.id.as_str())
        .collect();
    let preferred_count = result
        .cameras
        .iter()
        .filter(|camera| camera.preferred)
        .count();

    if identifiers.len() != result.cameras.len()
        || preferred_count > 1
        || result.cameras.len() > 128
        || result.cameras.iter().any(invalid_camera)
    {
        return Err(NativeAgentError::protocol());
    }
    Ok(result)
}

pub(super) fn validate_control_value(value: f64) -> Result<(), NativeAgentError> {
    if !value.is_finite() {
        return Err(NativeAgentError::invalid_argument());
    }
    Ok(())
}

pub(super) fn invalid_camera(camera: &CameraDevice) -> bool {
    camera.id.is_empty()
        || camera.id.len() > 1024
        || camera.name.trim().is_empty()
        || camera.name.len() > 512
        || camera.formats.len() > 512
        || camera.formats.iter().any(|format| {
            format.width == 0
                || format.width > 16_384
                || format.height == 0
                || format.height > 16_384
                || !format.frame_rate.is_finite()
                || format.frame_rate <= 0.0
                || format.frame_rate > 1_000.0
        })
        || camera.zoom.as_ref().is_some_and(invalid_capability)
        || camera.exposure.as_ref().is_some_and(invalid_capability)
}

fn invalid_capability(capability: &CameraCapability) -> bool {
    !capability.min.is_finite()
        || !capability.max.is_finite()
        || !capability.value.is_finite()
        || capability.min > capability.max
        || capability.value < capability.min
        || capability.value > capability.max
        || (capability.can_control && capability.min == capability.max)
}
use std::collections::HashSet;
