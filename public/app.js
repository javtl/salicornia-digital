// ── USUARIOS DEMO ──────────────────────────────────────────────────────────
const SESSION_KEY = "salicornia-session";
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = ["click", "keydown", "mousemove", "touchstart", "scroll"];

const VIEW_LABELS = {
  dashboard: "Inicio",
  infra: "Infraestructura",
  ambient: "Datos ambientales",
  fieldbook: "Cuaderno",
  incidents: "Incidencias",
  iot: "IoT",
  harvests: "Cosechas",
  trace: "Trazabilidad",
  users: "Gestionar usuarios"
};

var currentUser = null;
let inactivityTimer = null;

const LOGO_B64 = "data:image/png;base64,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";

async function authInit() {
  // Inyectar logo en todas las pantallas
  document.querySelectorAll("#login-logo-img, #welcome-logo-img").forEach((img) => {
    if (img) img.src = LOGO_B64;
  });

  await restoreSession(); // ← async: espera a que el servidor confirme la sesión

  if (!currentUser) {
    // Primera visita: mostrar bienvenida. Visitas siguientes (post-logout): ir al login directamente.
    const hasSeenWelcome = sessionStorage.getItem("seen-welcome");
    if (!hasSeenWelcome) {
      document.getElementById("welcome-screen").classList.remove("hidden");
    } else {
      document.getElementById("login-screen").classList.remove("hidden");
    }
  } else {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("welcome-screen").classList.add("hidden");
  }

  updateAuthUI();
  bindAuthEvents();
  bindWelcomeEvents();
  setupInactivityTracking();
  if (currentUser) refreshSession();
}

function bindWelcomeEvents() {
  const enterBtn = document.getElementById("welcome-enter-btn");
  if (!enterBtn) return;
  enterBtn.addEventListener("click", () => {
    sessionStorage.setItem("seen-welcome", "1");
    document.getElementById("welcome-screen").classList.add("hidden");
    document.getElementById("login-screen").classList.remove("hidden");
    setTimeout(() => {
      const userInput = document.getElementById("l-user");
      if (userInput) userInput.focus();
    }, 100);
  });
}

function clearLoginFields() {
  ["l-user", "l-pass", "r-user", "r-email", "r-pass"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
}

async function restoreSession() {
  try {
    const res = await fetch("/api/me", { credentials: "include" });
    if (res.ok) {
      currentUser = await res.json();
    } else {
      currentUser = null;
    }
  } catch (e) {
    currentUser = null;
  }
}

function refreshSession() {
  if (!currentUser) return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    username: currentUser.username,
    expiresAt: Date.now() + SESSION_TIMEOUT_MS
  }));
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => doLogout({ expired: true }), SESSION_TIMEOUT_MS);
}

function setupInactivityTracking() {
  ACTIVITY_EVENTS.forEach((eventName) => {
    document.addEventListener(eventName, () => refreshSession(), { passive: true });
  });
}

function setMenuOpen(open) {
  const sidebar = document.getElementById("side-menu");
  const overlay = document.getElementById("menu-overlay");
  const toggle = document.getElementById("menu-toggle");
  if (!sidebar || !overlay || !toggle) return;

  sidebar.classList.toggle("open", open);
  overlay.classList.toggle("show", open);
  toggle.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar menu" : "Abrir menu");
}

function bindMenuEvents() {
  const toggle = document.getElementById("menu-toggle");
  const overlay = document.getElementById("menu-overlay");
  if (!toggle || !overlay) return;

  toggle.addEventListener("click", () => setMenuOpen(!toggle.classList.contains("open")));
  overlay.addEventListener("click", () => setMenuOpen(false));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });
}

function navigateTo(view) {
  if (!canAccessView(view)) view = "dashboard";
  activeView = view;
  $all(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  $all(".view").forEach((section) => section.classList.remove("active"));
  $(`#${view}-view`).classList.add("active");
  $("#view-title").textContent = VIEW_LABELS[view] || view;
  requestAnimationFrame(drawCharts);
}

function updateAuthUI() {
  const loginBtn  = document.getElementById("login-toggle");
  const userPill  = document.getElementById("user-pill");
  const nameLabel = document.getElementById("user-name-label");
  const avatar    = document.getElementById("user-avatar");
  const resetBtn  = document.getElementById("seed-reset");

  if (currentUser) {
    loginBtn.style.display  = "none";
    userPill.style.display  = "flex";
    nameLabel.textContent   = currentUser.username;
    avatar.textContent      = currentUser.username.slice(0, 2).toUpperCase();
  } else {
    loginBtn.style.display  = "";
    userPill.style.display  = "none";
  }

  if (resetBtn) resetBtn.style.display = hasPermission(currentUser, "resetDemo") ? "" : "none";

  // Mostrar solo los modulos disponibles para el usuario actual.
  document.querySelectorAll(".nav-item").forEach((btn) => {
    const view = btn.dataset.view;
    const allowed = canAccessView(view, currentUser);
    btn.style.display = allowed ? "" : "none";
    btn.classList.remove("locked");
    btn.removeAttribute("title");
    btn.removeAttribute("aria-disabled");
  });

  if (!canAccessView(activeView)) navigateTo("dashboard");
}

function openModal() {
  // Muestra la pantalla completa de login
  document.getElementById("login-screen").classList.remove("hidden");
  setTimeout(() => document.getElementById("l-user").focus(), 100);
}

function closeModal() {
  // Oculta la pantalla completa de login
  document.getElementById("login-screen").classList.add("hidden");
  clearModalMsgs();
}

function clearModalMsgs() {
  ["msg-login", "msg-reg"].forEach((id) => {
    const el = document.getElementById(id);
    el.className = "modal-msg";
    el.textContent = "";
  });
}

function showModalMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className   = "modal-msg " + type;
}

function switchTab(tab) {
  const isLogin = tab === "login";
  document.getElementById("sec-login").style.display = isLogin ? "" : "none";
  document.getElementById("sec-reg").style.display   = isLogin ? "none" : "";
  document.getElementById("tab-login").classList.toggle("active", isLogin);
  document.getElementById("tab-reg").classList.toggle("active", !isLogin);
  clearModalMsgs();
}

async function doLogin() {
  const username = document.getElementById("l-user").value.trim().toLowerCase();
  const password = document.getElementById("l-pass").value;

  if (!username || !password) {
    showModalMsg("msg-login", "Rellena usuario y contraseña.", "error");
    return;
  }

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      showModalMsg("msg-login", data.error || "Error al iniciar sesión.", "error");
      return;
    }
    currentUser = data;
    closeModal();
    updateAuthUI();
    renderUsers();
    navigateTo(getAllowedViews()[0]);
    clearLoginFields();
    toast(`Bienvenido, ${currentUser.username} (${HIERARCHY_LABELS[currentUser.hierarchy] || currentUser.role})`);
  } catch (e) {
    showModalMsg("msg-login", "No se pudo conectar con el servidor.", "error");
  }
}

async function doRegister() {
  const username = document.getElementById("r-user").value.trim().toLowerCase();
  const email    = document.getElementById("r-email").value.trim();
  const password = document.getElementById("r-pass").value;

  if (!username || !email || !password) {
    showModalMsg("msg-reg", "Completa todos los campos.", "error");
    return;
  }
  if (password.length < 6) {
    showModalMsg("msg-reg", "La contraseña debe tener al menos 6 caracteres.", "error");
    return;
  }

  try {
    const res = await fetch("/api/registro", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      showModalMsg("msg-reg", data.error || "Error al registrar.", "error");
      return;
    }
    showModalMsg("msg-reg", "Cuenta creada. Ya puedes iniciar sesión.", "ok");
    setTimeout(() => switchTab("login"), 1400);
  } catch (e) {
    showModalMsg("msg-reg", "No se pudo conectar con el servidor.", "error");
  }
}

async function doLogout(options = {}) {
  try {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
  } catch (e) { /* continuar aunque falle */ }

  currentUser = null;
  clearTimeout(inactivityTimer);
  clearLoginFields();
  navigateTo("dashboard");
  updateAuthUI();
  renderUsers();
  openModal();
  toast(options.expired ? "Sesión expirada por inactividad" : "Sesión cerrada");
}

