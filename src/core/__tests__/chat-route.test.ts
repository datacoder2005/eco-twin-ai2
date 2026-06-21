// Mock next/server before any imports to avoid environment issues in Jest
jest.mock('next/server', () => {
  return {
    NextRequest: class MockRequest {
      body: any;
      headers: Headers;
      constructor(body: any) {
        this.body = body;
        this.headers = new Headers();
      }
      async json() {
        return this.body;
      }
    },
    NextResponse: {
      json: (data: any, init?: any) => {
        return {
          status: init?.status || 200,
          json: async () => data,
        };
      }
    }
  };
});

import { POST } from '../../app/api/chat/route';
import { NextRequest } from 'next/server';

describe('AI Coach API Route Handler Tests', () => {
  const sampleProfile = {
    displayName: 'Priyankar Mitra',
    ecoScore: 75,
    currentStreak: 4,
    sustainabilityProfile: {
      transportation: 'combustion',
      diet: 'meat_heavy',
      electricityMonthlyKwh: 350,
      waterMonthlyLiters: 9000,
      shoppingFrequency: 'frequent',
      wasteRecyclePercentage: 10,
    }
  };

  beforeEach(() => {
    jest.resetModules();
    delete process.env.GEMINI_API_KEY;
    delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  });

  test('should return 400 if userQuery or profile is missing', async () => {
    const req = new NextRequest({ profile: sampleProfile });
    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe('Missing required parameters');
  });

  test('should return a friendly greeting when the user says hello', async () => {
    const req = new NextRequest({
      profile: sampleProfile,
      history: [],
      userQuery: 'Hello there'
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.reply).toContain('Hello **Priyankar Mitra**!');
    expect(data.reply).toContain('Travel');
    expect(data.reply).toContain('Diet & Food');
    expect(data.reply).toContain('Energy');
  });

  test('should return solar rooftop information when matching solar intent', async () => {
    const req = new NextRequest({
      profile: sampleProfile,
      history: [],
      userQuery: 'Tell me about solar rooftop panels'
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.reply).toContain('PM Surya Ghar Scheme');
    expect(data.reply).toContain('₹78,000');
    expect(data.reply).toContain('3.6 metric tons');
  });

  test('should handle AC temperature savings matching energy intent', async () => {
    const req = new NextRequest({
      profile: sampleProfile,
      history: [],
      userQuery: 'How does AC temperature affect electricity bills?'
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.reply).toContain('The 25°C Sweet Spot');
    expect(data.reply).toContain('BLDC Fans');
    expect(data.reply).toContain('Estimated Savings');
  });

  test('should track conversation history to handle follow-up question context', async () => {
    const history = [
      { id: 'welcome', role: 'model', content: 'Welcome' },
      { id: 'user_q', role: 'user', content: 'What about my AC?' },
      { id: 'model_a', role: 'model', content: 'Keep your AC temperature setting to 25 degrees.' }
    ];

    const req = new NextRequest({
      profile: sampleProfile,
      history: history,
      userQuery: 'Explain why that helps'
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.reply).toContain('How AC settings save power');
    expect(data.reply).toContain('compressor cycle shuts off');
    expect(data.reply).toContain('Vampire Standby Load');
  });
});
