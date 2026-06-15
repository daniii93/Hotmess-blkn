<?php

declare(strict_types=1);

function hotmess_lead_categories(): array
{
    return [
        'hotel' => 'Hotel',
        'package' => 'Package',
        'vip' => 'VIP / Table',
        'partner' => 'Partner',
        'ambassador' => 'Ambassador',
        'membership' => 'Membership',
        'contact' => 'Contact',
    ];
}

function hotmess_lead_pipeline_stages(): array
{
    return [
        'new' => 'Neu',
        'contacted' => 'Kontaktiert',
        'qualified' => 'Qualifiziert',
        'offer_sent' => 'Angebot gesendet',
        'negotiation' => 'In Verhandlung',
        'won' => 'Gewonnen',
        'lost' => 'Verloren',
    ];
}

function hotmess_lead_priority_labels(): array
{
    return [
        'low' => 'Low',
        'medium' => 'Medium',
        'high' => 'High',
        'urgent' => 'Urgent',
    ];
}

function hotmess_lead_status_flows(): array
{
    return [
        'hotel' => ['new' => 'Neu', 'hotel_contacted' => 'Hotel kontaktiert', 'offer_received' => 'Angebot erhalten', 'guest_informed' => 'Gast informiert', 'closed' => 'Abgeschlossen'],
        'package' => ['new' => 'Neu', 'consulting' => 'Beratung', 'offer' => 'Angebot', 'booked' => 'Gebucht', 'lost' => 'Verloren'],
        'vip' => ['new' => 'Neu', 'review' => 'Pruefung', 'offer' => 'Angebot', 'confirmed' => 'Bestaetigt', 'rejected' => 'Abgelehnt'],
        'partner' => ['inquiry' => 'Anfrage', 'first_call' => 'Erstgespraech', 'offer' => 'Angebot', 'contract' => 'Vertrag', 'active' => 'Aktiv'],
        'ambassador' => ['new' => 'Neu', 'screening' => 'Pruefung', 'interview' => 'Gespraech', 'accepted' => 'Angenommen', 'rejected' => 'Abgelehnt'],
        'membership' => ['new' => 'Neu', 'contacted' => 'Kontaktiert', 'upgrade_offer' => 'Upgrade Angebot', 'converted' => 'Konvertiert', 'lost' => 'Verloren'],
        'contact' => ['new' => 'Neu', 'contacted' => 'Kontaktiert', 'resolved' => 'Geloest', 'archived' => 'Archiviert'],
    ];
}

function hotmess_inquiry_type_to_lead_category(string $type): string
{
    return match ($type) {
        'hotel' => 'hotel',
        'package' => 'package',
        'vip_table' => 'vip',
        'partner' => 'partner',
        'ambassador' => 'ambassador',
        default => 'contact',
    };
}

function hotmess_lead_assignment_for_category(string $category): string
{
    return match ($category) {
        'hotel' => 'Travel Desk',
        'package' => 'Weekend Concierge',
        'vip' => 'VIP Desk',
        'partner' => 'Partner Lead',
        'ambassador' => 'Community Lead',
        'membership' => 'Membership Desk',
        default => 'Concierge Desk',
    };
}

function hotmess_lead_priority_for_category(string $category): string
{
    return match ($category) {
        'vip', 'partner' => 'high',
        'package', 'hotel', 'ambassador' => 'medium',
        default => 'low',
    };
}

