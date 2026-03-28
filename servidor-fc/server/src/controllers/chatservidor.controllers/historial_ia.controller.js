const { Op } = require('sequelize');
const { models } = require('../../libs/sequelize');

const buildFilters = (query) => {
  const {
    usuarioId,
    sessionId,
    search,
    desde,
    hasta
  } = query;

  const where = {};

  if (usuarioId) {
    where.usuario_id = usuarioId;
  }

  if (sessionId) {
    where.session_id = sessionId;
  }

  if (search) {
    where[Op.or] = [
      { input_usuario: { [Op.iLike]: `%${search}%` } },
      { output_ia: { [Op.iLike]: `%${search}%` } }
    ];
  }

  if (desde || hasta) {
    where.createdAt = {};
    if (desde) {
      where.createdAt[Op.gte] = new Date(desde);
    }
    if (hasta) {
      where.createdAt[Op.lte] = new Date(hasta);
    }
  }

  return where;
};

const listarHistorial = async (req, res) => {
  try {
    const {
      limit = 50,
      offset = 0
    } = req.query;

    const where = buildFilters(req.query);

    const safeLimit = Math.min(parseInt(limit, 10) || 50, 200);
    const safeOffset = parseInt(offset, 10) || 0;

    const { rows, count } = await models.HistorialIA.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: safeLimit,
      offset: safeOffset
    });

    res.json({
      success: true,
      data: rows,
      meta: {
        total: count,
        limit: safeLimit,
        offset: safeOffset
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value).replace(/"/g, '""');
  return `"${stringValue}"`;
};

const exportarHistorial = async (req, res) => {
  try {
    const { format = 'csv', limit = 1000 } = req.query;
    const where = buildFilters(req.query);

    const safeLimit = Math.min(parseInt(limit, 10) || 1000, 5000);

    const rows = await models.HistorialIA.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: safeLimit
    });

    if (format !== 'csv') {
      return res.json({ success: true, data: rows });
    }

    const header = [
      'fecha',
      'usuario_id',
      'session_id',
      'pregunta',
      'respuesta',
      'documentos'
    ];

    const lines = rows.map((row) => ([
      row.createdAt ? row.createdAt.toISOString() : '',
      row.usuario_id || '',
      row.session_id || '',
      row.input_usuario || '',
      row.output_ia || '',
      row.contexto_fuente || ''
    ]));

    const csv = [
      header.map(toCsvValue).join(','),
      ...lines.map((line) => line.map(toCsvValue).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="historial_ia_${Date.now()}.csv"`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { listarHistorial, exportarHistorial };