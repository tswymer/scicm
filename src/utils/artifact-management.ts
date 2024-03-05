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

export async function getManagedArtifact(packageId: string, artifactId: string) {
    // Get the artifact configuration
    const artifactConfigurationFilePath = join(process.cwd(), 'configuration', packageId, `${artifactId}.json`);
    if (!await access(artifactConfigurationFilePath).then(() => true).catch(() => false)) {
        throw new Error(`Artifact configuration "${artifactConfigurationFilePath}" does not exist.`);
    }

    return managedArtifactSchema.parse(JSON.parse(await readFile(artifactConfigurationFilePath, 'utf8')));
}

export async function pushConfigurationVersion(packageId: string, artifactId: string, artifactVersion: string, configurations: z.infer<typeof integrationArtifactConfigurationSchema>[]) {
    // Get the artifact configuration
    const localArtifactConfiguration = await getManagedArtifact(packageId, artifactId);

    // Add the new configuration
    const createdAt = new Date().toISOString();
    localArtifactConfiguration.artifactConfigurations.push({
        _createdAt: createdAt,
        artifactVersion,
        configurations,
    });

    // Write the updated configuration
    const artifactConfigurationFilePath = join(process.cwd(), 'configuration', packageId, `${artifactId}.json`);
    await writeFile(artifactConfigurationFilePath, JSON.stringify(localArtifactConfiguration, null, 2));
}

export async function getNewestLocalArtifactConfigurations(packageId: string, artifactId: string) {
    const artifactConfiguration = await getManagedArtifact(packageId, artifactId);

    // Sort the artifact configurations by version
    artifactConfiguration.artifactConfigurations.sort((a, b) => a.artifactVersion.localeCompare(b.artifactVersion));

    // Get the newest artifact configurations by version
    const newestArtifactConfiguration = artifactConfiguration.artifactConfigurations.at(-1);
    if (!newestArtifactConfiguration) throw new Error(`No local configurations found for artifact "${artifactId}" from package "${packageId}".`);

    // Sanity check that there is a version
    if (!newestArtifactConfiguration.artifactVersion) throw new Error(`No artifact version found for "${artifactId}" from package "${packageId}".`);

    return newestArtifactConfiguration;
}
