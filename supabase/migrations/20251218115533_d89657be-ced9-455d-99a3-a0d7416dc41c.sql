-- Add UPDATE policy for screen_captures so OCR can save extracted text
CREATE POLICY "Admins can update screen captures" 
ON public.screen_captures 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));