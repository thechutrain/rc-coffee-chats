// export type sqliteDataTypes = 'TEXT' | 'INTEGER';

export enum sqliteType {
  'TEXT' = 'TEXT',
  'INTEGER' = 'INTEGER',
  'BOOLEAN' = 'BOOLEAN'
}

export interface ISchema {
  tableName: string;
  fields: Record<string, IField>;
}

////////////////////////
// field props
////////////////////////

export type filterableMetaFields =
  | 'isPrimaryKey'
  | 'isForeignKey'
  | 'isUnique'
  | 'isNotNull'
  | 'isDefault';

export interface IField {
  colName: string;
  type: sqliteType;
  meta: {
    isPrimaryKey?: boolean;
    isForeignKey?: boolean;
    isUnique?: boolean; // Note: isRequireUpdate ... additional related descriptor
    isNotNull?: boolean;
    isDefault?: boolean;
  };
  defaultValue?: any;
  foreignKey?: {
    refTable: string;
    refColumn: string;
  };
  isValidFn?: (val: string) => boolean;
}
