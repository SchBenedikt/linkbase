'use client';

import { useState } from 'react';
import { Share2, QrCode, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  publicUrl: string;
}

export function ShareButton({ publicUrl }: ShareButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    toast({
      title: "Copied to clipboard!",
      description: "You can now share your profile.",
    });
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`;

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Share your page</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <img
              src={qrUrl}
              alt="QR code for your page"
              width={200}
              height={200}
              className="rounded-lg border"
            />
            <div className="flex w-full items-center gap-2">
              <p className="flex-1 truncate rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                {publicUrl}
              </p>
              <Button variant="outline" size="icon" onClick={handleCopy} aria-label="Copy link">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button className="w-full" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

