<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/events-data.php';

$user = current_user();
hotmess_ensure_phase1_schema();

$slug = trim((string) ($_GET['slug'] ?? ''));
$event = $slug !== '' && function_exists('hotmess_event_by_slug') ? hotmess_event_by_slug($slug) : null;
$eventTitle = $event['title'] ?? strtoupper(str_replace('-', ' ', $slug ?: 'HOTMESS Event'));
$message = null;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $name = trim((string) ($_POST['name'] ?? ''));
    $email = trim((string) ($_POST['email'] ?? ''));
    $gender = trim((string) ($_POST['gender'] ?? ''));
    $ticketType = trim((string) ($_POST['ticket_type'] ?? ''));

    if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Bitte gib deinen Namen und eine gültige E-Mail-Adresse ein.';
    } else {
        try {
            $stmt = db()->prepare(
                'INSERT INTO hotmess_phase1_waitlist (user_id, event_slug, email, name, gender, requested_ticket_type, status)
                 VALUES (?, ?, ?, ?, ?, ?, "waiting")'
            );
            $stmt->execute([
                $user ? (int) $user['id'] : null,
                $slug ?: 'hotmess',
                $email,
                $name,
                $gender !== '' ? $gender : null,
                $ticketType !== '' ? $ticketType : null,
            ]);
            $message = 'Du bist auf der Warteliste. Sobald ein Slot frei wird, melden wir uns.';
        } catch (Throwable) {
            $error = 'Die Warteliste konnte gerade nicht gespeichert werden. Bitte versuche es später erneut.';
        }
    }
}

render_header('Waitlist | HOTMESS');
?>

<main class="hm-app-page">
  <section class="hm-app-hero compact">
    <p class="eyebrow">Event Waitlist</p>
    <h1><?= e((string) $eventTitle) ?></h1>
    <p>Wenn Tickets oder ein passender Gender-Balance-Slot frei werden, kannst du priorisiert eingeladen werden.</p>
    <div class="hm-app-actions">
      <a class="button ghost" href="<?= e($slug ? '/events/' . rawurlencode($slug) : '/events') ?>">Event ansehen</a>
      <a class="button ghost" href="/tickets">Tickets</a>
    </div>
  </section>

  <?php if ($message): ?><p class="notice success"><?= e($message) ?></p><?php endif; ?>
  <?php if ($error): ?><p class="notice error"><?= e($error) ?></p><?php endif; ?>

  <section class="auth-shell slim">
    <form class="auth-card" method="post">
      <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
      <label>
        Name
        <input name="name" value="<?= e((string) ($user['name'] ?? '')) ?>" required>
      </label>
      <label>
        E-Mail-Adresse
        <input type="email" name="email" value="<?= e((string) ($user['email'] ?? '')) ?>" required>
      </label>
      <label>
        Ticketwunsch
        <select name="ticket_type">
          <option value="">Flexibel</option>
          <option value="regular">Regular</option>
          <option value="vip">VIP</option>
          <option value="table">Table / Bottle Service</option>
        </select>
      </label>
      <label>
        Gender für Balance-Logik
        <select name="gender">
          <option value="">Keine Angabe</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="non_binary">Non-binary</option>
        </select>
      </label>
      <button class="auth-submit" type="submit">Auf Warteliste setzen</button>
      <p class="auth-legal">Die Warteliste speichert nur die Angaben, die für Eventzugang und Benachrichtigung benötigt werden.</p>
    </form>
  </section>
</main>

<?php render_footer(); ?>

