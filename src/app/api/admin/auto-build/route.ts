import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Konfigurasi Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const kegiatan_id = formData.get('kegiatan_id') as string;

    if (!file || !kegiatan_id) {
      return NextResponse.json({ error: 'File dan kegiatan_id wajib diisi' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY belum dikonfigurasi di server' }, { status: 500 });
    }

    // 1. Ekstrak teks dari PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const PDFParser = require("pdf2json");
    const rawText = await new Promise<string>((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1);
      
      pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });

      pdfParser.parseBuffer(buffer);
    });

    if (!rawText || rawText.trim() === '') {
      return NextResponse.json({ error: 'Gagal mengekstrak teks dari PDF atau PDF kosong' }, { status: 400 });
    }

    // 2. Kirim teks ke Gemini AI untuk diproses menjadi JSON schema
    const prompt = `Anda adalah asisten pembuat form MONEV/Evaluasi. Saya akan memberikan teks mentah yang diekstrak dari PDF kuesioner/instrumen evaluasi.
Tugas Anda adalah menganalisis teks tersebut dan merangkumnya menjadi struktur JSON array yang valid.
Struktur JSON yang diharapkan:
[
  {
    "nama_section": "Nama Bagian/Kategori Pertanyaan (misal: A. Komponen Input, atau Penilaian Fasilitator)",
    "items": [
      {
        "teks_pertanyaan": "Teks pertanyaannya...",
        "tipe_jawaban": "pilihan_ganda", // atau "likert4", "likert5", "esai", "teks_singkat", "angka"
        "opsi_jawaban": ["Sangat Baik", "Baik", "Cukup", "Kurang"], // Hanya diisi jika tipe_jawaban adalah pilihan_ganda
        "butuh_catatan_bukti": true // set true jika di teks ada instruksi untuk memberi catatan/alasan/bukti
      }
    ]
  }
]

Panduan Tipe Jawaban:
- Jika opsi jawaban berupa Skala 1-4 (misal Sangat Baik, Baik, Cukup, Kurang), gunakan "likert4" dan opsi_jawaban kosong (opsi akan otomatis ditangani frontend).
- Jika opsi jawaban berupa Skala 1-5, gunakan "likert5".
- Jika pilihan spesifik (misal: Ya/Tidak, atau pilihan A/B/C/D yang beragam), gunakan "pilihan_ganda" dan isi opsi_jawaban.
- Jika butuh penjelasan panjang, gunakan "esai".
- Jika butuh isian pendek, gunakan "teks_singkat".

Kembalikan HANYA array JSON murni, tanpa markdown \`\`\`json, tanpa teks pendahuluan/penutup.

Berikut adalah teks instrumennya:
=======================
${rawText.substring(0, 30000)} // Potong jika terlalu panjang
=======================`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let jsonString = result.response.text().trim();
    
    // Bersihkan jika ada markdown
    if (jsonString.startsWith('\`\`\`json')) {
      jsonString = jsonString.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
    } else if (jsonString.startsWith('\`\`\`')) {
      jsonString = jsonString.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();
    }

    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Gagal parsing JSON dari AI:", jsonString);
      return NextResponse.json({ error: 'AI gagal menghasilkan JSON yang valid', details: jsonString }, { status: 500 });
    }

    // Kembalikan langsung struktur JSON ke frontend agar bisa direview oleh Admin di Builder
    return NextResponse.json({ success: true, data: parsedData });
    
  } catch (error: any) {
    console.error("Auto-build error:", error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan internal' }, { status: 500 });
  }
}
