import { defineConfig } from '@rsbuild/core';
import { pluginSvelte } from '@rsbuild/plugin-svelte';

export default defineConfig({
	plugins: [pluginSvelte()],
	source: {
		entry: {
			index: './src/index.ts',
			background: {
				import: './src/background.ts',
				html: false,
			},
		},
	},
	output: {
		filename: {
			js: (pathData) => {
				if (pathData.chunk?.name === 'background') {
					return '[name].js';
				}
				return '[name].[contenthash:8].js';
			},
		},
		cleanDistPath: true,
		target: 'web',
	},
	performance: {
		chunkSplit: {
			strategy: 'custom',
			splitChunks: {
				chunks(chunk) {
					return chunk.name !== 'background';
				},
			},
		},
	},
});