function hotmess_ensure_lead_tables(): void
{
    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_leads (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          inquiry_id INT UNSIGNED NULL UNIQUE,
          user_id INT UNSIGNED NULL,
          source ENUM('hotel', 'package', 'vip', 'partner', 'ambassador', 'membership', 'contact') NOT NULL,
          category ENUM('hotel', 'package', 'vip', 'partner', 'ambassador', 'membership', 'contact') NOT NULL,
          status VARCHAR(80) NOT NULL DEFAULT 'new',
          pipeline_stage ENUM('new', 'contacted', 'qualified', 'offer_sent', 'negotiation', 'won', 'lost') NOT NULL DEFAULT 'new',
          priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
          assigned_to VARCHAR(120) NOT NULL DEFAULT 'Concierge Desk',
          title VARCHAR(190) NOT NULL,
          contact_name VARCHAR(160) NOT NULL,
          contact_email VARCHAR(190) NOT NULL,
          contact_phone VARCHAR(80) NULL,
          city VARCHAR(120) NULL,
          source_id VARCHAR(120) NULL,
          potential_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
          currency CHAR(3) NOT NULL DEFAULT 'EUR',
          user_membership_tier VARCHAR(80) NULL,
          metadata JSON NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT platform_leads_inquiry_fk FOREIGN KEY (inquiry_id) REFERENCES platform_inquiries(id) ON DELETE SET NULL,
          CONSTRAINT platform_leads_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX platform_leads_stage_idx (pipeline_stage, status),
          INDEX platform_leads_category_idx (category, priority),
          INDEX platform_leads_assigned_idx (assigned_to),
          INDEX platform_leads_created_idx (created_at)
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_lead_tasks (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          lead_id INT UNSIGNED NOT NULL,
          title VARCHAR(190) NOT NULL,
          description TEXT NULL,
          assigned_to VARCHAR(120) NOT NULL,
          due_date DATE NULL,
          priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
          status ENUM('open', 'in_progress', 'done', 'archived') NOT NULL DEFAULT 'open',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT platform_lead_tasks_lead_fk FOREIGN KEY (lead_id) REFERENCES platform_leads(id) ON DELETE CASCADE,
          INDEX platform_lead_tasks_status_idx (status, due_date),
          INDEX platform_lead_tasks_lead_idx (lead_id)
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_lead_timeline (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          lead_id INT UNSIGNED NOT NULL,
          activity_type ENUM('note', 'call', 'email', 'meeting', 'status_change', 'task', 'revenue') NOT NULL,
          title VARCHAR(190) NOT NULL,
          body TEXT NULL,
          author_id INT UNSIGNED NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT platform_lead_timeline_lead_fk FOREIGN KEY (lead_id) REFERENCES platform_leads(id) ON DELETE CASCADE,
          CONSTRAINT platform_lead_timeline_author_fk FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX platform_lead_timeline_lead_idx (lead_id, created_at)
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_lead_revenue_links (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          lead_id INT UNSIGNED NOT NULL,
          revenue_transaction_id INT UNSIGNED NULL,
          source_type ENUM('hotel', 'package', 'membership', 'partner', 'vip', 'general') NOT NULL,
          amount DECIMAL(12,2) NOT NULL DEFAULT 0,
          currency CHAR(3) NOT NULL DEFAULT 'EUR',
          status ENUM('potential', 'quoted', 'won', 'lost') NOT NULL DEFAULT 'potential',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT platform_lead_revenue_links_lead_fk FOREIGN KEY (lead_id) REFERENCES platform_leads(id) ON DELETE CASCADE,
          INDEX platform_lead_revenue_links_lead_idx (lead_id, status)
        )"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS platform_lead_email_automations (
          id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          lead_id INT UNSIGNED NOT NULL,
          trigger_key ENUM('inquiry_received', 'follow_up', 'reminder', 'offer', 'confirmation') NOT NULL,
          status ENUM('prepared', 'queued', 'sent', 'failed') NOT NULL DEFAULT 'prepared',
          subject VARCHAR(190) NOT NULL,
          body TEXT NULL,
          scheduled_at DATETIME NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT platform_lead_email_automations_lead_fk FOREIGN KEY (lead_id) REFERENCES platform_leads(id) ON DELETE CASCADE,
          INDEX platform_lead_email_automations_status_idx (status, trigger_key)
        )"
    );
}

function hotmess_decode_lead_metadata(array $payload): array
{
    $raw = $payload['metadata'] ?? '{}';
    if (is_string($raw)) {
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }

    return is_array($raw) ? $raw : [];
}

function hotmess_lead_source_id(array $payload): string
{
    foreach (['related_package_id', 'related_hotel_id', 'related_event_id', 'related_partner_id'] as $key) {
        if (!empty($payload[$key])) {
            return (string) $payload[$key];
        }
    }

    return '';
}

function hotmess_lead_potential_revenue(string $category, array $metadata): float
{
    $budget = (string) ($metadata['budgetRange'] ?? '');

    return match ($category) {
        'package' => 490.0,
        'hotel' => 260.0,
        'vip' => match ($budget) {
            '1000-2500' => 1800.0,
            '2500-5000' => 3800.0,
            '5000-plus' => 6500.0,
            default => 1400.0,
        },
        'partner' => 2500.0,
        'membership' => 149.0,
        default => 0.0,
    };
}

function hotmess_default_task_for_lead(string $category, string $title): array
{
    return match ($category) {
        'hotel' => ['Hotel anrufen', 'Hotelkontingent, Preisvorteil und Rueckmeldung fuer "' . $title . '" klaeren.'],
        'package' => ['Package Beratung starten', 'Gast kontaktieren, Reisedaten pruefen und Weekend-Angebot vorbereiten.'],
        'vip' => ['VIP Angebot senden', 'Budget, Wunschbereich und Table/Bottle-Service Verfuegbarkeit pruefen.'],
        'partner' => ['Partner kontaktieren', 'Erstgespraech vorbereiten, Kategorie pruefen und Placement-Optionen senden.'],
        'ambassador' => ['Ambassador Bewerbung pruefen', 'Profil, Stadt, Instagram und moegliche Rolle sichten.'],
        'membership' => ['Membership Follow-up', 'Upgrade-Interesse pruefen und Passport Benefits senden.'],
        default => ['Kontaktanfrage beantworten', 'Anfrage sichten und passende Antwort vorbereiten.'],
    };
}

function hotmess_lead_id_for_inquiry(int $inquiryId): ?int
{
    try {
        hotmess_ensure_lead_tables();
        $stmt = db()->prepare('SELECT id FROM platform_leads WHERE inquiry_id = ? LIMIT 1');
        $stmt->execute([$inquiryId]);
        $id = $stmt->fetchColumn();

        return $id ? (int) $id : null;
    } catch (Throwable) {
        return null;
    }
}

function hotmess_create_lead_from_inquiry(int $inquiryId, array $payload): int
{
    hotmess_ensure_lead_tables();

    $existing = hotmess_lead_id_for_inquiry($inquiryId);
    if ($existing !== null) {
        return $existing;
    }

    $type = (string) ($payload['type'] ?? 'general');
    $category = hotmess_inquiry_type_to_lead_category($type);
    $metadata = hotmess_decode_lead_metadata($payload);
    $priority = hotmess_lead_priority_for_category($category);
    $assignedTo = hotmess_lead_assignment_for_category($category);
    $potentialRevenue = hotmess_lead_potential_revenue($category, $metadata);
    $sourceId = hotmess_lead_source_id($payload);
    $userId = (int) ($_SESSION['user_id'] ?? 0);

    $stmt = db()->prepare(
        'INSERT INTO platform_leads
          (inquiry_id, user_id, source, category, status, pipeline_stage, priority, assigned_to, title, contact_name, contact_email, contact_phone, city, source_id, potential_revenue, currency, user_membership_tier, metadata)
         VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $inquiryId,
        $userId > 0 ? $userId : null,
        $category,
        $category,
        $category === 'partner' ? 'inquiry' : 'new',
        'new',
        $priority,
        $assignedTo,
        (string) ($payload['subject'] ?? 'HotMess Lead'),
        (string) ($payload['name'] ?? ''),
        (string) ($payload['email'] ?? ''),
        (string) ($payload['phone'] ?? ''),
        (string) ($payload['city'] ?? ''),
        $sourceId ?: null,
        $potentialRevenue,
        'EUR',
        null,
        json_encode($metadata, JSON_UNESCAPED_SLASHES),
    ]);

    $leadId = (int) db()->lastInsertId();
    hotmess_add_lead_timeline($leadId, 'note', 'Inquiry erhalten', 'Die Anfrage wurde automatisch als Lead kategorisiert und zugewiesen.', null);
    hotmess_add_lead_revenue_link($leadId, $category, $potentialRevenue, 'potential');
    hotmess_create_default_lead_task($leadId, $category, (string) ($payload['subject'] ?? 'HotMess Lead'), $assignedTo, $priority);
    hotmess_prepare_lead_email($leadId, 'inquiry_received', 'Deine HOTMESS Anfrage ist eingegangen', 'Wir haben deine Anfrage erhalten und melden uns mit dem naechsten Concierge-Schritt.');

    return $leadId;
}

