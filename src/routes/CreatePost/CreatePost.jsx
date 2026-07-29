import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../client";
import BackHeader from "../../components/BackHeader/BackHeader";
import styles from "./CreatePost.module.css";

function CreatePost() {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [titleError, setTitleError] = useState("");
    const [bodyError, setBodyError] = useState("");
    const [formError, setFormError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session?.user) {
                setFormError("you must be logged in to post");
                return;
            }
            setUser({
                uuid: session.user.id,
                username: session.user.user_metadata?.username ?? session.user.email?.split("@")[0],
                email: session.user.email,
            });
        });
    }, []);

    function handleImageChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setFormError("file must be an image");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setFormError("image must be under 5MB");
            return;
        }

        setFormError("");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }

    async function uploadImage() {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.uuid}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from("post-images")
            .upload(path, imageFile);

        if (uploadError) {
            throw new Error(uploadError.message);
        }

        const { data } = supabase.storage.from("post-images").getPublicUrl(path);
        return data.publicUrl;
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const hasTitle = title.trim();
        const hasBody = body.trim();

        setTitleError(hasTitle ? "" : "title is required");
        setBodyError(hasBody ? "" : "body is required");

        if (!hasTitle || !hasBody) return;

        if (!user) {
            setFormError("you must be logged in to post");
            return;
        }

        setFormError("");
        setUploading(true);

        try {
            let imageUrl = null;
            if (imageFile) {
                imageUrl = await uploadImage();
            }

            const { data, error } = await supabase
                .from("posts")
                .insert({
                    title: title.trim(),
                    content: body.trim(),
                    image_url: imageUrl,
                    user_id: user.uuid,
                    author: user.username,
                })
                .select()
                .single();

            if (error) throw error;

            navigate(`/post/${data.id}`);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <>
            <BackHeader />
            <div className={styles.createContainer}>
                <p>$ new_post/ --title --body</p>
                <div className={styles.create}>
                    <form className={styles.createForm} onSubmit={handleSubmit}>
                        <input
                            className={`${styles.createInput} ${titleError ? styles.inputError : ""}`}
                            type="text"
                            placeholder="title"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (titleError) setTitleError("");
                            }}
                        />
                        {titleError && <div className={styles.error}>[error] {titleError}</div>}

                        <textarea
                            className={`${styles.createInput} ${styles.textarea} ${bodyError ? styles.inputError : ""}`}
                            placeholder="body"
                            value={body}
                            onChange={(e) => {
                                setBody(e.target.value);
                                if (bodyError) setBodyError("");
                            }}
                            rows={5}
                        />
                        {bodyError && <div className={styles.error}>[error] {bodyError}</div>}

                        <input
                            className={styles.uploadInput}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {imagePreview && (
                            <img src={imagePreview} alt="preview" className={styles.imagePreview} />
                        )}

                        {formError && <div className={styles.error}>[error] {formError}</div>}

                        <button
                            type="submit"
                            className={`${styles.submit} ${styles.button} ${styles.accentButton}`}
                            disabled={uploading}
                        >
                            {uploading ? "posting..." : "post"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

export default CreatePost;
