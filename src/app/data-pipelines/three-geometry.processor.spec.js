"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var THREE = require("three");
var three_geometry_processor_1 = require("./three-geometry.processor");
describe('ruleSetsFromObj with materialJson', function () {
    it('should parse "materialJson" into a real THREE.Material', function () {
        var raw = [
            {
                names: ['MyDetector'],
                rules: [
                    {
                        color: '0xff00ff',
                        materialJson: {
                            // The minimal JSON structure for the built-in MaterialLoader
                            type: 'MeshStandardMaterial',
                            color: 16711680, // 0xff0000
                            roughness: 0.5
                        }
                    },
                    {
                        // a second rule with no materialJson => no parse attempt
                        color: '0x00ffff'
                    }
                ]
            }
        ];
        var sets = (0, three_geometry_processor_1.ruleSetsFromObj)(raw);
        expect(sets.length).toBe(1);
        var set = sets[0];
        expect(set.names).toEqual(['MyDetector']);
        expect(set.rules.length).toBe(2);
        // First rule
        var rule1 = set.rules[0];
        // color: '0xff00ff' => number
        expect(rule1.color).toBe(0xff00ff);
        // Check that a THREE.Material was created from materialJson
        expect(rule1.material).toBeDefined();
        expect(rule1.material).toBeInstanceOf(THREE.MeshStandardMaterial);
        var mat1 = rule1.material;
        // color: 16711680 => 0xff0000
        expect(mat1.color.getHex()).toBe(0xff0000);
        expect(mat1.roughness).toBe(0.5);
        // Second rule => no materialJson, so no .material created
        var rule2 = set.rules[1];
        expect(rule2.color).toBe(0x00ffff);
        expect(rule2.material).toBeUndefined();
    });
    it('should handle parse errors gracefully', function () {
        var raw = [
            {
                rules: [
                    {
                        materialJson: {
                            type: 'UnknownMaterialType', // invalid
                            color: 0xffffff
                        }
                    }
                ]
            }
        ];
        spyOn(console, 'error');
        var sets = (0, three_geometry_processor_1.ruleSetsFromObj)(raw);
        expect(sets.length).toBe(1);
        expect(sets[0].rules[0].material).toBeUndefined(); // parse failed
        expect(console.error).toHaveBeenCalled(); // logs the parse error
    });
    it('should return an empty list if top-level is not array', function () {
        var result = (0, three_geometry_processor_1.ruleSetsFromObj)({ nonsense: true });
        expect(result).toEqual([]);
    });
    it('should handle missing "rules" arrays by returning an empty "rules"', function () {
        var raw = [
            {
                names: ['NoRulesHere']
            }
        ];
        var sets = (0, three_geometry_processor_1.ruleSetsFromObj)(raw);
        expect(sets[0].rules.length).toBe(0);
    });
});
