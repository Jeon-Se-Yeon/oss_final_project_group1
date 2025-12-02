import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { REVIEW_API_URL } from "../constants";
import { styles } from "../styles";

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
            // animeId가 문자열일 수도 있어 String()으로 변환하여 비교
            const filtered = data.filter(
                (r) => String(r.animeId) === String(animeId)
            );
            setReviews(filtered.sort((a, b) => b.time - a.time));
        } catch (err) {
            console.error("리뷰 로드 오류:", err);
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
        
        // 리뷰 작성 시 중복 체크
        if (reviews.some(r => r.userid === user.userid)) {
            return alert("이미 이 애니메이션에 대한 리뷰를 작성하셨습니다.");
        }

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
                fetchReviews(); // 등록 후 목록 갱신
            } else alert("등록 실패");
        } catch (err) {
            console.error("리뷰 등록 오류:", err);
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

export default ReviewSection;