import { z } from "zod";

import { integrationContent } from "../cpi-odata/IntegrationContent/index.js";
import { cpiEnvironment, getConfiguration } from "./configuration.js";
import { getSecrets, secretsSchema } from "./secrets.js";

const { integrationPackagesApi, } = integrationContent();

function buildCPIODataURL({ accountShortName, sslHost, region, }: z.infer<typeof cpiEnvironment>) {
    return `https://${accountShortName}-tmn.${sslHost}.${region}/api/v1`;
}

export async function testCredentials(environment: z.infer<typeof cpiEnvironment>, secrets: z.infer<typeof secretsSchema>) {
    await integrationPackagesApi.requestBuilder()
        .getAll()
        .execute({
            url: buildCPIODataURL(environment),
            username: secrets.CPI_USERNAME,
            password: secrets.CPI_PASSWORD,
        });
}

export async function getIntegrationPackages() {
    const configuration = await getConfiguration();
    const secrets = await getSecrets();

    const integrationPackages = integrationPackagesApi.requestBuilder()
        .getAll()
        .execute({
            url: buildCPIODataURL({
                accountShortName: configuration.environment.accountShortName,
                region: configuration.environment.region,
                sslHost: configuration.environment.sslHost,
            }),
            username: secrets.CPI_USERNAME,
            password: secrets.CPI_PASSWORD,
        });

    return integrationPackages;
}