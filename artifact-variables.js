/** @type {import('./dist/utils/artifact-variables').GetArtifactVariables} */
export function getArtifactVariables(accountShortName) {
  console.log('Getting artifact variables for:', accountShortName)

  return {
    MY_VARIABLE: 'MY_VARIABLE_VALUE',
  }
}
