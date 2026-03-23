"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wildCardCheck = wildCardCheck;
function wildCardCheck(source, pattern) {
    var cp = 0;
    var mp = 0;
    var patternIndex = 0;
    var sourceIndex = 0;
    while (sourceIndex < source.length && pattern[patternIndex] !== '*') {
        if (pattern[patternIndex] !== source[sourceIndex] && pattern[patternIndex] !== '?') {
            return false;
        }
        patternIndex++;
        sourceIndex++;
    }
    while (sourceIndex < source.length) {
        if (pattern[patternIndex] === '*') {
            if (++patternIndex === pattern.length) {
                return true;
            }
            mp = patternIndex;
            cp = sourceIndex + 1;
        }
        else if (pattern[patternIndex] === source[sourceIndex] || pattern[patternIndex] === '?') {
            patternIndex++;
            sourceIndex++;
        }
        else {
            if (cp > source.length)
                return false; // Avoid accessing source out of bounds
            patternIndex = mp;
            sourceIndex = cp++;
        }
    }
    while (patternIndex < pattern.length && pattern[patternIndex] === '*') {
        patternIndex++;
    }
    return patternIndex === pattern.length;
}
