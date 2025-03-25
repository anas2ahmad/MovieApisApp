import { MovieService } from '../../services/movieService';
import sqlite3 from 'sqlite3';
import { MovieDetails } from '../../types/movie';
import { promisify } from 'util';

// Mock the sqlite3 module
jest.mock('sqlite3', () => ({
  Database: jest.fn().mockImplementation(() => ({
    all: jest.fn(),
    get: jest.fn(),
  })),
}));

describe('MovieService', () => {
  let movieService: MovieService;
  let mockMoviesDb: any;
  let mockRatingsDb: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock database instances with promisified methods
    mockMoviesDb = {
      all: jest.fn(),
      get: jest.fn(),
    };
    mockRatingsDb = {
      all: jest.fn(),
      get: jest.fn(),
    };

    // Mock the Database constructor
    const mockDb = sqlite3.Database as unknown as jest.Mock;
    mockDb.mockImplementation((path) => {
      if (path === './movies.db') return mockMoviesDb;
      if (path === './ratings.db') return mockRatingsDb;
      return {};
    });

    // Create a new instance of MovieService
    movieService = new MovieService();
  });

  describe('getAllMovies', () => {
    it('should return paginated movies', async () => {
      const mockMovies = [
        {
          imdbId: 'tt1234567',
          title: 'Test Movie 1',
          genres: 'Action, Drama',
          releaseDate: '2024-01-01',
          budget: 1000000,
        },
        {
          imdbId: 'tt7654321',
          title: 'Test Movie 2',
          genres: 'Comedy',
          releaseDate: '2024-02-01',
          budget: 2000000,
        },
      ];

      // Mock the database query
      mockMoviesDb.all.mockImplementation((query: string, params: any[], callback: (err: Error | null, rows: any[]) => void) => {
        callback(null, mockMovies);
      });

      const result = await movieService.getAllMovies(1);

      expect(result).toEqual({
        movies: [
          {
            imdbId: 'tt1234567',
            title: 'Test Movie 1',
            genres: 'Action, Drama',
            releaseDate: '2024-01-01',
            budget: '$1,000,000',
          },
          {
            imdbId: 'tt7654321',
            title: 'Test Movie 2',
            genres: 'Comedy',
            releaseDate: '2024-02-01',
            budget: '$2,000,000',
          },
        ],
        page: 1,
        limit: 50,
        total: 2,
      });
    });
  });

  describe('getMovieDetails', () => {
    it('should return movie details with rating', async () => {
      const mockMovie = {
        movieId: 1,
        imdbId: 'tt1234567',
        title: 'Test Movie',
        overview: 'Test Overview',
        genres: 'Action, Drama',
        releaseDate: '2024-01-01',
        budget: 1000000,
        revenue: 2000000,
        runtime: 120,
        language: 'English',
        productionCompanies: 'Test Studio',
        status: 'Released',
      };

      const mockRating = { averageRating: 4.5 };

      // Mock the database queries
      mockMoviesDb.get.mockImplementation((query: string, params: any[], callback: (err: Error | null, row: any) => void) => {
        callback(null, mockMovie);
      });

      mockRatingsDb.get.mockImplementation((query: string, params: any[], callback: (err: Error | null, row: any) => void) => {
        callback(null, mockRating);
      });

      const result = await movieService.getMovieDetails(1);

      expect(result).toEqual({
        ...mockMovie,
        budget: '$1,000,000',
        revenue: '$2,000,000',
        averageRating: 4.5,
      });
    });

    it('should return null for non-existent movie', async () => {
      // Mock the database query
      mockMoviesDb.get.mockImplementation((query: string, params: any[], callback: (err: Error | null, row: any) => void) => {
        callback(null, null);
      });

      const result = await movieService.getMovieDetails(999);

      expect(result).toBeNull();
    });

    it('should use cache for subsequent requests', async () => {
      const mockMovie = {
        movieId: 1,
        imdbId: 'tt1234567',
        title: 'Test Movie',
        overview: 'Test Overview',
        genres: 'Action, Drama',
        releaseDate: '2024-01-01',
        budget: 1000000,
        revenue: 2000000,
        runtime: 120,
        language: 'English',
        productionCompanies: 'Test Studio',
        status: 'Released',
      };

      const mockRating = { averageRating: 4.5 };

      // Mock the database queries
      mockMoviesDb.get.mockImplementation((query: string, params: any[], callback: (err: Error | null, row: any) => void) => {
        callback(null, mockMovie);
      });

      mockRatingsDb.get.mockImplementation((query: string, params: any[], callback: (err: Error | null, row: any) => void) => {
        callback(null, mockRating);
      });

      // First request - should hit the database
      const result1 = await movieService.getMovieDetails(1);

      // Clear mocks to verify they're not called again
      jest.clearAllMocks();

      // Second request - should use cache
      const result2 = await movieService.getMovieDetails(1);

      expect(result1).toEqual(result2);
      expect(mockMoviesDb.get).not.toHaveBeenCalled();
      expect(mockRatingsDb.get).not.toHaveBeenCalled();
    });
  });

  describe('getMoviesByYear', () => {
    it('should return movies for a specific year', async () => {
      const mockMovies = [
        {
          imdbId: 'tt1234567',
          title: 'Test Movie 1',
          genres: 'Action, Drama',
          releaseDate: '2024-01-01',
          budget: 1000000,
        },
        {
          imdbId: 'tt7654321',
          title: 'Test Movie 2',
          genres: 'Comedy',
          releaseDate: '2024-02-01',
          budget: 2000000,
        },
      ];

      // Mock the database query
      mockMoviesDb.all.mockImplementation((query: string, params: any[], callback: (err: Error | null, rows: any[]) => void) => {
        callback(null, mockMovies);
      });

      const result = await movieService.getMoviesByYear(2024, 1, 'asc');

      expect(result).toEqual({
        movies: [
          {
            imdbId: 'tt1234567',
            title: 'Test Movie 1',
            genres: 'Action, Drama',
            releaseDate: '2024-01-01',
            budget: '$1,000,000',
          },
          {
            imdbId: 'tt7654321',
            title: 'Test Movie 2',
            genres: 'Comedy',
            releaseDate: '2024-02-01',
            budget: '$2,000,000',
          },
        ],
        page: 1,
        limit: 50,
        total: 2,
        year: 2024,
        sortOrder: 'asc',
      });
    });
  });

  describe('getMoviesByGenre', () => {
    it('should return movies for a specific genre', async () => {
      const mockMovies = [
        {
          imdbId: 'tt1234567',
          title: 'Test Movie 1',
          genres: 'Action, Drama',
          releaseDate: '2024-01-01',
          budget: 1000000,
        },
        {
          imdbId: 'tt7654321',
          title: 'Test Movie 2',
          genres: 'Action, Comedy',
          releaseDate: '2024-02-01',
          budget: 2000000,
        },
      ];

      // Mock the database query
      mockMoviesDb.all.mockImplementation((query: string, params: any[], callback: (err: Error | null, rows: any[]) => void) => {
        callback(null, mockMovies);
      });

      const result = await movieService.getMoviesByGenre('Action', 1);

      expect(result).toEqual({
        movies: [
          {
            imdbId: 'tt1234567',
            title: 'Test Movie 1',
            genres: 'Action, Drama',
            releaseDate: '2024-01-01',
            budget: '$1,000,000',
          },
          {
            imdbId: 'tt7654321',
            title: 'Test Movie 2',
            genres: 'Action, Comedy',
            releaseDate: '2024-02-01',
            budget: '$2,000,000',
          },
        ],
        page: 1,
        limit: 50,
        total: 2,
        genre: 'Action',
      });
    });
  });
}); 