// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "unenv";
var config = defineConfig({
  tsr: {
    appDirectory: "src"
  },
  server: {
    preset: "cloudflare-pages",
    unenv: cloudflare
  },
  vite: {
    plugins: [
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ["./tsconfig.json"]
      }),
      tailwindcss()
    ],
    build: {
      rollupOptions: {}
    }
  }
});
var app_config_default = config;
export {
  app_config_default as default
};
