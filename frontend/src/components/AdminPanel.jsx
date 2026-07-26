import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { Database, Plus, Trash2, Edit2, Upload, Settings, Search, LogOut, Check, FileCode } from 'lucide-react';

const AdminPanel = () => {
  const { token, logout, API_BASE_URL, subjectsConfig, isTerminalAuthorized, toggleTerminalAuth } = useExam();
  const navigate = useNavigate();
  
  // States
  const [questions, setQuestions] = useState([]);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('questions'); // 'questions', 'config', 'bulk'

  // Question Form State
  const [editingId, setEditingId] = useState(null);
  const [formSubject, setFormSubject] = useState('English');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptA, setFormOptA] = useState('');
  const [formOptB, setFormOptB] = useState('');
  const [formOptC, setFormOptC] = useState('');
  const [formOptD, setFormOptD] = useState('');
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('');
  const [formChapter, setFormChapter] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('medium');
  const [formYear, setFormYear] = useState(2024);
  const [formExplanation, setFormExplanation] = useState('');

  // Bulk State
  const [bulkJson, setBulkJson] = useState('');

  // Config State
  const [englishDuration, setEnglishDuration] = useState(60);
  const [englishSelect, setEnglishSelect] = useState(40);
  const [physicsDuration, setPhysicsDuration] = useState(60);
  const [physicsSelect, setPhysicsSelect] = useState(40);

  // Fetch Questions on load
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/questions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (err) {
      console.error('Failed to fetch questions list:', err);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, token]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQuestions();
    
    // Load config states
    if (subjectsConfig && subjectsConfig.length > 0) {
      const eng = subjectsConfig.find(s => s.id === 'english');
      const phy = subjectsConfig.find(s => s.id === 'physics');
      if (eng) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEnglishDuration(eng.duration);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEnglishSelect(eng.selectQuestions);
      }
      if (phy) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPhysicsDuration(phy.duration);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPhysicsSelect(phy.selectQuestions);
      }
    }
  }, [subjectsConfig, fetchQuestions]);

  // --- MANUAL QUESTION CRUD ACTIONS ---
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!formQuestion || !formOptA || !formOptB || !formOptC || !formOptD || !formCorrectAnswer) {
      return alert('All core question and options fields are required.');
    }

    const payload = {
      subject: formSubject,
      question: formQuestion,
      options: [formOptA, formOptB, formOptC, formOptD],
      correctAnswer: formCorrectAnswer,
      chapter: formChapter || 'General',
      difficulty: formDifficulty,
      year: Number(formYear),
      explanation: formExplanation
    };

    const url = editingId 
      ? `${API_BASE_URL}/questions/${editingId}`
      : `${API_BASE_URL}/questions`;
    
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(editingId ? 'Question updated successfully!' : 'Question created successfully!');
        resetForm();
        fetchQuestions();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (err) {
      alert('Save operation failed: ' + err.message);
    }
  };

  const handleEditClick = (q) => {
    setEditingId(q.id);
    setFormSubject(q.subject);
    setFormQuestion(q.question);
    setFormOptA(q.options[0] || '');
    setFormOptB(q.options[1] || '');
    setFormOptC(q.options[2] || '');
    setFormOptD(q.options[3] || '');
    setFormCorrectAnswer(q.correctAnswer);
    setFormChapter(q.chapter || '');
    setFormDifficulty(q.difficulty || 'medium');
    setFormYear(q.year || 2024);
    setFormExplanation(q.explanation || '');
    setActiveSubTab('questions'); // Scroll to top form
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to DELETE this question? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/questions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Question deleted.');
        fetchQuestions();
      }
    } catch (err) {
      alert('Delete operation failed: ' + err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormQuestion('');
    setFormOptA('');
    setFormOptB('');
    setFormOptC('');
    setFormOptD('');
    setFormCorrectAnswer('');
    setFormChapter('');
    setFormDifficulty('medium');
    setFormYear(2024);
    setFormExplanation('');
  };

  // --- CONFIG STATE SAVING ---
  const handleSaveConfig = async () => {
    const payload = {
      subjects: [
        { id: 'english', name: 'English', duration: Number(englishDuration), totalQuestions: 40, selectQuestions: Number(englishSelect) },
        { id: 'physics', name: 'Physics', duration: Number(physicsDuration), totalQuestions: 50, selectQuestions: Number(physicsSelect) }
      ]
    };

    try {
      const res = await fetch(`${API_BASE_URL}/config/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Subject exam configurations updated successfully!');
      } else {
        alert('Failed to save configurations.');
      }
    } catch (err) {
      alert('Config error: ' + err.message);
    }
  };

  // --- BULK JSON UPLOAD ---
  const handleBulkUpload = async () => {
    if (!bulkJson.trim()) return alert('Please paste a valid JSON array of questions.');
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error('Root of JSON must be an array.');

      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/questions/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ questions: parsed })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Successfully seeded ${data.count} questions in bulk!`);
        setBulkJson('');
        fetchQuestions();
      } else {
        const err = await res.json();
        alert('Upload Error: ' + err.error);
      }
    } catch (err) {
      alert('Parsing Error: Please ensure the format matches JSON exactly. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter list
  const filteredQuestions = questions.filter(q => {
    const matchesSubject = filterSubject === 'all' || q.subject.toLowerCase() === filterSubject.toLowerCase();
    const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase()) || 
                          (q.chapter && q.chapter.toLowerCase().includes(search.toLowerCase()));
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans select-none">
      
      {/* Admin Header */}
      <header className="bg-slate-950 text-slate-100 py-4 px-6 shadow border-b-4 border-blue-600 flex justify-between items-center flex-wrap gap-4 select-none">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="font-extrabold text-base leading-tight">CUET SYSTEM CONTROL PANEL</h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Question Bank & Configurations</p>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 rounded text-slate-300 hover:bg-slate-900 text-xs font-bold transition active:scale-95 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Exit Admin
        </button>
      </header>

      {/* Admin Body Tabs */}
      <div className="bg-white border-b border-gray-200 flex justify-center sticky top-0 z-10 select-none">
        <button
          onClick={() => setActiveSubTab('questions')}
          className={`px-8 py-3.5 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
            activeSubTab === 'questions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
        >
          Question Editor (CRUD)
        </button>
        <button
          onClick={() => setActiveSubTab('config')}
          className={`px-8 py-3.5 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
            activeSubTab === 'config' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
        >
          Exam Test Settings
        </button>
        <button
          onClick={() => setActiveSubTab('bulk')}
          className={`px-8 py-3.5 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
            activeSubTab === 'bulk' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
        >
          Bulk Import JSON
        </button>
      </div>

      <main className="flex-grow p-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACTIVE SUB-TAB INTERFACES (Form or Configs) */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* LIVE CANDIDATE ENTRY DESK */}
          <div className="bg-white border border-gray-200 rounded shadow-sm p-5 space-y-4">
            <h3 className="font-extrabold text-gray-800 text-sm border-b border-gray-100 pb-2 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-orange-600" />
              Live Candidate Entry Desk
            </h3>
            
            <div className="space-y-3.5 text-xs text-gray-600">
              <div className="p-3 rounded border flex justify-between items-center bg-gray-50">
                <div>
                  <p className="font-bold text-gray-800">Terminal Entry Status</p>
                  <p className="text-[10px] text-gray-400">Controls if seats can click Start Exam</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                  isTerminalAuthorized ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-amber-100 text-amber-800 font-bold'
                }`}>
                  {isTerminalAuthorized ? '🔓 AUTHORIZED / GO' : '🔒 SEATS LOCKED'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => toggleTerminalAuth(false)}
                  className={`flex-grow py-2 text-xs font-bold rounded border transition active:scale-95 cursor-pointer ${
                    !isTerminalAuthorized ? 'bg-amber-100 border-amber-300 text-amber-900 font-extrabold' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  🔒 Lock Seats
                </button>
                <button
                  type="button"
                  onClick={() => toggleTerminalAuth(true)}
                  className={`flex-grow py-2 text-xs font-bold rounded border transition active:scale-95 cursor-pointer ${
                    isTerminalAuthorized ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-extrabold' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 font-bold'
                  }`}
                >
                  🔓 Authorize Entry
                </button>
              </div>
            </div>
          </div>
          {activeSubTab === 'questions' && (
            <div className="bg-white border border-gray-200 rounded shadow-sm p-5 space-y-4">
              <h3 className="font-extrabold text-gray-800 text-sm border-b border-gray-100 pb-2 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" />
                {editingId ? `Modify Question #${editingId}` : 'Add New Question'}
              </h3>

              <form onSubmit={handleSaveQuestion} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-600 mb-1">Subject</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white font-bold"
                  >
                    <option value="English">English</option>
                    <option value="Physics">Physics</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">Question Content</label>
                  <textarea
                    required
                    placeholder="Enter question wording..."
                    value={formQuestion}
                    onChange={(e) => setFormQuestion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded h-20 outline-none focus:ring-1 focus:ring-blue-500 select-text"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Option A</label>
                    <input
                      type="text" required placeholder="Option A" value={formOptA}
                      onChange={(e) => setFormOptA(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded select-text"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Option B</label>
                    <input
                      type="text" required placeholder="Option B" value={formOptB}
                      onChange={(e) => setFormOptB(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded select-text"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Option C</label>
                    <input
                      type="text" required placeholder="Option C" value={formOptC}
                      onChange={(e) => setFormOptC(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded select-text"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Option D</label>
                    <input
                      type="text" required placeholder="Option D" value={formOptD}
                      onChange={(e) => setFormOptD(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded select-text"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">Correct Answer Match</label>
                  <select
                    value={formCorrectAnswer}
                    onChange={(e) => setFormCorrectAnswer(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white font-bold"
                    required
                  >
                    <option value="">-- Choose matching Option --</option>
                    {formOptA && <option value={formOptA}>A: {formOptA}</option>}
                    {formOptB && <option value={formOptB}>B: {formOptB}</option>}
                    {formOptC && <option value={formOptC}>C: {formOptC}</option>}
                    {formOptD && <option value={formOptD}>D: {formOptD}</option>}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block font-bold text-gray-600 mb-1">Chapter Name</label>
                    <input
                      type="text" placeholder="e.g. Optics" value={formChapter}
                      onChange={(e) => setFormChapter(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded select-text"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">PYQ Year</label>
                    <input
                      type="number" value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded select-text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">Difficulty</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-600 mb-1">Solution Explanation</label>
                  <textarea
                    placeholder="Enter academic derivation/explanation steps..."
                    value={formExplanation}
                    onChange={(e) => setFormExplanation(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded h-16 outline-none focus:ring-1 focus:ring-blue-500 select-text"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  {editingId && (
                    <button
                      type="button" onClick={resetForm}
                      className="w-1/3 py-2 border border-gray-300 text-gray-700 font-bold rounded cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-grow py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow transition active:scale-95 cursor-pointer text-center"
                  >
                    {editingId ? 'Update Question' : 'Save Question'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MOCK SETTINGS CONFIG */}
          {activeSubTab === 'config' && (
            <div className="bg-white border border-gray-200 rounded shadow-sm p-5 space-y-4">
              <h3 className="font-extrabold text-gray-800 text-sm border-b border-gray-100 pb-2 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-blue-600" />
                Configure Exam Parameters
              </h3>

              <div className="space-y-4 text-xs font-semibold text-gray-700">
                {/* English settings */}
                <div className="space-y-2.5 p-3.5 bg-blue-50/50 rounded border border-blue-100">
                  <span className="text-[10px] text-blue-800 bg-blue-100 px-2 py-0.5 rounded font-black">
                    ENGLISH MOCK
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-gray-600 mb-1">Duration (Min)</label>
                      <input
                        type="number" value={englishDuration}
                        onChange={(e) => setEnglishDuration(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded font-bold select-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Draw Size (Qns)</label>
                      <input
                        type="number" value={englishSelect}
                        onChange={(e) => setEnglishSelect(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded font-bold select-text"
                      />
                    </div>
                  </div>
                </div>

                {/* Physics settings */}
                <div className="space-y-2.5 p-3.5 bg-purple-50/50 rounded border border-purple-100">
                  <span className="text-[10px] text-purple-800 bg-purple-100 px-2 py-0.5 rounded font-black">
                    PHYSICS MOCK
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-gray-600 mb-1">Duration (Min)</label>
                      <input
                        type="number" value={physicsDuration}
                        onChange={(e) => setPhysicsDuration(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded font-bold select-text"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 mb-1">Draw Size (Qns)</label>
                      <input
                        type="number" value={physicsSelect}
                        onChange={(e) => setPhysicsSelect(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 bg-white rounded font-bold select-text"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveConfig}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded shadow transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Save Settings configurations
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: BULK LOADER */}
          {activeSubTab === 'bulk' && (
            <div className="bg-white border border-gray-200 rounded shadow-sm p-5 space-y-4">
              <h3 className="font-extrabold text-gray-800 text-sm border-b border-gray-100 pb-2 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                Bulk Question Seeder
              </h3>

              <div className="space-y-3.5 text-xs text-gray-600">
                <p className="leading-relaxed">
                  Paste a JSON array containing your customized question bank. The system validates entries and inserts them immediately.
                </p>
                
                <div className="bg-gray-100 p-2.5 rounded font-mono text-[9px] text-gray-500 border border-gray-200 space-y-1.5">
                  <span className="font-bold text-gray-700 block select-all">Schema Reference:</span>
                  <span>{`[`}</span>
                  <span className="block pl-3">{`{`}</span>
                  <span className="block pl-6">{`"subject": "Physics",`}</span>
                  <span className="block pl-6">{`"question": "What is unit of force?",`}</span>
                  <span className="block pl-6">{`"options": ["Newton", "Joule", "Pascal", "Watt"],`}</span>
                  <span className="block pl-6">{`"correctAnswer": "Newton",`}</span>
                  <span className="block pl-6">{`"chapter": "Electrostatics"`}</span>
                  <span className="block pl-3">{`}`}</span>
                  <span>{`]`}</span>
                </div>

                <textarea
                  placeholder="Paste JSON array here..."
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded font-mono text-[10px] h-40 outline-none focus:ring-1 focus:ring-blue-500 select-text"
                />

                <button
                  onClick={handleBulkUpload}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded shadow transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <FileCode className="w-4 h-4" />
                  Trigger Bulk Seeding
                </button>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: QUESTION MANAGER SEARCH & SELECTIONS (2cols width) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded shadow-sm p-5 flex flex-col justify-between overflow-hidden">
          
          <div className="space-y-4">
            <h3 className="font-extrabold text-gray-800 text-sm border-b border-gray-100 pb-2">
              Loaded Questions Index ({filteredQuestions.length} Items found)
            </h3>

            {/* Filter Search Row */}
            <div className="flex gap-3 flex-wrap text-xs select-none">
              
              {/* Search Bar */}
              <div className="flex-grow min-w-[200px] border border-gray-300 rounded px-2.5 py-1.5 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text" placeholder="Search questions or chapters..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent focus:outline-none w-full text-gray-700 select-text"
                />
              </div>

              {/* Subject toggle */}
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 bg-white font-semibold cursor-pointer"
              >
                <option value="all">All Subjects</option>
                <option value="English">English</option>
                <option value="Physics">Physics</option>
              </select>

            </div>

            {/* Questions Table */}
            {loading ? (
              <div className="py-12 text-center text-xs text-gray-400 font-semibold animate-pulse">
                Fetching database indices...
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 font-semibold">
                No matching questions located.
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[380px] border border-gray-100 rounded pr-1 space-y-2 text-xs">
                {filteredQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="border border-gray-100 rounded p-3 bg-gray-50/50 hover:bg-gray-100/50 transition flex justify-between gap-4 items-start select-text"
                  >
                    <div className="space-y-1 max-w-[80%]">
                      <div className="flex gap-2 items-center flex-wrap">
                        <span className="font-extrabold text-[#0f2d59]">#{q.id}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-black uppercase ${
                          q.subject.toLowerCase() === 'english' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {q.subject}
                        </span>
                        {q.chapter && (
                          <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                            {q.chapter}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-gray-400">Year: {q.year || 2024}</span>
                      </div>
                      
                      <p className="text-gray-700 font-medium leading-relaxed select-text">{q.question}</p>
                      
                      <div className="flex gap-1.5 flex-wrap text-[10px] font-semibold text-emerald-700">
                        <span>Answer: <b>{q.correctAnswer}</b></span>
                      </div>
                    </div>

                    <div className="flex gap-2 select-none">
                      <button
                        onClick={() => handleEditClick(q)}
                        className="p-1 border border-blue-200 text-blue-600 rounded bg-blue-50 hover:bg-blue-100 transition cursor-pointer"
                        title="Edit question details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(q.id)}
                        className="p-1 border border-red-200 text-red-600 rounded bg-red-50 hover:bg-red-100 transition cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminPanel;
