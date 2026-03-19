const jwt = require('jsonwebtoken');
const { Lavadero } = require('../models');

async function authenticate(req, res, next) {
	try {
		const header = req.headers.authorization;
		if (!header?.startsWith('Bearer ')) {
			return res.status(401).json({ error: 'No autorizado.' });
		}

		const token = header.split(' ')[1];

		let payload;
		try {
			payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'washly' });
		} catch (err) {
			// No revelar si es "expirado" o "inválido" (información de más)
			return res.status(401).json({ error: 'No autorizado.' });
		}

		const lavadero = await Lavadero.findByPk(payload.lavaderoId);
		if (!lavadero) {
			return res.status(401).json({ error: 'No autorizado.' });
		}

		req.lavaderoId = lavadero.id;
		req.lavadero = lavadero;
		next();
	} catch (err) {
		// Error interno → no filtrar detalles
		return res.status(401).json({ error: 'No autorizado.' });
	}
}

module.exports = authenticate;
