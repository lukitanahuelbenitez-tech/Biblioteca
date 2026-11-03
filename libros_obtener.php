<?php
require "api_util.php";

function normalizar_nombre($texto) {
    $texto = mb_strtolower($texto, "UTF-8");
    return strtr($texto, [
        "á" => "a", "é" => "e", "í" => "i", "ó" => "o", "ú" => "u", "ü" => "u", "ñ" => "n"
    ]);
}

function campo($fila, $nombres, $defecto = "") {
    foreach ($nombres as $nombre) {
        if (array_key_exists($nombre, $fila) && $fila[$nombre] !== null && $fila[$nombre] !== "") {
            return $fila[$nombre];
        }
    }
    return $defecto;
}

function mapear_libro($original) {

    $f = [];
    foreach ($original as $clave => $valor) {
        $f[normalizar_nombre($clave)] = $valor;
    }

    $portada = (string) campo($f, ["portada", "imagen", "img", "foto", "url_imagen", "imagen_portada", "cover"]);
    // Si en la base solo está el nombre del archivo, lo buscamos en la carpeta img/
    if ($portada !== "" && strpos($portada, "/") === false) {
        $portada = "img/" . $portada;
    }

    $anio = campo($f, ["anio", "ano", "anio_publicacion", "ano_publicacion", "fecha_publicacion", "year", "publicacion"], 0);
    if (preg_match('/\d{4}/', (string) $anio, $m)) {
        $anio = (int) $m[0];
    } else {
        $anio = 0;
    }

    return [
        "id" => (int) campo($f, ["id_libro", "idlibro", "libro_id", "id"], 0),
        "titulo" => (string) campo($f, ["titulo", "title", "nombre", "nombre_libro"]),
        "autor" => (string) campo($f, ["autor", "author", "escritor"]),
        "genero" => (string) campo($f, ["genero", "categoria"]),
        "anio" => $anio,
        "paginas" => (int) campo($f, ["paginas", "cantidad_paginas", "nro_paginas", "num_paginas", "pages"], 0),
        "portada" => $portada,
        "sinopsis" => (string) campo($f, ["sinopsis", "descripcion", "resumen", "descripcion_libro"])
    ];
}

$resultado = $conexion->query("SELECT * FROM libros");
$filas = $resultado->fetch_all(MYSQLI_ASSOC);


if (isset($_GET["debug"])) {
    responder([
        "columnas_de_la_tabla" => $filas ? array_keys($filas[0]) : [],
        "primera_fila_original" => $filas ? $filas[0] : null,
        "primera_fila_interpretada" => $filas ? mapear_libro($filas[0]) : null,
        "total_filas" => count($filas)
    ]);
}

$libros = array_map("mapear_libro", $filas);

usort($libros, function ($a, $b) {
    return $a["id"] <=> $b["id"];
});

responder(["libros" => $libros]);

