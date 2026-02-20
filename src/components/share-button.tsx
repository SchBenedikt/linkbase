'use client';

import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  publicUrl: string;
}

export function ShareButton({ publicUrl }: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(publicUrl);
    toast({
      title: "Copied to clipboard!",
      description: "You can now share your BioBloom profile.",
    });
  };

  return (
    <Button variant="outline" onClick={handleShare}>
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
