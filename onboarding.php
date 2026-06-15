<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/account-data.php';
require_once __DIR__ . '/app/analytics.php';

$user = require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $step = (string) ($_POST['step'] ?? '');

    if ($step === 'profile') {
        hotmess_profile_save($user, $_POST, $_FILES);
        hotmess_track(ANALYTICS_ONBOARDING_STEP, ['step' => 'profile'], (int) $user['id']);
        redirect('/onboarding?step=photo&done=profile');
    }

    if ($step === 'interests') {
        hotmess_profile_save($user, array_merge($_POST, [
            'name' => $user['name'],
            'city' => $user['city'] ?? '',
        ]), []);
        hotmess_track(ANALYTICS_ONBOARDING_STEP, ['step' => 'interests'], (int) $user['id']);
        redirect('/onboarding?step=referral&done=interests');
    }
}

$step = (string) ($_GET['step'] ?? 'profile');
$allowedSteps = ['profile', 'photo', 'interests', 'cities', 'referral', 'events', 'done'];
if (!in_array($step, $allowedSteps, true)) {
    $step = 'profile';
}

$stmt = db()->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
$stmt->execute([(int) $user['id']]);
$freshUser = $stmt->fetch() ?: $user;

hotmess_user_ensure_columns();
$progress = hotmess_account_onboarding_progress($freshUser);

$stepLabels = [
    'profile' => 'Name & Stadt',
    'photo' => 'Profilfoto',
    'interests' => 'Interessen',
    'cities' => 'Lieblingstädte',
    'referral' => 'Einladungscode',
    'events' => 'Feed öffnen',
];
$stepOrder = array_keys($stepLabels);
$currentIndex = array_search($step, $stepOrder, true);

try {
    $referralCode = hotmess_referral_code_for_user((int) $user['id']);
} catch (Throwable) {
    $referralCode = '';
}
$inviteUrl = defined('APP_URL') ? APP_URL . '/referral?code=' . urlencode((string) $referralCode) : '';

require_once __DIR__ . '/app/events-data.php';
$events = array_slice(hotmess_public_events(), 0, 6);

render_header('Willkommen bei HOTMESS');
?>

