import { Request, Response } from 'express';
import { ScannerService } from '../services/scanner.service';
import { GoogleGenAI, Type } from '@google/genai';

export class ScanController {
  private scannerService: ScannerService;

  constructor() {
    this.scannerService = new ScannerService();
  }

  public scanFree = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ error: 'URL saknas' });
        return;
      }

      const startTime = Date.now();
      
      // Artificial delay for UX (matching the original implementation)
      await new Promise(resolve => setTimeout(resolve, 8000));

      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteScannerBot/1.0)' }
      });

      if (!response.ok) {
        throw new Error(`Webbplatsen svarade med status ${response.status}`);
      }

      const html = await response.text();
      const loadTime = Date.now() - startTime;

      const context = {
        loadTime,
        isHttps: url.startsWith('https://'),
        headers: response.headers as unknown as Headers
      };

      const result = await this.scannerService.scan(html, context);
      res.json(result);
    } catch (error: any) {
      console.error('Free scan error:', error);
      res.status(500).json({ error: `Analys misslyckades: ${error.message}` });
    }
  };

  public scanPremium = async (req: Request, res: Response): Promise<void> => {
    try {
      const { url } = req.body;
      if (!url) {
        res.status(400).json({ error: 'URL saknas' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        res.status(500).json({ error: 'AI-konfiguration saknas på servern.' });
        return;
      }

      const genAI = new GoogleGenAI({ apiKey });
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro', // Using a stable version
      });

      const prompt = `Du är en expert på webbutveckling, cybersäkerhet och SEO. Analysera källkoden, strukturen och innehållet på följande webbplats: ${url}. 
      Identifiera specifika kodfel (t.ex. syntaxfel, dåligt formaterad kod, osäkra kodmönster), buggar, SEO-problem, säkerhetsbrister och prestandaproblem. 
      Var extremt noggrann och ge konkreta, tekniska rekommendationer. Svara ENDAST på svenska.`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              metrics: {
                type: Type.OBJECT,
                properties: {
                  seo: { type: Type.NUMBER },
                  performance: { type: Type.NUMBER },
                  security: { type: Type.NUMBER },
                  accessibility: { type: Type.NUMBER },
                  code: { type: Type.NUMBER }
                },
                required: ["seo", "performance", "security", "accessibility", "code"]
              },
              issues: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    recommendation: { type: Type.STRING },
                    affectedUrl: { type: Type.STRING },
                    codeSnippet: { type: Type.STRING }
                  },
                  required: ["category", "severity", "title", "description", "recommendation"]
                }
              }
            },
            required: ["overallScore", "summary", "metrics", "issues"]
          }
        }
      });

      const responseText = result.response.text();
      const scanResult = JSON.parse(responseText);

      res.json(scanResult);
    } catch (error: any) {
      console.error('Premium scan error:', error);
      res.status(500).json({ error: `AI-analysen misslyckades: ${error.message}` });
    }
  };
}