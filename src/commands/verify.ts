import { select } from '@inquirer/prompts';
import { Command, Flags, ux } from '@oclif/core';

import { compareArtifactConfigurations } from '../utils/artifact-configuration.js';
import { getLatestLocalArtifactConfigurations, pushConfigurationVersion } from '../utils/artifact-management.js';
import { getArtifactVariables } from '../utils/artifact-variables.js';
import { buildCIODataURL, getIntegrationArtifactConfigurations, getIntergrationPackageArtifacts } from '../utils/cloud-integration.js';
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

        // Get the accountShortName to update the configurations from
        const accountShortName = flags.accountShortName ?? await select({
            message: 'Select the environment to add the integration package from:',
            choices: config.integrationEnvironments.map(environment => ({
                value: environment.accountShortName,
                name: `${buildCIODataURL({
                    accountShortName: environment.accountShortName,
                    region: environment.region,
                    sslHost: environment.sslHost,
                })}`,
            })),
        });

        const environment = getEnvironment(config, accountShortName);

        this.log('Verifying Cloud Integration Configurations...');

        for (const { packageId, ignoredArtifactIds } of config.managedIntegrationPackages ?? []) {
            this.log('');

            // Load the packageSecrets from the configuration file
            const artifactVariables = await getArtifactVariables(accountShortName);

            ux.action.start(`Verifying configurations for package "${packageId}"...`);

            const packageArtifacts = await getIntergrationPackageArtifacts(environment, packageId);

            let comparisonCounter = 0;
            const warnings: string[] = [];
            for (const packageArtifact of packageArtifacts) {
                // Check if the artifact is ignored in the configuration
                if (ignoredArtifactIds.includes(packageArtifact.Id)) continue;

                // Get the local and remote configurtions for this artifact
                const localConfigurations = await getLatestLocalArtifactConfigurations({
                    packageId,
                    artifactId: packageArtifact.Id,
                });
                const remoteConfigurations = await getIntegrationArtifactConfigurations({
                    environment,
                    artifactId: packageArtifact.Id,
                    artifactVersion: packageArtifact.Version,
                    artifactVariables,
                });

                // Check if the remote artifact version is identical to the local artifact configuration version
                const isLocalConfigurationUpToDate = localConfigurations.artifactVersion === packageArtifact.Version;
                if (!isLocalConfigurationUpToDate && !flags.safeUpdate) {
                    this.error(new Error([
                        `🚨 Remote artifact version "${packageArtifact.Version}" for artifact "${packageArtifact.Id}" does not match latest local configuration version "${localConfigurations.artifactVersion}"!`,
                        'Run the following command to update the local configurations to the newest version:',
                        `npx cicm update --accountShortName=${accountShortName} --packageId=${packageId} --artifactId=${packageArtifact.Id}`,
                        'Alternatively, run this command with the "--safeUpdate" flag to update the local configuration versions, as long as their configurations are unchanged:',
                        `npx cicm verify --accountShortName=${accountShortName} --safeUpdate`,
                    ].join('\n')));
                }

                // Compare the local and remote configurations
                this.log(`Verifying ${remoteConfigurations.configurations.length}\tconfiguration(s) for artifact "${packageArtifact.Id}"...`);
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
                                `🚨 Failed to verify configurations for artifact "${packageArtifact.Id}" (v.${packageArtifact.Version}): ${configurationComparison.result}`,
                                `The local configuration key "${configurationKey}" has a different value than the remote configuration value:`,
                                `Local Value:\t${localValue}`,
                                `Remote Value:\t${remoteValue}`,
                                '\nIf you are sure the remote configuration is correct, you can force-update the local configuration with:',
                                `npx cicm update --force --accountShortName=${accountShortName} --packageId=${packageId} --artifactId=${packageArtifact.Id}`,
                            ].join('\n')),)
                        }

                        return this.error(new Error([
                            `🚨 Failed to verify configurations for artifact "${packageArtifact.Id}" (v.${packageArtifact.Version}): ${configurationComparison.result}`,
                            `The local configuration for artifact "${packageArtifact.Id}" (v.${packageArtifact.Version}) is out of date!`,
                            `The remote artifact is now updated with new different configurations on (v${packageArtifact.Version}).`,
                            'Run the following command to update the local configurations to the newest version:',
                            `npx cicm update --accountShortName=${accountShortName} --packageId=${packageId} --artifactId=${packageArtifact.Id}`,
                        ].join('\n')));

                    }

                    case 'OK': { break; }
                    default: { return exhaustiveSwitchGuard(configurationComparison); }
                }

                // If we've made it this far, the local and remote configurations are identical
                console.assert(configurationComparison.result === 'OK');

                // If the remote configuration version is newer than the local configuration version, push the new version to the local configuration
                if (!isLocalConfigurationUpToDate && flags.safeUpdate) {
                    if (localConfigurations.artifactVersion >= packageArtifact.Version) {
                        this.error(new Error([
                            `Failed to safely update local configurations for artifact "${packageArtifact.Id}"!`,
                            `The local configurations (v.${localConfigurations.artifactVersion}) is already newer than the remote configurations (v.${remoteConfigurations.artifactVersion}).`,
                            '\nIf you are sure the remote configuration is correct, you can force-update the local configuration with:\n',
                            `npx cicm update --force --accountShortName=${accountShortName} --packageId=${packageId} --artifactId=${packageArtifact.Id}`,
                        ].join('\n')));
                    }

                    this.log(`Local configurations for artifact "${packageArtifact.Id}" are out of date!`);
                    // Update the local configuration version to the remote configuration version
                    await pushConfigurationVersion({
                        packageId,
                        artifactId: packageArtifact.Id,
                        artifactVersion: remoteConfigurations.artifactVersion,
                        configurations: remoteConfigurations.configurations,
                    });
                    this.log(`Safely updated local configuration version for artifact "${packageArtifact.Id}" from (v.${localConfigurations.artifactVersion}) to (v.${remoteConfigurations.artifactVersion})!\n`);
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
