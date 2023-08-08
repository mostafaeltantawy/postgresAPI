const app = require('./src/app');
const pool = require('./src/pool');

pool
  .connect({
    host: 'localhost',
    port: 5433,
    database: 'social network',
    user: 'postgres',
    password: '',
  })
  .then(() => {
    app().listen(3005, () => {
      console.log('connected on 3005 ');
    });
  })
  .catch((err) => console.log(err));
