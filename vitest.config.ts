import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // __STATIC_CONTENT_MANIFEST is a Cloudflare Workers build-time virtual
      // module; it doesn't exist under plain node, so route-level tests need
      // a stub in its place.
      __STATIC_CONTENT_MANIFEST: new URL(
        "./src/test/static-content-manifest-stub.ts",
        import.meta.url,
      ).pathname,
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
