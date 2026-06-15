<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/referral-data.php';

$user = current_user();
$refCode = strtoupper(trim($_GET['ref'] ?? ''));
$referrerName = '';
$codeValid = false;

if ($refCode !== '') {
    hotmess_track(ANALYTICS_REFERRAL_LANDING, ['ref_code' => $refCode], $user ? (int) $user['id'] : null);
    // Code in Session merken
    hotmess_referral_remember_code($refCode);

    $codeRow = hotmess_referral_find_by_code($refCode);
    if ($codeRow && $codeRow['status'] === 'active') {
        $codeValid = true;
        // Nur Vornamen zeigen
        $nameParts = explode(' ', trim((string) $codeRow['name']));
        $referrerName = $nameParts[0] ?? '';
    }
}

$pageTitle = 'HOTMESS einladen';
?>
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= e($pageTitle) ?> | HOTMESS BLKN</title>
  <link rel="stylesheet" href="/styles.css" />
  <style>
    .referral-hero { max-width: 600px; margin: 0 auto; padding: 80px 24px 60px; text-align: center; }
    .referral-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 999px; background: rgba(214,181,109,.12); border: 1px solid rgba(214,181,109,.3); color: #d6b56d; font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 28px; }
    .referral-headline { font-size: clamp(28px,5vw,44px); font-weight: 900; line-height: 1.08; color: #fff; margin: 0 0 18px; }
    .referral-sub { color: #b8b0a4; font-size: 16px; line-height: 1.65; margin: 0 0 36px; }
    .referral-card { background: #141210; border: 1px solid rgba(214,181,109,.2); border-radius: 20px; padding: 32px; margin-bottom: 32px; text-align: left; }
    .referral-card-title { font-size: 11px; font-weight: 700; letter-spacing: .18em; color: #d6b56d; text-transform: uppercase; margin: 0 0 16px; }
    .referral-perks { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
    .referral-perks li { display: flex; align-items: center; gap: 10px; color: #d9d2c6; font-size: 15px; }
    .referral-perks li::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #d6b56d; flex-shrink: 0; }
    .referral-cta-group { display: flex; flex-direction: column; gap: 12px; }
    .referral-code-display { font-family: monospace; font-size: 18px; letter-spacing: .2em; color: #f2d28f; background: rgba(214,181,109,.08); border: 1px solid rgba(214,181,109,.2); border-radius: 10px; padding: 14px 18px; text-align: center; font-weight: 700; margin-bottom: 8px; }
  </style>
</head>
<body>
<main style="min-height:100vh; background:#080706;">
  <div class="referral-hero">

    <?php if ($codeValid): ?>
      <div class="referral-badge">
        <span>Einladung</span>
      </div>
      <h1 class="referral-headline">
        Du wurdest zur<br/>HOTMESS Community eingeladen.
      </h1>
      <?php if ($referrerName !== ''): ?>
        <p class="referral-sub">
          <?= e($referrerName) ?> hat dich in die HOTMESS Welt eingeladen — Events, Membership, Travel und Concierge in einem exklusiven Erlebnisraum.
        </p>
      <?php else: ?>
        <p class="referral-sub">
          Jemand aus der HOTMESS Community hat dich eingeladen. Registriere dich jetzt und werde Teil des Netzwerks.
        </p>
      <?php endif; ?>

      <div class="referral-card">
        <p class="referral-card-title">Was dich erwartet</p>
        <ul class="referral-perks">
          <li>Exklusive HOTMESS Events in deiner Stadt</li>
          <li>Passport Loyalty — Punkte sammeln und Rewards einlösen</li>
          <li>Kuratierte Travel- und Hotel-Erlebnisse</li>
          <li>Persönlicher Concierge-Service</li>
          <li>Private Community mit echten Menschen</li>
        </ul>
      </div>

      <div class="referral-cta-group">
        <a href="/register.php?ref=<?= e($refCode) ?>" class="button primary" style="text-align:center;">
          Jetzt registrieren
        </a>
        <?php if ($user): ?>
          <a href="/" class="button ghost" style="text-align:center;">Zur Startseite</a>
        <?php else: ?>
          <a href="/login.php" class="button ghost" style="text-align:center;">Bereits Mitglied? Anmelden</a>
        <?php endif; ?>
      </div>

    <?php elseif ($refCode !== ''): ?>
      <div class="referral-badge">
        <span>Einladung</span>
      </div>
      <h1 class="referral-headline">Dieser Einladungslink<br/>ist nicht mehr aktiv.</h1>
      <p class="referral-sub">Der verwendete Referral-Code ist abgelaufen, pausiert oder ungültig. Du kannst dich trotzdem registrieren.</p>
      <div class="referral-cta-group">
        <a href="/register.php" class="button primary" style="text-align:center;">Jetzt registrieren</a>
        <a href="/" class="button ghost" style="text-align:center;">Zur Startseite</a>
      </div>

    <?php else: ?>
      <div class="referral-badge">
        <span>HOTMESS Community</span>
      </div>
      <h1 class="referral-headline">Freunde einladen.<br/>Punkte sammeln.</h1>
      <p class="referral-sub">
        Lade neue Mitglieder mit deinem persönlichen Referral-Code ein und erhalte Passport Punkte für jede erfolgreiche Empfehlung.
      </p>
      <div class="referral-cta-group">
        <?php if ($user): ?>
          <a href="/account/referrals" class="button primary" style="text-align:center;">Meinen Code ansehen</a>
        <?php else: ?>
          <a href="/register.php" class="button primary" style="text-align:center;">Jetzt registrieren</a>
          <a href="/login.php" class="button ghost" style="text-align:center;">Anmelden</a>
        <?php endif; ?>
      </div>
    <?php endif; ?>

  </div>
</main>
</body>
</html>
