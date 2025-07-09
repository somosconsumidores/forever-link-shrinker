-- Inserir um registro de teste para o usuário user04@teste.com
INSERT INTO public.subscribers (email, user_id, subscribed, subscription_tier)
VALUES ('user04@teste.com', (SELECT id FROM auth.users WHERE email = 'user04@teste.com'), true, 'Premium')
ON CONFLICT (email) DO UPDATE SET
  subscribed = true,
  subscription_tier = 'Premium',
  updated_at = now();