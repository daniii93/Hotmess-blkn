CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  first_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  username VARCHAR(80) NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  birthdate DATE NULL,
  birth_date DATE NULL,
  phone VARCHAR(60) NULL,
  street VARCHAR(190) NULL,
  house_number VARCHAR(40) NULL,
  postal_code VARCHAR(30) NULL,
  country VARCHAR(80) NULL,
  avatar_url VARCHAR(255) NULL,
  bio TEXT NULL,
  city VARCHAR(120) NOT NULL,
  instagram_handle VARCHAR(120) NOT NULL,
  profile_photo VARCHAR(255) NULL,
  last_seen_at DATETIME NULL,
  email_verified_at DATETIME NULL,
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  phone_verified_at DATETIME NULL,
  instagram_follow_confirmed TINYINT(1) NOT NULL DEFAULT 0,
  role ENUM('member', 'admin') NOT NULL DEFAULT 'member',
  status ENUM('waitlist', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  safety_status ENUM('clear', 'warned', 'restricted', 'suspended', 'banned') NOT NULL DEFAULT 'clear',
  chat_status ENUM('active', 'read_only', 'blocked', 'suspended') NOT NULL DEFAULT 'active',
  suspended_until DATETIME NULL,
  warning_count INT UNSIGNED NOT NULL DEFAULT 0,
  last_warning_at DATETIME NULL,
  banned_at DATETIME NULL,
  ban_reason TEXT NULL,
  moderation_notes TEXT NULL,
  admin_note TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS waitlist_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  event_name VARCHAR(160) NOT NULL DEFAULT 'HOTMESS BLKN Innsbruck',
  friends_count VARCHAR(40) NOT NULL,
  motivation TEXT NULL,
  status ENUM('waitlist', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT waitlist_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS status_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  admin_id INT UNSIGNED NULL,
  old_status VARCHAR(40) NOT NULL,
  new_status VARCHAR(40) NOT NULL,
  action_type ENUM('single', 'bulk') NOT NULL DEFAULT 'single',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT status_logs_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT status_logs_admin_fk FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX status_logs_user_idx (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS conversations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type ENUM('member', 'organizer') NOT NULL DEFAULT 'member',
  retention ENUM('24h', 'close', '1y') NOT NULL DEFAULT '24h',
  title VARCHAR(160) NULL,
  image_path VARCHAR(255) NULL,
  created_by INT UNSIGNED NOT NULL,
  closed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT conversations_creator_fk FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX conversations_type_idx (type, created_at)
);

CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  archived_at DATETIME NULL,
  deleted_at DATETIME NULL,
  last_read_at DATETIME NULL,
  role ENUM('member', 'ambassador', 'concierge', 'partner') NOT NULL DEFAULT 'member',
  unread_count INT UNSIGNED NOT NULL DEFAULT 0,
  pinned TINYINT(1) NOT NULL DEFAULT 0,
  muted TINYINT(1) NOT NULL DEFAULT 0,
  blocked TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (conversation_id, user_id),
  CONSTRAINT participants_conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT participants_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX participants_user_state_idx (user_id, pinned, muted, archived_at, deleted_at)
);

CREATE TABLE IF NOT EXISTS messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT UNSIGNED NOT NULL,
  sender_id INT UNSIGNED NOT NULL,
  reply_to_message_id INT UNSIGNED NULL,
  body TEXT NULL,
  message_type ENUM('text', 'image', 'video', 'audio', 'file', 'system') NOT NULL DEFAULT 'text',
  media_path VARCHAR(255) NULL,
  file_size INT UNSIGNED NULL,
  mime_type VARCHAR(120) NULL,
  media_visibility ENUM('keep', 'once', 'replay') NOT NULL DEFAULT 'keep',
  message_status ENUM('sent', 'delivered', 'seen') NOT NULL DEFAULT 'sent',
  expires_at DATETIME NULL,
  saved_at DATETIME NULL,
  edited_at DATETIME NULL,
  scheduled_at DATETIME NULL,
  delivered_at DATETIME NULL,
  seen_at DATETIME NULL,
  deleted_for_all_at DATETIME NULL,
  deleted_for_all_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  CONSTRAINT messages_conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT messages_sender_fk FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT messages_reply_fk FOREIGN KEY (reply_to_message_id) REFERENCES messages(id) ON DELETE SET NULL,
  CONSTRAINT messages_deleted_by_fk FOREIGN KEY (deleted_for_all_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX messages_conversation_idx (conversation_id, created_at),
  INDEX messages_expiry_idx (expires_at, deleted_at),
  INDEX messages_schedule_idx (scheduled_at, deleted_at)
);

CREATE TABLE IF NOT EXISTS chat_screenshot_events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  message_id INT UNSIGNED NULL,
  content_id VARCHAR(120) NOT NULL,
  client_event_id VARCHAR(120) NOT NULL,
  captured_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT screenshot_events_conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT screenshot_events_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT screenshot_events_message_fk FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL,
  UNIQUE KEY screenshot_events_client_unique (client_event_id),
  UNIQUE KEY screenshot_events_dedupe_unique (conversation_id, user_id, content_id, captured_at),
  INDEX screenshot_events_chat_idx (conversation_id, created_at)
);

CREATE TABLE IF NOT EXISTS chat_realtime_events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT UNSIGNED NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  payload JSON NOT NULL,
  delivered_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT realtime_events_conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  INDEX realtime_events_pending_idx (conversation_id, delivered_at, created_at)
);

CREATE TABLE IF NOT EXISTS chat_reports (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT UNSIGNED NOT NULL,
  reported_user_id INT UNSIGNED NULL,
  chat_id INT UNSIGNED NOT NULL,
  reason ENUM('harassment', 'insult', 'spam', 'threat', 'fake_profile', 'inappropriate_content', 'other') NOT NULL DEFAULT 'other',
  description TEXT NULL,
  status ENUM('new', 'in_review', 'resolved', 'dismissed') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_by INT UNSIGNED NULL,
  reviewed_at DATETIME NULL,
  resolution_note TEXT NULL,
  CONSTRAINT chat_reports_reporter_fk FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chat_reports_reported_user_fk FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chat_reports_chat_fk FOREIGN KEY (chat_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT chat_reports_reviewed_by_fk FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX chat_reports_status_idx (status, created_at)
);

CREATE TABLE IF NOT EXISTS chat_report_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_id INT UNSIGNED NOT NULL,
  message_id INT UNSIGNED NULL,
  message_snapshot TEXT NULL,
  media_snapshot_url VARCHAR(255) NULL,
  sender_id INT UNSIGNED NULL,
  sent_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chat_report_messages_report_fk FOREIGN KEY (report_id) REFERENCES chat_reports(id) ON DELETE CASCADE,
  CONSTRAINT chat_report_messages_message_fk FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE SET NULL,
  CONSTRAINT chat_report_messages_sender_fk FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX chat_report_messages_report_idx (report_id, sent_at)
);

