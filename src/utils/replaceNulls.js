const replaceNulls = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(replaceNulls);
  } else if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = replaceNulls(obj[key]);
    }
    return newObj;
  } else if (obj === null || obj === "0") {
    return "-";
  } else {
    return obj;
  }
};
module.exports = replaceNulls;
