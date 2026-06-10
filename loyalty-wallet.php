<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/loyalty-data.php';
require_once __DIR__ . '/app/referral-data.php';

$user = require_approved_member_or_admin();
$userId = (int) $user['id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string) ($_POST['action'] ?? '');

    try {
        if ($action === 'redeem_reward') {
            $rewardId = (int) ($_POST['reward_id'] ?? 0);
            $result = hotmess_loyalty_redeem_reward($userId, $rewardId);
            flash('Reward eingelöst! Dein Code: ' . $result['code'] . ' — Das HOTMESS Team bestätigt ihn in Kürze.');
        }
    } catch (Throwable $ex) {
        flash('Fehler: ' . $ex->getMessage());
    }

    redirect('/loyalty-wallet');
}

$account = hotmess_loyalty_account($userId);
$transactions = hotmess_loyalty_transactions($userId, 30);
$rewards = hotmess_loyalty_rewards((string) $account['loyalty_tier']);
$redemptions = hotmess_loyalty_user_redemptions($userId);
$progress = hotmess_loyalty_next_tier_progress($account);
$tiers = hotmess_loyalty_tiers();
$currentTier = $tiers[$account['loyalty_tier']] ?? $tiers['bronze'];
$earnRules = hotmess_loyalty_earn_rules();

render_header('Passport Wallet | HOTMESS BLKN');
?>

