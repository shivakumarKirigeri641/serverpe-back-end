const {
  findByPincode,
  findByState,
  findByDistrict,
  searchPincodes,
  getAllStates,
  getDistrictsByState,
  getAutocomplete,
  getRandomPincode,
  getTotalCount,
} = require("../services/pincode.service");

exports.getByPincode = async (req, res) => {
  const data = await findByPincode(req.params.pincode);
  if (!data) return res.status(404).json({ error: "Pincode not found" });
  res.json({ success: true, data });
};

exports.getByState = async (req, res) => {
  const data = await findByState(req.params.state);
  res.json({ success: true, count: data.length, data });
};

exports.getByDistrict = async (req, res) => {
  const data = await findByDistrict(req.params.district);
  res.json({ success: true, count: data.length, data });
};

exports.search = async (req, res) => {
  const data = await searchPincodes(req.query);
  res.json({ success: true, count: data.length, data });
};

exports.states = async (req, res) => {
  const data = await getAllStates();
  res.json({ success: true, states: data });
};

exports.districtsByState = async (req, res) => {
  const data = await getDistrictsByState(req.params.state);
  res.json({ success: true, districts: data });
};

exports.autocomplete = async (req, res) => {
  const data = await getAutocomplete(req.query.search);
  res.json({ success: true, data });
};

exports.random = async (req, res) => {
  const data = await getRandomPincode();
  res.json({ success: true, data });
};

exports.count = async (req, res) => {
  const total = await getTotalCount();
  res.json({ success: true, total });
};
