/**
 * Proman Prostate Landing Page - Interactive Scripts
 */

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
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const nameInput = form.querySelector('input[name="name"]');
                const phoneInput = form.querySelector('input[name="phone"]');
                
                let isValid = true;

                // Basic Name Validation (Length Check)
                if (nameInput.value.trim().length < 2) {
                    nameInput.style.borderColor = 'var(--color-red)';
                    isValid = false;
                } else {
                    nameInput.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }

                // Phone Validation (Must contain only digits and basic symbols like +, -, spaces, length 8-15)
                const phoneRegex = /^[+]?[0-9\s\-]{8,15}$/;
                if (!phoneRegex.test(phoneInput.value.trim())) {
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

                    // Prepare payload
                    const nameValue = nameInput.value.trim();
                    const phoneValue = phoneInput.value.trim();

                    const payload = {
                        name: nameValue,
                        phone: phoneValue,
                        contact: phoneValue
                    };

                    // Prepare URL with query parameters for maximum compatibility with e.parameter
                    const queryParams = new URLSearchParams();
                    queryParams.append('name', nameValue);
                    queryParams.append('phone', phoneValue);
                    queryParams.append('contact', phoneValue);

                    // Use environment variable from Cloudflare build settings (defined in vite.config.js) or fall back to default
                    const baseWebhookUrl = process.env.webhook || 'https://script.google.com/macros/s/AKfycbxCkSWV7o5p0Y4dxB1KIPdpKhFLCSDLmhkxJDXJcm-9uZtYnSdyjlXHvXDqRwC2yMEw/exec';
                    const webhookUrl = `${baseWebhookUrl}?${queryParams.toString()}`;

                    // Send POST request (using no-cors mode to bypass Google Script redirection rules)
                    fetch(webhookUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    })
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
