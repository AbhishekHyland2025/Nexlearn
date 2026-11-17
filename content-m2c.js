// DevPath content — Module 2: Non-linear DSA (part c)
// Topics: m2-trees, m2-binary-trees-bst, m2-maths-advanced, m2-tries, m2-heaps, m2-greedy
window.CONTENT = window.CONTENT || {};

/* ------------------------------------------------------------------ */
/* m2-trees — Trees & Traversals                                       */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-trees'] = {
  hook: `Your file explorer, your company org chart and the HTML of this page are all the same shape: a tree. Learn to walk it and half of "hard" interview problems become simple.`,
  intro: `<p>So far every structure you met was a line: arrays, linked lists, stacks, queues. One item after another. A <span class="term">tree</span> is different. It branches. One item at the top connects to several items below it, and each of those connects to several more. There are no loops: you can never walk down from an item and arrive back at it.</p>
<p>The item at the very top is the <span class="term">root</span>. Each item is called a <span class="term">node</span>. A node that has no children below it is a <span class="term">leaf</span>. The lines between nodes are <span class="term">edges</span>. A tree with n nodes always has exactly n minus 1 edges.</p>
<p>Trees are everywhere in software: folders inside folders, the DOM of a web page, JSON documents, a database index, the way a compiler reads your C# code, and the comment threads on Reddit. If you can walk a tree in the right order and ask each node one question, you can solve all of these problems with the same few patterns.</p>
<p>This lesson covers general trees (any number of children) and the four ways to visit every node. The next lesson narrows down to binary trees and binary search trees, where most interview questions live.</p>`,
  realLife: {
    title: 'The company org chart',
    body: `<p>Picture a company. The CEO is at the top. She has four vice presidents under her. Each VP has managers. Each manager has engineers. That picture is a tree. The CEO is the root. The engineers with nobody reporting to them are the leaves. "How many levels of management are there?" is the <span class="term">height</span> of the tree. "How far is this engineer from the CEO?" is that node's <span class="term">depth</span>.</p>
<p>Now imagine HR needs to send an announcement to everyone. They could do it level by level: first the CEO, then all VPs, then all managers, then all engineers. That is a <span class="term">breadth-first</span> walk. Or they could go down one chain completely (CEO → VP of Sales → Sales Manager → Sales Rep) before coming back up and going down the next chain. That is a <span class="term">depth-first</span> walk. Both visit everyone exactly once. They just do it in a different order.</p>
<p><strong>Where companies use this:</strong> Windows Explorer and macOS Finder walk a folder tree to show you files. Git stores every commit as a tree of folders and files. Your browser walks the DOM tree thousands of times a second to draw the page. Jira shows epics → stories → subtasks as a tree.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The words you need</h4>
<ul>
<li><strong>Root</strong>: the top node. There is exactly one.</li>
<li><strong>Parent / child</strong>: if A points down to B, A is the parent and B is the child. Every node except the root has exactly one parent.</li>
<li><strong>Siblings</strong>: nodes that share the same parent.</li>
<li><strong>Leaf</strong>: a node with no children.</li>
<li><strong>Depth of a node</strong>: how many edges from the root down to it. The root has depth 0.</li>
<li><strong>Height of a tree</strong>: the longest path from the root down to any leaf, counted in edges. A single node has height 0. An empty tree is usually treated as height -1 (or 0 if you count nodes instead of edges; always say which one you mean).</li>
<li><strong>Subtree</strong>: any node together with everything below it is itself a tree. This is the key idea behind recursion on trees.</li>
</ul>
<h4>A tree is defined by itself</h4>
<p>Here is the sentence that unlocks everything: <em>a tree is a node plus a list of smaller trees</em>. Each child is the root of its own smaller tree. So when you write code for a tree, you usually write code for one node and then call the same code on each child. That is <span class="term">recursion</span>, and trees are where recursion feels natural instead of scary.</p>
<div class="callout idea">Ask yourself for any tree problem: "If I knew the answer for each child's subtree, could I compute the answer for this node?" If yes, you have a recursive solution.</div>
<h4>N-ary trees in C#</h4>
<p>A general tree node (often called an <span class="term">n-ary tree</span> because a node can have n children) is just a value plus a list of child nodes:</p>
<pre><code>class TreeNode&lt;T&gt; { public T Value; public List&lt;TreeNode&lt;T&gt;&gt; Children = new(); }</code></pre>
<p>That is all. A folder is a TreeNode whose Children are the files and folders inside it.</p>
<h4>The two ways to walk</h4>
<ul>
<li><strong>Depth-first search (DFS)</strong>: go as deep as you can, then back up. Uses recursion (or your own stack).</li>
<li><strong>Breadth-first search (BFS)</strong>: visit level by level. Uses a queue.</li>
</ul>
<p>Both visit every node once, so both are O(n) time. The difference is the order you see nodes, and that order is what each problem cares about.</p>` },
    { name: 'Intermediate', body: `<h4>The three DFS orders (for binary trees)</h4>
<p>For a node with a left and right child, "visit" means "do something with this node's value" (print it, add it to a list). The three classic orders differ only in <em>when</em> you visit the node compared to its children:</p>
<table><thead><tr><th>Order</th><th>Steps</th><th>Typical use</th></tr></thead><tbody>
<tr><td>Preorder</td><td>visit, left, right</td><td>copy a tree, serialize it, print folder structure</td></tr>
<tr><td>Inorder</td><td>left, visit, right</td><td>BST gives sorted output</td></tr>
<tr><td>Postorder</td><td>left, right, visit</td><td>delete a tree, compute sizes/heights (children first)</td></tr>
</tbody></table>
<p>Memory aid: <strong>pre</strong> = parent first, <strong>post</strong> = parent last, <strong>in</strong> = parent in the middle.</p>
<h4>Iterative DFS with your own stack</h4>
<p>Recursion uses the call stack. If the tree is very deep (a linked-list shaped tree with 100,000 nodes) you can hit a stack overflow. The fix is to use an explicit <code>Stack&lt;T&gt;</code>. Preorder is the easiest: push root; loop: pop, visit, push right, push left (right first so left is processed first). Inorder needs a small trick: walk left pushing nodes, then pop, visit, and move to the right child. The code tab has both.</p>
<h4>BFS / level order with a queue</h4>
<p>Put the root in a queue. While the queue is not empty: take the front node, visit it, add its children to the back. To know where one level ends and the next begins, read <code>queue.Count</code> at the start of each round and process exactly that many nodes. This "count per level" trick gives you problems like "right side view", "level averages", and "zigzag order" almost for free.</p>
<h4>Classic computations</h4>
<ul>
<li><strong>Count nodes</strong>: 1 + sum of counts of children. Postorder thinking.</li>
<li><strong>Height</strong>: -1 for null, else 1 + max(height of children).</li>
<li><strong>Diameter</strong> (longest path between any two nodes): at each node, the longest path through it is leftHeight + rightHeight + 2 edges. Track the global max while computing heights in one pass. This is the single most asked tree question after traversals.</li>
<li><strong>Build from a parent array</strong>: you are given <code>parent[i]</code> for each node i (root has -1). Create all nodes first, then link each node to its parent's child list. O(n).</li>
</ul>
<div class="callout tip">Most tree functions follow one template: handle null, recurse on children, combine. Write that skeleton first, then fill the combine step.</div>` },
    { name: 'Expert', body: `<h4>Recursion depth and the .NET stack</h4>
<p>The default stack for the main thread in a .NET app is 1 MB on Windows (8 MB on many Linux setups). Each recursive frame for a simple tree function costs on the order of 50 to 100 bytes, so you can usually recurse ten to twenty thousand levels deep, but a skewed tree with a million nodes will crash. Options: convert to an iterative version with an explicit stack, or run the recursion on a thread created with a larger stack size (<code>new Thread(work, 256 * 1024 * 1024)</code>). Competitive programmers do the second; production code should do the first.</p>
<h4>Morris traversal: inorder in O(1) extra space</h4>
<p>Inorder traversal normally needs O(h) space for the stack. Morris traversal temporarily rewires the tree: for a node with a left child, find the rightmost node of the left subtree (its inorder predecessor) and point its right pointer back to the current node. Walk left. When you arrive at the current node again through that thread, remove the thread and go right. Every edge is walked at most three times, so it is still O(n). It is a classic "do you really understand pointers" interview question.</p>
<h4>Euler tour and flattening</h4>
<p>If you write down each node when you enter it and again when you leave it, you get the <span class="term">Euler tour</span>. Every subtree becomes a contiguous range in that sequence. That turns "update all nodes in the subtree of v" into a range update on an array, which a segment tree or Fenwick tree handles in O(log n). This is how large systems answer subtree queries fast (think: "total storage used under this folder" over millions of files).</p>
<h4>Lowest common ancestor at scale</h4>
<p>One LCA query is O(h) by walking up from both nodes. Many queries use <span class="term">binary lifting</span>: precompute for every node its 2^k-th ancestor for k up to log n. Then lift the deeper node to the same depth, and lift both together from the highest k downward until their ancestors differ. O(n log n) preprocessing, O(log n) per query. Used in version control, file systems, and taxonomy services.</p>
<h4>Trade-offs to say out loud in interviews</h4>
<ul>
<li>DFS uses O(h) memory; BFS uses O(w) where w is the widest level. For a full balanced tree, w is about n/2, so BFS can use far more memory.</li>
<li>Child lists as <code>List&lt;T&gt;</code> are flexible; a fixed array of children (as in tries) is faster and more compact when the branching factor is known.</li>
<li>A tree with parent pointers makes "walk up" O(1) per step but costs 8 bytes per node and makes mutation bug-prone.</li>
</ul>
<div class="callout warn">Height counted in nodes versus edges differs by one. Interviewers will test if you are consistent. State your definition in the first sentence.</div>` }
  ],
  flow: {
    title: 'Level-order (BFS) walk of a tree',
    steps: [
      { title: 'Enqueue root', desc: 'Create an empty queue and put the root node in it. The queue holds nodes we have seen but not yet processed.' },
      { title: 'Read level size', desc: 'Note how many nodes are in the queue right now. That number is exactly the size of the current level.' },
      { title: 'Dequeue one node', desc: 'Take the node at the front. This is the node we are visiting now.' },
      { title: 'Visit it', desc: 'Do the work: add its value to the current level list, update a sum, compare with a target.' },
      { title: 'Enqueue children', desc: 'Add every child of this node to the back of the queue. They belong to the next level.' },
      { title: 'Repeat for the level', desc: 'Loop steps 3 to 5 exactly "level size" times. When done, the queue holds only next-level nodes.' },
      { title: 'Next level or stop', desc: 'If the queue is empty, every node has been visited. Otherwise go back to step 2 for the next level.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Binary tree node + recursive DFS (pre/in/post) and BFS', code: `public class Node
{
    public int Val;
    public Node? Left, Right;
    public Node(int v) { Val = v; }
}

public static class Traversals
{
    // Preorder: node, left, right.   Time O(n), space O(h) for the call stack.
    public static void Preorder(Node? n, List<int> outList)
    {
        if (n == null) return;
        outList.Add(n.Val);
        Preorder(n.Left, outList);
        Preorder(n.Right, outList);
    }

    // Inorder: left, node, right. On a BST this yields sorted order.
    public static void Inorder(Node? n, List<int> outList)
    {
        if (n == null) return;
        Inorder(n.Left, outList);
        outList.Add(n.Val);
        Inorder(n.Right, outList);
    }

    // Postorder: left, right, node. Children are finished before the parent.
    public static void Postorder(Node? n, List<int> outList)
    {
        if (n == null) return;
        Postorder(n.Left, outList);
        Postorder(n.Right, outList);
        outList.Add(n.Val);
    }

    // BFS level order: returns one list per level. Time O(n), space O(widest level).
    public static List<List<int>> LevelOrder(Node? root)
    {
        var result = new List<List<int>>();
        if (root == null) return result;
        var q = new Queue<Node>();
        q.Enqueue(root);
        while (q.Count > 0)
        {
            int levelSize = q.Count;          // the trick: snapshot the size
            var level = new List<int>(levelSize);
            for (int i = 0; i < levelSize; i++)
            {
                var cur = q.Dequeue();
                level.Add(cur.Val);
                if (cur.Left != null) q.Enqueue(cur.Left);
                if (cur.Right != null) q.Enqueue(cur.Right);
            }
            result.Add(level);
        }
        return result;
    }
}

// Usage
//      1
//     / \\
//    2   3
//   / \\
//  4   5
var root = new Node(1) { Left = new Node(2) { Left = new Node(4), Right = new Node(5) }, Right = new Node(3) };
var pre = new List<int>(); Traversals.Preorder(root, pre);     // 1 2 4 5 3
var ino = new List<int>(); Traversals.Inorder(root, ino);      // 4 2 5 1 3
var post = new List<int>(); Traversals.Postorder(root, post);  // 4 5 2 3 1
var levels = Traversals.LevelOrder(root);                      // [1] [2 3] [4 5]
Console.WriteLine(string.Join(" ", pre));` },
    { lang: 'csharp', title: 'Iterative DFS with an explicit stack (no recursion limit)', code: `public static class IterativeDfs
{
    // Preorder with a stack. Push right first so left is popped first.
    public static List<int> Preorder(Node? root)
    {
        var result = new List<int>();
        if (root == null) return result;
        var st = new Stack<Node>();
        st.Push(root);
        while (st.Count > 0)
        {
            var cur = st.Pop();
            result.Add(cur.Val);
            if (cur.Right != null) st.Push(cur.Right);
            if (cur.Left != null) st.Push(cur.Left);
        }
        return result;
    }

    // Inorder with a stack: slide left pushing, pop, visit, go right.
    public static List<int> Inorder(Node? root)
    {
        var result = new List<int>();
        var st = new Stack<Node>();
        var cur = root;
        while (cur != null || st.Count > 0)
        {
            while (cur != null) { st.Push(cur); cur = cur.Left; }
            cur = st.Pop();
            result.Add(cur.Val);
            cur = cur.Right;
        }
        return result;
    }

    // Postorder trick: do "node, right, left" with a stack, then reverse.
    public static List<int> Postorder(Node? root)
    {
        var result = new List<int>();
        if (root == null) return result;
        var st = new Stack<Node>();
        st.Push(root);
        while (st.Count > 0)
        {
            var cur = st.Pop();
            result.Add(cur.Val);
            if (cur.Left != null) st.Push(cur.Left);
            if (cur.Right != null) st.Push(cur.Right);
        }
        result.Reverse();
        return result;
    }
}` },
    { lang: 'csharp', title: 'Height, count, diameter in one pass, and building from a parent array', code: `public static class TreeMath
{
    // Height in edges. Empty tree = -1, single node = 0.
    public static int Height(Node? n) =>
        n == null ? -1 : 1 + Math.Max(Height(n.Left), Height(n.Right));

    public static int Count(Node? n) =>
        n == null ? 0 : 1 + Count(n.Left) + Count(n.Right);

    // Diameter = longest path (in edges) between any two nodes.
    // Compute heights bottom-up and update the best answer at every node. O(n).
    public static int Diameter(Node? root)
    {
        int best = 0;
        int HeightAndUpdate(Node? n)
        {
            if (n == null) return -1;
            int lh = HeightAndUpdate(n.Left);
            int rh = HeightAndUpdate(n.Right);
            best = Math.Max(best, lh + rh + 2);   // path goes through n
            return 1 + Math.Max(lh, rh);
        }
        HeightAndUpdate(root);
        return best;
    }
}

// General (n-ary) tree node
public class NTree
{
    public int Id;
    public List<NTree> Children = new();
    public NTree(int id) { Id = id; }
}

public static class Builders
{
    // parent[i] = parent of node i, or -1 for the root. Returns the root. O(n).
    public static NTree FromParentArray(int[] parent)
    {
        var nodes = new NTree[parent.Length];
        for (int i = 0; i < parent.Length; i++) nodes[i] = new NTree(i);
        NTree? root = null;
        for (int i = 0; i < parent.Length; i++)
        {
            if (parent[i] == -1) root = nodes[i];
            else nodes[parent[i]].Children.Add(nodes[i]);
        }
        return root!;
    }

    // DFS on an n-ary tree: depth of every node.
    public static void Depths(NTree n, int depth, Dictionary<int, int> outMap)
    {
        outMap[n.Id] = depth;
        foreach (var c in n.Children) Depths(c, depth + 1, outMap);
    }
}

// parent = [-1, 0, 0, 1, 1, 2]  → 0 is root; 1,2 are its children; 3,4 under 1; 5 under 2
var root = Builders.FromParentArray(new[] { -1, 0, 0, 1, 1, 2 });
var depths = new Dictionary<int, int>();
Builders.Depths(root, 0, depths);
Console.WriteLine(depths[5]); // 2` }
  ],
  pitfalls: [
    'Forgetting the null check at the top of every recursive function. It is the base case; without it you get a NullReferenceException on the first leaf.',
    'Mixing up height in edges and height in nodes. Pick one definition and write it in a comment.',
    'In BFS, adding children to the queue before checking they are not null. Nulls in the queue crash the next Dequeue.',
    'Using recursion on a tree that may be very deep (for example, a degenerate tree built from sorted input). Switch to the iterative stack version.',
    'Computing diameter as "height of left + height of right of the root". The longest path may not pass through the root. You must check every node.',
    'Trying to rebuild a tree from only its preorder or only its inorder list. You need inorder plus one of the others (or null markers) to rebuild uniquely.'
  ],
  quiz: [
    { q: 'A tree has 50 nodes. How many edges does it have?', options: ['50', '49', '51', 'It depends on the shape'], answer: 1, why: 'Every node except the root has exactly one edge to its parent, so a tree always has n minus 1 edges.' },
    { q: 'Which traversal visits a parent node AFTER both of its children?', options: ['Preorder', 'Inorder', 'Postorder', 'Level order'], answer: 2, why: 'Postorder is left, right, then node. That is why it is used for deleting a tree or computing sizes: children are finished first.' },
    { q: 'Which data structure makes a level-order traversal work?', options: ['Stack', 'Queue', 'Hash set', 'Priority queue'], answer: 1, why: 'A queue is first-in first-out, so nodes are processed in the order they were discovered, level by level.' },
    { q: 'What is the time complexity of visiting every node in a tree with n nodes using DFS?', options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n squared)'], answer: 1, why: 'Each node is visited once and each edge is crossed a constant number of times, so the work is proportional to n.' },
    { q: 'Why might you prefer an iterative DFS with an explicit stack over a recursive one?', options: ['It is always faster', 'It visits nodes in a better order', 'It avoids stack overflow on very deep trees', 'It uses less total memory in all cases'], answer: 2, why: 'Recursion depth is limited by the thread stack. An explicit Stack lives on the heap and can grow as needed.' },
    { q: 'The diameter of a tree is computed by tracking, at every node, which value?', options: ['Depth of the node', 'Left height + right height + 2', 'Number of leaves below it', 'The maximum value in its subtree'], answer: 1, why: 'The longest path through a node goes down its left subtree and down its right subtree. Adding the two heights (in edges) plus the two edges to the children gives that path length.' }
  ],
  takeaways: [
    'A tree is a node plus a list of smaller trees. That definition is why recursion fits trees so well.',
    'DFS goes deep first (stack or recursion). BFS goes level by level (queue). Both are O(n).',
    'Preorder = parent first, inorder = parent in the middle, postorder = parent last.',
    'The "snapshot the queue count" trick turns BFS into level-by-level processing.',
    'Height, count and diameter all follow the same template: handle null, recurse, combine.',
    'Deep trees can overflow the call stack. Know the iterative versions.'
  ],
  interview: [
    { q: 'What is the difference between the depth of a node and the height of a tree?', a: `<p>Depth is measured from the root down to a node: number of edges on that path. Height is measured from a node down to its deepest leaf. The height of the tree is the height of the root, which equals the maximum depth of any node.</p>` },
    { q: 'When would you choose BFS over DFS on a tree?', a: `<p>When the answer depends on levels or on distance from the root: shortest path in an unweighted tree, printing level by level, finding the closest leaf, or the minimum depth. DFS is better when you need to combine results from subtrees (sizes, heights, paths) or when memory for a wide tree is a concern.</p>` },
    { q: 'How would you serialize a binary tree and rebuild it?', a: `<p>Do a preorder traversal and write a marker such as "#" for every null child. To rebuild, read the tokens in order: a "#" returns null, otherwise create the node and recursively build its left then right child. With the null markers, preorder alone is enough to rebuild the exact shape in O(n).</p>` },
    { q: 'Can you find the diameter of a tree in one traversal?', a: `<p>Yes. Write a function that returns the height of a subtree. While computing it, at each node compute leftHeight + rightHeight + 2 and update a shared maximum. The height function is postorder, so every node is processed once and the answer is ready when the recursion unwinds. O(n) time, O(h) space.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-binary-trees-bst — Binary Trees & BST                            */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-binary-trees-bst'] = {
  hook: `A binary search tree is a phone book that stays sorted while you add and remove names. Every lookup throws away half the book, just like binary search, but without ever shifting an array.`,
  intro: `<p>A <span class="term">binary tree</span> is a tree where every node has at most two children, called left and right. That small rule gives us simple, fast code, because every function only has to think about two cases.</p>
<p>A <span class="term">binary search tree (BST)</span> adds one more rule: for every node, everything in its left subtree is smaller than the node, and everything in its right subtree is larger. Because of that rule, you can find any value by starting at the root and going left or right, the same way binary search cuts an array in half.</p>
<p>A BST gives you insert, search and delete in O(h) time, where h is the height. If the tree is balanced, h is about log n, so a million items take about 20 steps. If the tree is skewed (you inserted sorted data), h becomes n and the BST degrades into a slow linked list. Keeping the tree balanced is the job of self-balancing trees like AVL and Red-Black trees, which this lesson introduces at the end.</p>
<p>Why learn this when .NET gives you <code>SortedDictionary</code> and <code>SortedSet</code>? Because those are red-black trees inside, and because interviewers ask BST questions to check if you can reason recursively with an invariant. Most "tree" questions in interviews are really BST questions.</p>`,
  realLife: {
    title: 'The librarian who never re-shelves',
    body: `<p>Imagine a library where books are stored on a tree of shelves. The first shelf holds one book, say "M". Books before M in the alphabet go to the left shelf, books after go to the right shelf. Each of those shelves repeats the rule. To find "Harry Potter", you walk: is H before M? yes, go left. Is H before F? no, go right. A few steps later you have it. To add a new book, you walk the same path and put it on the first empty spot. Nobody ever has to shift every book one place to the right, which is what an array would force you to do.</p>
<p>The library only stays fast if the shelves are balanced. If every new book is later in the alphabet than the last one, you end up with a long chain of right shelves and walk the whole chain each time. A smart librarian rotates shelves occasionally to keep the tree short. That is what AVL and red-black trees do automatically.</p>
<p><strong>Where companies use this:</strong> SQL Server and PostgreSQL store indexes as B-trees, a wide cousin of the BST made for disk pages. .NET's <code>SortedSet&lt;T&gt;</code> and Java's <code>TreeMap</code> are red-black trees. The Linux kernel uses red-black trees in its process scheduler.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Binary tree properties worth memorizing</h4>
<ul>
<li>A binary tree of height h (in edges) has at most 2^(h+1) minus 1 nodes.</li>
<li>Level k (root is level 0) holds at most 2^k nodes.</li>
<li>A tree with n nodes has height at least floor(log2 n). It can be as bad as n minus 1 if it is a chain.</li>
<li><strong>Full</strong>: every node has 0 or 2 children. <strong>Complete</strong>: all levels full except maybe the last, which is filled from the left (this is the heap shape). <strong>Perfect</strong>: all leaves at the same depth, every level full. <strong>Balanced</strong>: for every node, left and right heights differ by at most 1.</li>
</ul>
<h4>The BST rule in one picture</h4>
<p>Take node 50. The left subtree holds only values below 50. The right subtree holds only values above 50. Now go to the left child, say 30. Its left holds values below 30, and its right holds values between 30 and 50. Every node has a range it is allowed to be in, and that range gets narrower as you go down. We will use exactly that range idea later to validate a BST.</p>
<h4>Search, insert: follow the signs</h4>
<p>To <strong>search</strong> for x: start at the root. If x equals the node, done. If x is smaller, go left. If larger, go right. If you reach null, x is not there.</p>
<p>To <strong>insert</strong> x: do the same walk. When you reach null, create the node there. New nodes are always leaves.</p>
<h4>Inorder gives sorted order</h4>
<p>Walk left, visit node, walk right. On a BST that prints the values in ascending order. This single fact solves many problems: "kth smallest", "is this a BST?", "convert BST to sorted list", "find the two swapped nodes".</p>
<div class="callout tip">If a question mentions "sorted" and "tree" in the same breath, think inorder traversal first.</div>
<h4>Why duplicates matter</h4>
<p>Decide up front what to do with equal values. Common choices: disallow them, or always send equal values to the right. Say your choice in an interview before you code.</p>` },
    { name: 'Intermediate', body: `<h4>Delete: the only tricky operation</h4>
<p>Deleting a node has three cases:</p>
<ol>
<li><strong>Leaf</strong>: just remove it.</li>
<li><strong>One child</strong>: replace the node with its child.</li>
<li><strong>Two children</strong>: find the <span class="term">inorder successor</span> (the smallest value in the right subtree), copy its value into this node, then delete the successor from the right subtree. The successor has at most one child (no left child by definition), so that deletion is case 1 or 2.</li>
</ol>
<h4>Validate a BST (the range trick)</h4>
<p>A common wrong answer checks only that <code>left.Val &lt; node.Val &lt; right.Val</code>. That misses a grandchild that breaks the rule. The correct way passes a range (min, max) down: the root may be anything; the left child must be below the parent; the right child must be above. Each level narrows the range. Use <code>long</code> bounds so int.MinValue and int.MaxValue in the tree do not break the check.</p>
<h4>Lowest common ancestor in a BST</h4>
<p>In a general tree you need recursion. In a BST you just walk: if both values are smaller than the node, go left; if both are larger, go right; otherwise the current node is the split point and therefore the LCA. O(h), no extra memory.</p>
<h4>Kth smallest</h4>
<p>Inorder traversal with a counter. Stop when the counter hits k. Iterative inorder with a stack lets you stop early without visiting the whole tree. If this query is frequent, store the size of each subtree in the node and walk down in O(h).</p>
<h4>Balanced check and sorted array to BST</h4>
<p>Balanced check: compute heights bottom-up; if any node has children whose heights differ by more than 1, return -1 as a signal and stop. One pass, O(n). Sorted array to a balanced BST: take the middle element as the root, recurse on the left half and the right half. The tree is automatically balanced because each half is about equal.</p>
<h4>Serialize and deserialize</h4>
<p>Preorder with null markers works for any binary tree. For a BST you can skip the markers: preorder alone is enough because the BST rule tells you which values belong on the left. Rebuild with the same range trick as validation, consuming values while they fit the range.</p>
<div class="callout warn">BST operations are O(h), not O(log n). Only say O(log n) if you can also say why the tree is balanced.</div>` },
    { name: 'Expert', body: `<h4>Why skewed trees happen and the AVL fix</h4>
<p>Insert 1, 2, 3, 4, 5 in order and every node goes right. Height is n minus 1. Search is O(n). Real systems get sorted input all the time (timestamps, auto-increment ids), so a plain BST is unsafe in production. An <span class="term">AVL tree</span> stores the height in each node and, after every insert or delete, checks the balance factor (left height minus right height). If it is outside -1..1, it performs a <span class="term">rotation</span>.</p>
<p>A rotation is a local pointer rewrite that keeps the inorder sequence unchanged but moves a node up and another down. Right rotation at node y with left child x: x becomes the parent, y becomes x's right child, and x's old right subtree becomes y's left subtree. Four cases exist: Left-Left (one right rotation), Right-Right (one left rotation), Left-Right (rotate left at the child, then right at the node), Right-Left (mirror). AVL guarantees height at most about 1.44 log n.</p>
<h4>Red-black trees: fewer rotations, slightly taller</h4>
<p>Red-black trees color nodes and enforce rules (no two red nodes in a row, equal black height on every root-to-leaf path). The height is at most 2 log n, so lookups are a bit slower than AVL in theory, but inserts and deletes need at most two or three rotations, which makes them better for write-heavy workloads. <code>SortedSet&lt;T&gt;</code>, <code>SortedDictionary&lt;K,V&gt;</code>, Java's TreeMap, and C++ std::map all use red-black trees.</p>
<h4>B-trees: when the tree lives on disk</h4>
<p>Reading from disk or SSD happens in pages (commonly 4 KB to 16 KB). A node with two children wastes a page. A <span class="term">B-tree</span> node holds hundreds of keys, so the tree is very wide and only 3 or 4 levels deep for billions of rows. The default index type in almost every relational database is a B-tree (or B+ tree, where only leaves hold data and leaves are linked for range scans). The BST intuition still applies: keys inside a node are sorted, and child pointers sit between keys.</p>
<h4>Threaded trees, order statistics, augmentation</h4>
<p><span class="term">Augmenting</span> a BST means storing extra data in each node that can be maintained in O(1) during rotations: subtree size (gives kth-smallest and rank in O(log n)), subtree sum, min and max. Interval trees augment with "max right endpoint" to answer "which intervals overlap [a, b]?" in O(log n + k). This is the pattern behind calendar conflict detection and IP range lookups.</p>
<h4>Interview framing</h4>
<ul>
<li>Always state: "operations are O(h); with a self-balancing tree h is O(log n)."</li>
<li>For "design a data structure with insert, delete and get-min / predecessor / range count in log time", the answer is a balanced BST that stores subtree sizes (in .NET, SortedSet with GetViewBetween covers min, max and neighbours, but counting a range with it is not O(log n)).</li>
<li>Know that a hash map beats a BST for pure lookup, but a BST wins when you need order: floor, ceiling, range queries, sorted iteration.</li>
</ul>` }
  ],
  flow: {
    title: 'Deleting a node with two children from a BST',
    steps: [
      { title: 'Search for the key', desc: 'Walk from the root: go left if the key is smaller, right if larger, until you find the node to delete.' },
      { title: 'Count its children', desc: 'Zero children: unlink it. One child: replace it with that child. Two children: continue below.' },
      { title: 'Find the successor', desc: 'Go to the right child, then keep going left until there is no left child. That node holds the smallest value bigger than ours.' },
      { title: 'Copy the value', desc: 'Copy the successor value into the node you wanted to delete. The BST rule still holds because this value sits between the left and right subtrees.' },
      { title: 'Delete the successor', desc: 'The successor has no left child, so deleting it is the easy zero-or-one child case. Do it in the right subtree.' },
      { title: 'Return the new subtree root', desc: 'Each recursive call returns the (possibly changed) root of its subtree so the parent can relink it.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'BST: insert, search, delete, min, successor', code: `public class Node
{
    public int Val;
    public Node? Left, Right;
    public Node(int v) { Val = v; }
}

public static class Bst
{
    // All operations are O(h). Duplicates go to the right (our chosen rule).
    public static Node Insert(Node? root, int v)
    {
        if (root == null) return new Node(v);
        if (v < root.Val) root.Left = Insert(root.Left, v);
        else root.Right = Insert(root.Right, v);
        return root;
    }

    public static bool Search(Node? root, int v)
    {
        var cur = root;                      // iterative: no stack needed
        while (cur != null)
        {
            if (v == cur.Val) return true;
            cur = v < cur.Val ? cur.Left : cur.Right;
        }
        return false;
    }

    public static Node Min(Node n)
    {
        while (n.Left != null) n = n.Left;
        return n;
    }

    public static Node? Delete(Node? root, int v)
    {
        if (root == null) return null;
        if (v < root.Val) { root.Left = Delete(root.Left, v); return root; }
        if (v > root.Val) { root.Right = Delete(root.Right, v); return root; }

        // found it
        if (root.Left == null) return root.Right;     // 0 or 1 child
        if (root.Right == null) return root.Left;

        var succ = Min(root.Right);                   // 2 children
        root.Val = succ.Val;
        root.Right = Delete(root.Right, succ.Val);
        return root;
    }

    // Inorder successor of value v: smallest value greater than v. Returns null if none.
    public static Node? Successor(Node? root, int v)
    {
        Node? best = null;
        var cur = root;
        while (cur != null)
        {
            if (cur.Val > v) { best = cur; cur = cur.Left; }  // candidate, try smaller
            else cur = cur.Right;
        }
        return best;
    }
}

Node? root = null;
foreach (var x in new[] { 50, 30, 70, 20, 40, 60, 80 }) root = Bst.Insert(root, x);
Console.WriteLine(Bst.Search(root, 60));            // True
root = Bst.Delete(root, 50);                        // 60 moves up
Console.WriteLine(root!.Val);                       // 60
Console.WriteLine(Bst.Successor(root, 40)!.Val);    // 60` },
    { lang: 'csharp', title: 'Validate BST, LCA, kth smallest, balanced check', code: `public static class BstProblems
{
    // Validate with a shrinking (min, max) range. Use long so int extremes are safe. O(n).
    public static bool IsValidBst(Node? n, long min = long.MinValue, long max = long.MaxValue)
    {
        if (n == null) return true;
        if (n.Val <= min || n.Val >= max) return false;
        return IsValidBst(n.Left, min, n.Val) && IsValidBst(n.Right, n.Val, max);
    }

    // LCA in a BST: walk down until the two values split. O(h).
    public static Node? Lca(Node? root, int a, int b)
    {
        var cur = root;
        while (cur != null)
        {
            if (a < cur.Val && b < cur.Val) cur = cur.Left;
            else if (a > cur.Val && b > cur.Val) cur = cur.Right;
            else return cur;
        }
        return null;
    }

    // Kth smallest (1-based) with an iterative inorder walk that stops early.
    public static int KthSmallest(Node? root, int k)
    {
        var st = new Stack<Node>();
        var cur = root;
        while (cur != null || st.Count > 0)
        {
            while (cur != null) { st.Push(cur); cur = cur.Left; }
            cur = st.Pop();
            if (--k == 0) return cur.Val;
            cur = cur.Right;
        }
        throw new ArgumentException("k larger than tree size");
    }

    // Balanced check: returns height, or -1 as an "unbalanced" signal. One pass, O(n).
    public static bool IsBalanced(Node? root) => CheckHeight(root) != -1;
    private static int CheckHeight(Node? n)
    {
        if (n == null) return 0;
        int l = CheckHeight(n.Left);  if (l == -1) return -1;
        int r = CheckHeight(n.Right); if (r == -1) return -1;
        if (Math.Abs(l - r) > 1) return -1;
        return 1 + Math.Max(l, r);
    }

    // Sorted array -> balanced BST: middle becomes root. O(n).
    public static Node? FromSorted(int[] a, int lo, int hi)
    {
        if (lo > hi) return null;
        int mid = lo + (hi - lo) / 2;
        return new Node(a[mid]) { Left = FromSorted(a, lo, mid - 1), Right = FromSorted(a, mid + 1, hi) };
    }
}` },
    { lang: 'csharp', title: 'Serialize / deserialize any binary tree (preorder with null markers)', code: `using System.Text;

public static class Codec
{
    // "1,2,#,#,3,4,#,#,#"   (# = null). O(n) both ways.
    public static string Serialize(Node? root)
    {
        var sb = new StringBuilder();
        void Go(Node? n)
        {
            if (n == null) { sb.Append("#,"); return; }
            sb.Append(n.Val).Append(',');
            Go(n.Left);
            Go(n.Right);
        }
        Go(root);
        return sb.ToString().TrimEnd(',');
    }

    public static Node? Deserialize(string data)
    {
        var tokens = data.Split(',');
        int i = 0;
        Node? Build()
        {
            var t = tokens[i++];
            if (t == "#") return null;
            var n = new Node(int.Parse(t));
            n.Left = Build();
            n.Right = Build();
            return n;
        }
        return Build();
    }
}

// BST-only variant: no markers needed. Rebuild preorder using the range rule.
public static class BstCodec
{
    public static Node? FromPreorder(int[] pre)
    {
        int i = 0;
        Node? Build(long min, long max)
        {
            if (i == pre.Length || pre[i] <= min || pre[i] >= max) return null;
            var n = new Node(pre[i++]);
            n.Left = Build(min, n.Val);
            n.Right = Build(n.Val, max);
            return n;
        }
        return Build(long.MinValue, long.MaxValue);
    }
}` },
    { lang: 'csharp', title: 'AVL rotations: the idea in code (insert with rebalancing)', code: `public class AvlNode
{
    public int Val, Height = 1;         // height in nodes here, null = 0
    public AvlNode? Left, Right;
    public AvlNode(int v) { Val = v; }
}

public static class Avl
{
    static int H(AvlNode? n) => n?.Height ?? 0;
    static int Balance(AvlNode n) => H(n.Left) - H(n.Right);
    static void Fix(AvlNode n) => n.Height = 1 + Math.Max(H(n.Left), H(n.Right));

    // Right rotation around y: x (left child) moves up.
    static AvlNode RotateRight(AvlNode y)
    {
        var x = y.Left!;
        y.Left = x.Right;
        x.Right = y;
        Fix(y); Fix(x);
        return x;
    }
    static AvlNode RotateLeft(AvlNode x)
    {
        var y = x.Right!;
        x.Right = y.Left;
        y.Left = x;
        Fix(x); Fix(y);
        return y;
    }

    public static AvlNode Insert(AvlNode? n, int v)
    {
        if (n == null) return new AvlNode(v);
        if (v < n.Val) n.Left = Insert(n.Left, v);
        else n.Right = Insert(n.Right, v);
        Fix(n);
        int b = Balance(n);
        if (b > 1 && v < n.Left!.Val) return RotateRight(n);             // Left-Left
        if (b < -1 && v >= n.Right!.Val) return RotateLeft(n);            // Right-Right (equal values go right)
        if (b > 1) { n.Left = RotateLeft(n.Left!); return RotateRight(n); }   // Left-Right
        if (b < -1) { n.Right = RotateRight(n.Right!); return RotateLeft(n); } // Right-Left
        return n;
    }
}

AvlNode? root = null;
for (int i = 1; i <= 1000; i++) root = Avl.Insert(root, i);   // sorted input
Console.WriteLine(root!.Height);   // about 10, not 1000` }
  ],
  pitfalls: [
    'Validating a BST by only comparing a node with its direct children. A grandchild can break the rule. Pass a range down instead.',
    'Using int.MinValue / int.MaxValue as the initial range. A tree that contains those values will fail. Use long or nullable bounds.',
    'Forgetting that recursive insert and delete must return the subtree root so the parent can relink it. Forgetting the return silently loses nodes.',
    'Claiming O(log n) for a plain BST. It is O(h). Sorted input makes h equal to n.',
    'Deleting a node with two children by replacing it with its left child and attaching the right subtree somewhere. It can work but unbalances badly; use the successor (or predecessor) copy.',
    'Not deciding how duplicates are handled before coding.'
  ],
  quiz: [
    { q: 'You insert 10, 20, 30, 40, 50 in that order into an empty plain BST. What is the height (in edges)?', options: ['2', '3', '4', 'About log2(5)'], answer: 2, why: 'Each value is larger than the last, so each becomes the right child of the previous one: a chain of 5 nodes has 4 edges.' },
    { q: 'Which traversal of a BST produces values in ascending order?', options: ['Preorder', 'Inorder', 'Postorder', 'Level order'], answer: 1, why: 'Inorder visits left subtree (smaller), then node, then right subtree (larger), which is exactly sorted order.' },
    { q: 'When deleting a node with two children, which node\'s value do you copy into it?', options: ['The value of its parent node, if it has one', 'The smallest value in its right subtree', 'The largest value in its right subtree', 'The value of any leaf node below it'], answer: 1, why: 'The smallest value in the right subtree (the inorder successor) is larger than everything on the left and smaller than the rest of the right side, so the BST rule still holds. The largest value in the left subtree (the predecessor) works too.' },
    { q: 'What does a rotation in an AVL tree preserve?', options: ['The preorder sequence', 'The inorder sequence', 'The height of every node', 'The number of leaves'], answer: 1, why: 'A rotation rearranges pointers so that the sorted (inorder) order of values stays exactly the same while the tree gets shorter.' },
    { q: 'Why do databases use B-trees instead of binary search trees for indexes?', options: ['B-trees are easier to code', 'Wide nodes mean far fewer disk page reads', 'B-trees do not need balancing', 'Binary search trees cannot store string keys'], answer: 1, why: 'Disk reads happen in pages. A node holding hundreds of keys means the tree is only a few levels deep, so a lookup costs only a few page reads.' },
    { q: 'What does the "balanced" check return at each node in the one-pass solution?', options: ['true or false only', 'The depth of the node from the root', 'The height, or -1 if unbalanced', 'The number of nodes in the subtree'], answer: 2, why: 'Returning the height lets the parent check the difference; the -1 sentinel short-circuits the rest of the work.' }
  ],
  takeaways: [
    'BST rule: left subtree smaller, right subtree larger, for every node, not just direct children.',
    'Search, insert and delete are O(h). Balanced trees make h about log n; sorted input makes h about n.',
    'Inorder traversal of a BST is sorted. Use it for kth smallest, validation and conversions.',
    'Delete with two children: copy the inorder successor, then delete the successor.',
    'Validate with a shrinking (min, max) range passed down the recursion.',
    'AVL and red-black trees rotate to stay balanced. .NET SortedSet and SortedDictionary are red-black trees.'
  ],
  interview: [
    { q: 'How do you check if a binary tree is a valid BST?', a: `<p>Pass a valid range (min, max) down the recursion. The root can be anything. Going left, the max becomes the current value; going right, the min becomes the current value. Any node outside its range makes the tree invalid. Use long bounds or nullable ints to handle extreme values. O(n) time, O(h) space. Alternative: inorder traversal must be strictly increasing.</p>` },
    { q: 'Why is a hash map not always better than a BST?', a: `<p>A hash map gives O(1) average lookup but has no order. A balanced BST gives O(log n) lookup and also supports sorted iteration, floor and ceiling queries, range counts, min and max, and predecessor and successor. If the question needs any of those, a BST (SortedSet or SortedDictionary in .NET) is the right tool.</p>` },
    { q: 'What is the difference between AVL and red-black trees?', a: `<p>Both are self-balancing BSTs. AVL keeps a stricter balance (heights differ by at most 1), so it is shorter and slightly faster for reads but may need more rotations on writes. Red-black trees allow height up to 2 log n and need at most a couple of rotations per update, which suits write-heavy workloads. Most standard libraries pick red-black.</p>` },
    { q: 'Find the kth smallest element in a BST efficiently, and what if it is asked many times?', a: `<p>Once: iterative inorder traversal with a counter, stopping at k, O(h + k). Many times: augment each node with the size of its subtree. Then at each node compare k with left size + 1 to decide to go left, stop, or go right with k reduced. O(h) per query, and sizes are easy to keep updated on insert and delete.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-maths-advanced — Combinatorics, Probability, Modular Arithmetic  */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-maths-advanced'] = {
  hook: `"How many ways?" and "how likely?" are the two questions behind lottery odds, password strength, A/B tests and half of all counting problems in interviews. The maths is smaller than you fear.`,
  intro: `<p>This lesson is about counting and chance. <span class="term">Combinatorics</span> is the maths of counting arrangements: how many ways can you order 5 books, pick 3 people from 10, or split a cake? <span class="term">Probability</span> turns those counts into a number between 0 and 1 that says how likely something is.</p>
<p>Programs need this all the time. "How many test cases do I need?" "What is the chance two users get the same random id?" "How many paths exist across this grid?" And because counts grow enormous (20 factorial is already 2.4 quintillion), we usually work <span class="term">modulo</span> a big prime, which means we keep only the remainder after division by that prime so numbers stay small.</p>
<p>You already met modular arithmetic and fast power in the Linear DSA maths lesson. Here we build on them: factorials modulo a prime, "n choose r" with modular inverses, inclusion–exclusion, the pigeonhole principle, expected values and Catalan numbers. Each comes with a mental picture and a C# function you can paste into a solution.</p>`,
  realLife: {
    title: 'The birthday problem at the office',
    body: `<p>Your team has 23 people. What is the chance two of them share a birthday? Most people guess around 6%. The real answer is about 50%. The trick is to count the opposite: the chance that all 23 birthdays are different is (365/365) × (364/365) × (363/365) × ... for 23 terms, which comes out to about 0.49. So the chance of at least one match is about 0.51.</p>
<p>This exact calculation decides how long random ids must be. If your system generates ids randomly, the chance of a collision after k ids is roughly k squared divided by (2 × number of possible ids). That is why a 32-bit random id (4 billion values) starts colliding after only about 77,000 ids, and why UUIDs use 122 random bits.</p>
<p><strong>Where companies use this:</strong> payment providers size hash buckets and shard keys with birthday-style estimates. Lottery and casino games are audited with exact combinatorics. Google's A/B testing and any feature-flag experiment uses expected value and variance to decide whether a result is real or noise.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The two counting rules</h4>
<ul>
<li><strong>Multiply</strong> when choices happen one after the other. 3 shirts and 4 trousers give 3 × 4 = 12 outfits.</li>
<li><strong>Add</strong> when you choose between separate options. 3 bus routes or 2 train routes give 3 + 2 = 5 ways to travel.</li>
</ul>
<h4>Permutations: order matters</h4>
<p>How many ways can you line up n different things? n choices for the first spot, n minus 1 for the second, and so on. That product is <span class="term">n factorial</span>, written n!. 5! = 120. Picking r things from n in order is P(n, r) = n! / (n minus r)!. For example, gold, silver and bronze among 8 runners: 8 × 7 × 6 = 336.</p>
<h4>Combinations: order does not matter</h4>
<p>Pick a committee of 3 from 10 people. Order does not matter: {Ann, Bob, Cy} is the same committee as {Cy, Ann, Bob}. So take the ordered count and divide by the ways to order 3 things: C(10, 3) = 10 × 9 × 8 / 3! = 120. The general formula is C(n, r) = n! / (r! × (n minus r)!), read "n choose r".</p>
<div class="callout tip">Ask "if I swap two of the chosen items, is it a different outcome?" If yes, permutation. If no, combination.</div>
<h4>Probability basics</h4>
<p>Probability = favourable outcomes / all equally likely outcomes. Rolling a 6 on a fair die: 1/6. Rolling an even number: 3/6 = 1/2. Two rules you use constantly:</p>
<ul>
<li><strong>Complement</strong>: P(at least one) = 1 minus P(none). Often much easier to compute.</li>
<li><strong>Independent events multiply</strong>: two coin heads in a row = 1/2 × 1/2 = 1/4.</li>
</ul>
<h4>Pigeonhole principle</h4>
<p>If you put 11 socks into 10 drawers, some drawer has at least 2 socks. Simple, but it proves things like "in any 13 people, two share a birth month" and "among any n+1 integers, two have the same remainder mod n". When a problem says "prove there must exist", think pigeonhole.</p>` },
    { name: 'Intermediate', body: `<h4>Why we compute modulo a prime</h4>
<p>Answers like C(1000, 500) have about 300 digits. Contest and interview problems ask for the answer modulo 1,000,000,007 (a prime, written 1e9+7). Addition and multiplication work fine under mod: (a + b) mod p = ((a mod p) + (b mod p)) mod p, and the same for multiplication. Division does not work directly. Instead we multiply by the <span class="term">modular inverse</span>.</p>
<h4>Modular inverse via Fermat</h4>
<p>For a prime p and any a not divisible by p, Fermat's little theorem says a^(p minus 1) = 1 (mod p). So a^(p minus 2) is the inverse of a. Compute it with fast power in O(log p). This is why the modulus is always chosen prime.</p>
<h4>nCr mod p with precomputed factorials</h4>
<p>Precompute fact[i] = i! mod p for i up to the largest n you need, and invFact[i] = inverse of fact[i]. Then C(n, r) = fact[n] × invFact[r] × invFact[n minus r] mod p, in O(1) per query after O(n log p) setup (or O(n) with the trick invFact[i] = invFact[i+1] × (i+1)). The code tab shows this; it is the single most reused helper in counting problems.</p>
<h4>Inclusion–exclusion</h4>
<p>How many numbers from 1 to 100 are divisible by 2 or 3? Divisible by 2: 50. By 3: 33. But numbers divisible by 6 were counted twice, so subtract 16. Answer: 50 + 33 minus 16 = 67. With three sets: add singles, subtract pairs, add the triple. The pattern alternates signs. Used for "count strings that avoid all forbidden patterns" and derangements (permutations where nothing stays in place).</p>
<h4>Expected value</h4>
<p>Expected value is the long-run average: sum of (value × probability). A die has expected value (1+2+3+4+5+6)/6 = 3.5. The useful rule is <strong>linearity</strong>: E[X + Y] = E[X] + E[Y] even when X and Y depend on each other. Example: expected number of fixed points in a random shuffle of n items is n × (1/n) = 1, no matter how big n is. Define an indicator variable (1 if the thing happens, else 0) for each item and add their probabilities.</p>
<h4>Catalan numbers</h4>
<p>Cat(n) = C(2n, n) / (n+1): 1, 1, 2, 5, 14, 42, ... They count valid bracket sequences of n pairs, binary search trees with n nodes, ways to triangulate a polygon, and paths that never cross the diagonal. If a problem counts "balanced" structures, suspect Catalan.</p>
<div class="callout warn">Overflow is the top bug here. Multiplying two numbers below 1e9+7 can reach 1e18, which fits in long, but multiplying three does not. Take mod after every multiplication.</div>` },
    { name: 'Expert', body: `<h4>Lucas theorem and non-prime moduli</h4>
<p>If n is huge (say 1e18) but p is a small prime, you cannot precompute factorials. <span class="term">Lucas theorem</span> says C(n, r) mod p equals the product of C(n_i, r_i) over the base-p digits of n and r. Each digit is below p, so a small table suffices. For a composite modulus, factor it into prime powers, solve each with a generalized Lucas, and combine with the Chinese Remainder Theorem. These show up in advanced contest problems, rarely in product interviews, but knowing they exist marks you as someone who has thought about limits.</p>
<h4>Probability of collisions and hash sizing</h4>
<p>With k random values from a space of size N, the probability of at least one collision is approximately 1 minus e^(minus k²/(2N)). Set this equal to your acceptable risk to size ids. For a one-in-a-billion risk after one billion ids, N must be about 5 × 10^26, which is roughly 2^89. This is the actual reasoning behind 128-bit ids and 256-bit hashes. The same formula bounds how many entries a Bloom filter or a hash table can hold before false matches hurt.</p>
<h4>Randomized algorithms and expected running time</h4>
<p>Quicksort with a random pivot runs in expected O(n log n) regardless of input because the expected depth of the recursion tree is logarithmic. Skip lists give expected O(log n) search with no rebalancing. Reservoir sampling picks k uniformly random items from a stream of unknown length using probability k/i at step i. These are expected-value arguments: they say nothing about one run, but everything about the average over many runs.</p>
<h4>Counting with DP instead of formulas</h4>
<p>When a closed formula is unclear, count with dynamic programming: Pascal's triangle computes C(n, r) with C(n, r) = C(n minus 1, r minus 1) + C(n minus 1, r) in O(n²) with no division, which is handy when the modulus is not prime. Catalan numbers satisfy Cat(n) = sum over i of Cat(i) × Cat(n minus 1 minus i). "Number of ways to reach step n" style problems are the same idea.</p>
<h4>Overflow traps in C#</h4>
<ul>
<li><code>int</code> overflows silently at about 2.1 billion. 13! already overflows int. 21! overflows long.</li>
<li>Use <code>long</code> for intermediate products and mod after each multiplication. Use <code>checked</code> blocks during testing to throw on overflow.</li>
<li><code>%</code> in C# can return a negative result for negative inputs. Normalise with <code>((x % p) + p) % p</code>.</li>
<li><code>System.Numerics.BigInteger</code> exists for exact huge values but is slow; use it only when the problem truly needs the full number.</li>
</ul>
<h4>Interview angle</h4>
<p>Expect: "how many ways can a robot cross an m by n grid moving only right and down?" (C(m+n minus 2, m minus 1)), "probability that a random permutation has no fixed point?" (approaches 1/e), "how many BSTs with n keys?" (Catalan), and "estimate collisions for this id scheme".</p>` }
  ],
  flow: {
    title: 'Computing C(n, r) modulo a prime',
    steps: [
      { title: 'Pick the prime', desc: 'Use the modulus the problem gives, usually 1,000,000,007. It must be prime for the inverse trick to work.' },
      { title: 'Precompute factorials', desc: 'fact[0] = 1, then fact[i] = fact[i-1] × i mod p for i up to the maximum n. One pass, O(n).' },
      { title: 'Inverse of the last factorial', desc: 'invFact[max] = fact[max] raised to the power p-2, using fast modular exponentiation (Fermat). O(log p).' },
      { title: 'Walk inverses downward', desc: 'invFact[i] = invFact[i+1] × (i+1) mod p. This fills the whole inverse table in O(n) with no more exponentiation.' },
      { title: 'Answer a query', desc: 'C(n, r) = fact[n] × invFact[r] mod p × invFact[n-r] mod p. Take mod after each multiplication.' },
      { title: 'Guard the edges', desc: 'If r < 0 or r > n return 0. Make sure n never exceeds the precomputed size.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Modular helper: fast power, inverse, nCr with precomputed factorials', code: `public class Combinatorics
{
    public const long MOD = 1_000_000_007;
    private readonly long[] fact, invFact;

    // Precompute up to maxN. O(maxN + log MOD).
    public Combinatorics(int maxN)
    {
        fact = new long[maxN + 1];
        invFact = new long[maxN + 1];
        fact[0] = 1;
        for (int i = 1; i <= maxN; i++) fact[i] = fact[i - 1] * i % MOD;
        invFact[maxN] = Pow(fact[maxN], MOD - 2);          // Fermat inverse
        for (int i = maxN; i > 0; i--) invFact[i - 1] = invFact[i] * i % MOD;
    }

    // Fast exponentiation: O(log e). Square the base, halve the exponent.
    public static long Pow(long b, long e, long mod = MOD)
    {
        long result = 1;
        b %= mod;
        while (e > 0)
        {
            if ((e & 1) == 1) result = result * b % mod;
            b = b * b % mod;
            e >>= 1;
        }
        return result;
    }

    public static long Inverse(long a) => Pow(a, MOD - 2);

    public long C(int n, int r)
    {
        if (r < 0 || r > n) return 0;
        return fact[n] * invFact[r] % MOD * invFact[n - r] % MOD;
    }

    public long P(int n, int r)          // ordered selections
    {
        if (r < 0 || r > n) return 0;
        return fact[n] * invFact[n - r] % MOD;
    }

    public long Catalan(int n) => C(2 * n, n) * Inverse(n + 1) % MOD;

    // Always normalise results of % that may be negative.
    public static long Norm(long x) => ((x % MOD) + MOD) % MOD;
}

var comb = new Combinatorics(1_000_000);
Console.WriteLine(comb.C(10, 3));        // 120
Console.WriteLine(comb.C(1000, 500));    // 159835829 (mod 1e9+7)
Console.WriteLine(comb.Catalan(5));      // 42
Console.WriteLine(comb.P(8, 3));         // 336

// Grid paths: robot from (0,0) to (m-1,n-1) moving only right/down = C(m+n-2, m-1)
int m = 7, n = 3;
Console.WriteLine(comb.C(m + n - 2, m - 1));   // 28` },
    { lang: 'csharp', title: 'Pascal triangle (no division, any modulus) and inclusion–exclusion', code: `public static class Counting
{
    // C(n, r) via Pascal: C(n,r) = C(n-1,r-1) + C(n-1,r). O(maxN^2) time for the whole table, works for any modulus.
    public static long[,] PascalTable(int maxN, long mod)
    {
        var c = new long[maxN + 1, maxN + 1];
        for (int i = 0; i <= maxN; i++)
        {
            c[i, 0] = 1;
            for (int j = 1; j <= i; j++)
                c[i, j] = (c[i - 1, j - 1] + c[i - 1, j]) % mod;
        }
        return c;
    }

    // Count numbers in [1, n] divisible by at least one of the given primes.
    // Inclusion–exclusion over all non-empty subsets: + for odd size, - for even size.
    public static long CountDivisibleByAny(long n, int[] primes)
    {
        int k = primes.Length;
        long total = 0;
        for (int mask = 1; mask < (1 << k); mask++)
        {
            long product = 1; int bits = 0;
            for (int i = 0; i < k; i++)
                if ((mask & (1 << i)) != 0) { product *= primes[i]; bits++; }
            long count = n / product;
            total += (bits % 2 == 1) ? count : -count;
        }
        return total;
    }

    // Derangements: permutations with no fixed point. D(n) = (n-1) * (D(n-1) + D(n-2)).
    public static long Derangements(int n, long mod)
    {
        if (n == 0) return 1;
        if (n == 1) return 0;
        long a = 1, b = 0;                       // D(0), D(1)
        for (int i = 2; i <= n; i++)
        {
            long cur = (i - 1) % mod * ((a + b) % mod) % mod;
            a = b; b = cur;
        }
        return b;
    }
}

Console.WriteLine(Counting.CountDivisibleByAny(100, new[] { 2, 3 }));  // 67
Console.WriteLine(Counting.Derangements(4, 1_000_000_007));            // 9
var pas = Counting.PascalTable(30, 1_000_000_007);
Console.WriteLine(pas[30, 15]);                                        // 155117520` },
    { lang: 'csharp', title: 'Probability: birthday collisions, expected value by indicators, reservoir sampling', code: `public static class Probability
{
    // P(at least one shared birthday among k people with d possible days).
    public static double BirthdayCollision(int k, int d = 365)
    {
        double pNoMatch = 1.0;
        for (int i = 0; i < k; i++) pNoMatch *= (double)(d - i) / d;
        return 1.0 - pNoMatch;
    }

    // Approximate collision probability for k random ids from a space of size n (bits).
    public static double IdCollision(double k, int bits)
    {
        double n = Math.Pow(2, bits);
        return 1.0 - Math.Exp(-k * k / (2 * n));
    }

    // Expected fixed points in a random permutation of n items, computed by simulation
    // to show linearity of expectation (the exact answer is 1 for any n).
    public static double ExpectedFixedPoints(int n, int trials, Random rng)
    {
        long total = 0;
        var arr = new int[n];
        for (int t = 0; t < trials; t++)
        {
            for (int i = 0; i < n; i++) arr[i] = i;
            for (int i = n - 1; i > 0; i--)            // Fisher-Yates shuffle
            {
                int j = rng.Next(i + 1);
                (arr[i], arr[j]) = (arr[j], arr[i]);
            }
            for (int i = 0; i < n; i++) if (arr[i] == i) total++;
        }
        return (double)total / trials;
    }

    // Reservoir sampling: pick k uniformly random items from a stream of unknown length.
    public static List<T> Reservoir<T>(IEnumerable<T> stream, int k, Random rng)
    {
        var res = new List<T>(k);
        int i = 0;
        foreach (var item in stream)
        {
            i++;
            if (res.Count < k) res.Add(item);
            else
            {
                int j = rng.Next(i);               // 0..i-1, probability k/i to keep
                if (j < k) res[j] = item;
            }
        }
        return res;
    }
}

Console.WriteLine(Probability.BirthdayCollision(23).ToString("0.000"));     // 0.507
Console.WriteLine(Probability.IdCollision(77_000, 32).ToString("0.00"));     // about 0.50
Console.WriteLine(Probability.ExpectedFixedPoints(50, 100_000, new Random(1)).ToString("0.00")); // about 1.00
var sample = Probability.Reservoir(Enumerable.Range(1, 1_000_000), 5, new Random());
Console.WriteLine(string.Join(",", sample));` }
  ],
  pitfalls: [
    'Dividing under a modulus. There is no division; multiply by the modular inverse, and that only works when the modulus is prime (or coprime with the divisor).',
    'Overflow in intermediate products. Use long and take the modulus after every multiplication, never only at the end.',
    'Negative results from % in C#. Normalise with ((x % p) + p) % p whenever subtraction is involved.',
    'Confusing permutations with combinations. Swap two chosen items: different result means permutation.',
    'Computing P(at least one) directly. Use the complement 1 - P(none); it is almost always simpler.',
    'Precomputing factorials to the wrong size and indexing past the array for large n.'
  ],
  quiz: [
    { q: 'How many ways can 3 medals (gold, silver, bronze) be awarded among 8 runners?', options: ['56', '336', '24', '512'], answer: 1, why: 'Order matters, so this is a permutation: 8 × 7 × 6 = 336. C(8,3) = 56 would be the number of podium groups without order.' },
    { q: 'Why must the modulus be prime to compute nCr with the factorial trick?', options: ['Primes are faster to multiply', 'The Fermat inverse trick needs a prime modulus', 'Factorials of primes are smaller', 'It is a convention with no mathematical reason'], answer: 1, why: 'Division is replaced by multiplying with the inverse a^(p-2), and that identity holds when p is prime.' },
    { q: 'What is the expected number of fixed points in a random shuffle of 1,000 items?', options: ['0', '1', '500', 'About 1000/e'], answer: 1, why: 'Each item stays in place with probability 1/1000. By linearity of expectation the total is 1000 × 1/1000 = 1.' },
    { q: 'Numbers from 1 to 60 divisible by 2 or 5: how many?', options: ['42', '36', '30', '48'], answer: 1, why: 'Divisible by 2: 30. By 5: 12. By 10 (counted twice): 6. 30 + 12 - 6 = 36.' },
    { q: 'Which sequence counts the number of structurally different BSTs with n nodes?', options: ['Fibonacci numbers', 'Factorials', 'Catalan numbers', 'Powers of 2'], answer: 2, why: 'Choosing each key as root and multiplying left and right counts gives the Catalan recurrence; Cat(3) = 5 BSTs for 3 nodes.' },
    { q: 'You generate random 32-bit ids. Roughly after how many ids does the chance of a collision reach 50%?', options: ['About 2 billion', 'About 77 thousand', 'About 4 billion', 'About 1 million'], answer: 1, why: 'The birthday bound is about the square root of the space: sqrt(2 × ln 2 × 2^32) is about 77,000.' }
  ],
  takeaways: [
    'Multiply for sequential choices, add for alternative choices.',
    'Permutation = order matters (n!/(n-r)!). Combination = order does not matter (divide by r!).',
    'Under a prime modulus, divide by multiplying with the Fermat inverse a^(p-2).',
    'Precompute fact[] and invFact[] once; then each nCr is O(1).',
    'Inclusion–exclusion: add singles, subtract pairs, add triples, alternating.',
    'Linearity of expectation: add up indicator probabilities, even when events are dependent.',
    'Catalan numbers count balanced things: brackets, BSTs, non-crossing paths.'
  ],
  interview: [
    { q: 'How many unique paths does a robot have on an m × n grid moving only right or down?', a: `<p>The robot makes exactly (m-1) down moves and (n-1) right moves in some order, m+n-2 moves in total. Choose which of those are downs: C(m+n-2, m-1). For a 3 × 7 grid that is C(8, 2) = 28. If cells can be blocked, switch to DP where dp[i][j] = dp[i-1][j] + dp[i][j-1].</p>` },
    { q: 'How would you compute C(n, r) mod 1e9+7 for n up to 1e6 and a million queries?', a: `<p>Precompute factorials and inverse factorials up to 1e6 once (O(n) plus one fast power). Each query is then three multiplications: fact[n] × invFact[r] × invFact[n-r] mod p. Total time is O(n + q).</p>` },
    { q: 'Explain the birthday problem and why it matters for system design.', a: `<p>With 23 people the probability of a shared birthday already exceeds 50%, because the number of pairs grows quadratically. The same applies to random ids and hash values: collisions become likely after roughly the square root of the number of possible values. That is why ids and hashes are sized at 128 bits or more, and why hash table load factors are kept well below 1.</p>` },
    { q: 'What is linearity of expectation and give an example where it saves work.', a: `<p>E[X + Y] = E[X] + E[Y] always, even if X and Y are dependent. Example: expected number of empty bins when n balls are thrown into n bins. For each bin, P(empty) = (1 - 1/n)^n, about 1/e, so the expected number of empty bins is about n/e. No need to enumerate outcomes.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-tries — Tries (Prefix Trees)                                     */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-tries'] = {
  hook: `Type "mic" into a search box and it offers "microservices" before you finish. That instant suggestion is a trie: a tree where every path spells a word.`,
  intro: `<p>A <span class="term">trie</span> (pronounced "try", from re-trie-val) is a tree built for strings. Instead of storing whole words in nodes, each edge holds one character. A word is a path from the root. "cat" and "car" share the path c → a and then split into t and r. Shared prefixes are stored once.</p>
<p>That shape makes prefix questions cheap. "Is there any word that starts with 'ca'?" Walk two edges. "Give me all words starting with 'ca'." Walk two edges, then collect everything below. The cost depends on the length of the prefix, not on how many words are stored. A hash set cannot do that: it can only answer "is this exact word present?".</p>
<p>Tries power autocomplete, spell checkers, IP routing tables, T9 keyboards, and the "longest common prefix" and "maximum XOR" problems in interviews. The lesson shows two node layouts (a dictionary of children and a fixed array of 26 slots), the four core operations, and the binary trie trick for XOR problems.</p>`,
  realLife: {
    title: 'The phone book with tabs inside tabs',
    body: `<p>Think of an old paper phone book with letter tabs: A, B, C... Open the "S" tab. Inside, imagine another set of tabs for the second letter: Sa, Sb, Sc... Inside "Sm", more tabs: Sma, Smi, Smo... After "Smi" there is "Smit", then "Smith", and a small mark that says "this is a complete surname". To find every Smith, you flip exactly five tabs, then read everything under that last tab. You never look at a single name starting with another letter.</p>
<p>That is a trie. Every tab is a node, the little mark is the "end of word" flag, and the number of tabs you flip equals the length of what you typed, no matter whether the book has a thousand names or a million.</p>
<p><strong>Where companies use this:</strong> Google and Bing autocomplete use tries (plus ranking) for the first few characters. Routers hold IP prefixes in a binary trie to find the longest matching route in nanoseconds. Spell checkers and the Scrabble solver on your phone walk a trie of valid words.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>What a trie node holds</h4>
<p>A node has two things: a way to reach its children (one child per possible next character) and a flag <code>IsEnd</code> that says "a word finishes here". The root represents the empty string. Note that the node does not store its own character; the edge into it does. In code, the edge is simply the key in the child map.</p>
<h4>Two ways to store children</h4>
<div class="compare"><div><h5>Dictionary&lt;char, Node&gt;</h5><p>Works for any alphabet (Unicode, digits, symbols). Uses memory only for children that exist. Slightly slower per step because of hashing.</p></div><div><h5>Node[26] array</h5><p>Only for lowercase a–z. Index is <code>c - 'a'</code>. Fastest lookups. Wastes space when most slots are null (a node with one child still holds 26 references).</p></div></div>
<h4>Insert a word</h4>
<p>Start at the root. For each character, if there is no child for it, create one. Move to that child. After the last character, set <code>IsEnd = true</code>. Cost: O(L) for a word of length L, regardless of how many words are already stored.</p>
<h4>Search a word</h4>
<p>Walk the characters. If any child is missing, the word is not there. If you finish the walk, the word exists only if <code>IsEnd</code> is true on the final node. "car" being stored does not mean "ca" is a word, but "ca" is a valid <em>prefix</em>.</p>
<h4>StartsWith</h4>
<p>Same walk as search, but you do not check <code>IsEnd</code>. Reaching the end of the prefix is enough.</p>
<div class="callout tip">Search and StartsWith are the same function with one line of difference. Write a private helper that returns the last node (or null) and use it for both.</div>
<h4>Time and space</h4>
<p>Every operation is O(L), where L is the word or prefix length. Space is O(total characters stored) in the worst case, but shared prefixes reduce it a lot for real dictionaries.</p>` },
    { name: 'Intermediate', body: `<h4>Delete without breaking other words</h4>
<p>Deleting "car" when "card" also exists must not remove the path c → a → r. The safe way is recursive: walk down to the end of the word, unset <code>IsEnd</code>, then on the way back up remove a child only if it has no children of its own and is not the end of another word. Each level returns "can my parent delete me?".</p>
<h4>Counting with the trie</h4>
<p>Add two counters to each node: <code>PrefixCount</code> (how many stored words pass through this node) and <code>WordCount</code> (how many times this exact word was inserted). Increment them on insert, decrement on delete. Now "how many words start with 'pro'?" is a single walk, and duplicates are handled without extra lists.</p>
<h4>Autocomplete: collect everything under a node</h4>
<p>Walk to the end of the prefix, then do a DFS from there, building the string as you go and adding it to the result whenever you hit <code>IsEnd</code>. To return only the top k suggestions, either store a popularity score at each end node and sort the collected results, or store at each node a small cached list of the best k completions below it (what real search engines do, since the DFS over a huge subtree is too slow at typing speed).</p>
<h4>Longest common prefix of many strings</h4>
<p>Insert all strings. Starting at the root, follow the path while the current node has exactly one child and is not an end of word. The characters you pass form the longest common prefix. O(total length).</p>
<h4>Word search in a grid (Boggle)</h4>
<p>Given a board of letters and a dictionary, find all dictionary words that can be formed by walking adjacent cells. Put the dictionary in a trie, then DFS the board while walking the trie at the same time. The moment the trie has no child for the next letter, stop that path. This prunes huge amounts of work compared to checking each word separately.</p>
<h4>Binary trie for maximum XOR</h4>
<p>Treat each integer as a 32-character string of bits, most significant bit first. Insert all numbers. For a query x, walk from the top bit: at each level prefer the child with the opposite bit of x (that makes the XOR bit 1). If the opposite child does not exist, take the same bit. The number you build is the maximum XOR partner of x. O(32) per query. This is the standard answer to "maximum XOR of two numbers in an array".</p>
<div class="callout warn">Array-of-26 nodes cost 26 × 8 = 208 bytes each on 64-bit .NET, before the object header. A million nodes is about 220 MB. Use a Dictionary for sparse alphabets or compress the trie.</div>` },
    { name: 'Expert', body: `<h4>Memory layouts that scale</h4>
<ul>
<li><strong>Compressed trie (radix tree / Patricia trie)</strong>: merge every chain of single-child nodes into one edge labelled with a substring. Lookup compares substrings instead of single characters. Node count drops from "total characters" to at most 2 × number of words. Linux's routing tables and many in-memory key-value stores (for example Redis's internal rax) use radix trees.</li>
<li><strong>Ternary search tree</strong>: each node has a character and three children (less, equal, greater). It is a BST over characters at each position: memory like a BST, prefix queries like a trie. Good when the alphabet is large.</li>
<li><strong>Double-array trie / FST</strong>: pack the whole trie into two integer arrays for cache-friendly, read-only lookups. Lucene and Elasticsearch store term dictionaries as finite state transducers (FSTs), which are minimised tries that also share suffixes.</li>
</ul>
<h4>Aho–Corasick: a trie with failure links</h4>
<p>To find all occurrences of thousands of patterns in a text in one pass, build a trie of the patterns and add a <span class="term">failure link</span> from each node to the longest proper suffix of its path that is also in the trie (computed with BFS, like KMP's prefix function generalised). Then scan the text once, following child links when possible and failure links otherwise. Time is O(text + total pattern length + matches). This is how antivirus scanners, intrusion detection systems and profanity filters work.</p>
<h4>Longest prefix match in routers</h4>
<p>An IP routing table is a binary trie over the 32 (or 128) bits of the destination address. A route 10.0.0.0/8 is stored at depth 8. Lookup walks as deep as the bits allow and remembers the last node that had a route. Hardware routers implement this with TCAM or multi-bit tries (stride of 8 bits per level) to answer in a few memory accesses. The same algorithm answers "which pricing tier does this phone number prefix belong to?" in telecom billing.</p>
<h4>Trie versus hash map versus sorted array</h4>
<table><thead><tr><th>Need</th><th>Best choice</th></tr></thead><tbody>
<tr><td>Exact lookup only</td><td>Hash map (O(1) average, less memory)</td></tr>
<tr><td>Prefix queries, autocomplete</td><td>Trie or radix tree</td></tr>
<tr><td>Static set, range queries, small memory</td><td>Sorted array + binary search</td></tr>
<tr><td>Many patterns in one text</td><td>Aho–Corasick</td></tr>
<tr><td>Bitwise prefix (XOR, IP)</td><td>Binary trie</td></tr>
</tbody></table>
<h4>Interview angle</h4>
<p>Implement Trie (insert, search, startsWith) is the standard warm-up. Follow-ups: delete safely, wildcard search with '.' (DFS branching on all children at that position), word search II on a grid, replace words with their shortest root, and maximum XOR. The deeper follow-up is memory: "your trie has 50 million nodes; what now?" The answer is a radix tree or an FST.</p>` }
  ],
  flow: {
    title: 'Inserting "car" and "cat", then searching "ca"',
    steps: [
      { title: 'Start at the root', desc: 'The root is an empty node that represents the empty string. It has no character of its own.' },
      { title: 'Insert c, a, r', desc: 'No child for "c": create it. No child for "a" under it: create it. Same for "r". Mark the "r" node as end of word.' },
      { title: 'Insert c, a, t', desc: 'Child "c" exists: reuse it. Child "a" exists: reuse it. No child "t": create it and mark it as end of word. The prefix "ca" was stored once.' },
      { title: 'Search "ca"', desc: 'Walk c then a. Both exist, so the walk succeeds.' },
      { title: 'Check the end flag', desc: 'The "a" node is not marked as end of word. So search("ca") is false, but startsWith("ca") is true.' },
      { title: 'Autocomplete "ca"', desc: 'From the "a" node, DFS all children: you reach "r" (word: car) and "t" (word: cat). Both are suggestions.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Trie with Dictionary children: insert, search, startsWith, delete, counts', code: `public class TrieNode
{
    public Dictionary<char, TrieNode> Children = new();
    public bool IsEnd;
    public int PrefixCount;   // words passing through this node
    public int WordCount;     // times this exact word was inserted
}

public class Trie
{
    private readonly TrieNode root = new();

    // O(L)
    public void Insert(string word)
    {
        var cur = root;
        foreach (char c in word)
        {
            if (!cur.Children.TryGetValue(c, out var next))
            {
                next = new TrieNode();
                cur.Children[c] = next;
            }
            cur = next;
            cur.PrefixCount++;
        }
        cur.IsEnd = true;
        cur.WordCount++;
    }

    private TrieNode? Walk(string s)
    {
        var cur = root;
        foreach (char c in s)
        {
            if (!cur.Children.TryGetValue(c, out var next)) return null;
            cur = next;
        }
        return cur;
    }

    public bool Search(string word) => Walk(word)?.IsEnd == true;
    public bool StartsWith(string prefix) => Walk(prefix) != null;
    public int CountWordsWithPrefix(string prefix) => Walk(prefix)?.PrefixCount ?? 0;

    // Safe delete: only prune nodes no other word needs. Returns true if removed.
    public bool Delete(string word)
    {
        if (!Search(word)) return false;
        Remove(root, word, 0);
        return true;
    }

    private bool Remove(TrieNode node, string word, int i)
    {
        if (i == word.Length)
        {
            node.WordCount--;
            if (node.WordCount == 0) node.IsEnd = false;
        }
        else
        {
            var child = node.Children[word[i]];
            child.PrefixCount--;
            bool childCanGo = Remove(child, word, i + 1);
            if (childCanGo) node.Children.Remove(word[i]);
        }
        // this node can be deleted by its parent if nothing depends on it
        return !node.IsEnd && node.Children.Count == 0 && node != root;
    }

    // Autocomplete: all words under a prefix (DFS). O(size of subtree).
    public List<string> Suggest(string prefix, int limit = 10)
    {
        var result = new List<string>();
        var start = Walk(prefix);
        if (start == null) return result;
        var sb = new System.Text.StringBuilder(prefix);
        void Dfs(TrieNode n)
        {
            if (result.Count >= limit) return;
            if (n.IsEnd) result.Add(sb.ToString());
            foreach (var (c, child) in n.Children.OrderBy(kv => kv.Key))
            {
                sb.Append(c);
                Dfs(child);
                sb.Length--;
            }
        }
        Dfs(start);
        return result;
    }
}

var t = new Trie();
foreach (var w in new[] { "car", "card", "care", "cat", "dog" }) t.Insert(w);
Console.WriteLine(t.Search("car"));                 // True
Console.WriteLine(t.Search("ca"));                  // False
Console.WriteLine(t.StartsWith("ca"));              // True
Console.WriteLine(t.CountWordsWithPrefix("car"));   // 3
Console.WriteLine(string.Join(",", t.Suggest("ca"))); // car,card,care,cat
t.Delete("car");
Console.WriteLine(t.Search("card"));                // True (path kept)` },
    { lang: 'csharp', title: 'Array-based trie (a–z), longest common prefix, wildcard search', code: `public class ArrayTrie
{
    private class Node { public Node?[] Next = new Node?[26]; public bool IsEnd; public int Kids; }
    private readonly Node root = new();

    public void Insert(string w)
    {
        var cur = root;
        foreach (char c in w)
        {
            int i = c - 'a';
            if (cur.Next[i] == null) { cur.Next[i] = new Node(); cur.Kids++; }
            cur = cur.Next[i]!;
        }
        cur.IsEnd = true;
    }

    // Longest common prefix of all inserted words: follow single-child, non-end nodes.
    public string LongestCommonPrefix()
    {
        var sb = new System.Text.StringBuilder();
        var cur = root;
        while (cur.Kids == 1 && !cur.IsEnd)
        {
            int i = Array.FindIndex(cur.Next, n => n != null);
            sb.Append((char)('a' + i));
            cur = cur.Next[i]!;
        }
        return sb.ToString();
    }

    // Search where '.' matches any single letter (LeetCode "Add and Search Word").
    public bool SearchWithDots(string pattern) => Match(root, pattern, 0);
    private bool Match(Node n, string p, int i)
    {
        if (i == p.Length) return n.IsEnd;
        if (p[i] == '.')
        {
            foreach (var child in n.Next)
                if (child != null && Match(child, p, i + 1)) return true;
            return false;
        }
        var nx = n.Next[p[i] - 'a'];
        return nx != null && Match(nx, p, i + 1);
    }
}

var at = new ArrayTrie();
foreach (var w in new[] { "flower", "flow", "flight" }) at.Insert(w);
Console.WriteLine(at.LongestCommonPrefix());      // fl
Console.WriteLine(at.SearchWithDots("fl.w"));     // True
Console.WriteLine(at.SearchWithDots("f..."));     // True (flow)` },
    { lang: 'csharp', title: 'Binary trie: maximum XOR of two numbers in an array', code: `public class BinaryTrie
{
    private class Node { public Node?[] Next = new Node?[2]; }
    private readonly Node root = new();
    private const int BITS = 31;   // non-negative ints: bits 30..0 (bit 31 is the sign)

    public void Insert(int x)
    {
        var cur = root;
        for (int b = BITS - 1; b >= 0; b--)
        {
            int bit = (x >> b) & 1;
            cur.Next[bit] ??= new Node();
            cur = cur.Next[bit]!;
        }
    }

    // Greedy: at each bit prefer the opposite bit to make the XOR bit 1. O(31).
    public int MaxXorWith(int x)
    {
        var cur = root;
        int result = 0;
        for (int b = BITS - 1; b >= 0; b--)
        {
            int bit = (x >> b) & 1;
            int want = 1 - bit;
            if (cur.Next[want] != null) { result |= (1 << b); cur = cur.Next[want]!; }
            else cur = cur.Next[bit]!;
        }
        return result;
    }

    // Maximum XOR of any pair in the array. O(n * 31) instead of O(n^2).
    public static int MaxPairXor(int[] nums)
    {
        var trie = new BinaryTrie();
        foreach (var n in nums) trie.Insert(n);
        int best = 0;
        foreach (var n in nums) best = Math.Max(best, trie.MaxXorWith(n));
        return best;
    }
}

Console.WriteLine(BinaryTrie.MaxPairXor(new[] { 3, 10, 5, 25, 2, 8 }));   // 28 (5 XOR 25)` }
  ],
  pitfalls: [
    'Returning true from Search when the walk succeeds but IsEnd is false. "ca" is a prefix of "cat", not a stored word.',
    'Deleting a word by removing nodes on the way down. You will destroy longer words that share the prefix. Remove on the way back up, only when nothing else depends on the node.',
    'Using a 26-slot array for input that contains uppercase letters, digits or Unicode. Index out of range or wrong matches. Validate input or use a Dictionary.',
    'Storing the character inside the node and also as the dictionary key. Redundant and a source of mismatches.',
    'Building suggestions by DFS over a huge subtree on every keystroke. Cache top-k completions per node or limit the DFS.',
    'Forgetting that the binary trie for XOR must insert all numbers with the same fixed number of bits, most significant bit first.'
  ],
  quiz: [
    { q: 'A trie stores 1 million words. What is the cost of checking whether any word starts with a 4-letter prefix?', options: ['O(1,000,000)', 'O(log 1,000,000)', 'O(4)', 'O(4 × 1,000,000)'], answer: 2, why: 'You walk one edge per character of the prefix. The number of stored words does not matter.' },
    { q: 'Which flag makes the difference between Search("ca") and StartsWith("ca")?', options: ['PrefixCount', 'IsEnd on the final node', 'The number of children', 'The depth of the node'], answer: 1, why: 'Both walk the same path. Search also requires the last node to be marked as the end of a word.' },
    { q: 'When deleting "car" while "card" exists, which nodes should be removed?', options: ['All three nodes c, a, r', 'Only the r node', 'None; just unset IsEnd on the r node', 'The whole trie must be rebuilt'], answer: 2, why: 'The r node still has a child (d), so it must stay. Only the end-of-word flag changes.' },
    { q: 'Why does a trie with Node[26] arrays use a lot of memory?', options: ['Because each node stores a copy of its full word', 'Because every node reserves all 26 slots', 'Because tries cannot share prefixes', 'Because .NET arrays are slow'], answer: 1, why: 'Each node allocates all 26 slots regardless of use; sparse nodes waste most of them. Radix trees and dictionaries reduce this.' },
    { q: 'In the maximum-XOR binary trie, at each bit you prefer the child with which bit?', options: ['The same bit as the query', 'The opposite bit of the query', 'Always 1', 'Always 0'], answer: 1, why: 'XOR of different bits gives 1. Choosing the opposite bit at the highest possible position maximises the result greedily.' },
    { q: 'Which structure finds all occurrences of 10,000 patterns in one scan of a long text?', options: ['A hash set of patterns', 'A trie with failure links', 'A balanced BST of patterns', 'A binary trie over bits'], answer: 1, why: 'Aho–Corasick adds failure links to a pattern trie so the text is scanned once, in time proportional to text length plus matches.' }
  ],
  takeaways: [
    'A trie stores strings as paths; shared prefixes are stored once.',
    'Insert, search and startsWith all cost O(length of the string), independent of the number of words.',
    'IsEnd distinguishes a stored word from a prefix of one.',
    'Delete on the way back up, removing nodes only when they have no children and are not word ends.',
    'Autocomplete = walk to the prefix node, then DFS below it (cache top-k for real products).',
    'A binary trie over bits answers maximum XOR and longest IP prefix match in O(bits).',
    'For huge tries, use a radix tree, ternary search tree or FST to cut memory.'
  ],
  interview: [
    { q: 'Implement a trie with insert, search and startsWith. What are the complexities?', a: `<p>Each node holds a child map and an IsEnd flag. Insert walks or creates one node per character and marks the last as end. Search walks and checks IsEnd; startsWith walks only. All are O(L) time for a string of length L. Space is O(total characters inserted) worst case; shared prefixes reduce it.</p>` },
    { q: 'How do you design autocomplete for a search engine using a trie?', a: `<p>Store query strings in a trie keyed by characters. Each node caches the top-k completions below it (by popularity), updated offline or on writes. A keystroke walks the prefix and returns the cached list in O(prefix length + k). Shard the trie by first characters across servers, keep it in memory, and rebuild periodically from query logs.</p>` },
    { q: 'Find the maximum XOR of two numbers in an array in better than O(n²).', a: `<p>Insert every number into a binary trie over its 31 bits, most significant first. For each number, walk the trie preferring the opposite bit at every level to build the best partner. Each query is O(31), so the whole thing is O(31n). The answer for [3,10,5,25,2,8] is 28 (5 XOR 25).</p>` },
    { q: 'When would you not use a trie?', a: `<p>When you only need exact-match lookups (a hash map is faster and smaller), when the alphabet is huge and words share few prefixes (memory explodes), or when the data is static and small enough that a sorted array with binary search gives prefix ranges with far less memory.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-heaps — Heaps & Priority Queues                                  */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-heaps'] = {
  hook: `A hospital emergency room does not treat patients in arrival order. It always picks the most urgent one next. A heap is the data structure that makes "give me the most urgent" cost almost nothing.`,
  intro: `<p>A <span class="term">heap</span> is a tree with one simple promise: every parent is smaller than (or equal to) its children. That is a <span class="term">min-heap</span>; flip the rule and you get a <span class="term">max-heap</span>. The promise means the smallest item is always at the root. You can read it in O(1), remove it in O(log n), and add a new item in O(log n).</p>
<p>A heap does not keep everything sorted. It only guarantees who is on top. That is exactly why it is cheap. Sorting all n items costs O(n log n); a heap gives you the minimum repeatedly for O(log n) each, and you only pay for the items you actually take.</p>
<p>A <span class="term">priority queue</span> is the abstract idea ("take out the highest priority item next"). A heap is the usual way to build one. .NET ships <code>PriorityQueue&lt;TElement, TPriority&gt;</code> which is a heap inside (a 4-ary one, where each node has up to four children; the idea is the same as the binary heap you learn here). This lesson shows how it works, how to write one from scratch, and the handful of problem patterns (top-k, merge k lists, running median, scheduling) where a heap is the whole answer.</p>`,
  realLife: {
    title: 'The emergency room triage board',
    body: `<p>Patients arrive at an emergency room all day. A nurse gives each one a severity score. The doctor does not ask "who came first?" but "who is most severe right now?". Imagine a board where the most severe patient is always at the top, and when they are taken in, the board rearranges itself so the next most severe rises to the top. Adding a new patient does not require re-sorting the whole board; the new card just bubbles up until it sits under someone more severe.</p>
<p>That board is a heap. The "bubble up" is called sift-up and the "fill the hole at the top" is sift-down. Both touch only one path from top to bottom, which is why the cost is the height of the tree, about log n.</p>
<p><strong>Where companies use this:</strong> operating systems schedule threads with priority queues. Dijkstra's shortest path (Google Maps routing) pops the closest unvisited node from a heap. Many timer and job schedulers (for example Java's ScheduledThreadPoolExecutor) keep delayed jobs in a time-ordered heap. Load balancers pick the least-loaded server from a min-heap.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The heap property</h4>
<p>In a min-heap, for every node, <code>node &lt;= its children</code>. Nothing is said about left versus right, or about cousins. So a heap is much looser than a BST, and that looseness is what makes it fast to maintain.</p>
<h4>Shape: a complete binary tree</h4>
<p>Heaps are always <span class="term">complete</span>: every level is full except possibly the last, which is filled from left to right. A complete tree with n nodes has height floor(log2 n), so all operations are O(log n).</p>
<h4>The array trick</h4>
<p>Because the tree is complete, you do not need node objects. Store the levels one after another in an array. For the item at index i (0-based):</p>
<ul>
<li>left child = 2i + 1</li>
<li>right child = 2i + 2</li>
<li>parent = (i minus 1) / 2 (integer division)</li>
</ul>
<p>No pointers, great cache behaviour, and "last node" is simply the last element of the array.</p>
<h4>Insert: sift up</h4>
<p>Append the item at the end of the array. Compare it with its parent. If it is smaller, swap. Repeat until it is not smaller than its parent or it reaches the root. At most height swaps: O(log n).</p>
<h4>Remove min: sift down</h4>
<p>Save the root (the answer). Move the last element to the root. Now compare it with its two children; swap with the smaller child if that child is smaller than it. Repeat until the heap property holds. O(log n).</p>
<div class="callout tip">Peek is O(1): just read index 0. You never search a heap for an arbitrary item; that would be O(n). If you need "find by key", pair the heap with a dictionary.</div>
<h4>Using the built-in one</h4>
<p><code>var pq = new PriorityQueue&lt;string, int&gt;();</code> then <code>pq.Enqueue("task", 3)</code> and <code>pq.Dequeue()</code>. Lower priority value comes out first (min-heap). For a max-heap, enqueue with the negative priority or pass a reversed comparer.</p>` },
    { name: 'Intermediate', body: `<h4>Build a heap in O(n), not O(n log n)</h4>
<p>Inserting n items one by one costs n × log n. But if you already have all items in an array, you can do better: start from the last non-leaf (index n/2 minus 1) and sift down each node back to index 0. Most nodes are near the bottom and sift only a little. The total is bounded by a geometric series and comes out to O(n). This is the first step of heapsort and the reason <code>new PriorityQueue&lt;T,P&gt;(collection)</code> is cheap.</p>
<h4>Pattern 1: top k / kth largest</h4>
<p>To find the k largest of n items, keep a <strong>min-heap of size k</strong>. For each item, push it; if the heap exceeds k, pop the smallest. At the end the heap holds the k largest, and its root is the kth largest. O(n log k) time and O(k) memory, which beats sorting when k is small and the stream is huge.</p>
<h4>Pattern 2: merge k sorted lists</h4>
<p>Put the first element of each list in a min-heap along with which list it came from. Pop the smallest, append it to the output, and push the next element from that same list. Each of the N total elements is pushed and popped once: O(N log k). This is how database engines merge sorted runs on disk and how log aggregators merge timestamped streams.</p>
<h4>Pattern 3: top k frequent elements</h4>
<p>Count with a dictionary, then run the "min-heap of size k" trick over the (item, count) pairs ordered by count. O(n log k).</p>
<h4>Pattern 4: running median with two heaps</h4>
<p>Keep a max-heap of the lower half and a min-heap of the upper half. Insert into the correct half, then rebalance so sizes differ by at most one. The median is the root of the larger heap, or the average of both roots if equal sizes. Every insert is O(log n) and the median is O(1). This is the standard "median from a data stream" answer.</p>
<h4>Heapsort</h4>
<p>Build a max-heap in place, then repeatedly swap the root with the last element, shrink the heap by one, and sift the new root down. O(n log n), O(1) extra space, not stable. In practice quicksort or .NET's introsort is faster because of cache behaviour, but heapsort has a guaranteed worst case and is used as the fallback inside introsort.</p>
<div class="callout warn">PriorityQueue in .NET has no DecreaseKey, and its Remove method (added in .NET 9) is a slow O(n) scan. For Dijkstra, just push a new entry with the better distance and skip stale entries when you pop them ("lazy deletion").</div>` },
    { name: 'Expert', body: `<h4>Why no DecreaseKey, and what to do instead</h4>
<p>A binary heap can support decrease-key in O(log n) if it keeps an index map from item to array position, updated on every swap. The .NET and Java standard heaps leave this out for simplicity. The common workaround, lazy deletion, pushes a fresh entry and ignores outdated entries on pop. It costs extra heap entries (up to the number of edges in Dijkstra) but keeps the code simple, and in practice it is often faster than a heap with index maintenance because of fewer cache misses.</p>
<h4>d-ary heaps and cache lines</h4>
<p>A 4-ary heap (each node has 4 children) is shallower: height is log4 n instead of log2 n. Sift-up does fewer steps; sift-down compares more children per step but they sit in one cache line. For workloads dominated by inserts and decrease-keys (Dijkstra on dense graphs), 4-ary or 8-ary heaps beat binary heaps measurably.</p>
<h4>Other heap families</h4>
<ul>
<li><strong>Binomial and Fibonacci heaps</strong>: support merging two heaps in O(log n) or O(1) and give Dijkstra a theoretical O(E + V log V). Rarely used in practice because the constants are high and the code is complex.</li>
<li><strong>Pairing heap</strong>: simple, fast in practice, good amortised bounds; used in some C++ and OCaml libraries.</li>
<li><strong>Leftist and skew heaps</strong>: persistent-friendly, used in functional languages.</li>
<li><strong>Timer wheels</strong>: not a heap at all, but the usual replacement when you have millions of timers with coarse resolution (Kafka and Netty use them).</li>
</ul>
<h4>Heaps in real systems</h4>
<p>The .NET garbage collector is unrelated (the "managed heap" is a memory region, a naming clash worth pointing out in interviews). Real uses: the OS scheduler keeps runnable threads in priority queues; event simulators keep the next event at the root; Huffman coding merges the two least frequent symbols repeatedly; A* search keeps frontier nodes ordered by estimated total cost; the Kubernetes scheduler keeps pending pods in a priority heap; and rate-limited job queues pop the earliest "ready at" timestamp.</p>
<h4>Stability and ties</h4>
<p>Heaps are not stable: two items with equal priority can come out in any order. If first-in-first-out among equals matters (fair scheduling), add an increasing sequence number to the priority as a tiebreaker: priority (3, seq 17) before (3, seq 18).</p>
<h4>Interview angle</h4>
<p>Say "heap" the moment you hear: kth largest, top k, closest k points, merge k sorted, running median, schedule by deadline, smallest range covering k lists, or "repeatedly take the min/max". State the complexity O(n log k) and why it beats full sorting. Then mention that if k is close to n, sorting is simpler, and if only one min is needed, a linear scan wins.</p>` }
  ],
  flow: {
    title: 'Remove-min from a binary heap (sift down)',
    steps: [
      { title: 'Read the root', desc: 'Index 0 holds the minimum. Save it; this is the value we will return.' },
      { title: 'Move the last item to the root', desc: 'Take the last element of the array, put it at index 0, and shrink the array by one. The shape is still complete.' },
      { title: 'Find the smaller child', desc: 'For index i, look at 2i+1 and 2i+2. Pick whichever is smaller and exists.' },
      { title: 'Compare and swap', desc: 'If that child is smaller than the current item, swap them and continue from the child\'s index.' },
      { title: 'Stop when in place', desc: 'If no child is smaller, or there are no children, the heap property holds again.' },
      { title: 'Return the saved minimum', desc: 'Total work was one path from root to leaf: O(log n).' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Binary min-heap from scratch (array based) + O(n) heapify + heapsort', code: `public class MinHeap<T> where T : IComparable<T>
{
    private readonly List<T> a = new();
    public int Count => a.Count;

    public MinHeap() { }

    // Build from an existing collection in O(n): sift down from the last parent to the root.
    public MinHeap(IEnumerable<T> items)
    {
        a.AddRange(items);
        for (int i = a.Count / 2 - 1; i >= 0; i--) SiftDown(i);
    }

    public T Peek() => a.Count > 0 ? a[0] : throw new InvalidOperationException("empty");

    public void Push(T x)                  // O(log n)
    {
        a.Add(x);
        SiftUp(a.Count - 1);
    }

    public T Pop()                         // O(log n)
    {
        if (a.Count == 0) throw new InvalidOperationException("empty");
        T top = a[0];
        T last = a[^1];
        a.RemoveAt(a.Count - 1);
        if (a.Count > 0) { a[0] = last; SiftDown(0); }
        return top;
    }

    private void SiftUp(int i)
    {
        while (i > 0)
        {
            int parent = (i - 1) / 2;
            if (a[i].CompareTo(a[parent]) >= 0) break;
            (a[i], a[parent]) = (a[parent], a[i]);
            i = parent;
        }
    }

    private void SiftDown(int i)
    {
        int n = a.Count;
        while (true)
        {
            int l = 2 * i + 1, r = 2 * i + 2, smallest = i;
            if (l < n && a[l].CompareTo(a[smallest]) < 0) smallest = l;
            if (r < n && a[r].CompareTo(a[smallest]) < 0) smallest = r;
            if (smallest == i) break;
            (a[i], a[smallest]) = (a[smallest], a[i]);
            i = smallest;
        }
    }
}

public static class HeapSort
{
    // In-place, O(n log n), O(1) extra space, not stable. Uses a max-heap.
    public static void Sort(int[] a)
    {
        int n = a.Length;
        for (int i = n / 2 - 1; i >= 0; i--) SiftDown(a, i, n);
        for (int end = n - 1; end > 0; end--)
        {
            (a[0], a[end]) = (a[end], a[0]);   // move current max to its final place
            SiftDown(a, 0, end);
        }
    }
    private static void SiftDown(int[] a, int i, int n)
    {
        while (true)
        {
            int l = 2 * i + 1, r = l + 1, big = i;
            if (l < n && a[l] > a[big]) big = l;
            if (r < n && a[r] > a[big]) big = r;
            if (big == i) return;
            (a[i], a[big]) = (a[big], a[i]);
            i = big;
        }
    }
}

var h = new MinHeap<int>(new[] { 9, 4, 7, 1, 8, 2 });
h.Push(0);
Console.WriteLine(h.Pop() + " " + h.Pop() + " " + h.Pop());   // 0 1 2
var arr = new[] { 5, 3, 8, 1, 9, 2 };
HeapSort.Sort(arr);
Console.WriteLine(string.Join(",", arr));                      // 1,2,3,5,8,9` },
    { lang: 'csharp', title: '.NET PriorityQueue: top-k, kth largest, merge k sorted lists, top-k frequent', code: `public static class HeapPatterns
{
    // Kth largest with a min-heap of size k. O(n log k), O(k) memory.
    public static int KthLargest(int[] nums, int k)
    {
        var pq = new PriorityQueue<int, int>();          // min-heap by priority
        foreach (var x in nums)
        {
            pq.Enqueue(x, x);
            if (pq.Count > k) pq.Dequeue();              // drop the smallest
        }
        return pq.Peek();
    }

    // Merge k sorted arrays. O(N log k) where N = total elements.
    public static List<int> MergeK(List<int[]> lists)
    {
        var result = new List<int>();
        // element = (listIndex, position), priority = value
        var pq = new PriorityQueue<(int li, int pos), int>();
        for (int i = 0; i < lists.Count; i++)
            if (lists[i].Length > 0) pq.Enqueue((i, 0), lists[i][0]);

        while (pq.Count > 0)
        {
            var (li, pos) = pq.Dequeue();
            result.Add(lists[li][pos]);
            if (pos + 1 < lists[li].Length)
                pq.Enqueue((li, pos + 1), lists[li][pos + 1]);
        }
        return result;
    }

    // Top k frequent. Count, then min-heap of size k keyed by count. O(n log k).
    public static List<int> TopKFrequent(int[] nums, int k)
    {
        var count = new Dictionary<int, int>();
        foreach (var x in nums) count[x] = count.GetValueOrDefault(x) + 1;

        var pq = new PriorityQueue<int, int>();
        foreach (var (val, c) in count)
        {
            pq.Enqueue(val, c);
            if (pq.Count > k) pq.Dequeue();
        }
        var res = new List<int>();
        while (pq.Count > 0) res.Add(pq.Dequeue());
        res.Reverse();                                   // most frequent first
        return res;
    }

    // Max-heap in .NET: reverse the comparer.
    public static PriorityQueue<T, int> MaxHeap<T>() =>
        new(Comparer<int>.Create((x, y) => y.CompareTo(x)));
}

Console.WriteLine(HeapPatterns.KthLargest(new[] { 3, 2, 1, 5, 6, 4 }, 2));       // 5
var merged = HeapPatterns.MergeK(new List<int[]> { new[] { 1, 4, 7 }, new[] { 2, 5 }, new[] { 3, 6, 8 } });
Console.WriteLine(string.Join(",", merged));                                       // 1,2,3,4,5,6,7,8
Console.WriteLine(string.Join(",", HeapPatterns.TopKFrequent(new[] { 1, 1, 1, 2, 2, 3 }, 2))); // 1,2
var mx = HeapPatterns.MaxHeap<string>();
mx.Enqueue("low", 1); mx.Enqueue("high", 9);
Console.WriteLine(mx.Dequeue());                                                   // high` },
    { lang: 'csharp', title: 'Running median with two heaps, and a task scheduler by deadline', code: `public class MedianFinder
{
    // lower half: max-heap (reversed comparer). upper half: min-heap.
    private readonly PriorityQueue<int, int> lower = new(Comparer<int>.Create((a, b) => b.CompareTo(a)));
    private readonly PriorityQueue<int, int> upper = new();

    public void Add(int x)                                     // O(log n)
    {
        if (lower.Count == 0 || x <= lower.Peek()) lower.Enqueue(x, x);
        else upper.Enqueue(x, x);

        // rebalance so that lower has the same count or one more
        if (lower.Count > upper.Count + 1) { var v = lower.Dequeue(); upper.Enqueue(v, v); }
        else if (upper.Count > lower.Count) { var v = upper.Dequeue(); lower.Enqueue(v, v); }
    }

    public double Median()                                     // O(1)
    {
        if (lower.Count == 0) throw new InvalidOperationException("no data");
        if (lower.Count == upper.Count) return (lower.Peek() + upper.Peek()) / 2.0;
        return lower.Peek();
    }
}

// Scheduling: always run the job with the earliest deadline (EDF), with FIFO among ties.
public record Job(string Name, DateTime Deadline);

public class DeadlineScheduler
{
    private long seq = 0;
    private readonly PriorityQueue<Job, (DateTime, long)> pq = new();

    public void Submit(Job j) => pq.Enqueue(j, (j.Deadline, seq++));   // tuple compares field by field
    public Job? Next() => pq.Count > 0 ? pq.Dequeue() : null;
}

var mf = new MedianFinder();
foreach (var x in new[] { 5, 15, 1, 3 }) mf.Add(x);
Console.WriteLine(mf.Median());           // 4  (3 and 5)
mf.Add(8);
Console.WriteLine(mf.Median());           // 5

var sch = new DeadlineScheduler();
var now = DateTime.UtcNow;
sch.Submit(new Job("report", now.AddHours(3)));
sch.Submit(new Job("backup", now.AddHours(1)));
sch.Submit(new Job("email", now.AddHours(1)));
Console.WriteLine(sch.Next()!.Name);      // backup (earlier submitted among equal deadlines)` }
  ],
  pitfalls: [
    'Thinking a heap is sorted. Only the root is guaranteed. Iterating the underlying array gives no useful order.',
    'Using a max-heap for "k largest". You want a min-heap of size k so the smallest of the top k is cheap to evict.',
    'Building a heap by n inserts when you have all data up front. Use the O(n) heapify constructor instead.',
    'Expecting PriorityQueue to update or remove an arbitrary item quickly. It has no DecreaseKey, and Remove (.NET 9 and later) scans in O(n). Use lazy deletion (push a new entry, skip stale ones on pop).',
    'Off-by-one in the parent/child index formulas when switching between 0-based and 1-based arrays.',
    'Assuming equal-priority items come out in insertion order. Add a sequence number to the priority if order matters.'
  ],
  quiz: [
    { q: 'In a 0-based array heap, where are the children of the item at index 5?', options: ['10 and 11', '11 and 12', '9 and 10', '4 and 6'], answer: 1, why: 'Left child = 2i + 1 = 11, right child = 2i + 2 = 12.' },
    { q: 'What is the time complexity of building a heap from n items using the bottom-up sift-down method?', options: ['O(n log n)', 'O(n)', 'O(log n)', 'O(n squared)'], answer: 1, why: 'Most nodes are near the leaves and sift down only a few levels; the total forms a geometric series that sums to O(n).' },
    { q: 'To find the 10 largest numbers in a stream of 10 million, which heap do you keep?', options: ['A max-heap of all 10 million', 'A min-heap of size 10', 'A max-heap of size 10', 'Two heaps of size 5'], answer: 1, why: 'A min-heap of size 10 keeps the 10 largest seen so far, and its root is the smallest of them, which is exactly the one to evict when a larger number arrives.' },
    { q: 'What does the root of a min-heap guarantee?', options: ['It is the smallest item', 'The left subtree is smaller than the right subtree', 'All items are sorted', 'It is the most recently added item'], answer: 0, why: 'The heap property says every parent is no larger than its children, so the root is the minimum. Nothing is promised about left versus right.' },
    { q: 'Merging k sorted lists with a total of N elements using a heap costs:', options: ['O(N)', 'O(N log N)', 'O(N log k)', 'O(k log N)'], answer: 2, why: 'Each of the N elements is pushed and popped once from a heap that holds at most k entries.' },
    { q: 'How does the two-heap median trick keep the median available in O(1)?', options: ['It sorts both heaps after every insert', 'The median is always at one or both roots', 'It stores the median in a separate variable', 'It uses a BST instead'], answer: 1, why: 'With sizes balanced to differ by at most one, the median is the root of the bigger heap or the average of the two roots.' }
  ],
  takeaways: [
    'Heap property: parent ≤ children (min-heap). Only the root is guaranteed to be the extreme.',
    'Stored in an array: children at 2i+1 and 2i+2, parent at (i-1)/2.',
    'Push = append + sift up; pop = move last to root + sift down. Both O(log n). Peek O(1).',
    'Build from a collection in O(n) with bottom-up sift-down.',
    'Top k: min-heap of size k, O(n log k). Merge k sorted: heap of k heads, O(N log k).',
    'Running median: a max-heap for the lower half, a min-heap for the upper half.',
    '.NET PriorityQueue is a min-heap by priority; reverse the comparer for max, use lazy deletion instead of decrease-key.'
  ],
  interview: [
    { q: 'What is the difference between a heap and a BST?', a: `<p>A heap only orders parent against children (root is the min or max), is always a complete tree stored in an array, and gives O(1) peek, O(log n) insert and remove-top. A BST orders left &lt; node &lt; right for every node, supports search, floor, ceiling and sorted iteration in O(h), but needs balancing to guarantee O(log n). Use a heap when you only need repeated access to the extreme; use a BST when you need arbitrary ordered queries.</p>` },
    { q: 'Find the k closest points to the origin from a huge list.', a: `<p>Keep a max-heap of size k keyed by squared distance (avoid the square root). For each point push it and pop if the size exceeds k; the heap always holds the k closest so far. O(n log k) time, O(k) memory. If k is close to n, sorting all points is simpler; if the data fits in memory, Quickselect gives expected O(n).</p>` },
    { q: 'How does Dijkstra use a heap, and how do you handle updated distances in .NET?', a: `<p>The heap holds (node, tentative distance). Pop the smallest; if its stored distance is larger than the best known distance for that node, skip it (stale entry). Otherwise relax its edges and push improved (neighbor, newDistance) pairs. This lazy approach works with PriorityQueue because it never needs decrease-key. Complexity O((V + E) log V).</p>` },
    { q: 'Design a system that returns the median of the last N stock prices in real time.', a: `<p>Two heaps for the median plus a queue of the last N prices and a way to delete expired prices. Since heaps do not support arbitrary delete, use lazy deletion: keep a dictionary of "to be removed" counts and purge expired roots when they surface. Each insert and expiry is O(log N) amortised, median is O(1).</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-greedy — Greedy Algorithms                                       */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-greedy'] = {
  hook: `Give change for 87 cents: you grab the biggest coin that fits, again and again, and you are done. That "take the best thing right now" instinct is a greedy algorithm. Sometimes it is perfect. Sometimes it is a trap. Learning to tell the difference is the whole skill.`,
  intro: `<p>A <span class="term">greedy algorithm</span> builds a solution step by step, and at each step takes the choice that looks best at that moment, without looking ahead and without going back. It never undoes a decision.</p>
<p>That makes greedy code short and fast, usually a sort followed by one pass. The catch is that "best right now" is not always "best overall". For coins of 1, 5 and 10, greedy change-making is optimal. For coins of 1, 3 and 4, making 6 greedily gives 4 + 1 + 1 (three coins) while the real best is 3 + 3 (two coins). Same algorithm, wrong answer.</p>
<p>So this lesson has two halves. First, the classic problems where greedy is provably correct: activity selection, fractional knapsack, job sequencing, Huffman coding, minimum platforms, jump game, gas station. Second, the way to argue that greedy works (the <span class="term">exchange argument</span>) and the signals that tell you to switch to dynamic programming instead.</p>`,
  realLife: {
    title: 'The conference room that hosts the most meetings',
    body: `<p>You manage one meeting room. Ten teams send requests with start and end times, and you want to fit as many meetings as possible. A natural idea is to accept the meeting that starts earliest. But a meeting from 9:00 to 17:00 would block the whole day. Another idea is to accept the shortest meeting first. That also fails: a 30-minute meeting in the middle can block two 2-hour meetings on either side.</p>
<p>The rule that always works is: accept the meeting that <strong>ends earliest</strong>, then throw away everything that overlaps with it, and repeat. Ending early leaves the most room for what comes next. This is activity selection, and the proof is a swap: if any optimal schedule picked a different first meeting, you could replace it with the earliest-ending one without losing anything.</p>
<p><strong>Where companies use this:</strong> Google Calendar's room booking, airline gate assignment, CPU scheduling (shortest job first), Huffman coding inside ZIP, JPEG and MP3 compression, Dijkstra and Prim's algorithms in network routing, and cloud auto-scalers that greedily pack containers onto the fewest machines.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>What greedy means in code</h4>
<p>Most greedy solutions look like this: sort the input by some key, then loop once, keeping a choice whenever it does not break the rules. The art is in choosing the key. Sort by end time? By ratio of value to weight? By deadline? Picking the right key is the whole problem.</p>
<h4>Activity selection</h4>
<p>Given meetings with start and end times, pick the maximum number that do not overlap. Sort by end time. Keep a variable <code>lastEnd</code>. For each meeting, if it starts at or after <code>lastEnd</code>, take it and update <code>lastEnd</code>. O(n log n) for the sort, O(n) for the pass.</p>
<h4>Fractional knapsack</h4>
<p>A thief has a bag that holds 50 kg and finds items with weights and values. Items can be cut (think gold dust, not TVs). Sort by value per kg, highest first. Take whole items while they fit, then take a fraction of the next one to fill the bag. Greedy is optimal here. If items cannot be cut (0/1 knapsack), greedy fails and you need DP.</p>
<h4>Coin change, the famous trap</h4>
<p>With coins 1, 2, 5, 10, 20, 50, 100 (Indian or Euro style), greedy gives the fewest coins. With arbitrary coins such as 1, 3, 4, greedy can be wrong. The rule: greedy works for "canonical" coin systems. If the problem gives you strange coins, use DP.</p>
<div class="callout idea">Before you trust greedy, try to break it. Spend two minutes inventing a small input where "best now" is not "best overall". If you cannot, greedy is probably right, and you can then try to prove it.</div>
<h4>Two properties a greedy problem needs</h4>
<ul>
<li><strong>Greedy choice property</strong>: a locally best choice can be part of some globally best solution.</li>
<li><strong>Optimal substructure</strong>: after making that choice, what remains is the same kind of problem, smaller.</li>
</ul>
<p>DP needs the second property too. The difference is the first: DP tries all choices, greedy commits to one.</p>` },
    { name: 'Intermediate', body: `<h4>The exchange argument</h4>
<p>This is how you prove greedy works. Suppose there is an optimal solution that differs from the greedy one. Find the first place they differ. Show that you can swap the optimal solution's choice with the greedy choice without making the solution worse. Repeat until the optimal solution becomes the greedy one. Since it never got worse, the greedy solution is optimal too. In interviews, a one-sentence version is enough: "If the optimal answer skipped the earliest-ending meeting, swapping it in cannot cause overlaps and keeps the count the same."</p>
<h4>Job sequencing with deadlines</h4>
<p>Each job takes one unit of time, has a deadline and a profit. Sort by profit, highest first. For each job, put it in the latest free slot on or before its deadline. A simple version scans slots backward (O(n × maxDeadline)); the fast version uses union-find to find the latest free slot in near O(1). Greedy by profit works because a high-profit job never needs to give way to a lower one.</p>
<h4>Minimum platforms</h4>
<p>Given train arrival and departure times, how many platforms does the station need? Sort arrivals and departures separately. Walk both with two pointers: an arrival before the next departure needs one more platform; a departure frees one. Track the maximum. This is the same as "maximum overlapping intervals" and "meeting rooms II".</p>
<h4>Huffman coding</h4>
<p>To compress text, give short bit codes to frequent characters and long codes to rare ones. Put every character with its frequency in a min-heap. Repeatedly pop the two smallest, merge them into a node whose frequency is their sum, and push it back. The final tree gives each character a code: left is 0, right is 1. Greedy merging of the two rarest symbols is provably optimal for prefix codes. This is inside ZIP, PNG, JPEG and MP3.</p>
<h4>Jump game and gas station</h4>
<p><strong>Jump game</strong>: from index i you can jump up to nums[i] steps. Can you reach the end? Track the farthest index reachable so far; if you ever stand past it, you are stuck. O(n). For the minimum number of jumps, treat each jump as covering a range and count ranges (a BFS in disguise).</p>
<p><strong>Gas station</strong>: stations in a circle with gas[i] and cost[i] to the next one. If total gas is at least total cost, a solution exists. Start at 0 with an empty tank; whenever the tank goes negative, the answer cannot be any station in that stretch, so restart from the next station. One pass, O(n).</p>
<div class="callout tip">Many greedy problems are interval problems in disguise. When you see start/end pairs, think: sort by end (max count), sort by start (merge), or sweep line with +1/-1 events (max overlap).</div>` },
    { name: 'Expert', body: `<h4>Greedy versus DP: a decision procedure</h4>
<table><thead><tr><th>Signal</th><th>Lean toward</th></tr></thead><tbody>
<tr><td>A counterexample exists for every obvious sort key</td><td>DP</td></tr>
<tr><td>Items are indivisible and capacity matters (0/1 knapsack, subset sum)</td><td>DP</td></tr>
<tr><td>Choices can be ordered so that a local best never blocks a global best (intervals by end, ratio by value/weight)</td><td>Greedy</td></tr>
<tr><td>The problem is a matroid (independence is preserved by subsets and exchange)</td><td>Greedy is provably optimal</td></tr>
<tr><td>You need the count of solutions or the full set, not one optimum</td><td>DP or enumeration</td></tr>
</tbody></table>
<h4>Matroids: the theory behind "sort and take"</h4>
<p>A <span class="term">matroid</span> is a set system with two properties: any subset of an independent set is independent, and if one independent set is bigger than another, some element of the bigger one can be added to the smaller one. For any matroid with weights, the greedy algorithm (sort by weight, add if still independent) is optimal. Spanning trees of a graph form a matroid, which is why Kruskal's algorithm works. Job scheduling with unit times and deadlines is also a matroid. When you can see the matroid, you do not need a separate proof.</p>
<h4>Greedy inside graph algorithms</h4>
<p>Dijkstra greedily finalises the closest unvisited node; it fails with negative edges because "closest now" can be beaten later. Prim's and Kruskal's build minimum spanning trees by greedily taking the cheapest safe edge (cut property). Interval scheduling with weights is NOT greedy: it needs DP with binary search over sorted end times. Knowing which classic is greedy and which is DP is a common interview filter.</p>
<h4>Approximation: when greedy is "good enough"</h4>
<p>For NP-hard problems, greedy often gives a guaranteed approximation. Greedy set cover is within a factor of ln n of optimal. First-fit-decreasing bin packing uses at most about 11/9 of the optimal number of bins plus a constant. Greedy for maximising a submodular function (like picking k sensors to cover the most area, or k documents to maximise diversity) is within 1 minus 1/e of optimal. These bounds are why greedy heuristics are everywhere in cloud scheduling, ad placement and recommendation systems.</p>
<h4>Performance notes</h4>
<p>Greedy solutions are usually O(n log n) because of a sort, with O(1) or O(n) extra space. When the input is already sorted or can be bucketed (times in a day, small integer weights), counting sort brings it down to O(n). Huffman and similar heap-based greedy runs are O(n log n) and dominated by heap operations; for a fixed small alphabet (256 symbols) that is effectively constant.</p>
<h4>Interview angle</h4>
<p>Interviewers want to hear three things: your sort key and why; a one-line exchange argument or a counterexample that pushes you to DP; and the complexity. A strong candidate says "I will try greedy by end time; here is why it cannot be beaten; if the intervals had weights I would switch to DP with binary search."</p>` }
  ],
  flow: {
    title: 'Activity selection: pick the most non-overlapping meetings',
    steps: [
      { title: 'Sort by end time', desc: 'Order all meetings by when they finish. The earliest-ending meeting leaves the most room for others.' },
      { title: 'Take the first', desc: 'Accept the meeting that ends first. Set lastEnd to its end time.' },
      { title: 'Look at the next meeting', desc: 'Compare its start time with lastEnd.' },
      { title: 'Overlap? Skip it', desc: 'If it starts before lastEnd, it clashes with something already accepted. Throw it away for good.' },
      { title: 'No overlap? Accept it', desc: 'If it starts at or after lastEnd, accept it and move lastEnd to its end time.' },
      { title: 'Repeat to the end', desc: 'One pass over the sorted list. Total O(n log n) for the sort plus O(n) for the scan.' },
      { title: 'Why it is optimal', desc: 'Exchange argument: any optimal schedule can swap its first meeting for the earliest-ending one without creating a clash.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Activity selection, minimum platforms, merge intervals', code: `public record Interval(int Start, int End);

public static class Intervals
{
    // Maximum number of non-overlapping intervals. Sort by end. O(n log n).
    public static List<Interval> MaxNonOverlapping(List<Interval> items)
    {
        var sorted = items.OrderBy(i => i.End).ToList();
        var chosen = new List<Interval>();
        int lastEnd = int.MinValue;
        foreach (var it in sorted)
        {
            if (it.Start >= lastEnd)
            {
                chosen.Add(it);
                lastEnd = it.End;
            }
        }
        return chosen;
    }

    // Minimum platforms / meeting rooms II: max number of intervals alive at once.
    // Sort arrivals and departures separately, sweep with two pointers. O(n log n).
    public static int MinPlatforms(int[] arrivals, int[] departures)
    {
        Array.Sort(arrivals);
        Array.Sort(departures);
        int i = 0, j = 0, inUse = 0, best = 0;
        while (i < arrivals.Length)
        {
            if (arrivals[i] < departures[j]) { inUse++; best = Math.Max(best, inUse); i++; }
            else { inUse--; j++; }
        }
        return best;
    }

    // Merge overlapping intervals. Sort by start. O(n log n).
    public static List<Interval> Merge(List<Interval> items)
    {
        var sorted = items.OrderBy(i => i.Start).ToList();
        var result = new List<Interval>();
        foreach (var it in sorted)
        {
            if (result.Count > 0 && it.Start <= result[^1].End)
                result[^1] = result[^1] with { End = Math.Max(result[^1].End, it.End) };
            else
                result.Add(it);
        }
        return result;
    }
}

var meetings = new List<Interval> { new(1, 4), new(3, 5), new(0, 6), new(5, 7), new(3, 9), new(5, 9), new(6, 10), new(8, 11) };
Console.WriteLine(Intervals.MaxNonOverlapping(meetings).Count);               // 3  (1-4, 5-7, 8-11)
Console.WriteLine(Intervals.MinPlatforms(new[] { 900, 940, 950, 1100, 1500, 1800 },
                                         new[] { 910, 1200, 1120, 1130, 1900, 2000 }));   // 3
var merged = Intervals.Merge(new List<Interval> { new(1, 3), new(2, 6), new(8, 10), new(9, 12) });
Console.WriteLine(string.Join(" ", merged.Select(m => m.Start + "-" + m.End)));  // 1-6 8-12` },
    { lang: 'csharp', title: 'Fractional knapsack and job sequencing with deadlines', code: `public record Item(string Name, double Weight, double Value);

public static class Knapsack
{
    // Items can be split. Sort by value per unit weight. O(n log n). Greedy is optimal.
    public static double Fractional(List<Item> items, double capacity)
    {
        double total = 0, left = capacity;
        foreach (var it in items.OrderByDescending(i => i.Value / i.Weight))
        {
            if (left <= 0) break;
            double take = Math.Min(it.Weight, left);
            total += take * (it.Value / it.Weight);
            left -= take;
        }
        return total;
    }
}

public record Job(string Id, int Deadline, int Profit);

public static class JobSequencing
{
    // Each job takes 1 time unit. Maximise profit. Sort by profit desc,
    // place each job in the latest free slot <= its deadline.
    // Union-find makes "latest free slot" nearly O(1). Overall O(n log n).
    public static (int profit, List<string> order) Schedule(List<Job> jobs)
    {
        int maxDeadline = jobs.Max(j => j.Deadline);
        var parent = Enumerable.Range(0, maxDeadline + 1).ToArray();   // slot t points to latest free slot <= t
        int Find(int t) => parent[t] == t ? t : parent[t] = Find(parent[t]);

        var slots = new string?[maxDeadline + 1];
        int profit = 0;
        foreach (var j in jobs.OrderByDescending(j => j.Profit))
        {
            int free = Find(Math.Min(j.Deadline, maxDeadline));
            if (free == 0) continue;                 // no slot available
            slots[free] = j.Id;
            profit += j.Profit;
            parent[free] = free - 1;                 // slot used: point to the previous one
        }
        var order = slots.Where(s => s != null).Select(s => s!).ToList();
        return (profit, order);
    }
}

var items = new List<Item> { new("gold dust", 10, 60), new("silver", 20, 100), new("copper", 30, 120) };
Console.WriteLine(Knapsack.Fractional(items, 50));      // 240  (all gold, all silver, 2/3 copper)

var jobs = new List<Job> { new("a", 2, 100), new("b", 1, 19), new("c", 2, 27), new("d", 1, 25), new("e", 3, 15) };
var (p, order) = JobSequencing.Schedule(jobs);
Console.WriteLine(p + " " + string.Join(",", order));   // 142 c,a,e` },
    { lang: 'csharp', title: 'Huffman coding with a priority queue', code: `using System.Text;

public class HuffNode
{
    public char? Ch;            // null for internal nodes
    public int Freq;
    public HuffNode? Left, Right;
}

public static class Huffman
{
    // Build the tree: repeatedly merge the two least frequent nodes. O(k log k) for k symbols.
    public static HuffNode Build(string text)
    {
        var freq = new Dictionary<char, int>();
        foreach (var c in text) freq[c] = freq.GetValueOrDefault(c) + 1;

        var pq = new PriorityQueue<HuffNode, (int freq, int seq)>();   // seq breaks ties deterministically
        int seq = 0;
        foreach (var (c, f) in freq) pq.Enqueue(new HuffNode { Ch = c, Freq = f }, (f, seq++));

        if (pq.Count == 1)                                             // single symbol edge case
        {
            var only = pq.Dequeue();
            return new HuffNode { Freq = only.Freq, Left = only };
        }
        while (pq.Count > 1)
        {
            var a = pq.Dequeue();
            var b = pq.Dequeue();
            var merged = new HuffNode { Freq = a.Freq + b.Freq, Left = a, Right = b };
            pq.Enqueue(merged, (merged.Freq, seq++));
        }
        return pq.Dequeue();
    }

    // Walk the tree: left = 0, right = 1. Leaves get their code.
    public static Dictionary<char, string> Codes(HuffNode root)
    {
        var codes = new Dictionary<char, string>();
        void Walk(HuffNode n, string prefix)
        {
            if (n.Ch is char c) { codes[c] = prefix.Length == 0 ? "0" : prefix; return; }
            if (n.Left != null) Walk(n.Left, prefix + "0");
            if (n.Right != null) Walk(n.Right, prefix + "1");
        }
        Walk(root, "");
        return codes;
    }

    public static string Encode(string text, Dictionary<char, string> codes)
    {
        var sb = new StringBuilder();
        foreach (var c in text) sb.Append(codes[c]);
        return sb.ToString();
    }

    public static string Decode(string bits, HuffNode root)
    {
        var sb = new StringBuilder();
        var cur = root;
        foreach (var b in bits)
        {
            cur = b == '0' ? cur.Left! : cur.Right!;
            if (cur.Ch is char c) { sb.Append(c); cur = root; }
        }
        return sb.ToString();
    }
}

var text = "abracadabra";
var tree = Huffman.Build(text);
var codes = Huffman.Codes(tree);
var bits = Huffman.Encode(text, codes);
Console.WriteLine(bits.Length + " bits vs " + text.Length * 8 + " bits in ASCII");   // 23 vs 88
Console.WriteLine(Huffman.Decode(bits, tree));                                        // abracadabra` },
    { lang: 'csharp', title: 'Jump game (reach + min jumps) and gas station', code: `public static class GreedyClassics
{
    // Can you reach the last index? Track the farthest reachable index. O(n).
    public static bool CanJump(int[] nums)
    {
        int farthest = 0;
        for (int i = 0; i < nums.Length; i++)
        {
            if (i > farthest) return false;          // stuck before reaching i
            farthest = Math.Max(farthest, i + nums[i]);
        }
        return true;
    }

    // Minimum jumps: each jump covers a "range"; count how many ranges to reach the end. O(n).
    public static int MinJumps(int[] nums)
    {
        int jumps = 0, currentEnd = 0, farthest = 0;
        for (int i = 0; i < nums.Length - 1; i++)
        {
            farthest = Math.Max(farthest, i + nums[i]);
            if (i == currentEnd)                     // must jump now
            {
                jumps++;
                currentEnd = farthest;
                if (currentEnd >= nums.Length - 1) break;
            }
        }
        return jumps;
    }

    // Gas station: index to start from to complete the circle, or -1. O(n).
    public static int GasStation(int[] gas, int[] cost)
    {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.Length; i++)
        {
            int diff = gas[i] - cost[i];
            total += diff;
            tank += diff;
            if (tank < 0)                           // cannot reach i+1 from start; restart after i
            {
                start = i + 1;
                tank = 0;
            }
        }
        return total >= 0 ? start : -1;
    }

    // Coin change greedy: correct ONLY for canonical coin systems.
    public static List<int> GreedyChange(int amount, int[] coinsDesc)
    {
        var used = new List<int>();
        foreach (var c in coinsDesc)
            while (amount >= c) { amount -= c; used.Add(c); }
        return used;
    }
}

Console.WriteLine(GreedyClassics.CanJump(new[] { 2, 3, 1, 1, 4 }));      // True
Console.WriteLine(GreedyClassics.CanJump(new[] { 3, 2, 1, 0, 4 }));      // False
Console.WriteLine(GreedyClassics.MinJumps(new[] { 2, 3, 1, 1, 4 }));     // 2
Console.WriteLine(GreedyClassics.GasStation(new[] { 1, 2, 3, 4, 5 }, new[] { 3, 4, 5, 1, 2 }));   // 3
Console.WriteLine(string.Join("+", GreedyClassics.GreedyChange(87, new[] { 50, 20, 10, 5, 2, 1 })));  // 50+20+10+5+2
Console.WriteLine(string.Join("+", GreedyClassics.GreedyChange(6, new[] { 4, 3, 1 })));              // 4+1+1 (wrong! best is 3+3)` }
  ],
  pitfalls: [
    'Sorting activities by start time or by duration. Only sorting by end time is optimal for maximum count.',
    'Applying greedy to 0/1 knapsack or coin change with unusual denominations. Those need dynamic programming.',
    'Trusting greedy without trying to break it on a tiny example. A 30-second counterexample search saves a wrong interview answer.',
    'Forgetting the "total gas >= total cost" check in gas station; the restart trick alone does not prove a solution exists.',
    'In job sequencing, scanning slots linearly for every job on large inputs. Use union-find to jump to the latest free slot.',
    'In Huffman with a single distinct character, producing an empty code. Give it "0" explicitly.'
  ],
  quiz: [
    { q: 'For maximum non-overlapping meetings, by which key do you sort?', options: ['Start time', 'Duration (shortest first)', 'End time', 'Number of attendees'], answer: 2, why: 'Taking the earliest-ending meeting leaves the most time for the rest; the exchange argument proves it optimal. Start time and duration both have simple counterexamples.' },
    { q: 'Coins are 1, 3 and 4. What does greedy give for 6, and what is optimal?', options: ['Greedy 3+3, optimal 3+3', 'Greedy 4+1+1, optimal 3+3', 'Greedy 4+1+1, optimal 4+1+1', 'Greedy 3+1+1+1, optimal 4+1+1'], answer: 1, why: 'Greedy takes the largest coin 4 then two 1s (three coins). Two 3s use only two coins. This system is not canonical, so greedy fails.' },
    { q: 'Which problem is solved correctly by a greedy algorithm?', options: ['0/1 knapsack', 'Fractional knapsack', 'Longest common subsequence', 'Weighted interval scheduling'], answer: 1, why: 'When items can be split, taking the highest value-per-weight first is optimal. The other three need dynamic programming.' },
    { q: 'What is an exchange argument?', options: ['Swapping two sort keys and timing which one runs faster', 'Swapping greedy choices into an optimal answer at no loss', 'Exchanging greedy for DP as soon as a greedy attempt fails', 'Trading extra memory for a faster running time'], answer: 1, why: 'It is the standard proof technique for greedy correctness: swap the optimal choice for the greedy choice at the first difference and show nothing is lost.' },
    { q: 'In Huffman coding, which two nodes are merged at each step?', options: ['The two most frequent', 'The two least frequent', 'The first two in alphabetical order', 'A random pair'], answer: 1, why: 'Merging the two rarest symbols pushes them deepest in the tree, giving them the longest codes, which minimises total encoded length.' },
    { q: 'Minimum platforms with arrivals [900, 940, 950, 1100, 1500, 1800] and departures [910, 1200, 1120, 1130, 1900, 2000]. How many?', options: ['2', '3', '4', '6'], answer: 1, why: 'At 11:00, trains that arrived at 9:40, 9:50 and 11:00 are all present (the 9:00 train left at 9:10). Three overlap at once.' }
  ],
  takeaways: [
    'Greedy = sort by the right key, then one pass taking the locally best choice. Never undo.',
    'Greedy is correct only when a local best never blocks a global best. Prove it with an exchange argument or find a counterexample.',
    'Intervals: sort by end for max count, by start for merging, sweep +1/-1 for max overlap.',
    'Fractional knapsack is greedy; 0/1 knapsack is DP. Canonical coins are greedy; arbitrary coins are DP.',
    'Huffman, Dijkstra, Prim and Kruskal are all greedy algorithms with proofs.',
    'For NP-hard problems, greedy often gives a guaranteed approximation (set cover, bin packing, submodular selection).'
  ],
  interview: [
    { q: 'How do you decide between greedy and dynamic programming?', a: `<p>Try to break greedy with a tiny counterexample. If every natural sort key fails on some input, use DP. If one key seems to work, give an exchange argument: show that swapping the greedy choice into any optimal solution never makes it worse. Classic signals for DP: indivisible items with a capacity, weights on intervals, or needing the number of solutions rather than one optimum.</p>` },
    { q: 'Prove that choosing the earliest-ending activity first is optimal.', a: `<p>Let G be the greedy choice (earliest end) and let O be any optimal schedule whose first activity is A. Since G ends no later than A, every activity that is compatible with A is also compatible with G. Replace A with G in O; the schedule stays valid and has the same size. Repeating this at each step turns O into the greedy schedule without reducing its size, so greedy is optimal.</p>` },
    { q: 'Explain the gas station solution and why a single pass is enough.', a: `<p>If total gas is less than total cost, no start works. Otherwise walk from index 0 keeping a running tank. When the tank drops below zero at station i, no station from the current start through i can be the answer, because starting later in that stretch only removes gas that had been accumulated. So restart from i+1 with an empty tank. The last restart point is the answer, found in O(n).</p>` },
    { q: 'Give a real production example where greedy is used as an approximation.', a: `<p>Bin packing for container placement: sort containers by resource need (first-fit decreasing) and place each in the first machine where it fits. It is not optimal but guarantees close to 11/9 of the optimal number of machines, runs in O(n log n), and is what most schedulers and cloud auto-scalers actually do. Similarly, greedy set cover picks the server region covering the most remaining users each round.</p>` }
  ]
};
