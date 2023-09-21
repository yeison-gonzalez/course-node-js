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

        return []
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
    } = input;

    const [resultUuid] = await connection.query('SELECT UUID() uuid;')
    const [{ uuid }] = resultUuid
    try {
        await connection.query('INSERT INTO movie (id, title, year, director, duration, poster, rate) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);', [uuid, title, year, director, duration, poster, rate])
    } catch (e) {
        throw new Error('Error creating movie')
    }
    const [movies] = await connection.query('SELECT BIN_TO_UUID(id) id, title, year, director, duration, poster, rate FROM movie WHERE id = UUID_TO_BIN(?);', [uuid])
    return movies.length !== 0 ? movies[0] : null
  }

  static async delete({ id }) {
    
  }

  static async update({ id, input }) {
  }
}
