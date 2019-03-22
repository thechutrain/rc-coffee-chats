import * as types from './my-orm-types';
import { initBaseModel } from './init-base-model';

function initModelFactory(db) {
  const baseModel = initBaseModel(db);

  return (schema: types.ISchema) => {
    // TODO: validate the schema
    const model = Object.create(baseModel);
    model.name = schema.tableName;
    model.fields = schema.fields;

    return model;
  };
}

// this fn input = string --> applied to the db

// ===== testing
const msg = 'im the db';
const factory = initModelFactory(msg);
const userSchema: types.ISchema = {
  tableName: 'user',
  fields: {
    id: { type: 'INTEGER', isPrimaryKey: true }
  }
};

const childModel = factory(userSchema);
console.log(childModel);
// console.log(childModel.primaryKey);

// console.log(childModel.db)
// childModel.db = 'not changed'
// console.log(childModel.db)

// =============
