import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Movie API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Movie Management System',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Movie: {
          type: 'object',
          properties: {
            imdbId: {
              type: 'string',
              description: 'IMDB ID of the movie',
              example: 'tt1234567',
            },
            title: {
              type: 'string',
              description: 'Title of the movie',
              example: 'The Matrix',
            },
            genres: {
              type: 'string',
              description: 'Comma-separated list of genres',
              example: 'Action, Sci-Fi',
            },
            releaseDate: {
              type: 'string',
              format: 'date',
              description: 'Release date of the movie',
              example: '1999-03-31',
            },
            budget: {
              type: 'string',
              description: 'Budget of the movie in USD',
              example: '$63,000,000',
            },
          },
        },
        MovieDetails: {
          allOf: [
            { $ref: '#/components/schemas/Movie' },
            {
              type: 'object',
              properties: {
                movieId: {
                  type: 'integer',
                  description: 'Internal ID of the movie',
                  example: 1,
                },
                overview: {
                  type: 'string',
                  description: 'Overview/description of the movie',
                  example: 'A computer programmer discovers a mysterious world...',
                },
                productionCompanies: {
                  type: 'string',
                  description: 'Production companies involved',
                  example: 'Warner Bros., Village Roadshow',
                },
                revenue: {
                  type: 'string',
                  description: 'Revenue of the movie in USD',
                  example: '$463,517,383',
                },
                runtime: {
                  type: 'integer',
                  description: 'Runtime in minutes',
                  example: 136,
                },
                language: {
                  type: 'string',
                  description: 'Primary language of the movie',
                  example: 'English',
                },
                status: {
                  type: 'string',
                  description: 'Release status of the movie',
                  example: 'Released',
                },
                averageRating: {
                  type: 'number',
                  description: 'Average rating from users',
                  example: 4.5,
                },
              },
            },
          ],
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            movies: {
              type: 'array',
              items: { $ref: '#/components/schemas/Movie' },
            },
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1,
            },
            limit: {
              type: 'integer',
              description: 'Number of items per page',
              example: 50,
            },
            total: {
              type: 'integer',
              description: 'Total number of items',
              example: 100,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Movie not found',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);
console.log('Swagger Spec:', JSON.stringify(swaggerSpec, null, 2));

export { swaggerSpec }; 