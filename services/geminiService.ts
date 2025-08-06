// services/geminiService.ts

import { GoogleGenAI } from "@google/genai";
import type { Material } from '../types';

export const generateDescription = async (
    width: number, 
    height: number, 
    selectedMaterials: { material: Material; quantity: number }[]
): Promise<string> => {
    
    // NOTA: A Vercel não usa process.env diretamente no frontend.
    // A configuração no vite.config.ts com 'process.env.GEMINI_API_KEY'
    // torna a chave disponível. Vamos usar isso.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("Chave da API Gemini não configurada. Retornando descrição padrão.");
        return `Peça personalizada de ${width}x${height} cm. Uma bela adição para qualquer ambiente.`;
    }

    const ai = new GoogleGenAI({ apiKey });

    const materialDetails = selectedMaterials
        .map(({ material }) => `- ${material.category}: ${material.name}`)
        .join('\n');

    const prompt = `
        Gere uma descrição de produto curta, elegante e profissional para um item de molduraria personalizado.
        A descrição deve ser em Português do Brasil.
        Seja conciso, usando no máximo 2-3 frases.
        
        Detalhes do Item:
        - Dimensões: ${width} cm x ${height} cm
        - Materiais utilizados:
        ${materialDetails}
        
        Exemplo de saída: "Obra de arte personalizada medindo ${width}x${height} cm, com uma elegante moldura de ${selectedMaterials.find(m => m.material.category === 'Moldura')?.material.name || 'alta qualidade'}. Protegida por vidro ${selectedMaterials.find(m => m.material.category === 'Vidro')?.material.name || 'cristalino'} e com um acabamento impecável."

        Use os materiais fornecidos para criar uma descrição atraente.
    `;

    try {
        const result = await ai.models.generateContent({
            // Nota: o nome do modelo pode ter sido atualizado, verifique a documentação se houver erro.
            model: "gemini-1.5-flash", // Usando um modelo padrão mais recente.
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const response = result.response;

        // <-- ESTA É A CORREÇÃO PARA O ERRO DO TYPESCRIPT -->
        // Verificamos se a resposta e a propriedade text existem antes de usar.
        if (response && typeof response.text === 'function') {
            const text = response.text();
            return text.trim();
        } else {
            console.error("A resposta da API Gemini não continha o formato esperado (response.text is not a function).");
            return "Não foi possível gerar a descrição. Por favor, escreva manualmente.";
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Não foi possível gerar a descrição. Por favor, escreva manualmente.";
    }
};