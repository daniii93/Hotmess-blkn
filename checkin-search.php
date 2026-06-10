<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/checkin-data.php';

$user = require_login();
$role = hotmess_checkin_require_access($user);

$term = trim((string) ($_GET['q'] ?? ''));
$results = [];
if ($term !== '') {
    $results = hotmess_checkin_search($term, 50);
}

$csrfToken = csrf_token();
$defaultLocation = hotmess_checkin_setting('default_location', 'Haupteingang');

render_header('Check-In Suche | HOTMESS');
?>
<style>
  .search-page{max-width:700px;margin:0 auto;padding:30px 18px 80px}
  .search-topbar{display:flex;align-items:center;gap:14px;margin-bottom:28px}
  .search-back{color:#9f978a;text-decoration:none;font-size:14px;font-weight:700;display:flex;align-items:center;gap:5px}
  .search-back:hover{color:#f7f2ea}
  .search-page h1{font-size:22px;font-weight:900;color:#fff;margin:0}

  .search-form-row{display:flex;gap:10px;margin-bottom:28px}
  .search-input{flex:1;background:#11100f;border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px 18px;color:#f7f2ea;font-size:15px;outline:none;transition:border-color .2s}
  .search-input:focus{border-color:rgba(214,181,109,.5)}
  .search-btn{padding:14px 22px;border-radius:14px;background:#d6b56d;color:#11100f;font-weight:800;font-size:14px;border:none;cursor:pointer;transition:opacity .2s;white-space:nowrap}
  .search-btn:hover{opacity:.85}

  .search-result-item{background:#11100f;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:16px;display:flex;align-items:center;gap:14px;margin-bottom:12px;transition:border-color .25s}
  .search-result-item:hover{border-color:rgba(214,181,109,.2)}
  .search-avatar{width:48px;height:48px;border-radius:50%;object-fit:cover;flex-shrink:0;background:#1a1a1a}
  .search-avatar-ph{width:48px;height:48px;border-radius:50%;flex-shrink:0;background:rgba(214,181,109,.1);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:#d6b56d}
  .search-info{flex:1;min-width:0}
  .search-name{font-size:15px;font-weight:800;color:#fff;margin:0 0 3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .search-sub{font-size:12px;color:#9f978a;margin:0}
  .search-status-col{display:flex;flex-direction:column;align-items:flex-end;gap:7px;flex-shrink:0}
  .status-pill{padding:3px 10px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.06em}
  .pill-valid{background:rgba(74,222,128,.1);color:#4ade80;border:1px solid rgba(74,222,128,.25)}
  .pill-checked_in{background:rgba(251,191,36,.1);color:#fbbf24;border:1px solid rgba(251,191,36,.2)}
  .pill-cancelled{background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.2)}
  .checkin-quick-btn{padding:7px 14px;border-radius:999px;background:#d6b56d;color:#11100f;font-size:12px;font-weight:800;cursor:pointer;border:none;transition:opacity .2s}
  .checkin-quick-btn:hover{opacity:.8}
  .checkin-quick-btn:disabled{opacity:.3;cursor:not-allowed}

  .empty-state{text-align:center;padding:48px 20px;color:#6e6660}
  .empty-state h3{color:#9f978a;font-size:17px;margin:0 0 8px}

  .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#11100f;border:1px solid rgba(214,181,109,.3);border-radius:14px;padding:14px 22px;font-size:14px;font-weight:700;color:#f7f2ea;z-index:9999;opacity:0;transition:all .3s;pointer-events:none;max-width:90vw;text-align:center}
  .toast.visible{opacity:1;transform:translateX(-50%) translateY(0)}
  .toast.success-toast{border-color:rgba(74,222,128,.4);color:#4ade80}
  .toast.error-toast{border-color:rgba(248,113,113,.4);color:#f87171}
  .toast.warn-toast{border-color:rgba(251,191,36,.4);color:#fbbf24}
</style>

<main>
  <div class="search-page">
    <div class="search-topbar">
      <a href="/checkin" class="search-back">← Zurück</a>
      <h1>Ticket Suche</h1>
    </div>

    <form method="get" action="/checkin/search">
      <div class="search-form-row">
        <input type="text" name="q" class="search-input" placeholder="Name, E-Mail oder Ticketnummer..." value="<?= e($term) ?>" autofocus>
        <button type="submit" class="search-btn">Suchen</button>
      </div>
    </form>

    <?php if ($term !== '' && empty($results)): ?>
      <div class="empty-state">
        <h3>Keine Ergebnisse</h3>
        <p>Für «<?= e($term) ?>» wurden keine Tickets gefunden.</p>
      </div>
    <?php endif; ?>

    <?php foreach ($results as $ticket): ?>
      <?php
        $statusLabel = match ($ticket['status']) {
            'checked_in' => 'Eingecheckt',
            'cancelled'  => 'Storniert',
            default      => 'Gültig',
        };
        $pillClass = match ($ticket['status']) {
            'checked_in' => 'pill-checked_in',
            'cancelled'  => 'pill-cancelled',
            default      => 'pill-valid',
        };
        $canCheckin = $ticket['status'] === 'valid';
        $avatarInitial = mb_strtoupper(mb_substr((string) $ticket['name'], 0, 1));
      ?>
      <div class="search-result-item" id="item-<?= (int) $ticket['id'] ?>">
        <?php if ($ticket['profile_photo']): ?>
          <img src="<?= e((string) $ticket['profile_photo']) ?>" class="search-avatar" alt="">
        <?php else: ?>
          <div class="search-avatar-ph"><?= e($avatarInitial) ?></div>
        <?php endif; ?>

        <div class="search-info">
          <p class="search-name"><?= e((string) $ticket['name']) ?></p>
          <p class="search-sub">
            <?= e((string) $ticket['event_name']) ?> · <?= e((string) ($ticket['ticket_type'] ?? 'Standard')) ?>
            <?= $ticket['safety_status'] !== 'clear' ? ' · <span style="color:#f87171">⚠ Sicherheit</span>' : '' ?>
          </p>
        </div>

        <div class="search-status-col">
          <span class="status-pill <?= $pillClass ?>"><?= e($statusLabel) ?></span>
          <?php if ($canCheckin): ?>
            <button class="checkin-quick-btn"
              onclick="quickCheckin(<?= (int) $ticket['id'] ?>, this)"
              data-ticket="<?= (int) $ticket['id'] ?>">
              Einchecken
            </button>
          <?php elseif ($ticket['status'] === 'checked_in'): ?>
            <span style="font-size:11px;color:#6e6660"><?= e(substr((string) $ticket['checked_in_at'], 0, 16)) ?></span>
          <?php endif; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</main>

<div class="toast" id="toast"></div>

<script>
const CSRF = <?= json_encode($csrfToken) ?>;
const DEFAULT_LOC = <?= json_encode($defaultLocation) ?>;

async function quickCheckin(ticketId, btn) {
  btn.disabled = true;
  btn.textContent = '...';
  try {
    const res = await fetch('/api/checkin/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF },
      body: JSON.stringify({ ticket_id: ticketId, location: DEFAULT_LOC, device: 'search', csrf_token: CSRF })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Einlass bestätigt!', 'success');
      // Status-Pill aktualisieren
      const item = document.getElementById('item-' + ticketId);
      const pill = item?.querySelector('.status-pill');
      if (pill) { pill.textContent = 'Eingecheckt'; pill.className = 'status-pill pill-checked_in'; }
      btn.textContent = '✓';
      btn.style.background = 'rgba(74,222,128,.2)';
      btn.style.color = '#4ade80';
    } else {
      showToast(data.message || 'Fehler', 'error');
      btn.disabled = false;
      btn.textContent = 'Einchecken';
    }
  } catch (e) {
    showToast('Netzwerkfehler', 'error');
    btn.disabled = false;
    btn.textContent = 'Einchecken';
  }
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast visible' + (type === 'success' ? ' success-toast' : type === 'error' ? ' error-toast' : type === 'warn' ? ' warn-toast' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.className = 'toast', 3000);
}
</script>

<?php render_footer(); ?>
