// Global variables
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('14-2urVQjGn7pcFQpOuSsjB2T9wZQ8MzBzuIHNRSjx3Y') || SpreadsheetApp.getActiveSpreadsheet().getId();
const SHEET_NAMES = {
  CLIENTS: 'clients',
  PROJECTS: 'projects',
  SETTINGS: 'settings'
};

// Initialize function to set up spreadsheet
function initialize() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Create sheets if they don't exist
    if (!ss.getSheetByName(SHEET_NAMES.CLIENTS)) {
      const clientSheet = ss.insertSheet(SHEET_NAMES.CLIENTS);
      clientSheet.getRange("A1:G1").setValues([[
        'client_id', 'name', 'company', 'email', 'phone', 'notes', 'created_at'
      ]]);
      clientSheet.getRange("A1:G1").setFontWeight('bold');
    }
    
    if (!ss.getSheetByName(SHEET_NAMES.PROJECTS)) {
      const projectSheet = ss.insertSheet(SHEET_NAMES.PROJECTS);
      projectSheet.getRange("A1:R1").setValues([[
        'project_id', 'client_id', 'project_title', 'short_description', 'long_description', 
        'status', 'start_date', 'end_date', 'budget', 'deliverables', 'payment_terms', 
        'project_features', 'youtube_link', 'screenshots_json', 'showcase_visibility', 
        'public_token', 'owner_token', 'created_at', 'updated_at'
      ]]);
      projectSheet.getRange("A1:R1").setFontWeight('bold');
    }
    
    if (!ss.getSheetByName(SHEET_NAMES.SETTINGS)) {
      const settingsSheet = ss.insertSheet(SHEET_NAMES.SETTINGS);
      settingsSheet.getRange("A1:H1").setValues([[
        'admin_password', 'your_name', 'your_title', 'your_email', 'your_phone', 
        'default_currency', 'theme_default', 'api_base_url'
      ]]);
      settingsSheet.getRange("A1:H1").setFontWeight('bold');
      
      // Set default settings
      settingsSheet.getRange("A2:H2").setValues([[
        '', 'Your Name', 'Your Title', 'your.email@example.com', '+1234567890', 
        'IDR', 'light', ''
      ]]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Spreadsheet initialized successfully'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Initialization error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Failed to initialize spreadsheet',
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Main function to handle all requests
function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    const path = e.pathInfo || e.parameter.path || '';
    const method = e.parameter.method || e.method;
    
    // Add CORS headers
    const output = ContentService.createTextOutput();
    output.setMimeType(ContentService.MimeType.JSON);
    
    // Handle different endpoints
    let result;
    switch (path) {
      case 'clients':
        result = handleClients(e);
        break;
      case 'client':
        result = handleClient(e);
        break;
      case 'client_create':
        result = createClient(e);
        break;
      case 'client_update':
        result = updateClient(e);
        break;
      case 'client_delete':
        result = deleteClient(e);
        break;
      case 'client_projects':
        result = getClientProjects(e);
        break;
      case 'client_create_with_project':
        result = createClientWithProject(e);
        break;
      case 'projects':
        result = handleProjects(e);
        break;
      case 'project':
        result = handleProject(e);
        break;
      case 'project_create':
        result = createProject(e);
        break;
      case 'project_update':
        result = updateProject(e);
        break;
      case 'project_delete':
        result = deleteProject(e);
        break;
      case 'duplicate_project_as_draft':
        result = duplicateProjectAsDraft(e);
        break;
      case 'settings':
        result = handleSettings(e);
        break;
      case 'settings_update':
        result = updateSettings(e);
        break;
      case 'setup':
        result = setupFirstTime(e);
        break;
      case 'check_setup':
        result = checkSetupStatus(e);
        break;
      default:
        result = {
          ok: false,
          message: 'Endpoint not found',
          path: path
        };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Request handling error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      message: 'Internal server error',
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Helper function to get sheet
function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(sheetName);
}

// Helper function to generate ID
function generateId(prefix) {
  const sheet = getSheet(prefix === 'CLT' ? SHEET_NAMES.CLIENTS : SHEET_NAMES.PROJECTS);
  const data = sheet.getDataRange().getValues();
  let maxId = 0;
  
  for (let i = 1; i < data.length; i++) {
    const id = data[i][0];
    if (id && id.startsWith(prefix)) {
      const num = parseInt(id.split('-')[1]);
      if (num > maxId) maxId = num;
    }
  }
  
  return `${prefix}-${String(maxId + 1).padStart(4, '0')}`;
}

// Helper function to generate random token
function generateToken(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Helper function to find row by ID
function findRowById(sheet, id, idColumn = 0) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][idColumn] === id) {
      return i + 1; // +1 because sheets are 1-indexed
    }
  }
  return -1;
}

