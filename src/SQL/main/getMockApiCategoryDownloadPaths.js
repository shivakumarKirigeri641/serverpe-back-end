const getMockApiCategoryDownloadPaths = async (client, id) => {
  const result = await client.query(
    `select api_doc_path, api_postman_collection_path from serverpe_api_endpoints where id =$1`,
    [id]
  );
  if (0 === result.rows.length) {
    return {
      status: 422,
      successtatus: false,
      data: {},
      message: "No results found!",
    };
  }
  return {
    status: 200,
    successtatus: true,
    data: result.rows,
    message: "Mock API docs & json fetched successfully!",
  };
};
module.exports = getMockApiCategoryDownloadPaths;
