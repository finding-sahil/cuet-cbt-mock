import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(new URL(import.meta.url).pathname);
// On Windows, resolve leading slash issues with pathname from import.meta.url
const dataDir = path.join(process.cwd(), 'data');
const jsonDbPath = path.join(dataDir, 'local_db.json');

// Ensure local data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let isMongoConnected = false;

// 1. Mongoose Schema Definitions (for MongoDB Mode)
const questionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  subject: { type: String, required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  year: { type: Number, default: 2024 },
  difficulty: { type: String, default: 'medium' },
  chapter: { type: String, default: 'General' },
  explanation: { type: String, default: '' },
  image: { type: String, default: '' }
});

const attemptSchema = new mongoose.Schema({
  candidateName: { type: String, required: true },
  rollNumber: { type: String, required: true },
  subject: { type: String, required: true },
  totalQuestions: Number,
  answered: Number,
  correctAnswers: Number,
  wrongAnswers: Number,
  unattempted: Number,
  score: Number,
  accuracy: Number,
  timeTaken: Number,
  submittedAt: { type: Date, default: Date.now },
  responses: [{
    questionId: Number,
    selectedOption: String,
    correctAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number, // in seconds
    status: String // 'answered', 'unanswered', 'review', etc.
  }]
});

const configSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
});

let QuestionModel, AttemptModel, ConfigModel;

try {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/cuet_db';
  console.log(`[Database] Attempting connection to MongoDB at: ${mongoUri}`);
  
  // Set lower connection timeout to fail fast and trigger local JSON fallback
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000
  });
  
  isMongoConnected = true;
  console.log('[Database] MongoDB connected successfully.');
  
  QuestionModel = mongoose.model('Question', questionSchema);
  AttemptModel = mongoose.model('Attempt', attemptSchema);
  ConfigModel = mongoose.model('Config', configSchema);
} catch (error) {
  console.warn('[Database] MongoDB connection failed or URI not provided.');
  console.warn('[Database] Transparently falling back to Local JSON database mode!');
  isMongoConnected = false;
}

// 2. Local JSON Database Utility Functions
const readJsonDb = () => {
  if (!fs.existsSync(jsonDbPath)) {
    const defaultData = { questions: [], attempts: [], configs: [] };
    fs.writeFileSync(jsonDbPath, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const data = fs.readFileSync(jsonDbPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading JSON DB file:', err);
    return { questions: [], attempts: [], configs: [] };
  }
};

const writeJsonDb = (data) => {
  try {
    fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing JSON DB file:', err);
  }
};

// 3. Unified API Interface Wrapper
export const dbService = {
  isMongo: () => isMongoConnected,

  // QUESTION API
  getQuestions: async (subject = null) => {
    if (isMongoConnected) {
      const filter = subject ? { subject } : {};
      return await QuestionModel.find(filter).lean();
    } else {
      const db = readJsonDb();
      if (subject) {
        return db.questions.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
      }
      return db.questions;
    }
  },

  getQuestionById: async (id) => {
    const numId = Number(id);
    if (isMongoConnected) {
      return await QuestionModel.findOne({ id: numId }).lean();
    } else {
      const db = readJsonDb();
      return db.questions.find(q => q.id === numId) || null;
    }
  },

  saveQuestions: async (questionsArray) => {
    if (isMongoConnected) {
      // Bulk insert or replace
      for (const q of questionsArray) {
        await QuestionModel.findOneAndUpdate({ id: q.id }, q, { upsert: true, new: true });
      }
      return { success: true, count: questionsArray.length };
    } else {
      const db = readJsonDb();
      questionsArray.forEach(newQ => {
        const idx = db.questions.findIndex(q => q.id === newQ.id);
        if (idx !== -1) {
          db.questions[idx] = newQ;
        } else {
          db.questions.push(newQ);
        }
      });
      writeJsonDb(db);
      return { success: true, count: questionsArray.length };
    }
  },

  saveQuestion: async (q) => {
    if (isMongoConnected) {
      return await QuestionModel.findOneAndUpdate({ id: q.id }, q, { upsert: true, new: true });
    } else {
      const db = readJsonDb();
      if (!q.id) {
        q.id = db.questions.length > 0 ? Math.max(...db.questions.map(x => x.id)) + 1 : 1;
      }
      const idx = db.questions.findIndex(x => x.id === q.id);
      if (idx !== -1) {
        db.questions[idx] = q;
      } else {
        db.questions.push(q);
      }
      writeJsonDb(db);
      return q;
    }
  },

  deleteQuestion: async (id) => {
    const numId = Number(id);
    if (isMongoConnected) {
      return await QuestionModel.deleteOne({ id: numId });
    } else {
      const db = readJsonDb();
      db.questions = db.questions.filter(q => q.id !== numId);
      writeJsonDb(db);
      return { success: true };
    }
  },

  clearQuestions: async () => {
    if (isMongoConnected) {
      await QuestionModel.deleteMany({});
    } else {
      const db = readJsonDb();
      db.questions = [];
      writeJsonDb(db);
    }
  },

  // ATTEMPTS API
  getAttempts: async () => {
    if (isMongoConnected) {
      return await AttemptModel.find({}).sort({ submittedAt: -1 }).lean();
    } else {
      const db = readJsonDb();
      return [...db.attempts].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }
  },

  getAttemptById: async (id) => {
    if (isMongoConnected) {
      return await AttemptModel.findById(id).lean();
    } else {
      const db = readJsonDb();
      return db.attempts.find(a => a._id === id) || null;
    }
  },

  saveAttempt: async (attempt) => {
    if (isMongoConnected) {
      const newAttempt = new AttemptModel(attempt);
      return await newAttempt.save();
    } else {
      const db = readJsonDb();
      const newAttempt = {
        ...attempt,
        _id: Math.random().toString(36).substring(2, 9),
        submittedAt: new Date().toISOString()
      };
      db.attempts.push(newAttempt);
      writeJsonDb(db);
      return newAttempt;
    }
  },

  // CONFIG API
  getConfig: async (key, defaultValue = null) => {
    if (isMongoConnected) {
      const config = await ConfigModel.findOne({ key }).lean();
      return config ? config.value : defaultValue;
    } else {
      const db = readJsonDb();
      const config = db.configs.find(c => c.key === key);
      return config ? config.value : defaultValue;
    }
  },

  saveConfig: async (key, value) => {
    if (isMongoConnected) {
      return await ConfigModel.findOneAndUpdate({ key }, { value }, { upsert: true, new: true });
    } else {
      const db = readJsonDb();
      const idx = db.configs.findIndex(c => c.key === key);
      if (idx !== -1) {
        db.configs[idx].value = value;
      } else {
        db.configs.push({ key, value });
      }
      writeJsonDb(db);
      return { key, value };
    }
  }
};
