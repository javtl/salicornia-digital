# Salicornia Digital

Aplicacion web con backend Express, MySQL, sesiones, usuarios con bcrypt y recuperacion de contrasena por codigo.

## Puesta en marcha

1. Importa `Base_Datos-Marismas.sql` en MySQL/MariaDB.
2. Copia `.env.example` a `.env` y ajusta usuario, password y nombre de base de datos.
3. Instala dependencias:

```bash
npm install
```

4. Genera las contrasenas demo y permisos:

```bash
npm run seed
```

5. Arranca el backend:

```bash
npm start
```

La app queda en `http://localhost:3000`.

## Recuperacion de contrasena

Si no configuras SMTP, el codigo aparece en la consola del servidor. Para correo real, rellena en `.env`:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM="Salicornia Digital <no-reply@marismasbiomed.es>"
```

## Usuarios demo

Todos usan inicialmente `salicornia123`:

- `admin`
- `david`
- `alejandro`
- `gonzalo`
- `javi`
- `jesus`
- `guille`
- `anibal`
