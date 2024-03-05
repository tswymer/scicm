import { Args, Command, Flags, ux } from '@oclif/core';

import { compareArtifactConfigurations } from '../utils/artifact-configuration.js';
import { getNewestLocalArtifactConfigurations, pushConfigurationVersion } from '../utils/artifact-management.js';
import { getConfig } from '../utils/cicm-configuration.js';
import { getIntegrationArtifactConfigurations, getIntergrationPackageArtifacts } from '../utils/cloud-integration.js';
import exhaustiveSwitchGuard from '../utils/exhaustive-switch-guard.js';

export default class VerifyConfiguration extends Command {
    static args = {
        environmentAccountShortName: Args.string({ required: true, description: 'The accountShortName to verify configurations for' }),
    }

    static flags = {
        safeUpdate: Flags.boolean({ description: 'Update the local configuration versions if their configurations are unchanged' }),
    }

    async run(): Promise<void> {
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

            const packageArtifacts = await getIntergrationPackageArtifacts(environment, monitoredPackage.packageId);

            let comparisonCounter = 0;
            const warnings: string[] = [];
            for (const packageArtifact of packageArtifacts) {
                // Check if the artifact is ignored in the configuration
                if (monitoredPackage.ignoredArtifactIds.includes(packageArtifact.Id)) continue;

                // Get the local and remote configurtions for this artifact
                const newestLocalConfigurations = await getNewestLocalArtifactConfigurations(monitoredPackage.packageId, packageArtifact.Id);
                const remoteConfigurations = await getIntegrationArtifactConfigurations({ environment, artifactId: packageArtifact.Id, artifactVersion: packageArtifact.Version, packageSecrets });

                // Check if the remote artifact version is identical to the local artifact configuration version
                const configurationHasIdenticalVersion = packageArtifact.Version === newestLocalConfigurations.artifactVersion;
                if (!configurationHasIdenticalVersion && !safeUpdate) {
                    this.error(new Error([
                        `🚨 Remote artifact version "${packageArtifact.Version}" for artifact "${packageArtifact.Id}" does not match latest local configuration version "${newestLocalConfigurations.artifactVersion}"!`,
                        'Please run the "update:package" command to update the local configuration.'
                    ].join('\n')));
                }

                // Compare the local and remote configurations
                this.log(`Verifying ${remoteConfigurations.configurations.length}\tconfiguration(s) for artifact "${packageArtifact.Id}"...`);
                const configurationComparison = compareArtifactConfigurations({
                    localConfigurations: newestLocalConfigurations,
                    remoteConfigurations,
                });

                // Handle the comparison result
                switch (configurationComparison.result) {
                    case 'NO_LOCAL_ARTIFACT_VERSION': {
                        return this.error(new Error([
                            `🚨 No local configurations found for artifact "${packageArtifact.Id}" (v.${packageArtifact.Version}) from package "${monitoredPackage.packageId}".`,
                            'Please run the "add:package" command to add the artifact to the configuration.'
                        ].join('\n')));
                    }

                    case 'LOCAL_CONFIGURATION_MISMATCH': {
                        const { localValue, remoteValue, configurationKey } = configurationComparison;

                        if (configurationHasIdenticalVersion) {
                            return this.error(new Error([
                                `🚨 Local configuration key "${configurationKey}" from artifact "${packageArtifact.Id}" (v.${packageArtifact.Version}) has a different value than the remote configuration value!:`,
                                `Local Value:\t${localValue}`,
                                `Remote Value:\t${remoteValue}`,
                                `If you are sure the remote configuration is correct, please run the "update:package -f" command to update the local configuration.`
                            ].join('\n')),)
                        }

                        return this.error(new Error([
                            `🚨 Local configuration for artifact "${packageArtifact.Id}" (v.${packageArtifact.Version}) is out of date!`,
                            `Remote configuration now has been updated with new configurations (v${packageArtifact.Version}).`,
                            'Please run the "update:package" command to update the local configuration.'
                        ].join('\n')),)
                    }

                    case 'LOCAL_CONFIGURATION_MISSING': {
                        const { localValue, remoteValue, configurationKey } = configurationComparison;
                        return this.error(new Error([
                            `🚨 Remote configuration key "${configurationKey}" from artifact "${packageArtifact.Id}" (v.${packageArtifact.Version}) not present in the local configuration!:`,
                            `Local Value:\t${localValue}`,
                            `Remote Value:\t${remoteValue}`,
                        ].join('\n')))
                    }

                    case 'OK': { break; }
                    default: { return exhaustiveSwitchGuard(configurationComparison); }
                }

                // If we've made it this far, the local and remote configurations are identical
                console.assert(configurationComparison.result === 'OK');

                // If the remote configuration version is newer than the local configuration version, push the new version to the local configuration
                if (!configurationHasIdenticalVersion && safeUpdate) {
                    // Update the local configuration version to the remote configuration version
                    await pushConfigurationVersion(monitoredPackage.packageId, packageArtifact.Id, packageArtifact.Version, remoteConfigurations.configurations);
                    this.log(`⬆️ Safely updated local configuration version for artifact "${packageArtifact.Id}" to (v.${packageArtifact.Version})!`);
                }

                // If there are any warning, remember them for later
                for (const unusedLocalConfigurationKey of configurationComparison.unusedLocalConfigurationKeys) {
                    warnings.push(`Local configuration key "${unusedLocalConfigurationKey}" from artifact "${packageArtifact.Id}" (v.${packageArtifact.Version}) is not present in the remote configuration.`);
                }

                // Update the comparison counter for logging
                comparisonCounter += configurationComparison.comparisonCount;
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
