import { defineConfig, devices } from '@playwright/test';

// Tests use port 4111 + 10 * RUN_SLOT (design D3, D6). BASE_URL points the same suite at the live
// site and switches the local server off.
const port = 4111 + 10 * Number(process.env.RUN_SLOT || 0);
const live = process.env.BASE_URL;

export default defineConfig({
  testDir: 'tests',
  reporter: 'list',
  use: {
    baseURL: live || `http://127.0.0.1:${port}`,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } }],
  webServer: live
    ? undefined
    : {
        command: `python3 -m http.server ${port} --bind 127.0.0.1 --directory site`,
        port,
        reuseExistingServer: false,
      },
});
