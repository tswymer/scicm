import { Args, Command, ux } from '@oclif/core';

import { compareArtifactConfigurations } from '../utils/artifact-configuration.js';
import { getIntergrationPackageDesigntimeArtifacts } from '../utils/ci.js';
import { getConfig } from '../utils/cicm-configuration.js';

export default class VerifyConfiguration extends Command {
    static args = {
        environmentAccountShortName: Args.string({ required: true }),
    }

    async run(): Promise<void> {
        const { args: { environmentAccountShortName } } = await this.parse(VerifyConfiguration);

        const config = await getConfig();

        const environment = config.environments.find(environment => environment.accountShortName === environmentAccountShortName);

        if (!environment) this.error(`Environment with accountShortName "${environmentAccountShortName}" not found.`);

        this.log('Verifying Cloud Integration Configurations...');

        for (const monitoredPackage of config.monitoredIntegrationPackages ?? []) {
            this.log('');

            ux.action.start(`Verifying configurations for package "${monitoredPackage.packageId}"...`);

            const packageArtifacts = await getIntergrationPackageDesigntimeArtifacts(environment, monitoredPackage.packageId);

            let comparisonCounter = 0;
            for (const packageArtifact of packageArtifacts) {
                // Check if the artifact is ignored in the configuration
                if (monitoredPackage.ignoredArtifactIds.includes(packageArtifact.Id)) continue;

                const comparedConfigurations = await compareArtifactConfigurations({
                    artifactId: packageArtifact.Id,
                    artifactVersion: packageArtifact.Version,
                    command: this,
                    environment,
                    packageId: monitoredPackage.packageId,
                });

                comparisonCounter += comparedConfigurations;
            }

            ux.action.stop(`verified ${comparisonCounter} configurations!`);
        }

        this.log('\n🎉 Successfully verified all configurations!');
    }
}
