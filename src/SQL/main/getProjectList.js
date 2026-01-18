const getProjectList = async (client, req) => {
  // Get all projects
  const projectsResult = await client.query(
    `SELECT * FROM projects ORDER BY title;`,
  );

  // Get all project benefits
  const benefitsResult = await client.query(
    `SELECT * FROM project_benefits ORDER BY project_id, id;`,
  );

  // Group benefits by project_id
  const benefitsByProject = {};
  for (const benefit of benefitsResult.rows) {
    const projectId = benefit?.project_id;
    if (!benefitsByProject[projectId]) {
      benefitsByProject[projectId] = [];
    }
    benefitsByProject[projectId].push(benefit);
  }

  // Add default project_type and benefits to each project
  const data = projectsResult.rows.map((row) => ({
    ...row,
    project_type: row.project_type || "FULL_STACK",
    benefits: benefitsByProject[row.id] || [],
  }));

  return {
    statuscode: 200,
    successstatus: true,
    data: data,
    message: "project details fetched successfully.",
  };
};

module.exports = getProjectList;
