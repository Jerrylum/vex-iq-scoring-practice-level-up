import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const inputFile = join(__dirname, 'static', 'VIQRC-MixAndMatch-H2H-_-GameObjects_LoadZone.obj');
const outputFile = join(__dirname, 'static', 'VIQRC-MixAndMatch-H2H-_-GameObjects_LoadZone-l.obj');

console.log('Reading file:', inputFile);
const content = readFileSync(inputFile, 'utf-8');
const lines = content.split('\n');

console.log('Processing vertices, texture coordinates, and normals...');

// Helper function to remove trailing zeros
const cleanNumber = (num: string) => {
	return parseFloat(num).toString();
};

const processedLines = lines.map((line) => {
	const trimmedLine = line.trim();

	// Check if line starts with "v " (vertex)
	if (trimmedLine.startsWith('v ')) {
		const parts = line.split(/\s+/); // Split by whitespace
		if (parts.length >= 4) {
			// parts[0] = "v", parts[1] = x, parts[2] = y, parts[3] = z
			const x = parseFloat(parts[1]!).toFixed(3);
			const y = parseFloat(parts[2]!).toFixed(3);
			const z = parseFloat(parts[3]!).toFixed(3);

			return `v ${cleanNumber(x)} ${cleanNumber(y)} ${cleanNumber(z)}`;
		}
	}

	// Check if line starts with "vt " (texture coordinate)
	if (trimmedLine.startsWith('vt ')) {
		const parts = line.split(/\s+/);
		if (parts.length >= 3) {
			// parts[0] = "vt", parts[1] = u, parts[2] = v, parts[3] = w (optional)
			const u = parseFloat(parts[1]!).toFixed(3);
			const v = parseFloat(parts[2]!).toFixed(3);

			if (parts.length >= 4) {
				const w = parseFloat(parts[3]!).toFixed(3);
				return `vt ${cleanNumber(u)} ${cleanNumber(v)} ${cleanNumber(w)}`;
			}

			return `vt ${cleanNumber(u)} ${cleanNumber(v)}`;
		}
	}

	// Check if line starts with "vn " (vertex normal)
	if (trimmedLine.startsWith('vn ')) {
		const parts = line.split(/\s+/);
		if (parts.length >= 4) {
			// parts[0] = "vn", parts[1] = x, parts[2] = y, parts[3] = z
			const x = parseFloat(parts[1]!).toFixed(3);
			const y = parseFloat(parts[2]!).toFixed(3);
			const z = parseFloat(parts[3]!).toFixed(3);

			return `vn ${cleanNumber(x)} ${cleanNumber(y)} ${cleanNumber(z)}`;
		}
	}

	return line;
});

console.log('Writing to file:', outputFile);
writeFileSync(outputFile, processedLines.join('\n'));
console.log('Done!');
