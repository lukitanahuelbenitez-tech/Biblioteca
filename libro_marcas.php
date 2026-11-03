<?php
require "api_util.php";

// Devuelve los libros que el usuario logueado marcó con "Me gusta" y los de su watchlist, del más viejo al más nuevo.
$yo = (int) ($_SESSION["usuario_id"] ?? 0);

$salida = ["likes" => [], "watchlist" => []];

if ($yo > 0) {
    $tablas = [
        "likes" => "likes_libros",
        "watchlist" => "watchlist_libros"
    ];

    foreach ($tablas as $clave => $tabla) {
        $consulta = $conexion->prepare("SELECT id_libro FROM $tabla WHERE id_usuario = ? ORDER BY id");
        $consulta->bind_param("i", $yo);
        $consulta->execute();
        $filas = $consulta->get_result()->fetch_all(MYSQLI_ASSOC);
        $salida[$clave] = array_map("intval", array_column($filas, "id_libro"));
    }
}

responder($salida);

