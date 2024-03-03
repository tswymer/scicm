/* eslint-disable */
/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  Entity,
  DefaultDeSerializers,
  DeSerializers,
  DeserializedType
} from '@sap-cloud-sdk/odata-v2';
import type { IntegrationRuntimeArtifactsApi } from './IntegrationRuntimeArtifactsApi.js';
import {
  RuntimeArtifactErrorInformations,
  RuntimeArtifactErrorInformationsType
} from './RuntimeArtifactErrorInformations.js';

/**
 * This class represents the entity "IntegrationRuntimeArtifacts" of service "com.sap.hci.api".
 */
export class IntegrationRuntimeArtifacts<
  T extends DeSerializers = DefaultDeSerializers
>
  extends Entity
  implements IntegrationRuntimeArtifactsType<T>
{
  /**
   * Technical entity name for IntegrationRuntimeArtifacts.
   */
  static _entityName = 'IntegrationRuntimeArtifacts';
  /**
   * Default url path for the according service.
   */
  static _defaultBasePath = '/';
  /**
   * All key fields of the IntegrationRuntimeArtifacts entity
   */
  static _keys = ['Id'];
  /**
   * Id.
   */
  declare id: DeserializedType<T, 'Edm.String'>;
  /**
   * Version.
   * @nullable
   */
  declare version?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name.
   * @nullable
   */
  declare name?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Type.
   * @nullable
   */
  declare type?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Deployed By.
   * @nullable
   */
  declare deployedBy?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Deployed On.
   * @nullable
   */
  declare deployedOn?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Status.
   * @nullable
   */
  declare status?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * One-to-one navigation property to the {@link RuntimeArtifactErrorInformations} entity.
   */
  declare errorInformation?: RuntimeArtifactErrorInformations<T> | null;

  constructor(_entityApi: IntegrationRuntimeArtifactsApi<T>) {
    super(_entityApi);
  }
}

export interface IntegrationRuntimeArtifactsType<
  T extends DeSerializers = DefaultDeSerializers
> {
  id: DeserializedType<T, 'Edm.String'>;
  version?: DeserializedType<T, 'Edm.String'> | null;
  name?: DeserializedType<T, 'Edm.String'> | null;
  type?: DeserializedType<T, 'Edm.String'> | null;
  deployedBy?: DeserializedType<T, 'Edm.String'> | null;
  deployedOn?: DeserializedType<T, 'Edm.DateTime'> | null;
  status?: DeserializedType<T, 'Edm.String'> | null;
  errorInformation?: RuntimeArtifactErrorInformationsType<T> | null;
}
