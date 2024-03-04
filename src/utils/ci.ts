import { z } from "zod";

import { integrationContent } from "../cpi-odata/IntegrationContent/index.js";
import { ciEnvironment } from "./cicm-configuration.js";
import { getSecrets, secretsSchema } from "./secrets.js";

const { integrationPackagesApi, integrationDesigntimeArtifactsApi } = integrationContent();

export function buildCPIODataURL({ accountShortName, region, sslHost }: z.infer<typeof ciEnvironment>) {
    return `https://${accountShortName}-tmn.${sslHost}.${region}/api/v1`;
}

const integrationDesigntimeArtifactSchema = z.object({
    Id: z.string(),
    Version: z.string(),
    PackageId: z.string().optional(),
    Name: z.string().optional(),
    Description: z.string().optional(),
});

export const integrationDesigntimeArtifactConfigurationSchema = z.object({
    ParameterKey: z.string(),
    ParameterValue: z.string(),
    DataType: z.enum([
        'custom:schedule',
        'xsd:integer',
        'xsd:string',
    ]),
});

export async function testCredentials(environment: z.infer<typeof ciEnvironment>, secrets: z.infer<typeof secretsSchema>) {
    await integrationPackagesApi.requestBuilder()
        .getAll()
        .execute({
            url: buildCPIODataURL(environment),
            username: secrets.CPI_USERNAME,
            password: secrets.CPI_PASSWORD,
        });
}

async function getExecutionDestination(environment: z.infer<typeof ciEnvironment>) {
    const secrets = await getSecrets();

    return {
        url: buildCPIODataURL(environment),
        username: secrets.CPI_USERNAME,
        password: secrets.CPI_PASSWORD,
    } as const;
}

export async function getIntegrationPackages(environment: z.infer<typeof ciEnvironment>) {
    return integrationPackagesApi.requestBuilder()
        .getAll()
        .execute(await getExecutionDestination(environment));
}

export async function getIntergrationPackageDesigntimeArtifacts(environment: z.infer<typeof ciEnvironment>, integrationPackageId: string) {
    const response = await integrationPackagesApi.requestBuilder()
        .getByKey(integrationPackageId)
        .appendPath('/IntegrationDesigntimeArtifacts')
        .executeRaw(await getExecutionDestination(environment));

    if (response.status !== 200) {
        throw new Error(`Failed to get integration package designtime artifacts: ${response.status} - ${response.statusText}`);
    }

    const results = response?.data?.d?.results;

    if (!results || !Array.isArray(results)) {
        throw new Error('Invalid /IntegrationDesigntimeArtifacts response from CPI');
    }

    return z.array(integrationDesigntimeArtifactSchema).parse(results);
}

export async function getIntegrationDesigntimeArtifactConfigurations(environment: z.infer<typeof ciEnvironment>, integrationDesigntimeArtifactId: string, integrationDesigntimeArtifactVersion: string) {
    const response = await integrationDesigntimeArtifactsApi.requestBuilder()
        .getByKey(integrationDesigntimeArtifactId, integrationDesigntimeArtifactVersion)
        .appendPath('/Configurations')
        .executeRaw(await getExecutionDestination(environment));

    if (response.status !== 200) {
        throw new Error(`Failed to get integration designtime artifact configurations: ${response.status} - ${response.statusText}`);
    }

    const results = response?.data?.d?.results;

    if (!results || !Array.isArray(results)) {
        throw new Error('Invalid /Configurations response from CPI');
    }

    return z.array(integrationDesigntimeArtifactConfigurationSchema).parse(results);
}