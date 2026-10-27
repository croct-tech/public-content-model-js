/**
 * The result of a topological sort.
 */
export type TopologicalOrdering = {
    /**
     * The list of nodes that can be resolved in topological order.
     */
    order: string[];
    /**
     * A map of nodes that cannot be resolved to the chain of dependencies leading to them.
     */
    cycles: Record<string, string[]>;
};
/**
 * Sorts a list of nodes in topological order.
 *
 * @param graph The map of nodes to their dependencies.
 *
 * @returns {TopologicalOrdering} The list of nodes in topological order.
 */
export declare function toposort(graph: ReadonlyMap<string, ReadonlySet<string>>): TopologicalOrdering;
