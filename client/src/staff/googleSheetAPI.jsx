import { useEffect } from "react";

// Constants at the top of the file
const API_KEY = "AIzaSyBpFglT36khvpdYzAClcKzC7FQAKmCqTLo";
const CLIENT_ID = "1083555345988-gn8aofa2r66795u3h7htnku217gfr1qj.apps.googleusercontent.com";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";
const DISCOVERY_DOC = "https://sheets.googleapis.com/$discovery/rest?version=v4";
const SPREADSHEET_ID = "1dFqPinG16buAgBpzdtPV1ClZlad1lFiwLj0FYEJeeEI";

// Initialize the Google API client
export const initGoogleAPI = async () => {
  try {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    await new Promise((resolve, reject) => {
      window.gapi.load("client", { callback: resolve, onerror: reject });
    });

    await window.gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: [DISCOVERY_DOC],
    });

    // Get the token from localStorage
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No Google token found. Please log in first.");
    }

    // Set the token for gapi
    window.gapi.client.setToken({
      access_token: token,
    });

    // Verify the token is working
    try {
      await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
      });
      console.log("Google API initialized successfully");
    } catch (error) {
      if (error.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem("access_token");
        throw new Error("Your session has expired. Please log in again.");
      }
      throw error;
    }
  } catch (error) {
    console.error("Error initializing Google API:", error);
    throw new Error("Failed to initialize Google API. Please try logging in again.");
  }
};

// Get access token from localStorage
const getAccessToken = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("No Google token found. Please log in first.");
  }
  return token;
};

// Write data to Google Sheets
export const writeDataToGoogleSheet = async (SPREADSHEET_ID, updates) => {
  try {
    // Get a fresh access token
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("No access token available. Please log in again.");
    }

    // Update the sheets API with the new token
    window.gapi.client.setToken({ access_token: accessToken });

    // Process each update individually
    for (const update of updates) {
      try {
        const response = await window.gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: update.range,
          valueInputOption: "USER_ENTERED",
          resource: {
            values: update.values,
          },
        });
        console.log(`Updated ${update.range}:`, response.result);
      } catch (error) {
        if (error.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem("access_token");
          throw new Error("Your session has expired. Please log in again.");
        }
        throw error;
      }
    }

    console.log("All updates completed successfully");
    return true;
  } catch (error) {
    console.error("Error writing to Google Sheets:", error);
    throw error;
  }
};

