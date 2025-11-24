// assets/api.js

// Password hashing utilities
const hashPassword = async (password) => {
    // Simple hash implementation for client-side
    // In production, use a proper server-side hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

const verifyPassword = async (password, storedHash) => {
    const inputHash = await hashPassword(password);
    return inputHash === storedHash;
};

// HARDCODE URL BARU ANDA DISINI UNTUK MEMASTIKAN TIDAK ADA CACHE LAMA
const HARDCODED_URL = 'https://script.google.com/macros/s/AKfycbzvIz9UGVr8uYh8ohcF3LBtMrMqZX3AkBZDwAVzYgffXQDosJcnZab5I_VxCF5wCDNBig/exec';

// Get API base URL (Prioritize hardcoded, then settings, then default)
const API_BASE_URL = HARDCODED_URL || localStorage.getItem('api_base_url');

/**
 * Generic API request function
 */
async function apiRequest(endpoint, options = {}) {
    // 1. UBAH ROUTING: Gunakan ?path=... daripada /path
    // Hapus slash di depan endpoint jika ada (misal "/settings" jadi "settings")
    const pathName = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    
    // Pisahkan query params jika ada (misal "client?id=123")
    let finalUrl;
    if (pathName.includes('?')) {
        const [path, query] = pathName.split('?');
        finalUrl = `${API_BASE_URL}?path=${path}&${query}`;
    } else {
        finalUrl = `${API_BASE_URL}?path=${pathName}`;
    }

    const defaultOptions = {
        method: 'GET',
        redirect: 'follow', // Wajib untuk GAS
    };
    
    const requestOptions = { ...defaultOptions, ...options };

    // 2. FIX CORS: HANYA kirim Content-Type jika method adalah POST
    if (requestOptions.method === 'POST') {
        // GAS butuh text/plain agar tidak memicu Preflight (OPTIONS) yang rumit
        requestOptions.headers = {
            'Content-Type': 'text/plain;charset=utf-8',
        };
    } else {
        // PENTING: Untuk GET, HAPUS headers. Jangan kirim object kosong pun.
        // Biarkan browser mengaturnya secara natural sebagai "Simple Request"
        delete requestOptions.headers;
        delete requestOptions.body;
    }
    
    try {
        console.log(`API Request: ${requestOptions.method} ${finalUrl}`);
        
        const response = await fetch(finalUrl, requestOptions);
        
        if (!response.ok) {
            const text = await response.text();
            console.error('API Error Response:', text);
            throw new Error(`Server returned ${response.status}: ${text}`);
        }
        
        const data = await response.json();
        
        // Cek logic error dari backend (misal {ok: false})
        if (data && data.ok === false) {
             throw new Error(data.message || 'Operation failed');
        }

        return data;

    } catch (error) {
        console.error('API request failed details:', error);
        
        if (error.message.includes('Failed to fetch')) {
             // Ini biasanya CORS error atau salah URL
            throw new Error('Connection failed. Possible causes: CORS block, Wrong Deployment URL, or Internet issue.');
        }
        throw error;
    }
}

// API object with all endpoint methods
const api = {
    async getClients() {
        // Request ke backend akan jadi: .../exec?path=clients
        const response = await apiRequest('/clients');
        return response.clients || [];
    },
    
    async getClient(clientId) {
        // Request ke backend akan jadi: .../exec?path=client&client_id=123
        const response = await apiRequest(`/client?client_id=${clientId}`);
        return response.client;
    },
    
    async getClientProjects(clientId) {
        const response = await apiRequest(`/client_projects?client_id=${clientId}`);
        return response.projects || [];
    },
    
    async createClient(clientData) {
        const response = await apiRequest('/client_create', {
            method: 'POST',
            body: JSON.stringify(clientData),
        });
        return response.client;
    },
    
    async createClientWithProject(clientData, projectData) {
        const response = await apiRequest('/client_create_with_project', {
            method: 'POST',
            body: JSON.stringify({ client: clientData, project: projectData }),
        });
        return response;
    },
    
    async updateClient(clientId, clientData) {
        const response = await apiRequest('/client_update', {
            method: 'POST',
            body: JSON.stringify({ client_id: clientId, ...clientData }),
        });
        return response.client;
    },
    
    async deleteClient(clientId) {
        const response = await apiRequest('/client_delete', {
            method: 'POST',
            body: JSON.stringify({ client_id: clientId }),
        });
        return response;
    },
    
    async getProjects() {
        const response = await apiRequest('/projects');
        return response.projects || [];
    },
    
    async getProject(projectId) {
        try {
            const response = await apiRequest(`/project?project_id=${projectId}`);
            if (!response.ok || !response.project) {
                throw new Error(response.message || 'Project not found');
            }
            return response.project;
        } catch (error) {
            console.error('Error getting project:', error);
            throw error;
        }
    },
    
    async createProject(projectData) {
        const response = await apiRequest('/project_create', {
            method: 'POST',
            body: JSON.stringify(projectData),
        });
        return response.project;
    },
    
    async updateProject(projectId, projectData) {
        const response = await apiRequest('/project_update', {
            method: 'POST',
            body: JSON.stringify({ project_id: projectId, ...projectData }),
        });
        return response.project;
    },
    
    async deleteProject(projectId) {
        const response = await apiRequest('/project_delete', {
            method: 'POST',
            body: JSON.stringify({ project_id: projectId }),
        });
        return response;
    },
    
    async duplicateProjectAsDraft(originalProjectId, newClientData) {
        const response = await apiRequest('/duplicate_project_as_draft', {
            method: 'POST',
            body: JSON.stringify({ 
                original_project_id: originalProjectId,
                new_client_data: newClientData
            }),
        });
        return response.project;
    },
    
    async getSettings() {
        const response = await apiRequest('/settings');
        return response.settings;
    },
    
    async updateSettings(settingsData) {
        const response = await apiRequest('/settings_update', {
            method: 'POST',
            body: JSON.stringify(settingsData),
        });
        return response.settings;
    },
    
    async setupFirstTime(setupData) {
        const response = await apiRequest('/setup', {
            method: 'POST',
            body: JSON.stringify(setupData),
        });
        return response;
    },
    
    async checkSetupStatus() {
        try {
            const response = await apiRequest('/check_setup');
            return response.setup_complete;
        } catch (error) {
            console.error('Error checking setup status:', error);
            // If endpoint not found, assume setup is needed
            if (error.message.includes('Endpoint not found')) {
                return false;
            }
            throw error;
        }
    }
};

// Export hashing utilities
window.hashPassword = hashPassword;
window.verifyPassword = verifyPassword;