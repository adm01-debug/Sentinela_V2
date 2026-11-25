-- Preenche company_id nas tabelas de tenant quando o dono é inequívoco, para
-- que as escritas que já existem (edges com service_role) passem a nascer com
-- empresa sem precisar mudar o código de cada chamador. Quando o nome é
-- homônimo entre empresas ou o criador pertence a mais de uma, o campo fica
-- NULL (comportamento de antes) — o trigger nunca escolhe no escuro.

CREATE OR REPLACE FUNCTION public.preenche_company_id_do_funcionario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_empresa uuid;
BEGIN
  IF NEW.company_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.employee_name IS NULL OR NEW.employee_name = '' THEN
    RETURN NEW;
  END IF;

  -- count(DISTINCT company_id) = 1 garante que o nome só exista em uma empresa:
  -- duas empresas com o mesmo nome de funcionário não podem ser desempatadas.
  SELECT min(e.company_id::text)::uuid INTO v_empresa
  FROM public.employees e
  WHERE e.name = NEW.employee_name
    AND e.company_id IS NOT NULL
  HAVING count(DISTINCT e.company_id) = 1;

  NEW.company_id := v_empresa;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.preenche_company_id_do_criador()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_empresa uuid;
BEGIN
  IF NEW.company_id IS NOT NULL OR NEW.created_by IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT min(uc.company_id::text)::uuid INTO v_empresa
  FROM public.user_companies uc
  WHERE uc.user_id = NEW.created_by
  GROUP BY uc.user_id
  HAVING count(*) = 1;

  NEW.company_id := v_empresa;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS preenche_company_id ON public.security_violations;
CREATE TRIGGER preenche_company_id
  BEFORE INSERT ON public.security_violations
  FOR EACH ROW EXECUTE FUNCTION public.preenche_company_id_do_funcionario();

DROP TRIGGER IF EXISTS preenche_company_id ON public.geofence_violations;
CREATE TRIGGER preenche_company_id
  BEFORE INSERT ON public.geofence_violations
  FOR EACH ROW EXECUTE FUNCTION public.preenche_company_id_do_funcionario();

DROP TRIGGER IF EXISTS preenche_company_id ON public.mobile_devices;
CREATE TRIGGER preenche_company_id
  BEFORE INSERT ON public.mobile_devices
  FOR EACH ROW EXECUTE FUNCTION public.preenche_company_id_do_funcionario();

DROP TRIGGER IF EXISTS preenche_company_id ON public.webhooks;
CREATE TRIGGER preenche_company_id
  BEFORE INSERT ON public.webhooks
  FOR EACH ROW EXECUTE FUNCTION public.preenche_company_id_do_criador();