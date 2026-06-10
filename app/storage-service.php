<?php

declare(strict_types=1);

require_once __DIR__ . '/media-config.php';

function hotmess_storage_env(string $key, string $fallback = ''): string
{
    $value = getenv($key);

    return $value === false || $value === '' ? $fallback : trim((string) $value);
}

function isStorageConfigured(): bool
{
    return hotmess_storage_env('R2_ACCOUNT_ID') !== ''
        && hotmess_storage_env('R2_ACCESS_KEY_ID') !== ''
        && hotmess_storage_env('R2_SECRET_ACCESS_KEY') !== ''
        && hotmess_storage_env('R2_BUCKET_NAME') !== '';
}

function hotmess_ensure_media_assets_table(): void
{
    db()->exec(
        "CREATE TABLE IF NOT EXISTS media_assets (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          storage_provider ENUM('local', 'r2') NOT NULL DEFAULT 'local',
          bucket VARCHAR(190) NULL,
          folder VARCHAR(190) NOT NULL,
          path VARCHAR(255) NOT NULL,
          public_url VARCHAR(500) NULL,
          media_type VARCHAR(40) NOT NULL,
          mime_type VARCHAR(120) NOT NULL,
          file_size INT UNSIGNED NOT NULL DEFAULT 0,
          width INT UNSIGNED NULL,
          height INT UNSIGNED NULL,
          duration DECIMAL(10,2) NULL,
          thumbnail_url VARCHAR(500) NULL,
          uploaded_by INT UNSIGNED NULL,
          related_module VARCHAR(80) NULL,
          related_id VARCHAR(120) NULL,
          status ENUM('active', 'processing', 'failed', 'archived', 'deleted') NOT NULL DEFAULT 'active',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX media_assets_status_idx (status, created_at),
          INDEX media_assets_module_idx (related_module, related_id),
          INDEX media_assets_type_idx (media_type, mime_type),
          INDEX media_assets_uploader_idx (uploaded_by, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function getStorageProviderStatus(): array
{
    hotmess_ensure_media_assets_table();

    $required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_BASE_URL'];
    $missing = [];
    foreach ($required as $key) {
        if (hotmess_storage_env($key) === '') {
            $missing[] = $key;
        }
    }

    $lastUpload = db()->query('SELECT * FROM media_assets ORDER BY created_at DESC LIMIT 1')->fetch() ?: null;
    $lastError = db()->query('SELECT * FROM media_assets WHERE status = "failed" ORDER BY created_at DESC LIMIT 1')->fetch() ?: null;

    return [
        'provider' => isStorageConfigured() ? 'r2' : 'local',
        'configured' => isStorageConfigured(),
        'bucket' => hotmess_storage_env('R2_BUCKET_NAME', 'hotmess-media'),
        'publicBaseUrl' => hotmess_storage_env('R2_PUBLIC_BASE_URL'),
        'missingEnv' => $missing,
        'lastUpload' => $lastUpload,
        'lastError' => $lastError,
        'message' => isStorageConfigured() ? 'Cloudflare R2 ist konfiguriert.' : 'Cloudflare R2 nicht konfiguriert. Lokaler Upload-Fallback ist aktiv.',
    ];
}

function validateMediaSize(array $file, int $maxSize): bool
{
    $size = (int) ($file['size'] ?? 0);

    if ($size <= 0 || $size > $maxSize) {
        throw new RuntimeException('Die Datei ist zu gross. Limit: ' . hotmess_media_human_size($maxSize) . '.');
    }

    return true;
}

function hotmess_detect_mime_type(string $path): string
{
    if (class_exists('finfo')) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = (string) $finfo->file($path);
        if ($mime !== '') {
            return $mime;
        }
    }

    if (function_exists('mime_content_type')) {
        $mime = (string) @mime_content_type($path);
        if ($mime !== '' && $mime !== 'application/octet-stream') {
            return $mime;
        }
    }

    $imageInfo = @getimagesize($path);
    if ($imageInfo && !empty($imageInfo['mime'])) {
        return (string) $imageInfo['mime'];
    }

    return 'application/octet-stream';
}

function validateMediaType(array $file, array $allowedTypes): bool
{
    $tmpName = (string) ($file['tmp_name'] ?? '');
    if ($tmpName === '' || !is_file($tmpName)) {
        throw new RuntimeException('Die Upload-Datei konnte nicht gelesen werden.');
    }

    $mime = hotmess_detect_mime_type($tmpName);
    $extension = strtolower((string) pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
    $allowedMimeTypes = (array) ($allowedTypes['mimeTypes'] ?? []);
    $allowedExtensions = (array) ($allowedTypes['extensions'] ?? []);

    if (!in_array($mime, $allowedMimeTypes, true) || !in_array($extension, $allowedExtensions, true)) {
        throw new RuntimeException('Dieser Dateityp ist nicht erlaubt.');
    }

    if ($extension === 'svg' && (($allowedTypes['mediaType'] ?? '') !== 'image' || !in_array('svg', $allowedExtensions, true))) {
        throw new RuntimeException('SVG ist nur fuer freigegebene Partnerlogos erlaubt.');
    }

    return true;
}

function generateMediaFilename(array $file, string $prefix = ''): string
{
    $extension = strtolower((string) pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
    $safePrefix = preg_replace('/[^a-z0-9-]+/i', '-', $prefix);
    $safePrefix = trim((string) $safePrefix, '-');
    $base = $safePrefix !== '' ? $safePrefix . '-' : '';

    return strtolower($base . date('Ymd-His') . '-' . bin2hex(random_bytes(10)) . '.' . $extension);
}

function hotmess_storage_detect_dimensions(string $path, string $mime): array
{
    if (!str_starts_with($mime, 'image/') || $mime === 'image/svg+xml') {
        return [null, null];
    }

    $info = @getimagesize($path);
    if (!$info) {
        return [null, null];
    }

    return [(int) $info[0], (int) $info[1]];
}

function hotmess_r2_signing_key(string $secret, string $date, string $region = 'auto', string $service = 's3'): string
{
    $kDate = hash_hmac('sha256', $date, 'AWS4' . $secret, true);
    $kRegion = hash_hmac('sha256', $region, $kDate, true);
    $kService = hash_hmac('sha256', $service, $kRegion, true);

    return hash_hmac('sha256', 'aws4_request', $kService, true);
}

function hotmess_upload_to_r2(string $source, string $key, string $mime): array
{
    $accountId = hotmess_storage_env('R2_ACCOUNT_ID');
    $accessKey = hotmess_storage_env('R2_ACCESS_KEY_ID');
    $secretKey = hotmess_storage_env('R2_SECRET_ACCESS_KEY');
    $bucket = hotmess_storage_env('R2_BUCKET_NAME');
    $endpointHost = $accountId . '.r2.cloudflarestorage.com';
    $path = '/' . rawurlencode($bucket) . '/' . str_replace('%2F', '/', rawurlencode($key));
    $url = 'https://' . $endpointHost . $path;
    $payload = (string) file_get_contents($source);
    $payloadHash = hash('sha256', $payload);
    $amzDate = gmdate('Ymd\THis\Z');
    $date = gmdate('Ymd');
    $credentialScope = $date . '/auto/s3/aws4_request';
    $canonicalHeaders = 'amz-content-sha256:' . $payloadHash . "\n" . 'host:' . $endpointHost . "\n" . 'x-amz-date:' . $amzDate . "\n";
    $canonicalRequest = "PUT\n" . $path . "\n\n" . $canonicalHeaders . "\namz-content-sha256;host;x-amz-date\n" . $payloadHash;
    $stringToSign = "AWS4-HMAC-SHA256\n" . $amzDate . "\n" . $credentialScope . "\n" . hash('sha256', $canonicalRequest);
    $signature = hash_hmac('sha256', $stringToSign, hotmess_r2_signing_key($secretKey, $date));
    $authorization = 'AWS4-HMAC-SHA256 Credential=' . $accessKey . '/' . $credentialScope . ', SignedHeaders=amz-content-sha256;host;x-amz-date, Signature=' . $signature;

    $headers = [
        'Content-Type: ' . $mime,
        'Content-Length: ' . strlen($payload),
        'x-amz-date: ' . $amzDate,
        'x-amz-content-sha256: ' . $payloadHash,
        'Authorization: ' . $authorization,
    ];

    if (!function_exists('curl_init')) {
        throw new RuntimeException('cURL ist fuer R2 Uploads nicht verfuegbar.');
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST => 'PUT',
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 45,
    ]);
    $response = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($response === false || $status < 200 || $status >= 300) {
        throw new RuntimeException('R2 Upload fehlgeschlagen: HTTP ' . $status . ($error ? ' / ' . $error : ''));
    }

    $baseUrl = rtrim(hotmess_storage_env('R2_PUBLIC_BASE_URL'), '/');

    return [
        'provider' => 'r2',
        'bucket' => $bucket,
        'path' => $key,
        'publicUrl' => $baseUrl !== '' ? $baseUrl . '/' . ltrim($key, '/') : null,
    ];
}

function hotmess_store_file_locally(string $source, string $folder, string $filename): array
{
    $safeFolder = trim(preg_replace('/[^a-z0-9\\/_-]+/i', '-', $folder) ?: 'media', '/');
    $relativeDir = 'uploads/' . $safeFolder . '/' . date('Y/m');
    $targetDir = __DIR__ . '/../' . $relativeDir;

    if (!is_dir($targetDir) && !mkdir($targetDir, 0755, true)) {
        throw new RuntimeException('Upload-Ordner konnte nicht erstellt werden.');
    }

    $target = $targetDir . '/' . $filename;
    if (is_uploaded_file($source)) {
        $stored = move_uploaded_file($source, $target);
    } else {
        $stored = copy($source, $target);
    }

    if (!$stored) {
        throw new RuntimeException('Datei konnte nicht gespeichert werden.');
    }

    $path = $relativeDir . '/' . $filename;

    return [
        'provider' => 'local',
        'bucket' => null,
        'path' => $path,
        'publicUrl' => '/' . $path,
        'absolutePath' => $target,
    ];
}

function createMediaThumbnail(string $path): ?string
{
    if (!is_file($path) || !function_exists('imagecreatefromjpeg')) {
        return null;
    }

    $mime = hotmess_detect_mime_type($path);
    $src = match ($mime) {
        'image/jpeg' => @imagecreatefromjpeg($path),
        'image/png'  => @imagecreatefrompng($path),
        'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : null,
        default      => null,
    };

    if (!$src) {
        return null;
    }

    $srcW = (int) imagesx($src);
    $srcH = (int) imagesy($src);
    if ($srcW <= 0) {
        imagedestroy($src);
        return null;
    }

    $thumbW = 320;
    $thumbH = (int) round($srcH * $thumbW / $srcW);
    $thumb = imagecreatetruecolor($thumbW, max(1, $thumbH));
    if (!$thumb) {
        imagedestroy($src);
        return null;
    }

    imagecopyresampled($thumb, $src, 0, 0, 0, 0, $thumbW, $thumbH, $srcW, $srcH);
    imagedestroy($src);

    $thumbPath = (string) preg_replace('/\.[^.]+$/', '-thumb.jpg', $path);
    if ($thumbPath === $path || !imagejpeg($thumb, $thumbPath, 85)) {
        imagedestroy($thumb);
        return null;
    }

    imagedestroy($thumb);

    $docRoot = rtrim(str_replace('\\', '/', (string) (realpath(__DIR__ . '/../') ?: dirname(__DIR__))), '/');
    $absPath = rtrim(str_replace('\\', '/', $thumbPath), '/');
    $relPath = str_starts_with($absPath, $docRoot) ? ltrim(substr($absPath, strlen($docRoot)), '/') : null;

    return $relPath ? '/' . $relPath : null;
}

function logMediaUpload(?int $userId, string $path, string $type, int $size, string $status, array $meta = []): ?int
{
    try {
        hotmess_ensure_media_assets_table();

        $stmt = db()->prepare(
            'INSERT INTO media_assets (storage_provider, bucket, folder, path, public_url, media_type, mime_type, file_size, width, height, duration, thumbnail_url, uploaded_by, related_module, related_id, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            (string) ($meta['storage_provider'] ?? 'local'),
            $meta['bucket'] ?? null,
            (string) ($meta['folder'] ?? ''),
            $path,
            $meta['public_url'] ?? null,
            $type,
            (string) ($meta['mime_type'] ?? ''),
            $size,
            $meta['width'] ?? null,
            $meta['height'] ?? null,
            $meta['duration'] ?? null,
            $meta['thumbnail_url'] ?? null,
            $userId,
            $meta['related_module'] ?? null,
            $meta['related_id'] ?? null,
            $status,
        ]);

        return (int) db()->lastInsertId();
    } catch (Throwable) {
        return null;
    }
}

function uploadMedia(array $file, string $folder, array $allowedTypes, int $maxSize, array $meta = []): array
{
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Die Datei konnte nicht hochgeladen werden.');
    }

    validateMediaSize($file, $maxSize);
    validateMediaType($file, $allowedTypes);

    $tmpName = (string) $file['tmp_name'];
    $mime = hotmess_detect_mime_type($tmpName);
    $mediaType = (string) ($allowedTypes['mediaType'] ?? 'file');
    $filename = generateMediaFilename($file, (string) ($meta['prefix'] ?? $mediaType));
    $key = trim($folder, '/') . '/' . date('Y/m') . '/' . $filename;
    [$width, $height] = hotmess_storage_detect_dimensions($tmpName, $mime);

    try {
        $stored = isStorageConfigured()
            ? hotmess_upload_to_r2($tmpName, $key, $mime)
            : hotmess_store_file_locally($tmpName, $folder, $filename);
        $thumbnailUrl = createMediaThumbnail((string) ($stored['absolutePath'] ?? $stored['path']));
        $assetId = logMediaUpload($meta['uploaded_by'] ?? null, (string) $stored['path'], $mediaType, (int) $file['size'], 'active', [
            'storage_provider' => $stored['provider'],
            'bucket' => $stored['bucket'] ?? null,
            'folder' => $folder,
            'public_url' => $stored['publicUrl'] ?? null,
            'mime_type' => $mime,
            'width' => $width,
            'height' => $height,
            'thumbnail_url' => $thumbnailUrl,
            'related_module' => $meta['related_module'] ?? null,
            'related_id' => $meta['related_id'] ?? null,
        ]);

        return [
            'id' => $assetId,
            'storage_provider' => $stored['provider'],
            'path' => $stored['path'],
            'public_url' => $stored['publicUrl'] ?? null,
            'media_type' => $mediaType,
            'mime_type' => $mime,
            'file_size' => (int) $file['size'],
            'width' => $width,
            'height' => $height,
            'thumbnail_url' => $thumbnailUrl,
        ];
    } catch (Throwable $exception) {
        logMediaUpload($meta['uploaded_by'] ?? null, $key, $mediaType, (int) ($file['size'] ?? 0), 'failed', [
            'storage_provider' => isStorageConfigured() ? 'r2' : 'local',
            'bucket' => hotmess_storage_env('R2_BUCKET_NAME'),
            'folder' => $folder,
            'mime_type' => $mime,
            'related_module' => $meta['related_module'] ?? null,
            'related_id' => $meta['related_id'] ?? null,
        ]);
        throw $exception;
    }
}

function getPublicMediaUrl(string $path): string
{
    if (preg_match('/^https?:\\/\\//', $path)) {
        return $path;
    }

    $baseUrl = rtrim(hotmess_storage_env('R2_PUBLIC_BASE_URL'), '/');
    if ($baseUrl !== '' && !str_starts_with($path, 'uploads/')) {
        return $baseUrl . '/' . ltrim($path, '/');
    }

    return '/' . ltrim($path, '/');
}

function deleteMedia(string $path): bool
{
    hotmess_ensure_media_assets_table();

    $stmt = db()->prepare('UPDATE media_assets SET status = "deleted", updated_at = NOW() WHERE path = ? LIMIT 1');
    $stmt->execute([$path]);

    return $stmt->rowCount() > 0;
}

function hotmess_archive_media_asset(int $assetId): void
{
    hotmess_ensure_media_assets_table();
    $stmt = db()->prepare('UPDATE media_assets SET status = "archived", updated_at = NOW() WHERE id = ? LIMIT 1');
    $stmt->execute([$assetId]);
}

function hotmess_delete_media_asset(int $assetId): void
{
    hotmess_ensure_media_assets_table();
    $stmt = db()->prepare('UPDATE media_assets SET status = "deleted", updated_at = NOW() WHERE id = ? LIMIT 1');
    $stmt->execute([$assetId]);
}

function hotmess_media_assets(array $filters = [], int $limit = 120): array
{
    hotmess_ensure_media_assets_table();

    $where = [];
    $params = [];
    foreach (['related_module' => 'module', 'media_type' => 'type', 'status' => 'status'] as $column => $filterKey) {
        if (!empty($filters[$filterKey])) {
            $where[] = $column . ' = ?';
            $params[] = (string) $filters[$filterKey];
        }
    }

    $sql = 'SELECT * FROM media_assets';
    if ($where) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $sql .= ' ORDER BY created_at DESC LIMIT ' . max(1, min(300, $limit));

    $stmt = db()->prepare($sql);
    $stmt->execute($params);

    return $stmt->fetchAll();
}

function hotmess_handle_admin_media_upload(array $post, array $files, int $adminId): array
{
    $categoryKey = (string) ($post['media_category'] ?? '');
    $category = hotmess_media_category($categoryKey);
    if (!$category) {
        throw new RuntimeException('Unbekannte Upload-Kategorie.');
    }

    $file = $files['media_file'] ?? null;
    if (!$file || ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        throw new RuntimeException('Bitte eine Datei auswaehlen.');
    }

    return uploadMedia($file, (string) $category['folder'], $category, (int) $category['maxSize'], [
        'uploaded_by' => $adminId,
        'related_module' => trim((string) ($post['related_module'] ?? 'admin')),
        'related_id' => trim((string) ($post['related_id'] ?? '')),
        'prefix' => $categoryKey,
    ]);
}
