import mysql from 'mysql2/promise';

const config = {
    host: 'localhost',
    user: 'root',
    port: '33060',
    password: '123456',
    database: 'moviesdb',
}

const connection = await mysql.createConnection(config);

export class MovieModel {
  static async getAll({ genre }) {
    if (genre) {
        const lowerCaseGenre = genre.toLowerCase();
        const [genres] = await connection.query('SELECT * FROM genre WHERE LOWER(name) = ?;', [lowerCaseGenre])

        if (genres.length === 0) return []
        const [{ id }] = genres
        const [movies] = await connection.query('SELECT BIN_TO_UUID(movie.id) id, movie.title, movie.year, movie.director, movie.duration, movie.poster, movie.rate, genre.id AS genre_id, genre.name AS genre_name FROM movie JOIN movie_genres ON movie.id = movie_genres.movie_id JOIN genre ON movie_genres.genre_id = genre.id WHERE genre.id = ?;', [id]);
        return movies
    }

    const [movies] = await connection.query('SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie;')
    return movies
  }

  static async getById({ id }) {
    const [movies] = await connection.query('SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?);', [id])
    return movies.length !== 0 ? movies[0] : null
  }

  static async create({ input }) {
    const {
        title,
        year,
        duration,
        director,
        rate,
        poster,
        genre,
    } = input;

    const [resultUuid] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = resultUuid
    try {
        genre?.map(async g => {
          const [genres] = await connection.query('SELECT id, name FROM genre WHERE LOWER(name) = ?;', [g.toLowerCase()])
          const [{ id }] = genres
          await connection.query('INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?), ?);', [uuid, id])
        })
        await connection.query('INSERT INTO movie (id, title, year, director, duration, poster, rate) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);', [uuid, title, year, director, duration, poster, rate])
    } catch (e) {
        throw new Error('Error creating movie')
    }
    const [movies] = await connection.query('SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?);', [uuid])
    return movies.length !== 0 ? movies[0] : null
  }

  static async delete({ id }) {
    const [movie] = await connection.query('SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?);', [id])
    if (movie) {
      await connection.query('DELETE movie, movie_genres FROM movie JOIN movie_genres ON movie.id = movie_genres.movie_id WHERE id = UUID_TO_BIN(?);', [id]);
      const [movies] = await connection.query('SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?);', [id])
      return movies.length !== 0 ? null : true;
    } else {
      return null;
    }
  }

  static async update({ id, input }) {
    const {
      title,
      year,
      duration,
      director,
      rate,
      poster,
      genre,
    } = input;

    try {
      const [movie] = await connection.query('SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?);', [id])
      const [currentMovie] = movie
      await connection.query('UPDATE movie SET title = ?, year = ?, director = ?, duration = ?, poster = ?, rate = ? WHERE movie.id = UUID_TO_BIN(?)', [title || currentMovie.title, year || currentMovie.year, director || currentMovie.director, duration || currentMovie.duration, poster || currentMovie.poster, rate || currentMovie.rate, id])
    } catch (e) {
        throw new Error('Error updating movie')
    }
    const [movies] = await connection.query('SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?);', [id])
    return movies.length !== 0 ? movies[0] : null
  }
}
