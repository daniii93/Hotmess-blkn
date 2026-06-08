<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/payments.php';

$user = require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/tickets');
}

verify_csrf();
hotmess_require_protected_action_allowed($user, (string) ($_POST['return_to'] ?? '/account/settings'));

if (!hotmess_stripe_is_configured()) {
    flash('Stripe ist noch nicht konfiguriert. Bitte STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY und STRIPE_WEBHOOK_SECRET setzen.');
    redirect((string) ($_POST['return_to'] ?? '/tickets'));
}

$kind = (string) ($_POST['kind'] ?? '');

try {
    if ($kind === 'ticket') {
        $eventSlug = (string) ($_POST['event_slug'] ?? '');
        $ticketId = (string) ($_POST['ticket_id'] ?? '');
        $quantity = max(1, min(6, (int) ($_POST['quantity'] ?? 1)));
        $event = hotmess_event_by_slug($eventSlug);
        $ticket = null;

        if ($event) {
            foreach ($event['tickets'] as $candidate) {
                if ($candidate['id'] === $ticketId) {
                    $ticket = $candidate;
                    break;
                }
            }
        }

        if (!$event || !$ticket) {
            flash('Bitte waehle ein gueltiges Event und Ticket aus.');
            redirect('/tickets');
        }

        $allowedForTickets = (($user['role'] ?? '') === 'admin') || (($user['status'] ?? '') === 'approved');
        if (!$allowedForTickets) {
            flash('Der Ticketkauf ist nur fuer freigegebene Mitglieder moeglich.');
            redirect('/tickets?event=' . urlencode($eventSlug));
        }

        if (($event['ticketStatus'] ?? '') === 'sold_out' || ($ticket['status'] ?? '') === 'sold_out') {
            flash('Dieses Ticket ist aktuell ausverkauft.');
            redirect('/tickets?event=' . urlencode($eventSlug));
        }

        if ((float) ($ticket['priceFrom'] ?? 0) <= 0) {
            flash('Diese Allocation ist kostenlos oder member-only und wird nicht ueber Stripe bezahlt.');
            redirect('/tickets?event=' . urlencode($eventSlug));
        }

        $url = hotmess_payment_checkout_for_ticket($event, $ticket, $quantity, $user);
    } elseif ($kind === 'membership') {
        $tierSlug = (string) ($_POST['tier_slug'] ?? '');
        $cycle = (string) ($_POST['billing_cycle'] ?? 'monthly');
        $tier = hotmess_membership_tier_by_slug($tierSlug);

        if (!$tier || (float) $tier['priceMonthly'] <= 0) {
            flash('Diese Membership kann nicht bezahlt werden.');
            redirect('/membership');
        }

        $url = hotmess_payment_checkout_for_membership($tier, $cycle === 'yearly' ? 'yearly' : 'monthly', $user);
    } elseif ($kind === 'package') {
        $slug = (string) ($_POST['package_slug'] ?? '');
        $package = hotmess_package_by_slug($slug);

        if (!$package || in_array($package['availabilityStatus'], ['sold_out', 'request_only'], true)) {
            flash('Dieses Package ist aktuell nur per Anfrage verfuegbar.');
            redirect($package ? '/packages/' . $package['slug'] : '/packages');
        }

        $url = hotmess_payment_checkout_for_package($package, $user);
    } else {
        flash('Unbekannter Checkout-Typ.');
        redirect('/');
    }

    if ($url === '') {
        throw new RuntimeException('Stripe Checkout URL fehlt.');
    }

    header('Location: ' . $url);
    exit;
} catch (Throwable $error) {
    flash('Checkout konnte nicht gestartet werden: ' . $error->getMessage());
    redirect((string) ($_POST['return_to'] ?? '/tickets'));
}
