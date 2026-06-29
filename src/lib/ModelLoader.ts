import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export interface LoadedModel {
	object: THREE.Group;
	size: THREE.Vector3;
	center: THREE.Vector3;
}

/** GLB exports from Blender are in meters; the rest of the scene uses millimeters. */
const GLTF_TO_SCENE_SCALE = 1000;

type MTLMaterialLibrary = {
	materialsInfo: Record<string, unknown>;
	create: (materialName: string) => THREE.Material;
};

export class ModelLoader {
	private modelCache: Map<string, THREE.Group> = new Map();
	private mtlCache: Map<string, MTLMaterialLibrary> = new Map();

	private updateLoadingProgress(message: string): void {
		const loadingElement = document.getElementById('loading');
		if (loadingElement) {
			loadingElement.textContent = message;
		}
	}

	private prepareMeshes(object: THREE.Group): number {
		let meshCount = 0;

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

		return meshCount;
	}

	/** Swap GLB PBR materials for matching OBJ/MTL materials by name. */
	private applyMTLMaterials(object: THREE.Object3D, materials: MTLMaterialLibrary): void {
		const swapMaterial = (material: THREE.Material): THREE.Material => {
			const { name } = material;
			if (!name || materials.materialsInfo[name] === undefined) {
				console.warn(`No MTL material found for GLB material: ${name ?? '(unnamed)'}`);
				return material;
			}

			material.dispose();
			return materials.create(name);
		};

		object.traverse((child) => {
			if (!(child instanceof THREE.Mesh)) {
				return;
			}

			if (Array.isArray(child.material)) {
				child.material = child.material.map(swapMaterial);
			} else {
				child.material = swapMaterial(child.material);
			}
		});
	}

	private loadMTL(mtlPath: string): Promise<MTLMaterialLibrary> {
		if (this.mtlCache.has(mtlPath)) {
			return Promise.resolve(this.mtlCache.get(mtlPath)!);
		}

		const mtlLoader = new MTLLoader();

		return new Promise((resolve, reject) => {
			mtlLoader.load(
				mtlPath,
				(materials) => {
					materials.preload();
					this.mtlCache.set(mtlPath, materials);
					resolve(materials);
				},
				undefined,
				reject
			);
		});
	}

	private isGLTFPath(path: string): boolean {
		return path.endsWith('.glb') || path.endsWith('.gltf');
	}

	private async loadGLB(
		glbPath: string,
		mtlPath: string,
		onProgress?: (percent: number) => void
	): Promise<THREE.Group> {
		const loader = new GLTFLoader();
		const materials = await this.loadMTL(mtlPath);

		return new Promise((resolve, reject) => {
			loader.load(
				glbPath,
				(gltf) => {
					gltf.scene.scale.multiplyScalar(GLTF_TO_SCENE_SCALE);
					this.applyMTLMaterials(gltf.scene, materials);

					const meshCount = this.prepareMeshes(gltf.scene);

					if (meshCount === 0) {
						reject(new Error('GLB file contains no meshes'));
						return;
					}

					resolve(gltf.scene);
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
		});
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
							const meshCount = this.prepareMeshes(object);

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

	public async loadModel(modelPath: string, mtlPath: string, modelName: string): Promise<THREE.Group> {
		const cacheKey = `${modelPath}|${mtlPath}`;

		// Check if model is already cached
		if (this.modelCache.has(cacheKey)) {
			console.log(`Using cached model: ${modelName}`);
			return this.modelCache.get(cacheKey)!.clone();
		}

		console.log(`Loading model: ${modelName}`);
		this.updateLoadingProgress(`Loading ${modelName}...`);

		const onProgress = (percent: number) => {
			this.updateLoadingProgress(`Loading ${modelName}... ${percent.toFixed(0)}%`);
		};

		const object = this.isGLTFPath(modelPath)
			? await this.loadGLB(modelPath, mtlPath, onProgress)
			: await this.loadOBJ(modelPath, mtlPath, onProgress);

		// Cache the model
		this.modelCache.set(cacheKey, object);
		console.log(`Model cached: ${modelName}`);

		// Return a clone so the cached version stays pristine
		return object.clone();
	}

	public clearCache(): void {
		this.modelCache.clear();
		this.mtlCache.clear();
	}
}
