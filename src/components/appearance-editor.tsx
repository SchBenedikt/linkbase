'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { AppearanceSettings } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AppearanceEditorProps {
  initialSettings: AppearanceSettings;
  onSave: (settings: AppearanceSettings) => void;
  onCancel: () => void;
}

const FONT_OPTIONS = [
  { label: 'Bricolage Grotesque (Default)', value: 'Bricolage Grotesque' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Lora (Serif)', value: 'Lora' },
  { label: 'Playfair Display (Elegant)', value: 'Playfair Display' },
  { label: 'Space Grotesk', value: 'Space Grotesk' },
  { label: 'DM Sans', value: 'DM Sans' },
  { label: 'Source Code Pro (Mono)', value: 'Source Code Pro' },
  { label: 'Raleway', value: 'Raleway' },
  { label: 'Nunito', value: 'Nunito' },
  { label: 'Poppins', value: 'Poppins' },
];

/** Color input that combines a native color picker with a hex text field */
const ColorInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const safeValue = value?.startsWith('#') ? value : '#ffffff';
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        {/* Native colour wheel */}
        <label
          className="relative flex-shrink-0 w-8 h-8 rounded-md border overflow-hidden cursor-pointer"
          style={{ backgroundColor: safeValue }}
          title="Pick colour"
        >
          <input
            type="color"
            value={safeValue}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
        </label>
        {/* Hex text field */}
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 text-xs w-28 font-mono"
          placeholder="#ffffff"
          maxLength={7}
        />
      </div>
    </div>
  );
};

export function AppearanceEditor({ initialSettings, onSave, onCancel }: AppearanceEditorProps) {
  const [settings, setSettings] = useState<AppearanceSettings>(initialSettings);

  const updateSetting = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={['background', 'colors', 'layout']} className="w-full">
        <AccordionItem value="background">
          <AccordionTrigger>Background</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Background Image URL</Label>
              <Input
                placeholder="https://..."
                value={settings.backgroundImage || ''}
                onChange={(e) => updateSetting('backgroundImage', e.target.value)}
              />
              {settings.backgroundImage && (
                <div className="mt-1 h-20 rounded-md overflow-hidden border">
                  <img
                    src={settings.backgroundImage}
                    alt="bg preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
            <ColorInput
              label="Background Color (fallback)"
              value={settings.backgroundColor || '#ffffff'}
              onChange={(value) => updateSetting('backgroundColor', value)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="typography">
          <AccordionTrigger>Typography</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={settings.fontFamily}
                onValueChange={(value) => updateSetting('fontFamily', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(f => (
                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colors">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <ColorInput label="Primary" value={settings.primaryColor || '#000000'} onChange={(v) => updateSetting('primaryColor', v)} />
              <ColorInput label="Accent" value={settings.accentColor || '#333333'} onChange={(v) => updateSetting('accentColor', v)} />
              <ColorInput label="Text" value={settings.foregroundColor || '#000000'} onChange={(v) => updateSetting('foregroundColor', v)} />
              <ColorInput label="Card Background" value={settings.cardColor || '#ffffff'} onChange={(v) => updateSetting('cardColor', v)} />
              <ColorInput label="Card Text" value={settings.cardForegroundColor || '#000000'} onChange={(v) => updateSetting('cardForegroundColor', v)} />
              <ColorInput label="Border" value={settings.borderColor || '#eeeeee'} onChange={(v) => updateSetting('borderColor', v)} />
            </div>
            {/* Quick dark palette */}
            <div className="mt-4 space-y-2">
              <Label className="text-xs text-muted-foreground">Quick presets</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Light', bg: '#f9fafb', card: '#ffffff', fg: '#111827', cardFg: '#111827' },
                  { label: 'Dark', bg: '#111827', card: '#1f2937', fg: '#f9fafb', cardFg: '#f9fafb' },
                  { label: 'Warm', bg: '#fdf4e3', card: '#fffbf0', fg: '#3b1f06', cardFg: '#3b1f06' },
                  { label: 'Ocean', bg: '#0d1b2a', card: '#1b3045', fg: '#e0f2fe', cardFg: '#e0f2fe' },
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSettings(s => ({ ...s, backgroundColor: preset.bg, cardColor: preset.card, foregroundColor: preset.fg, cardForegroundColor: preset.cardFg }))}
                    className="text-xs px-2 py-1 rounded border hover:bg-accent transition-colors"
                    style={{ background: preset.bg, color: preset.fg, borderColor: preset.cardFg + '33' }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="layout">
          <AccordionTrigger>Layout &amp; Borders</AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Corner Radius: {settings.borderRadius ?? 1.25}rem</Label>
              <Slider
                min={0} max={4} step={0.125}
                defaultValue={[settings.borderRadius ?? 1.25]}
                onValueChange={(value) => updateSetting('borderRadius', value[0])}
              />
            </div>
            <div className="space-y-2">
              <Label>Border Width: {settings.borderWidth ?? 0}px</Label>
              <Slider
                min={0} max={8} step={1}
                defaultValue={[settings.borderWidth ?? 0]}
                onValueChange={(value) => updateSetting('borderWidth', value[0])}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(settings)}>Save Appearance</Button>
      </div>
    </div>
  );
}
