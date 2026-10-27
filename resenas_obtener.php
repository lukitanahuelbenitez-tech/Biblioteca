<?php
require "api_util.php";
$yo = (int) ($_SESSION["usuario_id"] ?? 0);

if (isset($_GET["libro"])) {
    $filtro = "WHERE r.id_libro = ?";
    $valor = (int) $_GET["libro"];
} elseif (isset($_GET["id"])) {
    $filtro = "WHERE r.id_resena = ?";
    $valor = (int) $_GET["id"];
} elseif (isset($_GET["mias"])) {
    $filtro = "WHERE r.id_usuario = ?";
    $valor = exigir_sesion();
} elseif (isset($_GET["likeadas"])) {
    $filtro = "WHERE r.id_resena IN (SELECT id_resena FROM likes_resenas WHERE id_usuario = ?)";
    $valor = exigir_sesion();
} else {
    responder(["error" => "Falta indicar qué reseñas querés."], 400);
}

$sql = "SELECT r.id_resena AS id,
               r.id_libro AS libro,
               u.nombre AS usuario,
               r.puntuacion,
               r.comentario,
               r.fecha_inicio AS inicio,
               r.fecha_fin AS fin,
               UNIX_TIMESTAMP(r.creada_en) * 1000 AS ts,
               (SELECT COUNT(*) FROM likes_resenas l WHERE l.id_resena = r.id_resena) AS likes,
               EXISTS(SELECT 1 FROM likes_resenas l
                      WHERE l.id_resena = r.id_resena AND l.id_usuario = ?) AS le_gusta
        FROM resenas r
        JOIN usuarios u ON u.id_usuario = r.id_usuario
        $filtro
        ORDER BY r.creada_en DESC, r.id_resena DESC";

$consulta = $conexion->prepare($sql);
$consulta->bind_param("ii", $yo, $valor);
$consulta->execute();
$filas = $consulta->get_result()->fetch_all(MYSQLI_ASSOC);

foreach ($filas as &$f) {
    $f["id"] = (int) $f["id"];
    $f["libro"] = (int) $f["libro"];
    $f["puntuacion"] = (float) $f["puntuacion"];
    $f["ts"] = (int) $f["ts"];
    $f["likes"] = (int) $f["likes"];
    $f["le_gusta"] = (bool) $f["le_gusta"];
}

responder(["resenas" => $filas]);
