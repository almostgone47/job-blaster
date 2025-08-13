import {Request, Response, NextFunction} from 'express';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const userId = req.header('x-user-id');
  if (!userId)
    return res.status(401).json({error: 'Unauthenticated: set x-user-id'});

  // Ensure user exists in database
  try {
    await prisma.user.upsert({
      where: {id: userId},
      update: {},
      create: {
        id: userId,
        email: `${userId}@example.com`, // placeholder email
        name: userId,
      },
    });
  } catch (error) {
    console.error('User creation error:', error);
    return res.status(500).json({error: 'Failed to create user'});
  }

  (req as any).userId = userId;
  next();
}