<main class="account-page loyalty-wallet-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Dein Passport</p>
    <h1>HOTMESS Passport Wallet</h1>
    <p>Punkte sammeln, Status steigern, exklusive Rewards einlösen.</p>
  </section>

  <?php $flash = get_flash(); if ($flash): ?>
    <div class="flash-message"><?= e($flash) ?></div>
  <?php endif; ?>

  <section class="platform-section">
    <div class="loyalty-hero-card" style="border-left: 4px solid <?= e($currentTier['color']) ?>">
      <div class="loyalty-tier-badge" style="color:<?= e($currentTier['color']) ?>">
        <?= e($currentTier['label']) ?> Status
      </div>
      <div class="loyalty-balance">
        <strong><?= e(hotmess_loyalty_format_points((int) $account['points_balance'])) ?></strong>
        <span>Aktuelles Guthaben</span>
      </div>
      <div class="loyalty-lifetime">
        <span>Lifetime: <?= e(hotmess_loyalty_format_points((int) $account['points_lifetime'])) ?></span>
      </div>

      <?php if ($progress['next']): ?>
        <div class="loyalty-progress-wrap">
          <div class="loyalty-progress-label">
            Nächster Status: <strong><?= e($progress['label']) ?></strong>
            — noch <?= e(hotmess_loyalty_format_points($progress['needed'])) ?>
          </div>
          <div class="loyalty-progress-bar">
            <div class="loyalty-progress-fill" style="width:<?= e((string) $progress['percent']) ?>%"></div>
          </div>
        </div>
      <?php else: ?>
        <p class="loyalty-max-tier">Du hast den höchsten HOTMESS Status erreicht.</p>
      <?php endif; ?>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Deine Vorteile</p>
      <h2>Was dein Status dir bringt.</h2>
    </div>
    <div class="admin-kpi-grid">
      <?php foreach ($currentTier['benefits'] as $benefit): ?>
        <article><span>Aktiv</span><strong><?= e($benefit) ?></strong></article>
      <?php endforeach; ?>
    </div>
  </section>

  <?php if ($rewards): ?>
  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Rewards</p>
      <h2>Punkte einlösen.</h2>
      <p>Für deinen Status freigeschaltete Rewards.</p>
    </div>
    <div class="event-admin-grid">
      <?php foreach ($rewards as $reward): ?>
        <article class="premium-card">
          <span><?= e(ucfirst((string) $reward['required_tier'])) ?> Status erforderlich</span>
          <h3><?= e((string) $reward['title']) ?></h3>
          <?php if ($reward['description']): ?>
            <p><?= e((string) $reward['description']) ?></p>
          <?php endif; ?>
          <?php if ($reward['partner_name']): ?>
            <p><strong>Partner: <?= e((string) $reward['partner_name']) ?></strong></p>
          <?php endif; ?>
          <?php if ((int) $reward['points_cost'] > 0): ?>
            <p><?= e(hotmess_loyalty_format_points((int) $reward['points_cost'])) ?> erforderlich</p>
          <?php else: ?>
            <p>Kostenlos für deinen Status</p>
          <?php endif; ?>
          <?php if ($reward['stock'] !== null): ?>
            <p><?= e((string) $reward['stock']) ?> verfügbar</p>
          <?php endif; ?>
          <form method="post">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
            <input type="hidden" name="action" value="redeem_reward" />
            <input type="hidden" name="reward_id" value="<?= e((string) $reward['id']) ?>" />
            <button class="button primary" type="submit">Einlösen</button>
          </form>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
  <?php endif; ?>

  <?php if ($redemptions): ?>
  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Einlösungen</p>
      <h2>Deine eingelösten Rewards.</h2>
    </div>
    <div class="table-wrap">
      <table class="admin-lux-table">
        <thead>
          <tr><th>Reward</th><th>Code</th><th>Status</th><th>Datum</th></tr>
        </thead>
        <tbody>
          <?php foreach ($redemptions as $r): ?>
            <tr>
              <td><strong><?= e((string) $r['title']) ?></strong></td>
              <td><code><?= e((string) $r['code']) ?></code></td>
              <td><span class="status-pill"><?= e((string) $r['status']) ?></span></td>
              <td><?= e((string) $r['created_at']) ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </section>
  <?php endif; ?>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Punkte sammeln</p>
      <h2>So sammelst du Punkte.</h2>
    </div>
    <div class="admin-kpi-grid">
      <?php foreach ($earnRules as $rule): ?>
        <article>
          <span><?= e($rule['label']) ?></span>
          <strong><?= e($rule['description']) ?></strong>
          <?php if ((string) $account['loyalty_tier'] !== 'bronze'): ?>
            <p>× <?= e(number_format(hotmess_loyalty_tier_multiplier((string) $account['loyalty_tier']), 1)) ?> Multiplikator aktiv</p>
          <?php endif; ?>
        </article>
      <?php endforeach; ?>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Verlauf</p>
      <h2>Deine letzten Transaktionen.</h2>
    </div>
    <div class="table-wrap">
      <table class="admin-lux-table">
        <thead>
          <tr><th>Aktion</th><th>Punkte</th><th>Guthaben danach</th><th>Quelle</th><th>Datum</th></tr>
        </thead>
        <tbody>
          <?php foreach ($transactions as $tx): ?>
            <tr>
              <td><?= e((string) $tx['description']) ?></td>
              <td style="color:<?= (int) $tx['points'] >= 0 ? '#4ade80' : '#f87171' ?>">
                <?= (int) $tx['points'] >= 0 ? '+' : '' ?><?= e(number_format((int) $tx['points'], 0, ',', '.')) ?>
              </td>
              <td><?= e(number_format((int) $tx['balance_after'], 0, ',', '.')) ?></td>
              <td><?= e((string) $tx['source']) ?></td>
              <td><?= e((string) $tx['created_at']) ?></td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$transactions): ?>
            <tr><td colspan="5"><strong>Noch keine Transaktionen.</strong> Kauf dein erstes Ticket um Punkte zu sammeln.</td></tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </section>

  <?php
    $referralStats = hotmess_referral_stats_for_user($userId);
    $siteUrl = rtrim((string) (getenv('SITE_URL') ?: (defined('APP_URL') ? APP_URL : 'https://hotmess-blkn.com')), '/');
    $referralLink = $siteUrl . '/referral?ref=' . urlencode($referralStats['code']);
    $recentReferrals = hotmess_referral_list_for_user($userId, 5);
  ?>
  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Einladungen &amp; Empfehlungen</p>
      <h2>Freunde einladen. Punkte sammeln.</h2>
    </div>
    <div style="background:#141210;border:1px solid rgba(214,181,109,.2);border-radius:16px;padding:24px;margin-bottom:16px;">
      <p style="font-size:11px;font-weight:700;letter-spacing:.18em;color:#d6b56d;text-transform:uppercase;margin:0 0 8px;">Dein Referral-Code</p>
      <p style="font-size:20px;font-weight:900;letter-spacing:.15em;color:#f2d28f;font-family:monospace;margin:0 0 14px;"><?= e($referralStats['code']) ?></p>
      <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:16px;">
        <a href="/account/referrals" class="button primary" style="font-size:13px;padding:9px 18px;">Alle Einladungen ansehen</a>
        <button onclick="navigator.clipboard.writeText('<?= e(addslashes($referralLink)) ?>').then(()=>alert('Link kopiert!'))" style="padding:9px 18px;border-radius:999px;background:rgba(214,181,109,.12);border:1px solid rgba(214,181,109,.3);color:#d6b56d;font-size:13px;font-weight:700;cursor:pointer;">Link kopieren</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:12px;">
        <div style="background:rgba(0,0,0,.3);border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:22px;font-weight:900;color:#fff;"><?= $referralStats['total'] ?></div>
          <div style="font-size:11px;color:#6e6660;">Eingeladen</div>
        </div>
        <div style="background:rgba(0,0,0,.3);border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:22px;font-weight:900;color:#fff;"><?= $referralStats['converted'] ?></div>
          <div style="font-size:11px;color:#6e6660;">Conversions</div>
        </div>
        <div style="background:rgba(0,0,0,.3);border-radius:10px;padding:12px;text-align:center;">
          <div style="font-size:22px;font-weight:900;color:#d6b56d;"><?= number_format($referralStats['total_points'], 0, ',', '.') ?></div>
          <div style="font-size:11px;color:#6e6660;">Referral Punkte</div>
        </div>
      </div>
      <?php if (!empty($recentReferrals)): ?>
        <div style="margin-top:16px;border-top:1px solid rgba(255,255,255,.06);padding-top:14px;">
          <p style="font-size:11px;font-weight:700;letter-spacing:.12em;color:#6e6660;text-transform:uppercase;margin:0 0 10px;">Letzte Empfehlungen</p>
          <?php foreach ($recentReferrals as $r): ?>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:13px;">
              <span style="color:#d9d2c6;"><?= e($r['referred_name']) ?></span>
              <span style="padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;background:rgba(214,181,109,.1);color:#d6b56d;"><?= e(hotmess_referral_status_label($r['status'])) ?></span>
            </div>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Status-Übersicht</p>
      <h2>Alle Stufen im Überblick.</h2>
    </div>
    <div class="event-admin-grid">
      <?php foreach (hotmess_loyalty_tiers() as $key => $tier): ?>
        <article class="premium-card <?= $account['loyalty_tier'] === $key ? 'is-active' : '' ?>" style="border-left: 3px solid <?= e($tier['color']) ?>">
          <span style="color:<?= e($tier['color']) ?>"><?= e($tier['label']) ?></span>
          <h3>
            <?php if ($key === 'black'): ?>
              <?= e(hotmess_loyalty_format_points($tier['min_points'])) ?>+
            <?php else: ?>
              <?= e(hotmess_loyalty_format_points($tier['min_points'])) ?> – <?= e(hotmess_loyalty_format_points($tier['max_points'])) ?>
            <?php endif; ?>
          </h3>
          <ul class="luxury-list">
            <?php foreach ($tier['benefits'] as $b): ?>
              <li><?= e($b) ?></li>
            <?php endforeach; ?>
          </ul>
          <?php if ($account['loyalty_tier'] === $key): ?>
            <strong>Dein aktueller Status</strong>
          <?php endif; ?>
        </article>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<?php render_footer(); ?>
