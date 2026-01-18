const getStudentPurchaseHistory = async (client, req) => {
  const result_user = await client.query(
    "select id from users where mobile_number=$1;",
    [req.mobile_number],
  );
  const result_projectpurchase = await client.query(
    "select id from orders where fk_user_id = $1  ",
    [result_user.rows[0].id],
  );
  if (0 === result_projectpurchase.rows.length) {
    return {
      statuscode: 200,
      successstatus: true,
      data: [],
    };
  }
  const result = await client.query(
    `SELECT 
    -- USER DETAILS
    u.id                    AS user_id,
    u.user_name,
    u.email,
    u.mobile_number,
    u.fk_college_id,
    u.branch,
    u.created_at            AS user_registered_at,

    -- ORDER DETAILS
    o.id                    AS order_id,
    o.order_number,
    o.total_amount          AS base_amount,
    o.gst_amount,
    o.payable_amount,
    o.order_status,
    o.created_at            AS order_date,

    -- PAYMENT DETAILS
    p.gateway,
    p.gateway_order_id,
    p.gateway_payment_id,
    p.payment_status,
    p.paid_at               AS payment_date,

    -- PROJECT DETAILS
    pr.project_code,
    pr.title                AS project_title,
    pr.technology,
    pr.difficulty,
    pr.*,

    -- LICENSE DETAILS
    l.license_key,
    l.status             AS license_active,
    l.expiry_date,
    l.created_at            AS license_issued_at,

    -- INVOICE DETAILS
    i.id                    AS invoice_id,
    i.invoice_number,
    i.invoice_date,
    i.taxable_amount,
    i.gst_amount            AS invoice_gst,
    i.total_amount          AS invoice_total,
    i.invoice_pdf_path

FROM users u
LEFT JOIN orders o
    ON o.fk_user_id = u.id

LEFT JOIN payments p
    ON p.fk_order_id = o.id

LEFT JOIN invoices i
    ON i.fk_order_id = o.id

LEFT JOIN licenses l
    ON l.fk_user_id = u.id

LEFT JOIN projects pr
    ON pr.id = l.fk_project_id

WHERE
    u.id = $1`,
    [result_user.rows[0].id],
  );
  const data = result.rows.map((row) => ({
    ...row,
    project_type: row.project_type || "FULL_STACK",
  }));

  return {
    statuscode: 200,
    successstatus: true,
    data: data,
  };
};
module.exports = getStudentPurchaseHistory;
