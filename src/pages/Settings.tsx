import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings as SettingsIcon, FileText, Palette } from 'lucide-react';
import { BackupSettings } from '@/components/BackupSettings';

export const Settings: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <SettingsIcon className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Paramètres</h1>
      </div>

      <Tabs defaultValue="backup" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="backup" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Sauvegarde</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Apparence</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-4">
          <BackupSettings />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thème et Apparence</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Les options de personnalisation de l'apparence seront disponibles prochainement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};