import OpenAI from 'openai';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Initialize OpenAI client
// Note: dangerouslyAllowBrowser: true is needed for client-side usage
const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true
});

export async function chatWithAI(userMessage, urlContents) {
    try {
        // Build context from URLs
        let context = '';
        if (urlContents && urlContents.length > 0) {
            context = '\n\nContexto de URLs guardadas:\n\n';
            urlContents.forEach((item, index) => {
                context += `[${index + 1}] ${item.title || item.url}\n`;
                context += `Categoría: ${item.category}\n`;
                context += `Contenido: ${item.content.substring(0, 1000)}...\n\n`;
            });
        }

        const systemPrompt = `Eres un asistente útil que ayuda a los usuarios respondiendo sus preguntas basándote en el contenido de las URLs que han guardado.
${context}
Por favor, proporciona una respuesta clara y concisa. Si encuentras información relevante en las URLs guardadas, menciona cuál URL contiene esa información.`;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage }
            ],
            model: "gpt-4o-mini",
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('Error al comunicarse con OpenAI:', error);
        throw new Error('No se pudo obtener respuesta de la IA. Verifica tu API key.');
    }
}

export async function extractUrlContent(url) {
    try {
        console.log('🔍 Intentando extracción con OpenAI (Stored Prompt)...');
        console.log('📍 URL:', url);

        const response = await openai.responses.create({
            prompt: {
                "id": "pmpt_692bff167cd48196b0ea6c508c201ab90991671e3335329c",
                "version": "4"
            },
            input: [
                {
                    role: "user",
                    content: `URL:\n${url}`
                }
            ],
            text: {
                "format": {
                    "type": "text"
                }
            },
            reasoning: {},
            store: true,
            include: [
                "reasoning.encrypted_content",
                "web_search_call.action.sources"
            ]
        });

        console.log('✨ Respuesta de OpenAI recibida');
        console.log('📦 Response object:', JSON.stringify(response, null, 2));

        // Extract text from response
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

        // Extract domain from URL
        let source = 'Unknown';
        try {
            const urlObj = new URL(url);
            source = urlObj.hostname.replace('www.', '');
        } catch (e) {
            console.warn('Could not parse URL:', e);
        }

        // Extract title from Main Idea
        let title = 'Untitled';
        const mainIdeaMatch = text.match(/1\.\s*Main idea[:\s]*\n?(.+?)(?:\n|$)/i);
        if (mainIdeaMatch && mainIdeaMatch[1]) {
            title = mainIdeaMatch[1].trim().replace(/\[.*?\]\(.*?\)/g, '').substring(0, 60);
        }

        // Extract summary from Key insights
        let summary = '';
        const insightsMatch = text.match(/2\.\s*Key insights[:\s]*\n?([\s\S]+?)(?:\n3\.|$)/i);
        if (insightsMatch && insightsMatch[1]) {
            summary = insightsMatch[1].trim().substring(0, 300);
        }

        // Determine category based on content keywords
        let category = 'Business'; // Default

        const lowerText = text.toLowerCase();
        if (lowerText.includes('seo') || lowerText.includes('search engine') || lowerText.includes('ranking')) {
            category = 'SEO';
        } else if (lowerText.includes('product') || lowerText.includes('feature') || lowerText.includes('user experience')) {
            category = 'Product';
        } else if (lowerText.includes('analysis') || lowerText.includes('data') || lowerText.includes('metric')) {
            category = 'Analysis';
        } else if (lowerText.includes('strategy') || lowerText.includes('strategic')) {
            category = 'Strategy';
        } else if (lowerText.includes('leadership') || lowerText.includes('leader') || lowerText.includes('management')) {
            category = 'Leadership';
        } else if (lowerText.includes('framework') || lowerText.includes('model') || lowerText.includes('methodology')) {
            category = 'Frameworks';
        }

        // Extract tags based on common keywords and topics
        const tags = [];
        const tagKeywords = {
            'AI': [
                'ai', 'artificial intelligence', 'machine learning', 'gpt', 'llm',
                'chatgpt', 'openai', 'neural', 'agents', 'automation with ai'
            ],

            'Product Management': [
                'product manager', 'product management', 'roadmap', 'prioritization',
                'backlog', 'mvp', 'hypothesis', 'validation', 'discovery',
                'user research', 'product thinking', 'strategy', 'feature',
                'pm', 'launch', 'iteration', 'tradeoff'
            ],

            'Data': [
                'data', 'analytics', 'metrics', 'kpi', 'insights', 'dashboards',
                'data-informed', 'decision making', 'experiments', 'ab testing'
            ],

            'Automation & No-Code': [
                'nocode', 'n8n', 'zapier', 'automation', 'workflow', 'automate',
                'make.com', 'scripts', 'bot', 'process automation'
            ],

            'SEO & Growth': [
                'seo', 'keywords', 'search', 'visibility', 'content strategy',
                'growth', 'organic', 'ranking', 'distribution'
            ],

            'Design & UX': [
                'design', 'figma', 'ui', 'ux', 'interface', 'prototyping',
                'wireframe', 'user flow', 'experience', 'design thinking'
            ],

            'Development': [
                'code', 'developer', 'software', 'engineering', 'frontend',
                'backend', 'javascript', 'api'
            ],

            'Philosophy & Mindset': [
                'mindset', 'philosophy', 'reflection', 'meaning', 'deep work',
                'thinking', 'purpose', 'values', 'mental models'
            ],

            'Productivity': [
                'productivity', 'efficiency', 'workflow', 'time management',
                'habits', 'focus', 'systems'
            ],

            'Teams & Leadership': [
                'team', 'collaboration', 'communication', 'culture', 'leadership',
                'alignment', 'ownership', 'accountability'
            ],

            'Customer & Users': [
                'customer', 'users', 'client', 'feedback', 'pain points',
                'user needs', 'interviews'
            ]
        };


        for (const [tag, keywords] of Object.entries(tagKeywords)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                tags.push(tag);
                if (tags.length >= 2) break;
            }
        }

        // If no tags found, add category as tag
        if (tags.length === 0) {
            tags.push(category);
        }

        const extractedData = {
            title: title,
            summary: summary || text.substring(0, 300),
            content: text,
            category: category,
            tags: tags,
            url: url,
            source: source,
            timestamp: new Date()
        };

        console.log('✅ Datos extraídos:', {
            title: extractedData.title,
            category: extractedData.category,
            tags: extractedData.tags,
            source: extractedData.source
        });

        return extractedData;

    } catch (error) {
        console.error('❌ Error OpenAI:', error);
        throw new Error('No se pudo procesar la URL con OpenAI: ' + error.message);
    }
}
