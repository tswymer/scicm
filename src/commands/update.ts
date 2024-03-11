import { Command, Flags, ux } from '@oclif/core';

import { compareArtifactConfigurations } from '../utils/artifact-configuration.js';
import { getLatestLocalArtifactConfigurations, overwriteExistingConfigurationVersion, pushConfigurationVersion } from '../utils/artifact-management.js';
import { getArtifactVariables } from '../utils/artifact-variables.js';
import { selectAccountShortName, selectManagedIntegrationPackage, selectRemoteIntegrationArtifact } from '../utils/cli-utils.js';
import { getIntegrationArtifactConfigurations, getIntegrationPackages, getPackageIntergrationArtifacts } from '../utils/cloud-integration.js';
import { getConfig, getEnvironment } from '../utils/scicm-configuration.js';

export default class UpdateConfiguration extends Command {
    static flags = {
        accountShortName: Flags.string({ description: 'the accountShortName to verify configurations for' }),
        packageId: Flags.string({ description: 'the integration packageId of the artifact to update.' }),
        artifactId: Flags.string({ description: 'the artifactId of the artifact to update.' }),
        force: Flags.boolean({ char: 'f', description: 'force the update of the artifact configuration.' }),
    }

    async run(): Promise<void> {
        const { flags } = await this.parse(UpdateConfiguration);
        const config = await getConfig();

        // Get the accountShortName from the user
        const accountShortNameResult = await selectAccountShortName({
            config,
            defaultAccountShortName: flags.accountShortName,
        });

        if (accountShortNameResult.result === 'NOT_MONITORED') this.error([
            `The accountShortName "${flags.accountShortName}" is not monitored in the configuration file.`
        ].join('\n'));

        console.assert(accountShortNameResult.result === 'OK');
        const { accountShortName } = accountShortNameResult;

        const getEnvironmentResult = getEnvironment({
            config,
            accountShortName,
        });

        if (getEnvironmentResult.result === 'UNKNOWN_ENVIRONMENT') this.error([
            `The accountShortName "${accountShortName}" does not exist in the configuration file.`,
        ].join('\n'));

        console.assert(getEnvironmentResult.result === 'OK');
        const { environment } = getEnvironmentResult;

        const artifactVariables = await getArtifactVariables({ accountShortName });

        // Get the integration package to add from the user
        ux.action.start('Loading integration packages from SAP CI...');
        const integrationPackages = await getIntegrationPackages(environment);
        ux.action.stop();

        // Get the integration package to update from the user
        const managedIntegrationPackageResult = await selectManagedIntegrationPackage({
            config,
            defaultPackageId: flags.packageId,
            integrationPackages,
        });

        if (managedIntegrationPackageResult.result === 'NOT_MONITORED') this.error([
            `The packageId "${flags.packageId}" is not monitored in the configuration file.`
        ].join('\n'));

        console.assert(managedIntegrationPackageResult.result === 'OK');
        const { managedIntegrationPackage } = managedIntegrationPackageResult;

        // Get the artifact to update the configurations for
        ux.action.start(`Loading integration artifacts for package "${managedIntegrationPackage.packageId}" from SAP CI...`);
        const remoteArtifacts = await getPackageIntergrationArtifacts(environment, managedIntegrationPackage.packageId);
        ux.action.stop();

        // Get the artifact to update the configurations for
        const remoteArtifactResult = await selectRemoteIntegrationArtifact({
            remoteArtifacts,
            managedIntegrationPackage,
            defaultArtifactId: flags.artifactId,
        });

        if (remoteArtifactResult.result === 'UNKNOWN_ARTIFACT_ID') this.error([
            `The artifactId "${flags.artifactId}" does not exist in the integration package "${managedIntegrationPackage.packageId}".`
        ].join('\n'));
        if (remoteArtifactResult.result === 'NOT_MONITORED') this.error([
            `The artifactId "${flags.artifactId}" is not currently monitored by this scicm project.`,
            'Run the following command start monitoring the artifact configurations:',
        ].join('\n'));

        console.assert(remoteArtifactResult.result === 'OK');
        const { remoteArtifact } = remoteArtifactResult;

        // Get the local and remote configurtions for this artifact
        const latestLocalConfigurationsResult = await getLatestLocalArtifactConfigurations({
            packageId: managedIntegrationPackage.packageId,
            artifactId: remoteArtifact.Id
        });

        if (latestLocalConfigurationsResult.result === 'NO_LOCAL_CONFIGURATIONS') this.error([
            `No local configurations found for artifact "${remoteArtifact.Id}" in package "${managedIntegrationPackage.packageId}".\n`,
            `Run the following command to add configurations for this artifact:`,
            `@TODO`,
        ].join('\n'));

        console.assert(latestLocalConfigurationsResult.result === 'OK');
        const { artifactConfiguration: latestLocalConfigurations } = latestLocalConfigurationsResult;

        const remoteConfigurations = await getIntegrationArtifactConfigurations({
            environment,
            artifactId: remoteArtifact.Id,
            artifactVersion: remoteArtifact.Version,
            artifactVariables,
        });

        // Check if the remote artifact version exists locally
        const remoteVersionExistsLocally = latestLocalConfigurations.artifactVersion === remoteArtifact.Version;

        // If the remote version doesn't exist locally yet, update it and we are done
        if (!remoteVersionExistsLocally) {
            // Check if the remote version is newer than the local one
            if (latestLocalConfigurations.artifactVersion > remoteArtifact.Version) {
                this.error([
                    `🚨 The newest local artifact configuration for "${remoteArtifact.Id}" (v.${latestLocalConfigurations.artifactVersion}) is newer than the remote one (v.${remoteArtifact.Version}).`,
                    `This probably happened because a remote integration artifact was reverted to a previous version.`,
                    `Please remove the newer local configurations and run the command again to update the configurations.`,
                ].join('\n'));
            }

            await pushConfigurationVersion({
                packageId: managedIntegrationPackage.packageId,
                artifactId: remoteArtifact.Id,
                artifactVersion: remoteArtifact.Version,
                configurations: remoteConfigurations.configurations,
            });
            this.log(`⬆️ Updated local configurations for artifact "${remoteArtifact.Id}" to new version (v.${remoteArtifact.Version})!`);
            return;
        }

        // Check if the remote artifact version exists locally
        if (remoteVersionExistsLocally) {
            this.log(`Artifact version (v.${remoteArtifact.Version}) already exists locally.`);

            // If it does, compare it's configuration values against the local ones
            const configurationComparison = compareArtifactConfigurations({
                localConfigurations: latestLocalConfigurations,
                remoteConfigurations,
            });

            if (configurationComparison.result === 'OK') {
                this.warn([
                    `The local artifact configuration for "${remoteArtifact.Id}" is already up to date (v.${remoteArtifact.Version}).`,
                    `No changes are required.`,
                ].join('\n'));
                return;
            }

            // If the don't match and we aren't force updating, error out
            if (!flags.force) {
                this.error([
                    `🚨 The local artifact configuration for "${remoteArtifact.Id}" is not safe to update, as it's local configuration differs from the remote one, even though their version (v.${remoteArtifact.Version})is the same. (${configurationComparison.result})`,
                    `Run the command with the --force flag to update the local configuration:`,
                    `npx scicm update ${accountShortName} ${managedIntegrationPackage.packageId} ${remoteArtifact.Id} --force`,
                ].join('\n'));
            }

            // Forcefully update the local configuration
            await overwriteExistingConfigurationVersion({
                packageId: managedIntegrationPackage.packageId,
                artifactId: remoteArtifact.Id,
                artifactVersion: remoteArtifact.Version,
                configurations: remoteConfigurations.configurations,
            });
            this.log(`♻️ Overwrote existing local artifact configurations for "${remoteArtifact.Id}" (v.${remoteArtifact.Version}) with new remote values!`);
        }
    }
}
