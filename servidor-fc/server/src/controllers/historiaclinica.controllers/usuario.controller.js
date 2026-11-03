const UsuarioService = require('../../services/historiaclinica.services/usuario.service');
const { AUTH_COOKIE_NAME } = require('../../middleware/verifyToken');
const { JWT_EXPIRES_IN_MS } = require('../../utils/jwt.util');
const { validatePayload, ValidationError } = require('../../utils/security.utils');
const service = new UsuarioService();

const ROLES_VALIDOS = ['admin', 'personal_salud', 'doctor', 'personal_administrativo'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// M-07/M-10: listas blancas por operación. Nunca se pasa req.body completo.
const CREATE_SCHEMA = {
    nombre_usuario: { type: 'string', maxLength: 250 },
    apellido_usuario: { type: 'string', maxLength: 250 },
    correo_usuario: { type: 'string', maxLength: 250, pattern: EMAIL_PATTERN },
    password_usuario: { type: 'string', required: true, minLength: 6, maxLength: 250 },
    rol_usuario: { type: 'string', enum: ROLES_VALIDOS },
    estado_usuario: { type: 'boolean' },
    id_personal_salud: { type: 'integer', min: 1, nullable: true },
};

const SELF_UPDATE_SCHEMA = {
    nombre_usuario: { type: 'string', maxLength: 250 },
    apellido_usuario: { type: 'string', maxLength: 250 },
    correo_usuario: { type: 'string', maxLength: 250, pattern: EMAIL_PATTERN },
};

const ADMIN_UPDATE_SCHEMA = {
    ...SELF_UPDATE_SCHEMA,
    rol_usuario: { type: 'string', enum: ROLES_VALIDOS },
    estado_usuario: { type: 'boolean' },
    id_personal_salud: { type: 'integer', min: 1, nullable: true },
};

const LOGIN_SCHEMA = {
    correo_usuario: { type: 'string', required: true, minLength: 3, maxLength: 250 },
    password_usuario: { type: 'string', required: true, minLength: 1, maxLength: 250 },
};

const CHANGE_PASSWORD_SCHEMA = {
    oldPassword: { type: 'string', required: true, minLength: 1, maxLength: 250 },
    newPassword: { type: 'string', required: true, minLength: 8, maxLength: 250 },
};

const isAdmin = (req) => {
    const rol = String(req.user?.rol || '').toLowerCase();
    return rol === 'admin' || rol === 'administrador';
};

const COOKIE_SAME_SITE = (process.env.COOKIE_SAME_SITE || 'lax').toLowerCase();

const COOKIE_OPTIONS = {
    httpOnly: true,
    // SameSite=None exige Secure=true o el navegador descarta la cookie.
    secure: COOKIE_SAME_SITE === 'none' || process.env.NODE_ENV === 'production',
    sameSite: COOKIE_SAME_SITE,
    path: '/',
};

const create = async ( req, res ) => {
    try {
        const data = validatePayload(req.body, CREATE_SCHEMA);
        data.password_usuario = await service.encryptPassword(data.password_usuario);

        const response = await service.create(data);
        res.json({ success: true, data: response});
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('Error creando usuario:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const login = async ( req, res ) => {
    try {
        const { correo_usuario, password_usuario } = validatePayload(req.body, LOGIN_SCHEMA);
        const response = await service.login(correo_usuario, password_usuario);

        if (response.success && response.token) {
            res.cookie(AUTH_COOKIE_NAME, response.token, {
                ...COOKIE_OPTIONS,
                maxAge: JWT_EXPIRES_IN_MS,
            });
            return res.json(response);
        }

        return res.status(401).json(response);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('Error en login:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
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
        console.error('Error listando usuarios:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const getById = async ( req, res ) => {
    try {
        const { id } = req.params;
        const response = await service.findOne(id);
        res.json(response);
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params;
        const schema = isAdmin(req) ? ADMIN_UPDATE_SCHEMA : SELF_UPDATE_SCHEMA;
        const body = validatePayload(req.body, schema);
        const response = await service.update(id,body);
        res.json(response);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error('Error actualizando usuario:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const _delete = async (req, res) => {
    try {
        const { id } = req.params; 
        const response = await service.delete(id);
        res.json(response);
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).send({ success: false, message: 'Error interno del servidor' });
    }
}

const changePassword = async (req, res, next) => {
    try {
        const { user } = req.user;
        const { oldPassword, newPassword } = validatePayload(req.body, CHANGE_PASSWORD_SCHEMA);
        const result = await service.changePassword(user, oldPassword, newPassword);
        res.json(result);
    } catch (error) {
        if (error instanceof ValidationError) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

module.exports = {
    create, get, getById, update, _delete, login, logout, changePassword
};


