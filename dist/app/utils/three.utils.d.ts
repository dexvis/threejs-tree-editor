import { MergeResult } from './three-geometry-merge';
import * as THREE from "three";
/**
 * Callback function type for walking through Object3D nodes.
 *
 * @callback NodeWalkCallback
 * @param {any} node - The current node being processed.
 * @param {string} nodeFullPath - The full hierarchical path to the current node.
 * @param {number} level - The current depth level in the hierarchy.
 * @returns {boolean} - Determines whether to continue walking the tree.
 */
export type NodeWalkCallback = (node: any, nodeFullPath: string, level: number) => boolean;
/**
 * Options for walking through Object3D nodes.
 *
 * @interface NodeWalkOptions
 * @property {number} [maxLevel=Infinity] - The maximum depth level to traverse.
 * @property {number} [level=0] - The current depth level in the traversal.
 * @property {string} [parentPath=""] - The hierarchical path of the parent node.
 * @property {any} [pattern=null] - A pattern to match node paths against.
 */
interface NodeWalkOptions {
    maxLevel?: number;
    level?: number;
    parentPath?: string;
    pattern?: any;
}
/**
 * Recursively walks through a THREE.Object3D hierarchy, invoking a callback on each node.
 *
 * @function walkObject3DNodes
 * @param {any} node - The current node in the Object3D hierarchy.
 * @param {NodeWalkCallback|null} callback - The function to execute on each node.
 * @param {NodeWalkOptions} [options={}] - Configuration options for the traversal.
 * @returns {number} - The total number of nodes processed.
 */
export declare function walkObject3DNodes(node: any, callback: NodeWalkCallback | null, options?: NodeWalkOptions): number;
/**
 * Represents the results of a node searching operation within a THREE.Object3D hierarchy.
 *
 * @interface FindResults
 * @property {any[]} nodes - An array of nodes that matched the search criteria. These nodes are part of the THREE.Object3D hierarchy.
 * @property {string[]} fullPaths - An array of strings, each representing the full path to a corresponding node in the `nodes` array. The full path is constructed by concatenating parent node names, providing a clear hierarchical structure.
 * @property {number} deepestLevel - The deepest level reached in the hierarchy during the search. This value helps understand the depth of the search and which level had the last matched node.
 * @property {number} totalWalked - The total number of nodes visited during the search process. This count includes all nodes checked, regardless of whether they matched the criteria.
 */
export interface FindResults {
    nodes: any[];
    fullPaths: string[];
    deepestLevel: number;
    totalWalked: number;
}
/**
 * Searches for and collects nodes in a THREE.Object3D hierarchy based on a given pattern and type.
 *
 * @function findObject3DNodes
 * @param {any} parentNode - The root node of the hierarchy to search within.
 * @param {string} pattern - A string pattern to match node names against.
 * @param {string} [matchType=""] - Optional filter to restrict results to nodes of a specific type.
 * @param {number} [maxLevel=Infinity] - The maximum depth to search within the node hierarchy.
 * @returns {FindResults} - An object containing the results of the search:
 *                          - `nodes`: Array of nodes that match the criteria.
 *                          - `fullPaths`: Array of full path strings corresponding to each matched node.
 *                          - `deepestLevel`: The deepest level reached in the hierarchy during the search.
 *                          - `totalWalked`: Total number of nodes visited during the search.
 */
export declare function findObject3DNodes(parentNode: any, pattern: string, matchType?: string, maxLevel?: number): FindResults;
/**
 * Interface representing objects that have a color property.
 *
 * @interface Colorable
 * @property {THREE.Color} color - The color of the object.
 */
export interface Colorable {
    color: THREE.Color;
}
/**
 * Type guard function to check if the material is colorable.
 *
 * @function isColorable
 * @param {any} material - The material to check.
 * @returns {material is Colorable} - Returns true if the material has a 'color' property, false otherwise.
 */
export declare function isColorable(material: any): material is Colorable;
/**
 * Retrieves the color of a material if it is colorable; otherwise, returns a default color.
 *
 * @function getColorOrDefault
 * @param {any} material - The material whose color is to be retrieved.
 * @param {THREE.Color} defaultColor - The default color to return if the material is not colorable.
 * @returns {THREE.Color} - The color of the material if colorable, or the default color.
 */
export declare function getColorOrDefault(material: any, defaultColor: THREE.Color): THREE.Color;
/**
 * Options for creating an outline around a mesh.
 *
 * @interface CreateOutlineOptions
 * @property {THREE.ColorRepresentation} [color=0x555555] - The color of the outline.
 * @property {THREE.Material} [material] - The material to use for the outline.
 * @property {number} [thresholdAngle=40] - The angle threshold for edge detection.
 */
export interface CreateOutlineOptions {
    color?: THREE.ColorRepresentation;
    material?: THREE.Material;
    thresholdAngle?: number;
    /** If true, marks the created outline with geometryEditingSkipRules flag */
    markAsProcessed?: boolean;
}
/**
 * Applies an outline mesh from lines to a mesh and adds the outline to the mesh's parent.
 *
 * @function createOutline
 * @param {any} mesh - A THREE.Object3D (expected to be a Mesh) to process.
 * @param {CreateOutlineOptions} [options={}] - Configuration options for the outline.
 * @throws {NoGeometryError} - Throws an error if the mesh does not contain geometry.
 */
export declare function createOutline(mesh: any, options?: CreateOutlineOptions): void;
/**
 * Disposes of a THREE.Object3D node by disposing its geometry and materials.
 *
 * @function disposeNode
 * @param {any} node - The node to dispose of.
 */
export declare function disposeNode(node: any): void;
/**
 * Disposes of the original meshes after merging geometries.
 *
 * @function disposeOriginalMeshesAfterMerge
 * @param {MergeResult} mergeResult - The result of the geometry merge containing nodes to remove.
 */
export declare function disposeOriginalMeshesAfterMerge(mergeResult: MergeResult): void;
/**
 * Recursively disposes of a THREE.Object3D hierarchy.
 *
 * @function disposeHierarchy
 * @param {THREE.Object3D} node - The root node of the hierarchy to dispose of.
 * @param disposeSelf - disposes this node too (if false - only children and their hierarchies will be disposed)
 */
export declare function disposeHierarchy(node: THREE.Object3D, disposeSelf?: boolean): void;
/**
 * Recursively removes empty branches from a THREE.Object3D tree.
 * An empty branch is a node without geometry and without any non-empty children.
 *
 * Removing useless nodes that were left without geometries speeds up overall rendering.
 *
 * @function pruneEmptyNodes
 * @param {THREE.Object3D} node - The starting node to prune empty branches from.
 */
export declare function pruneEmptyNodes(node: THREE.Object3D): void;
export {};
