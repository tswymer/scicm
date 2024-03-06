import { Command } from "@oclif/core";
import { parse } from 'dotenv';
import { access, appendFile, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

export const cicmSecretsSchema = z.object({
    CPI_USERNAME: z.string(),
    CPI_PASSWORD: z.string(),
});

function getEnvFilePath(path: null | string = null) {
    // Create the path to the configuration file
    const cwd = process.cwd();

    const filePath = path ? join(cwd, path) : cwd;

    return join(filePath, '.env');
}

export async function getCICMSecrets(path: null | string = null) {
    // Create the file path to the .env file
    const envFilePath = getEnvFilePath(path);

    // Read the .env file
    const env = await readFile(envFilePath, 'utf8');

    // Parse the .env file into a JSON object
    const secrets = parse(env);

    // Parse the secrets object
    const parsedSecrets = cicmSecretsSchema.safeParse(secrets);

    // Check if the secrets are valid
    if (!parsedSecrets.success) {
        throw new Error([
            `Failed to parse secrets from ${envFilePath}:`,
            ...parsedSecrets.error.errors.map(error => JSON.stringify(error, null, 2)),
        ].join('\n'));
    }

    return parsedSecrets.data;
}

export async function setCICMSecrets(command: Command, secrets: z.infer<typeof cicmSecretsSchema>, path: null | string = null) {
    // Create the file path to the .env file
    const envFilePath = getEnvFilePath(path);

    // Check if the .env file exists
    const envFileExists = await access(envFilePath).then(() => true).catch(() => false);

    // Create a .env string with the secrets
    if (envFileExists) {
        appendFile(envFilePath, '\n\n# AUTOMATICALLY GENERATED\n');
    } else {
        writeFile(envFilePath, '# AUTOMATICALLY GENERATED\n');
    }

    // Write the secrets to the .env file
    await appendFile(envFilePath, Object.entries(secrets).map(([key, value]) => `${key}="${value}"`).join('\n'));

    command.log(`✅ Updated ${envFilePath} with secrets`);
}