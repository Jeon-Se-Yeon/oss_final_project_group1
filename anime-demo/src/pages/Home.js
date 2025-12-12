import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { GENRES, RATINGS } from "../constants";
import { styles } from "../styles";

const Home = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const query = searchParams.get("q") || "";
  const genre = searchParams.get("genre") || "";
  const rating = searchParams.get("rating") || "";
  const sort = searchParams.get("sort") || "";

  const [searchInput, setSearchInput] = useState(query);
  const [pageInput, setPageInput] = useState(page);

  useEffect(() => {
    setPageInput(page);
  }, [page]);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const fetchAnime = useCallback(
    async () => {
      setLoading(true);
      try {
        const baseUrl = "https://api.jikan.moe/v4";
        let url;

        if (query || genre || rating || sort) {
          url = `${baseUrl}/anime?q=${query}&page=${page}&limit=12&sfw=true`;
          if (genre) url += `&genres=${genre}`;
          if (rating) url += `&rating=${rating}`;

          if (sort === "title") {
            url += "&order_by=title&sort=asc";
          } else if (sort === "score") {
            url += "&order_by=score&sort=desc";
          }
        } else {
          url = `${baseUrl}/top/anime?page=${page}&limit=12`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setAnimeList(data.data || []);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Fetch Anime Error:", error);
      } finally {
        setLoading(false);
      }
    },
    [page, query, genre, rating, sort]
  );

  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]);

  const resetHome = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const updateParams = (newParams) => {
    const currentParams = Object.fromEntries(searchParams);
    setSearchParams({ ...currentParams, ...newParams });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({
      q: searchInput,
      page: 1,
      genre,
      rating,
      sort,
    });
  };

  const handleFilterChange = (key, value) => {
    updateParams({ [key]: value, page: 1 });
  };

  const handlePageChange = (newPage) => {
    updateParams({ page: newPage });
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
              value={genre}
              onChange={(e) => handleFilterChange("genre", e.target.value)}
            >
              <option value="">모든 장르</option>
              {GENRES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <select
              style={styles.select}
              value={rating}
              onChange={(e) => handleFilterChange("rating", e.target.value)}
            >
              <option value="">모든 연령</option>
              {RATINGS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.name}
                </option>
              ))}
            </select>

            <select
              style={styles.select}
              value={sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
            >
              <option value="">기본순 (인기)</option>
              <option value="title">제목순 (A-Z)</option>
              <option value="score">별점순 (높은순)</option>
            </select>
          </div>
        </form>
      </div>

      {loading ? (
        <div style={styles.centerText}>로딩 중...</div>
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
                  alt={anime.title}
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

export default Home;
