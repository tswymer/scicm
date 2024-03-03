import { Command } from "@oclif/core";
import { readFile, writeFile } from "node:fs/promises";
import { join } from 'node:path';
import { z } from "zod";

import { getIntergrationPackageDesigntimeArtifacts } from "./cpi.js";

export const cpiRegions = [
    'ae1.hana.ondemand.com',
    'ap1.hana.ondemand.com',
    'br1.hana.ondemand.com',
    'ca1.hana.ondemand.com',
    'cn1.hana.ondemand.com',
    'eu1.hana.ondemand.com',
    'eu2.hana.ondemand.com',
    'eu3.hana.ondemand.com',
    'hana.ondemand.com',
    'hanatrial.ondemand.com',
    'jp1.hana.ondemand.com',
    'sa1.hana.ondemand.com',
    'us1.hana.ondemand.com',
    'us2.hana.ondemand.com',
    'us3.hana.ondemand.com',
    'us4.hana.ondemand.com'
] as const;

const cpiRegion = z.enum(cpiRegions);

export const cpiEnvironment = z.object({
    accountShortName: z.string(),
    sslHost: z.string(),
    region: cpiRegion,
});

export const monitoredIntegrationPackage = z.object({
    packageId: z.string(),
    ignoredArtifactIds: z.array(z.string()),
});

const configurationSchema = z.object({
    environment: cpiEnvironment,
    monitoredIntegrationPackages: z.array(monitoredIntegrationPackage).optional(),
});

function getConfigurationFilePath(path: null | string = null) {
    const cwd = process.cwd();

    const filePath = path ? join(cwd, path) : cwd;

    return join(filePath, '.sicm-config.json');
}

export async function getConfiguration(path: null | string = null) {
    // Create the path to the configuration file
    const configurationFilePath = getConfigurationFilePath(path);

    // Read the configuration file
    const configuration = JSON.parse(await readFile(getConfigurationFilePath(path), 'utf8'));

    // Parse the configuration object content
    const parsedConfiguration = configurationSchema.safeParse(configuration);

    // Check if the configuration is valid
    if (!parsedConfiguration.success) {
        throw new Error([
            `Failed to parse configuration from ${configurationFilePath}:`,
            ...parsedConfiguration.error.errors.map(error => JSON.stringify(error, null, 2)),
        ].join('\n'));
    }

    return parsedConfiguration.data;
}

export async function setConfiguration(command: Command, configuration: z.infer<typeof configurationSchema>, path: null | string = null) {
    // Create the path to the configuration file
    const configurationFilePath = getConfigurationFilePath(path);

    // Sort the lists in the configuration
    configuration.monitoredIntegrationPackages?.sort((a, b) => a.packageId.localeCompare(b.packageId));
    configuration.monitoredIntegrationPackages?.forEach(monitoredPackage => monitoredPackage.ignoredArtifactIds.sort());

    // Write the configuration to the .sicm-config.json file
    await writeFile(configurationFilePath, JSON.stringify(configuration, null, 2));

    // Log the result
    command.log(`⚙️ Updated ${configurationFilePath}`);
}

export async function getMonitoredArtifactsByIntegrationPackage(command: Command, integrationPackageId: string) {
    const configuration = await getConfiguration();

    const monitoredIntegrationArtifact = configuration.monitoredIntegrationPackages?.find(monitoredPackage => monitoredPackage.packageId === integrationPackageId);

    if (!monitoredIntegrationArtifact) {
        throw new Error(`The integration package ${integrationPackageId} is not monitored.`);
    }

    const integrationDesigntimeArtifacts = await getIntergrationPackageDesigntimeArtifacts(integrationPackageId);

    // Filter out the ignored artifacts
    for (const ignoredArtifactId of monitoredIntegrationArtifact.ignoredArtifactIds) {
        const ignoredArtifactIndex = integrationDesigntimeArtifacts.findIndex(artifact => artifact.Id === ignoredArtifactId);

        if (ignoredArtifactIndex === -1) {
            command.warn(`Artifact "${ignoredArtifactId}" is in ignoredArtifactIds, but not present in the integration package "${integrationPackageId}".`);
            continue;
        }

        // Remove the ignored artifact from the list of designtime artifacts
        integrationDesigntimeArtifacts.splice(ignoredArtifactIndex, 1);
    }

    return integrationDesigntimeArtifacts;
}