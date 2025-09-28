import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Settings, Cloud } from 'lucide-react';
import { Bill, BillStatus, BillType } from '@/types/bill';
import { getBills, getBillTypes, getSettings, saveSettings } from '@/lib/storage';
import { BillForm } from '@/components/BillForm';
import { BillsList } from '@/components/BillsList';
import { BillTypeManager } from '@/components/BillTypeManager';
import { Settings as SettingsPage } from '@/pages/Settings';

export default function Index() {
  const [bills] = useState<Bill[]>(getBills());
  const [billTypes] = useState<BillType[]>(getBillTypes());
  const [settings, setSettings] = useState(getSettings());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bills' | 'types' | 'settings'>('dashboard');
  const [isBillFormOpen, setIsBillFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [duplicatingBill, setDuplicatingBill] = useState<Bill | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [billTypeFilter, setBillTypeFilter] = useState<string>('all');

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setDuplicatingBill(null);
    setIsBillFormOpen(true);
  };

  const handleDuplicateBill = (bill: Bill) => {
    setDuplicatingBill(bill);
    setEditingBill(null);
    setIsBillFormOpen(true);
  };

  const handleAddBill = () => {
    setEditingBill(null);
    setDuplicatingBill(null);
    setIsBillFormOpen(true);
  };

  const handleBillFormClose = () => {
    setIsBillFormOpen(false);
    setEditingBill(null);
    setDuplicatingBill(null);
  };

  const handleBillFormSuccess = () => {
    handleRefresh();
  };

  const handleCurrencyChange = (currency: string) => {
    const newSettings = { ...settings, defaultCurrency: currency };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleBillTypeClick = (billTypeId: string) => {
    setBillTypeFilter(billTypeId);
    setActiveTab('bills');
  };

  const stats = useMemo(() => {
    const totalBills = bills.length;
    const paidBills = bills.filter(bill => bill.status === BillStatus.PAID).length;
    const pendingBills = bills.filter(bill => bill.status === BillStatus.PENDING).length;
    const overdueBills = bills.filter(bill => bill.status === BillStatus.OVERDUE).length;
    
    const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const paidAmount = bills
      .filter(bill => bill.status === BillStatus.PAID)
      .reduce((sum, bill) => sum + bill.amount, 0);
    const pendingAmount = bills
      .filter(bill => bill.status === BillStatus.PENDING)
      .reduce((sum, bill) => sum + bill.amount, 0);

    return {
      totalBills,
      paidBills,
      pendingBills,
      overdueBills,
      totalAmount,
      paidAmount,
      pendingAmount
    };
  }, [bills]);

  const formatCurrency = (amount: number) => {
    if (settings.defaultCurrency === 'DZD') {
      return `${amount.toLocaleString()} DA`;
    }
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: settings.defaultCurrency
      }).format(amount);
    } catch (error) {
      return `${amount.toFixed(2)} ${settings.defaultCurrency}`;
    }
  };

  const billTypeStats = useMemo(() => {
    return billTypes.map(type => {
      const typeBills = bills.filter(bill => bill.billTypeId === type.id);
      const totalAmount = typeBills.reduce((sum, bill) => sum + bill.amount, 0);
      return {
        ...type,
        count: typeBills.length,
        totalAmount
      };
    }).filter(stat => stat.count > 0);
  }, [bills, billTypes]);

  const getPeriodicityLabel = (periodicity?: string) => {
    switch (periodicity) {
      case 'monthly': return 'Mensuel';
      case 'bi-monthly': return 'Bimestriel';
      case 'quarterly': return 'Trimestriel';
      case 'semi-annually': return 'Semestriel';
      case 'annually': return 'Annuel';
      case 'one-off': return 'Ponctuel';
      default: return 'Mensuel';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des factures</h1>
            <p className="text-gray-600">Suivez et gérez vos factures efficacement</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Devise par défaut :</span>
              <Select value={settings.defaultCurrency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-20">
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
            <Button onClick={handleAddBill}>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une facture
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('dashboard')}
            className="px-4 py-2"
          >
            Tableau de bord
          </Button>
          <Button
            variant={activeTab === 'bills' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('bills')}
            className="px-4 py-2"
          >
            Gestion des factures
          </Button>
          <Button
            variant={activeTab === 'types' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('types')}
            className="px-4 py-2"
          >
            Types de factures
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('settings')}
            className="px-4 py-2"
          >
            <Cloud className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total des factures</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBills}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stats.totalAmount)} au total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Factures payées</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.paidBills}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stats.paidAmount)} payé
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Factures en attente</CardTitle>
                  <TrendingDown className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingBills}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(stats.pendingAmount)} en attente
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Factures en retard</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.overdueBills}</div>
                  <p className="text-xs text-muted-foreground">
                    Nécessite une attention
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Bill Types Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Aperçu des types de factures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {billTypeStats.map((stat) => (
                    <div
                      key={stat.id}
                      className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      style={{ borderColor: stat.color }}
                      onClick={() => handleBillTypeClick(stat.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {stat.logo && (
                          <img
                            src={stat.logo}
                            alt={stat.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        )}
                        <div>
                          <h3 className="font-medium" style={{ color: stat.color }}>
                            {stat.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {stat.count} facture{stat.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(stat.totalAmount)}</p>
                        <Badge style={{ backgroundColor: stat.color, color: 'white' }}>
                          {getPeriodicityLabel(stat.defaultPeriodicity)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bills Management Tab */}
        {activeTab === 'bills' && (
          <BillsList
            onEdit={handleEditBill}
            onDuplicate={handleDuplicateBill}
            refresh={refreshKey}
            initialFilter={billTypeFilter}
            onFilterChange={setBillTypeFilter}
          />
        )}

        {/* Bill Types Tab */}
        {activeTab === 'types' && (
          <BillTypeManager
            refresh={refreshKey}
            onRefresh={handleRefresh}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <SettingsPage />
        )}

        {/* Bill Form Dialog */}
        <BillForm
          isOpen={isBillFormOpen}
          onClose={handleBillFormClose}
          onSuccess={handleBillFormSuccess}
          editingBill={editingBill}
          duplicatingBill={duplicatingBill}
        />
      </div>
    </div>
  );
}