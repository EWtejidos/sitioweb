const policySections = document.querySelectorAll(".policy-block");
const policyDate = document.getElementById("policyDate");

policySections.forEach((section, index) => {
  section.style.opacity = "0";
  section.style.transform = "translateY(24px)";
  section.style.transition = "opacity 500ms ease, transform 500ms ease";

  setTimeout(() => {
    section.style.opacity = "1";
    section.style.transform = "translateY(0)";
  }, 120 * (index + 1));
});

if (policyDate) {
  const formattedDate = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  policyDate.textContent = `Ultima actualizacion: ${formattedDate}`;
}
