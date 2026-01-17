const getStudentPurchasedDetails = async (client, order_number) => {
    const result_order_details = await client.query('select * from orders where order_number = $1  ', [order_number]);
    if(0 === result_order_details.rows.length){
        return {
            statuscode: 200,
            successstatus: true,
            data: [],
        };
    }
    const result = await client.query(    
        `SELECT
    -- Order
    o.id AS order_id,
    o.order_number,
    o.order_status,
    o.created_at AS order_date,

    -- User
    u.id AS user_id,
    u.user_name,
    u.email,
    u.mobile_number,

    -- College & State (optional but useful)
    c.college_name,
    c.place AS college_place,
    c.district AS college_district,
    s.state_name,

    -- Project
    p.project_code,
    p.title AS project_title,
    p.technology,
    p.difficulty,
    p.*,

    -- Project Version
    pv.version AS project_version,
    pv.zip_file_path,

    -- Payment
    pay.gateway,
    pay.gateway_order_id,
    pay.gateway_payment_id,
    pay.payment_status,
    pay.paid_at,

    -- Financials
    o.total_amount       AS base_amount,
    o.gst_amount         AS gst_amount,
    o.payable_amount     AS total_paid,

    -- Invoice
    i.id AS invoice_id,
    i.invoice_number,
    i.invoice_date,
    i.invoice_pdf_path,

    -- License
    l.license_key,
    l.status AS license_active,
    l.created_at AS license_issued_at

FROM orders o

-- User
JOIN users u
    ON u.id = o.fk_user_id

-- College (LEFT JOIN – user may not have college selected)
LEFT JOIN college_list c
    ON c.id = u.fk_college_id

-- State (LEFT JOIN – optional)
LEFT JOIN states s
    ON s.id = u.fk_state_id

-- Payment
LEFT JOIN payments pay
    ON pay.fk_order_id = o.id

-- Invoice
LEFT JOIN invoices i
    ON i.fk_order_id = o.id

-- License
LEFT JOIN licenses l
    ON l.fk_user_id = u.id

-- Project
LEFT JOIN projects p
    ON p.id = l.fk_project_id

-- Project Version (latest downloaded or first version)
LEFT JOIN project_versions pv
    ON pv.fk_project_id = p.id

WHERE o.order_number = $1;`,
        [order_number]
    );
  const data = result.rows.map(row => ({
    ...row,
    project_type: row.project_type || 'FULL_STACK'
  }));

  return {
    statuscode: 200,
    successstatus: true,
    data: data,
  };
};
module.exports = getStudentPurchasedDetails;
