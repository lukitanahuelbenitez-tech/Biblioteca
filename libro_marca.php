<?php
require "api_util.php";
exigir_post();
$id_usuario = exigir_sesion();

$tablas = [
    "like" => "likes_libros",
    "watchlist" => "watchlist_libros"
];

$id_libro = (int) ($_POST["libro"] ?? 0);
$tipo = $_POST["tipo"] ?? "";

if ($id_libro <= 0) {
    responder(["error" => "Libro inválido."], 400);
}
if (!isset($tablas[$tipo])) {
    responder(["error" => "Acción inválida."], 400);
}
$tabla = $tablas[$tipo]; 

// Si ya estaba marcado, lo sacamos; si no, lo agregamos
$borrar = $conexion->prepare("DELETE FROM $tabla WHERE id_usuario = ? AND id_libro = ?");
$borrar->bind_param("ii", $id_usuario, $id_libro);
$borrar->execute();

if ($borrar->affected_rows > 0) {
    responder(["activo" => false]);
}

$agregar = $conexion->prepare("INSERT IGNORE INTO $tabla (id_usuario, id_libro) VALUES (?, ?)");
$agregar->bind_param("ii", $id_usuario, $id_libro);
$agregar->execute();

responder(["activo" => true]);
