<?php
require "api_util.php";

// Busca usuarios por nombre.
$texto = trim($_GET["q"] ?? "");

if ($texto === "") {
    responder(["usuarios" => []]);
}
if (mb_strlen($texto) > 50) {
    $texto = mb_substr($texto, 0, 50);
}

$patron = "%" . addcslashes($texto, "\\%_") . "%";

$consulta = $conexion->prepare(
    "SELECT u.id_usuario AS id,
            u.nombre,
            (SELECT COUNT(*) FROM resenas r WHERE r.id_usuario = u.id_usuario) AS resenas
     FROM usuarios u
     WHERE u.nombre LIKE ?
     ORDER BY u.nombre
     LIMIT 20"
);
$consulta->bind_param("s", $patron);
$consulta->execute();
$filas = $consulta->get_result()->fetch_all(MYSQLI_ASSOC);

foreach ($filas as &$f) {
    $f["id"] = (int) $f["id"];
    $f["resenas"] = (int) $f["resenas"];
}

responder(["usuarios" => $filas]);
