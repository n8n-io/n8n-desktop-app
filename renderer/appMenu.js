const { dialog, shell, Menu, app } = require("electron");
const { execFile, fork } = require("child_process");
const path = require("path");

function buildAppMenu() {
  const defaultMenu = Menu.getApplicationMenu();
  const menuTemplate = makeMenuTemplate(defaultMenu);
  const appMenu = Menu.buildFromTemplate(menuTemplate);

  Menu.setApplicationMenu(appMenu);
}

function makeMenuTemplate(defaultMenu) {
  const filteredMenu = defaultMenu.items.filter(
    (item) => !["File", "Help"].includes(item.label)
  );
  return addCustomHelpSubitems(filteredMenu);
}

function addCustomHelpSubitems(menu) {
  const rawHelpSubitems = {
    Documentation: "https://docs.n8n.io/",
    Forum: "https://community.n8n.io/",
    Workflows: "https://n8n.io/workflows/",
  };

  const submenu = Object.entries(rawHelpSubitems).map(([label, url]) => {
    return {
      label,
      click() {
        shell.openExternal(url);
      },
    };
  });

  const authMenuItem = {
    label: "Auth",
    submenu: [
      {
        label: "View credentials",
        accelerator: "Shift+CmdOrCtrl+C",
        click() {
          dialog.showMessageBox({
            type: "info",
            buttons: ["OK"],
            message: "n8n Desktop Credentials",
            detail: [
              "Credentials of the tunnel that is protecting your n8n desktop instance. Do not share them with anybody.\n",
              `Username: ${process.env.N8N_BASIC_AUTH_USER}`,
              `Password: ${process.env.N8N_BASIC_AUTH_PASSWORD}`,
            ].join("\n"),
          });
        },
      },
      {
        label: "Reset password...",
        click() {
          const options = { Reset: 0, Cancel: 1 };

          const chosen = dialog.showMessageBoxSync({
            type: "warning",
            buttons: Object.keys(options),
            message: "Reset password?",
            detail:
              "You will be taken to the setup form again (but your data will be kept, and you can use the same details)",
          });

          if (chosen === options.Reset) {
            const isMac = process.platform === "darwin";
            const isDev = process.env.ELECTRON_DEV_MODE;

            const modulesPath = path.join(__dirname, "..", "node_modules");
            const n8nExecutable = path.join(modulesPath, "n8n", "bin", "n8n");

            if (isDev && isMac) {
              execFile(n8nExecutable, ["user-management:reset"]);
              app.relaunch();
              app.exit();
            } else {
              // prod mac, prod win, dev win
              const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

              (async () => {
                fork(n8nExecutable, ["user-management:reset"]);
                await sleep(5000);
                app.relaunch();
                app.exit();
              })();
            }
          }
        },
      },
    ],
  };

  return [
    ...menu,
    authMenuItem,
    {
      label: "Help",
      submenu,
    },
  ];
}

module.exports = { buildAppMenu };
