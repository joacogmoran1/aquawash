// YYYYMMDDHHMMSS-move-auth-fields-to-usuarios.js
'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Agregar columnas de auth a usuarios
        await queryInterface.addColumn('usuarios', 'email_verified', {
            type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false,
        });
        await queryInterface.addColumn('usuarios', 'email_verify_token', {
            type: Sequelize.STRING(64), allowNull: true,
        });
        await queryInterface.addColumn('usuarios', 'email_verify_expires', {
            type: Sequelize.DATE, allowNull: true,
        });
        await queryInterface.addColumn('usuarios', 'reset_password_token', {
            type: Sequelize.STRING(64), allowNull: true,
        });
        await queryInterface.addColumn('usuarios', 'reset_password_expires', {
            type: Sequelize.DATE, allowNull: true,
        });

        // Marcar owners existentes como verificados para no romper cuentas actuales
        await queryInterface.sequelize.query(`
			UPDATE usuarios SET email_verified = true WHERE rol = 'owner'
		`);

        // Quitar columnas de auth de lavaderos
        await queryInterface.removeColumn('lavaderos', 'password_hash');
        await queryInterface.removeColumn('lavaderos', 'email_verified');
        await queryInterface.removeColumn('lavaderos', 'email_verify_token');
        await queryInterface.removeColumn('lavaderos', 'email_verify_expires');
        await queryInterface.removeColumn('lavaderos', 'reset_password_token');
        await queryInterface.removeColumn('lavaderos', 'reset_password_expires');
    },

    async down(queryInterface, Sequelize) {
        // Revertir: devolver columnas a lavaderos
        await queryInterface.addColumn('lavaderos', 'password_hash', {
            type: Sequelize.STRING, allowNull: false, defaultValue: '',
        });
        await queryInterface.addColumn('lavaderos', 'email_verified', {
            type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false,
        });
        await queryInterface.addColumn('lavaderos', 'email_verify_token', {
            type: Sequelize.STRING(64), allowNull: true,
        });
        await queryInterface.addColumn('lavaderos', 'email_verify_expires', {
            type: Sequelize.DATE, allowNull: true,
        });
        await queryInterface.addColumn('lavaderos', 'reset_password_token', {
            type: Sequelize.STRING(64), allowNull: true,
        });
        await queryInterface.addColumn('lavaderos', 'reset_password_expires', {
            type: Sequelize.DATE, allowNull: true,
        });

        // Quitar columnas de usuarios
        await queryInterface.removeColumn('usuarios', 'email_verified');
        await queryInterface.removeColumn('usuarios', 'email_verify_token');
        await queryInterface.removeColumn('usuarios', 'email_verify_expires');
        await queryInterface.removeColumn('usuarios', 'reset_password_token');
        await queryInterface.removeColumn('usuarios', 'reset_password_expires');
    },
};