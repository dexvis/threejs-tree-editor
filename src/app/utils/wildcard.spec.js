"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var wildcard_1 = require("./wildcard");
describe('wildCardCheck', function () {
    it('should match exactly without wildcards', function () {
        expect((0, wildcard_1.wildCardCheck)('hello', 'hello')).toBeTruthy();
    });
    it('should return false when patterns do not match', function () {
        expect((0, wildcard_1.wildCardCheck)('world', 'hello')).toBeFalsy();
    });
    it('should match a single character wildcard ?', function () {
        expect((0, wildcard_1.wildCardCheck)('hello', 'h?llo')).toBeTruthy();
        expect((0, wildcard_1.wildCardCheck)('hallo', 'h?llo')).toBeTruthy();
    });
    it('should match any sequence with *', function () {
        expect((0, wildcard_1.wildCardCheck)('hello', 'he*o')).toBeTruthy();
        expect((0, wildcard_1.wildCardCheck)('heooo', 'he*o')).toBeTruthy();
    });
    it('should match with multiple wildcards', function () {
        expect((0, wildcard_1.wildCardCheck)('hello', '*o')).toBeTruthy();
        expect((0, wildcard_1.wildCardCheck)('ho', 'h*o')).toBeTruthy();
        expect((0, wildcard_1.wildCardCheck)('abcde', 'a*c*e')).toBeTruthy();
    });
    it('should match with wildcards at both ends', function () {
        expect((0, wildcard_1.wildCardCheck)('xxhelloxx', '*hello*')).toBeTruthy();
    });
    it('should handle empty strings and wildcards correctly', function () {
        expect((0, wildcard_1.wildCardCheck)('', '*')).toBeTruthy();
        expect((0, wildcard_1.wildCardCheck)('', 'a*')).toBeFalsy();
        expect((0, wildcard_1.wildCardCheck)('', '')).toBeTruthy();
        expect((0, wildcard_1.wildCardCheck)('a', '')).toBeFalsy();
    });
    it('should match with complex patterns', function () {
        expect((0, wildcard_1.wildCardCheck)('axxbxxcxxdxe', 'a?*b*c*d*e*')).toBeTruthy();
    });
});
