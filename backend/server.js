import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { dbService } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cuet_nta_secure_secret_token_123';

// Enable CORS for LAN accessibility (so students can access from other devices on the same network)
app.use(cors({
  origin: '*', // Allow all origins for local network testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' })); // Support larger bulk uploads

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
app.post('/api/auth/login', async (req, res) => {
  const { name, rollNumber, password, subject } = req.body;
  
  if (!name || !rollNumber || !password) {
    return res.status(400).json({ error: 'Name, Roll Number, and Password are required.' });
  }

  const isSystemAdmin = rollNumber.toLowerCase() === 'admin';

  // Backend credentials matching
  if (isSystemAdmin) {
    if (password !== '13042007') {
      return res.status(401).json({ error: 'Access Denied: Incorrect Admin Security Token.' });
    }
  } else {
    if (rollNumber !== '26051004928') {
      return res.status(401).json({ error: 'Access Denied: Invalid Student Roll Number.' });
    }
    if (password !== '09052008') {
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

// --- INVIGILATOR TERMINAL ENTRY AUTHORIZATION FLAG ---
let isTerminalAuthorized = false;

app.get('/api/config/terminal-auth', (req, res) => {
  res.json({ authorized: isTerminalAuthorized });
});

app.post('/api/config/terminal-auth', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin privileges required.' });
  const { authorized } = req.body;
  isTerminalAuthorized = !!authorized;
  res.json({ success: true, authorized: isTerminalAuthorized });
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
app.get('/api/questions/test', async (req, res) => {
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

    // Shuffle questions
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    
    // Slice to test length
    const selectedQuestions = shuffled.slice(0, Math.min(limit, shuffled.length));

    // Shuffle options inside each question to prevent cheating
    const randomizedQuestions = selectedQuestions.map((q, idx) => {
      const shuffledOptions = [...q.options].sort(() => 0.5 - Math.random());
      return {
        ...q,
        originalIndex: idx + 1,
        options: shuffledOptions
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

// Bulk Upload JSON
app.post('/api/questions/bulk', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin privileges required.' });
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions)) return res.status(400).json({ error: 'Questions must be an array.' });

    // Validate and assign correct IDs
    const currentQuestions = await dbService.getQuestions();
    let nextId = currentQuestions.length > 0 ? Math.max(...currentQuestions.map(x => x.id)) + 1 : 1;

    const validatedQuestions = questions.map(q => {
      const id = q.id || nextId++;
      return {
        id,
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
app.post('/api/attempts/submit', async (req, res) => {
  const { candidateName, rollNumber, subject, responses, timeTaken } = req.body;

  if (!candidateName || !rollNumber || !subject || !responses) {
    return res.status(400).json({ error: 'Missing mandatory fields.' });
  }

  try {
    // Scoring scheme: CUET style (+5 for correct, -1 for incorrect, 0 for unattempted)
    let score = 0;
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let answered = 0;
    let unattempted = 0;

    const scoredResponses = [];

    for (const resItem of responses) {
      const q = await dbService.getQuestionById(resItem.questionId);
      if (!q) continue;

      const isAttempted = resItem.selectedOption && resItem.selectedOption !== '';
      const isCorrect = isAttempted && resItem.selectedOption === q.correctAnswer;
      
      let itemScore = 0;
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

// --- ATTEMPT HISTORY ROUTE ---
app.get('/api/attempts', async (req, res) => {
  try {
    const attempts = await dbService.getAttempts();
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] CUET Simulation Backend running on LAN at: http://0.0.0.0:${PORT}`);
  console.log(`[Server] Local Machine Access: http://localhost:${PORT}`);
});
