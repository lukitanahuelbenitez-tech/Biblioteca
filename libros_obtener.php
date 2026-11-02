<?php
require "api_util.php";

function campo($fila, $nombres, $defecto = "") {
    foreach ($nombres as $nombre) {
        if (array_key_exists($nombre, $fila) && $fila[$nombre] !== null) {
            return $fila[$nombre];
        }
    }
    return $defecto;
}

$resultado = $conexion->query("SELECT * FROM libros");
$filas = $resultado->fetch_all(MYSQLI_ASSOC);

$libros = [];
foreach ($filas as $f) {
    $libros[] = [
        "id" => (int) campo($f, ["id_libro", "id"], 0),
        "titulo" => (string) campo($f, ["titulo", "title", "nombre"]),
        "autor" => (string) campo($f, ["autor", "author"]),
        "genero" => (string) campo($f, ["genero", "género"]),
        "anio" => (int) campo($f, ["anio", "año", "ano", "anio_publicacion"], 0),
        "paginas" => (int) campo($f, ["paginas", "páginas", "cantidad_paginas"], 0),
        "portada" => (string) campo($f, ["portada", "imagen", "img"]),
        "sinopsis" => (string) campo($f, ["sinopsis", "descripcion", "resumen"])
    ];
}

usort($libros, function ($a, $b) {
    return $a["id"] <=> $b["id"];
});

responder(["libros" => $libros]);
