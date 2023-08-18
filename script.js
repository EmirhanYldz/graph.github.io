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

async function colorNodes(nodeList){
    const delay = ms => new Promise(resolve => {
        const timeoutId = setTimeout(resolve, ms);
        timers.push(timeoutId);
    });

    for(const node of nodeList) {
        textArea.value = textArea.value + node +'  added .. \n'
        network.body.data.nodes.update([{id: node, color: 'yellow'}]);
        await delay(1000);
    }
    var result = nodeList.join('->');

    textArea.value = textArea.value + result ;
}
function runDFS(startNode){
    const result = [];

    function DFSUtil(node, result) {
        if (!result.includes(node)) {
            result.push(node);
            const neighbors = Object.keys(adjVertices[node]);
            for (const n of neighbors) {
                DFSUtil(n, result);
            }
        }
    }

    DFSUtil(startNode, result);
    colorNodes(result)
}

function runBFS(startNode) {
    const result = [];
    const queue = [];

    queue.push(startNode);

    while (queue.length > 0) {
        const current = queue.shift();

        if (!result.includes(current)) {
            result.push(current);
            queue.push(...Object.keys(adjVertices[current]));
        }
    }
    colorNodes(result);
}

function runDijkstra(start,finish){
    const visitedNodes = new Set();
    const distance = new Map();
    const previousNode = new Map();

    function getNodeWithShortestDistance() {
        let result = null;
        let shortestDistance = Infinity;
        for (const node of distance.keys()) {
            if (!visitedNodes.has(node) && distance.get(node) < shortestDistance) {
                result = node;
                shortestDistance = distance.get(node);
            }
        }
        return result;
    }

    function getShortestPath(endNode) {
        const path = [];
        let currentNode = endNode;
        while (currentNode !== null) {
            path.unshift(currentNode);
            currentNode = previousNode.get(currentNode);
        }
        return path;
    }

    for (const node of Object.keys(adjVertices)) {
        if (node === start) {
            distance.set(node, 0);
        } else {
            distance.set(node, Infinity);
        }
        previousNode.set(node, null);
    }

    while (!visitedNodes.has(finish)) {
        const currentNode = getNodeWithShortestDistance();
        visitedNodes.add(currentNode);

        const neighbors = adjVertices[currentNode];
        for (const neighbor in neighbors) {
            const cost = neighbors[neighbor];
            const totalCost = cost + distance.get(currentNode);
            if (totalCost < distance.get(neighbor)) {
                distance.set(neighbor, totalCost);
                previousNode.set(neighbor, currentNode);
            }
        }
    }


    async function colorNodesSequentially() {
        const path = getShortestPath(finish);
        const delay = ms => new Promise(resolve => {
            const timeoutId = setTimeout(resolve, ms);
            timers.push(timeoutId);
        });
        var result =path.join(' -> ');
        let previousNode = path.shift();
        textArea.value = textArea.value + previousNode + ' node added .. \n';
        network.body.data.nodes.update([{ id: previousNode, color: 'yellow' }]);
        await delay(1000);

        for (const node of path) {
            const edgeId =`${node}-${previousNode}`
            const reverseId =`${previousNode}-${node}`
            textArea.value = textArea.value + edgeId + ' edge added .. \n';
            if(edges.get(edgeId)){
                edges.update({id:edgeId,color:{color:'yellow'}});
            }
            if(edges.get(reverseId)){
                edges.update({id:reverseId,color:{color:'yellow'}});
            }
            textArea.value = textArea.value + node + ' node added .. \n';
            network.body.data.nodes.update([{ id: node, color: 'yellow' }]);
            previousNode=node;
            await delay(1000);  // 1 saniye bekler
        }
        textArea.value = textArea.value + result;
    }
    colorNodesSequentially();
}

