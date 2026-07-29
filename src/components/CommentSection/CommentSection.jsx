import { useEffect, useState } from "react";
import { supabase } from "../../client";
import styles from "./CommentSection.module.css";

function CommentSection({ postId }) {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    username: session.user.user_metadata?.username || "Anonymous",
                });
            }
        });
    }, []);

    useEffect(() => {
        async function fetchComments() {
            setLoading(true);

            const { data, error } = await supabase
                .from("comments")
                .select("*")
                .eq("post_id", postId)
                .order("created_at", { ascending: false });

            if (error) {
                setError(error.message);
            } else {
                setComments(data);
            }

            setLoading(false);
        }

        fetchComments();
    }, [postId]);


    async function submitComment(e) {
        e.preventDefault();

        if (!user) {
            setError("You must be logged in to comment.");
            return;
        }

        if (!comment.trim()) return;

        const { data, error } = await supabase
            .from("comments")
            .insert({
                post_id: postId,
                user_id: user.id,
                author: user.username,
                content: comment.trim(),
            })
            .select()
            .single();

        if (error) {
            setError(error.message);
            return;
        }

        setComments((prev) => [data, ...prev]);
        setComment("");
        setError("");
    }

    return (
        <div className={styles.container}>
            <h2 className={styles.heading}>Comments</h2>

            <form onSubmit={submitComment} className={styles.form}>
                <textarea
                    className={styles.textarea}
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <button className={styles.button} type="submit">
                    Post Comment
                </button>
            </form>

            {error && <p className={styles.error}>{error}</p>}

            {loading ? (
                <p>Loading comments...</p>
            ) : comments.length === 0 ? (
                <p>No comments yet.</p>
            ) : (
                comments.map((comment) => {
                    const date = new Date(comment.created_at);

                    return (
                        <div key={comment.id} className={styles.comment}>
                            <div className={styles.meta}>
                                <span className={styles.author}>[{comment.author}]</span>

                                <span className={styles.date}>
                                    {date.toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "2-digit",
                                        year: "numeric",
                                    })}
                                </span>
                            </div>

                            <p className={styles.content}>{comment.content}</p>
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default CommentSection;
