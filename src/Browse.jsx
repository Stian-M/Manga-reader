import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const API_BASE = "https://manga-reader-swart.vercel.app/api";
const PAGE_SIZE = 20;

export default function Browse() {
  const [mangas, setMangas] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      `${API_BASE}/manga?order[followedCount]=desc&limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}&includes[]=cover_art`
    )
      .then((res) => res.json())
      .then((data) => {
        setMangas(formatManga(data));
        setTotal(data.total || 0);
      });
  }, [page]);

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

  return (
    <div className="browse-container">
      <h2>Browse Manga</h2>
      <div className="manga-list">
        {mangas.map((manga) => (
          <div
            className="manga-card"
            key={manga.id}
            onClick={() => navigate(`/manga/${manga.id}`)}
            style={{ cursor: "pointer" }}
          >
            <img src={manga.cover} alt={manga.title} className="manga-cover" />
            <div className="manga-title">{manga.title}</div>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <span>Page {page}</span>
        <button
          disabled={page * PAGE_SIZE >= total}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}