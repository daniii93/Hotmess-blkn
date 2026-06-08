<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';

$token = $_GET['token'] ?? $_POST['token'] ?? '';

if (!defined('INSTALL_TOKEN') || !hash_equals(INSTALL_TOKEN, $token)) {
    http_response_code(403);
    exit('Installationszugriff verweigert.');
}

$message = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 10) {
        $message = 'Bitte gültige E-Mail und mindestens 10 Zeichen Passwort nutzen.';
    } else {
        $schema = file_get_contents(__DIR__ . '/app/schema.sql');
        db()->exec($schema);

        $stmt = db()->prepare(
            'INSERT INTO users (name, email, password_hash, city, instagram_handle, instagram_follow_confirmed, role, status)
             VALUES (?, ?, ?, ?, ?, 1, "admin", "approved")
             ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = "admin", status = "approved"'
        );
        $stmt->execute([
            'HOTMESS Admin',
            $email,
            password_hash($password, PASSWORD_DEFAULT),
            'Admin',
            '@hotmess.blkn.clubbing',
        ]);

        $message = 'Installation abgeschlossen. Lösche install.php nach dem Test und logge dich als Admin ein.';
    }
}
?>
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HOTMESS Installation</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="auth-page">
      <section class="auth-panel">
        <p class="eyebrow">HOTMESS Setup</p>
        <h1>Installation</h1>
        <?php if ($message): ?>
          <p class="notice"><?= e($message) ?></p>
        <?php endif; ?>
        <form class="stack-form" method="post">
          <input type="hidden" name="token" value="<?= e($token) ?>" />
          <label>Admin E-Mail<input type="email" name="email" value="<?= e(ADMIN_EMAIL) ?>" required /></label>
          <label>Admin Passwort<input type="password" name="password" minlength="10" required /></label>
          <button class="button primary" type="submit">Tabellen erstellen und Admin anlegen</button>
        </form>
      </section>
    </main>
  </body>
</html>
