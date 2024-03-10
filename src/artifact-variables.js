/** @type {import('cicm/utils/artifact-variables').GetArtifactVariables} */
export function getArtifactVariables(accountShortName) {
  console.log('Creating artifact variables for:', accountShortName)

  return {
    MY_VARIABLE_KEY: 'MY_VARIABLE_VALUE',
  }
}
