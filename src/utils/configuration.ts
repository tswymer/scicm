import { Command } from "@oclif/core";
import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";

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

const configurationSchema = z.object({
    environments: z.array(cpiEnvironment),
});

export async function getConfiguration(command: Command) {
    // Read the configuration file
    const configuration = JSON.parse(await readFile('.icm-config.json', 'utf8'));

    // Parse the configuration object content
    const parsedConfiguration = configurationSchema.safeParse(configuration);

    // Check if the configuration is valid
    if (!parsedConfiguration.success) {
        command.error(new Error([
            'Failed to parse configuration from .icm-config.json file:',
            ...parsedConfiguration.error.errors.map(error => JSON.stringify(error, null, 2)),
        ].join('\n')));
    }

    return parsedConfiguration.data;
}

export async function setConfiguration(command: Command, configuration: z.infer<typeof configurationSchema>) {
    // Write the configuration to the .icm-config.json file
    await writeFile('.icm-config.json', JSON.stringify(configuration, null, 2));

    // Log the result
    command.log('Updated .icm-config.json file ✅');
}