import { Command } from "@oclif/core";
import { access, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

import { integrationDesigntimeArtifactConfigurationSchema } from "./cpi.js";

const artifactConfigurationsSchema = z.object({
    _createdAt: z.string().datetime(),
    artifactId: z.string(),
    artifactConfigurations: z.array(z.object({
        _createdAt: z.string().datetime(),
        artifactVersion: z.string(),
        configurations: z.array(integrationDesigntimeArtifactConfigurationSchema),
    })),
});

export async function createArtifactConfigurationMonitoring(command: Command, integrationPackageId: string, artifactConfiguration: z.infer<typeof artifactConfigurationsSchema>) {
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