CREATE TABLE IF NOT EXISTS chat_admin_audit_log (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  action VARCHAR(120) NOT NULL,
  report_id INT UNSIGNED NULL,
  chat_id INT UNSIGNED NULL,
  target_user_id INT UNSIGNED NULL,
  reason TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chat_admin_audit_admin_fk FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chat_admin_audit_report_fk FOREIGN KEY (report_id) REFERENCES chat_reports(id) ON DELETE SET NULL,
  CONSTRAINT chat_admin_audit_chat_fk FOREIGN KEY (chat_id) REFERENCES conversations(id) ON DELETE SET NULL,
  CONSTRAINT chat_admin_audit_target_fk FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX chat_admin_audit_report_idx (report_id, created_at)
);

CREATE TABLE IF NOT EXISTS user_moderation_actions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  admin_id INT UNSIGNED NULL,
  report_id INT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  reason TEXT NULL,
  previous_status JSON NULL,
  new_status JSON NULL,
  expires_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_moderation_actions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT user_moderation_actions_admin_fk FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX user_moderation_actions_user_idx (user_id, created_at),
  INDEX user_moderation_actions_action_idx (action, created_at)
);

CREATE TABLE IF NOT EXISTS user_safety_notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type VARCHAR(80) NOT NULL,
  title VARCHAR(190) NOT NULL,
  body TEXT NOT NULL,
  read_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_safety_notifications_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX user_safety_notifications_user_idx (user_id, read_at, created_at)
);

CREATE TABLE IF NOT EXISTS chat_message_reactions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  message_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  emoji VARCHAR(16) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY chat_message_reactions_unique (message_id, user_id),
  CONSTRAINT chat_message_reactions_message_fk FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  CONSTRAINT chat_message_reactions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS message_user_deletions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  message_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  deleted_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT message_user_deletions_message_fk FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  CONSTRAINT message_user_deletions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY message_user_deletions_unique (message_id, user_id),
  INDEX message_user_deletions_user_idx (user_id, deleted_at)
);

CREATE TABLE IF NOT EXISTS ticket_orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  event_id INT UNSIGNED NULL,
  partner_id INT UNSIGNED NULL,
  event_name VARCHAR(160) NOT NULL,
  ticket_type VARCHAR(120) NOT NULL,
  quantity INT UNSIGNED NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  payment_status ENUM('simulated_paid', 'pending', 'cancelled', 'refunded') NOT NULL DEFAULT 'simulated_paid',
  referral_code VARCHAR(80) NULL,
  referral_source VARCHAR(40) NULL,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  order_reference VARCHAR(40) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT ticket_orders_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX ticket_orders_user_idx (user_id, created_at),
  INDEX ticket_orders_event_idx (event_id, created_at),
  INDEX ticket_orders_partner_idx (partner_id, created_at),
  INDEX ticket_orders_status_idx (payment_status, created_at)
);

CREATE TABLE IF NOT EXISTS sales_events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  status ENUM('draft', 'active', 'ended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX sales_events_status_idx (status, start_date, end_date)
);

CREATE TABLE IF NOT EXISTS sales_partners (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  level TINYINT UNSIGNED NOT NULL DEFAULT 2,
  base_code VARCHAR(40) NOT NULL,
  status ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT sales_partners_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX sales_partners_status_idx (status, level)
);

CREATE TABLE IF NOT EXISTS event_partner_links (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  partner_id INT UNSIGNED NOT NULL,
  referral_code VARCHAR(80) NOT NULL UNIQUE,
  landing_slug VARCHAR(220) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT event_partner_links_event_fk FOREIGN KEY (event_id) REFERENCES sales_events(id) ON DELETE CASCADE,
  CONSTRAINT event_partner_links_partner_fk FOREIGN KEY (partner_id) REFERENCES sales_partners(id) ON DELETE CASCADE,
  UNIQUE KEY event_partner_unique (event_id, partner_id),
  INDEX event_partner_code_idx (referral_code)
);

CREATE TABLE IF NOT EXISTS sales_referrals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NULL,
  partner_id INT UNSIGNED NOT NULL,
  event_id INT UNSIGNED NOT NULL,
  referral_code VARCHAR(80) NULL,
  referral_source ENUM('link', 'code', 'landingpage', 'crm') NOT NULL DEFAULT 'link',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT sales_referrals_customer_fk FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT sales_referrals_partner_fk FOREIGN KEY (partner_id) REFERENCES sales_partners(id) ON DELETE CASCADE,
  CONSTRAINT sales_referrals_event_fk FOREIGN KEY (event_id) REFERENCES sales_events(id) ON DELETE CASCADE,
  INDEX sales_referrals_customer_event_idx (customer_id, event_id, created_at),
  INDEX sales_referrals_partner_event_idx (partner_id, event_id, created_at)
);

