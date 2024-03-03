import { Command, ux } from '@oclif/core';
import { access, appendFile, readFile, writeFile, } from 'node:fs/promises';
import { z } from 'zod';

import { integrationContent } from '../cpi-odata/IntegrationContent/index.js';
import { secretsSchema } from '../schemas/configuration.js';

export default class Init extends Command {
  static description = 'Initialize the the cpi-configuration-versions project.';

  static examples = [];

  static flags = {};

  public async run() {
    this.log('Welcome to the setup for a new SAP CPI configuration monitoring setup!\n');

    // Gather the secrets from the user
    this.log('🔓 Local Environment Secret Setup 🔓');
    const secrets = {
      'CPI_URL': await ux.prompt('CPI OData API Endpoint (ex. "https://xxxxxxx-tmn.xxx.eu1.hana.ondemand.com/api/v1")'),
      'CPI_USERNAME': await ux.prompt('CPI OData API Username'),
      'CPI_PASSWORD': await ux.prompt('CPI OData API Password', { type: 'mask' }),
    } satisfies z.infer<typeof secretsSchema>;

    // Create a .env string with the secrets
    const envVariables = '# AUTOMATICALLY GENERATED\n'.concat(Object.entries(secrets).map(([key, value]) => `${key}=${value}`).join('\n'));

    try {
      // Check if the .env file exists
      await access('.env');

      // If it does, append the secrets to it
      try {
        this.log('\nAdding secrets to existing .env file... ✅');
        await appendFile('.env', '\n\n'.concat(envVariables));
      } catch (error) {
        if (error instanceof Error)
          this.error(error);
        this.exit(1);
      }
    } catch {
      // If it doesn't, create the .env file
      this.log('\nCreating .env file with secrets... ✅');
      await writeFile('.env', envVariables);
    }

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

    this.log('\n📦 Package Monitoring Setup 📦');
    ux.action.start('Loading integration packages from SAP CPI...');

    const { integrationPackagesApi } = integrationContent();

    const integrationPackages = await integrationPackagesApi.requestBuilder()
      .getAll()
      .execute({
        url: secrets.CPI_URL,
        username: secrets.CPI_USERNAME,
        password: secrets.CPI_PASSWORD,
      });

    this.log(integrationPackages.map(pkg => pkg.name).join('\n'));
  }
}
