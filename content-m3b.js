// DevPath content — Module 3: System Design / SQL (part 2: advanced)
// Topics: m3-sql-recursive-ctes, m3-sql-string-functions, m3-sql-window-ranking,
//         m3-sql-window-aggregates, m3-sql-indexes, m3-sql-transactions
// Sample schema used throughout: Customers, Orders, OrderItems, Products, Employees(ManagerId)
window.CONTENT = window.CONTENT || {};

/* ------------------------------------------------------------------ */
/* m3-sql-recursive-ctes — Recursive CTEs                               */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-recursive-ctes'] = {
  hook: `A normal query answers "who reports to Priya?". A recursive CTE answers "who reports to Priya, and who reports to them, and to them..." all the way down, in one statement.`,
  intro: `<p>A <span class="term">CTE</span> (Common Table Expression) is a named, temporary result you define at the top of a query with <code>WITH</code>. A <span class="term">recursive CTE</span> is a CTE that refers to itself. It starts with a first set of rows, then keeps adding rows that are built from the rows it already found, until nothing new appears.</p>
<p>This is the SQL tool for anything shaped like a tree or a chain: an org chart (employee → manager → manager's manager), a folder structure, a bill of materials (a bike is made of a frame, which is made of tubes, which are made of steel), a category tree in an online shop, or "find every page reachable from this page".</p>
<p>Before recursive CTEs, developers either wrote a loop in C# that queried the database again and again, or they guessed the maximum depth and wrote five self-joins. Both are slow and fragile. A recursive CTE lets the database walk the whole tree in one pass, and it works no matter how deep the tree is.</p>
<p>This lesson uses the <code>Employees</code> table with a <code>ManagerId</code> column that points to another row in the same table. That self-pointing column is the heart of every hierarchy.</p>`,
  realLife: {
    title: 'The phone tree in a school',
    body: `<p>A school has an emergency phone tree. The principal calls three head teachers. Each head teacher calls four teachers. Each teacher calls the parents in their class. Nobody has a list of everyone; each person only knows who they call next. To find out "who ends up being told?", you start at the principal (the anchor), then ask each person "who do you call?" (the recursive step), and keep going until you reach people who call nobody.</p>
<p>That is exactly a recursive CTE. The anchor is the starting row. The recursive member joins back to the table to find the next layer. The database repeats until a layer comes back empty.</p>
<p><strong>Where companies use this:</strong> HR systems show "everyone under this VP" for budgets and approvals. E-commerce sites (Amazon, Flipkart) store categories as a tree and use recursive queries to build the breadcrumb "Electronics › Phones › Android". Manufacturing ERPs (SAP) explode a product into every nut and bolt with a bill-of-materials recursion. Jira-style tools find all sub-tasks of an epic.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The two parts of a recursive CTE</h4>
<p>Every recursive CTE has the same shape:</p>
<ol>
<li>The <span class="term">anchor member</span>: a normal SELECT that returns the starting rows. For an org chart, that is "the CEO" (the employee whose <code>ManagerId</code> is NULL).</li>
<li>The <span class="term">recursive member</span>: a SELECT that joins the table to the CTE itself, to find the next layer. "Give me employees whose manager is someone already in my result."</li>
</ol>
<p>The two parts are glued with <code>UNION ALL</code>. The database runs the anchor once, then runs the recursive member again and again. Each run uses only the rows found in the previous run. It stops when a run returns zero rows.</p>
<h4>A mental picture</h4>
<p>Imagine building the result row by row on a whiteboard. Round 0: write the CEO. Round 1: write everyone who reports to the CEO. Round 2: write everyone who reports to someone from round 1. Round 3: ... and so on. When a round adds nobody, you are done. The final answer is all the rows from all rounds stacked together.</p>
<h4>Adding a level number</h4>
<p>It is very common to carry a counter. In the anchor you write <code>0 AS Level</code>. In the recursive member you write <code>e.Level + 1</code>. Now every row knows how deep it is, and you can indent names in a report or stop at a chosen depth with <code>WHERE Level &lt; 5</code>.</p>
<div class="callout tip">Think of the recursive member as "one more step", not "the whole walk". The database does the repeating for you. If your recursive SELECT would make sense for a single step, it is correct.</div>
<h4>Where you will use it</h4>
<ul>
<li>"Show the whole team under manager 42."</li>
<li>"Show the path of folders from the root to this file."</li>
<li>"List all sub-categories of Electronics."</li>
<li>"Generate the numbers 1 to 1000 without a table" (yes, a recursive CTE can do that too).</li>
</ul>
<div class="callout warn">The CTE must use <code>UNION ALL</code>, not <code>UNION</code>, between the anchor and the recursive member in SQL Server. Also, both parts must return the same columns with matching types; a mismatch like <code>VARCHAR(10)</code> in the anchor and a longer string in the recursive part causes an error, so cast explicitly.</div>` },
    { name: 'Intermediate', body: `<h4>The full pattern, line by line</h4>
<p>Here is the org chart query (the full version is in the code tab):</p>
<ul>
<li><code>WITH OrgChart AS (</code> names the CTE.</li>
<li>Anchor: <code>SELECT Id, Name, ManagerId, 0 AS Level, CAST(Name AS NVARCHAR(4000)) AS Path FROM Employees WHERE ManagerId IS NULL</code>.</li>
<li><code>UNION ALL</code></li>
<li>Recursive: <code>SELECT e.Id, e.Name, e.ManagerId, oc.Level + 1, CAST(oc.Path + ' &gt; ' + e.Name AS NVARCHAR(4000)) FROM Employees e JOIN OrgChart oc ON e.ManagerId = oc.Id</code>.</li>
<li><code>)</code> then a normal <code>SELECT ... FROM OrgChart ORDER BY Path</code>.</li>
</ul>
<p>The <span class="term">Path</span> column is a nice trick: it builds a readable breadcrumb like "CEO &gt; Priya &gt; Arjun" as the recursion walks down. Ordering by it prints the tree in a natural order.</p>
<h4>Walking up instead of down</h4>
<p>To find all managers above one employee (the chain of command), flip the join. Anchor on the employee, then join <code>Employees e ON e.Id = chain.ManagerId</code>. Each round moves one level up until <code>ManagerId</code> is NULL.</p>
<h4>Generating a number or date series</h4>
<p>Need a row for every day in a month, even days with no orders? Anchor with the first date, recursive member adds one day while the date is before the end. Then LEFT JOIN your orders to it. This is the standard way to make a report show "0 orders on Sunday" instead of skipping Sunday.</p>
<h4>MAXRECURSION</h4>
<p>SQL Server stops after 100 rounds by default and raises an error. That protects you from infinite loops. For a deep hierarchy or a long date range, raise it with <code>OPTION (MAXRECURSION 1000)</code> at the end of the statement. <code>OPTION (MAXRECURSION 0)</code> removes the limit entirely; only use that when you have your own stop condition in the WHERE clause.</p>
<h4>PostgreSQL differences</h4>
<ul>
<li>You must write <code>WITH RECURSIVE name AS (...)</code>. SQL Server does not use the word RECURSIVE.</li>
<li>PostgreSQL has no MAXRECURSION; it relies on your WHERE condition. It does offer <code>CYCLE</code> and <code>SEARCH DEPTH FIRST BY ... SET</code> clauses (PostgreSQL 14+) that detect loops and order the tree for you.</li>
<li>String concatenation is <code>||</code> instead of <code>+</code>.</li>
</ul>
<div class="callout idea">A recursive CTE is a loop the database runs for you. Everything you know about loops applies: it needs a start, a step, and a stop.</div>` },
    { name: 'Expert', body: `<h4>How the engine actually runs it</h4>
<p>SQL Server does not expand the recursion into one giant plan. It uses a <em>spool</em>: a working table that holds the rows from the latest round. The recursive member is executed against that spool, its output becomes the next spool, and the previous rows are appended to the final result. This means each round only sees the rows from the round before it, not the whole result so far. That is why a recursive CTE can find the same row twice if your data has two paths to it (a diamond in the graph).</p>
<h4>Cycle protection</h4>
<p>If an employee's manager chain loops (A manages B, B manages A, because of bad data), the CTE never ends and MAXRECURSION fires. Defend in two ways:</p>
<ul>
<li><strong>Carry the path and check it.</strong> Store the visited ids in a string like <code>'/1/5/9/'</code> and in the recursive member add <code>WHERE oc.IdPath NOT LIKE '%/' + CAST(e.Id AS VARCHAR) + '/%'</code>. A row already on the path is not visited again.</li>
<li><strong>Prevent the loop at write time.</strong> Before updating <code>ManagerId</code>, run an upward recursive query from the new manager and reject the change if it reaches the employee being edited. Many HR systems do this in the service layer in C#.</li>
</ul>
<h4>Performance notes</h4>
<ul>
<li>Index <code>Employees(ManagerId) INCLUDE (Name)</code>. Every round does a lookup by ManagerId; without the index, every round scans the whole table.</li>
<li>Recursive CTEs are row-at-a-time by nature. For very large trees that change rarely (categories, org charts), many teams precompute a <span class="term">closure table</span> (every ancestor-descendant pair) or store a <span class="term">materialized path</span> (<code>'/1/5/9/'</code>) or use SQL Server's <code>hierarchyid</code> type. Reads become a simple LIKE or range query. Writes get more expensive.</li>
<li>The optimizer cannot estimate how many rows a recursion will produce, so it often guesses badly. If a recursive CTE feeds a complex join, materialize it into a temp table first, then join.</li>
</ul>
<h4>Bill of materials with quantities</h4>
<p>A product is built from parts, each part has a quantity, and parts can have their own parts. To get the total number of screws in a bike, carry a multiplied quantity: anchor <code>Qty</code> is 1, recursive member uses <code>parent.TotalQty * child.QtyPerParent</code>. At the end, <code>SUM(TotalQty) GROUP BY PartId</code>. This is the classic manufacturing query and interviewers love it.</p>
<h4>Interview angle</h4>
<p>You will be asked to explain anchor vs recursive member, why UNION ALL, how to stop infinite loops, and how a recursive CTE differs from a self-join (a self-join handles exactly one fixed depth; recursion handles any depth). Be ready to write the org chart query from memory.</p>
<div class="callout warn">Recursive CTEs cannot use GROUP BY, DISTINCT, TOP, aggregates or LEFT OUTER JOIN to the CTE inside the recursive member in SQL Server. Do the aggregation in the final SELECT outside the CTE.</div>` }
  ],
  flow: {
    title: 'How the database walks an org chart',
    steps: [
      { title: 'Run the anchor', desc: 'The anchor SELECT runs once. It finds the CEO (ManagerId IS NULL) and puts that one row into the working set, with Level 0.' },
      { title: 'Join back to the CTE', desc: 'The recursive member joins Employees to the current working set: "whose ManagerId equals an Id in the working set?" It finds the CEO\'s direct reports.' },
      { title: 'Append and replace', desc: 'Those new rows (Level 1) are appended to the final result. The working set is replaced with only these new rows.' },
      { title: 'Repeat one step', desc: 'The recursive member runs again, now against the Level 1 rows, finding Level 2. The Path string grows with each step.' },
      { title: 'A round returns nothing', desc: 'Eventually a round finds employees who manage nobody. The next round returns zero rows. Recursion stops here, or at MAXRECURSION if a loop exists.' },
      { title: 'Final SELECT', desc: 'The outer query reads all rounds stacked together and orders by Path, so the result prints like an indented tree.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'Org chart: walk down from the CEO with level and path', code: `-- SQL Server (T-SQL). Employees(Id, Name, ManagerId, Title)
WITH OrgChart AS
(
    -- Anchor member: the top of the tree
    SELECT  e.Id,
            e.Name,
            e.ManagerId,
            0 AS Level,
            CAST(e.Name AS NVARCHAR(4000))            AS Path,
            CAST('/' + CAST(e.Id AS VARCHAR(10)) + '/' AS VARCHAR(4000)) AS IdPath
    FROM    Employees e
    WHERE   e.ManagerId IS NULL

    UNION ALL

    -- Recursive member: one more step down
    SELECT  e.Id,
            e.Name,
            e.ManagerId,
            oc.Level + 1,
            CAST(oc.Path + ' > ' + e.Name AS NVARCHAR(4000)),
            CAST(oc.IdPath + CAST(e.Id AS VARCHAR(10)) + '/' AS VARCHAR(4000))
    FROM    Employees e
    JOIN    OrgChart oc ON e.ManagerId = oc.Id
    -- cycle protection: never revisit an id already on the path
    WHERE   oc.IdPath NOT LIKE '%/' + CAST(e.Id AS VARCHAR(10)) + '/%'
)
SELECT  REPLICATE('   ', Level) + Name AS IndentedName,
        Level,
        Path
FROM    OrgChart
ORDER BY Path
OPTION (MAXRECURSION 500);   -- default is 100 rounds

-- PostgreSQL version of the header and concatenation:
-- WITH RECURSIVE OrgChart AS ( ... oc.Path || ' > ' || e.Name ... )` },
    { lang: 'sql', title: 'Walk up (chain of command) and a date series for reports', code: `-- 1) Everyone above employee 42, nearest manager first
WITH Chain AS
(
    SELECT Id, Name, ManagerId, 0 AS StepsUp
    FROM   Employees
    WHERE  Id = 42

    UNION ALL

    SELECT m.Id, m.Name, m.ManagerId, c.StepsUp + 1
    FROM   Employees m
    JOIN   Chain c ON m.Id = c.ManagerId     -- note: join on the manager side
)
SELECT Name, StepsUp
FROM   Chain
WHERE  StepsUp > 0
ORDER BY StepsUp;

-- 2) One row per day in November 2026, even days with zero orders
DECLARE @From DATE = '2026-11-01', @To DATE = '2026-11-30';

WITH Days AS
(
    SELECT @From AS Day
    UNION ALL
    SELECT DATEADD(DAY, 1, Day)
    FROM   Days
    WHERE  Day < @To                         -- the stop condition
)
SELECT  d.Day,
        COUNT(o.Id)                 AS Orders,
        ISNULL(SUM(o.Total), 0)     AS Revenue
FROM    Days d
LEFT JOIN Orders o ON CAST(o.OrderDate AS DATE) = d.Day
GROUP BY d.Day
ORDER BY d.Day
OPTION (MAXRECURSION 366);` },
    { lang: 'sql', title: 'Bill of materials: total quantity of every part in product 1', code: `-- Parts(Id, Name), PartLinks(ParentId, ChildId, Qty)
WITH Explode AS
(
    SELECT  pl.ParentId, pl.ChildId,
            CAST(pl.Qty AS BIGINT) AS TotalQty,
            1 AS Depth
    FROM    PartLinks pl
    WHERE   pl.ParentId = 1                   -- the finished product

    UNION ALL

    SELECT  pl.ParentId, pl.ChildId,
            CAST(ex.TotalQty * pl.Qty AS BIGINT),   -- multiply down the tree
            ex.Depth + 1
    FROM    PartLinks pl
    JOIN    Explode ex ON pl.ParentId = ex.ChildId
    WHERE   ex.Depth < 50                      -- safety stop
)
SELECT  p.Name,
        SUM(ex.TotalQty) AS NeededQty          -- aggregate OUTSIDE the CTE
FROM    Explode ex
JOIN    Parts p ON p.Id = ex.ChildId
GROUP BY p.Name
ORDER BY NeededQty DESC;` }
  ],
  pitfalls: [
    'Forgetting the stop condition in a generated series (no WHERE Day < @To) and hitting the MAXRECURSION error, or an endless loop in PostgreSQL.',
    'Using UNION instead of UNION ALL. SQL Server requires UNION ALL; UNION also silently hides legitimate duplicate rows.',
    'Column type mismatch between anchor and recursive member (a short VARCHAR in the anchor, a longer concatenation later). Always CAST both sides to the same type and length.',
    'No index on the join column (ManagerId). Each round becomes a full table scan, and a 20-level tree means 20 scans.',
    'Bad data with cycles (A manages B, B manages A). Carry an IdPath and check NOT LIKE, or validate at write time.',
    'Putting GROUP BY or DISTINCT inside the recursive member. Aggregate in the outer query instead.'
  ],
  quiz: [
    { q: 'What does the anchor member of a recursive CTE do?', options: ['Joins the CTE back to itself on every round', 'Returns the starting rows, exactly once', 'Limits how deep the recursion can go', 'Sorts the final result by level'], answer: 1, why: 'The anchor runs once and gives the first set of rows (for example, the CEO). The recursive member then builds each next layer from the previous one.' },
    { q: 'When does a recursive CTE stop on its own?', options: ['After exactly 100 rows', 'When the recursive member returns zero new rows', 'When it reaches the last row of the table', 'It never stops without MAXRECURSION'], answer: 1, why: 'Each round feeds only the rows from the previous round. When a round produces nothing, there is nothing to feed the next round, so it stops. MAXRECURSION is only a safety net.' },
    { q: 'Which keyword must separate the anchor and recursive members in SQL Server?', options: ['UNION', 'UNION ALL', 'INTERSECT', 'JOIN'], answer: 1, why: 'SQL Server requires UNION ALL. UNION would also need to compare rows for duplicates every round, which recursion does not support.' },
    { q: 'How does PostgreSQL differ when writing a recursive CTE?', options: ['It does not support recursion', 'You must write WITH RECURSIVE', 'It requires OPTION (MAXRECURSION n)', 'The anchor must come last'], answer: 1, why: 'PostgreSQL needs the explicit RECURSIVE keyword and has no MAXRECURSION option; your WHERE condition is the stop.' },
    { q: 'Your org chart data accidentally has A managing B and B managing A. What is the safest fix inside the query?', options: ['Use UNION instead of UNION ALL', 'Set MAXRECURSION 0 so the query is allowed to finish', 'Carry a path of visited ids and skip repeats', 'Add ORDER BY inside the CTE so rows are visited once'], answer: 2, why: 'Tracking visited ids in a path column and filtering with NOT LIKE prevents revisiting, so the loop cannot continue. MAXRECURSION 0 would make it run forever.' },
    { q: 'Why is a recursive CTE better than five self-joins for an org chart?', options: ['It is always faster than any number of joins', 'It works for any depth, not a fixed one', 'It needs no index on the ManagerId column', 'It can use GROUP BY inside the recursive part'], answer: 1, why: 'Self-joins handle a fixed number of levels. Recursion keeps going until the data runs out, whatever the depth.' }
  ],
  takeaways: [
    'A recursive CTE = anchor (start rows) + UNION ALL + recursive member (one more step) + a stop condition.',
    'Carry a Level counter and a Path string; they make results readable and let you limit depth.',
    'Each round sees only the previous round\'s rows, so diamonds in the data can produce duplicate rows.',
    'Protect against cycles with an IdPath check, and against runaway queries with MAXRECURSION.',
    'Index the join column (ManagerId) or every round becomes a table scan.',
    'For huge, rarely changing trees, consider a closure table, materialized path or hierarchyid instead of recursing on every read.'
  ],
  interview: [
    { q: 'Explain how a recursive CTE works and when you would use one.', a: `<p>It has an anchor query that returns starting rows, and a recursive query that joins back to the CTE to find the next layer. The engine repeats the recursive part until it returns no rows, then unions all rounds. Use it for data shaped like a tree or chain: org charts, category trees, folder paths, bills of materials, or generating a series of numbers or dates.</p>` },
    { q: 'How do you prevent an infinite loop in a recursive CTE?', a: `<p>Three layers: a real stop condition in the recursive member (WHERE Level &lt; n or Day &lt; @To), a visited-path check (store ids in a path string and filter with NOT LIKE) to handle cyclic data, and MAXRECURSION as a last safety net in SQL Server. In PostgreSQL 14+ the CYCLE clause can detect loops for you.</p>` },
    { q: 'What is the difference between a recursive CTE and a self-join?', a: `<p>A self-join handles exactly one more level per join, so you must know the depth in advance. A recursive CTE handles any depth with one query. For a known, shallow depth a self-join can be faster because the optimizer can estimate it well.</p>` },
    { q: 'How would you make an org chart query fast for a company with 200,000 employees?', a: `<p>Index Employees(ManagerId) INCLUDE (Name). If the chart is read far more than it changes, precompute a closure table or store a materialized path so "everyone under X" becomes a LIKE '/x/%' range query. Cache hot subtrees in the application. Keep the recursive CTE for writes and validation.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m3-sql-string-functions — Advanced String Functions                 */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-string-functions'] = {
  hook: `Half of real-world SQL is cleaning text: trimming spaces, splitting "Last, First", pulling the domain out of an email. The functions are small, but knowing them saves hours of C# post-processing.`,
  intro: `<p>Databases store a lot of text: names, emails, addresses, product codes, JSON blobs, log lines. <span class="term">String functions</span> are the built-in tools SQL gives you to measure, cut, search, replace and join that text inside the query, before it ever reaches your application.</p>
<p>Why do this in SQL instead of C#? Three reasons. First, filtering and grouping on cleaned text must happen in the database, or you pull millions of rows just to throw most away. Second, reports and data fixes are often run by people who only have SQL. Third, a one-off cleanup script in SQL is faster to write and run than a console app.</p>
<p>This lesson covers the T-SQL (SQL Server) functions a .NET developer uses every week, with the PostgreSQL equivalents next to them, because the two differ in annoying small ways. You will also learn the two newer functions that changed how we handle lists: <code>STRING_SPLIT</code> and <code>STRING_AGG</code>.</p>`,
  realLife: {
    title: 'The messy customer import',
    body: `<p>A sales team hands you a spreadsheet of 50,000 leads. Names are typed as "SHARMA, priya " with trailing spaces and random capitals. Emails are in mixed case. Phone numbers have dashes, brackets and spaces. Tags are stored as "vip;newsletter;trial" in one column. Your job: load it into Customers, split the names properly, make emails lowercase, strip phone formatting, and turn that tag string into rows.</p>
<p>You could write a C# importer with Regex and loops. Or you can load the raw sheet into a staging table and clean it with a handful of SQL string functions in one statement, then review the result before inserting. Most data teams do the second: it is visible, repeatable, and works for the next import too.</p>
<p><strong>Where companies use this:</strong> CRM imports (Salesforce, HubSpot migrations), address normalisation at delivery companies, matching customer records across systems in banks ("is J. Smith the same as JOHN SMITH?"), and building search-friendly columns in product catalogues.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Measure and cut</h4>
<ul>
<li><code>LEN(s)</code>: number of characters, ignoring trailing spaces. PostgreSQL: <code>LENGTH(s)</code> (counts trailing spaces too).</li>
<li><code>LEFT(s, n)</code> / <code>RIGHT(s, n)</code>: first or last n characters. "PRJ-2026-0042" → <code>LEFT(code, 3)</code> is "PRJ".</li>
<li><code>SUBSTRING(s, start, length)</code>: a slice. <strong>Start is 1-based</strong>, not 0 like C#. <code>SUBSTRING('abcdef', 2, 3)</code> is "bcd".</li>
</ul>
<h4>Search</h4>
<ul>
<li><code>CHARINDEX(find, s)</code>: position of the first match, or 0 if not found. <code>CHARINDEX('@', 'a@b.com')</code> is 2. PostgreSQL: <code>POSITION('@' IN s)</code> or <code>STRPOS(s, '@')</code>.</li>
<li><code>PATINDEX('%pattern%', s)</code>: like CHARINDEX but with wildcards. Finds "the first digit" with <code>PATINDEX('%[0-9]%', s)</code>.</li>
<li><code>LIKE</code> in WHERE: <code>%</code> any text, <code>_</code> one character, <code>[0-9]</code> a character range (SQL Server only; PostgreSQL uses <code>SIMILAR TO</code> or regex <code>~</code>).</li>
</ul>
<h4>Clean</h4>
<ul>
<li><code>TRIM(s)</code>, <code>LTRIM</code>, <code>RTRIM</code>: remove spaces at the ends. SQL Server 2017+ also allows <code>TRIM('-' FROM s)</code> for other characters.</li>
<li><code>UPPER(s)</code> / <code>LOWER(s)</code>: change case. Use LOWER on emails before comparing or storing.</li>
<li><code>REPLACE(s, old, new)</code>: swap every occurrence. Chain it: <code>REPLACE(REPLACE(phone, '-', ''), ' ', '')</code>.</li>
<li><code>REVERSE(s)</code>: flip the string. Handy with CHARINDEX to find the <em>last</em> occurrence.</li>
</ul>
<h4>Join</h4>
<ul>
<li><code>CONCAT(a, b, c)</code>: joins values and treats NULL as empty. With <code>+</code>, a single NULL makes the whole result NULL. Prefer CONCAT.</li>
<li><code>CONCAT_WS(', ', a, b, c)</code>: joins with a separator and skips NULLs. Perfect for addresses where line 2 is often empty.</li>
</ul>
<div class="callout tip">Remember the two surprises for C# developers: positions start at 1, and <code>+</code> with NULL gives NULL. Both cause silent bugs rather than errors.</div>` },
    { name: 'Intermediate', body: `<h4>Parsing an email</h4>
<p>Username: everything before the @. Domain: everything after it.</p>
<ul>
<li><code>LEFT(email, CHARINDEX('@', email) - 1)</code> gives the username.</li>
<li><code>SUBSTRING(email, CHARINDEX('@', email) + 1, LEN(email))</code> gives the domain. Passing a length longer than needed is fine; SUBSTRING just takes what is there.</li>
<li>Guard against bad data: wrap in <code>CASE WHEN CHARINDEX('@', email) &gt; 0 THEN ... ELSE NULL END</code>, because <code>LEFT(email, -1)</code> throws an error.</li>
</ul>
<h4>Parsing "Last, First"</h4>
<p>Last name: <code>TRIM(LEFT(full, CHARINDEX(',', full) - 1))</code>. First name: <code>TRIM(SUBSTRING(full, CHARINDEX(',', full) + 1, LEN(full)))</code>. Then fix the case: there is no built-in "proper case" in T-SQL, so use <code>UPPER(LEFT(x,1)) + LOWER(SUBSTRING(x,2,LEN(x)))</code>. PostgreSQL has <code>INITCAP(x)</code> built in.</p>
<h4>Finding the last occurrence</h4>
<p>To get the file name from a path like <code>C:\\reports\\2026\\q3.pdf</code>, reverse the string, find the first backslash, and take that many characters from the right: <code>RIGHT(path, CHARINDEX('\\', REVERSE(path)) - 1)</code>.</p>
<h4>STRING_SPLIT: one column of tags → many rows</h4>
<p><code>STRING_SPLIT('vip;newsletter;trial', ';')</code> is a table-valued function returning a column named <code>value</code>, one row per piece. Use it with <code>CROSS APPLY</code> to split a column for every row of a table. SQL Server 2022 added an optional third argument <code>enable_ordinal = 1</code> that returns the position too; before that, order is not guaranteed. PostgreSQL: <code>regexp_split_to_table(s, ';')</code> or <code>unnest(string_to_array(s, ';'))</code>.</p>
<h4>STRING_AGG: many rows → one string</h4>
<p>The reverse. <code>STRING_AGG(ProductName, ', ') WITHIN GROUP (ORDER BY ProductName)</code> turns the items of an order into "Keyboard, Monitor, Mouse". Before SQL Server 2017 people used an ugly <code>FOR XML PATH</code> trick; you will still see it in old code. PostgreSQL: <code>STRING_AGG(name, ', ' ORDER BY name)</code>.</p>
<h4>FORMAT and TRANSLATE</h4>
<ul>
<li><code>FORMAT(1234567.891, 'N2')</code> → "1,234,567.89". <code>FORMAT(date, 'dd MMM yyyy')</code>. It uses .NET format strings, which you already know, but it is slow on large sets; use it for final display only.</li>
<li><code>TRANSLATE(phone, '()- ', '    ')</code> replaces each character in the second list with the matching character in the third, in one call. Combine with REPLACE to remove them: <code>REPLACE(TRANSLATE(phone, '()-', '   '), ' ', '')</code>.</li>
</ul>
<div class="callout warn">Functions on a column in WHERE (like <code>WHERE LOWER(Email) = 'x'</code>) stop the index from being used. Store a cleaned copy of the column (or a computed column) and index that. The Indexes lesson explains why.</div>` },
    { name: 'Expert', body: `<h4>Collation: the hidden setting behind every comparison</h4>
<p>Whether <code>'Priya' = 'PRIYA'</code> is true depends on the column's <span class="term">collation</span>. SQL Server databases usually default to a case-insensitive collation (names ending in <code>_CI_AS</code>: case-insensitive, accent-sensitive). PostgreSQL is case-sensitive by default. That is why the same query behaves differently on the two engines, and why <code>LOWER()</code> is everywhere in Postgres code. You can force a collation per comparison: <code>WHERE Name COLLATE Latin1_General_CS_AS = 'Priya'</code>. Mixing collations in a join raises an error; it bites when you join a temp table to a user table on a different server default.</p>
<h4>Unicode, bytes and LEN</h4>
<p><code>VARCHAR</code> stores 8-bit characters in the column's code page; <code>NVARCHAR</code> stores UTF-16. <code>LEN</code> counts characters; <code>DATALENGTH</code> counts bytes. An emoji is one "character" to a user but two UTF-16 code units, so <code>LEN(N'😀')</code> returns 2. If you store Hindi, Arabic or emoji, use NVARCHAR and the <code>N'...'</code> prefix for literals, or data is silently replaced with '?'. SQL Server 2019+ supports UTF-8 collations on VARCHAR, which halves storage for mostly-ASCII text.</p>
<h4>Performance rules</h4>
<ul>
<li>Any function wrapped around a column in a WHERE or JOIN makes the predicate <span class="term">non-SARGable</span>: the index cannot be seeked. <code>WHERE LEFT(Code,3) = 'PRJ'</code> scans; <code>WHERE Code LIKE 'PRJ%'</code> seeks. Leading-wildcard LIKE (<code>'%abc'</code>) always scans.</li>
<li>Full-text search (<code>CONTAINS</code>, <code>FREETEXT</code>) or PostgreSQL <code>tsvector</code> indexes are the right tool for "find documents containing this word". LIKE '%word%' is a table scan every time.</li>
<li><code>FORMAT</code> is CLR-based and 10 to 50 times slower than <code>CONVERT</code> with a style code. Never put it in a WHERE or on a million-row result.</li>
<li>Store cleaned values once. Add a persisted computed column <code>EmailLower AS LOWER(Email) PERSISTED</code> and index it, instead of lowering on every query.</li>
</ul>
<h4>Regular expressions</h4>
<p>T-SQL has no regex functions before SQL Server 2025 (which adds <code>REGEXP_LIKE</code>, <code>REGEXP_REPLACE</code> and friends; check your version). Older servers use PATINDEX with character classes, or a SQL CLR function, or do it in C#. PostgreSQL has had <code>~</code>, <code>regexp_replace</code>, <code>regexp_matches</code> and <code>regexp_split_to_table</code> for years, which is a real advantage for text-heavy workloads.</p>
<h4>JSON is text too</h4>
<p>Both engines parse JSON stored in text columns: SQL Server with <code>JSON_VALUE(doc, '$.customer.email')</code>, <code>JSON_QUERY</code>, <code>OPENJSON</code> (JSON → rows) and <code>FOR JSON</code> (rows → JSON); PostgreSQL with <code>jsonb</code> operators like <code>doc-&gt;&gt;'email'</code> and GIN indexes on jsonb. For a .NET API returning JSON, <code>FOR JSON PATH</code> can build the response directly in the query.</p>
<div class="callout idea">Interviewers often ask: "How would you find customers whose email domain appears more than 100 times?" Answer: compute the domain with SUBSTRING/CHARINDEX in a CTE, then GROUP BY domain HAVING COUNT(*) &gt; 100. Then they ask how to make it fast: a persisted computed column for the domain with an index.</div>` }
  ],
  flow: {
    title: 'Cleaning one messy lead row, function by function',
    steps: [
      { title: 'Raw row arrives', desc: 'FullName = "SHARMA, priya  ", Email = "Priya.S@Example.COM", Phone = "(091) 98765-43210", Tags = "vip;newsletter;trial".' },
      { title: 'TRIM the ends', desc: 'TRIM(FullName) removes the trailing spaces so later positions are correct: "SHARMA, priya".' },
      { title: 'CHARINDEX finds the comma', desc: 'CHARINDEX(\',\', name) = 7. LEFT(name, 6) is the last name "SHARMA"; SUBSTRING from position 8 is " priya", trimmed to "priya".' },
      { title: 'Fix the case', desc: 'UPPER(LEFT(x,1)) + LOWER(SUBSTRING(x,2,LEN(x))) turns "SHARMA" into "Sharma" and "priya" into "Priya".' },
      { title: 'LOWER the email', desc: 'LOWER(Email) gives "priya.s@example.com". SUBSTRING after CHARINDEX(\'@\') extracts the domain "example.com" for grouping.' },
      { title: 'TRANSLATE + REPLACE the phone', desc: 'TRANSLATE swaps ( ) - for spaces, REPLACE removes the spaces: "(091) 98765-43210" becomes "0919876543210".' },
      { title: 'STRING_SPLIT the tags', desc: 'CROSS APPLY STRING_SPLIT(Tags, \';\') produces three rows: vip, newsletter, trial, ready to insert into CustomerTags.' },
      { title: 'STRING_AGG to report back', desc: 'For the review screen, STRING_AGG(tag, \', \') joins them again into one line per customer.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'Clean a staging table of leads (T-SQL)', code: `-- StagingLeads(FullName, Email, Phone, Tags) loaded raw from the spreadsheet
WITH Cleaned AS
(
    SELECT
        -- "SHARMA, priya  "  ->  LastName / FirstName
        TRIM(LEFT(FullName, CHARINDEX(',', FullName + ',') - 1))                 AS LastRaw,
        TRIM(SUBSTRING(FullName, CHARINDEX(',', FullName + ',') + 1, LEN(FullName))) AS FirstRaw,
        LOWER(TRIM(Email))                                                      AS Email,
        -- strip ( ) - and spaces from the phone
        REPLACE(TRANSLATE(Phone, '()-', '   '), ' ', '')                        AS PhoneDigits,
        Tags
    FROM StagingLeads
)
SELECT
    -- proper case: first letter upper, rest lower (T-SQL has no INITCAP)
    UPPER(LEFT(LastRaw, 1))  + LOWER(SUBSTRING(LastRaw, 2, LEN(LastRaw)))   AS LastName,
    UPPER(LEFT(FirstRaw, 1)) + LOWER(SUBSTRING(FirstRaw, 2, LEN(FirstRaw))) AS FirstName,
    Email,
    CASE WHEN CHARINDEX('@', Email) > 0
         THEN SUBSTRING(Email, CHARINDEX('@', Email) + 1, LEN(Email))
         ELSE NULL END                                                        AS EmailDomain,
    PhoneDigits,
    LEN(PhoneDigits)                                                          AS PhoneLength,
    CONCAT_WS(' ', FirstRaw, LastRaw)                                          AS DisplayName   -- skips NULLs
FROM Cleaned
WHERE Email LIKE '%_@_%.__%';        -- rough "looks like an email" filter

-- Note the trick: CHARINDEX(',', FullName + ',') never returns 0,
-- so LEFT(..., -1) can never throw on a name without a comma.` },
    { lang: 'sql', title: 'STRING_SPLIT and STRING_AGG: tags in and out', code: `-- 1) Split "vip;newsletter;trial" into one row per tag, per customer
INSERT INTO CustomerTags (CustomerId, Tag)
SELECT  c.Id,
        TRIM(s.value)
FROM    Customers c
CROSS APPLY STRING_SPLIT(c.TagsCsv, ';') AS s
WHERE   TRIM(s.value) <> '';

-- SQL Server 2022+: keep the original position
-- SELECT value, ordinal FROM STRING_SPLIT('a;b;c', ';', 1);

-- 2) Join them back: one line per customer, tags sorted
SELECT  c.Id,
        c.Email,
        STRING_AGG(t.Tag, ', ') WITHIN GROUP (ORDER BY t.Tag) AS TagList,
        COUNT(t.Tag)                                           AS TagCount
FROM    Customers c
LEFT JOIN CustomerTags t ON t.CustomerId = c.Id
GROUP BY c.Id, c.Email;

-- 3) Products per order as one string, for an invoice email
SELECT  o.Id AS OrderId,
        STRING_AGG(CONCAT(p.Name, ' x', oi.Quantity), '; ')
            WITHIN GROUP (ORDER BY p.Name)                      AS Items
