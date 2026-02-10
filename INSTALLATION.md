# Installation Guide

## Prerequisites

- Google Account
- Access to Google Sheets
- Access to Google Drive
- Basic understanding of Google Apps Script

## Step-by-Step Setup

### 1. Create Google Sheets Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Rename it to "LOTO Verification System" (or your preferred name)

### 2. Set Up Sheet Structure

#### Sheet 1: Konfiguracja

1. Rename the first sheet to `Konfiguracja`
2. Add headers in row 1:
   - A1: `Strefa`
   - B1: `ID`
   - C1: `Nazwa`
   - D1: `Opis`
   - E1: `URL Obrazu`

3. Add sample data (row 2):
   - A2: `MachineA`
   - B2: `1`
   - C2: `Check power isolation`
   - D2: `Verify main power switch is in OFF position`
   - E2: (optional Google Drive image URL)

#### Sheet 2: Rejestr

1. Create a new sheet (+ button at bottom)
2. Rename it to `Rejestr`
3. Add headers in row 1:
   - A1: `Timestamp`
   - B1: `Email`
   - C1: `Strefa`
   - D1: `Etap`
   - E1: `Status`
   - F1: `Uwagi`

### 3. Deploy Apps Script

1. In your spreadsheet: **Extensions → Apps Script**
2. Delete any default code in `Code.gs`
3. Copy the entire contents of `src/Code.gs` from this repository
4. Paste into the Apps Script editor

5. Create the HTML file:
   - Click the **+** next to Files
   - Select **HTML**
   - Name it `Index`
   - Delete default content
   - Copy contents of `src/Index.html` from this repository
   - Paste into the editor

6. Save both files (Ctrl+S or Cmd+S)

### 4. Deploy as Web App

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: LOTO Verification v1.0
   - **Execute as**: Me (your email)
   - **Who has access**: 
     - For internal use: Anyone within your organization
     - For testing: Anyone with the link
5. Click **Deploy**
6. **Important**: Copy the deployment URL - you'll need this!
7. Click **Authorize access** and grant permissions

### 5. Prepare Images (Optional)

If using images:

1. Upload images to Google Drive
2. Right-click image → Share → Change to "Anyone with the link"
3. Copy the share link
4. Paste in column E of Konfiguracja sheet

### 6. Test the App

#### Test Operator View:
```
YOUR_DEPLOYMENT_URL?strefa=MachineA
```

You should see:
- Step 1 of your configured steps
- The step name and description
- Approve/Reject buttons

#### Test Admin Dashboard:
```
YOUR_DEPLOYMENT_URL?strefa=ADMIN
```

You should see:
- Statistics (0 today, 0 errors initially)
- Empty issues list

### 7. Create Access Links

For each zone/machine, create a link:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?strefa=ZONE_NAME
```

Examples:
- Machine A: `?strefa=MachineA`
- Machine B: `?strefa=MachineB`
- Loading Dock: `?strefa=LoadingDock`

You can create QR codes for these links for easy mobile access.

## Troubleshooting

### "Authorization required" error
- Redeploy the web app
- Make sure you authorized the script
- Check sharing permissions on the spreadsheet

### Images not loading
- Verify image URL is correct
- Check that image sharing is set to "Anyone with the link"
- Try uploading a smaller image (< 5MB)

### Data not saving
- Check that sheet names match exactly (`Konfiguracja` and `Rejestr`)
- Verify you have edit permissions on the spreadsheet
- Check Apps Script execution logs (View → Executions)

### "Server busy" errors
- This is the lock timeout - try again
- If persistent, increase timeout in Code.gs: `lock.waitLock(10000)`

## Updating the App

To update after deployment:

1. Make changes in Apps Script editor
2. Save files
3. Deploy → Manage deployments
4. Click pencil icon ✏️ next to your deployment
5. Update version (New version)
6. Deploy

**Note**: The URL stays the same, only the version changes.

## Next Steps

- Add more zones in Konfiguracja sheet
- Customize colors in Index.html (CSS variables)
- Set up email notifications (add to `logStepAction` function)
- Create QR codes for easy access
- Train operators on the system

## Support

For technical issues:
1. Check Apps Script logs: View → Executions
2. Verify sheet structure matches documentation
3. Test with simple zone first
4. Contact your system administrator
