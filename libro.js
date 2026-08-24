


const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));


const libro = libros.find(l => l.id === id);


const root = document.getElementById("ficha-root");

if (!libro) {
http://127.0.0.1:3000/catalogo.html  root.innerHTML = `
    <section class="ficha-error">
      <h1>No encontramos ese libro</h1>
      <p>Puede que el enlace esté roto o el libro ya no exista en el catálogo.</p>
      <a href="catalogo.html" class="btn btn--primary">Volver al catálogo</a>
    </section>
  `;
} else {
  document.title = `${libro.titulo} | EntreLibros`;

  const estrellasLlenas = Math.round(libro.rating);
  const estrellas = "★".repeat(estrellasLlenas) + "☆".repeat(5 - estrellasLlenas);

  root.innerHTML = `
    <section class="ficha-hero" style="--backdrop: url('${libro.portada}')">
      <div class="ficha-hero__scrim"></div>
      <div class="ficha-hero__content">
        <img src="${libro.portada}" alt="Portada de ${libro.titulo}" class="ficha-hero__portada">
        <div class="ficha-hero__datos">
          <a href="catalogo.html" class="ficha__volver">&larr; Volver al catálogo</a>
          <h1>${libro.titulo}</h1>
          <p class="ficha-hero__autor">${libro.autor} · ${libro.anio}</p>
          <div class="ficha-hero__estrellas">${estrellas} <span>(${libro.rating}/5)</span></div>
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
      </div>
      <aside class="ficha-cuerpo__dato">
        <h3>Dato curioso</h3>
        <p>${libro.dato}</p>
      </aside>
    </section>
  `;
}