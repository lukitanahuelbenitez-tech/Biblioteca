<?php
session_start();
require "conexion.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST["email"]);
    $contrasena = $_POST["contrasena"];

    $consulta = $conexion->prepare("SELECT id, nombre, contrasena FROM usuarios WHERE email = ?");
    $consulta->bind_param("s", $email);
    $consulta->execute();
    $resultado = $consulta->get_result();
    $usuario = $resultado->fetch_assoc();

    if ($usuario && password_verify($contrasena, $usuario["contrasena"])) {
        $_SESSION["usuario_id"] = $usuario["id"];
        $_SESSION["usuario_nombre"] = $usuario["nombre"];
        header("Location: catalogo.html");
        exit;
    } else {
        die("Email o contraseña incorrectos.");
    }

    $consulta->close();
}

$conexion->close();
