import { MovieController } from '../../controllers/movieController';
import { MovieService } from '../../services/movieService';
import { Request, Response } from 'express';

// Mock MovieService
jest.mock('../../services/movieService');

describe('MovieController', () => {
  let movieController: MovieController;
  let mockMovieService: jest.Mocked<MovieService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock service
    mockMovieService = new MovieService() as jest.Mocked<MovieService>;

    // Create mock response
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    // Create controller instance
    movieController = new MovieController();
  });

  describe('getAllMovies', () => {
    it('should return paginated movies', async () => {
      // Setup
      mockRequest = {
        query: { page: '1' }
      };
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

      mockMovieService.getAllMovies.mockResolvedValue(mockMovies);

      // Execute
      await movieController.getAllMovies(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockMovieService.getAllMovies).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith(mockMovies);
    });

    it('should handle errors', async () => {
      // Setup
      mockRequest = {
        query: { page: '1' }
      };
      mockMovieService.getAllMovies.mockRejectedValue(new Error('Database error'));

      // Execute
      await movieController.getAllMovies(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getMovieDetails', () => {
    it('should return movie details', async () => {
      // Setup
      mockRequest = {
        params: { id: '1' }
      };
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

      mockMovieService.getMovieDetails.mockResolvedValue(mockMovie);

      // Execute
      await movieController.getMovieDetails(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockMovieService.getMovieDetails).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        ...mockMovie,
        budget: '$1,000,000',
        revenue: '$2,000,000'
      });
    });

    it('should return 404 for non-existent movie', async () => {
      // Setup
      mockRequest = {
        params: { id: '999' }
      };
      mockMovieService.getMovieDetails.mockResolvedValue(null);

      // Execute
      await movieController.getMovieDetails(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Movie not found' });
    });

    it('should handle invalid movie ID', async () => {
      // Setup
      mockRequest = {
        params: { id: 'invalid' }
      };

      // Execute
      await movieController.getMovieDetails(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid movie ID' });
    });
  });

  describe('getMoviesByYear', () => {
    it('should return movies for a specific year', async () => {
      // Setup
      mockRequest = {
        params: { year: '2024' },
        query: { page: '1', sort: 'asc' }
      };
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

      mockMovieService.getMoviesByYear.mockResolvedValue(mockMovies);

      // Execute
      await movieController.getMoviesByYear(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockMovieService.getMoviesByYear).toHaveBeenCalledWith(2024, 1, 'asc');
      expect(mockJson).toHaveBeenCalledWith(mockMovies);
    });

    it('should handle invalid year', async () => {
      // Setup
      mockRequest = {
        params: { year: 'invalid' }
      };

      // Execute
      await movieController.getMoviesByYear(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Invalid year' });
    });
  });

  describe('getMoviesByGenre', () => {
    it('should return movies for a specific genre', async () => {
      // Setup
      mockRequest = {
        params: { genre: 'Action' },
        query: { page: '1' }
      };
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

      mockMovieService.getMoviesByGenre.mockResolvedValue(mockMovies);

      // Execute
      await movieController.getMoviesByGenre(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockMovieService.getMoviesByGenre).toHaveBeenCalledWith('Action', 1);
      expect(mockJson).toHaveBeenCalledWith(mockMovies);
    });

    it('should handle missing genre', async () => {
      // Setup
      mockRequest = {
        params: { genre: '' }
      };

      // Execute
      await movieController.getMoviesByGenre(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Genre parameter is required' });
    });
  });
}); 