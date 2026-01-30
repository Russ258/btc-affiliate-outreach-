import { google } from 'googleapis';
import { getAuthenticatedClient } from './auth';

// Reads data from a Google Sheets spreadsheet for the specified range
export async function readSheet(spreadsheetId: string, range: string) {
  try {
    const auth = await getAuthenticatedClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error reading sheet:', error);
    throw new Error('Failed to read Google Sheet. Check spreadsheet ID and permissions.');
  }
}

// Writes data to a Google Sheets spreadsheet at the specified range
export async function writeSheet(
  spreadsheetId: string,
  range: string,
  values: any[][]
) {
  try {
    const auth = await getAuthenticatedClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error writing to sheet:', error);
    throw new Error('Failed to write to Google Sheet');
  }
}

// Gets metadata about a spreadsheet including sheet names
export async function getSpreadsheetMetadata(spreadsheetId: string) {
  try {
    const auth = await getAuthenticatedClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    return {
      title: response.data.properties?.title,
      sheets: response.data.sheets?.map((sheet) => ({
        id: sheet.properties?.sheetId,
        title: sheet.properties?.title,
        index: sheet.properties?.index,
        rowCount: sheet.properties?.gridProperties?.rowCount,
        columnCount: sheet.properties?.gridProperties?.columnCount,
      })),
    };
  } catch (error) {
    console.error('Error getting spreadsheet metadata:', error);
    throw new Error('Failed to get spreadsheet info. Check spreadsheet ID and permissions.');
  }
}

// Appends rows to the end of a spreadsheet
export async function appendToSheet(
  spreadsheetId: string,
  range: string,
  values: any[][]
) {
  try {
    const auth = await getAuthenticatedClient();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error appending to sheet:', error);
    throw new Error('Failed to append to Google Sheet');
  }
}

// Parses sheet rows into contact objects based on column mapping
export function parseSheetData(
  rows: any[][],
  columnMapping: {
    name?: number;
    email?: number;
    company?: number;
    phone?: number;
    website?: number;
    notes?: number;
  }
) {
  // Skip header row (first row)
  const dataRows = rows.slice(1);

  return dataRows
    .map((row, index) => {
      // Skip empty rows
      if (!row || row.length === 0 || row.every((cell) => !cell)) {
        return null;
      }

      const contact: any = {
        sheets_row_id: index + 2, // +2 because we skip header and rows are 1-indexed
      };

      if (columnMapping.name !== undefined && row[columnMapping.name]) {
        contact.name = String(row[columnMapping.name]).trim();
      }
      if (columnMapping.email !== undefined && row[columnMapping.email]) {
        contact.email = String(row[columnMapping.email]).trim().toLowerCase();
      }
      if (columnMapping.company !== undefined && row[columnMapping.company]) {
        contact.company = String(row[columnMapping.company]).trim();
      }
      if (columnMapping.phone !== undefined && row[columnMapping.phone]) {
        contact.phone = String(row[columnMapping.phone]).trim();
      }
      if (columnMapping.website !== undefined && row[columnMapping.website]) {
        contact.website = String(row[columnMapping.website]).trim();
      }
      if (columnMapping.notes !== undefined && row[columnMapping.notes]) {
        contact.notes = String(row[columnMapping.notes]).trim();
      }

      // Must have at least name and email
      if (!contact.name || !contact.email) {
        return null;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact.email)) {
        return null;
      }

      return contact;
    })
    .filter((contact) => contact !== null);
}
