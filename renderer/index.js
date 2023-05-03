const { exec } = require("child_process");
const { app, BrowserWindow, dialog } = require("electron");
const { buildAppMenu } = require('./appMenu');
const { find } = require('find-process');

const isMac = process.platform === "darwin";
const isWin = process.platform === "win32";
const isDev = process.env.ELECTRON_DEV_MODE;

function renderer(controller, bgEnabled) {
  console.log("Starting Electron renderer process...");

  window = new BrowserWindow({
    width: 1200,
    height: 800,
    resizable: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  window.setTitle("n8n");
  window.on("page-title-updated", (e) => e.preventDefault());

  window.webContents.loadURL(`http://localhost:${process.env.N8N_PORT}`).catch(console.log);

  buildAppMenu();

  console.log("Basic auth enabled:", process.env.N8N_BASIC_AUTH_ACTIVE);

  if (process.env.N8N_BASIC_AUTH_ACTIVE === "true") {
    app.on("login", (event, webContents, request, authInfo, callback) => {
      event.preventDefault();
      callback(
        process.env.N8N_BASIC_AUTH_USER,
        process.env.N8N_BASIC_AUTH_PASSWORD
      );
    });
  }

  window.webContents.on("will-prevent-unload", async (event) => {
    const options = { Reload: 0, Cancel: 1 };

    const box = BrowserWindow.fromWebContents(window.webContents);

    const chosen = dialog.showMessageBoxSync(box, {
      type: "warning",
      buttons: Object.keys(options),
      message: ["Reload workflow canvas?", "Unsaved changes will be lost."].join("\n"),
      defaultId: options.Reload,
      noLink: true,
    });

    if (chosen === options.Reload) {
      event.preventDefault();
    }
  });

  window.on("close", async (event) => {
    const options = { Yes: 0, No: 1 };

    const box = BrowserWindow.fromWebContents(window.webContents);

    const chosen = dialog.showMessageBoxSync(box, {
      type: "warning",
      message: "Are you sure you want to close n8n?",
      buttons: Object.keys(options),
      defaultId: options.Yes,
      noLink: true,
    });

    chosen === options.No ? event.preventDefault() : app.exit(0);
  });

  window.on("closed", (e) => {
    if (bgEnabled) return;

    console.log("Ending Electron renderer process...");

    if (isDev) {
      controller.abort();
    }

    if (isMac) {
      exec(`kill -9 $(lsof -ti:${process.env.N8N_PORT})`);
    } else if (isWin) {
      try {
        find('port', process.env.N8N_PORT).then(list => {
          if (list.length && list[0].pid) {
            exec(`taskkill //f //pid ${list[0].pid}`);
          }
        });
      } catch (_) {
        // FIXME: Failing on Win 11
      }
    }
  });
}

module.exports = { renderer };
