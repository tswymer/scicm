import { checkbox, select } from '@inquirer/prompts';
import { Command, ux } from '@oclif/core';

import { createArtifactConfigurationMonitoring } from '../../utils/artifact-configuration.js';
import { getIntegrationDesigntimeArtifactConfigurations, getIntegrationPackages, getIntergrationPackageDesigntimeArtifacts } from '../../utils/cpi.js';
import { getConfiguration, getMonitoredArtifactsByIntegrationPackage, setConfiguration } from '../../utils/sicm-configuration.js';

export default class Package extends Command {
    async run(): Promise<void> {
        this.log('📦 Add a new Intergration Package 📦');

        // Get the integration package to add from the user
        ux.action.start('Loading integration packages from SAP CPI...');
        const integrationPackages = await getIntegrationPackages();
        ux.action.stop();

        const selectedPackageId = await select({
            message: 'Select an Intergration Package to start monitoring configuration for:',
            choices: integrationPackages.map(pkg => ({
                value: pkg.id,
                name: `[${pkg.id}]:\t${pkg.name ?? '_Unnamed_Package_'}`,
            })),
        });

        // Make sure the package is not already being monitored
        const configuration = await getConfiguration();
        if (configuration.monitoredIntegrationPackages?.some(monitoredPackage => monitoredPackage.packageId === selectedPackageId)) {
            this.error(`The integration package ${selectedPackageId} is already being monitored.`);
        }

        // Get the integration package designtime artifacts to monitor
        ux.action.start(`Loading integration artifacts from SAP CPI packeg ${selectedPackageId}...`);
        const integrationDesigntimeArtifacts = await getIntergrationPackageDesigntimeArtifacts(selectedPackageId);
        ux.action.stop();
        const selectedIntegrationArtifacts = await checkbox({
            message: 'Select the integration artifacts to start monitoring configurations for:',
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

        // Update the configuration
        await setConfiguration(this, {
            ...configuration,
            monitoredIntegrationPackages: [
                ...configuration.monitoredIntegrationPackages ?? [],
                {
                    packageId: selectedPackageId,
                    ignoredArtifactIds: excludedArtifactIds,
                }
            ]
        });

        // Export the configurations for the selected artifacts
        ux.action.start(`Exporting integration artifact configurations...`);
        const monitoredArtifacts = await getMonitoredArtifactsByIntegrationPackage(this, selectedPackageId);

        let exportedConfigurations = 0;

        for (const selectedArtifact of selectedIntegrationArtifacts) {
            // Get the artifact from the list of monitored artifacts
            const artifact = monitoredArtifacts.find(artifact => artifact.Id === selectedArtifact);
            if (!artifact) this.error(`Artifact "${selectedArtifact}" is not present in the integration package "${selectedPackageId}".`);

            // Get the configurations for the artifact
            const artifactConfigurations = await getIntegrationDesigntimeArtifactConfigurations(artifact.Id, artifact.Version);
            exportedConfigurations += artifactConfigurations.length;

            // Create the artifact configuration monitoring file
            const createdAt = new Date().toISOString();
            await createArtifactConfigurationMonitoring(this, selectedPackageId, {
                _createdAt: createdAt,
                artifactId: artifact.Id,
                artifactConfigurations: [{
                    _createdAt: createdAt,
                    artifactVersion: artifact.Version,
                    configurations: artifactConfigurations,
                }]
            });
        }

        ux.action.stop(`Exported ${exportedConfigurations} configurations! 🎉\n`);
    }
}
