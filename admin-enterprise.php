<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/layout.php';
require_once __DIR__ . '/app/concierge-data.php';
require_once __DIR__ . '/app/production-data.php';
require_once __DIR__ . '/app/city-ops-data.php';
require_once __DIR__ . '/app/platform-os-data.php';
require_once __DIR__ . '/app/operations-data.php';

$admin = require_admin();
$page = (string) ($_GET['page'] ?? 'system');

$titles = [
    'concierge' => ['Concierge Control', 'Recommendation logic, prompt templates and AI provider readiness.'],
    'security' => ['Security Center', 'Roles, access control, API protection, forms, CSRF and rate-limit readiness.'],
    'system' => ['System Dashboard', 'Environment status, integration mode, deployments, errors and open tasks.'],
    'audit-log' => ['Audit Log', 'Prepared operational audit trail for security and compliance.'],
    'operators' => ['City Operator Portal', 'Operator roles, city KPIs, tasks, leads and partner pipeline.'],
    'expansion' => ['Expansion Center', 'Expansion markets, launch phases and city readiness.'],
    'city-performance' => ['City Performance', 'City Index, growth, community, partner, revenue and experience scores.'],
    'platform' => ['Platform Dashboard', 'Executive platform view across revenue, cities, operators and business units.'],
    'business-units' => ['Business Units', 'KPIs, owners, goals and reports by business unit.'],
    'ventures' => ['Ventures', 'Prepared architecture for future retreats, products, festivals and media formats.'],
    'brand-management' => ['Brand Management', 'Brand assets, content guidelines, partner guidelines and city standards.'],
    'operations' => ['Operations Center', 'Daily command center for events, inquiries, memberships, partners and system notes.'],
    'tasks' => ['Task Management', 'Operational tasks across events, hotels, partners, community, membership and launch.'],
    'onboarding' => ['Onboarding Center', 'Partner, hotel and member onboarding workflows.'],
    'support' => ['Support Center', 'Support tickets, concierge requests, membership, partner and hotel questions.'],
    'launch' => ['Launch Center', 'Launch checklist and HotMess Launch Score.'],
];
$title = $titles[$page] ?? $titles['system'];

function admin_metric_cards(array $items): void
{
    ?><div class="admin-kpi-grid"><?php foreach ($items as $label => $value): ?><article><span><?= e((string) $label) ?></span><strong><?= e((string) $value) ?></strong><p>Prepared operating metric</p></article><?php endforeach; ?></div><?php
}

render_header($title[0]);
?>

