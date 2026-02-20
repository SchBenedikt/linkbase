'use client';

import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AiThemeGenerator } from './ai-theme-generator';
import type { AITheme } from '@/lib/types';

interface ThemeSwitcherProps {
  onThemeApply: (theme: AITheme) => void;
}

export function ThemeSwitcher({ onThemeApply }: ThemeSwitcherProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Palette className="mr-2 h-4 w-4" />
          Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate a New Theme</DialogTitle>
          <DialogDescription>
            Describe the aesthetic you're going for, and our AI will create a unique theme for your profile.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <AiThemeGenerator onThemeApply={onThemeApply} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
