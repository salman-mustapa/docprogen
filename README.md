# Freelance Project Document & Portfolio Generator

A comprehensive web application for managing freelance projects, clients, and generating professional documents. Built with vanilla JavaScript, HTML5, TailwindCSS, and Google Apps Script as the backend.

## Features

- **Project Management**: Create, update, and track projects with detailed information
- **Client Management**: Maintain a database of clients with contact information
- **Document Generation**: Generate professional PDFs (Proposal, Contract, SRS, RAB, Invoice, UAT, CV Summary)
- **Public Showcase**: Display completed projects publicly with consultation and order features
- **Secure Authentication**: Simple password-based authentication system
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Architecture

### Frontend
- **Technology**: Vanilla JavaScript (no frameworks), HTML5, TailwindCSS (CDN)
- **Font**: Google Fonts (Quicksand)
- **PDF Generation**: html2pdf.js
- **Deployment**: GitHub Pages

### Backend
- **Technology**: Google Apps Script (Web App)
- **Database**: Google Sheets
- **API**: RESTful endpoints with CORS support

## Installation & Setup

### 1. Google Sheets Setup

1. Create a new Google Sheet
2. Create three sheets with the following structure:

#### Sheet: `clients`
| Column | Description |
|--------|-------------|
| client_id | Unique client ID (auto-generated) |
| name | Client name |
| company | Company name |
| email | Email address |
| phone | Phone number |
| notes | Additional notes |
| created_at | Creation timestamp |

#### Sheet: `projects`
| Column | Description |
|--------|-------------|
| project_id | Unique project ID (auto-generated) |
| client_id | Foreign key to clients.client_id |
| project_title | Project title |
| short_description | Brief description |
| long_description | Detailed description |
| status | Project status (planning, in-progress, done, cancelled) |
| start_date | Project start date |
| end_date | Project end date |
| budget | Project budget |
| deliverables | Project deliverables |
| payment_terms | Payment terms |
| project_features | Project features (newline separated) |
| youtube_link | YouTube video link |
| screenshots_json | JSON array of screenshot URLs |
| showcase_visibility | Show in public showcase (yes/no) |
| public_token | Public share token (auto-generated) |
| owner_token | Owner token (auto-generated) |
| created_at | Creation timestamp |
| updated_at | Last update timestamp |

#### Sheet: `settings`
| Column | Description |
|--------|-------------|
| admin_password | Admin password for authentication |
| your_name | Your name |
| your_title | Your professional title |
| your_email | Your email |
| your_phone | Your phone |
| default_currency | Default currency (IDR, USD, etc.) |
| theme_default | Theme setting (not functional) |
| api_base_url | Base URL for API calls |

### 2. Google Apps Script Setup

1. Open your Google Sheet
2. Go to `Extensions > Apps Script`
3. Replace the default code with the Apps Script code (see `apps-script/Code.gs` below)
4. Deploy as Web App:
   - Go to `Deploy > New deployment`
   - Select `Web app`
   - Description: "Freelance Project Manager API"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click `Deploy`
   - Copy the Web app URL
5. Update the `api_base_url` in your Google Sheet settings with the Web app URL

### 3. Frontend Deployment

1. Fork or clone this repository
2. Update the API base URL in `assets/api.js`:
   ```javascript
   const API_BASE_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
   ```