<main class="admin-page enterprise-admin-page">
  <section class="dashboard-hero">
    <p class="eyebrow">Admin / Enterprise OS</p>
    <h1><?= e($title[0]) ?></h1>
    <p><?= e($title[1]) ?></p>
    <div class="admin-tab-nav">
      <a href="/admin/concierge">Concierge</a><a href="/admin/security">Security</a><a href="/admin/system">System</a><a href="/admin/audit-log">Audit</a>
      <a href="/admin/operators">Operators</a><a href="/admin/expansion">Expansion</a><a href="/admin/city-performance">City Performance</a>
      <a href="/admin/platform">Platform</a><a href="/admin/business-units">Business Units</a><a href="/admin/ventures">Ventures</a><a href="/admin/brand-management">Brand</a>
      <a href="/admin/operations">Operations</a><a href="/admin/tasks">Tasks</a><a href="/admin/onboarding">Onboarding</a><a href="/admin/support">Support</a><a href="/admin/launch">Launch</a>
    </div>
  </section>

  <?php if ($page === 'concierge'): ?>
    <?php $recs = hotmess_concierge_recommendations($admin); ?>
    <section class="platform-section"><div class="section-heading platform-heading"><p class="eyebrow">AI Ready</p><h2>Recommendation priorities and prompts.</h2></div>
      <div class="event-admin-grid"><?php foreach (hotmess_prompt_templates() as $prompt): ?><article class="premium-card"><span><?= e($prompt['category']) ?> / <?= $prompt['active'] ? 'active' : 'inactive' ?></span><h3><?= e($prompt['title']) ?></h3><p><?= e($prompt['content']) ?></p></article><?php endforeach; ?></div>
      <div class="revenue-report-grid"><?php foreach ($recs as $group => $items): ?><article class="premium-card"><span><?= e($group) ?></span><h3>Featured <?= e($group) ?></h3><div class="account-mini-list"><?php foreach (array_slice($items, 0, 3) as $item): ?><a href="<?= e($item['href']) ?>"><strong><?= e($item['title']) ?></strong><span>Score <?= e((string) $item['score']) ?> / <?= e($item['description']) ?></span></a><?php endforeach; ?></div></article><?php endforeach; ?></div>
    </section>
  <?php elseif ($page === 'security'): ?>
    <section class="platform-section"><div class="event-admin-grid"><?php foreach (hotmess_security_checks() as $check): ?><article class="premium-card"><span><?= e($check['status']) ?></span><h3><?= e($check['area']) ?></h3><p><?= e($check['detail']) ?></p></article><?php endforeach; ?></div></section>
  <?php elseif ($page === 'system'): ?>
    <?php $status = hotmess_system_status(); admin_metric_cards(['Mode' => $status['mode'], 'Environment' => $status['environment'], 'Open tasks' => count($status['tasks']), 'Integrations' => count($status['integrations'])]); ?>
    <section class="platform-section"><div class="event-admin-grid"><?php foreach ($status['integrations'] as $integration): ?><article class="premium-card"><span><?= e($integration['status']) ?></span><h3><?= e($integration['name']) ?></h3><p>Production integration status.</p></article><?php endforeach; ?></div></section>
  <?php elseif ($page === 'audit-log'): ?>
    <section class="platform-section"><div class="table-wrap"><table class="admin-lux-table"><thead><tr><th>Action</th><th>Entity</th><th>User</th><th>Details</th><th>Created</th></tr></thead><tbody><?php foreach (hotmess_audit_logs() as $log): ?><tr><td><?= e($log['action']) ?></td><td><?= e($log['entityType']) ?> / <?= e($log['entityId']) ?></td><td><?= e($log['userId']) ?></td><td><?= e($log['details']) ?></td><td><?= e($log['createdAt']) ?></td></tr><?php endforeach; ?></tbody></table></div></section>
  <?php elseif (in_array($page, ['operators', 'expansion', 'city-performance'], true)): ?>
    <?php admin_metric_cards(['Operators' => count(hotmess_city_operators()), 'Markets' => count(hotmess_expansion_markets()), 'Active cities' => count(hotmess_city_performance()), 'First expansion' => 'Berlin']); ?>
    <section class="platform-section"><div class="revenue-report-grid"><?php foreach (hotmess_city_performance() as $city): $index = (int) round(($city['growthScore'] + $city['communityScore'] + $city['partnerScore'] + $city['revenueScore'] + $city['experienceScore']) / 5); ?><article class="premium-card"><span>HotMess City Index <?= e((string) $index) ?></span><h3><?= e($city['city']) ?></h3><p><?= e((string) $city['members']) ?> members / <?= e((string) $city['revenue']) ?> EUR revenue / <?= e((string) $city['partners']) ?> partners</p></article><?php endforeach; ?></div></section>
    <section class="platform-section"><div class="table-wrap"><table class="admin-lux-table"><thead><tr><th>Market</th><th>Priority</th><th>Potential</th><th>Competition</th><th>Status</th></tr></thead><tbody><?php foreach (hotmess_expansion_markets() as $market): ?><tr><td><?= e($market['city']) ?> / <?= e($market['country']) ?></td><td><?= e($market['priority']) ?></td><td><?= e((string) $market['marketPotential']) ?></td><td><?= e($market['competitionLevel']) ?></td><td><?= e($market['status']) ?></td></tr><?php endforeach; ?></tbody></table></div></section>
  <?php elseif (in_array($page, ['platform', 'business-units', 'ventures', 'brand-management'], true)): ?>
    <?php admin_metric_cards(array_column(hotmess_platform_metrics(), 'value', 'category')); ?>
    <section class="platform-section"><div class="event-admin-grid"><?php foreach (hotmess_business_units() as $unit): ?><article class="premium-card"><span><?= e($unit['status']) ?> / <?= e($unit['ownerId']) ?></span><h3><?= e($unit['name']) ?></h3><p><?= e($unit['description']) ?></p><strong><?= e((string) $unit['revenue']) ?> EUR / <?= e($unit['growth']) ?></strong></article><?php endforeach; ?></div></section>
    <section class="platform-section"><div class="revenue-report-grid"><?php foreach (hotmess_platform_goals() as $goal): ?><article class="premium-card"><span><?= e((string) $goal['currentValue']) ?> / <?= e((string) $goal['targetValue']) ?></span><h3><?= e($goal['title']) ?></h3><p><?= e($goal['description']) ?> / due <?= e($goal['dueDate']) ?></p></article><?php endforeach; ?></div></section>
  <?php elseif (in_array($page, ['operations', 'tasks', 'onboarding', 'support', 'launch'], true)): ?>
    <?php admin_metric_cards(array_merge(hotmess_operations_summary(), ['Launch Score' => hotmess_launch_score()])); ?>
    <?php if ($page === 'tasks' || $page === 'operations'): ?><section class="platform-section"><div class="table-wrap"><table class="admin-lux-table"><thead><tr><th>Task</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due</th></tr></thead><tbody><?php foreach (hotmess_tasks() as $task): ?><tr><td><strong><?= e($task['title']) ?></strong><span><?= e($task['description']) ?></span></td><td><?= e($task['assigneeId']) ?></td><td><?= e($task['priority']) ?></td><td><?= e($task['status']) ?></td><td><?= e($task['dueDate']) ?></td></tr><?php endforeach; ?></tbody></table></div></section><?php endif; ?>
    <?php if ($page === 'onboarding'): ?><section class="platform-section"><div class="event-admin-grid"><?php foreach (hotmess_onboarding_flows() as $name => $steps): ?><article class="premium-card"><span><?= e($name) ?></span><h3><?= e(ucfirst($name)) ?> onboarding</h3><ul class="luxury-list"><?php foreach ($steps as $step): ?><li><?= e($step) ?></li><?php endforeach; ?></ul></article><?php endforeach; ?></div></section><?php endif; ?>
    <?php if ($page === 'support'): ?><section class="platform-section"><div class="event-admin-grid"><?php foreach (hotmess_support_tickets() as $ticket): ?><article class="premium-card"><span><?= e($ticket['priority']) ?> / <?= e($ticket['status']) ?></span><h3><?= e($ticket['category']) ?></h3><p><?= e(implode(' / ', $ticket['messages'])) ?></p><strong><?= e($ticket['assignedTo']) ?></strong></article><?php endforeach; ?></div></section><?php endif; ?>
    <?php if ($page === 'launch'): ?><section class="platform-section"><div class="event-admin-grid"><?php foreach (hotmess_launch_checklist_items() as $item): ?><article class="premium-card"><span><?= e($item['status']) ?></span><h3><?= e($item['category']) ?> / <?= e($item['title']) ?></h3><p>Owner <?= e($item['ownerId']) ?> / due <?= e($item['dueDate']) ?></p></article><?php endforeach; ?></div></section><?php endif; ?>
  <?php endif; ?>
</main>

<?php render_footer(); ?>
