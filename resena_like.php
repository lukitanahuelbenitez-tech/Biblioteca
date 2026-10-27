<?php
require "api_util.php";
exigir_post();
$id_usuario = exigir_sesion();
$id_resena = (int) ($_POST["id"] ?? 0);

$existe = $conexion->prepare("SELECT 1 FROM resenas WHERE id_resena = ?");
$existe->bind_param("i", $id_resena);
$existe->execute();
if ($existe->get_result()->num_rows === 0) {
    responder(["error" => "Esa reseña no existe."], 404);
}


$borrar = $conexion->prepare("DELETE FROM likes_resenas WHERE id_usuario = ? AND id_resena = ?");
$borrar->bind_param("ii", $id_usuario, $id_resena);
$borrar->execute();
$le_gusta = false;

if ($borrar->affected_rows === 0) {
    $poner = $conexion->prepare("INSERT INTO likes_resenas (id_usuario, id_resena) VALUES (?, ?)");
    $poner->bind_param("ii", $id_usuario, $id_resena);
    $poner->execute();
    $le_gusta = true;
}

$contar = $conexion->prepare("SELECT COUNT(*) AS total FROM likes_resenas WHERE id_resena = ?");
$contar->bind_param("i", $id_resena);
$contar->execute();
$likes = (int) $contar->get_result()->fetch_assoc()["total"];

responder(["le_gusta" => $le_gusta, "likes" => $likes]);
