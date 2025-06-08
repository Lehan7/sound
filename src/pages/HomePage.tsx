import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Globe, MessageSquare, Shield, Users, HeartHandshake } from 'lucide-react';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const HomePage: React.FC = () => {
  return (
    <div className="bg-dark-800 text-white w-full">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden p-0 m-0 w-full">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-dark-800/90 via-dark-800/80 to-dark-800 z-10"></div>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center"></div>
        </div>
        <div className="w-full flex flex-col items-center justify-center relative z-10 px-2 sm:px-4">
          <motion.div 
            className="text-center w-full"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 bg-gradient-to-r from-primary-400 via-white to-secondary-400 text-transparent bg-clip-text drop-shadow-lg"
              variants={fadeIn}
            >
              SoundAlchemy
            </motion.h1>
            <motion.h2 
              className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-gray-300 drop-shadow"
              variants={fadeIn}
            >
              Where Musicians Unite Globally
            </motion.h2>
            <motion.p 
              className="text-base sm:text-lg md:text-xl w-full mx-auto mb-8 sm:mb-10 text-gray-400 drop-shadow"
              variants={fadeIn}
            >
              A universal platform where musicians from all over the world, regardless of nationality, 
              religion, or culture, can connect, collaborate, and create music together.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
              variants={fadeIn}
            >
              <Link to="/register" className="btn-primary text-center text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 shadow-xl">
                Join the Movement
              </Link>
              <a href="#learn-more" className="btn-outline text-center text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 shadow-xl">
                Learn More
              </a>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2 z-10">
          <a 
            href="#learn-more" 
            className="flex flex-col items-center text-gray-400 hover:text-white transition-colors"
          >
            <span className="text-xs sm:text-sm mb-2">Discover More</span>
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-5 sm:w-6 h-8 sm:h-10 border-2 border-gray-400 rounded-full flex justify-center"
            >
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1 h-2 sm:w-1.5 sm:h-3 bg-gray-400 rounded-full mt-2"
              ></motion.div>
            </motion.div>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="learn-more" className="py-12 sm:py-16 md:py-20 bg-dark-900 w-full">
        <div className="w-full px-2 sm:px-4 max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-10 sm:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <motion.h2 
              className="text-2xl sm:text-3xl md:text-4xl font-display font-bold mb-3 sm:mb-4"
              variants={fadeIn}
            >
              Why SoundAlchemy?
            </motion.h2>
            <motion.p 
              className="text-base sm:text-xl text-gray-400 w-full mx-auto"
              variants={fadeIn}
            >
              A trustworthy and professional platform exclusively for musicians to connect and collaborate globally.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {/* Feature Cards - unified style */}
            <motion.div 
              className="glass-card rounded-xl p-5 sm:p-6 flex flex-col items-center text-center hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
              variants={fadeIn}
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <Globe className="h-7 w-7 sm:h-8 sm:w-8 text-primary-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Global Collaboration</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Connect with musicians from every corner of the world and collaborate on projects 
                regardless of distance.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              className="glass-card rounded-xl p-5 sm:p-6 flex flex-col items-center text-center hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
              variants={fadeIn}
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8 text-primary-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Live Discussions</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Engage in real-time discussions, share knowledge, and learn from musicians 
                across different cultures.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              className="glass-card rounded-xl p-5 sm:p-6 flex flex-col items-center text-center hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
              variants={fadeIn}
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <HeartHandshake className="h-7 w-7 sm:h-8 sm:w-8 text-primary-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Cultural Exchange</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Explore and exchange musical traditions and techniques from different parts 
                of the world.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div 
              className="glass-card rounded-xl p-5 sm:p-6 flex flex-col items-center text-center hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
              variants={fadeIn}
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-secondary-500/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-secondary-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Verified Musicians</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Every musician undergoes verification to ensure a trustworthy community 
                free from scams and fake profiles.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div 
              className="glass-card rounded-xl p-5 sm:p-6 flex flex-col items-center text-center hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
              variants={fadeIn}
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-secondary-500/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <Users className="h-7 w-7 sm:h-8 sm:w-8 text-secondary-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Exclusive for Musicians</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                A dedicated platform exclusively for musicians, unlike general social 
                media platforms.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div 
              className="glass-card rounded-xl p-5 sm:p-6 flex flex-col items-center text-center hover:shadow-2xl hover:scale-[1.03] transition-all duration-300"
              variants={fadeIn}
            >
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-secondary-500/20 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <Music className="h-7 w-7 sm:h-8 sm:w-8 text-secondary-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">Completely Free</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                Access all features without any cost, making music collaboration 
                accessible to everyone.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Project Section */}
      <section className="py-20 bg-dark-800 w-full">
        <div className="w-full px-0 mx-auto">
          <motion.div 
            className="glass-card p-8 md:p-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                  Our First Project: A Global Cover of "We Are The World"
                </h2>
                <p className="text-gray-400 mb-6">
                  As our first major initiative, we are bringing together musicians from different 
                  countries to create a cover of "We Are The World." This project will symbolize 
                  the unity of musicians worldwide and highlight the power of music in bringing 
                  people together.
                </p>
                <Link to="/register" className="btn-primary inline-block">
                  Join This Project
                </Link>
              </div>
              <div className="md:w-1/2">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img 
                    src="https://images.pexels.com/photos/2531728/pexels-photo-2531728.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                    alt="Musicians collaborating"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-dark-900 w-full">
        <div className="w-full px-0 mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Music for a Better World
            </h2>
            <p className="text-xl text-gray-400 w-full mx-auto">
              Beyond music, we believe in using our talents to make the world a better place.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="glass-card p-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              <h3 className="text-2xl font-bold mb-4">Healing Through Music</h3>
              <p className="text-gray-400 mb-6">
                Our planet gives us so much, but we often fail to appreciate it. It is time for us 
                to give back and heal the world through music. SoundAlchemy aims to create musical 
                projects that raise awareness about global issues and inspire positive change.
              </p>
            </motion.div>

            <motion.div 
              className="glass-card p-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              <h3 className="text-2xl font-bold mb-4">The Future of AI and Music</h3>
              <p className="text-gray-400 mb-6">
                As AI gradually takes over human creativity, now is the time for us to prove that 
                human creativity is irreplaceable. Musicians are the most innovative and emotionally 
                expressive artists in the world, and SoundAlchemy will be their dedicated space to 
                showcase their skills.
              </p>
            </motion.div>
          </div>

          <motion.div 
            className="mt-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <Link to="/register" className="btn-secondary text-lg px-8 py-3">
              Join the Movement
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-dark-900 to-dark-800 w-full">
        <div className="w-full px-0 mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
              Ready to Transform the Music World?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join musicians from across the globe in creating a new era of music collaboration.
              Be part of something bigger than yourself.
            </p>
            <Link to="/register" className="btn-primary text-lg px-10 py-3">
              Register Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;