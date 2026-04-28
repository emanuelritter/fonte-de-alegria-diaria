-- Concede role admin ao usuário emanuelritter@gmail.com
-- ID: 00f0637b-c3dc-4752-9620-b32ba11f832a
INSERT INTO public.user_roles (user_id, role)
VALUES ('00f0637b-c3dc-4752-9620-b32ba11f832a', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
