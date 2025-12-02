import React, { useState, useEffect } from "react";

// ==========================================
// 1. 자식 컴포넌트 분리 (Card, Modal)
// ==========================================

// 애니메이션 카드 컴포넌트
const AnimeCard = ({ anime, onClick }) => (
  <div style={styles.card} onClick={() => onClick(anime)}>
    <div style={styles.imageContainer}>
      <img
        src={anime.images.jpg.large_image_url}
        alt={anime.title}
        style={styles.image}
      />
      <div style={styles.scoreBadge}>⭐ {anime.score || "N/A"}</div>
    </div>
    <div style={styles.content}>
      <h3 style={styles.title}>{anime.title}</h3>
      <p style={styles.info}>
        {anime.year ? `${anime.year}년` : "방영일 미정"} • {anime.type}
      </p>
    </div>
  </div>
);

// 상세 정보 모달 컴포넌트
const AnimeModal = ({ anime, onClose }) => {
  if (!anime) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <div style={styles.modalHeader}>
          <h2 style={{ marginRight: "30px" }}>{anime.title}</h2>
          <span style={{ color: "#666", fontSize: "0.9rem" }}>
            {anime.title_japanese}
          </span>
        </div>
        <div style={styles.modalBody}>
          <img
            src={anime.images.jpg.image_url}
            alt={anime.title}
            style={styles.modalImage}
          />
          <div style={styles.modalText}>
            <p>
              <strong>장르:</strong>{" "}
              {anime.genres.map((g) => g.name).join(", ")}
            </p>
            <p>
              <strong>등급:</strong> {anime.rating}
            </p>
            <p>
              <strong>줄거리:</strong>
            </p>
            <p style={styles.synopsis}>
              {anime.synopsis || "줄거리 정보가 없습니다."}
            </p>
            <a
              href={anime.url}
              target="_blank"
              rel="noreferrer"
              style={styles.linkButton}
            >
              MyAnimeList에서 더 보기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. 메인 App 컴포넌트
// ==========================================

function App() {
  const [animeList, setAnimeList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // 에러 상태 추가
  const [selectedAnime, setSelectedAnime] = useState(null); // 모달용 선택된 애니

  // 데이터 가져오기 (query가 없으면 Top Anime)
  const fetchAnime = async (query = "") => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = "https://api.jikan.moe/v4";
      // 쿼리 유무에 따라 엔드포인트 결정
      const url = query
        ? `${baseUrl}/anime?q=${query}&sfw=true&limit=12`
        : `${baseUrl}/top/anime?filter=bypopularity&limit=12`;

      const response = await fetch(url);

      // 429 (Too Many Requests) 등 에러 처리
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const data = await response.json();
      setAnimeList(data.data || []);
    } catch (err) {
      console.error(err);
      setError("데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchAnime();
  }, []);

  // 검색 핸들러
  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return; // 공백 검색 방지
    fetchAnime(search);
  };

  // 홈(초기화) 핸들러
  const handleReset = () => {
    setSearch("");
    fetchAnime();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{ cursor: "pointer" }} onClick={handleReset}>
          🎬 Anime Finder
        </h1>
        <p>Jikan API를 활용한 애니메이션 검색 서비스</p>
      </header>

      {/* 검색 영역 */}
      <div style={styles.searchBox}>
        <form onSubmit={handleSearch} style={styles.form}>
          <input
            type="text"
            placeholder="찾고 싶은 애니메이션 제목..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.searchButton} disabled={loading}>
            검색
          </button>
        </form>
        {/* 검색 중일 때만 보이는 초기화 버튼 */}
        {search && (
          <button onClick={handleReset} style={styles.resetButton}>
            전체 목록 보기
          </button>
        )}
      </div>

      {/* 상태 메시지 영역 (로딩, 에러, 결과 없음) */}
      <div style={styles.statusMessage}>
        {loading && <div style={styles.loader}>로딩 중입니다... 🌀</div>}
        {error && <div style={{ color: "red" }}>{error}</div>}
        {!loading && !error && animeList.length === 0 && (
          <div>검색 결과가 없습니다. 😢</div>
        )}
      </div>

      {/* 그리드 영역 */}
      {!loading && (
        <div style={styles.grid}>
          {animeList.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              anime={anime}
              onClick={setSelectedAnime} // 클릭 시 모달 열기
            />
          ))}
        </div>
      )}

      {/* 상세 정보 모달 */}
      {selectedAnime && (
        <AnimeModal
          anime={selectedAnime}
          onClose={() => setSelectedAnime(null)}
        />
      )}
    </div>
  );
}

// ==========================================
// 3. 스타일 객체 (개선됨)
// ==========================================
const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  searchBox: {
    marginBottom: "30px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },
  form: {
    display: "flex",
    gap: "10px",
    width: "100%",
    maxWidth: "500px",
  },
  input: {
    flex: 1,
    padding: "14px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "2px solid #ddd",
    outline: "none",
    transition: "border-color 0.2s",
  },
  searchButton: {
    padding: "14px 28px",
    fontSize: "16px",
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background 0.2s",
  },
  resetButton: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    color: "#666",
    border: "1px solid #ccc",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "14px",
  },
  statusMessage: {
    textAlign: "center",
    minHeight: "30px",
    marginBottom: "20px",
    fontSize: "1.1rem",
    fontWeight: "500",
  },
  loader: {
    color: "#6366f1",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "25px",
  },
  // Card Styles
  card: {
    backgroundColor: "white",
    border: "1px solid #eee",
    borderRadius: "12px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    position: "relative",
  },
  imageContainer: {
    height: "300px",
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s",
  },
  scoreBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  content: {
    padding: "15px",
  },
  title: {
    fontSize: "16px",
    margin: "0 0 8px 0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  info: {
    fontSize: "13px",
    color: "#888",
    margin: 0,
  },
  // Modal Styles
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "700px",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    padding: "30px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  closeButton: {
    position: "absolute",
    top: "15px",
    right: "20px",
    border: "none",
    background: "none",
    fontSize: "30px",
    cursor: "pointer",
    color: "#999",
  },
  modalHeader: {
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  modalBody: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  modalImage: {
    width: "200px",
    borderRadius: "8px",
    objectFit: "cover",
  },
  modalText: {
    flex: 1,
    minWidth: "250px",
    lineHeight: "1.6",
  },
  synopsis: {
    maxHeight: "150px",
    overflowY: "auto",
    backgroundColor: "#f9f9f9",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#555",
    marginBottom: "20px",
  },
  linkButton: {
    display: "inline-block",
    backgroundColor: "#ff8c00", // MyAnimeList signature color
    color: "white",
    padding: "10px 20px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "14px",
  },
};

export default App;
