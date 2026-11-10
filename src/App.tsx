import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { DetectPage } from './pages/DetectPage';
import { ResultsPage } from './pages/ResultsPage';
import { AboutPage } from './pages/AboutPage';
import { HistoryPage } from './pages/HistoryPage';
import type { AnalysisResult } from './types';
import { SAMPLE_CASES } from './services/mockData';
import { getScanHistory, saveScanToHistory } from './services/api';

export function App() {
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const existing = getScanHistory();
    if (existing.length === 0) {
      saveScanToHistory(SAMPLE_CASES[0].mockResult);
      saveScanToHistory(SAMPLE_CASES[1].mockResult);
    }
    if (!currentResult) {
      setCurrentResult(SAMPLE_CASES[0].mockResult);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-cyan-500 selection:text-white">
        <Navbar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/detect" 
              element={
                <DetectPage 
                  onAnalysisComplete={(res) => setCurrentResult(res)} 
                />
              } 
            />
            <Route 
              path="/results" 
              element={
                <ResultsPage 
                  result={currentResult} 
                />
              } 
            />
            <Route path="/about" element={<AboutPage />} />
            <Route 
              path="/history" 
              element={
                <HistoryPage 
                  onSelectResult={(res) => setCurrentResult(res)} 
                />
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
