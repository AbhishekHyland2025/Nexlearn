// DevPath content — Module 2: Linear DSA (part A)
// Topics: m2-arrays, m2-strings, m2-maths, m2-bits, m2-binary-search, m2-two-pointers
window.CONTENT = window.CONTENT || {};

/* ------------------------------------------------------------------ */
/* m2-arrays — 1D & 2D Arrays: Prefix Sum, Kadane, Rotation            */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-arrays'] = {
  hook: `Most array interview questions are not about arrays at all. They are about noticing that you are doing the same work twice, and finding the one trick that removes the repeat.`,
  intro: `<p>An <span class="term">array</span> is a row of boxes in memory, placed side by side, each with a number (an index) starting at 0. Because the boxes sit next to each other, the computer can jump to box number 500 instantly. It does not need to walk past the first 499. That instant jump is the superpower of arrays, and it is the reason almost every other data structure is built on top of them.</p>
<p>A <span class="term">2D array</span> (also called a matrix) is just a grid: rows and columns. Think of a spreadsheet or a chess board. Under the hood it is still one long row of boxes; the computer just does a bit of maths to find the right one.</p>
<p>In this lesson you will learn the handful of patterns that solve most array problems: prefix sums (answer range questions instantly), Kadane's algorithm (best subarray), rotation tricks, matrix rotation and spiral walks, and the hash-map trick that turns a slow double loop into a single fast pass. These patterns show up in every coding interview and in real code, from billing reports to image filters.</p>`,
  realLife: {
    title: 'The toll booth that stopped recounting',
    body: `<p>Imagine a highway with 1,000 toll booths. The manager asks: "How much money did booths 200 to 650 collect today?" A new clerk adds up 451 numbers. Then the manager asks about booths 300 to 700. The clerk adds up 401 numbers again. After fifty questions the clerk is exhausted.</p>
<p>A smarter clerk makes one running total once in the morning: "up to booth 1: 50, up to booth 2: 120, up to booth 3: 180..." Now any question is one subtraction: total up to 650 minus total up to 199. That running total is a <span class="term">prefix sum</span>, and this is the whole idea behind many fast array algorithms: do a little work once so every later question is instant.</p>
<p><strong>Where companies use this:</strong> Stock apps compute "best day to buy and sell" with Kadane's idea. Image editors rotate a photo by rotating a matrix of pixels. Calendar apps merge overlapping meetings with the merge-intervals pattern. Database engines keep running totals so dashboards answer "revenue between two dates" without re-scanning rows.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>What an array really is</h4>
<p>When you write <code>int[] a = new int[5];</code>, C# asks for 5 boxes of 4 bytes each, side by side. The variable <code>a</code> holds the address of the first box. To get <code>a[3]</code>, the computer calculates: start address + 3 × 4 bytes. One multiplication, one addition, done. This is why reading any index is <span class="term">O(1)</span>, which means "constant time, no matter how big the array is".</p>
<h4>The price of that speed</h4>
<ul>
<li><strong>Fixed size.</strong> You cannot grow an array in place. <code>List&lt;T&gt;</code> in C# hides this by creating a bigger array and copying when it runs out of space.</li>
<li><strong>Inserting in the middle is slow.</strong> To put a value at index 2, every value after it must shift right by one. That is O(n) work.</li>
<li><strong>Searching an unsorted array is slow.</strong> You must look at every box: O(n).</li>
</ul>
<h4>A 2D array is a grid</h4>
<p>In C#, <code>int[,] grid = new int[3, 4];</code> makes 3 rows and 4 columns. <code>grid[1, 2]</code> is row 1, column 2 (both starting at 0). Walking a grid means two nested loops: the outer one picks the row, the inner one walks the columns. Draw the grid on paper before coding. Almost every matrix bug is a swapped row and column.</p>
<h4>The patterns you will meet again and again</h4>
<table><thead><tr><th>Pattern</th><th>The question it answers</th><th>Key idea</th></tr></thead><tbody>
<tr><td>Prefix sum</td><td>Sum of any range, many times</td><td>Pre-compute running totals once</td></tr>
<tr><td>Kadane</td><td>Best contiguous subarray sum</td><td>Drop the past when it hurts</td></tr>
<tr><td>Reversal rotation</td><td>Shift array by k in place</td><td>Reverse three times</td></tr>
<tr><td>Matrix rotate</td><td>Turn a grid 90°</td><td>Transpose, then reverse rows</td></tr>
<tr><td>Spiral</td><td>Walk the grid in a spiral</td><td>Shrink four borders</td></tr>
<tr><td>Hash lookup</td><td>Find a pair that adds to a target</td><td>Remember what you have seen</td></tr>
<tr><td>Merge intervals</td><td>Combine overlapping ranges</td><td>Sort by start, then sweep</td></tr>
</tbody></table>
<div class="callout tip">When a problem says "many queries on the same array", your brain should say "pre-compute something once". When it says "in place" or "O(1) extra space", think of swapping and reversing instead of making a copy.</div>
<h4>Your first two patterns, in words</h4>
<p><strong>Prefix sum:</strong> build an array <code>pre</code> where <code>pre[i]</code> is the sum of the first i elements. The sum from index l to r is <code>pre[r+1] - pre[l]</code>. Build once in O(n), answer every query in O(1).</p>
<p><strong>Kadane:</strong> walk left to right, keeping a running sum. If the running sum ever drops below zero, throw it away and start fresh from the current element, because a negative start can only hurt what comes next. Track the best sum you ever saw. One pass, O(n).</p>` },
    { name: 'Intermediate', body: `<h4>Prefix sums, properly</h4>
<p>Use an array of length n+1 with <code>pre[0] = 0</code>. Then <code>pre[i] = pre[i-1] + a[i-1]</code>. Range sum of [l, r] (inclusive) is <code>pre[r+1] - pre[l]</code>. The extra zero at the front removes every "if l == 0" special case. For a 2D grid the same idea gives a 2D prefix table where any rectangle sum is four lookups: <code>P[r2][c2] - P[r1-1][c2] - P[r2][c1-1] + P[r1-1][c1-1]</code> (inclusion-exclusion: you subtracted the top-left corner twice, so add it back once).</p>
<p>A close cousin is the <span class="term">difference array</span>: to add a value v to every element in [l, r], do <code>diff[l] += v; diff[r+1] -= v;</code> and take a prefix sum at the end. Thousands of range updates become O(n + q).</p>
<h4>Kadane with proof</h4>
<p>Let <code>best(i)</code> be the best subarray sum that ends exactly at index i. Then <code>best(i) = a[i] + max(0, best(i-1))</code>: either extend the previous best ending, or start new at a[i]. The answer is the max of all best(i). This is a tiny dynamic program. Variants: track start/end indices; circular max subarray (total minus minimum subarray); max product subarray (track both max and min because a negative times a negative flips).</p>
<h4>Rotation by reversal</h4>
<p>To rotate right by k (k = k mod n): reverse the whole array, reverse the first k, reverse the rest. Example: [1,2,3,4,5], k=2. Reverse all → [5,4,3,2,1]. Reverse first 2 → [4,5,3,2,1]. Reverse rest → [4,5,1,2,3]. In place, O(n) time, O(1) space.</p>
<h4>Matrix rotation and spiral walk</h4>
<p>Rotate 90° clockwise = transpose (swap a[i][j] with a[j][i]) then reverse every row. Counter-clockwise = transpose then reverse every column. Spiral traversal keeps four boundaries (top, bottom, left, right), walks the top row, right column, bottom row, left column, then shrinks the boundaries inward. The two "if" checks before the bottom row and left column are what stop double-printing on thin matrices.</p>
<h4>Set matrix zeroes in O(1) extra space</h4>
<p>The naive way uses two boolean arrays for rows and columns. The clever way uses the first row and first column of the matrix itself as those markers, plus one extra flag for whether the first column needs zeroing. Walk the grid once to mark, once to apply, and handle the first row/column last.</p>
<h4>Two sum: from O(n²) to O(n)</h4>
<p>Brute force tries every pair. The hash approach walks once: for each number x, ask "have I already seen target - x?" using a <code>Dictionary&lt;int,int&gt;</code> (value → index). If yes, done. If no, store x. One pass, O(n) average time, O(n) space. If the array is sorted, two pointers do it in O(1) space (see the Two Pointers lesson).</p>
<h4>Merge intervals</h4>
<p>Sort intervals by start. Keep a "current" interval. For each next interval, if it starts before current ends, extend current's end to the max of both ends. Otherwise push current to the result and start a new current. O(n log n) for the sort, O(n) for the sweep.</p>
<div class="callout warn">Off-by-one errors live in range boundaries. Decide early whether your ranges are inclusive [l, r] or half-open [l, r), write it in a comment, and stick to it.</div>` },
    { name: 'Expert', body: `<h4>Memory layout and cache behaviour</h4>
<p>A C# <code>int[,]</code> is stored in <span class="term">row-major order</span>: all of row 0, then all of row 1, and so on. Walking it row by row touches memory in order, which the CPU cache loves. Walking column by column jumps by a whole row each step and can be 5 to 10 times slower on large grids, even though both loops are "O(n²)". Big-O counts operations; the cache decides how fast each one is. Jagged arrays (<code>int[][]</code>) are arrays of arrays: each row is a separate object, possibly far apart in memory, but they allow rows of different length and are often faster for row-wise access in .NET because the JIT can drop bounds checks more easily.</p>
<h4>Bounds checks and Span&lt;T&gt;</h4>
<p>Every <code>a[i]</code> in C# checks that i is inside the array. The JIT removes the check when it can prove the loop stays in range (the classic <code>for (int i = 0; i &lt; a.Length; i++)</code> shape). <code>Span&lt;T&gt;</code> lets you take a slice of an array without copying, which makes "process a sub-range" code both clean and allocation-free. <code>a.AsSpan(l, len)</code> is your friend in hot loops.</p>
<h4>Prefix sums at scale</h4>
<p>Prefix sums answer queries in O(1) but updates cost O(n) (every later prefix changes). When you need both fast queries and fast updates, you move to a Fenwick tree or segment tree (Advanced DSA), which do both in O(log n). Also watch for overflow: a prefix sum over a million values of 10⁹ needs <code>long</code>, not <code>int</code>.</p>
<h4>Kadane's relatives in interviews</h4>
<ul>
<li><strong>Best time to buy and sell stock:</strong> Kadane on the array of daily differences, or track the minimum price so far.</li>
<li><strong>Maximum sum rectangle in a 2D matrix:</strong> fix a pair of columns, compress each row into one number, run Kadane. O(cols² × rows).</li>
<li><strong>Maximum circular subarray:</strong> answer is max(normal Kadane, total - minimum subarray), with the edge case where every number is negative.</li>
</ul>
<h4>Rotation alternatives and when to pick them</h4>
<p>Reversal is the interview favourite. The <span class="term">juggling algorithm</span> moves elements in gcd(n, k) cycles with fewer writes, which matters when writes are expensive (flash memory). For a <code>List&lt;T&gt;</code> you could also use LINQ (<code>Skip/Take/Concat</code>), but that allocates a new list. Say which trade-off you are making.</p>
<h4>Interval problems beyond merging</h4>
<p>Insert interval (binary search for the position, then merge neighbours), meeting rooms II (minimum rooms = sweep line with a min-heap of end times, or sort starts and ends separately), and non-overlapping intervals (greedy: sort by end, keep the one that ends first). All of them start with "sort by start or by end", so always ask which key makes the greedy choice safe.</p>
<h4>What interviewers listen for</h4>
<p>State the brute force and its cost first. Name the repeated work. Then introduce the pre-computation or the single-pass trick. Say the new time and space. Mention overflow, empty input, k larger than n, and non-square matrices before they ask. That sequence, more than the final code, is what gets a hire.</p>` }
  ],
  flow: {
    title: 'Range sum queries: from recounting to prefix sums',
    steps: [
      { title: 'The slow way', desc: 'Each query "sum of l..r" loops from l to r. Ten thousand queries on a million numbers means billions of additions.' },
      { title: 'Notice the repeat', desc: 'Every query re-adds numbers that an earlier query already added. That repeated work is the thing to remove.' },
      { title: 'Build pre[] once', desc: 'pre[0] = 0, pre[i] = pre[i-1] + a[i-1]. One pass, O(n). pre[i] is "the total of the first i numbers".' },
      { title: 'Answer in O(1)', desc: 'sum(l..r) = pre[r+1] - pre[l]. Two lookups and a subtraction, however long the range is.' },
      { title: 'Check the edges', desc: 'l = 0 works with no special case because pre[0] = 0. r = n-1 reads pre[n], which exists because the array has n+1 slots.' },
      { title: 'Extend to 2D', desc: 'A 2D prefix table answers any rectangle sum with four lookups using inclusion-exclusion.' },
      { title: 'Know the limit', desc: 'Updates cost O(n) because every later prefix changes. For mixed updates and queries, use a Fenwick or segment tree.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Prefix sums, difference array and Kadane', code: `using System;

public static class ArrayBasics
{
    // Build prefix sums: pre[i] = sum of a[0..i-1]. O(n) time, O(n) space.
    public static long[] BuildPrefix(int[] a)
    {
        var pre = new long[a.Length + 1];           // long: avoid overflow on big inputs
        for (int i = 0; i < a.Length; i++)
            pre[i + 1] = pre[i] + a[i];
        return pre;
    }

    // Sum of a[l..r] inclusive in O(1).
    public static long RangeSum(long[] pre, int l, int r) => pre[r + 1] - pre[l];

    // Difference array: apply many "add v to [l, r]" updates in O(1) each,
    // then rebuild the final array with one prefix pass. O(n + q) total.
    public static int[] ApplyRangeAdds(int n, (int l, int r, int v)[] updates)
    {
        var diff = new int[n + 1];
        foreach (var (l, r, v) in updates)
        {
            diff[l] += v;
            diff[r + 1] -= v;                        // r + 1 <= n, safe because diff has n + 1 slots
        }
        var result = new int[n];
        int running = 0;
        for (int i = 0; i < n; i++)
        {
            running += diff[i];
            result[i] = running;
        }
        return result;
    }

    // Kadane: maximum sum of a contiguous subarray. O(n) time, O(1) space.
    // Also returns the start and end index of that subarray.
    public static (long best, int start, int end) MaxSubarray(int[] a)
    {
        long best = a[0], current = a[0];
        int bestStart = 0, bestEnd = 0, curStart = 0;
        for (int i = 1; i < a.Length; i++)
        {
            if (current < 0)                         // a negative past can only hurt: restart here
            {
                current = a[i];
                curStart = i;
            }
            else
            {
                current += a[i];
            }
            if (current > best)
            {
                best = current;
                bestStart = curStart;
                bestEnd = i;
            }
        }
        return (best, bestStart, bestEnd);
    }

    public static void Demo()
    {
        int[] a = { 3, -4, 5, 1, -2, 6, -7 };
        var pre = BuildPrefix(a);
        Console.WriteLine(RangeSum(pre, 2, 5));      // 5 + 1 - 2 + 6 = 10
        var (best, s, e) = MaxSubarray(a);
        Console.WriteLine(best + " from " + s + " to " + e);   // 10 from 2 to 5
    }
}` },
    { lang: 'csharp', title: 'Rotate array (reversal), rotate matrix 90°, spiral order', code: `using System;
using System.Collections.Generic;

public static class Rotations
{
    static void Reverse(int[] a, int l, int r)
    {
        while (l < r) { (a[l], a[r]) = (a[r], a[l]); l++; r--; }
    }

    // Rotate right by k, in place. O(n) time, O(1) extra space.
    public static void RotateRight(int[] a, int k)
    {
        int n = a.Length;
        if (n == 0) return;
        k %= n;                                      // k may be larger than n
        Reverse(a, 0, n - 1);                        // whole array
        Reverse(a, 0, k - 1);                        // first k
        Reverse(a, k, n - 1);                        // the rest
    }

    // Rotate a square matrix 90° clockwise, in place: transpose, then reverse each row.
    public static void RotateClockwise(int[,] m)
    {
        int n = m.GetLength(0);
        for (int i = 0; i < n; i++)                  // transpose (swap across the diagonal)
            for (int j = i + 1; j < n; j++)
                (m[i, j], m[j, i]) = (m[j, i], m[i, j]);
        for (int i = 0; i < n; i++)                  // reverse every row
            for (int l = 0, r = n - 1; l < r; l++, r--)
                (m[i, l], m[i, r]) = (m[i, r], m[i, l]);
    }

    // Spiral order of any rows x cols matrix. O(rows * cols).
    public static List<int> Spiral(int[,] m)
    {
        var result = new List<int>();
        int top = 0, bottom = m.GetLength(0) - 1;
        int left = 0, right = m.GetLength(1) - 1;
        while (top <= bottom && left <= right)
        {
            for (int c = left; c <= right; c++) result.Add(m[top, c]);      // top row
            top++;
            for (int r = top; r <= bottom; r++) result.Add(m[r, right]);    // right column
            right--;
            if (top <= bottom)                                              // guard: thin matrix
            {
                for (int c = right; c >= left; c--) result.Add(m[bottom, c]);
                bottom--;
            }
            if (left <= right)
            {
                for (int r = bottom; r >= top; r--) result.Add(m[r, left]);
                left++;
            }
        }
        return result;
    }

    public static void Demo()
    {
        int[] a = { 1, 2, 3, 4, 5 };
        RotateRight(a, 2);
        Console.WriteLine(string.Join(",", a));      // 4,5,1,2,3

        int[,] m = { { 1, 2, 3 }, { 4, 5, 6 }, { 7, 8, 9 } };
        Console.WriteLine(string.Join(",", Spiral(m)));   // 1,2,3,6,9,8,7,4,5
        RotateClockwise(m);
        Console.WriteLine(m[0, 0] + "," + m[0, 1] + "," + m[0, 2]);   // 7,4,1
    }
}` },
    { lang: 'csharp', title: 'Set matrix zeroes (O(1) space), two sum, merge intervals', code: `using System;
using System.Collections.Generic;

public static class ArrayPatterns
{
    // If a cell is 0, make its whole row and column 0. Uses row 0 and column 0 as markers.
    public static void SetZeroes(int[,] m)
    {
        int rows = m.GetLength(0), cols = m.GetLength(1);
        bool firstColZero = false;

        for (int r = 0; r < rows; r++)
        {
            if (m[r, 0] == 0) firstColZero = true;
            for (int c = 1; c < cols; c++)
                if (m[r, c] == 0) { m[r, 0] = 0; m[0, c] = 0; }    // mark row and column
        }
        for (int r = rows - 1; r >= 0; r--)              // bottom-up so markers survive until used
        {
            for (int c = cols - 1; c >= 1; c--)
                if (m[r, 0] == 0 || m[0, c] == 0) m[r, c] = 0;
            if (firstColZero) m[r, 0] = 0;
        }
    }

    // Brute force two sum: O(n^2) time, O(1) space.
    public static (int, int)? TwoSumBrute(int[] a, int target)
    {
        for (int i = 0; i < a.Length; i++)
            for (int j = i + 1; j < a.Length; j++)
                if (a[i] + a[j] == target) return (i, j);
        return null;
    }

    // Hash two sum: O(n) average time, O(n) space. "Have I seen target - x already?"
    public static (int, int)? TwoSumHash(int[] a, int target)
    {
        var seen = new Dictionary<int, int>();           // value -> index
        for (int i = 0; i < a.Length; i++)
        {
            int need = target - a[i];
            if (seen.TryGetValue(need, out int j)) return (j, i);
            seen[a[i]] = i;                               // store after checking: no self-pairing
        }
        return null;
    }

    // Merge overlapping intervals. O(n log n) for the sort.
    public static List<int[]> MergeIntervals(int[][] intervals)
    {
        var result = new List<int[]>();
        if (intervals.Length == 0) return result;
        Array.Sort(intervals, (x, y) => x[0].CompareTo(y[0]));
        int[] current = (int[])intervals[0].Clone();
        for (int i = 1; i < intervals.Length; i++)
        {
            if (intervals[i][0] <= current[1])            // overlap (touching counts as overlap here)
                current[1] = Math.Max(current[1], intervals[i][1]);
            else
            {
                result.Add(current);
                current = (int[])intervals[i].Clone();
            }
        }
        result.Add(current);
        return result;
    }

    public static void Demo()
    {
        Console.WriteLine(TwoSumHash(new[] { 2, 7, 11, 15 }, 9));            // (0, 1)
        var merged = MergeIntervals(new[] { new[] { 1, 3 }, new[] { 2, 6 }, new[] { 8, 10 }, new[] { 9, 12 } });
        foreach (var iv in merged) Console.Write("[" + iv[0] + "," + iv[1] + "] ");   // [1,6] [8,12]
    }
}` }
  ],
  pitfalls: [
    'Using <code>int</code> for prefix sums. A million values of a billion each overflows. Use <code>long</code> for totals.',
    'Forgetting <code>k %= n</code> before rotating. k = 7 on a 5-element array must behave like k = 2, and k = 5 must do nothing.',
    'Mixing up <code>m[row, col]</code> with x/y thinking. Row comes first. Write the grid on paper with indices before coding.',
    'Kadane with all-negative input: if you start <code>best = 0</code> you will wrongly return 0. Start <code>best = a[0]</code>.',
    'Spiral traversal without the two inner guards double-prints on a single row or single column matrix.',
    'Merging intervals without sorting first. The sweep only works when starts are in order.'
  ],
  quiz: [
    { q: 'With prefix sums pre[] (length n+1, pre[0]=0), what is the sum of a[l..r] inclusive?', options: ['pre[r] - pre[l]', 'pre[r+1] - pre[l]', 'pre[r] - pre[l-1]', 'pre[r+1] - pre[l+1]'], answer: 1, why: 'pre[r+1] holds the sum of the first r+1 elements (indices 0..r). Subtracting pre[l] (indices 0..l-1) leaves exactly l..r.' },
    { q: 'In Kadane\'s algorithm, why do we reset the running sum when it goes negative?', options: ['To keep the running total small enough to fit in an int', 'A negative running sum can only lower what comes next', 'Because a subarray sum is never allowed to be negative', 'To make the loop finish early on long inputs'], answer: 1, why: 'If the sum so far is negative, any subarray that includes it would be larger without it. Starting fresh is never worse.' },
    { q: 'Rotating [1,2,3,4,5] right by 2 using the three-reversal trick gives:', options: ['[3,4,5,1,2]', '[5,4,3,2,1]', '[4,5,1,2,3]', '[2,3,4,5,1]'], answer: 2, why: 'Reverse all → [5,4,3,2,1]; reverse first 2 → [4,5,3,2,1]; reverse the rest → [4,5,1,2,3].' },
    { q: 'Rotating a square matrix 90° clockwise in place is:', options: ['Reverse each row, then transpose', 'Transpose, then reverse each row', 'Transpose only', 'Reverse each column only'], answer: 1, why: 'Transposing swaps rows and columns; reversing each row then produces the clockwise rotation. Doing it in the other order gives a counter-clockwise rotation.' },
    { q: 'The hash-map two-sum stores a number only AFTER checking for its partner. Why?', options: ['Because lookups get faster that way', 'So an element cannot pair with itself', 'A Dictionary throws if you add first', 'So the dictionary keeps insertion order'], answer: 1, why: 'If you stored first, then for target 8 and value 4 you would find 4 in the map and return the same index twice.' },
    { q: 'What is the time complexity of merging n intervals?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], answer: 1, why: 'Sorting by start dominates at O(n log n); the merge sweep itself is O(n).' }
  ],
  takeaways: [
    'Array index access is O(1) because the address is computed, not searched.',
    'Many queries on the same data means pre-compute once: prefix sums answer any range in O(1).',
    'Kadane: extend the running sum, or restart when it turns negative. One pass.',
    'In-place rotation = three reversals. Matrix rotation = transpose + reverse rows.',
    'A hash map turns "find a pair" from O(n²) into O(n) by remembering what you saw.',
    'Interval problems start with "sort by start (or end)", then one sweep.'
  ],
  interview: [
    { q: 'How would you find the maximum sum rectangle in a 2D matrix?', a: '<p>Fix a pair of columns (left, right). For each row, add up the values between those columns to get one number per row. Now the problem is "max subarray" on that 1D array, which Kadane solves in O(rows). Trying all column pairs gives O(cols² × rows).</p>' },
    { q: 'Prefix sums give O(1) queries. What happens when the array also changes?', a: '<p>Each update invalidates every prefix after it, so updates cost O(n). If both updates and queries are frequent, use a Fenwick tree (binary indexed tree) or a segment tree: both give O(log n) for update and query.</p>' },
    { q: 'Explain the difference between int[,] and int[][] in C#.', a: '<p><code>int[,]</code> is one rectangular block in row-major order; every row has the same length. <code>int[][]</code> is an array of separate row arrays; rows can differ in length and each is its own heap object. Jagged arrays are often slightly faster for row-wise loops in .NET; rectangular arrays are simpler for true grids.</p>' },
    { q: 'Rotate an array by k with O(1) extra space. Walk me through edge cases.', a: '<p>Use the three-reversal method. Edge cases: empty array (return), k larger than n (take k mod n), k equal to 0 or n (no change), and negative k if the API allows it (convert to an equivalent positive rotation).</p>' }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-strings — Strings                                                */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-strings'] = {
  hook: `A string is just an array of characters wearing a suit. Once you see the array underneath, every string problem becomes an array problem you already know.`,
  intro: `<p>A <span class="term">string</span> is a sequence of characters: letters, digits, spaces, punctuation. In C#, a string is an object that wraps a read-only array of <code>char</code> values. Each <code>char</code> is a 16-bit number (UTF-16), so <code>'A'</code> is really 65 and <code>'a'</code> is 97. Knowing that characters are numbers unlocks many tricks.</p>
<p>The one rule that trips up most beginners: C# strings are <span class="term">immutable</span>. You cannot change a character in place. Every "change" creates a brand new string. That is fine for small work, but inside a loop it quietly turns an O(n) job into O(n²). The fix is <code>StringBuilder</code> or a <code>char[]</code>, and you will see both here.</p>
<p>This lesson covers the patterns that solve most string questions: counting characters with a small array, comparing anagrams, reversing words in place, longest common prefix, run-length compression, counting palindromes by expanding from the centre, and the ASCII arithmetic that makes all of it fast.</p>`,
  realLife: {
    title: 'The librarian who sorts by counting',
    body: `<p>A librarian gets a box of 10,000 returned books and needs to know how many copies of each title came back. She does not compare every book with every other book. She sets up one shelf slot per title, and as each book arrives she drops it into its slot. At the end she reads the counts off the shelf. That is a <span class="term">frequency count</span>, and for letters it is a 26-slot array.</p>
<p>Two words are <span class="term">anagrams</span> ("listen" and "silent") if their shelves look the same after counting. No sorting needed, just 26 numbers compared.</p>
<p><strong>Where companies use this:</strong> Search engines normalize queries (lowercase, trim, collapse spaces) before matching. Spell checkers compare character counts to suggest fixes. Log pipelines compress repeated characters and words to save storage. Autocomplete finds the longest common prefix between what you typed and stored entries. Every one of these is a loop over characters with a small counting array.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Characters are numbers</h4>
<p>In C#, <code>'a' - 'a'</code> is 0, <code>'c' - 'a'</code> is 2, and <code>(char)('a' + 2)</code> is <code>'c'</code>. This means you can use a letter as an index into an array of size 26: <code>count[s[i] - 'a']++</code>. For any character (including symbols) use an array of size 128 (ASCII) or 256, or a <code>Dictionary&lt;char,int&gt;</code> when the alphabet is unknown (Unicode text, emoji).</p>
<h4>Immutable strings</h4>
<p><code>s = s + "x"</code> does not add a character to s. It builds a new string with all old characters plus "x", then points s at it. Doing that n times copies about n²/2 characters in total. Use <code>StringBuilder</code> (a growable char buffer) for building, or convert to <code>char[]</code> with <code>s.ToCharArray()</code>, edit in place, and make a string at the end with <code>new string(arr)</code>.</p>
<h4>The core patterns</h4>
<table><thead><tr><th>Problem</th><th>Idea</th><th>Time</th></tr></thead><tbody>
<tr><td>Count characters</td><td>Array of 26 / 128 counters</td><td>O(n)</td></tr>
<tr><td>Anagram check</td><td>Same counts (or sort both and compare)</td><td>O(n) / O(n log n)</td></tr>
<tr><td>Reverse words</td><td>Reverse whole array, then reverse each word</td><td>O(n)</td></tr>
<tr><td>Longest common prefix</td><td>Compare column by column, stop at first mismatch</td><td>O(total chars)</td></tr>
<tr><td>Compress "aaabb" → "a3b2"</td><td>Run-length: count runs, write count</td><td>O(n)</td></tr>
<tr><td>Count palindromic substrings</td><td>Expand around each centre (2n-1 centres)</td><td>O(n²)</td></tr>
<tr><td>Is palindrome</td><td>Two pointers from both ends</td><td>O(n)</td></tr>
</tbody></table>
<h4>Useful built-ins you should know</h4>
<ul>
<li><code>s.Length</code>, <code>s[i]</code>, <code>s.Substring(start, len)</code>, <code>s.IndexOf(x)</code>, <code>s.Split(' ')</code>, <code>string.Join(",", parts)</code></li>
<li><code>char.IsLetter(c)</code>, <code>char.IsDigit(c)</code>, <code>char.ToLower(c)</code>, <code>s.ToLowerInvariant()</code></li>
<li><code>s.AsSpan()</code> to read a slice without copying (more on this in Expert)</li>
</ul>
<div class="callout tip">In an interview, say which alphabet you assume. "I will use an int[26] because the problem says lowercase English letters; otherwise I would use a dictionary." That one sentence shows you think about input.</div>` },
    { name: 'Intermediate', body: `<h4>Frequency counting, done right</h4>
<p>One pass to count, one pass to use the counts. First non-repeating character: count, then walk again and return the first index with count 1. Anagram check: count up for the first string, count down for the second, every slot must end at 0. Group anagrams: use the sorted word (or the 26-count turned into a key string like "1#0#2#...") as a dictionary key.</p>
<h4>Reverse words in place</h4>
<p>"the sky is blue" → "blue is sky the". Convert to <code>char[]</code>. Reverse the whole array: "eulb si yks eht". Now reverse each word individually: "blue is sky the". Two linear passes, O(1) extra space apart from the array. If the input has extra spaces, add a cleanup pass that collapses them, or build the answer with <code>Split</code> + <code>Reverse</code> + <code>Join</code> when space is not a constraint.</p>
<h4>Longest common prefix</h4>
<p>Take the first string as the candidate. For each other string, shrink the candidate while it is not a prefix. Or compare column by column: for position i, check that every string has the same character at i. Stop at the first mismatch or the shortest string's end. Both are O(S) where S is the total number of characters.</p>
<h4>String compression (run-length encoding)</h4>
<p>Walk with two indices: i marks the start of a run, j moves while the character repeats. Write the character, then the run length if it is greater than 1. Write into a <code>StringBuilder</code> or, for the in-place variant, into the front of the same <code>char[]</code> (the write index never passes the read index because "a3" is never longer than "aaa").</p>
<h4>Counting palindromic substrings</h4>
<p>Every palindrome has a centre: a single character (odd length) or the gap between two characters (even length). There are 2n-1 centres. From each centre, expand left and right while the characters match and count each successful expansion. O(n²) time, O(1) space. The same expansion gives you the longest palindromic substring: remember the widest expansion. (Manacher's algorithm does it in O(n), covered in Advanced DSA.)</p>
<h4>ASCII tricks worth memorising</h4>
<ul>
<li>Lowercase a letter: <code>c | 32</code> (sets bit 5). Uppercase: <code>c &amp; ~32</code>. Toggle case: <code>c ^ 32</code>. Works for ASCII letters only.</li>
<li>Digit to number: <code>c - '0'</code>. Number to digit: <code>(char)(d + '0')</code>.</li>
<li>Parse an integer by hand: <code>value = value * 10 + (c - '0')</code>, watch for overflow with <code>long</code> or checked arithmetic.</li>
<li>Case-insensitive compare: <code>string.Equals(a, b, StringComparison.OrdinalIgnoreCase)</code> instead of lowering both (no allocation).</li>
</ul>
<div class="callout warn">Never compare strings with <code>==</code> when culture matters, and never use culture-sensitive comparison for identifiers or keys. Use <code>StringComparison.Ordinal</code> for code-level comparisons. Culture rules can make "ss" equal "ß" or change sort order between machines.</div>` },
    { name: 'Expert', body: `<h4>How .NET stores a string</h4>
<p>A string object has a header, a length field, and the UTF-16 characters inline, terminated by a hidden null char. <code>s.Length</code> is O(1). <code>Substring</code> allocates and copies. <code>Span&lt;char&gt;</code> / <code>ReadOnlySpan&lt;char&gt;</code> give you a view into the same memory with zero allocation, which is how modern .NET parsers avoid garbage: <code>s.AsSpan(3, 5)</code>, <code>span.IndexOf('x')</code>, <code>int.Parse(span)</code>. Hot loops in ASP.NET Core and System.Text.Json are written this way.</p>
<h4>Interning and equality</h4>
<p>Identical string literals in your code are <span class="term">interned</span>: they share one object, so <code>ReferenceEquals("a", "a")</code> is true. Strings built at runtime are not interned unless you call <code>string.Intern</code>. <code>==</code> on strings compares content (ordinal), not references, so this rarely bites, but it explains why some "equal" strings are different objects.</p>
<h4>Unicode, surrogates and graphemes</h4>
<p>A <code>char</code> is one UTF-16 code unit, not one visible character. Emoji and many scripts use two code units (a surrogate pair), and a single visible character like "é" can be one code point or two (e + combining accent). <code>s.Length</code> counts code units. To walk visible characters use <code>StringInfo.GetTextElementEnumerator</code>; to walk code points use <code>EnumerateRunes</code>. Reversing a string by swapping chars will break emoji. Interview answer: "my solution assumes ASCII; for full Unicode I would enumerate text elements."</p>
<h4>Choosing the counting structure</h4>
<table><thead><tr><th>Alphabet</th><th>Structure</th><th>Notes</th></tr></thead><tbody>
<tr><td>Lowercase a–z</td><td><code>int[26]</code></td><td>Fastest, stack-friendly with <code>stackalloc</code></td></tr>
<tr><td>ASCII</td><td><code>int[128]</code></td><td>Still tiny; covers digits and symbols</td></tr>
<tr><td>Any Unicode</td><td><code>Dictionary&lt;char,int&gt;</code> or <code>Dictionary&lt;Rune,int&gt;</code></td><td>Correct but slower; hashing cost</td></tr>
</tbody></table>
<h4>Complexity traps</h4>
<ul>
<li><code>s += c</code> in a loop: O(n²). <code>StringBuilder.Append</code>: amortised O(1) per append.</li>
<li><code>s.Substring</code> inside a loop: each call is O(k) copy. Use indices or spans.</li>
<li><code>s.Contains</code> inside a loop over another string: O(n·m). For many pattern searches use KMP, Z-algorithm or a rolling hash (Advanced DSA).</li>
<li>Sorting to compare anagrams is O(n log n); counting is O(n + alphabet). Both are fine; say why you chose one.</li>
</ul>
<h4>Hashing strings</h4>
<p><code>string.GetHashCode()</code> is randomised per process in .NET Core to resist hash-flooding attacks, so never persist it or send it across services. For stable hashes use a rolling polynomial hash you control (Rabin-Karp) or a cryptographic hash when security matters.</p>
<h4>What interviewers listen for</h4>
<p>"Strings are immutable, so I will use a char array or StringBuilder." "I assume lowercase letters; here is what changes for Unicode." "Expand-around-centre is O(n²); Manacher gets O(n) if we need it." Those three sentences cover most follow-up questions.</p>` }
  ],
  flow: {
    title: 'Counting palindromic substrings by expanding from the centre',
    steps: [
      { title: 'List the centres', desc: 'A string of length n has n single-character centres and n-1 gaps between characters: 2n-1 centres in total.' },
      { title: 'Pick a centre', desc: 'Set two pointers: left and right. For an odd centre both start at i; for an even centre left = i, right = i+1.' },
      { title: 'Expand while equal', desc: 'While left >= 0, right < n and s[left] == s[right], you have found one more palindrome. Count it, then move left one step left and right one step right.' },
      { title: 'Stop at a mismatch', desc: 'The first mismatch ends this centre. Everything wider cannot be a palindrome because its inner part already failed.' },
      { title: 'Next centre', desc: 'Repeat for all 2n-1 centres. Each expansion is at most O(n), so the total is O(n²) with O(1) extra space.' },
      { title: 'Track the widest', desc: 'Remember the longest expansion you saw: that is the longest palindromic substring, free of charge.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Frequency counting: first unique char, anagram check, group anagrams', code: `using System;
using System.Collections.Generic;

public static class Counting
{
    // Index of the first character that appears exactly once, or -1. O(n) time, O(1) space (26 slots).
    public static int FirstUniqueChar(string s)
    {
        var count = new int[26];
        foreach (char c in s) count[c - 'a']++;
        for (int i = 0; i < s.Length; i++)
            if (count[s[i] - 'a'] == 1) return i;
        return -1;
    }

    // Count up for a, count down for b. All zeros means anagram. O(n), O(1) space.
    public static bool AreAnagrams(string a, string b)
    {
        if (a.Length != b.Length) return false;
        var count = new int[26];
        for (int i = 0; i < a.Length; i++)
        {
            count[a[i] - 'a']++;
            count[b[i] - 'a']--;
        }
        foreach (int c in count) if (c != 0) return false;
        return true;
    }

    // Group words that are anagrams of each other. Key = the 26 counts joined by '#'.
    // O(total characters) instead of O(k log k) per word for sorting.
    public static List<List<string>> GroupAnagrams(string[] words)
    {
        var groups = new Dictionary<string, List<string>>();
        foreach (var w in words)
        {
            var count = new int[26];
            foreach (char c in w) count[c - 'a']++;
            string key = string.Join("#", count);          // e.g. "1#0#0#...#1"
            if (!groups.TryGetValue(key, out var list))
                groups[key] = list = new List<string>();
            list.Add(w);
        }
        return new List<List<string>>(groups.Values);
    }

    public static void Demo()
    {
        Console.WriteLine(FirstUniqueChar("leetcode"));              // 0
        Console.WriteLine(AreAnagrams("listen", "silent"));          // True
        var g = GroupAnagrams(new[] { "eat", "tea", "tan", "ate", "nat", "bat" });
        Console.WriteLine(g.Count);                                  // 3 groups
    }
}` },
    { lang: 'csharp', title: 'Reverse words in place, longest common prefix, run-length compression', code: `using System;
using System.Text;

public static class StringOps
{
    static void Reverse(char[] a, int l, int r)
    {
        while (l < r) { (a[l], a[r]) = (a[r], a[l]); l++; r--; }
    }

    // "the sky is blue" -> "blue is sky the". Assumes single spaces. O(n) time, O(n) for the char array.
    public static string ReverseWords(string s)
    {
        var a = s.ToCharArray();
        Reverse(a, 0, a.Length - 1);                 // reverse everything
        int start = 0;
        for (int i = 0; i <= a.Length; i++)
        {
            if (i == a.Length || a[i] == ' ')        // end of a word
            {
                Reverse(a, start, i - 1);            // reverse this word back
                start = i + 1;
            }
        }
        return new string(a);
    }

    // Compare column by column. O(total chars) worst case.
    public static string LongestCommonPrefix(string[] words)
    {
        if (words.Length == 0) return "";
        for (int col = 0; col < words[0].Length; col++)
        {
            char c = words[0][col];
            for (int w = 1; w < words.Length; w++)
                if (col >= words[w].Length || words[w][col] != c)
                    return words[0].Substring(0, col);
        }
        return words[0];
    }

    // "aaabccdddd" -> "a3bc2d4". Run-length encoding with a StringBuilder. O(n).
    public static string Compress(string s)
    {
        var sb = new StringBuilder();
        int i = 0;
        while (i < s.Length)
        {
            int j = i;
            while (j < s.Length && s[j] == s[i]) j++;  // j runs to the end of this run
            sb.Append(s[i]);
            int run = j - i;
            if (run > 1) sb.Append(run);
            i = j;
        }
        return sb.ToString();
    }

    public static void Demo()
    {
        Console.WriteLine(ReverseWords("the sky is blue"));                        // blue is sky the
        Console.WriteLine(LongestCommonPrefix(new[] { "flower", "flow", "flight" })); // fl
        Console.WriteLine(Compress("aaabccdddd"));                                 // a3bc2d4
    }
}` },
    { lang: 'csharp', title: 'Palindromes by centre expansion, and ASCII tricks', code: `using System;

public static class Palindromes
{
    // Count all palindromic substrings. O(n^2) time, O(1) space.
    public static int CountPalindromicSubstrings(string s)
    {
        int total = 0;
        for (int centre = 0; centre < 2 * s.Length - 1; centre++)
        {
            int left = centre / 2;                   // odd centres: i,i   even centres: i,i+1
            int right = left + centre % 2;
            while (left >= 0 && right < s.Length && s[left] == s[right])
            {
                total++;
                left--;
                right++;
            }
        }
        return total;
    }

    // Longest palindromic substring with the same expansion. O(n^2).
    public static string LongestPalindrome(string s)
    {
        if (s.Length < 2) return s;
        int bestStart = 0, bestLen = 1;
        for (int centre = 0; centre < 2 * s.Length - 1; centre++)
        {
            int left = centre / 2, right = left + centre % 2;
            while (left >= 0 && right < s.Length && s[left] == s[right]) { left--; right++; }
            int len = right - left - 1;              // the loop overshot by one on each side
            if (len > bestLen) { bestLen = len; bestStart = left + 1; }
        }
        return s.Substring(bestStart, bestLen);
    }

    // Is it a palindrome, ignoring non-letters and case? Two pointers. O(n).
    public static bool IsPalindromeClean(string s)
    {
        int l = 0, r = s.Length - 1;
        while (l < r)
        {
            while (l < r && !char.IsLetterOrDigit(s[l])) l++;
            while (l < r && !char.IsLetterOrDigit(s[r])) r--;
            if (char.ToLowerInvariant(s[l]) != char.ToLowerInvariant(s[r])) return false;
            l++; r--;
        }
        return true;
    }

    // ASCII arithmetic: parse digits by hand, toggle case with one bit.
    public static long ParseDigits(string s)
    {
        long value = 0;
        foreach (char c in s) value = value * 10 + (c - '0');   // use long to delay overflow
        return value;
    }
    public static char ToggleCase(char c) => (char)(c ^ 32);    // ASCII letters only

    public static void Demo()
    {
        Console.WriteLine(CountPalindromicSubstrings("aaa"));     // 6: a,a,a,aa,aa,aaa
        Console.WriteLine(LongestPalindrome("babad"));            // bab (or aba)
        Console.WriteLine(IsPalindromeClean("A man, a plan, a canal: Panama"));   // True
        Console.WriteLine(ParseDigits("12345") + 1);              // 12346
        Console.WriteLine(ToggleCase('a') + "" + ToggleCase('Q')); // Aq
    }
}` }
  ],
  pitfalls: [
    'Building a string with <code>+=</code> inside a loop. Each step copies the whole string: O(n²). Use <code>StringBuilder</code>.',
    'Using <code>s[i] - \'a\'</code> on input that contains uppercase letters, digits or spaces. You get a negative or out-of-range index. Validate or widen the array.',
    'Treating <code>s.Length</code> as the number of visible characters. Emoji and accents can take two or more <code>char</code> slots.',
    'Reversing words with <code>Split</code> when the problem asks for O(1) extra space. Know the in-place two-pass method.',
    'Culture-sensitive comparisons for keys and identifiers. Use <code>StringComparison.Ordinal</code> (or OrdinalIgnoreCase).',
    'Forgetting the even-length centres when counting palindromes. "aa" has a centre between the two characters.'
  ],
  quiz: [
    { q: 'Why is <code>s += c</code> inside a loop slow in C#?', options: ['Each char is a large object on the heap', 'Each += builds a new string and copies everything', 'The + operator on strings is never optimised by the JIT', 'It uses recursion under the hood'], answer: 1, why: 'Every concatenation creates a new string and copies all existing characters, giving O(n²) total work for n appends.' },
    { q: 'What does <code>count[c - \'a\']++</code> rely on?', options: ['The string being sorted before the loop starts', 'Letters being numbers that map to 0..25', 'A dictionary that C# builds behind the scenes', 'Unicode normalisation of every character'], answer: 1, why: 'A char is a 16-bit number. Subtracting the code of a gives 0 for a, 1 for b, and so on, which indexes a 26-slot array.' },
    { q: 'How many centres does a string of length n have for palindrome expansion?', options: ['n', 'n - 1', '2n - 1', 'n²'], answer: 2, why: 'n centres on characters (odd-length palindromes) plus n-1 centres between characters (even-length palindromes).' },
    { q: 'To reverse the words of a sentence in place, you:', options: ['Reverse each word, then sort', 'Reverse the whole array, then reverse each word', 'Swap the first and last word repeatedly', 'Use a stack of characters'], answer: 1, why: 'Reversing everything puts the words in the right order but each word backwards; reversing each word fixes that.' },
    { q: 'Checking if two strings are anagrams with a counting array costs:', options: ['O(n log n)', 'O(n × alphabet size)', 'O(n + alphabet size)', 'O(1)'], answer: 2, why: 'One pass over both strings, then one pass over the 26 (or 128) counters.' },
    { q: 'Which comparison should you use for code-level string keys in .NET?', options: ['Culture-sensitive default', 'StringComparison.Ordinal', 'Convert both to lowercase with ToLower()', 'ReferenceEquals'], answer: 1, why: 'Ordinal compares code units directly: fast, allocation-free and the same on every machine. Culture rules can differ by locale.' }
  ],
  takeaways: [
    'A string is a read-only char array; chars are numbers, so letters can index a 26-slot counter.',
    'Immutability means build with StringBuilder or char[], never += in a loop.',
    'Frequency counting solves unique-char, anagram and grouping problems in O(n).',
    'Reverse words in place: reverse all, then reverse each word.',
    'Palindromes: expand around 2n-1 centres, O(n²), O(1) space.',
    'Say your alphabet assumption out loud; Unicode changes the answer.'
  ],
  interview: [
    { q: 'Find the longest palindromic substring. What are the options and their costs?', a: '<p>Brute force checks every substring: O(n³). Expand around each of the 2n-1 centres: O(n²) time, O(1) space, easy to write. Dynamic programming on a 2D table: O(n²) time and space. Manacher\'s algorithm: O(n) time, harder to write; mention it, implement expansion unless asked for linear time.</p>' },
    { q: 'How do you check if one string is a rotation of another?', a: '<p>If lengths match, b is a rotation of a exactly when b appears inside a + a. For example "cdeab" is inside "abcdeabcde". With a linear substring search (KMP) this is O(n).</p>' },
    { q: 'Why does <code>string.GetHashCode()</code> change between runs?', a: '<p>.NET Core randomises string hashing per process to prevent hash-flooding attacks on dictionaries. Never store or transmit it; use your own stable hash when you need one.</p>' },
    { q: 'What breaks if you reverse a string by swapping chars?', a: '<p>Surrogate pairs (emoji, some scripts) and combining marks get split or reordered, producing invalid or wrong text. Enumerate text elements (graphemes) and reverse those instead when input may contain Unicode beyond the basic plane.</p>' }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-maths — Number System & Maths: Sieve, Fast Power, Modular        */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-maths'] = {
  hook: `Computers cannot hold every number, and they cannot wait forever. The maths in this lesson is about staying inside those two limits: keep numbers small with "mod", and keep work small with clever repetition.`,
  intro: `<p>Many problems look like they need a calculator, not a programmer: "find all primes below ten million", "compute 3 to the power of a billion", "how many ways to pick 5 items from 1000". The naive approach either takes hours or overflows the integer type. A few classic ideas fix that.</p>
<p>The <span class="term">sieve of Eratosthenes</span> finds all primes up to n by crossing out multiples instead of testing each number. <span class="term">Fast exponentiation</span> computes huge powers in about 30 steps by squaring. <span class="term">Modular arithmetic</span> keeps every intermediate number below a fixed limit (usually 1,000,000,007) so nothing overflows. And a few small tools, like GCD, counting digits and trailing zeros, show up constantly.</p>
<p>You do not need to be a mathematician. You need to know about eight patterns and the reason each one works. That is this lesson.</p>`,
  realLife: {
    title: 'The clock that never overflows',
    body: `<p>It is 10 o'clock. What time is it in 5 hours? 3 o'clock, not 15. A clock face "wraps around" at 12. That wrap-around is <span class="term">modular arithmetic</span>. You never need a number bigger than 12 to answer any clock question, no matter how many hours you add. Programmers use the same trick with a very big "clock" of size 1,000,000,007 so that answers to counting problems never overflow a 64-bit integer.</p>
<p>And the sieve? Picture a school hall with every number from 2 to 100 written on chairs. You walk to chair 2 and tell every second chair "you are not prime". Walk to chair 3, tell every third chair. Skip chairs already marked. By the time you reach chair 11 (past the square root of 100), every non-prime is already marked. You never tested a single number for primality; you just crossed out multiples.</p>
<p><strong>Where companies use this:</strong> RSA encryption (your HTTPS padlock) is modular exponentiation with enormous primes. Hash tables use primes and modulo to spread keys. Distributed systems use GCD and modular counters for scheduling and sharding. Payment systems use digit checks (Luhn) on card numbers.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Primes and the sieve</h4>
<p>A <span class="term">prime</span> is a number greater than 1 that divides evenly only by 1 and itself: 2, 3, 5, 7, 11... To test one number n, try dividing by every value up to the square root of n (if n has a factor bigger than its root, it also has one smaller). That is O(√n) per number.</p>
<p>To find all primes up to n at once, use the sieve: make a boolean array, assume everything is prime, then for each prime p starting at 2, cross out p·p, p·p+p, p·p+2p... You start at p·p because smaller multiples were already crossed out by smaller primes. Total work is about O(n log log n), which is nearly linear. Ten million numbers take well under a second.</p>
<h4>Fast exponentiation (binary exponentiation)</h4>
<p>3¹⁰ the slow way is nine multiplications. The fast way notices that 3¹⁰ = (3⁵)² and 3⁵ = 3 × (3²)². Square the base and halve the exponent each step; when the exponent is odd, multiply the answer by the base once. For an exponent of a billion you need only about 30 steps (log₂ of the exponent).</p>
<h4>Modular arithmetic: the wrap-around</h4>
<p><code>a % m</code> gives the remainder after dividing a by m. The useful rules:</p>
<ul>
<li>(a + b) % m = ((a % m) + (b % m)) % m</li>
<li>(a × b) % m = ((a % m) × (b % m)) % m</li>
<li>(a − b) % m = ((a % m) − (b % m) + m) % m (the + m fixes negatives)</li>
<li>Division does NOT work this way. You need a "modular inverse" (Intermediate).</li>
</ul>
<p>Why 1,000,000,007? It is prime (so inverses exist), it fits in an <code>int</code>, and two such numbers multiplied fit in a <code>long</code>. Problem setters picked it so answers stay checkable.</p>
<h4>GCD and LCM</h4>
<p>The <span class="term">greatest common divisor</span> of 12 and 18 is 6. Euclid's trick: gcd(a, b) = gcd(b, a % b), stop when b is 0. About O(log min(a, b)) steps. The <span class="term">least common multiple</span> is a / gcd(a, b) × b (divide first to avoid overflow).</p>
<h4>Small tools</h4>
<ul>
<li>Count digits: divide by 10 until zero, or use <code>(int)Math.Floor(Math.Log10(n)) + 1</code> for n &gt; 0.</li>
<li>Trailing zeros in n!: count factors of 5, since 2s are plentiful: n/5 + n/25 + n/125 + ...</li>
<li>Reverse a number: pull off the last digit with % 10, push it onto the result with × 10.</li>
</ul>
<div class="callout tip">Whenever a problem says "answer modulo 10⁹+7", it is telling you the true answer is enormous. Apply % after every addition and multiplication, never only at the end.</div>` },
    { name: 'Intermediate', body: `<h4>Sieve variants</h4>
<p><strong>Smallest prime factor sieve:</strong> instead of a boolean, store the smallest prime that divides each number. Then you can factorise any number up to n in O(log n) by repeatedly dividing by its smallest prime factor. <strong>Segmented sieve:</strong> to find primes in a range [L, R] where R is huge (10¹²) but R − L is small (10⁶), sieve only that window using the primes up to √R. <strong>Counting divisors or Euler's totient</strong> for all numbers up to n can also be done sieve-style.</p>
<h4>Modular inverse via Fermat</h4>
<p>You cannot do (a / b) % m directly. But if m is prime and b is not a multiple of m, Fermat's little theorem says b^(m−1) ≡ 1 (mod m), so b^(m−2) ≡ b⁻¹ (mod m). So "divide by b" becomes "multiply by b^(m−2) mod m", and fast exponentiation computes that in ~30 steps. If m is not prime, use the extended Euclidean algorithm instead (works when gcd(b, m) = 1).</p>
<h4>nCr: three ways</h4>
<ul>
<li><strong>Pascal's triangle:</strong> C(n, r) = C(n−1, r−1) + C(n−1, r). Build a table in O(n·r). Only additions, so it works with any modulus. Good for n up to a few thousand.</li>
<li><strong>Factorials with inverses:</strong> C(n, r) = n! × (r!)⁻¹ × ((n−r)!)⁻¹ mod p. Precompute factorials and inverse factorials up to n once, answer each query in O(1). Good for n up to 10⁶ or more with a prime modulus.</li>
<li><strong>Multiplicative formula:</strong> result = result × (n − i) / (i + 1) for i from 0 to r−1, with exact integer division (the division is always exact at each step). Good for a single small answer without a modulus.</li>
</ul>
<h4>Overflow discipline</h4>
<p>Two values below 10⁹+7 multiply to about 10¹⁸, which fits in a <code>long</code> (max ≈ 9.2 × 10¹⁸) but not an <code>int</code>. So: store values in <code>long</code>, multiply, then % m. Three values multiplied together do not fit even in <code>long</code>: reduce after every multiplication. C# does not throw on overflow by default; it silently wraps, which produces wrong answers with no error. Use <code>checked { }</code> in tests to catch mistakes.</p>
<h4>Fast power with modulus</h4>
<p>Same loop as before, but reduce after every multiplication: <code>result = result * base % m</code> and <code>base = base * base % m</code>. This is the heart of RSA, of modular inverse, and of many counting problems.</p>
<h4>More digit tricks</h4>
<ul>
<li>Digital root (keep summing digits until one digit): for n &gt; 0 it is 1 + (n − 1) % 9.</li>
<li>Check divisibility by 3 or 9: digit sum divisible by 3 or 9.</li>
<li>Palindrome number: reverse the digits and compare, or reverse only half to avoid overflow.</li>
<li>Count of a digit d in all numbers 1..n: solve position by position (higher, current, lower parts). Classic interview puzzle.</li>
</ul>
<div class="callout warn">In C#, <code>-7 % 3</code> is <code>-1</code>, not 2. The remainder takes the sign of the dividend. Always write <code>((a % m) + m) % m</code> when a can be negative.</div>` },
    { name: 'Expert', body: `<h4>Why the sieve is O(n log log n)</h4>
<p>For each prime p you do about n/p crossings. Summing n/p over all primes up to n gives n × (1/2 + 1/3 + 1/5 + 1/7 + ...), and the sum of reciprocals of primes up to n grows like log log n. So the total is n log log n, which for n = 10⁸ is only about 3n. A linear sieve (Euler's sieve) crosses each composite exactly once using its smallest prime factor and runs in true O(n), with better constants on some inputs. Memory, not time, is the real limit: a <code>bool[]</code> of 10⁹ is a gigabyte; use a <code>BitArray</code> or sieve only odd numbers to halve it.</p>
<h4>Primality testing for big numbers</h4>
<p>For a single 64-bit number, trial division to √n (about 3 × 10⁹ steps) is too slow. <span class="term">Miller–Rabin</span> is a probabilistic test that becomes deterministic for 64-bit integers if you check a fixed set of bases (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37). Each round is one modular exponentiation. For factoring large numbers, Pollard's rho finds a factor in roughly O(n^¼) expected time. Both use <code>UInt128</code> or careful multiplication to avoid overflow in a × b mod m.</p>
<h4>Modular arithmetic internals</h4>
<p>Division is slow at the hardware level (tens of cycles versus a few for multiplication). Hot loops that do <code>% m</code> millions of times are measurable. Tricks: Barrett reduction and Montgomery multiplication replace division with multiplications and shifts for a fixed modulus. The JIT already does this for constant moduli in some cases; for dynamic moduli you implement it yourself. Also, <code>x % m</code> where m is a power of two is just <code>x &amp; (m − 1)</code>, which is why hash tables often use power-of-two sizes.</p>
<h4>Chinese remainder theorem and non-prime moduli</h4>
<p>When the modulus is composite, Fermat does not apply. If it factors into coprime parts, solve modulo each part and combine with the <span class="term">Chinese remainder theorem</span>. For nCr modulo a prime power, Lucas' theorem (prime modulus) or generalisations handle it. These are rare in interviews but common in competitive programming.</p>
<h4>Floating point is not maths</h4>
<p><code>Math.Pow</code> returns a <code>double</code>: 53 bits of precision, so integers above 2⁵³ (about 9 × 10¹⁵) lose exactness. Never use <code>Math.Pow</code> or <code>Math.Sqrt</code> for exact integer answers without correction. For integer square root, compute <code>(long)Math.Sqrt(n)</code> then adjust up or down by one while checking r × r against n, or use binary search.</p>
<h4>Choosing the technique</h4>
<table><thead><tr><th>Need</th><th>Use</th><th>Cost</th></tr></thead><tbody>
<tr><td>All primes ≤ 10⁷</td><td>Sieve (odd-only, bit-packed)</td><td>O(n log log n)</td></tr>
<tr><td>Is one 64-bit number prime?</td><td>Miller–Rabin, fixed bases</td><td>12 modular powers</td></tr>
<tr><td>a^b mod p, b up to 10¹⁸</td><td>Binary exponentiation</td><td>O(log b)</td></tr>
<tr><td>Divide under mod p</td><td>Multiply by inverse (Fermat)</td><td>O(log p)</td></tr>
<tr><td>Many nCr queries mod p</td><td>Factorial + inverse factorial tables</td><td>O(n) prep, O(1) query</td></tr>
<tr><td>gcd of two numbers</td><td>Euclid</td><td>O(log min)</td></tr>
</tbody></table>` }
  ],
  flow: {
    title: 'Fast exponentiation: 3^13 in four squarings',
    steps: [
      { title: 'Write the exponent in binary', desc: '13 = 1101 in binary = 8 + 4 + 1. So 3^13 = 3^8 × 3^4 × 3^1. We only need powers of 3 whose exponent is a power of two.' },
      { title: 'Start: result = 1, base = 3, exp = 13', desc: 'The lowest bit of 13 is 1, so multiply result by base: result = 3. Then square the base (3 → 9) and halve the exponent (13 → 6).' },
      { title: 'exp = 6, base = 9', desc: 'Lowest bit is 0: skip the multiply. Square the base (9 → 81), halve the exponent (6 → 3).' },
      { title: 'exp = 3, base = 81', desc: 'Lowest bit is 1: result = 3 × 81 = 243. Square the base (81 → 6561), halve (3 → 1).' },
      { title: 'exp = 1, base = 6561', desc: 'Lowest bit is 1: result = 243 × 6561 = 1,594,323. Halve the exponent to 0. Done: 3^13 = 1,594,323.' },
      { title: 'Count the work', desc: 'Four squarings and three multiplies instead of twelve multiplies. For an exponent of a billion: about 30 steps instead of a billion.' },
      { title: 'Add the modulus', desc: 'Apply % m after every multiplication and the numbers never exceed m². That is modular exponentiation, the core of RSA and modular inverses.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Sieve of Eratosthenes, smallest prime factor sieve, trial division', code: `using System;
using System.Collections.Generic;

public static class Primes
{
    // All primes up to n. O(n log log n) time, O(n) space.
    public static List<int> Sieve(int n)
    {
        var composite = new bool[n + 1];
        var primes = new List<int>();
        for (int p = 2; p <= n; p++)
        {
            if (composite[p]) continue;
            primes.Add(p);
            // start at p*p: smaller multiples were crossed out by smaller primes.
            // use long to avoid overflow when p*p exceeds int range.
            for (long multiple = (long)p * p; multiple <= n; multiple += p)
                composite[multiple] = true;
        }
        return primes;
    }

    // Smallest prime factor for every number up to n. Enables O(log n) factorisation.
    public static int[] SmallestPrimeFactor(int n)
    {
        var spf = new int[n + 1];
        for (int i = 2; i <= n; i++)
        {
            if (spf[i] != 0) continue;              // already has a smallest factor
            for (long j = i; j <= n; j += i)
                if (spf[j] == 0) spf[j] = i;
        }
        return spf;
    }

    // Factorise x using the spf table: repeatedly divide by its smallest prime factor.
    public static List<(int prime, int power)> Factorise(int x, int[] spf)
    {
        var result = new List<(int, int)>();
        while (x > 1)
        {
            int p = spf[x], count = 0;
            while (x % p == 0) { x /= p; count++; }
            result.Add((p, count));
        }
        return result;
    }

    // Test one number by trial division up to sqrt(n). O(sqrt n).
    public static bool IsPrime(long n)
    {
        if (n < 2) return false;
        if (n % 2 == 0) return n == 2;
        for (long d = 3; d * d <= n; d += 2)
            if (n % d == 0) return false;
        return true;
    }

    public static void Demo()
    {
        Console.WriteLine(string.Join(",", Sieve(30)));           // 2,3,5,7,11,13,17,19,23,29
        var spf = SmallestPrimeFactor(100);
        foreach (var (p, k) in Factorise(84, spf)) Console.Write(p + "^" + k + " ");   // 2^2 3^1 7^1
        Console.WriteLine();
        Console.WriteLine(IsPrime(1_000_000_007));                 // True
    }
}` },
    { lang: 'csharp', title: 'Fast power, modular inverse, GCD/LCM, modular add/sub/mul', code: `using System;

public static class Modular
{
    public const long MOD = 1_000_000_007;

    // a^e mod m in O(log e). Works for e up to long.MaxValue.
    public static long PowMod(long a, long e, long m = MOD)
    {
        long result = 1;
        a %= m;
        if (a < 0) a += m;
        while (e > 0)
        {
            if ((e & 1) == 1) result = result * a % m;   // odd exponent: take one factor
            a = a * a % m;                                // square the base
            e >>= 1;                                      // halve the exponent
        }
        return result;
    }

    // Plain integer power with overflow check (no modulus). Throws if it overflows.
    public static long Pow(long a, int e)
    {
        long result = 1;
        checked
        {
            while (e > 0)
            {
                if ((e & 1) == 1) result *= a;
                e >>= 1;
                if (e > 0) a *= a;
            }
        }
        return result;
    }

    // Modular inverse by Fermat: a^(m-2) mod m, valid when m is prime and a % m != 0.
    public static long Inverse(long a, long m = MOD) => PowMod(a, m - 2, m);

    // "a / b" under a prime modulus = a * inverse(b).
    public static long DivMod(long a, long b, long m = MOD) => a % m * Inverse(b, m) % m;

    public static long AddMod(long a, long b, long m = MOD) => ((a + b) % m + m) % m;
    public static long SubMod(long a, long b, long m = MOD) => ((a - b) % m + m) % m;   // + m fixes negatives
    public static long MulMod(long a, long b, long m = MOD) => (a % m) * (b % m) % m;   // each < m so product < m^2 fits long

    // Euclid: gcd(a, b) = gcd(b, a % b). O(log min(a, b)).
    public static long Gcd(long a, long b)
    {
        while (b != 0) (a, b) = (b, a % b);
        return Math.Abs(a);
    }

    // Divide before multiplying to avoid overflow.
    public static long Lcm(long a, long b) => a / Gcd(a, b) * b;

    // Extended Euclid: returns g = gcd(a, b) and x, y with a*x + b*y = g. Inverse when m is not prime.
    public static (long g, long x, long y) ExtendedGcd(long a, long b)
    {
        if (b == 0) return (a, 1, 0);
        var (g, x1, y1) = ExtendedGcd(b, a % b);
        return (g, y1, x1 - (a / b) * y1);
    }

    public static void Demo()
    {
        Console.WriteLine(PowMod(3, 13));                 // 1594323
        Console.WriteLine(PowMod(2, 1_000_000_000));      // 140625001
        Console.WriteLine(DivMod(10, 2));                 // 5  (10 * inverse(2) mod p)
        Console.WriteLine(Gcd(84, 36) + " " + Lcm(4, 6)); // 12 12
        Console.WriteLine(SubMod(3, 5));                  // 1000000005 (not -2)
    }
}` },
    { lang: 'csharp', title: 'Digits, trailing zeros, nCr with Pascal and with factorial tables', code: `using System;

public static class Combinatorics
{
    const long MOD = 1_000_000_007;

    public static int CountDigits(long n)
    {
        if (n == 0) return 1;
        n = Math.Abs(n);
        int count = 0;
        while (n > 0) { n /= 10; count++; }
        return count;
    }

    public static long ReverseDigits(long n)
    {
        long result = 0;
        while (n > 0) { result = result * 10 + n % 10; n /= 10; }
        return result;
    }

    // Trailing zeros of n! = number of factors of 5 in 1..n (2s are always more plentiful).
    public static long TrailingZerosOfFactorial(long n)
    {
        long count = 0;
        for (long p = 5; p <= n; p *= 5) count += n / p;   // n/5 + n/25 + n/125 + ...
        return count;
    }

    // Pascal's triangle: C(n, r) = C(n-1, r-1) + C(n-1, r). O(n*r) time. Any modulus works.
    public static long NCrPascal(int n, int r, long mod = MOD)
    {
        if (r < 0 || r > n) return 0;
        var row = new long[r + 1];
        row[0] = 1;
        for (int i = 1; i <= n; i++)
            for (int j = Math.Min(i, r); j >= 1; j--)       // right-to-left so we use the old row
                row[j] = (row[j] + row[j - 1]) % mod;
        return row[r];
    }

    // Factorial tables: O(n) precompute, O(1) per query. Requires a prime modulus.
    public sealed class BinomialTable
    {
        readonly long[] fact, invFact;
        readonly long mod;
        public BinomialTable(int maxN, long mod = MOD)
        {
            this.mod = mod;
            fact = new long[maxN + 1];
            invFact = new long[maxN + 1];
            fact[0] = 1;
            for (int i = 1; i <= maxN; i++) fact[i] = fact[i - 1] * i % mod;
            invFact[maxN] = Modular.PowMod(fact[maxN], mod - 2, mod);   // Fermat inverse of n!
            for (int i = maxN; i > 0; i--) invFact[i - 1] = invFact[i] * i % mod;   // walk down
        }
        public long C(int n, int r)
        {
            if (r < 0 || r > n) return 0;
            return fact[n] * invFact[r] % mod * invFact[n - r] % mod;
        }
    }

    // Exact small nCr without modulus: multiply then divide, division is exact at each step.
    public static long NCrExact(int n, int r)
    {
        r = Math.Min(r, n - r);
        long result = 1;
        for (int i = 0; i < r; i++) result = result * (n - i) / (i + 1);
        return result;
    }

    public static void Demo()
    {
        Console.WriteLine(CountDigits(90210) + " " + ReverseDigits(1230));   // 5 321
        Console.WriteLine(TrailingZerosOfFactorial(100));                     // 24
        Console.WriteLine(NCrPascal(10, 3) + " " + NCrExact(10, 3));          // 120 120
        var table = new BinomialTable(1_000_000);
        Console.WriteLine(table.C(1000, 500));                                // 159835829
    }
}` }
  ],
  pitfalls: [
    'Applying <code>% MOD</code> only at the end. Intermediate products overflow long before that. Reduce after every multiplication and addition.',
    'Using <code>int</code> for products of two values near 10⁹. The product is around 10¹⁸ and needs <code>long</code>.',
    'Negative remainders: <code>(a - b) % m</code> can be negative in C#. Add m and take % again.',
    'Dividing under a modulus. Multiply by the modular inverse instead, and only when the modulus is prime (Fermat) or coprime (extended Euclid).',
    'Starting the sieve inner loop at 2p instead of p·p. It still works but does extra work, and <code>p * p</code> as an int overflows for p above 46,340.',
    'Trusting <code>Math.Pow</code> or <code>Math.Sqrt</code> for exact integer results. Doubles lose precision above 2⁵³.'
  ],
  quiz: [
    { q: 'In the sieve, why can the inner loop start at p × p?', options: ['It saves memory in the boolean array', 'Smaller multiples of p are already crossed out', 'Because p × p is always the next prime after p', 'It avoids negative indexes in the inner loop'], answer: 1, why: 'Any multiple k × p with k < p has a prime factor smaller than p, so an earlier prime already marked it.' },
    { q: 'How many multiplications does binary exponentiation need for a^(10⁹)?', options: ['About a billion', 'About a million', 'About 30 to 60', 'Exactly 10'], answer: 2, why: 'Each step halves the exponent: log₂(10⁹) ≈ 30 squarings, plus up to 30 extra multiplies for set bits.' },
    { q: 'Why does "divide by b under mod p" become "multiply by b^(p-2)"?', options: ['Because p-2 is always even, so squaring is exact', 'By Fermat, b^(p-1) ≡ 1, so b^(p-2) is the inverse of b', 'By Euclid, gcd(b, p) = p − 2, so that power cancels b', 'It is only a convention that problem setters agreed on'], answer: 1, why: 'For prime p and b not divisible by p, b^(p-1) ≡ 1 (mod p). Multiply both sides by b⁻¹ to get b^(p-2) ≡ b⁻¹.' },
    { q: 'How many trailing zeros does 100! have?', options: ['10', '20', '24', '25'], answer: 2, why: 'Count factors of 5: 100/5 = 20, plus 100/25 = 4, total 24. Factors of 2 are always more plentiful.' },
    { q: 'In C#, what is -7 % 3?', options: ['2', '-1', '1', '-2'], answer: 1, why: 'C# remainder takes the sign of the dividend. To get a non-negative result use ((a % m) + m) % m.' },
    { q: 'lcm(a, b) is best computed as:', options: ['a × b / gcd(a, b)', 'a / gcd(a, b) × b', 'gcd(a, b) × a × b', 'a + b − gcd(a, b)'], answer: 1, why: 'Dividing first keeps the intermediate value small; a × b first can overflow even when the final lcm fits.' }
  ],
  takeaways: [
    'Sieve: cross out multiples starting at p², O(n log log n), nearly linear.',
    'Fast power: square the base, halve the exponent, O(log e) steps.',
    'Modular arithmetic keeps numbers small; reduce after every + and ×; fix negatives with + m.',
    'Division under a prime modulus = multiply by b^(p−2) (Fermat).',
    'nCr: Pascal for small n, factorial + inverse factorial tables for big n with prime modulus.',
    'Trailing zeros of n! = n/5 + n/25 + n/125 + ...'
  ],
  interview: [
    { q: 'Check whether a 64-bit number is prime, quickly.', a: '<p>Trial division to √n is too slow for 10¹⁸. Use Miller–Rabin with the deterministic base set for 64-bit integers (2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37). Each base costs one modular exponentiation; multiply with UInt128 or a mul-mod routine to avoid overflow.</p>' },
    { q: 'Why is 10⁹+7 used so often?', a: '<p>It is prime, so every non-zero value has a modular inverse (Fermat works). It is below 2³¹ so it fits an int, and the product of two residues fits in a long.</p>' },
    { q: 'Compute C(n, r) mod p for a million queries with n up to 10⁶.', a: '<p>Precompute fact[i] and invFact[i] for i up to 10⁶ in O(n): fact by multiplication, invFact[n] by Fermat, then invFact[i−1] = invFact[i] × i. Each query is fact[n] × invFact[r] × invFact[n−r] mod p in O(1).</p>' },
    { q: 'Find the GCD of an array of numbers.', a: '<p>GCD is associative: fold Euclid across the array, gcd(gcd(a₀, a₁), a₂)... Stop early if the running GCD becomes 1. O(n log max).</p>' }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-bits — Bit Manipulation                                          */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-bits'] = {
  hook: `Every int in your program is 32 light switches. Learn to flip them directly and some problems that look impossible in O(n) space collapse to O(1).`,
  intro: `<p>A computer stores every number as <span class="term">bits</span>: a row of 0s and 1s. An <code>int</code> in C# is 32 bits, a <code>long</code> is 64. The number 5 is 101 in binary (4 + 0 + 1). <span class="term">Bit manipulation</span> means working on those bits directly with a handful of operators: AND, OR, XOR, NOT and shifts.</p>
<p>Why bother? Three reasons. Some operations are much faster (multiplying by 8 is a shift by 3). Some problems have elegant one-line answers (is n a power of two? find the number that appears once?). And a small set of flags or a subset of up to 64 items fits in one number, which saves memory and makes loops simple.</p>
<p>This lesson gives you the operators, the standard tricks (check, set, clear, toggle a bit; count set bits; isolate the lowest set bit), and the classic problems that use them.</p>`,
  realLife: {
    title: 'The light switch panel',
    body: `<p>A theatre has a panel of 32 light switches. Instead of writing "switch 3 on, switch 7 on, switch 12 on" on paper, the technician records the whole panel as one 32-bit number. "Is switch 7 on?" is one AND. "Turn on switch 12" is one OR. "Flip switch 3" is one XOR. "Turn everything off except the lowest switch that is on" is <code>n &amp; -n</code>, and it works because of how negative numbers are stored.</p>
<p>And XOR has a magic property: flipping a switch twice returns it to where it started. If you XOR a list of numbers where every number appears twice except one, the pairs cancel out and only the lonely number survives. No dictionary, no sorting, O(1) memory.</p>
<p><strong>Where companies use this:</strong> Linux file permissions (rwx) are three bits. Feature flags in big apps are bitmasks. Network masks (255.255.255.0) are bit patterns. Databases store nullable column maps as bitmaps. Chess engines represent the whole board as 64-bit numbers ("bitboards"). Compression and encryption are bit shuffling all the way down.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The six operators</h4>
<table><thead><tr><th>Operator</th><th>C#</th><th>Meaning</th><th>Example (8-bit)</th></tr></thead><tbody>
<tr><td>AND</td><td><code>a &amp; b</code></td><td>1 only where both are 1</td><td>0110 &amp; 0011 = 0010</td></tr>
<tr><td>OR</td><td><code>a | b</code></td><td>1 where either is 1</td><td>0110 | 0011 = 0111</td></tr>
<tr><td>XOR</td><td><code>a ^ b</code></td><td>1 where they differ</td><td>0110 ^ 0011 = 0101</td></tr>
<tr><td>NOT</td><td><code>~a</code></td><td>flip every bit</td><td>~0110 = 1001</td></tr>
<tr><td>Left shift</td><td><code>a &lt;&lt; k</code></td><td>move bits left, fill with 0 (× 2ᵏ)</td><td>0011 &lt;&lt; 2 = 1100</td></tr>
<tr><td>Right shift</td><td><code>a &gt;&gt; k</code></td><td>move bits right (÷ 2ᵏ, rounds down)</td><td>1100 &gt;&gt; 2 = 0011</td></tr>
</tbody></table>
<h4>The five basic moves on bit i</h4>
<ul>
<li><strong>Check:</strong> <code>(n &gt;&gt; i) &amp; 1</code> or <code>(n &amp; (1 &lt;&lt; i)) != 0</code></li>
<li><strong>Set (turn on):</strong> <code>n | (1 &lt;&lt; i)</code></li>
<li><strong>Clear (turn off):</strong> <code>n &amp; ~(1 &lt;&lt; i)</code></li>
<li><strong>Toggle (flip):</strong> <code>n ^ (1 &lt;&lt; i)</code></li>
<li><strong>Mask:</strong> <code>1 &lt;&lt; i</code> is a number with only bit i on. Build masks, then combine them.</li>
</ul>
<h4>XOR, the star of the show</h4>
<p>Three facts make XOR special: <code>a ^ a = 0</code>, <code>a ^ 0 = a</code>, and it does not care about order. So XOR-ing every number in [2, 3, 2, 4, 3] gives 2^2 cancels, 3^3 cancels, 4 remains. The "single number" problem is one loop with no extra memory.</p>
<h4>Even/odd and powers of two</h4>
<p>n is odd if <code>(n &amp; 1) == 1</code>. n is a power of two if <code>n &gt; 0 &amp;&amp; (n &amp; (n − 1)) == 0</code>. Why? A power of two has exactly one bit set, like 1000. Subtracting 1 gives 0111. AND-ing them gives 0. Any other positive number keeps at least one shared bit.</p>
<h4>Counting set bits</h4>
<p>Loop through the bits and count ones: 32 steps. Better: <code>n &amp; (n − 1)</code> clears the lowest set bit. Repeat until n is 0; the number of repeats equals the number of 1s. This is <span class="term">Kernighan's trick</span>, and it runs only as many steps as there are 1s. In .NET, <code>BitOperations.PopCount</code> does it in one CPU instruction.</p>
<div class="callout tip">Write numbers in binary on paper when you learn this. 13 = 1101. 13 − 1 = 1100. 13 &amp; 12 = 1100 = 12. One bit gone. Seeing it once beats reading it ten times.</div>` },
    { name: 'Intermediate', body: `<h4>Negative numbers: two's complement</h4>
<p>C# stores negatives in <span class="term">two's complement</span>: −n is <code>~n + 1</code>. So the top bit is the sign bit, and <code>-1</code> is all 1s (0xFFFFFFFF). This gives a useful identity: <code>n &amp; -n</code> isolates the lowest set bit. For 12 (1100), −12 is 0100 in the low bits, and 12 &amp; −12 = 0100 = 4. Fenwick trees are built on this one trick.</p>
<h4>Shifts: signed vs unsigned</h4>
<p><code>&gt;&gt;</code> on a signed <code>int</code> is an <span class="term">arithmetic shift</span>: it copies the sign bit in from the left, so −8 &gt;&gt; 1 is −4. C# 11 added <code>&gt;&gt;&gt;</code> for a logical shift that fills with zeros. Shifting by 32 or more on an int is undefined-looking: C# only uses the low 5 bits of the shift count, so <code>1 &lt;&lt; 32</code> equals <code>1 &lt;&lt; 0</code> = 1. For 64-bit use <code>1L &lt;&lt; k</code>.</p>
<h4>Subsets with a bitmask</h4>
<p>A set of n items (n ≤ 20 or so) can be represented by an n-bit number: bit i on means item i is in the subset. Every subset is a number from 0 to 2ⁿ − 1, so "try every subset" is one for-loop. To iterate the items of a mask, loop i from 0 to n−1 and check bit i. To iterate all sub-masks of a mask m: <code>for (s = m; s &gt; 0; s = (s − 1) &amp; m)</code>. This is the foundation of bitmask DP (Advanced DSA).</p>
<h4>Classic problems and their one-liners</h4>
<table><thead><tr><th>Problem</th><th>Trick</th></tr></thead><tbody>
<tr><td>Single number (others appear twice)</td><td>XOR everything</td></tr>
<tr><td>Two numbers appear once, others twice</td><td>XOR all → x^y; split by lowest set bit of x^y; XOR each group</td></tr>
<tr><td>Single number (others appear three times)</td><td>Count bits per position mod 3, or the ones/twos state machine</td></tr>
<tr><td>Missing number in 0..n</td><td>XOR all indices and all values</td></tr>
<tr><td>Is power of two</td><td>n &gt; 0 and (n &amp; (n−1)) == 0</td></tr>
<tr><td>Is power of four</td><td>Power of two and the set bit is at an even position: (n &amp; 0x55555555) != 0</td></tr>
<tr><td>Reverse the bits of an int</td><td>Swap halves, then quarters, then bytes, nibbles, pairs, singles (or a 32-step loop)</td></tr>
<tr><td>Swap two ints without a temp</td><td>a ^= b; b ^= a; a ^= b (see the warning)</td></tr>
<tr><td>Gray code</td><td>i ^ (i &gt;&gt; 1)</td></tr>
<tr><td>Add without +</td><td>sum = a ^ b, carry = (a &amp; b) &lt;&lt; 1, repeat until carry is 0</td></tr>
</tbody></table>
<div class="callout warn">XOR swap looks clever but is a trap: if a and b are the same variable (or the same array slot, like swapping a[i] with a[i]), the first XOR zeroes it and both become 0. Use a tuple swap <code>(a, b) = (b, a)</code>; the JIT makes it just as fast.</div>
<h4>Bit flags in real C# code</h4>
<p>Mark an enum with <code>[Flags]</code> and give members power-of-two values: Read = 1, Write = 2, Execute = 4. Combine with <code>|</code>, test with <code>HasFlag</code> or <code>&amp;</code>. This is how file permissions, HTTP method sets and feature toggles are stored compactly.</p>` },
    { name: 'Expert', body: `<h4>Hardware instructions behind the tricks</h4>
<p>Modern CPUs have single instructions for the common bit questions, and .NET exposes them through <code>System.Numerics.BitOperations</code>: <code>PopCount</code> (count 1s), <code>LeadingZeroCount</code>, <code>TrailingZeroCount</code> (position of the lowest set bit), <code>Log2</code>, <code>RotateLeft/RotateRight</code>, <code>IsPow2</code>. They JIT to one instruction (POPCNT, LZCNT, TZCNT) when the CPU supports it and fall back to a table otherwise. Prefer them over hand-written loops in production; know the loops for interviews.</p>
<h4>Bitsets and the 64× speed-up</h4>
<p>A <code>BitArray</code> or a <code>ulong[]</code> stores one bit per element. AND/OR/XOR of two sets of a million elements becomes 15,625 64-bit operations. This turns some O(n²) algorithms (reachability, certain DP transitions, sieve) into O(n²/64), which is a real and common trick in competitive programming and in database engines (bitmap indexes).</p>
<h4>Bit-level parallelism in SIMD</h4>
<p><code>System.Runtime.Intrinsics</code> lets you AND or XOR 256 bits at a time with AVX2. Combined with bitsets, that is 4× again. This is how high-performance text search (finding bytes in a buffer), JSON parsing and bloom filters reach gigabytes per second.</p>
<h4>Hash mixing and avalanche</h4>
<p>Good hash functions are XOR-shift-multiply chains (MurmurHash, xxHash, SplitMix64). The goal is <span class="term">avalanche</span>: flipping one input bit should flip about half the output bits. Knowing shifts and XOR lets you read and judge these functions, and lets you spot a bad home-grown hash (such as summing characters) that collides constantly.</p>
<h4>Overflow and undefined-looking behaviour in C#</h4>
<ul>
<li>Arithmetic overflow wraps silently in unchecked context (the default). <code>int.MaxValue + 1</code> is <code>int.MinValue</code>.</li>
<li>Shift counts are masked: <code>x &lt;&lt; 33</code> on an int is <code>x &lt;&lt; 1</code>. Guard shift amounts.</li>
<li><code>~0</code> is −1 for int, but <code>~0u</code> is 4294967295 for uint. Pick signed or unsigned deliberately for masks.</li>
<li><code>Math.Abs(int.MinValue)</code> throws: there is no positive 2³¹ in a 32-bit int.</li>
</ul>
<h4>Where bits meet the rest of the course</h4>
<p>Fenwick trees use <code>i &amp; -i</code>. Bitmask DP (travelling salesman, assignment problems) uses subset enumeration. Bloom filters and HyperLogLog (System Design) are bit arrays with hashing. Consistent hashing and sharding use modulo by powers of two as a bitmask. Even <code>HasFlag</code> on a <code>[Flags]</code> enum is an AND under the hood.</p>` }
  ],
  flow: {
    title: 'Kernighan\'s trick: counting set bits in 13',
    steps: [
      { title: '13 in binary', desc: '13 = 1101. We expect the answer 3. The loop will run exactly three times, once per 1-bit, not 32 times.' },
      { title: 'n − 1 flips the tail', desc: 'Subtracting 1 turns the lowest 1 into 0 and every 0 below it into 1: 1101 − 1 = 1100.' },
      { title: 'AND clears the lowest set bit', desc: '1101 & 1100 = 1100 = 12. The lowest 1 is gone, everything above it is untouched. Count = 1.' },
      { title: 'Repeat', desc: '12 = 1100. 12 − 1 = 1011. 1100 & 1011 = 1000 = 8. Count = 2.' },
      { title: 'Repeat again', desc: '8 = 1000. 8 − 1 = 0111. 1000 & 0111 = 0. Count = 3.' },
      { title: 'Stop at zero', desc: 'n is 0, so no bits remain. Answer: 3. Work done is proportional to the number of 1s, which is the best possible for a software loop.' },
      { title: 'In production', desc: 'Call BitOperations.PopCount(n): one CPU instruction. Know the loop for interviews, use the intrinsic in real code.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Basic moves: check, set, clear, toggle, count, lowest bit, power of two', code: `using System;
using System.Numerics;

public static class BitBasics
{
    public static bool IsSet(int n, int i)   => ((n >> i) & 1) == 1;
    public static int  Set(int n, int i)     => n | (1 << i);
    public static int  Clear(int n, int i)   => n & ~(1 << i);
    public static int  Toggle(int n, int i)  => n ^ (1 << i);

    public static bool IsOdd(int n)          => (n & 1) == 1;
    public static bool IsPowerOfTwo(long n)  => n > 0 && (n & (n - 1)) == 0;
    public static long LowestSetBit(long n)  => n & -n;                // e.g. 12 (1100) -> 4 (0100)
    public static int  LowestSetBitIndex(int n) => BitOperations.TrailingZeroCount(n);

    // Kernighan: each step removes the lowest 1-bit. Runs once per set bit.
    public static int CountSetBits(uint n)
    {
        int count = 0;
        while (n != 0) { n &= n - 1; count++; }
        return count;
    }

    // Production version: one CPU instruction where supported.
    public static int CountSetBitsFast(uint n) => BitOperations.PopCount(n);

    // Reverse the 32 bits of n. Swap halves, quarters, bytes, nibbles, pairs, singles.
    public static uint ReverseBits(uint n)
    {
        n = (n >> 16) | (n << 16);
        n = ((n & 0xFF00FF00u) >> 8) | ((n & 0x00FF00FFu) << 8);
        n = ((n & 0xF0F0F0F0u) >> 4) | ((n & 0x0F0F0F0Fu) << 4);
        n = ((n & 0xCCCCCCCCu) >> 2) | ((n & 0x33333333u) << 2);
        n = ((n & 0xAAAAAAAAu) >> 1) | ((n & 0x55555555u) << 1);
        return n;
    }

    // Add two ints using only bit operators: XOR gives the sum without carry, AND<<1 gives the carry.
    public static int AddWithoutPlus(int a, int b)
    {
        while (b != 0)
        {
            int carry = (a & b) << 1;
            a ^= b;
            b = carry;
        }
        return a;
    }

    public static string ToBinary(int n, int width = 8) => Convert.ToString(n, 2).PadLeft(width, '0');

    public static void Demo()
    {
        int n = 0b1101;                                   // 13
        Console.WriteLine(ToBinary(Set(n, 1)));           // 00001111
        Console.WriteLine(ToBinary(Clear(n, 0)));         // 00001100
        Console.WriteLine(ToBinary(Toggle(n, 3)));        // 00000101
        Console.WriteLine(CountSetBits(13) + " " + CountSetBitsFast(13));   // 3 3
        Console.WriteLine(IsPowerOfTwo(64) + " " + IsPowerOfTwo(96));       // True False
        Console.WriteLine(LowestSetBit(12) + " " + LowestSetBitIndex(12));  // 4 2
        Console.WriteLine(AddWithoutPlus(17, 25));        // 42
    }
}` },
    { lang: 'csharp', title: 'XOR problems: single number, two single numbers, missing number, triple-count', code: `using System;

public static class XorTricks
{
    // Every number appears twice except one. O(n) time, O(1) space.
    public static int SingleNumber(int[] a)
    {
        int x = 0;
        foreach (int v in a) x ^= v;            // pairs cancel, the lonely one survives
        return x;
    }

    // Numbers 0..n with exactly one missing. XOR of indices and values cancels all but the missing.
    public static int MissingNumber(int[] a)
    {
        int x = a.Length;                        // include n itself
        for (int i = 0; i < a.Length; i++) x ^= i ^ a[i];
        return x;
    }

    // Exactly two numbers appear once, the rest twice. Returns both.
    public static (int, int) TwoSingleNumbers(int[] a)
    {
        int xor = 0;
        foreach (int v in a) xor ^= v;           // = x ^ y, which is non-zero because x != y
        int diffBit = xor & -xor;                // a bit where x and y differ
        int x = 0, y = 0;
        foreach (int v in a)
        {
            if ((v & diffBit) != 0) x ^= v;      // group with that bit set
            else y ^= v;                         // group with that bit clear
        }
        return (x, y);                           // pairs fall into the same group and cancel
    }

    // Every number appears three times except one. Count bits per position modulo 3. O(32n).
    public static int SingleNumberTriples(int[] a)
    {
        int result = 0;
        for (int bit = 0; bit < 32; bit++)
        {
            int count = 0;
            foreach (int v in a) count += (v >> bit) & 1;
            if (count % 3 != 0) result |= 1 << bit;   // works for negatives too (bit 31 is the sign)
        }
        return result;
    }

    // Swap with XOR. Shown for interviews; prefer (a, b) = (b, a). Breaks if a and b alias.
    public static void XorSwap(ref int a, ref int b)
    {
        if (a == b) return;                      // guard: same value is fine, same variable is not
        a ^= b; b ^= a; a ^= b;
    }

    public static void Demo()
    {
        Console.WriteLine(SingleNumber(new[] { 4, 1, 2, 1, 2 }));            // 4
        Console.WriteLine(MissingNumber(new[] { 3, 0, 1 }));                 // 2
        Console.WriteLine(TwoSingleNumbers(new[] { 1, 2, 1, 3, 2, 5 }));     // (5, 3) or (3, 5)
        Console.WriteLine(SingleNumberTriples(new[] { 2, 2, 3, 2 }));        // 3
    }
}` },
    { lang: 'csharp', title: 'Subsets by bitmask, sub-mask enumeration, [Flags] enums', code: `using System;
using System.Collections.Generic;

[Flags]
public enum Permission
{
    None = 0,
    Read = 1,          // 001
    Write = 2,         // 010
    Execute = 4,       // 100
    ReadWrite = Read | Write
}

public static class Masks
{
    // All subsets of items. 2^n subsets, each built in O(n). n should be small (<= 20).
    public static List<List<T>> AllSubsets<T>(T[] items)
    {
        int n = items.Length;
        var result = new List<List<T>>();
        for (int mask = 0; mask < (1 << n); mask++)
        {
            var subset = new List<T>();
            for (int i = 0; i < n; i++)
                if ((mask & (1 << i)) != 0) subset.Add(items[i]);   // bit i on -> item i chosen
            result.Add(subset);
        }
        return result;
    }

    // Visit every sub-mask of mask (including mask itself, excluding 0). Classic for bitmask DP.
    public static IEnumerable<int> SubMasks(int mask)
    {
        for (int s = mask; s > 0; s = (s - 1) & mask)
            yield return s;
    }

    // Subset sum with bitmask brute force: does any subset add to target? O(2^n * n).
    public static bool AnySubsetSums(int[] a, int target)
    {
        for (int mask = 0; mask < (1 << a.Length); mask++)
        {
            int sum = 0;
            for (int i = 0; i < a.Length; i++)
                if ((mask >> i & 1) == 1) sum += a[i];
            if (sum == target) return true;
        }
        return false;
    }

    public static void Demo()
    {
        Console.WriteLine(AllSubsets(new[] { 'a', 'b', 'c' }).Count);   // 8
        Console.WriteLine(string.Join(",", SubMasks(0b1010)));         // 10,8,2
        Console.WriteLine(AnySubsetSums(new[] { 3, 34, 4, 12, 5, 2 }, 9));   // True (4+5)

        var p = Permission.Read | Permission.Execute;                  // 101 = 5
        Console.WriteLine(p);                                          // Read, Execute
        Console.WriteLine((p & Permission.Write) != 0);                // False
        p |= Permission.Write;                                         // grant
        p &= ~Permission.Read;                                         // revoke
        Console.WriteLine(p);                                          // Write, Execute
    }
}` }
  ],
  pitfalls: [
    'Shifting an <code>int</code> by 32 or more. C# masks the shift count, so <code>1 &lt;&lt; 32</code> is 1, not 0. Use <code>1L</code> for 64-bit masks and guard counts.',
    'Using <code>&gt;&gt;</code> on negative numbers and expecting zeros to come in. Arithmetic shift copies the sign bit; use <code>&gt;&gt;&gt;</code> (C# 11) or <code>uint</code>.',
    'XOR swap on the same variable or array slot (<code>a[i]</code> with <code>a[i]</code>) sets it to 0. Use a tuple swap.',
    'Forgetting <code>n &gt; 0</code> in the power-of-two test. Zero passes <code>(n &amp; (n−1)) == 0</code> but is not a power of two.',
    'Enumerating 2ⁿ subsets with n = 30: a billion iterations. Bitmask brute force is for n up to about 20–25.',
    'Mixing signed and unsigned masks: <code>~0</code> is −1 (int) but <code>~0u</code> is 4294967295. Pick one type for masks.'
  ],
  quiz: [
    { q: 'What does <code>n &amp; (n - 1)</code> do?', options: ['Doubles n', 'Clears the lowest set bit', 'Sets the lowest clear bit', 'Checks if n is odd'], answer: 1, why: 'Subtracting 1 flips the lowest 1 and all zeros below it; AND-ing keeps everything above that bit and clears it.' },
    { q: 'XOR of [5, 1, 5, 3, 1] is:', options: ['5', '1', '3', '0'], answer: 2, why: '5^5 = 0 and 1^1 = 0, leaving 3. XOR cancels pairs regardless of order.' },
    { q: 'Which expression isolates the lowest set bit of n?', options: ['n &amp; (n - 1)', 'n | -n', 'n &amp; -n', 'n ^ (n &gt;&gt; 1)'], answer: 2, why: 'In two\'s complement, -n flips all bits above the lowest 1 and keeps that bit, so AND leaves only that bit.' },
    { q: 'How many subsets does a set of n items have, and how do you loop over them?', options: ['n, loop i = 0..n', 'n², nested loops', '2ⁿ, loop mask = 0..2ⁿ−1', 'n!, recursion only'], answer: 2, why: 'Each item is in or out (one bit), so n bits give 2ⁿ masks; each mask is one subset.' },
    { q: 'In C#, what is <code>1 &lt;&lt; 32</code> for an int?', options: ['0', '1', '2³²', 'A compile error'], answer: 1, why: 'Shift counts on int use only the low 5 bits, so 32 behaves like 0 and the value is 1. Use long for wider shifts.' },
    { q: 'Why does <code>(n &amp; (n - 1)) == 0</code> alone not prove n is a power of two?', options: ['It fails for odd numbers', 'Zero also satisfies it', 'It only works for long', 'It fails for 1'], answer: 1, why: '0 & -1 is 0, so you need the extra n > 0 check.' }
  ],
  takeaways: [
    'Check/set/clear/toggle bit i: shift a 1 to position i and use &, |, & ~, ^.',
    'XOR cancels pairs: single-number and missing-number problems in O(1) space.',
    'n & (n−1) clears the lowest 1; n & −n isolates it; both are O(1).',
    'Power of two: n > 0 and (n & (n−1)) == 0.',
    'A subset of ≤ 20 items is a bitmask; loop masks from 0 to 2ⁿ−1.',
    'Use BitOperations (PopCount, TrailingZeroCount) in real code; know the loops for interviews.'
  ],
  interview: [
    { q: 'Find the two numbers that appear once when every other number appears twice.', a: '<p>XOR everything to get x^y. It is non-zero, so pick any set bit (the lowest: xor & -xor). That bit differs between x and y. Split the array into two groups by that bit and XOR each group; the pairs land in the same group and cancel, leaving x in one and y in the other. O(n) time, O(1) space.</p>' },
    { q: 'Count the bits needed to convert integer a to b.', a: '<p>XOR a and b: the 1s mark positions that differ. Count them with Kernighan\'s loop or PopCount. O(number of differing bits).</p>' },
    { q: 'Why do hash tables often use power-of-two sizes?', a: '<p>Because index = hash & (size − 1) replaces a slow modulo with a fast AND. The cost is that low bits of the hash must be well mixed, so good tables apply an extra mixing step first.</p>' },
    { q: 'Explain two\'s complement in one minute.', a: '<p>To negate n, flip every bit and add 1. The top bit then acts as a sign. Addition works the same for positive and negative numbers with no special circuitry, there is a single zero, and the range is −2³¹ to 2³¹−1 for 32 bits. That asymmetry is why Math.Abs(int.MinValue) throws.</p>' }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-binary-search — Binary Search                                    */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-binary-search'] = {
  hook: `Binary search is not "find a number in a sorted array". It is "whenever the answer is yes-yes-yes-no-no-no, you only need about 30 questions". Learn to see that shape and half the hard problems become easy.`,
  intro: `<p><span class="term">Binary search</span> finds a target in a sorted collection by repeatedly cutting the search space in half. Look at the middle. Too small? Throw away the left half. Too big? Throw away the right half. A million items take only 20 steps, a billion take 30. That is <span class="term">O(log n)</span>.</p>
<p>Most people learn it as "find x in a sorted array" and stop there. The real power is the general form: any question where the answers, laid out in order, look like <em>false, false, false, true, true, true</em> (or the reverse) can be answered by binary search. "What is the smallest speed at which I can finish eating all the bananas in 8 hours?" is not about arrays at all, yet it is a binary search.</p>
<p>This lesson gives you one template that never goes wrong, the standard variants (first and last occurrence, lower and upper bound, rotated arrays), and <span class="term">binary search on the answer</span>, which is the pattern interviewers love most.</p>`,
  realLife: {
    title: 'Guessing a number, and finding the broken build',
    body: `<p>I am thinking of a number between 1 and 1,000. You ask "is it bigger than 500?" and I answer yes or no. Each question halves the possibilities, so you need at most 10 questions. Binary search is just that game played by a computer.</p>
<p>A more useful version: your test suite passed at commit 1 and fails at commit 1,000. Which commit broke it? You do not check 1,000 commits. You check commit 500. Still passing? The bug is after 500. Check 750, and so on. Ten checks instead of a thousand. Git has this built in as <code>git bisect</code>.</p>
<p><strong>Where companies use this:</strong> Databases use binary search inside B-tree pages to find keys. Autoscaling systems binary-search for "the smallest number of servers that keeps latency under 200 ms". Video players binary-search for the right keyframe when you drag the seek bar. Package managers find the first version that satisfies a constraint. <code>Array.BinarySearch</code> and <code>List.BinarySearch</code> exist in .NET for the plain version.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The basic loop</h4>
<p>Keep two indices, <code>low</code> and <code>high</code>, that mark the part of the array still in play. While low ≤ high: compute <code>mid</code>, compare <code>a[mid]</code> with the target, and move one of the boundaries. If a[mid] equals the target, return mid. If a[mid] is smaller, the target must be to the right: <code>low = mid + 1</code>. If larger: <code>high = mid − 1</code>. If the loop ends, the target is not there.</p>
<h4>The two rules that prevent bugs</h4>
<ul>
<li><strong>Compute mid as <code>low + (high − low) / 2</code></strong>, not <code>(low + high) / 2</code>. When low and high are both near 2 billion, their sum overflows an int and goes negative. The subtraction form cannot overflow.</li>
<li><strong>Always move past mid.</strong> <code>low = mid + 1</code> or <code>high = mid − 1</code>. If you write <code>low = mid</code> the loop can get stuck forever when low and mid are equal.</li>
</ul>
<h4>Why it is O(log n)</h4>
<p>Each step cuts the range in half. Starting from n, after k steps the range is n / 2ᵏ. It reaches 1 when k = log₂ n. For n = 1,000,000 that is about 20 steps; for a billion, 30. Compare with a linear scan: a billion steps.</p>
<h4>When can you use it?</h4>
<p>The data must be <span class="term">sorted</span>, or more generally <span class="term">monotonic</span>: as you move right, the answer to your question only changes once (false → true or true → false). If the array is unsorted and you want one lookup, sorting first costs O(n log n), which is more than a plain O(n) scan. Binary search pays off when you search many times, or when the "array" is implicit and huge (like all possible speeds from 1 to 10⁹).</p>
<h4>Variants you will meet</h4>
<table><thead><tr><th>Question</th><th>What changes</th></tr></thead><tbody>
<tr><td>Does x exist?</td><td>Return on equality</td></tr>
<tr><td>First occurrence of x</td><td>On equality, remember mid and keep searching left</td></tr>
<tr><td>Last occurrence of x</td><td>On equality, remember mid and keep searching right</td></tr>
<tr><td>Lower bound (first ≥ x)</td><td>Find the first index where a[i] ≥ x</td></tr>
<tr><td>Upper bound (first &gt; x)</td><td>Find the first index where a[i] &gt; x</td></tr>
<tr><td>Count of x</td><td>upper bound − lower bound</td></tr>
<tr><td>Square root of n (integer)</td><td>Search 0..n for the largest r with r·r ≤ n</td></tr>
</tbody></table>
<div class="callout tip">Draw a small array of 5 numbers and trace the loop by hand with a target that is present, a target that is absent, a target smaller than everything, and one larger than everything. Ten minutes of tracing saves hours of debugging.</div>` },
    { name: 'Intermediate', body: `<h4>The "first true" template</h4>
<p>Instead of searching for a value, search for the <em>first index where a condition becomes true</em>. The condition must be monotonic: false for a while, then true forever. The template:</p>
<ol>
<li><code>low = 0, high = n</code> (high is one past the end, meaning "no index satisfies it").</li>
<li>While low &lt; high: <code>mid = low + (high − low) / 2</code>. If <code>check(mid)</code> is true, the answer is mid or earlier: <code>high = mid</code>. Else it is after mid: <code>low = mid + 1</code>.</li>
<li>Return low. If low == n, no index satisfies the condition.</li>
</ol>
<p>This single template gives you lower bound (check: a[mid] ≥ x), upper bound (check: a[mid] &gt; x), first occurrence (lower bound, then verify a[low] == x), and almost every "binary search on the answer" problem. It cannot get stuck because high = mid always shrinks the range (low &lt; mid + 1 ≤ high) and low = mid + 1 moves forward.</p>
<h4>Binary search on the answer</h4>
<p>Some problems ask for the minimum (or maximum) value of something that satisfies a constraint, and checking a candidate value is easy. Then: binary search over the candidate values, and use the checker as the condition.</p>
<ul>
<li><strong>Koko eating bananas:</strong> speed k from 1 to max pile. check(k) = "can she finish in h hours at speed k?" = sum of ceil(pile / k) ≤ h. Monotonic: a faster speed never hurts. Find the first k where check is true.</li>
<li><strong>Allocate books / split array:</strong> the answer is "the maximum pages one student gets". check(limit) = "can we split into ≤ m groups so no group exceeds limit?" Greedy scan: start a new group when adding the next book would exceed the limit. Find the smallest limit that works.</li>
<li><strong>Capacity to ship packages in D days, minimum days to make bouquets, aggressive cows (maximise minimum distance):</strong> same shape, different checker.</li>
</ul>
<p>The checker is usually O(n), so the total is O(n log(range)). Say that out loud in an interview.</p>
<h4>Search in a rotated sorted array</h4>
<p>[4,5,6,7,0,1,2] is sorted then rotated. At any mid, at least one half is properly sorted. Check which half (compare a[low] with a[mid]). If the target lies inside the sorted half's range, search there; otherwise search the other half. Still O(log n). With duplicates, the comparison can be ambiguous (a[low] == a[mid] == a[high]); shrink both ends by one in that case, which makes the worst case O(n).</p>
<h4>Finding the minimum in a rotated array</h4>
<p>Compare a[mid] with a[high]. If a[mid] &gt; a[high], the minimum is to the right (low = mid + 1). Otherwise it is at mid or to the left (high = mid). The loop ends with low at the minimum.</p>
<h4>Integer square root without overflow</h4>
<p>Search r in [0, n]. The condition "r·r ≤ n" must be computed in <code>long</code>, or as <code>r ≤ n / r</code> to stay in int. Want the largest true, not the first true? Either search for the first r where r·r &gt; n and subtract 1, or flip the template.</p>
<div class="callout warn">Decide what low and high mean before writing the loop. "high is inclusive" and "high is exclusive" lead to different conditions (≤ vs &lt;) and different updates (mid − 1 vs mid). Mixing them is the number one binary search bug.</div>` },
    { name: 'Expert', body: `<h4>Floating-point binary search</h4>
<p>When the answer is a real number (the square root of 2, the time at which two cars meet), you cannot stop on equality. Either run a fixed number of iterations (100 iterations of halving gives precision far beyond a double's 53 bits) or stop when high − low is below an epsilon. Prefer the fixed count: epsilon comparisons misbehave with very large or very small magnitudes.</p>
<h4>Beyond O(log n): interpolation and exponential search</h4>
<p><span class="term">Interpolation search</span> guesses where the target should be based on its value, like opening a dictionary near the front for "apple". On uniformly distributed data it averages O(log log n), but on skewed data it degrades to O(n). <span class="term">Exponential (galloping) search</span> is for unbounded or very large ranges: probe at 1, 2, 4, 8... until you overshoot, then binary search in the last interval. It is O(log i) where i is the target's position, which matters when the target is near the start. Timsort and merge routines use galloping.</p>
<h4>Binary search in real .NET</h4>
<p><code>Array.BinarySearch</code> returns the index if found, otherwise the bitwise complement (<code>~index</code>) of the insertion point: a negative number you can flip to get where the element would go. <code>List&lt;T&gt;.BinarySearch</code> is the same. <code>SortedList</code> keeps its keys in a sorted array and binary-searches it for you; <code>SortedSet</code> and <code>SortedDictionary</code> use balanced trees instead; <code>Span&lt;T&gt;.BinarySearch</code> gives the allocation-free form. For strings, pass an ordinal comparer, or the sort order and the search order may disagree and the search silently fails.</p>
<h4>Cache behaviour and branchless search</h4>
<p>A binary search over a large array touches memory in a jumpy pattern: the first few probes are cache misses. For very hot paths, libraries use an Eytzinger layout (store the array in BFS order of the implicit search tree) so each level's probe lands near the previous one, and write the loop without branches (compute the next offset arithmetically) so the CPU does not mispredict. This can be 2–4× faster than the textbook loop on big arrays. You will not write this in interviews, but you should know it exists.</p>
<h4>Parallel and 2D forms</h4>
<ul>
<li><strong>Median of two sorted arrays in O(log(min(n, m))):</strong> binary search on how many elements to take from the first array so that the left halves of both combined are all ≤ the right halves.</li>
<li><strong>Search a row-and-column sorted matrix:</strong> start top-right and step left or down: O(rows + cols). Or treat a fully sorted matrix as a flat array and binary search in O(log(rows × cols)).</li>
<li><strong>Peak element:</strong> move toward the larger neighbour; a peak must exist on that side. O(log n).</li>
<li><strong>Ternary search</strong> finds the maximum of a unimodal (rise then fall) function by comparing two inner points. Binary search on the sign of the slope does the same with fewer evaluations.</li>
</ul>
<h4>What interviewers listen for</h4>
<p>"The predicate is monotonic, so binary search applies." "I will search the answer space from 1 to max, with an O(n) checker, so O(n log max)." "I use low + (high − low) / 2 to avoid overflow." "The invariant is: everything left of low is false, everything from high onward is true." Those four sentences, plus a clean loop, are a full-marks answer.</p>` }
  ],
  flow: {
    title: 'Binary search on the answer: Koko eating bananas',
    steps: [
      { title: 'Read the question as a predicate', desc: 'Piles [3, 6, 7, 11], 8 hours. "Can Koko finish at speed k?" is false for small k and true for large k. That false-then-true shape means binary search.' },
      { title: 'Set the answer range', desc: 'The slowest useful speed is 1. The fastest useful speed is the biggest pile (11): any faster changes nothing. low = 1, high = 11.' },
      { title: 'Write the checker', desc: 'hours(k) = sum of ceil(pile / k). At k = 6: 1 + 1 + 2 + 2 = 6 hours ≤ 8, so true. The checker is O(n).' },
      { title: 'Probe the middle', desc: 'mid = 6. check(6) is true, so the answer is 6 or smaller. high = 6.' },
      { title: 'Probe again', desc: 'low = 1, high = 6, mid = 3. hours(3) = 1 + 2 + 3 + 4 = 10 > 8, false. The answer is bigger: low = 4.' },
      { title: 'Narrow to one value', desc: 'mid = 5: hours = 1 + 2 + 2 + 3 = 8, true, high = 5. mid = 4: hours = 1 + 2 + 2 + 3 = 8, true, high = 4. low == high == 4. Answer: speed 4.' },
      { title: 'State the cost', desc: 'log₂(11) ≈ 4 probes, each an O(n) checker: O(n log maxPile). For piles up to 10⁹ that is about 30 probes, not a billion.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Classic search, first/last occurrence, lower/upper bound, count', code: `using System;

public static class BinarySearchBasics
{
    // Returns an index of target, or -1. O(log n).
    public static int Search(int[] a, int target)
    {
        int low = 0, high = a.Length - 1;             // inclusive range
        while (low <= high)
        {
            int mid = low + (high - low) / 2;         // never overflows
            if (a[mid] == target) return mid;
            if (a[mid] < target) low = mid + 1;       // target is to the right
            else high = mid - 1;                      // target is to the left
        }
        return -1;
    }

    // "First index where check(i) is true", check must be false...false,true...true.
    // Returns n if no index satisfies it. The single template for everything below.
    public static int FirstTrue(int n, Func<int, bool> check)
    {
        int low = 0, high = n;                        // high is exclusive: "no answer yet"
        while (low < high)
        {
            int mid = low + (high - low) / 2;
            if (check(mid)) high = mid;               // answer is mid or earlier
            else low = mid + 1;                       // answer is after mid
        }
        return low;
    }

    // First index with a[i] >= x.
    public static int LowerBound(int[] a, int x) => FirstTrue(a.Length, i => a[i] >= x);

    // First index with a[i] > x.
    public static int UpperBound(int[] a, int x) => FirstTrue(a.Length, i => a[i] > x);

    public static int FirstOccurrence(int[] a, int x)
    {
        int i = LowerBound(a, x);
        return i < a.Length && a[i] == x ? i : -1;
    }

    public static int LastOccurrence(int[] a, int x)
    {
        int i = UpperBound(a, x) - 1;
        return i >= 0 && a[i] == x ? i : -1;
    }

    public static int Count(int[] a, int x) => UpperBound(a, x) - LowerBound(a, x);

    // Largest r with r*r <= n. Uses long to avoid overflow. O(log n).
    public static int IntSqrt(int n)
    {
        int top = Math.Min(n, 46340);                 // sqrt of any int is at most 46340; also stops n + 1 overflowing
        int firstTooBig = FirstTrue(top + 1, r => (long)r * r > n);   // search r in [0, top]
        return firstTooBig - 1;
    }

    public static void Demo()
    {
        int[] a = { 1, 2, 2, 2, 5, 7, 7, 9 };
        Console.WriteLine(Search(a, 5));                                   // 4
        Console.WriteLine(FirstOccurrence(a, 2) + " " + LastOccurrence(a, 2));   // 1 3
        Console.WriteLine(LowerBound(a, 6) + " " + UpperBound(a, 7));      // 5 7
        Console.WriteLine(Count(a, 7) + " " + Count(a, 4));                // 2 0
        Console.WriteLine(IntSqrt(2147395599));                            // 46339
        int idx = Array.BinarySearch(a, 6);                                // built-in: ~insertionPoint when absent
        Console.WriteLine(idx < 0 ? "insert at " + ~idx : "found at " + idx);   // insert at 5
    }
}` },
    { lang: 'csharp', title: 'Rotated sorted array: search a target and find the minimum', code: `using System;

public static class RotatedSearch
{
    // [4,5,6,7,0,1,2], target 0 -> 4. Distinct values. O(log n).
    public static int Search(int[] a, int target)
    {
        int low = 0, high = a.Length - 1;
        while (low <= high)
        {
            int mid = low + (high - low) / 2;
            if (a[mid] == target) return mid;

            if (a[low] <= a[mid])                          // left half [low..mid] is sorted
            {
                if (a[low] <= target && target < a[mid]) high = mid - 1;   // target inside sorted left half
                else low = mid + 1;
            }
            else                                           // right half [mid..high] is sorted
            {
                if (a[mid] < target && target <= a[high]) low = mid + 1;   // target inside sorted right half
                else high = mid - 1;
            }
        }
        return -1;
    }

    // With duplicates: when a[low] == a[mid] == a[high] we cannot tell which half is sorted.
    // Shrink both ends. Worst case O(n), average still O(log n).
    public static bool SearchWithDuplicates(int[] a, int target)
    {
        int low = 0, high = a.Length - 1;
        while (low <= high)
        {
            int mid = low + (high - low) / 2;
            if (a[mid] == target) return true;
            if (a[low] == a[mid] && a[mid] == a[high]) { low++; high--; continue; }
            if (a[low] <= a[mid])
            {
                if (a[low] <= target && target < a[mid]) high = mid - 1; else low = mid + 1;
            }
            else
            {
                if (a[mid] < target && target <= a[high]) low = mid + 1; else high = mid - 1;
            }
        }
        return false;
    }

    // Minimum of a rotated sorted array (distinct). Compare mid with high. O(log n).
    public static int FindMin(int[] a)
    {
        int low = 0, high = a.Length - 1;
        while (low < high)
        {
            int mid = low + (high - low) / 2;
            if (a[mid] > a[high]) low = mid + 1;           // the drop is to the right
            else high = mid;                               // minimum is at mid or to the left
        }
        return a[low];
    }

    // Peak element: any index whose value is larger than both neighbours. Move uphill. O(log n).
    public static int PeakIndex(int[] a)
    {
        int low = 0, high = a.Length - 1;
        while (low < high)
        {
            int mid = low + (high - low) / 2;
            if (a[mid] < a[mid + 1]) low = mid + 1;        // rising: a peak exists to the right
            else high = mid;                               // falling or flat top: peak at mid or left
        }
        return low;
    }

    public static void Demo()
    {
        int[] r = { 4, 5, 6, 7, 0, 1, 2 };
        Console.WriteLine(Search(r, 0) + " " + Search(r, 3));                  // 4 -1
        Console.WriteLine(FindMin(r));                                         // 0
        Console.WriteLine(SearchWithDuplicates(new[] { 2, 5, 6, 0, 0, 1, 2 }, 0));   // True
        Console.WriteLine(PeakIndex(new[] { 1, 2, 1, 3, 5, 6, 4 }));           // 5 (or 1)
    }
}` },
    { lang: 'csharp', title: 'Binary search on the answer: Koko bananas, allocate books, ship capacity', code: `using System;
using System.Linq;

public static class SearchOnAnswer
{
    // Generic: smallest value in [low, high] for which ok(value) is true. ok must be monotonic.
    static long SmallestTrue(long low, long high, Func<long, bool> ok)
    {
        while (low < high)
        {
            long mid = low + (high - low) / 2;
            if (ok(mid)) high = mid;
            else low = mid + 1;
        }
        return low;                                  // caller guarantees ok(high) is true
    }

    // Minimum eating speed to finish all piles within h hours. O(n log maxPile).
    public static long MinEatingSpeed(int[] piles, int h)
    {
        bool CanFinish(long k)
        {
            long hours = 0;
            foreach (int p in piles) hours += (p + k - 1) / k;     // ceil(p / k) without doubles
            return hours <= h;
        }
        return SmallestTrue(1, piles.Max(), CanFinish);
    }

    // Allocate books: split pages[] into at most m contiguous groups, minimise the largest group sum.
    // Same problem as "split array largest sum" and "ship packages within D days".
    public static long MinimiseMaxPages(int[] pages, int m)
    {
        bool CanSplit(long limit)                    // greedy: start a new group only when forced
        {
            int groups = 1;
            long current = 0;
            foreach (int p in pages)
            {
                if (current + p > limit) { groups++; current = 0; }
                current += p;
            }
            return groups <= m;
        }
        long low = pages.Max();                      // a group must hold at least the biggest book
        long high = pages.Sum(x => (long)x);         // one group holds everything
        return SmallestTrue(low, high, CanSplit);
    }

    // Aggressive cows: place c cows in stalls so the minimum distance between any two is as LARGE as possible.
    // Monotonic the other way: a smaller distance is always feasible if a larger one is. Find the largest true.
    public static int MaxMinDistance(int[] stalls, int c)
    {
        Array.Sort(stalls);
        bool CanPlace(long d)
        {
            int placed = 1; long last = stalls[0];
            foreach (int s in stalls)
                if (s - last >= d) { placed++; last = s; }
            return placed >= c;
        }
        // first distance that FAILS, minus one, is the largest that works
        long firstFail = SmallestTrue(1, (long)stalls[^1] - stalls[0] + 1, d => !CanPlace(d));
        return (int)(firstFail - 1);
    }

    public static void Demo()
    {
        Console.WriteLine(MinEatingSpeed(new[] { 3, 6, 7, 11 }, 8));               // 4
        Console.WriteLine(MinimiseMaxPages(new[] { 12, 34, 67, 90 }, 2));         // 113
        Console.WriteLine(MaxMinDistance(new[] { 1, 2, 4, 8, 9 }, 3));            // 3
    }
}` }
  ],
  pitfalls: [
    '<code>(low + high) / 2</code> overflows when both are large. Use <code>low + (high − low) / 2</code>.',
    '<code>low = mid</code> instead of <code>low = mid + 1</code> creates an infinite loop when the range has two elements.',
    'Mixing inclusive and exclusive <code>high</code>. Pick one convention and keep the loop condition and updates consistent.',
    'Binary searching an array that is not actually sorted, or sorting with one comparer and searching with another (culture vs ordinal strings).',
    'Binary search on the answer with a non-monotonic checker. If "true" can turn back into "false", the search is meaningless.',
    'Checker overflow: <code>mid * mid</code> or sums of piles must be computed in <code>long</code>.'
  ],
  quiz: [
    { q: 'How many steps does binary search need on a sorted array of one billion items?', options: ['About 1,000', 'About 30', 'About 1,000,000', 'Exactly 10'], answer: 1, why: 'Each step halves the range; log₂(10⁹) ≈ 30.' },
    { q: 'Why write <code>low + (high - low) / 2</code> instead of <code>(low + high) / 2</code>?', options: ['It is faster because subtraction is cheaper than addition', 'It avoids int overflow when low and high are large', 'It rounds mid up so the loop cannot get stuck', 'It handles negative indices correctly'], answer: 1, why: 'low + high can exceed int.MaxValue and wrap negative; the subtraction form never exceeds high.' },
    { q: 'In the "first true" template, after the loop ends with low == n, what does it mean?', options: ['The answer is stored at index n', 'No index satisfies the condition', 'The array must have been empty', 'An overflow happened when computing mid'], answer: 1, why: 'high starts at n meaning "no answer"; if it never moves below n, no index was ever true.' },
    { q: 'What makes "binary search on the answer" valid for Koko bananas?', options: ['The piles are sorted before the search starts', '"Can finish at speed k" is monotonic in k', 'There are never more than 30 piles to check', 'Speeds are whole numbers, so halving is exact'], answer: 1, why: 'If she can finish at speed k, she can at any faster speed. False...false, true...true means binary search applies.' },
    { q: 'For a rotated sorted array, how do you decide which half to search?', options: ['Always search the left half first, then the right', 'Compare the target with a[mid] only, like a plain binary search', 'Find the sorted half; check if the target is in its range', 'Sort the array first, then run a plain binary search'], answer: 2, why: 'At least one half is sorted at every mid; if the target is within that half\'s min..max, search there, else the other half.' },
    { q: '<code>Array.BinarySearch</code> returns a negative number. What is it?', options: ['Always −1, whatever the array holds', 'The bitwise complement of the insertion point', 'The number of comparisons it made, as a negative', 'The last index checked, with a minus sign'], answer: 1, why: 'Flip it with ~ to get the insertion point, which keeps the array sorted if you insert there.' }
  ],
  takeaways: [
    'Binary search needs a monotonic question: false...false, true...true.',
    'mid = low + (high − low) / 2; always move past mid; pick inclusive or exclusive high and stick to it.',
    'The "first true" template gives lower bound, upper bound, first/last occurrence and count.',
    'Binary search on the answer: search the value range, use an O(n) checker, cost O(n log range).',
    'Rotated arrays: one half is always sorted; use it to decide direction.',
    'Real .NET: Array.BinarySearch returns ~insertionPoint when absent; use ordinal comparers for strings.'
  ],
  interview: [
    { q: 'Find the median of two sorted arrays in O(log(min(n, m))).', a: '<p>Binary search on how many elements i to take from the shorter array A; then j = (n + m + 1) / 2 − i from B. The partition is correct when A[i−1] ≤ B[j] and B[j−1] ≤ A[i]. If A[i−1] &gt; B[j], take fewer from A; otherwise take more. The median is then the max of the left parts (and the min of the right parts for even total length).</p>' },
    { q: 'How would you find the first bad version among n versions with an isBad API?', a: '<p>isBad is monotonic (good...good, bad...bad). Apply the first-true template over 1..n with isBad as the check: O(log n) API calls. Mention that each call may be expensive, which is exactly why you do not scan linearly.</p>' },
    { q: 'When should you NOT use binary search on a sorted array?', a: '<p>When you search once and the data is not already sorted (sorting costs O(n log n) &gt; O(n) scan), when the array is tiny (a linear scan is faster due to branch prediction and cache), or when the data changes constantly and keeping it sorted is the real cost (use a tree or hash instead).</p>' },
    { q: 'Explain the invariant of your binary search loop.', a: '<p>For the first-true template: every index below low is known false, every index from high onward is known true (or high == n meaning none proven). Each iteration keeps that invariant and shrinks high − low, so it terminates with low == high at the boundary.</p>' }
  ]
};

/* ------------------------------------------------------------------ */
/* m2-two-pointers — Two Pointers & Sliding Window                     */
/* ------------------------------------------------------------------ */
window.CONTENT['m2-two-pointers'] = {
  hook: `A nested loop looks at every pair: n² work. Two pointers look at each element about twice: 2n work. The difference between "times out" and "accepted" is usually just this one idea.`,
  intro: `<p><span class="term">Two pointers</span> means walking through an array with two indices instead of one. Sometimes they start at opposite ends and move toward each other. Sometimes both start at the left and one runs ahead. Either way, each pointer only moves forward, so the total work is linear even though you are reasoning about pairs or ranges.</p>
<p>A <span class="term">sliding window</span> is the second form with a name: a left and a right pointer mark a contiguous range (the window). You grow it by moving right, shrink it by moving left, and keep some running information about what is inside (a sum, a count of characters, a max). Questions like "longest substring without repeating characters" or "smallest subarray with sum ≥ k" are sliding windows.</p>
<p>The patterns work because of <span class="term">monotonicity</span>: moving a pointer one way makes the answer only bigger or only smaller, so you never need to move it back. This lesson teaches you to spot that property and apply the right pointer pattern.</p>`,
  realLife: {
    title: 'Two shoppers and a moving spotlight',
    body: `<p>Two friends want to buy two items that together cost exactly 100. The shop displays prices sorted on one shelf. One friend starts at the cheapest end, the other at the most expensive. If the two prices add to more than 100, the expensive friend steps down one. If less, the cheap friend steps up one. They meet in the middle having looked at each item at most once. That is the opposite-ends pattern, and it never misses a valid pair because every skipped combination was provably too big or too small.</p>
<p>Now picture a spotlight sliding along a line of dancers. The light shows a stretch of them. A director asks: "what is the longest stretch where no two dancers wear the same colour?" You slide the right edge forward one dancer at a time. When a colour repeats, you slide the left edge forward until it does not. The spotlight only ever moves right. That is a sliding window.</p>
<p><strong>Where companies use this:</strong> Rate limiters count requests in the last 60 seconds with a sliding window. Network protocols (TCP) use a sliding window of unacknowledged packets. Log analysis finds "the busiest 5-minute span". Trading systems compute moving averages. Deduplicating sorted data uses the slow/fast pointer pattern.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Pattern 1: opposite ends</h4>
<p>Used when the array is <strong>sorted</strong> and you are looking for a pair with some property. Set <code>l = 0</code>, <code>r = n − 1</code>. Look at a[l] + a[r]. Too big? Only decreasing r can help, so r−−. Too small? l++. Equal? Found. Each step moves one pointer inward, so at most n steps. Classic uses: pair with target sum, is-palindrome, reverse in place, container with most water.</p>
<h4>Pattern 2: slow and fast (same direction)</h4>
<p>Both pointers start at the left. The fast one scans every element. The slow one marks "where the next kept element goes". Remove duplicates from a sorted array: fast walks, and whenever a[fast] differs from a[slow], copy it to slow+1. Move zeros to the end: slow marks the next non-zero slot. The array is rewritten in place in one pass.</p>
<h4>Pattern 3: sliding window, fixed size</h4>
<p>"Maximum sum of any k consecutive elements." Compute the sum of the first k. Then for each step, add the new right element and subtract the element that left on the left. Every window costs O(1) instead of O(k). Total O(n).</p>
<h4>Pattern 4: sliding window, variable size</h4>
<p>"Longest subarray / substring such that [some condition]." Grow the window by moving right one step. While the condition breaks, shrink from the left. Record the best window after every step. The trick is that the condition must get <em>easier</em> to satisfy when you shrink and <em>harder</em> when you grow (or the reverse). If that is true, each pointer only moves forward and the whole thing is O(n).</p>
<h4>How to recognise each pattern</h4>
<table><thead><tr><th>The question says...</th><th>Pattern</th></tr></thead><tbody>
<tr><td>sorted array, find a pair</td><td>opposite ends</td></tr>
<tr><td>in place, remove / move / partition</td><td>slow and fast</td></tr>
<tr><td>exactly k consecutive elements</td><td>fixed window</td></tr>
<tr><td>longest / shortest contiguous range with a condition</td><td>variable window</td></tr>
<tr><td>count subarrays with a condition</td><td>variable window + counting trick</td></tr>
<tr><td>three colours, sort in one pass</td><td>Dutch national flag (three pointers)</td></tr>
</tbody></table>
<div class="callout tip">The question says "contiguous" or "subarray" or "substring"? Think window. It says "subsequence" (not necessarily contiguous)? Windows do not apply; think DP or greedy.</div>` },
    { name: 'Intermediate', body: `<h4>The variable window template</h4>
<ol>
<li><code>left = 0</code>; create the state you need (a running sum, a count array, a dictionary of last positions).</li>
<li>For <code>right</code> from 0 to n−1: add a[right] to the state.</li>
<li>While the state is invalid: remove a[left] from the state, <code>left++</code>.</li>
<li>Now [left, right] is valid. Update the answer (length = right − left + 1).</li>
</ol>
<p>For "shortest valid window" flip steps 3 and 4: while the window is valid, record the answer then shrink. Longest = shrink until valid, then record. Shortest = record while valid, then shrink.</p>
<h4>Longest substring without repeating characters</h4>
<p>State: the last index of each character. When a[right] was last seen at or after left, jump left to lastIndex + 1 (no need to step one by one). Answer: max of right − left + 1. O(n) time, O(alphabet) space.</p>
<h4>Minimum window substring</h4>
<p>Given s and t, the smallest window of s containing every character of t (with multiplicity). State: need[c] = count in t; have = number of distinct characters whose count in the window has reached need. Grow right until have == needed distinct count, then shrink left as far as possible while still valid, recording the best. O(|s| + |t|).</p>
<h4>3-sum: sort + opposite ends</h4>
<p>Sort. For each index i, run the two-pointer pair search on the rest for target −a[i]. Skip duplicate values of i, and after finding a triple skip duplicates of l and r. O(n²) time, which is the best known practical bound. The same idea gives 3-sum closest and 4-sum (one more outer loop).</p>
<h4>Container with most water</h4>
<p>Heights h[], choose two lines to form the biggest container: area = (r − l) × min(h[l], h[r]). Start at both ends. Move the pointer with the <em>shorter</em> line inward, because moving the taller one can never increase the area (width shrinks and the height is still capped by the shorter line). O(n).</p>
<h4>Dutch national flag (sort 0s, 1s, 2s)</h4>
<p>Three pointers: low (next slot for 0), mid (current), high (next slot for 2). While mid ≤ high: 0 → swap with low, low++, mid++; 1 → mid++; 2 → swap with high, high−− (do not advance mid, the swapped-in value is unexamined). One pass, O(1) space. This is the partition step inside quicksort too.</p>
<h4>Counting subarrays</h4>
<p>"Count subarrays with sum ≤ k" (positives only): for each right, after shrinking to validity, every window ending at right with start in [left, right] is valid, so add right − left + 1. "Exactly k" = atMost(k) − atMost(k − 1). That subtraction trick converts many "exactly" questions into two "at most" windows.</p>
<div class="callout warn">Sliding windows on sums need all elements non-negative. With negatives, growing the window can decrease the sum and the monotonic argument fails. Then use prefix sums + a hash map (subarray sum equals k) instead.</div>` },
    { name: 'Expert', body: `<h4>Why these are O(n): amortised analysis</h4>
<p>In the variable window, the inner while loop looks like it could run n times per outer step, which would be O(n²). But left only ever increases and never exceeds n, so across the whole run the inner loop executes at most n times in total. Each element enters the window once and leaves once: 2n pointer moves. This is <span class="term">amortised</span> O(1) per step. Say this when an interviewer asks "but there is a nested loop?"</p>
<h4>Monotonic deque: sliding window maximum</h4>
<p>"Maximum of every window of size k" cannot be done with a plain running state (removing the left element may remove the max). Keep a deque of indices whose values are decreasing. When a new element arrives, pop from the back everything smaller than it (they can never be the max again). Pop from the front if the index has left the window. The front is the current max. Each index is pushed and popped once: O(n). The same structure gives "shortest subarray with sum ≥ k" when negatives are allowed (deque over prefix sums).</p>
<h4>Two pointers on two arrays</h4>
<p>Merge two sorted arrays, intersect two sorted arrays, find the k-th smallest in a union, check if one string is a subsequence of another: all are a pointer in each array, advancing the one that is behind. O(n + m). The merge step of merge sort is this pattern.</p>
<h4>Floyd's cycle detection (fast and slow on a linked list)</h4>
<p>A slow pointer moves one step, a fast pointer two. If there is a cycle they meet inside it. Then reset one to the head and move both one step: they meet at the cycle entrance. The proof uses the distance algebra of the two runners. Also solves "find the duplicate number" in an array where values are indices, with O(1) space.</p>
<h4>Sliding windows in systems</h4>
<ul>
<li><strong>Rate limiting:</strong> a sliding log keeps timestamps of the last N requests; a sliding counter approximates with two fixed buckets weighted by overlap. Both are windows over time instead of over an array.</li>
<li><strong>Streaming analytics:</strong> moving averages, percentiles over the last 5 minutes (window + a balanced structure or t-digest).</li>
<li><strong>TCP flow control:</strong> the sender's window is the range of bytes sent but not yet acknowledged; left edge moves on ACK, right edge on send.</li>
</ul>
<h4>Common failure modes</h4>
<ul>
<li>Shrinking with the wrong condition (shrinking while valid when you wanted longest).</li>
<li>Updating the answer before the window is valid.</li>
<li>Off-by-one in length: it is right − left + 1 for inclusive bounds.</li>
<li>Forgetting that "jump left to lastIndex + 1" must never move left backwards (use Math.Max).</li>
<li>Applying windows to subsequence problems or to sums with negatives.</li>
</ul>
<h4>What interviewers listen for</h4>
<p>"The property is monotonic, so I never need to move a pointer backwards." "Each element enters and leaves the window once, so O(n) amortised." "With negatives I would switch to prefix sums and a hash map." "I will deduplicate the triples by skipping equal neighbours after sorting." Those sentences show you understand why it works, not just that it does.</p>` }
  ],
  flow: {
    title: 'Longest substring without repeating characters: "abcabcbb"',
    steps: [
      { title: 'Start empty', desc: 'left = 0, best = 0, and a map of last-seen index per character. The window [left, right] will always contain no repeats.' },
      { title: 'Grow: a, b, c', desc: 'right = 0, 1, 2 add a, b, c. No repeats. Window "abc", best = 3.' },
      { title: 'Repeat found: a', desc: 'right = 3 is "a", last seen at 0, which is inside the window. Jump left to 0 + 1 = 1. Window "bca", still 3.' },
      { title: 'Repeat found: b', desc: 'right = 4 is "b", last seen at 1 ≥ left. left = 2. Window "cab", length 3.' },
      { title: 'Repeat found: c', desc: 'right = 5 is "c", last seen at 2 ≥ left. left = 3. Window "abc", length 3.' },
      { title: 'Two b’s in a row', desc: 'right = 6 is "b", last seen at 4 ≥ left, so left = 5. Window "cb". right = 7 is "b" again, last seen at 6, left = 7. Window "b".' },
      { title: 'Answer', desc: 'best stays 3. left moved only forward: 0 → 1 → 2 → 3 → 5 → 7. Eight steps for right, five jumps for left: O(n).' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Opposite ends and slow/fast: pair sum, remove duplicates, container, 3-sum', code: `using System;
using System.Collections.Generic;

public static class TwoPointers
{
    // Pair with a given sum in a SORTED array. O(n) time, O(1) space.
    public static (int, int)? PairWithSum(int[] a, int target)
    {
        int l = 0, r = a.Length - 1;
        while (l < r)
        {
            int sum = a[l] + a[r];
            if (sum == target) return (l, r);
            if (sum < target) l++;                      // need a bigger sum
            else r--;                                   // need a smaller sum
        }
        return null;
    }

    // Remove duplicates from a sorted array in place; returns the new length. Slow/fast.
    public static int RemoveDuplicates(int[] a)
    {
        if (a.Length == 0) return 0;
        int slow = 0;                                   // last kept index
        for (int fast = 1; fast < a.Length; fast++)
            if (a[fast] != a[slow]) a[++slow] = a[fast];
        return slow + 1;
    }

    // Move all zeros to the end, keeping the order of the others. O(n), in place.
    public static void MoveZeroes(int[] a)
    {
        int slot = 0;                                   // next position for a non-zero
        for (int i = 0; i < a.Length; i++)
            if (a[i] != 0) { (a[slot], a[i]) = (a[i], a[slot]); slot++; }
    }

    // Container with most water: move the shorter side inward. O(n).
    public static int MaxArea(int[] h)
    {
        int l = 0, r = h.Length - 1, best = 0;
        while (l < r)
        {
            best = Math.Max(best, (r - l) * Math.Min(h[l], h[r]));
            if (h[l] < h[r]) l++; else r--;
        }
        return best;
    }

    // All unique triples that sum to zero. Sort + pair search. O(n^2).
    public static List<int[]> ThreeSum(int[] a)
    {
        Array.Sort(a);
        var result = new List<int[]>();
        for (int i = 0; i < a.Length - 2; i++)
        {
            if (i > 0 && a[i] == a[i - 1]) continue;    // skip duplicate first values
            int l = i + 1, r = a.Length - 1;
            while (l < r)
            {
                int sum = a[i] + a[l] + a[r];
                if (sum == 0)
                {
                    result.Add(new[] { a[i], a[l], a[r] });
                    while (l < r && a[l] == a[l + 1]) l++;   // skip duplicates
                    while (l < r && a[r] == a[r - 1]) r--;
                    l++; r--;
                }
                else if (sum < 0) l++;
                else r--;
            }
        }
        return result;
    }

    public static void Demo()
    {
        Console.WriteLine(PairWithSum(new[] { 1, 3, 4, 6, 8 }, 10));             // (2, 3)
        var d = new[] { 1, 1, 2, 2, 3 };
        Console.WriteLine(RemoveDuplicates(d));                                  // 3
        Console.WriteLine(MaxArea(new[] { 1, 8, 6, 2, 5, 4, 8, 3, 7 }));         // 49
        Console.WriteLine(ThreeSum(new[] { -1, 0, 1, 2, -1, -4 }).Count);        // 2
    }
}` },
    { lang: 'csharp', title: 'Sliding windows: fixed size, longest without repeat, minimum window substring', code: `using System;
using System.Collections.Generic;

public static class SlidingWindow
{
    // Maximum sum of any k consecutive elements. Fixed window. O(n).
    public static long MaxSumOfK(int[] a, int k)
    {
        long sum = 0;
        for (int i = 0; i < k; i++) sum += a[i];
        long best = sum;
        for (int right = k; right < a.Length; right++)
        {
            sum += a[right] - a[right - k];             // one in, one out
            best = Math.Max(best, sum);
        }
        return best;
    }

    // Longest substring with no repeated character. Variable window with "jump left". O(n).
    public static int LongestUniqueSubstring(string s)
    {
        var lastSeen = new Dictionary<char, int>();
        int left = 0, best = 0;
        for (int right = 0; right < s.Length; right++)
        {
            if (lastSeen.TryGetValue(s[right], out int prev) && prev >= left)
                left = prev + 1;                        // jump past the earlier copy, never backwards
            lastSeen[s[right]] = right;
            best = Math.Max(best, right - left + 1);
        }
        return best;
    }

    // Smallest subarray (positives) with sum >= target. Shortest-window form. O(n).
    public static int MinSubarrayLenWithSum(int[] a, int target)
    {
        int left = 0, best = int.MaxValue;
        long sum = 0;
        for (int right = 0; right < a.Length; right++)
        {
            sum += a[right];
            while (sum >= target)                        // valid: record, then try to shrink
            {
                best = Math.Min(best, right - left + 1);
                sum -= a[left++];
            }
        }
        return best == int.MaxValue ? 0 : best;
    }

    // Smallest window of s that contains all characters of t (with counts). O(|s| + |t|).
    public static string MinWindow(string s, string t)
    {
        var need = new int[128];
        int distinctNeeded = 0;
        foreach (char c in t) if (need[c]++ == 0) distinctNeeded++;

        var have = new int[128];
        int satisfied = 0, left = 0, bestStart = 0, bestLen = int.MaxValue;
        for (int right = 0; right < s.Length; right++)
        {
            char c = s[right];
            if (++have[c] == need[c]) satisfied++;      // this character just became fully covered
            while (satisfied == distinctNeeded)          // valid: record, then shrink
            {
                if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestStart = left; }
                char outChar = s[left++];
                if (have[outChar]-- == need[outChar]) satisfied--;   // dropped below what we need
            }
        }
        return bestLen == int.MaxValue ? "" : s.Substring(bestStart, bestLen);
    }

    public static void Demo()
    {
        Console.WriteLine(MaxSumOfK(new[] { 2, 1, 5, 1, 3, 2 }, 3));          // 9
        Console.WriteLine(LongestUniqueSubstring("abcabcbb"));               // 3
        Console.WriteLine(MinSubarrayLenWithSum(new[] { 2, 3, 1, 2, 4, 3 }, 7)); // 2
        Console.WriteLine(MinWindow("ADOBECODEBANC", "ABC"));                // BANC
    }
}` },
    { lang: 'csharp', title: 'Dutch national flag, counting subarrays, sliding window maximum (monotonic deque)', code: `using System;
using System.Collections.Generic;

public static class MoreWindows
{
    // Sort an array of 0s, 1s and 2s in one pass. Three pointers, O(n), O(1) space.
    public static void SortColors(int[] a)
    {
        int low = 0, mid = 0, high = a.Length - 1;
        while (mid <= high)
        {
            switch (a[mid])
            {
                case 0: (a[low], a[mid]) = (a[mid], a[low]); low++; mid++; break;
                case 1: mid++; break;
                default: (a[mid], a[high]) = (a[high], a[mid]); high--; break;   // do not advance mid
            }
        }
    }

    // Count subarrays (positives) with sum <= k. Every window ending at right with start in [left, right] is valid.
    public static long CountSubarraysSumAtMost(int[] a, long k)
    {
        long count = 0, sum = 0;
        int left = 0;
        for (int right = 0; right < a.Length; right++)
        {
            sum += a[right];
            while (sum > k) sum -= a[left++];
            count += right - left + 1;
        }
        return count;
    }

    // "Exactly k" via the at-most trick, e.g. subarrays with exactly k distinct values.
    public static long CountWithExactlyKDistinct(int[] a, int k) => AtMostKDistinct(a, k) - AtMostKDistinct(a, k - 1);

    static long AtMostKDistinct(int[] a, int k)
    {
        if (k < 0) return 0;
        var freq = new Dictionary<int, int>();
        long count = 0; int left = 0;
        for (int right = 0; right < a.Length; right++)
        {
            freq[a[right]] = freq.GetValueOrDefault(a[right]) + 1;
            while (freq.Count > k)
            {
                if (--freq[a[left]] == 0) freq.Remove(a[left]);
                left++;
            }
            count += right - left + 1;
        }
        return count;
    }

    // Maximum of every window of size k. Monotonic deque of indices (values decreasing). O(n).
    public static int[] MaxSlidingWindow(int[] a, int k)
    {
        var result = new int[a.Length - k + 1];
        var dq = new LinkedList<int>();                 // front = index of current max
        for (int i = 0; i < a.Length; i++)
        {
            while (dq.Count > 0 && a[dq.Last.Value] <= a[i]) dq.RemoveLast();   // smaller values can never win again
            dq.AddLast(i);
            if (dq.First.Value <= i - k) dq.RemoveFirst();                      // left the window
            if (i >= k - 1) result[i - k + 1] = a[dq.First.Value];
        }
        return result;
    }

    public static void Demo()
    {
        var c = new[] { 2, 0, 2, 1, 1, 0 };
        SortColors(c);
        Console.WriteLine(string.Join(",", c));                                      // 0,0,1,1,2,2
        Console.WriteLine(CountSubarraysSumAtMost(new[] { 1, 2, 3 }, 4));           // 4: [1],[2],[3],[1,2]
        Console.WriteLine(CountWithExactlyKDistinct(new[] { 1, 2, 1, 2, 3 }, 2));   // 7
        Console.WriteLine(string.Join(",", MaxSlidingWindow(new[] { 1, 3, -1, -3, 5, 3, 6, 7 }, 3)));   // 3,3,5,5,6,7
    }
}` }
  ],
  pitfalls: [
    'Using a sliding window on sums that can contain negative numbers. The monotonic argument breaks; use prefix sums + hash map.',
    'Moving <code>left</code> backwards when jumping to lastSeen + 1. Guard with <code>prev &gt;= left</code> (or Math.Max).',
    'Recording the answer before the window is valid in the "longest" form, or after shrinking in the "shortest" form.',
    'Dutch flag: advancing <code>mid</code> after swapping with <code>high</code>. The swapped-in value has not been examined yet.',
    '3-sum without de-duplication produces repeated triples. Skip equal neighbours for i, l and r.',
    'Opposite-ends pair search on an unsorted array. It only works when the array is sorted (or you sort it first, O(n log n)).'
  ],
  quiz: [
    { q: 'Why is the variable sliding window O(n) even though it has a nested while loop?', options: ['The inner loop can never run more than once per outer step', 'left only moves forward: at most n inner steps in total', 'The array is sorted, so the inner loop exits early', 'The compiler turns the two loops into a single loop'], answer: 1, why: 'Each element enters and leaves the window once: at most 2n pointer moves in total. That is amortised O(1) per step.' },
    { q: 'In "container with most water", which pointer do you move?', options: ['Always the left', 'The one with the taller line', 'The one with the shorter line', 'Both'], answer: 2, why: 'Moving the taller line cannot increase the area (width shrinks and height is still capped by the shorter line), so only moving the shorter one can help.' },
    { q: 'A sliding window on subarray sums requires:', options: ['The array to be sorted', 'All elements non-negative', 'All elements to be distinct', 'An even number of elements'], answer: 1, why: 'With non-negative values, growing never decreases the sum and shrinking never increases it. Negatives break that monotonic behaviour.' },
    { q: 'How do you count subarrays with EXACTLY k distinct values using windows?', options: ['Run a window for k only', 'atMost(k) − atMost(k − 1)', 'atMost(k) + atMost(k − 1)', 'Use binary search'], answer: 1, why: 'A window counts "at most" naturally; subtracting "at most k−1" leaves exactly k.' },
    { q: 'In the Dutch national flag algorithm, after swapping a[mid] with a[high] you:', options: ['Advance mid, because a[mid] is now sorted', 'Do not advance mid: the new a[mid] is unexamined', 'Reset mid to 0 and scan the array again', 'Advance both mid and low, because a 2 has moved out'], answer: 1, why: 'The value that came from high has not been classified yet, so mid must look at it again.' },
    { q: 'The problem says "longest subsequence with property P". Is a sliding window appropriate?', options: ['Yes, a window works for any "longest" question', 'No: a window only covers contiguous ranges', 'Only if the array is sorted before you start', 'Only for strings, never for arrays of numbers'], answer: 1, why: 'Windows model contiguous ranges. Subsequence problems usually need DP or greedy methods.' }
  ],
  takeaways: [
    'Two pointers work when moving a pointer changes the answer in only one direction (monotonic).',
    'Opposite ends for sorted pair problems; slow/fast for in-place rewriting.',
    'Variable window: grow right, shrink left while invalid (longest) or while valid (shortest).',
    'Each element enters and leaves once: O(n) amortised, even with the inner loop.',
    'Exactly k = atMost(k) − atMost(k−1). Negatives in sums → prefix sums + hash map instead.',
    'Dutch flag sorts three values in one pass and is quicksort\'s partition in disguise.'
  ],
  interview: [
    { q: 'Find the longest substring with at most two distinct characters.', a: '<p>Variable window with a count map. Grow right; while the map has more than two keys, decrement a[left] and remove it at zero, left++. Record right − left + 1 after each step. O(n) time, O(1) space (map has at most 3 keys).</p>' },
    { q: 'Subarray with sum exactly k when the array has negative numbers.', a: '<p>Sliding window fails. Use prefix sums: as you walk, keep a dictionary of prefix sum → count (or first index). For each prefix P, the number of subarrays ending here with sum k is count[P − k]. O(n) time and space.</p>' },
    { q: 'Detect a cycle in a linked list and find where it starts.', a: '<p>Floyd: slow moves 1, fast moves 2; they meet if a cycle exists. Then put one pointer at the head and move both one step at a time; they meet at the cycle entrance. O(n) time, O(1) space.</p>' },
    { q: 'How would you implement a sliding-window rate limiter?', a: '<p>Keep a queue of request timestamps for the client. On each request, pop from the front while the timestamp is older than now − window, then compare the queue length with the limit. Memory is O(limit) per client. A cheaper approximation uses two fixed buckets weighted by overlap with the window.</p>' }
  ]
};

