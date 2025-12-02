import React, { useState, useEffect } from "react";
// react-router-dom 필수 모듈 import
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

// ==========================================
// 1. 상세 페이지 (Detail Page) - Route로 이동할 곳
// ==========================================
const Detail = () => {
  const { id } = useParams(); // URL에서 :id 파라미터를 가져옴
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  // ID가 바뀔 때마다 해당 애니메이션 상세 정보 가져오기
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        const data = await response.json();
        setAnime(data.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) return <div style={styles.centerText}>로딩 중... 🌀</div>;
  if (!anime)
    return <div style={styles.centerText}>정보를 찾을 수 없습니다. 😢</div>;

  return (
    <div style={styles.container}>
      {/* 뒤로 가기 버튼 */}
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← 뒤로 가기
      </button>

      <div style={styles.detailCard}>
        <div style={styles.detailHeader}>
          <h1>{anime.title}</h1>
          <p style={{ color: "#666" }}>{anime.title_japanese}</p>
        </div>

        <div style={styles.detailBody}>
          <img
            src={anime.images.jpg.large_image_url}
            alt={anime.title}
            style={styles.detailImage}
          />

          <div style={styles.detailInfo}>
            <div style={styles.tagContainer}>
              <span style={styles.badge}>평점 ⭐ {anime.score}</span>
              <span style={styles.badge}>{anime.year}년</span>
              <span style={styles.badge}>{anime.status}</span>
            </div>

            <p>
              <strong>장르:</strong>{" "}
              {anime.genres.map((g) => g.name).join(", ")}
            </p>
            <p>
              <strong>줄거리:</strong>
            </p>
            <p style={styles.synopsis}>{anime.synopsis}</p>

            <a
              href={anime.url}
              target="_blank"
              rel="noreferrer"
              style={styles.linkButton}
            >
              공식 페이지 이동
            </a>
          </div>
        </div>

        {/* 트레일러 영상이 있다면 표시 */}
        {anime.trailer?.embed_url && (
          <div style={styles.videoContainer}>
            <h3>🎬 트레일러</h3>
            <iframe
              title="trailer"
              src={anime.trailer.embed_url}
              width="100%"
              height="400px"
              frameBorder="0"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. 메인/검색 페이지 (Home Page)
// ==========================================
const Home = () => {
  const [animeList, setAnimeList] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAnime = async (query = "") => {
    setLoading(true);
    try {
      const baseUrl = "https://api.jikan.moe/v4";
      const url = query
        ? `${baseUrl}/anime?q=${query}&sfw=true&limit=12`
        : `${baseUrl}/top/anime?filter=bypopularity&limit=12`;

      const response = await fetch(url);
      const data = await response.json();
      setAnimeList(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnime();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAnime(search);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>🎬 Anime Finder</h1>
      </header>

      <div style={styles.searchBox}>
        <form onSubmit={handleSearch} style={styles.form}>
          <input
            type="text"
            placeholder="애니메이션 제목 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.searchButton}>
            검색
          </button>
        </form>
      </div>

      {loading ? (
        <div style={styles.centerText}>로딩 중... 🌀</div>
      ) : (
        <div style={styles.grid}>
          {animeList.map((anime) => (
            // Link 컴포넌트를 사용해 클릭 시 /detail/ID 로 이동
            <Link
              to={`/detail/${anime.mal_id}`}
              key={anime.mal_id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={styles.card}>
                <div style={styles.imageContainer}>
                  <img
                    src={anime.images.jpg.image_url}
                    alt={anime.title}
                    style={styles.image}
                  />
                  <div style={styles.scoreBadge}>⭐ {anime.score || "N/A"}</div>
                </div>
                <div style={styles.content}>
                  <h3 style={styles.title}>{anime.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. 라우터 설정 (App)
// ==========================================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={<Home />} />
        {/* 상세 페이지 (:id 부분이 동적으로 변함) */}
        <Route path="/detail/:id" element={<Detail />} />
      </Routes>
    </BrowserRouter>
  );
}

// ==========================================
// 4. 스타일
// ==========================================
const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "sans-serif",
  },
  header: { textAlign: "center", marginBottom: "30px", color: "#333" },
  centerText: {
    textAlign: "center",
    fontSize: "1.2rem",
    marginTop: "50px",
    color: "#666",
  },

  // 검색창 관련
  searchBox: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
  },
  form: { display: "flex", gap: "10px", width: "100%", maxWidth: "500px" },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  searchButton: {
    padding: "12px 24px",
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  backButton: {
    marginBottom: "20px",
    padding: "8px 16px",
    backgroundColor: "#f0f0f0",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },

  // 그리드 & 카드
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
  },
  card: {
    border: "1px solid #eee",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "transform 0.2s",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    height: "100%",
    cursor: "pointer",
    backgroundColor: "white",
  },
  imageContainer: { height: "280px", overflow: "hidden", position: "relative" },
  image: { width: "100%", height: "100%", objectFit: "cover" },
  scoreBadge: {
    position: "absolute",
    top: "10px",
    right: "10px",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
  },
  content: { padding: "12px" },
  title: {
    fontSize: "16px",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  // 상세 페이지 전용 스타일
  detailCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  detailHeader: {
    borderBottom: "1px solid #eee",
    paddingBottom: "20px",
    marginBottom: "20px",
  },
  detailBody: { display: "flex", gap: "30px", flexWrap: "wrap" },
  detailImage: {
    width: "300px",
    borderRadius: "8px",
    objectFit: "cover",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  },
  detailInfo: { flex: 1, minWidth: "300px" },
  tagContainer: { display: "flex", gap: "10px", marginBottom: "20px" },
  badge: {
    backgroundColor: "#f3f4f6",
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "14px",
    color: "#4b5563",
    fontWeight: "bold",
  },
  synopsis: {
    lineHeight: "1.6",
    color: "#444",
    backgroundColor: "#f9fafb",
    padding: "15px",
    borderRadius: "8px",
  },
  linkButton: {
    display: "inline-block",
    marginTop: "20px",
    backgroundColor: "#ff8c00",
    color: "white",
    padding: "10px 20px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "bold",
  },
  videoContainer: { marginTop: "40px" },
};

export default App;