CREATE TABLE IF NOT EXISTS conversation_reads (
  conversation_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  last_read_at DATETIME NOT NULL,
  PRIMARY KEY (conversation_id, user_id),
  CONSTRAINT reads_conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT reads_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS profile_views (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  viewed_user_id INT UNSIGNED NOT NULL,
  viewer_user_id INT UNSIGNED NOT NULL,
  viewed_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT profile_views_viewed_fk FOREIGN KEY (viewed_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT profile_views_viewer_fk FOREIGN KEY (viewer_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX profile_views_viewed_idx (viewed_user_id, viewed_at),
  INDEX profile_views_viewer_idx (viewer_user_id),
  INDEX profile_views_viewed_at_idx (viewed_at)
);

CREATE TABLE IF NOT EXISTS profile_view_summary (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  viewed_user_id INT UNSIGNED NOT NULL,
  viewer_user_id INT UNSIGNED NOT NULL,
  first_viewed_at DATETIME NOT NULL,
  last_viewed_at DATETIME NOT NULL,
  total_views INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT profile_view_summary_viewed_fk FOREIGN KEY (viewed_user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT profile_view_summary_viewer_fk FOREIGN KEY (viewer_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY profile_view_summary_pair (viewed_user_id, viewer_user_id),
  INDEX profile_view_summary_viewed_last_idx (viewed_user_id, last_viewed_at),
  INDEX profile_view_summary_viewer_idx (viewer_user_id)
);

CREATE TABLE IF NOT EXISTS verification_codes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type ENUM('email', 'phone') NOT NULL,
  destination VARCHAR(190) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
  locked_until DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT verification_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX verification_lookup_idx (user_id, type, used_at, expires_at)
);

CREATE TABLE IF NOT EXISTS platform_events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(190) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  city VARCHAR(120) NOT NULL,
  venue VARCHAR(190) NOT NULL,
  address VARCHAR(255) NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NULL,
  doors_open VARCHAR(40) NULL,
  category VARCHAR(120) NOT NULL,
  short_description TEXT NULL,
  long_description MEDIUMTEXT NULL,
  hero_image VARCHAR(255) NULL,
  gallery_images JSON NULL,
  promo_video VARCHAR(255) NULL,
  dress_code VARCHAR(255) NULL,
  lineup JSON NULL,
  hosts JSON NULL,
  ticket_status ENUM('available', 'few_tickets', 'vip_available', 'passport_early_access', 'sold_out') NOT NULL DEFAULT 'available',
  ticket_provider VARCHAR(80) NULL,
  ticket_url VARCHAR(255) NULL,
  vip_available TINYINT(1) NOT NULL DEFAULT 0,
  vip_description TEXT NULL,
  table_service_available TINYINT(1) NOT NULL DEFAULT 0,
  hotel_ids JSON NULL,
  package_ids JSON NULL,
  partner_ids JSON NULL,
  sponsor_ids JSON NULL,
  membership_access VARCHAR(190) NULL,
  app_enabled TINYINT(1) NOT NULL DEFAULT 0,
  safety_notes JSON NULL,
  status ENUM('draft', 'published', 'sold_out', 'archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_events_status_idx (status, start_date),
  INDEX platform_events_city_idx (city, start_date),
  INDEX platform_events_category_idx (category, start_date)
);

CREATE TABLE IF NOT EXISTS platform_event_ticket_types (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  price_from DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  benefits JSON NULL,
  availability VARCHAR(120) NULL,
  requires_membership TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('available', 'few_tickets', 'vip_available', 'passport_early_access', 'request', 'sold_out') NOT NULL DEFAULT 'available',
  cta_label VARCHAR(120) NOT NULL DEFAULT 'Select ticket',
  external_url VARCHAR(255) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 100,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_event_ticket_event_fk FOREIGN KEY (event_id) REFERENCES platform_events(id) ON DELETE CASCADE,
  INDEX platform_event_ticket_event_idx (event_id, sort_order)
);

CREATE TABLE IF NOT EXISTS platform_event_timetable_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  item_time VARCHAR(40) NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 100,
  CONSTRAINT platform_event_timetable_event_fk FOREIGN KEY (event_id) REFERENCES platform_events(id) ON DELETE CASCADE,
  INDEX platform_event_timetable_event_idx (event_id, sort_order)
);

CREATE TABLE IF NOT EXISTS platform_event_faqs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 100,
  CONSTRAINT platform_event_faq_event_fk FOREIGN KEY (event_id) REFERENCES platform_events(id) ON DELETE CASCADE,
  INDEX platform_event_faq_event_idx (event_id, sort_order)
);

CREATE TABLE IF NOT EXISTS platform_event_partner_placements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id INT UNSIGNED NOT NULL,
  partner_id VARCHAR(120) NOT NULL,
  partner_name VARCHAR(190) NOT NULL,
  benefits TEXT NULL,
  visibility VARCHAR(190) NULL,
  logo_placement VARCHAR(190) NULL,
  event_page_placement VARCHAR(190) NULL,
  app_placement VARCHAR(190) NULL,
  discount_code VARCHAR(80) NULL,
  clicks INT UNSIGNED NOT NULL DEFAULT 0,
  leads INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_event_partner_event_fk FOREIGN KEY (event_id) REFERENCES platform_events(id) ON DELETE CASCADE,
  INDEX platform_event_partner_event_idx (event_id),
  INDEX platform_event_partner_partner_idx (partner_id)
);

CREATE TABLE IF NOT EXISTS platform_packages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(190) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  city VARCHAR(120) NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NULL,
  package_type ENUM('basic', 'travel', 'vip', 'signature') NOT NULL DEFAULT 'basic',
  short_description TEXT NULL,
  long_description MEDIUMTEXT NULL,
  hero_image VARCHAR(255) NULL,
  gallery_images JSON NULL,
  promo_video VARCHAR(255) NULL,
  price_from DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  availability_status ENUM('available', 'few_left', 'sold_out', 'request_only') NOT NULL DEFAULT 'available',
  included_items JSON NULL,
  excluded_items JSON NULL,
  event_ids JSON NULL,
  hotel_ids JSON NULL,
  partner_offer_ids JSON NULL,
  sponsor_ids JSON NULL,
  membership_benefits JSON NULL,
  vip_included TINYINT(1) NOT NULL DEFAULT 0,
  shuttle_included TINYINT(1) NOT NULL DEFAULT 0,
  welcome_bag_included TINYINT(1) NOT NULL DEFAULT 0,
  concierge_included TINYINT(1) NOT NULL DEFAULT 0,
  booking_url VARCHAR(255) NULL,
  inquiry_email VARCHAR(190) NULL,
  faq JSON NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_packages_status_idx (status, start_date),
  INDEX platform_packages_city_idx (city, start_date),
  INDEX platform_packages_type_idx (package_type, availability_status)
);

CREATE TABLE IF NOT EXISTS platform_package_itinerary_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  package_id INT UNSIGNED NOT NULL,
  day_label VARCHAR(80) NOT NULL,
  item_time VARCHAR(40) NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  location VARCHAR(190) NULL,
  related_event_id VARCHAR(120) NULL,
  related_partner_id VARCHAR(120) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 100,
  CONSTRAINT platform_package_itinerary_package_fk FOREIGN KEY (package_id) REFERENCES platform_packages(id) ON DELETE CASCADE,
  INDEX platform_package_itinerary_package_idx (package_id, sort_order),
  INDEX platform_package_itinerary_event_idx (related_event_id),
  INDEX platform_package_itinerary_partner_idx (related_partner_id)
);

CREATE TABLE IF NOT EXISTS platform_package_partner_placements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  package_id INT UNSIGNED NULL,
  partner_id VARCHAR(120) NOT NULL,
  partner_name VARCHAR(190) NOT NULL,
  partner_type VARCHAR(120) NOT NULL,
  package_types JSON NULL,
  contribution TEXT NULL,
  visibility VARCHAR(190) NULL,
  upgrade_options JSON NULL,
  clicks INT UNSIGNED NOT NULL DEFAULT 0,
  leads INT UNSIGNED NOT NULL DEFAULT 0,
  bookings INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_package_partner_package_fk FOREIGN KEY (package_id) REFERENCES platform_packages(id) ON DELETE CASCADE,
  INDEX platform_package_partner_package_idx (package_id),
  INDEX platform_package_partner_partner_idx (partner_id),
  INDEX platform_package_partner_type_idx (partner_type)
);

CREATE TABLE IF NOT EXISTS platform_package_inquiries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  package_id INT UNSIGNED NOT NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(80) NULL,
  number_of_guests INT UNSIGNED NOT NULL DEFAULT 1,
  preferred_hotel VARCHAR(190) NULL,
  vip_interest TINYINT(1) NOT NULL DEFAULT 0,
  message TEXT NULL,
  status ENUM('new', 'contacted', 'converted', 'lost') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_package_inquiries_package_fk FOREIGN KEY (package_id) REFERENCES platform_packages(id) ON DELETE CASCADE,
  INDEX platform_package_inquiries_package_idx (package_id, created_at),
  INDEX platform_package_inquiries_status_idx (status, created_at),
  INDEX platform_package_inquiries_email_idx (email)
);

