import React, { useState } from 'react';
import { Award, Linkedin, Twitter, Globe, X, Quote, Sparkles, Target, Heart, Lightbulb, Music, Palette, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface TeamMember {
  name: string;
  role: string;
  title: string;
  country: string;
  image: string;
  bio: string;
  quote: string;
  flag: string;
}

const Team = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const teamMembers: TeamMember[] = [
    {
      name: "Lehan Kawshila",
      role: "Founder & Strategist",
      title: "The Visionary Architect of SoundAlchemy",
      country: "Sri Lanka",
      image: "assert/team/lehan.jpg",
      flag: "https://flagcdn.com/w80/lk.png",
      bio: "Lehan Kawshila - Leads the vision, strategy, and overall direction of the project. As a musician, undergraduate software engineer, and AI expert, Lehan is the driving force behind SoundAlchemy. With a deep love for music and technology, he envisioned a global home for musicians, where creativity has no borders. Passionate about uniting artists worldwide, he believes that human creativity is irreplaceable—and that through music, we can heal not just hearts, but the world itself.",
      quote: "Music isn't just sound—it's a force that brings people together. SoundAlchemy is that space where musicians can unite, collaborate, and create something bigger than themselves."
    },
    {
      name: "Antonio Papa",
      role: "Co-founder, Lead Audio Engineer & Music Director",
      title: "The Mastermind Behind Our Sound",
      country: "Canada",
      image: "assert/team/antonio2.jpg",
      flag: "https://flagcdn.com/w80/ca.png",
      bio: "Antonio Papa – Co-founder Lead Audio Engineer & Music Director & Operations Lead ⚙ Antonio is the soul of our sound, ensuring every collaboration, arrangement, and recording meets the highest standard. As a highly skilled audio engineer and music producer, he brings the technical expertise that transforms ideas into professional-grade music. His passion for perfection and innovation makes him an irreplaceable part of the SoundAlchemy family.",
      quote: "Music isn't just heard—it's felt. SoundAlchemy is where artists can create magic together."
    },
    {
      name: "Elena (Sofia)",
      role: "Co-Founder & Creative Director",
      title: "The Bridge That Connects Us All",
      country: "Italy",
      image: "assert/team/sofia.jpg",
      flag: "https://flagcdn.com/w80/it.png",
      bio: "Elena (Sofia) Leads creative direction, branding, and design strategies.Elena(Sofia) is the creative force behind SoundAlchemy, leading our branding, design, and artistic direction. With her expertise in visual arts and music, she ensures that every aspect of our platform reflects the beauty and diversity of the global music community. Her innovative approach to design and her deep understanding of artistic expression make her an essential part of our team.",
      quote: "Music connects us all, and SoundAlchemy is where musicians find not just a platform, but a family."
    }
  ];

  const openModal = (member: TeamMember) => {
    setSelectedMember(member);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const missionItems = [
    {
      icon: <Globe className="h-6 w-6 text-indigo-400" />,
      title: "Unite Musicians Worldwide",
      description: "Build a trusted, borderless platform where artists can connect, create, and collaborate freely."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-indigo-400" />,
      title: "Empower Creativity",
      description: "Provide a space where talent, knowledge, and culture can be shared without limits."
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-indigo-400" />,
      title: "Elevate Human Expression",
      description: "Showcase the power of real musicianship in an era of AI-generated content."
    },
    {
      icon: <Heart className="h-6 w-6 text-indigo-400" />,
      title: "Heal & Inspire Through Music",
      description: "Use the universal language of music to bring harmony, positivity, and change to the world."
    }
  ];

  return (
    <section id="team" className="py-20 bg-gradient-to-b from-[#0a0a16] to-[#0c0c1d] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block p-3 bg-indigo-900/30 rounded-full mb-4 animate-glow">
            <Award className="h-8 w-8 text-indigo-400" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Meet Our <span className="text-gradient">Visionaries</span>
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-gray-300">
            The brilliant minds shaping the future of music collaboration
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group relative"
            >
              <div 
                className="glass rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer"
                onClick={() => openModal(member)}
              >
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a16] via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="glass inline-block px-4 py-2 rounded-full bg-indigo-600/50 text-white text-sm backdrop-blur-sm">
                      {member.role}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-indigo-400 mb-2">{member.title}</p>
                  <div className="flex items-center space-x-2">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="relative w-8 h-6 rounded overflow-hidden shadow-lg"
                    >
                      <img 
                        src={member.flag} 
                        alt={`${member.country} flag`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <span className="text-gray-400">{member.country}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Modal */}
        {modalOpen && selectedMember && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl glass rounded-xl overflow-hidden shadow-2xl"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 bg-indigo-900/50 rounded-full p-2 text-white hover:bg-indigo-700 transition-colors z-10"
              >
                <X className="h-6 w-6" />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-64 md:h-auto">
                  <img 
                    src={selectedMember.image} 
                    alt={selectedMember.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a16] via-[#0a0a16]/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="relative w-8 h-6 rounded overflow-hidden shadow-lg"
                      >
                        <img 
                          src={selectedMember.flag} 
                          alt={`${selectedMember.country} flag`}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      <div className="glass inline-block px-3 py-1 rounded-full bg-indigo-600/50 text-white text-sm backdrop-blur-sm">
                        {selectedMember.country}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white">{selectedMember.name}</h3>
                    <p className="text-indigo-300">{selectedMember.role}</p>
                  </div>
                </div>
                
                <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-900/30 to-purple-900/30">
                  <h3 className="text-xl font-semibold text-indigo-300 mb-4">{selectedMember.title}</h3>
                  <p className="text-gray-300 mb-6">{selectedMember.bio}</p>
                  
                  <div className="glass p-4 rounded-xl bg-indigo-900/30 mb-6">
                    <div className="flex items-start">
                      <Quote className="h-8 w-8 text-indigo-400 mr-3 flex-shrink-0" />
                      <p className="text-white italic">{selectedMember.quote}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <a href="#" className="text-indigo-400 hover:text-white transition-colors hover:scale-110 transform duration-300">
                      <Twitter className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-indigo-400 hover:text-white transition-colors hover:scale-110 transform duration-300">
                      <Linkedin className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-indigo-400 hover:text-white transition-colors hover:scale-110 transform duration-300">
                      <Globe className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Team;