// Modern JavaScript for ArmanLeads.com
// No dependencies, accessible, resilient

(function() {
    'use strict';

    // Utility functions
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

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 1. Preloader
    function initPreloader() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;

        window.addEventListener('load', () => {
            preloader.classList.add('fade-out');
            setTimeout(() => {
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 350);
        });
    }

    // 2. Sticky navbar
    function initStickyNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        const handleScroll = throttle(() => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 16);

        window.addEventListener('scroll', handleScroll);
    }

    // 3. Mobile navigation
    function initMobileNav() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        if (!navToggle || !navMenu) return;

        let isOpen = false;

        function openMenu() {
            isOpen = true;
            navToggle.setAttribute('aria-expanded', 'true');
            navMenu.classList.add('active');
            document.body.classList.add('modal-open');
        }

        function closeMenu() {
            isOpen = false;
            navToggle.setAttribute('aria-expanded', 'false');
            navMenu.classList.remove('active');
            document.body.classList.remove('modal-open');
            navToggle.focus();
        }

        navToggle.addEventListener('click', () => {
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (isOpen && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                closeMenu();
            }
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) {
                closeMenu();
            }
        });

        // Close on nav link click (mobile)
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 767) {
                    closeMenu();
                }
            });
        });
    }

    // 4. Smooth navigation
    function initSmoothNavigation() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        const navbar = document.getElementById('navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 80;

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const targetPosition = target.offsetTop - navbarHeight - 20;
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Active link highlighting with Intersection Observer
        const sections = document.querySelectorAll('section[id]');
        if (sections.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: `-${navbarHeight + 50}px 0px -50% 0px`,
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.getAttribute('id');
                const navLink = document.querySelector(`.nav-link[href="#${id}"]`);
                
                if (entry.isIntersecting) {
                    // Remove active from all nav links
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                    });
                    // Add active to current
                    if (navLink) {
                        navLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // 5. Business type selector
    function initBusinessTypeSelector() {
        const businessTypeCards = document.querySelectorAll('.business-type-card');
        const businessTypeInput = document.getElementById('business-type');
        
        if (!businessTypeInput || businessTypeCards.length === 0) return;

        businessTypeCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active from all cards
                businessTypeCards.forEach(c => c.classList.remove('active'));
                
                // Add active to clicked card
                card.classList.add('active');
                
                // Update hidden input value
                const businessType = card.getAttribute('data-type');
                businessTypeInput.value = businessType || 'dental';
            });
        });
    }

    // 6. Contact form
    function initContactForm() {
        const form = document.getElementById('contact-form');
        const submitButton = form?.querySelector('.btn-submit');
        const successMessage = document.getElementById('form-success');
        
        if (!form) return;

        // Client-side validation
        function validateForm() {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = 'var(--color-error)';
                } else {
                    field.style.borderColor = '';
                }
            });

            // Email validation
            const emailField = form.querySelector('input[type="email"]');
            if (emailField && emailField.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailField.value)) {
                    isValid = false;
                    emailField.style.borderColor = 'var(--color-error)';
                }
            }

            return isValid;
        }

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }

            // Check honeypot
            const honeypot = form.querySelector('input[name="website_url"]');
            if (honeypot && honeypot.value) {
                return; // Silent fail for bots
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            }

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    if (successMessage) {
                        successMessage.classList.add('show');
                    }
                    form.reset();
                    // Reset business type to default
                    const businessTypeInput = document.getElementById('business-type');
                    if (businessTypeInput) {
                        businessTypeInput.value = 'dental';
                    }
                    // Reset active business type card
                    const businessTypeCards = document.querySelectorAll('.business-type-card');
                    businessTypeCards.forEach(card => {
                        card.classList.remove('active');
                        if (card.getAttribute('data-type') === 'dental') {
                            card.classList.add('active');
                        }
                    });
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                alert('There was an error sending your message. Please try again or contact us directly.');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Send My Free Audit';
                }
            }
        });

        // Clear validation styles on input
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.style.borderColor = '';
            });
        });
    }

    // 7. Calendly modal
    function initCalendlyModal() {
        const trigger = document.getElementById('calendly-trigger');
        const modal = document.getElementById('calendly-modal');
        const iframe = document.getElementById('calendly-iframe');
        const closeButtons = modal?.querySelectorAll('[data-close-modal]');
        
        if (!trigger || !modal) return;

        let isModalOpen = false;
        let focusableElements = [];
        let firstFocusableElement = null;
        let lastFocusableElement = null;
        let iframeSrcSet = false;

        function updateFocusableElements() {
            focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            firstFocusableElement = focusableElements[0];
            lastFocusableElement = focusableElements[focusableElements.length - 1];
        }

        function openModal() {
            isModalOpen = true;
            modal.classList.add('active');
            document.body.classList.add('modal-open');
            modal.setAttribute('aria-hidden', 'false');

            // Lazy load iframe src
            if (!iframeSrcSet && iframe) {
                iframe.src = 'https://calendly.com/vrmvn0/meeting'; // Replace with actual Calendly link
                iframeSrcSet = true;
            }

            updateFocusableElements();
            if (firstFocusableElement) {
                firstFocusableElement.focus();
            }
        }

        function closeModal() {
            isModalOpen = false;
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
            modal.setAttribute('aria-hidden', 'true');
            trigger.focus();
        }

        // Open modal
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });

        // Close modal
        if (closeButtons) {
            closeButtons.forEach(button => {
                button.addEventListener('click', closeModal);
            });
        }

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (!isModalOpen) return;

            if (e.key === 'Escape') {
                closeModal();
            }

            // Focus trap
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    // Shift + Tab
                    if (document.activeElement === firstFocusableElement) {
                        e.preventDefault();
                        if (lastFocusableElement) lastFocusableElement.focus();
                    }
                } else {
                    // Tab
                    if (document.activeElement === lastFocusableElement) {
                        e.preventDefault();
                        if (firstFocusableElement) firstFocusableElement.focus();
                    }
                }
            }
        });

        modal.setAttribute('aria-hidden', 'true');
    }

    // Initialize everything when DOM is ready
    function init() {
        initPreloader();
        initStickyNavbar();
        initMobileNav();
        initSmoothNavigation();
        initBusinessTypeSelector();
        initContactForm();
        initCalendlyModal();
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();