// assets/main.js

// Main JavaScript file for common utilities

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
function checkAuth() {
    return sessionStorage.getItem('session_key') === 'authenticated';
}

/**
 * Show notification to user
 * @param {string} message - The message to display
 * @param {string} type - Type of notification (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} p-4 rounded-lg shadow-lg mb-2 flex items-center justify-between`;
    
    // Add color based on type
    let bgColor = 'bg-blue-100 text-blue-800';
    let icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
    
    switch (type) {
        case 'success':
            bgColor = 'bg-green-100 text-green-800';
            icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
            break;
        case 'error':
            bgColor = 'bg-red-100 text-red-800';
            icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>';
            break;
        case 'warning':
            bgColor = 'bg-yellow-100 text-yellow-800';
            icon = '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>';
            break;
    }
    
    notification.className += ` ${bgColor}`;
    notification.innerHTML = `
        <div class="flex items-center">
            ${icon}
            <span>${message}</span>
        </div>
        <button class="ml-4 text-current opacity-70 hover:opacity-100" onclick="this.parentElement.remove()">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @param {string} defaultMessage - Default error message
 */
function handleApiError(error, defaultMessage = 'An error occurred') {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.message.includes('Connection failed')) {
        showNotification('Cannot connect to server. Please check your internet connection.', 'error');
    } else if (error.message.includes('Endpoint not found')) {
        showNotification('API endpoint not found. Please check your configuration.', 'error');
    } else if (error.message.includes('Internal server error')) {
        showNotification('Server error. Please try again later.', 'error');
    } else {
        showNotification(defaultMessage + ': ' + error.message, 'error');
    }
}

/**
 * Format date to readable format
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: IDR)
 * @returns {string} Formatted currency
 */
function formatCurrency(amount, currency = 'IDR') {
    if (!amount || isNaN(amount)) return 'N/A';
    
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate a random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
function generateRandomString(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} True if successful
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            return result;
        }
    } catch (error) {
        console.error('Failed to copy text: ', error);
        return false;
    }
}

/**
 * Initialize theme toggle (non-functional as per requirements)
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Theme toggle is intentionally non-functional
            showNotification('Theme toggle is not available in this version', 'info');
        });
    }
}

/**
 * Add animation to elements
 */
function initAnimations() {
    // Add fade-in animation to cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
            }
        });
    });

    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });
}

/**
 * Initialize mobile menu
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

/**
 * Check for URL parameters and handle actions
 */
function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle edit parameter
    if (urlParams.get('edit')) {
        // Trigger edit mode
        const editId = urlParams.get('edit');
        // Implementation depends on page
    }
    
    // Handle client parameter for new project
    if (urlParams.get('client')) {
        const clientId = urlParams.get('client');
        // Pre-fill client in project form
        const clientSelect = document.getElementById('client-id');
        if (clientSelect) {
            clientSelect.value = clientId;
        }
    }
}

// Initialize all functions on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initAnimations();
    initMobileMenu();
    handleUrlParams();
});