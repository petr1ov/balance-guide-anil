const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const invId = url.searchParams.get("InvId") || url.searchParams.get("inv_id");
    
    console.log(`Payment success callback received, InvId: ${invId}`);

    // Redirect to the app with success status
    // The app URL - users will be redirected back to the Telegram WebApp
    const appUrl = Deno.env.get("APP_URL") || "https://balance-guide-anil.lovable.app";
    const redirectUrl = `${appUrl}/?payment=success&invId=${invId || ""}`;

    // Return HTML that redirects and shows success message
    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Оплата успешна</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      box-sizing: border-box;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .icon svg {
      width: 40px;
      height: 40px;
      color: white;
    }
    h1 {
      font-size: 24px;
      margin: 0 0 12px;
    }
    p {
      color: rgba(255,255,255,0.7);
      margin: 0 0 24px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 14px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .button:hover {
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
    <h1>Оплата успешна!</h1>
    <p>Ваша Pro подписка активирована. Спасибо за поддержку!</p>
    <a href="${redirectUrl}" class="button">Вернуться в приложение</a>
  </div>
  <script>
    // Auto-redirect after 3 seconds
    setTimeout(() => {
      window.location.href = "${redirectUrl}";
    }, 3000);
  </script>
</body>
</html>
    `;

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error in success handler:", error);
    return new Response("Error processing success callback", { status: 500 });
  }
});
