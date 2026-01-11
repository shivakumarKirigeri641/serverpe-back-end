exports.success = (res, data, message) => {
  res.status(200).json({
    success: true,
    message,
    data,
  });
};

exports.error = (res, status, message, code) => {
  res.status(status).json({
    success: false,
    message,
    errorCode: code,
  });
};
