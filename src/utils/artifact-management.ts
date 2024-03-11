import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

import { integrationArtifactConfigurationSchema } from "./cloud-integration.js";

const locallyManagedArtifactSchema = z.object({
    _createdAt: z.string().datetime(),
    artifactId: z.string(),
    artifactConfigurations: z.array(z.object({
        _createdAt: z.string().datetime(),
        artifactVersion: z.string(),
        configurations: z.array(integrationArtifactConfigurationSchema),
    })),
});

type ArtifactIdentifier = {
    artifactId: string;
    packageId: string;
}

/**
 * Builds the path to a managed artifact configuration file.
 */
function getManagedArtifactFilePath({ artifactId, packageId }: ArtifactIdentifier) {
    return join(process.cwd(), 'configuration', packageId, `${artifactId}.json`);
}

type SortManagedArtifactConfigurationsParams = {
    locallyManagedArtifact: z.infer<typeof locallyManagedArtifactSchema>;
}

/**
 * Sorts the artifact configurations by version, high to low.
 */
function sortLocallyManagedArtifactConfigurations({ locallyManagedArtifact: managedArtifact }: SortManagedArtifactConfigurationsParams) {
    // Sort the artifact configurations by version
    managedArtifact.artifactConfigurations.sort((a, b) => {
        if (a.artifactVersion < b.artifactVersion) return 1;
        if (a.artifactVersion > b.artifactVersion) return -1;
        throw new Error(`Duplicate artifact versions found for "${managedArtifact.artifactId}" (v.${a.artifactVersion}).`);
    });
}

type CreateManagedArtifactParams = {
    artifactConfiguration: z.infer<typeof locallyManagedArtifactSchema>;
    packageId: string;
}

type CreateManagedArtifactResponse = {
    result: 'ARTIFACT_CONFIGURATION_EXISTS';
} | {
    result: 'OK';
};

/**
 * Creates a new managed artifact configuration.
 */
export async function createManagedArtifact({ artifactConfiguration, packageId }: CreateManagedArtifactParams): Promise<CreateManagedArtifactResponse> {
    // Check if the integration package directory exists in the "configuration" directory
    const integrationPackageDirectoryPath = join(process.cwd(), 'configuration', packageId);
    const integrationPackageDirectoryExists = await access(integrationPackageDirectoryPath).then(() => true).catch(() => false);
    if (!integrationPackageDirectoryExists) await mkdir(integrationPackageDirectoryPath, { recursive: true });

    // Check there isn't already a configuration for the artifact
    const artifactConfigurationFilePath = join(integrationPackageDirectoryPath, `${artifactConfiguration.artifactId}.json`);
    if (await access(artifactConfigurationFilePath).then(() => true).catch(() => false)) return { result: 'ARTIFACT_CONFIGURATION_EXISTS' };

    // Create the initial artifact configuration file
    await writeFile(artifactConfigurationFilePath, JSON.stringify(artifactConfiguration, null, 2));

    return { result: 'OK' };
}

type GetLocallyManagedArtifactResult = {
    artifactConfiguration: z.infer<typeof locallyManagedArtifactSchema>;
    result: 'OK';
} | {
    result: 'ARTIFACT_CONFIGURATION_NOT_FOUND';
};

/**
 * Retrieve a managed artifact configuration.
 */
export async function getLocallyManagedArtifact({ artifactId, packageId }: ArtifactIdentifier): Promise<GetLocallyManagedArtifactResult> {
    // Get the artifact configuration
    const artifactConfigurationFilePath = getManagedArtifactFilePath({ artifactId, packageId });
    if (!await access(artifactConfigurationFilePath).then(() => true).catch(() => false)) return { result: 'ARTIFACT_CONFIGURATION_NOT_FOUND' };

    return {
        artifactConfiguration: locallyManagedArtifactSchema.parse(JSON.parse(await readFile(artifactConfigurationFilePath, 'utf8'))),
        result: 'OK',
    };
}

interface UpdateConfigurationVersionParams extends ArtifactIdentifier {
    artifactVersion: string;
    configurations: z.infer<typeof integrationArtifactConfigurationSchema>[];
    locallyManagedArtifact: z.infer<typeof locallyManagedArtifactSchema>;
}

