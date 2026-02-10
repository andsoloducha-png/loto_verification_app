# LOTO Verification App

Web application for LOTO (Lockout/Tagout) procedure verification with supervisor dashboard, built on Google Apps Script.

## Features

- **Step-by-step verification** - Guide operators through safety procedures
- **Image support** - Display reference images from Google Drive
- **Status tracking** - Confirm or report issues for each step
- **Admin dashboard** - Real-time monitoring and issue tracking
- **Automatic logging** - All actions saved to Google Sheets

## Tech Stack

- Google Apps Script (server-side)
- HTML5 + Bootstrap 5 (frontend)
- Google Sheets (data storage)
- Google Drive (image hosting)

## Quick Start

1. Create a new Google Sheets spreadsheet
2. Add two sheets: `Konfiguracja` and `Rejestr`
3. Open Apps Script editor (Extensions → Apps Script)
4. Copy `Code.gs` and `Index.html` to the editor
5. Deploy as web app

## Sheet Structure

### Konfiguracja (Configuration)
| Column | Name | Description |
|--------|------|-------------|
| A | Strefa | Zone/area name |
| B | ID | Step ID |
| C | Nazwa | Step name |
| D | Opis | Step description |
| E | URL Obrazu | Google Drive image URL |

### Rejestr (Log)
Auto-generated log with columns:
- Timestamp
- User Email
- Zone
- Step Name
- Status (ZATWIERDZONO/ODRZUCONO)
- Comments

## Usage

### For Operators
Access via URL with zone parameter:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?strefa=ZONE_NAME
```

Example: `?strefa=MachineA`

### For Supervisors
Access dashboard with admin parameter:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?strefa=ADMIN
```

## Configuration

Edit these constants in `Code.gs`:
```javascript
const CFG_SHEET_NAME = 'Konfiguracja';
const LOG_SHEET_NAME = 'Rejestr';
const CACHE_TTL_SEC = 10 * 60; // Cache duration
```

## Deployment

1. In Apps Script editor: Deploy → New deployment
2. Type: Web app
3. Execute as: Me
4. Who has access: Anyone with the link (or restrict as needed)
5. Copy the deployment URL

## Features Detail

### Operator View
- Progressive step display
- Image zoom capability
- Quick approve/reject actions
- Issue reporting with comments

### Admin Dashboard
- Today's activity count
- Total rejected steps
- Issue list with details
- Real-time refresh

## Security

- User email automatically captured via `Session.getActiveUser()`
- Lock service prevents concurrent write conflicts
- All actions timestamped and logged
- Access control via Google account permissions

## License

MIT License

## Support

For issues or questions, contact your system administrator.
