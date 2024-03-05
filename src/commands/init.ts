import { input, password, select } from '@inquirer/prompts';
import { Command, ux } from '@oclif/core';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';

import { ciEnvironment, ciRegions, setConfig } from '../utils/cicm-configuration.js';
import { secretsSchema, setSecrets } from '../utils/cicm-secrets.js';
import { testCredentials } from '../utils/cloud-integration.js';

export default class Init extends Command {
  static description = 'Initialize a new Cloud Integration Configuration Manager project.';

  public async run() {
    const cicmVersion = JSON.parse(await readFile(join(import.meta.url.replace('file:', ''), '..', '..', 'package.json'), 'utf8')).version;
    if (!cicmVersion) this.error('Failed to get the current version of cicm.');

    this.log('Welcome to the SAP Cloud Integration Configuration Manager (cicm) setup!\n');

    const projectName = await input({ message: 'Project Name:', default: 'my-cicm-project' });

    // Check if there is already a project (folder) with the same name
    const projectPath = join(process.cwd(), projectName);

    const projectFolderExists = await access(projectPath).then(() => true).catch(() => false);
    if (projectFolderExists) {
      this.error(`A project with the name "${projectName}" already exists in this directory.`);
    }

    // Gather the secrets from the user
    this.log('\n(OAuth later on, Basic auth for now).');
    const secrets = {
      'CPI_USERNAME': await input({ message: 'CPI OData API Username:' }),
      'CPI_PASSWORD': await password({ message: 'CPI OData API Password:' }),
    } satisfies z.infer<typeof secretsSchema>;

    this.log('');

    // Gather the initial environment details from the user
    this.log('Provide the environment details for the first CPI instance to monitor.');
    this.log('You can add more instances after the setup is complete.\n');

    this.log('When entering the CPI instance URL, please follow this format:');
    this.log('https://{Account Short Name}-tmn.{SSL Host}.{Region}.hana.ondemand.com/api/v1');
    this.log('Where:');
    this.log('- {Account Short Name} is your specific account identifier.');
    this.log('- {SSL Host} typically represents the SSL certificate name or a service identifier.');
    this.log('- {Region} is the data center region where your CPI instance is hosted, such as eu1, us1, ap1, etc.');
    this.log('For example, if your account short name is "l123456", your SSL host is "hci", and your instance is hosted in the "eu1" region,');
    this.log('your CPI instance URL would be "https://l123456-tmn.hci.eu1.hana.ondemand.com".\n');

    const initialEnvironment = {
      accountShortName: await input({ message: 'CPI Account Short Name:' }),
      sslHost: await input({ message: 'CPI SSL Host:' }),
      region: await select({
        message: 'CI Region:',
        choices: ciRegions.map(region => ({
          value: region,
          name: region,
        })),
      })
    } satisfies z.infer<typeof ciEnvironment>;

    this.log('');

    // Check the connection to the CPI instance
    ux.action.start('Checking connection...');
    try {
      await testCredentials(initialEnvironment, secrets);
      ux.action.stop('Connection successful! 🌎\n');
    } catch (error) {
      ux.action.stop('Connection failed! ❌');

      if (!(error instanceof Error)) this.error(new Error('Unknown error: ' + String(error)));

      this.logToStderr('Failed to connect to the SAP CPI instance with the provided credentials:');
      this.error(error);
    }

    // Create the project folder
    ux.action.start(`Creating "${projectName}"...`);
    await mkdir(projectPath);

    // Write the initial environment to the .cicm.json file
    await setConfig({
      environments: [initialEnvironment],
      environmentSecrets: {}
    }, projectName);

    // Create a .gitignore file to exclude the .env file (secrets)
    const gitIngnoreFilePath = join(projectPath, '.gitignore');
    await writeFile(gitIngnoreFilePath, '.env');
    this.log(`✅ Updated ${gitIngnoreFilePath} to exclude .env`);

    // Write the secrets to the .env file
    await setSecrets(this, secrets, projectName);

    // Create the package.json file
    const packageJsonFilePath = join(projectPath, 'package.json');
    await writeFile(packageJsonFilePath, JSON.stringify({
      name: projectName,
      description: 'SAP Cloud Integration Configuration Manager',
      type: 'module',
      scripts: {
        "add-package": "node ../bin/run.js add package",
        "verify": "node ../bin/run.js verify",
      },
      dependencies: {
        'cicm': `^${cicmVersion}`,
      }
    }, null, 2));

    ux.action.stop(`🎉 Project successfully created!`);
  }
}
