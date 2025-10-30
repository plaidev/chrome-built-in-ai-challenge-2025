/**
 * AI Assistant
 * Uses Chrome Prompt API to analyze conversation and suggest next questions
 */

export class AIAssistant {
  constructor() {
    this.session = null;
    this.lastAnalysis = null;
  }

  async initialize() {
    try {
      if (!window.LanguageModel) {
        console.log('Chrome Prompt API (LanguageModel) not available');
        return false;
      }

      const availability = await LanguageModel.availability();
      console.log('LanguageModel availability:', availability);

      const suggestionText = document.getElementById('suggestionText');

      switch (availability) {
        case 'available':
          console.log('🟢 [ai-assistant.js - initialize] Starting LanguageModel.create() for Travel Assistant session...');
          this.session = await LanguageModel.create({
            initialPrompts: [
              {
                role: 'system',
                content: this.getSystemPrompt()
              }
            ]
          });
          console.log('🟢 [ai-assistant.js - initialize] LanguageModel.create() completed - Travel Assistant initialized');
          if (suggestionText) {
            suggestionText.innerHTML = 'Let\'s gather information about the following:<br>1. Destination<br>2. Travel Dates / Duration<br>3. Number of Travelers<br>4. Traveler Profile (age, special needs)<br>5. Activity Type / Interests<br>6. Budget per Person<br>7. Time Preference<br>8. Physical Activity Level<br>9. Group Type (optional)<br>10. Language Preference (optional)<br>11. Transportation (optional)<br>12. Special Requirements (optional)';
          }
          return true;

        case 'downloadable':
          console.log('LanguageModel needs download - waiting for user action');
          if (suggestionText) {
            suggestionText.innerHTML = '📥 AI model download required. Please click the download button.';
          }
          return false;

        case 'downloading':
          console.log('LanguageModel is currently downloading');
          if (suggestionText) {
            suggestionText.innerHTML = '⏳ Downloading the AI model...';
          }
          this.checkDownloadStatus();
          return false;

        case 'unavailable':
          console.log('LanguageModel unavailable on this device');
          if (suggestionText) {
            suggestionText.innerHTML = '❌ The assistant feature is not available on your device.';
          }
          return false;

        default:
          console.warn('Unknown availability status:', availability);
          return false;
      }
    } catch (error) {
      console.error('Failed to initialize Travel Assistant:', error);
      return false;
    }
  }

  async checkDownloadStatus() {
    const checkInterval = setInterval(async () => {
      try {
        const availability = await LanguageModel.availability();
        console.log('Checking LanguageModel download status:', availability);

        if (availability === 'available') {
          clearInterval(checkInterval);

          console.log('🟡 [ai-assistant.js - checkDownloadStatus] Starting LanguageModel.create() after download...');
          this.session = await LanguageModel.create({
            initialPrompts: [
              {
                role: 'system',
                content: this.getSystemPrompt()
              }
            ]
          });

          console.log('🟡 [ai-assistant.js - checkDownloadStatus] LanguageModel.create() completed - Travel Assistant ready after download');

          const suggestionText = document.getElementById('suggestionText');
          if (suggestionText) {
            suggestionText.innerHTML = 'Let\'s gather information about the following:<br>1. Destination<br>2. Travel Dates / Duration<br>3. Number of Travelers<br>4. Traveler Profile (age, special needs)<br>5. Activity Type / Interests<br>6. Budget per Person<br>7. Time Preference<br>8. Physical Activity Level<br>9. Group Type (optional)<br>10. Language Preference (optional)<br>11. Transportation (optional)<br>12. Special Requirements (optional)';
          }
        } else if (availability === 'unavailable') {
          clearInterval(checkInterval);
        }
      } catch (error) {
        console.error('Error checking download status:', error);
        clearInterval(checkInterval);
      }
    }, 3000);
  }

