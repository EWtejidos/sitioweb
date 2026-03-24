window.adminCommon = {
  workflowSteps: [
    { label: "Orden creada", meta: "18 ordenes registradas hoy", variant: "is-active" },
    { label: "Anticipo recibido", meta: "3 pendientes por revisar", variant: "is-active" },
    { label: "Validacion admin", meta: "1 comprobante con alerta", variant: "is-problem" },
    { label: "Tejedor asignado", meta: "2 sin asignar", variant: "is-active" },
    { label: "Produccion", meta: "5 en curso", variant: "is-active" },
    { label: "Pago final", meta: "2 por aprobar", variant: "is-active" },
    { label: "Validacion final", meta: "Contabilidad al dia", variant: "" },
    { label: "Entrega", meta: "1 ruta urgente hoy", variant: "is-active" }
  ],
  renderSummaryCards(container) {
    const data = window.adminData;
    const cards = [
      { label: "Anticipos por validar", value: data.anticipos.filter((item) => item.status === "pendiente").length, meta: "Pagos pendientes de decision", trend: "Atender antes de asignar" },
      { label: "Ordenes sin tejedor", value: data.preAsignacion.filter((item) => !item.assigned).length, meta: "Necesitan respuesta operativa", trend: "Escribir hoy a tejedoras" },
      { label: "Pagos finales abiertos", value: data.pagoFinal.filter((item) => item.status !== "aprobado").length, meta: "Listos para revision administrativa", trend: "Validacion contable activa" },
      { label: "Entregas proximas", value: data.entregasProximas.length, meta: "Urgentes primero en la ruta", trend: "1 entrega critica manana" }
    ];

    container.innerHTML = cards
      .map(
        (card) => `
          <article class="stat-card admin-stat-card">
            <p class="stat-label">${card.label}</p>
            <p class="stat-value">${card.value}</p>
            <span class="stat-meta">${card.meta}</span>
            <span class="stat-trend">${card.trend}</span>
          </article>
        `
      )
      .join("");
  },
  renderWorkflow(container) {
    container.innerHTML = this.workflowSteps
      .map(
        (step, index) => `
          <article class="workflow-step ${step.variant}">
            <span class="workflow-index">${index + 1}</span>
            <h4 class="workflow-label">${step.label}</h4>
            <span class="workflow-meta">${step.meta}</span>
          </article>
        `
      )
      .join("");
  },
  formatStatus(status) {
    return status.replace(/-/g, " ");
  },
  normalizeStatusClass(status) {
    return status.toLowerCase().replace(/\s+/g, "-");
  },
  setStatus(target, message) {
    if (target) {
      target.textContent = message;
    }
  }
};
