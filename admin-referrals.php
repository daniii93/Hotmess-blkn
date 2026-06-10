<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/referral-data.php';

$admin = require_admin();
$adminId = (int) $admin['id'];

$tab = in_array($_GET['tab'] ?? '', ['referrals', 'codes', 'ambassadors'], true) ? $_GET['tab'] : 'referrals';

// --- POST-Aktionen ---
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $action = $_POST['action'] ?? '';

    if ($action === 'cancel_referral') {
        $id = (int) ($_POST['referral_id'] ?? 0);
        $note = trim($_POST['note'] ?? '');
        if ($id > 0) {
            hotmess_referral_admin_cancel_referral($id, $adminId, $note);
        }
    } elseif ($action === 'update_referral_status') {
        $id = (int) ($_POST['referral_id'] ?? 0);
        $status = trim($_POST['status'] ?? '');
        $note = trim($_POST['note'] ?? '');
        if ($id > 0) {
            hotmess_referral_admin_update_referral_status($id, $status, $adminId, $note);
        }
    } elseif ($action === 'update_code_status') {
        $codeId = (int) ($_POST['code_id'] ?? 0);
        $status = trim($_POST['status'] ?? '');
        if ($codeId > 0) {
            hotmess_referral_admin_update_code_status($codeId, $status, $adminId);
        }
    } elseif ($action === 'add_ambassador') {
        $userId = (int) ($_POST['user_id'] ?? 0);
        $role = trim($_POST['role'] ?? 'city');
        $city = trim($_POST['city'] ?? '');
        if ($userId > 0) {
            hotmess_referral_admin_add_ambassador($userId, $role, $city, $adminId);
        }
    } elseif ($action === 'award_points') {
        $referralId = (int) ($_POST['referral_id'] ?? 0);
        $referrerId = (int) ($_POST['referrer_user_id'] ?? 0);
        $eventType  = trim($_POST['event_type'] ?? 'registered');
        if ($referralId > 0 && $referrerId > 0) {
            hotmess_referral_award_points($referrerId, $eventType, $referralId, 0.0, $referralId);
        }
    }

    $tab = $_POST['redirect_tab'] ?? $tab;
    header('Location: /admin/referrals?tab=' . $tab);
    exit;
}

// --- Daten laden ---
$stats = hotmess_referral_admin_stats();

$filters = [
    'status'        => $_GET['status'] ?? '',
    'purchase_type' => $_GET['purchase_type'] ?? '',
    'search'        => $_GET['search'] ?? '',
    'date_from'     => $_GET['date_from'] ?? '',
    'date_to'       => $_GET['date_to'] ?? '',
    'ambassador_only' => !empty($_GET['ambassador_only']),
];

$referrals  = $tab === 'referrals' ? hotmess_referral_admin_list($filters, 200) : [];
$codes      = $tab === 'codes'     ? hotmess_referral_admin_codes($filters, 200) : [];
$ambassadors = $tab === 'ambassadors' ? hotmess_referral_ambassador_list(100) : [];

// Users für Ambassador-Formular
$allUsers = [];
if ($tab === 'ambassadors') {
    $allUsers = db()->query('SELECT id, name, email FROM users WHERE role = "member" AND status = "approved" ORDER BY name ASC LIMIT 500')->fetchAll();
}

