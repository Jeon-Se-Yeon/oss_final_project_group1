import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import ReviewSection from "../components/ReviewSection";
import { styles } from "../styles";

const TiltImage = ({ src, alt, style }) => {
    const [transform, setTransform] = useState("");
    const [transition, setTransition] = useState("transform 0.1s ease-out");

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.target.getBoundingClientRect();
        
        const x = (e.clientX - left) / width;
        const y = (e.clientY - top) / height;

        const rotateY = (x - 0.5) * 40;
        const rotateX = (0.5 - y) * 40;

        setTransition("none");
        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`);
    };

    const handleMouseLeave = () => {
        setTransition("transform 0.5s ease-out");
        setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
    };

    return (
        <img
            src={src}
            alt={alt}
            style={{
                ...style,
                transform: transform,
                transition: transition,
                willChange: "transform",
                cursor: "pointer"
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        />
    );
};

const Detail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [anime, setAnime] = useState(null);

    const isFavorite = user?.favorite?.includes(id);

    useEffect(() => {
        fetch(`https://api.jikan.moe/v4/anime/${id}`)
            .then((res) => res.json())
            .then((data) => setAnime(data.data));
    }, [id]);

    const handleToggleFavorite = async () => {
        if (!user) return alert("로그인이 필요합니다.");

        const currentFavorites = user.favorite || [];
        let newFavorites;

        if (isFavorite) {
            newFavorites = currentFavorites.filter((favId) => favId !== id);
        } else {
            newFavorites = [...currentFavorites, id];
        }

        const success = await updateUser({ favorite: newFavorites });
        if (success) {
            alert(isFavorite ? "찜 목록에서 삭제되었습니다." : "찜 목록에 추가되었습니다!");
        } else {
            alert("처리 중 오류가 발생했습니다.");
        }
    };

    if (!anime) return <div style={styles.centerText}>로딩 중... 🌀</div>;

    return (
        <div style={styles.container}>
            <Header />
            <button onClick={() => navigate(-1)} style={styles.backButton}>
                ← 뒤로 가기
            </button>
            <div style={styles.detailCard}>
                <div style={{ ...styles.detailHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                        <h1>{anime.title}</h1>
                        <p style={{ color: "#666" }}>{anime.title_japanese}</p>
                    </div>
                    <button 
                        onClick={handleToggleFavorite}
                        style={{
                            backgroundColor: "transparent",
                            border: "none",
                            fontSize: "2rem",
                            cursor: "pointer",
                            color: isFavorite ? "#ef4444" : "#ccc",
                            transition: "color 0.2s"
                        }}
                        title={isFavorite ? "찜 취소" : "찜하기"}
                    >
                        {isFavorite ? "❤️" : "🤍"}
                    </button>
                </div>
                <div style={styles.detailBody}>
                    <div style={styles.imageWrapper}>
                        <TiltImage
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