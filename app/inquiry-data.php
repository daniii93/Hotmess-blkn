<?php

declare(strict_types=1);

require_once __DIR__ . '/crm-data.php';
require_once __DIR__ . '/leads-data.php';

function hotmess_inquiry_types(): array
{
    return [
        'package' => 'Package Inquiry',
        'hotel' => 'Hotel Inquiry',
        'vip_table' => 'VIP / Table Inquiry',
        'partner' => 'Partner Application',
        'ambassador' => 'Ambassador Application',
        'general' => 'General Contact',
    ];
}

function hotmess_inquiry_statuses(): array
{
    return [
        'new' => 'New',
        'contacted' => 'Contacted',
        'in_progress' => 'In Progress',
        'converted' => 'Converted',
        'lost' => 'Lost',
        'archived' => 'Archived',
    ];
}

function hotmess_inquiry_submit_mode(): string
{
    try {
        db()->query('SELECT 1');
        return 'database';
    } catch (Throwable $exception) {
        return getenv('NEXT_PUBLIC_SUPABASE_URL') && getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') ? 'supabase-ready' : 'mock';
    }
}

function hotmess_ensure_inquiry_tables(): void
{
    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_inquiries (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          type ENUM('package', 'hotel', 'vip_table', 'partner', 'ambassador', 'general') NOT NULL,
          status ENUM('new', 'contacted', 'in_progress', 'converted', 'lost', 'archived') NOT NULL DEFAULT 'new',
          subject VARCHAR(190) NOT NULL,
          name VARCHAR(160) NOT NULL,
          email VARCHAR(190) NOT NULL,
          phone VARCHAR(80) NULL,
          city VARCHAR(120) NULL,
          message TEXT NULL,
          related_event_id VARCHAR(120) NULL,
          related_hotel_id VARCHAR(120) NULL,
          related_package_id VARCHAR(120) NULL,
          related_partner_id VARCHAR(120) NULL,
          metadata JSON NULL,
          internal_notes TEXT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX platform_inquiries_type_idx (type, status),
          INDEX platform_inquiries_city_idx (city),
          INDEX platform_inquiries_email_idx (email),
          INDEX platform_inquiries_created_idx (created_at)
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_inquiry_notes (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          inquiry_id INT UNSIGNED NOT NULL,
          author_id INT UNSIGNED NULL,
          note TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT platform_inquiry_notes_inquiry_fk FOREIGN KEY (inquiry_id) REFERENCES platform_inquiries(id) ON DELETE CASCADE,
          CONSTRAINT platform_inquiry_notes_author_fk FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX platform_inquiry_notes_inquiry_idx (inquiry_id, created_at)
        )"
    );
}

function hotmess_normalize_inquiry_payload(array $data): array
{
    $type = (string) ($data['type'] ?? 'general');
    $name = trim((string) ($data['name'] ?? $data['contactName'] ?? $data['companyName'] ?? ''));
    $subject = trim((string) ($data['subject'] ?? hotmess_inquiry_types()[$type] ?? 'Inquiry'));
    $metadata = [
        'numberOfGuests' => (string) ($data['numberOfGuests'] ?? $data['guests'] ?? ''),
        'preferredDate' => (string) ($data['preferredDate'] ?? $data['travelDate'] ?? ''),
        'preferredHotel' => (string) ($data['preferredHotel'] ?? ''),
        'roomPreference' => (string) ($data['roomPreference'] ?? ''),
        'eventReference' => (string) ($data['eventReference'] ?? ''),
        'vipInterest' => !empty($data['vipInterest']),
        'budgetRange' => (string) ($data['budgetRange'] ?? ''),
        'preferredArea' => (string) ($data['preferredArea'] ?? ''),
        'website' => (string) ($data['website'] ?? ''),
        'category' => (string) ($data['category'] ?? ''),
        'interests' => array_values(array_map('strval', (array) ($data['interests'] ?? []))),
        'instagram' => (string) ($data['instagram'] ?? ''),
        'ambassadorRole' => (string) ($data['ambassadorRole'] ?? ''),
        'experience' => (string) ($data['experience'] ?? ''),
    ];

    return [
        'type' => $type,
        'status' => 'new',
        'subject' => $subject,
        'name' => $name,
        'email' => strtolower(trim((string) ($data['email'] ?? ''))),
        'phone' => trim((string) ($data['phone'] ?? '')),
        'city' => trim((string) ($data['city'] ?? '')),
        'message' => trim((string) ($data['message'] ?? '')),
        'related_event_id' => trim((string) ($data['relatedEventId'] ?? '')),
        'related_hotel_id' => trim((string) ($data['relatedHotelId'] ?? '')),
        'related_package_id' => trim((string) ($data['relatedPackageId'] ?? '')),
        'related_partner_id' => trim((string) ($data['relatedPartnerId'] ?? '')),
        'metadata' => json_encode($metadata, JSON_UNESCAPED_SLASHES),
    ];
}

