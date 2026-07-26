import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../context/ExamContext';
import { Monitor, User, AlertCircle, Camera, ShieldAlert, CheckSquare } from 'lucide-react';

const ExamInterface = () => {
  const {
    questions,
    currentQuestionIndex,
    responses,
    remainingTime,
    saveResponse,
    changeQuestionIndex,
    submitExam,
    activeSubject,
    user,
    cheatingViolations,
    setLatestAttemptResult
  } = useExam();
  
  const navigate = useNavigate();

  const [selectedOption, setSelectedOption] = useState('');
  const [lang, setLang] = useState('English');
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  const currentQuestion = questions[currentQuestionIndex];

  // --- EVENT TRIGGERS (defined early for useCallback) ---
  const handleSaveAndNext = useCallback(() => {
    if (!selectedOption) {
      alert('Please select an option before saving. If you want to skip, click "Next".');
      return;
    }
    saveResponse(currentQuestion.id, selectedOption, 'answered');
    changeQuestionIndex(currentQuestionIndex + 1);
  }, [selectedOption, currentQuestion, saveResponse, currentQuestionIndex, changeQuestionIndex]);

  const handleClearResponse = useCallback(() => {
    setSelectedOption('');
    saveResponse(currentQuestion.id, '', 'not-answered');
  }, [currentQuestion, saveResponse]);

  const handleMarkForReviewAndNext = useCallback(() => {
    const status = selectedOption ? 'answered-review' : 'marked-review';
    saveResponse(currentQuestion.id, selectedOption, status);
    changeQuestionIndex(currentQuestionIndex + 1);
  }, [selectedOption, currentQuestion, saveResponse, currentQuestionIndex, changeQuestionIndex]);

  const handleNextOnly = useCallback(() => {
    const currRes = responses[currentQuestion.id];
    if (currRes && currRes.status === 'not-visited') {
      saveResponse(currentQuestion.id, currRes.selectedOption, 'not-answered');
    }
    changeQuestionIndex(currentQuestionIndex + 1);
  }, [currentQuestion, responses, saveResponse, currentQuestionIndex, changeQuestionIndex]);

  // --- HINDI TRANS-LITERATION MOCKS FOR IMMERSION ---
  const getTranslatedQuestion = (qText) => {
    if (lang === 'English') return qText;
    
    // Quick dictionary mappings for typical scientific/grammatical queries
    const translations = {
      "What is SI unit of force?": "बल का SI मात्रक क्या है?",
      "Newton": "न्यूटन", "Joule": "जूल", "Pascal": "पास्कल", "Watt": "वाट",
      "Two point charges of": "दो बिंदु आवेश", "placed in vacuum at a distance of": "निर्वात में एक दूसरे से दूरी पर स्थित हैं",
      "Calculate the magnitude of the electrostatic force": "उनके बीच लगने वाले स्थिर विद्युत बल का परिमाण ज्ञात कीजिए",
      "Two resistors of values": "दो प्रतिरोधक जिनके मान क्रमशः", "are connected in": "जुड़े हुए हैं",
      "equivalent resistance": "तुल्य प्रतिरोध क्या होगा?",
      "Identify the output 'Y' of a digital AND logic gate": "एक डिजिटल AND लॉजिक गेट के आउटपुट 'Y' की पहचान करें",
      "A thin convex lens of focal length": "एक पतले उत्तल लेंस जिसकी फोकस दूरी", "Find the position of the image": "निर्मित होने वाले प्रतिबिंब की स्थिति ज्ञात कीजिए",
      "Identify the output": "आउटपुट की पहचान करें", "digital": "डिजिटल", "gate": "गेट", "inputs": "इनपुट",
      "Find the word which is closest in meaning (SYNONYM) to the target word": "दिए गए शब्द का निकटतम अर्थ (पर्यायवाची) खोजें",
      "Choose the word which is opposite in meaning (ANTONYM) to the target word": "दिए गए शब्द का विपरीत अर्थ (विलोम शब्द) चुनें",
      "Fill in the blank with the grammatically correct option": "व्याकरण की दृष्टि से सही विकल्प के साथ रिक्त स्थान भरें",
      "Read the passage below and answer the question": "नीचे दिए गए गद्यांश को पढ़ें और प्रश्न का उत्तर दें"
    };

    let translated = qText;
    Object.keys(translations).forEach(key => {
      if (translated.includes(key)) {
        translated = translated.replace(new RegExp(key, 'g'), translations[key]);
      }
    });
    
    // Fallback indicator for un-mapped sentences
    if (translated === qText) {
      return `[अनुवादित] ${qText} (हिंदी माध्यम में अनुवाद)`;
    }
    return translated;
  };

  const getTranslatedOption = (optText) => {
    if (lang === 'English') return optText;
    const optionTranslations = {
      "Newton": "न्यूटन", "Joule": "जूल", "Pascal": "पास्कल", "Watt": "वाट",
      "was": "था / थी", "were": "थे", "had studied": "पढ़ाई की थी", "studies": "पढ़ती है",
      "to": "से", "than": "की तुलना में", "on": "पर", "for": "के लिए",
      "Calm": "शांत", "Turbulent": "अशांत", "Respect": "आदर करना", "Despise": "नफरत करना",
      "Frank": "स्पष्टवादी", "Deceitful": "छली", "Wise": "बुद्धिमान", "Reckless": "लापरवाह",
      "Hardworking": "परिश्रमी", "Lazy": "आलसी", "Short-lived": "क्षणिक", "Permanent": "स्थायी",
      "Difficult": "कठिन", "Effortless": "सरल", "Kind": "दयालु", "Malevolent": "द्वेषपूर्ण",
      "Face a difficult situation with courage": "साहस के साथ कठिन परिस्थिति का सामना करना",
      "Wish someone good luck": "किसी को शुभकामनाएं देना",
      "Reveal a secret accidentally": "गलती से कोई रहस्य उजागर करना",
      "Work or study late into the night": "देर रात तक काम या पढ़ाई करना",
      "Under all conditions, good or bad": "सभी परिस्थितियों में, अच्छी या बुरी"
    };
    return optionTranslations[optText] || optText;
  };

  // --- WEBCAM MONITORING ACTIVATOR ---
  useEffect(() => {
    let videoElement = null;
    const enableWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120 } });
        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoElement = videoRef.current;
        }
      } catch (err) {
        console.warn('Camera monitoring disabled or permission denied:', err);
      }
    };
    enableWebcam();

    return () => {
      if (videoElement?.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // --- TAB SWITCH & ANTI-CHEATING IMMEDIATE TERMINATION SYSTEM ---
  useEffect(() => {
    let terminated = false;
    let blurTimeout = null;

    const navigateToResult = (result) => {
      // Exit full screen
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen();
        }
      } catch (err) {
        console.warn('Exit fullscreen failed:', err);
      }
      
      setLatestAttemptResult(result);
      navigate(`/result/${result._id}`);
    };

    const terminateAndSubmit = async (reason) => {
      if (terminated) return;
      terminated = true;
      
      alert(`🚨 NTA CBT SECURITY TERMINATION LOCK:\n${reason}\n\nAs per standard National Testing Agency (NTA) guidelines, your exam session has been terminated immediately. Your options recorded so far have been securely saved and submitted to the scoring server.`);
      
      // Auto-submit the exam immediately
      const result = await submitExam(true);
      if (result) {
        navigateToResult(result);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        terminateAndSubmit('You have switched browser tabs or minimized the active examination window.');
      }
    };

    const handleBlur = () => {
      // Add a small delay to avoid false positives (like closing the fullscreen prompt)
      blurTimeout = setTimeout(() => {
        terminateAndSubmit('The active exam window has lost focus (click detected outside of the exam frame).');
      }, 1500); // 1.5 seconds grace period
    };

    const handleFocus = () => {
      if (blurTimeout) clearTimeout(blurTimeout);
    };

    const preventCopy = (e) => e.preventDefault();
    const preventRightClick = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    document.addEventListener('paste', preventCopy);
    document.addEventListener('contextmenu', preventRightClick);

    return () => {
      if (blurTimeout) clearTimeout(blurTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
      document.removeEventListener('paste', preventCopy);
      document.removeEventListener('contextmenu', preventRightClick);
    };
  }, [submitExam, navigate, setLatestAttemptResult]);

  // --- SYNCHRONIZE SELECTED RADIO VALUE WITH QUESTION INDEX CHANGE ---
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (currentQuestion) {
      const respObj = responses[currentQuestion.id];
      setSelectedOption(respObj?.selectedOption || '');
    }
  }, [currentQuestionIndex, currentQuestion]);

  // --- KEYBOARD LOCK & ADVISORY SYSTEM ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showConfirmSubmit) return;
      
      const permittedKeys = ['ArrowRight', 'ArrowLeft', ' '];
      
      if (permittedKeys.includes(e.key)) {
        if (e.key === ' ') {
          e.preventDefault();
          handleSaveAndNext();
        } else if (e.key === 'ArrowRight') {
          handleNextOnly();
        } else if (e.key === 'ArrowLeft') {
          changeQuestionIndex(currentQuestionIndex - 1);
        }
        return;
      }

      // Block all other keys and alert as per NTA rules
      e.preventDefault();
      alert('⚠️ NTA SECURITY WARNING:\nPhysical keyboards are strictly disabled for this computer-based test as per National Testing Agency (NTA) regulations.\n\nTouching any keyboard key registers a security event log. Please perform all option selection, question navigation, and submissions using the on-screen mouse pointer.');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfirmSubmit, handleSaveAndNext, handleNextOnly, currentQuestionIndex, changeQuestionIndex]);

  if (questions.length === 0 || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4 font-semibold">Configuring mock paper and loading seeder questions...</p>
        </div>
      </div>
    );
  }

  // --- TIMER CONVERTER ---
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Count question status for the Legend box
  const getStatusCount = (statusName) => {
    return Object.values(responses).filter(r => r.status === statusName).length;
  };

  const totalAnswered = getStatusCount('answered');
  const totalNotAnswered = getStatusCount('not-answered');
  const totalMarked = getStatusCount('marked-review');
  const totalAnsweredMarked = getStatusCount('answered-review');
  const totalNotVisited = questions.length - (totalAnswered + totalNotAnswered + totalMarked + totalAnsweredMarked);

  const navigateToResult = (result) => {
    // Exit full screen
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Exit fullscreen failed:', err);
    }
    
    setLatestAttemptResult(result);
    navigate(`/result/${result._id}`);
  };

  // Submit action
  const handleFinalSubmit = async () => {
    setShowConfirmSubmit(false);
    const result = await submitExam(true); // Bypass normal window.confirm since we have our customized overlay
    if (result) {
      navigateToResult(result);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9] flex flex-col font-sans no-select no-select">
      
      {/* 1. TOP HEADER BANNER (NTA CBT Mock Theme) */}
      <header className="bg-white border-b-2 border-gray-200 py-3 px-6 shadow-sm flex justify-between items-center flex-wrap gap-4 select-none">
        <div className="flex items-center gap-2">
          <Monitor className="w-6 h-6 text-blue-700" />
          <h1 className="text-lg font-extrabold text-gray-800 tracking-wide uppercase">
            CUET (UG) - 2026 ONLINE CBT EXAM MOCK
          </h1>
        </div>
        
        {/* Timer Warnings */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded">
            <span className="text-xs text-blue-800 font-bold uppercase">Time Left:</span>
            <span className="text-base font-mono font-extrabold text-blue-900 tracking-wider">
              {formatTime(remainingTime)}
            </span>
          </div>

          {remainingTime <= 300 && (
            <div className="animate-pulse bg-red-100 border border-red-300 text-red-700 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              CRITICAL: Less than 5 mins left!
            </div>
          )}
        </div>
      </header>

      {/* 2. SPLIT LAYOUT (Left Side Question area, Right Side Candidate Details) */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden select-none">
        
        {/* LEFT COLUMN: THE QUESTIONS & OPTIONS (70% width) */}
        <div className="flex-grow flex flex-col bg-white border-r border-gray-200 lg:w-2/3 h-full overflow-hidden justify-between">
          
          {/* Question Meta Row */}
          <div className="bg-gray-100/80 px-6 py-2.5 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
            <div className="text-sm font-bold text-gray-700">
              Question No: <span className="text-blue-700 text-base font-extrabold">{currentQuestionIndex + 1}</span>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 border border-gray-300 rounded shadow-sm text-xs font-bold">
              <span className="text-gray-500">View In:</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer text-gray-800 font-bold"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिन्दी)</option>
              </select>
            </div>
          </div>

          {/* Question content frame */}
          <div className="flex-grow p-6 overflow-y-auto space-y-6 select-text">
            
            {/* Display passage if present */}
            {currentQuestion.chapter === "Reading Comprehension" && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-5 text-sm text-gray-700 leading-relaxed font-normal shadow-inner max-h-72 overflow-y-auto">
                <p className="font-extrabold text-[#0f2d59] mb-2 uppercase tracking-wide text-xs">Comprehension Passage:</p>
                {getTranslatedQuestion(currentQuestion.question.split('\n\nQuestion:')[0])}
              </div>
            )}

            {/* Question Text */}
            <div className="text-gray-800 font-bold text-base leading-relaxed">
              {currentQuestion.chapter === "Reading Comprehension" 
                ? `Question: ${getTranslatedQuestion(currentQuestion.question.split('\n\nQuestion: ')[1] || currentQuestion.question)}`
                : getTranslatedQuestion(currentQuestion.question)
              }
            </div>

            {/* MCQ Options Display */}
            <div className="space-y-3 pt-4">
              {currentQuestion.options.map((opt, idx) => {
                const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D
                const isSelected = selectedOption === opt;

                return (
                  <label
                    key={idx}
                    className={`flex items-center gap-4 px-5 py-3.5 border rounded-lg shadow-sm cursor-pointer select-none transition-all active:scale-[0.99] hover:bg-gray-50 ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50/60 font-extrabold text-blue-900' 
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="mcq-option"
                      value={opt}
                      checked={isSelected}
                      onChange={() => setSelectedOption(opt)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="font-bold text-xs bg-gray-100 text-gray-600 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">
                      {optionLabel}
                    </span>
                    <span className="text-sm font-medium">{getTranslatedOption(opt)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Bottom Action buttons row */}
          <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-between items-center flex-wrap gap-3 flex-shrink-0">
            <div className="flex gap-2.5">
              <button
                onClick={handleMarkForReviewAndNext}
                className="px-4 py-2 border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold text-xs rounded transition active:scale-95 cursor-pointer"
              >
                Mark for Review & Next
              </button>
              <button
                onClick={handleClearResponse}
                className="px-4 py-2 border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 font-bold text-xs rounded transition active:scale-95 cursor-pointer"
              >
                Clear Response
              </button>
            </div>
            
            <div className="flex gap-2.5">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => changeQuestionIndex(currentQuestionIndex - 1)}
                className={`px-4 py-2 border font-bold text-xs rounded transition active:scale-95 ${
                  currentQuestionIndex === 0 
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                    : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50 cursor-pointer'
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleNextOnly}
                disabled={currentQuestionIndex === questions.length - 1}
                className={`px-4 py-2 border font-bold text-xs rounded transition active:scale-95 ${
                  currentQuestionIndex === questions.length - 1 
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50' 
                    : 'border-gray-300 text-gray-600 bg-white hover:bg-gray-50 cursor-pointer'
                }`}
              >
                Next
              </button>
              <button
                onClick={handleSaveAndNext}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded shadow transition active:scale-95 cursor-pointer"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CANDIDATE INFO & GRID PALETTE (30% width) */}
        <div className="w-full lg:w-1/3 bg-[#f8fafc] p-6 flex flex-col justify-between overflow-y-auto space-y-6">
          
          <div>
            {/* Proctor Webcam Feed Mock + Profile */}
            <div className="bg-white border border-gray-200 rounded p-4 shadow-sm flex items-center gap-4">
              {cameraStream ? (
                <div className="w-24 h-24 bg-black rounded overflow-hidden relative border border-gray-300 shadow-inner flex-shrink-0">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  <span className="absolute top-1 left-1 bg-red-600 text-white text-[8px] font-bold px-1 py-0.5 rounded animate-pulse flex items-center gap-0.5">
                    <Camera className="w-2 h-2" /> LIVE
                  </span>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded border border-gray-300 flex flex-col items-center justify-center text-gray-400 flex-shrink-0">
                  <User className="w-10 h-10" />
                  <span className="text-[9px] font-bold uppercase mt-1">Photo</span>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Candidate Profile</p>
                <h4 className="font-extrabold text-sm text-gray-800 leading-tight">{user?.name}</h4>
                <p className="text-xs font-semibold text-gray-500">Roll No: {user?.rollNumber}</p>
                <p className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded inline-block uppercase">
                  Paper: {activeSubject === 'english' ? 'English' : 'Physics'}
                </p>
              </div>
            </div>

            {/* Anti-Cheating indicator */}
            {cheatingViolations > 0 && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded p-3 text-xs text-red-700 flex gap-2 items-center">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-bounce" />
                <div>
                  <b>Security Alert:</b> {cheatingViolations} window switch violations recorded!
                </div>
              </div>
            )}

            {/* Question Palette Header */}
            <div className="mt-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                Question Navigation Palette
              </h3>
              
              {/* PALETTE GRID */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm max-h-56 overflow-y-auto">
                <div className="grid grid-cols-5 gap-3.5">
                  {questions.map((q, idx) => {
                    const resp = responses[q.id];
                    let shapeClass = 'nta-shape-not-visited';
                    
                    if (resp) {
                      if (resp.status === 'answered') shapeClass = 'nta-shape-answered';
                      else if (resp.status === 'not-answered') shapeClass = 'nta-shape-not-answered';
                      else if (resp.status === 'marked-review') shapeClass = 'nta-shape-marked-review';
                      else if (resp.status === 'answered-review') shapeClass = 'nta-shape-answered-review';
                    }

                    const isCurrent = currentQuestionIndex === idx;

                    return (
                      <button
                        key={q.id}
                        onClick={() => changeQuestionIndex(idx)}
                        className={`w-10 h-10 flex items-center justify-center text-xs font-extrabold cursor-pointer transition select-none ${shapeClass} ${
                          isCurrent ? 'nta-shape-current' : ''
                        }`}
                      >
                        {(idx + 1).toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Legend Box Details */}
            <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-2.5">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-100">
                Palette Legends & Counts
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center nta-shape-answered flex-shrink-0 text-[10px]">{totalAnswered}</div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center nta-shape-not-answered flex-shrink-0 text-[10px]">{totalNotAnswered}</div>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center nta-shape-marked-review flex-shrink-0 text-[10px]">{totalMarked}</div>
                  <span>Marked Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 flex items-center justify-center nta-shape-answered-review flex-shrink-0 text-[10px]">{totalAnsweredMarked}</div>
                  <span>Answered & Review</span>
                </div>
                <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-gray-100 mt-1">
                  <div className="w-7 h-7 flex items-center justify-center nta-shape-not-visited flex-shrink-0 text-[10px]">{totalNotVisited}</div>
                  <span>Not Visited / Viewed Questions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Test Trigger Button */}
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="w-full py-3 bg-[#0f2d59] hover:bg-blue-900 text-white font-extrabold text-sm rounded shadow-md transition active:scale-95 cursor-pointer text-center"
          >
            SUBMIT EXAMINATION
          </button>
        </div>

      </div>

      {/* 3. CONFIRMATION SUBMIT POPUP DIALOG */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none">
          <div className="bg-white border border-gray-300 rounded-lg shadow-2xl p-6 max-w-md w-full text-center space-y-4">
            <CheckSquare className="w-16 h-16 text-[#0f2d59] mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-gray-800">Final Submission Summary</h3>
            
            <p className="text-xs text-gray-500 leading-normal">
              You have requested to submit the test paper. Please review your attempt summary stats before finalizing:
            </p>

            {/* Scored stats table in confirmation */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 rounded border border-gray-200 p-3 text-left font-semibold text-gray-700">
              <div className="flex justify-between border-r border-gray-200 pr-2">
                <span>Total Items:</span>
                <span className="text-black font-extrabold">{questions.length}</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>Answered:</span>
                <span className="text-emerald-700 font-extrabold">{totalAnswered + totalAnsweredMarked}</span>
              </div>
              <div className="flex justify-between border-r border-gray-200 pr-2 border-t border-gray-200 pt-1.5 mt-1.5">
                <span>Not Answered:</span>
                <span className="text-red-700 font-extrabold">{totalNotAnswered}</span>
              </div>
              <div className="flex justify-between pl-2 border-t border-gray-200 pt-1.5 mt-1.5">
                <span>Unvisited:</span>
                <span className="text-gray-500 font-extrabold">{totalNotVisited}</span>
              </div>
            </div>

            <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded border border-red-100">
              ⚠️ Attention: Once submitted, your scores will be locked, and you cannot return to edit any choices.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="w-1/2 py-2 border border-gray-300 text-gray-700 font-bold rounded text-xs hover:bg-gray-100 transition cursor-pointer"
              >
                Return to Exam
              </button>
              <button
                onClick={handleFinalSubmit}
                className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs shadow transition cursor-pointer"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamInterface;
