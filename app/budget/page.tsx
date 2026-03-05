import { auth } from '@/auth';
import { db } from '@/lib/db';
import { budget } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BudgetClient } from './BudgetClient';

export default async function BudgetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const budgetRows = await db
    .select()
    .from(budget)
    .where(eq(budget.userId, Number(session.user.id)));

  const items = budgetRows.map((b) => ({
    id: b.id,
    item: b.item,
    price: b.price,
  }));

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Header */}
      <div className="border-b-4 border-black bg-pink-400 px-4 sm:px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="font-bold text-sm border-b-2 border-black hover:bg-yellow-300 transition-colors"
            >
              &larr; Home
            </Link>
            <h1 className="font-black text-4xl sm:text-5xl mt-2 leading-none">BUDGET</h1>
          </div>
          <Link
            href="/savings"
            className="border-2 border-black bg-green-400 font-bold px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-sm whitespace-nowrap"
          >
            My Savings &rarr;
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        <BudgetClient initialItems={items} />
      </div>
    </div>
  );
}
