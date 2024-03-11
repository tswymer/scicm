import { join } from "node:path";
import { z } from "zod";

export type GetArtifactVariables = (accountShortName: string) => Record<string, string>;

const integrationEnvironmentVariablesSchema = z.record(z.string(), z.string());

export async function getArtifactVariables(accountShortName: string) {
    const artifactVariablesPath = join(process.cwd(), 'artifact-variables.js');

    // Try to import the "artifact-Variables.js" file
    const { getArtifactVariables } = await import(artifactVariablesPath) as { getArtifactVariables?: GetArtifactVariables };

    if (!getArtifactVariables) {
        throw new Error(`${artifactVariablesPath} does not export a "getArtifactVariables" function.`);
    }

    // Execute the function to get the artifact variables, and parse the result
    const artifactVariables = integrationEnvironmentVariablesSchema.safeParse(getArtifactVariables(accountShortName));

    // Check if the variables are valid
    if (!artifactVariables.success) {
        throw new Error([
            `Failed to parse artifact variables from ${artifactVariablesPath}:`,
            ...artifactVariables.error.errors.map(error => JSON.stringify(error, null, 2)),
        ].join('\n'));
    }

    return artifactVariables.data;
}

export const ARTIFACT_VARIABLES_TEMPLATE = `import "dotenv/config";

/** @type {import('scicm/dist/utils/artifact-variables').GetArtifactVariables} */
export function getArtifactVariables(accountShortName) {
  console.log('Creating artifact variables for:', accountShortName)

  return {
    MY_VARIABLE_KEY: 'MY_VARIABLE_VALUE',
  }
}
`;