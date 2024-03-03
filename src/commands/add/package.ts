import { select } from '@inquirer/prompts';
import { Command, ux } from '@oclif/core';

import { getIntegrationPackages } from '../../utils/cpi.js';

export default class Package extends Command {
    async run(): Promise<void> {

        this.log('📦 Add a new Intergration Package 📦');

        ux.action.start('Loading integration packages from SAP CPI...');
        const integrationPackages = await getIntegrationPackages();
        ux.action.stop();

        const selectedPackageId = await select({
            message: 'Select an intergration package to add:',
            choices: integrationPackages.map(pkg => ({
                value: pkg.id,
                name: `[${pkg.id}]:\t${pkg.name ?? '_Unnamed_Package_'}`,
            })),
        });

        this.log(`Selected package: ${selectedPackageId}`);
    }
}
