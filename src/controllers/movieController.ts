import { Request, Response } from 'express';
import { MovieService } from '../services/movieService';

export class MovieController {
  private movieService: MovieService;

  constructor() {
    this.movieService = new MovieService();
  }

  getAllMovies = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const result = await this.movieService.getAllMovies(page);
      res.json(result);
    } catch (error) {
      console.error('Error fetching movies:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getMovieDetails = async (req: Request, res: Response) => {
    try {
      const movieId = parseInt(req.params.id);
      if (isNaN(movieId)) {
        return res.status(400).json({ error: 'Invalid movie ID' });
      }

      const movie = await this.movieService.getMovieDetails(movieId);
      if (!movie) {
        return res.status(404).json({ error: 'Movie not found' });
      }

      res.json(movie);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getMoviesByYear = async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const page = parseInt(req.query.page as string) || 1;
      const sortOrder = (req.query.sort as string)?.toLowerCase() === 'desc' ? 'desc' : 'asc';

      if (isNaN(year)) {
        return res.status(400).json({ error: 'Invalid year' });
      }

      const result = await this.movieService.getMoviesByYear(year, page, sortOrder);
      res.json(result);
    } catch (error) {
      console.error('Error fetching movies by year:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getMoviesByGenre = async (req: Request, res: Response) => {
    try {
      const genre = req.params.genre;
      const page = parseInt(req.query.page as string) || 1;

      if (!genre) {
        return res.status(400).json({ error: 'Genre parameter is required' });
      }

      const result = await this.movieService.getMoviesByGenre(genre, page);
      res.json(result);
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
} 