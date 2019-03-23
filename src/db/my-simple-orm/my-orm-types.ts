export enum sqliteType {
  'TEXT' = 'TEXT',
  'INTEGER' = 'INTEGER',
  'BOOLEAN' = 'BOOLEAN'
}

export interface ISchema {
  tableName: string;
  fields: fieldListing;
}

export type fieldListing = Record<string, IField>;
////////////////////////
// field props
////////////////////////
export type filterableMetaFields = keyof IMetaFields;

interface IMetaFields {
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  isUnique?: boolean; // Note: isRequireUpdate ... additional related descriptor
  isNotNull?: boolean;
  isDefault?: boolean;
}

export interface IField {
  colName: string;
  type: sqliteType;
  meta: IMetaFields;
  defaultValue?: any;
  foreignKey?: {
    refTable: string;
    refColumn: string;
  };
  isValidFn?: (val: string) => boolean;
}