// Setup handlers
function setupFirstTime(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const sheet = getSheet(SHEET_NAMES.SETTINGS);
    
    // Update settings
    sheet.getRange('A2').setValue(params.admin_password);
    sheet.getRange('B2').setValue(params.your_name);
    sheet.getRange('C2').setValue(params.your_title);
    sheet.getRange('D2').setValue(params.your_email);
    sheet.getRange('E2').setValue(params.your_phone);
    sheet.getRange('F2').setValue(params.default_currency);
    sheet.getRange('G2').setValue(params.theme_default);
    sheet.getRange('H2').setValue(params.company_name);
    
    return {
      ok: true,
      message: 'Setup completed successfully',
      settings: params
    };
  } catch (error) {
    Logger.log('Setup error: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to complete setup',
      error: error.toString()
    };
  }
}

function checkSetupStatus(e) {
  try {
    const sheet = getSheet(SHEET_NAMES.SETTINGS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return {
        setup_complete: false
      };
    }
    
    const row = data[1]; // Get first data row
    const adminPassword = row[0];
    
    return {
      setup_complete: adminPassword && adminPassword !== ''
    };
  } catch (error) {
    Logger.log('Check setup error: ' + error.toString());
    return {
      setup_complete: false,
      error: error.toString()
    };
  }
}

function getClientProjects(e) {
  try {
    const clientId = e.parameter.client_id;
    if (!clientId) {
      return {
        ok: false,
        message: 'Client ID is required'
      };
    }
    
    const sheet = getSheet(SHEET_NAMES.PROJECTS);
    const data = sheet.getDataRange().getValues();
    const projects = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === clientId) { // client_id is in column 2 (index 1)
        projects.push({
          project_id: data[i][0],
          client_id: data[i][1],
          project_title: data[i][2],
          short_description: data[i][3],
          long_description: data[i][4],
          status: data[i][5],
          start_date: data[i][6],
          end_date: data[i][7],
          budget: data[i][8],
          deliverables: data[i][9],
          payment_terms: data[i][10],
          project_features: data[i][11],
          youtube_link: data[i][12],
          screenshots_json: data[i][13],
          showcase_visibility: data[i][14],
          public_token: data[i][15],
          owner_token: data[i][16],
          created_at: data[i][17],
          updated_at: data[i][18]
        });
      }
    }
    
    return {
      ok: true,
      projects: projects
    };
  } catch (error) {
    Logger.log('Error getting client projects: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to get client projects',
      error: error.toString()
    };
  }
}

function createClientWithProject(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    
    // First create client
    const clientResult = createClient({
      postData: {
        contents: JSON.stringify(params.client)
      }
    });
    
    if (!clientResult.ok) {
      return clientResult;
    }
    
    // Then create project with the new client ID
    const projectParams = {
      ...params.project,
      client_id: clientResult.client.client_id
    };
    
    const projectResult = createProject({
      postData: {
        contents: JSON.stringify(projectParams)
      }
    });
    
    if (!projectResult.ok) {
      return projectResult;
    }
    
    return {
      ok: true,
      message: 'Client and project created successfully',
      client: clientResult.client,
      project: projectResult.project
    };
  } catch (error) {
    Logger.log('Error creating client with project: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to create client with project',
      error: error.toString()
    };
  }
}

