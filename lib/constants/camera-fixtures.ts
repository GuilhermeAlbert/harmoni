import { CameraStatus } from "@/lib/enums/camera-status";
import type { Camera } from "@/lib/types/camera";

export const CAMERA_FIXTURES = [
  {
    capabilities: {
      exposure: { max: 2, min: -2, step: 0.1 },
      zoom: { max: 3, min: 1, step: 0.05 },
    },
    exposure: 0,
    format: { frameRate: 30, height: 2160, width: 3840 },
    id: "logitech-brio",
    live: true,
    name: "Logitech Brio",
    preferred: true,
    status: CameraStatus.Available,
    transport: "USB",
    zoom: 1.15,
  },
  {
    capabilities: {
      exposure: { max: 1, min: -1, step: 0.1 },
    },
    exposure: 0.2,
    format: { frameRate: 30, height: 1080, width: 1920 },
    id: "studio-display-camera",
    live: false,
    name: "Studio Display Camera",
    preferred: false,
    status: CameraStatus.Available,
    transport: "USB-C",
    zoom: 1,
  },
  {
    capabilities: {},
    exposure: 0,
    format: { frameRate: 30, height: 1080, width: 1920 },
    id: "continuity-camera",
    live: false,
    name: "Continuity Camera",
    preferred: false,
    status: CameraStatus.Unavailable,
    transport: "Wireless",
    zoom: 1,
  },
] as const satisfies readonly Camera[];
