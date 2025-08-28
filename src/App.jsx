import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import ChapterReader from './ChapterReader';
import Browse from './Browse';
import MangaDetails from './MangaDetails';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/manga/:mangaId" element={<MangaDetails />} />
      <Route path="/reader/:chapterId" element={<ChapterReader />} />
      <Route path="*" element={<Home />} /> {/* Fallback for unknown routes */}
    </Routes>
  );
}
