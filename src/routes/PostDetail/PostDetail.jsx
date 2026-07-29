import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { supabase } from "../../client";
import BackHeader from "../../components/BackHeader/BackHeader";
import styles from "./PostDetail.module.css";
import PostMenu from "../../components/PostMenu/PostMenu";
import CommentSection from "../../components/CommentSection/CommentSection";

function PostDetail() {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [user, setUser] = useState(null);
    const [vote, setVote] = useState(0);
    const [voteError, setVoteError] = useState("");

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser({ uuid: session.user.id });
            }
        });
    }, []);

    useEffect(() => {
        async function fetchPost() {
            setLoading(true);
            const { data, error } = await supabase
                .from("posts")
                .select("*")
                .eq("id", id)
                .single();

            if (error) {
                setFetchError(error.message);
            } else {
                setPost(data);
            }
            setLoading(false);
        }

        fetchPost();
    }, [id]);

    useEffect(() => {
        if (!user) return;

        async function fetchVote() {
            const { data } = await supabase
                .from("post_votes")
                .select("value")
                .eq("post_id", id)
                .eq("user_id", user.uuid)
                .maybeSingle();

            setVote(data?.value ?? 0);
        }

        fetchVote();
    }, [id, user]);

    async function castVote(newValue) {
        if (!user) {
            setVoteError("you must be logged in to vote");
            return;
        }

        setVoteError("");

        const nextVote = vote === newValue ? 0 : newValue;
        const prevVote = vote;
        setVote(nextVote);
        setPost((p) => ({ ...p, upvotes: p.upvotes - prevVote + nextVote }));

        let error;
        if (nextVote === 0) {
            ({ error } = await supabase
                .from("post_votes")
                .delete()
                .eq("post_id", id)
                .eq("user_id", user.uuid));
        } else {
            ({ error } = await supabase
                .from("post_votes")
                .upsert(
                    { post_id: id, user_id: user.uuid, value: nextVote },
                    { onConflict: "post_id,user_id" },
                ));
        }

        if (error) {
            setVote(prevVote);
            setPost((p) => ({ ...p, upvotes: p.upvotes - nextVote + prevVote }));
            setFetchError(error.message);
        }
    }

    function handleUpvote() {
        castVote(1);
    }

    function handleDownvote() {
        castVote(-1);
    }

    if (loading) {
        return (
            <>
                <BackHeader />
                <div className={styles.container}>
                    <p>$ loading...</p>
                </div>
            </>
        );
    }

    if (fetchError || !post) {
        return (
            <>
                <BackHeader />
                <div className={styles.container}>
                    <p className={styles.error}>
                        $ error: {fetchError || "post not found"}
                    </p>
                </div>
            </>
        );
    }

    const date = new Date(post.created_at);
    const formattedDate = `${date.toLocaleDateString("en-US", { month: "short" })} ${String(date.getDate()).padStart(2, "0")}`;

    const voteClass = post.upvotes >= 0 ? styles.positive : styles.negative;
    const formattedVotes = `${post.upvotes >= 0 ? "+" : ""}${post.upvotes}`;
    const isAuthor = user?.uuid === post.user_id;
    return (
        <>
            <BackHeader />
            <div className={styles.container}>
                <p>$ cd posts/{post.id}</p>
                <div className={styles.header}>
                    <div className={styles.titlebar}>
                        <h1 className={styles.title}>{post.title}</h1>
                        <PostMenu postId={post.id}></PostMenu>
                    </div>
                    <div className={styles.meta}>
                        <span className={styles.author}>
                            <span className={styles.blue}>[{post.author}]</span>
                            {formattedDate}
                        </span>
                            <div className={styles.voteGroup}>
                                <button
                                    className={`${styles.voteBtn} ${styles.upBtn} ${vote === 1 ? styles.upActive : ""}`}
                                    onClick={handleUpvote}
                                    aria-label="upvote"
                                >
                                    ▲
                                </button>
                                <span className={`${styles.score} ${voteClass}`}>
                                    {formattedVotes}
                                </span>
                                <button
                                    className={`${styles.voteBtn} ${styles.downBtn} ${vote === -1 ? styles.downActive : ""}`}
                                    onClick={handleDownvote}
                                    aria-label="downvote"
                                >
                                    ▼
                                </button>
                            </div>
                    </div>
                    {voteError && <span className={styles.voteError}>{voteError}</span>}
                </div>
                <div className={styles.content}>
                    {post.image_url && (
                        <img
                            className={styles.image}
                            src={post.image_url}
                            alt={post.title}
                        />
                    )}
                    <p className={styles.body}>{post.content}</p>
                </div>
            </div>
            <CommentSection postId={post.id}></CommentSection>
        </>
    );
}

export default PostDetail;
