const rechargeSuccessTemplate = ({ amount, credits }) => {
  return `
  <div style="font-family:Arial; max-width:600px; margin:auto">
    <h2 style="color:#2b7cff">Recharge Successful 🎉</h2>

    <p>Thank you for recharging <strong>₹${amount}/-</strong>.</p>

    <p>
      <strong>${credits} mock API credits</strong> have been successfully
      added to your ServerPe account.
    </p>

    <p>You can start using the APIs immediately.</p>

    <hr />

    <p style="font-size:13px;color:#555">
      Thank you for using <strong>ServerPe</strong><br/>
      <em>Desi API to challenge your UI</em>
    </p>

    <p style="font-size:11px;color:#999">
      This is an automated email. Please do not reply.
    </p>
  </div>
  `;
};

module.exports = rechargeSuccessTemplate;
