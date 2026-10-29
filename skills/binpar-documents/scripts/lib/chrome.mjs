// Zero-dependency headless Chrome driver over the DevTools Protocol.
// Needs Node >= 22 (global WebSocket) and any Chromium-based browser.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";

const CANDIDATES = {
  darwin: [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  ],
  linux: [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/microsoft-edge",
    "/snap/bin/chromium",
  ],
  win32: [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ],
};

// Playwright's bundled Chromium, if `npx playwright install chromium` was run.
function playwrightChromium() {
  const roots = [
    join(homedir(), "Library/Caches/ms-playwright"),
    join(homedir(), ".cache/ms-playwright"),
    join(homedir(), "AppData/Local/ms-playwright"),
  ];
  const tails = [
    "chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    "chrome-mac/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing",
    "chrome-mac/Chromium.app/Contents/MacOS/Chromium",
    "chrome-linux64/chrome",
    "chrome-linux/chrome",
    "chrome-win64/chrome.exe",
    "chrome-win/chrome.exe",
  ];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    const dirs = readdirSync(root).filter((d) => d.startsWith("chromium-")).sort().reverse();
    for (const d of dirs) for (const t of tails) if (existsSync(join(root, d, t))) return join(root, d, t);
  }
  return null;
}

export function findChrome() {
  const env = process.env.BINPAR_CHROME || process.env.CHROME_PATH;
  if (env && existsSync(env)) return env;
  for (const p of CANDIDATES[process.platform] ?? []) if (existsSync(p)) return p;
  const pw = playwrightChromium();
  if (pw) return pw;
  throw new Error(
    "No Chromium-based browser found. Install Google Chrome, run `npx playwright install chromium`, " +
      "or set BINPAR_CHROME=/path/to/chrome."
  );
}

export async function launchChrome({ timeoutMs = 20000 } = {}) {
  const userDataDir = mkdtempSync(join(tmpdir(), "binpar-chrome-"));
  const proc = spawn(
    findChrome(),
    [
      "--headless",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--hide-scrollbars",
      "--mute-audio",
      "--font-render-hinting=none",
      "--allow-file-access-from-files",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] }
  );

  const wsUrl = await new Promise((resolve, reject) => {
    let buf = "";
    const timer = setTimeout(() => reject(new Error("Chrome did not start in time")), timeoutMs);
    proc.stderr.on("data", (chunk) => {
      buf += chunk;
      const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    proc.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`Chrome exited early (code ${code}). ${buf.slice(-400)}`));
    });
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = () => rej(new Error("Could not connect to Chrome DevTools"));
  });

  let nextId = 1;
  const pending = new Map();
  const listeners = new Set();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(`${msg.error.message} ${msg.error.data ?? ""}`)) : resolve(msg.result);
    } else if (msg.method) {
      for (const fn of listeners) fn(msg);
    }
  };

  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });

  const once = (method, sessionId, ms = 30000) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        listeners.delete(fn);
        reject(new Error(`Timeout waiting for ${method}`));
      }, ms);
      const fn = (msg) => {
        if (msg.method === method && msg.sessionId === sessionId) {
          clearTimeout(timer);
          listeners.delete(fn);
          resolve(msg.params);
        }
      };
      listeners.add(fn);
    });

  async function newPage({ width = 1280, height = 800, deviceScaleFactor = 1 } = {}) {
    const { targetId } = await send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
    const s = (m, p) => send(m, p, sessionId);
    await s("Page.enable");
    await s("Runtime.enable");
    await s("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor, mobile: false });

    const errors = [];
    listeners.add((msg) => {
      if (msg.sessionId !== sessionId) return;
      if (msg.method === "Runtime.exceptionThrown") errors.push(msg.params.exceptionDetails?.exception?.description ?? "exception");
      if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error")
        errors.push(msg.params.args.map((a) => a.value ?? a.description).join(" "));
    });

    const evaluate = async (expression) => {
      const r = await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? "evaluate failed");
      return r.result.value;
    };

    return {
      errors,
      evaluate,
      async goto(url) {
        const loaded = once("Page.loadEventFired", sessionId);
        await s("Page.navigate", { url });
        await loaded;
        await evaluate("document.fonts.ready.then(() => true)");
      },
      async waitFor(expression, ms = 60000) {
        const start = Date.now();
        while (Date.now() - start < ms) {
          if (await evaluate(expression)) return;
          await new Promise((r) => setTimeout(r, 100));
        }
        throw new Error(`Timeout waiting for: ${expression}`);
      },
      async pdf(opts = {}) {
        const { data } = await s("Page.printToPDF", {
          printBackground: true,
          preferCSSPageSize: true,
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          marginRight: 0,
          generateDocumentOutline: true,
          generateTaggedPDF: true,
          ...opts,
        });
        return Buffer.from(data, "base64");
      },
      async screenshot({ clip, transparent = false, format = "png" } = {}) {
        if (transparent) await s("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
        const { data } = await s("Page.captureScreenshot", {
          format,
          captureBeyondViewport: true,
          ...(clip ? { clip: { scale: 1, ...clip } } : {}),
        });
        return Buffer.from(data, "base64");
      },
    };
  }

  async function close() {
    try {
      await send("Browser.close");
    } catch {}
    ws.close();
    await new Promise((r) => (proc.exitCode !== null ? r() : proc.once("exit", r)));
    rmSync(userDataDir, { recursive: true, force: true });
  }

  return { newPage, close };
}
