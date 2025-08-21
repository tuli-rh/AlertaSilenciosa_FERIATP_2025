// Clave única en localStorage
const KEY = "reportes_v1";

// Lee todos los reportes
export function getReportes() {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? []; }
  catch { return []; }
}

// Guarda el array completo
function setReportes(arr) {
  localStorage.setItem(KEY, JSON.stringify(arr));
}

// Crea un resumen corto y neutro
function resumir(texto, max = 90) {
  const limpio = String(texto || "")
    .replace(/\s+/g, " ")
    .trim();
  return limpio.length > max ? limpio.slice(0, max) + "…" : limpio;
}

// Agrega un reporte (guardamos general: fecha, curso opcional, resumen)
export function addReporte({ curso, fecha, detalle }) {
  const nuevo = {
    id: crypto.randomUUID(),
    curso: (curso || "").trim() || null,
    fecha,                          // YYYY-MM-DD (del <input type="date">)
    resumen: resumir(detalle),      // NO guardamos el detalle completo
    ts: Date.now()
  };
  const arr = getReportes();
  arr.unshift(nuevo);               // primero lo más reciente
  setReportes(arr);
  return nuevo;
}

// Suscripción a cambios (si abres otra pestaña)
export function onReportesChange(cb) {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) cb(getReportes());
  });
}
