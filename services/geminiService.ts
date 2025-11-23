import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { WasteClassificationResult, QuizQuestion, Facility, QuizAnalysis, WasteMediaAuthenticationResult, ReportAnalysis, HighValueRecyclableResult, ChatModerationResult, SegregationAnalysis } from '../types.ts';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const classificationSchema = {
  type: Type.OBJECT,
  properties: {
    wasteType: {
      type: Type.STRING,
      description: "The type of waste. Must be one of: Wet Waste, Dry Waste, Hazardous, Recyclable, Unknown.",
      enum: ['Wet Waste', 'Dry Waste', 'Hazardous', 'Recyclable', 'Unknown'],
    },
    itemName: {
      type: Type.STRING,
      description: "A short, descriptive name for the item in the image (e.g., Plastic Bottle, Apple Core, Used Battery)."
    },
    description: {
      type: Type.STRING,
      description: "A brief one-sentence description of this waste category."
    },
    disposalInstructions: {
      type: Type.STRING,
      description: "Clear, concise instructions on how to properly dispose of or recycle this item."
    },
    recyclable: {
      type: Type.BOOLEAN,
      description: "Is the item generally considered recyclable?"
    }
  },
  required: ["wasteType", "itemName", "description", "disposalInstructions", "recyclable"]
};

