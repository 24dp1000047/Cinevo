import { Router } from 'express';
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getMovieDetails,
  getMovieCredits,
  getSimilarMovies,
  getMoviesByGenre,
} from '../controllers/movie.controller';

const router = Router();

router.get('/trending', getTrendingMovies);
router.get('/popular', getPopularMovies);
router.get('/top-rated', getTopRatedMovies);
router.get('/genre/:genreId', getMoviesByGenre);
router.get('/:id', getMovieDetails);
router.get('/:id/credits', getMovieCredits);
router.get('/:id/similar', getSimilarMovies);

export default router;
