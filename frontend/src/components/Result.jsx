import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Award, CheckCircle, XCircle, AlertCircle, RefreshCw, BarChart2, BookOpen, AlertTriangle } from 'lucide-react';
import { useExam } from '../context/ExamContext';

const Result = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { latestAttemptResult, setLatestAttemptResult, API_BASE_URL } = useExam();
  
  const [activeTab, setActiveTab] = useState('summary');
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If the attempt is already in the context and matches the URL, use it immediately
    if (latestAttemptResult && latestAttemptResult._id === attemptId) {
      setAttemptData(latestAttemptResult);
      setLoading(false);
      return;
    }

    // Otherwise, fetch it from the backend
    const fetchAttempt = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/attempts/${attemptId}`);
        if (res.ok) {
          const data = await res.json();
          setAttemptData(data);
          setLatestAttemptResult(data);
        } else {
          setAttemptData(null);
        }
      } catch (err) {
        console.error('Failed to fetch attempt data:', err);
        setAttemptData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [attemptId, latestAttemptResult, API_BASE_URL, setLatestAttemptResult]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4 font-semibold">Loading attempt details...</p>
      </div>
    );
  }

  if (!attemptData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center font-sans">
        <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Attempt Not Found</h2>
        <p className="text-gray-500 mb-6 text-sm text-center px-4">
          The requested examination attempt could not be located. It may have been deleted or the link is invalid.
        </p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="px-6 py-2 bg-[#0f2d59] hover:bg-blue-900 text-white text-sm font-bold rounded shadow transition active:scale-95"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const {
    subject,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    unattempted,
    score,
    accuracy,
    timeTaken,
    responses
  } = attemptData;

  const totalPossibleScore = totalQuestions * 5;

  // --- WEAK TOPIC ANALYSIS ENGINE ---
  const chapterStats = {};
  responses.forEach(res => {
    const chap = res.chapter || 'General';
    if (!chapterStats[chap]) {
      chapterStats[chap] = { total: 0, correct: 0, score: 0 };
    }
    chapterStats[chap].total += 1;
    if (res.isCorrect) {
      chapterStats[chap].correct += 1;
      chapterStats[chap].score += 5;
    } else if (res.selectedOption !== '') {
      chapterStats[chap].score -= 1;
    }
  });

  const weakTopics = [];
  const strongTopics = [];

  Object.keys(chapterStats).forEach(chap => {
    const stats = chapterStats[chap];
    const chapAccuracy = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
    
    const info = {
      name: chap,
      total: stats.total,
      correct: stats.correct,
      accuracy: Math.round(chapAccuracy),
      score: stats.score
    };

    if (chapAccuracy < 60) {
      weakTopics.push(info);
    } else {
      strongTopics.push(info);
    }
  });

  // --- SVG CHANNELS & PIE CALCULATOR ---
  const totalCircleLength = 2 * Math.PI * 40; // 251.2
  const correctPct = (correctAnswers / totalQuestions) * 100;
  const wrongPct = (wrongAnswers / totalQuestions) * 100;
  const unattemptedPct = (unattempted / totalQuestions) * 100;

  const strokeCorrect = (correctAnswers / totalQuestions) * totalCircleLength;
  const strokeWrong = (wrongAnswers / totalQuestions) * totalCircleLength;
  const strokeUnattempted = (unattempted / totalQuestions) * totalCircleLength;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans no-select select-none">
      
      {/* Header Panel */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm flex justify-between items-center select-none flex-wrap gap-4">
        <div className="flex items-center gap-2.5">
          <Award className="w-6 h-6 text-yellow-500" />
          <h2 className="text-[#0f2d59] font-extrabold text-lg leading-tight uppercase">
            Mock Examination Report Cards
          </h2>
        </div>
        
        <button
          onClick={() => {
            setLatestAttemptResult(null);
            navigate('/dashboard');
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-[#0f2d59] text-white text-xs font-bold rounded shadow transition active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Dashboard Home
        </button>
      </header>

      {/* Tabs Row */}
      <div className="bg-white border-b border-gray-200 flex justify-center sticky top-0 z-10 select-none">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-8 py-3.5 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
            activeTab === 'summary' 
              ? 'border-blue-700 text-blue-700' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Performance Summary
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`px-8 py-3.5 text-xs font-bold tracking-wider uppercase border-b-2 transition ${
            activeTab === 'review' 
              ? 'border-blue-700 text-blue-700' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Review Questions & Solutions
        </button>
      </div>

      <main className="flex-grow p-6 max-w-5xl mx-auto w-full select-none">
        
        {/* --- PERFORMANCE SUMMARY TAB --- */}
        {activeTab === 'summary' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Score banner */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded font-extrabold uppercase">
                  Attempt successfully evaluated
                </span>
                <h3 className="text-2xl font-black text-gray-800">
                  Paper Subject: {subject === 'english' || subject === 'English' ? 'English' : 'Physics'}
                </h3>
                <p className="text-xs text-gray-400">
                  CUET positive-correct marking scheme (+5 / -1) applied automatically.
                </p>
              </div>

              {/* Dynamic Score Ring */}
              <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg px-6 py-4">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Final Score</p>
                  <p className="text-3xl font-black text-[#0f2d59]">{score}</p>
                </div>
                <div className="text-gray-300 text-2xl font-light">/</div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Possible</p>
                  <p className="text-xl font-bold text-gray-500">{totalPossibleScore}</p>
                </div>
              </div>
            </div>

            {/* Middle Grid: Detailed Stats & Pie Chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Stat breakdown list */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
                <h4 className="font-extrabold text-gray-800 text-sm border-b border-gray-100 pb-2 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-blue-700" />
                  Score Metrics Breakdown
                </h4>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Correctly Answered Questions
                    </span>
                    <span className="font-extrabold text-emerald-600">+{correctAnswers} ({Math.round(correctPct)}%)</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Incorrectly Answered Questions
                    </span>
                    <span className="font-extrabold text-red-600">-{wrongAnswers} ({Math.round(wrongPct)}%)</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      Unattempted Questions
                    </span>
                    <span className="font-extrabold text-gray-500">{unattempted} ({Math.round(unattemptedPct)}%)</span>
                  </div>

                  <div className="pt-2 border-t border-dashed border-gray-200 flex justify-between items-center text-xs">
                    <span className="text-gray-700 font-bold">Accuracy Percentage</span>
                    <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{accuracy}%</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-700 font-bold">Total Time Taken</span>
                    <span className="font-black text-gray-800">
                      {Math.floor(timeTaken / 60)}m {timeTaken % 60}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic SVG Pie Chart */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col items-center justify-center">
                <h4 className="font-extrabold text-gray-800 text-sm border-b border-gray-100 pb-2 w-full text-left mb-4 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-700" />
                  Accuracy & Response Distribution
                </h4>

                <div className="relative w-36 h-36">
                  {/* SVG Pie */}
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f3f4f6" strokeWidth="12" />
                    
                    {/* Correct answers circle arc */}
                    {strokeCorrect > 0 && (
                      <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="12"
                        strokeDasharray={`${strokeCorrect} ${totalCircleLength - strokeCorrect}`}
                        strokeDashoffset="0"
                      />
                    )}

                    {/* Wrong answers circle arc */}
                    {strokeWrong > 0 && (
                      <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="#ef4444"
                        strokeWidth="12"
                        strokeDasharray={`${strokeWrong} ${totalCircleLength - strokeWrong}`}
                        strokeDashoffset={-strokeCorrect}
                      />
                    )}

                    {/* Unattempted circle arc */}
                    {strokeUnattempted > 0 && (
                      <circle
                        cx="50" cy="50" r="40"
                        fill="transparent"
                        stroke="#9ca3af"
                        strokeWidth="12"
                        strokeDasharray={`${strokeUnattempted} ${totalCircleLength - strokeUnattempted}`}
                        strokeDashoffset={-(strokeCorrect + strokeWrong)}
                      />
                    )}
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-3 shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Accuracy</span>
                    <span className="text-xl font-extrabold text-blue-700">{accuracy}%</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-4 text-[10px] font-bold text-gray-500">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Correct</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-red-500 rounded-full" /> Incorrect</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-gray-400 rounded-full" /> Unattempted</div>
                </div>
              </div>

            </div>

            {/* Weak Topic Analysis frame */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
              <h4 className="font-extrabold text-gray-800 text-sm border-b border-gray-100 pb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Syllabus Chapter-wise Diagnostic Report
              </h4>

              {/* Grid of Weak Areas & Strong Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Weak Revision Topics */}
                <div className="space-y-3">
                  <div className="text-xs font-extrabold text-red-700 bg-red-50 px-2 py-1 rounded">
                    ⚠️ CRITICAL REVISION RECOMMENDED (&lt; 60% Accuracy)
                  </div>
                  
                  {weakTopics.length === 0 ? (
                    <p className="text-xs text-emerald-600 font-semibold px-2 py-4">
                      ✓ Excellent! No chapters fall below the 60% revision threshold.
                    </p>
                  ) : (
                    <div className="space-y-2.5 pr-1 max-h-56 overflow-y-auto">
                      {weakTopics.map((item, idx) => (
                        <div key={idx} className="border border-red-100 rounded p-3 bg-red-50/10 flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-gray-800">{item.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Items: <b>{item.total}</b> | Correct: <b>{item.correct}</b>
                            </p>
                          </div>
                          <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            {item.accuracy}% Acc
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Strong Topics */}
                <div className="space-y-3">
                  <div className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                    ✓ STRONG AREAS (&gt;= 60% Accuracy)
                  </div>
                  
                  {strongTopics.length === 0 ? (
                    <p className="text-xs text-gray-400 px-2 py-4">
                      No chapters met the strong classification criteria in this attempt.
                    </p>
                  ) : (
                    <div className="space-y-2.5 pr-1 max-h-56 overflow-y-auto">
                      {strongTopics.map((item, idx) => (
                        <div key={idx} className="border border-emerald-100 rounded p-3 bg-emerald-50/10 flex justify-between items-center">
                          <div>
                            <p className="text-xs font-bold text-gray-800">{item.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Items: <b>{item.total}</b> | Correct: <b>{item.correct}</b>
                            </p>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {item.accuracy}% Acc
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* --- SOLUTION REVIEW TAB --- */}
        {activeTab === 'review' && (
          <div className="space-y-5 animate-fadeIn select-text">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-xs text-gray-500">
                Study your corrected options alongside direct academic solutions to avoid committing similar mistakes on exam day.
              </p>
            </div>

            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-1">
              {responses.map((res, idx) => {
                const isSelectedEmpty = res.selectedOption === '';
                const isCorrect = res.isCorrect;
                
                return (
                  <div
                    key={idx}
                    className={`bg-white border rounded-lg p-5 shadow-sm space-y-3 transition ${
                      isCorrect 
                        ? 'border-l-4 border-l-emerald-500 border-gray-200' 
                        : isSelectedEmpty 
                          ? 'border-l-4 border-l-gray-400 border-gray-200' 
                          : 'border-l-4 border-l-red-500 border-gray-200'
                    }`}
                  >
                    {/* Title meta row */}
                    <div className="flex justify-between items-center text-xs border-b border-gray-100 pb-2">
                      <span className="font-bold text-gray-700">Question {idx + 1}</span>
                      <div className="flex gap-2">
                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">
                          {res.chapter}
                        </span>
                        
                        {isCorrect ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            ✓ Correct (+5)
                          </span>
                        ) : isSelectedEmpty ? (
                          <span className="bg-gray-50 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold">
                            ∅ Unattempted (0)
                          </span>
                        ) : (
                          <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            ✗ Incorrect (-1)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question text */}
                    <p className="text-gray-800 font-bold text-sm leading-relaxed">{res.questionText}</p>

                    {/* Options list showing right/wrong */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      {res.options.map((opt, oIdx) => {
                        const isStudentChoice = res.selectedOption === opt;
                        const isTrueCorrect = res.correctAnswer === opt;
                        
                        let choiceClass = 'border-gray-200 bg-white text-gray-700';
                        if (isStudentChoice) {
                          choiceClass = isCorrect 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold' 
                            : 'border-red-500 bg-red-50 text-red-950 font-bold';
                        } else if (isTrueCorrect) {
                          choiceClass = 'border-emerald-300 bg-emerald-50/30 text-emerald-900 font-semibold';
                        }

                        return (
                          <div key={oIdx} className={`px-4 py-2 border rounded ${choiceClass}`}>
                            <span className="font-extrabold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span>
                            {opt}
                            {isStudentChoice && <span className="text-[9px] uppercase ml-2 px-1 py-0.5 bg-white border border-gray-200 rounded font-black">Your Pick</span>}
                            {isTrueCorrect && !isCorrect && <span className="text-[9px] uppercase ml-2 px-1 py-0.5 bg-emerald-200 text-emerald-800 rounded font-black">Correct Choice</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Solutions explanation drop */}
                    {res.explanation && (
                      <div className="bg-blue-50/50 border border-blue-100 rounded p-3 text-[11px] leading-relaxed text-blue-900 space-y-1">
                        <p className="font-bold text-xs">🎓 Step-by-Step Explanation:</p>
                        <p className="font-medium text-gray-700">{res.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Result;
