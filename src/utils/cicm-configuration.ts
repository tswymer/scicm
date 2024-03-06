import { writeFile } from "node:fs/promises";
import { join } from 'node:path';
import { z } from "zod";

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
    ignoredArtifactIds: z.array(z.string()),
});

const cicmConfigurationSchema = z.object({
    integrationEnvironments: z.array(ciEnvironmentSchema),
    managedIntegrationPackages: z.array(managedIntegrationPackageSchema).optional(),
    integrationEnvironmentVariables: z.record(z.string(), z.string()),
});

export type CICMConfig = {
    integrationEnvironmentVariables: (accountShortName: string) => Record<string, string>,
    integrationEnvironments: z.infer<typeof ciEnvironmentSchema>[],
    managedIntegrationPackages?: z.infer<typeof managedIntegrationPackageSchema>[],
};

function getConfigurationFilePath() {
    return join(process.cwd(), 'cicm-config.json');
}

export async function getConfig(accountShortName: string) {
    // Create the path to the configuration file
    const configurationFilePath = getConfigurationFilePath();

    // Import the configuration file
    const configFile = await import(configurationFilePath) as Partial<CICMConfig>;

    // Parse the configuration object content
    const parsedConfiguration = cicmConfigurationSchema.safeParse({
        integrationEnvironments: configFile.integrationEnvironments,
        integrationEnvironmentVariables: configFile.integrationEnvironmentVariables!(accountShortName),
        managedIntegrationPackages: configFile.managedIntegrationPackages,
    } satisfies Partial<z.infer<typeof cicmConfigurationSchema>>);

    // Check if the configuration is valid
    if (!parsedConfiguration.success) {
        throw new Error([
            `Failed to parse configuration from ${configurationFilePath}:`,
            ...parsedConfiguration.error.errors.map(error => JSON.stringify(error, null, 2)),
        ].join('\n'));
    }

    return parsedConfiguration.data;
}

export async function setConfig(configuration: z.infer<typeof cicmConfigurationSchema>) {
    // Create the path to the configuration file
    const configurationFilePath = getConfigurationFilePath();

    // Sort the lists in the configuration
    configuration.managedIntegrationPackages?.sort((a, b) => a.packageId.localeCompare(b.packageId));
    configuration.managedIntegrationPackages?.forEach(monitoredPackage => monitoredPackage.ignoredArtifactIds.sort());

    // Write the configuration to the cicm-config.json file
    await writeFile(configurationFilePath, JSON.stringify(configuration, null, 2));
}

export async function getAllEnvironments() {
    // Create the path to the configuration file
    const configurationFilePath = getConfigurationFilePath();

    // Import the configuration file
    const configFile = await import(configurationFilePath) as Partial<CICMConfig>;

    // Parse the configuration object content
    const parsedEnvironments = z.array(ciEnvironmentSchema).safeParse(configFile.integrationEnvironments);

    // Check if the configuration is valid
    if (!parsedEnvironments.success) {
        throw new Error([
            `Failed to parse environments from ${configurationFilePath}:`,
            ...parsedEnvironments.error.errors.map(error => JSON.stringify(error, null, 2)),
        ].join('\n'));
    }

    return parsedEnvironments.data;
}

export function getEnvironment(config: z.infer<typeof cicmConfigurationSchema>, environmentAccountShortName: string) {
    const environment = config.integrationEnvironments.find(environment => environment.accountShortName === environmentAccountShortName);
    if (!environment) throw new Error(`Environment with accountShortName "${environmentAccountShortName}" not found.`);

    return environment;
}