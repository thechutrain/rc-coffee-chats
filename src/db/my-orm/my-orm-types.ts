export type sqliteDataTypes = 'TEXT' | 'INTEGER';

export type fields = Record<any, fieldProps>;

////////////////////////
// field props
////////////////////////
export type fieldProps = IBaseField | IFkField;
export interface IBaseField {
  type: sqliteDataTypes;
  // SQL related vals
  isPrimaryKey?: boolean;
  foreignKey?: {
    refTable: string;
    refColumn: string;
  };
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

export interface IRelation {
  foreignKey: string;
  refTable: string;
  refColumn: string;
}

////////////////////////
//
////////////////////////
