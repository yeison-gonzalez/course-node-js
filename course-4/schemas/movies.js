import z from "zod"

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be an string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.string().url(),
  rate: z.number().min(0).max(10).default(5),
  genre: z.array(z.enum(["Action", "Drama", "Horror", "Comedy", "Crime"]), {
    invalid_type_error: "Invalid genre movie",
  }),
});

export const validateMovie = (object) => {
  return movieSchema.safeParse(object);
};

export const validatePartialMovie = (object) => {
  return movieSchema.partial().safeParse(object);
};
