import { EditThreeNodeRule } from '../utils/three-geometry-editor';
import { Subdetector } from '../model/subdetector';
/**
 * A typed object that associates a name (or multiple names) with an array of edit rules.
 * E.g. { name: "DIRC_14", rules: [ { patterns: [...], ... } ] }
 */
export interface DetectorThreeRuleSet {
    names?: string[];
    name?: string;
    rules: EditThreeNodeRule[];
}
/**
 * Converts a raw JSON/JSONC array into typed DetectorThreeRuleSet objects.
 * If an EditThreeNodeRule has "materialJson", we parse it using THREE.MaterialLoader.
 */
export declare function ruleSetsFromObj(obj: any): DetectorThreeRuleSet[];
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
export declare function matchRulesToDetectors(ruleSets: DetectorThreeRuleSet[], detectors: Subdetector[]): Map<Subdetector, EditThreeNodeRule[]>;
export declare class ThreeGeometryProcessor {
    constructor();
    processRuleSets(ruleSets: DetectorThreeRuleSet[], detectors: Subdetector[]): void;
}
