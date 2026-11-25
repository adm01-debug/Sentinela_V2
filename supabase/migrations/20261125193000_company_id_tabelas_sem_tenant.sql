-- Põe dono de empresa nas tabelas que hoje não têm tenant. As edges que as
-- consultam usam service_role (ignora RLS), então o escopo de empresa nelas
-- filtrava por `company_id` de tabelas onde a coluna não existia.
--
-- Aditivo e conservador: coluna anulável, backfill só quando o dono é
-- inequívoco (criador com uma única empresa, nome de funcionário único na base)
-- e política RESTRICTIVE que mantém visível o que ainda não tem empresa —
-- nenhum dado existente deixa de ser lido.

ALTER TABLE public.security_violations
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.geofence_violations
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.mobile_devices
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
ALTER TABLE public.webhooks
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_security_violations_company_id
  ON public.security_violations(company_id);
CREATE INDEX IF NOT EXISTS idx_geofence_violations_company_id
  ON public.geofence_violations(company_id);
CREATE INDEX IF NOT EXISTS idx_mobile_devices_company_id
  ON public.mobile_devices(company_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_company_id
  ON public.webhooks(company_id);

-- webhooks: dono pelo criador, quando ele pertence a uma única empresa.
UPDATE public.webhooks w
SET company_id = unico.company_id
FROM (
  SELECT user_id, min(company_id::text)::uuid AS company_id
  FROM public.user_companies
  GROUP BY user_id
  HAVING count(*) = 1
) unico
WHERE w.company_id IS NULL
  AND w.created_by = unico.user_id;

-- Violações e devices: dono pelo funcionário citado, quando o nome identifica
-- uma única empresa. Nome repetido entre empresas fica NULL de propósito
-- (ambíguo) e continua visível como antes.
UPDATE public.security_violations v
SET company_id = dono.company_id
FROM (
  SELECT name, min(company_id::text)::uuid AS company_id
  FROM public.employees
  WHERE company_id IS NOT NULL
  GROUP BY name
  HAVING count(*) = 1
) dono
WHERE v.company_id IS NULL
  AND v.employee_name = dono.name;

UPDATE public.geofence_violations v
SET company_id = dono.company_id
FROM (
  SELECT name, min(company_id::text)::uuid AS company_id
  FROM public.employees
  WHERE company_id IS NOT NULL
  GROUP BY name
  HAVING count(*) = 1
) dono
WHERE v.company_id IS NULL
  AND v.employee_name = dono.name;

UPDATE public.mobile_devices d
SET company_id = dono.company_id
FROM (
  SELECT name, min(company_id::text)::uuid AS company_id
  FROM public.employees
  WHERE company_id IS NOT NULL
  GROUP BY name
  HAVING count(*) = 1
) dono
WHERE d.company_id IS NULL
  AND d.employee_name = dono.name;

-- Escopo por empresa nas leituras. RESTRICTIVE soma-se às políticas que já
-- existem (por papel), então só remove o acesso cruzado entre empresas: linha
-- sem empresa e usuário com papel admin (app_role tem apenas 'admin' e 'user')
-- continuam enxergando como antes.
DROP POLICY IF EXISTS "Escopo de empresa" ON public.security_violations;
CREATE POLICY "Escopo de empresa" ON public.security_violations
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    OR COALESCE(public.has_role(auth.uid(), 'admin'), false)
    OR COALESCE(public.user_in_company(auth.uid(), company_id), false)
  );

DROP POLICY IF EXISTS "Escopo de empresa" ON public.geofence_violations;
CREATE POLICY "Escopo de empresa" ON public.geofence_violations
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    OR COALESCE(public.has_role(auth.uid(), 'admin'), false)
    OR COALESCE(public.user_in_company(auth.uid(), company_id), false)
  );

DROP POLICY IF EXISTS "Escopo de empresa" ON public.mobile_devices;
CREATE POLICY "Escopo de empresa" ON public.mobile_devices
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    OR COALESCE(public.has_role(auth.uid(), 'admin'), false)
    OR COALESCE(public.user_in_company(auth.uid(), company_id), false)
  );

DROP POLICY IF EXISTS "Escopo de empresa" ON public.webhooks;
CREATE POLICY "Escopo de empresa" ON public.webhooks
  AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    company_id IS NULL
    OR COALESCE(public.has_role(auth.uid(), 'admin'), false)
    OR COALESCE(public.user_in_company(auth.uid(), company_id), false)
  );