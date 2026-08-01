import * as e from "three";
import { Color as t } from "three";
import { mergeGeometries as n } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { SimplifyModifier as r } from "three/examples/jsm/modifiers/SimplifyModifier.js";
//#region ../../node_modules/outmatch/build/index.es.mjs
function i(e) {
	if (e.length < 3) return "{" + e + "}";
	for (var t = -1, n = 2; n < e.length; n++) if (e[n] === "." && e[n - 1] === "." && (n < 2 || e[n - 2] !== "\\")) {
		if (t > -1) return "{" + e + "}";
		t = n - 1;
	}
	if (t > -1) {
		var r = e.substr(0, t), i = e.substr(t + 2);
		if (r.length > 0 && i.length > 0) return "[" + e.substr(0, t) + "-" + e.substr(t + 2) + "]";
	}
	return "{" + e + "}";
}
function a(e) {
	if (typeof e != "string") throw TypeError("A pattern must be a string, but " + typeof e + " given");
	for (var t = !1, n = 0, r = 0, o = -1, s = [""], c = [], l, u = 0; u < e.length; u++) {
		var d = e[u];
		if (d === "\\") {
			u++;
			continue;
		}
		if (d === "{") if (t) n++;
		else if (u > o && !n) {
			l = e.substring(o + 1, u);
			for (var f = 0; f < s.length; f++) s[f] += l;
			c = [], o = u, t = !0, n++;
		} else n--;
		else if (d === "}") if (t) r++;
		else if (r === 1) {
			if (l = e.substring(o + 1, u), c.length > 0) {
				var p = [];
				c.push(a(l));
				for (var f = 0; f < s.length; f++) for (var m = 0; m < c.length; m++) for (var h = 0; h < c[m].length; h++) p.push(s[f] + c[m][h]);
				s = p;
			} else {
				l = i(l);
				for (var f = 0; f < s.length; f++) s[f] += l;
			}
			o = u, r--;
		} else r--;
		else !t && d === "," && r - n === 1 && (l = e.substring(o + 1, u), c.push(a(l)), o = u);
		t && (r === n || u === e.length - 1) && (t = !1, u = o - 1);
	}
	if (o === -1) return [e];
	var g = e[o] === "{" ? o : o + 1;
	if (g < e.length) {
		l = e.substr(g);
		for (var f = 0; f < s.length; f++) s[f] += l;
	}
	return s;
}
function o(e, t) {
	var n = t["!"] !== !1, r = t["()"] !== !1, i = !1, a;
	if (n) {
		for (a = 0; a < e.length && e[a] === "!"; a++) {
			if (r && e[a + 1] === "(") {
				a--;
				break;
			}
			i = !i;
		}
		a > 0 && (e = e.substr(a));
	}
	return {
		pattern: e,
		isNegated: i
	};
}
function s(e) {
	return e === "-" || e === "^" || e === "$" || e === "+" || e === "." || e === "(" || e === ")" || e === "|" || e === "[" || e === "]" || e === "{" || e === "}" || e === "*" || e === "?" || e === "\\" ? "\\" + e : e;
}
function c(e) {
	for (var t = "", n = 0; n < e.length; n++) t += s(e[n]);
	return t;
}
function l(e, t, n) {
	var r = t.separator === void 0 || t.separator, i = "", a = "", o = ".";
	r === !0 ? (i = "/", a = "[/\\\\]", o = "[^/\\\\]") : r ? (i = r, a = c(i), a.length > 1 ? (a = "(?:" + a + ")", o = "((?!" + a + ").)") : o = "[^" + a + "]") : o = ".";
	var s = r ? a + "+?" : "", l = r ? a + "*?" : "", u = r ? e.split(i) : [e], d = {
		qMark: t["?"] !== !1,
		star: t["*"] !== !1,
		globstar: r && t["**"] !== !1,
		brackets: t["[]"] !== !1,
		extglobs: t["()"] !== !1,
		excludeDot: n && t.excludeDot !== !1
	};
	return {
		source: e,
		segments: u,
		options: t,
		separator: r,
		separatorSplitter: i,
		separatorMatcher: a,
		optionalSeparator: l,
		requiredSeparator: s,
		wildcard: o,
		support: d
	};
}
function u(e, t, n, r) {
	return {
		source: e,
		isFirst: n,
		isLast: r,
		end: e.length - 1
	};
}
function d() {
	return {
		match: "",
		unmatch: "",
		useUnmatch: !1
	};
}
function f(e, t, n) {
	return {
		pattern: e,
		segment: t,
		result: n,
		openingBracket: t.end + 1,
		closingBracket: -1,
		openingParens: 0,
		closingParens: 0,
		parensHandledUntil: -1,
		extglobModifiers: [],
		scanningForParens: !1,
		escapeChar: !1,
		addToMatch: !0,
		addToUnmatch: e.support.extglobs,
		dotHandled: !1,
		i: -1,
		char: "",
		nextChar: ""
	};
}
var p = "(?!\\.)";
function m(e, t, n) {
	return e.addToUnmatch && (e.result.unmatch += t), e.addToMatch && (n && !e.dotHandled && (t = p + t), e.dotHandled = !0, e.result.match += t), e.result;
}
function h(e, t, n) {
	var r = e.support, i = f(e, t, n), a = t.isLast ? e.optionalSeparator : e.requiredSeparator;
	if (r.excludeDot || (i.dotHandled = !0), t.end === -1) return t.isLast && !t.isFirst ? n : m(i, a);
	if (r.globstar && t.source === "**") return m(i, "(?:" + ((i.dotHandled ? "" : p) + e.wildcard + "*?" + a) + ")*?");
	for (; ++i.i <= t.end;) {
		if (i.char = i.segment.source[i.i], i.nextChar = i.i < t.end ? t.source[i.i + 1] : "", i.char === "\\") if (i.i < i.segment.end) {
			i.escapeChar = !0;
			continue;
		} else i.char = "";
		var e = i.pattern, t = i.segment, o = i.char, c = i.i;
		if (e.support.brackets && !i.scanningForParens) {
			if (c > i.openingBracket && c <= i.closingBracket) {
				i.escapeChar ? m(i, s(o)) : c === i.closingBracket ? (m(i, "]"), i.openingBracket = t.source.length) : o === "-" && c === i.closingBracket - 1 ? m(i, "\\-") : o === "!" && c === i.openingBracket + 1 ? m(i, "^") : o === "]" ? m(i, "\\]") : m(i, o), i.escapeChar = !1;
				continue;
			}
			if (c > i.openingBracket) {
				o === "]" && !i.escapeChar && c > i.openingBracket + 1 && c > i.closingBracket ? (i.closingBracket = c, i.i = i.openingBracket, e.separator ? m(i, "(?!" + e.separatorMatcher + ")[", !0) : m(i, "[", !0)) : c === t.end && (m(i, "\\["), i.i = i.openingBracket, i.openingBracket = t.source.length, i.closingBracket = t.source.length), i.escapeChar = !1;
				continue;
			}
			if (o === "[" && !i.escapeChar && c > i.closingBracket && c < t.end) {
				i.openingBracket = c, i.escapeChar = !1;
				continue;
			}
		}
		if (i.pattern.support.extglobs) {
			var l = i.extglobModifiers, o = i.char, u = i.nextChar, c = i.i;
			if (u === "(" && !i.escapeChar && (o === "@" || o === "?" || o === "*" || o === "+" || o === "!")) if (i.scanningForParens) i.openingParens++;
			else if (c > i.parensHandledUntil && !i.closingParens) i.parensHandledUntil = c, i.scanningForParens = !0, i.openingParens++;
			else if (i.closingParens >= i.openingParens) {
				o === "!" && (i.addToMatch = !0, i.addToUnmatch = !1, m(i, i.pattern.wildcard + "*?", !0), i.addToMatch = !1, i.addToUnmatch = !0, i.result.useUnmatch = !0), l.push(o), m(i, "(?:", !0), i.openingParens--, i.i++;
				continue;
			} else i.openingParens--;
			else if (o === ")" && !i.escapeChar) {
				if (i.scanningForParens) i.closingParens++;
				else if (l.length) {
					var d = l.pop();
					if (d === "!" && l.indexOf("!") !== -1) throw Error("Nested negated extglobs aren't supported");
					d = d === "!" || d === "@" ? "" : d, m(i, ")" + d), i.addToMatch = !0, i.addToUnmatch = !0, i.closingParens--;
					continue;
				}
			} else if (o === "|" && i.closingParens && !i.scanningForParens && !i.escapeChar) {
				m(i, "|");
				continue;
			}
			if (i.scanningForParens) {
				(i.closingParens === i.openingParens || c === i.segment.end) && (i.scanningForParens = !1, i.i = i.parensHandledUntil - 1), i.escapeChar = !1;
				continue;
			}
		}
		var e = i.pattern, r = e.support;
		!i.escapeChar && r.star && i.char === "*" ? (i.i === i.segment.end || i.nextChar !== "*") && m(i, e.wildcard + "*?", !0) : !i.escapeChar && r.qMark && i.char === "?" ? m(i, e.wildcard, !0) : m(i, s(i.char)), i.escapeChar = !1;
	}
	return m(i, a);
}
function g(e, t, n) {
	for (var r = l(e, t, n), i = d(), a = r.segments, o = 0; o < a.length; o++) h(r, u(a[o], r, o === 0, o === a.length - 1), i);
	return i.useUnmatch ? "(?!^" + i.unmatch + "$)" + i.match : i.match;
}
function _(e, t) {
	for (var n = [], r = 0; r < e.length; r++) for (var i = t(e[r]), a = 0; a < i.length; a++) n.push(i[a]);
	return n;
}
function v(e, t) {
	e = Array.isArray(e) ? e : [e], t["{}"] !== !1 && (e = _(e, a));
	for (var n = [], r = [], i = "", s = 0; s < e.length; s++) {
		var c = o(e[s], t), l = g(c.pattern, t, !c.isNegated);
		c.isNegated ? r.push(l) : n.push(l);
	}
	return r.length && (i = "(?!(?:" + r.join("|") + ")$)"), n.length > 1 ? i += "(?:" + n.join("|") + ")" : n.length === 1 ? i += n[0] : i.length && (i += g("**", t, !0)), "^" + i + "$";
}
function y(e, t) {
	if (typeof t != "string") throw TypeError("Sample must be a string, but " + typeof t + " given");
	return e.test(t);
}
function b(e, t) {
	if (typeof e != "string" && !Array.isArray(e)) throw TypeError("The first argument must be a single pattern string or an array of patterns, but " + typeof e + " given");
	if ((typeof t == "string" || typeof t == "boolean") && (t = { separator: t }), arguments.length === 2 && !(t === void 0 || typeof t == "object" && t && !Array.isArray(t))) throw TypeError("The second argument must be an options object or a string/boolean separator, but " + typeof t + " given");
	if (t ||= {}, t.separator === "\\") throw Error("\\ is not a valid separator");
	var n = v(e, t), r = new RegExp(n, t.flags), i = y.bind(null, r);
	return i.options = t, i.pattern = e, i.regexp = r, i;
}
//#endregion
//#region src/app/utils/three.utils.ts
function x(e, t, n = {}) {
	let { maxLevel: r = Infinity, level: i = 0, parentPath: a = "", pattern: o = null } = n;
	o &&= typeof o == "string" ? b(o) : o;
	let s = a ? `${a}/${e.name}` : e.name, c = 1;
	if ((!o || o(s)) && t && t(e, s, i), e?.children && i < r) for (let n = e.children.length - 1; n >= 0; n--) {
		let a = e.children[n];
		a && (c += x(a, t, {
			maxLevel: r,
			level: i + 1,
			parentPath: s,
			pattern: o
		}));
	}
	return c;
}
function S(e, t, n = "", r = Infinity) {
	let i = [], a = [], o = 0, s = x(e, (e, t, r) => ((!n || n === e.type) && (i.push(e), a.push(t), r > o && (o = r)), !0), {
		maxLevel: r,
		pattern: t
	});
	return {
		nodes: i,
		fullPaths: a,
		deepestLevel: o,
		totalWalked: s
	};
}
function C(e) {
	return "color" in e;
}
function w(e, t) {
	return C(e) ? e.color : t;
}
var T = class extends Error {
	constructor(e, t = "Mesh (or whatever is provided) does not contain geometry.") {
		super(t), this.mesh = void 0, this.name = "NoGeometryError", this.mesh = e;
	}
}, E = 0;
function D(t, n = {}) {
	if (!t?.geometry) throw new T(t);
	let { color: r = 5592405, material: i, thresholdAngle: a = 40, markAsProcessed: o = !1 } = n || {}, s = new e.EdgesGeometry(t.geometry, a), c = i;
	c ||= new e.LineBasicMaterial({
		color: r ?? new e.Color(5592405),
		fog: !1,
		clippingPlanes: t.material?.clippingPlanes ? t.material.clippingPlanes : [],
		clipIntersection: !1,
		clipShadows: !0,
		transparent: !0
	});
	let l = new e.LineSegments(s, c);
	l.name = (t.name ?? "") + "_outline", l.userData = {}, o && (l.userData.geometryEditingSkipRules = !0), t.updateMatrixWorld(!0), t?.parent?.add(l), E++, E > 0 && !(E % 1e4) && console.warn(`createOutline: Created: ${E} outlines. (it is many)`);
}
function O(e) {
	e?.map && e.map.dispose(), e?.lightMap && e.lightMap.dispose(), e?.bumpMap && e.bumpMap.dispose(), e?.normalMap && e.normalMap.dispose(), e?.specularMap && e.specularMap.dispose(), e?.envMap && e.envMap.dispose(), e?.alphaMap && e.alphaMap.dispose(), e?.aoMap && e.aoMap.dispose(), e?.displacementMap && e.displacementMap.dispose(), e?.emissiveMap && e.emissiveMap.dispose(), e?.gradientMap && e.gradientMap.dispose(), e?.metalnessMap && e.metalnessMap.dispose(), e?.roughnessMap && e.roughnessMap.dispose(), "dispose" in e && e.dispose();
}
function k(e) {
	e?.geometry && e.geometry.dispose(), e?.material && (Array.isArray(e.material) ? e.material.forEach(O) : O(e.material)), e.removeFromParent();
}
function A(e) {
	for (let t = e.childrenToRemove.length - 1; t >= 0; t--) k(e.childrenToRemove[t]), e.childrenToRemove[t].removeFromParent();
}
function j(e, t = !0) {
	e.children.slice().reverse().forEach((e) => {
		j(e);
	}), t && k(e);
}
function M(e) {
	for (let t = e.children.length - 1; t >= 0; t--) M(e.children[t]);
	e.children.length === 0 && !e?.geometry && e.removeFromParent();
}
//#endregion
//#region src/app/utils/three-geometry-merge.ts
var N = class extends Error {
	constructor(e = "No geometries found in the provided node.") {
		super(e), this.name = "NoGeometriesFoundError";
	}
}, P = class extends Error {
	constructor(e = "No material set or found in geometries.") {
		super(e), this.name = "NoMaterialError";
	}
};
function F(t, r, i) {
	let a = [], o = [];
	if (((e) => {
		e.traverse((e) => {
			if (e?.geometry?.isBufferGeometry ?? !1) {
				e.updateMatrixWorld(!0);
				let t = e.geometry.clone();
				t.applyMatrix4(e.matrixWorld), a.push(t), i ||= e.material, o.push(e);
			}
		});
	})(t), a.length === 0) throw new N();
	if (i === void 0) throw new P();
	let s = n(a, !1), c = new e.Matrix4().copy(t.matrixWorld).invert();
	s.applyMatrix4(c);
	let l = new e.Mesh(s, i);
	return o.forEach((e) => {
		e.geometry.dispose(), e?.parent?.remove(e), (e?.parent?.children?.length ?? 1) === 0 && e?.parent?.parent?.remove(e.parent);
	}), l.name = r, t.add(l), {
		mergedGeometry: s,
		mergedMesh: l,
		material: i,
		childrenToRemove: o,
		parentNode: t
	};
}
function I(t, r, i, a) {
	let o = [];
	if (t.forEach((e) => {
		if (e?.geometry?.isBufferGeometry) {
			e.updateMatrixWorld(!0);
			let t = e.geometry.clone();
			t.applyMatrix4(e.matrixWorld), o.push(t), a ||= Array.isArray(e.material) ? e.material[0] : e.material;
		}
	}), o.length === 0 || !a) return;
	let s = n(o, !1), c = new e.Matrix4().copy(r.matrixWorld).invert();
	s.applyMatrix4(c);
	let l = new e.Mesh(s, a);
	return l.name = i, r.add(l), {
		mergedGeometry: s,
		mergedMesh: l,
		material: a,
		childrenToRemove: t,
		parentNode: r
	};
}
//#endregion
//#region src/app/utils/three-geometry-editor.ts
var L = "geometryEditingSkipRules";
function R(e) {
	e.traverse((e) => {
		e.userData && e.userData.geometryEditingSkipRules !== void 0 && delete e.userData[L];
	});
}
function z(e) {
	e.userData ||= {}, e.userData[L] = !0;
}
function B(e) {
	return e.userData?.[L] === !0;
}
function V(e) {
	let t = e;
	for (; t;) {
		if (t.userData?.geometryEditingSkipRules === !0) return !0;
		t = t.parent;
	}
	return !1;
}
var H = /* @__PURE__ */ function(e) {
	return e[e.Merge = 0] = "Merge", e;
}({});
function U(e, t = .5) {
	let n = new r();
	e.traverse((e) => {
		if (!e.isMesh) return;
		let r = e;
		if (!r.geometry.isBufferGeometry) return;
		let i = r.geometry;
		if (!i.attributes.position) return;
		let a = i.attributes.position.count, o = Math.floor(a * t);
		if (a < 10) {
			console.log(`[SimplifyMeshTree] Mesh "${r.name || "(unnamed)"}": skipped (too small, vertices=${a})`);
			return;
		}
		if (a < o) {
			console.log(`[SimplifyMeshTree] Mesh "${r.name || "(unnamed)"}": skipped (too small targetVerticeCount, targetVerticeCount=${o})`);
			return;
		}
		let s = performance.now();
		console.log(`[SimplifyMeshTree] Processing "${r.name || "(unnamed)"}": vertices before=${a}, after=${o}`), r.geometry = n.modify(i, o), r.geometry.computeBoundingBox(), r.geometry.computeBoundingSphere(), r.geometry.computeVertexNormals(), r.geometry.attributes.position.needsUpdate = !0, r.geometry.attributes.normal && (r.geometry.attributes.normal.needsUpdate = !0);
		let c = performance.now();
		c - s > 500 && console.warn(`[SimplifyMeshTree] Warn: mesh "${r.name || "(unnamed)"}" took ${Math.round(c - s)}ms to simplify.`);
	});
}
function W(e, t) {
	let n = t.newName ? t.newName : e.name + "_merged";
	if (!t.patterns) return F(e, n, t.material);
	let r = /* @__PURE__ */ new Set(), i = t.patterns;
	typeof i == "string" && (i = [i]);
	for (let t of i) {
		let n = S(e, t, "").nodes;
		for (let e of n) e.traverse((e) => {
			e.isMesh && e.geometry && r.add(e);
		});
	}
	let a = I(Array.from(r), e, n, t.material), o = t?.deleteOrigins ?? !0;
	return a && o && A(a), a;
}
function G(e, n) {
	let { patterns: r, deleteOrigins: i = !0, cleanupNodes: a = !0, outline: o = !0, outlineThresholdAngle: s = 40, outlineColor: c, simplifyMeshes: l = !1, simplifyRatio: u = .7, material: d, color: f, merge: p = !0, newName: m = "", applyToDescendants: h } = n;
	h === void 0 && (h = !p && !!r);
	let g = [], _ = [];
	if (p) {
		let t = W(e, n);
		if (!t) {
			console.warn("didn't find children to merge. Patterns:"), console.log(r);
			return;
		}
		g = [t.mergedMesh];
	} else if (!r) e.traverse((e) => {
		e?.geometry && !V(e) && g.push(e);
	});
	else {
		typeof r == "string" && (r = [r]);
		let t = /* @__PURE__ */ new Set();
		for (let n of r) {
			let r = S(e, n, "").nodes;
			for (let e of r) V(e) || (_.push(e), h ? e.traverse((e) => {
				e?.geometry && !t.has(e) && t.add(e);
			}) : e?.geometry && t.add(e), z(e));
		}
		g = Array.from(t);
	}
	for (let e of g) {
		if (f != null) {
			let n = e.material;
			n && (n.color ? n.color.setHex(f) : n.color = new t(f), n.needsUpdate = !0);
		}
		d != null && (e.material = d), l && U(e, u), o && D(e, {
			color: c,
			thresholdAngle: s,
			markAsProcessed: !0
		}), z(e);
	}
	a && M(e);
}
//#endregion
//#region src/app/utils/wildcard.ts
function K(e, t) {
	let n = 0, r = 0, i = 0, a = 0;
	for (; a < e.length && t[i] !== "*";) {
		if (t[i] !== e[a] && t[i] !== "?") return !1;
		i++, a++;
	}
	for (; a < e.length;) if (t[i] === "*") {
		if (++i === t.length) return !0;
		r = i, n = a + 1;
	} else if (t[i] === e[a] || t[i] === "?") i++, a++;
	else {
		if (n > e.length) return !1;
		i = r, a = n++;
	}
	for (; i < t.length && t[i] === "*";) i++;
	return i === t.length;
}
//#endregion
//#region src/app/data-pipelines/three-geometry.processor.ts
function q(t) {
	if (!Array.isArray(t)) return console.warn("ruleSetsFromObj: top-level object is not an array. Returning empty."), [];
	let n = new e.MaterialLoader();
	return t.map((e) => {
		if (!e.rules || !Array.isArray(e.rules)) return console.warn("ruleSetsFromObj: missing or invalid \"rules\" array in item:", e), { rules: [] };
		let t = e.rules.map((e) => {
			let t = { ...e };
			if (typeof t.color == "string" && (t.color = parseInt(t.color, 16)), e.materialJson && typeof e.materialJson == "object") try {
				let r = n.parse(e.materialJson);
				e.materialJson.type && r.type !== e.materialJson.type ? console.error("Failed to parse materialJson: unknown material type", e.materialJson) : t.material = r;
			} catch (t) {
				console.error("Failed to parse materialJson:", t, e.materialJson);
			}
			return t;
		});
		return {
			names: e.names,
			name: e.name,
			rules: t
		};
	});
}
function J(e, t) {
	let n = new Set(t), r = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = /* @__PURE__ */ new Set(), i = new Set(t.names || []);
		t.name && i.add(t.name);
		for (let a of i) for (let i of n) K(i.sourceGeometryName, a) && (e.add(i), r.set(i, t.rules || []), n.delete(i));
	}
	return r;
}
var Y = class {
	constructor() {}
	processRuleSets(e, t) {
		console.log(`[processRuleSets] Applying ${e.length} theme rules...`);
		let n = "[processRuleSets] Time applying rules";
		console.time(n);
		let r = J(e, t);
		for (let [e, t] of r) {
			let n = performance.now();
			R(e.geometry);
			for (let n of t) G(e.geometry, n);
			let r = performance.now() - n;
			r > 500 && console.log(`[processRuleSet] Applying rules took >0.5s: ${r.toFixed(1)} for ${e.name}`);
		}
		console.timeEnd(n);
	}
};
//#endregion
export { H as EditThreeNodeActions, L as GEOMETRY_EDITING_SKIP_FLAG, N as NoGeometriesFoundError, P as NoMaterialError, Y as ThreeGeometryProcessor, R as clearGeometryEditingFlags, D as createOutline, j as disposeHierarchy, k as disposeNode, A as disposeOriginalMeshesAfterMerge, G as editThreeNodeContent, S as findObject3DNodes, w as getColorOrDefault, B as isAlreadyProcessed, C as isColorable, V as isInProcessedBranch, z as markAsProcessed, J as matchRulesToDetectors, F as mergeBranchGeometries, I as mergeMeshList, M as pruneEmptyNodes, q as ruleSetsFromObj, x as walkObject3DNodes, K as wildCardCheck };

//# sourceMappingURL=index.js.map