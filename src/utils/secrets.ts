import { Command } from "@oclif/core";
import { access, appendFile, readFile, writeFile } from "node:fs/promises";
import { z } from "zod";

import { secretsSchema } from "../schemas/configuration.js";


export async function getSecrets(command: Command) {
    // Read the .env file
    const env = await readFile('.env', 'utf8');

    // Parse the .env file into a JSON object
    const secrets = Object.fromEntries(env.split('\n')
        .filter(line => line.includes('='))
        .map(line => line.split('=')));

    // Parse the secrets object
    const parsedSecrets = secretsSchema.safeParse(secrets);

    // Check if the secrets are valid
    if (!parsedSecrets.success) {
        command.error(new Error([
            'Failed to parse secrets from .env file:',
            ...parsedSecrets.error.errors.map(error => JSON.stringify(error, null, 2)),
        ].join('\n')));
    }

    return parsedSecrets.data;
}

export async function setSecrets(command: Command, secrets: z.infer<typeof secretsSchema>) {
    // Check if the .env file exists
    const envFileExists = await access('.env').then(() => true).catch(() => false);

    // Create a .env string with the secrets
    if (envFileExists) {
        appendFile('.env', '\n\n# AUTOMATICALLY GENERATED\n');
    } else {
        writeFile('.env', '# AUTOMATICALLY GENERATED\n');
    }

    // Write the secrets to the .env file
    await appendFile('.env', Object.entries(secrets).map(([key, value]) => `${key}=${value}`).join('\n'));

    // Log the result
    if (envFileExists) {
        command.log('Added secrets to existing .env file ✅');
    } else {
        command.log('Created .env file with secrets ✅');
    }
}