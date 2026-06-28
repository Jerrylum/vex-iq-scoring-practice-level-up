<script lang="ts">
	import { onMount } from 'svelte';
	import { Scene } from '$lib/Scene';
	import {
		aggregateStructureScorings,
		calculateScenarioPoints,
		emptyStructureScoring,
		GOAL_POINTS,
		type StructureScoring
	} from '$lib/Scoring';
	import { generateScenario, type Difficulty } from '$lib/SmartGenerator';

	type ScoringField = keyof StructureScoring;

	const PAIRED_GOAL_ROWS: { label: string; red: ScoringField; blue: ScoringField }[] = [
		{ label: 'Floor', red: 'redFloorGoal', blue: 'blueFloorGoal' },
		{ label: 'L1', red: 'redL1Goal', blue: 'blueL1Goal' },
		{ label: 'L2', red: 'redL2Goal', blue: 'blueL2Goal' },
		{ label: 'L3', red: 'redL3Goal', blue: 'blueL3Goal' }
	];

	let currentScene: Scene | null = null;
	let currentDifficulty = $state<Difficulty>('hard');
	let isLoading = $state(true);
	let isReloading = $state(false);
	let loadingMessage = $state('Loading scene...');
	let isPanelCollapsed = $state(false);
	let showAnswer = $state(false);
	let showHowToPlayDialog = $state(false);

	let userCounts = $state<StructureScoring>(emptyStructureScoring());
	let actualCounts = $state<StructureScoring>(emptyStructureScoring());

	let userTotalScore = $derived(calculateScenarioPoints(userCounts));
	let actualTotalScore = $derived(calculateScenarioPoints(actualCounts));
	let isCorrect = $derived(userTotalScore === actualTotalScore);

	function togglePanel() {
		isPanelCollapsed = !isPanelCollapsed;
		setTimeout(() => {
			if (currentScene) {
				currentScene.resize();
			}
		}, 350);
	}

	function resetScoring() {
		userCounts = emptyStructureScoring();
		showAnswer = false;
	}

	function toggleAnswer() {
		showAnswer = !showAnswer;
	}

	function toggleHowToPlayDialog() {
		showHowToPlayDialog = !showHowToPlayDialog;
	}

	function incrementCount(field: ScoringField) {
		userCounts[field]++;
	}

	function decrementCount(field: ScoringField) {
		if (userCounts[field] > 0) {
			userCounts[field]--;
		}
	}

	async function generateNewScenario(scene: Scene) {
		console.log(`\n=== Generating new scenario (difficulty: ${currentDifficulty}) ===`);

		const scenario = generateScenario(currentDifficulty);

		for (const structure of scenario.structures) {
			try {
				await structure.visualize(scene);
			} catch (error) {
				console.error('Failed to visualize structure:', error);
			}
		}

		actualCounts = aggregateStructureScorings(scenario.calculateScoring().structures);
		console.log(`\n=== Scenario generation complete: ${scenario.structures.length} structures created ===\n`);
		console.log('Actual counts:', $state.snapshot(actualCounts));
	}

	async function reloadScenario() {
		if (!currentScene || isReloading) return;

		isReloading = true;
		resetScoring();

		try {
			currentScene.clearScoringObjects();
			await generateNewScenario(currentScene);
		} catch (error) {
			console.error('Failed to reload scenario:', error);
		} finally {
			isReloading = false;
		}
	}

	onMount(() => {
		const init = async () => {
			try {
				currentScene = new Scene('container');
				await currentScene.initialize();
				await generateNewScenario(currentScene);
				isLoading = false;
			} catch (error) {
				console.error('Failed to initialize scene:', error);
				loadingMessage = 'Failed to load scene';
			}
		};
		init();
	});
</script>

<svelte:head>
	<title>VEX IQ Scoring Practice — Level Up</title>
</svelte:head>

