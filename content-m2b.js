// DevPath content: Module 2 (Linear DSA) part B — recursion, hashing, sorting, linked list, stacks & queues.
window.CONTENT = window.CONTENT || {};

/* ───────────────────────── m2-recursion ───────────────────────── */
window.CONTENT['m2-recursion'] = {
  hook: `A function that calls itself sounds like a bug. It is actually the cleanest way to solve a problem by solving a smaller copy of the same problem.`,
  intro: `<p><span class="term">Recursion</span> is when a function solves a problem by calling itself on a smaller version of that problem. Every recursive function has two parts. The <span class="term">base case</span> is the smallest problem you can answer directly, without calling yourself again. The <span class="term">recursive case</span> is where you shrink the problem a little and call yourself.</p>
<p>Think of it like Russian nesting dolls. To find the smallest doll, you open one doll, and inside you find the same job again, just smaller. You keep opening until you reach a doll that does not open. That doll is the base case.</p>
<p>Recursion matters because many real problems are naturally "the same thing, but smaller": folders inside folders, comments under comments, trees, choices that branch into more choices. <span class="term">Backtracking</span> is recursion with an extra move: try an option, go deeper, and if it leads nowhere, undo it and try the next option.</p>
<p>In this lesson you will build a mental picture of the call stack, write the classic recursive functions, then solve real backtracking problems: subsets, permutations, N-Queens, rat in a maze and a Sudoku solver.</p>`,
  realLife: {
    title: 'Finding a file in nested folders',
    body: `<p>Imagine you are looking for a photo somewhere in your Documents folder. You open Documents. For each item inside, you ask one question: is this a file? If yes, check its name. If it is a folder, do the exact same search inside that folder. You do not need a new plan for sub-folders. The plan is the same; the folder is just smaller.</p>
<p>That is recursion. The base case is an empty folder (nothing to search). The recursive case is "search each sub-folder". Windows Explorer, the <code>dotnet</code> CLI when it finds <code>.csproj</code> files, and <code>git</code> when it walks your working tree all do exactly this. At GitHub, the code search indexer walks repository trees recursively to find every file to index.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The two rules that make recursion work</h4>
<p>Every recursive function must answer two questions. First, when do I stop? That is the base case. Second, how does the problem get smaller each time? If a call does not get closer to the base case, the function runs forever.</p>
<ul>
<li><strong>Base case:</strong> the answer you know without thinking. factorial(0) is 1. The sum of an empty list is 0.</li>
<li><strong>Recursive case:</strong> use the answer of the smaller problem. factorial(n) = n times factorial(n - 1).</li>
</ul>
<h4>A picture of the call stack</h4>
<p>When a function calls itself, the computer does not throw away the first call. It puts it on hold, on a pile called the <span class="term">call stack</span>, and starts the new call on top. When the top call finishes, it is removed and the one below continues. For factorial(3):</p>
<table><thead><tr><th>Step</th><th>Stack (top first)</th><th>What happens</th></tr></thead>
<tbody><tr><td>1</td><td>factorial(3)</td><td>needs factorial(2), waits</td></tr>
<tr><td>2</td><td>factorial(2), factorial(3)</td><td>needs factorial(1), waits</td></tr>
<tr><td>3</td><td>factorial(1), factorial(2), factorial(3)</td><td>needs factorial(0), waits</td></tr>
<tr><td>4</td><td>factorial(0) ... </td><td>base case, returns 1</td></tr>
<tr><td>5</td><td>unwinding</td><td>1 → 1 → 2 → 6</td></tr></tbody></table>
<p>Each waiting call keeps its own copy of <code>n</code>. That is why recursion "remembers" where it was.</p>
<h4>Common first examples</h4>
<ul>
<li>Factorial: n! = n × (n-1)!</li>
<li>Sum of digits: sum(1234) = 4 + sum(123)</li>
<li>Fibonacci: fib(n) = fib(n-1) + fib(n-2)</li>
<li>Reverse a string: reverse("abc") = reverse("bc") + "a"</li>
</ul>
<div class="callout tip"><p>Trust the function. When writing factorial(n), assume factorial(n-1) already works and just use it. This "leap of faith" is the trick that makes recursion easy to write.</p></div>
<h4>What goes wrong</h4>
<p>If you forget the base case, or the problem never shrinks, the stack fills up and .NET throws a <code>StackOverflowException</code>, which cannot be caught and kills the process. A second problem is doing the same work many times: plain recursive Fibonacci calls fib(5) over and over. The fix is <span class="term">memoization</span>: remember answers in a dictionary so each one is computed once.</p>` },
    { name: 'Intermediate', body: `<h4>Backtracking: try, go deeper, undo</h4>
<p><span class="term">Backtracking</span> explores choices one at a time. At each step you pick an option, recurse, and when you come back you undo that pick so the next option starts from a clean state. The pattern always looks the same:</p>
<ol>
<li>If the current state is a complete answer, record it and return.</li>
<li>For each possible choice: make the choice, recurse, undo the choice.</li>
</ol>
<p>The undo step is what people forget. If you use a shared <code>List&lt;int&gt;</code> as the current path, you must <code>RemoveAt(path.Count - 1)</code> after the recursive call.</p>
<h4>The three classic shapes</h4>
<div class="compare"><div><h5>Subsets (include / exclude)</h5><p>At each index you have two choices: take the element or skip it. 2^n leaves. Depth n.</p></div><div><h5>Permutations (pick any unused)</h5><p>At each position, try every element not yet used. n! leaves. Use a <code>bool[] used</code> array.</p></div></div>
<p>The third shape is <strong>constraint search</strong> like N-Queens or Sudoku: place something, check that no rule is broken, and only then go deeper. Checking early is called <span class="term">pruning</span>, and it is what makes these problems finish in time.</p>
<h4>Recursion vs iteration</h4>
<table><thead><tr><th></th><th>Recursion</th><th>Loop</th></tr></thead>
<tbody><tr><td>Code</td><td>Short, matches the problem shape</td><td>Longer for trees and branching</td></tr>
<tr><td>Memory</td><td>One stack frame per depth (risk of overflow)</td><td>Constant unless you add your own stack</td></tr>
<tr><td>Speed</td><td>Slight overhead per call</td><td>Usually a bit faster</td></tr>
<tr><td>Best for</td><td>Trees, graphs, backtracking, divide and conquer</td><td>Simple counting, scanning arrays</td></tr></tbody></table>
<div class="callout warn"><p>Any recursion can be rewritten as a loop with an explicit <code>Stack&lt;T&gt;</code>. Do this when depth could reach the tens of thousands, such as walking a long linked list or a deep file tree.</p></div>
<h4>Memoization in C#</h4>
<p>Keep a <code>Dictionary&lt;int, long&gt;</code>. Before computing, check the dictionary. After computing, store the result. Fibonacci drops from exponential time to O(n). This is the first step toward dynamic programming, which you meet later in this module.</p>` },
    { name: 'Expert', body: `<h4>How deep can you go?</h4>
<p>The main thread of a .NET process gets a 1 MB stack by default on Windows (8 MB is common on Linux). Each frame costs roughly the size of its locals plus bookkeeping, often 50 to 200 bytes for a simple method. So around 10,000 to 50,000 levels is a realistic limit. Recursive Fibonacci is fine. Recursing down a 1,000,000-node linked list is not. For those cases, either convert to a loop or run the work on a thread with a larger stack: <code>new Thread(Work, 64 * 1024 * 1024)</code>.</p>
<h4>Tail calls</h4>
<p>A <span class="term">tail call</span> is a recursive call that is the very last thing the function does, so nothing needs to be remembered. Some languages reuse the frame and make this free. The .NET JIT only does this sometimes (mostly in release builds on x64 for simple cases), so you cannot rely on it in C#. Write a loop when it matters.</p>
<h4>Counting the work</h4>
<ul>
<li>Subsets: O(2^n × n) because there are 2^n subsets and copying each costs up to n.</li>
<li>Permutations: O(n! × n).</li>
<li>N-Queens: much less than n^n thanks to pruning; 8 queens explores about 2,000 placements instead of 16 million.</li>
<li>Sudoku: worst case exponential, but with "pick the cell with fewest options first" it solves newspaper puzzles in milliseconds.</li>
</ul>
<h4>Pruning and ordering</h4>
<p>The order you try choices changes the speed by orders of magnitude. Rules that help: fail fast (check constraints before recursing, not after), choose the most constrained variable first, and use O(1) checks. For N-Queens, three boolean arrays (column, main diagonal row-col+n-1, anti-diagonal row+col) make the safety check O(1) instead of scanning the board.</p>
<h4>Divide and conquer is recursion too</h4>
<p>Merge sort, quick sort, binary search and the fast power trick are all recursion where each level does real work and the recursion tree is balanced. The Master Theorem describes their cost: T(n) = 2T(n/2) + O(n) gives O(n log n). You will meet that in sorting.</p>
<div class="callout idea"><p>Interviewers love to ask: "Now do it without recursion." Have the explicit-stack version of DFS and subsets ready. Also be ready to explain why memoized recursion and bottom-up DP compute the same thing in a different order.</p></div>` }
  ],
  flow: {
    title: 'Backtracking to generate all subsets of [1, 2, 3]',
    steps: [
      { title: 'Start empty', desc: 'Path = []. Index = 0. We are at the root of the decision tree.' },
      { title: 'Choose 1', desc: 'Add 1 to the path. Path = [1]. Recurse to index 1.' },
      { title: 'Choose 2', desc: 'Path = [1, 2]. Recurse to index 2.' },
      { title: 'Choose 3 → record', desc: 'Path = [1, 2, 3]. Index reached the end, so we record this subset.' },
      { title: 'Undo 3', desc: 'Remove 3. Path = [1, 2]. Skip 3 instead and record [1, 2].' },
      { title: 'Undo 2, skip it', desc: 'Remove 2. Path = [1]. Now explore the branch where 2 is skipped: [1, 3] and [1].' },
      { title: 'Undo 1, skip it', desc: 'Path = []. Explore every subset that does not contain 1: [2, 3], [2], [3], [].' },
      { title: 'All 8 found', desc: '2^3 = 8 subsets. Each element was either included or excluded at its level.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Recursion basics: factorial, fibonacci with memo, reverse string', code: `using System;
using System.Collections.Generic;

class Basics
{
    // Base case: 0! = 1. Recursive case: n! = n * (n-1)!
    // Time O(n), stack depth O(n)
    static long Factorial(int n)
    {
        if (n <= 1) return 1;          // base case
        return n * Factorial(n - 1);   // recursive case
    }

    // Plain recursion is O(2^n): fib(5) is computed many times.
    static long FibSlow(int n) => n < 2 ? n : FibSlow(n - 1) + FibSlow(n - 2);

    // Memoization: remember every answer. Time O(n), space O(n).
    static readonly Dictionary<int, long> memo = new();
    static long Fib(int n)
    {
        if (n < 2) return n;
        if (memo.TryGetValue(n, out var cached)) return cached;
        long result = Fib(n - 1) + Fib(n - 2);
        memo[n] = result;
        return result;
    }

    // reverse("abc") = reverse("bc") + "a"
    static string Reverse(string s)
    {
        if (s.Length <= 1) return s;
        return Reverse(s.Substring(1)) + s[0];
    }

    // Sum of digits: 1234 -> 4 + sum(123)
    static int SumDigits(int n) => n == 0 ? 0 : n % 10 + SumDigits(n / 10);

    static void Main()
    {
        Console.WriteLine(Factorial(10));   // 3628800
        Console.WriteLine(Fib(50));         // 12586269025 (instant with memo)
        Console.WriteLine(Reverse("devpath"));
        Console.WriteLine(SumDigits(1234)); // 10
    }
}` },
    { lang: 'csharp', title: 'Backtracking: subsets and permutations', code: `using System;
using System.Collections.Generic;

class Backtracking
{
    // All subsets (power set). Time O(2^n * n), depth O(n).
    static void Subsets(int[] nums, int index, List<int> path, List<List<int>> result)
    {
        if (index == nums.Length)
        {
            result.Add(new List<int>(path));   // copy! path keeps changing
            return;
        }
        // Choice 1: include nums[index]
        path.Add(nums[index]);
        Subsets(nums, index + 1, path, result);
        path.RemoveAt(path.Count - 1);         // undo (backtrack)

        // Choice 2: exclude nums[index]
        Subsets(nums, index + 1, path, result);
    }

    // All permutations. Time O(n! * n).
    static void Permutations(int[] nums, bool[] used, List<int> path, List<List<int>> result)
    {
        if (path.Count == nums.Length)
        {
            result.Add(new List<int>(path));
            return;
        }
        for (int i = 0; i < nums.Length; i++)
        {
            if (used[i]) continue;
            used[i] = true;              // make the choice
            path.Add(nums[i]);
            Permutations(nums, used, path, result);
            path.RemoveAt(path.Count - 1);
            used[i] = false;             // undo the choice
        }
    }

    static void Main()
    {
        var subs = new List<List<int>>();
        Subsets(new[] { 1, 2, 3 }, 0, new List<int>(), subs);
        Console.WriteLine("Subsets: " + subs.Count);          // 8
        foreach (var s in subs) Console.WriteLine("[" + string.Join(",", s) + "]");

        var perms = new List<List<int>>();
        Permutations(new[] { 1, 2, 3 }, new bool[3], new List<int>(), perms);
        Console.WriteLine("Permutations: " + perms.Count);    // 6
    }
}` },
    { lang: 'csharp', title: 'N-Queens with O(1) safety checks, and Rat in a Maze', code: `using System;
using System.Collections.Generic;

class ConstraintSearch
{
    // ---- N-Queens: place n queens so none attack each other ----
    static int count;
    static bool[] col, diag1, diag2;   // diag1: row-col+n-1, diag2: row+col

    static void SolveQueens(int n, int row, int[] placement)
    {
        if (row == n) { count++; return; }   // every row has a queen
        for (int c = 0; c < n; c++)
        {
            int d1 = row - c + n - 1, d2 = row + c;
            if (col[c] || diag1[d1] || diag2[d2]) continue;   // prune early
            col[c] = diag1[d1] = diag2[d2] = true;             // place
            placement[row] = c;
            SolveQueens(n, row + 1, placement);
            col[c] = diag1[d1] = diag2[d2] = false;            // remove (backtrack)
        }
    }

    // ---- Rat in a maze: find a path from (0,0) to (n-1,n-1) through 1-cells ----
    static readonly int[] dr = { 1, 0, -1, 0 };
    static readonly int[] dc = { 0, 1, 0, -1 };
    static readonly string dirs = "DRUL";

    static bool FindPath(int[,] maze, int r, int c, bool[,] visited, List<char> path)
    {
        int n = maze.GetLength(0);
        if (r < 0 || c < 0 || r >= n || c >= n) return false;   // off the board
        if (maze[r, c] == 0 || visited[r, c]) return false;     // wall or already here
        if (r == n - 1 && c == n - 1) return true;              // reached the exit

        visited[r, c] = true;
        for (int k = 0; k < 4; k++)
        {
            path.Add(dirs[k]);
            if (FindPath(maze, r + dr[k], c + dc[k], visited, path)) return true;
            path.RemoveAt(path.Count - 1);   // that way failed, undo
        }
        visited[r, c] = false;               // allow other routes through this cell
        return false;
    }

    static void Main()
    {
        int n = 8;
        col = new bool[n]; diag1 = new bool[2 * n]; diag2 = new bool[2 * n];
        SolveQueens(n, 0, new int[n]);
        Console.WriteLine("8-Queens solutions: " + count);   // 92

        int[,] maze = { { 1, 0, 0, 0 }, { 1, 1, 0, 1 }, { 0, 1, 0, 0 }, { 1, 1, 1, 1 } };
        var path = new List<char>();
        bool ok = FindPath(maze, 0, 0, new bool[4, 4], path);
        Console.WriteLine(ok ? "Path: " + string.Join("", path) : "No path");   // DRDDRR
    }
}` },
    { lang: 'csharp', title: 'Sudoku solver (backtracking with early checks)', code: `using System;

class Sudoku
{
    // Returns true when the board is solved in place. 0 means empty.
    static bool Solve(int[,] b)
    {
        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++)
            {
                if (b[r, c] != 0) continue;
                for (int v = 1; v <= 9; v++)
                {
                    if (!IsSafe(b, r, c, v)) continue;
                    b[r, c] = v;                 // try
                    if (Solve(b)) return true;   // go deeper
                    b[r, c] = 0;                 // undo
                }
                return false;   // no digit fits here -> backtrack
            }
        return true;   // no empty cell left
    }

    static bool IsSafe(int[,] b, int r, int c, int v)
    {
        for (int i = 0; i < 9; i++)
            if (b[r, i] == v || b[i, c] == v) return false;
        int br = r / 3 * 3, bc = c / 3 * 3;        // top-left of the 3x3 box
        for (int i = 0; i < 3; i++)
            for (int j = 0; j < 3; j++)
                if (b[br + i, bc + j] == v) return false;
        return true;
    }

    static void Main()
    {
        int[,] board =
        {
            {5,3,0, 0,7,0, 0,0,0},
            {6,0,0, 1,9,5, 0,0,0},
            {0,9,8, 0,0,0, 0,6,0},
            {8,0,0, 0,6,0, 0,0,3},
            {4,0,0, 8,0,3, 0,0,1},
            {7,0,0, 0,2,0, 0,0,6},
            {0,6,0, 0,0,0, 2,8,0},
            {0,0,0, 4,1,9, 0,0,5},
            {0,0,0, 0,8,0, 0,7,9}
        };
        Console.WriteLine(Solve(board) ? "Solved" : "No solution");
        for (int r = 0; r < 9; r++)
        {
            for (int c = 0; c < 9; c++) Console.Write(board[r, c] + " ");
            Console.WriteLine();
        }
    }
}` }
  ],
  pitfalls: [
    'Forgetting the base case, or writing one that is never reached (for example recursing on n - 2 but only stopping at n == 0 when n starts odd). Result: StackOverflowException, which .NET cannot catch.',
    'Adding the shared path list to results without copying it. Every result then points to the same list, which ends up empty.',
    'Skipping the undo step in backtracking. The second branch then starts with leftovers from the first.',
    'Using plain recursion for Fibonacci-style problems with overlapping subproblems. Add a memo dictionary or switch to a loop.',
    'Recursing on something that is not getting smaller, like passing the same string instead of Substring(1).',
    'Recursing on very deep inputs (long linked lists, deep trees from user data). Convert to an explicit Stack<T> loop.'
  ],
  quiz: [
    { q: 'What is the base case of a recursive function?', options: ['The first call that Main makes to the function', 'The input it answers without calling itself', 'The line where the function calls itself again', 'The deepest level the call stack can reach'], answer: 1, why: 'The base case is the stopping point. Without it the function would call itself forever.' },
    { q: 'Why does plain recursive Fibonacci get slow for n = 45?', options: ['Because the long result overflows and must be retried', 'Because it recomputes the same sub-results many times', 'Because .NET slows down after 1000 nested recursive calls', 'Because every call allocates a new dictionary'], answer: 1, why: 'fib(45) calls fib(44) and fib(43), and each of those recomputes shared work. The call tree has about 2^n nodes. Memoization fixes this.' },
    { q: 'In backtracking, what must you do after a recursive call returns?', options: ['Clear the list of results found so far', 'Undo the choice made before the call', 'Increase the index by two to skip the next option', 'Return immediately without trying other options'], answer: 1, why: 'Backtracking means try, recurse, undo. Without the undo the next option starts in a dirty state.' },
    { q: 'How many subsets does a set of 10 elements have?', options: ['10', '100', '1024', '3628800'], answer: 2, why: 'Each element is either in or out: 2 choices each, so 2^10 = 1024 subsets.' },
    { q: 'What happens in .NET when recursion goes too deep?', options: ['An OutOfMemoryException that you can catch and log', 'A StackOverflowException that terminates the process', 'The runtime automatically converts it to a loop', 'The call is queued on the thread pool for later'], answer: 1, why: 'StackOverflowException cannot be caught in .NET. The process dies, so deep recursion must be avoided or moved to a loop.' },
    { q: 'Which check makes N-Queens fast?', options: ['Checking the whole board only after all queens are placed', 'Checking column and diagonals before placing each queen', 'Sorting the queens by row before the search starts', 'Storing every board tried so far in a Dictionary'], answer: 1, why: 'Pruning early, before going deeper, cuts the search from millions of boards to a few thousand.' }
  ],
  takeaways: [
    'Recursion = base case + a smaller version of the same problem. Check both before you run.',
    'Picture the call stack: each pending call keeps its own copy of the variables.',
    'Backtracking is try → recurse → undo. Copy the path when you save a result.',
    'Memoization turns exponential recursion into linear time when subproblems repeat.',
    'Deep recursion (10k+ levels) risks a fatal StackOverflowException; use an explicit stack or a loop.',
    'Prune early and pick the most constrained choice first; order changes speed by orders of magnitude.'
  ],
  interview: [
    { q: 'Explain recursion to someone who has never coded.', a: `<p>It is solving a problem by solving a slightly smaller copy of the same problem, until the copy is so small the answer is obvious. Like looking for your keys room by room: search this room, and if there is a closet, search it the same way.</p>` },
    { q: 'What is the difference between recursion and backtracking?', a: `<p>Backtracking is recursion plus undo. Plain recursion computes a result from smaller results. Backtracking explores choices, and when a choice leads to a dead end it reverses that choice and tries another. It is used when you must enumerate or search over combinations under rules.</p>` },
    { q: 'How would you avoid stack overflow in a recursive tree walk?', a: `<p>Use an explicit <code>Stack&lt;Node&gt;</code> and a loop (iterative DFS), or limit depth and switch to iteration past a threshold. For known-deep inputs you can also run on a thread created with a larger stack size.</p>` },
    { q: 'Generate all permutations of a string with duplicate letters, without duplicate outputs.', a: `<p>Sort the characters first. In the loop, skip a character if it equals the previous one and the previous one is not currently used. This makes sure equal letters are always picked in the same order, so each distinct permutation appears once.</p>` }
  ]
};
/* ───────────────────────── m2-hashing ───────────────────────── */
window.CONTENT['m2-hashing'] = {
  hook: `Searching a list of a million names takes a million steps. A hash table finds any name in about one step. The trick is a tiny bit of maths that turns a name into a shelf number.`,
  intro: `<p><span class="term">Hashing</span> means turning a piece of data (a word, a number, an object) into a number called a <span class="term">hash code</span>, and using that number to decide where to store the data. A <span class="term">hash table</span> is an array of "buckets". To store a key, compute its hash, take it modulo the array size, and that is the bucket. To find a key later, do the same maths and look in that one bucket. No scanning.</p>
<p>In C#, <code>Dictionary&lt;TKey, TValue&gt;</code> and <code>HashSet&lt;T&gt;</code> are hash tables. They give you add, remove and lookup in O(1) on average. That single fact solves a huge family of interview problems: counting things, checking "have I seen this before", pairing values up, and grouping items.</p>
<p>Two keys can land in the same bucket. That is called a <span class="term">collision</span>. A good hash table handles collisions so lookups stay fast, and a good hash function spreads keys out so collisions are rare.</p>`,
  realLife: {
    title: 'The coat check at a theatre',
    body: `<p>At a big theatre, the coat check does not search every hook when you return with your ticket. The ticket number tells them the exact hook. Ticket 4217 → hook 17 (the last two digits). Two guests may get hooks ending in 17, so each hook holds a small rail with a couple of coats, and they check the full ticket number on the rail. That is a hash table: the hook number is the hash, the rail is a bucket, and the full ticket check resolves collisions.</p>
<p>Real companies use hashing everywhere: Redis is essentially a giant hash table in memory; CDNs and load balancers hash a URL or user id to pick a server; Git names every commit by a SHA-1 hash of its contents; and your ASP.NET Core app looks up routes, headers and DI services through dictionaries thousands of times per second.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>What a hash function does</h4>
<p>A <span class="term">hash function</span> takes input of any size and gives back a fixed-size number. The same input always gives the same number. Different inputs usually give different numbers, but not always. In C#, every object has <code>GetHashCode()</code>. For strings it mixes all the characters into one 32-bit integer.</p>
<h4>From hash to bucket</h4>
<p>If the table has 16 buckets, the bucket index is <code>hash % 16</code> (after making it non-negative). Store the key and value in that bucket. Looking up does the same calculation, so you jump straight to the right bucket.</p>
<h4>Collisions</h4>
<p>When two keys map to the same bucket, the table must store both. The usual way, called <span class="term">chaining</span>, keeps a small list in each bucket and compares full keys with <code>Equals</code>. As long as the lists stay short, lookups stay fast. When the table gets too full (the load factor rises), it doubles its size and re-places every key. That is called <span class="term">rehashing</span>.</p>
<h4>The three tools you will use</h4>
<ul>
<li><code>Dictionary&lt;TKey,TValue&gt;</code>: key → value. Count words, map ids to objects, cache results.</li>
<li><code>HashSet&lt;T&gt;</code>: just keys. Answer "seen before?" and remove duplicates.</li>
<li><code>TryGetValue</code> and <code>ContainsKey</code>: check without throwing exceptions.</li>
</ul>
<div class="callout tip"><p>Pattern to remember: "for each item, look it up in a dictionary, then update the dictionary." Most O(n) solutions to counting and pairing problems are exactly this.</p></div>
<h4>Classic beginner problems</h4>
<ul>
<li>Count how many times each character appears in a string.</li>
<li>Find the first non-repeating character.</li>
<li>Check if two strings are anagrams (same letter counts).</li>
<li>Remove duplicates from a list while keeping order.</li>
</ul>` },
    { name: 'Intermediate', body: `<h4>Two Sum: the hashing pattern in one problem</h4>
<p>Given numbers and a target, find two that add up to the target. Brute force checks every pair, O(n²). With a dictionary, walk once: for each number x, ask "have I seen target - x?" If yes, done. If no, store x. O(n) time, O(n) space. The idea is: store what you have seen so that future items can look back in O(1).</p>
<h4>Prefix sums + hashing</h4>
<p>"Count subarrays whose sum equals k" looks like it needs nested loops. Instead, keep a running sum. If the running sum at index j minus the running sum at some earlier index i equals k, then the subarray (i, j] sums to k. So for each position, look up how many earlier prefix sums equal <code>runningSum - k</code> in a dictionary. O(n).</p>
<h4>Grouping with a canonical key</h4>
<p>To group anagrams, make a key that is the same for all words in a group: sort the letters ("eat" → "aet") or count letters into a 26-slot array joined into a string. Then <code>Dictionary&lt;string, List&lt;string&gt;&gt;</code> does the grouping for free.</p>
<h4>Longest consecutive sequence</h4>
<p>Put all numbers in a <code>HashSet</code>. For each number n, only start counting if n - 1 is not in the set (so n is the start of a run). Then count n+1, n+2, ... while present. Every number is visited a constant number of times, so O(n) even though it looks like nested loops.</p>
<h4>Custom keys</h4>
<p>If you use your own class as a dictionary key, you must override both <code>Equals</code> and <code>GetHashCode</code>, and they must agree: equal objects must have equal hash codes. The easy way in modern C# is a <code>record</code> or <code>record struct</code>, which generates both for you from the fields. Tuples like <code>(int x, int y)</code> also work out of the box.</p>
<div class="callout warn"><p>Never mutate an object while it is a key in a dictionary. Its hash code changes, but it sits in the old bucket, so you can never find it again.</p></div>
<h4>Chaining vs open addressing</h4>
<div class="compare"><div><h5>Chaining</h5><p>Each bucket holds a linked list or small array. Simple, handles high load. .NET's Dictionary uses an array-based chain with "next" indices.</p></div><div><h5>Open addressing</h5><p>All entries live in the main array. On collision, probe the next slot (linear, quadratic or double hashing). Cache friendly, but needs lower load factor and careful deletes (tombstones).</p></div></div>` },
    { name: 'Expert', body: `<h4>Inside .NET's Dictionary</h4>
<p><code>Dictionary&lt;TKey,TValue&gt;</code> keeps two arrays: <code>buckets</code> (int indices) and <code>entries</code> (structs with hashCode, next, key, value). The bucket count is a prime number. Lookup: compute hash, index into buckets, follow the <code>next</code> chain comparing hash codes first (cheap int compare) and then <code>Equals</code> only when the hash matches. Entries are stored in insertion order in the array, which is why enumeration "seems" ordered until a removal reuses a slot. Do not rely on that order.</p>
<h4>Why string hashing is randomized</h4>
<p>Since .NET Core, <code>string.GetHashCode()</code> uses a per-process random seed. Two runs of the same program produce different hash codes. This defends against <span class="term">hash flooding</span>: an attacker sending thousands of keys that all collide, turning O(1) into O(n) and starving a web server. The consequence for you: never persist or send a hash code, and never depend on dictionary order.</p>
<h4>Load factor and resizing cost</h4>
<p>Resizing re-inserts every entry, O(n), but it happens rarely (sizes roughly double), so the <span class="term">amortized</span> cost per insert is still O(1). If you know the size up front, pass capacity to the constructor to avoid the resizes entirely. The same applies to <code>HashSet</code>.</p>
<h4>Worst case and guarantees</h4>
<p>Average O(1) relies on a good hash. With a terrible hash (for example returning a constant), everything is one chain and lookups are O(n). Interviewers may ask for a structure with guaranteed O(log n): that is a balanced tree, <code>SortedDictionary</code> in .NET. Use it when you also need ordered iteration or range queries.</p>
<h4>Beyond dictionaries</h4>
<ul>
<li><strong>Rolling hash:</strong> update a hash as a window slides (Rabin-Karp string search, later in this module).</li>
<li><strong>Consistent hashing:</strong> map keys to servers so that adding a server moves only 1/n of keys (System Design module).</li>
<li><strong>Bloom filters:</strong> several hash functions over a bit array give a tiny "probably seen" set with no false negatives.</li>
<li><strong>Cryptographic hashes</strong> (SHA-256) are a different tool: collision-resistant and much slower than a table hash, used for integrity and passwords (with salt and a slow KDF), never for hash tables.</li>
</ul>
<div class="callout idea"><p>Memory matters: a Dictionary&lt;int,int&gt; with a million entries uses tens of megabytes. When keys are dense integers 0..n, a plain array is a perfect hash table with zero overhead.</p></div>` }
  ],
  flow: {
    title: 'Two Sum with a dictionary: nums = [2, 7, 11, 15], target = 9',
    steps: [
      { title: 'Empty map', desc: 'seen = {}. We will store value → index as we go.' },
      { title: 'x = 2', desc: 'Need 9 - 2 = 7. Is 7 in seen? No. Store seen[2] = 0.' },
      { title: 'x = 7', desc: 'Need 9 - 7 = 2. Is 2 in seen? Yes, at index 0.' },
      { title: 'Answer', desc: 'Return [0, 1]. Only two array visits were needed.' },
      { title: 'Why it is O(n)', desc: 'Each element is looked up once and stored once. Dictionary operations are O(1) on average.' },
      { title: 'Generalise', desc: 'Store what you have seen so the future can look back in O(1). This is the heart of every hashing solution.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Counting and lookups: frequencies, anagrams, first unique char, two sum', code: `using System;
using System.Collections.Generic;
using System.Linq;

class HashBasics
{
    // Count how many times each character appears. O(n)
    static Dictionary<char, int> CharFrequency(string s)
    {
        var freq = new Dictionary<char, int>();
        foreach (char ch in s)
            freq[ch] = freq.GetValueOrDefault(ch) + 1;   // GetValueOrDefault returns 0 when missing
        return freq;
    }

    // First character that appears exactly once. O(n)
    static char? FirstUnique(string s)
    {
        var freq = CharFrequency(s);
        foreach (char ch in s)
            if (freq[ch] == 1) return ch;
        return null;
    }

    // Two strings are anagrams if letter counts match. O(n)
    static bool AreAnagrams(string a, string b)
    {
        if (a.Length != b.Length) return false;
        var counts = new int[26];                       // perfect hash for lowercase letters
        for (int i = 0; i < a.Length; i++)
        {
            counts[a[i] - 'a']++;
            counts[b[i] - 'a']--;
        }
        return counts.All(c => c == 0);
    }

    // Two Sum: indices of two numbers adding to target. O(n) time, O(n) space
    static int[] TwoSum(int[] nums, int target)
    {
        var seen = new Dictionary<int, int>();          // value -> index
        for (int i = 0; i < nums.Length; i++)
        {
            int need = target - nums[i];
            if (seen.TryGetValue(need, out int j)) return new[] { j, i };
            seen[nums[i]] = i;                          // store AFTER checking (handles 4+4=8)
        }
        return Array.Empty<int>();
    }

    static void Main()
    {
        Console.WriteLine(FirstUnique("devpathdev"));                 // p
        Console.WriteLine(AreAnagrams("listen", "silent"));           // True
        Console.WriteLine(string.Join(",", TwoSum(new[] { 2, 7, 11, 15 }, 9)));   // 0,1
    }
}` },
    { lang: 'csharp', title: 'Prefix sum + hashing, grouping, longest consecutive run', code: `using System;
using System.Collections.Generic;
using System.Linq;

class HashPatterns
{
    // Count subarrays with sum == k. O(n)
    // Idea: prefix[j] - prefix[i] == k  <=>  prefix[i] == prefix[j] - k
    static int SubarraySumEqualsK(int[] nums, int k)
    {
        var prefixCount = new Dictionary<long, int> { [0] = 1 };   // empty prefix
        long running = 0; int count = 0;
        foreach (int x in nums)
        {
            running += x;
            count += prefixCount.GetValueOrDefault(running - k);
            prefixCount[running] = prefixCount.GetValueOrDefault(running) + 1;
        }
        return count;
    }

    // Group words that are anagrams of each other. O(n * L log L)
    static List<List<string>> GroupAnagrams(string[] words)
    {
        var groups = new Dictionary<string, List<string>>();
        foreach (var w in words)
        {
            var key = string.Concat(w.OrderBy(c => c));   // "eat" -> "aet"
            if (!groups.TryGetValue(key, out var list))
                groups[key] = list = new List<string>();
            list.Add(w);
        }
        return groups.Values.ToList();
    }

    // Longest run of consecutive integers. O(n)
    static int LongestConsecutive(int[] nums)
    {
        var set = new HashSet<int>(nums);
        int best = 0;
        foreach (int n in set)
        {
            if (set.Contains(n - 1)) continue;   // not the start of a run
            int len = 1;
            while (set.Contains(n + len)) len++;
            best = Math.Max(best, len);
        }
        return best;
    }

    // Remove duplicates but keep first-seen order. O(n)
    static List<int> Dedupe(int[] nums)
    {
        var seen = new HashSet<int>();
        var result = new List<int>();
        foreach (int x in nums)
            if (seen.Add(x)) result.Add(x);     // Add returns false if already present
        return result;
    }

    static void Main()
    {
        Console.WriteLine(SubarraySumEqualsK(new[] { 1, 1, 1 }, 2));             // 2
        foreach (var g in GroupAnagrams(new[] { "eat", "tea", "tan", "ate", "nat", "bat" }))
            Console.WriteLine(string.Join(" ", g));
        Console.WriteLine(LongestConsecutive(new[] { 100, 4, 200, 1, 3, 2 }));   // 4
        Console.WriteLine(string.Join(",", Dedupe(new[] { 3, 1, 3, 2, 1 })));   // 3,1,2
    }
}` },
    { lang: 'csharp', title: 'Custom keys and a tiny hash table built from scratch (chaining)', code: `using System;
using System.Collections.Generic;

// Records generate Equals and GetHashCode from their fields: safe dictionary keys.
public readonly record struct GridPoint(int X, int Y);

// A class used as a key must override BOTH methods consistently.
public class Employee
{
    public string Email { get; }
    public Employee(string email) => Email = email;
    public override bool Equals(object? obj) =>
        obj is Employee e && string.Equals(Email, e.Email, StringComparison.OrdinalIgnoreCase);
    public override int GetHashCode() =>
        StringComparer.OrdinalIgnoreCase.GetHashCode(Email);
}

// Minimal hash map with separate chaining, to see what Dictionary does inside.
public class MyHashMap<TKey, TValue> where TKey : notnull
{
    private List<KeyValuePair<TKey, TValue>>[] buckets = new List<KeyValuePair<TKey, TValue>>[8];
    private int count;

    private int Index(TKey key) => (key.GetHashCode() & 0x7FFFFFFF) % buckets.Length;

    public void Put(TKey key, TValue value)
    {
        if (count >= buckets.Length * 0.75) Resize();          // keep load factor low
        var bucket = buckets[Index(key)] ??= new();
        for (int i = 0; i < bucket.Count; i++)
            if (bucket[i].Key.Equals(key)) { bucket[i] = new(key, value); return; }
        bucket.Add(new(key, value));
        count++;
    }

    public bool TryGet(TKey key, out TValue value)
    {
        var bucket = buckets[Index(key)];
        if (bucket != null)
            foreach (var kv in bucket)
                if (kv.Key.Equals(key)) { value = kv.Value; return true; }
        value = default!;
        return false;
    }

    private void Resize()
    {
        var old = buckets;
        buckets = new List<KeyValuePair<TKey, TValue>>[old.Length * 2];
        count = 0;
        foreach (var b in old)
            if (b != null) foreach (var kv in b) Put(kv.Key, kv.Value);   // rehash everything
    }
}

class Demo
{
    static void Main()
    {
        var visited = new HashSet<GridPoint> { new(1, 2) };
        Console.WriteLine(visited.Contains(new GridPoint(1, 2)));   // True (value equality)

        var salaries = new Dictionary<Employee, int> { [new Employee("A@x.com")] = 100 };
        Console.WriteLine(salaries.ContainsKey(new Employee("a@X.com")));   // True

        var map = new MyHashMap<string, int>();
        for (int i = 0; i < 100; i++) map.Put("key" + i, i);
        Console.WriteLine(map.TryGet("key42", out var v) ? v : -1);   // 42
    }
}` }
  ],
  pitfalls: [
    'Using dictionary[key] to read a key that may be missing. It throws KeyNotFoundException. Use TryGetValue or GetValueOrDefault.',
    'Overriding Equals without GetHashCode (or the reverse). Equal objects then land in different buckets and lookups fail silently.',
    'Changing an object after using it as a key. Its hash no longer matches its bucket.',
    'Depending on Dictionary enumeration order. It is not guaranteed, and string hashes change per process run.',
    'In Two Sum, storing the current number before checking for its partner, which wrongly matches a number with itself.',
    'Forgetting prefixCount[0] = 1 in the subarray-sum trick, which misses subarrays that start at index 0.'
  ],
  quiz: [
    { q: 'What is the average time to look up a key in a Dictionary?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], answer: 2, why: 'The hash takes you straight to the bucket. Only a short chain is compared, so the average cost is constant.' },
    { q: 'What is a collision?', options: ['Two threads writing the dictionary at once', 'Two different keys mapping to the same bucket', 'A null key being added to the table', 'A dictionary with no free buckets left'], answer: 1, why: 'Collisions are normal and expected. Chaining or open addressing resolves them.' },
    { q: 'You use a custom class as a key and lookups fail even though Equals returns true. Most likely cause?', options: ['The class is not sealed, so keys cannot be compared', 'GetHashCode was not overridden to match Equals', 'The dictionary is too small and dropped the entry', 'You used TryGetValue instead of the indexer'], answer: 1, why: 'Dictionary finds the bucket by hash first. If equal objects have different hashes, it looks in the wrong bucket.' },
    { q: 'How does the dictionary solve "count subarrays with sum k" in O(n)?', options: ['It sorts the array first, then binary searches for k', 'It counts prefix sums and looks up runningSum - k', 'It stores every subarray sum and looks up k at the end', 'It uses two nested loops over start and end index'], answer: 1, why: 'If an earlier prefix sum equals runningSum - k, the stretch between them sums to k. Counting those earlier prefix sums gives the answer in one pass.' },
    { q: 'Why are .NET string hash codes different between two runs of the same program?', options: ['A known bug in .NET that is kept for compatibility', 'Random seeding to prevent hash-flooding attacks', 'Because strings are reference types hashed by memory address', 'They are not different; the hash is always the same'], answer: 1, why: 'Randomized hashing stops attackers from crafting many keys that collide and slow a server to O(n) per lookup.' },
    { q: 'Which structure gives guaranteed O(log n) lookups with sorted iteration?', options: ['HashSet<T>', 'ConcurrentDictionary<K,V>', 'SortedDictionary<K,V>', 'List<T>'], answer: 2, why: 'SortedDictionary is a balanced binary search tree, so it is ordered and has a worst-case O(log n) guarantee.' }
  ],
  takeaways: [
    'A hash table turns a key into a bucket index, giving O(1) average add, remove and lookup.',
    'Pattern: store what you have seen so future items can look back in O(1) (Two Sum, prefix sums, dedupe).',
    'Collisions are normal; chaining and open addressing handle them, and resizing keeps chains short.',
    'Custom keys need Equals and GetHashCode that agree; records give you this for free.',
    'Never rely on dictionary order or persist hash codes; they are randomized per process.',
    'Use SortedDictionary when you need order or a worst-case guarantee; use an array when keys are dense integers.'
  ],
  interview: [
    { q: 'How does a HashMap / Dictionary work internally?', a: `<p>It hashes the key, maps the hash to a bucket index (modulo the bucket count), and stores the entry there. Collisions are handled by chaining entries in the same bucket. Lookups compare the stored hash first, then Equals. When the load factor passes a threshold, the table grows and every entry is rehashed, which keeps average operations O(1).</p>` },
    { q: 'Find the first repeating element in an array.', a: `<p>Walk the array with a HashSet. For each element, if <code>set.Add(x)</code> returns false, x is the first repeat. O(n) time, O(n) space.</p>` },
    { q: 'When would you not use a hash table?', a: `<p>When you need ordered traversal or range queries (use a balanced tree), when keys are small dense integers (use an array), when memory is tight and the data is small (a sorted array with binary search can be smaller and cache friendly), or when you need a worst-case guarantee against adversarial inputs.</p>` },
    { q: 'Design a data structure with O(1) insert, delete and getRandom.', a: `<p>Combine a List for values and a Dictionary from value to index. Insert appends and records the index. Delete swaps the element with the last one, updates the moved element's index, then removes the last. getRandom picks a random index in the list.</p>` }
  ]
};
/* ───────────────────────── m2-sorting ───────────────────────── */
window.CONTENT['m2-sorting'] = {
  hook: `There are a dozen ways to put things in order, and the slow ones are not useless: the "best" sort depends on how much data you have, whether it is nearly sorted already, and whether equal items must keep their order.`,
  intro: `<p><span class="term">Sorting</span> means arranging items in order: smallest to largest, A to Z, oldest to newest. It sounds simple, but how you do it changes the cost from "instant" to "hours" once the list is large. Sorting also unlocks other tricks: binary search, removing duplicates, finding medians and merging data all expect sorted input.</p>
<p>In this lesson you will write every standard algorithm in C#: bubble, selection and insertion (the simple O(n²) ones), merge sort and quick sort (the fast O(n log n) ones), heap sort, and the counting-based sorts (counting, radix, bucket) that can beat O(n log n) when the data has a special shape.</p>
<p>You will also learn two words interviewers ask about. A sort is <span class="term">stable</span> if equal items keep their original order. A sort is <span class="term">in-place</span> if it needs only a tiny amount of extra memory beyond the array itself.</p>`,
  realLife: {
    title: 'Sorting a hand of cards vs sorting a warehouse',
    body: `<p>When you sort playing cards in your hand, you pick up the next card and slide it into the right spot among the ones you already hold. That is insertion sort, and for 13 cards it is perfect. Now imagine a warehouse with a million parcels that must be sorted by postcode. Nobody slides parcels one by one. They split parcels into regions, sort each region separately, then combine. That is merge sort and quick sort: divide, sort small pieces, combine.</p>
<p>At scale this is everywhere. Amazon's fulfilment centres sort packages by destination in stages (that is radix sort by digit, in real life). SQL Server's ORDER BY uses merge-based sorting that spills to disk for huge result sets. And .NET's <code>Array.Sort</code> uses introsort, a quick sort that switches to heap sort if it gets unlucky and to insertion sort for tiny ranges.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The three simple sorts</h4>
<p>All three are O(n²): double the data, four times the work. They are fine for small lists and great for understanding.</p>
<ul>
<li><strong>Bubble sort:</strong> walk the list, swap neighbours that are in the wrong order, repeat until a pass makes no swaps. Big values "bubble" to the end.</li>
<li><strong>Selection sort:</strong> find the smallest item, put it first; find the next smallest, put it second; and so on. At most n-1 swaps.</li>
<li><strong>Insertion sort:</strong> take items one at a time and insert each into its correct place among the already-sorted left part. Very fast when the list is nearly sorted: O(n) in that case.</li>
</ul>
<h4>Divide and conquer: the fast sorts</h4>
<p><strong>Merge sort</strong> splits the array in half, sorts each half (by calling itself), then merges the two sorted halves by repeatedly taking the smaller front item. Always O(n log n), but needs a temporary array of size n.</p>
<p><strong>Quick sort</strong> picks a <span class="term">pivot</span>, moves everything smaller to its left and everything larger to its right (this is called <span class="term">partitioning</span>), then sorts the two sides. Usually the fastest in practice and in-place, but O(n²) if the pivots are unlucky.</p>
<h4>Why O(n log n) matters</h4>
<table><thead><tr><th>n</th><th>n² (bubble)</th><th>n log n (merge)</th></tr></thead>
<tbody><tr><td>1,000</td><td>1 million</td><td>10 thousand</td></tr>
<tr><td>1,000,000</td><td>1 trillion</td><td>20 million</td></tr></tbody></table>
<p>At a million items, bubble sort would take hours; merge sort takes well under a second.</p>
<h4>In C#, just call Sort</h4>
<p><code>Array.Sort(arr)</code>, <code>list.Sort()</code> and LINQ <code>OrderBy</code> are all you need in real code. Learn the algorithms to understand cost and to answer interview questions, not to replace the built-ins.</p>
<div class="callout tip"><p>Insertion sort for tiny arrays plus merge/quick sort for the rest is how real libraries work. Mixing algorithms is normal.</p></div>` },
    { name: 'Intermediate', body: `<h4>Stability: does it matter?</h4>
<p>Suppose you sort orders by customer, and two orders belong to the same customer. A stable sort keeps them in their original (say, date) order. An unstable sort may swap them. Merge sort and insertion sort are stable. Quick sort, selection sort and heap sort are not. In .NET, <code>Array.Sort</code> and <code>List.Sort</code> are <strong>unstable</strong>; LINQ <code>OrderBy</code>/<code>ThenBy</code> is <strong>stable</strong>. That difference catches people in production.</p>
<h4>Quick sort partition schemes</h4>
<div class="compare"><div><h5>Lomuto</h5><p>Pivot is the last element. One index walks the array, swapping small items forward. Simple to write, more swaps, degrades badly with many equal keys.</p></div><div><h5>Hoare</h5><p>Two indices move toward each other and swap out-of-place pairs. Fewer swaps, handles duplicates better. The original 1961 scheme.</p></div></div>
<p>Picking the pivot randomly (or median-of-three) makes the O(n²) worst case practically impossible on real data.</p>
<h4>Heap sort</h4>
<p>Build a max-heap in O(n), then repeatedly swap the root (largest) with the last element and shrink the heap, fixing it with sift-down. O(n log n) guaranteed and in-place, but slower in practice than quick sort because of poor cache behaviour. You will build heaps in the non-linear section.</p>
<h4>Sorting without comparing: counting, radix, bucket</h4>
<p>Comparison sorts cannot beat O(n log n). But if you know the keys are small integers, you can count them. <strong>Counting sort</strong> builds a frequency array of size k and rebuilds the output: O(n + k). <strong>Radix sort</strong> applies a stable counting sort digit by digit (least significant first): O(d × (n + k)) for d digits. <strong>Bucket sort</strong> spreads values into ranges, sorts each small bucket, and concatenates: O(n) on average for uniform data.</p>
<h4>Comparison table</h4>
<table><thead><tr><th>Algorithm</th><th>Best</th><th>Average</th><th>Worst</th><th>Space</th><th>Stable</th></tr></thead>
<tbody><tr><td>Bubble</td><td>n</td><td>n²</td><td>n²</td><td>1</td><td>Yes</td></tr>
<tr><td>Selection</td><td>n²</td><td>n²</td><td>n²</td><td>1</td><td>No</td></tr>
<tr><td>Insertion</td><td>n</td><td>n²</td><td>n²</td><td>1</td><td>Yes</td></tr>
<tr><td>Merge</td><td>n log n</td><td>n log n</td><td>n log n</td><td>n</td><td>Yes</td></tr>
<tr><td>Quick</td><td>n log n</td><td>n log n</td><td>n²</td><td>log n</td><td>No</td></tr>
<tr><td>Heap</td><td>n log n</td><td>n log n</td><td>n log n</td><td>1</td><td>No</td></tr>
<tr><td>Counting</td><td>n + k</td><td>n + k</td><td>n + k</td><td>n + k</td><td>Yes</td></tr>
<tr><td>Radix</td><td>d(n + k)</td><td>d(n + k)</td><td>d(n + k)</td><td>n + k</td><td>Yes</td></tr></tbody></table>
<h4>Custom ordering in C#</h4>
<p>Pass a lambda: <code>people.Sort((a, b) =&gt; a.Age.CompareTo(b.Age))</code>, or implement <code>IComparer&lt;T&gt;</code> for reuse, or implement <code>IComparable&lt;T&gt;</code> on the type for a natural order. For multiple keys use LINQ: <code>OrderBy(p =&gt; p.City).ThenByDescending(p =&gt; p.Age)</code>.</p>` },
    { name: 'Expert', body: `<h4>The Ω(n log n) lower bound</h4>
<p>A comparison sort is a decision tree. n items have n! possible orders, so the tree needs at least n! leaves, and a binary tree with n! leaves has height at least log₂(n!) ≈ n log n. No comparison-based algorithm can beat this. Counting-based sorts escape the bound by not comparing; they read the key's digits directly.</p>
<h4>What Array.Sort really does</h4>
<p>.NET uses <span class="term">introsort</span>: quick sort with median-of-three pivots; if recursion depth exceeds 2 log n it switches to heap sort (guaranteeing O(n log n)); for partitions of 16 or fewer elements it uses insertion sort. For primitive arrays it runs specialised code with direct comparisons, which is extremely fast. LINQ's OrderBy is a stable sort that first computes all keys, so it is slower but safer for multi-key business sorting.</p>
<h4>Cache and branch behaviour</h4>
<p>Quick sort beats merge sort in practice because it works in-place on data already in the CPU cache and its inner loop is tight. Merge sort touches a second buffer. Heap sort jumps around memory (parent at i/2, children at 2i), so it misses cache constantly. On modern CPUs, memory access patterns often matter more than the operation count.</p>
<h4>Many duplicate keys</h4>
<p>Standard quick sort degrades to O(n²) when most keys are equal, because every partition is unbalanced. The fix is <span class="term">3-way partitioning</span> (Dutch national flag): split into less than, equal to, and greater than the pivot, and only recurse on the outer parts. Equal keys never get touched again.</p>
<h4>External and parallel sorting</h4>
<p>When data does not fit in memory, sort chunks that do, write each sorted run to disk, then k-way merge the runs with a min-heap. Databases and big-data engines do this. Parallel sorts (PLINQ, <code>Parallel.For</code> over chunks + merge) scale across cores; merge sort parallelises naturally because the halves are independent.</p>
<h4>Related problems interviewers use</h4>
<ul>
<li>Kth largest element: quick select (partition once, recurse on one side), O(n) average.</li>
<li>Count inversions: merge sort with a counter during the merge.</li>
<li>Sort nearly-sorted arrays (each element at most k away): min-heap of size k+1, O(n log k).</li>
<li>Merge k sorted lists: heap of heads, O(N log k).</li>
</ul>
<div class="callout warn"><p>Never implement your own sort in production code unless you are in a hot path that profiling has proven. Use Array.Sort, List.Sort or OrderBy, and pick based on stability needs.</p></div>` }
  ],
  flow: {
    title: 'Merge sort on [5, 2, 4, 7, 1, 3]',
    steps: [
      { title: 'Split', desc: 'Divide into [5, 2, 4] and [7, 1, 3]. Keep splitting until every piece has one element.' },
      { title: 'Single elements', desc: '[5] [2] [4] [7] [1] [3]. A one-element list is already sorted: this is the base case.' },
      { title: 'Merge pairs', desc: 'Merge [5] and [2] → [2, 5]. Then [2, 5] with [4] → [2, 4, 5]. Right side: [1, 7] then [1, 3, 7].' },
      { title: 'Merge step detail', desc: 'Compare fronts: 2 vs 1 → take 1. 2 vs 3 → take 2. 4 vs 3 → take 3. 4 vs 7 → take 4. 5 vs 7 → take 5. Then copy 7.' },
      { title: 'Result', desc: '[1, 2, 3, 4, 5, 7]. Each level of the tree does n work and there are log n levels.' },
      { title: 'Cost', desc: 'O(n log n) always, O(n) extra memory for the temp buffer. Stable because on ties we take from the left half first.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Bubble, selection and insertion sort', code: `using System;

static class SimpleSorts
{
    // Bubble sort: O(n^2) average/worst, O(n) best (already sorted), stable, in-place
    public static void BubbleSort(int[] a)
    {
        for (int pass = 0; pass < a.Length - 1; pass++)
        {
            bool swapped = false;
            for (int i = 0; i < a.Length - 1 - pass; i++)   // last 'pass' items are already in place
            {
                if (a[i] > a[i + 1])
                {
                    (a[i], a[i + 1]) = (a[i + 1], a[i]);    // tuple swap
                    swapped = true;
                }
            }
            if (!swapped) break;   // no swaps -> sorted, stop early
        }
    }

    // Selection sort: O(n^2) always, NOT stable, in-place, minimum number of swaps
    public static void SelectionSort(int[] a)
    {
        for (int i = 0; i < a.Length - 1; i++)
        {
            int minIdx = i;
            for (int j = i + 1; j < a.Length; j++)
                if (a[j] < a[minIdx]) minIdx = j;
            if (minIdx != i) (a[i], a[minIdx]) = (a[minIdx], a[i]);
        }
    }

    // Insertion sort: O(n^2) worst, O(n) when nearly sorted, stable, in-place
    public static void InsertionSort(int[] a)
    {
        for (int i = 1; i < a.Length; i++)
        {
            int key = a[i];
            int j = i - 1;
            while (j >= 0 && a[j] > key)   // shift bigger items right
            {
                a[j + 1] = a[j];
                j--;
            }
            a[j + 1] = key;                // drop key into the gap
        }
    }

    static void Main()
    {
        int[] a = { 5, 2, 9, 1, 5, 6 };
        InsertionSort(a);
        Console.WriteLine(string.Join(" ", a));   // 1 2 5 5 6 9
    }
}` },
    { lang: 'csharp', title: 'Merge sort and quick sort (Lomuto, Hoare, randomized pivot)', code: `using System;

static class FastSorts
{
    // ---------- Merge sort: O(n log n) always, O(n) extra space, stable ----------
    public static void MergeSort(int[] a) => MergeSort(a, new int[a.Length], 0, a.Length - 1);

    static void MergeSort(int[] a, int[] tmp, int lo, int hi)
    {
        if (lo >= hi) return;                  // 0 or 1 element
        int mid = lo + (hi - lo) / 2;
        MergeSort(a, tmp, lo, mid);
        MergeSort(a, tmp, mid + 1, hi);
        Merge(a, tmp, lo, mid, hi);
    }

    static void Merge(int[] a, int[] tmp, int lo, int mid, int hi)
    {
        int i = lo, j = mid + 1, k = lo;
        while (i <= mid && j <= hi)
            tmp[k++] = a[i] <= a[j] ? a[i++] : a[j++];   // <= keeps it stable
        while (i <= mid) tmp[k++] = a[i++];
        while (j <= hi)  tmp[k++] = a[j++];
        Array.Copy(tmp, lo, a, lo, hi - lo + 1);
    }

    // ---------- Quick sort: O(n log n) average, O(n^2) worst, in-place, not stable ----------
    static readonly Random rng = new();

    public static void QuickSort(int[] a) => QuickSort(a, 0, a.Length - 1);

    static void QuickSort(int[] a, int lo, int hi)
    {
        if (lo >= hi) return;
        int p = PartitionLomuto(a, lo, hi);
        QuickSort(a, lo, p - 1);
        QuickSort(a, p + 1, hi);
    }

    // Lomuto: pivot ends at its final index p, which is returned.
    static int PartitionLomuto(int[] a, int lo, int hi)
    {
        int r = rng.Next(lo, hi + 1);              // random pivot avoids the sorted-input worst case
        (a[r], a[hi]) = (a[hi], a[r]);
        int pivot = a[hi], i = lo;                 // i = boundary of the "smaller" region
        for (int j = lo; j < hi; j++)
            if (a[j] < pivot) { (a[i], a[j]) = (a[j], a[i]); i++; }
        (a[i], a[hi]) = (a[hi], a[i]);             // put pivot in place
        return i;
    }

    // Hoare: the loop ends with j such that a[lo..j] <= pivot <= a[j+1..hi]. Fewer swaps.
    public static void QuickSortHoare(int[] a, int lo, int hi)
    {
        if (lo >= hi) return;
        int pivot = a[lo + (hi - lo) / 2];
        int i = lo - 1, j = hi + 1;
        while (true)
        {
            do i++; while (a[i] < pivot);
            do j--; while (a[j] > pivot);
            if (i >= j) break;
            (a[i], a[j]) = (a[j], a[i]);
        }
        QuickSortHoare(a, lo, j);        // note: j, not j - 1
        QuickSortHoare(a, j + 1, hi);
    }

    static void Main()
    {
        int[] a = { 9, 4, 7, 1, 8, 2, 2, 6 };
        QuickSort(a);
        Console.WriteLine(string.Join(" ", a));   // 1 2 2 4 6 7 8 9
        int[] b = { 9, 4, 7, 1, 8, 2, 2, 6 };
        MergeSort(b);
        Console.WriteLine(string.Join(" ", b));
    }
}` },
    { lang: 'csharp', title: 'Heap sort, counting sort, radix sort, bucket sort', code: `using System;
using System.Collections.Generic;

static class SpecialSorts
{
    // ---------- Heap sort: O(n log n) guaranteed, in-place, not stable ----------
    public static void HeapSort(int[] a)
    {
        int n = a.Length;
        for (int i = n / 2 - 1; i >= 0; i--) SiftDown(a, i, n);   // build max-heap, O(n)
        for (int end = n - 1; end > 0; end--)
        {
            (a[0], a[end]) = (a[end], a[0]);   // move current max to the end
            SiftDown(a, 0, end);               // restore heap on the shrunken part
        }
    }
    static void SiftDown(int[] a, int i, int n)
    {
        while (true)
        {
            int l = 2 * i + 1, r = l + 1, largest = i;
            if (l < n && a[l] > a[largest]) largest = l;
            if (r < n && a[r] > a[largest]) largest = r;
            if (largest == i) return;
            (a[i], a[largest]) = (a[largest], a[i]);
            i = largest;
        }
    }

    // ---------- Counting sort: O(n + k) for keys in [0, k], stable ----------
    public static int[] CountingSort(int[] a, int maxValue)
    {
        var count = new int[maxValue + 1];
        foreach (int x in a) count[x]++;
        for (int i = 1; i <= maxValue; i++) count[i] += count[i - 1];   // prefix: positions
        var output = new int[a.Length];
        for (int i = a.Length - 1; i >= 0; i--)    // backwards keeps it stable
            output[--count[a[i]]] = a[i];
        return output;
    }

    // ---------- Radix sort (LSD, base 10): O(d * (n + 10)), stable ----------
    public static void RadixSort(int[] a)   // non-negative ints
    {
        int max = 0; foreach (int x in a) max = Math.Max(max, x);
        for (int exp = 1; max / exp > 0; exp *= 10)
        {
            var count = new int[10];
            foreach (int x in a) count[(x / exp) % 10]++;
            for (int i = 1; i < 10; i++) count[i] += count[i - 1];
            var output = new int[a.Length];
            for (int i = a.Length - 1; i >= 0; i--)
                output[--count[(a[i] / exp) % 10]] = a[i];
            Array.Copy(output, a, a.Length);
        }
    }

    // ---------- Bucket sort: O(n) average for uniformly spread values in [0,1) ----------
    public static void BucketSort(double[] a)
    {
        int n = a.Length;
        var buckets = new List<double>[n];
        for (int i = 0; i < n; i++) buckets[i] = new List<double>();
        foreach (double x in a) buckets[(int)(x * n)].Add(x);
        int k = 0;
        foreach (var b in buckets)
        {
            b.Sort();                       // buckets are tiny, any sort is fine
            foreach (double x in b) a[k++] = x;
        }
    }

    static void Main()
    {
        int[] a = { 170, 45, 75, 90, 802, 24, 2, 66 };
        RadixSort(a);
        Console.WriteLine(string.Join(" ", a));   // 2 24 45 66 75 90 170 802
        var c = CountingSort(new[] { 4, 2, 2, 8, 3, 3, 1 }, 8);
        Console.WriteLine(string.Join(" ", c));   // 1 2 2 3 3 4 8
    }
}` },
    { lang: 'csharp', title: 'Sorting real objects in C#: comparers, stability, multi-key', code: `using System;
using System.Collections.Generic;
using System.Linq;

record Order(int Id, string Customer, decimal Amount, DateTime Placed);

class AmountDescComparer : IComparer<Order>
{
    public int Compare(Order? a, Order? b) => b!.Amount.CompareTo(a!.Amount);
}

class Demo
{
    static void Main()
    {
        var orders = new List<Order>
        {
            new(1, "acme", 50m,  new DateTime(2026, 1, 3)),
            new(2, "zen",  20m,  new DateTime(2026, 1, 1)),
            new(3, "acme", 50m,  new DateTime(2026, 1, 2)),
            new(4, "beta", 99m,  new DateTime(2026, 1, 5)),
        };

        // 1. List.Sort with a lambda: in-place, fast, NOT stable
        orders.Sort((a, b) => a.Customer.CompareTo(b.Customer));

        // 2. Reusable comparer
        orders.Sort(new AmountDescComparer());

        // 3. LINQ: stable, multi-key, returns a new sequence
        var sorted = orders
            .OrderBy(o => o.Customer)
            .ThenByDescending(o => o.Amount)
            .ThenBy(o => o.Placed)
            .ToList();
        foreach (var o in sorted) Console.WriteLine(o);

        // 4. Case-insensitive string sort
        var names = new[] { "bob", "Alice", "carol" };
        Array.Sort(names, StringComparer.OrdinalIgnoreCase);
        Console.WriteLine(string.Join(", ", names));   // Alice, bob, carol

        // 5. Sort one array by another (keys/items overload)
        int[] scores = { 70, 95, 80 };
        string[] students = { "Ann", "Ben", "Cai" };
        Array.Sort(scores, students);                   // students now ordered by score
        Console.WriteLine(string.Join(", ", students)); // Ann, Cai, Ben

        // 6. Kth largest with a heap in O(n log k)
        var pq = new PriorityQueue<int, int>();          // min-heap by priority
        int k = 2;
        foreach (int s in new[] { 3, 9, 4, 7, 1 })
        {
            pq.Enqueue(s, s);
            if (pq.Count > k) pq.Dequeue();
        }
        Console.WriteLine("2nd largest: " + pq.Peek()); // 7
    }
}` }
  ],
  pitfalls: [
    'Assuming List.Sort or Array.Sort is stable. They are not. Use LINQ OrderBy/ThenBy when equal items must keep their order.',
    'Picking the first or last element as the quick sort pivot. Already-sorted input then costs O(n²). Randomize or use median-of-three.',
    'Computing mid as (lo + hi) / 2. For huge arrays this overflows; write lo + (hi - lo) / 2.',
    'Using counting sort when the key range k is huge (for example 32-bit ints): the count array would need 4 billion slots.',
    'Writing a comparer that is not consistent (a < b and b < a both true). Sort may throw or give a wrong order; make sure Compare is a proper ordering.',
    'Sorting inside a loop. Sorting is O(n log n); doing it n times is O(n² log n). Sort once, then search or walk.'
  ],
  quiz: [
    { q: 'Which sort is best when the input is almost already sorted?', options: ['Selection sort', 'Insertion sort', 'Heap sort', 'Counting sort'], answer: 1, why: 'Insertion sort does almost no shifting on nearly-sorted data, running in close to O(n).' },
    { q: 'What does "stable" mean for a sorting algorithm?', options: ['It never crashes, even with a bad comparer', 'Equal elements keep their original order', 'It always runs in O(n log n), whatever the input', 'It uses no extra memory beyond the array itself'], answer: 1, why: 'Stability matters for multi-key sorting, like sorting by customer while keeping orders in date order.' },
    { q: 'Why can quick sort be O(n²)?', options: ['Because recursion always adds a factor of n', 'Because bad pivots make every partition unbalanced', 'Because it copies into a temp array each level', 'Because it compares items instead of counting'], answer: 1, why: 'If the pivot is always the smallest or largest, one side has n-1 items each time, giving n levels of O(n) work.' },
    { q: 'Why can counting sort beat O(n log n)?', options: ['It splits the array and uses one thread for each half', 'It reads key values directly instead of comparing', 'It is written in C, which avoids .NET overhead', 'It only sorts half the array and mirrors the rest'], answer: 1, why: 'The n log n lower bound applies only to comparison sorts. Counting the keys avoids comparisons entirely.' },
    { q: 'Which is stable in .NET: Array.Sort or LINQ OrderBy?', options: ['Array.Sort', 'OrderBy', 'Both', 'Neither'], answer: 1, why: 'Array.Sort uses introsort (unstable). OrderBy is a stable sort and supports ThenBy for extra keys.' },
    { q: 'How does the built-in Array.Sort guarantee O(n log n) worst case?', options: ['By using merge sort with a temp buffer for every call', 'By switching to heap sort when recursion gets too deep', 'By always using insertion sort, which has no bad pivot cases', 'It does not guarantee it; the worst case is still O(n²)'], answer: 1, why: 'Introsort detects deep recursion (bad pivots) and switches to heap sort, which is always O(n log n).' }
  ],
  takeaways: [
    'Simple sorts (bubble, selection, insertion) are O(n²); insertion sort is great for tiny or nearly-sorted data.',
    'Merge sort: always O(n log n), stable, needs O(n) extra space. Quick sort: fastest in practice, in-place, unstable, randomize the pivot.',
    'Comparison sorts cannot beat n log n; counting, radix and bucket sorts can when keys are small integers or evenly spread.',
    'In .NET, Array.Sort and List.Sort are unstable introsort; LINQ OrderBy/ThenBy is stable.',
    'Know Lomuto vs Hoare partition and the 3-way partition for many duplicates.',
    'Sort once, then use binary search, two pointers or merging; never sort inside a loop.'
  ],
  interview: [
    { q: 'Why is quick sort usually faster than merge sort if both are O(n log n)?', a: `<p>Quick sort works in place with a tight inner loop over memory that is already in cache, and does fewer memory writes. Merge sort copies to a second buffer at every level. The constant factors and cache behaviour favour quick sort, even though its worst case is worse.</p>` },
    { q: 'Sort an array containing only 0s, 1s and 2s in one pass.', a: `<p>Dutch national flag: keep three pointers low, mid, high. While mid ≤ high: if a[mid] is 0 swap with low and advance both; if 1 just advance mid; if 2 swap with high and decrement high only. O(n) time, O(1) space.</p>` },
    { q: 'Find the kth largest element faster than sorting.', a: `<p>Quick select: partition around a random pivot; if the pivot lands at index n-k you are done, otherwise recurse into the side that contains that index. Average O(n). Alternatively keep a min-heap of size k for O(n log k), which is better for streams.</p>` },
    { q: 'How would you sort 100 GB of data on a machine with 8 GB of RAM?', a: `<p>External merge sort: read chunks that fit in memory, sort each, write sorted runs to disk, then do a k-way merge of the runs using a min-heap over the run heads, streaming the output. Disk I/O dominates, so use large sequential reads and writes.</p>` }
  ]
};
/* ───────────────────────── m2-linked-list ───────────────────────── */
window.CONTENT['m2-linked-list'] = {
  hook: `An array is a row of numbered seats. A linked list is a treasure hunt: each clue tells you where the next one is. That one difference makes inserting in the middle instant, and jumping to item 500 slow.`,
  intro: `<p>A <span class="term">linked list</span> stores items in small boxes called <span class="term">nodes</span>. Each node holds a value and a <span class="term">pointer</span> (a reference) to the next node. The list only remembers where the first node, the <span class="term">head</span>, is. To reach anything else you follow the pointers one by one.</p>
<p>Compared with an array, a linked list is great at inserting and removing in the middle (just rewire two pointers, no shifting) and bad at random access (no index maths; you must walk). Its nodes can live anywhere in memory, so it also never needs to "grow and copy" like a <code>List&lt;T&gt;</code>.</p>
<p>There are three common kinds. A <span class="term">singly</span> linked list points forward only. A <span class="term">doubly</span> linked list also points backward, so you can walk either way and delete a node without knowing its previous node. A <span class="term">circular</span> list connects the last node back to the first.</p>
<p>Linked lists show up less in day-to-day C# than arrays and lists, but they power queues, LRU caches, hash table chains, and the undo stack in your editor. In interviews they are a favourite because pointer bugs are easy to make and reveal whether you think carefully.</p>`,
  realLife: {
    title: 'A train, and a browser history',
    body: `<p>A train is a linked list. Each carriage is a node coupled to the next. To add a carriage in the middle, you uncouple one joint and couple two. You do not move every other carriage. But to find carriage 12 you walk through 11 others; there is no "jump".</p>
<p>Your browser's back and forward buttons are a doubly linked list of pages: each page knows the previous one and the next one. Music players use circular lists for "repeat all". Inside .NET, <code>LinkedList&lt;T&gt;</code> is doubly linked, and most LRU caches combine a linked list (to track recency) with a dictionary (to find a node in O(1)). Redis builds its list type on a linked list too.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The node</h4>
<p>A node is a tiny class with two fields: <code>Value</code> and <code>Next</code>. The last node's <code>Next</code> is <code>null</code>, which is how you know the list ended. An empty list is just <code>head == null</code>.</p>
<h4>Walking the list</h4>
<p>Almost every operation uses the same loop: <code>var cur = head; while (cur != null) { ...; cur = cur.Next; }</code>. Draw it on paper the first few times. Put a finger on the head and move it along.</p>
<h4>Insert and delete</h4>
<ul>
<li><strong>Insert at front:</strong> make a node, point it at the old head, make it the new head. O(1).</li>
<li><strong>Insert at end:</strong> walk to the last node, point its Next at the new node. O(n) unless you also keep a <code>tail</code> pointer.</li>
<li><strong>Insert after node p:</strong> newNode.Next = p.Next; p.Next = newNode. O(1) once you have p.</li>
<li><strong>Delete node after p:</strong> p.Next = p.Next.Next. The skipped node is garbage collected.</li>
</ul>
<div class="callout warn"><p>Order matters when rewiring. Always point the new node at the next node first, then point the previous node at the new node. If you do it the other way around you lose the rest of the list.</p></div>
<h4>Array vs linked list</h4>
<table><thead><tr><th>Operation</th><th>Array / List&lt;T&gt;</th><th>Linked list</th></tr></thead>
<tbody><tr><td>Get item i</td><td>O(1)</td><td>O(n)</td></tr>
<tr><td>Insert/delete at front</td><td>O(n) (shift)</td><td>O(1)</td></tr>
<tr><td>Insert/delete in middle (given the node)</td><td>O(n)</td><td>O(1)</td></tr>
<tr><td>Memory per item</td><td>Just the value</td><td>Value + one or two pointers</td></tr>
<tr><td>Cache friendliness</td><td>Excellent</td><td>Poor (nodes scattered)</td></tr></tbody></table>
<h4>Singly vs doubly</h4>
<p>A doubly linked node also has <code>Prev</code>. That costs one extra pointer per node but lets you delete a node in O(1) when you only hold that node, and walk backwards. .NET's <code>LinkedList&lt;T&gt;</code> is doubly linked with <code>LinkedListNode&lt;T&gt;</code> objects you can keep hold of.</p>` },
    { name: 'Intermediate', body: `<h4>The dummy head trick</h4>
<p>Many bugs come from the head being a special case (deleting the first node, inserting into an empty list). Create a <span class="term">dummy</span> node in front of the real head, do all the work on <code>dummy.Next</code>, and return <code>dummy.Next</code> at the end. Now every node has a previous node and the special cases vanish.</p>
<h4>Slow and fast pointers</h4>
<p>Move one pointer one step at a time and another two steps at a time. When the fast one reaches the end, the slow one is at the middle. This finds the middle in one pass without counting. The same idea powers <span class="term">Floyd's cycle detection</span>: if the list loops, the fast pointer will eventually land on the slow one, like a faster runner lapping a slower one on a track. If there is no loop, fast hits null.</p>
<h4>Reversing a list</h4>
<p>Keep three pointers: <code>prev</code>, <code>cur</code>, <code>next</code>. For each node, save next, point cur backwards to prev, then advance prev and cur. At the end, prev is the new head. O(n) time, O(1) space. The recursive version is shorter but uses O(n) stack.</p>
<h4>Remove the nth node from the end</h4>
<p>Move a fast pointer n steps ahead, then move fast and slow together until fast reaches the end. Slow is now just before the node to remove. One pass, with the dummy head handling "remove the first node".</p>
<h4>Merge two sorted lists</h4>
<p>Exactly the merge step from merge sort, but you rewire nodes instead of copying values. Use a dummy head and a tail pointer, attach the smaller head each time, then attach whatever is left.</p>
<h4>LRU cache: the classic combination</h4>
<p>An <span class="term">LRU (least recently used) cache</span> keeps the most recently used items and evicts the oldest when full. You need O(1) get and put. A dictionary alone cannot track recency; a list alone cannot look up in O(1). Together: the dictionary maps key → node, the doubly linked list keeps nodes in recency order (front = most recent). On access, move the node to the front; on insert when full, drop the node at the back. In C#, <code>LinkedList&lt;T&gt;</code> plus <code>Dictionary&lt;K, LinkedListNode&lt;T&gt;&gt;</code> does this in a few lines.</p>
<div class="callout tip"><p>When stuck on a linked list problem, ask: do I need a dummy head? two pointers at different speeds? to rewire instead of copy? One of those three almost always unlocks it.</p></div>` },
    { name: 'Expert', body: `<h4>Why linked lists are slower than the Big-O suggests</h4>
<p>Each node is a separate heap object. Walking the list means jumping around memory, and every jump that misses the CPU cache costs 100+ cycles. An <code>int[]</code> of a million values is 4 MB in a row and streams through cache beautifully; a million linked nodes are scattered and each costs 24 to 40 bytes with object headers. In practice <code>List&lt;T&gt;</code> beats <code>LinkedList&lt;T&gt;</code> for almost everything, including many "insert in the middle" workloads, because shifting a few thousand ints is cheaper than a cache miss per node. Use a linked list when you hold node references and need O(1) splice/unlink, as in LRU caches and intrusive queues.</p>
<h4>Finding where the cycle starts</h4>
<p>After slow and fast meet inside the cycle, reset one pointer to the head and move both one step at a time. They meet at the cycle's entry node. The proof: if the tail before the cycle has length a and they met b steps into the cycle of length c, then 2(a + b) = a + b + k c, so a = k c - b, meaning walking a steps from the meeting point lands exactly at the entry.</p>
<h4>Classic harder problems</h4>
<ul>
<li>Reverse in groups of k: reverse k nodes, recurse on the rest, stitch.</li>
<li>Reorder list L0→Ln→L1→Ln-1: find middle, reverse second half, interleave.</li>
<li>Copy a list with random pointers: interleave copies after originals, set randoms, then split. O(1) extra space.</li>
<li>Add two numbers stored as lists: walk both with a carry, like primary school addition.</li>
<li>Flatten a multilevel doubly linked list: DFS with an explicit stack.</li>
<li>Sort a linked list in O(n log n): merge sort fits lists naturally (no random access needed).</li>
</ul>
<h4>Concurrency</h4>
<p>Lock-free linked lists (Harris's algorithm) use compare-and-swap on the Next pointer and "mark" nodes for logical deletion before physical unlinking. .NET's <code>ConcurrentQueue&lt;T&gt;</code> uses a linked list of segments for this reason. Writing your own is error-prone; prefer the built-in concurrent collections.</p>
<h4>Skip lists</h4>
<p>A sorted linked list with extra "express lane" pointers at random heights gives O(log n) search, insert and delete, with simpler code than balanced trees. Redis sorted sets and some database indexes use skip lists.</p>
<div class="callout idea"><p>Interviewers test pointer hygiene: do you handle the empty list, the single node, head deletion, and tail updates? Say the edge cases out loud before coding.</p></div>` }
  ],
  flow: {
    title: 'Reversing 1 → 2 → 3 → null with three pointers',
    steps: [
      { title: 'Start', desc: 'prev = null, cur = node 1. The list is 1 → 2 → 3 → null.' },
      { title: 'Save next', desc: 'next = cur.Next, which is node 2. We must save it before we break the link.' },
      { title: 'Flip the arrow', desc: 'cur.Next = prev. Node 1 now points to null. The list is 1 → null and 2 → 3 → null.' },
      { title: 'Advance', desc: 'prev = node 1, cur = node 2.' },
      { title: 'Repeat for node 2', desc: 'Save next = 3. Node 2 points at node 1. prev = 2, cur = 3.' },
      { title: 'Repeat for node 3', desc: 'Save next = null. Node 3 points at node 2. prev = 3, cur = null.' },
      { title: 'Done', desc: 'cur is null so the loop stops. prev (node 3) is the new head: 3 → 2 → 1 → null. O(n) time, O(1) space.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Singly linked list from scratch: insert, delete, search, print', code: `using System;

public class Node
{
    public int Value;
    public Node? Next;
    public Node(int value) => Value = value;
}

public class SinglyLinkedList
{
    public Node? Head;
    private Node? tail;    // keeps AddLast O(1)
    public int Count { get; private set; }

    public void AddFirst(int v)                       // O(1)
    {
        var n = new Node(v) { Next = Head };
        Head = n;
        if (tail == null) tail = n;
        Count++;
    }

    public void AddLast(int v)                        // O(1) thanks to tail
    {
        var n = new Node(v);
        if (Head == null) { Head = tail = n; }
        else { tail!.Next = n; tail = n; }
        Count++;
    }

    public void InsertAt(int index, int v)            // O(n)
    {
        if (index < 0 || index > Count) throw new ArgumentOutOfRangeException(nameof(index));
        if (index == 0) { AddFirst(v); return; }
        if (index == Count) { AddLast(v); return; }
        var prev = NodeAt(index - 1)!;
        prev.Next = new Node(v) { Next = prev.Next };  // link new node first, then prev
        Count++;
    }

    public bool Remove(int v)                         // O(n), removes first match
    {
        if (Head == null) return false;
        if (Head.Value == v)
        {
            Head = Head.Next;
            if (Head == null) tail = null;
            Count--; return true;
        }
        var cur = Head;
        while (cur.Next != null && cur.Next.Value != v) cur = cur.Next;
        if (cur.Next == null) return false;
        if (cur.Next == tail) tail = cur;
        cur.Next = cur.Next.Next;                     // unlink
        Count--; return true;
    }

    public bool Contains(int v)                       // O(n)
    {
        for (var cur = Head; cur != null; cur = cur.Next)
            if (cur.Value == v) return true;
        return false;
    }

    public Node? NodeAt(int index)
    {
        var cur = Head;
        for (int i = 0; i < index && cur != null; i++) cur = cur.Next;
        return cur;
    }

    public override string ToString()
    {
        var parts = new System.Text.StringBuilder();
        for (var cur = Head; cur != null; cur = cur.Next)
            parts.Append(cur.Value).Append(cur.Next != null ? " -> " : "");
        return parts.Length == 0 ? "(empty)" : parts.ToString();
    }
}

class Demo
{
    static void Main()
    {
        var list = new SinglyLinkedList();
        list.AddLast(1); list.AddLast(2); list.AddLast(4);
        list.InsertAt(2, 3);
        list.AddFirst(0);
        Console.WriteLine(list);          // 0 -> 1 -> 2 -> 3 -> 4
        list.Remove(0); list.Remove(4);
        Console.WriteLine(list);          // 1 -> 2 -> 3
        Console.WriteLine(list.Contains(2)); // True
    }
}` },
    { lang: 'csharp', title: 'Classic problems: reverse, middle, cycle, merge, nth from end', code: `using System;

public class ListNode
{
    public int Val; public ListNode? Next;
    public ListNode(int v, ListNode? next = null) { Val = v; Next = next; }
}

static class Problems
{
    // Reverse iteratively. O(n) time, O(1) space.
    public static ListNode? Reverse(ListNode? head)
    {
        ListNode? prev = null, cur = head;
        while (cur != null)
        {
            var next = cur.Next;   // save
            cur.Next = prev;       // flip
            prev = cur;            // advance
            cur = next;
        }
        return prev;
    }

    // Reverse recursively. O(n) time, O(n) stack.
    public static ListNode? ReverseRec(ListNode? head)
    {
        if (head == null || head.Next == null) return head;
        var newHead = ReverseRec(head.Next);
        head.Next.Next = head;     // make the next node point back to me
        head.Next = null;
        return newHead;
    }

    // Middle node with slow/fast pointers. For even length returns the second middle.
    public static ListNode? Middle(ListNode? head)
    {
        ListNode? slow = head, fast = head;
        while (fast != null && fast.Next != null)
        {
            slow = slow!.Next;
            fast = fast.Next.Next;
        }
        return slow;
    }

    // Floyd's cycle detection. Returns the node where the cycle starts, or null.
    public static ListNode? CycleStart(ListNode? head)
    {
        ListNode? slow = head, fast = head;
        while (fast != null && fast.Next != null)
        {
            slow = slow!.Next; fast = fast.Next.Next;
            if (slow == fast)                       // they met inside the cycle
            {
                var p = head;
                while (p != slow) { p = p!.Next; slow = slow!.Next; }
                return p;                           // entry of the cycle
            }
        }
        return null;
    }

    // Merge two sorted lists by rewiring nodes. O(n + m).
    public static ListNode? MergeSorted(ListNode? a, ListNode? b)
    {
        var dummy = new ListNode(0);
        var tail = dummy;
        while (a != null && b != null)
        {
            if (a.Val <= b.Val) { tail.Next = a; a = a.Next; }
            else                { tail.Next = b; b = b.Next; }
            tail = tail.Next;
        }
        tail.Next = a ?? b;                           // attach the leftovers
        return dummy.Next;
    }

    // Remove nth node from the end in one pass, with a dummy head.
    public static ListNode? RemoveNthFromEnd(ListNode? head, int n)
    {
        var dummy = new ListNode(0, head);
        ListNode? fast = dummy, slow = dummy;
        for (int i = 0; i < n; i++) fast = fast!.Next;   // gap of n
        while (fast!.Next != null) { fast = fast.Next; slow = slow!.Next; }
        slow!.Next = slow.Next!.Next;                 // skip the target
        return dummy.Next;
    }

    static string Show(ListNode? h) { var s = ""; for (; h != null; h = h.Next) s += h.Val + (h.Next != null ? "->" : ""); return s; }

    static void Main()
    {
        var l = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4, new ListNode(5)))));
        Console.WriteLine(Show(Reverse(l)));                 // 5->4->3->2->1
        l = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4, new ListNode(5)))));
        Console.WriteLine(Middle(l)!.Val);                   // 3
        Console.WriteLine(Show(RemoveNthFromEnd(l, 2)));     // 1->2->3->5
        var a = new ListNode(1, new ListNode(4)); var b = new ListNode(2, new ListNode(3));
        Console.WriteLine(Show(MergeSorted(a, b)));          // 1->2->3->4
    }
}` },
    { lang: 'csharp', title: 'Doubly and circular lists, plus .NET LinkedList<T>', code: `using System;
using System.Collections.Generic;

// Doubly linked node: delete in O(1) when you hold the node.
public class DNode
{
    public int Val; public DNode? Prev, Next;
    public DNode(int v) => Val = v;
}

public class DoublyLinkedList
{
    public DNode? Head, Tail;

    public DNode AddLast(int v)
    {
        var n = new DNode(v) { Prev = Tail };
        if (Tail == null) Head = n; else Tail.Next = n;
        Tail = n;
        return n;
    }

    public void Remove(DNode n)          // O(1): no need to search for the previous node
    {
        if (n.Prev != null) n.Prev.Next = n.Next; else Head = n.Next;
        if (n.Next != null) n.Next.Prev = n.Prev; else Tail = n.Prev;
        n.Prev = n.Next = null;
    }

    public void MoveToFront(DNode n)     // used by LRU caches
    {
        if (n == Head) return;
        Remove(n);
        n.Next = Head; Head!.Prev = n; Head = n;
        if (Tail == null) Tail = n;
    }
}

// Circular singly linked list: last node points back to head (round-robin scheduling, playlists)
public class CircularList
{
    private Node? tail;   // keep tail; head is tail.Next
    class Node { public int Val; public Node? Next; public Node(int v) => Val = v; }

    public void Add(int v)
    {
        var n = new Node(v);
        if (tail == null) { tail = n; n.Next = n; }
        else { n.Next = tail.Next; tail.Next = n; tail = n; }
    }

    public void PrintOnce()
    {
        if (tail == null) return;
        var cur = tail.Next;
        do { Console.Write(cur!.Val + " "); cur = cur.Next; } while (cur != tail.Next);
        Console.WriteLine();
    }
}

class Demo
{
    static void Main()
    {
        // .NET's built-in doubly linked list
        var ll = new LinkedList<string>();
        var b = ll.AddLast("b");
        ll.AddFirst("a");
        ll.AddAfter(b, "c");
        ll.Remove(b);                                   // O(1) with the node handle
        Console.WriteLine(string.Join(" ", ll));        // a c
        for (var node = ll.Last; node != null; node = node.Previous)
            Console.Write(node.Value + " ");            // walk backwards: c a
        Console.WriteLine();

        var c = new CircularList();
        c.Add(1); c.Add(2); c.Add(3);
        c.PrintOnce();                                  // 1 2 3
    }
}` },
    { lang: 'csharp', title: 'LRU cache with Dictionary + LinkedList (O(1) get and put)', code: `using System;
using System.Collections.Generic;

public class LruCache<TKey, TValue> where TKey : notnull
{
    private readonly int capacity;
    private readonly Dictionary<TKey, LinkedListNode<(TKey Key, TValue Value)>> map = new();
    private readonly LinkedList<(TKey Key, TValue Value)> order = new();   // front = most recent

    public LruCache(int capacity)
    {
        if (capacity <= 0) throw new ArgumentOutOfRangeException(nameof(capacity));
        this.capacity = capacity;
    }

    public bool TryGet(TKey key, out TValue value)
    {
        if (map.TryGetValue(key, out var node))
        {
            order.Remove(node);              // O(1): we hold the node
            order.AddFirst(node);            // mark as most recently used
            value = node.Value.Value;
            return true;
        }
        value = default!;
        return false;
    }

    public void Put(TKey key, TValue value)
    {
        if (map.TryGetValue(key, out var existing))
        {
            order.Remove(existing);
            existing.Value = (key, value);
            order.AddFirst(existing);
            return;
        }
        if (map.Count == capacity)
        {
            var oldest = order.Last!;        // least recently used sits at the back
            map.Remove(oldest.Value.Key);
            order.RemoveLast();
        }
        var node = new LinkedListNode<(TKey, TValue)>((key, value));
        order.AddFirst(node);
        map[key] = node;
    }

    public int Count => map.Count;
}

class Demo
{
    static void Main()
    {
        var cache = new LruCache<int, string>(2);
        cache.Put(1, "one");
        cache.Put(2, "two");
        cache.TryGet(1, out _);              // 1 is now most recent
        cache.Put(3, "three");               // evicts 2 (least recently used)
        Console.WriteLine(cache.TryGet(2, out _));        // False
        Console.WriteLine(cache.TryGet(1, out var v) ? v : "miss");   // one
        Console.WriteLine(cache.TryGet(3, out var w) ? w : "miss");   // three
    }
}` }
  ],
  pitfalls: [
    'Rewiring in the wrong order (prev.Next = newNode before newNode.Next = prev.Next) and losing the rest of the list.',
    'Forgetting to update tail (or head) when removing the last (or first) node, leaving a dangling pointer.',
    'Not handling the empty list and the single-node list. Test both every time.',
    'Walking off the end: accessing fast.Next.Next without checking fast.Next != null first.',
    'Using LinkedList<T> for performance when List<T> would be faster due to cache locality. Measure before choosing.',
    'In recursive reverse, forgetting head.Next = null, which creates a cycle.'
  ],
  quiz: [
    { q: 'What is the cost of getting the 500th element of a singly linked list?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 2, why: 'There is no index. You must follow 499 Next pointers from the head.' },
    { q: 'Why does a doubly linked list allow O(1) deletion of a node you already hold?', options: ['Because its nodes are kept in sorted order', 'Because the node knows its previous node', 'Because it keeps a tail pointer to the last node', 'It does not; deletion is O(n) in every linked list'], answer: 1, why: 'With Prev available you set prev.Next = next and next.Prev = prev directly.' },
    { q: 'In Floyd\'s algorithm, why will the fast pointer meet the slow one if there is a cycle?', options: ['Because they start at different nodes and walk toward each other', 'Because inside the cycle the gap shrinks by one each step', 'Because the node values in the list are sorted', 'Because fast stops at the tail and waits for slow'], answer: 1, why: 'Fast gains one node per step on slow. Within a cycle of length c, the gap goes through every value and hits 0 within c steps.' },
    { q: 'What does the dummy head trick remove?', options: ['The need to keep a tail pointer for the list', 'Special-case code for the first node', 'The need for recursion when reversing', 'Every null check in the whole method'], answer: 1, why: 'With a dummy node in front, the real head has a previous node like everyone else, so insert/delete code is uniform.' },
    { q: 'Which combination gives an LRU cache O(1) get and put?', options: ['Sorted array + binary search', 'Dictionary + doubly linked list', 'Two stacks', 'SortedDictionary + a counter'], answer: 1, why: 'The dictionary finds the node instantly; the doubly linked list moves it to the front or evicts from the back in O(1).' },
    { q: 'Why is List<T> often faster than LinkedList<T> even for middle insertions?', options: ['List<T> keeps its items in a balanced tree inside', 'Contiguous memory is cache friendly; shifting is cheap', 'LinkedList<T> is single-threaded while List<T> uses all cores', 'List<T> is unmanaged memory, so the GC never touches it'], answer: 1, why: 'Big-O hides constants. Cache misses dominate on scattered nodes, while memmove on a contiguous array is very fast.' }
  ],
  takeaways: [
    'A linked list is nodes with pointers; O(1) insert/delete at a known node, O(n) to reach a position.',
    'Rewire carefully: point the new node at next first, then update the previous node.',
    'Dummy head, slow/fast pointers and "rewire instead of copy" solve most interview problems.',
    'Floyd: slow and fast meet if there is a cycle; reset one to head to find the entry.',
    'LRU cache = Dictionary for lookup + doubly linked list for recency order.',
    'In real C#, prefer List<T> unless you need O(1) splice with node handles; cache locality wins.'
  ],
  interview: [
    { q: 'Detect a cycle in a linked list without extra memory.', a: `<p>Use two pointers, slow moving one step and fast two. If fast reaches null, no cycle. If they ever point to the same node, there is a cycle. To find its start, reset one pointer to the head and advance both one step until they meet.</p>` },
    { q: 'Reverse a linked list in groups of k.', a: `<p>Check that at least k nodes remain; if not, return head as is. Reverse the first k nodes with the three-pointer method, then set the original first node's Next to the result of recursively reversing the rest. Iterative versions use a dummy head and track the group's previous tail.</p>` },
    { q: 'Find the intersection node of two singly linked lists.', a: `<p>Walk pointer A through list 1 then list 2, and pointer B through list 2 then list 1. Both travel the same total distance, so they meet at the intersection node (or both reach null). O(n + m) time, O(1) space.</p>` },
    { q: 'When would you choose a linked list over an array in production?', a: `<p>When you need O(1) insertion or removal while holding a node reference, such as an LRU cache, a scheduler's run queue, or an intrusive list where objects know their own position. For plain sequences, iteration and indexing, arrays and List&lt;T&gt; are faster and smaller.</p>` }
  ]
};
/* ───────────────────────── m2-stacks-queues ───────────────────────── */
window.CONTENT['m2-stacks-queues'] = {
  hook: `Undo in your editor, the Back button, matching brackets, and the "next greater element" trick all come from one tiny rule: last in, first out. Queues flip the rule and run every line you have ever waited in.`,
  intro: `<p>A <span class="term">stack</span> is a list where you only add and remove at one end, the top. The last item you put in is the first one you take out: <span class="term">LIFO</span>. Its operations are <code>Push</code> (add), <code>Pop</code> (remove the top) and <code>Peek</code> (look at the top without removing).</p>
<p>A <span class="term">queue</span> is a list where you add at the back and remove from the front. The first item in is the first out: <span class="term">FIFO</span>. Its operations are <code>Enqueue</code> (add at back) and <code>Dequeue</code> (remove from front).</p>
<p>A <span class="term">deque</span> (double-ended queue) lets you add and remove at both ends. It powers the sliding window maximum trick.</p>
<p>These are simple structures, but a huge number of problems fall to them: checking balanced brackets, evaluating expressions, undo/redo, breadth-first search, scheduling tasks, and the family of "monotonic stack" problems like next greater element and largest rectangle in a histogram.</p>`,
  realLife: {
    title: 'A stack of plates and a coffee shop line',
    body: `<p>Clean plates in a café are stacked. The washer puts a plate on top; the server takes the top one. Nobody pulls from the middle. That is a stack. The customers waiting to order form a queue: whoever arrived first is served first, new people join at the back.</p>
<p>Software is full of both. Every method call in your C# program goes on the call stack, and when it returns it is popped. Ctrl+Z is a stack of edits. The browser's Back button pops a stack of pages. On the queue side: a printer's job queue, the ASP.NET Core request pipeline's thread pool work items, Azure Service Bus and RabbitMQ (literally message queues), and the BFS algorithm that finds the shortest path in a maze or a social graph.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Stack in C#</h4>
<p><code>Stack&lt;T&gt;</code> gives you <code>Push</code>, <code>Pop</code>, <code>Peek</code>, <code>Count</code>, and <code>TryPop</code>/<code>TryPeek</code> for safe use. Popping an empty stack throws <code>InvalidOperationException</code>, so check <code>Count</code> or use the Try methods.</p>
<h4>Queue in C#</h4>
<p><code>Queue&lt;T&gt;</code> gives <code>Enqueue</code>, <code>Dequeue</code>, <code>Peek</code> and the Try versions. Both classes are backed by arrays that grow as needed, so all operations are O(1) on average.</p>
<h4>Building them yourself</h4>
<p>A stack over an array is just an array and a <code>top</code> index. Push writes at top and increments; pop decrements and reads. A queue over an array is trickier: if you always remove from index 0 and shift everything, dequeue is O(n). The fix is a <span class="term">circular queue</span>: keep <code>head</code> and <code>tail</code> indices that wrap around using modulo, so nothing ever shifts. A linked list also works for both: push/pop at the head for a stack; enqueue at the tail and dequeue at the head for a queue.</p>
<h4>Balanced brackets: the first stack problem</h4>
<p>Walk the string. When you see an opening bracket, push it. When you see a closing bracket, the top of the stack must be its matching opener; pop it. If it does not match, or the stack is empty, the string is invalid. At the end, the stack must be empty. Compilers use exactly this to check your code.</p>
<h4>When to reach for which</h4>
<ul>
<li>Need to "go back" or reverse something? Stack.</li>
<li>Need to process things in arrival order? Queue.</li>
<li>Exploring a tree or graph level by level? Queue (BFS). Going deep first? Stack (DFS).</li>
<li>Need the most recent unmatched thing? Stack.</li>
</ul>
<div class="callout tip"><p>Recursion is a stack in disguise. Any recursive algorithm can be rewritten with an explicit Stack&lt;T&gt;, which is how you avoid stack overflows on deep inputs.</p></div>` },
    { name: 'Intermediate', body: `<h4>Expression evaluation</h4>
<p>Postfix notation (also called Reverse Polish) writes the operator after its operands: "3 4 +" means 3 + 4. Evaluate it with a stack: push numbers; when you see an operator, pop two, apply, push the result. No brackets needed. Converting infix ("3 + 4 * 2") to postfix is the shunting-yard algorithm, which uses a stack of operators ordered by precedence. Calculators and many interpreters do this.</p>
<h4>Min stack</h4>
<p>A stack that also returns the minimum in O(1). Keep a second stack of minimums: when pushing x, push <code>min(x, currentMin)</code> onto the min stack; when popping, pop both. The top of the min stack is always the current minimum.</p>
<h4>Queue from two stacks</h4>
<p>Push every enqueue onto an "in" stack. On dequeue, if the "out" stack is empty, pour everything from in to out (which reverses the order), then pop from out. Each element moves at most twice, so operations are O(1) amortized. This is a favourite interview question because it tests whether you understand amortized cost.</p>
<h4>Monotonic stack: next greater element</h4>
<p>For each item, find the next item to its right that is bigger. Brute force is O(n²). Instead keep a stack of indices whose answer is not yet known, kept in decreasing value order. When a new value arrives, pop every index whose value is smaller than it; the new value is their answer. Push the new index. Each index is pushed and popped once: O(n). The same pattern solves daily temperatures, stock span, and largest rectangle in a histogram.</p>
<h4>Deque and sliding window maximum</h4>
<p>To get the maximum of every window of size k, keep a deque of indices with values in decreasing order. For each new index: pop from the back while the back's value is smaller (it can never be a maximum again), push the index, pop from the front if it fell out of the window. The front is the window's maximum. O(n) total. C# has no built-in deque; use <code>LinkedList&lt;int&gt;</code> or write a small circular-buffer deque.</p>
<div class="callout warn"><p>The two amortized tricks (two-stack queue, monotonic stack) are O(1) per operation on average, but a single call can be O(n). Say "amortized" when you explain them.</p></div>` },
    { name: 'Expert', body: `<h4>How .NET implements them</h4>
<p><code>Stack&lt;T&gt;</code> is an array plus a size counter; push beyond capacity doubles the array (amortized O(1)). <code>Queue&lt;T&gt;</code> is a circular buffer with head and tail indices, also doubling on growth; when it grows it copies elements in order so the new buffer is linear again. Neither is thread safe. For producers and consumers across threads use <code>ConcurrentQueue&lt;T&gt;</code> (lock-free, segment linked list), <code>ConcurrentStack&lt;T&gt;</code>, or <code>System.Threading.Channels</code> for async bounded queues with back-pressure.</p>
<h4>Priority queue is not a queue</h4>
<p><code>PriorityQueue&lt;TElement, TPriority&gt;</code> dequeues the smallest priority first, not the oldest. It is a heap with O(log n) enqueue/dequeue, and it is covered in the Heaps topic. Do not confuse it with FIFO ordering; equal priorities are not guaranteed FIFO.</p>
<h4>Largest rectangle in a histogram</h4>
<p>The showcase monotonic stack problem. Keep a stack of indices with increasing heights. When a shorter bar arrives, pop taller bars; each popped bar's rectangle extends from the new stack top + 1 to the current index - 1. Append a sentinel height 0 at the end to flush the stack. O(n). The 2D version (maximal rectangle in a binary matrix) runs this per row.</p>
<h4>Stacks in systems</h4>
<ul>
<li>The CLR evaluation stack: IL is a stack machine; the JIT turns it into registers.</li>
<li>Call stacks and async: an <code>await</code> that really has to wait saves a continuation on the heap instead of holding a stack frame, so a long chain of waiting async calls does not fill the stack.</li>
<li>Undo/redo: two stacks. Undo pops from the undo stack onto redo; a new action clears redo.</li>
<li>Parsers: recursive descent parsers use the call stack; LR parsers use an explicit state stack.</li>
</ul>
<h4>Queues in systems</h4>
<p>Message queues decouple producers and consumers and absorb bursts. The design questions are the same as the data structure's: bounded or unbounded? what happens when full (block, drop, overflow to disk)? FIFO guaranteed across partitions? Kafka keeps per-partition FIFO; SQS standard queues do not. Those trade-offs are the subject of the HLD queue topic.</p>
<div class="callout idea"><p>Interviewers often follow "implement a queue with two stacks" with "what is the worst-case cost of one dequeue?" The answer is O(n) for that one call, O(1) amortized over many. Be ready to prove it by counting moves per element.</p></div>` }
  ],
  flow: {
    title: 'Next greater element with a monotonic stack: [2, 1, 5, 3, 4]',
    steps: [
      { title: 'i = 0, value 2', desc: 'Stack is empty. Push index 0. Stack (values): [2].' },
      { title: 'i = 1, value 1', desc: '1 is not greater than 2, so nothing resolves. Push index 1. Stack: [2, 1] (decreasing).' },
      { title: 'i = 2, value 5', desc: '5 > 1: pop index 1, answer[1] = 5. 5 > 2: pop index 0, answer[0] = 5. Push index 2. Stack: [5].' },
      { title: 'i = 3, value 3', desc: '3 < 5, nothing resolves. Push. Stack: [5, 3].' },
      { title: 'i = 4, value 4', desc: '4 > 3: pop index 3, answer[3] = 4. 4 < 5, stop. Push. Stack: [5, 4].' },
      { title: 'End', desc: 'Indices left on the stack (2 and 4) have no greater element: answer -1. Result: [5, 5, -1, 4, -1].' },
      { title: 'Why O(n)', desc: 'Every index is pushed once and popped at most once, so the total work is linear even though there is a loop inside a loop.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Stack and queue from scratch: array stack, circular queue, linked-list versions', code: `using System;

// ---- Stack on an array: all operations O(1) amortized ----
public class ArrayStack<T>
{
    private T[] items = new T[4];
    private int top;                         // number of items; next free slot

    public int Count => top;
    public void Push(T item)
    {
        if (top == items.Length) Array.Resize(ref items, items.Length * 2);
        items[top++] = item;
    }
    public T Pop()
    {
        if (top == 0) throw new InvalidOperationException("Stack is empty");
        T item = items[--top];
        items[top] = default!;               // let the GC collect it
        return item;
    }
    public T Peek() => top == 0 ? throw new InvalidOperationException("Stack is empty") : items[top - 1];
}

// ---- Circular queue on an array: O(1) enqueue and dequeue, no shifting ----
public class CircularQueue<T>
{
    private T[] items;
    private int head, count;                 // head = index of the front item

    public CircularQueue(int capacity = 4) => items = new T[capacity];
    public int Count => count;

    public void Enqueue(T item)
    {
        if (count == items.Length) Grow();
        int tail = (head + count) % items.Length;   // wrap around
        items[tail] = item;
        count++;
    }
    public T Dequeue()
    {
        if (count == 0) throw new InvalidOperationException("Queue is empty");
        T item = items[head];
        items[head] = default!;
        head = (head + 1) % items.Length;
        count--;
        return item;
    }
    private void Grow()
    {
        var bigger = new T[items.Length * 2];
        for (int i = 0; i < count; i++)
            bigger[i] = items[(head + i) % items.Length];   // copy in logical order
        items = bigger; head = 0;
    }
}

// ---- Queue on a linked list: O(1) at both ends with head and tail pointers ----
public class LinkedQueue<T>
{
    class Node { public T Val; public Node? Next; public Node(T v) => Val = v; }
    private Node? head, tail;
    public int Count { get; private set; }

    public void Enqueue(T v)
    {
        var n = new Node(v);
        if (tail == null) head = tail = n; else { tail.Next = n; tail = n; }
        Count++;
    }
    public T Dequeue()
    {
        if (head == null) throw new InvalidOperationException("Queue is empty");
        T v = head.Val;
        head = head.Next;
        if (head == null) tail = null;
        Count--;
        return v;
    }
}

class Demo
{
    static void Main()
    {
        var s = new ArrayStack<int>();
        s.Push(1); s.Push(2); s.Push(3);
        Console.WriteLine(s.Pop() + " " + s.Peek());     // 3 2

        var q = new CircularQueue<string>(2);
        q.Enqueue("a"); q.Enqueue("b"); q.Enqueue("c"); // triggers Grow
        Console.WriteLine(q.Dequeue() + q.Dequeue() + q.Dequeue());   // abc
    }
}` },
    { lang: 'csharp', title: 'Classic stack problems: balanced brackets, postfix evaluation, min stack', code: `using System;
using System.Collections.Generic;

static class StackProblems
{
    // Balanced brackets. O(n) time, O(n) space.
    public static bool IsBalanced(string s)
    {
        var pairs = new Dictionary<char, char> { [')'] = '(', [']'] = '[', ['}'] = '{' };
        var stack = new Stack<char>();
        foreach (char ch in s)
        {
            if (ch is '(' or '[' or '{') stack.Push(ch);
            else if (pairs.TryGetValue(ch, out char open))
            {
                if (stack.Count == 0 || stack.Pop() != open) return false;
            }
        }
        return stack.Count == 0;
    }

    // Evaluate postfix (Reverse Polish): "3 4 + 2 *" = 14. O(n)
    public static double EvalPostfix(string expr)
    {
        var stack = new Stack<double>();
        foreach (var token in expr.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            if (double.TryParse(token, out double num)) { stack.Push(num); continue; }
            double b = stack.Pop(), a = stack.Pop();        // order matters for - and /
            stack.Push(token switch
            {
                "+" => a + b,
                "-" => a - b,
                "*" => a * b,
                "/" => a / b,
                _ => throw new ArgumentException("Unknown operator " + token)
            });
        }
        return stack.Pop();
    }

    // Infix -> postfix (shunting-yard) for + - * / and brackets
    public static string ToPostfix(string infix)
    {
        var prec = new Dictionary<string, int> { ["+"] = 1, ["-"] = 1, ["*"] = 2, ["/"] = 2 };
        var output = new List<string>();
        var ops = new Stack<string>();
        foreach (var t in infix.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            if (double.TryParse(t, out _)) output.Add(t);
            else if (t == "(") ops.Push(t);
            else if (t == ")") { while (ops.Peek() != "(") output.Add(ops.Pop()); ops.Pop(); }
            else
            {
                while (ops.Count > 0 && ops.Peek() != "(" && prec[ops.Peek()] >= prec[t]) output.Add(ops.Pop());
                ops.Push(t);
            }
        }
        while (ops.Count > 0) output.Add(ops.Pop());
        return string.Join(" ", output);
    }

    static void Main()
    {
        Console.WriteLine(IsBalanced("{[()]}"));         // True
        Console.WriteLine(IsBalanced("([)]"));           // False
        var pf = ToPostfix("3 + 4 * ( 2 - 1 )");
        Console.WriteLine(pf);                           // 3 4 2 1 - * +
        Console.WriteLine(EvalPostfix(pf));              // 7
        var ms = new MinStack();
        ms.Push(5); ms.Push(2); ms.Push(7);
        Console.WriteLine(ms.Min);                       // 2
        ms.Pop(); ms.Pop();
        Console.WriteLine(ms.Min);                       // 5
    }
}

// Stack with O(1) minimum, using a parallel stack of running minimums
public class MinStack
{
    private readonly Stack<int> values = new(), mins = new();
    public void Push(int x)
    {
        values.Push(x);
        mins.Push(mins.Count == 0 ? x : Math.Min(x, mins.Peek()));
    }
    public int Pop() { mins.Pop(); return values.Pop(); }
    public int Top => values.Peek();
    public int Min => mins.Peek();
}` },
    { lang: 'csharp', title: 'Queue via two stacks, next greater element, stock span, largest rectangle', code: `using System;
using System.Collections.Generic;

// Queue built from two stacks: O(1) amortized per operation
public class TwoStackQueue<T>
{
    private readonly Stack<T> inbox = new(), outbox = new();
    public void Enqueue(T item) => inbox.Push(item);
    public T Dequeue()
    {
        if (outbox.Count == 0)
            while (inbox.Count > 0) outbox.Push(inbox.Pop());   // pour: reverses order
        if (outbox.Count == 0) throw new InvalidOperationException("Queue is empty");
        return outbox.Pop();
    }
    public int Count => inbox.Count + outbox.Count;
}

static class MonotonicStack
{
    // Next greater element to the right, or -1. O(n)
    public static int[] NextGreater(int[] a)
    {
        var result = new int[a.Length];
        Array.Fill(result, -1);
        var stack = new Stack<int>();                 // indices with decreasing values
        for (int i = 0; i < a.Length; i++)
        {
            while (stack.Count > 0 && a[stack.Peek()] < a[i])
                result[stack.Pop()] = a[i];           // a[i] is their answer
            stack.Push(i);
        }
        return result;
    }

    // Stock span: for each day, how many consecutive previous days had price <= today. O(n)
    public static int[] StockSpan(int[] price)
    {
        var span = new int[price.Length];
        var stack = new Stack<int>();                 // indices with decreasing prices
        for (int i = 0; i < price.Length; i++)
        {
            while (stack.Count > 0 && price[stack.Peek()] <= price[i]) stack.Pop();
            span[i] = stack.Count == 0 ? i + 1 : i - stack.Peek();
            stack.Push(i);
        }
        return span;
    }

    // Largest rectangle in a histogram. O(n)
    public static int LargestRectangle(int[] h)
    {
        var stack = new Stack<int>();                 // indices with increasing heights
        int best = 0;
        for (int i = 0; i <= h.Length; i++)
        {
            int cur = i == h.Length ? 0 : h[i];       // sentinel 0 flushes the stack
            while (stack.Count > 0 && h[stack.Peek()] >= cur)
            {
                int height = h[stack.Pop()];
                int left = stack.Count == 0 ? -1 : stack.Peek();
                best = Math.Max(best, height * (i - left - 1));
            }
            stack.Push(i);
        }
        return best;
    }

    static void Main()
    {
        var q = new TwoStackQueue<int>();
        q.Enqueue(1); q.Enqueue(2); Console.Write(q.Dequeue() + " "); q.Enqueue(3);
        Console.WriteLine(q.Dequeue() + " " + q.Dequeue());                    // 1 2 3
        Console.WriteLine(string.Join(",", NextGreater(new[] { 2, 1, 5, 3, 4 })));   // 5,5,-1,4,-1
        Console.WriteLine(string.Join(",", StockSpan(new[] { 100, 80, 60, 70, 60, 75, 85 }))); // 1,1,1,2,1,4,6
        Console.WriteLine(LargestRectangle(new[] { 2, 1, 5, 6, 2, 3 }));        // 10
    }
}` },
    { lang: 'csharp', title: 'Deque and sliding window maximum, plus BFS with a queue', code: `using System;
using System.Collections.Generic;

// Simple deque on a circular buffer: O(1) at both ends
public class Deque<T>
{
    private T[] buf = new T[4];
    private int head, count;
    public int Count => count;

    public void PushBack(T v) { EnsureRoom(); buf[(head + count) % buf.Length] = v; count++; }
    public void PushFront(T v) { EnsureRoom(); head = (head - 1 + buf.Length) % buf.Length; buf[head] = v; count++; }
    public T PopFront() { var v = buf[head]; buf[head] = default!; head = (head + 1) % buf.Length; count--; return v; }
    public T PopBack() { int i = (head + count - 1) % buf.Length; var v = buf[i]; buf[i] = default!; count--; return v; }
    public T PeekFront() => buf[head];
    public T PeekBack() => buf[(head + count - 1) % buf.Length];

    private void EnsureRoom()
    {
        if (count < buf.Length) return;
        var bigger = new T[buf.Length * 2];
        for (int i = 0; i < count; i++) bigger[i] = buf[(head + i) % buf.Length];
        buf = bigger; head = 0;
    }
}

static class WindowAndBfs
{
    // Maximum of every window of size k. O(n) using a deque of indices (values decreasing)
    public static int[] SlidingWindowMax(int[] a, int k)
    {
        var result = new int[a.Length - k + 1];
        var dq = new Deque<int>();
        for (int i = 0; i < a.Length; i++)
        {
            while (dq.Count > 0 && a[dq.PeekBack()] <= a[i]) dq.PopBack();   // smaller ones can never win
            dq.PushBack(i);
            if (dq.PeekFront() <= i - k) dq.PopFront();                     // front fell out of the window
            if (i >= k - 1) result[i - k + 1] = a[dq.PeekFront()];
        }
        return result;
    }

    // BFS on a grid: shortest number of steps from start to target through '.' cells
    public static int ShortestPath(char[,] grid, (int r, int c) start, (int r, int c) target)
    {
        int rows = grid.GetLength(0), cols = grid.GetLength(1);
        var dist = new int[rows, cols];
        for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) dist[r, c] = -1;
        var queue = new Queue<(int r, int c)>();
        queue.Enqueue(start); dist[start.r, start.c] = 0;
        int[] dr = { 1, -1, 0, 0 }, dc = { 0, 0, 1, -1 };
        while (queue.Count > 0)
        {
            var (r, c) = queue.Dequeue();                  // FIFO = explore level by level
            if ((r, c) == target) return dist[r, c];
            for (int k = 0; k < 4; k++)
            {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
                if (grid[nr, nc] == '#' || dist[nr, nc] != -1) continue;
                dist[nr, nc] = dist[r, c] + 1;
                queue.Enqueue((nr, nc));
            }
        }
        return -1;
    }

    static void Main()
    {
        Console.WriteLine(string.Join(",", SlidingWindowMax(new[] { 1, 3, -1, -3, 5, 3, 6, 7 }, 3)));   // 3,3,5,5,6,7
        var grid = new[,] { { '.', '.', '#' }, { '#', '.', '.' }, { '.', '.', '.' } };
        Console.WriteLine(ShortestPath(grid, (0, 0), (2, 2)));   // 4
    }
}` }
  ],
  pitfalls: [
    'Popping or peeking an empty Stack<T>/Queue<T>: it throws. Check Count or use TryPop/TryDequeue.',
    'Implementing a queue with List<T>.RemoveAt(0). That shifts every element: O(n) per dequeue. Use Queue<T> or a circular buffer.',
    'In postfix evaluation, popping operands in the wrong order. For "5 3 -", b = 3 is popped first, then a = 5; the answer is a - b.',
    'In a monotonic stack, using the wrong comparison (< vs <=) and getting wrong answers for equal values. Decide what equal means for the problem.',
    'Forgetting the sentinel at the end of the histogram problem, which leaves bars on the stack unprocessed.',
    'Using Stack<T> or Queue<T> from multiple threads. They are not thread safe; use the Concurrent versions or Channels.'
  ],
  quiz: [
    { q: 'Which structure gives you the most recently added item first?', options: ['Queue', 'Stack', 'Deque only', 'Dictionary'], answer: 1, why: 'A stack is LIFO: the last pushed item is the first popped.' },
    { q: 'Why does a circular queue avoid shifting elements?', options: ['It uses a linked list, so there is nothing to shift', 'Head and tail indices wrap around with modulo', 'It stores items in reverse, so the front is the last slot', 'It sorts the elements so the front is always index 0'], answer: 1, why: 'Dequeue only advances the head index. The freed slot is reused when tail wraps around.' },
    { q: 'What is the amortized cost of dequeue in a two-stack queue?', options: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], answer: 2, why: 'Each element is moved from the in-stack to the out-stack at most once in its life, so the total work over n operations is O(n).' },
    { q: 'A monotonic stack solves next-greater-element in O(n) because:', options: ['The array is sorted before the scan starts', 'Each index is pushed once and popped at most once', 'It uses binary search on the stack for every element', 'It uses two pointers that move toward each other'], answer: 1, why: 'The inner while loop pops, but every element can only be popped once, so total pops ≤ n.' },
    { q: 'Which traversal uses a queue?', options: ['Depth-first search', 'Breadth-first search', 'In-order traversal', 'Backtracking'], answer: 1, why: 'BFS explores level by level in arrival order, which is FIFO.' },
    { q: 'What extra structure gives a min stack O(1) Min() while Push and Pop stay O(1)?', options: ['A sorted list of every value pushed so far', 'A second stack of running minimums', 'A dictionary from each value to its count', 'A min-heap holding every value'], answer: 1, why: 'The top of the parallel stack always equals the minimum of the current contents, and it is popped in step with the main stack.' }
  ],
  takeaways: [
    'Stack = LIFO (push/pop at the top). Queue = FIFO (enqueue at back, dequeue at front). Deque = both ends.',
    'Array stack is trivial; array queue needs a circular buffer so dequeue does not shift.',
    'Balanced brackets, expression evaluation, undo, and DFS are stack problems; BFS and scheduling are queue problems.',
    'Monotonic stack: pop while the new value beats the top. Solves next greater, stock span, histogram in O(n).',
    'Deque of indices gives sliding window maximum in O(n).',
    'Two-stack queue and monotonic stack are O(1) amortized; a single operation can be O(n).'
  ],
  interview: [
    { q: 'Implement a stack using a single queue.', a: `<p>On push, enqueue the item, then rotate the queue by dequeuing and re-enqueuing the previous Count - 1 items so the new item is at the front. Pop and peek then take from the front. Push is O(n), pop is O(1).</p>` },
    { q: 'How would you check whether the tags of an HTML document are properly nested?', a: `<p>Tokenize into opening and closing tags, push openers on a stack, and on a closer check the top is the matching opener and pop it. Self-closing tags are ignored. Valid if the stack is empty at the end. This is the balanced-brackets algorithm with multi-character tokens.</p>` },
    { q: 'Explain how "daily temperatures" (days until a warmer day) is solved in O(n).', a: `<p>Keep a stack of indices with decreasing temperatures. For each day i, while the stack top's temperature is lower than today's, pop it and set answer[top] = i - top. Push i. Each index enters and leaves once.</p>` },
    { q: 'What is the difference between Queue<T> and PriorityQueue<TElement,TPriority>?', a: `<p>Queue&lt;T&gt; is FIFO with O(1) operations. PriorityQueue is a heap: Dequeue returns the element with the smallest priority regardless of insertion order, in O(log n). Equal priorities are not guaranteed to come out in FIFO order.</p>` }
  ]
};
