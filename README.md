# @dexvis/threejs-tree-editor

Walk, search, restyle, merge and outline [three.js](https://threejs.org/)
scene trees by path patterns. Built for detector geometry converted from
[CERN ROOT](https://root.cern/) TGeo trees, where one subdetector holds
thousands of meshes: a JSON-friendly rule set colors, merges, outlines and
simplifies its parts.

## Install

```bash
npm install @dexvis/threejs-tree-editor three
```

`three` is a peer dependency (r128 or newer).

## Paths and patterns

Every node has a full path built from its names during traversal:
`"Root/Child/GrandChild"`. Two pattern syntaxes apply:

- Node patterns (`walkObject3DNodes`, `findObject3DNodes`, rule `patterns`)
  are globs over the full path ([outmatch](https://github.com/axtgr/outmatch)):
  `*` and `?` stay inside one path segment, `**` spans any number of
  segments.
- Subdetector names in rule sets (`name`, `names`) go through
  `wildCardCheck(source, pattern)`: `*` matches any characters, `?` one
  character, the same syntax as
  [@dexvis/root-geo-tree-editor](https://github.com/dexvis/root-geo-tree-editor).

| Node pattern | Matches |
|---|---|
| `**/Tracker*` | A node whose name starts with "Tracker", at any depth |
| `Root/*/Sensor?` | "Sensor" + one character, two levels below Root |
| `*/Barrel` | "Barrel" directly below the top node |

## API

### Navigation

#### `walkObject3DNodes(node, callback, options?)`

Visits `node` and every descendant up to `options.maxLevel`. The callback
receives each node whose full path matches `options.pattern` (every node
without a pattern), its full path and its depth; its return value is not
used. Returns the number of nodes visited. Children are visited last to
first, so the callback may remove the node it receives.

```ts
import { walkObject3DNodes } from '@dexvis/threejs-tree-editor';

walkObject3DNodes(scene, (node, fullPath, level) => {
  console.log(`${fullPath} (level ${level})`);
  return true;
}, { maxLevel: 3 });
```

#### `findObject3DNodes(parentNode, pattern, matchType?, maxLevel?)`

Collects the nodes whose full path matches `pattern`, optionally only those
of one `type` (`"Mesh"`). Returns `{ nodes, fullPaths, deepestLevel, totalWalked }`.

```ts
import { findObject3DNodes } from '@dexvis/threejs-tree-editor';

const { nodes, fullPaths } = findObject3DNodes(geometryRoot, '**/Tracker*', 'Mesh');
```

### Rule sets

A rule set names subdetectors and lists the edits for their geometry. Rule
sets come as plain objects (JSON or JSONC), so an application can ship them as
data:

```jsonc
[
  { "name": "Tracker_14*", "rules": [
      { "patterns": ["**/Barrel*"], "merge": false, "color": "0x4488ff" },
      { "merge": false, "outline": false, "color": "0x888888" }  // the meshes the first rule left
  ]},
  { "name": "*", "rules": [ { "color": "0x888888" } ] }  // every other subdetector: one merged, outlined mesh
]
```

A rule merges and outlines by default. Its fields:

| Rule field | Default | Effect |
|---|---|---|
| `patterns` | none | Nodes the rule applies to. Without patterns a merge takes every mesh of the subdetector, and a rule with `merge: false` takes the meshes earlier rules did not process |
| `merge` | `true` | Merge the matched meshes into one mesh |
| `newName` | `<node name>_merged` | Name of the merged mesh |
| `deleteOrigins` | `true` | Dispose the meshes a merge replaced |
| `color`, `material` (or `materialJson`) | kept | Restyle the resulting meshes |
| `outline`, `outlineColor`, `outlineThresholdAngle` | `true`, -, `40` | Add edge lines |
| `simplifyMeshes`, `simplifyRatio` | `false`, `0.7` | Reduce vertex counts (loads three's SimplifyModifier on demand) |
| `applyToDescendants` | `true` with `merge: false` and patterns | Style every mesh below a matched node |
| `cleanupNodes` | `true` | Remove branches left without geometry |

- `ruleSetsFromObj(obj)` turns the plain objects into `DetectorThreeRuleSet[]`
  (hex color strings to numbers, `materialJson` through three's
  `MaterialLoader`).
- `matchRulesToDetectors(ruleSets, detectors)` assigns each `Subdetector` the
  rules of the first rule set whose `name`/`names` matches its
  `sourceGeometryName`; a `"*"` rule set takes the subdetectors no earlier
  rule set matched, so put it last.
- `new ThreeGeometryProcessor().processRuleSets(ruleSets, detectors)` applies
  the matched rules, subdetector by subdetector.
- `editThreeNodeContent(node, rule)` applies one rule to one tree.

```ts
import { ruleSetsFromObj, ThreeGeometryProcessor, Subdetector } from '@dexvis/threejs-tree-editor';

const detectors: Subdetector[] = geometryRoot.children.map(child => ({
  sourceGeometry: null,
  sourceGeometryName: child.name,
  geometry: child,
  name: child.name,
  groupName: '',
}));
await new ThreeGeometryProcessor().processRuleSets(ruleSetsFromObj(rulesJson), detectors);
```

A rule marks what it processed (`userData.geometryEditingSkipRules`, see
`markAsProcessed`, `isInProcessedBranch`); a later rule with `merge: false`
and no patterns skips those nodes. `processRuleSets` clears the marks before
each subdetector.

### Merging, outlines, cleanup

| Function | Does |
|---|---|
| `mergeBranchGeometries(parentNode, name, material?)` | Merges every mesh below `parentNode` into one mesh; returns a `MergeResult` |
| `mergeMeshList(meshes, parentNode, name, material?)` | Merges the given meshes into one mesh under `parentNode` |
| `disposeOriginalMeshesAfterMerge(mergeResult)` | Removes and disposes the meshes a merge replaced |
| `createOutline(mesh, options?)` | Adds edge lines (`color`, `material`, `thresholdAngle`) next to the mesh |
| `pruneEmptyNodes(node)` | Removes branches without geometry |
| `disposeNode(node)`, `disposeHierarchy(node, disposeSelf?)` | Releases geometries and materials |

## Development

```bash
npm install
npm test        # vitest
npm run build   # tsdown -> dist/ (ES module + bundled type declarations)
```

## License

MIT. See [LICENSE](./LICENSE).
