const generateOrderNumber = require("./generateOrderNumber");   
const inserTransactions = async (
  client,  // CRITICAL: Must be a dedicated client from pool.connect(), NOT the pool itself
  transaction_data,   // Razorpay payment object
  mobile_number,
  summaryFormData     // user_name, email, project_id
) => {  
  // ============================================================
  // START TRANSACTION
  // This ensures ALL queries below are atomic (all-or-nothing)
  // ============================================================
  
  try{
    await client.query('BEGIN');
  /* -----------------------------------------
   1️⃣ FETCH USER (BY MOBILE NUMBER)
  ------------------------------------------*/
  const result_user = await client.query(
    `SELECT id, user_name, email
     FROM users
     WHERE mobile_number = $1`,
    [mobile_number]
  );

  if (result_user.rowCount === 0) {
    throw new Error("User not found");
  }

  const user = result_user.rows[0];

  /* -----------------------------------------
   2️⃣ CREATE ORDER (PAID)
  ------------------------------------------*/
  const baseAmount = transaction_data.amount / 100 / 1.18;
  const gstAmount  = (transaction_data.amount / 100) - baseAmount;
  const order_number = generateOrderNumber({
    user_id: user.id,
    mobile_number,
    email: user.email,
    project_id: summaryFormData?.project?.id
  });
  
  const result_order = await client.query(
    `INSERT INTO orders (
        fk_user_id,
        order_number,
        total_amount,
        gst_amount,
        payable_amount,
        order_status
     ) VALUES ($1,$2,$3,$4,$5,'PAID')
     RETURNING *`,
    [
      user.id,
      order_number,
      baseAmount.toFixed(2),
      gstAmount.toFixed(2),
      transaction_data.amount / 100
    ]
  );

  const order = result_order.rows[0];

  /* -----------------------------------------
   3️⃣ INSERT PAYMENT (RAZORPAY)
  ------------------------------------------*/
  await client.query(
    `INSERT INTO payments (
        fk_order_id,
        gateway,
        gateway_order_id,
        gateway_payment_id,
        payment_status,
        paid_at
     ) VALUES ($1,'RAZORPAY',$2,$3,'SUCCESS',NOW())`,
    [
      order.id,
      transaction_data.order_id,
      transaction_data.id
    ]
  );

  /* -----------------------------------------
   4️⃣ GENERATE LICENSE (PROJECT ACCESS)
  ------------------------------------------*/
  const licenseKey = `LIC-${user.id}-${Date.now()}`;

  const result_license = await client.query(
    `INSERT INTO licenses (
        fk_user_id,
        fk_project_id,
        license_key
     ) VALUES ($1,$2,$3)
     RETURNING *`,
    [
      user.id,
      summaryFormData?.project?.id,
      licenseKey
    ]
  );

  /* -----------------------------------------
   5️⃣ GENERATE INVOICE (GST COMPLIANT)
  ------------------------------------------*/
  const invoiceNumber = `SVRP/${new Date().getFullYear()}/${order.id}`;

  await client.query(
    `INSERT INTO invoices (
        fk_order_id,
        invoice_number,
        buyer_name,
        taxable_amount,
        gst_amount,
        total_amount
     ) VALUES ($1,$2,$3,$4,$5,$6)`,
    [
      order.id,
      invoiceNumber,
      summaryFormData?.userDetails?.user_name,
      baseAmount.toFixed(2),
      gstAmount.toFixed(2),
      transaction_data.amount / 100
    ]
  );
  
  // ============================================================
  // COMMIT TRANSACTION
  // All inserts above were NOT committed yet. This commits them atomically.
  // If we reached here, everything succeeded.
  // ============================================================  

  /* -----------------------------------------
   6️⃣ EMAIL CONFIRMATION
  ------------------------------------------*/
  /*await sendMail({
    to: user.email,
    subject: "Project Purchase Successful – ServerPe",
    html: projectPurchaseTemplate({
      userName: user.user_name,
      amount: transaction_data.amount / 100,
      licenseKey
    }),
    text: `Your project purchase was successful. License Key: ${licenseKey}`
  });*/
await client.query('COMMIT');
  /* -----------------------------------------
   ✅ FINAL RESPONSE
  ------------------------------------------*/
  return {
    status: 200,
    successstatus: true,
    message: "Project purchase completed successfully",
    // Mapping for PaymentSuccessSummaryPage.js
    result_transaction: {
      razorpay_order_id: transaction_data.order_id || order.order_number,
      amount: transaction_data.amount, // in paise
      description: transaction_data.description || `Plan: ${summaryFormData?.project?.project_code}`,
      created_at: transaction_data.created_at || Math.floor(Date.now() / 1000),
      status: transaction_data.status || 'captured'
    },
    result_user_details: {
      myemail: user.email
    },
    result_credit: {
      id: order.id,
      created_at: order.created_at || new Date().toISOString(),
      myemail: user.email
    },
    // Keep original for debugging/completeness if needed, or remove if sensitive
    order,
    license: result_license.rows[0]
  };  
}
catch(err){
  // ============================================================
  // ROLLBACK TRANSACTION
  // If ANY query above failed, undo ALL changes.
  // This prevents orphaned orders/payments in the database.
  // ============================================================  
  await client.query('ROLLBACK');
  throw err;
}
};

module.exports = inserTransactions;
