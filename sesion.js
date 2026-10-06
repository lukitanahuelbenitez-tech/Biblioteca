function obtenerUsuarioActual() {
  return localStorage.getItem("usuarioActual");
}

function iniciarSesion(nombre) {
  localStorage.setItem("usuarioActual", nombre.trim());
}

function cerrarSesion() {
  localStorage.removeItem("usuarioActual");
  return fetch("logout.php").catch(() => {});
}

function actualizarBotonSesion() {
  const boton = document.getElementById("btn-sesion");
  if (!boton) return;

  const usuario = obtenerUsuarioActual();

  if (usuario) {
    boton.textContent = `Hola, ${usuario}`;
    boton.onclick = () => {
      if (confirm("¿Cerrar sesión?")) {
        cerrarSesion().then(() => location.reload());
      }
    };
  } else {
    boton.textContent = "Iniciar sesión";
    boton.onclick = () => {
      location.href = "login.html";
    };
  }
}

document.addEventListener("DOMContentLoaded", actualizarBotonSesion);