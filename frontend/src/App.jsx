import { useState, useEffect, useRef } from 'react';
import { ExamProvider, useExam } from './context/ExamContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Instructions from './components/Instructions';
import ExamInterface from './components/ExamInterface';
import Result from './components/Result';
import AdminPanel from './components/AdminPanel';

const AppContent = () => {
  const { user, examActive, startExam, latestAttemptResult, setLatestAttemptResult } = useExam();
  const [currentView, setCurrentView] = useState('login');
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const initialViewSet = useRef(false);

// --- PERSIST ACTIVE VIEW ACROSS REFRESHES ---
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (initialViewSet.current) return;
    initialViewSet.current = true;
    
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentView('login');
      return;
    }
    
    if (user.role === 'admin') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentView('admin');
      return;
    }
    
    if (examActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentView('exam');
      return;
    }
    
    if (latestAttemptResult) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedAttempt(latestAttemptResult);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentView('result');
      return;
    }
    
    const lastView = localStorage.getItem('cuet_current_view');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentView(lastView === 'exam' || lastView === 'admin' ? 'dashboard' : lastView || 'dashboard');
  }, [user, examActive, latestAttemptResult]);

  const handleNavigation = (viewName) => {
    setCurrentView(viewName);
    localStorage.setItem('cuet_current_view', viewName);
  };

  const handleLoginSuccess = () => {
    const freshUser = JSON.parse(localStorage.getItem('cuet_user'));
    if (freshUser && freshUser.role === 'admin') {
      handleNavigation('admin');
    } else {
      handleNavigation('dashboard');
    }
  };

  const handleSelectSubject = () => {
    handleNavigation('instructions');
  };

  const handleStartExam = async (subjectId) => {
    // Request full screen for immersive CBT replication
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request blocked or not supported:', err);
    }
    
    // Clear any previous attempts cache state on start
    setLatestAttemptResult(null);
    await startExam(subjectId);
    handleNavigation('exam');
  };

  const handleExamSubmitted = (attemptResult) => {
    // Exit full screen
    try {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Exit fullscreen failed:', err);
    }
    
    setSelectedAttempt(attemptResult);
    setLatestAttemptResult(attemptResult);
    handleNavigation('result');
  };

  const handleViewAttemptResult = (attempt) => {
    setSelectedAttempt(attempt);
    handleNavigation('result');
  };

  const handleReturnToDashboard = () => {
    setSelectedAttempt(null);
    setLatestAttemptResult(null);
    handleNavigation('dashboard');
  };

  // --- MASTER ROUTER VIEW CONTROLLER ---
  switch (currentView) {
    case 'admin':
      return <AdminPanel onLogout={() => handleNavigation('login')} />;
      
    case 'dashboard':
      return (
        <Dashboard
          onSelectSubject={handleSelectSubject}
          onViewAttemptResult={handleViewAttemptResult}
          onLogout={() => handleNavigation('login')}
        />
      );
      
    case 'instructions':
      return (
        <Instructions
          onStartExam={handleStartExam}
        />
      );
      
    case 'exam':
      return (
        <ExamInterface
          onExamSubmitted={handleExamSubmitted}
        />
      );
      
    case 'result':
      return (
        <Result
          attemptData={selectedAttempt}
          onReturnToDashboard={handleReturnToDashboard}
        />
      );
      
    case 'login':
    default:
      return <Login onLoginSuccess={handleLoginSuccess} />;
  }
};

const App = () => {
  return (
    <ExamProvider>
      <AppContent />
    </ExamProvider>
  );
};

export default App;
