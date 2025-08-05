exports.successResponse = (
  res,
  data,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

exports.errorResponse = (
  res,
  message = "An error occurred",
  statusCode = 500
) => {
  return res.status(statusCode).json({
    status: "error",
    message,
  });
};
