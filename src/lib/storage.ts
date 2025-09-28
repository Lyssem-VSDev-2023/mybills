import { Bill, BillType, AppSettings, BillStatus, BillPeriodicity } from '@/types/bill';

const BILLS_KEY = 'bills';
const BILL_TYPES_KEY = 'billTypes';
const SETTINGS_KEY = 'appSettings';

export const defaultSettings: AppSettings = {
  defaultCurrency: 'DZD',
  availableCurrencies: ['DZD', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL']
};

export const defaultBillTypes: BillType[] = [
  { 
    id: '1', 
    name: 'Utilities', 
    color: '#3b82f6',
    defaultPeriodicity: BillPeriodicity.MONTHLY,
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEzIDJMMTMgOUwyMC4wOTU3IDlMMTEgMjJMMTEgMTVMNC4zOTM0MiAxNUwxMyAyWiIgZmlsbD0iIzNiODJmNiIvPgo8L3N2Zz4K'
  },
  { 
    id: '2', 
    name: 'Rent', 
    color: '#ef4444',
    defaultPeriodicity: BillPeriodicity.MONTHLY,
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTJMMTIgM0wyMSAxMlYyMEgxNVYxNkg5VjIwSDNWMTJaIiBmaWxsPSIjZWY0NDQ0Ii8+Cjwvc3ZnPgo='
  },
  { 
    id: '3', 
    name: 'Insurance', 
    color: '#10b981',
    defaultPeriodicity: BillPeriodicity.QUARTERLY,
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDE0IDEyTDE2IDIwTDEyIDEzTDggMjBMMTAgMTJMNCA5TDEwLjkxIDguMjZMMTIgMloiIGZpbGw9IiMxMGI5ODEiLz4KPC9zdmc+Cg=='
  },
  { 
    id: '4', 
    name: 'Subscriptions', 
    color: '#f59e0b',
    defaultPeriodicity: BillPeriodicity.MONTHLY,
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJTNi40NzcgMjIgMTIgMjJTMjIgMTcuNTIzIDIyIDEyUzE3LjUyMyAyIDEyIDJaTTEwIDdIMTRWOUgxMFY3Wk0xMCAxMUgxNFYxM0gxMFYxMVpNMTAgMTVIMTRWMTdIMTBWMTVaIiBmaWxsPSIjZjU5ZTBiIi8+Cjwvc3ZnPgo='
  },
  { 
    id: '5', 
    name: 'Internet', 
    color: '#8b5cf6',
    defaultPeriodicity: BillPeriodicity.MONTHLY,
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40NzcgMiAyIDYuNDc3IDIgMTJTNi40NzcgMjIgMTIgMjJTMjIgMTcuNTIzIDIyIDEyUzE3LjUyMyAyIDEyIDJaTTEyIDRDMTYuNDExIDQgMjAgNy41ODkgMjAgMTJTMTYuNDExIDIwIDEyIDIwUzQgMTYuNDExIDQgMTJTNy41ODkgNCAxMiA0Wk0xMiA2QzguNjg2IDYgNiA4LjY4NiA2IDEyUzguNjg2IDE4IDEyIDE4UzE4IDE1LjMxNCAxOCAxMlMxNS4zMTQgNiAxMiA2Wk0xMiA4QzE0LjIwOSA4IDE2IDkuNzkxIDE2IDEyUzE0LjIwOSAxNiAxMiAxNlMxMCA5Ljc5MSAxMCAxMlMxMS43OTEgOCAxMiA4WiIgZmlsbD0iIzhiNWNmNiIvPgo8L3N2Zz4K'
  },
];

const sampleBills: Bill[] = [
  {
    id: '1',
    title: 'Electricity Bill',
    amount: 12550,
    currency: 'DZD',
    dueDate: '2024-01-15',
    billTypeId: '1',
    status: BillStatus.PAID,
    periodicity: BillPeriodicity.MONTHLY,
    period: '2024-01',
    files: [
      {
        id: 'f1',
        name: 'Utilities_2024-01_paid_2024-01-15T10-30-00.pdf',
        originalName: 'electricity_jan.pdf',
        size: 245760,
        type: 'application/pdf',
        url: 'blob:sample-file-1',
        uploadedAt: '2024-01-15T10:30:00.000Z'
      }
    ],
    createdAt: '2024-01-10T10:00:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z'
  },
  {
    id: '2',
    title: 'Monthly Rent',
    amount: 120000,
    currency: 'DZD',
    dueDate: '2024-02-01',
    billTypeId: '2',
    status: BillStatus.PENDING,
    periodicity: BillPeriodicity.MONTHLY,
    period: '2024-02',
    files: [
      {
        id: 'f2',
        name: 'Rent_2024-02_pending_2024-01-25T14-20-00.pdf',
        originalName: 'lease_agreement.pdf',
        size: 512000,
        type: 'application/pdf',
        url: 'blob:sample-file-2',
        uploadedAt: '2024-01-25T14:20:00.000Z'
      },
      {
        id: 'f3',
        name: 'Rent_2024-02_pending_2024-01-25T14-21-00_2.jpg',
        originalName: 'property_photo.jpg',
        size: 1024000,
        type: 'image/jpeg',
        url: 'blob:sample-file-3',
        uploadedAt: '2024-01-25T14:21:00.000Z'
      }
    ],
    createdAt: '2024-01-25T14:00:00.000Z',
    updatedAt: '2024-01-25T14:21:00.000Z'
  },
  {
    id: '3',
    title: 'Car Insurance Premium',
    amount: 45000,
    currency: 'DZD',
    dueDate: '2024-03-15',
    billTypeId: '3',
    status: BillStatus.PENDING,
    periodicity: BillPeriodicity.QUARTERLY,
    period: '2024-Q1',
    files: [
      {
        id: 'f4',
        name: 'Insurance_2024-Q1_pending_2024-01-20T09-15-00.pdf',
        originalName: 'insurance_policy.pdf',
        size: 356000,
        type: 'application/pdf',
        url: 'blob:sample-file-4',
        uploadedAt: '2024-01-20T09:15:00.000Z'
      }
    ],
    createdAt: '2024-01-20T09:00:00.000Z',
    updatedAt: '2024-01-20T09:15:00.000Z'
  },
  {
    id: '4',
    title: 'Netflix Subscription',
    amount: 1599,
    currency: 'DZD',
    dueDate: '2024-01-28',
    billTypeId: '4',
    status: BillStatus.OVERDUE,
    periodicity: BillPeriodicity.MONTHLY,
    period: '2024-01',
    files: [],
    createdAt: '2024-01-01T12:00:00.000Z',
    updatedAt: '2024-01-28T12:00:00.000Z'
  },
  {
    id: '5',
    title: 'Internet Service',
    amount: 7999,
    currency: 'DZD',
    dueDate: '2024-02-10',
    billTypeId: '5',
    status: BillStatus.PENDING,
    periodicity: BillPeriodicity.MONTHLY,
    period: '2024-02',
    files: [
      {
        id: 'f5',
        name: 'Internet_2024-02_pending_2024-01-30T16-45-00.pdf',
        originalName: 'internet_bill.pdf',
        size: 189000,
        type: 'application/pdf',
        url: 'blob:sample-file-5',
        uploadedAt: '2024-01-30T16:45:00.000Z'
      }
    ],
    createdAt: '2024-01-30T16:30:00.000Z',
    updatedAt: '2024-01-30T16:45:00.000Z'
  },
  {
    id: '6',
    title: 'Annual Software License',
    amount: 29999,
    currency: 'DZD',
    dueDate: '2024-12-01',
    billTypeId: '4',
    status: BillStatus.PENDING,
    periodicity: BillPeriodicity.ANNUALLY,
    period: '2024',
    files: [
      {
        id: 'f6',
        name: 'Subscriptions_2024_pending_2024-01-15T11-30-00.pdf',
        originalName: 'license_agreement.pdf',
        size: 445000,
        type: 'application/pdf',
        url: 'blob:sample-file-6',
        uploadedAt: '2024-01-15T11:30:00.000Z'
      },
      {
        id: 'f7',
        name: 'Subscriptions_2024_pending_2024-01-15T11-31-00_2.png',
        originalName: 'receipt_screenshot.png',
        size: 125000,
        type: 'image/png',
        url: 'blob:sample-file-7',
        uploadedAt: '2024-01-15T11:31:00.000Z'
      },
      {
        id: 'f8',
        name: 'Subscriptions_2024_pending_2024-01-15T11-32-00_3.txt',
        originalName: 'license_key.txt',
        size: 1024,
        type: 'text/plain',
        url: 'blob:sample-file-8',
        uploadedAt: '2024-01-15T11:32:00.000Z'
      }
    ],
    createdAt: '2024-01-15T11:00:00.000Z',
    updatedAt: '2024-01-15T11:32:00.000Z'
  }
];

export const getBills = (): Bill[] => {
  const stored = localStorage.getItem(BILLS_KEY);
  if (stored) {
    return JSON.parse(stored);
  } else {
    // Initialize with sample data on first load
    saveBills(sampleBills);
    return sampleBills;
  }
};

export const saveBills = (bills: Bill[]): void => {
  localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
};

export const getBillTypes = (): BillType[] => {
  const stored = localStorage.getItem(BILL_TYPES_KEY);
  return stored ? JSON.parse(stored) : defaultBillTypes;
};

export const saveBillTypes = (billTypes: BillType[]): void => {
  localStorage.setItem(BILL_TYPES_KEY, JSON.stringify(billTypes));
};

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const addBill = (bill: Bill): void => {
  const bills = getBills();
  bills.push(bill);
  saveBills(bills);
};

export const updateBill = (updatedBill: Bill): void => {
  const bills = getBills();
  const index = bills.findIndex(bill => bill.id === updatedBill.id);
  if (index !== -1) {
    bills[index] = updatedBill;
    saveBills(bills);
  }
};

export const deleteBill = (billId: string): void => {
  const bills = getBills();
  const filteredBills = bills.filter(bill => bill.id !== billId);
  saveBills(filteredBills);
};

export const addBillType = (billType: BillType): void => {
  const billTypes = getBillTypes();
  billTypes.push(billType);
  saveBillTypes(billTypes);
};

export const updateBillType = (updatedBillType: BillType): void => {
  const billTypes = getBillTypes();
  const index = billTypes.findIndex(type => type.id === updatedBillType.id);
  if (index !== -1) {
    billTypes[index] = updatedBillType;
    saveBillTypes(billTypes);
  }
};

export const deleteBillType = (billTypeId: string): void => {
  const billTypes = getBillTypes();
  const filteredTypes = billTypes.filter(type => type.id !== billTypeId);
  saveBillTypes(filteredTypes);
};