  getSystemPrompt() {
    return `You are an activity search assistant for travelers.
You help staff gather information from customers looking for activities and experiences.

Required information:
1. Destination (Where? City, region, country)
2. Travel Dates / Duration (When? How many days?)
3. Number of Travelers (How many people?)
4. Traveler Profile:
   - Age groups: Adults, Seniors, Kids (specify ages if families)
   - Special needs: Accessibility requirements, Child-friendly needs
5. Activity Type / Interests:
   - Culture & History: Museums, Temples, Historical tours
   - Adventure & Sports: Hiking, Diving, Skiing, Water sports
   - Food & Dining: Cooking classes, Food tours, Wine tasting
   - Entertainment: Theme parks, Shows, Nightlife
   - Relaxation: Spa, Hot springs, Beach activities
   - Nature & Wildlife: Parks, Safaris, Aquariums, Whale watching
6. Budget per Person (How much per activity or per day?)
7. Time Preference:
   - Morning, Afternoon, Evening
   - Full-day, Half-day, Multi-day
8. Physical Activity Level:
   - Easy (minimal walking/effort)
   - Moderate (some walking/activity)
   - Challenging (high physical demands)
9. Group Type (Solo, Couple, Family, Friends, Group tour preference)
10. Language Preference (English guide, Japanese guide, Self-guided with audio)
11. Transportation (Pick-up service needed, Meet at location, Own transportation)
12. Special Requirements (Dietary restrictions, Allergies, Accessibility needs, Other requests)

Analyze the conversation and suggest what items staff should confirm next.
Return your suggestion as plain text in ENGLISH ONLY.
Do not use JSON or markdown, return only the suggestion text.
IMPORTANT: All output must be in English. Do not include any Japanese text.

Response format:
- Only when all important items (1-8) are specifically decided: "Let's proceed with the activity search"
- When multiple items are missing: Start with "Please inquire about the following items:"
- List items with "- " bullet points
- For a single item only: Use the format "Let's ask about ~"

Note: Items not clearly mentioned in the conversation must be asked about. Items 9-12 are optional but helpful.`;
  }

  async analyzeConversation(transcript) {
    if (!this.session || !transcript) return null;

    const suggestionText = document.getElementById('suggestionText');
    if (suggestionText) {
      suggestionText.innerHTML = '<span style="animation: thinking 1.5s infinite;">Thinking...</span>';
    }

    const escapedTranscript = transcript
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');

    const prompt = `
Conversation content:
"${escapedTranscript}"

Information needed for activity search:
1. Destination (Where? City, region, country)
2. Travel Dates / Duration (When? How many days?)
3. Number of Travelers (How many people?)
4. Traveler Profile (Age groups: Adults, Seniors, Kids; Special needs: Accessibility, Child-friendly)
5. Activity Type / Interests (Culture, Adventure, Food, Entertainment, Relaxation, Nature)
6. Budget per Person (How much per activity or per day?)
7. Time Preference (Morning, Afternoon, Evening, Full-day, Half-day)
8. Physical Activity Level (Easy, Moderate, Challenging)
9. Group Type (Solo, Couple, Family, Friends - optional)
10. Language Preference (English guide, Japanese guide, Self-guided - optional)
11. Transportation (Pick-up service, Meet at location, Own transportation - optional)
12. Special Requirements (Dietary restrictions, Allergies, Accessibility - optional)

Analyze the conversation above and return a suggestion for staff.

Response format (strict):
Return only the suggestion text IN ENGLISH. Do not use JSON, markdown, or code blocks.
ALL OUTPUT MUST BE IN ENGLISH. DO NOT INCLUDE ANY JAPANESE TEXT.

Rules:
- Only when all important items (1-8) are clearly mentioned in the conversation: "Let's proceed with the activity search"
- If information is present in the conversation (even if not perfectly detailed), consider it as "collected" - DO NOT ask again
- If 2 or more items are missing: MUST use "Please inquire about the following items:" followed by bullet points with "- " prefix
- ONLY if exactly 1 item is missing: Use the format "Let's ask about ~"
- Items 9-12 are optional, only ask if relevant
- No additional explanations needed
- CRITICAL: Never output multiple "Let's ask about ~" statements separately. If there are multiple items, combine them into ONE "Please inquire about the following items:" list.

Important: Only ask about items that are NOT mentioned in the conversation at all. If the conversation contains the information (like dates, number of people, destination), treat it as collected.

Examples of information that should be treated as "collected":
- Travel Dates: "November 10th to 17th", "from Nov 10 to Nov 17", "7 days in November"
- Destination: "Paris", "in Paris", "will be in Paris"
- Number of Travelers: "three of you", "family of 3", "we are 4 people"
- Traveler Profile: "son is in 4th grade", "traveling with kids", "elderly parents"
- Activity Interests: "Disneyland", "pastry class", "sightseeing", "Eiffel Tower"
- Budget: "$200 per person", "around $200", "budget is $150-200"

Correct response example (multiple items - 2 or more):
Please inquire about the following items:
- Travel dates
- Traveler profile (ages, special needs)
- Activity interests
- Budget per person

Correct response example (single item - exactly 1):
Let's ask about the destination

Wrong response examples:
Let's ask about physical activity level
Let's ask about transportation
Let's ask about language preference
[NEVER output multiple "Let's ask about ~" separately - combine into one list]

{"suggestion": "Let's ask about the destination"}
[Do not wrap in JSON or code blocks]`;

    try {
      let response = '';

      if (this.session.promptStreaming) {
        const stream = await this.session.promptStreaming(prompt);
        let accumulated = '';

        for await (const chunk of stream) {
          accumulated += chunk;

          if (suggestionText && accumulated.trim()) {
            suggestionText.style.opacity = '0.5';
            suggestionText.innerHTML = accumulated.trim().replace(/\n/g, '<br>');
            setTimeout(() => {
              suggestionText.style.opacity = '1';
            }, 100);
          }
        }

        response = accumulated;
      } else {
        response = await this.session.prompt(prompt);
      }

      console.log('Assistant raw response:', response);

      const defaultResponse = 'Please inquire about the following items:\n1. Destination\n2. Travel Dates / Duration\n3. Number of Travelers\n4. Traveler Profile (age, special needs)\n5. Activity Type / Interests\n6. Budget per Person\n7. Time Preference\n8. Physical Activity Level\n9-12. Optional: Group Type, Language, Transportation, Special Requirements';
      const nextQuestion = response.trim() || defaultResponse;

      if (suggestionText && !this.session.promptStreaming) {
        suggestionText.style.opacity = '0.5';
        suggestionText.innerHTML = nextQuestion.replace(/\n/g, '<br>');
        setTimeout(() => {
          suggestionText.style.opacity = '1';
        }, 100);
      }

      this.lastAnalysis = {
        collected: {},
        missing: [],
        nextQuestion: nextQuestion,
        progress: 0
      };

      return this.lastAnalysis;
    } catch (error) {
      console.error('Failed to analyze conversation:', error);
      if (suggestionText) {
        suggestionText.innerHTML = 'Let\'s gather information about the following:<br>1. Destination (Where to go)<br>2. Duration (Number of days/nights)<br>3. Travel dates (Specific departure and return dates)<br>4. Departure point (Airport)<br>5. Budget (Per person)<br>6. Number of travelers<br>7. Travel season (Month, season, holidays, etc.)<br>8. Interests (Activities, places to visit)<br>9. Other requirements (Hotel grade, etc.)';
      }
      return {
        collected: {},
        missing: [],
        nextQuestion: 'Please inquire about the following items:\n1. Area (destination)\n2. Duration (days/nights)\n3. Schedule (specific departure/return dates)\n4. Departure location (airport)\n5. Budget (per person)\n6. Number of people\n7. Departure period (month, season, holidays, etc.)\n8. Preferences (activities, places to visit)\n9. Other (hotel grade, etc.)',
        progress: 0
      };
    }
  }

