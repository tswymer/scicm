import { Command } from "@oclif/core";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

import { getIntegrationDesigntimeArtifactConfigurations, integrationDesigntimeArtifactConfigurationSchema } from "./ci.js";

const artifactConfigurationsSchema = z.object({
    _createdAt: z.string().datetime(),
    artifactId: z.string(),
    artifactConfigurations: z.array(z.object({
        _createdAt: z.string().datetime(),
        artifactVersion: z.string(),
        configurations: z.array(integrationDesigntimeArtifactConfigurationSchema),
    })),
});

export async function createLocalArtifactConfiguration(command: Command, packageId: string, artifactConfiguration: z.infer<typeof artifactConfigurationsSchema>) {
    // Check if the integration package directory exists in the "configuration" directory
    const integrationPackageDirectoryPath = join(process.cwd(), 'configuration', packageId);
    const integrationPackageDirectoryExists = await access(integrationPackageDirectoryPath).then(() => true).catch(() => false);
    if (!integrationPackageDirectoryExists) await mkdir(integrationPackageDirectoryPath, { recursive: true });

    // Check there isn't already a configuration for the artifact
    const artifactConfigurationFilePath = join(integrationPackageDirectoryPath, `${artifactConfiguration.artifactId}.json`);
    if (await access(artifactConfigurationFilePath).then(() => true).catch(() => false)) {
        command.error(`Artifact configuration "${artifactConfigurationFilePath}" already exists.`);
    }

    // Create the initial artifact configuration file
    await writeFile(artifactConfigurationFilePath, JSON.stringify(artifactConfiguration, null, 2));
    command.log(`✅ Exported ${artifactConfiguration.artifactConfigurations.at(0)?.configurations.length ?? 0}\tconfiguration(s) for "${artifactConfiguration.artifactId}"`);
}

export async function getNewestLocalArtifactConfigurations(command: Command, packageId: string, artifactId: string) {
    // Get the artifact configuration
    const artifactConfigurationFilePath = join(process.cwd(), 'configuration', packageId, `${artifactId}.json`);
    if (!await access(artifactConfigurationFilePath).then(() => true).catch(() => false)) {
        command.error(`Artifact configuration "${artifactConfigurationFilePath}" does not exist.`);
    }

    const artifactConfiguration = artifactConfigurationsSchema.parse(JSON.parse(await readFile(artifactConfigurationFilePath, 'utf8')));

    // Sort the artifact configurations by version
    artifactConfiguration.artifactConfigurations.sort((a, b) => a.artifactVersion.localeCompare(b.artifactVersion));

    if (artifactConfiguration.artifactConfigurations.length > 1) {
        command.warn(artifactConfiguration.artifactConfigurations.map(artifactConfiguration => `${artifactConfiguration.artifactVersion}`).join('\n'));
    }

    // Get the newest artifact configurations by version
    const newestArtifactConfiguration = artifactConfiguration.artifactConfigurations.at(-1);

    if (!newestArtifactConfiguration) {
        command.error(new Error([
            `No local configurations found for artifact "${artifactId}" from package "${packageId}".`,
            'Please run the "add:package" command to add the artifact to the configuration.'
        ].join('\n')));
    }

    return newestArtifactConfiguration;
}

type CompareArtifactConfigurationsOptions = {
    artifactVersion: string;
    newestLocalConfigurations: Awaited<ReturnType<typeof getNewestLocalArtifactConfigurations>>;
    remoteConfigurations: Awaited<ReturnType<typeof getIntegrationDesigntimeArtifactConfigurations>>;
};

type CompareArtifactConfigurationResponse =
    | { comparisonCount: number, type: 'OK', unusedLocalConfigurationKeys: string[] }
    | { configurationKey: string, localValue: string, remoteValue: string, type: "LOCAL_CONFIGURATION_MISMATCH" | "LOCAL_CONFIGURATION_MISSING" }
    | { type: "NO_LOCAL_ARTIFACT_VERSION" };

export function compareArtifactConfigurations({ artifactVersion, newestLocalConfigurations, remoteConfigurations: remoteConfigurationsWithVersion }: CompareArtifactConfigurationsOptions): CompareArtifactConfigurationResponse {
    // Check if the remote artifact version is identical to the local artifact configuration version
    const hasIdenticalVersionConfiguration = newestLocalConfigurations.artifactVersion === artifactVersion;
    if (!hasIdenticalVersionConfiguration) return { type: 'NO_LOCAL_ARTIFACT_VERSION' }

    // Get the configurations from the remote artifact
    const { configurations: remoteConfigurations } = remoteConfigurationsWithVersion;

    // For every local configuration, compare it the remote configuration
    let comparisonCount = 0;
    const unusedLocalConfigurationKeys: string[] = [];
    for (const localConfiguration of newestLocalConfigurations.configurations ?? []) {
        const remoteConfigurationIndex = remoteConfigurations.findIndex(remoteConfiguration => remoteConfiguration.ParameterKey === localConfiguration.ParameterKey);
        if (remoteConfigurationIndex === -1) {
            unusedLocalConfigurationKeys.push(localConfiguration.ParameterKey);
            continue;
        }

        const remoteConfigurationValue = remoteConfigurations.at(remoteConfigurationIndex)?.ParameterValue;
        if (remoteConfigurationValue !== localConfiguration.ParameterValue) {
            return {
                type: 'LOCAL_CONFIGURATION_MISMATCH',
                configurationKey: localConfiguration.ParameterKey,
                localValue: localConfiguration.ParameterValue,
                remoteValue: remoteConfigurationValue ?? '<not_defined>',
            }
        }

        remoteConfigurations.splice(remoteConfigurationIndex, 1);
        comparisonCount++;
    }

    // If there are name more remote configurations, that means we are missing 
    // them locally. Throw an error for each missing configuration (only the first one is thrown)
    // eslint-disable-next-line no-unreachable-loop -- It's fine here, we don't want this loop to run unless there are remaining remote configuration
    for (const remainingRemoteConfiguration of remoteConfigurations) {
        return {
            type: 'LOCAL_CONFIGURATION_MISSING',
            configurationKey: remainingRemoteConfiguration.ParameterKey,
            localValue: '<not_defined>',
            remoteValue: remainingRemoteConfiguration.ParameterValue,
        }
    }

    return { type: 'OK', comparisonCount, unusedLocalConfigurationKeys };
}
