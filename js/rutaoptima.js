const proposedRoute = document.getElementById("proposedRoute");
const optimizerResults = document.getElementById("optimizerResults");
const routeForm = document.getElementById("routeForm");

renderOptimizer();

routeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderOptimizer(true);
});

document.getElementById("openRouteMap").addEventListener("click", () => {
  document.querySelector(".proposed-route .panel-kicker").textContent = "Mapa listo";
});

document.getElementById("openResultsMap").addEventListener("click", () => {
  document.querySelector(".results-panel .panel-kicker").textContent = "Mapa sincronizado";
});

function renderOptimizer(highlight) {
  proposedRoute.innerHTML = window.transportistaData.optimizerProposal
    .map((step) => `<li>${step}</li>`)
    .join("");

  optimizerResults.innerHTML = window.transportistaData.optimizerResults
    .map(
      (item) => `
        <article class="result-item"${highlight ? ' style="box-shadow: 0 0 0 2px rgba(111, 130, 66, 0.18);"' : ""}>
          <strong>Parada ${item.stop}</strong>
          <span>${item.detail}</span>
          <span class="mini-copy">ETA estimada: ${item.eta}</span>
        </article>
      `
    )
    .join("");
}
