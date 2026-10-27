<?php

session_start();
header("Content-Type: application/json; charset=utf-8");

function responder($datos, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

set_exception_handler(function ($e) {
    responder(["error" => "Error del servidor."], 500);
});

require "conexion.php";
$conexion->set_charset("utf8mb4");

// Devuelve el id del usuario logueado (de la sesión de PHP) o corta con error 401
function exigir_sesion() {
    if (empty($_SESSION["usuario_id"])) {
        responder(["error" => "Tenés que iniciar sesión."], 401);
    }
    return (int) $_SESSION["usuario_id"];
}

function exigir_post() {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        responder(["error" => "Método no permitido."], 405);
    }
}
