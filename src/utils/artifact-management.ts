import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

import { integrationArtifactConfigurationSchema } from "./cloud-integration.js";

const managedArtifactSchema = z.object({
    _createdAt: z.string().datetime(),
    artifactId: z.string(),
    artifactConfigurations: z.array(z.object({
        _createdAt: z.string().datetime(),
        artifactVersion: z.string(),
        configurations: z.array(integrationArtifactConfigurationSchema),
    })),
});

/**
 * Creates a new managed artifact configuration.
 */
export async function createManagedArtifact(packageId: string, artifactConfiguration: z.infer<typeof managedArtifactSchema>) {
    // Check if the integration package directory exists in the "configuration" directory
    const integrationPackageDirectoryPath = join(process.cwd(), 'configuration', packageId);
    const integrationPackageDirectoryExists = await access(integrationPackageDirectoryPath).then(() => true).catch(() => false);
    if (!integrationPackageDirectoryExists) await mkdir(integrationPackageDirectoryPath, { recursive: true });

    // Check there isn't already a configuration for the artifact
    const artifactConfigurationFilePath = join(integrationPackageDirectoryPath, `${artifactConfiguration.artifactId}.json`);
    if (await access(artifactConfigurationFilePath).then(() => true).catch(() => false)) {
        throw new Error(`Artifact configuration "${artifactConfigurationFilePath}" already exists.`);
    }

    // Create the initial artifact configuration file
    await writeFile(artifactConfigurationFilePath, JSON.stringify(artifactConfiguration, null, 2));
}

interface ArtifactIdentifier {
    artifactId: string;
    packageId: string;
}

/**
 * Builds the path to a managed artifact configuration file.
 */
function getManagedArtifactFilePath({ artifactId, packageId }: ArtifactIdentifier) {
    return join(process.cwd(), 'configuration', packageId, `${artifactId}.json`);
}

/**
 * Retrieve a managed artifact configuration.
 */
export async function getManagedArtifact({ artifactId, packageId }: ArtifactIdentifier) {
    // Get the artifact configuration
    const artifactConfigurationFilePath = getManagedArtifactFilePath({ artifactId, packageId });
    if (!await access(artifactConfigurationFilePath).then(() => true).catch(() => false)) {
        throw new Error(`Artifact configuration "${artifactConfigurationFilePath}" does not exist.`);
    }

    return managedArtifactSchema.parse(JSON.parse(await readFile(artifactConfigurationFilePath, 'utf8')));
}

interface UpdateConfigurationVersionParams extends ArtifactIdentifier {
    artifactVersion: string;
    configurations: z.infer<typeof integrationArtifactConfigurationSchema>[];
}

/**
 * Update an existing local artifact configuration version.
 */
export async function overwriteExistingConfigurationVersion({ artifactId, artifactVersion, configurations, packageId }: UpdateConfigurationVersionParams) {
    // Get the artifact configuration
    const localArtifactConfiguration = await getManagedArtifact({ packageId, artifactId });

    // Get the existing configuration
    const existingConfigurations = localArtifactConfiguration.artifactConfigurations.filter(config => config.artifactVersion === artifactVersion);
    if (existingConfigurations.length === 0) throw new Error(`No configurations found for version "${artifactVersion}" of artifact "${artifactId}" from package "${packageId}".`);
    if (existingConfigurations.length > 1) throw new Error(`Multiple configurations found for version "${artifactVersion}" of artifact "${artifactId}" from package "${packageId}".`);

    // Get the index of the existing configuration
    const existingConfigurationIndex = localArtifactConfiguration.artifactConfigurations.findIndex(config => config.artifactVersion === artifactVersion);
    if (existingConfigurationIndex === -1) throw new Error(`No configurations found for version "${artifactVersion}" of artifact "${artifactId}" from package "${packageId}".`);

    // Update the existing configuration
    localArtifactConfiguration.artifactConfigurations[existingConfigurationIndex]._createdAt = new Date().toISOString();
    localArtifactConfiguration.artifactConfigurations[existingConfigurationIndex].configurations = configurations;

    // Write the updated configuration
    const artifactConfigurationFilePath = getManagedArtifactFilePath({ packageId, artifactId });
    await writeFile(artifactConfigurationFilePath, JSON.stringify(localArtifactConfiguration, null, 2));
}

interface PushConfigurationVersionParams extends ArtifactIdentifier {
    artifactVersion: string;
    configurations: z.infer<typeof integrationArtifactConfigurationSchema>[];
}

/**
 * Add a new artifact configuration version.
 */
export async function pushConfigurationVersion({ artifactId, artifactVersion, configurations, packageId }: PushConfigurationVersionParams) {
    // Get the artifact configuration
    const localArtifactConfiguration = await getManagedArtifact({ packageId, artifactId });

    // Add the new configuration
    localArtifactConfiguration.artifactConfigurations.push({
        _createdAt: new Date().toISOString(),
        artifactVersion,
        configurations,
    });

    // Write the updated configuration
    const artifactConfigurationFilePath = getManagedArtifactFilePath({ packageId, artifactId });
    await writeFile(artifactConfigurationFilePath, JSON.stringify(localArtifactConfiguration, null, 2));
}

interface GetLatestLocalArtifactConfigurationsParams {
    artifactId: string;
    packageId: string;
}

export async function getLatestLocalArtifactConfigurations({ artifactId, packageId }: GetLatestLocalArtifactConfigurationsParams) {
    const artifactConfiguration = await getManagedArtifact({ packageId, artifactId });

    // Sort the artifact configurations by version
    artifactConfiguration.artifactConfigurations.sort((a, b) => a.artifactVersion.localeCompare(b.artifactVersion));

    // Get the latest artifact configurations by version
    const latestArtifactConfiguration = artifactConfiguration.artifactConfigurations.at(-1);
    if (!latestArtifactConfiguration) throw new Error(`No local configurations found for artifact "${artifactId}" from package "${packageId}".`);

    // Sanity check that there is a version
    if (!latestArtifactConfiguration.artifactVersion) throw new Error(`No artifact version found for "${artifactId}" from package "${packageId}".`);

    return latestArtifactConfiguration;
}
