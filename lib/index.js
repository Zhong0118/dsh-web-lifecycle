// src/lifecycle.ts
function requestShutdown(hooks) {
  hooks.schedule(() => {
    hooks.appExit(0);
  });
  return { accepted: true };
}
function scheduleExitAfterResponse(res, hooks) {
  const exit = () => {
    requestShutdown(hooks);
  };
  if (res.writableFinished === true) {
    exit();
    return;
  }
  res.once("finish", exit);
}

// src/trust.ts
function isLoopbackHostname(hostname) {
  if (hostname === "localhost" || hostname === "[::1]") return true;
  const parts = hostname.split(".");
  return parts.length === 4 && parts[0] === "127" && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}
function parseAuthority(authority) {
  try {
    return new URL(`http://${authority}`);
  } catch {
    return void 0;
  }
}
function isTrustedLifecycleRequest(headers) {
  if (headers.host === void 0) return false;
  const hostUrl = parseAuthority(headers.host);
  if (hostUrl === void 0) return false;
  if (!isLoopbackHostname(hostUrl.hostname)) return false;
  if (headers.secFetchSite === "cross-site") return false;
  if (headers.origin === void 0) return true;
  try {
    return new URL(headers.origin).host === hostUrl.host;
  } catch {
    return false;
  }
}

// src/http.ts
var STATUS_PATH = "/dsh-web-lifecycle/status";
var RESTART_PATH = "/dsh-web-lifecycle/restart";
var SHUTDOWN_PATH = "/dsh-web-lifecycle/shutdown";
function readHeader(req, name2) {
  const value = req.headers[name2];
  return typeof value === "string" ? value : void 0;
}
function refuseUnlessTrusted(req, res) {
  const trusted = isTrustedLifecycleRequest({
    host: readHeader(req, "host"),
    origin: readHeader(req, "origin"),
    secFetchSite: readHeader(req, "sec-fetch-site")
  });
  if (trusted) return true;
  res.writeHead(403, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "forbidden" }));
  return false;
}
function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(payload);
}
function methodNotAllowed(res, allow) {
  res.writeHead(405, {
    allow,
    "content-type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify({ error: "method not allowed" }));
}

// src/spawn-helper.ts
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// src/restart-payload.ts
var RESTART_HELPER_ENV = "DSH_WEB_LIFECYCLE_RESTART";
function encodeRestartPayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
}

// src/spawn-helper.ts
function helperScriptPath() {
  return fileURLToPath(new URL("./restart-helper.js", import.meta.url));
}
function spawnRestartHelper(payload) {
  const child = spawn(process.execPath, [helperScriptPath()], {
    detached: true,
    stdio: ["ignore", "inherit", "inherit"],
    env: {
      ...process.env,
      [RESTART_HELPER_ENV]: encodeRestartPayload(payload)
    }
  });
  child.unref();
  if (child.pid === void 0) throw new Error("dsh-web-lifecycle: failed to spawn restart helper");
  return child.pid;
}

// src/port-mode.ts
function parsePortFlag(args) {
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (token === "--port") {
      const next = args[i + 1];
      if (next === void 0 || next.startsWith("-")) return void 0;
      if (!/^\d+$/.test(next)) return void 0;
      return Number(next);
    }
    if (token.startsWith("--port=")) {
      const value = token.slice("--port=".length);
      if (!/^\d+$/.test(value)) return void 0;
      return Number(value);
    }
  }
  return void 0;
}
function resolvePortMode(args) {
  const port = parsePortFlag(args);
  if (port === void 0) return "default";
  if (port === 0) return "auto";
  return "fixed";
}

// src/status.ts
function collectServiceStatus(facts) {
  return {
    status: "running",
    pid: facts.pid,
    port: facts.port,
    host: facts.host,
    address: `${facts.host}:${facts.port}`,
    uptime: facts.uptimeSeconds,
    version: facts.version,
    node: facts.nodeVersion,
    portMode: resolvePortMode(facts.cmdlineArgs)
  };
}

