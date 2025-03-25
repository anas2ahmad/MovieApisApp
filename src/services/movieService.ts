import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { MovieDetails } from '../types/movie';
import LRUCache from '../utils/lruCache';

export interface Movie {
  movieId: number;
  imdbId: string;
  title: string;
  overview: string | null;
  productionCompanies: string | null;
  releaseDate: string | null;
  budget: number | null;
  revenue: number | null;
  runtime: number | null;
  language: string | null;
  genres: string | null;
  status: string | null;
}

export class MovieService {
  private moviesDb: sqlite3.Database;
  private ratingsDb: sqlite3.Database;
  private allAsync: (query: string, params: any[]) => Promise<any[]>;
  private getAsync: (query: string, params: any[]) => Promise<any>;
  private ratingsAllAsync: (query: string, params: any[]) => Promise<any[]>;
  private ratingsGetAsync: (query: string, params: any[]) => Promise<any>;
  private movieCache: LRUCache<MovieDetails>;

  constructor() {
    this.moviesDb = new sqlite3.Database('./movies.db');
    this.ratingsDb = new sqlite3.Database('./ratings.db');
    this.allAsync = promisify(this.moviesDb.all.bind(this.moviesDb));
    this.getAsync = promisify(this.moviesDb.get.bind(this.moviesDb));
    this.ratingsAllAsync = promisify(this.ratingsDb.all.bind(this.ratingsDb));
    this.ratingsGetAsync = promisify(this.ratingsDb.get.bind(this.ratingsDb));
    this.movieCache = new LRUCache<MovieDetails>(100);
  }

  async getAllMovies(page: number): Promise<any> {
    const limit = 50;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        imdbId,
        title,
        genres,
        releaseDate,
        budget
      FROM movies
      LIMIT ? OFFSET ?
    `;

    const rows = await this.allAsync(query, [limit, offset]);
    const formattedMovies = rows.map(movie => ({
      ...movie,
      budget: movie.budget ? `$${movie.budget.toLocaleString()}` : null
    }));

    return {
      movies: formattedMovies,
      page,
      limit,
      total: rows.length
    };
  }

  async getMovieDetails(movieId: number): Promise<MovieDetails | null> {
    // Implenting Cache and Checking if its in the cache first
    const cacheKey = `movie_${movieId}`;
    const cachedMovie = this.movieCache.get(cacheKey);
    if (cachedMovie) {
      return cachedMovie;
    }

    // Getting movie details from movies database
    const movieQuery = `
      SELECT *
      FROM movies
      WHERE movieId = ?
    `;

    const movie = await this.getAsync(movieQuery, [movieId]);
    if (!movie) return null;

    // getting average rating from ratings database
    const ratingQuery = `
      SELECT AVG(rating) as averageRating
      FROM ratings
      WHERE movieId = ?
    `;

    const ratingResult = await this.ratingsGetAsync(ratingQuery, [movieId]);

    // Formatting the response
    const formattedMovie = {
      ...movie,
      budget: movie.budget ? `$${movie.budget.toLocaleString()}` : null,
      revenue: movie.revenue ? `$${movie.revenue.toLocaleString()}` : null,
      averageRating: ratingResult.averageRating ? Number(ratingResult.averageRating.toFixed(1)) : null
    };

    // Add to cache
    this.movieCache.put(cacheKey, formattedMovie);

    return formattedMovie;
  }

  async getMoviesByYear(year: number, page: number, sortOrder: 'asc' | 'desc' = 'asc'): Promise<any> {
    const limit = 50;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        imdbId,
        title,
        genres,
        releaseDate,
        budget
      FROM movies
      WHERE strftime('%Y', releaseDate) = ?
      ORDER BY releaseDate ${sortOrder === 'desc' ? 'DESC' : 'ASC'}
      LIMIT ? OFFSET ?
    `;

    const rows = await this.allAsync(query, [year.toString(), limit, offset]);
    const formattedMovies = rows.map(movie => ({
      ...movie,
      budget: movie.budget ? `$${movie.budget.toLocaleString()}` : null
    }));

    return {
      movies: formattedMovies,
      page,
      limit,
      total: rows.length,
      year,
      sortOrder
    };
  }

  async getMoviesByGenre(genre: string, page: number): Promise<any> {
    const limit = 50;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        imdbId,
        title,
        genres,
        releaseDate,
        budget
      FROM movies
      WHERE genres LIKE ?
      LIMIT ? OFFSET ?
    `;

    const rows = await this.allAsync(query, [`%${genre}%`, limit, offset]);
    const formattedMovies = rows.map(movie => ({
      ...movie,
      budget: movie.budget ? `$${movie.budget.toLocaleString()}` : null
    }));

    return {
      movies: formattedMovies,
      page,
      limit,
      total: rows.length,
      genre
    };
  }
} 