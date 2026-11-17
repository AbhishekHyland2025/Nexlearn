// NexLearn curriculum map. Modules -> sections -> topics. Topic ids are stable: content files key on them.
window.CURRICULUM = [
 {
  "id": "m2",
  "num": 1,
  "title": "Problem Solving in DS & Algo",
  "short": "DSA",
  "tagline": "Solve any coding problem with the right data structure and a clear plan, from arrays to graphs to advanced DP.",
  "accent": "#2ee6a6",
  "sections": [
   {
    "id": "m2s1",
    "title": "Linear DSA",
    "topics": [
     {
      "id": "m2-arrays",
      "title": "1D & 2D Arrays: Prefix Sum, Kadane, Rotation",
      "level": "Beginner",
      "mins": 75,
      "summary": "The most common interview topic. Learn the tricks that turn slow array code into fast code: prefix sums, Kadane's max subarray, and in-place rotation.",
      "objectives": [
       "You can build a prefix sum and answer range-sum queries in O(1)",
       "You can find the maximum subarray with Kadane's algorithm",
       "You can rotate an array and a matrix in place",
       "You can solve spiral, diagonal and search-in-sorted-matrix problems"
      ]
     },
     {
      "id": "m2-strings",
      "title": "Strings",
      "level": "Beginner",
      "mins": 70,
      "summary": "Palindromes, anagrams, reversing words, counting characters: the string problems that show up in every first-round interview.",
      "objectives": [
       "You can check palindromes and anagrams in O(n)",
       "You can reverse words and compress strings in place",
       "You can count character frequencies with arrays and dictionaries",
       "You can solve substring problems with a sliding window"
      ]
     },
     {
      "id": "m2-maths",
      "title": "Number System & Maths: Sieve, Fast Power, Modular",
      "level": "Intermediate",
      "mins": 70,
      "summary": "The maths tools used in coding rounds: find all primes fast with the sieve, raise numbers to huge powers, and keep answers small with modulo.",
      "objectives": [
       "You can implement the Sieve of Eratosthenes",
       "You can compute a^b mod m in O(log b)",
       "You can apply modular addition, multiplication and inverse",
       "You can count digits, trailing zeros and divisors efficiently"
      ]
     },
     {
      "id": "m2-bits",
      "title": "Bit Manipulation",
      "level": "Intermediate",
      "mins": 60,
      "summary": "Work on the 0s and 1s directly. Learn AND, OR, XOR, shifts, and the clever tricks like finding the one odd number out.",
      "objectives": [
       "You can set, clear, toggle and check a bit",
       "You can use XOR to find a unique element",
       "You can count set bits and check powers of two",
       "You can generate all subsets with bitmasks"
      ]
     },
     {
      "id": "m2-binary-search",
      "title": "Binary Search",
      "level": "Intermediate",
      "mins": 70,
      "summary": "Cut the search space in half each step. Far more than \"find x in a sorted array\": it solves \"minimum value that works\" problems too.",
      "objectives": [
       "You can write a bug-free binary search",
       "You can find first and last occurrence and lower/upper bound",
       "You can apply binary search on the answer (e.g. min capacity, square root)",
       "You can search in a rotated sorted array"
      ]
     },
     {
      "id": "m2-two-pointers",
      "title": "Two Pointers & Sliding Window",
      "level": "Intermediate",
      "mins": 70,
      "summary": "Two indexes moving over the data instead of nested loops. Turns many O(n²) problems into O(n).",
      "objectives": [
       "You can solve pair-sum and three-sum with two pointers",
       "You can use a fixed and a variable size sliding window",
       "You can solve longest substring without repeating characters",
       "You can recognise when a problem fits the window pattern"
      ]
     },
     {
      "id": "m2-recursion",
      "title": "Recursion & Backtracking",
      "level": "Intermediate",
      "mins": 90,
      "summary": "A function that calls itself to solve a smaller version of the same problem. Backtracking adds \"try, and undo if it fails\" to explore all choices.",
      "objectives": [
       "You can write a recursive function with a correct base case",
       "You can draw the recursion tree and estimate complexity",
       "You can generate subsets, permutations and combinations",
       "You can solve N-Queens, Sudoku and rat-in-a-maze with backtracking"
      ]
     },
     {
      "id": "m2-hashing",
      "title": "Hashing",
      "level": "Intermediate",
      "mins": 60,
      "summary": "Jump straight to a value by its key in O(1). Learn how hash tables work inside and how to use Dictionary and HashSet to speed up problems.",
      "objectives": [
       "You can explain hash functions, buckets and collisions",
       "You can solve two-sum, subarray-sum and frequency problems with hashing",
       "You can explain why a bad hash makes lookups slow",
       "You can use custom keys and GetHashCode/Equals correctly"
      ]
     },
     {
      "id": "m2-sorting",
      "title": "Sorting: All Standard Algorithms",
      "level": "Intermediate",
      "mins": 90,
      "summary": "Bubble, selection, insertion, merge, quick, heap and counting sort. Learn how each works, how fast it is, and when to use which.",
      "objectives": [
       "You can implement bubble, selection and insertion sort",
       "You can implement merge sort and quick sort and explain divide and conquer",
       "You can explain stable vs unstable and in-place sorting",
       "You can pick the right sort for a given data size and shape",
       "You can use custom comparers in C#"
      ]
     },
     {
      "id": "m2-linked-list",
      "title": "Linked List",
      "level": "Intermediate",
      "mins": 80,
      "summary": "A chain of nodes where each points to the next. Cheap to insert in the middle, slow to jump to a position. Classic for pointer practice.",
      "objectives": [
       "You can build a singly and doubly linked list from scratch",
       "You can reverse a list, find the middle and detect a cycle",
       "You can merge two sorted lists and remove the nth node from end",
       "You can explain when a linked list beats an array"
      ]
     },
     {
      "id": "m2-stacks-queues",
      "title": "Stacks & Queues",
      "level": "Intermediate",
      "mins": 80,
      "summary": "Stack: last in, first out (like plates). Queue: first in, first out (like a line). Simple, but they power parsers, undo buttons and schedulers.",
      "objectives": [
       "You can implement a stack and a queue using arrays and linked lists",
       "You can check balanced brackets and evaluate expressions",
       "You can solve next-greater-element with a monotonic stack",
       "You can implement a queue with two stacks and a circular queue",
       "You can use a deque for sliding window maximum"
      ]
     }
    ]
   },
   {
    "id": "m2s2",
    "title": "Non-Linear DSA",
    "topics": [
     {
      "id": "m2-trees",
      "title": "Trees & Traversals",
      "level": "Intermediate",
      "mins": 70,
      "summary": "Data that branches, like a family tree or a folder structure. Learn the vocabulary and the four ways to visit every node.",
      "objectives": [
       "You can explain root, leaf, depth, height and subtree",
       "You can implement preorder, inorder, postorder and level-order traversal",
       "You can write recursive and iterative traversals",
       "You can compute height, size and diameter of a tree"
      ]
     },
     {
      "id": "m2-binary-trees-bst",
      "title": "Binary Trees & BST",
      "level": "Intermediate",
      "mins": 90,
      "summary": "Each node has at most two children. A Binary Search Tree keeps them ordered so search, insert and delete are O(log n) on average.",
      "objectives": [
       "You can insert, search and delete in a BST",
       "You can validate a BST and find the kth smallest",
       "You can find the lowest common ancestor",
       "You can explain why unbalanced trees get slow and what balancing does",
       "You can serialise and deserialise a tree"
      ]
     },
     {
      "id": "m2-maths-advanced",
      "title": "Number System & Maths Advanced: Combinatorics, Probability",
      "level": "Advanced",
      "mins": 70,
      "summary": "Counting ways and chances: permutations, combinations, Pascal's triangle, and the probability ideas that show up in puzzles and DP.",
      "objectives": [
       "You can compute nCr with and without modulo",
       "You can use Pascal's triangle and the inclusion-exclusion principle",
       "You can solve basic probability and expected value problems",
       "You can apply Catalan numbers to counting problems"
      ]
     },
     {
      "id": "m2-tries",
      "title": "Tries",
      "level": "Advanced",
      "mins": 60,
      "summary": "A tree of letters that makes prefix search instant. This is how autocomplete and spell-check work.",
      "objectives": [
       "You can build a trie with insert, search and startsWith",
       "You can count words with a given prefix",
       "You can solve maximum XOR pair with a binary trie",
       "You can explain the memory cost of a trie"
      ]
     },
     {
      "id": "m2-heaps",
      "title": "Heaps & Priority Queues",
      "level": "Advanced",
      "mins": 70,
      "summary": "A tree stored in an array where the top is always the smallest (or largest). Perfect for \"give me the top k\" problems.",
      "objectives": [
       "You can implement a min-heap with insert and extract",
       "You can use C# PriorityQueue for top-k and k-way merge",
       "You can find the median of a stream with two heaps",
       "You can explain heapify and why building a heap is O(n)"
      ]
     },
     {
      "id": "m2-greedy",
      "title": "Greedy Algorithms",
      "level": "Advanced",
      "mins": 60,
      "summary": "Make the best choice right now and never look back. Works for some problems, fails for others; learn to tell them apart.",
      "objectives": [
       "You can solve activity selection and interval scheduling",
       "You can solve fractional knapsack and job sequencing",
       "You can explain why greedy works when it does (exchange argument)",
       "You can recognise a problem where greedy fails"
      ]
     },
     {
      "id": "m2-dp",
      "title": "Dynamic Programming",
      "level": "Advanced",
      "mins": 120,
      "summary": "Solve big problems by remembering answers to small ones. Starts with Fibonacci and climbs to knapsack, LCS and LIS.",
      "objectives": [
       "You can turn a recursive solution into memoisation and then tabulation",
       "You can solve 0/1 knapsack, coin change and climbing stairs",
       "You can solve longest common subsequence and edit distance",
       "You can solve longest increasing subsequence in O(n log n)",
       "You can reduce DP space from 2D to 1D"
      ]
     },
     {
      "id": "m2-graphs",
      "title": "Graphs: BFS/DFS, Shortest Paths, MST, Topological Sort, Union-Find",
      "level": "Advanced",
      "mins": 120,
      "summary": "Nodes connected by edges: maps, social networks, task dependencies. Learn to represent them and the core algorithms that run on them.",
      "objectives": [
       "You can store a graph as an adjacency list and matrix",
       "You can run BFS and DFS and detect cycles",
       "You can find shortest paths with BFS, Dijkstra and 0-1 BFS",
       "You can build a minimum spanning tree with Kruskal and Prim",
       "You can do topological sort and use union-find with path compression"
      ]
     }
    ]
   },
   {
    "id": "m2s3",
    "title": "Advanced DSA",
    "topics": [
     {
      "id": "m2-segment-trees",
      "title": "Segment Trees & Fenwick Trees",
      "level": "Expert",
      "mins": 90,
      "summary": "Answer \"sum of a range\" and \"update one value\" both in O(log n). The go-to structure for range queries on changing data.",
      "objectives": [
       "You can build a segment tree for sum, min and max",
       "You can do point updates and range queries",
       "You can implement lazy propagation for range updates",
       "You can implement a Fenwick (Binary Indexed) tree and know when it is enough"
      ]
     },
     {
      "id": "m2-string-matching",
      "title": "String Pattern Matching: KMP, Z, Rabin-Karp, Manacher",
      "level": "Expert",
      "mins": 90,
      "summary": "Find a pattern inside text faster than checking every position. Each algorithm uses a different clever trick.",
      "objectives": [
       "You can build the KMP failure (LPS) array and search in O(n + m)",
       "You can compute the Z-array and use it for matching",
       "You can implement rolling-hash Rabin-Karp",
       "You can find the longest palindromic substring with Manacher"
      ]
     },
     {
      "id": "m2-dp-advanced",
      "title": "Advanced DP: Bitmask, Digit DP, DP on Trees, Optimizations",
      "level": "Expert",
      "mins": 120,
      "summary": "The hard end of DP: states that are sets of items, numbers digit by digit, trees, and tricks that shrink the work.",
      "objectives": [
       "You can solve travelling salesman with bitmask DP",
       "You can count numbers with a property using digit DP",
       "You can compute subtree answers with DP on trees and rerooting",
       "You can apply monotonic queue and divide-and-conquer optimizations"
      ]
     },
     {
      "id": "m2-graphs-advanced",
      "title": "Advanced Graph Problems: SCC, Bridges, Max Flow, Bellman-Ford, Floyd-Warshall",
      "level": "Expert",
      "mins": 120,
      "summary": "Strongly connected parts, weak links in a network, how much can flow through pipes, and shortest paths with negative edges.",
      "objectives": [
       "You can find SCCs with Kosaraju and Tarjan",
       "You can find bridges and articulation points",
       "You can run Bellman-Ford and detect negative cycles",
       "You can run Floyd-Warshall for all-pairs shortest paths",
       "You can compute max flow with Edmonds-Karp and explain min cut"
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "m3",
  "num": 2,
  "title": "System Design: SQL + LLD + HLD",
  "short": "System Design",
  "tagline": "Design data, classes and whole systems that stay fast and reliable when millions of people use them.",
  "accent": "#4d9fff",
  "sections": [
   {
    "id": "m3s1",
    "title": "SQL",
    "topics": [
     {
      "id": "m3-sql-intro",
      "title": "SQL Intro & Basic SELECT",
      "level": "Beginner",
      "mins": 45,
      "summary": "SQL is how you ask a database questions. Start with tables, rows, columns and the SELECT ... FROM ... WHERE sentence.",
      "objectives": [
       "You can explain tables, rows, columns, primary keys and foreign keys",
       "You can write SELECT with WHERE, AND, OR, IN, BETWEEN",
       "You can create a table and insert, update and delete rows",
       "You can run queries in SQL Server Management Studio or Azure Data Studio"
      ]
     },
     {
      "id": "m3-sql-advanced-select",
      "title": "Advanced SELECT: DISTINCT, CASE, NULL, LIKE",
      "level": "Beginner",
      "mins": 45,
      "summary": "Remove duplicates, add if/else logic inside a query, handle missing values, and search text with wildcards.",
      "objectives": [
       "You can use DISTINCT and TOP / LIMIT",
       "You can write CASE WHEN expressions",
       "You can explain how NULL behaves in comparisons and use IS NULL, COALESCE, NULLIF",
       "You can match text with LIKE and wildcards"
      ]
     },
     {
      "id": "m3-sql-joins",
      "title": "Joins",
      "level": "Intermediate",
      "mins": 60,
      "summary": "Combine rows from two or more tables. INNER, LEFT, RIGHT, FULL, CROSS and SELF joins, explained with pictures.",
      "objectives": [
       "You can draw and explain each join type",
       "You can join three or more tables correctly",
       "You can find rows with no match using LEFT JOIN ... IS NULL",
       "You can avoid duplicate rows caused by one-to-many joins"
      ]
     },
     {
      "id": "m3-sql-sorting-grouping",
      "title": "Sorting & Grouping",
      "level": "Intermediate",
      "mins": 45,
      "summary": "ORDER BY to sort, GROUP BY to put rows into buckets, HAVING to filter the buckets.",
      "objectives": [
       "You can sort by several columns and directions",
       "You can group rows and count them per group",
       "You can explain the difference between WHERE and HAVING",
       "You can explain the logical order SQL runs a query in"
      ]
     },
     {
      "id": "m3-sql-aggregation",
      "title": "Aggregation",
      "level": "Intermediate",
      "mins": 45,
      "summary": "COUNT, SUM, AVG, MIN, MAX and friends: turn many rows into one number.",
      "objectives": [
       "You can use the standard aggregate functions",
       "You can explain how NULLs affect COUNT and AVG",
       "You can combine aggregates with CASE for conditional counts",
       "You can use GROUPING SETS, ROLLUP and CUBE for subtotals"
      ]
     },
     {
      "id": "m3-sql-subqueries",
      "title": "Subqueries",
      "level": "Intermediate",
      "mins": 50,
      "summary": "A query inside a query. Use it in WHERE, FROM or SELECT, and learn correlated subqueries and EXISTS.",
      "objectives": [
       "You can write scalar, row and table subqueries",
       "You can use IN, EXISTS, ANY and ALL",
       "You can explain a correlated subquery and its cost",
       "You can rewrite a subquery as a join and decide which is clearer"
      ]
     },
     {
      "id": "m3-sql-ctes",
      "title": "CTEs (Common Table Expressions)",
      "level": "Intermediate",
      "mins": 45,
      "summary": "Name a temporary result with WITH ... AS so your query reads top to bottom like a story.",
      "objectives": [
       "You can write a CTE and use it in the main query",
       "You can chain several CTEs",
       "You can explain CTE vs subquery vs temp table",
       "You can use a CTE to delete duplicates"
      ]
     },
     {
      "id": "m3-sql-recursive-ctes",
      "title": "Recursive CTEs",
      "level": "Advanced",
      "mins": 50,
      "summary": "A CTE that refers to itself. Walks trees and hierarchies like org charts, categories and bill-of-materials.",
      "objectives": [
       "You can write the anchor and recursive parts of a recursive CTE",
       "You can list an employee's whole reporting chain",
       "You can generate number and date series",
       "You can stop infinite recursion with MAXRECURSION or a depth column"
      ]
     },
     {
      "id": "m3-sql-string-functions",
      "title": "Advanced String Functions",
      "level": "Intermediate",
      "mins": 40,
      "summary": "Clean, split, pad and search text inside the database: CONCAT, SUBSTRING, CHARINDEX, REPLACE, STRING_AGG, STRING_SPLIT, FORMAT.",
      "objectives": [
       "You can combine and cut strings",
       "You can split a comma list into rows and join rows into one string",
       "You can trim, pad and change case",
       "You can do pattern cleanup with REPLACE, TRANSLATE and PATINDEX"
      ]
     },
     {
      "id": "m3-sql-window-ranking",
      "title": "Window Functions: Ranking",
      "level": "Advanced",
      "mins": 55,
      "summary": "ROW_NUMBER, RANK, DENSE_RANK and NTILE give each row a position inside its group without collapsing the rows.",
      "objectives": [
       "You can explain OVER, PARTITION BY and ORDER BY in a window",
       "You can pick between ROW_NUMBER, RANK and DENSE_RANK",
       "You can find the top N per group",
       "You can remove duplicates using ROW_NUMBER"
      ]
     },
     {
      "id": "m3-sql-window-aggregates",
      "title": "Window Functions: Aggregates, Frames, LAG/LEAD",
      "level": "Advanced",
      "mins": 60,
      "summary": "Running totals, moving averages, and comparing a row with the one before or after it.",
      "objectives": [
       "You can compute running totals and moving averages",
       "You can use LAG and LEAD to compare neighbouring rows",
       "You can control the window frame with ROWS and RANGE",
       "You can use FIRST_VALUE and LAST_VALUE"
      ]
     },
     {
      "id": "m3-sql-indexes",
      "title": "Indexes & Query Optimization",
      "level": "Advanced",
      "mins": 70,
      "summary": "Why a query takes 10 seconds and how to make it take 10 milliseconds. Indexes, execution plans and the common slow patterns.",
      "objectives": [
       "You can explain clustered vs non-clustered indexes",
       "You can read an execution plan and spot a table scan",
       "You can design a covering index for a query",
       "You can fix SARGability problems and avoid functions on indexed columns",
       "You can explain the cost of too many indexes"
      ]
     },
     {
      "id": "m3-sql-transactions",
      "title": "Transactions & Isolation Levels",
      "level": "Advanced",
      "mins": 60,
      "summary": "All-or-nothing groups of changes, and the rules for what one user sees while another is editing.",
      "objectives": [
       "You can explain ACID in plain words",
       "You can use BEGIN, COMMIT and ROLLBACK",
       "You can explain dirty, non-repeatable and phantom reads",
       "You can pick an isolation level and explain locks and deadlocks"
      ]
     }
    ]
   },
   {
    "id": "m3s2",
    "title": "LLD (Low-Level Design)",
    "topics": [
     {
      "id": "m3-oops-solid",
      "title": "OOPS & SOLID",
      "level": "Beginner",
      "mins": 75,
      "summary": "Classes, objects, inheritance, polymorphism, abstraction and encapsulation, then the five SOLID rules that keep code easy to change.",
      "objectives": [
       "You can explain the four pillars of OOP with C# examples",
       "You can use interfaces, abstract classes and virtual methods",
       "You can explain each SOLID principle and spot a violation",
       "You can refactor a class that does too much"
      ]
     },
     {
      "id": "m3-patterns-creational",
      "title": "Design Patterns: Creational",
      "level": "Intermediate",
      "mins": 60,
      "summary": "Patterns for creating objects: Singleton, Factory, Abstract Factory, Builder and Prototype.",
      "objectives": [
       "You can implement a thread-safe Singleton and explain its downsides",
       "You can use Factory and Abstract Factory to hide object creation",
       "You can build complex objects step by step with Builder",
       "You can pick the right creational pattern for a scenario"
      ]
     },
     {
      "id": "m3-patterns-structural",
      "title": "Design Patterns: Structural",
      "level": "Intermediate",
      "mins": 60,
      "summary": "Patterns for combining objects: Adapter, Decorator, Facade, Proxy, Composite, Bridge and Flyweight.",
      "objectives": [
       "You can wrap an old interface with Adapter",
       "You can add behaviour without changing a class using Decorator",
       "You can simplify a messy API with Facade",
       "You can model tree structures with Composite"
      ]
     },
     {
      "id": "m3-patterns-behavioral",
      "title": "Design Patterns: Behavioral",
      "level": "Intermediate",
      "mins": 70,
      "summary": "Patterns for how objects talk: Strategy, Observer, Command, State, Template Method, Chain of Responsibility, Iterator, Mediator.",
      "objectives": [
       "You can swap algorithms at runtime with Strategy",
       "You can implement Observer with C# events",
       "You can model a workflow with the State pattern",
       "You can build an undo system with Command"
      ]
     },
     {
      "id": "m3-uml",
      "title": "UML Diagrams",
      "level": "Intermediate",
      "mins": 45,
      "summary": "Pictures that explain code: class diagrams, sequence diagrams, use-case and activity diagrams.",
      "objectives": [
       "You can draw a class diagram with relationships (association, aggregation, composition, inheritance)",
       "You can draw a sequence diagram for an API call",
       "You can draw use-case and activity diagrams",
       "You can read a UML diagram in an interview and turn it into code"
      ]
     },
     {
      "id": "m3-schema-design",
      "title": "Schema Design & Normalization",
      "level": "Intermediate",
      "mins": 60,
      "summary": "How to shape database tables so data is not repeated and stays correct: ER diagrams and normal forms 1NF to 3NF.",
      "objectives": [
       "You can draw an ER diagram for a business problem",
       "You can explain 1NF, 2NF, 3NF with examples",
       "You can decide when to denormalise for speed",
       "You can model one-to-many and many-to-many relationships"
      ]
     },
     {
      "id": "m3-design-problems",
      "title": "Design Problems Practice",
      "level": "Advanced",
      "mins": 90,
      "summary": "Practice the classic LLD questions: library system, elevator, vending machine, Splitwise, BookMyShow, Tic-Tac-Toe.",
      "objectives": [
       "You can gather requirements and list entities for a design question",
       "You can write class diagrams and choose patterns for each problem",
       "You can handle edge cases and concurrency in the design",
       "You can explain your design out loud in 15 minutes"
      ]
     },
     {
      "id": "m3-machine-coding",
      "title": "Machine Coding Round",
      "level": "Advanced",
      "mins": 90,
      "summary": "A timed round where you build a small working app in 90 minutes. Learn how to plan, code and test fast without messy code.",
      "objectives": [
       "You can split 90 minutes into plan, code and test phases",
       "You can set up a clean project structure quickly",
       "You can write a working solution with unit tests",
       "You can present and defend your trade-offs"
      ]
     },
     {
      "id": "m3-case-rate-limiter",
      "title": "Case Study: Rate Limiter",
      "level": "Advanced",
      "mins": 60,
      "summary": "Stop a client from calling your API too often. Token bucket, leaky bucket, fixed and sliding windows, in code.",
      "objectives": [
       "You can explain and implement token bucket and sliding window",
       "You can compare the algorithms on accuracy and memory",
       "You can design the classes and interfaces for a pluggable limiter",
       "You can make it work across many servers with Redis"
      ]
     },
     {
      "id": "m3-case-parking-lot",
      "title": "Case Study: Parking Lot",
      "level": "Advanced",
      "mins": 60,
      "summary": "The most famous LLD interview question. Vehicles, spots, floors, tickets and payments modelled cleanly.",
      "objectives": [
       "You can list requirements and entities for a parking lot",
       "You can draw the class diagram with the right patterns",
       "You can implement allocation, ticketing and pricing in C#",
       "You can extend the design for new vehicle types without rewriting"
      ]
     }
    ]
   },
   {
    "id": "m3s3",
    "title": "HLD (High-Level Design)",
    "topics": [
     {
      "id": "m3-distributed-fundamentals",
      "title": "Distributed Systems Fundamentals: CAP, Scaling",
      "level": "Intermediate",
      "mins": 60,
      "summary": "What changes when one computer becomes many: scaling up vs out, the CAP theorem, latency and availability numbers.",
      "objectives": [
       "You can explain vertical vs horizontal scaling",
       "You can explain CAP and PACELC in plain words",
       "You can estimate traffic, storage and bandwidth for a system",
       "You can define SLA, SLO and the \"nines\" of availability"
      ]
     },
     {
      "id": "m3-load-balancing",
      "title": "Load Balancing",
      "level": "Intermediate",
      "mins": 45,
      "summary": "Spread requests across many servers so none is overloaded. Algorithms, health checks, L4 vs L7.",
      "objectives": [
       "You can explain round robin, least connections and weighted routing",
       "You can explain L4 vs L7 load balancers",
       "You can design health checks and failover",
       "You can explain sticky sessions and why to avoid them"
      ]
     },
     {
      "id": "m3-consistent-hashing",
      "title": "Consistent Hashing",
      "level": "Advanced",
      "mins": 50,
      "summary": "How to decide which server stores which key, so adding or removing a server moves only a little data.",
      "objectives": [
       "You can explain the hash ring and virtual nodes",
       "You can show why plain modulo hashing fails when servers change",
       "You can implement consistent hashing in C#",
       "You can explain where it is used (caches, databases, CDNs)"
      ]
     },
     {
      "id": "m3-caching",
      "title": "Caching",
      "level": "Intermediate",
      "mins": 60,
      "summary": "Keep a copy of data close to where it is used. Cache levels, eviction policies, cache-aside vs write-through, and the problems caches cause.",
      "objectives": [
       "You can explain browser, CDN, application and database caches",
       "You can implement LRU and explain LFU",
       "You can pick between cache-aside, write-through and write-back",
       "You can handle cache stampede, invalidation and stale data"
      ]
     },
     {
      "id": "m3-distributed-transactions",
      "title": "Transactions & Consistency in Distributed Systems",
      "level": "Advanced",
      "mins": 60,
      "summary": "Keeping data correct when it lives on many machines: two-phase commit, sagas, idempotency and eventual consistency.",
      "objectives": [
       "You can explain strong vs eventual consistency",
       "You can explain two-phase commit and why it is slow",
       "You can design a saga with compensating actions",
       "You can make an operation idempotent and use the outbox pattern"
      ]
     },
     {
      "id": "m3-sql-vs-nosql",
      "title": "SQL vs NoSQL Databases",
      "level": "Intermediate",
      "mins": 55,
      "summary": "Relational, document, key-value, column-family and graph databases: what each is good at and how to choose.",
      "objectives": [
       "You can describe the five database families with an example product each",
       "You can choose a database from access patterns",
       "You can explain schema-on-write vs schema-on-read",
       "You can explain when to use more than one database"
      ]
     },
     {
      "id": "m3-replication-sharding",
      "title": "Replication & Sharding",
      "level": "Advanced",
      "mins": 60,
      "summary": "Copy data for safety and reads (replication); split data across machines for size and writes (sharding).",
      "objectives": [
       "You can explain leader-follower and multi-leader replication",
       "You can explain replication lag and read-your-writes",
       "You can pick a shard key and explain hot shards",
       "You can explain resharding and cross-shard queries"
      ]
     },
     {
      "id": "m3-microservices",
      "title": "Microservices",
      "level": "Advanced",
      "mins": 70,
      "summary": "Split one big app into small services that each own their data. Benefits, costs, and the patterns that make them work.",
      "objectives": [
       "You can compare monolith vs microservices honestly",
       "You can define service boundaries using domain thinking",
       "You can explain API gateway, service discovery and circuit breakers",
       "You can explain how services share data without sharing a database"
      ]
     },
     {
      "id": "m3-queues",
      "title": "Distributed Queues & Messaging: Kafka, RabbitMQ",
      "level": "Advanced",
      "mins": 70,
      "summary": "Let services talk without waiting for each other. Queues, topics, partitions, delivery guarantees and when to use Kafka vs RabbitMQ.",
      "objectives": [
       "You can explain producers, consumers, topics and partitions",
       "You can explain at-most-once, at-least-once and exactly-once",
       "You can handle retries, dead-letter queues and ordering",
       "You can choose between Kafka, RabbitMQ and Azure Service Bus"
      ]
     },
     {
      "id": "m3-api-design",
      "title": "API Design at Scale",
      "level": "Advanced",
      "mins": 55,
      "summary": "REST conventions, versioning, pagination, rate limiting, idempotency keys and when to use GraphQL or gRPC instead.",
      "objectives": [
       "You can design clean REST resources and status codes",
       "You can version an API without breaking clients",
       "You can design cursor pagination and filtering",
       "You can compare REST, GraphQL and gRPC for a use case"
      ]
     },
     {
      "id": "m3-real-systems",
      "title": "Designing Real-Life Systems: URL Shortener, Chat, News Feed",
      "level": "Advanced",
      "mins": 120,
      "summary": "Put all the pieces together on three classic problems, following a step-by-step interview method.",
      "objectives": [
       "You can run a system design interview framework end to end",
       "You can design a URL shortener with ID generation and redirects",
       "You can design a chat system with real-time delivery and storage",
       "You can design a news feed with fan-out on write vs read"
      ]
     }
    ]
   },
   {
    "id": "m3s4",
    "title": "System Design Case Studies",
    "topics": [
     {
      "id": "m3-case-chess",
      "title": "HLD: Chess Game Website",
      "level": "Advanced",
      "mins": 75,
      "summary": "Real-time two-player games, matchmaking, move validation, ratings and watching live games.",
      "objectives": [
       "You can design matchmaking and a game-state service",
       "You can choose WebSockets for real-time moves and handle reconnects",
       "You can store games and compute ratings (Elo)",
       "You can scale spectator mode with pub/sub"
      ]
     },
     {
      "id": "m3-case-hotstar",
      "title": "HLD: Hotstar Live Streaming",
      "level": "Expert",
      "mins": 90,
      "summary": "Millions watching the same cricket match at once. Video encoding, adaptive streaming, CDNs and surviving traffic spikes.",
      "objectives": [
       "You can explain video ingestion, transcoding and HLS/DASH",
       "You can design CDN delivery for a live event",
       "You can plan for sudden spikes with pre-scaling and backpressure",
       "You can design live chat, ads and analytics alongside the stream"
      ]
     },
     {
      "id": "m3-case-netflix-frontend",
      "title": "Frontend System Design: Netflix",
      "level": "Advanced",
      "mins": 60,
      "summary": "A browse page with thousands of posters that still feels instant: component architecture, lazy loading, caching and the video player.",
      "objectives": [
       "You can design the component tree and data flow for a browse page",
       "You can design image and data lazy loading with virtual scrolling",
       "You can plan client-side caching and prefetching",
       "You can explain adaptive bitrate from the player's side"
      ]
     },
     {
      "id": "m3-case-whatsapp-frontend",
      "title": "Frontend System Design: WhatsApp Web",
      "level": "Advanced",
      "mins": 60,
      "summary": "Real-time chat in the browser: message sync, offline storage, optimistic updates and end-to-end encryption basics.",
      "objectives": [
       "You can design the real-time connection and message state machine",
       "You can store messages offline with IndexedDB and sync on reconnect",
       "You can implement optimistic UI with retries",
       "You can explain where encryption happens and what the client holds"
      ]
     },
     {
      "id": "m3-case-ecommerce",
      "title": "Full-Stack E-Commerce with Login & Security",
      "level": "Expert",
      "mins": 120,
      "summary": "The whole picture: catalog, cart, checkout, payments, orders, auth and security, designed end to end in .NET and Angular.",
      "objectives": [
       "You can design the services, databases and events for an e-commerce platform",
       "You can design secure login with JWT, refresh tokens and roles",
       "You can design checkout with inventory holds and payment idempotency",
       "You can list and mitigate the top security risks for a shop"
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "sec",
  "title": "Security Engineering: Secure Coding & Threat Modelling",
  "short": "Security",
  "tagline": "Think like an attacker, build like a defender. Write code that is safe by default and design systems that stay safe when things go wrong.",
  "accent": "#ff4d8d",
  "sections": [
   {
    "id": "sec-s1",
    "title": "Security Foundations",
    "topics": [
     {
      "id": "sec-mindset",
      "title": "Security Mindset: CIA Triad & How Attackers Think",
      "level": "Beginner",
      "mins": 40,
      "summary": "Security starts with a way of thinking. Learn the three goals every system protects (secrecy, correctness, availability) and how an attacker looks at your app.",
      "objectives": [
       "You can explain confidentiality, integrity and availability with everyday examples",
       "You can list the assets, entry points and trust boundaries of a simple app",
       "You can tell a vulnerability, a threat, an exploit and a risk apart",
       "You can ask \"what could go wrong here?\" for any feature"
      ]
     },
     {
      "id": "sec-social",
      "title": "Social Engineering, Phishing & the Human Side",
      "level": "Beginner",
      "mins": 35,
      "summary": "Most attacks start with a person, not with code. Learn how tricks like phishing work and how teams and products defend against them.",
      "objectives": [
       "You can spot the common signs of a phishing message",
       "You can explain pretexting, baiting and MFA fatigue in plain words",
       "You can design product flows that are harder to abuse through people",
       "You can follow safe habits for passwords, devices and sharing"
      ]
     },
     {
      "id": "sec-crypto",
      "title": "Cryptography Essentials: Hashing, Encryption & Signatures",
      "level": "Beginner",
      "mins": 60,
      "summary": "The maths you rely on every day without seeing it. Learn what hashing, symmetric and asymmetric encryption and digital signatures do, and which one to pick.",
      "objectives": [
       "You can explain the difference between hashing, encoding and encryption",
       "You can choose the right tool: AES-GCM, RSA/ECDSA, HMAC, or a password hash",
       "You can hash passwords correctly with a slow, salted algorithm",
       "You can explain why you never invent your own crypto"
      ]
     },
     {
      "id": "sec-authn",
      "title": "Authentication: Passwords, MFA, Passkeys & Sessions",
      "level": "Intermediate",
      "mins": 60,
      "summary": "Proving who someone is. Learn how to store passwords, add a second factor, use passkeys, and keep a login session safe.",
      "objectives": [
       "You can design a safe sign-up, login and password reset flow",
       "You can explain how MFA and passkeys stop stolen passwords",
       "You can protect against brute force and credential stuffing",
       "You can manage sessions: cookies, expiry, logout and rotation"
      ]
     },
     {
      "id": "sec-authz",
      "title": "Authorization & Access Control: RBAC, ABAC & IDOR",
      "level": "Intermediate",
      "mins": 55,
      "summary": "Deciding what a logged-in user is allowed to do. Learn roles, policies, and the number one web bug: seeing data that belongs to someone else.",
      "objectives": [
       "You can explain authentication vs authorization",
       "You can apply roles, claims and policies in ASP.NET Core",
       "You can find and fix an insecure direct object reference (IDOR)",
       "You can enforce checks on the server for every request"
      ]
     },
     {
      "id": "sec-web-model",
      "title": "The Web Security Model: Same-Origin, Cookies, CORS & CSP",
      "level": "Intermediate",
      "mins": 55,
      "summary": "The browser has built-in walls between websites. Learn how the same-origin rule, cookie flags, CORS and Content Security Policy keep sites apart.",
      "objectives": [
       "You can explain what an origin is and what the same-origin policy blocks",
       "You can set cookie flags: HttpOnly, Secure and SameSite",
       "You can configure CORS without opening your API to everyone",
       "You can write a basic Content Security Policy and security headers"
      ]
     }
    ]
   },
   {
    "id": "sec-s2",
    "title": "Secure Coding Practices",
    "topics": [
     {
      "id": "sec-input-validation",
      "title": "Input Validation & Output Encoding",
      "level": "Beginner",
      "mins": 45,
      "summary": "Never trust data from outside. Learn to check everything coming in and to safely encode everything going out.",
      "objectives": [
       "You can explain why all input is untrusted, even from your own frontend",
       "You can validate with allow-lists, types, lengths and ranges",
       "You can encode output for the place it lands: HTML, URL, SQL, shell",
       "You can validate on the server even when the client already did"
      ]
     },
     {
      "id": "sec-injection",
      "title": "Injection Attacks: SQL, Command, NoSQL & LDAP",
      "level": "Intermediate",
      "mins": 60,
      "summary": "When user input gets mixed into a command, the user can change the command. Learn how injection happens and the simple habit that stops it.",
      "objectives": [
       "You can explain how SQL injection works with a simple example",
       "You can use parameterized queries in ADO.NET, Dapper and EF Core",
       "You can avoid command, NoSQL, LDAP and template injection",
       "You can spot injection risks in a code review"
      ]
     },
     {
      "id": "sec-xss-csrf",
      "title": "XSS, CSRF & Clickjacking",
      "level": "Intermediate",
      "mins": 60,
      "summary": "Three classic browser attacks: running a stranger's script on your page, tricking a logged-in user into an action, and hiding your page under a fake one.",
      "objectives": [
       "You can explain stored, reflected and DOM-based XSS",
       "You can prevent XSS with encoding, safe frameworks and CSP",
       "You can stop CSRF with SameSite cookies and anti-forgery tokens",
       "You can block clickjacking with frame headers"
      ]
     },
     {
      "id": "sec-secrets",
      "title": "Secrets Management & Key Handling",
      "level": "Intermediate",
      "mins": 45,
      "summary": "Passwords, API keys and certificates must never live in code. Learn where secrets should live, how to rotate them and what to do when one leaks.",
      "objectives": [
       "You can keep secrets out of source code and config files",
       "You can use a vault and managed identities in .NET",
       "You can rotate a key without downtime",
       "You can respond correctly when a secret is leaked"
      ]
     },
     {
      "id": "sec-tokens",
      "title": "Secure Sessions, JWT & OAuth Pitfalls",
      "level": "Advanced",
      "mins": 60,
      "summary": "Tokens are easy to use and easy to get wrong. Learn the common mistakes with JWTs, refresh tokens and OAuth, and how to avoid each one.",
      "objectives": [
       "You can validate a JWT fully: signature, algorithm, issuer, audience, expiry",
       "You can choose where to store tokens in a browser app",
       "You can use refresh token rotation and revoke sessions",
       "You can explain the authorization code flow with PKCE and its common mistakes"
      ]
     },
     {
      "id": "sec-files-ssrf",
      "title": "File Uploads, Deserialization, SSRF & XXE",
      "level": "Advanced",
      "mins": 60,
      "summary": "Four ways an app gets tricked by the data it processes: dangerous files, objects rebuilt from untrusted bytes, servers fetching attacker-chosen URLs, and unsafe XML.",
      "objectives": [
       "You can build a safe file upload: type, size, name, storage and scanning",
       "You can avoid insecure deserialization in .NET",
       "You can prevent SSRF with allow-lists and network controls",
       "You can configure XML parsers to block XXE"
      ]
     },
     {
      "id": "sec-errors-logging",
      "title": "Secure Error Handling & Logging",
      "level": "Intermediate",
      "mins": 40,
      "summary": "Errors should help your team and tell attackers nothing. Learn what to show, what to log, and what must never appear in a log.",
      "objectives": [
       "You can return safe error messages without stack traces",
       "You can log security events that matter",
       "You can keep passwords, tokens and personal data out of logs",
       "You can stop log injection and protect log integrity"
      ]
     },
     {
      "id": "sec-api",
      "title": "API Security: The OWASP API Top 10",
      "level": "Advanced",
      "mins": 60,
      "summary": "APIs are the front door of modern apps. Walk through the ten most common API security problems and the fix for each.",
      "objectives": [
       "You can explain broken object level and function level authorization",
       "You can stop mass assignment and excessive data exposure with DTOs",
       "You can add rate limits, quotas and pagination limits",
       "You can keep an inventory of your APIs and retire old versions"
      ]
     },
     {
      "id": "sec-owasp-top10",
      "title": "OWASP Top 10 Walkthrough",
      "level": "Intermediate",
      "mins": 70,
      "summary": "The best-known list of web application risks. Learn each one in plain words, how it looks in a real app, and how to prevent it.",
      "objectives": [
       "You can name and explain each OWASP Top 10 category",
       "You can map each category to a concrete bug in a .NET web app",
       "You can give the main defence for each category",
       "You can use the list as a review checklist"
      ]
     },
     {
      "id": "sec-data-protection",
      "title": "Data Protection & Privacy: Encryption, PII & GDPR Basics",
      "level": "Intermediate",
      "mins": 50,
      "summary": "Protect the data people trust you with. Learn encryption in transit and at rest, how to handle personal data, and the basics of privacy law.",
      "objectives": [
       "You can classify data and decide how each class is protected",
       "You can encrypt data in transit and at rest and manage the keys",
       "You can apply data minimisation, masking and retention rules",
       "You can explain the core GDPR ideas a developer must know"
      ]
     },
     {
      "id": "sec-dotnet-checklist",
      "title": "Secure Coding in C# & .NET: The Complete Checklist",
      "level": "Advanced",
      "mins": 60,
      "summary": "Everything pulled together for a .NET developer: the settings, APIs and habits that make an ASP.NET Core app safe by default.",
      "objectives": [
       "You can harden an ASP.NET Core app: HTTPS, headers, cookies, CORS, rate limits",
       "You can use the safe .NET APIs for crypto, random numbers and data protection",
       "You can avoid race conditions, integer overflow, ReDoS and unsafe code traps",
       "You can run a secure coding checklist before every release"
      ]
     }
    ]
   },
   {
    "id": "sec-s3",
    "title": "Threat Modelling & Secure Design",
    "topics": [
     {
      "id": "sec-threat-modelling",
      "title": "Threat Modelling Fundamentals: DFDs, Trust Boundaries & STRIDE",
      "level": "Intermediate",
      "mins": 60,
      "summary": "Find security problems on a whiteboard, before any code exists. Learn the four key questions, data flow diagrams, trust boundaries and the STRIDE method.",
      "objectives": [
       "You can answer the four threat modelling questions for a feature",
       "You can draw a data flow diagram with trust boundaries",
       "You can apply STRIDE to each element of the diagram",
       "You can write threats in a clear, testable form"
      ]
     },
     {
      "id": "sec-threat-modelling-practice",
      "title": "Threat Modelling in Practice: Worked Example, Attack Trees & Risk Rating",
      "level": "Advanced",
      "mins": 75,
      "summary": "A full threat model from start to finish for a real app, plus the tools to rank threats and decide what to fix first.",
      "objectives": [
       "You can run a threat modelling session with your team",
       "You can build an attack tree for a goal like \"steal a user account\"",
       "You can rate risk by likelihood and impact and compare DREAD and CVSS",
       "You can choose to mitigate, avoid, transfer or accept a risk and record it",
       "You can explain where PASTA and LINDDUN fit"
      ]
     },
     {
      "id": "sec-design-principles",
      "title": "Secure Design Principles: Least Privilege, Defence in Depth & Zero Trust",
      "level": "Intermediate",
      "mins": 50,
      "summary": "A handful of old, proven rules that make whole classes of attacks fail. Learn each principle with a real-life picture and a code example.",
      "objectives": [
       "You can apply least privilege to users, services and database accounts",
       "You can layer defences so one failure is not a breach",
       "You can design features to fail safely and be secure by default",
       "You can explain zero trust in plain words"
      ]
     },
     {
      "id": "sec-architecture",
      "title": "Secure Architecture Patterns & Security Requirements",
      "level": "Advanced",
      "mins": 60,
      "summary": "Turn security into requirements and architecture choices: where to put the gateway, how to isolate tenants, and how to write abuse cases next to use cases.",
      "objectives": [
       "You can write security requirements and abuse cases for a feature",
       "You can place authentication, authorization and validation in the right layer",
       "You can isolate tenants and limit blast radius",
       "You can review an architecture diagram for security gaps"
      ]
     }
    ]
   },
   {
    "id": "sec-s4",
    "title": "DevSecOps & Security Testing",
    "topics": [
     {
      "id": "sec-sdlc",
      "title": "Secure SDLC & Shifting Left",
      "level": "Intermediate",
      "mins": 45,
      "summary": "Security is cheaper the earlier you do it. Learn what security work belongs in each stage, from idea to production.",
      "objectives": [
       "You can list the security activity for each stage of the life cycle",
       "You can explain why fixing early costs less",
       "You can set up security champions and a definition of done",
       "You can explain OWASP SAMM and Microsoft SDL at a high level"
      ]
     },
     {
      "id": "sec-supply-chain",
      "title": "Dependency & Supply Chain Security: SCA, SBOM & Signing",
      "level": "Advanced",
      "mins": 55,
      "summary": "Most of your app is code you did not write. Learn how to track, check and trust your packages, build tools and containers.",
      "objectives": [
       "You can scan NuGet and npm packages for known vulnerabilities",
       "You can explain typosquatting and dependency confusion",
       "You can produce an SBOM and explain why it matters",
       "You can lock versions, sign artifacts and protect the build pipeline"
      ]
     },
     {
      "id": "sec-pipeline",
      "title": "Security in CI/CD: SAST, DAST, Secret & IaC Scanning",
      "level": "Advanced",
      "mins": 60,
      "summary": "Let the pipeline catch problems before people do. Learn the scanning tools, where each one fits, and how to keep them useful and quiet.",
      "objectives": [
       "You can explain SAST, DAST, SCA, secret scanning and IaC scanning",
       "You can add security gates to a GitHub Actions or Azure DevOps pipeline",
       "You can triage findings and handle false positives",
       "You can protect the pipeline itself: secrets, permissions, runners"
      ]
     },
     {
      "id": "sec-code-review",
      "title": "Security Code Review",
      "level": "Advanced",
      "mins": 50,
      "summary": "Reading code the way an attacker would. Learn a repeatable way to review a change for security problems.",
      "objectives": [
       "You can follow untrusted data from entry point to dangerous sink",
       "You can use a security review checklist on a pull request",
       "You can spot the high-risk areas: auth, crypto, file, SQL, deserialization",
       "You can give review feedback that gets fixed"
      ]
     },
     {
      "id": "sec-pentest",
      "title": "Security Testing & Ethical Hacking Basics",
      "level": "Advanced",
      "mins": 60,
      "summary": "How professionals test systems with permission. Learn the phases of a penetration test, the tools testers use, and how to read their report.",
      "objectives": [
       "You can explain the phases of a penetration test and its rules of engagement",
       "You can describe what tools like Burp Suite, OWASP ZAP and nmap are for",
       "You can write security test cases for your own features",
       "You can read a pentest report and plan the fixes"
      ]
     },
     {
      "id": "sec-cloud-containers",
      "title": "Cloud & Container Security: IAM, Networks & Kubernetes",
      "level": "Advanced",
      "mins": 65,
      "summary": "The cloud is safe only if you configure it safely. Learn the shared responsibility model, identity, network isolation and how to harden containers.",
      "objectives": [
       "You can explain the shared responsibility model",
       "You can apply least privilege with cloud IAM and managed identities",
       "You can isolate networks and remove public access to data stores",
       "You can harden a Docker image and a Kubernetes deployment"
      ]
     }
    ]
   },
   {
    "id": "sec-s5",
    "title": "Operations, Compliance & AI Security",
    "topics": [
     {
      "id": "sec-monitoring-ir",
      "title": "Detection, Monitoring & Incident Response",
      "level": "Advanced",
      "mins": 60,
      "summary": "Assume something will go wrong one day. Learn how to notice an attack quickly and how to respond calmly with a plan.",
      "objectives": [
       "You can decide which security events to log and alert on",
       "You can explain what a SIEM does",
       "You can follow the incident response steps: prepare, detect, contain, remove, recover, learn",
       "You can write a simple incident runbook and a blameless review"
      ]
     },
     {
      "id": "sec-vuln-mgmt",
      "title": "Vulnerability Management: CVE, CVSS, Patching & Disclosure",
      "level": "Intermediate",
      "mins": 45,
      "summary": "New weaknesses are found every day. Learn how they are named and scored, how to decide what to patch first, and how to handle reports from researchers.",
      "objectives": [
       "You can explain CVE, CWE and CVSS",
       "You can prioritise fixes by real risk, not only by score",
       "You can set patching timelines and track them",
       "You can run a responsible disclosure process"
      ]
     },
     {
      "id": "sec-compliance",
      "title": "Compliance & Standards: ISO 27001, SOC 2, PCI DSS, GDPR & HIPAA",
      "level": "Intermediate",
      "mins": 50,
      "summary": "The rule books customers and regulators ask about. Learn what each standard covers and what it means for a developer day to day.",
      "objectives": [
       "You can say what each major standard is for and who needs it",
       "You can map common controls to your daily engineering work",
       "You can collect evidence without slowing the team down",
       "You can explain why compliance is not the same as security"
      ]
     },
     {
      "id": "sec-ai",
      "title": "AI & LLM Security: Prompt Injection, OWASP LLM Top 10 & Securing Agents",
      "level": "Expert",
      "mins": 60,
      "summary": "AI apps bring new kinds of attacks. Learn prompt injection, data leaks, unsafe tool use, and how to build guardrails around models and agents.",
      "objectives": [
       "You can explain direct and indirect prompt injection",
       "You can walk through the OWASP Top 10 for LLM applications",
       "You can limit what an agent and its tools are allowed to do",
       "You can threat model a RAG or agent system"
      ]
     }
    ]
   }
  ],
  "num": 3
 },
 {
  "id": "m5",
  "num": 4,
  "title": "Gen AI, Agentic AI & FDE Foundations",
  "short": "Gen AI & FDE",
  "tagline": "Understand how AI models work, build RAG and agent systems in .NET, and deliver them to real customers as a forward deployed engineer.",
  "accent": "#a78bfa",
  "sections": [
   {
    "id": "m5s1",
    "title": "Foundations",
    "topics": [
     {
      "id": "m5-llms",
      "title": "How LLMs & Transformers Work",
      "level": "Beginner",
      "mins": 50,
      "summary": "What a large language model really does (predict the next word, very well) and the transformer design that makes it possible.",
      "objectives": [
       "You can explain tokens, embeddings and context windows",
       "You can explain attention in plain words",
       "You can explain pre-training, fine-tuning and RLHF",
       "You can explain why models hallucinate and what temperature does"
      ]
     },
     {
      "id": "m5-prompting",
      "title": "Prompt Engineering Techniques",
      "level": "Beginner",
      "mins": 45,
      "summary": "How to ask a model so you get useful, reliable answers: roles, examples, step-by-step thinking and output formats.",
      "objectives": [
       "You can write a clear system prompt with role, task and constraints",
       "You can use zero-shot, few-shot and chain-of-thought prompting",
       "You can ask for structured output like JSON",
       "You can test and iterate on prompts in a repeatable way"
      ]
     },
     {
      "id": "m5-apis",
      "title": "LLM APIs, Structured Output & Tool Calling",
      "level": "Intermediate",
      "mins": 60,
      "summary": "Call models from .NET: chat requests, streaming, JSON schemas for guaranteed shape, and letting the model call your functions.",
      "objectives": [
       "You can call a chat model from C# with the provider SDK or Microsoft.Extensions.AI",
       "You can stream responses to a UI",
       "You can get typed JSON back with structured output",
       "You can define tools and handle tool-call round trips",
       "You can manage tokens, cost and rate limits"
      ]
     },
     {
      "id": "m5-finetune",
      "title": "Fine-Tuning vs RAG vs Prompting",
      "level": "Intermediate",
      "mins": 45,
      "summary": "Three ways to make a model know your stuff, and how to choose: change the prompt, give it documents, or train it.",
      "objectives": [
       "You can explain what fine-tuning changes and what it does not",
       "You can compare cost, speed and freshness of each approach",
       "You can decide which approach fits a business problem",
       "You can describe the steps of a fine-tuning job and LoRA"
      ]
     }
    ]
   },
   {
    "id": "m5s2",
    "title": "Retrieval & RAG",
    "topics": [
     {
      "id": "m5-vectors",
      "title": "Embeddings, Vector DBs & Semantic Search",
      "level": "Intermediate",
      "mins": 60,
      "summary": "Turn text into numbers that capture meaning, store them, and find \"things that mean the same\" instead of exact words.",
      "objectives": [
       "You can explain embeddings and cosine similarity",
       "You can create embeddings from .NET and store them",
       "You can compare vector databases (pgvector, Azure AI Search, Qdrant, Pinecone)",
       "You can explain ANN indexes like HNSW and their trade-offs"
      ]
     },
     {
      "id": "m5-rag",
      "title": "RAG Systems from Scratch",
      "level": "Intermediate",
      "mins": 60,
      "summary": "Retrieval-Augmented Generation: find the right documents, give them to the model, get grounded answers. Build one in C#.",
      "objectives": [
       "You can explain the ingest and query pipelines of RAG",
       "You can chunk documents and embed them",
       "You can retrieve top-k chunks and build a grounded prompt",
       "You can cite sources and reduce hallucinations"
      ]
     },
     {
      "id": "m5-enterprise-rag",
      "title": "Enterprise-Level RAG",
      "level": "Advanced",
      "mins": 75,
      "summary": "What changes when RAG serves a company: smarter chunking, hybrid search, reranking, permissions, evaluation and cost control.",
      "objectives": [
       "You can design chunking and metadata strategies for real documents",
       "You can combine keyword and vector search with reranking",
       "You can enforce document-level permissions in retrieval",
       "You can evaluate RAG quality with a test set",
       "You can handle updates, deletes and versioning of documents"
      ]
     },
     {
      "id": "m5-agentic-rag",
      "title": "Agentic RAG Systems",
      "level": "Advanced",
      "mins": 60,
      "summary": "RAG where the model decides what to search, checks its own results, and tries again when the answer is weak.",
      "objectives": [
       "You can explain query rewriting, routing and multi-step retrieval",
       "You can build a self-checking retrieval loop",
       "You can combine multiple data sources behind one agent",
       "You can set limits so the loop stops and stays affordable"
      ]
     }
    ]
   },
   {
    "id": "m5s3",
    "title": "Agents & Systems",
    "topics": [
     {
      "id": "m5-agents",
      "title": "Agentic AI Workflows",
      "level": "Intermediate",
      "mins": 60,
      "summary": "An agent is a model in a loop with tools and a goal. Learn the ReAct pattern, planning, memory and multi-agent setups.",
      "objectives": [
       "You can explain the think-act-observe loop",
       "You can build a simple tool-using agent in C#",
       "You can add short-term and long-term memory",
       "You can design multi-agent workflows and know when not to use them"
      ]
     },
     {
      "id": "m5-langchain",
      "title": "LangChain & LangGraph",
      "level": "Intermediate",
      "mins": 75,
      "summary": "The most used Python frameworks for chains and agents. Learn their core ideas and build a graph-based agent with state and checkpoints.",
      "objectives": [
       "You can build a chain with prompts, models and parsers",
       "You can build a LangGraph graph with nodes, edges and state",
       "You can add tools, memory and human-in-the-loop steps",
       "You can explain how these ideas map to Semantic Kernel in .NET"
      ]
     },
     {
      "id": "m5-mcp",
      "title": "MCP Integration",
      "level": "Advanced",
      "mins": 60,
      "summary": "The Model Context Protocol: a standard way to give AI tools, data and prompts. Build an MCP server in .NET and connect clients.",
      "objectives": [
       "You can explain MCP servers, clients, tools, resources and prompts",
       "You can build an MCP server in C#",
       "You can connect an MCP server to an agent or an AI app",
       "You can secure and test an MCP server"
      ]
     },
     {
      "id": "m5-fullstack",
      "title": "Full Stack Gen AI Systems (.NET + Angular)",
      "level": "Advanced",
      "mins": 90,
      "summary": "Put it all together: an Angular chat UI, a .NET API with streaming, RAG and tools, auth, and the pieces around it.",
      "objectives": [
       "You can design the architecture of a production AI app",
       "You can stream tokens from .NET to Angular",
       "You can add conversation history, auth and rate limits",
       "You can deploy and monitor the full stack"
      ]
     },
     {
      "id": "m5-llmops",
      "title": "Evaluation, Guardrails & Observability",
      "level": "Advanced",
      "mins": 60,
      "summary": "How to know your AI feature works and keeps working: test sets, automated grading, safety guardrails, tracing and cost tracking.",
      "objectives": [
       "You can build an evaluation set and score outputs",
       "You can use an LLM as a judge carefully",
       "You can add input and output guardrails",
       "You can trace every call and track cost per feature"
      ]
     }
    ]
   },
   {
    "id": "m5s4",
    "title": "Forward Deployed Engineering",
    "topics": [
     {
      "id": "m5-discovery",
      "title": "Customer Discovery & Solution Scoping",
      "level": "Intermediate",
      "mins": 45,
      "summary": "Before building, find the real problem. Interview users, map workflows, pick a first use case and write a scope the customer agrees with.",
      "objectives": [
       "You can run a discovery interview and ask good questions",
       "You can map a business workflow and spot where AI helps",
       "You can rank use cases by value and feasibility",
       "You can write a one-page scope with success metrics"
      ]
     },
     {
      "id": "m5-delivery",
      "title": "FDE Delivery: POV to Production",
      "level": "Expert",
      "mins": 60,
      "summary": "The full journey of a forward deployed engineer: proof of value, pilot, hardening, handover, and the people skills that make it work.",
      "objectives": [
       "You can plan and run a time-boxed proof of value",
       "You can turn a POV into a production system with security and monitoring",
       "You can manage stakeholders and expectations",
       "You can hand over to the customer team with docs and training"
      ]
     }
    ]
   }
  ]
 },
 {
  "id": "m6",
  "num": 5,
  "title": "Elective Deep Dives: Networks, OS & Optimization",
  "short": "Electives",
  "tagline": "The computer science underneath it all: networks, operating systems and performance tuning.",
  "accent": "#ffb020",
  "sections": [
   {
    "id": "m6s1",
    "title": "Computer Networks",
    "topics": [
     {
      "id": "m6-osi-tcpip",
      "title": "OSI & TCP/IP Models",
      "level": "Beginner",
      "mins": 45,
      "summary": "The layers a message passes through from your app to the wire and back. A mental map for every networking topic.",
      "objectives": [
       "You can name the OSI layers and what each does",
       "You can map the TCP/IP model to the OSI model",
       "You can trace an HTTP request down and up the layers",
       "You can explain encapsulation and headers"
      ]
     },
     {
      "id": "m6-ip-dns-dhcp",
      "title": "IP, DNS & DHCP",
      "level": "Beginner",
      "mins": 45,
      "summary": "How devices get addresses, how names like google.com become numbers, and how your laptop joins a network.",
      "objectives": [
       "You can explain IPv4, IPv6, subnets and NAT",
       "You can explain the DNS lookup steps and record types",
       "You can explain how DHCP hands out addresses",
       "You can use ping, nslookup and traceroute"
      ]
     },
     {
      "id": "m6-tcp-udp",
      "title": "TCP vs UDP & the Handshake",
      "level": "Intermediate",
      "mins": 50,
      "summary": "Reliable ordered delivery (TCP) versus fast and loose (UDP), and the three-way handshake that starts every connection.",
      "objectives": [
       "You can explain the three-way handshake and connection close",
       "You can explain sequence numbers, ACKs and retransmission",
       "You can explain flow control and congestion control",
       "You can decide when UDP is the better choice"
      ]
     },
     {
      "id": "m6-http-https-tls",
      "title": "HTTP, HTTPS & TLS",
      "level": "Intermediate",
      "mins": 55,
      "summary": "The language of the web: methods, status codes, headers, cookies, and how TLS makes it private.",
      "objectives": [
       "You can explain HTTP methods, status codes and headers",
       "You can explain cookies, sessions and caching headers",
       "You can explain the TLS handshake and certificates",
       "You can read a request in the browser dev tools"
      ]
     },
     {
      "id": "m6-http2-http3-websockets",
      "title": "HTTP/2, HTTP/3 & WebSockets",
      "level": "Advanced",
      "mins": 50,
      "summary": "Newer protocols that make pages faster, and WebSockets for two-way real-time communication.",
      "objectives": [
       "You can explain multiplexing and header compression in HTTP/2",
       "You can explain QUIC and why HTTP/3 uses UDP",
       "You can explain how a WebSocket upgrade works",
       "You can compare WebSockets, SSE and long polling"
      ]
     },
     {
      "id": "m6-cdn-caching",
      "title": "CDNs & Web Caching",
      "level": "Intermediate",
      "mins": 45,
      "summary": "Serve content from a server near the user. Edge caching, cache headers, invalidation and what to put on a CDN.",
      "objectives": [
       "You can explain how a CDN routes a user to a nearby edge",
       "You can set Cache-Control, ETag and Expires correctly",
       "You can purge and version cached assets",
       "You can decide what should and should not go through a CDN"
      ]
     },
     {
      "id": "m6-network-security",
      "title": "Network Security Basics",
      "level": "Intermediate",
      "mins": 50,
      "summary": "Firewalls, VPNs, common attacks (DDoS, man-in-the-middle, spoofing) and the basics of keeping traffic safe.",
      "objectives": [
       "You can explain firewalls, security groups and VPNs",
       "You can explain DDoS, MITM and DNS spoofing and their defences",
       "You can explain symmetric vs asymmetric encryption",
       "You can explain zero trust in simple words"
      ]
     }
    ]
   },
   {
    "id": "m6s2",
    "title": "Operating Systems",
    "topics": [
     {
      "id": "m6-processes-threads",
      "title": "Processes & Threads",
      "level": "Beginner",
      "mins": 50,
      "summary": "A process is a running program; a thread is one line of work inside it. How the OS creates, switches and ends them.",
      "objectives": [
       "You can explain process vs thread and what each owns",
       "You can explain context switching and its cost",
       "You can explain process states and the lifecycle",
       "You can relate this to Task and ThreadPool in .NET"
      ]
     },
     {
      "id": "m6-cpu-scheduling",
      "title": "CPU Scheduling",
      "level": "Intermediate",
      "mins": 45,
      "summary": "How the OS decides which task gets the CPU next: FCFS, SJF, round robin, priority and multilevel queues.",
      "objectives": [
       "You can explain each scheduling algorithm with a timeline",
       "You can compute waiting and turnaround time",
       "You can explain preemption and starvation",
       "You can explain how this affects server latency"
      ]
     },
     {
      "id": "m6-memory-management",
      "title": "Memory Management & Virtual Memory",
      "level": "Intermediate",
      "mins": 55,
      "summary": "How programs get memory, how virtual addresses map to real ones, paging, page faults and thrashing.",
      "objectives": [
       "You can explain virtual vs physical memory",
       "You can explain paging, page tables and TLB",
       "You can explain page replacement (LRU, FIFO) and thrashing",
       "You can relate this to the .NET garbage collector and memory limits"
      ]
     },
     {
      "id": "m6-concurrency",
      "title": "Concurrency, Locks & Deadlocks",
      "level": "Advanced",
      "mins": 60,
      "summary": "When many threads touch the same data: race conditions, mutex, semaphore, and the four conditions of deadlock.",
      "objectives": [
       "You can explain race conditions and critical sections",
       "You can use lock, Mutex, SemaphoreSlim and Interlocked in C#",
       "You can explain the deadlock conditions and how to prevent them",
       "You can explain producer-consumer and reader-writer problems"
      ]
     },
     {
      "id": "m6-file-systems-io",
      "title": "File Systems & I/O",
      "level": "Intermediate",
      "mins": 45,
      "summary": "How files are stored and found on disk, blocking vs non-blocking I/O, and why async I/O matters for servers.",
      "objectives": [
       "You can explain inodes, directories and permissions",
       "You can explain buffered vs direct I/O",
       "You can explain blocking, non-blocking and async I/O",
       "You can explain why async I/O helps web servers scale"
      ]
     },
     {
      "id": "m6-linux",
      "title": "Linux Essentials for Developers",
      "level": "Beginner",
      "mins": 60,
      "summary": "The commands and ideas you need to run .NET apps in containers and on servers: files, permissions, processes, logs and networking tools.",
      "objectives": [
       "You can move around the file system and manage files",
       "You can manage permissions, users and processes",
       "You can read logs with grep, tail and journalctl",
       "You can write a small shell script",
       "You can inspect ports and network connections"
      ]
     }
    ]
   },
   {
    "id": "m6s3",
    "title": "Optimizations",
    "topics": [
     {
      "id": "m6-dotnet-performance",
      "title": ".NET Performance: GC, Span, async",
      "level": "Advanced",
      "mins": 70,
      "summary": "Make .NET code fast: how the garbage collector works, avoiding allocations with Span and ArrayPool, and async that actually scales.",
      "objectives": [
       "You can explain GC generations and server vs workstation GC",
       "You can cut allocations with Span, stackalloc and ArrayPool",
       "You can write async code that does not block threads",
       "You can benchmark with BenchmarkDotNet"
      ]
     },
     {
      "id": "m6-sql-optimization",
      "title": "SQL Query Optimization",
      "level": "Advanced",
      "mins": 60,
      "summary": "Deep dive on slow queries: execution plans, statistics, parameter sniffing, index tuning and query rewrites.",
      "objectives": [
       "You can read an execution plan and find the costly operator",
       "You can fix parameter sniffing and stale statistics",
       "You can rewrite queries to use indexes",
       "You can use the Query Store and missing index hints wisely"
      ]
     },
     {
      "id": "m6-angular-optimization",
      "title": "Angular Performance",
      "level": "Advanced",
      "mins": 55,
      "summary": "Deep dive on fast Angular: bundle analysis, change detection, image optimisation, SSR and hydration.",
      "objectives": [
       "You can analyse and shrink the bundle",
       "You can fix change detection hot spots",
       "You can use NgOptimizedImage and preloading",
       "You can enable SSR with hydration and measure Core Web Vitals"
      ]
     },
     {
      "id": "m6-profiling-tools",
      "title": "Profiling & Benchmarking Tools",
      "level": "Advanced",
      "mins": 50,
      "summary": "The tools that show where time goes: dotnet-trace, dotnet-counters, PerfView, browser performance tab, k6 and BenchmarkDotNet.",
      "objectives": [
       "You can capture and read a CPU and memory profile",
       "You can find a memory leak",
       "You can run a load test and read p95 latency",
       "You can set a performance budget and check it in CI"
      ]
     }
    ]
   }
  ]
 }
];
