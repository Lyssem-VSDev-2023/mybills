import { Bill, BillType, BillFile, FileUploadType } from '@/types/bill';

export const generateLogicalFileName = (
  bill: Bill,
  billType: BillType,
  file: File,
  index: number,
  uploadType: FileUploadType
): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const extension = file.name.split('.').pop() || 'file';
  const suffix = index > 0 ? `_${index + 1}` : '';
  
  return `${billType.name}_${bill.period}_${uploadType}_${bill.title}_${timestamp}${suffix}.${extension}`;
};

export const createBillFile = (file: File, logicalName: string, uploadType: FileUploadType): BillFile => {
  return {
    id: crypto.randomUUID(),
    name: logicalName,
    originalName: file.name,
    size: file.size,
    type: file.type,
    url: URL.createObjectURL(file),
    uploadedAt: new Date().toISOString(),
    uploadType
  };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Octets';
  const k = 1024;
  const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generatePeriodString = (periodicity: string, dueDate: string): string => {
  const date = new Date(dueDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  switch (periodicity) {
    case 'monthly':
      return `${year}-${month.toString().padStart(2, '0')}`;
    case 'bi-monthly':
      return `${year}-${Math.ceil(month / 2)}B`;
    case 'quarterly':
      return `${year}-Q${Math.ceil(month / 3)}`;
    case 'semi-annually':
      return `${year}-H${Math.ceil(month / 6)}`;
    case 'annually':
      return `${year}`;
    case 'one-off':
    default:
      return `${year}-${month.toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
};