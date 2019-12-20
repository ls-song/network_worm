const Koa = require('koa');
const app = new Koa();

require('./utils/index');

app.listen(80);