# Checklist de Deploy — AquaWash
> Revisá cada ítem antes de lanzar a producción.

---

## 1. Variables de entorno (backend)

- [ ] `JWT_SECRET` con al menos 64 caracteres random
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- [ ] `DB_PASSWORD` seguro, no el default de postgres
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` apunta al dominio real (sin trailing slash)
- [ ] `DB_SYNC=false` — nunca `true` en producción
- [ ] `LOG_LEVEL=info`
- [ ] `PORT` configurado (o dejar el default 3000 si el proxy maneja esto)

## 2. Variables de entorno (frontend)

- [ ] `VITE_API_URL` apunta al dominio del backend (ej: `https://api.miapp.com`)
  ```bash
  # En vite.config.js o .env.production
  VITE_API_URL=https://api.miapp.com
  ```

## 3. Base de datos

- [ ] Correr migraciones ANTES de deployar el código nuevo:
  ```bash
  NODE_ENV=production npx sequelize-cli db:migrate
  ```
- [ ] Verificar con `npx sequelize-cli db:migrate:status` que todas están `up`
- [ ] Backup de la DB antes de cada deploy con cambios de schema
- [ ] Índices creados (se crean automáticamente con las migraciones)

## 4. Seguridad

- [ ] HTTPS habilitado (Let's Encrypt o certificado del hosting)
- [ ] Cookie `secure: true` (ya está condicionado a `NODE_ENV === 'production'`)
- [ ] `CORS` apunta solo al frontend real, no a `*` ni a localhost
- [ ] Helmet headers activos (ya configurado en `app.js`)
- [ ] Rate limiting activo en `/auth` y endpoints de creación
- [ ] No hay `console.log` con datos sensibles (passwords, tokens)

## 5. Performance

- [ ] Build de producción del frontend:
  ```bash
  cd client && npm run build
  ```
- [ ] Servir el build con nginx, Caddy, o CDN (no con `vite preview` en producción)
- [ ] Compression activo en Express (ya configurado)
- [ ] Pool de conexiones a BD configurado (`max: 10` en `database.js`)

## 6. Monitoring

- [ ] `/health` endpoint responde correctamente (incluye check de DB)
- [ ] Logs estructurados van a algún servicio (Logtail, Datadog, etc.)
- [ ] Alertas configuradas si el health check falla
- [ ] Uptime monitor (UptimeRobot, Better Uptime, etc.)

## 7. Proceso de deploy

### Orden correcto (importante):

```bash
# 1. Backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Migraciones
NODE_ENV=production npx sequelize-cli db:migrate

# 3. Deploy del backend
# (restart del proceso Node, PM2, Docker, etc.)
pm2 reload aquawash --update-env

# 4. Verificar health
curl https://api.tudominio.com/health

# 5. Deploy del frontend
cd client && npm run build
# subir dist/ al hosting

# 6. Smoke test manual
# - Login
# - Ver dashboard
# - Ver clientes
# - Crear una orden de prueba
```

## 8. Rollback

Si algo falla:

```bash
# Revertir migración
NODE_ENV=production npx sequelize-cli db:migrate:undo

# Revertir código (git)
git revert HEAD --no-edit
git push

# Restaurar backup si es necesario
psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
```

---

## Comandos útiles post-deploy

```bash
# Ver logs en tiempo real
pm2 logs aquawash

# Ver estado del proceso
pm2 status

# Reiniciar sin downtime
pm2 reload aquawash

# Verificar conexiones a BD
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'aquawash';"

# Ver tamaño de tablas
psql $DATABASE_URL -c "
  SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
  FROM pg_catalog.pg_statio_user_tables
  ORDER BY pg_total_relation_size(relid) DESC;"
```