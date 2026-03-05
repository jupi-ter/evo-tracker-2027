import { auth } from '@/auth';
import { db } from '@/lib/db';
import { savings } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET current user's savings
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await db
    .select()
    .from(savings)
    .where(eq(savings.userId, Number(session.user.id)));

  return Response.json(result);
}

// POST update savings amount
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount } = await req.json();

  await db
    .insert(savings)
    .values({ userId: Number(session.user.id), amount })
    .onConflictDoUpdate({
      target: savings.userId,
      set: { amount },
    });

  return Response.json({ success: true });
}