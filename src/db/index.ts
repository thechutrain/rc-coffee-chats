import * as types from './types';
import { initBaseModel } from './base-model';

/**
 * myTinyOrm
 * input -> schema for all my tables
 * output -> object for each table, with set methods
 */
export function myTinyOrm() {
  // Outline:
  // 1) make db connection
  const models = {};
  // 2) for each schema, call modelFactory and save to models obj

  return {
    // db: 'the db connection', // Question: should I not expose db connection?
    models
  };
}

export function modelFactory(db) {
  let baseModel = null;
  if (!baseModel) {
    baseModel = initBaseModel(db);
  }

  return (schema: types.ISchema) => {
    // TODO: validate the schema
    const model = Object.create(baseModel);
    model.name = schema.tableName;
    model.fields = schema.fields;

    return model;
  };
}
