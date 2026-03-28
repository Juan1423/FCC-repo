const fs = require('fs');
const pdf = require('pdf-parse'); 
const { OpenAI } = require('openai');
const { models } = require('../../libs/sequelize');
const sequelize = require('../../libs/sequelize'); 

class KnowledgeService {
    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async ingerirDocumento(file, titulo) {
        const t = await sequelize.transaction();
        
        try {
            console.log(`--> Procesando archivo: ${file.originalname}`);

            // 1. Registrar documento
            const doc = await models.DocumentoConocimiento.create({
                titulo,
                nombre_archivo: file.filename,
                tipo_mime: file.mimetype,
                estado: 'PROCESANDO'
            }, { transaction: t });

            // 2. Extraer texto del PDF
            const dataBuffer = fs.readFileSync(file.path);
            
            // pdf-parse@1.1.1 función simple
            const data = await pdf(dataBuffer); 
            
            const textoLimpio = data.text.replace(/\n/g, " ").replace(/\s+/g, " ");
            
            if (textoLimpio.trim().length < 10) {
                throw new Error("El PDF no contiene texto legible (quizás es una imagen escaneada).");
            }

            // 3. Fragmentar (Chunking)
            const chunks = this.crearChunks(textoLimpio, 800);
            console.log(`--> Texto extraído: ${textoLimpio.length} caracteres. Generando ${chunks.length} vectores...`);

            // 4. Vectorizar y Guardar
            for (const chunk of chunks) {
                if(chunk.length < 50) continue; 

                const response = await this.openai.embeddings.create({
                    model: "text-embedding-3-small",
                    input: chunk,
                });
                const vector = response.data[0].embedding;

                await sequelize.query(
                    `INSERT INTO fcc_ia.ia_segmentos_vector (documento_id, contenido, embedding) 
                     VALUES (:docId, :content, :vec)`,
                    {
                        replacements: { 
                            docId: doc.id, 
                            content: chunk, 
                            vec: `[${vector.join(',')}]` 
                        },
                        transaction: t
                    }
                );
            }

            await doc.update({ estado: 'LISTO' }, { transaction: t });
            await t.commit();
            return { success: true, chunks: chunks.length };

        } catch (error) {
            await t.rollback();
            console.error("Error ingestando doc:", error);
            // marcar como error 
            try { 
                const docError = await models.DocumentoConocimiento.findOne({ where: { nombre_archivo: file.filename }});
                if(docError) await docError.update({ estado: 'ERROR' });
            } catch(e) {}
            
            throw error;
        }
    }

    crearChunks(text, size) {
        const chunks = [];
        for (let i = 0; i < text.length; i += size) {
            chunks.push(text.substring(i, i + size));
        }
        return chunks;
    }
}

module.exports = KnowledgeService;