<div class="flex h-screen w-screen bg-black">
	<div class="relative h-full flex-1 overflow-hidden">
		<div id="container" class="absolute top-0 left-0 h-full w-full"></div>

		{#if isLoading}
			<div
				class="absolute top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 p-4 text-center text-lg text-white"
				class:text-red-500={loadingMessage.includes('Failed')}
			>
				<div id="loading" class="mx-auto w-full max-w-md rounded-lg bg-black/50 p-4">
					{loadingMessage}
				</div>
			</div>
		{/if}

		{#if isPanelCollapsed}
			<button
				class="absolute right-4 bottom-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#0076BB] text-white shadow-lg hover:bg-[#005a91] md:hidden"
				onclick={togglePanel}
				aria-label="Open scoring panel"
			>
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
				</svg>
			</button>
		{/if}
	</div>

	<div
		class="relative flex h-full flex-col bg-[#1f2937] text-white shadow-2xl transition-all duration-300 max-md:absolute max-md:top-0 max-md:right-0 max-md:z-40"
		class:w-[400px]={!isPanelCollapsed}
		class:w-12={isPanelCollapsed}
		class:max-md:w-full={!isPanelCollapsed}
		class:max-md:hidden={isPanelCollapsed}
	>
		<button
			class="absolute top-4 -left-14 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-[#374151] text-xl text-white shadow-lg hover:bg-[#4b5563] max-md:hidden"
			onclick={togglePanel}
			aria-label={isPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
		>
			{isPanelCollapsed ? '◀' : '▶'}
		</button>

		{#if !isPanelCollapsed}
			<div class="flex-none border-b border-[#374151] bg-[#111827] p-3">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-bold">Scoring Panel</h2>
					<div class="flex gap-2">
						<button
							class="rounded-md bg-[#0076BB] px-2 py-1 text-xs hover:bg-[#005a91]"
							onclick={toggleHowToPlayDialog}
							aria-label="How to Play"
						>
							?
						</button>
						<button class="rounded-md bg-[#888B95] px-2 py-1 text-xs hover:bg-[#6b6e76] md:hidden" onclick={togglePanel}> Close </button>
					</div>
				</div>

				<div class="mt-3 flex gap-2">
					<select
						id="difficulty"
						bind:value={currentDifficulty}
						class="flex-1 cursor-pointer rounded-md border-none bg-[#0076BB] px-3 py-2 text-sm text-white transition-colors hover:bg-[#005a91] disabled:cursor-not-allowed disabled:bg-[#888B95]"
						disabled={isReloading || isLoading}
					>
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">Hard</option>
					</select>
					<button
						class="cursor-pointer rounded-md border-none bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-[#888B95]"
						onclick={reloadScenario}
						disabled={isReloading || isLoading}
					>
						{isReloading ? '...' : 'New'}
					</button>
				</div>
			</div>

			<div class="flex-1 space-y-2 overflow-y-auto p-2">
				{#each PAIRED_GOAL_ROWS as row}
					<div class="grid grid-cols-2 gap-2">
						<div class="flex flex-col gap-2 rounded-lg bg-[#374151] p-2 shadow-md">
							<div class="flex items-center gap-2 text-[10px] leading-tight">
								<span class="font-medium text-red-300">Red {row.label}</span>
								<span class="text-[#888B95]">{GOAL_POINTS[row.red]} pts</span>
							</div>
							<div class="flex items-center justify-center gap-1">
								<button
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-red-600 text-base font-bold transition-colors hover:bg-red-700 active:bg-red-800"
									onclick={() => decrementCount(row.red)}
								>
									−
								</button>
								<div class="min-w-10 text-center text-xl font-bold">{userCounts[row.red]}</div>
								<button
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-green-600 text-base font-bold transition-colors hover:bg-green-700 active:bg-green-800"
									onclick={() => incrementCount(row.red)}
								>
									+
								</button>
							</div>
							{#if showAnswer}
								<div
									class="mt-1 text-center text-[10px]"
									class:text-green-400={userCounts[row.red] === actualCounts[row.red]}
									class:text-red-400={userCounts[row.red] !== actualCounts[row.red]}
								>
									Correct: {actualCounts[row.red]}
								</div>
							{/if}
						</div>

						<div class="flex flex-col gap-2 rounded-lg bg-[#374151] p-2 shadow-md">
							<div class="flex items-center gap-2 text-[10px] leading-tight">
								<span class="font-medium text-blue-300">Blue {row.label}</span>
								<span class="text-[#888B95]">{GOAL_POINTS[row.blue]} pts</span>
							</div>
							<div class="flex items-center justify-center gap-1">
								<button
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-red-600 text-base font-bold transition-colors hover:bg-red-700 active:bg-red-800"
									onclick={() => decrementCount(row.blue)}
								>
									−
								</button>
								<div class="min-w-10 text-center text-xl font-bold">{userCounts[row.blue]}</div>
								<button
									class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-green-600 text-base font-bold transition-colors hover:bg-green-700 active:bg-green-800"
									onclick={() => incrementCount(row.blue)}
								>
									+
								</button>
							</div>
							{#if showAnswer}
								<div
									class="mt-1 text-center text-[10px]"
									class:text-green-400={userCounts[row.blue] === actualCounts[row.blue]}
									class:text-red-400={userCounts[row.blue] !== actualCounts[row.blue]}
								>
									Correct: {actualCounts[row.blue]}
								</div>
							{/if}
						</div>
					</div>
				{/each}

				<div class="flex justify-center">
					<div class="flex w-full max-w-[12rem] flex-col gap-2 rounded-lg bg-[#374151] p-2 shadow-md">
						<div class="flex items-center gap-2 text-[10px] leading-tight">
							<span class="font-medium text-yellow-300">L4 Goal</span>
							<span class="text-[#888B95]">{GOAL_POINTS.yellowL4Goal} pts</span>
						</div>
						<div class="flex items-center justify-center gap-1">
							<button
								class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-red-600 text-base font-bold transition-colors hover:bg-red-700 active:bg-red-800"
								onclick={() => decrementCount('yellowL4Goal')}
							>
								−
							</button>
							<div class="min-w-10 text-center text-xl font-bold">{userCounts.yellowL4Goal}</div>
							<button
								class="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-green-600 text-base font-bold transition-colors hover:bg-green-700 active:bg-green-800"
								onclick={() => incrementCount('yellowL4Goal')}
							>
								+
							</button>
						</div>
						{#if showAnswer}
							<div
								class="mt-1 text-center text-[10px]"
								class:text-green-400={userCounts.yellowL4Goal === actualCounts.yellowL4Goal}
								class:text-red-400={userCounts.yellowL4Goal !== actualCounts.yellowL4Goal}
							>
								Correct: {actualCounts.yellowL4Goal}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<div class="flex-none border-t border-[#374151] bg-[#111827] p-3">
				<div class="mb-3 text-center">
					<div
						class="text-3xl font-bold"
						class:text-green-400={showAnswer && isCorrect}
						class:text-red-400={showAnswer && !isCorrect}
						class:text-white={!showAnswer}
					>
						{userTotalScore}
					</div>
					{#if showAnswer}
						<div class="mt-1 text-sm">
							{#if isCorrect}
								<span class="font-semibold text-green-400">Correct!</span>
							{:else}
								<span class="font-semibold text-red-400">Incorrect</span>
								<div class="mt-1 text-xs text-[#888B95]">Actual: {actualTotalScore} points</div>
							{/if}
						</div>
					{/if}
				</div>

				<div class="flex gap-2">
					<button
						class="flex-1 rounded-md bg-[#0076BB] px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#005a91] active:bg-[#004570]"
						onclick={toggleAnswer}
					>
						{showAnswer ? 'Hide' : 'Check'}
					</button>
					<button
						class="flex-1 rounded-md bg-[#888B95] px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#6b6e76] active:bg-[#575a63]"
						onclick={resetScoring}
					>
						Reset
					</button>
				</div>
			</div>
		{/if}
	</div>

	{#if showHowToPlayDialog}
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
			onclick={toggleHowToPlayDialog}
			onkeydown={(e) => e.key === 'Escape' && toggleHowToPlayDialog()}
			role="dialog"
			aria-modal="true"
			aria-labelledby="dialog-title"
			tabindex="-1"
		>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-[#1f2937] p-6 text-white shadow-2xl"
				onclick={(e) => e.stopPropagation()}
			>
				<div class="mb-4 flex items-center justify-between">
					<h2 id="dialog-title" class="text-2xl font-bold">How to Play</h2>
					<button
						class="flex h-8 w-8 items-center justify-center rounded-md bg-[#374151] text-xl hover:bg-[#4b5563]"
						onclick={toggleHowToPlayDialog}
						aria-label="Close dialog"
					>
						×
					</button>
				</div>

				<div class="space-y-4 text-sm leading-relaxed">
					<section>
						<h3 class="mb-2 text-lg font-semibold text-[#0076BB]">Getting Started</h3>
						<p>
							Select a difficulty level (Easy, Medium, or Hard) and click the <strong>"New"</strong> button to generate a random field scenario.
							Examine the 3D field and count scored bean bags for each goal tier using the scoring panel.
						</p>
					</section>

					<section>
						<h3 class="mb-2 text-lg font-semibold text-[#0076BB]">Scoring</h3>
						<ul class="ml-4 list-disc space-y-1">
							<li><strong>Floor Goal:</strong> 1 pt per scored bean bag</li>
							<li><strong>L1 Goal:</strong> 3 pts per scored bean bag</li>
							<li><strong>L2 Goal:</strong> 6 pts per scored bean bag</li>
							<li><strong>L3 Goal:</strong> 12 pts per scored bean bag</li>
							<li><strong>L4 Goal:</strong> 16 pts per scored yellow bean bag</li>
						</ul>
						<p class="mt-2">
							In red and blue goals, matching-color and yellow bean bags score. On the L4 goal, only yellow bean bags score.
						</p>
					</section>

					<section>
						<h3 class="mb-2 text-lg font-semibold text-[#0076BB]">Controls</h3>
						<ul class="ml-4 list-disc space-y-1">
							<li><strong>Left Click + Drag:</strong> Rotate camera</li>
							<li><strong>Right Click + Drag:</strong> Pan camera</li>
							<li><strong>Scroll Wheel:</strong> Zoom in/out</li>
							<li><strong>Touch:</strong> Pinch to zoom, drag to rotate</li>
						</ul>
					</section>

					<section>
						<h3 class="mb-2 text-lg font-semibold text-[#0076BB]">Checking Your Score</h3>
						<p>
							After counting scored bean bags for each goal, click the <strong>"Check"</strong> button to see if your total matches the correct
							score. The correct count for each goal will be displayed, helping you learn what you might have missed.
						</p>
					</section>

					<section class="border-t border-[#374151] pt-4">
						<h3 class="mb-2 text-lg font-semibold text-[#0076BB]">About</h3>
						<p class="mb-2">
							This project is open source and available on GitHub:
							<a
								href="https://github.com/Jerrylum/vex-iq-scoring-practice-level-up"
								target="_blank"
								rel="noopener noreferrer"
								class="text-[#60a5fa] hover:underline"
							>
								Jerrylum/vex-iq-scoring-practice-level-up
							</a>
						</p>
						<p class="text-xs text-[#888B95]">
							This project is licensed under the GNU General Public License v3.0 (GPLv3). VEX IQ is a trademark of Innovation First
							International, Inc.
						</p>
					</section>
				</div>
			</div>
		</div>
	{/if}
</div>
