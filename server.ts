import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON limits to safely allow uploading images (for report analysis)
app.use(express.json({ limit: '15mb' }));

const apiKey = process.env.GEMINI_API_KEY;

// Initialize GoogleGenAI SDK on the server-side as mandated.
// Lazy-initialize client or verify keys to handle missing key environment scenarios gracefully.
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Requests will fail.");
      throw new Error("GEMINI_API_KEY is missing. Please configure it in the Secrets panel in AI Studio.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Emergency Keyword Detector Helper
function detectEmergency(text: string): boolean {
  const keywords = [
    'chest pain', 'chest tightness', 'heart attack', 'difficulty breathing', 
    'shortness of breath', 'can\'t breathe', 'stroke symptoms', 'stroke',
    'facial droop', 'sudden numbness', 'loss of consciousness', 'unconscious',
    'passed out', 'seizure', 'seizures', 'severe allergic reaction', 'anaphylaxis'
  ];
  const normalized = text.toLowerCase();
  return keywords.some(keyword => normalized.includes(keyword));
}

// Self-Harm Detector Helper
function detectSelfHarm(text: string): boolean {
  const keywords = [
    'suicide', 'kill myself', 'end my life', 'self-harm', 'cut myself', 'want to die'
  ];
  const normalized = text.toLowerCase();
  return keywords.some(keyword => normalized.includes(keyword));
}

// --- API ENDPOINTS ---

// 1. CHAT ENDPOINT - Symptom guidance & queries
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const lastUserMessage = messages[messages.length - 1]?.text || "";

    // 1. Direct Emergency Detection before calling AI
    if (detectEmergency(lastUserMessage)) {
      return res.json({
        text: `🚨 **EMERGENCY WARNING**\n\nThis mentions symptoms that could indicate a severe medical emergency (such as intense chest pain, breathing difficulty, or stroke indicators).\n\n**Please seek immediate professional medical attention!** Call 911 (or your local emergency services) or go to the nearest emergency room immediately. Do not wait for further AI responses.\n\n⚠️ *I am an AI Health Assistant and not a licensed medical professional. This is for educational purposes only and is not medical advice.*`,
        isEmergency: true
      });
    }

    // 2. Direct Self-harm Detection before calling AI
    if (detectSelfHarm(lastUserMessage)) {
      return res.json({
        text: `🚨 **IMPORTANT HELP & RESOURCES**\n\nIf you are experiencing thoughts of self-harm or suicide, please know that you are not alone and help is available. \n\n**Please reach out immediately to emergency services or local crisis support:**\n- **In the US:** Call or text **988** to reach the Suicide & Crisis Lifeline, available 24/7.\n- **International:** Please contact your local emergency services or visit [findahelpline.com](https://findahelpline.com/) to find immediate help in your country.\n- **Consult professionals:** Talk to a trusted doctor, therapist, or mental health advocate straight away.`,
        isEmergency: true
      });
    }

    // Build history for Gemini
    const gemini = getGeminiClient();

    // Map roles to standard Roles if needed or pass as structured strings.
    // Since Gemini supports conversations, we can construct the context.
    const systemInstruction = `You are MediCare AI, an advanced AI Health Assistant designed to provide health education, symptom guidance, wellness recommendations, and healthcare information.

Core Responsibilities:
- Analyze user-reported symptoms carefully and politely.
- Suggest potential causes based on reported symptoms, while stating clearly that this is not a diagnostic evaluation.
- Provide healthy lifestyle, diet, sleep, and hygiene recommendation.
- Remind users when professional medical care is needed.
- Maintain professional, friendly, and empathetic tone throughout the conversation.

Core Rules & Safety Boundaries:
1. NEVER claim to be a doctor, provide solid medical diagnoses, or prescribe treatments or medications.
2. Direct emergency words (e.g. chest pain, suicide, stroke) are handled upstream, but if any severe symptoms appear, immediately tell them: "🚨 This may be a medical emergency. Seek immediate medical attention or contact emergency services."
3. If they complain of mild symptoms, discuss general categories of medicine that can help (e.g., OTC solutions like Ibuprofen, Antihistamines), but always advise consulting a pharmacist or doctor before taking them. Never dictate specific dosages or guarantee specific action.
4. Before discussing any specific medication or severe symptom, ask the user (if missing):
   - Age and Gender
   - Exact Symptoms & Duration
   - Severity level (on a 1-10 scale)
   - Existing medical conditions & Current medications
   - Any Allergies

Always append the exact medical disclaimer at the very end of your response:
"⚠️ I am an AI Health Assistant and not a licensed medical professional. The information I provide is for educational purposes only and should not replace professional medical advice, diagnosis, or treatment."`;

    // Construct history parts
    const chatHistory = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // Generate output with gemini-3.5-flash
    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: chatHistory,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      }
    });

    const resultText = response.text || "I was unable to process that. Please check back shortly.";
    res.json({ text: resultText });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred during communication." });
  }
});

