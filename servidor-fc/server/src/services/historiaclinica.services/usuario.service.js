const { models } = require('../../libs/sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

class UsuarioService  {

    constructor() {}

    async find() {
        const res = await models.Usuario.findAll();
        return res;
    }
    async encryptPassword(password) {
        console.log('password', password);
        const newpassword = bcrypt.hashSync(password, saltRounds);
        return newpassword;
    }

    async findOne(id) {
        const res = await models.Usuario.findByPk(id);
        return res;
    }

    async login(correo, password) {
        const user = await models.Usuario.findOne({
            where: {
                correo_usuario: correo
            }
        });
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const match = await bcrypt.compare(password, user.password_usuario);
        if (!match) {
            return { success: false, message: 'Contraseña incorrecta' };
        }
        const token = jwt.sign({ user: user.id_usuario, rol:user.rol_usuario }, JWT_SECRET, {
            expiresIn: "23h",
          });
        return { success: true, data: user, token: token };
    }

    async create(data) {
        const res = await models.Usuario.create(data);
        return res;
    }
    async update(id, data) {
        const model = await this.findOne(id);
        const res = await model.update(data);
        return res;
    }
    async delete(id) {
        const model = await this.findOne(id);
        await model.destroy();
        return { deleted: true };
    }

    async changePassword(id, oldPassword, newPassword) {
        const user = await this.findOne(id);
        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        const match = await bcrypt.compare(oldPassword, user.password_usuario);
        if (!match) {
            return { success: false, message: 'Contraseña incorrecta' };
        }

        const hashedPassword = await this.encryptPassword(newPassword);
        await this.update(id, { password_usuario: hashedPassword });

        return { success: true, message: 'Contraseña actualizada correctamente' };
    }
}

module.exports = UsuarioService;