import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import App from "./App.jsx";
import Layout from "./routes/Layout/Layout.jsx"
import Login from "./routes/Login/Login.jsx"
import Signup from "./routes/Signup/Signup.jsx"
import CreatePost from "./routes/CreatePost/CreatePost.jsx";
import PostDetail from "./routes/PostDetail/PostDetail.jsx";
import NotFound from "./routes/NotFound/NotFound.jsx";
import EditPost from "./routes/EditPost/EditPost.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<App />} />
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="create" element={<CreatePost />} />
                    <Route path="post/:id" element={<PostDetail />} />
                    <Route path="post/:id/edit" element={<EditPost />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    </StrictMode>,
);
