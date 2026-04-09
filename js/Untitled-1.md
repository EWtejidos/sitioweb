Quiero que generes un **frontend completo en HTML, CSS y JavaScript** para visualizar y administrar productos dentro de un sistema existente.

⚠️ IMPORTANTE:
- NO debes modificar el backend.
- NO debes crear nuevas bases de datos.
- Solo debes trabajar con el frontend y consumir datos existentes.
- El código debe ser compatible con Flask y estructuras ya existentes.

---

## 📍 CONTEXTO DEL PROYECTO

- Existe un panel administrativo llamado `baseadmin.html` que ya tiene varias pestañas.
- Debes crear una **nueva pestaña llamada "Productos"** dentro de ese mismo archivo, reutilizando el diseño y estructura de las pestañas existentes.
- Copia el estilo visual (CSS, layout, navegación) para mantener consistencia.

### 🔗 Fuentes de datos:

1. Productos que pide el cliente (desde WhatsApp):
   → Se obtienen desde `whatsapp_utils.py` todos los atributos que el cliente rellena

2. Productos creados por el tejedor:
   → Ya se manejan en `productos.html`, `productos.js`, `productos.css` 

⚠️ Debes unificar visualmente ambas fuentes en una sola tabla.

---

## 🧱 TABLA DE PRODUCTOS

Columnas:

| ID_P | Producto | Precio cliente | Precio tejedor (25%) | Imagen Miniatura | # Compras | Provienen | Editar |

### Reglas:
- Cada fila representa un producto.
- un producto puede tener (por múltiples imágenes) pero en la tabla se vera solo uno en miniatuta.
- “Provienen” indica: `cliente` o `tejedor`.

---

## 🔍 INTERACCIONES

### 1. Click en ID_P:
Abrir un modal (alerta expandida) con:
- Medidas
- Colores
- Detalles
- Lista de ID_orden asociadas (entre paréntesis)
estos atributos estan disponibles con diferentes nombres en el bot the whatsapp y en la vista de tejedores quisas no este el color.

---

### 2. Click en Imagen:
Abrir modal con imagen grande:
- Soporte para múltiples imágenes
- Navegación con flechas (slider tipo galería)

---

### 3. Botón Editar:
- Permite modificar TODOS los atributos:
  - ID_P
  - Nombre
  - Categoría
  - Precio
  - Imágenes (agregar/eliminar)
  - Medidas, colores, detalles
- Puede ser modal o inline
(el codigo no puede crear un ID_P igual a los que ya esten en este panel visual)

---

## 🔎 FILTROS Y BÚSQUEDA

Encima de la tabla agregar:

- Filtro por categoría
- Filtro por rango de precios
- Filtro por proveniencia (cliente / tejedor)
- Barra de búsqueda por:
  - ID_P
  - Nombre

⚠️ Todo debe actualizar la tabla en tiempo real (sin recargar página).

---

## 🧾 EXPORTACIÓN

Botón: **"Exportar / Imprimir CSV"**

Debe incluir:
- Todos los campos visibles
- Y también:
  - Medidas
  - Colores
  - Detalles
  - ID_orden

---

## 🧠 GENERACIÓN DE ID

- Generar ID únicos automáticamente
- Formato: `P-00001`, `P-00002`, etc.

---

## 🎨 DISEÑO

- Responsivo
- Limpio
- Consistente con `baseadmin.html`
- Reutilizar estilos existentes
- UX clara (modales fluidos, navegación simple)


## ⚙️ REQUISITOS TÉCNICOS

- Usar JavaScript puro (o mínimo uso de librerías)
- Separar en:
  - HTML
  - CSS
  - JS
- Código modular y entendible
- Preparado para conectarse fácilmente a endpoints Flask

---

## 🚫 RESTRICCIONES

- No cambiar backend
- No crear nuevas rutas
- No modificar base de datos
- No romper lógica existente

---

## 🎯 OBJETIVO FINAL

Crear una interfaz que permita:
- Ver TODOS los productos (cliente + tejedor)
- Administrarlos desde un solo lugar
- Filtrar, buscar, editar y exportar
- imprimir en formato cvs
