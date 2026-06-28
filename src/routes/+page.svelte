<script lang="ts">
	import { onMount } from 'svelte';
	import { Scene } from '$lib/Scene';
	import { generateScenario, type Difficulty } from '$lib/SmartGenerator';

	let currentScene: Scene | null = null;
	let currentDifficulty = $state<Difficulty>('medium');
	let isLoading = $state(true);
	let isReloading = $state(false);
	let loadingMessage = $state('Loading scene...');
	let isPanelCollapsed = $state(false);

	function togglePanel() {
		isPanelCollapsed = !isPanelCollapsed;
		setTimeout(() => {
			if (currentScene) {
				currentScene.resize();
			}
		}, 350);
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

		console.log(`\n=== Scenario generation complete: ${scenario.structures.length} structures created ===\n`);
		console.log('Scoring:', scenario.calculateScoring());
	}

	async function reloadScenario() {
		if (!currentScene || isReloading) return;

		isReloading = true;

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
	<!-- Three.js container -->
	<div class="relative h-full flex-1 overflow-hidden">
		<div id="container" class="absolute top-0 left-0 h-full w-full"></div>

		<!-- Loading message -->
		{#if isLoading}
			<div
				id="loading"
				class="absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 text-lg text-white"
				class:text-red-500={loadingMessage.includes('Failed')}
			>
				{loadingMessage}
			</div>
		{/if}

		<!-- Mobile Panel Toggle Button (when collapsed) -->
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

	<!-- Scoring Panel -->
	<div
		class="relative flex h-full flex-col bg-[#1f2937] text-white shadow-2xl transition-all duration-300 max-md:absolute max-md:top-0 max-md:right-0 max-md:z-40"
		class:w-[400px]={!isPanelCollapsed}
		class:w-12={isPanelCollapsed}
		class:max-md:w-full={!isPanelCollapsed}
		class:max-md:hidden={isPanelCollapsed}
	>
		<!-- Collapse Button (Desktop) -->
		<button
			class="absolute top-4 -left-14 z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-[#374151] text-xl text-white shadow-lg hover:bg-[#4b5563] max-md:hidden"
			onclick={togglePanel}
			aria-label={isPanelCollapsed ? 'Expand panel' : 'Collapse panel'}
		>
			{isPanelCollapsed ? '◀' : '▶'}
		</button>

		{#if !isPanelCollapsed}
			<div class="flex-none border-b border-[#374151] bg-[#111827] p-3">
				<h2 class="text-lg font-bold">Scoring Panel</h2>
			</div>
			<div class="flex flex-1 flex-col gap-4 p-4">
				<div>
					<label for="difficulty" class="mb-2 block text-sm text-gray-300">Difficulty</label>
					<select
						id="difficulty"
						bind:value={currentDifficulty}
						class="w-full rounded-md border border-[#374151] bg-[#111827] px-3 py-2 text-white"
					>
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">Hard</option>
					</select>
				</div>
				<button
					class="rounded-md bg-[#0076BB] px-4 py-2 font-medium text-white hover:bg-[#005a91] disabled:opacity-50"
					onclick={reloadScenario}
					disabled={isReloading || isLoading}
				>
					{isReloading ? 'Generating...' : 'New Scenario'}
				</button>
				<p class="text-sm text-gray-400">Level Up scoring UI will go here.</p>
			</div>
		{/if}
	</div>
</div>
