import { parseIntent } from "../lib/ai";

// Mock fetch for testing
global.fetch = jest.fn();

describe('AI Integration Tests', () => {
  beforeEach(() => {
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
  });

  test("parseIntent falls back to search", async () => {
    const mock = { 
      top: { label: "SEARCH_QUERY", confidence: 0.55, args: { q: "blue silk scarf" } },
      ranked: [{ label: "SEARCH_QUERY", confidence: 0.55, args: { q: "blue silk scarf" } }],
      lang: "auto",
      mood: null
    };
    
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      json: async () => mock,
    } as Response);

    const res = await parseIntent("blue silk scarf");
    expect(res.top.label).toBe("SEARCH_QUERY");
    expect(res.top.args.q).toBe("blue silk scarf");
  });

  test("parseIntent handles luxury intent", async () => {
    const mock = { 
      top: { label: "SHOW_COLLECTION", confidence: 0.92, args: { collection: "luxury" } },
      ranked: [{ label: "SHOW_COLLECTION", confidence: 0.92, args: { collection: "luxury" } }],
      lang: "auto",
      mood: null
    };
    
    (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      json: async () => mock,
    } as Response);

    const res = await parseIntent("show me luxury items");
    expect(res.top.label).toBe("SHOW_COLLECTION");
    expect(res.top.args.collection).toBe("luxury");
  });
});