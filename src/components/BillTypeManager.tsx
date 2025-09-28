import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { BillType, BillPeriodicity } from '@/types/bill';
import { getBillTypes, addBillType, updateBillType, deleteBillType } from '@/lib/storage';

interface BillTypeManagerProps {
  refresh: number;
  onRefresh: () => void;
}

export const BillTypeManager: React.FC<BillTypeManagerProps> = ({ refresh, onRefresh }) => {
  const [billTypes, setBillTypes] = useState<BillType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<BillType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6',
    defaultPeriodicity: BillPeriodicity.MONTHLY,
    logo: ''
  });

  useEffect(() => {
    setBillTypes(getBillTypes());
  }, [refresh]);

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3b82f6',
      defaultPeriodicity: BillPeriodicity.MONTHLY,
      logo: ''
    });
    setEditingType(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    const billTypeData: BillType = {
      id: editingType?.id || crypto.randomUUID(),
      name: formData.name.trim(),
      color: formData.color,
      defaultPeriodicity: formData.defaultPeriodicity,
      logo: formData.logo || undefined
    };

    if (editingType) {
      updateBillType(billTypeData);
    } else {
      addBillType(billTypeData);
    }

    setBillTypes(getBillTypes());
    setIsDialogOpen(false);
    resetForm();
    onRefresh();
  };

  const handleEdit = (billType: BillType) => {
    setEditingType(billType);
    setFormData({
      name: billType.name,
      color: billType.color,
      defaultPeriodicity: billType.defaultPeriodicity || BillPeriodicity.MONTHLY,
      logo: billType.logo || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (billTypeId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce type de facture ?')) {
      deleteBillType(billTypeId);
      setBillTypes(getBillTypes());
      onRefresh();
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          logo: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const getPeriodicityLabel = (periodicity: BillPeriodicity) => {
    switch (periodicity) {
      case BillPeriodicity.ONE_OFF: return 'Ponctuel';
      case BillPeriodicity.MONTHLY: return 'Mensuel';
      case BillPeriodicity.BI_MONTHLY: return 'Bimestriel';
      case BillPeriodicity.QUARTERLY: return 'Trimestriel';
      case BillPeriodicity.SEMI_ANNUALLY: return 'Semestriel';
      case BillPeriodicity.ANNUALLY: return 'Annuel';
      default: return 'Mensuel';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Aperçu des Types de Factures
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un Type de Facture
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingType ? 'Modifier le Type de Facture' : 'Ajouter un Nouveau Type de Facture'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Entrez le nom du type de facture"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="color">Couleur</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-20"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="defaultPeriodicity">Périodicité par Défaut</Label>
                  <Select
                    value={formData.defaultPeriodicity}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      defaultPeriodicity: value as BillPeriodicity 
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
                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.logo && (
                    <div className="mt-2">
                      <img
                        src={formData.logo}
                        alt="Aperçu du logo"
                        className="w-12 h-12 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingType ? 'Mettre à Jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {billTypes.map((billType) => (
            <div
              key={billType.id}
              className="border rounded-lg p-4 space-y-3"
              style={{ borderColor: billType.color }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {billType.logo && (
                    <img
                      src={billType.logo}
                      alt={billType.name}
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <h3 className="font-medium" style={{ color: billType.color }}>
                    {billType.name}
                  </h3>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(billType)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(billType.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge
                  style={{ backgroundColor: billType.color, color: 'white' }}
                  className="text-xs"
                >
                  {billType.color}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getPeriodicityLabel(billType.defaultPeriodicity || BillPeriodicity.MONTHLY)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};