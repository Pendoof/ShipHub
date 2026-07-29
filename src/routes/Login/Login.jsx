import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { supabase } from "../../client.js";
import BackHeader from "../../components/BackHeader/BackHeader";
import styles from "./Login.module.css";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            setError("email and password are required");
            return;
        }

        const { data, error: authError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (authError) {
            if (authError.message === "Email not confirmed") {
                setError("email not confirmed — check your inbox for the verification link");
            } else {
                setError(authError.message);
            }
            return;
        }

        localStorage.setItem("userUid", data.user.id);
        navigate("/");
    }

    return (
        <>
            <BackHeader />
            <div className={styles.loginContainer}>
                <p>$ ssh user@shiphub</p>
                <div className={styles.login}>
                    <form className={styles.loginForm} onSubmit={handleSubmit}>
                        <input
                            className={`${styles.loginInput} ${error ? styles.inputError : ""}`}
                            type="email"
                            placeholder="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError("");
                            }}
                        />
                        <input
                            className={`${styles.loginInput} ${error ? styles.inputError : ""}`}
                            type="password"
                            placeholder="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError("");
                            }}
                        />
                        {error && <div className={styles.error}>[error] {error}</div>}
                        <button
                            type="submit"
                            className={`${styles.submit} ${styles.button} ${styles.accentButton}`}
                        >
                            Login
                        </button>
                        <Link to="/signup" className={styles.switch}>
                            don't have an account? sign up
                        </Link>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;
