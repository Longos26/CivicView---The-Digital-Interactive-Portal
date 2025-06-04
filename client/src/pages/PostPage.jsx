import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft } from 'react-icons/hi';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import CommentSection from '../components/CommentSection';
import FeedbackForm from '../components/FeedbackForm';

export default function PostPage() {
  const { postSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        if (res.ok) {
          setPost(data.posts[0]);
          if (data.posts[0]?.category) {
            fetchCategoryName(data.posts[0].category);
          }
          setLoading(false);
          setError(false);
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug]);

  // Track post view
  useEffect(() => {
    const trackView = async () => {
      if (!post?._id) return;

      try {
        const res = await fetch(`/api/post/view/${post._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!res.ok) {
          throw new Error('Failed to track view');
        }
        const data = await res.json();
        console.log('View tracked:', data);
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [post?._id]);

  // Fetch category name
  const fetchCategoryName = async (categoryId) => {
    try {
      const res = await fetch(`/api/category/${categoryId}`);
      const data = await res.json();
      if (res.ok && data) {
        setCategoryName(data.name);
      }
    } catch (error) {
      console.error('Failed to fetch category name:', error);
    }
  };

  // Fetch recent posts
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await fetch(`/api/post/getposts?limit=3`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
        }
      } catch (error) {
        console.error('Error fetching recent posts:', error);
      }
    };
    fetchRecentPosts();
  }, []);

  // Media handling
  const heroImageUrl = post?.image || '/default-post-image.jpg';
  const hasVideo = post?.video && post.video.trim() !== '';

  const handleImageError = (e) => {
    e.target.src = '/default-post-image.jpg';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" color="indigo" />
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800/90 dark:backdrop-blur-sm">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">Article Not Found</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">We couldn't find the article you're looking for.</p>
          <Link
            to="/"
            className="inline-block w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 font-semibold text-white shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="fixed left-6 top-6 z-50 flex items-center rounded-full bg-white/90 p-3 text-gray-600 shadow-lg transition-all hover:bg-white hover:text-gray-900 dark:bg-gray-800/90 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <HiArrowLeft className="mr-2 h-5 w-5" />
        Back
      </button>

      {/* Hero Section */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900/80 z-10"></div>
        <img
          src={heroImageUrl}
          alt={post?.title || 'Article hero image'}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out"
          onError={handleImageError}
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-12">
          <div className="mx-auto w-full max-w-5xl">
            {post?.category && (
              <Link
                to={`/search?category=${post.category}`}
                className="mb-4 inline-block rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-indigo-700"
              >
                {categoryName || 'Loading...'}
              </Link>
            )}
            <h1 className="mb-6 text-4xl font-bold text-white md:text-5xl lg:text-6xl font-serif tracking-tight animate-fade-in">
              {post?.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="relative z-20 mx-auto -mt-20 max-w-5xl px-4 py-12">
        <article className="overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800/95 dark:backdrop-blur-sm">
          {/* Video Player */}
          {hasVideo && (
            <div className="w-full bg-gray-900">
              <div className="mx-auto max-w-5xl">
                <video
                  src={post.video}
                  controls
                  className="aspect-video w-full rounded-t-2xl"
                  poster={post.image}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-12">
            <div
              className="prose max-w-none prose-lg prose-headings:font-serif prose-headings:tracking-tight prose-a:text-indigo-600 prose-a:no-underline prose-img:rounded-xl hover:prose-a:underline dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: post?.content }}
            />
          </div>

          {/* Author Information */}
          {post?.author && (
            <div className="border-t border-gray-200 p-6 md:p-8 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center">
                <img
                  src={post.author.avatar || '/default-avatar.jpg'}
                  alt={post.author.username}
                  className="mr-4 h-12 w-12 rounded-full border-2 border-indigo-500 object-cover shadow-md"
                  onError={(e) => (e.target.src = '/default-avatar.jpg')}
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{post.author.username}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{post.author.bio || 'Content Writer'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Comment Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 md:p-8">
            {post && <CommentSection postId={post._id} />}
          </div>

          {/* Feedback Form */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 md:p-8">
            <FeedbackForm />
          </div>
        </article>
      </div>

      {/* Related Posts */}
      <div className="bg-gray-100 py-16 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Explore More Articles
          </h2>
          {recentPosts?.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <div key={post._id} className="transform transition-all hover:scale-105">
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-white p-10 text-center shadow-md dark:bg-gray-800">
              <p className="text-gray-600 dark:text-gray-400">No related articles found.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}