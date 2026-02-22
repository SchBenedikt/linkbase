'use client';

import { useState, type FormEvent } from 'react';
import { generateTheme } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Loader2 } from 'lucide-react';
import type { AITheme } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface AiThemeGeneratorProps {
  onThemeApply: (theme: AITheme) => void;
}

export function AiThemeGenerator({ onThemeApply }: AiThemeGeneratorProps) {
  const [state, setState] = useState<{ error?: string; data: AITheme | null }>({ data: null });
  const [isPending, setIsPending] = useState(false);

  const aiTheme: AITheme | null = state.data;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await generateTheme(null, formData);
    setState(result);
    setIsPending(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <Input
          name="keywords"
          placeholder="e.g. '80s synthwave', 'minimalist dark', 'forest cabin'"
          required
        />
        <Button type="submit" disabled={isPending} className="w-40">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
          Generate
        </Button>
      </form>

      {state?.error && (
        <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {aiTheme && (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle>{aiTheme.themeName}</CardTitle>
            <CardDescription>{aiTheme.themeDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiTheme.colorPalettes.map((palette, index) => (
              <div key={index}>
                <h4 className="text-sm font-semibold mb-2 text-secondary-foreground">{palette.name}</h4>
                <div className="flex gap-2">
                  {palette.colors.map((color) => (
                    <div
                      key={color}
                      className="w-10 h-10 rounded-lg border-2"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button onClick={() => onThemeApply(aiTheme)}>Apply This Theme</Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
