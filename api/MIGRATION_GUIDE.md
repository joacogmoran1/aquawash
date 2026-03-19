# Guía de Migraciones — AquaWash

## Instalación

```bash
cd api
npm install sequelize-cli --save-dev
```

## Estructura de carpetas

```
api/
├── .sequelizerc              ← le dice a sequelize-cli dónde están las carpetas
├── src/
│   ├── config/
│   │   └── sequelize-config.js   ← config para sequelize-cli (no el ORM runtime)
│   ├── migrations/           ← archivos de migración (versión controlada)
│   └── seeders/              ← datos de prueba
```

## Primera vez: generar migración desde el estado actual

Como ya tenés tablas creadas con `sync({ alter: true })`, el primer paso es
crear una migración "baseline" que documente el estado actual:

```bash
# Crear carpetas si no existen
mkdir -p src/migrations src/seeders

# Crear la migración baseline
npx sequelize-cli migration:generate --name baseline-initial-schema
```

Esto crea `src/migrations/YYYYMMDDHHMMSS-baseline-initial-schema.js`.
Editarlo para que refleje el schema actual (ver ejemplo abajo).

Luego marcarla como ya ejecutada (sin correrla de nuevo):
```bash
# Crear la tabla que lleva registro de migraciones
npx sequelize-cli db:migrate:status

# Si la tabla SequelizeMeta no existe aún:
npx sequelize-cli db:migrate --to 00000000000000-baseline-initial-schema.js
# Esto la marca como ejecutada sin cambiar el schema
```

## Flujo para cambios futuros

```bash
# 1. Generar nueva migración
npx sequelize-cli migration:generate --name add-color-to-autos

# 2. Editar el archivo generado en src/migrations/

# 3. Aplicar en development
npx sequelize-cli db:migrate

# 4. Si algo salió mal, revertir
npx sequelize-cli db:migrate:undo

# 5. En producción (desde CI/CD o manual)
NODE_ENV=production npx sequelize-cli db:migrate
```

## Ejemplo de migración: agregar una columna

```javascript
// src/migrations/20240601120000-add-notas-to-autos.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('autos', 'notas', {
      type:      Sequelize.TEXT,
      allowNull: true,
      after:     'year', // opcional en postgres
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('autos', 'notas');
  },
};
```

## Ejemplo de migración: crear tabla nueva

```javascript
// src/migrations/20240615090000-create-notificaciones.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notificaciones', {
      id: {
        type:         Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey:   true,
      },
      lavadero_id: {
        type:       Sequelize.UUID,
        allowNull:  false,
        references: { model: 'lavaderos', key: 'id' },
        onDelete:   'CASCADE',
      },
      mensaje: {
        type:      Sequelize.TEXT,
        allowNull: false,
      },
      leida: {
        type:         Sequelize.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updated_at: {
        type:      Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addIndex('notificaciones', ['lavadero_id', 'leida']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('notificaciones');
  },
};
```

## Reglas de oro

1. **Nunca editar una migración que ya fue aplicada en producción.**
   Si te equivocaste, creá una nueva migración que corrija el error.

2. **Siempre implementar `down()`.**
   Si el deploy falla, necesitás poder revertir.

3. **Las migraciones van al repo.**
   Hacer commit de todos los archivos en `src/migrations/`.

4. **En producción nunca usar `sync({ alter: true })`.**
   Siempre `npm run db:migrate`.

5. **Testear la migración en development antes de producción.**
   ```bash
   npm run db:migrate        # aplica
   npm run db:migrate:undo   # revierte
   npm run db:migrate        # aplica de nuevo — si esto falla, la migración tiene un bug
   ```