import { Link } from "react-router";
import styles from "./PostPreview.module.css";

function PostPreview(props) {
    const date = new Date(props.date);

    const formattedDate = `${date.toLocaleDateString("en-US", {
        month: "short",
    })} ${String(date.getDate()).padStart(2, "0")}`;

    const voteClass = props.upvotes >= 0 ? styles.upvotePositive : styles.upvoteNegative;
    const formattedVotes = `${props.upvotes >= 0 ? "+" : ""}${props.upvotes}`;

    return (
        <>
            <Link to={`/post/${props.id}`} className={styles.postPreview}>
                <div className={styles.postInfo}>
                    <div className={styles.date}>[{formattedDate}]</div>
                    <div className={styles.blue}>$</div>
                    <div className={styles.title}>{props.title}</div>
                </div>

                <div className={`${styles.upvotes} ${voteClass}`}>{formattedVotes}</div>
            </Link>
            <hr className={styles.separator}></hr>
        </>
    );
}

export default PostPreview;
