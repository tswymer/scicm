import { z } from "zod";

import { integrationContent } from "../cpi-odata/IntegrationContent/index.js";
import { ciEnvironmentSchema } from "./cicm-configuration.js";
import { getSecrets, secretsSchema } from "./cicm-secrets.js";

const { integrationPackagesApi, integrationDesigntimeArtifactsApi } = integrationContent();

export function buildCPIODataURL({ accountShortName, region, sslHost }: z.infer<typeof ciEnvironmentSchema>) {
    return `https://${accountShortName}-tmn.${sslHost}.${region}/api/v1`;
}

const integrationArtifactSchema = z.object({
    Id: z.string(),
    Version: z.string(),
    PackageId: z.string().optional(),
    Name: z.string().optional(),
    Description: z.string().optional(),
});

export const integrationArtifactConfigurationSchema = z.object({
    ParameterKey: z.string(),
    ParameterValue: z.string(),
    DataType: z.enum([
        'custom:schedule',
        'xsd:integer',
        'xsd:string',
    ]),
});

export async function testCredentials(environment: z.infer<typeof ciEnvironmentSchema>, secrets: z.infer<typeof secretsSchema>) {
    await integrationPackagesApi.requestBuilder()
        .getAll()
        .execute({
            url: buildCPIODataURL(environment),
            username: secrets.CPI_USERNAME,
            password: secrets.CPI_PASSWORD,
        });
}

async function getExecutionDestination(environment: z.infer<typeof ciEnvironmentSchema>) {
    const secrets = await getSecrets();

    return {
        url: buildCPIODataURL(environment),
        username: secrets.CPI_USERNAME,
        password: secrets.CPI_PASSWORD,
    } as const;
}

export async function getIntegrationPackages(environment: z.infer<typeof ciEnvironmentSchema>) {
    return integrationPackagesApi.requestBuilder()
        .getAll()
        .execute(await getExecutionDestination(environment));
}

export async function getIntergrationPackageArtifacts(environment: z.infer<typeof ciEnvironmentSchema>, integrationPackageId: string) {
    const response = await integrationPackagesApi.requestBuilder()
        .getByKey(integrationPackageId)
        .appendPath('/IntegrationDesigntimeArtifacts')
        .executeRaw(await getExecutionDestination(environment));

    if (response.status !== 200) {
        throw new Error(`Failed to get integration package designtime artifacts: ${response.status} - ${response.statusText}`);
    }

    const results = response?.data?.d?.results;

    if (!results || !Array.isArray(results)) throw new Error('Invalid /IntegrationDesigntimeArtifacts response from CPI');

    return z.array(integrationArtifactSchema).parse(results);
}

interface GetIntegrationArtifactConfigurationsOptions {
    artifactId: string;
    artifactVersion: string;
    environment: z.infer<typeof ciEnvironmentSchema>;
    environmentSecrets?: Record<string, string>;
}

export async function getIntegrationArtifactConfigurations({ environment, artifactId, artifactVersion, environmentSecrets }: GetIntegrationArtifactConfigurationsOptions) {
    // Execute the request to get the integration designtime artifact configurations
    const response = await integrationDesigntimeArtifactsApi.requestBuilder()
        .getByKey(artifactId, artifactVersion)
        .appendPath('/Configurations')
        .executeRaw(await getExecutionDestination(environment));

    // Because this is a sub-path, we have to parse the response ourselves
    if (response.status !== 200) throw new Error(`Failed to get integration designtime artifact configurations: ${response.status} - ${response.statusText}`);
    const results = z.array(integrationArtifactConfigurationSchema).parse(response?.data?.d?.results);
    if (!results || !Array.isArray(results)) throw new Error('Invalid /Configurations response from CPI');

    // Remove the environment secrets from the configurations
    if (environmentSecrets) {
        for (const [secretName, secretValue] of Object.entries(environmentSecrets)) {
            for (const configuration of results) {
                // Make sure the configuration names never contain any secrets
                if (configuration.ParameterKey.includes(secretName)) {
                    throw new Error([
                        `Secret "${secretName}" found in configuration key "${configuration.ParameterKey}" for artifact "${artifactId}" (v.${artifactVersion})`
                    ].join('\n'));
                }

                // Remove the secret from the configuration value
                if (configuration.ParameterValue.includes(secretValue)) {
                    configuration.ParameterValue = configuration.ParameterValue.replaceAll(secretValue, `{{${secretName}}}`);
                }
            }
        }
    }

    // Sanity check that there is a version
    if (!artifactVersion) throw new Error(`No artifact version found for artifact "${artifactId}" (v.${artifactVersion})`);

    return {
        artifactVersion,
        configurations: results,
    };
}