import { Args, Command, ux } from '@oclif/core';

import { compareArtifactConfigurations } from '../utils/artifact-configuration.js';
import { getConfig } from '../utils/cicm-configuration.js';
import { getIntergrationPackageDesigntimeArtifacts } from '../utils/cpi.js';

export default class VerifyConfiguration extends Command {
    static args = {
        environmentAccountShortName: Args.string(),
    }

    async run(): Promise<void> {
        this.log('🧐 Verifying Integration Configurations 🧐');

        const { args: { environmentAccountShortName } } = await this.parse(VerifyConfiguration);

        const config = await getConfig();

        const environment = config.environments.find(environment => environment.accountShortName === environmentAccountShortName);

        if (!environment) this.error(`Environment with account short name "${environmentAccountShortName}" not found.`);

        for (const monitoredPackage of config.monitoredIntegrationPackages ?? []) {
            ux.action.start(`Verifying configurations for integration package ${monitoredPackage.packageId}...`);

            const packageArtifacts = await getIntergrationPackageDesigntimeArtifacts(environment, monitoredPackage.packageId);

            for (const packageArtifact of packageArtifacts) {
                // Check if the artifact is ignored in the configuration
                if (monitoredPackage.ignoredArtifactIds.includes(packageArtifact.Id)) continue;

                await compareArtifactConfigurations({
                    artifactId: packageArtifact.Id,
                    artifactVersion: packageArtifact.Version,
                    command: this,
                    environment,
                    packageId: monitoredPackage.packageId,
                });
            }

            ux.action.stop(`complete! 🎉`);
        }
    }
}
