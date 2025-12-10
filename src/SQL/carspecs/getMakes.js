const fs = require("fs");
const path = require("path");

const getMakes = async (client) => {
  const result = await client.query(
    `SELECT DISTINCT brand FROM vehicle_information ORDER BY brand ASC`
  );

  const baseFolder = path.join(
    __dirname,
    "..",
    "..",
    "images",
    "logos",
    "original"
  );
  const baseUrl = "http://localhost:8888/images/logos/optimized/";

  let arrayofmakesandlogos = [];

  for (let row of result.rows) {
    const brand = row.brand?.trim();
    if (!brand) continue;

    const normalizedFile = brand.toLowerCase().replace(/\s+/g, "_") + ".png";
    const filePath = path.join(baseFolder, normalizedFile);

    let finalLogoUrl = null;

    if (fs.existsSync(filePath)) {
      // File exists → return working URL
      finalLogoUrl = baseUrl + normalizedFile;
    } else {
      // No image → return empty or fallback image
      finalLogoUrl = null; // or baseUrl + "default.png"
    }

    arrayofmakesandlogos.push({
      brand,
      logo_path: finalLogoUrl,
    });
  }

  return arrayofmakesandlogos;
};

module.exports = getMakes;
