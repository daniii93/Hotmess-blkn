<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/checkin-data.php';

$user = require_admin();
$tab = (string) ($_GET['tab'] ?? 'overview');

// POST-Aktionen
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string) ($_POST['action'] ?? '');

    try {
        if ($action === 'save_settings') {
            hotmess_checkin_settings_save($_POST, (int) $user['id']);
            flash('Einstellungen gespeichert.');
        } elseif ($action === 'add_staff') {
            $staffUserId = (int) ($_POST['staff_user_id'] ?? 0);
            $staffRole   = (string) ($_POST['staff_role'] ?? 'checkin_staff');
            if ($staffUserId > 0) {
                hotmess_checkin_staff_save($staffUserId, $staffRole, (int) $user['id']);
                flash('Staff-Mitglied hinzugefügt.');
            }
        } elseif ($action === 'deactivate_staff') {
            $staffUserId = (int) ($_POST['staff_user_id'] ?? 0);
            hotmess_checkin_staff_deactivate($staffUserId);
            flash('Staff-Zugang deaktiviert.');
        } elseif ($action === 'reset_ticket') {
            $ticketId = (int) ($_POST['ticket_id'] ?? 0);
            $note     = (string) ($_POST['note'] ?? '');
            if ($ticketId > 0) {
                hotmess_checkin_reset($ticketId, (int) $user['id'], $note);
                flash('Ticket zurückgesetzt.');
            }
        }
    } catch (Throwable $ex) {
        flash('Fehler: ' . $ex->getMessage());
    }

    redirect('/admin/checkin?tab=' . urlencode($tab));
}

$stats    = hotmess_checkin_admin_stats();
$settings = hotmess_checkin_settings();
$staffList = hotmess_checkin_staff_list();

// History für Admin-Tab
$historyFilters = [];
if (!empty($_GET['date'])) {
    $historyFilters['date_from'] = $historyFilters['date_to'] = $_GET['date'];
} else {
    $historyFilters['date_from'] = $historyFilters['date_to'] = date('Y-m-d');
}
$history = hotmess_checkin_history($historyFilters, 300);

// Alle Member für Staff-Auswahl
$allMembers = db()->query(
    "SELECT id, name, email FROM users WHERE status = 'active' AND role IN ('member','admin') ORDER BY name ASC LIMIT 500"
)->fetchAll();

