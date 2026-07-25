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

  const timerRef = useRef(null);
  const timeSpentIntervalRef = useRef(null);
  const submitExamRef = useRef(null);

  const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

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
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    let interval;
    if (user && user.role !== 'admin' && !examActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  // --- MOCK MOCK TEST DATA LOADER (defined before submitExam for dependency) ---
  const startExam = useCallback(async (subjectId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/questions/test?subject=${subjectId}`);
      if (!res.ok) throw new Error('Failed to load questions.');
      const data = await res.json();
      
      setQuestions(data.questions);
      
      const totalSeconds = 60 * 60;
      
      const cachedTime = localStorage.getItem('cuet_remaining_time');
      const cachedSubject = localStorage.getItem('cuet_active_subject');
      const cachedResponses = localStorage.getItem('cuet_responses');
      const cachedIndex = localStorage.getItem('cuet_question_index');

      if (cachedSubject === subjectId && cachedTime && cachedResponses) {
        setRemainingTime(parseInt(cachedTime));
        setResponses(JSON.parse(cachedResponses));
        setCurrentQuestionIndex(parseInt(cachedIndex || '0'));
      } else {
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
        
        localStorage.setItem('cuet_active_subject', subjectId);
        localStorage.setItem('cuet_responses', JSON.stringify(initialResponses));
        localStorage.setItem('cuet_question_index', '0');
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
  }, [API_BASE_URL]);

  // --- EXAM SUBMISSION ---
  const submitExam = useCallback(async (isAutoSubmit = false) => {
    if (!isAutoSubmit) {
      const confirmSubmit = window.confirm('Are you sure you want to SUBMIT the examination? No changes can be made after submission.');
      if (!confirmSubmit) return null;
    }

    const isEnglish = activeSubject === 'english';
    const timeTaken = 3600 - remainingTime;

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to submit attempt.');
      const attemptResult = await res.json();
      
      localStorage.removeItem('cuet_remaining_time');
      localStorage.removeItem('cuet_active_subject');
      localStorage.removeItem('cuet_responses');
      localStorage.removeItem('cuet_question_index');

      if (isEnglish) {
        if (timerRef.current) clearInterval(timerRef.current);
        if (timeSpentIntervalRef.current) clearInterval(timeSpentIntervalRef.current);

        alert('📝 English Language paper has been submitted successfully.\n\nYour Physics Domain Paper will begin immediately with a fresh 60-minute timer. Press OK to proceed.');
        
        await startExam('physics');
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
  }, [activeSubject, remainingTime, responses, user, API_BASE_URL, startExam]);

  // Keep ref updated for timer useEffect
  useEffect(() => {
    submitExamRef.current = submitExam;
  }, [submitExam]);

  // --- TIMER LOGIC (Resilient to Refresh) ---
  useEffect(() => {
    if (!examActive || remainingTime <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeSpentIntervalRef.current) clearInterval(timeSpentIntervalRef.current);
      return;
    }

    localStorage.setItem('cuet_remaining_time', remainingTime.toString());
    
    timerRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (timeSpentIntervalRef.current) clearInterval(timeSpentIntervalRef.current);
          if (submitExamRef.current) submitExamRef.current(true);
          return 0;
        }
        const nextTime = prev - 1;
        localStorage.setItem('cuet_remaining_time', nextTime.toString());
        return nextTime;
      });
    }, 1000);

    timeSpentIntervalRef.current = setInterval(() => {
      setQuestions(prevQ => {
        if (prevQ.length === 0) return prevQ;
        const currentQ = prevQ[currentQuestionIndex];
        if (!currentQ) return prevQ;

        setResponses(prevRes => {
          const currentRes = prevRes[currentQ.id] || { selectedOption: '', status: 'not-visited', timeSpent: 0 };
          return {
            ...prevRes,
            [currentQ.id]: {
              ...currentRes,
              timeSpent: currentRes.timeSpent + 1
            }
          };
        });
        return prevQ;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeSpentIntervalRef.current) clearInterval(timeSpentIntervalRef.current);
    };
  }, [examActive, remainingTime, currentQuestionIndex]);

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
      if (!res.ok) throw new Error('Authentication failed.');
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
      API_BASE_URL
    }}>
      {children}
    </ExamContext.Provider>
  );
};