FROM    Orders o
JOIN    OrderItems oi ON oi.OrderId = o.Id
JOIN    Products p    ON p.Id = oi.ProductId
GROUP BY o.Id;

-- PostgreSQL equivalents:
-- unnest(string_to_array(tags_csv, ';'))   or   regexp_split_to_table(tags_csv, ';')
-- STRING_AGG(tag, ', ' ORDER BY tag)
-- INITCAP(name) for proper case; LENGTH() instead of LEN(); || for concatenation` },
    { lang: 'sql', title: 'Last occurrence, PATINDEX and FORMAT', code: `DECLARE @Path NVARCHAR(260) = N'C:\\reports\\2026\\q3-sales.pdf';

-- File name = everything after the LAST backslash
SELECT RIGHT(@Path, CHARINDEX('\\', REVERSE(@Path)) - 1)            AS FileName,
       LEFT(@Path, LEN(@Path) - CHARINDEX('\\', REVERSE(@Path)))     AS Folder,
       RIGHT(@Path, CHARINDEX('.', REVERSE(@Path)) - 1)             AS Extension;

-- PATINDEX: position of the first digit in a product code
SELECT Code,
       PATINDEX('%[0-9]%', Code)                                   AS FirstDigitAt,
       LEFT(Code, PATINDEX('%[0-9]%', Code) - 1)                   AS Prefix
