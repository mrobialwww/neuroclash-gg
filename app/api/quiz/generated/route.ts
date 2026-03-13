import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
const pdfParse = require("pdf-parse").default ?? require("pdf-parse");

const genAI = new GoogleGenerativeAI("AIzaSyCT6cL3_EJEtKf7V0BtLieQ5p8KCNBxa5Y");

export async function POST(req: Request) {
  try {
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
      const body = await req.json();

      if (body.url) {
        const response = await fetch(body.url);
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

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: "application/pdf",
          data: buffer.toString("base64"),
        },
      },
      {
        text: `Buatkan 20 soal pilihan ganda dari dokumen PDF ini.
Kembalikan HANYA JSON murni tanpa markdown, tanpa backtick, tanpa penjelasan apapun.
Format JSON yang harus dikembalikan:
{
  "theme_materials": "tema atau judul materi dari dokumen",
  "list_questions": [
    {
      "id": 1,
      "question": "pertanyaan di sini",
      "options": [
        { "key": "A", "text": "pilihan A" },
        { "key": "B", "text": "pilihan B" },
        { "key": "C", "text": "pilihan C" },
        { "key": "D", "text": "pilihan D" }
      ],
      "correct_answer": "A",
      "explanation": "penjelasan singkat mengapa jawaban tersebut benar"
    }
  ]
}
Pastikan:
- "id" dimulai dari 1 hingga 20
- "correct_answer" hanya diisi dengan huruf key (A/B/C/D), bukan teks jawaban
- "explanation" berisi penjelasan singkat 1-2 kalimat mengapa jawaban tersebut benar
- Semua soal relevan dengan isi dokumen`,
      },
    ]);

    const rawText = result.response.text();
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(
      {
        message: "Berhasil diproses.",
        geminiFile: parsed,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error API:", error);
    return NextResponse.json({ message: "Terjadi kesalahan pada server saat memproses dokumen." }, { status: 500 });
  }
}
