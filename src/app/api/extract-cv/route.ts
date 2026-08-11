import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AzureOpenAI } from 'openai';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('resumeFile') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const branding = await prisma.companyBranding.findFirst();
    
    if (!branding?.aiEnabled) {
      return NextResponse.json({ error: 'AI extraction is disabled' }, { status: 403 });
    }
    
    if (!branding.azureOpenAiEndpoint || !branding.azureOpenAiApiKey || !branding.azureOpenAiDeploymentName) {
      return NextResponse.json({ error: 'Azure OpenAI is not fully configured' }, { status: 500 });
    }

    // Read the file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse the PDF
    const pdf = eval("require('pdf-parse')");
    const data = await pdf(buffer);
    const textContent = data.text;

    // Call Azure OpenAI
    const client = new AzureOpenAI({
      endpoint: branding.azureOpenAiEndpoint,
      apiKey: branding.azureOpenAiApiKey,
      deployment: branding.azureOpenAiDeploymentName,
      apiVersion: '2024-02-15-preview', // Common API version, can be made configurable if needed
    });

    const response = await client.chat.completions.create({
      model: branding.azureOpenAiDeploymentName, // The deployment name is usually used as the model
      messages: [
        {
          role: "system",
          content: "You are a professional HR assistant. Your task is to extract information from a candidate's resume and return it strictly in valid JSON format. Extract the following fields: firstName (string), lastName (string), email (string), phone (string), documentType (string, one of DNI, PASSPORT, LICENSE, OTHER, guess based on context or leave empty), documentNumber (string), position (string, current or most relevant job title/position), profile (string, keywords separated by comma, MUST BE TRANSLATED TO SPANISH), profileSummary (string, a brief summary of their experience, MUST BE TRANSLATED TO SPANISH), seniority (string, one of JUNIOR, SEMI_SENIOR, SENIOR, guess based on years of experience), expectedSalary (number, if mentioned, else null). Do not include any text outside the JSON object. Do not include markdown formatting like ```json."
        },
        {
          role: "user",
          content: `Resume text:\n\n${textContent}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const responseText = response.choices[0]?.message?.content || '{}';
    let parsedData = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse LLM response as JSON", responseText);
      return NextResponse.json({ error: 'Invalid response from AI' }, { status: 500 });
    }

    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    console.error("Error extracting CV:", error);
    return NextResponse.json({ error: 'Failed to extract CV data: ' + (error?.message || error) }, { status: 500 });
  }
}
