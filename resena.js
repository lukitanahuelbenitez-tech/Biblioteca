const MAX_FAVORITOS = 4;
const usuario = obtenerUsuarioActual();
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
               "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

let datos = { resenas: [], unicos: [], likeadas: [] };

/* ---------- Utilidades ---------- */

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function normalizar(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function estrellas(puntuacion) {
  return "★".repeat(Math.floor(puntuacion)) + (puntuacion % 1 ? "½" : "");
}

// "ts" es el momento en que se guardó la reseña (lo manda el servidor)
function marcaTiempo(r) {
  return r.ts;
}

function vacio(texto) {
  return `<p class="perfil-vacio">${texto}</p>`;
}

/* ---------- Datos ---------- */

function obtenerFavoritos() {
  return JSON.parse(localStorage.getItem(`favoritos_${usuario}`)) || [];
}

function guardarFavoritos(ids) {
  localStorage.setItem(`favoritos_${usuario}`, JSON.stringify(ids));
}

// El servidor manda el id del libro; acá le sumamos los datos del libro (título, portada...)
function conLibros(lista) {
  return lista
    .map(r => ({ ...r, libro: libros.find(l => l.id === r.libro) }))
    .filter(r => r.libro);
}

// Una entrada por libro: la reseña más reciente de cada uno
function ultimaResenaPorLibro(resenas) {
  const vistos = new Set();
  return resenas.filter(r => {
    if (vistos.has(r.libro.id)) return false;
    vistos.add(r.libro.id);
    return true;
  });
}

function librosDeIds(ids) {
  return ids.map(id => libros.find(l => l.id === id)).filter(Boolean);
}

/* ---------- HTML reutilizable ---------- */

function htmlPoster(libro, pie = "") {
  return `
    <a class="poster" href="libro.html?id=${libro.id}">
      <img src="${libro.portada}" alt="${escapar(libro.titulo)}" title="${escapar(libro.titulo)}" loading="lazy">
      ${pie}
    </a>`;
}

function pieEstrellas(r) {
  return `<span class="poster__pie">${estrellas(r.puntuacion)}${r.comentario ? ' <i class="poster__resena">≡</i>' : ""}</span>`;
}

// modo: "diario" (fechas + ≡), "resena" (con extracto) o "like" (con autor)
function htmlFilaResena(r, modo) {
  const href = r.comentario
    ? `resena.html?id=${r.id}`
    : `libro.html?id=${r.libro.id}`;

  const autor = modo === "like"
    ? `<p class="fila-resena__autor">Reseña de <strong>${escapar(r.usuario)}</strong></p>`
    : "";
  const icono = modo === "diario" && r.comentario ? ' <i class="poster__resena">≡</i>' : "";
  const extracto = r.comentario && modo !== "diario"
    ? `<p class="fila-resena__texto">${escapar(r.comentario)}</p>`
    : "";

  return `
    <a class="fila-resena" href="${href}">
      <img class="fila-resena__portada" src="${r.libro.portada}" alt="">
      <div class="fila-resena__cuerpo">
        <h3>${escapar(r.libro.titulo)} <small>${r.libro.anio}</small></h3>
        ${autor}
        <p class="fila-resena__estrellas">${estrellas(r.puntuacion)} <small>${escapar(formatearRango(r))}</small>${icono}</p>
        ${extracto}
      </div>
    </a>`;
}

/* ---------- Render del perfil ---------- */

function renderFavoritos() {
  const seccion = document.getElementById("seccion-favoritos");
  const favs = librosDeIds(obtenerFavoritos());

  if (favs.length === 0) {
    seccion.hidden = true;
    return;
  }
  seccion.hidden = false;
  document.getElementById("perfil-favoritos").innerHTML =
    favs.map(l => htmlPoster(l)).join("");
}

function renderActividad() {
  const cont = document.getElementById("perfil-actividad");
  const ultimos = datos.unicos.slice(0, 4);

  cont.innerHTML = ultimos.length
    ? ultimos.map(r => htmlPoster(r.libro, pieEstrellas(r))).join("")
    : vacio("Todavía no hay actividad.");
}

function renderRatings() {
  const cont = document.getElementById("perfil-ratings");
  const total = document.getElementById("ratings-total");
  const calificados = datos.unicos;

  if (calificados.length === 0) {
    total.textContent = "";
    cont.innerHTML = vacio("Todavía no calificaste ningún libro.");
    return;
  }

  const valores = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
  const conteos = valores.map(v => calificados.filter(r => r.puntuacion === v).length);
  const maximo = Math.max(...conteos);
  const promedio = calificados.reduce((acc, r) => acc + r.puntuacion, 0) / calificados.length;

  total.textContent = `${calificados.length} en total`;

  const barras = valores.map((v, i) => `
    <div class="ratings__col" title="${estrellas(v)} · ${conteos[i]}">
      <div class="ratings__barra${conteos[i] ? "" : " is-cero"}"
           style="height: ${conteos[i] ? Math.max(8, (conteos[i] / maximo) * 100) : 4}%"></div>
    </div>`).join("");

  cont.innerHTML = `
    <div class="ratings">
      <div class="ratings__grafico">
        <div class="ratings__barras">${barras}</div>
        <div class="ratings__ejes"><span>★</span><span>★★★★★</span></div>
      </div>
      <div class="ratings__promedio">
        <strong>${promedio.toFixed(1)}</strong>
        <span>${estrellas(Math.round(promedio * 2) / 2)}</span>
      </div>
    </div>`;
}

function renderStats() {
  const anio = new Date().getFullYear();
  const esteAnio = datos.unicos.filter(r => new Date(marcaTiempo(r)).getFullYear() === anio).length;

  const filas = [
    ["libros", "Libros", datos.unicos.length],
    ["anio", "Este año", esteAnio],
    ["resenas", "Reseñas", datos.resenas.filter(r => r.comentario).length],
    ["listas", "Listas", 0],
    ["likes", "Likes", obtenerLikes(usuario).length + datos.likeadas.length]
  ];

  document.getElementById("perfil-stats").innerHTML = filas.map(([clave, etiqueta, valor]) => `
    <button type="button" class="stats-fila" data-vista="${clave}">
      <span>${etiqueta}</span>
      <span><strong>${valor}</strong> ›</span>
    </button>`).join("");
}

/* ---------- Render de las otras pestañas ---------- */

function renderDiario() {
  const cont = document.getElementById("perfil-diario");
  if (datos.resenas.length === 0) {
    cont.innerHTML = vacio("Tu diario está vacío.");
    return;
  }

  // El diario ordena y agrupa por la fecha en que leíste el libro
  const ordenadas = [...datos.resenas].sort((a, b) => fechaLectura(b) - fechaLectura(a));

  let mesActual = "";
  cont.innerHTML = ordenadas.map(r => {
    const f = new Date(fechaLectura(r));
    const mes = `${MESES[f.getMonth()]} ${f.getFullYear()}`;
    const encabezado = mes !== mesActual ? `<h3 class="diario-mes">${mes}</h3>` : "";
    mesActual = mes;
    return encabezado + htmlFilaResena(r, "diario");
  }).join("");
}

function renderResenas() {
  const conTexto = datos.resenas.filter(r => r.comentario);
  document.getElementById("perfil-resenas").innerHTML = conTexto.length
    ? conTexto.map(r => htmlFilaResena(r, "resena")).join("")
    : vacio("Todavía no escribiste reseñas.");
}

function renderWatchlist() {
  const lista = librosDeIds(obtenerWatchlist(usuario)).reverse();
  document.getElementById("perfil-watchlist").innerHTML = lista.length
    ? lista.map(l => htmlPoster(l)).join("")
    : vacio("Tu watchlist está vacía.");
}

// Dibuja todo con lo que hay en "datos" (no pide nada al servidor)
function renderTodo() {
  renderFavoritos();
  renderActividad();
  renderRatings();
  renderStats();
  renderDiario();
  renderResenas();
  renderWatchlist();
}

// Pide a la base de datos tus reseñas y las que le diste like, y después dibuja
async function cargarTodo() {
  try {
    const [mias, likeadas] = await Promise.all([obtenerMisResenas(), obtenerResenasLikeadas()]);
    const resenas = conLibros(mias);
    datos = { resenas, unicos: ultimaResenaPorLibro(resenas), likeadas: conLibros(likeadas) };
  } catch (error) {
    manejarError(error);
    if (error.sinSesion) return;
  }
  renderTodo();
}

/* ---------- Pestañas y vistas ---------- */

function mostrarPanel(nombre) {
  document.querySelectorAll(".perfil-panel").forEach(p =>
    p.classList.toggle("is-active", p.id === `panel-${nombre}`));
  document.querySelectorAll(".perfil-tab").forEach(t =>
    t.classList.toggle("is-active", t.dataset.tab === nombre));
  window.scrollTo(0, 0);
}

function abrirVista(clave) {
  const titulo = document.getElementById("vista-titulo");
  const cont = document.getElementById("vista-contenido");
  const anio = new Date().getFullYear();

  if (clave === "libros" || clave === "anio") {
    let lista = datos.unicos;
    if (clave === "anio") {
      lista = lista.filter(r => new Date(marcaTiempo(r)).getFullYear() === anio);
    }
    titulo.textContent = clave === "anio" ? `Libros en ${anio}` : "Libros";
    cont.innerHTML = lista.length
      ? `<div class="grid-portadas">${lista.map(r => htmlPoster(r.libro, pieEstrellas(r))).join("")}</div>`
      : vacio("Todavía no hay libros acá.");
  } else if (clave === "likes") {
    const libs = librosDeIds(obtenerLikes(usuario)).reverse();
    const resLikes = datos.likeadas;
    titulo.textContent = "Likes";

    if (libs.length === 0 && resLikes.length === 0) {
      cont.innerHTML = vacio("Todavía no le diste like a nada. Tocá el ♡ en un libro o en una reseña.");
    } else {
      cont.innerHTML =
        (libs.length
          ? `<h3 class="vista-subtitulo">Libros</h3>
             <div class="grid-portadas">${libs.map(l => htmlPoster(l)).join("")}</div>`
          : "") +
        (resLikes.length
          ? `<h3 class="vista-subtitulo">Reseñas</h3>${resLikes.map(r => htmlFilaResena(r, "like")).join("")}`
          : "");
    }
  } else if (clave === "listas") {
    titulo.textContent = "Listas";
    cont.innerHTML = vacio("Todavía no creaste listas. Esta función llega pronto.");
  }

  mostrarPanel("vista");
}

function iniciarNavegacion() {
  document.querySelectorAll(".perfil-tab").forEach(tab => {
    tab.addEventListener("click", e => {
      e.preventDefault();
      mostrarPanel(tab.dataset.tab);
    });
  });

  document.getElementById("perfil-stats").addEventListener("click", e => {
    const fila = e.target.closest("[data-vista]");
    if (!fila) return;
    if (fila.dataset.vista === "resenas") mostrarPanel("resenas");
    else abrirVista(fila.dataset.vista);
  });

  document.getElementById("vista-volver").addEventListener("click", () => mostrarPanel("perfil"));
}

/* ---------- Editar perfil (favoritos con buscador) ---------- */

let borrador = [];
let slotActivo = null;

function renderSlots() {
  document.getElementById("slots-favoritos").innerHTML = borrador.map((id, i) => {
    const libro = libros.find(l => l.id === id);
    const activo = i === slotActivo ? " is-activo" : "";
    return libro
      ? `<div class="slot${activo}" data-slot="${i}">
           <img src="${libro.portada}" alt="${escapar(libro.titulo)}">
           <button type="button" class="slot__quitar" data-quitar="${i}" aria-label="Quitar">×</button>
         </div>`
      : `<button type="button" class="slot slot--vacio${activo}" data-slot="${i}">+</button>`;
  }).join("");
}

function renderResultados(texto) {
  const cont = document.getElementById("resultados-favoritos");
  const q = normalizar(texto.trim());

  if (!q) {
    cont.innerHTML = vacio("Escribí el título o el autor.");
    return;
  }

  const encontrados = libros
    .filter(l => !borrador.includes(l.id))
    .filter(l => normalizar(`${l.titulo} ${l.autor}`).includes(q))
    .slice(0, 6);

  cont.innerHTML = encontrados.length
    ? encontrados.map(l => `
        <button type="button" class="resultado" data-id="${l.id}">
          <img src="${l.portada}" alt="">
          <span><strong>${escapar(l.titulo)}</strong><small>${escapar(l.autor)} · ${l.anio}</small></span>
        </button>`).join("")
    : vacio("No encontramos libros con esa búsqueda.");
}

function cerrarBuscador() {
  slotActivo = null;
  document.getElementById("buscador-favoritos").hidden = true;
  document.getElementById("resultados-favoritos").innerHTML = "";
}

function iniciarEdicion() {
  const dialogo = document.getElementById("dialogo-editar");
  const slots = document.getElementById("slots-favoritos");
  const buscador = document.getElementById("buscador-favoritos");
  const input = document.getElementById("input-buscar-fav");
  const resultados = document.getElementById("resultados-favoritos");

  document.getElementById("btn-editar-perfil").addEventListener("click", () => {
    const actuales = obtenerFavoritos();
    borrador = Array.from({ length: MAX_FAVORITOS }, (_, i) => actuales[i] ?? null);
    cerrarBuscador();
    renderSlots();
    dialogo.showModal();
  });

  slots.addEventListener("click", e => {
    const quitar = e.target.closest("[data-quitar]");
    if (quitar) {
      borrador[Number(quitar.dataset.quitar)] = null;
      cerrarBuscador();
      renderSlots();
      return;
    }

    const slot = e.target.closest("[data-slot]");
    if (!slot) return;

    slotActivo = Number(slot.dataset.slot);
    renderSlots();
    buscador.hidden = false;
    input.value = "";
    renderResultados("");
    input.focus();
  });

  input.addEventListener("input", () => renderResultados(input.value));

  resultados.addEventListener("click", e => {
    const fila = e.target.closest("[data-id]");
    if (!fila || slotActivo === null) return;
    borrador[slotActivo] = Number(fila.dataset.id);
    cerrarBuscador();
    renderSlots();
  });

  document.getElementById("btn-cancelar").addEventListener("click", () => dialogo.close());

  document.getElementById("btn-guardar").addEventListener("click", () => {
    guardarFavoritos(borrador.filter(Boolean));
    dialogo.close();
    renderTodo();
  });
}

/* ---------- Inicio ---------- */

document.addEventListener("DOMContentLoaded", () => {
  iniciarNavegacion();

  if (!usuario) {
    document.getElementById("perfil-nombre").textContent = "Iniciá sesión";
    document.getElementById("btn-editar-perfil").hidden = true;
    document.querySelector(".perfil-tabs").hidden = true;
    document.getElementById("panel-perfil").innerHTML =
      vacio("Iniciá sesión para ver tu perfil.") +
      `<a class="btn btn--primary" href="login.html">Iniciar sesión</a>`;
    return;
  }

  document.getElementById("perfil-nombre").textContent = usuario;
  document.getElementById("perfil-avatar").textContent = usuario.charAt(0).toUpperCase();

  iniciarEdicion();
  cargarTodo();
});