FROM   Products
WHERE  PATINDEX('%[0-9]%', Code) > 0;

-- FORMAT: display only, uses .NET format strings (slow on big sets)
SELECT FORMAT(Total, 'N2')               AS TotalText,     -- 1,234,567.89
       FORMAT(OrderDate, 'dd MMM yyyy')  AS DateText,      -- 05 Nov 2026
       FORMAT(Total, 'C', 'en-IN')       AS Rupees         -- culture-aware currency
FROM   Orders
WHERE  Id = 1001;

-- Faster alternative for dates on large result sets:
-- CONVERT(VARCHAR(10), OrderDate, 120)   -> 2026-11-05` }
  ],
  pitfalls: [
    'Treating SUBSTRING as 0-based like C#. SQL positions start at 1; SUBSTRING(s, 0, 3) silently returns only 2 characters.',
    'Using + to join strings when a value can be NULL. One NULL makes the whole result NULL. Use CONCAT or CONCAT_WS.',
    'Calling LEFT(s, CHARINDEX(x, s) - 1) when x is missing: CHARINDEX returns 0, LEFT gets -1 and throws. Append the delimiter (s + x) or guard with CASE.',
    'Wrapping an indexed column in LOWER(), LEFT() or TRIM() inside WHERE. The index cannot be used and the query scans the table.',
    'Assuming case-insensitive comparison everywhere. SQL Server usually is; PostgreSQL is not. Normalise with LOWER when storing emails and usernames.',
    'Using FORMAT() on large results or in WHERE. It is far slower than CONVERT with a style code.'
  ],
  quiz: [
    { q: 'What does SUBSTRING(\'DevPath\', 1, 3) return in T-SQL?', options: ['evP', 'Dev', 'DevP', 'An error'], answer: 1, why: 'Positions start at 1 in SQL, so 1,3 takes the first three characters: "Dev".' },
    { q: 'Which expression safely joins FirstName and a possibly-NULL MiddleName with a space?', options: ['FirstName + \' \' + MiddleName', 'CONCAT_WS(\' \', FirstName, MiddleName)', 'FirstName & MiddleName', 'STRING_JOIN(FirstName, MiddleName)'], answer: 1, why: 'CONCAT_WS skips NULL values and adds the separator only between real values. With +, a NULL MiddleName makes the whole result NULL.' },
    { q: 'What does CHARINDEX(\'@\', \'hello\') return?', options: ['NULL', '-1', '0', 'An error'], answer: 2, why: 'CHARINDEX returns 0 when the search text is not found. That is why LEFT(s, CHARINDEX(...) - 1) needs a guard.' },
    { q: 'You need one row per tag from a column holding "a;b;c". Which function?', options: ['STRING_AGG with GROUP BY', 'STRING_SPLIT with CROSS APPLY', 'CONCAT_WS with a \';\' separator', 'PATINDEX with a wildcard pattern'], answer: 1, why: 'STRING_SPLIT is a table-valued function that returns one row per piece. CROSS APPLY runs it for every row of the source table.' },
    { q: 'Why does WHERE LOWER(Email) = \'a@b.com\' run slowly on a large indexed table?', options: ['LOWER is a slow function that runs once per character', 'The function on the column prevents an index seek', 'Email columns cannot be indexed because of the @ sign', 'String comparison is always slow'], answer: 1, why: 'The index stores the original Email values. Because the engine would have to apply LOWER to every entry to compare, it cannot seek; it scans. Store a lowercased copy and index that.' },
    { q: 'Which is a real difference between SQL Server and PostgreSQL string handling?', options: ['PostgreSQL has no LENGTH function, only LEN', 'PostgreSQL compares text case-sensitively by default', 'PostgreSQL cannot split a string into rows or arrays', 'SQL Server uses || for concatenation; PostgreSQL uses +'], answer: 1, why: 'Collation defaults differ. SQL Server databases usually use a _CI_ (case-insensitive) collation; PostgreSQL compares bytes exactly unless you use LOWER or a case-insensitive collation.' }
  ],
  takeaways: [
    'Positions are 1-based: SUBSTRING(s, 1, n) is the first n characters.',
    'CHARINDEX returns 0 when not found; guard before subtracting 1.',
    'CONCAT and CONCAT_WS handle NULL gracefully; + does not.',
    'STRING_SPLIT turns a delimited column into rows; STRING_AGG turns rows into one string.',
    'Functions on columns in WHERE kill index seeks; store and index a cleaned copy instead.',
    'Know the PostgreSQL twins: LENGTH, POSITION, INITCAP, ||, and real regex support.'
  ],
  interview: [
    { q: 'How would you extract the domain from an email column, and make the query fast?', a: `<p>SUBSTRING(Email, CHARINDEX('@', Email) + 1, LEN(Email)), guarded with CASE for rows without an @. To make grouping or filtering by domain fast, add a persisted computed column for the domain and index it, so the function runs once at write time instead of on every query.</p>` },
    { q: 'What is the difference between CONCAT and the + operator?', a: `<p>+ returns NULL if any operand is NULL and requires all operands to be strings (numbers need CAST). CONCAT treats NULL as an empty string and converts other types automatically. CONCAT_WS additionally inserts a separator and skips NULLs.</p>` },
    { q: 'How do you turn rows into a comma-separated list, and the other way round?', a: `<p>STRING_AGG(column, ', ') WITHIN GROUP (ORDER BY column) aggregates rows into one string (SQL Server 2017+; older code used FOR XML PATH). STRING_SPLIT(column, ',') with CROSS APPLY goes the other way. PostgreSQL uses STRING_AGG with ORDER BY inside, and unnest(string_to_array()) to split.</p>` },
    { q: 'Why is LIKE \'%smith%\' slow and what is the alternative?', a: `<p>A leading wildcard means the index order is useless, so the engine scans every row. For "contains" searches on large text, use full-text search (CONTAINS in SQL Server, tsvector/GIN in PostgreSQL) or an external search engine. For prefix searches, LIKE 'smith%' can use the index.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m3-sql-window-ranking — Window Functions: Ranking                   */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-window-ranking'] = {
  hook: `GROUP BY squashes rows into totals. A window function keeps every row and adds a number next to it: its rank, its position, its bucket. That one difference unlocks "top 3 per category" in a single query.`,
  intro: `<p>A <span class="term">window function</span> is a function that looks at a group of related rows (the "window") while still returning one result per original row. It does not collapse rows the way <code>GROUP BY</code> does. You tell it which rows belong together with <code>PARTITION BY</code> and in what order to look at them with <code>ORDER BY</code>, all inside an <code>OVER (...)</code> clause.</p>
<p>The <span class="term">ranking functions</span> are the easiest place to start: <code>ROW_NUMBER()</code>, <code>RANK()</code>, <code>DENSE_RANK()</code> and <code>NTILE(n)</code>. They answer questions like "which is the newest order per customer?", "who are the top three sellers in each region?", "which of these duplicate rows should I keep?", and "split users into four equal groups".</p>
<p>Before window functions, each of these needed a correlated subquery or a self-join that was slow and hard to read. Now they are one line. Every modern engine supports them: SQL Server, PostgreSQL, MySQL 8+, Oracle, SQLite 3.25+.</p>`,
  realLife: {
    title: 'Race results on a leaderboard',
    body: `<p>Think of a school sports day. Each race (a partition) has its own list of runners ordered by time. The announcer gives each runner a position. If two runners tie for second, do they both get 2 and the next runner gets 4 (that is RANK)? Or do both get 2 and the next gets 3 (DENSE_RANK)? Or do you just number them 1, 2, 3, 4 in the order they crossed, picking one of the tied runners arbitrarily (ROW_NUMBER)? And if you want to split all runners into four ability groups for next year, that is NTILE(4).</p>
<p>All four functions look at the same ordered list. They only differ in how they hand out the numbers.</p>
<p><strong>Where companies use this:</strong> Spotify's "top 10 songs per country" chart is a ranking function per country. Amazon's "best seller in Electronics" badge is DENSE_RANK = 1 per category. Banks find the latest balance per account with ROW_NUMBER = 1. Data teams everywhere use ROW_NUMBER to delete duplicate rows safely.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The OVER clause</h4>
<p>Every window function ends with <code>OVER (...)</code>. Inside it you can write:</p>
<ul>
<li><code>PARTITION BY column</code>: "start counting again for each value of this column". Like GROUP BY, but rows are not merged. Optional; leave it out to treat the whole result as one group.</li>
<li><code>ORDER BY column</code>: the order used to assign the numbers. Required for ranking functions.</li>
</ul>
<p>Example: <code>ROW_NUMBER() OVER (PARTITION BY CustomerId ORDER BY OrderDate DESC)</code> gives each customer's orders the numbers 1, 2, 3... starting with the newest.</p>
<h4>The four ranking functions</h4>
<table><thead><tr><th>Function</th><th>Ties?</th><th>Example on sales 500, 400, 400, 300</th></tr></thead>
<tbody>
<tr><td>ROW_NUMBER()</td><td>Never ties; picks one arbitrarily</td><td>1, 2, 3, 4</td></tr>
<tr><td>RANK()</td><td>Ties share a number; gaps after</td><td>1, 2, 2, 4</td></tr>
<tr><td>DENSE_RANK()</td><td>Ties share a number; no gaps</td><td>1, 2, 2, 3</td></tr>
<tr><td>NTILE(2)</td><td>Splits into n roughly equal buckets</td><td>1, 1, 2, 2</td></tr>
</tbody></table>
<h4>Why not just GROUP BY?</h4>
<p>GROUP BY gives you one row per group: "total sales per region". It cannot tell you "the second-best seller in each region" because the individual sellers are gone after grouping. Window functions keep the sellers and add their rank beside them.</p>
<h4>Where the result goes</h4>
<p>Window functions are written in the SELECT list (or ORDER BY), never in WHERE. If you want to filter by rank ("only rank 1"), wrap the query in a CTE or subquery and filter outside. This is the single most common beginner mistake, and the Intermediate level shows the fix.</p>
<div class="callout tip">Read OVER (PARTITION BY x ORDER BY y) as "for each x, in order of y". Say it out loud and the query usually writes itself.</div>` },
    { name: 'Intermediate', body: `<h4>Top-N per group</h4>
<p>"Top 3 products by revenue in each category" is the signature use. Step one: compute the rank per category. Step two: filter in an outer query.</p>
<pre>WITH Ranked AS (
  SELECT CategoryId, ProductId, Revenue,
         DENSE_RANK() OVER (PARTITION BY CategoryId ORDER BY Revenue DESC) AS rk
  FROM ProductSales)
SELECT * FROM Ranked WHERE rk &lt;= 3;</pre>
<p>Choose the function based on what "top 3" should mean with ties. DENSE_RANK can return more than three rows when products tie; ROW_NUMBER always returns exactly three. Business people usually mean DENSE_RANK; dashboards with fixed space usually need ROW_NUMBER.</p>
<h4>Latest row per entity</h4>
<p>"Each customer's most recent order": <code>ROW_NUMBER() OVER (PARTITION BY CustomerId ORDER BY OrderDate DESC, Id DESC)</code> then <code>WHERE rn = 1</code>. Add a second ORDER BY column (the Id) as a tie-breaker so two orders on the same day do not pick randomly between runs.</p>
<h4>Removing duplicates safely</h4>
<p>A customer table was loaded twice. Number the duplicates and delete everything after the first:</p>
<pre>WITH D AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY Email ORDER BY CreatedAt) AS rn
  FROM Customers)
DELETE FROM D WHERE rn &gt; 1;</pre>
<p>In SQL Server you can DELETE through the CTE directly. In PostgreSQL use <code>DELETE FROM Customers WHERE Id IN (SELECT Id FROM D WHERE rn &gt; 1)</code>.</p>
<h4>Pagination the old way, and the new way</h4>
<p>Before <code>OFFSET/FETCH</code> existed (SQL Server 2012), developers paged with ROW_NUMBER: number everything, then <code>WHERE rn BETWEEN 21 AND 30</code>. You still see it in legacy code. Today prefer <code>ORDER BY Id OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY</code>, or better, keyset pagination (<code>WHERE Id &gt; @lastSeenId ORDER BY Id</code>) which stays fast on page 10,000.</p>
<h4>NTILE for buckets</h4>
<p><code>NTILE(4) OVER (ORDER BY TotalSpend DESC)</code> splits customers into quartiles: bucket 1 is your top 25% spenders. Marketing uses this for "gold / silver / bronze" tiers. If rows do not divide evenly, the first buckets get the extra rows.</p>
<h4>Several windows in one query</h4>
<p>You can have many window functions with different OVER clauses in the same SELECT. If several share the same window, name it once with a <code>WINDOW w AS (PARTITION BY ... ORDER BY ...)</code> clause (PostgreSQL, and SQL Server 2022+) and write <code>OVER w</code>.</p>
<div class="callout warn">The ORDER BY inside OVER is independent of the final ORDER BY of the query. Ranking by sales but displaying by name is normal, and needs both.</div>` },
    { name: 'Expert', body: `<h4>How the engine computes a window</h4>
<p>The engine sorts (or uses an index that already provides the order) by the PARTITION BY columns then the ORDER BY columns, and streams through the rows once, resetting counters at each partition boundary. In SQL Server's execution plan you see a <em>Segment</em> operator (detects partition changes), a <em>Sequence Project</em> (assigns the numbers) and often a <em>Sort</em>. The Sort is the expensive part: it needs memory, and a big sort spills to tempdb. An index whose key matches <code>(PartitionCols, OrderCols)</code> removes the Sort entirely. For the "latest order per customer" query, <code>CREATE INDEX IX ON Orders(CustomerId, OrderDate DESC, Id DESC)</code> turns a sort of the whole table into a single ordered scan.</p>
<h4>Ties and determinism</h4>
<p>ROW_NUMBER with a non-unique ORDER BY is <em>non-deterministic</em>: two runs can number tied rows differently. That is harmless for a quick count but dangerous for "delete duplicates" or "pick the row to keep". Always add a unique tie-breaker (the primary key) to the ORDER BY. RANK and DENSE_RANK are deterministic because tied rows get the same value.</p>
<h4>Window functions vs. correlated subqueries vs. CROSS APPLY</h4>
<p>"Top 1 per group" has three common solutions. The window approach reads the whole table once and sorts. <code>CROSS APPLY (SELECT TOP 1 ... ORDER BY ...)</code> does one index seek per outer row, which wins when the outer set is small (10 customers) and the inner table is huge. A correlated subquery with MAX() is often slowest. Test with real data; the right answer depends on cardinality, and interviewers like to hear you say that.</p>
<h4>Logical processing order</h4>
<p>Window functions are evaluated after WHERE, GROUP BY and HAVING, but before the final ORDER BY and DISTINCT. That has two consequences. You cannot reference a window function in WHERE (it does not exist yet), hence the CTE wrapper. And you <em>can</em> combine a window function with GROUP BY: <code>RANK() OVER (ORDER BY SUM(Revenue) DESC)</code> ranks the grouped totals, which is how you rank categories by total sales in one statement.</p>
<h4>PostgreSQL and SQL Server notes</h4>
<ul>
<li>Both support all four functions identically. PostgreSQL additionally has <code>PERCENT_RANK()</code> and <code>CUME_DIST()</code>; SQL Server has them too (2012+).</li>
<li>SQL Server 2022 added the <code>WINDOW</code> clause and <code>IGNORE NULLS</code> for FIRST_VALUE/LAST_VALUE; PostgreSQL has had WINDOW for years.</li>
<li>Batch-mode window aggregates (SQL Server 2016+ on columnstore, 2019+ on rowstore) make windows over millions of rows dramatically faster; check the plan for "Window Aggregate" in batch mode.</li>
</ul>
<div class="callout idea">Interview classic: "Find the second-highest salary per department." Answer with DENSE_RANK = 2 (handles ties correctly), and explain why ROW_NUMBER would be wrong if two people share the top salary.</div>` }
  ],
  flow: {
    title: 'How "top 3 products per category" is computed',
    steps: [
      { title: 'Rows arrive', desc: 'The engine fetches ProductSales rows: CategoryId, ProductId, Revenue. No grouping happens; every row survives.' },
      { title: 'Sort by partition, then order', desc: 'Rows are sorted by CategoryId first, then Revenue DESC inside each category. An index on (CategoryId, Revenue DESC) skips this step.' },
      { title: 'Detect partition boundaries', desc: 'As the engine streams through, it notices when CategoryId changes. That is a new window; counters reset.' },
      { title: 'Assign the rank', desc: 'DENSE_RANK hands out 1, 2, 2, 3... per category. Ties share a number with no gap. Each row now carries its rank as a new column.' },
      { title: 'Outer query filters', desc: 'The CTE result is complete. The outer SELECT applies WHERE rk <= 3, which was impossible inside the same SELECT because WHERE runs before window functions.' },
      { title: 'Final ORDER BY for display', desc: 'A separate ORDER BY CategoryId, rk arranges the output. The window ORDER BY and the display ORDER BY are independent.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'The four ranking functions side by side', code: `-- Sales per employee per region. Watch how ties (400, 400) are handled.
SELECT  Region,
        EmployeeName,
        Sales,
        ROW_NUMBER() OVER (PARTITION BY Region ORDER BY Sales DESC, EmployeeName) AS RowNum,
        RANK()       OVER (PARTITION BY Region ORDER BY Sales DESC)               AS Rnk,
        DENSE_RANK() OVER (PARTITION BY Region ORDER BY Sales DESC)               AS DenseRnk,
        NTILE(2)     OVER (PARTITION BY Region ORDER BY Sales DESC)               AS Half
FROM    RegionalSales
ORDER BY Region, Sales DESC;

-- Region  Employee  Sales  RowNum  Rnk  DenseRnk  Half
-- North   Asha      500    1       1    1         1
-- North   Bala      400    2       2    2         1
-- North   Chen      400    3       2    2         2
-- North   Dev       300    4       4    3         2

-- Rank categories by their TOTAL sales (window over a GROUP BY result)
SELECT  c.Name,
        SUM(oi.Quantity * oi.UnitPrice)                                   AS Revenue,
        RANK() OVER (ORDER BY SUM(oi.Quantity * oi.UnitPrice) DESC)       AS RevenueRank
FROM    OrderItems oi
JOIN    Products p   ON p.Id = oi.ProductId
JOIN    Categories c ON c.Id = p.CategoryId
GROUP BY c.Name;` },
    { lang: 'sql', title: 'Top-N per group and latest row per customer', code: `-- Top 3 products by revenue in each category (ties included via DENSE_RANK)
WITH ProductRevenue AS
(
    SELECT  p.CategoryId, p.Id AS ProductId, p.Name,
            SUM(oi.Quantity * oi.UnitPrice) AS Revenue
    FROM    OrderItems oi
    JOIN    Products p ON p.Id = oi.ProductId
    GROUP BY p.CategoryId, p.Id, p.Name
),
Ranked AS
(
    SELECT  *,
            DENSE_RANK() OVER (PARTITION BY CategoryId ORDER BY Revenue DESC) AS rk
    FROM    ProductRevenue
)
SELECT  CategoryId, Name, Revenue, rk
FROM    Ranked
WHERE   rk <= 3                              -- filter OUTSIDE the window query
ORDER BY CategoryId, rk;

-- Each customer's most recent order (deterministic thanks to the Id tie-breaker)
WITH Latest AS
(
    SELECT  o.*,
            ROW_NUMBER() OVER (PARTITION BY o.CustomerId
                               ORDER BY o.OrderDate DESC, o.Id DESC) AS rn
    FROM    Orders o
)
SELECT  c.Name, l.Id AS LastOrderId, l.OrderDate, l.Total
FROM    Latest l
JOIN    Customers c ON c.Id = l.CustomerId
WHERE   l.rn = 1;

-- Supporting index that removes the Sort from the plan:
-- CREATE INDEX IX_Orders_Customer_Date ON Orders (CustomerId, OrderDate DESC, Id DESC) INCLUDE (Total);` },
    { lang: 'sql', title: 'Dedupe with ROW_NUMBER, NTILE tiers, and legacy pagination', code: `-- 1) Delete duplicate customers, keeping the oldest row per email
WITH Dupes AS
(
    SELECT  Id,
            ROW_NUMBER() OVER (PARTITION BY LOWER(Email) ORDER BY CreatedAt, Id) AS rn
    FROM    Customers
)
DELETE FROM Dupes WHERE rn > 1;          -- SQL Server allows DELETE through the CTE
-- PostgreSQL: DELETE FROM Customers WHERE Id IN (SELECT Id FROM Dupes WHERE rn > 1);

-- 2) Customer tiers by total spend (quartiles)
WITH Spend AS
(
    SELECT CustomerId, SUM(Total) AS TotalSpend
    FROM   Orders
    GROUP BY CustomerId
)
SELECT  CustomerId, TotalSpend,
        CASE NTILE(4) OVER (ORDER BY TotalSpend DESC)
             WHEN 1 THEN 'Gold' WHEN 2 THEN 'Silver' WHEN 3 THEN 'Bronze' ELSE 'Basic'
        END AS Tier
FROM    Spend;

-- 3) Pagination: page 3 of 10 rows, three ways
-- a) legacy ROW_NUMBER (works on every version)
WITH Numbered AS
(
    SELECT *, ROW_NUMBER() OVER (ORDER BY Id) AS rn FROM Products
)
SELECT * FROM Numbered WHERE rn BETWEEN 21 AND 30;

