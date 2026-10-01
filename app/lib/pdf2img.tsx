import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
    const baseUrl = import.meta.env.BASE_URL;
    const pdfWorkerSrc = `${baseUrl}${workerSrc.replace(/^\/+/, "")}`;

    console.log("PDF.js version:", lib.version);
    console.log("PDF.js worker:", pdfWorkerSrc);

    lib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

    pdfjsLib = lib;
    return lib;
  });

  return loadPromise;
}

export async function convertPdfToImage(
  file: File
): Promise<PdfConversionResult> {
  try {
    console.log("1. File:", file.name);
    console.log("2. Loading PDF.js...");

    const lib = await loadPdfJs();

    console.log("3. PDF.js loaded");

    const arrayBuffer = await file.arrayBuffer();

    console.log("4. ArrayBuffer loaded:", arrayBuffer.byteLength);

    const pdf = await lib.getDocument({
      data: arrayBuffer,
    }).promise;

    console.log("5. PDF loaded, pages:", pdf.numPages);

    const page = await pdf.getPage(1);

    console.log("6. Page 1 loaded");

    const viewport = page.getViewport({
      scale: 4,
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!context) {
      return {
        imageUrl: "",
        file: null,
        error: "Failed to get canvas context",
      };
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    console.log("7. Rendering PDF...");

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    console.log("8. PDF rendered");

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to create image blob",
            });

            return;
          }

          const originalName = file.name.replace(/\.pdf$/i, "");

          const imageFile = new File(
            [blob],
            `${originalName}.png`,
            {
              type: "image/png",
            }
          );

          console.log("9. Image created:", imageFile.name);

          resolve({
            imageUrl: URL.createObjectURL(blob),
            file: imageFile,
          });
        },
        "image/png"
      );
    });
  } catch (err) {
    console.error("PDF CONVERSION ERROR:", err);

    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err}`,
    };
  }
}