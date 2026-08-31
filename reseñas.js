function obtenerResenas(idLibro) {
  const todas = JSON.parse(localStorage.getItem("resenas")) || {};
  return todas[idLibro] || [];
}

function guardarResena(idLibro, usuario, puntuacion, comentario) {
  const todas = JSON.parse(localStorage.getItem("resenas")) || {};
  if (!todas[idLibro]) todas[idLibro] = [];

  todas[idLibro].push({
    usuario,
    puntuacion: Number(puntuacion),
    comentario,
    fecha: new Date().toLocaleDateString("es-AR")
  });

  localStorage.setItem("resenas", JSON.stringify(todas));
}

function calcularPromedio(idLibro) {
  const resenas = obtenerResenas(idLibro);
  if (resenas.length === 0) return null;
  const suma = resenas.reduce((acc, r) => acc + r.puntuacion, 0);
  return (suma / resenas.length).toFixed(1);
}