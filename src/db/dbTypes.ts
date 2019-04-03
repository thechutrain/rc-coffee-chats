export enum sqliteType {
  'TEXT' = 'TEXT',
  'INTEGER' = 'INTEGER',
  'BOOLEAN' = 'BOOLEAN'
}

export interface ISchema {
  tableName: string;
  fields: fieldListing;
}

type colName = string;
// export type fieldListing = Map<colName, IField>;
// export type fieldListingObj = Record<colName, IField>;
export type fieldListing = Record<colName, IField>;
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
  defaultValue?: any;
}

export interface IField {
  colName;
  type: sqliteType;
  meta?: IMetaFields;
  foreignKey?: {
    refTable: string;
    refColumn: string;
  };
  isValidFn?: (val: string) => boolean;
}

// export interface IQueryResult {
//   rawQuery: string;
//   queryData?: any;
//   error?: string;
// }

// TODO: make enum of db error types
