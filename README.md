# Movie Management System

A RESTful API for managing movie information, built with Node.js, Express, TypeScript, and SQLite.

## Features

- RESTful API endpoints for movie management
- Swagger/OpenAPI documentation
- TypeScript for type safety
- SQLite database for data storage
- Comprehensive test coverage
- Pagination support


## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- SQLite3

## Installation

1. Clone the repository:
```bash
git clone https://github.com/anas2ahmad/MovieApisApp.git
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
PORT=3000
NODE_ENV=development
```

## Development

Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:3000 (or the port specified in your .env file).


## API Documentation

The API documentation is available at `/api-docs` when the server is running. This provides an interactive Swagger UI interface where you can:

(http://localhost:3000/api-docs/)

- View all available endpoints
- Test API calls directly from the browser
- See request/response schemas
- View example requests and responses

## Available Endpoints

### Movies

#### Get All Movies
- **GET** `/api/movies`
- Query Parameters:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 50)
- Returns: Paginated list of movies

#### Get Movie Details
- **GET** `/api/movies/:id`
- Path Parameters:
  - `id`: Movie ID
- Returns: Detailed movie information

#### Get Movies by Year
- **GET** `/api/movies/year/:year`
- Path Parameters:
  - `year`: Release year
- Query Parameters:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
  - `sort` (optional): Sort order ('asc' or 'desc')
- Returns: Paginated list of movies from the specified year

#### Get Movies by Genre
- **GET** `/api/movies/genre/:genre`
- Path Parameters:
  - `genre`: Movie genre
- Query Parameters:
  - `page` (optional): Page number
  - `limit` (optional): Items per page
- Returns: Paginated list of movies in the specified genre

## Testing

The project includes comprehensive test coverage using Jest. Available test commands:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

Test files are located in the `src/__tests__` directory and follow the same structure as the source files.

## Project Structure

```
src/
├── __tests__/           # Test files
│   ├── controllers/     # Controller tests
│   ├── services/       # Service tests
│   └── routes/         # Route tests
├── config/             # Configuration files
├── controllers/        # Route controllers
├── models/            # Data models
├── routes/            # API routes
├── services/          # Business logic
├── types/             # TypeScript type definitions
├── app.ts             # Express application setup
└── server.ts          # Server entry point
```

## Error Handling

The API includes comprehensive error handling for:
- Invalid input parameters
- Database errors
- Not found errors
- Server errors

All errors are returned in a consistent format:
```json
{
  "error": "Error message"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 