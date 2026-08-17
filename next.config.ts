import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "export",
  turbopack: {
    root: PROJECT_ROOT,
  },
};

export default nextConfig;
