-- ============================================================
-- BUCKET backups: a edge backup-data faz upload em storage 'backups'
-- e o bucket nunca existiu (buckets reais: acknowledgment-photos,
-- session-recordings, violation-screenshots). Toda execucao falhava
-- com "Bucket not found".
-- Cria o bucket privado e libera escrita apenas para service_role
-- (a edge roda com SUPABASE_SERVICE_ROLE_KEY; service_role ignora RLS,
-- e as policies abaixo garantem que authenticated/anon nao escrevem).
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('backups', 'backups', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "backups_service_write" ON storage.objects;
CREATE POLICY "backups_service_write"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'backups');

DROP POLICY IF EXISTS "backups_service_read" ON storage.objects;
CREATE POLICY "backups_service_read"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'backups');
