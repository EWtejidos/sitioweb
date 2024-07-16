document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href="sobre-nosotros.html"]').forEach(function(element) {
        element.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = 'sobre-nosotros.html';
        });
    });
});
