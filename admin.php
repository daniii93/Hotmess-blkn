<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/events-data.php';
require_once __DIR__ . '/app/packages-data.php';
require_once __DIR__ . '/app/membership-data.php';
require_once __DIR__ . '/app/app-data.php';
require_once __DIR__ . '/app/partners-data.php';
require_once __DIR__ . '/app/admin-data.php';
require_once __DIR__ . '/app/gallery-data.php';
require_once __DIR__ . '/app/inquiry-data.php';
require_once __DIR__ . '/app/crm-data.php';
require_once __DIR__ . '/app/leads-data.php';
require_once __DIR__ . '/app/admin-crud.php';
require_once __DIR__ . '/app/revenue-data.php';

$admin = require_admin();
$adminTab = (string) ($_GET['tab'] ?? 'overview');
$adminEvents = hotmess_events();
$adminPackages = hotmess_packages();
$adminMembershipTiers = hotmess_membership_tiers();
$adminMembershipBenefits = hotmess_membership_benefits();
$adminAppFeatures = hotmess_app_features();
$adminAppOffers = hotmess_app_offers();
$adminAppPushMessages = hotmess_app_push_messages();
$adminAppGuideItems = hotmess_app_city_guide_items();
$adminAppPlacements = hotmess_app_partner_placements();
$adminPartners = hotmess_partners();
$adminPartnerOffers = hotmess_partner_offers();
$adminPartnerPlacements = hotmess_partner_placements();
$adminPartnerApplications = hotmess_partner_applications();
$adminPartnerMetrics = hotmess_partner_metrics();
$adminGalleryItems = hotmess_gallery_items();
$adminGalleryPlacements = hotmess_gallery_partner_placements();
$adminHotels = hotmess_admin_hotels();
$adminCommunityEvents = hotmess_admin_community_events();
$adminInquiries = hotmess_inquiries();
$adminLeads = hotmess_leads();
$adminLeadKpis = hotmess_lead_kpis();
$adminPipelineBoard = hotmess_pipeline_board();
$adminLeadTasks = hotmess_lead_tasks();
$adminCustomers = hotmess_customer_profiles();
$adminLoyaltyLevels = hotmess_loyalty_levels();
$adminRewards = hotmess_rewards();
$adminAutomationRules = hotmess_automation_rules();
$adminRevenueKpis = hotmess_revenue_kpis();
$adminAnalyticsKpis = hotmess_analytics_kpis();
$adminRevenueTransactions = hotmess_revenue_transactions();
$adminRevenueReports = hotmess_revenue_reports();
$adminRevenueRange = (string) ($_GET['revenueRange'] ?? '1m');
$adminRevenueRange = array_key_exists($adminRevenueRange, hotmess_revenue_comparison_ranges()) ? $adminRevenueRange : '1m';
$adminRevenueRawSources = (array) ($_GET['revenueSourceTypes'] ?? ['all']);
$adminRevenueSourceTypes = hotmess_revenue_comparison_selected_sources($adminRevenueRawSources);
$adminRevenueRawEvents = (array) ($_GET['revenueEvents'] ?? []);
$adminRevenueTooManyEvents = count(array_unique($adminRevenueRawEvents)) > 3;
$adminRevenueSelectedEvents = hotmess_revenue_validate_event_ids($adminRevenueRawEvents, $adminEvents);
$adminRevenueComparison = getRevenueComparisonSeries($adminRevenueSelectedEvents, $adminRevenueRange, $adminRevenueSourceTypes, $adminEvents);
$adminRevenueComparisonKpis = hotmess_revenue_comparison_kpis($adminRevenueSelectedEvents, $adminRevenueSourceTypes, $adminEvents);
$adminSponsorProducts = hotmess_sponsor_products();
$adminSponsorPlacements = hotmess_sponsor_placements();
$adminCommissionRules = hotmess_commission_rules();
$adminCommissionPayouts = hotmess_commission_payouts();
$adminReferralCampaigns = hotmess_referral_campaigns();
$adminSettings = hotmess_admin_settings();
$adminQuickActions = hotmess_admin_quick_actions();

$status = $_GET['status'] ?? '';
$search = trim($_GET['search'] ?? '');
$sort = $_GET['sort'] ?? 'created_desc';
$inquiryTypeFilter = trim((string) ($_GET['inquiryType'] ?? ''));
$inquiryStatusFilter = trim((string) ($_GET['inquiryStatus'] ?? ''));
$inquiryCityFilter = trim((string) ($_GET['inquiryCity'] ?? ''));
$inquiryDateFilter = trim((string) ($_GET['inquiryDate'] ?? ''));
$page = max(1, (int) ($_GET['page'] ?? 1));
$perPage = 12;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $action = $_POST['action'] ?? 'single';

    $crudResult = null;
    try {
        $crudResult = hotmess_admin_crud_handle_action((string) $action, $_POST, (int) $admin['id']);
    } catch (Throwable $exception) {
        flash('Admin CRUD Fehler: ' . $exception->getMessage());
        redirect('/admin');
    }

    if ($crudResult !== null) {
        flash(ucfirst((string) $crudResult['module']) . ' wurde gespeichert. Aktion: ' . $crudResult['operation'] . ' / Record #' . $crudResult['recordId'] . '.');
        redirect('/admin/' . (string) $crudResult['module']);
    }

    if (strpos((string) $action, 'app_') === 0) {
        $appTitle = trim((string) ($_POST['title'] ?? $_POST['app_title'] ?? 'App Content'));
        $messages = [
            'app_startscreen' => 'App-Startscreen vorbereitet: ',
            'app_highlight' => 'Highlight Event vorbereitet: ',
            'app_push' => 'Push Nachricht vorbereitet: ',
            'app_offer' => 'App Offer vorbereitet: ',
            'app_city_guide' => 'City Guide Inhalt vorbereitet: ',
            'app_shuttle' => 'Shuttle Hinweis vorbereitet: ',
            'app_safety' => 'Emergency / Safety Hinweis vorbereitet: ',
            'app_visibility' => 'App Sichtbarkeit vorbereitet: ',
        ];
        flash(($messages[$action] ?? 'App-Aktion vorbereitet: ') . $appTitle . '. PWA-, Push- und Offer-Felder sind im Schema vorbereitet.');
        redirect('/admin?tab=app');
    }

    if (strpos((string) $action, 'partner_') === 0) {
        $partnerName = trim((string) ($_POST['name'] ?? $_POST['partner_name'] ?? 'Partner'));
        $messages = [
            'partner_create' => 'Partner vorbereitet: ',
            'partner_update' => 'Partner-Bearbeitung vorbereitet: ',
            'partner_status' => 'Partnerstatus vorbereitet: ',
            'partner_placement' => 'Platzierung vorbereitet: ',
            'partner_offer' => 'Angebot vorbereitet: ',
            'partner_assignments' => 'Zuweisungen vorbereitet: ',
            'partner_app' => 'App Placement vorbereitet: ',
            'partner_lead' => 'Leadstatus vorbereitet: ',
        ];
        flash(($messages[$action] ?? 'Partner-Aktion vorbereitet: ') . $partnerName . '. Partner-, Application-, Placement- und Metric-Felder sind im Schema vorbereitet.');
        redirect('/admin?tab=partners');
    }

    if (strpos((string) $action, 'gallery_') === 0) {
        $galleryTitle = trim((string) ($_POST['title'] ?? $_POST['gallery_title'] ?? 'Gallery'));
        $messages = [
            'gallery_create' => 'Galerie-Entwurf vorbereitet: ',
            'gallery_update' => 'Galerie-Bearbeitung vorbereitet: ',
            'gallery_images' => 'Bild-Update vorbereitet: ',
            'gallery_cover' => 'Coverbild vorbereitet: ',
            'gallery_video' => 'Video URL vorbereitet: ',
            'gallery_assignments' => 'Event-, Partner- und Sponsor-Zuweisungen vorbereitet: ',
            'gallery_publish' => 'Galerie zur Veroeffentlichung vorbereitet: ',
            'gallery_archive' => 'Galerie-Archivierung vorbereitet: ',
        ];
        flash(($messages[$action] ?? 'Gallery-Aktion vorbereitet: ') . $galleryTitle . '. GalleryItem-, GalleryMedia- und GalleryPartnerPlacement-Felder sind im Schema vorbereitet.');
        redirect('/admin?tab=gallery');
    }

    if (strpos((string) $action, 'inquiry_') === 0) {
        try {
            hotmess_update_inquiry_status_and_note((string) ($_POST['inquiry_id'] ?? ''), (string) ($_POST['status'] ?? 'new'), trim((string) ($_POST['internalNotes'] ?? '')), (int) $admin['id']);
            flash('Inquiry wurde gespeichert, Lead-Timeline wurde aktualisiert.');
        } catch (Throwable $exception) {
            flash('Inquiry konnte nicht gespeichert werden: ' . $exception->getMessage());
        }
        redirect('/admin/inquiries');
    }

    if (strpos((string) $action, 'lead_') === 0) {
        try {
            if ($action === 'lead_stage_update') {
                hotmess_update_lead_stage((int) ($_POST['lead_id'] ?? 0), (string) ($_POST['pipeline_stage'] ?? 'new'), (int) $admin['id']);
                flash('Lead Pipeline wurde aktualisiert und in der Timeline protokolliert.');
                redirect('/admin/pipeline');
            }

            if ($action === 'lead_task_update') {
                hotmess_update_lead_task_status((int) ($_POST['task_id'] ?? 0), (string) ($_POST['task_status'] ?? 'open'), (int) $admin['id']);
                flash('Task Status wurde aktualisiert und am Lead protokolliert.');
                redirect('/admin/tasks');
            }

            if ($action === 'lead_timeline_add') {
                hotmess_add_lead_timeline((int) ($_POST['lead_id'] ?? 0), (string) ($_POST['activity_type'] ?? 'note'), trim((string) ($_POST['timeline_title'] ?? 'Lead Notiz')), trim((string) ($_POST['timeline_body'] ?? '')), (int) $admin['id']);
                flash('Lead Timeline wurde gespeichert.');
                redirect('/admin/leads');
            }

            if ($action === 'lead_email_prepare') {
                hotmess_prepare_lead_email((int) ($_POST['lead_id'] ?? 0), (string) ($_POST['trigger_key'] ?? 'follow_up'), trim((string) ($_POST['email_subject'] ?? 'HOTMESS Follow-up')), trim((string) ($_POST['email_body'] ?? 'Wir melden uns zu deiner HOTMESS Anfrage.')));
                flash('Lead E-Mail Automation wurde vorbereitet.');
                redirect('/admin/leads');
            }
        } catch (Throwable $exception) {
            flash('Lead-Aktion konnte nicht gespeichert werden. Die CRM-Struktur bleibt mit Mock-Fallback nutzbar.');
            redirect('/admin/leads');
        }

        flash('Lead-Aktion vorbereitet.');
        redirect('/admin/leads');
    }

    if (strpos((string) $action, 'crm_') === 0) {
        flash('CRM update vorbereitet. CustomerProfile, Lifecycle Stage, Scores und externe CRM-Sync-Felder sind angelegt.');
        redirect('/admin?tab=crm');
    }

    if (strpos((string) $action, 'automation_') === 0) {
        flash('Automation Flow vorbereitet. Trigger, Action, Status und Provider-Anbindung sind als Struktur angelegt.');
        redirect('/admin?tab=automation');
    }

    if (strpos((string) $action, 'loyalty_') === 0) {
        flash('Loyalty update vorbereitet. HotMess Points, Rewards, Stufen und Redemption-Logik sind vorbereitet.');
        redirect('/admin?tab=loyalty');
    }

    if (strpos((string) $action, 'revenue_') === 0) {
        flash('Revenue update vorbereitet. Stripe-, Ticket-, Hotel-, Package- und Concierge-Quellen sind als Umsatzlogik angelegt.');
        redirect('/admin?tab=revenue');
    }

    if (strpos((string) $action, 'sponsor_') === 0) {
        flash('Sponsor placement vorbereitet. Laufzeit, Stadt, Event, Preis und Sichtbarkeit sind angelegt.');
        redirect('/admin?tab=sponsors');
    }

    if (strpos((string) $action, 'commission_') === 0) {
        flash('Commission-Regel vorbereitet. Prozent- und Fixbetrag-Provisionen koennen spaeter automatisiert ausgezahlt werden.');
        redirect('/admin?tab=commissions');
    }

    if (strpos((string) $action, 'referral_') === 0) {
        flash('Referral Campaign vorbereitet. Codes, Rewards, Conversion und Revenue Tracking sind angelegt.');
        redirect('/admin?tab=referrals');
    }

    if (strpos((string) $action, 'settings_') === 0) {
        flash('Settings-Update vorbereitet. Brand-, Navigation-, Provider- und Stripe-Felder sind als Admin-Struktur angelegt.');
        redirect('/admin?tab=settings');
    }

    $newStatus = $_POST['status'] ?? 'pending';

    if ($action === 'bulk') {
        $ids = array_map('intval', $_POST['member_ids'] ?? []);
        $ids = array_values(array_filter(array_unique($ids)));

        foreach ($ids as $id) {
            update_member_status($id, $newStatus, (int) $admin['id'], null, 'bulk');
        }

        flash(count($ids) . ' Bewerber aktualisiert.');
        redirect('admin.php');
    }

    $userId = (int) ($_POST['user_id'] ?? 0);
    $note = trim($_POST['admin_note'] ?? '');
    update_member_status($userId, $newStatus, (int) $admin['id'], $note, 'single');
    flash('Mitgliedsstatus aktualisiert.');
    redirect('admin.php');
}

