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

function hoyISO() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function htmlResenaCard(r) {
  const likes = obtenerLikesResena(idResena(libro.id, r.n)).length;
  return `
    <a class="resena-card" href="resena.html?libro=${libro.id}&n=${r.n}">
      <div class="resena-card__cabecera">
        <span class="avatar">${escapar(r.usuario.charAt(0).toUpperCase())}</span>
        <div class="resena-card__quien">
          <strong>${escapar(r.usuario)}</strong>
          <span class="resena-card__estrellas">${textoEstrellas(r.puntuacion)}</span>
        </div>
        <span class="resena-card__fecha">${escapar(formatearRango(r))}</span>
      </div>
      <p class="resena-card__texto">${escapar(r.comentario)}</p>
      <span class="resena-card__pie">♥ ${likes}</span>
    </a>`;
}

function renderFicha() {
  const usuarioActual = obtenerUsuarioActual();
  const meGusta = usuarioActual ? tieneLike(usuarioActual, libro.id) : false;
  const enWatchlist = usuarioActual ? tieneWatchlist(usuarioActual, libro.id) : false;

  const calificaciones = obtenerResenas(libro.id);
  const total = calificaciones.length;
  const promedio = calcularPromedio(libro.id);
  const distribucion = calcularDistribucion(libro.id);
  const maxConteo = Math.max(1, ...distribucion.map(d => d.conteo));

  const estrellasLlenas = promedio ? Math.round(promedio) : 0;
  const estrellas = "★".repeat(estrellasLlenas) + "☆".repeat(5 - estrellasLlenas);
  const etiquetaTotal = `${total} calificación${total === 1 ? "" : "es"}`;
  const textoRating = promedio
    ? `${estrellas} <span>(${promedio}/5 · ${etiquetaTotal})</span>`
    : `<span class="ficha-hero__sin-resenas">Sin calificaciones todavía</span>`;

  const barrasHTML = distribucion.map(({ valor, conteo }) => `
    <div class="distribucion__barra-wrap" title="${valor} ★ · ${conteo}">
      <div class="distribucion__barra" style="height: ${(conteo / maxConteo) * 100}%"></div>
    </div>
  `).join("");

  const etiquetasHTML = distribucion.map(({ valor }) => `<span>${valor}</span>`).join("");

  // Solo las que tienen texto, de la más nueva a la más vieja (n = posición original)
  const conTexto = calificaciones
    .map((r, n) => ({ ...r, n }))
    .filter(r => r.comentario)
    .reverse();

  const listaResenas = conTexto.length === 0
    ? `<p class="resenas__vacio">Todavía no hay reseñas escritas. ¡Sé el primero en dejar una!</p>`
    : conTexto.map(htmlResenaCard).join("");

  const panelLog = usuarioActual ? `
    <dialog class="panel-log" id="panel-log">
      <form id="form-log">
        <div class="panel-log__cabecera">
          <img class="panel-log__portada" src="${libro.portada}" alt="">
          <div>
            <h2>${escapar(libro.titulo)}</h2>
            <p>${escapar(libro.autor)} · ${libro.anio}</p>
            <p class="panel-log__usuario">Como <strong>${escapar(usuarioActual)}</strong></p>
          </div>
          <button type="button" class="panel-log__cerrar" id="log-cerrar" aria-label="Cerrar">×</button>
        </div>

        <div class="panel-log__fechas">
          <label>Empecé a leerlo
            <input type="date" id="log-inicio" max="${hoyISO()}">
          </label>
          <label>Lo terminé
            <input type="date" id="log-fin" max="${hoyISO()}">
          </label>
        </div>

        <div class="panel-log__rating">
          <span>Tu calificación</span>
          <div class="rating-picker" id="rating-picker">
            <div class="rating-picker__vacias">☆☆☆☆☆</div>
            <div class="rating-picker__llenas" id="rating-llenas">★★★★★</div>
            <div class="rating-picker__click-zonas">
              ${[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(v =>
                `<button type="button" class="rating-picker__zona" data-valor="${v}"></button>`
              ).join("")}
            </div>
          </div>
          <input type="hidden" id="input-puntuacion">
        </div>

        <textarea id="input-comentario" class="panel-log__texto" rows="8"
          placeholder="Escribí tu reseña... corta, larga o como crítico. (Opcional)"></textarea>

        <div class="panel-log__acciones">
          <button type="button" class="btn btn--outline" id="log-cancelar">Cancelar</button>
          <button type="submit" class="btn btn--primary">Guardar</button>
        </div>
      </form>
    </dialog>
  ` : "";

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
          <div class="ficha-hero__acciones">
            <button type="button" class="btn-accion${meGusta ? " is-activo" : ""}" id="btn-like">${meGusta ? "♥ Te gusta" : "♡ Me gusta"}</button>
            <button type="button" class="btn-accion${enWatchlist ? " is-activo" : ""}" id="btn-watchlist">${enWatchlist ? "✓ En tu watchlist" : "+ Watchlist"}</button>
            <button type="button" class="btn-accion btn-accion--primario" id="btn-log">✎ Reseñar o registrar</button>
          </div>
        </div>
      </div>
    </section>

    <section class="ficha-cuerpo ficha-cuerpo--simple">
      <div class="ficha-cuerpo__col">
        <h2>Sinopsis</h2>
        <p>${libro.sinopsis}</p>

        <h2 class="resenas__titulo">Calificaciones</h2>
        <div class="ratings ratings--ficha">
          <div class="ratings__grafico">
            <div class="distribucion">${barrasHTML}</div>
            <div class="distribucion__etiquetas">${etiquetasHTML}</div>
          </div>
          <div class="ratings__promedio">
            <strong>${promedio || "–"}</strong>
            <span>${promedio ? textoEstrellas(Math.round(promedio * 2) / 2) : ""}</span>
            <small>${etiquetaTotal}</small>
          </div>
        </div>

        <h2 class="resenas__titulo">Reseñas</h2>
        <div class="resenas__lista">${listaResenas}</div>
      </div>
    </section>

    ${panelLog}
  `;

  conectarAcciones();
  if (usuarioActual) inicializarPanelLog(usuarioActual);
}

function inicializarPanelLog(usuarioActual) {
  const panel = document.getElementById("panel-log");

  inicializarRatingPicker();

  document.getElementById("log-cerrar").addEventListener("click", () => panel.close());
  document.getElementById("log-cancelar").addEventListener("click", () => panel.close());

  document.getElementById("form-log").addEventListener("submit", (e) => {
    e.preventDefault();
    const puntuacion = document.getElementById("input-puntuacion").value;
    const comentario = document.getElementById("input-comentario").value.trim();
    const inicio = document.getElementById("log-inicio").value;
    const fin = document.getElementById("log-fin").value;

    if (!puntuacion) {
      alert("Elegí una calificación tocando las estrellas.");
      return;
    }
    if (inicio && fin && fin < inicio) {
      alert("La fecha en que lo terminaste no puede ser anterior a la de inicio.");
      return;
    }

    guardarResena(libro.id, usuarioActual, puntuacion, comentario, inicio || null, fin || null);
    renderFicha();
  });
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

function conectarAcciones() {
  const usuario = obtenerUsuarioActual();
  const btnLike = document.getElementById("btn-like");
  const btnWatchlist = document.getElementById("btn-watchlist");
  const btnLog = document.getElementById("btn-log");

  btnLike.addEventListener("click", () => {
    if (!usuario) {
      location.href = "login.html";
      return;
    }
    const activo = alternarLike(usuario, libro.id);
    btnLike.classList.toggle("is-activo", activo);
    btnLike.textContent = activo ? "♥ Te gusta" : "♡ Me gusta";
  });

  btnWatchlist.addEventListener("click", () => {
    if (!usuario) {
      location.href = "login.html";
      return;
    }
    const activo = alternarWatchlist(usuario, libro.id);
    btnWatchlist.classList.toggle("is-activo", activo);
    btnWatchlist.textContent = activo ? "✓ En tu watchlist" : "+ Watchlist";
  });

  btnLog.addEventListener("click", () => {
    if (!usuario) {
      location.href = "login.html";
      return;
    }
    document.getElementById("panel-log").showModal();
  });
}
