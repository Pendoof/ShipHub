import { useEffect, useState } from "react";
import { Link } from "react-router";
import { supabase } from "./client";
import PostPreview from "./components/PostPreview/PostPreview.jsx";
import styles from "./App.module.css";

function App() {
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("time");
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");

    function getUser(session) {
        if (!session?.user) return null;
        return {
            uuid: session.user.id,
            username: session.user.user_metadata.username,
            email: session.user.email,
        };
    }

    async function logout() {
        await supabase.auth.signOut();
        setUser(null);
    }

    function sortTime(e) {
        e.preventDefault();
        setSort("time");
    }

    function sortUpvotes(e) {
        e.preventDefault();
        setSort("upvotes");
    }

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(getUser(session));
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(getUser(session));
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        async function fetchPosts() {
            setLoading(true);
            const { data, error } = await supabase
                .from("posts")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                setFetchError(error.message);
            } else {
                setPosts(data);
            }
            setLoading(false);
        }

        fetchPosts();
    }, []);

    const filteredPosts = posts
        .filter((post) => post.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sort === "time") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }

            if (sort === "upvotes") {
                return b.upvotes - a.upvotes;
            }

            return 0;
        });
    
    return (
        <>
            <div className={styles.header}>
                <div className={styles.title}>
                    <h1 className={styles.ship}>Ship</h1>
                    <h1 className={styles.hub}>Hub</h1>
                </div>
                <div>
                    {user ? (
                        <button
                            onClick={logout}
                            className={`${styles.login} ${styles.button}`}
                        >
                            Logout
                        </button>
                    ) : (
                        <Link to="/login">
                            <button
                                className={`${styles.login} ${styles.accentButton} ${styles.button}`}
                            >
                                Login
                            </button>
                        </Link>
                    )}
                </div>
            </div>
            <div className={styles.searchContainer}>
                <p>
                    $ ls ideas/ --sort={sort} --search="{search}"
                </p>
                <div className={styles.search}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="--search=..."
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button
                        className={`${styles.button} ${sort === "time" ? styles.active : ""}`}
                        onClick={sortTime}
                    >
                        --sort=time
                    </button>
                    <button
                        className={`${styles.button} ${sort === "upvotes" ? styles.active : ""}`}
                        onClick={sortUpvotes}
                    >
                        --sort=upvotes
                    </button>
                    <Link to="/create">
                        <button className={`${styles.accentButton} ${styles.button}`}>
                            → new_post
                        </button>
                    </Link>
                </div>
            </div>
            <div className={styles.posts}>
                {loading ? (
                    <p className={styles.noPosts}>$ loading...</p>
                ) : fetchError ? (
                    <p className={styles.noPosts}>$ error: {fetchError}</p>
                ) : filteredPosts.length ? (
                    filteredPosts.map((post) => (
                        <PostPreview
                            key={post.id}
                            id={post.id}
                            date={post.created_at}
                            title={post.title}
                            upvotes={post.upvotes ?? 0}
                        />
                    ))
                ) : (
                    <p className={styles.noPosts}>$ No posts found.</p>
                )}
            </div>
        </>
    );
}

export default App;