// 2. REPORT ANALYZER ENDPOINT - Analyzes base64 image or text of a lab test report
app.post('/api/analyze-report', async (req, res) => {
  try {
    const { imageBase64, mimeType, textInput } = req.body;
    const gemini = getGeminiClient();

    let contentsParts: any[] = [];

    if (imageBase64 && mimeType) {
      contentsParts.push({
        inlineData: {
          mimeType: mimeType,
          data: imageBase64
        }
      });
      contentsParts.push({
        text: "Analyze this medical report/lab test image carefully. Extract all test rows, values, reference ranges, and interpret them neatly."
      });
    } else if (textInput) {
      contentsParts.push({
        text: `Analyze this medical text/lab report content:\n\n${textInput}`
      });
    } else {
      return res.status(400).json({ error: "Either image or text input must be provided." });
    }

    const reportPrompt = `You are a medical lab report parsing processor. Parse the provided document, extract structured details, and generate a clear interpretation.
Strictly respond with a valid JSON document conforming to this schema. Do not add markdown comments like \`\`\`json outside the content, or just output pure JSON.

Schema details to fill:
{
  "patientInfo": {
    "name": "Extracted name or 'Unknown'",
    "age": "Extracted age or 'Unknown'",
    "gender": "Extracted gender or 'Unknown'",
    "date": "Date of test or 'Unknown'"
  },
  "results": [
    {
      "testName": "Hemoglobin, Cholesterol, TSH, etc.",
      "result": "e.g., 12.5, 230, 4.1",
      "referenceRange": "e.g. 13.5 - 17.5",
      "status": "One of: Normal | Low | High | Critical",
      "explanation": "Brief simple language description of what this value means"
    }
  ],
  "summary": "Overall summary of the lab results and health status.",
  "lifestyleRecommendations": ["list of practical recommendations based on results"],
  "nutritionRecommendations": ["list of food and drink additions/subtractions"],
  "warningSigns": ["severe signs that would warrant contacting their primary doctor immediately"]
}`;

    contentsParts.push({ text: reportPrompt });

    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contentsParts,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            patientInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                age: { type: Type.STRING },
                gender: { type: Type.STRING },
                date: { type: Type.STRING }
              }
            },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  testName: { type: Type.STRING },
                  result: { type: Type.STRING },
                  referenceRange: { type: Type.STRING },
                  status: { type: Type.STRING, description: "Normal, Low, High, Critical, or Unknown" },
                  explanation: { type: Type.STRING }
                },
                required: ["testName", "result", "referenceRange", "status"]
              }
            },
            summary: { type: Type.STRING },
            lifestyleRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            nutritionRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            warningSigns: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["results", "summary", "lifestyleRecommendations", "nutritionRecommendations", "warningSigns"]
        }
      }
    });

    const reportJson = JSON.parse(response.text || "{}");
    res.json(reportJson);

  } catch (error: any) {
    console.error("Report Analyzer Error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze the medical report." });
  }
});

// 3. NUTRITION ENDPOINT - Personal nutrition and calorie target generator
app.post('/api/generate-nutrition', async (req, res) => {
  try {
    const { goal, restrictions, allergies, bmr, tdee, currentWeight, targetWeight, gender } = req.body;
    const gemini = getGeminiClient();

    const prompt = `Generate a personalized Daily Nutrition Plan for a ${gender || 'person'} with:
- Main Goal: ${goal || 'General Fitness'}
- Dietary restrictions: ${restrictions || 'None'}
- Allergies: ${allergies || 'None'}
- Calculated TDEE: ${tdee || 2000} kcal/day
- Weight context: Current: ${currentWeight || 'N/A'} kg, Target: ${targetWeight || 'N/A'} kg

Format the output strictly as a JSON object matching this schema:
{
  "dailyCalorieTarget": 2000,
  "waterIntakeLiters": 2.5,
  "macros": { "calories": 2000, "protein": 130, "carbs": 220, "fat": 65, "fiber": 30 },
  "meals": [
    {
      "mealName": "Breakfast",
      "description": "Specific healthy meal options with portion sizes",
      "calories": 500, "protein": 30, "carbs": 60, "fat": 15, "fiber": 8
    },
    { "mealName": "Lunch", "description": "...", "calories": 600, ... },
    { "mealName": "Dinner", "description": "...", "calories": 600, ... },
    { "mealName": "Snacks", "description": "...", "calories": 300, ... }
  ],
  "tips": [
    "Practical advice for food prep, eating intervals, and safety"
  ]
}`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dailyCalorieTarget: { type: Type.INTEGER },
            waterIntakeLiters: { type: Type.NUMBER },
            macros: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.INTEGER },
                protein: { type: Type.INTEGER },
                carbs: { type: Type.INTEGER },
                fat: { type: Type.INTEGER },
                fiber: { type: Type.INTEGER }
              },
              required: ["calories", "protein", "carbs", "fat", "fiber"]
            },
            meals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mealName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  calories: { type: Type.INTEGER },
                  protein: { type: Type.INTEGER },
                  carbs: { type: Type.INTEGER },
                  fat: { type: Type.INTEGER },
                  fiber: { type: Type.INTEGER }
                },
                required: ["mealName", "description", "calories", "protein", "carbs", "fat", "fiber"]
              }
            },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["dailyCalorieTarget", "waterIntakeLiters", "macros", "meals", "tips"]
        }
      }
    });

    const nutritionJson = JSON.parse(response.text || "{}");
    res.json(nutritionJson);

  } catch (error: any) {
    console.error("Nutrition Gen Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate nutrition plan." });
  }
});

