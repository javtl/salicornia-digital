/**
 * Servidor local para Salicornia Digital
 * Permite que tus compañeros de red accedan a la app.
 *
 * USO:
 *   node servidor-local.js
 *
 * Requiere Node.js (ya incluido en la mayoría de sistemas).
 * Pon este archivo en la misma carpeta que index.html, app.js y styles.css.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".woff2": "font/woff2",
  ".woff":  "font/woff",
};

// Obtener la IP local de la máquina en la red
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

const server = http.createServer((req, res) => {
  // Ruta base: carpeta donde está este script
  let urlPath = req.url.split("?")[0]; // ignorar query strings
  if (urlPath === "/" || urlPath === "") urlPath = "/index.html";

  const filePath = path.join(__dirname, urlPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        // Archivo no encontrado → devolver index.html (SPA fallback)
        fs.readFile(path.join(__dirname, "index.html"), (err2, fallback) => {
          if (err2) {
            res.writeHead(404);
            res.end("404 Not Found");
          } else {
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(fallback);
          }
        });
      } else {
        res.writeHead(500);
        res.end("Error interno del servidor");
      }
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  const ip = getLocalIP();
  console.log("\n✅  Salicornia Digital en marcha\n");
  console.log(`   Tú (este equipo):        http://localhost:${PORT}`);
  console.log(`   Compañeros de red:       http://${ip}:${PORT}\n`);
  console.log("   Comparte la segunda URL con tus compañeros.");
  console.log("   Pulsa Ctrl+C para detener el servidor.\n");
});
