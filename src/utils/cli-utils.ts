import { select } from "@inquirer/prompts";

import { buildCIODataURL, getIntegrationPackages, getIntergrationPackageArtifacts } from "./cloud-integration.js";
import { SCICMConfig } from "./scicm-configuration.js";

interface SelectAccountShortNameParams {
    config: SCICMConfig;
    defaultAccountShortName?: string;
}

export async function selectAccountShortName({ config, defaultAccountShortName }: SelectAccountShortNameParams) {
    const accountShortName = defaultAccountShortName ?? await select({
        message: 'Select an integration environment:',
        choices: config.integrationEnvironments.map(environment => ({
            value: environment.accountShortName,
            name: `${buildCIODataURL({
                accountShortName: environment.accountShortName,
                region: environment.region,
                sslHost: environment.sslHost,
            })}`,
        })),
    });

    if (!config.integrationEnvironments.some(environment => environment.accountShortName === accountShortName)) {
        throw new Error([
            `The account short name "${accountShortName}" is not monitored by scicm.`
        ].join('\n'));
    }

    return accountShortName;
}

interface SelectManagedIntegrationPackageParams {
    config: SCICMConfig;
    defaultPackageId?: string;
    integrationPackages: Awaited<ReturnType<typeof getIntegrationPackages>>;
}

export async function selectManagedIntegrationPackage({ config, defaultPackageId, integrationPackages }: SelectManagedIntegrationPackageParams) {
    const packageId = defaultPackageId ?? await select({
        message: 'Select an integration package:',
        choices: integrationPackages.map(pkg => ({
            value: pkg.id,
            name: `[${pkg.id}]:\t${pkg.name ?? '_Unnamed_Package_'}`,
        })),
    });

    const managedIntegrationPackage = config.managedIntegrationPackages?.find(monitoredPackage => monitoredPackage.packageId === packageId);
    if (!managedIntegrationPackage) throw new Error([
        `The integration package ${packageId} is not being monitored.`
    ].join('\n'));

    return managedIntegrationPackage;
}

interface SelectIntegrationArtifactIdParams {
    defaultArtifactId?: string;
    managedIntegrationPackage: Awaited<ReturnType<typeof selectManagedIntegrationPackage>>;
    remoteArtifacts: Awaited<ReturnType<typeof getIntergrationPackageArtifacts>>;
}

export async function selectRemoteIntegrationArtifact({ defaultArtifactId, managedIntegrationPackage, remoteArtifacts }: SelectIntegrationArtifactIdParams) {
    // Remove the ignored artifacts from the artifacts list
    const monitoredArtifacts = remoteArtifacts.filter(remoteArtifact => !managedIntegrationPackage.ignoredArtifactIds.includes(remoteArtifact.Id));

    const artifactId = defaultArtifactId ?? await select({
        message: 'Select an Intergration Artifact to update configurations for:',
        choices: monitoredArtifacts.map(artifact => ({
            value: artifact.Id,
            name: `[${artifact.Id}]:\t${artifact.Name ?? '_Unnamed_Artifact_'}`,
        })),
    });

    if (!monitoredArtifacts.some(monitoredArtifacts => monitoredArtifacts.Id === artifactId)) {
        throw new Error([
            `The artifact "${artifactId}" is not being monitored in the package "${managedIntegrationPackage.packageId}".`,
        ].join('\n'));
    }

    // Find the remote artifact
    const remoteArtifact = remoteArtifacts.find(artifact => artifact.Id === artifactId);
    if (!remoteArtifact) throw new Error(`🚨 Artifact "${artifactId}" does not exist in the package "${managedIntegrationPackage.packageId}"!`);

    return remoteArtifact;
}