$statusCounts = [];
$countRows = db()->query(
    'SELECT status, COUNT(*) AS total FROM users WHERE role = "member" GROUP BY status'
)->fetchAll();

foreach (allowed_member_statuses() as $statusKey) {
    $statusCounts[$statusKey] = 0;
}

foreach ($countRows as $row) {
    $statusCounts[$row['status']] = (int) $row['total'];
}

$where = ['users.role = "member"'];
$params = [];

if (in_array($status, allowed_member_statuses(), true)) {
    $where[] = 'users.status = ?';
    $params[] = $status;
}

if ($search !== '') {
    $searchClauses = [];
    foreach (search_variants($search) as $variant) {
        $searchClauses[] = '(users.name LIKE ? OR users.email LIKE ? OR users.phone LIKE ? OR users.city LIKE ?)';
        $like = '%' . $variant . '%';
        array_push($params, $like, $like, $like, $like);
    }
    $where[] = '(' . implode(' OR ', $searchClauses) . ')';
}

$orderBy = match ($sort) {
    'created_asc' => 'users.created_at ASC',
    'name_asc' => 'users.name ASC',
    'name_desc' => 'users.name DESC',
    'status_asc' => 'users.status ASC, users.created_at DESC',
    default => 'users.created_at DESC',
};

$whereSql = implode(' AND ', $where);

$stmt = db()->prepare("SELECT COUNT(*) FROM users WHERE {$whereSql}");
$stmt->execute($params);
$totalMembers = (int) $stmt->fetchColumn();
$totalPages = max(1, (int) ceil($totalMembers / $perPage));
$page = min($page, $totalPages);
$offset = ($page - 1) * $perPage;

$stmt = db()->prepare(
    "SELECT users.*,
      waitlist_requests.friends_count,
      waitlist_requests.motivation,
      waitlist_requests.status AS request_status,
      latest_log.created_at AS last_status_change
     FROM users
     LEFT JOIN waitlist_requests ON waitlist_requests.user_id = users.id
     LEFT JOIN (
       SELECT user_id, MAX(created_at) AS created_at
       FROM status_logs
       GROUP BY user_id
     ) latest_log ON latest_log.user_id = users.id
     WHERE {$whereSql}
     ORDER BY {$orderBy}
     LIMIT {$perPage} OFFSET {$offset}"
);
$stmt->execute($params);
$members = $stmt->fetchAll();

$logs = db()->query(
    'SELECT status_logs.*, member.name AS member_name, admin.name AS admin_name
     FROM status_logs
     LEFT JOIN users member ON member.id = status_logs.user_id
     LEFT JOIN users admin ON admin.id = status_logs.admin_id
     ORDER BY status_logs.created_at DESC
     LIMIT 8'
)->fetchAll();

function admin_query(array $overrides = []): string
{
    $query = array_merge($_GET, $overrides);
    return 'admin.php?' . http_build_query($query);
}

$adminTitles = [
    'overview' => ['Admin Control Center', 'Ueberblick ueber Events, Hotels, Packages, Community, Membership, App, Partner und offene Anfragen.'],
    'members' => ['Bewerbermanagement', 'Verwalte Bewerber, Warteliste und Freigaben mit Suche, Filter und Massenaktionen.'],
    'events' => ['Event-Verwaltung', 'Erstelle, bearbeite und steuere HOTMESS Events, Tickets, VIP, Partner, Hotels und App-Sichtbarkeit.'],
    'hotels' => ['Hotel-Verwaltung', 'Verwalte Hotelpartner, Staedte, Shuttle-Status, Fast Lane und Travel-Vorteile.'],
    'packages' => ['Package-Verwaltung', 'Erstelle und steuere HotMess Weekends, Preise, Verfuegbarkeit, VIP, Hotels, Events, Partnerangebote und Membership Benefits.'],
    'community' => ['Community-Verwaltung', 'Verwalte Community Events, Member-only Status, Kapazitaet, Registrierung, Partner und Ambassadors.'],
    'membership' => ['Membership-Verwaltung', 'Verwalte Passport-Stufen, Preise, Benefits, Mitglieder, Rabattcodes, Partner Benefits und Stripe-Platzhalter.'],
    'app' => ['App-Verwaltung', 'Verwalte HotMess Guide Startscreen, Highlights, Push Platzhalter, Offers, City Guide, Shuttle, Safety und sichtbare Partner.'],
    'partners' => ['Partner-Verwaltung', 'Verwalte Partner, Leads, Platzierungen, Angebote, Events, Hotels, Packages, Membership Benefits und App Placements.'],
    'gallery' => ['Gallery-Verwaltung', 'Verwalte Fotos, Videos, Aftermovies, Coverbilder, Events, Partner, Sponsoren, Sichtbarkeit und Veroeffentlichung.'],
    'inquiries' => ['Inquiry Center', 'Verwalte Package Anfragen, Hotel Anfragen, Partner Bewerbungen und VIP / Table Anfragen.'],
    'leads' => ['Lead Center', 'Kategorisiere, priorisiere und verfolge alle HOTMESS Anfragen als operative Sales Leads.'],
    'pipeline' => ['Pipeline', 'Steuere Leads von Neu ueber Angebot bis Gewonnen oder Verloren im Hospitality Sales Board.'],
    'tasks' => ['Tasks', 'Automatische Follow-ups, Concierge Aufgaben und Sales Schritte fuer offene Leads.'],
    'crm' => ['CRM Control', 'Verwalte Lifecycle Stage, Scores, Aktivitaeten, Historie und Personalisierung fuer HotMess Kunden.'],
    'automation' => ['Automation Center', 'Bereite Customer-Journey-Flows fuer Welcome, Hotel, Package, Benefits, Birthday und Reaktivierung vor.'],
    'loyalty' => ['Loyalty Studio', 'Verwalte HotMess Points, Rewards, Status-Level, Referral Rewards und Premium Benefits.'],
    'revenue' => ['Revenue Engine', 'Zentrale Umsatzsteuerung fuer Tickets, Hotels, Packages, Memberships, Sponsoring, VIP und Concierge.'],
    'analytics' => ['Business Intelligence', 'Analysiere Registrierungen, Conversions, LTV, Warenkorb, Wachstum und Plattformleistung.'],
    'sponsors' => ['Sponsor Management', 'Verwalte Sponsoring-Produkte, Platzierungen, Laufzeiten, Staedte, Events und Preise.'],
    'commissions' => ['Commission Center', 'Verwalte Hotel-, Package-, Referral-, Ambassador- und Partner-Provisionen.'],
    'referrals' => ['Referral Engine', 'Steuere Referral Codes, Kampagnen, Rewards, Conversion und monetarisierte Empfehlungen.'],
    'settings' => ['Settings', 'Verwalte Brand Settings, Navigation, Kontakt, Social Links, Ticket Provider und Stripe Platzhalter.'],
];
$adminTitle = $adminTitles[$adminTab] ?? $adminTitles['overview'];

render_header($adminTitle[0]);
?>

