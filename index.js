const path = require("path");
const { execFile, fork } = require("child_process");
const { app, shell } = require("electron");
const waitOn = require("wait-on");
const { URL } = require("url");
const respawn = require("respawn");
const fetch = require('node-fetch');
const tcpPortUsed = require("tcp-port-used");
const { setEnvVars } = require("./envVars");
const { renderer } = require("./renderer");

const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";
const isDev = process.env.ELECTRON_DEV_MODE;
const isProd = !isDev;

// mac dev -> execFile + AbortController
// win dev -> fork + AbortController
// mac prod -> respawn + lsof
// win prod -> respawn + taskkill

async function waitForUrls(urls, {
  interval,
  timeout,
  auth
} = {
  interval: 250,
  timeout: 10000,
  auth: {
    username: '',
    password: ''
  }
}) {
  const startTime = Date.now();

  async function check (url) {
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic '+btoa(`${auth.username}:${auth.password}`),
        },
      });

      if (res.status === 200) {
        return true;
      } else {
        return await check(url);
      }
    } catch (error) {
      if (Date.now() - startTime > timeout) {
        return false;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));

      return await check(url);
    }
  }

  return await Promise.all(urls.map(check));
}

async function main() {
  console.log(`Running in ${isDev ? "dev" : "prod"} mode`);

  await setEnvVars();

  const N8N_URL = `http://localhost:${process.env.N8N_PORT}`;
  const N8N_HEALTH_URL = `${N8N_URL}/healthz`;

  // *****************************
  //        n8n process
  // *****************************

  console.log("Starting n8n process...");

  const nodeModulesPath = path.join(__dirname, "node_modules");
  const n8nScriptPath = path.join(nodeModulesPath, "n8n", "bin", "n8n");

  let n8nProcess;
  const controller = new AbortController();
  const { signal } = controller;

  const bgEnabled =
    process.env.N8N_DESKTOP_BACKGROUND_PROCESS_ENABLED === "true";
  const portInUse = await tcpPortUsed.check(parseInt(process.env.N8N_PORT));
  const shouldInit = !bgEnabled || !portInUse;
  const offlineEnabled = process.env.DESKTOP_ENABLE_OFFLINE_MODE === "true";

  process.env.N8N_VERSION_NOTIFICATIONS_ENABLED = false; // hide updates panel

  process.env.N8N_AUTH_EXCLUDE_ENDPOINTS = [
    "rest/oauth1-credential/callback",
    "rest/oauth2-credential/callback",
  ].join(":");

  if (isDev && shouldInit) {
    const devCliArgs = ["start", "--tunnel"];

    if (offlineEnabled) devCliArgs.pop();

    if (isMac) {
      n8nProcess = execFile(n8nScriptPath, devCliArgs, { signal });
    }

    if (isWin) {
      n8nProcess = fork(n8nScriptPath, devCliArgs, { signal });
    }
  }

  if (isProd && shouldInit) {
    const prodCliArgs = [n8nScriptPath, "start", "--tunnel"]

    if (offlineEnabled) prodCliArgs.pop();

    n8nProcess = respawn(
      prodCliArgs,
      {
        name: "n8n",
        maxRestarts: 10,
        fork: true,
      },
    );

    n8nProcess.start();
  }

  n8nProcess && n8nProcess.on("data", console.log);
  // n8nProcess && n8nProcess.stdout.on("data", console.log); // dev only
  n8nProcess && n8nProcess.on("error", console.log);
  // n8nProcess && n8nProcess.stdout.on("error", console.log); // dev only

  await waitForUrls([N8N_HEALTH_URL, N8N_URL], {
    timeout: 10000,
    interval: 250,
    auth: {
      username: process.env.N8N_BASIC_AUTH_USER,
      password: process.env.N8N_BASIC_AUTH_PASSWORD,
    },
  });

  console.log("n8n process ready");
  console.log(`Please check ${N8N_HEALTH_URL}`);

  // *****************************
  //     Electron main process
  // *****************************

  console.log("Starting Electron main process...");

  app.whenReady().then(() => renderer(controller, bgEnabled));

  app.on("web-contents-created", (_, contents) => {
    /**
     * Handle navigation to internal or external URL.
     */
    contents.on("will-navigate", (event, targetUrl) => {
      contents.destroy(); // TODO: undocumented API, find alternative
      event.preventDefault();

      const url = new URL(targetUrl);

      if (url.hostname === "localhost") {
        window.loadURL(targetUrl).catch(console.log);
        return;
      }

      if (!["https:", "http:"].includes(url.protocol)) return; // for security

      shell.openExternal(targetUrl);
    });
  });
}

main();
