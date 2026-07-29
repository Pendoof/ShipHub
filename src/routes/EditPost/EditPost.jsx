import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { supabase } from "../../client";
import BackHeader from "../../components/BackHeader/BackHeader";
import styles from "../CreatePost/CreatePost.module.css";

function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        async function fetchPost() {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            const { data: post, error } = await supabase
                .from("posts")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !post) {
                setFormError("post not found");
                setLoading(false);
                return;
            }

            if (post.user_id !== session?.user?.id) {
                setFormError("you can only edit your own posts");
                setLoading(false);
                return;
            }

            setTitle(post.title);
            setBody(post.content);
            setLoading(false);
        }

        fetchPost();
    }, [id]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!title.trim() || !body.trim()) {
            setFormError("title and body are required");
            return;
        }

        setSaving(true);
        setFormError("");

        const { error } = await supabase
            .from("posts")
            .update({ title: title.trim(), content: body.trim() })
            .eq("id", id);

        setSaving(false);

        if (error) {
            setFormError(error.message);
            return;
        }

        navigate(`/post/${id}`);
    }

    if (loading) {
        return (
            <>
                <BackHeader />
                <div className={styles.createContainer}>
                    <p>$ loading...</p>
                </div>
            </>
        );
    }

    if (formError && !title) {
        return (
            <>
                <BackHeader />
                <div className={styles.createContainer}>
                    <p className={styles.error}>$ error: {formError}</p>
                </div>
            </>
        );
    }

    return (
        <>
            <BackHeader />
            <div className={styles.createContainer}>
                <p>$ edit_post/{id} --title --body</p>
                <div className={styles.create}>
                    <form className={styles.createForm} onSubmit={handleSubmit}>
                        <input
                            className={styles.createInput}
                            type="text"
                            placeholder="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            className={`${styles.createInput} ${styles.textarea}`}
                            placeholder="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={5}
                        />
                        {formError && (
                            <div className={styles.error}>[error] {formError}</div>
                        )}
                        <button
                            type="submit"
                            className={`${styles.submit} ${styles.button} ${styles.accentButton}`}
                            disabled={saving}
                        >
                            {saving ? "saving..." : "save"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default EditPost;
