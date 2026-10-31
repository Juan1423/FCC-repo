const UsuarioService = require('../../services/historiaclinica.services/usuario.service');
const { AUTH_COOKIE_NAME } = require('../../middleware/verifyToken');
const service = new UsuarioService();

const ROLES_VALIDOS = ['admin', 'personal_salud', 'doctor', 'personal_administrativo'];

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    path: '/',
};

const create = async ( req, res ) => {
    try {
        if (req.body.rol_usuario && !ROLES_VALIDOS.includes(req.body.rol_usuario)) {
            return res.status(400).json({ success: false, message: 'Rol inválido' });
        }

        req.body.password_usuario = await service.encryptPassword(req.body.password_usuario);

        const response = await service.create(req.body);
        res.json({ success: true, data: response});
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const login = async ( req, res ) => {
    try {
        const { correo_usuario, password_usuario } = req.body;
        const response = await service.login(correo_usuario, password_usuario);

        if (response.success && response.token) {
            res.cookie(AUTH_COOKIE_NAME, response.token, {
                ...COOKIE_OPTIONS,
                maxAge: 2 * 60 * 60 * 1000,
            });
            return res.json(response);
        }

        return res.status(401).json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const logout = async (req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, COOKIE_OPTIONS);
    res.json({ success: true, message: 'Sesión cerrada' });
};

const get = async ( req, res ) => {
    try {
        const response = await service.find();
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const getById = async ( req, res ) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const response = await service.update(id,body);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const _delete = async (req, res) => {
    try {
        const { id } = req.params; 
        const response = await service.delete(id);
        res.json(response);
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const changePassword = async (req, res, next) => {
    try {
        const { user } = req.user;
        const { oldPassword, newPassword } = req.body;
        const result = await service.changePassword(user, oldPassword, newPassword);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    create, get, getById, update, _delete, login, logout, changePassword
};