function bindAuthEvents() {
  document.getElementById("login-toggle").addEventListener("click", openModal);
  document.getElementById("logout-btn").addEventListener("click", doLogout);
  document.getElementById("tab-login").addEventListener("click", () => switchTab("login"));
  document.getElementById("tab-reg").addEventListener("click", () => switchTab("registro"));
  document.getElementById("btn-login").addEventListener("click", doLogin);
  document.getElementById("btn-reg").addEventListener("click", doRegister);

  // Boton volver: de login a bienvenida
  const backBtn = document.getElementById("login-back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      document.getElementById("login-screen").classList.add("hidden");
      document.getElementById("welcome-screen").classList.remove("hidden");
    });
  }

  bindMenuEvents();

  // Enter en campos de login
  ["l-user", "l-pass"].forEach((id) => {
    document.getElementById(id).addEventListener("keydown", (e) => {
      if (e.key === "Enter") doLogin();
    });
  });

  // Evitar navegacion manual a vistas sin permiso.
  document.querySelector(".nav").addEventListener("click", (e) => {
    const btn = e.target.closest(".nav-item");
    if (!btn) return;
    if (!canAccessView(btn.dataset.view)) {
      e.stopImmediatePropagation();
      if (!currentUser) {
        openModal();
        showModalMsg("msg-login", "Inicia sesion para acceder a este modulo.", "error");
      } else {
        toast("Tu usuario no tiene acceso a este modulo");
      }
    }
  }, true); // capture: true para interceptar antes que bindEvents
}

// ── FIN AUTH ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "salicornia-digital-state-v1";
const CADIZ = {
  name: "Cadiz",
  latitude: 36.5271,
  longitude: -6.2886,
  timezone: "Europe/Madrid"
};

const seed = {
  sections: [
    { id: "S-001", name: "Marisma Norte" },
    { id: "S-002", name: "Canal Central" },
    { id: "S-003", name: "Hidroponia Sur" }
  ],
  planchas: [
    { id: "PL-001", sectionId: "S-001", area: 18, status: "Activa", macetas: 8 },
    { id: "PL-002", sectionId: "S-001", area: 18, status: "Activa", macetas: 8 },
    { id: "PL-003", sectionId: "S-001", area: 20, status: "Mantenimiento", macetas: 10 },
    { id: "PL-004", sectionId: "S-002", area: 22, status: "Activa", macetas: 12 },
    { id: "PL-005", sectionId: "S-002", area: 22, status: "Cosechada", macetas: 12 },
    { id: "PL-006", sectionId: "S-003", area: 16, status: "Activa", macetas: 6 }
  ],
  fieldbook: [
    { id: "CB-001", planchaId: "PL-001", macetaId: "M-001", date: "2026-05-01", time: "08:20", height: 19, branches: 3, biomass: 42, notes: "Crecimiento uniforme", genetic: true, photo: "" },
    { id: "CB-002", planchaId: "PL-001", macetaId: "M-004", date: "2026-05-03", time: "09:10", height: 22, branches: 4, biomass: 53, notes: "Buen vigor", genetic: false, photo: "" },
    { id: "CB-003", planchaId: "PL-004", macetaId: "", date: "2026-05-04", time: "10:05", height: 17, branches: 2, biomass: 36, notes: "Zona con sombra parcial", genetic: false, photo: "" }
  ],
  photos: [
    { id: "FT-001", planchaId: "PL-002", macetaId: "M-003", date: "2026-05-02", image: "", comment: "Hoja con dano superficial", isIncident: true, type: "Dano fisico", severity: "Media", status: "Seguimiento" },
    { id: "FT-002", planchaId: "PL-001", macetaId: "", date: "2026-05-04", image: "", comment: "Crecimiento denso y sano", isIncident: false, type: "", severity: "", status: "" }
  ],
  ambient: [
    { date: "2026-05-01", highTime: "07:30", high: 2.7, lowTime: "13:45", low: 0.4, tideState: "Bajando", temp: 21, humidity: 67, wind: 12, windDir: "NO", rain: 0, pressure: 1015 },
    { date: "2026-05-02", highTime: "08:12", high: 2.9, lowTime: "14:20", low: 0.5, tideState: "Subiendo", temp: 22, humidity: 64, wind: 16, windDir: "O", rain: 1, pressure: 1013 },
    { date: "2026-05-03", highTime: "08:58", high: 3.1, lowTime: "15:05", low: 0.6, tideState: "Subiendo", temp: 24, humidity: 60, wind: 8, windDir: "SO", rain: 0, pressure: 1016 },
    { date: "2026-05-04", highTime: "09:40", high: 3.0, lowTime: "15:49", low: 0.6, tideState: "Bajando", temp: 23, humidity: 63, wind: 26, windDir: "S", rain: 4, pressure: 1008 },
    { date: "2026-05-05", highTime: "10:20", high: 3.2, lowTime: "16:30", low: 0.5, tideState: "Subiendo", temp: 23, humidity: 61, wind: 10, windDir: "SE", rain: 0, pressure: 1017 }
  ],
  sensors: [
    { id: "SN-001", planchaId: "PL-001", name: "Sonda Norte", oxygen: 6.4, salinity: 31, nitrates: 13, waterTemp: 19.8, ph: 7.6, waterLevel: 1.8, lightIntensity: 720, lightHours: 8.4 },
    { id: "SN-002", planchaId: "PL-002", name: "Sonda Canal", oxygen: 4.6, salinity: 36, nitrates: 24, waterTemp: 21.1, ph: 8.1, waterLevel: 1.5, lightIntensity: 690, lightHours: 7.8 },
    { id: "SN-003", planchaId: "PL-004", name: "Sonda Sur", oxygen: 7.2, salinity: 30, nitrates: 11, waterTemp: 20.4, ph: 7.4, waterLevel: 1.9, lightIntensity: 740, lightHours: 8.7 }
  ],
  sensorHistory: [
    { date: "01/05", oxygen: 6.1, salinity: 30, nitrates: 12, ph: 7.4 },
    { date: "02/05", oxygen: 5.8, salinity: 31, nitrates: 14, ph: 7.6 },
    { date: "03/05", oxygen: 5.2, salinity: 33, nitrates: 18, ph: 7.8 },
    { date: "04/05", oxygen: 4.8, salinity: 35, nitrates: 22, ph: 8.1 },
    { date: "05/05", oxygen: 6.4, salinity: 32, nitrates: 15, ph: 7.7 }
  ],
  harvests: [
    { lotId: "LT-2026-001", planchaId: "PL-005", date: "2026-04-25", channel: "Canal A", tide: 2.6, weight: 42 },
    { lotId: "LT-2026-002", planchaId: "PL-001", date: "2026-05-02", channel: "Canal B", tide: 2.9, weight: 38 },
    { lotId: "LT-2026-003", planchaId: "PL-004", date: "2026-05-05", channel: "Canal A", tide: 3.1, weight: 45 }
  ],
  trace: [
    { lotId: "LT-2026-001", planchaId: "PL-005", harvest: "2026-04-25", wash: "2026-04-25", dry: "2026-04-26", pack: "2026-04-27", status: "Completado" },
    { lotId: "LT-2026-002", planchaId: "PL-001", harvest: "2026-05-02", wash: "2026-05-02", dry: "2026-05-03", pack: "", status: "En proceso" },
    { lotId: "LT-2026-003", planchaId: "PL-004", harvest: "2026-05-05", wash: "", dry: "", pack: "", status: "Pendiente" }
  ],
  apiMeta: {
    ambientSource: "Datos demo",
    ambientUpdatedAt: ""
  }
};

