import { Button, Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';
import CanvasRenderer from '../components/CanvasRenderer';
import { HiOutlineClock, HiOutlineCalendar, HiOutlineUser, HiOutlineTag, HiOutlineArrowLeft } from 'react-icons/hi';

export default function PostPage() {
    const { postSlug } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [post, setPost] = useState(null);
    const [recentPosts, setRecentPosts] = useState(null);

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
                setPost(data.posts[0]);
                setLoading(false);
            } catch (error) {
                setError(true);
                setLoading(false);
            }
        };
        fetchPost();
    }, [postSlug]);

    useEffect(() => {
        try {
            const fetchRecentPosts = async () => {
                const res = await fetch(`/api/post/getposts?limit=3`);
                const data = await res.json();
                if (res.ok) {
                    setRecentPosts(data.posts);
                }
            };
            fetchRecentPosts();
        } catch (error) {
            console.log(error.message);
        }
    }, []);

    const calculateReadTime = (content) => {
        if (!content) return 0;
        // For Canvas content (JSON), we'd ideally text-extract, but length is a rough proxy
        const len = content.length;
        return Math.max(1, Math.ceil(len / 2000));
    };

    const isCanvasContent = (content) => {
        if (!content) return false;
        try {
            const parsed = JSON.parse(content);
            return Array.isArray(parsed);
        } catch (e) {
            return false;
        }
    };


    if (loading)
        return (
            <div className='flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-900'>
                <Spinner size='xl' />
            </div>
        );

    if (error || !post)
        return (
            <div className='flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-900'>
                <p className="text-xl text-red-500">Post not found</p>
            </div>
        )

    return (
        <div className='min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300'>
            <main className='p-4 md:p-8 flex flex-col max-w-7xl mx-auto'>

                {/* Back Button */}
                <div className="mb-6">
                    <Link to="/" className="inline-flex items-center text-slate-500 hover:text-indigo-600 transition-colors">
                        <HiOutlineArrowLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </div>

                {/* Hero Section */}
                <div className="relative w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-12 shadow-2xl group">
                    <img
                        src={post && post.image}
                        alt={post && post.title}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-700'
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                        <div className="flex flex-wrap gap-4 mb-6">
                            <Link to={`/search?category=${post && post.category}`}>
                                <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold hover:bg-white/30 transition-colors flex items-center gap-2">
                                    <HiOutlineTag className="w-4 h-4" />
                                    {post && post.category}
                                </span>
                            </Link>
                        </div>
                        <h1 className='text-3xl md:text-5xl lg:text-6xl font-bold text-white font-sans tracking-tight leading-tight mb-6 max-w-5xl shadow-black drop-shadow-lg'>
                            {post && post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-slate-200 text-sm md:text-base font-medium">
                            <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                <HiOutlineCalendar className="w-5 h-5 text-indigo-400" />
                                {post && new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                <HiOutlineClock className="w-5 h-5 text-indigo-400" />
                                {post && calculateReadTime(post.content)} mins read
                            </span>
                            <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                                <HiOutlineUser className="w-5 h-5 text-indigo-400" />
                                {post.author?.username || "CivicView Team"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className='flex flex-col lg:flex-row gap-12'>
                    {/* Main Content Column */}
                    <div className="flex-1 w-full min-w-0">
                        <div className={`post-content w-full mx-auto p-2 ${!isCanvasContent(post.content) ? 'prose dark:prose-invert lg:prose-xl max-w-none prose-img:rounded-2xl prose-a:text-indigo-600' : ''}`}>
                            {isCanvasContent(post.content) ? (
                                <CanvasRenderer content={post.content} readOnly={true} />
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: post && post.content }}></div>
                            )}
                        </div>
                    </div>
                </div>

                <div className='max-w-4xl mx-auto w-full mt-20 border-t border-slate-200 dark:border-slate-800 pt-10'>
                    <CallToAction />
                </div>

                <div className="mt-10">
                    <CommentSection postId={post._id} />
                </div>

                <div className='flex flex-col items-center mb-5 mt-24'>
                    <h2 className='text-3xl font-bold text-slate-800 dark:text-white mb-10'>More to Explore</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full'>
                        {recentPosts &&
                            recentPosts.map((post) => <PostCard key={post._id} post={post} />)}
                    </div>
                </div>
            </main>
        </div>
    );
}
