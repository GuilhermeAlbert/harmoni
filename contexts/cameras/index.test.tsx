import { act, render, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CamerasProvider } from ".";
import { useCameras } from "./use-cameras";
import type { CamerasContextValue } from "./types";
import { CameraAuthorization } from "@/lib/enums/camera-authorization";
import { CameraTransport } from "@/lib/enums/camera-transport";
import * as cameraService from "@/lib/services/cameras";
import * as deviceEventService from "@/lib/services/device-events";
import type { Camera } from "@/lib/types/camera";

vi.mock("@/lib/services/cameras");
vi.mock("@/lib/services/device-events");

const FIRST_CAMERA: Camera = {
  exposure: null,
  formats: [],
  id: "camera-one",
  name: "Camera one",
  preferred: true,
  transport: CameraTransport.External,
  zoom: null,
};

const SECOND_CAMERA: Camera = {
  ...FIRST_CAMERA,
  id: "camera-two",
  name: "Camera two",
  preferred: false,
};

function deferred<Value>(): {
  promise: Promise<Value>;
  resolve: (value: Value) => void;
} {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

function ContextProbe({ onValue }: { onValue: (value: CamerasContextValue) => void }): React.ReactNode {
  const value = useCameras();
  useEffect(() => onValue(value), [onValue, value]);
  return null;
}

describe("CamerasProvider mutations", () => {
  let context: CamerasContextValue;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cameraService.getCameras).mockResolvedValue({
      authorization: CameraAuthorization.Authorized,
      cameras: [FIRST_CAMERA, SECOND_CAMERA],
      preferredCameraId: FIRST_CAMERA.id,
    });
    vi.mocked(deviceEventService.subscribeToDeviceEvents).mockResolvedValue(vi.fn());
  });

  async function renderProvider(): Promise<void> {
    render(
      <CamerasProvider>
        <ContextProbe onValue={(value) => { context = value; }} />
      </CamerasProvider>,
    );
    await waitFor(() => expect(context.cameras).toHaveLength(2));
  }

  it("rejects a second mutation while the first mutation is active", async () => {
    const firstMutation = deferred<{ preferredCameraId: string | null }>();
    vi.mocked(cameraService.setPreferredCamera).mockReturnValue(firstMutation.promise);
    await renderProvider();

    let activeMutation!: Promise<void>;
    await act(async () => {
      activeMutation = context.setPreferred(SECOND_CAMERA);
      void context.setPreferred(FIRST_CAMERA);
      await Promise.resolve();
    });

    expect(cameraService.setPreferredCamera).toHaveBeenCalledTimes(1);
    expect(cameraService.setPreferredCamera).toHaveBeenCalledWith(SECOND_CAMERA.id);

    firstMutation.resolve({ preferredCameraId: SECOND_CAMERA.id });
    await act(async () => activeMutation);
  });

  it("ignores a discovery response older than the latest refresh", async () => {
    const olderRefresh = deferred<Awaited<ReturnType<typeof cameraService.getCameras>>>();
    const latestRefresh = deferred<Awaited<ReturnType<typeof cameraService.getCameras>>>();
    vi.mocked(cameraService.getCameras)
      .mockResolvedValueOnce({
        authorization: CameraAuthorization.Authorized,
        cameras: [FIRST_CAMERA, SECOND_CAMERA],
        preferredCameraId: FIRST_CAMERA.id,
      })
      .mockReturnValueOnce(olderRefresh.promise)
      .mockReturnValueOnce(latestRefresh.promise);
    await renderProvider();

    act(() => context.refresh());
    await waitFor(() => expect(cameraService.getCameras).toHaveBeenCalledTimes(2));
    act(() => context.refresh());
    await waitFor(() => expect(cameraService.getCameras).toHaveBeenCalledTimes(3));

    latestRefresh.resolve({
      authorization: CameraAuthorization.Authorized,
      cameras: [SECOND_CAMERA],
      preferredCameraId: SECOND_CAMERA.id,
    });
    await waitFor(() => expect(context.cameras).toEqual([SECOND_CAMERA]));

    olderRefresh.resolve({
      authorization: CameraAuthorization.Authorized,
      cameras: [FIRST_CAMERA],
      preferredCameraId: FIRST_CAMERA.id,
    });
    await act(async () => olderRefresh.promise);

    expect(context.cameras).toEqual([SECOND_CAMERA]);
  });

  it("disposes a subscription that resolves after unmount", async () => {
    const subscription = deferred<() => void>();
    const unsubscribe = vi.fn();
    vi.mocked(deviceEventService.subscribeToDeviceEvents).mockReturnValue(subscription.promise);

    const rendered = render(
      <CamerasProvider>
        <ContextProbe onValue={(value) => { context = value; }} />
      </CamerasProvider>,
    );
    rendered.unmount();

    subscription.resolve(unsubscribe);
    await act(async () => subscription.promise);

    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
