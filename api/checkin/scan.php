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
$qrCode = trim((string) ($body['qr'] ?? $_POST['qr'] ?? ''));

if ($qrCode === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Kein QR-Code angegeben']);
    exit;
}

try {
    hotmess_checkin_ensure_schema();
    $ticket = hotmess_checkin_find_ticket($qrCode);

    if (!$ticket) {
        echo json_encode(['success' => false, 'status' => 'not_found', 'message' => 'Ticket nicht gefunden']);
        exit;
    }

    $ticketFull = hotmess_checkin_ticket_info((int) $ticket['id']);

    $settings = hotmess_checkin_settings();
    $showLoyalty   = ($settings['show_loyalty'] ?? '1') === '1';
    $showAmbassador = ($settings['show_ambassador'] ?? '1') === '1';
    $showSecurity  = ($settings['show_security_notes'] ?? '1') === '1' && hotmess_checkin_can_manage($role);

    $age = hotmess_checkin_age($ticketFull['birth_date'] ?? null);

    $memberTier = null;
    if ($ticketFull['membership'] ?? null) {
        $memberTier = $ticketFull['membership']['tier_slug'] ?? null;
    }

    $loyaltyData = null;
    if ($showLoyalty && ($ticketFull['loyalty'] ?? null)) {
        $la = $ticketFull['loyalty'];
        $loyaltyData = [
            'tier'     => $la['loyalty_tier'] ?? 'bronze',
            'balance'  => (int) ($la['points_balance'] ?? 0),
            'lifetime' => (int) ($la['points_lifetime'] ?? 0),
        ];
    }

    $ambassadorData = null;
    if ($showAmbassador && ($ticketFull['ambassador'] ?? null)) {
        $amb = $ticketFull['ambassador'];
        $ambassadorData = [
            'role'    => $amb['ambassador_role'] ?? '',
            'city'    => $amb['city'] ?? '',
            'status'  => $amb['status'] ?? '',
        ];
    }

    $securityInfo = null;
    if ($showSecurity) {
        $safetyStatus = (string) ($ticketFull['safety_status'] ?? 'clear');
        $chatStatus   = (string) ($ticketFull['chat_status'] ?? 'active');
        $banReason    = (string) ($ticketFull['ban_reason'] ?? '');
        $modNotes     = (string) ($ticketFull['moderation_notes'] ?? '');
        if ($safetyStatus !== 'clear' || $chatStatus !== 'active' || $banReason !== '' || $modNotes !== '') {
            $securityInfo = [
                'safety_status' => $safetyStatus,
                'chat_status'   => $chatStatus,
                'ban_reason'    => $banReason,
                'mod_notes'     => $modNotes,
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'ticket'  => [
            'id'           => (int) $ticketFull['id'],
            'ticket_number'=> $ticketFull['ticket_number'],
            'event_id'     => $ticketFull['event_id'],
            'event_name'   => $ticketFull['event_name'],
            'ticket_type'  => $ticketFull['ticket_type'],
            'status'       => $ticketFull['status'],
            'purchased_at' => $ticketFull['purchased_at'],
            'checked_in_at'=> $ticketFull['checked_in_at'],
            'last_checkin' => $ticketFull['last_checkin'],
        ],
        'member'  => [
            'id'            => (int) $ticketFull['user_id'],
            'name'          => $ticketFull['name'],
            'email'         => $ticketFull['email'],
            'profile_photo' => $ticketFull['profile_photo'],
            'age'           => $age,
            'city'          => $ticketFull['city'] ?? '',
            'country'       => $ticketFull['country'] ?? '',
            'user_status'   => $ticketFull['user_status'] ?? 'active',
            'member_tier'   => $memberTier,
            'loyalty'       => $loyaltyData,
            'ambassador'    => $ambassadorData,
            'security'      => $securityInfo,
        ],
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Serverfehler', 'detail' => $e->getMessage()]);
}
