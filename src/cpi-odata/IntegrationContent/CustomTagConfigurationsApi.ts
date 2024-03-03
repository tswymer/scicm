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

import { CustomTagConfigurations } from './CustomTagConfigurations.js';
import { CustomTagConfigurationsRequestBuilder } from './CustomTagConfigurationsRequestBuilder.js';
export class CustomTagConfigurationsApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers
> implements EntityApi<CustomTagConfigurations<DeSerializersT>, DeSerializersT>
{
  public deSerializers: DeSerializersT;

  entityConstructor = CustomTagConfigurations;

  private _fieldBuilder?: FieldBuilder<
    typeof CustomTagConfigurations,
    DeSerializersT
  >;

  private _schema?: {
    ALL_FIELDS: AllFields<CustomTagConfigurations<DeSerializers>>;
    CUSTOM_TAGS_CONFIGURATION_CONTENT: OrderableEdmTypeField<
      CustomTagConfigurations<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ID: OrderableEdmTypeField<
      CustomTagConfigurations<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
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
  ): CustomTagConfigurationsApi<DeSerializersT> {
    return new CustomTagConfigurationsApi(deSerializers);
  }

  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        CustomTagConfigurations,
        this.deSerializers
      );
    }

    return this._fieldBuilder;
  }

  get schema() {
    if (!this._schema) {
      const { fieldBuilder } = this;
      this._schema = {
        /**
         * Static representation of the {@link id} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ID: fieldBuilder.buildEdmTypeField('Id', 'Edm.String', false),
        /**
         * Static representation of the {@link customTagsConfigurationContent} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOM_TAGS_CONFIGURATION_CONTENT: fieldBuilder.buildEdmTypeField(
          'CustomTagsConfigurationContent',
          'Edm.String',
          true
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', CustomTagConfigurations)
      };
    }

    return this._schema;
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT
  ): CustomField<
    CustomTagConfigurations<DeSerializersT>,
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

  entityBuilder(): EntityBuilderType<
    CustomTagConfigurations<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      CustomTagConfigurations<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  requestBuilder(): CustomTagConfigurationsRequestBuilder<DeSerializersT> {
    return new CustomTagConfigurationsRequestBuilder<DeSerializersT>(this);
  }

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }
}
