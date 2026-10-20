const params = new URLSearchParams(window.location.search);
const idLibro = Number(params.get("libro"));
const n = Number(params.get("n"));
const libro = libros.find(l => l.id === idLibro);
const resena = obtenerResenas(idLibro)[n];
const raiz = document.getElementById("resena-root");

if (!libro || !resena) {
  raiz.innerHTML = `
    <section class="ficha-error">
      <h1>No encontramos esa reseña</h1>
      <p>Puede que el enlace esté roto.</p>
      <a href="catalogo.html" class="btn btn--primary">Volver al catálogo</a>
    </section>
  `;
} else {
  document.title = `Reseña de ${resena.usuario} sobre ${libro.titulo} | EntreLibros`;
  renderResena();
}

function renderResena() {
  const usuarioActual = obtenerUsuarioActual();
  const likes = obtenerLikesResena(idResena(idLibro, n));
  const leGusta = usuarioActual ? likes.includes(usuarioActual) : false;
  const urlLibro = `libro.html?id=${libro.id}`;

  raiz.innerHTML = `
    <a class="resena-pagina__volver" href="${urlLibro}">‹ ${escapar(libro.titulo)}</a>

    <article class="resena-completa">
      <header class="resena-completa__cabecera">
        <a href="${urlLibro}">
          <img class="resena-completa__portada" src="${libro.portada}" alt="Portada de ${escapar(libro.titulo)}">
        </a>
        <div>
          <p class="resena-completa__autor">
            <span class="avatar">${escapar(resena.usuario.charAt(0).toUpperCase())}</span>
            Reseña de <strong>${escapar(resena.usuario)}</strong>
          </p>
          <h1><a href="${urlLibro}">${escapar(libro.titulo)}</a> <small>${libro.anio}</small></h1>
          <p class="resena-completa__estrellas">${textoEstrellas(resena.puntuacion)}</p>
          <p class="resena-completa__fecha">${escapar(formatearRango(resena))}</p>
        </div>
      </header>

      ${resena.comentario
        ? `<div class="resena-completa__texto">${escapar(resena.comentario)}</div>`
        : `<p class="perfil-vacio">Esta calificación no tiene reseña escrita.</p>`}

      <div class="resena-completa__acciones">
        <button type="button" class="btn-accion${leGusta ? " is-activo" : ""}" id="btn-like-resena">
          ${leGusta ? "♥ Te gusta" : "♡ Me gusta"}
        </button>
        <span class="resena-completa__likes">${likes.length} like${likes.length === 1 ? "" : "s"}</span>
      </div>
    </article>
  `;

  document.getElementById("btn-like-resena").addEventListener("click", () => {
    if (!usuarioActual) {
      location.href = "login.html";
      return;
    }
    alternarLikeResena(idResena(idLibro, n), usuarioActual);
    renderResena();
  });
}