<main class="account-concierge-page" style="max-width:680px;margin:0 auto;padding:2rem 1rem">

  <section style="text-align:center;margin-bottom:2rem">
    <p class="eyebrow">Willkommen</p>
    <h1>Richte dein Profil ein</h1>
    <p style="opacity:.7">Schritt <?= (int) $currentIndex + 1 ?> von <?= count($stepLabels) ?></p>
  </section>

  <nav style="display:flex;gap:.4rem;margin-bottom:2rem;overflow-x:auto;padding-bottom:.25rem">
    <?php foreach ($stepOrder as $idx => $s): ?>
      <?php
        $isDone = $idx < $currentIndex;
        $isCurrent = $s === $step;
        $bg = $isCurrent ? '#1a1a1a' : ($isDone ? '#2e7d32' : 'transparent');
        $color = ($isCurrent || $isDone) ? '#fff' : 'inherit';
        $border = $isCurrent ? '#1a1a1a' : ($isDone ? '#2e7d32' : 'rgba(0,0,0,.2)');
      ?>
      <a href="/onboarding?step=<?= e($s) ?>"
         style="flex:1;min-width:90px;text-align:center;padding:.4rem .6rem;border-radius:6px;font-size:.8rem;border:1px solid <?= e($border) ?>;background:<?= e($bg) ?>;color:<?= e($color) ?>;text-decoration:none;white-space:nowrap">
        <?= $isDone ? '✓ ' : '' ?><?= e($stepLabels[$s]) ?>
      </a>
    <?php endforeach; ?>
  </nav>

  <div style="background:var(--color-background-secondary,#f5f5f5);border-radius:8px;height:6px;margin-bottom:2rem;overflow:hidden">
    <div style="height:6px;background:#1a1a1a;width:<?= e((string) $progress['percent']) ?>%;transition:width .4s ease"></div>
  </div>

  <?php if ($step === 'profile'): ?>
    <article class="premium-card">
      <h2>Name & Stadt</h2>
      <p style="opacity:.7;margin-bottom:1.5rem">Wie sollen wir dich nennen? Wo bist du zuhause?</p>
      <form method="post" enctype="multipart/form-data">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
        <input type="hidden" name="step" value="profile">
        <div style="display:grid;gap:1rem">
          <label class="account-lux-form">Vorname / Name
            <input name="name" value="<?= e((string) ($freshUser['name'] ?? '')) ?>" required>
          </label>
          <label class="account-lux-form">Stadt
            <input name="city" value="<?= e((string) ($freshUser['city'] ?? '')) ?>" placeholder="z. B. Wien, Innsbruck, München">
          </label>
          <label class="account-lux-form">Geburtstag
            <input type="date" name="birthday" value="<?= e((string) ($freshUser['birthday'] ?? '')) ?>">
          </label>
          <button class="button primary" type="submit" style="width:100%">Weiter →</button>
        </div>
      </form>
    </article>

  <?php elseif ($step === 'photo'): ?>
    <article class="premium-card" style="text-align:center">
      <h2>Profilfoto</h2>
      <p style="opacity:.7;margin-bottom:1.5rem">Dein Foto ist nur für andere Passport-Mitglieder sichtbar.</p>
      <?php if (!empty($freshUser['profile_photo'])): ?>
        <img src="<?= e((string) $freshUser['profile_photo']) ?>" alt="Profilfoto" style="width:100px;height:100px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 1rem">
        <p style="color:#2e7d32;margin-bottom:1rem">Foto hinterlegt ✓</p>
      <?php endif; ?>
      <form method="post" enctype="multipart/form-data" style="display:flex;flex-direction:column;gap:1rem;align-items:center">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
        <input type="hidden" name="step" value="profile">
        <input type="hidden" name="name" value="<?= e((string) ($freshUser['name'] ?? '')) ?>">
        <input type="hidden" name="city" value="<?= e((string) ($freshUser['city'] ?? '')) ?>">
        <label style="cursor:pointer;padding:.75rem 1.5rem;border:1px dashed rgba(0,0,0,.3);border-radius:8px;width:100%;text-align:center">
          Foto auswählen
          <input type="file" name="profilePhoto" accept="image/jpeg,image/png,image/webp" style="display:none">
        </label>
        <button class="button primary" type="submit" style="width:100%">Foto speichern & weiter →</button>
      </form>
      <a href="/onboarding?step=interests" style="display:block;margin-top:1rem;opacity:.6;font-size:.9rem">Überspringen</a>
    </article>

  <?php elseif ($step === 'interests'): ?>
    <article class="premium-card">
      <h2>Interessen & Lieblingstädte</h2>
      <p style="opacity:.7;margin-bottom:1.5rem">Hilf uns, die richtigen Empfehlungen für dich zu finden.</p>
      <form method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
        <input type="hidden" name="step" value="interests">
        <div style="display:grid;gap:1rem">
          <div>
            <p style="font-size:.85rem;opacity:.7;margin-bottom:.5rem">Schnellauswahl Interessen:</p>
            <div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.75rem" id="interest-chips">
              <?php foreach (['Signature Nights', 'VIP Tables', 'Hotels', 'Community Brunch', 'Aftermovies', 'City Weekends', 'Concerts', 'Networking', 'Wellness', 'Fine Dining'] as $tag): ?>
                <button type="button" onclick="toggleChip(this,'interests-input')"
                  style="padding:.3rem .8rem;border:1px solid rgba(0,0,0,.2);border-radius:20px;font-size:.8rem;cursor:pointer;background:transparent">
                  <?= e($tag) ?>
                </button>
              <?php endforeach; ?>
            </div>
            <label class="account-lux-form">Interessen (kommagetrennt)
              <textarea id="interests-input" name="interests" rows="2"><?= e(implode(', ', json_decode((string) ($freshUser['interests'] ?? ''), true) ?: [])) ?></textarea>
            </label>
          </div>
          <div>
            <p style="font-size:.85rem;opacity:.7;margin-bottom:.5rem">Lieblingstädte:</p>
            <div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.75rem">
              <?php foreach (['Wien', 'Innsbruck', 'Salzburg', 'Zürich', 'München', 'Berlin', 'Dubrovnik', 'Mailand', 'Barcelona', 'Amsterdam'] as $city): ?>
                <button type="button" onclick="toggleChip(this,'cities-input')"
                  style="padding:.3rem .8rem;border:1px solid rgba(0,0,0,.2);border-radius:20px;font-size:.8rem;cursor:pointer;background:transparent">
                  <?= e($city) ?>
                </button>
              <?php endforeach; ?>
            </div>
            <label class="account-lux-form">Bevorzugte Städte (kommagetrennt)
              <textarea id="cities-input" name="preferredCities" rows="2"><?= e(implode(', ', json_decode((string) ($freshUser['preferred_cities'] ?? ''), true) ?: [])) ?></textarea>
            </label>
          </div>
          <button class="button primary" type="submit" style="width:100%">Speichern & weiter →</button>
        </div>
      </form>
    </article>

  <?php elseif ($step === 'referral'): ?>
    <article class="premium-card" style="text-align:center">
      <h2>Dein persönlicher Einladungscode</h2>
      <p style="opacity:.7;margin-bottom:1.5rem">Teile ihn mit Freunden — für jede erfolgreiche Einladung erhältst du Loyalty-Punkte.</p>
      <?php if ($referralCode): ?>
        <div style="font-size:1.5rem;font-weight:700;letter-spacing:.15em;padding:1rem;background:rgba(0,0,0,.06);border-radius:8px;margin-bottom:1rem">
          <?= e((string) $referralCode) ?>
        </div>
        <?php if ($inviteUrl): ?>
          <p style="font-size:.85rem;opacity:.6;word-break:break-all;margin-bottom:1rem"><?= e($inviteUrl) ?></p>
        <?php endif; ?>
        <div style="display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap">
          <button class="button ghost" onclick="navigator.clipboard&&navigator.clipboard.writeText('<?= e((string) $referralCode) ?>').then(function(){this.textContent='Kopiert!'},function(){}).bind(this)">Code kopieren</button>
          <?php if ($inviteUrl): ?>
            <a class="button ghost" href="https://wa.me/?text=<?= urlencode('Ich lade dich zu HOTMESS ein: ' . $inviteUrl) ?>" target="_blank" rel="noopener">WhatsApp teilen</a>
          <?php endif; ?>
        </div>
      <?php else: ?>
        <p style="opacity:.6">Dein Referral-Code wird generiert...</p>
      <?php endif; ?>
      <a class="button primary" href="/onboarding?step=events" style="margin-top:1.5rem;display:inline-block">Erste Kontakte finden →</a>
    </article>

  <?php elseif ($step === 'events'): ?>
    <article class="premium-card">
      <h2>Feed öffnen</h2>
      <p style="opacity:.7;margin-bottom:1.5rem">Dein Profil ist bereit. Du kannst jetzt den Hotmess Feed öffnen oder später Events entdecken.</p>
      <div style="display:grid;gap:.75rem;margin-bottom:1.5rem">
        <?php foreach ($events as $event): ?>
          <a href="/events/<?= e($event['slug']) ?>"
             style="display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;border:1px solid rgba(0,0,0,.12);border-radius:8px;text-decoration:none;color:inherit">
            <div>
              <strong><?= e($event['title']) ?></strong>
              <p style="font-size:.8rem;opacity:.6;margin:.1rem 0 0"><?= e($event['city']) ?> · <?= e($event['startDate']) ?></p>
            </div>
            <span style="opacity:.4;font-size:1.2rem">→</span>
          </a>
        <?php endforeach; ?>
      </div>
      <a class="button primary" href="/feed" style="display:block;text-align:center">Feed öffnen →</a>
      <a href="/onboarding?step=done" style="display:block;margin-top:.75rem;text-align:center;opacity:.6;font-size:.9rem">Überspringen</a>
    </article>

  <?php elseif ($step === 'done'): ?>
    <article class="premium-card" style="text-align:center;padding:3rem 2rem">
      <div style="font-size:3rem;margin-bottom:1rem">✓</div>
      <h2>Profil vollständig</h2>
      <p style="opacity:.7;margin-bottom:2rem">Dein HOTMESS-Passport ist eingerichtet. Entdecke jetzt Events, deine Member Benefits und den Loyalty-Bereich.</p>
      <div style="display:flex;gap:.75rem;flex-wrap:wrap;justify-content:center">
        <a class="button primary" href="/feed">Feed öffnen</a>
        <a class="button ghost" href="/events">Events entdecken</a>
        <a class="button ghost" href="/membership">Passport upgraden</a>
      </div>
    </article>
  <?php endif; ?>

  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem;opacity:.5;font-size:.85rem">
    <a href="/dashboard.php">← Dashboard</a>
    <a href="/account">Account überspringen</a>
  </div>