function hotmess_store_inquiry(array $data): int
{
    hotmess_ensure_inquiry_tables();
    $payload = hotmess_normalize_inquiry_payload($data);
    $stmt = db()->prepare(
        'INSERT INTO platform_inquiries
          (type, status, subject, name, email, phone, city, message, related_event_id, related_hotel_id, related_package_id, related_partner_id, metadata)
         VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $payload['type'],
        $payload['status'],
        $payload['subject'],
        $payload['name'],
        $payload['email'],
        $payload['phone'] ?: null,
        $payload['city'] ?: null,
        $payload['message'] ?: null,
        $payload['related_event_id'] ?: null,
        $payload['related_hotel_id'] ?: null,
        $payload['related_package_id'] ?: null,
        $payload['related_partner_id'] ?: null,
        $payload['metadata'],
    ]);

    $inquiryId = (int) db()->lastInsertId();
    try {
        hotmess_create_lead_from_inquiry($inquiryId, $payload);
    } catch (Throwable) {
        // Inquiry persistence must remain reliable even if the CRM layer is still being migrated.
    }

    return $inquiryId;
}

function hotmess_validate_inquiry(array $data): array
{
    $errors = [];
    $type = (string) ($data['type'] ?? '');

    if (!array_key_exists($type, hotmess_inquiry_types())) {
        $errors[] = 'Inquiry type is invalid.';
    }

    if (trim((string) ($data['name'] ?? $data['contactName'] ?? $data['companyName'] ?? '')) === '') {
        $errors[] = 'Name is required.';
    }

    $email = trim((string) ($data['email'] ?? ''));
    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'A valid e-mail is required.';
    }

    if (trim((string) ($data['message'] ?? '')) === '') {
        $errors[] = 'Message is required.';
    }

    if (in_array($type, ['package', 'hotel', 'vip_table'], true)) {
        $guests = (int) ($data['numberOfGuests'] ?? $data['guests'] ?? 0);
        if ($guests < 1) {
            $errors[] = 'Guest count must be at least 1.';
        }
    }

    return $errors;
}

function hotmess_handle_inquiry_submit(array $data): bool
{
    $errors = hotmess_validate_inquiry($data);

    if ($errors) {
        flash(implode(' ', $errors));
        return false;
    }

    $mode = hotmess_inquiry_submit_mode();
    $label = hotmess_inquiry_types()[(string) $data['type']] ?? 'Inquiry';
    try {
        $inquiryId = hotmess_store_inquiry($data);
        $leadId = hotmess_lead_id_for_inquiry($inquiryId);
        $suffix = 'Die Anfrage wurde gespeichert. Inquiry #' . $inquiryId . ($leadId ? ' / Lead #' . $leadId : '') . '.';
        $userId = (int) ($_SESSION['user_id'] ?? 0);
        $type = (string) ($data['type'] ?? 'general');
        if ($userId > 0 && in_array($type, ['package', 'hotel', 'vip_table', 'partner', 'ambassador'], true)) {
            $crmType = match ($type) {
                'package' => 'package_booking',
                'hotel' => 'hotel_booking',
                'partner' => 'partner_redemption',
                'ambassador' => 'community_attendance',
                default => 'ticket_purchase',
            };
            $points = match ($type) {
                'package' => 220,
                'hotel' => 160,
                'vip_table' => 190,
                'ambassador' => 260,
                default => 90,
            };
            hotmess_record_customer_signal($userId, $crmType, $points, $label . ': ' . (string) ($data['subject'] ?? 'HotMess request'), (string) $inquiryId, 'attendee', [
                'event' => $type === 'vip_table' ? 8 : 2,
                'travel' => in_array($type, ['package', 'hotel'], true) ? 8 : 0,
                'community' => $type === 'ambassador' ? 12 : 1,
                'membership' => 3,
            ]);
        }
    } catch (Throwable $exception) {
        $suffix = $mode === 'mock'
            ? 'Mock-Submit aktiv: Die Anfrage wurde simuliert und ist fuer Supabase vorbereitet.'
            : 'Supabase ist konfiguriert; lokale Speicherung ist aktuell nicht verfuegbar.';
    }

    flash($label . ' received. ' . $suffix);
    return true;
}