function hotmess_add_lead_timeline(int $leadId, string $activityType, string $title, string $body = '', ?int $authorId = null): void
{
    hotmess_ensure_lead_tables();
    db()->prepare(
        'INSERT INTO platform_lead_timeline (lead_id, activity_type, title, body, author_id) VALUES (?, ?, ?, ?, ?)'
    )->execute([$leadId, $activityType, $title, $body ?: null, $authorId]);
}

function hotmess_add_lead_revenue_link(int $leadId, string $category, float $amount, string $status = 'potential'): void
{
    $sourceType = in_array($category, ['hotel', 'package', 'membership', 'partner', 'vip'], true) ? $category : 'general';
    db()->prepare(
        'INSERT INTO platform_lead_revenue_links (lead_id, source_type, amount, currency, status) VALUES (?, ?, ?, ?, ?)'
    )->execute([$leadId, $sourceType, $amount, 'EUR', $status]);
}

function hotmess_create_default_lead_task(int $leadId, string $category, string $leadTitle, string $assignedTo, string $priority): void
{
    [$title, $description] = hotmess_default_task_for_lead($category, $leadTitle);
    $dueDate = (new DateTimeImmutable('+2 weekdays'))->format('Y-m-d');
    db()->prepare(
        'INSERT INTO platform_lead_tasks (lead_id, title, description, assigned_to, due_date, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )->execute([$leadId, $title, $description, $assignedTo, $dueDate, $priority, 'open']);
    hotmess_add_lead_timeline($leadId, 'task', $title, $description, null);
}

function hotmess_prepare_lead_email(int $leadId, string $triggerKey, string $subject, string $body): void
{
    db()->prepare(
        'INSERT INTO platform_lead_email_automations (lead_id, trigger_key, status, subject, body, scheduled_at) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))'
    )->execute([$leadId, $triggerKey, 'prepared', $subject, $body]);
}

function hotmess_update_lead_stage(int $leadId, string $stage, ?int $adminId = null): void
{
    if (!array_key_exists($stage, hotmess_lead_pipeline_stages())) {
        return;
    }

    hotmess_ensure_lead_tables();
    db()->prepare('UPDATE platform_leads SET pipeline_stage = ?, updated_at = NOW() WHERE id = ?')->execute([$stage, $leadId]);
    hotmess_add_lead_timeline($leadId, 'status_change', 'Pipeline aktualisiert', 'Lead wurde auf "' . hotmess_lead_pipeline_stages()[$stage] . '" gesetzt.', $adminId);

    if ($stage === 'won') {
        db()->prepare('UPDATE platform_lead_revenue_links SET status = "won" WHERE lead_id = ? AND status IN ("potential", "quoted")')->execute([$leadId]);
        hotmess_add_lead_timeline($leadId, 'revenue', 'Revenue Link gewonnen', 'Der Lead ist als gewonnene Umsatzchance markiert.', $adminId);
    }
}

function hotmess_update_lead_task_status(int $taskId, string $status, ?int $adminId = null): void
{
    if (!in_array($status, ['open', 'in_progress', 'done', 'archived'], true)) {
        return;
    }

    hotmess_ensure_lead_tables();
    $stmt = db()->prepare('SELECT lead_id, title FROM platform_lead_tasks WHERE id = ? LIMIT 1');
    $stmt->execute([$taskId]);
    $task = $stmt->fetch();
    if (!$task) {
        return;
    }

    db()->prepare('UPDATE platform_lead_tasks SET status = ?, updated_at = NOW() WHERE id = ?')->execute([$status, $taskId]);
    hotmess_add_lead_timeline((int) $task['lead_id'], 'task', 'Task aktualisiert', (string) $task['title'] . ' -> ' . $status, $adminId);
}

function hotmess_lead_rows(): array
{
    hotmess_ensure_lead_tables();
    $rows = db()->query(
        'SELECT leads.*,
          COALESCE(SUM(CASE WHEN revenue.status IN ("potential", "quoted", "won") THEN revenue.amount ELSE 0 END), 0) AS revenue_amount,
          COUNT(tasks.id) AS task_count,
          SUM(CASE WHEN tasks.status IN ("open", "in_progress") THEN 1 ELSE 0 END) AS open_task_count
         FROM platform_leads leads
         LEFT JOIN platform_lead_revenue_links revenue ON revenue.lead_id = leads.id
         LEFT JOIN platform_lead_tasks tasks ON tasks.lead_id = leads.id
         GROUP BY leads.id
         ORDER BY leads.created_at DESC
         LIMIT 120'
    )->fetchAll();

    return array_map(static function (array $row): array {
        return [
            'id' => (int) $row['id'],
            'inquiryId' => $row['inquiry_id'] !== null ? (int) $row['inquiry_id'] : null,
            'source' => (string) $row['source'],
            'category' => (string) $row['category'],
            'status' => (string) $row['status'],
            'pipelineStage' => (string) $row['pipeline_stage'],
            'priority' => (string) $row['priority'],
            'assignedTo' => (string) $row['assigned_to'],
            'title' => (string) $row['title'],
            'contactName' => (string) $row['contact_name'],
            'contactEmail' => (string) $row['contact_email'],
            'contactPhone' => (string) ($row['contact_phone'] ?? ''),
            'city' => (string) ($row['city'] ?? ''),
            'sourceId' => (string) ($row['source_id'] ?? ''),
            'potentialRevenue' => (float) $row['potential_revenue'],
            'revenueAmount' => (float) $row['revenue_amount'],
            'currency' => (string) $row['currency'],
            'userMembershipTier' => (string) ($row['user_membership_tier'] ?? ''),
            'metadata' => json_decode((string) ($row['metadata'] ?? '{}'), true) ?: [],
            'taskCount' => (int) $row['task_count'],
            'openTaskCount' => (int) $row['open_task_count'],
            'createdAt' => (string) $row['created_at'],
            'updatedAt' => (string) $row['updated_at'],
        ];
    }, $rows);
}

function hotmess_mock_leads(): array
{
    return [
        ['id' => 1001, 'inquiryId' => null, 'source' => 'package', 'category' => 'package', 'status' => 'consulting', 'pipelineStage' => 'qualified', 'priority' => 'medium', 'assignedTo' => 'Weekend Concierge', 'title' => 'Signature Weekend Adriatic', 'contactName' => 'Sofia K.', 'contactEmail' => 'sofia@example.com', 'contactPhone' => '+43 660 000 000', 'city' => 'Dubrovnik', 'sourceId' => 'signature-weekend-adriatic', 'potentialRevenue' => 1290, 'revenueAmount' => 1290, 'currency' => 'EUR', 'userMembershipTier' => 'Free Passport', 'metadata' => ['numberOfGuests' => '2'], 'taskCount' => 2, 'openTaskCount' => 1, 'createdAt' => '2026-06-03 11:20:00', 'updatedAt' => '2026-06-04 09:15:00'],
        ['id' => 1002, 'inquiryId' => null, 'source' => 'vip', 'category' => 'vip', 'status' => 'review', 'pipelineStage' => 'contacted', 'priority' => 'high', 'assignedTo' => 'VIP Desk', 'title' => 'VIP Table Innsbruck', 'contactName' => 'Amelie Noir', 'contactEmail' => 'amelie@example.com', 'contactPhone' => '+43 650 111 111', 'city' => 'Innsbruck', 'sourceId' => 'innsbruck-private-weekend', 'potentialRevenue' => 3800, 'revenueAmount' => 3800, 'currency' => 'EUR', 'userMembershipTier' => 'Passport Black', 'metadata' => ['budgetRange' => '2500-5000'], 'taskCount' => 1, 'openTaskCount' => 1, 'createdAt' => '2026-06-04 16:05:00', 'updatedAt' => '2026-06-04 17:00:00'],
        ['id' => 1003, 'inquiryId' => null, 'source' => 'partner', 'category' => 'partner', 'status' => 'first_call', 'pipelineStage' => 'negotiation', 'priority' => 'high', 'assignedTo' => 'Partner Lead', 'title' => 'Fashion Partner Placement', 'contactName' => 'Luca Brand', 'contactEmail' => 'luca@example.com', 'contactPhone' => '+39 02 000 000', 'city' => 'Milan', 'sourceId' => 'partner-fashion', 'potentialRevenue' => 2500, 'revenueAmount' => 2500, 'currency' => 'EUR', 'userMembershipTier' => '', 'metadata' => ['category' => 'Fashion / Shops'], 'taskCount' => 3, 'openTaskCount' => 2, 'createdAt' => '2026-06-05 10:45:00', 'updatedAt' => '2026-06-05 12:10:00'],
    ];
}

function hotmess_leads(): array
{
    try {
        $rows = hotmess_lead_rows();
        if ($rows) {
            return $rows;
        }
    } catch (Throwable) {
        // Fall back to curated mock operations when database setup is unavailable.
    }

    return hotmess_mock_leads();
}

function hotmess_lead_tasks(): array
{
    try {
        hotmess_ensure_lead_tables();
        $rows = db()->query(
            'SELECT tasks.*, leads.title AS lead_title, leads.category, leads.contact_name
             FROM platform_lead_tasks tasks
             JOIN platform_leads leads ON leads.id = tasks.lead_id
             ORDER BY FIELD(tasks.status, "open", "in_progress", "done", "archived"), tasks.due_date ASC, tasks.created_at DESC
             LIMIT 120'
        )->fetchAll();

        if ($rows) {
            return array_map(static fn (array $row): array => [
                'id' => (int) $row['id'],
                'leadId' => (int) $row['lead_id'],
                'leadTitle' => (string) $row['lead_title'],
                'category' => (string) $row['category'],
                'contactName' => (string) $row['contact_name'],
                'title' => (string) $row['title'],
                'description' => (string) ($row['description'] ?? ''),
                'assignedTo' => (string) $row['assigned_to'],
                'dueDate' => (string) ($row['due_date'] ?? ''),
                'priority' => (string) $row['priority'],
                'status' => (string) $row['status'],
                'createdAt' => (string) $row['created_at'],
            ], $rows);
        }
    } catch (Throwable) {
        // Mock fallback.
    }

    return [
        ['id' => 2001, 'leadId' => 1001, 'leadTitle' => 'Signature Weekend Adriatic', 'category' => 'package', 'contactName' => 'Sofia K.', 'title' => 'Package Beratung starten', 'description' => 'Reisedaten pruefen und Weekend-Angebot vorbereiten.', 'assignedTo' => 'Weekend Concierge', 'dueDate' => '2026-06-10', 'priority' => 'medium', 'status' => 'open', 'createdAt' => '2026-06-03'],
        ['id' => 2002, 'leadId' => 1002, 'leadTitle' => 'VIP Table Innsbruck', 'category' => 'vip', 'contactName' => 'Amelie Noir', 'title' => 'VIP Angebot senden', 'description' => 'Table Budget und Wunschbereich klaeren.', 'assignedTo' => 'VIP Desk', 'dueDate' => '2026-06-09', 'priority' => 'high', 'status' => 'in_progress', 'createdAt' => '2026-06-04'],
        ['id' => 2003, 'leadId' => 1003, 'leadTitle' => 'Fashion Partner Placement', 'category' => 'partner', 'contactName' => 'Luca Brand', 'title' => 'Partner kontaktieren', 'description' => 'Erstgespraech und Placement-Deck vorbereiten.', 'assignedTo' => 'Partner Lead', 'dueDate' => '2026-06-11', 'priority' => 'high', 'status' => 'open', 'createdAt' => '2026-06-05'],
    ];
}

function hotmess_pipeline_board(): array
{
    $board = [];
    foreach (hotmess_lead_pipeline_stages() as $stage => $label) {
        $board[$stage] = ['label' => $label, 'leads' => []];
    }

    foreach (hotmess_leads() as $lead) {
        $stage = (string) ($lead['pipelineStage'] ?? 'new');
        if (!isset($board[$stage])) {
            $stage = 'new';
        }
        $board[$stage]['leads'][] = $lead;
    }

    return $board;
}

function hotmess_lead_kpis(): array
{
    $leads = hotmess_leads();
    $openStages = ['new', 'contacted', 'qualified', 'offer_sent', 'negotiation'];
    $won = count(array_filter($leads, static fn (array $lead): bool => (string) $lead['pipelineStage'] === 'won'));
    $lost = count(array_filter($leads, static fn (array $lead): bool => (string) $lead['pipelineStage'] === 'lost'));
    $total = max(1, count($leads));

    return [
        'newLeads' => count(array_filter($leads, static fn (array $lead): bool => (string) $lead['pipelineStage'] === 'new')),
        'openLeads' => count(array_filter($leads, static fn (array $lead): bool => in_array((string) $lead['pipelineStage'], $openStages, true))),
        'hotelLeads' => count(array_filter($leads, static fn (array $lead): bool => (string) $lead['category'] === 'hotel')),
        'packageLeads' => count(array_filter($leads, static fn (array $lead): bool => (string) $lead['category'] === 'package')),
        'partnerLeads' => count(array_filter($leads, static fn (array $lead): bool => (string) $lead['category'] === 'partner')),
        'vipLeads' => count(array_filter($leads, static fn (array $lead): bool => (string) $lead['category'] === 'vip')),
        'conversionRate' => round(($won / max(1, $won + $lost + count($leads))) * 100, 1),
        'revenuePotential' => array_sum(array_map(static fn (array $lead): float => (float) ($lead['potentialRevenue'] ?? 0), $leads)),
        'totalLeads' => $total,
    ];
}

function hotmess_lead_timeline(?int $leadId = null): array
{
    try {
        hotmess_ensure_lead_tables();
        $sql = 'SELECT * FROM platform_lead_timeline';
        $params = [];
        if ($leadId !== null) {
            $sql .= ' WHERE lead_id = ?';
            $params[] = $leadId;
        }
        $sql .= ' ORDER BY created_at DESC LIMIT 120';
        $stmt = db()->prepare($sql);
        $stmt->execute($params);

        return array_map(static fn (array $row): array => [
            'id' => (int) $row['id'],
            'leadId' => (int) $row['lead_id'],
            'activityType' => (string) $row['activity_type'],
            'title' => (string) $row['title'],
            'body' => (string) ($row['body'] ?? ''),
            'createdAt' => (string) $row['created_at'],
        ], $stmt->fetchAll());
    } catch (Throwable) {
        return [];
    }
}