// Client handlers
function handleClients(e) {
  try {
    const sheet = getSheet(SHEET_NAMES.CLIENTS);
    const data = sheet.getDataRange().getValues();
    const clients = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Skip empty rows
        clients.push({
          client_id: data[i][0],
          name: data[i][1],
          company: data[i][2],
          email: data[i][3],
          phone: data[i][4],
          notes: data[i][5],
          created_at: data[i][6]
        });
      }
    }
    
    return {
      ok: true,
      clients: clients
    };
  } catch (error) {
    Logger.log('Error getting clients: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to get clients',
      error: error.toString()
    };
  }
}

function handleClient(e) {
  try {
    const clientId = e.parameter.client_id;
    if (!clientId) {
      return {
        ok: false,
        message: 'Client ID is required'
      };
    }
    
    const sheet = getSheet(SHEET_NAMES.CLIENTS);
    const rowNum = findRowById(sheet, clientId);
    
    if (rowNum === -1) {
      return {
        ok: false,
        message: 'Client not found'
      };
    }
    
    const row = sheet.getRange(rowNum, 1, 1, 7).getValues()[0];
    return {
      ok: true,
      client: {
        client_id: row[0],
        name: row[1],
        company: row[2],
        email: row[3],
        phone: row[4],
        notes: row[5],
        created_at: row[6]
      }
    };
  } catch (error) {
    Logger.log('Error getting client: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to get client',
      error: error.toString()
    };
  }
}

function createClient(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const sheet = getSheet(SHEET_NAMES.CLIENTS);
    
    // Validate required fields
    if (!params.name || !params.email) {
      return {
        ok: false,
        message: 'Name and email are required'
      };
    }
    
    // Generate client ID
    const clientId = generateId('CLT');
    const now = new Date().toISOString();
    
    // Add new row
    sheet.appendRow([
      clientId,
      params.name,
      params.company || '',
      params.email,
      params.phone || '',
      params.notes || '',
      now
    ]);
    
    return {
      ok: true,
      message: 'Client created successfully',
      client: {
        client_id: clientId,
        name: params.name,
        company: params.company || '',
        email: params.email,
        phone: params.phone || '',
        notes: params.notes || '',
        created_at: now
      }
    };
  } catch (error) {
    Logger.log('Error creating client: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to create client',
      error: error.toString()
    };
  }
}

function updateClient(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const sheet = getSheet(SHEET_NAMES.CLIENTS);
    
    if (!params.client_id) {
      return {
        ok: false,
        message: 'Client ID is required'
      };
    }
    
    const rowNum = findRowById(sheet, params.client_id);
    if (rowNum === -1) {
      return {
        ok: false,
        message: 'Client not found'
      };
    }
    
    // Update row
    sheet.getRange(rowNum, 2).setValue(params.name);
    sheet.getRange(rowNum, 3).setValue(params.company || '');
    sheet.getRange(rowNum, 4).setValue(params.email);
    sheet.getRange(rowNum, 5).setValue(params.phone || '');
    sheet.getRange(rowNum, 6).setValue(params.notes || '');
    
    return {
      ok: true,
      message: 'Client updated successfully',
      client: {
        client_id: params.client_id,
        name: params.name,
        company: params.company || '',
        email: params.email,
        phone: params.phone || '',
        notes: params.notes || ''
      }
    };
  } catch (error) {
    Logger.log('Error updating client: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to update client',
      error: error.toString()
    };
  }
}

function deleteClient(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const sheet = getSheet(SHEET_NAMES.CLIENTS);
    
    if (!params.client_id) {
      return {
        ok: false,
        message: 'Client ID is required'
      };
    }
    
    const rowNum = findRowById(sheet, params.client_id);
    if (rowNum === -1) {
      return {
        ok: false,
        message: 'Client not found'
      };
    }
    
    // Check if client has associated projects
    const projectSheet = getSheet(SHEET_NAMES.PROJECTS);
    const projectData = projectSheet.getDataRange().getValues();
    for (let i = 1; i < projectData.length; i++) {
      if (projectData[i][1] === params.client_id) {
        return {
          ok: false,
          message: 'Cannot delete client with associated projects'
        };
      }
    }
    
    // Delete row
    sheet.deleteRow(rowNum);
    
    return {
      ok: true,
      message: 'Client deleted successfully'
    };
  } catch (error) {
    Logger.log('Error deleting client: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to delete client',
      error: error.toString()
    };
  }
}

