import 'dotenv/config'

/** @type {import('scicm/utils/artifact-variables').GetArtifactVariables} */
export function getArtifactVariables(ciURL) {
  console.log('Creating artifact variables for:', ciURL)

  return {
    MY_VARIABLE_KEY: 'MY_VARIABLE_VALUE',
  }
}
