import { useEffect, useState } from 'react';
import { useExam } from '../context/ExamContext';
import { BookOpen, Trophy, History, ArrowRight, LogOut, CheckCircle2, User } from 'lucide-react';

const Dashboard = ({ onSelectSubject, onViewAttemptResult, onLogout }) => {
  const { user, API_BASE_URL, logout } = useExam();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/attempts`);
        if (res.ok) {
          const data = await res.json();
          // Filter attempts for this user (roll number matching)
          const userAttempts = data.filter(
            a => a.rollNumber.toLowerCase() === user?.rollNumber.toLowerCase()
          );
          setAttempts(userAttempts);
        }
      } catch (err) {
        console.error('Failed to fetch historical attempts:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAttempts();
  }, [user, API_BASE_URL]);

  // Calculate statistics
  const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
  const averageAccuracy = attempts.length > 0 
    ? Math.round(attempts.reduce((sum, a) => sum + a.accuracy, 0) / attempts.length) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans no-select">
      {/* Top Banner Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 shadow-sm flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-[#0f2d59] p-2 rounded text-white font-black text-xl tracking-wider">CUET</div>
          <div>
            <h1 className="font-extrabold text-gray-800 text-lg leading-tight">Mock Exam Portal</h1>
            <p className="text-xs text-gray-500 font-medium">Empowering students to achieve CBT mastery</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex gap-3 text-xs bg-gray-100 p-2 rounded items-center">
            <User className="w-4 h-4 text-[#0f2d59]" />
            <div className="font-semibold text-gray-700">
              Welcome, <span className="text-[#0f2d59] font-bold">{user?.name}</span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="text-gray-600 font-bold">Roll: {user?.rollNumber}</div>
          </div>
          
          <button
            onClick={() => {
              logout();
              onLogout();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 rounded text-red-600 hover:bg-red-50 text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-grow p-6 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Subject selection & Performance overview */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-900 text-white rounded-lg shadow p-6 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold">Prepare for CUET CBT Examination</h2>
              <p className="text-blue-100 text-sm mt-1 max-w-md leading-relaxed">
                Replicate the actual exam day. Choose a subject paper below, read instructions carefully, and practice with real-time countdown constraint!
              </p>
            </div>
            <div className="absolute right-0 bottom-0 top-0 opacity-15 pointer-events-none flex items-center justify-center pr-10">
              <BookOpen className="w-44 h-44" />
            </div>
          </div>

          {/* Quick Performance widgets */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Attempted</span>
              <span className="text-2xl font-extrabold text-gray-800 mt-1">{attempts.length} Tests</span>
            </div>
            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Best Score</span>
              <span className="text-2xl font-extrabold text-emerald-600 mt-1">+{bestScore} pts</span>
            </div>
            <div className="bg-white p-4 rounded border border-gray-200 shadow-sm flex flex-col justify-between">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Avg Accuracy</span>
              <span className="text-2xl font-extrabold text-blue-600 mt-1">{averageAccuracy}%</span>
            </div>
          </div>

          {/* Subject cards */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#0f2d59]" />
              Assigned Examination Papers
            </h3>
            
            <div className="bg-white rounded border border-gray-200 p-6 shadow-sm flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified NTA CBT Format
                  </span>
                  <span className="text-xs text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded">
                    Total Duration: 120 min (60 mins per subject)
                  </span>
                </div>
                
                <h4 className="font-extrabold text-gray-800 text-xl mt-3">
                  Combined CUET Mock Test (English Language + Physics Domain)
                </h4>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  This mock session operates as a continuous, back-to-back testing schedule mimicking the official NTA examination day. You will complete your papers in the following order:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* English Summary */}
                  <div className="bg-blue-50/50 p-4 rounded border border-blue-100">
                    <div className="font-bold text-blue-900 text-sm">Paper 1: English Core Language</div>
                    <div className="text-xs text-gray-500 mt-1">Grammar, comprehension, vocabulary, and sentence structure.</div>
                    <div className="mt-2 text-xs font-bold text-blue-800 flex gap-4">
                      <span>Questions: 40</span>
                      <span>Duration: 60 mins</span>
                    </div>
                  </div>

                  {/* Physics Summary */}
                  <div className="bg-purple-50/50 p-4 rounded border border-purple-100">
                    <div className="font-bold text-purple-900 text-sm">Paper 2: Physics Domain Subject</div>
                    <div className="text-xs text-gray-500 mt-1">Electrostatics, magnetism, ray optics, and modern semiconductor physics.</div>
                    <div className="mt-2 text-xs font-bold text-purple-800 flex gap-4">
                      <span>Questions: 40</span>
                      <span>Duration: 60 mins</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 bg-amber-50 border border-amber-100 rounded p-3 text-xs text-amber-800 flex gap-2">
                  <span className="font-bold">⚠️ Auto-Submit Rules:</span>
                  <span>Each subject has an isolated timer. After 60 minutes, the English paper will auto-submit and the Physics domain paper will start automatically.</span>
                </div>
              </div>
              
              <button
                onClick={() => onSelectSubject('english')}
                className="mt-6 w-full py-3 bg-[#0f2d59] hover:bg-[#0b2142] text-white text-sm font-extrabold rounded flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-md"
              >
                Proceed to Read Mock Instructions
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Test history log */}
        <div className="bg-white rounded border border-gray-200 shadow-sm p-4 flex flex-col">
          <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2 pb-2 border-b border-gray-100">
            <History className="w-4 h-4 text-gray-500" />
            Previous Attempts Log
          </h3>

          {loading ? (
            <div className="flex-grow flex items-center justify-center py-10">
              <span className="text-xs text-gray-400">Loading attempt history...</span>
            </div>
          ) : attempts.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-12 text-center">
              <Trophy className="w-12 h-12 text-gray-200 mb-2" />
              <p className="text-xs font-semibold text-gray-500">No mock attempts yet</p>
              <p className="text-[10px] text-gray-400 mt-1 px-4 leading-normal">
                Your completed test scores, answers, and time analysis charts will be saved here automatically!
              </p>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto space-y-3 max-h-[420px] pr-1">
              {attempts.map((attempt) => (
                <div
                  key={attempt._id}
                  className="border border-gray-100 rounded p-3 hover:bg-gray-50/50 transition cursor-pointer flex flex-col justify-between"
                  onClick={() => onViewAttemptResult(attempt)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-gray-800">
                      {attempt.subject === 'english' || attempt.subject === 'English' ? 'English' : 'Physics'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(attempt.submittedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                      Score: {attempt.score} pts
                    </span>
                    <span className="text-gray-500">Accuracy: <b>{attempt.accuracy}%</b></span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-dashed border-gray-100 flex justify-between items-center text-[10px] text-gray-400">
                    <span>Time: <b>{Math.round(attempt.timeTaken / 60)} min</b></span>
                    <span className="text-blue-600 font-bold hover:underline flex items-center gap-0.5">
                      Review & Analyze →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
