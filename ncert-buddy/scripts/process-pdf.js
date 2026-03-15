#!/usr/bin/env node

/**
 * NCERT PDF Processing Script
 * 
 * Usage:
 *   node scripts/process-pdf.js --file="class10_maths_ch1.pdf" --class=10 --subject="Maths" --chapter=1 --chapter_name="Real Numbers"
 * 
 * This script:
 * 1. Downloads the PDF from Supabase Storage bucket "ncert-pdfs"
 * 2. Parses text using pdf-parse
 * 3. Splits into ~500 char chunks with 50 char overlap
 * 4. Gets 384-dim embeddings from HuggingFace
 * 5. Inserts chunks + embeddings into the documents table
 */

import { createClient } from '@supabase/supabase-js';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import { writeFileSync, unlinkSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse CLI arguments
function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--(\w+)=(.+)$/);
    if (match) {
      args[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  }
  return args;
}

const args = parseArgs();
const { file, class: classNum, subject, chapter, chapter_name } = args;

if (!file || !classNum || !subject || !chapter || !chapter_name) {
  console.error('Usage: node scripts/process-pdf.js --file="filename.pdf" --class=10 --subject="Maths" --chapter=1 --chapter_name="Real Numbers"');
  process.exit(1);
}

// Setup Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const huggingfaceKey = process.env.HUGGINGFACE_API_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

if (!huggingfaceKey) {
  console.error('Missing HUGGINGFACE_API_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Split text into chunks
function chunkText(text, chunkSize = 500, overlap = 50) {
  const chunks = [];
  let start = 0;
  const cleanText = text.replace(/\s+/g, ' ').trim();

  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length);
    chunks.push(cleanText.slice(start, end));
    start = end - overlap;
    if (start >= cleanText.length) break;
  }

  return chunks;
}

// Get embedding from HuggingFace
async function getEmbedding(text, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${huggingfaceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: text, options: { wait_for_model: true } }),
        }
      );

      if (response.status === 503) {
        console.log(`  Model loading, waiting 20s (attempt ${attempt}/${retries})...`);
        await new Promise((r) => setTimeout(r, 20000));
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HuggingFace API error ${response.status}: ${errorText}`);
      }

      const embedding = await response.json();
      return embedding;
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`  Retry ${attempt}/${retries}: ${err.message}`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

// Main
async function main() {
  console.log(`\n📄 Processing: ${file}`);
  console.log(`   Class ${classNum} | ${subject} | Chapter ${chapter}: ${chapter_name}\n`);

  // 1. Download PDF from Supabase Storage
  console.log('⬇️  Downloading PDF from Supabase Storage...');
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('ncert-pdfs')
    .download(file);

  if (downloadError) {
    console.error('Failed to download PDF:', downloadError.message);
    console.log('\nMake sure the file is uploaded to the "ncert-pdfs" bucket in Supabase Storage.');
    process.exit(1);
  }

  // Convert Blob to Buffer
  const buffer = Buffer.from(await fileData.arrayBuffer());
  console.log(`   Downloaded ${(buffer.length / 1024).toFixed(1)} KB`);

  // 2. Parse PDF
  console.log('📖 Parsing PDF...');
  const pdfData = await pdf(buffer);
  console.log(`   Extracted ${pdfData.text.length} characters from ${pdfData.numpages} pages`);

  // 3. Split into chunks
  const chunks = chunkText(pdfData.text);
  console.log(`✂️  Split into ${chunks.length} chunks (~500 chars each)`);

  // 4. Process each chunk
  let inserted = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (chunk.trim().length < 20) {
      console.log(`   Skipping chunk ${i + 1}/${chunks.length} (too short)`);
      continue;
    }

    process.stdout.write(`   Processing chunk ${i + 1} of ${chunks.length}...`);

    // Get embedding
    const embedding = await getEmbedding(chunk);

    // Insert into documents table
    const { error: insertError } = await supabase.from('documents').insert({
      class: parseInt(classNum),
      subject,
      chapter: parseInt(chapter),
      chapter_name,
      content: chunk,
      embedding: `[${embedding.join(',')}]`,
      source_file: file,
    });

    if (insertError) {
      console.log(` ❌ Error: ${insertError.message}`);
    } else {
      inserted++;
      console.log(' ✅');
    }

    // Rate limit: small delay between HuggingFace calls
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n🎉 Done. Inserted ${inserted} chunks for Class ${classNum} ${subject} Chapter ${chapter}.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
