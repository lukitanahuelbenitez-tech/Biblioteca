const MAX_FAVORITOS = 4;
const usuario = obtenerUsuarioActual();

/* ---------- Utilidades ---------- */

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function estrellas(puntuacion) {
  return "★".repeat(Math.floor(puntuacion)) + (puntuacion % 1 ? "½" : "");
}

function parsearFecha(texto) {
  const [d, m, a] = texto.split("/").map(Number);
  return new Date(a, m - 1, d);
}

/* ---------- Datos (localStorage) ---------- */

function obtenerFavoritos() {
  return JSON.parse(localStorage.getItem(`favoritos_${usuario}`)) || [];
}

function guardarFavoritos(ids) {
  localStorage.setItem(`favoritos_${usuario}`, JSON.stringify(ids));
}

function obtenerWatchlist() {
  return JSON.parse(localStorage.getItem(`watchlist_${usuario}`)) || [];
}

function obtenerResenasDeUsuario() {
  const todas = JSON.parse(localStorage.getItem("resenas")) || {};
  const lista = [];

  Object.keys(todas).forEach(idLibro => {
    const libro = libros.find(l => l.id === Number(idLibro));
    if (!libro) return;
    todas[idLibro].forEach(r => {
      if (r.usuario === usuario) lista.push({ ...r, libro });
    });
  });

  return lista.sort((a, b) => parsearFecha(b.fecha) - parsearFecha(a.fecha));
}

/* ---------- Render ---------- */

function htmlPortada(libro) {
  return `
    <a class="libro-fav" href="libro.html?id=${libro.id}">
      <img class="libro-fav-portada" src="${libro.portada}" alt="${escapar(libro.titulo)}">
      <span>${escapar(libro.titulo)}</span>
    </a>`;
}

function htmlFilaResena(r, completa) {
  return `
    <article class="resena-item resena-fila">
      <img class="resena-fila__portada" src="${r.libro.portada}" alt="">
      <div>
        <h3><a href="libro.html?id=${r.libro.id}">${escapar(r.libro.titulo)}</a></h3>
        <p class="resena-puntaje">${estrellas(r.puntuacion)} <small>${escapar(r.fecha)}</small></p>
        ${r.comentario && completa ? `<p>${escapar(r.comentario)}</p>` : ""}
      </div>
    </article>`;
}

function vacio(texto) {
  return `<p class="perfil-vacio">${texto}</p>`;
}

function renderFavoritos() {
  const seccion = document.getElementById("seccion-favoritos");
  const favs = obtenerFavoritos()
    .map(id => libros.find(l => l.id === id))
    .filter(Boolean);

  if (favs.length === 0) {
    seccion.hidden = true;
    return;
  }
  seccion.hidden = false;
  document.getElementById("perfil-favoritos").innerHTML = favs.map(htmlPortada).join("");
}

function renderActividad(resenas) {
  const cont = document.getElementById("perfil-actividad");
  cont.innerHTML = resenas.length
    ? resenas.slice(0, 5).map(r => htmlFilaResena(r, false)).join("")
    : vacio("Todavía no hay actividad.");
}

function renderStats(resenas) {
  const vistos = new Set(resenas.map(r => r.libro.id)).size;
  const promedio = resenas.length
    ? (resenas.reduce((acc, r) => acc + r.puntuacion, 0) / resenas.length).toFixed(1)
    : "–";

  const stats = [
    ["Libros", vistos],
    ["Reseñas", resenas.length],
    ["Promedio", promedio],
    ["Favoritos", obtenerFavoritos().length],
    ["Listas", 0],
    ["Likes", 0]
  ];

  document.getElementById("perfil-stats").innerHTML = stats
    .map(([etiqueta, valor]) => `
      <div class="perfil-stat">
        <strong>${valor}</strong>
        <span>${etiqueta}</span>
      </div>`)
    .join("");
}

function renderDiario(resenas) {
  document.getElementById("perfil-diario").innerHTML = resenas.length
    ? resenas.map(r => htmlFilaResena(r, false)).join("")
    : vacio("Tu diario está vacío.");
}

function renderResenas(resenas) {
  const conTexto = resenas.filter(r => r.comentario);
  document.getElementById("perfil-resenas").innerHTML = conTexto.length
    ? conTexto.map(r => htmlFilaResena(r, true)).join("")
    : vacio("Todavía no escribiste reseñas.");
}

function renderWatchlist() {
  const libros_ = obtenerWatchlist()
    .map(id => libros.find(l => l.id === id))
    .filter(Boolean);

  document.getElementById("perfil-watchlist").innerHTML = libros_.length
    ? libros_.map(htmlPortada).join("")
    : vacio("Tu watchlist está vacía.");
}

function renderTodo() {
  const resenas = obtenerResenasDeUsuario();
  renderFavoritos();
  renderActividad(resenas);
  renderStats(resenas);
  renderDiario(resenas);
  renderResenas(resenas);
  renderWatchlist();
}

/* ---------- Pestañas ---------- */

function iniciarTabs() {
  const tabs = document.querySelectorAll(".perfil-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", e => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove("is-active"));
      document.querySelectorAll(".perfil-panel").forEach(p => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.getElementById(`panel-${tab.dataset.tab}`).classList.add("is-active");
    });
  });
}

/* ---------- Editar perfil ---------- */

function iniciarEdicion() {
  const dialogo = document.getElementById("dialogo-editar");
  const contSelects = document.getElementById("selects-favoritos");

  document.getElementById("btn-editar-perfil").addEventListener("click", () => {
    const actuales = obtenerFavoritos();
    contSelects.innerHTML = "";

    for (let i = 0; i < MAX_FAVORITOS; i++) {
      const select = document.createElement("select");
      select.className = "select-favorito";
      select.innerHTML =
        `<option value="">— Ninguno —</option>` +
        libros.map(l => `<option value="${l.id}">${escapar(l.titulo)}</option>`).join("");
      select.value = actuales[i] || "";
      contSelects.appendChild(select);
    }

    dialogo.showModal();
  });

  document.getElementById("btn-cancelar").addEventListener("click", () => dialogo.close());

  document.getElementById("form-editar").addEventListener("submit", e => {
    e.preventDefault();
    const ids = [...document.querySelectorAll(".select-favorito")]
      .map(s => Number(s.value))
      .filter(id => id > 0);

    guardarFavoritos([...new Set(ids)]);
    dialogo.close();
    renderTodo();
  });
}

/* ---------- Inicio ---------- */

document.addEventListener("DOMContentLoaded", () => {
  iniciarTabs();

  if (!usuario) {
    document.getElementById("perfil-nombre").textContent = "Iniciá sesión";
    document.getElementById("btn-editar-perfil").hidden = true;
    document.querySelector(".perfil-tabs").hidden = true;
    document.getElementById("panel-perfil").innerHTML =
      vacio("Iniciá sesión para ver tu perfil.");
    return;
  }

  document.getElementById("perfil-nombre").textContent = usuario;
  document.getElementById("perfil-avatar").textContent = usuario.charAt(0).toUpperCase();

  iniciarEdicion();
  renderTodo();

});