<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';

require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/admin');
}

verify_csrf();

$mode = (string) ($_POST['mode'] ?? 'admin');

if ($mode === 'customer') {
    $_SESSION['admin_view_mode'] = 'customer';
    unset($_SESSION['admin_view_as_customer']);
    flash('Kundensicht aktiviert. Du bleibst weiterhin als Admin angemeldet.');
} elseif ($mode === 'sales') {
    $_SESSION['admin_view_mode'] = 'sales';
    unset($_SESSION['admin_view_as_customer']);
    flash('Vertriebsansicht aktiviert. Du bleibst weiterhin als Admin angemeldet.');
} else {
    unset($_SESSION['admin_view_mode']);
    unset($_SESSION['admin_view_as_customer']);
    flash('Admin-Ansicht aktiviert.');
}

$returnTo = (string) ($_POST['return_to'] ?? '/');

if ($mode === 'sales') {
    $returnTo = '/admin-sales.php';
}

if ($returnTo === '' || !str_starts_with($returnTo, '/') || str_starts_with($returnTo, '//')) {
    $returnTo = '/';
}

redirect($returnTo);
