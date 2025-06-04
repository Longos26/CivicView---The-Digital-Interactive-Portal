import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

// Custom SVG icons for services
const ServiceCenterIcon = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const PremiumServiceIcon = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const PriceIcon = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WarrantyIcon = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const OnlineReservationIcon = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const RepairStatusIcon = () => (
  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// Default icons for services
const defaultIcons = [
  ServiceCenterIcon,
  PremiumServiceIcon,
  PriceIcon,
  WarrantyIcon,
  OnlineReservationIcon,
  RepairStatusIcon,
];

const ServicesSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/service');
        const data = await res.json();

        if (data.success && Array.isArray(data.services)) {
          const mappedServices = data.services.map((service, index) => ({
            title: service.name || ['Service Center', 'Premium Service', 'Price', 'Warranty', 'Online Reservation', 'Repair Status'][index % 6],
            description: service.description || 'No description available.',
            gradient: `from-${
              ['indigo-600 to-blue-600', 'purple-600 to-pink-600', 'blue-600 to-teal-600'][index % 3]
            }`,
            icon: defaultIcons[index % defaultIcons.length],
          }));
          setServices(mappedServices);
        } else {
          throw new Error(data.message || 'Failed to fetch services');
        }
      } catch (err) {
        setError(err.message);
        setServices([
          {
            title: 'Service Center',
            description: 'Visit our state-of-the-art service centers for expert assistance.',
            gradient: 'from-indigo-600 to-blue-600',
            icon: ServiceCenterIcon,
          },
          {
            title: 'Premium Service',
            description: 'Experience top-tier support with our premium service plans.',
            gradient: 'from-purple-600 to-pink-600',
            icon: PremiumServiceIcon,
          },
          {
            title: 'Price',
            description: 'Transparent and competitive pricing for all services.',
            gradient: 'from-blue-600 to-teal-600',
            icon: PriceIcon,
          },
          {
            title: 'Warranty',
            description: 'Comprehensive warranty coverage for your peace of mind.',
            gradient: 'from-indigo-600 to-blue-600',
            icon: WarrantyIcon,
          },
          {
            title: 'Online Reservation',
            description: 'Easily book your service appointments online.',
            gradient: 'from-purple-600 to-pink-600',
            icon: OnlineReservationIcon,
          },
          {
            title: 'Repair Status',
            description: 'Track the status of your repairs in real-time.',
            gradient: 'from-blue-600 to-teal-600',
            icon: RepairStatusIcon,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // IntersectionObserver for animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section
      id="services"
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-20 px-4 sm:px-6 lg:px-8"
      ref={sectionRef}
    >
      <div className="container mx-auto max-w-5xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Our Services
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive digital solutions tailored to your unique business needs
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col justify-center items-center min-h-[400px] space-y-4"
          >
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 dark:text-gray-400">Loading services...</p>
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
              <svg className="h-6 w-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-700 dark:text-red-300 font-medium">
                {error}. Displaying default services.
              </p>
            </div>
          </motion.div>
        )}

        {/* Services List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
        >
          {!isLoading && services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
              >
                <div className="p-6">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${service.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    {service.description}
                  </p>
                  <button className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 mt-4">
                    Learn More
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;