CREATE TABLE IF NOT EXISTS platform_membership_tiers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  description TEXT NULL,
  benefits JSON NULL,
  event_benefits JSON NULL,
  hotel_benefits JSON NULL,
  package_benefits JSON NULL,
  community_benefits JSON NULL,
  app_benefits JSON NULL,
  partner_benefits JSON NULL,
  badge_label VARCHAR(80) NULL,
  priority INT UNSIGNED NOT NULL DEFAULT 100,
  stripe_price_monthly_id VARCHAR(190) NULL,
  stripe_price_yearly_id VARCHAR(190) NULL,
  status ENUM('active', 'hidden', 'archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_membership_tiers_status_idx (status, priority)
);

CREATE TABLE IF NOT EXISTS platform_user_memberships (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  tier_id INT UNSIGNED NOT NULL,
  status ENUM('active', 'trialing', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
  started_at DATETIME NOT NULL,
  renews_at DATETIME NULL,
  stripe_subscription_id VARCHAR(190) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_user_memberships_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT platform_user_memberships_tier_fk FOREIGN KEY (tier_id) REFERENCES platform_membership_tiers(id) ON DELETE RESTRICT,
  INDEX platform_user_memberships_user_idx (user_id, status),
  INDEX platform_user_memberships_tier_idx (tier_id, status),
  INDEX platform_user_memberships_stripe_idx (stripe_subscription_id)
);

CREATE TABLE IF NOT EXISTS platform_membership_benefits (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tier_id INT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  category ENUM('event', 'hotel', 'package', 'community', 'app', 'partner') NOT NULL,
  partner_id VARCHAR(120) NULL,
  code VARCHAR(80) NULL,
  valid_from DATETIME NULL,
  valid_until DATETIME NULL,
  redemption_limit INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_membership_benefits_tier_fk FOREIGN KEY (tier_id) REFERENCES platform_membership_tiers(id) ON DELETE CASCADE,
  INDEX platform_membership_benefits_tier_idx (tier_id, category),
  INDEX platform_membership_benefits_partner_idx (partner_id),
  INDEX platform_membership_benefits_code_idx (code)
);

CREATE TABLE IF NOT EXISTS platform_partner_membership_benefits (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  partner_id VARCHAR(120) NOT NULL,
  partner_name VARCHAR(190) NOT NULL,
  benefit_type VARCHAR(120) NOT NULL,
  target_tiers JSON NULL,
  audience VARCHAR(255) NULL,
  description TEXT NULL,
  placement VARCHAR(190) NULL,
  used_count INT UNSIGNED NOT NULL DEFAULT 0,
  clicks INT UNSIGNED NOT NULL DEFAULT 0,
  leads INT UNSIGNED NOT NULL DEFAULT 0,
  upgrade_options JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_partner_membership_partner_idx (partner_id),
  INDEX platform_partner_membership_type_idx (benefit_type)
);

CREATE TABLE IF NOT EXISTS platform_membership_redemptions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  benefit_id INT UNSIGNED NOT NULL,
  redeemed_at DATETIME NOT NULL,
  status ENUM('reserved', 'redeemed', 'cancelled', 'expired') NOT NULL DEFAULT 'redeemed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT platform_membership_redemptions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT platform_membership_redemptions_benefit_fk FOREIGN KEY (benefit_id) REFERENCES platform_membership_benefits(id) ON DELETE CASCADE,
  INDEX platform_membership_redemptions_user_idx (user_id, redeemed_at),
  INDEX platform_membership_redemptions_benefit_idx (benefit_id, status)
);

CREATE TABLE IF NOT EXISTS platform_app_features (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  description TEXT NULL,
  icon VARCHAR(80) NULL,
  category VARCHAR(80) NOT NULL,
  status ENUM('active', 'draft', 'hidden') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_app_features_status_idx (status, category)
);

CREATE TABLE IF NOT EXISTS platform_app_offers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  partner_id VARCHAR(120) NOT NULL,
  city VARCHAR(120) NULL,
  description TEXT NULL,
  code VARCHAR(80) NULL,
  valid_from DATETIME NULL,
  valid_until DATETIME NULL,
  tier_required ENUM('free', 'plus', 'black') NOT NULL DEFAULT 'free',
  status ENUM('draft', 'active', 'expired', 'hidden') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_app_offers_partner_idx (partner_id),
  INDEX platform_app_offers_city_idx (city, status),
  INDEX platform_app_offers_tier_idx (tier_required, status)
);

CREATE TABLE IF NOT EXISTS platform_app_push_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  city VARCHAR(120) NULL,
  event_id VARCHAR(120) NULL,
  scheduled_at DATETIME NULL,
  status ENUM('draft', 'scheduled', 'sent') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_app_push_status_idx (status, scheduled_at),
  INDEX platform_app_push_event_idx (event_id),
  INDEX platform_app_push_city_idx (city)
);

CREATE TABLE IF NOT EXISTS platform_app_city_guide_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  city VARCHAR(120) NOT NULL,
  item_type ENUM('partner_place', 'hotel', 'shuttle', 'safety', 'restaurant', 'bar') NOT NULL,
  description TEXT NULL,
  address VARCHAR(255) NULL,
  partner_id VARCHAR(120) NULL,
  tier_required ENUM('free', 'plus', 'black') NOT NULL DEFAULT 'free',
  status ENUM('draft', 'published', 'hidden') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_app_city_guide_city_idx (city, status),
  INDEX platform_app_city_guide_partner_idx (partner_id),
  INDEX platform_app_city_guide_type_idx (item_type)
);

CREATE TABLE IF NOT EXISTS platform_app_partner_placements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  partner_id VARCHAR(120) NOT NULL,
  title VARCHAR(160) NOT NULL,
  city VARCHAR(120) NULL,
  placement_type ENUM('banner', 'offer_card', 'map_pin', 'member_card', 'push') NOT NULL DEFAULT 'offer_card',
  description TEXT NULL,
  code VARCHAR(80) NULL,
  tier_required ENUM('free', 'plus', 'black') NOT NULL DEFAULT 'free',
  views INT UNSIGNED NOT NULL DEFAULT 0,
  clicks INT UNSIGNED NOT NULL DEFAULT 0,
  redemptions INT UNSIGNED NOT NULL DEFAULT 0,
  upgrade_options JSON NULL,
  status ENUM('active', 'draft', 'hidden') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_app_partner_placements_partner_idx (partner_id),
  INDEX platform_app_partner_placements_city_idx (city, status),
  INDEX platform_app_partner_placements_type_idx (placement_type)
);

