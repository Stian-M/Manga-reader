import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./ChapterReader.css";

const API_BASE = "https://your-vercel-app.vercel.app/api";

export default function ChapterReader() {
    const { chapterId } = useParams();
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPages() {
            setLoading(true);
            const res = await fetch(`${API_BASE}/at-home/server/${chapterId}`);
            const data = await res.json();
            if (data && data.chapter) {
                const { baseUrl } = data;
                const { hash, data: pageFiles } = data.chapter;
                const pageUrls = pageFiles.map(
                    (filename) => `${baseUrl}/data/${hash}/${filename}`
                );
                setPages(pageUrls);
                console.log("Page URLs:", pageUrls); // Debug: log URLs
            } else {
                setPages([]);
            }
            setLoading(false);
        }
        fetchPages();
    }, [chapterId]);
     
    return (
        <div className="reader-container">
            <Link to="/" className="back-link">Back to Home</Link>
            <h2>Chapter Reader</h2>
            {loading ? (
                <p>Loading pages...</p>
            ) : pages.length === 0 ? (
                <p>No pages found for this chapter.</p>
            ) : (
                <div className="pages-list" style={{ minHeight: "300px" }}>
                    {pages.map((url, index) => (
                        <img
                            key={index}
                            src={url}
                            alt={`Page ${index + 1}`}
                            className="reader-page"
                            style={{ width: "100%", marginBottom: "2rem", borderRadius: "8px" }}
                            onError={(e) => { e.target.style.display = "none"; }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}