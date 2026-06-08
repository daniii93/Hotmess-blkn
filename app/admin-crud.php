<?php

declare(strict_types=1);

function hotmess_admin_crud_modules(): array
{
    return [
        'events' => ['label' => 'Events', 'titleField' => 'title', 'required' => ['title'], 'statuses' => ['draft', 'published', 'archived', 'sold_out']],
        'hotels' => ['label' => 'Hotels', 'titleField' => 'name', 'required' => ['name'], 'statuses' => ['draft', 'published', 'archived']],
        'packages' => ['label' => 'Packages', 'titleField' => 'title', 'required' => ['title'], 'statuses' => ['draft', 'published', 'archived', 'request_only', 'sold_out']],
        'community' => ['label' => 'Community', 'titleField' => 'title', 'required' => ['title'], 'statuses' => ['draft', 'published', 'archived']],
        'membership' => ['label' => 'Membership', 'titleField' => 'name', 'required' => ['name'], 'statuses' => ['draft', 'published', 'archived']],
        'partners' => ['label' => 'Partners', 'titleField' => 'name', 'required' => ['name'], 'statuses' => ['lead', 'active', 'paused', 'archived', 'draft', 'published']],
        'gallery' => ['label' => 'Gallery', 'titleField' => 'title', 'required' => ['title'], 'statuses' => ['draft', 'published', 'archived']],
    ];
}

function hotmess_admin_crud_fields(string $module): array
{
    return match ($module) {
        'events' => ['title', 'slug', 'city', 'venue', 'address', 'startDate', 'endDate', 'doorsOpen', 'category', 'shortDescription', 'longDescription', 'heroImage', 'galleryImages', 'dressCode', 'lineup', 'timetable', 'ticketStatus', 'ticketUrl', 'vipAvailable', 'tableServiceAvailable', 'hotelIds', 'packageIds', 'partnerIds', 'status'],
        'hotels' => ['name', 'slug', 'city', 'address', 'description', 'heroImage', 'galleryImages', 'category', 'stars', 'priceFrom', 'bookingUrl', 'inquiryEmail', 'distanceToVenue', 'partnerType', 'benefits', 'roomTypes', 'shuttleAvailable', 'fastLaneIncluded', 'welcomeBagIncluded', 'status'],
        'packages' => ['title', 'slug', 'city', 'startDate', 'endDate', 'packageType', 'shortDescription', 'longDescription', 'heroImage', 'galleryImages', 'priceFrom', 'availabilityStatus', 'includedItems', 'excludedItems', 'itinerary', 'eventIds', 'hotelIds', 'partnerOfferIds', 'membershipBenefits', 'vipIncluded', 'shuttleIncluded', 'welcomeBagIncluded', 'conciergeIncluded', 'bookingUrl', 'inquiryEmail', 'status'],
        'community' => ['title', 'slug', 'city', 'venue', 'startDate', 'endDate', 'eventType', 'shortDescription', 'longDescription', 'heroImage', 'memberOnly', 'capacity', 'registrationRequired', 'registrationUrl', 'partnerIds', 'ambassadorIds', 'status'],
        'membership' => ['name', 'slug', 'priceMonthly', 'priceYearly', 'description', 'benefits', 'eventBenefits', 'hotelBenefits', 'packageBenefits', 'communityBenefits', 'appBenefits', 'partnerBenefits', 'badgeLabel', 'priority', 'status'],
        'partners' => ['name', 'slug', 'category', 'city', 'description', 'logo', 'heroImage', 'websiteUrl', 'contactName', 'contactEmail', 'partnerType', 'visibilityLevel', 'activePlacements', 'offers', 'assignedEvents', 'assignedHotels', 'assignedPackages', 'membershipBenefits', 'appPlacements', 'notes', 'status'],
        'gallery' => ['title', 'slug', 'city', 'eventId', 'eventDate', 'mediaType', 'coverImage', 'images', 'videoUrl', 'description', 'photographer', 'partnerIds', 'visibility', 'status'],
        default => ['title', 'slug', 'status'],
    };
}