export const classifyWasteImage = async (base64Image: string, mimeType: string, language: 'en' | 'hi'): Promise<WasteClassificationResult> => {
  try {
    const langInstruction = language === 'hi' ? "Provide your response in Hindi." : "Provide your response in English.";
    const prompt = `You are an expert waste management assistant. Your task is to accurately classify the primary waste item in the provided image. Use the JSON schema for your response. Be precise in your identification and provide clear, actionable disposal instructions. ${langInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: classificationSchema,
        temperature: 0.2, // Lower temperature for more deterministic classification
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as WasteClassificationResult;
  } catch (error) {
    console.error("Error classifying waste image:", error);
    throw new Error("Failed to classify the image. The AI model might be unable to identify the item.");
  }
};

export const classifyWasteVideo = async (base64Video: string, mimeType: string, language: 'en' | 'hi'): Promise<WasteClassificationResult> => {
  try {
    const langInstruction = language === 'hi' ? "Provide your response in Hindi." : "Provide your response in English.";
    const prompt = `You are an expert waste management assistant. Analyze this video to accurately identify and classify the primary waste item shown. Use the JSON schema for your response, providing the item name, waste type, and clear disposal instructions. ${langInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Video,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: classificationSchema,
        temperature: 0.2, // Lower temperature for more deterministic classification
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as WasteClassificationResult;
  } catch (error) {
    console.error("Error classifying waste video:", error);
    throw new Error("Failed to classify the video. The AI model might be unable to identify the item.");
  }
};

const mediaAuthenticationSchema = {
  type: Type.OBJECT,
  properties: {
    isValidWasteReport: {
      type: Type.BOOLEAN,
      description: "True if the image/video clearly shows improperly disposed waste (e.g., litter, overflowing bin). False if it's just a regular scene, a person, or irrelevant content."
    },
    isRecent: {
      type: Type.BOOLEAN,
      description: "True if the content appears to have been captured within the last 3 days. Look for clues like freshness of organic waste, lack of significant weathering on items, or other environmental cues. False if it looks old or staged."
    },
    reason: {
      type: Type.STRING,
      description: "A brief, user-facing explanation for the decision, especially if validation fails. For example, 'The image does not appear to contain waste,' or 'The scene looks like it may be older than 3 days.'"
    }
  },
  required: ["isValidWasteReport", "isRecent", "reason"]
};

export const authenticateWasteMedia = async (base64Media: string, mimeType: string, language: 'en' | 'hi'): Promise<WasteMediaAuthenticationResult> => {
  try {
    const langInstruction = language === 'hi' ? "Provide your response in Hindi." : "Provide your response in English.";
    const prompt = `You are a waste reporting authenticator. Analyze the provided media (image or video) to verify its suitability for a community waste report.
    1. Confirm that the media genuinely depicts improperly managed waste (e.g., litter on the ground, an overflowing public dustbin, illegal dumping).
    2. Critically assess if the scene looks recent, within approximately the last 3 days. Scrutinize for signs of age, such as advanced decay of organic matter, significant dust accumulation, plant overgrowth, or weathering that suggests a longer period.
    3. Use the provided JSON schema to structure your response. Be strict in your assessment to prevent spam or old reports.
    ${langInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Media,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: mediaAuthenticationSchema,
        temperature: 0.1,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as WasteMediaAuthenticationResult;
  } catch (error) {
    console.error("Error authenticating waste media:", error);
    throw new Error("Failed to authenticate the media. The AI model could not process the request.");
  }
};

const reportAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    estimatedVolume: {
      type: Type.STRING,
      description: "Estimate the volume of the waste pile.",
      enum: ['Small', 'Medium', 'Large', 'Unknown'],
    },
    wasteTypeCategory: {
      type: Type.STRING,
      description: "Categorize the primary type of waste visible.",
      enum: ['Household', 'Construction Debris', 'E-waste', 'Mixed Commercial', 'Organic', 'Unknown'],
    },
    isBulkGenerator: {
      type: Type.BOOLEAN,
      description: "Based on the volume and type, determine if this is likely from a bulk waste generator (e.g., a business, construction site) rather than an individual. Be conservative; only flag if evidence is strong."
    },
    analysisSummary: {
      type: Type.STRING,
      description: "Provide a brief, one-sentence summary for an administrator. Example: 'Medium-sized pile of mixed commercial waste located on a street corner.'"
    }
  },
  required: ["estimatedVolume", "wasteTypeCategory", "isBulkGenerator", "analysisSummary"]
};

export const analyzeReportedWaste = async (base64Image: string, mimeType: string, language: 'en' | 'hi'): Promise<ReportAnalysis> => {
  try {
    const langInstruction = language === 'hi' ? "Provide your response in Hindi." : "Provide your response in English.";
    const prompt = `As a waste management inspector, analyze the provided image. Your task is to provide a structured analysis for a municipal authority.
    1.  **Estimate Volume:** Assess the overall size of the waste pile (Small, Medium, Large). 'Small' is a few items, 'Medium' is a full garbage bag's worth, 'Large' is significantly more.
    2.  **Categorize Waste:** Identify the dominant type of waste. 'Household' for typical residential trash, 'Construction Debris' for materials like concrete or wood, 'Mixed Commercial' for business-related waste.
    3.  **Identify Bulk Generator:** Determine if the waste likely originated from a bulk generator. Look for large quantities of uniform waste (e.g., many identical boxes from a shop) or specific types like construction materials that suggest a source other than an individual household.
    4.  **Summarize:** Write a concise, one-sentence summary for the report.
    Use the provided JSON schema for your response. ${langInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: reportAnalysisSchema,
        temperature: 0.3,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ReportAnalysis;
  } catch (error) {
    console.error("Error analyzing reported waste:", error);
    throw new Error("Failed to perform AI analysis on the report image.");
  }
};

const highValueRecyclableSchema = {
  type: Type.OBJECT,
  properties: {
    wasteType: { type: Type.STRING, description: "General waste type.", enum: ['Wet Waste', 'Dry Waste', 'Hazardous', 'Recyclable', 'Unknown'] },
    itemName: { type: Type.STRING, description: "Name of the item." },
    description: { type: Type.STRING, description: "Brief description of the item." },
    disposalInstructions: { type: Type.STRING, description: "General disposal instructions." },
    recyclable: { type: Type.BOOLEAN, description: "Is it recyclable?" },
    materialType: {
      type: Type.STRING,
      description: "Specific material type if identifiable.",
      enum: ['PET', 'HDPE', 'Aluminum', 'Copper', 'Other', 'Unknown'],
    },
    estimatedValue: {
      type: Type.STRING,
      description: "An estimated market value for the recyclable material, in local currency (e.g., '₹5-10 per kg')."
    },
    valueDescription: {
        type: Type.STRING,
        description: "A brief one-sentence explanation of why this material has value."
    },
    handlingInstructions: {
      type: Type.STRING,
      description: "Specific instructions for waste workers on how to safely handle and prepare this material for sale."
    }
  },
  required: ["wasteType", "itemName", "description", "disposalInstructions", "recyclable", "materialType", "estimatedValue", "valueDescription", "handlingInstructions"]
};

export const identifyHighValueRecyclable = async (base64Image: string, mimeType: string, language: 'en' | 'hi'): Promise<HighValueRecyclableResult> => {
  try {
    const langInstruction = language === 'hi' ? "Provide your response in Hindi, with currency values in INR (₹)." : "Provide your response in English, with currency values in INR (₹).";
    const prompt = `You are an expert assistant for waste workers. Your task is to accurately identify the primary waste item in the provided image, focusing on its value as a recyclable material. 
    1. Classify the item (Waste Type, Name, etc.).
    2. Identify the specific material (e.g., PET, Aluminum).
    3. Provide an estimated market value in Indian Rupees (₹).
    4. Explain briefly why it's valuable.
    5. Give clear instructions on how to handle it for sale.
    Use the JSON schema for your response. Be precise and practical. ${langInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: highValueRecyclableSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as HighValueRecyclableResult;
  } catch (error) {
    console.error("Error identifying high-value recyclable:", error);
    throw new Error("Failed to analyze the item. The AI model might be unable to identify it.");
  }
};

export const getMaterialFromImage = async (base64Image: string, mimeType: string, language: 'en' | 'hi'): Promise<string> => {
  try {
    const langInstruction = language === 'hi' ? "Provide your response in Hindi." : "Provide your response in English.";
    const prompt = `Analyze the image and identify the primary recyclable material shown. Respond with only the name of the material in lowercase, for example: 'plastic bottles', 'cardboard', 'tin cans', 'old newspapers', 'glass jars'. If you cannot identify a specific material, respond with 'unknown'. ${langInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        temperature: 0.1,
      },
    });

    const material = response.text.trim().toLowerCase();
    if (!material || material === 'unknown') {
      throw new Error("Could not identify a specific material from the image.");
    }
    return material;
  } catch (error) {
    console.error("Error identifying material from image:", error);
    throw new Error("Failed to identify material from the image.");
  }
};

