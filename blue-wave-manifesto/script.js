// Google Tag Manager Events
function gtag() {
    dataLayer.push(arguments);
}

// Track page view
gtag('event', 'page_view', {
    page_title: 'Blue Wave Manifesto',
    page_location: window.location.href
});

// Share functionality
async function shareManifesto() {
    const shareData = {
        title: 'Blue Wave Manifesto - The Constitution of Conversational Commerce',
        text: 'The world\'s first conversational shopping marketplace. Experience the future of commerce with AI-powered shopping companions.',
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            gtag('event', 'share', {
                event_category: 'engagement',
                event_label: 'web_share_api',
                method: 'native'
            });
        } else {
            // Fallback to clipboard
            await navigator.clipboard.writeText(window.location.href);
            showToast('Link copied to clipboard!');
            gtag('event', 'share', {
                event_category: 'engagement',
                event_label: 'clipboard',
                method: 'clipboard'
            });
        }
    } catch (error) {
        console.error('Share failed:', error);
        gtag('event', 'share_error', {
            event_category: 'error',
            event_label: error.message
        });
    }
}

// Toast notification
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 191, 255, 0.9);
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-weight: 600;
        z-index: 10000;
        backdrop-filter: blur(10px);
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Lead form submission
document.getElementById('leadForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        interest: document.getElementById('interest').value,
        timestamp: new Date().toISOString(),
        source: 'Blue Wave Manifesto'
    };
    
    try {
        // Replace with your actual endpoint
        const response = await fetch('/api/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showToast('Welcome to the Blue Wave! We\'ll be in touch soon.');
            gtag('event', 'form_submit', {
                event_category: 'lead_generation',
                event_label: 'success',
                value: 1
            });
            this.reset();
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showToast('Something went wrong. Please try again.');
        gtag('event', 'form_submit', {
            event_category: 'lead_generation',
            event_label: 'error'
        });
    }
});

// Smooth scrolling for navigation
document.querySelectorAll('.nav-chip').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Update active nav chip
            document.querySelectorAll('.nav-chip').forEach(chip => chip.classList.remove('active'));
            this.classList.add('active');
            
            gtag('event', 'nav_click', {
                event_category: 'navigation',
                event_label: targetId
            });
        }
    });
});

// Track download events
document.querySelectorAll('.press-download').forEach(link => {
    link.addEventListener('click', function() {
        const fileName = this.getAttribute('href').split('/').pop();
        gtag('event', 'download', {
            event_category: 'press_kit',
            event_label: fileName
        });
    });
});

// Scroll depth tracking
let maxScroll = 0;
window.addEventListener('scroll', () => {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    
    if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        
        // Track at 25%, 50%, 75%, 100%
        if ([25, 50, 75, 100].includes(scrollPercent)) {
            gtag('event', 'scroll_depth', {
                event_category: 'engagement',
                event_label: `${scrollPercent}%`,
                value: scrollPercent
            });
        }
    }
});

// Section impression tracking
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -10% 0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id || entry.target.className;
            gtag('event', 'section_view', {
                event_category: 'engagement',
                event_label: sectionId
            });
        }
    });
}, observerOptions);

// Observe all major sections
document.querySelectorAll('section').forEach(section => {
    sectionObserver.observe(section);
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);