const insertTransactionDetails = async (
  client,
  transaction_data,
  mobile_number
) => {
  // 1️⃣ Get user
  const result_user = await client.query(
    `SELECT id FROM serverpe_user WHERE mobile_number = $1`,
    [mobile_number]
  );

  if (result_user.rowCount === 0) {
    throw new Error("User not found");
  }

  const fkUserId = result_user.rows[0].id;

  // 2️⃣ Insert transaction
  const result_transaction = await client.query(
    `INSERT INTO serverpe_transaction_details (
      fk_user,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_invoice_id,
      amount,
      currency,
      amount_refunded,
      fee,
      tax,
      status,
      captured,
      method,
      vpa,
      bank,
      wallet,
      card_id,
      email,
      contact,
      description,
      notes,
      error_code,
      error_description,
      error_source,
      error_step,
      error_reason,
      rrn,
      upi_transaction_id,
      upi_flow,
      razorpay_created_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
      $21,$22,$23,$24,$25,$26,$27,$28,$29
    )
    RETURNING *`,
    [
      fkUserId,
      transaction_data.id, // razorpay_payment_id
      transaction_data.order_id, // razorpay_order_id
      transaction_data.invoice_id, // razorpay_invoice_id
      transaction_data.amount,
      transaction_data.currency,
      transaction_data.amount_refunded,
      transaction_data.fee,
      transaction_data.tax,
      transaction_data.status,
      transaction_data.captured,
      transaction_data.method,
      transaction_data.vpa,
      transaction_data.bank,
      transaction_data.wallet,
      transaction_data.card_id,
      transaction_data.email,
      transaction_data.contact,
      transaction_data.description,
      JSON.stringify(transaction_data.notes || []),
      transaction_data.error_code,
      transaction_data.error_description,
      transaction_data.error_source,
      transaction_data.error_step,
      transaction_data.error_reason,
      transaction_data.acquirer_data?.rrn || null,
      transaction_data.acquirer_data?.upi_transaction_id || null,
      transaction_data.upi?.flow || null,
      new Date(transaction_data.created_at * 1000),
    ]
  );

  if (result_user.rowCount === 0) {
    throw new Error("User not found");
  }
  //fetch count from recharged amount
  const result_api = await client.query(
    `select id, price_name, api_calls_count from serverpe_apipricing where price=$1`,
    [transaction_data.amount / 100]
  );
  const result_wallet_available = await client.query(
    `select outstanding_apikey_count from serverpe_user_apikeywallet where fk_user=$1`,
    [result_user.rows[0].id]
  );
  const result_wallet = await client.query(
    `update serverpe_user_apikeywallet set outstanding_apikey_count = $1 where fk_user=$2 returning *`,
    [
      result_api.rows[0].api_calls_count +
        result_wallet_available.rows[0].outstanding_apikey_count,
      result_user.rows[0].id,
    ]
  );
  const result_credit = await client.query(
    `insert into serverpe_user_apikeywallet_credit (fk_user, fk_pricing, fktransaction_details) values ($1,$2,$3) returning *`,
    [
      result_user.rows[0].id,
      result_api.rows[0].id,
      result_transaction.rows[0].id,
    ]
  );
  return {
    status: 200,
    successstatus: true,
    result_user_details: result_user.rows[0],
    result_transaction: result_transaction.rows[0],
    result_wallet: result_wallet.rows[0],
    result_credit: result_credit.rows[0],
  };
};

module.exports = insertTransactionDetails;
