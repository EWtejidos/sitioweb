const loginForm = document.querySelector("#loginForm");
const submitButton = loginForm?.querySelector('button[type="submit"]');
const loginBox = document.querySelector(".login-box");

if (loginForm && submitButton && loginBox) {
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.querySelector("#username")?.value.trim();
    const password = document.querySelector("#password")?.value.trim();

    if (!username || !password) {
      return;
    }

    loginBox.classList.add("is-submitting");
    submitButton.classList.add("is-loading");
    submitButton.textContent = "Validando...";

    window.setTimeout(() => {
      submitButton.textContent = "Acceso listo";
    }, 900);
  });
}
