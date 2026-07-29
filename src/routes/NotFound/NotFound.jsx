import { Link } from "react-router";
import BackHeader from "../../components/BackHeader/BackHeader";
import styles from "./NotFound.module.css";

function NotFound() {
    return (
        <>
            <BackHeader />
            <div className={styles.container}>
                <p>$ 404 — page not found</p>
                <p className={styles.message}>the page you&apos;re looking for doesn&apos;t exist.</p>
                <Link to="/" className={styles.homeLink}>→ go home</Link>
            </div>
        </>
    );
}

export default NotFound;