/**
 * Task Dependency DAG Cycle Detection & Graph Utilities for UtsavAI
 * Source: docs/15-TESTING-QUALITY-ASSURANCE-SPECIFICATION.md Section 4.2
 *
 * Deterministic graph algorithms: topological sort, cycle detection, and DAG validation.
 */

export interface DependencyEdge {
  taskId: string;
  dependsOnTaskId: string;
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  cyclePath?: string[];
  reason?: string;
}

/**
 * Detects whether adding a proposed dependency edge (or evaluating an existing graph)
 * introduces a direct, indirect, or self-referential cycle.
 *
 * Direction convention:
 * `taskId` depends on `dependsOnTaskId`.
 * Therefore, `dependsOnTaskId` must precede `taskId`.
 * An edge flows: `taskId -> dependsOnTaskId`.
 * If from `dependsOnTaskId` we can reach `taskId`, then adding `taskId -> dependsOnTaskId` completes a cycle!
 */
export function detectDependencyCycle(
  existingEdges: DependencyEdge[],
  candidateEdge?: DependencyEdge
): CycleDetectionResult {
  // 1. Self-reference check: A task cannot depend on itself
  if (candidateEdge && candidateEdge.taskId === candidateEdge.dependsOnTaskId) {
    return {
      hasCycle: true,
      cyclePath: [candidateEdge.taskId, candidateEdge.taskId],
      reason: "Self-referential dependency: a task cannot depend on itself.",
    };
  }

  // Combine edges
  const allEdges: DependencyEdge[] = [...existingEdges];
  if (candidateEdge) {
    // Check if this exact edge already exists
    const duplicate = existingEdges.some(
      (e) => e.taskId === candidateEdge.taskId && e.dependsOnTaskId === candidateEdge.dependsOnTaskId
    );
    if (!duplicate) {
      allEdges.push(candidateEdge);
    }
  }

  // Build adjacency list: node -> array of nodes it depends on
  const adj = new Map<string, string[]>();
  for (const edge of allEdges) {
    if (!adj.has(edge.taskId)) {
      adj.set(edge.taskId, []);
    }
    adj.get(edge.taskId)!.push(edge.dependsOnTaskId);
  }

  // 2. DFS cycle detector with path reconstruction
  // State: 0 = unvisited, 1 = visiting (in recursion stack), 2 = visited (completed)
  const state = new Map<string, number>();
  const parent = new Map<string, string>();

  function dfs(node: string, stack: string[]): string[] | null {
    state.set(node, 1);
    stack.push(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      const neighborState = state.get(neighbor) || 0;
      if (neighborState === 1) {
        // Cycle detected: neighbor is in current recursion stack!
        const cycleStartIndex = stack.indexOf(neighbor);
        const cycle = stack.slice(cycleStartIndex);
        cycle.push(neighbor); // Close the cycle loop
        return cycle;
      }
      if (neighborState === 0) {
        parent.set(neighbor, node);
        const res = dfs(neighbor, stack);
        if (res) return res;
      }
    }

    stack.pop();
    state.set(node, 2);
    return null;
  }

  // If candidate edge is provided, start DFS directly from candidateEdge.taskId for early detection
  if (candidateEdge) {
    const cycle = dfs(candidateEdge.taskId, []);
    if (cycle) {
      return {
        hasCycle: true,
        cyclePath: cycle,
        reason: `Circular dependency detected: ${cycle.join(" -> ")}`,
      };
    }
  }

  // Otherwise / in addition, check all nodes in graph
  for (const node of adj.keys()) {
    if ((state.get(node) || 0) === 0) {
      const cycle = dfs(node, []);
      if (cycle) {
        return {
          hasCycle: true,
          cyclePath: cycle,
          reason: `Circular dependency detected: ${cycle.join(" -> ")}`,
        };
      }
    }
  }

  return {
    hasCycle: false,
  };
}

/**
 * Validates that all referenced prerequisite task IDs exist in the known set of tasks.
 */
export function validatePrerequisiteReferences(
  edges: DependencyEdge[],
  knownTaskIds: Set<string> | string[]
): { isValid: boolean; missing: string[] } {
  const known = knownTaskIds instanceof Set ? knownTaskIds : new Set(knownTaskIds);
  const missing = new Set<string>();

  for (const edge of edges) {
    if (!known.has(edge.dependsOnTaskId)) {
      missing.add(edge.dependsOnTaskId);
    }
  }

  return {
    isValid: missing.size === 0,
    missing: Array.from(missing),
  };
}

