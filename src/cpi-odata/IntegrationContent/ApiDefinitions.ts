/* eslint-disable */
/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  DeSerializers,
  DefaultDeSerializers,
  DeserializedType,
  Entity
} from '@sap-cloud-sdk/odata-v2';

import type { ApiDefinitionsApi } from './ApiDefinitionsApi.js';

/**
 * This class represents the entity "APIDefinitions" of service "com.sap.hci.api".
 */
export class ApiDefinitions<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements ApiDefinitionsType<T>
{
  /**
   * Name.
   */
  declare name: DeserializedType<T, 'Edm.String'>;
  /**
   * Url.
   */
  declare url: DeserializedType<T, 'Edm.String'>;
  /**
   * Default url path for the according service.
   */
  static _defaultBasePath = '/';
  /**
   * Technical entity name for ApiDefinitions.
   */
  static _entityName = 'APIDefinitions';
  /**
   * All key fields of the ApiDefinitions entity
   */
  static _keys = ['Url'];

  constructor(_entityApi: ApiDefinitionsApi<T>) {
    super(_entityApi);
  }
}

export interface ApiDefinitionsType<
  T extends DeSerializers = DefaultDeSerializers
> {
  name: DeserializedType<T, 'Edm.String'>;
  url: DeserializedType<T, 'Edm.String'>;
}
