"use client";

type TotalVotesProps = {
  totalVotes: number;
};

export function TotalVotes({ totalVotes }: TotalVotesProps) {
  return (
    <p className="text-center text-sm font-semibold tabular-nums text-zinc-600 dark:text-zinc-400">
      {totalVotes} {totalVotes === 1 ? "vote" : "votes"} total
    </p>
  );
}
