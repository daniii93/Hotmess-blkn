<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/checkin-data.php';

$user = require_login();
$role = hotmess_checkin_require_access($user);

$filters = [];
if (!hotmess_checkin_can_manage($role)) {
    // Staff sieht nur eigene Scans
    $filters['scanner_id'] = (int) $user['id'];
}
if (!empty($_GET['date'])) {
    $filters['date_from'] = $filters['date_to'] = $_GET['date'];
}
if (!empty($_GET['status'])) {
    $filters['status'] = $_GET['status'];
}
if (!empty($_GET['event'])) {
    $filters['event_id'] = $_GET['event'];
}

$history = hotmess_checkin_history($filters, 200);

render_header('Check-In Verlauf | HOTMESS');
?>
<style>
  .history-page{max-width:900px;margin:0 auto;padding:30px 18px 80px}
  .history-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px}
  .history-topbar-left{display:flex;align-items:center;gap:14px}
  .history-back{color:#9f978a;text-decoration:none;font-size:14px;font-weight:700}
  .history-back:hover{color:#f7f2ea}
  .history-page h1{font-size:22px;font-weight:900;color:#fff;margin:0}

  .history-filters{display:flex;gap:10px;margin-bottom:22px;flex-wrap:wrap}
  .history-filter-input{background:#11100f;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:9px 14px;color:#f7f2ea;font-size:13px;outline:none}
  .history-filter-input:focus{border-color:rgba(214,181,109,.4)}
  .history-filter-btn{padding:9px 18px;border-radius:10px;background:#d6b56d;color:#11100f;font-size:13px;font-weight:800;border:none;cursor:pointer}

  .history-count{font-size:13px;color:#9f978a;margin-bottom:14px}

  .history-table-wrap{overflow-x:auto}
  .history-table{width:100%;border-collapse:collapse}
  .history-table th{font-size:11px;font-weight:800;letter-spacing:.1em;color:#6e6660;text-transform:uppercase;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left;white-space:nowrap}
  .history-table td{padding:12px 12px;border-bottom:1px solid rgba(255,255,255,.04);font-size:13px;color:#d9d2c6;vertical-align:middle}
  .history-table tr:hover td{background:rgba(255,255,255,.02)}
  .member-cell{display:flex;align-items:center;gap:9px}
  .member-cell-avatar{width:32px;height:32px;border-radius:50%;object-fit:cover;background:#222;flex-shrink:0}
  .member-cell-ph{width:32px;height:32px;border-radius:50%;flex-shrink:0;background:rgba(214,181,109,.1);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;color:#d6b56d}
  .member-cell-name{font-weight:700;color:#fff}
  .pill{padding:2px 8px;border-radius:999px;font-size:11px;font-weight:800}
  .pill-s{background:rgba(74,222,128,.1);color:#4ade80}
  .pill-d{background:rgba(251,191,36,.1);color:#fbbf24}
  .pill-c,.pill-i{background:rgba(248,113,113,.1);color:#f87171}

  .empty-state{text-align:center;padding:50px 20px;color:#6e6660}
</style>

<main>
  <div class="history-page">
    <div class="history-topbar">
      <div class="history-topbar-left">
        <a href="/checkin" class="history-back">← Zurück</a>
        <h1>Check-In Verlauf</h1>
      </div>
    </div>

    <form method="get" action="/checkin/history">
      <div class="history-filters">
        <input type="date" name="date" class="history-filter-input"
               value="<?= e($_GET['date'] ?? date('Y-m-d')) ?>"
               max="<?= date('Y-m-d') ?>">
        <select name="status" class="history-filter-input">
          <option value="">Alle Status</option>
          <option value="success" <?= ($_GET['status'] ?? '') === 'success' ? 'selected' : '' ?>>Erfolg</option>
          <option value="duplicate" <?= ($_GET['status'] ?? '') === 'duplicate' ? 'selected' : '' ?>>Doppelscan</option>
          <option value="cancelled" <?= ($_GET['status'] ?? '') === 'cancelled' ? 'selected' : '' ?>>Storniert</option>
          <option value="invalid" <?= ($_GET['status'] ?? '') === 'invalid' ? 'selected' : '' ?>>Ungültig</option>
        </select>
        <button type="submit" class="history-filter-btn">Filtern</button>
      </div>
    </form>

    <p class="history-count"><?= count($history) ?> Einträge</p>

    <?php if (empty($history)): ?>
      <div class="empty-state">
        <h3>Keine Check-Ins</h3>
        <p>Für diesen Zeitraum wurden keine Check-Ins gefunden.</p>
      </div>
    <?php else: ?>
      <div class="history-table-wrap">
        <table class="history-table">
          <thead>
            <tr>
              <th>Mitglied</th>
              <th>Event</th>
              <th>Ticket-Typ</th>
              <th>Scanner</th>
              <th>Standort</th>
              <th>Zeit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($history as $row): ?>
              <?php
                $initial = mb_strtoupper(mb_substr((string) $row['member_name'], 0, 1));
                $pillClass = match ((string) $row['status']) {
                    'success'   => 'pill-s',
                    'duplicate' => 'pill-d',
                    'cancelled' => 'pill-c',
                    default     => 'pill-i',
                };
                $statusLabel = match ((string) $row['status']) {
                    'success'   => '✓ OK',
                    'duplicate' => '⚠ Doppel',
                    'cancelled' => '✕ Storniert',
                    default     => '✕ Ungültig',
                };
              ?>
              <tr>
                <td>
                  <div class="member-cell">
                    <?php if ($row['profile_photo']): ?>
                      <img src="<?= e((string) $row['profile_photo']) ?>" class="member-cell-avatar" alt="">
                    <?php else: ?>
                      <div class="member-cell-ph"><?= e($initial) ?></div>
                    <?php endif; ?>
                    <div>
                      <div class="member-cell-name"><?= e((string) $row['member_name']) ?></div>
                      <div style="font-size:11px;color:#6e6660"><?= e((string) $row['member_email']) ?></div>
                    </div>
                  </div>
                </td>
                <td><?= e((string) $row['event_name']) ?></td>
                <td><?= e((string) ($row['ticket_type'] ?? 'Standard')) ?></td>
                <td><?= e((string) $row['scanner_name']) ?></td>
                <td><?= e((string) $row['checkin_location']) ?></td>
                <td style="white-space:nowrap;color:#9f978a"><?= e(substr((string) $row['checked_in_at'], 0, 16)) ?></td>
                <td><span class="pill <?= $pillClass ?>"><?= $statusLabel ?></span></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php endif; ?>
  </div>
</main>

<?php render_footer(); ?>
