import { google } from "googleapis";

export async function createSheet(tasks, meetings, auth, projectName = "SprintZero Project") {
  const sheets = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });

  const createRes = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: projectName },
      sheets: [
        { properties: { title: "Tasks", gridProperties: { columnCount: 8 } } },
        {
          properties: { title: "Meetings", gridProperties: { columnCount: 6 } },
        },
      ],
    },
  });

  const spreadsheetId = createRes.data.spreadsheetId;
  const tasksSheetId = createRes.data.sheets?.[0]?.properties?.sheetId ?? 0;
  const meetingsSheetId = createRes.data.sheets?.[1]?.properties?.sheetId ?? 1;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // Make the spreadsheet public - anyone with the link can edit
  try {
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        role: "writer",
        type: "anyone",
      },
    });
  } catch (err) {
    console.error(
      "[sheets] Failed to set public sharing permission — sheet may not be accessible to others:",
      err?.response?.data?.error?.message || err.message,
    );
  }

  // Tasks sheet
  const tasksHeaders = [
    [
      "ID",
      "Title",
      "Assignee",
      "Start Date",
      "Due Date",
      "Depends On",
      "Description",
      "Status",
    ],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Tasks!A1:H1",
    valueInputOption: "RAW",
    requestBody: { values: tasksHeaders },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId: tasksSheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.4, blue: 0.8 },
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 11,
                },
                horizontalAlignment: "CENTER",
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
          },
        },
        // Add data validation for Status column (checkbox)
        {
          setDataValidation: {
            range: {
              sheetId: tasksSheetId,
              startRowIndex: 1,
              endRowIndex: 1000,
              startColumnIndex: 7,
              endColumnIndex: 8,
            },
            rule: {
              condition: {
                type: "BOOLEAN",
              },
              showCustomUi: true,
              strict: true,
            },
          },
        },
      ],
    },
  });

  const tasksRows = tasks.map((t) => [
    t.id,
    t.title,
    t.assignee,
    t.start_date,
    t.due_date,
    t.depends_on?.join(", ") || "",
    t.description || "",
    false, // Status - default to unchecked (false)
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Tasks!A2",
    valueInputOption: "RAW",
    requestBody: { values: tasksRows },
  });

  // Meetings sheet
  const meetingsHeaders = [
    ["Meeting Title", "Date", "Time", "Attendees", "Related Tasks", "Agenda", "Meet Link"],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Meetings!A1:G1",
    valueInputOption: "RAW",
    requestBody: { values: meetingsHeaders },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: meetingsSheetId,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.6, blue: 0.4 },
                textFormat: {
                  bold: true,
                  foregroundColor: { red: 1, green: 1, blue: 1 },
                  fontSize: 11,
                },
                horizontalAlignment: "CENTER",
              },
            },
            fields:
              "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)",
          },
        },
      ],
    },
  });

  const meetingsRows = meetings.map((m) => [
    m.meeting_title,
    m.date,
    m.time,
    m.attendees?.map((a) => `${a.name} (${a.email})`).join(", ") || "",
    m.related_task_ids?.join(", ") || "",
    m.agenda || "",
    m.meetLink || "",
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Meetings!A2",
    valueInputOption: "RAW",
    requestBody: { values: meetingsRows },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: tasksSheetId,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: 8,
            },
          },
        },
        {
          autoResizeDimensions: {
            dimensions: {
              sheetId: meetingsSheetId,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: 7,
            },
          },
        },
      ],
    },
  });

  return { sheetUrl, spreadsheetId };
}

export async function updateMeetingsWithLinks(
  spreadsheetId,
  meetingsWithLinks,
  auth,
) {
  if (!spreadsheetId || !meetingsWithLinks || !meetingsWithLinks.length) {
    return;
  }
  const sheets = google.sheets({ version: "v4", auth });
  const rows = meetingsWithLinks.map((m) => [m.meetLink || ""]);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "Meetings!G2",
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });
}
