import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

// 1. API 주소 및 상수 정의
const USER_API_URL = "https://6909a7652d902d0651b4991f.mockapi.io/user_info";
const REVIEW_API_URL =
  "https://6909a7ab2d902d0651b49af9.mockapi.io/AnimeReview";

const GENRES = [
  { id: 1, name: "액션 (Action)" },
  { id: 2, name: "모험 (Adventure)" },
  { id: 4, name: "코미디 (Comedy)" },
  { id: 8, name: "드라마 (Drama)" },
  { id: 10, name: "판타지 (Fantasy)" },
  { id: 22, name: "로맨스 (Romance)" },
  { id: 24, name: "SF (Sci-Fi)" },
  { id: 36, name: "일상 (Slice of Life)" },
  { id: 30, name: "스포츠 (Sports)" },
  { id: 14, name: "공포 (Horror)" },
];

const RATINGS = [
  { value: "g", name: "전체 관람가 (G)" },
  { value: "pg", name: "아동 (PG)" },
  { value: "pg13", name: "13세 이상 (PG-13)" },
  { value: "r17", name: "17세 이상 (R-17)" },
  { value: "r", name: "성인 (R+)" },
];

// ==========================================
// 2. AuthContext (유지)
// ==========================================
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const login = async (inputUserid, inputPassword) => {
    try {
      const response = await fetch(USER_API_URL);
      const users = await response.json();
      const foundUser = users.find(
        (u) => u.userid === inputUserid && u.password === inputPassword
      );
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem("user", JSON.stringify(foundUser));
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
const useAuth = () => useContext(AuthContext);

// ==========================================
// 3. Header (유지)
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

// ==========================================
// 4. 로그인 / 회원가입 (유지)
// ==========================================
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
// 5. ReviewSection (유지 - useCallback 적용)
// ==========================================
const ReviewSection = ({ animeId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [rating, setRating] = useState(10);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(REVIEW_API_URL);
      const data = await res.json();
      const filtered = data.filter(
        (r) => String(r.animeId) === String(animeId)
      );
      setReviews(filtered.sort((a, b) => b.time - a.time));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [animeId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !contents) return alert("제목과 내용을 입력해주세요.");
    const newReview = {
      title,
      contents,
      rating: Number(rating),
      userid: user.userid,
      time: Math.floor(Date.now() / 1000),
      animeId: animeId,
    };
    try {
      const res = await fetch(REVIEW_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });
      if (res.ok) {
        alert("리뷰 등록 완료!");
        setTitle("");
        setContents("");
        setRating(10);
        fetchReviews();
      } else alert("등록 실패");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`${REVIEW_API_URL}/${reviewId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("리뷰가 삭제되었습니다.");
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      } else alert("삭제 실패");
    } catch (error) {
      console.error("Delete Error:", error);
    }
  };
  const formatDate = (timestamp) =>
    new Date(timestamp * 1000).toLocaleDateString("ko-KR");

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
      {user ? (
        <form onSubmit={handleSubmit} style={styles.reviewForm}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              style={{ ...styles.input, flex: 2 }}
              placeholder="리뷰 제목"
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
            placeholder="감상평을 남겨주세요..."
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
      <div style={styles.reviewList}>
        {loading ? (
          <div>로딩 중...</div>
        ) : reviews.length === 0 ? (
          <div style={{ color: "#888", textAlign: "center" }}>
            첫 리뷰를 남겨주세요!
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} style={styles.reviewItem}>
              <div style={styles.reviewHeader}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={styles.reviewTitle}>{review.title}</span>
                  <span style={styles.reviewRating}>⭐ {review.rating}</span>
                </div>
                {user && user.userid === review.userid && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    style={styles.deleteButton}
                  >
                    삭제
                  </button>
                )}
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
// 6. Detail 컴포넌트 (유지)
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

// ==========================================
// 7. Home 컴포넌트 (정렬 기능 추가 + useCallback)
// ==========================================
const Home = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [confirmedQuery, setConfirmedQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedRating, setSelectedRating] = useState("");

  // [신규] 정렬 상태
  const [sortOption, setSortOption] = useState(""); // ""(기본), "title"(알파벳), "score"(별점)

  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setPageInput(page);
  }, [page]);

  // API 호출 함수 (정렬 파라미터 추가 & useCallback 적용)
  const fetchAnime = useCallback(
    async (query, pageNum, genreId, ratingId, sortType) => {
      setLoading(true);
      try {
        const baseUrl = "https://api.jikan.moe/v4";
        let url;

        // 검색어, 필터, 정렬 중 하나라도 있으면 /anime 엔드포인트 사용
        if (query || genreId || ratingId || sortType) {
          url = `${baseUrl}/anime?q=${query}&page=${pageNum}&limit=12&sfw=true`;
          if (genreId) url += `&genres=${genreId}`;
          if (ratingId) url += `&rating=${ratingId}`;

          // [신규] 정렬 로직 적용
          if (sortType === "title") {
            url += "&order_by=title&sort=asc"; // 알파벳순 (오름차순)
          } else if (sortType === "score") {
            url += "&order_by=score&sort=desc"; // 별점순 (내림차순)
          }
        } else {
          // 아무 조건 없으면 인기순(기본)
          url = `${baseUrl}/top/anime?page=${pageNum}&limit=12`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setAnimeList(data.data || []);
        setPagination(data.pagination);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 초기 로드
  useEffect(() => {
    fetchAnime("", 1, "", "", "");
  }, [fetchAnime]);

  const resetHome = () => {
    setSearchInput("");
    setConfirmedQuery("");
    setSelectedGenre("");
    setSelectedRating("");
    setSortOption(""); // 정렬도 초기화
    setPage(1);
    fetchAnime("", 1, "", "", "");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setConfirmedQuery(searchInput);
    setPage(1);
    // 현재 선택된 필터/정렬 값으로 검색
    fetchAnime(searchInput, 1, selectedGenre, selectedRating, sortOption);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchAnime(
      confirmedQuery,
      newPage,
      selectedGenre,
      selectedRating,
      sortOption
    );
    window.scrollTo(0, 0);
  };

  // 정렬 옵션 변경 시 바로 재검색 실행
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortOption(newSort);
    setPage(1);
    fetchAnime(confirmedQuery, 1, selectedGenre, selectedRating, newSort);
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

  const getPageNumbers = () => {
    if (!pagination) return [];
    const lastPage = pagination.last_visible_page;
    const currentGroup = Math.ceil(page / 10);
    const startPage = (currentGroup - 1) * 10 + 1;
    const endPage = Math.min(startPage + 9, lastPage);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  return (
    <div style={styles.container}>
      <Header onReset={resetHome} />

      <div style={styles.searchBox}>
        <form onSubmit={handleSearch} style={styles.formColumn}>
          <div style={styles.formRow}>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="애니메이션 제목 검색"
              style={styles.input}
            />
            <button type="submit" style={styles.primaryButton}>
              검색
            </button>
          </div>

          <div style={styles.filterRow}>
            <select
              style={styles.select}
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">🎭 모든 장르</option>
              {GENRES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <select
              style={styles.select}
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
            >
              <option value="">🔞 모든 연령</option>
              {RATINGS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.name}
                </option>
              ))}
            </select>

            {/* [신규] 정렬 선택 Select Box */}
            <select
              style={styles.select}
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="">🏆 기본순 (인기)</option>
              <option value="title">🅰️ 제목순 (A-Z)</option>
              <option value="score">⭐ 별점순 (높은순)</option>
            </select>
          </div>
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
      {!loading && animeList.length === 0 && (
        <div style={styles.centerText}>검색 결과가 없습니다.</div>
      )}

      {!loading && pagination && (
        <div style={styles.paginationWrapper}>
          <div style={styles.paginationBtnRow}>
            <button
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              style={styles.squareBtn}
            >
              &lt;&lt;
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              style={styles.squareBtn}
            >
              &lt;
            </button>
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                style={
                  pageNum === page ? styles.activeSquareBtn : styles.squareBtn
                }
              >
                {pageNum.toString().padStart(2, "0")}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={!pagination.has_next_page}
              style={styles.squareBtn}
            >
              &gt;
            </button>
            <button
              onClick={() => handlePageChange(pagination.last_visible_page)}
              disabled={page === pagination.last_visible_page}
              style={styles.squareBtn}
            >
              &gt;&gt;
            </button>
          </div>
          <form onSubmit={handlePageInputSubmit} style={styles.pageFormInput}>
            <span style={styles.pageInfo}>Page</span>
            <input
              type="number"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              style={styles.pageInput}
            />
            <span style={styles.pageInfo}>
              / {pagination.last_visible_page}
            </span>
            <button type="submit" style={styles.goButton}>
              이동
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 8. App 라우터
// ==========================================
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
// 9. 스타일 (유지)
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
  searchBox: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
  },
  formColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
    maxWidth: "600px",
  },
  formRow: { display: "flex", gap: "10px", width: "100%" },
  filterRow: { display: "flex", gap: "10px", width: "100%" },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    flex: 1,
  },
  select: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    flex: 1,
    backgroundColor: "white",
    cursor: "pointer",
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
  paginationWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
    marginTop: "40px",
    paddingBottom: "20px",
  },
  paginationBtnRow: {
    display: "flex",
    gap: "5px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  squareBtn: {
    minWidth: "32px",
    height: "32px",
    padding: "0 6px",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
    color: "#333",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  activeSquareBtn: {
    minWidth: "32px",
    height: "32px",
    padding: "0 6px",
    backgroundColor: "white",
    border: "1px solid #f97316",
    borderRadius: "4px",
    color: "#f97316",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pageFormInput: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#f9f9f9",
    padding: "8px 16px",
    borderRadius: "20px",
  },
  pageInput: {
    width: "50px",
    padding: "6px",
    textAlign: "center",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  pageInfo: { fontSize: "14px", color: "#555" },
  goButton: {
    padding: "6px 12px",
    backgroundColor: "#333",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
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
    border: "1px solid #e5e7eb",
  },
  synopsis: {
    lineHeight: "1.8",
    color: "#4b5563",
    backgroundColor: "#f9fafb",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "25px",
    fontSize: "15px",
  },
  linkButton: {
    display: "inline-block",
    backgroundColor: "#2e51a2",
    color: "white",
    padding: "12px 24px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    transition: "background 0.2s",
  },
  videoContainer: { marginTop: "50px" },
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
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
  },
};

export default App;
