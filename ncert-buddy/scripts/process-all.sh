#!/bin/bash
# =================================================================
# NCERT Buddy — Batch PDF Processing Script
# =================================================================
# 
# This script processes all NCERT PDFs in sequence.
# 
# SETUP:
# 1. Upload all PDFs to Supabase Storage → "ncert-pdfs" bucket
# 2. Set environment variables in .env.local
# 3. Run: bash scripts/process-all.sh
#
# To add more chapters, add more lines following the same pattern.
# =================================================================

set -e

echo "🚀 Starting batch PDF processing..."
echo "============================================"

# Export environment variables from .env.local
export $(grep -v '^#' .env.local | xargs)

# ---- CLASS 10 MATHS ----
# node --env-file=.env.local scripts/process-pdf.js --file="class10_maths_ch1.pdf" --class=10 --subject="Maths" --chapter=1 --chapter_name="Real Numbers"
# node --env-file=.env.local scripts/process-pdf.js --file="class10_maths_ch2.pdf" --class=10 --subject="Maths" --chapter=2 --chapter_name="Polynomials"
# node --env-file=.env.local scripts/process-pdf.js --file="class10_maths_ch3.pdf" --class=10 --subject="Maths" --chapter=3 --chapter_name="Pair of Linear Equations in Two Variables"
# node --env-file=.env.local scripts/process-pdf.js --file="class10_maths_ch4.pdf" --class=10 --subject="Maths" --chapter=4 --chapter_name="Quadratic Equations"

# ---- CLASS 10 SCIENCE ----
# node --env-file=.env.local scripts/process-pdf.js --file="class10_science_ch1.pdf" --class=10 --subject="Science" --chapter=1 --chapter_name="Chemical Reactions and Equations"
# node --env-file=.env.local scripts/process-pdf.js --file="class10_science_ch6.pdf" --class=10 --subject="Science" --chapter=6 --chapter_name="Life Processes"
# node --env-file=.env.local scripts/process-pdf.js --file="class10_science_ch8.pdf" --class=10 --subject="Science" --chapter=8 --chapter_name="How do Organisms Reproduce?"

# ---- ADD MORE HERE ----
# Uncomment the lines above and add more chapters as you upload PDFs.
# The filenames should match what you uploaded to Supabase Storage.

echo ""
echo "============================================"
echo "✅ All PDFs processed!"
