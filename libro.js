const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));
const libro = libros.find(l => l.id === id);
const root = document.getElementById("ficha-root");

if (!libro) {
  root.innerHTML = `
    <section class="ficha-error">
      <h1>No encontramos ese libro</h1>
      <p>Puede que el enlace esté roto o el libro ya no exista en el catálogo.</p>
      <a href="catalogo.html" class="btn btn--primary">Volver al catálogo</a>
    </section>
  `;
} else {
  document.title = `${libro.titulo} | EntreLibros`;
  renderFicha();
}

function renderFicha() {
  const resenas = obtenerResenas(libro.id);
  const promedio = calcularPromedio(libro.id);

  const estrellasLlenas = promedio ? Math.round(promedio) : 0;
  const estrellas = "★".repeat(estrellasLlenas) + "☆".repeat(5 - estrellasLlenas);
  const textoRating = promedio
    ? `${estrellas} <span>(${promedio}/5 · ${resenas.length} reseña${resenas.length === 1 ? "" : "s"})</span>`
    : `<span class="ficha-hero__sin-resenas">Sin calificaciones todavía</span>`;

  const listaResenas = resenas.length === 0
    ? `<p class="resenas__vacio">Todavía no hay reseñas. ¡Sé el primero en dejar una!</p>`
    : resenas.map(r => `
        <div class="resena">
          <div class="resena__cabecera">
            <strong>${r.usuario}</strong>
            <span class="resena__puntuacion">★ ${r.puntuacion}</span>
          </div>
          <p class="resena__comentario">${r.comentario}</p>
          <span class="resena__fecha">${r.fecha}</span>
        </div>
      `).join("");

  root.innerHTML = `
    <section class="ficha-hero" style="--backdrop: url('${libro.portada}')">
      <div class="ficha-hero__scrim"></div>
      <div class="ficha-hero__content">
        <img src="${libro.portada}" alt="Portada de ${libro.titulo}" class="ficha-hero__portada">
        <div class="ficha-hero__datos">
          <a href="catalogo.html" class="ficha__volver">&larr; Volver al catálogo</a>
          <h1>${libro.titulo}</h1>
          <p class="ficha-hero__autor">${libro.autor} · ${libro.anio}</p>
          <div class="ficha-hero__estrellas">${textoRating}</div>
          <div class="ficha-hero__tags">
            <span class="tag">${libro.genero}</span>
            <span class="tag">${libro.paginas} páginas</span>
          </div>
        </div>
      </div>
    </section>

    <section class="ficha-cuerpo">
      <div class="ficha-cuerpo__col">
        <h2>Sinopsis</h2>
        <p>${libro.sinopsis}</p>

        <h2 class="resenas__titulo">Reseñas</h2>
        <div class="resenas__lista">${listaResenas}</div>
      </div>

      <aside class="ficha-cuerpo__dato">
        <h3>Dejá tu reseña</h3>
        <form id="form-resena" class="form-resena">
          <input type="text" id="input-usuario" placeholder="Tu nombre" required>
          <select id="input-puntuacion" required>
            <option value="">Puntuación</option>
            <option value="5">★★★★★ (5)</option>
            <option value="4">★★★★ (4)</option>
            <option value="3">★★★ (3)</option>
            <option value="2">★★ (2)</option>
            <option value="1">★ (1)</option>
          </select>
          <textarea id="input-comentario" placeholder="¿Qué te pareció?" required></textarea>
          <button type="submit" class="btn btn--primary">Publicar reseña</button>
        </form>
      </aside>
    </section>
  `;

  document.getElementById("form-resena").addEventListener("submit", (e) => {
    e.preventDefault();
    const usuario = document.getElementById("input-usuario").value.trim();
    const puntuacion = document.getElementById("input-puntuacion").value;
    const comentario = document.getElementById("input-comentario").value.trim();

    guardarResena(libro.id, usuario, puntuacion, comentario);
    renderFicha(); // vuelve a dibujar la ficha con la reseña nueva ya incluida
  });
}