// DevPath content — Module 2: DS & Algo (part d: DP, Graphs, Advanced DSA)
// Topics: m2-dp, m2-graphs, m2-segment-trees, m2-string-matching, m2-dp-advanced, m2-graphs-advanced
window.CONTENT = window.CONTENT || {};

/* ------------------------------------------------------------------ */
/* m2-dp — Dynamic Programming                                         */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-dp'] = {
  hook: `Dynamic programming is just "do not solve the same small problem twice". Write the answer down once, and a problem that would take years to brute-force finishes in a blink.`,
  intro: `<p><span class="term">Dynamic programming</span> (DP) is a way to solve big problems by breaking them into smaller problems, solving each small problem only once, and remembering the answers. The name sounds fancy. The idea is not. It is the same trick you use when you write a multiplication table on paper instead of multiplying from scratch every time.</p>
<p>DP works when a problem has two features. First, <span class="term">overlapping subproblems</span>: the same small question comes up again and again. Second, <span class="term">optimal substructure</span>: the best answer to the big problem is built from the best answers to the small problems. If a problem has both, DP will usually turn a slow exponential solution into a fast polynomial one.</p>
<p>There are two ways to write DP. <span class="term">Memoization</span> is top-down: write the natural recursive solution, then cache the results in a dictionary or array so repeated calls return instantly. <span class="term">Tabulation</span> is bottom-up: fill a table from the smallest case up to the answer, with plain loops and no recursion.</p>
<p>This lesson walks through the classic ladder: Fibonacci, climbing stairs, house robber, knapsack, coin change, longest common subsequence, longest increasing subsequence, edit distance and grid paths. By the end you will have a repeatable recipe for spotting DP and writing the state, the transition and the base case.</p>`,
  realLife: {
    title: 'The exam that was already in the answer key',
    body: `<p>Imagine a maths teacher who sets the same 20 problems every year. The first year she solves all 20 by hand. The second year she opens last year's answer sheet and copies. That is memoization: solve once, store, reuse. Now imagine she notices that problem 7 is only hard because it needs the answers to problems 3 and 5. So she solves problems in order, 1 to 20, and each one is quick because the earlier answers are right there on the page. That is tabulation.</p>
<p>Fibonacci makes the waste obvious. To get fib(50) the naive recursion calls fib(48) twice, fib(47) three times, fib(46) five times, and so on. It makes over 20 billion calls for one number. With a cache it makes 50.</p>
<p><strong>Where companies use this:</strong> spell checkers and Git diff use edit distance and longest common subsequence (DP). Google Maps uses DP-style shortest path tables. Cloud providers use knapsack variants to pack virtual machines onto physical servers. Text editors use DP to decide where to break lines so paragraphs look even.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The two signs that scream "use DP"</h4>
<ul>
<li><strong>The same small question repeats.</strong> If you draw the recursion tree and see the same node many times, you are wasting work.</li>
<li><strong>The big answer is made from small best answers.</strong> "Cheapest way to reach step 10" is built from "cheapest way to reach step 9" and "cheapest way to reach step 8".</li>
</ul>
<h4>Climbing stairs: your first real DP</h4>
<p>You can climb 1 or 2 steps at a time. How many different ways can you reach step n? To stand on step n you came from step n-1 (one hop) or step n-2 (two hops). So ways(n) = ways(n-1) + ways(n-2). That is Fibonacci wearing a disguise. The base cases are ways(1) = 1 and ways(2) = 2.</p>
<h4>The three questions every DP needs</h4>
<ol>
<li><strong>State:</strong> what do I need to remember to describe a subproblem? For stairs it is just "which step am I on". For knapsack it is "which item am I looking at, and how much capacity is left".</li>
<li><strong>Transition:</strong> how does one state come from smaller states? This is the recurrence formula.</li>
<li><strong>Base case:</strong> what are the tiny answers I know without thinking? ways(1) = 1.</li>
</ol>
<div class="callout tip">If you can write these three lines in English, the code almost writes itself. Most DP bugs are a wrong state (missing information) or a wrong base case.</div>
<h4>Memoization vs tabulation in plain words</h4>
<div class="compare"><div><h5>Memoization (top-down)</h5><p>Write the recursive function you would naturally write. Add a dictionary. Before computing, check the dictionary. After computing, store the result. Easy to write, uses the call stack, only computes states that are actually needed.</p></div><div><h5>Tabulation (bottom-up)</h5><p>Make an array. Fill index 0, then 1, then 2, up to n, each using the earlier cells. No recursion, no stack overflow, usually faster, and you can often shrink memory to a few variables.</p></div></div>
<h4>House robber: the same idea with a choice</h4>
<p>Houses in a row hold money. You cannot rob two neighbours. At each house you choose: skip it (keep the best so far) or rob it (add its money to the best from two houses back). best(i) = max(best(i-1), best(i-2) + money[i]). Notice the pattern: a state, a choice, a max.</p>
<h4>How to spot it in an interview</h4>
<p>Words like "number of ways", "minimum cost", "maximum value", "longest", "can we reach", on a sequence or grid, with choices at each step, are DP signals. If a greedy choice can be proven wrong by a small counter-example, DP is the next thing to try.</p>` },
    { name: 'Intermediate', body: `<h4>0/1 Knapsack: the template for "take it or leave it"</h4>
<p>You have n items, each with a weight and a value, and a bag of capacity W. Each item can be taken once. Maximize value. State: dp[i][w] = best value using the first i items with capacity w. Transition: either skip item i (dp[i-1][w]) or take it if it fits (dp[i-1][w - weight[i]] + value[i]). Base: dp[0][w] = 0. Time O(n·W), space O(n·W), or O(W) if you loop capacity from high to low in a single row.</p>
<h4>Unbounded knapsack and coin change</h4>
<p>If you can take an item many times, loop capacity from low to high instead, so the row you are updating already includes the item. Coin change ("fewest coins to make amount A") is exactly this: dp[a] = min over coins c of dp[a - c] + 1. Counting the number of ways to make A is the same loop with a sum instead of a min, and coins in the outer loop so you count combinations, not orderings.</p>
<div class="callout warn">Loop order matters. Capacity high-to-low means "each item once". Capacity low-to-high means "each item unlimited". Swap them and you get a wrong answer that looks plausible.</div>
<h4>Longest common subsequence (LCS)</h4>
<p>Two strings a and b. State: dp[i][j] = LCS length of a[0..i) and b[0..j). If the last characters match, dp[i][j] = dp[i-1][j-1] + 1. Otherwise dp[i][j] = max(dp[i-1][j], dp[i][j-1]). O(n·m). This is what diff tools use to find which lines stayed the same.</p>
<h4>Edit distance</h4>
<p>Fewest insert, delete or replace operations to turn a into b. Same table as LCS but three choices: dp[i][j] = min(dp[i-1][j] + 1 (delete), dp[i][j-1] + 1 (insert), dp[i-1][j-1] + (a[i-1] == b[j-1] ? 0 : 1) (replace)). Base: dp[i][0] = i, dp[0][j] = j. Spell checkers rank suggestions by this number.</p>
<h4>Longest increasing subsequence (LIS)</h4>
<p>The O(n²) way: dp[i] = 1 + max dp[j] for all j &lt; i with a[j] &lt; a[i]. The O(n log n) way keeps a list "tails" where tails[k] is the smallest possible tail of an increasing subsequence of length k+1. For each number, binary search its position in tails and replace (or append). The length of tails is the answer. Note the list is not the subsequence itself, only its length is right.</p>
<h4>Grid paths</h4>
<p>Count paths from top-left to bottom-right moving only right or down: dp[r][c] = dp[r-1][c] + dp[r][c-1]. With obstacles, set blocked cells to 0. Minimum path sum is the same shape with min and a plus. These are the simplest 2D DPs and are great for practising space reduction to one row.</p>
<h4>Matrix chain multiplication (interval DP intro)</h4>
<p>Given matrix sizes, in what order should you multiply to do the fewest operations? State: dp[i][j] = cheapest cost to multiply matrices i..j. Transition: try every split point k between i and j. This is <span class="term">interval DP</span>: the state is a range, and you build longer ranges from shorter ones. O(n³). Burst balloons and optimal BST use the same shape.</p>` },
    { name: 'Expert', body: `<h4>Choosing memoization or tabulation on purpose</h4>
<table><thead><tr><th>Concern</th><th>Memoization</th><th>Tabulation</th></tr></thead><tbody>
<tr><td>States visited</td><td>Only reachable ones (can be a big win when the state space is sparse)</td><td>All of them</td></tr>
<tr><td>Stack depth</td><td>Recursion depth can overflow the .NET stack (default 1 MB main thread) around tens of thousands of frames</td><td>No recursion</td></tr>
<tr><td>Speed</td><td>Dictionary lookups and call overhead</td><td>Tight loops, cache-friendly arrays</td></tr>
<tr><td>Space optimization</td><td>Hard</td><td>Easy: keep only the rows you still need</td></tr>
</tbody></table>
<p>In C#, if recursion depth is a risk, run the memoized solver on a thread with a bigger stack (new Thread(work, 64 * 1024 * 1024)) or convert to tabulation.</p>
<h4>Space reduction patterns</h4>
<p>If dp[i] only depends on dp[i-1], keep two rows. If dp[i][w] depends on dp[i-1][w] and dp[i-1][w-x], one row updated right-to-left is enough. If you also need to reconstruct the choices (which items were taken), keep a separate parent table or re-run the recurrence backwards from the answer.</p>
<h4>Reconstructing the answer</h4>
<p>Interviewers often ask "and which items?" after you give the max value. Walk backwards from dp[n][W]: if dp[i][w] != dp[i-1][w], item i was taken, subtract its weight, continue. For LCS, walk from the bottom-right corner: equal characters move diagonally and are part of the answer.</p>
<h4>Counting modulo a prime</h4>
<p>"Number of ways" answers overflow long quickly. Competitive problems ask for the count mod 1_000_000_007. Apply the modulo at every addition and multiplication, and when you subtract, add the modulus first to keep the value non-negative.</p>
<h4>Failure modes to watch</h4>
<ul>
<li><strong>State is too small.</strong> If two different situations map to the same state but have different futures, the DP is wrong. Example: house robber on a circle needs an extra flag (was house 0 robbed?) or two runs.</li>
<li><strong>Wrong iteration order.</strong> Every cell must be computed after the cells it reads. In 2D, think about which neighbours you read before choosing the loop direction.</li>
<li><strong>Floating point in DP.</strong> Probabilities multiply to tiny numbers; use log-space or scale.</li>
<li><strong>O(n·W) with a huge W.</strong> If capacity is 10^9, knapsack by capacity is impossible; switch the state to value, or use meet-in-the-middle for small n.</li>
</ul>
<h4>How interviewers probe</h4>
<p>They want to hear: the recursive relation first, then the memo, then the table, then the space cut, then the reconstruction, then the complexity at each step. Say the state in one sentence before you write any code. If you cannot say it, you do not have the DP yet.</p>
<div class="callout idea">Many "hard" DP problems are an easy DP plus one extra dimension. Stock trading with at most k transactions is house-robber-style with a dimension for transactions used and a flag for holding a share.</div>` }
  ],
  flow: {
    title: 'The DP recipe, from problem to code',
    steps: [
      { title: 'Brute force first', desc: 'Write the plain recursive solution that tries every choice. It is slow but it is correct, and it shows you the shape of the subproblems.' },
      { title: 'Spot the repeats', desc: 'Draw the call tree for a small input. If the same call appears many times, you have overlapping subproblems.' },
      { title: 'Name the state', desc: 'Write one sentence: "dp[i][w] is the best value using the first i items with capacity w". Every parameter that changes the answer must be in the state.' },
      { title: 'Write the transition', desc: 'Express dp of a state as a max, min or sum over the choices available in that state, each pointing to a smaller state.' },
      { title: 'Fix the base cases', desc: 'The smallest states you know without computing: empty set, zero capacity, index past the end.' },
      { title: 'Memoize', desc: 'Add a cache to the recursive function. Check before computing, store after. Exponential becomes polynomial.' },
      { title: 'Tabulate and shrink', desc: 'Turn it into loops filling a table in dependency order. Drop rows you no longer need to cut memory.' },
      { title: 'Reconstruct and verify', desc: 'Walk the table backwards to recover the actual choices. Test on tiny inputs against the brute force.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Fibonacci three ways: naive, memoized, tabulated with O(1) space', code: `using System;
using System.Collections.Generic;

public static class Fib
{
    // 1) Naive recursion: O(2^n) time. Same calls repeated millions of times.
    public static long Naive(int n) => n < 2 ? n : Naive(n - 1) + Naive(n - 2);

    // 2) Memoization (top-down): O(n) time, O(n) space for the cache + call stack.
    private static readonly Dictionary<int, long> memo = new();
    public static long Memo(int n)
    {
        if (n < 2) return n;                       // base case
        if (memo.TryGetValue(n, out var cached)) return cached;
        long result = Memo(n - 1) + Memo(n - 2);   // transition
        memo[n] = result;                          // remember it
        return result;
    }

    // 3) Tabulation (bottom-up): O(n) time, O(1) space. No recursion, no stack risk.
    public static long Tab(int n)
    {
        if (n < 2) return n;
        long prev2 = 0, prev1 = 1;                 // fib(0), fib(1)
        for (int i = 2; i <= n; i++)
        {
            long cur = prev1 + prev2;
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }

    // Climbing stairs is the same recurrence with different base cases.
    public static long ClimbStairs(int n)
    {
        if (n <= 2) return n;
        long a = 1, b = 2;                         // ways(1), ways(2)
        for (int i = 3; i <= n; i++) { long c = a + b; a = b; b = c; }
        return b;
    }

    // House robber: at each house choose skip or rob.
    public static int Rob(int[] money)
    {
        int skipPrev = 0, robPrev = 0;             // best ending with skip / rob at previous house
        foreach (int m in money)
        {
            int newRob = skipPrev + m;             // rob this one: previous must be skipped
            int newSkip = Math.Max(skipPrev, robPrev);
            skipPrev = newSkip; robPrev = newRob;
        }
        return Math.Max(skipPrev, robPrev);
    }
}

// Console.WriteLine(Fib.Tab(90));             // 2880067194370816120
// Console.WriteLine(Fib.ClimbStairs(10));     // 89
// Console.WriteLine(Fib.Rob(new[] {2,7,9,3,1})); // 12` },
    { lang: 'csharp', title: '0/1 knapsack, unbounded coin change, and reconstructing the chosen items', code: `using System;
using System.Collections.Generic;

public static class Knapsack
{
    // 0/1 knapsack with full table so we can reconstruct. O(n*W) time and space.
    public static (int best, List<int> items) Solve01(int[] weight, int[] value, int W)
    {
        int n = weight.Length;
        var dp = new int[n + 1, W + 1];            // dp[i,w]: best value with first i items, capacity w
        for (int i = 1; i <= n; i++)
            for (int w = 0; w <= W; w++)
            {
                dp[i, w] = dp[i - 1, w];           // skip item i-1
                if (weight[i - 1] <= w)            // take it if it fits
                    dp[i, w] = Math.Max(dp[i, w], dp[i - 1, w - weight[i - 1]] + value[i - 1]);
            }

        // Walk backwards to find which items were taken.
        var chosen = new List<int>();
        int cap = W;
        for (int i = n; i >= 1; i--)
            if (dp[i, cap] != dp[i - 1, cap])      // value changed => item i-1 was taken
            {
                chosen.Add(i - 1);
                cap -= weight[i - 1];
            }
        chosen.Reverse();
        return (dp[n, W], chosen);
    }

    // Same problem, O(W) space: iterate capacity from high to low so each item is used once.
    public static int Solve01Compact(int[] weight, int[] value, int W)
    {
        var dp = new int[W + 1];
        for (int i = 0; i < weight.Length; i++)
            for (int w = W; w >= weight[i]; w--)
                dp[w] = Math.Max(dp[w], dp[w - weight[i]] + value[i]);
        return dp[W];
    }

    // Coin change (fewest coins). Unbounded: capacity from low to high. Returns -1 if impossible.
    public static int FewestCoins(int[] coins, int amount)
    {
        const int INF = int.MaxValue / 2;
        var dp = new int[amount + 1];
        Array.Fill(dp, INF);
        dp[0] = 0;
        for (int a = 1; a <= amount; a++)
            foreach (int c in coins)
                if (c <= a) dp[a] = Math.Min(dp[a], dp[a - c] + 1);
        return dp[amount] >= INF ? -1 : dp[amount];
    }

    // Number of combinations that make the amount. Coins in the OUTER loop => order does not matter.
    public static long CountWays(int[] coins, int amount)
    {
        var dp = new long[amount + 1];
        dp[0] = 1;
        foreach (int c in coins)
            for (int a = c; a <= amount; a++)
                dp[a] += dp[a - c];
        return dp[amount];
    }
}

// var (best, items) = Knapsack.Solve01(new[]{1,3,4,5}, new[]{1,4,5,7}, 7); // best 9, items [1,2]
// Knapsack.FewestCoins(new[]{1,2,5}, 11)  // 3  (5+5+1)
// Knapsack.CountWays(new[]{1,2,5}, 5)     // 4` },
    { lang: 'csharp', title: 'LCS, edit distance, LIS in O(n log n), and grid paths', code: `using System;
using System.Collections.Generic;

public static class SequenceDp
{
    // Longest common subsequence length. O(n*m).
    public static int Lcs(string a, string b)
    {
        var dp = new int[a.Length + 1, b.Length + 1];
        for (int i = 1; i <= a.Length; i++)
            for (int j = 1; j <= b.Length; j++)
                dp[i, j] = a[i - 1] == b[j - 1]
                    ? dp[i - 1, j - 1] + 1
                    : Math.Max(dp[i - 1, j], dp[i, j - 1]);
        return dp[a.Length, b.Length];
    }

    // Edit distance (Levenshtein): insert, delete, replace each cost 1. O(n*m).
    public static int EditDistance(string a, string b)
    {
        var dp = new int[a.Length + 1, b.Length + 1];
        for (int i = 0; i <= a.Length; i++) dp[i, 0] = i;   // delete all
        for (int j = 0; j <= b.Length; j++) dp[0, j] = j;   // insert all
        for (int i = 1; i <= a.Length; i++)
            for (int j = 1; j <= b.Length; j++)
            {
                int replace = dp[i - 1, j - 1] + (a[i - 1] == b[j - 1] ? 0 : 1);
                int delete = dp[i - 1, j] + 1;
                int insert = dp[i, j - 1] + 1;
                dp[i, j] = Math.Min(replace, Math.Min(delete, insert));
            }
        return dp[a.Length, b.Length];
    }

    // Longest increasing subsequence length in O(n log n) using "tails".
    public static int Lis(int[] nums)
    {
        var tails = new List<int>();               // tails[k] = smallest tail of an increasing subsequence of length k+1
        foreach (int x in nums)
        {
            int pos = tails.BinarySearch(x);       // first index with tails[pos] >= x
            if (pos < 0) pos = ~pos;
            if (pos == tails.Count) tails.Add(x);  // extends the longest
            else tails[pos] = x;                   // better (smaller) tail for that length
        }
        return tails.Count;
    }

    // Number of right/down paths in a grid with obstacles (1 = blocked). One-row DP, O(r*c) time, O(c) space.
    public static long GridPaths(int[,] grid)
    {
        int rows = grid.GetLength(0), cols = grid.GetLength(1);
        var dp = new long[cols];
        dp[0] = grid[0, 0] == 1 ? 0 : 1;
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++)
            {
                if (grid[r, c] == 1) { dp[c] = 0; continue; }
                if (c > 0) dp[c] += dp[c - 1];     // dp[c] already holds the value from the row above
            }
        return dp[cols - 1];
    }
}

// SequenceDp.Lcs("ABCBDAB", "BDCABA")   // 4
// SequenceDp.EditDistance("kitten", "sitting") // 3
// SequenceDp.Lis(new[]{10,9,2,5,3,7,101,18})   // 4` }
  ],
  pitfalls: [
    'Writing code before you can say the state in one sentence. If the state misses information (like "did I rob house 0" on a circular street), the recurrence is silently wrong.',
    'Wrong loop direction in 1D knapsack. High-to-low = each item once. Low-to-high = unlimited copies. Mixing them gives plausible but wrong answers.',
    'Forgetting base cases at the edges of a 2D table (row 0 and column 0), then reading dp[-1] or leaving zeros that should be i or j.',
    'Deep memoized recursion on big inputs can throw StackOverflowException in .NET. Convert to tabulation or run on a thread with a larger stack.',
    'Using int for counting problems. "Number of ways" grows fast; use long, or apply modulo 1_000_000_007 at every step when the problem asks for it.',
    'Trusting the LIS "tails" list as the actual subsequence. Only its length is correct; reconstructing needs a parent array.'
  ],
  quiz: [
    { q: 'Which two properties must a problem have for dynamic programming to help?', options: ['Sorted input values and no repeated elements at all', 'Overlapping subproblems and optimal substructure', 'A locally best greedy choice and a heap to pick it', 'A recursive solution and a deep enough call stack'], answer: 1, why: 'DP saves work only if the same subproblems repeat, and it is correct only if the best big answer is built from best small answers.' },
    { q: 'In the 1D version of 0/1 knapsack, why do we loop capacity from high to low?', options: ['It is faster for the CPU cache', 'So each item is counted at most once', 'So we can take unlimited copies of each item', 'To avoid integer overflow'], answer: 1, why: 'Going downwards means dp[w - weight] still holds the previous item row, so the current item cannot be reused in the same pass.' },
    { q: 'What is the state for the longest common subsequence DP?', options: ['The current character of each string and nothing else', 'The pair (i, j): prefix lengths of the two strings', 'The sum of the ASCII codes matched so far', 'The set of characters matched so far in both strings'], answer: 1, why: 'LCS of a[0..i) and b[0..j) depends only on i and j, so the table is (n+1) by (m+1).' },
    { q: 'The O(n log n) LIS algorithm keeps a list called tails. What is true about it?', options: ['It always holds the longest increasing subsequence itself, in order', 'Only its length is right; its contents may not be a real subsequence', 'It stores every increasing subsequence found so far, one per slot', 'It must be kept sorted in descending order'], answer: 1, why: 'Each tails[k] is the smallest possible last element of an increasing subsequence of length k+1. Replacements break the order of the real subsequence.' },
    { q: 'Memoization is top-down. Which is a real advantage over tabulation?', options: ['It never uses recursion, only plain loops', 'It only computes states that are actually reachable', 'It always uses less memory than a bottom-up table does', 'It can never overflow the stack, however deep it goes'], answer: 1, why: 'A memoized solver visits only the states the recursion touches, which can be far fewer than the whole table when the state space is sparse.' },
    { q: 'Coin change: fewest coins to make 11 with coins {1, 2, 5}. What is the answer?', options: ['2', '3', '4', '11'], answer: 1, why: '5 + 5 + 1 uses three coins. The DP finds dp[11] = dp[6] + 1 = dp[1] + 2 = 3.' }
  ],
  takeaways: [
    'DP = recursion + remembering. Solve each subproblem once and store the answer.',
    'Always write the state, the transition and the base case in English before code.',
    'Memoization is the recursive version with a cache; tabulation fills a table with loops and is easier to shrink in memory.',
    'Knapsack loop direction decides "once" versus "unlimited". Coin change is unbounded knapsack.',
    'LCS, edit distance and grid paths share one 2D table shape. LIS has an O(n log n) trick with binary search.',
    'Reconstruct choices by walking the table backwards; verify on tiny inputs against brute force.'
  ],
  interview: [
    { q: 'How do you recognise that a problem needs DP instead of greedy?', a: '<p>Try a greedy choice and look for a small counter-example. If taking the locally best option can block a better total (coins {1, 3, 4} for amount 6: greedy takes 4+1+1, best is 3+3), the problem needs DP. Also look for the keywords: number of ways, minimum or maximum over choices, longest, on a sequence or grid.</p>' },
    { q: 'Explain the difference between memoization and tabulation, and when you would pick each.', a: '<p>Memoization is top-down recursion with a cache; it is quick to write and only touches reachable states, but recursion depth can overflow and dictionary lookups cost time. Tabulation fills an array bottom-up with loops; it is faster, has no stack risk and lets you drop old rows to save memory. I prototype with memoization and convert to tabulation when performance or depth matters.</p>' },
    { q: 'Reduce the space of 0/1 knapsack from O(nW) to O(W). What changes?', a: '<p>Keep one array indexed by capacity and iterate capacity from W down to weight[i] for each item. Going downwards guarantees dp[w - weight[i]] still refers to the previous item row, so the item is used at most once. You lose the ability to reconstruct which items were taken unless you keep extra bookkeeping.</p>' },
    { q: 'What is the recurrence for edit distance and why does it work?', a: '<p>dp[i][j] is the cost to turn the first i characters of a into the first j of b. The last operation is either delete a[i] (dp[i-1][j] + 1), insert b[j] (dp[i][j-1] + 1), or match/replace (dp[i-1][j-1] + 0 or 1). Taking the minimum of the three covers every possible last step, so by induction the table is optimal.</p>' }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-graphs — Graphs: BFS/DFS, Shortest Paths, MST, Topo Sort, DSU    */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-graphs'] = {
  hook: `Your friends list, the city map, every build pipeline and every web page link: they are all graphs. Learn five algorithms and you can answer "how far", "in what order" and "is it connected" for any of them.`,
  intro: `<p>A <span class="term">graph</span> is a set of points connected by lines. The points are called <span class="term">nodes</span> (or vertices) and the lines are called <span class="term">edges</span>. A map of cities and roads is a graph. A social network is a graph. The dependencies between your NuGet packages form a graph.</p>
<p>Edges can be <span class="term">directed</span> (one-way: "A follows B") or <span class="term">undirected</span> (two-way: "A is friends with B"). Edges can carry a <span class="term">weight</span>, such as distance or cost. A graph with no cycles that is connected is a tree, so trees are a special case of graphs.</p>
<p>Almost every graph question is one of a few shapes: visit everything (BFS and DFS), find the shortest path (BFS for unweighted, Dijkstra for weighted), find an order that respects dependencies (topological sort), connect everything cheaply (minimum spanning tree with Prim or Kruskal), or group nodes into connected sets (union-find).</p>
<p>In this lesson you will build each of these in C#, see how the graph is stored in memory, and learn which algorithm fits which question. Graphs are the most common "hard" interview topic, and most of the difficulty is just recognising the shape.</p>`,
  realLife: {
    title: 'Planning a road trip with a paper map',
    body: `<p>You are in Pune and want to reach Goa. You could explore like water spreading from a dropped bottle: first all towns one road away, then all towns two roads away, and so on. The first time you touch Goa you have the fewest roads. That is <span class="term">breadth-first search</span> (BFS). Or you could pick one road and follow it as far as it goes, backing up only when stuck. That is <span class="term">depth-first search</span> (DFS).</p>
<p>Roads have different lengths, though. Fewest roads is not the shortest drive. Dijkstra fixes this by always extending the trip that is currently shortest in kilometres, not in road count. And if you were an engineer laying fibre to connect every town with the least cable, you would want a minimum spanning tree.</p>
<p><strong>Where companies use this:</strong> Google Maps and Uber use Dijkstra-family algorithms for routing. LinkedIn computes "2nd-degree connections" with BFS. MSBuild and npm run topological sort to decide build order. Network operators use spanning trees to avoid loops. Fraud teams use union-find to group accounts that share devices or cards.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Storing a graph in memory</h4>
<ul>
<li><strong>Adjacency list:</strong> for each node, a list of its neighbours. In C#, <code>List&lt;int&gt;[] adj</code> or <code>Dictionary&lt;int, List&lt;int&gt;&gt;</code>. Memory O(V + E). This is the default choice.</li>
<li><strong>Adjacency matrix:</strong> a V by V grid where cell [u][v] is true (or the weight) if there is an edge. Memory O(V²). Great for dense graphs and for "is there an edge?" in O(1), wasteful for sparse ones.</li>
<li><strong>Edge list:</strong> just a list of (u, v, weight) tuples. Used by Kruskal.</li>
</ul>
<h4>BFS: layer by layer</h4>
<p>Put the start node in a queue. Repeat: take the front node, visit each unvisited neighbour, mark it visited, push it. Because the queue is first-in first-out, you finish all nodes at distance 1 before any at distance 2. So in an unweighted graph BFS gives the shortest path in number of edges. Time O(V + E).</p>
<h4>DFS: go deep, then back up</h4>
<p>Visit a node, then recursively visit each unvisited neighbour. It is a stack (the call stack, or an explicit one). DFS is the tool for "does a path exist", counting connected components, finding cycles, and topological sort. Time O(V + E).</p>
<div class="callout tip">BFS when you need "fewest steps". DFS when you need "explore everything" or "detect structure" like cycles and components.</div>
<h4>Connected components and islands</h4>
<p>Loop over every node. If it is not visited yet, start a BFS or DFS from it and count one component. "Number of islands" in a grid is the same thing where each cell is a node and the four neighbours are its edges.</p>
<h4>Cycle detection</h4>
<p>Undirected: during DFS, if you see a visited neighbour that is not your parent, there is a cycle. Directed: keep three colours. White = not seen, grey = currently on the recursion stack, black = finished. Seeing a grey node again means a cycle.</p>
<h4>Topological sort: an order that respects arrows</h4>
<p>In a directed graph without cycles (a DAG), a topological order lists nodes so every edge points forward. "Put on socks before shoes." Kahn's algorithm: count incoming edges for each node, start with nodes that have zero, remove them one by one and decrease their neighbours' counts. If you cannot process every node, there is a cycle.</p>` },
    { name: 'Intermediate', body: `<h4>Dijkstra: shortest path with weights</h4>
<p>Keep a best-known distance for every node (infinity at first, 0 for the start). Use a priority queue (min-heap) ordered by distance. Pop the closest node; for each neighbour, if going through this node is shorter, update it and push. Once a node is popped it is final. Works only when all weights are non-negative. With .NET's <code>PriorityQueue&lt;TElement, TPriority&gt;</code> the time is O((V + E) log V).</p>
<p>The "lazy deletion" trick: you cannot decrease a key inside PriorityQueue, so push a new entry and skip stale entries when popped (if the popped distance is larger than the stored best, continue).</p>
<h4>Shortest path in a grid</h4>
<p>Unweighted grid: BFS with a 2D visited array and the four direction offsets. Weighted cells: Dijkstra where each cell is a node. If weights are only 0 or 1, 0-1 BFS with a deque is faster (covered in Advanced Graphs).</p>
<h4>Minimum spanning tree (MST)</h4>
<p>A spanning tree connects all V nodes with V-1 edges. The minimum one has the smallest total weight. Two classic algorithms:</p>
<div class="compare"><div><h5>Kruskal</h5><p>Sort edges by weight. Walk through them; add an edge if it joins two different components (checked with union-find). Stop after V-1 edges. O(E log E). Simple and great for sparse graphs.</p></div><div><h5>Prim</h5><p>Start from any node. Repeatedly add the cheapest edge that connects a tree node to a non-tree node, using a priority queue. O(E log V). Looks like Dijkstra with a different key.</p></div></div>
<h4>Union-find (Disjoint Set Union)</h4>
<p>A structure that answers "are u and v in the same group?" and "merge the groups of u and v" in almost O(1). Each node points to a parent; the root represents the group. Two optimisations make it fast: <span class="term">path compression</span> (point every node on the way to the root directly at the root) and <span class="term">union by rank</span> (attach the shorter tree under the taller). Together they give nearly constant time per operation (inverse Ackermann).</p>
<h4>Bipartite check</h4>
<p>Can you colour the nodes with two colours so no edge joins the same colour? BFS and colour neighbours the opposite colour. If a neighbour already has your colour, the graph is not bipartite. Used for matching problems (students to projects) and for detecting odd cycles.</p>
<h4>DFS-based topological sort</h4>
<p>Run DFS; when a node finishes (all neighbours done), push it to a list. Reverse the list. This is often simpler than Kahn's in recursive code and gives the same guarantees.</p>
<div class="callout warn">Dijkstra with a negative edge is wrong, and it fails silently. If weights can be negative, use Bellman-Ford (next lessons).</div>` },
    { name: 'Expert', body: `<h4>Choosing the algorithm in one table</h4>
<table><thead><tr><th>Question</th><th>Algorithm</th><th>Time</th></tr></thead><tbody>
<tr><td>Fewest edges from s to t, unweighted</td><td>BFS</td><td>O(V + E)</td></tr>
<tr><td>Shortest path, non-negative weights</td><td>Dijkstra (heap)</td><td>O((V + E) log V)</td></tr>
<tr><td>Shortest path, negative weights</td><td>Bellman-Ford / SPFA</td><td>O(V·E)</td></tr>
<tr><td>All-pairs shortest path, small V</td><td>Floyd-Warshall</td><td>O(V³)</td></tr>
<tr><td>Order with dependencies</td><td>Topological sort</td><td>O(V + E)</td></tr>
<tr><td>Cheapest way to connect everything</td><td>Kruskal / Prim</td><td>O(E log E)</td></tr>
<tr><td>Group membership with merges</td><td>Union-find</td><td>~O(1) per op</td></tr>
</tbody></table>
<h4>Correctness of Dijkstra in one paragraph</h4>
<p>When the heap pops node u with distance d, every other node still in the heap has distance ≥ d. Any path to u through those nodes would be ≥ d plus a non-negative edge, so d is already the minimum. Negative edges break the "plus a non-negative edge" step, which is exactly why the algorithm fails on them.</p>
<h4>Memory and representation at scale</h4>
<p>For millions of edges, <code>List&lt;int&gt;[]</code> has one object per node and pointer chasing. A <span class="term">CSR</span> layout (compressed sparse row: one int[] of neighbours and one int[] of offsets) is far more cache-friendly and is what graph databases and ML libraries use internally. Implicit graphs (grids, state spaces like a puzzle) are never stored; neighbours are generated on the fly.</p>
<h4>Recursion limits</h4>
<p>Recursive DFS on a graph with 10^6 nodes in a line will overflow the .NET stack. Use an explicit stack, or run on a thread with a larger stack size. Interviewers like to ask how you would handle this.</p>
<h4>Union-find proof sketch and variants</h4>
<p>With both path compression and union by rank, m operations on n elements cost O(m·α(n)) where α is the inverse Ackermann function, below 5 for any input that fits in the universe. Variants: weighted union-find (track an offset to the root, used for "is A heavier than B" style queries), rollback union-find (for offline dynamic connectivity), and DSU on trees (small-to-large merging).</p>
<h4>Common interview twists</h4>
<ul>
<li>Shortest path with at most k stops: BFS/Dijkstra with state (node, stops used), or Bellman-Ford limited to k rounds.</li>
<li>Count of shortest paths: BFS keeping a count array; when you find an equal-length path, add counts.</li>
<li>Detect whether a DAG has a unique topological order: Kahn's queue must never hold more than one node.</li>
<li>Minimum spanning tree with one edge forced: add it first, then run Kruskal.</li>
<li>Clone a graph: BFS with a dictionary from old node to new node.</li>
</ul>
<div class="callout idea">Many "string" or "state" puzzles are implicit graphs: word ladder (each word is a node, one-letter changes are edges) is just BFS.</div>` }
  ],
  flow: {
    title: 'Dijkstra finding the shortest path',
    steps: [
      { title: 'Set up distances', desc: 'Every node gets distance infinity, except the start which gets 0. Push (0, start) into a min-heap.' },
      { title: 'Pop the closest', desc: 'Take the node with the smallest distance from the heap. If this entry is stale (bigger than the stored best), skip it.' },
      { title: 'Relax neighbours', desc: 'For each edge (u, v, w): if dist[u] + w is smaller than dist[v], update dist[v] and push (dist[v], v).' },
      { title: 'Mark final', desc: 'Once a node is popped with its best distance, it will never improve again because all remaining heap entries are at least as far.' },
      { title: 'Repeat until empty', desc: 'Keep popping and relaxing. Each edge is relaxed at most once per improvement, each node popped once as final.' },
      { title: 'Rebuild the path', desc: 'Keep a parent array when you relax. Walk from the target back to the start and reverse the list to print the route.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Graph storage, BFS shortest path, DFS components, cycle detection', code: `using System;
using System.Collections.Generic;

public class Graph
{
    public int V;
    public List<int>[] Adj;                      // adjacency list

    public Graph(int v) { V = v; Adj = new List<int>[v]; for (int i = 0; i < v; i++) Adj[i] = new List<int>(); }
    public void AddEdge(int u, int v, bool directed = false)
    {
        Adj[u].Add(v);
        if (!directed) Adj[v].Add(u);
    }

    // BFS from s: returns distance in edges to every node (-1 = unreachable). O(V+E).
    public int[] Bfs(int s)
    {
        var dist = new int[V]; Array.Fill(dist, -1);
        var q = new Queue<int>(); q.Enqueue(s); dist[s] = 0;
        while (q.Count > 0)
        {
            int u = q.Dequeue();
            foreach (int v in Adj[u])
                if (dist[v] == -1) { dist[v] = dist[u] + 1; q.Enqueue(v); }
        }
        return dist;
    }

    // Count connected components (undirected) with iterative DFS. O(V+E).
    public int CountComponents()
    {
        var seen = new bool[V]; int count = 0;
        for (int s = 0; s < V; s++)
        {
            if (seen[s]) continue;
            count++;
            var stack = new Stack<int>(); stack.Push(s); seen[s] = true;
            while (stack.Count > 0)
            {
                int u = stack.Pop();
                foreach (int v in Adj[u]) if (!seen[v]) { seen[v] = true; stack.Push(v); }
            }
        }
        return count;
    }

    // Cycle detection in a DIRECTED graph using three colours. 0 white, 1 grey (on stack), 2 black (done).
    public bool HasCycleDirected()
    {
        var color = new int[V];
        bool Dfs(int u)
        {
            color[u] = 1;
            foreach (int v in Adj[u])
            {
                if (color[v] == 1) return true;              // back edge => cycle
                if (color[v] == 0 && Dfs(v)) return true;
            }
            color[u] = 2;
            return false;
        }
        for (int i = 0; i < V; i++) if (color[i] == 0 && Dfs(i)) return true;
        return false;
    }

    // Cycle detection in an UNDIRECTED graph: a visited neighbour that is not the parent.
    public bool HasCycleUndirected()
    {
        var seen = new bool[V];
        bool Dfs(int u, int parent)
        {
            seen[u] = true;
            foreach (int v in Adj[u])
            {
                if (!seen[v]) { if (Dfs(v, u)) return true; }
                else if (v != parent) return true;
            }
            return false;
        }
        for (int i = 0; i < V; i++) if (!seen[i] && Dfs(i, -1)) return true;
        return false;
    }
}` },
    { lang: 'csharp', title: 'Topological sort (Kahn and DFS), bipartite check, number of islands', code: `using System;
using System.Collections.Generic;

public static class GraphOrder
{
    // Kahn's algorithm. Returns null if the graph has a cycle. O(V+E).
    public static List<int>? TopoSortKahn(int V, List<int>[] adj)
    {
        var indeg = new int[V];
        for (int u = 0; u < V; u++) foreach (int v in adj[u]) indeg[v]++;
        var q = new Queue<int>();
        for (int i = 0; i < V; i++) if (indeg[i] == 0) q.Enqueue(i);
        var order = new List<int>();
        while (q.Count > 0)
        {
            int u = q.Dequeue(); order.Add(u);
            foreach (int v in adj[u]) if (--indeg[v] == 0) q.Enqueue(v);
        }
        return order.Count == V ? order : null;      // leftover nodes => cycle
    }

    // DFS-based topological sort: push on finish, then reverse.
    public static List<int> TopoSortDfs(int V, List<int>[] adj)
    {
        var seen = new bool[V]; var order = new List<int>();
        void Dfs(int u)
        {
            seen[u] = true;
            foreach (int v in adj[u]) if (!seen[v]) Dfs(v);
            order.Add(u);                            // all descendants done
        }
        for (int i = 0; i < V; i++) if (!seen[i]) Dfs(i);
        order.Reverse();
        return order;
    }

    // Bipartite check with BFS two-colouring. O(V+E).
    public static bool IsBipartite(int V, List<int>[] adj)
    {
        var color = new int[V]; Array.Fill(color, -1);
        for (int s = 0; s < V; s++)
        {
            if (color[s] != -1) continue;
            var q = new Queue<int>(); q.Enqueue(s); color[s] = 0;
            while (q.Count > 0)
            {
                int u = q.Dequeue();
                foreach (int v in adj[u])
                {
                    if (color[v] == -1) { color[v] = 1 - color[u]; q.Enqueue(v); }
                    else if (color[v] == color[u]) return false;
                }
            }
        }
        return true;
    }

    // Number of islands in a grid ('1' = land). Implicit graph, iterative DFS. O(rows*cols).
    public static int NumIslands(char[,] g)
    {
        int R = g.GetLength(0), C = g.GetLength(1), count = 0;
        int[] dr = { 1, -1, 0, 0 }, dc = { 0, 0, 1, -1 };
        var seen = new bool[R, C];
        for (int r = 0; r < R; r++)
            for (int c = 0; c < C; c++)
            {
                if (g[r, c] != '1' || seen[r, c]) continue;
                count++;
                var st = new Stack<(int, int)>(); st.Push((r, c)); seen[r, c] = true;
                while (st.Count > 0)
                {
                    var (x, y) = st.Pop();
                    for (int k = 0; k < 4; k++)
                    {
                        int nx = x + dr[k], ny = y + dc[k];
                        if (nx < 0 || ny < 0 || nx >= R || ny >= C) continue;
                        if (g[nx, ny] == '1' && !seen[nx, ny]) { seen[nx, ny] = true; st.Push((nx, ny)); }
                    }
                }
            }
        return count;
    }
}` },
    { lang: 'csharp', title: 'Dijkstra with PriorityQueue and path reconstruction', code: `using System;
using System.Collections.Generic;

public static class ShortestPath
{
    // adj[u] holds (neighbour, weight). Weights must be >= 0. O((V+E) log V).
    public static (long[] dist, int[] parent) Dijkstra(int V, List<(int to, int w)>[] adj, int src)
    {
        var dist = new long[V]; Array.Fill(dist, long.MaxValue);
        var parent = new int[V]; Array.Fill(parent, -1);
        var pq = new PriorityQueue<int, long>();     // element = node, priority = distance
        dist[src] = 0; pq.Enqueue(src, 0);

        while (pq.TryDequeue(out int u, out long d))
        {
            if (d > dist[u]) continue;               // stale entry (lazy deletion)
            foreach (var (v, w) in adj[u])
            {
                long nd = d + w;
                if (nd < dist[v])                    // relax
                {
                    dist[v] = nd; parent[v] = u;
                    pq.Enqueue(v, nd);
                }
            }
        }
        return (dist, parent);
    }

    public static List<int> PathTo(int[] parent, int target)
    {
        var path = new List<int>();
        for (int v = target; v != -1; v = parent[v]) path.Add(v);
        path.Reverse();
        return path;
    }

    // Shortest path in a grid with per-cell cost, moving 4 directions. Dijkstra on an implicit graph.
    public static int GridMinCost(int[,] cost)
    {
        int R = cost.GetLength(0), C = cost.GetLength(1);
        var dist = new int[R, C];
        for (int i = 0; i < R; i++) for (int j = 0; j < C; j++) dist[i, j] = int.MaxValue;
        var pq = new PriorityQueue<(int r, int c), int>();
        dist[0, 0] = cost[0, 0]; pq.Enqueue((0, 0), cost[0, 0]);
        int[] dr = { 1, -1, 0, 0 }, dc = { 0, 0, 1, -1 };
        while (pq.TryDequeue(out var cell, out int d))
        {
            if (d > dist[cell.r, cell.c]) continue;
            if (cell.r == R - 1 && cell.c == C - 1) return d;
            for (int k = 0; k < 4; k++)
            {
                int nr = cell.r + dr[k], nc = cell.c + dc[k];
                if (nr < 0 || nc < 0 || nr >= R || nc >= C) continue;
                int nd = d + cost[nr, nc];
                if (nd < dist[nr, nc]) { dist[nr, nc] = nd; pq.Enqueue((nr, nc), nd); }
            }
        }
        return -1;
    }
}

// Usage:
// var adj = new List<(int,int)>[5]; for (int i=0;i<5;i++) adj[i] = new();
// adj[0].Add((1,4)); adj[0].Add((2,1)); adj[2].Add((1,2)); adj[1].Add((3,1)); adj[2].Add((3,5));
// var (dist, parent) = ShortestPath.Dijkstra(5, adj, 0);   // dist[3] = 4, path 0->2->1->3` },
    { lang: 'csharp', title: 'Union-find (DSU) and Kruskal / Prim minimum spanning tree', code: `using System;
using System.Collections.Generic;
using System.Linq;

public class DisjointSet
{
    private readonly int[] parent, rank;
    public int Components { get; private set; }

    public DisjointSet(int n)
    {
        parent = new int[n]; rank = new int[n]; Components = n;
        for (int i = 0; i < n; i++) parent[i] = i;
    }

    public int Find(int x)                        // path compression (iterative, no deep recursion)
    {
        int root = x;
        while (parent[root] != root) root = parent[root];
        while (parent[x] != root) { int next = parent[x]; parent[x] = root; x = next; }
        return root;
    }

    public bool Union(int a, int b)               // union by rank; returns false if already joined
    {
        int ra = Find(a), rb = Find(b);
        if (ra == rb) return false;
        if (rank[ra] < rank[rb]) (ra, rb) = (rb, ra);
        parent[rb] = ra;
        if (rank[ra] == rank[rb]) rank[ra]++;
        Components--;
        return true;
    }
}

public static class Mst
{
    // Kruskal: sort edges, add if it joins two components. O(E log E).
    public static (long total, List<(int u, int v, int w)> tree) Kruskal(int V, List<(int u, int v, int w)> edges)
    {
        var dsu = new DisjointSet(V);
        var tree = new List<(int, int, int)>(); long total = 0;
        foreach (var e in edges.OrderBy(e => e.w))
        {
            if (dsu.Union(e.u, e.v)) { tree.Add(e); total += e.w; }
            if (tree.Count == V - 1) break;
        }
        return (total, tree);
    }

    // Prim: grow the tree from node 0 using a heap of candidate edges. O(E log V).
    public static long Prim(int V, List<(int to, int w)>[] adj)
    {
        var inTree = new bool[V]; long total = 0; int added = 0;
        var pq = new PriorityQueue<(int node, int w), int>();
        pq.Enqueue((0, 0), 0);
        while (pq.TryDequeue(out var item, out _) && added < V)
        {
            if (inTree[item.node]) continue;
            inTree[item.node] = true; total += item.w; added++;
            foreach (var (v, w) in adj[item.node])
                if (!inTree[v]) pq.Enqueue((v, w), w);
        }
        return added == V ? total : -1;           // -1 => graph not connected
    }
}

// var edges = new List<(int,int,int)> { (0,1,4), (0,2,1), (1,2,2), (1,3,5), (2,3,8) };
// Mst.Kruskal(4, edges).total   // 1 + 2 + 5 = 8` }
  ],
  pitfalls: [
    'Running Dijkstra on a graph with negative edge weights. It returns wrong answers without any error. Use Bellman-Ford instead.',
    'Forgetting to mark nodes visited when you enqueue them in BFS (marking on dequeue lets the same node enter the queue many times and can blow up memory).',
    'Recursive DFS on huge or deep graphs throws StackOverflowException in .NET. Use an explicit stack or a bigger thread stack.',
    'Treating an undirected edge as one entry in the adjacency list. Add both directions, or your BFS will miss half the graph.',
    'In Kahn\'s algorithm, not checking that every node was output. Fewer nodes means a cycle, and silently returning a partial order hides it.',
    'Union-find without path compression or rank. It still works, but a chain of unions makes Find O(n) and interviewers will ask about it.'
  ],
  quiz: [
    { q: 'You need the fewest number of hops between two users in a social network. Which algorithm?', options: ['DFS', 'BFS', 'Dijkstra', 'Kruskal'], answer: 1, why: 'In an unweighted graph, BFS visits nodes in order of distance, so the first time it reaches the target it has used the fewest edges.' },
    { q: 'Why does Dijkstra fail with negative edge weights?', options: ['The priority queue cannot store or compare negative priorities', 'A node already marked final could later get a cheaper path', 'It runs out of stack space on the recursive calls', 'It only works on trees, and negative edges create cycles'], answer: 1, why: 'Dijkstra assumes that once the closest node is popped, no later path can be shorter. A negative edge breaks that assumption.' },
    { q: 'Kahn\'s algorithm finishes but only output 7 of 9 nodes. What does that mean?', options: ['Two nodes are isolated', 'The graph has a cycle', 'The graph is bipartite', 'The input had duplicate edges'], answer: 1, why: 'Nodes inside a cycle never reach in-degree zero, so they are never dequeued. Missing nodes means a cycle exists.' },
    { q: 'Which two optimisations make union-find nearly O(1) per operation?', options: ['Sorting the parents and hashing the roots', 'Path compression and union by rank', 'Memoization and tabulation of every Find', 'BFS and DFS from each root'], answer: 1, why: 'Path compression flattens trees during Find; union by rank keeps them shallow during Union. Together they give inverse-Ackermann time.' },
    { q: 'Kruskal\'s algorithm uses union-find for what purpose?', options: ['To sort the edges by weight before the main loop', 'To check whether an edge would create a cycle', 'To compute the degree of every node in the tree', 'To find the shortest path between the two endpoints'], answer: 1, why: 'An edge whose endpoints are already in the same set would close a cycle, so Kruskal skips it.' },
    { q: 'A graph can be coloured with two colours so no edge connects the same colour. What is it called?', options: ['Complete', 'Bipartite', 'Acyclic', 'Weighted'], answer: 1, why: 'That is the definition of a bipartite graph. BFS two-colouring checks it, and an odd cycle is the only thing that breaks it.' }
  ],
  takeaways: [
    'Store graphs as adjacency lists unless the graph is dense or you need O(1) edge lookup.',
    'BFS gives fewest edges; Dijkstra gives smallest total weight (non-negative only); both use "relax the neighbours".',
    'DFS reveals structure: components, cycles (three colours for directed), and finish-order topological sort.',
    'Kahn\'s algorithm = repeatedly remove zero in-degree nodes; leftover nodes mean a cycle.',
    'MST: Kruskal sorts edges and uses union-find; Prim grows from a node with a heap.',
    'Union-find with path compression and rank is the fastest way to track "same group" under merges.'
  ],
  interview: [
    { q: 'Explain how you would detect a cycle in a directed graph and in an undirected graph.', a: '<p>Directed: DFS with three colours. A node is grey while it is on the recursion stack and black when finished. Reaching a grey node means a back edge, which is a cycle. Undirected: DFS that remembers the parent; reaching an already-visited neighbour that is not the parent means a cycle. Alternatively, union-find on the edge list: an edge whose endpoints are already connected closes a cycle.</p>' },
    { q: 'How does .NET\'s PriorityQueue affect your Dijkstra implementation?', a: '<p>PriorityQueue has no decrease-key, so I push a new (node, distance) entry every time I relax an edge and skip stale entries when I pop them by comparing with the stored best distance. The heap can hold up to E entries, which is still O((V+E) log V) overall.</p>' },
    { q: 'Compare Prim and Kruskal. When would you pick one over the other?', a: '<p>Kruskal sorts all edges and is natural when you already have an edge list or the graph is sparse; it also pairs well with union-find for questions like "add edges until connected". Prim works from an adjacency list with a heap and is better on dense graphs or when you need to grow from a specific start. Both give an MST of the same total weight.</p>' },
    { q: 'Topological sort of a build system: what if there are many valid orders and the client wants a deterministic one?', a: '<p>Use Kahn\'s algorithm with a priority queue instead of a plain queue, ordered by node name or id. The output is then the lexicographically smallest valid order, which is stable across runs.</p>' }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-segment-trees — Segment Trees & Fenwick Trees                    */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-segment-trees'] = {
  hook: `"What is the sum of sales from day 1,000 to day 90,000, and by the way day 42,017 just changed." Answering that a million times a second needs a tree, not a loop.`,
  intro: `<p>A <span class="term">range query</span> asks a question about a slice of an array: the sum, the minimum, the maximum of elements from index l to r. A <span class="term">point update</span> changes one element. If the array never changes, a prefix-sum array answers sum queries in O(1). But if updates and queries are mixed, prefix sums break: one update means rebuilding O(n) prefixes.</p>
<p>A <span class="term">segment tree</span> solves this. It is a binary tree where every node stores the answer for one segment of the array. The root covers the whole array, its children cover each half, and so on down to single elements. Both a query and an update touch only O(log n) nodes.</p>
<p>A <span class="term">Fenwick tree</span> (also called a Binary Indexed Tree or BIT) is a smaller, faster cousin. It handles prefix sums with updates in O(log n) using a clever trick with the binary form of the index. It cannot do everything a segment tree can, but when it fits it is shorter to write and faster to run.</p>
<p>This lesson builds both from scratch in C#, adds <span class="term">lazy propagation</span> so you can update whole ranges at once, and shows the classic application of counting inversions.</p>`,
  realLife: {
    title: 'The stadium with a scoreboard per section',
    body: `<p>A stadium has 65,536 seats. The manager keeps asking "how many people are sitting in seats 10,000 to 50,000?" while fans keep arriving and leaving. Counting seat by seat each time is hopeless. So each section of 2 seats has a small counter. Each pair of sections has a counter above it. Each pair of those has one above that, and so on up to one big counter for the whole stadium: 16 levels in total.</p>
<p>When one fan sits down, you mark the seat and bump 16 counters: its section, the section above, up to the top. When the manager asks about a range, you pick the handful of counters whose sections tile that range exactly, at most about 2 per level, and add them. That is a segment tree.</p>
<p><strong>Where companies use this:</strong> trading systems keep order-book depth per price range this way. Game leaderboards answer "how many players scored between X and Y" with Fenwick trees. Database engines use similar structures for range statistics, and competitive programming uses both constantly.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The problem prefix sums cannot solve</h4>
<p>Prefix sums: pre[i] = a[0] + ... + a[i-1]. Sum of l..r = pre[r+1] - pre[l]. O(1) per query, but one change to a[k] forces you to fix every pre[i] for i &gt; k, which is O(n). With 10^5 updates and 10^5 queries, O(n) per update is 10^10 operations. Too slow.</p>
<h4>The segment tree picture</h4>
<p>Draw an array of 8 numbers. Above each pair draw a box with their sum. Above each pair of boxes draw their sum. Keep going until one box covers everything. That is 4 + 2 + 1 = 7 internal boxes plus the 8 leaves, 15 nodes. In general a segment tree has about 2n nodes and log n levels.</p>
<ul>
<li><strong>Build:</strong> fill leaves with the array, then each parent = combine(left child, right child). O(n).</li>
<li><strong>Query l..r:</strong> start at the root. If the node's segment is fully inside l..r, return its value. If fully outside, return the identity (0 for sum, +infinity for min). Otherwise ask both children and combine. O(log n).</li>
<li><strong>Point update:</strong> change the leaf, then recompute each parent on the path to the root. O(log n).</li>
</ul>
<div class="callout tip">The "combine" function is the only thing that changes between a sum tree, a min tree, a max tree, a GCD tree or a "count of zeros" tree. Write it once as a small method.</div>
<h4>What a Fenwick tree stores</h4>
<p>A Fenwick tree is an array tree[1..n] where tree[i] stores the sum of a block of elements ending at i. The block length is the lowest set bit of i (i &amp; -i). So tree[8] covers 8 elements, tree[6] covers 2, tree[7] covers 1. To get a prefix sum up to i, add tree[i], then drop the lowest bit from i, repeat until i is 0. To update position i, add to tree[i], then add the lowest bit to i, repeat until i exceeds n. Both loops run at most log n times.</p>
<h4>When to use which</h4>
<ul>
<li>Prefix sums only, with point updates: Fenwick. Shortest code, fastest.</li>
<li>Range min, max, or anything that cannot be "subtracted": segment tree.</li>
<li>Range updates and range queries together: segment tree with lazy propagation.</li>
<li>No updates at all: plain prefix sums or a sparse table.</li>
</ul>` },
    { name: 'Intermediate', body: `<h4>Array-based segment tree layout</h4>
<p>Store the tree in an array of size 4n to be safe. Node 1 is the root covering [0, n-1]. Node i has children 2i (left half) and 2i+1 (right half). The recursion carries (node, lo, hi) so each call knows its segment. Many people also use an iterative bottom-up version with size 2n where leaves live at n..2n-1; it is faster and avoids recursion.</p>
<h4>Query, step by step</h4>
<p>Query(node, lo, hi, l, r): if r &lt; lo or hi &lt; l, return identity. If l &lt;= lo and hi &lt;= r, return tree[node]. Else mid = (lo+hi)/2, return combine(Query(left, lo, mid), Query(right, mid+1, hi)). At most 4 nodes per level are visited, which is why it is O(log n).</p>
<h4>Lazy propagation: updating a whole range</h4>
<p>"Add 5 to every element from l to r." Doing n point updates is O(n log n), too slow. Instead, when a node's segment is fully inside l..r, update that node's value (for sum: value += 5 × segment length) and store a pending 5 in lazy[node], meaning "my children still owe this". Only when you later need to go into a child do you <span class="term">push down</span> the pending value to both children. Queries and updates stay O(log n).</p>
<div class="callout warn">Always push down before recursing into children, in both update and query. Forgetting the push in query is the most common lazy-propagation bug.</div>
<h4>Fenwick for range sum with point update</h4>
<p>sum(l, r) = prefix(r) - prefix(l-1). That subtraction is why Fenwick works for sums but not for min (you cannot "subtract" a min). A Fenwick tree for range update + point query exists too: store differences, range add on [l, r] becomes add(l, v) and add(r+1, -v), and the point value is the prefix sum.</p>
<h4>Counting inversions with a BIT</h4>
<p>An inversion is a pair i &lt; j with a[i] &gt; a[j]. Walk the array from right to left. For each a[i], ask the BIT how many values smaller than a[i] have been seen (prefix sum up to a[i]-1), add that to the answer, then insert a[i]. O(n log n). Compress the values to 1..n first if they are large.</p>
<h4>Choosing the identity</h4>
<table><thead><tr><th>Operation</th><th>Identity</th><th>Combine</th></tr></thead><tbody>
<tr><td>Sum</td><td>0</td><td>a + b</td></tr>
<tr><td>Min</td><td>int.MaxValue</td><td>Math.Min</td></tr>
<tr><td>Max</td><td>int.MinValue</td><td>Math.Max</td></tr>
<tr><td>GCD</td><td>0</td><td>Gcd(a, b)</td></tr>
<tr><td>Count of a value</td><td>0</td><td>a + b</td></tr>
</tbody></table>` },
    { name: 'Expert', body: `<h4>Memory layout and speed</h4>
<p>The recursive 4n layout is easy to reason about. The iterative 2n "bottom-up" layout (leaves at [n, 2n), parent of i is i/2) uses half the memory, has no recursion, and runs 2 to 3 times faster in practice because of cache behaviour. For non-commutative combines (like matrix multiplication) the iterative version needs care with left and right results. Choose based on whether you need lazy propagation, which is much simpler in the recursive form.</p>
<h4>Lazy propagation with two kinds of updates</h4>
<p>If a problem mixes "set every element in range to v" and "add v to every element in range", the lazy node must store both and apply them in a fixed order (a set wipes any pending add; an add after a set modifies the set value). Define a small struct for the lazy tag with an Apply method and a Compose method, and the rest of the tree stays generic.</p>
<h4>Segment tree on non-array domains</h4>
<ul>
<li><strong>Dynamic / sparse segment tree:</strong> indices up to 10^9 but only 10^5 touched. Create nodes on demand with pointers instead of a fixed array.</li>
<li><strong>Persistent segment tree:</strong> every update creates O(log n) new nodes and keeps the old root. You can query any past version. Used for "k-th smallest in a range" queries.</li>
<li><strong>Merge sort tree:</strong> each node keeps a sorted list of its segment; answers "count of elements less than x in l..r" in O(log² n).</li>
<li><strong>2D segment tree / BIT of BITs:</strong> rectangle sums with updates, O(log² n) per operation.</li>
</ul>
<h4>Fenwick internals</h4>
<p>The expression i &amp; -i isolates the lowest set bit because -i is the two's complement (flip bits, add one), which leaves the lowest set bit and everything below unchanged and flips everything above. tree[i] covers (i - lowbit(i), i]. The update walk i += lowbit(i) visits exactly the nodes whose block contains i. A Fenwick tree can also do "find the smallest index with prefix sum ≥ k" in O(log n) by descending powers of two, which gives an order-statistic structure.</p>
<h4>Failure modes</h4>
<ul>
<li>Integer overflow in sums: use long for the tree values when n × max value exceeds 2^31.</li>
<li>Off-by-one between 0-based arrays and 1-based Fenwick indices. Decide once and wrap the conversion in the class.</li>
<li>Lazy tags with the wrong identity: a pending add of 0 is harmless, but a pending "set to 0" is not the same as "nothing pending". Use a nullable or a separate flag for set.</li>
<li>Recursion depth is only log n, so stack overflow is not an issue here, unlike DFS.</li>
</ul>
<div class="callout idea">Interviewers love "design a data structure that supports X and Y in O(log n)". Translate X and Y into range query and point or range update, pick sum vs min, then pick Fenwick vs segment tree. Say the choice out loud.</div>` }
  ],
  flow: {
    title: 'A range-sum query walking the segment tree',
    steps: [
      { title: 'Start at the root', desc: 'The root covers the whole array [0, n-1]. The query asks for [l, r].' },
      { title: 'Check overlap', desc: 'If the node segment is completely outside [l, r], return the identity (0 for sum) and stop here.' },
      { title: 'Fully inside? Return', desc: 'If the node segment is completely inside [l, r], return the stored value. No need to look at children.' },
      { title: 'Partial overlap: split', desc: 'Compute mid. Ask the left child about [lo, mid] and the right child about [mid+1, hi].' },
      { title: 'Combine', desc: 'Add (or min, or max) the two child answers and return the result upward.' },
      { title: 'Only O(log n) nodes touched', desc: 'At each level at most 4 nodes are visited, so the total work is about 4 log n steps.' },
      { title: 'Point update path', desc: 'To change a[k]: go down to the leaf for k, change it, then recompute every parent on the way back up.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Segment tree: build, range query, point update (generic combine)', code: `using System;

// A segment tree over an int array with a pluggable combine function.
public class SegmentTree
{
    private readonly int n;
    private readonly long[] tree;                 // size 4n is always enough
    private readonly Func<long, long, long> combine;
    private readonly long identity;

    public SegmentTree(int[] a, Func<long, long, long> combine, long identity)
    {
        n = a.Length; this.combine = combine; this.identity = identity;
        tree = new long[4 * n];
        Build(1, 0, n - 1, a);
    }

    private void Build(int node, int lo, int hi, int[] a)
    {
        if (lo == hi) { tree[node] = a[lo]; return; }           // leaf
        int mid = (lo + hi) / 2;
        Build(2 * node, lo, mid, a);
        Build(2 * node + 1, mid + 1, hi, a);
        tree[node] = combine(tree[2 * node], tree[2 * node + 1]);
    }

    // Answer for a[l..r]. O(log n).
    public long Query(int l, int r) => Query(1, 0, n - 1, l, r);
    private long Query(int node, int lo, int hi, int l, int r)
    {
        if (r < lo || hi < l) return identity;                  // no overlap
        if (l <= lo && hi <= r) return tree[node];              // fully inside
        int mid = (lo + hi) / 2;
        return combine(Query(2 * node, lo, mid, l, r),
                       Query(2 * node + 1, mid + 1, hi, l, r));
    }

    // Set a[idx] = value. O(log n).
    public void Update(int idx, long value) => Update(1, 0, n - 1, idx, value);
    private void Update(int node, int lo, int hi, int idx, long value)
    {
        if (lo == hi) { tree[node] = value; return; }
        int mid = (lo + hi) / 2;
        if (idx <= mid) Update(2 * node, lo, mid, idx, value);
        else Update(2 * node + 1, mid + 1, hi, idx, value);
        tree[node] = combine(tree[2 * node], tree[2 * node + 1]);
    }
}

// var sumTree = new SegmentTree(new[] {5, 3, 8, 6, 1, 4}, (x, y) => x + y, 0);
// sumTree.Query(1, 4);            // 3+8+6+1 = 18
// sumTree.Update(2, 10);          // a[2] = 10
// sumTree.Query(1, 4);            // 20
// var minTree = new SegmentTree(new[] {5, 3, 8, 6, 1, 4}, Math.Min, long.MaxValue);
// minTree.Query(0, 3);            // 3` },
    { lang: 'csharp', title: 'Lazy propagation: range add + range sum in O(log n)', code: `using System;

public class LazySegmentTree
{
    private readonly int n;
    private readonly long[] sum, lazy;            // lazy[node] = pending add for the whole segment

    public LazySegmentTree(int[] a)
    {
        n = a.Length; sum = new long[4 * n]; lazy = new long[4 * n];
        Build(1, 0, n - 1, a);
    }

    private void Build(int node, int lo, int hi, int[] a)
    {
        if (lo == hi) { sum[node] = a[lo]; return; }
        int mid = (lo + hi) / 2;
        Build(2 * node, lo, mid, a); Build(2 * node + 1, mid + 1, hi, a);
        sum[node] = sum[2 * node] + sum[2 * node + 1];
    }

    // Apply a pending add to a node covering (hi - lo + 1) elements.
    private void Apply(int node, int lo, int hi, long v)
    {
        sum[node] += v * (hi - lo + 1);
        lazy[node] += v;                           // children still owe v
    }

    // Hand the pending value to both children before going deeper.
    private void PushDown(int node, int lo, int hi)
    {
        if (lazy[node] == 0) return;
        int mid = (lo + hi) / 2;
        Apply(2 * node, lo, mid, lazy[node]);
        Apply(2 * node + 1, mid + 1, hi, lazy[node]);
        lazy[node] = 0;
    }

    // Add v to every a[i] for l <= i <= r.
    public void RangeAdd(int l, int r, long v) => RangeAdd(1, 0, n - 1, l, r, v);
    private void RangeAdd(int node, int lo, int hi, int l, int r, long v)
    {
        if (r < lo || hi < l) return;
        if (l <= lo && hi <= r) { Apply(node, lo, hi, v); return; }   // whole segment: stop here
        PushDown(node, lo, hi);
        int mid = (lo + hi) / 2;
        RangeAdd(2 * node, lo, mid, l, r, v);
        RangeAdd(2 * node + 1, mid + 1, hi, l, r, v);
        sum[node] = sum[2 * node] + sum[2 * node + 1];
    }

    public long RangeSum(int l, int r) => RangeSum(1, 0, n - 1, l, r);
    private long RangeSum(int node, int lo, int hi, int l, int r)
    {
        if (r < lo || hi < l) return 0;
        if (l <= lo && hi <= r) return sum[node];
        PushDown(node, lo, hi);                    // must push before reading children
        int mid = (lo + hi) / 2;
        return RangeSum(2 * node, lo, mid, l, r) + RangeSum(2 * node + 1, mid + 1, hi, l, r);
    }
}

// var t = new LazySegmentTree(new[] {1, 2, 3, 4, 5});
// t.RangeAdd(1, 3, 10);          // [1, 12, 13, 14, 5]
// t.RangeSum(0, 4);              // 45
// t.RangeSum(2, 2);              // 13` },
    { lang: 'csharp', title: 'Fenwick tree (BIT): prefix sums with updates, and counting inversions', code: `using System;
using System.Collections.Generic;
using System.Linq;

public class Fenwick
{
    private readonly long[] tree;                 // 1-based
    private readonly int n;

    public Fenwick(int size) { n = size; tree = new long[n + 1]; }

    // a[i] += delta   (i is 1-based). O(log n).
    public void Add(int i, long delta)
    {
        for (; i <= n; i += i & -i) tree[i] += delta;   // climb to every block that contains i
    }

    // sum of a[1..i]. O(log n).
    public long Prefix(int i)
    {
        long s = 0;
        for (; i > 0; i -= i & -i) s += tree[i];        // drop the lowest set bit each step
        return s;
    }

    public long RangeSum(int l, int r) => Prefix(r) - Prefix(l - 1);

    // Smallest index idx with Prefix(idx) >= k (values must be non-negative). O(log n).
    public int LowerBound(long k)
    {
        int pos = 0; int logN = 1; while ((1 << logN) <= n) logN++;
        for (int step = 1 << logN; step > 0; step >>= 1)
            if (pos + step <= n && tree[pos + step] < k) { pos += step; k -= tree[pos]; }
        return pos + 1;
    }
}

public static class Inversions
{
    // Number of pairs i < j with a[i] > a[j]. O(n log n).
    public static long Count(int[] a)
    {
        // Coordinate compression: map values to 1..m
        var sorted = a.Distinct().OrderBy(x => x).ToArray();
        var rank = new Dictionary<int, int>();
        for (int i = 0; i < sorted.Length; i++) rank[sorted[i]] = i + 1;

        var bit = new Fenwick(sorted.Length);
        long result = 0;
        for (int i = a.Length - 1; i >= 0; i--)        // right to left
        {
            int r = rank[a[i]];
            result += bit.Prefix(r - 1);               // how many smaller values already seen to the right
            bit.Add(r, 1);
        }
        return result;
    }
}

// Inversions.Count(new[] {2, 4, 1, 3, 5})   // 3  -> (2,1), (4,1), (4,3)
// var f = new Fenwick(5); f.Add(1, 5); f.Add(3, 2); f.Prefix(3) // 7` }
  ],
  pitfalls: [
    'Forgetting PushDown before reading or updating children in a lazy tree. Queries then return stale values that look almost right.',
    'Using a Fenwick tree for range minimum. Min cannot be undone by subtraction, so prefix(r) - prefix(l-1) is meaningless. Use a segment tree.',
    'Mixing 0-based array indices with the 1-based Fenwick index. Wrap the conversion inside the class and never expose it.',
    'Allocating a segment tree of size 2n with the recursive layout. It can go out of bounds for non-power-of-two n. Use 4n, or switch to the iterative layout.',
    'Overflowing int in sum trees. Store long; a 10^5 array of values up to 10^9 already breaks int.',
    'Rebuilding the whole tree after every update. The whole point is the O(log n) path update.'
  ],
  quiz: [
    { q: 'Why do prefix sums stop being useful once the array receives frequent updates?', options: ['They use too much memory once the array gets large', 'One update forces O(n) work to fix all later prefixes', 'They only give correct answers when the array is sorted', 'They cannot handle negative numbers or zeros in the array'], answer: 1, why: 'Every prefix after the changed index is now wrong, so an update costs O(n). Segment trees and Fenwick trees make both operations O(log n).' },
    { q: 'How many nodes does a segment tree query touch, roughly?', options: ['O(1)', 'O(log n)', 'O(sqrt n)', 'O(n)'], answer: 1, why: 'At each of the log n levels at most a constant number of nodes partially overlap the query, so the work is O(log n).' },
    { q: 'What does lazy propagation avoid?', options: ['Building the tree before the first query can run', 'Updating every leaf in a range one by one', 'Using recursion to walk down the tree', 'Storing an identity value for empty segments'], answer: 1, why: 'A range update marks whole covered segments with a pending value instead of touching every element, and pushes it down only when needed.' },
    { q: 'In a Fenwick tree, what does i & -i compute?', options: ['The parent index of i', 'The lowest set bit of i', 'The highest set bit of i', 'The number of one bits in i'], answer: 1, why: 'Two\'s complement negation keeps the lowest set bit and flips everything above it, so the AND isolates that bit.' },
    { q: 'Which structure is the better choice for "range minimum with point updates"?', options: ['Fenwick tree', 'Segment tree', 'Prefix sums', 'Hash map'], answer: 1, why: 'Min is not invertible, so the Fenwick subtraction trick fails. A segment tree with Math.Min as combine handles it in O(log n).' },
    { q: 'Counting inversions with a BIT walks the array from right to left. What does Prefix(rank - 1) return at each step?', options: ['The number of larger values still waiting on the left', 'The number of smaller values already seen to the right', 'The sum of all array values inserted so far', 'The index of the smallest value seen so far'], answer: 1, why: 'Every inserted value sits to the right of the current one; counting those with a smaller rank gives the inversions this element forms.' }
  ],
  takeaways: [
    'Segment tree: each node stores the answer for a segment; query and point update are O(log n), build is O(n).',
    'The combine function and the identity are the only things that change between sum, min, max and GCD trees.',
    'Lazy propagation makes range updates O(log n) by storing pending work on nodes and pushing it down on demand.',
    'Fenwick tree: shorter and faster for prefix sums with point updates; i & -i is the whole trick.',
    'Use Fenwick only for invertible operations (sum, xor). Use segment trees for min, max and anything with lazy range updates.',
    'Inversion count, order statistics and "count less than x in range" are classic BIT and segment tree applications.'
  ],
  interview: [
    { q: 'Design a data structure for range sum queries and point updates on an array of 10^5 elements with 10^5 operations.', a: '<p>Both prefix sums (O(n) update) and plain arrays (O(n) query) give 10^10 operations. A Fenwick tree gives O(log n) for both, about 17 steps each, so roughly 3.4 million operations. If the question later adds range minimum or range updates, I would switch to a segment tree with lazy propagation.</p>' },
    { q: 'Explain lazy propagation and the bug people most often make.', a: '<p>When a range update fully covers a node\'s segment, we update that node\'s aggregate and store a pending tag instead of descending. Before any later operation descends into that node\'s children, we push the tag down to them. The common bug is forgetting to push down during queries, which returns stale child values.</p>' },
    { q: 'Why is a segment tree sized 4n and not 2n?', a: '<p>In the recursive layout with children at 2i and 2i+1, if n is not a power of two the tree is unbalanced and node indices can go up to about 4n. The iterative bottom-up layout stores leaves at n..2n-1 and needs exactly 2n, but is harder to combine with lazy propagation.</p>' },
    { q: 'How would you count, for each element, how many elements to its left are smaller?', a: '<p>Compress values to ranks 1..m, walk left to right, and for each element query Prefix(rank-1) on a Fenwick tree, then Add(rank, 1). O(n log n). This is the same idea as inversion counting in the other direction.</p>' }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-string-matching — KMP, Z, Rabin-Karp, Manacher                   */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-string-matching'] = {
  hook: `Ctrl+F feels instant because nobody checks every position letter by letter. Four algorithms make "find this pattern" run in time proportional to the text, no matter how tricky the pattern is.`,
  intro: `<p><span class="term">Pattern matching</span> means finding every place where a short string (the <span class="term">pattern</span>, length m) appears inside a long string (the <span class="term">text</span>, length n). It sounds simple, and the naive way is simple: try every starting position and compare character by character. But the naive way can cost O(n·m), and on a 10 MB log file with a 1,000 character pattern that is 10 billion comparisons.</p>
<p>The clever algorithms all share one idea: when a comparison fails, do not throw away what you learned. <span class="term">KMP</span> precomputes how far the pattern can slide after a mismatch. The <span class="term">Z-algorithm</span> computes, for every position, how long the text matches its own beginning. <span class="term">Rabin-Karp</span> compares numbers (hashes) instead of strings, so each check is O(1). <span class="term">Manacher</span> finds the longest palindrome in O(n) by reusing mirrored information.</p>
<p>All four run in O(n + m) (Rabin-Karp on average, the others always). You will write each one in C#, understand why it is linear, and learn which one fits which problem: single pattern, many patterns, palindromes, or "count occurrences".</p>`,
  realLife: {
    title: 'The proofreader who remembers what she just read',
    body: `<p>A proofreader searches a book for the phrase "ABABAC". She reads "ABABAB" and the last letter fails. A careless proofreader would go back to the second letter and start over. A smart one notices: "the last four letters I read, ABAB, are also how the phrase starts. So I can pretend I have already matched ABAB and only need to check from the fifth letter." She never re-reads a letter of the book. That is KMP.</p>
<p>Rabin-Karp is like comparing fingerprints instead of faces. Compute a number for the pattern. Slide a window over the text, computing a number for each window in O(1) by subtracting the letter that left and adding the letter that entered. Only when fingerprints match do you compare the actual letters.</p>
<p><strong>Where companies use this:</strong> grep and editors use KMP-style automata. Plagiarism checkers and Git's delta compression use rolling hashes (Rabin-Karp). DNA sequence tools search billions of bases with suffix structures built on Z-like ideas. Intrusion detection systems match thousands of signatures against network packets with Aho-Corasick, which is KMP generalised to many patterns.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Naive search and why it can be slow</h4>
<p>For each start position i from 0 to n-m, compare text[i..i+m) with the pattern. Stop at the first mismatch. On normal English text this is fast, because mismatches happen early. The bad case is text "AAAAAAAAAB" and pattern "AAAB": every position matches almost to the end before failing, so the cost is close to n × m.</p>
<h4>KMP: never re-read the text</h4>
<p>KMP first studies the pattern and builds an array called <span class="term">LPS</span> (longest proper prefix which is also a suffix). lps[i] is the length of the longest piece at the start of the pattern that also ends at position i. For "ABABAC", lps = [0, 0, 1, 2, 3, 0]. When a mismatch happens after matching j characters, the pattern slides so that lps[j-1] characters are already considered matched, and the text pointer never moves backward. Total time O(n + m).</p>
<div class="callout tip">The LPS array is also the answer to "what is the shortest string that, repeated, makes this pattern" and "longest prefix that is also a suffix". Interviewers ask both.</div>
<h4>Z-algorithm: match against the beginning</h4>
<p>For a string s, z[i] is the length of the longest substring starting at i that equals a prefix of s. To search for pattern p in text t, build the string p + "#" + t (with a separator that appears in neither). Every position where z[i] equals the pattern length is a match. The clever part is computing z in O(n) by keeping the rightmost matched box [l, r] and reusing z values inside it.</p>
<h4>Rabin-Karp: compare numbers, not strings</h4>
<p>Treat a string as a number in base b (say 256 or a prime like 131) modulo a big prime. The hash of the next window can be computed from the previous one in O(1): remove the leading character's contribution, multiply by the base, add the new character. If window hash equals pattern hash, verify with a real comparison to rule out a collision. Expected time O(n + m).</p>
<h4>Manacher: longest palindrome in linear time</h4>
<p>Checking every center and expanding outward is O(n²). Manacher keeps the rightmost palindrome found so far and uses mirror symmetry: a position inside a known palindrome has a mirror position on the other side, and the mirror's radius gives a free lower bound. Expanding beyond that bound only ever moves the right boundary forward, so the total is O(n).</p>` },
    { name: 'Intermediate', body: `<h4>Building the LPS array</h4>
<p>Two pointers: i walks the pattern, len is the current matched prefix length. If p[i] == p[len], then lps[i] = len + 1, advance both. If they differ and len &gt; 0, set len = lps[len - 1] (fall back to a shorter border) and retry without advancing i. If len == 0, lps[i] = 0 and advance i. Each step either advances i or decreases len, and len only grows with i, so the total is O(m).</p>
<h4>KMP search loop</h4>
<p>Walk the text with i, the pattern with j. Match: advance both; if j reaches m, record a hit at i - m and set j = lps[j-1] to look for overlapping matches. Mismatch: if j &gt; 0, j = lps[j-1]; else advance i. The same amortised argument gives O(n).</p>
<h4>Z-array details</h4>
<p>Maintain [l, r], the box of the rightmost segment matching a prefix. For i inside the box, z[i] starts at min(r - i + 1, z[i - l]). Then expand while characters match. If the expansion pushes past r, update l and r. Each character is compared successfully at most once beyond r, which is why it is linear.</p>
<h4>Rabin-Karp: picking base and modulus</h4>
<p>Use a large prime modulus like 1_000_000_007 or, better, two different moduli (double hashing) so collisions become practically impossible. Precompute base^(m-1) mod M for the removal step. Keep every value as long and apply the modulus after each multiply. For case-insensitive search, lower-case the characters before hashing.</p>
<h4>Many patterns: Aho-Corasick in one paragraph</h4>
<p>Put all patterns into a trie. Add a "failure link" to every node, the KMP idea generalised: where to go when the next character does not match. Then scan the text once, following trie edges and failure links. Finds all occurrences of all patterns in O(n + total pattern length + matches). Used in spam filters and intrusion detection.</p>
<h4>Manacher implementation shape</h4>
<p>Transform "abba" into "^#a#b#b#a#$" so even and odd palindromes behave the same. Keep arrays p[i] (radius at i), center c and right edge r. For each i: mirror = 2c - i; p[i] = i &lt; r ? min(r - i, p[mirror]) : 0; expand while the characters match; if i + p[i] &gt; r, set c = i, r = i + p[i]. The longest palindrome is the max p[i], and its start in the original string is (i - p[i]) / 2.</p>
<div class="callout warn">Rabin-Karp without verifying candidate matches is wrong by design. A hash equality is only probable equality. Always compare the actual characters, unless the problem explicitly accepts a tiny error rate.</div>` },
    { name: 'Expert', body: `<h4>Comparing the four</h4>
<table><thead><tr><th>Algorithm</th><th>Preprocess</th><th>Search</th><th>Best for</th></tr></thead><tbody>
<tr><td>KMP</td><td>O(m)</td><td>O(n), worst case guaranteed</td><td>Single pattern, streaming text, no extra memory</td></tr>
<tr><td>Z</td><td>O(n + m) on combined string</td><td>same pass</td><td>Prefix-related queries, periodicity, compact code</td></tr>
<tr><td>Rabin-Karp</td><td>O(m)</td><td>O(n) expected, O(nm) worst</td><td>Many patterns of the same length, 2D search, substring equality queries</td></tr>
<tr><td>Manacher</td><td>-</td><td>O(n)</td><td>Longest / all palindromic substrings</td></tr>
</tbody></table>
<h4>Borders and periods</h4>
<p>A <span class="term">border</span> of a string is a prefix that is also a suffix. lps[m-1] is the longest border. The smallest period of the pattern is m - lps[m-1]. If m is divisible by that period, the pattern is a repetition of a shorter block. This single fact solves "repeated substring pattern", "minimum characters to append to make a string periodic" and several codeforces classics.</p>
<h4>Rolling hash as a general tool</h4>
<p>Precompute prefix hashes h[i] of the text and powers of the base. Then the hash of any substring [l, r) is h[r] - h[l] × base^(r-l), in O(1). This turns "are these two substrings equal" into a constant-time check, which powers binary search on the longest common prefix, suffix-array construction in O(n log² n), and longest repeated substring. Collision probability with a 61-bit Mersenne modulus is about 1 in 10^18 per comparison; with 1e9+7 alone it is about 1 in 10^9, which an adversarial test can break (anti-hash tests). Use a random base at run time.</p>
<h4>KMP as a finite automaton</h4>
<p>KMP can be compiled into a table next[state][char] of size m × alphabet. Then the search is one table lookup per character with no inner loop, which is how some regex engines and network filters run at line speed. Memory grows with the alphabet, so for Unicode text you keep the lps version.</p>
<h4>Suffix structures (the next level)</h4>
<p>When the text is fixed and queries are many, build a <span class="term">suffix array</span> (sorted suffixes, O(n log n)) plus an LCP array, or a <span class="term">suffix automaton</span> (O(n) states that recognise every substring). They answer "how many distinct substrings", "longest common substring of two strings" and "k-th smallest substring" quickly. Know they exist and what they answer; implementing them cold in an interview is rare.</p>
<h4>Failure modes</h4>
<ul>
<li>Overlapping matches: after a hit, set j = lps[j-1], not 0, or you miss "AAA" in "AAAA" at position 1.</li>
<li>Separator choice in Z: the character must not appear in either string, or the box can cross it.</li>
<li>Negative hash values after subtraction: add the modulus before taking the remainder.</li>
<li>Manacher index arithmetic: forgetting the sentinel characters at both ends causes out-of-range reads.</li>
</ul>` }
  ],
  flow: {
    title: 'KMP sliding the pattern without re-reading the text',
    steps: [
      { title: 'Build LPS', desc: 'For the pattern "ABABAC", compute lps = [0,0,1,2,3,0]: at each index, the longest prefix that is also a suffix of the pattern up to there.' },
      { title: 'Scan the text', desc: 'Compare text[i] with pattern[j]. On a match, move both pointers forward.' },
      { title: 'Mismatch happens', desc: 'Say we matched "ABABA" (j = 5) and then the text has B, not C.' },
      { title: 'Look up the fallback', desc: 'lps[j-1] = lps[4] = 3. The last three matched characters "ABA" are also the start of the pattern.' },
      { title: 'Slide, do not rewind', desc: 'Set j = 3 and keep i where it is. The text pointer never goes backwards, which is why the whole scan is O(n).' },
      { title: 'Full match', desc: 'When j reaches the pattern length, record a hit at i - m, then set j = lps[m-1] to continue searching for overlapping matches.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'KMP: LPS array, search for all occurrences, period of a string', code: `using System;
using System.Collections.Generic;

public static class Kmp
{
    // lps[i] = length of the longest proper prefix of p[0..i] that is also a suffix of it. O(m).
    public static int[] BuildLps(string p)
    {
        var lps = new int[p.Length];
        int len = 0;                                  // length of the current matched prefix
        for (int i = 1; i < p.Length; )
        {
            if (p[i] == p[len]) { lps[i++] = ++len; }
            else if (len > 0) len = lps[len - 1];     // fall back to a shorter border, do not advance i
            else lps[i++] = 0;
        }
        return lps;
    }

    // All start indexes where pattern occurs in text (overlaps included). O(n + m).
    public static List<int> Search(string text, string pattern)
    {
        var hits = new List<int>();
        if (pattern.Length == 0) return hits;
        var lps = BuildLps(pattern);
        int j = 0;                                    // matched characters of pattern so far
        for (int i = 0; i < text.Length; )
        {
            if (text[i] == pattern[j])
            {
                i++; j++;
                if (j == pattern.Length)
                {
                    hits.Add(i - j);
                    j = lps[j - 1];                   // allow overlapping matches
                }
            }
            else if (j > 0) j = lps[j - 1];           // slide pattern, keep i
            else i++;
        }
        return hits;
    }

    // Smallest period of s. If s.Length % period == 0 the string is a repeat of its first 'period' chars.
    public static int SmallestPeriod(string s)
    {
        var lps = BuildLps(s);
        return s.Length - lps[s.Length - 1];
    }

    public static bool IsRepeatedPattern(string s)
    {
        int period = SmallestPeriod(s);
        return period < s.Length && s.Length % period == 0;
    }
}

// Kmp.Search("ABABABAC ABABAC", "ABABAC")  // [2, 9]
// Kmp.Search("AAAA", "AA")                  // [0, 1, 2]
// Kmp.IsRepeatedPattern("abcabcabc")        // true (period 3)` },
    { lang: 'csharp', title: 'Z-algorithm: z-array and pattern search with a separator', code: `using System;
using System.Collections.Generic;

public static class ZAlgo
{
    // z[i] = length of the longest substring starting at i that is also a prefix of s. z[0] = n. O(n).
    public static int[] ZArray(string s)
    {
        int n = s.Length;
        var z = new int[n];
        z[0] = n;
        int l = 0, r = 0;                             // [l, r] = rightmost box matching a prefix
        for (int i = 1; i < n; i++)
        {
            if (i <= r) z[i] = Math.Min(r - i + 1, z[i - l]);   // reuse mirrored info inside the box
            while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;   // extend by direct comparison
            if (i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }       // box moved right
        }
        return z;
    }

    // All occurrences of pattern in text. Uses a separator that must not appear in either string.
    public static List<int> Search(string text, string pattern, char sep = '\\u0001')
    {
        var hits = new List<int>();
        if (pattern.Length == 0 || pattern.Length > text.Length) return hits;
        string s = pattern + sep + text;
        var z = ZArray(s);
        int offset = pattern.Length + 1;
        for (int i = offset; i < s.Length; i++)
            if (z[i] == pattern.Length) hits.Add(i - offset);
        return hits;
    }

    // Number of distinct prefixes of s that are also suffixes (the borders), using z.
    public static List<int> Borders(string s)
    {
        var z = ZArray(s); var res = new List<int>();
        for (int i = 1; i < s.Length; i++)
            if (i + z[i] == s.Length) res.Add(z[i]);   // a suffix starting at i matching the prefix
        return res;
    }
}

// ZAlgo.ZArray("aabxaab")           // [7,1,0,0,3,1,0]
// ZAlgo.Search("abcabcabd", "abc")  // [0, 3]
// ZAlgo.Borders("abcab")            // [2]` },
    { lang: 'csharp', title: 'Rabin-Karp rolling hash and O(1) substring equality', code: `using System;
using System.Collections.Generic;

public static class RabinKarp
{
    const long MOD = 1_000_000_007L;
    const long BASE = 131;                            // any value larger than the alphabet works; random is safer

    // Find all occurrences, verifying each candidate to rule out hash collisions. O(n + m) expected.
    public static List<int> Search(string text, string pattern)
    {
        var hits = new List<int>();
        int n = text.Length, m = pattern.Length;
        if (m == 0 || m > n) return hits;

        long high = 1;                                // BASE^(m-1) mod MOD, used to remove the leading char
        for (int i = 0; i < m - 1; i++) high = high * BASE % MOD;

        long hp = 0, ht = 0;
        for (int i = 0; i < m; i++)
        {
            hp = (hp * BASE + pattern[i]) % MOD;
            ht = (ht * BASE + text[i]) % MOD;
        }

        for (int i = 0; ; i++)
        {
            if (hp == ht && string.CompareOrdinal(text, i, pattern, 0, m) == 0)   // verify!
                hits.Add(i);
            if (i + m >= n) break;
            ht = (ht - text[i] * high % MOD + MOD) % MOD;   // remove leading char (keep non-negative)
            ht = (ht * BASE + text[i + m]) % MOD;          // add the new trailing char
        }
        return hits;
    }
}

// Prefix hashes let you compare any two substrings in O(1).
public class StringHasher
{
    const long MOD = 1_000_000_007L;
    private readonly long[] h, pow;

    public StringHasher(string s, long baseValue = 131)
    {
        int n = s.Length; h = new long[n + 1]; pow = new long[n + 1]; pow[0] = 1;
        for (int i = 0; i < n; i++)
        {
            h[i + 1] = (h[i] * baseValue + s[i]) % MOD;
            pow[i + 1] = pow[i] * baseValue % MOD;
        }
    }

    // Hash of s[l..r) in O(1).
    public long Hash(int l, int r) => ((h[r] - h[l] * pow[r - l]) % MOD + MOD) % MOD;

    public bool Equal(int l1, int l2, int len) => Hash(l1, l1 + len) == Hash(l2, l2 + len);
}

// RabinKarp.Search("hello world, hello", "hello")   // [0, 13]
// var hs = new StringHasher("abcabc"); hs.Equal(0, 3, 3)  // true` },
    { lang: 'csharp', title: 'Manacher: longest palindromic substring in O(n)', code: `using System;
using System.Text;

public static class Manacher
{
    // Returns the longest palindromic substring of s. O(n).
    public static string Longest(string s)
    {
        if (s.Length < 2) return s;

        // Transform: "abba" -> "^#a#b#b#a#$" so even and odd palindromes look the same.
        var sb = new StringBuilder("^");
        foreach (char c in s) { sb.Append('#'); sb.Append(c); }
        sb.Append("#$");
        string t = sb.ToString();

        int n = t.Length;
        var p = new int[n];                           // p[i] = radius of palindrome centred at i (in t)
        int center = 0, right = 0;                    // rightmost palindrome [center - right.., right]
        int bestLen = 0, bestCenter = 0;

        for (int i = 1; i < n - 1; i++)
        {
            int mirror = 2 * center - i;
            if (i < right) p[i] = Math.Min(right - i, p[mirror]);   // free lower bound from the mirror

            while (t[i + p[i] + 1] == t[i - p[i] - 1]) p[i]++;     // expand (sentinels stop it)

            if (i + p[i] > right) { center = i; right = i + p[i]; } // new rightmost palindrome

            if (p[i] > bestLen) { bestLen = p[i]; bestCenter = i; }
        }

        int start = (bestCenter - bestLen) / 2;       // map back to the original string
        return s.Substring(start, bestLen);
    }

    // Count all palindromic substrings using the same radii. O(n).
    public static long CountPalindromes(string s)
    {
        var sb = new StringBuilder("^");
        foreach (char c in s) { sb.Append('#'); sb.Append(c); }
        sb.Append("#$");
        string t = sb.ToString();
        var p = new int[t.Length]; int center = 0, right = 0; long total = 0;
        for (int i = 1; i < t.Length - 1; i++)
        {
            int mirror = 2 * center - i;
            if (i < right) p[i] = Math.Min(right - i, p[mirror]);
            while (t[i + p[i] + 1] == t[i - p[i] - 1]) p[i]++;
            if (i + p[i] > right) { center = i; right = i + p[i]; }
            total += (p[i] + 1) / 2;                  // each radius contributes this many real palindromes
        }
        return total;
    }
}

// Manacher.Longest("babad")        // "bab" (or "aba")
// Manacher.Longest("cbbd")         // "bb"
// Manacher.CountPalindromes("aaa") // 6` }
  ],
  pitfalls: [
    'Resetting j to 0 after a full KMP match. You must set j = lps[m-1] or you miss overlapping occurrences.',
    'Trusting hash equality in Rabin-Karp without verifying the characters. Collisions are rare but real, and an adversarial input can force them.',
    'Letting the rolling hash go negative after subtracting the leading character. Add MOD before taking the remainder.',
    'Using a Z separator character that can appear in the text (like a space). The prefix box then crosses into the text and z values become wrong.',
    'Checking palindromes by expanding from every centre and calling it "Manacher". That is O(n²). Manacher reuses the mirror radius to stay O(n).',
    'Building the LPS with a loop that resets len to 0 on every mismatch. The correct fallback is len = lps[len-1], which keeps the algorithm linear.'
  ],
  quiz: [
    { q: 'What does lps[i] mean in KMP?', options: ['The index in the text where the next mismatch will happen after position i', 'The length of the longest proper prefix of pattern[0..i] that is also its suffix', 'The number of occurrences of the pattern found in the text up to position i', 'The distance from pattern[i] back to the previous position with the same character'], answer: 1, why: 'LPS tells KMP how many characters are still "matched" after a mismatch, so it can slide the pattern without re-reading the text.' },
    { q: 'Why is KMP O(n + m) even though it has a loop inside a loop?', options: ['Because the pattern is always much shorter than the text it is searched in', 'Because i never moves back and j can only fall as far as it rose', 'Because hashing lets it compare a whole window in one step', 'Because mismatches are rare in real text, so the inner loop hardly runs'], answer: 1, why: 'Each step advances i or shrinks j. j can only shrink as much as it grew, so total work is at most 2n.' },
    { q: 'Rabin-Karp found equal hashes for a window and the pattern. What must happen next?', options: ['Record a match immediately and slide the window on', 'Compare the actual characters to confirm', 'Restart the hash from the start of the text', 'Increase the modulus and hash again'], answer: 1, why: 'Equal hashes mean probable equality. Verifying rules out collisions and keeps the algorithm correct.' },
    { q: 'To search pattern p in text t with the Z-algorithm, what string do you build?', options: ['t + p', 'p + separator + t', 't + separator + p', 'p repeated twice'], answer: 1, why: 'z values inside the text part that equal the pattern length mark matches, and the separator stops matches from running past the pattern.' },
    { q: 'What does Manacher do with the "#" characters?', options: ['Marks the word boundaries so palindromes stop at spaces', 'Lets even and odd palindromes be handled the same way', 'Speeds up the hashing of each half of the palindrome', 'Encodes the alphabet so every letter fits in one byte'], answer: 1, why: 'Inserting a separator between every character turns every palindrome into an odd-length one centred on a real or inserted character.' },
    { q: 'The smallest period of a string of length m with lps[m-1] = k is:', options: ['k', 'm - k', 'm / k', 'k + 1'], answer: 1, why: 'The longest border has length k, and shifting by m - k lines the string up with itself, so m - k is the smallest period.' }
  ],
  takeaways: [
    'Naive search is O(n·m) in the worst case; KMP, Z, Rabin-Karp and Manacher all run in O(n + m) (Rabin-Karp on average).',
    'KMP precomputes the LPS array so the text pointer never moves backwards.',
    'The Z-array measures how far each position matches the prefix; pattern + separator + text turns it into a search.',
    'Rabin-Karp compares rolling hashes in O(1) per window; always verify a candidate match.',
    'Prefix hashes give O(1) substring equality, which unlocks binary search on string problems.',
    'Manacher finds the longest palindrome in O(n) by reusing the mirror radius inside the rightmost palindrome.'
  ],
  interview: [
    { q: 'Explain how KMP avoids re-scanning the text after a mismatch.', a: '<p>It precomputes, for every pattern prefix, the longest border (prefix that is also a suffix). After matching j characters and failing, the last lps[j-1] characters of what was matched are also the pattern\'s beginning, so the algorithm sets j = lps[j-1] and continues comparing at the same text position. Because i never decreases and j decreases only as much as it grew, the scan is linear.</p>' },
    { q: 'When would you choose Rabin-Karp over KMP?', a: '<p>When I need to find many patterns of the same length at once (hash each pattern into a set, then one pass over the text), when I need O(1) substring equality for a bigger algorithm such as binary search on the longest common substring, or for 2D pattern matching. For a single pattern with a guaranteed worst case, KMP is the safer choice.</p>' },
    { q: 'How do you find the shortest palindrome you can make by adding characters to the front of s?', a: '<p>Find the longest palindromic prefix of s. Build the string s + "#" + reverse(s) and compute its LPS (or Z); the last LPS value is the length of that prefix. Reverse the remaining suffix and prepend it. O(n).</p>' },
    { q: 'What is the collision risk of a rolling hash and how do you reduce it?', a: '<p>With modulus 1e9+7 the chance that two different strings collide is about 1 in 1e9 per comparison, and adversarial tests exist that break fixed bases. Use a random base chosen at run time, a larger modulus such as 2^61 - 1, or two independent hashes together, and always verify characters when a match matters.</p>' }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-dp-advanced — Bitmask, Digit DP, DP on Trees, Optimizations      */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-dp-advanced'] = {
  hook: `Basic DP has a state like "which index". Advanced DP has states like "which subset", "which digits so far", or "which subtree". The recipe is the same; only the state gets more creative.`,
  intro: `<p>Once you can write knapsack and LCS, the next wall is problems where the state is not a simple index. <span class="term">Bitmask DP</span> uses the bits of an integer to remember which items from a small set have been used. <span class="term">Digit DP</span> builds numbers one digit at a time to count how many numbers in a range have some property. <span class="term">DP on trees</span> computes an answer for every subtree and combines children into parents.</p>
<p>The second theme is speed. A correct DP can still be too slow: O(n²) with n = 10^5 is dead. <span class="term">Space optimisation</span> keeps only the rows you need. <span class="term">Monotonic deque</span> turns a sliding-window minimum inside a transition from O(k) to O(1). <span class="term">Divide and conquer optimisation</span> and <span class="term">Knuth's optimisation</span> cut O(n²) or O(n³) interval DPs down by a factor of n when the cost function behaves.</p>
<p>These techniques appear in the hardest interview rounds and throughout competitive programming. This lesson gives you the state design for each, a working C# version, and the test that tells you when an optimisation is allowed.</p>`,
  realLife: {
    title: 'The courier with eight parcels and one van',
    body: `<p>A courier has 8 parcels for 8 addresses and wants the shortest round trip. 8! = 40,320 orders is fine to brute force, but 16 parcels is 20 trillion. Bitmask DP says: the only things that matter are "which addresses have I visited" (a 16-bit number) and "where am I now". That is 65,536 × 16 states, each computed once. From 20 trillion to about 16 million operations. That is the travelling salesman DP, used in route planning for small vehicle fleets and in chip design for wire ordering.</p>
<p>Digit DP is like a bank teller counting how many account numbers between 1 and 10^18 contain no two adjacent equal digits. You cannot list them; you count by building the number left to right and remembering only "am I still tied to the upper limit" and "what was the last digit".</p>
<p><strong>Where companies use this:</strong> logistics firms solve small TSP instances exactly with bitmask DP inside bigger heuristics. Compilers use DP on expression trees for instruction selection. Networking gear sizes routing tables with digit-DP-like counting over IP prefixes. Game AI uses bitmask states for board positions.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Bitmask: an integer as a set</h4>
<p>With n ≤ 20 items, an int can hold which ones are chosen: bit i is 1 if item i is in the set. Useful operations: check bit (mask &gt;&gt; i) &amp; 1; add bit mask | (1 &lt;&lt; i); remove bit mask &amp; ~(1 &lt;&lt; i); count bits BitOperations.PopCount. There are 2^n masks, so a DP over masks costs at least O(2^n), fine for n up to about 20.</p>
<h4>Assignment problem with bitmask</h4>
<p>n workers, n jobs, cost[w][j]. Assign each job to exactly one worker with minimum total cost. State: dp[mask] = minimum cost to assign the first popcount(mask) workers to the jobs in mask. Transition: the next worker takes any job not in mask. O(2^n × n). This is the template: process items in order, the mask records which "slots" are taken.</p>
<h4>Travelling salesman</h4>
<p>dp[mask][last] = shortest path that visits exactly the cities in mask and ends at city last. Transition: go to any city not in mask. Answer: min over last of dp[full][last] + dist[last][start]. O(2^n × n²). Works to n ≈ 18 to 20.</p>
<h4>Digit DP: counting numbers digit by digit</h4>
<p>"How many numbers in [0, N] have digit sum divisible by 3?" Write N as a string of digits. Walk from the most significant digit. State: (position, property so far, tight) where tight means "every digit so far equals N's digit, so the next digit is capped by N's digit". If not tight, any digit 0..9 is allowed. Count in [L, R] = count(R) - count(L - 1).</p>
<div class="callout tip">Digit DP has only three ingredients: position, the property you are tracking (sum mod 3, last digit, number of 7s), and the tight flag. Sometimes a fourth: "have I placed a non-zero digit yet" to handle leading zeros.</div>
<h4>DP on trees: children first</h4>
<p>Root the tree. Compute something for each node using only its children's answers, in post-order (DFS, then combine). Example: size of subtree, height, "maximum sum of nodes with no two adjacent chosen" (the tree version of house robber), diameter. State per node is usually a small tuple like (best if node taken, best if not taken).</p>
<h4>Space optimisation: keep only what you read</h4>
<p>If row i reads only row i-1, keep two arrays and swap. If it reads row i-1 at smaller columns, a single array updated right-to-left works. This turns O(n·m) memory into O(m) and often makes the loop faster because it fits in cache.</p>` },
    { name: 'Intermediate', body: `<h4>Bitmask DP tricks</h4>
<ul>
<li><strong>Iterate submasks of a mask:</strong> for (int sub = mask; sub &gt; 0; sub = (sub - 1) &amp; mask). Across all masks this is O(3^n), which is the cost of "partition the set into groups" problems.</li>
<li><strong>Sum over subsets (SOS DP):</strong> for every mask, the sum of f(sub) over all submasks, in O(n × 2^n) instead of O(3^n). Loop over bits, and for each mask with that bit set add dp[mask without bit].</li>
<li><strong>Profile DP (broken profile):</strong> tiling a grid with dominoes, the state is the mask of the last row's filled cells. Columns ≤ 10 to 12.</li>
</ul>
<h4>Digit DP implementation shape</h4>
<p>Recursive function Count(pos, state, tight, started) with a memo keyed on (pos, state, tight, started). At each position the max digit is tight ? digits[pos] : 9. Loop d from 0 to max, update state, new tight = tight &amp;&amp; d == max. The memo makes it O(positions × states × 2 × 2 × 10). For 18-digit numbers that is tiny.</p>
<h4>DP on trees: rerooting</h4>
<p>If you need the answer for every node as root (e.g. sum of distances from each node to all others), compute the down answer once, then do a second DFS that passes the "up" answer from parent to child in O(1). Total O(n). This is <span class="term">rerooting</span> and it turns many O(n²) tree problems into O(n).</p>
<h4>Tree diameter and max independent set</h4>
<p>Diameter: for each node, the two longest downward paths from its children; diameter candidate is their sum. One DFS. Max weight independent set: take[node] = weight + sum of skip[child]; skip[node] = sum of max(take[child], skip[child]).</p>
<h4>LIS variants</h4>
<ul>
<li>Non-decreasing instead of increasing: binary search for the first element greater than x, not greater or equal.</li>
<li>Number of LIS: keep count arrays alongside lengths (O(n²)), or a Fenwick tree of (length, count) pairs for O(n log n).</li>
<li>Longest chain of pairs / envelopes: sort by first key ascending and second key descending, then LIS on the second key.</li>
</ul>
<h4>Monotonic deque optimisation</h4>
<p>Transition dp[i] = min over j in [i-k, i-1] of dp[j] + cost(i), where cost does not depend on j. The min over a sliding window is a classic deque problem: keep indices with increasing dp values, pop from the back while the new value is smaller, pop from the front when it leaves the window. O(n) total instead of O(n·k).</p>
<div class="callout warn">Monotonic deque only applies when the term involving j is separable from the term involving i. If the cost mixes i and j (like (a[i] - a[j])²), you need the convex hull trick instead.</div>` },
    { name: 'Expert', body: `<h4>Divide and conquer optimisation</h4>
<p>Shape: dp[i][j] = min over k &lt; j of dp[i-1][k] + C(k, j), with n columns and m rows. Plain cost O(m·n²). If the optimal k for j, call it opt(j), is monotone (opt(j) ≤ opt(j+1)), you can compute a row by recursion: solve the middle column, learn its opt, and recurse on the left half with k bounded above and the right half with k bounded below. Each row becomes O(n log n). The monotonicity usually follows from the <span class="term">quadrangle inequality</span>: C(a, c) + C(b, d) ≤ C(a, d) + C(b, c) for a ≤ b ≤ c ≤ d. Used for "split array into m groups minimising sum of group costs".</p>
<h4>Knuth's optimisation</h4>
<p>For interval DP dp[i][j] = min over i ≤ k &lt; j of dp[i][k] + dp[k+1][j] + C(i, j) (e.g. optimal binary search tree, merging files), if C satisfies the quadrangle inequality and is monotone on intervals, then opt(i, j-1) ≤ opt(i, j) ≤ opt(i+1, j). Restricting k to that window makes the whole table O(n²) instead of O(n³). Check the inequality on small cases before trusting it; matrix chain multiplication does NOT satisfy it.</p>
<h4>Convex hull trick in one paragraph</h4>
<p>When the transition is dp[i] = min over j of (dp[j] + b[j] × a[i]), each j is a line y = b[j]·x + dp[j] and you want the minimum at x = a[i]. If slopes are added in sorted order and queries are monotone, a deque of lines gives O(1) amortised per step. Otherwise a Li Chao tree gives O(log n). This is the tool for problems like "minimum cost to buy items where cost is slope × count".</p>
<h4>Bitmask at the edge</h4>
<p>n = 20 means 10^6 masks; with an inner loop of n that is 2 × 10^7, comfortable. n = 25 needs 3 × 10^7 masks × 25, borderline. Beyond that, meet in the middle: split the set, enumerate both halves (2^(n/2) each), and combine with sorting or hashing. Memory for dp[mask][last] with n = 20 is 20 × 2^20 ints = 80 MB; use ushort or int where values allow, or iterate masks in increasing order so only "reachable" states are stored in a dictionary.</p>
<h4>Correctness checks before optimising</h4>
<ul>
<li>Write the O(n²) or O(n³) version first and keep it as a test oracle.</li>
<li>For D&amp;C optimisation, assert opt(j) ≤ opt(j+1) on random inputs with the slow version.</li>
<li>For Knuth, assert the window property on random inputs.</li>
<li>For the deque, assert that the window min matches a brute-force min on small sizes.</li>
</ul>
<h4>Memory and recursion in .NET</h4>
<p>Digit DP and tree DP are recursive. Tree depth can reach n on a path graph; use an iterative post-order (explicit stack of (node, parent, visitedChildren)) or a worker thread with a 256 MB stack for n up to a few million. Memo dictionaries keyed by tuples are convenient but slow; flatten to a multi-dimensional array when the state space is dense.</p>
<div class="callout idea">If an interviewer says "n is at most 15" or "at most 20", they are telling you the solution is exponential in n. Think bitmask before anything else.</div>` }
  ],
  flow: {
    title: 'Bitmask DP for the travelling salesman',
    steps: [
      { title: 'Encode the state', desc: 'mask = which cities are already visited (one bit per city). last = the city we are standing in. dp[mask][last] = shortest distance so far.' },
      { title: 'Base case', desc: 'Start at city 0: dp[1][0] = 0 (mask with only bit 0 set). Every other state starts at infinity.' },
      { title: 'Iterate masks in increasing order', desc: 'A bigger mask always comes from a smaller one, so increasing order guarantees each state is final before it is used.' },
      { title: 'Try every next city', desc: 'For each last with a finite dp, and each city nxt not in mask, candidate = dp[mask][last] + dist[last][nxt]. Update dp[mask | bit(nxt)][nxt] if smaller.' },
      { title: 'Close the tour', desc: 'When mask has all bits set, add dist[last][0] to return home. The minimum over last is the answer.' },
      { title: 'Count the work', desc: '2^n masks × n choices of last × n choices of next = O(2^n × n²). n = 16 is about 16 million steps.' },
      { title: 'Recover the route', desc: 'Store parent[mask][last] when updating. Walk backwards from the best final state to print the city order.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Bitmask DP: travelling salesman and the assignment problem', code: `using System;
using System.Collections.Generic;
using System.Numerics;

public static class BitmaskDp
{
    // Shortest tour visiting all cities once and returning to 0. O(2^n * n^2). n <= ~18.
    public static (long best, List<int> route) Tsp(int[,] dist)
    {
        int n = dist.GetLength(0), full = (1 << n) - 1;
        const long INF = long.MaxValue / 4;
        var dp = new long[1 << n, n];
        var parent = new int[1 << n, n];
        for (int m = 0; m <= full; m++) for (int i = 0; i < n; i++) { dp[m, i] = INF; parent[m, i] = -1; }
        dp[1, 0] = 0;                                              // start at city 0

        for (int mask = 1; mask <= full; mask++)
            for (int last = 0; last < n; last++)
            {
                if (dp[mask, last] >= INF || (mask & (1 << last)) == 0) continue;
                for (int nxt = 0; nxt < n; nxt++)
                {
                    if ((mask & (1 << nxt)) != 0) continue;            // already visited
                    int nm = mask | (1 << nxt);
                    long cand = dp[mask, last] + dist[last, nxt];
                    if (cand < dp[nm, nxt]) { dp[nm, nxt] = cand; parent[nm, nxt] = last; }
                }
            }

        long best = INF; int bestLast = -1;
        for (int last = 1; last < n; last++)
        {
            long total = dp[full, last] + dist[last, 0];
            if (total < best) { best = total; bestLast = last; }
        }

        // Reconstruct the route by walking parents backwards.
        var route = new List<int>();
        int cur = bestLast, m2 = full;
        while (cur != -1) { route.Add(cur); int p = parent[m2, cur]; m2 &= ~(1 << cur); cur = p; }
        route.Reverse();
        return (best, route);
    }

    // Assign n jobs to n workers (one each) with minimum cost. O(2^n * n).
    public static int MinAssignment(int[,] cost)
    {
        int n = cost.GetLength(0);
        var dp = new int[1 << n];
        Array.Fill(dp, int.MaxValue / 2);
        dp[0] = 0;
        for (int mask = 0; mask < (1 << n); mask++)
        {
            int worker = BitOperations.PopCount((uint)mask);        // next worker to place
            if (worker == n) continue;
            for (int job = 0; job < n; job++)
                if ((mask & (1 << job)) == 0)
                    dp[mask | (1 << job)] = Math.Min(dp[mask | (1 << job)], dp[mask] + cost[worker, job]);
        }
        return dp[(1 << n) - 1];
    }

    // Enumerate all submasks of mask (used in "partition into groups" DPs). O(2^popcount).
    public static IEnumerable<int> Submasks(int mask)
    {
        for (int sub = mask; ; sub = (sub - 1) & mask)
        {
            yield return sub;
            if (sub == 0) yield break;
        }
    }
}

// var d = new int[,] { {0,10,15,20}, {10,0,35,25}, {15,35,0,30}, {20,25,30,0} };
// BitmaskDp.Tsp(d)   // best 80, route 0 -> 2 -> 3 -> 1 (then back to 0)` },
    { lang: 'csharp', title: 'Digit DP: count numbers in [L, R] whose digit sum is divisible by k', code: `using System;

public static class DigitDp
{
    private static int[] digits = Array.Empty<int>();
    private static long[,,,] memo = new long[0, 0, 0, 0];
    private static int K;

    // How many x in [1, n] have digit sum % K == 0 (0 itself is not counted, see Go).
    public static long CountUpTo(long n, int k)
    {
        if (n < 0) return 0;
        K = k;
        string s = n.ToString();
        digits = new int[s.Length];
        for (int i = 0; i < s.Length; i++) digits[i] = s[i] - '0';
        memo = new long[s.Length, k, 2, 2];
        for (int a = 0; a < s.Length; a++) for (int b = 0; b < k; b++) for (int c = 0; c < 2; c++) for (int d = 0; d < 2; d++) memo[a, b, c, d] = -1;
        return Go(0, 0, tight: true, started: false);
    }

    // pos: index of digit we are placing. sum: digit sum mod K so far.
    // tight: are we still equal to n's prefix (so the next digit is capped)?
    // started: have we placed a non-zero digit yet (to treat leading zeros correctly)?
    private static long Go(int pos, int sum, bool tight, bool started)
    {
        if (pos == digits.Length) return (started && sum == 0) ? 1 : 0;   // 0 itself is excluded here; add 1 if wanted
        int t = tight ? 1 : 0, st = started ? 1 : 0;
        if (memo[pos, sum, t, st] != -1) return memo[pos, sum, t, st];

        int maxDigit = tight ? digits[pos] : 9;
        long total = 0;
        for (int d = 0; d <= maxDigit; d++)
        {
            bool nextTight = tight && d == maxDigit;
            bool nextStarted = started || d != 0;
            int nextSum = nextStarted ? (sum + d) % K : 0;
            total += Go(pos + 1, nextSum, nextTight, nextStarted);
        }
        return memo[pos, sum, t, st] = total;
    }

    // Count in a range using prefix subtraction.
    public static long CountInRange(long l, long r, int k) => CountUpTo(r, k) - CountUpTo(l - 1, k);
}

// DigitDp.CountInRange(1, 100, 3)   // 33  (3, 6, 9, ..., 99)
// DigitDp.CountInRange(1, 1_000_000_000_000_000_000L, 7)  // instant, 19 positions x 7 sums x 4 flags` },
    { lang: 'csharp', title: 'DP on trees: max independent set, diameter, and rerooting for sum of distances', code: `using System;
using System.Collections.Generic;

public static class TreeDp
{
    // Max total weight choosing nodes with no two adjacent. O(n). Iterative post-order to avoid deep recursion.
    public static long MaxIndependentSet(int n, List<int>[] adj, long[] weight)
    {
        var order = new List<int>(); var parent = new int[n]; Array.Fill(parent, -1);
        var stack = new Stack<int>(); stack.Push(0); var seen = new bool[n]; seen[0] = true;
        while (stack.Count > 0)                                   // pre-order
        {
            int u = stack.Pop(); order.Add(u);
            foreach (int v in adj[u]) if (!seen[v]) { seen[v] = true; parent[v] = u; stack.Push(v); }
        }
        var take = new long[n]; var skip = new long[n];
        for (int i = n - 1; i >= 0; i--)                          // reverse pre-order = children before parent
        {
            int u = order[i];
            take[u] += weight[u];                                 // take u: children must be skipped (already added below)
            if (parent[u] != -1)
            {
                take[parent[u]] += skip[u];
                skip[parent[u]] += Math.Max(take[u], skip[u]);
            }
        }
        return Math.Max(take[0], skip[0]);
    }

    // Diameter (longest path in edges) of a tree with one DFS. O(n).
    public static int Diameter(int n, List<int>[] adj)
    {
        int best = 0;
        int Dfs(int u, int p)
        {
            int top1 = 0, top2 = 0;                               // two longest downward paths
            foreach (int v in adj[u])
            {
                if (v == p) continue;
                int d = Dfs(v, u) + 1;
                if (d > top1) { top2 = top1; top1 = d; } else if (d > top2) top2 = d;
            }
            best = Math.Max(best, top1 + top2);
            return top1;
        }
        Dfs(0, -1);
        return best;
    }

    // Rerooting: for every node, the sum of distances to all other nodes. O(n).
    public static long[] SumOfDistances(int n, List<int>[] adj)
    {
        var size = new int[n]; var down = new long[n]; var ans = new long[n];
        void Dfs1(int u, int p)                                   // subtree sizes and downward sums
        {
            size[u] = 1;
            foreach (int v in adj[u]) { if (v == p) continue; Dfs1(v, u); size[u] += size[v]; down[u] += down[v] + size[v]; }
        }
        void Dfs2(int u, int p)                                   // move the root from u to each child v
        {
            foreach (int v in adj[u])
            {
                if (v == p) continue;
                // nodes in v's subtree get 1 closer, the other n - size[v] get 1 farther
                ans[v] = ans[u] - size[v] + (n - size[v]);
                Dfs2(v, u);
            }
        }
        Dfs1(0, -1); ans[0] = down[0]; Dfs2(0, -1);
        return ans;
    }
}` },
    { lang: 'csharp', title: 'Optimisations: monotonic deque transition and divide-and-conquer DP', code: `using System;
using System.Collections.Generic;

public static class DpOptimizations
{
    // dp[i] = cost[i] + min(dp[j]) for i-k <= j < i. Sliding-window minimum with a deque: O(n) instead of O(n*k).
    public static long MinCostWithJumps(long[] cost, int k)
    {
        int n = cost.Length;
        var dp = new long[n];
        var dq = new LinkedList<int>();                            // indices with increasing dp values
        dp[0] = cost[0]; dq.AddLast(0);
        for (int i = 1; i < n; i++)
        {
            while (dq.Count > 0 && dq.First!.Value < i - k) dq.RemoveFirst();   // left the window
            dp[i] = cost[i] + dp[dq.First!.Value];                 // front holds the window minimum
            while (dq.Count > 0 && dp[dq.Last!.Value] >= dp[i]) dq.RemoveLast(); // keep it increasing
            dq.AddLast(i);
        }
        return dp[n - 1];
    }

    // Split array a into m contiguous groups minimising sum of C(l, r) over groups,
    // where C satisfies the quadrangle inequality (here C = (sum of segment)^2 as an example).
    // Divide & conquer optimisation: O(m * n log n) instead of O(m * n^2).
    public static long SplitIntoGroups(long[] a, int m)
    {
        int n = a.Length;
        var pre = new long[n + 1];
        for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
        long C(int l, int r) { long s = pre[r] - pre[l]; return s * s; }   // cost of a[l..r)

        const long INF = long.MaxValue / 4;
        var prev = new long[n + 1]; var cur = new long[n + 1];
        Array.Fill(prev, INF); prev[0] = 0;

        // Compute cur[lo..hi] knowing the optimal split for them lies in [optLo, optHi].
        void Compute(int lo, int hi, int optLo, int optHi)
        {
            if (lo > hi) return;
            int mid = (lo + hi) / 2; long best = INF; int bestK = optLo;
            for (int k = optLo; k <= Math.Min(mid - 1, optHi); k++)
            {
                if (prev[k] >= INF) continue;
                long v = prev[k] + C(k, mid);
                if (v < best) { best = v; bestK = k; }
            }
            cur[mid] = best;
            Compute(lo, mid - 1, optLo, bestK);                   // opt is monotone: left half uses k <= bestK
            Compute(mid + 1, hi, bestK, optHi);                   // right half uses k >= bestK
        }

        for (int g = 1; g <= m; g++)
        {
            Array.Fill(cur, INF);
            Compute(1, n, 0, n - 1);
            (prev, cur) = (cur, prev);
        }
        return prev[n];
    }
}

// DpOptimizations.MinCostWithJumps(new long[] {1, 100, 1, 1, 100, 1}, 2)   // 4
// DpOptimizations.SplitIntoGroups(new long[] {1, 2, 3, 4}, 2)              // 52  -> groups [1,2,3] and [4]: 36 + 16` }
  ],
  pitfalls: [
    'Applying Knuth or divide-and-conquer optimisation without checking the quadrangle inequality. Matrix chain multiplication does not satisfy it; the "optimised" answer is simply wrong.',
    'Digit DP without the "started" flag. Leading zeros then count as real zeros and properties like "last digit" or "no adjacent equal digits" break.',
    'Forgetting that dp[mask][last] with n = 20 is 20 million entries. Use compact types or a dictionary of reachable states.',
    'Monotonic deque with the wrong comparison. Pop from the back while the stored value is greater than or equal to the new one for a minimum window; flip for maximum.',
    'Recursive tree DP on a path-shaped tree with 10^6 nodes overflows the stack. Use iterative post-order or a thread with a larger stack.',
    'Rerooting formulas copied without re-deriving. Always re-derive "what changes when the root moves one edge" for the specific quantity.'
  ],
  quiz: [
    { q: 'An interviewer says n ≤ 18 and asks for an exact answer over all orderings. What should you think of first?', options: ['Greedy by the cheapest next step', 'Bitmask DP over subsets', 'Binary search on the answer', 'Segment tree over the items'], answer: 1, why: 'Small n with exponential structure is the signature of bitmask DP: 2^18 masks is about 260 thousand states.' },
    { q: 'In digit DP, what does the "tight" flag mean?', options: ['The number built so far reads the same both ways', 'Every digit so far equals the upper bound\'s digit', 'The digit sum so far is zero modulo the divisor', 'We have reached the last digit of the upper bound'], answer: 1, why: 'Only while tight do we have to respect the limit digit; once a smaller digit is placed, any digit 0-9 is allowed.' },
    { q: 'What makes rerooting O(n) for "answer for every node as root"?', options: ['It sorts the nodes by depth and merges answers in that order', 'Moving the root across one edge updates the answer in O(1)', 'It hashes each subtree so equal subtrees are solved once', 'It recomputes each root from scratch, but on parallel threads'], answer: 1, why: 'A second DFS passes the parent answer down and adjusts it by how many nodes got closer and how many got farther.' },
    { q: 'The monotonic deque optimisation applies when:', options: ['It is a min of dp[j] over a sliding window, with a cost that depends only on i', 'The cost multiplies a term that depends on i by a term that depends on j, for any j', 'The DP runs over a tree and each node combines the answers of its children', 'The state is a bitmask and each transition adds exactly one more bit to it'], answer: 0, why: 'A window minimum over dp[j] is exactly what a monotonic deque computes in amortised O(1); mixed i-j terms need the convex hull trick.' },
    { q: 'What condition justifies divide-and-conquer DP optimisation?', options: ['The cost function is symmetric: C(i, j) always equals C(j, i)', 'The optimal split point is monotone: opt(j) ≤ opt(j+1)', 'The input array is sorted in increasing order', 'n is a power of two, so every half splits evenly'], answer: 1, why: 'Monotone opt lets you solve the middle column and then restrict the search range for both halves, giving O(n log n) per row.' },
    { q: 'How do you enumerate all submasks of a mask efficiently?', options: ['Loop over all 2^n integers and test each one', 'for (sub = mask; sub > 0; sub = (sub - 1) & mask)', 'for (sub = mask; sub > 0; sub = (sub >> 1) & mask)', 'Sort the bits, then recurse on each one'], answer: 1, why: 'Subtracting one and masking jumps directly to the next smaller submask; across all masks the total is O(3^n).' }
  ],
  takeaways: [
    'Bitmask DP: the state is a set encoded as bits; good up to n ≈ 20; TSP and assignment are the templates.',
    'Digit DP: state = (position, tracked property, tight, started); count [L, R] as f(R) - f(L-1).',
    'DP on trees: compute children first, combine into parents; rerooting gives every node\'s answer in O(n).',
    'Keep only the rows you read to cut memory; often it also makes the loop faster.',
    'Monotonic deque handles sliding-window min/max transitions in O(1) amortised.',
    'Divide-and-conquer and Knuth optimisations need a monotone optimum (quadrangle inequality); verify before you trust them.'
  ],
  interview: [
    { q: 'Explain the TSP bitmask DP and its limits.', a: '<p>dp[mask][last] is the shortest path visiting exactly the cities in mask, ending at last. Transition to any unvisited city. O(2^n × n²) time and O(2^n × n) memory. It is exact, unlike heuristics, but n beyond about 20 is infeasible; real routing uses it inside heuristics for small clusters.</p>' },
    { q: 'Count how many integers in [1, 10^18] have no two adjacent equal digits.', a: '<p>Digit DP over the 19-digit upper bound with state (position, last digit or "none", tight, started). At each position choose a digit different from the last (unless not started). Memoise: 19 × 11 × 2 × 2 states × 10 choices, trivial. Subtract nothing, since the lower bound is 1 and 0 is excluded by the started flag.</p>' },
    { q: 'How would you compute, for every node in a tree, the farthest node from it?', a: '<p>Rerooting with two values per node: the longest and second-longest downward path. For a child v of u, the "up" value of v is 1 plus the longer of u\'s up value and u\'s best downward path not through v (which is why the second-longest is kept). One DFS down, one DFS up, O(n).</p>' },
    { q: 'What is the convex hull trick and when does a deque suffice?', a: '<p>When the transition is a minimum over lines dp[j] + b[j]·x evaluated at x = a[i], each j is a line and you need the lower envelope. If the slopes b[j] arrive in sorted order and the queries a[i] are monotone, a deque of lines with pointer walking gives amortised O(1). Otherwise use binary search on the hull or a Li Chao tree for O(log n).</p>' }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-graphs-advanced — SCC, Bridges, Max Flow, Bellman-Ford, Floyd    */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-graphs-advanced'] = {
  hook: `Dijkstra answers "shortest". The advanced algorithms answer the questions that keep companies up at night: "which single cable would split the network", "which pages form a cycle of links", and "how much traffic can this system carry".`,
  intro: `<p>Basic graph algorithms visit nodes and find shortest paths. The advanced set answers deeper structural questions. <span class="term">Bellman-Ford</span> finds shortest paths even with negative edges and detects negative cycles. <span class="term">Floyd-Warshall</span> gives the shortest path between every pair of nodes with three simple loops. <span class="term">Strongly connected components</span> (SCC) group nodes that can all reach each other in a directed graph; Tarjan and Kosaraju find them in O(V + E).</p>
<p><span class="term">Bridges</span> and <span class="term">articulation points</span> are the edges and nodes whose removal disconnects an undirected graph. An <span class="term">Euler path</span> uses every edge exactly once. <span class="term">Maximum flow</span> measures how much can move from a source to a sink through a network of pipes with capacities, and it quietly solves matching problems too.</p>
<p>Finally, two BFS variants fix common speed problems: <span class="term">0-1 BFS</span> handles edges of weight 0 or 1 with a deque in O(V + E), and <span class="term">multi-source BFS</span> starts from many nodes at once to compute "distance to the nearest X".</p>
<p>Every algorithm here is implemented in C# with comments. Learn the shape of the question each one answers; that recognition is most of the interview.</p>`,
  realLife: {
    title: 'The city with one bridge too few',
    body: `<p>A river city has many bridges. The mayor asks: "If a single bridge closes for repair, could any neighbourhood become unreachable?" That is the bridge-finding problem, and Tarjan's low-link DFS answers it in one pass. The same question about intersections instead of bridges is articulation points.</p>
<p>The city's water company has pipes with maximum flow rates and wants to know the most water that can reach the east side from the reservoir. That is max flow. And the surprising part: the same algorithm tells a hospital how many patients can be matched to compatible donors, because a matching is just a flow of size 1 through each person.</p>
<p><strong>Where companies use this:</strong> Search engine researchers used SCC analysis to map the link structure of the web graph. Cloud providers run bridge and articulation analysis on data-centre topologies to find single points of failure. Airlines and ride-sharing use max-flow and matching for crew and driver assignment. Currency arbitrage detection in trading is exactly Bellman-Ford looking for a negative cycle on log-prices.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Bellman-Ford: shortest paths when edges can be negative</h4>
<p>Start with dist[source] = 0 and everything else infinity. Repeat V-1 times: for every edge (u, v, w), if dist[u] + w &lt; dist[v], update dist[v]. Why V-1 rounds? A shortest path has at most V-1 edges, and each round correctly finalises at least one more edge of every shortest path. O(V·E). Then do one more round: if anything still improves, there is a <span class="term">negative cycle</span> and "shortest" is undefined for nodes that can be reached from it.</p>
<h4>Floyd-Warshall: every pair at once</h4>
<p>dist[i][j] starts as the edge weight (infinity if none, 0 on the diagonal). For each middle node k, for each pair (i, j): dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]). Three nested loops, O(V³), with k in the outer loop. After the loops, dist[i][i] &lt; 0 means a negative cycle through i. Great for V up to a few hundred.</p>
<h4>Strongly connected components</h4>
<p>In a directed graph, nodes u and v are in the same SCC if there is a path from u to v and from v to u. Collapse each SCC into one node and the graph becomes a DAG (the condensation). Kosaraju's algorithm: DFS once to get finish order, reverse all edges, DFS again in decreasing finish order; each DFS tree in the second pass is one SCC. Two passes, O(V + E).</p>
<h4>Bridges and articulation points</h4>
<p>During DFS, record disc[u] (when u was discovered) and low[u] (the earliest discovered node reachable from u's subtree using at most one back edge). An edge (u, v) with v a child is a bridge if low[v] &gt; disc[u]: nothing in v's subtree can climb above u without that edge. A non-root node u is an articulation point if some child v has low[v] ≥ disc[u]. The root is one only if it has two or more DFS children.</p>
<h4>Euler path and circuit</h4>
<p>A path that uses every edge exactly once. Undirected graph: an Euler circuit exists if the graph is connected (ignoring isolated nodes) and every node has even degree. An Euler path exists if exactly zero or two nodes have odd degree. Directed: in-degree equals out-degree for a circuit; one node with out = in + 1 and one with in = out + 1 for a path. Hierholzer's algorithm builds it in O(E).</p>
<h4>Max flow in one picture</h4>
<p>Pipes have capacities. Push water from source to sink. Find any path with spare capacity (an <span class="term">augmenting path</span>), push as much as the tightest pipe allows, and record "reverse capacity" so later paths can undo a bad choice. Repeat until no path remains. The total pushed is the max flow, and it equals the smallest cut separating source from sink (the max-flow min-cut theorem).</p>` },
    { name: 'Intermediate', body: `<h4>Bellman-Ford refinements</h4>
<ul>
<li><strong>Early exit:</strong> if a round makes no change, stop. Typical inputs finish in a few rounds.</li>
<li><strong>SPFA:</strong> queue-based Bellman-Ford that only re-relaxes nodes whose distance changed. Fast on average, still O(V·E) worst case; interviewers may ask you to mention it is not a guarantee.</li>
<li><strong>Negative cycle marking:</strong> after the extra round, nodes that still improve, plus everything reachable from them, have distance minus infinity.</li>
<li><strong>Arbitrage:</strong> edge weight = -log(rate). A negative cycle means multiplying rates around the loop exceeds 1.</li>
</ul>
<h4>Floyd-Warshall extras</h4>
<p>Keep a next[i][j] matrix to reconstruct paths. It also computes transitive closure (reachability) with booleans, and "minimax" or "maximin" paths by swapping the operators. Use long and guard against INF + INF overflow by skipping when dist[i][k] is INF.</p>
<h4>Tarjan's SCC in one DFS</h4>
<p>Maintain disc, low, a stack of nodes in the current partial component and an onStack flag. On visiting u, push it. For each neighbour v: if unvisited, recurse and low[u] = min(low[u], low[v]); if on the stack, low[u] = min(low[u], disc[v]). After exploring u, if low[u] == disc[u], u is the root of an SCC: pop the stack until u comes out; those nodes form one component. Components come out in reverse topological order of the condensation, which is handy for 2-SAT.</p>
<h4>Bridges: the low-link rule with multi-edges</h4>
<p>When exploring edge (u, v) during DFS, skip the edge you came in by (track the parent edge id, not just the parent node, so parallel edges are handled). Bridge condition: low[v] &gt; disc[u]. Articulation: low[v] ≥ disc[u] for a non-root u. The root is an articulation point only if it has two or more DFS children.</p>
<h4>Edmonds-Karp max flow</h4>
<p>Ford-Fulkerson with BFS to find the shortest augmenting path each time. O(V·E²), good for a few thousand nodes. Store the graph as an adjacency matrix of capacities for simplicity, or as edge lists with paired reverse edges (edge i and i^1) for scale. Each augmentation subtracts from forward edges and adds to reverse edges.</p>
<h4>Bipartite matching as flow</h4>
<p>Source to every left node with capacity 1, every right node to sink with capacity 1, left to right edges with capacity 1. Max flow equals the maximum matching. Hopcroft-Karp does the same in O(E √V) and is what you reach for when V is large. The simple augmenting-path DFS (Kuhn's algorithm) is O(V·E) and short to write.</p>
<h4>0-1 BFS and multi-source BFS</h4>
<p>0-1 BFS: use a deque. When relaxing an edge of weight 0, push the neighbour to the front; weight 1, push to the back. The deque always stays sorted by distance, so it behaves like Dijkstra without a heap. Multi-source BFS: push all sources with distance 0 at the start; the first time a node is reached is its distance to the nearest source. Classic uses: "distance to nearest 0 in a grid", "rotting oranges".</p>
<div class="callout tip">Multi-source BFS is the same as adding a fake super-source connected to all real sources with weight 0. Thinking in terms of super-source and super-sink also makes many flow problems click.</div>` },
    { name: 'Expert', body: `<h4>Which tool for which question</h4>
<table><thead><tr><th>Question</th><th>Algorithm</th><th>Time</th></tr></thead><tbody>
<tr><td>Shortest path, negative edges, one source</td><td>Bellman-Ford</td><td>O(V·E)</td></tr>
<tr><td>Shortest paths, all pairs, V ≤ 500</td><td>Floyd-Warshall</td><td>O(V³)</td></tr>
<tr><td>All pairs, sparse, no negatives</td><td>Dijkstra from each node</td><td>O(V·(V+E) log V)</td></tr>
<tr><td>All pairs with negatives, sparse</td><td>Johnson (Bellman-Ford reweight + Dijkstra)</td><td>O(V·E log V)</td></tr>
<tr><td>Mutual reachability groups</td><td>Tarjan / Kosaraju SCC</td><td>O(V+E)</td></tr>
<tr><td>Single points of failure</td><td>Bridges / articulation points</td><td>O(V+E)</td></tr>
<tr><td>Max throughput, min cut</td><td>Edmonds-Karp / Dinic</td><td>O(V·E²) / O(V²·E)</td></tr>
<tr><td>Maximum bipartite matching</td><td>Hopcroft-Karp</td><td>O(E √V)</td></tr>
</tbody></table>
<h4>Dinic in one paragraph</h4>
<p>Build a level graph with BFS from the source (levels increase by one along usable edges). Then run DFS pushing blocking flows only along edges that go one level deeper, with a per-node pointer so dead edges are skipped. Repeat until the sink is unreachable. O(V²·E) in general, O(E √V) on bipartite matching networks (all capacities 1), which is why Dinic on a bipartite graph is Hopcroft-Karp in disguise. This is the practical max-flow algorithm for interviews that go beyond Edmonds-Karp and for contests.</p>
<h4>Min cut applications</h4>
<p>Project selection (take profitable projects that require costly tools), image segmentation (foreground vs background), and "minimum vertices to remove to disconnect s from t" (split each vertex into in and out with capacity 1) all reduce to min cut. König's theorem: in bipartite graphs, maximum matching equals minimum vertex cover, and the maximum independent set is V minus that.</p>
<h4>2-SAT via SCC</h4>
<p>Each boolean variable x becomes two nodes x and not-x. A clause (a or b) becomes edges not-a → b and not-b → a. The formula is satisfiable if and only if no variable sits in the same SCC as its negation. Assign each variable true if its node's component comes later in topological order than its negation's. Tarjan gives the components already in reverse topological order.</p>
<h4>Bridge tree and 2-edge-connected components</h4>
<p>Remove all bridges; the remaining connected pieces are 2-edge-connected components. Shrink each into a node and reconnect with the bridges: the result is a tree. Questions like "minimum edges to add so no bridge remains" become (leaves of that tree + 1) / 2.</p>
<h4>Failure modes and numeric traps</h4>
<ul>
<li>Floyd-Warshall with INF + INF overflow in int. Use long or guard the sum.</li>
<li>Bellman-Ford propagating from INF nodes: skip edges where dist[u] is INF, or unreachable nodes get fake finite distances.</li>
<li>Bridges with parallel edges: skipping "parent node" instead of "parent edge" makes a doubled edge look like a bridge.</li>
<li>Max flow with floating capacities: termination is not guaranteed for Ford-Fulkerson with irrational values; scale to integers.</li>
<li>Recursive Tarjan on 10^6 nodes overflows the stack; use an iterative version or a bigger thread stack.</li>
</ul>
<div class="callout idea">When a problem says "remove the fewest edges/nodes so that...", think min cut. When it says "pair up as many as possible", think matching, which is also flow.</div>` }
  ],
  flow: {
    title: 'Edmonds-Karp pushing flow through the network',
    steps: [
      { title: 'Build the residual graph', desc: 'Every pipe (u, v, cap) gets a reverse edge (v, u, 0). Residual capacity = capacity minus current flow.' },
      { title: 'BFS from source to sink', desc: 'Only follow edges with residual capacity greater than 0. Record the parent of each visited node.' },
      { title: 'No path? Done', desc: 'If BFS never reaches the sink, the current total is the maximum flow, and the visited set forms the min cut.' },
      { title: 'Find the bottleneck', desc: 'Walk the path backwards from the sink; the smallest residual capacity on it is how much we can push.' },
      { title: 'Push and record the undo', desc: 'Subtract the bottleneck from every forward edge on the path and add it to every reverse edge, so a later path can cancel part of this one.' },
      { title: 'Add to the total and repeat', desc: 'total += bottleneck. Go back to the BFS. Using the shortest path each time bounds the number of augmentations by O(V·E).' },
      { title: 'Read the matching or cut', desc: 'For bipartite matching, every left-right edge carrying flow 1 is a matched pair. For min cut, edges from BFS-visited to unvisited nodes form the cut.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Bellman-Ford with negative-cycle detection, and Floyd-Warshall with path reconstruction', code: `using System;
using System.Collections.Generic;

public static class AllPaths
{
    public const long INF = long.MaxValue / 4;

    // Single source, negative edges allowed. Returns (dist, hasNegativeCycleReachable). O(V*E).
    public static (long[] dist, bool negCycle) BellmanFord(int V, List<(int u, int v, long w)> edges, int src)
    {
        var dist = new long[V]; Array.Fill(dist, INF); dist[src] = 0;
        for (int round = 1; round <= V - 1; round++)
        {
            bool changed = false;
            foreach (var (u, v, w) in edges)
            {
                if (dist[u] == INF) continue;                 // do not propagate from unreachable nodes
                if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; changed = true; }
            }
            if (!changed) break;                              // early exit
        }
        bool neg = false;
        foreach (var (u, v, w) in edges)                      // one extra round: any improvement => negative cycle
            if (dist[u] != INF && dist[u] + w < dist[v]) { neg = true; break; }
        return (dist, neg);
    }

    // All pairs. dist[i,j] = INF if unreachable. next[i,j] lets you rebuild paths. O(V^3).
    public static (long[,] dist, int[,] next) FloydWarshall(int V, List<(int u, int v, long w)> edges)
    {
        var d = new long[V, V]; var next = new int[V, V];
        for (int i = 0; i < V; i++) for (int j = 0; j < V; j++) { d[i, j] = i == j ? 0 : INF; next[i, j] = -1; }
        foreach (var (u, v, w) in edges)
            if (w < d[u, v]) { d[u, v] = w; next[u, v] = v; }

        for (int k = 0; k < V; k++)                            // k must be the OUTER loop
            for (int i = 0; i < V; i++)
            {
                if (d[i, k] == INF) continue;
                for (int j = 0; j < V; j++)
                {
                    if (d[k, j] == INF) continue;
                    if (d[i, k] + d[k, j] < d[i, j]) { d[i, j] = d[i, k] + d[k, j]; next[i, j] = next[i, k]; }
                }
            }
        // Negative cycle through i  <=>  d[i,i] < 0
        return (d, next);
    }

    public static List<int> FloydPath(int[,] next, int u, int v)
    {
        var path = new List<int>();
        if (next[u, v] == -1) return path;
        for (int cur = u; cur != v; cur = next[cur, v]) path.Add(cur);
        path.Add(v);
        return path;
    }
}

// var edges = new List<(int,int,long)> { (0,1,4), (0,2,5), (1,2,-3), (2,3,2) };
// AllPaths.BellmanFord(4, edges, 0).dist   // [0, 4, 1, 3]
// var (d, nx) = AllPaths.FloydWarshall(4, edges); AllPaths.FloydPath(nx, 0, 3)  // [0, 1, 2, 3]` },
    { lang: 'csharp', title: 'Tarjan SCC (iterative-safe size), Kosaraju SCC, and 2-SAT sketch', code: `using System;
using System.Collections.Generic;

public static class Scc
{
    // Tarjan: returns comp[v] = component id. Ids come out in REVERSE topological order of the condensation. O(V+E).
    public static (int count, int[] comp) Tarjan(int V, List<int>[] adj)
    {
        var disc = new int[V]; var low = new int[V]; var comp = new int[V];
        var onStack = new bool[V]; var stack = new Stack<int>();
        Array.Fill(disc, -1); int time = 0, count = 0;

        void Dfs(int u)
        {
            disc[u] = low[u] = time++; stack.Push(u); onStack[u] = true;
            foreach (int v in adj[u])
            {
                if (disc[v] == -1) { Dfs(v); low[u] = Math.Min(low[u], low[v]); }
                else if (onStack[v]) low[u] = Math.Min(low[u], disc[v]);   // back edge inside current component
            }
            if (low[u] == disc[u])                            // u is the root of a component
            {
                while (true)
                {
                    int x = stack.Pop(); onStack[x] = false; comp[x] = count;
                    if (x == u) break;
                }
                count++;
            }
        }
        for (int i = 0; i < V; i++) if (disc[i] == -1) Dfs(i);
        return (count, comp);
    }

    // Kosaraju: two passes. Components come out in topological order of the condensation.
    public static (int count, int[] comp) Kosaraju(int V, List<int>[] adj)
    {
        var seen = new bool[V]; var order = new List<int>();
        void Dfs1(int u) { seen[u] = true; foreach (int v in adj[u]) if (!seen[v]) Dfs1(v); order.Add(u); }
        for (int i = 0; i < V; i++) if (!seen[i]) Dfs1(i);

        var radj = new List<int>[V]; for (int i = 0; i < V; i++) radj[i] = new List<int>();
        for (int u = 0; u < V; u++) foreach (int v in adj[u]) radj[v].Add(u);   // reverse every edge

        var comp = new int[V]; Array.Fill(comp, -1); int count = 0;
        void Dfs2(int u, int c) { comp[u] = c; foreach (int v in radj[u]) if (comp[v] == -1) Dfs2(v, c); }
        for (int i = V - 1; i >= 0; i--)                       // decreasing finish time
            if (comp[order[i]] == -1) Dfs2(order[i], count++);
        return (count, comp);
    }

    // 2-SAT: n variables, clauses (a or b) where a literal is (var, isTrue). Returns assignment or null.
    public static bool[]? TwoSat(int n, List<((int v, bool t) a, (int v, bool t) b)> clauses)
    {
        int Node((int v, bool t) lit) => 2 * lit.v + (lit.t ? 0 : 1);     // x -> 2v, not x -> 2v+1
        var adj = new List<int>[2 * n]; for (int i = 0; i < 2 * n; i++) adj[i] = new List<int>();
        foreach (var (a, b) in clauses)
        {
            adj[Node(a) ^ 1].Add(Node(b));                     // not a => b
            adj[Node(b) ^ 1].Add(Node(a));                     // not b => a
        }
        var (_, comp) = Tarjan(2 * n, adj);
        var result = new bool[n];
        for (int v = 0; v < n; v++)
        {
            if (comp[2 * v] == comp[2 * v + 1]) return null;   // x and not x in one component => unsatisfiable
            result[v] = comp[2 * v] < comp[2 * v + 1];         // Tarjan ids are reverse topological: smaller id = later
        }
        return result;
    }
}` },
    { lang: 'csharp', title: 'Bridges, articulation points (parent-edge aware) and Euler circuit (Hierholzer)', code: `using System;
using System.Collections.Generic;
using System.Linq;

public static class Connectivity
{
    // adj[u] holds (neighbour, edgeId). Handles parallel edges correctly by skipping the parent EDGE, not the parent node.
    public static (List<(int u, int v)> bridges, HashSet<int> cutVertices) Find(int V, List<(int to, int id)>[] adj)
    {
        var disc = new int[V]; var low = new int[V]; Array.Fill(disc, -1);
        var bridges = new List<(int, int)>(); var cut = new HashSet<int>(); int time = 0;

        void Dfs(int u, int parentEdge)
        {
            disc[u] = low[u] = time++;
            int children = 0;
            foreach (var (v, id) in adj[u])
            {
                if (id == parentEdge) continue;
                if (disc[v] != -1) { low[u] = Math.Min(low[u], disc[v]); continue; }   // back edge
                children++;
                Dfs(v, id);
                low[u] = Math.Min(low[u], low[v]);
                if (low[v] > disc[u]) bridges.Add((u, v));                  // nothing below v climbs above u
                if (parentEdge != -1 && low[v] >= disc[u]) cut.Add(u);      // non-root articulation point
            }
            if (parentEdge == -1 && children >= 2) cut.Add(u);              // root with 2+ DFS children
        }
        for (int i = 0; i < V; i++) if (disc[i] == -1) Dfs(i, -1);
        return (bridges, cut);
    }

    // Euler circuit in an undirected graph (all degrees even, connected). Returns the node sequence. O(E).
    public static List<int>? EulerCircuit(int V, List<(int to, int id)>[] adj, int edgeCount)
    {
        for (int i = 0; i < V; i++) if (adj[i].Count % 2 != 0) return null;
        var used = new bool[edgeCount];
        var ptr = new int[V];                                  // next unexplored edge index per node
        var stack = new Stack<int>(); var circuit = new List<int>();
        int start = Enumerable.Range(0, V).FirstOrDefault(i => adj[i].Count > 0);
        stack.Push(start);
        while (stack.Count > 0)
        {
            int u = stack.Peek();
            while (ptr[u] < adj[u].Count && used[adj[u][ptr[u]].id]) ptr[u]++;   // skip used edges
            if (ptr[u] == adj[u].Count) { circuit.Add(stack.Pop()); }           // dead end: emit node
            else
            {
                var (v, id) = adj[u][ptr[u]];
                used[id] = true;
                stack.Push(v);
            }
        }
        circuit.Reverse();
        return circuit.Count == edgeCount + 1 ? circuit : null;   // null if the graph was not connected
    }
}

// Build: AddEdge(u, v, id) => adj[u].Add((v,id)); adj[v].Add((u,id));
// Square 0-1-2-3-0 plus a tail 3-4:  bridges = [(3,4)], cut vertices = {3}` },
    { lang: 'csharp', title: 'Edmonds-Karp max flow, bipartite matching, 0-1 BFS and multi-source BFS', code: `using System;
using System.Collections.Generic;

public class MaxFlow
{
    private readonly int n; private readonly long[,] cap;   // residual capacities (matrix form, fine for n <= ~2000)
    public MaxFlow(int n) { this.n = n; cap = new long[n, n]; }
    public void AddEdge(int u, int v, long c) => cap[u, v] += c;

    // Edmonds-Karp: BFS for the shortest augmenting path each round. O(V * E^2).
    public long Run(int s, int t)
    {
        long flow = 0; var parent = new int[n];
        while (true)
        {
            Array.Fill(parent, -1); parent[s] = s;
            var q = new Queue<int>(); q.Enqueue(s);
            while (q.Count > 0 && parent[t] == -1)
            {
                int u = q.Dequeue();
                for (int v = 0; v < n; v++)
                    if (parent[v] == -1 && cap[u, v] > 0) { parent[v] = u; q.Enqueue(v); }
            }
            if (parent[t] == -1) return flow;                  // no augmenting path left
            long bottleneck = long.MaxValue;
            for (int v = t; v != s; v = parent[v]) bottleneck = Math.Min(bottleneck, cap[parent[v], v]);
            for (int v = t; v != s; v = parent[v]) { cap[parent[v], v] -= bottleneck; cap[v, parent[v]] += bottleneck; }
            flow += bottleneck;
        }
    }
}

public static class Matching
{
    // Maximum bipartite matching via augmenting paths (Kuhn). left nodes 0..L-1, adj[l] = right nodes. O(V*E).
    public static int Kuhn(int L, int R, List<int>[] adj)
    {
        var matchRight = new int[R]; Array.Fill(matchRight, -1);
        bool TryAssign(int l, bool[] seen)
        {
            foreach (int r in adj[l])
            {
                if (seen[r]) continue; seen[r] = true;
                if (matchRight[r] == -1 || TryAssign(matchRight[r], seen)) { matchRight[r] = l; return true; }
            }
            return false;
        }
        int result = 0;
        for (int l = 0; l < L; l++) if (TryAssign(l, new bool[R])) result++;
        return result;
    }
}

public static class BfsVariants
{
    // Edges weigh 0 or 1. Deque keeps nodes sorted by distance: O(V+E), no heap.
    public static int[] ZeroOneBfs(int V, List<(int to, int w)>[] adj, int src)
    {
        var dist = new int[V]; Array.Fill(dist, int.MaxValue); dist[src] = 0;
        var dq = new LinkedList<int>(); dq.AddFirst(src);
        while (dq.Count > 0)
        {
            int u = dq.First!.Value; dq.RemoveFirst();
            foreach (var (v, w) in adj[u])
                if (dist[u] + w < dist[v])
                {
                    dist[v] = dist[u] + w;
                    if (w == 0) dq.AddFirst(v); else dq.AddLast(v);
                }
        }
        return dist;
    }

    // Distance from every cell to the nearest source cell (e.g. nearest 0 in a grid). O(rows*cols).
    public static int[,] MultiSource(int[,] grid, Func<int, bool> isSource)
    {
        int R = grid.GetLength(0), C = grid.GetLength(1);
        var dist = new int[R, C]; var q = new Queue<(int, int)>();
        for (int r = 0; r < R; r++) for (int c = 0; c < C; c++)
            if (isSource(grid[r, c])) { dist[r, c] = 0; q.Enqueue((r, c)); } else dist[r, c] = -1;
        int[] dr = { 1, -1, 0, 0 }, dc = { 0, 0, 1, -1 };
        while (q.Count > 0)
        {
            var (r, c) = q.Dequeue();
            for (int k = 0; k < 4; k++)
            {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr < 0 || nc < 0 || nr >= R || nc >= C || dist[nr, nc] != -1) continue;
                dist[nr, nc] = dist[r, c] + 1; q.Enqueue((nr, nc));
            }
        }
        return dist;
    }
}

// var mf = new MaxFlow(4); mf.AddEdge(0,1,3); mf.AddEdge(0,2,2); mf.AddEdge(1,2,1); mf.AddEdge(1,3,2); mf.AddEdge(2,3,3);
// mf.Run(0, 3)   // 5` }
  ],
  pitfalls: [
    'Putting k in the inner loop of Floyd-Warshall. The order k, i, j is required; any other order gives wrong distances for some graphs.',
    'Letting Bellman-Ford relax edges from nodes still at infinity. Unreachable nodes then get fake finite distances (INF + w).',
    'Finding bridges by skipping the parent node instead of the parent edge id. A doubled edge between two nodes is then reported as a bridge.',
    'Forgetting the reverse edges in max flow. Without the ability to undo flow, Ford-Fulkerson can get stuck at a non-maximum answer.',
    'Using Kosaraju component ids as topological order without checking direction. Kosaraju gives topological order; Tarjan gives reverse topological order.',
    'Running recursive Tarjan or bridge-finding on graphs with hundreds of thousands of nodes in .NET without a bigger stack.'
  ],
  quiz: [
    { q: 'After V-1 rounds of Bellman-Ford, one more round still lowers a distance. What does that prove?', options: ['The graph is disconnected, so some nodes stay at infinity', 'There is a negative cycle reachable from the source', 'The source node was wrong and must be chosen again', 'Dijkstra would have been faster on this graph'], answer: 1, why: 'Any shortest path has at most V-1 edges, so further improvement is only possible if a cycle keeps lowering the total: a negative cycle.' },
    { q: 'What is the condition for DFS tree edge (u, v) to be a bridge?', options: ['disc[v] > disc[u]', 'low[v] > disc[u]', 'low[v] >= disc[u]', 'low[u] == disc[v]'], answer: 1, why: 'If nothing in v\'s subtree reaches a node discovered before u without using edge (u, v), that edge is the only connection: removing it disconnects the subtree.' },
    { q: 'Why does max flow need reverse edges in the residual graph?', options: ['To make each BFS faster by halving the edges it scans', 'So a later path can cancel flow from a poor earlier choice', 'To store the original capacities so they can be restored later', 'To detect cycles before any flow is pushed'], answer: 1, why: 'Reverse capacity lets the algorithm reroute flow. Without it, greedy path choices can block the optimum.' },
    { q: 'Tarjan\'s algorithm produces strongly connected components in which order?', options: ['Increasing order of the smallest node id in each one', 'Reverse topological order of the condensation DAG', 'Topological order of the condensation DAG', 'Random order that changes on every run'], answer: 1, why: 'A component is emitted only after everything reachable from it has been emitted, so sinks come first. This is why 2-SAT can read the assignment straight from the ids.' },
    { q: 'Which algorithm gives all-pairs shortest paths on a graph with 300 nodes and negative edges but no negative cycles?', options: ['BFS from every node', 'Floyd-Warshall', 'Prim', 'Kruskal'], answer: 1, why: 'Floyd-Warshall handles negative edges and 300³ = 27 million operations is fast. Dijkstra from each node would fail on negative edges.' },
    { q: 'A grid has several hospitals. You want the distance from every cell to the nearest hospital. Best approach?', options: ['A separate BFS from each cell until it reaches a hospital', 'Multi-source BFS starting from all hospitals at once', 'Floyd-Warshall over every pair of cells', 'Max flow from the hospitals to the cells'], answer: 1, why: 'Seeding the queue with all sources at distance 0 gives the nearest-source distance for every cell in one O(cells) pass.' }
  ],
  takeaways: [
    'Bellman-Ford: V-1 rounds of relaxing every edge; an extra improving round means a negative cycle.',
    'Floyd-Warshall: three loops with k outermost; O(V³); also gives reachability and path reconstruction.',
    'SCC: Tarjan (one DFS, reverse topological order) or Kosaraju (two DFS, topological order); condensation is a DAG.',
    'Bridges and articulation points come from disc/low in one DFS; skip the parent edge, not the parent node.',
    'Max flow = min cut; augmenting paths with reverse edges; bipartite matching is max flow with unit capacities.',
    '0-1 BFS replaces Dijkstra when weights are 0/1; multi-source BFS answers "nearest X" in one pass.'
  ],
  interview: [
    { q: 'Detect currency arbitrage given exchange rates between n currencies.', a: '<p>Build a directed graph with edge weight -log(rate[i][j]). An arbitrage loop multiplies rates to more than 1, which means the sum of -log values is negative. Run Bellman-Ford from any node (or add a super-source with zero edges to all nodes) and check for a negative cycle; reconstruct it by walking parent pointers from a node that improved in the extra round.</p>' },
    { q: 'How many edges must be added to an undirected connected graph so that it has no bridges?', a: '<p>Find bridges, contract 2-edge-connected components, which produces a tree. If that tree has L leaves, adding ceil(L / 2) edges between leaves makes every edge part of a cycle. Special case: if the tree is a single node, the answer is 0.</p>' },
    { q: 'Explain max-flow min-cut and give a non-obvious application.', a: '<p>The maximum amount that can flow from s to t equals the minimum total capacity of edges whose removal separates s from t. One application: project selection. Projects with profit connect from the source with capacity profit; tools with cost connect to the sink with capacity cost; each project points to its required tools with infinite capacity. Max profit = total profit minus min cut.</p>' },
    { q: 'When would you choose Dinic over Edmonds-Karp?', a: '<p>Edmonds-Karp is O(V·E²) and simple, fine for a few thousand nodes. Dinic uses level graphs and blocking flows for O(V²·E), and on unit-capacity networks such as bipartite matching it runs in O(E √V). For anything with tens of thousands of nodes or many augmentations, Dinic is the practical choice.</p>' }
  ]
};
