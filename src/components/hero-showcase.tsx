'use client';

import {
  Dribbble,
  Github,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1 + 0.5,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1 + 1,
      duration: 0.3,
      ease: 'easeOut',
    },
  }),
};

export const HeroShowcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const profileAvatar = PlaceHolderImages.find((p) => p.id === 'profile-avatar');
  const linkThumb1 = PlaceHolderImages.find(p => p.id === 'link-thumb-1');
  const linkThumb2 = PlaceHolderImages.find(p => p.id === 'link-thumb-2');
  const linkThumb3 = PlaceHolderImages.find(p => p.id === 'link-thumb-3');

  const socialIcons = [Twitter, Instagram, Dribbble, Github, Youtube, Linkedin];

  return (
    <div
      ref={ref}
      className="relative flex h-[500px] w-full max-w-4xl items-center justify-center"
    >
      {/* Phone */}
      <motion.div
        className="z-10 h-[380px] w-[190px] rounded-3xl border-8 border-black bg-background p-1.5 shadow-2xl"
        initial={{ y: 50, x: 50, rotate: 10, opacity: 0 }}
        animate={
          isInView
            ? { y: 0, x: 0, rotate: 5, opacity: 1 }
            : { y: 50, x: 50, rotate: 10, opacity: 0 }
        }
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
      >
        <div className="h-full w-full overflow-hidden rounded-2xl bg-accent/20">
          <div className="flex h-full flex-col items-center gap-2 p-2">
            {profileAvatar && (
              <Avatar className="mt-2 h-12 w-12 border-2">
                <AvatarImage src={profileAvatar.imageUrl} alt="Avatar" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            )}
            <div
              className="h-3 w-20 rounded-full bg-foreground/10"
              aria-label="User name"
            />
            <div
              className="h-2 w-28 rounded-full bg-foreground/10"
              aria-label="User bio"
            />
            <div className="mt-2 grid w-full grid-cols-2 gap-2">
              <div className="h-16 w-full rounded-lg bg-card" />
              <div className="h-16 w-full rounded-lg bg-card" />
              <div className="col-span-2 h-10 w-full rounded-lg bg-card" />
              <div className="h-16 w-full rounded-lg bg-card" />
              <div className="h-16 w-full rounded-lg bg-card" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop */}
      <motion.div
        className="absolute h-[320px] w-full max-w-xl rounded-xl border-4 border-b-8 border-black bg-background p-2 shadow-xl"
        initial={{ y: -30, scale: 0.9, opacity: 0 }}
        animate={
          isInView
            ? { y: 0, scale: 1, opacity: 1 }
            : { y: -30, scale: 0.9, opacity: 0 }
        }
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="mb-1 flex gap-1">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
        <div className="flex h-[calc(100%-1rem)] w-full rounded-md bg-accent/20">
          <div className="w-1/3 border-r border-dashed border-foreground/20 p-4">
            {profileAvatar && (
              <motion.div
                custom={0}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                variants={cardVariants}
              >
                <Avatar className="h-20 w-20 border-2">
                  <AvatarImage src={profileAvatar.imageUrl} alt="Avatar" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
              </motion.div>
            )}
            <motion.div
              custom={1}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
              className="mt-4 h-5 w-32 rounded-full bg-foreground/10"
              aria-label="User name"
            />
            <motion.div
              custom={2}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
              className="mt-2 h-3 w-40 rounded-full bg-foreground/10"
              aria-label="User bio"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              {socialIcons.map((Icon, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  variants={iconVariants}
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </div>
          <div className="grid w-2/3 grid-cols-3 grid-rows-2 gap-3 p-4">
            {linkThumb1 && (
                <motion.div
                    custom={3}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    variants={cardVariants}
                    className="relative col-span-2 row-span-1 h-full w-full overflow-hidden rounded-lg"
                >
                    <img 
                        src={linkThumb1.imageUrl} 
                        alt="Link 1" 
                        className="absolute inset-0 h-full w-full object-cover rounded-lg" 
                    />
                </motion.div>
            )}
             {linkThumb2 && (
                <motion.div
                    custom={4}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    variants={cardVariants}
                    className="relative h-full w-full overflow-hidden rounded-lg"
                >
                    <img 
                        src={linkThumb2.imageUrl} 
                        alt="Link 2" 
                        className="absolute inset-0 h-full w-full object-cover rounded-lg" 
                    />
                </motion.div>
             )}
            {linkThumb3 && (
                <motion.div
                    custom={5}
                    initial="hidden"
                    animate={isInView ? 'visible' : 'hidden'}
                    variants={cardVariants}
                    className="relative h-full w-full overflow-hidden rounded-lg"
                >
                    <img 
                        src={linkThumb3.imageUrl} 
                        alt="Link 3" 
                        className="absolute inset-0 h-full w-full object-cover rounded-lg" 
                    />
                </motion.div>
            )}
             <motion.div
              custom={6}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
              className="col-span-2 h-full w-full rounded-lg bg-card p-2"
            >
                <p className="text-xs font-bold">Latest Thoughts</p>
                <div className="mt-1 h-2 w-full rounded-full bg-foreground/10" />
                <div className="mt-1 h-2 w-2/3 rounded-full bg-foreground/10" />
             </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
