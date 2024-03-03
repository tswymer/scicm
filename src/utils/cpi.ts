import { z } from "zod";

import { integrationContent } from "../cpi-odata/IntegrationContent/index.js";
import { cpiEnvironment, getConfiguration } from "./configuration.js";
import { getSecrets, secretsSchema } from "./secrets.js";

const { integrationPackagesApi } = integrationContent();

function buildCPIODataURL({ accountShortName, sslHost, region, }: z.infer<typeof cpiEnvironment>) {
    return `https://${accountShortName}-tmn.${sslHost}.${region}/api/v1`;
}

const integrationDesigntimeArtifactsSchema = z.array(z.object({
    Id: z.string(),
    Version: z.string(),
    PackageId: z.string().optional(),
    Name: z.string().optional(),
    Description: z.string().optional(),
}));

export async function testCredentials(environment: z.infer<typeof cpiEnvironment>, secrets: z.infer<typeof secretsSchema>) {
    await integrationPackagesApi.requestBuilder()
        .getAll()
        .execute({
            url: buildCPIODataURL(environment),
            username: secrets.CPI_USERNAME,
            password: secrets.CPI_PASSWORD,
        });
}

async function getExecutionDestination() {
    const configuration = await getConfiguration();
    const secrets = await getSecrets();

    return {
        url: buildCPIODataURL({
            accountShortName: configuration.environment.accountShortName,
            region: configuration.environment.region,
            sslHost: configuration.environment.sslHost,
        }),
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

    return integrationDesigntimeArtifactsSchema.parse(results);
}