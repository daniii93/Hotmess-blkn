declare module "qrcode" {
  export function toBuffer(
    text: string,
    options?: {
      width?: number;
      margin?: number;
      color?: { dark?: string; light?: string };
    },
  ): Promise<Buffer>;
}