-- b) OFFSET / FETCH (SQL Server 2012+, PostgreSQL uses LIMIT 10 OFFSET 20)
SELECT * FROM Products ORDER BY Id OFFSET 20 ROWS FETCH NEXT 10 ROWS ONLY;

-- c) keyset pagination: fastest for deep pages, needs the last Id from the previous page
SELECT TOP (10) * FROM Products WHERE Id > @LastSeenId ORDER BY Id;` }
  ],
  pitfalls: [
    'Writing WHERE ROW_NUMBER() OVER (...) = 1 in the same query. Window functions are evaluated after WHERE; wrap the query in a CTE and filter outside.',
    'Using ROW_NUMBER with a non-unique ORDER BY to decide which duplicate to keep. Add the primary key as a tie-breaker or the choice changes between runs.',
    'Picking RANK when the business wants "no gaps" (DENSE_RANK), or DENSE_RANK when a dashboard needs exactly N rows (ROW_NUMBER).',
    'Forgetting PARTITION BY and ranking the whole table instead of per group.',
    'Sorting millions of rows for a window with no supporting index; the Sort spills to tempdb. Index on (partition columns, order columns).',
    'Using OFFSET for deep pagination; page 10,000 still reads the first 100,000 rows. Use keyset pagination for infinite scroll.'
  ],
  quiz: [
    { q: 'Sales are 500, 400, 400, 300. What does RANK() produce, highest first?', options: ['1, 2, 3, 4', '1, 2, 2, 3', '1, 2, 2, 4', '1, 1, 2, 2'], answer: 2, why: 'RANK gives tied rows the same number and then skips: the row after two 2s is 4. DENSE_RANK would give 1, 2, 2, 3.' },
    { q: 'What does PARTITION BY do inside OVER()?', options: ['Sorts the final output by the listed columns', 'Starts a new window per group, keeping every row', 'Merges each group into a single row, just like GROUP BY', 'Limits how many rows each group may return'], answer: 1, why: 'PARTITION BY defines the groups the function works within, but unlike GROUP BY every original row is kept.' },
    { q: 'Why can you not write WHERE rn = 1 in the same SELECT that defines rn with ROW_NUMBER()?', options: ['ROW_NUMBER cannot be used in a query that has WHERE', 'WHERE runs before window functions are computed', 'rn is a BIGINT and WHERE only compares INT values', 'You can; it works fine in every engine'], answer: 1, why: 'Logical processing runs WHERE first, then window functions. Put the window query in a CTE or subquery and filter in the outer query.' },
    { q: 'You want exactly the newest order per customer, and two orders can share a date. Best ORDER BY inside OVER?', options: ['ORDER BY OrderDate DESC', 'ORDER BY OrderDate DESC, Id DESC', 'ORDER BY CustomerId, OrderDate DESC', 'No ORDER BY needed'], answer: 1, why: 'The Id tie-breaker makes ROW_NUMBER deterministic, so the same order is chosen every time the query runs.' },
    { q: 'Which function splits customers into four equal-sized spending groups?', options: ['RANK()', 'DENSE_RANK()', 'NTILE(4)', 'ROW_NUMBER() / 4'], answer: 2, why: 'NTILE(n) assigns bucket numbers 1..n with as equal a count as possible, in the given order.' },
    { q: 'Which index best supports ROW_NUMBER() OVER (PARTITION BY CustomerId ORDER BY OrderDate DESC)?', options: ['Orders(OrderDate)', 'Orders(CustomerId, OrderDate DESC)', 'Orders(Id)', 'No index helps window functions'], answer: 1, why: 'An index whose key matches partition columns then order columns supplies rows already sorted, so the plan needs no Sort operator.' }
  ],
  takeaways: [
    'OVER (PARTITION BY x ORDER BY y) means "for each x, in order of y", and every original row is kept.',
    'ROW_NUMBER never ties; RANK ties with gaps; DENSE_RANK ties without gaps; NTILE makes buckets.',
    'Top-N per group = rank in a CTE, filter in the outer query.',
    'Always add a unique tie-breaker to ROW_NUMBER\'s ORDER BY when the choice matters.',
    'Window functions run after WHERE/GROUP BY/HAVING and before the final ORDER BY.',
    'An index on (partition cols, order cols) removes the Sort and is the main performance lever.'
  ],
  interview: [
    { q: 'What is the difference between RANK, DENSE_RANK and ROW_NUMBER?', a: `<p>All number rows in an ordered window. ROW_NUMBER gives unique sequential numbers even for ties (arbitrarily). RANK gives tied rows the same number and leaves a gap after them (1, 2, 2, 4). DENSE_RANK gives tied rows the same number with no gap (1, 2, 2, 3). Pick by how you want ties treated.</p>` },
    { q: 'Write a query for the second-highest salary in each department.', a: `<p>WITH R AS (SELECT DeptId, Name, Salary, DENSE_RANK() OVER (PARTITION BY DeptId ORDER BY Salary DESC) AS rk FROM Employees) SELECT * FROM R WHERE rk = 2. DENSE_RANK is correct because if two people share the top salary, the next distinct salary is still "second-highest".</p>` },
    { q: 'How would you delete duplicate rows but keep one?', a: `<p>Number the rows per duplicate key with ROW_NUMBER() OVER (PARTITION BY key columns ORDER BY a deterministic column such as CreatedAt, Id), then delete where the number is greater than 1. In SQL Server you can delete through the CTE; in PostgreSQL delete by Id IN (...).</p>` },
    { q: 'How do window functions differ from GROUP BY?', a: `<p>GROUP BY collapses many rows into one per group and only aggregates survive. Window functions compute over a group but return a value for every original row, so detail and aggregate can sit side by side. They can even be combined: a window over the grouped totals.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m3-sql-window-aggregates — Window Functions: Aggregates, Frames,    */
