const pool = require('../pool');
const { randomBytes } = require('crypto');
const { default: migrate } = require('node-pg-migrate');
const format = require('pg-format');

const DEFAULT_OPTIONS = {
  host: 'localhost',
  port: 5433,
  database: 'social network test',
  user: 'postgres',
  password: '11102000',
};
class Context {
  static async build() {
    // Randomly generating  a role name to connect tto pg as
    const roleName = 'a' + randomBytes(4).toString('hex');

    //connect to PG as usual
    await pool.connect(DEFAULT_OPTIONS);

    //create a role name
    await pool.query(
      format('CREATE ROLE %I   WITH LOGIN PASSWORD %L ;', roleName, roleName)
    );

    //create a schema with the same name

    await pool.query(
      format('CREATE SCHEMA %I AUTHORIZATION %I ;', roleName, roleName)
    );

    // disconnect entirely from PG
    await pool.close();

    //Run our migrations in the new schema
    await migrate({
      schema: roleName,
      direction: 'up',
      log: () => {},
      noLock: true,
      dir: 'migrations',
      databaseUrl: {
        host: 'localhost',
        port: 5433,
        database: 'social network test',
        user: roleName,
        password: roleName,
      },
    });
    //connect to pg as the newly created role

    await pool.connect({
      host: 'localhost',
      port: 5433,
      database: 'social network test',
      user: roleName,
      password: roleName,
    });

    return new Context(roleName);
  }

  constructor(roleName) {
    this.roleName = roleName;
  }

  async close() {
    // Disconnect From pg
    await pool.close();

    //Reconnect  as our root user
    await pool.connect(DEFAULT_OPTIONS);

    //Delete the role and schema we created
    await pool.query(format('DROP SCHEMA %I CASCADE;', this.roleName));
    await pool.query(format('DROP ROLE %I ;', this.roleName));

    //Disconnect
    await pool.close();
  }

  async reset() {
    pool.query(`
        DELETE FROM USERS
    `);
  }
}

module.exports = Context;
