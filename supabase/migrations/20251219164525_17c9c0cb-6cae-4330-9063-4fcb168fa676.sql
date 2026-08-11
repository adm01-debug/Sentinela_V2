-- Create table for message templates
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL DEFAULT 'violation_alert',
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  subject TEXT,
  body TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view message templates" 
ON public.message_templates 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can insert message templates" 
ON public.message_templates 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update message templates" 
ON public.message_templates 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Users can delete message templates" 
ON public.message_templates 
FOR DELETE 
TO authenticated
USING (is_default = false);

-- Create trigger for updated_at
CREATE TRIGGER update_message_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default templates
INSERT INTO public.message_templates (name, description, template_type, channel, body, variables, is_default) VALUES
(
  'Alerta de Violação Padrão',
  'Template padrão para alertas de violação via WhatsApp',
  'violation_alert',
  'whatsapp',
  '{{severity_emoji}} *ALERTA DE VIOLAÇÃO*

👤 Funcionário: {{employee_name}}
📋 Tipo: {{violation_type}}
🔒 Política: {{policy_name}}
⚠️ Severidade: {{severity}}
📝 Descrição: {{description}}
💻 Dispositivo: {{device}}
🕐 Data/Hora: {{timestamp}}

---
Sistema de Monitoramento SecureWatch',
  ARRAY['severity_emoji', 'employee_name', 'violation_type', 'policy_name', 'severity', 'description', 'device', 'timestamp'],
  true
),
(
  'Alerta Compacto',
  'Template resumido para alertas rápidos',
  'violation_alert',
  'whatsapp',
  '{{severity_emoji}} *Violação Detectada*
{{employee_name}} - {{violation_type}}
Severidade: {{severity}}
{{timestamp}}',
  ARRAY['severity_emoji', 'employee_name', 'violation_type', 'severity', 'timestamp'],
  false
),
(
  'Alerta Detalhado',
  'Template completo com todas as informações',
  'violation_alert',
  'whatsapp',
  '{{severity_emoji}} *ALERTA DE SEGURANÇA*

━━━━━━━━━━━━━━━━━━
📌 *DETALHES DA VIOLAÇÃO*
━━━━━━━━━━━━━━━━━━

👤 *Funcionário:* {{employee_name}}
📋 *Tipo de Violação:* {{violation_type}}
🔒 *Política Violada:* {{policy_name}}
⚠️ *Nível de Severidade:* {{severity}}

📝 *Descrição:*
{{description}}

💻 *Dispositivo:* {{device}}
📍 *Localização:* {{location}}
🌐 *IP:* {{ip_address}}
🕐 *Data/Hora:* {{timestamp}}

━━━━━━━━━━━━━━━━━━
⚡ Ação imediata pode ser necessária
━━━━━━━━━━━━━━━━━━

Sistema de Monitoramento SecureWatch',
  ARRAY['severity_emoji', 'employee_name', 'violation_type', 'policy_name', 'severity', 'description', 'device', 'location', 'ip_address', 'timestamp'],
  false
),
(
  'Alerta de Violação Email',
  'Template para alertas via email',
  'violation_alert',
  'email',
  '<h2>{{severity_emoji}} Alerta de Violação de Segurança</h2>
<p><strong>Funcionário:</strong> {{employee_name}}</p>
<p><strong>Tipo:</strong> {{violation_type}}</p>
<p><strong>Política:</strong> {{policy_name}}</p>
<p><strong>Severidade:</strong> {{severity}}</p>
<p><strong>Descrição:</strong> {{description}}</p>
<p><strong>Dispositivo:</strong> {{device}}</p>
<p><strong>Data/Hora:</strong> {{timestamp}}</p>
<hr>
<p><small>Sistema de Monitoramento SecureWatch</small></p>',
  ARRAY['severity_emoji', 'employee_name', 'violation_type', 'policy_name', 'severity', 'description', 'device', 'timestamp'],
  true
),
(
  'Mensagem de Teste',
  'Template para mensagens de teste',
  'test',
  'whatsapp',
  '🔔 *Mensagem de Teste*

Esta é uma mensagem de teste do Sistema de Monitoramento SecureWatch.

Se você recebeu esta mensagem, a integração está funcionando corretamente!

Data/Hora: {{timestamp}}',
  ARRAY['timestamp'],
  true
);