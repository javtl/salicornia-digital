require("dotenv").config();

const crypto = require("crypto");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");
const express = require("express");
const session = require("express-session");
const mysql = require("mysql2/promise");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === "production";

const ALL_MODULE_VIEWS = ["dashboard", "infra", "ambient", "fieldbook", "incidents", "iot", "harvests", "trace"];
const ROLE_ALLOWED_VIEWS = {
  Dashboard: ["dashboard", "trace"],
  "Datos ambientales": ["ambient", "trace"],
  "IoT / Sensores": ["iot", "trace"],
  Infraestructura: ["infra", "trace"],
  "Cuaderno de campo": ["fieldbook", "trace"],
  Incidencias: ["incidents", "trace"],
  "Cosechas y Trazabilidad": ["harvests", "trace"],
  Administrador: ALL_MODULE_VIEWS,
  "Sistema completo": ALL_MODULE_VIEWS
};
const HIERARCHY_LEVELS = { user: 1, admin: 2, superadmin: 3 };

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "salicornia_db",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
  charset: "utf8mb4"
});

app.disable("x-powered-by");
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: "salicornia.sid",
  secret: process.env.SESSION_SECRET || "cambia-esta-clave-en-env",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PROD,
    maxAge: Number(process.env.SESSION_MAX_AGE_MS || 15 * 60 * 1000)
  }
}));
app.use(express.static(path.join(__dirname, "public")));

function text(value) {
  return String(value || "").trim();
}

function username(value) {
  return text(value).toLowerCase();
}

function email(value) {
  return text(value).toLowerCase();
}

function parseModules(value, role, hierarchy) {
  if (hierarchy === "superadmin") return [...ALL_MODULE_VIEWS];
  if (Array.isArray(value)) return value.filter((item) => ALL_MODULE_VIEWS.includes(item));
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((item) => ALL_MODULE_VIEWS.includes(item));
    } catch {}
  }
  return ROLE_ALLOWED_VIEWS[role] || ["trace"];
}

function publicUser(row) {
  if (!row) return null;
  const role = row.rol || row.role || "Usuario";
  const hierarchy = row.jerarquia || row.hierarchy || (role === "Administrador" || role === "Sistema completo" ? "superadmin" : "user");
  return {
    username: row.nombre || row.username,
    email: row.email,
    role,
    hierarchy,
    modules: parseModules(row.modulos_json || row.modules, role, hierarchy),
    active: Boolean(row.activo ?? row.active)
  };
}

function canManageUser(actor, target) {
  if (!actor || !target || !["admin", "superadmin"].includes(actor.hierarchy)) return false;
  if (actor.hierarchy === "superadmin") return actor.username !== target.username;
  return (HIERARCHY_LEVELS[actor.hierarchy] || 0) > (HIERARCHY_LEVELS[target.hierarchy] || 0);
}

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: "No autenticado" });
  next();
}

function requireUserManager(req, res, next) {
  if (!req.session.user || !["admin", "superadmin"].includes(req.session.user.hierarchy)) {
    return res.status(403).json({ error: "No tienes permiso para gestionar usuarios" });
  }
  next();
}

async function one(sql, params = []) {
  const [rows] = await db.execute(sql, params);
  return rows[0] || null;
}

