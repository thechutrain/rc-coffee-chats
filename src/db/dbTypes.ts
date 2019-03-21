export type sqliteDataTypes = 'TEXT' | 'INTEGER';

// type defaultFieldProp<t> = `DEFAULT ${t}`;
// type optionalFieldProps = 'PRIMARY KEY' | 'NOT NULL'
// type mapModifierToString = Record<>
// type fieldModifiers = 'PRIMARY KEY' | 'NOT NULL' | 'UNIQUE' | 'DEFAULT';

export interface IFieldProps {
  type: sqliteDataTypes;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  isNotNull?: boolean;
  defaultValue?: string;
}

export type fields = Record<any, IFieldProps>;
