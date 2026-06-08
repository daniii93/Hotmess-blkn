<?php

declare(strict_types=1);

function hotmess_tasks(): array
{
    return [
        ['id' => 'task-event', 'title' => 'Confirm Innsbruck host venue', 'description' => 'Finalize venue agreement and arrival flow.', 'assigneeId' => 'ops-lead', 'priority' => 'critical', 'status' => 'in_progress', 'dueDate' => '2026-06-10', 'category' => 'event'],
        ['id' => 'task-hotel', 'title' => 'Hotel benefits checklist', 'description' => 'Confirm late checkout and code wording.', 'assigneeId' => 'travel-lead', 'priority' => 'high', 'status' => 'open', 'dueDate' => '2026-06-12', 'category' => 'hotel'],
        ['id' => 'task-partner', 'title' => 'Partner onboarding pack', 'description' => 'Send placement and benefit templates.', 'assigneeId' => 'partner-lead', 'priority' => 'medium', 'status' => 'open', 'dueDate' => '2026-06-14', 'category' => 'partner'],
        ['id' => 'task-launch', 'title' => 'Legal review', 'description' => 'Review privacy, imprint, cookies and terms.', 'assigneeId' => 'founder', 'priority' => 'critical', 'status' => 'blocked', 'dueDate' => '2026-06-18', 'category' => 'launch'],
    ];
}

function hotmess_support_tickets(): array
{
    return [
        ['id' => 'support-1', 'userId' => 'member-1', 'category' => 'membership', 'priority' => 'medium', 'status' => 'open', 'assignedTo' => 'Membership Desk', 'messages' => ['Upgrade question', 'Benefits explained'], 'createdAt' => '2026-06-02 10:20'],
        ['id' => 'support-2', 'userId' => 'partner-1', 'category' => 'partner', 'priority' => 'high', 'status' => 'in_progress', 'assignedTo' => 'Partner Lead', 'messages' => ['Placement visibility request'], 'createdAt' => '2026-06-02 11:30'],
        ['id' => 'support-3', 'userId' => 'guest-1', 'category' => 'hotel', 'priority' => 'low', 'status' => 'open', 'assignedTo' => 'Travel Desk', 'messages' => ['Hotel inquiry follow-up'], 'createdAt' => '2026-06-02 12:05'],
    ];
}

function hotmess_onboarding_flows(): array
{
    return [
        'partners' => ['Partneranfrage', 'Qualifizierung', 'Vertragsstatus', 'Benefits definieren', 'Platzierungen aktivieren', 'Live schalten'],
        'hotels' => ['Hotel erfassen', 'Bilder hochladen', 'Benefits definieren', 'Membership Vorteile definieren', 'Event-Zuordnung', 'Veroeffentlichung'],
        'members' => ['Registrierung', 'Willkommensmail', 'Membership Status', 'Empfehlungen', 'Erstes Event', 'Community Einstieg'],
    ];
}

function hotmess_launch_checklist_items(): array
{
    return [
        ['id' => 'launch-brand', 'category' => 'Brand', 'title' => 'Brand OS documented', 'completed' => true, 'ownerId' => 'brand', 'dueDate' => '2026-06-05', 'status' => 'ready'],
        ['id' => 'launch-website', 'category' => 'Website', 'title' => 'Core routes live', 'completed' => true, 'ownerId' => 'tech', 'dueDate' => '2026-06-05', 'status' => 'ready'],
        ['id' => 'launch-events', 'category' => 'Events', 'title' => 'First event content approved', 'completed' => false, 'ownerId' => 'events', 'dueDate' => '2026-06-15', 'status' => 'warning'],
        ['id' => 'launch-hotels', 'category' => 'Hotels', 'title' => 'Hotel partners confirmed', 'completed' => false, 'ownerId' => 'travel', 'dueDate' => '2026-06-18', 'status' => 'warning'],
        ['id' => 'launch-security', 'category' => 'Security', 'title' => 'Legal and security review', 'completed' => false, 'ownerId' => 'founder', 'dueDate' => '2026-06-20', 'status' => 'missing'],
        ['id' => 'launch-crm', 'category' => 'CRM', 'title' => 'Automation provider connected', 'completed' => false, 'ownerId' => 'crm', 'dueDate' => '2026-06-22', 'status' => 'warning'],
        ['id' => 'launch-revenue', 'category' => 'Revenue', 'title' => 'Stripe and payout rules connected', 'completed' => false, 'ownerId' => 'finance', 'dueDate' => '2026-06-24', 'status' => 'warning'],
    ];
}

function hotmess_launch_score(): int
{
    $items = hotmess_launch_checklist_items();
    $score = 0;
    foreach ($items as $item) {
        $score += match ($item['status']) {
            'ready' => 100,
            'warning' => 55,
            default => 15,
        };
    }
    return (int) round($score / max(1, count($items)));
}

function hotmess_operations_summary(): array
{
    return [
        'todayEvents' => 0,
        'openInquiries' => 5,
        'newRegistrations' => 12,
        'newMemberships' => 4,
        'newPartners' => 2,
        'hotelInquiries' => 3,
        'packageInquiries' => 4,
        'conciergeRequests' => 2,
        'criticalSystemNotes' => 1,
    ];
}
