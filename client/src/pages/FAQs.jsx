import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineSearch, HiOutlineExclamationCircle } from 'react-icons/hi';

// LoadingSpinner component
const LoadingSpinner = ({ size = "md", color = "primary" }) => (
  <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600 ${
    size === 'lg' ? 'h-12 w-12' : 'h-8 w-8'
  }`} />
);

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch FAQs from backend
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        let url = '/api/faqs';
        
        if (searchQuery) {
          url = `/api/faqs/search?q=${encodeURIComponent(searchQuery)}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch FAQs');
        }

        const data = await response.json();
        
        if (data.success) {
          setFaqData(data.data);
          setError(null);
        } else {
          throw new Error(data.message || 'Error fetching FAQs');
        }
      } catch (err) {
        setError(err.message);
        setFaqData([]);
      } finally {
        setLoading(false);
      }
    };

    // Add a small debounce to search
    const timer = setTimeout(() => {
      fetchFaqs();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about our services and policies
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <HiOutlineSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-gray-500 transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center min-h-[400px] space-y-4"
          >
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 dark:text-gray-400">Loading FAQs...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8 backdrop-blur-sm"
          >
            <div className="flex items-center space-x-3">
              <HiOutlineExclamationCircle className="h-6 w-6 text-red-500" />
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          {!loading && !error && faqData.length === 0 ? (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <HiOutlineSearch className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No FAQs Found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Try adjusting your search terms or browse all questions' : 'No FAQs available at the moment'}
              </p>
            </div>
          ) : (
            faqData.map((faq, index) => (
              <motion.div
                key={faq._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center px-8 py-6 text-left hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/20 dark:hover:to-purple-900/20 transition-all duration-300 group"
                >
                  <span className="text-lg font-semibold text-gray-800 dark:text-gray-200 pr-4 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <HiOutlineChevronUp className="h-6 w-6 text-indigo-500 transform rotate-0 transition-transform duration-300" />
                    ) : (
                      <HiOutlineChevronDown className="h-6 w-6 text-gray-400 group-hover:text-indigo-500 transition-colors duration-300" />
                    )}
                  </div>
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-indigo-50 dark:from-gray-800/50 dark:to-indigo-900/20 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </motion.div>

       
      </div>
    </div>
  );
}