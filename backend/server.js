import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { dbService } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Issue #2: Crash on startup if JWT_SECRET is not set — no insecure fallback
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET environment variable is not set. Server cannot start securely.');
  process.exit(1);
}

// Issue #21: Restrict CORS to localhost and private network ranges instead of wildcard '*'
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow localhost on any port and private network IPs (192.168.x.x, 10.x.x.x)
    const allowed = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin);
    if (allowed) return callback(null, true);
    callback(new Error('CORS: Origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Support larger bulk uploads

// --- Issue #9: Fisher-Yates (Knuth) shuffle — uniform random permutation ---
const fisherYatesShuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required.' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ROUTES ---
// Issue #1: Credentials sourced from env vars, never hardcoded in source
app.post('/api/auth/login', async (req, res) => {
  const { name, rollNumber, password, subject } = req.body;
  
  if (!name || !rollNumber || !password) {
    return res.status(400).json({ error: 'Name, Roll Number, and Password are required.' });
  }

  const isSystemAdmin = rollNumber.toLowerCase() === 'admin';

  if (isSystemAdmin) {
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Access Denied: Incorrect Admin Security Token.' });
    }
  } else {
    if (rollNumber !== process.env.STUDENT_ROLL) {
      return res.status(401).json({ error: 'Access Denied: Invalid Student Roll Number.' });
    }
    if (password !== process.env.STUDENT_DOB) {
      return res.status(401).json({ error: 'Access Denied: Incorrect Date of Birth Password.' });
    }
  }

  try {
    const user = { name, rollNumber, role: isSystemAdmin ? 'admin' : 'student', subject };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '12h' });
    
    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Issue #6/#20: INVIGILATOR TERMINAL AUTH — persisted to database instead of in-memory ---
app.get('/api/config/terminal-auth', async (req, res) => {
  try {
    const authorized = await dbService.getConfig('terminalAuth', false);
    res.json({ authorized: !!authorized });
  } catch (error) {
    res.json({ authorized: false });
  }
});

app.post('/api/config/terminal-auth', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin privileges required.' });
  const { authorized } = req.body;
  try {
    await dbService.saveConfig('terminalAuth', !!authorized);
    res.json({ success: true, authorized: !!authorized });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SUBJECT CONFIG ROUTES ---
app.get('/api/config/subjects', async (req, res) => {
  try {
    const subjects = await dbService.getConfig('subjects', [
      { id: 'english', name: 'English', duration: 60, totalQuestions: 40, selectQuestions: 40 },
      { id: 'physics', name: 'Physics', duration: 60, totalQuestions: 50, selectQuestions: 40 }
    ]);
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/config/subjects', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin privileges required.' });
  try {
    const { subjects } = req.body;
    await dbService.saveConfig('subjects', subjects);
    res.json({ success: true, subjects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- MOCK TEST QUESTIONS ROUTE ---
// Issue #5: Strip correctAnswer and explanation from test responses — server scores, not client
app.get('/api/questions/test', authenticateToken, async (req, res) => {
  const { subject } = req.query;
  if (!subject) return res.status(400).json({ error: 'Subject parameter is required.' });

  try {
    const allQuestions = await dbService.getQuestions(subject);
    if (!allQuestions || allQuestions.length === 0) {
      return res.status(404).json({ error: `No questions found for subject: ${subject}` });
    }

    // Fetch config for subject questions limit
    const configs = await dbService.getConfig('subjects', []);
    const subConfig = configs.find(c => c.id.toLowerCase() === subject.toLowerCase()) || { selectQuestions: 40 };
    const limit = subConfig.selectQuestions || 40;

    // Issue #9: Fisher-Yates shuffle instead of biased sort comparator
    const shuffled = fisherYatesShuffle(allQuestions);
    
    // Slice to test length
    const selectedQuestions = shuffled.slice(0, Math.min(limit, shuffled.length));

    // Shuffle options inside each question to prevent cheating
    const randomizedQuestions = selectedQuestions.map((q, idx) => {
      const shuffledOptions = fisherYatesShuffle(q.options);
      return {
        id: q.id,
        subject: q.subject,
        question: q.question,
        options: shuffledOptions,
        originalIndex: idx + 1,
        year: q.year,
        difficulty: q.difficulty,
        chapter: q.chapter,
        image: q.image
        // Issue #5: correctAnswer and explanation intentionally omitted
      };
    });

    res.json({
      subject,
      totalQuestions: randomizedQuestions.length,
      questions: randomizedQuestions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- QUESTION CRUD ROUTES (ADMIN) ---
app.get('/api/questions', authenticateToken, async (req, res) => {
  try {
    const { subject } = req.query;
    const questions = await dbService.getQuestions(subject);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/questions/:id', authenticateToken, async (req, res) => {
  try {
    const q = await dbService.getQuestionById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found.' });
    res.json(q);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/questions', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin privileges required.' });
  try {
    const newQ = await dbService.saveQuestion(req.body);
    res.status(201).json(newQ);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/questions/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin privileges required.' });
  try {
    const updatedQ = { ...req.body, id: Number(req.params.id) };
    const savedQ = await dbService.saveQuestion(updatedQ);
    res.json(savedQ);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/questions/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin privileges required.' });
  try {
    await dbService.deleteQuestion(req.params.id);
    res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Issue #10: Bulk Upload — always assign fresh IDs to prevent collisions
app.post('/api/questions/bulk', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin privileges required.' });
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions)) return res.status(400).json({ error: 'Questions must be an array.' });

    // Compute next safe ID by scanning all existing questions
    const currentQuestions = await dbService.getQuestions();
    let nextId = currentQuestions.length > 0 ? Math.max(...currentQuestions.map(x => x.id)) + 1 : 1;

    // Always assign fresh sequential IDs — strip any user-supplied IDs to avoid collisions
    const validatedQuestions = questions.map(q => {
      return {
        id: nextId++,
        subject: q.subject || 'English',
        question: q.question,
        options: q.options || [],
        correctAnswer: q.correctAnswer,
        year: q.year || 2024,
        difficulty: q.difficulty || 'medium',
        chapter: q.chapter || 'General',
        explanation: q.explanation || ''
      };
    });

    const result = await dbService.saveQuestions(validatedQuestions);
    res.json({ success: true, count: result.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- EXAM SUBMISSION & SCORING ---
// Issue #3: Add authenticateToken — submissions must be authenticated
app.post('/api/attempts/submit', authenticateToken, async (req, res) => {
  const { candidateName, rollNumber, subject, responses, timeTaken } = req.body;

  if (!candidateName || !rollNumber || !subject || !responses) {
    return res.status(400).json({ error: 'Missing mandatory fields.' });
  }

  // Validate that the submitter matches the authenticated user (admins bypass)
  if (req.user.role !== 'admin' && req.user.rollNumber !== rollNumber) {
    return res.status(403).json({ error: 'Roll number mismatch with authenticated user.' });
  }

  try {
    // Issue #11: Batch-fetch all needed questions in one call instead of N+1 sequential reads
    const questionIds = responses.map(r => r.questionId);
    const questionsList = await dbService.getQuestionsByIds(questionIds);
    const questionsMap = new Map(questionsList.map(q => [q.id, q]));

    // Scoring scheme: CUET style (+5 for correct, -1 for incorrect, 0 for unattempted)
    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let answered = 0;
    let unattempted = 0;

    const scoredResponses = [];

    for (const resItem of responses) {
      const q = questionsMap.get(Number(resItem.questionId));
      if (!q) continue;

      const isAttempted = resItem.selectedOption && resItem.selectedOption !== '';
      // Issue #12: Normalize comparison with trim() to handle whitespace differences
      const isCorrect = isAttempted && resItem.selectedOption.trim() === q.correctAnswer.trim();
      
      let status = 'unvisited';

      if (isAttempted) {
        answered++;
        if (isCorrect) {
          correctAnswers++;
          score += 5;
        } else {
          wrongAnswers++;
          score -= 1;
        }
        status = 'answered';
      } else {
        unattempted++;
        status = 'unanswered';
      }

      scoredResponses.push({
        questionId: q.id,
        questionText: q.question,
        options: q.options,
        selectedOption: resItem.selectedOption || '',
        correctAnswer: q.correctAnswer,
        isCorrect,
        chapter: q.chapter,
        difficulty: q.difficulty,
        explanation: q.explanation,
        timeSpent: resItem.timeSpent || 0,
        status: resItem.status || status
      });
    }

    const totalQuestions = responses.length;
    const accuracy = answered > 0 ? Math.round((correctAnswers / answered) * 100) : 0;

    const attempt = {
      candidateName,
      rollNumber,
      subject,
      totalQuestions,
      answered,
      correctAnswers,
      wrongAnswers,
      unattempted,
      score,
      accuracy,
      timeTaken,
      responses: scoredResponses
    };

    const savedAttempt = await dbService.saveAttempt(attempt);
    res.status(201).json(savedAttempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ATTEMPT HISTORY ROUTES ---
// Issue #4: Add authenticateToken — students see only their own data, admins see all
app.get('/api/attempts', authenticateToken, async (req, res) => {
  try {
    const rollFilter = req.user.role === 'admin' ? null : req.user.rollNumber;
    const attempts = await dbService.getAttempts(rollFilter);
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attempts/:id', authenticateToken, async (req, res) => {
  try {
    const attempt = await dbService.getAttemptById(req.params.id);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    // Students can only view their own attempts
    if (req.user.role !== 'admin' && attempt.rollNumber !== req.user.rollNumber) {
      return res.status(403).json({ error: 'Access denied.' });
    }
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] CUET Simulation Backend running on LAN at: http://0.0.0.0:${PORT}`);
  console.log(`[Server] Local Machine Access: http://localhost:${PORT}`);
});
