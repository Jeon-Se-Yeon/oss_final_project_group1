import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { GENRES, RATINGS } from "../constants";
import { styles } from "../styles";

const Home = () => {
    const [animeList, setAnimeList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [searchInput, setSearchInput] = useState("");
    const [confirmedQuery, setConfirmedQuery] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("");
    const [selectedRating, setSelectedRating] = useState("");

    const [sortOption, setSortOption] = useState(""); 

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

                    // 정렬 로직 적용
                    if (sortType === "title") {
                        url += "&order_by=title&sort=asc"; 
                    } else if (sortType === "score") {
                        url += "&order_by=score&sort=desc"; 
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
                console.error("Fetch Anime Error:", error);
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
        setSortOption(""); 
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

    // 필터 변경 시 바로 재검색 실행
    const handleFilterChange = (setter, newValue) => {
        setter(newValue);
        setPage(1);
        // 새로운 필터/정렬 값으로 API 호출
        const newGenre = setter === setSelectedGenre ? newValue : selectedGenre;
        const newRating = setter === setSelectedRating ? newValue : selectedRating;
        const newSort = setter === setSortOption ? newValue : sortOption;
        
        fetchAnime(confirmedQuery, 1, newGenre, newRating, newSort);
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
                            onChange={(e) => handleFilterChange(setSelectedGenre, e.target.value)}
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
                            onChange={(e) => handleFilterChange(setSelectedRating, e.target.value)}
                        >
                            <option value="">🔞 모든 연령</option>
                            {RATINGS.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.name}
                                </option>
                            ))}
                        </select>

                        {/* 정렬 선택 Select Box */}
                        <select
                            style={styles.select}
                            value={sortOption}
                            onChange={(e) => handleFilterChange(setSortOption, e.target.value)}
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