const updateUserForInvoiceProfile = async (client, req) => {
  const result_userdetails = await client.query(
    `select *from serverpe_user where mobile_number=$1`,
    [req.mobile_number]
  );
  const result = await client.query(
    `update serverpe_user set invoice_address=$1, invoice_email=$2, invoice_user_name=$3, invoice_mobile_number=$4 where mobile_number=$5 returning *`,
    [
      req.body.address,
      req.body.myemail,
      req.body.user_name,
      req.body.mobile_number,
      req.mobile_number,
    ]
  );
  return {
    statuscode: 200,
    successstatus: true,
    data: result.rows[0],
  };
};
module.exports = updateUserForInvoiceProfile;
