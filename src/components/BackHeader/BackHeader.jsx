import { Link } from "react-router";
import styles from "./BackHeader.module.css";

function BackHeader() {
    return (
        <div className={styles.backHeader}>
            <Link to="/"><h1>← Back</h1></Link>
        </div>
    );
}

export default BackHeader;
