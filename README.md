WANDERLUST AI AGENT 

An intelligent agentic travel planner powered by Google's Gemini that autonomously plans complete trips through function calling, visual analysis, and multi-step reasoning.

#API Key Disclaimer
*IMPORTANT: This application requires a Google Gemini API key to function. By using this application, you agree to the following

 You are responsible for obtaining your own Gemini API key from [Google AI Studio](https://ai.google.dev/)
 All API usage and associated costs are your responsibility
 You must comply with [Google's Gemini API Terms of Service](https://ai.google.dev/terms)
 API keys should NEVER be committed to version control or shared publicly
 Monitor your API usage through Google AI Studio to avoid unexpected charges
 The application makes multiple API calls per trip generation (typically 5-10 requests)
 Keep your `.env.local` file secure and never share it

*The developers of this application are not responsible issues arising from API key usage

#What Makes It a Agent?
Unlike traditional chatbots, this AI agent acts autonomously it analyzes your preferences, calls tools strategically, makes budget-aware decisions, and orchestrates multi-step workflows to generate comprehensive travel plans. It doesn't just respond. it thinks, plans, and executes

#Key Features
*Visual Inspiration Analysis: Upload destination images and the AI analyzes the vibe, aesthetic, and style to understand your travel preferences (luxury, adventure, cultural, relaxation)
*Autonomous Function Calling: The agent uses three tools `search_transport`, `search_accommodation`, `search_food` calling them intelligently based on your requirements and iterating through responses
*Budget-Aware Planning: Specify total or per-person budget in USD/INR. The agent distributes costs across transport, accommodation, food, and activities while ensuring you stay within limits
*Multi-Option Generation: For every major decision, the AI generates exactly 3 distinct options at different price points, giving you choice while maintaining quality
*Detailed Itineraries: Day-by-day plans with themes, time-blocked activities, explicit meal planning (breakfast, lunch, dinner), cost estimates, locations, and contextual notes
*Advanced AI Toolkit: Visual content analysis with Gemini 3 Pro, deep reasoning for complex queries, and real-time location search using Google Maps grounding

#How It Works
The agent follows a multi-step autonomous workflow: (1) Collects user inputs (origin, destination, dates, budget, preferences, optional images), (2) Analyzes inspiration images to extract travel vibe, (3) Calls function tools to search transport/accommodation/food options, (4) Distributes budget intelligently across fixed and variable costs, (5) Generates themed daily itineraries with time-specific activities, (6) Selects smart defaults balancing cost and quality.
The Gemini API integration uses `gemini-2.5-flash` for trip planning with function calling. Images are base64-encoded and sent as multimodal input. The agent iterates through up to 7 conversation steps, calling tools and synthesizing responses until it generates a complete JSON trip plan.

#Technology Stack
React 19.2.3, TypeScript 5.8, Vite 6.2, Google GenAI SDK 1.33.0, Tailwind CSS

#Installation & Setup
*Prerequisites: Node.js v16 or higher

1. *Clone the repository
   ```bash
   git clone https://github.com/meenashreej-cmd/wanderlust-AI-Agent.git
   cd wanderlust-AI-Agent
   ```
2. *Install dependencies
   ```bash
   npm install
   ```
3. *Get your Gemini API Key
    Visit Google AI Studio
    Create a new API key
   *IMPORTANT: Keep this key secure and never share it
4. *Configure environment variables
    Create a `.env.local` file in the project root
    Add your API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
    *NEVER commit `.env.local` to Git (already in .gitignore)
5. *Run the development server
   ```bash
   npm run dev
   ```
6. *Open in browser
   Navigate to `http://localhost:3000`(local host)

#Usage
*Demo Login: Use credentials `user_123` / `password` or register a new account
*Create Trip: Dashboard - New Trip - Fill 3-step form (destination, dates, budget, preferences, optional image) - Generate Itinerary - View plan with 3 options each for transport/accommodation/dining - Select preferences - Simulate bookings
*AI Toolkit: Access specialized features for visual analysis, deep reasoning, and maps-based search

#Security Practice
 Never commit `.env.local` or API keys to version control
 Rotate your API key if accidentally exposed
 Use environment variables for all sensitive data
 Monitor API usage regularly through Google AI Studio
 Consider implementing rate limiting for production use

This is an educational project demonstrating agentic AI capabilities
