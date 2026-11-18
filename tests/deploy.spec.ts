import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import config from '../playwright.config';

// Contract tests of the site-deploy spec (openspec/changes/cv-site/specs/site-deploy/spec.md).

const workflow = join(__dirname, '..', '.github', 'workflows', 'pages.yml');
const read = () => {
  expect(existsSync(workflow), '.github/workflows/pages.yml exists').toBe(true);
  return readFileSync(workflow, 'utf8');
};

test('The workflow uploads site/ only', () => {
  const yml = read();
  const uploads = yml.match(/uses:\s*actions\/upload-pages-artifact/g) || [];
  expect(uploads.length, 'one upload-pages-artifact step').toBe(1);
  const at = yml.search(/uses:\s*actions\/upload-pages-artifact/);
  const rest = yml.slice(at);
  const next = rest.slice(1).search(/\n\s*-\s+(name|uses|run|id):/);
  const step = next < 0 ? rest : rest.slice(0, next + 1);
  expect(step, 'the upload step takes path: site').toMatch(/^\s*path:\s*["']?(\.\/)?site\/?["']?\s*$/m);
  expect(yml).toMatch(/uses:\s*actions\/deploy-pages/);
  expect(yml).toMatch(/^\s*pages:\s*write\s*$/m);
  expect(yml).toMatch(/^\s*id-token:\s*write\s*$/m);
  const writes = Array.from(yml.matchAll(/^\s*([\w-]+):\s*write\s*$/gm)).map((m) => m[1]);
  expect(writes.filter((w) => w !== 'pages' && w !== 'id-token'), 'write permissions other than pages and id-token').toEqual([]);
  expect(yml, 'no write-all').not.toMatch(/write-all/);
});

test('Triggers and concurrency', () => {
  const yml = read();
  expect(yml).toMatch(/^\s*push:\s*$/m);
  expect(yml, 'push to the branch main').toMatch(/branches:\s*(\[\s*["']?main["']?\s*\]|\n\s*-\s*["']?main["']?)/);
  expect(yml).toMatch(/^\s*workflow_dispatch:/m);
  expect(yml).toMatch(/^\s*concurrency:/m);
  expect(yml, 'a concurrency group for Pages').toMatch(/group:\s*["']?pages["']?/i);
});

test('Repository files are not served', async ({ request }) => {
  expect((await request.get('/CLAUDE.html')).status()).toBe(404);
  expect((await request.get('/openspec/ROADMAP.html')).status()).toBe(404);
});

test('Local run and live run are one config: BASE_URL or the local server on site/', ({ baseURL }) => {
  const live = process.env.BASE_URL;
  const port = 4111 + 10 * Number(process.env.RUN_SLOT || 0);
  expect(baseURL).toBe(live || `http://127.0.0.1:${port}`);
  const servers = ([] as any[]).concat((config as any).webServer || []);
  if (live) {
    expect(servers, 'no server is raised against the live site').toEqual([]);
  } else {
    expect(servers.length, 'one local server').toBe(1);
    expect(servers[0].command).toContain(`python3 -m http.server ${port}`);
    expect(servers[0].command).toContain('--bind 127.0.0.1');
    expect(servers[0].command).toContain('--directory site');
    expect(servers[0].reuseExistingServer).toBe(false);
  }
});
