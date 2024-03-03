import { Command, ux } from '@oclif/core';
import { access, appendFile, readFile, writeFile, } from 'node:fs/promises';
import { z } from 'zod';

import { secretsSchema } from '../schemas/configuration.js';
import { setSecrets } from '../utils/secrets.js';

export default class Init extends Command {
  static description = 'Initialize the the cpi-configuration-versions project.';

  static examples = [];

  static flags = {};

  public async run() {
    this.log('Welcome to the setup for a new SAP CPI configuration monitoring setup!\n');

    // Gather the secrets from the user
    this.log('-- 🔓 Local Environment Secret Setup 🔓 --');
    const secrets = {
      'CPI_URL': await ux.prompt('CPI OData API Endpoint (ex. "https://xxxxxxx-tmn.xxx.eu1.hana.ondemand.com/api/v1")'),
      'CPI_USERNAME': await ux.prompt('CPI OData API Username'),
      'CPI_PASSWORD': await ux.prompt('CPI OData API Password', { type: 'mask' }),
    } satisfies z.infer<typeof secretsSchema>;

    this.log('');

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

    this.log('-- 🔓 Local Environment Secret Setup Complete 🔓 --');
  }
}
