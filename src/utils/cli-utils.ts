import { select } from "@inquirer/prompts";
import { z } from "zod";

import { buildCIODataURL, getIntegrationPackages, getPackageIntergrationArtifacts } from "./cloud-integration.js";
import { SCICMConfig, managedIntegrationPackageSchema } from "./scicm-configuration.js";

type SelectEnvironmentParams = {
    config: SCICMConfig;
    defaultCIURL?: string;
}

type SelectEnvironmentResponse = {
    ciURL: string;
    result: 'OK';
} | {
    result: 'NOT_MONITORED';
};

export async function selectEnvironment({ config, defaultCIURL }: SelectEnvironmentParams): Promise<SelectEnvironmentResponse> {
    const ciURL = defaultCIURL ?? await select({
        message: 'Select an integration environment:',
        choices: config.integrationEnvironments.map(environment => ({
            value: environment.ciURL,
            name: `${buildCIODataURL({ ciURL: environment.ciURL })}`,
        })),
    });

    if (!config.integrationEnvironments.some(environment => environment.ciURL === ciURL)) return {
        result: 'NOT_MONITORED',
    }

    return {
        result: 'OK',
        ciURL,
    }
}

type SelectManagedIntegrationPackageParams = {
    config: SCICMConfig;
    defaultPackageId?: string;
    integrationPackages: Awaited<ReturnType<typeof getIntegrationPackages>>;
}

type SelectManagedIntegrationPackageResponse = {
    managedIntegrationPackage: z.infer<typeof managedIntegrationPackageSchema>;
    result: 'OK';
} | {
    packageId: string;
    result: 'NOT_MONITORED';
};

export async function selectManagedIntegrationPackage({ config, defaultPackageId, integrationPackages }: SelectManagedIntegrationPackageParams): Promise<SelectManagedIntegrationPackageResponse> {
    const packageId = defaultPackageId ?? await select({
        message: 'Select an integration package:',
        choices: integrationPackages.map(pkg => ({
            value: pkg.id,
            name: `[${pkg.id}]:\t${pkg.name ?? '_Unnamed_Package_'}`,
        })),
    });

    const managedIntegrationPackage = config.managedIntegrationPackages?.find(monitoredPackage => monitoredPackage.packageId === packageId);
    if (!managedIntegrationPackage) return {
        result: 'NOT_MONITORED',
        packageId,
    }

    return {
        result: 'OK',
        managedIntegrationPackage,
    };
}

type SelectIntegrationArtifactIdParams = {
    defaultArtifactId?: string;
    managedIntegrationPackage: z.infer<typeof managedIntegrationPackageSchema>;
    remoteArtifacts: Awaited<ReturnType<typeof getPackageIntergrationArtifacts>>;
}

type SelectIntegrationArtifactIdResponse = {
    remoteArtifact: Awaited<ReturnType<typeof getPackageIntergrationArtifacts>>[number];
    result: 'OK';
} | {
    result: 'NOT_MONITORED';
} | {
    result: 'UNKNOWN_ARTIFACT_ID';
};

export async function selectRemoteIntegrationArtifact({ defaultArtifactId, managedIntegrationPackage, remoteArtifacts }: SelectIntegrationArtifactIdParams): Promise<SelectIntegrationArtifactIdResponse> {
    // Remove the ignored artifacts from the artifacts list
    const monitoredArtifacts = remoteArtifacts.filter(remoteArtifact => !managedIntegrationPackage.ignoredArtifactIds.includes(remoteArtifact.Id));

    const artifactId = defaultArtifactId ?? await select({
        message: 'Select an Intergration Artifact to update configurations for:',
        choices: monitoredArtifacts.map(artifact => ({
            value: artifact.Id,
            name: `[${artifact.Id}]:\t${artifact.Name ?? '_Unnamed_Artifact_'}`,
        })),
    });

    if (!monitoredArtifacts.some(monitoredArtifacts => monitoredArtifacts.Id === artifactId)) return {
        result: 'NOT_MONITORED',
    }

    // Find the remote artifact
    const remoteArtifact = remoteArtifacts.find(artifact => artifact.Id === artifactId);
    if (!remoteArtifact) return {
        result: 'UNKNOWN_ARTIFACT_ID'
    };

    return {
        result: 'OK',
        remoteArtifact,
    };
}