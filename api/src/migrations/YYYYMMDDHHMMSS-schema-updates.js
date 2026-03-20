'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Eliminar notas de las tablas correspondientes
        await queryInterface.removeColumn('ordenes_lavado', 'notas');
        await queryInterface.removeColumn('turnos', 'notas');
        await queryInterface.removeColumn('clientes', 'notas');

        // Agregar campos de verificación de email
        await queryInterface.addColumn('lavaderos', 'email_verified', {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
        await queryInterface.addColumn('lavaderos', 'email_verify_token', {
            type: Sequelize.STRING(64),
            allowNull: true,
        });
        await queryInterface.addColumn('lavaderos', 'email_verify_expires', {
            type: Sequelize.DATE,
            allowNull: true,
        });

        // Agregar campos de reset de contraseña
        await queryInterface.addColumn('lavaderos', 'reset_password_token', {
            type: Sequelize.STRING(64),
            allowNull: true,
        });
        await queryInterface.addColumn('lavaderos', 'reset_password_expires', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('ordenes_lavado', 'notas', { type: Sequelize.TEXT, allowNull: true });
        await queryInterface.addColumn('turnos', 'notas', { type: Sequelize.TEXT, allowNull: true });
        await queryInterface.addColumn('clientes', 'notas', { type: Sequelize.TEXT, allowNull: true });

        await queryInterface.removeColumn('lavaderos', 'email_verified');
        await queryInterface.removeColumn('lavaderos', 'email_verify_token');
        await queryInterface.removeColumn('lavaderos', 'email_verify_expires');
        await queryInterface.removeColumn('lavaderos', 'reset_password_token');
        await queryInterface.removeColumn('lavaderos', 'reset_password_expires');
    },
};