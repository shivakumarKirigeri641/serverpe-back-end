const groupEndpointsByCategory = (rows) => {
  const map = {};

  for (const row of rows) {
    const cat = row.category ?? "Uncategorized";

    if (!map[cat]) {
      map[cat] = {
        category: cat,
        endpoints: [],
      };
    }

    map[cat].endpoints.push({
      id: row.id,
      endpoint: row.endpoint,
      method: row.method,
      api_doc_path: row.api_doc_path,
      api_postman_collection_path: row.api_postman_collection_path,
      title: row.title,
      description: row.description,
      sample_request: row.sample_request ?? null,
      sample_response: row.sample_response ?? null,
    });
  }

  return Object.values(map);
};
module.exports = groupEndpointsByCategory;
