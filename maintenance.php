<?php

declare(strict_types=1);

// Kein bootstrap.php nötig — diese Seite steht für sich allein
?><!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Wartung — HOTMESS BLKN</title>
  <meta name="robots" content="noindex, nofollow">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      background: #080706;
      color: #f7f2ea;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .wrap {
      max-width: 520px;
      width: 100%;
      text-align: center;
    }
    .logo {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: .26em;
      color: #d6b56d;
      text-transform: uppercase;
      margin-bottom: 48px;
    }
    .icon {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: rgba(214,181,109,.1);
      border: 1px solid rgba(214,181,109,.25);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 32px;
    }
    .icon svg { color: #d6b56d; }
    h1 {
      font-size: 28px;
      font-weight: 900;
      color: #fff;
      line-height: 1.15;
      margin-bottom: 16px;
      letter-spacing: -.01em;
    }
    p {
      font-size: 15px;
      color: #9f978a;
      line-height: 1.7;
      margin-bottom: 40px;
    }
    .divider {
      width: 48px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #d6b56d, transparent);
      margin: 0 auto 40px;
    }
    .footer {
      font-size: 12px;
      color: #4a4440;
      letter-spacing: .08em;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">HOTMESS</div>
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="32" height="32">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"/>
      </svg>
    </div>
    <h1>Wir arbeiten<br>an etwas Besonderem.</h1>
    <div class="divider"></div>
    <p>HOTMESS BLKN wird gerade aktualisiert.<br>Wir sind bald wieder für dich da.</p>
    <div class="footer">HOTMESS BLKN &mdash; Erlebnisse. Begegnungen. Erinnerungen.</div>
  </div>
</body>
</html>