let state = loadState();
let selectedPlancha = location.hash.replace("#", "") || state.planchas[0].id;
if (!state.planchas.some((p) => p.id === selectedPlancha)) selectedPlancha = state.planchas[0].id;
let activeView = "dashboard";
let photoFilter = "Todas";

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(seed);
  try {
    return { ...structuredClone(seed), ...JSON.parse(saved) };
  } catch {
    return structuredClone(seed);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function $(selector, root = document) {
  return root.querySelector(selector);
}

function $all(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function fmt(value, decimals = 0) {
  return Number(value).toLocaleString("es-ES", { maximumFractionDigits: decimals });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowLocalInput() {
  return new Date().toLocaleString("sv-SE", { timeZone: CADIZ.timezone }).replace(" ", "T").slice(0, 16);
}

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

function plancha(id) {
  return state.planchas.find((item) => item.id === id);
}

function section(id) {
  return state.sections.find((item) => item.id === id);
}

function macetaOptions(planchaId) {
  const count = plancha(planchaId)?.macetas || 0;
  return Array.from({ length: count }, (_, index) => `M-${String(index + 1).padStart(3, "0")}`);
}

function fullId(planchaId, macetaId) {
  const pl = plancha(planchaId);
  return `${pl.sectionId}_${planchaId}${macetaId ? `_${macetaId}` : ""}`;
}

function planchaUrl(planchaId) {
  return `${location.href.split("#")[0]}#${planchaId}`;
}

function metricStatus(value, min, max, warn = 0.12) {
  const range = max - min;
  if (value >= min && value <= max) return "ok";
  if (value >= min - range * warn && value <= max + range * warn) return "warn";
  return "crit";
}

function statusLabel(status) {
  return status === "ok" ? "Optimo" : status === "warn" ? "Atencion" : "Critico";
}

function issueAlerts() {
  const alerts = [];
  state.sensors.forEach((sensor) => {
    if (sensor.oxygen < 5) alerts.push({ level: "crit", text: `${sensor.planchaId}: oxigeno ${sensor.oxygen} mg/L` });
    if (sensor.nitrates > 20) alerts.push({ level: "warn", text: `${sensor.planchaId}: nitratos ${sensor.nitrates} mg/L` });
    if (sensor.salinity > 35) alerts.push({ level: "warn", text: `${sensor.planchaId}: salinidad ${sensor.salinity} PSU` });
  });
  const current = state.ambient.at(-1);
  if (current.wind > 24) alerts.push({ level: "warn", text: `Viento fuerte ${current.wind} km/h` });
  if (current.rain > 3) alerts.push({ level: "warn", text: `Lluvia ${current.rain} mm` });
  const activeIncidents = state.photos.filter((p) => p.isIncident && p.status !== "Resuelta");
  activeIncidents.forEach((item) => alerts.push({ level: item.severity === "Alta" ? "crit" : "warn", text: `${item.planchaId}: incidencia ${item.type}` }));
  if (!alerts.length) alerts.push({ level: "ok", text: "Sin alertas activas" });
  return alerts;
}

function renderGlobalSelect() {
  $("#global-plancha").innerHTML = state.planchas.map((p) => `<option value="${p.id}">${p.id} - ${section(p.sectionId).name}</option>`).join("");
  $("#global-plancha").value = selectedPlancha;
}

function render() {
  renderGlobalSelect();
  renderDashboard();
  renderInfra();
  renderAmbient();
  renderFieldbook();
  renderIncidents();
  renderIot();
  renderHarvests();
  renderTrace();
  renderUsers();
  requestAnimationFrame(drawCharts);
}

function renderDashboard() {
  const totalWeight = state.harvests.reduce((sum, item) => sum + Number(item.weight), 0);
  const completed = state.trace.filter((item) => item.status === "Completado").length;
  const highTide = state.harvests.filter((item) => item.tide >= 2.8).length;
  const activeIncidents = state.photos.filter((p) => p.isIncident && p.status !== "Resuelta").length;
  const current = state.ambient.at(-1);
  const kpis = [
    ["Lotes producidos", state.harvests.length, "n"],
    ["Peso total cosechado", totalWeight, "kg"],
    ["Rendimiento medio", totalWeight / Math.max(state.harvests.length, 1), "kg/plancha"],
    ["Incidencias activas", activeIncidents, "n"],
    ["Trazabilidad completa", (completed / state.trace.length) * 100, "%"],
    ["Cosechas en marea alta", (highTide / state.harvests.length) * 100, "%"]
  ];

  $("#dashboard-view").innerHTML = `
    <div class="kpi-grid">${kpis.map(([label, value, unit]) => `
      <article class="card">
        <p class="kpi-label">${label}</p>
        <p class="kpi-value">${fmt(value, unit === "kg/plancha" ? 1 : 0)}<span class="kpi-unit">${unit}</span></p>
      </article>`).join("")}
    </div>
    <div class="grid two" style="margin-top:16px">
      <article class="plot-card"><h3>Evolucion de produccion</h3><canvas id="production-chart" height="230"></canvas></article>
      <article class="plot-card"><h3>Estado de lotes</h3><canvas id="lot-chart" height="230"></canvas></article>
    </div>
    <div class="grid three" style="margin-top:16px">
      <section class="panel">
        <h3>Alertas activas</h3>
        <div class="list">${issueAlerts().map((a) => `<div class="record"><span>${a.text}</span><span class="badge ${a.level}">${statusLabel(a.level)}</span></div>`).join("")}</div>
      </section>
      <section class="panel">
        <h3>Resumen ambiental</h3>
        <div class="list">
          <div class="record"><span>Oxigeno</span><strong>${state.sensors[0].oxygen} mg/L</strong></div>
          <div class="record"><span>Salinidad</span><strong>${state.sensors[0].salinity} PSU</strong></div>
          <div class="record"><span>Temperatura</span><strong>${current.temp} C</strong></div>
          <div class="record"><span>pH</span><strong>${state.sensors[0].ph}</strong></div>
          <div class="record"><span>Nivel de marea</span><strong>${current.high} m</strong></div>
        </div>
      </section>
      <section class="panel">
        <h3>Actividad reciente</h3>
        <div class="list">${recentActivity().map((item) => `<div class="record"><div><strong>${item.title}</strong><span class="muted">${item.detail}</span></div><span class="badge info">${item.date}</span></div>`).join("")}</div>
      </section>
    </div>`;
}

function recentActivity() {
  return [
    ...state.harvests.map((h) => ({ date: h.date, title: `Cosecha ${h.lotId}`, detail: `${h.weight} kg en ${h.planchaId}` })),
    ...state.photos.map((p) => ({ date: p.date, title: p.isIncident ? `Incidencia ${p.planchaId}` : `Foto ${p.planchaId}`, detail: p.comment })),
    ...state.fieldbook.map((f) => ({ date: f.date, title: `Registro ${f.planchaId}`, detail: `${f.height} cm, ${f.biomass} g` }))
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
}

function renderInfra() {
  const pl = plancha(selectedPlancha);
  const macetas = macetaOptions(selectedPlancha);
  $("#infra-view").innerHTML = `
    <div class="grid two">
      <section class="panel">
        <div class="panel-header"><h3>Mapa visual</h3><span class="badge info">Seccion - Plancha - Maceta</span></div>
        <div class="map">${state.sections.map((s) => `
          <div class="section-band">
            <h3>${s.id} · ${s.name}</h3>
            <div class="plancha-grid">${state.planchas.filter((p) => p.sectionId === s.id).map((p) => `
              <button class="plancha-tile ${p.id === selectedPlancha ? "active" : ""}" data-select-plancha="${p.id}">
                <strong>${p.id}</strong>
                <p class="muted">${p.area} m2 · ${p.macetas} macetas</p>
                <span class="badge ${p.status === "Activa" ? "ok" : p.status === "Mantenimiento" ? "warn" : "info"}">${p.status}</span>
              </button>`).join("")}</div>
          </div>`).join("")}</div>
      </section>
      <section class="panel">
        <div class="panel-header"><h3>Detalle de plancha</h3><button class="ghost-btn" type="button" id="copy-plancha-url">Copiar QR</button></div>
        <div class="grid two">
          <div>
            <div class="list">
              <div class="record"><span>ID_PLANCHA</span><strong>${pl.id}</strong></div>
              <div class="record"><span>ID_SECCION</span><strong>${pl.sectionId}</strong></div>
              <div class="record"><span>Superficie</span><strong>${pl.area} m2</strong></div>
              <div class="record"><span>N macetas</span><strong>${pl.macetas}</strong></div>
              <div class="record"><span>Estado</span><strong>${pl.status}</strong></div>
            </div>
          </div>
          <div>
            ${qrMarkup(fullId(pl.id, ""), planchaUrl(pl.id))}
            <p class="muted">${fullId(pl.id, "")}</p>
            <p class="muted">${planchaUrl(pl.id)}</p>
          </div>
        </div>
        <h3 style="margin-top:18px">Macetas</h3>
        <div class="maceta-grid">${macetas.map((m) => `<div class="maceta"><strong>${m}</strong><br><span class="muted">${fullId(pl.id, m)}</span></div>`).join("")}</div>
      </section>
    </div>`;
}

function buildAmbientAlerts(current) {
  const alerts = [];
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Pleamar proxima
  if (current.highTime && current.highTime !== "--:--") {
    const [hh, mm] = current.highTime.split(":").map(Number);
    const highMin = hh * 60 + mm;
    const diff = highMin - nowMin;
    if (diff > 0 && diff <= 120)
      alerts.push({ level: "warn", text: `Pleamar en ${diff} min (${current.highTime}, ${current.high} m)` });
    else
      alerts.push({ level: "ok", text: `Proxima pleamar: ${current.highTime} · ${current.high} m` });
  }

  // Bajamar proxima
  if (current.lowTime && current.lowTime !== "--:--") {
    alerts.push({ level: "ok", text: `Proxima bajamar: ${current.lowTime} · ${current.low} m` });
  }

  // Estado actual de la marea
  alerts.push({
    level: "ok",
    text: `Marea ${current.tideState?.toLowerCase() || "–"} · nivel actual aprox. ${current.high} m`
  });

  // Viento
  if (current.wind > 40)
    alerts.push({ level: "crit", text: `Viento muy fuerte: ${current.wind} km/h — no salir a campo` });
  else if (current.wind > 25)
    alerts.push({ level: "warn", text: `Viento fuerte: ${current.wind} km/h` });
  else
    alerts.push({ level: "ok", text: `Viento: ${current.wind} km/h` });

  // Lluvia
  if (current.rain > 10)
    alerts.push({ level: "crit", text: `Lluvia intensa: ${current.rain} mm` });
  else if (current.rain > 3)
    alerts.push({ level: "warn", text: `Lluvia moderada: ${current.rain} mm` });
  else
    alerts.push({ level: "ok", text: `Sin lluvia significativa: ${current.rain} mm` });

  // Temperatura
  if (current.temp > 35)
    alerts.push({ level: "warn", text: `Temperatura alta: ${current.temp} °C` });
  else if (current.temp < 5)
    alerts.push({ level: "warn", text: `Temperatura baja: ${current.temp} °C` });
  else
    alerts.push({ level: "ok", text: `Temperatura: ${current.temp} °C` });

  // Condiciones globales de siembra
  const optima = current.wind < 14 && current.rain === 0 && current.temp >= 10 && current.temp <= 32;
  alerts.push({
    level: optima ? "ok" : "warn",
    text: optima ? "Condiciones optimas para siembra" : "Condiciones no optimas para siembra"
  });

  return alerts;
}

function renderAmbient() {
  const rows = state.ambient.map((a) => `<tr>
    <td>${a.date}</td>
    <td>${a.highTime}</td><td>${a.high} m</td>
    <td>${a.lowTime}</td><td>${a.low} m</td>
    <td><span class="badge ${a.tideState === "Subiendo" ? "info" : "ok"}">${a.tideState}</span></td>
    <td>${a.temp} °C</td><td>${a.wind} km/h</td><td>${a.rain} mm</td>
  </tr>`).join("");
  const current = state.ambient.at(-1);
  const alerts = buildAmbientAlerts(current);
  const badgeClass = { ok: "ok", warn: "warn", crit: "crit" };
  const badgeLabel = { ok: "OK", warn: "Aviso", crit: "Critico" };
  const syncLabel = state.apiMeta?.ambientUpdatedAt || "Pendiente";
  const sourceLabel = state.apiMeta?.ambientSource || "Datos demo";

  $("#ambient-view").innerHTML = `
    <div class="grid two">
      <article class="plot-card"><h3>Mareas y meteorologia</h3><canvas id="ambient-chart" height="230"></canvas></article>
      <section class="panel">
        <div class="panel-header">
          <div>
            <h3>Alertas ambientales</h3>
            <p class="muted" style="font-size:12px;margin:3px 0 0">
              ${CADIZ.name} · ${sourceLabel}<br>
              <span style="color:var(--blue)">Auto-sync</span> · ultima actualizacion: <strong>${syncLabel}</strong>
            </p>
          </div>
          <span class="badge info">En vivo</span>
        </div>
        <div class="list">
          ${alerts.map((a) => `
            <div class="record">
              <span>${a.text}</span>
              <span class="badge ${badgeClass[a.level]}">${badgeLabel[a.level]}</span>
            </div>`).join("")}
        </div>
      </section>
    </div>
    <section class="panel" style="margin-top:16px">
      <div class="panel-header">
        <div>
          <h3>Historico por fecha</h3>
          <p class="muted" style="font-size:12px;margin:2px 0 0">
            Registros automaticos · ultima sincronizacion: <strong>${syncLabel}</strong>
          </p>
        </div>
        <span class="badge info">Auto-sync activo</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Fecha</th><th>Pleamar</th><th>Alt.</th><th>Bajamar</th><th>Alt.</th><th>Estado</th><th>Temp.</th><th>Viento</th><th>Lluvia</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>`;
}

function renderFieldbook() {
  const entries = state.fieldbook.filter((item) => item.planchaId === selectedPlancha);
  $("#fieldbook-view").innerHTML = `
    <div class="grid two">
      <section class="panel">
        <h3>Nuevo registro</h3>
        <form id="fieldbook-form" class="form-grid">
          ${planchaSelect("field-plancha", selectedPlancha)}
          ${macetaSelect("field-maceta", selectedPlancha, true)}
          <label>Fecha<input name="date" type="date" value="${today()}" required></label>
          <label>Hora<input name="time" type="time" value="08:00" required></label>
          <label>Altura (cm)<input name="height" type="number" min="0" step="0.1" required></label>
          <label>Ramificaciones (1-5)<input name="branches" type="number" min="1" max="5" required></label>
          <label>Biomasa estimada (g)<input name="biomass" type="number" min="0" step="0.1" required></label>
          <label>Foto opcional<input name="photo" type="file" accept="image/*" capture="environment"></label>
          <label class="full">Observaciones<textarea name="notes"></textarea></label>
          <label class="switch-row full"><input name="genetic" type="checkbox"> Candidata a seleccion genetica</label>
          <button class="primary-btn full" type="submit">Guardar registro</button>
        </form>
      </section>
      <article class="plot-card">
        <h3>Evolucion por plancha/maceta</h3>
        <canvas id="growth-chart" height="230"></canvas>
      </article>
    </div>
    <section class="panel" style="margin-top:16px">
      <h3>Historial ${selectedPlancha}</h3>
      <div class="list">${entries.map((e) => `<div class="record"><div><strong>${e.date} ${e.time} · ${e.macetaId || "Plancha completa"}</strong><span class="muted">${e.height} cm · ${e.branches}/5 · ${e.biomass} g · ${e.notes || "Sin observaciones"}</span></div><span class="badge ${e.genetic ? "ok" : "info"}">${e.genetic ? "Seleccion" : "Registro"}</span></div>`).join("") || empty("Sin registros para esta plancha")}</div>
    </section>`;
}

function renderIncidents() {
  const incidents = state.photos.filter((p) => p.isIncident);
  const visiblePhotos = state.photos.filter((p) => p.planchaId === selectedPlancha && (photoFilter === "Todas" || (photoFilter === "Incidencias" ? p.isIncident : !p.isIncident)));
  $("#incidents-view").innerHTML = `
    <div class="grid two">
      <section class="panel">
        <h3>Foto o incidencia</h3>
        <form id="photo-form" class="form-grid">
          ${planchaSelect("photo-plancha", selectedPlancha)}
          ${macetaSelect("photo-maceta", selectedPlancha, true)}
          <label>Fecha<input name="date" type="date" value="${today()}" required></label>
          <label>Imagen<input name="image" type="file" accept="image/*" capture="environment"></label>
          <label class="full">Comentario<textarea name="comment" required></textarea></label>
          <label class="switch-row full"><input name="isIncident" type="checkbox" id="is-incident"> Marcar como incidencia</label>
          <label>Tipo<select name="type"><option>Plaga</option><option>Dano fisico</option><option>Otros</option></select></label>
          <label>Severidad<select name="severity"><option>Baja</option><option>Media</option><option>Alta</option></select></label>
          <label>Estado<select name="status"><option>Activa</option><option>Seguimiento</option><option>Resuelta</option></select></label>
          <button class="primary-btn full" type="submit">Guardar</button>
        </form>
      </section>
      <section class="panel">
        <div class="panel-header">
          <h3>Galeria ${selectedPlancha}</h3>
          <div class="segmented">${["Todas", "Incidencias", "Crecimiento"].map((f) => `<button type="button" data-photo-filter="${f}" class="${photoFilter === f ? "active" : ""}">${f}</button>`).join("")}</div>
        </div>
        <div class="photo-grid">${visiblePhotos.map(photoCard).join("") || empty("No hay fotos con este filtro")}</div>
      </section>
    </div>
    <section class="panel" style="margin-top:16px">
      <h3>Panel de incidencias</h3>
      <div class="list">${incidents.map((i) => `<div class="record"><div><strong>${i.planchaId} · ${i.type}</strong><span class="muted">${i.date} · ${i.comment}</span></div><span><span class="badge ${i.severity === "Alta" ? "crit" : i.severity === "Media" ? "warn" : "ok"}">${i.severity}</span> <span class="badge info">${i.status}</span></span></div>`).join("") || empty("Sin incidencias")}</div>
    </section>`;
}

function renderIot() {
  const selectedSensors = state.sensors.filter((s) => s.planchaId === selectedPlancha);
  const sensors = selectedSensors.length ? selectedSensors : state.sensors;
  const sensorCards = sensors.map((s) => sensorMarkup(s)).join("");
  $("#iot-view").innerHTML = `
    <div class="grid two">
      <section class="panel">
        <div class="panel-header"><h3>Tabla sensores</h3><button class="primary-btn" id="refresh-sensors" type="button">Actualizar</button></div>
        <div class="sensor-grid">${sensorCards}</div>
      </section>
      <article class="plot-card"><h3>Evolucion temporal</h3><canvas id="sensor-chart" height="230"></canvas></article>
    </div>
    <div class="grid two" style="margin-top:16px">
      <section class="panel">
        <h3>Mapa sondas</h3>
        <div class="plancha-grid">${state.sensors.map((s) => `<button class="plancha-tile" data-select-plancha="${s.planchaId}"><strong>${s.name}</strong><p class="muted">${s.id} · ${s.planchaId}</p><span class="badge ${metricStatus(s.oxygen, 5, 8)}">${s.oxygen} mg/L O2</span></button>`).join("")}</div>
      </section>
      <section class="panel">
        <h3>Alertas IoT</h3>
        <div class="list">${issueAlerts().filter((a) => a.text.includes("oxigeno") || a.text.includes("nitratos") || a.text.includes("salinidad")).map((a) => `<div class="record"><span>${a.text}</span><span class="badge ${a.level}">${statusLabel(a.level)}</span></div>`).join("") || empty("Sensores dentro de rango")}</div>
      </section>
    </div>`;
}

function sensorMarkup(s) {
  const metrics = [
    ["Oxigeno", s.oxygen, "mg/L", metricStatus(s.oxygen, 5, 8)],
    ["Salinidad", s.salinity, "PSU", metricStatus(s.salinity, 28, 35)],
    ["Nitratos", s.nitrates, "mg/L", metricStatus(s.nitrates, 0, 20)],
    ["Temp. agua", s.waterTemp, "C", metricStatus(s.waterTemp, 16, 24)],
    ["pH", s.ph, "", metricStatus(s.ph, 7, 8.5)],
    ["Nivel agua", s.waterLevel, "m", metricStatus(s.waterLevel, 1.2, 2.3)],
    ["Luz", s.lightIntensity, "lx", metricStatus(s.lightIntensity, 500, 900)],
    ["Horas luz", s.lightHours, "h/dia", metricStatus(s.lightHours, 6, 10)]
  ];
  return metrics.map(([name, value, unit, status]) => `<article class="sensor"><span class="muted">${s.planchaId} · ${name}</span><p class="value">${value} ${unit}</p><span class="badge ${status}">${statusLabel(status)}</span></article>`).join("");
}

function renderHarvests() {
  const channels = [...new Set(state.harvests.map((h) => h.channel))];
  $("#harvests-view").innerHTML = `
    <div class="grid two">
      <section class="panel">
        <h3>Nueva cosecha</h3>
        <form id="harvest-form" class="form-grid">
          <label>ID_LOTE<input name="lotId" value="LT-2026-${String(state.harvests.length + 1).padStart(3, "0")}" required></label>
          ${planchaSelect("harvest-plancha", selectedPlancha)}
          <label>Fecha cosecha<input name="date" type="date" value="${today()}" required></label>
          <label>Canal<input name="channel" value="Canal A" required></label>
          <label>Marea (m)<input name="tide" type="number" min="0" step="0.1" required></label>
          <label>Peso total (kg)<input name="weight" type="number" min="0" step="0.1" required></label>
          <button class="primary-btn full" type="submit">Guardar cosecha</button>
        </form>
      </section>
      <article class="plot-card"><h3>Estadisticas de produccion</h3><canvas id="harvest-chart" height="230"></canvas></article>
    </div>
    <section class="panel" style="margin-top:16px">
      <div class="panel-header"><h3>Lista de cosechas</h3><span class="badge info">${channels.join(", ")}</span></div>
      <table><thead><tr><th>Lote</th><th>Plancha</th><th>Fecha</th><th>Canal</th><th>Marea</th><th>Peso</th><th>Rendimiento</th></tr></thead><tbody>${state.harvests.map((h) => `<tr><td>${h.lotId}</td><td>${h.planchaId}</td><td>${h.date}</td><td>${h.channel}</td><td>${h.tide} m</td><td>${h.weight} kg</td><td>${h.weight} kg/plancha</td></tr>`).join("")}</tbody></table>
    </section>`;
}

function renderTrace() {
  const selectedLot = $("#trace-search")?.value || state.trace[0]?.lotId || "";
  const trace = state.trace.find((item) => item.lotId === selectedLot) || state.trace[0];
  const pl = plancha(trace.planchaId);
  const relatedHarvest = state.harvests.find((h) => h.lotId === trace.lotId);
  const relatedIncidents = state.photos.filter((p) => p.planchaId === trace.planchaId && p.isIncident);
  const ambient = state.ambient.find((a) => a.date === trace.harvest) || state.ambient.at(-1);
  $("#trace-view").innerHTML = `
    <div class="grid two">
      <section class="panel">
        <div class="panel-header"><h3>Buscador de lote</h3><button class="ghost-btn" id="print-label" type="button">Imprimir etiqueta</button></div>
        <select id="trace-search" aria-label="Codigo lote">${state.trace.map((t) => `<option value="${t.lotId}" ${t.lotId === trace.lotId ? "selected" : ""}>${t.lotId}</option>`).join("")}</select>
        <div class="list" style="margin-top:14px">
          <div class="record"><span>Origen</span><strong>${pl.sectionId}, ${pl.id}</strong></div>
          <div class="record"><span>Marea</span><strong>${relatedHarvest?.tide || ambient.high} m</strong></div>
          <div class="record"><span>Incidencias</span><strong>${relatedIncidents.length}</strong></div>
          <div class="record"><span>Estado</span><strong>${trace.status}</strong></div>
          <div class="record"><span>Condiciones</span><strong>${ambient.temp} C · ${ambient.wind} km/h · pH ${state.sensors[0].ph}</strong></div>
        </div>
        <h3 style="margin-top:18px">Fases</h3>
        <div class="timeline">
          ${phase("Cosecha", trace.harvest)}
          ${phase("Lavado", trace.wash)}
          ${phase("Secado", trace.dry)}
          ${phase("Envasado", trace.pack)}
        </div>
      </section>
      <section class="panel">
        <h3>Etiqueta final</h3>
        <div class="label-preview" id="label-preview">
          <h3>${trace.lotId}</h3>
          <div class="record"><span>Origen</span><strong>${pl.sectionId}_${pl.id}</strong></div>
          <div class="record"><span>Fecha</span><strong>${trace.harvest}</strong></div>
          <div class="record"><span>Estado</span><strong>${trace.status}</strong></div>
          ${qrMarkup(trace.lotId, trace.lotId)}
        </div>
      </section>
    </div>
    <section class="panel" style="margin-top:16px">
      <h3>Trazabilidad completa</h3>
      <table><thead><tr><th>Lote</th><th>Plancha</th><th>Cosecha</th><th>Lavado</th><th>Secado</th><th>Envasado</th><th>Estado</th></tr></thead><tbody>${state.trace.map((t) => `<tr><td>${t.lotId}</td><td>${t.planchaId}</td><td>${t.harvest || "-"}</td><td>${t.wash || "-"}</td><td>${t.dry || "-"}</td><td>${t.pack || "-"}</td><td>${t.status}</td></tr>`).join("")}</tbody></table>
    </section>`;
}

function phase(name, date) {
  return `<div class="timeline-item"><span class="badge ${date ? "ok" : "warn"}">${name}</span><strong>${date || "Pendiente"}</strong></div>`;
}

function renderUsers() {
  const view = $("#users-view");
  if (!view) return;
  if (!hasPermission(currentUser, "manageUsers")) {
    view.innerHTML = `<section class="panel">${empty("No tienes permiso para gestionar usuarios.")}</section>`;
    return;
  }

  const assignable = getAssignableModules();
  const editableUsers = managedUsers();
  const adminScope = currentUser.hierarchy === "admin" ? "Solo puedes gestionar usuarios y asignar modulos que ya tienes asignados." : "Puedes gestionar usuarios y administradores.";
  view.innerHTML = `
    <div class="grid two">
      <section class="panel">
        <div class="panel-header">
          <h3>Nuevo usuario</h3>
          <span class="badge info">${HIERARCHY_LABELS[currentUser.hierarchy]}</span>
        </div>
        <p class="muted">${adminScope}</p>
        <form id="user-create-form" class="form-grid user-admin-form">
          <label>Usuario<input name="username" autocomplete="off" required></label>
          <label>Email<input name="email" type="email" required></label>
          <label>Contrasena<input name="password" type="password" minlength="6" required></label>
          ${userHierarchySelect("user")}
          <label class="full">Rol visible<input name="role" value="Usuario"></label>
          <div class="full module-checks">${moduleCheckboxes(assignable)}</div>
          <button class="primary-btn full" type="submit">Crear usuario</button>
        </form>
      </section>
      <section class="panel">
        <div class="panel-header">
          <h3>Permisos activos</h3>
          <span class="badge ok">${editableUsers.length} gestionables</span>
        </div>
        <div class="list">
          <div class="record"><span>Tu nivel</span><strong>${HIERARCHY_LABELS[currentUser.hierarchy]}</strong></div>
          <div class="record"><span>Modulos asignables</span><strong>${assignable.map((viewId) => VIEW_LABELS[viewId]).join(", ")}</strong></div>
          <div class="record"><span>Gestion de admins</span><strong>${hasPermission(currentUser, "manageAdmins") ? "Permitida" : "No permitida"}</strong></div>
        </div>
      </section>
    </div>
    <section class="panel" style="margin-top:16px">
      <div class="panel-header"><h3>Usuarios</h3><span class="badge info">Gestionar usuarios</span></div>
      <div class="user-admin-list">${editableUsers.map(userAdminCard).join("") || empty("No hay usuarios gestionables.")}</div>
    </section>`;
}

function userHierarchySelect(selected) {
  const options = currentUser?.hierarchy === "superadmin" ? ["user", "admin", "superadmin"] : ["user"];
  return `<label>Nivel<select name="hierarchy">${options.map((level) => `<option value="${level}" ${level === selected ? "selected" : ""}>${HIERARCHY_LABELS[level]}</option>`).join("")}</select></label>`;
}

function moduleCheckboxes(assignable, selected = ["trace"]) {
  return ALL_MODULE_VIEWS.map((viewId) => {
    const allowed = assignable.includes(viewId);
    const checked = selected.includes(viewId);
    return `<label class="module-check ${allowed ? "" : "disabled"}">
      <input type="checkbox" name="modules" value="${viewId}" ${checked ? "checked" : ""} ${allowed ? "" : "disabled"}>
      <span>${VIEW_LABELS[viewId]}</span>
    </label>`;
  }).join("");
}

function userAdminCard(user) {
  const assignable = getAssignableModules();
  return `
    <form class="user-card" data-user-admin="${user.username}">
      <div class="user-card-head">
        <div>
          <strong>${user.username}</strong>
          <span class="muted">${user.email}</span>
        </div>
        <span class="badge ${user.active === false ? "warn" : "ok"}">${user.active === false ? "Inactivo" : "Activo"}</span>
      </div>
      <div class="form-grid">
        <label>Email<input name="email" type="email" value="${user.email}" required></label>
        <label>Rol visible<input name="role" value="${user.role || "Usuario"}"></label>
        ${userHierarchySelect(user.hierarchy || "user")}
        <label>Estado<select name="active"><option value="true" ${user.active !== false ? "selected" : ""}>Activo</option><option value="false" ${user.active === false ? "selected" : ""}>Inactivo</option></select></label>
        <div class="full module-checks">${moduleCheckboxes(assignable, user.modules || [])}</div>
      </div>
      <div class="user-card-actions">
        <button class="primary-btn" type="submit">Guardar</button>
        <button class="danger-btn" type="button" data-user-delete="${user.username}">Eliminar</button>
      </div>
    </form>`;
}

function planchaSelect(name, value) {
  return `<label>Plancha<select name="planchaId" id="${name}">${state.planchas.map((p) => `<option value="${p.id}" ${p.id === value ? "selected" : ""}>${p.id}</option>`).join("")}</select></label>`;
}

function macetaSelect(name, planchaId, optional = false) {
  return `<label>Maceta<select name="macetaId" id="${name}">${optional ? "<option value=''>Plancha completa</option>" : ""}${macetaOptions(planchaId).map((m) => `<option value="${m}">${m}</option>`).join("")}</select></label>`;
}

function empty(text) {
  return `<div class="record"><span class="muted">${text}</span></div>`;
}

function photoCard(p) {
  const img = p.image ? `<img src="${p.image}" alt="${p.comment}">` : `<div class="photo-fallback">Sin imagen</div>`;
  return `<article class="photo-card">${img}<div><strong>${p.date} · ${p.macetaId || p.planchaId}</strong><p class="muted">${p.comment}</p><span class="badge ${p.isIncident ? "warn" : "ok"}">${p.isIncident ? "Incidencia" : "Crecimiento"}</span></div></article>`;
}

function qrMarkup(text, encodedValue = text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  const cells = Array.from({ length: 81 }, (_, i) => {
    const row = Math.floor(i / 9);
    const col = i % 9;
    const finder = (row < 3 && col < 3) || (row < 3 && col > 5) || (row > 5 && col < 3);
    const dark = finder || ((hash >> ((i + row + col) % 24)) & 1);
    return `<span class="${dark ? "dark" : ""}"></span>`;
  }).join("");
  const value = encodedValue;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${encodeURIComponent(value)}`;
  return `<div class="qr" role="img" aria-label="QR ${text}">${cells}<img src="${src}" alt="QR ${text}" onerror="this.remove()"></div>`;
}

function bindEvents() {
  $(".nav").addEventListener("click", (event) => {
    const button = event.target.closest(".nav-item");
    if (!button) return;
    navigateTo(button.dataset.view);
    setMenuOpen(false);
  });

  $("#global-plancha").addEventListener("change", (event) => {
    selectedPlancha = event.target.value;
    history.replaceState(null, "", `#${selectedPlancha}`);
    render();
  });

  $("#seed-reset").addEventListener("click", () => {
    if (!hasPermission(currentUser, "resetDemo")) {
      toast("Solo superadmin puede restaurar la demo");
      return;
    }
    state = structuredClone(seed);
    selectedPlancha = state.planchas[0].id;
    saveState();
    render();
    toast("Datos demo restaurados");
  });

  document.addEventListener("click", (event) => {
    const planchaButton = event.target.closest("[data-select-plancha]");
    if (planchaButton) {
      selectedPlancha = planchaButton.dataset.selectPlancha;
      history.replaceState(null, "", `#${selectedPlancha}`);
      render();
      toast(`${selectedPlancha} seleccionada`);
    }
    const filter = event.target.closest("[data-photo-filter]");
    if (filter) {
      photoFilter = filter.dataset.photoFilter;
      renderIncidents();
    }
    if (event.target.id === "refresh-sensors") {
      state.sensors = state.sensors.map((sensor) => ({
        ...sensor,
        oxygen: clamp(round(sensor.oxygen + rand(-0.35, 0.35)), 3.8, 8.4),
        salinity: clamp(round(sensor.salinity + rand(-1, 1)), 26, 38),
        nitrates: clamp(round(sensor.nitrates + rand(-2, 2)), 5, 28),
        ph: clamp(round(sensor.ph + rand(-0.1, 0.1)), 6.8, 8.7)
      }));
      saveState();
      render();
      toast("Sensores actualizados");
    }
    // sync-cadiz-api button removed — auto-sync handles updates automatically
    if (event.target.id === "copy-plancha-url") {
      navigator.clipboard?.writeText(planchaUrl(selectedPlancha));
      toast("Enlace QR copiado");
    }
    if (event.target.id === "print-label") {
      window.print();
    }
    const deleteButton = event.target.closest("[data-user-delete]");
    if (deleteButton) {
      const username = deleteButton.dataset.userDelete;
      const user = DEMO_USERS.find((candidate) => candidate.username === username);
      if (!canManageUser(user)) {
        toast("No tienes permiso para eliminar este usuario");
        return;
      }
      const index = DEMO_USERS.findIndex((candidate) => candidate.username === username);
      DEMO_USERS.splice(index, 1);
      renderUsers();
      updateAuthUI();
      toast(`Usuario ${username} eliminado`);
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.id === "field-plancha" || event.target.id === "photo-plancha") {
      selectedPlancha = event.target.value;
      history.replaceState(null, "", `#${selectedPlancha}`);
      render();
    }
  });

  document.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.target;
    const data = Object.fromEntries(new FormData(form).entries());
    if (form.id === "fieldbook-form") {
      state.fieldbook.push({
        id: `CB-${String(state.fieldbook.length + 1).padStart(3, "0")}`,
        planchaId: data.planchaId,
        macetaId: data.macetaId,
        date: data.date,
        time: data.time,
        height: Number(data.height),
        branches: Number(data.branches),
        biomass: Number(data.biomass),
        notes: data.notes,
        genetic: Boolean(form.elements.genetic.checked),
        photo: await readFile(form.elements.photo.files[0])
      });
      selectedPlancha = data.planchaId;
      saveState();
      render();
      toast("Registro guardado");
    }
    if (form.id === "photo-form") {
      state.photos.push({
        id: `FT-${String(state.photos.length + 1).padStart(3, "0")}`,
        planchaId: data.planchaId,
        macetaId: data.macetaId,
        date: data.date,
        image: await readFile(form.elements.image.files[0]),
        comment: data.comment,
        isIncident: Boolean(form.elements.isIncident.checked),
        type: form.elements.isIncident.checked ? data.type : "",
        severity: form.elements.isIncident.checked ? data.severity : "",
        status: form.elements.isIncident.checked ? data.status : ""
      });
      selectedPlancha = data.planchaId;
      saveState();
      render();
      toast("Foto guardada");
    }
    if (form.id === "harvest-form") {
      state.harvests.push({ lotId: data.lotId, planchaId: data.planchaId, date: data.date, channel: data.channel, tide: Number(data.tide), weight: Number(data.weight) });
      state.trace.push({ lotId: data.lotId, planchaId: data.planchaId, harvest: data.date, wash: "", dry: "", pack: "", status: "Pendiente" });
      selectedPlancha = data.planchaId;
      saveState();
      render();
      toast("Cosecha registrada");
    }
    if (form.id === "user-create-form") {
      createManagedUser(form, data);
    }
    if (form.matches("[data-user-admin]")) {
      updateManagedUser(form, data);
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.id === "trace-search") {
      renderTrace();
    }
  });
}

