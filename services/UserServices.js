const createToken = require('../authentication/createToken');
const { User, sequelize } = require('../models');
const { messages, status } = require('../utils');

const registerUser = async (info) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const newUser = await User.create({ ...info }, { transaction: t });

      const { password, ...userWithoutPassword } = newUser.dataValues;

      const token = createToken(userWithoutPassword);

      return { status: status.CREATED, token };
    });
    return result;
  } catch (err) {
    const validatorError = err.errors[0].validatorKey;
    if (validatorError === 'not_unique') return { status: status.CONFLICT, message: messages.USER_EXISTS };
    return { status: status.INTERNAL_ERROR, message: messages.SMT_WRONG };
  }
};

const findAllUsers = async () => {
  const allUsers = await User.findAll({
    attributes: { exclude: ['password'] },
  });

  return { status: status.OK, message: allUsers };
};

const findUser = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });

  if (user === null) return { status: status.NOT_FOUND, message: messages.NOT_FOUND_USER };

  return { status: status.OK, user };
};

const destroyUser = async (email) => {
  await User.destroy({ where: { email } });

  return { status: status.NO_CONTENT };
};

module.exports = {
  registerUser,
  findAllUsers,
  findUser,
  destroyUser,
};
