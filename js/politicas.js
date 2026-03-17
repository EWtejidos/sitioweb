// JavaScript for Politicas de Privacidad page

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll for any internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add fade-in animation to sections on scroll
    const sections = document.querySelectorAll('.policy-container h2, .policy-container p, .policy-container ul');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Button hover effect
    const backButton = document.querySelector('.primary');
    if (backButton) {
        backButton.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 20px rgba(139, 214, 111, 0.6)';
        });
        backButton.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    }

    // Update date dynamically (example)
    const updateElement = document.querySelector('.update');
    if (updateElement) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        updateElement.textContent = `Última actualización: ${formattedDate}`;
    }
});