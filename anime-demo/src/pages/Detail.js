import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ReviewSection from "../components/ReviewSection";
import { styles } from "../styles";

const Detail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [anime, setAnime] = useState(null);

    useEffect(() => {
        fetch(`https://api.jikan.moe/v4/anime/${id}`)
            .then((res) => res.json())
            .then((data) => setAnime(data.data));
    }, [id]);

    if (!anime) return <div style={styles.centerText}>로딩 중... 🌀</div>;

    return (
        <div style={styles.container}>
            <Header />
            <button onClick={() => navigate(-1)} style={styles.backButton}>
                ← 뒤로 가기
            </button>
            <div style={styles.detailCard}>
                <div style={styles.detailHeader}>
                    <h1>{anime.title}</h1>
                    <p style={{ color: "#666" }}>{anime.title_japanese}</p>
                </div>
                <div style={styles.detailBody}>
                    <div style={styles.imageWrapper}>
                        <img
                            src={anime.images.jpg.large_image_url}
                            alt="poster"
                            style={styles.detailImage}
                        />
                    </div>
                    <div style={styles.detailInfo}>
                        <div style={styles.tagContainer}>
                            <span style={styles.badge}>⭐ {anime.score || "N/A"}</span>
                            <span style={styles.badge}>
                                {anime.year ? `${anime.year}년` : "연도 미상"}
                            </span>
                            <span style={styles.badge}>{anime.status}</span>
                            <span style={styles.badge}>{anime.rating}</span>
                        </div>
                        <p>
                            <strong>장르:</strong>{" "}
                            {anime.genres?.map((g) => g.name).join(", ")}
                        </p>
                        <p style={styles.synopsis}>{anime.synopsis}</p>
                        <a
                            href={anime.url}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.linkButton}
                        >
                            MyAnimeList 이동 ↗
                        </a>
                    </div>
                </div>
                {anime.trailer?.embed_url && (
                    <div style={styles.videoContainer}>
                        <h3>🎬 공식 트레일러</h3>
                        <iframe
                            title="trailer"
                            src={anime.trailer.embed_url}
                            width="100%"
                            height="450px"
                            style={{ border: "none", borderRadius: "12px" }}
                            allowFullScreen
                        />
                    </div>
                )}
            </div>
            <ReviewSection animeId={id} />
        </div>
    );
};

export default Detail;