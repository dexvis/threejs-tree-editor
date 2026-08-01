import { Material, Object3D, ColorRepresentation } from 'three';
/**
 * Flag name used to mark objects that have already been processed by geometry editing rules.
 * When set to true, subsequent rules without patterns ("the rest") will skip this object.
 */
export declare const GEOMETRY_EDITING_SKIP_FLAG = "geometryEditingSkipRules";
/**
 * Clears the geometryEditingSkipRules flag on all nodes in the tree.
 * Should be called at the start of processing a new ruleset for a detector.
 */
export declare function clearGeometryEditingFlags(root: Object3D): void;
/**
 * Marks an object as processed by geometry editing rules.
 */
export declare function markAsProcessed(obj: Object3D): void;
/**
 * Checks if an object has been marked as already processed.
 */
export declare function isAlreadyProcessed(obj: Object3D): boolean;
/**
 * Checks if an object or any of its ancestors has been marked as processed.
 * This implements hierarchical skipping - if a parent branch was processed,
 * all descendants should be skipped too.
 */
export declare function isInProcessedBranch(obj: Object3D): boolean;
export declare enum EditThreeNodeActions {
    Merge = /** Merge children matching patterns (if patterns are provided) or all meshes of the node*/ 0
}
export interface EditThreeNodeRule {
    patterns?: string[] | string;
    merge?: boolean;
    newName?: string;
    deleteOrigins?: boolean;
    cleanupNodes?: boolean;
    outline?: boolean;
    outlineThresholdAngle?: number;
    simplifyMeshes?: boolean;
    simplifyRatio?: number;
    /**
     * When true and merge=false, if a pattern matches a node, all descendant meshes
     * of that node will also be included (styled the same way).
     * Defaults to true when merge=false and patterns are provided.
     */
    applyToDescendants?: boolean;
    /** [degrees] */
    outlineColor?: ColorRepresentation;
    material?: Material;
    color?: ColorRepresentation;
}
export declare function editThreeNodeContent(node: Object3D, rule: EditThreeNodeRule): void;
