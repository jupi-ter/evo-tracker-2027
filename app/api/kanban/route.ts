import { auth } from '@/auth';
import { db } from '@/lib/db';
import { kanbanCard } from '@/lib/schema';
import { eq, isNull } from 'drizzle-orm';

function serializeCard(c: typeof kanbanCard.$inferSelect) {
  return {
    id: c.id,
    status: c.status,
    title: c.title,
    description: c.description,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    deletedAt: c.deletedAt?.toISOString() ?? null,
  };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const cards = await db
    .select()
    .from(kanbanCard)
    .where(isNull(kanbanCard.deletedAt));

  return Response.json(cards.map(serializeCard));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, description, status } = await req.json();

  const [card] = await db
    .insert(kanbanCard)
    .values({ title, description, status: status ?? 'to-do' })
    .returning();

  return Response.json(serializeCard(card));
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, title, description, status } = await req.json();

  const [card] = await db
    .update(kanbanCard)
    .set({
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      updatedAt: new Date(),
    })
    .where(eq(kanbanCard.id, id))
    .returning();

  return Response.json(serializeCard(card));
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();

  await db
    .update(kanbanCard)
    .set({ deletedAt: new Date() })
    .where(eq(kanbanCard.id, id));

  return Response.json({ success: true });
}
