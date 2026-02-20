import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hexToHsl(H: string | undefined): string {
  if (!H) return '0 0% 0%';
  let r = 0, g = 0, b = 0;
  if (H.length == 4) {
    r = Number("0x" + H[1] + H[1]);
    g = Number("0x" + H[2] + H[2]);
    b = Number("0x" + H[3] + H[3]);
  } else if (H.length == 7) {
    r = Number("0x" + H[1] + H[2]);
    g = Number("0x" + H[3] + H[4]);
    b = Number("0x" + H[5] + H[6]);
  }
  r /= 255; g /= 255; b /= 255;
  let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, h = 0, s = 0, l = 0;
  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);
  return `${h} ${s}% ${l}%`;
};

export function getContrastColor(H: string | undefined): string {
    if (!H) return '0 0% 98%'; // default to light text
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
      r = Number("0x" + H[1] + H[1]);
      g = Number("0x" + H[2] + H[2]);
      b = Number("0x" + H[3] + H[3]);
    } else if (H.length == 7) {
      r = Number("0x" + H[1] + H[2]);
      g = Number("0x" + H[3] + H[4]);
      b = Number("0x" + H[5] + H[6]);
    }
    // http://www.w3.org/TR/AERT#color-contrast
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '240 10% 3.9%' : '0 0% 98%'; // return dark or light HSL string
};