function hotmess_ensure_admin_crud_tables(): void
{
    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_admin_records (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          module ENUM('events', 'hotels', 'packages', 'community', 'membership', 'partners', 'gallery') NOT NULL,
          slug VARCHAR(160) NOT NULL,
          title VARCHAR(190) NOT NULL,
          status VARCHAR(40) NOT NULL DEFAULT 'draft',
          data JSON NOT NULL,
          created_by INT UNSIGNED NULL,
          updated_by INT UNSIGNED NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY platform_admin_records_module_slug_unique (module, slug),
          INDEX platform_admin_records_module_status_idx (module, status),
          INDEX platform_admin_records_created_idx (created_at)
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_admin_audit_logs (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          admin_id INT UNSIGNED NULL,
          module VARCHAR(80) NOT NULL,
          record_id INT UNSIGNED NULL,
          action VARCHAR(80) NOT NULL,
          before_data JSON NULL,
          after_data JSON NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX platform_admin_audit_logs_module_idx (module, record_id),
          INDEX platform_admin_audit_logs_admin_idx (admin_id, created_at)
        )"
    );
}

function hotmess_admin_slugify(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?: 'record';
    return trim($value, '-') ?: 'record';
}

function hotmess_admin_payload_from_post(string $module, array $data): array
{
    $payload = [];
    foreach (hotmess_admin_crud_fields($module) as $field) {
        if ($field === 'status') {
            continue;
        }

        if (array_key_exists($field, $data)) {
            $value = $data[$field];
        } elseif ($field === 'title' && isset($data[$module . '_title'])) {
            $value = $data[$module . '_title'];
        } elseif ($field === 'name' && isset($data[$module . '_name'])) {
            $value = $data[$module . '_name'];
        } else {
            continue;
        }

        if (is_array($value)) {
            $payload[$field] = array_values(array_map('strval', $value));
        } else {
            $payload[$field] = trim((string) $value);
        }
    }

    return $payload;
}

function validateAdminRecord(string $module, array $data, ?int $recordId = null): array
{
    $modules = hotmess_admin_crud_modules();
    if (!isset($modules[$module])) {
        return ['Unbekanntes Admin-Modul.'];
    }

    $errors = [];
    $titleField = (string) $modules[$module]['titleField'];
    foreach ($modules[$module]['required'] as $field) {
        if (trim((string) ($data[$field] ?? '')) === '') {
            $errors[] = ucfirst($field) . ' ist ein Pflichtfeld.';
        }
    }

    foreach (['bookingUrl', 'registrationUrl', 'ticketUrl', 'websiteUrl', 'videoUrl', 'heroImage', 'logo'] as $urlField) {
        if (!empty($data[$urlField]) && !filter_var((string) $data[$urlField], FILTER_VALIDATE_URL)) {
            $errors[] = $urlField . ' muss eine gueltige URL sein.';
        }
    }

    foreach (['inquiryEmail', 'contactEmail'] as $emailField) {
        if (!empty($data[$emailField]) && !filter_var((string) $data[$emailField], FILTER_VALIDATE_EMAIL)) {
            $errors[] = $emailField . ' muss eine gueltige E-Mail sein.';
        }
    }

    foreach (['priceFrom', 'priceMonthly', 'priceYearly', 'stars', 'capacity', 'priority'] as $numberField) {
        if (isset($data[$numberField]) && $data[$numberField] !== '' && !is_numeric($data[$numberField])) {
            $errors[] = $numberField . ' muss numerisch sein.';
        }
    }

    foreach (['startDate', 'endDate', 'eventDate'] as $dateField) {
        if (!empty($data[$dateField]) && strtotime((string) $data[$dateField]) === false) {
            $errors[] = $dateField . ' ist kein gueltiges Datum.';
        }
    }

    $status = (string) ($data['status'] ?? 'draft');
    if (!in_array($status, $modules[$module]['statuses'], true)) {
        $errors[] = 'Status ist fuer dieses Modul nicht erlaubt.';
    }

    $slug = hotmess_admin_slugify((string) ($data['slug'] ?? $data[$titleField] ?? 'record'));
    try {
        hotmess_ensure_admin_crud_tables();
        $stmt = db()->prepare('SELECT id FROM platform_admin_records WHERE module = ? AND slug = ? LIMIT 1');
        $stmt->execute([$module, $slug]);
        $existing = $stmt->fetchColumn();
        if ($existing && (int) $existing !== (int) $recordId) {
            $errors[] = 'Slug ist bereits vergeben.';
        }
    } catch (Throwable) {
        // Validation still returns field errors when the DB is unavailable.
    }

    return $errors;
}