// Project handlers
function handleProjects(e) {
  try {
    const sheet = getSheet(SHEET_NAMES.PROJECTS);
    const data = sheet.getDataRange().getValues();
    const projects = [];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Skip empty rows
        projects.push({
          project_id: data[i][0],
          client_id: data[i][1],
          project_title: data[i][2],
          short_description: data[i][3],
          long_description: data[i][4],
          status: data[i][5],
          start_date: data[i][6],
          end_date: data[i][7],
          budget: data[i][8],
          deliverables: data[i][9],
          payment_terms: data[i][10],
          project_features: data[i][11],
          youtube_link: data[i][12],
          screenshots_json: data[i][13],
          showcase_visibility: data[i][14],
          public_token: data[i][15],
          owner_token: data[i][16],
          created_at: data[i][17],
          updated_at: data[i][18]
        });
      }
    }
    
    return {
      ok: true,
      projects: projects
    };
  } catch (error) {
    Logger.log('Error getting projects: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to get projects',
      error: error.toString()
    };
  }
}

function handleProject(e) {
  try {
    const projectId = e.parameter.project_id;
    if (!projectId) {
      return {
        ok: false,
        message: 'Project ID is required'
      };
    }
    
    const sheet = getSheet(SHEET_NAMES.PROJECTS);
    const rowNum = findRowById(sheet, projectId);
    
    if (rowNum === -1) {
      return {
        ok: false,
        message: 'Project not found'
      };
    }
    
    const row = sheet.getRange(rowNum, 1, 1, 19).getValues()[0];
    return {
      ok: true,
      project: {
        project_id: row[0],
        client_id: row[1],
        project_title: row[2],
        short_description: row[3],
        long_description: row[4],
        status: row[5],
        start_date: row[6],
        end_date: row[7],
        budget: row[8],
        deliverables: row[9],
        payment_terms: row[10],
        project_features: row[11],
        youtube_link: row[12],
        screenshots_json: row[13],
        showcase_visibility: row[14],
        public_token: row[15],
        owner_token: row[16],
        created_at: row[17],
        updated_at: row[18]
      }
    };
  } catch (error) {
    Logger.log('Error getting project: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to get project',
      error: error.toString()
    };
  }
}

function createProject(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const sheet = getSheet(SHEET_NAMES.PROJECTS);
    
    // Validate required fields
    if (!params.client_id || !params.project_title) {
      return {
        ok: false,
        message: 'Client ID and project title are required'
      };
    }
    
    // Generate project ID and tokens
    const projectId = generateId('PRJ');
    const publicToken = generateToken();
    const ownerToken = generateToken();
    const now = new Date().toISOString();
    
    // Add new row
    sheet.appendRow([
      projectId,
      params.client_id,
      params.project_title,
      params.short_description || '',
      params.long_description || '',
      params.status || 'planning',
      params.start_date || '',
      params.end_date || '',
      params.budget || '',
      params.deliverables || '',
      params.payment_terms || '',
      params.project_features || '',
      params.youtube_link || '',
      params.screenshots_json || '',
      params.showcase_visibility || 'no',
      publicToken,
      ownerToken,
      now,
      now
    ]);
    
    return {
      ok: true,
      message: 'Project created successfully',
      project: {
        project_id: projectId,
        client_id: params.client_id,
        project_title: params.project_title,
        short_description: params.short_description || '',
        long_description: params.long_description || '',
        status: params.status || 'planning',
        start_date: params.start_date || '',
        end_date: params.end_date || '',
        budget: params.budget || '',
        deliverables: params.deliverables || '',
        payment_terms: params.payment_terms || '',
        project_features: params.project_features || '',
        youtube_link: params.youtube_link || '',
        screenshots_json: params.screenshots_json || '',
        showcase_visibility: params.showcase_visibility || 'no',
        public_token: publicToken,
        owner_token: ownerToken,
        created_at: now,
        updated_at: now
      }
    };
  } catch (error) {
    Logger.log('Error creating project: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to create project',
      error: error.toString()
    };
  }
}