// Format DV form data for Google Sheets
export const formatDVFormData = (formData, fundCluster, dvNumber) => {
  const data = [
    {
      range: "DV!AB6:AG6",
      values: [[fundCluster]],
    },
    {
      range: "DV!AB7:AG7",
      values: [[formData.date]],
    },
    {
      range: "DV!AB9:AG9",
      values: [[dvNumber]],
    },
    {
      range: "DV!E13:R14",
      values: [[formData.payeeName]],
    },
    {
      range: "DV!S14:AA14",
      values: [[formData.tinNumber]],
    },
    {
      range: "DV!AB14:AG14",
      values: [[formData.bursNumber]],
    },
    {
      range: "DV!E15:AG16",
      values: [[formData.address]],
    },
    {
      range: "DV!A19:Q21",
      values: [[formData.particulars]],
    },
    {
      range: "DV!R19:V21",
      values: [[formData.responsibilityCenter]],
    },
    {
      range: "DV!W19:AA21",
      values: [[formData.mfoPap]],
    },
    {
      range: "DV!AB19:AG19",
      values: [[formData.amount]],
    },
    {
      range: "DV!AB24:AG24",
      values: [[formData.amount]],
    },
    {
      range: "DV!S42:AG48",
      values: [[formData.approvedOfPayment]],
    },
    {
      range: "DV!AC40:AG40",
      values: [[formData.totalAmount]],
    },
    {
      range: "DV!E51:R52",
      values: [[formData.printedName1]],
    },
    {
      range: "DV!E53:R53",
      values: [[formData.position1]],
    },
    {
      range: "DV!W51:AG52",
      values: [[formData.printedName2]],
    },
    {
      range: "DV!W53:AG53",
      values: [[formData.position2]],
    },
    {
      range: "DV!S60:AA61",
      values: [[formData.payeeName]],
    },
    {
      range: "DV!B27:AF27",
      values: [[formData.nameOfVicePresident]],
    }
  ];

  // Clear the accounting entry area (rows 33–40, columns A:W)
  for (let row = 33; row <= 39; row++) {
    data.push({
      range: `DV!A${row}:AG${row}`,
      values: [[
        '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''
      ]], // 33 columns (A:AG)
    });
  }

  // Add mode of payment checkbox
  // First, clear all checkbox cells
  const checkboxCells = ["G11", "L11", "F11", "S11"];
  checkboxCells.forEach((cell) => {
    data.push({
      range: `DV!${cell}`,
      values: [[""]], // Clear the cell
    });
  });

  // Then set the selected checkbox
  const modeOfPaymentCell =
    formData.modeOfPayment === "MDS Check"
      ? "G11"
      : formData.modeOfPayment === "Commercial Check"
      ? "L11"
      : formData.modeOfPayment === "ADA"
      ? "S11"
      : "S11";

  data.push({
    range: `DV!${modeOfPaymentCell}`,
    values: [["✓"]],
  });

  // First, clear all checkbox cells
  const checkboxCells2 = ["B42", "B44", "B46"];
  checkboxCells2.forEach((cell) => {
    data.push({
      range: `DV!${cell}`,
      values: [[""]], // Clear the cell
    });
  });

  // Then set the selected checkbox
  const certified =
    formData.certified === "Cash Available"
      ? "B42"
      : formData.certified ===
        "Subject to Authority to Debit Account (when applicable)"
      ? "B44"
      : formData.certified ===
        "Supporting documents complete and amount claimed"
      ? "B46"
      : "B46";

  data.push({
    range: `DV!${certified}`,
    values: [["✓"]],
  });

  // Add entries data
  let rowIndex = 33; // Starting row for entries
  formData.entries.forEach((entry) => {
    // Add credit entry
    data.push({
      range: `DV!A${rowIndex}:R${rowIndex}`,
      values: [[entry.credit.accountTitle]],
    });
    data.push({
      range: `DV!S${rowIndex}:W${rowIndex}`,
      values: [[entry.credit.uacsCode]],
    });
    // Add credit amount to Debit column in Google Sheet
    data.push({
      range: `DV!X${rowIndex}:AB${rowIndex}`,
      values: [[entry.credit.amount]],
    });

    // Add debit entries
    entry.debits.forEach((debit) => {
      rowIndex++;
      data.push({
        range: `DV!A${rowIndex}:R${rowIndex}`,
        values: [[`_____ ${debit.accountTitle}`]], // Indent debit
      });
      data.push({
        range: `DV!S${rowIndex}:W${rowIndex}`,
        values: [[debit.uacsCode]],
      });
      // Add debit amount to Credit column in Google Sheet
      data.push({
        range: `DV!AC${rowIndex}:AG${rowIndex}`,
        values: [[debit.amount]],
      });
    });

    rowIndex++; // Add space between entries
  });

  return data;
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

    console.log("Data read successfully:", response.result);
    return response.result.values;
  } catch (error) {
    console.error("Error reading from Google Sheets:", error);
    throw error;
  }
};

// Initialize Google Drive API
const initGoogleDriveAPI = async () => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token available");
    }

    // Initialize the client
    await window.gapi.client.init({
      apiKey: "AIzaSyBpFglT36khvpdYzAClcKzC7FQAKmCqTLo",
      discoveryDocs: [
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      ],
    });

    // Set the OAuth token
    window.gapi.client.setToken({ access_token: token });

    console.log("Google Drive API initialized");
  } catch (error) {
    console.error("Error initializing Google Drive API:", error);
    throw error;
  }
};

