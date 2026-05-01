const { Client } = require('pg');
const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'teamtaskmanager',
  user: 'postgres',
  password: 'vinaya123'
});

client.connect()
  .then(() => client.query("UPDATE users SET password = $1 WHERE email = 'admin@example.com'", ['$2b$12$Ch5WxdrtQn2r34/8shQeLO8Thf1R0Bmf4B7NRz/VCSkcmWOPISCjW']))
  .then(() => {
    console.log('Fixed');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
