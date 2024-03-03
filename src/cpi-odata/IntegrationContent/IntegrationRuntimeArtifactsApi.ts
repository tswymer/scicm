/* eslint-disable */
/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { IntegrationRuntimeArtifacts } from './IntegrationRuntimeArtifacts.js';
import { IntegrationRuntimeArtifactsRequestBuilder } from './IntegrationRuntimeArtifactsRequestBuilder.js';
import { RuntimeArtifactErrorInformationsApi } from './RuntimeArtifactErrorInformationsApi.js';
import {
  CustomField,
  defaultDeSerializers,
  DefaultDeSerializers,
  DeSerializers,
  AllFields,
  entityBuilder,
  EntityBuilderType,
  EntityApi,
  FieldBuilder,
  OrderableEdmTypeField,
  OneToOneLink
} from '@sap-cloud-sdk/odata-v2';
export class IntegrationRuntimeArtifactsApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements
  EntityApi<IntegrationRuntimeArtifacts<DeSerializersT>, DeSerializersT>
{
  public deSerializers: DeSerializersT;

  private constructor(
    deSerializers: DeSerializersT = defaultDeSerializers as any
  ) {
    this.deSerializers = deSerializers;
  }

  /**
   * Do not use this method or the constructor directly.
   * Use the service function as described in the documentation to get an API instance.
   */
  public static _privateFactory<
    DeSerializersT extends DeSerializers = DefaultDeSerializers
  >(
    deSerializers: DeSerializersT = defaultDeSerializers as any
  ): IntegrationRuntimeArtifactsApi<DeSerializersT> {
    return new IntegrationRuntimeArtifactsApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-one navigation property {@link errorInformation} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ERROR_INFORMATION: OneToOneLink<
      IntegrationRuntimeArtifacts<DeSerializersT>,
      DeSerializersT,
      RuntimeArtifactErrorInformationsApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [RuntimeArtifactErrorInformationsApi<DeSerializersT>]
  ): this {
    this.navigationPropertyFields = {
      ERROR_INFORMATION: new OneToOneLink(
        'ErrorInformation',
        this,
        linkedApis[0]
      )
    };
    return this;
  }

  entityConstructor = IntegrationRuntimeArtifacts;

  requestBuilder(): IntegrationRuntimeArtifactsRequestBuilder<DeSerializersT> {
    return new IntegrationRuntimeArtifactsRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    IntegrationRuntimeArtifacts<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      IntegrationRuntimeArtifacts<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<
    IntegrationRuntimeArtifacts<DeSerializersT>,
    DeSerializersT,
    NullableT
  > {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<
    typeof IntegrationRuntimeArtifacts,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        IntegrationRuntimeArtifacts,
        this.deSerializers
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    ID: OrderableEdmTypeField<
      IntegrationRuntimeArtifacts<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    VERSION: OrderableEdmTypeField<
      IntegrationRuntimeArtifacts<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    NAME: OrderableEdmTypeField<
      IntegrationRuntimeArtifacts<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TYPE: OrderableEdmTypeField<
      IntegrationRuntimeArtifacts<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DEPLOYED_BY: OrderableEdmTypeField<
      IntegrationRuntimeArtifacts<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DEPLOYED_ON: OrderableEdmTypeField<
      IntegrationRuntimeArtifacts<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    STATUS: OrderableEdmTypeField<
      IntegrationRuntimeArtifacts<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    /**
     * Static representation of the one-to-one navigation property {@link errorInformation} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    ERROR_INFORMATION: OneToOneLink<
      IntegrationRuntimeArtifacts<DeSerializersT>,
      DeSerializersT,
      RuntimeArtifactErrorInformationsApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<IntegrationRuntimeArtifacts<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
        /**
         * Static representation of the {@link id} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ID: fieldBuilder.buildEdmTypeField('Id', 'Edm.String', false),
        /**
         * Static representation of the {@link version} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VERSION: fieldBuilder.buildEdmTypeField('Version', 'Edm.String', true),
        /**
         * Static representation of the {@link name} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        NAME: fieldBuilder.buildEdmTypeField('Name', 'Edm.String', true),
        /**
         * Static representation of the {@link type} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TYPE: fieldBuilder.buildEdmTypeField('Type', 'Edm.String', true),
        /**
         * Static representation of the {@link deployedBy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DEPLOYED_BY: fieldBuilder.buildEdmTypeField(
          'DeployedBy',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link deployedOn} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DEPLOYED_ON: fieldBuilder.buildEdmTypeField(
          'DeployedOn',
          'Edm.DateTime',
          true
        ),
        /**
         * Static representation of the {@link status} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        STATUS: fieldBuilder.buildEdmTypeField('Status', 'Edm.String', true),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', IntegrationRuntimeArtifacts)
      };
    }

    return this._schema;
  }
}
