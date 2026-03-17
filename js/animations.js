// Animations for Ethereal Whispers

document.addEventListener('DOMContentLoaded', function() {
    // Add loaded class to body for CSS transitions
    document.body.classList.add('loaded');

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.card, .alihada-info, .policy-container').forEach(el => {
        observer.observe(el);
    });

    // Button click animations
    document.querySelectorAll('.primary, .secondary').forEach(button => {
        button.addEventListener('click', function(e) {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Logo hover effect
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('mouseenter', function() {
            this.style.filter = 'drop-shadow(0 0 20px rgba(139, 214, 111, 0.8))';
        });
        logo.addEventListener('mouseleave', function() {
            this.style.filter = 'drop-shadow(0 0 47px rgba(56, 228, 93, 0.747))';
        });
    }

    // Form input focus effects
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.boxShadow = '0 0 10px rgba(139, 214, 111, 0.5)';
        });
        input.addEventListener('blur', function() {
            this.parentElement.style.boxShadow = '';
        });
    });
});