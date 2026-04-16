import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    host: true,
    allowedHosts: ["eee8-92-185-22-102.ngrok-free.app"],
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
});