function updateProject(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const sheet = getSheet(SHEET_NAMES.PROJECTS);
    
    if (!params.project_id) {
      return {
        ok: false,
        message: 'Project ID is required'
      };
    }
    
    const rowNum = findRowById(sheet, params.project_id);
    if (rowNum === -1) {
      return {
        ok: false,
        message: 'Project not found'
      };
    }
    
    const now = new Date().toISOString();
    
    // Update row
    sheet.getRange(rowNum, 2).setValue(params.client_id);
    sheet.getRange(rowNum, 3).setValue(params.project_title);
    sheet.getRange(rowNum, 4).setValue(params.short_description || '');
    sheet.getRange(rowNum, 5).setValue(params.long_description || '');
    sheet.getRange(rowNum, 6).setValue(params.status || 'planning');
    sheet.getRange(rowNum, 7).setValue(params.start_date || '');
    sheet.getRange(rowNum, 8).setValue(params.end_date || '');
    sheet.getRange(rowNum, 9).setValue(params.budget || '');
    sheet.getRange(rowNum, 10).setValue(params.deliverables || '');
    sheet.getRange(rowNum, 11).setValue(params.payment_terms || '');
    sheet.getRange(rowNum, 12).setValue(params.project_features || '');
    sheet.getRange(rowNum, 13).setValue(params.youtube_link || '');
    sheet.getRange(rowNum, 14).setValue(params.screenshots_json || '');
    sheet.getRange(rowNum, 15).setValue(params.showcase_visibility || 'no');
    sheet.getRange(rowNum, 19).setValue(now); // updated_at
    
    return {
      ok: true,
      message: 'Project updated successfully',
      project: {
        project_id: params.project_id,
        client_id: params.client_id,
        project_title: params.project_title,
        short_description: params.short_description || '',
        long_description: params.long_description || '',
        status: params.status || 'planning',
        start_date: params.start_date || '',
        end_date: params.end_date || '',
        budget: params.budget || '',
        deliverables: params.deliverables || '',
        payment_terms: params.payment_terms || '',
        project_features: params.project_features || '',
        youtube_link: params.youtube_link || '',
        screenshots_json: params.screenshots_json || '',
        showcase_visibility: params.showcase_visibility || 'no',
        updated_at: now
      }
    };
  } catch (error) {
    Logger.log('Error updating project: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to update project',
      error: error.toString()
    };
  }
}

function deleteProject(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const sheet = getSheet(SHEET_NAMES.PROJECTS);
    
    if (!params.project_id) {
      return {
        ok: false,
        message: 'Project ID is required'
      };
    }
    
    const rowNum = findRowById(sheet, params.project_id);
    if (rowNum === -1) {
      return {
        ok: false,
        message: 'Project not found'
      };
    }
    
    // Delete row
    sheet.deleteRow(rowNum);
    
    return {
      ok: true,
      message: 'Project deleted successfully'
    };
  } catch (error) {
    Logger.log('Error deleting project: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to delete project',
      error: error.toString()
    };
  }
}

