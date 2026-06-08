<?php

declare(strict_types=1);

require_once __DIR__ . '/../../app/bootstrap.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$user = current_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthenticated']);
    exit;
}

mark_user_seen((int) $user['id']);

if (($user['role'] ?? '') !== 'admin' && ($user['status'] ?? '') !== 'approved') {
    http_response_code(403);
    echo json_encode(['error' => 'Only approved members can use profile visitors']);
    exit;
}
$page = max(1, (int) ($_GET['page'] ?? 1));
$limit = min(100, max(1, (int) ($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

$items = array_map(static function (array $visitor): array {
    return [
        'viewer_user_id' => (int) $visitor['viewer_user_id'],
        'name' => $visitor['name'],
        'username' => '@' . ltrim((string) $visitor['instagram_handle'], '@'),
        'profile_photo' => $visitor['profile_photo'],
        'last_viewed_at' => $visitor['last_viewed_at'],
        'total_views' => (int) $visitor['total_views'],
        'online' => is_user_online($visitor['last_seen_at'] ?? null),
    ];
}, profile_visitors((int) $user['id'], $limit, $offset));

echo json_encode([
    'page' => $page,
    'limit' => $limit,
    'items' => $items,
]);