function hotmess_inquiries(): array
{
    try {
        hotmess_ensure_inquiry_tables();
        $rows = db()->query(
            'SELECT * FROM platform_inquiries ORDER BY created_at DESC LIMIT 80'
        )->fetchAll();

        if ($rows) {
            return array_map(function (array $row): array {
                return [
                    'id' => 'inq-db-' . (string) $row['id'],
                    'type' => (string) $row['type'],
                    'status' => (string) $row['status'],
                    'subject' => (string) $row['subject'],
                    'name' => (string) $row['name'],
                    'email' => (string) $row['email'],
                    'phone' => (string) ($row['phone'] ?? ''),
                    'city' => (string) ($row['city'] ?? ''),
                    'message' => (string) ($row['message'] ?? ''),
                    'relatedEventId' => (string) ($row['related_event_id'] ?? ''),
                    'relatedHotelId' => (string) ($row['related_hotel_id'] ?? ''),
                    'relatedPackageId' => (string) ($row['related_package_id'] ?? ''),
                    'relatedPartnerId' => (string) ($row['related_partner_id'] ?? ''),
                    'metadata' => json_decode((string) ($row['metadata'] ?? '{}'), true) ?: [],
                    'internalNotes' => (string) ($row['internal_notes'] ?? ''),
                    'createdAt' => (string) $row['created_at'],
                    'updatedAt' => (string) $row['updated_at'],
                ];
            }, $rows);
        }
    } catch (Throwable $exception) {
        // Keep the admin usable with curated mock data until persistence is available.
    }

    return [
        [
            'id' => 'inq-package-1',
            'type' => 'package',
            'status' => 'new',
            'subject' => 'Signature Weekend Adriatic',
            'name' => 'Sophia K.',
            'email' => 'sophia@example.com',
            'phone' => '+43 660 000000',
            'city' => 'Dubrovnik',
            'message' => 'Interested in a Signature Weekend for four guests with VIP preference.',
            'relatedEventId' => 'hm-adriatic-2026',
            'relatedHotelId' => 'signature-city-stay',
            'relatedPackageId' => 'pkg-signature-adriatic-2026',
            'relatedPartnerId' => '',
            'metadata' => ['guests' => 4, 'date' => '2026-11-07', 'vipInterest' => true],
            'internalNotes' => 'Follow up with Signature allocation options.',
            'createdAt' => '2026-06-02 11:20',
            'updatedAt' => '2026-06-02 11:20',
        ],
        [
            'id' => 'inq-hotel-1',
            'type' => 'hotel',
            'status' => 'contacted',
            'subject' => 'Late checkout Vienna',
            'name' => 'Marco R.',
            'email' => 'marco@example.com',
            'phone' => '',
            'city' => 'Vienna',
            'message' => 'Looking for a partner hotel around Passport Night.',
            'relatedEventId' => 'hm-vienna-2026',
            'relatedHotelId' => 'late-checkout-vienna',
            'relatedPackageId' => '',
            'relatedPartnerId' => 'late-checkout-vienna',
            'metadata' => ['guests' => 2, 'room' => 'double'],
            'internalNotes' => 'Hotel code sent.',
            'createdAt' => '2026-06-02 10:15',
            'updatedAt' => '2026-06-02 12:10',
        ],
        [
            'id' => 'inq-partner-1',
            'type' => 'partner',
            'status' => 'in_progress',
            'subject' => 'Private Wellness Studio',
            'name' => 'Wellness Lead',
            'email' => 'wellness@example.com',
            'phone' => '+43 1 000000',
            'city' => 'Vienna',
            'message' => 'Interested in membership and package placements.',
            'relatedEventId' => '',
            'relatedHotelId' => '',
            'relatedPackageId' => '',
            'relatedPartnerId' => 'wellness-lead',
            'metadata' => ['interests' => ['Packages', 'Membership', 'App'], 'budgetRange' => '2k-5k'],
            'internalNotes' => 'Potential Black benefit partner.',
            'createdAt' => '2026-06-01 18:40',
            'updatedAt' => '2026-06-02 09:00',
        ],
        [
            'id' => 'inq-vip-1',
            'type' => 'vip_table',
            'status' => 'new',
            'subject' => 'Innsbruck Private Weekend Table',
            'name' => 'Daniel V.',
            'email' => 'daniel@example.com',
            'phone' => '+43 676 000000',
            'city' => 'Innsbruck',
            'message' => 'VIP area request for six guests.',
            'relatedEventId' => 'hm-innsbruck-2026',
            'relatedHotelId' => '',
            'relatedPackageId' => '',
            'relatedPartnerId' => '',
            'metadata' => ['guests' => 6, 'budgetRange' => '1k-2k', 'area' => 'VIP Area'],
            'internalNotes' => 'Check table availability.',
            'createdAt' => '2026-06-01 16:25',
            'updatedAt' => '2026-06-01 16:25',
        ],
        [
            'id' => 'inq-ambassador-1',
            'type' => 'ambassador',
            'status' => 'new',
            'subject' => 'City Ambassador Application',
            'name' => 'Lena M.',
            'email' => 'lena@example.com',
            'phone' => '',
            'city' => 'Milan',
            'message' => 'Interested in building the Milan community layer.',
            'relatedEventId' => '',
            'relatedHotelId' => '',
            'relatedPackageId' => '',
            'relatedPartnerId' => '',
            'metadata' => ['role' => 'City Ambassador', 'instagram' => '@lena'],
            'internalNotes' => 'Review after community launch.',
            'createdAt' => '2026-06-01 12:05',
            'updatedAt' => '2026-06-01 12:05',
        ],
    ];
}

