// DevPath content — Module 3: System Design, SQL part 1 (basics to CTEs)
// Topics: m3-sql-intro, m3-sql-advanced-select, m3-sql-joins, m3-sql-sorting-grouping,
//         m3-sql-aggregation, m3-sql-subqueries, m3-sql-ctes
// Sample schema used everywhere: Customers, Orders, OrderItems, Products, Employees(ManagerId)
window.CONTENT = window.CONTENT || {};

/* ------------------------------------------------------------------ */
/* m3-sql-intro — SQL Intro & Basic SELECT                             */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-intro'] = {
  hook: `Every app you have ever used is a thin skin over a database. SQL is the language you use to ask that database questions, and the first question is only four words long.`,
  intro: `<p>A <span class="term">database</span> is an organised place to keep data so you can find it again fast. The most common kind is a <span class="term">relational database</span>: data lives in <span class="term">tables</span>, which look like spreadsheets. Each table has <span class="term">columns</span> (the headings, like Name or Price) and <span class="term">rows</span> (one record each, like one customer or one order).</p>
<p><span class="term">SQL</span> (Structured Query Language, said "sequel" or "S-Q-L") is the language for talking to these databases. You use it to read data (SELECT), add data (INSERT), change data (UPDATE) and remove data (DELETE). This lesson is about reading, because that is 90% of what you will write.</p>
<p>Many products speak SQL: Microsoft SQL Server, PostgreSQL, MySQL, SQLite, Oracle. The core is the same everywhere. Small details differ, and we will point them out. Because you are a .NET developer, we show <span class="term">T-SQL</span> (the SQL Server flavour) first, and note PostgreSQL where it matters.</p>
<p>One sample schema is used for the whole SQL section: an online shop with Customers, Orders, OrderItems, Products and Employees. The first code tab creates it. Run it once in a scratch database and every later lesson's query will work against it.</p>`,
  realLife: {
    title: 'The librarian who never sleeps',
    body: `<p>Imagine a library with millions of books and one librarian who can find any book in a second, but only if you ask in a very precise way. You cannot say "something good about dogs". You say: "From the Animals shelf, give me titles where the subject is dog and the year is after 2010, sorted by author." That precise sentence is a SQL query. The librarian is the database engine. The shelves are tables. The catalogue cards are indexes (a later lesson).</p>
<p>Being precise feels slow at first. But it means the librarian never guesses. You get exactly what you asked for, every time, whether the library has a thousand books or a billion.</p>
<p><strong>Where companies use this:</strong> every order on Amazon, every transaction in your bank app, every ticket in Jira is a row in a table that someone queries with SQL. In a typical .NET job you will write SQL directly, read SQL that EF Core generates for you, and debug slow SQL in production. Reading it well is a career skill.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Tables, rows, columns</h4>
<p>A table is a grid. Columns are fixed and named; rows are the data. Here is a tiny Customers table:</p>
<table><thead><tr><th>CustomerId</th><th>Name</th><th>City</th><th>JoinedOn</th></tr></thead>
<tbody><tr><td>1</td><td>Asha</td><td>Pune</td><td>2024-01-15</td></tr><tr><td>2</td><td>Ravi</td><td>Mumbai</td><td>2024-03-02</td></tr><tr><td>3</td><td>Meera</td><td>Pune</td><td>2025-06-30</td></tr></tbody></table>
<p>Every column has a <span class="term">data type</span>: a number (INT, DECIMAL), text (VARCHAR / NVARCHAR), a date (DATE, DATETIME2), or yes/no (BIT in SQL Server, BOOLEAN in PostgreSQL). The type tells the database how much space to use and what operations make sense.</p>
<h4>Your first query</h4>
<p>A query is a question. The simplest one reads whole rows:</p>
<ul>
<li><code>SELECT Name, City FROM Customers;</code> → which columns, from which table.</li>
<li><code>SELECT * FROM Customers;</code> → <code>*</code> means "all columns". Fine for exploring, bad in real app code (you fetch more than you need and your code breaks when columns change).</li>
<li><code>SELECT Name FROM Customers WHERE City = 'Pune';</code> → <span class="term">WHERE</span> filters rows. Only rows where the condition is true come back.</li>
</ul>
<p>Text values go in single quotes. Numbers do not. SQL keywords are not case-sensitive (<code>select</code> works), but writing them in UPPERCASE is the habit that makes queries readable.</p>
<h4>Comparison and logic</h4>
<p>In WHERE you can use <code>=</code>, <code>&lt;&gt;</code> (not equal; <code>!=</code> also works in most engines), <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>, and combine conditions with <code>AND</code>, <code>OR</code>, <code>NOT</code>. Use parentheses when you mix AND and OR, because AND binds tighter, just like multiplication beats addition.</p>
<h4>Sorting and limiting</h4>
<p><code>ORDER BY JoinedOn DESC</code> sorts newest first (<code>ASC</code> is the default, oldest first). To get only a few rows, SQL Server uses <code>SELECT TOP 5 ...</code>; PostgreSQL and MySQL use <code>... LIMIT 5</code> at the end. Without ORDER BY, "top 5" means "any 5", so always sort before you limit.</p>
<h4>NULL: the empty box</h4>
<p><span class="term">NULL</span> means "no value here", not zero and not empty text. A customer with no phone number has NULL in the Phone column. You cannot test it with <code>= NULL</code> (that is never true). You write <code>Phone IS NULL</code> or <code>Phone IS NOT NULL</code>. The next lesson goes deeper.</p>
<div class="callout tip">Read a query in this order: FROM (which table) → WHERE (which rows) → SELECT (which columns) → ORDER BY (what order). That is also the order the database runs it in, even though you write SELECT first.</div>` },
    { name: 'Intermediate', body: `<h4>The sample schema</h4>
<p>The first code tab creates five tables. Learn their shape now because every later lesson uses them:</p>
<ul>
<li><strong>Customers</strong> (CustomerId, Name, City, Email, JoinedOn) — one row per person.</li>
<li><strong>Products</strong> (ProductId, Name, Category, Price) — things for sale.</li>
<li><strong>Orders</strong> (OrderId, CustomerId, OrderDate, Status) — one row per checkout. CustomerId points to Customers.</li>
<li><strong>OrderItems</strong> (OrderItemId, OrderId, ProductId, Quantity, UnitPrice) — one row per product line in an order.</li>
<li><strong>Employees</strong> (EmployeeId, Name, Title, ManagerId, Salary) — ManagerId points to another row in the same table.</li>
</ul>
<p>A column that points to another table's id is a <span class="term">foreign key</span>. The id column that identifies each row is the <span class="term">primary key</span>. Keys are what make joins possible (a later lesson).</p>
<h4>Logical order of a SELECT</h4>
<p>You write: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY. The engine evaluates: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → TOP/LIMIT. This explains two things that surprise beginners:</p>
<ul>
<li>You cannot use a column alias from SELECT inside WHERE (WHERE runs before SELECT). You can use it in ORDER BY (which runs after).</li>
<li>TOP/LIMIT is applied last, after sorting.</li>
</ul>
<h4>Comments and formatting</h4>
<p><code>-- this is a one-line comment</code> and <code>/* this spans lines */</code>. Put each clause on its own line. A query that is easy to read is a query that is easy to fix at 2 a.m.</p>
<h4>Dates and strings in WHERE</h4>
<p>Compare dates with ISO format strings: <code>WHERE OrderDate &gt;= '2026-01-01'</code>. Avoid regional formats like '01/02/2026'. For "all of January", prefer a range (<code>&gt;= '2026-01-01' AND &lt; '2026-02-01'</code>) over <code>BETWEEN</code> with times, so you do not miss the last day's afternoon.</p>
<div class="callout warn">Text comparison may or may not care about letter case. SQL Server defaults to case-insensitive (collation); PostgreSQL is case-sensitive, so <code>'pune' = 'Pune'</code> is false there. Know which one you are on.</div>
<h4>Parameters, never string building</h4>
<p>In C#, never glue user input into SQL text. That opens the door to <span class="term">SQL injection</span>, where a user types <code>' OR 1=1 --</code> and reads your whole table. Use parameters (<code>@city</code> in SQL Server, <code>$1</code> or <code>@city</code> with Npgsql). The second code tab shows a Dapper call that does this correctly.</p>` },
    { name: 'Expert', body: `<h4>What the engine does with your text</h4>
<p>A SELECT goes through four stages: <strong>parse</strong> (check grammar, build a tree), <strong>bind</strong> (resolve table and column names, check permissions), <strong>optimize</strong> (the query optimizer tries many physical plans — scan vs index seek, join orders — and picks the cheapest by estimated cost), and <strong>execute</strong>. The chosen plan is cached and reused for the same query text with parameters, which is one more reason to use parameters instead of string building: each distinct literal makes a new plan and pollutes the cache.</p>
<h4>Set thinking vs row thinking</h4>
<p>SQL is <span class="term">declarative</span>: you say what you want, not how to get it. Developers coming from C# tend to think in loops ("for each customer, find orders"). The engine thinks in sets ("the set of customers joined with the set of orders"). Writing set-based queries lets the optimizer work; writing row-by-row logic (cursors, loops in stored procedures) usually makes it slow. Keep this in mind for the whole module.</p>
<h4>Three-valued logic</h4>
<p>Because of NULL, every condition in SQL is TRUE, FALSE or UNKNOWN. WHERE keeps only TRUE rows. So <code>WHERE Phone &lt;&gt; '123'</code> silently drops rows whose Phone is NULL, because NULL &lt;&gt; '123' is UNKNOWN, not TRUE. This single rule causes more production bugs than any other SQL feature. The next lesson has the patterns to handle it.</p>
<h4>Dialect differences that matter on day one</h4>
<table><thead><tr><th>Feature</th><th>SQL Server (T-SQL)</th><th>PostgreSQL</th></tr></thead>
<tbody>
<tr><td>Limit rows</td><td>SELECT TOP 10 ... / OFFSET-FETCH</td><td>... LIMIT 10 OFFSET 0</td></tr>
<tr><td>Unicode text</td><td>NVARCHAR(100), N'text'</td><td>VARCHAR/TEXT is already Unicode</td></tr>
<tr><td>Boolean</td><td>BIT (0/1)</td><td>BOOLEAN (true/false)</td></tr>
<tr><td>Auto id</td><td>INT IDENTITY(1,1)</td><td>INT GENERATED ALWAYS AS IDENTITY (or SERIAL)</td></tr>
<tr><td>Identifier quoting</td><td>[Order]</td><td>"Order"</td></tr>
<tr><td>String concat</td><td>+ or CONCAT()</td><td>|| or CONCAT()</td></tr>
</tbody></table>
<h4>What interviewers ask at this level</h4>
<ul>
<li>"What is the difference between WHERE and HAVING?" (covered in Sorting &amp; Grouping, but the short answer: WHERE filters rows before grouping, HAVING filters groups after).</li>
<li>"Why is <code>SELECT *</code> bad in production code?" (network and memory waste, breaks on schema change, blocks covering indexes).</li>
<li>"What does NULL = NULL return?" (UNKNOWN, so the row is not returned).</li>
</ul>
<div class="callout idea">Open SQL Server Management Studio, press Ctrl+M (Include Actual Execution Plan), and run any query from this lesson. Reading plans early turns the database from a black box into a colleague.</div>` }
  ],
  flow: {
    title: 'What happens when you run SELECT Name FROM Customers WHERE City = @city',
    steps: [
      { title: 'Send', desc: 'Your C# app sends the SQL text plus the parameter value (City = Pune) to the database over the network.' },
      { title: 'Parse', desc: 'The engine checks the grammar and turns the text into a tree: a SELECT with a FROM and a WHERE.' },
      { title: 'Bind', desc: 'It looks up the Customers table and the Name and City columns, and checks you are allowed to read them.' },
      { title: 'Plan', desc: 'The optimizer picks how to run it: scan the whole table, or use an index on City if one exists. It caches the plan for next time.' },
      { title: 'FROM + WHERE', desc: 'Rows are read from Customers and only the ones where City = Pune are kept.' },
      { title: 'SELECT', desc: 'From the kept rows, only the Name column is taken.' },
      { title: 'Return', desc: 'The result set streams back to your app, which maps rows into C# objects.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'Create the sample shop schema (run once)', code: `-- SQL Server (T-SQL). PostgreSQL notes at the bottom.
CREATE TABLE Customers (
    CustomerId INT IDENTITY(1,1) PRIMARY KEY,
    Name       NVARCHAR(100) NOT NULL,
    City       NVARCHAR(50)  NULL,
    Email      NVARCHAR(200) NULL,
    JoinedOn   DATE          NOT NULL
);

CREATE TABLE Products (
    ProductId INT IDENTITY(1,1) PRIMARY KEY,
    Name      NVARCHAR(100) NOT NULL,
    Category  NVARCHAR(50)  NOT NULL,
    Price     DECIMAL(10,2) NOT NULL
);

CREATE TABLE Orders (
    OrderId    INT IDENTITY(1,1) PRIMARY KEY,
    CustomerId INT NOT NULL REFERENCES Customers(CustomerId),
    OrderDate  DATETIME2 NOT NULL,
    Status     NVARCHAR(20) NOT NULL   -- 'Placed', 'Shipped', 'Delivered', 'Cancelled'
);

CREATE TABLE OrderItems (
    OrderItemId INT IDENTITY(1,1) PRIMARY KEY,
    OrderId     INT NOT NULL REFERENCES Orders(OrderId),
    ProductId   INT NOT NULL REFERENCES Products(ProductId),
    Quantity    INT NOT NULL,
    UnitPrice   DECIMAL(10,2) NOT NULL
);

CREATE TABLE Employees (
    EmployeeId INT IDENTITY(1,1) PRIMARY KEY,
    Name       NVARCHAR(100) NOT NULL,
    Title      NVARCHAR(50)  NOT NULL,
    ManagerId  INT NULL REFERENCES Employees(EmployeeId),  -- self reference
    Salary     DECIMAL(10,2) NOT NULL
);

INSERT INTO Customers (Name, City, Email, JoinedOn) VALUES
('Asha',  'Pune',   'asha@example.com',  '2024-01-15'),
('Ravi',  'Mumbai', 'ravi@example.com',  '2024-03-02'),
('Meera', 'Pune',   NULL,                '2025-06-30'),
('John',  'Delhi',  'john@example.com',  '2025-09-12'),
('Sara',  NULL,     'sara@example.com',  '2026-02-01');

INSERT INTO Products (Name, Category, Price) VALUES
('Laptop',   'Electronics', 65000.00),
('Mouse',    'Electronics',   800.00),
('Desk',     'Furniture',   12000.00),
('Chair',    'Furniture',    5500.00),
('Notebook', 'Stationery',     60.00);

INSERT INTO Orders (CustomerId, OrderDate, Status) VALUES
(1, '2026-01-05 10:30', 'Delivered'),
(1, '2026-02-14 09:00', 'Shipped'),
(2, '2026-02-20 18:45', 'Delivered'),
(3, '2026-03-01 12:00', 'Cancelled'),
(4, '2026-03-03 15:20', 'Placed');

INSERT INTO OrderItems (OrderId, ProductId, Quantity, UnitPrice) VALUES
(1, 1, 1, 65000.00), (1, 2, 2, 800.00),
(2, 5, 10, 60.00),
(3, 3, 1, 12000.00), (3, 4, 2, 5500.00),
(4, 2, 1, 800.00),
(5, 4, 1, 5500.00);

INSERT INTO Employees (Name, Title, ManagerId, Salary) VALUES
('Priya', 'CEO',        NULL, 300000),
('Arun',  'CTO',        1,    220000),
('Neha',  'Eng Manager',2,    160000),
('Vikram','Developer',  3,     90000),
('Tina',  'Developer',  3,     85000);

-- PostgreSQL: replace INT IDENTITY(1,1) with INT GENERATED ALWAYS AS IDENTITY,
-- NVARCHAR with VARCHAR, DATETIME2 with TIMESTAMP.` },
    { lang: 'sql', title: 'Your first queries', code: `-- All columns, all rows (fine for exploring)
SELECT * FROM Customers;

-- Only some columns
SELECT Name, City FROM Customers;

-- Filter rows
SELECT Name, City
FROM Customers
WHERE City = 'Pune';

-- Combine conditions (parentheses make AND/OR safe)
SELECT Name, City, JoinedOn
FROM Customers
WHERE (City = 'Pune' OR City = 'Mumbai')
  AND JoinedOn >= '2025-01-01';

-- Sort: newest members first
SELECT Name, JoinedOn
FROM Customers
ORDER BY JoinedOn DESC;

-- Limit: SQL Server
SELECT TOP 3 Name, JoinedOn
FROM Customers
ORDER BY JoinedOn DESC;

-- Limit: PostgreSQL / MySQL
-- SELECT Name, JoinedOn FROM Customers ORDER BY JoinedOn DESC LIMIT 3;

-- Paging that works in both SQL Server (2012+) and PostgreSQL
SELECT Name, JoinedOn
FROM Customers
ORDER BY JoinedOn DESC
OFFSET 0 ROWS FETCH NEXT 2 ROWS ONLY;

-- NULL is not a value: use IS NULL
SELECT Name FROM Customers WHERE City IS NULL;      -- Sara
SELECT Name FROM Customers WHERE City = NULL;       -- returns nothing, always` },
    { lang: 'csharp', title: 'Run a parameterised query from C# with Dapper', code: `using Dapper;
using Microsoft.Data.SqlClient;

public record CustomerRow(int CustomerId, string Name, string? City, DateTime JoinedOn);

public class CustomerQueries
{
    private readonly string _connectionString;
    public CustomerQueries(string connectionString) => _connectionString = connectionString;

    public async Task<IReadOnlyList<CustomerRow>> ByCityAsync(string city)
    {
        // @city is a parameter. The value never becomes part of the SQL text,
        // so a user typing  ' OR 1=1 --  cannot change the query.
        const string sql = @"
            SELECT CustomerId, Name, City, JoinedOn
            FROM Customers
            WHERE City = @city
            ORDER BY JoinedOn DESC;";

        await using var conn = new SqlConnection(_connectionString);
        var rows = await conn.QueryAsync<CustomerRow>(sql, new { city });
        return rows.ToList();
    }
}

// Usage:
// var q = new CustomerQueries(config.GetConnectionString("Shop")!);
// foreach (var c in await q.ByCityAsync("Pune")) Console.WriteLine(c.Name);` }
  ],
  pitfalls: [
    'Writing <code>WHERE City = NULL</code>. It never matches. Use <code>IS NULL</code>.',
    'Using <code>TOP</code> or <code>LIMIT</code> without <code>ORDER BY</code>. You get "some rows", and which ones can change between runs.',
    'Mixing AND and OR without parentheses. <code>A OR B AND C</code> means <code>A OR (B AND C)</code>, which is rarely what you wanted.',
    'Building SQL by string concatenation in C#. Always use parameters, even for "internal" tools.',
    'Comparing dates with regional strings like <code>\'03/04/2026\'</code>. Use ISO <code>\'2026-04-03\'</code>.',
    'Shipping <code>SELECT *</code> in app code. Name the columns you need.'
  ],
  quiz: [
    { q: 'Which clause decides which rows come back?', options: ['SELECT', 'FROM', 'WHERE', 'ORDER BY'], answer: 2, why: 'SELECT picks columns, FROM picks the table, WHERE filters rows, ORDER BY sorts them.' },
    { q: 'What does SELECT Name FROM Customers WHERE City = NULL return?', options: ['Customers with no city', 'All customers', 'No rows', 'An error'], answer: 2, why: 'Comparing anything to NULL with = gives UNKNOWN, never TRUE, so no row passes the filter. Use IS NULL.' },
    { q: 'In which order does the engine logically evaluate a query?', options: ['SELECT, FROM, WHERE, ORDER BY', 'FROM, WHERE, SELECT, ORDER BY', 'WHERE, FROM, SELECT, ORDER BY', 'ORDER BY, FROM, WHERE, SELECT'], answer: 1, why: 'The engine finds the table first, filters rows, then picks columns, then sorts. That is why you cannot use a SELECT alias inside WHERE.' },
    { q: 'What is the SQL Server equivalent of PostgreSQL LIMIT 5?', options: ['FIRST 5', 'TOP 5', 'ROWNUM 5', 'HEAD 5'], answer: 1, why: 'T-SQL uses SELECT TOP 5 ... (or OFFSET/FETCH, which works in both).' },
    { q: 'Why should you use @parameters from C# instead of building the SQL string?', options: ['It is faster to type', 'It prevents SQL injection', 'It makes the query case-insensitive', 'It is required by Dapper'], answer: 1, why: 'User input stays data, never code, and the same SQL text can reuse its cached execution plan.' }
  ],
  takeaways: [
    'A database is tables; a table is columns (fixed) and rows (data).',
    'SELECT picks columns, FROM picks the table, WHERE filters rows, ORDER BY sorts.',
    'The engine runs FROM → WHERE → SELECT → ORDER BY → TOP/LIMIT, not the order you write.',
    'NULL means "no value". Test it with IS NULL, never with =.',
    'Always ORDER BY before TOP/LIMIT, and always use parameters from C#.',
    'T-SQL and PostgreSQL agree on the core; the differences are small and worth memorising.'
  ],
  interview: [
    { q: 'What is the difference between a primary key and a foreign key?', a: `<p>A primary key uniquely identifies a row in its own table (CustomerId in Customers). A foreign key is a column that stores another table's primary key value (CustomerId in Orders) so the two tables can be linked. The database can enforce that a foreign key always points at a real row.</p>` },
    { q: 'Why does WHERE Phone <> \'123\' not return customers whose phone is NULL?', a: `<p>Because any comparison with NULL gives UNKNOWN, and WHERE only keeps TRUE rows. To include them write <code>WHERE Phone &lt;&gt; '123' OR Phone IS NULL</code>.</p>` },
    { q: 'Is SQL case-sensitive?', a: `<p>Keywords are not. Data comparisons depend on the engine and collation: SQL Server is usually case-insensitive by default, PostgreSQL is case-sensitive. Identifiers (table names) follow similar rules per engine.</p>` },
    { q: 'What is the problem with SELECT * in production code?', a: `<p>It fetches columns you do not need (network and memory cost), it breaks or silently changes behaviour when columns are added or reordered, and it stops the optimizer from using a smaller covering index.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m3-sql-advanced-select — DISTINCT, CASE, NULL, LIKE                 */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-advanced-select'] = {
  hook: `Most "bugs" in reports are not bugs in code. They are NULLs, duplicates and fuzzy matches that nobody thought about. This lesson is where you learn to think about them.`,
  intro: `<p>You can already pick columns and filter rows. Now you will learn the tools that turn raw rows into useful answers: removing duplicates with <span class="term">DISTINCT</span>, making decisions inside a query with <span class="term">CASE</span>, handling missing values with <span class="term">COALESCE</span> and friends, searching text with <span class="term">LIKE</span>, and checking membership with <span class="term">IN</span> and <span class="term">BETWEEN</span>.</p>
<p>You will also learn to give columns and tables short names (<span class="term">aliases</span>), to compute new columns on the fly, and to call the most common built-in functions for text, numbers and dates.</p>
<p>None of this is hard. But each piece has one trap, and the traps are the reason senior developers get called to fix "the numbers look wrong" tickets. We will name every trap.</p>`,
  realLife: {
    title: 'The sales report that was off by one city',
    body: `<p>A manager asks: "How many cities do we sell in?" A junior runs <code>SELECT City FROM Customers</code>, counts the rows, and says five. Wrong: Pune appears twice and one customer has no city. The real answer is three cities, plus one unknown. <code>DISTINCT</code> fixes the duplicates; <code>IS NULL</code> handling fixes the unknown.</p>
<p>Next question: "Show each customer as Local, Domestic or Unknown." That is a decision per row, which is what <code>CASE</code> does. Then: "Find every customer whose email ends in example.com." That is a pattern match, which is <code>LIKE</code>.</p>
<p><strong>Where companies use this:</strong> every dashboard at Flipkart, every finance report at Infosys, every "segment customers by tier" query in a CRM like Salesforce is built from exactly these pieces. In .NET, LINQ's <code>Select</code>, <code>Distinct</code>, <code>Contains</code> and the ternary operator compile down to these SQL features through EF Core.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>DISTINCT: one of each</h4>
<p><code>SELECT DISTINCT City FROM Customers</code> returns each city once. DISTINCT applies to the whole row of selected columns, so <code>SELECT DISTINCT City, Name</code> keeps pairs that differ in either column. NULL counts as one distinct value.</p>
<h4>CASE: if/else inside a query</h4>
<p>CASE lets you compute a value per row based on conditions:</p>
<ul>
<li><strong>Searched CASE:</strong> <code>CASE WHEN Price &gt; 10000 THEN 'Premium' WHEN Price &gt; 1000 THEN 'Standard' ELSE 'Budget' END</code>. The first true WHEN wins.</li>
<li><strong>Simple CASE:</strong> <code>CASE Status WHEN 'Placed' THEN 1 WHEN 'Shipped' THEN 2 ELSE 9 END</code> compares one value to a list.</li>
</ul>
<p>Without an ELSE, the result is NULL when nothing matches. CASE can be used in SELECT, ORDER BY, WHERE and even inside aggregates (the Aggregation lesson shows that trick).</p>
<h4>NULL tools</h4>
<ul>
<li><code>IS NULL</code> / <code>IS NOT NULL</code> — the only correct way to test for NULL.</li>
<li><code>COALESCE(a, b, c)</code> — the first non-NULL value. <code>COALESCE(City, 'Unknown')</code> prints Unknown instead of a blank.</li>
<li><code>NULLIF(a, b)</code> — returns NULL when a equals b. Classic use: <code>Total / NULLIF(Count, 0)</code> to avoid divide-by-zero.</li>
<li>SQL Server also has <code>ISNULL(a, b)</code> (two arguments only). Prefer COALESCE because it is standard SQL.</li>
</ul>
<h4>LIKE: pattern matching</h4>
<p><code>%</code> means "any characters, including none"; <code>_</code> means "exactly one character". <code>WHERE Email LIKE '%@example.com'</code> finds emails ending with that domain. <code>WHERE Name LIKE 'A%'</code> finds names starting with A. <code>WHERE Name LIKE '_a%'</code> finds names whose second letter is a.</p>
<h4>IN and BETWEEN</h4>
<p><code>WHERE City IN ('Pune', 'Mumbai')</code> is a tidy way to write several ORs. <code>WHERE Price BETWEEN 500 AND 1000</code> includes both ends. For dates with times, prefer <code>&gt;= start AND &lt; next_day</code> so you do not miss the last day.</p>
<h4>Aliases</h4>
<p><code>SELECT Name AS CustomerName FROM Customers AS c</code>. The AS is optional but keeps things clear. Aliases shorten long queries and give computed columns a name.</p>
<div class="callout tip">Think of DISTINCT, CASE, COALESCE, LIKE, IN and BETWEEN as six small tools in a drawer. Reports are made by picking two or three of them, not by learning anything new.</div>` },
    { name: 'Intermediate', body: `<h4>Computed columns</h4>
<p>You can do math and string work in SELECT: <code>SELECT Quantity * UnitPrice AS LineTotal FROM OrderItems</code>. Remember that aliases made in SELECT are not visible in WHERE of the same query. If you need to filter on a computed value, either repeat the expression or wrap the query in a CTE (two lessons from now).</p>
<h4>Common functions you will use weekly</h4>
<table><thead><tr><th>Need</th><th>SQL Server</th><th>PostgreSQL</th></tr></thead>
<tbody>
<tr><td>Upper / lower</td><td>UPPER(x), LOWER(x)</td><td>same</td></tr>
<tr><td>Length</td><td>LEN(x)</td><td>LENGTH(x)</td></tr>
<tr><td>Trim spaces</td><td>TRIM(x)</td><td>TRIM(x)</td></tr>
<tr><td>Part of string</td><td>SUBSTRING(x, start, len), LEFT, RIGHT</td><td>SUBSTRING(x FROM start FOR len), LEFT, RIGHT</td></tr>
<tr><td>Join strings</td><td>CONCAT(a, b) or a + b</td><td>CONCAT(a, b) or a || b</td></tr>
<tr><td>Round</td><td>ROUND(x, 2)</td><td>ROUND(x, 2)</td></tr>
<tr><td>Today</td><td>GETDATE(), SYSDATETIME()</td><td>NOW(), CURRENT_DATE</td></tr>
<tr><td>Date math</td><td>DATEADD(day, 7, d), DATEDIFF(day, a, b)</td><td>d + INTERVAL '7 days', b - a</td></tr>
<tr><td>Part of date</td><td>YEAR(d), MONTH(d), DATEPART(weekday, d)</td><td>EXTRACT(YEAR FROM d), DATE_PART</td></tr>
<tr><td>Convert type</td><td>CAST(x AS INT), TRY_CAST, CONVERT</td><td>CAST(x AS INT), x::INT</td></tr>
</tbody></table>
<h4>NULL and concatenation</h4>
<p>In SQL Server, <code>'Hi ' + NULL</code> is NULL (the whole string disappears). <code>CONCAT('Hi ', NULL)</code> treats NULL as empty and returns 'Hi '. Use CONCAT when any part might be NULL.</p>
<h4>NULL and NOT IN: the silent killer</h4>
<p><code>WHERE City NOT IN (SELECT City FROM Customers)</code> returns nothing if that subquery contains even one NULL, because <code>x &lt;&gt; NULL</code> is UNKNOWN for every x. Filter NULLs out of the list, or use <code>NOT EXISTS</code> (Subqueries lesson).</p>
<h4>LIKE details</h4>
<ul>
<li>A leading <code>%</code> (<code>LIKE '%son'</code>) cannot use a normal index, so it scans the table. Fine for small tables, slow for big ones. Full-text search exists for that.</li>
<li>To match a literal % or _, use an escape: <code>LIKE '50\\%' ESCAPE '\\'</code>.</li>
<li>SQL Server supports character sets in LIKE: <code>LIKE '[A-C]%'</code>. PostgreSQL uses <code>SIMILAR TO</code> or regex <code>~</code> instead, and <code>ILIKE</code> for case-insensitive matching.</li>
</ul>
<h4>CASE in ORDER BY</h4>
<p>Custom sort orders are a CASE in ORDER BY: show Placed first, then Shipped, then the rest. The code tab shows it. CASE in WHERE also works but is usually clearer as plain AND/OR.</p>
<div class="callout warn">COALESCE picks the data type from its arguments. <code>COALESCE(Price, 'N/A')</code> fails because a decimal and text do not mix. Convert first: <code>COALESCE(CAST(Price AS VARCHAR(20)), 'N/A')</code>.</div>` },
    { name: 'Expert', body: `<h4>DISTINCT is a hidden sort or hash</h4>
<p>To remove duplicates the engine must either sort the rows or build a hash table. On a big result this costs memory and time. If you find yourself adding DISTINCT to "fix" duplicates, the real cause is usually a join that multiplies rows (Joins lesson). Fix the join; do not paper over it with DISTINCT.</p>
<h4>Sargability</h4>
<p>A predicate is <span class="term">sargable</span> (Search ARGument able) when the engine can use an index to evaluate it. <code>WHERE OrderDate &gt;= '2026-01-01'</code> is sargable. <code>WHERE YEAR(OrderDate) = 2026</code> is not: the function must run on every row, so the index on OrderDate is useless. The same applies to <code>WHERE UPPER(Name) = 'ASHA'</code>, <code>WHERE Price * 1.18 &gt; 1000</code> and leading-wildcard LIKE. Rewrite predicates so the column stands alone on one side.</p>
<h4>CASE evaluation order and short-circuit</h4>
<p>The standard says CASE evaluates WHEN branches in order and stops at the first true one. But the optimizer may evaluate expressions for all rows in a different order when it can prove it is safe, and aggregate functions inside CASE are evaluated regardless. Do not rely on CASE to prevent a divide-by-zero inside an aggregate; use NULLIF.</p>
<h4>Collation and LIKE</h4>
<p>In SQL Server, LIKE and equality follow the column's collation. The common default collation ends in _CI_AS: case-insensitive but accent-sensitive, so <code>'asha' = 'ASHA'</code> is true but <code>'resume' = 'Résumé'</code> is false. An accent-insensitive collation (ending in _CI_AI) makes both true. You can override per query: <code>WHERE Name COLLATE Latin1_General_CS_AS = 'asha'</code>. In PostgreSQL, equality is byte-exact by default; use <code>ILIKE</code>, <code>LOWER()</code>, or the citext type.</p>
<h4>TRY_CAST and data quality</h4>
<p>When converting dirty text to numbers or dates, <code>CAST</code> throws on the first bad row and the whole query fails. <code>TRY_CAST</code> (SQL Server) returns NULL for bad values, so you can find them: <code>WHERE TRY_CAST(RawPrice AS DECIMAL(10,2)) IS NULL AND RawPrice IS NOT NULL</code>. PostgreSQL has no TRY_CAST built in; people use a small function or regex check.</p>
<h4>Interview angle</h4>
<ul>
<li>"COALESCE vs ISNULL?" COALESCE is ANSI standard, takes many arguments, and returns the highest-precedence type; ISNULL is T-SQL only, two arguments, returns the first argument's type.</li>
<li>"Why is NOT IN dangerous?" NULL in the list makes the whole predicate UNKNOWN.</li>
<li>"Can you index a LIKE '%abc' search?" Not with a normal B-tree index; use full-text search, a trigram index (PostgreSQL pg_trgm), or a reversed-string column.</li>
</ul>
<div class="callout idea">Take any WHERE clause you wrote this week and ask: is the column alone on one side of the comparison? If not, can it be?</div>` }
  ],
  flow: {
    title: 'How the engine evaluates a SELECT with CASE, COALESCE and LIKE',
    steps: [
      { title: 'FROM', desc: 'Start with every row of Customers.' },
      { title: 'WHERE Email LIKE', desc: 'Keep only rows whose Email matches the pattern. NULL emails never match, so they are dropped here.' },
      { title: 'Compute CASE', desc: 'For each surviving row, walk the WHEN branches top to bottom and take the first true one, else the ELSE value.' },
      { title: 'Compute COALESCE', desc: 'Replace a NULL City with the word Unknown for display.' },
      { title: 'DISTINCT', desc: 'If DISTINCT is present, sort or hash the selected columns and drop exact duplicate rows.' },
      { title: 'ORDER BY', desc: 'Sort, possibly by a CASE expression that defines a custom order.' },
      { title: 'Return', desc: 'Send the final rows to the client.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'DISTINCT, CASE, COALESCE, NULLIF', code: `-- One row per city (NULL appears once too)
SELECT DISTINCT City FROM Customers;

-- Count distinct cities, ignoring NULL
SELECT COUNT(DISTINCT City) AS CityCount FROM Customers;

-- Label each product with a tier (searched CASE)
SELECT Name, Price,
       CASE
           WHEN Price >= 10000 THEN 'Premium'
           WHEN Price >=  1000 THEN 'Standard'
           ELSE 'Budget'
       END AS Tier
FROM Products;

-- Simple CASE: map a status code to a sort rank, then sort by it
SELECT OrderId, Status
FROM Orders
ORDER BY CASE Status
             WHEN 'Placed'    THEN 1
             WHEN 'Shipped'   THEN 2
             WHEN 'Delivered' THEN 3
             ELSE 9
         END, OrderId;

-- COALESCE for display; NULLIF to avoid divide by zero
SELECT Name,
       COALESCE(City, 'Unknown')  AS CityShown,
       COALESCE(Email, 'no email') AS EmailShown
FROM Customers;

SELECT 100.0 / NULLIF(0, 0) AS SafeDivide;   -- NULL instead of an error

-- Computed column with an alias
SELECT OrderId, Quantity, UnitPrice, Quantity * UnitPrice AS LineTotal
FROM OrderItems;` },
    { lang: 'sql', title: 'LIKE, IN, BETWEEN and the NULL traps', code: `-- Emails on a domain (leading % means table scan on big tables)
SELECT Name, Email FROM Customers WHERE Email LIKE '%@example.com';

-- Names starting with A or M
SELECT Name FROM Customers WHERE Name LIKE 'A%' OR Name LIKE 'M%';
-- SQL Server only: character set
SELECT Name FROM Customers WHERE Name LIKE '[AM]%';
-- PostgreSQL: case-insensitive LIKE
-- SELECT Name FROM Customers WHERE Name ILIKE 'a%';

-- Second letter is 'a' (underscore = exactly one char)
SELECT Name FROM Customers WHERE Name LIKE '_a%';

-- IN instead of many ORs
SELECT Name, City FROM Customers WHERE City IN ('Pune', 'Mumbai');

-- BETWEEN is inclusive on both ends
SELECT Name, Price FROM Products WHERE Price BETWEEN 500 AND 6000;

-- Date range: safe version that includes the whole last day
SELECT OrderId, OrderDate
FROM Orders
WHERE OrderDate >= '2026-02-01' AND OrderDate < '2026-03-01';

-- TRAP 1: NOT IN with a NULL in the list returns nothing
SELECT Name FROM Customers WHERE City NOT IN ('Pune', NULL);        -- 0 rows!
SELECT Name FROM Customers WHERE City NOT IN ('Pune') OR City IS NULL; -- what you meant

-- TRAP 2: <> drops NULL rows silently
SELECT Name FROM Customers WHERE City <> 'Pune';                 -- Sara (NULL city) missing
SELECT Name FROM Customers WHERE City <> 'Pune' OR City IS NULL; -- includes Sara

-- TRAP 3: function on the column kills index use (not sargable)
SELECT OrderId FROM Orders WHERE YEAR(OrderDate) = 2026;                      -- slow on big tables
SELECT OrderId FROM Orders WHERE OrderDate >= '2026-01-01' AND OrderDate < '2027-01-01'; -- fast` },
    { lang: 'csharp', title: 'The same logic in LINQ (EF Core turns it into SQL)', code: `// EF Core translates these into DISTINCT, CASE, COALESCE and LIKE.
// Inspect the SQL with db.Customers.Where(...).ToQueryString().

var cities = await db.Customers
    .Select(c => c.City)
    .Distinct()
    .ToListAsync();                                   // SELECT DISTINCT City

var tiers = await db.Products
    .Select(p => new
    {
        p.Name,
        Tier = p.Price >= 10000 ? "Premium"
             : p.Price >= 1000  ? "Standard"
             : "Budget"                                // CASE WHEN ... END
    })
    .ToListAsync();

var shown = await db.Customers
    .Select(c => new { c.Name, City = c.City ?? "Unknown" })   // COALESCE(City, 'Unknown')
    .ToListAsync();

var onDomain = await db.Customers
    .Where(c => c.Email != null && EF.Functions.Like(c.Email, "%@example.com"))  // LIKE
    .ToListAsync();

var inCities = await db.Customers
    .Where(c => new[] { "Pune", "Mumbai" }.Contains(c.City))    // IN ('Pune','Mumbai')
    .ToListAsync();` }
  ],
  pitfalls: [
    'Adding DISTINCT to hide duplicates that come from a bad join. Fix the join instead.',
    'Using NOT IN with a list or subquery that can contain NULL. The result is always empty. Use NOT EXISTS or filter NULLs.',
    'Forgetting that <code>&lt;&gt;</code> and <code>NOT LIKE</code> drop NULL rows. Add <code>OR col IS NULL</code> if you want them.',
    'Wrapping the column in a function in WHERE (<code>YEAR(d) = 2026</code>). The index cannot be used. Use a range instead.',
    'Mixing types in COALESCE or CASE branches (number and text). Cast to one type first.',
    'Using <code>+</code> to join strings in SQL Server when a part may be NULL; the whole result becomes NULL. Use CONCAT.'
  ],
  quiz: [
    { q: 'What does SELECT DISTINCT City, Name FROM Customers remove?', options: ['Rows that repeat a City, whatever the Name is', 'Rows that repeat a Name, whatever the City is', 'Rows where both City and Name are the same', 'NULL rows'], answer: 2, why: 'DISTINCT works on the whole selected row, so only exact duplicate (City, Name) pairs are removed.' },
    { q: 'COALESCE(NULL, NULL, 5, 7) returns:', options: ['NULL', '5', '7', 'An error'], answer: 1, why: 'COALESCE returns the first argument that is not NULL.' },
    { q: 'Which LIKE pattern finds names whose third letter is "r"?', options: ["'r%'", "'%r%'", "'__r%'", "'r__'"], answer: 2, why: 'Each underscore matches exactly one character, so two underscores skip the first two letters, then r, then anything.' },
    { q: 'WHERE City NOT IN (SELECT City FROM Customers WHERE City IS NULL OR City = \'Delhi\') returns:', options: ['Everyone outside Delhi', 'Everyone', 'No rows', 'Only NULL cities'], answer: 2, why: 'The list contains a NULL, so every comparison becomes UNKNOWN and no row passes.' },
    { q: 'Which predicate can use an index on OrderDate?', options: ['YEAR(OrderDate) = 2026', "CONVERT(VARCHAR, OrderDate, 112) LIKE '2026%'", "OrderDate >= '2026-01-01' AND OrderDate < '2027-01-01'", 'DATEPART(year, OrderDate) = 2026'], answer: 2, why: 'Only the range leaves the column untouched on one side, so the engine can seek in the index.' },
    { q: 'What does NULLIF(Count, 0) do?', options: ['Replaces NULL with 0', 'Returns NULL when Count is 0', 'Counts NULLs', 'Removes rows where Count is 0'], answer: 1, why: 'NULLIF(a, b) returns NULL when a equals b, which turns a divide-by-zero into a NULL result instead of an error.' }
  ],
  takeaways: [
    'DISTINCT removes duplicate rows across all selected columns, and it costs a sort or hash.',
    'CASE is if/else inside a query: searched (WHEN condition) or simple (WHEN value). First match wins.',
    'COALESCE gives the first non-NULL; NULLIF turns a value into NULL. Together they fix most NULL bugs.',
    'LIKE uses % (any) and _ (one). A leading % cannot use a normal index.',
    'NOT IN with a NULL returns nothing; &lt;&gt; and NOT LIKE drop NULL rows. Think about NULL every time.',
    'Keep the column alone on one side of a comparison so indexes can be used.'
  ],
  interview: [
    { q: 'What is the difference between COALESCE and ISNULL in SQL Server?', a: `<p>ISNULL is T-SQL only and takes exactly two arguments; its result type is the first argument's type. COALESCE is standard SQL, takes any number of arguments, and its result type is the highest-precedence type among them. Prefer COALESCE for portable code.</p>` },
    { q: 'Why does WHERE City NOT IN (subquery) sometimes return no rows?', a: `<p>If the subquery returns a NULL, the predicate expands to <code>City &lt;&gt; v1 AND City &lt;&gt; v2 AND City &lt;&gt; NULL</code>. The last part is UNKNOWN, so the whole AND is never TRUE. Use NOT EXISTS, which handles NULL correctly, or exclude NULLs in the subquery.</p>` },
    { q: 'What does "sargable" mean?', a: `<p>A predicate the engine can satisfy with an index seek. Rules of thumb: no function on the indexed column, no arithmetic on it, no leading wildcard. <code>col &gt;= value</code> is sargable; <code>YEAR(col) = value</code> is not.</p>` },
    { q: 'How would you implement a custom sort order like Placed, Shipped, Delivered?', a: `<p>With a CASE expression in ORDER BY that maps each status to a number, or better, with a small lookup table that has a SortOrder column and a join, so the order lives in data rather than in every query.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m3-sql-joins — Joins                                                */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-joins'] = {
  hook: `A single table answers boring questions. "Which customers in Pune bought furniture last month?" needs four tables talking to each other. That conversation is called a join.`,
  intro: `<p>Good databases split data into many tables so nothing is stored twice. Customers are in one table, their orders in another, the products in a third. A <span class="term">join</span> puts them back together for one query, by matching values in a shared column. Usually that column is a key: Orders.CustomerId matches Customers.CustomerId.</p>
<p>There are only a few join types, and they differ in one thing: what happens to rows that have no match on the other side. <span class="term">INNER JOIN</span> drops them. <span class="term">LEFT JOIN</span> keeps every row from the left table and fills the right side with NULLs. <span class="term">RIGHT JOIN</span> is the mirror. <span class="term">FULL JOIN</span> keeps unmatched rows from both sides. <span class="term">CROSS JOIN</span> pairs everything with everything.</p>
<p>Joins are where most SQL bugs live, so this lesson spends as much time on what goes wrong (rows multiplying, rows vanishing) as on the syntax.</p>`,
  realLife: {
    title: 'Two lists on two desks',
    body: `<p>Picture two paper lists. List A: every customer and their id. List B: every order with the customer id written on it. To answer "who ordered what", you put a finger on an order, read its customer id, and find that id in list A. That is a join on CustomerId.</p>
<p>Now the join types. INNER: write down only customers who appear in both lists. LEFT: write down every customer, and next to the ones with no orders write "none". FULL: also write down any order whose customer id is not in list A at all (bad data, but it happens). CROSS: pair every customer with every order, which is only useful when you really want all combinations, like every size with every colour.</p>
<p><strong>Where companies use this:</strong> an "order details" page at Myntra joins Orders, OrderItems, Products and Customers. A payroll report joins Employees to itself to show each person's manager. In EF Core, <code>Include()</code> and navigation properties generate these joins for you, and when a page is slow, the first thing a senior engineer does is read the generated join.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The shape of a join</h4>
<p><code>SELECT ... FROM Customers c JOIN Orders o ON o.CustomerId = c.CustomerId</code>. Three parts: the two tables (with short aliases c and o), the keyword JOIN, and the <span class="term">ON</span> condition that says how rows match. Always prefix columns with the alias when two tables are involved. It avoids "ambiguous column" errors and makes the query readable.</p>
<h4>Picture the five join types with words</h4>
<p>Think of two circles that overlap. Left circle = customers, right circle = orders. The overlap = customers who have orders.</p>
<ul>
<li><strong>INNER JOIN</strong> → only the overlap. Customers with orders, orders with customers.</li>
<li><strong>LEFT JOIN</strong> → the whole left circle. Every customer; order columns are NULL for customers without orders.</li>
<li><strong>RIGHT JOIN</strong> → the whole right circle. Rarely used; swap the tables and write LEFT instead.</li>
<li><strong>FULL OUTER JOIN</strong> → both circles. Everything, with NULLs on whichever side is missing.</li>
<li><strong>CROSS JOIN</strong> → no circles; every row of A paired with every row of B. 5 customers × 5 orders = 25 rows.</li>
</ul>
<p>JOIN alone means INNER JOIN. LEFT JOIN means LEFT OUTER JOIN; the word OUTER is optional.</p>
<h4>Finding the missing ones</h4>
<p>"Which customers have never ordered?" is a LEFT JOIN plus a filter for NULL on the right side: <code>WHERE o.OrderId IS NULL</code>. This is called an <span class="term">anti-join</span>. The Intermediate tab shows the cleaner NOT EXISTS version.</p>
<h4>Joining more than two tables</h4>
<p>Just keep adding JOIN ... ON lines. Each new table must connect to something already in the query. Customers → Orders → OrderItems → Products is a chain of three joins. Read it left to right like a path.</p>
<h4>Self join</h4>
<p>Employees has a ManagerId that points to another employee. To show each person with their manager's name, join Employees to itself with two different aliases: <code>FROM Employees e LEFT JOIN Employees m ON m.EmployeeId = e.ManagerId</code>. LEFT, because the CEO has no manager.</p>
<div class="callout tip">Before writing a join, say the sentence out loud: "every ORDER with its CUSTOMER" (inner), or "every CUSTOMER and their orders, if any" (left). The words "if any" tell you it is a LEFT JOIN.</div>` },
    { name: 'Intermediate', body: `<h4>Where to put the filter: ON vs WHERE</h4>
<p>For an INNER JOIN it makes no difference. For a LEFT JOIN it changes the answer. A condition in ON decides which right-side rows match. A condition in WHERE runs after the join and drops whole rows. So:</p>
<ul>
<li><code>LEFT JOIN Orders o ON o.CustomerId = c.CustomerId AND o.Status = 'Delivered'</code> → every customer; only delivered orders attached; customers with none still appear.</li>
<li><code>LEFT JOIN Orders o ON o.CustomerId = c.CustomerId WHERE o.Status = 'Delivered'</code> → the WHERE throws away rows where Status is NULL, so customers without delivered orders vanish. Your LEFT JOIN silently became an INNER JOIN.</li>
</ul>
<h4>Row multiplication (the fan-out trap)</h4>
<p>Join Customers to Orders: one customer with two orders becomes two rows. Join those to OrderItems: each order with three items becomes three rows. Now COUNT(o.OrderId) counts each order three times, and so would a SUM of any order-level amount. Any time you join a "one" side to a "many" side and then aggregate the "one" side's numbers, you get inflated totals. Fixes: aggregate the many side first in a subquery or CTE, then join; or sum only columns that belong to the lowest level (OrderItems).</p>
<h4>Joining on multiple columns</h4>
<p>Sometimes a key has two parts (TenantId + CustomerId). Then the ON needs both: <code>ON o.TenantId = c.TenantId AND o.CustomerId = c.CustomerId</code>. Forgetting one column is a classic cause of fan-out.</p>
<h4>Anti-join and semi-join done right</h4>
<p><strong>Customers with at least one order</strong> (semi-join): <code>WHERE EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerId = c.CustomerId)</code>. Unlike an INNER JOIN, it never duplicates the customer.</p>
<p><strong>Customers with no orders</strong> (anti-join): <code>WHERE NOT EXISTS (...)</code>. Unlike NOT IN, it is safe with NULLs. The LEFT JOIN ... IS NULL form also works and is common in older code.</p>
<h4>Dialect notes</h4>
<ul>
<li>SQL Server and PostgreSQL both support INNER, LEFT, RIGHT, FULL and CROSS. MySQL lacks FULL OUTER JOIN (emulate with LEFT UNION RIGHT).</li>
<li>PostgreSQL has <code>USING (CustomerId)</code> as a shortcut when the column names match; SQL Server does not.</li>
<li>Old-style comma joins (<code>FROM A, B WHERE A.id = B.id</code>) still work but hide the join condition. Do not write them.</li>
</ul>
<div class="callout warn">If a query returns more rows than you expected, do not add DISTINCT. Count rows per key with GROUP BY and HAVING COUNT(*) &gt; 1 to find which join is fanning out.</div>` },
    { name: 'Expert', body: `<h4>How the engine physically joins</h4>
<p>You write a logical join; the optimizer picks a physical algorithm:</p>
<table><thead><tr><th>Algorithm</th><th>How</th><th>Best when</th></tr></thead>
<tbody>
<tr><td>Nested loops</td><td>For each outer row, look up matches in the inner (ideally via an index seek)</td><td>Small outer set, indexed inner</td></tr>
<tr><td>Hash join</td><td>Build a hash table on the smaller input, probe with the larger</td><td>Large unsorted inputs, equality joins</td></tr>
<tr><td>Merge join</td><td>Both inputs sorted on the join key, walk them together</td><td>Inputs already sorted (clustered index, prior sort)</td></tr>
</tbody></table>
<p>When a join is slow, the plan tells you which one was chosen and why. A nested loop over a million outer rows with a scan on the inner is the usual villain; an index on the inner join column fixes it.</p>
<h4>Join order and statistics</h4>
<p>The optimizer reorders joins freely (for inner joins) using statistics about row counts. Stale statistics lead to wrong estimates, which lead to a bad algorithm choice. In SQL Server, <code>UPDATE STATISTICS</code> or auto-update handles this; in PostgreSQL, <code>ANALYZE</code>. Outer joins constrain reordering because order affects the result, which is one more reason to not use LEFT JOIN where INNER is correct.</p>
<h4>LEFT JOIN vs EXISTS for "has any"</h4>
<p>EXISTS lets the engine stop at the first match (a semi-join); a LEFT JOIN + DISTINCT must materialise all matches and then deduplicate. On a customer with 10,000 orders, that is a 10,000× difference in work. Write what you mean.</p>
<h4>APPLY (SQL Server) and LATERAL (PostgreSQL)</h4>
<p>Sometimes the right side depends on the left row, like "the latest 3 orders for each customer". A normal JOIN cannot express "per row, run this subquery". <code>CROSS APPLY</code> (inner) and <code>OUTER APPLY</code> (left) in SQL Server, and <code>LATERAL</code> in PostgreSQL, do exactly that. The Subqueries lesson shows the syntax.</p>
<h4>Interview angle</h4>
<ul>
<li>"Difference between a filter in ON and in WHERE for a LEFT JOIN?" (above: ON filters matches, WHERE filters results).</li>
<li>"How do you find rows in A that are not in B?" NOT EXISTS, or LEFT JOIN ... IS NULL; explain why NOT IN is risky.</li>
<li>"What is a self join and when would you use it?" Hierarchies (manager), comparisons within one table (pairs of products in the same category).</li>
<li>"Explain hash join vs nested loops." As in the table above, plus: nested loops needs an index on the inner side to be fast.</li>
</ul>
<div class="callout idea">Run the four-table join from the code tab with the actual execution plan on. Then add an index on OrderItems(OrderId) and run it again. Watch the physical join change.</div>` }
  ],
  flow: {
    title: 'How a LEFT JOIN from Customers to Orders is built',
    steps: [
      { title: 'Take the left table', desc: 'Start with every row in Customers. In a LEFT JOIN, these rows are guaranteed to survive.' },
      { title: 'Look for matches', desc: 'For each customer, find rows in Orders where o.CustomerId = c.CustomerId (the ON condition).' },
      { title: 'Pair them', desc: 'Each match makes one output row: customer columns + order columns. A customer with two orders makes two rows.' },
      { title: 'Fill the gaps', desc: 'A customer with no matching order still produces one row, with every Orders column set to NULL.' },
      { title: 'Apply WHERE', desc: 'Now filter the combined rows. A WHERE on an Orders column drops the NULL-filled rows, which turns the LEFT JOIN into an INNER JOIN.' },
      { title: 'SELECT and ORDER', desc: 'Pick the columns, sort, return.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'All join types on the sample schema', code: `-- INNER: customers who have orders, with each order
SELECT c.Name, o.OrderId, o.OrderDate, o.Status
FROM Customers c
INNER JOIN Orders o ON o.CustomerId = c.CustomerId
ORDER BY c.Name, o.OrderDate;

-- LEFT: every customer, orders if any (Sara has none -> NULLs)
SELECT c.Name, o.OrderId, o.Status
FROM Customers c
LEFT JOIN Orders o ON o.CustomerId = c.CustomerId
ORDER BY c.Name;

-- Anti-join: customers who never ordered
SELECT c.Name
FROM Customers c
LEFT JOIN Orders o ON o.CustomerId = c.CustomerId
WHERE o.OrderId IS NULL;

-- Same thing, cleaner and NULL-safe
SELECT c.Name
FROM Customers c
WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerId = c.CustomerId);

-- FULL: everything from both sides (shows orphan orders if any exist)
SELECT c.Name, o.OrderId
FROM Customers c
FULL OUTER JOIN Orders o ON o.CustomerId = c.CustomerId;

-- CROSS: every product paired with every status (e.g. to build a report grid)
SELECT p.Name, s.Status
FROM Products p
CROSS JOIN (VALUES ('Placed'), ('Shipped'), ('Delivered')) AS s(Status);

-- SELF: each employee with their manager (LEFT so the CEO appears)
SELECT e.Name AS Employee, e.Title, m.Name AS Manager
FROM Employees e
LEFT JOIN Employees m ON m.EmployeeId = e.ManagerId
ORDER BY e.EmployeeId;` },
    { lang: 'sql', title: 'Four-table join, ON vs WHERE, and the fan-out trap', code: `-- Order details: customer -> order -> item -> product
SELECT c.Name AS Customer, o.OrderId, o.OrderDate,
       p.Name AS Product, oi.Quantity, oi.UnitPrice,
       oi.Quantity * oi.UnitPrice AS LineTotal
FROM Customers c
JOIN Orders     o  ON o.CustomerId  = c.CustomerId
JOIN OrderItems oi ON oi.OrderId    = o.OrderId
JOIN Products   p  ON p.ProductId   = oi.ProductId
WHERE c.City = 'Pune'
ORDER BY o.OrderId;

-- ON vs WHERE with LEFT JOIN
-- (a) every customer; attach only Delivered orders
SELECT c.Name, o.OrderId
FROM Customers c
LEFT JOIN Orders o ON o.CustomerId = c.CustomerId AND o.Status = 'Delivered';

-- (b) looks similar, but customers with no delivered order DISAPPEAR
SELECT c.Name, o.OrderId
FROM Customers c
LEFT JOIN Orders o ON o.CustomerId = c.CustomerId
WHERE o.Status = 'Delivered';

-- FAN-OUT TRAP: order 1 has 2 items, so its row is doubled.
-- Counting orders here gives 2 for order 1 instead of 1.
SELECT c.Name, COUNT(o.OrderId) AS OrdersCounted
FROM Customers c
JOIN Orders o      ON o.CustomerId = c.CustomerId
JOIN OrderItems oi ON oi.OrderId   = o.OrderId
GROUP BY c.Name;

-- FIX: aggregate the many side first, then join
SELECT c.Name, COUNT(o.OrderId) AS Orders, SUM(t.OrderTotal) AS Spent
FROM Customers c
JOIN Orders o ON o.CustomerId = c.CustomerId
JOIN (
    SELECT OrderId, SUM(Quantity * UnitPrice) AS OrderTotal
    FROM OrderItems
    GROUP BY OrderId
) t ON t.OrderId = o.OrderId
GROUP BY c.Name;

-- Find which key is fanning out
SELECT OrderId, COUNT(*) AS Lines
FROM OrderItems
GROUP BY OrderId
HAVING COUNT(*) > 1;` },
    { lang: 'csharp', title: 'Joins in EF Core: navigation properties vs explicit join', code: `// Model (simplified)
public class Customer { public int CustomerId { get; set; } public string Name { get; set; } = "";
                        public string? City { get; set; } public List<Order> Orders { get; set; } = new(); }
public class Order    { public int OrderId { get; set; } public int CustomerId { get; set; }
                        public Customer Customer { get; set; } = null!; public string Status { get; set; } = "";
                        public List<OrderItem> Items { get; set; } = new(); }
public class OrderItem{ public int OrderItemId { get; set; } public int OrderId { get; set; }
                        public int ProductId { get; set; } public int Quantity { get; set; } public decimal UnitPrice { get; set; } }

// 1. Navigation property: EF writes the LEFT JOIN for you
var customersWithOrders = await db.Customers
    .Include(c => c.Orders.Where(o => o.Status == "Delivered"))   // filtered Include = condition in ON
    .ToListAsync();

// 2. Projection: INNER JOIN semantics, only the columns you need
var rows = await db.Orders
    .Where(o => o.Customer.City == "Pune")
    .Select(o => new { o.OrderId, Customer = o.Customer.Name,
                       Total = o.Items.Sum(i => i.Quantity * i.UnitPrice) })  // no fan-out: SUM per order
    .ToListAsync();

// 3. Anti-join: customers with no orders -> NOT EXISTS
var neverOrdered = await db.Customers
    .Where(c => !c.Orders.Any())
    .Select(c => c.Name)
    .ToListAsync();

// 4. Explicit join when there is no navigation property
var explicitJoin = await db.Customers
    .Join(db.Orders, c => c.CustomerId, o => o.CustomerId,
          (c, o) => new { c.Name, o.OrderId })
    .ToListAsync();

// Always check what EF generated:
// Console.WriteLine(db.Customers.Where(c => !c.Orders.Any()).ToQueryString());` }
  ],
  pitfalls: [
    'Putting a right-table filter in WHERE after a LEFT JOIN. It silently becomes an INNER JOIN. Put it in ON, or add <code>OR col IS NULL</code>.',
    'Joining one-to-many and then summing the "one" side. Totals multiply. Aggregate the many side first.',
    'Joining on only part of a multi-column key. Rows fan out. Include every key column in ON.',
    'Using DISTINCT to hide fan-out instead of fixing the join.',
    'Writing comma joins (<code>FROM A, B WHERE ...</code>). Forget the WHERE and you get a CROSS JOIN with millions of rows.',
    'Choosing LEFT JOIN "to be safe" when an INNER JOIN is correct. It limits what the optimizer can do and may hide bad data.'
  ],
  quiz: [
    { q: 'Which join keeps every customer even if they have no orders?', options: ['INNER JOIN', 'LEFT JOIN from Customers to Orders', 'CROSS JOIN', 'RIGHT JOIN from Customers to Orders'], answer: 1, why: 'LEFT JOIN keeps all rows from the left table (Customers) and fills missing Orders columns with NULL.' },
    { q: 'Customers c LEFT JOIN Orders o ... WHERE o.Status = \'Delivered\'. What happens to customers with no orders?', options: ['They appear with NULL status', 'They are dropped', 'They appear once per status', 'Error'], answer: 1, why: 'Their o.Status is NULL, and NULL = \'Delivered\' is not TRUE, so the WHERE removes them. Put the condition in ON to keep them.' },
    { q: 'Customers (5 rows) CROSS JOIN Products (5 rows) returns how many rows?', options: ['5', '10', '25', '0'], answer: 2, why: 'CROSS JOIN pairs every row with every row: 5 × 5 = 25.' },
    { q: 'You join Orders to OrderItems and SUM an Orders-level amount. The total is too high. Why?', options: ['The index is missing', 'Each order row repeats once per item', 'SUM ignores NULL', 'The join should be a RIGHT JOIN instead'], answer: 1, why: 'This is fan-out. Aggregate OrderItems per order first, then join.' },
    { q: 'Which is the safest way to find customers with no orders?', options: ['WHERE CustomerId NOT IN (SELECT CustomerId FROM Orders)', 'WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerId = c.CustomerId)', 'INNER JOIN Orders o ON o.CustomerId = c.CustomerId WHERE o.CustomerId IS NULL', 'CROSS JOIN Orders'], answer: 1, why: 'NOT EXISTS handles NULLs correctly and lets the engine stop at the first match. NOT IN breaks if the subquery returns a NULL.' },
    { q: 'A self join is used to:', options: ['Join a table to a copy of itself', 'Join a table to every other table', 'Speed up INNER JOIN', 'Avoid NULLs'], answer: 0, why: 'A self join uses two aliases of the same table to relate rows to other rows in it, such as hierarchies.' }
  ],
  takeaways: [
    'A join matches rows across tables on a shared column, usually a key.',
    'INNER keeps matches only; LEFT keeps all left rows; FULL keeps everything; CROSS pairs everything.',
    'For LEFT JOIN, a condition in ON filters matches; a condition in WHERE filters results (and can kill the LEFT).',
    'One-to-many joins multiply rows. Aggregate the many side first before summing the one side.',
    'Use NOT EXISTS for "has none" and EXISTS for "has any"; they are NULL-safe and fast.',
    'The optimizer picks nested loops, hash or merge; an index on the inner join column is the usual fix for slow joins.'
  ],
  interview: [
    { q: 'What is the difference between INNER JOIN and LEFT JOIN?', a: `<p>INNER JOIN returns only rows that have a match in both tables. LEFT JOIN returns every row from the left table; where there is no match, the right table's columns are NULL. Use LEFT when "if any" is part of the question.</p>` },
    { q: 'How do you write "customers who have not placed any order"?', a: `<p>Preferred: <code>SELECT c.Name FROM Customers c WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerId = c.CustomerId)</code>. Alternative: LEFT JOIN Orders and filter <code>WHERE o.OrderId IS NULL</code>. Avoid NOT IN because a NULL in the subquery makes it return nothing.</p>` },
    { q: 'What causes duplicate rows after a join and how do you fix it?', a: `<p>Joining a one side to a many side (fan-out), or joining on an incomplete key. Find the offending key with GROUP BY / HAVING COUNT(*) &gt; 1, then either aggregate the many side first or add the missing key column to ON. DISTINCT hides the symptom, not the cause.</p>` },
    { q: 'Explain the physical join algorithms.', a: `<p>Nested loops: for each outer row, seek matches in the inner (great with an index and a small outer set). Hash join: build a hash table on the smaller input, probe with the larger (great for big unsorted inputs with equality predicates). Merge join: walk two sorted inputs together (great when both are already sorted). The optimizer chooses based on statistics.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m3-sql-sorting-grouping — Sorting & Grouping                         */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-sorting-grouping'] = {
  hook: `"Orders per city, biggest city first" is one sentence to a manager and one GROUP BY plus one ORDER BY to you. Learn the two rules of GROUP BY and you will never get the "not contained in an aggregate" error again.`,
  intro: `<p><span class="term">ORDER BY</span> controls the order rows come back in. Without it, the order is whatever was convenient for the engine, and it can change between runs. <span class="term">GROUP BY</span> folds many rows into one row per group, so you can count or total them. "Orders per customer" means: group the Orders rows by CustomerId, then count each group.</p>
<p>Once rows are grouped, <span class="term">HAVING</span> filters the groups, the way WHERE filters rows. "Customers with more than two orders" is a HAVING.</p>
<p>This lesson also introduces <span class="term">ROLLUP</span> and <span class="term">GROUPING SETS</span>, which give you subtotals and grand totals in a single query, the way a spreadsheet pivot table does.</p>`,
  realLife: {
    title: 'Sorting mail, then counting the piles',
    body: `<p>A post office gets a sack of letters. First job: sort them. By city, then by street within the city. That is ORDER BY City, Street. Second job: the manager wants to know how many letters go to each city. You make one pile per city and count the piles. That is GROUP BY City with COUNT(*). Then she asks, "only tell me about cities with more than 100 letters". That is HAVING COUNT(*) &gt; 100. And "give me the total for the whole sack too" is ROLLUP.</p>
<p>Notice you cannot ask "what is the street of the Pune pile". A pile has many streets. That is the whole GROUP BY rule: once you group, you can only talk about the group key or a summary of the pile.</p>
<p><strong>Where companies use this:</strong> every analytics dashboard at Swiggy (orders per hour per city), every finance close at a bank (transactions per account per day), and every "top customers" email. In EF Core, <code>GroupBy</code> and <code>OrderBy</code> produce these clauses.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>ORDER BY</h4>
<ul>
<li><code>ORDER BY JoinedOn</code> → oldest first (ASC is the default).</li>
<li><code>ORDER BY JoinedOn DESC</code> → newest first.</li>
<li><code>ORDER BY City, Name</code> → by city, and within the same city, by name. Each column can have its own direction: <code>ORDER BY City ASC, JoinedOn DESC</code>.</li>
<li>You can sort by an alias from SELECT (<code>ORDER BY LineTotal</code>) or by an expression.</li>
<li>Sorting by column position (<code>ORDER BY 2</code>) works but breaks when columns move. Use names.</li>
</ul>
<h4>Where do NULLs go?</h4>
<p>SQL Server puts NULLs first in ASC and last in DESC. PostgreSQL does the opposite (NULLs last in ASC) and lets you say <code>NULLS FIRST</code> / <code>NULLS LAST</code>. In SQL Server you fake it with a CASE: <code>ORDER BY CASE WHEN City IS NULL THEN 1 ELSE 0 END, City</code>.</p>
<h4>GROUP BY: one row per group</h4>
<p><code>SELECT City, COUNT(*) AS Customers FROM Customers GROUP BY City</code> gives one row per distinct city with the count. Two rules:</p>
<ol>
<li>Every column in SELECT must be either in the GROUP BY or inside an aggregate (COUNT, SUM, AVG, MIN, MAX).</li>
<li>WHERE runs before grouping (filters rows); HAVING runs after (filters groups).</li>
</ol>
<p>Break rule 1 and you get the famous error "column is invalid in the select list because it is not contained in either an aggregate function or the GROUP BY clause". It means: you asked for a detail of a pile.</p>
<h4>HAVING vs WHERE</h4>
<p>"Count orders per customer, but only count Delivered ones" → the Delivered filter is a WHERE (it chooses rows before piling). "Show only customers with 2+ orders" → that is a HAVING (it chooses piles). You often need both in one query.</p>
<div class="callout tip">Write queries in the engine's order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY. Fill the GROUP BY list first, then the SELECT list. The error goes away by construction.</div>` },
    { name: 'Intermediate', body: `<h4>Grouping by several columns and by expressions</h4>
<p><code>GROUP BY City, YEAR(JoinedOn)</code> gives one row per city per year. You can group by any expression, but then the SELECT must use the same expression (or an alias in PostgreSQL; SQL Server does not allow SELECT aliases in GROUP BY, so repeat the expression or use a CTE).</p>
<h4>GROUP BY on joined tables</h4>
<p>Group after joining. "Total spent per customer" joins Customers → Orders → OrderItems, then groups by customer. Remember the fan-out trap from Joins: sum only columns at the lowest level you joined to (OrderItems), or pre-aggregate.</p>
<h4>Sorting grouped results</h4>
<p>ORDER BY runs after GROUP BY, so you can sort by an aggregate: <code>ORDER BY COUNT(*) DESC</code> or by its alias. "Top 3 cities by customers" = GROUP BY City, ORDER BY COUNT(*) DESC, TOP 3.</p>
<h4>ROLLUP, CUBE and GROUPING SETS</h4>
<p>Normal GROUP BY gives one level. ROLLUP adds subtotals and a grand total:</p>
<ul>
<li><code>GROUP BY ROLLUP (City, Status)</code> → rows for each (City, Status), plus one per City (Status NULL), plus one grand total (both NULL).</li>
<li><code>GROUP BY CUBE (City, Status)</code> → every combination of subtotals, including per Status across all cities.</li>
<li><code>GROUP BY GROUPING SETS ((City), (Status), ())</code> → exactly the levels you list.</li>
</ul>
<p>The subtotal rows show NULL in the rolled-up column. To tell "real NULL" from "subtotal", use <code>GROUPING(City)</code>, which returns 1 for a subtotal row. Both SQL Server and PostgreSQL support all three.</p>
<h4>DISTINCT vs GROUP BY</h4>
<p><code>SELECT DISTINCT City</code> and <code>SELECT City ... GROUP BY City</code> return the same rows. GROUP BY is the one to use when you also need a count or sum. Mixing DISTINCT and GROUP BY in one query is almost always a sign of a fan-out bug.</p>
<h4>Paging sorted results</h4>
<p>For page 3 of 20 rows: <code>ORDER BY OrderDate DESC, OrderId DESC OFFSET 40 ROWS FETCH NEXT 20 ROWS ONLY</code>. Always include a unique column (OrderId) as a tiebreaker, or rows can jump between pages when dates repeat.</p>
<div class="callout warn">OFFSET paging reads and throws away all skipped rows, so page 1000 is slow. For infinite scroll use keyset paging: <code>WHERE (OrderDate, OrderId) &lt; (@lastDate, @lastId)</code> style (in SQL Server, written with OR conditions), ordered the same way.</div>` },
    { name: 'Expert', body: `<h4>How GROUP BY runs</h4>
<p>Two physical operators: <strong>Hash Aggregate</strong> (build a hash table keyed by the group columns, accumulate counts/sums; order of input does not matter) and <strong>Stream Aggregate</strong> (input already sorted by group key; emit a row each time the key changes; uses almost no memory). The optimizer picks Stream when an index provides the order, Hash otherwise. A large hash aggregate can spill to disk (tempdb) when memory is underestimated, which shows up as a warning in the plan.</p>
<h4>Sort is expensive</h4>
<p>ORDER BY on a large result requires a sort, which is O(n log n) and memory hungry. An index whose key order matches the ORDER BY lets the engine avoid the sort entirely. This is why "ORDER BY OrderDate DESC" over millions of rows with TOP 20 is instant when there is an index on OrderDate and painful when there is not.</p>
<h4>Functional dependency and the GROUP BY rule</h4>
<p>If you group by CustomerId, the customer's Name is determined by it, yet most engines still make you add Name to GROUP BY or wrap it in MAX(). PostgreSQL relaxes this when you group by the primary key: columns of that table may appear freely. SQL Server does not. The clean pattern is to aggregate on the key in a CTE, then join to fetch the descriptive columns.</p>
<h4>ROLLUP under the hood</h4>
<p>ROLLUP(A, B) is sugar for GROUPING SETS((A, B), (A), ()). The engine computes the finest level once and derives coarser levels from it when possible, which is cheaper than three separate queries with UNION ALL. In SQL Server, use <code>GROUPING_ID()</code> to get a bitmask that identifies which level a row belongs to.</p>
<h4>Ordering guarantees</h4>
<p>Only the outermost ORDER BY defines result order. An ORDER BY inside a subquery, view or CTE is not guaranteed to survive (SQL Server even refuses it without TOP). If you need order, put ORDER BY on the final SELECT.</p>
<h4>Interview angle</h4>
<ul>
<li>"WHERE vs HAVING?" Rows before grouping vs groups after. HAVING without GROUP BY treats the whole table as one group.</li>
<li>"Why does ORDER BY in a view not work?" Order is a property of the final result set, not of a table expression.</li>
<li>"How to get subtotals in one query?" ROLLUP / GROUPING SETS, with GROUPING() to label rows.</li>
<li>"Why is deep OFFSET paging slow and what is the alternative?" It scans and discards; use keyset (seek) paging.</li>
</ul>
<div class="callout idea">Write "top 5 customers by money spent, with a grand total row" using ROLLUP and a join. It touches everything in this lesson and the previous one.</div>` }
  ],
  flow: {
    title: 'How GROUP BY, HAVING and ORDER BY run together',
    steps: [
      { title: 'FROM + JOIN', desc: 'Build the combined rows from the tables involved.' },
      { title: 'WHERE', desc: 'Drop rows that do not qualify. This runs before grouping, so it cannot use aggregates.' },
      { title: 'GROUP BY', desc: 'Put rows into piles by the group key (hash or sorted stream). One pile per distinct key.' },
      { title: 'Aggregate', desc: 'For each pile, compute COUNT, SUM, AVG, MIN, MAX.' },
      { title: 'HAVING', desc: 'Drop piles whose aggregate does not qualify, e.g. COUNT(*) < 2.' },
      { title: 'SELECT', desc: 'Keep only group keys and aggregates (the GROUP BY rule).' },
      { title: 'ORDER BY + TOP', desc: 'Sort the group rows, often by an aggregate, then take the first N.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'Sorting, including NULL placement and paging', code: `-- Multi-column sort with mixed directions
SELECT Name, City, JoinedOn
FROM Customers
ORDER BY City ASC, JoinedOn DESC;

-- NULL cities last in SQL Server (ASC puts NULL first by default)
SELECT Name, City
FROM Customers
ORDER BY CASE WHEN City IS NULL THEN 1 ELSE 0 END, City;

-- PostgreSQL has it built in:
-- SELECT Name, City FROM Customers ORDER BY City NULLS LAST;

-- Sort by an expression / alias
SELECT OrderId, Quantity * UnitPrice AS LineTotal
FROM OrderItems
ORDER BY LineTotal DESC;

-- Paging (works in SQL Server 2012+ and PostgreSQL). Tiebreaker on OrderId!
SELECT OrderId, OrderDate
FROM Orders
ORDER BY OrderDate DESC, OrderId DESC
OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;

-- Keyset paging: "next page after the last row I showed"
DECLARE @lastDate DATETIME2 = '2026-02-20 18:45', @lastId INT = 3;
SELECT TOP 2 OrderId, OrderDate
FROM Orders
WHERE OrderDate < @lastDate
   OR (OrderDate = @lastDate AND OrderId < @lastId)
ORDER BY OrderDate DESC, OrderId DESC;` },
    { lang: 'sql', title: 'GROUP BY, HAVING, and the two rules', code: `-- One row per city with a count (NULL city forms its own group)
SELECT City, COUNT(*) AS Customers
FROM Customers
GROUP BY City
ORDER BY Customers DESC, City;

-- WHERE filters rows BEFORE grouping; HAVING filters groups AFTER
SELECT c.Name, COUNT(o.OrderId) AS DeliveredOrders
FROM Customers c
JOIN Orders o ON o.CustomerId = c.CustomerId
WHERE o.Status = 'Delivered'          -- row filter
GROUP BY c.Name
HAVING COUNT(o.OrderId) >= 1          -- group filter
ORDER BY DeliveredOrders DESC;

-- Group by an expression (SQL Server: repeat it; PostgreSQL may use the alias)
SELECT YEAR(OrderDate) AS Yr, MONTH(OrderDate) AS Mon, COUNT(*) AS Orders
FROM Orders
GROUP BY YEAR(OrderDate), MONTH(OrderDate)
ORDER BY Yr, Mon;

-- THIS FAILS: Name is neither grouped nor aggregated
-- SELECT CustomerId, Name, COUNT(*) FROM Customers GROUP BY City;

-- Total spent per customer, done without fan-out: aggregate at item level
SELECT c.CustomerId, c.Name, SUM(oi.Quantity * oi.UnitPrice) AS Spent
FROM Customers c
JOIN Orders o      ON o.CustomerId = c.CustomerId
JOIN OrderItems oi ON oi.OrderId   = o.OrderId
WHERE o.Status <> 'Cancelled'
GROUP BY c.CustomerId, c.Name
ORDER BY Spent DESC;

-- Top 3 cities by number of orders
SELECT TOP 3 c.City, COUNT(*) AS Orders
FROM Orders o
JOIN Customers c ON c.CustomerId = o.CustomerId
GROUP BY c.City
ORDER BY Orders DESC;` },
    { lang: 'sql', title: 'Subtotals with ROLLUP and GROUPING SETS', code: `-- Orders per city and status, plus per-city subtotals and a grand total
SELECT
    CASE WHEN GROUPING(c.City)   = 1 THEN 'ALL CITIES' ELSE COALESCE(c.City, 'Unknown') END AS City,
    CASE WHEN GROUPING(o.Status) = 1 THEN 'ALL'        ELSE o.Status END AS Status,
    COUNT(*) AS Orders
FROM Orders o
JOIN Customers c ON c.CustomerId = o.CustomerId
GROUP BY ROLLUP (c.City, o.Status)
ORDER BY GROUPING(c.City), c.City, GROUPING(o.Status), o.Status;

-- Pick exactly the levels you want: by city, by status, and overall
SELECT c.City, o.Status, COUNT(*) AS Orders
FROM Orders o
JOIN Customers c ON c.CustomerId = o.CustomerId
GROUP BY GROUPING SETS ((c.City), (o.Status), ());

-- HAVING without GROUP BY: the whole table is one group
SELECT COUNT(*) AS Total
FROM Orders
HAVING COUNT(*) > 3;` }
  ],
  pitfalls: [
    'Relying on row order without ORDER BY. The engine owes you no order; it only looks stable until the plan changes.',
    'Selecting a column that is not in GROUP BY and not aggregated. Add it to GROUP BY, wrap it in MAX(), or aggregate on the key and join for details.',
    'Putting a row condition in HAVING (<code>HAVING Status = \'Delivered\'</code>). It may work but it groups first and filters later, doing extra work. Use WHERE.',
    'Paging without a unique tiebreaker column in ORDER BY. Rows repeat or vanish between pages.',
    'Assuming NULLs sort the same everywhere. SQL Server puts them first in ASC; PostgreSQL last. Be explicit.',
    'Expecting an ORDER BY inside a view or subquery to order the final result. Only the outermost ORDER BY counts.'
  ],
  quiz: [
    { q: 'Which clause filters groups after aggregation?', options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'], answer: 1, why: 'WHERE filters rows before grouping; HAVING filters the groups (piles) after the aggregates are computed.' },
    { q: 'SELECT City, Name, COUNT(*) FROM Customers GROUP BY City. What happens?', options: ['Works, and shows the first Name found in each city', 'Error: Name is not grouped or aggregated', 'Returns all rows', 'Returns NULL names'], answer: 1, why: 'Every selected column must be in GROUP BY or inside an aggregate. Name is neither.' },
    { q: 'In SQL Server, ORDER BY City ASC puts NULL cities:', options: ['First', 'Last', 'Randomly', 'It removes them'], answer: 0, why: 'SQL Server sorts NULL as the lowest value, so ASC puts them first. PostgreSQL defaults to NULLS LAST for ASC.' },
    { q: 'GROUP BY ROLLUP (City, Status) produces rows for:', options: ['Only (City, Status) pairs', '(City, Status), per-City subtotals, and a grand total', 'Every combination including per-Status totals', 'Only the grand total'], answer: 1, why: 'ROLLUP walks the list right to left: full detail, then City subtotals, then the overall total. CUBE would add per-Status totals.' },
    { q: 'Why add OrderId to ORDER BY OrderDate DESC when paging?', options: ['It makes the query faster', 'Dates can tie, so rows may shift between pages', 'OFFSET and FETCH need at least two sort columns', 'To remove NULLs'], answer: 1, why: 'A unique tiebreaker makes the order deterministic so each row lands on exactly one page.' },
    { q: 'Which runs first?', options: ['HAVING', 'ORDER BY', 'WHERE', 'SELECT'], answer: 2, why: 'Logical order is FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY.' }
  ],
  takeaways: [
    'No ORDER BY means no guaranteed order. Always sort when order matters, with a unique tiebreaker for paging.',
    'GROUP BY makes one row per distinct key; SELECT may only contain group keys and aggregates.',
    'WHERE filters rows before grouping; HAVING filters groups after. Use both when needed.',
    'ROLLUP, CUBE and GROUPING SETS give subtotals in one query; GROUPING() labels the subtotal rows.',
    'Hash aggregate vs stream aggregate, and a sort-avoiding index, decide whether a GROUP BY is fast.',
    'Deep OFFSET paging is slow; keyset paging seeks straight to the next page.'
  ],
  interview: [
    { q: 'Explain the difference between WHERE and HAVING with an example.', a: `<p>WHERE filters individual rows before grouping: <code>WHERE Status = 'Delivered'</code>. HAVING filters groups using aggregates after grouping: <code>HAVING COUNT(*) &gt; 2</code>. "Delivered orders per customer, only customers with more than two" uses both.</p>` },
    { q: 'Why can you not select a non-grouped column?', a: `<p>After grouping, each output row represents many input rows. A non-grouped, non-aggregated column has many possible values for that group, so the engine refuses to pick one. Add it to GROUP BY, aggregate it, or aggregate on the key and join back for details.</p>` },
    { q: 'How would you produce a report with per-city subtotals and a grand total in one query?', a: `<p><code>GROUP BY ROLLUP (City, Status)</code>, and use <code>GROUPING(City)</code> to label subtotal rows, since a NULL in the City column could otherwise mean either "unknown city" or "subtotal".</p>` },
    { q: 'What is keyset pagination and why prefer it over OFFSET?', a: `<p>Keyset paging uses the last seen sort key as a WHERE predicate (<code>WHERE OrderDate &lt; @last ...</code>) with the same ORDER BY, so the engine seeks straight to the next page. OFFSET must read and discard every skipped row, so page 1000 costs 1000 pages of work.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m3-sql-aggregation — Aggregation                                    */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-aggregation'] = {
  hook: `COUNT(*) and COUNT(Email) give different answers on the same table. If you do not know why, your next revenue report is already wrong.`,
  intro: `<p>An <span class="term">aggregate function</span> takes many rows and returns one value: how many (COUNT), how much in total (SUM), the typical value (AVG), the smallest (MIN) and the largest (MAX). Used alone they summarise a whole table; used with GROUP BY they summarise each group.</p>
<p>They all share one quiet rule: <strong>they ignore NULL</strong>. That one rule explains most surprises, from COUNT giving a smaller number than expected to AVG looking too high.</p>
<p>This lesson also shows how to get several different totals in one pass with CASE inside an aggregate (a "manual pivot"), how to turn a group of names into one comma-separated string with <span class="term">STRING_AGG</span>, and a preview of running totals, which get their own lesson under window functions.</p>`,
  realLife: {
    title: 'The end-of-day till count',
    body: `<p>A shop closes and the manager counts up. How many sales? (COUNT). How much money? (SUM). Average basket? (AVG = SUM / COUNT). Biggest single sale? (MAX). Then she wants it split: cash vs card, in two columns on one line. That is SUM(CASE WHEN method = 'cash' THEN amount END) next to SUM(CASE WHEN method = 'card' THEN amount END). Finally, "list the names of the staff who worked today, comma separated", which is STRING_AGG.</p>
<p>Now the NULL catch: a few receipts have no customer email. "How many customers gave an email?" is COUNT(Email), which skips the blanks. "How many receipts?" is COUNT(*), which counts every row. Two questions, two different counts, same table.</p>
<p><strong>Where companies use this:</strong> daily settlement at Paytm, monthly active users at any SaaS company, "average order value" on every e-commerce dashboard. In C#, these map to LINQ's Count, Sum, Average, Min, Max, and string.Join.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The five core aggregates</h4>
<table><thead><tr><th>Function</th><th>Returns</th><th>Example</th></tr></thead>
<tbody>
<tr><td>COUNT(*)</td><td>Number of rows</td><td>How many orders?</td></tr>
<tr><td>COUNT(col)</td><td>Number of rows where col is not NULL</td><td>How many customers with an email?</td></tr>
<tr><td>SUM(col)</td><td>Total of non-NULL values</td><td>Total revenue</td></tr>
<tr><td>AVG(col)</td><td>SUM / COUNT of non-NULL values</td><td>Average price</td></tr>
<tr><td>MIN / MAX(col)</td><td>Smallest / largest non-NULL value (works on text and dates too)</td><td>First and last order date</td></tr>
</tbody></table>
<h4>COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col)</h4>
<ul>
<li><code>COUNT(*)</code> counts rows. It never skips anything.</li>
<li><code>COUNT(City)</code> counts rows where City is not NULL. In our Customers table, COUNT(*) is 5 but COUNT(City) is 4.</li>
<li><code>COUNT(DISTINCT City)</code> counts different non-NULL cities: 3.</li>
</ul>
<h4>NULL is ignored, not treated as zero</h4>
<p>AVG(Salary) over salaries 100, 200, NULL is 150, not 100. If you want NULL to count as zero, say so: <code>AVG(COALESCE(Salary, 0))</code>. SUM over only NULLs is NULL, not 0, so wrap it in COALESCE when you print it.</p>
<h4>Integer division surprise</h4>
<p><code>AVG(Quantity)</code> over integers 1, 2 gives 1 in SQL Server, because integer math drops the fraction. Write <code>AVG(Quantity * 1.0)</code> or <code>AVG(CAST(Quantity AS DECIMAL(10,2)))</code>. PostgreSQL returns a numeric for AVG over integers, so it gives 1.5.</p>
<h4>With and without GROUP BY</h4>
<p>Without GROUP BY, the whole table is one group and you get one row. With GROUP BY City you get one row per city. The GROUP BY rule from the previous lesson applies: only group keys and aggregates in SELECT.</p>
<div class="callout tip">When a number looks wrong, ask two questions: "which rows did I count?" (WHERE / join fan-out) and "which values were NULL?" (COUNT(col) vs COUNT(*)).</div>` },
    { name: 'Intermediate', body: `<h4>Conditional aggregation (pivot by hand)</h4>
<p>You want one row per customer with separate columns for Delivered, Shipped and Cancelled counts. CASE inside the aggregate does it: <code>SUM(CASE WHEN Status = 'Delivered' THEN 1 ELSE 0 END) AS Delivered</code>. Or <code>COUNT(CASE WHEN Status = 'Delivered' THEN 1 END)</code>, which works because COUNT ignores the NULL that CASE returns when there is no ELSE. This is the most useful aggregation trick you will learn; it replaces the awkward PIVOT syntax most of the time.</p>
<h4>STRING_AGG: many rows into one string</h4>
<p><code>STRING_AGG(Name, ', ')</code> joins all names in the group with a comma. Add order: SQL Server uses <code>WITHIN GROUP (ORDER BY Name)</code>; PostgreSQL puts <code>ORDER BY</code> inside the call: <code>STRING_AGG(Name, ', ' ORDER BY Name)</code>. Both are available in SQL Server 2017+ and PostgreSQL 9+.</p>
<h4>Aggregates on dates and text</h4>
<p>MIN(OrderDate) is the first order; MAX(OrderDate) the latest. MIN(Name) is alphabetically first. DATEDIFF(day, MIN(OrderDate), MAX(OrderDate)) is how long a customer has been active.</p>
<h4>Percentages and ratios</h4>
<p>Share of each city in total orders: you need the city count and the overall count in the same expression. Two ways: a subquery for the total (<code>COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Orders)</code>), or a window function <code>SUM(COUNT(*)) OVER ()</code>, which is the cleaner modern answer (Window Functions lesson).</p>
<h4>A preview of running totals</h4>
<p>"Cumulative revenue by day" is not a GROUP BY problem; grouping collapses rows, and you want to keep them. It is a window function: <code>SUM(Amount) OVER (ORDER BY Day)</code>. Keep this in mind so you do not try to solve it with self joins.</p>
<h4>Other aggregates you will meet</h4>
<ul>
<li><code>COUNT_BIG</code> (SQL Server) for counts beyond 2 billion.</li>
<li><code>STDEV</code> / <code>VAR</code> (SQL Server), <code>STDDEV</code> / <code>VARIANCE</code> (PostgreSQL) for spread.</li>
<li><code>APPROX_COUNT_DISTINCT</code> (SQL Server 2019+) and <code>ARRAY_AGG</code>, <code>BOOL_AND</code>, <code>JSON_AGG</code> (PostgreSQL).</li>
</ul>
<div class="callout warn">SUM of DECIMAL(10,2) can overflow the type's precision on huge tables. SQL Server widens the result automatically for DECIMAL, but SUM over INT stays INT and throws an arithmetic overflow at 2,147,483,647. Use COUNT_BIG / CAST to BIGINT for large sums of integers.</div>` },
    { name: 'Expert', body: `<h4>What COUNT(*) really costs</h4>
<p>Counting every row of a large table reads the smallest index that covers the table (the engine picks it automatically), which is still a full scan. For approximate counts, SQL Server exposes <code>sys.dm_db_partition_stats</code> and PostgreSQL has <code>pg_class.reltuples</code>; dashboards that show "about 12.4M users" use those. For exact filtered counts, a filtered index or a maintained counter table is the usual design.</p>
<h4>COUNT(DISTINCT) is expensive</h4>
<p>Distinct counting requires a hash set or sort of all values per group. On billions of rows, HyperLogLog-style approximations (<code>APPROX_COUNT_DISTINCT</code>) use fixed memory with ~2% error and are the right tool for analytics.</p>
<h4>Aggregation and floating point</h4>
<p>SUM over FLOAT is not associative: the order of additions changes the last digits, and parallel plans can change the order between runs. For money, always use DECIMAL / NUMERIC, never FLOAT. This is the same lesson as "0.1 + 0.2" in C#.</p>
<h4>Pre-aggregation and materialised views</h4>
<p>When the same aggregate query runs thousands of times a day, compute it once. SQL Server indexed views and PostgreSQL materialised views store the grouped result; the engine (SQL Server) can even rewrite queries to use them. Streaming systems do the same with incremental aggregates in Kafka Streams or Flink (HLD module).</p>
<h4>Aggregates and parallelism</h4>
<p>Aggregates are embarrassingly parallel: each thread aggregates a partition, then a final step merges the partial results (partial aggregate + global aggregate in plans). This is why big GROUP BY queries scale well across cores, but it also means the merge step for COUNT(DISTINCT) and STRING_AGG with ORDER BY is a serial bottleneck.</p>
<h4>Interview angle</h4>
<ul>
<li>"COUNT(*) vs COUNT(1) vs COUNT(col)?" The first two are identical (the optimizer treats them the same). COUNT(col) skips NULLs.</li>
<li>"How does AVG treat NULL?" Ignored in both numerator and denominator.</li>
<li>"How would you count how many orders each status has, as columns?" Conditional aggregation with CASE.</li>
<li>"Why not store money as FLOAT?" Rounding errors accumulate in SUM.</li>
</ul>
<div class="callout idea">Benchmark COUNT(DISTINCT CustomerId) vs APPROX_COUNT_DISTINCT on a million-row Orders table. Look at the memory grant in the plan for each.</div>` }
  ],
  flow: {
    title: 'How SUM(CASE WHEN ...) builds a pivot per group',
    steps: [
      { title: 'Rows arrive', desc: 'After FROM/WHERE, the engine has one row per order with CustomerId and Status.' },
      { title: 'Group', desc: 'Rows are bucketed by CustomerId (hash or stream aggregate).' },
      { title: 'Evaluate CASE', desc: 'For each row, each CASE produces 1 or 0 (or NULL): Delivered? Shipped? Cancelled?' },
      { title: 'Accumulate', desc: 'Each bucket keeps a running SUM per CASE column. NULLs are skipped.' },
      { title: 'Emit', desc: 'When a bucket is complete, one row comes out: CustomerId, Delivered, Shipped, Cancelled.' },
      { title: 'Finish', desc: 'HAVING, ORDER BY and TOP apply to those group rows.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'Core aggregates and the NULL rule', code: `-- Whole-table summary (one row)
SELECT COUNT(*)               AS Rows,
       COUNT(City)            AS WithCity,          -- 4, NULL skipped
       COUNT(DISTINCT City)   AS DistinctCities,    -- 3
       MIN(JoinedOn)          AS FirstJoin,
       MAX(JoinedOn)          AS LatestJoin
FROM Customers;

-- Revenue summary from items (non-cancelled orders)
SELECT COUNT(DISTINCT o.OrderId)              AS Orders,
       SUM(oi.Quantity * oi.UnitPrice)        AS Revenue,
       AVG(oi.Quantity * oi.UnitPrice)        AS AvgLine,
       MAX(oi.Quantity * oi.UnitPrice)        AS BiggestLine
FROM Orders o
JOIN OrderItems oi ON oi.OrderId = o.OrderId
WHERE o.Status <> 'Cancelled';

-- Integer AVG trap in SQL Server: 1,2,10,1,2,1,1 -> 2 (not 2.57)
SELECT AVG(Quantity) AS IntAvg, AVG(Quantity * 1.0) AS RealAvg FROM OrderItems;

-- SUM over nothing is NULL; show 0 instead
SELECT COALESCE(SUM(Quantity), 0) AS Qty
FROM OrderItems WHERE ProductId = 999;

-- Per customer: average order value (aggregate per order first, then per customer)
SELECT c.Name, COUNT(*) AS Orders, AVG(t.OrderTotal) AS AvgOrderValue
FROM Customers c
JOIN Orders o ON o.CustomerId = c.CustomerId
JOIN (SELECT OrderId, SUM(Quantity * UnitPrice) AS OrderTotal
      FROM OrderItems GROUP BY OrderId) t ON t.OrderId = o.OrderId
GROUP BY c.Name
ORDER BY AvgOrderValue DESC;` },
    { lang: 'sql', title: 'Conditional aggregation (manual pivot) and STRING_AGG', code: `-- One row per customer, one column per status
SELECT c.Name,
       SUM(CASE WHEN o.Status = 'Delivered' THEN 1 ELSE 0 END) AS Delivered,
       SUM(CASE WHEN o.Status = 'Shipped'   THEN 1 ELSE 0 END) AS Shipped,
       SUM(CASE WHEN o.Status = 'Cancelled' THEN 1 ELSE 0 END) AS Cancelled,
       COUNT(o.OrderId)                                         AS Total
FROM Customers c
LEFT JOIN Orders o ON o.CustomerId = c.CustomerId
GROUP BY c.Name
ORDER BY Total DESC;

-- Same idea with COUNT (CASE returns NULL when no ELSE, and COUNT skips NULL)
SELECT p.Category,
       COUNT(CASE WHEN p.Price >= 10000 THEN 1 END) AS Premium,
       COUNT(CASE WHEN p.Price <  10000 THEN 1 END) AS Regular
FROM Products p
GROUP BY p.Category;

-- Revenue split by category, as columns
SELECT SUM(CASE WHEN p.Category = 'Electronics' THEN oi.Quantity * oi.UnitPrice ELSE 0 END) AS Electronics,
       SUM(CASE WHEN p.Category = 'Furniture'   THEN oi.Quantity * oi.UnitPrice ELSE 0 END) AS Furniture,
       SUM(CASE WHEN p.Category = 'Stationery'  THEN oi.Quantity * oi.UnitPrice ELSE 0 END) AS Stationery
FROM OrderItems oi
JOIN Products p ON p.ProductId = oi.ProductId;

-- Names per city as one string (SQL Server 2017+)
SELECT COALESCE(City, 'Unknown') AS City,
       STRING_AGG(Name, ', ') WITHIN GROUP (ORDER BY Name) AS Members
FROM Customers
GROUP BY City;
-- PostgreSQL:
-- SELECT COALESCE(City,'Unknown'), STRING_AGG(Name, ', ' ORDER BY Name) FROM Customers GROUP BY City;

-- Percent of total per city (subquery version; window version in a later lesson)
SELECT c.City, COUNT(*) AS Orders,
       COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Orders) AS PctOfAll
FROM Orders o JOIN Customers c ON c.CustomerId = o.CustomerId
GROUP BY c.City;` },
    { lang: 'csharp', title: 'The same aggregates in LINQ / EF Core', code: `// Whole-table summary
var rows         = await db.Customers.CountAsync();                 // COUNT(*)
var withCity     = await db.Customers.CountAsync(c => c.City != null); // COUNT(City)
var distinctCity = await db.Customers.Where(c => c.City != null)
                                     .Select(c => c.City).Distinct().CountAsync();

// Revenue from items of non-cancelled orders (SUM over a computed value)
var revenue = await db.OrderItems
    .Where(i => i.Order.Status != "Cancelled")
    .SumAsync(i => i.Quantity * i.UnitPrice);

// Conditional counts per customer: EF translates each Count(...) into a COUNT subquery
var byStatus = await db.Customers
    .Select(c => new
    {
        c.Name,
        Delivered = c.Orders.Count(o => o.Status == "Delivered"),
        Shipped   = c.Orders.Count(o => o.Status == "Shipped"),
        Cancelled = c.Orders.Count(o => o.Status == "Cancelled"),
        Total     = c.Orders.Count()
    })
    .OrderByDescending(x => x.Total)
    .ToListAsync();

// STRING_AGG equivalent: EF Core 7+ translates string.Join in GroupBy projections
var membersByCity = await db.Customers
    .GroupBy(c => c.City ?? "Unknown")
    .Select(g => new { City = g.Key, Members = string.Join(", ", g.Select(c => c.Name)) })
    .ToListAsync();

// Average that must not be integer-divided: Average over decimal, not int
var avgQty = await db.OrderItems.AverageAsync(i => (decimal)i.Quantity);` }
  ],
  pitfalls: [
    'Using COUNT(col) when you meant COUNT(*). NULLs in col make the count smaller.',
    'Expecting AVG to treat NULL as zero. It skips NULL rows entirely. Use COALESCE if zero is the intent.',
    'AVG over integer columns in SQL Server truncates. Multiply by 1.0 or cast first.',
    'Summing after a one-to-many join without pre-aggregating. Fan-out inflates the total.',
    'Storing money as FLOAT. SUM accumulates rounding error. Use DECIMAL.',
    'Writing a separate query per status instead of one conditional aggregation. Slower and harder to keep consistent.'
  ],
  quiz: [
    { q: 'Customers has 5 rows and one NULL City. COUNT(City) returns:', options: ['5', '4', '1', 'NULL'], answer: 1, why: 'COUNT(col) counts only rows where col is not NULL.' },
    { q: 'AVG over values 10, 20, NULL returns:', options: ['10', '15', '20', 'NULL'], answer: 1, why: 'NULL is ignored: (10 + 20) / 2 = 15.' },
    { q: 'SUM(CASE WHEN Status = \'Delivered\' THEN 1 ELSE 0 END) computes:', options: ['Total orders', 'Number of delivered orders', 'Whether any order is delivered', 'Revenue of delivered orders'], answer: 1, why: 'Each delivered row adds 1, every other row adds 0, so the sum is the delivered count.' },
    { q: 'In SQL Server, AVG(IntColumn) over 1 and 2 returns:', options: ['1.5', '1', '2', 'Error'], answer: 1, why: 'Integer arithmetic truncates. Use AVG(IntColumn * 1.0).' },
    { q: 'Which function joins many rows into one comma-separated string?', options: ['CONCAT', 'STRING_AGG', 'GROUP_CONCAT (SQL Server)', 'SUM'], answer: 1, why: 'STRING_AGG exists in SQL Server 2017+ and PostgreSQL. GROUP_CONCAT is MySQL.' },
    { q: 'SUM(Amount) over zero matching rows returns:', options: ['0', 'NULL', 'An error', 'Empty string'], answer: 1, why: 'An aggregate over an empty set returns NULL (except COUNT, which returns 0). Wrap in COALESCE(..., 0).' }
  ],
  takeaways: [
    'COUNT(*) counts rows; COUNT(col) counts non-NULL values; COUNT(DISTINCT col) counts different values.',
    'Every aggregate except COUNT(*) ignores NULL. AVG divides by the non-NULL count.',
    'SUM / AVG over an empty set is NULL; use COALESCE when printing.',
    'CASE inside SUM or COUNT gives several conditional totals in one pass (manual pivot).',
    'STRING_AGG turns a group into one string; order it with WITHIN GROUP (SQL Server) or ORDER BY inside (PostgreSQL).',
    'Use DECIMAL for money, pre-aggregate before joining, and reach for window functions for running totals.'
  ],
  interview: [
    { q: 'What is the difference between COUNT(*), COUNT(1) and COUNT(column)?', a: `<p>COUNT(*) and COUNT(1) both count rows and are treated identically by the optimizer. COUNT(column) counts rows where the column is not NULL, so it can be smaller.</p>` },
    { q: 'How do you compute several conditional totals in one query?', a: `<p>Put a CASE inside the aggregate: <code>SUM(CASE WHEN cond THEN value ELSE 0 END)</code> or <code>COUNT(CASE WHEN cond THEN 1 END)</code>. One scan produces all columns, which is faster and more consistent than separate queries.</p>` },
    { q: 'Why can AVG give a surprising result?', a: `<p>Two reasons: NULL rows are excluded from both the sum and the count, and in SQL Server integer columns use integer division. Cast to decimal and decide explicitly how NULL should be treated.</p>` },
    { q: 'How would you count distinct users on a table with billions of rows?', a: `<p>Exact COUNT(DISTINCT) needs a hash or sort of every value, which is memory heavy. For analytics use an approximate function like APPROX_COUNT_DISTINCT (HyperLogLog), or maintain a pre-aggregated table updated incrementally.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m3-sql-subqueries — Subqueries                                      */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-subqueries'] = {
  hook: `"Customers who spent more than the average customer" needs an answer inside an answer. SQL lets you nest one query inside another, and the nesting is where real questions start.`,
  intro: `<p>A <span class="term">subquery</span> is a SELECT written inside another SQL statement. The inner query produces a value, a list, or a whole table, and the outer query uses it. You can put a subquery in SELECT (as a column), in WHERE (as a comparison or a list), or in FROM (as a temporary table, called a <span class="term">derived table</span>).</p>
<p>There are two families. A <span class="term">non-correlated</span> subquery runs once and does not depend on the outer row, like "the average price". A <span class="term">correlated</span> subquery refers to the outer row and is evaluated per row, like "this customer's latest order". Correlated subqueries are the natural way to write EXISTS checks and "top N per group" questions.</p>
<p>This lesson also covers <span class="term">APPLY</span> (SQL Server) and <span class="term">LATERAL</span> (PostgreSQL), which let a subquery in FROM depend on each row of the left side, and it compares IN, EXISTS and JOIN so you can choose the right one.</p>`,
  realLife: {
    title: 'Asking the accountant a two-step question',
    body: `<p>You ask: "Which products cost more than our average product?" The accountant first works out the average (one number), then checks each product against it. The first step is the subquery; the second is the outer query. That is a scalar subquery: it returns one value.</p>
<p>Now you ask: "For each customer, what was their most recent order?" The accountant goes through customers one by one, and for each one looks up that person's orders. The lookup depends on who she is looking at. That is a correlated subquery, and when it returns a whole row (date, status, total), it becomes an APPLY.</p>
<p><strong>Where companies use this:</strong> "latest reading per sensor" in IoT dashboards, "last login per user" in admin panels, "products never sold" in inventory clean-ups, "orders above the customer's own average" in fraud checks. EF Core generates subqueries whenever you use <code>Any()</code>, <code>Max()</code> inside a projection, or <code>Take(1)</code> on a navigation collection.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Three places a subquery can live</h4>
<ul>
<li><strong>In WHERE, as one value:</strong> <code>WHERE Price &gt; (SELECT AVG(Price) FROM Products)</code>. The inner query must return exactly one row and one column. This is a <span class="term">scalar subquery</span>.</li>
<li><strong>In WHERE, as a list:</strong> <code>WHERE CustomerId IN (SELECT CustomerId FROM Orders)</code>. The inner query returns one column, any number of rows.</li>
<li><strong>In FROM, as a table:</strong> <code>FROM (SELECT OrderId, SUM(...) AS Total FROM OrderItems GROUP BY OrderId) t</code>. You must give it an alias (t). This is a <span class="term">derived table</span>.</li>
</ul>
<p>A fourth place is in SELECT, as a computed column: <code>SELECT Name, (SELECT COUNT(*) FROM Orders o WHERE o.CustomerId = c.CustomerId) AS OrderCount FROM Customers c</code>. Note that this one looks at the outer row (c.CustomerId): it is correlated.</p>
<h4>Correlated means "per outer row"</h4>
<p>If the inner query mentions a column from the outer query, it is correlated. Think of it as a loop: for each outer row, run the inner query with that row's values. The engine often finds a smarter plan than a literal loop, but that is the meaning.</p>
<h4>EXISTS: is there at least one?</h4>
<p><code>WHERE EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerId = c.CustomerId)</code> is true when the inner query returns any row. The engine stops at the first match. What you select inside does not matter (SELECT 1 is the convention). <code>NOT EXISTS</code> is the safe way to ask "has none".</p>
<h4>Row subquery</h4>
<p>Compare several columns at once. PostgreSQL allows <code>WHERE (City, Status) IN (SELECT City, Status FROM ...)</code>. SQL Server does not support row constructors in IN; use EXISTS with both conditions instead.</p>
<div class="callout tip">Read a nested query from the inside out. Run the inner SELECT on its own first, look at what it returns (one value? a list? a table?), and only then read the outer query.</div>` },
    { name: 'Intermediate', body: `<h4>IN vs EXISTS vs JOIN</h4>
<table><thead><tr><th>Form</th><th>Returns</th><th>NULL-safe?</th><th>Use when</th></tr></thead>
<tbody>
<tr><td>JOIN</td><td>Outer rows × matches (can duplicate)</td><td>n/a</td><td>You need columns from both sides</td></tr>
<tr><td>IN (subquery)</td><td>Outer rows with a match, no duplicates</td><td>IN yes; NOT IN no</td><td>Simple membership on one column</td></tr>
<tr><td>EXISTS</td><td>Outer rows with a match, no duplicates</td><td>Yes, both ways</td><td>Multi-column match, or "has none" (NOT EXISTS)</td></tr>
</tbody></table>
<p>Modern optimizers turn IN and EXISTS into the same semi-join plan, so performance is usually equal. The difference that matters is NULL behaviour: NOT IN with a NULL in the list returns nothing; NOT EXISTS behaves.</p>
<h4>Scalar subquery in SELECT: handy but watch the cost</h4>
<p><code>(SELECT COUNT(*) FROM Orders o WHERE o.CustomerId = c.CustomerId)</code> per customer row is clear and fine for a few thousand rows. On millions it can become a nested loop that runs millions of times. The alternative is to aggregate once in a derived table or CTE and LEFT JOIN it. If the scalar subquery ever returns more than one row, SQL Server throws "Subquery returned more than 1 value"; PostgreSQL throws "more than one row returned". Guard it with TOP 1 / LIMIT 1 or an aggregate.</p>
<h4>Derived tables as building blocks</h4>
<p>Need to filter on an aggregate alias? Compute it in a derived table, then filter outside: <code>SELECT * FROM (SELECT OrderId, SUM(...) AS Total ... GROUP BY OrderId) t WHERE t.Total &gt; 10000</code>. The next lesson (CTEs) shows the same thing with a name on top, which reads better.</p>
<h4>APPLY (SQL Server) and LATERAL (PostgreSQL)</h4>
<p>A JOIN cannot reference the left row inside the right side. APPLY can. "Each customer with their latest order" is: <code>FROM Customers c OUTER APPLY (SELECT TOP 1 * FROM Orders o WHERE o.CustomerId = c.CustomerId ORDER BY o.OrderDate DESC) last</code>. <code>CROSS APPLY</code> drops customers with no order (like INNER); <code>OUTER APPLY</code> keeps them (like LEFT). PostgreSQL writes it as <code>LEFT JOIN LATERAL (...) last ON true</code>. This is the cleanest way to write "top N per group" before you learn window functions.</p>
<h4>ANY / ALL</h4>
<p><code>WHERE Price &gt; ALL (SELECT Price FROM Products WHERE Category = 'Furniture')</code> means "more expensive than every piece of furniture". <code>&gt; ANY</code> means "more than at least one". They read well but are rare in practice; MAX/MIN subqueries are the usual rewrite.</p>
<div class="callout warn">A correlated subquery in WHERE with an inequality (<code>o.OrderDate &gt; c.JoinedOn</code>) and no index on the inner column is the classic cause of a query that takes minutes on a table that takes seconds to scan. Check the plan for a nested loop with a scan inside.</div>` },
    { name: 'Expert', body: `<h4>Decorrelation</h4>
<p>The optimizer rewrites many correlated subqueries into joins or semi-joins ("decorrelation" or "unnesting"). <code>EXISTS</code> and <code>IN</code> almost always become a semi-join (Left Semi Join in SQL Server plans, Semi Join in PostgreSQL). Scalar subqueries with aggregates are often rewritten to a GROUP BY + join. When the rewrite is not possible (TOP 1 with ORDER BY inside, or complex predicates), you get a true nested loop, and you should see it as a nested loops operator with the subquery as the inner input.</p>
<h4>APPLY beyond top-N</h4>
<p>CROSS APPLY also feeds a table-valued function with each row's values (<code>CROSS APPLY STRING_SPLIT(c.Tags, ',')</code>) and unpivots columns into rows with <code>CROSS APPLY (VALUES ('a', ColA), ('b', ColB)) v(Name, Val)</code>. These are idioms worth knowing in SQL Server codebases.</p>
<h4>Subquery in UPDATE and DELETE</h4>
<p><code>DELETE FROM Orders WHERE NOT EXISTS (SELECT 1 FROM OrderItems oi WHERE oi.OrderId = Orders.OrderId)</code> removes empty orders. <code>UPDATE p SET Price = Price * 1.1 FROM Products p WHERE p.ProductId IN (SELECT ProductId FROM OrderItems GROUP BY ProductId HAVING SUM(Quantity) &gt; 5)</code> raises prices on popular items. PostgreSQL uses <code>UPDATE ... FROM</code> and <code>DELETE ... USING</code> for the join forms.</p>
<h4>Derived table vs CTE vs temp table vs view</h4>
<p>All four give a name to a query. Derived tables and CTEs are inlined by the optimizer: no materialisation, so the same subquery referenced twice may run twice. Temp tables (#t in SQL Server, TEMP TABLE in PostgreSQL) are materialised with statistics, which helps when the intermediate result is large and reused. Views are saved query definitions (also inlined). Choose by reuse and size, not by taste. The CTE lesson goes deeper.</p>
<h4>Scalar subquery and NULL</h4>
<p>A scalar subquery that returns no rows yields NULL, not an error. <code>WHERE Price &gt; (SELECT MAX(Price) FROM Products WHERE Category = 'Toys')</code> with no toys compares against NULL and returns no rows. Decide whether that is what you want.</p>
<h4>Interview angle</h4>
<ul>
<li>"Correlated vs non-correlated subquery?" Depends on the outer row vs runs once.</li>
<li>"When is EXISTS better than IN?" Multi-column matching and NOT forms (NULL safety). Performance is usually the same.</li>
<li>"Latest order per customer without window functions?" OUTER APPLY / LATERAL with TOP 1 ORDER BY.</li>
<li>"What does the engine do with a correlated subquery?" Decorrelates to a semi-join or runs a nested loop.</li>
</ul>
<div class="callout idea">Write "each customer's latest order" three ways: correlated scalar subqueries in SELECT, OUTER APPLY, and (after the window lesson) ROW_NUMBER(). Compare the plans.</div>` }
  ],
  flow: {
    title: 'How a correlated EXISTS is evaluated',
    steps: [
      { title: 'Outer row', desc: 'Take the first row of Customers, say Asha (CustomerId 1).' },
      { title: 'Plug in', desc: 'Substitute the outer value into the inner query: SELECT 1 FROM Orders WHERE CustomerId = 1.' },
      { title: 'Probe', desc: 'Look for any matching Orders row, ideally via an index seek on CustomerId. Stop at the first hit.' },
      { title: 'Decide', desc: 'Found one? EXISTS is TRUE and the outer row is kept. For NOT EXISTS, the opposite.' },
      { title: 'Next row', desc: 'Repeat for Ravi, Meera, John, Sara. Sara has no orders: EXISTS false, NOT EXISTS true.' },
      { title: 'Optimizer shortcut', desc: 'In reality the engine usually rewrites this into one semi-join between the two tables instead of a literal loop.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'Scalar, list and derived-table subqueries', code: `-- Scalar subquery: products above the average price
SELECT Name, Price
FROM Products
WHERE Price > (SELECT AVG(Price) FROM Products);

-- List subquery with IN: customers who have at least one order
SELECT Name
FROM Customers
WHERE CustomerId IN (SELECT CustomerId FROM Orders);

-- Derived table: filter on an aggregate alias
SELECT t.OrderId, t.Total
FROM (
    SELECT OrderId, SUM(Quantity * UnitPrice) AS Total
    FROM OrderItems
    GROUP BY OrderId
) AS t
WHERE t.Total > 10000
ORDER BY t.Total DESC;

-- Scalar subquery as a column (correlated: uses c.CustomerId)
SELECT c.Name,
       (SELECT COUNT(*) FROM Orders o WHERE o.CustomerId = c.CustomerId) AS OrderCount,
       (SELECT MAX(o.OrderDate) FROM Orders o WHERE o.CustomerId = c.CustomerId) AS LastOrder
FROM Customers c;

-- Same result, usually cheaper on big tables: aggregate once, then LEFT JOIN
SELECT c.Name, COALESCE(a.OrderCount, 0) AS OrderCount, a.LastOrder
FROM Customers c
LEFT JOIN (
    SELECT CustomerId, COUNT(*) AS OrderCount, MAX(OrderDate) AS LastOrder
    FROM Orders
    GROUP BY CustomerId
) a ON a.CustomerId = c.CustomerId;

-- ALL / ANY
SELECT Name, Price FROM Products
WHERE Price > ALL (SELECT Price FROM Products WHERE Category = 'Furniture');` },
    { lang: 'sql', title: 'EXISTS vs IN vs JOIN, and the NOT IN trap', code: `-- EXISTS (semi-join): customers with a delivered order, no duplicates
SELECT c.Name
FROM Customers c
WHERE EXISTS (SELECT 1 FROM Orders o
              WHERE o.CustomerId = c.CustomerId AND o.Status = 'Delivered');

-- Same with IN
SELECT c.Name
FROM Customers c
WHERE c.CustomerId IN (SELECT o.CustomerId FROM Orders o WHERE o.Status = 'Delivered');

-- JOIN gives one row PER ORDER (duplicates Asha if she has two delivered orders)
SELECT c.Name
FROM Customers c
JOIN Orders o ON o.CustomerId = c.CustomerId AND o.Status = 'Delivered';

-- Products never sold: NOT EXISTS is NULL-safe
SELECT p.Name
FROM Products p
WHERE NOT EXISTS (SELECT 1 FROM OrderItems oi WHERE oi.ProductId = p.ProductId);

-- The trap: if ManagerId has a NULL (the CEO), this returns NOTHING
SELECT Name FROM Employees
WHERE EmployeeId NOT IN (SELECT ManagerId FROM Employees);
-- Fixed: employees who manage nobody
SELECT e.Name FROM Employees e
WHERE NOT EXISTS (SELECT 1 FROM Employees x WHERE x.ManagerId = e.EmployeeId);

-- Customers whose spend is above the average customer's spend (nested derived tables)
SELECT s.CustomerId, s.Spent
FROM (
    SELECT o.CustomerId, SUM(oi.Quantity * oi.UnitPrice) AS Spent
    FROM Orders o JOIN OrderItems oi ON oi.OrderId = o.OrderId
    GROUP BY o.CustomerId
) s
WHERE s.Spent > (
    SELECT AVG(x.Spent) FROM (
        SELECT o.CustomerId, SUM(oi.Quantity * oi.UnitPrice) AS Spent
        FROM Orders o JOIN OrderItems oi ON oi.OrderId = o.OrderId
        GROUP BY o.CustomerId
    ) x
);` },
    { lang: 'sql', title: 'APPLY / LATERAL: latest order per customer, and subqueries in UPDATE/DELETE', code: `-- SQL Server: each customer with their most recent order (keeps customers with none)
SELECT c.Name, last.OrderId, last.OrderDate, last.Status
FROM Customers c
OUTER APPLY (
    SELECT TOP 1 o.OrderId, o.OrderDate, o.Status
    FROM Orders o
    WHERE o.CustomerId = c.CustomerId
    ORDER BY o.OrderDate DESC
) AS last
ORDER BY c.Name;

-- PostgreSQL equivalent:
-- SELECT c.Name, last.OrderId, last.OrderDate, last.Status
-- FROM Customers c
-- LEFT JOIN LATERAL (
--     SELECT o.OrderId, o.OrderDate, o.Status
--     FROM Orders o WHERE o.CustomerId = c.CustomerId
--     ORDER BY o.OrderDate DESC LIMIT 1
-- ) last ON true;

-- Top 2 most expensive items per order (CROSS APPLY drops orders with no items)
SELECT o.OrderId, top2.ProductId, top2.UnitPrice
FROM Orders o
CROSS APPLY (
    SELECT TOP 2 oi.ProductId, oi.UnitPrice
    FROM OrderItems oi
    WHERE oi.OrderId = o.OrderId
    ORDER BY oi.UnitPrice DESC
) top2;

-- UPDATE with a subquery: 10% price rise on products sold more than 1 unit in total
UPDATE p
SET    p.Price = p.Price * 1.10
FROM   Products p
WHERE  p.ProductId IN (
    SELECT ProductId FROM OrderItems GROUP BY ProductId HAVING SUM(Quantity) > 1
);

-- DELETE with NOT EXISTS: orders that have no items
DELETE FROM Orders
WHERE NOT EXISTS (SELECT 1 FROM OrderItems oi WHERE oi.OrderId = Orders.OrderId);` }
  ],
  pitfalls: [
    'A scalar subquery that can return more than one row. It works in testing and throws in production when data grows. Use an aggregate or TOP 1 / LIMIT 1.',
    'NOT IN against a column that allows NULL. One NULL and the result is empty. Use NOT EXISTS.',
    'Using a JOIN when you only want to check existence. You get duplicate outer rows and then "fix" them with DISTINCT.',
    'Correlated scalar subqueries in SELECT on a huge outer table. Aggregate once in a derived table and join instead.',
    'Forgetting the alias on a derived table. SQL Server requires it, and so did PostgreSQL before version 16.',
    'Writing the same big subquery twice (once for the filter, once for the average). Name it once with a CTE (next lesson).'
  ],
  quiz: [
    { q: 'A subquery that references a column from the outer query is called:', options: ['Scalar', 'Derived', 'Correlated', 'Recursive'], answer: 2, why: 'Correlated subqueries depend on the current outer row and are conceptually evaluated per row.' },
    { q: 'WHERE Price > (SELECT AVG(Price) FROM Products) — what must the subquery return?', options: ['Exactly one value', 'One column, many rows', 'A table', 'Nothing'], answer: 0, why: 'A comparison with > needs a single value, so this is a scalar subquery.' },
    { q: 'Which is NULL-safe for "rows in A with no match in B"?', options: ['NOT IN (SELECT key FROM B)', 'NOT EXISTS (SELECT 1 FROM B WHERE B.key = A.key)', 'INNER JOIN B ON B.key = A.key WHERE B.key IS NULL', 'A.key <> ALL (SELECT key FROM B)'], answer: 1, why: 'NOT EXISTS checks for the presence of rows and is unaffected by NULL values in B.key.' },
    { q: 'OUTER APPLY in SQL Server is most like:', options: ['INNER JOIN with a subquery that can see the left row', 'LEFT JOIN with a subquery that can see the left row', 'CROSS JOIN', 'UNION'], answer: 1, why: 'OUTER APPLY keeps left rows with no result (like LEFT JOIN) and lets the right side reference the left row. PostgreSQL calls it LEFT JOIN LATERAL.' },
    { q: 'A scalar subquery that returns zero rows evaluates to:', options: ['0', 'NULL', 'An error', 'Empty string'], answer: 1, why: 'No row means no value, so the result is NULL, and comparisons with it are UNKNOWN.' },
    { q: 'In SQL Server, why must a derived table have an alias?', options: ['The optimizer uses it to cache the result', 'The outer query needs a name to refer to it', 'Aliases are required on every table in FROM', 'It does not need one'], answer: 1, why: 'The derived table is a nameless result; the alias gives the outer query something to refer to. SQL Server always requires it; PostgreSQL also required it before version 16.' }
  ],
  takeaways: [
    'Subqueries live in WHERE (value or list), FROM (derived table) or SELECT (computed column).',
    'Scalar = one value; list = one column; derived table = many columns and needs an alias.',
    'Correlated subqueries reference the outer row; EXISTS is the common correlated form.',
    'NOT EXISTS is NULL-safe; NOT IN is not. JOIN duplicates; IN and EXISTS do not.',
    'APPLY (SQL Server) / LATERAL (PostgreSQL) run a subquery per left row: the tool for "latest per group".',
    'The optimizer decorrelates most subqueries into semi-joins; check the plan when it cannot.'
  ],
  interview: [
    { q: 'What is a correlated subquery and when would you use one?', a: `<p>A subquery that references columns of the outer query, so it is logically evaluated once per outer row. Use it for existence checks (EXISTS), per-row lookups ("this customer's latest order") and conditions that compare a row to its own group. The optimizer often rewrites it into a join.</p>` },
    { q: 'IN vs EXISTS: which is faster?', a: `<p>On modern engines they usually produce the same semi-join plan, so the choice is about correctness and clarity. EXISTS handles multi-column matches and is NULL-safe in its NOT form; NOT IN silently returns nothing if the subquery yields a NULL.</p>` },
    { q: 'How do you get the latest order for every customer?', a: `<p>OUTER APPLY (SQL Server) or LEFT JOIN LATERAL (PostgreSQL) with a TOP 1 / LIMIT 1 ORDER BY OrderDate DESC subquery; or ROW_NUMBER() OVER (PARTITION BY CustomerId ORDER BY OrderDate DESC) and filter rn = 1 (window functions lesson).</p>` },
    { q: 'What happens if a scalar subquery returns two rows?', a: `<p>SQL Server raises "Subquery returned more than 1 value"; PostgreSQL raises "more than one row returned by a subquery used as an expression". Guard with an aggregate, TOP 1 / LIMIT 1, or a unique predicate.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* m3-sql-ctes — CTEs (Common Table Expressions)                       */
/* ------------------------------------------------------------------ */
window.CONTENT['m3-sql-ctes'] = {
  hook: `A 60-line query with subqueries nested three deep is a puzzle. The same query as three named steps is a story. CTEs are how you write SQL that your future self can read.`,
  intro: `<p>A <span class="term">Common Table Expression</span> (CTE) is a temporary, named result set that exists only for the one statement that follows it. You write it with <code>WITH name AS (SELECT ...)</code> at the top, and then use <code>name</code> like a table in the main query.</p>
<p>A CTE does the same job as a derived table in FROM, but with two advantages: it has a name you choose, and it is defined before it is used, so the query reads top to bottom like a recipe. You can chain several CTEs, each building on the previous one, and you can reference one CTE more than once.</p>
<p>CTEs also unlock <span class="term">recursion</span> (a CTE that refers to itself, used for hierarchies like managers and org charts), which has its own lesson next. This lesson covers the non-recursive form, when to prefer a CTE over a subquery, temp table or view, and the mistakes people make when they assume a CTE is "stored" somewhere.</p>`,
  realLife: {
    title: 'Cooking with prep bowls',
    body: `<p>A chef does not chop onions, fry them, and make the sauce all in one bowl at once. She preps: bowl one has chopped onions, bowl two the spice mix, bowl three the stock. Then the final step combines the bowls. Each bowl has a label. That is a chain of CTEs: <code>WITH OrderTotals AS (...), CustomerSpend AS (...) SELECT ... FROM CustomerSpend</code>. Anyone reading the recipe knows what each bowl holds from its label.</p>
<p>And just like prep bowls, CTEs are thrown away when the dish is served. They are not saved in the kitchen for tomorrow. If you need that, you want a view (a saved recipe) or a temp table (a bowl that lasts for the whole shift).</p>
<p><strong>Where companies use this:</strong> every non-trivial report query in a bank's data warehouse, every "cohort analysis" at a SaaS company, every EF Core raw SQL query that got too complex for LINQ. Code reviewers at most companies now ask for CTEs instead of nested subqueries.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The shape</h4>
<p>Three parts: WITH, the name and its query in parentheses, then the main statement.</p>
<p><code>WITH OrderTotals AS (SELECT OrderId, SUM(Quantity * UnitPrice) AS Total FROM OrderItems GROUP BY OrderId) SELECT * FROM OrderTotals WHERE Total &gt; 10000;</code></p>
<p>That is the derived table from the Subqueries lesson, turned inside out: the name comes first, the use comes after. Same result, same plan, easier to read.</p>
<h4>Several CTEs in a chain</h4>
<p>Separate them with commas; write WITH only once. Each CTE can use the ones above it:</p>
<ul>
<li><strong>OrderTotals</strong>: one row per order with its total.</li>
<li><strong>CustomerSpend</strong>: joins OrderTotals to Orders and groups by customer.</li>
<li><strong>Main SELECT</strong>: joins CustomerSpend to Customers for the name and sorts.</li>
</ul>
<p>Each step does one thing. If the final number is wrong, you run each CTE alone and find the step where it breaks.</p>
<h4>Rules to remember</h4>
<ul>
<li>A CTE belongs to one statement. The next statement cannot see it.</li>
<li>In SQL Server, the statement before WITH must end with a semicolon (people write <code>;WITH</code> out of habit for that reason).</li>
<li>Column names come from the SELECT inside, or you can list them: <code>WITH t (OrderId, Total) AS (...)</code>.</li>
<li>No ORDER BY inside a CTE unless combined with TOP (SQL Server) — ordering belongs to the final SELECT.</li>
</ul>
<h4>CTE vs subquery: which to use?</h4>
<p>If the subquery is short and used once, inline is fine. If it is more than a few lines, is used twice, or you want to name it so the query explains itself, use a CTE. Readability is the main reason; performance is normally identical.</p>
<div class="callout tip">Name CTEs after what they contain, as a noun: OrderTotals, ActiveCustomers, LastLoginPerUser. Avoid names like cte1, temp, x.</div>` },
    { name: 'Intermediate', body: `<h4>Reusing a CTE twice</h4>
<p>"Customers who spent more than the average customer" needs the per-customer spend twice: once as the rows to filter and once to compute the average. With a CTE you define CustomerSpend once and reference it in both places. With subqueries you would copy-paste the whole block, and the two copies would drift apart over time.</p>
<h4>CTEs with INSERT, UPDATE and DELETE</h4>
<p>A CTE can sit in front of a data-changing statement. Two uses:</p>
<ul>
<li>As a source: <code>WITH Totals AS (...) INSERT INTO OrderSummary (OrderId, Total) SELECT OrderId, Total FROM Totals;</code></li>
<li>As the target (SQL Server): if the CTE selects directly from one table without aggregation, you can <code>UPDATE cte SET ...</code> or <code>DELETE FROM cte</code>. The classic use is removing duplicates with ROW_NUMBER() inside the CTE and deleting where the row number is greater than 1. PostgreSQL does not allow updating through a CTE, but it allows data-modifying statements inside a CTE with RETURNING, which SQL Server does not.</li>
</ul>
<h4>Filtering on aggregates and window functions</h4>
<p>You cannot write <code>WHERE ROW_NUMBER() OVER (...) = 1</code> directly, because window functions are computed after WHERE. The pattern is: compute the window function in a CTE, filter in the outer query. The same trick works for any alias you want to filter on.</p>
<h4>CTE vs temp table vs view: the practical rules</h4>
<table><thead><tr><th></th><th>CTE</th><th>Temp table (#t / TEMP)</th><th>View</th></tr></thead>
<tbody>
<tr><td>Lifetime</td><td>One statement</td><td>Session / batch</td><td>Permanent definition</td></tr>
<tr><td>Materialised?</td><td>No (inlined)</td><td>Yes, with statistics</td><td>No (inlined), unless indexed view</td></tr>
<tr><td>Reuse across statements</td><td>No</td><td>Yes</td><td>Yes, across all queries</td></tr>
<tr><td>Best for</td><td>Readability, single statement</td><td>Large intermediate results used several times, or to break up a bad plan</td><td>Sharing a definition, security (hide columns)</td></tr>
</tbody></table>
<h4>Multiple references and double execution</h4>
<p>Because a CTE is inlined, referencing it twice may run its query twice. For a cheap CTE nobody cares. For a CTE that scans a billion-row table, that is twice the cost; put the result in a temp table instead. PostgreSQL 12+ decides automatically (it materialises a CTE referenced more than once, or when you write <code>AS MATERIALIZED</code>); SQL Server always inlines.</p>
<div class="callout warn">A CTE is not an optimisation fence in SQL Server. The optimizer can push your WHERE down into the CTE, reorder joins, and ignore your step boundaries. That is normally good. But it means "I wrote it as steps" does not guarantee it runs as steps.</div>` },
    { name: 'Expert', body: `<h4>Inlining vs materialisation, precisely</h4>
<p>SQL Server treats a non-recursive CTE exactly like a derived table: the parser substitutes the definition at each reference, and the optimizer sees one big tree. Hence duplicated work for multiple references and no statistics on the intermediate result. PostgreSQL before version 12 always materialised CTEs (an "optimisation fence"); since 12, single-reference, side-effect-free CTEs are inlined, and you can force either with <code>MATERIALIZED</code> / <code>NOT MATERIALIZED</code>. Know which engine you are on before reasoning about a plan.</p>
<h4>When a temp table beats a CTE</h4>
<ul>
<li>The intermediate result is large and reused in several statements.</li>
<li>The optimizer mis-estimates row counts through a complex CTE; a temp table gets real statistics and resets the estimate.</li>
<li>You want to index the intermediate result.</li>
</ul>
<p>Table variables (@t) in SQL Server have no statistics by default (improved in 2019+ with deferred compilation) and are best for tiny sets.</p>
<h4>CTEs and parameter sniffing</h4>
<p>A stored procedure with a big CTE chain compiles one plan for the first parameter values it sees. If those were unusual, every later call suffers. This is parameter sniffing, not a CTE problem, but CTE-heavy procedures expose it more because the plan is large and sensitive. Fixes: OPTION (RECOMPILE), OPTIMIZE FOR, or splitting with temp tables.</p>
<h4>Data-modifying CTEs (PostgreSQL)</h4>
<p><code>WITH moved AS (DELETE FROM Orders WHERE Status = 'Cancelled' RETURNING *) INSERT INTO ArchivedOrders SELECT * FROM moved;</code> moves rows in one atomic statement. SQL Server achieves the same with the OUTPUT clause: <code>DELETE FROM Orders OUTPUT deleted.* INTO ArchivedOrders WHERE ...</code>.</p>
<h4>Style conventions worth enforcing in code review</h4>
<ul>
<li>One concept per CTE; name it as a noun.</li>
<li>No more than about five CTEs in a chain; beyond that, consider a view or temp tables.</li>
<li>Put ORDER BY only on the final SELECT.</li>
<li>Column lists on CTEs that will be reused by other developers.</li>
</ul>
<h4>Interview angle</h4>
<ul>
<li>"Is a CTE faster than a subquery?" Usually identical; it is inlined. Readability is the win.</li>
<li>"CTE vs temp table?" Materialisation, statistics, reuse across statements.</li>
<li>"How do you delete duplicates keeping one?" ROW_NUMBER() in a CTE, DELETE WHERE rn &gt; 1.</li>
<li>"Can you reference a CTE twice?" Yes; it may execute twice in SQL Server.</li>
</ul>
<div class="callout idea">Take the longest query in your current project and rewrite it as a CTE chain. Count how many bugs or dead branches you find just by naming the steps.</div>` }
  ],
  flow: {
    title: 'How a CTE chain is written and then executed',
    steps: [
      { title: 'Name step 1', desc: 'WITH OrderTotals AS (one row per order with its total).' },
      { title: 'Name step 2', desc: ', CustomerSpend AS (join OrderTotals to Orders, group by customer).' },
      { title: 'Main query', desc: 'SELECT from CustomerSpend, join Customers for names, filter and sort.' },
      { title: 'Parse', desc: 'The engine reads the CTE definitions and the main statement as one unit.' },
      { title: 'Inline', desc: 'Each CTE reference is replaced by its definition; the optimizer sees one big query tree (PostgreSQL may materialise instead).' },
      { title: 'Optimise', desc: 'Predicates are pushed down, joins reordered, aggregates placed where cheapest, regardless of your step boundaries.' },
      { title: 'Execute and discard', desc: 'The plan runs; the CTEs vanish when the statement ends. The next statement cannot see them.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'From nested subqueries to a readable CTE chain', code: `-- BEFORE: nested, repeated, hard to debug
SELECT c.Name, s.Spent
FROM Customers c
JOIN (
    SELECT o.CustomerId, SUM(oi.Quantity * oi.UnitPrice) AS Spent
    FROM Orders o JOIN OrderItems oi ON oi.OrderId = o.OrderId
    WHERE o.Status <> 'Cancelled'
    GROUP BY o.CustomerId
) s ON s.CustomerId = c.CustomerId
WHERE s.Spent > (
    SELECT AVG(x.Spent) FROM (
        SELECT o.CustomerId, SUM(oi.Quantity * oi.UnitPrice) AS Spent
        FROM Orders o JOIN OrderItems oi ON oi.OrderId = o.OrderId
        WHERE o.Status <> 'Cancelled'
        GROUP BY o.CustomerId
    ) x
);

-- AFTER: each step named once, reused twice
WITH OrderTotals AS (
    SELECT oi.OrderId, SUM(oi.Quantity * oi.UnitPrice) AS Total
    FROM OrderItems oi
    GROUP BY oi.OrderId
),
CustomerSpend AS (
    SELECT o.CustomerId, SUM(t.Total) AS Spent
    FROM Orders o
    JOIN OrderTotals t ON t.OrderId = o.OrderId
    WHERE o.Status <> 'Cancelled'
    GROUP BY o.CustomerId
),
AvgSpend AS (
    SELECT AVG(Spent) AS AvgSpent FROM CustomerSpend
)
SELECT c.Name, s.Spent, a.AvgSpent
FROM CustomerSpend s
JOIN Customers c ON c.CustomerId = s.CustomerId
CROSS JOIN AvgSpend a
WHERE s.Spent > a.AvgSpent
ORDER BY s.Spent DESC;

-- Debug tip: run any CTE alone by replacing the final SELECT:
-- WITH OrderTotals AS (...) SELECT * FROM OrderTotals;` },
    { lang: 'sql', title: 'CTE patterns: filter on a window function, delete duplicates, insert from a CTE', code: `-- Pattern 1: compute ROW_NUMBER in the CTE, filter outside (latest order per customer)
WITH Ranked AS (
    SELECT o.*,
           ROW_NUMBER() OVER (PARTITION BY o.CustomerId ORDER BY o.OrderDate DESC) AS rn
    FROM Orders o
)
SELECT OrderId, CustomerId, OrderDate, Status
FROM Ranked
WHERE rn = 1;

-- Pattern 2 (SQL Server): delete duplicate customers by Email, keep the oldest
WITH Dupes AS (
    SELECT CustomerId, Email,
           ROW_NUMBER() OVER (PARTITION BY Email ORDER BY CustomerId) AS rn
    FROM Customers
    WHERE Email IS NOT NULL
)
DELETE FROM Dupes WHERE rn > 1;
-- PostgreSQL: DELETE FROM Customers WHERE CustomerId IN (SELECT CustomerId FROM Dupes WHERE rn > 1);

-- Pattern 3: CTE as the source of an INSERT (needs a MonthlySales summary table; it is not in the sample schema)
WITH Monthly AS (
    SELECT YEAR(o.OrderDate) AS Yr, MONTH(o.OrderDate) AS Mon,
           COUNT(DISTINCT o.OrderId) AS Orders,
           SUM(oi.Quantity * oi.UnitPrice) AS Revenue
    FROM Orders o JOIN OrderItems oi ON oi.OrderId = o.OrderId
    WHERE o.Status <> 'Cancelled'
    GROUP BY YEAR(o.OrderDate), MONTH(o.OrderDate)
)
INSERT INTO MonthlySales (Yr, Mon, Orders, Revenue)
SELECT Yr, Mon, Orders, Revenue FROM Monthly;

-- Pattern 4 (PostgreSQL only): data-modifying CTE that archives in one statement
-- WITH moved AS (
--     DELETE FROM Orders WHERE Status = 'Cancelled' RETURNING *
-- )
-- INSERT INTO ArchivedOrders SELECT * FROM moved;
-- SQL Server equivalent:
-- DELETE FROM Orders OUTPUT deleted.* INTO ArchivedOrders WHERE Status = 'Cancelled';

-- Pattern 5: explicit column list and a CTE referenced twice (self-compare)
WITH Spend (CustomerId, Spent) AS (
    SELECT o.CustomerId, SUM(oi.Quantity * oi.UnitPrice)
    FROM Orders o JOIN OrderItems oi ON oi.OrderId = o.OrderId
    GROUP BY o.CustomerId
)
SELECT a.CustomerId, a.Spent, b.CustomerId AS BiggerSpender, b.Spent AS TheirSpend
FROM Spend a
JOIN Spend b ON b.Spent > a.Spent;` },
    { lang: 'csharp', title: 'Using a CTE from C#: raw SQL with EF Core / Dapper', code: `// EF Core: map a raw CTE query onto a keyless result type
public class CustomerSpendRow
{
    public int CustomerId { get; set; }
    public string Name { get; set; } = "";
    public decimal Spent { get; set; }
}
// In DbContext.OnModelCreating: modelBuilder.Entity<CustomerSpendRow>().HasNoKey();

public async Task<List<CustomerSpendRow>> AboveAverageSpendersAsync(ShopContext db, string excludedStatus)
{
    const string sql = @"
        WITH OrderTotals AS (
            SELECT OrderId, SUM(Quantity * UnitPrice) AS Total
            FROM OrderItems GROUP BY OrderId
        ),
        CustomerSpend AS (
            SELECT o.CustomerId, SUM(t.Total) AS Spent
            FROM Orders o JOIN OrderTotals t ON t.OrderId = o.OrderId
            WHERE o.Status <> {0}
            GROUP BY o.CustomerId
        )
        SELECT s.CustomerId, c.Name, s.Spent
        FROM CustomerSpend s
        JOIN Customers c ON c.CustomerId = s.CustomerId
        WHERE s.Spent > (SELECT AVG(Spent) FROM CustomerSpend)
        ORDER BY s.Spent DESC;";

    // FromSqlRaw with {0} placeholders creates parameters; never string-concatenate.
    return await db.Set<CustomerSpendRow>()
                   .FromSqlRaw(sql, excludedStatus)
                   .ToListAsync();
}

// Dapper version (same SQL, @excluded parameter)
// var rows = await conn.QueryAsync<CustomerSpendRow>(sql.Replace("{0}", "@excluded"), new { excluded = "Cancelled" });` }
  ],
  pitfalls: [
    'Expecting a CTE to exist in the next statement. It lives for one statement only; use a temp table or view for reuse.',
    'Forgetting the semicolon before WITH in SQL Server when it follows another statement. You get a confusing syntax error.',
    'Referencing an expensive CTE several times in SQL Server and assuming it ran once. It is inlined and may run each time.',
    'Putting ORDER BY inside a CTE and expecting the final result to be sorted. Only the outer ORDER BY counts.',
    'Trying to filter on a window function in the same SELECT. Compute it in the CTE, filter in the outer query.',
    'Chains of ten CTEs with names like cte1, cte2. Name each step after its content, and split very long chains into views or temp tables.'
  ],
  quiz: [
    { q: 'How long does a (non-recursive) CTE exist?', options: ['Until the session or connection ends', 'Only for the statement that follows', 'Until you DROP it', 'Forever, like a view'], answer: 1, why: 'A CTE is part of one statement. The next statement cannot reference it.' },
    { q: 'In SQL Server, referencing the same CTE twice in a query:', options: ['Always runs it once and caches the result', 'May run its query twice because it is inlined', 'Is not allowed', 'Materialises it to tempdb'], answer: 1, why: 'SQL Server substitutes the definition at each reference. Use a temp table if the CTE is expensive and reused.' },
    { q: 'Why compute ROW_NUMBER() in a CTE and filter outside?', options: ['It is faster', 'WHERE runs before window functions are computed', 'Window functions are only allowed inside a CTE body', 'To avoid NULLs'], answer: 1, why: 'WHERE runs before window functions are computed, so the filter must happen in an outer query over a CTE or derived table.' },
    { q: 'Which gives the intermediate result real statistics and lets you index it?', options: ['CTE', 'Derived table', 'Temp table', 'View'], answer: 2, why: 'Temp tables are materialised with statistics and can be indexed. CTEs, derived tables and (non-indexed) views are inlined.' },
    { q: 'What is the main benefit of a CTE over a derived table?', options: ['It always runs faster than a derived table', 'It reads better and can be referenced twice', 'It stores its rows on disk for later statements', 'It avoids joins'], answer: 1, why: 'The plan is normally identical; the CTE gives the step a name, defined before use, and lets you reuse it.' },
    { q: 'In PostgreSQL 12+, a CTE referenced once with no side effects is:', options: ['Always materialised, as in older versions', 'Inlined unless you write MATERIALIZED', 'Rejected', 'Converted to a view'], answer: 1, why: 'PostgreSQL 12 changed the default to inline such CTEs; MATERIALIZED forces the old behaviour.' }
  ],
  takeaways: [
    'WITH Name AS (SELECT ...) gives a query step a name for the one statement that follows.',
    'Chain CTEs with commas; each can use the ones above it. Debug by running each CTE alone.',
    'A CTE is normally inlined, so it is as fast as a subquery, and may run twice if referenced twice (SQL Server).',
    'Use CTEs for readability and reuse within a statement, temp tables for large reused results, views for shared definitions.',
    'Compute window functions or aggregates in a CTE, then filter in the outer query.',
    'CTEs can feed INSERT/UPDATE/DELETE; the ROW_NUMBER duplicate-delete is the classic pattern.'
  ],
  interview: [
    { q: 'What is a CTE and how is it different from a subquery?', a: `<p>A CTE is a named temporary result defined with WITH before the main statement. Functionally it is like a derived table, but it is defined before use, can be referenced multiple times, can be chained, and can be recursive. Performance is usually identical because both are inlined.</p>` },
    { q: 'When would you use a temp table instead of a CTE?', a: `<p>When the intermediate result is large and used in several statements, when you need an index on it, or when the optimizer mis-estimates rows through the CTE and you want real statistics to reset the plan.</p>` },
    { q: 'How do you delete duplicate rows but keep one?', a: `<p>Put ROW_NUMBER() OVER (PARTITION BY the duplicate key ORDER BY a tiebreaker) in a CTE, then DELETE FROM the CTE WHERE rn &gt; 1 (SQL Server), or DELETE ... WHERE id IN (SELECT id FROM cte WHERE rn &gt; 1) (PostgreSQL).</p>` },
    { q: 'Is a CTE an optimisation fence?', a: `<p>Not in SQL Server: the optimizer freely rewrites across CTE boundaries. In PostgreSQL before 12 it was; since 12 single-reference CTEs are inlined unless marked MATERIALIZED.</p>` }
  ]
};
