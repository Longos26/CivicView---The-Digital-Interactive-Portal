import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineSearch, HiOutlineFilter, HiOutlineX } from 'react-icons/hi';

// Constants
const ITEMS_PER_PAGE = 6;

export default function Search() {
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    sort: 'desc',
    category: '',
  });

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  // Calculate pagination values
  const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);
  const indexOfLastPost = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstPost = indexOfLastPost - ITEMS_PER_PAGE;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/category');
        const data = await res.json();
        if (res.ok) {
          const formattedCategories = data.map(cat => ({
            value: cat._id,
            label: cat.name
          }));
          setCategories([
            { value: '', label: 'All Categories' },
            ...formattedCategories
          ]);
        } else {
          throw new Error(data.message || 'Failed to fetch categories');
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setCategories([
          { value: '', label: 'All Categories' },
          { value: 'uncategorized', label: 'Uncategorized' }
        ]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const sortFromUrl = urlParams.get('sort');
    const categoryFromUrl = urlParams.get('category');
    
    setSearchParams({
      searchTerm: searchTermFromUrl || '',
      sort: sortFromUrl || 'desc',
      category: categoryFromUrl || '',
    });

    const fetchPosts = async () => {
      setLoading(true);
      const searchQuery = urlParams.toString();
      
      try {
        const res = await fetch(`/api/post/getposts?${searchQuery}`);
        if (!res.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await res.json();
        setPosts(data.posts);
        setTotalPosts(data.posts.length);
        setShowMore(data.posts.length === 9);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setSearchParams(prev => ({ 
      ...prev, 
      [id]: value 
    }));
    setCurrentPage(1);
  };

  const handleShowMore = async () => {
    const startIndex = posts.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', startIndex);
    
    try {
      const res = await fetch(`/api/post/getposts?${urlParams.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch more posts');
      }
      
      const data = await res.json();
      setPosts(prev => [...prev, ...data.posts]);
      setTotalPosts(prev => prev + data.posts.length);
      setShowMore(data.posts.length === 9);
    } catch (error) {
      console.error('Error fetching more posts:', error);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams();
    urlParams.set('searchTerm', searchParams.searchTerm);
    urlParams.set('sort', searchParams.sort);
    urlParams.set('category', searchParams.category);
    navigate(`/search?${urlParams.toString()}`, { replace: true });
  }, [searchParams, navigate]);

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchParams({
      searchTerm: '',
      sort: 'desc',
      category: '',
    });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header with Search Bar */}
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-6">
          Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Inspiration</span>
        </h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              id="searchTerm"
              placeholder="Search posts, topics, or keywords..."
              value={searchParams.searchTerm}
              onChange={handleChange}
              className="w-full py-3 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200 ease-in-out placeholder-gray-400 dark:placeholder-gray-500"
            />
            {searchParams.searchTerm && (
              <button 
                onClick={() => setSearchParams(prev => ({...prev, searchTerm: ''}))}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <HiOutlineX className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors" />
              </button>
            )}
          </div>
          <button 
            onClick={toggleFilters}
            className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
              isFilterOpen 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <HiOutlineFilter className="w-5 h-5" />
            Filters
          </button>
        </div>
      </header>

      {/* Filter Section */}
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 transition-all duration-300 ease-in-out overflow-hidden ${
        isFilterOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 p-0 border-0'
      }`}>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Sort Options</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setSearchParams(prev => ({...prev, sort: 'desc'}))}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
                  searchParams.sort === 'desc'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800'
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Latest
              </button>
              <button
                onClick={() => setSearchParams(prev => ({...prev, sort: 'asc'}))}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all ${
                  searchParams.sort === 'asc'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800'
                    : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                Oldest
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Filter By</h3>
            <div className="relative">
              <select
                id="category"
                value={searchParams.category}
                onChange={handleChange}
                className="appearance-none w-full p-2.5 pl-4 pr-10 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={clearFilters}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            Reset all filters
          </button>
        </div>
      </div>

      {/* Results Section */}
      <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {searchParams.searchTerm ? `Results for "${searchParams.searchTerm}"` : 'All Posts'}
          </h2>
          {!loading && posts.length > 0 && (
            <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-1 px-3 rounded-full">
              {totalPosts} {totalPosts === 1 ? 'post' : 'posts'}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <LoadingSpinner size="lg" color="indigo" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
              <HiOutlineSearch className="w-12 h-12 text-indigo-400 dark:text-indigo-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No results found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              {searchParams.searchTerm 
                ? `We couldn't find any posts matching "${searchParams.searchTerm}"`
                : 'There are currently no posts available'}
            </p>
            <button 
              onClick={clearFilters}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {currentPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === 1 
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <HiOutlineChevronLeft className="h-5 w-5" />
                    Previous
                  </button>
                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currentPage === totalPages 
                        ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Next
                    <HiOutlineChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Showing <span className="font-semibold">{indexOfFirstPost + 1}</span> to{' '}
                    <span className="font-semibold">{Math.min(indexOfLastPost, totalPosts)}</span> of{' '}
                    <span className="font-semibold">{totalPosts}</span> results
                  </p>
                  <nav className="flex items-center gap-2" aria-label="Pagination">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === 1 
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <HiOutlineChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                            currentPage === number
                              ? 'bg-indigo-600 text-white'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg transition-all ${
                        currentPage === totalPages 
                          ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <HiOutlineChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            )}

            {showMore && (
              <div className="flex justify-center py-8">
                <button 
                  onClick={handleShowMore}
                  className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-indigo-600 dark:text-indigo-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" color="indigo" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <span>Show more</span>
                      <HiOutlineChevronDown className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}