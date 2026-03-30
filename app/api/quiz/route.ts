// POST /api/quiz
// melakukan mapping soal dan jawaban hasil generated geminiAPI ke table questions dan answers

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    let buffer: Buffer;
    let round = 0;
    let maxPlayer = 0;
    let difficulty;
    const contentType = req.headers.get("content-type") || "";

    // 1. Cek apakah request berupa form-data (File Fisik / URL via form)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("pdf") as File | null;
      const url = formData.get("url") as string | null;
      const rd = formData.get("round") as string | null;
      const mp = formData.get("maxPlayer") as string | null;
      const df = formData.get("difficulty") as string | null;
      if (rd) round = parseInt(rd, 10);
      if (mp) maxPlayer = parseInt(mp, 10);
      if (df) difficulty = df;

      if (file && file.size > 0) {
        // Jika ada file fisik yang diunggah
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else if (url) {
        // Jika tidak ada file fisik, tapi ada field teks 'url'
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal mengunduh PDF dari URL.");
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        return NextResponse.json(
          { message: "Harap sertakan file 'pdf' atau teks 'url'." },
          { status: 400 }
        );
      }
    }
    // 2. Cek apakah request berupa JSON (URL murni)
    else if (contentType.includes("application/json")) {
      const body = await req.json();
      const { category, difficulty, round: rd, maxPlayer: mp } = body;
      if (rd) round = parseInt(rd, 10);
      if (mp) maxPlayer = parseInt(mp, 10);
      const {
        data: { publicUrl: url },
      } = supabase.storage
        .from("materials")
        .getPublicUrl(`${category}/${difficulty}.pdf`);

      if (url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal mengunduh PDF dari URL.");
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        return NextResponse.json(
          { message: "URL tidak ditemukan dalam body JSON." },
          { status: 400 }
        );
      }
    }
    // 3. Format tidak didukung
    else {
      return NextResponse.json(
        {
          message:
            "Format Content-Type tidak didukung. Gunakan form-data atau application/json.",
        },
        { status: 415 }
      );
    }

    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    };

    const targetCount = round + Math.ceil(round / 10);
    const abilityMaterials = Math.round(0.2 * (maxPlayer + maxPlayer / 5));

    // Helper function for retry logic with exponential backoff
    const generateWithRetry = async (params: any, retries = 3) => {
      let lastError: any = null;
      for (let i = 0; i < retries; i++) {
        try {
          return await ai.models.generateContent(params);
        } catch (error: any) {
          lastError = error;
          const isRetryable =
            error.message.includes("503") ||
            error.message.includes("UNAVAILABLE") ||
            error.message.includes("429") ||
            error.message.includes("RESOURCE_EXHAUSTED");

          if (isRetryable && i < retries - 1) {
            const delay = Math.pow(2, i + 1) * 1000;
            console.warn(
              `[API Quiz] Attempt ${i + 1} failed. Retrying in ${delay}ms...`
            );
            await new Promise((res) => setTimeout(res, delay));
            continue;
          }
          throw error;
        }
      }
      throw lastError;
    };

    const result = await generateWithRetry({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        `Buatkan ${targetCount} ${
          contentType.includes("multipart/form-data")
            ? `dengan tingkat kesulitan ${difficulty}`
            : ""
        } soal pilihan ganda dari dokumen PDF ini.
Buatkan juga materi bacaan singkat (masing-masing cukup 4-5 kalimat) sejumlah ${abilityMaterials} buah yang diambil dari intisari dokumen tersebut.
Kembalikan HANYA JSON murni tanpa markdown, tanpa backtick, tanpa penjelasan apapun.
Format JSON yang harus dikembalikan:
{
  "theme_materials": "tema materi dari dokumen. Jika cocok, gunakan salah satu dari enum ini persis: bahasaindonesia | bahasainggris | biologi | pancasila | pemrograman | sejarah. Tapi jika tidak ada yang cocok (misal matematika), tuliskan materinya (contoh: matematika).",
  "list_questions": [
    {
      "order": 1,
      "question": "pertanyaan di sini",
      "options": [
        { "key": "A", "text": "pilihan A", "is_correct": false },
        { "key": "B", "text": "pilihan B", "is_correct": true },
        { "key": "C", "text": "pilihan C", "is_correct": false },
        { "key": "D", "text": "pilihan D", "is_correct": false }
      ],
      "explanation": "penjelasan singkat mengapa jawaban tersebut benar"
    }
  ],
  "ability_materials" : [
    {
      "title": "judul materi bacaan",
      "text": "isi materi bacaan singkat 4-5 kalimat yang diambil dari intisari dokumen"
    }
  ]
}
Pastikan:
- "order" dimulai dari 1 hingga ${targetCount}
- "is_correct" bernilai true hanya untuk 1 pilihan yang benar, sisanya false
- "explanation" berisi penjelasan singkat 1-2 kalimat mengapa jawaban tersebut benar
- Semua soal relevan dengan isi dokumen
- "order" merepresentasikan urutan tingkat kesulitan soal dari paling mudah ke paling susah`,

        {
          inlineData: {
            mimeType: "application/pdf",
            data: buffer.toString("base64"),
          },
        },
      ],
      config: generationConfig,
    });

    const rawText = result.text ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    // Find the first complete JSON object by counting braces
    let jsonStr = "";
    const startIndex = cleaned.indexOf("{");
    if (startIndex !== -1) {
      let braceCount = 0;
      let insideString = false;
      let escapeNext = false;

      for (let i = startIndex; i < cleaned.length; i++) {
        const char = cleaned[i];

        if (escapeNext) {
          escapeNext = false;
          continue;
        }

        if (char === "\\") {
          escapeNext = true;
          continue;
        }

        if (char === '"') {
          insideString = !insideString;
        }

        if (!insideString) {
          if (char === "{") braceCount++;
          else if (char === "}") braceCount--;
        }

        if (braceCount === 0 && i > startIndex) {
          jsonStr = cleaned.substring(startIndex, i + 1);
          break;
        }
      }
    }

    if (!jsonStr) {
      console.error(
        "[API Quiz] No JSON object found in Gemini response:",
        cleaned.substring(0, 200)
      );
      return NextResponse.json(
        {
          message:
            "Oops! AI gagal membuat soal dengan format yang benar. Silakan coba lagi.",
        },
        { status: 500 }
      );
    }

    let cleanedParsed;
    try {
      cleanedParsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error(
        "[API Quiz] JSON Parse Exception:",
        parseError,
        "\nRaw String:",
        jsonStr.substring(0, 200)
      );
      return NextResponse.json(
        {
          message:
            "Oops! Text dari AI sedikit berantakan. Silakan Create Room sekali lagi ya.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Berhasil diproses.",
        geminiFile: cleanedParsed,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[API Quiz] Error:", error);

    // ── Parse Gemini / Google API errors ──────────────────────────────────
    let geminiStatus: number | null = null;
    let geminiCode: string | null = null;

    try {
      // GoogleGenAI wraps the raw response text in the error message
      const raw = error instanceof Error ? error.message : String(error);
      const jsonStart = raw.indexOf("{");
      if (jsonStart !== -1) {
        const parsed = JSON.parse(raw.slice(jsonStart));
        geminiStatus = parsed?.error?.code ?? null;
        geminiCode = parsed?.error?.status ?? null;
      }
    } catch {
      /* not a JSON error, fall through */
    }

    if (geminiStatus === 503 || geminiCode === "UNAVAILABLE") {
      return NextResponse.json(
        {
          message:
            "Server AI sedang kelebihan beban (503 Unavailable). " +
            "Model Gemini saat ini sedang ramai digunakan. " +
            "Tunggu beberapa saat lalu coba lagi.",
        },
        { status: 503 }
      );
    }

    if (geminiStatus === 429 || geminiCode === "RESOURCE_EXHAUSTED") {
      return NextResponse.json(
        {
          message:
            "Kuota API Gemini habis (429 Too Many Requests). " +
            "Coba lagi dalam beberapa menit.",
        },
        { status: 429 }
      );
    }

    if (geminiStatus === 400 || geminiCode === "INVALID_ARGUMENT") {
      return NextResponse.json(
        {
          message:
            "Dokumen tidak dapat dibaca oleh AI (400 Invalid Argument). " +
            "Pastikan file PDF tidak rusak dan tidak terproteksi password.",
        },
        { status: 400 }
      );
    }

    // ── Fallback ──────────────────────────────────────────────────────────
    console.error("[API Quiz] Fallback Error details:", error);
    return NextResponse.json(
      {
        message:
          "Oops! Proses pembuatan soal gagal akibat kendala server AI. Silakan coba beberapa saat lagi ya.",
      },
      { status: 500 }
    );
  }
}
