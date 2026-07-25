import { useState } from 'react';
import { useExam } from '../context/ExamContext';
import { Monitor, AlertTriangle, ShieldCheck } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const { login } = useExam();
  const [name, setName] = useState('Taniyea Khanam Mazumder'); // Fixed candidate name
  const [rollNumber, setRollNumber] = useState('26051004928'); // Fixed roll number
  const [subject, setSubject] = useState('english'); // Default starting subject paper
  const [password, setPassword] = useState(''); // Blank by default, user inputs manually
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter your Candidate Name.');
    if (!rollNumber.trim()) return alert('Please enter your Roll Number.');
    if (!password.trim()) return alert('Please enter your Date of Birth / Password.');

    // Strict Client-Side Credentials Checks
    if (isAdminMode) {
      if (rollNumber.toLowerCase() !== 'admin') {
        return alert('⚠️ Access Denied: Admin Roll Number must be "admin".');
      }
      if (password !== '13042007') {
        return alert('⚠️ Access Denied: Incorrect Admin Security Token (must be "13042007").');
      }
    } else {
      if (rollNumber !== '26051004928') {
        return alert('⚠️ Access Denied: Invalid Student Roll Number.');
      }
      if (password !== '09052008') {
        return alert('⚠️ Access Denied: Incorrect Date of Birth Password (must be "09052008").');
      }
      if (name.trim().toLowerCase() !== 'taniyea khanam mazumder') {
        return alert('⚠️ Access Denied: Candidate Name mismatch.');
      }
    }

    const user = await login({ name, rollNumber, password, subject });
    if (user) {
      onLoginSuccess();
    }
  };

  const handleReset = () => {
    if (isAdminMode) {
      setName('');
      setRollNumber('admin');
      setPassword('');
    } else {
      setName('Taniyea Khanam Mazumder');
      setRollNumber('26051004928');
      setPassword('');
    }
    setSubject('english');
  };

  const switchToAdmin = () => {
    setIsAdminMode(true);
    setRollNumber('admin');
    setPassword('');
    setName('System Administrator');
  };

  const switchToStudent = () => {
    setIsAdminMode(false);
    setRollNumber('26051004928');
    setPassword('');
    setName('Taniyea Khanam Mazumder');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between font-sans no-select select-none">
      {/* NTA Simulated Header Banner */}
      <header className="bg-[#0f2d59] text-white py-4 px-6 shadow-md border-b-4 border-[#ff9933] flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden p-1">
            <ShieldCheck className="w-8 h-8 text-[#0f2d59]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">राष्ट्रीय परीक्षा एजेंसी</h1>
            <p className="text-xs uppercase tracking-widest text-orange-200">National Testing Agency</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-semibold text-blue-100">CUET CBT PRACTICE PORTAL</h2>
          <p className="text-xs text-orange-200 font-mono">EXCELLENCE IN ASSESSMENT</p>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Panel: Instructions & Requirements */}
          <div className="w-full md:w-1/2 bg-blue-50/70 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200">
            <div>
              <div className="flex items-center gap-2 text-blue-800 mb-4">
                <Monitor className="w-6 h-6" />
                <h3 className="font-bold text-lg">System Specifications</h3>
              </div>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#0f2d59] font-bold">•</span>
                  <span>This mock test is optimized to replicate the official NTA Computer-Based Test (CBT) environment.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0f2d59] font-bold">•</span>
                  <span>Your allocated test contains English (Core Language) & Physics (Domain Subject) back-to-back.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0f2d59] font-bold">•</span>
                  <span>Each subject runs on a strict 60-minute timer and auto-submits upon completion.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0f2d59] font-bold">•</span>
                  <span>Auto-save is active: refreshing the browser preserves your timer and responses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0f2d59] font-bold">•</span>
                  <span>
                    To upload custom question banks or edit mock durations, select the{' '}
                    <button
                      type="button"
                      onClick={switchToAdmin}
                      className="text-blue-700 font-extrabold hover:underline cursor-pointer focus:outline-none"
                    >
                      System Console Admin Link
                    </button>.
                  </span>
                </li>
              </ul>
            </div>

            {/* Mobile View Alert */}
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded p-4 flex gap-3 items-start">
              <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
              <div>
                <h4 className="text-amber-800 text-xs font-bold uppercase tracking-wider">Device Notice</h4>
                <p className="text-amber-700 text-xs leading-relaxed mt-1">
                  For the closest NTA CBT replica, it is highly recommended to open this on a <b>Laptop or Desktop screen</b>.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel: Login Form */}
          <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
            
            {/* Admin Banner Alert */}
            {isAdminMode && (
              <div className="bg-red-50 text-red-700 text-xs font-bold p-2.5 rounded border border-red-200 mb-4 flex justify-between items-center select-none animate-fadeIn">
                <span>⚠️ SYSTEM CONFIGURATION PORTAL ACTIVE</span>
                <button
                  type="button"
                  onClick={switchToStudent}
                  className="underline text-red-900 hover:text-red-950 cursor-pointer"
                >
                  Student Login
                </button>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {isAdminMode ? 'System Console Login' : 'Candidate Login'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isAdminMode 
                  ? 'Access operational database parameters' 
                  : 'Please sign-in using your assigned terminal parameters'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAdminMode}
                  placeholder={isAdminMode ? 'Enter admin identity' : 'Enter your name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2 border rounded outline-none transition select-text ${
                    isAdminMode 
                      ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800' 
                      : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed select-none font-bold'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAdminMode}
                  placeholder="Roll Number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className={`w-full px-4 py-2 border rounded outline-none transition select-text ${
                    isAdminMode 
                      ? 'border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800' 
                      : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed select-none font-bold'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  {isAdminMode ? 'System Token' : 'Password (Date of Birth - DDMMYYYY)'}
                </label>
                <input
                  type={isAdminMode ? 'password' : 'text'}
                  required
                  placeholder={isAdminMode ? 'Enter System Secret' : 'DDMMYYYY (e.g., 09052008)'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 outline-none transition select-text"
                />
              </div>

              {/* Subject Paper drop is completely removed in student mode to simplify mock flow */}
              {isAdminMode && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                    Select Subject Paper
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white cursor-pointer font-semibold text-gray-700"
                  >
                    <option value="english">English (Core Language)</option>
                    <option value="physics">Physics (Domain Subject)</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4 select-none">
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-1/3 py-2 border border-gray-300 text-gray-700 font-bold rounded hover:bg-gray-100 transition active:scale-95 cursor-pointer text-center"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className={`w-2/3 py-2 text-white font-bold rounded shadow-md transition active:scale-95 cursor-pointer text-center ${
                    isHovered ? 'bg-[#0b2142]' : 'bg-[#0f2d59]'
                  }`}
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer System Disclaimer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-3 text-center text-xs text-gray-500 flex justify-center items-center gap-4 flex-wrap">
        <span>© 2026 National Testing Agency. This is a realistic CBT mock environment developed for home practice.</span>
        <span>•</span>
        <button
          type="button"
          onClick={switchToAdmin}
          className="text-gray-400 hover:text-blue-700 font-semibold hover:underline"
        >
          [System Console Login]
        </button>
      </footer>
    </div>
  );
};

export default Login;
