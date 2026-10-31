const { models } = require('../../libs/sequelize');
const bcrypt = require('bcrypt');
const { signAuthToken } = require('../../utils/jwt.util');
const saltRounds = 10;
require('dotenv').config();

class UsuarioService  {

    constructor() {}

    toSafeUser(user) {
        if (!user) return null;
        const plain = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
        delete plain.password_usuario;
        return plain;
    }

    async find() {
        const res = await models.Usuario.findAll();
        return res.map((user) => this.toSafeUser(user));
    }
    async encryptPassword(password) {
        const newpassword = bcrypt.hashSync(password, saltRounds);
        return newpassword;
    }

    async findOne(id) {
        const res = await models.Usuario.findByPk(id);
        return res;
    }

    async findOneWithPassword(id) {
        return models.Usuario.scope('withPassword').findByPk(id);
    }

    async login(correo, password) {
        const user = await models.Usuario.scope('withPassword').findOne({
            where: {
                correo_usuario: correo
            }
        });
        if (!user) {
            return { success: false, message: 'Credenciales incorrectas' };
        }

        const match = await bcrypt.compare(password, user.password_usuario);
        if (!match) {
            return { success: false, message: 'Credenciales incorrectas' };
        }

        if (user.estado_usuario === false) {
            return { success: false, message: 'El usuario se encuentra deshabilitado. Contacte al administrador.' };
        }

        const token = signAuthToken({ user: user.id_usuario, rol: user.rol_usuario });
        return { success: true, data: this.toSafeUser(user), token: token };
    }

    async create(data) {
        const res = await models.Usuario.create(data);
        return this.toSafeUser(res);
    }
    async update(id, data) {
        const model = await this.findOne(id);
        const res = await model.update(data);
        return this.toSafeUser(res);
    }
    async delete(id) {
        const model = await this.findOne(id);
        await model.destroy();
        return { deleted: true };
    }

    async changePassword(id, oldPassword, newPassword) {
        const user = await this.findOneWithPassword(id);
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