/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  BatchChangeSet,
  CreateRequestBuilder,
  DeSerializers,
  DeleteRequestBuilder,
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  ODataBatchRequestBuilder,
  OperationRequestBuilder,
  UpdateRequestBuilder
} from '@sap-cloud-sdk/odata-v2';
import { transformVariadicArgumentToArray } from '@sap-cloud-sdk/util';

import {
  ApiDefinitions,
  BuildAndDeployStatus,
  Configurations,
  CopyIntegrationPackageParameters,
  CustomTagConfigurations,
  CustomTags,
  DataStoreEntries,
  DataStores,
  DefaultValMaps,
  DeleteValMapsParameters,
  DeployIntegrationAdapterDesigntimeArtifactParameters,
  DeployIntegrationDesigntimeArtifactParameters,
  DeployMessageMappingDesigntimeArtifactParameters,
  DeployScriptCollectionDesigntimeArtifactParameters,
  DeployValueMappingDesigntimeArtifactParameters,
  EntryPoints,
  IntegrationAdapterDesigntimeArtifacts,
  IntegrationDesigntimeArtifactSaveAsVersionParameters,
  IntegrationDesigntimeArtifacts,
  IntegrationDesigntimeLocks,
  IntegrationPackages,
  IntegrationRuntimeArtifacts,
  MdiDeltaToken,
  MessageMappingDesigntimeArtifactSaveAsVersionParameters,
  MessageMappingDesigntimeArtifacts,
  Resources,
  RuntimeArtifactErrorInformations,
  ScriptCollectionDesigntimeArtifacts,
  ServiceEndpoints,
  UpdateDefaultValMapParameters,
  UpsertValMapsParameters,
  ValMapSchema,
  ValMaps,
  ValueMappingDesigntimeArtifactSaveAsVersionParameters,
  ValueMappingDesigntimeArtifacts,
  Variables
} from './index.js';

/**
 * Batch builder for operations supported on the IntegrationContent.
 * @param requests The requests of the batch
 * @returns A request builder for batch.
 */
export function batch<DeSerializersT extends DeSerializers>(
  ...requests: Array<
    | BatchChangeSet<DeSerializersT>
    | ReadIntegrationContentRequestBuilder<DeSerializersT>
  >
): ODataBatchRequestBuilder<DeSerializersT>;
export function batch<DeSerializersT extends DeSerializers>(
  requests: Array<
    | BatchChangeSet<DeSerializersT>
    | ReadIntegrationContentRequestBuilder<DeSerializersT>
  >
): ODataBatchRequestBuilder<DeSerializersT>;
export function batch<DeSerializersT extends DeSerializers>(
  first:
    | Array<
      | BatchChangeSet<DeSerializersT>
      | ReadIntegrationContentRequestBuilder<DeSerializersT>
    >
    | BatchChangeSet<DeSerializersT>
    | ReadIntegrationContentRequestBuilder<DeSerializersT>
    | undefined,
  ...rest: Array<
    | BatchChangeSet<DeSerializersT>
    | ReadIntegrationContentRequestBuilder<DeSerializersT>
  >
): ODataBatchRequestBuilder<DeSerializersT> {
  return new ODataBatchRequestBuilder(
    defaultIntegrationContentPath,
    transformVariadicArgumentToArray(first, rest)
  );
}

/**
 * Change set constructor consists of write operations supported on the IntegrationContent.
 * @param requests The requests of the change set
 * @returns A change set for batch.
 */
export function changeset<DeSerializersT extends DeSerializers>(
  ...requests: Array<WriteIntegrationContentRequestBuilder<DeSerializersT>>
): BatchChangeSet<DeSerializersT>;
export function changeset<DeSerializersT extends DeSerializers>(
  requests: Array<WriteIntegrationContentRequestBuilder<DeSerializersT>>
): BatchChangeSet<DeSerializersT>;
export function changeset<DeSerializersT extends DeSerializers>(
  first:
    | Array<WriteIntegrationContentRequestBuilder<DeSerializersT>>
    | WriteIntegrationContentRequestBuilder<DeSerializersT>
    | undefined,
  ...rest: Array<WriteIntegrationContentRequestBuilder<DeSerializersT>>
): BatchChangeSet<DeSerializersT> {
  return new BatchChangeSet(transformVariadicArgumentToArray(first, rest));
}