function selectedModulesFromForm(form) {
  const assignable = getAssignableModules();
  const modules = [...form.querySelectorAll('input[name="modules"]:checked')]
    .map((input) => input.value)
    .filter((viewId) => assignable.includes(viewId));
  if (modules.length) return [...new Set(modules)];
  return assignable.includes("trace") ? ["trace"] : assignable.slice(0, 1);
}

function allowedManagedHierarchy(requested) {
  if (currentUser?.hierarchy === "superadmin" && ["superadmin", "admin", "user"].includes(requested)) return requested;
  return "user";
}

function confirmSuperadminGrant(username) {
  return window.confirm(`Vas a convertir a ${username} en superadmin. Tendra acceso total y podra gestionar todos los permisos. ¿Estas seguro?`);
}

function createManagedUser(form, data) {
  if (!hasPermission(currentUser, "manageUsers")) {
    toast("No tienes permiso para crear usuarios");
    return;
  }
  const username = String(data.username || "").trim().toLowerCase();
  const email = String(data.email || "").trim();
  const password = String(data.password || "");
  if (!username || !email || password.length < 6) {
    toast("Completa usuario, email y contrasena");
    return;
  }
  if (DEMO_USERS.some((user) => user.username === username)) {
    toast("Ese usuario ya existe");
    return;
  }
  const hierarchy = allowedManagedHierarchy(data.hierarchy);
  if (hierarchy === "superadmin" && !confirmSuperadminGrant(username)) return;

  DEMO_USERS.push({
    username,
    email,
    password,
    role: String(data.role || "Usuario").trim() || "Usuario",
    hierarchy,
    modules: hierarchy === "superadmin" ? [...ALL_MODULE_VIEWS] : selectedModulesFromForm(form),
    active: true
  });
  form.reset();
  renderUsers();
  updateAuthUI();
  toast(`Usuario ${username} creado`);
}

