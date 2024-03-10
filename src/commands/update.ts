import { Args, Command, Flags } from '@oclif/core';

import { compareArtifactConfigurations } from '../utils/artifact-configuration.js';
import { getLatestLocalArtifactConfigurations, overwriteExistingConfigurationVersion, pushConfigurationVersion } from '../utils/artifact-management.js';
import { getArtifactVariables } from '../utils/artifact-variables.js';
import { getConfig, getEnvironment } from '../utils/cicm-configuration.js';
import { getIntegrationArtifactConfigurations, getIntergrationPackageArtifacts } from '../utils/cloud-integration.js';

export default class UpdateConfiguration extends Command {
    static args = {
        accountShortName: Args.string({ required: true, description: 'the accountShortName to verify configurations for' }),
        packageId: Args.string({ required: true, description: 'the integration packageId of the artifact to update.' }),
        artifactId: Args.string({ required: true, description: 'the artifactId of the artifact to update.' }),
    }

    static flags = {
        force: Flags.boolean({ char: 'f', description: 'force the update of the artifact configuration.' }),
    }

    async run(): Promise<void> {
        const { args: { accountShortName, artifactId, packageId }, flags } = await this.parse(UpdateConfiguration);

        const config = await getConfig();
        const environment = getEnvironment(config, accountShortName);
        const artifactVariables = await getArtifactVariables(accountShortName);

        this.log(`Updating local artifact configurations for artifact "${artifactId}" from package "${packageId}"...`);

        // Get the package artifacts
        const remoteArtifacts = await getIntergrationPackageArtifacts(environment, packageId);

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
                    `npx cicm update ${accountShortName} ${packageId} ${artifactId} --force`,
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
