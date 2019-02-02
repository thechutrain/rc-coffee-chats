import { isArray, values } from 'lodash';

const DIYSqliteORM = (db: any, models: any): any => ({
  createTables: (commit = true) => {
    const dbStatements = Object.keys(models).reduce((statements, modelName) => {
      const model = models[modelName];
      const fields = model.fields;
      statements.push(`
          CREATE TABLE ${modelName} (
            ${Object.keys(fields)
              .map(fieldName => {
                const field = fields[fieldName];
                return `${fieldName} ${field.type} NOT NULL${
                  field.unique ? ' UNIQUE' : ''
                }`;
              })
              .join(', ')}
          )
        `);

      return statements.concat(
        (model.indices || []).map(
          index =>
            `CREATE INDEX ${
              isArray(index) ? index.join('_') : index
            }_index ON ${modelName} (${
              isArray(index) ? index.join(', ') : index
            })`
        )
      );
    }, []);
    if (commit) {
      dbStatements.forEach(statement => db.prepare(statement).run());
    }
    return dbStatements;
  },
  ...Object.keys(models).reduce((modelInterfaces, modelName) => {
    modelInterfaces[modelName] = {
      create: (attrs, { orReplace } = { orReplace: false }) => {
        const statement = db.prepare(`
          INSERT${orReplace ? ' OR REPLACE' : ''} INTO
          ${modelName}(${Object.keys(attrs).join(', ')}) VALUES
          ("${values(attrs).join('", "')}")
        `);
        statement.run();
        return true;
      },
      get: ({ attrs, where }) => {
        const statement = db.prepare(`
          SELECT ${attrs ? attrs.join(', ') : '*'} FROM
          ${modelName}${where ? ` WHERE ${where}` : ''}
        `);
        return statement.all();
      },
      delete: where => {
        const statement = db.prepare(`
          DELETE FROM
          ${modelName}${where ? ` WHERE ${where}` : ''}
        `);
        return statement.run();
      }
    };
    return modelInterfaces;
  }, {})
});

export default DIYSqliteORM;
