export async function sendEmail(email: string, otp: string, userName: string) {
  const zeptoUrl = process.env.ZEPTO_URL;
  const zeptoToken = process.env.ZEPTO_TOKEN;
  const zeptoFrom = process.env.ZEPTO_FROM;
  const templateKey = process.env.ZEPTO_TEMPLATE_KEY;
  const templateAlias = process.env.ZEPTO_TEMPLATE_ALIAS;
  const templateUrl =
    process.env.ZEPTO_TEMPLATE_URL ||
    (zeptoUrl?.endsWith("/email/template")
      ? zeptoUrl
      : zeptoUrl?.replace(/\/email\/?$/, "/email/template"));

  if (!zeptoUrl || !zeptoToken || !zeptoFrom || (!templateKey && !templateAlias)) {
    console.error("ZeptoMail environment variables are missing:", {
      ZEPTO_URL: Boolean(zeptoUrl),
      ZEPTO_TOKEN: Boolean(zeptoToken),
      ZEPTO_FROM: Boolean(zeptoFrom),
      ZEPTO_TEMPLATE_KEY_OR_ALIAS: Boolean(templateKey || templateAlias),
    });
    throw new Error("Email service is not configured");
  }

  if (!templateUrl || (templateUrl === zeptoUrl && !zeptoUrl.endsWith("/email/template"))) {
    throw new Error(
      "Unable to determine ZeptoMail template endpoint. Set ZEPTO_TEMPLATE_URL.",
    );
  }

  try {
    const response = await fetch(templateUrl, {
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
              name: userName,
            },
          },
        ],
        ...(templateKey ? { template_key: templateKey } : { template_alias: templateAlias }),
        merge_info: {
          user_name: userName,
          otp,
        },
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
