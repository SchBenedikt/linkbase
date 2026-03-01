'use client';

import {
  Dribbble,
  Github,
  Instagram,
  Linkedin,
  Music,
  Twitter,
  Youtube,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

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
            <div className="mt-2 h-12 w-12 rounded-full bg-foreground/20" />
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
            <motion.div
              custom={0}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
            >
              <div className="h-20 w-20 rounded-full bg-foreground/20" />
            </motion.div>
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
            {/* YouTube-style card */}
            <motion.div
                custom={3}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                variants={cardVariants}
                className="col-span-2 row-span-1 h-full w-full rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center"
            >
              <Youtube className="h-6 w-6 text-primary/60" />
            </motion.div>
            {/* Spotify-style card */}
            <motion.div
                custom={4}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                variants={cardVariants}
                className="h-full w-full rounded-lg bg-accent/40 border border-accent/40 flex items-center justify-center"
            >
              <Music className="h-4 w-4 text-accent-foreground/60" />
            </motion.div>
            {/* Link card */}
            <motion.div
                custom={5}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                variants={cardVariants}
                className="h-full w-full rounded-lg bg-card border border-border/60"
            />
            {/* Blog post card */}
            <motion.div
              custom={6}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
              className="col-span-2 h-full w-full rounded-lg bg-card p-2 border border-border/60"
            >
                <p className="text-xs font-bold text-foreground/70">Latest Thoughts</p>
                <div className="mt-1 h-2 w-full rounded-full bg-foreground/10" />
                <div className="mt-1 h-2 w-2/3 rounded-full bg-foreground/10" />
             </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