function hotmess_numeric_inquiry_id(string $id): int
{
    return (int) preg_replace('/\D+/', '', $id);
}

function hotmess_update_inquiry_status_and_note(string $inquiryId, string $status, string $internalNotes, int $adminId): void
{
    if (!array_key_exists($status, hotmess_inquiry_statuses())) {
        throw new RuntimeException('Inquiry Status ist nicht erlaubt.');
    }

    $numericId = hotmess_numeric_inquiry_id($inquiryId);
    if ($numericId <= 0) {
        throw new RuntimeException('Inquiry konnte nicht eindeutig gefunden werden.');
    }

    hotmess_ensure_inquiry_tables();
    db()->prepare('UPDATE platform_inquiries SET status = ?, internal_notes = ?, updated_at = NOW() WHERE id = ?')
        ->execute([$status, $internalNotes ?: null, $numericId]);

    if ($internalNotes !== '') {
        db()->prepare('INSERT INTO platform_inquiry_notes (inquiry_id, author_id, note) VALUES (?, ?, ?)')
            ->execute([$numericId, $adminId > 0 ? $adminId : null, $internalNotes]);
    }

    try {
        $leadId = hotmess_lead_id_for_inquiry($numericId);
        if ($leadId !== null) {
            hotmess_add_lead_timeline($leadId, 'status_change', 'Inquiry aktualisiert', 'Status: ' . hotmess_inquiry_statuses()[$status] . ($internalNotes !== '' ? ' / Notiz: ' . $internalNotes : ''), $adminId);
            if ($status === 'converted') {
                hotmess_update_lead_stage($leadId, 'won', $adminId);
            } elseif ($status === 'lost') {
                hotmess_update_lead_stage($leadId, 'lost', $adminId);
            } elseif ($status === 'contacted') {
                hotmess_update_lead_stage($leadId, 'contacted', $adminId);
            }
        }
    } catch (Throwable) {
        // Inquiry update must remain reliable even when lead migration is still in progress.
    }
}

function hotmess_inquiry_notes(): array
{
    return [
        ['id' => 'note-1', 'inquiryId' => 'inq-package-1', 'authorId' => 'admin', 'note' => 'Priority lead for Signature Weekend.', 'createdAt' => '2026-06-02 11:40'],
        ['id' => 'note-2', 'inquiryId' => 'inq-hotel-1', 'authorId' => 'admin', 'note' => 'Sent hotel partner code placeholder.', 'createdAt' => '2026-06-02 12:10'],
    ];
}

function render_form_success_message(): void
{
    render_flash();
}

