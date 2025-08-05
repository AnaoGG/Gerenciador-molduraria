
import { GoogleGenAI } from "@google/genai";
import type { Material } from '../types';

export const generateDescription = async (
    width: number, 
    height: number, 
    selectedMaterials: { material: Material; quantity: number }[]
): Promise<string> => {
    
    if (!process.env.API_KEY) {
        // This is a fallback for development if the API key is not set.
        // In a real deployed environment, this would ideally throw an error or be handled differently.
        console.warn("API_KEY environment variable not set. Returning a mock description.");
        return `Peça personalizada de ${width}x${height} cm. Uma bela adição para qualquer ambiente.`;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Não foi possível gerar a descrição. Por favor, escreva manualmente.";
    }
};
