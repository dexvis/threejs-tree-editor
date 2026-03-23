"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditThreeNodeActions = void 0;
exports.editThreeNodeContent = editThreeNodeContent;
var three_1 = require("three");
var three_utils_1 = require("./three.utils");
var three_geometry_merge_1 = require("./three-geometry-merge");
var SimplifyModifier_js_1 = require("three/examples/jsm/modifiers/SimplifyModifier.js");
var EditThreeNodeActions;
(function (EditThreeNodeActions) {
    EditThreeNodeActions[EditThreeNodeActions["Merge"] = 0] = "Merge";
})(EditThreeNodeActions || (exports.EditThreeNodeActions = EditThreeNodeActions = {}));
function simplifyMeshTree(object, simplifyRatio) {
    if (simplifyRatio === void 0) { simplifyRatio = 0.5; }
    var simplifier = new SimplifyModifier_js_1.SimplifyModifier();
    var minVerts = 10;
    object.traverse(function (child) {
        // Type coercions and type validations
        if (!child.isMesh) {
            return;
        }
        var mesh = child;
        if (!mesh.geometry.isBufferGeometry) {
            return;
        }
        var geom = mesh.geometry;
        if (!geom.attributes['position']) {
            return;
        }
        // Do we need to convert looking at the number of vertices?
        var verticeCount = geom.attributes['position'].count;
        var targetVerticeCount = Math.floor(verticeCount * simplifyRatio);
        if (verticeCount < minVerts) {
            console.log("[SimplifyMeshTree] Mesh \"".concat(mesh.name || '(unnamed)', "\": skipped (too small, vertices=").concat(verticeCount, ")"));
            return;
        }
        if (verticeCount < targetVerticeCount) {
            console.log("[SimplifyMeshTree] Mesh \"".concat(mesh.name || '(unnamed)', "\": skipped (too small targetVerticeCount, targetVerticeCount=").concat(targetVerticeCount, ")"));
            return;
        }
        // Actual simplification
        var timeStart = performance.now();
        console.log("[SimplifyMeshTree] Processing \"".concat(mesh.name || '(unnamed)', "\": vertices before=").concat(verticeCount, ", after=").concat(targetVerticeCount));
        mesh.geometry = simplifier.modify(geom, targetVerticeCount);
        // Recompute bounding limits
        mesh.geometry.computeBoundingBox();
        mesh.geometry.computeBoundingSphere();
        mesh.geometry.computeVertexNormals();
        // Make sure positions and normals will be updated
        mesh.geometry.attributes["position"]["needsUpdate"] = true;
        if (mesh.geometry.attributes["normal"]) {
            mesh.geometry.attributes["normal"]["needsUpdate"] = true;
        }
        var timeEnd = performance.now();
        if (timeEnd - timeStart > 500) {
            console.warn("[SimplifyMeshTree] Warn: mesh \"".concat(mesh.name || '(unnamed)', "\" took ").concat(Math.round(timeEnd - timeStart), "ms to simplify."));
        }
    });
}
function mergeWhatever(node, rule) {
    var _a;
    var newName = !rule.newName ? node.name + "_merged" : rule.newName;
    if (!rule.patterns) {
        // If user provided patterns only children matching patterns (search goes over whole branch) will be merged,
        // But if no patterns given, we will merge whole node
        return (0, three_geometry_merge_1.mergeBranchGeometries)(node, newName, rule.material); // Children auto removed
    }
    // If we are here, we need to collect what to merge first
    var mergeSubjects = [];
    // merge whole node
    if (typeof rule.patterns === "string") {
        rule.patterns = [rule.patterns];
    }
    for (var _i = 0, _b = rule.patterns; _i < _b.length; _i++) {
        var pattern = _b[_i];
        mergeSubjects.push.apply(mergeSubjects, (0, three_utils_1.findObject3DNodes)(node, pattern, "Mesh").nodes);
    }
    var result = (0, three_geometry_merge_1.mergeMeshList)(mergeSubjects, node, newName, rule.material);
    var deleteOrigins = (_a = rule === null || rule === void 0 ? void 0 : rule.deleteOrigins) !== null && _a !== void 0 ? _a : true;
    if (result && deleteOrigins) {
        (0, three_utils_1.disposeOriginalMeshesAfterMerge)(result);
    }
    return result;
}
function editThreeNodeContent(node, rule) {
    var patterns = rule.patterns, _a = rule.deleteOrigins, deleteOrigins = _a === void 0 ? true : _a, _b = rule.cleanupNodes, cleanupNodes = _b === void 0 ? true : _b, _c = rule.outline, outline = _c === void 0 ? true : _c, _d = rule.outlineThresholdAngle, outlineThresholdAngle = _d === void 0 ? 40 : _d, outlineColor = rule.outlineColor, _e = rule.simplifyMeshes, simplifyMeshes = _e === void 0 ? false : _e, _f = rule.simplifyRatio, simplifyRatio = _f === void 0 ? 0.7 : _f, material = rule.material, color = rule.color, _g = rule.merge, merge = _g === void 0 ? true : _g, _h = rule.newName, newName = _h === void 0 ? "" : _h;
    var targetMeshes = [];
    if (merge) {
        // Existing merge logic
        var result = mergeWhatever(node, rule);
        if (!result) {
            console.warn("didn't find children to merge. Patterns:");
            console.log(patterns);
            return;
        }
        targetMeshes = [result.mergedMesh];
    }
    else {
        // New logic for when merge is false
        // Find all meshes that match the patterns, similar to mergeWhatever
        if (!patterns) {
            // If no patterns given, collect all meshes with geometry in the node
            node.traverse(function (child) {
                if (child === null || child === void 0 ? void 0 : child.geometry) {
                    targetMeshes.push(child);
                }
            });
        }
        else {
            // If patterns are given, find all meshes that match
            if (typeof patterns === "string") {
                patterns = [patterns];
            }
            for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
                var pattern = patterns_1[_i];
                targetMeshes.push.apply(targetMeshes, (0, three_utils_1.findObject3DNodes)(node, pattern, "Mesh").nodes);
            }
        }
    }
    // Apply operations to each target mesh
    for (var _j = 0, targetMeshes_1 = targetMeshes; _j < targetMeshes_1.length; _j++) {
        var targetMesh = targetMeshes_1[_j];
        // Change color
        if (color !== undefined && color !== null) {
            if (targetMesh.material) {
                targetMesh.material.color = new three_1.Color(color);
            }
        }
        // Change material
        if (material !== undefined && material !== null) {
            targetMesh.material = material;
        }
        if (simplifyMeshes) {
            simplifyMeshTree(targetMesh, simplifyRatio);
        }
        if (outline) {
            (0, three_utils_1.createOutline)(targetMesh, { color: outlineColor, thresholdAngle: outlineThresholdAngle });
        }
    }
    if (cleanupNodes) {
        (0, three_utils_1.pruneEmptyNodes)(node);
    }
}
