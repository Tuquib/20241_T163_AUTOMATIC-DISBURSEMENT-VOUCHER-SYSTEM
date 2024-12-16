import { useEffect } from 'react';

// Google API credentials
const API_KEY = "AIzaSyBpFglT36khvpdYzAClcKzC7FQAKmCqTLo";
const CLIENT_ID = "1083555345988-gn8aofa2r66795u3h7htnku217gfr1qj.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";
const DISCOVERY_DOC = "https://sheets.googleapis.com/$discovery/rest?version=v4";

// Initialize the Google API client
export const initGoogleAPI = async () => {
  try {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    await new Promise((resolve, reject) => {
      window.gapi.load('client', { callback: resolve, onerror: reject });
    });

    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });

    // Get the token from localStorage
    const token = localStorage.getItem('googleToken');
    if (!token) {
      throw new Error('No Google token found. Please log in first.');
    }

    // Set the token for gapi
    window.gapi.client.setToken({
      access_token: token
    });

    console.log('Google API initialized successfully');
  } catch (error) {
    console.error('Error initializing Google API:', error);
    throw new Error('Failed to initialize Google API');
  }
};

// Get access token from localStorage
const getAccessToken = async () => {
  const token = localStorage.getItem('googleToken');
  if (!token) {
    throw new Error('No Google token found. Please log in first.');
  }
  return token;
};

// Write data to Google Sheets
export const writeDataToGoogleSheet = async (SPREADSHEET_ID, updates) => {
  try {
    // Get a fresh access token
    const accessToken = await getAccessToken();
    
    // Update the sheets API with the new token
    window.gapi.client.setToken({ access_token: accessToken });

    // Process each update individually
    for (const update of updates) {
      const response = await window.gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: update.range,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: update.values
        }
      });
      console.log(`Updated ${update.range}:`, response.result);
    }

    console.log('All updates completed successfully');
    return true;
  } catch (error) {
    console.error('Error writing to Google Sheets:', error);
    throw error;
  }
};

// Format DV form data for Google Sheets
export const formatDVFormData = (formData, fundCluster, dvNumber) => {
  const updates = [
    {
      range: "DV!A5:AA5",
      values: [[formData.entityName]]
    },
    {
      range: "DV!AB6:AG6",
      values: [[fundCluster]]
    },
    {
      range: "DV!AB7:AG7",
      values: [[formData.date]]
    },
    {
      range: "DV!AB9:AG9",
      values: [[dvNumber]]
    },
    {
      range: "DV!E13:R14",
      values: [[formData.payeeName]]
    },
    {
      range: "DV!S14:AA14",
      values: [[formData.tinNumber]]
    },
    {
      range: "DV!AB14:AG14",
      values: [[formData.bursNumber]]
    },
    {
      range: "DV!E15:AG16",
      values: [[formData.address]]
    },
    {
      range: "DV!A19:Q21",
      values: [[formData.particulars]]
    },
    {
      range: "DV!R19:V21",
      values: [[formData.responsibilityCenter]]
    },
    {
      range: "DV!W19:AA21",
      values: [[formData.mfoPap]]
    },
    {
      range: "DV!W19:AA21",
      values: [[formData.burs]]
    },
    {
      range: "DV!AB24:AG24",
      values: [[formData.amount]]
    }
  ];

  // Add mode of payment checkbox
  // First, clear all checkbox cells
  const checkboxCells = ["G11", "L11", "F11", "S11"];
  checkboxCells.forEach(cell => {
    updates.push({
      range: `DV!${cell}`,
      values: [[""]]  // Clear the cell
    });
  });

  // Then set the selected checkbox
  const modeOfPaymentCell = 
    formData.modeOfPayment === "MDS Check" ? "G11" :
    formData.modeOfPayment === "Commercial Check" ? "L11" :
    formData.modeOfPayment === "ADA" ? "S11" : "S11";
  
  updates.push({
    range: `DV!${modeOfPaymentCell}`,
    values: [["✓"]]
  });

  return updates;
};

// Read data from Google Sheets
export const readFromGoogleSheet = async (SPREADSHEET_ID) => {
  try {
    // Get a fresh access token
    const accessToken = await getAccessToken();

    // Update the sheets API with the new token
    window.gapi.client.setToken({ access_token: accessToken });

    // Make the API request using gapi client instead of fetch
    const response = await window.gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    console.log('Data read successfully:', response.result);
    return response.result.values;
  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
    throw error;
  }
};

// Initialize Google Drive API
const initGoogleDriveAPI = async () => {
  try {
    const token = localStorage.getItem('googleToken');
    if (!token) {
      throw new Error('No access token available');
    }

    // Initialize the client
    await window.gapi.client.init({
      apiKey: 'AIzaSyBpFglT36khvpdYzAClcKzC7FQAKmCqTLo',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    });

    // Set the OAuth token
    window.gapi.client.setToken({ access_token: token });
    
    console.log('Google Drive API initialized');
  } catch (error) {
    console.error('Error initializing Google Drive API:', error);
    throw error;
  }
};

