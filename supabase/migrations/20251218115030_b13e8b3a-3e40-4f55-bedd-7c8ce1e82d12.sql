-- Add extracted_text column to screen_captures table for OCR results
ALTER TABLE public.screen_captures 
ADD COLUMN IF NOT EXISTS extracted_text TEXT;

-- Add ocr_processed_at to track when OCR was run
ALTER TABLE public.screen_captures 
ADD COLUMN IF NOT EXISTS ocr_processed_at TIMESTAMP WITH TIME ZONE;