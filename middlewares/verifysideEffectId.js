const  SideEffects  = require("../models/models_chimio/SideEffects");

module.exports = async (req, res, next, id) => {
  try {
    const sideEffect = await SideEffects.findByPk(id);
    req.sideEffect = await sideEffect;
    console.log(req.sideEffect);
    next();
  } catch (error) {
    console.log(error);
    res.status(404).send({ error: error.message });
  }
};