function runEuler(){

    function addEdge(src, dest, weight) {
        if (!adjVertices.hasOwnProperty(src)) {
            addVertex(src);
        }
        if (!adjVertices.hasOwnProperty(dest)) {
            addVertex(dest);
        }
        adjVertices[src][dest] = weight;
        adjVertices[dest][src] = weight;
    }

    function removeEdge(u, v) {
        delete adjVertices[u][v];
        delete adjVertices[v][u];
    }

    function addVertex(vertex) {
        adjVertices[vertex] = {};
    }

    function isValidNextEdge(u, v) {
        if (Object.keys(adjVertices[u]).length === 1) {
            return true;
        }

        const count1 = DFS(u).length;

        removeEdge(u, v);

        const count2 = DFS(u).length;

        addEdge(u, v);

        return count1 <= count2;
    }

    function DFS(node) {
        const result = [];
        DFSUtil(node, result);
        return result;
    }

    function DFSUtil(node, result) {
        if (!result.includes(node)) {
            result.push(node);
            for (const n of Object.keys(adjVertices[node])) {
                DFSUtil(n, result);
            }
        }
    }

    async function colorEulerUtil(u) {
        const delay = ms => new Promise(resolve => {
            const timeoutId = setTimeout(resolve, ms);
            timers.push(timeoutId);
        });
        path.push(u);
        textArea.value = textArea.value + u + ' node added .. \n';
        network.body.data.nodes.update([{ id: u, color: 'yellow' }]);
        await delay(1000);

        for (const v of Object.keys(adjVertices[u])) {
            if (isValidNextEdge(u, v)) {
                const edgeId =`${u}-${v}`
                const reverseId =`${v}-${u}`
                textArea.value = textArea.value + edgeId + ' edge added .. \n';
                if(edges.get(edgeId)){
                    edges.update({id:edgeId,color:{color:'yellow'}});
                }
                if(edges.get(reverseId)){
                    edges.update({id:reverseId,color:{color:'yellow'}});
                }
                network.body.data.nodes.update([{ id: v, color: 'yellow' }]);
                removeEdge(u, v);
                await colorEulerUtil(v);
                break;
            }
        }
    }

    async function runningEuler(u){
        await colorEulerUtil(u);
        var result = path.join(' -> ');
        textArea.value= textArea.value + result;
    }
    let k = 0;
    for(const node of Object.keys(adjVertices)){
        if(Object.keys(adjVertices[node]).length % 2 !== 0){
            k++;
        }
    }
    if(!(k === 0 || k === 2)){
        textArea.value += 'not available euler path or cycle..\n';
        return;
    }
    const path = [];
    let u = null;
    const keys = Object.keys(adjVertices);
    u = keys.shift();

    for (const key of keys) {
        if (Object.keys(adjVertices[key]).length % 2 !== 0) {
            u = key;
            break;
        }
    }

    runningEuler(u);

}

function runTSP(startNode){
    let cost = 0;
    const path = [];
    const visited = new Map();

    for (const city of Object.keys(adjVertices)) {
        visited.set(city, false);
    }

    let currentCity = startNode;
    path.push(currentCity);
    visited.set(currentCity, true);

    while (path.length < Object.keys(adjVertices).length) {
        let minDistance = Number.MAX_SAFE_INTEGER;
        let nextCity = null;

        for (const [neighborCity, distance] of Object.entries(adjVertices[currentCity])) {
            if (!visited.get(neighborCity)) {
                if (distance < minDistance) {
                    minDistance = distance;
                    nextCity = neighborCity;
                }
            }
        }

        path.push(nextCity);
        cost += minDistance;
        visited.set(nextCity, true);
        currentCity = nextCity;
    }

    async function colorNodesSequentially() {
        const delay = ms => new Promise(resolve => {
            const timeoutId = setTimeout(resolve, ms);
            timers.push(timeoutId);
        });

        let previousNode = path.shift();
        network.body.data.nodes.update([{ id: previousNode, color: 'yellow' }]);
        await delay(1000);

        for (const node of path) {
            const edgeId =`${node}-${previousNode}`
            const reverseId =`${previousNode}-${node}`
            if(edges.get(edgeId)){
                edges.update({id:edgeId,color:{color:'yellow'}});
            }
            if(edges.get(reverseId)){
                edges.update({id:reverseId,color:{color:'yellow'}});
            }
            console.log(node);
            network.body.data.nodes.update([{ id: node, color: 'yellow' }]);
            previousNode=node;
            await delay(1000);  // 1 saniye bekler
        }
    }

    colorNodesSequentially();
}

