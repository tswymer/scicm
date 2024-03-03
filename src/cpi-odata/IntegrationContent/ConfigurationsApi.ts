/* eslint-disable */
/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  AllFields,
  CustomField,
  DeSerializers,
  DefaultDeSerializers,
  EntityApi,
  EntityBuilderType,
  FieldBuilder,
  OrderableEdmTypeField,
  defaultDeSerializers,
  entityBuilder
} from '@sap-cloud-sdk/odata-v2';

import { Configurations } from './Configurations.js';
import { ConfigurationsRequestBuilder } from './ConfigurationsRequestBuilder.js';
export class ConfigurationsApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<Configurations<DeSerializersT>, DeSerializersT>
{
  public deSerializers: DeSerializersT;

  entityConstructor = Configurations;

  private _fieldBuilder?: FieldBuilder<typeof Configurations, DeSerializersT>;

  private _schema?: {
    ALL_FIELDS: AllFields<Configurations<DeSerializers>>;
    DATA_TYPE: OrderableEdmTypeField<
      Configurations<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PARAMETER_KEY: OrderableEdmTypeField<
      Configurations<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PARAMETER_VALUE: OrderableEdmTypeField<
      Configurations<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
  };


  private navigationPropertyFields!: {};

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
  ): ConfigurationsApi<DeSerializersT> {
    return new ConfigurationsApi(deSerializers);
  }

  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(Configurations, this.deSerializers);
    }

    return this._fieldBuilder;
  }

  get schema() {
    if (!this._schema) {
      const { fieldBuilder } = this;
      this._schema = {
        /**
         * Static representation of the {@link parameterKey} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PARAMETER_KEY: fieldBuilder.buildEdmTypeField(
          'ParameterKey',
          'Edm.String',
          false
        ),
        /**
         * Static representation of the {@link parameterValue} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PARAMETER_VALUE: fieldBuilder.buildEdmTypeField(
          'ParameterValue',
          'Edm.String',
          true
        ),
        /**
         * Static representation of the {@link dataType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DATA_TYPE: fieldBuilder.buildEdmTypeField(
          'DataType',
          'Edm.String',
          true
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', Configurations)
      };
    }

    return this._schema;
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<Configurations<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable
    ) as any;
  }

  entityBuilder(): EntityBuilderType<
    Configurations<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<Configurations<DeSerializersT>, DeSerializersT>(this);
  }

  requestBuilder(): ConfigurationsRequestBuilder<DeSerializersT> {
    return new ConfigurationsRequestBuilder<DeSerializersT>(this);
  }

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }
}
