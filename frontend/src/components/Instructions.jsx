import { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { HelpCircle, FileText } from 'lucide-react';

const Instructions = ({ onStartExam }) => {
  const { user, isTerminalAuthorized } = useExam();
  const [agreed, setAgreed] = useState(false);

  const handleStart = () => {
    if (!isTerminalAuthorized) {
      alert('🔒 Terminal locked. Invigilator has not authorized this seat yet.');
      return;
    }
    if (!agreed) {
      alert('You must read the instructions and check the box at the bottom before starting the exam.');
      return;
    }
    onStartExam(user.subject);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans no-select select-none">
      {/* Header Panel */}
      <header className="bg-white border-b border-gray-200 py-3 px-6 shadow-sm flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-[#0f2d59] font-bold text-lg">CUET CBT MOCK TEST PRACTICE</h2>
          <p className="text-xs text-gray-500 font-medium">Subject: <span className="text-blue-700 font-bold">Combined (English Core + Physics Domain)</span></p>
        </div>
        <div className="flex gap-4 text-xs font-semibold text-gray-600 bg-gray-100 px-4 py-2 rounded">
          <div>Candidate: <span className="text-black font-bold">{user?.name}</span></div>
          <div className="border-l border-gray-300 pl-4">Roll No: <span className="text-black font-bold">{user?.rollNumber}</span></div>
        </div>
      </header>

      {/* Main Instructions Area */}
      <main className="flex-grow p-6 overflow-y-auto max-w-5xl mx-auto w-full">
        {/* NTA Official Red Banner */}
        <div className="bg-red-600 text-white rounded p-4 mb-6 shadow-sm border-l-4 border-red-800 text-xs flex gap-3 items-start animate-pulse">
          <HelpCircle className="w-8 h-8 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="font-extrabold uppercase tracking-wider text-sm">🚨 OFFICIAL NTA CBT ADVISORY & MONITORING WARNING</h4>
            <p className="leading-relaxed font-semibold">
              Candidates are STRICTLY prohibited from pressing any physical keyboard keys during the active examination session. Navigating, marking options, and paging must be executed solely using the mouse cursor interface. Touching the physical keyboard may trigger security validation traps, immediate terminal lockout, and student debarment.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm p-6 space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-[#0f2d59]">
            <FileText className="w-6 h-6" />
            <h3 className="text-xl font-bold">General Examination Instructions</h3>
          </div>

          {/* Core metadata table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-blue-50 border border-blue-200 rounded p-4 text-center">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Duration</p>
              <p className="text-xl font-bold text-blue-900">120 Minutes</p>
              <p className="text-[10px] text-blue-600 font-bold">(60 min per paper)</p>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-blue-200 pt-2 sm:pt-0">
              <p className="text-xs text-gray-500 font-bold uppercase">Total Questions</p>
              <p className="text-xl font-bold text-blue-900">80 Questions</p>
              <p className="text-[10px] text-blue-600 font-bold">(40 items per paper)</p>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-blue-200 pt-2 sm:pt-0">
              <p className="text-xs text-gray-500 font-bold uppercase">Marking Scheme</p>
              <p className="text-sm font-bold text-blue-900">+5 Correct | -1 Incorrect</p>
              <p className="text-[10px] text-blue-600 font-bold">NTA standard scheme</p>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-blue-200 pt-2 sm:pt-0">
              <p className="text-xs text-gray-500 font-bold uppercase">Language</p>
              <p className="text-xl font-bold text-blue-900">English / Hindi</p>
              <p className="text-[10px] text-blue-600 font-bold">Bilingual toggle active</p>
            </div>
          </div>

          {/* NTA Instructions Breakdown */}
          <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
            <h4 className="font-bold text-gray-800 text-base">1. Navigation Palette Legends (CRITICAL)</h4>
            <p className="text-xs text-gray-500 mb-2">
              The status of your current question is represented dynamically by the following symbols in the question palette on the right:
            </p>

            {/* Custom Shapes Legend Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 rounded p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center nta-shape-not-visited flex-shrink-0 text-xs">01</div>
                <p className="text-xs text-gray-600"><b>Not Visited:</b> You have not visited/viewed this question yet.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center nta-shape-not-answered flex-shrink-0 text-xs">02</div>
                <p className="text-xs text-gray-600"><b>Not Answered:</b> You have visited this question but did not record an answer.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center nta-shape-answered flex-shrink-0 text-xs">03</div>
                <p className="text-xs text-gray-600"><b>Answered:</b> You have selected an answer and successfully saved it. <span className="text-emerald-700 font-semibold">(Will be evaluated)</span></p>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center nta-shape-marked-review flex-shrink-0 text-xs">04</div>
                <p className="text-xs text-gray-600"><b>Marked for Review:</b> You marked this question for review without answering. <span className="text-red-700 font-semibold">(Will NOT be evaluated)</span></p>
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <div className="w-10 h-10 flex items-center justify-center nta-shape-answered-review flex-shrink-0 text-xs">05</div>
                <p className="text-xs text-gray-600">
                  <b>Answered & Marked for Review:</b> You answered the question but marked it for review later. 
                  <span className="text-purple-700 font-semibold"> (This is considered for evaluation during final scoring).</span>
                </p>
              </div>
            </div>

            <h4 className="font-bold text-gray-800 text-base mt-6">2. Continuous Dual-Timer Rules</h4>
            <ul className="list-disc pl-5 space-y-2 text-xs text-gray-600">
              <li>Your English core language paper will begin immediately when you proceed.</li>
              <li>You have exactly <b>60 minutes</b> for the English paper. The countdown timer on the screen represents English.</li>
              <li>Upon manual click of "Submit" or automatic 60 minutes expiry, English responses are saved and the **Physics domain paper will immediately start with a fresh 60-minute timer**.</li>
              <li>Once you switch from English to Physics, you **cannot return** to view or change English options.</li>
            </ul>

            <h4 className="font-bold text-gray-800 text-base mt-6">3. Lock-Down Rules (Anti-Cheating Policy)</h4>
            <div className="bg-red-50 border border-red-200 rounded p-4 text-xs text-red-800 space-y-2">
              <p className="font-bold">⚠️ VIOLATION WARNING:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Right-click, copy, cut, and paste actions are strictly disabled within the testing browser frame.</li>
                <li>Switching browser tabs or minimizing the browser will be flagged immediately. Multiple violations will simulate system warnings.</li>
                <li>The exam will trigger automated submission immediately upon countdown timer expiry.</li>
              </ul>
            </div>
          </div>

          {/* Confirmation Checkbox & Start Button (Invigilator Guarded) */}
          <div className="border-t border-gray-100 pt-6 flex flex-col items-center gap-4">
            {!isTerminalAuthorized ? (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded p-4 max-w-2xl w-full text-center space-y-2">
                <p className="font-extrabold text-sm flex justify-center items-center gap-1.5 animate-pulse text-amber-700">
                  🔒 CBT TERMINAL SEAT LOCKED
                </p>
                <p className="text-[11px] leading-relaxed text-gray-600">
                  Your examination console seat is pre-registered under Candidate Name <b>{user?.name}</b> (Roll Number <b>{user?.rollNumber}</b>). Invigilator entry authorization is currently pending. Please sit comfortably and wait; the examiner will authorize your console from the central administration desk shortly.
                </p>
                <div className="flex justify-center items-center gap-2 pt-1">
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-amber-600 border-t-transparent"></div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Waiting for invigilator entry authorization...</span>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded p-3 max-w-2xl w-full text-center text-xs font-bold flex justify-center items-center gap-1.5">
                <span>🔓 CBT TERMINAL UNLOCKED: Invigilator entry authorized! You are now allowed to review the agreement and begin.</span>
              </div>
            )}

            <label className={`flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition max-w-2xl w-full ${!isTerminalAuthorized ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}>
              <input
                type="checkbox"
                checked={agreed}
                disabled={!isTerminalAuthorized}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
              />
              <span className="text-xs text-gray-700 leading-snug">
                I have read, understood, and agree to abide by all the official guidelines, system instructions, and examination rules detailed above.
              </span>
            </label>

            <button
              onClick={handleStart}
              disabled={!isTerminalAuthorized || !agreed}
              className={`px-8 py-3 text-white font-bold rounded shadow-lg transition active:scale-95 text-base cursor-pointer ${
                isTerminalAuthorized && agreed ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              PROCEED TO START TEST
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Instructions;
