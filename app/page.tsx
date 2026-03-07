import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";
import { savings, budget } from "@/lib/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { CurrencyAmount } from "./_components/CurrencyAmount";

async function doSignOut() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function HomePage() {
  const session = await auth();
  const isAuthed = !!session?.user?.id;
  const userNationality = session?.user?.nationality ?? null;

  let savingsAmount: number | null = null;
  let budgetItems: { id: number; item: string; price: string }[] = [];

  if (isAuthed) {
    const [savingsRow, budgetRows] = await Promise.all([
      db
        .select()
        .from(savings)
        .where(eq(savings.userId, Number(session!.user!.id)))
        .then((r) => r[0] ?? null),
      db
        .select()
        .from(budget)
        .where(eq(budget.userId, Number(session!.user!.id))),
    ]);

    savingsAmount = savingsRow ? parseFloat(savingsRow.amount) : null;
    budgetItems = budgetRows.map((b) => ({
      id: b.id,
      item: b.item,
      price: b.price,
    }));
  }

  const hasSavings = savingsAmount !== null;
  const hasBudget = budgetItems.length > 0;
  const goal = budgetItems.reduce((sum, b) => sum + parseFloat(b.price), 0);
  const gap = goal - (savingsAmount ?? 0);
  const showGap = isAuthed && hasBudget;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-yellow-300 flex flex-col">
      {/* Nav */}
      <nav className="border-b-4 border-black bg-white px-4 sm:px-8 py-4 flex items-center justify-between">
        <span className="font-black text-2xl sm:text-3xl tracking-tight">
          EVO 2027
        </span>
        <div className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <span className="font-bold text-sm sm:text-base hidden sm:inline">
                {session!.user!.name}
              </span>
              <form action={doSignOut}>
                <button
                  type="submit"
                  className="border-2 border-black bg-pink-400 font-bold px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-sm"
                >
                  Log Out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="border-2 border-black bg-green-400 font-bold px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all inline-block text-sm"
            >
              Log In
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-16 sm:py-24 gap-8">
        <h1 className="font-black text-4xl sm:text-6xl lg:text-8xl text-center leading-none tracking-tight">
          TRACKER
        </h1>

        {showGap ? (
          <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-12 text-center max-w-lg w-full">
            <p className="font-black text-lg sm:text-xl mb-2 uppercase tracking-wide">
              Amount Still Needed
            </p>
            <CurrencyAmount
              amount={gap > 0 ? gap : 0}
              nacionalidade={userNationality ?? undefined}
              className="font-black text-5xl sm:text-7xl block"
            />
            {gap <= 0 && (
              <p className="font-bold text-green-600 mt-4 text-lg">
                Goal reached! You&apos;re ahead by{" "}
                <CurrencyAmount
                  amount={Math.abs(gap)}
                  nacionalidade={userNationality ?? undefined}
                />
              </p>
            )}
            {!hasSavings && (
              <p className="font-bold text-sm mt-3 border-2 border-black bg-yellow-300 px-4 py-2 inline-block">
                No savings tracked yet —{" "}
                <Link href="/savings" className="underline font-black">
                  set up your savings!
                </Link>
              </p>
            )}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/budget"
                className="border-2 border-black bg-pink-400 font-bold px-5 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-center"
              >
                Edit Budget
              </Link>
              <Link
                href="/savings"
                className="border-2 border-black bg-green-400 font-bold px-5 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-center"
              >
                {hasSavings ? "Update Savings" : "Set Up Savings"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl">
            {isAuthed && !hasBudget && (
              <Link
                href="/budget"
                className="flex-1 border-4 border-black bg-pink-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <p className="font-black text-2xl mb-1">Set up your budget!</p>
                <p className="font-bold">
                  Add the things you&apos;re saving for &rarr;
                </p>
              </Link>
            )}
            {isAuthed && !hasSavings && (
              <Link
                href="/savings"
                className="flex-1 border-4 border-black bg-green-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <p className="font-black text-2xl mb-1">Set up your savings!</p>
                <p className="font-bold">
                  Track how much you&apos;ve saved &rarr;
                </p>
              </Link>
            )}
            {!isAuthed && (
              <div className="w-full border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
                <p className="font-black text-2xl sm:text-3xl mb-4">
                  Start tracking your goals.
                </p>
                <Link
                  href="/login"
                  className="border-2 border-black bg-green-400 font-black text-xl px-8 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all inline-block"
                >
                  Log In to get started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
