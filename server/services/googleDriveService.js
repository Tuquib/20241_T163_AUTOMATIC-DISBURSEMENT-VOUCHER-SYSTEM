import { google } from 'googleapis';
import { serviceAccountConfig } from '../config/serviceAccount.js';

export class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.sheets = null;
    this.ADMIN_EMAIL = '2201102322@student.buksu.edu.ph';
    this.mainFolderId = '1rVxn_qjZUIxMvLf8yVrzQqkZT1ZnCYQ9'; // Set the known folder ID
    this.adminToken = null;
  }

  async initializeWithToken(token, userEmail) {
    try {
      console.log('Initializing Google Drive service for:', userEmail);
      
      // If this is the admin, store their token
      if (userEmail === this.ADMIN_EMAIL) {
        console.log('Storing admin token');
        this.adminToken = token;
      }

      this.auth = new google.auth.OAuth2(
        "1083555345988-qc172fbg8ss4a7ptr55el7enke7g3s4v.apps.googleusercontent.com",
        serviceAccountConfig.client_secret,
        "http://localhost:3000"
      );
      this.auth.setCredentials({ access_token: token });
      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.sheets = google.sheets({ version: 'v4', auth: this.auth });

      // Verify the main folder exists and is accessible
      console.log('Verifying access to main folder:', this.mainFolderId);
      try {
        const folder = await this.drive.files.get({
          fileId: this.mainFolderId,
          fields: 'id, name'
        });
        console.log('Successfully accessed main folder:', folder.data.name);
      } catch (error) {
        console.error('Error accessing main folder:', error.message);
        if (userEmail === this.ADMIN_EMAIL) {
          // Admin can create a new folder if needed
          console.log('Creating new main folder as admin...');
          const folderMetadata = {
            name: 'Disbursement Voucher',
            mimeType: 'application/vnd.google-apps.folder'
          };

          const newFolder = await this.drive.files.create({
            resource: folderMetadata,
            fields: 'id'
          });

          this.mainFolderId = newFolder.data.id;
          console.log('Created new main folder:', this.mainFolderId);

          // Set folder permissions
          await this.drive.permissions.create({
            fileId: this.mainFolderId,
            requestBody: {
              role: 'reader',
              type: 'anyone',
              allowFileDiscovery: true
            }
          });
          console.log('Set main folder permissions');
        } else {
          throw new Error('Cannot access Disbursement Voucher folder. Please contact admin for access.');
        }
      }

      console.log('Google Drive service initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Drive service:', error);
      throw error;
    }
  }

  async findStaffFolder(staffEmail) {
    try {
      if (!this.mainFolderId) {
        // Try to find the main folder first
        const response = await this.drive.files.list({
          q: "mimeType='application/vnd.google-apps.folder' and name='Disbursement Voucher' and trashed=false",
          fields: 'files(id, name)',
          spaces: 'drive'
        });

        if (response.data.files && response.data.files.length > 0) {
          this.mainFolderId = response.data.files[0].id;
          console.log('Found main folder:', this.mainFolderId);
        } else {
          console.error('Main Disbursement Voucher folder not found');
          throw new Error('Main Disbursement Voucher folder not found. Please ensure you have access to the folder.');
        }
      }

      console.log('Finding staff folder for:', staffEmail);
      
      // Look for existing staff folder
      const staffFolderName = `${staffEmail}_DV`;
      const response = await this.drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${staffFolderName}' and '${this.mainFolderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.data.files && response.data.files.length > 0) {
        console.log('Found existing staff folder:', response.data.files[0].id);
        return response.data.files[0].id;
      }

      // Create new staff folder
      console.log('Creating new staff folder...');
      const folderMetadata = {
        name: staffFolderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [this.mainFolderId]
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });

      console.log('Created new staff folder:', folder.data.id);
      
      // Share the folder with the staff member
      await this.shareWithStaff(folder.data.id, staffEmail);
      
      return folder.data.id;
    } catch (error) {
      console.error('Error in findStaffFolder:', error);
      throw error;
    }
  }

  async shareWithStaff(fileId, staffEmail) {
    try {
      console.log(`Sharing file ${fileId} with staff ${staffEmail}`);

      // First share with write access
      await this.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: staffEmail
        }
      });

      // Then transfer ownership with correct parameters
      await this.drive.permissions.create({
        fileId: fileId,
        transferOwnership: true,
        requestBody: {
          role: 'owner',
          type: 'user',
          emailAddress: staffEmail
        }
      });

      console.log(`Successfully transferred ownership to ${staffEmail}`);
    } catch (error) {
      console.error('Error sharing with staff:', error);
      throw error;
    }
  }

  async shareFileWithAdmin(fileId) {
    try {
      console.log(`Sharing file ${fileId} with admin ${this.ADMIN_EMAIL}`);
      await this.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'writer',
          type: 'user',
          emailAddress: this.ADMIN_EMAIL
        }
      });
      console.log('Successfully shared with admin');
    } catch (error) {
      console.error('Error sharing with admin:', error);
      throw error;
    }
  }

  async createSpreadsheet(staffEmail, voucherNumber) {
    try {
      console.log('Creating spreadsheet for staff:', staffEmail);
      
      // Check if staff folder exists in main folder
      const staffFolderName = `${staffEmail}_DV`;
      let staffFolderId;

      const response = await this.drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${staffFolderName}' and '${this.mainFolderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.data.files && response.data.files.length > 0) {
        staffFolderId = response.data.files[0].id;
        console.log('Found existing staff folder:', staffFolderId);
      } else {
        // Create new staff folder in main folder
        console.log('Creating new staff folder...');
        const folderMetadata = {
          name: staffFolderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [this.mainFolderId]
        };

        const newFolder = await this.drive.files.create({
          resource: folderMetadata,
          fields: 'id'
        });

        staffFolderId = newFolder.data.id;
        console.log('Created new staff folder:', staffFolderId);
      }

      // Create spreadsheet in staff folder
      const resource = {
        name: voucherNumber,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [staffFolderId]
      };

      const spreadsheet = await this.drive.files.create({
        resource,
        fields: 'id, webViewLink',
        supportsAllDrives: true
      });

      console.log('Created spreadsheet:', spreadsheet.data);

      // Share with staff and admin
      await this.shareWithStaff(spreadsheet.data.id, staffEmail);
      await this.shareFileWithAdmin(spreadsheet.data.id);

      return {
        fileId: spreadsheet.data.id,
        webViewLink: spreadsheet.data.webViewLink
      };
    } catch (error) {
      console.error('Error creating spreadsheet:', error);
      throw error;
    }
  }

  async updateSpreadsheetContent(spreadsheetId, voucherData) {
    try {
      const values = [
        ['Disbursement Voucher Details'],
        ['DV Number', voucherData.dvNumber],
        ['Entity Name', voucherData.entityName],
        ['Fund Cluster', voucherData.fundCluster],
        ['Date', new Date().toLocaleDateString()],
        ['Mode of Payment', voucherData.modeOfPayment],
        ['Payee', voucherData.payee],
        ['TIN/Employee No.', voucherData.tinNo],
        ['BUR No.', voucherData.burNo],
        ['Address', voucherData.address],
        ['Particulars', voucherData.particulars],
        ['Amount', voucherData.amount],
      ];

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'A1:B12',
        valueInputOption: 'RAW',
        resource: { values },
      });

      console.log('Updated spreadsheet content');
    } catch (error) {
      console.error('Error updating spreadsheet content:', error);
      throw error;
    }
  }

  async listVouchers(staffEmail) {
    try {
      // Get or create the staff's folder
      const staffFolderId = await this.findStaffFolder(staffEmail);
      if (!staffFolderId) {
        console.log('Could not find staff folder');
        return [];
      }

      console.log('Listing vouchers from folder:', staffFolderId);

      // List all spreadsheets in the staff's folder
      const response = await this.drive.files.list({
        q: `'${staffFolderId}' in parents and trashed=false`,
        fields: 'files(id, name, createdTime, modifiedTime, webViewLink)',
        orderBy: 'createdTime desc',
        includeItemsFromAllDrives: true,
        supportsAllDrives: true
      });

      const files = response.data.files || [];
      console.log('Found files:', files);
      return files;
    } catch (error) {
      console.error('Error listing vouchers:', error);
      throw error;
    }
  }

  async createStaffFolder(staffEmail, accessToken) {
    try {
      console.log('Creating staff folder for:', staffEmail);
      
      // Use admin token if available, otherwise use provided token
      const token = this.adminToken || accessToken;
      if (!token) {
        throw new Error('No valid token available. Admin must log in first.');
      }

      // Initialize with the appropriate token
      await this.initializeWithToken(token, this.adminToken ? this.ADMIN_EMAIL : staffEmail);
      
      // Check if staff folder exists
      const staffFolderName = `${staffEmail}_DV`;
      const response = await this.drive.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${staffFolderName}' and '${this.mainFolderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      if (response.data.files && response.data.files.length > 0) {
        console.log('Found existing staff folder:', response.data.files[0].id);
        return response.data.files[0].id;
      }

      // Create new staff folder
      console.log('Creating new staff folder...');
      const folderMetadata = {
        name: staffFolderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [this.mainFolderId]
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });

      console.log('Created new staff folder:', folder.data.id);
      
      // Share the folder with the staff member
      await this.shareWithStaff(folder.data.id, staffEmail);
      await this.shareFileWithAdmin(folder.data.id);

      return folder.data.id;
    } catch (error) {
      console.error('Error creating staff folder:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const googleDriveService = new GoogleDriveService();
