import express, { json } from "express";

import { moviesRouter } from './routes/movies.js'
import { corsMiddleware } from './middlewares/cors.js';

const app = express();
const PORT = process.env.PORT ?? 1234;

app.use(json());
app.use(corsMiddleware());
app.disable('x-powered-by')

app.use("/movies", moviesRouter);

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`);
});
