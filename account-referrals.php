<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/referral-data.php';

$user = require_login();
$userId = (int) $user['id'];

$stats = hotmess_referral_stats_for_user($userId);
$referrals = hotmess_referral_list_for_user($userId, 50);
$isAmbassador = hotmess_referral_is_ambassador($userId);
$ambassadorProfile = $isAmbassador ? hotmess_referral_get_ambassador(referrer: $userId) : null;

$siteUrl = rtrim((string) (getenv('SITE_URL') ?: (defined('APP_URL') ? APP_URL : 'https://hotmess-blkn.com')), '/');
$referralLink = $siteUrl . '/referral?ref=' . urlencode($stats['code']);

$loyaltyAccount = hotmess_loyalty_account($userId);
$referralPoints = (int) ($stats['total_points'] ?? 0);

$pageTitle = 'Meine Einladungen';
?>
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= e($pageTitle) ?> | HOTMESS BLKN</title>
  <link rel="stylesheet" href="/styles.css" />
  <style>
    .referral-page { max-width: 860px; margin: 0 auto; padding: 48px 20px 80px; }
    .referral-page-header { margin-bottom: 36px; }
    .referral-page-header .eyebrow { font-size: 11px; font-weight: 700; letter-spacing: .2em; color: #d6b56d; text-transform: uppercase; margin: 0 0 8px; }
    .referral-page-header h1 { font-size: 28px; font-weight: 900; color: #fff; margin: 0 0 6px; }
    .referral-page-header p { color: #9f978a; font-size: 15px; margin: 0; }

    .referral-wallet-card { background: linear-gradient(135deg, #1a1510 0%, #111009 100%); border: 1px solid rgba(214,181,109,.28); border-radius: 20px; padding: 32px; margin-bottom: 28px; position: relative; overflow: hidden; }
    .referral-wallet-card::before { content: 'HOTMESS'; position: absolute; right: -10px; top: -10px; font-size: 80px; font-weight: 900; color: rgba(214,181,109,.04); letter-spacing: -.02em; line-height: 1; pointer-events: none; }
    .referral-wallet-label { font-size: 11px; font-weight: 700; letter-spacing: .2em; color: #d6b56d; text-transform: uppercase; margin: 0 0 6px; }
    .referral-code-box { font-size: 22px; font-weight: 900; letter-spacing: .18em; color: #f2d28f; font-family: monospace; margin: 0 0 18px; word-break: break-all; }
    .referral-link-box { background: rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #9f978a; word-break: break-all; margin-bottom: 16px; }
    .referral-actions { display: flex; flex-wrap: wrap; gap: 10px; }
    .btn-copy { padding: 10px 18px; border-radius: 999px; background: rgba(214,181,109,.15); border: 1px solid rgba(214,181,109,.35); color: #d6b56d; font-size: 13px; font-weight: 700; cursor: pointer; transition: background .2s; }
    .btn-copy:hover { background: rgba(214,181,109,.25); }

    .referral-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; margin-bottom: 28px; }
    .referral-kpi { background: #141210; border: 1px solid rgba(255,255,255,.07); border-radius: 14px; padding: 18px; }
    .referral-kpi-val { font-size: 26px; font-weight: 900; color: #fff; margin: 0 0 4px; }
    .referral-kpi-val.gold { color: #d6b56d; }
    .referral-kpi-label { font-size: 12px; color: #6e6660; }

    .referral-table-section { background: #11100f; border: 1px solid rgba(255,255,255,.07); border-radius: 16px; overflow: hidden; }
    .referral-table-title { padding: 20px 24px 14px; font-size: 13px; font-weight: 700; color: #d9d2c6; border-bottom: 1px solid rgba(255,255,255,.06); display: flex; align-items: center; gap: 10px; }
    .referral-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .referral-table th { padding: 10px 18px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: .1em; color: #6e6660; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,.06); }
    .referral-table td { padding: 12px 18px; border-bottom: 1px solid rgba(255,255,255,.04); color: #d9d2c6; vertical-align: middle; }
    .referral-table tr:last-child td { border-bottom: none; }

    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: .08em; }
    .status-registered { background: rgba(59,130,246,.15); color: #93c5fd; }
    .status-converted  { background: rgba(234,179,8,.15); color: #fde047; }
    .status-rewarded   { background: rgba(34,197,94,.15); color: #86efac; }
    .status-cancelled  { background: rgba(239,68,68,.12); color: #fca5a5; }
    .status-pending    { background: rgba(156,163,175,.12); color: #9ca3af; }

    .ambassador-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 999px; background: linear-gradient(135deg, rgba(214,181,109,.2), rgba(214,181,109,.08)); border: 1px solid rgba(214,181,109,.4); color: #d6b56d; font-size: 12px; font-weight: 700; letter-spacing: .1em; margin-bottom: 20px; }

    .rewards-info-card { background: #141210; border: 1px solid rgba(255,255,255,.07); border-radius: 16px; padding: 24px; margin-bottom: 28px; }
    .rewards-info-title { font-size: 13px; font-weight: 700; color: #d9d2c6; margin: 0 0 16px; }
    .rewards-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .rewards-info-item { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,.2); border-radius: 8px; padding: 10px 14px; font-size: 13px; }
    .rewards-info-item .label { color: #9f978a; }
    .rewards-info-item .pts { color: #d6b56d; font-weight: 700; }
    @media (max-width: 600px) { .rewards-info-grid { grid-template-columns: 1fr; } }

    .empty-state { padding: 48px 24px; text-align: center; color: #6e6660; font-size: 14px; }
  </style>
</head>
<body>
<main style="background:#080706; min-height:100vh;">
  <div class="referral-page">

    <div class="referral-page-header">
      <p class="eyebrow">Passport</p>
      <h1>Einladungen & Empfehlungen</h1>
      <p>Lade neue Mitglieder ein und erhalte Passport Punkte für jede erfolgreiche Empfehlung.</p>
    </div>

    <?php if ($isAmbassador && $ambassadorProfile): ?>
      <div class="ambassador-badge">
        <?= e(hotmess_referral_role_label($ambassadorProfile['role'])) ?>
        <?php if (!empty($ambassadorProfile['city'])): ?>
          &mdash; <?= e($ambassadorProfile['city']) ?>
        <?php endif; ?>
      </div>
    <?php endif; ?>

    <!-- Wallet Card -->
    <div class="referral-wallet-card">
      <p class="referral-wallet-label">Dein persönlicher Referral-Code</p>
      <div class="referral-code-box"><?= e($stats['code']) ?></div>

      <p class="referral-wallet-label" style="margin-bottom:8px;">Einladungslink</p>
      <div class="referral-link-box" id="referralLinkBox"><?= e($referralLink) ?></div>

      <div class="referral-actions">
        <button class="btn-copy" onclick="copyCode()">Code kopieren</button>
        <button class="btn-copy" onclick="copyLink()">Link kopieren</button>
        <?php if ($stats['code_status'] === 'active'): ?>
          <a href="https://wa.me/?text=<?= urlencode('Ich lade dich zur HOTMESS Community ein: ' . $referralLink) ?>" target="_blank" rel="noopener" class="btn-copy" style="text-decoration:none;">WhatsApp teilen</a>
        <?php endif; ?>
      </div>

      <?php if ($stats['code_status'] !== 'active'): ?>
        <p style="margin-top:14px; font-size:12px; color:#ef4444;">Dein Code ist aktuell <?= $stats['code_status'] === 'paused' ? 'pausiert' : 'archiviert' ?>. Wende dich an das HOTMESS Team.</p>
      <?php endif; ?>
    </div>

    <!-- KPIs -->
    <div class="referral-kpis">
      <div class="referral-kpi">
        <div class="referral-kpi-val"><?= $stats['total'] ?></div>
        <div class="referral-kpi-label">Eingeladen</div>
      </div>
      <div class="referral-kpi">
        <div class="referral-kpi-val"><?= $stats['active'] ?></div>
        <div class="referral-kpi-label">Aktive Mitglieder</div>
      </div>
      <div class="referral-kpi">
        <div class="referral-kpi-val"><?= $stats['converted'] ?></div>
        <div class="referral-kpi-label">Conversions</div>
      </div>
      <div class="referral-kpi">
        <div class="referral-kpi-val gold"><?= number_format($stats['total_points'], 0, ',', '.') ?></div>
        <div class="referral-kpi-label">Erhaltene Punkte</div>
      </div>
    </div>

    <!-- Reward-Übersicht -->
    <div class="rewards-info-card">
      <p class="rewards-info-title">
        <?= $isAmbassador ? 'Deine Ambassador Rewards' : 'Deine Referral Rewards' ?>
      </p>
      <div class="rewards-info-grid">
        <?php
        $rewards = $isAmbassador
            ? hotmess_referral_ambassador_reward_config()
            : hotmess_referral_member_reward_config();
        foreach ($rewards as $config):
        ?>
          <div class="rewards-info-item">
            <span class="label"><?= e($config['label']) ?></span>
            <span class="pts">+<?= number_format($config['points'], 0, ',', '.') ?> Pts</span>
          </div>
        <?php endforeach; ?>
      </div>
    </div>

    <!-- Empfehlungs-Tabelle -->
    <div class="referral-table-section">
      <div class="referral-table-title">
        Meine Empfehlungen
        <span style="margin-left:auto; font-size:12px; color:#6e6660;"><?= count($referrals) ?> Einträge</span>
      </div>
      <?php if (empty($referrals)): ?>
        <div class="empty-state">
          Noch keine Empfehlungen. Teile deinen Referral-Link und gewinne neue Mitglieder.
        </div>
      <?php else: ?>
        <div style="overflow-x:auto;">
          <table class="referral-table">
            <thead>
              <tr>
                <th>Mitglied</th>
                <th>Status</th>
                <th>Conversion</th>
                <th>Punkte</th>
                <th>Datum</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($referrals as $ref): ?>
                <tr>
                  <td><?= e($ref['referred_name']) ?></td>
                  <td>
                    <span class="status-badge status-<?= e($ref['status']) ?>">
                      <?= e(hotmess_referral_status_label($ref['status'])) ?>
                    </span>
                  </td>
                  <td>
                    <?php if ($ref['first_purchase_type']): ?>
                      <span style="color:#d6b56d; font-size:12px;"><?= e(hotmess_referral_purchase_type_label($ref['first_purchase_type'])) ?></span>
                    <?php else: ?>
                      <span style="color:#4a4540;">—</span>
                    <?php endif; ?>
                  </td>
                  <td>
                    <?php if ((int)$ref['points_awarded'] > 0): ?>
                      <span style="color:#d6b56d; font-weight:700;">+<?= number_format((int)$ref['points_awarded'], 0, ',', '.') ?></span>
                    <?php else: ?>
                      <span style="color:#4a4540;">—</span>
                    <?php endif; ?>
                  </td>
                  <td style="color:#6e6660; font-size:12px;"><?= date('d.m.Y', strtotime($ref['created_at'])) ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </div>

    <div style="margin-top:28px; display:flex; gap:12px; flex-wrap:wrap;">
      <a href="/loyalty/wallet" class="button ghost" style="font-size:13px;">Passport Wallet</a>
      <a href="/account" class="button ghost" style="font-size:13px;">Zurück zum Account</a>
    </div>

  </div>
</main>

<script>
function copyCode() {
  navigator.clipboard.writeText('<?= e(addslashes($stats['code'])) ?>').then(() => {
    showCopied('Code kopiert!');
  });
}
function copyLink() {
  navigator.clipboard.writeText('<?= e(addslashes($referralLink)) ?>').then(() => {
    showCopied('Link kopiert!');
  });
}
function showCopied(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1a1510;border:1px solid rgba(214,181,109,.4);color:#d6b56d;padding:10px 22px;border-radius:999px;font-size:13px;font-weight:700;z-index:9999;';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}
</script>
</body>
</html>
