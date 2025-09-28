import { BackupData, GoogleDriveFile } from '@/types/bill';

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

class GoogleDriveService {
  private isInitialized = false;
  private isSignedIn = false;
  private clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) return true;

      if (!this.clientId) {
        throw new Error('Client ID manquant');
      }

      // Load Google Identity Services
      await this.loadGoogleIdentityScript();
      
      // Load Google API script
      await this.loadGoogleAPIScript();
      
      // Wait for both to be ready
      await this.waitForAPIs();
      
      // Initialize Google API client
      await this.initializeGoogleAPI();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Initialization error:', error);
      throw error;
    }
  }

  private loadGoogleIdentityScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity script'));
      document.head.appendChild(script);
    });
  }

  private loadGoogleAPIScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(script);
    });
  }

  private waitForAPIs(): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 50;

      const check = () => {
        if (window.gapi && window.google?.accounts && typeof window.gapi.load === 'function') {
          resolve();
        } else if (attempts >= maxAttempts) {
          reject(new Error('APIs not ready'));
        } else {
          attempts++;
          setTimeout(check, 100);
        }
      };

      check();
    });
  }

  private initializeGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      window.gapi.load('client', async () => {
        try {
          await window.gapi.client.init({
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      return new Promise((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.clientId,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }
            
            // Set the access token for gapi client
            window.gapi.client.setToken({
              access_token: response.access_token
            });
            
            this.isSignedIn = true;
            resolve(true);
          },
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    if (this.isSignedIn) {
      const token = window.gapi.client.getToken();
      if (token) {
        window.google.accounts.oauth2.revoke(token.access_token);
        window.gapi.client.setToken(null);
      }
      this.isSignedIn = false;
    }
  }

  isConnected(): boolean {
    return this.isSignedIn && !!window.gapi?.client?.getToken();
  }

  async uploadFile(name: string, content: string, mimeType: string = 'application/json'): Promise<string | null> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to Google Drive');
      }

      const boundary = '-------314159265358979323846';
      const delimiter = "\r\n--" + boundary + "\r\n";
      const close_delim = "\r\n--" + boundary + "--";

      const metadata = {
        name: name,
        parents: ['appDataFolder']
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + mimeType + '\r\n\r\n' +
        content +
        close_delim;

      const request = await window.gapi.client.request({
        path: 'https://www.googleapis.com/upload/drive/v3/files',
        method: 'POST',
        params: { uploadType: 'multipart' },
        headers: {
          'Content-Type': 'multipart/related; boundary="' + boundary + '"'
        },
        body: multipartRequestBody
      });

      return request.result.id;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  }

  async downloadFile(fileId: string): Promise<string | null> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to Google Drive');
      }

      const response = await window.gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });

      return response.body;
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  }

  async listFiles(query: string = ''): Promise<GoogleDriveFile[]> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to Google Drive');
      }

      const response = await window.gapi.client.drive.files.list({
        q: `parents in 'appDataFolder' ${query}`,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime)'
      });

      return response.result.files || [];
    } catch (error) {
      console.error('List files error:', error);
      return [];
    }
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      if (!this.isConnected()) {
        throw new Error('Not connected to Google Drive');
      }

      await window.gapi.client.drive.files.delete({
        fileId: fileId
      });

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  async backupData(data: BackupData): Promise<string | null> {
    const fileName = `backup_${new Date().toISOString().split('T')[0]}.json`;
    const content = JSON.stringify(data, null, 2);
    return await this.uploadFile(fileName, content);
  }

  async restoreData(fileId: string): Promise<BackupData | null> {
    try {
      const content = await this.downloadFile(fileId);
      if (content) {
        return JSON.parse(content) as BackupData;
      }
      return null;
    } catch (error) {
      console.error('Restore error:', error);
      return null;
    }
  }

  async uploadReceiptFile(file: File, billId: string): Promise<string | null> {
    try {
      const fileName = `receipt_${billId}_${file.name}`;
      const content = await this.fileToBase64(file);
      return await this.uploadFile(fileName, content, file.type);
    } catch (error) {
      console.error('Receipt upload error:', error);
      return null;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
    });
  }
}

export const googleDriveService = new GoogleDriveService();