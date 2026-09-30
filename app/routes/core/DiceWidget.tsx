import { popoverTransitionClasses } from "@thorium/ui/Dropdown";
import { cn } from "@thorium/utils/cn";
import { useState } from "react";
import {
	Button as RAButton,
	Dialog,
	DialogTrigger,
	Popover,
} from "react-aria-components";

const DIE_TYPES = [4, 6, 8, 10, 12, 20, 100] as const;
type DieType = (typeof DIE_TYPES)[number];

function DiceIcon({ className = "h-4 w-4" }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={className}
			aria-hidden="true"
		>
			<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
			<circle cx="8" cy="8" r="1.25" fill="currentColor" />
			<circle cx="16" cy="8" r="1.25" fill="currentColor" />
			<circle cx="8" cy="16" r="1.25" fill="currentColor" />
			<circle cx="16" cy="16" r="1.25" fill="currentColor" />
			<circle cx="12" cy="12" r="1.25" fill="currentColor" />
		</svg>
	);
}

export function DiceWidget() {
	const [diceCounts, setDiceCounts] = useState<Record<number, number>>({ 20: 1 });
	const [rolls, setRolls] = useState<{ die: number; value: number }[]>([]);

	const totalDiceSelected = Object.values(diceCounts).reduce((acc, c) => acc + c, 0);

	const updateCount = (die: DieType, delta: number) => {
		setDiceCounts((prev) => {
			const current = prev[die] || 0;
			const next = Math.max(0, current + delta);
			if (next === 0) {
				const copy = { ...prev };
				delete copy[die];
				return copy;
			}
			return { ...prev, [die]: next };
		});
	};

	const clearAll = () => {
		setDiceCounts({});
		setRolls([]);
	};

	const roll = () => {
		const newRolls: { die: number; value: number }[] = [];
		for (const [dieStr, count] of Object.entries(diceCounts)) {
			const die = Number(dieStr);
			for (let i = 0; i < count; i++) {
				const value = Math.floor(Math.random() * die) + 1;
				newRolls.push({ die, value });
			}
		}
		setRolls(newRolls);
	};

	const totalSum = rolls.reduce((acc, r) => acc + r.value, 0);

	return (
		<DialogTrigger>
			<RAButton
				className="btn btn-xs btn-outline btn-accent flex items-center gap-1"
				aria-label="Dice Roller"
			>
				<DiceIcon className="h-3.5 w-3.5" />
				<span>Dice</span>
			</RAButton>

			<Popover className={cn("z-50", popoverTransitionClasses)}>
				<Dialog className="w-80 rounded-lg border border-gray-600 bg-gray-950/95 p-3.5 text-white shadow-2xl backdrop-blur-md outline-none">
					<div className="mb-2.5 flex items-center justify-between border-b border-white/10 pb-2">
						<div className="flex items-center gap-1.5 font-bold text-sm text-accent">
							<DiceIcon className="h-4 w-4" />
							<span>Dice Roller</span>
						</div>
						{totalDiceSelected > 0 && (
							<button
								type="button"
								onClick={clearAll}
								className="text-xs text-gray-400 hover:text-error transition-colors cursor-pointer"
							>
								Clear
							</button>
						)}
					</div>

					{/* Die Selection Grid */}
					<div className="grid grid-cols-2 gap-1.5 mb-3">
						{DIE_TYPES.map((die) => {
							const count = diceCounts[die] || 0;
							return (
								<div
									key={die}
									className={cn(
										"flex items-center justify-between px-2 py-1 rounded border text-xs transition-colors",
										count > 0
											? "border-accent/60 bg-accent/15 text-white"
											: "border-white/10 bg-white/5 text-gray-300",
									)}
								>
									<span className="font-mono font-semibold">d{die}</span>
									<div className="flex items-center gap-1">
										<button
											type="button"
											onClick={() => updateCount(die, -1)}
											disabled={count === 0}
											className="h-5 w-5 rounded bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs"
										>
											-
										</button>
										<span className="w-4 text-center font-mono font-bold text-xs">
											{count}
										</span>
										<button
											type="button"
											onClick={() => updateCount(die, 1)}
											className="h-5 w-5 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-xs"
										>
											+
										</button>
									</div>
								</div>
							);
						})}
					</div>

					{/* Action Buttons */}
					<div className="flex items-center gap-2 mb-3">
						<button
							type="button"
							onClick={roll}
							disabled={totalDiceSelected === 0}
							className="btn btn-accent btn-sm flex-1 disabled:opacity-40"
						>
							Roll ({totalDiceSelected} {totalDiceSelected === 1 ? "die" : "dice"})
						</button>
					</div>

					{/* Roll Results */}
					{rolls.length > 0 && (
						<div className="rounded border border-white/10 bg-black/40 p-2.5">
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
									Result
								</span>
								<span className="text-sm font-bold">
									Total: <span className="font-mono text-accent text-base">{totalSum}</span>
								</span>
							</div>
							<div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
								{rolls.map((r, i) => (
									<span
										key={i}
										className="inline-flex items-center gap-1 rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs border border-white/10"
									>
										<span className="text-gray-400">d{r.die}:</span>
										<span
											className={cn(
												"font-bold",
												r.value === r.die
													? "text-success"
													: r.value === 1
														? "text-error"
														: "text-warning",
											)}
										>
											{r.value}
										</span>
									</span>
								))}
							</div>
						</div>
					)}
				</Dialog>
			</Popover>
		</DialogTrigger>
	);
}