export const defaultIntegrationContentPath = '/';
export type ReadIntegrationContentRequestBuilder<
  DeSerializersT extends DeSerializers
> =
  | GetAllRequestBuilder<
    CustomTagConfigurations<DeSerializersT>,
    DeSerializersT
  >
  | GetAllRequestBuilder<
    IntegrationAdapterDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | GetAllRequestBuilder<
    IntegrationDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | GetAllRequestBuilder<
    IntegrationDesigntimeLocks<DeSerializersT>,
    DeSerializersT
  >
  | GetAllRequestBuilder<
    IntegrationRuntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | GetAllRequestBuilder<
    MessageMappingDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | GetAllRequestBuilder<
    RuntimeArtifactErrorInformations<DeSerializersT>,
    DeSerializersT
  >
  | GetAllRequestBuilder<
    ScriptCollectionDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | GetAllRequestBuilder<
    ValueMappingDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | GetAllRequestBuilder<ApiDefinitions<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BuildAndDeployStatus<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<Configurations<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<CustomTags<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<DataStoreEntries<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<DataStores<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<DefaultValMaps<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<EntryPoints<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<IntegrationPackages<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<MdiDeltaToken<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<Resources<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<ServiceEndpoints<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<ValMapSchema<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<ValMaps<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<Variables<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
    CustomTagConfigurations<DeSerializersT>,
    DeSerializersT
  >
  | GetByKeyRequestBuilder<
    IntegrationAdapterDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | GetByKeyRequestBuilder<
    IntegrationDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | GetByKeyRequestBuilder<
    IntegrationDesigntimeLocks<DeSerializersT>,
    DeSerializersT
  >
  | GetByKeyRequestBuilder<
    IntegrationRuntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | GetByKeyRequestBuilder<
    MessageMappingDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | GetByKeyRequestBuilder<
    RuntimeArtifactErrorInformations<DeSerializersT>,
    DeSerializersT
  >
  | GetByKeyRequestBuilder<
    ScriptCollectionDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | GetByKeyRequestBuilder<
    ValueMappingDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | GetByKeyRequestBuilder<ApiDefinitions<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<BuildAndDeployStatus<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<Configurations<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<CustomTags<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<DataStoreEntries<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<DataStores<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<DefaultValMaps<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<EntryPoints<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<IntegrationPackages<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<MdiDeltaToken<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<Resources<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<ServiceEndpoints<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<ValMapSchema<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<ValMaps<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<Variables<DeSerializersT>, DeSerializersT>;
export type WriteIntegrationContentRequestBuilder<
  DeSerializersT extends DeSerializers