CREATE TABLE IF NOT EXISTS platform_app_saved_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  item_type ENUM('event', 'ticket', 'hotel', 'package', 'offer', 'guide') NOT NULL,
  item_id VARCHAR(120) NOT NULL,
  title VARCHAR(190) NOT NULL,
  saved_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT platform_app_saved_items_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX platform_app_saved_items_user_idx (user_id, saved_at),
  INDEX platform_app_saved_items_item_idx (item_type, item_id)
);

CREATE TABLE IF NOT EXISTS platform_partners (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  category VARCHAR(120) NOT NULL,
  city VARCHAR(120) NULL,
  description TEXT NULL,
  logo VARCHAR(255) NULL,
  hero_image VARCHAR(255) NULL,
  website_url VARCHAR(255) NULL,
  contact_name VARCHAR(160) NULL,
  contact_email VARCHAR(190) NULL,
  partner_type ENUM('standard', 'premium', 'signature') NOT NULL DEFAULT 'standard',
  visibility_level VARCHAR(120) NULL,
  active_placements JSON NULL,
  offers JSON NULL,
  assigned_events JSON NULL,
  assigned_hotels JSON NULL,
  assigned_packages JSON NULL,
  membership_benefits JSON NULL,
  app_placements JSON NULL,
  notes TEXT NULL,
  status ENUM('lead', 'active', 'paused', 'archived') NOT NULL DEFAULT 'lead',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_partners_status_idx (status, partner_type),
  INDEX platform_partners_category_idx (category, city),
  INDEX platform_partners_contact_idx (contact_email)
);

CREATE TABLE IF NOT EXISTS platform_partner_offers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  partner_id INT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  code VARCHAR(80) NULL,
  valid_from DATETIME NULL,
  valid_until DATETIME NULL,
  tier_required ENUM('free', 'plus', 'black') NULL,
  city VARCHAR(120) NULL,
  status ENUM('draft', 'active', 'expired', 'hidden') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_partner_offers_partner_fk FOREIGN KEY (partner_id) REFERENCES platform_partners(id) ON DELETE CASCADE,
  INDEX platform_partner_offers_partner_idx (partner_id, status),
  INDEX platform_partner_offers_code_idx (code),
  INDEX platform_partner_offers_city_idx (city, status)
);

CREATE TABLE IF NOT EXISTS platform_partner_placements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  partner_id INT UNSIGNED NOT NULL,
  placement_type ENUM('website', 'app', 'event', 'package', 'hotel', 'membership', 'community') NOT NULL,
  related_id VARCHAR(120) NULL,
  visibility_level VARCHAR(190) NULL,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  status ENUM('draft', 'active', 'paused', 'archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_partner_placements_partner_fk FOREIGN KEY (partner_id) REFERENCES platform_partners(id) ON DELETE CASCADE,
  INDEX platform_partner_placements_partner_idx (partner_id, status),
  INDEX platform_partner_placements_type_idx (placement_type, status),
  INDEX platform_partner_placements_related_idx (related_id)
);

CREATE TABLE IF NOT EXISTS platform_partner_applications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(190) NOT NULL,
  contact_name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(80) NULL,
  website VARCHAR(255) NULL,
  city VARCHAR(120) NULL,
  category VARCHAR(120) NULL,
  interests JSON NULL,
  budget_range VARCHAR(80) NULL,
  desired_visibility TEXT NULL,
  message TEXT NULL,
  status ENUM('new', 'contacted', 'accepted', 'rejected') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_partner_applications_status_idx (status, created_at),
  INDEX platform_partner_applications_email_idx (email),
  INDEX platform_partner_applications_category_idx (category, city)
);

CREATE TABLE IF NOT EXISTS platform_partner_metrics (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  partner_id INT UNSIGNED NOT NULL,
  placement_id INT UNSIGNED NULL,
  views INT UNSIGNED NOT NULL DEFAULT 0,
  clicks INT UNSIGNED NOT NULL DEFAULT 0,
  leads INT UNSIGNED NOT NULL DEFAULT 0,
  redemptions INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_partner_metrics_partner_fk FOREIGN KEY (partner_id) REFERENCES platform_partners(id) ON DELETE CASCADE,
  CONSTRAINT platform_partner_metrics_placement_fk FOREIGN KEY (placement_id) REFERENCES platform_partner_placements(id) ON DELETE SET NULL,
  INDEX platform_partner_metrics_partner_idx (partner_id),
  INDEX platform_partner_metrics_placement_idx (placement_id)
);

CREATE TABLE IF NOT EXISTS platform_inquiries (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type ENUM('package', 'hotel', 'vip_table', 'partner', 'ambassador', 'general') NOT NULL,
  status ENUM('new', 'contacted', 'in_progress', 'converted', 'lost', 'archived') NOT NULL DEFAULT 'new',
  subject VARCHAR(190) NOT NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(80) NULL,
  city VARCHAR(120) NULL,
  message TEXT NULL,
  related_event_id VARCHAR(120) NULL,
  related_hotel_id VARCHAR(120) NULL,
  related_package_id VARCHAR(120) NULL,
  related_partner_id VARCHAR(120) NULL,
  metadata JSON NULL,
  internal_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_inquiries_type_idx (type, status),
  INDEX platform_inquiries_city_idx (city),
  INDEX platform_inquiries_email_idx (email),
  INDEX platform_inquiries_created_idx (created_at)
);

CREATE TABLE IF NOT EXISTS platform_inquiry_notes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  inquiry_id INT UNSIGNED NOT NULL,
  author_id INT UNSIGNED NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT platform_inquiry_notes_inquiry_fk FOREIGN KEY (inquiry_id) REFERENCES platform_inquiries(id) ON DELETE CASCADE,
  CONSTRAINT platform_inquiry_notes_author_fk FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX platform_inquiry_notes_inquiry_idx (inquiry_id, created_at)
);

CREATE TABLE IF NOT EXISTS platform_user_profiles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NOT NULL,
  city VARCHAR(120) NULL,
  birthday DATE NULL,
  interests JSON NULL,
  preferred_cities JSON NULL,
  avatar_url VARCHAR(255) NULL,
  newsletter_consent TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_user_profiles_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX platform_user_profiles_city_idx (city),
  INDEX platform_user_profiles_email_idx (email)
);

CREATE TABLE IF NOT EXISTS platform_user_saved_events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  event_id VARCHAR(120) NOT NULL,
  status ENUM('saved', 'visited', 'recommended') NOT NULL DEFAULT 'saved',
  reminder_enabled TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT platform_user_saved_events_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX platform_user_saved_events_user_idx (user_id, status),
  INDEX platform_user_saved_events_event_idx (event_id)
);

CREATE TABLE IF NOT EXISTS platform_user_saved_hotels (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  hotel_id VARCHAR(120) NOT NULL,
  status ENUM('saved', 'booked', 'recommended') NOT NULL DEFAULT 'saved',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT platform_user_saved_hotels_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX platform_user_saved_hotels_user_idx (user_id, status),
  INDEX platform_user_saved_hotels_hotel_idx (hotel_id)
);

