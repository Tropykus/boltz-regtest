import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Express API for Tropykus Regtest',
        version: '1.0.0',
        description: 'This is a REST API application made with Express and TypeScript.',
    },
    servers: [
        {
        url: `http://localhost:${process.env.PORT}/api/`,
        description: 'Local server',
        }
    ],
};
  
const swaggerOptions = {
definition: swaggerDefinition,
apis: ['./src/*.ts']
};
  
export const swaggerSpec = swaggerJsdoc(swaggerOptions);

//Schemas for swagger
/**
* @swagger
* components:
*   securitySchemes:
*     apiKeyAuth:
*       type: apiKey
*       in: header
*       name: x-secret-key
*/

