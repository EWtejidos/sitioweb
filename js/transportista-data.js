window.transportistaData = {
  availableRoutes: [
    "Calle 12 # 88-22 Sur",
    "Carrera 34 # 65-10 Oriente",
    "Avenida 5 # 21-77 Norte",
    "Diagonal 8 # 99-33 Centro",
    "Transversal 15 # 44-55 Occidente",
    "Calle 77 # 11-88 Esquina",
    "Carrera 50 # 33-22 Interior 5",
    "Avenida 10 # 66-44 Piso 3",
    "Calle 25 # 80-65 Local 2",
    "Transversal 20 # 55-99 Barrio La Floresta"
  ],
  shipments: [
    { action: "entregar", name: "Maria Lopez", address: "Calle 11 #123-7B, esquina", orderId: "IMA12321SD", authorized: "Ana Maria Robles", status: "pendiente" },
    { action: "recoger", name: "Alnerto Ruiz", address: "Avenida 43 #22-11", orderId: "IMA_DCBAD", authorized: "Rodrigues Jose", status: "confirmado" },
    { action: "entregar", name: "Valentina Cruz", address: "Carrera 18 #91-55 Norte", orderId: "EW77102", authorized: "Camila Vega", status: "confirmado" },
    { action: "recoger", name: "Laura Diaz", address: "Diagonal 12 #88-03 Centro", orderId: "EW77103", authorized: "Luis Jaramillo", status: "pendiente" },
    { action: "entregar", name: "Paula Meza", address: "Calle 56 #33-90 Esquina", orderId: "EW77104", authorized: "Nora Fuentes", status: "confirmado" },
    { action: "recoger", name: "Nicolas Soto", address: "Avenida 12 #68-44 Piso 3", orderId: "EW77105", authorized: "Jairo Luna", status: "pendiente" }
  ],
  optimizerProposal: [
    "Calle 333 # 22-44 Oriente - Recogida",
    "Carrera 18 # 91-55 Norte - Recogida",
    "Avenida 7 # 14-32 Sur - Entrega",
    "Transversal 45 # 67-21 Occidente - Recogida",
    "Diagonal 12 # 88-03 Centro - Recogida",
    "Calle 56 # 33-90 Esquina - Entrega"
  ],
  optimizerResults: [
    { stop: "1", detail: "Calle 12 # 88-22 Sur - Recogida", eta: "08:10 am" },
    { stop: "2", detail: "Carrera 34 # 61-55 Oriente - Entrega", eta: "08:45 am" },
    { stop: "3", detail: "Avenida 7 # 14-52 Norte - Recogida", eta: "09:15 am" },
    { stop: "4", detail: "Diagonal 8 # 59-93 Centro - Recogida", eta: "10:05 am" },
    { stop: "5", detail: "Transversal 15 # 44-55 Occidente - Recogida", eta: "10:40 am" },
    { stop: "6", detail: "Calle 77 # 33 Esquina - Entrega", eta: "11:20 am" },
    { stop: "7", detail: "Carrera 50 # 33-22 Interior 5 - Recogida", eta: "12:05 pm" },
    { stop: "8", detail: "Avenida 12 # 68-44 Piso 3 - Entrega", eta: "12:35 pm" }
  ],
  confirmations: [
    {
      id: "TR-101",
      client: "Daniela Rios",
      action: "Entrega final",
      address: "Calle 25 # 80-65 Local 2",
      authorized: "Carlos Pineda",
      status: "pendiente",
      note: "Esperando foto firmada por el autorizado.",
      image: "images/products/flor.jpg"
    },
    {
      id: "TR-102",
      client: "Laura Castro",
      action: "Recogida",
      address: "Transversal 20 # 55-99 Barrio La Floresta",
      authorized: "Marta Solano",
      status: "confirmado",
      note: "Pedido recibido y verificado en bodega.",
      image: "images/products/top.jpg"
    },
    {
      id: "TR-103",
      client: "Camila Rueda",
      action: "Entrega final",
      address: "Carrera 50 # 33-22 Interior 5",
      authorized: "Paola Triana",
      status: "pendiente",
      note: "Cliente solicito llamada antes del arribo.",
      image: "images/products/tortuga.jpg"
    }
  ]
};
