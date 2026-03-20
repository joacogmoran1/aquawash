// FIX #11: helper automático para queries multi-tenant.
// Uso en cualquier controller: req.tenantWhere({ estado: 'activo' })
// en vez de escribir { lavadero_id: req.lavaderoId, estado: 'activo' } a mano.

function tenantFilter() {
    return (req, _res, next) => {
        req.tenantWhere = (extra = {}) => ({
            lavadero_id: req.lavaderoId,
            ...extra,
        });
        next();
    };
}

module.exports = tenantFilter;