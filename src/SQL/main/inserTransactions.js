const generateOrderNumber = require("./generateOrderNumber");
const { generateApiKey } = require("./generateApiKey");
const generateInvoicePdf = require("./generateInvoicePdf");   
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
   1.5️⃣ FETCH PROJECT TYPE
   Determines if API key should be generated
  ------------------------------------------*/
  const result_project = await client.query(
    `SELECT * FROM projects WHERE id = $1`,
    [summaryFormData?.project?.id]
  );
  // Fallback to FULL_STACK if project_type column doesn't exist
  const projectType = result_project.rows[0]?.project_type || 'FULL_STACK';

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
   For UI_ONLY projects, also generate API key
  ------------------------------------------*/
  const licenseKey = `LIC-${user.id}-${Date.now()}`;
  
  // Generate API key only for UI_ONLY projects
  const apiKey = projectType === 'UI_ONLY' ? generateApiKey() : null;

  const result_license = await client.query(
    `INSERT INTO licenses (
        fk_user_id,
        fk_project_id,
        license_key,
        api_key,
        api_key_status
     ) VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [
      user.id,
      summaryFormData?.project?.id,
      licenseKey,
      apiKey,
      apiKey ? 'ACTIVE' : null
    ]
  );


  /* -----------------------------------------
   5️⃣ GENERATE INVOICE (GST COMPLIANT)
  ------------------------------------------*/
  const invoiceNumber = `SVRP/${new Date().getFullYear()}/${order.id}`;

  const invoiceResult = await client.query(
    `INSERT INTO invoices (
        fk_order_id,
        invoice_number,
        buyer_name,
        taxable_amount,
        gst_amount,
        total_amount
     ) VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id`,
    [
      order.id,
      invoiceNumber,
      summaryFormData?.userDetails?.user_name,
      baseAmount.toFixed(2),
      gstAmount.toFixed(2),
      transaction_data.amount / 100
    ]
  );
  
  const invoiceId = invoiceResult.rows[0].id;
  
  // ============================================================
  // COMMIT TRANSACTION
  // All inserts above were NOT committed yet. This commits them atomically.
  // If we reached here, everything succeeded.
  // ============================================================  
  await client.query('COMMIT');

  /* -----------------------------------------
   6️⃣ GENERATE INVOICE PDF (after commit)
  ------------------------------------------*/
  let invoicePdfPath = null;
  try {
    const pdfResult = await generateInvoicePdf({
      invoice_number: invoiceNumber,
      buyer_name: summaryFormData?.userDetails?.user_name || user.user_name,
      buyer_email: user.email,
      buyer_mobile: mobile_number,
      project_title: summaryFormData?.project?.title || 'Project Purchase',
      project_type: projectType,
      taxable_amount: baseAmount,
      gst_amount: gstAmount,
      total_amount: transaction_data.amount / 100,
      payment_id: transaction_data.id,
      invoice_date: new Date()
    });
    
    if (pdfResult.success) {
      invoicePdfPath = pdfResult.relative_path;
      // Update invoice with PDF path
      await client.query(
        `UPDATE invoices SET invoice_pdf_path = $1 WHERE id = $2`,
        [invoicePdfPath, invoiceId]
      );
    }
  } catch (pdfError) {
    console.error('PDF generation error (non-critical):', pdfError.message);
    // Don't fail the transaction for PDF errors
  }

  /* -----------------------------------------
   ✅ FINAL RESPONSE
  ------------------------------------------*/
  return {
    statuscode: 200,
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
    license: result_license.rows[0],
    // Project type info - for UI to display API key if UI_ONLY
    project_type: projectType,
    api_key: apiKey,
    // Invoice details for download
    invoice_id: invoiceId,
    invoice_number: invoiceNumber,
    invoice_pdf_path: invoicePdfPath
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
