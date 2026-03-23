"use strict";
/**
 * @date Created on July 10, 2024
 * @author Dmitry Romanov
 *
 * @license This file is part of Firebird display, which is released under a license agreement
 * available in the LICENSE file located in the root directory of this project source tree. This
 * file is subject to that license and is intended to be used in accordance with it.
 *
 * @summary Unit tests for CERN ROOT geometry navigation functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
var root_geo_navigation_1 = require("./root-geo-navigation");
describe('walkGeoNodes', function () {
    var mockCallback;
    var rootNode = {
        fName: "Root",
        fVolume: {
            fNodes: {
                arr: [
                    { fName: "Child1", fVolume: { fNodes: { arr: [{ fName: "GrandChild1", fVolume: { fNodes: { arr: [] } } }] } } },
                    { fName: "Child2", fVolume: { fNodes: { arr: [] } } }
                ]
            }
        }
    };
    beforeEach(function () {
        mockCallback = jasmine.createSpy('GeoNodeWalkCallback').and.returnValue(true);
        ;
    });
    it('should not traverse beyond the specified max level', function () {
        (0, root_geo_navigation_1.walkGeoNodes)(rootNode, mockCallback, 1);
        expect(mockCallback.calls.count()).toEqual(3); // Root, Child1, Child2
        expect(mockCallback).toHaveBeenCalledWith(jasmine.objectContaining({ fName: "Root" }), 'Root', 0);
        expect(mockCallback).toHaveBeenCalledWith(jasmine.objectContaining({ fName: "Child1" }), 'Root/Child1', 1);
        expect(mockCallback).toHaveBeenCalledWith(jasmine.objectContaining({ fName: "Child2" }), 'Root/Child2', 1);
    });
    it('should handle empty node volumes correctly', function () {
        var emptyNode = { fName: "Empty", fVolume: null };
        (0, root_geo_navigation_1.walkGeoNodes)(emptyNode, mockCallback, 1);
        expect(mockCallback.calls.count()).toEqual(1); // Only the empty node should invoke the callback
        expect(mockCallback).toHaveBeenCalledWith(emptyNode, 'Empty', 0);
    });
    it('should invoke callback for each node up to the specified max level', function () {
        (0, root_geo_navigation_1.walkGeoNodes)(rootNode, mockCallback, Infinity); // Using Infinity to check all levels
        expect(mockCallback.calls.count()).toEqual(4); // Root, Child1, GrandChild1, Child2
        expect(mockCallback).toHaveBeenCalledWith(jasmine.objectContaining({ fName: "Root" }), 'Root', 0);
        expect(mockCallback).toHaveBeenCalledWith(jasmine.objectContaining({ fName: "Child1" }), 'Root/Child1', 1);
        expect(mockCallback).toHaveBeenCalledWith(jasmine.objectContaining({ fName: "GrandChild1" }), 'Root/Child1/GrandChild1', 2);
        expect(mockCallback).toHaveBeenCalledWith(jasmine.objectContaining({ fName: "Child2" }), 'Root/Child2', 1);
    });
});
describe('findGeoNodes', function () {
    var rootNode = {
        fName: "Root",
        fVolume: {
            fNodes: {
                arr: [
                    { fName: "Child1", fVolume: { fNodes: { arr: [{ fName: "GrandChild1", fVolume: { fNodes: { arr: [] } } }] } } },
                    { fName: "Child2", fVolume: { fNodes: { arr: [] } } }
                ]
            }
        }
    };
    it('should return only nodes matching the specified pattern', function () {
        var pattern = "*Child2*";
        var results = (0, root_geo_navigation_1.findGeoNodes)(rootNode, pattern);
        expect(results.length).toBe(1);
        expect(results[0].fullPath).toContain('Root/Child2');
    });
    it('should return an empty array if no nodes match the pattern', function () {
        var pattern = "*NotExist*";
        var results = (0, root_geo_navigation_1.findGeoNodes)(rootNode, pattern);
        expect(results.length).toBe(0);
    });
    it('should stop search if maxLevel is reached', function () {
        var pattern = "*Child1";
        var results = (0, root_geo_navigation_1.findGeoNodes)(rootNode, pattern, 1);
        expect(results.length).toBe(1);
    });
    it('should handle patterns that match deeply nested nodes', function () {
        var pattern = "*GrandChild*";
        var results = (0, root_geo_navigation_1.findGeoNodes)(rootNode, pattern);
        expect(results.length).toBe(1);
        expect(results[0].fullPath).toContain('Root/Child1/GrandChild1');
    });
});
