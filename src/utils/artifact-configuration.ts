import { getLatestLocalArtifactConfigurations } from "./artifact-management.js";
import { getIntegrationArtifactConfigurations } from "./cloud-integration.js";

type ArtifactConfigurations = {
    localConfigurations: Awaited<ReturnType<typeof getLatestLocalArtifactConfigurations>>;
    remoteConfigurations: Awaited<ReturnType<typeof getIntegrationArtifactConfigurations>>;
};

type CompareArtifactConfigurationResponse =
    | { comparisonCount: number, result: 'OK', unusedLocalConfigurationKeys: string[] }
    | { configurationKey: string, localValue: string, remoteValue: string, result: "LOCAL_CONFIGURATION_MISMATCH" | "LOCAL_CONFIGURATION_MISSING" };

export function compareArtifactConfigurations({ localConfigurations, remoteConfigurations: remoteConfigurationsWithVersion }: ArtifactConfigurations): CompareArtifactConfigurationResponse {

    // Get the configurations from the remote artifact, as a copy because we will be modifying it
    const remoteConfigurations = [...remoteConfigurationsWithVersion.configurations];

    // For every local configuration, compare it the remote configuration
    let comparisonCount = 0;
    const unusedLocalConfigurationKeys: string[] = [];
    for (const localConfiguration of localConfigurations.configurations ?? []) {
        const remoteConfigurationIndex = remoteConfigurations.findIndex(remoteConfiguration => remoteConfiguration.ParameterKey === localConfiguration.ParameterKey);
        if (remoteConfigurationIndex === -1) {
            unusedLocalConfigurationKeys.push(localConfiguration.ParameterKey);
            continue;
        }

        const remoteConfigurationValue = remoteConfigurations.at(remoteConfigurationIndex)?.ParameterValue;
        if (remoteConfigurationValue !== localConfiguration.ParameterValue) {
            return {
                result: 'LOCAL_CONFIGURATION_MISMATCH',
                configurationKey: localConfiguration.ParameterKey,
                localValue: localConfiguration.ParameterValue,
                remoteValue: remoteConfigurationValue ?? '<not_defined>',
            }
        }

        remoteConfigurations.splice(remoteConfigurationIndex, 1);
        comparisonCount++;
    }

    // If there are name more remote configurations, that means we are missing 
    // them locally. Throw an error for each missing configuration (only the first one is thrown)
    // eslint-disable-next-line no-unreachable-loop -- It's fine here, we don't want this loop to run unless there are remaining remote configuration
    for (const remainingRemoteConfiguration of remoteConfigurations) {
        return {
            result: 'LOCAL_CONFIGURATION_MISSING',
            configurationKey: remainingRemoteConfiguration.ParameterKey,
            localValue: '<not_defined>',
            remoteValue: remainingRemoteConfiguration.ParameterValue,
        }
    }

    return { result: 'OK', comparisonCount, unusedLocalConfigurationKeys };
}
