'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('clientes', 'dni', {
            type: Sequelize.STRING(20),
            allowNull: true,
        });

        // Unique por lavadero: dos clientes distintos pueden tener el mismo DNI
        // en lavaderos distintos, pero no en el mismo.
        await queryInterface.addIndex('clientes', ['lavadero_id', 'dni'], {
            unique: true,
            name: 'clientes_lavadero_dni_unique',
            where: { dni: { [Sequelize.Op.ne]: null } },
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex('clientes', 'clientes_lavadero_dni_unique');
        await queryInterface.removeColumn('clientes', 'dni');
    },
};