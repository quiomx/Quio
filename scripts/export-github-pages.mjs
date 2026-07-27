import { spawn } from "node:child_process";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "out-gh-pages");
const port = 4178;
const basePath = "/Quio/";

if (path.basename(output) !== "out-gh-pages" || !output.startsWith(root)) {
  throw new Error("Invalid GitHub Pages output directory.");
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "dist", "client"), output, { recursive: true });
await rm(path.join(output, "og-original.png"), { force: true });

const server = spawn(
  process.execPath,
  [path.join(root, "node_modules", "vinext", "dist", "cli.js"), "start", "--port", String(port)],
  {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let logs = "";
server.stdout.on("data", (chunk) => {
  logs += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  logs += chunk.toString();
});

try {
  let response;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  if (!response?.ok) {
    throw new Error(`Unable to render the site for GitHub Pages.\n${logs}`);
  }

  let html = await response.text();
  html = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<link\b[^>]*rel="modulepreload"[^>]*>/gi, "")
    .replaceAll('="/', `="${basePath}`)
    .replaceAll("url(/", `url(${basePath}`);

  if (!html.includes("Quiero mi revisión gratis")) {
    throw new Error("The rendered page is missing its primary content.");
  }

  await writeFile(path.join(output, "index.html"), html, "utf8");
  await writeFile(path.join(output, "404.html"), html, "utf8");
  await writeFile(path.join(output, ".nojekyll"), "", "utf8");

  const written = await readFile(path.join(output, "index.html"), "utf8");
  if (!written.includes(`${basePath}assets/`) || written.includes('="/assets/')) {
    throw new Error("GitHub Pages asset paths were not rewritten correctly.");
  }
} finally {
  server.kill();
}

console.log(`GitHub Pages export created at ${output}`);
