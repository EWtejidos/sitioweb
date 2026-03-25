const loginForm = document.querySelector("#loginForm");
const submitButton = loginForm?.querySelector('button[type="submit"]');
const loginBox = document.querySelector(".login-box");
const requiredFields = loginForm?.querySelectorAll("input[required], select[required]");

if (loginForm && submitButton && loginBox) {
  requiredFields?.forEach((field) => {
    const eventName = field.tagName === "SELECT" ? "change" : "input";

    field.addEventListener(eventName, () => {
      field.classList.remove("is-invalid");
    });
  });

  loginForm.addEventListener("submit", (event) => {
    let hasErrors = false;

    requiredFields?.forEach((field) => {
      const isEmpty = !field.value.trim();
      field.classList.toggle("is-invalid", isEmpty);
      hasErrors = hasErrors || isEmpty;
    });

    if (hasErrors) {
      event.preventDefault();
      return;
    }

    loginBox.classList.add("is-submitting");
    submitButton.classList.add("is-loading");
    submitButton.textContent = "Validando...";

  });
}
