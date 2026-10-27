/* ---------- Utilidades compartidas ---------- */

function escapar(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function textoEstrellas(puntuacion) {
  return "★".repeat(Math.floor(puntuacion)) + (puntuacion % 1 ? "½" : "");
}

/* ---------- Comunicación con el servidor ---------- */

// Hace el pedido y devuelve el JSON. Si el servidor responde con error, lanza una excepción.
async function pedir(ruta, datos = null) {
  const opciones = datos ? { method: "POST", body: new URLSearchParams(datos) } : {};
  const respuesta = await fetch(ruta, opciones);

  let json = null;
  try {
    json = await respuesta.json();
  } catch (e) {
  }

  if (respuesta.status === 401) {
    localStorage.removeItem("usuarioActual");
    const error = new Error((json && json.error) || "Tenés que iniciar sesión.");
    error.sinSesion = true;
    throw error;
  }
  if (!respuesta.ok) {
    throw new Error((json && json.error) || "Ocurrió un error. Probá de nuevo.");
  }
  return json;
}

function manejarError(error) {
  if (error.sinSesion) {
    alert("Tu sesión venció. Iniciá sesión de nuevo.");
    location.href = "login.html";
  } else {
    alert(error.message);
  }
}

async function obtenerResenasLibro(idLibro) {
  return (await pedir(`resenas_obtener.php?libro=${idLibro}`)).resenas;
}

async function obtenerResena(id) {
  const lista = (await pedir(`resenas_obtener.php?id=${id}`)).resenas;
  return lista[0] || null;
}

async function obtenerMisResenas() {
  return (await pedir("resenas_obtener.php?mias=1")).resenas;
}

async function obtenerResenasLikeadas() {
  return (await pedir("resenas_obtener.php?likeadas=1")).resenas;
}

async function obtenerPromedios() {
  return (await pedir("resenas_promedios.php")).libros;
}


function guardarResena(idLibro, puntuacion, comentario, inicio, fin) {
  return pedir("resena_guardar.php", {
    libro: idLibro,
    puntuacion,
    comentario,
    inicio: inicio || "",
    fin: fin || ""
  });
}

// Devuelve { le_gusta, likes }
function alternarLikeResena(id) {
  return pedir("resena_like.php", { id });
}

function calcularPromedio(lista) {
  if (lista.length === 0) return null;
  const suma = lista.reduce((acc, r) => acc + r.puntuacion, 0);
  return (suma / lista.length).toFixed(1);
}

function calcularDistribucion(lista) {
  const distribucion = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(valor => ({
    valor,
    conteo: 0
  }));

  lista.forEach(r => {
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
  return new Date(r.ts).toLocaleDateString("es-AR");
}

// Fecha que usa el diario para ordenar y agrupar por mes
function fechaLectura(r) {
  const iso = r.fin || r.inicio;
  if (iso) return new Date(`${iso}T12:00:00`).getTime();
  return r.ts;
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

