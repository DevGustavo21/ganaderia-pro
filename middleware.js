import { updateSession } from '@/lib/supabase/middleware';

export const middleware = (request) => updateSession(request);

export const config = {
  matcher: [
    // Ignora estáticos, imágenes y favicons
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