function runKruskal(){

    let MST = {};
    let cost = 0;
    edgeList.sort((p1,p2) => p1.weight - p2.weight);

    function removeEdge(u, v, graph) {
        delete graph[u][v];
        delete graph[v][u];
    }

    function addEdgeMST(src, dest, weight) {
        if (!MST.hasOwnProperty(src)) {
            MST[src]={};
        }
        if (!MST.hasOwnProperty(dest)) {
            MST[dest]={};
        }
        MST[src][dest] = weight;
        MST[dest][src] = weight;
    }

    function isCyclic(graph) {
        const visited = new Set();

        for (const key of Object.keys(graph)) {
            if (!visited.has(key)) {
                if (isCyclicUtil(key, visited, null, graph)) {
                    return true;
                }
            }
        }

        return false;
    }

    function isCyclicUtil(current, visited, parent, graph)
    {
        visited.add(current);

        for (const key of Object.keys(graph[current])) {
            if (!visited.has(key)) {
                if (isCyclicUtil(key, visited, current, graph)) {
                    return true;
                }
            } else if (key !== parent) {
                return true;
            }
        }

        return false;
    }

    async function colorMST(){
        const delay = ms => new Promise(resolve => {
            const timeoutId = setTimeout(resolve, ms);
            timers.push(timeoutId);
        });

        for (const edge of edgeList) {
            const source = edge.source;
            const next = edge.next;
            const weight = edge.weight;

            addEdgeMST(source, next, weight);
            const edgeId =`${source}-${next}`
            const reverseId =`${next}-${source}`
            textArea.value+=edgeId+' edge added..\n';
            if(edges.get(edgeId)){
                edges.update({id:edgeId,color:{color:'yellow'}});
            }
            if(edges.get(reverseId)){
                edges.update({id:reverseId,color:{color:'yellow'}});
            }
            await delay(1000);

            cost += weight;
            if (isCyclic(MST)) {
                removeEdge(source, next, MST);
                textArea.value+=edgeId+' edge removed..\n';
                if(edges.get(edgeId)){
                    edges.update({id:edgeId,color:{}});
                }
                if(edges.get(reverseId)){
                    edges.update({id:reverseId,color:{}});
                }
                await delay(1000);
                cost -= weight;
            }
        }
        for(const node of Object.keys(MST)) {
            network.body.data.nodes.update([{id:node ,color: 'yellow'}]);
        }
        textArea.value +='all nodes colored\n';
        textArea.value +='new MST : '+ JSON.stringify(MST, null, 2);
    }

    colorMST();
}

function runPrim(){
    let MST = {};
    const nodes = [...Object.keys(adjVertices)];
    const node = nodes[0];

    function primUtil(graph, copy) {
        let cost = Number.MAX_VALUE;
        let currentNode = null;
        let edgeNode = null;
        let cEdge = null;

        for (const vertex of Object.keys(graph)) {
            cEdge = getCloseEdge(vertex, cost, cEdge, copy, graph);
            if (!cEdge) {
                continue;
            }
            let [cNode, eNode, cCost] = cEdge;
            if (cCost < cost) {
                currentNode = cNode;
                edgeNode = eNode;
                cost = cCost;
            }
        }
        addEdgeToGraph(currentNode, edgeNode, cost, graph);
        const edgeId =`${currentNode}-${edgeNode}`
        const reverseId =`${edgeNode}-${currentNode}`
        textArea.value += edgeId + ' edge added..\n';
        if(edges.get(edgeId)){
            edges.update({id:edgeId,color:{color:'yellow'}});
        }
        if(edges.get(reverseId)){
            edges.update({id:reverseId,color:{color:'yellow'}});
        }
    }

    function getCloseEdge(node, cost,cEdgeInfo, copy, graph) {
        let closeEdge = cEdgeInfo;

        for (const neighbor of Object.keys(copy[node])) {
            if (Object.keys(graph).includes(neighbor)) {
                continue;
            }

            if (copy[node][neighbor] < cost) {
                closeEdge = [node, neighbor, copy[node][neighbor]];
                cost = copy[node][neighbor];
            }

        }

        return closeEdge;
    }

    function addEdgeToGraph(src, dest, weight, graph) {
        if (!graph.hasOwnProperty(src)) {
            graph[src]={};
        }
        if (!graph.hasOwnProperty(dest)) {
            graph[dest]={};
        }
        graph[src][dest]=weight;
        graph[dest][src]=weight;
    }

    function addVertexToGraph(graph, vertex) {
        if (!graph.hasOwnProperty(vertex)) {
            graph[vertex]={}
        }
    }

    addVertexToGraph(MST, node);

    async function colorPrim() {
        const delay = ms => new Promise(resolve => {
            const timeoutId = setTimeout(resolve, ms);
            timers.push(timeoutId);
        });

        for (let i = 0; i < nodes.length - 1; i++) {
            primUtil(MST, adjVertices);
            await delay(1000);
        }
        for(const node of Object.keys(MST)){
            network.body.data.nodes.update([{id:node ,color: 'yellow'}]);
        }
        textArea.value +='all nodes colored\n';
        textArea.value +='new MST : ' + JSON.stringify(MST,null,2);
    }

    colorPrim();

}