function render_inquiry_status_badge(string $status): void
{
    $label = hotmess_inquiry_statuses()[$status] ?? $status;
    ?><span class="inquiry-status-badge inquiry-status-badge--<?= e($status) ?>"><?= e($label) ?></span><?php
}

function render_inquiry_form(string $type, array $context = []): void
{
    $title = hotmess_inquiry_types()[$type] ?? 'Inquiry';
    $action = $context['action'] ?? '';
    ?>
    <form class="concierge-form inquiry-form" method="post" action="<?= e($action) ?>">
      <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
      <input type="hidden" name="type" value="<?= e($type) ?>" />
      <?php foreach (['relatedEventId', 'relatedHotelId', 'relatedPackageId', 'relatedPartnerId', 'subject', 'city'] as $hidden): ?>
        <?php if (!empty($context[$hidden])): ?>
          <input type="hidden" name="<?= e($hidden) ?>" value="<?= e((string) $context[$hidden]) ?>" />
        <?php endif; ?>
      <?php endforeach; ?>
      <p class="eyebrow"><?= e($title) ?></p>
      <h2><?= e($context['headline'] ?? 'Concierge Anfrage') ?></h2>
      <?php render_form_success_message(); ?>

      <?php if ($type === 'partner'): ?>
        <label>Firmenname<input name="companyName" required /></label>
        <label>Ansprechpartner<input name="name" required /></label>
      <?php else: ?>
        <label>Name<input name="name" required /></label>
      <?php endif; ?>

      <label>E-Mail<input type="email" name="email" required /></label>
      <?php if ($type !== 'general'): ?>
        <label>Telefon optional<input name="phone" /></label>
      <?php endif; ?>

      <?php if ($type === 'package'): ?>
        <label>Anzahl Gaeste<input type="number" name="numberOfGuests" min="1" max="20" value="2" required /></label>
        <label>Gewuenschtes Datum<input type="date" name="preferredDate" /></label>
        <label>Bevorzugtes Hotel<input name="preferredHotel" /></label>
        <label class="check-row"><input type="checkbox" name="vipInterest" value="1" /> VIP Interesse</label>
      <?php elseif ($type === 'hotel'): ?>
        <label>Reisedatum<input type="date" name="travelDate" /></label>
        <label>Anzahl Gaeste<input type="number" name="numberOfGuests" min="1" max="20" value="2" required /></label>
        <label>Zimmerwunsch<input name="roomPreference" /></label>
        <label>Eventbezug<input name="eventReference" value="<?= e((string) ($context['relatedEventId'] ?? '')) ?>" /></label>
      <?php elseif ($type === 'vip_table'): ?>
        <label>Anzahl Gaeste<input type="number" name="numberOfGuests" min="1" max="20" value="4" required /></label>
        <label>Budgetrahmen optional<select name="budgetRange"><option value="">Noch offen</option><option value="under-1k">unter 1k</option><option value="1k-2k">1k-2k</option><option value="2k-5k">2k-5k</option><option value="5k-plus">5k+</option></select></label>
        <label>Wunschbereich<input name="preferredArea" placeholder="VIP Area, Table, Fast Lane..." /></label>
      <?php elseif ($type === 'partner'): ?>
        <label>Website<input name="website" /></label>
        <label>Stadt<input name="city" value="<?= e((string) ($context['city'] ?? '')) ?>" required /></label>
        <label>Kategorie<input name="category" placeholder="Hotel, Bar, Fashion, Travel..." required /></label>
        <fieldset>
          <legend>Interesse an</legend>
          <?php foreach (['Events', 'Hotels', 'Packages', 'Community', 'Membership', 'App'] as $interest): ?>
            <label class="check-row"><input type="checkbox" name="interests[]" value="<?= e($interest) ?>" /> <?= e($interest) ?></label>
          <?php endforeach; ?>
        </fieldset>
        <label>Budgetrahmen optional<select name="budgetRange"><option value="">Noch offen</option><option value="under-1k">unter 1k</option><option value="1k-2k">1k-2k</option><option value="2k-5k">2k-5k</option><option value="5k-plus">5k+</option></select></label>
      <?php elseif ($type === 'ambassador'): ?>
        <label>Stadt<input name="city" required /></label>
        <label>Instagram optional<input name="instagram" /></label>
        <label>Gewuenschte Rolle<select name="ambassadorRole"><option>City Ambassador</option><option>Travel Ambassador</option><option>VIP Ambassador</option><option>Brand Ambassador</option></select></label>
        <label>Erfahrung<textarea name="experience" placeholder="Events, Hosting, Community, Travel..."></textarea></label>
      <?php elseif ($type === 'general'): ?>
        <label>Thema<input name="subject" required /></label>
      <?php endif; ?>

      <label>Nachricht<textarea name="message" required placeholder="<?= e((string) ($context['messagePlaceholder'] ?? 'Tell us what you need.')) ?>"></textarea></label>
      <button class="button primary" type="submit"><?= e($context['buttonLabel'] ?? 'Anfrage senden') ?></button>
        <?php
          $submitMode = hotmess_inquiry_submit_mode();
          $submitHint = match ($submitMode) {
              'database' => 'Anfragen werden im HotMess Inquiry Center gespeichert.',
              'supabase-ready' => 'Supabase ist vorbereitet; lokaler Fallback bleibt aktiv.',
              default => 'Aktuell ist Mock-Submit aktiv.',
          };
        ?>
        <p class="field-hint">Datenschutz: Deine Angaben werden nur zur Bearbeitung dieser Anfrage genutzt. <?= e($submitHint) ?></p>
    </form>
    <?php
}

