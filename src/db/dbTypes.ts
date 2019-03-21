export type sqliteDataTypes = 'TEXT' | 'INTEGER';

export interface IFieldProps {
  dataType: sqliteDataTypes;
  primaryKey?: boolean;
  isUnique?: boolean;
  default?: any;
}

export type fields = Record<any, IFieldProps>;
