<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/loyalty-data.php';

$admin = require_admin();
$tab = (string) ($_GET['tab'] ?? 'overview');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string) ($_POST['action'] ?? '');

    try {
        if ($action === 'adjust_points') {
            $userId = (int) ($_POST['user_id'] ?? 0);
            $points = abs((int) ($_POST['points'] ?? 0));
            $type = ($_POST['type'] ?? '') === 'admin_remove' ? 'admin_remove' : 'admin_add';
            $desc = trim((string) ($_POST['description'] ?? 'Admin-Anpassung'));
            if ($userId <= 0 || $points <= 0) {
                throw new RuntimeException('Ungültige Eingabe.');
            }
            hotmess_loyalty_admin_adjust($userId, $points, $type, $desc, (int) $admin['id']);
            flash('Punkte wurden angepasst.');
            redirect('/admin/loyalty?tab=members');
        }

        if ($action === 'save_reward') {
            hotmess_loyalty_save_reward($_POST, (int) $admin['id']);
            flash('Reward gespeichert.');
            redirect('/admin/loyalty?tab=rewards');
        }

        if ($action === 'confirm_redemption') {
            $redemptionId = (int) ($_POST['redemption_id'] ?? 0);
            hotmess_loyalty_confirm_redemption($redemptionId, (int) $admin['id']);
            flash('Einlösung bestätigt.');
            redirect('/admin/loyalty?tab=redemptions');
        }

        if ($action === 'run_expiry') {
            $count = hotmess_loyalty_expire_inactive();
            flash($count . ' Konten wurden wegen Inaktivität zurückgesetzt.');
            redirect('/admin/loyalty?tab=overview');
        }

    } catch (Throwable $ex) {
        flash('Fehler: ' . $ex->getMessage());
        redirect('/admin/loyalty?tab=' . $tab);
    }
}

$stats = hotmess_loyalty_stats();
$tiers = hotmess_loyalty_tiers();
$earnRules = hotmess_loyalty_earn_rules();
$revenueByTier = hotmess_loyalty_revenue_by_tier();
$topEarners = hotmess_loyalty_top_earners(10);

if ($tab === 'members') {
    $tierFilter = (string) ($_GET['tier'] ?? '');
    $search = trim((string) ($_GET['search'] ?? ''));
    $members = hotmess_loyalty_admin_accounts(['tier' => $tierFilter, 'search' => $search], 100);
}

if ($tab === 'rewards') {
    $allRewards = hotmess_loyalty_all_rewards();
    $editReward = null;
    if (isset($_GET['edit'])) {
        $stmt = db()->prepare('SELECT * FROM loyalty_rewards WHERE id = ? LIMIT 1');
        $stmt->execute([(int) $_GET['edit']]);
        $editReward = $stmt->fetch() ?: null;
    }
}

if ($tab === 'redemptions') {
    $stmt = db()->query(
        'SELECT lr.*, u.name, u.email, rew.title AS reward_title
         FROM loyalty_redemptions lr
         JOIN users u ON u.id = lr.user_id
         JOIN loyalty_rewards rew ON rew.id = lr.reward_id
         ORDER BY lr.created_at DESC LIMIT 100'
    );
    $redemptions = $stmt->fetchAll();
}

render_header('Admin Loyalty | HOTMESS BLKN');
?>

