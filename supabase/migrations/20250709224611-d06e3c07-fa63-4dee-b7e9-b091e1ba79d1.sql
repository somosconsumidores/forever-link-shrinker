-- Atualizar o registro para o usuário correto
UPDATE public.subscribers 
SET 
  email = 'short04@teste.com',
  user_id = '8253a76c-d313-4aed-85b9-85f6e9175b12'
WHERE email = 'user04@teste.com';

-- Inserir também um registro específico se for necessário para user04@teste.com
INSERT INTO public.subscribers (email, user_id, subscribed, subscription_tier)
VALUES ('user04@teste.com', NULL, true, 'Premium')
ON CONFLICT (email) DO UPDATE SET
  subscribed = true,
  subscription_tier = 'Premium',
  updated_at = now();