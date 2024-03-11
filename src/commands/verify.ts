import { Command, Flags, ux } from '@oclif/core';

import { compareArtifactConfigurations } from '../utils/artifact-configuration.js';
import { getLatestLocalArtifactConfigurations, getLocallyManagedArtifact, pushConfigurationVersion } from '../utils/artifact-management.js';
import { getArtifactVariables } from '../utils/artifact-variables.js';
import { selectAccountShortName } from '../utils/cli-utils.js';
import { getIntegrationArtifactConfigurations, getPackageIntergrationArtifacts } from '../utils/cloud-integration.js';
import exhaustiveSwitchGuard from '../utils/exhaustive-switch-guard.js';
import { getConfig, getEnvironment } from '../utils/scicm-configuration.js';

export default class VerifyConfiguration extends Command {
    static description = 'Verfify the artifact configurations for a Cloud Integration environment.';

    static flags = {
        accountShortName: Flags.string({ description: 'the accountShortName to verify configurations for' }),
        safeUpdate: Flags.boolean({ description: 'Update the local artifact configuration versions, as long as their configurations are unchanged' }),
    }

    async run(): Promise<void> {
        const { flags } = await this.parse(VerifyConfiguration);

        const config = await getConfig();

        const accountShortNameResult = await selectAccountShortName({
            config,
            defaultAccountShortName: flags.accountShortName,
        });

        if (accountShortNameResult.result === 'NOT_MONITORED') this.error([
            `The accountShortName "${flags.accountShortName}" is not monitored in the configuration file.`
        ].join('\n'));

        console.assert(accountShortNameResult.result === 'OK');
        const { accountShortName } = accountShortNameResult;

        const getEnvironmentResult = getEnvironment({ config, accountShortName });

        if (getEnvironmentResult.result === 'UNKNOWN_ENVIRONMENT') this.error([
            `The accountShortName "${accountShortName}" does not exist in the configuration file.`,
        ].join('\n'));

        console.assert(getEnvironmentResult.result === 'OK');
        const { environment } = getEnvironmentResult;

        this.log('Verifying Cloud Integration Configurations...');

        for (const { packageId, ignoredArtifactIds } of config.managedIntegrationPackages ?? []) {
            this.log('');

            // Load the packageSecrets from the configuration file
            const artifactVariables = await getArtifactVariables({ accountShortName });

            ux.action.start(`Verifying configurations for package "${packageId}"...`);

            const packageArtifacts = await getPackageIntergrationArtifacts(environment, packageId);

            let comparisonCounter = 0;
            const warnings: string[] = [];
            for (const artifact of packageArtifacts) {
                // Check if the artifact is ignored in the configuration
                if (ignoredArtifactIds.includes(artifact.Id)) continue;

                const locallyManagedArtifactResult = await getLocallyManagedArtifact({
                    packageId,
                    artifactId: artifact.Id,
                })

                if (locallyManagedArtifactResult.result === 'ARTIFACT_CONFIGURATION_NOT_FOUND') this.error([
                    `🚨 No local configurations found for artifact "${artifact.Id}"!`,
                    'Run the following command to update the local configurations:',
                    `@TODO`,
                ].join('\n'));

                console.assert(locallyManagedArtifactResult.result === 'OK');
                const locallyManagedArtifact = locallyManagedArtifactResult.artifactConfiguration;

                // Get the local and remote configurtions for this artifact
                const localConfigurationsResult = await getLatestLocalArtifactConfigurations({
                    packageId,
                    artifactId: artifact.Id,
                    locallyManagedArtifact
                });

                if (localConfigurationsResult.result === 'NO_LOCAL_CONFIGURATIONS') this.error([
                    `🚨 No local configurations found for artifact "${artifact.Id}"!`,
                    'Run the following command to update the local configurations:',
                    `@TODO`,
                ].join('\n'));

                console.assert(localConfigurationsResult.result === 'OK');
                const localConfigurations = localConfigurationsResult.artifactConfiguration;

                const remoteConfigurations = await getIntegrationArtifactConfigurations({
                    environment,
                    artifactId: artifact.Id,
                    artifactVersion: artifact.Version,
                    artifactVariables,
                });

                // Check if the remote artifact version is identical to the local artifact configuration version
                const isLocalConfigurationUpToDate = localConfigurations.artifactVersion === artifact.Version;
                if (!isLocalConfigurationUpToDate && !flags.safeUpdate) {
                    this.error(new Error([
                        `🚨 Remote artifact version "${artifact.Version}" for artifact "${artifact.Id}" does not match latest local configuration version "${localConfigurations.artifactVersion}"!`,
                        'Run the following command to update the local configurations to the newest version:',
                        `npx scicm update --accountShortName=${accountShortName} --packageId=${packageId} --artifactId=${artifact.Id}`,
                        'Alternatively, run this command with the "--safeUpdate" flag to update the local configuration versions, as long as their configurations are unchanged:',
                        `npx scicm verify --accountShortName=${accountShortName} --safeUpdate`,
                    ].join('\n')));
                }

                // Compare the local and remote configurations
                this.log(`Verifying ${remoteConfigurations.configurations.length}\tconfiguration(s) for artifact "${artifact.Id}"...`);
                const configurationComparison = compareArtifactConfigurations({
                    localConfigurations,
                    remoteConfigurations,
                });

                // Handle the comparison result
                switch (configurationComparison.result) {
                    case 'LOCAL_CONFIGURATION_MISSING':
                    case 'LOCAL_CONFIGURATION_MISMATCH': {
                        const { localValue, remoteValue, configurationKey } = configurationComparison;

                        if (isLocalConfigurationUpToDate) {
                            return this.error(new Error([
                                `🚨 Failed to verify configurations for artifact "${artifact.Id}" (v.${artifact.Version}): ${configurationComparison.result}`,
                                `The local configuration key "${configurationKey}" has a different value than the remote configuration value:`,
                                `Local Value:\t${localValue}`,
                                `Remote Value:\t${remoteValue}`,
                                '\nIf you are sure the remote configuration is correct, you can force-update the local configuration with:',
                                `npx scicm update --force --accountShortName=${accountShortName} --packageId=${packageId} --artifactId=${artifact.Id}`,
                            ].join('\n')),)
                        }

                        return this.error(new Error([
                            `🚨 Failed to verify configurations for artifact "${artifact.Id}" (v.${artifact.Version}): ${configurationComparison.result}`,
                            `The local configuration for artifact "${artifact.Id}" (v.${artifact.Version}) is out of date!`,
                            `The remote artifact is now updated with new different configurations on (v${artifact.Version}).`,
                            'Run the following command to update the local configurations to the newest version:',
                            `npx scicm update --accountShortName=${accountShortName} --packageId=${packageId} --artifactId=${artifact.Id}`,
                        ].join('\n')));

                    }

                    case 'OK': { break; }
                    default: { return exhaustiveSwitchGuard(configurationComparison); }
                }

                // If we've made it this far, the local and remote configurations are identical
                console.assert(configurationComparison.result === 'OK');

                // If the remote configuration version is newer than the local configuration version, push the new version to the local configuration
                if (!isLocalConfigurationUpToDate && flags.safeUpdate) {
                    if (localConfigurations.artifactVersion >= artifact.Version) {
                        this.error(new Error([
                            `Failed to safely update local configurations for artifact "${artifact.Id}"!`,
                            `The local configurations (v.${localConfigurations.artifactVersion}) is already newer than the remote configurations (v.${remoteConfigurations.artifactVersion}).`,
                            '\nIf you are sure the remote configuration is correct, you can force-update the local configuration with:\n',
                            `npx scicm update --force --accountShortName=${accountShortName} --packageId=${packageId} --artifactId=${artifact.Id}`,
                        ].join('\n')));
                    }

                    this.log(`Local configurations for artifact "${artifact.Id}" are out of date!`);
                    // Update the local configuration version to the remote configuration version
                    await pushConfigurationVersion({
                        packageId,
                        artifactId: artifact.Id,
                        artifactVersion: remoteConfigurations.artifactVersion,
                        configurations: remoteConfigurations.configurations,
                        locallyManagedArtifact,
                    });
                    this.log(`Safely updated local configuration version for artifact "${artifact.Id}" from (v.${localConfigurations.artifactVersion}) to (v.${remoteConfigurations.artifactVersion})!\n`);
                }

                // If there are any warning, remember them for later
                for (const unusedLocalConfigurationKey of configurationComparison.unusedLocalConfigurationKeys) {
                    warnings.push(`Local configuration key "${unusedLocalConfigurationKey}" from artifact "${artifact.Id}" (v.${artifact.Version}) is not present in the remote configuration.`);
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
