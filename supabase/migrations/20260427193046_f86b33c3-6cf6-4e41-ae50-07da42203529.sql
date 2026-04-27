-- Enum de papéis
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Tabela de papéis
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função has_role (SECURITY DEFINER para evitar recursão em RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Policies user_roles: usuário vê os próprios papéis; admin vê e gerencia tudo
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================
-- Devocionais
-- ============================
CREATE TABLE public.devocionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  versiculo TEXT NOT NULL,
  referencia TEXT NOT NULL,
  meditacao TEXT NOT NULL,
  oracao TEXT,
  post_url TEXT,
  cta_nivel SMALLINT NOT NULL DEFAULT 1 CHECK (cta_nivel BETWEEN 1 AND 3),
  publicado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.devocionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Devocionais publicados são públicos"
  ON public.devocionais FOR SELECT
  TO anon, authenticated
  USING (publicado = true AND data <= CURRENT_DATE);

CREATE POLICY "Admins veem todos os devocionais"
  ON public.devocionais FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins gerenciam devocionais"
  ON public.devocionais FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================
-- Histórias de transformação
-- ============================
CREATE TYPE public.historia_status AS ENUM ('pendente', 'aprovada', 'rejeitada');

CREATE TABLE public.historias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL CHECK (char_length(nome) <= 100),
  cidade TEXT CHECK (char_length(cidade) <= 100),
  contato TEXT CHECK (char_length(contato) <= 200),
  depoimento TEXT NOT NULL CHECK (char_length(depoimento) BETWEEN 20 AND 3000),
  consentimento BOOLEAN NOT NULL DEFAULT false,
  status public.historia_status NOT NULL DEFAULT 'pendente',
  destaque BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.historias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Histórias aprovadas são públicas"
  ON public.historias FOR SELECT
  TO anon, authenticated
  USING (status = 'aprovada' AND consentimento = true);

CREATE POLICY "Admins veem todas as histórias"
  ON public.historias FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Qualquer pessoa pode enviar história"
  ON public.historias FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pendente' AND destaque = false);

CREATE POLICY "Admins gerenciam histórias"
  ON public.historias FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins apagam histórias"
  ON public.historias FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================
-- Pedidos de oração (sigilo total)
-- ============================
CREATE TABLE public.pedidos_oracao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT CHECK (char_length(nome) <= 100),
  contato TEXT CHECK (char_length(contato) <= 200),
  pedido TEXT NOT NULL CHECK (char_length(pedido) BETWEEN 5 AND 2000),
  anonimo BOOLEAN NOT NULL DEFAULT false,
  atendido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pedidos_oracao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode pedir oração"
  ON public.pedidos_oracao FOR INSERT
  TO anon, authenticated
  WITH CHECK (atendido = false);

CREATE POLICY "Apenas admins leem pedidos"
  ON public.pedidos_oracao FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins gerenciam pedidos"
  ON public.pedidos_oracao FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins apagam pedidos"
  ON public.pedidos_oracao FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============================
-- Plano de leitura
-- ============================
CREATE TABLE public.plano_leitura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  referencia TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plano_leitura ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plano de leitura é público"
  ON public.plano_leitura FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins gerenciam plano"
  ON public.plano_leitura FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================
-- Trigger updated_at
-- ============================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_devocionais_updated
  BEFORE UPDATE ON public.devocionais
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_historias_updated
  BEFORE UPDATE ON public.historias
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Índices úteis
CREATE INDEX idx_devocionais_data ON public.devocionais (data DESC);
CREATE INDEX idx_historias_status ON public.historias (status, created_at DESC);
CREATE INDEX idx_pedidos_atendido ON public.pedidos_oracao (atendido, created_at DESC);
CREATE INDEX idx_plano_data ON public.plano_leitura (data DESC);