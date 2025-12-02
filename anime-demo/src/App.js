import React, { useState, useEffect, createContext, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

// 1. API 주소들
const USER_API_URL = "https://6909a7652d902d0651b4991f.mockapi.io/user_info";
const REVIEW_API_URL =
  "https://6909a7ab2d902d0651b49af9.mockapi.io/AnimeReview";

// ==========================================
// 2. AuthContext (기존과 동일)
// ==========================================
const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // (로그인 유지 등의 기능을 위해 로컬스토리지 사용 추천하지만, 현재 로직 유지)

  const login = async (inputUserid, inputPassword) => {
    try {
      const response = await fetch(USER_API_URL);
      const users = await response.json();
      const foundUser = users.find(
        (u) => u.userid === inputUserid && u.password === inputPassword
      );
      if (foundUser) {
        setUser(foundUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const signup = async (inputUserid, inputPassword) => {
    try {
      const response = await fetch(USER_API_URL);
      const users = await response.json();
      if (users.some((u) => u.userid === inputUserid)) {
        alert("이미 존재하는 아이디입니다.");
        return false;
      }
      const postResponse = await fetch(USER_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: inputUserid, password: inputPassword }),
      });
      return postResponse.ok;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  const logout = () => setUser(null);
  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
const useAuth = () => useContext(AuthContext);

// ==========================================
// 3. Header, Login, Signup (기존과 동일)
// ==========================================
const Header = ({ onReset }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <Link
          to="/"
          onClick={(e) => {
            if (onReset) {
              e.preventDefault();
              onReset();
            }
          }}
          style={{ textDecoration: "none", color: "#333" }}
        >
          <h1>🎬 Anime Finder</h1>
        </Link>
        <div style={styles.authSection}>
          {user ? (
            <>
              <span>
                <strong>{user.userid}</strong>님
              </span>
              <button onClick={logout} style={styles.logoutButton}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                style={styles.navButton}
              >
                로그인
              </button>
              <button
                onClick={() => navigate("/signup")}
                style={styles.navButtonOutline}
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

const LoginPage = () => {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (await login(userid, password)) navigate("/");
    else alert("로그인 실패");
  };
  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.authCard}>
        <h2 style={{ textAlign: "center" }}>로그인</h2>
        <form onSubmit={handleSubmit} style={styles.formCol}>
          <input
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            placeholder="아이디"
            style={styles.input}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            style={styles.input}
          />
          <button type="submit" style={styles.primaryButton}>
            로그인
          </button>
        </form>
        <div style={styles.linkText}>
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
};

const SignupPage = () => {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();
  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPw) return alert("비밀번호 불일치");
    if (await signup(userid, password)) {
      alert("가입 성공");
      navigate("/login");
    } else alert("가입 실패");
  };
  return (
    <div style={styles.container}>
      <Header />
      <div style={styles.authCard}>
        <h2 style={{ textAlign: "center" }}>회원가입</h2>
        <form onSubmit={handleSignup} style={styles.formCol}>
          <input
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            placeholder="아이디"
            style={styles.input}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            style={styles.input}
          />
          <input
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="비밀번호 확인"
            style={styles.input}
          />
          <button type="submit" style={styles.secondaryButton}>
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. [신규 기능] 리뷰 섹션 컴포넌트
// ==========================================
const ReviewSection = ({ animeId }) => {
  const { user } = useAuth(); // 로그인 정보 가져오기
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 입력 폼 상태
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [rating, setRating] = useState(10);

  // 1. 리뷰 목록 가져오기
  const fetchReviews = async () => {
    try {
      const res = await fetch(REVIEW_API_URL);
      const data = await res.json();
      // 해당 애니메이션(animeId)의 리뷰만 필터링 (String 변환 비교 안전하게)
      const filtered = data.filter(
        (r) => String(r.animeId) === String(animeId)
      );
      // 최신순 정렬 (time 내림차순)
      setReviews(filtered.sort((a, b) => b.time - a.time));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [animeId]);

  // 2. 리뷰 작성 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !contents) return alert("제목과 내용을 입력해주세요.");

    const newReview = {
      title: title,
      contents: contents,
      rating: Number(rating),
      userid: user.userid, // 현재 로그인한 유저 ID
      time: Math.floor(Date.now() / 1000), // 현재 시간을 Unix Timestamp(초)로 변환
      animeId: animeId, // [중요] 어떤 애니메이션에 대한 리뷰인지 저장
    };

    try {
      const res = await fetch(REVIEW_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });
      if (res.ok) {
        alert("리뷰가 등록되었습니다!");
        setTitle(""); // 폼 초기화
        setContents("");
        setRating(10);
        fetchReviews(); // 목록 새로고침
      } else {
        alert("등록 실패");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 날짜 변환 함수 (Unix Timestamp -> "2025-12-02")
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString("ko-KR");
  };

  return (
    <div style={styles.reviewContainer}>
      <h2
        style={{
          borderBottom: "2px solid #333",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        💬 유저 리뷰 ({reviews.length})
      </h2>

      {/* 작성 폼: 로그인한 유저에게만 보임 */}
      {user ? (
        <form onSubmit={handleSubmit} style={styles.reviewForm}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              style={{ ...styles.input, flex: 2 }}
              placeholder="리뷰 제목 (예: 인생 애니입니다!)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <select
              style={styles.select}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>
                  ⭐ {num}점
                </option>
              ))}
            </select>
          </div>
          <textarea
            style={styles.textarea}
            rows="3"
            placeholder="이 애니메이션에 대한 감상평을 남겨주세요..."
            value={contents}
            onChange={(e) => setContents(e.target.value)}
          />
          <button type="submit" style={styles.reviewButton}>
            리뷰 등록
          </button>
        </form>
      ) : (
        <div style={styles.loginMessage}>
          리뷰를 작성하려면{" "}
          <span style={{ fontWeight: "bold", color: "#6366f1" }}>로그인</span>이
          필요합니다.
        </div>
      )}

      {/* 리뷰 목록 표시 */}
      <div style={styles.reviewList}>
        {loading ? (
          <div>로딩 중...</div>
        ) : reviews.length === 0 ? (
          <div style={{ color: "#888", padding: "20px", textAlign: "center" }}>
            첫 번째 리뷰의 주인공이 되어보세요!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} style={styles.reviewItem}>
              <div style={styles.reviewHeader}>
                <span style={styles.reviewTitle}>{review.title}</span>
                <span style={styles.reviewRating}>⭐ {review.rating}</span>
              </div>
              <p style={styles.reviewContent}>{review.contents}</p>
              <div style={styles.reviewFooter}>
                <span>
                  작성자: <strong>{review.userid}</strong>
                </span>
                <span>{formatDate(review.time)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ==========================================
// 5. Detail 컴포넌트 (리뷰 섹션 추가됨!)
// ==========================================
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

      {/* 기존 애니메이션 상세 정보 */}
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
              <span style={styles.badge}>⭐ {anime.score}</span>
              <span style={styles.badge}>{anime.year}년</span>
              <span style={styles.badge}>{anime.status}</span>
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
              MyAnimeList 이동
            </a>
          </div>
        </div>
      </div>

      {/* [추가] 리뷰 영역 (현재 애니 ID를 전달) */}
      <ReviewSection animeId={id} />
    </div>
  );
};

// ==========================================
// 6. Home, App (유지)
// ==========================================
const Home = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [confirmedQuery, setConfirmedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setPageInput(page);
  }, [page]);

  const fetchAnime = async (query, pageNum) => {
    setLoading(true);
    try {
      const baseUrl = "https://api.jikan.moe/v4";
      const url = query
        ? `${baseUrl}/anime?q=${query}&limit=12&page=${pageNum}`
        : `${baseUrl}/top/anime?limit=12&page=${pageNum}`;
      const res = await fetch(url);
      const data = await res.json();
      setAnimeList(data.data || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAnime("", 1);
  }, []);
  const resetHome = () => {
    setSearchInput("");
    setConfirmedQuery("");
    setPage(1);
    fetchAnime("", 1);
  };
  const handleSearch = (e) => {
    e.preventDefault();
    setConfirmedQuery(searchInput);
    setPage(1);
    fetchAnime(searchInput, 1);
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchAnime(confirmedQuery, newPage);
    window.scrollTo(0, 0);
  };
  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const targetPage = parseInt(pageInput, 10);
    const lastPage = pagination?.last_visible_page || 1;
    if (isNaN(targetPage) || targetPage < 1 || targetPage > lastPage) {
      alert(`1~${lastPage} 사이 입력`);
      setPageInput(page);
      return;
    }
    handlePageChange(targetPage);
  };

  return (
    <div style={styles.container}>
      <Header onReset={resetHome} />
      <div style={styles.searchBox}>
        <form onSubmit={handleSearch} style={styles.formRow}>
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="애니 검색"
            style={styles.input}
          />
          <button type="submit" style={styles.primaryButton}>
            검색
          </button>
        </form>
      </div>
      {loading ? (
        <div style={styles.centerText}>로딩 중... 🌀</div>
      ) : (
        <div style={styles.grid}>
          {animeList.map((anime) => (
            <Link
              to={`/detail/${anime.mal_id}`}
              key={anime.mal_id}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div style={styles.card}>
                <img
                  src={anime.images.jpg.image_url}
                  alt=""
                  style={styles.image}
                />
                <div style={styles.content}>
                  <h4>{anime.title}</h4>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!loading && pagination && (
        <div style={styles.pagination}>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            style={styles.pageButton}
          >
            &lt;
          </button>
          <form onSubmit={handlePageInputSubmit} style={styles.pageForm}>
            <input
              type="number"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              style={styles.pageInput}
            />
            <span style={styles.pageInfo}>
              {" "}
              / {pagination.last_visible_page}
            </span>
            <button type="submit" style={styles.goButton}>
              Go
            </button>
          </form>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!pagination.has_next_page}
            style={styles.pageButton}
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/detail/:id" element={<Detail />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

// ==========================================
// 7. 스타일 (Review 관련 스타일 추가)
// ==========================================
const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "sans-serif",
  },
  header: {
    marginBottom: "30px",
    borderBottom: "1px solid #eee",
    paddingBottom: "20px",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authCard: {
    maxWidth: "400px",
    margin: "80px auto",
    padding: "40px",
    border: "1px solid #eee",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  formCol: { display: "flex", flexDirection: "column", gap: "15px" },
  formRow: {
    display: "flex",
    gap: "10px",
    width: "100%",
    justifyContent: "center",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    flex: 1,
  },
  primaryButton: {
    padding: "12px 20px",
    backgroundColor: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  secondaryButton: {
    padding: "12px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  navButton: {
    padding: "8px 16px",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  navButtonOutline: {
    padding: "8px 16px",
    backgroundColor: "white",
    color: "#333",
    border: "1px solid #333",
    borderRadius: "4px",
    cursor: "pointer",
  },
  logoutButton: {
    padding: "8px 16px",
    backgroundColor: "#e5e7eb",
    color: "#333",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  backButton: {
    marginBottom: "20px",
    padding: "8px 16px",
    backgroundColor: "#f0f0f0",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  linkText: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "14px",
    color: "#666",
  },
  authSection: { display: "flex", alignItems: "center", gap: "10px" },
  searchBox: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
  },
  card: {
    border: "1px solid #eee",
    borderRadius: "12px",
    overflow: "hidden",
    height: "100%",
    cursor: "pointer",
  },
  image: { width: "100%", height: "280px", objectFit: "cover" },
  content: { padding: "12px" },
  centerText: {
    textAlign: "center",
    marginTop: "50px",
    fontSize: "1.2rem",
    color: "#666",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginTop: "40px",
    paddingBottom: "20px",
  },
  pageButton: {
    padding: "8px 16px",
    fontSize: "14px",
    backgroundColor: "#f3f4f6",
    border: "1px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
  },
  pageForm: { display: "flex", alignItems: "center", gap: "8px" },
  pageInput: {
    width: "50px",
    padding: "8px",
    textAlign: "center",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  pageInfo: { fontSize: "16px", fontWeight: "bold", color: "#333" },
  goButton: {
    padding: "8px 12px",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },

  // Detail 관련
  detailCard: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    marginBottom: "40px",
  },
  detailHeader: {
    borderBottom: "1px solid #eee",
    paddingBottom: "20px",
    marginBottom: "30px",
  },
  detailBody: { display: "flex", gap: "40px", flexWrap: "wrap" },
  imageWrapper: { flexShrink: 0 },
  detailImage: {
    width: "320px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  },
  detailInfo: { flex: 1, minWidth: "300px" },
  tagContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "25px",
  },
  badge: {
    backgroundColor: "#f3f4f6",
    padding: "8px 14px",
    borderRadius: "20px",
    fontSize: "14px",
    color: "#374151",
    fontWeight: "600",
  },
  synopsis: {
    lineHeight: "1.8",
    color: "#4b5563",
    backgroundColor: "#f9fafb",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "25px",
  },
  linkButton: {
    display: "inline-block",
    backgroundColor: "#2e51a2",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
  },

  // [NEW] Review 관련 스타일
  reviewContainer: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    marginTop: "20px",
  },
  reviewForm: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "30px",
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    marginTop: "10px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  reviewButton: {
    marginTop: "10px",
    padding: "10px 20px",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  loginMessage: {
    textAlign: "center",
    padding: "30px",
    backgroundColor: "#f3f4f6",
    borderRadius: "12px",
    marginBottom: "30px",
  },
  reviewList: { display: "flex", flexDirection: "column", gap: "15px" },
  reviewItem: { borderBottom: "1px solid #eee", paddingBottom: "15px" },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  reviewTitle: { fontWeight: "bold", fontSize: "16px" },
  reviewRating: { color: "#f59e0b", fontWeight: "bold" },
  reviewContent: { color: "#444", lineHeight: "1.5", marginBottom: "8px" },
  reviewFooter: {
    fontSize: "12px",
    color: "#888",
    display: "flex",
    justifyContent: "space-between",
  },
};

export default App;
