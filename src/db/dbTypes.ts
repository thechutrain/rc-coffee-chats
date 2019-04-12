import { UserModel, UserMatchModel, MatchModel } from './models';

export type myDB = {
  User: UserModel;
  UserMatch: UserMatchModel;
  Match: MatchModel;
};

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

// ======== MODEL RELATED TYPES ==================
import { UserRecord } from './models/user_model';
import { UserMatchRecord } from './models/usermatch_model';
import { MatchRecord } from './models/match_model';

export { UserRecord, UserMatchRecord, MatchRecord };
