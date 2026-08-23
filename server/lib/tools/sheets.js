import { google } from 'googleapis';

export async function createSheet(tasks, auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  
  const createRes = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: 'SprintZero Task Breakdown' },
      sheets: [{ properties: { title: 'Tasks', gridProperties: { columnCount: 7 } } }]
    }
  });
  
  const spreadsheetId = createRes.data.spreadsheetId;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  
  const headers = [['ID', 'Title', 'Assignee', 'Start Date', 'Due Date', 'Depends On', 'Description']];
  
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: 'A1:G1',
    valueInputOption: 'RAW',
    requestBody: { values: headers }
  });
  
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        repeatCell: {
          range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
              textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontSize: 11 },
              horizontalAlignment: 'CENTER'
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
        }
      }]
    }
  });
  
  const rows = tasks.map(t => [
    t.id, t.title, t.assignee, t.start_date, t.due_date,
    t.depends_on?.join(', ') || '', t.description || ''
  ]);
  
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: 'A2',
    valueInputOption: 'RAW',
    requestBody: { values: rows }
  });
  
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        autoResizeDimensions: {
          dimensions: { sheetId: 0, dimension: 'COLUMNS', startIndex: 0, endIndex: 7 }
        }
      }]
    }
  });
  
  return { sheetUrl, spreadsheetId };
}