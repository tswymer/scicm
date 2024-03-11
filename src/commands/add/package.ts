import { checkbox } from '@inquirer/prompts';
import { Command, Flags, ux } from '@oclif/core';

import { createManagedArtifact } from '../../utils/artifact-management.js';
import { getArtifactVariables } from '../../utils/artifact-variables.js';
import { selectAccountShortName, selectManagedIntegrationPackage } from '../../utils/cli-utils.js';
import { getIntegrationArtifactConfigurations, getIntegrationPackages, getPackageIntergrationArtifacts } from '../../utils/cloud-integration.js';
import { getConfig, getEnvironment, setConfig } from '../../utils/scicm-configuration.js';

export default class AddPackage extends Command {
    static description = 'Add an integration package to your Cloud Integration Configuration Manager (cicm) project.';

    static flags = {
        accountShortName: Flags.string({ description: 'the accountShortName to verify configurations for' }),
        packageId: Flags.string({ description: 'the id of the integration package to add.' }),
    }

    async run(): Promise<void> {
        const { flags } = await this.parse(AddPackage);

        this.log('Add a new Intergration Package to the Cloud Integration Configuration Manager\n');

        const config = await getConfig();

        const accountShortNameResult = await selectAccountShortName({
            config,
            defaultAccountShortName: flags.accountShortName,
        });

        if (accountShortNameResult.result === 'NOT_MONITORED') this.error([
            `The accountShortName "${flags.accountShortName}" is not monitored in the configuration file.`
        ].join('\n'));

        console.assert(accountShortNameResult.result === 'OK');
        const { accountShortName } = accountShortNameResult;

        this.log('');

        const getEnvironmentResult = getEnvironment({ config, accountShortName });

        if (getEnvironmentResult.result === 'UNKNOWN_ENVIRONMENT') this.error([
            `The accountShortName "${accountShortName}" does not exist in the configuration file.`,
        ].join('\n'));

        console.assert(getEnvironmentResult.result === 'OK');
        const { environment } = getEnvironmentResult;

        const artifactVariables = await getArtifactVariables({ accountShortName: environment.accountShortName });

        // Get the integration package to add from the user
        ux.action.start('Loading integration packages from SAP CI...');
        const integrationPackages = await getIntegrationPackages(environment);
        ux.action.stop();

        this.log('');

        const managedIntegrationPackageResult = await selectManagedIntegrationPackage({
            config,
            defaultPackageId: flags.packageId,
            integrationPackages,
        });

        const packageId = (() => {
            if (managedIntegrationPackageResult.result === 'NOT_MONITORED') return managedIntegrationPackageResult.packageId;
            return managedIntegrationPackageResult.managedIntegrationPackage.packageId;
        })();

        // Make sure the package is not already being monitored
        if (config.managedIntegrationPackages?.some(monitoredPackage => monitoredPackage.packageId === packageId)) {
            this.error(`The integration package ${packageId} is already being monitored.`);
        }

        this.log('');

        // Get the integration package designtime artifacts to monitor
        ux.action.start(`Loading integration artifacts from package "${packageId}"...`);
        const integrationDesigntimeArtifacts = await getPackageIntergrationArtifacts(environment, packageId);
        ux.action.stop();

        this.log('');

        const selectedIntegrationArtifactIds = await checkbox({
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
            .filter(artifact => !selectedIntegrationArtifactIds.includes(artifact.Id))
            .map(artifact => artifact.Id);

        // Update the configuration with the new managed integration package
        await setConfig({
            configuration: {
                ...config,
                managedIntegrationPackages: [
                    ...config.managedIntegrationPackages ?? [],
                    {
                        packageId,
                        monitoredArtifactIds: selectedIntegrationArtifactIds,
                        ignoredArtifactIds: excludedArtifactIds,
                    },
                ],
            }
        });

        this.log('');

        // Export the configurations for the selected artifacts
        ux.action.start(`Exporting integration artifact configurations...`);
        const integrationArtifacts = await getPackageIntergrationArtifacts(environment, packageId);

        let exportedConfigurations = 0;

        for (const selectedArtifact of selectedIntegrationArtifactIds) {
            // Get the artifact from the list of monitored artifacts
            const artifact = integrationArtifacts.find(artifact => artifact.Id === selectedArtifact);
            if (!artifact) this.error(`Artifact "${selectedArtifact}" is not present in the integration package "${packageId}".`);

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
            await createManagedArtifact(packageId, {
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

        this.log(`🎉 Successfully added ${exportedConfigurations} configurations from the "${packageId}" integration package!`);
    }
}
