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

import type { ConfigurationsApi } from './ConfigurationsApi.js';

/**
 * This class represents the entity "Configurations" of service "com.sap.hci.api".
 */
export class Configurations<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements ConfigurationsType<T>
{
  /**
   * Data Type.
   * @nullable
   */
  declare dataType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Parameter Key.
   */
  declare parameterKey: DeserializedType<T, 'Edm.String'>;
  /**
   * Parameter Value.
   * @nullable
   */
  declare parameterValue?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Default url path for the according service.
   */
  static _defaultBasePath = '/';
  /**
   * Technical entity name for Configurations.
   */
  static _entityName = 'Configurations';
  /**
   * All key fields of the Configurations entity
   */
  static _keys = ['ParameterKey'];

  constructor(_entityApi: ConfigurationsApi<T>) {
    super(_entityApi);
  }
}

export interface ConfigurationsType<
  T extends DeSerializers = DefaultDeSerializers
> {
  dataType?: DeserializedType<T, 'Edm.String'> | null;
  parameterKey: DeserializedType<T, 'Edm.String'>;
  parameterValue?: DeserializedType<T, 'Edm.String'> | null;
}
