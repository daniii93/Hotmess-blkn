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
    echo json_encode(['error' => 'Only approved members can use profile visitor stats']);
    exit;
}

echo json_encode(profile_visitor_stats((int) $user['id']));
