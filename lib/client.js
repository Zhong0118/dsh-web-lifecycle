window.__ModuleLoader__.load({
	id: "dsh-web-lifecycle",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.tsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/locales.ts
var en = {
  nav: "Restart & Shut Down",
  title: "DeepSeek Harness",
  intro: "Restart or shut down the current Web process.",
  running: "Running",
  runningHint: "DSH Web is running normally.",
  restarting: "Restarting…",
  restartingHint: "Waiting for DSH Web to come back online.",
  shutdownTitle: "DSH is shutting down",
  shutdownHint: "The Web service has been stopped. You can close this page.",
  shutdownHint2: "To start it again, run DSH from your terminal.",
  address: "Address",
  pid: "PID",
  uptime: "Uptime",
  version: "Version",
  portDefault: "Default",
  portCustom: "Custom",
  portAuto: "Auto",
  restart: "Restart",
  shutdown: "Shut Down",
  cancel: "Cancel",
  restartConfirmTitle: "Restart DeepSeek Harness?",
  restartConfirmBody: "Current running tasks will be interrupted. The Web UI will reconnect automatically.",
  shutdownConfirmTitle: "Shut down DeepSeek Harness?",
  shutdownConfirmBody: "This will stop the current DSH Web process. You will need to start it again from the terminal.",
  error: "The request failed. DSH is still running.",
  restartTimeout: "DSH did not come back online. Check the terminal that launched it."
};
var zh = {
  nav: "重启关闭",
  title: "DeepSeek Harness",
  intro: "重启或关闭当前 Web 进程。",
  running: "运行中",
  runningHint: "DSH Web 正在正常运行。",
  restarting: "正在重启…",
  restartingHint: "正在等待 DSH Web 重新上线。",
  shutdownTitle: "DSH 正在关闭",
  shutdownHint: "Web 服务已停止，可以关闭此页面。",
  shutdownHint2: "若要再次启动，请在终端中运行 DSH。",
  address: "地址",
  pid: "PID",
  uptime: "运行时间",
  version: "版本",
  portDefault: "默认",
  portCustom: "自定义",
  portAuto: "自动",
  restart: "重启",
  shutdown: "关闭",
  cancel: "取消",
  restartConfirmTitle: "重启 DeepSeek Harness？",
  restartConfirmBody: "当前正在运行的任务会被中断。Web UI 将自动重新连接。",
  shutdownConfirmTitle: "关闭 DeepSeek Harness？",
  shutdownConfirmBody: "这将停止当前的 DSH Web 进程。之后需要从终端再次启动。",
  error: "请求失败，DSH 仍在运行。",
  restartTimeout: "DSH 没有重新上线。请检查启动它的终端。"
};

// src/client/nav-chrome.ts
var ATTR = "data-dsh-web-lifecycle-nav";
var STYLE_ID = "dsh-web-lifecycle-nav-chrome";
var LABELS = /* @__PURE__ */ new Set(["重启关闭", "Restart & Shut Down"]);
var POWER_SVG = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" class="dsh-web-lifecycle-power">
  <path d="M8 1.5v6.2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M4.15 3.7a5.2 5.2 0 1 0 7.7 0" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;
function ensureStyle() {
  if (document.getElementById(STYLE_ID) !== null) return;
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = `
[${ATTR}] {
  color: var(--dsw-alias-state-error-primary) !important;
}
[${ATTR}] span,
[${ATTR}] svg {
  color: var(--dsw-alias-state-error-primary) !important;
}
`;
  document.head.appendChild(tag);
}
function decorate() {
  const buttons = document.querySelectorAll('[role="dialog"] nav button');
  for (const button of buttons) {
    const label = button.querySelector("span")?.textContent?.trim() ?? "";
    const match = LABELS.has(label);
    if (!match) {
      if (button.hasAttribute(ATTR)) {
        button.removeAttribute(ATTR);
      }
      continue;
    }
    if (button.getAttribute(ATTR) === "1") continue;
    button.setAttribute(ATTR, "1");
    const svg = button.querySelector("svg");
    if (svg !== null) svg.outerHTML = POWER_SVG;
  }
}
function startNavChrome() {
  ensureStyle();
  decorate();
  const observer = new MutationObserver(() => {
    decorate();
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  return () => observer.disconnect();
}

// src/client/ServicePage.tsx
var import_react = require("react");

// src/client/format.ts
function formatUptime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}
function bootAtFromSample(uptimeSeconds, sampledAtMs) {
  return sampledAtMs - uptimeSeconds * 1e3;
}
function liveUptimeSeconds(bootAtMs, nowMs) {
  return Math.max(0, (nowMs - bootAtMs) / 1e3);
}

// src/client/styles.module.css
var css = ".section_1r612h {\n  max-width: 560px;\n  color: var(--dsw-alias-label-primary);\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n.title_1nuogp {\n  margin: 0;\n  font-size: 18px;\n  font-weight: 600;\n  line-height: 24px;\n}\n\n.intro_5xqwic {\n  margin: 0;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.card_404q80 {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  border-radius: 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding: 18px 18px 16px;\n}\n\n.statusRow_mhivbk {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.dot_1dbyv4 {\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background: var(--dsw-alias-state-success-primary);\n  flex: none;\n}\n\n.dotRestarting_4hpnv4 {\n  background: var(--dsw-alias-state-warn-primary);\n  animation: dshWebLifecyclePulse 1.2s ease-in-out infinite;\n}\n\n.dotStopped_1ne1xb {\n  background: var(--dsw-alias-label-tertiary);\n}\n\n.statusLabel_1cblp8 {\n  font-size: 15px;\n  font-weight: 600;\n  line-height: 22px;\n}\n\n.hint_p8a0jr {\n  margin: 0;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.facts_1ycbpz {\n  margin: 0;\n  display: grid;\n  grid-template-columns: 88px minmax(0, 1fr);\n  row-gap: 8px;\n  column-gap: 12px;\n}\n\n.facts_1ycbpz dt {\n  margin: 0;\n  color: var(--dsw-alias-label-tertiary);\n  font-size: 12px;\n  line-height: 20px;\n}\n\n.facts_1ycbpz dd {\n  margin: 0;\n  font-size: 13px;\n  line-height: 20px;\n  font-variant-numeric: tabular-nums;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n}\n\n.badge_1jacn3 {\n  white-space: nowrap;\n  background: var(--dsw-alias-bg-module-platform);\n  color: var(--dsw-alias-label-secondary);\n  border-radius: 999px;\n  padding: 1px 8px;\n  font-size: 11px;\n  font-weight: 500;\n  line-height: 17px;\n}\n\n.actions_1vlnx2 {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n}\n\n.primary_1oubkm,\n.ghost_1sm9tv,\n.danger_l7rnxl {\n  appearance: none;\n  font: inherit;\n  cursor: pointer;\n  border-radius: 8px;\n  min-height: 36px;\n  padding: 8px 16px;\n  font-size: 13px;\n  font-weight: 500;\n  line-height: 20px;\n}\n\n.primary_1oubkm {\n  border: 1px solid transparent;\n  background: var(--dsw-alias-button-primary-fill);\n  color: var(--dsw-alias-label-primary-foreground);\n}\n\n.primary_1oubkm:hover:not(:disabled) {\n  filter: brightness(1.08);\n}\n\n.ghost_1sm9tv {\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: transparent;\n  color: var(--dsw-alias-label-secondary);\n}\n\n.ghost_1sm9tv:hover:not(:disabled) {\n  color: var(--dsw-alias-label-primary);\n  background: var(--dsw-alias-interactive-bg-hover);\n}\n\n.danger_l7rnxl {\n  border: 1px solid transparent;\n  background: var(--dsw-alias-state-error-primary);\n  color: var(--dsw-static-neutral-00);\n}\n\n.danger_l7rnxl:hover:not(:disabled) {\n  filter: brightness(0.92);\n}\n\n.primary_1oubkm:disabled,\n.ghost_1sm9tv:disabled,\n.danger_l7rnxl:disabled {\n  opacity: 0.5;\n  cursor: default;\n}\n\n.primary_1oubkm:focus-visible,\n.ghost_1sm9tv:focus-visible,\n.danger_l7rnxl:focus-visible {\n  outline: 2px solid var(--dsw-alias-state-business-primary);\n  outline-offset: 2px;\n}\n\n.error_19o1tx {\n  margin: 0;\n  color: var(--dsw-alias-state-error-primary);\n  font-size: 12px;\n  line-height: 18px;\n}\n\n.overlay_1hruhu {\n  position: fixed;\n  inset: 0;\n  z-index: 80;\n  background: color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n}\n\n.dialog_1mgv7q {\n  width: min(420px, 100%);\n  border: 1px solid var(--dsw-alias-border-l2);\n  background: var(--dsw-alias-bg-layer-3);\n  box-shadow: var(--dsw-shadow-lv3);\n  border-radius: 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 20px;\n}\n\n.dialogTitle_1gbgwn {\n  margin: 0;\n  font-size: 16px;\n  font-weight: 600;\n  line-height: 24px;\n}\n\n.dialogBody_1pfxoi {\n  margin: 0;\n  color: var(--dsw-alias-label-secondary);\n  font-size: 13px;\n  line-height: 20px;\n}\n\n.dialogActions_4cb6xd {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n  margin-top: 4px;\n}\n\n.stopped_1uz3ep {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 8px 0;\n}\n\n@keyframes dshWebLifecyclePulse {\n  0%,\n  100% {\n    opacity: 1;\n  }\n  50% {\n    opacity: 0.35;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dotRestarting_4hpnv4 {\n    animation: none;\n  }\n}\n";
var tagId = "dsh-web-lifecycle/styles.module.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = "dsh-web-lifecycle";
  tag.dataset.pluginCss = tagId;
  tag.textContent = css;
  document.head.appendChild(tag);
}
var styles_default = { "section": "section_1r612h", "title": "title_1nuogp", "intro": "intro_5xqwic", "card": "card_404q80", "statusRow": "statusRow_mhivbk", "dot": "dot_1dbyv4", "dotRestarting": "dotRestarting_4hpnv4", "dotStopped": "dotStopped_1ne1xb", "statusLabel": "statusLabel_1cblp8", "hint": "hint_p8a0jr", "facts": "facts_1ycbpz", "badge": "badge_1jacn3", "actions": "actions_1vlnx2", "primary": "primary_1oubkm", "ghost": "ghost_1sm9tv", "danger": "danger_l7rnxl", "error": "error_19o1tx", "overlay": "overlay_1hruhu", "dialog": "dialog_1mgv7q", "dialogTitle": "dialogTitle_1gbgwn", "dialogBody": "dialogBody_1pfxoi", "dialogActions": "dialogActions_4cb6xd", "stopped": "stopped_1uz3ep" };

// src/client/ServicePage.tsx
var import_jsx_runtime = require("react/jsx-runtime");
var STATUS_PATH = "/dsh-web-lifecycle/status";
var RESTART_PATH = "/dsh-web-lifecycle/restart";
var SHUTDOWN_PATH = "/dsh-web-lifecycle/shutdown";
var POLL_MS = 800;
var RESTART_TIMEOUT_MS = 6e4;
async function fetchStatus(signal) {
  const response = await fetch(STATUS_PATH, {
    method: "GET",
    credentials: "same-origin",
    signal
  });
  if (!response.ok) throw new Error(`status ${response.status}`);
  return await response.json();
}
function postAction(path) {
  void fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: "{}",
    keepalive: true
  }).catch(() => {
  });
}
function portModeLabel(mode, t) {
  if (mode === "fixed") return t("portCustom");
  if (mode === "auto") return t("portAuto");
  return t("portDefault");
}
function ServicePage(props) {
  const { t } = props;
  const [status, setStatus] = (0, import_react.useState)();
  const [sampledAt, setSampledAt] = (0, import_react.useState)(0);
  const [now, setNow] = (0, import_react.useState)(() => Date.now());
  const [phase, setPhase] = (0, import_react.useState)("running");
  const [confirm, setConfirm] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)();
  const [busy, setBusy] = (0, import_react.useState)(false);
  const refresh = (0, import_react.useCallback)(async (signal) => {
    const next = await fetchStatus(signal);
    const at = Date.now();
    setStatus(next);
    setSampledAt(at);
    setNow(at);
  }, []);
  (0, import_react.useEffect)(() => {
    const controller = new AbortController();
    refresh(controller.signal).catch(() => {
      setError(t("error"));
    });
    return () => controller.abort();
  }, [refresh, t]);
  (0, import_react.useEffect)(() => {
    if (phase !== "running" || status === void 0) return;
    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1e3);
    return () => window.clearInterval(id);
  }, [phase, status]);
  (0, import_react.useEffect)(() => {
    if (phase !== "restarting") return;
    const started = Date.now();
    let cancelled = false;
    const tick = async () => {
      try {
        const response = await fetch(STATUS_PATH, {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store"
        });
        if (cancelled) return;
        if (response.ok) {
          window.location.reload();
          return;
        }
      } catch {
      }
      if (Date.now() - started > RESTART_TIMEOUT_MS) {
        setError(t("restartTimeout"));
        setPhase("running");
        setBusy(false);
        return;
      }
      window.setTimeout(() => {
        void tick();
      }, POLL_MS);
    };
    void tick();
    return () => {
      cancelled = true;
    };
  }, [phase, t]);
  const runRestart = () => {
    setConfirm(null);
    setBusy(true);
    setError(void 0);
    setPhase("restarting");
    postAction(RESTART_PATH);
  };
  const runShutdown = () => {
    setConfirm(null);
    setBusy(true);
    setError(void 0);
    setPhase("stopped");
    postAction(SHUTDOWN_PATH);
  };
  if (phase === "stopped") {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: styles_default.section, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: styles_default.title, children: t("title") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.stopped, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.statusRow, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `${styles_default.dot} ${styles_default.dotStopped}` }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_default.statusLabel, children: t("shutdownTitle") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: styles_default.hint, children: t("shutdownHint") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: styles_default.hint, children: t("shutdownHint2") })
      ] })
    ] });
  }
  const restarting = phase === "restarting";
  const disabled = busy || restarting;
  const uptime = status === void 0 ? void 0 : formatUptime(liveUptimeSeconds(bootAtFromSample(status.uptime, sampledAt), now));
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: styles_default.section, children: [
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { className: styles_default.title, children: t("title") }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: styles_default.intro, children: t("intro") })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.card, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.statusRow, children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `${styles_default.dot} ${restarting ? styles_default.dotRestarting : ""}` }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_default.statusLabel, children: restarting ? t("restarting") : t("running") })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: styles_default.hint, children: restarting ? t("restartingHint") : t("runningHint") })
      ] }),
      status !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", { className: styles_default.facts, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: t("address") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
          status.address,
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: styles_default.badge, children: portModeLabel(status.portMode, t) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: t("pid") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: status.pid }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: t("uptime") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: uptime }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: t("version") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: status.version })
      ] }) : null,
      error !== void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: styles_default.error, role: "status", children: error }) : null,
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.actions, children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: styles_default.primary, disabled, onClick: () => setConfirm("restart"), children: t("restart") }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: styles_default.danger, disabled, onClick: () => setConfirm("shutdown"), children: t("shutdown") })
      ] })
    ] }),
    confirm !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: styles_default.overlay, role: "presentation", onClick: () => setConfirm(null), children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
      "div",
      {
        className: styles_default.dialog,
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "dsh-web-lifecycle-confirm-title",
        onClick: (event) => event.stopPropagation(),
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { id: "dsh-web-lifecycle-confirm-title", className: styles_default.dialogTitle, children: confirm === "restart" ? t("restartConfirmTitle") : t("shutdownConfirmTitle") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: styles_default.dialogBody, children: confirm === "restart" ? t("restartConfirmBody") : t("shutdownConfirmBody") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: styles_default.dialogActions, children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: styles_default.ghost, onClick: () => setConfirm(null), children: t("cancel") }),
            confirm === "restart" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: styles_default.primary, onClick: runRestart, children: t("restart") }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: styles_default.danger, onClick: runShutdown, children: t("shutdown") })
          ] })
        ]
      }
    ) }) : null
  ] });
}

// src/client/index.tsx
var import_jsx_runtime2 = require("react/jsx-runtime");
var NS = "web-lifecycle";
var inject = ["slots", "locale"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), "web-lifecycle: dictionaries");
  ctx.effect(() => startNavChrome(), "web-lifecycle: settings nav chrome");
  const t = ctx.locale.bind(NS);
  ctx.slots.inject(
    "settings.section",
    () => ctx.slots.register(
      {
        name: "settings.section",
        id: "service",
        order: 80,
        label: () => t("nav"),
        locale: NS
      },
      () => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(ServicePage, { t })
    )
  );
}

		return module.exports;
	}
});
