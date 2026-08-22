// src/restart-helper.ts
import { spawn } from "node:child_process";
import { createServer } from "node:net";

// src/restart-payload.ts
var RESTART_HELPER_ENV = "DSH_WEB_LIFECYCLE_RESTART";
function decodeRestartPayload(encoded) {
  const parsed = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  if (typeof parsed.execPath !== "string" || !Array.isArray(parsed.argv) || typeof parsed.cwd !== "string" || typeof parsed.port !== "number" || typeof parsed.host !== "string" || typeof parsed.parentPid !== "number") {
    throw new Error("dsh-web-lifecycle: invalid restart payload");
  }
  return parsed;
}

// src/restart-argv.ts
function rewriteArgvForRestart(argv, livePort) {
  const next = [];
  let sawPort = false;
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--port") {
      const value = argv[i + 1];
      if (value !== void 0 && !value.startsWith("-")) {
        next.push("--port", String(livePort));
        i += 1;
        sawPort = true;
        continue;
      }
      next.push("--port", String(livePort));
      sawPort = true;
      continue;
    }
    if (token.startsWith("--port=")) {
      next.push("--port", String(livePort));
      sawPort = true;
      continue;
    }
    next.push(token);
  }
  if (!sawPort) next.push("--port", String(livePort));
  return next;
}

// src/restart-helper-core.ts
var PARENT_WAIT_MS = 15e3;
var PORT_WAIT_MS = 1e4;
var POLL_MS = 100;
async function runRestartHelper(payload, io) {
  const parentDeadline = io.now() + PARENT_WAIT_MS;
  while (io.isPidAlive(payload.parentPid)) {
    if (io.now() >= parentDeadline) {
      return { ok: false, error: `timed out waiting for DSH pid ${payload.parentPid} to exit` };
    }
    await io.sleep(POLL_MS);
  }
  const portDeadline = io.now() + PORT_WAIT_MS;
  while (!await io.isPortFree(payload.host, payload.port)) {
    if (io.now() >= portDeadline) {
      return {
        ok: false,
        error: `EADDRINUSE: ${payload.host}:${payload.port} is still in use after DSH exited; not killing the occupant`
      };
    }
    await io.sleep(POLL_MS);
  }
  const argv = rewriteArgvForRestart(payload.argv, payload.port);
  const [command, ...args] = argv[0] === payload.execPath ? argv : [payload.execPath, ...argv];
  const childPid = io.spawnDetached(command, args, {
    cwd: payload.cwd,
    env: payload.env
  });
  return { ok: true, childPid };
}

// src/restart-helper.ts
function isPidAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
function isPortFree(host, port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
  });
}
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
async function main() {
  const encoded = process.env[RESTART_HELPER_ENV];
  if (encoded === void 0 || encoded === "") {
    throw new Error("dsh-web-lifecycle helper: missing restart payload");
  }
  const payload = decodeRestartPayload(encoded);
  const env = { ...payload.env };
  delete env[RESTART_HELPER_ENV];
  const result = await runRestartHelper(payload, {
    isPidAlive,
    isPortFree,
    spawnDetached: (command, args, options) => {
      const child = spawn(command, args, {
        cwd: options.cwd,
        env,
        detached: true,
        stdio: ["ignore", "inherit", "inherit"]
      });
      child.unref();
      if (child.pid === void 0) throw new Error("dsh-web-lifecycle helper: failed to spawn DSH");
      return child.pid;
    },
    sleep,
    now: () => Date.now()
  });
  if (!result.ok) {
    console.error(`[dsh-web-lifecycle] restart failed: ${result.error}`);
    process.exitCode = 1;
  }
}
await main();
