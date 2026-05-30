// src/middleware/errorHandler.js

/**
 * Глобальный обработчик ошибок.
 * Бизнес-ошибки бросаются как { status, message }.
 * Все прочие ошибки → 500.
 */
function errorHandler(err, req, res, next) {
  if (err.status && err.message) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
}

module.exports = errorHandler;
