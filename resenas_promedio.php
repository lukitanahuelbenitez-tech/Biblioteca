<?php
require "api_util.php";

// Promedio y cantidad de calificaciones de cada libro
$resultado = $conexion->query(
    "SELECT id_libro, ROUND(AVG(puntuacion), 1) AS promedio, COUNT(*) AS total
     FROM resenas
     GROUP BY id_libro"
);

$libros = [];
foreach ($resultado->fetch_all(MYSQLI_ASSOC) as $f) {
    $libros[(int) $f["id_libro"]] = [
        "promedio" => (float) $f["promedio"],
        "total" => (int) $f["total"]
    ];
}
responder(["libros" => (object) $libros]);
