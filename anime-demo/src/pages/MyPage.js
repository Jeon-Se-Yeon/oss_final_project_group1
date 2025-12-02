import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import { REVIEW_API_URL } from "../constants";
import { styles } from "../styles";

const MyPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [myReviews, setMyReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // 로그인 상태 확인 및 리다이렉트
    useEffect(() => {
        if (!user) {
            alert("로그인이 필요합니다.");
            navigate("/login");
        }
    }, [user, navigate]);

    // 유저 리뷰 목록 불러오기
    const fetchMyReviews = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch(REVIEW_API_URL);
            const data = await res.json();
            const filteredReviews = data
                .filter((r) => r.userid === user.userid)
                .sort((a, b) => b.time - a.time); // 최신순 정렬

            // 각 리뷰에 대해 애니메이션 정보를 추가로 가져옵니다.
            const reviewsWithAnimeData = await Promise.all(
                filteredReviews.map(async (review) => {
                    // API 호출 최소화를 위해 로컬스토리지 등을 활용할 수 있지만, 여기선 간단히 직접 호출
                    const animeRes = await fetch(`https://api.jikan.moe/v4/anime/${review.animeId}?fields=title`);
                    const animeData = await animeRes.json();
                    return {
                        ...review,
                        animeTitle: animeData.data?.title || "알 수 없는 애니메이션",
                    };
                })
            );

            setMyReviews(reviewsWithAnimeData);
        } catch (error) {
            console.error("마이 리뷰 로드 오류:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchMyReviews();
    }, [fetchMyReviews]);

    const handleDelete = async (reviewId) => {
        if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(`${REVIEW_API_URL}/${reviewId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                alert("리뷰가 삭제되었습니다.");
                // 로컬 상태 업데이트
                setMyReviews((prev) => prev.filter((r) => r.id !== reviewId));
            } else alert("삭제 실패");
        } catch (error) {
            console.error("Delete Error:", error);
        }
    };

    const formatDate = (timestamp) =>
        new Date(timestamp * 1000).toLocaleDateString("ko-KR");

    if (!user) return null; 
    
    return (
        <div style={styles.container}>
            <Header />
            <div style={styles.myPageSection}>
                <h2 style={{ borderBottom: "2px solid #6366f1", paddingBottom: "10px", marginBottom: "20px" }}>
                    👤 마이페이지
                </h2>
                <p>환영합니다, <strong>{user.userid}</strong>님!</p>
                <button onClick={logout} style={{ ...styles.logoutButton, marginTop: "10px" }}>
                    로그아웃
                </button>
            </div>

            <div style={styles.reviewContainer}>
                <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px", marginBottom: "20px" }}>
                    📝 내가 작성한 리뷰 ({myReviews.length})
                </h3>
                {loading ? (
                    <div style={styles.centerText}>리뷰 목록 로딩 중...</div>
                ) : myReviews.length === 0 ? (
                    <div style={{ color: "#888", textAlign: "center" }}>
                        작성한 리뷰가 없습니다.
                    </div>
                ) : (
                    <div style={styles.reviewList}>
                        {myReviews.map((review) => (
                            <div key={review.id} style={styles.myReviewItem}>
                                <div style={styles.myReviewHeader}>
                                    <Link 
                                        to={`/detail/${review.animeId}`} 
                                        style={styles.reviewTitleLink}
                                    >
                                        {review.animeTitle} - {review.title}
                                    </Link>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <span style={styles.reviewRating}>⭐ {review.rating}</span>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            style={styles.deleteButton}
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                                <p style={styles.myReviewBody}>{review.contents}</p>
                                <div style={styles.myReviewFooter}>
                                    작성일: {formatDate(review.time)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPage;