import PDFDocument from "pdfkit";
import { COURSE_LABEL } from "./types";
import type { Book, Household, Recipe } from "./types";
import { recipesForBook } from "./store";

function collectPdf(doc: PDFKit.PDFDocument): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

export async function renderCookbookPdf(input: { household: Household; book: Book; recipes: Recipe[] }): Promise<Buffer> {
  const recipes = recipesForBook(input.recipes);
  const doc = new PDFDocument({ size: "LETTER", margin: 54, info: { Title: input.book.title, Author: input.household.name } });
  const done = collectPdf(doc);

  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#e7d3a8");
  doc.fillColor("#1f160e");
  doc.font("Times-Roman").fontSize(13).text("Kept Book", 54, 72);
  doc.moveDown(1.5);
  doc.font("Times-Bold").fontSize(32).text(input.book.title, { width: 504 });
  if (input.book.dedication.trim()) {
    doc.moveDown(1);
    doc.font("Times-Italic").fontSize(14).text(input.book.dedication, { width: 504 });
  }
  doc.moveDown(2);
  doc.font("Times-Roman").fontSize(12).text(`${recipes.length} cards from the ${input.household.name} box.`);
  doc.text(`Invite stays in the kitchen. This file is for print.`);

  doc.addPage();
  doc.font("Times-Bold").fontSize(18).text("Cards in this book");
  doc.moveDown();
  doc.font("Times-Roman").fontSize(12);
  for (const recipe of recipes) {
    doc.text(`${COURSE_LABEL[recipe.course]} — ${recipe.title}  (${recipe.fromWhom})`);
  }

  for (const recipe of recipes) {
    doc.addPage();
    doc.font("Times-Roman").fontSize(11).fillColor("#6e1c28").text(COURSE_LABEL[recipe.course].toUpperCase());
    doc.fillColor("#1f160e");
    doc.moveDown(0.4);
    doc.font("Times-Bold").fontSize(22).text(recipe.title);
    doc.font("Times-Italic").fontSize(12).text(`From the kitchen of ${recipe.fromWhom}`);
    if (recipe.servings) {
      doc.font("Times-Roman").fontSize(11).text(recipe.servings);
    }
    if (recipe.story.trim()) {
      doc.moveDown(0.6);
      doc.font("Times-Italic").fontSize(12).text(recipe.story, { width: 504 });
    }
    doc.moveDown(0.8);
    doc.font("Times-Bold").fontSize(12).text("Ingredients");
    doc.font("Times-Roman").fontSize(12);
    for (const line of recipe.ingredients) {
      doc.text(`• ${line}`);
    }
    doc.moveDown(0.6);
    doc.font("Times-Bold").fontSize(12).text("Method");
    doc.font("Times-Roman").fontSize(12);
    recipe.steps.forEach((step, index) => {
      doc.text(`${index + 1}. ${step}`);
    });
    if (recipe.notes.trim()) {
      doc.moveDown(0.6);
      doc.font("Times-Italic").fontSize(11).text(recipe.notes);
    }
  }

  doc.end();
  return done;
}

export function gelatoConfigured(): boolean {
  return Boolean(process.env.GELATO_API_KEY?.trim());
}
