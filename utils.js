"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clean = clean;
exports.toposort = toposort;
/**
 * Remove undefined values from an object.
 *
 * @param object The object to remove undefined values.
 *
 * @returns The object without undefined values.
 *
 * @internal
 */
function clean(object) {
    const result = {};
    for (const [key, value] of Object.entries(object)) {
        if (value !== undefined) {
            result[key] = value;
        }
    }
    return result;
}
/**
 * Sorts a list of nodes in topological order.
 *
 * @param graph The map of nodes to their dependencies.
 *
 * @returns {TopologicalOrdering} The list of nodes in topological order.
 */
function toposort(graph) {
    const resolved = new Set();
    const unresolved = new Set();
    const cycles = {};
    // Recursive function to visit nodes in the graph
    function visit(node, chain = new Set()) {
        // If the node has already been resolved, return
        if (resolved.has(node)) {
            return;
        }
        // If the node is not in the graph, add it to the resolved list and return
        if (!graph.has(node)) {
            resolved.add(node);
            return;
        }
        // If the node is already in the chain, it means there is a dependency cycle
        // Add it to the unresolved list and return
        if (chain.has(node)) {
            /* eslint-disable-next-line @typescript-eslint/unbound-method --
               <Set>.forEach uses the second argument as the receiver of the callback.
               Therefore it is explicitly setting the `this` argument. */
            chain.forEach(unresolved.add, unresolved);
            const chainList = Array.from(chain);
            cycles[node] = [...chainList.slice(chainList.indexOf(node)), node];
            return;
        }
        // Visit each of the node's dependencies
        for (const dependency of graph.get(node)) {
            visit(dependency, new Set([...chain, node]));
            if (dependency in cycles) {
                unresolved.add(node);
                break;
            }
        }
        if (!unresolved.has(node)) {
            // Add the node to the resolved list
            resolved.add(node);
        }
    }
    // Visit each node in the graph
    for (const node of graph.keys()) {
        visit(node);
    }
    return {
        order: Array.from(resolved),
        cycles: cycles,
    };
}