function hotmess_admin_audit_log(?int $adminId, string $module, ?int $recordId, string $action, ?array $beforeData, ?array $afterData): void
{
    hotmess_ensure_admin_crud_tables();
    db()->prepare(
        'INSERT INTO platform_admin_audit_logs (admin_id, module, record_id, action, before_data, after_data) VALUES (?, ?, ?, ?, ?, ?)'
    )->execute([
        $adminId,
        $module,
        $recordId,
        $action,
        $beforeData ? json_encode($beforeData, JSON_UNESCAPED_SLASHES) : null,
        $afterData ? json_encode($afterData, JSON_UNESCAPED_SLASHES) : null,
    ]);
}

function getAdminRecordById(string $module, int $id): ?array
{
    hotmess_ensure_admin_crud_tables();
    $stmt = db()->prepare('SELECT * FROM platform_admin_records WHERE module = ? AND id = ? LIMIT 1');
    $stmt->execute([$module, $id]);
    $row = $stmt->fetch();
    if (!$row) {
        return null;
    }

    return hotmess_admin_record_from_row($row);
}

function hotmess_admin_record_from_row(array $row): array
{
    $data = json_decode((string) $row['data'], true) ?: [];
    return [
        'id' => (int) $row['id'],
        'module' => (string) $row['module'],
        'slug' => (string) $row['slug'],
        'title' => (string) $row['title'],
        'status' => (string) $row['status'],
        'data' => $data,
        'createdAt' => (string) $row['created_at'],
        'updatedAt' => (string) $row['updated_at'],
    ];
}

function getAdminRecordsByModule(string $module): array
{
    hotmess_ensure_admin_crud_tables();
    $stmt = db()->prepare('SELECT * FROM platform_admin_records WHERE module = ? ORDER BY updated_at DESC LIMIT 120');
    $stmt->execute([$module]);
    return array_map('hotmess_admin_record_from_row', $stmt->fetchAll());
}

function createAdminRecord(string $module, array $data, int $adminId): int
{
    $modules = hotmess_admin_crud_modules();
    $titleField = (string) $modules[$module]['titleField'];
    $data['status'] = (string) ($data['status'] ?? 'draft');
    $data['slug'] = hotmess_admin_slugify((string) ($data['slug'] ?? $data[$titleField] ?? 'record'));
    $errors = validateAdminRecord($module, $data);
    if ($errors) {
        throw new RuntimeException(implode(' ', $errors));
    }

    hotmess_ensure_admin_crud_tables();
    db()->prepare(
        'INSERT INTO platform_admin_records (module, slug, title, status, data, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([
        $module,
        $data['slug'],
        (string) $data[$titleField],
        $data['status'],
        json_encode($data, JSON_UNESCAPED_SLASHES),
        $adminId,
        $adminId,
    ]);

    $recordId = (int) db()->lastInsertId();
    hotmess_admin_audit_log($adminId, $module, $recordId, 'create', null, $data);
    return $recordId;
}

function updateAdminRecord(string $module, int $recordId, array $data, int $adminId): void
{
    $current = getAdminRecordById($module, $recordId);
    if (!$current) {
        throw new RuntimeException('Datensatz nicht gefunden.');
    }

    $modules = hotmess_admin_crud_modules();
    $titleField = (string) $modules[$module]['titleField'];
    $merged = array_merge($current['data'], array_filter($data, static fn ($value): bool => $value !== '' && $value !== null));
    $merged['status'] = (string) ($merged['status'] ?? $current['status']);
    $merged['slug'] = hotmess_admin_slugify((string) ($merged['slug'] ?? $merged[$titleField] ?? $current['slug']));
    $errors = validateAdminRecord($module, $merged, $recordId);
    if ($errors) {
        throw new RuntimeException(implode(' ', $errors));
    }

    db()->prepare(
        'UPDATE platform_admin_records SET slug = ?, title = ?, status = ?, data = ?, updated_by = ?, updated_at = NOW() WHERE id = ? AND module = ?'
    )->execute([$merged['slug'], (string) $merged[$titleField], $merged['status'], json_encode($merged, JSON_UNESCAPED_SLASHES), $adminId, $recordId, $module]);
    hotmess_admin_audit_log($adminId, $module, $recordId, 'update', $current, $merged);
}

