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