exports.handler = async (event) => {
  const allowedOrigin = "https://www.jordanprusso.com"; // <-- your GitHub Pages URL

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
    const fullName = `${first_name} ${last_name}`;
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
      // accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        name: fullName,
        email,
        phone,
        message,
        time: estTime,
      },
    };

    // console.log("PUBLIC KEY:", process.env.EMAILJS_PUBLIC_KEY);

    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.EMAILJS_PRIVATE_KEY}`,
      },
        body: JSON.stringify(data),
      }
    );

    // 👇 read response body as text
    const responseText = await response.text();
    
    console.log("EmailJS status:", response.status);
    console.log("EmailJS response body:", responseText);
    
    if (!response.ok) {
      throw new Error(`EmailJS error ${response.status}: ${responseText}`);
    }

    // if (!response.ok) {
    //   throw new Error(`EmailJS error: ${response.status}`);
    // }


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
