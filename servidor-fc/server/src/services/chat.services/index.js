'use strict';

const RAGService = require('./rag.service');
const GuardrailsService = require('./guardrails.service');
const LearningService = require('./learning.service');
const OpenAIService = require('./openai.service');
const KnowledgeService = require('./knowledge.service');
const PromptsService = require('./prompts.service');
const ConversationsService = require('./conversations.service');
const ConfigService = require('./config.service');

const ragService = new RAGService();
const guardrailsService = new GuardrailsService();
const learningService = new LearningService(ragService);
const openaiService = new OpenAIService();

openaiService.setDependencies({
    ragService,
    guardrailsService,
    learningService,
});

const knowledgeService = new KnowledgeService(ragService);
const promptsService = new PromptsService();
const conversationsService = new ConversationsService();
const configService = new ConfigService();

module.exports = {
    ragService,
    guardrailsService,
    learningService,
    openaiService,
    knowledgeService,
    promptsService,
    conversationsService,
    configService,
};
