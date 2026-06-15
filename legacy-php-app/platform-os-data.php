<?php

declare(strict_types=1);

function hotmess_business_units(): array
{
    return [
        ['id' => 'bu-events', 'name' => 'HotMess Events', 'slug' => 'events', 'description' => 'Core curated event experience.', 'ownerId' => 'founder', 'status' => 'active', 'revenue' => 18420, 'users' => 1840, 'growth' => '+18%', 'projects' => 4],
        ['id' => 'bu-travel', 'name' => 'HotMess Travel', 'slug' => 'travel', 'description' => 'Hotels, travel guidance and city stays.', 'ownerId' => 'travel-lead', 'status' => 'prepared', 'revenue' => 6420, 'users' => 430, 'growth' => '+12%', 'projects' => 3],
        ['id' => 'bu-membership', 'name' => 'HotMess Membership', 'slug' => 'membership', 'description' => 'Passport Free, Plus and Black.', 'ownerId' => 'membership-lead', 'status' => 'active', 'revenue' => 11960, 'users' => 920, 'growth' => '+22%', 'projects' => 5],
        ['id' => 'bu-concierge', 'name' => 'HotMess Concierge', 'slug' => 'concierge', 'description' => 'AI-ready personal advisory layer.', 'ownerId' => 'concierge-lead', 'status' => 'prepared', 'revenue' => 5100, 'users' => 260, 'growth' => '+9%', 'projects' => 2],
        ['id' => 'bu-experiences', 'name' => 'HotMess Experiences', 'slug' => 'experiences', 'description' => 'Retreats, dinners and private formats.', 'ownerId' => 'ventures', 'status' => 'planned', 'revenue' => 0, 'users' => 0, 'growth' => '0%', 'projects' => 1],
        ['id' => 'bu-ventures', 'name' => 'HotMess Ventures', 'slug' => 'ventures', 'description' => 'Future products, festivals and media formats.', 'ownerId' => 'founder', 'status' => 'planned', 'revenue' => 0, 'users' => 0, 'growth' => '0%', 'projects' => 4],
        ['id' => 'bu-partnerships', 'name' => 'HotMess Partnerships', 'slug' => 'partnerships', 'description' => 'Sponsors, partner offers and placements.', 'ownerId' => 'partner-lead', 'status' => 'active', 'revenue' => 18320, 'users' => 0, 'growth' => '+16%', 'projects' => 6],
        ['id' => 'bu-media', 'name' => 'HotMess Media', 'slug' => 'media', 'description' => 'Gallery, aftermovies and campaign archive.', 'ownerId' => 'media-lead', 'status' => 'prepared', 'revenue' => 0, 'users' => 0, 'growth' => '+4%', 'projects' => 3],
    ];
}

function hotmess_platform_metrics(): array
{
    return [
        ['category' => 'Revenue', 'value' => '126.450 EUR', 'period' => 'Q2 2026'],
        ['category' => 'Members', 'value' => '1.840', 'period' => 'Current'],
        ['category' => 'Cities', 'value' => '4 active / 5 prepared', 'period' => 'Current'],
        ['category' => 'Operators', 'value' => '3 prepared', 'period' => 'Current'],
        ['category' => 'Business Units', 'value' => '8', 'period' => 'Current'],
        ['category' => 'Platform Growth', 'value' => '+18%', 'period' => '30 days'],
    ];
}

function hotmess_platform_goals(): array
{
    return [
        ['id' => 'goal-city', 'title' => 'Launch 3 operator cities', 'description' => 'Vienna, Munich and Zurich operator model.', 'targetValue' => 3, 'currentValue' => 1, 'dueDate' => '2026-12-31'],
        ['id' => 'goal-membership', 'title' => 'Reach 500 Plus/Black members', 'description' => 'Membership-led repeat revenue.', 'targetValue' => 500, 'currentValue' => 392, 'dueDate' => '2026-10-31'],
        ['id' => 'goal-partners', 'title' => 'Activate 25 premium partners', 'description' => 'Hotels, bars, restaurants, fashion and travel.', 'targetValue' => 25, 'currentValue' => 14, 'dueDate' => '2026-09-30'],
    ];
}

function hotmess_platform_initiatives(): array
{
    return [
        ['title' => 'Concierge AI rollout', 'unit' => 'Concierge', 'status' => 'prepared', 'owner' => 'Concierge Lead'],
        ['title' => 'Operator Network', 'unit' => 'Platform', 'status' => 'prepared', 'owner' => 'Founder'],
        ['title' => 'Sponsor Reporting', 'unit' => 'Partnerships', 'status' => 'active', 'owner' => 'Partner Lead'],
        ['title' => 'City Launch Playbook', 'unit' => 'Expansion', 'status' => 'active', 'owner' => 'City Ops'],
    ];
}