// Create or get the Disbursement Voucher folder
const getDVFolder = async () => {
  try {
    console.log('Starting getDVFolder...');
    const token = localStorage.getItem('googleToken');
    if (!token) {
      throw new Error('No access token available');
    }
    console.log('Got token from localStorage');

    // Use fetch API instead of gapi client
    console.log('Searching for existing folder...');
    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?q=name%3D%27Disbursement%20Voucher%27%20and%20mimeType%3D%27application%2Fvnd.google-apps.folder%27%20and%20trashed%3Dfalse&spaces=drive&fields=files(id%2C%20name)',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Search response not OK:', response.status, response.statusText);
      throw new Error(`Failed to search for folder: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Search response data:', data);
    
    if (data.files && data.files.length > 0) {
      console.log('Found existing DV folder:', data.files[0]);
      return data.files[0].id;
    }

    // Create new folder if it doesn't exist
    console.log('No existing folder found, creating new one...');
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Disbursement Voucher',
          mimeType: 'application/vnd.google-apps.folder',
        }),
      }
    );

    if (!createResponse.ok) {
      console.error('Create response not OK:', createResponse.status, createResponse.statusText);
      throw new Error(`Failed to create folder: ${createResponse.statusText}`);
    }

    const folder = await createResponse.json();
    console.log('Created new DV folder:', folder);
    return folder.id;
  } catch (error) {
    console.error('Error with DV folder:', error);
    throw error;
  }
};

// Create or get the staff's subfolder
const getStaffSubfolder = async (folderId) => {
  try {
    const token = localStorage.getItem('googleToken');
    if (!token) {
      throw new Error('No access token available');
    }

    const staffEmail = localStorage.getItem('userEmail');
    const staffName = localStorage.getItem('userName');

    if (!staffEmail || !staffName) {
      throw new Error('Missing required authentication data');
    }

    // Use fetch API instead of gapi client
    console.log('Searching for existing staff subfolder...');
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name%3D%27${staffName}%27%20and%20mimeType%3D%27application%2Fvnd.google-apps.folder%27%20and%20trashed%3Dfalse%20and%20%27${folderId}%27%20in%20parents&spaces=drive&fields=files(id%2C%20name)`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Search response not OK:', response.status, response.statusText);
      throw new Error(`Failed to search for staff subfolder: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Search response data:', data);
    
    if (data.files && data.files.length > 0) {
      console.log('Found existing staff subfolder:', data.files[0]);
      return data.files[0].id;
    }

    // Create new staff subfolder if it doesn't exist
    console.log('No existing staff subfolder found, creating new one...');
    const createResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: staffName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [folderId]
        }),
      }
    );

    if (!createResponse.ok) {
      console.error('Create response not OK:', createResponse.status, createResponse.statusText);
      throw new Error(`Failed to create staff subfolder: ${createResponse.statusText}`);
    }

    const staffSubfolder = await createResponse.json();
    console.log('Created new staff subfolder:', staffSubfolder);
    return staffSubfolder.id;
  } catch (error) {
    console.error('Error with staff subfolder:', error);
    throw error;
  }
};

// Export spreadsheet to Drive
export const exportToPDF = async (spreadsheetId, sheetName, dvNumber, formData) => {
  try {
    const token = localStorage.getItem('googleToken');
    const staffEmail = localStorage.getItem('userEmail');
    
    if (!token || !staffEmail) {
      throw new Error('Missing authentication data');
    }

    console.log('Starting exportToPDF for staff:', staffEmail);

    // Get or create staff folder through server
    const createFolderResponse = await fetch('/api/vouchers/create-staff-folder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: token,
        staffEmail: staffEmail
      })
    });

    if (!createFolderResponse.ok) {
      const errorData = await createFolderResponse.json();
      console.error('Failed to create staff folder:', errorData);
      throw new Error(errorData.details || 'Failed to create staff folder');
    }

    const { folderId: staffFolderId } = await createFolderResponse.json();
    console.log('Using staff folder:', staffFolderId);

    // Create the spreadsheet in the staff's folder
    const copyResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files/' + spreadsheetId + '/copy',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `DV_${dvNumber}_${formData.entityName}`,
          parents: [staffFolderId]
        })
      }
    );

    if (!copyResponse.ok) {
      const errorData = await copyResponse.json();
      console.error('Spreadsheet creation error:', errorData);
      throw new Error(`Failed to create spreadsheet: ${errorData.error?.message || copyResponse.statusText}`);
    }

    const copyData = await copyResponse.json();
    console.log('Successfully created spreadsheet:', copyData);

    return copyData;
  } catch (error) {
    console.error('Error in exportToPDF:', error);
    throw error;
  }
};
