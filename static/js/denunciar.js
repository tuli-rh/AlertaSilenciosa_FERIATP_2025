// ../static/js/denunciar.js
// Mantiene consistencia con ayuda.js (sidebar, reportes, chat)

const KEY_REPORTES = "reportes_v1";
const SIDEBAR_WIDTH = 250; // Debe coincidir con el CSS

// -------- Utilidades de almacenamiento --------
function getReportes() {
    try { return JSON.parse(localStorage.getItem(KEY_REPORTES)) ?? []; }
    catch { return []; }
}
function setReportes(arr) {
    localStorage.setItem(KEY_REPORTES, JSON.stringify(arr));
}
function resumir(texto, max = 90) {
    const limpio = String(texto || "").replace(/\s+/g, " ").trim();
    return limpio.length > max ? limpio.slice(0, max) + "…" : limpio;
}
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// -------- Render de “Mis reportes” --------
function renderReportes(ul, lista) {
    if (!ul) return;
    if (!lista.length) {
        ul.innerHTML = `<li><em>No tienes reportes aún.</em></li>`;
        return;
    }
    ul.innerHTML = lista.map(r => `
    <li>
      <span class="fecha">${r.fecha ?? ""}</span>
      <span class="curso">${r.curso ? ` • ${escapeHtml(r.curso)}` : ""}</span>
      <div class="resumen">${escapeHtml(r.resumen ?? "")}</div>
    </li>
  `).join("");
}

// -------- Sidebar (abrir/cerrar) --------
function isSidebarOpen(sidebar) {
    const left = sidebar.style.left || getComputedStyle(sidebar).left;
    return left === "0px";
}
function openSidebar(sidebar, overlay) {
    sidebar.style.left = "0px";
    if (overlay) {
        overlay.style.display = "block";
        requestAnimationFrame(() => (overlay.style.opacity = "1"));
    }
    document.body.style.overflow = "hidden";
}
function closeSidebar(sidebar, overlay) {
    sidebar.style.left = `-${SIDEBAR_WIDTH}px`;
    if (overlay) {
        overlay.style.opacity = "0";
        setTimeout(() => (overlay.style.display = "none"), 150);
    }
    document.body.style.overflow = "";
}
function toggleSidebar(sidebar, overlay) {
    isSidebarOpen(sidebar) ? closeSidebar(sidebar, overlay) : openSidebar(sidebar, overlay);
}

// -------- Chat helpers --------
function appendMsg(box, who, text) {
    if (!box) return;
    const p = document.createElement("p");
    p.innerHTML = `<strong>${who}:</strong> ${escapeHtml(text)}`;
    box.appendChild(p);
    box.scrollTop = box.scrollHeight;
}

// -------- Inicio --------
document.addEventListener("DOMContentLoaded", () => {
    // Referencias DOM
    const sidebar = document.getElementById("sidebar");
    const btnToggle = document.getElementById("menuToggle");
    const ulReportes = document.getElementById("listaReportes");
    const btnLimpiar = document.getElementById("btnLimpiarReportes");

    const form = document.getElementById("denunciaForm");
    const chatBox = document.getElementById("chatBox");
    const mensajes = document.getElementById("mensajes");
    const inputMsg = document.getElementById("mensajeInput");
    const btnEnviar = document.getElementById("enviarMensaje");

    // Overlay para clic fuera
    let overlay = document.getElementById("sidebarOverlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "sidebarOverlay";
        Object.assign(overlay.style, {
            position: "fixed",
            inset: "0",
            background: "rgba(0,0,0,.25)",
            display: "none",
            opacity: "0",
            transition: "opacity .15s ease",
            zIndex: "900",
        });
        document.body.appendChild(overlay);
    }

    // Posición inicial del sidebar (cerrado)
    if (sidebar) sidebar.style.left = `-${SIDEBAR_WIDTH}px`;

    // Render inicial de “Mis reportes”
    renderReportes(ulReportes, getReportes());

    // Sincronizar si cambian en otra pestaña
    window.addEventListener("storage", (e) => {
        if (e.key === KEY_REPORTES) renderReportes(ulReportes, getReportes());
    });

    // Vaciar reportes
    btnLimpiar?.addEventListener("click", () => {
        if (confirm("¿Seguro que deseas vaciar tus reportes guardados en este navegador?")) {
            setReportes([]);
            renderReportes(ulReportes, []);
        }
    });

    // Toggle sidebar
    btnToggle?.addEventListener("click", () => toggleSidebar(sidebar, overlay));
    overlay.addEventListener("click", () => closeSidebar(sidebar, overlay));
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && isSidebarOpen(sidebar)) closeSidebar(sidebar, overlay);
    });

    // Envío del formulario
    form?.addEventListener("submit", (e) => {
        e.preventDefault();

        const data = new FormData(form);
        const curso = (data.get("curso") || "").toString();
        const fecha = (data.get("fecha") || "").toString();
        const detalle = (data.get("detalle") || "").toString();

        if (!fecha || !detalle.trim()) {
            alert("Completa fecha y la denuncia.");
            return;
        }

        // Guardar en localStorage SOLO resumen (no datos sensibles)
        const nuevo = {
            id: crypto.randomUUID(),
            curso: curso.trim() || null,
            fecha,
            resumen: resumir(detalle, 100),
            ts: Date.now(),
        };
        const arr = getReportes();
        arr.unshift(nuevo);      // lo más reciente primero
        setReportes(arr);

        // Re-render del listado lateral
        renderReportes(ulReportes, arr);

        // Mostrar chat con mensaje de recepción
        if (chatBox) chatBox.style.display = "block";
        appendMsg(mensajes, "Profesor", "Hemos recibido tu denuncia. Gracias por confiar.");

        // Limpiar formulario
        form.reset();
    });

    // Chat: enviar con botón o Enter
    function enviarMensaje() {
        const texto = (inputMsg?.value || "").trim();
        if (!texto) return;
        appendMsg(mensajes, "Tú", texto);
        if (inputMsg) inputMsg.value = "";
        setTimeout(() => {
            appendMsg(mensajes, "Profesor", "Gracias por tu mensaje, lo revisaremos.");
        }, 900);
    }
    btnEnviar?.addEventListener("click", enviarMensaje);
    inputMsg?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            enviarMensaje();
        }
    });
});
