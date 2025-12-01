// src/services/openai.js
import OpenAI from 'openai';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Initialize OpenAI client (browser usage)
const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true,
});

/**
 * Chat with the AI using stored URL contents.
 */
export async function chatWithAI(userMessage, urlContents) {
    try {
        // Build context from URLs
        let context = '';
        if (urlContents && urlContents.length > 0) {
            context = '\n\nContexto de URLs guardadas:\n\n';
            urlContents.forEach((item, index) => {
                context += `[${index}] ${item.title || item.url}\n`;
                context += `Categoría: ${item.category}\n`;
                context += `Contenido: ${item.content.substring(0, 5000)}...\n\n`;
            });
        }

        const systemPrompt = `Eres un asistente útil que ayuda a los usuarios respondiendo sus preguntas basándote ÚNICAMENTE en el contenido de las URLs que han guardado.\n${context}\nInstrucciones estrictas:\n1. Responde SOLO usando la información proporcionada en el contexto de las URLs arriba.\n2. Puedes y DEBES interpretar la intención del usuario y conectar conceptos relacionados (por ejemplo: si el usuario pregunta por "link building" y tienes contenido sobre "internal linking", DEBES usar esa información).\n3. Si la respuesta no se encuentra en el contexto ni siquiera por asociación de conceptos, di "Lo siento, no encuentro información sobre eso en tus enlaces guardados."\n4. No uses tu conocimiento general para agregar datos externos que no estén en el texto.\n5. Responde SIEMPRE en formato JSON con la siguiente estructura:\n{\n  "answer": "Tu respuesta aquí... (usa markdown para formato)",\n  "sources": [0, 2] // Array de índices de las URLs utilizadas\n}\nSi no usas ninguna URL, el array sources debe estar vacío.`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            response_format: { type: 'json_object' },
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Error al comunicarse con OpenAI:', error);
        throw new Error('No se pudo obtener respuesta de la IA. Verifica tu API key.');
    }
}

/**
 * Extract content from a URL using a stored Gemini prompt (via OpenAI responses API).
 */
export async function extractUrlContent(url) {
    try {
        console.log('🔍 Intentando extracción con OpenAI (Stored Prompt)...');
        console.log('📍 URL:', url);

        const response = await openai.responses.create({
            prompt: {
                id: 'pmpt_692bff167cd48196b0ea6c508c201ab90991671e3335329c',
                version: '4',
            },
            input: [{ role: 'user', content: `URL:\n${url}` }],
            text: { format: { type: 'text' } },
            reasoning: {},
            store: true,
            include: ['reasoning.encrypted_content', 'web_search_call.action.sources'],
        });

        console.log('✨ Respuesta de OpenAI recibida');
        console.log('📦 Response object:', JSON.stringify(response, null, 2));

        // Extract raw text from the response
        let text = '';
        if (response.output_text) {
            text = response.output_text;
        } else if (typeof response.output === 'string') {
            text = response.output;
        } else if (response.output && response.output.content) {
            text = response.output.content;
        } else if (response.choices && response.choices[0]?.message?.content) {
            text = response.choices[0].message.content;
        } else {
            console.warn('Estructura de respuesta desconocida:', response);
            text = JSON.stringify(response);
        }
        text = String(text || '');

        // Extract domain source
        let source = 'Unknown';
        try {
            const urlObj = new URL(url);
            source = urlObj.hostname.replace('www.', '');
        } catch (e) {
            console.warn('Could not parse URL:', e);
        }

        // Extract title (first main idea)
        let title = 'Untitled';
        const mainIdeaMatch = text.match(/1\.\s*Main idea[:\s]*\n?(.+?)(?:\n|$)/i);
        if (mainIdeaMatch && mainIdeaMatch[1]) {
            title = mainIdeaMatch[1].trim().replace(/\[.*?\]\(.*?\)/g, '').substring(0, 60);
        }

        // Extract summary (key insights)
        let summary = '';
        const keyInsightsMatch = text.match(/2\.\s*Key insights[:\s]*\n?([\s\S]+?)(?:\n\n|\n\d+\.\s|$)/i);
        if (keyInsightsMatch && keyInsightsMatch[1]) {
            summary = keyInsightsMatch[1].trim();
        }

        // --- Category classification using AI ---
        let category = 'Business'; // fallback
        try {
            const catResp = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'Eres un clasificador. Dada la siguiente pieza de texto, devuelve un JSON con un solo campo "category" que sea uno de los siguientes: SEO, Product, Analysis, Strategy, Leadership, Frameworks, Business.',
                    },
                    { role: 'user', content: text.slice(0, 3000) },
                ],
                response_format: { type: 'json_object' },
            });
            const parsed = JSON.parse(catResp.choices[0].message.content);
            if (parsed && parsed.category) category = parsed.category;
        } catch (e) {
            console.warn('AI categorization failed, using fallback:', e);
        }

        // Tag extraction based on predefined keywords
        const tagKeywords = {
            AI: ['ai', 'artificial intelligence', 'machine learning', 'gpt', 'llm', 'chatgpt', 'openai', 'neural', 'agents', 'automation with ai'],
            'Product Management': ['product manager', 'product management', 'roadmap', 'prioritization', 'backlog', 'mvp', 'hypothesis', 'validation', 'discovery', 'user research', 'product thinking', 'strategy', 'feature', 'pm', 'launch', 'iteration', 'tradeoff'],
            Data: ['data', 'analytics', 'metrics', 'kpi', 'insights', 'dashboards', 'data-informed', 'decision making', 'experiments', 'ab testing'],
            'Automation & No-Code': ['nocode', 'n8n', 'zapier', 'automation', 'workflow', 'automate', 'make.com', 'scripts', 'bot', 'process automation'],
            'SEO & Growth': ['seo', 'keywords', 'search', 'visibility', 'content strategy', 'growth', 'organic', 'ranking', 'distribution'],
            'Design & UX': ['design', 'figma', 'ui', 'ux', 'interface', 'prototyping', 'wireframe', 'user flow', 'experience', 'design thinking'],
            Development: ['code', 'developer', 'software', 'engineering', 'frontend', 'backend', 'javascript', 'api'],
            'Philosophy & Mindset': ['mindset', 'philosophy', 'reflection', 'meaning', 'deep work', 'thinking', 'purpose', 'values', 'mental models'],
            Productivity: ['productivity', 'efficiency', 'workflow', 'time management', 'habits', 'focus', 'systems'],
            'Teams & Leadership': ['team', 'collaboration', 'communication', 'culture', 'leadership', 'alignment', 'ownership', 'accountability'],
            'Customer & Users': ['customer', 'users', 'client', 'feedback', 'pain points', 'user needs', 'interviews'],
        };
        const lowerText = text.toLowerCase();
        const tags = [];
        for (const [tag, keywords] of Object.entries(tagKeywords)) {
            if (keywords.some((kw) => lowerText.includes(kw))) {
                tags.push(tag);
                if (tags.length >= 2) break;
            }
        }
        if (tags.length === 0) tags.push(category);

        const extractedData = {
            title,
            summary: summary || text.substring(0, 300),
            content: text,
            category,
            tags,
            url,
            source,
            timestamp: new Date(),
        };

        console.log('✅ Datos extraídos:', {
            title: extractedData.title,
            category: extractedData.category,
            tags: extractedData.tags,
            source: extractedData.source,
        });

        return extractedData;
    } catch (error) {
        console.error('❌ Error OpenAI:', error);
        throw new Error('No se pudo procesar la URL con OpenAI: ' + error.message);
    }
}
