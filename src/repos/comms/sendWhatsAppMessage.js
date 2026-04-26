const axios = require("axios");
require("dotenv").config();

const sendWhatsAppMessage = async (mobile_number, user_name) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: `91${mobile_number}`,
        type: "template",
        template: {
          name: "live_contact_acknowledgement",
          language: {
            code: "en_US",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: "Shiva"
                },
              ]
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Message sent:", response.data);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
  }
};

module.exports = sendWhatsAppMessage;