CREATE TABLE IF NOT EXISTS platform_user_saved_packages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  package_id VARCHAR(120) NOT NULL,
  status ENUM('saved', 'inquiry', 'booked') NOT NULL DEFAULT 'saved',
  vip_interest TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT platform_user_saved_packages_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX platform_user_saved_packages_user_idx (user_id, status),
  INDEX platform_user_saved_packages_package_idx (package_id)
);

CREATE TABLE IF NOT EXISTS platform_user_tickets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  event_id VARCHAR(120) NOT NULL,
  ticket_type VARCHAR(120) NOT NULL,
  qr_code VARCHAR(190) NULL,
  status ENUM('active', 'used', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_user_tickets_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX platform_user_tickets_user_idx (user_id, status),
  INDEX platform_user_tickets_event_idx (event_id)
);

CREATE TABLE IF NOT EXISTS platform_user_benefits (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  benefit_id VARCHAR(120) NOT NULL,
  code VARCHAR(80) NULL,
  status ENUM('available', 'redeemed', 'expired') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_user_benefits_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX platform_user_benefits_user_idx (user_id, status),
  INDEX platform_user_benefits_code_idx (code)
);

CREATE TABLE IF NOT EXISTS platform_user_notification_preferences (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  language VARCHAR(40) NOT NULL DEFAULT 'de',
  notifications TINYINT(1) NOT NULL DEFAULT 1,
  event_reminders TINYINT(1) NOT NULL DEFAULT 1,
  hotel_updates TINYINT(1) NOT NULL DEFAULT 1,
  partner_offers TINYINT(1) NOT NULL DEFAULT 1,
  newsletter TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_user_notification_preferences_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS platform_gallery_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(190) NOT NULL,
  slug VARCHAR(220) NOT NULL UNIQUE,
  city VARCHAR(120) NULL,
  event_id VARCHAR(120) NULL,
  event_date DATE NULL,
  media_type ENUM('photos', 'video', 'aftermovie') NOT NULL DEFAULT 'photos',
  cover_image VARCHAR(255) NULL,
  images JSON NULL,
  video_url VARCHAR(255) NULL,
  description TEXT NULL,
  photographer VARCHAR(160) NULL,
  partner_ids JSON NULL,
  sponsor_ids JSON NULL,
  visibility ENUM('public', 'members_only', 'hidden') NOT NULL DEFAULT 'public',
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_gallery_items_status_idx (status, visibility),
  INDEX platform_gallery_items_event_idx (event_id, event_date),
  INDEX platform_gallery_items_media_idx (media_type, city)
);

CREATE TABLE IF NOT EXISTS platform_gallery_media (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  gallery_id INT UNSIGNED NOT NULL,
  media_type ENUM('image', 'video') NOT NULL DEFAULT 'image',
  url VARCHAR(255) NOT NULL,
  caption VARCHAR(255) NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT platform_gallery_media_gallery_fk FOREIGN KEY (gallery_id) REFERENCES platform_gallery_items(id) ON DELETE CASCADE,
  INDEX platform_gallery_media_gallery_idx (gallery_id, sort_order),
  INDEX platform_gallery_media_type_idx (media_type)
);

CREATE TABLE IF NOT EXISTS platform_gallery_partner_placements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  gallery_id INT UNSIGNED NOT NULL,
  partner_id VARCHAR(120) NOT NULL,
  placement_type ENUM('cover_credit', 'event_archive', 'campaign_story', 'app_story') NOT NULL DEFAULT 'event_archive',
  visibility VARCHAR(190) NULL,
  status ENUM('draft', 'active', 'archived') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_gallery_partner_placements_gallery_fk FOREIGN KEY (gallery_id) REFERENCES platform_gallery_items(id) ON DELETE CASCADE,
  INDEX platform_gallery_partner_placements_gallery_idx (gallery_id, status),
  INDEX platform_gallery_partner_placements_partner_idx (partner_id)
);

CREATE TABLE IF NOT EXISTS platform_customer_profiles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  lifecycle_stage ENUM('visitor', 'registered', 'attendee', 'repeat_attendee', 'member', 'passport_plus', 'passport_black', 'ambassador', 'vip') NOT NULL DEFAULT 'registered',
  loyalty_level ENUM('member', 'silver', 'gold', 'black', 'ambassador') NOT NULL DEFAULT 'member',
  loyalty_score INT UNSIGNED NOT NULL DEFAULT 0,
  event_score INT UNSIGNED NOT NULL DEFAULT 0,
  travel_score INT UNSIGNED NOT NULL DEFAULT 0,
  community_score INT UNSIGNED NOT NULL DEFAULT 0,
  membership_score INT UNSIGNED NOT NULL DEFAULT 0,
  last_activity VARCHAR(190) NULL,
  last_activity_at DATETIME NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_customer_profiles_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX platform_customer_profiles_stage_idx (lifecycle_stage, loyalty_level),
  INDEX platform_customer_profiles_score_idx (loyalty_score)
);

CREATE TABLE IF NOT EXISTS platform_loyalty_accounts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  points_balance INT UNSIGNED NOT NULL DEFAULT 0,
  loyalty_level ENUM('member', 'silver', 'gold', 'black', 'ambassador') NOT NULL DEFAULT 'member',
  next_reward_id VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_loyalty_accounts_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX platform_loyalty_accounts_level_idx (loyalty_level, points_balance)
);

CREATE TABLE IF NOT EXISTS platform_loyalty_transactions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type ENUM('registration', 'ticket_purchase', 'event_attendance', 'hotel_booking', 'package_booking', 'membership_upgrade', 'community_attendance', 'referral', 'partner_redemption') NOT NULL,
  points INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  related_id VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT platform_loyalty_transactions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX platform_loyalty_transactions_user_idx (user_id, created_at),
  INDEX platform_loyalty_transactions_type_idx (type)
);

CREATE TABLE IF NOT EXISTS platform_rewards (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reward_key VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(190) NOT NULL,
  points_required INT UNSIGNED NOT NULL DEFAULT 0,
  level_required ENUM('member', 'silver', 'gold', 'black', 'ambassador') NOT NULL DEFAULT 'member',
  description TEXT NULL,
  benefits JSON NULL,
  status ENUM('available', 'limited', 'hidden', 'archived') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_rewards_status_idx (status, level_required)
);

CREATE TABLE IF NOT EXISTS platform_referrals (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  code VARCHAR(80) NOT NULL,
  referred_user_id INT UNSIGNED NULL,
  status ENUM('invited', 'registered', 'converted', 'expired') NOT NULL DEFAULT 'invited',
  reward_granted TINYINT(1) NOT NULL DEFAULT 0,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_referrals_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT platform_referrals_referred_user_fk FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX platform_referrals_code_idx (code),
  INDEX platform_referrals_status_idx (status, reward_granted)
);

