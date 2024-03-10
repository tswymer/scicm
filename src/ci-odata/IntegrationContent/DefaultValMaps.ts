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
import { Value, ValueField } from './Value.js';
import type { DefaultValMapsApi } from './DefaultValMapsApi.js';

/**
 * This class represents the entity "DefaultValMaps" of service "com.sap.hci.api".
 */
export class DefaultValMaps<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements DefaultValMapsType<T>
{
  /**
   * Technical entity name for DefaultValMaps.
   */
  static _entityName = 'DefaultValMaps';
  /**
   * Default url path for the according service.
   */
  static _defaultBasePath = '/';
  /**
   * All key fields of the DefaultValMaps entity
   */
  static _keys = ['Id'];
  /**
   * Id.
   */
  declare id: DeserializedType<T, 'Edm.String'>;
  /**
   * Value.
   */
  declare value: Value<T>;

  constructor(_entityApi: DefaultValMapsApi<T>) {
    super(_entityApi);
  }
}

export interface DefaultValMapsType<
  T extends DeSerializers = DefaultDeSerializers
> {
  id: DeserializedType<T, 'Edm.String'>;
  value: Value<T>;
}
