const notFound = (req, res, next) => {
    res.status(404).json({ message: `Not Found: ${req.originalUrl}` });
  };
  
  const errorHandler = (error, req, res, next) => {
    res.status(error.status || 500).json({
      message: error.message || "Internal Server Error",
    });
  };
  
  module.exports = { notFound, errorHandler };  