/**
 * Contact Form Handler
 * Sends contact form submissions directly to Gmail using Web3Forms
 */

const RECIPIENT_EMAIL = 'aivahnt@gmail.com';
const WEB3FORMS_ACCESS_KEY = '5c6e8329-445b-4d50-b0df-dfa18d7d3c52'; // Web3Forms public key

/**
 * Initialize contact form when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactFormSubmit);
  }
});

/**
 * Handle contact form submission
 */
async function handleContactFormSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('.form-submit-btn');
  const statusMessage = document.getElementById('form-status-message');
  
  // Get form data
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');
  
  const formData = new FormData();
  formData.append('access_key', WEB3FORMS_ACCESS_KEY);
  formData.append('name', nameInput.value);
  formData.append('email', emailInput.value);
  formData.append('message', messageInput.value);
  formData.append('subject', `New Contact Form Message from ${nameInput.value}`);
  formData.append('from_name', 'Aivahn Torres Portfolio');
  formData.append('redirect', false);
  
  // Validate form
  if (!nameInput.value.trim() || !emailInput.value.trim() || !messageInput.value.trim()) {
    showStatus('Please fill in all fields.', 'error', statusMessage);
    return;
  }
  
  // Disable submit button and show loading state
  submitBtn.disabled = true;
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  statusMessage.textContent = '';
  
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Success
      showStatus('Message sent successfully! I\'ll get back to you soon.', 'success', statusMessage);
      form.reset();
    } else {
      showStatus('Failed to send message. Please try again.', 'error', statusMessage);
    }
    
  } catch (error) {
    console.error('Error sending message:', error);
    showStatus('Failed to send message. Please try again or email me directly at ' + RECIPIENT_EMAIL, 'error', statusMessage);
    
  } finally {
    // Re-enable submit button
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

/**
 * Show status message to user
 */
function showStatus(message, type, statusElement) {
  statusElement.textContent = message;
  statusElement.className = `form-status-message form-status-${type}`;
  
  // Auto-clear success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      statusElement.textContent = '';
      statusElement.className = 'form-status-message';
    }, 5000);
  }
}
