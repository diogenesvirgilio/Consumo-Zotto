import sanitize from "express-mongo-sanitize";

export const sanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitize.sanitize(req.body);
  if (req.params) sanitize.sanitize(req.params);
  next();
};
