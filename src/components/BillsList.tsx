import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Eye, Calendar, FilterX, Copy } from 'lucide-react';
import { Bill, BillStatus, BillPeriodicity, BillFilters, BillType, BillFile } from '@/types/bill';
import { getBills, getBillTypes, deleteBill } from '@/lib/storage';

interface BillsListProps {
  onEdit: (bill: Bill) => void;
  onDuplicate: (bill: Bill) => void;
  refresh: number;
  initialBillTypeFilter?: string;
  onFilterChange?: (billTypeId: string) => void;
}

const BILLS_PER_PAGE = 10;

export const BillsList: React.FC<BillsListProps> = ({ 
  onEdit, 
  onDuplicate, 
  refresh, 
  initialBillTypeFilter = 'all',
  onFilterChange 
}) => {
  const [bills, setBills] = useState<Bill[]>(getBills());
  const [billTypes] = useState<BillType[]>(getBillTypes());
  const [visibleCounts, setVisibleCounts] = useState<{ [key: string]: number }>({});
  const [filters, setFilters] = useState<BillFilters>({
    search: '',
    status: 'all',
    billTypeId: initialBillTypeFilter,
    startDate: '',
    endDate: '',
    periodicity: 'all'
  });

  useEffect(() => {
    setBills(getBills());
    setVisibleCounts({});
  }, [refresh]);

  useEffect(() => {
    if (initialBillTypeFilter !== 'all') {
      setFilters(prev => ({ ...prev, billTypeId: initialBillTypeFilter }));
    }
  }, [initialBillTypeFilter]);

  const clearFilters = () => {
    const newFilters = {
      search: '',
      status: 'all',
      billTypeId: 'all',
      startDate: '',
      endDate: '',
      periodicity: 'all'
    };
    setFilters(newFilters);
    setVisibleCounts({});
    onFilterChange?.('all');
  };

  const handleBillTypeFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, billTypeId: value }));
    onFilterChange?.(value);
  };

  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      const matchesSearch = bill.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === 'all' || bill.status === filters.status;
      const matchesBillType = filters.billTypeId === 'all' || bill.billTypeId === filters.billTypeId;
      const matchesPeriodicity = filters.periodicity === 'all' || bill.periodicity === filters.periodicity;
      
      let matchesDateRange = true;
      if (filters.startDate && filters.endDate) {
        const billDate = new Date(bill.dueDate);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        matchesDateRange = billDate >= startDate && billDate <= endDate;
      }

      return matchesSearch && matchesStatus && matchesBillType && matchesPeriodicity && matchesDateRange;
    });
  }, [bills, filters]);

  const groupedBills = useMemo(() => {
    const groups: { [key: string]: { billType: BillType; bills: Bill[] } } = {};
    
    filteredBills.forEach(bill => {
      const billType = billTypes.find(type => type.id === bill.billTypeId);
      if (billType) {
        if (!groups[billType.id]) {
          groups[billType.id] = { billType, bills: [] };
        }
        groups[billType.id].bills.push(bill);
      }
    });

    return Object.values(groups).sort((a, b) => a.billType.name.localeCompare(b.billType.name));
  }, [filteredBills, billTypes]);

  const handleDelete = (billId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      deleteBill(billId);
      setBills(getBills());
    }
  };

  const handleLoadMore = (billTypeId: string) => {
    setVisibleCounts(prev => ({
      ...prev,
      [billTypeId]: (prev[billTypeId] || BILLS_PER_PAGE) + BILLS_PER_PAGE
    }));
  };

  const getVisibleBills = (bills: Bill[], billTypeId: string) => {
    const visibleCount = visibleCounts[billTypeId] || BILLS_PER_PAGE;
    return bills.slice(0, visibleCount);
  };

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case BillStatus.PAID: return 'bg-green-100 text-green-800';
      case BillStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case BillStatus.OVERDUE: return 'bg-red-100 text-red-800';
      case BillStatus.CANCELLED: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: BillStatus) => {
    switch (status) {
      case BillStatus.PAID: return 'Payé';
      case BillStatus.PENDING: return 'En attente';
      case BillStatus.OVERDUE: return 'En retard';
      case BillStatus.CANCELLED: return 'Annulé';
      default: return status;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    try {
      const validCurrency = currency && currency.length === 3 ? currency : 'DZD';
      if (validCurrency === 'DZD') {
        return `${amount.toLocaleString()} DA`;
      }
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: validCurrency
      }).format(amount);
    } catch (error) {
      return `${amount.toFixed(2)} ${currency}`;
    }
  };

  const viewFile = (file: BillFile) => {
    window.open(file.url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gestion des factures
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center space-x-2"
          >
            <FilterX className="w-4 h-4" />
            <span>Effacer les filtres</span>
          </Button>
        </CardTitle>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          <div>
            <Label htmlFor="search">Rechercher</Label>
            <Input
              id="search"
              placeholder="Rechercher des factures..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="status">Statut</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as BillStatus | 'all' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value={BillStatus.PENDING}>En attente</SelectItem>
                <SelectItem value={BillStatus.PAID}>Payé</SelectItem>
                <SelectItem value={BillStatus.OVERDUE}>En retard</SelectItem>
                <SelectItem value={BillStatus.CANCELLED}>Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="billType">Type de facture</Label>
            <Select
              value={filters.billTypeId}
              onValueChange={handleBillTypeFilterChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {billTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="periodicity">Périodicité</Label>
            <Select
              value={filters.periodicity}
              onValueChange={(value) => setFilters(prev => ({ ...prev, periodicity: value as BillPeriodicity | 'all' }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les périodes</SelectItem>
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
            <Label htmlFor="startDate">Date de début</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="endDate">Date de fin</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {groupedBills.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune facture trouvée correspondant à vos filtres.
          </div>
        ) : (
          <div className="space-y-6">
            {groupedBills.map(({ billType, bills }) => {
              const visibleBills = getVisibleBills(bills, billType.id);
              const hasMore = bills.length > visibleBills.length;
              
              return (
                <div key={billType.id}>
                  <div className="flex items-center space-x-3 mb-4">
                    {billType.logo && (
                      <img
                        src={billType.logo}
                        alt={billType.name}
                        className="w-6 h-6 object-cover rounded"
                      />
                    )}
                    <h3 className="text-lg font-semibold" style={{ color: billType.color }}>
                      {billType.name} ({bills.length})
                    </h3>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Titre</TableHead>
                          <TableHead>Montant</TableHead>
                          <TableHead>Période</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Fichiers</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleBills.map((bill) => {
                          const billFiles = bill.files || [];
                          return (
                            <TableRow key={bill.id}>
                              <TableCell className="font-medium">{bill.title}</TableCell>
                              <TableCell>{formatCurrency(bill.amount, bill.currency)}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>{bill.period}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(bill.status)}>
                                  {getStatusLabel(bill.status)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm text-gray-600">
                                    {billFiles.length} fichier{billFiles.length !== 1 ? 's' : ''}
                                  </span>
                                  {billFiles.length > 0 && (
                                    <div className="flex space-x-1">
                                      {billFiles.slice(0, 3).map((file, index) => (
                                        <Button
                                          key={file.id}
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => viewFile(file)}
                                          className="h-6 w-6 p-0"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </Button>
                                      ))}
                                      {billFiles.length > 3 && (
                                        <span className="text-xs text-gray-500">+{billFiles.length - 3}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(bill)}
                                    title="Modifier la facture"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDuplicate(bill)}
                                    title="Dupliquer la facture"
                                    className="text-blue-500 hover:text-blue-700"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(bill.id)}
                                    title="Supprimer la facture"
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {hasMore && (
                    <div className="flex justify-center mt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleLoadMore(billType.id)}
                        className="flex items-center space-x-2"
                      >
                        <span>Charger plus ({bills.length - visibleBills.length} restantes)</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};