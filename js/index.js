document.addEventListener("DOMContentLoaded", () => {

  const logo = document.querySelector(".logo");
  const title = document.querySelector("h1");
  const buttons = document.querySelectorAll(".cta button");

  /* ENTRADA SUAVE */

  logo.style.opacity = 0;
  logo.style.transform = "scale(0.6)";

  setTimeout(() => {
    logo.style.transition = "all 1.4s cubic-bezier(.17,.67,.83,.67)";
    logo.style.opacity = 1;
    logo.style.transform = "scale(1)";
  }, 200);

  title.style.opacity = 0;
  title.style.transform = "translateY(60px)";

  setTimeout(() => {
    title.style.transition = "all 1.4s ease";
    title.style.opacity = 1;
    title.style.transform = "translateY(0px)";
  }, 600);
 
    const search = document.querySelector(".search");

    search.style.opacity = 0;
    search.style.transform = "translateY(40px)";

    setTimeout(() => {
    search.style.transition = "all 1s ease";
    search.style.opacity = 1;
    search.style.transform = "translateY(0)";
    }, 800);

  
  buttons.forEach((btn, index) => {
    btn.style.opacity = 0;
    btn.style.transform = "translateY(30px)";

    setTimeout(() => {
      btn.style.transition = "all 0.8s ease";
      btn.style.opacity = 1;
      btn.style.transform = "translateY(0)";
    }, 1000 + index * 200);
  });

 
  /* BRILLO SUTIL EN TITULO */

  setInterval(() => {
    title.style.textShadow = "0 0 60px rgba(255,215,120,0.9)";
    setTimeout(() => {
      title.style.textShadow = "0 0 35px rgba(255,215,120,0.6)";
    }, 1200);
  }, 3500);

  

});

document.querySelectorAll(".cta button, .card button").forEach(btn => {

  btn.addEventListener("mousemove", e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.08)`;
  });

  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "translate(0,0) scale(1)";
  });

});

document.querySelectorAll(".card").forEach(card => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".card").forEach(c => c.classList.remove("active"));
    card.classList.add("active");
  });
});