function obtenerUsuarioActual() {
  return localStorage.getItem("usuarioActual");
}

function iniciarSesion(nombre) {
  localStorage.setItem("usuarioActual", nombre.trim());
}

function cerrarSesion() {
  localStorage.removeItem("usuarioActual");
}

function actualizarBotonSesion() {
  const boton = document.getElementById("btn-sesion");
  if (!boton) return;

  const usuario = obtenerUsuarioActual();

  if (usuario) {
    boton.textContent = `Hola, ${usuario}`;
    boton.onclick = () => {
      if (confirm("¿Cerrar sesión?")) {
        cerrarSesion();
        location.reload();
      }
    };
  } else {
    boton.textContent = "Iniciar sesión";
    boton.onclick = () => {
      const nombre = prompt("¿Cómo te llamás?");
      if (nombre && nombre.trim()) {
        iniciarSesion(nombre);
        location.reload();
      }
    };
  }
}

document.addEventListener("DOMContentLoaded", actualizarBotonSesion);