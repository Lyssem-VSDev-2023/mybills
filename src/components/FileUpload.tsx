import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Upload, FileText, Image, File } from 'lucide-react';
import { FileType } from '@/types/bill';
import { formatFileSize } from '@/lib/fileUtils';

interface FileUploadData {
  file: File;
  fileType: FileType;
}

interface FileUploadProps {
  files: FileUploadData[];
  onFilesChange: (files: FileUploadData[]) => void;
  maxFiles?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  files, 
  onFilesChange, 
  maxFiles = 10 
}) => {
  const [dragActiveBill, setDragActiveBill] = useState(false);
  const [dragActiveReceipt, setDragActiveReceipt] = useState(false);

  const onDropBill = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = maxFiles - files.length;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    const newFiles = filesToAdd.map(file => ({ file, fileType: FileType.BILL }));
    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange, maxFiles]);

  const onDropReceipt = useCallback((acceptedFiles: File[]) => {
    const remainingSlots = maxFiles - files.length;
    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    const newFiles = filesToAdd.map(file => ({ file, fileType: FileType.RECEIPT }));
    onFilesChange([...files, ...newFiles]);
  }, [files, onFilesChange, maxFiles]);

  const { getRootProps: getRootPropsBill, getInputProps: getInputPropsBill, isDragActive: isDragActiveBill } = useDropzone({
    onDrop: onDropBill,
    onDragEnter: () => setDragActiveBill(true),
    onDragLeave: () => setDragActiveBill(false),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: Math.floor((maxFiles - files.length) / 2),
    disabled: files.length >= maxFiles
  });

  const { getRootProps: getRootPropsReceipt, getInputProps: getInputPropsReceipt, isDragActive: isDragActiveReceipt } = useDropzone({
    onDrop: onDropReceipt,
    onDragEnter: () => setDragActiveReceipt(true),
    onDragLeave: () => setDragActiveReceipt(false),
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: Math.floor((maxFiles - files.length) / 2),
    disabled: files.length >= maxFiles
  });

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getFileTypeLabel = (fileType: FileType) => {
    return fileType === FileType.BILL ? 'Facture' : 'Reçu';
  };

  const getFileTypeColor = (fileType: FileType) => {
    return fileType === FileType.BILL ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bill Upload */}
        {files.length < maxFiles && (
          <Card
            {...getRootPropsBill()}
            className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
              isDragActiveBill || dragActiveBill
                ? 'border-blue-500 bg-blue-50'
                : 'border-blue-300 hover:border-blue-400'
            }`}
          >
            <input {...getInputPropsBill()} />
            <Upload className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <p className="text-sm text-gray-600 font-medium">Factures</p>
            <p className="text-xs text-gray-500">
              {isDragActiveBill
                ? 'Déposez les factures ici...'
                : 'Glissez-déposez ou cliquez'}
            </p>
          </Card>
        )}

        {/* Receipt Upload */}
        {files.length < maxFiles && (
          <Card
            {...getRootPropsReceipt()}
            className={`border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
              isDragActiveReceipt || dragActiveReceipt
                ? 'border-green-500 bg-green-50'
                : 'border-green-300 hover:border-green-400'
            }`}
          >
            <input {...getInputPropsReceipt()} />
            <Upload className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <p className="text-sm text-gray-600 font-medium">Reçus</p>
            <p className="text-xs text-gray-500">
              {isDragActiveReceipt
                ? 'Déposez les reçus ici...'
                : 'Glissez-déposez ou cliquez'}
            </p>
          </Card>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Formats supportés : Images, PDF, DOC, DOCX, TXT ({files.length}/{maxFiles})
      </p>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Fichiers téléchargés ({files.length})</h4>
          {files.map(({ file, fileType }, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${getFileTypeColor(fileType)}`}>
                        {getFileTypeLabel(fileType)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {new Date().toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.type.startsWith('image/') && (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Aperçu"
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};