render_header('Admin Check-In | HOTMESS');
?>
<style>
  .admin-checkin-page{max-width:1000px;margin:0 auto;padding:36px 20px 80px}
  .admin-checkin-hero{margin-bottom:32px}
  .admin-checkin-hero .eyebrow{font-size:11px;font-weight:800;letter-spacing:.22em;color:#d6b56d;text-transform:uppercase;margin:0 0 8px}
  .admin-checkin-hero h1{font-size:28px;font-weight:900;color:#fff;margin:0}

  .kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;margin-bottom:32px}
  .kpi-card{background:#11100f;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:18px 16px;text-align:center}
  .kpi-value{font-size:28px;font-weight:900;color:#fff;margin:0 0 4px}
  .kpi-value.gold{color:#d6b56d}
  .kpi-label{font-size:11px;color:#6e6660;letter-spacing:.08em;text-transform:uppercase;font-weight:700}

  .tab-nav{display:flex;gap:4px;background:#11100f;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:5px;margin-bottom:28px;overflow-x:auto}
  .tab-btn{padding:9px 18px;border-radius:10px;font-size:13px;font-weight:700;color:#9f978a;text-decoration:none;white-space:nowrap;transition:all .2s;border:none;background:transparent;cursor:pointer}
  .tab-btn.active{background:rgba(214,181,109,.15);color:#d6b56d}
  .tab-btn:hover:not(.active){color:#f7f2ea}

  .settings-form .settings-group{background:#11100f;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:22px;margin-bottom:16px}
  .settings-group h3{font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9f978a;margin:0 0 18px}
  .setting-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,.04)}
  .setting-row:last-of-type{border-bottom:none}
  .setting-label{font-size:14px;color:#d9d2c6;font-weight:600}
  .setting-sub{font-size:12px;color:#6e6660;margin-top:2px}
  .toggle-switch{position:relative;width:44px;height:24px;flex-shrink:0}
  .toggle-switch input{opacity:0;width:0;height:0}
  .toggle-slider{position:absolute;cursor:pointer;inset:0;background:rgba(255,255,255,.1);border-radius:999px;transition:.3s}
  .toggle-slider:before{content:'';position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.3s}
  .toggle-switch input:checked + .toggle-slider{background:#d6b56d}
  .toggle-switch input:checked + .toggle-slider:before{transform:translateX(20px)}
  .text-input{background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;color:#f7f2ea;font-size:14px;outline:none;width:120px}
  .text-input:focus{border-color:rgba(214,181,109,.5)}

  .staff-list-item{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)}
  .staff-list-item:last-child{border-bottom:none}
  .staff-name{font-size:14px;font-weight:700;color:#fff}
  .staff-email{font-size:12px;color:#6e6660}
  .staff-role-badge{padding:3px 10px;border-radius:999px;font-size:11px;font-weight:800;background:rgba(214,181,109,.1);color:#d6b56d;border:1px solid rgba(214,181,109,.25)}

  .history-wrap{overflow-x:auto}
  .history-table{width:100%;border-collapse:collapse}
  .history-table th{font-size:11px;font-weight:800;letter-spacing:.1em;color:#6e6660;text-transform:uppercase;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left;white-space:nowrap}
  .history-table td{padding:11px 12px;border-bottom:1px solid rgba(255,255,255,.04);font-size:13px;color:#d9d2c6;vertical-align:middle}
  .pill{padding:2px 8px;border-radius:999px;font-size:11px;font-weight:800}
  .pill-s{background:rgba(74,222,128,.1);color:#4ade80}
  .pill-d{background:rgba(251,191,36,.1);color:#fbbf24}
  .pill-c,.pill-i{background:rgba(248,113,113,.1);color:#f87171}

  .save-btn{padding:13px 28px;border-radius:14px;background:#d6b56d;color:#11100f;font-weight:900;font-size:14px;border:none;cursor:pointer;margin-top:18px;transition:opacity .2s}
  .save-btn:hover{opacity:.85}

  .flash-message{background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.25);border-radius:12px;padding:12px 18px;color:#4ade80;font-size:14px;font-weight:700;margin-bottom:22px}

  .add-staff-form{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:18px;margin-top:18px}
  .form-row{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap}
  .form-group{display:flex;flex-direction:column;gap:5px}
  .form-label{font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#9f978a}
  .form-select,.form-input{background:#11100f;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 14px;color:#f7f2ea;font-size:13px;outline:none}
  .form-select:focus,.form-input:focus{border-color:rgba(214,181,109,.5)}
  .form-submit{padding:10px 20px;border-radius:10px;background:#d6b56d;color:#11100f;font-weight:800;font-size:13px;border:none;cursor:pointer}
</style>

<main>
  <div class="admin-checkin-page">
    <div class="admin-checkin-hero">
      <p class="eyebrow">Admin · Check-In System</p>
      <h1>Check-In Dashboard</h1>
    </div>

    <?php $flash = get_flash(); if ($flash): ?>
      <div class="flash-message"><?= e($flash) ?></div>
    <?php endif; ?>

    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-value gold"><?= $stats['today'] ?></div>
        <div class="kpi-label">Heute</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value"><?= $stats['total_active'] ?></div>
        <div class="kpi-label">Gesamt aktiv</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value"><?= $stats['vip_today'] ?></div>
        <div class="kpi-label">VIP heute</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value"><?= $stats['black_today'] ?></div>
        <div class="kpi-label">Black heute</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value" style="color:#fbbf24"><?= $stats['duplicates'] ?></div>
        <div class="kpi-label">Doppelscans</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-value" style="color:#f87171"><?= $stats['invalid'] ?></div>
        <div class="kpi-label">Ungültig</div>
      </div>
    </div>

    <!-- Tabs -->
    <nav class="tab-nav">
      <a href="?tab=overview" class="tab-btn <?= $tab === 'overview' ? 'active' : '' ?>">Übersicht</a>
      <a href="?tab=history" class="tab-btn <?= $tab === 'history' ? 'active' : '' ?>">Verlauf</a>
      <a href="?tab=staff" class="tab-btn <?= $tab === 'staff' ? 'active' : '' ?>">Staff</a>
      <a href="?tab=settings" class="tab-btn <?= $tab === 'settings' ? 'active' : '' ?>">Einstellungen</a>
    </nav>

    <!-- OVERVIEW -->
    <?php if ($tab === 'overview'): ?>
      <?php if (!empty($stats['events_today'])): ?>
        <div style="background:#11100f;border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:22px;margin-bottom:20px">
          <h3 style="font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9f978a;margin:0 0 16px">Heutige Events</h3>
          <?php foreach ($stats['events_today'] as $ev): ?>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)">
              <span style="font-size:14px;font-weight:700;color:#fff"><?= e((string) $ev['event_name']) ?></span>
              <span style="font-size:20px;font-weight:900;color:#d6b56d"><?= (int) $ev['checkins'] ?> <span style="font-size:11px;color:#6e6660">Check-Ins</span></span>
            </div>
          <?php endforeach; ?>
        </div>
      <?php else: ?>
        <p style="color:#6e6660;text-align:center;padding:32px">Heute noch keine Check-Ins.</p>
      <?php endif; ?>

      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <a href="/checkin/scanner" style="padding:13px 24px;border-radius:14px;background:#d6b56d;color:#11100f;font-weight:900;font-size:14px;text-decoration:none">Scanner öffnen</a>
        <a href="/checkin/history" style="padding:13px 24px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:#f7f2ea;font-weight:700;font-size:14px;text-decoration:none">Vollständiger Verlauf</a>
      </div>

    <!-- VERLAUF -->
    <?php elseif ($tab === 'history'): ?>
      <form method="get" style="display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap">
        <input type="hidden" name="tab" value="history">
        <input type="date" name="date" style="background:#11100f;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:9px 14px;color:#f7f2ea;font-size:13px;outline:none" value="<?= e($_GET['date'] ?? date('Y-m-d')) ?>">
        <select name="status" style="background:#11100f;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:9px 14px;color:#f7f2ea;font-size:13px;outline:none">
          <option value="">Alle</option>
          <option value="success" <?= ($_GET['status'] ?? '') === 'success' ? 'selected' : '' ?>>Erfolg</option>
          <option value="duplicate" <?= ($_GET['status'] ?? '') === 'duplicate' ? 'selected' : '' ?>>Doppelscan</option>
          <option value="cancelled" <?= ($_GET['status'] ?? '') === 'cancelled' ? 'selected' : '' ?>>Storniert</option>
          <option value="invalid" <?= ($_GET['status'] ?? '') === 'invalid' ? 'selected' : '' ?>>Ungültig</option>
        </select>
        <button type="submit" style="padding:9px 18px;border-radius:10px;background:#d6b56d;color:#11100f;font-size:13px;font-weight:800;border:none;cursor:pointer">Filtern</button>
      </form>
      <p style="font-size:13px;color:#6e6660;margin-bottom:14px"><?= count($history) ?> Einträge</p>
      <?php if ($history): ?>
        <div class="history-wrap">
          <table class="history-table">
            <thead>
              <tr><th>Mitglied</th><th>Event</th><th>Typ</th><th>Scanner</th><th>Standort</th><th>Zeit</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              <?php foreach ($history as $row): ?>
                <?php
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
                  <td><strong><?= e((string) $row['member_name']) ?></strong><br><span style="font-size:11px;color:#6e6660"><?= e((string) $row['member_email']) ?></span></td>
                  <td><?= e((string) $row['event_name']) ?></td>
                  <td><?= e((string) ($row['ticket_type'] ?? '')) ?></td>
                  <td><?= e((string) $row['scanner_name']) ?></td>
                  <td><?= e((string) $row['checkin_location']) ?></td>
                  <td style="white-space:nowrap;color:#9f978a"><?= e(substr((string) $row['checked_in_at'], 0, 16)) ?></td>
                  <td><span class="pill <?= $pillClass ?>"><?= $statusLabel ?></span></td>
                  <td>
                    <?php if ((string) $row['status'] === 'success'): ?>
                      <form method="post" style="display:inline" onsubmit="return confirm('Ticket zurücksetzen?')">
                        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                        <input type="hidden" name="action" value="reset_ticket">
                        <input type="hidden" name="ticket_id" value="<?= (int) $row['ticket_id'] ?>">
                        <input type="hidden" name="tab" value="history">
                        <button type="submit" style="padding:4px 10px;border-radius:6px;background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.25);font-size:11px;font-weight:700;cursor:pointer">Reset</button>
                      </form>
                    <?php endif; ?>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php else: ?>
        <p style="text-align:center;color:#6e6660;padding:32px">Keine Einträge für diesen Filter.</p>
      <?php endif; ?>

    <!-- STAFF -->
    <?php elseif ($tab === 'staff'): ?>
      <?php if ($staffList): ?>
        <div style="background:#11100f;border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:22px;margin-bottom:20px">
          <h3 style="font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9f978a;margin:0 0 16px">Aktiver Staff</h3>
          <?php foreach ($staffList as $s): ?>
            <div class="staff-list-item">
              <div>
                <div class="staff-name"><?= e((string) $s['name']) ?></div>
                <div class="staff-email"><?= e((string) $s['email']) ?></div>
              </div>
              <div style="display:flex;align-items:center;gap:12px">
                <span class="staff-role-badge"><?= e((string) $s['role']) ?></span>
                <?php if ($s['is_active']): ?>
                  <form method="post" style="display:inline">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
                    <input type="hidden" name="action" value="deactivate_staff">
                    <input type="hidden" name="staff_user_id" value="<?= (int) $s['user_id'] ?>">
                    <input type="hidden" name="tab" value="staff">
                    <button type="submit" style="padding:5px 12px;border-radius:999px;background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.25);font-size:11px;font-weight:800;cursor:pointer">Entfernen</button>
                  </form>
                <?php endif; ?>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      <?php else: ?>
        <p style="color:#6e6660;margin-bottom:20px">Noch kein Staff zugewiesen.</p>
      <?php endif; ?>

      <div class="add-staff-form">
        <h3 style="font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9f978a;margin:0 0 16px">Staff hinzufügen</h3>
        <form method="post">
          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
          <input type="hidden" name="action" value="add_staff">
          <input type="hidden" name="tab" value="staff">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Mitglied</label>
              <select name="staff_user_id" class="form-select" required style="min-width:220px">
                <option value="">— auswählen —</option>
                <?php foreach ($allMembers as $m): ?>
                  <option value="<?= (int) $m['id'] ?>"><?= e((string) $m['name']) ?> (<?= e((string) $m['email']) ?>)</option>
                <?php endforeach; ?>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Rolle</label>
              <select name="staff_role" class="form-select">
                <option value="checkin_staff">Check-In Staff</option>
                <option value="event_manager">Event Manager</option>
              </select>
            </div>
            <div class="form-group" style="justify-content:flex-end">
              <button type="submit" class="form-submit">Hinzufügen</button>
            </div>
          </div>
        </form>
      </div>

    <!-- EINSTELLUNGEN -->
    <?php elseif ($tab === 'settings'): ?>
      <form method="post" class="settings-form">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
        <input type="hidden" name="action" value="save_settings">
        <input type="hidden" name="tab" value="settings">

        <div class="settings-group">
          <h3>Scanner-Verhalten</h3>

          <div class="setting-row">
            <div>
              <div class="setting-label">Doppelscan erlauben</div>
              <div class="setting-sub">Tickets können mehrfach gescannt werden (nur Warnung, kein Block)</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" name="allow_double_scan" value="1" <?= ($settings['allow_double_scan'] ?? '0') === '1' ? 'checked' : '' ?>>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div>
              <div class="setting-label">Profilfoto voraussetzen</div>
              <div class="setting-sub">Warnung anzeigen wenn kein Foto hochgeladen</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" name="require_profile_photo" value="1" <?= ($settings['require_profile_photo'] ?? '0') === '1' ? 'checked' : '' ?>>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div>
              <div class="setting-label">Standard-Standort</div>
              <div class="setting-sub">Vorausgefüllter Standort am Scanner</div>
            </div>
            <input type="text" name="default_location" class="text-input" value="<?= e($settings['default_location'] ?? 'Haupteingang') ?>" style="width:160px">
          </div>
        </div>

        <div class="settings-group">
          <h3>Loyalty & Anzeige</h3>

          <div class="setting-row">
            <div>
              <div class="setting-label">Loyalty Punkte beim Check-In</div>
              <div class="setting-sub">Punkte je Check-In (0 = deaktiviert)</div>
            </div>
            <input type="number" name="checkin_points" class="text-input" min="0" max="9999" value="<?= e($settings['checkin_points'] ?? '50') ?>">
          </div>

          <div class="setting-row">
            <div>
              <div class="setting-label">Loyalty-Status anzeigen</div>
              <div class="setting-sub">Tier und Punkte auf der Scan-Card</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" name="show_loyalty" value="1" <?= ($settings['show_loyalty'] ?? '1') === '1' ? 'checked' : '' ?>>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div>
              <div class="setting-label">Ambassador-Badge anzeigen</div>
              <div class="setting-sub">Ambassador-Rolle und Stadt sichtbar</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" name="show_ambassador" value="1" <?= ($settings['show_ambassador'] ?? '1') === '1' ? 'checked' : '' ?>>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <div>
              <div class="setting-label">Sicherheitshinweise anzeigen</div>
              <div class="setting-sub">Nur für Event Manager und Admin sichtbar</div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" name="show_security_notes" value="1" <?= ($settings['show_security_notes'] ?? '1') === '1' ? 'checked' : '' ?>>
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <button type="submit" class="save-btn">Einstellungen speichern</button>
      </form>
    <?php endif; ?>
  </div>
</main>

<?php render_footer(); ?>