// src/version.ts
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var DSH_CLI = "@deepseek-ai/dsh";
function versionFromManifest(manifest) {
  if (typeof manifest.version !== "string" || manifest.version.length === 0) return void 0;
  if (manifest.name !== DSH_CLI) return void 0;
  return manifest.version;
}
function readManifest(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return void 0;
  }
}
function realpathOrSelf(path) {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
}
function resolveDshManifestFrom(from) {
  try {
    return createRequire(from).resolve(`${DSH_CLI}/package.json`);
  } catch {
    return void 0;
  }
}
function walkForDshManifest(startFile) {
  let dir = dirname(startFile);
  for (let i = 0; i < 16; i += 1) {
    const pkg = join(dir, "package.json");
    if (existsSync(pkg)) {
      const manifest = readManifest(pkg);
      if (manifest?.name === DSH_CLI) return pkg;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return void 0;
}
function findDshManifest(files) {
  const seen = /* @__PURE__ */ new Set();
  for (const file of files) {
    if (file.length === 0) continue;
    const resolved = realpathOrSelf(file);
    for (const candidate of [file, resolved]) {
      if (seen.has(candidate)) continue;
      seen.add(candidate);
      const fromRequire = resolveDshManifestFrom(candidate);
      if (fromRequire !== void 0) return fromRequire;
      const walked = walkForDshManifest(candidate);
      if (walked !== void 0) return walked;
    }
  }
  return void 0;
}
function readDshVersion(files = [process.argv[1] ?? "", fileURLToPath2(import.meta.url)]) {
  const manifestPath = findDshManifest(files);
  if (manifestPath === void 0) return "unknown";
  return versionFromManifest(readManifest(manifestPath) ?? {}) ?? "unknown";
}

// src/index.ts
var name = "web-lifecycle";
var inject = ["webServer"];
function cmdlineOf(ctx) {
  const args = ctx.get("cmdlineArgs");
  return args?.get() ?? [];
}
function statusFrom(ctx) {
  return collectServiceStatus({
    pid: process.pid,
    uptimeSeconds: process.uptime(),
    port: ctx.webServer.port,
    host: ctx.webServer.host,
    nodeVersion: process.version,
    version: readDshVersion(),
    cmdlineArgs: cmdlineOf(ctx)
  });
}
function handleStatus(ctx, req, res) {
  if (!refuseUnlessTrusted(req, res)) return;
  if (req.method !== "GET" && req.method !== "HEAD") {
    methodNotAllowed(res, "GET, HEAD");
    return;
  }
  sendJson(res, 200, statusFrom(ctx));
}
function handleShutdown(ctx, req, res) {
  if (!refuseUnlessTrusted(req, res)) return;
  if (req.method !== "POST") {
    methodNotAllowed(res, "POST");
    return;
  }
  const appExit = ctx.get("appExit");
  if (appExit === void 0) {
    sendJson(res, 500, { error: "appExit is unavailable" });
    return;
  }
  sendJson(res, 202, { accepted: true });
  scheduleExitAfterResponse(res, {
    appExit,
    schedule: (fn) => {
      setImmediate(fn);
    }
  });
}
function handleRestart(ctx, req, res) {
  if (!refuseUnlessTrusted(req, res)) return;
  if (req.method !== "POST") {
    methodNotAllowed(res, "POST");
    return;
  }
  const appExit = ctx.get("appExit");
  if (appExit === void 0) {
    sendJson(res, 500, { error: "appExit is unavailable" });
    return;
  }
  try {
    spawnRestartHelper({
      execPath: process.execPath,
      argv: process.argv.slice(),
      cwd: process.cwd(),
      env: { ...process.env },
      port: ctx.webServer.port,
      host: ctx.webServer.host,
      parentPid: process.pid
    });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
    return;
  }
  sendJson(res, 202, { accepted: true });
  scheduleExitAfterResponse(res, {
    appExit,
    schedule: (fn) => {
      setImmediate(fn);
    }
  });
}
function apply(ctx) {
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: STATUS_PATH,
      handler: (req, res) => handleStatus(ctx, req, res)
    }),
    "web-lifecycle: GET status"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: RESTART_PATH,
      handler: (req, res) => handleRestart(ctx, req, res)
    }),
    "web-lifecycle: POST restart"
  );
  ctx.effect(
    () => ctx.webServer.register({
      kind: "exact",
      path: SHUTDOWN_PATH,
      handler: (req, res) => handleShutdown(ctx, req, res)
    }),
    "web-lifecycle: POST shutdown"
  );
}
export {
  apply,
  inject,
  name
};
