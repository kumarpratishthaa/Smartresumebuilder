# Resume Studio — Full-Stack Resume Builder

A ready-to-run mini project upgraded from the original frontend Resume Builder with Template Switcher.

## Features
- Resume form with live preview
- Three templates: Modern, Classic and Minimal
- Save resumes to `data/resumes.json`
- View all saved resumes
- Open and edit saved resumes
- Duplicate and delete resumes
- Download / print resume as PDF using the browser's Print dialog
- Express REST API with GET, POST, PUT and DELETE
- Responsive layout

## Requirements
- Node.js 18 or newer
- VS Code (recommended)
- Chrome, Edge or Firefox

## Run the project

1. Extract the ZIP file.
2. Open the extracted `Resume-Builder-Full-Stack` folder in VS Code.
3. Open Terminal → New Terminal.
4. Check Node.js and npm are installed:

   ```bash
   node -v
   npm -v
   ```

5. Install dependencies:

   ```bash
   npm install
   ```

6. Start the server:

   ```bash
   npm start
   ```

7. Open this address in your browser:

   http://localhost:3000

Keep the terminal running while you use the application. To stop the server, press `Ctrl + C`.

## How to download a PDF
Fill in your resume and click **Download / Print PDF**. In the browser print window, choose **Save as PDF** as the destination and click Save.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check server status |
| GET | `/api/resumes` | Get all saved resumes |
| GET | `/api/resumes/:id` | Get one resume |
| POST | `/api/resumes` | Create a resume |
| PUT | `/api/resumes/:id` | Update a resume |
| DELETE | `/api/resumes/:id` | Delete a resume |

## Storage
Resume data is saved in `data/resumes.json`. It remains available after restarting the server, as long as this file is kept.

## Important notes
- This project uses a JSON file as requested; it is intended for a local academic/demo project, not concurrent production use.
- There is no user login or cloud sync. Anyone with access to this local app can see its saved resumes.
- PDF export uses the browser print feature, so no extra PDF package or internet connection is required.
- Google Fonts are optional; the application has fallback fonts if the internet is unavailable.
