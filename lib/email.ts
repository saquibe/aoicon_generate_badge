export async function sendEmail(email: string, otp: string) {
  const zeptoUrl = process.env.ZEPTO_URL;
  const zeptoToken = process.env.ZEPTO_TOKEN;
  const zeptoFrom = process.env.ZEPTO_FROM;

  if (!zeptoUrl || !zeptoToken || !zeptoFrom) {
    console.error("ZeptoMail environment variables are missing:", {
      ZEPTO_URL: Boolean(zeptoUrl),
      ZEPTO_TOKEN: Boolean(zeptoToken),
      ZEPTO_FROM: Boolean(zeptoFrom),
    });
    throw new Error("Email service is not configured");
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <body style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
        <div style="max-width:600px;margin:0 auto;padding:20px">
          <div style="background:#174a7e;color:#fff;padding:24px;text-align:center">
            <h1>AROICON 2026 HYDERABAD</h1>
            <p>Verification Code</p>
          </div>
          <div style="background:#f9f9f9;padding:24px">
            <p>Dear Participant,</p>
            <p>Your one-time password for accessing your AROICON 2026 HYDERABAD badge is:</p>
            <div style="background:#fff;border:2px dashed #174a7e;padding:20px;text-align:center;margin:20px 0">
              <span style="font-size:32px;font-weight:bold;color:#174a7e;letter-spacing:5px">${otp}</span>
            </div>
            <p><strong>This OTP is valid for 10 minutes.</strong></p>
            <p>Please do not share this OTP with anyone. If you did not request it, you can ignore this email.</p>
            <p style="text-align:center;color:#666;font-size:12px">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const response = await fetch(zeptoUrl, {
      method: "POST",
      headers: {
        Authorization: `Zoho-enczapikey ${zeptoToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from: {
          address: zeptoFrom,
          name: "AROICON 2026 Registration Team",
        },
        to: [
          {
            email_address: {
              address: email,
            },
          },
        ],
        subject: "Your OTP for AROICON 2026 HYDERABAD",
        htmlbody: htmlContent,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error("ZeptoMail rejected OTP email:", {
        status: response.status,
        statusText: response.statusText,
        response: responseText,
      });
      throw new Error("Email provider rejected the request");
    }

    return await response.json();
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send email");
  }
}
