window.adminData = {
  anticipos: [
    {
      id: 4102,
      cliente: "Daniela Rios",
      whatsappProof: "images/products/flor.jpg",
      bankProof: "images/products/top.jpg",
      similarity: 96,
      status: "pendiente",
      total: "$ 180.000",
      referencia: "Amigurumi bouquet premium"
    },
    {
      id: 4103,
      cliente: "Laura Castro",
      whatsappProof: "images/products/tortuga.jpg",
      bankProof: "images/products/flor.jpg",
      similarity: 99,
      status: "aprobado",
      total: "$ 240.000",
      referencia: "Set tortuga oceano"
    },
    {
      id: 4104,
      cliente: "Maria Fernanda Solis",
      whatsappProof: "images/products/top.jpg",
      bankProof: "images/products/tortuga.jpg",
      similarity: 62,
      status: "problema",
      total: "$ 320.000",
      referencia: "Top tejido personalizado"
    }
  ],
  preAsignacion: [
    { id: 5101, cliente: "Juliana Perez", producto: "Bolso garden", fecha: "2026-03-29", assigned: false, weaver: "Sin asignar", price: "$ 210.000" },
    { id: 5102, cliente: "Sandra Mejia", producto: "Conejo bridal", fecha: "", assigned: false, weaver: "Sin asignar", price: "$ 165.000" },
    { id: 5103, cliente: "Kelly Duarte", producto: "Sombrero custom", fecha: "2026-03-31", assigned: true, weaver: "Nadia Lopez", price: "$ 140.000" }
  ],
  produccion: [
    { id: 6201, cliente: "Tatiana Mora", producto: "Ramo eterno crochet", startDate: "2026-03-22", deliveryDate: "2026-03-28", status: "en-produccion", weaver: "Ana Gutierrez" },
    { id: 6202, cliente: "Laura Gomez", producto: "Amigurumi koala", startDate: "2026-03-19", deliveryDate: "2026-03-25", status: "listo", weaver: "Paola Becerra" }
  ],
  pagoFinal: [
    { id: 7301, cliente: "Camila Rueda", proof: "images/products/flor.jpg", status: "pendiente", validated: "Esperando revision contable", amount: "$ 92.000" },
    { id: 7302, cliente: "Sofia Jaramillo", proof: "images/products/top.jpg", status: "aprobado", validated: "Coincidencia confirmada", amount: "$ 125.000" }
  ],
  cierre: [
    { id: 7601, cliente: "Sonia Beltran", producto: "Bouquet wedding", estado: "alistando despacho", checklist: "Empaque premium y tarjeta lista" },
    { id: 7602, cliente: "Paula Mendez", producto: "Bolso sunset", estado: "listo para transporte", checklist: "Pago validado y guia pendiente" }
  ],
  entregasProximas: [
    { id: 8101, cliente: "Valentina Quintero", fecha: "2026-03-25", destino: "Bogota", prioridad: "urgente" },
    { id: 8102, cliente: "Diana Suarez", fecha: "2026-03-26", destino: "Medellin", prioridad: "media" },
    { id: 8103, cliente: "Paula Orozco", fecha: "2026-03-27", destino: "Cali", prioridad: "al-dia" }
  ],
  transportistas: [
    { nombre: "Carlos Moto", pedidos: 4, disponibilidad: "estable", telefono: "+57 301 555 0110" },
    { nombre: "Mensajeria Verde", pedidos: 7, disponibilidad: "media", telefono: "+57 315 555 0198" },
    { nombre: "Ruta Express", pedidos: 2, disponibilidad: "al-dia", telefono: "+57 320 555 0170" }
  ],
  ordenesEntrega: [
    { id: 8401, cliente: "Karen Correa", estado: "en-ruta", transportista: "Carlos Moto", producto: "Set tulipanes", proof: "images/products/tortuga.jpg" },
    { id: 8402, cliente: "Natalia Duque", estado: "entregado", transportista: "Ruta Express", producto: "Bolso sunset", proof: "images/products/flor.jpg" }
  ],
  librosContables: [
    { nombre: "Libro diario", estado: "actualizado", detalle: "Movimientos del dia conciliados" },
    { nombre: "Libro mayor", estado: "revision", detalle: "Dos cuentas requieren clasificacion final" }
  ],
  estadoFinanciero: [
    { nombre: "Ingresos validados", valor: "$ 637.000", detalle: "Anticipos y pagos finales confirmados" },
    { nombre: "Cartera en proceso", valor: "$ 217.000", detalle: "Pendiente por aprobacion o recaudo" }
  ],
  librosAuxiliares: [
    { nombre: "Auxiliar bancos", estado: "estable", detalle: "Sin desfases relevantes" },
    { nombre: "Auxiliar clientes", estado: "alerta", detalle: "1 comprobante con diferencia" }
  ],
  clientes: [
    { nombre: "Daniela Rios", estado: "anticipo pendiente", detalle: "Espera aprobacion del pago inicial" },
    { nombre: "Camila Rueda", estado: "pago final", detalle: "Comprobante enviado a contabilidad" }
  ],
  tejedores: [
    { nombre: "Luisa Medina", estado: "disponible", detalle: "Puede tomar dos ordenes nuevas" },
    { nombre: "Nadia Lopez", estado: "ocupada", detalle: "Entrega comprometida para 2026-03-31" }
  ],
  baseTransportistas: [
    { nombre: "Carlos Moto", estado: "activo", detalle: "4 pedidos asignados esta semana" },
    { nombre: "Ruta Express", estado: "activo", detalle: "Mejor tiempo de entrega en occidente" }
  ]
};
