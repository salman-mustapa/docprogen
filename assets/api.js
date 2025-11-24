// assets/api.js

// HARDCODE URL BARU ANDA DISINI UNTUK MEMASTIKAN TIDAK ADA CACHE LAMA
const HARDCODED_URL = 'https://script.google.com/macros/s/AKfycbyAlklm1Eg2JIUaagXkEJhv5TSTxX0gznxqt_ue-kZzMy3E0pFGCsBtzTuAxP9XfqFI/exec';

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
    
    async createClient(clientData) {
        const response = await apiRequest('/client_create', {
            method: 'POST',
            body: JSON.stringify(clientData),
        });
        return response.client;
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
    
    // async getProject(projectId) {
    //     const response = await apiRequest(`/project?project_id=${projectId}`);
    //     return response.project;
    // },
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
    }
};