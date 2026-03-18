const aboutCards = document.querySelectorAll(".about-card");

function syncAboutPage() {
  window.EWCart.syncCounters();
}

aboutCards.forEach((card, index) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(24px)";
  card.style.transition = "opacity 500ms ease, transform 500ms ease";

  setTimeout(() => {
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";
  }, 160 * (index + 1));
});

window.addEventListener("ew:cart-updated", syncAboutPage);
syncAboutPage();