function runBoruvkaSollin(){
    let MST = {}
    let copyAdjVertices = {}
    let unionFind = new UnionFind();

    function addEdgeToGraph(src, dest, weight, graph) {
        if (!graph.hasOwnProperty(src)) {
            graph[src]={};
        }
        if (!graph.hasOwnProperty(dest)) {
            graph[dest]={};
        }

        graph[src][dest] = weight;
        graph[dest][src] = weight;
    }

    function removeEdge(src, dest, graph) {
        if (graph[src] && graph[src][dest]) {
            delete graph[src][dest];
        }
        if (graph[dest] && graph[dest][src]) {
            delete graph[dest][src];
        }
    }

    function lessWeightEdge(groups, graph, copy, unionFind) {
        let current = null;
        let next = null;
        let cost = Number.MAX_VALUE;

        groups.forEach(node => {
            for (const neighbor of Object.keys(copy[node])) {
                if (!groups.includes(neighbor) && copy[node][neighbor] < cost) {
                    current = node;
                    next = neighbor;
                    cost = copy[node][neighbor];
                }
            }
        });

        if (current === null || next === null || cost === Number.MAX_VALUE) {
            return;
        }

        addEdgeToGraph(current, next, cost, graph);
        const edgeId =`${current}-${next}`
        const reverseId =`${next}-${current}`
        textArea.value += edgeId + ' edge added..\n';
        if(edges.get(edgeId)){
            edges.update({id:edgeId,color:{color:'yellow'}});
        }
        if(edges.get(reverseId)){
            edges.update({id:reverseId,color:{color:'yellow'}});
        }
        unionFind.union(current, next);
    }

    for (const vertex of Object.keys(adjVertices)) {
        unionFind.makeSet(vertex);
        for (const neighbor of Object.keys(adjVertices[vertex])) {
            addEdgeToGraph(vertex, neighbor, adjVertices[vertex][neighbor], copyAdjVertices);
        }
    }
    async function colorBoruvka() {
        const delay = ms => new Promise(resolve => {
            const timeoutId = setTimeout(resolve, ms);
            timers.push(timeoutId);
        });

        for (const vertex of Object.keys(adjVertices)) {
            let current = vertex;
            let next = null;
            let cost = Number.MAX_VALUE;

            for (const neighbor of Object.keys(adjVertices[current])) {
                if (adjVertices[current][neighbor] < cost) {
                    next = neighbor;
                    cost = adjVertices[current][next];
                }
            }

            const edgeId =`${current}-${next}`
            const reverseId =`${next}-${current}`

            addEdgeToGraph(current, next, cost, MST);
            if(edges.get(edgeId)){
                if(!edges.get(edgeId).hasOwnProperty('color')){
                    textArea.value += edgeId + ' edge added..\n';
                }
                edges.update({id:edgeId,color: {color:'yellow'}} );
                await delay(1000);
            }
            if(edges.get(reverseId)){
                if(!edges.get(reverseId).hasOwnProperty('color')){
                    textArea.value += reverseId + ' edge added..\n';
                }
                edges.update({id:reverseId,color:{color:'yellow'}});
                await delay(1000);
            }
            removeEdge(current, next, copyAdjVertices);
        }

        for (const vertex of Object.keys(MST)) {
            for (const neighbor of Object.keys(MST[vertex])) {
                unionFind.union(vertex, neighbor);
            }
        }

        let connectedNodes = unionFind.listConnectedNodes();

        while (connectedNodes.length !== 1) {
            let nodeList = connectedNodes[0];
            let previousGraph = MST;
            lessWeightEdge(nodeList, MST, copyAdjVertices, unionFind);
            if(previousGraph!==MST){
                await delay(1000);
            }
            connectedNodes = unionFind.listConnectedNodes();
        }

        for(const node of Object.keys(MST)){
            network.body.data.nodes.update([{id:node ,color: 'yellow'}]);
        }
        textArea.value += 'all nodes colored..\n';
        textArea.value += 'new MST: ' + JSON.stringify(MST,null,2);
    }

    colorBoruvka();
}

