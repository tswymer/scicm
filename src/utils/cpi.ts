import { z } from "zod";

import { integrationContent } from "../cpi-odata/IntegrationContent/index.js";
import { getSecrets, secretsSchema } from "./secrets.js";
import { cpiEnvironment, getSICMConfig } from "./sicm-configuration.js";

const { integrationPackagesApi, integrationDesigntimeArtifactsApi } = integrationContent();

async function buildCPIODataURL(environment: undefined | z.infer<typeof cpiEnvironment> = undefined) {
    environment ||= (await getSICMConfig()).environment;

    const { accountShortName, region, sslHost } = environment;

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

export async function testCredentials(environment: z.infer<typeof cpiEnvironment>, secrets: z.infer<typeof secretsSchema>) {
    await integrationPackagesApi.requestBuilder()
        .getAll()
        .execute({
            url: await buildCPIODataURL(environment),
            username: secrets.CPI_USERNAME,
            password: secrets.CPI_PASSWORD,
        });
}

async function getExecutionDestination() {
    const secrets = await getSecrets();

    return {
        url: await buildCPIODataURL(),
        username: secrets.CPI_USERNAME,
        password: secrets.CPI_PASSWORD,
    } as const;
}

export async function getIntegrationPackages() {
    return integrationPackagesApi.requestBuilder()
        .getAll()
        .execute(await getExecutionDestination());
}

export async function getIntergrationPackageDesigntimeArtifacts(integrationPackageId: string) {
    const response = await integrationPackagesApi.requestBuilder()
        .getByKey(integrationPackageId)
        .appendPath('/IntegrationDesigntimeArtifacts')
        .executeRaw(await getExecutionDestination());

    if (response.status !== 200) {
        throw new Error(`Failed to get integration package designtime artifacts: ${response.status} - ${response.statusText}`);
    }

    const results = response?.data?.d?.results;

    if (!results || !Array.isArray(results)) {
        throw new Error('Invalid /IntegrationDesigntimeArtifacts response from CPI');
    }

    return z.array(integrationDesigntimeArtifactSchema).parse(results);
}

export async function getIntegrationDesigntimeArtifactConfigurations(integrationDesigntimeArtifactId: string, integrationDesigntimeArtifactVersion: string) {
    const response = await integrationDesigntimeArtifactsApi.requestBuilder()
        .getByKey(integrationDesigntimeArtifactId, integrationDesigntimeArtifactVersion)
        .appendPath('/Configurations')
        .executeRaw(await getExecutionDestination());

    if (response.status !== 200) {
        throw new Error(`Failed to get integration designtime artifact configurations: ${response.status} - ${response.statusText}`);
    }

    const results = response?.data?.d?.results;

    if (!results || !Array.isArray(results)) {
        throw new Error('Invalid /Configurations response from CPI');
    }

    return z.array(integrationDesigntimeArtifactConfigurationSchema).parse(results);
}