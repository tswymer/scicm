import { z } from "zod";

import { integrationContent } from "../ci-odata/IntegrationContent/index.js";
import { ciEnvironmentSchema } from "./scicm-configuration.js";
import { getSCICMSecrets, scicmSecretsSchema } from "./scicm-secrets.js";

const { integrationPackagesApi, integrationDesigntimeArtifactsApi } = integrationContent();

export function buildCIODataURL({ accountShortName, region, sslHost }: z.infer<typeof ciEnvironmentSchema>) {
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

export async function testCredentials(environment: z.infer<typeof ciEnvironmentSchema>, scicmSecrets: z.infer<typeof scicmSecretsSchema>) {
    await integrationPackagesApi.requestBuilder()
        .getAll()
        .execute({
            url: buildCIODataURL(environment),
            username: scicmSecrets.CI_USERNAME,
            password: scicmSecrets.CI_PASSWORD,
        });
}

async function getExecutionDestination(environment: z.infer<typeof ciEnvironmentSchema>) {
    const scicmSecrets = await getSCICMSecrets();

    return {
        url: buildCIODataURL(environment),
        username: scicmSecrets.CI_USERNAME,
        password: scicmSecrets.CI_PASSWORD,
    } as const;
}

export async function getIntegrationPackages(environment: z.infer<typeof ciEnvironmentSchema>) {
    return integrationPackagesApi.requestBuilder()
        .getAll()
        .execute(await getExecutionDestination(environment));
}

export async function getPackageIntergrationArtifacts(environment: z.infer<typeof ciEnvironmentSchema>, integrationPackageId: string) {
    const response = await integrationPackagesApi.requestBuilder()
        .getByKey(integrationPackageId)
        .appendPath('/IntegrationDesigntimeArtifacts')
        .executeRaw(await getExecutionDestination(environment));

    if (response.status !== 200) {
        throw new Error(`Failed to get integration package designtime artifacts: ${response.status} - ${response.statusText}`);
    }

    const results = response?.data?.d?.results;

    if (!results || !Array.isArray(results)) throw new Error('Invalid /IntegrationDesigntimeArtifacts response from CI');

    return z.array(integrationArtifactSchema).parse(results);
}

interface GetIntegrationArtifactConfigurationsOptions {
    artifactId: string;
    artifactVariables: Record<string, string>;
    artifactVersion: string;
    environment: z.infer<typeof ciEnvironmentSchema>;
}

export async function getIntegrationArtifactConfigurations({ environment, artifactId, artifactVersion, artifactVariables }: GetIntegrationArtifactConfigurationsOptions) {
    // Execute the request to get the integration designtime artifact configurations
    const response = await integrationDesigntimeArtifactsApi.requestBuilder()
        .getByKey(artifactId, artifactVersion)
        .appendPath('/Configurations')
        .executeRaw(await getExecutionDestination(environment));

    // Because this is a sub-path, we have to parse the response ourselves
    if (response.status !== 200) throw new Error(`Failed to get integration designtime artifact configurations: ${response.status} - ${response.statusText}`);
    const results = z.array(integrationArtifactConfigurationSchema).parse(response?.data?.d?.results);
    if (!results || !Array.isArray(results)) throw new Error('Invalid /Configurations response from CI');

    // Remove the environment secrets from the configurations

    for (const [variableName, variableValue] of Object.entries(artifactVariables)) {
        for (const configuration of results) {
            // Make sure the configuration names never contain any secrets
            if (configuration.ParameterKey.includes(variableName)) {
                throw new Error([
                    `Secret "${variableName}" found in configuration key "${configuration.ParameterKey}" for artifact "${artifactId}" (v.${artifactVersion})`
                ].join('\n'));
            }

            // Remove the secret from the configuration value
            if (configuration.ParameterValue.includes(variableValue)) {
                configuration.ParameterValue = configuration.ParameterValue.replaceAll(variableValue, `{{${variableName}}}`);
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