/**
 * Update an existing local artifact configuration version.
 */
export async function overwriteExistingConfigurationVersion({ artifactId, artifactVersion, configurations, packageId, locallyManagedArtifact }: UpdateConfigurationVersionParams) {
    // Get the existing configuration
    const existingConfigurations = locallyManagedArtifact.artifactConfigurations.filter(config => config.artifactVersion === artifactVersion);
    if (existingConfigurations.length === 0) throw new Error(`No configurations found for version "${artifactVersion}" of artifact "${artifactId}" from package "${packageId}".`);
    if (existingConfigurations.length > 1) throw new Error(`Multiple configurations found for version "${artifactVersion}" of artifact "${artifactId}" from package "${packageId}".`);

    // Get the index of the existing configuration
    const existingConfigurationIndex = locallyManagedArtifact.artifactConfigurations.findIndex(config => config.artifactVersion === artifactVersion);
    if (existingConfigurationIndex === -1) throw new Error(`No configurations found for version "${artifactVersion}" of artifact "${artifactId}" from package "${packageId}".`);

    // Update the existing configuration
    locallyManagedArtifact.artifactConfigurations[existingConfigurationIndex]._createdAt = new Date().toISOString();
    locallyManagedArtifact.artifactConfigurations[existingConfigurationIndex].configurations = configurations;
    sortLocallyManagedArtifactConfigurations({ locallyManagedArtifact });

    // Write the updated configuration
    const artifactConfigurationFilePath = getManagedArtifactFilePath({ packageId, artifactId });
    await writeFile(artifactConfigurationFilePath, JSON.stringify(locallyManagedArtifact, null, 2));
}

interface PushConfigurationVersionParams extends ArtifactIdentifier {
    artifactVersion: string;
    configurations: z.infer<typeof integrationArtifactConfigurationSchema>[];
    locallyManagedArtifact: z.infer<typeof locallyManagedArtifactSchema>;
}

/**
 * Add a new artifact configuration version.
 */
export async function pushConfigurationVersion({ artifactId, artifactVersion, configurations, packageId, locallyManagedArtifact }: PushConfigurationVersionParams) {
    // Add the new configuration
    locallyManagedArtifact.artifactConfigurations.push({
        _createdAt: new Date().toISOString(),
        artifactVersion,
        configurations,
    });

    sortLocallyManagedArtifactConfigurations({ locallyManagedArtifact });

    // Write the updated configuration
    const artifactConfigurationFilePath = getManagedArtifactFilePath({ packageId, artifactId });
    await writeFile(artifactConfigurationFilePath, JSON.stringify(locallyManagedArtifact, null, 2));
}

type GetLatestLocalArtifactConfigurationsParams = {
    artifactId: string;
    locallyManagedArtifact: z.infer<typeof locallyManagedArtifactSchema>;
    packageId: string;
}

type GetLatestLocalArtifactConfigurationsResponse = {
    artifactConfiguration: Extract<Awaited<ReturnType<typeof getLocallyManagedArtifact>>, { result: 'OK' }>['artifactConfiguration']['artifactConfigurations'][number];
    result: 'OK';
} | {
    result: 'NO_LOCAL_CONFIGURATIONS';
};

export async function getLatestLocalArtifactConfigurations({ artifactId, packageId, locallyManagedArtifact }: GetLatestLocalArtifactConfigurationsParams): Promise<GetLatestLocalArtifactConfigurationsResponse> {
    // Sort the artifact configurations by version
    sortLocallyManagedArtifactConfigurations({ locallyManagedArtifact });

    // Get the latest artifact configurations by version
    const latestArtifactConfiguration = locallyManagedArtifact.artifactConfigurations.at(0);
    if (!latestArtifactConfiguration) return { result: 'NO_LOCAL_CONFIGURATIONS' };

    // Sanity check that there is a version
    if (!latestArtifactConfiguration.artifactVersion) throw new Error(`No artifact version found for "${artifactId}" from package "${packageId}".`);

    return {
        artifactConfiguration: latestArtifactConfiguration,
        result: 'OK',
    };
}
