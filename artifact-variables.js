/** @type {import('./dist/utils/artifact-variables').GetArtifactVariables} */
export function getArtifactVariables(accountShortName) {
  console.log('Getting artifact variables for:', accountShortName)

  return {
    // The name of the secret in the secret manager
    secret: 'MY_SECRET',
  }
}
