<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/checkin-data.php';

$user = require_login();
$role = hotmess_checkin_require_access($user);

$stats = hotmess_checkin_admin_stats();

render_header('Check-In Hub | HOTMESS');
?>
<style>
  .checkin-hub{max-width:700px;margin:0 auto;padding:40px 20px 80px}
  .checkin-hub-hero{text-align:center;margin-bottom:40px}
  .checkin-hub-hero .eyebrow{font-size:11px;font-weight:800;letter-spacing:.22em;color:#d6b56d;text-transform:uppercase;margin:0 0 10px}
  .checkin-hub-hero h1{font-size:32px;font-weight:900;color:#fff;margin:0 0 8px}
  .checkin-hub-hero p{font-size:15px;color:#9f978a;margin:0}

  .checkin-kpi-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px;margin-bottom:36px}
  .checkin-kpi{background:#11100f;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:18px 16px;text-align:center}
  .checkin-kpi-value{font-size:28px;font-weight:900;color:#fff;margin:0 0 4px}
  .checkin-kpi-value.gold{color:#d6b56d}
  .checkin-kpi-label{font-size:11px;color:#6e6660;letter-spacing:.08em;text-transform:uppercase;font-weight:700}

  .checkin-nav-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:30px}
  .checkin-nav-card{background:#11100f;border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:24px 20px;text-decoration:none;display:block;transition:all .25s;position:relative;overflow:hidden}
  .checkin-nav-card:hover{border-color:rgba(214,181,109,.35);transform:translateY(-2px)}
  .checkin-nav-card-primary{background:linear-gradient(135deg,#1a1500,#231c00);border-color:rgba(214,181,109,.25)}
  .checkin-nav-card-primary:hover{border-color:rgba(214,181,109,.5)}
  .checkin-nav-icon{font-size:32px;margin-bottom:12px}
  .checkin-nav-title{font-size:17px;font-weight:900;color:#fff;margin:0 0 5px}
  .checkin-nav-sub{font-size:13px;color:#9f978a;margin:0}
  .checkin-nav-arrow{position:absolute;bottom:20px;right:20px;color:#d6b56d;font-size:18px}

  .checkin-events-section{background:#11100f;border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:22px}
  .checkin-events-section h3{font-size:14px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#9f978a;margin:0 0 16px}
  .checkin-event-row{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05)}
  .checkin-event-row:last-child{border-bottom:none}
  .checkin-event-name{font-size:14px;font-weight:700;color:#f7f2ea}
  .checkin-event-count{font-size:20px;font-weight:900;color:#d6b56d}
  .checkin-event-label{font-size:11px;color:#6e6660}

  @media(max-width:480px){
    .checkin-nav-grid{grid-template-columns:1fr}
    .checkin-hub-hero h1{font-size:26px}
  }
</style>

<main>
  <div class="checkin-hub">
    <div class="checkin-hub-hero">
      <p class="eyebrow">Check-In System</p>
      <h1>HOTMESS Einlass</h1>
      <p>Scanner, Suche, Verlauf und Einstellungen.</p>
    </div>

    <div class="checkin-kpi-row">
      <div class="checkin-kpi">
        <div class="checkin-kpi-value gold"><?= $stats['today'] ?></div>
        <div class="checkin-kpi-label">Heute</div>
      </div>
      <div class="checkin-kpi">
        <div class="checkin-kpi-value"><?= $stats['vip_today'] ?></div>
        <div class="checkin-kpi-label">VIP heute</div>
      </div>
      <div class="checkin-kpi">
        <div class="checkin-kpi-value"><?= $stats['black_today'] ?></div>
        <div class="checkin-kpi-label">Black Member</div>
      </div>
      <div class="checkin-kpi">
        <div class="checkin-kpi-value"><?= $stats['duplicates'] ?></div>
        <div class="checkin-kpi-label">Doppelscans</div>
      </div>
    </div>

    <div class="checkin-nav-grid">
      <a href="/checkin/scanner" class="checkin-nav-card checkin-nav-card-primary">
        <div class="checkin-nav-icon">📷</div>
        <h2 class="checkin-nav-title">QR Scanner</h2>
        <p class="checkin-nav-sub">Kamera starten und Tickets scannen</p>
        <span class="checkin-nav-arrow">→</span>
      </a>
      <a href="/checkin/search" class="checkin-nav-card">
        <div class="checkin-nav-icon">🔍</div>
        <h2 class="checkin-nav-title">Suche</h2>
        <p class="checkin-nav-sub">Name, E-Mail oder Ticketnummer</p>
        <span class="checkin-nav-arrow">→</span>
      </a>
      <a href="/checkin/history" class="checkin-nav-card">
        <div class="checkin-nav-icon">📋</div>
        <h2 class="checkin-nav-title">Verlauf</h2>
        <p class="checkin-nav-sub">Alle Check-Ins dieser Session</p>
        <span class="checkin-nav-arrow">→</span>
      </a>
      <?php if (hotmess_checkin_can_manage($role)): ?>
        <a href="/admin/checkin" class="checkin-nav-card">
          <div class="checkin-nav-icon">⚙️</div>
          <h2 class="checkin-nav-title">Admin</h2>
          <p class="checkin-nav-sub">Stats, Einstellungen, Staff</p>
          <span class="checkin-nav-arrow">→</span>
        </a>
      <?php endif; ?>
    </div>

    <?php if (!empty($stats['events_today'])): ?>
      <div class="checkin-events-section">
        <h3>Heute aktive Events</h3>
        <?php foreach ($stats['events_today'] as $ev): ?>
          <div class="checkin-event-row">
            <div class="checkin-event-name"><?= e((string) $ev['event_name']) ?></div>
            <div style="text-align:right">
              <div class="checkin-event-count"><?= (int) $ev['checkins'] ?></div>
              <div class="checkin-event-label">Check-Ins</div>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</main>

<?php render_footer(); ?>