export const generateUpcycledArt = async (material: string, ideaPrompt: string): Promise<string> => {
    try {
        const fullPrompt = `Generate a visually appealing image of a creative art project made from upcycled ${material}. The project should be inspired by the idea: "${ideaPrompt}". The style should be vibrant, high-quality, and look like a real photograph of a DIY craft project.`;

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '1:1',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("The model did not generate any images.");
        }

        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return base64ImageBytes;

    } catch (error) {
        console.error("Error generating upcycled art:", error);
        throw new Error("Failed to generate art. The AI model may have refused the prompt. Please try a different idea.");
    }
};

const chatModerationSchema = {
    type: Type.OBJECT,
    properties: {
        isAppropriate: {
            type: Type.BOOLEAN,
            description: "True if the message is appropriate for a family-friendly, on-topic community forum about environmentalism. False otherwise."
        },
        reason: {
            type: Type.STRING,
            description: "If inappropriate, a brief, user-friendly explanation for why the message was blocked (e.g., 'Contains offensive language', 'Off-topic spam')."
        }
    },
    required: ["isAppropriate"]
};

export const moderateChatMessage = async (message: string, language: 'en' | 'hi'): Promise<ChatModerationResult> => {
    try {
        const langInstruction = language === 'hi' ? "Provide your response in Hindi." : "Provide your response in English.";
        const prompt = `You are a content moderator for an environmental awareness app's community chat. The community is family-friendly and focused on topics like waste management, recycling, and local cleanup efforts.
        Analyze the following user message: "${message}"
        Is this message appropriate? It is inappropriate if it contains:
        - Hate speech, harassment, or personal attacks.
        - Profanity or offensive language.
        - Spam, advertisements, or irrelevant links.
        - Content completely unrelated to environmental topics.
        Use the provided JSON schema for your response. Be strict in your moderation. ${langInstruction}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: chatModerationSchema,
                temperature: 0.1,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ChatModerationResult;
    } catch (error) {
        console.error("Error moderating chat message:", error);
        // Fail-safe: if moderation fails, assume it's appropriate to not block legit messages.
        return { isAppropriate: true };
    }
};


export const createChat = (language: 'en' | 'hi'): Chat => {
    const systemInstruction = language === 'hi'
      ? "आप स्वच्छता साथी हैं, अपशिष्ट प्रबंधन और पर्यावरणीय स्थिरता में विशेषज्ञ एक एआई सहायक। आपका लक्ष्य सटीक, स्पष्ट और उत्साहजनक मार्गदर्शन प्रदान करना है। जब विशिष्ट वस्तुओं के बारे में पूछा जाए, तो रीसाइक्लिंग, कंपोस्टिंग और उचित निपटान पर व्यावहारिक सलाह दें। यदि कोई प्रश्न आपकी विशेषज्ञता से बाहर है, तो विनम्रता से बताएं कि आप पर्यावरणीय विषयों में विशेषज्ञ हैं। सकारात्मक और सहायक लहजा बनाए रखें। सूचियों और जोर देने के लिए मार्कडाउन का उपयोग करें। केवल हिंदी में जवाब दें।"
      : "You are Swachhata Sathi, an expert AI assistant specializing in waste management and environmental sustainability. Your goal is to provide accurate, clear, and encouraging guidance. When asked about specific items, give practical advice on recycling, composting, and proper disposal. If a question is outside your expertise, politely state that you specialize in environmental topics. Maintain a positive and supportive tone. Use markdown for lists and emphasis. Respond only in English.";

    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        },
    });
};

const quizSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            question: {
                type: Type.STRING,
                description: "The quiz question."
            },
            options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 4 possible answers."
            },
            correctAnswer: {
                type: Type.STRING,
                description: "The correct answer, which must be one of the strings from the 'options' array."
            }
        },
        required: ["question", "options", "correctAnswer"]
    }
};

export const generateQuizQuestions = async (language: 'en' | 'hi'): Promise<QuizQuestion[]> => {
    try {
        const langInstruction = language === 'hi' ? "हिंदी में" : "in English";
        const prompt = `Generate 5 unique and engaging multiple-choice quiz questions about waste management, recycling, and sustainability. Include a mix of easy, medium, and hard questions suitable for a general audience to test their knowledge and encourage learning. Generate the quiz ${langInstruction}.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: quizSchema,
                temperature: 0.8, // Higher temperature for more creative and varied questions
            },
        });
        
        const jsonText = response.text.trim();
        const questions = JSON.parse(jsonText);
        // Basic validation
        if (Array.isArray(questions) && questions.length > 0) {
            return questions as QuizQuestion[];
        }
        throw new Error("Generated data is not in the expected format.");

    } catch (error) {
        console.error("Error generating quiz questions:", error);
        throw new Error("Failed to generate new quiz questions from the AI.");
    }
};