// Create or get the Disbursement Voucher folder
const getDVFolder = async () => {
  try {
    console.log("Starting getDVFolder...");
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token available");
    }
    console.log("Got token from localStorage");

    // Use fetch API instead of gapi client
    console.log("Searching for existing folder...");
    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=name%3D%27Disbursement%20Voucher%27%20and%20mimeType%3D%27application%2Fvnd.google-apps.folder%27%20and%20trashed%3Dfalse&spaces=drive&fields=files(id%2C%20name)",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Search response not OK:",
        response.status,
        response.statusText
      );
      throw new Error(`Failed to search for folder: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Search response data:", data);

    if (data.files && data.files.length > 0) {
      console.log("Found existing DV folder:", data.files[0]);
      return data.files[0].id;
    }

    // Create new folder if it doesn't exist
    console.log("No existing folder found, creating new one...");
    const createResponse = await fetch(
      "https://www.googleapis.com/drive/v3/files",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Disbursement Voucher",
          mimeType: "application/vnd.google-apps.folder",
        }),
      }
    );

    if (!createResponse.ok) {
      console.error(
        "Create response not OK:",
        createResponse.status,
        createResponse.statusText
      );
      throw new Error(`Failed to create folder: ${createResponse.statusText}`);
    }

    const folder = await createResponse.json();
    console.log("Created new DV folder:", folder);
    return folder.id;
  } catch (error) {
    console.error("Error with DV folder:", error);
    throw error;
  }
};

// Create or get the staff's subfolder
const getStaffSubfolder = async (folderId) => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("No access token available");
    }

    const staffEmail = localStorage.getItem("userEmail");
    const staffName = localStorage.getItem("userName");

    if (!staffEmail || !staffName) {
      throw new Error("Missing required authentication data");
    }

    // Use fetch API instead of gapi client
    console.log("Searching for existing staff subfolder...");
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name%3D%27${staffName}%27%20and%20mimeType%3D%27application%2Fvnd.google-apps.folder%27%20and%20trashed%3Dfalse%20and%20%27${folderId}%27%20in%20parents&spaces=drive&fields=files(id%2C%20name)`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Search response not OK:",
        response.status,
        response.statusText
      );
      throw new Error(
        `Failed to search for staff subfolder: ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Search response data:", data);

    if (data.files && data.files.length > 0) {
      console.log("Found existing staff subfolder:", data.files[0]);
      return data.files[0].id;
    }

    // Create new staff subfolder if it doesn't exist
    console.log("No existing staff subfolder found, creating new one...");
    const createResponse = await fetch(
      "https://www.googleapis.com/drive/v3/files",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: staffName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [folderId],
        }),
      }
    );

    if (!createResponse.ok) {
      console.error(
        "Create response not OK:",
        createResponse.status,
        createResponse.statusText
      );
      throw new Error(
        `Failed to create staff subfolder: ${createResponse.statusText}`
      );
    }

    const staffSubfolder = await createResponse.json();
    console.log("Created new staff subfolder:", staffSubfolder);
    return staffSubfolder.id;
  } catch (error) {
    console.error("Error with staff subfolder:", error);
    throw error;
  }
};

// Export spreadsheet to Drive
export const exportToPDF = async (
  spreadsheetId,
  sheetName,
  dvNumber,
  formData
) => {
  try {
    const token = localStorage.getItem("access_token");
    const staffEmail = localStorage.getItem("userEmail");

    if (!token || !staffEmail) {
      throw new Error("Missing authentication data");
    }

    console.log("Starting exportToPDF for staff:", staffEmail);

    // Get or create staff folder through server
    const createFolderResponse = await fetch(
      "http://localhost:8000/api/vouchers/create-staff-folder",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          accessToken: token,
          staffEmail: staffEmail,
        }),
      }
    );

    if (!createFolderResponse.ok) {
      const errorData = await createFolderResponse.json();
      console.error("Failed to create staff folder:", errorData);
      throw new Error(errorData.details || "Failed to create staff folder");
    }

    const { folderId: staffFolderId } = await createFolderResponse.json();
    console.log("Using staff folder:", staffFolderId);

    // Create the spreadsheet in the staff's folder
    const copyResponse = await fetch(
      "https://www.googleapis.com/drive/v3/files/" + spreadsheetId + "/copy",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `DV_${dvNumber}`,
          parents: [staffFolderId],
        }),
      }
    );

    if (!copyResponse.ok) {
      const errorData = await copyResponse.json();
      console.error("Spreadsheet creation error:", errorData);
      throw new Error(
        `Failed to create spreadsheet: ${
          errorData.error?.message || copyResponse.statusText
        }`
      );
    }

    const copyData = await copyResponse.json();
    console.log("Successfully created spreadsheet:", copyData);

    // Construct the webViewLink
    const webViewLink = `https://docs.google.com/spreadsheets/d/${copyData.id}/edit`;

    return {
      fileId: copyData.id,
      webViewLink: webViewLink
    };
  } catch (error) {
    console.error("Error in exportToPDF:", error);
    throw error;
  }
};
