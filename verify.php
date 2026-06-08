<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';

$user = require_login();

if (($user['role'] ?? '') === 'admin') {
    redirect('dashboard.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $type = $_POST['type'] === 'phone' ? 'phone' : 'email';
    $action = $_POST['action'] ?? 'verify';

    if ($action === 'resend') {
        try {
            generate_verification_code($user, $type);
            flash($type === 'phone' ? 'Neuer SMS-Code wurde angefordert.' : 'Neuer E-Mail-Code wurde gesendet.');
        } catch (RuntimeException $exception) {
            flash($exception->getMessage());
        }
        redirect('verify.php');
    }

    [$ok, $message] = verify_code($user, $type, trim($_POST['code'] ?? ''));
    flash($message);

    if ($ok) {
        $user = current_user();
        if (is_verified($user, 'email') && is_verified($user, 'phone')) {
            redirect('dashboard.php');
        }
    }

    redirect('verify.php');
}

render_header('Verifizierung');
$smsNotice = $_SESSION['sms_notice'] ?? null;
unset($_SESSION['sms_notice']);
?>

<main class="auth-page">
  <section class="auth-panel">
    <p class="eyebrow">Verification</p>
    <h1>Code bestätigen</h1>
    <?php render_flash(); ?>
    <?php if ($smsNotice): ?>
      <p class="notice"><?= e($smsNotice) ?></p>
    <?php endif; ?>

    <div class="verification-list">
      <article>
        <h3>E-Mail</h3>
        <p><?= is_verified($user, 'email') ? 'Bestätigt' : 'Code an ' . e($user['email']) . ' gesendet' ?></p>
        <?php if (!is_verified($user, 'email')): ?>
          <form class="stack-form" method="post">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
            <input type="hidden" name="type" value="email" />
            <input type="hidden" name="action" value="verify" />
            <label>6-stelliger Code<input type="text" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required /></label>
            <button class="button primary" type="submit">E-Mail bestätigen</button>
          </form>
          <form method="post">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
            <input type="hidden" name="type" value="email" />
            <input type="hidden" name="action" value="resend" />
            <button class="link-button" type="submit">Neuen Code senden</button>
          </form>
        <?php endif; ?>
      </article>

      <article>
        <h3>Telefon</h3>
        <p><?= is_verified($user, 'phone') ? 'Bestätigt' : 'SMS-Code an ' . e($user['phone']) . ' angefordert' ?></p>
        <?php if (!is_verified($user, 'phone')): ?>
          <form class="stack-form" method="post">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
            <input type="hidden" name="type" value="phone" />
            <input type="hidden" name="action" value="verify" />
            <label>6-stelliger SMS-Code<input type="text" name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required /></label>
            <button class="button primary" type="submit">Telefon bestätigen</button>
          </form>
          <form method="post">
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
            <input type="hidden" name="type" value="phone" />
            <input type="hidden" name="action" value="resend" />
            <button class="link-button" type="submit">Neuen SMS-Code senden</button>
          </form>
        <?php endif; ?>
      </article>
    </div>
  </section>
</main>

<?php render_footer(); ?>
