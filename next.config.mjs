import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  experimental: {
    // Workaround para un bug de Next 15.5.x donde el Segment Explorer
    // corrompe el React Client Manifest en dev:
    // "next-devtools/.../segment-explorer-node.js#SegmentViewNode"
    // "__webpack_modules__[moduleId] is not a function"
    devtoolSegmentExplorer: false,
  },
  // Pin the workspace root so Next doesn't infer it from a stray
  // package-lock.json in a parent directory.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
