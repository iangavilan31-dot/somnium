import { defineConfig } from "vite";

// Port 5131 is SOMNIUM's permanent registered port (PROJECTS.md registry).
// strictPort is intentional: fail loudly instead of drifting onto another project's port.
export default defineConfig({
  server: { port: 5131, strictPort: true },
  preview: { port: 5131, strictPort: true },
});
