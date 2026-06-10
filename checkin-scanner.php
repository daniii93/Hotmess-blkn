<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/checkin-data.php';

$user = require_login();
$role = hotmess_checkin_require_access($user);
$settings = hotmess_checkin_settings();
$csrfToken = csrf_token();
$defaultLocation = $settings['default_location'] ?? 'Haupteingang';

render_header('Check-In Scanner | HOTMESS');
?>
<style>
  .scanner-page{background:#080706;min-height:100vh;padding:0;overflow-x:hidden}
  .scanner-topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:#11100f;border-bottom:1px solid rgba(214,181,109,.15);position:sticky;top:0;z-index:100}
  .scanner-topbar-left{display:flex;align-items:center;gap:10px}
  .scanner-topbar-logo{font-size:13px;font-weight:900;letter-spacing:.2em;color:#d6b56d}
  .scanner-topbar-title{font-size:14px;font-weight:700;color:#f7f2ea}
  .scanner-topbar-role{font-size:11px;padding:3px 9px;border-radius:999px;background:rgba(214,181,109,.12);color:#d6b56d;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
  .scanner-topbar-nav{display:flex;gap:8px}
  .scanner-topbar-nav a{font-size:12px;color:#9f978a;text-decoration:none;padding:6px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.08);transition:all .2s}
  .scanner-topbar-nav a:hover{color:#f7f2ea;border-color:rgba(214,181,109,.3)}

  .scanner-body{max-width:540px;margin:0 auto;padding:20px 16px 80px}

  /* Kamera */
  .scanner-viewport{position:relative;border-radius:20px;overflow:hidden;background:#000;aspect-ratio:1;margin:0 auto 20px;max-width:420px;border:2px solid rgba(214,181,109,.25)}
  #scanner-video{width:100%;height:100%;object-fit:cover;display:block}
  .scanner-overlay{position:absolute;inset:0;pointer-events:none}
  .scanner-frame{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:55%;height:55%;border:2px solid #d6b56d;border-radius:14px;box-shadow:0 0 0 9999px rgba(0,0,0,.45)}
  .scanner-frame::before,.scanner-frame::after{content:'';position:absolute;width:22px;height:22px;border-color:#d6b56d;border-style:solid}
  .scanner-frame::before{top:-2px;left:-2px;border-width:3px 0 0 3px;border-radius:4px 0 0 0}
  .scanner-frame::after{bottom:-2px;right:-2px;border-width:0 3px 3px 0;border-radius:0 0 4px 0}
  .scanner-corner-tr{position:absolute;top:-2px;right:-2px;width:22px;height:22px;border:3px solid #d6b56d;border-width:3px 3px 0 0;border-radius:0 4px 0 0}
  .scanner-corner-bl{position:absolute;bottom:-2px;left:-2px;width:22px;height:22px;border:3px solid #d6b56d;border-width:0 0 3px 3px;border-radius:0 0 4px 0}
  .scanner-laser{position:absolute;left:22%;right:22%;height:2px;background:linear-gradient(90deg,transparent,#d6b56d,transparent);animation:laser 1.8s ease-in-out infinite;box-shadow:0 0 12px #d6b56d}
  @keyframes laser{0%,100%{top:22%}50%{top:78%}}
  .scanner-status{position:absolute;bottom:12px;left:0;right:0;text-align:center;font-size:12px;font-weight:700;color:#d6b56d;letter-spacing:.12em;text-transform:uppercase}
  .scanner-start-btn{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(0,0,0,.7);cursor:pointer;border:none;width:100%;font-family:inherit}
  .scanner-start-btn svg{width:52px;height:52px;color:#d6b56d}
  .scanner-start-btn span{color:#f7f2ea;font-size:15px;font-weight:700}

  /* Controls */
  .scanner-controls{display:flex;gap:10px;margin-bottom:18px}
  .scanner-control-btn{flex:1;padding:12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#d9d2c6;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:7px}
  .scanner-control-btn:hover{background:rgba(214,181,109,.1);border-color:rgba(214,181,109,.3);color:#d6b56d}
  .scanner-control-btn.active{background:rgba(214,181,109,.15);border-color:rgba(214,181,109,.4);color:#d6b56d}

  /* Standort */
  .scanner-location{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px 16px;margin-bottom:18px;display:flex;align-items:center;gap:10px}
  .scanner-location label{font-size:11px;font-weight:700;letter-spacing:.12em;color:#9f978a;text-transform:uppercase;white-space:nowrap}
  .scanner-location input{flex:1;background:transparent;border:none;color:#f7f2ea;font-size:14px;outline:none;min-width:0}
  .scanner-location input::placeholder{color:#6e6660}

  /* Manuelle Suche */
  .scanner-manual{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px 16px;margin-bottom:20px}
  .scanner-manual-label{font-size:11px;font-weight:700;letter-spacing:.12em;color:#9f978a;text-transform:uppercase;margin-bottom:10px}
  .scanner-manual-row{display:flex;gap:8px}
  .scanner-manual-input{flex:1;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 14px;color:#f7f2ea;font-size:14px;outline:none;transition:border-color .2s}
  .scanner-manual-input:focus{border-color:rgba(214,181,109,.5)}
  .scanner-manual-btn{padding:10px 16px;border-radius:10px;background:#d6b56d;color:#11100f;font-weight:800;font-size:13px;cursor:pointer;border:none;transition:opacity .2s}
  .scanner-manual-btn:hover{opacity:.85}

  /* Ergebnis-Card */
  .result-card{border-radius:20px;overflow:hidden;margin-bottom:20px;display:none;animation:slideUp .3s ease}
  .result-card.visible{display:block}
  @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  .result-header{padding:18px 20px;display:flex;align-items:center;gap:14px}
  .result-header.success{background:linear-gradient(135deg,#052015,#08301a)}
  .result-header.duplicate{background:linear-gradient(135deg,#1a1200,#261a00)}
  .result-header.cancelled{background:linear-gradient(135deg,#200505,#300808)}
  .result-header.not_found{background:linear-gradient(135deg,#160a00,#201200)}
  .result-avatar{width:60px;height:60px;border-radius:50%;object-fit:cover;flex-shrink:0;background:#1a1a1a}
  .result-avatar-placeholder{width:60px;height:60px;border-radius:50%;flex-shrink:0;background:rgba(214,181,109,.1);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#d6b56d}
  .result-main{flex:1;min-width:0}
  .result-name{font-size:18px;font-weight:900;color:#fff;margin:0 0 3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .result-sub{font-size:13px;color:#9f978a;margin:0 0 6px}
  .result-status-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:800;letter-spacing:.08em}
  .badge-success{background:rgba(74,222,128,.15);color:#4ade80;border:1px solid rgba(74,222,128,.3)}
  .badge-duplicate{background:rgba(251,191,36,.12);color:#fbbf24;border:1px solid rgba(251,191,36,.25)}
  .badge-cancelled{background:rgba(248,113,113,.12);color:#f87171;border:1px solid rgba(248,113,113,.25)}
  .badge-not_found{background:rgba(248,113,113,.12);color:#f87171;border:1px solid rgba(248,113,113,.25)}
  .result-icon{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:22px}
  .result-icon.success{background:rgba(74,222,128,.15)}
  .result-icon.duplicate{background:rgba(251,191,36,.12)}
  .result-icon.cancelled,.result-icon.not_found{background:rgba(248,113,113,.12)}

  .result-body{padding:16px 20px;background:rgba(0,0,0,.4)}
  .result-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
  .result-meta-item{background:rgba(255,255,255,.04);border-radius:10px;padding:10px 12px}
  .result-meta-label{font-size:10px;font-weight:700;letter-spacing:.12em;color:#6e6660;text-transform:uppercase;margin:0 0 3px}
  .result-meta-value{font-size:14px;font-weight:700;color:#f7f2ea;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .result-meta-value.highlight{color:#d6b56d}
  .result-meta-value.vip{color:#f2d28f}

  .result-badges-row{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px}
  .tag{padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.06em}
  .tag-gold{background:rgba(214,181,109,.15);color:#d6b56d;border:1px solid rgba(214,181,109,.3)}
  .tag-vip{background:rgba(242,210,143,.15);color:#f2d28f;border:1px solid rgba(242,210,143,.3)}
  .tag-black{background:rgba(200,200,220,.1);color:#c8c8dc;border:1px solid rgba(200,200,220,.2)}
  .tag-ambassador{background:rgba(138,43,226,.15);color:#c084fc;border:1px solid rgba(138,43,226,.25)}
  .tag-loyalty{background:rgba(96,165,250,.1);color:#60a5fa;border:1px solid rgba(96,165,250,.2)}
  .tag-warn{background:rgba(248,113,113,.1);color:#f87171;border:1px solid rgba(248,113,113,.2)}

  .security-alert{padding:12px 14px;border-radius:12px;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.25);margin-bottom:14px}
  .security-alert-title{font-size:11px;font-weight:800;letter-spacing:.12em;color:#f87171;text-transform:uppercase;margin:0 0 5px}
  .security-alert-text{font-size:13px;color:#fca5a5;margin:0}

  .result-confirm-btn{width:100%;padding:15px;border-radius:14px;background:#d6b56d;color:#11100f;font-size:16px;font-weight:900;cursor:pointer;border:none;transition:all .2s;letter-spacing:.05em}
  .result-confirm-btn:hover{background:#f2d28f}
  .result-confirm-btn:disabled{opacity:.4;cursor:not-allowed}
  .result-confirm-btn.confirmed{background:rgba(74,222,128,.2);color:#4ade80;border:2px solid rgba(74,222,128,.3)}

  /* Toast */
  .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);background:#11100f;border:1px solid rgba(214,181,109,.3);border-radius:14px;padding:14px 22px;font-size:14px;font-weight:700;color:#f7f2ea;z-index:9999;opacity:0;transition:all .3s;pointer-events:none;max-width:90vw;text-align:center}
  .toast.visible{opacity:1;transform:translateX(-50%) translateY(0)}
  .toast.success-toast{border-color:rgba(74,222,128,.4);color:#4ade80}
  .toast.error-toast{border-color:rgba(248,113,113,.4);color:#f87171}
  .toast.warn-toast{border-color:rgba(251,191,36,.4);color:#fbbf24}

  #canvas-hidden{display:none}

  @media(max-width:480px){
    .scanner-topbar-nav a{display:none}
    .result-meta-grid{grid-template-columns:1fr}
  }
</style>

<div class="scanner-page">
  <div class="scanner-topbar">
    <div class="scanner-topbar-left">
      <span class="scanner-topbar-logo">HOTMESS</span>
      <span class="scanner-topbar-title">Check-In Scanner</span>
      <span class="scanner-topbar-role"><?= e($role) ?></span>
    </div>
    <nav class="scanner-topbar-nav">
      <a href="/checkin/search">Suche</a>
      <a href="/checkin/history">Verlauf</a>
      <?php if (hotmess_checkin_can_manage($role)): ?>
        <a href="/admin/checkin">Admin</a>
      <?php endif; ?>
    </nav>
  </div>

  <div class="scanner-body">

    <!-- Kamera-Viewport -->
    <div class="scanner-viewport" id="scanner-viewport">
      <video id="scanner-video" playsinline muted autoplay></video>
      <canvas id="canvas-hidden"></canvas>
      <div class="scanner-overlay">
        <div class="scanner-frame">
          <div class="scanner-corner-tr"></div>
          <div class="scanner-corner-bl"></div>
          <div class="scanner-laser" id="scanner-laser"></div>
        </div>
        <div class="scanner-status" id="scanner-status">Bereit</div>
      </div>
      <button class="scanner-start-btn" id="scanner-start-btn" onclick="startCamera()">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span>Kamera aktivieren</span>
      </button>
    </div>

    <!-- Kamera-Controls -->
    <div class="scanner-controls">
      <button class="scanner-control-btn" onclick="toggleTorch()" id="torch-btn">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
        </svg>
        Licht
      </button>
      <button class="scanner-control-btn" onclick="switchCamera()" id="camera-switch-btn">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        Kamera
      </button>
      <button class="scanner-control-btn" id="pause-btn" onclick="togglePause()">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Pause
      </button>
    </div>

    <!-- Standort -->
    <div class="scanner-location">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="16" height="16" style="color:#d6b56d;flex-shrink:0">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      <label for="location-input">Standort</label>
      <input type="text" id="location-input" placeholder="<?= e($defaultLocation) ?>" value="<?= e($defaultLocation) ?>">
    </div>

    <!-- Manuelle Eingabe -->
    <div class="scanner-manual">
      <p class="scanner-manual-label">Manuelle Eingabe</p>
      <div class="scanner-manual-row">
        <input type="text" class="scanner-manual-input" id="manual-input" placeholder="Ticketnummer oder QR-Code..." autocomplete="off">
        <button class="scanner-manual-btn" onclick="manualLookup()">Suchen</button>
      </div>
    </div>

    <!-- Ergebnis Card -->
    <div class="result-card" id="result-card"></div>

  </div>
</div>

<div class="toast" id="toast"></div>

<script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js"></script>
<script>
const CSRF = <?= json_encode($csrfToken) ?>;
const DEFAULT_LOCATION = <?= json_encode($defaultLocation) ?>;

let stream = null;
let scanning = false;
let paused = false;
let torchOn = false;
let facingMode = 'environment';
let rafId = null;
let lastScanned = '';
let lastScannedAt = 0;
let currentTicketId = null;
let confirming = false;

const video = document.getElementById('scanner-video');
const canvas = document.getElementById('canvas-hidden');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const statusEl = document.getElementById('scanner-status');
const startBtn = document.getElementById('scanner-start-btn');
const resultCard = document.getElementById('result-card');

async function startCamera() {
  try {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1280 }, focusMode: 'continuous' }
    });
    video.srcObject = stream;
    await video.play();
    startBtn.style.display = 'none';
    scanning = true;
    paused = false;
    statusEl.textContent = 'Scannen...';
    scanLoop();
  } catch (err) {
    showToast('Kamerazugriff verweigert: ' + err.message, 'error');
  }
}

function scanLoop() {
  if (!scanning) return;
  if (!paused && video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
    if (code && code.data) {
      const now = Date.now();
      if (code.data !== lastScanned || now - lastScannedAt > 4000) {
        lastScanned = code.data;
        lastScannedAt = now;
        onQrDetected(code.data);
      }
    }
  }
  rafId = requestAnimationFrame(scanLoop);
}

async function onQrDetected(qrData) {
  paused = true;
  statusEl.textContent = 'Erkannt — lädt...';
  document.getElementById('scanner-laser').style.animation = 'none';
  await lookupTicket(qrData);
}

async function manualLookup() {
  const input = document.getElementById('manual-input');
  const val = input.value.trim();
  if (!val) return;
  paused = true;
  await lookupTicket(val);
}

async function lookupTicket(qrOrCode) {
  try {
    const res = await fetch('/api/checkin/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF },
      body: JSON.stringify({ qr: qrOrCode })
    });
    const data = await res.json();
    renderResult(data);
  } catch (err) {
    showToast('Netzwerkfehler: ' + err.message, 'error');
    resumeScanner();
  }
}

function renderResult(data) {
  currentTicketId = null;
  resultCard.classList.add('visible');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  if (!data.success && data.status === 'not_found') {
    resultCard.innerHTML = buildNotFound();
    return;
  }

  if (!data.success) {
    resultCard.innerHTML = buildNotFound();
    return;
  }

  const { ticket, member } = data;
  currentTicketId = ticket.id;
  const status = ticket.status;

  let headerClass = 'success';
  let badgeClass = 'badge-success';
  let badgeLabel = '✓ Einlass möglich';
  let iconContent = '✓';
  let iconClass = 'success';

  if (status === 'checked_in') {
    headerClass = 'duplicate';
    badgeClass = 'badge-duplicate';
    badgeLabel = '⚠ Bereits eingecheckt';
    iconContent = '⚠';
    iconClass = 'duplicate';
  } else if (status === 'cancelled') {
    headerClass = 'cancelled';
    badgeClass = 'badge-cancelled';
    badgeLabel = '✕ Storniert';
    iconContent = '✕';
    iconClass = 'cancelled';
  }

  const isVip = (ticket.ticket_type || '').toLowerCase().includes('vip');
  const isBlack = member.member_tier === 'black';
  const isAmbassador = !!member.ambassador;

  const tags = [];
  if (isVip) tags.push(`<span class="tag tag-vip">VIP</span>`);
  if (isBlack) tags.push(`<span class="tag tag-black">Black Member</span>`);
  if (member.member_tier === 'plus') tags.push(`<span class="tag tag-gold">Plus Member</span>`);
  if (isAmbassador) tags.push(`<span class="tag tag-ambassador">Ambassador ${member.ambassador.role || ''}</span>`);
  if (member.loyalty) {
    const tierLabel = { bronze: 'Bronze', silver: 'Silver', gold: 'Gold', black: 'Loyalty Black' }[member.loyalty.tier] || member.loyalty.tier;
    tags.push(`<span class="tag tag-loyalty">${tierLabel}</span>`);
  }
  if (member.security) {
    tags.push(`<span class="tag tag-warn">⚠ Sicherheitshinweis</span>`);
  }

  const avatarHtml = member.profile_photo
    ? `<img src="${escHtml(member.profile_photo)}" class="result-avatar" alt="">`
    : `<div class="result-avatar-placeholder">${escHtml(member.name.charAt(0).toUpperCase())}</div>`;

  const securityBlock = member.security ? `
    <div class="security-alert">
      <p class="security-alert-title">⚠ Sicherheitshinweis</p>
      <p class="security-alert-text">
        Status: ${escHtml(member.security.safety_status)}
        ${member.security.ban_reason ? ' · ' + escHtml(member.security.ban_reason) : ''}
        ${member.security.mod_notes ? '<br>' + escHtml(member.security.mod_notes) : ''}
      </p>
    </div>` : '';

  const checkinInfo = (status === 'checked_in' && ticket.last_checkin) ? `
    <div style="background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.2);border-radius:12px;padding:12px 14px;margin-bottom:14px;font-size:13px;color:#fbbf24;">
      Zuletzt eingecheckt: ${escHtml(ticket.last_checkin.checked_in_at || '')}
      ${ticket.last_checkin.scanner_name ? ' von ' + escHtml(ticket.last_checkin.scanner_name) : ''}
      ${ticket.last_checkin.checkin_location ? ' · ' + escHtml(ticket.last_checkin.checkin_location) : ''}
    </div>` : '';

  const confirmBtnDisabled = (status === 'checked_in' || status === 'cancelled') ? 'disabled' : '';
  const confirmBtnLabel = status === 'checked_in' ? 'Bereits eingecheckt' : status === 'cancelled' ? 'Storniert' : 'Einlass bestätigen';

  resultCard.innerHTML = `
    <div class="result-header ${headerClass}">
      ${avatarHtml}
      <div class="result-main">
        <p class="result-name">${escHtml(member.name)}</p>
        <p class="result-sub">${escHtml(ticket.event_name)}${member.age ? ' · ' + member.age + ' Jahre' : ''}${member.city ? ' · ' + escHtml(member.city) : ''}</p>
        <span class="result-status-badge ${badgeClass}">${badgeLabel}</span>
      </div>
      <div class="result-icon ${iconClass}">${iconContent}</div>
    </div>
    <div class="result-body">
      ${securityBlock}
      ${checkinInfo}
      <div class="result-badges-row">${tags.join('')}</div>
      <div class="result-meta-grid">
        <div class="result-meta-item">
          <p class="result-meta-label">Ticket</p>
          <p class="result-meta-value">${escHtml(ticket.ticket_type || 'Standard')}</p>
        </div>
        <div class="result-meta-item">
          <p class="result-meta-label">Ticket-Nr.</p>
          <p class="result-meta-value">${escHtml(ticket.ticket_number || '')}</p>
        </div>
        ${member.loyalty ? `
        <div class="result-meta-item">
          <p class="result-meta-label">Loyalty Punkte</p>
          <p class="result-meta-value highlight">${member.loyalty.balance.toLocaleString('de')}</p>
        </div>` : ''}
        ${member.ambassador ? `
        <div class="result-meta-item">
          <p class="result-meta-label">Ambassador</p>
          <p class="result-meta-value highlight">${escHtml(member.ambassador.role)}${member.ambassador.city ? ', ' + escHtml(member.ambassador.city) : ''}</p>
        </div>` : ''}
      </div>
      <button class="result-confirm-btn" id="confirm-btn" ${confirmBtnDisabled} onclick="confirmCheckin()">
        ${confirmBtnLabel}
      </button>
      <button onclick="resetScanner()" style="width:100%;margin-top:10px;padding:12px;border-radius:14px;background:transparent;border:1px solid rgba(255,255,255,.1);color:#9f978a;font-size:13px;font-weight:700;cursor:pointer;">
        Weiter scannen
      </button>
    </div>`;
}

function buildNotFound() {
  return `
    <div class="result-header not_found">
      <div class="result-avatar-placeholder">?</div>
      <div class="result-main">
        <p class="result-name">Ticket nicht gefunden</p>
        <p class="result-sub">Dieser QR-Code ist ungültig oder nicht im System.</p>
        <span class="result-status-badge badge-not_found">✕ Ungültig</span>
      </div>
    </div>
    <div class="result-body">
      <button onclick="resetScanner()" style="width:100%;padding:14px;border-radius:14px;background:transparent;border:1px solid rgba(255,255,255,.1);color:#9f978a;font-size:13px;font-weight:700;cursor:pointer;margin-top:4px;">
        Erneut scannen
      </button>
    </div>`;
}

async function confirmCheckin() {
  if (confirming || !currentTicketId) return;
  confirming = true;
  const btn = document.getElementById('confirm-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Bestätige...'; }

  const location = document.getElementById('location-input').value.trim() || DEFAULT_LOCATION;
  const device = navigator.userAgent.substring(0, 120);

  try {
    const res = await fetch('/api/checkin/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': CSRF },
      body: JSON.stringify({ ticket_id: currentTicketId, location, device, csrf_token: CSRF })
    });
    const data = await res.json();

    if (data.success) {
      if (btn) { btn.classList.add('confirmed'); btn.textContent = '✓ Eingecheckt'; }
      showToast('Einlass bestätigt!', 'success');
      setTimeout(resetScanner, 2200);
    } else if (data.status === 'duplicate') {
      showToast('Ticket bereits eingecheckt', 'warn');
      if (btn) { btn.textContent = 'Bereits eingecheckt'; }
    } else {
      showToast(data.message || 'Fehler beim Einchecken', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Einlass bestätigen'; }
    }
  } catch (err) {
    showToast('Netzwerkfehler', 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Einlass bestätigen'; }
  }
  confirming = false;
}

function resetScanner() {
  resultCard.classList.remove('visible');
  resultCard.innerHTML = '';
  currentTicketId = null;
  confirming = false;
  lastScanned = '';
  resumeScanner();
}

function resumeScanner() {
  paused = false;
  statusEl.textContent = 'Scannen...';
  document.getElementById('scanner-laser').style.animation = '';
  if (!scanning && stream) {
    scanning = true;
    scanLoop();
  }
}

function togglePause() {
  paused = !paused;
  const btn = document.getElementById('pause-btn');
  statusEl.textContent = paused ? 'Pausiert' : 'Scannen...';
  btn.classList.toggle('active', paused);
  btn.querySelector('span') && (btn.querySelector('span').textContent = paused ? 'Fortsetzen' : 'Pause');
}

async function toggleTorch() {
  if (!stream) return;
  const track = stream.getVideoTracks()[0];
  if (!track) return;
  try {
    torchOn = !torchOn;
    await track.applyConstraints({ advanced: [{ torch: torchOn }] });
    document.getElementById('torch-btn').classList.toggle('active', torchOn);
  } catch (e) {
    showToast('Torch nicht verfügbar', 'error');
    torchOn = false;
  }
}

async function switchCamera() {
  facingMode = facingMode === 'environment' ? 'user' : 'environment';
  scanning = false;
  if (rafId) cancelAnimationFrame(rafId);
  await startCamera();
}

function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast visible' + (type === 'success' ? ' success-toast' : type === 'error' ? ' error-toast' : type === 'warn' ? ' warn-toast' : '');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.className = 'toast'; }, 3000);
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Auto-Start auf Mobilgeräten
if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
  window.addEventListener('load', () => setTimeout(startCamera, 400));
}
</script>

<?php render_footer(); ?>
