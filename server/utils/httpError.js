const clientError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  error.expose = true;
  return error;
};

const sendError = (res, status, message, err) => {
  const payload = { message };
  if (process.env.NODE_ENV !== 'production' && err) {
    payload.error = err.message;
  }
  return res.status(status).json(payload);
};

module.exports = { clientError, sendError };