</main>

<script>
function toggleChip(btn, targetId) {
  var input = document.getElementById(targetId);
  if (!input) return;
  var val = btn.textContent.trim();
  var parts = input.value.split(',').map(function(s){return s.trim();}).filter(Boolean);
  var idx = parts.indexOf(val);
  if (idx > -1) {
    parts.splice(idx, 1);
    btn.style.background = 'transparent';
    btn.style.borderColor = 'rgba(0,0,0,.2)';
  } else {
    parts.push(val);
    btn.style.background = '#1a1a1a';
    btn.style.color = '#fff';
    btn.style.borderColor = '#1a1a1a';
  }
  input.value = parts.join(', ');
}

document.addEventListener('DOMContentLoaded', function() {
  ['interests-input', 'cities-input'].forEach(function(id) {
    var input = document.getElementById(id);
    if (!input) return;
    var parts = input.value.split(',').map(function(s){return s.trim();}).filter(Boolean);
    document.querySelectorAll('#interest-chips button, button[onclick*="' + id + '"]').forEach(function(btn) {
      if (parts.indexOf(btn.textContent.trim()) > -1) {
        btn.style.background = '#1a1a1a';
        btn.style.color = '#fff';
        btn.style.borderColor = '#1a1a1a';
      }
    });
  });
});
</script>

<?php render_footer(); ?>
