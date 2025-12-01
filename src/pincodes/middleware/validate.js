exports.validatePincode = (req, res, next) => {
  const { pincode } = req.params;

  if (!/^\d{6}$/.test(pincode)) {
    return res.status(400).json({
      success: false,
      error: "Invalid pincode. Must be 6 digits.",
    });
  }

  next();
};

exports.validateSearch = (req, res, next) => {
  if (!req.query || Object.keys(req.query).length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one search parameter is required",
    });
  }
  next();
};

exports.validateState = (req, res, next) => {
  if (!/^[A-Za-z\s\-]+$/.test(req.params.state)) {
    return res.status(400).json({
      success: false,
      error: "Invalid state format",
    });
  }
  next();
};

exports.validateDistrict = (req, res, next) => {
  if (!/^[A-Za-z\s\-]+$/.test(req.params.district)) {
    return res.status(400).json({
      success: false,
      error: "Invalid district format",
    });
  }
  next();
};
