const convertQuerySpecToJson = (rows) => {
  const grouped = {};

  for (const row of rows) {
    const category = row.category_name;
    const header = row.header_name;
    const value = row.value_text;

    if (!grouped[category]) {
      grouped[category] = {};
    }

    grouped[category][header] = value;
  }

  return grouped;
};
module.exports = convertQuerySpecToJson;
