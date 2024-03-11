import { readFile, writeFile } from "node:fs/promises";
import { join } from 'node:path';
import { z } from "zod";

export type CIRegion = typeof ciRegions[number];

export const ciRegions = [
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

const ciRegion = z.enum(ciRegions);

export const ciEnvironmentSchema = z.object({
    accountShortName: z.string(),
    sslHost: z.string(),
    region: ciRegion,
});

export const managedIntegrationPackageSchema = z.object({
    packageId: z.string(),
    monitoredArtifactIds: z.array(z.string()),
    ignoredArtifactIds: z.array(z.string()),
});

const scicmConfigurationSchema = z.object({
    integrationEnvironments: z.array(ciEnvironmentSchema),
    managedIntegrationPackages: z.array(managedIntegrationPackageSchema).optional(),
});

export type SCICMConfig = {
    integrationEnvironments: z.infer<typeof ciEnvironmentSchema>[],
    managedIntegrationPackages?: z.infer<typeof managedIntegrationPackageSchema>[],
};

function getConfigurationFilePath(projectPath: string | undefined = undefined) {
    return join(projectPath ?? process.cwd(), 'scicm-config.json');
}

export async function getConfig() {
    // Create the path to the configuration file
    const configurationFilePath = getConfigurationFilePath();

    // Read the configuration file
    const configuration = JSON.parse(await readFile(configurationFilePath, 'utf8'));

    // Parse the configuration object content
    const parsedConfiguration = scicmConfigurationSchema.safeParse(configuration);

    // Check if the configuration is valid
    if (!parsedConfiguration.success) {
        throw new Error([
            `Failed to parse configuration from ${configurationFilePath}:`,
            ...parsedConfiguration.error.errors.map(error => JSON.stringify(error, null, 2)),
        ].join('\n'));
    }

    return parsedConfiguration.data;
}

type SetConfigParams = {
    configuration: z.infer<typeof scicmConfigurationSchema>,
    projectPath?: string,
}

export async function setConfig({ configuration, projectPath }: SetConfigParams) {
    // Create the path to the configuration file
    const configurationFilePath = getConfigurationFilePath(projectPath);

    // Sort the lists in the configuration
    configuration.managedIntegrationPackages?.sort((a, b) => a.packageId.localeCompare(b.packageId));
    configuration.managedIntegrationPackages?.forEach(monitoredPackage => monitoredPackage.ignoredArtifactIds.sort());

    // Write the configuration to the scicm-config.json file
    await writeFile(configurationFilePath, JSON.stringify(configuration, null, 2));
}

type GetEnvironmentParams = {
    accountShortName: string,
    config: z.infer<typeof scicmConfigurationSchema>,
};

type GetEnvironmentResponse = {
    environment: z.infer<typeof ciEnvironmentSchema>,
    result: 'OK',
} | {
    result: 'UNKNOWN_ENVIRONMENT'
};

export function getEnvironment({ config, accountShortName }: GetEnvironmentParams): GetEnvironmentResponse {
    const environment = config.integrationEnvironments.find(environment => environment.accountShortName === accountShortName);
    if (!environment) return { result: 'UNKNOWN_ENVIRONMENT' };

    return {
        result: 'OK',
        environment,
    };
}