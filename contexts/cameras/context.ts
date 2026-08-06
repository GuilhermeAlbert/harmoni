import { createContext } from "react";

import type { CamerasContextValue } from "./types";

export const CamerasContext = createContext<CamerasContextValue | null>(null);
