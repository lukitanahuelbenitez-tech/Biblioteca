let libros = [];
let promesaLibros = null;

function cargarLibros() {
  if (!promesaLibros) {
    promesaLibros = fetch("libros_obtener.php")
      .then(async respuesta => {
        let json = null;
        try {
          json = await respuesta.json();
        } catch (e) {
        }
        if (!respuesta.ok || !json || !Array.isArray(json.libros)) {
          throw new Error((json && json.error) || "No pudimos cargar los libros.");
        }
        libros = json.libros;
        return libros;
      });

    // Si falló, permitimos volver a intentarlo la próxima vez
    promesaLibros.catch(() => { promesaLibros = null; });
  }
  return promesaLibros;
}


