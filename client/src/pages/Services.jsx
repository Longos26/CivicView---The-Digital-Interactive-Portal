import React, { useEffect, useRef, useState } from 'react';
import { Code, Globe, Smartphone } from 'lucide-react'; 
import LoadingSpinner from '../components/LoadingSpinner';

const fallbackData = [
  {
    gradient: 'from-blue-500 to-indigo-600',
    icon: Code,
    features: ['Responsive Design', 'SEO Optimization', 'Fast Load Times'],
    price: '$2,500+',
  },
  {
    gradient: 'from-purple-500 to-pink-600',
    icon: Globe,
    features: ['Social Media Ads', 'Content Strategy', 'Analytics'],
    price: '$1,500+',
  },
  {
    gradient: 'from-green-500 to-teal-600',
    icon: Smartphone,
    features: ['Cross-Platform', 'User-Friendly UI', 'Push Notifications'],
    price: '$5,000+',
  },
];

const ServicesSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState({
    services: false,
  });
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

        if (data.success) {
          // Map API data to the required structure for ServicesSection
          const mappedServices = data.services.map((service, index) => {
            const fallback = fallbackData[index % fallbackData.length]; // Cycle through fallbacks
            return {
              title: service.name,
              description: service.description || 'No description available.',
              gradient: fallback.gradient,
              icon: fallback.icon,
              features: fallback.features,
              price: fallback.price,
            };
          });
          setServices(mappedServices);
        } else {
          throw new Error(data.message || 'Failed to fetch services');
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
        setError(err.message);
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
          setIsVisible((prev) => ({ ...prev, services: true }));
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

  // Render loading state
  if (isLoading) {
    return (
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[300px]">
          <LoadingSpinner size="lg" color="primary" />
        </div>
      </section>
    );
  }

  // Render error state
  if (error) {
    return (
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xl text-red-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 px-4 sm:px-6 lg:px-8" ref={sectionRef}>
      <div className="max-w-7xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible.services ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Our Services</h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Comprehensive digital solutions tailored to your unique business needs
          </p>
        </div>

        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className={`group bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl ${
                    isVisible.services ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={32} className="text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                  <p className="text-white/70 mb-6 leading-relaxed">{service.description}</p>

                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-white/60 flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">{service.price}</span>
                    <button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300">
                      Learn More
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-white/70">
            <p>No services available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;