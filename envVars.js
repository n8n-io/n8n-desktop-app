const fs = require("fs");
const { readFile, writeFile } = require("fs/promises");
const path = require("path");
const dotenv = require("dotenv");
const moment = require("moment-timezone");

const defaultEnv = `
N8N_DEPLOYMENT_TYPE='${getDeploymentType()}'
EXECUTIONS_PROCESS='main'
EXECUTIONS_DATA_SAVE_ON_PROGRESS=true
EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=true
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER='${generateRandomString()}'
N8N_BASIC_AUTH_PASSWORD='${generateRandomString()}'
N8N_PORT=5679
`;

// from packages/cli/commands/start.ts
function generateRandomString() {
  const availableCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 24 })
    .map(() => {
      return availableCharacters.charAt(
        Math.floor(Math.random() * availableCharacters.length)
      );
    })
    .join("");
}

function getDeploymentType() {
  if (process.platform === "darwin") return "desktop_mac";
  if (process.platform === "win32") return "desktop_win";
  throw new Error("Unsupported platform");
}

async function setEnvVars() {
  const dotN8nDir = await getDotN8nDir();

  await handleLoggingEnvVars(dotN8nDir);

  const desktopEnvPath = await getDesktopEnvPath(dotN8nDir);

  await addGenericTimezoneEnvVar(desktopEnvPath);

  dotenv.config({ path: desktopEnvPath });
}

async function getDotN8nDir() {
  const dotN8nDir = path.join(getUserHome(), ".n8n");

  if (!fs.existsSync(dotN8nDir)) {
    await fs.promises.mkdir(dotN8nDir);
  }

  return dotN8nDir;
}

// from packages/core/src/UserSettings.ts
function getUserHome() {
  let variableName = "HOME";
  if (process.platform === "win32") {
    variableName = "USERPROFILE";
  }

  if (process.env[variableName] === undefined) {
    // If for some reason the variable does not exist
    // fall back to current folder
    return process.cwd();
  }

  return process.env[variableName];
}

async function getDesktopEnvPath(dotN8nDir) {
  const desktopEnvPath = path.join(dotN8nDir, "n8n-desktop.env");

  if (!fs.existsSync(desktopEnvPath)) {
    await fs.promises.writeFile(desktopEnvPath, defaultEnv);
  }

  return desktopEnvPath;
}

async function addGenericTimezoneEnvVar(desktopEnvPath) {
  const envFileContent = await readFile(desktopEnvPath, "utf8");

  const containsGenericTimezoneEnvVar = envFileContent
    .split("\n")
    .some((line) => line.startsWith("GENERIC_TIMEZONE="));

  if (containsGenericTimezoneEnvVar) return;

  await writeFile(
    desktopEnvPath,
    [envFileContent, `GENERIC_TIMEZONE='${moment.tz.guess()}'`].join("\n")
  );
}

async function handleLoggingEnvVars(dotN8nDir) {
  if (
    process.env.N8N_LOG_OUTPUT === "file" &&
    process.env.N8N_LOG_FILE_LOCATION
  ) {
    const logsDirPath = path.join(dotN8nDir, "n8n-desktop-logs");

    if (!fs.existsSync(logsDirPath)) {
      await fs.promises.mkdir(logsDirPath);
    }

    process.env.N8N_LOG_FILE_LOCATION = path.join(
      logsDirPath,
      process.env.N8N_LOG_FILE_LOCATION
    );
  }
}

module.exports = { defaultEnv: defaultEnv.trim(), setEnvVars };
