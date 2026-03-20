const jwt = require('jsonwebtoken');
const { Usuario, Lavadero } = require('../models');

async function authenticate(req, res, next) {
	try {
		const header = req.headers.authorization;
		if (!header?.startsWith('Bearer '))
			return res.status(401).json({ error: 'No autorizado.' });

		const token = header.split(' ')[1];

		let payload;
		try {
			payload = jwt.verify(token, process.env.JWT_SECRET, { issuer: 'washly' });
		} catch {
			return res.status(401).json({ error: 'No autorizado.' });
		}

		const usuario = await Usuario.findByPk(payload.usuarioId);
		if (!usuario || !usuario.activo)
			return res.status(401).json({ error: 'No autorizado.' });

		const lavadero = await Lavadero.findByPk(usuario.lavadero_id);
		if (!lavadero)
			return res.status(401).json({ error: 'No autorizado.' });

		req.usuario = usuario;
		req.lavaderoId = usuario.lavadero_id;
		req.lavadero = lavadero;
		req.rol = usuario.rol;
		next();
	} catch {
		return res.status(401).json({ error: 'No autorizado.' });
	}
}

module.exports = authenticate;