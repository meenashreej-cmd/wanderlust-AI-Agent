import { GoogleGenAI, FunctionDeclaration, Tool, Type, Part } from '@google/genai';
import { TripInput, LogItem, TripResult } from '../types';
import { searchTransportAPI, searchAccommodationAPI, searchFoodAPI } from './mockBackend';

export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- TOOL DEFINITIONS ---

const searchTransportTool: FunctionDeclaration = {
  name: 'search_transport',
  description: 'Search for 3 transport options between two locations.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      from: { type: Type.STRING },
      to: { type: Type.STRING },
      date: { type: Type.STRING },
      mode: { type: Type.STRING },
    },
    required: ['from', 'to', 'date'],
  },
};

const searchAccommodationTool: FunctionDeclaration = {
  name: 'search_accommodation',
  description: 'Search for 3 accommodation options in a destination.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      destination: { type: Type.STRING },
      type: { type: Type.STRING },
      budgetLevel: { type: Type.STRING },
    },
    required: ['destination', 'type'],
  },
};

const searchFoodTool: FunctionDeclaration = {
  name: 'search_food',
  description: 'Search for 3 popular food/dining options in a destination.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      destination: { type: Type.STRING },
    },
    required: ['destination'],
  },
};

const tools: Tool[] = [
  {
    functionDeclarations: [searchTransportTool, searchAccommodationTool, searchFoodTool],
  },
];

// --- MAIN AGENT FUNCTION ---

