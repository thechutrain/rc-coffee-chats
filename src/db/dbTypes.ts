export type sqliteDataTypes = 'TEXT' | 'INTEGER';

// type defaultFieldProp<t> = `DEFAULT ${t}`;
// type optionalFieldProps = 'PRIMARY KEY' | 'NOT NULL'
// type mapModifierToString = Record<>
// type fieldModifiers = 'PRIMARY KEY' | 'NOT NULL' | 'UNIQUE' | 'DEFAULT';

export type IFieldProps = IBaseField | IFkField;
// export interface IBaseField {

export interface IBaseField {
  type: sqliteDataTypes;
  // SQL related vals
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  // isRequired?: boolean; // Necessary? overlap with isNotNull?
  isNotNull?: boolean;
  defaultValue?: string;

  // TODO: think about this?
  isValidFn?: (val: string) => boolean; // Can be used to create checks,
  // QUESTION: can you run the validatorFn in reverse, to get the set of values that
  // are acceptable --> to put in as a Check?
  // Validator for user interface:
  // 1) whether it can be updated or not
  // 2) validator for each column
}

export interface IFkField extends IBaseField {
  foreignKey: {
    refTable: string;
    refColumn: string;
  };
}
// export interface IFkField extends IBaseField {
//   isForeignKey: true;
//   refTable: string; // QUESTION: these have to be checked at runtime?
//   refColumn: string;
// }

export type fields = Record<any, IFieldProps>;

export interface IRelation {
  foreignKey: string;
  refTable: string;
  refColumn: string;
}

// ======= Table Relationships ====
// TODO: how to figure out the dynamic keys of a type?
// export interface ItableRelation<
//   F extends keyof fields,
//   R extends keyof fields
// > {
//   fk: F;
//   tableName: string;
//   ref: R;
// }

// NOTE: this should really be in the field table
