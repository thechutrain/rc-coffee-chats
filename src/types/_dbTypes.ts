import * as sqlite from 'better-sqlite3';
import {
  UserModel,
  UserMatchModel,
  MatchModel,
  ConfigModel
} from '../db/models';

export type myDB = {
  User: UserModel;
  UserMatch: UserMatchModel;
  Match: MatchModel;
  Config: ConfigModel;
  DB_CONNECTION: sqlite.Database;
};

export enum sqliteType {
  'TEXT' = 'TEXT',
  'INTEGER' = 'INTEGER',
  'BOOLEAN' = 'BOOLEAN',
  'BLOB' = 'BLOB'
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
import { UserRecord } from '../db/models/user_model';
import { UserMatchRecord } from '../db/models/usermatch_model';
import { MatchRecord } from '../db/models/match_model';

export { UserRecord, UserMatchRecord, MatchRecord };