export const generateAgenticTrip = async (
  input: TripInput,
  userId: string,
  onLog: (log: LogItem) => void
): Promise<TripResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY not set in environment");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-2.5-flash';

  let imagePart: Part | null = null;
  if (input.imageFile) {
    onLog({ type: 'info', message: 'Encoding inspiration image...', timestamp: Date.now() });
    const base64Data = await fileToGenerativePart(input.imageFile);
    imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: input.imageFile.type,
      },
    };
  }

  const currencySymbol = input.currency === 'INR' ? '₹' : '$';

  const systemInstruction = `
    You are an expert Agentic Travel Planner. Your goal is to plan a perfect trip based on user inputs.
    
    Responsibilities:
    1. Analyze the attached image (if provided) to determine the "vibe".
    2. Use tools to find:
       - THREE (3) distinct transport options.
       - THREE (3) distinct accommodation options.
       - THREE (3) distinct featured dining experiences (use search_food).
    3. Respect the total budget: ${currencySymbol}${input.totalBudget} ${input.budgetType}.
    4. Construct a detailed day-by-day itinerary.
    5. CRITICAL: For EACH day in the itinerary, you MUST explicitly include 3 separate items for meals: 
       - "Breakfast at [Restaurant Name/Type]"
       - "Lunch at [Restaurant Name/Type]"
       - "Dinner at [Restaurant Name/Type]"
       Ensure these are separate items in the 'items' array for every day.
    6. Return a strictly formatted JSON object.
    7. All estimated costs for food/activities MUST be in ${input.currency}.
    8. ${input.tourGuide ? 'Include a professional Tour Guide service as an item in the daily activities or as a separate cost note.' : 'Do not include a tour guide unless necessary.'}

    User Request:
    - Origin: ${input.fromLocation} -> Destination: ${input.destination}
    - Dates: ${input.startDate} to ${input.endDate}
    - People: ${input.people}
    - Description: ${input.description}
    - Preferred Currency: ${input.currency}
    - Tour Guide Requested: ${input.tourGuide ? 'YES' : 'NO'}
    
    REQUIRED FINAL JSON FORMAT (No markdown):
    {
      "tripId": "generate_uuid",
      "destination": "string",
      "people": ${input.people},
      "currency": "${input.currency}",
      "vibeAnalysis": "string",
      "status": "draft",
      "transportOptions": [
        { "id": "t1", "type": "string", "provider": "string", "departureTime": "string", "arrivalTime": "string", "duration": "string", "cost": number, "booked": false }
      ],
      "accommodationOptions": [
        { "id": "a1", "name": "string", "type": "string", "location": "string", "costPerNight": number, "totalCost": number, "amenities": ["string"], "rating": number, "booked": false }
      ],
      "foodOptions": [
        { "id": "f1", "name": "string", "cuisine": "string", "type": "string", "location": "string", "costPerPerson": number, "rating": number, "booked": false }
      ],
      "selectedTransportId": "t1",
      "selectedAccommodationId": "a1",
      "selectedFoodId": "f1",
      "estimatedCosts": {
        "food": number, // Total estimated food cost for the trip
        "activities": number
      },
      "itinerary": [
        {
          "day": number,
          "date": "YYYY-MM-DD",
          "theme": "string",
          "items": [
             { "id": "i_unique", "time": "Morning/10:00 AM", "activity": "string", "costEstimate": number, "location": "string", "notes": "string" }
          ]
        }
      ]
    }
  `;

  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: systemInstruction,
      tools: tools,
      temperature: 0.7,
    },
  });

  onLog({ type: 'info', message: 'Agent analyzing request and image...', timestamp: Date.now() });

  const contentParts: Part[] = [{ text: "Plan my trip." }];
  if (imagePart) contentParts.push(imagePart);

  let response = await chat.sendMessage({ message: contentParts });
  let maxSteps = 7; 
  let currentStep = 0;

  while (response.functionCalls && response.functionCalls.length > 0 && currentStep < maxSteps) {
    currentStep++;
    const functionCalls = response.functionCalls;
    const functionResponseParts: Part[] = [];

    for (const call of functionCalls) {
      onLog({ type: 'tool', message: `Agent calling tool: ${call.name}`, timestamp: Date.now() });
      let result = {};
      try {
        if (call.name === 'search_transport') {
          const args: any = call.args;
          result = await searchTransportAPI(args.from, args.to, args.mode);
        } else if (call.name === 'search_accommodation') {
            const args: any = call.args;
          result = await searchAccommodationAPI(args.destination, args.type, args.budgetLevel);
        } else if (call.name === 'search_food') {
            const args: any = call.args;
            result = await searchFoodAPI(args.destination);
        }
      } catch (e) {
        result = { error: 'Failed to fetch data' };
      }
      functionResponseParts.push({
        functionResponse: {
          name: call.name,
          response: { result },
          id: call.id 
        }
      });
    }
    response = await chat.sendMessage({ message: functionResponseParts });
  }

  onLog({ type: 'info', message: 'Finalizing itinerary...', timestamp: Date.now() });
  
  try {
      const text = response.text;
      if (!text) throw new Error("No text generated");
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
  } catch (e: any) {
      console.error("Failed to parse JSON", response?.text);
      throw new Error("Agent failed to generate valid JSON plan.");
  }
};


// --- NEW AI FEATURES ---

// 1. Multimodal Analysis (Images/Video with Gemini 3 Pro)
export const analyzeContent = async (file: File, prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = await fileToGenerativePart(file);
    
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: file.type,
                        data: base64Data
                    }
                },
                { text: prompt }
            ]
        }
    });

    return response.text || "No analysis generated.";
};

// 2. Thinking Mode (Gemini 3 Pro)
export const deepThinkQuery = async (query: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: query,
        config: {
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });
    return response.text || "No response generated.";
};

// 3. Maps Grounding (Gemini 2.5 Flash)
export const mapsQuery = async (query: string, userLocation?: {lat: number, lng: number}): Promise<{text: string, chunks: any[]}> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const config: any = {
        tools: [{ googleMaps: {} }],
    };
    
    if (userLocation) {
        config.toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: userLocation.lat,
                    longitude: userLocation.lng
                }
            }
        };
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: config
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
        text: response.text || "",
        chunks: chunks
    };
};