'use strict';

const publicoRouter = require('./publico.routes');
const internoRouter = require('./interno.routes');
const adminRouter = require('./admin.routes');
const knowledgeRouter = require('./knowledge.routes');
const aprendizajeRouter = require('./aprendizaje.routes');
const configRouter = require('./config.routes');

function setupChatRoutes(router) {
    router.use('/chat/publico', publicoRouter);
    router.use('/chat/interno', internoRouter);
    router.use('/chat/admin', adminRouter);
    router.use('/chat/knowledge', knowledgeRouter);
    router.use('/chat/aprendizaje', aprendizajeRouter);
    router.use('/chat/config', configRouter);
}

module.exports = setupChatRoutes;
