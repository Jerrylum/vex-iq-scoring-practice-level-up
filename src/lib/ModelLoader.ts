import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export interface LoadedModel {
	object: THREE.Group;
	size: THREE.Vector3;
	center: THREE.Vector3;
}

export class ModelLoader {
	private modelCache: Map<string, THREE.Group> = new Map();

	private updateLoadingProgress(message: string): void {
		const loadingElement = document.getElementById('loading');
		if (loadingElement) {
			loadingElement.textContent = message;
		}
	}

	private async loadOBJ(objPath: string, mtlPath: string, onProgress?: (percent: number) => void): Promise<THREE.Group> {
		const mtlLoader = new MTLLoader();
		const objLoader = new OBJLoader();

		return new Promise((resolve, reject) => {
			// First load the MTL file
			mtlLoader.load(
				mtlPath,
				(materials) => {
					materials.preload();
					objLoader.setMaterials(materials);

					// Now load the OBJ file
					objLoader.load(
						objPath,
						(object) => {
							let meshCount = 0;

							// Enable shadows for all meshes and compute bounding boxes
							object.traverse((child) => {
								if (child instanceof THREE.Mesh) {
									meshCount++;
									child.castShadow = true;
									child.receiveShadow = true;

									if (child.geometry) {
										child.geometry.computeBoundingBox();
										child.geometry.computeVertexNormals();
									}
								}
							});

							// If no meshes found, reject
							if (meshCount === 0) {
								reject(new Error('OBJ file contains no meshes'));
								return;
							}

							resolve(object);
						},
						(progress) => {
							if (progress.total > 0 && onProgress) {
								const percent = (progress.loaded / progress.total) * 100;
								onProgress(percent);
							}
						},
						(error) => {
							reject(error);
						}
					);
				},
				undefined,
				(error) => {
					reject(error);
				}
			);
		});
	}

	public async loadModel(objPath: string, mtlPath: string, modelName: string): Promise<THREE.Group> {
		const cacheKey = `${objPath}|${mtlPath}`;

		// Check if model is already cached
		if (this.modelCache.has(cacheKey)) {
			console.log(`Using cached model: ${modelName}`);
			return this.modelCache.get(cacheKey)!.clone();
		}

		console.log(`Loading model: ${modelName}`);
		this.updateLoadingProgress(`Loading ${modelName}...`);

		const object = await this.loadOBJ(objPath, mtlPath, (percent) => {
			this.updateLoadingProgress(`Loading ${modelName}... ${percent.toFixed(0)}%`);
		});

		// Cache the model
		this.modelCache.set(cacheKey, object);
		console.log(`Model cached: ${modelName}`);

		// Return a clone so the cached version stays pristine
		return object.clone();
	}

	public clearCache(): void {
		this.modelCache.clear();
	}
}