CREATE TABLE IF NOT EXISTS platform_referral_rewards (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  referral_id INT UNSIGNED NOT NULL,
  reward_id INT UNSIGNED NULL,
  points INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('pending', 'granted', 'expired') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_referral_rewards_referral_fk FOREIGN KEY (referral_id) REFERENCES platform_referrals(id) ON DELETE CASCADE,
  CONSTRAINT platform_referral_rewards_reward_fk FOREIGN KEY (reward_id) REFERENCES platform_rewards(id) ON DELETE SET NULL,
  INDEX platform_referral_rewards_status_idx (status)
);

CREATE TABLE IF NOT EXISTS platform_automation_rules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rule_key VARCHAR(120) NOT NULL UNIQUE,
  trigger_key ENUM('registration', 'event_purchase', 'hotel_booking', 'event_attended', 'membership_upgrade', 'birthday', 'inactivity', 'referral_success') NOT NULL,
  action_key ENUM('welcome_email', 'hotel_recommendation', 'package_recommendation', 'next_event_recommendation', 'benefits_mail', 'birthday_benefit', 'reactivation', 'bonus_points') NOT NULL,
  provider VARCHAR(80) NULL,
  enabled TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('draft', 'active', 'paused', 'archived') NOT NULL DEFAULT 'draft',
  config JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_automation_rules_trigger_idx (trigger_key, status),
  INDEX platform_automation_rules_enabled_idx (enabled)
);

CREATE TABLE IF NOT EXISTS platform_revenue_transactions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(120) NULL,
  source_type ENUM('ticket', 'hotel_package', 'drink_package', 'membership', 'package', 'vip', 'partner', 'tickets', 'hotels', 'packages', 'memberships', 'partner_offers', 'sponsoring', 'referrals', 'vip_services', 'concierge') NOT NULL,
  source_id VARCHAR(120) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  city_id VARCHAR(120) NULL,
  user_id INT UNSIGNED NULL,
  payment_status ENUM('paid', 'pending', 'failed', 'refunded', 'cancelled') NOT NULL DEFAULT 'paid',
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT platform_revenue_transactions_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX platform_revenue_transactions_event_idx (event_id, created_at),
  INDEX platform_revenue_transactions_source_idx (source_type, source_id),
  INDEX platform_revenue_transactions_payment_idx (payment_status, created_at),
  INDEX platform_revenue_transactions_city_idx (city_id),
  INDEX platform_revenue_transactions_created_idx (created_at)
);

CREATE TABLE IF NOT EXISTS platform_commission_rules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type ENUM('hotel', 'package', 'referral', 'ambassador', 'partner_revenue_share') NOT NULL,
  percentage DECIMAL(5,2) NULL,
  fixed_amount DECIMAL(12,2) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_commission_rules_type_idx (type, active)
);

CREATE TABLE IF NOT EXISTS platform_commission_payouts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  rule_id INT UNSIGNED NOT NULL,
  recipient_id VARCHAR(120) NOT NULL,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  status ENUM('pending', 'approved', 'scheduled', 'paid', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_commission_payouts_rule_fk FOREIGN KEY (rule_id) REFERENCES platform_commission_rules(id) ON DELETE CASCADE,
  INDEX platform_commission_payouts_status_idx (status),
  INDEX platform_commission_payouts_recipient_idx (recipient_id)
);

CREATE TABLE IF NOT EXISTS platform_sponsor_placements (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sponsor_id VARCHAR(120) NOT NULL,
  placement_type ENUM('event', 'city', 'package', 'membership', 'app', 'welcome_bag', 'vip_area') NOT NULL,
  city_id VARCHAR(120) NULL,
  event_id VARCHAR(120) NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  value DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('proposal', 'active', 'sold', 'archived') NOT NULL DEFAULT 'proposal',
  visibility VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_sponsor_placements_sponsor_idx (sponsor_id, status),
  INDEX platform_sponsor_placements_event_idx (event_id),
  INDEX platform_sponsor_placements_city_idx (city_id)
);

CREATE TABLE IF NOT EXISTS platform_referral_campaigns (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  code VARCHAR(80) NOT NULL UNIQUE,
  reward_type ENUM('points', 'hotel_benefit', 'fast_lane', 'partner_offer', 'cash') NOT NULL DEFAULT 'points',
  reward_value DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('draft', 'active', 'paused', 'archived') NOT NULL DEFAULT 'draft',
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_referral_campaigns_status_idx (status)
);

CREATE TABLE IF NOT EXISTS platform_concierge_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  category ENUM('travel', 'hotel', 'package', 'vip', 'event', 'membership', 'general') NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  status ENUM('new', 'in_progress', 'resolved', 'archived') NOT NULL DEFAULT 'new',
  assigned_to VARCHAR(120) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_concierge_requests_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX platform_concierge_requests_status_idx (status, category)
);

CREATE TABLE IF NOT EXISTS platform_prompt_templates (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(80) NOT NULL,
  title VARCHAR(190) NOT NULL,
  content TEXT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_audit_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(120) NOT NULL,
  entity_type VARCHAR(120) NOT NULL,
  entity_id VARCHAR(120) NULL,
  details JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT platform_audit_logs_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX platform_audit_logs_action_idx (action, entity_type),
  INDEX platform_audit_logs_created_idx (created_at)
);

CREATE TABLE IF NOT EXISTS platform_user_consents (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  consent_type ENUM('marketing', 'newsletter', 'analytics', 'cookies') NOT NULL,
  granted TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT platform_user_consents_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX platform_user_consents_user_idx (user_id, consent_type)
);

CREATE TABLE IF NOT EXISTS platform_privacy_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  request_type ENUM('export', 'delete', 'rectify') NOT NULL,
  status ENUM('new', 'processing', 'completed', 'rejected') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_privacy_requests_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS platform_city_operators (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  city_id VARCHAR(120) NOT NULL,
  user_id INT UNSIGNED NULL,
  role ENUM('city_operator', 'city_manager', 'city_ambassador_lead', 'community_lead', 'partner_manager') NOT NULL,
  status ENUM('candidate', 'active', 'paused', 'archived') NOT NULL DEFAULT 'candidate',
  started_at DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT platform_city_operators_user_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX platform_city_operators_city_idx (city_id, status)
);

CREATE TABLE IF NOT EXISTS platform_business_units (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT NULL,
  owner_id VARCHAR(120) NULL,
  status ENUM('planned', 'prepared', 'active', 'paused') NOT NULL DEFAULT 'planned',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS platform_tasks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(190) NOT NULL,
  description TEXT NULL,
  assignee_id VARCHAR(120) NULL,
  priority ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'blocked', 'completed') NOT NULL DEFAULT 'open',
  due_date DATE NULL,
  category VARCHAR(80) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX platform_tasks_status_idx (status, priority)
);

