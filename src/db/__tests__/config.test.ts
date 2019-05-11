import * as path from 'path';
import sqlite from 'better-sqlite3';
import * as types from '../dbTypes';
import { ConfigModel } from '../models';
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
    DB.DB_CONNECTION.prepare('BEGIN');
    done();
  });

  afterEach(done => {
    DB.DB_CONNECTION.prepare('ROLLBACK');
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

  it('should be able to add a new key value', () => {
    config.addConfig('fallBackEmail', 'alan@recurse.com');
    const { value } = config.findConfig('fallBackEmail');
    expect(value).toBe('alan@recurse.com');
  });

  it('should not be able to set the default user for a user who does not exist', () => {
    expect(() => {
      config.setFallBackUser('nonexistant@recurse.com');
    }).toThrowError();
  });

  it('should be able to set a fallback user if that user exists', () => {
    DB.User.add({
      email: 'fallback@recurse.com',
      full_name: 'fall back'
    });

    config.setFallBackUser('fallback@recurse.com');

    const fallback = config.getFallBackUser();
    expect(fallback).toBe('fallback@recurse.com');
  });

  it('should be able to reset the fallback user multiple times', () => {
    DB.User.add({
      email: 'A',
      full_name: 'anon'
    });
    DB.User.add({
      email: 'B',
      full_name: 'barry'
    });

    config.setFallBackUser('A');
    expect(config.getFallBackUser()).toBe('A');
    config.setFallBackUser('B');
    expect(config.getFallBackUser()).toBe('B');
  });
});
