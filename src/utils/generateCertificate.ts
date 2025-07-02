import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateCertificate(
  templatePdfUrl: string,
  fieldPositions: { field: string; x: number; y: number }[],
  data: Record<string, string>
): Promise<Uint8Array> {
  const existingPdfBytes = await fetch(templatePdfUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontCourier = await pdfDoc.embedFont(StandardFonts.CourierBoldOblique);

  fieldPositions.forEach(({ field, x, y }) => {
    const text = data[field] || "";
    page.drawText(text, {
      x,
      y,
      size: field==="name"?56:16,
      font:field==="name"?font:fontCourier,
      color: rgb(50/255 ,0/255, 171/255),
    });
  });

  return await pdfDoc.save();
}
