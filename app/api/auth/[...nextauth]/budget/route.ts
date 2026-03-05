import { auth } from '@/auth';
import { db } from '@/lib/db';
import { budget } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET all budget items for current user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await db
    .select()
    .from(budget)
    .where(eq(budget.userId, Number(session.user.id)));

  return Response.json(result);
}

// POST create a new budget item
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { item, price } = await req.json();

  await db.insert(budget).values({
    userId: Number(session.user.id),
    item,
    price,
  });

  return Response.json({ success: true });
}

// DELETE a budget item
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();

  await db
    .delete(budget)
    .where(eq(budget.id, id));

  return Response.json({ success: true });
}