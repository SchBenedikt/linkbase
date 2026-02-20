'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-40">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
      Generate
    </Button>
  );
}

export function AiThemeGenerator({ onThemeApply }: AiThemeGeneratorProps) {
  const initialState = { error: '', data: null };
  const [state, dispatch] = useActionState(generateTheme, initialState);
  
  const aiTheme: AITheme | null = state.data;

  return (
    <div className="space-y-6">
      <form action={dispatch} className="flex flex-col sm:flex-row gap-2">
        <Input
          name="keywords"
          placeholder="e.g. '80s synthwave', 'minimalist dark', 'forest cabin'"
          required
        />
        <SubmitButton />
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