function hotmess_admin_set_status(string $module, int $recordId, string $status, int $adminId, string $action): void
{
    $record = getAdminRecordById($module, $recordId);
    if (!$record) {
        throw new RuntimeException('Datensatz nicht gefunden.');
    }

    $data = $record['data'];
    $data['status'] = $status;
    updateAdminRecord($module, $recordId, $data, $adminId);
    hotmess_admin_audit_log($adminId, $module, $recordId, $action, $record, $data);
}

function archiveAdminRecord(string $module, int $recordId, int $adminId): void
{
    hotmess_admin_set_status($module, $recordId, 'archived', $adminId, 'archive');
}

function publishAdminRecord(string $module, int $recordId, int $adminId): void
{
    hotmess_admin_set_status($module, $recordId, $module === 'partners' ? 'active' : 'published', $adminId, 'publish');
}

function deleteAdminRecord(string $module, int $recordId, int $adminId): void
{
    $record = getAdminRecordById($module, $recordId);
    if (!$record) {
        throw new RuntimeException('Datensatz nicht gefunden.');
    }

    db()->prepare('DELETE FROM platform_admin_records WHERE id = ? AND module = ?')->execute([$recordId, $module]);
    hotmess_admin_audit_log($adminId, $module, $recordId, 'delete', $record, null);
}

function duplicateAdminRecord(string $module, int $recordId, int $adminId): int
{
    $record = getAdminRecordById($module, $recordId);
    if (!$record) {
        throw new RuntimeException('Datensatz nicht gefunden.');
    }

    $data = $record['data'];
    $data['status'] = 'draft';
    $data['slug'] = hotmess_admin_slugify($record['slug'] . '-copy-' . time());
    $titleField = (string) hotmess_admin_crud_modules()[$module]['titleField'];
    $data[$titleField] = (string) ($data[$titleField] ?? $record['title']) . ' Copy';
    $newId = createAdminRecord($module, $data, $adminId);
    hotmess_admin_audit_log($adminId, $module, $newId, 'duplicate', $record, $data);
    return $newId;
}

function hotmess_admin_crud_handle_action(string $action, array $post, int $adminId): ?array
{
    $prefixMap = [
        'event_' => 'events',
        'hotel_' => 'hotels',
        'package_' => 'packages',
        'community_' => 'community',
        'membership_' => 'membership',
        'partner_' => 'partners',
        'gallery_' => 'gallery',
    ];

    $module = null;
    foreach ($prefixMap as $prefix => $candidate) {
        if (strpos($action, $prefix) === 0) {
            $module = $candidate;
            break;
        }
    }

    if ($module === null) {
        return null;
    }

    $payload = hotmess_admin_payload_from_post($module, $post);
    $recordId = (int) ($post['record_id'] ?? $post['admin_record_id'] ?? 0);
    $operation = str_contains($action, 'publish') ? 'publish'
        : (str_contains($action, 'archive') ? 'archive'
        : (str_contains($action, 'delete') ? 'delete'
        : (str_contains($action, 'duplicate') ? 'duplicate'
        : (str_contains($action, 'update') || str_contains($action, 'status') || str_contains($action, 'toggle') || str_contains($action, 'price') || str_contains($action, 'placement') || str_contains($action, 'offer') || str_contains($action, 'assignments') || str_contains($action, 'images') || str_contains($action, 'cover') || str_contains($action, 'video') ? 'update' : 'create'))));

    if ($operation === 'create' || ($operation === 'update' && $recordId <= 0)) {
        $payload['status'] = (string) ($post['status'] ?? ($operation === 'create' ? 'draft' : 'draft'));
        $recordId = createAdminRecord($module, $payload, $adminId);
    } elseif ($operation === 'update') {
        updateAdminRecord($module, $recordId, $payload, $adminId);
    } elseif ($operation === 'publish') {
        if ($recordId <= 0) {
            $payload['status'] = $module === 'partners' ? 'active' : 'published';
            $recordId = createAdminRecord($module, $payload, $adminId);
        } else {
            publishAdminRecord($module, $recordId, $adminId);
        }
    } elseif ($operation === 'archive') {
        archiveAdminRecord($module, $recordId, $adminId);
    } elseif ($operation === 'delete') {
        if (($post['confirm_delete'] ?? '') !== '1') {
            throw new RuntimeException('Loeschen braucht eine Bestaetigung.');
        }
        deleteAdminRecord($module, $recordId, $adminId);
    } elseif ($operation === 'duplicate') {
        $recordId = duplicateAdminRecord($module, $recordId, $adminId);
    }

    return ['module' => $module, 'operation' => $operation, 'recordId' => $recordId];
}

