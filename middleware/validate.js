import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  // TODO:
  // Hint: schema.safeParse(req.body). On failure: 400 with { error: { message, details } }.
  // On success: replace req.body with result.data and call next().
  try {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new ZodError(result.error.issues);
    }
    req.body = result.data;
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: {
          message: error.message,
          details: error.issues,
        },
      });
    }
    next(error);
  }
};
