<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/storage-service.php';

$admin = require_admin();
$moduleFilter = trim((string) ($_GET['module'] ?? ''));
$typeFilter = trim((string) ($_GET['type'] ?? ''));
$statusFilter = trim((string) ($_GET['status'] ?? ''));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $action = (string) ($_POST['action'] ?? '');

    try {
        if ($action === 'media_upload') {
            $asset = hotmess_handle_admin_media_upload($_POST, $_FILES, (int) $admin['id']);
            flash('Medium wurde gespeichert: ' . (string) ($asset['public_url'] ?? $asset['path']));
            redirect('/admin/media');
        }

        if ($action === 'media_archive') {
            hotmess_archive_media_asset((int) ($_POST['asset_id'] ?? 0));
            flash('Medium wurde archiviert.');
            redirect('/admin/media');
        }

        if ($action === 'media_delete') {
            if (($_POST['confirm_delete'] ?? '') !== '1') {
                throw new RuntimeException('Loeschen braucht eine Bestaetigung.');
            }
            hotmess_delete_media_asset((int) ($_POST['asset_id'] ?? 0));
            flash('Medium wurde als geloescht markiert.');
            redirect('/admin/media');
        }
    } catch (Throwable $exception) {
        flash('Medien-Aktion fehlgeschlagen: ' . $exception->getMessage());
        redirect('/admin/media');
    }
}

$status = getStorageProviderStatus();
$assets = hotmess_media_assets([
    'module' => $moduleFilter,
    'type' => $typeFilter,
    'status' => $statusFilter,
]);
$categories = hotmess_media_categories();

render_header('Admin Media | HOTMESS BLKN');
?>