> =
  | CreateRequestBuilder<
    CustomTagConfigurations<DeSerializersT>,
    DeSerializersT
  >
  | CreateRequestBuilder<
    IntegrationAdapterDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | CreateRequestBuilder<
    IntegrationDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | CreateRequestBuilder<
    IntegrationDesigntimeLocks<DeSerializersT>,
    DeSerializersT
  >
  | CreateRequestBuilder<
    IntegrationRuntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | CreateRequestBuilder<
    MessageMappingDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | CreateRequestBuilder<
    RuntimeArtifactErrorInformations<DeSerializersT>,
    DeSerializersT
  >
  | CreateRequestBuilder<
    ScriptCollectionDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | CreateRequestBuilder<
    ValueMappingDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | CreateRequestBuilder<ApiDefinitions<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BuildAndDeployStatus<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<Configurations<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<CustomTags<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<DataStoreEntries<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<DataStores<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<DefaultValMaps<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<EntryPoints<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<IntegrationPackages<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<MdiDeltaToken<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<Resources<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<ServiceEndpoints<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<ValMapSchema<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<ValMaps<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<Variables<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<
    CustomTagConfigurations<DeSerializersT>,
    DeSerializersT
  >
  | DeleteRequestBuilder<
    IntegrationAdapterDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | DeleteRequestBuilder<
    IntegrationDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | DeleteRequestBuilder<
    IntegrationDesigntimeLocks<DeSerializersT>,
    DeSerializersT
  >
  | DeleteRequestBuilder<
    IntegrationRuntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | DeleteRequestBuilder<
    MessageMappingDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | DeleteRequestBuilder<
    RuntimeArtifactErrorInformations<DeSerializersT>,
    DeSerializersT
  >
  | DeleteRequestBuilder<
    ScriptCollectionDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | DeleteRequestBuilder<
    ValueMappingDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | DeleteRequestBuilder<ApiDefinitions<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BuildAndDeployStatus<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<Configurations<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<CustomTags<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<DataStoreEntries<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<DataStores<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<DefaultValMaps<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<EntryPoints<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<IntegrationPackages<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<MdiDeltaToken<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<Resources<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<ServiceEndpoints<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<ValMapSchema<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<ValMaps<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<Variables<DeSerializersT>, DeSerializersT>
  | OperationRequestBuilder<
    DeSerializersT,
    CopyIntegrationPackageParameters<DeSerializersT>,
    IntegrationPackages
  >
  | OperationRequestBuilder<
    DeSerializersT,
    DeleteValMapsParameters<DeSerializersT>,
    string
  >
  | OperationRequestBuilder<
    DeSerializersT,
    DeployIntegrationAdapterDesigntimeArtifactParameters<DeSerializersT>,
    IntegrationAdapterDesigntimeArtifacts
  >
  | OperationRequestBuilder<
    DeSerializersT,
    DeployIntegrationDesigntimeArtifactParameters<DeSerializersT>,
    IntegrationDesigntimeArtifacts
  >
  | OperationRequestBuilder<
    DeSerializersT,
    DeployMessageMappingDesigntimeArtifactParameters<DeSerializersT>,
    MessageMappingDesigntimeArtifacts
  >
  | OperationRequestBuilder<
    DeSerializersT,
    DeployScriptCollectionDesigntimeArtifactParameters<DeSerializersT>,
    ScriptCollectionDesigntimeArtifacts
  >
  | OperationRequestBuilder<
    DeSerializersT,
    DeployValueMappingDesigntimeArtifactParameters<DeSerializersT>,
    ValueMappingDesigntimeArtifacts
  >
  | OperationRequestBuilder<
    DeSerializersT,
    IntegrationDesigntimeArtifactSaveAsVersionParameters<DeSerializersT>,
    IntegrationDesigntimeArtifacts
  >
  | OperationRequestBuilder<
    DeSerializersT,
    MessageMappingDesigntimeArtifactSaveAsVersionParameters<DeSerializersT>,
    MessageMappingDesigntimeArtifacts
  >
  | OperationRequestBuilder<
    DeSerializersT,
    UpdateDefaultValMapParameters<DeSerializersT>,
    DefaultValMaps
  >
  | OperationRequestBuilder<
    DeSerializersT,
    UpsertValMapsParameters<DeSerializersT>,
    ValMaps
  >
  | OperationRequestBuilder<
    DeSerializersT,
    ValueMappingDesigntimeArtifactSaveAsVersionParameters<DeSerializersT>,
    ValueMappingDesigntimeArtifacts
  >
  | UpdateRequestBuilder<
    CustomTagConfigurations<DeSerializersT>,
    DeSerializersT
  >
  | UpdateRequestBuilder<
    IntegrationAdapterDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | UpdateRequestBuilder<
    IntegrationDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | UpdateRequestBuilder<
    IntegrationDesigntimeLocks<DeSerializersT>,
    DeSerializersT
  >
  | UpdateRequestBuilder<
    IntegrationRuntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | UpdateRequestBuilder<
    MessageMappingDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | UpdateRequestBuilder<
    RuntimeArtifactErrorInformations<DeSerializersT>,
    DeSerializersT
  >
  | UpdateRequestBuilder<
    ScriptCollectionDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | UpdateRequestBuilder<
    ValueMappingDesigntimeArtifacts<DeSerializersT>,
    DeSerializersT
  >
  | UpdateRequestBuilder<ApiDefinitions<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BuildAndDeployStatus<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<Configurations<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<CustomTags<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<DataStoreEntries<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<DataStores<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<DefaultValMaps<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<EntryPoints<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<IntegrationPackages<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<MdiDeltaToken<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<Resources<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<ServiceEndpoints<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<ValMapSchema<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<ValMaps<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<Variables<DeSerializersT>, DeSerializersT>;
