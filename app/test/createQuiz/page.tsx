"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function CreateQuizDummy() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // State untuk menampung hasil JSON dari Gemini

  // State terpisah untuk masing-masing skenario
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<string>("20");

  /**
   * Skenario 1: Upload File Fisik (multipart/form-data)
   */
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Harap sertakan file PDF terlebih dahulu.");

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("questionCount", questionCount);

      // fetch tidak perlu headers Content-Type karena browser akan
      // otomatis menentukan boundary untuk multipart/form-data
      const response = await fetch("/api/quiz", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengunggah file.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Skenario 2: Pilih Kategori dari Supabase Bucket (application/json)
   */
  const handleCategorySelect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return alert("Harap pilih materi terlebih dahulu.");
    if (!difficulty) return alert("Harap pilih tingkat kesulitan terlebih dahulu.");

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        // WAJIB ditambahkan agar rute Anda masuk ke blok else if (contentType.includes("application/json"))
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category, difficulty, questionCount }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat memproses kategori.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Generate Kuis dengan AI</CardTitle>
          <CardDescription>Pilih metode yang Anda inginkan untuk men-generate soal kuis dari PDF.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-2">
            <Label>Jumlah Soal</Label>
            <Select value={questionCount} onValueChange={setQuestionCount}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jumlah soal..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 Soal</SelectItem>
                <SelectItem value="20">20 Soal</SelectItem>
                <SelectItem value="25">25 Soal</SelectItem>
                <SelectItem value="30">30 Soal</SelectItem>
                <SelectItem value="35">35 Soal</SelectItem>
                <SelectItem value="40">40 Soal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upload">Upload PDF Desktop</TabsTrigger>
              <TabsTrigger value="category">Pilih Materi Sistem</TabsTrigger>
            </TabsList>

            {/* TAB SCENARIO 1: UPLOAD PDF */}
            <TabsContent value="upload">
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pdf-file">File Dokumen Pembelajaran</Label>
                  <Input id="pdf-file" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <p className="text-sm text-muted-foreground">Hanya menerima format .pdf</p>
                </div>
                <Button type="submit" disabled={loading || !file} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Soal dari File
                </Button>
              </form>
            </TabsContent>

            {/* TAB SCENARIO 2: CATEGORY DROPDOWN */}
            <TabsContent value="category">
              <form onSubmit={handleCategorySelect} className="space-y-4">
                <div className="space-y-2">
                  <Label>Kategori Materi</Label>
                  <Select onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih materi dari sistem..." />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Pastikan value ini sesuai dengan struktur folder di bucket Supabase Anda */}
                      <SelectItem value="sejarah">Sejarah Indonesia</SelectItem>
                      <SelectItem value="biologi">Biologi Sel</SelectItem>
                      <SelectItem value="pancasila">Dasar Pancasila</SelectItem>
                      <SelectItem value="bahasaindonesia">Bahasa Indonesia</SelectItem>
                      <SelectItem value="bahasainggris">Bahasa Inggirs</SelectItem>
                      <SelectItem value="pemrograman">Pemrograman</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">Materi ini akan diambil otomatis di sistem: /materials/[kategori]/[materi].pdf</p>
                </div>

                {/* Pilihan Difficulty - muncul setelah memilih kategori */}
                {category && (
                  <div className="space-y-2">
                    <Label>Tingkat Kesulitan</Label>
                    <Select onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tingkat kesulitan..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mudah">Mudah</SelectItem>
                        <SelectItem value="sedang">Sedang</SelectItem>
                        <SelectItem value="sulit">Sulit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button type="submit" disabled={loading || !category || !difficulty} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Soal dari Sistem
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-8 border-green-500 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-green-700">Hasil Generate AI!</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">{JSON.stringify(result, null, 2)}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
