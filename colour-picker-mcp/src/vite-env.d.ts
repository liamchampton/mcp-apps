/// <reference types="vite/client" />

interface EyeDropper {
  open(): Promise<{ sRGBHex: string }>;
}

declare const EyeDropper: {
  prototype: EyeDropper;
  new(): EyeDropper;
} | undefined;
