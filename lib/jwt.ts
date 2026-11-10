import { SignJWT, jwtVerify } from 'jose';

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET no está configurado en el entorno');
  }
  
  if (secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  }
  
  return new TextEncoder().encode(secret);
}

export async function createToken(userId: string): Promise<string> {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new Error('userId debe ser un string no vacío');
  }
  
  const secretKey = getSecretKey();
  
  return await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const secretKey = getSecretKey();
    
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    
    if (!payload.sub || typeof payload.sub !== 'string' || payload.sub.trim() === '') {
      return null;
    }
    
    if (!payload.iat || !payload.exp) {
      return null;
    }
    
    return payload.sub;
  } catch (error) {
    return null;
  }
}