function runReverseDelete(){
    let MST = adjVertices;
    edgeList.sort((p1,p2) => p2.weight - p1.weight);

    function removeEdge(u, v, graph) {
        delete graph[u][v];
        delete graph[v][u];
    }

    function addEdgeMST(src, dest, weight) {
        if (!MST.hasOwnProperty(src)) {
            MST[src]={};
        }
        if (!MST.hasOwnProperty(dest)) {
            MST[dest]={};
        }
        MST[src][dest] = weight;
        MST[dest][src] = weight;
    }

    function isConnected(node, graph) {
        return DFS(node, graph).length === Object.keys(graph).length;
    }

    function DFS(node, graph) {
        let result = [];
        DFSUtil(node, result, graph);
        return result;
    }

    function DFSUtil(node, result, graph) {
        if (!result.includes(node)) {
            result.push(node);
            for (let n of Object.keys(graph[node])) {
                DFSUtil(n, result, graph);
            }
        }
    }

    async function colorMST(){
        const delay = ms => new Promise(resolve => {
            const timeoutId = setTimeout(resolve, ms);
            timers.push(timeoutId);
        });
        edges.forEach(function (edge) {
            edges.update({ id: edge.id, color: { color: 'yellow' } });
        });
        textArea.value += 'all edges added..\n';
        for(let edge of edgeList){
            const edgeId =`${edge.source}-${edge.next}`
            const reverseId =`${edge.next}-${edge.source}`
            removeEdge(edge.source,edge.next,MST);
            textArea.value += edgeId + ' edge removed..\n';
            if(edges.get(edgeId)){
                edges.update({id:edgeId,color:{}});
            }
            if(edges.get(reverseId)){
                edges.update({id:reverseId,color:{}});
            }
            await delay(1000);
            if(!isConnected(edge.source,MST)){
                addEdgeMST(edge.source,edge.next,edge.weight);
                textArea.value += edgeId + ' edge added again..\n';
                if(edges.get(edgeId)){
                    edges.update({id:edgeId,color:{color:'yellow'}});
                }
                if(edges.get(reverseId)){
                    edges.update({id:reverseId,color:{color:'yellow'}});
                }
                await delay(1000);
            }
        }
        for(const node of Object.keys(MST)) {
            network.body.data.nodes.update([{id:node ,color: 'yellow'}]);
        }

        textArea.value += 'all nodes colored..\n';
        textArea.value += 'new MST: '+ JSON.stringify(MST,null,2);
    }

    colorMST();
}

function runWelshPowell(){
    let vertexColor = {};
    let vertexList = {};
    const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE','GRAY','BLACK','WHITE'];

    function nodeCheck(adjNodes, vertexColor, control) {
        for (let string of adjNodes) {
            let color = vertexColor[string];
            if (color !== null && color === control) {
                return false;
            }
        }
        return true;
    }

    for (let vertex of Object.keys(adjVertices)) {
        vertexList[vertex] = Object.keys(adjVertices[vertex]).length;
        vertexColor[vertex] = null;
    }
    let sortedList = Object.entries(vertexList).sort((a, b) => b[1] - a[1]);

    async function colorNodeDifferent() {
        const delay = ms => new Promise(resolve => {
            const timeoutId = setTimeout(resolve, ms);
            timers.push(timeoutId);
        });

        let i = 0;
        while (Object.values(vertexColor).some(color => color === null)) {
            for (let [node, _] of sortedList) {
                if (vertexColor[node] === null && nodeCheck(Object.keys(adjVertices[node]), vertexColor, colors[i])) {
                    vertexColor[node] = colors[i];
                    textArea.value+= node + ' node colored to -> '+ colors[i]+ '\n';
                    network.body.data.nodes.update([{id:node ,color: colors[i]}]);
                    await delay(1000);
                }
            }
            i++;
        }
        textArea.value += 'all nodes colored.. \n';
        textArea.value += 'number of color used -> '+ i;
    }
    colorNodeDifferent();
}