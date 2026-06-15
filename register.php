<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/crm-data.php';

hotmess_ensure_auth_schema();

$countries = [
    'Oesterreich',
    'Deutschland',
    'Schweiz',
    'Italien',
    'Frankreich',
    'Niederlande',
    'Belgien',
    'Spanien',
    'Vereinigtes Koenigreich',
    'USA',
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $firstName = trim((string) ($_POST['first_name'] ?? ''));
    $lastName = trim((string) ($_POST['last_name'] ?? ''));
    $name = trim($firstName . ' ' . $lastName);
    $email = strtolower(trim((string) ($_POST['email'] ?? '')));
    $username = strtolower(trim((string) ($_POST['username'] ?? '')));
    $birthDate = trim((string) ($_POST['birth_date'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $street = trim((string) ($_POST['street'] ?? ''));
    $houseNumber = trim((string) ($_POST['house_number'] ?? ''));
    $postalCode = trim((string) ($_POST['postal_code'] ?? ''));
    $city = trim((string) ($_POST['city'] ?? ''));
    $country = trim((string) ($_POST['country'] ?? ''));
    $dataConfirmed = isset($_POST['data_confirmed']);
    $termsAccepted = isset($_POST['terms_accepted']);

    if ($firstName === '') {
        flash('Vorname erforderlich.');
    } elseif ($lastName === '') {
        flash('Nachname erforderlich.');
    } elseif ($birthDate === '') {
        flash('Geburtsdatum erforderlich.');
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        flash('Bitte gib eine gueltige E-Mail-Adresse ein.');
    } elseif ($username === '' || !preg_match('/^[a-z0-9._-]{3,30}$/', $username)) {
        flash('Benutzername erforderlich. Erlaubt sind 3 bis 30 Zeichen: Buchstaben, Zahlen, Punkt, Unterstrich oder Bindestrich.');
    } elseif (strlen($password) < 8) {
        flash('Passwort erforderlich. Bitte nutze mindestens 8 Zeichen.');
    } elseif ($street === '') {
        flash('Strasse erforderlich.');
    } elseif ($houseNumber === '') {
        flash('Hausnummer erforderlich.');
    } elseif ($postalCode === '') {
        flash('Postleitzahl erforderlich.');
    } elseif ($city === '') {
        flash('Ort erforderlich.');
    } elseif ($country === '') {
        flash('Land erforderlich.');
    } elseif (!$dataConfirmed || !$termsAccepted) {
        flash('Bitte bestaetige deine Angaben und akzeptiere Nutzungsbedingungen sowie Datenschutzrichtlinie.');
    } else {
        try {
            $stmt = db()->prepare('SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1');
            $stmt->execute([$email, $username]);
            if ($stmt->fetchColumn()) {
                throw new RuntimeException('Diese E-Mail-Adresse oder dieser Benutzername ist bereits registriert.');
            }

            $stmt = db()->prepare(
                'INSERT INTO users (name, first_name, last_name, email, username, password_hash, birthdate, birth_date, street, house_number, postal_code, country, city, instagram_handle, instagram_follow_confirmed, role, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "", 0, "member", "approved")'
            );
            $stmt->execute([
                $name,
                $firstName,
                $lastName,
                $email,
                $username,
                password_hash($password, PASSWORD_DEFAULT),
                $birthDate,
                $birthDate,
                $street,
                $houseNumber,
                $postalCode,
                $country,
                $city,
            ]);

            $_SESSION['user_id'] = (int) db()->lastInsertId();
            $_SESSION['user_role'] = 'member';
            hotmess_record_customer_signal((int) $_SESSION['user_id'], 'registration', 150, 'Hotmess account created', null, 'registered', ['membership' => 4, 'community' => 8]);
            hotmess_track(ANALYTICS_REGISTER_COMPLETE, ['city' => $city, 'country' => $country], (int) $_SESSION['user_id']);
            $user = current_user();
            sendTemplateEmail('welcome_member', $email, ['name' => $name], ['trigger' => 'registration']);
            generate_verification_code($user, 'email');
            flash('Konto erstellt. Bitte bestaetige deine E-Mail-Adresse.');
            redirect('/verify.php');
        } catch (RuntimeException $exception) {
            flash($exception->getMessage());
        } catch (PDOException) {
            flash('Diese E-Mail-Adresse oder dieser Benutzername ist bereits registriert.');
        }
    }
}

render_header('Werde Teil von Hotmess');
?>

<main class="hotmess-signup-page">
  <section class="hotmess-signup-shell">
    <div class="hotmess-signup-copy">
      <a class="hotmess-wordmark" href="/">HOTMESS</a>
      <h1>Werde Teil von Hotmess</h1>
      <p>Teile echte Gedanken, echte Gefuehle und echte Momente mit Menschen, die dich verstehen.</p>
      <div class="hotmess-mini-story">
        <span>02:17 Uhr.</span>
        <strong>Kann nicht schlafen.</strong>
      </div>
      <div class="hotmess-mini-story is-offset">
        <span>Heute war einfach</span>
        <strong>einer dieser Tage.</strong>
      </div>
    </div>

    <section class="auth-panel hotmess-auth-card hotmess-signup-card">
      <p class="eyebrow">Hotmess Signup</p>
      <h2>Konto erstellen</h2>
      <?php render_flash(); ?>
      <form class="stack-form hotmess-signup-form" method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <div class="signup-grid">
          <label>Vorname<input type="text" name="first_name" autocomplete="given-name" required /></label>
          <label>Nachname<input type="text" name="last_name" autocomplete="family-name" required /></label>
        </div>
        <label>E-Mail-Adresse<input type="email" name="email" autocomplete="email" required /></label>
        <div class="signup-grid">
          <label>Benutzername<input type="text" name="username" autocomplete="username" minlength="3" maxlength="30" required /></label>
          <label>Geburtsdatum<input type="date" name="birth_date" required /></label>
        </div>
        <label>Passwort<input type="password" name="password" autocomplete="new-password" minlength="8" required /></label>

        <div class="signup-grid">
          <label>Strasse<input type="text" name="street" autocomplete="address-line1" required /></label>
          <label>Hausnummer<input type="text" name="house_number" required /></label>
        </div>
        <div class="signup-grid">
          <label>Postleitzahl<input type="text" name="postal_code" autocomplete="postal-code" required /></label>
          <label>Ort<input type="text" name="city" autocomplete="address-level2" required /></label>
        </div>
        <label>Land
          <select name="country" autocomplete="country-name" required>
            <?php foreach ($countries as $country): ?>
              <option value="<?= e($country) ?>" <?= $country === 'Oesterreich' ? 'selected' : '' ?>><?= e($country) ?></option>
            <?php endforeach; ?>
          </select>
        </label>

        <label class="check-row">
          <input type="checkbox" name="data_confirmed" required />
          <span>Ich bestaetige, dass meine Angaben korrekt sind.</span>
        </label>
        <label class="check-row">
          <input type="checkbox" name="terms_accepted" required />
          <span>Ich akzeptiere die <a href="/legal/terms">Nutzungsbedingungen</a> und <a href="/legal/privacy">Datenschutzrichtlinie</a>.</span>
        </label>

        <button class="button primary hotmess-gradient-button" type="submit">Konto erstellen</button>
      </form>
      <p class="auth-switch">Du hast bereits ein Konto? <a href="/">Anmelden</a></p>
    </section>
  </section>
</main>

<script>
document.addEventListener('DOMContentLoaded', function () {
  var select = document.querySelector('select[name="country"]');
  if (!select || !navigator.language) return;
  var region = navigator.language.split('-')[1];
  var map = {
    AT: 'Oesterreich',
    DE: 'Deutschland',
    CH: 'Schweiz',
    IT: 'Italien',
    FR: 'Frankreich',
    NL: 'Niederlande',
    BE: 'Belgien',
    ES: 'Spanien',
    GB: 'Vereinigtes Koenigreich',
    US: 'USA'
  };
  if (map[region]) {
    select.value = map[region];
  }
});
</script>

<?php render_footer(); ?>