/*                            LAG/LEAD                                  */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-window-aggregates'] = {
  hook: `Running totals, "compared to last month", 7-day moving averages, "how many days in a row did this user log in": every one of these is a window aggregate, and none of them needs a loop.`,
  intro: `<p>In the previous lesson, window functions handed out ranks. In this one they do arithmetic: <code>SUM</code>, <code>AVG</code>, <code>COUNT</code>, <code>MIN</code>, <code>MAX</code> inside an <code>OVER (...)</code> clause. The result is an aggregate that sits next to each row instead of replacing it. A row can show its own value, the running total so far, and the share of the grand total, all at once.</p>
<p>Two new ideas appear. The <span class="term">frame</span> is the exact set of rows the aggregate looks at relative to the current row: "everything up to here", "the previous 6 rows and this one", "all rows in the partition". And the <span class="term">offset functions</span> <code>LAG</code> and <code>LEAD</code> let a row peek at the row before or after it, which is how you compute "change since yesterday" without a self-join.</p>
<p>These are the functions behind almost every dashboard and finance report. They are also the source of one famous trap (LAST_VALUE returning the wrong thing) that you will learn to avoid in this lesson.</p>`,
  realLife: {
    title: 'Your bank statement',
    body: `<p>Open your bank statement. Each line is a transaction with its own amount. Next to it is the balance after that transaction: a running total. If you want "balance this day last month", you need to look at a row 30 days back: that is LAG. If the bank shows "average spend over the last 7 days", that is a moving average with a frame of the previous 6 rows plus today. The statement never collapses your transactions into one number; it keeps every line and adds context beside it.</p>
<p>That is window aggregates in one picture: detail rows plus a column computed from the rows around them.</p>
<p><strong>Where companies use this:</strong> Stripe and Razorpay dashboards show cumulative revenue per month. Fitness apps (Strava, Fitbit) compute streaks of consecutive active days with the "gaps and islands" technique. Stock sites compute 50-day and 200-day moving averages. E-commerce teams compute "percent of category revenue" per product for pricing decisions.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Aggregate without collapsing</h4>
<p><code>SUM(Total) OVER ()</code> with an empty OVER gives the grand total on every row. Divide a row's value by it and you have "percent of total" without a second query. Add <code>PARTITION BY CustomerId</code> and you get the customer's total on each of their rows.</p>
<h4>Running totals</h4>
<p>Add an ORDER BY inside OVER and the aggregate becomes cumulative: <code>SUM(Total) OVER (PARTITION BY CustomerId ORDER BY OrderDate)</code> is the sum of this order and all earlier ones for that customer. The ORDER BY is what turns "total" into "total so far".</p>
<h4>LAG and LEAD: looking at the neighbour row</h4>
<ul>
<li><code>LAG(Total, 1) OVER (ORDER BY Month)</code> = the Total from the previous row. Subtract it from this row's Total to get the month-over-month change.</li>
<li><code>LEAD(Total, 1)</code> = the next row's value.</li>
<li>The second argument is how many rows back or forward (default 1). A third argument is the default when there is no such row: <code>LAG(Total, 1, 0)</code> gives 0 on the first row instead of NULL.</li>
</ul>
<h4>The frame, in simple words</h4>
<p>When you add ORDER BY, the engine quietly uses a default frame: "from the first row of the partition up to the current row". You can state a frame yourself: <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> (almost the same as the default; the Intermediate level explains the small difference). Or change it: <code>ROWS BETWEEN 6 PRECEDING AND CURRENT ROW</code> is a 7-row moving window. <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code> is the whole partition.</p>
<div class="callout tip">Three OVER shapes to memorise: OVER () = whole result; OVER (PARTITION BY x) = per group; OVER (PARTITION BY x ORDER BY y) = per group, cumulative.</div>
<h4>FIRST_VALUE</h4>
<p><code>FIRST_VALUE(ProductName) OVER (PARTITION BY CustomerId ORDER BY OrderDate)</code> returns the first product each customer ever bought, on every row. Simple and safe. Its twin LAST_VALUE has a trap, explained in the Intermediate level.</p>` },
    { name: 'Intermediate', body: `<h4>ROWS vs RANGE</h4>
<p>A frame can be defined in two units.</p>
<ul>
<li><code>ROWS</code> counts physical rows: "6 rows before this one". Predictable.</li>
<li><code>RANGE</code> uses the ORDER BY <em>value</em>: "all rows whose value ties with the current row are included together". With duplicate dates, RANGE includes every row with the same date in the frame, so a running total jumps by the whole day at once instead of row by row.</li>
</ul>
<p><strong>The default frame when you write ORDER BY is RANGE, not ROWS.</strong> That has two effects: ties are grouped (sometimes surprising), and it is slower in SQL Server because the engine must look ahead for ties. Rule of thumb: always write <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> explicitly for running totals. It is faster and behaves as people expect.</p>
<h4>The LAST_VALUE trap</h4>
<p>People write <code>LAST_VALUE(Total) OVER (PARTITION BY CustomerId ORDER BY OrderDate)</code> expecting the customer's latest order. They get the current row's own value. Why? The default frame ends at CURRENT ROW, so the "last" row in the frame is always the current one. Fix: add <code>ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING</code>, or use FIRST_VALUE with ORDER BY OrderDate DESC, which is usually clearer.</p>
<h4>Moving average</h4>
<p>7-day average of daily sales: <code>AVG(Sales) OVER (ORDER BY Day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)</code>. On the first six days the window is shorter, so the average covers fewer days; if that matters, COUNT the rows in the same frame and only show the average when the count is 7. For a <em>calendar</em> 7-day window with missing days, generate a date series (recursive CTE lesson) and LEFT JOIN first, or use <code>RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW</code> in PostgreSQL (SQL Server does not support interval ranges).</p>
<h4>Percent of total and share of group</h4>
<p><code>Total * 100.0 / SUM(Total) OVER (PARTITION BY CategoryId)</code> gives each product's share of its category. The <code>100.0</code> forces decimal division; with integers you would get 0.</p>
<h4>Gaps and islands: streaks</h4>
<p>"Longest run of consecutive login days per user" is a classic. Trick: number the days with ROW_NUMBER and subtract that from the date. Days in an unbroken run all produce the same difference (an "island"). Group by user and that difference, and COUNT gives the streak length. The code tab has the full query; study it, it comes up in interviews often.</p>
<h4>Month-over-month growth</h4>
<p>Aggregate first (GROUP BY month), then window: <code>(Revenue - LAG(Revenue) OVER (ORDER BY Month)) * 100.0 / NULLIF(LAG(Revenue) OVER (ORDER BY Month), 0)</code>. NULLIF prevents divide-by-zero on a month with no revenue.</p>
<div class="callout warn">COUNT(*) OVER () on a paged query is a convenient way to return the total row count with each page, but it makes the engine count the whole result on every page request. Fine for thousands of rows; cache it for millions.</div>` },
    { name: 'Expert', body: `<h4>How running aggregates are executed</h4>
<p>For a frame of UNBOUNDED PRECEDING to CURRENT ROW with ROWS, the engine streams rows in order and keeps an accumulator; this is O(n) and barely slower than a plain scan. With RANGE, SQL Server must handle ties, and the plan's <em>Window Spool</em> writes the rows to an on-disk worktable in tempdb and re-reads them (with ROWS the spool can stay in memory). That is why RANGE running totals can be several times slower than ROWS, and why you should write ROWS explicitly. For sliding frames (6 PRECEDING), the engine maintains the window incrementally for SUM/COUNT/AVG, but MIN/MAX over a sliding frame may rescan the frame per row.</p>
<h4>Batch-mode window aggregates</h4>
<p>SQL Server 2016 added a batch-mode <em>Window Aggregate</em> operator for columnstore tables, and 2019 extended batch mode to rowstore when the optimizer judges it worthwhile. It removes the Window Spool and processes rows in vectors of ~900. On wide reporting tables this is a 5 to 20 times speedup; you can nudge it by adding a (possibly empty) columnstore index. PostgreSQL executes windows row by row with a tuplestore; good indexes on the sort keys matter even more there.</p>
<h4>Index design for windows</h4>
<p>The sort key is PARTITION BY columns followed by ORDER BY columns. An index with exactly that key (plus INCLUDE for the aggregated column) lets the engine skip the Sort entirely. If several windows in one query use different orders, you pay one Sort per distinct order; group your window functions so as many as possible share an OVER clause, and name it with WINDOW w AS (...) where supported.</p>
<h4>Gaps and islands, the general form</h4>
<p>The "date minus row number" trick works for consecutive integers and dates. For "sessions" defined by a time gap (a new session starts when the previous event was more than 30 minutes ago), use LAG to compute the gap, a CASE to flag session starts (1 or 0), then a running SUM of the flag to assign session ids. That three-step pattern (LAG → flag → cumulative SUM) solves most sequence problems: sessionisation, detecting state changes, grouping repeated values.</p>
<h4>Statistical and distribution functions</h4>
<p><code>PERCENT_RANK()</code>, <code>CUME_DIST()</code>, <code>PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY x) OVER (PARTITION BY ...)</code> (median), and in PostgreSQL ordered-set aggregates. Median per group is a frequent interview question: PERCENTILE_CONT is the clean answer in both engines (SQL Server requires the OVER clause; PostgreSQL uses it as an ordinary aggregate with GROUP BY).</p>
<h4>Correctness details</h4>
<ul>
<li>SUM OVER on a FLOAT accumulates rounding error over millions of rows; use DECIMAL for money.</li>
<li>LAG ignores partition boundaries only if you forget PARTITION BY; the first row of each partition correctly gets NULL (or your default).</li>
<li>SQL Server 2022 supports <code>IGNORE NULLS</code> on LAG/LEAD/FIRST_VALUE/LAST_VALUE, which is how you "carry forward the last known price" across rows with NULLs. PostgreSQL up to version 18 does not have it; check your version's docs, and on older versions use a workaround (a running COUNT of the non-NULL values to form groups, then MAX per group).</li>
</ul>
<div class="callout idea">Interview question: "Compute each day's revenue as a percentage change from the previous day, and flag days that beat the 7-day average." Answer: GROUP BY day in a CTE, then LAG for the change and AVG OVER ROWS 6 PRECEDING for the average, then CASE to flag. Say ROWS, not RANGE, and explain why.</div>` }
  ],
  flow: {
    title: 'Building a running total with ROWS UNBOUNDED PRECEDING',
    steps: [
      { title: 'Partition and sort', desc: 'Orders are sorted by CustomerId, then OrderDate, then Id. An index with that key means no Sort operator is needed.' },
      { title: 'Start a partition', desc: 'The first row for customer 7 arrives. The accumulator resets to 0.' },
      { title: 'Add the current row', desc: 'The frame is "all rows so far, including this one". Accumulator += Total. The row is output with RunningTotal = accumulator.' },
      { title: 'Stream the next row', desc: 'The next order for customer 7 arrives. Accumulator += its Total. No re-reading of earlier rows is needed with ROWS; with RANGE the engine would check for tied dates.' },
      { title: 'LAG peeks back', desc: 'In the same pass, LAG(Total) simply remembers the previous row\'s value for this partition and emits it alongside.' },
      { title: 'Partition changes', desc: 'Customer 8\'s first row arrives. Accumulator resets, LAG returns NULL (or the default you gave), and the process repeats.' },
      { title: 'Outer query finishes', desc: 'All rows are returned with their own Total, RunningTotal and PreviousTotal. Nothing was collapsed.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'Running totals, percent of total, LAG and LEAD', code: `-- Per-customer running balance, share of their spend, and change from the previous order
SELECT  o.CustomerId,
        o.Id            AS OrderId,
        o.OrderDate,
        o.Total,
        SUM(o.Total) OVER (PARTITION BY o.CustomerId
                           ORDER BY o.OrderDate, o.Id
                           ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)  AS RunningTotal,
        SUM(o.Total) OVER (PARTITION BY o.CustomerId)                        AS CustomerTotal,
        o.Total * 100.0 / SUM(o.Total) OVER (PARTITION BY o.CustomerId)      AS PctOfCustomer,
        LAG(o.Total, 1, 0)  OVER (PARTITION BY o.CustomerId ORDER BY o.OrderDate, o.Id) AS PrevTotal,
        o.Total - LAG(o.Total, 1, 0) OVER (PARTITION BY o.CustomerId ORDER BY o.OrderDate, o.Id) AS ChangeVsPrev,
        LEAD(o.OrderDate) OVER (PARTITION BY o.CustomerId ORDER BY o.OrderDate, o.Id)   AS NextOrderDate,
        DATEDIFF(DAY, o.OrderDate,
                 LEAD(o.OrderDate) OVER (PARTITION BY o.CustomerId ORDER BY o.OrderDate, o.Id)) AS DaysToNextOrder
FROM    Orders o
ORDER BY o.CustomerId, o.OrderDate, o.Id;

-- Month-over-month revenue growth (aggregate first, then window over the result)
WITH Monthly AS
(
    SELECT  DATEFROMPARTS(YEAR(OrderDate), MONTH(OrderDate), 1) AS Month,
            SUM(Total) AS Revenue
    FROM    Orders
    GROUP BY DATEFROMPARTS(YEAR(OrderDate), MONTH(OrderDate), 1)
)
SELECT  Month,
        Revenue,
        LAG(Revenue) OVER (ORDER BY Month)                                   AS PrevRevenue,
        (Revenue - LAG(Revenue) OVER (ORDER BY Month)) * 100.0
            / NULLIF(LAG(Revenue) OVER (ORDER BY Month), 0)                  AS GrowthPct,
        SUM(Revenue) OVER (ORDER BY Month ROWS UNBOUNDED PRECEDING)          AS YtdLikeCumulative
FROM    Monthly
ORDER BY Month;` },
    { lang: 'sql', title: 'Moving average, frames, and the LAST_VALUE trap', code: `-- Daily sales with a 7-day moving average (ROWS frame = previous 6 rows + today)
WITH Daily AS
(
    SELECT CAST(OrderDate AS DATE) AS Day, SUM(Total) AS Sales
    FROM   Orders
    GROUP BY CAST(OrderDate AS DATE)
)
SELECT  Day,
        Sales,
        AVG(Sales) OVER (ORDER BY Day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS Avg7,
        COUNT(*)   OVER (ORDER BY Day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS DaysInWindow,
        MAX(Sales) OVER (ORDER BY Day ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) AS Max30,
        CASE WHEN Sales > AVG(Sales) OVER (ORDER BY Day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
             THEN 'above' ELSE 'below' END AS VsAvg7
FROM    Daily
ORDER BY Day;

-- ROWS vs RANGE with duplicate dates: watch the running total
SELECT  OrderDate, Total,
        SUM(Total) OVER (ORDER BY OrderDate ROWS  UNBOUNDED PRECEDING) AS RunningRows,   -- row by row
        SUM(Total) OVER (ORDER BY OrderDate RANGE UNBOUNDED PRECEDING) AS RunningRange   -- ties jump together
FROM    Orders
WHERE   CustomerId = 7;

-- The LAST_VALUE trap and its fix
SELECT  CustomerId, OrderDate, Total,
        FIRST_VALUE(Total) OVER (PARTITION BY CustomerId ORDER BY OrderDate)        AS FirstOrderTotal,
        LAST_VALUE(Total)  OVER (PARTITION BY CustomerId ORDER BY OrderDate)        AS WrongLast,  -- = current row!
        LAST_VALUE(Total)  OVER (PARTITION BY CustomerId ORDER BY OrderDate
                                 ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS RightLast,
        FIRST_VALUE(Total) OVER (PARTITION BY CustomerId ORDER BY OrderDate DESC)   AS AlsoRightLast
FROM    Orders;

-- PostgreSQL only: calendar window instead of row window
-- AVG(sales) OVER (ORDER BY day RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW)` },
    { lang: 'sql', title: 'Gaps and islands: longest login streak, and sessionisation', code: `-- Logins(UserId, LoginDate) with one row per user per day (dedupe first if needed)

-- 1) Longest streak of consecutive days per user
WITH Numbered AS
(
    SELECT  UserId, LoginDate,
            ROW_NUMBER() OVER (PARTITION BY UserId ORDER BY LoginDate) AS rn
    FROM    (SELECT DISTINCT UserId, CAST(LoginDate AS DATE) AS LoginDate FROM Logins) d
),
Islands AS
(
    -- consecutive days share the same "anchor": date minus row number
    SELECT  UserId, LoginDate,
            DATEADD(DAY, -rn, LoginDate) AS IslandKey
    FROM    Numbered
),
Streaks AS
(
    SELECT  UserId,
            MIN(LoginDate) AS StreakStart,
            MAX(LoginDate) AS StreakEnd,
            COUNT(*)       AS StreakLength
    FROM    Islands
    GROUP BY UserId, IslandKey
)
SELECT  UserId, StreakStart, StreakEnd, StreakLength
FROM    (SELECT *, ROW_NUMBER() OVER (PARTITION BY UserId ORDER BY StreakLength DESC, StreakEnd DESC) AS rk
         FROM Streaks) s
WHERE   rk = 1;

-- 2) Sessionisation: a new session starts after a gap of more than 30 minutes
-- Events(UserId, EventTime)
WITH Flagged AS
(
    SELECT  UserId, EventTime,
            CASE WHEN DATEDIFF(MINUTE,
                               LAG(EventTime) OVER (PARTITION BY UserId ORDER BY EventTime),
                               EventTime) > 30
                   OR LAG(EventTime) OVER (PARTITION BY UserId ORDER BY EventTime) IS NULL
                 THEN 1 ELSE 0 END AS IsNewSession
    FROM    Events
),
Sessions AS
(
    SELECT  UserId, EventTime,
            SUM(IsNewSession) OVER (PARTITION BY UserId ORDER BY EventTime
                                    ROWS UNBOUNDED PRECEDING) AS SessionNo   -- running sum = session id
    FROM    Flagged
)
SELECT  UserId, SessionNo,
        MIN(EventTime) AS SessionStart,
        MAX(EventTime) AS SessionEnd,
        COUNT(*)       AS Events
FROM    Sessions
GROUP BY UserId, SessionNo
ORDER BY UserId, SessionNo;` }
  ],
  pitfalls: [
    'Expecting LAST_VALUE to give the last row of the partition. With the default frame it returns the current row. Add ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING, or use FIRST_VALUE with DESC.',
    'Leaving the frame as the default RANGE for running totals. It groups tied ORDER BY values and is slower. Write ROWS UNBOUNDED PRECEDING explicitly.',
    'Integer division in percent-of-total: Total / SUM(Total) OVER () gives 0. Multiply by 100.0 or CAST to DECIMAL.',
    'Dividing by LAG(...) without NULLIF, which throws on a zero previous value.',
    'Computing a moving average over rows when the business means calendar days, and the data has missing days. Generate the date series first.',
    'Forgetting that a window aggregate still needs the partition ORDER BY to be deterministic; ties can make running totals differ between runs unless you add a unique column.'
  ],
  quiz: [
    { q: 'What does SUM(Total) OVER (PARTITION BY CustomerId ORDER BY OrderDate) compute?', options: ['The grand total of all orders', 'The customer\'s full total, the same on every row', 'The customer\'s running total up to this row', 'The previous order\'s total'], answer: 2, why: 'Adding ORDER BY to the window makes the aggregate cumulative: it sums from the first row of the partition to the current row.' },
    { q: 'LAST_VALUE(x) OVER (ORDER BY d) returns the current row\'s x. Why?', options: ['LAST_VALUE ignores the ORDER BY in OVER', 'The default frame ends at the current row', 'ORDER BY must be DESC for LAST_VALUE to work', 'It needs PARTITION BY to find the last row'], answer: 1, why: 'The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. Extend it to UNBOUNDED FOLLOWING to see the real last row.' },
    { q: 'Which frame gives a trailing 7-row moving average (the current row and the rows before it)?', options: ['ROWS BETWEEN 7 PRECEDING AND CURRENT ROW', 'ROWS BETWEEN 6 PRECEDING AND CURRENT ROW', 'RANGE 7', 'ROWS BETWEEN CURRENT ROW AND 6 FOLLOWING'], answer: 1, why: '6 preceding rows plus the current row is 7 rows.' },
    { q: 'What is the difference between ROWS and RANGE in a frame?', options: ['No difference; RANGE is just the older spelling of ROWS', 'ROWS counts rows; RANGE treats tied ORDER BY values as one', 'RANGE is faster because it skips tied rows entirely', 'ROWS only works when the ORDER BY column is an integer'], answer: 1, why: 'With duplicate ORDER BY values, RANGE includes all ties in the frame at once, and in SQL Server it is also slower because of the Window Spool.' },
    { q: 'How does the "date minus row number" trick find consecutive-day streaks?', options: ['It sorts the dates descending so streaks come first', 'Consecutive days all give the same difference', 'It removes duplicate dates before counting', 'It converts dates to integers so they compare faster'], answer: 1, why: 'If dates increase by 1 and row numbers increase by 1, their difference stays constant inside a streak and changes when a day is skipped.' },
    { q: 'What does LAG(Total, 1, 0) return on the first row of a partition?', options: ['NULL', '0', 'The first row\'s Total', 'An error'], answer: 1, why: 'The third argument is the default used when there is no previous row. Without it the result would be NULL.' }
  ],
  takeaways: [
    'OVER () = grand total on every row; add PARTITION BY for group totals; add ORDER BY for running totals.',
    'Always write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for running totals: faster and no tie surprises.',
    'LAG/LEAD read neighbouring rows; give them a default (third argument) and guard division with NULLIF.',
    'LAST_VALUE needs an explicit frame to UNBOUNDED FOLLOWING; FIRST_VALUE with DESC is often clearer.',
    'Gaps and islands: ROW_NUMBER subtracted from the date groups consecutive runs; LAG → flag → running SUM builds sessions.',
    'Index on (partition columns, order columns) and prefer batch mode on big reporting tables.'
  ],
  interview: [
    { q: 'How do you compute a running total in SQL, and what frame should you use?', a: `<p>SUM(amount) OVER (PARTITION BY account ORDER BY date, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW). Specify ROWS explicitly: the default RANGE frame groups tied dates and is slower in SQL Server. Include a unique tie-breaker in the ORDER BY so the result is deterministic.</p>` },
    { q: 'Explain the LAST_VALUE gotcha.', a: `<p>With ORDER BY and the default frame (UNBOUNDED PRECEDING to CURRENT ROW), the last row in the frame is always the current row, so LAST_VALUE returns the row's own value. Fix by setting the frame to UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING, or use FIRST_VALUE with a DESC order.</p>` },
    { q: 'How would you find each user\'s longest streak of consecutive active days?', a: `<p>Dedupe to one row per user per day, assign ROW_NUMBER ordered by date per user, compute date minus row number as an island key, GROUP BY user and island key to get each streak's length, then pick the max per user. This is the gaps-and-islands pattern.</p>` },
    { q: 'How do you compute month-over-month growth?', a: `<p>Aggregate revenue per month in a CTE, then use LAG(revenue) OVER (ORDER BY month) for the previous month and compute (current - previous) / NULLIF(previous, 0). Aggregating first keeps the window simple and the plan efficient.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m3-sql-indexes — Indexes & Query Optimization                        */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-indexes'] = {
  hook: `The same query can take 4 seconds or 4 milliseconds on the same data. The only difference is whether the database can jump to the right rows or has to read every one of them.`,
  intro: `<p>An <span class="term">index</span> is a separate, sorted structure that the database keeps next to a table so it can find rows without reading the whole table. It works like the index at the back of a book: instead of reading 600 pages to find "recursion", you look it up in the sorted list and jump to page 214.</p>
<p>Without an index, every <code>WHERE Email = 'x'</code> is a <span class="term">table scan</span>: the engine reads every row and checks each one. With an index on Email, it is an <span class="term">index seek</span>: a few jumps through a sorted tree and done. On a table with ten million rows that is the difference between seconds and microseconds.</p>
<p>But indexes are not free. Every insert, update and delete must also update every index on the table, and each index takes disk space and memory. So the skill is not "add indexes everywhere"; it is choosing the few right ones, in the right column order, and writing queries that can actually use them. That is what this lesson teaches, along with how to read an <span class="term">execution plan</span>, the database's own explanation of what it did.</p>`,
  realLife: {
    title: 'The library with and without a catalogue',
    body: `<p>Imagine a library with 100,000 books stacked in the order they arrived. To find "Clean Code", you walk every shelf. That is a table scan. Now the librarian builds a card catalogue sorted by title: you flip to "C", then "Cl", and the card tells you the exact shelf. That is an index seek. A second catalogue sorted by author lets you search a different way. But each new book now needs a card in every catalogue, so the librarian spends more time filing and less time at the desk. Too many catalogues and the library slows down for everyone.</p>
<p>A <span class="term">clustered index</span> is the shelf order itself (books physically sorted by title). You can only have one physical order. Non-clustered indexes are the extra catalogues that point back to the shelf.</p>
<p><strong>Where companies use this:</strong> Every login screen in the world depends on an index on the username or email column. Payment companies index (MerchantId, CreatedAt) so a merchant's dashboard loads instantly. A missing index is the number one cause of "the site got slow as we grew", and adding one is the most common performance fix a .NET developer will ever make.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>What a B-tree index looks like</h4>
<p>Almost all indexes are <span class="term">B-trees</span> (balanced trees). Picture a pyramid of pages. The top page says "A to L go left, M to Z go right". The next level splits further. At the bottom are the <span class="term">leaf pages</span>, which hold the indexed values in sorted order with a pointer to the row. Finding one value means reading one page per level: for millions of rows that is usually only 3 or 4 pages. That is why a seek is so fast and why the tree stays fast as the table grows.</p>
<h4>Clustered vs non-clustered</h4>
<ul>
<li><strong>Clustered index</strong>: the table itself is stored in this order. One per table. In SQL Server the primary key becomes the clustered index by default, so rows are physically sorted by Id. (PostgreSQL has no permanent clustered index; the heap is unordered and every index is separate.)</li>
<li><strong>Non-clustered index</strong>: a separate sorted copy of some columns, with each leaf entry pointing back to the row (via the clustered key in SQL Server). You can have many.</li>
</ul>
<h4>Seek vs scan</h4>
<ul>
<li><strong>Index seek</strong>: the engine uses the tree to jump to the matching rows. Good.</li>
<li><strong>Index scan / table scan</strong>: the engine reads everything. Sometimes correct (you asked for all rows, or 40% of them) but usually a sign of a missing or unusable index.</li>
</ul>
<h4>When to add an index</h4>
<p>Index the columns you search by (WHERE), join on (JOIN ... ON), and sort by (ORDER BY) in your most frequent queries. Foreign key columns (CustomerId on Orders) are almost always worth indexing because every join and every "orders for this customer" query uses them.</p>
<h4>When not to</h4>
<ul>
<li>Tiny tables (a few hundred rows): a scan is already instant.</li>
<li>Columns with only two or three distinct values (IsActive): the index barely narrows the search.</li>
<li>Tables that are written far more than they are read (logs): every index slows the writes.</li>
</ul>
<div class="callout tip">Start with the slowest query your users complain about. Look at its WHERE and JOIN columns. Add one index. Measure. That loop solves most performance tickets.</div>` },
    { name: 'Intermediate', body: `<h4>Composite indexes and column order</h4>
<p>An index on <code>(CustomerId, OrderDate)</code> is sorted by CustomerId first, then by OrderDate within each customer. It can serve <code>WHERE CustomerId = 7</code>, and <code>WHERE CustomerId = 7 AND OrderDate &gt; '2026-01-01'</code>, and even provide the order for <code>ORDER BY OrderDate</code> for that customer. It <em>cannot</em> efficiently serve <code>WHERE OrderDate &gt; '2026-01-01'</code> alone, because dates are only sorted inside each customer. Rule: put equality columns first, then the range or sort column. Think of a phone book sorted by last name then first name: you can find all Sharmas, or Priya Sharma, but not "everyone named Priya" without scanning.</p>
<h4>Covering indexes and INCLUDE</h4>
<p>If a query needs columns that are not in the index, the engine seeks the index and then does a <span class="term">key lookup</span> to the table for each row to fetch the rest. For a few rows that is fine; for thousands it is slow. A <span class="term">covering index</span> contains every column the query touches, so no lookup is needed. In SQL Server you add non-key columns with <code>INCLUDE (Total, Status)</code>: they live only in the leaf pages, keeping the tree small. PostgreSQL 11+ has the same <code>INCLUDE</code>.</p>
<h4>Selectivity</h4>
<p><span class="term">Selectivity</span> is how much a condition narrows the rows. <code>Email = 'x'</code> matches one row in a million: very selective, perfect for an index. <code>Country = 'IN'</code> matches 60% of rows: the engine will rightly ignore the index and scan, because following a million pointers is slower than reading the table in order. The optimizer decides using <span class="term">statistics</span> (a histogram of column values). Stale statistics lead to bad plans; SQL Server auto-updates them, but after a big load run <code>UPDATE STATISTICS</code>.</p>
<h4>SARGable predicates</h4>
<p>A condition is <span class="term">SARGable</span> (Search ARGument-able) if the engine can use an index seek for it. The rule: leave the column alone and put the work on the other side.</p>
<table><thead><tr><th>Not SARGable (scan)</th><th>SARGable (seek)</th></tr></thead><tbody>
<tr><td>WHERE YEAR(OrderDate) = 2026</td><td>WHERE OrderDate &gt;= '2026-01-01' AND OrderDate &lt; '2027-01-01'</td></tr>
<tr><td>WHERE LOWER(Email) = 'a@b.com'</td><td>WHERE Email = 'a@b.com' (case-insensitive collation) or index a computed column</td></tr>
<tr><td>WHERE Total * 1.18 &gt; 1000</td><td>WHERE Total &gt; 1000 / 1.18</td></tr>
<tr><td>WHERE Name LIKE '%son'</td><td>WHERE Name LIKE 'John%'</td></tr>
<tr><td>WHERE ISNULL(Status, 'A') = 'A'</td><td>WHERE (Status = 'A' OR Status IS NULL)</td></tr>
</tbody></table>
<h4>Reading an execution plan</h4>
<p>In SSMS press Ctrl+M (Include Actual Execution Plan) and run the query, or use <code>SET STATISTICS IO ON</code> to see logical reads. Read the plan right to left. Look for: Table Scan or Clustered Index Scan on big tables (missing index), Key Lookup with a thick arrow (needs INCLUDE), Sort (missing ORDER BY support), and a large gap between Estimated and Actual rows (stale statistics or a parameter sniffing problem). PostgreSQL: <code>EXPLAIN (ANALYZE, BUFFERS)</code> shows the same story in text.</p>
<h4>EF Core and indexes</h4>
<p>EF Core creates indexes for foreign keys automatically. Add others in <code>OnModelCreating</code> with <code>entity.HasIndex(o =&gt; new { o.CustomerId, o.OrderDate }).IncludeProperties(o =&gt; o.Total)</code>, then create a migration. Watch the SQL EF generates (log it) and check it is SARGable; <code>Where(o =&gt; o.OrderDate.Year == 2026)</code> translates to <code>DATEPART(year, OrderDate)</code>, a function on the column, and scans.</p>
<div class="callout warn">The "missing index" hint in SSMS plans is a suggestion, not a design. It often proposes a huge INCLUDE list. Combine it with your knowledge of the query workload before creating it.</div>` },
    { name: 'Expert', body: `<h4>Inside the B+tree</h4>
<p>SQL Server and PostgreSQL both use B+trees: internal pages hold only keys and child pointers; leaf pages hold the keys plus either the full row (clustered) or the row locator (non-clustered), and leaves are linked in a doubly linked list so range scans walk sideways without going back up. Pages are 8 KB. A narrow integer key fits hundreds of entries per page, so a 3-level tree addresses hundreds of millions of rows. A wide key (a GUID or a long string) halves the fan-out and adds levels, and because every non-clustered index in SQL Server stores the clustered key in each leaf entry, a wide clustered key bloats every other index too. That is the real argument for a narrow, ever-increasing clustered key (an identity or a sequential GUID): small indexes and inserts that append at the end instead of splitting pages in the middle.</p>
<h4>Page splits and fragmentation</h4>
<p>Inserting into the middle of a full leaf page splits it: half the rows move to a new page, which is written somewhere else on disk. Random GUID keys cause constant splits, high fragmentation and wasted space. Fill factor leaves free space in pages to absorb inserts. Rebuild or reorganise indexes when fragmentation gets high (traditionally &gt;30% rebuild, 5 to 30% reorganise), although on SSDs the cost of fragmentation is much lower than it was on spinning disks; the bigger cost is wasted memory from half-empty pages.</p>
<h4>Write cost, quantified</h4>
<p>Each non-clustered index turns one logical insert into N+1 physical writes, and an update to an indexed column into a delete+insert in that index. On a hot table with ten indexes, write throughput can drop several times over. Audit with <code>sys.dm_db_index_usage_stats</code>: indexes with many updates and zero seeks since the last restart are candidates for removal. Also look for duplicates and left-prefix overlaps: an index on (A) is redundant if one on (A, B) exists.</p>
<h4>Parameter sniffing</h4>
<p>SQL Server compiles a plan for the first parameter value it sees and reuses it. A plan built for <code>CustomerId = 7</code> (3 orders, index seek + lookups) is terrible for a customer with 2 million orders, and vice versa. Fixes: <code>OPTION (RECOMPILE)</code> for a few queries, <code>OPTIMIZE FOR UNKNOWN</code>, or splitting the procedure by workload. SQL Server 2022's parameter-sensitive plan optimisation keeps several plans per statement. Understand this before you blame the index.</p>
<h4>Specialised index types</h4>
<ul>
<li><strong>Filtered index</strong>: <code>WHERE Status = 'Pending'</code> on the index itself; tiny and perfect for a queue table. PostgreSQL calls this a partial index.</li>
<li><strong>Columnstore</strong> (SQL Server): columns stored compressed per segment; 10x faster for analytics scans, poor for point lookups. Use for reporting tables or as a secondary index on a transactional table.</li>
<li><strong>Full-text</strong> and PostgreSQL <strong>GIN</strong>: word-level search in text and jsonb.</li>
<li><strong>Vector indexes</strong> (HNSW in pgvector, SQL Server 2025 vector type): nearest-neighbour search for embeddings; see the Gen AI module.</li>
<li><strong>Hash indexes</strong> (PostgreSQL): equality only, no ranges, rarely worth it over a B-tree.</li>
</ul>
<h4>Query optimisation checklist</h4>
<ol>
<li>Capture the slow query with its real parameters (Query Store or Extended Events).</li>
<li>Get the actual plan and STATISTICS IO; find the operator with the most reads.</li>
<li>Make predicates SARGable; remove functions on columns; avoid implicit conversions (an NVARCHAR parameter against a VARCHAR column scans the whole index).</li>
<li>Add or widen one index (equality columns, then range, then INCLUDE); re-measure.</li>
<li>Check statistics freshness and parameter sniffing before adding more indexes.</li>
<li>Only then consider rewriting the query (EXISTS instead of IN with a subquery, avoiding SELECT *, paging with keyset).</li>
</ol>
<div class="callout idea">Interviewers ask "why is my query slow even though the column is indexed?". Have the list ready: non-SARGable predicate, implicit conversion, low selectivity, wrong column order in a composite index, key lookups on many rows, stale statistics, parameter sniffing.</div>` }
  ],
  flow: {
    title: 'How an index seek finds one order among ten million',
    steps: [
      { title: 'Query arrives', desc: 'SELECT Total FROM Orders WHERE CustomerId = 7 AND OrderDate >= 2026-01-01. The optimizer checks which indexes cover these columns.' },
      { title: 'Pick the index', desc: 'IX_Orders(CustomerId, OrderDate) INCLUDE (Total) matches: equality on the first key column, range on the second, and Total is included. Statistics say ~40 rows match, so a seek is chosen over a scan.' },
      { title: 'Read the root page', desc: 'One 8 KB page. It says customers 1 to 5,000 are in the left subtree, 5,001+ in the right. One logical read.' },
      { title: 'Walk down the tree', desc: 'Two more pages narrow down to the leaf page where CustomerId 7 starts. Three reads so far, regardless of table size.' },
      { title: 'Range scan the leaves', desc: 'Leaf entries for customer 7 are contiguous and sorted by OrderDate. The engine reads forward from 2026-01-01 until the customer changes. Maybe one or two pages.' },
      { title: 'No key lookup needed', desc: 'Total is an INCLUDE column, so it is right there in the leaf. The engine never touches the clustered index. The query finishes with about 5 logical reads instead of 200,000.' },
      { title: 'Return rows', desc: '40 rows go back to the application, already in OrderDate order, so a later ORDER BY OrderDate costs nothing.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'Create the right indexes and measure the difference', code: `-- Baseline: see how many pages the query reads
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

SELECT Id, OrderDate, Total
FROM   Orders
WHERE  CustomerId = 7
  AND  OrderDate >= '2026-01-01'
ORDER BY OrderDate;
-- Messages tab: Table 'Orders'. Scan count 1, logical reads 187000  <- a scan

-- Composite covering index: equality column first, then range/sort column, then INCLUDE
CREATE NONCLUSTERED INDEX IX_Orders_Customer_Date
    ON Orders (CustomerId, OrderDate)
    INCLUDE (Total);

-- Run the same query again
-- Messages tab: logical reads 5  <- a seek, covered

-- Filtered index for a queue-style table: tiny and always hot
CREATE NONCLUSTERED INDEX IX_Orders_Pending
    ON Orders (CreatedAt)
    INCLUDE (CustomerId, Total)
    WHERE Status = 'Pending';

-- Index a computed column so LOWER(Email) lookups can seek
ALTER TABLE Customers ADD EmailLower AS LOWER(Email) PERSISTED;
CREATE UNIQUE INDEX UX_Customers_EmailLower ON Customers (EmailLower);

-- PostgreSQL equivalents
-- CREATE INDEX ix_orders_customer_date ON orders (customer_id, order_date) INCLUDE (total);
-- CREATE INDEX ix_orders_pending ON orders (created_at) WHERE status = 'Pending';   -- partial index
-- CREATE UNIQUE INDEX ux_customers_email_lower ON customers (LOWER(email));          -- expression index
-- EXPLAIN (ANALYZE, BUFFERS) SELECT ...;` },
    { lang: 'sql', title: 'SARGable rewrites and finding unused or missing indexes', code: `-- 1) Non-SARGable -> SARGable rewrites (same results, seek instead of scan)
-- Bad: function on the column
SELECT * FROM Orders WHERE YEAR(OrderDate) = 2026 AND MONTH(OrderDate) = 11;
-- Good: range on the raw column
SELECT * FROM Orders WHERE OrderDate >= '2026-11-01' AND OrderDate < '2026-12-01';

-- Bad: implicit conversion. Email is VARCHAR, parameter is NVARCHAR -> whole index converted
DECLARE @e NVARCHAR(100) = N'priya@example.com';
SELECT * FROM Customers WHERE Email = @e;
-- Good: match the column's type
DECLARE @e2 VARCHAR(100) = 'priya@example.com';
SELECT * FROM Customers WHERE Email = @e2;

-- Bad: arithmetic on the column
SELECT * FROM OrderItems WHERE Quantity * UnitPrice > 1000;
-- Good when one side is a constant: move the maths
SELECT * FROM Orders WHERE Total > 1000 / 1.18;

-- Bad: leading wildcard
SELECT * FROM Products WHERE Name LIKE '%phone%';
-- Alternative: full-text search
-- SELECT * FROM Products WHERE CONTAINS(Name, 'phone');

-- 2) Indexes that are maintained but never used (since last restart)
SELECT  OBJECT_NAME(s.object_id) AS TableName,
        i.name                   AS IndexName,
        s.user_seeks, s.user_scans, s.user_lookups,
        s.user_updates           AS WritesPaid
FROM    sys.dm_db_index_usage_stats s
JOIN    sys.indexes i ON i.object_id = s.object_id AND i.index_id = s.index_id
WHERE   s.database_id = DB_ID()
  AND   i.type_desc = 'NONCLUSTERED'
  AND   s.user_seeks + s.user_scans + s.user_lookups = 0
ORDER BY s.user_updates DESC;

-- 3) Indexes the optimizer wished it had (treat as hints, not orders)
SELECT  TOP (20)
        d.statement                                   AS TableName,
        d.equality_columns, d.inequality_columns, d.included_columns,
        gs.user_seeks, gs.avg_user_impact
FROM    sys.dm_db_missing_index_details d
JOIN    sys.dm_db_missing_index_groups g        ON g.index_handle = d.index_handle
JOIN    sys.dm_db_missing_index_group_stats gs  ON gs.group_handle = g.index_group_handle
ORDER BY gs.avg_user_impact * gs.user_seeks DESC;` },
    { lang: 'csharp', title: 'Declaring indexes in EF Core and writing SARGable LINQ', code: `using Microsoft.EntityFrameworkCore;

public class ShopContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // Composite covering index: equality column, then range column, then included column
        b.Entity<Order>()
         .HasIndex(o => new { o.CustomerId, o.OrderDate })
         .HasDatabaseName("IX_Orders_Customer_Date")
         .IncludeProperties(o => o.Total);

        // Filtered index for the pending queue
        b.Entity<Order>()
         .HasIndex(o => o.CreatedAt)
         .HasFilter("[Status] = 'Pending'");

        // Unique index on a normalised column (store it lowercased in code)
        b.Entity<Customer>()
         .HasIndex(c => c.EmailLower)
         .IsUnique();
    }
}

public static class OrderQueries
{
    // SARGable: the column is compared to values; EF translates to >= and <
    public static Task<List<OrderSummary>> ForMonthAsync(ShopContext db, int customerId, int year, int month)
    {
        var from = new DateTime(year, month, 1);
        var to = from.AddMonths(1);
        return db.Orders
                 .Where(o => o.CustomerId == customerId
                          && o.OrderDate >= from
                          && o.OrderDate < to)
                 .OrderBy(o => o.OrderDate)
                 .Select(o => new OrderSummary(o.Id, o.OrderDate, o.Total))  // only covered columns
                 .ToListAsync();
    }

    // NOT SARGable: o.OrderDate.Year becomes DATEPART(year, [OrderDate]) and forces a scan. Avoid.
    // db.Orders.Where(o => o.OrderDate.Year == year && o.OrderDate.Month == month)
}

public record OrderSummary(int Id, DateTime OrderDate, decimal Total);

public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public DateTime OrderDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; } = "Pending";
}

public class Customer
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string EmailLower { get; set; } = "";   // set to Email.ToLowerInvariant() before saving
}` }
  ],
  pitfalls: [
    'Wrapping the indexed column in a function (YEAR(), LOWER(), ISNULL()) in WHERE. The index cannot be seeked; rewrite as a range or index a computed column.',
    'Wrong column order in a composite index: a range or low-selectivity column first makes the index useless for the equality filter that follows.',
    'Implicit conversions: comparing a VARCHAR column to an NVARCHAR parameter (common with EF Core strings) converts the whole index and scans. Match types or configure IsUnicode(false).',
    'Adding every suggested "missing index". Each one slows every write; check usage stats and overlap with existing indexes first.',
    'Using SELECT * so no index can be covering, forcing a key lookup per row.',
    'Blaming the index when the real problem is stale statistics or parameter sniffing. Compare estimated vs actual rows in the plan first.'
  ],
  quiz: [
    { q: 'Why is an index seek fast even on a table with 100 million rows?', options: ['It reads the whole table in parallel on all cores', 'A B-tree reaches any value in a few page reads', 'The index is always kept entirely in CPU cache', 'It skips rows that are NULL'], answer: 1, why: 'B-trees are shallow and wide. Each level narrows the search by hundreds of times, so 3 or 4 page reads reach the leaf regardless of table size.' },
    { q: 'Index on (CustomerId, OrderDate). Which query can seek on it?', options: ['WHERE OrderDate > \'2026-01-01\' AND Total > 100', 'WHERE CustomerId = 7 AND OrderDate > \'2026-01-01\'', 'WHERE YEAR(OrderDate) = 2026 AND MONTH(OrderDate) = 11', 'WHERE Total > 100'], answer: 1, why: 'The index is sorted by CustomerId first. Only queries that filter on the leading column (CustomerId) can use the tree; OrderDate alone is not sorted across customers.' },
    { q: 'What does INCLUDE (Total) do on a non-clustered index?', options: ['Sorts the whole index by Total', 'Stores Total in the index leaf pages only', 'Creates a second index on Total', 'Makes Total part of the primary key'], answer: 1, why: 'Included columns are copied into the leaf level only. The query can be answered from the index alone (a covering index) without visiting the table.' },
    { q: 'Which predicate is SARGable?', options: ['WHERE LOWER(Email) = \'priya@b.com\'', 'WHERE OrderDate >= \'2026-01-01\'', 'WHERE Name LIKE \'%son\'', 'WHERE Total * 1.18 > 500'], answer: 1, why: 'The column is left untouched and compared to constants, so the engine can seek the index range. The others apply a function, a leading wildcard, or arithmetic to the column.' },
    { q: 'When might the optimizer correctly ignore an index on Country?', options: ['Never; an index that exists is always used', 'When the filter matches a large share of the rows', 'When the table already has a primary key on Id', 'When the column stores strings rather than numbers'], answer: 1, why: 'Low selectivity (e.g. 60% of rows match) makes a scan cheaper than millions of random lookups. Statistics tell the optimizer which case it is in.' },
    { q: 'What is the main cost of adding a sixth index to a busy table?', options: ['Every read must now check all six indexes', 'Every write must also maintain that index', 'The primary key has to be rebuilt each time', 'Queries can only use one index per table'], answer: 1, why: 'Indexes speed reads but every write must update each index. Too many indexes on a write-heavy table reduce throughput and waste memory.' }
  ],
  takeaways: [
    'A B-tree index finds any row in a handful of page reads; a scan reads everything.',
    'Composite index order: equality columns first, then the range or sort column, then INCLUDE the rest the query needs.',
    'Keep predicates SARGable: no functions, arithmetic or implicit conversions on the column side.',
    'Index foreign keys and the columns in your most frequent WHERE, JOIN and ORDER BY clauses; skip tiny tables and low-selectivity columns.',
    'Read the actual execution plan: scans on big tables, key lookups, sorts, and estimated-vs-actual gaps tell you what to fix.',
    'Every index costs writes and memory; review usage stats and drop the ones nobody uses.'
  ],
  interview: [
    { q: 'What is the difference between a clustered and a non-clustered index?', a: `<p>A clustered index defines the physical order of the table's rows; there can be only one, and its leaf level is the data itself. A non-clustered index is a separate sorted structure whose leaf entries point back to the row (via the clustered key in SQL Server). You can have many non-clustered indexes, each costing extra writes and space.</p>` },
    { q: 'My query is slow although the column is indexed. What would you check?', a: `<p>In order: is the predicate SARGable (no function or arithmetic on the column)? Is there an implicit type conversion? Is the column the leading column of the index? Is the filter selective enough for a seek? Are there expensive key lookups that a covering index would remove? Are statistics stale, or is a cached plan from a different parameter (parameter sniffing) being reused?</p>` },
    { q: 'What is a covering index and when would you create one?', a: `<p>An index that contains every column a query reads, either as key columns or INCLUDE columns, so the engine never has to look up the base table. Create one for a hot query that returns many rows and currently shows a Key Lookup in its plan.</p>` },
    { q: 'How do you decide the column order in a composite index?', a: `<p>Columns used with equality (=) go first, most selective first among them if several, followed by the column used in a range (&gt;, BETWEEN) or ORDER BY. Columns only returned, not filtered, go in INCLUDE. An index on (A, B) also serves queries on A alone, but not on B alone.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m3-sql-transactions — Transactions & Isolation Levels                */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-transactions'] = {
  hook: `Move 500 rupees from account A to account B. Two statements. If the server dies between them, the money is gone. A transaction is the promise that either both happen or neither does.`,
  intro: `<p>A <span class="term">transaction</span> is a group of SQL statements that the database treats as one unit of work. You start it, run several changes, and then either <code>COMMIT</code> (make all of them permanent) or <code>ROLLBACK</code> (undo all of them). No one else ever sees a half-finished state.</p>
<p>Transactions give you the four <span class="term">ACID</span> guarantees: <strong>Atomic</strong> (all or nothing), <strong>Consistent</strong> (rules like foreign keys and constraints hold before and after), <strong>Isolated</strong> (concurrent transactions do not trip over each other), and <strong>Durable</strong> (once committed, it survives a crash).</p>
<p>The interesting part is Isolation. Perfect isolation (every transaction runs as if alone) is slow because everyone has to wait. So databases offer <span class="term">isolation levels</span>: a dial from "fast but you may see other people's unfinished work" to "safe but lots of waiting". Choosing the level, and understanding the locks and deadlocks that come with it, is what separates developers who write correct systems from those who get a 3 a.m. call about duplicate orders.</p>`,
  realLife: {
    title: 'Two people booking the last seat',
    body: `<p>A cinema has one seat left. Asha and Bala both open the booking page at the same moment. Both see "1 seat available". Both click Book. Without a transaction with the right isolation, both bookings succeed and two people arrive for one seat. With the right approach, the database lets one booking read-and-update the seat count as a single protected step; the other waits, then sees "0 seats" and fails politely.</p>
<p>Every "last item", "unique username", "account balance" or "inventory count" problem is this scenario. The fix is never "check in C# then update"; it is a transaction with the right isolation, or an atomic UPDATE with a WHERE condition that checks the count.</p>
<p><strong>Where companies use this:</strong> UPI and card payments (debit one account, credit another, atomically). Flight and train booking (IRCTC, airlines) holding seats. E-commerce checkout decrementing stock. Any system with money or limited inventory lives and dies by this lesson.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The three commands</h4>
<ul>
<li><code>BEGIN TRANSACTION</code> (PostgreSQL: <code>BEGIN</code>): start the unit of work.</li>
<li><code>COMMIT</code>: make every change since BEGIN permanent, all at once.</li>
<li><code>ROLLBACK</code>: throw away every change since BEGIN.</li>
</ul>
<p>In SQL Server, each single statement is already its own transaction (<span class="term">autocommit</span>). You only need BEGIN when two or more statements must succeed or fail together.</p>
<h4>The bank transfer, the right way</h4>
<ol>
<li>BEGIN TRANSACTION</li>
<li>UPDATE Accounts SET Balance = Balance - 500 WHERE Id = 'A'</li>
<li>UPDATE Accounts SET Balance = Balance + 500 WHERE Id = 'B'</li>
<li>If both worked: COMMIT. If anything failed: ROLLBACK.</li>
</ol>
<p>If the server crashes after step 2, the database's <span class="term">transaction log</span> shows an uncommitted transaction and undoes step 2 on restart. A's money comes back. That is atomicity and durability working together.</p>
<h4>What "isolation" protects you from</h4>
<p>While your transaction runs, other transactions are running too. Three bad things can happen if the database does not isolate you:</p>
<ul>
<li><span class="term">Dirty read</span>: you read a row another transaction changed but has not committed yet. They roll back; you acted on data that never existed.</li>
<li><span class="term">Non-repeatable read</span>: you read a row, someone commits a change, you read it again in the same transaction and get a different value.</li>
<li><span class="term">Phantom read</span>: you run "count orders where status = pending", someone inserts a new pending order and commits, you count again and the number changed.</li>
</ul>
<h4>The isolation dial</h4>
<p>From loosest to strictest: READ UNCOMMITTED → READ COMMITTED (the default in SQL Server and PostgreSQL) → REPEATABLE READ → SERIALIZABLE. Each step prevents one more of the problems above and makes transactions wait more. The Intermediate level has the table.</p>
<div class="callout tip">Keep transactions short. Do all your thinking and validation in C# first, then open the transaction, run the writes, commit. Never wait for user input or call an external API while a transaction is open.</div>` },
    { name: 'Intermediate', body: `<h4>Isolation levels and what they prevent</h4>
<table><thead><tr><th>Level</th><th>Dirty read</th><th>Non-repeatable read</th><th>Phantom</th><th>How</th></tr></thead><tbody>
<tr><td>READ UNCOMMITTED</td><td>possible</td><td>possible</td><td>possible</td><td>No read locks at all (NOLOCK)</td></tr>
<tr><td>READ COMMITTED</td><td>prevented</td><td>possible</td><td>possible</td><td>Read lock held only while reading the row</td></tr>
<tr><td>REPEATABLE READ</td><td>prevented</td><td>prevented</td><td>possible</td><td>Read locks held until commit</td></tr>
<tr><td>SERIALIZABLE</td><td>prevented</td><td>prevented</td><td>prevented</td><td>Range locks: nobody can insert into the ranges you read</td></tr>
<tr><td>SNAPSHOT (SQL Server) / PostgreSQL REPEATABLE READ</td><td>prevented</td><td>prevented</td><td>prevented*</td><td>Readers see a consistent version from the start of the transaction; no read locks</td></tr>
</tbody></table>
<p>*Snapshot gives each transaction a frozen view, so phantoms cannot appear in your reads, but it does not stop two transactions from both deciding to insert the same thing; see write skew in the Expert level. The first four rows describe SQL Server's lock-based behaviour. PostgreSQL never allows dirty reads: if you ask it for READ UNCOMMITTED, it behaves like READ COMMITTED.</p>
<h4>Locks in plain words</h4>
<p>A <span class="term">shared lock</span> (S) says "I am reading this; you may read too but not write". An <span class="term">exclusive lock</span> (X) says "I am writing this; nobody may read or write until I commit". Locks can be on a row, a page, or the whole table; the engine escalates to bigger locks when there are thousands of small ones. <span class="term">Blocking</span> is one transaction waiting for another's lock. It is normal in small doses and the reason long transactions are dangerous.</p>
<h4>Deadlocks</h4>
<p>Transaction 1 locks row A then wants row B. Transaction 2 locks row B then wants row A. Each waits for the other forever. SQL Server detects this within seconds, picks a victim (usually the one with less work done), kills it with error 1205, and lets the other continue. PostgreSQL does the same with a deadlock error. Your application must catch this error and retry the whole transaction. Prevention: always touch tables and rows in the same order in every code path (e.g. always update Accounts by ascending Id), keep transactions short, and index your WHERE columns so updates lock a few rows rather than scanning and locking many.</p>
<h4>Snapshot isolation and RCSI</h4>
<p>SQL Server can keep old versions of rows in tempdb so readers never block writers and writers never block readers. Two switches: <code>READ_COMMITTED_SNAPSHOT ON</code> (RCSI) makes the default level use versions per statement; <code>ALLOW_SNAPSHOT_ISOLATION ON</code> enables the SNAPSHOT level per transaction. Most modern SQL Server apps turn RCSI on; Azure SQL has it on by default. PostgreSQL has always worked this way (MVCC), which is why its READ COMMITTED never blocks readers.</p>
<h4>The last-seat problem, solved three ways</h4>
<ol>
<li><strong>Atomic conditional update</strong>: <code>UPDATE Shows SET Seats = Seats - 1 WHERE Id = @id AND Seats &gt; 0</code>; check rows affected = 1. Simple and correct at any isolation level; prefer this.</li>
<li><strong>Pessimistic lock</strong>: <code>SELECT ... WITH (UPDLOCK, HOLDLOCK)</code> (PostgreSQL <code>SELECT ... FOR UPDATE</code>) inside the transaction, then check and update. Others wait at the SELECT.</li>
<li><strong>Optimistic concurrency</strong>: add a <code>RowVersion</code> column; <code>UPDATE ... WHERE Id = @id AND RowVersion = @seen</code>; zero rows affected means someone else changed it, so reload and retry. EF Core does this for you with <code>[Timestamp]</code> / <code>IsRowVersion()</code> and throws <code>DbUpdateConcurrencyException</code>.</li>
</ol>
<div class="callout warn">NOLOCK (READ UNCOMMITTED) is not a performance feature. It can return rows that were never committed, miss rows, or return the same row twice during a page split. Use RCSI instead if you need non-blocking reads.</div>` },
    { name: 'Expert', body: `<h4>Write-ahead logging and durability</h4>
<p>Every change is first written to the transaction log (sequential, fast) and only later to the data pages (random, slower, done by checkpoints). COMMIT returns only after the log record is on disk. On crash recovery, the engine redoes committed work that never reached the data files and undoes uncommitted work. This is why the log drive matters for write latency, why "delayed durability" (SQL Server) and <code>synchronous_commit = off</code> (PostgreSQL) trade a few milliseconds of possible loss for throughput, and why a full log drive stops all writes.</p>
<h4>MVCC versus locking</h4>
<p>PostgreSQL never updates a row in place: an UPDATE writes a new row version and marks the old one dead; VACUUM cleans up later. Readers pick the version visible to their snapshot. The cost is table bloat and the need for autovacuum tuning. SQL Server's default is lock-based; with RCSI or SNAPSHOT it stores versions in tempdb (or in the database with Accelerated Database Recovery), so tempdb sizing becomes part of your capacity plan. Know which model your database uses before reasoning about blocking.</p>
<h4>Write skew: the snapshot trap</h4>
<p>Rule: at least one doctor must be on call. Two doctors, both on call, each open a SNAPSHOT transaction, each see "2 on call", each remove themselves, both commit. Now zero are on call. No row was modified by both, so no conflict was detected. This is <span class="term">write skew</span>, and SNAPSHOT / PostgreSQL REPEATABLE READ allow it. Only true SERIALIZABLE prevents it: SQL Server does it with range locks (blocking), PostgreSQL with Serializable Snapshot Isolation (SSI), which lets both run and aborts one at commit with a serialization failure. Either way, your code must handle retry. Alternatively, make the conflict explicit: UPDATE a single "on call count" row in both transactions so they collide.</p>
<h4>Lock hints and escalation</h4>
<p>SQL Server escalates ~5,000 row locks in one statement to a table lock, blocking everyone. Batch big updates (10,000 rows per transaction in a loop). Hints like <code>ROWLOCK</code>, <code>UPDLOCK</code>, <code>HOLDLOCK</code>, <code>READPAST</code> (skip locked rows, perfect for queue tables with <code>DELETE TOP (1) ... WITH (READPAST, ROWLOCK)</code>) exist, but every hint is a promise that you understand the plan better than the engine. PostgreSQL's <code>FOR UPDATE SKIP LOCKED</code> is the queue-table idiom there.</p>
<h4>Transactions across services</h4>
<p>A single database transaction cannot span two microservices or a database plus a message queue. Distributed transactions (two-phase commit, MSDTC) exist but are slow and fragile. The modern answers are the <span class="term">outbox pattern</span> (write the business row and the "event to publish" row in one local transaction; a background worker publishes later) and <span class="term">sagas</span> (a sequence of local transactions with compensating actions). The HLD lesson on distributed transactions goes deeper.</p>
<h4>Practical rules for .NET code</h4>
<ul>
<li>EF Core's <code>SaveChanges</code> is already one transaction. Use <code>db.Database.BeginTransactionAsync()</code> only when several SaveChanges calls or raw SQL must be atomic.</li>
<li>Use an <span class="term">execution strategy</span> with retry (<code>EnableRetryOnFailure</code>) and wrap the whole unit of work in <code>strategy.ExecuteAsync</code>, because transient errors and deadlocks must retry the entire transaction, not one statement.</li>
<li>Set <code>SET XACT_ABORT ON</code> in stored procedures so any error rolls back the whole batch.</li>
<li>Never hold a transaction across an <code>await</code> on an HTTP call.</li>
</ul>
<div class="callout idea">Interview favourite: "Two requests try to register the same username at once. How do you guarantee uniqueness?" Correct answer: a UNIQUE constraint in the database, catch the violation, and return a friendly error. Checking with a SELECT first is a race condition at every isolation level below SERIALIZABLE.</div>` }
  ],
  flow: {
    title: 'A bank transfer under READ COMMITTED, with a crash and a retry',
    steps: [
      { title: 'BEGIN TRANSACTION', desc: 'The app opens a transaction. Nothing is locked yet. A log record marks the start.' },
      { title: 'Debit account A', desc: 'UPDATE Accounts SET Balance = Balance - 500 WHERE Id = A. The engine takes an exclusive (X) lock on A\'s row and writes an undo/redo record to the transaction log.' },
      { title: 'Another reader arrives', desc: 'A report tries to read A\'s balance. Under plain READ COMMITTED it waits for the X lock. Under RCSI it reads the last committed version (old balance) and continues.' },
      { title: 'Credit account B', desc: 'UPDATE Accounts SET Balance = Balance + 500 WHERE Id = B. A second X lock, a second log record. Both rows are now locked by this transaction.' },
      { title: 'Crash before COMMIT', desc: 'The server loses power. On restart, recovery scans the log, finds the transaction has no commit record, and undoes both updates. Money is back where it started.' },
      { title: 'App retries', desc: 'The C# execution strategy catches the connection failure and re-runs the whole unit of work: BEGIN, debit, credit.' },
      { title: 'COMMIT', desc: 'The commit record is flushed to the log on disk. Only now does COMMIT return. Both locks are released and other transactions can see the new balances.' },
      { title: 'Checkpoint later', desc: 'Minutes later a checkpoint writes the changed data pages to the data file. Durability was already guaranteed by the log at step 7.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'Transactions, error handling and isolation levels in T-SQL', code: `-- 1) The transfer with proper error handling
SET XACT_ABORT ON;            -- any runtime error rolls back the whole transaction

BEGIN TRY
    BEGIN TRANSACTION;

    UPDATE Accounts SET Balance = Balance - 500
    WHERE  Id = 'A' AND Balance >= 500;          -- business rule in the WHERE

    IF @@ROWCOUNT = 0
        THROW 50001, 'Insufficient funds', 1;   -- caught below, transaction rolled back

    UPDATE Accounts SET Balance = Balance + 500
    WHERE  Id = 'B';

    INSERT INTO Transfers (FromId, ToId, Amount, At) VALUES ('A', 'B', 500, SYSUTCDATETIME());

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;                                        -- re-raise to the caller (C#) with the original error
END CATCH;

-- 2) Seeing the isolation levels in action (run in two SSMS windows)
-- Window 1:
BEGIN TRANSACTION;
UPDATE Products SET Price = 999 WHERE Id = 1;    -- X lock held, not committed
-- (do not commit yet)

-- Window 2, try each:
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
SELECT Price FROM Products WHERE Id = 1;         -- returns 999 immediately: a DIRTY READ

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
SELECT Price FROM Products WHERE Id = 1;         -- waits (blocked) until window 1 commits/rolls back
                                                  -- with READ_COMMITTED_SNAPSHOT ON: returns the OLD price at once

SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN TRANSACTION;
SELECT COUNT(*) FROM Orders WHERE Status = 'Pending';  -- range lock: nobody can INSERT a pending order now
-- ... COMMIT;

-- 3) Turn on row versioning so readers never block writers (run once per database)
ALTER DATABASE Shop SET READ_COMMITTED_SNAPSHOT ON WITH ROLLBACK IMMEDIATE;
ALTER DATABASE Shop SET ALLOW_SNAPSHOT_ISOLATION ON;

-- PostgreSQL notes:
-- BEGIN; ... COMMIT;  SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;  (snapshot semantics)
-- SELECT ... FOR UPDATE;  SELECT ... FOR UPDATE SKIP LOCKED;  (queue tables)
-- Serialization failures raise SQLSTATE 40001: retry the transaction.` },
    { lang: 'sql', title: 'Last-seat booking three ways, and a queue table without double processing', code: `-- A) Atomic conditional update (best default): no race, any isolation level
UPDATE Shows
SET    SeatsLeft = SeatsLeft - 1
WHERE  Id = @ShowId AND SeatsLeft > 0;

IF @@ROWCOUNT = 1
    INSERT INTO Bookings (ShowId, CustomerId) VALUES (@ShowId, @CustomerId);
ELSE
    THROW 50002, 'Sold out', 1;

-- B) Pessimistic: lock the row while you decide
BEGIN TRANSACTION;
DECLARE @left INT;
SELECT @left = SeatsLeft
FROM   Shows WITH (UPDLOCK, HOLDLOCK)        -- PostgreSQL: SELECT ... FOR UPDATE
WHERE  Id = @ShowId;

