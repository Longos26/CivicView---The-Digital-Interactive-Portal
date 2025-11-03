import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Label, TextInput } from 'flowbite-react';
import { Eye, EyeOff } from 'lucide-react';
import OAuth from '../components/OAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!formData.username) errors.username = 'Username is required';
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password) errors.password = 'Password is required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    if (validationErrors[e.target.id]) {
      setValidationErrors({ ...validationErrors, [e.target.id]: '' });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        return setErrorMessage(data.message);
      }
      if (res.ok) navigate('/sign-in');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const floatingCircleVariants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12"
    >
      <motion.div
        variants={itemVariants}
        className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row"
      >
        {/* Left Side - Branding */}
        <motion.div
          className="md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-12 flex flex-col justify-center relative overflow-hidden"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <motion.div
            className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10"
            animate={{
              scale: [1, 1.1, 1],
              transition: { duration: 5, repeat: Infinity }
            }}
          ></motion.div>
          <motion.div
            className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-white/10"
            animate={{
              scale: [1, 1.2, 1],
              transition: { duration: 6, repeat: Infinity, delay: 0.5 }
            }}
          ></motion.div>

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            >
              <Link to="/" className="inline-block mb-8">
                <img src="src/3.png" alt="CivicView Logo" className="h-12" />
              </Link>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold text-white mb-3"
            >
              Create Account
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-blue-100 mb-8 max-w-sm"
            >
              Start managing your content and stay connected by creating your account.
            </motion.p>

            <motion.div className="flex space-x-4 mt-auto">
              <motion.span
                variants={floatingCircleVariants}
                animate="animate"
                className="w-3 h-3 rounded-full bg-white/30"
              ></motion.span>
              <motion.span
                variants={floatingCircleVariants}
                animate="animate"
                transition={{ delay: 0.5 }}
                className="w-3 h-3 rounded-full bg-white/60"
              ></motion.span>
              <motion.span
                variants={floatingCircleVariants}
                animate="animate"
                transition={{ delay: 1 }}
                className="w-3 h-3 rounded-full bg-white"
              ></motion.span>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          className="md:w-1/2 p-8 md:p-12"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
        >
          <motion.div
            className="mb-8"
            variants={itemVariants}
          >
            <motion.h3
              className="text-2xl font-bold text-gray-800 dark:text-white"
              variants={itemVariants}
            >
              Sign up for an account
            </motion.h3>
            <motion.p
              className="text-gray-500 dark:text-gray-400 mt-2"
              variants={itemVariants}
            >
              Enter your details to get started
            </motion.p>
          </motion.div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <Alert className="mb-6" color="failure">
                {errorMessage}
              </Alert>
            </motion.div>
          )}

          <motion.form
            className="space-y-6"
            onSubmit={handleSubmit}
            variants={containerVariants}
          >
            <motion.div
              variants={itemVariants}
              custom={1}
            >
              <Label htmlFor="username" value="Username" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block" />
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <TextInput
                  id="username"
                  type="text"
                  placeholder="Username"
                  onChange={handleChange}
                  className={`mt-1 w-full ${validationErrors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </motion.div>
              {validationErrors.username && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {validationErrors.username}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              custom={2}
            >
              <Label htmlFor="email" value="Email" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block" />
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <TextInput
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  onChange={handleChange}
                  className={`mt-1 w-full ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </motion.div>
              {validationErrors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {validationErrors.email}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              variants={itemVariants}
              custom={3}
            >
              <Label htmlFor="password" value="Password" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block" />
              <motion.div
                className="relative"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <TextInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  onChange={handleChange}
                  className={`mt-1 w-full ${validationErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                <motion.button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </motion.button>
              </motion.div>
              {validationErrors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {validationErrors.password}
                </motion.p>
              )}
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              variants={itemVariants}
              custom={4}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <motion.div
                  className="flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <LoadingSpinner size="sm" color="white" />
                  <span className="pl-3">Signing up...</span>
                </motion.div>
              ) : (
                'Sign Up'
              )}
            </motion.button>

            <motion.div
              className="relative flex items-center justify-center"
              variants={itemVariants}
              custom={5}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              custom={6}
            >
              <OAuth />
            </motion.div>
          </motion.form>

          <motion.p
            className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Already have an account?{' '}
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <Link to="/sign-in" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                Sign in here
              </Link>
            </motion.span>
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}