import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const { profile, history, userQuery } = await req.json();

    if (!userQuery || !profile) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. If Gemini API Key is available, call the real Gemini 2.5 API
    if (GEMINI_API_KEY) {
      try {
        const aiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
        const systemPrompt = `You are EcoCoach, a Staff Sustainability Systems Analyst.
Review the following user profile and metrics:
User Name: ${profile.displayName}
Onboarding Habits: ${JSON.stringify(profile.sustainabilityProfile || {})}
Current EcoScore: ${profile.ecoScore || 70}/100
Current Streak: ${profile.currentStreak || 0} days

Answer the user's sustainability questions using local context (India region).
Ensure advice is specific, highly actionable, and includes:
1. Three customized local recommendations.
2. One weekend challenge.
3. Estimated savings (in kg CO2 and INR).`;

        const model = aiClient.getGenerativeModel({
          model: 'gemini-2.5-flash',
          systemInstruction: systemPrompt
        });

        // Filter out the welcome message to ensure turns alternate User/Model properly
        const chatHistory = (history || [])
          .filter((msg: any) => msg.id !== 'welcome')
          .map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          }));

        const result = await model.generateContent({
          contents: [
            ...chatHistory,
            { role: 'user', parts: [{ text: userQuery }] }
          ]
        });

        const reply = result.response.text();
        return NextResponse.json({ reply });
      } catch (err: any) {
        console.error('Error in real Gemini API route execution, falling back to mock:', err);
      }
    }

    // 2. SMART MOCK FALLBACK (If key is missing or API call fails)
    const reply = await getSmartMockResponse(profile, history || [], userQuery);
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Error in API chat route handler:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

/**
 * Advanced Conversational Context-Aware Mock Engine
 */