function updateManagedUser(form, data) {
  const username = form.dataset.userAdmin;
  const user = DEMO_USERS.find((candidate) => candidate.username === username);
  if (!canManageUser(user)) {
    toast("No tienes permiso para modificar este usuario");
    return;
  }
  const hierarchy = allowedManagedHierarchy(data.hierarchy);
  if (hierarchy === "superadmin" && user.hierarchy !== "superadmin" && !confirmSuperadminGrant(username)) return;

  user.email = String(data.email || "").trim();
  user.role = String(data.role || "Usuario").trim() || "Usuario";
  user.hierarchy = hierarchy;
  user.active = data.active === "true";
  user.modules = hierarchy === "superadmin" ? [...ALL_MODULE_VIEWS] : selectedModulesFromForm(form);
  renderUsers();
  updateAuthUI();
  toast(`Permisos de ${username} actualizados`);
}

function readFile(file) {
  if (!file) return Promise.resolve("");
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function drawCharts() {
  drawLine("production-chart", state.harvests.map((h) => h.date.slice(5)), state.harvests.map((h) => h.weight), "#2f7d57", "kg");
  const counts = ["Completado", "En proceso", "Pendiente"].map((status) => state.trace.filter((t) => t.status === status).length);
  drawBars("lot-chart", ["Complet.", "Proceso", "Pend."], counts, ["#2f7d57", "#31759d", "#c9821b"]);
  drawLine("ambient-chart", state.ambient.map((a) => a.date.slice(5)), state.ambient.map((a) => a.high), "#31759d", "m");
  const entries = state.fieldbook.filter((e) => e.planchaId === selectedPlancha);
  drawMultiLine("growth-chart", entries.map((e) => e.date.slice(5)), [
    { values: entries.map((e) => e.height), color: "#2f7d57", label: "cm" },
    { values: entries.map((e) => e.biomass), color: "#7059a8", label: "g" }
  ]);
  drawMultiLine("sensor-chart", state.sensorHistory.map((s) => s.date), [
    { values: state.sensorHistory.map((s) => s.oxygen), color: "#2f7d57", label: "O2" },
    { values: state.sensorHistory.map((s) => s.nitrates), color: "#bb3f3a", label: "NO3" },
    { values: state.sensorHistory.map((s) => s.ph), color: "#31759d", label: "pH" }
  ]);
  drawBars("harvest-chart", state.harvests.map((h) => h.planchaId), state.harvests.map((h) => h.weight), ["#2f7d57", "#31759d", "#c9821b", "#7059a8"]);
}

function chartCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { canvas, ctx, width: rect.width, height: rect.height };
}

