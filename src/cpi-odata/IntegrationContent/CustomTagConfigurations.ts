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

import type { CustomTagConfigurationsApi } from './CustomTagConfigurationsApi.js';

/**
 * This class represents the entity "CustomTagConfigurations" of service "com.sap.hci.api".
 */
export class CustomTagConfigurations<
  T extends DeSerializers = DefaultDeSerializers
>
  extends Entity
  implements CustomTagConfigurationsType<T>
{
  /**
   * Custom Tags Configuration Content.
   * @nullable
   */
  declare customTagsConfigurationContent?: DeserializedType<
    T,
    'Edm.String'
  > | null;

  /**
   * Id.
   */
  declare id: DeserializedType<T, 'Edm.String'>;
  /**
   * Default url path for the according service.
   */
  static _defaultBasePath = '/';
  /**
   * Technical entity name for CustomTagConfigurations.
   */
  static _entityName = 'CustomTagConfigurations';
  /**
   * All key fields of the CustomTagConfigurations entity
   */
  static _keys = ['Id'];

  constructor(_entityApi: CustomTagConfigurationsApi<T>) {
    super(_entityApi);
  }
}

export interface CustomTagConfigurationsType<
  T extends DeSerializers = DefaultDeSerializers
> {
  customTagsConfigurationContent?: DeserializedType<T, 'Edm.String'> | null;
  id: DeserializedType<T, 'Edm.String'>;
}
