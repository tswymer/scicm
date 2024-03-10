import { checkbox, select } from '@inquirer/prompts';
import { Command, Flags, ux } from '@oclif/core';

import { createManagedArtifact } from '../../utils/artifact-management.js';
import { getArtifactVariables } from '../../utils/artifact-variables.js';
import { getConfig, getEnvironment, setConfig } from '../../utils/cicm-configuration.js';
import { buildCIODataURL, getIntegrationArtifactConfigurations, getIntegrationPackages, getIntergrationPackageArtifacts } from '../../utils/cloud-integration.js';

export default class AddPackage extends Command {
    static flags = {
        accountShortName: Flags.string({ description: 'the accountShortName to verify configurations for' }),
        packageId: Flags.string({ description: 'the id of the integration package to add.' }),
    }

    async run(): Promise<void> {
        const { flags } = await this.parse(AddPackage);

        this.log('Add a new Intergration Package to the Cloud Integration Configuration Manager\n');

        const { integrationEnvironments } = await getConfig();

        // Select the environment to add the integration package from
        const accountShortName = flags.accountShortName ?? await select({
            message: 'Select the environment to add the integration package from:',
            choices: integrationEnvironments.map(environment => ({
                value: environment.accountShortName,
                name: `${buildCIODataURL({
                    accountShortName: environment.accountShortName,
                    region: environment.region,
                    sslHost: environment.sslHost,
                })}`,
            })),
        });

        this.log('');

        const config = await getConfig();
        const environment = getEnvironment(config, accountShortName);
        const artifactVariables = await getArtifactVariables(environment.accountShortName);

        // Get the integration package to add from the user
        ux.action.start('Loading integration packages from SAP CI...');
        const integrationPackages = await getIntegrationPackages(environment);
        ux.action.stop();

        this.log('');

        const selectedPackageId = flags.packageId ?? await select({
            message: 'Select an Intergration Package to start managing configuration for:',
            choices: integrationPackages.map(pkg => ({
                value: pkg.id,
                name: `[${pkg.id}]:\t${pkg.name ?? '_Unnamed_Package_'}`,
            })),
        });

        // Make sure the package is not already being monitored
        if (config.managedIntegrationPackages?.some(monitoredPackage => monitoredPackage.packageId === selectedPackageId)) {
            this.error(`The integration package ${selectedPackageId} is already being monitored.`);
        }

        this.log('');

        // Get the integration package designtime artifacts to monitor
        ux.action.start(`Loading integration artifacts from package "${selectedPackageId}"...`);
        const integrationDesigntimeArtifacts = await getIntergrationPackageArtifacts(environment, selectedPackageId);
        ux.action.stop();

        this.log('');

        const selectedIntegrationArtifacts = await checkbox({
            message: 'Select the integration artifacts to start managing configurations for:',
            required: true,
            choices: integrationDesigntimeArtifacts.map(artifact => ({
                value: artifact.Id,
                name: `[${artifact.Id}]:\t${artifact.Name ?? '_Unnamed_Artifact_'}`,
                checked: true,
            })),
            theme: {
                style: {
                    renderSelectedChoices(selectedChoices: unknown[], allChoices: unknown[]) {
                        return `Selected ${selectedChoices.length}/${allChoices.length} artifacts`;
                    },
                }
            }
        });

        // Get the list of excluded artifact ids
        const excludedArtifactIds = integrationDesigntimeArtifacts
            .filter(artifact => !selectedIntegrationArtifacts.includes(artifact.Id))
            .map(artifact => artifact.Id);

        // Update the configuration with the new managed integration package
        await setConfig({
            ...config,
            managedIntegrationPackages: [
                ...config.managedIntegrationPackages ?? [],
                {
                    packageId: selectedPackageId,
                    ignoredArtifactIds: excludedArtifactIds,
                },
            ]
        });

        this.log('');

        // Export the configurations for the selected artifacts
        ux.action.start(`Exporting integration artifact configurations...`);
        const integrationArtifacts = await getIntergrationPackageArtifacts(environment, selectedPackageId);

        let exportedConfigurations = 0;

        for (const selectedArtifact of selectedIntegrationArtifacts) {
            // Get the artifact from the list of monitored artifacts
            const artifact = integrationArtifacts.find(artifact => artifact.Id === selectedArtifact);
            if (!artifact) this.error(`Artifact "${selectedArtifact}" is not present in the integration package "${selectedPackageId}".`);

            // Get the configurations for the artifact
            const artifactConfigurations = await getIntegrationArtifactConfigurations({
                artifactId: artifact.Id,
                artifactVersion: artifact.Version,
                environment,
                artifactVariables,
            });
            exportedConfigurations += artifactConfigurations.configurations.length;

            // Create the artifact configuration management file
            const createdAt = new Date().toISOString();
            await createManagedArtifact(selectedPackageId, {
                _createdAt: createdAt,
                artifactId: artifact.Id,
                artifactConfigurations: [{
                    _createdAt: createdAt,
                    artifactVersion: artifact.Version,
                    configurations: artifactConfigurations.configurations
                }]
            });

            this.log(`✅ Exported ${artifactConfigurations.configurations.length ?? 0}\tconfiguration(s) for "${artifact.Id}"`);
        }

        ux.action.stop(`export complete!\n`);

        this.log(`🎉 Successfully added ${exportedConfigurations} configurations from the "${selectedPackageId}" integration package!`);
    }
}