<main class="admin-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Admin</p>
    <h1><?= e($adminTitle[0]) ?></h1>
    <p><?= e($adminTitle[1]) ?></p>
    <?php render_flash(); ?>
    <div class="admin-tab-nav">
      <a class="<?= $adminTab === 'overview' ? 'is-active' : '' ?>" href="/admin">Overview</a>
      <a class="<?= $adminTab === 'members' ? 'is-active' : '' ?>" href="/admin?tab=members">Mitglieder</a>
      <a class="<?= $adminTab === 'events' ? 'is-active' : '' ?>" href="/admin/events">Events</a>
      <a class="<?= $adminTab === 'hotels' ? 'is-active' : '' ?>" href="/admin/hotels">Hotels</a>
      <a class="<?= $adminTab === 'packages' ? 'is-active' : '' ?>" href="/admin/packages">Packages</a>
      <a class="<?= $adminTab === 'community' ? 'is-active' : '' ?>" href="/admin/community">Community</a>
      <a class="<?= $adminTab === 'membership' ? 'is-active' : '' ?>" href="/admin/membership">Membership</a>
      <a class="<?= $adminTab === 'app' ? 'is-active' : '' ?>" href="/admin/app">App</a>
      <a class="<?= $adminTab === 'partners' ? 'is-active' : '' ?>" href="/admin/partners">Partner</a>
      <a class="<?= $adminTab === 'gallery' ? 'is-active' : '' ?>" href="/admin/gallery">Gallery</a>
      <a class="<?= $adminTab === 'inquiries' ? 'is-active' : '' ?>" href="/admin/inquiries">Inquiries</a>
      <a class="<?= $adminTab === 'leads' ? 'is-active' : '' ?>" href="/admin/leads">Leads</a>
      <a class="<?= $adminTab === 'pipeline' ? 'is-active' : '' ?>" href="/admin/pipeline">Pipeline</a>
      <a class="<?= $adminTab === 'tasks' ? 'is-active' : '' ?>" href="/admin/tasks">Tasks</a>
      <a class="<?= $adminTab === 'crm' ? 'is-active' : '' ?>" href="/admin/crm">CRM</a>
      <a class="<?= $adminTab === 'automation' ? 'is-active' : '' ?>" href="/admin/automation">Automation</a>
      <a class="<?= $adminTab === 'loyalty' ? 'is-active' : '' ?>" href="/admin/loyalty">Loyalty</a>
      <a class="<?= $adminTab === 'revenue' ? 'is-active' : '' ?>" href="/admin/revenue">Revenue</a>
      <a class="<?= $adminTab === 'analytics' ? 'is-active' : '' ?>" href="/admin/analytics">Analytics</a>
      <a class="<?= $adminTab === 'sponsors' ? 'is-active' : '' ?>" href="/admin/sponsors">Sponsors</a>
      <a class="<?= $adminTab === 'commissions' ? 'is-active' : '' ?>" href="/admin/commissions">Commissions</a>
      <a class="<?= $adminTab === 'referrals' ? 'is-active' : '' ?>" href="/admin/referrals">Referrals</a>
      <a class="<?= $adminTab === 'settings' ? 'is-active' : '' ?>" href="/admin/settings">Settings</a>
      <a href="/admin-sales.php">Sales</a>
      <a href="/organizer-messages.php">Nachrichten</a>
    </div>
  </section>

  <?php if (isset(hotmess_admin_crud_modules()[$adminTab])): ?>
    <?php render_admin_crud_panel($adminTab); ?>
  <?php endif; ?>

  <?php if ($adminTab === 'overview'): ?>
    <section class="admin-control-overview">
      <div class="admin-kpi-grid">
        <article><span>Kommende Events</span><strong><?= e((string) count($adminEvents)) ?></strong><p>inkl. Drafts und Sold Out</p></article>
        <article><span>Offene Anfragen</span><strong><?= e((string) count(array_filter($adminInquiries, fn (array $item): bool => $item['status'] === 'new'))) ?></strong><p>Package, Hotel, Partner, VIP</p></article>
        <article><span>Aktive Packages</span><strong><?= e((string) count($adminPackages)) ?></strong><p>Basic bis Signature</p></article>
        <article><span>Aktive Partner</span><strong><?= e((string) count(array_filter($adminPartners, fn (array $item): bool => $item['status'] === 'active'))) ?></strong><p>Hotels, App, VIP, Community</p></article>
        <article><span>Membership Tiers</span><strong><?= e((string) count($adminMembershipTiers)) ?></strong><p>Free, Plus, Black</p></article>
        <article><span>App Hinweise</span><strong><?= e((string) count($adminAppPushMessages)) ?></strong><p>Push Platzhalter</p></article>
        <article><span>Gallery Items</span><strong><?= e((string) count($adminGalleryItems)) ?></strong><p>Photos, Videos, Aftermovies</p></article>
        <article><span>CRM Kunden</span><strong><?= e((string) count($adminCustomers)) ?></strong><p>Journey Scores vorbereitet</p></article>
        <article><span>Revenue</span><strong><?= e(number_format((int) $adminRevenueKpis['totalRevenue'], 0, ',', '.')) ?> EUR</strong><p>alle Umsatzquellen</p></article>
      </div>

      <div class="admin-overview-layout">
        <section class="premium-card">
          <span>Quick Actions</span>
          <h2>Schnell starten</h2>
          <div class="admin-quick-actions">
            <?php foreach ($adminQuickActions as $action): ?>
              <a class="button ghost" href="<?= e($action['href']) ?>"><?= e($action['label']) ?></a>
            <?php endforeach; ?>
          </div>
        </section>
        <section class="premium-card">
          <span>Upcoming Events</span>
          <h2>Kommende Events</h2>
          <div class="admin-mini-list">
            <?php foreach (array_slice($adminEvents, 0, 4) as $event): ?>
              <a href="/admin/events"><strong><?= e($event['title']) ?></strong><span><?= e($event['city']) ?> / <?= e($event['startDate']) ?> / <?= e($event['ticketStatus']) ?></span></a>
            <?php endforeach; ?>
          </div>
        </section>
        <section class="premium-card">
          <span>Inquiries</span>
          <h2>Offene Anfragen</h2>
          <div class="admin-mini-list">
            <?php foreach (array_slice($adminInquiries, 0, 4) as $inquiry): ?>
              <a href="/admin/inquiries"><strong><?= e($inquiry['type']) ?></strong><span><?= e($inquiry['subject']) ?> / <?= e($inquiry['status']) ?></span></a>
            <?php endforeach; ?>
          </div>
        </section>
        <section class="premium-card">
          <span>Platform</span>
          <h2>Aktive Plattformmodule</h2>
          <div class="admin-mini-list">
            <a href="/admin/packages"><strong>Packages</strong><span><?= e((string) count($adminPackages)) ?> HotMess Weekends</span></a>
            <a href="/admin/hotels"><strong>Hotels</strong><span><?= e((string) count($adminHotels)) ?> Hotelpartner</span></a>
            <a href="/admin/membership"><strong>Membership</strong><span><?= e((string) count($adminMembershipBenefits)) ?> Benefits</span></a>
            <a href="/admin/app"><strong>App</strong><span><?= e((string) count($adminAppOffers)) ?> Offers</span></a>
            <a href="/admin/gallery"><strong>Gallery</strong><span><?= e((string) count($adminGalleryItems)) ?> Media Items</span></a>
          </div>
        </section>
      </div>
    </section>
  <?php elseif ($adminTab === 'events'): ?>
    <section class="admin-events-overview">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Event list</p>
        <h2>Published, draft and archived chapters.</h2>
        <p>Mockdaten sind strukturiert; die Datenbankfelder sind im Schema fuer echte Persistenz vorbereitet.</p>
      </div>
      <div class="event-admin-grid">
        <?php foreach ($adminEvents as $event): ?>
          <article class="premium-card admin-event-card">
            <span><?= e($event['status']) ?> / <?= e(hotmess_ticket_status_label($event['ticketStatus'])) ?></span>
            <h3><?= e($event['title']) ?></h3>
            <p><?= e($event['city']) ?> / <?= e($event['venue']) ?> / <?= e(date('d.m.Y', strtotime($event['startDate']))) ?></p>
            <dl class="event-meta-list">
              <div><dt>VIP</dt><dd><?= $event['vipAvailable'] ? 'active' : 'inactive' ?></dd></div>
              <div><dt>App</dt><dd><?= $event['appEnabled'] ? 'visible' : 'hidden' ?></dd></div>
              <div><dt>Hotels</dt><dd><?= e(implode(', ', $event['hotelIds'])) ?></dd></div>
              <div><dt>Packages</dt><dd><?= e(implode(', ', $event['packageIds'])) ?></dd></div>
              <div><dt>Partners</dt><dd><?= e(implode(', ', $event['partnerIds'])) ?></dd></div>
            </dl>
            <div class="admin-event-actions">
              <a class="button ghost" href="/events/<?= e($event['slug']) ?>">Preview</a>
              <form method="post">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                <input type="hidden" name="action" value="event_publish" />
                <input type="hidden" name="event_title" value="<?= e($event['title']) ?>" />
                <button class="button primary" type="submit">Publish</button>
              </form>
              <form method="post">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                <input type="hidden" name="action" value="event_archive" />
                <input type="hidden" name="event_title" value="<?= e($event['title']) ?>" />
                <button class="button ghost" type="submit">Archive</button>
              </form>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <section class="admin-event-editor">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Create / edit</p>
        <h2>Event fields.</h2>
      </div>
      <form class="event-editor-form" method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <input type="hidden" name="action" value="event_create" />
        <label>Title<input name="title" required placeholder="HOTMESS BLKN: City Chapter" /></label>
        <label>Slug<input name="slug" required placeholder="city-chapter" /></label>
        <label>City<input name="city" placeholder="Innsbruck" /></label>
        <label>Venue<input name="venue" placeholder="Secret venue" /></label>
        <label>Address<input name="address" placeholder="Member-only address" /></label>
        <label>Start date<input type="datetime-local" name="startDate" /></label>
        <label>End date<input type="datetime-local" name="endDate" /></label>
        <label>Doors open<input name="doorsOpen" placeholder="22:30" /></label>
        <label>Category<input name="category" placeholder="Signature Night" /></label>
        <label>Hero image<input name="heroImage" placeholder="/assets/community-hero.png" /></label>
        <label>Gallery images<textarea name="galleryImages" placeholder="/assets/a.png, /assets/b.png"></textarea></label>
        <label>Promo video<input name="promoVideo" placeholder="Video URL" /></label>
        <label>Short description<textarea name="shortDescription"></textarea></label>
        <label>Long description<textarea name="longDescription"></textarea></label>
        <label>Dresscode<input name="dressCode" /></label>
        <label>Line-up<textarea name="lineup" placeholder="One item per line"></textarea></label>
        <label>Hosts<textarea name="hosts" placeholder="One item per line"></textarea></label>
        <label>Timetable<textarea name="timetable" placeholder="22:30 | Arrival | Guest list check"></textarea></label>
        <label>Ticket status
          <select name="ticketStatus">
            <option value="available">Available</option>
            <option value="few_tickets">Few Tickets</option>
            <option value="vip_available">VIP Available</option>
            <option value="passport_early_access">Passport Early Access</option>
            <option value="sold_out">Sold Out</option>
          </select>
        </label>
        <label>Ticket provider<input name="ticketProvider" placeholder="internal / external" /></label>
        <label>Ticket URL<input name="ticketUrl" placeholder="https://..." /></label>
        <label>VIP description<textarea name="vipDescription"></textarea></label>
        <label>Hotel IDs<input name="hotelIds" placeholder="signature-city-stay" /></label>
        <label>Package IDs<input name="packageIds" placeholder="weekend-suite" /></label>
        <label>Partner IDs<input name="partnerIds" placeholder="hotel-partner" /></label>
        <label>Sponsor IDs<input name="sponsorIds" placeholder="sponsor-partner" /></label>
        <label>Membership access<input name="membershipAccess" placeholder="Passport Early Access" /></label>
        <label>Safety notes<textarea name="safetyNotes"></textarea></label>
        <label>FAQ<textarea name="faq" placeholder="Question | Answer"></textarea></label>
        <label>Status
          <select name="status">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="sold_out">Sold out</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label class="check-row"><input type="checkbox" name="vipAvailable" value="1" /> VIP aktivieren</label>
        <label class="check-row"><input type="checkbox" name="tableServiceAvailable" value="1" /> Table Service aktivieren</label>
        <label class="check-row"><input type="checkbox" name="appEnabled" value="1" /> In App anzeigen</label>
        <button class="button primary" type="submit">Event erstellen</button>
      </form>
    </section>
  <?php elseif ($adminTab === 'hotels'): ?>
    <section class="admin-module-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Hotels</p>
        <h2>Hotelpartner und Travel-Vorteile.</h2>
      </div>
      <div class="admin-table-card">
        <table class="admin-lux-table">
          <thead><tr><th>Hotel</th><th>Stadt</th><th>Partnerstatus</th><th>Shuttle</th><th>Fast Lane</th><th>Status</th><th>Aktion</th></tr></thead>
          <tbody>
            <?php foreach ($adminHotels as $hotel): ?>
              <tr>
                <td><strong><?= e($hotel['name']) ?></strong><span><?= e($hotel['id']) ?></span></td>
                <td><?= e($hotel['city']) ?></td>
                <td><span class="admin-status-badge"><?= e($hotel['partnerStatus']) ?></span></td>
                <td><?= $hotel['shuttleActive'] ? 'aktiv' : 'inaktiv' ?></td>
                <td><?= $hotel['fastLaneActive'] ? 'aktiv' : 'inaktiv' ?></td>
                <td><?= e($hotel['status']) ?></td>
                <td><a class="button ghost" href="#edit-hotel">Bearbeiten</a></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <section id="create" class="admin-event-editor">
        <div class="section-heading platform-heading"><p class="eyebrow">Create / edit</p><h2>Hotel fields.</h2></div>
        <form class="event-editor-form" method="post">
          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
          <input type="hidden" name="action" value="partner_assignments" />
          <label>Hotel name<input name="name" placeholder="Signature City Stay" /></label>
          <label>City<input name="city" placeholder="Vienna" /></label>
          <label>Partner status<input name="partnerStatus" placeholder="active" /></label>
          <label class="check-row"><input type="checkbox" name="shuttleActive" value="1" /> Shuttle aktiv</label>
          <label class="check-row"><input type="checkbox" name="fastLaneActive" value="1" /> Fast Lane aktiv</label>
          <button class="button primary" type="submit">Hotel speichern</button>
        </form>
      </section>
    </section>
  <?php elseif ($adminTab === 'packages'): ?>
    <section class="admin-events-overview admin-packages-overview">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Package list</p>
        <h2>HotMess Weekends.</h2>
        <p>Packages sind aktuell als Mockdaten strukturiert; SQL-Tabellen fuer echte Persistenz sind vorbereitet.</p>
      </div>
      <div class="event-admin-grid">
        <?php foreach ($adminPackages as $package): ?>
          <article class="premium-card admin-event-card">
            <span><?= e($package['status']) ?> / <?= e(hotmess_package_type_label($package['packageType'])) ?> / <?= e(hotmess_package_availability_label($package['availabilityStatus'])) ?></span>
            <h3><?= e($package['title']) ?></h3>
            <p><?= e($package['city']) ?> / <?= e(date('d.m.Y', strtotime($package['startDate']))) ?> - <?= e(date('d.m.Y', strtotime($package['endDate']))) ?> / ab <?= e((string) $package['priceFrom']) ?> EUR</p>
            <dl class="event-meta-list">
              <div><dt>VIP</dt><dd><?= $package['vipIncluded'] ? 'active' : 'inactive' ?></dd></div>
              <div><dt>Shuttle</dt><dd><?= $package['shuttleIncluded'] ? 'included' : 'inactive' ?></dd></div>
              <div><dt>Concierge</dt><dd><?= $package['conciergeIncluded'] ? 'included' : 'inactive' ?></dd></div>
              <div><dt>Events</dt><dd><?= e(implode(', ', $package['eventIds'])) ?></dd></div>
              <div><dt>Hotels</dt><dd><?= e(implode(', ', $package['hotelIds'])) ?></dd></div>
              <div><dt>Partners</dt><dd><?= e(implode(', ', $package['partnerOfferIds'])) ?></dd></div>
            </dl>
            <div class="admin-event-actions">
              <a class="button ghost" href="/packages/<?= e($package['slug']) ?>">Preview</a>
              <form method="post">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                <input type="hidden" name="action" value="package_publish" />
                <input type="hidden" name="package_title" value="<?= e($package['title']) ?>" />
                <button class="button primary" type="submit">Publish</button>
              </form>
              <form method="post">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                <input type="hidden" name="action" value="package_archive" />
                <input type="hidden" name="package_title" value="<?= e($package['title']) ?>" />
                <button class="button ghost" type="submit">Archive</button>
              </form>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <section class="admin-event-editor admin-package-editor">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Create / edit</p>
        <h2>Package fields.</h2>
      </div>
      <form class="event-editor-form package-editor-form" method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <input type="hidden" name="action" value="package_create" />
        <label>Title<input name="title" required placeholder="HotMess Signature Weekend" /></label>
        <label>Slug<input name="slug" required placeholder="signature-weekend-city" /></label>
        <label>City<input name="city" placeholder="Innsbruck" /></label>
        <label>Start date<input type="datetime-local" name="startDate" /></label>
        <label>End date<input type="datetime-local" name="endDate" /></label>
        <label>Package type
          <select name="packageType">
            <option value="basic">Basic</option>
            <option value="travel">Travel</option>
            <option value="vip">VIP</option>
            <option value="signature">Signature</option>
          </select>
        </label>
        <label>Price from<input type="number" name="priceFrom" min="0" step="1" /></label>
        <label>Availability
          <select name="availabilityStatus">
            <option value="available">Available</option>
            <option value="few_left">Few left</option>
            <option value="sold_out">Sold out</option>
            <option value="request_only">Request only</option>
          </select>
        </label>
        <label>Hero image<input name="heroImage" placeholder="/assets/packages.png" /></label>
        <label>Gallery images<textarea name="galleryImages" placeholder="/assets/a.png, /assets/b.png"></textarea></label>
        <label>Promo video<input name="promoVideo" placeholder="Video URL" /></label>
        <label>Short description<textarea name="shortDescription"></textarea></label>
        <label>Long description<textarea name="longDescription"></textarea></label>
        <label>Included items<textarea name="includedItems" placeholder="Event Ticket | Description"></textarea></label>
        <label>Excluded items<textarea name="excludedItems" placeholder="Flights, personal expenses"></textarea></label>
        <label>Itinerary<textarea name="itinerary" placeholder="Day 1 | 18:00 | Arrival | Description | Location"></textarea></label>
        <label>Event IDs<input name="eventIds" placeholder="hm-innsbruck-2026" /></label>
        <label>Hotel IDs<input name="hotelIds" placeholder="signature-city-stay" /></label>
        <label>Partner offer IDs<input name="partnerOfferIds" placeholder="hotel-partner, shuttle-partner" /></label>
        <label>Sponsor IDs<input name="sponsorIds" placeholder="welcome-sponsor" /></label>
        <label>Membership benefits<textarea name="membershipBenefits"></textarea></label>
        <label>Booking URL<input name="bookingUrl" placeholder="https://..." /></label>
        <label>Inquiry email<input type="email" name="inquiryEmail" placeholder="packages@hotmess-blkn.com" /></label>
        <label>FAQ<textarea name="faq" placeholder="Question | Answer"></textarea></label>
        <label>Status
          <select name="status">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label class="check-row"><input type="checkbox" name="vipIncluded" value="1" /> VIP aktivieren</label>
        <label class="check-row"><input type="checkbox" name="shuttleIncluded" value="1" /> Shuttle aktivieren</label>
        <label class="check-row"><input type="checkbox" name="welcomeBagIncluded" value="1" /> Welcome Bag aktivieren</label>
        <label class="check-row"><input type="checkbox" name="conciergeIncluded" value="1" /> Concierge aktivieren</label>
        <label class="check-row"><input type="checkbox" name="requestOnly" value="1" /> Anfrage statt Direktbuchung</label>
        <button class="button primary" type="submit">Package erstellen</button>
      </form>
    </section>
  <?php elseif ($adminTab === 'community'): ?>
    <section class="admin-module-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Community</p>
        <h2>Member-only Formate und Circle Events.</h2>
      </div>
      <div class="admin-table-card">
        <table class="admin-lux-table">
          <thead><tr><th>Community Event</th><th>Stadt</th><th>Typ</th><th>Member-only</th><th>Kapazitaet</th><th>Registrierung</th><th>Aktion</th></tr></thead>
          <tbody>
            <?php foreach ($adminCommunityEvents as $communityEvent): ?>
              <tr>
                <td><strong><?= e($communityEvent['title']) ?></strong><span><?= e($communityEvent['status']) ?></span></td>
                <td><?= e($communityEvent['city']) ?></td>
                <td><?= e($communityEvent['eventType']) ?></td>
                <td><?= $communityEvent['memberOnly'] ? 'ja' : 'nein' ?></td>
                <td><?= e((string) $communityEvent['capacity']) ?></td>
                <td><?= $communityEvent['registrationRequired'] ? 'erforderlich' : 'optional' ?></td>
                <td><a class="button ghost" href="#create">Bearbeiten</a></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
      <section id="create" class="admin-event-editor">
        <div class="section-heading platform-heading"><p class="eyebrow">Create / edit</p><h2>Community Event fields.</h2></div>
        <form class="event-editor-form" method="post">
          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
          <input type="hidden" name="action" value="event_create" />
          <label>Title<input name="title" placeholder="Passport Pre-Drinks" /></label>
          <label>City<input name="city" placeholder="Innsbruck" /></label>
          <label>Eventtyp<input name="eventType" placeholder="Brunch" /></label>
          <label>Kapazitaet<input type="number" name="capacity" min="0" /></label>
          <label class="check-row"><input type="checkbox" name="memberOnly" value="1" /> Member-only</label>
          <label class="check-row"><input type="checkbox" name="registrationRequired" value="1" /> Registrierung erforderlich</label>
          <button class="button primary" type="submit">Community Event speichern</button>
        </form>
      </section>
    </section>
  <?php elseif ($adminTab === 'membership'): ?>
    <section class="admin-events-overview admin-membership-overview">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Passport tiers</p>
        <h2>Membership levels.</h2>
        <p>Stufen, Preise, Benefits, Partner Benefits und Stripe-Felder sind strukturell vorbereitet.</p>
      </div>
      <div class="membership-tier-grid">
        <?php foreach ($adminMembershipTiers as $tier): ?>
          <article class="membership-tier-card">
            <span><?= e($tier['status']) ?> / <?= e($tier['badgeLabel']) ?></span>
            <h3><?= e($tier['name']) ?></h3>
            <p><?= e($tier['description']) ?></p>
            <strong><?= e((string) $tier['priceMonthly']) ?> EUR / month</strong>
            <small><?= e((string) $tier['priceYearly']) ?> EUR yearly / priority <?= e((string) $tier['priority']) ?></small>
            <div class="admin-event-actions">
              <a class="button ghost" href="/membership<?= $tier['slug'] === 'free' ? '' : '/' . e($tier['slug']) ?>">Preview</a>
              <form method="post">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                <input type="hidden" name="action" value="membership_toggle" />
                <input type="hidden" name="tier_name" value="<?= e($tier['name']) ?>" />
                <button class="button primary" type="submit">Aktivieren</button>
              </form>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <section class="admin-event-editor admin-membership-editor">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Create / edit</p>
        <h2>Membership fields.</h2>
      </div>
      <form class="event-editor-form membership-editor-form" method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <input type="hidden" name="action" value="membership_create" />
        <label>Name<input name="name" required placeholder="Passport Plus" /></label>
        <label>Slug<input name="slug" required placeholder="plus" /></label>
        <label>Monthly price<input type="number" name="priceMonthly" min="0" step="1" /></label>
        <label>Yearly price<input type="number" name="priceYearly" min="0" step="1" /></label>
        <label>Description<textarea name="description"></textarea></label>
        <label>Benefits<textarea name="benefits" placeholder="One benefit per line"></textarea></label>
        <label>Event benefits<textarea name="eventBenefits"></textarea></label>
        <label>Hotel benefits<textarea name="hotelBenefits"></textarea></label>
        <label>Package benefits<textarea name="packageBenefits"></textarea></label>
        <label>Community benefits<textarea name="communityBenefits"></textarea></label>
        <label>App benefits<textarea name="appBenefits"></textarea></label>
        <label>Partner benefits<textarea name="partnerBenefits"></textarea></label>
        <label>Badge label<input name="badgeLabel" placeholder="Plus" /></label>
        <label>Priority<input type="number" name="priority" min="0" step="1" /></label>
        <label>Status
          <select name="status">
            <option value="active">Active</option>
            <option value="hidden">Hidden</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>Stripe price placeholder<input name="stripePriceId" placeholder="price_..." /></label>
        <label>Assign discount codes<textarea name="discountCodes" placeholder="HOTMESSSTAY, PLUSDRINK"></textarea></label>
        <label>Assign partner benefits<textarea name="partnerBenefitIds" placeholder="hotel-partner, vip-sponsor"></textarea></label>
        <button class="button primary" type="submit">Membership speichern</button>
      </form>
    </section>

    <section class="platform-section admin-membership-benefits">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Benefit library</p>
        <h2>Codes and redemptions.</h2>
      </div>
      <div class="event-admin-grid">
        <?php foreach ($adminMembershipBenefits as $benefit): ?>
          <article class="premium-card">
            <span><?= e($benefit['category']) ?> / <?= e($benefit['code'] ?? 'no code') ?></span>
            <h3><?= e($benefit['title']) ?></h3>
            <p><?= e($benefit['description']) ?></p>
            <p>Partner: <?= e($benefit['partnerId'] ?? 'HOTMESS') ?> / Limit: <?= e((string) $benefit['redemptionLimit']) ?></p>
          </article>
        <?php endforeach; ?>
      </div>
    </section>
  <?php elseif ($adminTab === 'app'): ?>
    <section class="admin-events-overview admin-app-overview">
      <div class="section-heading platform-heading">
        <p class="eyebrow">HotMess Guide</p>
        <h2>App content surfaces.</h2>
        <p>Startscreen, Highlight Events, Push, Offers, City Guide, Shuttle, Safety, Partner, Hotels und Packages sind als PWA-Struktur vorbereitet.</p>
      </div>
      <div class="app-feature-grid">
        <?php foreach ($adminAppFeatures as $feature): ?>
          <article class="app-feature-card">
            <span><?= e($feature['status']) ?> / <?= e($feature['category']) ?></span>
            <h3><?= e($feature['title']) ?></h3>
            <p><?= e($feature['description']) ?></p>
            <a class="button ghost" href="/app/<?= e($feature['slug']) ?>">Preview</a>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <section class="admin-event-editor admin-app-editor">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Create / edit</p>
        <h2>App fields.</h2>
      </div>
      <form class="event-editor-form app-editor-form" method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <input type="hidden" name="action" value="app_startscreen" />
        <label>Title<input name="title" required placeholder="Tonight in Innsbruck" /></label>
        <label>Content type
          <select name="contentType">
            <option value="startscreen">Startscreen</option>
            <option value="highlight_event">Highlight Event</option>
            <option value="push">Push Nachricht</option>
            <option value="offer">App Offer</option>
            <option value="city_guide">City Guide</option>
            <option value="shuttle">Shuttle Hinweis</option>
            <option value="safety">Emergency / Safety Hinweis</option>
          </select>
        </label>
        <label>City<input name="city" placeholder="Innsbruck" /></label>
        <label>Event ID<input name="eventId" placeholder="hm-innsbruck-2026" /></label>
        <label>Partner ID<input name="partnerId" placeholder="hotel-partner" /></label>
        <label>Hotel IDs<input name="hotelIds" placeholder="signature-city-stay" /></label>
        <label>Package IDs<input name="packageIds" placeholder="pkg-signature-adriatic-2026" /></label>
        <label>Offer code<input name="code" placeholder="HOTMESSSTAY" /></label>
        <label>Scheduled at<input type="datetime-local" name="scheduledAt" /></label>
        <label>Description<textarea name="description"></textarea></label>
        <label>Push body<textarea name="body"></textarea></label>
        <label>Status
          <select name="status">
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
            <option value="published">Published</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
        <button class="button primary" type="submit">App Inhalt speichern</button>
      </form>
    </section>

    <section class="platform-section admin-app-lists">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Push / Offers / Guide</p>
        <h2>Operational placeholders.</h2>
      </div>
      <div class="event-admin-grid">
        <?php foreach (array_slice(array_merge($adminAppPushMessages, $adminAppOffers, $adminAppGuideItems, $adminAppPlacements), 0, 9) as $item): ?>
          <article class="premium-card">
            <span><?= e($item['status'] ?? 'active') ?> / <?= e($item['city'] ?? 'global') ?></span>
            <h3><?= e($item['title']) ?></h3>
            <p><?= e($item['description'] ?? $item['body'] ?? 'Prepared app content.') ?></p>
          </article>
        <?php endforeach; ?>
      </div>
    </section>
  <?php elseif ($adminTab === 'partners'): ?>
    <section class="admin-events-overview admin-partners-overview">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Partner list</p>
        <h2>Leads, active partners and placements.</h2>
        <p>Partnerdaten sind als Mockstruktur vorbereitet; Angebote, Placements, Applications und Metrics haben eigene Schema-Felder.</p>
      </div>
      <div class="partner-logo-grid">
        <?php foreach ($adminPartners as $partner): ?>
          <article class="partner-logo-card">
            <div><?= e($partner['logo']) ?></div>
            <span><?= e($partner['status']) ?> / <?= e($partner['partnerType']) ?></span>
            <h3><?= e($partner['name']) ?></h3>
            <p><?= e($partner['category']) ?> / <?= e($partner['city']) ?> / <?= e($partner['visibilityLevel']) ?></p>
            <div class="admin-event-actions">
              <form method="post">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                <input type="hidden" name="action" value="partner_status" />
                <input type="hidden" name="partner_name" value="<?= e($partner['name']) ?>" />
                <button class="button primary" type="submit">Status</button>
              </form>
              <form method="post">
                <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                <input type="hidden" name="action" value="partner_placement" />
                <input type="hidden" name="partner_name" value="<?= e($partner['name']) ?>" />
                <button class="button ghost" type="submit">Placement</button>
              </form>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
    </section>

    <section class="admin-event-editor admin-partner-editor">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Create / edit</p>
        <h2>Partner fields.</h2>
      </div>
      <form class="event-editor-form partner-editor-form" method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <input type="hidden" name="action" value="partner_create" />
        <label>Name<input name="name" required placeholder="Signature Hotel Partner" /></label>
        <label>Slug<input name="slug" required placeholder="signature-hotel-partner" /></label>
        <label>Category<input name="category" placeholder="Hotels" /></label>
        <label>City<input name="city" placeholder="Vienna" /></label>
        <label>Description<textarea name="description"></textarea></label>
        <label>Logo<input name="logo" placeholder="/uploads/logo.png or monogram" /></label>
        <label>Hero image<input name="heroImage" placeholder="/assets/packages.png" /></label>
        <label>Website URL<input name="websiteUrl" placeholder="https://..." /></label>
        <label>Contact name<input name="contactName" /></label>
        <label>Contact email<input type="email" name="contactEmail" /></label>
        <label>Partner type
          <select name="partnerType">
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
            <option value="signature">Signature</option>
          </select>
        </label>
        <label>Visibility level<input name="visibilityLevel" placeholder="Premium / Signature" /></label>
        <label>Active placements<textarea name="activePlacements"></textarea></label>
        <label>Offers<textarea name="offers"></textarea></label>
        <label>Assigned events<input name="assignedEvents" placeholder="hm-innsbruck-2026" /></label>
        <label>Assigned hotels<input name="assignedHotels" placeholder="signature-city-stay" /></label>
        <label>Assigned packages<input name="assignedPackages" placeholder="pkg-signature-adriatic-2026" /></label>
        <label>Membership benefits<textarea name="membershipBenefits"></textarea></label>
        <label>App placements<textarea name="appPlacements"></textarea></label>
        <label>Notes<textarea name="notes"></textarea></label>
        <label>Status
          <select name="status">
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <button class="button primary" type="submit">Partner speichern</button>
      </form>
    </section>

    <section class="platform-section admin-partner-lists">
      <div class="event-admin-grid">
        <?php foreach (array_slice(array_merge($adminPartnerOffers, $adminPartnerPlacements, $adminPartnerApplications, $adminPartnerMetrics), 0, 12) as $item): ?>
          <article class="premium-card">
            <span><?= e($item['status'] ?? $item['placementType'] ?? 'metric') ?></span>
            <h3><?= e($item['title'] ?? $item['companyName'] ?? $item['placementId'] ?? $item['partnerId']) ?></h3>
            <p><?= e($item['description'] ?? $item['message'] ?? ('Views: ' . ($item['views'] ?? 0) . ' / Clicks: ' . ($item['clicks'] ?? 0))) ?></p>
          </article>
        <?php endforeach; ?>
      </div>
    </section>
  <?php elseif ($adminTab === 'gallery'): ?>
    <section class="admin-module-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Gallery list</p>
        <h2>Media archive, aftermovies and campaign stories.</h2>
        <p>GalleryItem, GalleryMedia und GalleryPartnerPlacement sind als Mock- und Schema-Struktur vorbereitet.</p>
      </div>
      <div class="admin-table-card">
        <table class="admin-lux-table">
          <thead><tr><th>Galerie</th><th>Stadt</th><th>Event</th><th>Typ</th><th>Medien</th><th>Sichtbarkeit</th><th>Status</th><th>Aktion</th></tr></thead>
          <tbody>
            <?php foreach ($adminGalleryItems as $galleryItem): ?>
              <tr>
                <td><strong><?= e($galleryItem['title']) ?></strong><span><?= e($galleryItem['slug']) ?></span></td>
                <td><?= e($galleryItem['city']) ?></td>
                <td><?= e($galleryItem['eventId']) ?></td>
                <td><span class="admin-status-badge"><?= e($galleryItem['mediaType']) ?></span></td>
                <td><?= e(hotmess_gallery_media_label($galleryItem)) ?></td>
                <td><?= e($galleryItem['visibility']) ?></td>
                <td><?= e($galleryItem['status']) ?></td>
                <td><a class="button ghost" href="/gallery/<?= e($galleryItem['slug']) ?>">Preview</a></td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>

    <section class="admin-event-editor admin-gallery-editor">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Create / edit</p>
        <h2>Gallery fields.</h2>
      </div>
      <form class="event-editor-form" method="post">
        <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
        <input type="hidden" name="action" value="gallery_create" />
        <label>Title<input name="title" required placeholder="Innsbruck Private Weekend Aftermovie" /></label>
        <label>Slug<input name="slug" required placeholder="innsbruck-private-weekend-aftermovie" /></label>
        <label>City<input name="city" placeholder="Innsbruck" /></label>
        <label>Event ID<input name="eventId" placeholder="hm-innsbruck-2026" /></label>
        <label>Event date<input type="date" name="eventDate" /></label>
        <label>Media type
          <select name="mediaType">
            <option value="photos">Photos</option>
            <option value="video">Video</option>
            <option value="aftermovie">Aftermovie</option>
          </select>
        </label>
        <label>Cover image<input name="coverImage" placeholder="/assets/community-hero.png" /></label>
        <label>Images<textarea name="images" placeholder="/assets/a.png, /assets/b.png"></textarea></label>
        <label>Video URL<input name="videoUrl" placeholder="https://player.vimeo.com/video/..." /></label>
        <label>Description<textarea name="description"></textarea></label>
        <label>Photographer<input name="photographer" placeholder="HOTMESS Studio" /></label>
        <label>Partner IDs<input name="partnerIds" placeholder="hotel-partner, fashion-partner" /></label>
        <label>Sponsor IDs<input name="sponsorIds" placeholder="vip-sponsor" /></label>
        <label>Visibility
          <select name="visibility">
            <option value="public">Public</option>
            <option value="members_only">Members only</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
        <label>Status
          <select name="status">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <button class="button primary" type="submit">Galerie erstellen</button>
      </form>
    </section>

    <section class="platform-section admin-gallery-placements">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Partner placements</p>
        <h2>Gallery visibility for partners and sponsors.</h2>
      </div>
      <div class="event-admin-grid">
        <?php foreach ($adminGalleryPlacements as $placement): ?>
          <article class="premium-card">
            <span><?= e($placement['status']) ?> / <?= e($placement['placementType']) ?></span>
            <h3><?= e($placement['partnerId']) ?></h3>
            <p><?= e($placement['visibility']) ?> / Gallery: <?= e($placement['galleryId']) ?></p>
          </article>
        <?php endforeach; ?>
      </div>
    </section>
  <?php elseif ($adminTab === 'inquiries'): ?>
    <section class="admin-module-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Inquiries</p>
        <h2>Anfragen, Bewerbungen und Concierge Leads.</h2>
        <p>Package, Hotel, VIP/Table, Partner, Ambassador und General Contact laufen in einer gemeinsamen Inquiry-Struktur.</p>
      </div>
      <?php
        $filteredInquiries = array_values(array_filter($adminInquiries, function (array $inquiry) use ($inquiryTypeFilter, $inquiryStatusFilter, $inquiryCityFilter, $inquiryDateFilter): bool {
            if ($inquiryTypeFilter !== '' && $inquiry['type'] !== $inquiryTypeFilter) {
                return false;
            }
            if ($inquiryStatusFilter !== '' && $inquiry['status'] !== $inquiryStatusFilter) {
                return false;
            }
            if ($inquiryCityFilter !== '' && strcasecmp((string) $inquiry['city'], $inquiryCityFilter) !== 0) {
                return false;
            }
            if ($inquiryDateFilter !== '' && substr((string) $inquiry['createdAt'], 0, 10) !== $inquiryDateFilter) {
                return false;
            }
            return true;
        }));
        $inquiryCities = array_values(array_unique(array_filter(array_map(fn (array $inquiry): string => (string) $inquiry['city'], $adminInquiries))));
      ?>
      <form class="gallery-filter inquiry-admin-filter" method="get">
        <input type="hidden" name="tab" value="inquiries" />
        <label>Typ
          <select name="inquiryType">
            <option value="">Alle Typen</option>
            <?php foreach (hotmess_inquiry_types() as $type => $label): ?>
              <option value="<?= e($type) ?>" <?= $inquiryTypeFilter === $type ? 'selected' : '' ?>><?= e($label) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>Status
          <select name="inquiryStatus">
            <option value="">Alle Status</option>
            <?php foreach (hotmess_inquiry_statuses() as $statusKey => $label): ?>
              <option value="<?= e($statusKey) ?>" <?= $inquiryStatusFilter === $statusKey ? 'selected' : '' ?>><?= e($label) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>Stadt
          <select name="inquiryCity">
            <option value="">Alle Staedte</option>
            <?php foreach ($inquiryCities as $city): ?>
              <option value="<?= e($city) ?>" <?= $inquiryCityFilter === $city ? 'selected' : '' ?>><?= e($city) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>Datum<input type="date" name="inquiryDate" value="<?= e($inquiryDateFilter) ?>" /></label>
        <button class="button primary" type="submit">Filtern</button>
        <a class="button ghost" href="/admin/inquiries">Reset</a>
      </form>
      <?php render_inquiry_table($filteredInquiries); ?>
      <div class="inquiry-detail-grid">
        <?php foreach ($filteredInquiries as $inquiry): ?>
          <?php render_inquiry_detail_panel($inquiry); ?>
        <?php endforeach; ?>
      </div>
    </section>
  <?php elseif ($adminTab === 'leads'): ?>
    <section class="admin-module-section crm-admin-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Lead Center</p>
        <h2>Alle Anfragen werden automatisch zu operativen Leads.</h2>
        <p>Package, Hotel, VIP, Partner, Ambassador und Kontaktanfragen laufen in eine gemeinsame CRM-Schicht mit Zuweisung, Prioritaet, Aufgaben und Umsatzpotenzial.</p>
      </div>
      <div class="admin-kpi-grid revenue-kpi-grid">
        <article><span>Neue Leads</span><strong><?= e((string) $adminLeadKpis['newLeads']) ?></strong><p>Pipeline Stage Neu</p></article>
        <article><span>Offene Leads</span><strong><?= e((string) $adminLeadKpis['openLeads']) ?></strong><p>aktiv in Bearbeitung</p></article>
        <article><span>Hotel Leads</span><strong><?= e((string) $adminLeadKpis['hotelLeads']) ?></strong><p>Travel Desk</p></article>
        <article><span>Package Leads</span><strong><?= e((string) $adminLeadKpis['packageLeads']) ?></strong><p>Weekend Concierge</p></article>
        <article><span>Partner Leads</span><strong><?= e((string) $adminLeadKpis['partnerLeads']) ?></strong><p>Partner Lead</p></article>
        <article><span>VIP Leads</span><strong><?= e((string) $adminLeadKpis['vipLeads']) ?></strong><p>VIP Desk</p></article>
        <article><span>Conversion</span><strong><?= e((string) $adminLeadKpis['conversionRate']) ?>%</strong><p>gewonnen vs. entschieden</p></article>
        <article><span>Umsatzpotenzial</span><strong><?= e(number_format((float) $adminLeadKpis['revenuePotential'], 0, ',', '.')) ?> EUR</strong><p>potential revenue links</p></article>
      </div>
      <div class="table-wrap">
        <table class="admin-lux-table">
          <thead><tr><th>Lead</th><th>Kategorie</th><th>Pipeline</th><th>Prioritaet</th><th>Zuweisung</th><th>Kontakt</th><th>Potenzial</th><th>Tasks</th></tr></thead>
          <tbody>
            <?php foreach ($adminLeads as $lead): ?>
              <tr>
                <td><strong>#<?= e((string) $lead['id']) ?> <?= e($lead['title']) ?></strong><span><?= e($lead['createdAt']) ?></span></td>
                <td><?= e(hotmess_lead_categories()[$lead['category']] ?? $lead['category']) ?><span><?= e($lead['status']) ?> / <?= e($lead['sourceId']) ?></span></td>
                <td><?= e(hotmess_lead_pipeline_stages()[$lead['pipelineStage']] ?? $lead['pipelineStage']) ?></td>
                <td><span class="status-pill"><?= e(hotmess_lead_priority_labels()[$lead['priority']] ?? $lead['priority']) ?></span></td>
                <td><?= e($lead['assignedTo']) ?></td>
                <td><strong><?= e($lead['contactName']) ?></strong><span><?= e($lead['contactEmail']) ?><?= $lead['city'] ? ' / ' . e($lead['city']) : '' ?></span></td>
                <td><?= e(number_format((float) $lead['potentialRevenue'], 0, ',', '.')) ?> <?= e($lead['currency']) ?><span><?= e((string) $lead['openTaskCount']) ?> offene Tasks</span></td>
                <td>
                  <form method="post">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                    <input type="hidden" name="action" value="lead_stage_update" />
                    <input type="hidden" name="lead_id" value="<?= e((string) $lead['id']) ?>" />
                    <select name="pipeline_stage">
                      <?php foreach (hotmess_lead_pipeline_stages() as $stage => $label): ?>
                        <option value="<?= e($stage) ?>" <?= $lead['pipelineStage'] === $stage ? 'selected' : '' ?>><?= e($label) ?></option>
                      <?php endforeach; ?>
                    </select>
                    <button class="button ghost" type="submit">Speichern</button>
                  </form>
                  <form method="post">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                    <input type="hidden" name="action" value="lead_timeline_add" />
                    <input type="hidden" name="lead_id" value="<?= e((string) $lead['id']) ?>" />
                    <select name="activity_type">
                      <?php foreach (['note' => 'Notiz', 'call' => 'Anruf', 'email' => 'E-Mail', 'meeting' => 'Meeting'] as $typeKey => $label): ?>
                        <option value="<?= e($typeKey) ?>"><?= e($label) ?></option>
                      <?php endforeach; ?>
                    </select>
                    <input name="timeline_title" placeholder="Timeline Titel" />
                    <button class="button ghost" type="submit">Timeline</button>
                  </form>
                  <form method="post">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                    <input type="hidden" name="action" value="lead_email_prepare" />
                    <input type="hidden" name="lead_id" value="<?= e((string) $lead['id']) ?>" />
                    <select name="trigger_key">
                      <?php foreach (['follow_up' => 'Follow-up', 'reminder' => 'Reminder', 'offer' => 'Angebot', 'confirmation' => 'Bestaetigung'] as $trigger => $label): ?>
                        <option value="<?= e($trigger) ?>"><?= e($label) ?></option>
                      <?php endforeach; ?>
                    </select>
                    <input name="email_subject" placeholder="E-Mail Betreff" />
                    <button class="button ghost" type="submit">E-Mail</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>
  <?php elseif ($adminTab === 'pipeline'): ?>
    <section class="admin-module-section crm-admin-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Pipeline</p>
        <h2>Hospitality Sales Board fuer HOTMESS Leads.</h2>
        <p>Drag & Drop ist vorbereitet; aktuell lassen sich Stufen ueber die Lead-Karten sauber speichern und in der Timeline protokollieren.</p>
      </div>
      <div class="event-admin-grid">
        <?php foreach ($adminPipelineBoard as $stageKey => $column): ?>
          <article class="premium-card">
            <span><?= e((string) count($column['leads'])) ?> Leads</span>
            <h3><?= e($column['label']) ?></h3>
            <div class="account-mini-list">
              <?php foreach ($column['leads'] as $lead): ?>
                <a href="/admin/leads">
                  <strong>#<?= e((string) $lead['id']) ?> <?= e($lead['title']) ?></strong>
                  <span><?= e($lead['assignedTo']) ?> / <?= e(number_format((float) $lead['potentialRevenue'], 0, ',', '.')) ?> <?= e($lead['currency']) ?></span>
                </a>
              <?php endforeach; ?>
              <?php if (!$column['leads']): ?>
                <a href="/admin/pipeline"><strong>Keine Leads</strong><span>Diese Stufe ist aktuell leer.</span></a>
              <?php endif; ?>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
      <div class="premium-card">
        <span>Status Flows</span>
        <h3>Spezifische Prozesse nach Lead-Typ</h3>
        <div class="account-card-grid">
          <?php foreach (hotmess_lead_status_flows() as $category => $flow): ?>
            <article class="account-mini-card">
              <strong><?= e(hotmess_lead_categories()[$category] ?? $category) ?></strong>
              <span><?= e(implode(' -> ', array_values($flow))) ?></span>
            </article>
          <?php endforeach; ?>
        </div>
      </div>
    </section>
  <?php elseif ($adminTab === 'tasks'): ?>
    <section class="admin-module-section crm-admin-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Tasks</p>
        <h2>Automatische Follow-ups fuer keine verlorene Anfrage.</h2>
        <p>Jeder neue Lead erzeugt eine erste Aufgabe fuer Concierge, Travel, VIP, Partner oder Community Operations.</p>
      </div>
      <div class="table-wrap">
        <table class="admin-lux-table">
          <thead><tr><th>Task</th><th>Lead</th><th>Kategorie</th><th>Zuweisung</th><th>Faellig</th><th>Prioritaet</th><th>Status</th><th>Aktion</th></tr></thead>
          <tbody>
            <?php foreach ($adminLeadTasks as $task): ?>
              <tr>
                <td><strong><?= e($task['title']) ?></strong><span><?= e($task['description']) ?></span></td>
                <td>#<?= e((string) $task['leadId']) ?> <?= e($task['leadTitle']) ?><span><?= e($task['contactName']) ?></span></td>
                <td><?= e(hotmess_lead_categories()[$task['category']] ?? $task['category']) ?></td>
                <td><?= e($task['assignedTo']) ?></td>
                <td><?= e($task['dueDate']) ?></td>
                <td><span class="status-pill"><?= e(hotmess_lead_priority_labels()[$task['priority']] ?? $task['priority']) ?></span></td>
                <td><?= e($task['status']) ?></td>
                <td>
                  <form method="post">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                    <input type="hidden" name="action" value="lead_task_update" />
                    <input type="hidden" name="task_id" value="<?= e((string) $task['id']) ?>" />
                    <select name="task_status">
                      <?php foreach (['open' => 'Open', 'in_progress' => 'In Progress', 'done' => 'Done', 'archived' => 'Archived'] as $statusKey => $label): ?>
                        <option value="<?= e($statusKey) ?>" <?= $task['status'] === $statusKey ? 'selected' : '' ?>><?= e($label) ?></option>
                      <?php endforeach; ?>
                    </select>
                    <button class="button ghost" type="submit">Aktualisieren</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>
  <?php elseif ($adminTab === 'crm'): ?>
    <section class="admin-module-section crm-admin-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">CRM</p>
        <h2>Customer Journey, Scores und Relationship Signals.</h2>
        <p>Besucher entwickeln sich entlang der Journey von Registrierung bis Passport Black, VIP und Ambassador.</p>
      </div>
      <div class="admin-kpi-grid revenue-kpi-grid">
        <article><span>Neue Leads</span><strong><?= e((string) $adminLeadKpis['newLeads']) ?></strong><p>aus bestehenden Formularen</p></article>
        <article><span>Offene Leads</span><strong><?= e((string) $adminLeadKpis['openLeads']) ?></strong><p>Concierge Pipeline</p></article>
        <article><span>Conversion</span><strong><?= e((string) $adminLeadKpis['conversionRate']) ?>%</strong><p>CRM Entscheidung</p></article>
        <article><span>Umsatzpotenzial</span><strong><?= e(number_format((float) $adminLeadKpis['revenuePotential'], 0, ',', '.')) ?> EUR</strong><p>Lead Revenue Links</p></article>
      </div>
      <form class="gallery-filter inquiry-admin-filter" method="get">
        <input type="hidden" name="tab" value="crm" />
        <label>Stadt<input name="city" placeholder="Innsbruck" /></label>
        <label>Membership
          <select name="membership"><option>Alle</option><option>Free Passport</option><option>Passport Plus</option><option>Passport Black</option></select>
        </label>
        <label>Lifecycle
          <select name="lifecycle">
            <option>Alle</option>
            <?php foreach (hotmess_lifecycle_stages() as $stage): ?>
              <option><?= e($stage) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <label>Loyalty Level
          <select name="loyalty">
            <option>Alle</option>
            <?php foreach ($adminLoyaltyLevels as $level): ?>
              <option><?= e($level['title']) ?></option>
            <?php endforeach; ?>
          </select>
        </label>
        <button class="button primary" type="submit">Filter anwenden</button>
      </form>
      <div class="table-wrap">
        <table class="admin-lux-table">
          <thead><tr><th>Kunde</th><th>Lifecycle</th><th>Membership</th><th>Scores</th><th>Historie</th><th>Referral</th><th>Aktion</th></tr></thead>
          <tbody>
            <?php foreach ($adminCustomers as $customer): ?>
              <tr>
                <td><strong><?= e($customer['name']) ?></strong><span><?= e($customer['email']) ?> / <?= e($customer['city']) ?></span></td>
                <td><?= e($customer['lifecycleStage']) ?><span><?= e($customer['loyaltyLevel']) ?> / <?= e((string) $customer['loyaltyScore']) ?> pts</span></td>
                <td><?= e($customer['membership']) ?><span>Last: <?= e($customer['lastActivity']) ?></span></td>
                <td><span>E <?= e((string) $customer['eventScore']) ?> / T <?= e((string) $customer['travelScore']) ?></span><span>C <?= e((string) $customer['communityScore']) ?> / M <?= e((string) $customer['membershipScore']) ?></span></td>
                <td><span><?= e(implode(', ', $customer['eventHistory'])) ?></span><span><?= e(implode(', ', $customer['packageHistory'])) ?></span></td>
                <td><?= e($customer['referralStatus']) ?></td>
                <td>
                  <form method="post">
                    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                    <input type="hidden" name="action" value="crm_update" />
                    <button class="button ghost" type="submit">Journey update</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>
  <?php elseif ($adminTab === 'automation'): ?>
    <section class="admin-module-section automation-admin-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Automation</p>
        <h2>Customer Journey Flows for premium retention.</h2>
        <p>Trigger und Aktionen sind vorbereitet fuer HubSpot, Brevo, Mailchimp oder ein eigenes CRM.</p>
      </div>
      <div class="event-admin-grid">
        <?php foreach ($adminAutomationRules as $rule): ?>
          <article class="automation-rule-card">
            <span><?= e($rule['enabled'] ? 'Enabled' : 'Paused') ?> / <?= e($rule['status']) ?></span>
            <h3><?= e($rule['title']) ?></h3>
            <p><?= e($rule['description']) ?></p>
            <dl>
              <div><dt>Trigger</dt><dd><?= e($rule['trigger']) ?></dd></div>
              <div><dt>Action</dt><dd><?= e($rule['action']) ?></dd></div>
            </dl>
            <form method="post">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
              <input type="hidden" name="action" value="automation_toggle" />
              <button class="button ghost" type="submit">Flow bearbeiten</button>
            </form>
          </article>
        <?php endforeach; ?>
      </div>
    </section>
  <?php elseif ($adminTab === 'loyalty'): ?>
    <section class="admin-module-section loyalty-admin-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Loyalty</p>
        <h2>HotMess Points, Levels and rewards.</h2>
        <p>Das Loyalty-System motiviert wiederkehrende Teilnahme, Travel-Buchungen, Membership Upgrades und hochwertige Referrals.</p>
      </div>
      <div class="account-card-grid">
        <?php foreach ($adminLoyaltyLevels as $level): ?>
          <article class="loyalty-level-card">
            <span><?= e($level['badge']) ?></span>
            <h3><?= e($level['title']) ?></h3>
            <p><?= e((string) $level['threshold']) ?> points threshold</p>
            <ul class="luxury-list">
              <?php foreach ($level['benefits'] as $benefit): ?>
                <li><?= e($benefit) ?></li>
              <?php endforeach; ?>
            </ul>
          </article>
        <?php endforeach; ?>
      </div>
      <div class="event-admin-grid">
        <?php foreach ($adminRewards as $reward): ?>
          <article class="premium-card">
            <span><?= e($reward['status']) ?> / <?= e($reward['levelRequired']) ?></span>
            <h3><?= e($reward['title']) ?></h3>
            <p><?= e($reward['description']) ?></p>
            <strong><?= e((string) $reward['pointsRequired']) ?> HotMess Points</strong>
            <form method="post">
              <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
              <input type="hidden" name="action" value="loyalty_reward_update" />
              <button class="button ghost" type="submit">Reward bearbeiten</button>
            </form>
          </article>
        <?php endforeach; ?>
      </div>
    </section>
  <?php elseif ($adminTab === 'revenue'): ?>
    <section class="admin-module-section revenue-admin-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Revenue Engine</p>
        <h2>All monetization sources in one premium control layer.</h2>
        <p>Tickets, hotels, packages, memberships, partner offers, sponsoring, referrals, VIP and concierge can be tracked as structured revenue streams.</p>
        <p class="field-hint">Stripe Status: <?= hotmess_stripe_is_configured() ? 'konfiguriert' : 'nicht konfiguriert - echte Checkouts starten erst nach STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY und STRIPE_WEBHOOK_SECRET' ?></p>
      </div>
      <form class="gallery-filter inquiry-admin-filter" method="get">
        <input type="hidden" name="tab" value="revenue" />
        <label>Zeitraum<select name="period"><option>Last 30 days</option><option>Quarter</option><option>Year</option></select></label>
        <label>Stadt<input name="city" placeholder="Innsbruck" /></label>
        <label>Event<input name="event" placeholder="Event" /></label>
        <label>Partner<input name="partner" placeholder="Partner" /></label>
        <button class="button primary" type="submit">Report filtern</button>
      </form>
      <div class="admin-kpi-grid revenue-kpi-grid">
        <article><span>Gesamtumsatz</span><strong><?= e(number_format((int) $adminRevenueKpis['totalRevenue'], 0, ',', '.')) ?> EUR</strong><p>all sources</p></article>
        <article><span>Tickets</span><strong><?= e(number_format((int) $adminRevenueKpis['tickets'], 0, ',', '.')) ?> EUR</strong><p>ticket sales</p></article>
        <article><span>Hotels</span><strong><?= e(number_format((int) $adminRevenueKpis['hotels'], 0, ',', '.')) ?> EUR</strong><p>hotel commission</p></article>
        <article><span>Packages</span><strong><?= e(number_format((int) $adminRevenueKpis['packages'], 0, ',', '.')) ?> EUR</strong><p>weekend packages</p></article>
        <article><span>Memberships</span><strong><?= e(number_format((int) $adminRevenueKpis['memberships'], 0, ',', '.')) ?> EUR</strong><p>Passport revenue</p></article>
        <article><span>Partner Offers</span><strong><?= e(number_format((int) $adminRevenueKpis['partnerOffers'], 0, ',', '.')) ?> EUR</strong><p>redemptions</p></article>
        <article><span>Sponsoring</span><strong><?= e(number_format((int) $adminRevenueKpis['sponsoring'], 0, ',', '.')) ?> EUR</strong><p>placements</p></article>
        <article><span>VIP / Concierge</span><strong><?= e(number_format((int) ($adminRevenueKpis['vip'] + $adminRevenueKpis['concierge']), 0, ',', '.')) ?> EUR</strong><p>service revenue</p></article>
      </div>
      <?php
        $revenueEventOptions = hotmess_revenue_event_options($adminEvents);
        $revenueSourceOptions = hotmess_revenue_comparison_source_options();
        $revenueSourceLabels = [
            'ticket' => 'Verkaufte Tickets',
            'hotel_package' => 'Hotelpakete',
            'drink_package' => 'Getränkepakete',
            'other' => 'Weitere Umsätze',
        ];
        $revenueSelectedSourceSet = $adminRevenueSourceTypes === 'all' ? ['ticket', 'hotel_package', 'drink_package', 'other'] : $adminRevenueSourceTypes;
        $revenueChartMax = 0.0;
        foreach ($adminRevenueComparison['series'] as $series) {
            foreach ($series['points'] as $point) {
                $revenueChartMax = max($revenueChartMax, (float) $point['amount']);
            }
        }
        $revenueChartMax = max(1.0, $revenueChartMax);
        $revenueChartColors = ['#d6b56d', '#9fb7ff', '#e48c7c'];
        $revenuePointCount = count($adminRevenueComparison['series'][0]['points'] ?? []);
      ?>
      <section class="premium-card revenue-comparison-card" aria-labelledby="revenue-comparison-title">
        <div class="section-heading platform-heading">
          <p class="eyebrow">Event-Umsatzvergleich <?= $adminRevenueComparison['demo'] ? '/ Demo-Daten' : '' ?></p>
          <h2 id="revenue-comparison-title">Event-Umsatzvergleich</h2>
          <p>Vergleiche die Umsatzentwicklung von bis zu drei Events und wähle aus, welche Umsatzarten berücksichtigt werden sollen.</p>
          <?php if ($adminRevenueTooManyEvents): ?><p class="field-hint">Du kannst maximal 3 Events vergleichen.</p><?php endif; ?>
          <?php if (!$adminRevenueSelectedEvents): ?><p class="field-hint">Wähle mindestens ein Event aus, um den Umsatzvergleich zu starten.</p><?php endif; ?>
        </div>
        <form class="revenue-comparison-filter" method="get" data-revenue-comparison-filter>
          <input type="hidden" name="tab" value="revenue" />
          <div class="revenue-filter-block">
            <span>Zeitraum</span>
            <div class="revenue-range-row">
              <?php foreach (hotmess_revenue_comparison_ranges() as $rangeKey => $rangeLabel): ?>
                <label class="revenue-chip <?= $adminRevenueRange === $rangeKey ? 'is-active' : '' ?>">
                  <input type="radio" name="revenueRange" value="<?= e($rangeKey) ?>" <?= $adminRevenueRange === $rangeKey ? 'checked' : '' ?> />
                  <?= e($rangeLabel) ?>
                </label>
              <?php endforeach; ?>
            </div>
          </div>
          <div class="revenue-filter-block revenue-event-select">
            <span>Event-Auswahl</span>
            <div class="revenue-event-grid">
              <?php foreach ($revenueEventOptions as $event): ?>
                <?php $isSelectedEvent = in_array($event['id'], $adminRevenueSelectedEvents, true); ?>
                <label class="revenue-event-option <?= $isSelectedEvent ? 'is-active' : '' ?>">
                  <input type="checkbox" name="revenueEvents[]" value="<?= e($event['id']) ?>" <?= $isSelectedEvent ? 'checked' : '' ?> />
                  <strong><?= e($event['title']) ?></strong>
                  <span><?= e($event['city']) ?> / <?= e($event['date']) ?></span>
                </label>
              <?php endforeach; ?>
            </div>
          </div>
          <div class="revenue-filter-block">
            <span>Umsatzarten</span>
            <div class="revenue-source-row">
              <?php foreach ($revenueSourceOptions as $sourceKey => $sourceLabel): ?>
                <?php $sourceActive = $adminRevenueSourceTypes === 'all' ? $sourceKey === 'all' : in_array($sourceKey, $adminRevenueSourceTypes, true); ?>
                <label class="revenue-chip <?= $sourceActive ? 'is-active' : '' ?> <?= $adminRevenueSourceTypes === 'all' && $sourceKey !== 'all' ? 'is-soft-disabled' : '' ?>">
                  <input type="checkbox" name="revenueSourceTypes[]" value="<?= e($sourceKey) ?>" <?= $sourceActive ? 'checked' : '' ?> />
                  <?= e($sourceLabel) ?>
                </label>
              <?php endforeach; ?>
            </div>
          </div>
          <button class="button primary" type="submit">Vergleich aktualisieren</button>
        </form>
        <div class="admin-kpi-grid revenue-comparison-kpis">
          <?php foreach ($adminRevenueComparisonKpis as $kpi): ?>
            <article>
              <span><?= e($kpi['label']) ?></span>
              <strong><?= e(number_format((float) $kpi['amount'], 0, ',', '.')) ?> EUR</strong>
              <p><?= count($adminRevenueSelectedEvents) > 1 ? 'Summe der ausgewählten Events' : 'Ausgewähltes Event' ?></p>
            </article>
          <?php endforeach; ?>
        </div>
        <div class="revenue-line-chart-wrap" role="img" aria-label="Linien-Diagramm fuer den Event-Umsatzvergleich">
          <svg class="revenue-line-chart" viewBox="0 0 1080 340" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revenueGridFade" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="rgba(255,255,255,.16)" />
                <stop offset="100%" stop-color="rgba(255,255,255,.04)" />
              </linearGradient>
            </defs>
            <?php for ($grid = 0; $grid <= 4; $grid++): $gridY = 30 + ($grid * 65); ?>
              <line x1="40" y1="<?= e((string) $gridY) ?>" x2="1040" y2="<?= e((string) $gridY) ?>" stroke="rgba(255,255,255,.08)" stroke-width="1" />
            <?php endfor; ?>
            <?php foreach ($adminRevenueComparison['series'] as $seriesIndex => $series): ?>
              <?php
                $polylinePoints = [];
                foreach ($series['points'] as $pointIndex => $point) {
                    $x = 40 + ($revenuePointCount > 1 ? ($pointIndex * (1000 / max(1, $revenuePointCount - 1))) : 0);
                    $y = 290 - (((float) $point['amount'] / $revenueChartMax) * 240);
                    $polylinePoints[] = round($x, 2) . ',' . round($y, 2);
                }
                $lineColor = $revenueChartColors[$seriesIndex % count($revenueChartColors)];
              ?>
              <polyline points="<?= e(implode(' ', $polylinePoints)) ?>" fill="none" stroke="<?= e($lineColor) ?>" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
              <?php foreach ($series['points'] as $pointIndex => $point): ?>
                <?php
                  $x = 40 + ($revenuePointCount > 1 ? ($pointIndex * (1000 / max(1, $revenuePointCount - 1))) : 0);
                  $y = 290 - (((float) $point['amount'] / $revenueChartMax) * 240);
                  $tooltipLines = [$series['event']['title'], 'Datum: ' . $point['label']];
                  foreach ($revenueSourceLabels as $sourceKey => $sourceLabel) {
                      if ($sourceKey === 'other' && $adminRevenueSourceTypes !== 'all') {
                          continue;
                      }
                      if ($adminRevenueSourceTypes !== 'all' && !in_array($sourceKey, $adminRevenueSourceTypes, true)) {
                          continue;
                      }
                      $tooltipLines[] = $sourceLabel . ': ' . number_format((float) ($point['breakdown'][$sourceKey] ?? 0), 0, ',', '.') . ' EUR';
                  }
                  $tooltipLines[] = 'Gesamt: ' . number_format((float) $point['amount'], 0, ',', '.') . ' EUR';
                ?>
                <circle cx="<?= e((string) round($x, 2)) ?>" cy="<?= e((string) round($y, 2)) ?>" r="7" fill="<?= e($lineColor) ?>" stroke="#101010" stroke-width="3">
                  <title><?= e(implode("\n", $tooltipLines)) ?></title>
                </circle>
              <?php endforeach; ?>
            <?php endforeach; ?>
          </svg>
        </div>
        <div class="revenue-chart-legend">
          <?php foreach ($adminRevenueComparison['series'] as $seriesIndex => $series): ?>
            <span><i style="--legend-color: <?= e($revenueChartColors[$seriesIndex % count($revenueChartColors)]) ?>"></i><?= e($series['event']['title']) ?></span>
          <?php endforeach; ?>
        </div>
        <div class="table-wrap revenue-details-table">
          <h3>Umsatzdetails</h3>
          <table class="admin-lux-table">
            <thead><tr><th>Event</th><th>Verkaufte Tickets</th><th>Hotelpakete</th><th>Getränkepakete</th><th>Gesamt</th></tr></thead>
            <tbody>
              <?php foreach ($adminRevenueComparison['series'] as $series): ?>
                <?php $totals = getRevenueTotalsBySourceTypes((string) $series['event']['id'], $adminRevenueSourceTypes, $adminRevenueRange, $adminEvents); ?>
                <tr>
                  <td><strong><?= e($series['event']['title']) ?></strong><span><?= e($series['event']['city']) ?> / <?= e($series['event']['date']) ?></span></td>
                  <td><?= ($adminRevenueSourceTypes === 'all' || in_array('ticket', $adminRevenueSourceTypes, true)) ? e(number_format((float) $totals['ticket'], 0, ',', '.')) . ' EUR' : '–' ?></td>
                  <td><?= ($adminRevenueSourceTypes === 'all' || in_array('hotel_package', $adminRevenueSourceTypes, true)) ? e(number_format((float) $totals['hotel_package'], 0, ',', '.')) . ' EUR' : '–' ?></td>
                  <td><?= ($adminRevenueSourceTypes === 'all' || in_array('drink_package', $adminRevenueSourceTypes, true)) ? e(number_format((float) $totals['drink_package'], 0, ',', '.')) . ' EUR' : '–' ?></td>
                  <td><strong><?= e(number_format((float) $totals['total'], 0, ',', '.')) ?> EUR</strong></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </section>
      <div class="revenue-report-grid">
        <?php foreach ($adminRevenueReports as $title => $items): ?>
          <article class="premium-card revenue-chart-card">
            <span><?= e($title) ?></span>
            <h3><?= e(ucwords(preg_replace('/(?<!^)[A-Z]/', ' $0', $title))) ?></h3>
            <div class="account-mini-list">
              <?php foreach ($items as $item): ?>
                <a href="/admin/revenue">
                  <strong><?= e((string) ($item['city'] ?? $item['title'] ?? $item['code'])) ?></strong>
                  <span><?= e((string) ($item['revenue'] ?? '')) ?> EUR / <?= e((string) ($item['growth'] ?? $item['conversion'] ?? $item['conversions'] ?? '')) ?></span>
                </a>
              <?php endforeach; ?>
            </div>
          </article>
        <?php endforeach; ?>
      </div>
      <div class="table-wrap">
        <table class="admin-lux-table">
          <thead><tr><th>Quelle</th><th>Label</th><th>Stadt</th><th>Betrag</th><th>Datum</th></tr></thead>
          <tbody>
            <?php foreach ($adminRevenueTransactions as $transaction): ?>
              <tr><td><?= e($transaction['sourceType']) ?></td><td><strong><?= e($transaction['label']) ?></strong><span><?= e($transaction['sourceId']) ?></span></td><td><?= e($transaction['city']) ?></td><td><?= e(number_format((int) $transaction['amount'], 0, ',', '.')) ?> <?= e($transaction['currency']) ?></td><td><?= e($transaction['createdAt']) ?></td></tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    </section>
  <?php elseif ($adminTab === 'analytics'): ?>
    <section class="admin-module-section analytics-admin-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Business Intelligence</p>
        <h2>Conversion, member growth and platform value.</h2>
      </div>
      <div class="admin-kpi-grid">
        <?php foreach ($adminAnalyticsKpis as $label => $value): ?>
          <article><span><?= e(ucwords(preg_replace('/(?<!^)[A-Z]/', ' $0', (string) $label))) ?></span><strong><?= e((string) $value) ?></strong><p>BI placeholder</p></article>
        <?php endforeach; ?>
      </div>
      <div class="revenue-report-grid">
        <article class="premium-card"><span>Partner ranking</span><h3>Top placements</h3><div class="account-mini-list"><?php foreach (hotmess_partner_analytics() as $metric): ?><a href="/admin/analytics"><strong><?= e($metric['partner']) ?></strong><span><?= e((string) $metric['views']) ?> views / <?= e($metric['conversionRate']) ?></span></a><?php endforeach; ?></div></article>
        <article class="premium-card"><span>City comparison</span><h3>Market performance</h3><div class="account-mini-list"><?php foreach ($adminRevenueReports['cityComparison'] as $city): ?><a href="/admin/analytics"><strong><?= e($city['city']) ?></strong><span><?= e((string) $city['revenue']) ?> EUR / <?= e($city['growth']) ?></span></a><?php endforeach; ?></div></article>
      </div>
    </section>
  <?php elseif ($adminTab === 'sponsors'): ?>
    <section class="admin-module-section sponsors-admin-section">
      <div class="section-heading platform-heading"><p class="eyebrow">Sponsors</p><h2>Sponsoring products and placements.</h2></div>
      <div class="account-card-grid">
        <?php foreach ($adminSponsorProducts as $product): ?>
          <article class="sponsor-product-card"><span><?= e($product['status']) ?> / <?= e($product['placementType']) ?></span><h3><?= e($product['name']) ?></h3><p><?= e($product['visibility']) ?></p><strong><?= e(number_format((int) $product['price'], 0, ',', '.')) ?> EUR</strong></article>
        <?php endforeach; ?>
      </div>
      <div class="table-wrap">
        <table class="admin-lux-table"><thead><tr><th>Sponsor</th><th>Laufzeit</th><th>Staedte</th><th>Events</th><th>Placement</th><th>Preis</th><th>Status</th></tr></thead><tbody>
          <?php foreach ($adminSponsorPlacements as $placement): ?>
            <tr><td><strong><?= e($placement['sponsorName']) ?></strong><span><?= e($placement['visibility']) ?></span></td><td><?= e($placement['runTime']) ?></td><td><?= e(implode(', ', $placement['cities'])) ?></td><td><?= e(implode(', ', $placement['events'])) ?></td><td><?= e($placement['placementType']) ?></td><td><?= e(number_format((int) $placement['price'], 0, ',', '.')) ?> EUR</td><td><?= e($placement['status']) ?></td></tr>
          <?php endforeach; ?>
        </tbody></table>
      </div>
    </section>
  <?php elseif ($adminTab === 'commissions'): ?>
    <section class="admin-module-section commissions-admin-section">
      <div class="section-heading platform-heading"><p class="eyebrow">Commissions</p><h2>Provision rules and payout control.</h2><p>Unterstuetzt Prozent- und Fixbetrag-Provisionen fuer Hotels, Packages, Referrals, Ambassadors und Partner Revenue Share.</p></div>
      <div class="event-admin-grid">
        <?php foreach ($adminCommissionRules as $rule): ?>
          <article class="premium-card"><span><?= $rule['active'] ? 'active' : 'paused' ?></span><h3><?= e($rule['type']) ?></h3><p><?= e($rule['description']) ?></p><strong><?= $rule['percentage'] !== null ? e((string) $rule['percentage']) . '%' : e((string) $rule['fixedAmount']) . ' EUR fix' ?></strong></article>
        <?php endforeach; ?>
      </div>
      <div class="table-wrap">
        <table class="admin-lux-table"><thead><tr><th>Empfaenger</th><th>Typ</th><th>Betrag</th><th>Status</th></tr></thead><tbody><?php foreach ($adminCommissionPayouts as $payout): ?><tr><td><?= e($payout['recipient']) ?></td><td><?= e($payout['type']) ?></td><td><?= e((string) $payout['amount']) ?> <?= e($payout['currency']) ?></td><td><?= e($payout['status']) ?></td></tr><?php endforeach; ?></tbody></table>
      </div>
    </section>
  <?php elseif ($adminTab === 'referrals'): ?>
    <section class="admin-module-section referrals-admin-section">
      <div class="section-heading platform-heading"><p class="eyebrow">Referral Engine</p><h2>Referral codes, campaigns, rewards and conversion.</h2></div>
      <div class="event-admin-grid">
        <?php foreach ($adminReferralCampaigns as $campaign): ?>
          <article class="premium-card"><span><?= e($campaign['status']) ?> / <?= e($campaign['rewardType']) ?></span><h3><?= e($campaign['name']) ?></h3><p>Code: <?= e($campaign['code']) ?> / Reward: <?= e((string) $campaign['rewardValue']) ?></p><strong><?= e($campaign['conversion']) ?> conversion</strong></article>
        <?php endforeach; ?>
      </div>
    </section>
  <?php elseif ($adminTab === 'settings'): ?>
    <section class="admin-module-section">
      <div class="section-heading platform-heading">
        <p class="eyebrow">Settings</p>
        <h2>Brand, Provider und Plattform-Platzhalter.</h2>
      </div>
      <div class="admin-settings-grid">
        <?php foreach ($adminSettings as $key => $value): ?>
          <article class="premium-card">
            <span><?= e($key) ?></span>
            <h3><?= e($key) ?></h3>
            <p><?= e((string) $value) ?></p>
          </article>
        <?php endforeach; ?>
      </div>
      <section id="create" class="admin-event-editor">
        <form class="event-editor-form" method="post">
          <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
          <input type="hidden" name="action" value="settings_update" />
          <label>Brand Name<input name="brandName" value="<?= e($adminSettings['brandName']) ?>" /></label>
          <label>Kontakt E-Mail<input name="contactEmail" value="<?= e($adminSettings['contactEmail']) ?>" /></label>
          <label>Instagram<input name="instagram" value="<?= e($adminSettings['instagram']) ?>" /></label>
          <label>Ticket Provider<textarea name="ticketProvider"><?= e($adminSettings['ticketProvider']) ?></textarea></label>
          <label>Stripe Placeholder<textarea name="stripeStatus"><?= e($adminSettings['stripeStatus']) ?></textarea></label>
          <label>Navigation<textarea name="navigation">Events, Tickets, Hotels, Packages, Community, Membership, App, Partners</textarea></label>
          <button class="button primary" type="submit">Settings speichern</button>
        </form>
      </section>
    </section>
  <?php else: ?>

  <section class="status-overview">
    <?php foreach (allowed_member_statuses() as $statusKey): ?>
      <a class="status-card <?= $status === $statusKey ? 'is-active' : '' ?>" href="<?= e(admin_query(['status' => $statusKey, 'page' => 1])) ?>">
        <span><?= e(member_status_label($statusKey)) ?></span>
        <strong><?= e((string) $statusCounts[$statusKey]) ?></strong>
      </a>
    <?php endforeach; ?>
    <a class="status-card <?= $status === '' ? 'is-active' : '' ?>" href="admin.php">
      <span>Alle</span>
      <strong><?= e((string) array_sum($statusCounts)) ?></strong>
    </a>
  </section>

  <section class="admin-tools">
    <form class="admin-search" method="get">
      <input type="text" name="search" value="<?= e($search) ?>" placeholder="Name, E-Mail oder Telefon suchen" />
      <select name="status">
        <option value="">Alle Status</option>
        <?php foreach (allowed_member_statuses() as $statusKey): ?>
          <option value="<?= e($statusKey) ?>" <?= $status === $statusKey ? 'selected' : '' ?>><?= e(member_status_label($statusKey)) ?></option>
        <?php endforeach; ?>
      </select>
      <select name="sort">
        <option value="created_desc" <?= $sort === 'created_desc' ? 'selected' : '' ?>>Neueste zuerst</option>
        <option value="created_asc" <?= $sort === 'created_asc' ? 'selected' : '' ?>>Älteste zuerst</option>
        <option value="name_asc" <?= $sort === 'name_asc' ? 'selected' : '' ?>>Name A-Z</option>
        <option value="name_desc" <?= $sort === 'name_desc' ? 'selected' : '' ?>>Name Z-A</option>
        <option value="status_asc" <?= $sort === 'status_asc' ? 'selected' : '' ?>>Status</option>
      </select>
      <button class="button primary" type="submit">Filtern</button>
    </form>
  </section>

  <form class="bulk-form" method="post" data-bulk-form>
    <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
    <input type="hidden" name="action" value="bulk" />
    <div class="bulk-bar">
      <label class="check-row">
        <input type="checkbox" data-select-visible />
        <span>Alle sichtbaren Bewerber auswählen</span>
      </label>
      <select name="status" required>
        <option value="">Massenaktion wählen</option>
        <?php foreach (allowed_member_statuses() as $statusKey): ?>
          <option value="<?= e($statusKey) ?>"><?= e(member_status_label($statusKey)) ?></option>
        <?php endforeach; ?>
      </select>
      <button class="button primary" type="submit">Auswahl aktualisieren</button>
      <span class="selected-count" data-selected-count>0 ausgewählt</span>
    </div>

    <section class="member-table-wrap">
      <table class="member-table">
        <thead>
          <tr>
            <th><input type="checkbox" data-select-visible /></th>
            <th>Vorname</th>
            <th>Nachname</th>
            <th>E-Mail</th>
            <th>Telefon</th>
            <th>Registriert</th>
            <th>Status</th>
            <th>Letzte Änderung</th>
            <th>Foto</th>
            <th>Kontaktdaten</th>
            <th>Instagram</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($members as $member): ?>
            <tr>
              <td><input type="checkbox" name="member_ids[]" value="<?= e((string) $member['id']) ?>" data-member-checkbox /></td>
              <td><strong><?= e($member['first_name'] ?: $member['name']) ?></strong></td>
              <td><?= e($member['last_name'] ?? '') ?></td>
              <td>
                <?= e($member['email']) ?>
                <span>E-Mail: <?= !empty($member['email_verified_at']) ? 'bestätigt' : 'offen' ?></span>
              </td>
              <td>
                <?= e($member['phone'] ?? '-') ?>
                <span>Telefon: <?= !empty($member['phone_verified_at']) ? 'bestätigt' : 'offen' ?></span>
              </td>
              <td><?= e(date('d.m.Y H:i', strtotime((string) $member['created_at']))) ?></td>
              <td><?= e(member_status_label($member['status'])) ?></td>
              <td><?= e($member['last_status_change'] ? date('d.m.Y H:i', strtotime((string) $member['last_status_change'])) : '-') ?></td>
              <td>
                <?php if (!empty($member['profile_photo'])): ?>
                  <a href="<?= e($member['profile_photo']) ?>" target="_blank" rel="noreferrer">
                    <img class="profile-photo-thumb" src="<?= e($member['profile_photo']) ?>" alt="Profilbild von <?= e($member['name']) ?>" />
                  </a>
                <?php else: ?>
                  <span>Kein Foto</span>
                <?php endif; ?>
              </td>
              <td>
                <span>Geboren: <?= e($member['birthdate'] ?? '-') ?></span>
                <span><?= e($member['street'] ?? '-') ?></span>
                <span><?= e($member['postal_code'] ?? '-') ?> <?= e($member['city']) ?>, <?= e($member['country'] ?? '-') ?></span>
              </td>
              <td>
                <a href="https://www.instagram.com/<?= e(ltrim($member['instagram_handle'], '@')) ?>/" target="_blank" rel="noreferrer">
                  <?= e($member['instagram_handle']) ?>
                </a>
              </td>
              <td>
                <form class="admin-form" method="post">
                  <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>" />
                  <input type="hidden" name="action" value="single" />
                  <input type="hidden" name="user_id" value="<?= e((string) $member['id']) ?>" />
                  <select name="status">
                    <?php foreach (allowed_member_statuses() as $statusKey): ?>
                      <option value="<?= e($statusKey) ?>" <?= $member['status'] === $statusKey ? 'selected' : '' ?>><?= e(member_status_label($statusKey)) ?></option>
                    <?php endforeach; ?>
                  </select>
                  <input type="text" name="admin_note" value="<?= e($member['admin_note']) ?>" placeholder="Notiz" />
                  <button class="button primary" type="submit">Speichern</button>
                  <a class="small-link" href="applicant.php?id=<?= e((string) $member['id']) ?>">Details</a>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </section>
  </form>

  <nav class="pagination" aria-label="Seitennavigation">
    <?php for ($i = 1; $i <= $totalPages; $i++): ?>
      <a class="<?= $i === $page ? 'is-active' : '' ?>" href="<?= e(admin_query(['page' => $i])) ?>"><?= e((string) $i) ?></a>
    <?php endfor; ?>
  </nav>

  <section class="status-log">
    <h2>Statusprotokoll</h2>
    <?php foreach ($logs as $log): ?>
      <p>
        <strong><?= e($log['member_name'] ?? 'Bewerber') ?></strong>:
        <?= e(member_status_label($log['old_status'])) ?> → <?= e(member_status_label($log['new_status'])) ?>
        <span><?= e(date('d.m.Y H:i', strtotime((string) $log['created_at']))) ?> durch <?= e($log['admin_name'] ?? 'Admin') ?> · <?= e($log['action_type'] === 'bulk' ? 'Massenaktion' : 'Einzelaktion') ?></span>
      </p>
    <?php endforeach; ?>
  </section>
  <?php endif; ?>
</main>

<?php render_footer(); ?>
