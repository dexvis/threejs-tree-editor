"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreeGeometryProcessor = void 0;
exports.ruleSetsFromObj = ruleSetsFromObj;
exports.matchRulesToDetectors = matchRulesToDetectors;
var THREE = require("three");
var wildcard_1 = require("../utils/wildcard");
var three_geometry_editor_1 = require("../utils/three-geometry-editor");
/**
 * Converts a raw JSON/JSONC array into typed DetectorThreeRuleSet objects.
 * If an EditThreeNodeRule has "materialJson", we parse it using THREE.MaterialLoader.
 */
function ruleSetsFromObj(obj) {
    // Not an array => return empty
    if (!Array.isArray(obj)) {
        console.warn('ruleSetsFromObj: top-level object is not an array. Returning empty.');
        return [];
    }
    // Create a single MaterialLoader we can reuse for all materialJson objects
    var materialLoader = new THREE.MaterialLoader();
    return obj.map(function (item) {
        // Ensure we have a rules array
        if (!item.rules || !Array.isArray(item.rules)) {
            console.warn('ruleSetsFromObj: missing or invalid "rules" array in item:', item);
            return { rules: [] };
        }
        // Convert each rule
        var convertedRules = item.rules.map(function (r) {
            var rule = __assign({}, r);
            // 1) Convert a color from string hex "0xabcdef" => number
            if (typeof rule.color === 'string') {
                rule.color = parseInt(rule.color, 16);
            }
            // 2) If there's "materialJson", parse it using THREE.MaterialLoader
            if (r.materialJson && typeof r.materialJson === 'object') {
                try {
                    // Convert raw JSON to real material
                    var loadedMaterial = materialLoader.parse(r.materialJson);
                    rule.material = loadedMaterial;
                }
                catch (err) {
                    console.error('Failed to parse materialJson:', err, r.materialJson);
                }
            }
            return rule;
        });
        return {
            names: item.names,
            name: item.name,
            rules: convertedRules,
        };
    });
}
/**
 * Matches which set of rules should be applied to which detectors
 *
 * - Detectors are matched based on their `sourceGeometryName` against the names specified in the rulesets.
 * - Rule lists are matched to detectors in the order they appear in the rulesets
 * - Once a rule is applied to a detector, that detector is excluded from further rule matching, ensuring each detector is processed only once.
 * - If both `names` and `name` are provided in a ruleset, the function treats it as a user error in JSON rule editing but processes both without raising an exception.
 * - If a ruleset contains a wildcard name (`"*"`), it will apply its rules to any detectors not already matched by previous rulesets. So it should be placed in
 *
 * @param {Subdetector[]} detectors - The list of detectors to which the rules will be applied.
 * @param {DetectorThreeRuleSet[]} ruleSets - The set of rules to be applied, processed sequentially.
 * @return {Map<Subdetector, EditThreeNodeRule[]>} - A map associating each detector with an array of the rules applied to it.
 */
function matchRulesToDetectors(ruleSets, detectors) {
    var unassignedDetectors = new Set(detectors);
    var detectorRulesMap = new Map();
    for (var _i = 0, ruleSets_1 = ruleSets; _i < ruleSets_1.length; _i++) {
        var ruleSet = ruleSets_1[_i];
        var targets = new Set();
        var names = new Set(ruleSet.names || []);
        // Handle possible user error where both 'name' and 'names' are provided.
        if (ruleSet.name) {
            names.add(ruleSet.name);
        }
        for (var _a = 0, names_1 = names; _a < names_1.length; _a++) {
            var name_1 = names_1[_a];
            for (var _b = 0, unassignedDetectors_1 = unassignedDetectors; _b < unassignedDetectors_1.length; _b++) {
                var det = unassignedDetectors_1[_b];
                if ((0, wildcard_1.wildCardCheck)(det.sourceGeometryName, name_1)) {
                    targets.add(det);
                    detectorRulesMap.set(det, ruleSet.rules || []);
                    unassignedDetectors.delete(det); // Move deletion here to optimize
                }
            }
        }
    }
    return detectorRulesMap;
}
var ThreeGeometryProcessor = /** @class */ (function () {
    function ThreeGeometryProcessor() {
    }
    ThreeGeometryProcessor.prototype.processRuleSets = function (ruleSets, detectors) {
        console.log("[processRuleSets] Applying ".concat(ruleSets.length, " theme rules..."));
        var totalTimePerfMessage = "[processRuleSets] Time applying rules";
        console.time(totalTimePerfMessage);
        var detRulesMap = matchRulesToDetectors(ruleSets, detectors);
        for (var _i = 0, detRulesMap_1 = detRulesMap; _i < detRulesMap_1.length; _i++) {
            var _a = detRulesMap_1[_i], detector = _a[0], ruleSet = _a[1];
            // Some performance metrics
            var start = performance.now();
            // Actually apply rules
            for (var _b = 0, ruleSet_1 = ruleSet; _b < ruleSet_1.length; _b++) {
                var rule = ruleSet_1[_b];
                (0, three_geometry_editor_1.editThreeNodeContent)(detector.geometry, rule);
            }
            // Check the rule didn't take too long
            var end = performance.now();
            var elapsed = end - start;
            if (elapsed > 500) {
                console.log("[processRuleSet] Applying rules took >0.5s: ".concat(elapsed.toFixed(1), " for ").concat(detector.name));
            }
        }
        console.timeEnd(totalTimePerfMessage);
    };
    return ThreeGeometryProcessor;
}());
exports.ThreeGeometryProcessor = ThreeGeometryProcessor;
