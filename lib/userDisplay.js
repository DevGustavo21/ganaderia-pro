// Helpers para mostrar de forma consistente el usuario autenticado,
// sin importar si entró con email, Google u otro provider.

export const getDisplayName = (user) => {
  if (!user) return '';
  const meta = user.user_metadata || {};
  return (
    meta.full_name ||
    meta.name ||
    meta.preferred_username ||
    [meta.given_name, meta.family_name].filter(Boolean).join(' ').trim() ||
    user.email?.split('@')[0] ||
    'Usuario'
  );
};

export const getAvatarUrl = (user) => {
  if (!user) return null;
  const meta = user.user_metadata || {};
  return meta.avatar_url || meta.picture || null;
};

export const getProvider = (user) => {
  if (!user) return '';
  return (
    user.app_metadata?.provider ||
    user.identities?.[0]?.provider ||
    'email'
  );
};

// Forma plana segura para pasar de server → client (evita
// objetos no serializables en eventos custom).
export const toDisplayUser = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email || '',
    name: getDisplayName(user),
    avatarUrl: getAvatarUrl(user),
    provider: getProvider(user),
    plan: user.user_metadata?.plan || 'Free',
  };
};
