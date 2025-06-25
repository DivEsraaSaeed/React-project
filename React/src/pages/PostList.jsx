import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Added useLocation, useNavigate
import { getPosts } from "@/api/posts";
import { useAuthStore } from "@/store/auth";
import qs from "qs"; // To parse query string

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(""); // For success messages
  const { decodedToken, token } = useAuthStore();

  const location = useLocation(); // For reading query params
  const navigate = useNavigate(); // For cleaning up URL

  const loggedInUserId = decodedToken?.id;

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getPosts(); // بدون userId → يجيب كل البوستات
        setPosts(response.data || []);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load posts. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "calc(100vh - 200px)" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading your posts...</span>
        </div>
      </div>
    );
  }

  // This page is now dedicated to showing the logged-in user's posts.
  const pageTitle = "Posts";

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{pageTitle}</h2>
        {loggedInUserId && (
          <Link to="/create-post" className="btn btn-secondary btn-hover">
            <i className="bi bi-plus-circle-fill me-2"></i>Create New Post
          </Link>
        )}
      </div>

      {notification && (
        <div className="alert alert-success text-center" role="alert">
          {notification}
        </div>
      )}

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="alert alert-info text-center" role="alert">
          You haven't created any posts yet.
          <Link to="/create-post" className="alert-link ms-1">
            Why not create your first one?
          </Link>
        </div>
      )}

      {!error && posts.length > 0 && (
        <div className="list-group">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/posts/${post.id}`}
              className="list-group-item list-group-item-action post-item mb-3"
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1 post-title text-wrap-fix">{post.title}</h5>
                <small className="text-muted text-wrap-fix">
                  {new Date(post.createdAt).toLocaleDateString()}
                </small>
              </div>
              <p
                className="mb-1 post-content-excerpt text-wrap-fix"
                style={{
                  whiteSpace: "normal",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  wordBreak: "break-word",
                }}
              >
                {(post.content || "").substring(0, 150)}...
              </p>

              {/* Backend includes user details in post.user */}
              <small className="text-muted text-wrap-fix">
                {/* If post.user.name or post.user.username exists, display it. Otherwise, default to "You" as it's "My Posts" page. */}
                By: {post.user?.name || post.user?.username || "You"}
              </small>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
