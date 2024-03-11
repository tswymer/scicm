import { input, password, select } from '@inquirer/prompts';
import { Command, Flags, ux } from '@oclif/core';
import { exec } from 'node:child_process';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';

import { testCredentials } from '../utils/cloud-integration.js';
import { CIRegion, ciEnvironmentSchema, ciRegions, setConfig } from '../utils/scicm-configuration.js';
import { scicmSecretsSchema, setSCICMSecrets } from '../utils/scicm-secrets.js';

export default class Init extends Command {
  static description = 'Initialize a new SAP Cloud Integration Configuration Manager (scicm) project.';

  static flags = {
    projectName: Flags.string({ description: 'name of the scicm project to create.' }),
    ciUsername: Flags.string({ description: 'username for the CI OData API.' }),
    ciPassword: Flags.string({ description: 'password for the CI OData API.' }),
    ciAccountShortName: Flags.string({ description: 'account short name for the CI instance.' }),
    ciSSLHost: Flags.string({ description: 'SSL host for the CI instance.' }),
    ciRegion: Flags.string({ description: 'region for the CI instance.' }),
  };

  public async run() {
    const { flags } = await this.parse(Init)

    const scicmVersion = JSON.parse(await readFile(join(import.meta.url.replace('file:', ''), '..', '..', 'package.json'), 'utf8')).version;
    if (!scicmVersion) this.error('Failed to get the current version of scicm.');

    this.log('Welcome to the SAP Cloud Integration Configuration Manager (scicm) setup!\n');

    const projectName = flags.projectName ?? await input({ message: 'Project Name:', default: 'my-scicm-project' });

    // Check if there is already a project (folder) with the same name
    const projectPath = join(process.cwd(), projectName);

    const projectFolderExists = await access(projectPath).then(() => true).catch(() => false);
    if (projectFolderExists) {
      this.error(`A project with the name "${projectName}" already exists in this directory.`);
    }

    // Gather the secrets from the user
    this.log('\n(OAuth later on, Basic auth for now).');
    const scicmSecrets = {
      'CI_USERNAME': flags.ciUsername ?? await input({ message: 'CI OData API Username:' }),
      'CI_PASSWORD': flags.ciPassword ?? await password({ message: 'CI OData API Password:' }),
    } satisfies z.infer<typeof scicmSecretsSchema>;

    this.log('');

    // Gather the initial environment details from the user
    this.log('Provide the environment details for the first CI instance to monitor.');
    this.log('You can add more instances after the setup is complete.\n');

    this.log('When entering the CI instance URL, please follow this format:');
    this.log('https://{Account Short Name}-tmn.{SSL Host}.{Region}.hana.ondemand.com/api/v1');
    this.log('Where:');
    this.log('- {Account Short Name} is your specific account identifier.');
    this.log('- {SSL Host} typically represents the SSL certificate name or a service identifier.');
    this.log('- {Region} is the data center region where your CI instance is hosted, such as eu1, us1, ap1, etc.');
    this.log('For example, if your account short name is "l123456", your SSL host is "hci", and your instance is hosted in the "eu1" region,');
    this.log('your CI instance URL would be "https://l123456-tmn.hci.eu1.hana.ondemand.com".\n');

    const initialEnvironment = {
      accountShortName: flags.ciAccountShortName ?? await input({ message: 'CI Account Short Name:' }),
      sslHost: flags.ciSSLHost ?? await input({ message: 'CI SSL Host:' }),
      region: (flags.ciRegion as CIRegion) ?? await select({
        message: 'CI Region:',
        choices: ciRegions.map(region => ({
          value: region,
          name: region,
        })),
      })
    } satisfies z.infer<typeof ciEnvironmentSchema>;

    this.log('');

    // Check the connection to the CI instance
    ux.action.start('Checking connection...');
    try {
      await testCredentials(initialEnvironment, scicmSecrets);
      ux.action.stop('Connection successful! 🌎\n');
    } catch (error) {
      ux.action.stop('Connection failed! ❌');

      if (!(error instanceof Error)) this.error(new Error('Unknown error: ' + String(error)));

      this.logToStderr('Failed to connect to the SAP CI instance with the provided credentials:');
      this.error(error);
    }

    // Create the project folder
    ux.action.start(`Creating "${projectName}"...`);
    await mkdir(projectPath);

    // Write the initial environment file
    await setConfig({
      integrationEnvironments: [initialEnvironment],
    }, projectPath);

    // Create a .gitignore file to exclude the .env file (secrets)
    const gitIngnoreFilePath = join(projectPath, '.gitignore');
    await writeFile(gitIngnoreFilePath, 'node_modules\n\n.env');
    this.log(`✅ Created ${gitIngnoreFilePath} to exclude .env`);

    // Write the secrets to the .env file
    await setSCICMSecrets(scicmSecrets, projectName);
    this.log(`✅ Created ${join(projectPath, '.env')} with secrets`);

    // Create the package.json file
    const packageJsonFilePath = join(projectPath, 'package.json');
    await writeFile(packageJsonFilePath, JSON.stringify({
      name: projectName,
      description: 'SAP Cloud Integration Configuration Manager',
      type: 'module',
      scripts: {
        "add-package": "npx scicm add package",
        "verify": "npx scicm verify",
        "update": "npx scicm update",
      },
      dependencies: {
        'scicm': `^${scicmVersion}`,
      }
    }, null, 2));

    // Create the "artifact-variables.js" file
    await writeFile(join(projectPath, 'artifact-variables.js'), ARTIFACT_VARIABLES_TEMPLATE, 'utf8');
    this.log(`✅ Created ${join(projectPath, 'artifact-variables.js')}`);

    ux.action.stop(`Project successfully created!`);

    ux.action.start('Installing dependencies...');

    // Install the dependencies for the user
    await new Promise<void>((resolve, reject) => {
      exec('npm install', { cwd: projectPath }, (error, stdout, stderr) => {
        if (error) reject(error);
        if (stderr) this.logToStderr(stderr);
        if (stdout) this.log(stdout);
        resolve();
      });
    });

    ux.action.stop('Dependencies installed!');

    this.log(`\nYour project is now set up and ready to use!`);
  }
}

const ARTIFACT_VARIABLES_TEMPLATE = `import "dotenv/config";

/** @type {import('scicm/dist/utils/artifact-variables').GetArtifactVariables} */
export function getArtifactVariables(accountShortName) {
  console.log('Creating artifact variables for:', accountShortName)

  return {
    MY_VARIABLE_KEY: 'MY_VARIABLE_VALUE',
  }
}
`;