<main class="admin-page enterprise-admin-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Admin / Media Library</p>
    <h1>HOTMESS Medienverwaltung</h1>
    <p>Verwalte Uploads fuer Chat, Galerie, Events, Hotels, Packages, Partner und Audio sicher an einer Stelle.</p>
    <div class="admin-tab-nav">
      <a href="/admin/media" class="is-active">Media</a>
      <a href="/admin/gallery">Gallery</a>
      <a href="/admin/events">Events</a>
      <a href="/admin/hotels">Hotels</a>
      <a href="/admin/packages">Packages</a>
      <a href="/admin/partners">Partner</a>
      <a href="/admin/system">System</a>
    </div>
  </section>

  <section class="platform-section">
    <div class="admin-kpi-grid">
      <article><span>Provider</span><strong><?= e($status['provider']) ?></strong><p><?= e($status['message']) ?></p></article>
      <article><span>Bucket</span><strong><?= e((string) $status['bucket']) ?></strong><p>Keine Secrets werden angezeigt.</p></article>
      <article><span>Public Base URL</span><strong><?= e($status['publicBaseUrl'] ?: 'nicht gesetzt') ?></strong><p>R2 URL fuer spaetere Auslieferung.</p></article>
      <article><span>Assets</span><strong><?= e((string) count($assets)) ?></strong><p>Gefilterte Medien in dieser Ansicht.</p></article>
    </div>
    <?php if (!$status['configured']): ?>
      <p class="field-hint">Cloudflare R2 nicht konfiguriert. Lokaler Upload-Fallback ist aktiv.</p>
    <?php endif; ?>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Upload</p>
      <h2>Medium hochladen.</h2>
      <p>Dateien werden serverseitig nach Kategorie, MIME-Type und Groesse geprueft.</p>
    </div>
    <form class="gallery-filter inquiry-admin-filter" method="post" enctype="multipart/form-data">
      <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
      <input type="hidden" name="action" value="media_upload" />
      <label>Kategorie
        <select name="media_category" required>
          <?php foreach ($categories as $key => $category): ?>
            <option value="<?= e($key) ?>"><?= e($category['label']) ?> / max <?= e(hotmess_media_human_size((int) $category['maxSize'])) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Bereich
        <select name="related_module">
          <?php foreach (['gallery', 'events', 'hotels', 'packages', 'partners', 'chat', 'admin'] as $module): ?>
            <option value="<?= e($module) ?>"><?= e($module) ?></option>
          <?php endforeach; ?>
        </select>
      </label>
      <label>Bezugs-ID optional<input name="related_id" placeholder="z.B. Event-Slug, Gallery-ID oder Partner-ID" /></label>
      <label>Datei<input type="file" name="media_file" required /></label>
      <button class="button primary" type="submit">Medium speichern</button>
    </form>
  </section>

  <section class="platform-section">
    <div class="section-heading platform-heading">
      <p class="eyebrow">Filter</p>
      <h2>Medien suchen.</h2>
    </div>
    <form class="gallery-filter inquiry-admin-filter" method="get">
      <label>Modul<input name="module" value="<?= e($moduleFilter) ?>" placeholder="gallery, events, chat..." /></label>
      <label>Typ<select name="type">
        <option value="">Alle</option>
        <?php foreach (['image', 'video', 'audio', 'file'] as $type): ?>
          <option value="<?= e($type) ?>" <?= $typeFilter === $type ? 'selected' : '' ?>><?= e($type) ?></option>
        <?php endforeach; ?>
      </select></label>
      <label>Status<select name="status">
        <option value="">Alle</option>
        <?php foreach (['active', 'processing', 'failed', 'archived', 'deleted'] as $assetStatus): ?>
          <option value="<?= e($assetStatus) ?>" <?= $statusFilter === $assetStatus ? 'selected' : '' ?>><?= e($assetStatus) ?></option>
        <?php endforeach; ?>
      </select></label>
      <button class="button ghost" type="submit">Filtern</button>
    </form>
  </section>

  <section class="platform-section">
    <div class="table-wrap">
      <table class="admin-lux-table">
        <thead>
          <tr><th>Vorschau</th><th>Datei</th><th>Modul</th><th>Typ</th><th>Groesse</th><th>Status</th><th>Upload</th><th>Aktionen</th></tr>
        </thead>
        <tbody>
          <?php foreach ($assets as $asset): ?>
            <?php $url = (string) ($asset['public_url'] ?: getPublicMediaUrl((string) $asset['path'])); ?>
            <tr>
              <td>
                <?php if (($asset['media_type'] ?? '') === 'image'): ?>
                  <img src="<?= e($url) ?>" alt="Medienvorschau" style="width:72px;height:52px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,.12)" />
                <?php else: ?>
                  <span class="status-pill"><?= e((string) $asset['media_type']) ?></span>
                <?php endif; ?>
              </td>
              <td><strong><?= e(basename((string) $asset['path'])) ?></strong><span><?= e($url) ?></span></td>
              <td><?= e((string) ($asset['related_module'] ?? '')) ?><?= !empty($asset['related_id']) ? ' / ' . e((string) $asset['related_id']) : '' ?></td>
              <td><?= e((string) $asset['mime_type']) ?></td>
              <td><?= e(hotmess_media_human_size((int) $asset['file_size'])) ?></td>
              <td><span class="status-pill"><?= e((string) $asset['status']) ?></span></td>
              <td><?= e((string) $asset['created_at']) ?></td>
              <td>
                <form method="post" class="inline-admin-actions">
                  <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                  <input type="hidden" name="asset_id" value="<?= e((string) $asset['id']) ?>" />
                  <a class="button ghost" href="<?= e($url) ?>" target="_blank" rel="noopener">Oeffnen</a>
                  <button class="button ghost" name="action" value="media_archive" type="submit">Archivieren</button>
                  <label class="check-row"><input type="checkbox" name="confirm_delete" value="1" /> Loeschen bestaetigen</label>
                  <button class="button ghost" name="action" value="media_delete" type="submit">Loeschen</button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$assets): ?>
            <tr><td colspan="8"><strong>Noch keine Medien gefunden.</strong><span>Lade oben ein Medium hoch oder passe die Filter an.</span></td></tr>
          <?php endif; ?>
        </tbody>
      </table>
    </div>
  </section>
</main>

<?php render_footer(); ?>
