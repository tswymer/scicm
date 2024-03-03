import { input, password, select } from '@inquirer/prompts';
import { Command, ux } from '@oclif/core';
import { access, appendFile, readFile, writeFile, } from 'node:fs/promises';
import { z } from 'zod';

import { cpiEnvironment, cpiRegions, setConfiguration } from '../utils/configuration.js';
import { testCredentials } from '../utils/cpi.js';
import { secretsSchema, setSecrets } from '../utils/secrets.js';

export default class Init extends Command {
  static description = 'Initialize the the cpi-configuration-versions project.';

  static examples = [];

  static flags = {};

  public async run() {
    this.log('Welcome to the setup for a new SAP CPI configuration monitoring setup!\n');

    const projectName = await input({ message: 'Project Name:', default: 'cpi-configuration-versions' });

    // Gather the secrets from the user
    this.log('\n-- 🔓 Local Environment Secret Setup 🔓 --\n');

    this.log('Provide credentials for SAP CPI (OAuth later on, Basic auth for now).');
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
        message: 'CPI Region:',
        choices: cpiRegions.map(region => ({
          value: region,
          name: region,
        })),
      })
    } satisfies z.infer<typeof cpiEnvironment>;

    this.log('');

    ux.action.start('Checking connection...');

    try {
      await testCredentials(initialEnvironment, secrets);
    } catch (error) {
      ux.action.stop('Connection failed! ❌');

      if (!(error instanceof Error)) this.error(new Error('Unknown error: ' + String(error)));

      this.logToStderr('Failed to connect to the SAP CPI instance with the provided credentials:');
      this.error(error);
    }

    ux.action.stop('Connection successful! ✅\n');

    // Write the secrets to the .env file
    await setSecrets(this, secrets);

    try {
      // Check if the .gitignore file exists
      await access('.gitignore');

      // If it does, check if the .env file is already in it
      const gitignore = await readFile('.gitignore', 'utf8');
      if (gitignore.includes('.env')) {
        this.log('.env is already part of .gitignore ✅');
      } else {
        // If it's not, add it
        this.log('Adding .env to .gitignore... ✅');
        await appendFile('.gitignore', '\n.env');
      }
    } catch {
      // If it doesn't, create the .gitignore file with the .env string in it
      this.log('Creating .gitignore file with .env...');
      await writeFile('.gitignore', '.env');
    }

    // Write the initial environment to the .cpi-configuration-versions.json file
    await setConfiguration(this, {
      environments: [initialEnvironment],
    });



    this.log('\n-- 🔓 Local Environment Secret Setup Complete 🔓 --\n');
  }
}