IF @left > 0
BEGIN
    UPDATE Shows SET SeatsLeft = SeatsLeft - 1 WHERE Id = @ShowId;
    INSERT INTO Bookings (ShowId, CustomerId) VALUES (@ShowId, @CustomerId);
    COMMIT;
END
ELSE
    ROLLBACK;

-- C) Optimistic: a version column; zero rows affected = someone else won, reload and retry
UPDATE Shows
SET    SeatsLeft = SeatsLeft - 1
WHERE  Id = @ShowId AND RowVersion = @RowVersionISaw;   -- RowVersion is ROWVERSION/TIMESTAMP type

-- D) Job queue: many workers, each takes a different row, no double processing
DELETE TOP (1)
FROM   Jobs WITH (READPAST, ROWLOCK)         -- skip rows other workers have locked
OUTPUT deleted.Id, deleted.Payload
WHERE  Status = 'Queued';
-- PostgreSQL: DELETE FROM jobs WHERE id = (SELECT id FROM jobs WHERE status='Queued'
--             ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING *;` },
    { lang: 'csharp', title: 'Transactions, retry and optimistic concurrency with EF Core', code: `using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

// Startup: retry transient failures (network blips, deadlock victim 1205, Azure throttling)
// services.AddDbContext<BankContext>(o => o.UseSqlServer(conn,
//     sql => sql.EnableRetryOnFailure(maxRetryCount: 5, maxRetryDelay: TimeSpan.FromSeconds(10), errorNumbersToAdd: new[] { 1205 })));

public class TransferService(BankContext db)
{
    public async Task TransferAsync(string fromId, string toId, decimal amount, CancellationToken ct)
    {
        // The retrying execution strategy must wrap the WHOLE unit of work,
        // because a deadlock or transient error rolls back the entire transaction.
        var strategy = db.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            db.ChangeTracker.Clear();          // a retry must not re-save entities left over from a failed attempt
            await using var tx = await db.Database.BeginTransactionAsync(ct);

            // Atomic conditional debit: the WHERE enforces the balance rule in the database
            var debited = await db.Accounts
                .Where(a => a.Id == fromId && a.Balance >= amount)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.Balance, a => a.Balance - amount), ct);

            if (debited == 0)
                throw new InvalidOperationException("Insufficient funds");

            await db.Accounts
                .Where(a => a.Id == toId)
                .ExecuteUpdateAsync(s => s.SetProperty(a => a.Balance, a => a.Balance + amount), ct);

            db.Transfers.Add(new Transfer(fromId, toId, amount, DateTime.UtcNow));
            await db.SaveChangesAsync(ct);

            await tx.CommitAsync(ct);          // nothing is visible to others until here
        });
    }

    // Optimistic concurrency: EF adds "WHERE RowVersion = @original" to the UPDATE
    public async Task<bool> BookSeatAsync(int showId, int customerId, CancellationToken ct)
    {
        for (var attempt = 0; attempt < 3; attempt++)
        {
            var show = await db.Shows.SingleAsync(s => s.Id == showId, ct);
            if (show.SeatsLeft == 0) return false;

            show.SeatsLeft--;
            db.Bookings.Add(new Booking { ShowId = showId, CustomerId = customerId });
            try
            {
                await db.SaveChangesAsync(ct);
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                db.ChangeTracker.Clear();      // someone else changed the row: reload and try again
            }
        }
        return false;
    }
}

