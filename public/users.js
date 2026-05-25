// Salicornia Digital - usuarios, modulos y permisos de demo.
// En produccion esto deberia venir de una API/base de datos real.

const DEMO_USERS = [
  {
    username: "admin",
    password: "salicornia123",
    email: "admin@marismasbiomed.es",
    role: "Sistema completo",
    hierarchy: "superadmin",
    modules: ["dashboard", "infra", "ambient", "fieldbook", "incidents", "iot", "harvests", "trace"],
    active: true
  },
  {
    username: "david",
    password: "salicornia123",
    email: "david@marismasbiomed.es",
    role: "Dashboard",
    hierarchy: "admin",
    modules: ["dashboard", "trace"],
    active: true
  },
  {
    username: "alejandro",
    password: "salicornia123",
    email: "alejandro@marismasbiomed.es",
    role: "Datos ambientales",
    hierarchy: "user",
    modules: ["ambient", "trace"],
    active: true
  },
  {
    username: "gonzalo",
    password: "salicornia123",
    email: "gonzalo@marismasbiomed.es",
    role: "IoT / Sensores",
    hierarchy: "user",
    modules: ["iot", "trace"],
    active: true
  },
  {
    username: "javi",
    password: "salicornia123",
    email: "javi@marismasbiomed.es",
    role: "Infraestructura",
    hierarchy: "user",
    modules: ["infra", "trace"],
    active: true
  },
  {
    username: "jesus",
    password: "salicornia123",
    email: "jesus@marismasbiomed.es",
    role: "Cuaderno de campo",
    hierarchy: "user",
    modules: ["fieldbook", "trace"],
    active: true
  },
  {
    username: "guille",
    password: "salicornia123",
    email: "guille@marismasbiomed.es",
    role: "Incidencias",
    hierarchy: "user",
    modules: ["incidents", "trace"],
    active: true
  },
  {
    username: "anibal",
    password: "salicornia123",
    email: "anibal@marismasbiomed.es",
    role: "Cosechas y Trazabilidad",
    hierarchy: "user",
    modules: ["harvests", "trace"],
    active: true
  }
];

const ROLE_ALLOWED_VIEWS = {
  Dashboard: ["dashboard", "trace"],
  "Datos ambientales": ["ambient", "trace"],
  "IoT / Sensores": ["iot", "trace"],
  Infraestructura: ["infra", "trace"],
  "Cuaderno de campo": ["fieldbook", "trace"],
  Incidencias: ["incidents", "trace"],
  "Cosechas y Trazabilidad": ["harvests", "trace"]
};

const ALL_MODULE_VIEWS = ["dashboard", "infra", "ambient", "fieldbook", "incidents", "iot", "harvests", "trace"];

const HIERARCHY_LEVELS = {
  user: 1,
  admin: 2,
  superadmin: 3
};

const HIERARCHY_LABELS = {
  user: "Usuario",
  admin: "Administrador",
  superadmin: "Superadmin"
};

const HIERARCHY_PERMISSIONS = {
  superadmin: {
    manageUsers: true,
    manageAdmins: true,
    canAccessAllViews: true,
    resetDemo: true
  },
  admin: {
    manageUsers: true,
    manageAdmins: false,
    canAccessAllViews: false,
    resetDemo: false
  },
  user: {
    manageUsers: false,
    manageAdmins: false,
    canAccessAllViews: false,
    resetDemo: false
  }
};

function dbCurrentUser() {
  return typeof currentUser === "undefined" ? null : currentUser;
}

function hasPermission(user = dbCurrentUser(), permission) {
  return Boolean(user && HIERARCHY_PERMISSIONS[user.hierarchy]?.[permission]);
}

function getAllowedViews(user = dbCurrentUser()) {
  if (!user) return ["dashboard"];
  if (user.active === false) return [];
  if (hasPermission(user, "canAccessAllViews")) return [...ALL_MODULE_VIEWS, "users"];

  const modules = user.modules?.length ? user.modules : (ROLE_ALLOWED_VIEWS[user.role] || ["trace"]);
  const baseViews = [...new Set(["dashboard", ...modules])];
  return hasPermission(user, "manageUsers") ? [...new Set([...baseViews, "users"])] : baseViews;
}

function canAccessView(view, user = dbCurrentUser()) {
  return getAllowedViews(user).includes(view);
}

function canManageUser(targetUser, actor = dbCurrentUser()) {
  if (!actor || !targetUser || !hasPermission(actor, "manageUsers")) return false;
  if (actor.hierarchy === "superadmin") return actor.username !== targetUser.username;

  const actorLevel = HIERARCHY_LEVELS[actor.hierarchy] || 0;
  const targetLevel = HIERARCHY_LEVELS[targetUser.hierarchy] || 0;
  return actorLevel > targetLevel;
}

function getAssignableModules(actor = dbCurrentUser()) {
  if (!actor) return [];
  if (hasPermission(actor, "canAccessAllViews")) return ALL_MODULE_VIEWS;
  return (actor.modules || []).filter((view) => ALL_MODULE_VIEWS.includes(view));
}

function managedUsers(actor = dbCurrentUser()) {
  if (!actor || !hasPermission(actor, "manageUsers")) return [];
  return DEMO_USERS.filter((user) => canManageUser(user, actor));
}

function publicUser(user) {
  return {
    username: user.username,
    email: user.email,
    role: user.role,
    hierarchy: user.hierarchy || "user",
    modules: [...(user.modules || ROLE_ALLOWED_VIEWS[user.role] || ["trace"])],
    active: user.active !== false
  };
}
