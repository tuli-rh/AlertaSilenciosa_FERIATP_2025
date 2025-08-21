// ../static/js/inicio.js
(function () {
  // ===== Configuración =====
  const KEY_REPORTES = "reportes_v1";
  const SIDEBAR_WIDTH = 250; // Debe coincidir con el CSS (#sidebar width)

  // ===== Utils de reportes (localStorage) =====
  function getReportes() {
    try { return JSON.parse(localStorage.getItem(KEY_REPORTES)) ?? []; }
    catch { return []; }
  }
  function setReportes(arr) {
    localStorage.setItem(KEY_REPORTES, JSON.stringify(arr));
  }

  // Escape HTML sencillo para textos dinámicos
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Render de la lista "Mis reportes"
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

  // ===== Sidebar (abrir/cerrar) =====
  function isSidebarOpen(sidebar) {
    const left = sidebar.style.left || getComputedStyle(sidebar).left;
    return left === "0px";
  }
  function openSidebar(sidebar, overlay) {
    if (!sidebar) return;
    sidebar.style.left = "0px";
    if (overlay) {
      overlay.style.display = "block";
      requestAnimationFrame(() => (overlay.style.opacity = "1"));
    }
    document.body.style.overflow = "hidden";
  }
  function closeSidebar(sidebar, overlay) {
    if (!sidebar) return;
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

  // ===== Chat =====
  function appendMsg(box, who, text) {
    if (!box) return;
    const p = document.createElement("p");
    p.innerHTML = `<strong>${who}:</strong> ${escapeHtml(text)}`;
    box.appendChild(p);
    box.scrollTop = box.scrollHeight;
  }

  // ===== Toggle “Leer más / Ocultar” =====
  function initToggles() {
    document.querySelectorAll(".toggleBtn").forEach(btn => {
      const controlsId = btn.getAttribute("aria-controls");
      const content = controlsId ? document.getElementById(controlsId) : btn.nextElementSibling;

      // Estado inicial
      btn.setAttribute("aria-expanded", "false");
      if (content) content.hidden = true;

      btn.addEventListener("click", () => {
        const expanded = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!expanded));
        btn.textContent = expanded ? "Leer más" : "Ocultar";
        if (content) content.hidden = expanded; // true => oculta
      });
    });
  }

  // ===== DOM Ready =====
  document.addEventListener("DOMContentLoaded", () => {
    // Referencias
    const sidebar = document.getElementById("sidebar");
    const btnToggle = document.getElementById("menuToggle");
    const ulReportes = document.getElementById("listaReportes");
    const btnLimpiar = document.getElementById("btnLimpiarReportes");

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

    // Mis reportes
    renderReportes(ulReportes, getReportes());
    window.addEventListener("storage", (e) => {
      if (e.key === KEY_REPORTES) renderReportes(ulReportes, getReportes());
    });
    btnLimpiar?.addEventListener("click", () => {
      if (confirm("¿Seguro que deseas vaciar tus reportes guardados en este navegador?")) {
        setReportes([]);
        renderReportes(ulReportes, []);
      }
    });

    // Chat
    if (mensajes) {
      appendMsg(mensajes, "Profesor", "Hola, estoy aquí para ayudarte. ¿Cómo te sientes hoy?");
    }
    function enviarMensaje() {
      const texto = (inputMsg?.value || "").trim();
      if (!texto) return;
      appendMsg(mensajes, "Tú", texto);
      if (inputMsg) inputMsg.value = "";
      setTimeout(() => {
        appendMsg(mensajes, "Profesor", "Gracias por compartir. Si necesitas denunciar, ve a la sección “Denunciar”.");
      }, 900);
    }
    btnEnviar?.addEventListener("click", enviarMensaje);
    inputMsg?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        enviarMensaje();
      }
    });

    // Sidebar toggle
    btnToggle?.addEventListener("click", () => toggleSidebar(sidebar, overlay));
    overlay.addEventListener("click", () => closeSidebar(sidebar, overlay));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isSidebarOpen(sidebar)) closeSidebar(sidebar, overlay);
    });

    // Tarjetas expandibles
    initToggles();
  });
})();
