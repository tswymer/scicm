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

import type { BuildAndDeployStatusApi } from './BuildAndDeployStatusApi.js';

/**
 * This class represents the entity "BuildAndDeployStatus" of service "com.sap.hci.api".
 */
export class BuildAndDeployStatus<
  T extends DeSerializers = DefaultDeSerializers
>
  extends Entity
  implements BuildAndDeployStatusType<T>
{
  /**
   * Status.
   * @nullable
   */
  declare status?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Task Id.
   */
  declare taskId: DeserializedType<T, 'Edm.String'>;
  /**
   * Default url path for the according service.
   */
  static _defaultBasePath = '/';
  /**
   * Technical entity name for BuildAndDeployStatus.
   */
  static _entityName = 'BuildAndDeployStatus';
  /**
   * All key fields of the BuildAndDeployStatus entity
   */
  static _keys = ['TaskId'];

  constructor(_entityApi: BuildAndDeployStatusApi<T>) {
    super(_entityApi);
  }
}

export interface BuildAndDeployStatusType<
  T extends DeSerializers = DefaultDeSerializers
> {
  status?: DeserializedType<T, 'Edm.String'> | null;
  taskId: DeserializedType<T, 'Edm.String'>;
}
