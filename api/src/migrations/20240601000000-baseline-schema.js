'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {

        // ─── 1. LAVADEROS ─────────────────────────────────────────────
        await queryInterface.createTable('lavaderos', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
                primaryKey: true,
            },
            nombre: { type: Sequelize.STRING, allowNull: false },
            direccion: { type: Sequelize.STRING, allowNull: true },
            telefono: { type: Sequelize.STRING, allowNull: true },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            password_hash: { type: Sequelize.STRING, allowNull: false },

            // Verificación de email
            email_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            email_verify_token: { type: Sequelize.STRING(64), allowNull: true },
            email_verify_expires: { type: Sequelize.DATE, allowNull: true },

            // Reset de contraseña
            reset_password_token: { type: Sequelize.STRING(64), allowNull: true },
            reset_password_expires: { type: Sequelize.DATE, allowNull: true },

            // Días abiertos (1 = abre, 0 = cierra)
            lun: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            mar: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            mie: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            jue: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            vie: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            sab: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            dom: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },

            // Horarios
            lun_apertura: { type: Sequelize.STRING, allowNull: true, defaultValue: '08:00' },
            lun_cierre: { type: Sequelize.STRING, allowNull: true, defaultValue: '20:00' },
            mar_apertura: { type: Sequelize.STRING, allowNull: true, defaultValue: '08:00' },
            mar_cierre: { type: Sequelize.STRING, allowNull: true, defaultValue: '20:00' },
            mie_apertura: { type: Sequelize.STRING, allowNull: true, defaultValue: '08:00' },
            mie_cierre: { type: Sequelize.STRING, allowNull: true, defaultValue: '20:00' },
            jue_apertura: { type: Sequelize.STRING, allowNull: true, defaultValue: '08:00' },
            jue_cierre: { type: Sequelize.STRING, allowNull: true, defaultValue: '20:00' },
            vie_apertura: { type: Sequelize.STRING, allowNull: true, defaultValue: '08:00' },
            vie_cierre: { type: Sequelize.STRING, allowNull: true, defaultValue: '20:00' },
            sab_apertura: { type: Sequelize.STRING, allowNull: true, defaultValue: '08:00' },
            sab_cierre: { type: Sequelize.STRING, allowNull: true, defaultValue: '20:00' },
            dom_apertura: { type: Sequelize.STRING, allowNull: true, defaultValue: '08:00' },
            dom_cierre: { type: Sequelize.STRING, allowNull: true, defaultValue: '20:00' },

            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        await queryInterface.addIndex('lavaderos', ['email'], { unique: true });


        // ─── 2. USUARIOS ──────────────────────────────────────────────
        await queryInterface.createTable('usuarios', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
                primaryKey: true,
            },
            lavadero_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'lavaderos', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            nombre: { type: Sequelize.STRING, allowNull: false },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            password_hash: { type: Sequelize.STRING, allowNull: false },
            rol: {
                type: Sequelize.ENUM('owner', 'admin', 'operario'),
                allowNull: false,
                defaultValue: 'operario',
            },
            activo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },

            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        await queryInterface.addIndex('usuarios', ['lavadero_id']);
        await queryInterface.addIndex('usuarios', ['email'], { unique: true });


        // ─── 3. CLIENTES ──────────────────────────────────────────────
        await queryInterface.createTable('clientes', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
                primaryKey: true,
            },
            lavadero_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'lavaderos', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            nombre: { type: Sequelize.STRING, allowNull: false },
            telefono: { type: Sequelize.STRING, allowNull: true },
            email: { type: Sequelize.STRING, allowNull: true },

            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        await queryInterface.addIndex('clientes', ['lavadero_id']);
        await queryInterface.addIndex('clientes', ['lavadero_id', 'nombre']);
        await queryInterface.addIndex('clientes', ['lavadero_id', 'telefono']);
        await queryInterface.addIndex('clientes', ['lavadero_id', 'email']);


        // ─── 4. AUTOS ─────────────────────────────────────────────────
        await queryInterface.createTable('autos', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
                primaryKey: true,
            },
            lavadero_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'lavaderos', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            cliente_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'clientes', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            marca: { type: Sequelize.STRING, allowNull: false },
            modelo: { type: Sequelize.STRING, allowNull: false },
            patente: { type: Sequelize.STRING, allowNull: false },
            color: { type: Sequelize.STRING, allowNull: true },
            year: { type: Sequelize.INTEGER, allowNull: true },

            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        await queryInterface.addIndex('autos', ['lavadero_id']);
        await queryInterface.addIndex('autos', ['cliente_id']);


        // ─── 5. SERVICIOS ─────────────────────────────────────────────
        await queryInterface.createTable('servicios', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
                primaryKey: true,
            },
            lavadero_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'lavaderos', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            tipo: { type: Sequelize.STRING, allowNull: false, defaultValue: 'Personalizado' },
            nombre: { type: Sequelize.STRING, allowNull: false, defaultValue: '' },
            precio: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            duracion_estimada_min: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 30 },
            capacidad_por_hora: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            activo: { type: Sequelize.BOOLEAN, defaultValue: true },

            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        await queryInterface.addIndex('servicios', ['lavadero_id']);


        // ─── 6. REFRESH TOKENS ────────────────────────────────────────
        await queryInterface.createTable('refresh_tokens', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
                primaryKey: true,
            },
            usuario_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'usuarios', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            token_hash: { type: Sequelize.STRING(64), allowNull: false, unique: true },
            expires_at: { type: Sequelize.DATE, allowNull: false },
            revoked: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
            ip: { type: Sequelize.STRING(45), allowNull: true },
            user_agent: { type: Sequelize.STRING(500), allowNull: true },

            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        await queryInterface.addIndex('refresh_tokens', ['token_hash'], { unique: true });
        await queryInterface.addIndex('refresh_tokens', ['usuario_id']);
        await queryInterface.addIndex('refresh_tokens', ['expires_at']);


        // ─── 7. TURNOS ────────────────────────────────────────────────
        await queryInterface.createTable('turnos', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
                primaryKey: true,
            },
            lavadero_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'lavaderos', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            cliente_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'clientes', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            auto_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'autos', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            servicio_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'servicios', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            fecha: { type: Sequelize.DATEONLY, allowNull: false },
            hora: { type: Sequelize.TIME, allowNull: false },
            estado: {
                type: Sequelize.ENUM('reservado', 'confirmado', 'cancelado', 'completado'),
                allowNull: false,
                defaultValue: 'reservado',
            },

            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        await queryInterface.addIndex('turnos', ['lavadero_id', 'fecha']);
        await queryInterface.addIndex('turnos', ['cliente_id']);
        await queryInterface.addIndex('turnos', ['servicio_id']);


        // ─── 8. ÓRDENES DE LAVADO ─────────────────────────────────────
        await queryInterface.createTable('ordenes_lavado', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
                primaryKey: true,
            },
            lavadero_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'lavaderos', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            cliente_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'clientes', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            auto_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'autos', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            turno_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'turnos', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            servicio_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'servicios', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            servicio_tipo: { type: Sequelize.STRING, allowNull: false },
            precio: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            estado: {
                type: Sequelize.ENUM('agendado', 'esperando', 'lavando', 'listo', 'entregado', 'cancelado'),
                allowNull: false,
                defaultValue: 'agendado',
            },
            hora_llegada: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            hora_inicio: { type: Sequelize.DATE, allowNull: true },
            hora_fin: { type: Sequelize.DATE, allowNull: true },
            hora_entrega: { type: Sequelize.DATE, allowNull: true },

            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        await queryInterface.addIndex('ordenes_lavado', ['lavadero_id', 'estado']);
        await queryInterface.addIndex('ordenes_lavado', ['lavadero_id', 'hora_llegada']);
        await queryInterface.addIndex('ordenes_lavado', ['lavadero_id', 'estado', 'hora_entrega']);
        await queryInterface.addIndex('ordenes_lavado', ['turno_id']);
        await queryInterface.addIndex('ordenes_lavado', ['servicio_id']);
        await queryInterface.addIndex('ordenes_lavado', ['cliente_id']);


        // ─── 9. PAGOS ─────────────────────────────────────────────────
        await queryInterface.createTable('pagos', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
                primaryKey: true,
            },
            orden_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'ordenes_lavado', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            monto: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            metodo_pago: {
                type: Sequelize.ENUM('pendiente', 'efectivo', 'tarjeta', 'transferencia', 'mercadopago'),
                allowNull: false,
                defaultValue: 'pendiente',
            },
            estado: {
                type: Sequelize.ENUM('registrado', 'cobrado', 'reembolsado'),
                allowNull: false,
                defaultValue: 'registrado',
            },
            fecha: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            notas: { type: Sequelize.TEXT, allowNull: true },

            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        await queryInterface.addIndex('pagos', ['orden_id']);
        await queryInterface.addIndex('pagos', ['fecha']);


        // ─── 10. HISTORIAL DE SERVICIOS ───────────────────────────────
        await queryInterface.createTable('historial_servicios', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('gen_random_uuid()'),
                primaryKey: true,
            },
            lavadero_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'lavaderos', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            cliente_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: { model: 'clientes', key: 'id' },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            auto_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { model: 'autos', key: 'id' },
                onDelete: 'SET NULL',
                onUpdate: 'CASCADE',
            },
            servicio_nombre: { type: Sequelize.STRING, allowNull: false },
            precio: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            fecha_entrega: { type: Sequelize.DATE, allowNull: false },

            // Snapshot del auto al momento del servicio
            auto_marca: { type: Sequelize.STRING, allowNull: true },
            auto_modelo: { type: Sequelize.STRING, allowNull: true },
            auto_patente: { type: Sequelize.STRING, allowNull: true },

            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        });

        await queryInterface.addIndex('historial_servicios', ['cliente_id']);
        await queryInterface.addIndex('historial_servicios', ['lavadero_id', 'fecha_entrega']);
        await queryInterface.addIndex('historial_servicios', ['auto_id']);
    },

    async down(queryInterface) {
        // Eliminar en orden inverso para respetar las FK
        await queryInterface.dropTable('historial_servicios');
        await queryInterface.dropTable('pagos');
        await queryInterface.dropTable('ordenes_lavado');
        await queryInterface.dropTable('turnos');
        await queryInterface.dropTable('refresh_tokens');
        await queryInterface.dropTable('servicios');
        await queryInterface.dropTable('autos');
        await queryInterface.dropTable('clientes');
        await queryInterface.dropTable('usuarios');
        await queryInterface.dropTable('lavaderos');

        // Eliminar ENUMs (Postgres los crea como tipos separados)
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_usuarios_rol";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_turnos_estado";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ordenes_lavado_estado";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pagos_metodo_pago";');
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_pagos_estado";');
    },
};