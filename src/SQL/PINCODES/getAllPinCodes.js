const getAllPinCodes = async (
  pool,
  search,
  limit,
  skip,
  canSearchByWholeWord,
  canSearchByContent
) => {
  if (!search || (!canSearchByWholeWord && !canSearchByContent)) {
    return [];
  }

  const conditions = [];
  const values = [];
  let idx = 1;

  // Normalize input once (ignore case handling)
  const normalizedSearch = search.trim();

  // 🔹 Whole-word / semantic search (case-insensitive by default in FTS)
  if (canSearchByWholeWord) {
    conditions.push(`
      to_tsvector('english',
        coalesce(state,'') || ' ' ||
        coalesce(district,'') || ' ' ||
        coalesce(block,'') || ' ' ||
        coalesce(branch_type,'') || ' ' ||
        coalesce(name,'') || ' ' ||
        coalesce(pincode::text,'')
      ) @@ plainto_tsquery('english', $${idx})
    `);
    values.push(normalizedSearch);
    idx++;
  }

  // 🔹 Content / partial search (ILIKE = ignore case)
  if (canSearchByContent) {
    conditions.push(`
      (
        state ILIKE '%' || $${idx} || '%' OR
        district ILIKE '%' || $${idx} || '%' OR
        block ILIKE '%' || $${idx} || '%' OR
        branch_type ILIKE '%' || $${idx} || '%' OR
        name ILIKE '%' || $${idx} || '%' OR
        pincode::text ILIKE '%' || $${idx} || '%'
      )
    `);
    values.push(normalizedSearch);
    idx++;
  }

  // Pagination
  values.push(limit, skip);

  const sql = `
    SELECT *
    FROM pincodes
    WHERE ${conditions.join(" OR ")}
    ORDER BY
      state ASC,
      district ASC,
      block ASC,
      branch_type ASC,
      name ASC
    LIMIT $${idx} OFFSET $${idx + 1}
  `;

  const { rows } = await pool.query(sql, values);
  return rows;
};

module.exports = getAllPinCodes;
