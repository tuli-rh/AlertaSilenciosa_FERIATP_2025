// ../static/js/ayuda.js
(function () {
    // ====== Config ======
    const KEY_REPORTES = "reportes_v1";
    const SIDEBAR_WIDTH = 250; // px (debe coincidir con el CSS)

    // ====== Utils de Reportes (localStorage) ======
    function getReportes() {
        try {
            return JSON.parse(localStorage.getItem(KEY_REPORTES)) ?? [];
        } catch {
            return [];
        }
    }
    function setReportes(arr) {
        localStorage.setItem(KEY_REPORTES, JSON.stringify(arr));
    }

    // ====== Render de lista "Mis reportes" ======
    function renderReportes(ul, lista) {
        if (!ul) return;
        if (!lista.length) {
            ul.innerHTML = `<li><em>No tienes reportes aún.</em></li>`;
            return;
        }
        ul.innerHTML = lista
            .map(
                (r) => `
      <li>
        <span class="fecha">${r.fecha ?? ""}</span>
        <span class="curso">${r.curso ? ` • ${escapeHtml(r.curso)}` : ""}</span>
        <div class="resumen">${escapeHtml(r.resumen ?? "")}</div>
      </li>`
            )
            .join("");
    }

    // Sencillo escape para evitar inyectar HTML en textos dinámicos
    function escapeHtml(str) {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    // ====== Chat helpers ======
    function appendMsg(box, who, text) {
        if (!box) return;
        const p = document.createElement("p");
        p.innerHTML = `<strong>${who}:</strong> ${escapeHtml(text)}`;
        box.appendChild(p);
        box.scrollTop = box.scrollHeight;
    }

    // ====== Sidebar (abrir/cerrar) ======
    function isSidebarOpen(sidebar) {
        // Comprobamos posición actual; si no hay estilo inline, tomamos el computed
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
        document.body.style.overflow = "hidden"; // evitar scroll del body cuando el menú está abierto
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
        if (!sidebar) return;
        if (isSidebarOpen(sidebar)) closeSidebar(sidebar, overlay);
        else openSidebar(sidebar, overlay);
    }

    // ====== DOM Ready ======
    document.addEventListener("DOMContentLoaded", () => {
        // ---- Referencias DOM
        const sidebar = document.getElementById("sidebar");
        const btnToggle = document.getElementById("menuToggle");
        const ulReportes = document.getElementById("listaReportes");
        const btnLimpiar = document.getElementById("btnLimpiarReportes");

        const mensajes = document.getElementById("mensajes");
        const inputMsg = document.getElementById("mensajeInput");
        const btnEnviar = document.getElementById("enviarMensaje");

        // Overlay para cerrar con clic fuera (creado dinámicamente)
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
                zIndex: "900", // menor que el sidebar (1000)
            });
            document.body.appendChild(overlay);
        }

        // ---- Inicializar lista de reportes
        renderReportes(ulReportes, getReportes());

        // Actualizar si cambian reportes en otra pestaña
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

        // ---- Chat: bienvenida y envío
        if (mensajes) {
            appendMsg(mensajes, "Profesor", "Hola, estoy aquí para escucharte. ¿Cómo te sientes hoy?");
        }

        function enviarMensaje() {
            const texto = (inputMsg?.value || "").trim();
            if (!texto) return;
            appendMsg(mensajes, "Tú", texto);
            if (inputMsg) inputMsg.value = "";
            setTimeout(() => {
                appendMsg(
                    mensajes,
                    "Profesor",
                    "Gracias por compartir. Si necesitas levantar una denuncia, usa la sección “Denunciar”."
                );
            }, 900);
        }

        btnEnviar?.addEventListener("click", enviarMensaje);
        inputMsg?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                enviarMensaje();
            }
        });

        // ---- Sidebar toggle
        btnToggle?.addEventListener("click", () => toggleSidebar(sidebar, overlay));

        // Cerrar al hacer clic fuera
        overlay.addEventListener("click", () => closeSidebar(sidebar, overlay));

        // Cerrar con ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && isSidebarOpen(sidebar)) {
                closeSidebar(sidebar, overlay);
            }
        });

        // Asegurar posición inicial (cerrado)
        if (sidebar) {
            sidebar.style.left = `-${SIDEBAR_WIDTH}px`;
        }

        // Ajuste al cambiar tamaño (por si quieres que se resetee en desktop)
        window.addEventListener("resize", () => {
            // ejemplo: si ancho > 992px podrías dejarlo cerrado por defecto
            if (window.innerWidth > 1200 && isSidebarOpen(sidebar)) {
                // opcional: closeSidebar(sidebar, overlay);
            }
        });
    });
})();
