import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineCloudUpload, HiOutlinePhotograph, HiOutlineVideoCamera, HiOutlinePencilAlt, HiOutlineTag } from 'react-icons/hi';

import CanvasEditor from '../components/CanvasEditor';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('image'); // 'image' or 'video'
  const [preview, setPreview] = useState(null);
  const [mediaUploadError, setMediaUploadError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    image: '',
    video: ''
  });
  const [publishError, setPublishError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const videoRef = useRef(null);

  const navigate = useNavigate();

  // Maximum file sizes (in bytes)
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setCategoryError(null);

      try {
        const res = await fetch('/api/category');
        const data = await res.json();

        if (res.ok) {
          setCategories(data);
          // Set default category if available
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, category: data[0]._id }));
          }
        } else {
          throw new Error(data.message || 'Failed to fetch categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategoryError(err.message || 'Failed to load categories. Please try again later.');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Modified validation
    if (!formData.title?.trim()) {
      setPublishError('Title is required');
      return;
    }

    // Better content validation
    const contentWithoutTags = formData.content?.replace(/<[^>]*>/g, '').trim();
    const hasContent = contentWithoutTags && contentWithoutTags.length > 0;

    if (!hasContent) {
      setPublishError('Content is required');
      return;
    }

    // Check if image is uploaded
    if (!formData.image && !formData.video) {
      setPublishError('Please upload an image or video before publishing');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          title: formData.title.trim(),
          content: formData.content
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setPublishError('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadMedia = async () => {
    if (!file) {
      setMediaUploadError('Please select a file');
      return;
    }

    // Check file size
    if (fileType === 'image' && file.size > MAX_IMAGE_SIZE) {
      setMediaUploadError(`Image size exceeds maximum allowed (5MB)`);
      return;
    } else if (fileType === 'video' && file.size > MAX_VIDEO_SIZE) {
      setMediaUploadError(`Video size exceeds maximum allowed (50MB)`);
      return;
    }

    setUploading(true);
    setMediaUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      // Update the appropriate field based on file type
      if (fileType === 'image') {
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        setFormData(prev => ({ ...prev, video: data.url }));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setMediaUploadError(error.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Determine file type
    if (selectedFile.type.startsWith('image/')) {
      // Create image preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else if (selectedFile.type.startsWith('video/')) {
      // Create video preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);

      // Clean up the URL when component unmounts or preview changes
      return () => URL.revokeObjectURL(url);
    } else {
      setFile(null);
      setMediaUploadError('Invalid file type. Please upload the correct format.');
    }
  };

  const handleMediaTypeChange = (type) => {
    // Reset file and preview when switching media type
    setFile(null);
    setPreview(null);
    setFileType(type);
    setMediaUploadError(null);
  };

  if (isPageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-6 md:py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">

          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-8 md:p-12 overflow-hidden">
            <div className="absolute inset-0 bg-pattern opacity-10"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create New Content</h1>
              <p className="text-indigo-100 flex items-center gap-2">
                Share your ideas with the community
              </p>
            </div>

            {/* Decorative circles */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-purple-500/30 rounded-full blur-xl"></div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">

            {publishError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                {publishError}
              </motion.div>
            )}

            {/* Title Input */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Headline Title
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiOutlinePencilAlt className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  id="title"
                  type="text"
                  placeholder="Enter an engaging title..."
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 transition-all text-lg font-medium"
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Category
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HiOutlineTag className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full pl-11 pr-10 py-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 dark:text-white appearance-none transition-all text-lg cursor-pointer"
                  disabled={isLoadingCategories}
                  required
                >
                  <option value="">Select a Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Media Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                  Media Attachment
                </label>
                <div className="flex bg-slate-100 dark:bg-slate-900/50 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => handleMediaTypeChange('image')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${fileType === 'image'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                      }`}
                  >
                    Image
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMediaTypeChange('video')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${fileType === 'video'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                      }`}
                  >
                    Video
                  </button>
                </div>
              </div>

              <div className="group relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-3xl p-8 transition-colors hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept={fileType === 'video' ? 'video/*' : 'image/*'}
                  onChange={handleFileChange}
                />

                <div className="flex flex-col items-center justify-center text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300 ${fileType === 'image'
                    ? 'bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'bg-pink-100/50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
                    }`}>
                    {fileType === 'image' ? <HiOutlinePhotograph className="w-8 h-8" /> : <HiOutlineVideoCamera className="w-8 h-8" />}
                  </div>

                  {file ? (
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-slate-800 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-slate-800 dark:text-white">
                        Drop your {fileType} here
                      </p>
                      <p className="text-sm text-slate-500">
                        or click to browse from your device
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Button & Preview */}
              <AnimatePresence>
                {(file || formData.image || formData.video) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {file && !formData.image && !formData.video && (
                      <button
                        type="button"
                        onClick={handleUploadMedia}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? (
                          <>
                            <LoadingSpinner size="sm" color="white" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <HiOutlineCloudUpload className="w-5 h-5" />
                            <span>Upload Selected File</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Preview Area */}
                    {(preview || formData.image || formData.video) && (
                      <div className="relative rounded-2xl overflow-hidden bg-black/5 dark:bg-black/20">
                        {fileType === 'image' ? (
                          <img
                            src={formData.image || preview}
                            alt="Preview"
                            className="w-full h-64 md:h-80 object-cover"
                          />
                        ) : (
                          <video
                            ref={videoRef}
                            src={formData.video || preview}
                            controls
                            className="w-full h-64 md:h-80 object-contain"
                          />
                        )}
                        {(formData.image || formData.video) && (
                          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold shadow-lg">
                            UPLOADED
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {mediaUploadError && (
                <p className="text-red-500 text-sm text-center">{mediaUploadError}</p>
              )}
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Content Details
              </label>
              <div className="prose-editor-container rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 transition-colors">
                <CanvasEditor
                  onChange={newContent => setFormData(prev => ({ ...prev, content: newContent }))}
                  initialContent={formData.content}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 text-lg font-bold text-white rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transform hover:scale-[1.01] transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <LoadingSpinner size="sm" color="white" />
                    <span>Publishing...</span>
                  </div>
                ) : (
                  'Publish Content'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
