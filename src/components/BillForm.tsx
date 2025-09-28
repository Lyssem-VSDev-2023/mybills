import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bill, BillStatus, BillPeriodicity, BillType, FileType } from '@/types/bill';
import { FileUpload } from './FileUpload';
import { addBill, updateBill, getBillTypes, getSettings } from '@/lib/storage';
import { generateLogicalFileName, createBillFile, generatePeriodString } from '@/lib/fileUtils';

interface FileUploadData {
  file: File;
  fileType: FileType;
}

interface BillFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBill?: Bill | null;
  duplicatingBill?: Bill | null;
}

export const BillForm: React.FC<BillFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingBill,
  duplicatingBill
}) => {
  const [billTypes] = useState<BillType[]>(getBillTypes());
  const [settings] = useState(getSettings());
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    currency: settings.defaultCurrency,
    dueDate: '',
    billTypeId: '',
    status: BillStatus.PENDING,
    periodicity: BillPeriodicity.MONTHLY
  });
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadData[]>([]);
  const [existingFiles, setExistingFiles] = useState<any[]>([]);

  useEffect(() => {
    if (editingBill) {
      setFormData({
        title: editingBill.title,
        amount: editingBill.amount.toString(),
        currency: editingBill.currency,
        dueDate: editingBill.dueDate || '',
        billTypeId: editingBill.billTypeId,
        status: editingBill.status,
        periodicity: editingBill.periodicity
      });
      setExistingFiles(editingBill.files || []);
      setUploadedFiles([]);
    } else if (duplicatingBill) {
      setFormData({
        title: `${duplicatingBill.title} - Copie`,
        amount: '',
        currency: settings.defaultCurrency,
        dueDate: '',
        billTypeId: duplicatingBill.billTypeId,
        status: duplicatingBill.status,
        periodicity: duplicatingBill.periodicity
      });
      setExistingFiles([]);
      setUploadedFiles([]);
    } else {
      resetForm();
    }
  }, [editingBill, duplicatingBill, isOpen, settings.defaultCurrency]);

  const resetForm = () => {
    setFormData({
      title: '',
      amount: '',
      currency: settings.defaultCurrency,
      dueDate: '',
      billTypeId: '',
      status: BillStatus.PENDING,
      periodicity: BillPeriodicity.MONTHLY
    });
    setUploadedFiles([]);
    setExistingFiles([]);
  };

  const handleBillTypeChange = (billTypeId: string) => {
    const billType = billTypes.find(type => type.id === billTypeId);
    setFormData(prev => ({
      ...prev,
      billTypeId,
      // Automatically update periodicity based on selected bill type
      periodicity: billType?.defaultPeriodicity || BillPeriodicity.MONTHLY
    }));
  };

  const removeExistingFile = (fileId: string) => {
    setExistingFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only title, amount, and billTypeId are required
    if (!formData.title || !formData.amount || !formData.billTypeId) {
      return;
    }

    const billType = billTypes.find(type => type.id === formData.billTypeId);
    if (!billType) return;

    // Generate period only if dueDate is provided
    const period = formData.dueDate ? generatePeriodString(formData.periodicity, formData.dueDate) : '';
    
    // Create bill files from uploaded files
    const billFiles = uploadedFiles.map(({ file, fileType }, index) => {
      const tempBill = {
        ...formData,
        period,
        amount: parseFloat(formData.amount)
      } as Bill;
      
      const logicalName = generateLogicalFileName(tempBill, billType, file, fileType, index);
      return createBillFile(file, logicalName, fileType);
    });

    const billData: Bill = {
      id: editingBill?.id || crypto.randomUUID(),
      title: formData.title,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      dueDate: formData.dueDate || '',
      billTypeId: formData.billTypeId,
      status: formData.status,
      periodicity: formData.periodicity,
      period,
      files: [...existingFiles, ...billFiles],
      createdAt: editingBill?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingBill) {
      updateBill(billData);
    } else {
      addBill(billData);
    }

    onSuccess();
    onClose();
    resetForm();
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const getDialogTitle = () => {
    if (editingBill) return 'Modifier la facture';
    if (duplicatingBill) return 'Dupliquer la facture';
    return 'Ajouter une nouvelle facture';
  };

  const getFileTypeLabel = (fileType: FileType) => {
    return fileType === FileType.BILL ? 'Facture' : 'Reçu';
  };

  const getFileTypeColor = (fileType: FileType) => {
    return fileType === FileType.BILL ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Saisir le titre de la facture"
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Montant *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Saisir le montant"
                required
              />
            </div>

            <div>
              <Label htmlFor="currency">Devise</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {settings.availableCurrencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate">Date d'échéance</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="billType">Type de facture *</Label>
              <Select
                value={formData.billTypeId}
                onValueChange={handleBillTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type de facture" />
                </SelectTrigger>
                <SelectContent>
                  {billTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center space-x-2">
                        {type.logo && (
                          <img
                            src={type.logo}
                            alt={type.name}
                            className="w-4 h-4 object-cover rounded"
                          />
                        )}
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="periodicity">Périodicité</Label>
              <Select
                value={formData.periodicity}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  periodicity: value as BillPeriodicity 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BillPeriodicity.ONE_OFF}>Ponctuel</SelectItem>
                  <SelectItem value={BillPeriodicity.MONTHLY}>Mensuel</SelectItem>
                  <SelectItem value={BillPeriodicity.BI_MONTHLY}>Bimestriel</SelectItem>
                  <SelectItem value={BillPeriodicity.QUARTERLY}>Trimestriel</SelectItem>
                  <SelectItem value={BillPeriodicity.SEMI_ANNUALLY}>Semestriel</SelectItem>
                  <SelectItem value={BillPeriodicity.ANNUALLY}>Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  status: value as BillStatus 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BillStatus.PENDING}>En attente</SelectItem>
                  <SelectItem value={BillStatus.PAID}>Payé</SelectItem>
                  <SelectItem value={BillStatus.OVERDUE}>En retard</SelectItem>
                  <SelectItem value={BillStatus.CANCELLED}>Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Existing Files */}
          {existingFiles.length > 0 && (
            <div>
              <Label>Fichiers existants</Label>
              <div className="space-y-2 mt-2">
                {existingFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{file.originalName}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getFileTypeColor(file.fileType)}`}>
                        {getFileTypeLabel(file.fileType)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExistingFile(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label>Nouveaux fichiers</Label>
            <FileUpload
              files={uploadedFiles}
              onFilesChange={setUploadedFiles}
              maxFiles={10}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button type="submit">
              {editingBill ? 'Mettre à jour' : 'Créer la facture'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};