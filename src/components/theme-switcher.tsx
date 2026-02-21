'use client';

import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AiThemeGenerator } from './ai-theme-generator';
import type { AITheme, AppearanceSettings } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AppearanceEditor } from './appearance-editor';
import { useState } from 'react';

interface ThemeSwitcherProps {
  onThemeApply: (theme: AITheme) => void;
  onAppearanceSave: (settings: AppearanceSettings) => void;
  initialAppearance: AppearanceSettings;
}

export function ThemeSwitcher({ onThemeApply, onAppearanceSave, initialAppearance }: ThemeSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSaveAppearance = (settings: AppearanceSettings) => {
    onAppearanceSave(settings);
    setIsOpen(false);
  };

  const handleApplyAiTheme = (theme: AITheme) => {
    onThemeApply(theme);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Palette className="mr-2 h-4 w-4" />
          Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Customize your Profile</DialogTitle>
          <DialogDescription>
            Use AI to generate a theme or manually tweak every detail of your profile's appearance.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="manual" className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">AI Magic</TabsTrigger>
            <TabsTrigger value="manual">Customize</TabsTrigger>
          </TabsList>
          <TabsContent value="ai" className="py-4">
            <AiThemeGenerator onThemeApply={handleApplyAiTheme} />
          </TabsContent>
          <TabsContent value="manual" className="py-4">
            <AppearanceEditor 
              initialSettings={initialAppearance}
              onSave={handleSaveAppearance}
              onCancel={() => setIsOpen(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
