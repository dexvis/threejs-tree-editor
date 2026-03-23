"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoMaterialError = exports.NoGeometriesFoundError = void 0;
exports.mergeBranchGeometries = mergeBranchGeometries;
exports.mergeMeshList = mergeMeshList;
var THREE = require("three");
var BufferGeometryUtils_js_1 = require("three/examples/jsm/utils/BufferGeometryUtils.js");
var NoGeometriesFoundError = /** @class */ (function (_super) {
    __extends(NoGeometriesFoundError, _super);
    function NoGeometriesFoundError(message) {
        if (message === void 0) { message = "No geometries found in the provided node."; }
        var _this = _super.call(this, message) || this;
        _this.name = "NoGeometriesFoundError";
        return _this;
    }
    return NoGeometriesFoundError;
}(Error));
exports.NoGeometriesFoundError = NoGeometriesFoundError;
var NoMaterialError = /** @class */ (function (_super) {
    __extends(NoMaterialError, _super);
    function NoMaterialError(message) {
        if (message === void 0) { message = "No material set or found in geometries."; }
        var _this = _super.call(this, message) || this;
        _this.name = "NoMaterialError";
        return _this;
    }
    return NoMaterialError;
}(Error));
exports.NoMaterialError = NoMaterialError;
/**
 * Merges all geometries in a branch of the scene graph into a single geometry.
 * @param parentNode The parent node of the branch to merge.
 * @param name  Name of the new merged geometry node
 * @param material Material to assign to the merged geometry, if empty the first material found will be used
 * @returns MergeResult object containing the merged geometry, material, children to remove, and parent node
 */
function mergeBranchGeometries(parentNode, name, material) {
    var geometries = [];
    var childrenToRemove = [];
    // Recursively collect geometries from the branch
    var collectGeometries = function (node) {
        node.traverse(function (child) {
            var _a, _b;
            var isBufferGeometry = (_b = (_a = child === null || child === void 0 ? void 0 : child.geometry) === null || _a === void 0 ? void 0 : _a.isBufferGeometry) !== null && _b !== void 0 ? _b : false;
            //console.log(isBufferGeometry);
            if (isBufferGeometry) {
                child.updateMatrixWorld(true);
                var clonedGeometry = child.geometry.clone();
                clonedGeometry.applyMatrix4(child.matrixWorld);
                geometries.push(clonedGeometry);
                material = material || child.material;
                childrenToRemove.push(child);
            }
        });
    };
    collectGeometries(parentNode);
    if (geometries.length === 0) {
        throw new NoGeometriesFoundError();
    }
    else if (material === undefined) {
        throw new NoMaterialError();
    }
    // Merge all collected geometries
    var mergedGeometry = (0, BufferGeometryUtils_js_1.mergeGeometries)(geometries, false);
    // Transform the merged geometry to the local space of the parent node
    var parentInverseMatrix = new THREE.Matrix4().copy(parentNode.matrixWorld).invert();
    mergedGeometry.applyMatrix4(parentInverseMatrix);
    // Create a new mesh with the merged geometry and the collected material
    var mergedMesh = new THREE.Mesh(mergedGeometry, material);
    // Remove the original children that are meshes and add the new merged mesh
    // Remove and dispose the original children
    childrenToRemove.forEach(function (child) {
        var _a, _b, _c, _d, _e, _f;
        child.geometry.dispose();
        (_a = child === null || child === void 0 ? void 0 : child.parent) === null || _a === void 0 ? void 0 : _a.remove(child);
        // Remove empty parents
        if (((_d = (_c = (_b = child === null || child === void 0 ? void 0 : child.parent) === null || _b === void 0 ? void 0 : _b.children) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 1) === 0) {
            (_f = (_e = child === null || child === void 0 ? void 0 : child.parent) === null || _e === void 0 ? void 0 : _e.parent) === null || _f === void 0 ? void 0 : _f.remove(child.parent);
        }
    });
    mergedMesh.name = name;
    parentNode.add(mergedMesh);
    return {
        mergedGeometry: mergedGeometry,
        mergedMesh: mergedMesh,
        material: material,
        childrenToRemove: childrenToRemove,
        parentNode: parentNode
    };
}
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
function mergeMeshList(meshes, parentNode, name, material) {
    var geometries = [];
    // Collect geometries and materials from the provided meshes
    meshes.forEach(function (mesh) {
        var _a;
        if ((_a = mesh === null || mesh === void 0 ? void 0 : mesh.geometry) === null || _a === void 0 ? void 0 : _a.isBufferGeometry) {
            mesh.updateMatrixWorld(true);
            var clonedGeometry = mesh.geometry.clone();
            clonedGeometry.applyMatrix4(mesh.matrixWorld);
            geometries.push(clonedGeometry);
            // Check if mesh.material is an array and handle it
            if (!material) { // Only set if material has not been set yet
                if (Array.isArray(mesh.material)) {
                    material = mesh.material[0]; // Use the first material if it's an array
                }
                else {
                    material = mesh.material; // Use the material directly if it's not an array
                }
            }
        }
    });
    if (geometries.length === 0) {
        return undefined;
        //throw new NoGeometriesFoundError();
    }
    if (!material) {
        return undefined;
        //throw new NoMaterialError();
    }
    // Merge all collected geometries
    var mergedGeometry = (0, BufferGeometryUtils_js_1.mergeGeometries)(geometries, false);
    // Transform the merged geometry to the local space of the parent node
    var parentInverseMatrix = new THREE.Matrix4().copy(parentNode.matrixWorld).invert();
    mergedGeometry.applyMatrix4(parentInverseMatrix);
    // Create a new mesh with the merged geometry and the collected material
    var mergedMesh = new THREE.Mesh(mergedGeometry, material);
    mergedMesh.name = name;
    parentNode.add(mergedMesh);
    return {
        mergedGeometry: mergedGeometry,
        mergedMesh: mergedMesh,
        material: material,
        childrenToRemove: meshes, // Here, we assume the original meshes are what would be removed if needed
        parentNode: parentNode
    };
}
