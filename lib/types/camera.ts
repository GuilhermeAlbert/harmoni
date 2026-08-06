import type { CameraStatus } from "@/lib/enums/camera-status";

export interface CameraFormat {
  readonly frameRate: number;
  readonly height: number;
  readonly width: number;
}

export interface CameraCapabilityRange {
  readonly max: number;
  readonly min: number;
  readonly step: number;
}

export interface CameraCapabilities {
  readonly exposure?: CameraCapabilityRange;
  readonly zoom?: CameraCapabilityRange;
}

export interface Camera {
  readonly capabilities: CameraCapabilities;
  readonly exposure: number;
  readonly format: CameraFormat;
  readonly id: string;
  readonly live: boolean;
  readonly name: string;
  readonly preferred: boolean;
  readonly status: CameraStatus;
  readonly transport: string;
  readonly zoom: number;
}
