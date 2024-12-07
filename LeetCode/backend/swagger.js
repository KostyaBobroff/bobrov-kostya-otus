const  swaggerAutogen = require('swagger-autogen');

const doc = {
  info: {
    title: 'LeetCode API',
  },
  host: 'localhost:3000',
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'cookie', // can be 'header', 'query' or 'cookie'
      name: 'cookie', // name of the header, query parameter or cookie
      description: 'Some description...'
    }
  }
  // basePath:  '/api/v1'
};

const outputFile = './swagger.json';
// const routes = ['src/routes/tags.ts', 'src/routes/tasks.ts', 'src/routes/users.ts', 'src/routes/comments.ts'];
const routes = ['src/routes/*.ts',];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc);