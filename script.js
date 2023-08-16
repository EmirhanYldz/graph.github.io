class Graph {
    constructor(adjVertices) {
        this.adjVertices = adjVertices;
        this.visitedNodes = new Set();
        this.distance = new Map();
        this.previousNode = new Map();
    }

    getVisitedNodes() {
        return this.visitedNodes;
    }

    getDistance() {
        return this.distance;
    }

    Dijkstra(start, finish) {
        for (const node of Object.keys(this.adjVertices)) {
            if (node === start) {
                this.distance.set(node, 0);
            } else {
                this.distance.set(node, Infinity);
            }
            this.previousNode.set(node, null);
        }

        while (!this.visitedNodes.has(finish)) {
            const currentNode = this.getNodeWithShortestDistance();
            this.visitedNodes.add(currentNode);

            const neighbors = this.adjVertices[currentNode];
            for (const neighbor in neighbors) {
                const cost = neighbors[neighbor];
                const totalCost = cost + this.distance.get(currentNode);
                if (totalCost < this.distance.get(neighbor)) {
                    this.distance.set(neighbor, totalCost);
                    this.previousNode.set(neighbor, currentNode);
                }
            }
        }

        console.log("En kısa yol: " + this.getShortestPath(finish));
        console.log("Maliyet: " + this.distance.get(finish));
    }

    getNodeWithShortestDistance() {
        let result = null;
        let shortestDistance = Infinity;
        for (const node of this.distance.keys()) {
            if (!this.visitedNodes.has(node) && this.distance.get(node) < shortestDistance) {
                result = node;
                shortestDistance = this.distance.get(node);
            }
        }
        return result;
    }

    getShortestPath(endNode) {
        const path = [];
        let currentNode = endNode;
        while (currentNode !== null) {
            path.unshift(currentNode);
            currentNode = this.previousNode.get(currentNode);
        }
        return path;
    }
}

class UnionFind {
    constructor() {
        this.parent = new Map();
        this.rank = new Map();
    }

    makeSet(node) {
        if (!this.parent.has(node)) {
            this.parent.set(node, node);
            this.rank.set(node, 0);
        }
    }

    find(node) {
        if (!this.parent.has(node)) return null;

        if (this.parent.get(node) !== node) {
            this.parent.set(node, this.find(this.parent.get(node)));
        }
        return this.parent.get(node);
    }

    union(node1, node2) {
        const root1 = this.find(node1);
        const root2 = this.find(node2);

        if (root1 === null || root2 === null || root1 === root2) return;

        const rank1 = this.rank.get(root1);
        const rank2 = this.rank.get(root2);

        if (rank1 > rank2) {
            this.parent.set(root2, root1);
        } else if (rank1 < rank2) {
            this.parent.set(root1, root2);
        } else {
            this.parent.set(root2, root1);
            this.rank.set(root1, rank1 + 1);
        }
    }

    isConnected(node1, node2) {
        const root1 = this.find(node1);
        const root2 = this.find(node2);

        return root1 !== null && root1 === root2;
    }

    listConnectedNodes() {
        const connectedGroups = new Map();

        this.parent.forEach((_, node) => {
            const root = this.find(node);
            if (!connectedGroups.has(root)) {
                connectedGroups.set(root, []);
            }
            connectedGroups.get(root).push(node);
        });

        return Array.from(connectedGroups.values());
    }
}