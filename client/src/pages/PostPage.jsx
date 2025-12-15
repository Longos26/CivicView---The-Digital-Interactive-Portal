import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiOutlineShare, HiOutlineHeart, HiOutlineChat, HiOutlineClock, HiOutlineCalendar } from 'react-icons/hi';
import LoadingSpinner from '../components/LoadingSpinner';
import CommentSection from '../components/CommentSection';
import CanvasRenderer from '../components/CanvasRenderer';
import FeedbackForm from '../components/FeedbackForm';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useSelector } from 'react-redux';

export default function PostPage() {
  const { postSlug } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const { scrollY } = useScroll();

  // Header background opacity based on scroll
  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const headerY = useTransform(scrollY, [0, 100], [-20, 0]);

  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)']
  );

  const headerBackdrop = useTransform(scrollY, [0, 100], ['blur(0px)', 'blur(12px)']);

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

  const calculateReadTime = (content) => {
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.floor(wordCount / 200));
  };

  // Media handling
  const heroImageUrl = post?.image || '/default-post-image.jpg';
  const hasVideo = post?.video && post.video.trim() !== '';

  const handleImageError = (e) => {
    e.target.src = '/default-post-image.jpg';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-4">Article Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">The article you are looking for might have been removed or is temporarily unavailable.</p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }



  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Sticky Header */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 md:px-8"
        style={{ backgroundColor: headerBg, backdropFilter: headerBackdrop }}
      >
        <motion.div
          className="absolute inset-0 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl"
          style={{ opacity: headerOpacity }}
        />

        <div className="relative z-10 flex items-center gap-4 w-full max-w-7xl mx-auto">
          <Link
            to="/"
            className="p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all shadow-sm backdrop-blur-md z-50 flex items-center justify-center"
          >
            <HiArrowLeft className="text-xl" />
          </Link>

          <motion.h1
            className="text-lg font-bold text-slate-800 dark:text-white truncate opacity-0"
            style={{ opacity: headerOpacity, y: headerY }}
          >
            {post.title}
          </motion.h1>

          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors">
              <HiOutlineShare className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-slate-50 dark:to-slate-900 z-10"></div>
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={heroImageUrl}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover"
          onError={handleImageError}
        />

        {/* Floating Info Card */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-12 md:pb-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-10 shadow-2xl"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4 text-white/90 text-sm font-medium">
                {categoryName && (
                  <span className="px-3 py-1 rounded-full bg-indigo-600/80 backdrop-blur-sm border border-indigo-400/30">
                    {categoryName}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <HiOutlineCalendar className="w-4 h-4" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <HiOutlineClock className="w-4 h-4" />
                  {calculateReadTime(post.content)} min read
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6 text-shadow-sm">
                {post.title}
              </h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author?.avatar || '/default-avatar.jpg'}
                    alt={post.author?.username}
                    className="w-10 h-10 rounded-full border-2 border-white/30"
                    onError={(e) => (e.target.src = '/default-avatar.jpg')}
                  />
                  <div className="text-white">
                    <p className="font-semibold text-sm">{post.author?.username || 'Unknown Author'}</p>
                    <p className="text-xs text-white/70">Author</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-30">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700/50">

          {/* Video Player */}
          {hasVideo && (
            <div className="w-full bg-black">
              <video
                src={post.video}
                controls
                className="w-full aspect-video"
                poster={post.image}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Article Text */}
          <div className="p-6 md:p-12">
            <CanvasRenderer content={post.content} />
          </div>

          {/* Engagement Bar */}
          <div className="px-6 md:px-12 py-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors group">
                <div className="p-2 rounded-full bg-white dark:bg-slate-700 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                  <HiOutlineHeart className="w-6 h-6" />
                </div>
                <span className="font-medium">{post.likes?.length || 0} Likes</span>
              </button>
              <button className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-colors group">
                <div className="p-2 rounded-full bg-white dark:bg-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-colors">
                  <HiOutlineChat className="w-6 h-6" />
                </div>
                <span className="font-medium">Comment</span>
              </button>
            </div>
            <button className="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
              <HiOutlineShare className="w-6 h-6" />
            </button>
          </div>

          {/* Comments */}
          <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-6 md:p-12">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">Discussion</h3>
            <CommentSection postId={post._id} />
          </div>

          {/* Feedback */}
          <div className="border-t border-slate-100 dark:border-slate-700 p-6 md:p-12">
            <FeedbackForm />
          </div>
        </div>
      </div>

      {/* Related Posts */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">More to Explore</h2>
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
            View all <HiArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentPosts && recentPosts.map((recentPost, index) => (
            <motion.div
              key={recentPost._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-full"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 dark:border dark:border-slate-700/50 h-full flex flex-col">
                <Link to={`/post/${recentPost.slug}`} className="block relative overflow-hidden flex-shrink-0">
                  <img
                    src={recentPost.image}
                    alt={recentPost.title}
                    className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <HiOutlineClock className="w-3 h-3" />
                      {calculateReadTime(recentPost.content)} min
                    </span>
                  </div>
                  <Link to={`/post/${recentPost.slug}`}>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {recentPost.title}
                    </h3>
                  </Link>
                  <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-4 flex-1">
                    {recentPost.content.replace(/<[^>]+>/g, '')}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}