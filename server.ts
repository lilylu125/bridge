import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_LECTURE_TEXT = `[11:52] A mole is a counting unit, like a dozen, but much bigger. One mole of anything holds about 6.022 × 10^23 particles. This number is called Avogadro's number.
[13:30] The molar mass tells you how many grams one mole of a substance weighs. You find it by adding up the atomic masses of every atom in the formula. For water, H2O, that's two hydrogens at 1.008 and one oxygen at 16.00, so about 18.02 grams per mole.
[14:20] To turn grams into moles, divide the mass by the molar mass. For example, 36 grams of water divided by 18 grams per mole gives 2 moles.
[22:10] In a balanced equation, the coefficients give you the mole ratio. In 2H2 + O2 → 2H2O, two moles of hydrogen react with one mole of oxygen to make two moles of water.`;

const PORT = 3000;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function normalizeTimestampChip(raw: string, lecturePrefix = "Lecture 7"): string {
  const match = raw.match(/(\d{1,2}:\d{2})/);
  if (match) {
    return `${lecturePrefix} · ${match[1]}`;
  }
  return raw.startsWith(lecturePrefix) ? raw : `${lecturePrefix} · 11:52`;
}

function buildAskFallback(
  question: string,
  lecturePrefix = "Lecture 7",
  lectureText = SAMPLE_LECTURE_TEXT
): {
  answer: string;
  timestamps: string[];
  covered: boolean;
} {
  const q = question.toLowerCase();

  // Check CS lecture fallback if active
  if (lectureText.includes("recursive")) {
    if (q.includes("base case") || q.includes("crash") || q.includes("forever")) {
      return {
        answer:
          "Every recursive function needs a base case that stops the calls from repeating forever; without it, the call stack fills up and crashes.",
        timestamps: [`${lecturePrefix} · 04:10`],
        covered: true,
      };
    }
    if (q.includes("stack") || q.includes("trace")) {
      return {
        answer:
          "Tracing a call stack means writing down each active call from bottom to top until the base case returns a value back up the chain.",
        timestamps: [`${lecturePrefix} · 14:30`],
        covered: true,
      };
    }
    if (q.includes("binary") || q.includes("log") || q.includes("search")) {
      return {
        answer:
          "An array search that splits a sorted list in half each step runs in O(log n) time, faster than checking items one by one in O(n).",
        timestamps: [`${lecturePrefix} · 19:45`],
        covered: true,
      };
    }
    if (q.includes("recurs")) {
      return {
        answer:
          "In a recursive step, the function calls itself on a smaller piece of the original problem, moving closer to the base case each time.",
        timestamps: [`${lecturePrefix} · 09:15`],
        covered: true,
      };
    }
    return {
      answer: "That isn't covered in this lecture. Try asking your TA.",
      timestamps: [],
      covered: false,
    };
  }

  // Check Business lecture fallback if active
  if (lectureText.includes("Contribution margin")) {
    if (q.includes("fixed")) {
      return {
        answer:
          "Fixed costs stay the same each month no matter how many units you sell, such as rent or equipment leases.",
        timestamps: [`${lecturePrefix} · 06:20`],
        covered: true,
      };
    }
    if (q.includes("variable")) {
      return {
        answer:
          "Variable cost per unit is the expense tied to each extra item made, like materials or packaging.",
        timestamps: [`${lecturePrefix} · 11:40`],
        covered: true,
      };
    }
    if (q.includes("contribution") || q.includes("margin")) {
      return {
        answer:
          "Contribution margin per unit equals selling price minus variable cost per unit, showing how much each sale contributes toward fixed costs.",
        timestamps: [`${lecturePrefix} · 15:10`],
        covered: true,
      };
    }
    if (q.includes("break-even") || q.includes("break even")) {
      return {
        answer:
          "The break-even quantity is fixed costs divided by contribution margin per unit, where total revenue equals total cost and profit is zero.",
        timestamps: [`${lecturePrefix} · 21:05`],
        covered: true,
      };
    }
    return {
      answer: "That isn't covered in this lecture. Try asking your TA.",
      timestamps: [],
      covered: false,
    };
  }

  // Default Chemistry Lecture 7 fallbacks
  if (q.includes("co2") || q.includes("carbon dioxide")) {
    return {
      answer:
        "To find the molar mass of any formula, add up the atomic masses of every atom in the formula (for example, water H2O uses two hydrogens at 1.008 plus one oxygen at 16.00 to get about 18.02 g/mol). Try applying that same step to count each atom in your formula.",
      timestamps: [`${lecturePrefix} · 13:30`],
      covered: true,
    };
  }

  if (q.includes("avogadro") || q.includes("6.022") || q.includes("particle") || q.includes("dozen")) {
    return {
      answer:
        "A mole is a counting unit, similar to a dozen, where one mole of any substance holds about 6.022 × 10^23 particles. That count is called Avogadro's number.",
      timestamps: [`${lecturePrefix} · 11:52`],
      covered: true,
    };
  }

  if (q.includes("molar mass") || q.includes("weigh") || q.includes("atomic mass")) {
    return {
      answer:
        "Molar mass tells you how many grams one mole of a substance weighs. You calculate it by adding the atomic masses of every atom in the chemical formula, such as 18.02 grams per mole for H2O.",
      timestamps: [`${lecturePrefix} · 13:30`],
      covered: true,
    };
  }

  if (q.includes("gram") || q.includes("convert") || q.includes("divide") || q.includes("36")) {
    return {
      answer:
        "To convert grams into moles, divide the sample mass by the substance's molar mass. For instance, 36 grams of water divided by 18 grams per mole gives 2 moles.",
      timestamps: [`${lecturePrefix} · 14:20`],
      covered: true,
    };
  }

  if (q.includes("equation") || q.includes("ratio") || q.includes("coefficient") || q.includes("2h2") || q.includes("o2")) {
    return {
      answer:
        "In a balanced chemical equation, the coefficients give the mole ratio between reactants and products. In 2H2 + O2 → 2H2O, 2 moles of hydrogen react with 1 mole of oxygen to make 2 moles of water.",
      timestamps: [`${lecturePrefix} · 22:10`],
      covered: true,
    };
  }

  if (q.includes("mole")) {
    return {
      answer:
        "A mole is a counting unit equal to about 6.022 × 10^23 particles, and its mass in grams is the molar mass. You can divide grams by molar mass to find moles.",
      timestamps: [
        `${lecturePrefix} · 11:52`,
        `${lecturePrefix} · 13:30`,
        `${lecturePrefix} · 14:20`,
      ],
      covered: true,
    };
  }

  return {
    answer: "That isn't covered in this lecture. Try asking your TA.",
    timestamps: [],
    covered: false,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.post("/api/lecture/explain-simpler", async (req, res) => {
    const chunkText = typeof req.body?.chunkText === "string" ? req.body.chunkText : SAMPLE_LECTURE_TEXT;
    const lectureText = typeof req.body?.lectureText === "string" ? req.body.lectureText : SAMPLE_LECTURE_TEXT;
    const lecturePrefix = typeof req.body?.lecturePrefix === "string" ? req.body.lecturePrefix : "Lecture 7";
    const ai = getAiClient();

    const fallback = {
      explanation: lectureText.includes("recursive")
        ? "A recursive function solves a big task by calling itself on a slightly smaller version until it hits a stopping rule called the base case. Tracing the stack means listing each waiting call until the base case sends an answer back up. Meanwhile, binary search cuts a sorted list in half at every step so it finds items much faster than checking one by one."
        : lectureText.includes("Contribution margin")
          ? "Fixed costs are monthly bills like rent that never change with sales, while variable costs grow with every unit you make. Subtracting variable cost from the price tells you how much profit each sale leaves to pay off rent. Divide fixed costs by that per-item amount to find how many units you need to break even."
          : "Think of a mole like a giant dozen—instead of 12 items, 1 mole always holds 6.022 × 10^23 tiny particles. To find how much 1 mole weighs (molar mass), add up the weights of all atoms in the molecule, like 18.02 grams for water. Then, to count moles from a weighed sample, just divide the grams you weighed by the molar mass. Finally, the big numbers in front of a balanced reaction tell you the exact mole recipe for how molecules team up.",
      timestamps: lectureText.includes("recursive")
        ? [`${lecturePrefix} · 04:10`, `${lecturePrefix} · 09:15`, `${lecturePrefix} · 19:45`]
        : lectureText.includes("Contribution margin")
          ? [`${lecturePrefix} · 06:20`, `${lecturePrefix} · 15:10`, `${lecturePrefix} · 21:05`]
          : ["Lecture 7 · 11:52", "Lecture 7 · 13:30", "Lecture 7 · 14:20", "Lecture 7 · 22:10"],
      source: "fallback" as const,
    };

    if (!ai) {
      return res.json(fallback);
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Rewrite the following lecture excerpt in calm, clear, plain language at a Grade 8 reading level. Use ONLY the facts in the lecture text below. Keep it concise (3–4 short sentences). Also return the matching timestamps from the lecture text.

Current chunk context:
${chunkText}

Authoritative lecture text (ONLY source):
${lectureText}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            "You are a calm study companion. Only use facts explicitly present in the provided lecture text. Never invent outside facts. Write at a clear Grade 8 reading level without emoji.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              explanation: {
                type: Type.STRING,
              },
              timestamps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["explanation", "timestamps"],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      if (parsed?.explanation) {
        const timestamps =
          Array.isArray(parsed.timestamps) && parsed.timestamps.length > 0
            ? parsed.timestamps.map((t: string) =>
                normalizeTimestampChip(t, lecturePrefix)
              )
            : fallback.timestamps;
        return res.json({
          explanation: parsed.explanation,
          timestamps,
          source: "gemini",
        });
      }
      return res.json(fallback);
    } catch (error) {
      console.error("explain-simpler Gemini error:", error);
      return res.json(fallback);
    }
  });

  app.post("/api/lecture/visualize", async (req, res) => {
    const chunkText = typeof req.body?.chunkText === "string" ? req.body.chunkText : SAMPLE_LECTURE_TEXT;
    const lectureText = typeof req.body?.lectureText === "string" ? req.body.lectureText : SAMPLE_LECTURE_TEXT;
    const lecturePrefix = typeof req.body?.lecturePrefix === "string" ? req.body.lecturePrefix : "Lecture 7";
    const ai = getAiClient();

    const fallback = lectureText.includes("recursive")
      ? {
          title: "How a recursive call resolves",
          nodes: ["Problem(n)", "Shrinks to n-1", "Base case", "Returns value", "Final result"],
          caption: "Each call breaks the problem down until the base case returns back up the stack.",
          timestamps: [`${lecturePrefix} · 04:10`, `${lecturePrefix} · 09:15`, `${lecturePrefix} · 14:30`],
          source: "fallback" as const,
        }
      : lectureText.includes("Contribution margin")
        ? {
            title: "Finding break-even units",
            nodes: ["Price − Variable cost", "Contribution margin", "Fixed costs ÷ margin", "Break-even units"],
            caption: "Find contribution margin per unit first, then divide fixed costs by it.",
            timestamps: [`${lecturePrefix} · 15:10`, `${lecturePrefix} · 21:05`],
            source: "fallback" as const,
          }
        : {
            title: "Converting mass to moles and particles",
            nodes: ["Grams", "÷ molar mass", "Moles", "× Avogadro's number", "Particles"],
            caption: "Divide grams by molar mass to get moles, then use Avogadro's number for particle count.",
            timestamps: ["Lecture 7 · 11:52", "Lecture 7 · 13:30", "Lecture 7 · 14:20"],
            source: "fallback" as const,
          };

    if (!ai) {
      return res.json(fallback);
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Create a clean 3-to-5 step flow diagram summarizing the core conversion or process in this lecture text. Each item in "nodes" must be a very short label (1–4 words) showing concepts and actions in sequence, for example: ["Grams", "÷ molar mass", "Moles", "× Avogadro's number", "Particles"]. Use ONLY concepts from the lecture text below.

Current chunk context:
${chunkText}

Authoritative lecture text (ONLY source):
${lectureText}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            "Return concise structured JSON for a flow diagram using ONLY the provided lecture text. No emoji.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              nodes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              caption: { type: Type.STRING },
              timestamps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["title", "nodes", "caption", "timestamps"],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      if (Array.isArray(parsed?.nodes) && parsed.nodes.length >= 3 && parsed.nodes.length <= 5) {
        const timestamps =
          Array.isArray(parsed.timestamps) && parsed.timestamps.length > 0
            ? parsed.timestamps.map((t: string) =>
                normalizeTimestampChip(t, lecturePrefix)
              )
            : fallback.timestamps;
        return res.json({
          title: parsed.title || fallback.title,
          nodes: parsed.nodes,
          caption: parsed.caption || fallback.caption,
          timestamps,
          source: "gemini",
        });
      }
      return res.json(fallback);
    } catch (error) {
      console.error("visualize Gemini error:", error);
      return res.json(fallback);
    }
  });

  app.post("/api/lecture/lost-thread", async (req, res) => {
    const chunkText = typeof req.body?.chunkText === "string" ? req.body.chunkText : SAMPLE_LECTURE_TEXT;
    const lectureText = typeof req.body?.lectureText === "string" ? req.body.lectureText : SAMPLE_LECTURE_TEXT;
    const lecturePrefix = typeof req.body?.lecturePrefix === "string" ? req.body.lecturePrefix : "Lecture 7";
    const ai = getAiClient();

    const fallback = lectureText.includes("recursive")
      ? {
          question: {
            prompt: "Why does every recursive function need a base case?",
            options: [
              "To make the array unsorted",
              "To stop recursive calls from repeating forever",
              "To run in O(n^2) time",
              "To skip the return statement",
            ],
            correctIndex: 1,
            feedback: "A base case stops recursion so the call stack does not overflow.",
            timestamp: `${lecturePrefix} · 04:10`,
          },
          recap: [
            { bullet: "A base case stops recursive calls before the call stack crashes.", timestamp: `${lecturePrefix} · 04:10` },
            { bullet: "Each recursive step solves a smaller piece toward the base case.", timestamp: `${lecturePrefix} · 09:15` },
            { bullet: "Binary search halves a sorted list each step for O(log n) speed.", timestamp: `${lecturePrefix} · 19:45` },
          ],
          source: "fallback" as const,
        }
      : lectureText.includes("Contribution margin")
        ? {
            question: {
              prompt: "How do you compute contribution margin per unit?",
              options: [
                "Fixed costs + variable cost",
                "Selling price − variable cost per unit",
                "Rent ÷ selling price",
                "Total revenue × fixed costs",
              ],
              correctIndex: 1,
              feedback: "Contribution margin per unit is selling price minus variable cost per unit.",
              timestamp: `${lecturePrefix} · 15:10`,
            },
            recap: [
              { bullet: "Fixed costs stay constant each month regardless of sales volume.", timestamp: `${lecturePrefix} · 06:20` },
              { bullet: "Contribution margin per unit is selling price minus variable cost.", timestamp: `${lecturePrefix} · 15:10` },
              { bullet: "Break-even units equal fixed costs divided by contribution margin per unit.", timestamp: `${lecturePrefix} · 21:05` },
            ],
            source: "fallback" as const,
          }
        : {
            question: {
              prompt: "If you have 36 g of water (molar mass 18 g/mol), what operation gives you the number of moles?",
              options: [
                "Multiply 36 by 18",
                "Divide 36 by 18",
                "Add 18 to 36",
                "Divide 18 by 6.022 × 10^23",
              ],
              correctIndex: 1,
              feedback: "To turn grams into moles, divide the mass in grams by the molar mass.",
              timestamp: "Lecture 7 · 14:20",
            },
            recap: [
              { bullet: "A mole is a counting unit holding about 6.022 × 10^23 particles (Avogadro's number).", timestamp: "Lecture 7 · 11:52" },
              { bullet: "Molar mass is the grams per one mole, found by adding every atom's mass in the formula.", timestamp: "Lecture 7 · 13:30" },
              { bullet: "Divide grams by molar mass to get moles, and use equation coefficients for mole ratios.", timestamp: "Lecture 7 · 14:20" },
            ],
            source: "fallback" as const,
          };

    if (!ai) {
      return res.json(fallback);
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Help a student who lost the thread during this lecture chunk.
Generate:
1. ONE quick check-in multiple-choice question (4 options) strictly based on the lecture text below.
2. A 3-bullet recap where every bullet includes its exact timestamp from the lecture text.
Use ONLY the lecture text below.

Current chunk context:
${chunkText}

Authoritative lecture text (ONLY source):
${lectureText}`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            "You are a calm tutor. Use ONLY the provided lecture text. Keep sentences short and clear. No emoji.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.OBJECT,
                properties: {
                  prompt: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  feedback: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                },
                required: ["prompt", "options", "correctIndex", "feedback", "timestamp"],
              },
              recap: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    bullet: { type: Type.STRING },
                    timestamp: { type: Type.STRING },
                  },
                  required: ["bullet", "timestamp"],
                },
              },
            },
            required: ["question", "recap"],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      if (
        parsed?.question?.prompt &&
        Array.isArray(parsed?.question?.options) &&
        parsed.question.options.length >= 2 &&
        Array.isArray(parsed?.recap) &&
        parsed.recap.length === 3
      ) {
        return res.json({
          question: {
            ...parsed.question,
            timestamp: normalizeTimestampChip(
              parsed.question.timestamp || "14:20",
              lecturePrefix
            ),
          },
          recap: parsed.recap.map((item: { bullet: string; timestamp: string }) => ({
            bullet: item.bullet,
            timestamp: normalizeTimestampChip(
              item.timestamp || "11:52",
              lecturePrefix
            ),
          })),
          source: "gemini",
        });
      }
      return res.json(fallback);
    } catch (error) {
      console.error("lost-thread Gemini error:", error);
      return res.json(fallback);
    }
  });

  app.post("/api/lecture/ask", async (req, res) => {
    const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
    const lectureText = typeof req.body?.lectureText === "string" ? req.body.lectureText : SAMPLE_LECTURE_TEXT;
    const lecturePrefix = typeof req.body?.lecturePrefix === "string" ? req.body.lecturePrefix : "Lecture 7";

    if (!question) {
      return res.status(400).json({ error: "Please enter a question." });
    }

    const ai = getAiClient();
    const fallbackResult = buildAskFallback(question, lecturePrefix, lectureText);

    if (!ai) {
      return res.json({ ...fallbackResult, source: "fallback" });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Student question: "${question}"

Authoritative lecture text (ONLY allowed source):
${lectureText}

Rules:
1. Answer ONLY using facts explicitly stated in the lecture text above.
2. If the student asks for the final numeric answer to a practice problem not solved in the lecture (like the molar mass of CO2, or a word problem answer), NEVER give the final answer. Instead explain the method from the lecture and show a different example from the text.
3. If the question asks about something NOT covered in the lecture text above, set covered=false and answer="That isn't covered in this lecture. Try asking your TA." with timestamps=[].
4. Otherwise, give a clear 1-3 sentence answer and list every timestamp from the lecture text that supports it.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            "You answer student questions strictly using the provided lecture excerpt. Never hallucinate outside facts. Never give final answers to unworked practice problems. No emoji.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              covered: { type: Type.BOOLEAN },
              answer: { type: Type.STRING },
              timestamps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["covered", "answer", "timestamps"],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      if (!parsed.covered) {
        return res.json({
          covered: false,
          answer: "That isn't covered in this lecture. Try asking your TA.",
          timestamps: [],
          source: "gemini",
        });
      }

      const timestamps =
        Array.isArray(parsed.timestamps) && parsed.timestamps.length > 0
          ? parsed.timestamps.map((t: string) =>
              normalizeTimestampChip(t, lecturePrefix)
            )
          : [`${lecturePrefix} · 11:52`];

      return res.json({
        covered: true,
        answer: parsed.answer,
        timestamps,
        source: "gemini",
      });
    } catch (error) {
      console.error("ask Gemini error:", error);
      return res.json({ ...fallbackResult, source: "fallback" });
    }
  });

  app.post("/api/practice/hint", async (req, res) => {
    const problemPrompt = typeof req.body?.problemPrompt === "string" ? req.body.problemPrompt : "";
    const studentWork = typeof req.body?.studentWork === "string" ? req.body.studentWork.trim() : "";
    const hasSketch = Boolean(req.body?.hasSketch);
    const lectureText = typeof req.body?.lectureText === "string" ? req.body.lectureText : SAMPLE_LECTURE_TEXT;
    const lecturePrefix = typeof req.body?.lecturePrefix === "string" ? req.body.lecturePrefix : "Lecture 7";

    const fallback = {
      hint: studentWork
        ? "Nice start writing out your steps. Check your first conversion or intermediate step against the rule in the lecture, and verify your final ratio before submitting."
        : hasSketch
          ? "Great job sketching your steps on the pad. Double-check each unit or value in your diagram against the lecture rule, then enter your result above."
          : "Try writing down the first given quantity or sketching the relationship step by step, using the lecture rule as your guide.",
      timestamp: lectureText.includes("recursive")
        ? `${lecturePrefix} · 14:30`
        : lectureText.includes("Contribution margin")
          ? `${lecturePrefix} · 21:05`
          : `${lecturePrefix} · 14:20`,
      source: "fallback" as const,
    };

    const ai = getAiClient();
    if (!ai) {
      return res.json(fallback);
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Practice word problem:
${problemPrompt}

Student's work shown so far:
${studentWork ? studentWork : hasSketch ? "(Student sketched work on the drawing pad)" : "(Student has not written steps yet)"}

Authoritative lecture text:
${lectureText}

Give ONE short, encouraging 1-2 sentence hint reacting to what the student has done so far (or helping them start).
CRITICAL RULE: NEVER reveal or state the final numeric answer to the practice problem. Only give a gentle next-step nudge and cite the matching timestamp from the lecture.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            "You are a calm tutor. Never reveal the final numeric answer to a practice problem. Give hints only, grounded in the lecture text, with no emoji.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hint: { type: Type.STRING },
              timestamp: { type: Type.STRING },
            },
            required: ["hint", "timestamp"],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      if (parsed?.hint) {
        return res.json({
          hint: parsed.hint,
          timestamp: normalizeTimestampChip(
            parsed.timestamp || fallback.timestamp,
            lecturePrefix
          ),
          source: "gemini",
        });
      }
      return res.json(fallback);
    } catch (error) {
      console.error("practice hint Gemini error:", error);
      return res.json(fallback);
    }
  });

  app.post("/api/weekly-analysis", async (req, res) => {
    const courseName =
      typeof req.body?.courseName === "string"
        ? req.body.courseName
        : "Intro Chemistry";
    const lectureLabel =
      typeof req.body?.lectureLabel === "string"
        ? req.body.lectureLabel
        : "Lecture 7";
    const thisWeekChecks =
      typeof req.body?.thisWeekChecks === "number"
        ? req.body.thisWeekChecks
        : 0;
    const weeklyTargetChecks =
      typeof req.body?.weeklyTargetChecks === "number"
        ? req.body.weeklyTargetChecks
        : 5;
    const restartMode =
      req.body?.restartMode === "fresh_start" ||
      req.body?.restartMode === "stretch_challenge"
        ? req.body.restartMode
        : "clean_slate";
    const previousWeekBestPct =
      typeof req.body?.previousWeekBestPct === "number"
        ? req.body.previousWeekBestPct
        : null;
    const shakyTopics = Array.isArray(req.body?.shakyTopics)
      ? req.body.shakyTopics
      : ["Balancing equations", "Stoichiometry"];
    const strongTopics = Array.isArray(req.body?.strongTopics)
      ? req.body.strongTopics
      : ["Atoms and isotopes", "The mole and molar mass"];
    const understandingLevel =
      typeof req.body?.understandingLevel === "number"
        ? req.body.understandingLevel
        : 4;
    const recentMisses =
      typeof req.body?.recentMisses === "number" ? req.body.recentMisses : 0;
    const recentCorrect =
      typeof req.body?.recentCorrect === "number" ? req.body.recentCorrect : 0;

    const focusTopic = shakyTopics[0] ?? "the current lecture concepts";

    const fallback =
      recentMisses >= 2
        ? {
            summary: `So far this week in ${courseName}, you have completed ${thisWeekChecks} of ${weeklyTargetChecks} check-ins, and a few recent problems felt rocky.`,
            motivation:
              "Every week resets clean—a tough set today only points to one idea to revisit before your next fresh week.",
            suggestion: `Spend 5 calm minutes reviewing ${focusTopic} in ${lectureLabel}, then try one low-pressure check.`,
            recommendedAction: "learn" as const,
            actionLabel: `Review ${lectureLabel}`,
            source: "fallback" as const,
          }
        : restartMode === "stretch_challenge"
          ? {
              summary: `This week in ${courseName} is a fresh challenge slate (${thisWeekChecks} of ${weeklyTargetChecks} checks done)${previousWeekBestPct !== null ? ` after reaching ${previousWeekBestPct}% on your last set` : ""}.`,
              motivation:
                "You built strong momentum last week—this week raises your own bar with sharper questions so you keep growing.",
              suggestion: `Take on today's ${courseName} set in Practice to test your streak on ${focusTopic}.`,
              recommendedAction: "practice" as const,
              actionLabel: "Start today's 3",
              source: "fallback" as const,
            }
          : restartMode === "fresh_start"
            ? {
                summary: `This week in ${courseName} starts completely fresh (${thisWeekChecks} of ${weeklyTargetChecks} checks so far) with last week's misses cleared away.`,
                motivation:
                  "A clean weekly slate means yesterday's rough spots never hold you back—just focus on one steady step today.",
                suggestion: `Look over ${focusTopic} in ${lectureLabel} for 5 minutes, then ease into a quick check.`,
                recommendedAction: "learn" as const,
                actionLabel: `Review ${lectureLabel}`,
                source: "fallback" as const,
              }
            : {
                summary: `In ${courseName} this week, you have ${thisWeekChecks} of ${weeklyTargetChecks} checks logged and feel solid on ${strongTopics[0] ?? "core ideas"}.`,
                motivation:
                  "Each week is its own clean chapter—steady check-ins right now keep your understanding sharp.",
                suggestion: `Spend a few minutes on ${focusTopic} in ${lectureLabel} or try today's practice set.`,
                recommendedAction: "practice" as const,
                actionLabel: "Start today's 3",
                source: "fallback" as const,
              };

    const ai = getAiClient();
    if (!ai) {
      return res.json(fallback);
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-4-hydrogen",
        contents: `Analyze ONLY this current week for Maya in ${courseName}:
- Current week mode: ${restartMode} ("fresh_start" = struggling student got a clean new weekly slate; "stretch_challenge" = strong student got a higher personal bar this week; "clean_slate" = standard fresh week)
- Checks completed THIS week only: ${thisWeekChecks} of ${weeklyTargetChecks} target
- This week's practice results so far: ${recentCorrect} right, ${recentMisses} missed
- Previous week's personal best accuracy (only if pushing a personal best): ${previousWeekBestPct !== null ? `${previousWeekBestPct}%` : "none"}
- Strong topics: ${JSON.stringify(strongTopics)}
- Shaky topics: ${JSON.stringify(shakyTopics)}
- Self-rated understanding level (1–5): ${understandingLevel}

Write:
1. "summary": 1-2 calm sentences focused ONLY on this week (never mention "remembered 1 week later" or multi-week charts). Mention the clean weekly start or higher personal challenge if relevant.
2. "motivation": 1 warm, honest sentence encouraging her—extra supportive if recentMisses >= 2 or restartMode === "fresh_start", or challenging her to beat her own best if restartMode === "stretch_challenge".
3. "suggestion": 1 concrete next step (5 minutes or 1 check) mentioning ${focusTopic} or ${lectureLabel}.
4. "recommendedAction": either "learn" or "practice".
5. "actionLabel": a short 2-3 word button label (e.g. "Review Lecture 7" or "Start today's 3").

NEVER mention class averages, other students, rankings, grades, difficulty tier names (Foundation/Core/Exam-level), or disabilities.`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          systemInstruction:
            "You are a calm, encouraging university study companion. Focus strictly on this week's fresh slate and Maya's own progress. Never mention class averages, rankings, or difficulty tier labels. Keep language warm, plain, and concise with no emoji.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              motivation: { type: Type.STRING },
              suggestion: { type: Type.STRING },
              recommendedAction: { type: Type.STRING },
              actionLabel: { type: Type.STRING },
            },
            required: [
              "summary",
              "motivation",
              "suggestion",
              "recommendedAction",
              "actionLabel",
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? "{}").trim());
      if (parsed?.summary && parsed?.motivation && parsed?.suggestion) {
        return res.json({
          summary: parsed.summary,
          motivation: parsed.motivation,
          suggestion: parsed.suggestion,
          recommendedAction:
            parsed.recommendedAction === "practice" ? "practice" : "learn",
          actionLabel: parsed.actionLabel || fallback.actionLabel,
          source: "gemini",
        });
      }
      return res.json(fallback);
    } catch (error) {
      console.error("weekly-analysis Gemini error:", error);
      return res.json(fallback);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("/{*path}", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bridge server listening on http://localhost:${PORT}`);
  });
}

startServer();
