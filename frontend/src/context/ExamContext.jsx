/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const ExamContext = createContext(null);

export const useExam = () => useContext(ExamContext);

export const ExamProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cuet_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('cuet_token') || null);
  const [activeSubject, setActiveSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [examActive, setExamActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subjectsConfig, setSubjectsConfig] = useState([]);
  const [cheatingViolations, setCheatingViolations] = useState(0);
  const [latestAttemptResult, setLatestAttemptResult] = useState(null);
  const [isTerminalAuthorized, setIsTerminalAuthorized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false); // Issue #22: suppress anti-cheat during subject switch

  const timerRef = useRef(null);
  const timeSpentIntervalRef = useRef(null);
  const submitExamRef = useRef(null);

  // Issue #13: Refs for stable access inside interval callbacks (avoids nested setState anti-pattern)
  const currentQuestionIndexRef = useRef(0);
  const questionsRef = useRef([]);
  const configuredDurationRef = useRef(3600); // Issue #7: total seconds for active exam

  const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

  // Keep refs in sync with state
  useEffect(() => { currentQuestionIndexRef.current = currentQuestionIndex; }, [currentQuestionIndex]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  const fetchTerminalAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/config/terminal-auth`);
      if (res.ok) {
        const data = await res.json();
        setIsTerminalAuthorized(data.authorized);
        return data.authorized;
      }
    } catch (err) {
      console.warn('Failed to fetch terminal authorization status:', err);
    }
  }, [API_BASE_URL]);

  const toggleTerminalAuth = useCallback(async (status) => {
    try {
      const res = await fetch(`${API_BASE_URL}/config/terminal-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ authorized: status })
      });
      if (res.ok) {
        const data = await res.json();
        setIsTerminalAuthorized(data.authorized);
        return data.authorized;
      }
    } catch (err) {
      console.error('Failed to toggle terminal authorization:', err);
    }
  }, [API_BASE_URL, token]);

  // --- LIVE POLLING FOR INVIGILATOR ENTRY PERMISSION ---
  useEffect(() => {
    let interval;
    if (user && user.role !== 'admin' && !examActive) {
      fetchTerminalAuth();
      interval = setInterval(fetchTerminalAuth, 3000);
    }
    return () => clearInterval(interval);
  }, [user, examActive, fetchTerminalAuth]);

  // --- PERSIST USER STATE ---
  useEffect(() => {
    if (user) {
      localStorage.setItem('cuet_user', JSON.stringify(user));
      localStorage.setItem('cuet_token', token);
    } else {
      localStorage.removeItem('cuet_user');
      localStorage.removeItem('cuet_token');
    }
  }, [user, token]);

  // --- FETCH SUBJECT CONFIG ON MOUNT ---
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/config/subjects`);
        if (res.ok) {
          const data = await res.json();
          setSubjectsConfig(data);
        }
      } catch (err) {
        console.error('Failed to fetch subjects configs:', err);
        setSubjectsConfig([
          { id: 'english', name: 'English', duration: 60, totalQuestions: 40, selectQuestions: 40 },
          { id: 'physics', name: 'Physics', duration: 60, totalQuestions: 50, selectQuestions: 40 }
        ]);
      }
    };
    fetchConfigs();
  }, [API_BASE_URL]);

  // --- Issue #14: AUTO-RESTORE cached exam state on mount (survives page refresh) ---
  useEffect(() => {
    const cachedSubject = localStorage.getItem('cuet_active_subject');
    const cachedQuestions = localStorage.getItem('cuet_questions');
    const cachedResponses = localStorage.getItem('cuet_responses');
    const cachedTime = localStorage.getItem('cuet_remaining_time');
    const cachedIndex = localStorage.getItem('cuet_question_index');
    const cachedDuration = localStorage.getItem('cuet_configured_duration');

    if (user && cachedSubject && cachedQuestions && cachedResponses && cachedTime) {
      try {
        const parsedQuestions = JSON.parse(cachedQuestions);
        const parsedResponses = JSON.parse(cachedResponses);
        const parsedTime = parseInt(cachedTime);
        const parsedIndex = parseInt(cachedIndex || '0');
        const parsedDuration = parseInt(cachedDuration || '3600');

        if (parsedQuestions.length > 0 && parsedTime > 0) {
          setQuestions(parsedQuestions);
          questionsRef.current = parsedQuestions;
          setResponses(parsedResponses);
          setRemainingTime(parsedTime);
          setCurrentQuestionIndex(parsedIndex);
          currentQuestionIndexRef.current = parsedIndex;
          setActiveSubject(cachedSubject);
          configuredDurationRef.current = parsedDuration;
          setExamActive(true);
        }
      } catch (err) {
        console.error('Failed to restore exam state from cache:', err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty — run only once on mount

  // --- EXAM LOADER ---
  const startExam = useCallback(async (subjectId) => {
    setIsLoading(true);
    try {
      // Issue #14: Check for cached questions for this subject (avoids re-fetch which re-shuffles)
      const cachedSubject = localStorage.getItem('cuet_active_subject');
      const cachedQuestions = localStorage.getItem('cuet_questions');
      const cachedTime = localStorage.getItem('cuet_remaining_time');
      const cachedResponses = localStorage.getItem('cuet_responses');
      const cachedIndex = localStorage.getItem('cuet_question_index');
      const cachedDuration = localStorage.getItem('cuet_configured_duration');

      if (cachedSubject === subjectId && cachedQuestions && cachedResponses && cachedTime) {
        // Resume from cache — use the SAME questions as before
        const parsedQuestions = JSON.parse(cachedQuestions);
        setQuestions(parsedQuestions);
        questionsRef.current = parsedQuestions;
        setRemainingTime(parseInt(cachedTime));
        setResponses(JSON.parse(cachedResponses));
        setCurrentQuestionIndex(parseInt(cachedIndex || '0'));
        configuredDurationRef.current = parseInt(cachedDuration || '3600');
      } else {
        // Fresh start — fetch questions from server and cache them
        const res = await fetch(`${API_BASE_URL}/questions/test?subject=${subjectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load questions.');
        const data = await res.json();
        
        setQuestions(data.questions);
        questionsRef.current = data.questions;
        
        // Issue #7: Use admin-configured duration instead of hardcoded 3600
        const subConfig = subjectsConfig.find(s => s.id === subjectId);
        const totalSeconds = (subConfig?.duration || 60) * 60;
        configuredDurationRef.current = totalSeconds;

        setRemainingTime(totalSeconds);

        const initialResponses = {};
        data.questions.forEach((q, idx) => {
          initialResponses[q.id] = {
            selectedOption: '',
            status: idx === 0 ? 'not-answered' : 'not-visited',
            timeSpent: 0
          };
        });
        setResponses(initialResponses);
        setCurrentQuestionIndex(0);
        currentQuestionIndexRef.current = 0;
        
        // Cache everything to localStorage for refresh resilience
        localStorage.setItem('cuet_active_subject', subjectId);
        localStorage.setItem('cuet_questions', JSON.stringify(data.questions));
        localStorage.setItem('cuet_responses', JSON.stringify(initialResponses));
        localStorage.setItem('cuet_question_index', '0');
        localStorage.setItem('cuet_remaining_time', totalSeconds.toString());
        localStorage.setItem('cuet_configured_duration', totalSeconds.toString());
      }

      setActiveSubject(subjectId);
      setExamActive(true);
      setCheatingViolations(0);
    } catch (err) {
      console.error(err);
      alert('Error loading questions: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, token, subjectsConfig]);

  // --- EXAM SUBMISSION ---
  const submitExam = useCallback(async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      const confirmSubmit = window.confirm('Are you sure you want to SUBMIT the examination? No changes can be made after submission.');
      if (!confirmSubmit) return null;
    }

    const isEnglish = activeSubject === 'english';
    // Issue #7: Use configured duration instead of hardcoded 3600
    const totalDuration = configuredDurationRef.current;
    const timeTaken = totalDuration - remainingTime;

    const formattedResponses = Object.keys(responses).map(qId => ({
      questionId: parseInt(qId),
      selectedOption: responses[qId].selectedOption,
      timeSpent: responses[qId].timeSpent,
      status: responses[qId].status
    }));

    const payload = {
      candidateName: user.name,
      rollNumber: user.rollNumber,
      subject: isEnglish ? 'English' : 'Physics',
      responses: formattedResponses,
      timeTaken
    };

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/attempts/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Issue #3: authenticated submission
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to submit attempt.');
      const attemptResult = await res.json();
      
      // Issue #24: Clear all cached exam state before starting new subject
      localStorage.removeItem('cuet_remaining_time');
      localStorage.removeItem('cuet_active_subject');
      localStorage.removeItem('cuet_responses');
      localStorage.removeItem('cuet_question_index');
      localStorage.removeItem('cuet_questions');
      localStorage.removeItem('cuet_configured_duration');

      if (isEnglish) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (timeSpentIntervalRef.current) clearInterval(timeSpentIntervalRef.current);

        // Issue #22: Set transitioning flag to suppress anti-cheat during subject switch
        setIsTransitioning(true);

        alert('📝 English Language paper has been submitted successfully.\n\nYour Physics Domain Paper will begin immediately with a fresh timer. Press OK to proceed.');
        
        await startExam('physics');
        setIsTransitioning(false);
        return null;
      } else {
        setExamActive(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (timeSpentIntervalRef.current) clearInterval(timeSpentIntervalRef.current);
        setLatestAttemptResult(attemptResult);
        return attemptResult;
      }
    } catch (err) {
      console.error('Error submitting exam:', err);
      alert('Error submitting exam: ' + err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [activeSubject, remainingTime, responses, user, token, API_BASE_URL, startExam]);

  // Keep ref updated for timer useEffect
  useEffect(() => {
    submitExamRef.current = submitExam;
  }, [submitExam]);

  // --- Issue #8: TIMER LOGIC — intervals created ONCE, not re-created every second ---
  // Issue #13: timeSpent uses refs instead of nested setState anti-pattern
  useEffect(() => {
    if (!examActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeSpentIntervalRef.current) clearInterval(timeSpentIntervalRef.current);
      return;
    }

    // Countdown timer — uses functional setState, no dependency on remainingTime
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          clearInterval(timeSpentIntervalRef.current);
          if (submitExamRef.current) submitExamRef.current(true);
          return 0;
        }
        const nextTime = prev - 1;
        localStorage.setItem('cuet_remaining_time', nextTime.toString());
        return nextTime;
      });
    }, 1000);

    // Per-question time tracking — reads from refs, no nested setState
    timeSpentIntervalRef.current = setInterval(() => {
      const currentQ = questionsRef.current[currentQuestionIndexRef.current];
      if (!currentQ) return;

      setResponses(prevRes => {
        const currentRes = prevRes[currentQ.id] || { selectedOption: '', status: 'not-visited', timeSpent: 0 };
        const updated = {
          ...prevRes,
          [currentQ.id]: {
            ...currentRes,
            timeSpent: currentRes.timeSpent + 1
          }
        };
        localStorage.setItem('cuet_responses', JSON.stringify(updated));
        return updated;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeSpentIntervalRef.current) clearInterval(timeSpentIntervalRef.current);
    };
  }, [examActive]); // Issue #8: Only depends on examActive — no more re-creation every tick

  // --- SAVE CURRENT RESPONSE TO STATE AND LOCAL STORAGE ---
  const saveResponse = useCallback((questionId, option, statusName) => {
    setResponses(prev => {
      const updated = {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          selectedOption: option,
          status: statusName
        }
      };
      localStorage.setItem('cuet_responses', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // --- CHANGE QUESTION INDEX ---
  const changeQuestionIndex = useCallback((index) => {
    if (index < 0 || index >= questions.length) return;
    
    const currentQ = questions[currentQuestionIndex];
    if (currentQ) {
      const currentRes = responses[currentQ.id];
      if (currentRes && currentRes.status === 'not-visited') {
        saveResponse(currentQ.id, currentRes.selectedOption, 'not-answered');
      }
    }

    const nextQ = questions[index];
    if (nextQ) {
      const nextRes = responses[nextQ.id];
      if (nextRes && nextRes.status === 'not-visited') {
        saveResponse(nextQ.id, nextRes.selectedOption, 'not-answered');
      }
    }

    setCurrentQuestionIndex(index);
    currentQuestionIndexRef.current = index;
    localStorage.setItem('cuet_question_index', index.toString());
  }, [questions, currentQuestionIndex, responses, saveResponse]);

  const login = useCallback(async (loginData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Authentication failed.' }));
        throw new Error(errorData.error || 'Authentication failed.');
      }
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      return data.user;
    } catch (err) {
      console.error(err);
      alert('Authentication error: ' + err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('cuet_user');
    localStorage.removeItem('cuet_token');
    
    setQuestions([]);
    setResponses({});
    setExamActive(false);
    setActiveSubject(null);
    setRemainingTime(0);
    localStorage.removeItem('cuet_remaining_time');
    localStorage.removeItem('cuet_active_subject');
    localStorage.removeItem('cuet_responses');
    localStorage.removeItem('cuet_question_index');
    localStorage.removeItem('cuet_current_view');
    localStorage.removeItem('cuet_questions');
    localStorage.removeItem('cuet_configured_duration');
  }, []);

  return (
    <ExamContext.Provider value={{
      user,
      token,
      login,
      logout,
      activeSubject,
      questions,
      currentQuestionIndex,
      responses,
      remainingTime,
      examActive,
      isLoading,
      subjectsConfig,
      cheatingViolations,
      setCheatingViolations,
      startExam,
      saveResponse,
      changeQuestionIndex,
      submitExam,
      latestAttemptResult,
      setLatestAttemptResult,
      isTerminalAuthorized,
      toggleTerminalAuth,
      isTransitioning, // Issue #22: exposed for ExamInterface anti-cheat guard
      API_BASE_URL
    }}>
      {children}
    </ExamContext.Provider>
  );
};