<?php
$servidor = "localhost";
$usuario_db = "root";
$contrasena_db = "";
$nombre_db = "entrelibros";

$conexion = new mysqli($servidor, $usuario_db, $contrasena_db, $nombre_db);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$conexion->set_charset("utf8mb4");