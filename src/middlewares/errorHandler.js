export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Dados inválidos",
      details: details,
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
  me -
    auto({
      error: "Erro interno do servidor",
      requestId: req.id,
    });
};
