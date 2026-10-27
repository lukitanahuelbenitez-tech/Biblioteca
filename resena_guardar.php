<?php
require "api_util.php";
exigir_post();
$id_usuario = exigir_sesion();

$id_libro = (int) ($_POST["libro"] ?? 0);
$puntuacion = (float) ($_POST["puntuacion"] ?? 0);
$comentario = trim($_POST["comentario"] ?? "");
$inicio = trim($_POST["inicio"] ?? "");
$fin = trim($_POST["fin"] ?? "");

if ($id_libro <= 0) {
    responder(["error" => "Libro inválido."], 400);
}
// De 0.5 a 5, de media en media estrella
if ($puntuacion < 0.5 || $puntuacion > 5 || fmod($puntuacion * 2, 1) != 0) {
    responder(["error" => "La calificación tiene que ir de 0.5 a 5."], 400);
}

if (strlen($comentario) > 20000) {
    responder(["error" => "La reseña es demasiado larga."], 400);
}

function fecha_valida($texto) {
    $f = DateTime::createFromFormat("Y-m-d", $texto);
    return $f && $f->format("Y-m-d") === $texto;
}

foreach ([$inicio, $fin] as $fecha) {
    if ($fecha !== "" && !fecha_valida($fecha)) {
        responder(["error" => "Fecha inválida."], 400);
    }
}
if ($inicio !== "" && $fin !== "" && $fin < $inicio) {
    responder(["error" => "La fecha de fin no puede ser anterior a la de inicio."], 400);
}

// Los campos vacíos se guardan como NULL
$comentario = $comentario === "" ? null : $comentario;
$inicio = $inicio === "" ? null : $inicio;
$fin = $fin === "" ? null : $fin;

$consulta = $conexion->prepare(
    "INSERT INTO resenas (id_usuario, id_libro, puntuacion, comentario, fecha_inicio, fecha_fin)
     VALUES (?, ?, ?, ?, ?, ?)"
);
$consulta->bind_param("iidsss", $id_usuario, $id_libro, $puntuacion, $comentario, $inicio, $fin);
$consulta->execute();

responder(["ok" => true, "id" => $consulta->insert_id], 201);
