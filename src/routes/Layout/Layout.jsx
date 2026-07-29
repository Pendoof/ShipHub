import { Outlet } from "react-router";
import background from "../../assets/background.jpg"
import styles from "./Layout.module.css"

function Layout() {
    return (
        <div className={styles.layout}>
            <img
                className={styles.background}
                src={background}
                alt="terminal displayed on a computer screen"
            ></img>
            <div className={styles.browser}>
                <div className={styles.toolbar}>
                    <div className={`${styles.toolbarDot} ${styles.red}`}></div>
                    <div className={`${styles.toolbarDot} ${styles.yellow}`}></div>
                    <div className={`${styles.toolbarDot} ${styles.green}`}></div>
                </div>
                <div className={styles.browserContent}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}

export default Layout;