function render_inquiry_table(array $inquiries): void
{
    ?>
    <div class="admin-table-card">
      <table class="admin-lux-table inquiry-table">
        <thead><tr><th>Typ</th><th>Kontakt</th><th>Bezug</th><th>Stadt</th><th>Status</th><th>Eingang</th><th>Aktion</th></tr></thead>
        <tbody>
          <?php foreach ($inquiries as $inquiry): ?>
            <tr>
              <td><strong><?= e(hotmess_inquiry_types()[$inquiry['type']] ?? $inquiry['type']) ?></strong><span><?= e($inquiry['subject']) ?></span></td>
              <td><strong><?= e($inquiry['name']) ?></strong><span><?= e($inquiry['email']) ?></span></td>
              <td><span><?= e($inquiry['relatedEventId'] ?: $inquiry['relatedHotelId'] ?: $inquiry['relatedPackageId'] ?: $inquiry['relatedPartnerId'] ?: 'General') ?></span></td>
              <td><?= e($inquiry['city']) ?></td>
              <td><?php render_inquiry_status_badge($inquiry['status']); ?></td>
              <td><?= e($inquiry['createdAt']) ?></td>
              <td><a class="button ghost" href="#<?= e($inquiry['id']) ?>">Bearbeiten</a></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
    <?php
}

function render_inquiry_detail_panel(array $inquiry): void
{
    ?>
    <article id="<?= e($inquiry['id']) ?>" class="inquiry-detail-panel">
      <div>
        <span><?= e(hotmess_inquiry_types()[$inquiry['type']] ?? $inquiry['type']) ?></span>
        <h3><?= e($inquiry['subject']) ?></h3>
        <p><?= e($inquiry['message']) ?></p>
      </div>
      <dl class="event-meta-list">
        <div><dt>Name</dt><dd><?= e($inquiry['name']) ?></dd></div>
        <div><dt>E-Mail</dt><dd><?= e($inquiry['email']) ?></dd></div>
        <div><dt>Telefon</dt><dd><?= e($inquiry['phone'] ?: 'optional') ?></dd></div>
        <div><dt>Status</dt><dd><?php render_inquiry_status_badge($inquiry['status']); ?></dd></div>
        <div><dt>Notizen</dt><dd><?= e($inquiry['internalNotes']) ?></dd></div>
      </dl>
      <form class="inquiry-admin-form" method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <input type="hidden" name="action" value="inquiry_update" />
        <input type="hidden" name="inquiry_id" value="<?= e($inquiry['id']) ?>" />
        <label>Status<select name="status">
          <?php foreach (hotmess_inquiry_statuses() as $status => $label): ?>
            <option value="<?= e($status) ?>" <?= $inquiry['status'] === $status ? 'selected' : '' ?>><?= e($label) ?></option>
          <?php endforeach; ?>
        </select></label>
        <label>Interne Notiz<textarea name="internalNotes"><?= e($inquiry['internalNotes']) ?></textarea></label>
        <button class="button primary" type="submit">Update vorbereiten</button>
      </form>
    </article>
    <?php
}
