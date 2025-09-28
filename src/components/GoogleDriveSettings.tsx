import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Cloud, CloudOff, Download, Upload, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { googleDriveService } from '@/lib/googleDrive';
import { getBills, getBillTypes, getSettings, saveSettings } from '@/lib/storage';
import { BackupData, GoogleDriveFile } from '@/types/bill';

export const GoogleDriveSettings: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [backups, setBackups] = useState<GoogleDriveFile[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  useEffect(() => {
    if (isConnected) {
      loadBackups();
    }
  }, [isConnected]);

  const checkConnectionStatus = async () => {
    setIsLoading(true);
    try {
      await googleDriveService.initialize();
      setIsConnected(googleDriveService.isConnected());
    } catch (error: any) {
      console.error('Initialization error:', error);
      setError(`Erreur d'initialisation: ${error.message}`);
    }
    setIsLoading(false);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const success = await googleDriveService.signIn();
      if (success) {
        setIsConnected(true);
        setSuccess('Connecté à Google Drive avec succès');
        
        // Update settings
        const settings = getSettings();
        settings.googleDriveConnected = true;
        saveSettings(settings);
        
        await loadBackups();
      } else {
        setError('Échec de la connexion à Google Drive');
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      setError(`Erreur de connexion: ${error.message}`);
    }
    setIsLoading(false);
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await googleDriveService.signOut();
      setIsConnected(false);
      setBackups([]);
      setSuccess('Déconnecté de Google Drive');
      
      // Update settings
      const settings = getSettings();
      settings.googleDriveConnected = false;
      saveSettings(settings);
    } catch (error: any) {
      setError(`Erreur de déconnexion: ${error.message}`);
    }
    setIsLoading(false);
  };

  const loadBackups = async () => {
    try {
      const files = await googleDriveService.listFiles('and name contains "backup_"');
      setBackups(files);
    } catch (error: any) {
      setError(`Erreur de chargement: ${error.message}`);
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const backupData: BackupData = {
        bills: getBills(),
        billTypes: getBillTypes(),
        settings: getSettings(),
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };

      const fileId = await googleDriveService.backupData(backupData);
      if (fileId) {
        setSuccess('Sauvegarde créée avec succès');
        await loadBackups();
      } else {
        setError('Échec de la création de la sauvegarde');
      }
    } catch (error: any) {
      setError(`Erreur de sauvegarde: ${error.message}`);
    }
    setIsLoading(false);
  };

  const handleRestore = async (fileId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir restaurer cette sauvegarde ? Cela remplacera toutes vos données actuelles.')) {
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const backupData = await googleDriveService.restoreData(fileId);
      if (backupData) {
        localStorage.setItem('bills', JSON.stringify(backupData.bills));
        localStorage.setItem('billTypes', JSON.stringify(backupData.billTypes));
        localStorage.setItem('settings', JSON.stringify(backupData.settings));
        
        setSuccess('Données restaurées avec succès. Rechargez la page pour voir les changements.');
      } else {
        setError('Échec de la restauration des données');
      }
    } catch (error: any) {
      setError(`Erreur de restauration: ${error.message}`);
    }
    setIsLoading(false);
  };

  const handleDeleteBackup = async (fileId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) {
      return;
    }

    setIsLoading(true);
    try {
      const success = await googleDriveService.deleteFile(fileId);
      if (success) {
        setSuccess('Sauvegarde supprimée');
        await loadBackups();
      } else {
        setError('Échec de la suppression');
      }
    } catch (error: any) {
      setError(`Erreur de suppression: ${error.message}`);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (size?: string) => {
    if (!size) return 'N/A';
    const bytes = parseInt(size);
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isConnected ? <Cloud className="w-5 h-5" /> : <CloudOff className="w-5 h-5" />}
            <span>Intégration Google Drive</span>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            {!isConnected ? (
              <Button onClick={handleConnect} disabled={isLoading}>
                {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Cloud className="w-4 h-4 mr-2" />}
                Se connecter à Google Drive
              </Button>
            ) : (
              <>
                <Button onClick={handleBackup} disabled={isLoading}>
                  {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Créer une sauvegarde
                </Button>
                <Button variant="outline" onClick={handleDisconnect} disabled={isLoading}>
                  Se déconnecter
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Sauvegardes disponibles
              <Button variant="outline" size="sm" onClick={loadBackups} disabled={isLoading}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {backups.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Aucune sauvegarde trouvée. Créez votre première sauvegarde.
              </p>
            ) : (
              <div className="space-y-2">
                {backups.map((backup) => (
                  <div key={backup.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{backup.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(backup.modifiedTime)} • {formatFileSize(backup.size)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(backup.id)}
                        disabled={isLoading}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Restaurer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBackup(backup.id)}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};