function drawAxes(ctx, width, height) {
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "#d9e1dd";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(36, 16);
  ctx.lineTo(36, height - 30);
  ctx.lineTo(width - 12, height - 30);
  ctx.stroke();
}

function drawLine(id, labels, values, color, unit) {
  const chart = chartCanvas(id);
  if (!chart) return;
  const { ctx, width, height } = chart;
  drawAxes(ctx, width, height);
  if (!values.length) return;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const points = values.map((value, i) => {
    const x = 42 + (i * (width - 70)) / Math.max(values.length - 1, 1);
    const y = height - 34 - ((value - min) / span) * (height - 58);
    return [x, y];
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  points.forEach(([x, y], i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#63706b";
    ctx.font = "12px Segoe UI";
    ctx.fillText(labels[i] || "", x - 14, height - 10);
  });
  ctx.fillStyle = "#63706b";
  ctx.fillText(`${max} ${unit}`, 6, 18);
}

function drawMultiLine(id, labels, series) {
  const chart = chartCanvas(id);
  if (!chart) return;
  const { ctx, width, height } = chart;
  drawAxes(ctx, width, height);
  const allValues = series.flatMap((s) => s.values);
  if (!allValues.length) return;
  const max = Math.max(...allValues, 1);
  const min = Math.min(...allValues, 0);
  const span = max - min || 1;
  series.forEach((s, index) => {
    const points = s.values.map((value, i) => {
      const x = 42 + (i * (width - 70)) / Math.max(s.values.length - 1, 1);
      const y = height - 34 - ((value - min) / span) * (height - 58);
      return [x, y];
    });
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.fillStyle = s.color;
    ctx.fillText(s.label, width - 56, 22 + index * 16);
  });
  labels.forEach((label, i) => {
    const x = 42 + (i * (width - 70)) / Math.max(labels.length - 1, 1);
    ctx.fillStyle = "#63706b";
    ctx.font = "12px Segoe UI";
    ctx.fillText(label, x - 14, height - 10);
  });
}

function drawBars(id, labels, values, colors) {
  const chart = chartCanvas(id);
  if (!chart) return;
  const { ctx, width, height } = chart;
  drawAxes(ctx, width, height);
  if (!values.length) return;
  const max = Math.max(...values, 1);
  const plotWidth = width - 64;
  const barWidth = Math.max(22, plotWidth / values.length - 18);
  values.forEach((value, i) => {
    const x = 46 + i * (plotWidth / values.length);
    const barHeight = (value / max) * (height - 62);
    const y = height - 30 - barHeight;
    ctx.fillStyle = Array.isArray(colors) ? colors[i % colors.length] : colors;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#17201d";
    ctx.font = "12px Segoe UI";
    ctx.fillText(value, x + 3, y - 6);
    ctx.fillStyle = "#63706b";
    ctx.fillText(labels[i] || "", x - 2, height - 10);
  });
}

async function syncCadizApi() {
  const button = $("#sync-cadiz-api");
  if (button) {
    button.disabled = true;
    button.textContent = "Actualizando...";
  }
  try {
    const params = new URLSearchParams({
      latitude: String(CADIZ.latitude),
      longitude: String(CADIZ.longitude),
      timezone: CADIZ.timezone,
      forecast_days: "3",
      current: "temperature_2m,relative_humidity_2m,precipitation,pressure_msl,wind_speed_10m,wind_direction_10m",
      hourly: "temperature_2m,relative_humidity_2m,precipitation,pressure_msl,wind_speed_10m,wind_direction_10m"
    });
    const marineParams = new URLSearchParams({
      latitude: String(CADIZ.latitude),
      longitude: String(CADIZ.longitude),
      timezone: CADIZ.timezone,
      forecast_days: "3",
      current: "sea_level_height_msl,sea_surface_temperature",
      hourly: "sea_level_height_msl,sea_surface_temperature"
    });
    const [weatherRes, marineRes] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?${params}`),
      fetch(`https://marine-api.open-meteo.com/v1/marine?${marineParams}`)
    ]);
    if (!weatherRes.ok || !marineRes.ok) throw new Error("API no disponible");
    const [weather, marine] = await Promise.all([weatherRes.json(), marineRes.json()]);
    const ambient = buildAmbientFromApi(weather, marine);
    if (!ambient.length) throw new Error("Respuesta sin datos utiles");
    state.ambient = ambient;
    state.apiMeta = {
      ambientSource: "Open-Meteo Forecast + Marine API",
      ambientUpdatedAt: nowLocalInput().replace("T", " ")
    };
    const currentSea = marine.current?.sea_surface_temperature;
    if (Number.isFinite(currentSea)) {
      state.sensors = state.sensors.map((sensor) => ({ ...sensor, waterTemp: round(currentSea) }));
    }
    saveState();
    render();
    toast("Datos de Cadiz actualizados");
  } catch (error) {
    toast("No se pudo actualizar la API");
  } finally {
    const refreshed = $("#sync-cadiz-api");
    if (refreshed) {
      refreshed.disabled = false;
      refreshed.textContent = "Actualizar API";
    }
  }
}

