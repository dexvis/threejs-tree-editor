import * as THREE from "three";
export interface MergeResult {
    mergedGeometry: THREE.BufferGeometry;
    mergedMesh: THREE.Mesh;
    material: THREE.Material | undefined;
    childrenToRemove: THREE.Object3D[];
    parentNode: THREE.Object3D;
}
export declare class NoGeometriesFoundError extends Error {
    constructor(message?: string);
}
export declare class NoMaterialError extends Error {
    constructor(message?: string);
}
/**
 * Merges all geometries in a branch of the scene graph into a single geometry.
 * @param parentNode The parent node of the branch to merge.
 * @param name  Name of the new merged geometry node
 * @param material Material to assign to the merged geometry, if empty the first material found will be used
 * @returns MergeResult object containing the merged geometry, material, children to remove, and parent node
 */
export declare function mergeBranchGeometries(parentNode: THREE.Object3D, name: string, material?: THREE.Material | undefined): MergeResult;
/**
 * Merges all geometries from a list of meshes into a single geometry and attaches it to a new parent node.
 * @param meshes An array of THREE.Mesh objects whose geometries are to be merged.
 * @param parentNode The new parent node to which the merged mesh will be added.
 * @param name The name to assign to the merged mesh.
 *
 * (!) This function doesn't delete original meshes Compared to @see mergeBranchGeometries.
 * Use MergeResult.childrenToRemove to delete meshes that were merged
 *
 * @param material
 * @returns MergeResult The result of the merging process including the new parent node, merged geometry, material, and a list of original meshes.
 */
export declare function mergeMeshList(meshes: THREE.Mesh[], parentNode: THREE.Object3D, name: string, material?: THREE.Material | undefined): MergeResult | undefined;
