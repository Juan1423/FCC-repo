'use strict';

const RAGService = require('./rag.service');
const GuardrailsService = require('./guardrails.service');
const LearningService = require('./learning.service');
const OpenAIService = require('./openai.service');
const KnowledgeService = require('./knowledge.service');
const PromptsService = require('./prompts.service');
const ConversationsService = require('./conversations.service');
const ConfigService = require('./config.service');
const RagMonitorService = require('./ragMonitor.service');

const ragService = new RAGService();
const guardrailsService = new GuardrailsService();
const learningService = new LearningService(ragService);
const configService = new ConfigService();
const openaiService = new OpenAIService();
const ragMonitorService = new RagMonitorService();
const conversationsService = new ConversationsService();

ragService.configLoader = async () => configService.getConfig();

openaiService.setDependencies({
    ragService,
    guardrailsService,
    learningService,
    configService,
    ragMonitorService,
    conversationsService,
});

const knowledgeService = new KnowledgeService(ragService);
const promptsService = new PromptsService();

module.exports = {
    ragService,
    guardrailsService,
    learningService,
    openaiService,
    knowledgeService,
    promptsService,
    conversationsService,
    configService,
    ragMonitorService,
};
