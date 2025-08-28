import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './Home';
import ChapterReader from './ChapterReader';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reader/:chapterId" element={<ChapterReader />} />
    </Routes>
  );
}