function buildAmbientFromApi(weather, marine) {
  const byDate = new Map();
  const weatherHourly = weather.hourly || {};
  const marineHourly = marine.hourly || {};
  weatherHourly.time?.forEach((time, index) => {
    const date = time.slice(0, 10);
    const hour = time.slice(11, 16);
    if (!byDate.has(date)) byDate.set(date, { date, weather: [], marine: [] });
    byDate.get(date).weather.push({
      hour,
      temp: num(weatherHourly.temperature_2m?.[index]),
      humidity: num(weatherHourly.relative_humidity_2m?.[index]),
      wind: num(weatherHourly.wind_speed_10m?.[index]),
      windDirDeg: num(weatherHourly.wind_direction_10m?.[index]),
      rain: num(weatherHourly.precipitation?.[index]),
      pressure: num(weatherHourly.pressure_msl?.[index])
    });
  });
  marineHourly.time?.forEach((time, index) => {
    const date = time.slice(0, 10);
    if (!byDate.has(date)) byDate.set(date, { date, weather: [], marine: [] });
    byDate.get(date).marine.push({
      hour: time.slice(11, 16),
      seaLevel: num(marineHourly.sea_level_height_msl?.[index]),
      seaTemp: num(marineHourly.sea_surface_temperature?.[index])
    });
  });
  return [...byDate.values()].slice(0, 5).map((day) => {
    const high = extrema(day.marine, "seaLevel", "max");
    const low = extrema(day.marine, "seaLevel", "min");
    const noon = nearestHour(day.weather, "12:00") || day.weather[0] || {};
    const nowMarine = nearestHour(day.marine, nowLocalInput().slice(11, 16)) || day.marine[0] || {};
    const nextMarine = day.marine[Math.min(day.marine.indexOf(nowMarine) + 1, day.marine.length - 1)] || nowMarine;
    return {
      date: day.date,
      highTime: high?.hour || "--:--",
      high: round(high?.seaLevel || 0),
      lowTime: low?.hour || "--:--",
      low: round(low?.seaLevel || 0),
      tideState: (nextMarine.seaLevel || 0) >= (nowMarine.seaLevel || 0) ? "Subiendo" : "Bajando",
      temp: round(noon.temp || 0),
      humidity: round(noon.humidity || 0),
      wind: round(noon.wind || 0),
      windDir: degToCompass(noon.windDirDeg),
      rain: round(day.weather.reduce((sum, item) => sum + (item.rain || 0), 0)),
      pressure: round(noon.pressure || 0)
    };
  });
}

