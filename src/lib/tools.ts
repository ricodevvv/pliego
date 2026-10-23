import type { Dictionary, Locale } from "./i18n";

export type Category = keyof Dictionary["categories"];

export interface Tool {
  slug: string;
  category: Category;
  icon: string;
  accept: string;
  multiple: boolean;
  office?: boolean;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  keywords: string;
}

const PDF = "application/pdf,.pdf";
const IMAGES = "image/*";

export const TOOLS: Tool[] = [
  {
    slug: "merge",
    category: "organize",
    icon: "combine",
    accept: PDF,
    multiple: true,
    title: { en: "Merge PDF", es: "Unir PDF" },
    description: { en: "Combine several PDFs into one, in the order you want.", es: "Junta varios PDFs en uno, en el orden que quieras." },
    keywords: "combine join juntar combinar",
  },
  {
    slug: "split",
    category: "organize",
    icon: "split",
    accept: PDF,
    multiple: false,
    title: { en: "Split PDF", es: "Dividir PDF" },
    description: { en: "Split a PDF by page ranges, into single pages, or pull out the pages you need.", es: "Divide un PDF por rangos, en páginas sueltas, o saca solo las páginas que necesitas." },
    keywords: "separate extract separar extraer",
  },
  {
    slug: "organize",
    category: "organize",
    icon: "layout-grid",
    accept: PDF,
    multiple: false,
    title: { en: "Organize pages", es: "Organizar páginas" },
    description: { en: "Reorder, rotate and delete pages by dragging them around.", es: "Reordena, gira y elimina páginas arrastrándolas." },
    keywords: "reorder delete sort reordenar eliminar borrar ordenar",
  },
  {
    slug: "rotate",
    category: "organize",
    icon: "rotate-cw",
    accept: PDF,
    multiple: false,
    title: { en: "Rotate PDF", es: "Girar PDF" },
    description: { en: "Rotate every page, or just the ones that came out sideways.", es: "Gira todas las páginas, o solo las que salieron de lado." },
    keywords: "turn girar voltear rotar",
  },
  {
    slug: "compress",
    category: "optimize",
    icon: "minimize-2",
    accept: PDF,
    multiple: true,
    title: { en: "Compress PDF", es: "Comprimir PDF" },
    description: { en: "Make PDFs smaller so they fit in an email or a form upload.", es: "Haz tus PDFs más ligeros para mandarlos por correo o subirlos a un trámite." },
    keywords: "reduce size shrink reducir peso tamaño",
  },
  {
    slug: "ocr",
    category: "optimize",
    icon: "scan-text",
    accept: PDF,
    multiple: false,
    title: { en: "OCR PDF", es: "OCR en PDF" },
    description: { en: "Turn scanned PDFs into searchable, copyable text.", es: "Convierte PDFs escaneados en texto que se puede buscar y copiar." },
    keywords: "scan text recognize escaneo reconocer texto",
  },
  {
    slug: "images-to-pdf",
    category: "toPdf",
    icon: "image-plus",
    accept: IMAGES,
    multiple: true,
    title: { en: "Images to PDF", es: "Imágenes a PDF" },
    description: { en: "Turn JPG, PNG and other images into a PDF.", es: "Convierte JPG, PNG y otras imágenes en un PDF." },
    keywords: "jpg png jpeg photo foto imagen",
  },
  {
    slug: "word-to-pdf",
    category: "toPdf",
    icon: "file-text",
    accept: ".doc,.docx,.odt,.rtf,.txt",
    multiple: true,
    office: true,
    title: { en: "Word to PDF", es: "Word a PDF" },
    description: { en: "Convert Word documents to PDF, keeping the layout.", es: "Convierte documentos de Word a PDF conservando el diseño." },
    keywords: "docx doc office documento",
  },
  {
    slug: "excel-to-pdf",
    category: "toPdf",
    icon: "sheet",
    accept: ".xls,.xlsx,.ods,.csv",
    multiple: true,
    office: true,
    title: { en: "Excel to PDF", es: "Excel a PDF" },
    description: { en: "Convert spreadsheets to PDF.", es: "Convierte hojas de cálculo a PDF." },
    keywords: "xlsx xls spreadsheet hoja calculo",
  },
  {
    slug: "powerpoint-to-pdf",
    category: "toPdf",
    icon: "presentation",
    accept: ".ppt,.pptx,.odp",
    multiple: true,
    office: true,
    title: { en: "PowerPoint to PDF", es: "PowerPoint a PDF" },
    description: { en: "Convert presentations to PDF, one slide per page.", es: "Convierte presentaciones a PDF, una diapositiva por página." },
    keywords: "pptx ppt slides diapositivas presentacion",
  },
  {
    slug: "pdf-to-images",
    category: "fromPdf",
    icon: "images",
    accept: PDF,
    multiple: false,
    title: { en: "PDF to images", es: "PDF a imágenes" },
    description: { en: "Save every page as a JPG or PNG image.", es: "Guarda cada página como imagen JPG o PNG." },
    keywords: "jpg png jpeg convert convertir",
  },
  {
    slug: "extract-text",
    category: "fromPdf",
    icon: "text-cursor-input",
    accept: PDF,
    multiple: false,
    title: { en: "Extract text", es: "Extraer texto" },
    description: { en: "Pull all the text out of a PDF into a plain text file.", es: "Saca todo el texto de un PDF a un archivo de texto." },
    keywords: "txt copy copiar texto",
  },
  {
    slug: "page-numbers",
    category: "edit",
    icon: "list-ordered",
    accept: PDF,
    multiple: false,
    title: { en: "Add page numbers", es: "Numerar páginas" },
    description: { en: "Number your pages, with the position and style you want.", es: "Pon números de página con la posición y el estilo que quieras." },
    keywords: "numbering paginate numeracion paginar",
  },
  {
    slug: "watermark",
    category: "edit",
    icon: "stamp",
    accept: PDF,
    multiple: false,
    title: { en: "Add watermark", es: "Marca de agua" },
    description: { en: "Stamp text or an image over every page.", es: "Estampa un texto o una imagen sobre cada página." },
    keywords: "stamp confidential sello confidencial",
  },
  {
    slug: "sign",
    category: "edit",
    icon: "signature",
    accept: PDF,
    multiple: false,
    title: { en: "Sign PDF", es: "Firmar PDF" },
    description: { en: "Draw, type or upload your signature and place it on the page.", es: "Dibuja, escribe o sube tu firma y colócala en la página." },
    keywords: "signature firma rubrica",
  },
  {
    slug: "fill-forms",
    category: "edit",
    icon: "form-input",
    accept: PDF,
    multiple: false,
    title: { en: "Fill PDF forms", es: "Llenar formularios" },
    description: { en: "Fill in the fields of a PDF form and save it.", es: "Llena los campos de un formulario PDF y guárdalo." },
    keywords: "form fields formulario campos",
  },
  {
    slug: "protect",
    category: "security",
    icon: "lock",
    accept: PDF,
    multiple: false,
    title: { en: "Protect PDF", es: "Proteger PDF" },
    description: { en: "Add a password so only the right people can open it.", es: "Ponle contraseña para que solo quien deba pueda abrirlo." },
    keywords: "password encrypt contraseña encriptar cifrar",
  },
  {
    slug: "unlock",
    category: "security",
    icon: "lock-open",
    accept: PDF,
    multiple: false,
    title: { en: "Unlock PDF", es: "Desbloquear PDF" },
    description: { en: "Remove the password and the print or copy restrictions.", es: "Quita la contraseña y las restricciones para imprimir o copiar." },
    keywords: "remove password decrypt quitar contraseña desencriptar",
  },
];

export const CATEGORIES: Category[] = ["organize", "optimize", "toPdf", "fromPdf", "edit", "security"];

export function findTool(slug: string) {
  return TOOLS.find((tool) => tool.slug === slug);
}
