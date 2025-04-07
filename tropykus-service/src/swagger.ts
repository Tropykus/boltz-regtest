import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';
dotenv.config();

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Express API for Tropykus Regtest',
        version: '1.0.0',
        description: 'This is a REST API application made with Express and TypeScript.',
    },
    servers: [
        {
            url: 'https://deepseek.tropykus.com/service/',
            description: 'Test server'
        },
        {
            url: `http://localhost:${process.env.PORT}/`,
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

