'use strict';

module.exports = {
    async up(queryInterface) {
        // Eliminar notas de las tres tablas
        await queryInterface.removeColumn('ordenes_lavado', 'notas');
        await queryInterface.removeColumn('turnos', 'notas');
        await queryInterface.removeColumn('clientes', 'notas');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn('ordenes_lavado', 'notas', {
            type: Sequelize.TEXT, allowNull: true,
        });
        await queryInterface.addColumn('turnos', 'notas', {
            type: Sequelize.TEXT, allowNull: true,
        });
        await queryInterface.addColumn('clientes', 'notas', {
            type: Sequelize.TEXT, allowNull: true,
        });
    },
};
