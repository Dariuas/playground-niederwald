import QRCode from "qrcode";

export async function generateQRDataURL(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 280,
    margin: 2,
    color: { dark: "#0f766e", light: "#ffffff" },
  });
}
