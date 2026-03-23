"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var three_utils_1 = require("./three.utils");
var THREE = require("three");
var three_utils_2 = require("./three.utils");
describe('walkObject3dNodes', function () {
    var root;
    var callback;
    beforeEach(function () {
        // Create a simple scene graph: root -> child -> grandchild
        root = new THREE.Object3D();
        root.name = 'root';
        var child = new THREE.Object3D();
        child.name = 'child';
        root.add(child);
        var grandchild = new THREE.Object3D();
        grandchild.name = 'grandchild';
        child.add(grandchild);
        // Setup callback spy
        callback = jasmine.createSpy('callback');
    });
    it('should invoke callback for each node when no pattern is given', function () {
        (0, three_utils_1.walkObject3DNodes)(root, callback);
        expect(callback.calls.count()).toBe(3);
        expect(callback.calls.argsFor(0)).toEqual([root, 'root', 0]);
        expect(callback.calls.argsFor(1)).toEqual([root.children[0], 'root/child', 1]);
        expect(callback.calls.argsFor(2)).toEqual([root.children[0].children[0], 'root/child/grandchild', 2]);
    });
    it('should respect the maxLevel parameter', function () {
        (0, three_utils_1.walkObject3DNodes)(root, callback, { maxLevel: 1 });
        expect(callback.calls.count()).toBe(2);
    });
    it('should correctly match nodes when a pattern is given', function () {
        var pattern = 'root/child';
        (0, three_utils_1.walkObject3DNodes)(root, callback, { pattern: pattern });
        expect(callback).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'child' }), 'root/child', 1);
    });
    it('should return the correct number of processed nodes', function () {
        var processed = (0, three_utils_1.walkObject3DNodes)(root, callback);
        expect(processed).toBe(3); // Including root, child, grandchild
    });
    it('should not invoke callback for non-matching pattern', function () {
        var pattern = 'nonexistent';
        (0, three_utils_1.walkObject3DNodes)(root, callback, { pattern: pattern });
        expect(callback).not.toHaveBeenCalled();
    });
});
describe('Material color functions', function () {
    describe('isColorable', function () {
        it('should return true if material has a color property', function () {
            var colorableMaterial = { color: new THREE.Color(255, 0, 0) };
            expect((0, three_utils_2.isColorable)(colorableMaterial)).toBeTrue();
        });
        it('should return false if material does not have a color property', function () {
            var nonColorableMaterial = { noColor: true };
            expect((0, three_utils_2.isColorable)(nonColorableMaterial)).toBeFalse();
        });
    });
    describe('getColorOrDefault', function () {
        it('should return the material color if material is colorable', function () {
            var colorableMaterial = { color: new THREE.Color(255, 0, 0) };
            var defaultColor = new THREE.Color(0, 0, 0);
            expect((0, three_utils_2.getColorOrDefault)(colorableMaterial, defaultColor)).toEqual(colorableMaterial.color);
        });
        it('should return the default color if material is not colorable', function () {
            var nonColorableMaterial = { noColor: true };
            var defaultColor = new THREE.Color(0, 0, 0);
            expect((0, three_utils_2.getColorOrDefault)(nonColorableMaterial, defaultColor)).toEqual(defaultColor);
        });
    });
});
describe('findObject3DNodes', function () {
    var root, child1, child2, subchild1, subchild2;
    beforeEach(function () {
        // Setup a mock hierarchy of THREE.Object3D nodes
        root = new THREE.Object3D();
        root.name = 'root';
        child1 = new THREE.Object3D();
        child1.name = 'child1';
        root.add(child1);
        child2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
        child2.name = 'child2';
        root.add(child2);
        subchild1 = new THREE.Object3D();
        subchild1.name = 'subchild1';
        child1.add(subchild1);
        subchild2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
        subchild2.name = 'match';
        child2.add(subchild2);
    });
    it('should return all nodes when no pattern or type is provided', function () {
        var results = (0, three_utils_1.findObject3DNodes)(root, '');
        expect(results.nodes.length).toBe(5);
        expect(results.deepestLevel).toBe(2);
        expect(results.totalWalked).toBe(5);
    });
    it('should handle no matches found', function () {
        var results = (0, three_utils_1.findObject3DNodes)(root, 'nonexistent');
        expect(results.nodes.length).toBe(0);
    });
    it('should match nodes based on a pattern', function () {
        var results = (0, three_utils_1.findObject3DNodes)(root, '**/match');
        expect(results.nodes.length).toBe(1);
        expect(results.nodes[0]).toBe(subchild2);
        expect(results.fullPaths[0]).toBe('root/child2/match');
    });
    it('should filter nodes based on type', function () {
        var results = (0, three_utils_1.findObject3DNodes)(root, '', 'Mesh');
        expect(results.nodes.every(function (node) { return node instanceof THREE.Mesh; })).toBeTrue();
        expect(results.nodes.length).toBe(2); // Only child2 and subchild2 are Meshes
    });
    it('should respect the maxLevel parameter', function () {
        var results = (0, three_utils_1.findObject3DNodes)(root, '', '', 1);
        expect(results.deepestLevel).toBe(1);
        expect(results.totalWalked).toBe(3); // root, child1, child2
    });
    it('should throw an error for invalid parentNode', function () {
        expect(function () {
            (0, three_utils_1.findObject3DNodes)(null, '');
        }).toThrow();
    });
});
