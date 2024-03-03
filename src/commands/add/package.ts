import { checkbox, select } from '@inquirer/prompts';
import { Command, ux } from '@oclif/core';

import { getIntegrationPackages, getIntergrationPackageDesigntimeArtifacts } from '../../utils/cpi.js';

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

        const integrationDesigntimeArtifacts = await getIntergrationPackageDesigntimeArtifacts(selectedPackageId);

        const selectedIntegrationArtifacts = await checkbox({
            message: 'Select the integration artifacts to add:',
            required: true,
            choices: integrationDesigntimeArtifacts.map(artifact => ({
                value: artifact.Id,
                name: `[${artifact.Id}]:\t${artifact.Name ?? '_Unnamed_Artifact_'}`,
                checked: true,
            })),
            theme: {
                style: {
                    renderSelectedChoices(selectedChoices: unknown[], allChoices: unknown[]) {
                        return `Selected ${selectedChoices.length}/${allChoices.length} artifacts`;
                    },
                }
            }
        });

        this.log('Selected artifacts:', selectedIntegrationArtifacts);
    }
}
