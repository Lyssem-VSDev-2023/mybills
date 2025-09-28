import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { getBills, getBillTypes, getSettings } from '@/lib/storage';
import { BackupData } from '@/types/bill';

export const BackupSettings: React.FC = () => {
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleExportBackup = () => {
    try {
      const backupData: BackupData = {
        bills: getBills(),
        billTypes: getBillTypes(),
        settings: getSettings(),
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `factures_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess('✅ Sauvegarde exportée avec succès! Le fichier a été téléchargé.');
      setError('');
    } catch (error) {
      setError('❌ Erreur lors de l\'export de la sauvegarde');
      setSuccess('');
    }
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backupData: BackupData = JSON.parse(content);
        
        // Validate backup data structure
        if (!backupData.bills || !backupData.billTypes || !backupData.settings) {
          throw new Error('Format de sauvegarde invalide');
        }

        // Restore data to localStorage
        localStorage.setItem('bills', JSON.stringify(backupData.bills));
        localStorage.setItem('billTypes', JSON.stringify(backupData.billTypes));
        localStorage.setItem('settings', JSON.stringify(backupData.settings));
        
        setSuccess('✅ Données restaurées avec succès! Rechargez la page pour voir les changements.');
        setError('');
        
        // Clear the file input
        event.target.value = '';
      } catch (error) {
        setError('❌ Erreur lors de l\'import: fichier de sauvegarde invalide ou corrompu');
        setSuccess('');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer TOUTES vos données ? Cette action est irréversible!')) {
      return;
    }

    if (!confirm('🚨 DERNIÈRE CONFIRMATION: Toutes vos factures et paramètres seront perdus définitivement!')) {
      return;
    }

    try {
      localStorage.removeItem('bills');
      localStorage.removeItem('billTypes');
      localStorage.removeItem('settings');
      
      setSuccess('✅ Toutes les données ont été supprimées. Rechargez la page pour recommencer.');
      setError('');
    } catch (error) {
      setError('❌ Erreur lors de la suppression des données');
      setSuccess('');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Sauvegarde et Restauration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> L'intégration Google Drive nécessite une validation Google. 
              En attendant, utilisez cette solution de sauvegarde locale.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <h4 className="font-medium">📥 Exporter vos données</h4>
              <p className="text-sm text-gray-600">
                Téléchargez un fichier de sauvegarde de toutes vos factures et paramètres.
              </p>
              <Button onClick={handleExportBackup} className="w-fit">
                <Download className="w-4 h-4 mr-2" />
                Télécharger la sauvegarde
              </Button>
            </div>

            <div className="flex flex-col space-y-2">
              <h4 className="font-medium">📤 Importer une sauvegarde</h4>
              <p className="text-sm text-gray-600">
                Restaurez vos données à partir d'un fichier de sauvegarde précédent.
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                  id="backup-import"
                />
                <label htmlFor="backup-import">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Choisir un fichier
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-2">🌐 Stockage Cloud Manuel</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Cliquez sur "Télécharger la sauvegarde" pour exporter vos données</li>
                <li>Sauvegardez le fichier sur Google Drive, Dropbox, ou tout autre service cloud</li>
                <li>Pour restaurer: téléchargez le fichier depuis votre cloud et utilisez "Choisir un fichier"</li>
              </ol>
            </div>

            <div className="border-t pt-4 mt-4 border-red-200">
              <h4 className="font-medium mb-2 text-red-600">🗑️ Zone de Danger</h4>
              <p className="text-sm text-gray-600 mb-2">
                Supprimer définitivement toutes vos données de l'application.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleClearData}
                className="w-fit"
              >
                Supprimer toutes les données
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};