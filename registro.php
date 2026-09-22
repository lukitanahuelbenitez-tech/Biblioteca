<?php
session_start();
require "conexion.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nombre = trim($_POST["nombre"]);
    $email = trim($_POST["email"]);
    $contrasena = $_POST["contrasena"];

    if ($nombre === "" || $email === "" || $contrasena === "") {
        die("Completá todos los campos.");
    }

    $contrasena_hash = password_hash($contrasena, PASSWORD_DEFAULT);

    $consulta = $conexion->prepare(
        "INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)"
    );
    $consulta->bind_param("sss", $nombre, $email, $contrasena_hash);

    if ($consulta->execute()) {
        $_SESSION["usuario_id"] = $consulta->insert_id;
        $_SESSION["usuario_nombre"] = $nombre;
        header("Location: catalogo.html");
        exit;
    } else {
        if ($conexion->errno === 1062) {
            die("Ese email ya está registrado.");
        }
        die("Error al registrar: " . $conexion->error);
    }

    $consulta->close();
}

$conexion->close();
