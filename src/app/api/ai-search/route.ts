import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AzureOpenAI } from 'openai';

const systemPrompt = `
Eres un asistente de reclutamiento inteligente para la plataforma recruIT.
Tu objetivo es ayudar a los reclutadores a encontrar candidatos idóneos en la base de datos.
Puedes buscar candidatos por habilidades, perfil, tecnologías, seniority, etc., utilizando la herramienta 'search_candidates'.
Cuando te pidan buscar, analiza la consulta del usuario, extrae los filtros relevantes (ej: tecnologías a un arreglo de 'skills', seniority, etc.) y llama a la herramienta.
Con los resultados que te devuelva la herramienta, preséntalos al usuario de manera profesional y estructurada (en formato Markdown), incluyendo enlaces a sus perfiles.
El enlace a un perfil debe ser en formato Markdown: [Nombre Apellido](/candidates/ID).
Si no encuentras candidatos, indícalo amablemente y sugiere cambiar los filtros.
Si el usuario hace preguntas generales, respóndelas cortésmente.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const branding = await prisma.companyBranding.findFirst();
    if (!branding?.aiEnabled || !branding.azureOpenAiEndpoint || !branding.azureOpenAiApiKey || !branding.azureOpenAiDeploymentName) {
      return NextResponse.json({ error: 'La IA no está configurada o está deshabilitada.' }, { status: 500 });
    }

    const client = new AzureOpenAI({
      endpoint: branding.azureOpenAiEndpoint,
      apiKey: branding.azureOpenAiApiKey,
      deployment: branding.azureOpenAiDeploymentName,
      apiVersion: '2024-02-15-preview',
    });

    // Ensure system prompt is the first message
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const tools = [
      {
        type: "function" as const,
        function: {
          name: "search_candidates",
          description: "Busca candidatos en la base de datos basándose en criterios específicos.",
          parameters: {
            type: "object",
            properties: {
              skills: {
                type: "array",
                items: { type: "string" },
                description: "Lista de habilidades o tecnologías (ej: ['React', 'Node.js', 'Python']).",
              },
              seniority: {
                type: "string",
                enum: ["TRAINEE", "JUNIOR", "SEMI_SENIOR", "SENIOR", "EXPERT"],
                description: "Nivel de experiencia requerido.",
              },
              position: {
                type: "string",
                description: "Nombre del cargo o rol (ej: 'Frontend Developer', 'Data Scientist').",
              }
            }
          }
        }
      }
    ];

    let response = await client.chat.completions.create({
      model: branding.azureOpenAiDeploymentName,
      messages: apiMessages,
      tools: tools,
      tool_choice: "auto"
    });

    let responseMessage = response.choices[0].message;

    // Si el LLM decide llamar a una función
    if (responseMessage.tool_calls) {
      apiMessages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.function.name === "search_candidates") {
          const args = JSON.parse(toolCall.function.arguments);
          const { skills, seniority, position } = args;

          // Construir la consulta de Prisma
          let whereClause: any = {
            AND: []
          };

          if (seniority) {
            whereClause.AND.push({ seniority });
          }

          if (position) {
            whereClause.AND.push({
              position: {
                contains: position,
                mode: "insensitive"
              }
            });
          }

          if (skills && skills.length > 0) {
            // Buscamos si el 'profile' o 'profileSummary' o 'position' contiene alguna de las skills
            const skillConditions = skills.map((skill: string) => ({
              OR: [
                { profile: { contains: skill, mode: 'insensitive' } },
                { profileSummary: { contains: skill, mode: 'insensitive' } },
                { position: { contains: skill, mode: 'insensitive' } },
              ]
            }));
            
            whereClause.AND.push(...skillConditions);
          }

          // Si no hay filtros, no filtramos por nada
          if (whereClause.AND.length === 0) {
            whereClause = {};
          }

          // Ejecutar búsqueda (limitado a 10 para no saturar contexto)
          const candidates = await prisma.candidate.findMany({
            where: whereClause,
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              position: true,
              seniority: true,
              profile: true,
              stage: true
            },
            take: 10
          });

          // Agregar el resultado a los mensajes
          apiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(candidates),
          });
        }
      }

      // Llamar al LLM nuevamente con los resultados de la función
      response = await client.chat.completions.create({
        model: branding.azureOpenAiDeploymentName,
        messages: apiMessages,
      });
      
      responseMessage = response.choices[0].message;
    }

    return NextResponse.json({ message: responseMessage });

  } catch (error: any) {
    console.error("AI Search Error:", error);
    return NextResponse.json({ error: error?.message || 'Error processing request' }, { status: 500 });
  }
}
