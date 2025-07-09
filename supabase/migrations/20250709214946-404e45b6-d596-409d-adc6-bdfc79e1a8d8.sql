-- Inserir plano Pro anual para o usuário short04@teste.com
INSERT INTO public.subscribers (
  email,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at
) VALUES (
  'short04@teste.com',
  true,
  'Pro',
  (NOW() + INTERVAL '1 year'),
  NOW(),
  NOW()
)
ON CONFLICT (email) 
DO UPDATE SET
  subscribed = true,
  subscription_tier = 'Pro',
  subscription_end = (NOW() + INTERVAL '1 year'),
  updated_at = NOW();