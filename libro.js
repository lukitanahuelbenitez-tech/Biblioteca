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
  const distribucion = calcularDistribucion(libro.id);
  const maxConteo = Math.max(1, ...distribucion.map(d => d.conteo));
  const usuarioActual = obtenerUsuarioActual();

  const estrellasLlenas = promedio ? Math.round(promedio) : 0;
  const estrellas = "★".repeat(estrellasLlenas) + "☆".repeat(5 - estrellasLlenas);
  const textoRating = promedio
    ? `${estrellas} <span>(${promedio}/5 · ${resenas.length} reseña${resenas.length === 1 ? "" : "s"})</span>`
    : `<span class="ficha-hero__sin-resenas">Sin calificaciones todavía</span>`;

  const barrasHTML = distribucion.map(({ valor, conteo }) => `
    <div class="distribucion__barra-wrap" title="${valor} ★ · ${conteo}">
      <div class="distribucion__barra" style="height: ${(conteo / maxConteo) * 100}%"></div>
    </div>
  `).join("");

  const etiquetasHTML = distribucion.map(({ valor }) => `<span>${valor}</span>`).join("");

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

  const formularioHTML = usuarioActual
    ? `
      <p class="form-resena__usuario">Publicando como <strong>${usuarioActual}</strong></p>
      <form id="form-resena" class="form-resena">
        <div class="rating-picker" id="rating-picker">
          <div class="rating-picker__vacias">☆☆☆☆☆</div>
          <div class="rating-picker__llenas" id="rating-llenas">★★★★★</div>
          <div class="rating-picker__click-zonas">
            ${[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(v =>
              `<button type="button" class="rating-picker__zona" data-valor="${v}"></button>`
            ).join("")}
          </div>
        </div>
        <input type="hidden" id="input-puntuacion" required>
        <textarea id="input-comentario" placeholder="¿Qué te pareció?" required></textarea>
        <button type="submit" class="btn btn--primary">Publicar reseña</button>
      </form>
    `
    : `
      <p class="form-resena__usuario">Iniciá sesión para dejar tu reseña.</p>
      <button type="button" class="btn btn--primary" id="btn-login-resena">Iniciar sesión</button>
    `;

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
        <h2 class="resenas__titulo">Distribución de calificaciones</h2>
        <div class="distribucion">${barrasHTML}</div>
        <div class="distribucion__etiquetas">${etiquetasHTML}</div>

        <h2 class="resenas__titulo">Reseñas</h2>
        <div class="resenas__lista">${listaResenas}</div>
      </div>

      <aside class="ficha-cuerpo__dato">
        <h3>Dejá tu reseña</h3>
        ${formularioHTML}
      </aside>
    </section>
  `;

  if (usuarioActual) {
    inicializarRatingPicker();

    document.getElementById("form-resena").addEventListener("submit", (e) => {
      e.preventDefault();
      const puntuacion = document.getElementById("input-puntuacion").value;
      const comentario = document.getElementById("input-comentario").value.trim();

      if (!puntuacion) {
        alert("Elegí una puntuación haciendo click en las estrellas.");
        return;
      }

      guardarResena(libro.id, usuarioActual, puntuacion, comentario);
      renderFicha();
    });
  } else {
    document.getElementById("btn-login-resena").addEventListener("click", () => {
      const nombre = prompt("¿Cómo te llamás?");
      if (nombre && nombre.trim()) {
        iniciarSesion(nombre);
        renderFicha();
        actualizarBotonSesion();
      }
    });
  }
}

function inicializarRatingPicker() {
  const zonas = document.querySelectorAll(".rating-picker__zona");
  const llenas = document.getElementById("rating-llenas");
  const inputPuntuacion = document.getElementById("input-puntuacion");

  function pintar(valor) {
    llenas.style.width = (valor / 5 * 100) + "%";
  }

  zonas.forEach(zona => {
    const valor = Number(zona.dataset.valor);
    zona.addEventListener("mouseenter", () => pintar(valor));
    zona.addEventListener("click", () => {
      inputPuntuacion.value = valor;
      pintar(valor);
    });
  });

  document.getElementById("rating-picker").addEventListener("mouseleave", () => {
    pintar(Number(inputPuntuacion.value) || 0);
  });
}