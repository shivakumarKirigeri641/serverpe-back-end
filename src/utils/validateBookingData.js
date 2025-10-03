const getStationDetails = require("../SQL/getStationDetails");

const validateBookingData = async (
  client,
  {
    train_number,
    src,
    dest,
    adults,
    children,
    physicallyhandicaped,
    total_fare,
    paytype,
  }
) => {
  if (!train_number) {
    throw {
      success: false,
      message: "Invalid train number provided.",
      data: {},
    };
  }
  if (!src) {
    throw {
      success: false,
      message: "Invalid source provided.",
      data: {},
    };
  }
  if (!dest) {
    throw {
      success: false,
      message: "Invalid destination provided.",
      data: {},
    };
  }
  if (!adults) {
    throw {
      success: false,
      message: "Invalid adults count.",
      data: {},
    };
  }
  if (isNaN(adults)) {
    throw {
      success: false,
      message: "Invalid adults count.",
      data: {},
    };
  }
  if (isNaN(children)) {
    throw {
      success: false,
      message: "Invalid children count.",
      data: {},
    };
  }
  if (isNaN(total_fare)) {
    throw {
      success: false,
      message: "Invalid amount.",
      data: {},
    };
  }
  if (isNaN(paytype)) {
    throw {
      success: false,
      message: "Invalid paytype!",
      data: {},
    };
  }
  if (adults < 1 || adults > 6) {
    throw {
      success: false,
      message: "Invalid adult passenger count.",
      data: {},
    };
  }
  if (children < 0 || children > 6) {
    throw {
      success: false,
      message: "Invalid child passenger count.",
      data: {},
    };
  }
  if (0 >= total_fare) {
    throw {
      success: false,
      message: "Invalid amount value!",
      data: {},
    };
  }
  if (0 > paytype || 1 < paytype) {
    throw {
      success: false,
      message: "Invalid paytype value!",
      data: {},
    };
  }
  const result = await client.query(
    "select *from trains where train_number = $1",
    [train_number]
  );
  if (0 === result.rows.length) {
    throw {
      success: false,
      message: "Train information not found!",
      data: {},
    };
  }
  const result_sourcedetails = await getStationDetails(
    client,
    src.toUpperCase()
  );
  const result_destinationdetails = await getStationDetails(
    client,
    dest.toUpperCase()
  );
  if (0 === result_sourcedetails.rows.length) {
    throw {
      err_details: {
        success: false,
        message: "Source station mentioned was not found!",
        data: {},
      },
    };
  }
  if (0 === result_destinationdetails.rows.length) {
    throw {
      err_details: {
        success: false,
        message: "Destination station mentioned was not found!",
        data: {},
      },
    };
  }
};
module.exports = validateBookingData;
