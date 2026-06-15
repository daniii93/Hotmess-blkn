<?php

declare(strict_types=1);

function hotmess_media_categories(): array
{
    $mb = 1024 * 1024;

    return [
        'chat_image' => [
            'label' => 'Chat Bild',
            'folder' => 'chat-media/images',
            'mediaType' => 'image',
            'extensions' => ['jpg', 'jpeg', 'png', 'webp'],
            'mimeTypes' => ['image/jpeg', 'image/png', 'image/webp'],
            'maxSize' => 10 * $mb,
        ],
        'chat_video' => [
            'label' => 'Chat Video',
            'folder' => 'chat-media/videos',
            'mediaType' => 'video',
            'extensions' => ['mp4', 'mov'],
            'mimeTypes' => ['video/mp4', 'video/quicktime'],
            'maxSize' => 100 * $mb,
        ],
        'chat_audio' => [
            'label' => 'Chat Audio',
            'folder' => 'chat-media/audio',
            'mediaType' => 'audio',
            'extensions' => ['mp3', 'm4a', 'wav', 'webm'],
            'mimeTypes' => ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/x-wav'],
            'maxSize' => 25 * $mb,
        ],
        'gallery_image' => [
            'label' => 'Gallery Bild',
            'folder' => 'gallery/images',
            'mediaType' => 'image',
            'extensions' => ['jpg', 'jpeg', 'png', 'webp'],
            'mimeTypes' => ['image/jpeg', 'image/png', 'image/webp'],
            'maxSize' => 20 * $mb,
        ],
        'gallery_video' => [
            'label' => 'Gallery Video',
            'folder' => 'gallery/videos',
            'mediaType' => 'video',
            'extensions' => ['mp4', 'mov'],
            'mimeTypes' => ['video/mp4', 'video/quicktime'],
            'maxSize' => 500 * $mb,
        ],
        'event_image' => [
            'label' => 'Event Bild',
            'folder' => 'events',
            'mediaType' => 'image',
            'extensions' => ['jpg', 'jpeg', 'png', 'webp'],
            'mimeTypes' => ['image/jpeg', 'image/png', 'image/webp'],
            'maxSize' => 20 * $mb,
        ],
        'hotel_image' => [
            'label' => 'Hotel Bild',
            'folder' => 'hotels',
            'mediaType' => 'image',
            'extensions' => ['jpg', 'jpeg', 'png', 'webp'],
            'mimeTypes' => ['image/jpeg', 'image/png', 'image/webp'],
            'maxSize' => 20 * $mb,
        ],
        'package_image' => [
            'label' => 'Package Bild',
            'folder' => 'packages',
            'mediaType' => 'image',
            'extensions' => ['jpg', 'jpeg', 'png', 'webp'],
            'mimeTypes' => ['image/jpeg', 'image/png', 'image/webp'],
            'maxSize' => 20 * $mb,
        ],
        'partner_logo' => [
            'label' => 'Partner Logo',
            'folder' => 'partners/logos',
            'mediaType' => 'image',
            'extensions' => ['svg', 'png', 'webp'],
            'mimeTypes' => ['image/svg+xml', 'image/png', 'image/webp'],
            'maxSize' => 5 * $mb,
        ],
        'audio_message' => [
            'label' => 'Audio Nachricht',
            'folder' => 'chat-media/audio',
            'mediaType' => 'audio',
            'extensions' => ['mp3', 'm4a', 'wav', 'webm'],
            'mimeTypes' => ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/x-wav'],
            'maxSize' => 25 * $mb,
        ],
    ];
}

function hotmess_media_category(string $key): ?array
{
    $categories = hotmess_media_categories();

    return $categories[$key] ?? null;
}

function hotmess_media_human_size(int $bytes): string
{
    if ($bytes >= 1024 * 1024 * 1024) {
        return round($bytes / 1024 / 1024 / 1024, 1) . ' GB';
    }

    if ($bytes >= 1024 * 1024) {
        return round($bytes / 1024 / 1024, 1) . ' MB';
    }

    if ($bytes >= 1024) {
        return round($bytes / 1024, 1) . ' KB';
    }

    return $bytes . ' B';
}
