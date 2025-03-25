import request from 'supertest';
import express, { Request, Response } from 'express';
import movieRoutes from '../../routes/movies';
import { MovieController } from '../../controllers/movieController';

// Mock MovieController
jest.mock('../../controllers/movieController');

describe('Movie Routes', () => {
  let app: express.Application;
  let mockMovieController: jest.Mocked<MovieController>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create express app
    app = express();
    app.use(express.json());

    // Create mock controller
    mockMovieController = new MovieController() as jest.Mocked<MovieController>;

    // Setup routes
    app.use('/api/movies', movieRoutes);
  });

  describe('GET /api/movies', () => {
    it('should return paginated movies', async () => {
      // Setup
      const mockMovies = {
        movies: [
          {
            imdbId: 'tt1234567',
            title: 'Test Movie',
            genres: 'Action',
            releaseDate: '2024-01-01',
            budget: '$1,000,000'
          }
        ],
        page: 1,
        limit: 50,
        total: 1
      };

      mockMovieController.getAllMovies.mockImplementation(async (req: Request, res: Response) => {
        res.json(mockMovies);
        return undefined;
      });

      // Execute
      const response = await request(app)
        .get('/api/movies')
        .query({ page: '1' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMovies);
      expect(mockMovieController.getAllMovies).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Setup
      mockMovieController.getAllMovies.mockRejectedValue(new Error('Database error'));

      // Execute
      const response = await request(app)
        .get('/api/movies')
        .query({ page: '1' });

      // Assert
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/movies/:id', () => {
    it('should return movie details', async () => {
      // Setup
      const mockMovie = {
        movieId: 1,
        imdbId: 'tt1234567',
        title: 'Test Movie',
        overview: 'Test Overview',
        productionCompanies: 'Test Company',
        releaseDate: '2024-01-01',
        budget: 1000000,
        revenue: 2000000,
        runtime: 120,
        language: 'English',
        genres: 'Action, Drama',
        status: 'Released',
        averageRating: 4.5
      };

      mockMovieController.getMovieDetails.mockImplementation(async (req: Request, res: Response) => {
        res.json({
          ...mockMovie,
          budget: '$1,000,000',
          revenue: '$2,000,000'
        });
        return undefined;
      });

      // Execute
      const response = await request(app)
        .get('/api/movies/1');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockMovie,
        budget: '$1,000,000',
        revenue: '$2,000,000'
      });
      expect(mockMovieController.getMovieDetails).toHaveBeenCalledWith(1);
    });

    it('should return 404 for non-existent movie', async () => {
      // Setup
      mockMovieController.getMovieDetails.mockImplementation(async (req: Request, res: Response) => {
        res.status(404).json({ error: 'Movie not found' });
        return undefined;
      });

      // Execute
      const response = await request(app)
        .get('/api/movies/999');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Movie not found' });
    });

    it('should handle invalid movie ID', async () => {
      // Execute
      const response = await request(app)
        .get('/api/movies/invalid');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid movie ID' });
    });
  });

  describe('GET /api/movies/year/:year', () => {
    it('should return movies for a specific year', async () => {
      // Setup
      const mockMovies = {
        movies: [
          {
            imdbId: 'tt1234567',
            title: 'Test Movie',
            genres: 'Action',
            releaseDate: '2024-01-01',
            budget: '$1,000,000'
          }
        ],
        page: 1,
        limit: 50,
        total: 1,
        year: 2024,
        sortOrder: 'asc'
      };

      mockMovieController.getMoviesByYear.mockImplementation(async (req: Request, res: Response) => {
        res.json(mockMovies);
        return undefined;
      });

      // Execute
      const response = await request(app)
        .get('/api/movies/year/2024')
        .query({ page: '1', sort: 'asc' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMovies);
      expect(mockMovieController.getMoviesByYear).toHaveBeenCalledWith(2024, 1, 'asc');
    });

    it('should handle invalid year', async () => {
      // Execute
      const response = await request(app)
        .get('/api/movies/year/invalid');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid year' });
    });
  });

  describe('GET /api/movies/genre/:genre', () => {
    it('should return movies for a specific genre', async () => {
      // Setup
      const mockMovies = {
        movies: [
          {
            imdbId: 'tt1234567',
            title: 'Test Movie',
            genres: 'Action, Drama',
            releaseDate: '2024-01-01',
            budget: '$1,000,000'
          }
        ],
        page: 1,
        limit: 50,
        total: 1,
        genre: 'Action'
      };

      mockMovieController.getMoviesByGenre.mockImplementation(async (req: Request, res: Response) => {
        res.json(mockMovies);
        return undefined;
      });

      // Execute
      const response = await request(app)
        .get('/api/movies/genre/Action')
        .query({ page: '1' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMovies);
      expect(mockMovieController.getMoviesByGenre).toHaveBeenCalledWith('Action', 1);
    });

    it('should handle missing genre', async () => {
      // Execute
      const response = await request(app)
        .get('/api/movies/genre/');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Genre parameter is required' });
    });
  });
}); 