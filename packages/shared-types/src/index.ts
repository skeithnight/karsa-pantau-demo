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
