const { models } = require('../../libs/sequelize');

const createFeedback = async (req, res) => {
  try {
    const { id_conversacion, calificacion, comentario } = req.body;
    const id_usuario = req.user.user;

    const feedback = await models.FeedbackUsuario.create({
      id_conversacion,
      id_usuario,
      calificacion,
      comentario
    });

    res.json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createFeedback };