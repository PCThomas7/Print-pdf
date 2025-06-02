
import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MCQPDFGenerator from './components/MCQPDFGenerator/MCQPDFGenerator';
import Home from './components/Home/Home';
import QuizPrint from './components/QuizPrint/QuizPrint';
import GeneratedPdfPage from './components/GeneratedPdfPage/generatedpdfpage'; // Corrected import name and path

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<MCQPDFGenerator />} />
        <Route path="/admin/quizzes/print/:quizId" element={<QuizPrint />} />
        <Route path="/generated-pdf" element={<GeneratedPdfPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
