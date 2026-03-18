// POST /api/quiz
// melakukan mapping soal dan jawaban hasil generated geminiAPI ke table questions dan answers

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@/lib/supabase/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, game_room_id } = body;

    const supabase = await createClient();

    let buffer: Buffer;
    const contentType = req.headers.get("content-type") || "";

    // 1. Cek apakah request berupa form-data (File Fisik / URL via form)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("pdf") as File | null;
      const url = formData.get("url") as string | null;

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
        return NextResponse.json({ message: "Harap sertakan file 'pdf' atau teks 'url'." }, { status: 400 });
      }
    }
    // 2. Cek apakah request berupa JSON (URL murni)
    else if (contentType.includes("application/json")) {
      if (url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Gagal mengunduh PDF dari URL.");
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        return NextResponse.json({ message: "URL tidak ditemukan dalam body JSON." }, { status: 400 });
      }
    }
    // 3. Format tidak didukung
    else {
      return NextResponse.json({ message: "Format Content-Type tidak didukung. Gunakan form-data atau application/json." }, { status: 415 });
    }

    const generationConfig = {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    };

    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        `Buatkan 20 soal pilihan ganda dari dokumen PDF ini.
Kembalikan HANYA JSON murni tanpa markdown, tanpa backtick, tanpa penjelasan apapun.
Format JSON yang harus dikembalikan:
{
  "theme_materials": "tema atau judul materi dari dokumen",
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
  ]
}
Pastikan:
- "order" dimulai dari 1 hingga 20
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
    const cleanedParsed = JSON.parse(rawText);
    const parsed = JSON.parse(rawText);

    const questions = parsed.list_questions.map(async (question: any) => {
      const questionData = {
        game_room_id: game_room_id,
        question_order: question.order,
        question_text: question.question,
      };
      const { data: questionRes, error: questionErr } = await supabase.from("questions").insert(questionData).select();

      if (questionErr) {
        console.error("Gagal insert question:", questionErr);
        return;
      }

      const newQuestionId = questionRes?.[0]?.question_id;

      const answers = question.options.map(async (answer: any) => {
        const answerData = {
          question_id: newQuestionId,
          key: answer.key,
          answer_text: answer.text,
          is_correct: answer.is_correct,
        };
        const { data: answerRes, error: answerErr } = await supabase.from("answers").insert(answerData).select();
        if (answerErr) {
          console.error("Gagal insert answer:", answerErr);
        }
      });
      await Promise.all(answers);
    });
    await Promise.all(questions);

    return NextResponse.json(
      {
        message: "Berhasil diproses.",
        geminiFile: cleanedParsed,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error API:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server saat memproses dokumen." }, { status: 500 });
  }
}
