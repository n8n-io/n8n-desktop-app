# Changelog

## February 2023 Release

**Date**: 2023.02.28

**Version**: `n8n-x_e-1-10-0_n-0-216-2` → desktop version: 1.10.0 | n8n version: 0.216.2

## December 2022 Release

**Date**: 2022.12.29

**Version**: `n8n-x_e-1-9-0_n-0-209-4` → desktop version: 1.9.0 | n8n version: 0.209.4

## November 2022 Release

**Date**: 2022.11.30

**Version**: `n8n-x_e-1-8-0_n-0-204-0` → desktop version: 1.8.0 | n8n version: 0.204.0

- Upgrade to `n8n@0.204.0`

## October 2022 Release

**Date**: 2022.10.18

**Version**: `n8n-x_e-1-7-0_n-0-198-2` → desktop version: 1.7.0 | n8n version: 0.198.2

- Upgrade to `n8n@0.198.2`
- Set `N8N_DIAGNOSTICS_POSTHOG_DISABLE_RECORDING=false` in `n8n-desktop.env` if missing

## 15 June 2022 Release

**Date**: 2022.06.15

**Version**: `n8n-x_e-1-6-0_n-0-182-0` → desktop version: 1.6.0 | n8n version: 0.182.0

- Upgrade to `n8n@0.182.0`

## 6 June 2022 Release

**Date**: 2022.06.10

**Version**: `n8n-x_e-1-5-0_n-0-180-0` → desktop version: 1.5.0 | n8n version: 0.180.0

- Upgrade to `n8n@0.180.0`
- New app bar menu item to reset DB to default user state

## April 2022 Release

**Date**: 2022.04.27

**Version**: `n8n-x_e-1-4-0_n-0-174-0` → desktop version: 1.4.0 | n8n version: 0.174.0

- Upgrade to `n8n@0.174.0`

## March 2022 Release

**Date**: 2022.03.03

**Version**: `n8n-x_e-1-3-0_n-0-165-1` → desktop version: 1.3.0 | n8n version: 0.165.1

- Upgrade to `n8n@0.165.1`
- Read `DESKTOP_ENABLE_OFFLINE_MODE=true` in `n8n-desktop.env` to disable `--tunnel`

## January 2022 Release

**Date**: 2022.01.26

**Version**: `n8n-x_e-1-2-0_n-0-160-0` → desktop version: 1.2.0 | n8n version: 0.160.0

- Upgrade to `n8n@0.160.0`
- Auto-detect timezone and set `GENERIC_TIMEZONE` in `n8n-desktop.env` if missing

## December 2021 Release

**Date**: 2021.12.17

**Version**: `n8n-x_e-1-1-0_n-0-153-0` → desktop version: 1.1.0 | n8n version: 0.153.0

- Upgrade to `n8n@0.153.0`
- Restart on crash: if the n8n process crashes, desktop auto-recovers from `Connection lost` in 2-3 seconds
- Desktop tunnel creds no longer needed when connecting OAuth creds
- New app bar menu item "Auth" for desktop creds visibility
- General refactorings. Initial groundwork for background processes. Non-user facing improvements.

## November 2021 Release

**Date**: 2021.11.04

**Version**: `n8n-x_e-1-0-0_n-0-147-0` → desktop version: 1.0.0 | n8n version: 0.147.0

- Initial release
