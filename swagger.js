const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'API documentation for your Node.js application'
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: 'Development server'
    }
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./server.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
