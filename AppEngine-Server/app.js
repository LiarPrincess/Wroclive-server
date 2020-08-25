const { createServer } = require('http');
const app = require('./dist/app.js');

const server = createServer(app);
server.keepAliveTimeout = 30 * 1000;

const port = process.env.PORT || 3000;
console.log('Starting server on:', port);
server.listen(port);

module.exports = app;
