// Leonida Trophy Path — hand-in program for make.fun's gta6-trophy-guide-01 (Node 22, standard library only).
// The guide is app/: static files (index.html, ES modules under js/, css/style.css) that run offline in a browser,
// with every trophy's official text, written guide, sources, kind, missable flag and roadmap stage in
// app/data/trophies.json. This program first checks that data (55 official trophies, each with a non-blank guide that
// cites known sources, grades adding up to 1/2/6/46, a roadmap stage that exists, no network references in app code)
// and exits 1 on any problem; then it copies app/ and screenshots/ to the output directory and writes dossier.json
// with the vendored make.fun library, exactly as the kit's starter did.
//
// Run locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the app: node serve.ts --port 8765   (then open the printed URL)

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

type Trophy = {
  id: number; name: string; description: string; grade: string; guide: string;
  kind: string; roadmapStage: number; sources: string[]; hidden: boolean; missable?: boolean; missableWhy?: string;
};
type TrophyFile = { trophies: Trophy[]; sources: Record<string, { name: string; url: string }>; roadmap: { stage: number }[] };

const EXPECTED_GRADES: Record<string, number> = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
const KINDS = new Set(['story', 'collectible', 'activity', 'strand', 'crime', 'money', 'feat', 'completion']);

// Every problem found in app/data/trophies.json, as readable lines; empty when the data is sound.
function checkTrophyData(file: TrophyFile): string[] {
  const problems: string[] = [];
  const list = file.trophies ?? [];
  if (list.length !== 55) problems.push(`expected 55 trophies, found ${list.length}`);
  const names = new Set<string>();
  const stages = new Set((file.roadmap ?? []).map((s) => s.stage));
  const grades: Record<string, number> = {};
  for (const t of list) {
    const label = `#${t.id} ${JSON.stringify(t.name)}`;
    if (typeof t.name !== 'string' || !t.name.trim()) problems.push(`${label}: no official name`);
    if (names.has(t.name)) problems.push(`${label}: duplicate name`);
    names.add(t.name);
    if (typeof t.guide !== 'string' || t.guide.trim().length < 80) problems.push(`${label}: guide missing or too thin`);
    if (t.guide && t.description && t.guide.trim() === t.description.trim()) problems.push(`${label}: guide only repeats the description`);
    if (!Array.isArray(t.sources) || t.sources.length === 0) problems.push(`${label}: cites no source`);
    for (const key of t.sources ?? []) if (!file.sources?.[key]) problems.push(`${label}: unknown source key ${key}`);
    if (!KINDS.has(t.kind)) problems.push(`${label}: unknown kind ${t.kind}`);
    if (!stages.has(t.roadmapStage)) problems.push(`${label}: roadmap stage ${t.roadmapStage} does not exist`);
    if (t.missable && !t.missableWhy) problems.push(`${label}: flagged missable without a reason`);
    grades[t.grade] = (grades[t.grade] ?? 0) + 1;
  }
  for (const [grade, n] of Object.entries(EXPECTED_GRADES)) {
    if (grades[grade] !== n) problems.push(`expected ${n} ${grade}, found ${grades[grade] ?? 0}`);
  }
  const hidden = list.filter((t) => t.hidden).length;
  if (hidden !== 28) problems.push(`expected 28 trophies hidden on PSN, found ${hidden}`);
  return problems;
}

// The app must load nothing over the network: flag any http(s) URL in a script or stylesheet under app/.
function findNetworkReferences(dir: string): string[] {
  const hits: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) hits.push(...findNetworkReferences(path));
    else if (/\.(js|mjs|css)$/.test(entry) && /https?:\/\//.test(readFileSync(path, 'utf8'))) hits.push(path);
  }
  return hits;
}

const data = JSON.parse(readFileSync(join(here, 'app/data/trophies.json'), 'utf8')) as TrophyFile;
const problems = [
  ...checkTrophyData(data),
  ...findNetworkReferences(join(here, 'app')).map((p) => `network URL in app code: ${p}`),
];
if (problems.length) {
  console.error(`app/data/trophies.json failed ${problems.length} check(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`trophies.json OK: 55 trophies with cited guides, ${data.trophies.filter((t) => t.missable).length} missable, ${data.roadmap.length} roadmap stages`);

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 48 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
