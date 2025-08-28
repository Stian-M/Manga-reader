import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./Home.css";

const API_BASE = "https://manga-reader-swart.vercel.app/api";

export default function MangaDetails() {
  const { mangaId } = useParams();
  const [details, setDetails] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [language, setLanguage] = useState("en");
  const [availableLanguages, setAvailableLanguages] = useState(["en"]);

  useEffect(() => {
    if (!mangaId) return;
    fetch(`${API_BASE}/manga/${mangaId}`)
      .then((res) => res.json())
      .then((data) => setDetails(data.data));

    fetch(`${API_BASE}/chapter?manga=${mangaId}&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        const langs = Array.from(
          new Set((data.data || []).map((ch) => ch.attributes.translatedLanguage))
        );
        setAvailableLanguages(langs.length ? langs : ["en"]);
      });
  }, [mangaId]);

  useEffect(() => {
    if (!mangaId) return;
    fetch(
      `${API_BASE}/chapter?manga=${mangaId}&order[chapter]=asc&limit=100&translatedLanguage[]=${language}`
    )
      .then((res) => res.json())
      .then((data) => setChapters(data.data || []));
  }, [mangaId, language]);

  if (!details) return <div>Loading...</div>;

  const title =
    details.attributes.title.en ||
    Object.values(details.attributes.title)[0] ||
    "No title";
  const coverRel = details.relationships.find((r) => r.type === "cover_art");
  const cover = coverRel
    ? `${API_BASE}/cover/${details.id}/${coverRel.attributes.fileName}`
    : "https://via.placeholder.com/256x350?text=No+Cover";

  return (
    <div className="modal-content" style={{ maxWidth: 600, margin: "2rem auto" }}>
      <img src={cover} alt={title} className="modal-manga-cover" />
      <h2>{title}</h2>
      <div>
        <p>
          {details.attributes.description.en || "No description available."}
        </p>
        <p>
          <strong>Status:</strong> {details.attributes.status}
        </p>
        <p>
          <strong>Year:</strong> {details.attributes.year || "N/A"}
        </p>
      </div>
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
  );
}