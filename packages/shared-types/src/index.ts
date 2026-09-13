// Enums
export enum UserRole {
  ADMIN = 'admin',
  PM = 'pm',
  ESTIMATOR = 'estimator',
  APPROVER = 'approver',
  SUPERVISOR = 'supervisor',
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
}

export enum RabStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum BaselineType {
  ORIGINAL_CONTRACT = 'ORIGINAL_CONTRACT',
  VARIATION_ORDER = 'VARIATION_ORDER',
}

export enum WorkPackage {
  CIVIL = 'CIVIL',
  ELECTRICAL_DC = 'ELECTRICAL_DC',
  ELECTRICAL_AC = 'ELECTRICAL_AC',
  SCADA_MONITORING = 'SCADA_MONITORING',
  TESTING_COMMISSIONING = 'TESTING_COMMISSIONING',
  OVERHEAD_PERMITS = 'OVERHEAD_PERMITS',
}

export enum CostCategory {
  MATERIAL = 'material',
  UPAH = 'upah',
  ALAT = 'alat',
  OVERHEAD = 'overhead',
}

export enum ActualSource {
  MANUAL = 'manual',
  OCR = 'ocr',
}

export enum AiInsightType {
  ANOMALY = 'anomaly',
  FORECAST = 'forecast',
  CHAT_RESPONSE = 'chat_response',
  OCR_EXTRACT = 'ocr_extract',
}

// Domain Interfaces
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  location: string;
  capacityMw: number;
  targetCodDate?: string;
  status: ProjectStatus;
  totalRab: number;
  totalActual: number;
  variancePct: number;
  physicalProgressPct: number;
  createdAt: string;
}

export interface RabItemDto {
  id?: string;
  rabId?: string;
  parentId?: string | null;
  wbsCode: string;
  itemCode: string;
  workPackage: WorkPackage;
  category: CostCategory;
  description: string;
  volume: number;
  unit: string;
  unitPrice: number;
  subtotal?: number;
  weightPct?: number;
}

export interface RabDto {
  id: string;
  projectId: string;
  version: number;
  baselineType: BaselineType;
  status: RabStatus;
  totalAmount: number;
  notes?: string;
  rejectionNote?: string;
  items: RabItemDto[];
  submittedAt?: string;
  approvedAt?: string;
}

export interface ActualEntryDto {
  id?: string;
  rabItemId: string;
  itemCode: string;
  idempotencyKey?: string;
  entryDate: string;
  qty: number;
  actualUnitPrice: number;
  totalActualAmount?: number;
  vendor: string;
  invoiceNumber?: string;
  description?: string;
  source: ActualSource;
  attachmentUrls?: string[];
  isDiscrepancy?: boolean;
}

export interface ProjectProgressLogDto {
  id?: string;
  projectId: string;
  periodWeek: number;
  logDate: string;
  plannedProgressPct: number;
  actualProgressPct: number;
  earnedValue: number;
  actualCost: number;
  cpi: number;
  spi: number;
  eac: number;
  notes?: string;
}

export interface ManpowerLogDto {
  id?: string;
  projectId: string;
  rabItemId?: string | null;
  teamName: string;
  plannedHeadcount: number;
  actualHeadcount: number;
  outputUnitInstalled?: number;
  logDate: string;
}

export interface EvmMetrics {
  totalRab: number;
  plannedValue: number;      // PV
  earnedValue: number;       // EV
  actualCost: number;        // AC
  costVariance: number;      // CV = EV - AC
  scheduleVariance: number;  // SV = EV - PV
  cpi: number;               // EV / AC
  spi: number;               // EV / PV
  estimateAtCompletion: number; // EAC
  varianceAtCompletion: number; // VAC
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==========================================
// B2B Multi-Tenant SaaS & Subscription Types
// ==========================================

export enum OrganizationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  TRIAL = 'trial',
}

export enum SubscriptionStatus {
  TRIALING = 'trialing',
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum PlanCode {
  TRIAL = 'TRIAL',
  STARTER = 'STARTER',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  activeProjectsCount?: number;
  currentPlan?: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  isActive: boolean;
  userName?: string;
  userEmail?: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  code: PlanCode;
  name: string;
  description?: string | null;
  priceMonthly: number;
  priceYearly: number;
  maxProjects: number;
  maxUsers: number;
  maxStorageGb: number;
  aiQuotaPerMonth: number;
  features: Record<string, boolean>;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string | null;
  canceledAt?: string | null;
  paymentGatewayRef?: string | null;
}

export interface SubscriptionUsage {
  planCode: PlanCode;
  planName: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodEnd: string;
  daysRemaining: number;
  projectsUsed: number;
  projectsLimit: number;
  usersUsed: number;
  usersLimit: number;
  aiQuotaUsed: number;
  aiQuotaLimit: number;
  isTrial: boolean;
}

export interface SubscriptionInvoice {
  id: string;
  organizationId: string;
  subscriptionId: string;
  invoiceNumber: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'canceled';
  paymentMethod?: string | null;
  paymentProofUrl?: string | null;
  paidAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface CreateOrganizationDto {
  name: string;
  slug?: string;
}

export interface InviteMemberDto {
  email: string;
  name?: string;
  role: UserRole;
}

export interface CheckoutPlanDto {
  planCode: PlanCode;
  billingCycle: BillingCycle;
  paymentMethod?: string;
}

export interface ConfirmInvoiceDto {
  invoiceId: string;
  paymentProofUrl?: string;
}
