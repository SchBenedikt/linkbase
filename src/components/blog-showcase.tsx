'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CalendarDays, UserCircle } from 'lucide-react';
import { Badge } from './ui/badge';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  }),
};

export const BlogShowcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const blogAuthor = PlaceHolderImages.find((p) => p.id === 'blog-author');
  const blogHeader = PlaceHolderImages.find((p) => p.id === 'blog-header');

  return (
    <div
      ref={ref}
      className="relative flex h-[500px] w-full max-w-4xl items-center justify-center"
    >
      <motion.div
        className="relative h-[380px] w-full max-w-2xl rounded-xl border-4 border-b-8 border-black bg-background p-3 shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Browser window bar */}
        <div className="mb-2 flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>

        {/* Mockup Content */}
        <div className="h-[calc(100%-1.25rem)] w-full overflow-hidden rounded-md bg-card">
          <motion.div
            className="h-36 w-full relative"
            custom={0}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            variants={cardVariants}
          >
            {blogHeader && (
              <img
                src={blogHeader.imageUrl}
                alt="Blog post header"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </motion.div>
          <div className="p-6">
            <motion.div
              custom={1}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
            >
              <Badge variant="secondary" className="mb-3">
                Productivity
              </Badge>
              <h2 className="text-2xl font-bold text-card-foreground">
                How to Build a Second Brain
              </h2>
            </motion.div>

            <motion.div
              className="mt-4 flex items-center gap-4 text-sm text-muted-foreground"
              custom={2}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              variants={cardVariants}
            >
              <div className="flex items-center gap-2">
                {blogAuthor && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={blogAuthor.imageUrl} />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                )}
                <span>Ali Abdaal</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>July 1, 2024</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
