import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PdfPreviewProps {
  pdfUrl: string;
  onRendered: (imageDataUrl: string) => void;
}

export default function PdfPreview({ pdfUrl, onRendered }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
//  const renderPDF = async () => {
//   const loadingTask = pdfjsLib.getDocument(pdfUrl);
//   const pdf = await loadingTask.promise;
//   const page = await pdf.getPage(1);

//   const rotation = page.rotate; // 0, 90, 180, 270
//   const scale = 1.5;
//   const unrotatedViewport = page.getViewport({ scale, rotation: 0 });
//   const rotatedViewport = page.getViewport({ scale });

//   const canvas = canvasRef.current!;
//   const context = canvas.getContext("2d")!;

//   // Handle canvas size
//   canvas.width = rotatedViewport.width;
//   canvas.height = rotatedViewport.height;

//   context.save();

//   // Apply correct translation + rotation without mirroring
//   switch (rotation) {
//     case 90:
//     case 0:
//       context.translate(canvas.width, 0);
//       context.rotate((90 * Math.PI) / 180);
//       break;
//     case 180:
//       context.translate(canvas.width, canvas.height);
//       context.rotate((180 * Math.PI) / 180);
//       break;
//     case 270:
//       context.translate(0, canvas.height);
//       context.rotate((270 * Math.PI) / 180);
//       break;
//     default:
//       // No rotation
//       break;
//   }

//   await page.render({
//     canvasContext: context,
//     viewport: unrotatedViewport, // always render unrotated
//   }).promise;

//   context.restore();

//   const imageDataUrl = canvas.toDataURL("image/png");
//   onRendered(imageDataUrl);
// };
const renderPDF = async () => {
  const loadingTask = pdfjsLib.getDocument(pdfUrl);
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  const scale = 1.0; // use 1 for real resolution, or adjust if needed
  const desiredWidth = 842;
  const desiredHeight = 595;

  const rotation = page.rotate; // PDF internal rotation
  const originalViewport = page.getViewport({ scale: 1.0 });
  const rotatedViewport = page.getViewport({ scale });

  const canvas = canvasRef.current!;
  const context = canvas.getContext("2d")!;

  // Always set canvas to landscape output
  canvas.width = desiredWidth;
  canvas.height = desiredHeight;

  context.save();

  // Fit PDF viewport inside desired canvas size (auto-scale)
  const scaleX = desiredWidth / rotatedViewport.width;
  const scaleY = desiredHeight / rotatedViewport.height;
  const scaleToUse = Math.min(scaleX, scaleY);

  // Set up proper transform to rotate & center content
  switch (rotation) {
    // case 0:
    case 90:
      context.translate(canvas.width-200, 0);
      context.rotate((90 * Math.PI) / 180);
      break;
    case 180:
      context.translate(canvas.width, canvas.height);
      context.rotate((180 * Math.PI) / 180);
      break;
    case 270:
      context.translate(0, canvas.height);
      context.rotate((270 * Math.PI) / 180);
      break;
    default:
      // No rotation
      break;
  }

  // Scale down PDF page to fit into desired canvas size
  const scaledViewport = page.getViewport({ scale: scaleToUse });

  await page.render({
    canvasContext: context,
    viewport: scaledViewport,
  }).promise;

  context.restore();

  // Extract PNG
  const imageDataUrl = canvas.toDataURL("image/png");
  onRendered(imageDataUrl);
};



    renderPDF();
  }, [pdfUrl]);

  return <canvas ref={canvasRef} style={{ display: "none" }} />;
}
