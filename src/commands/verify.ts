import { Args, Command, Flags, ux } from '@oclif/core';

import { compareArtifactConfigurations, getNewestLocalArtifactConfigurations } from '../utils/artifact-configuration.js';
import { getIntegrationDesigntimeArtifactConfigurations, getIntergrationPackageDesigntimeArtifacts } from '../utils/ci.js';
import { getConfig } from '../utils/cicm-configuration.js';
import exhaustiveSwitchGuard from '../utils/exhaustive-switch-guard.js';

export default class VerifyConfiguration extends Command {
    static args = {
        environmentAccountShortName: Args.string({ required: true, description: 'The accountShortName to verify configurations for' }),
    }

    static flags = {
        safeUpdate: Flags.boolean({ description: 'Update the local configuration versions if their configurations are unchanged' }),
    }

    async run(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { args: { environmentAccountShortName }, flags: { safeUpdate } } = await this.parse(VerifyConfiguration);

        const config = await getConfig();

        const environment = config.environments.find(environment => environment.accountShortName === environmentAccountShortName);

        if (!environment) this.error(`Environment with accountShortName "${environmentAccountShortName}" not found.`);

        this.log('Verifying Cloud Integration Configurations...');

        for (const monitoredPackage of config.monitoredIntegrationPackages ?? []) {
            this.log('');

            // Load the packageSecrets from the configuration file
            const packageSecrets = config.monitoredIntegrationPackages?.find(p => p.packageId === monitoredPackage.packageId)?.packageSecrets;

            ux.action.start(`Verifying configurations for package "${monitoredPackage.packageId}"...`);

            const packageArtifacts = await getIntergrationPackageDesigntimeArtifacts(environment, monitoredPackage.packageId);

            let comparisonCounter = 0;
            const warnings: string[] = [];
            for (const packageArtifact of packageArtifacts) {
                // Check if the artifact is ignored in the configuration
                if (monitoredPackage.ignoredArtifactIds.includes(packageArtifact.Id)) continue;

                // Get the local and remote configurtions for this artifact
                const newestLocalConfigurations = await getNewestLocalArtifactConfigurations(this, monitoredPackage.packageId, packageArtifact.Id);
                const remoteConfigurations = await getIntegrationDesigntimeArtifactConfigurations({ environment, artifactId: packageArtifact.Id, artifactVersion: packageArtifact.Version, packageSecrets });

                // Compare the local and remote configurations
                this.log(`Verifying ${remoteConfigurations.configurations.length}\tconfiguration(s) for artifact "${packageArtifact.Id}"...`);
                const comparedConfigurations = compareArtifactConfigurations({
                    artifactVersion: packageArtifact.Version,
                    newestLocalConfigurations,
                    remoteConfigurations,
                });

                // Handle the comparison result
                switch (comparedConfigurations.type) {
                    case 'NO_LOCAL_ARTIFACT_VERSION': {
                        return this.error(new Error([
                            `No local configurations found for artifact "${packageArtifact.Id}" (v.${packageArtifact.Version}) from package "${monitoredPackage.packageId}".`,
                            'Please run the "add:package" command to add the artifact to the configuration.'
                        ].join('\n')));
                    }

                    case 'LOCAL_CONFIGURATION_MISMATCH': {
                        const { localValue, remoteValue, configurationKey } = comparedConfigurations;
                        return this.error(new Error([
                            `🚨 Local configuration key "${configurationKey}" from artifact "${packageArtifact.Id}" (v.${packageArtifact.Version}) has a different value than the remote configuration value!:`,
                            `Local Value:\t${localValue}`,
                            `Remote Value:\t${remoteValue}`,
                        ].join('\n')),)
                    }
                    case 'LOCAL_CONFIGURATION_MISSING': {
                        const { localValue, remoteValue, configurationKey } = comparedConfigurations;
                        return this.error(new Error([
                            `🚨 Remote configuration key "${configurationKey}" from artifact "${packageArtifact.Id}" (v.${packageArtifact.Version}) not present in the local configuration!:`,
                            `Local Value:\t${localValue}`,
                            `Remote Value:\t${remoteValue}`,
                        ].join('\n')))
                    }

                    case 'OK': { break; }
                    default: { return exhaustiveSwitchGuard(comparedConfigurations); }
                }

                // If there are any warning, remember them for later
                for (const unusedLocalConfigurationKey of comparedConfigurations.unusedLocalConfigurationKeys) {
                    warnings.push(`Local configuration key "${unusedLocalConfigurationKey}" from artifact "${packageArtifact.Id}" (v.${packageArtifact.Version}) is not present in the remote configuration.`);
                }

                comparisonCounter += comparedConfigurations.comparisonCount;
            }

            // If there are any warnings, print them
            if (warnings.length > 0) {
                warnings.forEach(warning => this.warn(warning));
                this.log('');
            }

            ux.action.stop(`verified ${comparisonCounter} configurations!`);
        }

        this.log('\n🎉 Successfully verified all configurations!');
    }
}
