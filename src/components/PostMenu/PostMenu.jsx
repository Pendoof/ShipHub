import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../client";
import styles from "./PostMenu.module.css";

function PostMenu({ postId }) {
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
                setConfirming(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    function handleEdit() {
        navigate(`/post/${postId}/edit`);
    }

    async function handleDelete() {
        setDeleting(true);
        setError("");

        const { error } = await supabase.from("posts").delete().eq("id", postId);

        if (error) {
            setError(error.message);
            setDeleting(false);
            return;
        }

        navigate("/");
    }

    return (
        <div className={styles.menuWrapper} ref={menuRef}>
            <button
                className={styles.dotsBtn}
                onClick={() => setOpen((o) => !o)}
                aria-label="post options"
            >
                ⋮
            </button>

            {open && (
                <div className={styles.dropdown}>
                    {!confirming ? (
                        <>
                            <button className={styles.menuItem} onClick={handleEdit}>
                                edit
                            </button>
                            <button
                                className={`${styles.menuItem} ${styles.danger}`}
                                onClick={() => setConfirming(true)}
                            >
                                delete
                            </button>
                        </>
                    ) : (
                        <>
                            <p className={styles.confirmText}>delete this post?</p>
                            {error && <p className={styles.errorText}>{error}</p>}
                            <button
                                className={`${styles.menuItem} ${styles.danger}`}
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? "deleting..." : "confirm delete"}
                            </button>
                            <button
                                className={styles.menuItem}
                                onClick={() => setConfirming(false)}
                            >
                                cancel
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default PostMenu;
