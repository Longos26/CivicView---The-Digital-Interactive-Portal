import { useState, useEffect } from 'react';
import { HiOutlineClock, HiOutlineTag, HiOutlineSearch, HiOutlineFilter } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { MdArrowForward, MdFavoriteBorder, MdFavorite } from 'react-icons/md';

export default function KioskHome() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
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
  const toggleFavorite = (e, postId) => {
    e.preventDefault(); // Prevent navigation when clicking the favorite button
    e.stopPropagation(); // Stop the event from bubbling up to the Link

    const newFavorites = favorites.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...favorites, postId];

    setFavorites(newFavorites);
    // To make favorites persistent, you could save them to localStorage:
    // localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-2">
              Interactive Board
            </h1>
            <p className="text-slate-400 text-lg">Discover and explore curated content</p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl" />
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
              />
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-cyan-400 hover:border-cyan-500 transition flex items-center gap-2"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              <HiOutlineFilter className="text-xl" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Categories section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 py-8"
      >
        <div className="flex flex-wrap gap-3">
          <motion.button
            onClick={() => setSelectedCategory(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2.5 rounded-full font-medium transition duration-200 flex items-center gap-2 ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <span className="text-lg">✨</span>
            All Content
          </motion.button>

          {categories.map((category) => (
            <motion.button
              key={category._id}
              onClick={() => handleCategoryClick(category._id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2.5 rounded-full font-medium transition duration-200 flex items-center gap-2 ${
                selectedCategory === category._id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <HiOutlineTag className="h-4 w-4" />
              {category.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Content Grid/List */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <Link
                    to={`/post/${post.slug}`}
                    className="relative rounded-xl overflow-hidden h-80 block"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300 flex items-center gap-1">
                            <HiOutlineClock className="h-4 w-4" />
                            {calculateReadTime(post.content)} min read
                          </span>
                          <MdArrowForward className="text-cyan-400 text-xl group-hover:translate-x-1 transition" />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Card Footer */}
                  <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/30">
                        <HiOutlineTag className="h-3 w-3" />
                        {categories.find(cat => cat._id === post.category)?.name || 'Uncategorized'}
                      </span>
                      <motion.button
                        onClick={(e) => toggleFavorite(e, post._id)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-xl transition"
                      >
                        {favorites.includes(post._id) ? (
                          <MdFavorite className="text-red-500" />
                        ) : (
                          <MdFavoriteBorder className="text-slate-400 hover:text-red-500" />
                        )}
                      </motion.button>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">{post.content.substring(0, 100)}...</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500/50 transition"
                >
                  <Link
                    to={`/post/${post.slug}`}
                    className="flex gap-4 p-4 hover:bg-slate-800 transition"
                  >
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-32 h-32 object-cover rounded-lg group-hover:scale-105 transition duration-300"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition">{post.title}</h3>
                        <p className="text-sm text-slate-400 line-clamp-2">{post.content.substring(0, 150)}...</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-xs px-3 py-1 rounded-full border border-purple-500/30">
                            <HiOutlineTag className="h-3 w-3" />
                            {categories.find(cat => cat._id === post.category)?.name || 'Uncategorized'}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <HiOutlineClock className="h-3 w-3" />
                            {calculateReadTime(post.content)} min
                          </span>
                        </div>
                        <motion.button
                          onClick={(e) => toggleFavorite(e, post._id)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-xl transition"
                        >
                          {favorites.includes(post._id) ? (
                            <MdFavorite className="text-red-500" />
                          ) : (
                            <MdFavoriteBorder className="text-slate-400 hover:text-red-500" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {searchQuery
              ? 'No Results Found'
              : selectedCategory
              ? 'No Content in This Category'
              : 'No Content Available'}
          </h2>
          <p className="text-slate-400 text-lg mb-6 max-w-md">
            {searchQuery
              ? `Try adjusting your search terms or browse all content.`
              : selectedCategory
              ? 'Try selecting a different category or check back later.'
              : 'Check back later for new content.'}
          </p>
          {(searchQuery || selectedCategory) && (
            <motion.button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition"
            >
              Clear Filters
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  );
}