public class Account { public string Id { get; set; } = ""; public decimal Balance { get; set; } }
public record Transfer(string FromId, string ToId, decimal Amount, DateTime At) { public int Id { get; init; } }
public class Booking { public int Id { get; set; } public int ShowId { get; set; } public int CustomerId { get; set; } }
public class Show
{
    public int Id { get; set; }
    public int SeatsLeft { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];   // SQL Server rowversion column
}
public class BankContext(DbContextOptions<BankContext> o) : DbContext(o)
{
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Transfer> Transfers => Set<Transfer>();
    public DbSet<Show> Shows => Set<Show>();
    public DbSet<Booking> Bookings => Set<Booking>();
}` }
  ],
  pitfalls: [
    'Checking a value in C# and then updating it in a second statement ("read, decide, write"). Between the two, another request changes it. Use a conditional UPDATE, a lock, or a version column.',
    'Holding a transaction open while awaiting an HTTP call, sending an email, or waiting for the user. Locks pile up and the whole system blocks.',
    'Using NOLOCK everywhere to "fix" blocking. It returns uncommitted and sometimes duplicate or missing rows. Enable READ_COMMITTED_SNAPSHOT instead.',
    'Retrying only the failed statement after a deadlock. The transaction was rolled back; you must retry the entire unit of work.',
    'Relying on SNAPSHOT to prevent every anomaly. Write skew slips through; use SERIALIZABLE or make the two transactions touch a common row.',
    'Enforcing uniqueness with a SELECT-then-INSERT instead of a UNIQUE constraint. Two concurrent requests both pass the SELECT.'
  ],
  quiz: [
    { q: 'What does ROLLBACK do?', options: ['Saves the changes so far and keeps going', 'Undoes every change since BEGIN TRANSACTION', 'Deletes the transaction log for this session', 'Restarts the connection'], answer: 1, why: 'ROLLBACK discards all uncommitted work in the transaction, returning the data to its state at BEGIN. COMMIT is the opposite.' },
    { q: 'Which anomaly does READ COMMITTED prevent that READ UNCOMMITTED allows?', options: ['Phantom reads', 'Dirty reads', 'Deadlocks', 'Write skew'], answer: 1, why: 'READ COMMITTED never returns data from an uncommitted transaction. It still allows non-repeatable and phantom reads.' },
    { q: 'What is a deadlock?', options: ['A query that runs forever because of a missing index', 'Two transactions each waiting on the other\'s lock', 'A table with no primary key', 'A transaction that was rolled back after a timeout'], answer: 1, why: 'Neither can proceed, so the engine kills one (the victim) with an error. The application must catch it and retry the whole transaction.' },
    { q: 'What is the safest way to decrement stock so it never goes below zero under concurrency?', options: ['SELECT the stock, check it in C#, then run the UPDATE', 'One UPDATE with AND Stock > 0 in its WHERE clause', 'Use NOLOCK on the SELECT so the read is never blocked', 'Add an index on Stock so the check runs faster'], answer: 1, why: 'The condition and the change happen in one atomic statement, so two concurrent requests cannot both pass the check.' },
    { q: 'Under SNAPSHOT isolation, what does a transaction see?', options: ['Only its own writes and nothing else', 'Committed data as of the transaction start', 'Uncommitted data from other transactions', 'The newest committed data at each statement'], answer: 1, why: 'Row versioning gives each snapshot transaction a frozen view. Readers do not block writers. It does not prevent write skew.' },
    { q: 'How should a .NET app handle deadlock error 1205 or a transient connection error?', options: ['Ignore it; the engine re-runs the victim by itself', 'Retry only the statement that failed, then commit', 'Retry the entire transaction from the start', 'Switch to NOLOCK'], answer: 2, why: 'The whole transaction was rolled back, so only re-running the complete unit of work gives a correct result.' }
  ],
  takeaways: [
    'A transaction makes several statements all-or-nothing; COMMIT makes them permanent, ROLLBACK undoes them.',
    'ACID: Atomic, Consistent, Isolated, Durable. The log, not the data file, is what guarantees durability.',
    'Isolation levels trade safety for concurrency: READ UNCOMMITTED → READ COMMITTED (default) → REPEATABLE READ → SERIALIZABLE, plus SNAPSHOT via row versioning.',
    'Keep transactions short, touch rows in a consistent order, and index your WHERE columns to avoid deadlocks.',
    'For "last item" problems prefer an atomic conditional UPDATE or a version column over read-then-write.',
    'Retry the whole unit of work on deadlock or transient errors; let UNIQUE constraints enforce uniqueness.'
  ],
  interview: [
    { q: 'Explain ACID with an example.', a: `<p>A bank transfer: Atomic means debit and credit both happen or neither (ROLLBACK on failure). Consistent means constraints such as "balance cannot be negative" hold before and after. Isolated means a concurrent report never sees the money missing from both accounts. Durable means once COMMIT returns, a crash cannot lose it, because the change is in the transaction log on disk.</p>` },
    { q: 'What are the isolation levels and which do you use by default?', a: `<p>READ UNCOMMITTED (dirty reads), READ COMMITTED (default; no dirty reads), REPEATABLE READ (rows you read cannot change), SERIALIZABLE (also prevents phantoms via range locks), and SNAPSHOT (consistent versioned view, no read locks). I keep READ COMMITTED with READ_COMMITTED_SNAPSHOT enabled so readers never block writers, and raise the level or use explicit locks only for specific critical sections.</p>` },
    { q: 'How do you prevent and handle deadlocks?', a: `<p>Prevent: access tables and rows in the same order everywhere, keep transactions short, index filter columns so updates lock few rows, avoid lock escalation by batching large updates, and consider row versioning. Handle: catch the deadlock error (1205 in SQL Server, 40P01 in PostgreSQL) and retry the entire transaction with a small backoff, which EF Core's execution strategy can do.</p>` },
    { q: 'What is optimistic versus pessimistic concurrency?', a: `<p>Pessimistic locks the row when you read it (UPDLOCK / FOR UPDATE) so others wait; good when conflicts are frequent. Optimistic does not lock; it adds a version check to the UPDATE (WHERE RowVersion = the one I read) and retries if zero rows were affected; good when conflicts are rare, which is most web apps. EF Core supports optimistic concurrency with a [Timestamp] column.</p>` }
  ]
};