export const findNearbyFacilities = async (latitude: number, longitude: number, language: 'en' | 'hi'): Promise<Facility[]> => {
    try {
      const langInstruction = language === 'hi' ? 'Provide the facility names and addresses in Hindi if possible.' : '';
      const prompt = `List up to 5 waste management or recycling facilities near latitude ${latitude} and longitude ${longitude}. For each facility, provide its name and full full address. Format each facility strictly on two consecutive lines like this, with no extra lines between facilities:
Name: [Facility Name]
Address: [Full Address]
${langInstruction}
Do not include any other introductory or concluding text, just the list.`;
  
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{googleSearch: {}}],
        },
      });
  
      const text = response.text.trim();
      const facilities: Facility[] = [];
      const lines = text.split('\n');
  
      let currentFacility: Partial<Facility> = {};
  
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('Name:')) {
          if (currentFacility.name && currentFacility.address) {
            facilities.push(currentFacility as Facility);
          }
          currentFacility = { name: trimmedLine.substring(5).trim() };
        } else if (trimmedLine.startsWith('Address:')) {
          if (currentFacility.name) {
            currentFacility.address = trimmedLine.substring(8).trim();
            facilities.push(currentFacility as Facility);
            currentFacility = {};
          }
        }
      }
  
      return facilities;
    } catch (error) {
      console.error("Error finding nearby facilities:", error);
      throw new Error("Failed to find nearby facilities using the AI model.");
    }
  };

const quizAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    performanceSummary: {
      type: Type.STRING,
      description: "A short, encouraging summary of the user's performance (1-2 sentences)."
    },
    improvementAreas: {
      type: Type.ARRAY,
      description: "A list of 2-3 specific topics or concepts the user should review.",
      items: { type: Type.STRING }
    },
    nextSteps: {
      type: Type.STRING,
      description: "A brief suggestion for what the user can do next to learn more."
    }
  },
  required: ["performanceSummary", "improvementAreas", "nextSteps"]
};

export const generateQuizAnalysis = async (score: number, totalQuestions: number, language: 'en' | 'hi'): Promise<QuizAnalysis> => {
    try {
      const langInstruction = language === 'hi' ? "प्रतिक्रिया हिंदी में होनी चाहिए।" : "The response should be in English.";
      const prompt = `As an encouraging environmental coach, analyze a user's quiz performance. They scored ${score} out of ${totalQuestions}. Provide a positive summary, pinpoint 2-3 specific topics for improvement (e.g., 'E-waste disposal', 'Composting basics'), and suggest a clear, actionable next step. Keep the tone supportive. Adhere to the provided JSON schema. ${langInstruction}`;
  
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: quizAnalysisSchema,
          temperature: 0.7, // Moderate temperature for creative yet focused feedback
        },
      });
  
      const jsonText = response.text.trim();
      return JSON.parse(jsonText) as QuizAnalysis;

    } catch (error) {
      console.error("Error generating quiz analysis:", error);
      throw new Error("Failed to generate quiz analysis from the AI.");
    }
};

export const getAreaFromCoordinates = async (latitude: number, longitude: number, language: 'en' | 'hi'): Promise<string> => {
    try {
        const langInstruction = language === 'hi' ? "in Hindi" : "in English";
        const prompt = `Based on latitude ${latitude} and longitude ${longitude}, what is the concise name of the local neighborhood, administrative ward, or area? Respond with only the name, for example: 'Sector 15', 'Green Park', or 'Ward 7'. Keep the response under 5 words. Respond ${langInstruction}.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const areaName = response.text.trim();
        if (!areaName) {
            throw new Error("AI returned an empty area name.");
        }
        return areaName;

    } catch (error) {
        console.error("Error getting area from coordinates:", error);
        throw new Error("Failed to determine area name from coordinates.");
    }
};

const segregationAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        performanceSummary: {
            type: Type.STRING,
            description: "A short, encouraging summary of the user's performance (1-2 sentences)."
        },
        improvementTips: {
            type: Type.ARRAY,
            description: "An array of specific tips for each item the user got wrong.",
            items: {
                type: Type.OBJECT,
                properties: {
                    item: { type: Type.STRING, description: "The name of the item the user incorrectly classified." },
                    tip: { type: Type.STRING, description: "A helpful tip explaining the correct classification for this item." }
                },
                required: ["item", "tip"]
            }
        },
        suggestedVideos: {
            type: Type.ARRAY,
            description: "A list of 2-3 relevant video tutorial titles the user should watch to learn more.",
            items: { type: Type.STRING }
        }
    },
    required: ["performanceSummary", "improvementTips", "suggestedVideos"]
};

export const generateSegregationAnalysis = async (score: number, totalQuestions: number, incorrectItems: string[], language: 'en' | 'hi'): Promise<SegregationAnalysis> => {
    try {
        const langInstruction = language === 'hi' ? "प्रतिक्रिया हिंदी में होनी चाहिए।" : "The response should be in English.";
        const incorrectItemList = incorrectItems.length > 0 ? `They made mistakes on the following items: ${incorrectItems.join(', ')}.` : "They got a perfect score!";
        
        const prompt = `As an encouraging waste management coach, analyze a user's performance in a waste segregation game. They scored ${score} out of ${totalQuestions}. ${incorrectItemList}
        
        Your task is to:
        1. Provide a positive, one-sentence summary of their performance.
        2. For each incorrect item, provide a clear, concise tip explaining the correct way to segregate it. If there were no incorrect items, this array should be empty.
        3. Suggest 2-3 relevant video tutorial titles that would help them improve their knowledge.
        
        Adhere to the provided JSON schema. Keep the tone supportive and educational. ${langInstruction}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: segregationAnalysisSchema,
                temperature: 0.7,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as SegregationAnalysis;

    } catch (error) {
        console.error("Error generating segregation analysis:", error);
        throw new Error("Failed to generate segregation analysis from the AI.");
    }
};