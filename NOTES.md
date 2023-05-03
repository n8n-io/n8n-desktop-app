# Notes on n8n-desktop

- **Confirmed working on**: 32-bit Win 8.1, 64-bit Win 10, 64-bit Win 11, Intel/M1 Mac w/macOS 10.14.6 to 11.6 as of `8101cba` (Nov 4 launch)

## General notes

- **Processes**: Starting n8n desktop launches an init process that starts n8n at 5679, waits for it to be available, and launches the Electron main process, which creates a renderer process (Chromium instance). The only case where there is a second, third, etc. renderer process is when duplicating a workflow. Closing the Chromium instance throws an error that aborts the init process, bringing down all other processes as well - there is probably a more elegant way to do this. n8n desktop does not run in the background after being closed, by design.
- **Port**: n8n.one requires port 5679 to be free. You can configure the port in `n8n-desktop.env`. This port is protected by default with basic auth.
- **Default env vars**: n8n desktop's env vars are generated at and read from `~/.n8n/n8n-desktop.env` or `C:\Users\<user>\.n8n`. View them here: https://github.com/n8n-io/n8n-one/blob/main/defaultEnv.js
- **Shared DB**: n8n desktop uses by default the same sqlite DB as vanilla n8n. To switch to PG or MySQL, add the relevant env vars in `n8n-desktop.env`, e.g. https://docs.n8n.io/reference/data/database.html#postgresdb
- **Permissions**: If you run n8n desktop as a user with certain permissions, those permissions apply to anything n8n desktop can do, e.g. if the user cannot write to the root dir, neither will the Write File node.
- **Unsupported nodes**: Kafka nodes are unsupported (`kafkajs` breaks build) and so is Edit Image node (requires separate install of `GraphicsMagick`).
- **Logging to file**: If you set `N8N_LOG_OUTPUT=file` and `N8N_LOG_FILE_LOCATION=n8n.log`, then the logs will be written to `~/.n8n/n8n-desktop-logs/n8n.log` or `C:\Users\<user>\.n8n\n8n-desktop-logs\n8n.log`

## Win-specific notes

- **Installing**: Run the installer to install n8n desktop at `C:\Users\<user>\AppData\Local\Programs\n8n-desktop`. It also creates a cache at `C:\Users\<user>\AppData\Roaming\n8n-desktop`
- **Uninstalling**: Run the uninstaller at the install dir. Uninstalling does not affect the .n8n dir or the cache dir.
- **Windows Security screen**: If you see a Windows security screen titled `Windows protected your PC`, please click on `More Info` and then on `Run Anyway`. If the Microsoft malware scan was successful, this security screen should not be shown.
- **Windows Defender Firewall**: If you see a Windows Defender Firewall dialog titled `Windows Defender Firewall has blocked some features of this app`, please click on `Allow access`.
- **Updating**: Uninstall the old version, download the new version and install version. (Pending to test if it is possible to reinstall without uninstalling first.)
- **Min Win version**: 32-bit Win 8.1 (there might be even older supported versions)

## Mac-specific notes

- **Updating**: Trash n8n.app, redownload and rerun.
- **Min macOS version**: Mojave 10.14.6 (there might be even older supported versions)
