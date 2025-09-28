export enum BillStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export enum BillPeriodicity {
  ONE_OFF = 'one-off',
  MONTHLY = 'monthly',
  BI_MONTHLY = 'bi-monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi-annually',
  ANNUALLY = 'annually'
}

export enum FileType {
  BILL = 'bill',
  RECEIPT = 'receipt'
}

export interface BillFile {
  id: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  fileType: FileType;
  url: string;
  uploadedAt: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  currency: string;
  dueDate?: string; // Made optional
  billTypeId: string;
  status: BillStatus;
  periodicity: BillPeriodicity;
  period: string;
  files: BillFile[];
  createdAt: string;
  updatedAt: string;
}

export interface BillType {
  id: string;
  name: string;
  color: string;
  logo?: string;
  defaultPeriodicity?: BillPeriodicity;
}

export interface BillFilters {
  search: string;
  status: BillStatus | 'all';
  billTypeId: string;
  startDate: string;
  endDate: string;
  periodicity: BillPeriodicity | 'all';
}

export interface AppSettings {
  defaultCurrency: string;
  availableCurrencies: string[];
  googleDriveEnabled?: boolean;
  googleDriveConnected?: boolean;
}

// Google Drive Integration Types
export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
  discoveryDoc: string;
  scopes: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
}

export interface BackupData {
  bills: Bill[];
  billTypes: BillType[];
  settings: AppSettings;
  exportedAt: string;
  version: string;
}