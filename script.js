// ==========================================================================
// SolidCore Scout - Form Submission Handler
// ==========================================================================

// HubSpot Configuration
// TODO: Replace these with your actual HubSpot credentials
const HUBSPOT_CONFIG = {
    portalId: '244240697',     // e.g., '244240697'
    formGuid: '15fe16cb-1245-4ae8-91fb-a031f9589fd3'      // e.g., '15fe16cb-1245-4ae8-91fb-a031f9589fd3'
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Scout landing page initialized');
    initFormHandlers();
});

// ==========================================================================
// Form Handler Initialization
// ==========================================================================
function initFormHandlers() {
    // Get both forms
    const heroForm = document.getElementById('heroForm');
    const ctaForm = document.getElementById('ctaForm');
    
    // Add submit listeners to both forms
    if (heroForm) {
        heroForm.addEventListener('submit', handleFormSubmit);
        console.log('Hero form handler attached');
    }
    
    if (ctaForm) {
        ctaForm.addEventListener('submit', handleFormSubmit);
        console.log('CTA form handler attached');
    }
}

// ==========================================================================
// Form Submit Handler
// ==========================================================================
function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const email = emailInput.value.trim();
    
    // Validate email
    if (!validateEmail(email)) {
        showError(emailInput, 'Please enter a valid email address');
        return;
    }
    
    // Clear any previous errors
    clearError(emailInput);
    
    // Show loading state
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = 'Submitting...';
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    
    // Submit to HubSpot
    submitToHubSpot(email)
        .then(response => {
            console.log('Form submitted successfully:', response);
            
            // Show success message
            showSuccessModal();
            
            // Reset form
            form.reset();
        })
        .catch(error => {
            console.error('Form submission error:', error);
            alert('Something went wrong. Please try again or contact support@solidcore.ai');
        })
        .finally(() => {
            // Restore button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            submitButton.classList.remove('loading');
        });
}

// ==========================================================================
// HubSpot API Submission
// ==========================================================================
function submitToHubSpot(email) {
    const { portalId, formGuid } = HUBSPOT_CONFIG;
    
    // Check if credentials are configured
    if (portalId === 'YOUR_PORTAL_ID' || formGuid === 'YOUR_FORM_GUID') {
        console.warn('HubSpot credentials not configured. Update HUBSPOT_CONFIG in script.js');
        // For testing without HubSpot, still show success
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Test mode - no actual submission' });
            }, 1000);
        });
    }
    
    const apiUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;
    
    const data = {
        fields: [
            {
                name: 'email',
                value: email
            }
        ],
        context: {
            pageUri: window.location.href,
            pageName: document.title,
            hutk: getCookie('hubspotutk') // HubSpot tracking cookie
        },
        legalConsentOptions: {
            consent: {
                consentToProcess: true,
                text: "I agree to allow SolidCore to store and process my personal data.",
                communications: [
                    {
                        value: true,
                        subscriptionTypeId: 999,
                        text: "I agree to receive marketing communications from SolidCore."
                    }
                ]
            }
        }
    };
    
    return fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HubSpot API error: ${response.status}`);
        }
        return response.json();
    });
}

// ==========================================================================
// Email Validation
// ==========================================================================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==========================================================================
// Error Handling
// ==========================================================================
function showError(input, message) {
    // Add error class to input
    input.classList.add('error');
    
    // Check if error message already exists
    let errorMsg = input.parentElement.querySelector('.error-message');
    
    if (!errorMsg) {
        errorMsg = document.createElement('span');
        errorMsg.className = 'error-message';
        input.parentElement.appendChild(errorMsg);
    }
    
    errorMsg.textContent = message;
    
    // Remove error after 3 seconds
    setTimeout(() => {
        clearError(input);
    }, 3000);
}

function clearError(input) {
    input.classList.remove('error');
    const errorMsg = input.parentElement.querySelector('.error-message');
    if (errorMsg) {
        errorMsg.remove();
    }
}

// ==========================================================================
// Success Modal
// ==========================================================================
function showSuccessModal() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'success-modal';
    
    modal.innerHTML = `
        <div class="success-icon">✓</div>
        <h3 class="success-title">Thank You!</h3>
        <p class="success-message">
            We've received your request. Our team will reach out soon with your free AWS AI discovery scan results.
        </p>
        <button class="success-button" onclick="closeSuccessModal()">
            Got it!
        </button>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeSuccessModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', handleEscapeKey);
}

function closeSuccessModal() {
    const overlay = document.querySelector('.success-overlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
    
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeSuccessModal();
    }
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// ==========================================================================
// Utility Functions
// ==========================================================================

// Get cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}

// Log configuration on load (for debugging)
console.log('HubSpot Configuration:', {
    portalId: HUBSPOT_CONFIG.portalId,
    formGuid: HUBSPOT_CONFIG.formGuid,
    configured: HUBSPOT_CONFIG.portalId !== 'YOUR_PORTAL_ID'
});

// ==========================================================================
// Analytics & Tracking (Optional)
// ==========================================================================

// Track form views
window.addEventListener('load', function() {
    // Add your analytics tracking here
    console.log('Page loaded - forms ready');
});

// Export functions for testing (optional)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateEmail,
        submitToHubSpot,
        closeSuccessModal
    };
}
