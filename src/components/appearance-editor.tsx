'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { AppearanceSettings } from '@/lib/types';

interface AppearanceEditorProps {
  initialSettings: AppearanceSettings;
  onSave: (settings: AppearanceSettings) => void;
  onCancel: () => void;
}

const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) => (
    <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
            <Input 
                type="text" 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-32"
                placeholder="#ffffff"
            />
            <div className="w-8 h-8 rounded-md border" style={{ backgroundColor: value }} />
        </div>
    </div>
);

export function AppearanceEditor({ initialSettings, onSave, onCancel }: AppearanceEditorProps) {
    const [settings, setSettings] = useState<AppearanceSettings>(initialSettings);

    const handleSave = () => {
        onSave(settings);
    };

    const updateSetting = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            <Accordion type="multiple" defaultValue={['background', 'colors']} className="w-full">
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
                        </div>
                        <ColorInput 
                            label="Background Color"
                            value={settings.backgroundColor || '#ffffff'}
                            onChange={(value) => updateSetting('backgroundColor', value)}
                        />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="colors">
                    <AccordionTrigger>Colors</AccordionTrigger>
                    <AccordionContent className="grid grid-cols-2 gap-4 pt-4">
                        <ColorInput 
                            label="Primary"
                            value={settings.primaryColor || '#000000'}
                            onChange={(value) => updateSetting('primaryColor', value)}
                        />
                        <ColorInput 
                            label="Accent"
                            value={settings.accentColor || '#333333'}
                            onChange={(value) => updateSetting('accentColor', value)}
                        />
                        <ColorInput 
                            label="Text"
                            value={settings.foregroundColor || '#000000'}
                            onChange={(value) => updateSetting('foregroundColor', value)}
                        />
                        <ColorInput 
                            label="Card"
                            value={settings.cardColor || '#ffffff'}
                            onChange={(value) => updateSetting('cardColor', value)}
                        />
                        <ColorInput 
                            label="Card Text"
                            value={settings.cardForegroundColor || '#000000'}
                            onChange={(value) => updateSetting('cardForegroundColor', value)}
                        />
                        <ColorInput 
                            label="Border"
                            value={settings.borderColor || '#eeeeee'}
                            onChange={(value) => updateSetting('borderColor', value)}
                        />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="layout">
                    <AccordionTrigger>Layout & Borders</AccordionTrigger>
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
                            <Label>Border Width: {settings.borderWidth ?? 1}px</Label>
                            <Slider
                                min={0} max={8} step={1}
                                defaultValue={[settings.borderWidth ?? 1]}
                                onValueChange={(value) => updateSetting('borderWidth', value[0])}
                            />
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button onClick={handleSave}>Save Appearance</Button>
            </div>
        </div>
    );
}