async function getSmartMockResponse(profile: any, history: any[], query: string): Promise<string> {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));

  const queryLower = query.trim().toLowerCase();

  // 1. GREETINGS & INTROS
  const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'howdy', 'yo', 'who are you', 'what is your name'];
  const isGreeting = greetings.some(g => queryLower === g || queryLower.startsWith(g + ' ') || queryLower.includes('greet') || queryLower.includes('how are you'));
  if (isGreeting) {
    return `Hello **${profile.displayName}**! Glad to chat with you today. 😊

As your **EcoCoach**, I'm ready to help you lower your carbon footprint in India. We can explore:
- **Travel** 🚗 (EV scooters, local metro vs petrol car emissions, carpooling)
- **Diet & Food** 🥗 (ragi and jowar water savings, local crop swapping, plant-based meals)
- **Energy** ⚡ (AC setting guidelines, Surya Ghar solar rooftops, BEE energy star ratings)
- **Waste & Composting** ♻️ (wet/dry segregation, microplastic prevention, zero-waste champions)

Which of these sustainability topics or hacks would you like to explore or optimize today?`;
  }

  // 2. THANK YOUS & CONVERSATIONAL CLOSINGS
  const thanks = ['thanks', 'thank you', 'cool', 'awesome', 'great', 'ok', 'okay', 'perfect', 'got it', 'bye', 'goodbye'];
  const isThanks = thanks.some(t => queryLower === t || queryLower.startsWith(t + ' ') || queryLower.includes('thank you'));
  if (isThanks) {
    return `You're very welcome, **${profile.displayName}**! 🌟

Remember, minor habit changes (like switching off standby plugs, setting your AC to 25°C, or choosing millets) add up to massive offsets when scaled across our global simulator. 

What should we check next? You can check out active **Missions** on your dashboard or ask me about **Home Solar Rooftops**!`;
  }

  // 3. SCAN HISTORY FOR CONTEXT
  let lastTopic: 'travel' | 'diet' | 'energy' | 'waste' | 'general' = 'general';
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.role === 'model') {
      const content = msg.content.toLowerCase();
      if (content.includes('commuting') || content.includes('metro') || content.includes('scooter') || /\bev\b/i.test(content) || content.includes('travel')) {
        lastTopic = 'travel';
        break;
      }
      if (content.includes('diet') || content.includes('food') || content.includes('millet') || content.includes('ragi') || content.includes('water footprint')) {
        lastTopic = 'diet';
        break;
      }
      if (content.includes('energy') || content.includes('electricity') || /\bac\b/i.test(content) || content.includes('solar') || content.includes('surya ghar')) {
        lastTopic = 'energy';
        break;
      }
      if (content.includes('waste') || content.includes('compost') || content.includes('segregat') || content.includes('recycle')) {
        lastTopic = 'waste';
        break;
      }
    }
  }

  // 4. DETECT SPECIFIC INTENTS
  const isSolar = queryLower.includes('solar') || queryLower.includes('panel') || queryLower.includes('rooftop') || queryLower.includes('surya ghar');
  const isAC = /\bac\b/i.test(queryLower) || queryLower.includes('air cond') || queryLower.includes('cooling') || queryLower.includes('temperature') || queryLower.includes('compressor');
  const isMetro = queryLower.includes('metro') || queryLower.includes('train') || queryLower.includes('transit') || queryLower.includes('bus');
  const isEV = /\bev\b/i.test(queryLower) || queryLower.includes('electric') || queryLower.includes('scooter') || queryLower.includes('ather') || queryLower.includes('ola');
  const isMillet = queryLower.includes('millet') || queryLower.includes('ragi') || queryLower.includes('jowar') || queryLower.includes('bajra') || queryLower.includes('grain');
  const isDiet = queryLower.includes('diet') || queryLower.includes('food') || queryLower.includes('eat') || queryLower.includes('meat') || queryLower.includes('vegan') || queryLower.includes('vegetarian');
  const isWaste = queryLower.includes('waste') || queryLower.includes('recycle') || queryLower.includes('compost') || queryLower.includes('segregat') || queryLower.includes('trash') || queryLower.includes('garbage');
  const isWater = queryLower.includes('water') || queryLower.includes('tap') || queryLower.includes('aerator') || queryLower.includes('shower');
  const isMissions = queryLower.includes('mission') || queryLower.includes('challenge') || queryLower.includes('streak') || /\bxp\b/i.test(queryLower);

  // Check if any specific topic was matching
  const hasTopicMatch = isSolar || isAC || isMetro || isEV || isMillet || isDiet || isWaste || isWater || isMissions;

  // 5. PROCESS FOLLOW-UP CHECKS (If query is like "why", "how", "tell me more" without specifying a new topic)
  const isFollowUp = !hasTopicMatch && (
    queryLower.includes('why') || 
    queryLower.includes('how') || 
    queryLower.includes('tell me more') || 
    queryLower.includes('what else') || 
    queryLower.includes('suggest') || 
    queryLower.includes('detail') ||
    queryLower.includes('explain') ||
    queryLower.includes('give me tips')
  );

  if (isFollowUp) {
    if (lastTopic === 'travel') {
      return `To explain further about **Travel & Commute savings in India**:
- **Why Metros are highly efficient**: Indian metros (like Namma Metro, Delhi Metro, BEST) run on dedicated electric lines that distribute energy efficiently. This lowers your per-commuter carbon emissions from **120g/km (petrol car)** to less than **15g/km**.
- **EV Scooter Math**: Charging a typical EV scooter battery consumes roughly 3 units of electricity (costing ₹24 at standard ₹8/unit utility rates) and grants a range of 80km, meaning a running cost of just ₹0.30 per km!
- **Tire Pressure Optimization**: Maintaining correct tire pressure reduces road friction, saving up to **4% petrol** automatically.

Would you like tips on how to plan a multi-modal commute in your city using local buses?`;
    }

    if (lastTopic === 'diet') {
      return `Here are more details about **Diet & Water footprints**:
- **Millet Farming Advantage**: Crops like Ragi, Jowar, and Bajra are native dryland crops. Unlike polished white rice, they don't require flooded paddies, saving almost **6,000 liters of water per kg cultivated**!
- **Import Emissions (Food Miles)**: Purchasing imported apples or berries has high air-freight transport overhead. Choosing local, seasonal fruits like mangoes or bananas cuts shipping carbon to near zero.
- **Landfill Methane**: Wet kitchen waste, when trapped in mixed garbage bags in oxygen-deprived landfills, undergoes anaerobic decomposition. This releases **methane**, which traps heat 25x more effectively than CO2. Composting at home converts this waste into soil nutrients instead.

Would you like a simple millet-based recipe to replace your daily rice/wheat meal?`;
    }

    if (lastTopic === 'energy') {
      return `Deep-diving into **Home Energy optimizations**:
- **How AC settings save power**: Setting your AC temperature to 25°C instead of 18°C consumes up to **24% less power** because the compressor cycle shuts off as soon as the target temperature is reached, maintaining thermal comfort with less effort.
- **BEE Energy Star Ratings**: A 5-Star BEE inverter refrigerator consumes roughly 150 kWh/year, while a standard 2-Star non-inverter model consumes 380 kWh/year, saving you about ₹1,800 annually.
- **Vampire Standby Load**: Up to 10% of home electricity bills comes from appliances on "standby mode" (TV consoles, microwaves, chargers). Unplugging them when not in use stops this vampire drain.

Would you like to know more about installing BLDC ceiling fans which consume only 28W compared to 75W for standard fans?`;
    }

    if (lastTopic === 'waste') {
      return `To expand on **Waste & Composting offsets**:
- **Keeping Recyclables Dry**: If cardboard, paper, or clean plastics get contaminated by food scraps, they lose value and cannot be processed by local waste pickers (kabadiwalas). Keeping them dry is crucial.
- **Terracotta Clay Composters**: Using a three-tier clay composter (like the traditional 'Khamba') manages kitchen scraps cleanly. The clay walls breathe, preventing odor and accelerating decomposition.
- **Avoid Single-use Plastic**: Keeping two reusable canvas bags in your vehicle saves you from paying plastic bag fees and prevents long-term microplastic accumulation in our soils.

What aspect of home composting would you like to set up first?`;
    }

    // Default follow-up if last topic was general
    return `To give you more context: Based on your current EcoScore of **${profile.ecoScore || 70}/100**, your largest area of potential carbon offsets is likely in home energy or travel. 

Here are three universal actions you can take today:
1. Unplug standby power strips when leaving the house (saves ~₹150/month).
2. Carry a reusable cloth bag for groceries (avoids single-use plastic).
3. Set your AC to 25°C and run a ceiling fan concurrently to circulate cool air.

What area would you like to build a custom habit plan for first?`;
  }

  // 6. PROCESS INTENT MATCHES (If specific keywords matched)

  if (isSolar) {
    return `Hi **${profile.displayName}**! Residential solar rooftop installation is one of the most high-impact changes you can make in India.

Here are the key details about **Solar Rooftop Swaps**:
1. **PM Surya Ghar Scheme**: The government offers a subsidy of up to **₹78,000** for standard 3kW installations.
2. **Financial Savings**: A 3kW system produces around 360 units (kWh) of electricity per month. At ₹8.00 per unit, this saves **₹2,880.00 per month** (nearly ₹34,500/year) and can bring your utility bill to ₹0.
3. **Carbon Reductions**: Shifting to solar offsets coal-heavy grid electricity, saving roughly **3.6 metric tons (3600 kg) of CO2** per year.

**Weekend Challenge**: "Solar Feasibility Audit" — Check your rooftop area (needs ~300 sq.ft for 3kW) and look up local solar installers on the national PM Surya Ghar portal.

**Estimated Savings**:
- 🟢 CO2 Saved: **300 kg CO2 / month**
- 💰 Money Saved: **₹2,880.00 / month**`;
  }

  if (isAC) {
    return `Hi **${profile.displayName}**! Air conditioning accounts for the majority of residential electricity consumption during Indian summers.

Here is how you can optimize your AC cooling:
1. **The 25°C Sweet Spot**: Every degree you raise your AC temperature settings (from 18°C up to 25°C) saves approximately **6% electricity**. Shifting from 18°C to 24°C-25°C reduces consumption by up to **24%-30%**!
2. **Pair with BLDC Fans**: Run your ceiling fan (preferably a BEE 5-Star BLDC fan) at a low speed to circulate air. The breeze effect makes 25°C feel like 22°C.
3. **Clean the Filters**: Dusty AC filters restrict airflow, forcing the compressor to work harder and consume 15% more power. Clean them every two weeks!

**Weekend Challenge**: "AC Thermostat Lock" — Set your home AC to exactly 25°C for the next 48 hours and use a ceiling fan to distribute the cool air.

**Estimated Savings**:
- 🟢 CO2 Saved: **12 kg CO2 / week**
- 💰 Money Saved: **₹160.00 / week** (saved on electrical utility bills)`;
  }

  if (isEV || isMetro) {
    const isMetroSpecific = isMetro && !isEV;
    return `Hello **${profile.displayName}**! Transportation is the single fastest sector to achieve personal carbon offsets.

Here are the best ways to optimize your commutes in India:
1. **Switch to Metro/Local Trains**: Commuting via electric metros emits **85% less CO2** per kilometer compared to a petrol car. Metro grids are highly energy-efficient.
2. **EV Scooters for Errands**: Short errands (2-5km) are ideal for electric two-wheelers (Ather, Ola, TVS iQube). Running costs are only **₹0.25-₹0.30 per km** vs ₹3.00 for petrol!
3. **Carpooling**: Using ride-sharing apps (Quick Ride, BlaBlaCar) for regular office runs splits emissions and fuel costs.

**Weekend Challenge**: ${isMetroSpecific ? `"Bus & Metro Explorer" — Plan and execute your weekend travel exclusively using the local metro/bus lines.` : `"Short Errand Walk" — Replace all short scooter trips under 2km this weekend with walking or cycling.`}

**Estimated Savings**:
- 🟢 CO2 Saved: **15 kg CO2e**
- 💰 Money Saved: **₹500.00** (saved on petrol fuel and parking charges)`;
  }

  if (isMillet) {
    return `Hi **${profile.displayName}**! Millets are indigenous Indian super-grains that are incredibly eco-friendly.

Here is why swapping white rice for millets is high impact:
1. **Massive Water Savings**: Rice paddies require massive water inundation. Native millets (Ragi, Jowar, Bajra) are dryland crops that consume **90% less ground water** to grow, saving **6,000 liters of water per kg**!
2. **Climate Resiliency**: Millets grow in dry, low-fertility soils and do not require heavy chemical fertilizers, reducing soil degradation.
3. **Nutritional Boost**: Millets have a low glycemic index and are rich in iron, calcium, and dietary fiber.

**Weekend Challenge**: "Millet Breakfast Swapper" — Replace your morning white rice idli or wheat upma with Ragi malt, Jowar roti, or Foxtail Millet upma.

**Estimated Savings**:
- 🟢 Water Saved: **6,000 Liters** (per kg swapped)
- 🟢 CO2 Saved: **1.5 kg CO2e**
- 💰 Money Saved: **₹80.00** (sourced locally from neighborhood shops)`;
  }

  if (isDiet) {
    return `Hello **${profile.displayName}**! Shifting your food choices has an immediate, compound benefit on global emissions and water footprints.

Here are 3 customized food recommendations for India:
1. **Embrace "Meatless Mondays"**: Shifting one day a week to a purely plant-based diet saves about **15 kg of CO2** per month.
2. **Buy Local and Seasonal**: Choose local seasonal fruits (mangoes, bananas, guavas) over imported ones (apples, kiwis). This avoids the heavy shipping/air-freight carbon overhead.
3. **Reduce Dairy Consumption**: Dairy farming is a major source of methane. Swap some of your dairy usage with plant-based millets or almond milk options.

**Weekend Challenge**: "Zero-Waste Chef" — Prepare a complete lunch utilizing only leftovers or local ingredients stored in your fridge, leaving zero waste.

**Estimated Savings**:
- 🟢 CO2 Saved: **8 kg CO2e**
- 💰 Money Saved: **₹350.00** (saved on dining out / imported groceries)`;
  }

  if (isWaste) {
    return `Hello **${profile.displayName}**! Proper waste disposal and composting are critical to lowering methane emissions.

Here are 3 tailored waste segregation recommendations:
1. **Dry vs Wet Segregation**: Keep dry recyclables (clean paper, cardboard, bottles) separate and dry. Contaminated paper cannot be processed by local kabadiwalas.
2. **Home Clay Composting**: Use terracotta pots or aerated bins for vegetable peels and coffee grounds. This prevents food scraps from generating methane in landfills.
3. **Carry Reusable Canvas Bags**: Keep cloth tote bags in your vehicle to eliminate single-use plastic bag fees and pollution.

**Weekend Challenge**: "Dry Waste sorting" — Segregate 100% of your cardboard boxes, plastic wrappers, and metal cans this week, and drop them off with your neighborhood recycler.

**Estimated Savings**:
- 🟢 CO2 Saved: **6 kg CO2e**
- 💰 Money Saved: **₹120.00**`;
  }

  if (isWater) {
    return `Hi **${profile.displayName}**! Conserving water directly reduces the energy required to pump and filter water to your home.

Here is how you can reduce water consumption:
1. **Tap Aerators**: Installing ₹150 aerators onto kitchen and bathroom taps cuts water flow rate by **50%** without reducing pressure!
2. **BWR / RO Wastewater Recovery**: Channel the drain pipe of your home RO water filter into a bucket. Use this water for mopping floors or watering plants (saves 30+ Liters daily).
3. **Bucket Bath Swap**: Shifting from a 10-minute shower to a bucket bath saves up to **60 Liters** of water per session.

**Weekend Challenge**: "RO Wastewater Capture" — Setup a recovery bucket at your RO filter outlet and use it to water all home plants this weekend.

**Estimated Savings**:
- 🟢 Water Saved: **250 Liters**
- 💰 Money Saved: **₹15.00** (converts to utility bills/tanker savings)`;
  }

  if (isMissions) {
    return `Hi **${profile.displayName}**! Completing missions is the fastest way to increase your EcoScore and plant trees.

Here is how the system works:
1. **XP Rewards**: Each completed challenge awards you XP (usually 100 to 300 XP).
2. **Badges**: Complete milestone tasks (e.g., logging 5 commutes) to unlock badges like "Zero Waste Champion".
3. **Global Tree planting**: For every 1,000 XP accumulated collectively by the community, we add a virtual tree to the **Community Forest**.

**Weekend Challenge**: Open the **Missions** tab and complete the "Vampire Power Hunt" challenge today to earn an instant 100 XP boost!`;
  }

  // 7. DEFAULT / FALLBACK
  return `Hi **${profile.displayName}**! Interesting question about "${query}". 

While I'm operating in context-aware demo mode, here is a general sustainability tip for India:
- **AC temperature setting**: Set your AC to 25°C and use a ceiling fan to circulate the cool breeze. This simple adjustment reduces electricity consumption by up to **24%**.
- **Millet swapping**: Swap white rice for local Ragi or Jowar. It requires **90% less ground water** to cultivate.

Could you ask me a question related to **Travel**, **Diet**, **Energy**, or **Waste**? You can also click one of the suggested prompt tabs at the bottom to explore these topics directly!`;
}
