/* eslint-disable */
/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  CreateRequestBuilder,
  DeSerializers,
  DefaultDeSerializers,
  DeleteRequestBuilder,
  DeserializedType,
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  RequestBuilder,
  UpdateRequestBuilder
} from '@sap-cloud-sdk/odata-v2';
import { IntegrationRuntimeArtifacts } from './IntegrationRuntimeArtifacts.js';

/**
 * Request builder class for operations supported on the {@link IntegrationRuntimeArtifacts} entity.
 */
export class IntegrationRuntimeArtifactsRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers
> extends RequestBuilder<IntegrationRuntimeArtifacts<T>, T> {
  /**
   * Returns a request builder for querying all `IntegrationRuntimeArtifacts` entities.
   * @returns A request builder for creating requests to retrieve all `IntegrationRuntimeArtifacts` entities.
   */
  getAll(): GetAllRequestBuilder<IntegrationRuntimeArtifacts<T>, T> {
    return new GetAllRequestBuilder<IntegrationRuntimeArtifacts<T>, T>(
      this.entityApi
    );
  }

  /**
   * Returns a request builder for creating a `IntegrationRuntimeArtifacts` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `IntegrationRuntimeArtifacts`.
   */
  create(
    entity: IntegrationRuntimeArtifacts<T>
  ): CreateRequestBuilder<IntegrationRuntimeArtifacts<T>, T> {
    return new CreateRequestBuilder<IntegrationRuntimeArtifacts<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for retrieving one `IntegrationRuntimeArtifacts` entity based on its keys.
   * @param id Key property. See {@link IntegrationRuntimeArtifacts.id}.
   * @returns A request builder for creating requests to retrieve one `IntegrationRuntimeArtifacts` entity based on its keys.
   */
  getByKey(
    id: DeserializedType<T, 'Edm.String'>
  ): GetByKeyRequestBuilder<IntegrationRuntimeArtifacts<T>, T> {
    return new GetByKeyRequestBuilder<IntegrationRuntimeArtifacts<T>, T>(
      this.entityApi,
      { Id: id }
    );
  }

  /**
   * Returns a request builder for updating an entity of type `IntegrationRuntimeArtifacts`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `IntegrationRuntimeArtifacts`.
   */
  update(
    entity: IntegrationRuntimeArtifacts<T>
  ): UpdateRequestBuilder<IntegrationRuntimeArtifacts<T>, T> {
    return new UpdateRequestBuilder<IntegrationRuntimeArtifacts<T>, T>(
      this.entityApi,
      entity
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `IntegrationRuntimeArtifacts`.
   * @param id Key property. See {@link IntegrationRuntimeArtifacts.id}.
   * @returns A request builder for creating requests that delete an entity of type `IntegrationRuntimeArtifacts`.
   */
  delete(id: string): DeleteRequestBuilder<IntegrationRuntimeArtifacts<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `IntegrationRuntimeArtifacts`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `IntegrationRuntimeArtifacts` by taking the entity as a parameter.
   */
  delete(
    entity: IntegrationRuntimeArtifacts<T>
  ): DeleteRequestBuilder<IntegrationRuntimeArtifacts<T>, T>;
  delete(
    idOrEntity: any
  ): DeleteRequestBuilder<IntegrationRuntimeArtifacts<T>, T> {
    return new DeleteRequestBuilder<IntegrationRuntimeArtifacts<T>, T>(
      this.entityApi,
      idOrEntity instanceof IntegrationRuntimeArtifacts
        ? idOrEntity
        : { Id: idOrEntity! }
    );
  }
}
