import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import Browse from "./Browse";

const API_BASE = "https://manga-reader-swart.vercel.app/api";

function MangaSection({ id, title, mangas, onSelect }) {
  return (
    <section className="manga-section" id={id}>
      <h2>{title}</h2>
      {mangas.length === 0 ? (
        <div style={{ textAlign: "center", color: "#bbb", padding: "2rem" }}>
          No manga found.
        </div>
      ) : (
        <div className="manga-list">
          {mangas.map((manga) => (
            <div
              className="manga-card"
              key={manga.id}
              onClick={() => onSelect(manga)}
              style={{ cursor: "pointer" }}
            >
              <img
                src={manga.cover}
                alt={manga.title}
                className="manga-cover"
              />
              <div className="manga-title">{manga.title}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function MangaDetailsModal({ manga, onClose}) {
    const [details, setDetails] = useState(null);
    const [chapters, setChapters] = useState([]);
    const [language, setLanguage] = useState('en');
    const [availableLanguages, setAvailableLanguages] = useState(["en"]);

    useEffect(() => {
        if (!manga) return;
        //Fetch manga details
        fetch(`${API_BASE}/manga/${manga.id}`)
          .then((res) => res.json())
          .then((data) => setDetails(data.data));

          fetch(`${API_BASE}/chapter?manga=${manga.id}&limit=100`)
            .then((res) => res.json())
            .then((data) => {
              const langs = Array.from(
                new Set((data.data || []).map((ch) => ch.attributes.translatedLanguage))
              );
              setAvailableLanguages(langs.length ? langs : ["en"]);
            });
    }, [manga]);

    useEffect(() => {
        if (!manga) return;
        //Fetch chapters in selected language
        fetch(`${API_BASE}/chapter?manga=${manga.id}&order[chapter]=asc&limit=100&translatedLanguage[]=${language}`)
          .then((res) => res.json())
          .then((data) => setChapters(data.data || []));
    }, [manga, language]);

    if (!manga) return null;

    return(
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={onClose}>X</button>
          <img
            src={manga.cover}
            alt={manga.title}
            className="modal-manga-cover"
          />
          <h2>{manga.title}</h2>
          {details && (
            <div>
              <p>{details.attributes.description.en || "No description available."}</p>
              <p>
                <strong>Status:</strong> {details.attributes.status}
              </p>
              <p>
                <strong>Year:</strong> {details.attributes.year || "N/A"}
              </p>
            </div>
          )}
          <h3>Chapters</h3>
          <label>
            Language:&nbsp;
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <ul className="chapter-list">
            {chapters.map((ch) => (
              <li key={ch.id}>
                <Link to={`/reader/${ch.id}`} className="chapter-link">
                <span className="chapter-number">
                  Chapter {ch.attributes.chapter || "N/A"}
                </span>
                <span className="chapter-title">
                  {ch.attributes.title || "No title"}
                </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
}

export default function Home() {
  const [latest, setLatest] = useState([]);
  const [popular, setPopular] = useState([]);
  const [updated, setUpdated] = useState([]);
  const [selectedManga, setSelectedManga] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    // Fetch latest manga
    fetch(
      `${API_BASE}/manga?order[createdAt]=desc&limit=20&includes[]=cover_art`
    )
      .then((res) => res.json())
      .then((data) => setLatest(formatManga(data)));

    // Fetch popular manga
    fetch(
      `${API_BASE}/manga?order[followedCount]=desc&limit=20&includes[]=cover_art`
    )
      .then((res) => res.json())
      .then((data) => setPopular(formatManga(data)));

    // Fetch recently updated manga
    fetch(
      `${API_BASE}/manga?order[updatedAt]=desc&limit=20&includes[]=cover_art`
    )
      .then((res) => res.json())
      .then((data) => setUpdated(formatManga(data)));
  }, []);

  function formatManga(data) {
    if (!data || !data.data) return [];
    return data.data.map((item) => {
      const title = item.attributes.title.en || Object.values(item.attributes.title)[0];
      const coverRel = item.relationships.find((r) => r.type === "cover_art");
      const cover = coverRel
        ? `${API_BASE}/cover/${item.id}/${coverRel.attributes.fileName}`
        : "https://via.placeholder.com/256x350?text=No+Cover";
      return {
        id: item.id,
        title,
        cover,
      };
    });
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearching(true);
    setSearchResults([]);
    const res = await fetch(`${API_BASE}/manga?title=${encodeURIComponent(searchTerm)}&limit=20&includes[]=cover_art`);
    const data = await res.json();
    setSearchResults(formatManga(data));
    setSearching(false);
  }

  return (
    <div className="home-container">
      <header className="main-header">
        <h1>Manga Reader</h1>
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search manga..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
          <button type="submit" disabled={searching}>
            🔍
          </button>
        </form>
        <nav>
          <Link to="/browse">Browse</Link>
        </nav>
      </header>
      <main>
        <MangaSection title={searching ? "Searching..." : searchResults.length ? "Search Results" : ""} mangas={searchResults} onSelect={setSelectedManga} />
        <MangaSection id="latest" title="Latest Manga" mangas={latest} onSelect={setSelectedManga} />
        <MangaSection id="popular" title="Popular Manga" mangas={popular} onSelect={setSelectedManga}/>
        <MangaSection id="updated" title="Recently Updated" mangas={updated} onSelect={setSelectedManga}/>
      </main>
      {selectedManga && (
        <MangaDetailsModal
        manga={selectedManga}
        onClose={() => setSelectedManga(null)}
        />
      )}
    </div>
  );
}
