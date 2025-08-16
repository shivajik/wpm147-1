import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for custom authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  bio: text("bio"),
  website: varchar("website", { length: 500 }),
  location: varchar("location", { length: 255 }),
  avatar: varchar("avatar", { length: 500 }),
  profileImageUrl: varchar("profile_image_url", { length: 500 }),
  // Notification preferences
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  securityAlerts: boolean("security_alerts").default(true),
  maintenanceUpdates: boolean("maintenance_updates").default(true),
  weeklyReports: boolean("weekly_reports").default(true),
  // Stripe integration fields
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  subscriptionPlan: varchar("subscription_plan", { length: 50 }).default("free"), // free, maintain, protect, perform
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("inactive"), // active, inactive, canceled, past_due
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  // Password reset fields
  passwordResetToken: varchar("password_reset_token", { length: 255 }),
  passwordResetExpires: timestamp("password_reset_expires"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // maintain, protect, perform
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  monthlyPrice: integer("monthly_price").notNull(), // Price in cents
  yearlyPrice: integer("yearly_price").notNull(), // Price in cents
  features: jsonb("features").notNull(), // Array of feature descriptions
  isActive: boolean("is_active").default(true),
  stripePriceIdMonthly: varchar("stripe_price_id_monthly", { length: 255 }),
  stripePriceIdYearly: varchar("stripe_price_id_yearly", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  company: varchar("company", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, inactive, pending
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  userId: integer("user_id").notNull().references(() => users.id),
});

export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  wpAdminUsername: varchar("wp_admin_username", { length: 255 }),
  wpAdminPassword: varchar("wp_admin_password", { length: 255 }), // Should be encrypted in production
  wrmApiKey: varchar("wrm_api_key", { length: 255 }), // WP Remote Manager plugin API key
  wpVersion: varchar("wp_version", { length: 50 }),
  lastBackup: timestamp("last_backup"),
  lastUpdate: timestamp("last_update"),
  lastSync: timestamp("last_sync"),
  healthStatus: varchar("health_status", { length: 20 }).notNull().default("good"), // good, warning, error
  uptime: varchar("uptime", { length: 10 }).default("100%"),
  connectionStatus: varchar("connection_status", { length: 20 }).default("disconnected"), // connected, disconnected, error
  wpData: text("wp_data"), // JSON storage for WordPress data (plugins, themes, etc.)
  // Google Analytics configuration
  gaTrackingId: varchar("ga_tracking_id", { length: 255 }), // Google Analytics 4 Measurement ID (G-XXXXXXXXXX)
  gaPropertyId: varchar("ga_property_id", { length: 255 }), // Google Analytics Property ID
  gaViewId: varchar("ga_view_id", { length: 255 }), // Google Analytics View ID (for Universal Analytics)
  gaServiceAccountKey: text("ga_service_account_key"), // JSON key for service account (encrypted)
  gaConfigured: boolean("ga_configured").default(false), // Whether GA is properly configured
  gaLastSync: timestamp("ga_last_sync"), // Last time GA data was synced
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }), // Screenshot/thumbnail URL
  screenshotUrl: varchar("screenshot_url", { length: 500 }), // External screenshot service URL
  thumbnailLastUpdated: timestamp("thumbnail_last_updated"), // Last time thumbnail was captured
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  clientId: integer("client_id").notNull().references(() => clients.id),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // update, backup, security, maintenance
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, in_progress, completed, overdue
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // low, medium, high, urgent
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  clientId: integer("client_id").notNull().references(() => clients.id),
});

