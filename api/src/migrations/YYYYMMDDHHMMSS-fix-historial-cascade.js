'use strict';

module.exports = {
    async up(queryInterface) {
        // Eliminar la FK existente y recrearla con CASCADE
        await queryInterface.removeConstraint(
            'historial_servicios',
            'historial_servicios_cliente_id_fkey'
        );
        await queryInterface.addConstraint('historial_servicios', {
            fields: ['cliente_id'],
            type: 'foreign key',
            name: 'historial_servicios_cliente_id_fkey',
            references: { table: 'clientes', field: 'id' },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        });
    },

    async down(queryInterface) {
        await queryInterface.removeConstraint(
            'historial_servicios',
            'historial_servicios_cliente_id_fkey'
        );
        await queryInterface.addConstraint('historial_servicios', {
            fields: ['cliente_id'],
            type: 'foreign key',
            name: 'historial_servicios_cliente_id_fkey',
            references: { table: 'clientes', field: 'id' },
            onDelete: 'NO ACTION',
        });
    },
};