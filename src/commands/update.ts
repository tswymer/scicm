import { select } from '@inquirer/prompts';
import { Command, Flags, ux } from '@oclif/core';

import { compareArtifactConfigurations } from '../utils/artifact-configuration.js';
import { getLatestLocalArtifactConfigurations, overwriteExistingConfigurationVersion, pushConfigurationVersion } from '../utils/artifact-management.js';
import { getArtifactVariables } from '../utils/artifact-variables.js';
import { selectAccountShortName } from '../utils/cli-utils.js';
import { getIntegrationArtifactConfigurations, getIntegrationPackages, getIntergrationPackageArtifacts } from '../utils/cloud-integration.js';
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

        const accountShortName = await selectAccountShortName({
            config,
            defaultAccountShortName: flags.accountShortName,
        });

        const environment = getEnvironment(config, accountShortName);
        const artifactVariables = await getArtifactVariables(accountShortName);

        // Get the integration package to add from the user
        ux.action.start('Loading integration packages from SAP CI...');
        const integrationPackages = await getIntegrationPackages(environment);
        ux.action.stop();

        // Get the package to update the configurations from
        const packageId = flags.packageId ?? await select({
            message: 'Select an Intergration Package to start managing configuration for:',
            choices: integrationPackages.map(pkg => ({
                value: pkg.id,
                name: `[${pkg.id}]:\t${pkg.name ?? '_Unnamed_Package_'}`,
            })),
        });

        // Get the artifact to update the configurations for
        const managedIntegrationArtifact = config.managedIntegrationPackages?.find(monitoredPackage => monitoredPackage.packageId === packageId);
        if (!managedIntegrationArtifact) this.error([
            `The integration package ${packageId} is not being monitored.`,
            `Run "npx scicm add package --accountShortName=${accountShortName} --packageId=${packageId}" to start monitoring it.`,
        ].join('\n'));

        // Get the artifact to update the configurations for
        ux.action.start(`Loading integration artifacts for package "${packageId}" from SAP CI...`);
        const remoteArtifacts = await getIntergrationPackageArtifacts(environment, packageId);
        ux.action.stop();

        // Remove the ignored artifacts from the artifacts list
        const monitoredArtifacts = remoteArtifacts.filter(remoteArtifact => !managedIntegrationArtifact.ignoredArtifactIds.includes(remoteArtifact.Id));

        // Get the artifact to update the configurations for
        const artifactId = flags.artifactId ?? await select({
            message: 'Select an Intergration Artifact to update configurations for:',
            choices: monitoredArtifacts.map(artifact => ({
                value: artifact.Id,
                name: `[${artifact.Id}]:\t${artifact.Name ?? '_Unnamed_Artifact_'}`,
            })),
        });

        // Double check that the artifact id is being monitored
        if (!monitoredArtifacts.some(monitoredArtifacts => monitoredArtifacts.Id === artifactId)) {
            this.error([
                `The artifact "${artifactId}" is not being monitored in the package "${packageId}".`,
                `Run "npx scicm add package --accountShortName=${accountShortName} --packageId ${packageId}" to start monitoring it.`,
            ].join('\n'));
        }

        // Find the remote artifact
        const remoteArtifact = remoteArtifacts.find(artifact => artifact.Id === artifactId);
        if (!remoteArtifact) this.error(`🚨 Artifact "${artifactId}" does not exist in the package "${packageId}"!`);

        // Get the local and remote configurtions for this artifact
        const localConfigurations = await getLatestLocalArtifactConfigurations({ packageId, artifactId });
        const remoteConfigurations = await getIntegrationArtifactConfigurations({
            environment,
            artifactId,
            artifactVersion: remoteArtifact.Version,
            artifactVariables,
        });

        // Check if the remote artifact version exists locally
        const remoteVersionExistsLocally = localConfigurations.artifactVersion === remoteArtifact.Version;

        // If the remote version doesn't exist locally yet, update it and we are done
        if (!remoteVersionExistsLocally) {
            // Check if the remote version is newer than the local one
            if (localConfigurations.artifactVersion > remoteArtifact.Version) {
                this.error([
                    `🚨 The newest local artifact configuration for "${artifactId}" (v.${localConfigurations.artifactVersion}) is newer than the remote one (v.${remoteArtifact.Version}).`,
                    `This probably happened because a remote integration artifact was reverted to a previous version.`,
                    `Please remove the newer local configurations and run the command again to update the configurations.`,
                ].join('\n'));
            }

            await pushConfigurationVersion({
                packageId,
                artifactId,
                artifactVersion: remoteArtifact.Version,
                configurations: remoteConfigurations.configurations,
            });
            this.log(`⬆️ Updated local configurations for artifact "${artifactId}" to new version (v.${remoteArtifact.Version})!`);
            return;
        }

        // Check if the remote artifact version exists locally
        if (remoteVersionExistsLocally) {
            this.log(`Artifact version (v.${remoteArtifact.Version}) already exists locally.`);

            // If it does, compare it's configuration values against the local ones
            const configurationComparison = compareArtifactConfigurations({
                localConfigurations,
                remoteConfigurations,
            });

            if (configurationComparison.result === 'OK') {
                this.warn([
                    `The local artifact configuration for "${artifactId}" is already up to date (v.${remoteArtifact.Version}).`,
                    `No changes are required.`,
                ].join('\n'));
                return;
            }

            // If the don't match and we aren't force updating, error out
            if (!flags.force) {
                this.error([
                    `🚨 The local artifact configuration for "${artifactId}" is not safe to update, as it's local configuration differs from the remote one, even though their version (v.${remoteArtifact.Version})is the same. (${configurationComparison.result})`,
                    `Run the command with the --force flag to update the local configuration:`,
                    `npx scicm update ${accountShortName} ${packageId} ${artifactId} --force`,
                ].join('\n'));
            }

            // Forcefully update the local configuration
            await overwriteExistingConfigurationVersion({
                packageId,
                artifactId,
                artifactVersion: remoteArtifact.Version,
                configurations: remoteConfigurations.configurations,
            });
            this.log(`♻️ Overwrote existing local artifact configurations for "${artifactId}" (v.${remoteArtifact.Version}) with new remote values!`);
        }
    }
}
