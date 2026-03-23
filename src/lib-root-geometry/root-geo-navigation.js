"use strict";
/**
 * @date Created on July 10, 2024
 * @author Dmitry Romanov
 *
 * @license This file is part of Firebird display, which is released under a license agreement
 * available in the LICENSE file located in the root directory of this project source tree. This
 * file is subject to that license and is intended to be used in accordance with it.
 *
 * @summary This module provides utility functions for navigating and manipulating TGeo nodes within the CERN ROOT framework.
 * It includes functionalities to walk through geometric nodes with customizable callbacks, find nodes matching specific patterns,
 * and analyze nodes based on provided criteria.
 * Key functions include `walkGeoNodes`, `findGeoNodes`, `analyzeGeoNodes`.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.walkGeoNodes = walkGeoNodes;
exports.findGeoNodes = findGeoNodes;
exports.findSingleGeoNode = findSingleGeoNode;
exports.analyzeGeoNodes = analyzeGeoNodes;
exports.getGeoNodesByLevel = getGeoNodesByLevel;
exports.findGeoManager = findGeoManager;
var wildcard_1 = require("../app/utils/wildcard");
function walkGeoNodes(node, callback, maxLevel, level, path, pattern) {
    if (maxLevel === void 0) { maxLevel = 0; }
    if (level === void 0) { level = 0; }
    if (path === void 0) { path = ""; }
    var nodeName = node.fName;
    var volume = node.fMasterVolume === undefined ? node.fVolume : node.fMasterVolume;
    var subNodes = volume ? volume.fNodes : null;
    var nodeFullPath = path ? "".concat(path, "/").concat(nodeName) : nodeName;
    var processedNodes = 1;
    // Only invoke the callback if no pattern is provided or if the pattern matches the fullPath
    var processChildren = true;
    if (!pattern || (0, wildcard_1.wildCardCheck)(nodeFullPath, pattern)) {
        if (callback) {
            processChildren = callback(node, nodeFullPath, level);
            if (!processChildren) {
                return processedNodes;
            }
        }
    }
    // Continue recursion to child nodes if they exist and the max level is not reached
    if (volume && subNodes && level < maxLevel) {
        for (var i = subNodes.arr.length - 1; i >= 0; i--) {
            var childNode = subNodes.arr[i];
            if (childNode) {
                processedNodes += walkGeoNodes(childNode, callback, maxLevel, level + 1, nodeFullPath, pattern);
            }
        }
    }
    return processedNodes;
}
function findGeoNodes(node, pattern, maxLevel) {
    if (maxLevel === void 0) { maxLevel = Infinity; }
    var matchingNodes = [];
    // Define a callback using the GeoNodeWalkCallback type
    var collectNodes = function (geoNode, nodeFullPath, level) {
        matchingNodes.push({ geoNode: geoNode, fullPath: nodeFullPath });
        return true; // go through children
    };
    // Use walkGeoNodes with the collecting callback and the pattern
    walkGeoNodes(node, collectNodes, maxLevel, 0, "", pattern);
    return matchingNodes;
}
function findSingleGeoNode(topNode, pattern, maxLevel) {
    if (maxLevel === void 0) { maxLevel = Infinity; }
    var result = findGeoNodes(topNode, pattern, maxLevel);
    if (result === null || result === undefined) {
        return null;
    }
    if (result.length > 1) {
        throw new Error("findSingleGeoNode of ".concat(topNode, " returned more than 1 result (").concat(result.length, ")"));
    }
    if (result.length == 0) {
        return null;
    }
    return result[0].geoNode;
}
function analyzeGeoNodes(node, level) {
    if (level === void 0) { level = 2; }
    var highLevelNodes = getGeoNodesByLevel(node, 1);
    var totalNodes = 0;
    console.log("  --- Detector subcomponents [num]-[name]: ".concat(highLevelNodes.length));
    for (var _i = 0, highLevelNodes_1 = highLevelNodes; _i < highLevelNodes_1.length; _i++) {
        var item = highLevelNodes_1[_i];
        // Now run walkNodes for each of high level node to get number of subnodes
        var numSubNodes = walkGeoNodes(item.geoNode, null, Infinity);
        totalNodes += numSubNodes;
        console.log("    ".concat(numSubNodes, ": ").concat(item.fullPath));
    }
    console.log("  --- End of analysis --- Total elements: ".concat(totalNodes));
}
function getGeoNodesByLevel(topNode, selectLevel) {
    if (selectLevel === void 0) { selectLevel = 1; }
    var selectedNodes = [];
    // First we collect main nodes
    var collectNodes = function (node, fullPath, nodeLevel) {
        // Add a node to a watch
        if (nodeLevel == selectLevel) {
            selectedNodes.push({ geoNode: node, fullPath: fullPath });
            return false; // don't go deeper, we need this level
        }
        return true;
    };
    // Use walkGeoNodes with the collecting callback and the pattern
    walkGeoNodes(topNode, collectNodes, selectLevel);
    return selectedNodes;
}
function findGeoManager(file) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, key;
        return __generator(this, function (_b) {
            for (_i = 0, _a = file.fKeys; _i < _a.length; _i++) {
                key = _a[_i];
                if (key.fClassName === "TGeoManager") {
                    return [2 /*return*/, file.readObject(key.fName)];
                }
            }
            return [2 /*return*/, null];
        });
    });
}