// 4. FITNESS ENDPOINT - Daily activity planner based on parameters
app.post('/api/generate-fitness', async (req, res) => {
  try {
    const { goal, age, fitnessLevel, experience, activeDaysCount, preferredLocation } = req.body;
    const gemini = getGeminiClient();

    const prompt = `Generate a customized workout routine and calendar based on:
- Goal: ${goal || 'General Fitness'}
- Age: ${age || 30} years old
- Fitness level: ${fitnessLevel || 'Beginner'}
- Active days requested: ${activeDaysCount || 3} days per week
- Location preference: ${preferredLocation || 'Home/No Equipment'}

Format the output strictly as a JSON object matching this schema:
{
  "goal": "Explain the target of this plan",
  "dailyCalorieTarget": 1800,
  "weeklySchedule": [
    {
      "day": "Day 1 (e.g. Chest & Core)",
      "focus": "Brief focus description",
      "exercises": [
        {
          "name": "Push-ups",
          "sets": 3,
          "reps": "12-15 reps",
          "duration": "N/A",
          "restPeriod": "60s",
          "description": "Keep core locked, chest to floor"
        }
      ]
    }
  ],
  "recoveryTips": ["tip 1", "tip 2"]
}`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            goal: { type: Type.STRING },
            dailyCalorieTarget: { type: Type.INTEGER },
            weeklySchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.INTEGER },
                        reps: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        restPeriod: { type: Type.STRING },
                        description: { type: Type.STRING }
                      },
                      required: ["name", "sets", "reps", "restPeriod", "description"]
                    }
                  }
                },
                required: ["day", "focus", "exercises"]
              }
            },
            recoveryTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["goal", "dailyCalorieTarget", "weeklySchedule", "recoveryTips"]
        }
      }
    });

    const fitnessJson = JSON.parse(response.text || "{}");
    res.json(fitnessJson);

  } catch (error: any) {
    console.error("Fitness Planner Gen Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate fitness plan." });
  }
});

// 5. MEDICINE DETAILS LOOKUP ENDPOINT
app.post('/api/medicine-lookup', async (req, res) => {
  try {
    const { name, symptomContext } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Medicine name is required." });
    }

    const gemini = getGeminiClient();

    const prompt = `Lookup general information about the active pharmaceutical drug or tablet: "${name}".
Optional symptom context mentioned: "${symptomContext || 'None'}".

Provide accurate medical information that belongs in an educational dictionary.
Format the output strictly as a JSON object matching this schema:
{
  "name": "${name}",
  "category": "e.g., NSAID, Antihistamine, Proton-pump inhibitor",
  "purpose": "A simple clear explanation of what this medicine is designed to do.",
  "commonUses": ["e.g. Relieving fever", "reducing joint inflammation"],
  "sideEffects": ["e.g., Stomach upset", "drowsiness"],
  "precautions": ["e.g., Avoid alcohol", "Do not take if pregnant without consulting a doctor"],
  "drugInteractions": ["Known interacting substances or food flags"],
  "dosageWarning": "🚨 CRITICAL SAFE WARNING: Never declare target dosages or schedules for individuals. Remind them to speak to a doctor or clinical pharmacist directly."
}`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            purpose: { type: Type.STRING },
            commonUses: { type: Type.ARRAY, items: { type: Type.STRING } },
            sideEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
            precautions: { type: Type.ARRAY, items: { type: Type.STRING } },
            drugInteractions: { type: Type.ARRAY, items: { type: Type.STRING } },
            dosageWarning: { type: Type.STRING }
          },
          required: ["name", "category", "purpose", "commonUses", "sideEffects", "precautions", "dosageWarning"]
        }
      }
    });

    const medicineJson = JSON.parse(response.text || "{}");
    res.json(medicineJson);

  } catch (error: any) {
    console.error("Medicine Lookup Error:", error);
    res.status(500).json({ error: error.message || "Failed to retrieve medicine details." });
  }
});

// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Support React SPA routing compatibility
    app.get('*', (req, res, next) => {
      // Do not override API routes
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[MediCare AI] Full-stack Server successfully booting on http://localhost:${PORT}`);
  });
}

startServer();
