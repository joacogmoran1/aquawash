const dashboardService = require('../services/dashboardService');

async function getDashboard(req, res, next) {
	try {
		const data = await dashboardService.getDashboard(req.lavaderoId);
		res.json(data);
	} catch (err) { next(err); }
}

async function getSemana(req, res, next) {
	try {
		const data = await dashboardService.getSemana(req.lavaderoId);
		res.json(data);
	} catch (err) { next(err); }
}

module.exports = { getDashboard, getSemana };
