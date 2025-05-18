
import type { TreeNodeData, TreeEdgeData } from '@/types';

// Helper function to get parents of a node
function getParents(nodeId: string, edges: TreeEdgeData[], nodes: TreeNodeData[]): TreeNodeData[] {
    return edges
        .filter(edge => edge.type === 'parent-child' && edge.targetId === nodeId)
        .map(edge => nodes.find(n => n.id === edge.sourceId))
        .filter(node => !!node) as TreeNodeData[];
}

// Helper function to get children of a node
function getChildren(nodeId: string, edges: TreeEdgeData[], nodes: TreeNodeData[]): TreeNodeData[] {
    return edges
        .filter(edge => edge.type === 'parent-child' && edge.sourceId === nodeId)
        .map(edge => nodes.find(n => n.id === edge.targetId))
        .filter(node => !!node) as TreeNodeData[];
}

// Helper function to get spouses of a node
function getSpouses(nodeId: string, edges: TreeEdgeData[], nodes: TreeNodeData[]): TreeNodeData[] {
    const spouseIds = edges
        .filter(edge => edge.type === 'spouse' && (edge.sourceId === nodeId || edge.targetId === nodeId))
        .map(edge => (edge.sourceId === nodeId ? edge.targetId : edge.sourceId));
    return nodes.filter(n => spouseIds.includes(n.id));
}

// Helper function to get siblings (full and half)
function getSiblings(nodeId: string, edges: TreeEdgeData[], nodes: TreeNodeData[]): {node: TreeNodeData, type: 'full' | 'half'}[] {
    const parentsOfNode = getParents(nodeId, edges, nodes);
    if (parentsOfNode.length === 0) return [];

    const parentIds = parentsOfNode.map(p => p.id);
    let siblings: {node: TreeNodeData, type: 'full' | 'half'}[] = [];
    const addedSiblingIds = new Set<string>();


    nodes.forEach(potentialSibling => {
        if (potentialSibling.id === nodeId) return;
        if (addedSiblingIds.has(potentialSibling.id)) return;

        const parentsOfPotentialSibling = getParents(potentialSibling.id, edges, nodes);
        if (parentsOfPotentialSibling.length === 0) return;

        const commonParentIds = parentsOfPotentialSibling.filter(p => parentIds.includes(p.id)).map(p => p.id);

        if (commonParentIds.length > 0) {
            const isFullSibling = parentIds.length > 0 &&
                                  parentsOfNode.length === parentsOfPotentialSibling.length && // Must have same number of parents
                                  parentIds.every(pId => parentsOfPotentialSibling.map(sp => sp.id).includes(pId)) &&
                                  parentsOfPotentialSibling.every(sp => parentIds.includes(sp.id));
            
            siblings.push({ node: potentialSibling, type: isFullSibling && parentIds.length > 1 ? 'full' : 'half' });
            addedSiblingIds.add(potentialSibling.id);
        }
    });
    return siblings;
}


