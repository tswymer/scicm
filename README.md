# SAP Cloud Integration Configuration Manager - scicm

Manage SAP Cloud Integration artifact configuration values with Git. Verify artifact configuration changes within SAP Cloud Integration to confidently deploy.

**Disclaimer: This project is not affiliated with SAP in any way. No offical support will be provided.**

## Prerequisites & Installation

scicm requires the following prerequisites to be installed:

- [Node.js](https://nodejs.org/en/download/) & [npm](https://www.npmjs.com/get-npm)

(not yet available)

## Initial Setup

To create a new Cloud Integration Configuration Management (scicm) project, run the following command to run the setup wizard and create a new project folder with the necessary configuration:

```bash
npx scicm init
```

After completing the setup wizard for a project named `my-scicm-project`, the following files and folders will be created:

- `./my-scicm-project/` - your scicm project folder
- `./my-scicm-project/scicm-config.json` - scicm configuration file
- `./my-scicm-project/artifact-variables.js` - artifact variables file
- `./my-scicm-project/.env` - environment variables file

Some additional housekeeping files will also be created:

- `./my-scicm-project/package.json` - npm package file
- `./my-scicm-project/package-lock.json` - npm package lock file
- `./my-scicm-project/.gitignore` - git ignore file

## Add an Integration Package

To start monitoring the configuration values for integration artifacts within an integration package, run the following command to run the setup wizard and add a new integration package to your scicm project:

```bash
npx scicm add package
```

After selecting the integration package and the containing integration artifacts to monitor, scicm will export the current version of each artifact's version and configuration values to the `./my-scicm-project/configurations/integration-package-name/` folder.

## Verify Configuration Changes

The current configurations for each managed integration artifact can be verified against the current version of the artifact within SAP Cloud Integration by running the following command:

```bash
npx scicm verify
```

When verifying the configuration values for each integration artifact, scicm will compare the current version and configuration values from SAP Cloud Integration with the latest version and configuration values exported locally.

Optionally, a `--safeUpdate` flag can be used to to update the local version and configuration values to match the current version and configuration values from SAP Cloud Integration, as long as the configurations values of the latest local version match the current version and configuration values from SAP Cloud Integration (and are this safe to update).
![scicm-verify](./docs//verify.excalidraw.svg)

For every configuration key that is verified, scicm will check the following information:
![scicm-verification-steps](./docs//verification-steps.excalidraw.svg)

## Update Configuration Values

When configuration changes are made in SAP Cloud Integration, the configuration values can be updated locally by running the following command:

```bash
npx scicm update
```

## Add Integration Artifacts

Not yet implemented.
