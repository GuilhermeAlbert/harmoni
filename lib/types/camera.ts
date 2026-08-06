import type { CameraAuthorization } from "@/lib/enums/camera-authorization";
import type { CameraTransport } from "@/lib/enums/camera-transport";

export interface CameraFormat {
  readonly frameRate: number;
  readonly height: number;
  readonly width: number;
}

export interface CameraCapability {
  readonly canControl: boolean;
  readonly max: number;
  readonly min: number;
  readonly value: number;
}

export interface Camera {
  readonly exposure: CameraCapability | null;
  readonly formats: readonly CameraFormat[];
  readonly id: string;
  readonly name: string;
  readonly preferred: boolean;
  readonly transport: CameraTransport;
  readonly zoom: CameraCapability | null;
}

export interface CameraDiscovery {
  readonly authorization: CameraAuthorization;
  readonly cameras: readonly Camera[];
}
