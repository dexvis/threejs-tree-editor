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
exports.walkObject3DNodes = walkObject3DNodes;
exports.findObject3DNodes = findObject3DNodes;
exports.isColorable = isColorable;
exports.getColorOrDefault = getColorOrDefault;
exports.createOutline = createOutline;
exports.disposeNode = disposeNode;
exports.disposeOriginalMeshesAfterMerge = disposeOriginalMeshesAfterMerge;
exports.disposeHierarchy = disposeHierarchy;
exports.pruneEmptyNodes = pruneEmptyNodes;
var outmatch_1 = require("outmatch");
var THREE = require("three");
/**
 * Recursively walks through a THREE.Object3D hierarchy, invoking a callback on each node.
 *
 * @function walkObject3DNodes
 * @param {any} node - The current node in the Object3D hierarchy.
 * @param {NodeWalkCallback|null} callback - The function to execute on each node.
 * @param {NodeWalkOptions} [options={}] - Configuration options for the traversal.
 * @returns {number} - The total number of nodes processed.
 */
function walkObject3DNodes(node, callback, options) {
    if (options === void 0) { options = {}; }
    // Destructure and set default values for options
    var _a = options.maxLevel, maxLevel = _a === void 0 ? Infinity : _a, _b = options.level, level = _b === void 0 ? 0 : _b, _c = options.parentPath, parentPath = _c === void 0 ? "" : _c, _d = options.pattern, pattern = _d === void 0 ? null : _d;
    // Compile the pattern using outmatch if it's a string
    if (pattern) {
        pattern = typeof pattern === "string" ? (0, outmatch_1.default)(pattern) : pattern;
    }
    // Construct the full path of the current node
    var fullPath = parentPath ? "".concat(parentPath, "/").concat(node.name) : node.name;
    var processedNodes = 1;
    // Invoke the callback if the pattern matches or if no pattern is provided
    if (!pattern || pattern(fullPath)) {
        if (callback) {
            callback(node, fullPath, level);
        }
    }
    // Continue recursion if the node has children and the maximum level hasn't been reached
    if ((node === null || node === void 0 ? void 0 : node.children) && level < maxLevel) {
        // Iterate backwards to safely handle node removal during traversal
        for (var i = node.children.length - 1; i >= 0; i--) {
            var child = node.children[i];
            if (child) {
                processedNodes += walkObject3DNodes(child, callback, { maxLevel: maxLevel, level: level + 1, parentPath: fullPath, pattern: pattern });
            }
        }
    }
    return processedNodes;
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
function findObject3DNodes(parentNode, pattern, matchType, maxLevel) {
    if (matchType === void 0) { matchType = ""; }
    if (maxLevel === void 0) { maxLevel = Infinity; }
    var nodes = [];
    var fullPaths = [];
    var deepestLevel = 0;
    /**
     * Callback function to collect matching nodes.
     *
     * @param {any} node - The current node being processed.
     * @param {string} fullPath - The full hierarchical path to the current node.
     * @param {number} level - The current depth level in the hierarchy.
     * @returns {boolean} - Continues traversal.
     */
    var collectNodes = function (node, fullPath, level) {
        if (!matchType || matchType === node.type) {
            nodes.push(node);
            fullPaths.push(fullPath);
            if (level > deepestLevel) {
                deepestLevel = level;
            }
        }
        return true; // Continue traversal
    };
    // Execute the node walk with the collecting callback and the specified pattern
    var totalWalked = walkObject3DNodes(parentNode, collectNodes, { maxLevel: maxLevel, pattern: pattern });
    return {
        nodes: nodes,
        fullPaths: fullPaths,
        deepestLevel: deepestLevel,
        totalWalked: totalWalked
    };
}
/**
 * Type guard function to check if the material is colorable.
 *
 * @function isColorable
 * @param {any} material - The material to check.
 * @returns {material is Colorable} - Returns true if the material has a 'color' property, false otherwise.
 */
function isColorable(material) {
    return 'color' in material;
}
/**
 * Retrieves the color of a material if it is colorable; otherwise, returns a default color.
 *
 * @function getColorOrDefault
 * @param {any} material - The material whose color is to be retrieved.
 * @param {THREE.Color} defaultColor - The default color to return if the material is not colorable.
 * @returns {THREE.Color} - The color of the material if colorable, or the default color.
 */
function getColorOrDefault(material, defaultColor) {
    if (isColorable(material)) {
        return material.color;
    }
    else {
        return defaultColor;
    }
}
/**
 * Custom error class thrown when a mesh or object does not contain geometry.
 *
 * @class NoGeometryError
 * @extends {Error}
 */
var NoGeometryError = /** @class */ (function (_super) {
    __extends(NoGeometryError, _super);
    /**
     * Creates an instance of NoGeometryError.
     *
     * @constructor
     * @param {any} mesh - The mesh or object that lacks geometry.
     * @param {string} [message="Mesh (or whatever is provided) does not contain geometry."] - The error message.
     */
    function NoGeometryError(mesh, message) {
        if (message === void 0) { message = "Mesh (or whatever is provided) does not contain geometry."; }
        var _this = _super.call(this, message) || this;
        /**
         * The mesh or object that caused the error.
         *
         * @type {any}
         */
        _this.mesh = undefined;
        _this.name = "NoGeometryError";
        _this.mesh = mesh;
        return _this;
    }
    return NoGeometryError;
}(Error));
var globalOutlineCount = 0;
/**
 * Applies an outline mesh from lines to a mesh and adds the outline to the mesh's parent.
 *
 * @function createOutline
 * @param {any} mesh - A THREE.Object3D (expected to be a Mesh) to process.
 * @param {CreateOutlineOptions} [options={}] - Configuration options for the outline.
 * @throws {NoGeometryError} - Throws an error if the mesh does not contain geometry.
 */
function createOutline(mesh, options) {
    var _a, _b, _c;
    if (options === void 0) { options = {}; }
    if (!(mesh === null || mesh === void 0 ? void 0 : mesh.geometry)) {
        throw new NoGeometryError(mesh);
    }
    var _d = options || {}, _e = _d.color, color = _e === void 0 ? 0x555555 : _e, material = _d.material, _f = _d.thresholdAngle, thresholdAngle = _f === void 0 ? 40 : _f;
    // Generate edges geometry based on the threshold angle
    var edges = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
    var lineMaterial = material;
    // If no material is provided, create a default LineBasicMaterial
    if (!lineMaterial) {
        lineMaterial = new THREE.LineBasicMaterial({
            color: color !== null && color !== void 0 ? color : new THREE.Color(0x555555),
            fog: false,
            clippingPlanes: ((_a = mesh.material) === null || _a === void 0 ? void 0 : _a.clippingPlanes) ? mesh.material.clippingPlanes : [],
            clipIntersection: false,
            clipShadows: true,
            transparent: true
        });
    }
    // Create a LineSegments object for the outline
    var edgesLine = new THREE.LineSegments(edges, lineMaterial);
    edgesLine.name = ((_b = mesh.name) !== null && _b !== void 0 ? _b : "") + "_outline";
    edgesLine.userData = {};
    // Add the outline to the parent of the mesh
    mesh.updateMatrixWorld(true);
    (_c = mesh === null || mesh === void 0 ? void 0 : mesh.parent) === null || _c === void 0 ? void 0 : _c.add(edgesLine);
    globalOutlineCount++;
    if (globalOutlineCount > 0 && !(globalOutlineCount % 10000)) {
        console.warn("createOutline: Created: ".concat(globalOutlineCount, " outlines. (it is many)"));
    }
}
/**
 * Disposes of a THREE.Material and its associated texture maps.
 *
 * @function disposeMaterial
 * @param {any} material - The material to dispose of.
 */
function disposeMaterial(material) {
    var extMaterial = material;
    // Dispose of each texture map if it exists
    if (material === null || material === void 0 ? void 0 : material.map)
        material.map.dispose();
    if (material === null || material === void 0 ? void 0 : material.lightMap)
        material.lightMap.dispose();
    if (material === null || material === void 0 ? void 0 : material.bumpMap)
        material.bumpMap.dispose();
    if (material === null || material === void 0 ? void 0 : material.normalMap)
        material.normalMap.dispose();
    if (material === null || material === void 0 ? void 0 : material.specularMap)
        material.specularMap.dispose();
    if (material === null || material === void 0 ? void 0 : material.envMap)
        material.envMap.dispose();
    if (material === null || material === void 0 ? void 0 : material.alphaMap)
        material.alphaMap.dispose();
    if (material === null || material === void 0 ? void 0 : material.aoMap)
        material.aoMap.dispose();
    if (material === null || material === void 0 ? void 0 : material.displacementMap)
        material.displacementMap.dispose();
    if (material === null || material === void 0 ? void 0 : material.emissiveMap)
        material.emissiveMap.dispose();
    if (material === null || material === void 0 ? void 0 : material.gradientMap)
        material.gradientMap.dispose();
    if (material === null || material === void 0 ? void 0 : material.metalnessMap)
        material.metalnessMap.dispose();
    if (material === null || material === void 0 ? void 0 : material.roughnessMap)
        material.roughnessMap.dispose();
    // Dispose of the material itself
    if ('dispose' in material) {
        material.dispose();
    }
}
/**
 * Disposes of a THREE.Object3D node by disposing its geometry and materials.
 *
 * @function disposeNode
 * @param {any} node - The node to dispose of.
 */
function disposeNode(node) {
    // Dispose of geometry if it exists
    if (node === null || node === void 0 ? void 0 : node.geometry) {
        node.geometry.dispose();
    }
    // Dispose of materials if they exist
    if (node === null || node === void 0 ? void 0 : node.material) {
        if (Array.isArray(node.material)) {
            node.material.forEach(disposeMaterial);
        }
        else {
            disposeMaterial(node.material);
        }
    }
    // Remove the node from its parent
    node.removeFromParent();
}
/**
 * Disposes of the original meshes after merging geometries.
 *
 * @function disposeOriginalMeshesAfterMerge
 * @param {MergeResult} mergeResult - The result of the geometry merge containing nodes to remove.
 */
function disposeOriginalMeshesAfterMerge(mergeResult) {
    // Iterate through the children to remove in reverse order
    for (var i = mergeResult.childrenToRemove.length - 1; i >= 0; i--) {
        disposeNode(mergeResult.childrenToRemove[i]);
        mergeResult.childrenToRemove[i].removeFromParent();
    }
}
/**
 * Recursively disposes of a THREE.Object3D hierarchy.
 *
 * @function disposeHierarchy
 * @param {THREE.Object3D} node - The root node of the hierarchy to dispose of.
 * @param disposeSelf - disposes this node too (if false - only children and their hierarchies will be disposed)
 */
function disposeHierarchy(node, disposeSelf) {
    if (disposeSelf === void 0) { disposeSelf = true; }
    // Clone the children array and iterate in reverse order
    node.children.slice().reverse().forEach(function (child) {
        disposeHierarchy(child);
    });
    if (disposeSelf) {
        disposeNode(node);
    }
}
/**
 * Recursively removes empty branches from a THREE.Object3D tree.
 * An empty branch is a node without geometry and without any non-empty children.
 *
 * Removing useless nodes that were left without geometries speeds up overall rendering.
 *
 * @function pruneEmptyNodes
 * @param {THREE.Object3D} node - The starting node to prune empty branches from.
 */
function pruneEmptyNodes(node) {
    // Traverse children from last to first to avoid index shifting issues after removal
    for (var i = node.children.length - 1; i >= 0; i--) {
        pruneEmptyNodes(node.children[i]); // Recursively prune children first
    }
    // After pruning children, determine if the current node is now empty
    if (node.children.length === 0 && !(node === null || node === void 0 ? void 0 : node.geometry)) {
        node.removeFromParent();
    }
}