  async downloadAndCreate() {
    const suggestionText = document.getElementById('suggestionText');

    try {
      if (suggestionText) {
        suggestionText.innerHTML = '⏳ Downloading the AI model... 0%';
      }

      console.log('🟠 [ai-assistant.js - downloadAndCreate] Starting LanguageModel.create() with download...');
      this.session = await LanguageModel.create({
        initialPrompts: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          }
        ],
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            const percent = Math.round(e.loaded * 100);
            console.log(`🟠 [ai-assistant.js - downloadAndCreate] Travel Assistant model downloading: ${percent}%`);
            if (suggestionText) {
              suggestionText.innerHTML = `⏳ Downloading the AI model... ${percent}%`;
            }
          });
        }
      });

      console.log('🟠 [ai-assistant.js - downloadAndCreate] LanguageModel.create() completed - Travel Assistant session created with download');

      if (suggestionText) {
        suggestionText.innerHTML = 'Let\'s gather information about the following:<br>1. Destination (Where to go)<br>2. Duration (Number of days/nights)<br>3. Travel dates (Specific departure and return dates)<br>4. Departure point (Airport)<br>5. Budget (Per person)<br>6. Number of travelers<br>7. Travel season (Month, season, holidays, etc.)<br>8. Interests (Activities, places to visit)<br>9. Other requirements (Hotel grade, etc.)';
      }

      return true;
    } catch (error) {
      console.error('Failed to download and create Travel Assistant:', error);
      if (suggestionText) {
        suggestionText.innerHTML = '❌ Failed to download AI model';
      }
      return false;
    }
  }
}
