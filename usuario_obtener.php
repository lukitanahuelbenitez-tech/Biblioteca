<?php
require "api_util.php";

$id = (int) ($_GET["id"] ?? 0);
if ($id <= 0) {
    responder(["error" => "Usuario inválido."], 400);
}

$consulta = $conexion->prepare("SELECT id_usuario, nombre FROM usuarios WHERE id_usuario = ?");
$consulta->bind_param("i", $id);
$consulta->execute();
$usuario = $consulta->get_result()->fetch_assoc();

if (!$usuario) {
    responder(["error" => "No encontramos a ese usuario."], 404);
}

responder([
    "id" => (int) $usuario["id_usuario"],
    "nombre" => $usuario["nombre"],
    "es_mio" => $id === (int) ($_SESSION["usuario_id"] ?? 0)
]);