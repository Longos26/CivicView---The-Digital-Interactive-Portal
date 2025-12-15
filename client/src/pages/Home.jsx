import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { HiOutlineClock, HiOutlineTag, HiOutlineSearch, HiOutlineFilter, HiOutlineShare, HiOutlineEye } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { MdArrowForward, MdFavoriteBorder, MdFavorite } from 'react-icons/md';

export default function KioskHome() {
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/post/getallposts');
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Failed to fetch posts');
          return;
        }
        setPosts(data.posts || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/category');
        const data = await res.json();
        if (res.ok) {
          setCategories(data || []);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchPosts();
    fetchCategories();

    // Auto-refresh content every 2 minutes
    const interval = setInterval(() => {
      fetchPosts();
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const calculateReadTime = (content) => {
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.floor(wordCount / 200));
  };

  // Filter posts based on selected category and search query
  const filteredPosts = posts.filter(post => {
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(categoryId);
    }
  };

  // Handle favorites
  const toggleFavorite = async (e, postId) => {
    e.preventDefault(); // Prevent navigation when clicking the favorite button
    e.stopPropagation(); // Stop the event from bubbling up to the Link

    if (!currentUser) {
      alert("Please login to like the post");
      return;
    }

    try {
      const res = await fetch(`/api/post/likePost/${postId}`, {
        method: 'PUT',
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(
          posts.map((post) =>
            post._id === postId
              ? { ...post, likes: data.likes }
              : post
          )
        );
      } else {
        console.log("API error:", data.message);
        if (res.status === 401) {
          alert("Session expired. Please login again.");
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-800">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-100 dark:bg-red-900/20 p-6 text-center text-red-800 dark:text-red-400">
        <h2 className="text-3xl font-bold mb-4">Error Loading Content</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 text-xl px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                CivicView Board
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Explore community insights</p>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-3 flex-1 md:max-w-md w-full">
              <div className="relative flex-1 group">
                <HiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search ideas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-slate-800 dark:text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
                />
              </div>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                <HiOutlineFilter className="text-xl" />
              </button>
            </div>
          </div>

          {/* Categories Scroll */}
          <div className="mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === null
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md transform scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category._id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${selectedCategory === category._id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 transform scale-105'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                >
                  {selectedCategory === category._id && <HiOutlineTag className="w-3 h-3" />}
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            // Standard Grid Layout (Uniform Sizes)
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group relative h-full"
                >
                  <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 dark:border dark:border-slate-700/50 h-full flex flex-col">
                    {/* Image Container */}
                    <Link to={`/post/${post.slug}`} className="block relative overflow-hidden flex-shrink-0">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            // Add share logic here
                          }}
                          className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-slate-900 transition-all transform hover:scale-110"
                          title="Share"
                        >
                          <HiOutlineShare className="text-xl" />
                        </button>
                        <button
                          className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-slate-900 transition-all transform hover:scale-110"
                          title="View Details"
                        >
                          <HiOutlineEye className="text-xl" />
                        </button>
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 text-xs font-semibold rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                          {categories.find(cat => cat._id === post.category)?.name || 'General'}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                          <HiOutlineClock className="w-3 h-3" />
                          {calculateReadTime(post.content)} min
                        </span>
                      </div>

                      <Link to={`/post/${post.slug}`}>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-4 flex-1">
                        {post.content.replace(/<[^>]+>/g, '')}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                            CV
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">CivicView</span>
                        </div>

                        <button
                          onClick={(e) => toggleFavorite(e, post._id)}
                          className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors group/btn"
                        >
                          <span className="text-xs font-medium group-hover/btn:text-red-500 transition-colors">
                            {post.likes?.length || 0}
                          </span>
                          {post.likes && post.likes.includes(currentUser?._id) ? (
                            <MdFavorite className="text-lg text-red-500" />
                          ) : (
                            <MdFavoriteBorder className="text-lg group-hover/btn:scale-110 transition-transform" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // List View
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto space-y-4"
            >
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700"
                >
                  <Link to={`/post/${post.slug}`} className="flex gap-5">
                    <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                            {categories.find(cat => cat._id === post.category)?.name || 'General'}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(post.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                          {post.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {post.content.replace(/<[^>]+>/g, '')}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <HiOutlineClock className="w-3 h-3" />
                          {calculateReadTime(post.content)} min read
                        </span>
                        <button
                          onClick={(e) => toggleFavorite(e, post._id)}
                          className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <span className="text-xs">{post.likes?.length || 0}</span>
                          {post.likes && post.likes.includes(currentUser?._id) ? (
                            <MdFavorite className="text-red-500" />
                          ) : (
                            <MdFavoriteBorder />
                          )}
                        </button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filteredPosts.length === 0 && !loading && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <HiOutlineSearch className="text-4xl text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              No content found
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
              We couldn't find any posts matching your criteria. Try adjusting your filters or search terms.
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg shadow-indigo-500/30"
              >
                Clear All Filters
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}