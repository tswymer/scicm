import { Command, ux } from '@oclif/core';

import { integrationContent } from '../../cpi-odata/IntegrationContent/index.js';
import { getSecrets } from '../../utils/secrets.js';

export default class Package extends Command {
    async run(): Promise<void> {
        const secrets = await getSecrets(this);

        this.log('\n📦 Add a new Intergration Package 📦');
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
