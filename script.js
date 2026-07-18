/**
 * Proman Prostate Landing Page - Interactive Scripts
 */

// Fallback for process.env when running raw in browser without bundlers
if (typeof process === 'undefined') {
    window.process = { env: {} };
}

document.addEventListener('DOMContentLoaded', () => {
    // === 1. Synchronized Countdown Timer with Session Persistence ===
    const TIMER_DURATION_KEY = 'proman_timer_seconds';
    const DEFAULT_SECONDS = 30 * 60; // 30 minutes

    let timeRemaining = DEFAULT_SECONDS;

    // Check if there is an active timer in sessionStorage
    const storedTime = sessionStorage.getItem(TIMER_DURATION_KEY);
    if (storedTime) {
        timeRemaining = parseInt(storedTime, 10);
    } else {
        sessionStorage.setItem(TIMER_DURATION_KEY, timeRemaining.toString());
    }

    const timerElements = [
        document.getElementById('timer-top'),
        document.getElementById('timer-bottom')
    ];

    function updateTimers() {
        if (timeRemaining <= 0) {
            // Reset to 30 minutes once it hits zero to keep the urgency campaign active
            timeRemaining = DEFAULT_SECONDS;
        }

        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;

        // Format to double digits (e.g. 02:05)
        const minStr = minutes.toString().padStart(2, '0');
        const secStr = seconds.toString().padStart(2, '0');

        timerElements.forEach(timer => {
            if (timer) {
                const minEl = timer.querySelector('.minutes');
                const secEl = timer.querySelector('.seconds');
                if (minEl) minEl.textContent = minStr;
                if (secEl) secEl.textContent = secStr;
            }
        });

        // Save current state and decrement
        timeRemaining--;
        sessionStorage.setItem(TIMER_DURATION_KEY, timeRemaining.toString());
    }

    // Run immediately, then every second
    updateTimers();
    const timerInterval = setInterval(updateTimers, 1000);


    // === 2. Smooth Scrolling to Anchor Links ===
    const navLinks = document.querySelectorAll('.nav-link, .order-btn-nav, .footer-links a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = document.querySelector('.main-header').offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });


    // === 3. Modal Popup Controls ===
    const successModal = document.getElementById('success-modal');
    const privacyModal = document.getElementById('privacy-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const closePrivacyModalBtn = document.getElementById('close-privacy-modal');
    const openPrivacyLink = document.querySelector('.open-privacy');

    function openModal(modal) {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Disable page scrolling
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Re-enable page scrolling
        }
    }

    // Modal close listeners
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => closeModal(successModal));
    }
    if (closePrivacyModalBtn) {
        closePrivacyModalBtn.addEventListener('click', () => closeModal(privacyModal));
    }

    if (openPrivacyLink) {
        openPrivacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(privacyModal);
        });
    }

    // Close on overlay clicking
    window.addEventListener('click', (e) => {
        if (e.target === successModal) closeModal(successModal);
        if (e.target === privacyModal) closeModal(privacyModal);
    });

    // Close on Escape key press
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(successModal);
            closeModal(privacyModal);
        }
    });


    // === 4. Form Validation and Submission Handling ===
    const orderForms = [
        document.getElementById('order-form-top'),
        document.getElementById('order-form-bottom')
    ];

    orderForms.forEach(form => {
        if (form) {
            const nameInput = form.querySelector('input[name="name"]');
            const phoneInput = form.querySelector('input[name="phone"]');

            // Restrict name input dynamically to letters (English & Hindi) and spaces only
            if (nameInput) {
                nameInput.addEventListener('input', () => {
                    nameInput.value = nameInput.value.replace(/[^a-zA-Z\u0900-\u097F\s]/g, '');
                });
            }

            // Restrict phone input dynamically to digits only, maximum 10 digits
            if (phoneInput) {
                phoneInput.setAttribute('maxlength', '10');
                phoneInput.addEventListener('input', () => {
                    phoneInput.value = phoneInput.value.replace(/[^0-9]/g, '');
                });
            }

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                let isValid = true;

                // Name Validation (Only alphabets and spaces, length >= 2)
                const nameValue = nameInput.value.trim();
                const nameRegex = /^[a-zA-Z\u0900-\u097F\s]{2,}$/;
                if (!nameRegex.test(nameValue)) {
                    nameInput.style.borderColor = 'var(--color-red)';
                    isValid = false;
                } else {
                    nameInput.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }

                // Phone Validation (Exactly 10 digits)
                const phoneValue = phoneInput.value.trim();
                const phoneRegex = /^[0-9]{10}$/;
                if (!phoneRegex.test(phoneValue)) {
                    phoneInput.style.borderColor = 'var(--color-red)';
                    isValid = false;
                } else {
                    phoneInput.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }

                if (isValid) {
                    const submitBtn = form.querySelector('button[type="submit"]');
                    const originalBtnText = submitBtn.textContent;

                    // Disable button and show processing state to user
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'भेजा जा रहा है...';

                    // Duplicate Lead Prevention Check (Client-side)
                    const normalizedPhone = phoneValue.replace(/\D/g, "");
                    let submittedPhones = [];
                    try {
                        submittedPhones = JSON.parse(localStorage.getItem('proman_submitted_leads') || '[]');
                    } catch (e) {
                        submittedPhones = [];
                    }

                    if (submittedPhones.includes(normalizedPhone)) {
                        console.warn('Duplicate lead prevented for number:', phoneValue);
                        // Mimic successful submission flow for UX consistency
                        setTimeout(() => {
                            submitBtn.disabled = false;
                            submitBtn.textContent = originalBtnText;
                            nameInput.value = '';
                            phoneInput.value = '';
                            openModal(successModal);
                        }, 500);
                        return;
                    }

                    // Save lead to local storage immediately to prevent rapid double-submits
                    submittedPhones.push(normalizedPhone);
                    try {
                        localStorage.setItem('proman_submitted_leads', JSON.stringify(submittedPhones));
                    } catch (e) {
                        console.error('Failed to save to localStorage:', e);
                    }

                    const payload = {
                        name: nameValue,
                        Name: nameValue,
                        NAME: nameValue,
                        
                        phone: phoneValue,
                        Phone: phoneValue,
                        PHONE: phoneValue,
                        
                        contact: phoneValue,
                        Contact: phoneValue,
                        CONTACT: phoneValue,
                        
                        number: phoneValue,
                        Number: phoneValue,
                        NUMBER: phoneValue
                    };

                    // Prepare URLSearchParams for Google Sheets Webhook
                    const queryParams = new URLSearchParams(payload);

                    // Use environment variable from Cloudflare build settings (defined in vite.config.js) or fall back to default
                    const baseWebhookUrl = process.env.webhook || 'https://script.google.com/macros/s/AKfycbziPOCKVsfNsOBHMwrsTK5oVZ3PRjldEBq_qqLg8P4uJurU3Hg3p_faerZlxV1y0s13/exec';
                    const webhookUrl = `${baseWebhookUrl}?${queryParams.toString()}`;

                    // Send POST request to Google Sheets Webhook
                    const webhookPromise = fetch(webhookUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    // Prepare CRM credentials and variables
                    const crmUrl = process.env.CRM_URL || 'https://macherbs.com/apileads/leads.php';
                    const crmChannelId = process.env.CRM_CHANNEL_ID || 'AJT-XENOLIVE';
                    const crmProductId = process.env.CRM_PRODUCT_ID || '105';
                    const crmToken = process.env.CRM_TOKEN || 'M6JNcKxcNszQwNYZW';

                    const crmParams = new URLSearchParams();
                    crmParams.append('name', nameValue);
                    crmParams.append('number', phoneValue); // CRM API expects 'number' for phone/mobile
                    crmParams.append('phone', phoneValue);
                    crmParams.append('channel_id', crmChannelId);
                    crmParams.append('channel', crmChannelId);
                    crmParams.append('product_id', crmProductId);
                    crmParams.append('product', crmProductId);
                    crmParams.append('token', crmToken);

                    // Send POST request to CRM URL
                    const crmPromise = fetch(crmUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        body: crmParams
                    });

                    Promise.all([webhookPromise, crmPromise])
                    .then(() => {
                        // Reset button state
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;

                        // Clear inputs
                        nameInput.value = '';
                        phoneInput.value = '';

                        // Trigger success modal popup
                        openModal(successModal);
                    })
                    .catch((error) => {
                        console.error('Error submitting order:', error);
                        
                        // Reset button state and fallback to modal anyway for seamless UX
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                        
                        nameInput.value = '';
                        phoneInput.value = '';
                        
                        openModal(successModal);
                    });
                }
            });
        }
    });
});
