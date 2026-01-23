const axios = require("axios");

exports.handler = async (event) => {
  const allowedOrigin = "https://Jrusso7.github.io"; // <-- your GitHub Pages URL

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  // Allow POST only
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
      },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      message,
    } = JSON.parse(event.body);

    const now = new Date();
    const estTime = now.toLocaleString("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const data = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        first_name,
        last_name,
        email,
        phone,
        message,
        time: estTime,
      },
    };

    const response = await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      data,
      { headers: { "Content-Type": "application/json" } }
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error("EmailJS Error:", error.response?.data || error.message);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ success: false }),
    };
  }
};