function num(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function extrema(items, key, mode) {
  const valid = items.filter((item) => Number.isFinite(item[key]));
  if (!valid.length) return null;
  return valid.reduce((best, item) => (mode === "max" ? item[key] > best[key] : item[key] < best[key]) ? item : best, valid[0]);
}

function nearestHour(items, hour) {
  if (!items.length) return null;
  const target = minutes(hour);
  return items.reduce((best, item) => Math.abs(minutes(item.hour) - target) < Math.abs(minutes(best.hour) - target) ? item : best, items[0]);
}

function minutes(hour) {
  const [h, m] = hour.split(":").map(Number);
  return h * 60 + m;
}

function degToCompass(deg) {
  if (!Number.isFinite(deg)) return "-";
  const dirs = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return dirs[Math.round(deg / 45) % 8];
}

window.addEventListener("resize", () => requestAnimationFrame(drawCharts));
bindEvents();
authInit().then(() => render());

// ── AUTO-SYNC DATOS AMBIENTALES ────────────────────────────────────────────
// Sincronizar al cargar si los datos tienen mas de 55 min de antiguedad o no existen
(function scheduleAutoSync() {
  const INTERVAL_MS = 60 * 60 * 1000; // 1 hora

  async function autoSync() {
    try {
      await syncCadizApi();
    } catch (e) {
      // Silencioso — el usuario ya ve el badge y la fecha de ultima sync
    }
  }

  function shouldSync() {
    if (!state.apiMeta?.ambientUpdatedAt) return true;
    const lastSync = new Date(state.apiMeta.ambientUpdatedAt.replace(" ", "T"));
    return (Date.now() - lastSync.getTime()) > (INTERVAL_MS - 5 * 60 * 1000); // si han pasado > 55 min
  }

  // Al cargar: sync si es necesario
  if (shouldSync()) {
    autoSync();
  }

  // Repetir cada hora
  setInterval(autoSync, INTERVAL_MS);
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
