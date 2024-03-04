import { Command } from "@oclif/core";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

import { cpiEnvironment } from "./cicm-configuration.js";
import { getIntegrationDesigntimeArtifactConfigurations, integrationDesigntimeArtifactConfigurationSchema } from "./cpi.js";

const artifactConfigurationsSchema = z.object({
    _createdAt: z.string().datetime(),
    artifactId: z.string(),
    artifactConfigurations: z.array(z.object({
        _createdAt: z.string().datetime(),
        artifactVersion: z.string(),
        configurations: z.array(integrationDesigntimeArtifactConfigurationSchema),
    })),
});

export async function createLocalArtifactConfiguration(command: Command, integrationPackageId: string, artifactConfiguration: z.infer<typeof artifactConfigurationsSchema>) {
    // Check if the integration package directory exists in the "configuration" directory
    const integrationPackageDirectoryPath = join(process.cwd(), 'configuration', integrationPackageId);
    const integrationPackageDirectoryExists = await access(integrationPackageDirectoryPath).then(() => true).catch(() => false);
    if (!integrationPackageDirectoryExists) await mkdir(integrationPackageDirectoryPath, { recursive: true });

    // Check there isn't already a configuration for the artifact
    const artifactConfigurationFilePath = join(integrationPackageDirectoryPath, `${artifactConfiguration.artifactId}.json`);
    if (await access(artifactConfigurationFilePath).then(() => true).catch(() => false)) {
        command.error(`Artifact configuration "${artifactConfigurationFilePath}" already exists.`);
    }

    // Create the initial artifact configuration file
    await writeFile(artifactConfigurationFilePath, JSON.stringify(artifactConfiguration, null, 2));
    command.log(`📝 Exported ${artifactConfiguration.artifactConfigurations.at(0)?.configurations.length ?? 0} configuration(s) for "${artifactConfiguration.artifactId}"`);
}

export async function getLocalArtifactConfiguration(command: Command, integrationPackageId: string, artifactId: string) {
    // Get the artifact configuration
    const artifactConfigurationFilePath = join(process.cwd(), 'configuration', integrationPackageId, `${artifactId}.json`);
    if (!await access(artifactConfigurationFilePath).then(() => true).catch(() => false)) {
        command.error(`Artifact configuration "${artifactConfigurationFilePath}" does not exist.`);
    }

    return artifactConfigurationsSchema.parse(JSON.parse(await readFile(artifactConfigurationFilePath, 'utf8')));
}

interface compareArtifactConfigurationsOptions {
    artifactId: string;
    artifactVersion: string;
    command: Command;
    environment: z.infer<typeof cpiEnvironment>;
    packageId: string;
}

export async function compareArtifactConfigurations({ command, packageId, artifactId, artifactVersion, environment }: compareArtifactConfigurationsOptions) {
    // Get the current configuration monitoring for the artifact, both locally and from CPI
    const localConfigurations = await getLocalArtifactConfiguration(command, packageId, artifactId);
    const remoteConfigurations = await getIntegrationDesigntimeArtifactConfigurations(environment, artifactId, artifactVersion);

    // Check if the remote artifact version is identical to the local artifact configuration version
    const hasIdenticalVersionConfiguration = localConfigurations.artifactConfigurations.find(localArtifactConfiguration => localArtifactConfiguration.artifactVersion === artifactVersion);

    if (!hasIdenticalVersionConfiguration) command.error(new Error([
        `No local artifact configurations for version ${artifactVersion} of integration artifact "${artifactId}" in package "${packageId}".`,
        'Please run the "add:package" command to add the artifact to the configuration.'
    ].join('\n')));

    // Get the newest local artifact configurations by version
    const newestLocalArtifactConfigurations = localConfigurations.artifactConfigurations.sort((a, b) => a.artifactVersion.localeCompare(b.artifactVersion)).pop();
    if (!newestLocalArtifactConfigurations) command.error('Failed to get the newest local artifact configurations.');

    command.log(`Verifying ${remoteConfigurations.length}\tconfiguration(s) for artifact "${artifactId}"...`);

    // For every local configuration, compare it the remote configuration
    for (const localConfiguration of newestLocalArtifactConfigurations?.configurations ?? []) {
        const remoteConfigurationIndex = remoteConfigurations.findIndex(remoteConfiguration => remoteConfiguration.ParameterKey === localConfiguration.ParameterKey);
        if (remoteConfigurationIndex === -1) {
            command.warn(`Configuration key "${localConfiguration.ParameterKey}" is not present in the remote configurations.`);
            continue;
        }

        const remoteConfigurationValue = remoteConfigurations.at(remoteConfigurationIndex)?.ParameterValue;
        if (remoteConfigurationValue !== localConfiguration.ParameterValue) {
            throw new Error([
                `🚨 Local configuration key "${localConfiguration.ParameterKey}" for artifact "${artifactId}" (v.${artifactVersion}) has a different value than the remote configuration value:`,
                `Local Value:\t${localConfiguration.ParameterValue}`,
                `Remote Value:\t${remoteConfigurationValue}`,
            ].join('\n'));
        }

        remoteConfigurations.splice(remoteConfigurationIndex, 1);
    }

    remoteConfigurations.forEach(remainingRemoteConfiguration => {
        command.error(`🚨 Integration artifact configuration key ${remainingRemoteConfiguration.ParameterKey} not present in the local configuration!`);
    });
}