export const performanceScans = pgTable("performance_scans", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  scanTimestamp: timestamp("scan_timestamp").defaultNow().notNull(),
  scanRegion: varchar("scan_region", { length: 50 }).notNull().default("us-east-1"),
  pagespeedScore: integer("pagespeed_score").notNull(),
  yslowScore: integer("yslow_score").notNull(),
  coreWebVitalsGrade: varchar("core_web_vitals_grade", { length: 20 }).notNull(), // good, needs-improvement, poor
  lcpScore: integer("lcp_score").notNull(),
  fidScore: integer("fid_score").notNull(),
  clsScore: integer("cls_score").notNull(),
  scanData: jsonb("scan_data").notNull(), // Full scan results as JSON
  recommendations: jsonb("recommendations").notNull(), // Performance recommendations
  previousScore: integer("previous_score"),
  scoreChange: integer("score_change"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Update logs table for tracking all WordPress updates
export const updateLogs = pgTable("update_logs", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").references(() => websites.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  updateType: varchar("update_type", { length: 50 }).notNull(), // "plugin", "theme", "wordpress"
  itemName: varchar("item_name", { length: 255 }).notNull(), // Plugin/theme name or "WordPress Core"
  itemSlug: varchar("item_slug", { length: 255 }), // Plugin/theme slug
  fromVersion: varchar("from_version", { length: 100 }),
  toVersion: varchar("to_version", { length: 100 }),
  updateStatus: varchar("update_status", { length: 50 }).notNull(), // "success", "failed", "pending"
  errorMessage: text("error_message"), // Error details if update failed
  updateData: jsonb("update_data"), // Full update response data
  duration: integer("duration"), // Update duration in milliseconds
  automatedUpdate: boolean("automated_update").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Link Scan History table
export const linkScanHistory = pgTable("link_scan_history", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scanStartedAt: timestamp("scan_started_at").notNull().defaultNow(),
  scanCompletedAt: timestamp("scan_completed_at"),
  scanDuration: integer("scan_duration"), // in seconds
  totalPages: integer("total_pages").notNull().default(0),
  totalLinksFound: integer("total_links_found").notNull().default(0),
  brokenLinksFound: integer("broken_links_found").notNull().default(0),
  internalBrokenLinks: integer("internal_broken_links").notNull().default(0),
  externalBrokenLinks: integer("external_broken_links").notNull().default(0),
  imageBrokenLinks: integer("image_broken_links").notNull().default(0),
  otherBrokenLinks: integer("other_broken_links").notNull().default(0),
  brokenLinksData: jsonb("broken_links_data"), // Array of broken link objects
  scanStatus: varchar("scan_status", { length: 20 }).notNull().default("completed"), // pending, running, completed, failed
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SEO Reports table
export const seoReports = pgTable("seo_reports", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  overallScore: integer("overall_score").notNull(),
  technicalScore: integer("technical_score").notNull(),
  contentScore: integer("content_score").notNull(),
  backlinksScore: integer("backlinks_score").notNull(),
  userExperienceScore: integer("user_experience_score").notNull(),
  onPageSeoScore: integer("on_page_seo_score").notNull(),
  reportData: jsonb("report_data").notNull().default('{}'),
  recommendations: jsonb("recommendations").notNull().default('[]'),
  criticalIssues: integer("critical_issues").default(0),
  warnings: integer("warnings").default(0),
  notices: integer("notices").default(0),
  reportType: varchar("report_type", { length: 20 }).default("automated"),
  detailedFindings: jsonb("detailed_findings").default('{}'),
  shareToken: varchar("share_token", { length: 255 }),
  isShareable: boolean("is_shareable").default(false),
  generatedAt: timestamp("generated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  scanDuration: integer("scan_duration"),
  scanStatus: varchar("scan_status", { length: 20 }).default("completed"),
  errorMessage: text("error_message"),
});

// SEO Metrics table
export const seoMetrics = pgTable("seo_metrics", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  reportId: integer("report_id").references(() => seoReports.id),
  totalPages: integer("total_pages").default(0),
  indexedPages: integer("indexed_pages").default(0),
  organicKeywords: integer("organic_keywords").default(0),
  backlinks: integer("backlinks").default(0),
  domainAuthority: integer("domain_authority").default(0),
  pagespeedScore: integer("pagespeed_score").default(0),
  mobileScore: integer("mobile_score").default(0),
  coreWebVitalsScore: integer("core_web_vitals_score").default(0),
  securityScore: integer("security_score").default(0),
  sslStatus: boolean("ssl_status").default(false),
  robotsTxtStatus: boolean("robots_txt_status").default(false),
  sitemapStatus: boolean("sitemap_status").default(false),
  h1Count: integer("h1_count").default(0),
  missingMetaDescriptions: integer("missing_meta_descriptions").default(0),
  missingAltTags: integer("missing_alt_tags").default(0),
  duplicateTitles: integer("duplicate_titles").default(0),
  internalLinks: integer("internal_links").default(0),
  externalLinks: integer("external_links").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// SEO Page Analysis table
export const seoPageAnalysis = pgTable("seo_page_analysis", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  reportId: integer("report_id").references(() => seoReports.id),
  url: varchar("url", { length: 500 }).notNull(),
  title: text("title"),
  metaDescription: text("meta_description"),
  h1Tag: text("h1_tag"),
  wordCount: integer("word_count").default(0),
  internalLinksCount: integer("internal_links_count").default(0),
  externalLinksCount: integer("external_links_count").default(0),
  imageCount: integer("image_count").default(0),
  missingAltTags: integer("missing_alt_tags").default(0),
  loadTime: integer("load_time"),
  mobileScore: integer("mobile_score").default(0),
  pagespeedScore: integer("pagespeed_score").default(0),
  issues: jsonb("issues").notNull().default('[]'),
  recommendations: jsonb("recommendations").notNull().default('[]'),
  lastAnalyzed: timestamp("last_analyzed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// SEO Keywords table
export const seoKeywords = pgTable("seo_keywords", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id),
  reportId: integer("report_id").references(() => seoReports.id),
  keyword: varchar("keyword", { length: 255 }).notNull(),
  searchVolume: integer("search_volume").default(0),
  difficulty: integer("difficulty").default(0),
  currentPosition: integer("current_position"),
  previousPosition: integer("previous_position"),
  positionChange: integer("position_change").default(0),
  url: varchar("url", { length: 500 }),
  searchEngine: varchar("search_engine", { length: 20 }).default("google"),
  location: varchar("location", { length: 100 }).default("global"),
  device: varchar("device", { length: 20 }).default("desktop"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Security Scan History table
export const securityScanHistory = pgTable("security_scan_history", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  scanStartedAt: timestamp("scan_started_at").notNull().defaultNow(),
  scanCompletedAt: timestamp("scan_completed_at"),
  scanDuration: integer("scan_duration"), // in seconds
  scanStatus: varchar("scan_status", { length: 20 }).notNull().default("pending"), // pending, running, completed, failed
  overallSecurityScore: integer("overall_security_score").default(0), // 0-100
  threatLevel: varchar("threat_level", { length: 20 }).default("low"), // low, medium, high, critical
  // Malware scan results
  malwareStatus: varchar("malware_status", { length: 20 }).default("clean"), // clean, infected, suspicious, error
  threatsDetected: integer("threats_detected").default(0),
  infectedFiles: jsonb("infected_files").default('[]'), // Array of infected file paths
  // Blacklist check results
  blacklistStatus: varchar("blacklist_status", { length: 20 }).default("clean"), // clean, blacklisted, error
  servicesChecked: jsonb("services_checked").default('[]'), // Array of services checked
  flaggedBy: jsonb("flagged_by").default('[]'), // Array of services that flagged the site
  // Vulnerability scan results
  coreVulnerabilities: integer("core_vulnerabilities").default(0),
  pluginVulnerabilities: integer("plugin_vulnerabilities").default(0),
  themeVulnerabilities: integer("theme_vulnerabilities").default(0),
  outdatedSoftware: jsonb("outdated_software").default('[]'), // Array of outdated software
  // Security headers check
  securityHeaders: jsonb("security_headers").default('{}'), // Object with header status
  // File integrity results
  coreFilesModified: integer("core_files_modified").default(0),
  suspiciousFiles: jsonb("suspicious_files").default('[]'), // Array of suspicious files
  filePermissionIssues: jsonb("file_permission_issues").default('[]'), // Array of permission issues
  // Additional security checks
  sslEnabled: boolean("ssl_enabled").default(false),
  filePermissionsSecure: boolean("file_permissions_secure").default(false),
  adminUserSecure: boolean("admin_user_secure").default(false),
  wpVersionHidden: boolean("wp_version_hidden").default(false),
  loginAttemptsLimited: boolean("login_attempts_limited").default(false),
  securityPluginsActive: jsonb("security_plugins_active").default('[]'), // Array of active security plugins
  // Full scan data
  fullScanData: jsonb("full_scan_data").default('{}'), // Complete scan results for detailed view
  scanTrigger: varchar("scan_trigger", { length: 50 }).default("manual"), // manual, scheduled, automated
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  websiteId: integer("website_id").references(() => websites.id),
  seoReportId: integer("seo_report_id").references(() => seoReports.id),
  securityScanId: integer("security_scan_id").references(() => securityScanHistory.id),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  actionUrl: varchar("action_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

// Security API Keys table for secure storage
export const securityApiKeys = pgTable("security_api_keys", {
  id: serial("id").primaryKey(),
  keyName: varchar("key_name", { length: 50 }).notNull().unique(),
  keyValue: text("key_value").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client Reports table - updated to match existing database structure
export const clientReports = pgTable("client_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  templateId: integer("template_id"),
  title: varchar("title", { length: 255 }).notNull(),
  clientId: integer("client_id").notNull().references(() => clients.id),
  websiteIds: jsonb("website_ids").notNull(), // Array of website IDs
  dateFrom: timestamp("date_from").notNull(),
  dateTo: timestamp("date_to").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  errorMessage: text("error_message"),
  reportData: jsonb("report_data"),
  pdfPath: varchar("pdf_path", { length: 500 }),
  shareToken: varchar("share_token", { length: 255 }),
  isPubliclyShared: boolean("is_publicly_shared").default(false),
  isScheduled: boolean("is_scheduled").default(false),
  scheduleFrequency: varchar("schedule_frequency", { length: 50 }),
  nextScheduledDate: timestamp("next_scheduled_date"),
  emailRecipients: jsonb("email_recipients").default('[]'),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  generatedAt: timestamp("generated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Report Templates table for saving custom templates
export const reportTemplates = pgTable("report_templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  templateName: varchar("template_name", { length: 255 }).notNull(),
  includeModules: jsonb("include_modules").notNull().default('["security", "seo", "performance", "updates"]'),
  customLogo: varchar("custom_logo", { length: 500 }),
  introText: text("intro_text"),
  outroText: text("outro_text"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Google Analytics data table for storing analytics metrics
export const googleAnalyticsData = pgTable("google_analytics_data", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dateRange: varchar("date_range", { length: 50 }).notNull(), // "7days", "30days", "90days", "custom"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  // Audience Metrics
  totalUsers: integer("total_users").default(0),
  newUsers: integer("new_users").default(0),
  activeUsers: integer("active_users").default(0),
  returningUsers: integer("returning_users").default(0),
  // Acquisition Metrics
  sessions: integer("sessions").default(0),
  sessionDuration: integer("session_duration").default(0), // in seconds
  bounceRate: integer("bounce_rate").default(0), // percentage (0-100)
  pagesPerSession: integer("pages_per_session").default(0), // multiplied by 100 for precision
  // Behavior Metrics
  pageViews: integer("page_views").default(0),
  uniquePageViews: integer("unique_page_views").default(0),
  averageTimeOnPage: integer("average_time_on_page").default(0), // in seconds
  exitRate: integer("exit_rate").default(0), // percentage (0-100)
  // Conversion Metrics
  goalCompletions: integer("goal_completions").default(0),
  goalValue: integer("goal_value").default(0), // in cents
  conversionRate: integer("conversion_rate").default(0), // percentage (0-100)
  // Traffic Sources
  organicTraffic: integer("organic_traffic").default(0),
  directTraffic: integer("direct_traffic").default(0),
  referralTraffic: integer("referral_traffic").default(0),
  socialTraffic: integer("social_traffic").default(0),
  paidTraffic: integer("paid_traffic").default(0),
  // Top Content
  topPages: jsonb("top_pages"), // Array of {page, views, unique_views}
  topSources: jsonb("top_sources"), // Array of {source, sessions, users}
  topKeywords: jsonb("top_keywords"), // Array of {keyword, clicks, impressions}
  // Device & Location
  deviceData: jsonb("device_data"), // {desktop: %, mobile: %, tablet: %}
  locationData: jsonb("location_data"), // Array of {country, sessions, users}
  // Raw GA4 Data
  rawData: jsonb("raw_data"), // Full response from Google Analytics API
  dataFreshness: timestamp("data_freshness").notNull().defaultNow(), // When data was last updated
  syncStatus: varchar("sync_status", { length: 20 }).default("success"), // success, failed, pending
  errorMessage: text("error_message"), // Any sync errors
  createdAt: timestamp("created_at").defaultNow(),
});

// Backup Configuration table
export const backupConfigurations = pgTable("backup_configurations", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pluginInstalled: boolean("plugin_installed").default(false),
  pluginVersion: varchar("plugin_version", { length: 50 }),
  backupProvider: varchar("backup_provider", { length: 50 }).default("updraftplus"), // updraftplus, duplicator, backwpup
  // Schedule Settings
  backupFrequency: varchar("backup_frequency", { length: 20 }).default("weekly"), // daily, weekly, monthly
  backupTime: varchar("backup_time", { length: 10 }).default("02:00"), // HH:MM format
  // Storage Settings
  storageProvider: varchar("storage_provider", { length: 50 }), // googledrive, dropbox, amazons3
  storageAccountConnected: boolean("storage_account_connected").default(false),
  storageQuotaUsed: integer("storage_quota_used").default(0), // in MB
  storageQuotaTotal: integer("storage_quota_total").default(15360), // in MB (15GB for Google Drive)
  // Backup Components
  includeDatabase: boolean("include_database").default(true),
  includeFiles: boolean("include_files").default(true),
  includePlugins: boolean("include_plugins").default(true),
  includeThemes: boolean("include_themes").default(true),
  includeUploads: boolean("include_uploads").default(true),
  // Retention Settings
  retentionDays: integer("retention_days").default(30),
  maxBackupCount: integer("max_backup_count").default(10),
  // Notifications
  emailNotifications: boolean("email_notifications").default(true),
  notifyOnSuccess: boolean("notify_on_success").default(false),
  notifyOnFailure: boolean("notify_on_failure").default(true),
  // Configuration Data
  pluginSettings: jsonb("plugin_settings"), // Plugin-specific settings
  lastHealthCheck: timestamp("last_health_check"),
  configurationStatus: varchar("configuration_status", { length: 30 }).default("pending"), // pending, configured, error, manual_install_required
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Backup History table
export const backupHistory = pgTable("backup_history", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  configurationId: integer("configuration_id").references(() => backupConfigurations.id, { onDelete: "set null" }),
  backupType: varchar("backup_type", { length: 20 }).default("scheduled"), // scheduled, manual, pre-update
  backupProvider: varchar("backup_provider", { length: 50 }).default("updraftplus"),
  // Backup Details
  backupStartedAt: timestamp("backup_started_at").notNull().defaultNow(),
  backupCompletedAt: timestamp("backup_completed_at"),
  backupDuration: integer("backup_duration"), // in seconds
  backupSize: integer("backup_size"), // in bytes
  backupSizeFormatted: varchar("backup_size_formatted", { length: 20 }), // "2.4 GB"
  // Status & Results
  backupStatus: varchar("backup_status", { length: 30 }).default("pending"), // pending, running, completed, failed, manual_trigger_required
  backupProgress: integer("backup_progress").default(0), // 0-100 percentage
  errorMessage: text("error_message"),
  warningMessages: jsonb("warning_messages"), // Array of warning messages
  // Components Backed Up
  databaseIncluded: boolean("database_included").default(true),
  filesIncluded: boolean("files_included").default(true),
  pluginsIncluded: boolean("plugins_included").default(true),
  themesIncluded: boolean("themes_included").default(true),
  uploadsIncluded: boolean("uploads_included").default(true),
  // Storage Information
  storageProvider: varchar("storage_provider", { length: 50 }),
  storageLocation: varchar("storage_location", { length: 500 }), // File path or URL
  storageFileId: varchar("storage_file_id", { length: 255 }), // Cloud storage file ID
  // Backup Files
  backupFiles: jsonb("backup_files"), // Array of {file_name, file_size, component}
  databaseFile: varchar("database_file", { length: 255 }),
  pluginsFile: varchar("plugins_file", { length: 255 }),
  themesFile: varchar("themes_file", { length: 255 }),
  uploadsFile: varchar("uploads_file", { length: 255 }),
  othersFile: varchar("others_file", { length: 255 }),
  // Verification
  verificationStatus: varchar("verification_status", { length: 20 }).default("pending"), // pending, verified, failed
  checksumMd5: varchar("checksum_md5", { length: 32 }),
  checksumSha1: varchar("checksum_sha1", { length: 40 }),
  // Metadata
  wordpressVersion: varchar("wordpress_version", { length: 50 }),
  pluginVersion: varchar("plugin_version", { length: 50 }),
  siteUrl: varchar("site_url", { length: 500 }),
  backupNote: text("backup_note"), // User notes
  createdAt: timestamp("created_at").defaultNow(),
});

// Backup Restore History table
export const backupRestoreHistory = pgTable("backup_restore_history", {
  id: serial("id").primaryKey(),
  websiteId: integer("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  backupId: integer("backup_id").notNull().references(() => backupHistory.id, { onDelete: "cascade" }),
  // Restore Details
  restoreStartedAt: timestamp("restore_started_at").notNull().defaultNow(),
  restoreCompletedAt: timestamp("restore_completed_at"),
  restoreDuration: integer("restore_duration"), // in seconds
  restoreType: varchar("restore_type", { length: 20 }).default("full"), // full, selective, database-only
  // Status & Progress
  restoreStatus: varchar("restore_status", { length: 30 }).default("pending"), // pending, running, completed, failed
  restoreProgress: integer("restore_progress").default(0), // 0-100 percentage
  errorMessage: text("error_message"),
  warningMessages: jsonb("warning_messages"),
  // Components Restored
  databaseRestored: boolean("database_restored").default(false),
  filesRestored: boolean("files_restored").default(false),
  pluginsRestored: boolean("plugins_restored").default(false),
  themesRestored: boolean("themes_restored").default(false),
  uploadsRestored: boolean("uploads_restored").default(false),
  // Pre-restore Backup
  preRestoreBackupCreated: boolean("pre_restore_backup_created").default(false),
  preRestoreBackupId: integer("pre_restore_backup_id"),
  // Verification
  postRestoreVerification: varchar("post_restore_verification", { length: 20 }).default("pending"), // pending, passed, failed
  verificationErrors: jsonb("verification_errors"),
  // Metadata
  restoredByPlugin: varchar("restored_by_plugin", { length: 50 }).default("updraftplus"),
  restoreNote: text("restore_note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const clientsRelations = relations(clients, ({ many }) => ({
  websites: many(websites),
  tasks: many(tasks),
}));

export const websitesRelations = relations(websites, ({ one, many }) => ({
  client: one(clients, {
    fields: [websites.clientId],
    references: [clients.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  website: one(websites, {
    fields: [tasks.websiteId],
    references: [websites.id],
  }),
  client: one(clients, {
    fields: [tasks.clientId],
    references: [clients.id],
  }),
}));

export const performanceScansRelations = relations(performanceScans, ({ one }) => ({
  website: one(websites, {
    fields: [performanceScans.websiteId],
    references: [websites.id],
  }),
}));

export const updateLogsRelations = relations(updateLogs, ({ one }) => ({
  website: one(websites, {
    fields: [updateLogs.websiteId],
    references: [websites.id],
  }),
  user: one(users, {
    fields: [updateLogs.userId],
    references: [users.id],
  }),
}));

export const seoReportsRelations = relations(seoReports, ({ one, many }) => ({
  website: one(websites, {
    fields: [seoReports.websiteId],
    references: [websites.id],
  }),
  metrics: many(seoMetrics),
  pageAnalysis: many(seoPageAnalysis),
  keywords: many(seoKeywords),
  notifications: many(notifications),
}));

export const seoMetricsRelations = relations(seoMetrics, ({ one }) => ({
  website: one(websites, {
    fields: [seoMetrics.websiteId],
    references: [websites.id],
  }),
  report: one(seoReports, {
    fields: [seoMetrics.reportId],
    references: [seoReports.id],
  }),
}));

export const seoPageAnalysisRelations = relations(seoPageAnalysis, ({ one }) => ({
  website: one(websites, {
    fields: [seoPageAnalysis.websiteId],
    references: [websites.id],
  }),
  report: one(seoReports, {
    fields: [seoPageAnalysis.reportId],
    references: [seoReports.id],
  }),
}));

export const seoKeywordsRelations = relations(seoKeywords, ({ one }) => ({
  website: one(websites, {
    fields: [seoKeywords.websiteId],
    references: [websites.id],
  }),
  report: one(seoReports, {
    fields: [seoKeywords.reportId],
    references: [seoReports.id],
  }),
}));

export const securityScanHistoryRelations = relations(securityScanHistory, ({ one }) => ({
  website: one(websites, {
    fields: [securityScanHistory.websiteId],
    references: [websites.id],
  }),
  user: one(users, {
    fields: [securityScanHistory.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  website: one(websites, {
    fields: [notifications.websiteId],
    references: [websites.id],
  }),
  seoReport: one(seoReports, {
    fields: [notifications.seoReportId],
    references: [seoReports.id],
  }),
  securityScan: one(securityScanHistory, {
    fields: [notifications.securityScanId],
    references: [securityScanHistory.id],
  }),
}));

export const clientReportsRelations = relations(clientReports, ({ one }) => ({
  user: one(users, {
    fields: [clientReports.userId],
    references: [users.id],
  }),
  client: one(clients, {
    fields: [clientReports.clientId],
    references: [clients.id],
  }),
  // Note: websiteIds is a jsonb array, so no direct relation
}));

export const reportTemplatesRelations = relations(reportTemplates, ({ one }) => ({
  user: one(users, {
    fields: [reportTemplates.userId],
    references: [users.id],
  }),
}));

export const googleAnalyticsDataRelations = relations(googleAnalyticsData, ({ one }) => ({
  website: one(websites, {
    fields: [googleAnalyticsData.websiteId],
    references: [websites.id],
  }),
  user: one(users, {
    fields: [googleAnalyticsData.userId],
    references: [users.id],
  }),
}));

export const backupConfigurationsRelations = relations(backupConfigurations, ({ one, many }) => ({
  website: one(websites, {
    fields: [backupConfigurations.websiteId],
    references: [websites.id],
  }),
  user: one(users, {
    fields: [backupConfigurations.userId],
    references: [users.id],
  }),
  backupHistory: many(backupHistory),
}));

export const backupHistoryRelations = relations(backupHistory, ({ one, many }) => ({
  website: one(websites, {
    fields: [backupHistory.websiteId],
    references: [websites.id],
  }),
  user: one(users, {
    fields: [backupHistory.userId],
    references: [users.id],
  }),
  configuration: one(backupConfigurations, {
    fields: [backupHistory.configurationId],
    references: [backupConfigurations.id],
  }),
  restores: many(backupRestoreHistory),
}));

export const backupRestoreHistoryRelations = relations(backupRestoreHistory, ({ one }) => ({
  website: one(websites, {
    fields: [backupRestoreHistory.websiteId],
    references: [websites.id],
  }),
  user: one(users, {
    fields: [backupRestoreHistory.userId],
    references: [users.id],
  }),
  backup: one(backupHistory, {
    fields: [backupRestoreHistory.backupId],
    references: [backupHistory.id],
  }),
}));

// Insert schemas
export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWebsiteSchema = createInsertSchema(websites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPerformanceScanSchema = createInsertSchema(performanceScans).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUpdateLogSchema = createInsertSchema(updateLogs).omit({
  id: true,
  createdAt: true,
});

export const insertLinkScanHistorySchema = createInsertSchema(linkScanHistory).omit({
  id: true,
  createdAt: true,
});

// SEO Insert schemas
export const insertSeoReportSchema = createInsertSchema(seoReports).omit({
  id: true,
  createdAt: true,
  generatedAt: true,
});

export const insertSeoMetricsSchema = createInsertSchema(seoMetrics).omit({
  id: true,
  createdAt: true,
});

export const insertSeoPageAnalysisSchema = createInsertSchema(seoPageAnalysis).omit({
  id: true,
  createdAt: true,
  lastAnalyzed: true,
});

export const insertSeoKeywordsSchema = createInsertSchema(seoKeywords).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSecurityScanHistorySchema = createInsertSchema(securityScanHistory).omit({
  id: true,
  createdAt: true,
  scanStartedAt: true,
});

// Backup Insert schemas
export const insertBackupConfigurationSchema = createInsertSchema(backupConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBackupHistorySchema = createInsertSchema(backupHistory).omit({
  id: true,
  createdAt: true,
  backupStartedAt: true,
});

export const insertBackupRestoreHistorySchema = createInsertSchema(backupRestoreHistory).omit({
  id: true,
  createdAt: true,
  restoreStartedAt: true,
});

export const insertSecurityApiKeySchema = createInsertSchema(securityApiKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientReportSchema = createInsertSchema(clientReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  generatedAt: true,
});

export const insertReportTemplateSchema = createInsertSchema(reportTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGoogleAnalyticsDataSchema = createInsertSchema(googleAnalyticsData).omit({
  id: true,
  createdAt: true,
  dataFreshness: true,
});

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type RegisterUser = z.infer<typeof registerSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type ForgotPasswordUser = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordUser = z.infer<typeof resetPasswordSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Website = typeof websites.$inferSelect;
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type PerformanceScan = typeof performanceScans.$inferSelect;
export type InsertPerformanceScan = z.infer<typeof insertPerformanceScanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type UpdateLog = typeof updateLogs.$inferSelect;
export type InsertUpdateLog = z.infer<typeof insertUpdateLogSchema>;
export type LinkScanHistory = typeof linkScanHistory.$inferSelect;
export type InsertLinkScanHistory = z.infer<typeof insertLinkScanHistorySchema>;

// SEO types
export type SeoReport = typeof seoReports.$inferSelect;
export type InsertSeoReport = z.infer<typeof insertSeoReportSchema>;
export type SeoMetrics = typeof seoMetrics.$inferSelect;
export type InsertSeoMetrics = z.infer<typeof insertSeoMetricsSchema>;
export type SeoPageAnalysis = typeof seoPageAnalysis.$inferSelect;
export type InsertSeoPageAnalysis = z.infer<typeof insertSeoPageAnalysisSchema>;
export type SeoKeywords = typeof seoKeywords.$inferSelect;
export type InsertSeoKeywords = z.infer<typeof insertSeoKeywordsSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SecurityScanHistory = typeof securityScanHistory.$inferSelect;
export type InsertSecurityScanHistory = z.infer<typeof insertSecurityScanHistorySchema>;
export type SecurityApiKey = typeof securityApiKeys.$inferSelect;
export type InsertSecurityApiKey = z.infer<typeof insertSecurityApiKeySchema>;
export type ClientReport = typeof clientReports.$inferSelect;
export type InsertClientReport = z.infer<typeof insertClientReportSchema>;
export type ReportTemplate = typeof reportTemplates.$inferSelect;
export type InsertReportTemplate = z.infer<typeof insertReportTemplateSchema>;
export type GoogleAnalyticsData = typeof googleAnalyticsData.$inferSelect;
export type InsertGoogleAnalyticsData = z.infer<typeof insertGoogleAnalyticsDataSchema>;

// Backup types
export type BackupConfiguration = typeof backupConfigurations.$inferSelect;
export type InsertBackupConfiguration = z.infer<typeof insertBackupConfigurationSchema>;
export type BackupHistory = typeof backupHistory.$inferSelect;
export type InsertBackupHistory = z.infer<typeof insertBackupHistorySchema>;
export type BackupRestoreHistory = typeof backupRestoreHistory.$inferSelect;
export type InsertBackupRestoreHistory = z.infer<typeof insertBackupRestoreHistorySchema>;

// WordPress Update Management Types
export interface WordPressUpdateData {
  wordpress: {
    update_available: boolean;
    current_version?: string;
    new_version?: string;
  };
  plugins: PluginUpdate[];
  themes: ThemeUpdate[];
}

export interface PluginUpdate {
  plugin: string;
  name: string;
  current_version: string;
  new_version: string;
  package?: string;
}

export interface ThemeUpdate {
  theme: string;
  name: string;
  current_version: string;
  new_version: string;
  package?: string;
}

export interface MaintenanceModeData {
  success: boolean;
  maintenance_mode: boolean;
  message: string;
}

export interface UpdateResponse {
  success: boolean;
  message: string;
  plugin?: string;
  theme?: string;
  version?: string;
  error?: string;
}

// SEO Analysis Types
export interface DetailedFinding {
  category: string;
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  technicalDetails: string;
  recommendation: string;
  howToFix?: string;
  resources?: string[];
}

export interface SeoAnalysisResult {
  url: string;
  domain?: string;
  title: string;
  metaDescription: string;
  h1Tags: string[];
  h2Tags: string[];
  h3Tags: string[];
  pageContent: {
    wordCount: number;
    readabilityScore: number;
    keywordDensity: { [keyword: string]: number };
    sentences?: number;
    paragraphs?: number;
    avgWordsPerSentence?: number;
  };
  technicalSeo: {
    hasSSL: boolean;
    hasRobotsTxt: boolean;
    hasSitemap: boolean;
    isResponsive: boolean;
    hasValidStructuredData: boolean;
    statusCode: number;
    responseTime: number;
    canonicalTag?: string;
    metaViewport?: string;
    charset?: string;
    doctype?: string;
    lang?: string;
    hreflang?: string[];
    httpHeaders?: { [key: string]: string };
  };
  images: {
    total: number;
    withAlt: number;
    missingAlt: number;
    oversized: number;
    formats: { [format: string]: number };
    lazyLoaded: number;
  };
  links: {
    internal: number;
    external: number;
    broken: number;
    nofollow: number;
    dofollow: number;
    redirectChains: number;
  };
  performance: {
    loadTime: number;
    pageSize: number;
    pageSizeBytes?: number;
    requests: number;
    resourceBreakdown?: {
      scripts: number;
      stylesheets: number;
      images: number;
      fonts: number;
      preloads: number;
      prefetches: number;
    };
    optimizations?: {
      compression: boolean;
      minifiedCSS: boolean;
      minifiedJS: boolean;
      cacheHeaders: boolean;
      hasLazyLoading: boolean;
      hasWebP: boolean;
      hasAvif: boolean;
      hasCriticalCSS: boolean;
      hasAsyncJS: boolean;
    };
    performanceScore?: number;
    performanceIssues?: string[];
    recommendations?: string[];
    // Legacy compatibility
    compression: boolean;
    minifiedCSS: boolean;
    minifiedJS: boolean;
    cacheHeaders: boolean;
  };
  socialMeta: {
    hasOpenGraph: boolean;
    hasTwitterCards: boolean;
    hasFacebookMeta: boolean;
    openGraphData: { [key: string]: string };
    twitterCardData: { [key: string]: string };
  };
  accessibility: {
    score: number;
    issues: string[];
    contrastIssues: number;
    missingLabels: number;
    missingHeadings: boolean;
    skipLinks: boolean;
  };
  detailedFindings?: {
    criticalIssues: DetailedFinding[];
    warnings: DetailedFinding[];
    recommendations: DetailedFinding[];
    positiveFindings: DetailedFinding[];
  };
  
  // Enhanced detailed analysis sections
  headingAnalysis?: {
    structure: { [key: string]: Array<{ text: string; order: number }> };
    totalHeadings: number;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    hierarchy: { issues: string[]; warnings: string[] };
  };
  
  contentKeywords?: {
    totalWords: number;
    uniqueWords: number;
    topKeywords: Array<{ keyword: string; count: number; density: number }>;
    keywordPhrases2: Array<{ phrase: string; count: number }>;
    keywordPhrases3: Array<{ phrase: string; count: number }>;
    avgWordLength: number;
  };
  
  httpRequests?: {
    totalRequests: number;
    requestsByType: { [key: string]: number };
    externalRequests: number;
    internalRequests: number;
    requests: Array<{
      type: string;
      url: string;
      isExternal: boolean;
      hasAsync?: boolean;
      hasDefer?: boolean;
    }>;
  };
  
  javascriptAnalysis?: {
    totalScripts: number;
    htmlScriptTags?: number;
    externalScripts: number;
    inlineScripts: number;
    asyncScripts: number;
    deferScripts: number;
    blockingScripts: number;
    securityFeatures?: number;
    largestInlineScript?: number;
    optimizationIssues: string[];
    scripts: Array<{
      type: 'inline' | 'external';
      src?: string;
      size?: number;
      hasAsync: boolean;
      hasDefer: boolean;
      hasType?: string;
      hasNonce?: boolean;
      hasIntegrity?: boolean;
    }>;
  };
  
  cssAnalysis?: {
    totalStylesheets: number;
    externalStylesheets: number;
    inlineStyles: number;
    minifiedStylesheets: number;
    criticalCssCount?: number;
    inlineStyleElements?: number;
    totalInlineSize?: number;
    largestInlineStyle?: number;
    optimizationIssues: string[];
    stylesheets: Array<{
      type: 'external' | 'inline';
      href?: string;
      size?: number;
      media?: string;
      isMinified?: boolean;
      hasIntegrity?: boolean;
      isCritical?: boolean;
    }>;
  };
  
  metaTagsAnalysis?: {
    totalMetaTags: number;
    seoMetaTags: Array<{
      name?: string;
      property?: string;
      httpEquiv?: string;
      content?: string;
      charset?: string;
    }>;
    socialMetaTags: Array<{
      name?: string;
      property?: string;
      httpEquiv?: string;
      content?: string;
      charset?: string;
    }>;
    viewportTags: Array<{
      name?: string;
      property?: string;
      httpEquiv?: string;
      content?: string;
      charset?: string;
    }>;
    allMetaTags: Array<{
      name?: string;
      property?: string;
      httpEquiv?: string;
      content?: string;
      charset?: string;
    }>;
  };
  
  structuralData?: {
    hasStructuredData: boolean;
    jsonLdCount: number;
    microdataCount: number;
    structuredData: Array<{
      type: string;
      schema: string;
      content: any;
    }>;
    microdata: Array<{
      type: string;
      itemType: string;
      itemScope: boolean;
    }>;
  };
  
  imageKeywords?: {
    totalImages: number;
    imagesWithKeywords: number;
    topImageKeywords: Array<{ keyword: string; count: number }>;
    imageFormats: { [format: string]: number };
  };
  
  loadingAnalysis?: {
    lazyLoadedImages: number;
    totalImages: number;
    lazyLoadingPercentage: number;
    preloadLinks: number;
    prefetchLinks: number;
    dnsPreconnects: number;
    optimizations: string[];
  };
  
  securityHeaders?: {
    hasHTTPS: boolean;
    hasHSTS: boolean;
    hasCSP: boolean;
    hasXFrameOptions: boolean;
    hasXContentTypeOptions: boolean;
    hasReferrerPolicy: boolean;
    securityScore: number;
    error?: string;
  };
}