<main class="admin-page enterprise-admin-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Admin / Loyalty</p>
    <h1>HOTMESS Passport Loyalty Engine</h1>
    <p>Punktekonten, Status, Rewards, Einlösungen und Umsatzanalyse.</p>
    <div class="admin-tab-nav">
      <a href="/admin/loyalty?tab=overview" <?= $tab === 'overview' ? 'class="is-active"' : '' ?>>Übersicht</a>
      <a href="/admin/loyalty?tab=members" <?= $tab === 'members' ? 'class="is-active"' : '' ?>>Mitglieder</a>
      <a href="/admin/loyalty?tab=rewards" <?= $tab === 'rewards' ? 'class="is-active"' : '' ?>>Rewards</a>
      <a href="/admin/loyalty?tab=redemptions" <?= $tab === 'redemptions' ? 'class="is-active"' : '' ?>>Einlösungen</a>
      <a href="/admin/loyalty?tab=analytics" <?= $tab === 'analytics' ? 'class="is-active"' : '' ?>>Analyse</a>
    </div>
  </section>

  <?php $flash = get_flash(); if ($flash): ?>
    <div class="flash-message"><?= e($flash) ?></div>
  <?php endif; ?>

  <?php if ($tab === 'overview'): ?>

    <section class="platform-section">
      <div class="admin-kpi-grid">
        <article><span>Accounts</span><strong><?= e((string) $stats['accounts']) ?></strong><p>Aktive Loyalty-Konten</p></article>
        <article><span>Punkte im Umlauf</span><strong><?= e(number_format($stats['total_balance'], 0, ',', '.')) ?></strong><p>Gesamtes Guthaben aller Mitglieder</p></article>
        <article><span>Lifetime Punkte</span><strong><?= e(number_format($stats['total_lifetime'], 0, ',', '.')) ?></strong><p>Alle jemals vergebenen Punkte</p></article>
        <article><span>Offene Einlösungen</span><strong><?= e((string) $stats['pending_redemptions']) ?></strong><p>Warten auf Bestätigung</p></article>
      </div>
    </section>

    <section class="platform-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Status-Verteilung</p>
        <h2>Mitglieder nach Stufe.</h2>
      </div>
      <div class="admin-kpi-grid">
        <?php foreach (['black' => 'Black', 'gold' => 'Gold', 'silver' => 'Silver', 'bronze' => 'Bronze'] as $key => $label): ?>
          <article style="border-left: 3px solid <?= e($tiers[$key]['color']) ?>">
            <span style="color:<?= e($tiers[$key]['color']) ?>"><?= e($label) ?></span>
            <strong><?= e((string) $stats[$key . '_count']) ?></strong>
            <p>Mitglieder</p>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <section class="platform-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Punkteverfall</p>
        <h2>Inaktive Konten zurücksetzen.</h2>
        <p>Punkte verfallen nach 12 Monaten Inaktivität. Diese Aktion setzt alle betroffenen Konten zurück.</p>
      </div>
      <form method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <input type="hidden" name="action" value="run_expiry" />
        <button class="button ghost" type="submit" onclick="return confirm('Inaktive Punkte verfallen lassen?')">
          Verfallene Punkte jetzt abbuchen
        </button>
      </form>
    </section>

  <?php elseif ($tab === 'members'): ?>

    <section class="platform-section">
      <form class="gallery-filter inquiry-admin-filter" method="get">
        <input type="hidden" name="tab" value="members" />
        <label>Status
          <select name="tier">
            <option value="">Alle</option>
            <?php foreach ($tiers as $key => $tier): ?>
              <option value="<?= e($key) ?>" <?= ($tierFilter ?? '') === $key ? 'selected' : '' ?>><?= e($tier['label']) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>Suche<input name="search" value="<?= e($search ?? '') ?>" placeholder="Name oder E-Mail" /></label>
        <button class="button ghost" type="submit">Filtern</button>
      </form>
    </section>

    <section class="platform-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Punkte anpassen</p>
        <h2>Manuell vergeben oder abziehen.</h2>
      </div>
      <form class="gallery-filter inquiry-admin-filter" method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <input type="hidden" name="action" value="adjust_points" />
        <label>User-ID<input type="number" name="user_id" required placeholder="User ID" /></label>
        <label>Punkte<input type="number" name="points" min="1" required placeholder="Anzahl" /></label>
        <label>Aktion
          <select name="type">
            <option value="admin_add">Vergeben</option>
            <option value="admin_remove">Abziehen</option>
          </select>
        </label>
        <label>Begründung<input name="description" placeholder="z.B. Ambassador Bonus März" /></label>
        <button class="button primary" type="submit">Anpassen</button>
      </form>
    </section>

    <section class="platform-section">
      <div class="table-wrap">
        <table class="admin-lux-table">
          <thead>
            <tr><th>Mitglied</th><th>Status</th><th>Guthaben</th><th>Lifetime</th><th>Letzte Aktivität</th><th>Wallet</th></tr>
          </thead>
          <tbody>
            <?php foreach ($members as $m): ?>
              <tr>
                <td>
                  <strong><?= e((string) $m['name']) ?></strong>
                  <span><?= e((string) $m['email']) ?></span>
                </td>
                <td>
                  <span class="status-pill" style="color:<?= e($tiers[$m['loyalty_tier']]['color'] ?? '#fff') ?>">
                    <?= e(ucfirst((string) $m['loyalty_tier'])) ?>
                  </span>
                </td>
                <td><?= e(number_format((int) $m['points_balance'], 0, ',', '.')) ?></td>
                <td><?= e(number_format((int) $m['points_lifetime'], 0, ',', '.')) ?></td>
                <td><?= e((string) $m['last_activity_at']) ?></td>
                <td><a class="button ghost" href="/loyalty-wallet">Wallet</a></td>
              </tr>
            <?php endforeach; ?>
            <?php if (empty($members)): ?>
              <tr><td colspan="6"><strong>Keine Mitglieder gefunden.</strong></td></tr>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </section>

  <?php elseif ($tab === 'rewards'): ?>

    <section class="platform-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Reward <?= isset($editReward) ? 'bearbeiten' : 'erstellen' ?></p>
        <h2><?= isset($editReward) ? 'Reward anpassen.' : 'Neuen Reward anlegen.' ?></h2>
      </div>
      <form class="gallery-filter inquiry-admin-filter" method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <input type="hidden" name="action" value="save_reward" />
        <?php if (isset($editReward)): ?>
          <input type="hidden" name="id" value="<?= e((string) $editReward['id']) ?>" />
        <?php endif; ?>
        <label>Titel<input name="title" required value="<?= e((string) ($editReward['title'] ?? '')) ?>" /></label>
        <label>Beschreibung<input name="description" value="<?= e((string) ($editReward['description'] ?? '')) ?>" /></label>
        <label>Erforderlicher Status
          <select name="required_tier">
            <?php foreach ($tiers as $key => $tier): ?>
              <option value="<?= e($key) ?>" <?= ($editReward['required_tier'] ?? 'gold') === $key ? 'selected' : '' ?>><?= e($tier['label']) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>Typ
          <select name="reward_type">
            <?php foreach (['access' => 'Zugang', 'discount' => 'Rabatt', 'upgrade' => 'Upgrade', 'benefit' => 'Benefit', 'partner' => 'Partner Reward'] as $val => $label): ?>
              <option value="<?= e($val) ?>" <?= ($editReward['reward_type'] ?? 'benefit') === $val ? 'selected' : '' ?>><?= e($label) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>Partner Name (optional)<input name="partner_name" value="<?= e((string) ($editReward['partner_name'] ?? '')) ?>" /></label>
        <label>Punkte-Kosten (0 = kostenlos für Status)<input type="number" name="points_cost" min="0" value="<?= e((string) ($editReward['points_cost'] ?? 0)) ?>" /></label>
        <label>Verfügbarkeit (leer = unbegrenzt)<input type="number" name="stock" min="0" value="<?= e((string) ($editReward['stock'] ?? '')) ?>" /></label>
        <label>Reihenfolge<input type="number" name="sort_order" min="0" value="<?= e((string) ($editReward['sort_order'] ?? 0)) ?>" /></label>
        <label class="check-row"><input type="checkbox" name="active" value="1" <?= !isset($editReward) || $editReward['active'] ? 'checked' : '' ?> /> Aktiv</label>
        <button class="button primary" type="submit">Speichern</button>
        <?php if (isset($editReward)): ?>
          <a class="button ghost" href="/admin/loyalty?tab=rewards">Abbrechen</a>
        <?php endif; ?>
      </form>
    </section>

    <section class="platform-section">
      <div class="table-wrap">
        <table class="admin-lux-table">
          <thead>
            <tr><th>Reward</th><th>Status erforderlich</th><th>Typ</th><th>Punkte</th><th>Verfügbar</th><th>Aktiv</th><th></th></tr>
          </thead>
          <tbody>
            <?php foreach ($allRewards as $r): ?>
              <tr>
                <td><strong><?= e((string) $r['title']) ?></strong><?php if ($r['partner_name']): ?><span><?= e((string) $r['partner_name']) ?></span><?php endif; ?></td>
                <td><?= e(ucfirst((string) $r['required_tier'])) ?></td>
                <td><?= e((string) $r['reward_type']) ?></td>
                <td><?= (int) $r['points_cost'] > 0 ? e(number_format((int) $r['points_cost'], 0, ',', '.')) : 'kostenlos' ?></td>
                <td><?= $r['stock'] !== null ? e((string) $r['stock']) : '∞' ?></td>
                <td><?= $r['active'] ? '✓' : '–' ?></td>
                <td><a class="button ghost" href="/admin/loyalty?tab=rewards&edit=<?= e((string) $r['id']) ?>">Bearbeiten</a></td>
              </tr>
            <?php endforeach; ?>
            <?php if (empty($allRewards)): ?>
              <tr><td colspan="7"><strong>Noch keine Rewards angelegt.</strong></td></tr>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </section>

  <?php elseif ($tab === 'redemptions'): ?>

    <section class="platform-section">
      <div class="table-wrap">
        <table class="admin-lux-table">
          <thead>
            <tr><th>Mitglied</th><th>Reward</th><th>Code</th><th>Status</th><th>Datum</th><th>Aktion</th></tr>
          </thead>
          <tbody>
            <?php foreach ($redemptions as $r): ?>
              <tr>
                <td><strong><?= e((string) $r['name']) ?></strong><span><?= e((string) $r['email']) ?></span></td>
                <td><?= e((string) $r['reward_title']) ?></td>
                <td><code><?= e((string) $r['code']) ?></code></td>
                <td><span class="status-pill"><?= e((string) $r['status']) ?></span></td>
                <td><?= e((string) $r['created_at']) ?></td>
                <td>
                  <?php if ($r['status'] === 'pending'): ?>
                    <form method="post" class="inline-admin-actions">
                      <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                      <input type="hidden" name="action" value="confirm_redemption" />
                      <input type="hidden" name="redemption_id" value="<?= e((string) $r['id']) ?>" />
                      <button class="button ghost" type="submit">Bestätigen</button>
                    </form>
                  <?php endif; ?>
                </td>
              </tr>
            <?php endforeach; ?>
            <?php if (empty($redemptions)): ?>
              <tr><td colspan="6"><strong>Noch keine Einlösungen.</strong></td></tr>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </section>

  <?php elseif ($tab === 'analytics'): ?>

    <section class="platform-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Analyse</p>
        <h2>Umsatz und Engagement pro Loyalty-Stufe.</h2>
      </div>
      <div class="table-wrap">
        <table class="admin-lux-table">
          <thead>
            <tr><th>Stufe</th><th>Mitglieder</th><th>Lifetime Punkte gesamt</th><th>Ø Guthaben</th><th>Max Guthaben</th></tr>
          </thead>
          <tbody>
            <?php foreach ($revenueByTier as $row): ?>
              <tr>
                <td>
                  <span class="status-pill" style="color:<?= e($tiers[$row['loyalty_tier']]['color'] ?? '#fff') ?>">
                    <?= e(ucfirst((string) $row['loyalty_tier'])) ?>
                  </span>
                </td>
                <td><?= e((string) $row['member_count']) ?></td>
                <td><?= e(number_format((int) $row['total_lifetime_points'], 0, ',', '.')) ?></td>
                <td><?= e(number_format((float) $row['avg_balance'], 0, ',', '.')) ?></td>
                <td><?= e(number_format((int) $row['max_balance'], 0, ',', '.')) ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>

    <section class="platform-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Top Earner</p>
        <h2>Die 10 aktivsten Mitglieder.</h2>
      </div>
      <div class="table-wrap">
        <table class="admin-lux-table">
          <thead>
            <tr><th>Mitglied</th><th>Status</th><th>Guthaben</th><th>Lifetime</th><th>Letzte Aktivität</th></tr>
          </thead>
          <tbody>
            <?php foreach ($topEarners as $m): ?>
              <tr>
                <td><strong><?= e((string) $m['name']) ?></strong><span><?= e((string) $m['email']) ?></span></td>
                <td><span class="status-pill"><?= e(ucfirst((string) $m['loyalty_tier'])) ?></span></td>
                <td><?= e(number_format((int) $m['points_balance'], 0, ',', '.')) ?></td>
                <td><?= e(number_format((int) $m['points_lifetime'], 0, ',', '.')) ?></td>
                <td><?= e((string) $m['last_activity_at']) ?></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>

    <section class="platform-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Punkte-Quellen</p>
        <h2>Aktive Earn-Regeln.</h2>
      </div>
      <div class="admin-kpi-grid">
        <?php foreach ($earnRules as $key => $rule): ?>
          <article>
            <span><?= e($key) ?></span>
            <strong><?= e($rule['label']) ?></strong>
            <p><?= e($rule['description']) ?></p>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

  <?php endif; ?>
</main>

<?php render_footer(); ?>