function duplicateProjectAsDraft(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    
    if (!params.original_project_id || !params.new_client_data) {
      return {
        ok: false,
        message: 'Original project ID and new client data are required'
      };
    }
    
    // Get original project
    const projectSheet = getSheet(SHEET_NAMES.PROJECTS);
    const originalRowNum = findRowById(projectSheet, params.original_project_id);
    
    if (originalRowNum === -1) {
      return {
        ok: false,
        message: 'Original project not found'
      };
    }
    
    const originalRow = projectSheet.getRange(originalRowNum, 1, 1, 19).getValues()[0];
    
    // Check if client exists, create if not
    const clientSheet = getSheet(SHEET_NAMES.CLIENTS);
    let clientId = null;
    
    // Find client by email
    const clientData = clientSheet.getDataRange().getValues();
    for (let i = 1; i < clientData.length; i++) {
      if (clientData[i][3] === params.new_client_data.email) {
        clientId = clientData[i][0];
        break;
      }
    }
    
    // Create new client if not found
    if (!clientId) {
      const newClientId = generateId('CLT');
      const now = new Date().toISOString();
      
      clientSheet.appendRow([
        newClientId,
        params.new_client_data.name,
        params.new_client_data.company || '',
        params.new_client_data.email,
        params.new_client_data.phone || '',
        params.new_client_data.notes || '',
        now
      ]);
      
      clientId = newClientId;
    }
    
    // Create new project
    const newProjectId = generateId('PRJ');
    const publicToken = generateToken();
    const ownerToken = generateToken();
    const now = new Date().toISOString();
    
    projectSheet.appendRow([
      newProjectId,
      clientId,
      'Copy of ' + originalRow[2], // project_title
      originalRow[3], // short_description
      originalRow[4], // long_description
      'draft', // status
      '', // start_date
      '', // end_date
      originalRow[8], // budget
      originalRow[9], // deliverables
      originalRow[10], // payment_terms
      originalRow[11], // project_features
      originalRow[12], // youtube_link
      originalRow[13], // screenshots_json
      'no', // showcase_visibility
      publicToken,
      ownerToken,
      now,
      now
    ]);
    
    return {
      ok: true,
      message: 'Project duplicated successfully',
      project: {
        project_id: newProjectId,
        client_id: clientId,
        project_title: 'Copy of ' + originalRow[2],
        status: 'draft',
        public_token: publicToken,
        owner_token: ownerToken,
        created_at: now,
        updated_at: now
      }
    };
  } catch (error) {
    Logger.log('Error duplicating project: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to duplicate project',
      error: error.toString()
    };
  }
}

// Settings handlers
function handleSettings(e) {
  try {
    const sheet = getSheet(SHEET_NAMES.SETTINGS);
    const data = sheet.getDataRange().getValues();
    
    if (data.length < 2) {
      return {
        ok: false,
        message: 'Settings not found'
      };
    }
    
    const row = data[1]; // Get first data row
    return {
      ok: true,
      settings: {
        admin_password: row[0],
        your_name: row[1],
        your_title: row[2],
        your_email: row[3],
        your_phone: row[4],
        default_currency: row[5],
        theme_default: row[6],
        api_base_url: row[7]
      }
    };
  } catch (error) {
    Logger.log('Error getting settings: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to get settings',
      error: error.toString()
    };
  }
}

function updateSettings(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const sheet = getSheet(SHEET_NAMES.SETTINGS);
    
    // Update settings
    if (params.admin_password !== undefined) sheet.getRange('A2').setValue(params.admin_password);
    if (params.your_name !== undefined) sheet.getRange('B2').setValue(params.your_name);
    if (params.your_title !== undefined) sheet.getRange('C2').setValue(params.your_title);
    if (params.your_email !== undefined) sheet.getRange('D2').setValue(params.your_email);
    if (params.your_phone !== undefined) sheet.getRange('E2').setValue(params.your_phone);
    if (params.default_currency !== undefined) sheet.getRange('F2').setValue(params.default_currency);
    if (params.theme_default !== undefined) sheet.getRange('G2').setValue(params.theme_default);
    if (params.api_base_url !== undefined) sheet.getRange('H2').setValue(params.api_base_url);
    
    return {
      ok: true,
      message: 'Settings updated successfully',
      settings: params
    };
  } catch (error) {
    Logger.log('Error updating settings: ' + error.toString());
    return {
      ok: false,
      message: 'Failed to update settings',
      error: error.toString()
    };
  }
}