function render_admin_crud_panel(string $module): void
{
    if (!isset(hotmess_admin_crud_modules()[$module])) {
        return;
    }

    try {
        $records = getAdminRecordsByModule($module);
    } catch (Throwable) {
        $records = [];
    }
    $config = hotmess_admin_crud_modules()[$module];
    $titleField = (string) $config['titleField'];
    ?>
    <section class="admin-module-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Produktives CRUD</p>
        <h2><?= e($config['label']) ?> verwalten</h2>
        <p>Neue Admin-Datensaetze werden datenbankbasiert gespeichert, validiert und per Audit Log protokolliert.</p>
      </div>
      <form class="gallery-filter inquiry-admin-filter" method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <input type="hidden" name="action" value="<?= e(rtrim($module, 's')) ?>_create" />
        <label><?= $titleField === 'name' ? 'Name' : 'Titel' ?><input name="<?= e($titleField) ?>" required /></label>
        <label>Slug<input name="slug" placeholder="automatisch, falls leer" /></label>
        <label>Stadt<input name="city" /></label>
        <label>Status<select name="status">
          <?php foreach ($config['statuses'] as $status): ?>
            <option value="<?= e($status) ?>"><?= e($status) ?></option>
          <?php endforeach; ?>
        </select></label>
        <button class="button primary" type="submit">Neu speichern</button>
      </form>
      <div class="table-wrap">
        <table class="admin-lux-table">
          <thead><tr><th>Datensatz</th><th>Status</th><th>Slug</th><th>Aktualisiert</th><th>Aktionen</th></tr></thead>
          <tbody>
            <?php foreach ($records as $record): ?>
              <tr>
                <td><strong>#<?= e((string) $record['id']) ?> <?= e($record['title']) ?></strong><span><?= e((string) ($record['data']['city'] ?? '')) ?></span></td>
                <td><span class="status-pill"><?= e($record['status']) ?></span></td>
                <td><?= e($record['slug']) ?></td>
                <td><?= e($record['updatedAt']) ?></td>
                <td>
                  <form method="post" class="inline-admin-actions">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                    <input type="hidden" name="record_id" value="<?= e((string) $record['id']) ?>" />
                    <input type="hidden" name="<?= e($titleField) ?>" value="<?= e($record['title']) ?>" />
                    <button class="button ghost" name="action" value="<?= e(rtrim($module, 's')) ?>_publish" type="submit">Publish</button>
                    <button class="button ghost" name="action" value="<?= e(rtrim($module, 's')) ?>_archive" type="submit">Archiv</button>
                    <button class="button ghost" name="action" value="<?= e(rtrim($module, 's')) ?>_duplicate" type="submit">Duplizieren</button>
                    <label class="check-row"><input type="checkbox" name="confirm_delete" value="1" /> Loeschen bestaetigen</label>
                    <button class="button ghost" name="action" value="<?= e(rtrim($module, 's')) ?>_delete" type="submit">Loeschen</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
            <?php if (!$records): ?>
              <tr><td colspan="5"><strong>Noch keine produktiven Admin-Datensaetze.</strong><span>Erstelle oben den ersten Eintrag fuer dieses Modul.</span></td></tr>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </section>
    <?php
}
