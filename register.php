<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/crm-data.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $firstName = trim($_POST['first_name'] ?? '');
    $lastName = trim($_POST['last_name'] ?? '');
    $name = trim($firstName . ' ' . $lastName);
    $email = strtolower(trim($_POST['email'] ?? ''));
    $birthdate = trim($_POST['birthdate'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $street = trim($_POST['street'] ?? '');
    $postalCode = trim($_POST['postal_code'] ?? '');
    $country = trim($_POST['country'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $instagram = trim($_POST['instagram_handle'] ?? '');
    $password = (string) ($_POST['password'] ?? '');
    $followConfirmed = isset($_POST['instagram_follow_confirmed']) ? 1 : 0;

    if ($firstName === '' || $lastName === '' || $email === '' || $birthdate === '' || $phone === '' || $street === '' || $postalCode === '' || $country === '' || $city === '' || $instagram === '' || strlen($password) < 8 || !$followConfirmed) {
        flash('Bitte fülle alle Pflichtfelder aus, bestätige den Instagram-Follow und nutze mindestens 8 Zeichen Passwort.');
    } else {
        try {
            $profilePhoto = handle_profile_photo_upload($_FILES['profile_photo'] ?? null);
            $stmt = db()->prepare(
                'INSERT INTO users (name, first_name, last_name, email, password_hash, birthdate, phone, street, postal_code, country, city, instagram_handle, profile_photo, instagram_follow_confirmed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([$name, $firstName, $lastName, $email, password_hash($password, PASSWORD_DEFAULT), $birthdate, $phone, $street, $postalCode, $country, $city, $instagram, $profilePhoto, $followConfirmed]);
            $_SESSION['user_id'] = (int) db()->lastInsertId();
            hotmess_record_customer_signal((int) $_SESSION['user_id'], 'registration', 150, 'Passport profile created', null, 'registered', ['membership' => 8, 'community' => 4]);
            $user = current_user();
            generate_verification_code($user, 'email');
            generate_verification_code($user, 'phone');
            flash('Account erstellt. Bitte bestätige E-Mail und Telefonnummer.');
            redirect('verify.php');
        } catch (RuntimeException $exception) {
            flash($exception->getMessage());
        } catch (PDOException $exception) {
            flash('Diese E-Mail ist bereits registriert.');
        }
    }
}

render_header('Registrieren');
?>

<main class="auth-page">
  <section class="auth-panel">
    <p class="eyebrow" data-i18n="Member access">Member access</p>
    <h1 data-i18n="Account erstellen">Account erstellen</h1>
    <?php render_flash(); ?>
    <form class="stack-form" method="post" enctype="multipart/form-data">
      <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
      <label><span data-i18n="Vorname">Vorname</span><input type="text" name="first_name" required /></label>
      <label><span data-i18n="Nachname">Nachname</span><input type="text" name="last_name" required /></label>
      <label><span data-i18n="E-Mail">E-Mail</span><input type="email" name="email" required /></label>
      <label><span data-i18n="Geburtsdatum">Geburtsdatum</span><input type="date" name="birthdate" required /></label>
      <label><span data-i18n="Telefon">Telefon</span><input type="tel" name="phone" placeholder="+43 ..." required /></label>
      <div class="address-helper" data-address-helper>
        <label><span data-i18n="Land">Land</span>
          <select name="country" data-address-country required>
            <option value="">Land auswählen</option>
            <option value="Albanien" data-country-code="al">Albanien</option>
            <option value="Andorra" data-country-code="ad">Andorra</option>
            <option value="Armenien" data-country-code="am">Armenien</option>
            <option value="Aserbaidschan" data-country-code="az">Aserbaidschan</option>
            <option value="Belgien" data-country-code="be">Belgien</option>
            <option value="Bosnien und Herzegowina" data-country-code="ba">Bosnien und Herzegowina</option>
            <option value="Bulgarien" data-country-code="bg">Bulgarien</option>
            <option value="Dänemark" data-country-code="dk">Dänemark</option>
            <option value="Deutschland" data-country-code="de">Deutschland</option>
            <option value="Estland" data-country-code="ee">Estland</option>
            <option value="Finnland" data-country-code="fi">Finnland</option>
            <option value="Frankreich" data-country-code="fr">Frankreich</option>
            <option value="Georgien" data-country-code="ge">Georgien</option>
            <option value="Griechenland" data-country-code="gr">Griechenland</option>
            <option value="Irland" data-country-code="ie">Irland</option>
            <option value="Island" data-country-code="is">Island</option>
            <option value="Italien" data-country-code="it">Italien</option>
            <option value="Kosovo" data-country-code="xk">Kosovo</option>
            <option value="Kroatien" data-country-code="hr">Kroatien</option>
            <option value="Lettland" data-country-code="lv">Lettland</option>
            <option value="Liechtenstein" data-country-code="li">Liechtenstein</option>
            <option value="Litauen" data-country-code="lt">Litauen</option>
            <option value="Luxemburg" data-country-code="lu">Luxemburg</option>
            <option value="Malta" data-country-code="mt">Malta</option>
            <option value="Moldau" data-country-code="md">Moldau</option>
            <option value="Monaco" data-country-code="mc">Monaco</option>
            <option value="Montenegro" data-country-code="me">Montenegro</option>
            <option value="Niederlande" data-country-code="nl">Niederlande</option>
            <option value="Nordmazedonien" data-country-code="mk">Nordmazedonien</option>
            <option value="Norwegen" data-country-code="no">Norwegen</option>
            <option value="Österreich" data-country-code="at" selected>Österreich</option>
            <option value="Polen" data-country-code="pl">Polen</option>
            <option value="Portugal" data-country-code="pt">Portugal</option>
            <option value="Rumänien" data-country-code="ro">Rumänien</option>
            <option value="San Marino" data-country-code="sm">San Marino</option>
            <option value="Schweden" data-country-code="se">Schweden</option>
            <option value="Schweiz" data-country-code="ch">Schweiz</option>
            <option value="Serbien" data-country-code="rs">Serbien</option>
            <option value="Slowakei" data-country-code="sk">Slowakei</option>
            <option value="Slowenien" data-country-code="si">Slowenien</option>
            <option value="Spanien" data-country-code="es">Spanien</option>
            <option value="Tschechien" data-country-code="cz">Tschechien</option>
            <option value="Türkei" data-country-code="tr">Türkei</option>
            <option value="Ukraine" data-country-code="ua">Ukraine</option>
            <option value="Ungarn" data-country-code="hu">Ungarn</option>
            <option value="Vereinigtes Königreich" data-country-code="gb">Vereinigtes Königreich</option>
            <option value="Zypern" data-country-code="cy">Zypern</option>
          </select>
        </label>
        <label><span data-i18n="PLZ">PLZ</span>
          <input type="text" name="postal_code" list="postal-code-suggestions" data-address-postal autocomplete="postal-code" required />
          <datalist id="postal-code-suggestions"></datalist>
        </label>
        <label><span data-i18n="Stadt / Ort">Stadt / Ort</span>
          <input type="text" name="city" list="city-suggestions" data-address-city autocomplete="address-level2" required />
          <datalist id="city-suggestions"></datalist>
        </label>
        <label><span data-i18n="Straße und Hausnummer">Straße und Hausnummer</span>
          <input type="text" name="street" list="street-suggestions" data-address-street autocomplete="street-address" required />
          <datalist id="street-suggestions"></datalist>
          <span class="field-hint" data-i18n="Land wählen, dann Ort oder PLZ eingeben. Vorschläge werden automatisch aus öffentlichen Adressdaten geladen.">Land wählen, dann Ort oder PLZ eingeben. Vorschläge werden automatisch aus öffentlichen Adressdaten geladen.</span>
        </label>
      </div>
      <label><span data-i18n="Instagram Handle">Instagram Handle</span><input type="text" name="instagram_handle" placeholder="@deinname" required /></label>
      <label>
        <span data-i18n="Profilbild">Profilbild</span>
        <input type="file" name="profile_photo" accept="image/*" />
        <span class="field-hint" data-i18n="Du kannst ein Foto aus der Galerie wählen oder mit der Kamera aufnehmen.">Du kannst ein Foto aus der Galerie wählen oder mit der Kamera aufnehmen.</span>
      </label>
      <label><span data-i18n="Passwort">Passwort</span><input type="password" name="password" minlength="8" required /></label>
      <label class="check-row">
        <input type="checkbox" name="instagram_follow_confirmed" required />
        <span data-i18n="Ich folge HOTMESS BLKN auf Instagram.">Ich folge HOTMESS BLKN auf Instagram.</span>
      </label>
      <a class="small-link" href="https://www.instagram.com/hotmess.blkn.clubbing/" target="_blank" rel="noreferrer">
        <span data-i18n="Instagram-Profil öffnen">Instagram-Profil öffnen</span>
      </a>
      <button class="button primary" type="submit" data-i18n="Account erstellen">Account erstellen</button>
    </form>
    <p class="auth-switch"><span data-i18n="Schon registriert?">Schon registriert?</span> <a href="login.php" data-i18n="Einloggen">Einloggen</a></p>
  </section>
</main>

<?php render_footer(); ?>
