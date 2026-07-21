import { loadEnvConfig } from "@next/env";
import path from "node:path";
import type { NextConfig } from "next";

// Next runs from apps/web in this workspace. Load the ignored root env file for
// local development only; production builds must receive secrets at runtime
// from the deployment platform so they cannot be copied into build artifacts.
if (process.env.NODE_ENV !== "production") {
  loadEnvConfig(path.resolve(process.cwd(), "../.."), true, console, true);
}

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value:
      `default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}; connect-src 'self'`,
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  transpilePackages: ["@ariad/contracts", "@ariad/knowledge-core"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
