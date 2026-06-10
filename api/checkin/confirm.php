<?php

declare(strict_types=1);

require_once __DIR__ . '/../../app/bootstrap.php';
require_once __DIR__ . '/../../app/checkin-data.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$user = authenticated_user();

if (!$user) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Nicht angemeldet']);
    exit;
}

$role = hotmess_checkin_role($user);
if ($role === null) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Kein Check-In Zugriff']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$ticketId = (int) ($body['ticket_id'] ?? $_POST['ticket_id'] ?? 0);
$location = trim((string) ($body['location'] ?? $_POST['location'] ?? ''));
$device   = trim((string) ($body['device'] ?? $_POST['device'] ?? ''));

// CSRF-Prüfung für JSON-Requests via Header
$csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
$csrfPost   = $body['csrf_token'] ?? $_POST['csrf_token'] ?? '';
$csrfToken  = $csrfHeader !== '' ? $csrfHeader : $csrfPost;
if (!hash_equals((string) csrf_token(), (string) $csrfToken)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Ungültiger CSRF-Token']);
    exit;
}

if ($ticketId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Ungültige Ticket-ID']);
    exit;
}

try {
    hotmess_checkin_ensure_schema();
    $result = hotmess_checkin_perform($ticketId, (int) $user['id'], $role, $location, $device);
    echo json_encode($result);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Serverfehler', 'detail' => $e->getMessage()]);
}