$pageTitle = 'Referrals & Ambassadors';
?>
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?= e($pageTitle) ?> | HOTMESS Admin</title>
  <link rel="stylesheet" href="/styles.css" />
  <style>
    .admin-referrals { max-width: 1200px; margin: 0 auto; padding: 32px 20px 80px; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 24px; font-weight: 900; color: #fff; margin: 0 0 4px; }
    .page-header p  { color: #6e6660; font-size: 14px; margin: 0; }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 28px; }
    .kpi-card { background: #141210; border: 1px solid rgba(255,255,255,.07); border-radius: 14px; padding: 16px; }
    .kpi-val  { font-size: 24px; font-weight: 900; color: #fff; margin: 0 0 4px; }
    .kpi-val.gold { color: #d6b56d; }
    .kpi-label { font-size: 11px; color: #6e6660; }

    .tabs { display: flex; gap: 4px; background: #141210; border-radius: 12px; padding: 4px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,.06); width: fit-content; }
    .tab-btn { padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; color: #6e6660; text-decoration: none; transition: all .2s; }
    .tab-btn.active { background: rgba(214,181,109,.15); color: #d6b56d; }
    .tab-btn:hover:not(.active) { color: #d9d2c6; }

    .filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
    .filters input, .filters select { background: #141210; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; color: #d9d2c6; padding: 8px 12px; font-size: 13px; min-width: 140px; }
    .filters input::placeholder { color: #4a4540; }

    .data-table-wrap { background: #11100f; border: 1px solid rgba(255,255,255,.07); border-radius: 16px; overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table th { padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: .1em; color: #6e6660; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,.06); background: #0e0d0c; }
    .data-table td { padding: 11px 16px; border-bottom: 1px solid rgba(255,255,255,.04); color: #d9d2c6; vertical-align: middle; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: rgba(255,255,255,.02); }

    .status-badge { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .status-registered { background: rgba(59,130,246,.15); color: #93c5fd; }
    .status-converted  { background: rgba(234,179,8,.15); color: #fde047; }
    .status-rewarded   { background: rgba(34,197,94,.15); color: #86efac; }
    .status-cancelled  { background: rgba(239,68,68,.12); color: #fca5a5; }
    .status-pending    { background: rgba(156,163,175,.12); color: #9ca3af; }
    .status-active     { background: rgba(34,197,94,.12); color: #86efac; }
    .status-paused     { background: rgba(234,179,8,.12); color: #fde047; }
    .status-archived   { background: rgba(107,114,128,.12); color: #9ca3af; }

    .btn-sm { padding: 5px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; border: 1px solid rgba(255,255,255,.12); background: transparent; color: #9f978a; cursor: pointer; }
    .btn-sm:hover { background: rgba(255,255,255,.06); }
    .btn-danger { border-color: rgba(239,68,68,.3); color: #fca5a5; }
    .btn-danger:hover { background: rgba(239,68,68,.08); }
    .btn-gold { border-color: rgba(214,181,109,.35); color: #d6b56d; }
    .btn-gold:hover { background: rgba(214,181,109,.1); }

    .ambassador-role { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: rgba(214,181,109,.1); color: #d6b56d; }

    .add-ambassador-form { background: #141210; border: 1px solid rgba(255,255,255,.07); border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .add-ambassador-form h3 { font-size: 14px; font-weight: 700; color: #d9d2c6; margin: 0 0 16px; }
    .form-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; }
    .form-row label { display: flex; flex-direction: column; gap: 4px; font-size: 11px; color: #6e6660; font-weight: 600; }
    .form-row select, .form-row input { background: #1a1816; border: 1px solid rgba(255,255,255,.1); border-radius: 8px; color: #d9d2c6; padding: 8px 12px; font-size: 13px; }

    .modal-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:999; align-items:center; justify-content:center; }
    .modal-overlay.open { display:flex; }
    .modal { background:#1a1816; border:1px solid rgba(255,255,255,.1); border-radius:16px; padding:28px; max-width:420px; width:90%; }
    .modal h3 { font-size:16px; font-weight:700; color:#fff; margin:0 0 16px; }
    .modal textarea { width:100%; background:#141210; border:1px solid rgba(255,255,255,.1); border-radius:8px; color:#d9d2c6; padding:10px 12px; font-size:13px; resize:vertical; min-height:80px; }
    .modal-actions { display:flex; gap:10px; margin-top:16px; }
    .empty-state { padding: 48px; text-align: center; color: #4a4540; font-size: 14px; }
  </style>
</head>
<body style="background:#080706; color:#d9d2c6;">
<main class="admin-referrals">

  <div class="page-header">
    <h1>Referrals &amp; Ambassadors</h1>
    <p>Übersicht aller Empfehlungen, Codes und Ambassador-Profile</p>
  </div>

  <!-- KPIs -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-val"><?= $stats['total_referrals'] ?></div>
      <div class="kpi-label">Gesamt Referrals</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val"><?= $stats['pending'] ?></div>
      <div class="kpi-label">Registriert</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val"><?= $stats['converted'] ?></div>
      <div class="kpi-label">Konvertiert</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val"><?= $stats['rewarded'] ?></div>
      <div class="kpi-label">Belohnt</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val gold"><?= number_format($stats['total_points'], 0, ',', '.') ?></div>
      <div class="kpi-label">Punkte vergeben</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val">€<?= number_format($stats['total_revenue'], 0, ',', '.') ?></div>
      <div class="kpi-label">Referral Umsatz</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val"><?= $stats['active_codes'] ?></div>
      <div class="kpi-label">Aktive Codes</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-val"><?= $stats['active_ambassadors'] ?></div>
      <div class="kpi-label">Ambassadors</div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="tabs">
    <a href="/admin/referrals?tab=referrals" class="tab-btn <?= $tab === 'referrals' ? 'active' : '' ?>">Empfehlungen</a>
    <a href="/admin/referrals?tab=codes" class="tab-btn <?= $tab === 'codes' ? 'active' : '' ?>">Codes</a>
    <a href="/admin/referrals?tab=ambassadors" class="tab-btn <?= $tab === 'ambassadors' ? 'active' : '' ?>">Ambassadors</a>
  </div>

  <!-- TAB: Referrals -->
  <?php if ($tab === 'referrals'): ?>
    <form method="get" action="/admin/referrals" class="filters">
      <input type="hidden" name="tab" value="referrals" />
      <input type="text" name="search" placeholder="Suche..." value="<?= e($filters['search']) ?>" />
      <select name="status">
        <option value="">Alle Status</option>
        <?php foreach (['registered','converted','rewarded','cancelled','pending'] as $s): ?>
          <option value="<?= $s ?>" <?= $filters['status'] === $s ? 'selected' : '' ?>><?= e(hotmess_referral_status_label($s)) ?></option>
        <?php endforeach; ?>
      </select>
      <select name="purchase_type">
        <option value="">Alle Conversion-Typen</option>
        <?php foreach (['ticket','passport_plus','passport_black','package'] as $t): ?>
          <option value="<?= $t ?>" <?= $filters['purchase_type'] === $t ? 'selected' : '' ?>><?= e(hotmess_referral_purchase_type_label($t)) ?></option>
        <?php endforeach; ?>
      </select>
      <input type="date" name="date_from" value="<?= e($filters['date_from']) ?>" title="Von" />
      <input type="date" name="date_to" value="<?= e($filters['date_to']) ?>" title="Bis" />
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#9f978a;">
        <input type="checkbox" name="ambassador_only" value="1" <?= !empty($filters['ambassador_only']) ? 'checked' : '' ?> /> Nur Ambassadors
      </label>
      <button type="submit" class="btn-sm btn-gold">Filtern</button>
      <a href="/admin/referrals?tab=referrals" class="btn-sm">Zurücksetzen</a>
    </form>

    <div class="data-table-wrap">
      <?php if (empty($referrals)): ?>
        <div class="empty-state">Keine Empfehlungen gefunden.</div>
      <?php else: ?>
        <div style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Referrer</th>
                <th>Geworbenes Mitglied</th>
                <th>Status</th>
                <th>Conversion</th>
                <th>Umsatz</th>
                <th>Punkte</th>
                <th>Ambassador</th>
                <th>Datum</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($referrals as $ref): ?>
                <tr>
                  <td style="color:#4a4540;"><?= (int)$ref['id'] ?></td>
                  <td>
                    <div><?= e($ref['referrer_name']) ?></div>
                    <div style="font-size:11px;color:#4a4540;"><?= e($ref['referrer_email']) ?></div>
                  </td>
                  <td>
                    <div><?= e($ref['referred_name']) ?></div>
                    <div style="font-size:11px;color:#4a4540;"><?= e($ref['referred_email']) ?></div>
                  </td>
                  <td>
                    <span class="status-badge status-<?= e($ref['status']) ?>">
                      <?= e(hotmess_referral_status_label($ref['status'])) ?>
                    </span>
                  </td>
                  <td>
                    <?= $ref['first_purchase_type'] ? '<span style="color:#d6b56d;font-size:12px;">' . e(hotmess_referral_purchase_type_label($ref['first_purchase_type'])) . '</span>' : '<span style="color:#4a4540;">—</span>' ?>
                  </td>
                  <td style="color:#d6b56d;">
                    <?= $ref['first_purchase_amount'] ? '€' . number_format((float)$ref['first_purchase_amount'], 2, ',', '.') : '—' ?>
                  </td>
                  <td style="color:#d6b56d; font-weight:700;">
                    <?= (int)$ref['points_awarded'] > 0 ? '+' . number_format((int)$ref['points_awarded'], 0, ',', '.') : '—' ?>
                  </td>
                  <td>
                    <?php if ($ref['ambassador_role']): ?>
                      <span class="ambassador-role"><?= e(hotmess_referral_role_label($ref['ambassador_role'])) ?></span>
                    <?php else: ?>
                      <span style="color:#4a4540;">—</span>
                    <?php endif; ?>
                  </td>
                  <td style="font-size:12px;color:#6e6660;"><?= date('d.m.Y', strtotime($ref['created_at'])) ?></td>
                  <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap;">
                      <?php if ($ref['status'] !== 'cancelled'): ?>
                        <button class="btn-sm btn-danger" onclick="openCancelModal(<?= (int)$ref['id'] ?>)">Stornieren</button>
                      <?php endif; ?>
                      <?php if ($ref['status'] === 'registered'): ?>
                        <form method="post" style="display:inline;">
                          <?= csrf_field() ?>
                          <input type="hidden" name="action" value="award_points" />
                          <input type="hidden" name="referral_id" value="<?= (int)$ref['id'] ?>" />
                          <input type="hidden" name="referrer_user_id" value="<?= (int)$ref['referrer_user_id'] ?>" />
                          <input type="hidden" name="event_type" value="registered" />
                          <input type="hidden" name="redirect_tab" value="referrals" />
                          <button type="submit" class="btn-sm btn-gold">Punkte nachtragen</button>
                        </form>
                      <?php endif; ?>
                    </div>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </div>

  <!-- TAB: Codes -->
  <?php elseif ($tab === 'codes'): ?>
    <form method="get" action="/admin/referrals" class="filters">
      <input type="hidden" name="tab" value="codes" />
      <input type="text" name="search" placeholder="Suche..." value="<?= e($filters['search']) ?>" />
      <select name="status">
        <option value="">Alle Status</option>
        <option value="active" <?= $filters['status'] === 'active' ? 'selected' : '' ?>>Aktiv</option>
        <option value="paused" <?= $filters['status'] === 'paused' ? 'selected' : '' ?>>Pausiert</option>
        <option value="archived" <?= $filters['status'] === 'archived' ? 'selected' : '' ?>>Archiviert</option>
      </select>
      <button type="submit" class="btn-sm btn-gold">Filtern</button>
    </form>

    <div class="data-table-wrap">
      <?php if (empty($codes)): ?>
        <div class="empty-state">Keine Codes gefunden.</div>
      <?php else: ?>
        <div style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Mitglied</th>
                <th>Status</th>
                <th>Nutzungen</th>
                <th>Conversions</th>
                <th>Zuletzt genutzt</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($codes as $code): ?>
                <tr>
                  <td><code style="font-size:12px;color:#d6b56d;"><?= e($code['code']) ?></code></td>
                  <td>
                    <div><?= e($code['name']) ?></div>
                    <div style="font-size:11px;color:#4a4540;"><?= e($code['email']) ?></div>
                  </td>
                  <td>
                    <span class="status-badge status-<?= e($code['status']) ?>">
                      <?= $code['status'] === 'active' ? 'Aktiv' : ($code['status'] === 'paused' ? 'Pausiert' : 'Archiviert') ?>
                    </span>
                  </td>
                  <td><?= (int)$code['uses_total'] ?></td>
                  <td><?= (int)$code['conversion_count'] ?> / <?= (int)$code['referral_count'] ?></td>
                  <td style="font-size:12px;color:#6e6660;">
                    <?= $code['last_used_at'] ? date('d.m.Y', strtotime($code['last_used_at'])) : '—' ?>
                  </td>
                  <td>
                    <form method="post" style="display:inline-flex;gap:6px;">
                      <?= csrf_field() ?>
                      <input type="hidden" name="action" value="update_code_status" />
                      <input type="hidden" name="code_id" value="<?= (int)$code['id'] ?>" />
                      <input type="hidden" name="redirect_tab" value="codes" />
                      <?php if ($code['status'] === 'active'): ?>
                        <input type="hidden" name="status" value="paused" />
                        <button type="submit" class="btn-sm">Pausieren</button>
                      <?php elseif ($code['status'] === 'paused'): ?>
                        <input type="hidden" name="status" value="active" />
                        <button type="submit" class="btn-sm btn-gold">Reaktivieren</button>
                      <?php else: ?>
                        <input type="hidden" name="status" value="active" />
                        <button type="submit" class="btn-sm btn-gold">Aktivieren</button>
                      <?php endif; ?>
                    </form>
                  </td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </div>

  <!-- TAB: Ambassadors -->
  <?php elseif ($tab === 'ambassadors'): ?>

    <div class="add-ambassador-form">
      <h3>Ambassador zuweisen</h3>
      <form method="post" class="form-row">
        <?= csrf_field() ?>
        <input type="hidden" name="action" value="add_ambassador" />
        <input type="hidden" name="redirect_tab" value="ambassadors" />
        <label>
          Mitglied
          <select name="user_id" required style="min-width:220px;">
            <option value="">— auswählen —</option>
            <?php foreach ($allUsers as $u): ?>
              <option value="<?= (int)$u['id'] ?>"><?= e($u['name']) ?> (<?= e($u['email']) ?>)</option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>
          Rolle
          <select name="role">
            <option value="city">City Ambassador</option>
            <option value="travel">Travel Ambassador</option>
            <option value="vip">VIP Ambassador</option>
            <option value="brand">Brand Ambassador</option>
          </select>
        </label>
        <label>
          Stadt
          <input type="text" name="city" placeholder="z.B. Berlin" style="min-width:140px;" />
        </label>
        <button type="submit" class="button primary" style="padding:8px 20px;font-size:13px;">Zuweisen</button>
      </form>
    </div>

    <div class="data-table-wrap">
      <?php if (empty($ambassadors)): ?>
        <div class="empty-state">Noch keine Ambassadors zugewiesen.</div>
      <?php else: ?>
        <div style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ambassador</th>
                <th>Rolle</th>
                <th>Stadt</th>
                <th>Code</th>
                <th>Registrierungen</th>
                <th>Conversions</th>
                <th>Black Conversions</th>
                <th>Package</th>
                <th>Umsatz</th>
                <th>Punkte vergeben</th>
              </tr>
            </thead>
            <tbody>
              <?php foreach ($ambassadors as $amb): ?>
                <?php
                $codeRow = hotmess_referral_find_by_code('');
                $codeStmt = db()->prepare('SELECT code FROM referral_codes WHERE user_id = ? LIMIT 1');
                $codeStmt->execute([(int)$amb['user_id']]);
                $ambCode = $codeStmt->fetchColumn() ?: '—';
                ?>
                <tr>
                  <td>
                    <div style="font-weight:700;"><?= e($amb['name']) ?></div>
                    <div style="font-size:11px;color:#4a4540;"><?= e($amb['email']) ?></div>
                  </td>
                  <td><span class="ambassador-role"><?= e(hotmess_referral_role_label($amb['role'])) ?></span></td>
                  <td style="color:#9f978a;"><?= e((string)($amb['city'] ?? '—')) ?></td>
                  <td><code style="font-size:11px;color:#d6b56d;"><?= e($ambCode) ?></code></td>
                  <td><?= (int)$amb['total_referrals'] ?></td>
                  <td style="color:#d6b56d;font-weight:700;"><?= (int)$amb['conversions'] ?></td>
                  <td><?= (int)$amb['black_conversions'] ?></td>
                  <td><?= (int)$amb['package_conversions'] ?></td>
                  <td style="color:#d6b56d;">€<?= number_format((float)($amb['revenue_generated'] ?? 0), 0, ',', '.') ?></td>
                  <td><?= number_format((int)($amb['points_awarded'] ?? 0), 0, ',', '.') ?></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      <?php endif; ?>
    </div>

  <?php endif; ?>

  <div style="margin-top:28px;">
    <a href="/admin" class="button ghost" style="font-size:13px;">← Admin Dashboard</a>
  </div>

</main>

<!-- Cancel Modal -->
<div class="modal-overlay" id="cancelModal">
  <div class="modal">
    <h3>Referral stornieren</h3>
    <form method="post" id="cancelForm">
      <?= csrf_field() ?>
      <input type="hidden" name="action" value="cancel_referral" />
      <input type="hidden" name="referral_id" id="cancelReferralId" value="" />
      <input type="hidden" name="redirect_tab" value="referrals" />
      <textarea name="note" placeholder="Begründung (optional)"></textarea>
      <div class="modal-actions">
        <button type="submit" class="btn-sm btn-danger">Stornieren</button>
        <button type="button" class="btn-sm" onclick="closeModal()">Abbrechen</button>
      </div>
    </form>
  </div>
</div>

<?php
function csrf_field(): string {
    return '<input type="hidden" name="csrf_token" value="' . htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8') . '" />';
}
?>

<script>
function openCancelModal(id) {
  document.getElementById('cancelReferralId').value = id;
  document.getElementById('cancelModal').classList.add('open');
}
function closeModal() {
  document.getElementById('cancelModal').classList.remove('open');
}
document.getElementById('cancelModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
</script>
</body>
</html>
