import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { supabase } from "../../client";
import BackHeader from "../../components/BackHeader/BackHeader";
import styles from "./Signup.module.css";

function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        if (!email.trim() || !password.trim() || !username.trim()) {
            setError("email, password, and username are required");
            return;
        }

        const { data, error: authError } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: { username: username.trim() },
            },
        });

        if (authError) {
            setError(authError.message);
            return;
        }

        if (data?.user?.identities?.length === 0) {
            setError("an account with this email already exists");
            return;
        }

        setConfirmed(true);
    }

    if (confirmed) {
        return (
            <>
                <BackHeader />
                <div className={styles.signupContainer}>
                    <p>$ mail</p>
                    <div className={styles.confirmed}>
                        <p className={styles.confirmedText}>
                            verification email sent to {email}
                        </p>
                        <p className={styles.confirmedSub}>
                            check your inbox and click the link to activate your account
                        </p>
                        <Link to="/login" className={`${styles.submit} ${styles.button} ${styles.accentButton}`}>
                            Login
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <BackHeader />
            <div className={styles.signupContainer}>
                <p>$ echo newuser</p>
                <div className={styles.signup}>
                    <form className={styles.signupForm} onSubmit={handleSubmit}>
                        <input
                            className={`${styles.signupInput} ${error ? styles.inputError : ""}`}
                            type="email"
                            placeholder="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError("");
                            }}
                        />
                        <input
                            className={`${styles.signupInput} ${error ? styles.inputError : ""}`}
                            type="password"
                            placeholder="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError("");
                            }}
                        />
                        <input
                            className={`${styles.signupInput} ${error ? styles.inputError : ""}`}
                            type="text"
                            placeholder="username"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (error) setError("");
                            }}
                        />
                        {error && <div className={styles.error}>[error] {error}</div>}
                        <button type="submit" className={`${styles.submit} ${styles.button} ${styles.accentButton}`}>
                            Sign Up
                        </button>
                        <Link to="/login" className={styles.switch}>
                            already have an account? log in
                        </Link>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Signup;
