import { select } from "@inquirer/prompts";

import { buildCIODataURL } from "./cloud-integration.js";
import { SCICMConfig } from "./scicm-configuration.js";

interface SelectAccountShortNameParams {
    config: SCICMConfig;
    defaultAccountShortName?: string;
}

export async function selectAccountShortName({ config, defaultAccountShortName }: SelectAccountShortNameParams) {
    const accountShortName = defaultAccountShortName ?? await select({
        message: 'Select an integration environment:',
        choices: config.integrationEnvironments.map(environment => ({
            value: environment.accountShortName,
            name: `${buildCIODataURL({
                accountShortName: environment.accountShortName,
                region: environment.region,
                sslHost: environment.sslHost,
            })}`,
        })),
    });

    if (!config.integrationEnvironments.some(environment => environment.accountShortName === accountShortName)) {
        throw new Error([
            `The account short name "${accountShortName}" is not monitored by scicm.`
        ].join('\n'));
    }

    return accountShortName;
}