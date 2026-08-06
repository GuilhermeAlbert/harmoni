import { AudioDeviceStatus } from "@/lib/enums/audio-device-status";
import { AudioDirection } from "@/lib/enums/audio-direction";
import { AudioTransport } from "@/lib/enums/audio-transport";
import type { AudioDevice } from "@/lib/types/audio-device";

export const AUDIO_DEVICE_FIXTURES = [
  {
    default: true,
    direction: AudioDirection.Input,
    id: "shure-mv7-input",
    muted: false,
    name: "Shure MV7",
    status: AudioDeviceStatus.Available,
    transport: AudioTransport.Usb,
    volume: 72,
  },
  {
    default: false,
    direction: AudioDirection.Input,
    id: "macbook-microphone",
    muted: false,
    name: "MacBook Pro Microphone",
    status: AudioDeviceStatus.Available,
    transport: AudioTransport.BuiltIn,
    volume: 58,
  },
  {
    default: false,
    direction: AudioDirection.Input,
    id: "airpods-microphone",
    muted: true,
    name: "AirPods Pro Microphone",
    status: AudioDeviceStatus.Unavailable,
    transport: AudioTransport.Bluetooth,
    volume: 36,
  },
  {
    default: true,
    direction: AudioDirection.Output,
    id: "studio-display-output",
    muted: false,
    name: "Studio Display",
    status: AudioDeviceStatus.Available,
    transport: AudioTransport.UsbC,
    volume: 46,
  },
  {
    default: false,
    direction: AudioDirection.Output,
    id: "macbook-speakers",
    muted: false,
    name: "MacBook Pro Speakers",
    status: AudioDeviceStatus.Available,
    transport: AudioTransport.BuiltIn,
    volume: 64,
  },
  {
    default: false,
    direction: AudioDirection.Output,
    id: "conference-display-output",
    muted: false,
    name: "Conference Display",
    status: AudioDeviceStatus.Unsupported,
    transport: AudioTransport.Hdmi,
    volume: 50,
  },
] as const satisfies readonly AudioDevice[];
