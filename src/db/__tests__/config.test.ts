import * as path from 'path';
import { ConfigModel } from '../models';
import * as types from '../../types';
import { initDB } from '../../db';

const DB_PATH = path.join(__dirname, 'test_db', 'config_model_test.db');

describe('config model:', () => {
  let DB: types.myDB;
  let config: ConfigModel;

  beforeAll(done => {
    DB = initDB(DB_PATH, false);
    config = DB.Config;

    done();
  });

  beforeEach(done => {
    const begin = DB.DB_CONNECTION.prepare('BEGIN');
    begin.run();
    done();
  });

  afterEach(done => {
    const rollback = DB.DB_CONNECTION.prepare('ROLLBACK');
    rollback.run();
    done();
  });

  afterAll(done => {
    DB.DB_CONNECTION.close();
    expect(DB.DB_CONNECTION.open).toBe(false);

    done();
  });

  it('should throw an error for nonexistent key', () => {
    expect(() => {
      config.findConfig('blah');
    }).toThrow();
  });
});
