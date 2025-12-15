import { type Question, type Score, type InsertScore, type InsertQuestion, type Admin } from "@shared/schema";
import { randomUUID } from "crypto";

const defaultQuestions: Question[] = [
  {
    id: 1,
    question: "Apa yang dimaksud dengan angkatan kerja?",
    options: [
      "Seluruh penduduk dalam suatu negara",
      "Penduduk usia kerja yang bekerja dan sedang mencari pekerjaan",
      "Penduduk yang sudah pensiun",
      "Penduduk yang masih bersekolah"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "Batas usia minimal seseorang untuk masuk angkatan kerja di Indonesia adalah...",
    options: [
      "13 tahun",
      "15 tahun",
      "17 tahun",
      "21 tahun"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "Apa yang dimaksud dengan pengangguran friksional?",
    options: [
      "Pengangguran karena tidak ada lowongan pekerjaan",
      "Pengangguran karena perubahan teknologi",
      "Pengangguran sementara karena sedang mencari pekerjaan yang lebih baik",
      "Pengangguran karena tidak mau bekerja"
    ],
    correctAnswer: 2
  },
  {
    id: 4,
    question: "Upah Minimum Regional (UMR) ditetapkan oleh...",
    options: [
      "Presiden",
      "Menteri Tenaga Kerja",
      "Gubernur/Bupati/Walikota",
      "DPR"
    ],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "Hak pekerja yang dijamin oleh undang-undang adalah...",
    options: [
      "Bekerja 12 jam sehari tanpa istirahat",
      "Mendapat upah yang layak dan cuti",
      "Tidak boleh membentuk serikat pekerja",
      "Tidak mendapat jaminan kesehatan"
    ],
    correctAnswer: 1
  },
  {
    id: 6,
    question: "Apa yang dimaksud dengan tenaga kerja terampil?",
    options: [
      "Tenaga kerja yang tidak memerlukan pendidikan",
      "Tenaga kerja yang memiliki keahlian khusus melalui pendidikan atau pelatihan",
      "Tenaga kerja yang baru lulus sekolah",
      "Tenaga kerja yang bekerja di pemerintahan"
    ],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "BPJS Ketenagakerjaan memberikan perlindungan dalam hal...",
    options: [
      "Hanya kecelakaan kerja",
      "Kecelakaan kerja, jaminan hari tua, pensiun, dan kematian",
      "Hanya jaminan pensiun",
      "Hanya asuransi jiwa"
    ],
    correctAnswer: 1
  },
  {
    id: 8,
    question: "Pengangguran struktural disebabkan oleh...",
    options: [
      "Pergantian musim",
      "Perubahan struktur ekonomi dan ketidakcocokan keterampilan",
      "Keinginan pribadi untuk tidak bekerja",
      "Liburan panjang"
    ],
    correctAnswer: 1
  },
  {
    id: 9,
    question: "Kewajiban pekerja yang benar adalah...",
    options: [
      "Datang kerja sesuka hati",
      "Menaati peraturan perusahaan dan melaksanakan tugas dengan baik",
      "Tidak perlu menjaga kerahasiaan perusahaan",
      "Menolak perintah atasan"
    ],
    correctAnswer: 1
  },
  {
    id: 10,
    question: "Tingkat Partisipasi Angkatan Kerja (TPAK) dihitung dengan rumus...",
    options: [
      "Jumlah pengangguran dibagi jumlah penduduk",
      "Jumlah angkatan kerja dibagi penduduk usia kerja dikali 100%",
      "Jumlah pekerja dibagi jumlah pengangguran",
      "Jumlah penduduk dibagi angkatan kerja"
    ],
    correctAnswer: 1
  }
];

export interface IStorage {
  getQuestions(): Promise<Question[]>;
  getQuestionById(id: number): Promise<Question | undefined>;
  addQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: number, question: InsertQuestion): Promise<Question | undefined>;
  deleteQuestion(id: number): Promise<boolean>;
  getScores(): Promise<Score[]>;
  addScore(score: InsertScore): Promise<Score>;
  deleteScore(id: string): Promise<boolean>;
  clearScores(): Promise<void>;
  validateAdmin(username: string, password: string): Promise<Admin | null>;
}

export class MemStorage implements IStorage {
  private questions: Map<number, Question>;
  private scores: Map<string, Score>;
  private nextQuestionId: number;

  constructor() {
    this.questions = new Map();
    this.scores = new Map();
    
    defaultQuestions.forEach(q => this.questions.set(q.id, q));
    this.nextQuestionId = defaultQuestions.length + 1;
  }

  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values()).sort((a, b) => a.id - b.id);
  }

  async getQuestionById(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async addQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const question: Question = {
      ...insertQuestion,
      id: this.nextQuestionId++,
    };
    this.questions.set(question.id, question);
    return question;
  }

  async updateQuestion(id: number, insertQuestion: InsertQuestion): Promise<Question | undefined> {
    if (!this.questions.has(id)) {
      return undefined;
    }
    const question: Question = {
      ...insertQuestion,
      id,
    };
    this.questions.set(id, question);
    return question;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    return this.questions.delete(id);
  }

  async getScores(): Promise<Score[]> {
    const allScores = Array.from(this.scores.values());
    return allScores.sort((a, b) => b.score - a.score);
  }

  async addScore(insertScore: InsertScore): Promise<Score> {
    const id = randomUUID();
    const score: Score = {
      ...insertScore,
      id,
      createdAt: new Date().toISOString(),
    };
    this.scores.set(id, score);
    return score;
  }

  async deleteScore(id: string): Promise<boolean> {
    return this.scores.delete(id);
  }

  async clearScores(): Promise<void> {
    this.scores.clear();
  }

  async validateAdmin(username: string, password: string): Promise<Admin | null> {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error("ADMIN_USERNAME and ADMIN_PASSWORD environment variables must be set");
      return null;
    }

    if (username === adminUsername && password === adminPassword) {
      return {
        id: "admin-1",
        username: adminUsername,
        password: "[PROTECTED]"
      };
    }
    return null;
  }
}

export const storage = new MemStorage();