async function ensureAuthSchema() {
  await db.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS jerarquia VARCHAR(30) NOT NULL DEFAULT 'user'");
  await db.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS modulos_json JSON NULL");
  await db.query("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  await db.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      usuario_id INT UNSIGNED NOT NULL,
      token_hash CHAR(64) NOT NULL,
      codigo_hash CHAR(64) NOT NULL,
      expira_en DATETIME NOT NULL,
      usado_en DATETIME NULL,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_prt_usuario (usuario_id),
      KEY idx_prt_token (token_hash),
      CONSTRAINT fk_prt_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await db.execute("UPDATE usuarios SET jerarquia = 'superadmin', modulos_json = ? WHERE nombre = 'admin'", [JSON.stringify(ALL_MODULE_VIEWS)]);
}

async function sendResetEmail(user, code, token) {
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const resetUrl = `${appUrl}/?resetToken=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
  const subject = "Codigo para recuperar tu contrasena";
  const body = [
    `Hola ${user.username},`,
    "",
    `Tu codigo de confirmacion es: ${code}`,
    `Enlace de recuperacion: ${resetUrl}`,
    "",
    "El codigo caduca en 10 minutos. Si no lo solicitaste, ignora este mensaje."
  ].join("\n");

  if (!process.env.SMTP_HOST) {
    console.log("\n[EMAIL DEMO]");
    console.log(`Para: ${user.email}`);
    console.log(`Asunto: ${subject}`);
    console.log(body);
    console.log("[/EMAIL DEMO]\n");
    return { mode: "console", devCode: code };
  }

  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch {
    console.log("Instala nodemailer con npm install para enviar correos reales.");
    console.log(`Codigo para ${user.email}: ${code}`);
    return { mode: "console", devCode: code };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" } : undefined
  });
  await transporter.sendMail({
    from: process.env.MAIL_FROM || "Salicornia Digital <no-reply@marismasbiomed.es>",
    to: user.email,
    subject,
    text: body
  });
  return { mode: "smtp" };
}

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ ok: true, database: "ok" });
  } catch (error) {
    res.status(500).json({ ok: false, database: "error", error: error.message });
  }
});

app.get("/api/auth/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const login = username(req.body.username);
    const password = String(req.body.password || "");
    const row = await one("SELECT * FROM usuarios WHERE nombre = ? OR email = ?", [login, login]);
    if (!row || !row.activo) return res.status(401).json({ error: "Usuario o contrasena incorrectos" });
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.status(401).json({ error: "Usuario o contrasena incorrectos" });
    await db.execute("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?", [row.id]);
    req.session.user = publicUser(row);
    res.json({ user: req.session.user });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const name = username(req.body.username);
    const mail = email(req.body.email);
    const password = String(req.body.password || "");
    if (!name || !mail || password.length < 6) return res.status(400).json({ error: "Completa usuario, email y contrasena" });
    if (await one("SELECT id FROM usuarios WHERE nombre = ? OR email = ?", [name, mail])) {
      return res.status(409).json({ error: "Ese usuario o email ya existe" });
    }
    const hash = await bcrypt.hash(password, 12);
    await db.execute(
      "INSERT INTO usuarios (nombre, email, password, rol, jerarquia, modulos_json, activo) VALUES (?, ?, ?, 'Usuario', 'user', ?, 1)",
      [name, mail, hash, JSON.stringify(["trace"])]
    );
    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/forgot-password", async (req, res, next) => {
  try {
    const mail = email(req.body.email);
    const row = await one("SELECT * FROM usuarios WHERE email = ? AND activo = 1", [mail]);
    if (!row) return res.status(404).json({ error: "No hay ninguna cuenta activa con ese email" });
    const user = publicUser(row);
    const code = String(crypto.randomInt(100000, 1000000));
    const token = crypto.randomBytes(32).toString("hex");
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await db.execute("UPDATE password_reset_tokens SET usado_en = NOW() WHERE usuario_id = ? AND usado_en IS NULL", [row.id]);
    await db.execute(
      "INSERT INTO password_reset_tokens (usuario_id, token_hash, codigo_hash, expira_en) VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
      [row.id, tokenHash, codeHash]
    );
    const mailResult = await sendResetEmail(user, code, token);
    res.json({
      ok: true,
      message: "Codigo de confirmacion enviado",
      email: user.email,
      resetToken: token,
      devCode: mailResult.mode === "console" ? mailResult.devCode : undefined
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/reset-password", async (req, res, next) => {
  try {
    const mail = email(req.body.email);
    const code = text(req.body.code);
    const token = text(req.body.token);
    const password = String(req.body.password || "");
    if (!mail || !code || password.length < 6) return res.status(400).json({ error: "Completa email, codigo y nueva contrasena" });
    const row = await one("SELECT * FROM usuarios WHERE email = ? AND activo = 1", [mail]);
    if (!row) return res.status(400).json({ error: "Solicitud no valida" });
    const params = [row.id, crypto.createHash("sha256").update(code).digest("hex")];
    let tokenSql = "";
    if (token) {
      tokenSql = " AND token_hash = ?";
      params.push(crypto.createHash("sha256").update(token).digest("hex"));
    }
    const reset = await one(
      `SELECT * FROM password_reset_tokens WHERE usuario_id = ? AND codigo_hash = ?${tokenSql} AND usado_en IS NULL AND expira_en > NOW() ORDER BY id DESC LIMIT 1`,
      params
    );
    if (!reset) return res.status(400).json({ error: "Codigo incorrecto o caducado" });
    await db.execute("UPDATE usuarios SET password = ? WHERE id = ?", [await bcrypt.hash(password, 12), row.id]);
    await db.execute("UPDATE password_reset_tokens SET usado_en = NOW() WHERE id = ?", [reset.id]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("salicornia.sid");
    res.json({ ok: true });
  });
});

app.get("/api/users", requireAuth, requireUserManager, async (req, res, next) => {
  try {
    const [rows] = await db.execute("SELECT * FROM usuarios ORDER BY nombre");
    res.json({ users: rows.map(publicUser).filter((user) => canManageUser(req.session.user, user)) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/users", requireAuth, requireUserManager, async (req, res, next) => {
  try {
    const name = username(req.body.username);
    const mail = email(req.body.email);
    const password = String(req.body.password || "");
    const role = text(req.body.role) || "Usuario";
    const hierarchy = req.session.user.hierarchy === "superadmin" && ["superadmin", "admin", "user"].includes(req.body.hierarchy) ? req.body.hierarchy : "user";
    const modules = hierarchy === "superadmin" ? ALL_MODULE_VIEWS : parseModules(req.body.modules, role, hierarchy);
    if (!name || !mail || password.length < 6) return res.status(400).json({ error: "Datos incompletos" });
    await db.execute(
      "INSERT INTO usuarios (nombre, email, password, rol, jerarquia, modulos_json, activo) VALUES (?, ?, ?, ?, ?, ?, 1)",
      [name, mail, await bcrypt.hash(password, 12), role, hierarchy, JSON.stringify(modules)]
    );
    res.status(201).json({ ok: true });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Ese usuario o email ya existe" });
    next(error);
  }
});

app.patch("/api/users/:username", requireAuth, requireUserManager, async (req, res, next) => {
  try {
    const name = username(req.params.username);
    const row = await one("SELECT * FROM usuarios WHERE nombre = ?", [name]);
    const target = publicUser(row);
    if (!canManageUser(req.session.user, target)) return res.status(403).json({ error: "No tienes permiso para modificar este usuario" });
    const role = text(req.body.role) || target.role;
    const hierarchy = req.session.user.hierarchy === "superadmin" && ["superadmin", "admin", "user"].includes(req.body.hierarchy) ? req.body.hierarchy : "user";
    const modules = hierarchy === "superadmin" ? ALL_MODULE_VIEWS : parseModules(req.body.modules, role, hierarchy);
    await db.execute(
      "UPDATE usuarios SET email = ?, rol = ?, jerarquia = ?, modulos_json = ?, activo = ? WHERE nombre = ?",
      [email(req.body.email), role, hierarchy, JSON.stringify(modules), req.body.active === true || req.body.active === "true" ? 1 : 0, name]
    );
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/users/:username", requireAuth, requireUserManager, async (req, res, next) => {
  try {
    const name = username(req.params.username);
    const row = await one("SELECT * FROM usuarios WHERE nombre = ?", [name]);
    const target = publicUser(row);
    if (!canManageUser(req.session.user, target)) return res.status(403).json({ error: "No tienes permiso para eliminar este usuario" });
    await db.execute("DELETE FROM usuarios WHERE nombre = ?", [name]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Error interno del servidor" });
});

ensureAuthSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`Salicornia Digital backend listo en http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("No se pudo preparar la base de datos:", error.message);
    console.error("Importa Base_Datos-Marismas.sql y revisa .env antes de arrancar.");
    process.exit(1);
  });
