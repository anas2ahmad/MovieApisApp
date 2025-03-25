export interface MovieDetails {
  movie_id: number;
  imdb_id: string;
  title: string;
  overview: string;
  release_date: string;
  genres: string;
  budget: string | null;
  revenue: string | null;
  runtime: number | null;
  language: string | null;
  production_companies: string | null;
  status: string | null;
  averageRating: number | null;
}

export interface Movie {
  imdb_id: string;
  title: string;
  genres: string;
  release_date: string;
  budget: string | null;
} 