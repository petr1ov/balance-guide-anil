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
    
    console.log(`Payment failed callback received, InvId: ${invId}`);

    // Redirect to the app with fail status
    const appUrl = Deno.env.get("APP_URL") || "https://balance-guide-anil.lovable.app";
    const redirectUrl = `${appUrl}/?payment=failed&invId=${invId || ""}`;

    // Return HTML that shows failure message and redirects
    const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ошибка оплаты</title>
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
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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
    .retry {
      margin-top: 12px;
    }
    .retry a {
      color: rgba(255,255,255,0.7);
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </div>
    <h1>Оплата не прошла</h1>
    <p>К сожалению, платёж не был завершён. Попробуйте ещё раз или выберите другой способ оплаты.</p>
    <a href="${redirectUrl}" class="button">Вернуться в приложение</a>
    <div class="retry">
      <a href="${redirectUrl}">Попробовать снова</a>
    </div>
  </div>
  <script>
    // Auto-redirect after 5 seconds
    setTimeout(() => {
      window.location.href = "${redirectUrl}";
    }, 5000);
  </script>
</body>
</html>
    `;

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error in fail handler:", error);
    return new Response("Error processing fail callback", { status: 500 });
  }
});
