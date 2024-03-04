import { Command, ux } from '@oclif/core';

import { compareArtifactConfigurations } from '../utils/artifact-configuration.js';
import { getIntergrationPackageDesigntimeArtifacts } from '../utils/cpi.js';
import { getSICMConfig } from '../utils/sicm-configuration.js';

export default class VerifyConfiguration extends Command {
    async run(): Promise<void> {
        this.log('🧐 Verifying Integration Configurations 🧐');

        const config = await getSICMConfig();

        for (const monitoredPackage of config.monitoredIntegrationPackages ?? []) {
            ux.action.start(`Verifying configurations for integration package ${monitoredPackage.packageId}...`);

            const packageArtifacts = await getIntergrationPackageDesigntimeArtifacts(monitoredPackage.packageId);

            for (const packageArtifact of packageArtifacts) {
                // Check if the artifact is ignored in the configuration
                if (monitoredPackage.ignoredArtifactIds.includes(packageArtifact.Id)) continue;

                await compareArtifactConfigurations({
                    command: this,
                    artifactId: packageArtifact.Id,
                    artifactVersion: packageArtifact.Version,
                    packageId: monitoredPackage.packageId,
                });
            }

            ux.action.stop(`complete! 🎉`);
        }
    }
}
