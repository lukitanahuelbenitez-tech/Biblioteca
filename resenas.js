function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function textoEstrellas(puntuacion) {
  return "★".repeat(Math.floor(puntuacion)) + (puntuacion % 1 ? "½" : "");
}

/* ---------- Reseñas ---------- */

function obtenerResenas(idLibro) {
  const todas = JSON.parse(localStorage.getItem("resenas")) || {};
  return todas[idLibro] || [];
}

// inicio y fin: fechas "AAAA-MM-DD"
function guardarResena(idLibro, usuario, puntuacion, comentario, inicio = null, fin = null) {
  const todas = JSON.parse(localStorage.getItem("resenas")) || {};
  if (!todas[idLibro]) todas[idLibro] = [];

  todas[idLibro].push({
    usuario,
    puntuacion: Number(puntuacion),
    comentario,
    inicio,
    fin,
    fecha: new Date().toLocaleDateString("es-AR"),
    ts: Date.now()
  });

  localStorage.setItem("resenas", JSON.stringify(todas));
}

function calcularPromedio(idLibro) {
  const resenas = obtenerResenas(idLibro);
  if (resenas.length === 0) return null;
  const suma = resenas.reduce((acc, r) => acc + r.puntuacion, 0);
  return (suma / resenas.length).toFixed(1);
}

function calcularDistribucion(idLibro) {
  const resenas = obtenerResenas(idLibro);
  const distribucion = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(valor => ({
    valor,
    conteo: 0
  }));

  resenas.forEach(r => {
    const item = distribucion.find(d => d.valor === r.puntuacion);
    if (item) item.conteo++;
  });

  return distribucion;
}

/* ---------- Fechas de lectura ---------- */

const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun",
                      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function formatearDia(iso, conAnio) {
  const [a, m, d] = iso.split("-").map(Number);
  return `${d} ${MESES_CORTOS[m - 1]}${conAnio ? " " + a : ""}`;
}

function formatearRango(r) {
  const anioActual = new Date().getFullYear();
  const anioDe = iso => Number(iso.slice(0, 4));

  if (r.inicio && r.fin && r.inicio !== r.fin) {
    const mismoAnio = anioDe(r.inicio) === anioDe(r.fin);
    const mostrarAnioFin = !mismoAnio || anioDe(r.fin) !== anioActual;
    return `${formatearDia(r.inicio, !mismoAnio)} - ${formatearDia(r.fin, mostrarAnioFin)}`;
  }
  if (r.inicio && !r.fin) {
    return `Desde ${formatearDia(r.inicio, anioDe(r.inicio) !== anioActual)}`;
  }
  const unico = r.fin || r.inicio;
  if (unico) return formatearDia(unico, anioDe(unico) !== anioActual);
  return r.fecha;
}

// Fecha que usa el diario para ordenar y agrupar por mes
function fechaLectura(r) {
  const iso = r.fin || r.inicio;
  if (iso) return new Date(`${iso}T12:00:00`).getTime();
  if (r.ts) return r.ts;
  const [d, m, a] = r.fecha.split("/").map(Number);
  return new Date(a, m - 1, d).getTime();
}

/* ---------- Likes de libros y watchlist ---------- */

function obtenerLista(clave, usuario) {
  return JSON.parse(localStorage.getItem(`${clave}_${usuario}`)) || [];
}

function alternarEnLista(clave, usuario, idLibro) {
  let lista = obtenerLista(clave, usuario);
  lista = lista.includes(idLibro)
    ? lista.filter(i => i !== idLibro)
    : [...lista, idLibro];
  localStorage.setItem(`${clave}_${usuario}`, JSON.stringify(lista));
  return lista.includes(idLibro);
}

function obtenerLikes(usuario) { return obtenerLista("likes", usuario); }
function tieneLike(usuario, idLibro) { return obtenerLikes(usuario).includes(idLibro); }
function alternarLike(usuario, idLibro) { return alternarEnLista("likes", usuario, idLibro); }

function obtenerWatchlist(usuario) { return obtenerLista("watchlist", usuario); }
function tieneWatchlist(usuario, idLibro) { return obtenerWatchlist(usuario).includes(idLibro); }
function alternarWatchlist(usuario, idLibro) { return alternarEnLista("watchlist", usuario, idLibro); }

/* ---------- Likes de reseñas ---------- */

function idResena(idLibro, n) {
  return `${idLibro}:${n}`;
}

function obtenerLikesResena(id) {
  const todos = JSON.parse(localStorage.getItem("likes_resenas")) || {};
  return todos[id] || [];
}

function alternarLikeResena(id, usuario) {
  const todos = JSON.parse(localStorage.getItem("likes_resenas")) || {};
  const usuarios = todos[id] || [];
  todos[id] = usuarios.includes(usuario)
    ? usuarios.filter(u => u !== usuario)
    : [...usuarios, usuario];
  localStorage.setItem("likes_resenas", JSON.stringify(todos));
  return todos[id].includes(usuario);
}

function obtenerResenasLikeadas(usuario) {
  const todos = JSON.parse(localStorage.getItem("likes_resenas")) || {};
  return Object.keys(todos)
    .filter(id => todos[id].includes(usuario))
    .map(id => {
      const [libroId, n] = id.split(":").map(Number);
      return { libroId, n };
    });
}