CREATE TABLE IF NOT EXISTS media_assets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  storage_provider ENUM('local', 'r2') NOT NULL DEFAULT 'local',
  bucket VARCHAR(190) NULL,
  folder VARCHAR(190) NOT NULL,
  path VARCHAR(255) NOT NULL,
  public_url VARCHAR(500) NULL,
  media_type VARCHAR(40) NOT NULL,
  mime_type VARCHAR(120) NOT NULL,
  file_size INT UNSIGNED NOT NULL DEFAULT 0,
  width INT UNSIGNED NULL,
  height INT UNSIGNED NULL,
  duration DECIMAL(10,2) NULL,
  thumbnail_url VARCHAR(500) NULL,
  uploaded_by INT UNSIGNED NULL,
  related_module VARCHAR(80) NULL,
  related_id VARCHAR(120) NULL,
  status ENUM('active', 'processing', 'failed', 'archived', 'deleted') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX media_assets_status_idx (status, created_at),
  INDEX media_assets_module_idx (related_module, related_id),
  INDEX media_assets_type_idx (media_type, mime_type),
  INDEX media_assets_uploader_idx (uploaded_by, created_at)
);

CREATE TABLE IF NOT EXISTS email_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  to_email VARCHAR(190) NOT NULL,
  subject VARCHAR(190) NOT NULL,
  template_key VARCHAR(120) NULL,
  status ENUM('queued', 'sent', 'failed', 'skipped_provider_missing') NOT NULL DEFAULT 'queued',
  provider VARCHAR(80) NOT NULL DEFAULT 'mock',
  provider_message_id VARCHAR(190) NULL,
  error_message TEXT NULL,
  meta_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX email_logs_status_idx (status, created_at),
  INDEX email_logs_template_idx (template_key, created_at),
  INDEX email_logs_to_idx (to_email, created_at)
);

-- HOTMESS Phase 1 compatibility layer.

CREATE TABLE IF NOT EXISTS hotmess_phase1_venues (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  city VARCHAR(120) NOT NULL,
  country VARCHAR(80) NOT NULL DEFAULT 'AT',
  address VARCHAR(255) NULL,
  map_url VARCHAR(500) NULL,
  capacity INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_event_gender_config (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_slug VARCHAR(190) NOT NULL UNIQUE,
  male_quota_percent INT UNSIGNED NOT NULL DEFAULT 50,
  female_quota_percent INT UNSIGNED NOT NULL DEFAULT 50,
  non_binary_quota_percent INT UNSIGNED NOT NULL DEFAULT 0,
  balance_enabled TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_waitlist (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  event_slug VARCHAR(190) NOT NULL,
  email VARCHAR(190) NOT NULL,
  name VARCHAR(190) NOT NULL,
  gender VARCHAR(40) NULL,
  requested_ticket_type VARCHAR(120) NULL,
  status ENUM('waiting','invited','expired','converted','cancelled') NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX hotmess_phase1_waitlist_event_idx (event_slug, status, created_at)
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_discount_codes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(80) NOT NULL UNIQUE,
  event_slug VARCHAR(190) NULL,
  discount_type ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  discount_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_redemptions INT UNSIGNED NULL,
  redeemed_count INT UNSIGNED NOT NULL DEFAULT 0,
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  status ENUM('active','paused','expired','archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_event_tables (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_slug VARCHAR(190) NOT NULL,
  title VARCHAR(160) NOT NULL,
  min_spend DECIMAL(12,2) NOT NULL DEFAULT 0,
  capacity INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('available','reserved','sold_out','hidden') NOT NULL DEFAULT 'available',
  benefits JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX hotmess_phase1_event_tables_event_idx (event_slug, status)
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_table_bookings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  table_id INT UNSIGNED NULL,
  user_id INT UNSIGNED NULL,
  event_slug VARCHAR(190) NOT NULL,
  name VARCHAR(190) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(80) NULL,
  guest_count INT UNSIGNED NOT NULL DEFAULT 1,
  budget_range VARCHAR(120) NULL,
  status ENUM('new','contacted','confirmed','declined','archived') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_drink_packages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_slug VARCHAR(190) NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  includes JSON NULL,
  status ENUM('active','hidden','archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_birthday_packages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  event_slug VARCHAR(190) NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  includes JSON NULL,
  status ENUM('active','hidden','archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_hotel_codes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hotel_id VARCHAR(120) NULL,
  event_slug VARCHAR(190) NULL,
  code VARCHAR(120) NOT NULL,
  label VARCHAR(190) NOT NULL,
  booking_url VARCHAR(500) NULL,
  valid_until DATETIME NULL,
  status ENUM('active','expired','hidden','archived') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_follows (
  follower_id INT UNSIGNED NOT NULL,
  following_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  INDEX hotmess_phase1_follows_following_idx (following_id, created_at)
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_follow_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  requester_id INT UNSIGNED NOT NULL,
  target_id INT UNSIGNED NOT NULL,
  status ENUM('pending','accepted','declined','cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY hotmess_phase1_follow_requests_unique (requester_id, target_id)
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  media_url VARCHAR(500) NULL,
  visibility ENUM('members','followers','private') NOT NULL DEFAULT 'members',
  status ENUM('published','hidden','archived') NOT NULL DEFAULT 'published',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX hotmess_phase1_posts_user_idx (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_likes (
  post_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_comments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  post_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  status ENUM('published','hidden','archived') NOT NULL DEFAULT 'published',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_friend_activity (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  actor_id INT UNSIGNED NULL,
  activity_type ENUM('ticket','checkin','follow','post','profile','package','hotel','system') NOT NULL DEFAULT 'system',
  title VARCHAR(190) NOT NULL,
  detail TEXT NULL,
  related_url VARCHAR(500) NULL,
  visibility ENUM('private','friends','members') NOT NULL DEFAULT 'friends',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX hotmess_phase1_friend_activity_user_idx (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  type VARCHAR(80) NOT NULL,
  title VARCHAR(190) NOT NULL,
  body TEXT NULL,
  action_url VARCHAR(500) NULL,
  read_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX hotmess_phase1_notifications_user_idx (user_id, read_at, created_at)
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_notification_settings (
  user_id INT UNSIGNED PRIMARY KEY,
  email_enabled TINYINT(1) NOT NULL DEFAULT 1,
  push_enabled TINYINT(1) NOT NULL DEFAULT 0,
  event_updates TINYINT(1) NOT NULL DEFAULT 1,
  chat_updates TINYINT(1) NOT NULL DEFAULT 1,
  marketing_updates TINYINT(1) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotmess_phase1_scanner_access (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  event_slug VARCHAR(190) NULL,
  role ENUM('scanner','lead','admin') NOT NULL DEFAULT 'scanner',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY hotmess_phase1_scanner_access_unique (user_id, event_slug)
);
