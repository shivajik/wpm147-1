import {
  users,
  clients,
  websites,
  tasks,
  performanceScans,
  subscriptionPlans,
  updateLogs,
  seoReports,
  seoMetrics,
  seoPageAnalysis,
  seoKeywords,
  notifications,
  securityScanHistory,
  googleAnalyticsData,
  backupConfigurations,
  backupHistory,
  backupRestoreHistory,
  type User,
  type InsertUser,
  type Client,
  type InsertClient,
  type Website,
  type InsertWebsite,
  type Task,
  type InsertTask,
  type PerformanceScan,
  type InsertPerformanceScan,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type UpdateLog,
  type InsertUpdateLog,
  type SeoReport,
  type InsertSeoReport,
  type SeoMetrics,
  type InsertSeoMetrics,
  type SeoPageAnalysis,
  type InsertSeoPageAnalysis,
  type SeoKeywords,
  type InsertSeoKeywords,
  type Notification,
  type InsertNotification,
  type SecurityScanHistory,
  type InsertSecurityScanHistory,
  type GoogleAnalyticsData,
  type InsertGoogleAnalyticsData,
  type BackupConfiguration,
  type InsertBackupConfiguration,
  type BackupHistory,
  type InsertBackupHistory,
  type BackupRestoreHistory,
  type InsertBackupRestoreHistory,
  linkScanHistory,
  type LinkScanHistory,
  type InsertLinkScanHistory,
  clientReports,
  reportTemplates,
  type ClientReport,
  type InsertClientReport,
  type ReportTemplate,
  type InsertReportTemplate,
} from "@shared/schema";
import { db } from "./db.js";
import { eq, desc, and, count, sql, inArray, gte, gt } from "drizzle-orm";


// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserProfile(id: number): Promise<User | undefined>;
  updateUserProfile(id: number, profileData: Partial<User>): Promise<User>;
  changeUserPassword(id: number, currentPassword: string, newPassword: string): Promise<void>;
  updateNotificationPreferences(id: number, preferences: Partial<User>): Promise<User>;
  
  // Password reset operations
  setPasswordResetToken(email: string, token: string, expires: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearPasswordResetToken(userId: number): Promise<void>;
  
  // Client operations
  getClients(userId: number): Promise<Client[]>;
  getClient(id: number, userId: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>, userId: number): Promise<Client>;
  deleteClient(id: number, userId: number): Promise<void>;
  
  // Website operations
  getWebsites(userId: number, clientId?: number): Promise<Website[]>;
  getWebsite(id: number, userId: number): Promise<Website | undefined>;
  createWebsite(website: InsertWebsite): Promise<Website>;
  updateWebsite(id: number, website: Partial<InsertWebsite>, userId: number): Promise<Website>;
  deleteWebsite(id: number, userId: number): Promise<void>;
  
  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number, userId: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>, userId: number): Promise<Task>;
  deleteTask(id: number, userId: number): Promise<void>;
  
  // Performance scan operations
  getPerformanceScans(websiteId: number, userId: number): Promise<PerformanceScan[]>;
  getPerformanceScan(id: number, userId: number): Promise<PerformanceScan | undefined>;
  createPerformanceScan(scan: InsertPerformanceScan): Promise<PerformanceScan>;
  getLatestPerformanceScan(websiteId: number, userId: number): Promise<PerformanceScan | undefined>;

  // Dashboard stats
  getDashboardStats(userId: number): Promise<{
    totalClients: number;
    activeSites: number;
    pendingTasks: number;
    completedToday: number;
  }>;

  // Subscription plan operations
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(name: string): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan>;

  // Update log operations
  getUpdateLogs(websiteId: number, userId: number, limit?: number): Promise<UpdateLog[]>;
  getUpdateLog(id: number, userId: number): Promise<UpdateLog | undefined>;
  createUpdateLog(updateLog: InsertUpdateLog): Promise<UpdateLog>;
  updateUpdateLog(id: number, updateLog: Partial<InsertUpdateLog>): Promise<UpdateLog>;
  getUpdateLogsByDateRange(websiteId: number, userId: number, startDate: Date, endDate: Date): Promise<UpdateLog[]>;
  getRecentUpdateLogs(userId: number, limit?: number): Promise<UpdateLog[]>;
  
  // User subscription operations
  updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserSubscription(userId: number, subscriptionData: {
    subscriptionPlan: string;
    subscriptionStatus: string;
    subscriptionEndsAt?: Date;
  }): Promise<User>;

  // SEO Report operations
  createSeoReport(websiteId: number, reportData: Partial<InsertSeoReport>): Promise<SeoReport>;
  getSeoReports(websiteId: number, userId: number): Promise<SeoReport[]>;
  getSeoReport(reportId: number, userId: number): Promise<SeoReport | undefined>;
  updateSeoReport(reportId: number, reportData: Partial<SeoReport>): Promise<SeoReport>;
  getSeoReportWithDetails(reportId: number, userId: number): Promise<SeoReport & {
    metrics?: SeoMetrics;
    pageAnalysis?: SeoPageAnalysis[];
    keywords?: SeoKeywords[];
  } | undefined>;

  // SEO Metrics operations
  createSeoMetrics(reportId: number, websiteId: number, metrics: Partial<InsertSeoMetrics>): Promise<SeoMetrics>;
  getSeoMetrics(reportId: number): Promise<SeoMetrics | undefined>;

  // SEO Page Analysis operations
  createSeoPageAnalysis(reportId: number, websiteId: number, pageData: Partial<InsertSeoPageAnalysis>): Promise<SeoPageAnalysis>;
  getSeoPageAnalysis(reportId: number): Promise<SeoPageAnalysis[]>;

  // SEO Keywords operations
  createSeoKeywords(reportId: number, websiteId: number, keywords: Partial<InsertSeoKeywords>[]): Promise<SeoKeywords[]>;
  getSeoKeywords(reportId: number): Promise<SeoKeywords[]>;

  // Notification operations
  createNotification(notificationData: InsertNotification): Promise<Notification>;
  getNotifications(userId: number, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number, userId: number): Promise<void>;
  getUnreadNotificationsCount(userId: number): Promise<number>;

  // Security scan history operations
  createSecurityScan(scanData: InsertSecurityScanHistory): Promise<SecurityScanHistory>;
  getSecurityScans(websiteId: number, userId: number, limit?: number): Promise<SecurityScanHistory[]>;
  getSecurityScan(id: number, userId: number): Promise<SecurityScanHistory | undefined>;
  updateSecurityScan(id: number, scanData: Partial<SecurityScanHistory>): Promise<SecurityScanHistory>;
  getLatestSecurityScan(websiteId: number, userId: number): Promise<SecurityScanHistory | undefined>;
  clearAllSecurityScans(userId: number): Promise<void>;
  getAllSecurityScans(userId: number): Promise<SecurityScanHistory[]>;
  getSecurityScanStats(userId: number): Promise<{
    totalScans: number;
    cleanSites: number;
    threatsDetected: number;
    criticalIssues: number;
  }>;

  // Client Report operations
  getClientReports(userId: number): Promise<ClientReport[]>;
  getClientReport(id: number, userId: number): Promise<ClientReport | undefined>;
  createClientReport(reportData: InsertClientReport): Promise<ClientReport>;
  updateClientReport(id: number, reportData: Partial<InsertClientReport>, userId: number): Promise<ClientReport>;
  deleteClientReport(id: number, userId: number): Promise<void>;
  getClientReportStats(userId: number): Promise<{
    totalReports: number;
    sentThisMonth: number;
    activeClients: number;
    averageScore: number;
  }>;

  // Report Template operations
  getReportTemplates(userId: number): Promise<ReportTemplate[]>;
  getReportTemplate(id: number, userId: number): Promise<ReportTemplate | undefined>;
  createReportTemplate(templateData: InsertReportTemplate): Promise<ReportTemplate>;
  updateReportTemplate(id: number, templateData: Partial<InsertReportTemplate>, userId: number): Promise<ReportTemplate>;
  deleteReportTemplate(id: number, userId: number): Promise<void>;
  setDefaultReportTemplate(id: number, userId: number): Promise<void>;

  // Google Analytics operations
  updateWebsiteGoogleAnalytics(websiteId: number, userId: number, gaConfig: {
    gaTrackingId?: string;
    gaPropertyId?: string;
    gaViewId?: string;
    gaServiceAccountKey?: string;
    gaConfigured?: boolean;
  }): Promise<Website>;
  getGoogleAnalyticsData(websiteId: number, userId: number, dateRange?: string): Promise<GoogleAnalyticsData[]>;
  createGoogleAnalyticsData(analyticsData: InsertGoogleAnalyticsData): Promise<GoogleAnalyticsData>;
  getLatestGoogleAnalyticsData(websiteId: number, userId: number): Promise<GoogleAnalyticsData | undefined>;
  deleteGoogleAnalyticsData(websiteId: number, userId: number): Promise<void>;

  // Backup Configuration operations
  getBackupConfiguration(websiteId: number, userId: number): Promise<BackupConfiguration | undefined>;
  createBackupConfiguration(configData: InsertBackupConfiguration): Promise<BackupConfiguration>;
  updateBackupConfiguration(id: number, configData: Partial<InsertBackupConfiguration>, userId: number): Promise<BackupConfiguration>;
  deleteBackupConfiguration(websiteId: number, userId: number): Promise<void>;

  // Backup History operations
  getBackupHistory(websiteId: number, userId: number, limit?: number): Promise<BackupHistory[]>;
  getBackupHistoryRecord(id: number, userId: number): Promise<BackupHistory | undefined>;
  createBackupHistory(backupData: InsertBackupHistory): Promise<BackupHistory>;
  updateBackupHistory(id: number, backupData: Partial<InsertBackupHistory>): Promise<BackupHistory>;
  deleteBackupHistory(id: number, userId: number): Promise<void>;
  getLatestBackup(websiteId: number, userId: number): Promise<BackupHistory | undefined>;
  getBackupStats(userId: number): Promise<{
    totalBackups: number;
    successfulBackups: number;
    failedBackups: number;
    totalStorage: string;
  }>;

  // Backup Restore operations
  getRestoreHistory(websiteId: number, userId: number, limit?: number): Promise<BackupRestoreHistory[]>;
  createRestoreHistory(restoreData: InsertBackupRestoreHistory): Promise<BackupRestoreHistory>;
  updateRestoreHistory(id: number, restoreData: Partial<InsertBackupRestoreHistory>): Promise<BackupRestoreHistory>;
  getLatestRestore(websiteId: number, userId: number): Promise<BackupRestoreHistory | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async getUserProfile(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUserProfile(id: number, profileData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async changeUserPassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    // First, get the user to verify current password
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }

    // Import bcrypt since it's not imported in the current file
    const bcrypt = await import("bcryptjs");
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async updateNotificationPreferences(id: number, preferences: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...preferences, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Alias for consistency
  async updateUserNotifications(id: number, preferences: Partial<User>): Promise<User> {
    return this.updateNotificationPreferences(id, preferences);
  }

  // Password reset operations
  async setPasswordResetToken(email: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({ 
        passwordResetToken: token, 
        passwordResetExpires: expires,
        updatedAt: new Date()
      })
      .where(eq(users.email, email));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.passwordResetToken, token),
          gt(users.passwordResetExpires, new Date())
        )
      );
    return user;
  }

  async clearPasswordResetToken(userId: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        passwordResetToken: null, 
        passwordResetExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Client operations
  async getClients(userId: number): Promise<Client[]> {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.userId, userId))
      .orderBy(desc(clients.createdAt));
  }

  async getClient(id: number, userId: number): Promise<Client | undefined> {
    const [client] = await db
      .select()
      .from(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>, userId: number): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(and(eq(clients.id, id), eq(clients.userId, userId)))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: number, userId: number): Promise<void> {
    await db
      .delete(clients)
      .where(and(eq(clients.id, id), eq(clients.userId, userId)));
  }

  // Website operations
  async getWebsites(userId: number, clientId?: number): Promise<Website[]> {
    console.log('[storage] getWebsites called with userId:', userId, 'clientId:', clientId);
    
    // Validate userId
    if (!userId || isNaN(userId)) {
      console.error('[storage] Invalid userId:', userId);
      throw new Error('Invalid user ID');
    }
    
    // Build where conditions
    let whereConditions = [eq(clients.userId, userId)];
    if (clientId && !isNaN(clientId)) {
      whereConditions.push(eq(websites.clientId, clientId));
    }
    
    const result = await db
      .select()
      .from(websites)
      .innerJoin(clients, eq(websites.clientId, clients.id))
      .where(and(...whereConditions))
      .then(rows => rows.map(row => row.websites));
    
    console.log('[storage] getWebsites returning', result.length, 'websites');
    return result;
  }

  async getWebsite(id: number, userId: number): Promise<Website | undefined> {
    const [result] = await db
      .select()
      .from(websites)
      .innerJoin(clients, eq(websites.clientId, clients.id))
      .where(and(eq(websites.id, id), eq(clients.userId, userId)));
    return result?.websites;
  }

  async createWebsite(website: InsertWebsite): Promise<Website> {
    const [newWebsite] = await db.insert(websites).values(website).returning();
    return newWebsite;
  }

  async updateWebsite(id: number, website: Partial<InsertWebsite>, userId: number): Promise<Website> {
    const [updatedWebsite] = await db
      .update(websites)
      .set({ ...website, updatedAt: new Date() })
      .from(clients)
      .where(and(
        eq(websites.id, id),
        eq(websites.clientId, clients.id),
        eq(clients.userId, userId)
      ))
      .returning();
    return updatedWebsite;
  }

  async deleteWebsite(id: number, userId: number): Promise<void> {
    await db
      .delete(websites)
      .where(
        and(
          eq(websites.id, id),
          sql`EXISTS (SELECT 1 FROM ${clients} WHERE ${clients.id} = ${websites.clientId} AND ${clients.userId} = ${userId})`
        )
      );
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .innerJoin(clients, eq(tasks.clientId, clients.id))
      .where(eq(clients.userId, userId))
      .orderBy(desc(tasks.createdAt))
      .then(rows => rows.map(row => row.tasks));
  }

  async getTask(id: number, userId: number): Promise<Task | undefined> {
    const [result] = await db
      .select()
      .from(tasks)
      .innerJoin(clients, eq(tasks.clientId, clients.id))
      .where(and(eq(tasks.id, id), eq(clients.userId, userId)));
    return result?.tasks;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>, userId: number): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .from(clients)
      .where(and(
        eq(tasks.id, id),
        eq(tasks.clientId, clients.id),
        eq(clients.userId, userId)
      ))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number, userId: number): Promise<void> {
    await db
      .delete(tasks)
      .where(
        and(
          eq(tasks.id, id),
          sql`EXISTS (SELECT 1 FROM ${clients} WHERE ${clients.id} = ${tasks.clientId} AND ${clients.userId} = ${userId})`
        )
      );
  }

  // Dashboard stats
  async getDashboardStats(userId: number): Promise<{
    totalClients: number;
    activeSites: number;
    pendingTasks: number;
    completedToday: number;
    pendingUpdates: number;
  }> {
    const [clientCount] = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.userId, userId));

    const [siteCount] = await db
      .select({ count: count() })
      .from(websites)
      .innerJoin(clients, eq(websites.clientId, clients.id))
      .where(eq(clients.userId, userId));

    const [pendingTaskCount] = await db
      .select({ count: count() })
      .from(tasks)
      .innerJoin(clients, eq(tasks.clientId, clients.id))
      .where(and(
        eq(clients.userId, userId),
        eq(tasks.status, "pending")
      ));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [completedTodayCount] = await db
      .select({ count: count() })
      .from(tasks)
      .innerJoin(clients, eq(tasks.clientId, clients.id))
      .where(and(
        eq(clients.userId, userId),
        eq(tasks.status, "completed"),
        sql`${tasks.completedAt} >= ${today.toISOString()}`
      ));

    // Calculate pending updates from all user's websites
    const userClients = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.userId, userId));
    
    const clientIds = userClients.map(c => c.id);
    let totalPendingUpdates = 0;
    
    if (clientIds.length > 0) {
      // Get all websites for user's clients
      const userWebsites = await db
        .select()
        .from(websites)
        .where(inArray(websites.clientId, clientIds));
      
      // Count pending updates from stored WordPress data for each website
      for (const website of userWebsites) {
        try {
          // Use stored WordPress data if available
          if (website.wpData) {
            const wpData = JSON.parse(website.wpData);
            
            // Count plugin updates
            const pluginUpdates = wpData.updateData?.plugins?.length || 0;
            
            // Count theme updates  
            const themeUpdates = wpData.updateData?.themes?.length || 0;
            
            // Count WordPress core updates
            const coreUpdates = wpData.updateData?.wordpress?.update_available ? 1 : 0;
            
            totalPendingUpdates += pluginUpdates + themeUpdates + coreUpdates;
          }
        } catch (error) {
          console.warn(`Could not parse WordPress data for website ${website.name}:`, error);
        }
      }
    }

    return {
      totalClients: clientCount.count,
      activeSites: siteCount.count,
      pendingTasks: pendingTaskCount.count,
      completedToday: completedTodayCount.count,
      pendingUpdates: totalPendingUpdates,
    };
  }

  // Performance scan operations
  async getPerformanceScans(websiteId: number, userId: number): Promise<PerformanceScan[]> {
    const scans = await db
      .select()
      .from(performanceScans)
      .innerJoin(websites, eq(performanceScans.websiteId, websites.id))
      .innerJoin(clients, eq(websites.clientId, clients.id))
      .where(and(
        eq(performanceScans.websiteId, websiteId),
        eq(clients.userId, userId)
      ))
      .orderBy(desc(performanceScans.scanTimestamp));
    
    return scans.map(scan => scan.performance_scans);
  }

  async getPerformanceScan(id: number, userId: number): Promise<PerformanceScan | undefined> {
    const [scan] = await db
      .select()
      .from(performanceScans)
      .innerJoin(websites, eq(performanceScans.websiteId, websites.id))
      .innerJoin(clients, eq(websites.clientId, clients.id))
      .where(and(
        eq(performanceScans.id, id),
        eq(clients.userId, userId)
      ));
    
    return scan?.performance_scans;
  }

  async createPerformanceScan(scanData: InsertPerformanceScan): Promise<PerformanceScan> {
    const [scan] = await db
      .insert(performanceScans)
      .values(scanData)
      .returning();
    
    return scan;
  }

  async getLatestPerformanceScan(websiteId: number, userId: number): Promise<PerformanceScan | undefined> {
    const [scan] = await db
      .select()
      .from(performanceScans)
      .innerJoin(websites, eq(performanceScans.websiteId, websites.id))
      .innerJoin(clients, eq(websites.clientId, clients.id))
      .where(and(
        eq(performanceScans.websiteId, websiteId),
        eq(clients.userId, userId)
      ))
      .orderBy(desc(performanceScans.scanTimestamp))
      .limit(1);
    
    return scan?.performance_scans;
  }

  // Subscription plan operations
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true))
      .orderBy(subscriptionPlans.monthlyPrice);
  }

  async getSubscriptionPlan(name: string): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.name, name));
    return plan;
  }

  async createSubscriptionPlan(planData: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [plan] = await db
      .insert(subscriptionPlans)
      .values(planData)
      .returning();
    return plan;
  }

  async updateSubscriptionPlan(id: number, planData: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan> {
    const [plan] = await db
      .update(subscriptionPlans)
      .set({ ...planData, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return plan;
  }

  // User subscription operations
  async updateUserStripeInfo(userId: number, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId, 
        stripeSubscriptionId,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSubscription(userId: number, subscriptionData: {
    subscriptionPlan: string;
    subscriptionStatus: string;
    subscriptionEndsAt?: Date;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        ...subscriptionData,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Update log operations - working with actual database data
  async getUpdateLogs(websiteId: number, userId: number, limit: number = 50): Promise<UpdateLog[]> {
    try {
      console.log(`[Storage] Fetching update logs for website ${websiteId}, user ${userId}`);
      
      // First check if we have any logs at all
      const totalLogs = await db.execute(sql`SELECT COUNT(*) as count FROM update_logs`);
      console.log(`[Storage] Total logs in database: ${totalLogs[0]?.count || 0}`);
      
      // Get logs with proper column names
      const logs = await db.execute(sql`
        SELECT id, website_id, user_id, update_type, item_name, 
               item_slug, from_version, to_version, update_status, 
               error_message, duration, automated_update, created_at
        FROM update_logs 
        WHERE website_id = ${websiteId} AND user_id = ${userId}
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `);
      
      console.log(`[Storage] Found ${logs.length} logs for website ${websiteId}, user ${userId}`);
      
      return logs.map(row => ({
        id: row.id as number,
        websiteId: row.website_id as number,
        userId: row.user_id as number,
        updateType: row.update_type as string,
        itemName: row.item_name as string,
        itemSlug: row.item_slug as string || null,
        fromVersion: row.from_version as string || null,
        toVersion: row.to_version as string || null,
        updateStatus: row.update_status as string,
        errorMessage: row.error_message as string || null,
        updateData: null,
        duration: row.duration as number || null,
        automatedUpdate: row.automated_update as boolean || false,
        createdAt: row.created_at as Date
      }));
    } catch (error) {
      console.error(`[Storage] Error in getUpdateLogs:`, error);
      throw error;
    }
  }

  async createSampleUpdateLogs(websiteId: number, userId: number): Promise<void> {
    try {
      const sampleLogs = [
        {
          websiteId,
          userId,
          updateType: "plugin",
          itemName: "Contact Form 7",
          itemSlug: "contact-form-7",
          fromVersion: "5.8.1",
          toVersion: "5.8.2",
          updateStatus: "success",
          automatedUpdate: false
        },
        {
          websiteId,
          userId,
          updateType: "plugin", 
          itemName: "Yoast SEO",
          itemSlug: "wordpress-seo",
          fromVersion: "21.5",
          toVersion: "21.6",
          updateStatus: "success",
          automatedUpdate: false
        },
        {
          websiteId,
          userId,
          updateType: "theme",
          itemName: "Twenty Twenty-Four",
          itemSlug: "twentytwentyfour",
          fromVersion: "1.0",
          toVersion: "1.1",
          updateStatus: "failed",
          errorMessage: "Theme file permission issue",
          automatedUpdate: false
        }
      ];

      for (const logData of sampleLogs) {
        await this.createUpdateLog(logData);
      }
      
      console.log(`[Storage] Created ${sampleLogs.length} sample update logs`);
    } catch (error) {
      console.error(`[Storage] Error creating sample logs:`, error);
    }
  }

  async getUpdateLog(id: number, userId: number): Promise<UpdateLog | undefined> {
    const [log] = await db
      .select()
      .from(updateLogs)
      .where(and(
        eq(updateLogs.id, id),
        eq(updateLogs.userId, userId)
      ));
    
    return log;
  }

  async createUpdateLog(updateLogData: InsertUpdateLog): Promise<UpdateLog> {
    const [log] = await db
      .insert(updateLogs)
      .values(updateLogData)
      .returning();
    
    return log;
  }

  async updateUpdateLog(id: number, updateLogData: Partial<InsertUpdateLog>): Promise<UpdateLog> {
    const [log] = await db
      .update(updateLogs)
      .set(updateLogData)
      .where(eq(updateLogs.id, id))
      .returning();
    
    return log;
  }

  async getUpdateLogsByDateRange(websiteId: number, userId: number, startDate: Date, endDate: Date): Promise<UpdateLog[]> {
    const logs = await db
      .select()
      .from(updateLogs)
      .where(and(
        eq(updateLogs.websiteId, websiteId),
        eq(updateLogs.userId, userId),
        sql`${updateLogs.createdAt} >= ${startDate.toISOString()}`,
        sql`${updateLogs.createdAt} <= ${endDate.toISOString()}`
      ))
      .orderBy(desc(updateLogs.createdAt));
    
    return logs;
  }

  async getRecentUpdateLogs(userId: number, limit: number = 20): Promise<UpdateLog[]> {
    const logs = await db
      .select()
      .from(updateLogs)
      .where(eq(updateLogs.userId, userId))
      .orderBy(desc(updateLogs.createdAt))
      .limit(limit);
    
    return logs;
  }

  // SEO Report operations
  async createSeoReport(websiteId: number, reportData: Partial<InsertSeoReport>): Promise<SeoReport> {
    const [report] = await db
      .insert(seoReports)
      .values([{
        websiteId,
        overallScore: reportData.overallScore || 0,
        technicalScore: reportData.technicalScore || 0,
        contentScore: reportData.contentScore || 0,
        backlinksScore: reportData.backlinksScore || 0,
        userExperienceScore: reportData.userExperienceScore || 0,
        onPageSeoScore: reportData.onPageSeoScore || 0,
        ...reportData,
      }])
      .returning();
    
    return report;
  }

  async getSeoReports(websiteId: number, userId: number): Promise<SeoReport[]> {
    // First verify user has access to this website
    const website = await this.getWebsite(websiteId, userId);
    if (!website) {
      throw new Error("Website not found or access denied");
    }

    const reports = await db
      .select()
      .from(seoReports)
      .where(eq(seoReports.websiteId, websiteId))
      .orderBy(desc(seoReports.createdAt));
    
    return reports;
  }

  async getSeoReport(reportId: number, userId: number): Promise<SeoReport | undefined> {
    const [report] = await db
      .select()
      .from(seoReports)
      .leftJoin(websites, eq(seoReports.websiteId, websites.id))
      .leftJoin(clients, eq(websites.clientId, clients.id))
      .where(and(
        eq(seoReports.id, reportId),
        eq(clients.userId, userId)
      ));
    
    return report?.seo_reports;
  }

  async updateSeoReport(reportId: number, reportData: Partial<SeoReport>): Promise<SeoReport> {
    const [report] = await db
      .update(seoReports)
      .set(reportData)
      .where(eq(seoReports.id, reportId))
      .returning();
    
    return report;
  }

  async getSeoReportWithDetails(reportId: number, userId: number): Promise<SeoReport & {
    metrics?: SeoMetrics;
    pageAnalysis?: SeoPageAnalysis[];
    keywords?: SeoKeywords[];
  } | undefined> {
    const report = await this.getSeoReport(reportId, userId);
    if (!report) return undefined;

    const [metrics] = await db
      .select()
      .from(seoMetrics)
      .where(eq(seoMetrics.reportId, reportId));

    const pageAnalysis = await db
      .select()
      .from(seoPageAnalysis)
      .where(eq(seoPageAnalysis.reportId, reportId));

    const keywords = await db
      .select()
      .from(seoKeywords)
      .where(eq(seoKeywords.reportId, reportId));

    return {
      ...report,
      metrics,
      pageAnalysis,
      keywords,
    };
  }

  // SEO Metrics operations
  async createSeoMetrics(reportId: number, websiteId: number, metrics: Partial<InsertSeoMetrics>): Promise<SeoMetrics> {
    const [metric] = await db
      .insert(seoMetrics)
      .values({
        reportId,
        websiteId,
        ...metrics,
      })
      .returning();
    
    return metric;
  }

  async getSeoMetrics(reportId: number): Promise<SeoMetrics | undefined> {
    const [metrics] = await db
      .select()
      .from(seoMetrics)
      .where(eq(seoMetrics.reportId, reportId));
    
    return metrics;
  }

  // SEO Page Analysis operations
  async createSeoPageAnalysis(reportId: number, websiteId: number, pageData: Partial<InsertSeoPageAnalysis>): Promise<SeoPageAnalysis> {
    const [page] = await db
      .insert(seoPageAnalysis)
      .values([{
        reportId,
        websiteId,
        url: pageData.url || '',
        ...pageData,
      }])
      .returning();
    
    return page;
  }

  async getSeoPageAnalysis(reportId: number): Promise<SeoPageAnalysis[]> {
    const pages = await db
      .select()
      .from(seoPageAnalysis)
      .where(eq(seoPageAnalysis.reportId, reportId));
    
    return pages;
  }

  // SEO Keywords operations
  async createSeoKeywords(reportId: number, websiteId: number, keywords: Partial<InsertSeoKeywords>[]): Promise<SeoKeywords[]> {
    const keywordData = keywords.map(keyword => ({
      reportId,
      websiteId,
      keyword: keyword.keyword || '',
      ...keyword,
    }));

    const result = await db
      .insert(seoKeywords)
      .values(keywordData)
      .returning();
    
    return result;
  }

  async getSeoKeywords(reportId: number): Promise<SeoKeywords[]> {
    const keywords = await db
      .select()
      .from(seoKeywords)
      .where(eq(seoKeywords.reportId, reportId));
    
    return keywords;
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    
    return notification;
  }

  async getNotifications(userId: number, limit: number = 50): Promise<Notification[]> {
    const notifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
    
    return notifs;
  }

  async markNotificationAsRead(notificationId: number, userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ));
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return result?.count || 0;
  }

  // Link Scan History methods
  async createLinkScanHistory(data: InsertLinkScanHistory): Promise<LinkScanHistory> {
    const [result] = await db.insert(linkScanHistory).values(data).returning();
    return result;
  }

  async updateLinkScanHistory(id: number, data: Partial<InsertLinkScanHistory>): Promise<void> {
    await db.update(linkScanHistory)
      .set(data)
      .where(eq(linkScanHistory.id, id));
  }

  async getLinkScanHistory(websiteId: number, userId: number): Promise<LinkScanHistory[]> {
    return await db.select()
      .from(linkScanHistory)
      .where(and(
        eq(linkScanHistory.websiteId, websiteId),
        eq(linkScanHistory.userId, userId)
      ))
      .orderBy(desc(linkScanHistory.scanStartedAt));
  }

  // Security scan history methods
  async createSecurityScan(scanData: InsertSecurityScanHistory): Promise<SecurityScanHistory> {
    const [result] = await db.insert(securityScanHistory).values(scanData).returning();
    return result;
  }

  async getSecurityScans(websiteId: number, userId: number, limit: number = 50): Promise<SecurityScanHistory[]> {
    return await db.select()
      .from(securityScanHistory)
      .where(and(
        eq(securityScanHistory.websiteId, websiteId),
        eq(securityScanHistory.userId, userId)
      ))
      .orderBy(desc(securityScanHistory.scanStartedAt))
      .limit(limit);
  }

  async getSecurityScan(id: number, userId: number): Promise<SecurityScanHistory | undefined> {
    const [result] = await db.select()
      .from(securityScanHistory)
      .innerJoin(websites, eq(securityScanHistory.websiteId, websites.id))
      .where(and(
        eq(securityScanHistory.id, id),
        eq(securityScanHistory.userId, userId)
      ));
    return result?.security_scan_history;
  }

  async updateSecurityScan(id: number, scanData: Partial<SecurityScanHistory>): Promise<SecurityScanHistory> {
    const [result] = await db.update(securityScanHistory)
      .set(scanData)
      .where(eq(securityScanHistory.id, id))
      .returning();
    return result;
  }

  async getLatestSecurityScan(websiteId: number, userId: number): Promise<SecurityScanHistory | undefined> {
    const [result] = await db.select()
      .from(securityScanHistory)
      .where(and(
        eq(securityScanHistory.websiteId, websiteId),
        eq(securityScanHistory.userId, userId)
      ))
      .orderBy(desc(securityScanHistory.scanStartedAt))
      .limit(1);
    return result;
  }

  async getSecurityScanStats(userId: number): Promise<{
    totalScans: number;
    cleanSites: number;
    threatsDetected: number;
    criticalIssues: number;
  }> {
    // Get total scans for user
    const [totalScansResult] = await db
      .select({ count: count() })
      .from(securityScanHistory)
      .where(eq(securityScanHistory.userId, userId));

    // Get clean sites count (latest scan per website with clean status)
    const [cleanSitesResult] = await db
      .select({ count: count() })
      .from(securityScanHistory)
      .where(and(
        eq(securityScanHistory.userId, userId),
        eq(securityScanHistory.malwareStatus, 'clean'),
        eq(securityScanHistory.blacklistStatus, 'clean')
      ));

    // Get threats detected count (sum of all threats detected)
    const [threatsResult] = await db
      .select({ total: sql<number>`sum(${securityScanHistory.threatsDetected})` })
      .from(securityScanHistory)
      .where(eq(securityScanHistory.userId, userId));

    // Get critical issues count (threat level = critical)
    const [criticalResult] = await db
      .select({ count: count() })
      .from(securityScanHistory)
      .where(and(
        eq(securityScanHistory.userId, userId),
        eq(securityScanHistory.threatLevel, 'critical')
      ));

    return {
      totalScans: totalScansResult?.count || 0,
      cleanSites: cleanSitesResult?.count || 0,
      threatsDetected: threatsResult?.total || 0,
      criticalIssues: criticalResult?.count || 0,
    };
  }

  async clearAllSecurityScans(userId: number): Promise<void> {
    console.log(`[STORAGE] Clearing all security scans for user ${userId}`);
    await db.delete(securityScanHistory)
      .where(eq(securityScanHistory.userId, userId));
  }

  async getAllSecurityScans(userId: number): Promise<SecurityScanHistory[]> {
    console.log(`[STORAGE] Getting all security scans for user ${userId}`);
    return await db.select()
      .from(securityScanHistory)
      .where(eq(securityScanHistory.userId, userId))
      .orderBy(desc(securityScanHistory.scanStartedAt));
  }

  // Client Report operations
  async getClientReports(userId: number): Promise<ClientReport[]> {
    return await db.select()
      .from(clientReports)
      .where(eq(clientReports.userId, userId))
      .orderBy(desc(clientReports.createdAt));
  }

  async getClientReport(id: number, userId: number): Promise<ClientReport | undefined> {
    const [report] = await db.select()
      .from(clientReports)
      .where(and(
        eq(clientReports.id, id),
        eq(clientReports.userId, userId)
      ));
    return report;
  }

  async createClientReport(reportData: InsertClientReport): Promise<ClientReport> {
    const [report] = await db
      .insert(clientReports)
      .values(reportData)
      .returning();
    return report;
  }

  async updateClientReport(id: number, reportData: Partial<InsertClientReport>, userId: number): Promise<ClientReport> {
    const [report] = await db
      .update(clientReports)
      .set({ ...reportData, updatedAt: new Date() })
      .where(and(
        eq(clientReports.id, id),
        eq(clientReports.userId, userId)
      ))
      .returning();
    return report;
  }

  async deleteClientReport(id: number, userId: number): Promise<void> {
    await db.delete(clientReports)
      .where(and(
        eq(clientReports.id, id),
        eq(clientReports.userId, userId)
      ));
  }

  async getClientReportStats(userId: number): Promise<{
    totalReports: number;
    sentThisMonth: number;
    activeClients: number;
    averageScore: number;
  }> {
    try {
      console.log(`[STORAGE] Getting client report stats for userId: ${userId}`);
      
      // Validate userId
      if (!userId || isNaN(userId)) {
        console.error(`[STORAGE] Invalid userId: ${userId}`);
        throw new Error('Invalid user ID');
      }

      // Get total reports
      const [totalReportsResult] = await db
        .select({ count: count() })
        .from(clientReports)
        .where(eq(clientReports.userId, userId));

      // Get reports sent this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const [sentThisMonthResult] = await db
        .select({ count: count() })
        .from(clientReports)
        .where(and(
          eq(clientReports.userId, userId),
          eq(clientReports.emailSent, true),
          gte(clientReports.emailSentAt, startOfMonth)
        ));

      // Get active clients count
      const [activeClientsResult] = await db
        .select({ count: count() })
        .from(clients)
        .where(eq(clients.userId, userId));

      const stats = {
        totalReports: totalReportsResult?.count || 0,
        sentThisMonth: sentThisMonthResult?.count || 0,
        activeClients: activeClientsResult?.count || 0,
        averageScore: 85, // This could be calculated from actual report data
      };

      console.log(`[STORAGE] Client report stats:`, stats);
      return stats;
    } catch (error) {
      console.error(`[STORAGE] Error getting client report stats:`, error);
      throw error;
    }
  }

  // Report Template operations
  async getReportTemplates(userId: number): Promise<ReportTemplate[]> {
    return await db.select()
      .from(reportTemplates)
      .where(eq(reportTemplates.userId, userId))
      .orderBy(desc(reportTemplates.isDefault), desc(reportTemplates.createdAt));
  }

  async getReportTemplate(id: number, userId: number): Promise<ReportTemplate | undefined> {
    const [template] = await db.select()
      .from(reportTemplates)
      .where(and(
        eq(reportTemplates.id, id),
        eq(reportTemplates.userId, userId)
      ));
    return template;
  }

  async createReportTemplate(templateData: InsertReportTemplate): Promise<ReportTemplate> {
    const [template] = await db
      .insert(reportTemplates)
      .values(templateData)
      .returning();
    return template;
  }

  async updateReportTemplate(id: number, templateData: Partial<InsertReportTemplate>, userId: number): Promise<ReportTemplate> {
    const [template] = await db
      .update(reportTemplates)
      .set({ ...templateData, updatedAt: new Date() })
      .where(and(
        eq(reportTemplates.id, id),
        eq(reportTemplates.userId, userId)
      ))
      .returning();
    return template;
  }

  async deleteReportTemplate(id: number, userId: number): Promise<void> {
    await db.delete(reportTemplates)
      .where(and(
        eq(reportTemplates.id, id),
        eq(reportTemplates.userId, userId)
      ));
  }

  async setDefaultReportTemplate(id: number, userId: number): Promise<void> {
    // First, unset all default templates for this user
    await db.update(reportTemplates)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(reportTemplates.userId, userId));

    // Then set the specified template as default
    await db.update(reportTemplates)
      .set({ isDefault: true, updatedAt: new Date() })
      .where(and(
        eq(reportTemplates.id, id),
        eq(reportTemplates.userId, userId)
      ));
  }

  // Google Analytics operations
  async updateWebsiteGoogleAnalytics(websiteId: number, userId: number, gaConfig: {
    gaTrackingId?: string | null;
    gaPropertyId?: string | null;
    gaViewId?: string | null;
    gaServiceAccountKey?: string | null;
    gaConfigured?: boolean;
  }): Promise<Website> {
    const [website] = await db
      .update(websites)
      .set({ 
        gaTrackingId: gaConfig.gaTrackingId,
        gaPropertyId: gaConfig.gaPropertyId,
        gaViewId: gaConfig.gaViewId,
        gaServiceAccountKey: gaConfig.gaServiceAccountKey,
        gaConfigured: gaConfig.gaConfigured,
        gaLastSync: gaConfig.gaConfigured ? new Date() : null,
        updatedAt: new Date() 
      })
      .where(and(
        eq(websites.id, websiteId),
        inArray(websites.clientId, 
          db.select({ id: clients.id })
            .from(clients)
            .where(eq(clients.userId, userId))
        )
      ))
      .returning();
    return website;
  }

  async getGoogleAnalyticsData(websiteId: number, userId: number, dateRange?: string): Promise<GoogleAnalyticsData[]> {
    let whereConditions = and(
      eq(googleAnalyticsData.websiteId, websiteId),
      eq(googleAnalyticsData.userId, userId)
    );

    if (dateRange) {
      whereConditions = and(
        eq(googleAnalyticsData.websiteId, websiteId),
        eq(googleAnalyticsData.userId, userId),
        eq(googleAnalyticsData.dateRange, dateRange)
      );
    }

    return await db
      .select()
      .from(googleAnalyticsData)
      .where(whereConditions)
      .orderBy(desc(googleAnalyticsData.createdAt));
  }

  async createGoogleAnalyticsData(analyticsData: InsertGoogleAnalyticsData): Promise<GoogleAnalyticsData> {
    const [data] = await db
      .insert(googleAnalyticsData)
      .values(analyticsData)
      .returning();
    return data;
  }

  async getLatestGoogleAnalyticsData(websiteId: number, userId: number): Promise<GoogleAnalyticsData | undefined> {
    const [data] = await db
      .select()
      .from(googleAnalyticsData)
      .where(and(
        eq(googleAnalyticsData.websiteId, websiteId),
        eq(googleAnalyticsData.userId, userId)
      ))
      .orderBy(desc(googleAnalyticsData.createdAt))
      .limit(1);
    return data;
  }

  async deleteGoogleAnalyticsData(websiteId: number, userId: number): Promise<void> {
    await db.delete(googleAnalyticsData)
      .where(and(
        eq(googleAnalyticsData.websiteId, websiteId),
        eq(googleAnalyticsData.userId, userId)
      ));
  }

  // Backup Configuration operations
  async getBackupConfiguration(websiteId: number, userId: number): Promise<BackupConfiguration | undefined> {
    const [config] = await db
      .select()
      .from(backupConfigurations)
      .where(and(
        eq(backupConfigurations.websiteId, websiteId),
        eq(backupConfigurations.userId, userId)
      ));
    return config;
  }

  async createBackupConfiguration(configData: InsertBackupConfiguration): Promise<BackupConfiguration> {
    const [config] = await db
      .insert(backupConfigurations)
      .values(configData)
      .returning();
    return config;
  }

  async updateBackupConfiguration(id: number, configData: Partial<InsertBackupConfiguration>, userId: number): Promise<BackupConfiguration> {
    const [config] = await db
      .update(backupConfigurations)
      .set({ ...configData, updatedAt: new Date() })
      .where(and(
        eq(backupConfigurations.id, id),
        eq(backupConfigurations.userId, userId)
      ))
      .returning();
    return config;
  }

  async deleteBackupConfiguration(websiteId: number, userId: number): Promise<void> {
    await db.delete(backupConfigurations)
      .where(and(
        eq(backupConfigurations.websiteId, websiteId),
        eq(backupConfigurations.userId, userId)
      ));
  }

  // Backup History operations
  async getBackupHistory(websiteId: number, userId: number, limit = 20): Promise<BackupHistory[]> {
    return await db
      .select()
      .from(backupHistory)
      .where(and(
        eq(backupHistory.websiteId, websiteId),
        eq(backupHistory.userId, userId)
      ))
      .orderBy(desc(backupHistory.backupStartedAt))
      .limit(limit);
  }

  async getBackupHistoryRecord(id: number, userId: number): Promise<BackupHistory | undefined> {
    const [backup] = await db
      .select()
      .from(backupHistory)
      .where(and(
        eq(backupHistory.id, id),
        eq(backupHistory.userId, userId)
      ));
    return backup;
  }

  async createBackupHistory(backupData: InsertBackupHistory): Promise<BackupHistory> {
    const [backup] = await db
      .insert(backupHistory)
      .values(backupData)
      .returning();
    return backup;
  }

  async updateBackupHistory(id: number, backupData: Partial<InsertBackupHistory>): Promise<BackupHistory> {
    const [backup] = await db
      .update(backupHistory)
      .set(backupData)
      .where(eq(backupHistory.id, id))
      .returning();
    return backup;
  }

  async deleteBackupHistory(id: number, userId: number): Promise<void> {
    await db.delete(backupHistory)
      .where(and(
        eq(backupHistory.id, id),
        eq(backupHistory.userId, userId)
      ));
  }

  async getLatestBackup(websiteId: number, userId: number): Promise<BackupHistory | undefined> {
    const [backup] = await db
      .select()
      .from(backupHistory)
      .where(and(
        eq(backupHistory.websiteId, websiteId),
        eq(backupHistory.userId, userId),
        eq(backupHistory.backupStatus, 'completed')
      ))
      .orderBy(desc(backupHistory.backupStartedAt))
      .limit(1);
    return backup;
  }

  async getBackupStats(userId: number): Promise<{
    totalBackups: number;
    successfulBackups: number;
    failedBackups: number;
    totalStorage: string;
  }> {
    const [totalResult] = await db
      .select({ count: count() })
      .from(backupHistory)
      .where(eq(backupHistory.userId, userId));

    const [successResult] = await db
      .select({ count: count() })
      .from(backupHistory)
      .where(and(
        eq(backupHistory.userId, userId),
        eq(backupHistory.backupStatus, 'completed')
      ));

    const [failedResult] = await db
      .select({ count: count() })
      .from(backupHistory)
      .where(and(
        eq(backupHistory.userId, userId),
        eq(backupHistory.backupStatus, 'failed')
      ));

    // Calculate total storage from successful backups
    const storageResult = await db
      .select({ totalSize: sql<number>`sum(${backupHistory.backupSize})` })
      .from(backupHistory)
      .where(and(
        eq(backupHistory.userId, userId),
        eq(backupHistory.backupStatus, 'completed')
      ));

    const totalSizeBytes = storageResult[0]?.totalSize || 0;
    const totalStorageGB = (totalSizeBytes / (1024 * 1024 * 1024)).toFixed(2);

    return {
      totalBackups: totalResult?.count || 0,
      successfulBackups: successResult?.count || 0,
      failedBackups: failedResult?.count || 0,
      totalStorage: `${totalStorageGB} GB`
    };
  }

  // Backup Restore operations
  async getRestoreHistory(websiteId: number, userId: number, limit = 10): Promise<BackupRestoreHistory[]> {
    return await db
      .select()
      .from(backupRestoreHistory)
      .where(and(
        eq(backupRestoreHistory.websiteId, websiteId),
        eq(backupRestoreHistory.userId, userId)
      ))
      .orderBy(desc(backupRestoreHistory.restoreStartedAt))
      .limit(limit);
  }

  async createRestoreHistory(restoreData: InsertBackupRestoreHistory): Promise<BackupRestoreHistory> {
    const [restore] = await db
      .insert(backupRestoreHistory)
      .values(restoreData)
      .returning();
    return restore;
  }

  async updateRestoreHistory(id: number, restoreData: Partial<InsertBackupRestoreHistory>): Promise<BackupRestoreHistory> {
    const [restore] = await db
      .update(backupRestoreHistory)
      .set(restoreData)
      .where(eq(backupRestoreHistory.id, id))
      .returning();
    return restore;
  }

  async getLatestRestore(websiteId: number, userId: number): Promise<BackupRestoreHistory | undefined> {
    const [restore] = await db
      .select()
      .from(backupRestoreHistory)
      .where(and(
        eq(backupRestoreHistory.websiteId, websiteId),
        eq(backupRestoreHistory.userId, userId)
      ))
      .orderBy(desc(backupRestoreHistory.restoreStartedAt))
      .limit(1);
    return restore;
  }
}

export const storage = new DatabaseStorage();