export function findRelationship(
    node1Id: string,
    node2Id: string,
    nodes: TreeNodeData[],
    edges: TreeEdgeData[]
): string {
    const node1 = nodes.find(n => n.id === node1Id);
    const node2 = nodes.find(n => n.id === node2Id);

    if (!node1 || !node2) {
        return "One or both individuals not found.";
    }

    if (node1Id === node2Id) {
        return `${node1.name} is the same person.`;
    }

    const node1Parents = getParents(node1Id, edges, nodes);
    const node2Parents = getParents(node2Id, edges, nodes);
    const node1Spouses = getSpouses(node1Id, edges, nodes);
    const node2Spouses = getSpouses(node2Id, edges, nodes); // Get spouses for node2 as well for symmetry

    // Direct relationships: Parent / Child
    if (node1Parents.some(p => p.id === node2Id)) {
        return `${node2.name} is the parent of ${node1.name}.`;
    }
    if (node2Parents.some(p => p.id === node1Id)) {
        return `${node1.name} is the parent of ${node2.name}.`;
    }

    // Direct relationships: Spouse
    if (node1Spouses.some(s => s.id === node2Id)) {
        return `${node1.name} and ${node2.name} are spouses.`;
    }

    // Siblings
    const node1SiblingsInfo = getSiblings(node1Id, edges, nodes);
    const node1SiblingOfNode2 = node1SiblingsInfo.find(sInfo => sInfo.node.id === node2Id);
    if (node1SiblingOfNode2) {
        return `${node1.name} and ${node2.name} are ${node1SiblingOfNode2.type} siblings.`;
    }
    
    // Grandparent / Grandchild
    for (const parent of node1Parents) {
        if (getParents(parent.id, edges, nodes).some(gp => gp.id === node2Id)) {
            return `${node2.name} is the grandparent of ${node1.name}.`;
        }
    }
    for (const parent of node2Parents) {
        if (getParents(parent.id, edges, nodes).some(gp => gp.id === node1Id)) {
            return `${node1.name} is the grandparent of ${node2.name}.`;
        }
    }

    // Great-Grandparent / Great-Grandchild
    for (const parent of node1Parents) {
        const grandparents = getParents(parent.id, edges, nodes);
        for (const grandparent of grandparents) {
            if (getParents(grandparent.id, edges, nodes).some(ggp => ggp.id === node2Id)) {
                return `${node2.name} is the great-grandparent of ${node1.name}.`;
            }
        }
    }
    for (const parent of node2Parents) {
        const grandparents = getParents(parent.id, edges, nodes);
        for (const grandparent of grandparents) {
            if (getParents(grandparent.id, edges, nodes).some(ggp => ggp.id === node1Id)) {
                return `${node1.name} is the great-grandparent of ${node2.name}.`;
            }
        }
    }

    // Aunt/Uncle & Niece/Nephew
    // Node2 is Aunt/Uncle to Node1 if Node2 is a sibling of one of Node1's parents.
    for (const parentOf1 of node1Parents) {
        const siblingsOfParent1 = getSiblings(parentOf1.id, edges, nodes);
        if (siblingsOfParent1.some(s => s.node.id === node2Id)) {
            if (node2.gender === 'female') return `${node2.name} is an aunt of ${node1.name}.`;
            if (node2.gender === 'male') return `${node2.name} is an uncle of ${node1.name}.`;
            return `${node2.name} is an aunt or uncle of ${node1.name}.`;
        }
    }
    // Node1 is Aunt/Uncle to Node2 if Node1 is a sibling of one of Node2's parents.
    for (const parentOf2 of node2Parents) {
        const siblingsOfParent2 = getSiblings(parentOf2.id, edges, nodes);
        if (siblingsOfParent2.some(s => s.node.id === node1Id)) {
            if (node1.gender === 'female') return `${node1.name} is an aunt of ${node2.name}.`;
            if (node1.gender === 'male') return `${node1.name} is an uncle of ${node2.name}.`;
            return `${node1.name} is an aunt or uncle of ${node2.name}.`;
        }
    }

    // Grand Aunt/Uncle
    // Node2 is Grand Aunt/Uncle to Node1 if Node2 is a sibling of one of Node1's grandparents.
    const node1Grandparents = node1Parents.flatMap(p => getParents(p.id, edges, nodes));
    for (const gpOf1 of node1Grandparents) {
        const siblingsOfGp1 = getSiblings(gpOf1.id, edges, nodes);
        if (siblingsOfGp1.some(s => s.node.id === node2Id)) {
            if (node2.gender === 'female') return `${node2.name} is a grandaunt of ${node1.name}.`;
            if (node2.gender === 'male') return `${node2.name} is a granduncle of ${node1.name}.`;
            return `${node2.name} is a grandaunt or granduncle of ${node1.name}.`;
        }
    }
    // Node1 is Grand Aunt/Uncle to Node2 if Node1 is a sibling of one of Node2's grandparents.
    const node2Grandparents = node2Parents.flatMap(p => getParents(p.id, edges, nodes));
    for (const gpOf2 of node2Grandparents) {
        const siblingsOfGp2 = getSiblings(gpOf2.id, edges, nodes);
        if (siblingsOfGp2.some(s => s.node.id === node1Id)) {
            if (node1.gender === 'female') return `${node1.name} is a grandaunt of ${node2.name}.`;
            if (node1.gender === 'male') return `${node1.name} is a granduncle of ${node2.name}.`;
            return `${node1.name} is a grandaunt or granduncle of ${node2.name}.`;
        }
    }


    // Cousins: children of siblings (share a grandparent)
    const commonGrandparentIds = node1Grandparents
        .map(gp => gp.id)
        .filter(gpId => node2Grandparents.map(gp2 => gp2.id).includes(gpId));

    if (commonGrandparentIds.length > 0) {
      // Ensure their parents are siblings, not the same person (which would make them siblings, already checked)
      let parentsAreSiblings = false;
      for (const p1 of node1Parents) {
        for (const p2 of node2Parents) {
          if (p1.id === p2.id) continue; // If they share a parent, they might be siblings or half-siblings (already checked)
          const p1Siblings = getSiblings(p1.id, edges, nodes);
          if (p1Siblings.some(s => s.node.id === p2.id)) {
            parentsAreSiblings = true;
            break;
          }
        }
        if (parentsAreSiblings) break;
      }
      if (parentsAreSiblings) {
        return `${node1.name} and ${node2.name} are cousins.`;
      }
    }

    // Sibling-in-law (node2 is node1's sibling's spouse)
    for (const siblingInfo of node1SiblingsInfo) {
        const spousesOfSibling = getSpouses(siblingInfo.node.id, edges, nodes);
        if (spousesOfSibling.some(s => s.id === node2Id)) {
            let inLawTerm = "sibling-in-law";
            if (node2.gender === 'male') inLawTerm = "brother-in-law";
            else if (node2.gender === 'female') inLawTerm = "sister-in-law";
            return `${node2.name} is the ${inLawTerm} of ${node1.name}.`;
        }
    }

    // Sibling-in-law (node2 is node1's spouse's sibling)
    // Symmetrical to the above, so we get spouses of node2 and siblings of those spouses
    const node2SiblingsInfo = getSiblings(node2Id, edges, nodes);
    for (const spouse of node1Spouses) { // Spouses of node1
        const siblingsOfSpouse = getSiblings(spouse.id, edges, nodes);
        if (siblingsOfSpouse.some(sInfo => sInfo.node.id === node2Id)) {
            let inLawTerm = "sibling-in-law";
            if (node2.gender === 'male') inLawTerm = "brother-in-law";
            else if (node2.gender === 'female') inLawTerm = "sister-in-law";
            return `${node2.name} is the ${inLawTerm} of ${node1.name}.`; // Node2 is the spouse's sibling of Node1
        }
    }


    return `The relationship between ${node1.name} and ${node2.name} is not directly identified by this tool or is more distant.`;
}

