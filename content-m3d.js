// DevPath content: Module 3, LLD practice (schema design, design problems, machine coding, rate limiter, parking lot)
window.CONTENT = window.CONTENT || {};

window.CONTENT['m3-schema-design'] = {
  hook: `A good schema is like a well-organised kitchen: every item has one home, you never store the same thing in two drawers, and you can find anything in seconds.`,
  intro: `<p>A <span class="term">schema</span> is the plan of your database: which tables exist, which columns they have, and how tables point to each other. Before you write a single line of C#, the schema decides how easy or painful your whole project will be.</p>
<p><span class="term">Normalisation</span> is a set of simple rules for splitting data into tables so that each fact is stored exactly once. If a customer's address is stored in one place, fixing a typo is one update. If it is copied into every order row, you have to fix it in a thousand places and you will miss some.</p>
<p>This lesson walks from a messy spreadsheet-style table to a clean set of tables, explains the rules (1NF, 2NF, 3NF, BCNF) in plain words, and then shows the practical extras real systems need: keys, constraints, indexes, soft delete, audit columns, many-to-many tables, and how to map all of it with EF Core.</p>`,
  realLife: {
    title: 'The wedding guest list that broke',
    body: `<p>Imagine planning a wedding with one big sheet: guest name, their table number, the table's menu, their plus-one, the plus-one's menu, and their hotel with the hotel's phone number. Now the venue changes Table 7's menu from fish to chicken. You must find every guest on Table 7 and edit each row. Miss one, and someone gets the wrong meal. Change the hotel's phone number, and you edit it in forty rows.</p>
<p>A normalised version has a <strong>Guests</strong> sheet, a <strong>Tables</strong> sheet (table number, menu), and a <strong>Hotels</strong> sheet (name, phone). Each guest row only stores a table number and a hotel id. One edit, everywhere fixed.</p>
<p>Where companies use this: every ERP, banking core and e-commerce catalogue is designed this way. Amazon does not copy the product description into each order line; the line stores a product id and the price at the time of purchase (a deliberate, small denormalisation you will learn about below).</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The three building blocks</h4>
<p>A <span class="term">table</span> holds one kind of thing (customers, orders). A <span class="term">row</span> is one of those things. A <span class="term">column</span> is one fact about it. The <span class="term">primary key</span> is the column (or columns) that uniquely identifies a row, like a passport number for a person.</p>
<p>A <span class="term">foreign key</span> is a column that holds another table's primary key. It is how tables point to each other. An order row has a CustomerId column; that is a foreign key to Customers.</p>
<h4>Relationships in plain words</h4>
<ul>
<li><strong>One-to-many</strong>: one customer has many orders. The "many" side (Orders) holds the foreign key.</li>
<li><strong>Many-to-many</strong>: a student takes many courses, a course has many students. You need a third table in the middle (StudentCourses) holding both ids.</li>
<li><strong>One-to-one</strong>: a user has one profile. Often the same table, or a second table sharing the same key.</li>
</ul>
<h4>ER modelling: draw before you type</h4>
<p>An <span class="term">ER diagram</span> (entity-relationship) is a sketch of boxes (entities) and lines (relationships). Do this on paper first. Ask: what are the nouns in my requirements? Those are usually tables. What are the verbs between nouns ("customer places order")? Those are relationships.</p>
<h4>Why normalise?</h4>
<p>Three problems appear when the same fact is copied around:</p>
<ul>
<li><strong>Update anomaly</strong>: you change a fact in one row and forget the others.</li>
<li><strong>Insert anomaly</strong>: you cannot add a new product until someone orders it, because products only live inside order rows.</li>
<li><strong>Delete anomaly</strong>: deleting the last order of a product deletes the product's description too.</li>
</ul>
<div class="callout tip"><p>Rule of thumb: a fact should live in exactly one place. If you find yourself copy-pasting a value into many rows, that value probably wants its own table.</p></div>
<h4>The worked example (messy version)</h4>
<table><thead><tr><th>OrderId</th><th>CustomerName</th><th>CustomerCity</th><th>Products</th><th>Prices</th></tr></thead>
<tbody><tr><td>1</td><td>Asha</td><td>Pune</td><td>Mouse, Keyboard</td><td>500, 1200</td></tr>
<tr><td>2</td><td>Asha</td><td>Pune</td><td>Monitor</td><td>9000</td></tr></tbody></table>
<p>Problems: two products squeezed into one cell, Asha's city copied, and no way to store a product that nobody ordered. In the next level we fix this step by step.</p>` },
    { name: 'Intermediate', body: `<h4>1NF: one value per cell</h4>
<p><span class="term">First normal form</span> says every cell holds a single value and every row is unique. "Mouse, Keyboard" in one cell breaks it. Fix: one row per order line.</p>
<table><thead><tr><th>OrderId</th><th>CustomerName</th><th>CustomerCity</th><th>Product</th><th>Price</th></tr></thead>
<tbody><tr><td>1</td><td>Asha</td><td>Pune</td><td>Mouse</td><td>500</td></tr>
<tr><td>1</td><td>Asha</td><td>Pune</td><td>Keyboard</td><td>1200</td></tr>
<tr><td>2</td><td>Asha</td><td>Pune</td><td>Monitor</td><td>9000</td></tr></tbody></table>
<h4>2NF: no partial dependency</h4>
<p>The key of this table is now (OrderId, Product). <span class="term">Second normal form</span> says every non-key column must depend on the <em>whole</em> key. CustomerName depends only on OrderId, not on Product. That is a partial dependency. Fix: split into Orders (OrderId, CustomerName, CustomerCity) and OrderItems (OrderId, Product, Price).</p>
<h4>3NF: no transitive dependency</h4>
<p><span class="term">Third normal form</span> says non-key columns must depend on the key and nothing else. In Orders, CustomerCity depends on CustomerName, which is not the key. That chain (OrderId → CustomerName → CustomerCity) is a transitive dependency. Fix: a Customers table (CustomerId, Name, City); Orders keeps only CustomerId.</p>
<p>Do the same for Product: a Products table (ProductId, Name, ListPrice); OrderItems keeps ProductId. Final shape:</p>
<ul>
<li><strong>Customers</strong>(CustomerId PK, Name, City)</li>
<li><strong>Products</strong>(ProductId PK, Name, ListPrice)</li>
<li><strong>Orders</strong>(OrderId PK, CustomerId FK, OrderedAt)</li>
<li><strong>OrderItems</strong>(OrderId FK, ProductId FK, Quantity, UnitPrice) with PK (OrderId, ProductId)</li>
</ul>
<h4>BCNF: the stricter 3NF</h4>
<p><span class="term">Boyce-Codd normal form</span> says: whenever one column determines another, the determining column must be a key. It only differs from 3NF in rare cases with overlapping candidate keys (for example, a table where each teacher teaches one subject and each student takes a subject with one teacher). If you hit it, split the table so that the determining column becomes a key somewhere.</p>
<h4>Keys and constraints</h4>
<ul>
<li><strong>Surrogate key</strong>: an id the database invents (identity int or GUID). Stable, never changes.</li>
<li><strong>Natural key</strong>: a real-world value (email, ISBN). Good for a UNIQUE constraint, risky as a primary key because real-world values change.</li>
<li><strong>CHECK</strong> constraints stop bad data at the door (Quantity &gt; 0).</li>
<li><strong>NOT NULL</strong> where a value must exist; nullable only when "unknown" is a real state.</li>
</ul>
<h4>Many-to-many done right</h4>
<p>A join table like OrderItems or StudentCourses holds the two foreign keys and often extra facts about the pair (Quantity, EnrolledOn). Its primary key is usually the pair of foreign keys, or a surrogate id plus a UNIQUE on the pair.</p>
<div class="callout warn"><p>Store the price at the time of purchase in OrderItems. If you only keep ProductId and read ListPrice later, old invoices change when prices change. This is a deliberate copy of a fact, and it is correct because it is a <em>historical</em> value, not the current one.</p></div>` },
    { name: 'Expert', body: `<h4>When to denormalise on purpose</h4>
<p>Normalisation optimises for correctness of writes. Some reads become expensive because they join five tables. When a read is hot and the joined data rarely changes, you can copy it, as long as you own the update path:</p>
<ul>
<li><strong>Counter columns</strong> (Orders.TotalAmount, Posts.LikeCount) updated in the same transaction as the detail rows.</li>
<li><strong>Snapshot columns</strong> (OrderItems.UnitPrice, Invoices.CustomerAddress) that must freeze history.</li>
<li><strong>Read models</strong>: a separate reporting table or materialised view rebuilt by a job (CQRS style).</li>
</ul>
<p>The rule: denormalise only after you have measured, and always write down who updates the copy.</p>
<h4>Indexes and constraints as design, not afterthought</h4>
<p>Every foreign key column should normally have an index; SQL Server does not add one automatically, and joins and cascading deletes scan without it. Composite indexes follow the query: a filter on (TenantId, Status) with ORDER BY CreatedAt wants an index on (TenantId, Status, CreatedAt). Unique constraints express business rules (one active subscription per customer: a filtered unique index WHERE IsActive = 1).</p>
<h4>Soft delete</h4>
<p>Instead of DELETE, set <code>DeletedAt</code> (nullable datetime) or <code>IsDeleted</code>. Benefits: undo, audit, no broken foreign keys. Costs: every query must filter it (EF Core global query filters help), unique constraints need the filtered form, and tables grow forever unless you archive. Prefer <code>DeletedAt</code> over a bit: it carries "when" for free.</p>
<h4>Audit columns and temporal tables</h4>
<p>CreatedAt, CreatedBy, UpdatedAt, UpdatedBy on every business table. Set them in one place (an EF Core SaveChanges interceptor), never by hand. For full history, SQL Server system-versioned temporal tables keep every past version automatically and let you query <code>FOR SYSTEM_TIME AS OF</code>.</p>
<h4>Ids: int, bigint or GUID?</h4>
<table><thead><tr><th>Choice</th><th>Good</th><th>Bad</th></tr></thead>
<tbody><tr><td>int identity</td><td>small, fast, readable</td><td>runs out at 2.1 billion, leaks counts to users</td></tr>
<tr><td>bigint identity</td><td>never runs out</td><td>still guessable</td></tr>
<tr><td>GUID (random)</td><td>generated anywhere, unguessable</td><td>16 bytes, random inserts fragment a clustered index</td></tr>
<tr><td>Sequential GUID / ULID</td><td>unguessable and insert-friendly</td><td>needs a generator in app or DB</td></tr></tbody></table>
<h4>Multi-tenancy in the schema</h4>
<p>Shared tables with a TenantId column on every row is cheapest; put TenantId first in most indexes and enforce it with EF Core global filters or row-level security. Schema-per-tenant or database-per-tenant isolate better but multiply migrations.</p>
<h4>Interview angle</h4>
<p>Interviewers ask you to design a schema for Instagram, Uber or a library. They look for: correct keys, a join table for many-to-many, sensible nullability, which columns you would index and why, and whether you know when to break 3NF on purpose. Say the trade-off out loud.</p>
<div class="callout idea"><p>Ask yourself for each copied column: "If the source changes, is the copy supposed to change too?" If yes, it is a bug. If no, it is a snapshot and it is fine.</p></div>` }
  ],
  flow: {
    title: 'From messy sheet to clean schema',
    steps: [
      { title: 'List the nouns', desc: 'Read the requirements and underline the things: Customer, Order, Product. Each is a candidate table.' },
      { title: 'Draw relationships', desc: 'Customer places many Orders. Order contains many Products and a Product appears in many Orders (many-to-many).' },
      { title: 'Apply 1NF', desc: 'Split multi-value cells so each cell holds exactly one value and each row is unique.' },
      { title: 'Apply 2NF', desc: 'Move columns that depend on only part of a composite key into their own table.' },
      { title: 'Apply 3NF', desc: 'Move columns that depend on another non-key column (city depends on customer) into their own table.' },
      { title: 'Add keys and constraints', desc: 'Pick surrogate primary keys, add foreign keys, UNIQUE, CHECK and NOT NULL.' },
      { title: 'Add indexes', desc: 'Index every foreign key and the columns your real queries filter and sort by.' },
      { title: 'Denormalise with intent', desc: 'Snapshot historical values like UnitPrice, and document who maintains any copy.' }
    ]
  },
  code: [
    { lang: 'sql', title: 'Normalised schema with constraints, soft delete and audit columns (T-SQL)', code: `CREATE TABLE Customers (
    CustomerId   INT IDENTITY(1,1) PRIMARY KEY,
    Email        NVARCHAR(256) NOT NULL,
    FullName     NVARCHAR(200) NOT NULL,
    City         NVARCHAR(100) NULL,
    CreatedAt    DATETIME2 NOT NULL CONSTRAINT DF_Customers_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt    DATETIME2 NULL,
    DeletedAt    DATETIME2 NULL                      -- soft delete: NULL means alive
);
-- Unique email among living customers only (filtered unique index)
CREATE UNIQUE INDEX UX_Customers_Email ON Customers(Email) WHERE DeletedAt IS NULL;

CREATE TABLE Products (
    ProductId    INT IDENTITY(1,1) PRIMARY KEY,
    Sku          VARCHAR(40) NOT NULL UNIQUE,         -- natural key as UNIQUE, not as PK
    Name         NVARCHAR(200) NOT NULL,
    ListPrice    DECIMAL(18,2) NOT NULL CONSTRAINT CK_Products_Price CHECK (ListPrice >= 0),
    IsActive     BIT NOT NULL DEFAULT 1
);

CREATE TABLE Orders (
    OrderId      BIGINT IDENTITY(1,1) PRIMARY KEY,
    CustomerId   INT NOT NULL REFERENCES Customers(CustomerId),
    Status       VARCHAR(20) NOT NULL CONSTRAINT CK_Orders_Status
                 CHECK (Status IN ('Pending','Paid','Shipped','Cancelled')),
    TotalAmount  DECIMAL(18,2) NOT NULL DEFAULT 0,   -- intentional counter column
    OrderedAt    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Orders_Customer_OrderedAt ON Orders(CustomerId, OrderedAt DESC);

-- Many-to-many between Orders and Products, with facts about the pair
CREATE TABLE OrderItems (
    OrderId      BIGINT NOT NULL REFERENCES Orders(OrderId) ON DELETE CASCADE,
    ProductId    INT NOT NULL REFERENCES Products(ProductId),
    Quantity     INT NOT NULL CONSTRAINT CK_OrderItems_Qty CHECK (Quantity > 0),
    UnitPrice    DECIMAL(18,2) NOT NULL,              -- snapshot of price at purchase time
    CONSTRAINT PK_OrderItems PRIMARY KEY (OrderId, ProductId)
);
CREATE INDEX IX_OrderItems_Product ON OrderItems(ProductId);   -- FK index for reports

-- PostgreSQL notes: IDENTITY -> GENERATED ALWAYS AS IDENTITY, DATETIME2 -> timestamptz,
-- NVARCHAR -> text/varchar, SYSUTCDATETIME() -> now(), BIT -> boolean.` },
    { lang: 'csharp', title: 'EF Core mapping: keys, relationships, soft-delete filter, audit interceptor', code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

public class Customer
{
    public int CustomerId { get; set; }
    public string Email { get; set; } = "";
    public string FullName { get; set; } = "";
    public string? City { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
    public List<Order> Orders { get; set; } = new();
}
public class Product { public int ProductId { get; set; } public string Sku { get; set; } = ""; public string Name { get; set; } = ""; public decimal ListPrice { get; set; } }
public class Order
{
    public long OrderId { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public string Status { get; set; } = "Pending";
    public decimal TotalAmount { get; set; }
    public DateTime OrderedAt { get; set; }
    public List<OrderItem> Items { get; set; } = new();
}
public class OrderItem
{
    public long OrderId { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }   // snapshot, never re-read from Product
}

public class ShopDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Customer>(e =>
        {
            e.HasIndex(c => c.Email).IsUnique().HasFilter("[DeletedAt] IS NULL");
            e.HasQueryFilter(c => c.DeletedAt == null);          // soft delete: hidden everywhere by default
            e.Property(c => c.Email).HasMaxLength(256);
        });
        b.Entity<Product>().HasIndex(p => p.Sku).IsUnique();
        b.Entity<Order>()
            .HasOne(o => o.Customer).WithMany(c => c.Orders).HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);                   // never cascade-delete orders
        b.Entity<Order>().HasIndex(o => new { o.CustomerId, o.OrderedAt });
        b.Entity<OrderItem>(e =>
        {
            e.HasKey(i => new { i.OrderId, i.ProductId });        // composite key = many-to-many pair
            e.Property(i => i.UnitPrice).HasPrecision(18, 2);
        });
    }
}

// Sets audit columns in one place, so no developer has to remember.
public class AuditInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData e, InterceptionResult<int> r)
    {
        var now = DateTime.UtcNow;
        foreach (var entry in e.Context!.ChangeTracker.Entries<Customer>())
        {
            if (entry.State == EntityState.Added) entry.Entity.CreatedAt = now;
            if (entry.State == EntityState.Modified) entry.Entity.UpdatedAt = now;
            if (entry.State == EntityState.Deleted)                // turn hard delete into soft delete
            { entry.State = EntityState.Modified; entry.Entity.DeletedAt = now; }
        }
        return r;
    }
    // SaveChangesAsync calls SavingChangesAsync instead: override it with the same logic too.
}
// Registration: services.AddDbContext<ShopDbContext>(o => o.UseSqlServer(cs).AddInterceptors(new AuditInterceptor()));` },
    { lang: 'sql', title: 'Finding a normalisation problem in existing data', code: `-- Symptom of a missing Customers table: the same name with different cities.
SELECT CustomerName, COUNT(DISTINCT CustomerCity) AS Cities
FROM LegacyOrders
GROUP BY CustomerName
HAVING COUNT(DISTINCT CustomerCity) > 1;

-- Migration sketch: build the new tables from the old wide table.
INSERT INTO Customers (Email, FullName, City)
SELECT Email, MIN(CustomerName), MIN(CustomerCity)   -- pick one value per email, review conflicts first
FROM LegacyOrders
GROUP BY Email;

INSERT INTO Orders (CustomerId, Status, OrderedAt)
SELECT c.CustomerId, l.Status, l.OrderedAt
FROM LegacyOrders l
JOIN Customers c ON c.Email = l.Email;

-- Verify nothing was lost
SELECT (SELECT COUNT(*) FROM LegacyOrders) AS OldRows, (SELECT COUNT(*) FROM Orders) AS NewRows;` }
  ],
  pitfalls: [
    'Using a natural value like email as the primary key. Emails change; then every foreign key must change too. Use a surrogate id and put UNIQUE on the email.',
    'Forgetting indexes on foreign key columns. Joins and cascading deletes then scan whole tables.',
    'Storing lists in one column ("1,4,9"). You cannot index, join or validate it. Make a child table.',
    'Reading the current product price when showing old orders. Snapshot the price into the order line.',
    'Adding IsDeleted and then forgetting to filter it in half the queries. Use a global query filter.',
    'Normalising reporting tables to 3NF and then wondering why dashboards are slow. Reporting is where you denormalise on purpose.'
  ],
  quiz: [
    { q: 'A table has columns (OrderId, ProductId, ProductName, Quantity) with key (OrderId, ProductId). Which rule does ProductName break?', options: ['1NF, because ProductName holds text rather than a number', '2NF, because it depends only on ProductId, part of the key', '3NF, because it depends on Quantity, a non-key column', 'None, because every column here depends on the whole composite key'], answer: 1, why: 'ProductName depends on ProductId alone, not on the whole key (OrderId, ProductId). That partial dependency is what 2NF forbids.' },
    { q: 'Which is the correct way to model "a student takes many courses and a course has many students"?', options: ['Put a comma-separated CourseIds list column in the Students table', 'Put a comma-separated StudentIds list column in the Courses table', 'Create a StudentCourses table with StudentId and CourseId', 'Duplicate the whole student row once for every course they take'], answer: 2, why: 'Many-to-many always needs a join table holding both foreign keys, optionally with facts about the pair.' },
    { q: 'Why store UnitPrice in OrderItems when Products already has ListPrice?', options: ['It is a mistake; it breaks 3NF and should always be removed', 'To freeze the historical price so old invoices do not change', 'Because SQL Server does not allow joins when printing invoices', 'To make the table wider so that index pages fill up faster'], answer: 1, why: 'UnitPrice is a snapshot of a historical fact. The current list price may change later; the order must not.' },
    { q: 'What is the main cost of soft delete?', options: ['Rows can never be restored once they have been marked as deleted', 'Queries and unique constraints must all exclude the deleted rows', 'It always uses far more CPU than a normal DELETE statement', 'Foreign keys stop working on any table that has the column'], answer: 1, why: 'Soft delete keeps rows around, so queries and unique indexes have to exclude them explicitly. Global query filters reduce the risk.' },
    { q: 'Which statement about indexes on foreign keys in SQL Server is true?', options: ['They are created automatically whenever you declare a foreign key', 'They are never useful because the primary key index covers joins', 'You must create them yourself; they speed up joins and cascades', 'They only work when the key columns are GUIDs, not integers'], answer: 2, why: 'SQL Server creates an index for the primary key, not for foreign key columns. You add those yourself.' },
    { q: 'When is denormalisation a good idea?', options: ['Always, because fewer joins makes every read and write faster', 'Never, because 3NF is a hard rule that real systems must not break', 'For measured hot reads, when one code path owns updating the copy', 'Only in NoSQL databases, since SQL databases cannot store copies'], answer: 2, why: 'Denormalise after measuring, and make sure one piece of code owns keeping the copy correct.' }
  ],
  takeaways: [
    'Each fact lives in exactly one place; copies are either bugs or documented snapshots.',
    '1NF: one value per cell. 2NF: depend on the whole key. 3NF: depend on nothing but the key.',
    'Many-to-many needs a join table; one-to-many puts the foreign key on the "many" side.',
    'Use surrogate primary keys; express natural keys as UNIQUE constraints.',
    'Index every foreign key and every real filter/sort path; add CHECK and NOT NULL early.',
    'Soft delete and audit columns are cheap when set in one interceptor and filtered globally.'
  ],
  interview: [
    { q: 'Explain 3NF in one sentence and give an example of a violation.', a: '<p>Every non-key column depends on the key, the whole key, and nothing but the key. Violation: an Orders table that stores CustomerCity, because city depends on the customer, not on the order.</p>' },
    { q: 'Would you use a GUID or an int as a primary key?', a: '<p>Int or bigint identity for most internal tables: smaller, faster, friendly to clustered indexes. GUIDs when ids must be generated on clients or across services, or must not be guessable; then prefer a sequential GUID or ULID to avoid index fragmentation.</p>' },
    { q: 'How would you design a schema for a ride-sharing app?', a: '<p>Users (with a role or separate Drivers table holding licence and vehicle), Vehicles, Rides (RiderId, DriverId, status, pickup/drop coordinates, requested/started/ended timestamps, snapshot fare), Payments (RideId, amount, provider reference), Ratings (RideId, by, score). Index Rides on (DriverId, status) and (RiderId, requestedAt). Fare is a snapshot because pricing rules change.</p>' },
    { q: 'What is the difference between 3NF and BCNF?', a: '<p>Both remove transitive dependencies. BCNF is stricter: every determinant must be a candidate key. The difference shows only with overlapping composite candidate keys; in practice, if you are in 3NF and every candidate key is a single column, you are also in BCNF.</p>' }
  ]
};

window.CONTENT['m3-design-problems'] = {
  hook: `Every LLD interview is the same question in a costume: "Can you turn a messy real-world situation into a small set of classes that will still make sense next year?"`,
  intro: `<p><span class="term">Low-level design (LLD)</span> is the step between "we want a library app" and actual code. You decide which classes exist, what each one is responsible for, how they talk to each other, and which design patterns keep the code flexible.</p>
<p>The good news: there is a repeatable method. You do not need inspiration. You need a checklist you run every time: requirements → entities → relationships → interfaces → patterns → walkthrough. This lesson teaches that method and then applies it to five classic problems: a library, an elevator, a vending machine, tic-tac-toe, and a bill-splitting app like Splitwise.</p>
<p>Every design here is in C#, uses the same vocabulary as the OOPS, SOLID and design-pattern lessons, and ends with the questions interviewers love to add in the last ten minutes.</p>`,
  realLife: {
    title: 'The architect who asks boring questions first',
    body: `<p>When you ask an architect to design a house, they do not start drawing. They ask: how many people live here, do you cook a lot, do you work from home, is there a car? Only then do they sketch rooms (entities), doors between rooms (relationships), and standard parts like plumbing (patterns). An interviewer wants to see the same habit: ask before you draw.</p>
<p>Where companies use this: at Amazon or Flipkart, a "design a parking lot" or "design Splitwise" round is a standard screen for mid-level engineers. Internally, the same method is used when a team adds a new feature, such as "gift cards", to an existing checkout and has to decide which classes change and which stay untouched.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The six-step method</h4>
<ol>
<li><strong>Requirements</strong>: write 5-8 one-line rules. Mark what is in scope and what is not. Ask clarifying questions.</li>
<li><strong>Entities</strong>: underline the nouns. Book, Member, Loan. Each becomes a class.</li>
<li><strong>Relationships</strong>: who has what, and how many. A Member has many Loans; a Loan is for one Book copy.</li>
<li><strong>Interfaces</strong>: the actions. Borrow, return, search, pay fine. Put them on the class that owns the data.</li>
<li><strong>Patterns</strong>: only where a rule may change. Pricing rules → Strategy. Object states → State. Notifications → Observer.</li>
<li><strong>Walkthrough</strong>: tell the story of one request ("Asha borrows a book") through your classes. Gaps show up here.</li>
</ol>
<h4>What a good class looks like</h4>
<ul>
<li>It has one job you can say in one sentence.</li>
<li>Its data is private; other classes ask it to do things rather than poke its fields.</li>
<li>It depends on interfaces, not on concrete classes, where a rule can change.</li>
</ul>
<h4>Worked example 1: Library Management</h4>
<p><strong>Requirements:</strong> members borrow and return books; a title can have several physical copies; max 5 loans per member; 14-day loan; fine per late day; search by title or author.</p>
<p><strong>Entities:</strong> <code>BookTitle</code> (ISBN, title, author), <code>BookCopy</code> (barcode, status), <code>Member</code>, <code>Loan</code> (copy, member, due date), <code>Fine</code>, <code>Library</code> (the facade that coordinates).</p>
<p><strong>Relationships:</strong> Title 1→many Copies. Member 1→many Loans. Loan → one Copy.</p>
<p><strong>Interfaces:</strong> <code>Library.Borrow(memberId, barcode)</code>, <code>Library.Return(barcode)</code>, <code>ICatalog.Search(query)</code>, <code>IFinePolicy.Calculate(loan, returnedOn)</code>.</p>
<p><strong>Patterns:</strong> Strategy for the fine policy (students vs staff), Observer to email when a reserved copy comes back.</p>
<div class="callout tip"><p>Keep <code>BookTitle</code> and <code>BookCopy</code> separate. Beginners merge them and then cannot represent "three copies of the same book, one of which is lost".</p></div>
<h4>Worked example 2: Tic-Tac-Toe</h4>
<p>Entities: <code>Board</code> (3x3 cells), <code>Player</code> (name, symbol), <code>Game</code> (turn order, status). Interface: <code>Game.Play(row, col)</code> returns a result (Continue, Win, Draw, Invalid). Patterns: none needed beyond clean classes; maybe a <code>IWinChecker</code> so an N x N board can swap in a faster checker. Interviewers use this one to see if you can keep it simple.</p>` },
    { name: 'Intermediate', body: `<h4>Worked example 3: Elevator system</h4>
<p><strong>Requirements:</strong> N elevators, M floors; hall buttons (up/down) on each floor; car buttons inside; an elevator serves requests in its direction before turning; doors open for a few seconds; emergency stop.</p>
<p><strong>Entities:</strong> <code>Elevator</code> (current floor, direction, state, pending stops), <code>ElevatorController</code> (receives hall calls, picks an elevator), <code>Request</code> (floor, direction), <code>Door</code>, <code>Display</code>.</p>
<p><strong>Patterns:</strong></p>
<ul>
<li><strong>State</strong> for the elevator: Idle, MovingUp, MovingDown, DoorsOpen, Maintenance. Each state decides what a button press means.</li>
<li><strong>Strategy</strong> for dispatch: nearest-car, same-direction-first, or load-balanced. The controller holds an <code>IDispatchStrategy</code>.</li>
<li><strong>Observer</strong> so displays update when an elevator moves.</li>
</ul>
<p><strong>Key data structure:</strong> each elevator keeps two sorted sets of stops, one for floors above and one for floors below, so "serve in current direction, then turn" is a simple loop (this is the SCAN disk-scheduling idea).</p>
<h4>Worked example 4: Vending machine</h4>
<p><strong>Requirements:</strong> insert coins/notes, select product, dispense, return change, refund if cancelled, admin restock.</p>
<p><strong>Entities:</strong> <code>VendingMachine</code>, <code>Inventory</code> (slot → product + count), <code>Product</code>, <code>Money</code>/<code>Coin</code> enum, <code>Transaction</code>.</p>
<p><strong>Patterns:</strong> <strong>State</strong> is the whole point: <code>IdleState</code>, <code>HasMoneyState</code>, <code>DispensingState</code>, <code>OutOfServiceState</code>. The machine delegates <code>InsertMoney</code>, <code>SelectProduct</code>, <code>Cancel</code> to its current state object, and states move the machine to the next state. Without State you get a giant switch with impossible combinations.</p>
<p>Change-making is a small greedy problem with the available coin inventory; mention that greedy fails for odd coin sets and a DP fallback exists.</p>
<h4>Worked example 5: Splitwise</h4>
<p><strong>Requirements:</strong> users, groups, expenses paid by one user and split equally, exactly, or by percentage; show who owes whom; simplify debts.</p>
<p><strong>Entities:</strong> <code>User</code>, <code>Group</code>, <code>Expense</code> (payer, amount, splits), <code>Split</code> (user, share), <code>BalanceSheet</code> (userA → userB → amount).</p>
<p><strong>Patterns:</strong> <strong>Strategy</strong> for split types (<code>EqualSplit</code>, <code>ExactSplit</code>, <code>PercentSplit</code>) each validating its own inputs (percentages sum to 100). A <strong>Factory</strong> creates the right strategy from the request. Balances are a dictionary of pair → amount; simplify debts with two max-heaps, one of creditors and one of debtors (greedy settle largest against largest).</p>
<div class="callout warn"><p>Money is <code>decimal</code>, never <code>double</code>. And equal splits must handle the extra paisa: 100 split 3 ways is 33.34, 33.33, 33.33, not 33.33 x 3.</p></div>
<h4>Choosing patterns without overdoing it</h4>
<table><thead><tr><th>You notice</th><th>Reach for</th></tr></thead>
<tbody><tr><td>Behaviour depends on which mode the object is in</td><td>State</td></tr>
<tr><td>A rule has several interchangeable versions</td><td>Strategy</td></tr>
<tr><td>Many things want to know when something happens</td><td>Observer</td></tr>
<tr><td>Object creation needs a decision</td><td>Factory</td></tr>
<tr><td>Many steps hide behind one simple call</td><td>Facade</td></tr>
<tr><td>Adding features to an object without subclass explosion</td><td>Decorator</td></tr></tbody></table>` },
    { name: 'Expert', body: `<h4>Thinking about invariants</h4>
<p>An <span class="term">invariant</span> is a rule that must always be true: a book copy is loaned to at most one member; a vending machine never dispenses with insufficient balance; group balances always sum to zero. Senior designs make invariants impossible to break by putting the check inside the class that owns the data, not in the caller. Mention invariants out loud; it signals maturity.</p>
<h4>Concurrency in LLD problems</h4>
<p>Interviewers often add "what if two users borrow the last copy at the same time?" Answers in order of strength:</p>
<ul>
<li>A lock around the critical section inside <code>Library.Borrow</code> (fine for a single process).</li>
<li>Optimistic concurrency: a version column on BookCopy; the second update fails and retries.</li>
<li>Database constraint as the final guard: a unique index on (CopyId) WHERE ReturnedAt IS NULL means two active loans for one copy cannot exist, no matter what the code does.</li>
</ul>
<h4>Extensibility questions and good answers</h4>
<table><thead><tr><th>Follow-up</th><th>Design move</th></tr></thead>
<tbody><tr><td>Library: add e-books with unlimited copies</td><td><code>IBorrowable</code> abstraction; e-book copy count is infinite; loan policy strategy differs</td></tr>
<tr><td>Elevator: VIP floor priority</td><td>new <code>IDispatchStrategy</code>; no change to Elevator</td></tr>
<tr><td>Vending: card payments</td><td><code>IPaymentMethod</code>; states stay the same</td></tr>
<tr><td>Tic-tac-toe: N x N board, win on K in a row</td><td>incremental win check: only scan the four lines through the last move, O(K) per move; when K = N, row/col/diagonal counters per player make it O(1)</td></tr>
<tr><td>Splitwise: multi-currency</td><td>Money value object (amount + currency); conversion is a separate service; never mix in arithmetic</td></tr></tbody></table>
<h4>Persistence boundaries</h4>
<p>Keep domain classes free of database code. A <code>ILoanRepository</code> interface sits between the domain and EF Core. In the interview you implement an in-memory repository; in production you swap it. This is the Repository pattern plus Dependency Inversion, and it is what lets you unit test the whole design in milliseconds.</p>
<h4>Events as the glue</h4>
<p>Instead of <code>Library</code> calling <code>EmailService</code> directly, it raises a <code>BookReturned</code> event. Reservations, analytics and emails subscribe. This keeps the core free of side-effect wiring and maps directly to message queues when the system grows (see the HLD lessons).</p>
<h4>How interviewers grade</h4>
<ul>
<li>Did you clarify requirements and state assumptions?</li>
<li>Are classes cohesive with clear ownership of data?</li>
<li>Did you use a pattern where it pays and avoid it where it does not?</li>
<li>Can you walk one request end to end without hand-waving?</li>
<li>Can you extend the design when they change a rule?</li>
</ul>
<div class="callout idea"><p>Practice saying "I'll start simple and I'll show you where I would add a pattern if this rule changes." That sentence wins more rounds than a pattern-heavy first draft.</p></div>` }
  ],
  flow: {
    title: 'Running the LLD method on "Asha borrows a book"',
    steps: [
      { title: 'Clarify', desc: 'Ask: multiple copies per title? Loan limit? Fine rule? Write them as numbered requirements.' },
      { title: 'Find entities', desc: 'Nouns become classes: BookTitle, BookCopy, Member, Loan, Fine, Library.' },
      { title: 'Connect them', desc: 'Title has many Copies. Member has many Loans. Loan points to one Copy and one Member.' },
      { title: 'Define actions', desc: 'Library.Borrow(memberId, barcode) and Library.Return(barcode) are the public entry points.' },
      { title: 'Pick patterns', desc: 'IFinePolicy strategy for fines; an event when a copy is returned for reservation notifications.' },
      { title: 'Walk the request', desc: 'Borrow: load member, check limit, load copy, check Available, create Loan with due date, mark copy Loaned.' },
      { title: 'Guard invariants', desc: 'Status change and Loan creation happen inside one method, under one lock or one transaction.' },
      { title: 'Extend', desc: 'Interviewer adds e-books: introduce IBorrowable; nothing else changes. Design holds.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Library management: entities, strategy for fines, event on return', code: `public enum CopyStatus { Available, Loaned, Lost }

public record BookTitle(string Isbn, string Title, string Author);

public class BookCopy
{
    public string Barcode { get; }
    public BookTitle Title { get; }
    public CopyStatus Status { get; private set; } = CopyStatus.Available;
    public BookCopy(string barcode, BookTitle title) { Barcode = barcode; Title = title; }
    internal void MarkLoaned()    { if (Status != CopyStatus.Available) throw new InvalidOperationException("Copy not available"); Status = CopyStatus.Loaned; }
    internal void MarkReturned()  { Status = CopyStatus.Available; }
}

public class Member
{
    public int Id { get; }
    public string Name { get; }
    public MemberType Type { get; }
    private readonly List<Loan> _activeLoans = new();
    public IReadOnlyList<Loan> ActiveLoans => _activeLoans;
    public Member(int id, string name, MemberType type) { Id = id; Name = name; Type = type; }
    internal void AddLoan(Loan l)    { if (_activeLoans.Count >= 5) throw new InvalidOperationException("Loan limit reached"); _activeLoans.Add(l); }
    internal void RemoveLoan(Loan l) { _activeLoans.Remove(l); }
}
public enum MemberType { Student, Staff }

public class Loan
{
    public BookCopy Copy { get; }
    public Member Member { get; }
    public DateOnly DueOn { get; }
    public Loan(BookCopy copy, Member member, DateOnly dueOn) { Copy = copy; Member = member; DueOn = dueOn; }
}

// Strategy: the fine rule can change per member type without touching Library.
public interface IFinePolicy { decimal Calculate(Loan loan, DateOnly returnedOn); }
public class PerDayFinePolicy : IFinePolicy
{
    private readonly decimal _perDay;
    public PerDayFinePolicy(decimal perDay) => _perDay = perDay;
    public decimal Calculate(Loan loan, DateOnly returnedOn)
        => Math.Max(0, returnedOn.DayNumber - loan.DueOn.DayNumber) * _perDay;
}

public class Library
{
    private readonly Dictionary<string, BookCopy> _copies = new();
    private readonly Dictionary<int, Member> _members = new();
    private readonly Dictionary<string, Loan> _loansByBarcode = new();
    private readonly Func<MemberType, IFinePolicy> _finePolicyFor;
    private readonly object _gate = new();
    public event Action<BookCopy>? CopyReturned;          // Observer hook for reservations / emails

    public Library(Func<MemberType, IFinePolicy> finePolicyFor) => _finePolicyFor = finePolicyFor;
    public void AddCopy(BookCopy c) => _copies[c.Barcode] = c;
    public void AddMember(Member m) => _members[m.Id] = m;

    public Loan Borrow(int memberId, string barcode, DateOnly today)
    {
        lock (_gate)                                        // invariant: one active loan per copy
        {
            var member = _members[memberId];
            var copy = _copies[barcode];
            var loan = new Loan(copy, member, today.AddDays(14));
            if (copy.Status != CopyStatus.Available) throw new InvalidOperationException("Copy not available");
            member.AddLoan(loan);                           // throws if over limit; nothing has changed yet
            copy.MarkLoaned();                              // safe: availability was checked above
            _loansByBarcode[barcode] = loan;
            return loan;
        }
    }

    public decimal Return(string barcode, DateOnly today)
    {
        lock (_gate)
        {
            var loan = _loansByBarcode[barcode];
            _loansByBarcode.Remove(barcode);
            loan.Member.RemoveLoan(loan);
            loan.Copy.MarkReturned();
            var fine = _finePolicyFor(loan.Member.Type).Calculate(loan, today);
            CopyReturned?.Invoke(loan.Copy);
            return fine;
        }
    }
}

// Usage:
// var lib = new Library(t => t == MemberType.Staff ? new PerDayFinePolicy(0) : new PerDayFinePolicy(2m));
// lib.CopyReturned += copy => Console.WriteLine("Notify reservers of " + copy.Title.Title);` },
    { lang: 'csharp', title: 'Vending machine with the State pattern', code: `public enum Coin { One = 1, Two = 2, Five = 5, Ten = 10 }
public record Product(string Code, string Name, int Price);

public interface IMachineState
{
    void InsertCoin(VendingMachine m, Coin c);
    void Select(VendingMachine m, string code);
    void Cancel(VendingMachine m);
}

public class VendingMachine
{
    private readonly Dictionary<string, (Product product, int count)> _slots = new();
    public int Balance { get; internal set; }
    public IMachineState State { get; internal set; } = new IdleState();

    public void Restock(Product p, int count) => _slots[p.Code] = (p, count);
    public bool Has(string code) => _slots.TryGetValue(code, out var s) && s.count > 0;
    public Product Peek(string code) => _slots[code].product;
    internal void Dispense(string code)
    {
        var (p, n) = _slots[code];
        _slots[code] = (p, n - 1);
        Console.WriteLine("Dispensed " + p.Name);
    }
    internal void ReturnChange()
    {
        if (Balance > 0) Console.WriteLine("Returned change: " + Balance);   // greedy coin breakdown would go here
        Balance = 0;
    }
    // Public API just forwards to the current state
    public void InsertCoin(Coin c) => State.InsertCoin(this, c);
    public void Select(string code) => State.Select(this, code);
    public void Cancel() => State.Cancel(this);
}

public class IdleState : IMachineState
{
    public void InsertCoin(VendingMachine m, Coin c) { m.Balance += (int)c; m.State = new HasMoneyState(); }
    public void Select(VendingMachine m, string code) => Console.WriteLine("Insert money first");
    public void Cancel(VendingMachine m) { }
}

public class HasMoneyState : IMachineState
{
    public void InsertCoin(VendingMachine m, Coin c) => m.Balance += (int)c;
    public void Select(VendingMachine m, string code)
    {
        if (!m.Has(code)) { Console.WriteLine("Sold out"); return; }
        var p = m.Peek(code);
        if (m.Balance < p.Price) { Console.WriteLine("Need " + (p.Price - m.Balance) + " more"); return; }
        m.State = new DispensingState();
        m.Dispense(code);
        m.Balance -= p.Price;
        m.ReturnChange();
        m.State = new IdleState();
    }
    public void Cancel(VendingMachine m) { m.ReturnChange(); m.State = new IdleState(); }
}

public class DispensingState : IMachineState
{
    public void InsertCoin(VendingMachine m, Coin c) => Console.WriteLine("Please wait");
    public void Select(VendingMachine m, string code) => Console.WriteLine("Please wait");
    public void Cancel(VendingMachine m) => Console.WriteLine("Cannot cancel now");
}

// var vm = new VendingMachine(); vm.Restock(new Product("A1", "Chips", 12), 3);
// vm.Select("A1");        // Insert money first
// vm.InsertCoin(Coin.Ten); vm.InsertCoin(Coin.Five); vm.Select("A1");   // Dispensed Chips, Returned change: 3` },
    { lang: 'csharp', title: 'Splitwise core: split strategies, balances, debt simplification', code: `public interface ISplitStrategy
{
    // Returns how much each participant owes for this expense. Must sum to total.
    Dictionary<string, decimal> Split(decimal total, IReadOnlyList<string> users, decimal[]? values);
}

public class EqualSplit : ISplitStrategy
{
    public Dictionary<string, decimal> Split(decimal total, IReadOnlyList<string> users, decimal[]? _)
    {
        var share = Math.Floor(total / users.Count * 100) / 100;          // round down to paisa
        var result = users.ToDictionary(u => u, _ => share);
        var remainder = total - share * users.Count;                       // leftover paisa
        for (int i = 0; remainder > 0; i++, remainder -= 0.01m) result[users[i]] += 0.01m;
        return result;
    }
}
public class ExactSplit : ISplitStrategy
{
    public Dictionary<string, decimal> Split(decimal total, IReadOnlyList<string> users, decimal[]? v)
    {
        if (v == null || v.Sum() != total) throw new ArgumentException("Exact amounts must sum to total");
        return users.Select((u, i) => (u, v[i])).ToDictionary(x => x.u, x => x.Item2);
    }
}
public class PercentSplit : ISplitStrategy
{
    public Dictionary<string, decimal> Split(decimal total, IReadOnlyList<string> users, decimal[]? v)
    {
        if (v == null || v.Sum() != 100) throw new ArgumentException("Percentages must sum to 100");
        var amounts = users.Select((u, i) => (u, Math.Round(total * v[i] / 100, 2))).ToDictionary(x => x.u, x => x.Item2);
        amounts[users[0]] += total - amounts.Values.Sum();               // fix rounding drift on first user
        return amounts;
    }
}

public static class SplitFactory
{
    public static ISplitStrategy For(string type) => type switch
    {
        "EQUAL" => new EqualSplit(), "EXACT" => new ExactSplit(), "PERCENT" => new PercentSplit(),
        _ => throw new ArgumentException("Unknown split type")
    };
}

public class BalanceSheet
{
    // net[user] > 0 means others owe this user; < 0 means this user owes.
    private readonly Dictionary<string, decimal> _net = new();

    public void AddExpense(string paidBy, decimal total, IReadOnlyList<string> users, string splitType, decimal[]? values = null)
    {
        var shares = SplitFactory.For(splitType).Split(total, users, values);
        _net[paidBy] = _net.GetValueOrDefault(paidBy) + total;
        foreach (var (user, share) in shares) _net[user] = _net.GetValueOrDefault(user) - share;
    }

    // Greedy settlement: match biggest creditor with biggest debtor; at most n-1 payments.
    public List<(string from, string to, decimal amount)> Simplify()
    {
        var creditors = new PriorityQueue<(string u, decimal amt), decimal>();
        var debtors = new PriorityQueue<(string u, decimal amt), decimal>();
        foreach (var (u, amt) in _net)
        {
            if (amt > 0) creditors.Enqueue((u, amt), -amt);
            else if (amt < 0) debtors.Enqueue((u, -amt), amt);
        }
        var payments = new List<(string, string, decimal)>();
        while (creditors.Count > 0 && debtors.Count > 0)
        {
            var c = creditors.Dequeue(); var d = debtors.Dequeue();
            var pay = Math.Min(c.amt, d.amt);
            payments.Add((d.u, c.u, pay));
            if (c.amt - pay > 0) creditors.Enqueue((c.u, c.amt - pay), -(c.amt - pay));
            if (d.amt - pay > 0) debtors.Enqueue((d.u, d.amt - pay), -(d.amt - pay));
        }
        return payments;
    }
}
// var bs = new BalanceSheet();
// bs.AddExpense("asha", 300, new[] { "asha", "ravi", "meera" }, "EQUAL");
// bs.AddExpense("ravi", 100, new[] { "asha", "ravi" }, "EXACT", new decimal[] { 60, 40 });
// foreach (var p in bs.Simplify()) Console.WriteLine(p.from + " pays " + p.to + " " + p.amount);
// meera pays asha 100 ; ravi pays asha 40` },
    { lang: 'csharp', title: 'Tic-tac-toe with O(1) win detection and an elevator dispatch strategy sketch', code: `// ---- Tic-tac-toe: counters make win checks O(1) per move, works for N x N ----
public enum MoveResult { Continue, Win, Draw, Invalid }

public class TicTacToe
{
    private readonly int _n;
    private readonly int[,] _board;                 // 0 empty, 1 or 2 for players
    private readonly int[,] _rows, _cols;           // [player, index]
    private readonly int[] _diag = new int[3], _anti = new int[3];
    private int _moves;
    public int Current { get; private set; } = 1;

    public TicTacToe(int n) { _n = n; _board = new int[n, n]; _rows = new int[3, n]; _cols = new int[3, n]; }

    public MoveResult Play(int r, int c)
    {
        if (r < 0 || c < 0 || r >= _n || c >= _n || _board[r, c] != 0) return MoveResult.Invalid;
        int p = Current;
        _board[r, c] = p; _moves++;
        if (++_rows[p, r] == _n || ++_cols[p, c] == _n) return MoveResult.Win;
        if (r == c && ++_diag[p] == _n) return MoveResult.Win;
        if (r + c == _n - 1 && ++_anti[p] == _n) return MoveResult.Win;
        if (_moves == _n * _n) return MoveResult.Draw;
        Current = 3 - p;                            // 1 -> 2, 2 -> 1
        return MoveResult.Continue;
    }
}

// ---- Elevator: State enum + Strategy for dispatch; controller never knows the rule ----
public enum Direction { Idle, Up, Down }

public class Elevator
{
    public int Id { get; }
    public int Floor { get; private set; }
    public Direction Direction { get; private set; } = Direction.Idle;
    private readonly SortedSet<int> _up = new(), _down = new();
    public Elevator(int id, int startFloor) { Id = id; Floor = startFloor; }
    public int PendingStops => _up.Count + _down.Count;

    public void AddStop(int floor)
    {
        if (floor == Floor) { Console.WriteLine("E" + Id + " opens at " + Floor); return; }   // already here
        if (floor > Floor) _up.Add(floor); else if (floor < Floor) _down.Add(floor);
        if (Direction == Direction.Idle) Direction = floor > Floor ? Direction.Up : Direction.Down;
    }
    public void Step()                               // one tick: move one floor, serve stops in current direction (SCAN)
    {
        if (Direction == Direction.Up)
        {
            Floor++; if (_up.Remove(Floor)) Console.WriteLine("E" + Id + " opens at " + Floor);
            if (_up.Count == 0) Direction = _down.Count > 0 ? Direction.Down : Direction.Idle;
        }
        else if (Direction == Direction.Down)
        {
            Floor--; if (_down.Remove(Floor)) Console.WriteLine("E" + Id + " opens at " + Floor);
            if (_down.Count == 0) Direction = _up.Count > 0 ? Direction.Up : Direction.Idle;
        }
    }
}

public interface IDispatchStrategy { Elevator Pick(IReadOnlyList<Elevator> cars, int floor, Direction want); }

public class NearestSameDirection : IDispatchStrategy
{
    public Elevator Pick(IReadOnlyList<Elevator> cars, int floor, Direction want)
        => cars.OrderBy(e => Cost(e, floor, want)).First();
    private static int Cost(Elevator e, int floor, Direction want)
    {
        int dist = Math.Abs(e.Floor - floor);
        bool onTheWay = e.Direction == Direction.Idle
            || (e.Direction == Direction.Up && want == Direction.Up && e.Floor <= floor)
            || (e.Direction == Direction.Down && want == Direction.Down && e.Floor >= floor);
        return onTheWay ? dist : dist + 100 + e.PendingStops;    // penalise cars going the wrong way
    }
}

public class ElevatorController
{
    private readonly List<Elevator> _cars; private readonly IDispatchStrategy _strategy;
    public ElevatorController(List<Elevator> cars, IDispatchStrategy s) { _cars = cars; _strategy = s; }
    public void HallCall(int floor, Direction want) => _strategy.Pick(_cars, floor, want).AddStop(floor);
    public void Tick() { foreach (var c in _cars) c.Step(); }
}` }
  ],
  pitfalls: [
    'Jumping to class diagrams before asking a single clarifying question. Interviewers want to see you scope the problem.',
    'Merging "book title" and "book copy" (or "product" and "stock unit"). You then cannot represent multiple physical copies.',
    'Using a design pattern because you know it, not because a rule can change. Over-engineering is marked down as much as spaghetti.',
    'Putting business rules in the caller (the UI or controller) instead of inside the class that owns the data. Invariants leak.',
    'Using double for money. Use decimal and handle rounding remainders explicitly.',
    'Forgetting the walkthrough. Telling the story of one request end to end is where most gaps are found.'
  ],
  quiz: [
    { q: 'In the LLD method, what is the main purpose of the final "walkthrough" step?', options: ['To write unit tests for every class before the design is final', 'To trace one request through the classes and find gaps', 'To pick the database and the hosting model for the system', 'To draw a prettier diagram that is easier to present'], answer: 1, why: 'Walking one real request end to end exposes missing methods, unclear ownership and impossible states.' },
    { q: 'Which pattern is the natural fit for a vending machine whose button behaviour changes depending on whether money has been inserted?', options: ['Singleton', 'State', 'Decorator', 'Builder'], answer: 1, why: 'The State pattern gives each mode (Idle, HasMoney, Dispensing) its own object that decides what each action means.' },
    { q: 'Why keep BookTitle and BookCopy as separate classes?', options: ['It makes the code longer, which interviewers read as thorough', 'So copies of one title can each have their own status', 'Because interviewers always give marks for a higher class count', 'Because an ISBN is too long to store on every loan record'], answer: 1, why: 'A title is the abstract work; a copy is a physical item with its own barcode and status. Merging them breaks "three copies, one lost".' },
    { q: 'How should an equal split of 100 among 3 users be handled?', options: ['33.33 each, and the group simply loses 0.01', '33.34, 33.33, 33.33 so shares sum to 100', 'Use double so the division comes out exact', 'Reject the expense because 100 is not divisible'], answer: 1, why: 'Money must sum exactly. Round down to the smallest unit and give the remainder to one or more users.' },
    { q: 'What makes the tic-tac-toe win check O(1) per move?', options: ['Checking the whole board after each move with nested loops', 'Per-player counters for each row, column and diagonal', 'Using recursion to search every line from the last move', 'Using a hash set that stores all possible winning lines'], answer: 1, why: 'Incrementing the counters for the row, column and diagonals touched by the move, and checking if any reached N, is constant time.' },
    { q: 'Which is the strongest guard that one book copy is never loaned twice at the same time?', options: ['A comment in the code warning developers not to do it', 'A check in the UI that disables the Borrow button', 'A service lock plus a unique index on active loans', 'Logging every borrow so duplicates can be found later'], answer: 2, why: 'The lock handles the single process; the unique index guarantees it even across multiple servers or buggy code paths.' }
  ],
  takeaways: [
    'Run the same six steps every time: requirements, entities, relationships, interfaces, patterns, walkthrough.',
    'Nouns become classes, verbs become methods, and "how many" becomes the relationship.',
    'Use State when behaviour depends on mode, Strategy when a rule has versions, Observer when many things react.',
    'Keep invariants inside the owning class; add a database constraint as the final guard.',
    'Money is decimal; split remainders explicitly.',
    'Start simple and say where you would add a pattern if a rule changes.'
  ],
  interview: [
    { q: 'Design a library management system. Walk me through your classes.', a: '<p>BookTitle (ISBN, title, author) with many BookCopy (barcode, status). Member with active loans and a type. Loan links a copy, a member and a due date. Library is the facade with Borrow and Return. IFinePolicy strategy computes fines per member type. A CopyReturned event feeds reservations. Invariant: one active loan per copy, enforced in Borrow under a lock and by a filtered unique index in the database.</p>' },
    { q: 'How would you design the elevator dispatch so it can be changed later?', a: '<p>Keep each elevator responsible for serving its own stops in SCAN order (two sorted sets). Put the choice of which elevator takes a hall call behind an IDispatchStrategy interface. Nearest-same-direction is the default; VIP or energy-saving strategies are new classes, and the controller never changes.</p>' },
    { q: 'In Splitwise, how do you simplify debts in a group?', a: '<p>Compute each user\'s net balance (paid minus owed). Put creditors and debtors into two max-heaps. Repeatedly settle the largest debtor against the largest creditor for the smaller of the two amounts, pushing any remainder back. This produces at most n-1 payments.</p>' },
    { q: 'When would you not use the State pattern?', a: '<p>When there are only two states and the transitions are trivial, a boolean and an if is clearer. State pays off when there are three or more states, each with different behaviour for the same actions, and when new states are likely.</p>' }
  ]
};

window.CONTENT['m3-machine-coding'] = {
  hook: `A machine coding round is not "can you code?" It is "can you ship a small, clean, working thing in 90 minutes while someone watches?"`,
  intro: `<p>A <span class="term">machine coding round</span> gives you a problem statement (a game, a booking system, an inventory) and 90 to 120 minutes to build a working program on your own laptop. Then you demo it and walk the interviewer through the code. Companies such as Flipkart, Swiggy, Uber India and many product start-ups use it as the main filter for mid-level roles.</p>
<p>It is not a leetcode round. The algorithms are easy. What is graded is structure: do your classes make sense, does the code run end to end, can you add a feature at the end without breaking things, and did you write even a few tests?</p>
<p>This lesson gives you a time plan, a clean-code checklist, a reusable project skeleton (in-memory repositories, services, a thin console driver), and one full worked solution: a cab booking system, with notes on how the same skeleton solves Snake &amp; Ladder and an inventory system.</p>`,
  realLife: {
    title: 'Cooking a three-course meal on a timer',
    body: `<p>Think of a cooking competition: 90 minutes, three courses, judges taste at the end. A beginner tries to make a complicated dessert first and runs out of time with nothing plated. A pro writes the plan in two minutes, cooks the simplest full plate first, then improves it while the clock runs. Machine coding is the same: a plain working flow at minute 50 beats a half-finished fancy design at minute 90.</p>
<p>Where companies use this: Flipkart's round asks for things like "design a Snake and Ladder game", Swiggy's asks for "a food ordering app with restaurants and ratings", and many fintechs ask for "a bill splitting app". All are graded with a rubric that looks like the checklist below.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>What the interviewer expects</h4>
<ul>
<li>A program that <strong>runs</strong> and demonstrates the main flows from the statement.</li>
<li>Classes with clear names and one job each; no 400-line Main method.</li>
<li>Input handled gracefully: bad commands print a message instead of crashing.</li>
<li>Data kept in memory (dictionaries and lists). No database, no UI, no frameworks.</li>
<li>A couple of tests, or at least a scripted demo that proves the flows.</li>
</ul>
<h4>The 90-minute time plan</h4>
<table><thead><tr><th>Minutes</th><th>Do</th></tr></thead>
<tbody><tr><td>0-10</td><td>Read twice. Write requirements as a numbered list. Mark "must" vs "nice". Ask questions.</td></tr>
<tr><td>10-20</td><td>Write entity classes and the service interface. No bodies yet.</td></tr>
<tr><td>20-55</td><td>Implement the must-have flows end to end, simplest version. Run after each one.</td></tr>
<tr><td>55-70</td><td>Validation, error messages, edge cases, a few tests.</td></tr>
<tr><td>70-80</td><td>One nice-to-have, only if the musts are solid.</td></tr>
<tr><td>80-90</td><td>Clean names, remove dead code, prepare the demo script.</td></tr></tbody></table>
<div class="callout warn"><p>The most common failure is spending 40 minutes on a perfect class design and then having nothing that runs. Working code first, then beauty.</p></div>
<h4>Project skeleton you can reuse</h4>
<ul>
<li><code>Models/</code>: plain classes (Driver, Rider, Trip).</li>
<li><code>Repositories/</code>: <code>IRepository&lt;T&gt;</code> with an in-memory implementation (a Dictionary).</li>
<li><code>Services/</code>: the business logic (BookingService). This is where interviewers look.</li>
<li><code>Program.cs</code>: a tiny command loop or a scripted demo.</li>
<li><code>Tests/</code>: xUnit tests for the service (if time allows, even 3 tests help a lot).</li>
</ul>
<h4>Clean-code checklist (read it at minute 80)</h4>
<ul>
<li>Names say what things are: <code>availableDrivers</code>, not <code>list1</code>.</li>
<li>No magic numbers; constants with names.</li>
<li>Methods under ~25 lines.</li>
<li>Exceptions for impossible states, result messages for user mistakes.</li>
<li>No static mutable state; pass dependencies in through constructors.</li>
</ul>` },
    { name: 'Intermediate', body: `<h4>Worked problem: cab booking</h4>
<p><strong>Statement (typical):</strong> Register riders and drivers with a location (x, y). Drivers can go on/off duty. A rider requests a cab; show drivers within 5 units; the rider picks one; the trip starts; on end, bill = base fare + per-unit distance; drivers earn; show rider history and driver earnings.</p>
<p><strong>Requirements list:</strong></p>
<ol>
<li>Add rider, add driver (name, x, y). Driver availability toggle.</li>
<li>Find nearby available drivers within radius 5 (Euclidean distance).</li>
<li>Book a trip with a chosen driver; driver becomes unavailable.</li>
<li>End trip at destination; fare = 50 + 10 per unit distance; driver available again.</li>
<li>Rider trip history; driver total earnings.</li>
<li>Nice: surge pricing, rating, cancel trip.</li>
</ol>
<p><strong>Entities:</strong> <code>Rider</code>, <code>Driver</code> (location, IsAvailable, earnings), <code>Trip</code> (rider, driver, from, to, fare, status), <code>Location</code> value object.</p>
<p><strong>Services:</strong> <code>UserService</code> (register, toggle availability), <code>BookingService</code> (nearby, book, end), <code>IFareCalculator</code> (strategy, so surge is a 5-minute add-on).</p>
<p><strong>Repositories:</strong> <code>InMemoryRepository&lt;T&gt;</code> keyed by id. One generic class, three instances.</p>
<h4>Test-first for the core flow</h4>
<p>Before writing <code>Book</code>, write the test: given a rider and an available driver 3 units away, booking succeeds and the driver becomes unavailable; given a driver 7 units away, they are not in the nearby list. These two tests force clean method signatures and give you a demo you can run in front of the interviewer.</p>
<h4>Error handling that scores</h4>
<ul>
<li>Return a <code>Result</code> type or throw a small custom exception (<code>BookingException</code>) that the console loop catches and prints. Never let the program die.</li>
<li>Validate at the service boundary: unknown rider id, driver not available, trip already ended.</li>
</ul>
<h4>Same skeleton, other problems</h4>
<table><thead><tr><th>Problem</th><th>Models</th><th>Service core</th><th>Strategy hook</th></tr></thead>
<tbody><tr><td>Snake &amp; Ladder</td><td>Board (size, snakes, ladders), Player, Dice</td><td>GameService: Roll, Move, CheckWin</td><td>IDice (fair vs loaded for tests)</td></tr>
<tr><td>Inventory</td><td>Product, StockEntry, Warehouse</td><td>InventoryService: AddStock, Reserve, Release, Report</td><td>IAllocationStrategy (FIFO, nearest warehouse)</td></tr>
<tr><td>Food ordering</td><td>Restaurant, MenuItem, Order</td><td>OrderService: Place, AssignRestaurant</td><td>ISelectionStrategy (lowest cost, highest rating)</td></tr></tbody></table>
<div class="callout tip"><p>An injectable <code>IDice</code> is the single most useful trick for Snake &amp; Ladder: tests can force a 6 and prove a ladder works without luck.</p></div>` },
    { name: 'Expert', body: `<h4>What separates a strong hire from a pass</h4>
<ul>
<li><strong>Extension under pressure.</strong> At minute 85 the interviewer says "add surge pricing when fewer than 3 drivers are free". If fare calculation is a strategy, you add one class. If it is inlined in <code>EndTrip</code>, you edit core logic live and risk breaking the demo.</li>
<li><strong>Thread-safety awareness.</strong> You do not need locks in a console app, but saying "the Book method is the critical section; in a real service I would lock per driver or use optimistic concurrency" earns points.</li>
<li><strong>Separation of I/O and logic.</strong> Services never call <code>Console</code>. The console loop parses commands and prints results. This is what makes tests possible.</li>
<li><strong>Ids and lookups.</strong> O(1) dictionaries keyed by id; for "nearby drivers" a linear scan is fine, and you say that a grid or geohash would replace it at scale.</li>
</ul>
<h4>Command parsing without a mess</h4>
<p>A dictionary from command name to handler (<code>Dictionary&lt;string, Action&lt;string[]&gt;&gt;</code>) keeps Program.cs small and makes adding commands trivial. Unknown command prints help and continues.</p>
<h4>Testing strategy in 15 minutes</h4>
<ul>
<li>One happy-path test per must-have flow.</li>
<li>One failure test for the most important rule (cannot book an unavailable driver).</li>
<li>Tests construct services with in-memory repositories; no mocks needed.</li>
</ul>
<h4>Demo script</h4>
<p>Write a <code>Demo.Run()</code> that executes the full story: register users, list nearby, book, end, print history and earnings. Run it first in the review; then open the code. Interviewers remember a clean demo.</p>
<h4>The review conversation</h4>
<p>Expect: "Why is this a class?", "What happens if two riders pick the same driver?", "How would this change with a database?", "Where would you add logging?" Good answers point to a specific seam: the repository interface, the service method, the strategy.</p>
<h4>Common rubric (approximate)</h4>
<table><thead><tr><th>Area</th><th>Weight</th></tr></thead>
<tbody><tr><td>Working, demonstrable functionality</td><td>35%</td></tr>
<tr><td>Code structure and OO design</td><td>30%</td></tr>
<tr><td>Readability and naming</td><td>15%</td></tr>
<tr><td>Edge cases and error handling</td><td>10%</td></tr>
<tr><td>Tests and extensibility</td><td>10%</td></tr></tbody></table>
<div class="callout idea"><p>Before you start typing, say your plan out loud in three sentences. It aligns the interviewer with you and makes later questions friendlier.</p></div>` }
  ],
  flow: {
    title: 'The 90 minutes, step by step',
    steps: [
      { title: 'Read and list', desc: 'Read the statement twice. Write numbered requirements. Separate must-haves from nice-to-haves. Ask two questions.' },
      { title: 'Skeleton', desc: 'Create Models, Repositories, Services, Program. Write class names and method signatures only.' },
      { title: 'First flow end to end', desc: 'Register users and list nearby drivers. Run it. Green output on screen within 30 minutes.' },
      { title: 'Core flow', desc: 'Book and end a trip with fare calculation behind an interface. Run again.' },
      { title: 'Guard the rules', desc: 'Unavailable driver, unknown ids, double end. Friendly messages, no crashes.' },
      { title: 'Tests', desc: 'Three xUnit tests on the service with in-memory repositories.' },
      { title: 'One extra', desc: 'Surge pricing as a new fare strategy, only because the musts are green.' },
      { title: 'Polish and demo', desc: 'Rename, delete dead code, write Demo.Run(), rehearse the walkthrough once.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Cab booking, part 1: models, generic in-memory repository, fare strategy', code: `// Models/
public readonly record struct Location(double X, double Y)
{
    public double DistanceTo(Location o) => Math.Sqrt((X - o.X) * (X - o.X) + (Y - o.Y) * (Y - o.Y));
}

public abstract class User { public string Id { get; } public string Name { get; } protected User(string id, string name) { Id = id; Name = name; } }

public class Rider : User
{
    public Location Location { get; set; }
    public Rider(string id, string name, Location loc) : base(id, name) => Location = loc;
}

public class Driver : User
{
    public Location Location { get; set; }
    public bool IsAvailable { get; set; } = true;
    public decimal Earnings { get; set; }
    public Driver(string id, string name, Location loc) : base(id, name) => Location = loc;
}

public enum TripStatus { InProgress, Completed }

public class Trip
{
    public string Id { get; } = Guid.NewGuid().ToString("N")[..8];
    public Rider Rider { get; }
    public Driver Driver { get; }
    public Location From { get; }
    public Location? To { get; private set; }
    public decimal Fare { get; private set; }
    public TripStatus Status { get; private set; } = TripStatus.InProgress;
    public Trip(Rider r, Driver d, Location from) { Rider = r; Driver = d; From = from; }
    internal void Complete(Location to, decimal fare) { To = to; Fare = fare; Status = TripStatus.Completed; }
}

// Repositories/  - one generic class, keyed by Id, good enough for the whole round
public interface IRepository<T>
{
    void Add(string id, T item);
    T? Get(string id);
    IEnumerable<T> All();
}
public class InMemoryRepository<T> : IRepository<T>
{
    private readonly Dictionary<string, T> _items = new();
    public void Add(string id, T item) => _items[id] = item;
    public T? Get(string id) => _items.TryGetValue(id, out var v) ? v : default;
    public IEnumerable<T> All() => _items.Values;
}

// Strategy: fare rules change, the booking flow does not
public interface IFareCalculator { decimal Calculate(double distance, int availableDrivers); }
public class StandardFare : IFareCalculator
{
    public const decimal Base = 50m, PerUnit = 10m;
    public decimal Calculate(double distance, int availableDrivers) => Base + (decimal)distance * PerUnit;
}
public class SurgeFare : IFareCalculator       // the "minute 85" extension: one new class
{
    private readonly IFareCalculator _inner;
    public SurgeFare(IFareCalculator inner) => _inner = inner;
    public decimal Calculate(double distance, int availableDrivers)
        => Math.Round(_inner.Calculate(distance, availableDrivers) * (availableDrivers < 3 ? 1.5m : 1m), 2);
}

public class BookingException : Exception { public BookingException(string m) : base(m) { } }` },
    { lang: 'csharp', title: 'Cab booking, part 2: the service (no Console calls here)', code: `public class BookingService
{
    public const double SearchRadius = 5.0;
    private readonly IRepository<Rider> _riders;
    private readonly IRepository<Driver> _drivers;
    private readonly IRepository<Trip> _trips;
    private readonly IFareCalculator _fare;

    public BookingService(IRepository<Rider> riders, IRepository<Driver> drivers, IRepository<Trip> trips, IFareCalculator fare)
    { _riders = riders; _drivers = drivers; _trips = trips; _fare = fare; }

    public Rider AddRider(string id, string name, double x, double y)
    { var r = new Rider(id, name, new Location(x, y)); _riders.Add(id, r); return r; }

    public Driver AddDriver(string id, string name, double x, double y)
    { var d = new Driver(id, name, new Location(x, y)); _drivers.Add(id, d); return d; }

    public void SetAvailability(string driverId, bool available)
        => RequireDriver(driverId).IsAvailable = available;

    public List<Driver> NearbyDrivers(string riderId)
    {
        var rider = RequireRider(riderId);
        return _drivers.All()
            .Where(d => d.IsAvailable && d.Location.DistanceTo(rider.Location) <= SearchRadius)
            .OrderBy(d => d.Location.DistanceTo(rider.Location))
            .ToList();
    }

    public Trip Book(string riderId, string driverId)
    {
        var rider = RequireRider(riderId);
        var driver = RequireDriver(driverId);
        if (!driver.IsAvailable) throw new BookingException("Driver " + driver.Name + " is not available");
        if (driver.Location.DistanceTo(rider.Location) > SearchRadius) throw new BookingException("Driver is too far away");
        var trip = new Trip(rider, driver, rider.Location);
        driver.IsAvailable = false;                     // critical section in a real service: lock per driver
        _trips.Add(trip.Id, trip);
        return trip;
    }

    public Trip EndTrip(string tripId, double toX, double toY)
    {
        var trip = _trips.Get(tripId) ?? throw new BookingException("Unknown trip " + tripId);
        if (trip.Status == TripStatus.Completed) throw new BookingException("Trip already ended");
        var to = new Location(toX, toY);
        var distance = trip.From.DistanceTo(to);
        var available = _drivers.All().Count(d => d.IsAvailable);
        var fare = _fare.Calculate(distance, available);
        trip.Complete(to, fare);
        trip.Driver.Earnings += fare;
        trip.Driver.Location = to;
        trip.Driver.IsAvailable = true;
        trip.Rider.Location = to;
        return trip;
    }

    public IEnumerable<Trip> HistoryOf(string riderId)
        => _trips.All().Where(t => t.Rider.Id == riderId);

    public decimal EarningsOf(string driverId) => RequireDriver(driverId).Earnings;

    private Rider RequireRider(string id) => _riders.Get(id) ?? throw new BookingException("Unknown rider " + id);
    private Driver RequireDriver(string id) => _drivers.Get(id) ?? throw new BookingException("Unknown driver " + id);
}` },
    { lang: 'csharp', title: 'Cab booking, part 3: command loop, demo script and xUnit tests', code: `// Program.cs - thin console driver. Parsing here, logic in the service.
public static class Program
{
    public static void Main()
    {
        var svc = new BookingService(new InMemoryRepository<Rider>(), new InMemoryRepository<Driver>(),
                                     new InMemoryRepository<Trip>(), new SurgeFare(new StandardFare()));
        var commands = new Dictionary<string, Action<string[]>>(StringComparer.OrdinalIgnoreCase)
        {
            ["add_rider"]  = a => svc.AddRider(a[0], a[1], double.Parse(a[2]), double.Parse(a[3])),
            ["add_driver"] = a => svc.AddDriver(a[0], a[1], double.Parse(a[2]), double.Parse(a[3])),
            ["offduty"]    = a => svc.SetAvailability(a[0], false),
            ["onduty"]     = a => svc.SetAvailability(a[0], true),
            ["nearby"]     = a => Console.WriteLine(string.Join(", ", svc.NearbyDrivers(a[0]).Select(d => d.Id + ":" + d.Name))),
            ["book"]       = a => Console.WriteLine("Trip " + svc.Book(a[0], a[1]).Id + " started"),
            ["end"]        = a => { var t = svc.EndTrip(a[0], double.Parse(a[1]), double.Parse(a[2])); Console.WriteLine("Fare " + t.Fare); },
            ["history"]    = a => { foreach (var t in svc.HistoryOf(a[0])) Console.WriteLine(t.Id + " " + t.Driver.Name + " " + t.Fare); },
            ["earnings"]   = a => Console.WriteLine(svc.EarningsOf(a[0])),
        };

        Console.WriteLine("Commands: " + string.Join(" ", commands.Keys) + " | exit");
        while (true)
        {
            Console.Write("> ");
            var line = Console.ReadLine();
            if (line == null || line.Trim().Equals("exit", StringComparison.OrdinalIgnoreCase)) break;
            var parts = line.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 0) continue;
            try
            {
                if (commands.TryGetValue(parts[0], out var handler)) handler(parts[1..]);
                else Console.WriteLine("Unknown command");
            }
            catch (BookingException ex) { Console.WriteLine("Error: " + ex.Message); }
            catch (Exception ex) when (ex is FormatException or IndexOutOfRangeException) { Console.WriteLine("Bad arguments"); }
        }
    }
}

// Tests/BookingServiceTests.cs  (xUnit)  - three tests that prove the must-haves
public class BookingServiceTests
{
    private static BookingService NewService() => new(new InMemoryRepository<Rider>(), new InMemoryRepository<Driver>(),
                                                      new InMemoryRepository<Trip>(), new StandardFare());
    [Fact]
    public void Nearby_returns_only_available_drivers_within_radius()
    {
        var s = NewService();
        s.AddRider("r1", "Asha", 0, 0);
        s.AddDriver("d1", "Near", 3, 4);      // distance 5 -> included
        s.AddDriver("d2", "Far", 6, 8);       // distance 10 -> excluded
        s.AddDriver("d3", "Busy", 1, 1); s.SetAvailability("d3", false);
        Assert.Equal(new[] { "d1" }, s.NearbyDrivers("r1").Select(d => d.Id));
    }

    [Fact]
    public void Booking_marks_driver_unavailable_and_ending_computes_fare()
    {
        var s = NewService();
        s.AddRider("r1", "Asha", 0, 0); s.AddDriver("d1", "Ravi", 3, 4);
        var trip = s.Book("r1", "d1");
        Assert.Empty(s.NearbyDrivers("r1"));
        var done = s.EndTrip(trip.Id, 0, 10);               // distance 10 -> 50 + 100
        Assert.Equal(150m, done.Fare);
        Assert.Equal(150m, s.EarningsOf("d1"));
    }

    [Fact]
    public void Cannot_book_unavailable_driver()
    {
        var s = NewService();
        s.AddRider("r1", "Asha", 0, 0); s.AddDriver("d1", "Ravi", 1, 1); s.SetAvailability("d1", false);
        Assert.Throws<BookingException>(() => s.Book("r1", "d1"));
    }
}` },
    { lang: 'csharp', title: 'Snake & Ladder in the same skeleton (injectable dice makes it testable)', code: `public interface IDice { int Roll(); }
public class FairDice : IDice { private readonly Random _r = new(); public int Roll() => _r.Next(1, 7); }
public class FixedDice : IDice                              // for tests and demos
{
    private readonly Queue<int> _values; public FixedDice(params int[] v) => _values = new Queue<int>(v);
    public int Roll() => _values.Count > 0 ? _values.Dequeue() : 1;
}

public class Board
{
    public int Size { get; }
    private readonly Dictionary<int, int> _jumps = new();    // snake head -> tail, ladder bottom -> top
    public Board(int size) => Size = size;
    public void AddSnake(int head, int tail)  { if (tail >= head) throw new ArgumentException("Snake must go down"); _jumps[head] = tail; }
    public void AddLadder(int from, int to)   { if (to <= from) throw new ArgumentException("Ladder must go up"); _jumps[from] = to; }
    public int Resolve(int cell) => _jumps.TryGetValue(cell, out var t) ? t : cell;
}

public class Player { public string Name { get; } public int Position { get; set; } public Player(string n) => Name = n; }

public class GameService
{
    private readonly Board _board; private readonly IDice _dice; private readonly Queue<Player> _turns;
    public Player? Winner { get; private set; }
    public GameService(Board board, IDice dice, IEnumerable<Player> players)
    { _board = board; _dice = dice; _turns = new Queue<Player>(players); }

    // Returns a one-line description of the move so the console just prints it.
    public string PlayTurn()
    {
        if (Winner != null) return "Game over, " + Winner.Name + " already won";
        var p = _turns.Dequeue();
        int roll = _dice.Roll();
        int target = p.Position + roll;
        string note;
        if (target > _board.Size) { note = "needs exact roll, stays"; target = p.Position; }
        else
        {
            int landed = _board.Resolve(target);
            note = landed < target ? "snake! down to " + landed : landed > target ? "ladder! up to " + landed : "moves to " + landed;
            target = landed;
        }
        p.Position = target;
        if (p.Position == _board.Size) Winner = p; else _turns.Enqueue(p);
        return p.Name + " rolled " + roll + ", " + note + (Winner == p ? " and WINS" : "");
    }
}

// Test: a ladder actually lifts the player
// var b = new Board(100); b.AddLadder(4, 25);
// var g = new GameService(b, new FixedDice(4), new[] { new Player("A"), new Player("B") });
// Assert.Contains("ladder! up to 25", g.PlayTurn());` }
  ],
  pitfalls: [
    'Starting with a perfect design and having nothing running at minute 60. Ship the first flow by minute 30.',
    'Console.WriteLine inside services. It makes tests impossible and mixes two jobs.',
    'One huge Main with a switch and global lists. Interviewers read structure first.',
    'Crashing on bad input. Catch your own exception type in the loop and print a message.',
    'Hard-coding rules (fare, radius) in several places. One named constant or one strategy class.',
    'Not rehearsing the demo. Fumbling the walkthrough undoes good code.'
  ],
  quiz: [
    { q: 'What should be true by roughly minute 30 of a 90-minute machine coding round?', options: ['All classes fully designed on paper first', 'At least one full flow runs end to end', 'All tests written for every service method', 'The nice-to-have features started'], answer: 1, why: 'Working code early de-risks the round. Everything else layers on top of a running program.' },
    { q: 'Why should services never call Console directly?', options: ['Console output is too slow for a timed interview round', 'It mixes I/O with logic and makes the service untestable', 'Interviewers forbid any use of Console in machine coding rounds', 'It causes threading bugs because Console is not thread-safe'], answer: 1, why: 'Services return data or results; the console loop prints them. That separation is what makes unit tests possible.' },
    { q: 'What is the benefit of an injectable IDice in Snake & Ladder?', options: ['It generates random numbers much faster', 'Tests and demos can force specific rolls', 'It removes the need for a Board class', 'It guarantees the game is fair to all players'], answer: 1, why: 'A FixedDice lets you deterministically show a ladder or snake without relying on luck.' },
    { q: 'An interviewer adds "surge pricing when few drivers are free" at the end. Which design makes this a 5-minute change?', options: ['Fare computed inline inside the EndTrip method', 'Fare behind an IFareCalculator strategy', 'Fare stored as a global static', 'Fare computed in the console loop'], answer: 1, why: 'With a strategy, surge is a new class wrapping the standard one; EndTrip does not change.' },
    { q: 'How should user mistakes like "unknown rider id" be handled?', options: ['Let the program crash so the interviewer sees the full stack trace', 'Return null silently and let the caller work out what happened', 'Throw a small custom exception that the console loop catches', 'Exit the program with an error code after the first mistake'], answer: 2, why: 'A domain exception keeps services honest and lets the driver loop show a friendly message and continue.' }
  ],
  takeaways: [
    'Plan for 10 minutes, build the first full flow by minute 30, polish at the end.',
    'Skeleton: Models, generic in-memory Repository, Services, thin Program, a few tests.',
    'Logic in services, printing in the console loop, rules behind strategies.',
    'Catch your own exception type at the top loop; never crash on user input.',
    'Three tests on the service beat zero tests and cost 15 minutes.',
    'Rehearse a Demo.Run() story; the demo is half the grade.'
  ],
  interview: [
    { q: 'How do you approach a machine coding problem in the first ten minutes?', a: '<p>Read twice, write numbered requirements, split must-have from nice-to-have, ask two clarifying questions (ids, concurrency, what to print), then sketch models and the service interface before typing code.</p>' },
    { q: 'How would this in-memory design move to a real database?', a: '<p>The IRepository interface is the seam: replace InMemoryRepository with an EF Core implementation. The service does not change. Transactions wrap Book and EndTrip, and the driver availability update gets optimistic concurrency.</p>' },
    { q: 'What if two riders book the same driver at the same moment?', a: '<p>In one process, lock around the availability check and update in Book. Across processes, use a version column on the driver row (optimistic concurrency) or an atomic conditional update: UPDATE Drivers SET IsAvailable = 0 WHERE Id = @id AND IsAvailable = 1, and treat zero rows affected as "already taken".</p>' },
    { q: 'Why generic InMemoryRepository instead of three specific classes?', a: '<p>Same behaviour for every entity, so one generic class removes duplicate code and keeps focus on the service, which is what the round grades. Specific repositories appear only when an entity needs special queries.</p>' }
  ]
};

window.CONTENT['m3-case-rate-limiter'] = {
  hook: `A rate limiter is a bouncer with a counter: it does not care who you are, only how many times you have knocked in the last minute.`,
  intro: `<p>A <span class="term">rate limiter</span> decides whether a request is allowed or rejected based on how many requests a client has already made in a time window. It protects your API from abuse, from buggy clients stuck in a retry loop, and from one big customer starving everyone else.</p>
<p>There are five classic algorithms: fixed window, sliding log, sliding window counter, token bucket, and leaky bucket. They differ in accuracy, memory use, and how they treat short bursts. Picking the right one, and knowing what happens when the limiter runs on many servers, is the heart of this case study.</p>
<p>You will build two of them in C#, see the trade-offs in a table, learn how a distributed version works with Redis, and use the rate limiting middleware built into ASP.NET Core.</p>`,
  realLife: {
    title: 'The free-samples counter at a supermarket',
    body: `<p>A store gives away free cheese samples: each customer may take 3 per hour. Fixed window: the staff resets everyone's count on the hour, so a clever customer takes 3 at 10:59 and 3 more at 11:01, six in two minutes. Sliding window: the staff looks at the last 60 minutes from <em>now</em>, which stops the trick but needs a notebook of timestamps. Token bucket: each customer has a small jar that gets one token every 20 minutes, up to 3; they can take a sample whenever the jar has a token. Bursts of 3 are allowed, then a steady trickle.</p>
<p>Where companies use this: GitHub's API returns <code>X-RateLimit-Remaining</code> headers and HTTP 429 when you exceed limits; Stripe uses token buckets per API key; Cloudflare rate-limits at the edge before traffic reaches your servers.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>What we need to decide</h4>
<ul>
<li><strong>Who</strong> is limited: per user, per API key, per IP, per endpoint, or a mix.</li>
<li><strong>How much</strong>: 100 requests per minute, 1000 per day.</li>
<li><strong>What happens</strong> on reject: HTTP 429 Too Many Requests, with a <code>Retry-After</code> header.</li>
<li><strong>Where</strong> it runs: inside the app, in an API gateway, or at the CDN edge.</li>
</ul>
<h4>The five algorithms in plain words</h4>
<ol>
<li><strong>Fixed window</strong>: a counter per client per minute. Reset at the start of each minute. Simple; allows double traffic at the boundary.</li>
<li><strong>Sliding log</strong>: store the timestamp of every request; count those within the last minute. Exact; memory grows with traffic.</li>
<li><strong>Sliding window counter</strong>: keep this minute's count and last minute's count; estimate by weighting the previous window. Nearly exact, tiny memory.</li>
<li><strong>Token bucket</strong>: a bucket holds up to N tokens; tokens refill at a steady rate; each request takes one. Allows bursts up to N.</li>
<li><strong>Leaky bucket</strong>: requests enter a queue that drains at a fixed rate. Smooths output; extra requests overflow and are dropped.</li>
</ol>
<h4>Trade-offs at a glance</h4>
<table><thead><tr><th>Algorithm</th><th>Accuracy</th><th>Memory per client</th><th>Bursts</th><th>Typical use</th></tr></thead>
<tbody><tr><td>Fixed window</td><td>Low at edges</td><td>1 counter</td><td>Up to 2x at boundary</td><td>Simple quotas</td></tr>
<tr><td>Sliding log</td><td>Exact</td><td>1 timestamp per request</td><td>None beyond limit</td><td>Low-volume, strict</td></tr>
<tr><td>Sliding window counter</td><td>Approximate (very close)</td><td>2 counters</td><td>Small</td><td>Most APIs</td></tr>
<tr><td>Token bucket</td><td>Exact for rate + burst</td><td>2 numbers</td><td>Allowed up to capacity</td><td>Public APIs, SDK clients</td></tr>
<tr><td>Leaky bucket</td><td>Exact output rate</td><td>queue</td><td>Smoothed away</td><td>Traffic shaping, outgoing calls</td></tr></tbody></table>
<div class="callout tip"><p>If you are unsure, choose token bucket for "how fast may a client call me" and sliding window counter for "how many per minute" quotas. Both are cheap and good enough almost everywhere.</p></div>
<h4>What the client sees</h4>
<p>Good APIs send headers on every response: <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, and on 429 a <code>Retry-After</code> in seconds. Clients then back off instead of hammering.</p>` },
    { name: 'Intermediate', body: `<h4>Designing the interface</h4>
<p>Everything hides behind one call: <code>bool TryAcquire(string key)</code> (and optionally how long to wait). The key is "user:42" or "ip:1.2.3.4:/login". The algorithm is a strategy you can swap.</p>
<h4>Token bucket in detail</h4>
<p>State per key: <code>tokens</code> (double) and <code>lastRefill</code> (timestamp). On each request: add <code>(now - lastRefill) * refillRate</code> tokens, capped at capacity; if tokens ≥ 1, subtract one and allow. There is no timer; refill is computed lazily when a request arrives. Capacity sets the burst size; refill rate sets the sustained rate.</p>
<h4>Sliding window counter in detail</h4>
<p>State per key: count for the current window and count for the previous window. Estimate = <code>prevCount * (1 - elapsedFractionOfCurrentWindow) + currCount</code>. If estimate &lt; limit, allow and increment. It assumes the previous window's requests were spread evenly, which is a small, acceptable error.</p>
<h4>Thread safety in one process</h4>
<p>Many requests hit the limiter at once. Use a <code>ConcurrentDictionary</code> for the per-key state and a lock (or <code>Interlocked</code>) inside the per-key update. The code block below does exactly that.</p>
<h4>Memory and cleanup</h4>
<p>Keys for clients that stopped calling must expire. Run a periodic sweep that removes entries idle for longer than a window, or store state in Redis with a TTL so it expires on its own.</p>
<h4>Where to plug it in</h4>
<ul>
<li>ASP.NET Core middleware early in the pipeline (before authentication for IP limits, after it for user limits).</li>
<li>An API gateway (Azure API Management, YARP, Kong) when many services share the policy.</li>
<li>The CDN edge for volumetric attacks.</li>
</ul>
<h4>ASP.NET Core's built-in limiter</h4>
<p>Since .NET 7, <code>AddRateLimiter</code> gives you fixed window, sliding window, token bucket and concurrency limiters, partitioned by any key you choose (user id, IP). You attach a policy to endpoints with <code>RequireRateLimiting("policyName")</code>. It is in-process only; for many servers you add a shared store.</p>
<div class="callout warn"><p>An in-memory limiter behind a load balancer with 4 servers gives each client roughly 4x the intended limit, because each server counts separately. That is the distributed problem solved in the Expert level.</p></div>` },
    { name: 'Expert', body: `<h4>Distributed rate limiting</h4>
<p>When requests for one client land on many servers, the counter must live in one shared place. The usual answer is Redis: fast, in-memory, and able to run small scripts atomically.</p>
<ul>
<li><strong>Fixed/sliding window</strong>: <code>INCR key</code> plus <code>EXPIRE key window</code>. Atomic enough for a single counter; for the sliding estimate use two keys (current and previous minute).</li>
<li><strong>Token bucket</strong>: state is two fields (tokens, timestamp). Read-modify-write must be atomic, so it runs as a Lua script: compute refill, decide, write back, all in one server-side step. Lua scripts in Redis execute atomically, so two servers cannot interleave.</li>
<li><strong>Sliding log</strong>: a sorted set per key with timestamps as scores: <code>ZREMRANGEBYSCORE</code> old entries, <code>ZCARD</code> to count, <code>ZADD</code> the new one, in one MULTI block.</li>
</ul>
<h4>Latency and failure modes</h4>
<p>Every request now pays a Redis round trip (sub-millisecond on the same network). Decide what happens if Redis is down: <strong>fail open</strong> (allow, log loudly) keeps the product up; <strong>fail closed</strong> (reject) protects a fragile backend. Most public APIs fail open with a local fallback limiter.</p>
<h4>Hot keys and sharding</h4>
<p>One very busy client can make one Redis key hot. Shard by hashing the key across Redis nodes (Redis Cluster does this), or split a big client's quota into sub-buckets. Keep the Lua script tiny; Redis is single-threaded per node.</p>
<h4>Layered limits</h4>
<p>Real systems stack limits: per IP (anti-abuse), per user (fairness), per endpoint (protect expensive calls like search), and a global one (protect the database). Evaluate the cheapest first; reject early.</p>
<h4>Client-side manners</h4>
<p>Your SDKs should read <code>Retry-After</code> and back off with jitter. A limiter without cooperative clients just turns a flood of 200s into a flood of 429s.</p>
<h4>Observability</h4>
<p>Emit metrics: allowed vs rejected per policy, top rejected keys, limiter latency. A spike in 429s for one key is either abuse or a broken client you should call.</p>
<h4>Interview angle</h4>
<p>Expect: "Which algorithm and why?", "How does it work across 10 servers?", "What if Redis dies?", "How do you avoid the boundary burst?", "How much memory for 10 million users?" (sliding window counter: 2 ints + key ≈ 60 bytes each ≈ 600 MB, so use Redis with TTL and only store active users).</p>
<div class="callout idea"><p>Token bucket and leaky bucket are the same idea seen from two sides: one counts permissions you have saved up, the other counts work waiting to drain.</p></div>` }
  ],
  flow: {
    title: 'A request meets a token-bucket limiter',
    steps: [
      { title: 'Identify the key', desc: 'Middleware builds the key, e.g. "user:42" from the auth token, or "ip:203.0.113.5" if anonymous.' },
      { title: 'Load bucket state', desc: 'Fetch tokens and lastRefill for the key from memory (or Redis for many servers).' },
      { title: 'Refill lazily', desc: 'tokens += (now - lastRefill) * ratePerSecond, capped at capacity. No background timers needed.' },
      { title: 'Decide', desc: 'If tokens >= 1: subtract one and allow. Otherwise reject.' },
      { title: 'Write back atomically', desc: 'Save tokens and lastRefill under a lock, or inside a Redis Lua script so other servers cannot interleave.' },
      { title: 'Respond', desc: 'Allowed: continue the pipeline and add X-RateLimit-Remaining. Rejected: 429 with Retry-After.' },
      { title: 'Expire idle keys', desc: 'Keys untouched for a while are swept or expire by TTL so memory stays bounded.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Token bucket and sliding window counter, thread-safe, behind one interface', code: `using System.Collections.Concurrent;

public interface IRateLimiter
{
    bool TryAcquire(string key, out TimeSpan retryAfter);
}

// ---------- Token bucket: allows bursts up to capacity, then a steady rate ----------
public class TokenBucketLimiter : IRateLimiter
{
    private sealed class Bucket { public double Tokens; public DateTime LastRefill; public readonly object Gate = new(); }
    private readonly ConcurrentDictionary<string, Bucket> _buckets = new();
    private readonly double _capacity, _refillPerSecond;
    private readonly Func<DateTime> _clock;

    public TokenBucketLimiter(int capacity, double refillPerSecond, Func<DateTime>? clock = null)
    { _capacity = capacity; _refillPerSecond = refillPerSecond; _clock = clock ?? (() => DateTime.UtcNow); }

    public bool TryAcquire(string key, out TimeSpan retryAfter)
    {
        var now = _clock();
        var b = _buckets.GetOrAdd(key, _ => new Bucket { Tokens = _capacity, LastRefill = now });
        lock (b.Gate)
        {
            var elapsed = (now - b.LastRefill).TotalSeconds;
            b.Tokens = Math.Min(_capacity, b.Tokens + elapsed * _refillPerSecond);   // lazy refill
            b.LastRefill = now;
            if (b.Tokens >= 1)
            {
                b.Tokens -= 1;
                retryAfter = TimeSpan.Zero;
                return true;
            }
            retryAfter = TimeSpan.FromSeconds((1 - b.Tokens) / _refillPerSecond);
            return false;
        }
    }

    // Call from a timer to bound memory: drop buckets idle long enough to be full again.
    public void Sweep() { var cutoff = _clock().AddSeconds(-_capacity / _refillPerSecond * 2);
        foreach (var kv in _buckets) if (kv.Value.LastRefill < cutoff) _buckets.TryRemove(kv.Key, out _); }
}

// ---------- Sliding window counter: two counters per key, near-exact, tiny memory ----------
public class SlidingWindowLimiter : IRateLimiter
{
    private sealed class State { public long WindowStartTicks; public int Current; public int Previous; public readonly object Gate = new(); }
    private readonly ConcurrentDictionary<string, State> _states = new();
    private readonly int _limit; private readonly TimeSpan _window; private readonly Func<DateTime> _clock;

    public SlidingWindowLimiter(int limit, TimeSpan window, Func<DateTime>? clock = null)
    { _limit = limit; _window = window; _clock = clock ?? (() => DateTime.UtcNow); }

    public bool TryAcquire(string key, out TimeSpan retryAfter)
    {
        var now = _clock();
        long windowIndex = now.Ticks / _window.Ticks;                   // which fixed window are we in
        long windowStart = windowIndex * _window.Ticks;
        var s = _states.GetOrAdd(key, _ => new State { WindowStartTicks = windowStart });
        lock (s.Gate)
        {
            if (s.WindowStartTicks < windowStart)                        // window rolled over (a late thread never rolls it back)
            {
                bool adjacent = s.WindowStartTicks == windowStart - _window.Ticks;
                s.Previous = adjacent ? s.Current : 0;                   // if we skipped windows, previous is empty
                s.Current = 0;
                s.WindowStartTicks = windowStart;
            }
            double elapsedFraction = (double)(now.Ticks - windowStart) / _window.Ticks;
            double estimate = s.Previous * (1 - elapsedFraction) + s.Current;
            if (estimate < _limit)
            {
                s.Current++;
                retryAfter = TimeSpan.Zero;
                return true;
            }
            retryAfter = TimeSpan.FromTicks(_window.Ticks - (now.Ticks - windowStart));
            return false;
        }
    }
}

// Quick check with a fake clock:
// var t = DateTime.UtcNow; var tb = new TokenBucketLimiter(3, 1, () => t);
// Console.WriteLine(tb.TryAcquire("u1", out _) + " " + tb.TryAcquire("u1", out _) + " " + tb.TryAcquire("u1", out _)); // True True True
// Console.WriteLine(tb.TryAcquire("u1", out var wait) + " wait " + wait.TotalSeconds);   // False wait 1
// t = t.AddSeconds(2); Console.WriteLine(tb.TryAcquire("u1", out _));                     // True (2 tokens refilled)` },
    { lang: 'csharp', title: 'ASP.NET Core: middleware for the custom limiter, plus the built-in rate limiter', code: `using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

// ---- Option A: your own limiter as middleware (per user if signed in, else per IP) ----
public class RateLimitMiddleware
{
    private readonly RequestDelegate _next; private readonly IRateLimiter _limiter;
    public RateLimitMiddleware(RequestDelegate next, IRateLimiter limiter) { _next = next; _limiter = limiter; }

    public async Task InvokeAsync(HttpContext ctx)
    {
        var key = ctx.User.Identity?.IsAuthenticated == true
            ? "user:" + ctx.User.FindFirst("sub")?.Value
            : "ip:" + ctx.Connection.RemoteIpAddress;

        if (!_limiter.TryAcquire(key, out var retryAfter))
        {
            ctx.Response.StatusCode = StatusCodes.Status429TooManyRequests;
            ctx.Response.Headers["Retry-After"] = Math.Ceiling(retryAfter.TotalSeconds).ToString();
            await ctx.Response.WriteAsync("Too many requests. Try again in " + Math.Ceiling(retryAfter.TotalSeconds) + "s.");
            return;
        }
        await _next(ctx);
    }
}
// Program.cs:
// builder.Services.AddSingleton<IRateLimiter>(new TokenBucketLimiter(capacity: 20, refillPerSecond: 5));
// app.UseAuthentication(); app.UseMiddleware<RateLimitMiddleware>();

// ---- Option B: the built-in limiter (.NET 7+), partitioned per user or IP ----
// (This part is Program.cs. Keep the class above in its own file: top-level statements must come before type declarations.)
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("per-user", ctx =>
        RateLimitPartition.GetTokenBucketLimiter(
            partitionKey: ctx.User.Identity?.Name ?? ctx.Connection.RemoteIpAddress?.ToString() ?? "anon",
            factory: _ => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 20,                              // burst
                TokensPerPeriod = 5,                          // sustained: 5 per second
                ReplenishmentPeriod = TimeSpan.FromSeconds(1),
                QueueLimit = 0,                               // reject instead of queueing
                AutoReplenishment = true
            }));

    options.AddSlidingWindowLimiter("search", o =>
    {
        o.PermitLimit = 100; o.Window = TimeSpan.FromMinutes(1); o.SegmentsPerWindow = 6; o.QueueLimit = 0;
    });

    options.OnRejected = async (context, token) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retry))
            context.HttpContext.Response.Headers["Retry-After"] = ((int)retry.TotalSeconds).ToString();
        await context.HttpContext.Response.WriteAsync("Rate limit exceeded", token);
    };
});
var app = builder.Build();
app.UseRateLimiter();
app.MapGet("/orders", () => "ok").RequireRateLimiting("per-user");
app.MapGet("/search", (string q) => "results for " + q).RequireRateLimiting("search");
app.Run();` },
    { lang: 'csharp', title: 'Distributed token bucket with Redis: atomic Lua script called from StackExchange.Redis', code: `using StackExchange.Redis;

public class RedisTokenBucketLimiter : IRateLimiter
{
    private readonly IDatabase _db; private readonly int _capacity; private readonly double _refillPerSecond;

    // Runs atomically on the Redis server: no other client can interleave between read and write.
    private const string Script = @"
        local tokens = tonumber(redis.call('HGET', KEYS[1], 'tokens'))
        local last   = tonumber(redis.call('HGET', KEYS[1], 'last'))
        local now, capacity, rate = tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
        if tokens == nil then tokens = capacity; last = now end
        tokens = math.min(capacity, tokens + (now - last) * rate)
        local allowed = 0
        if tokens >= 1 then tokens = tokens - 1; allowed = 1 end
        redis.call('HSET', KEYS[1], 'tokens', tokens, 'last', now)
        redis.call('EXPIRE', KEYS[1], math.ceil(capacity / rate) * 2)   -- idle keys vanish on their own
        return { allowed, tostring(tokens) }";   // as text: Redis would cut a Lua number down to an integer

    public RedisTokenBucketLimiter(IConnectionMultiplexer redis, int capacity, double refillPerSecond)
    { _db = redis.GetDatabase(); _capacity = capacity; _refillPerSecond = refillPerSecond; }

    public bool TryAcquire(string key, out TimeSpan retryAfter)
    {
        double now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() / 1000.0;
        try
        {
            var result = (RedisResult[])_db.ScriptEvaluate(Script, new RedisKey[] { "rl:" + key },
                             new RedisValue[] { now, _capacity, _refillPerSecond })!;
            bool allowed = (int)result[0] == 1;
            double tokens = (double)result[1];
            retryAfter = allowed ? TimeSpan.Zero : TimeSpan.FromSeconds((1 - tokens) / _refillPerSecond);
            return allowed;
        }
        catch (RedisConnectionException)
        {
            retryAfter = TimeSpan.Zero;
            return true;            // fail open: keep the product up, log and alert. Flip to false for fail closed.
        }
    }
}
// Sliding log alternative (exact, more memory): per key a sorted set of timestamps:
//   ZREMRANGEBYSCORE key 0 (now - window); ZCARD key; if < limit then ZADD key now now; EXPIRE key window` }
  ],
  pitfalls: [
    'Fixed window at the boundary: a client gets up to 2x the limit across two adjacent seconds. Use sliding window or token bucket if that matters.',
    'In-memory limiter behind a load balancer: every server counts separately, so the real limit is N times higher. Use a shared store.',
    'Read-modify-write in Redis without a Lua script or WATCH/MULTI: two servers both see 99, both allow, limit becomes 101.',
    'Never expiring keys: memory grows with every client that ever called. Use TTLs or sweeps.',
    'Rejecting without Retry-After: clients retry immediately and the limiter just changes 200s into 429s.',
    'Limiting by IP only: corporate NATs put thousands of users behind one IP; mobile carriers rotate IPs. Prefer user or API key when authenticated.'
  ],
  quiz: [
    { q: 'Which algorithm allows a burst up to a set size and then a steady rate?', options: ['Fixed window', 'Sliding log', 'Token bucket', 'Leaky bucket'], answer: 2, why: 'A token bucket saves up tokens up to its capacity (the burst) and refills at a constant rate (the sustained limit).' },
    { q: 'What is the weakness of a fixed window limiter?', options: ['It needs a stored timestamp for every single request it has seen', 'A client can get almost double the limit at a window boundary', 'It cannot be implemented in Redis without a Lua script', 'It is slower than a sliding log because it sorts timestamps'], answer: 1, why: 'Requests at the end of one window and the start of the next both count in separate windows, so a short burst of 2x is possible.' },
    { q: 'Why run the token-bucket logic as a Lua script in Redis?', options: ['Because Lua code always runs faster than C# code', 'So read, compute and write run as one atomic step', 'Because Redis cannot store decimal numbers otherwise', 'To avoid having to set a TTL on each bucket key'], answer: 1, why: 'Redis executes a script atomically, so two servers cannot both read the same token count and both allow.' },
    { q: 'What should a rejected response include?', options: ['HTTP 500 and a full stack trace', 'HTTP 429 and a Retry-After header', 'HTTP 404 and no headers at all', 'An empty HTTP 200 with no body or headers'], answer: 1, why: '429 Too Many Requests is the standard status; Retry-After tells well-behaved clients when to come back.' },
    { q: 'An in-memory limiter is set to 100 requests per minute and runs on 5 servers behind a round-robin load balancer. Roughly what limit does a client actually get?', options: ['100', '20', '500', '100 per server but 100 total'], answer: 2, why: 'Each server keeps its own count, so a client can use 100 on each of the 5 servers: about 500 in total.' },
    { q: 'When might you choose "fail open" if the shared store is unreachable?', options: ['Never, because a limiter must always reject when unsure', 'When staying available matters more than strict limits', 'Only for admin users, who are trusted not to abuse it', 'Only when Redis runs on the same machine as the app'], answer: 1, why: 'Fail open keeps users working during a limiter outage; you log loudly and often fall back to a local limiter.' }
  ],
  takeaways: [
    'Token bucket for burst plus sustained rate; sliding window counter for cheap, near-exact quotas.',
    'Fixed windows leak up to 2x at boundaries; sliding log is exact but memory-hungry.',
    'In one process: ConcurrentDictionary plus a per-key lock. Across servers: Redis with an atomic Lua script.',
    'Always return 429 with Retry-After and limit headers; clients must back off with jitter.',
    'Expire idle keys with TTLs; layer limits per IP, user, endpoint and globally.',
    'Decide fail-open vs fail-closed before the store goes down, not after.'
  ],
  interview: [
    { q: 'Design a rate limiter for a public API used by millions of clients.', a: '<p>Key by API key (fallback to IP), token bucket per key with capacity for bursts and a refill rate for the sustained limit. State in Redis Cluster with a Lua script for atomic refill-and-take, TTL so idle keys expire. Middleware at the gateway returns 429 with Retry-After and sends limit headers. Local fallback limiter and fail-open if Redis is unreachable. Metrics on rejections per key.</p>' },
    { q: 'How does a sliding window counter approximate the exact count?', a: '<p>It keeps counts for the current and previous fixed windows and assumes the previous window\'s requests were evenly spread. Estimate = previous x (1 - fraction of current window elapsed) + current. The error is small and memory is two integers per key.</p>' },
    { q: 'Token bucket vs leaky bucket?', a: '<p>Token bucket controls how many requests may be accepted and permits bursts up to capacity. Leaky bucket queues requests and releases them at a constant rate, smoothing bursts; it is better for shaping outgoing traffic than for rejecting incoming abuse.</p>' },
    { q: 'How do you rate limit without hurting legitimate heavy customers?', a: '<p>Tiered limits per plan, separate limits per endpoint so cheap calls do not block expensive ones, and client-visible headers so their SDKs pace themselves. Offer a quota increase path instead of silent blocking.</p>' }
  ]
};

window.CONTENT['m3-case-parking-lot'] = {
  hook: `The parking lot is the "hello world" of LLD interviews: small enough to finish, rich enough to show every design habit you have.`,
  intro: `<p>Design a parking lot sounds simple: cars come in, park, pay, leave. The interview is about what you do with the details: several floors, different spot sizes, different vehicle types, tickets, pricing rules, and two cars arriving at the same second for the last spot.</p>
<p>This case study follows the LLD method from the "Design Problems" lesson: requirements, entities, relationships, interfaces, patterns, walkthrough. Then it gives a complete C# implementation in three parts, and the follow-up questions interviewers add once the basic design works.</p>
<p>By the end you will have a design you can present in 20 minutes and code in 60, and you will know exactly where each pattern earns its place.</p>`,
  realLife: {
    title: 'The mall on a Saturday evening',
    body: `<p>Picture a mall car park with three floors. At the gate, a machine prints a ticket with the time. Inside, signs say which floor has free spots, and painted spots are different sizes: bikes near the pillars, cars in the middle, a few big bays for vans. When you leave, a kiosk reads the ticket, computes the fee by hours, and you pay by card or cash. On a busy evening, two cars race for the last car spot on floor 2; only one gets it, and the display must drop to zero immediately.</p>
<p>Where companies use this: ParkPlus and similar apps run exactly this model with licence plate cameras, and airport parking systems add reservations and pre-paid tiers. Internally the same design shape appears in any "allocate a limited resource" system: hotel rooms, seats, cloud VM slots.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Requirements (say these out loud)</h4>
<ol>
<li>The lot has multiple floors; each floor has many spots.</li>
<li>Spot sizes: Motorcycle, Compact, Large. Vehicle types: Motorcycle, Car, Truck.</li>
<li>A motorcycle can park in any spot; a car in Compact or Large; a truck only in Large.</li>
<li>On entry, the system finds a spot, issues a ticket with entry time and spot id.</li>
<li>On exit, the fee is computed from hours parked and vehicle type; payment by cash or card; spot freed.</li>
<li>A display shows free spots per floor per size.</li>
</ol>
<p><strong>Assumptions:</strong> one entry gate for now; fee rounds up to the next hour; no reservations (asked later as an extension).</p>
<h4>Entities (the nouns)</h4>
<ul>
<li><code>ParkingLot</code>: owns floors, issues tickets, the single entry point.</li>
<li><code>ParkingFloor</code>: owns spots and a display board.</li>
<li><code>ParkingSpot</code>: id, size, occupied or not, which vehicle.</li>
<li><code>Vehicle</code> (abstract) with <code>Motorcycle</code>, <code>Car</code>, <code>Truck</code>.</li>
<li><code>Ticket</code>: id, vehicle, spot, entry time, exit time, fee, status.</li>
<li><code>Payment</code>: ticket, amount, method, status.</li>
</ul>
<h4>Relationships</h4>
<p>Lot 1→many Floors. Floor 1→many Spots. Spot 0..1 Vehicle. Ticket → one Spot and one Vehicle. Payment → one Ticket.</p>
<h4>Interfaces (the verbs)</h4>
<ul>
<li><code>ParkingLot.ParkVehicle(vehicle) → Ticket</code></li>
<li><code>ParkingLot.UnparkVehicle(ticketId, paymentMethod) → Receipt</code></li>
<li><code>ParkingFloor.FindSpot(vehicle)</code>, <code>ParkingFloor.FreeSpots(size)</code></li>
</ul>
<div class="callout tip"><p>The one rule beginners miss: a vehicle knows which spot sizes it <em>can</em> use. Put that on the vehicle (<code>CanFitIn(size)</code>), not in a switch inside the lot.</p></div>` },
    { name: 'Intermediate', body: `<h4>Patterns that earn their place</h4>
<ul>
<li><strong>Strategy for spot allocation</strong>: <code>ISpotAllocationStrategy.FindSpot(floors, vehicle)</code>. Default: first fitting spot on the lowest floor. Alternatives: nearest to entrance, prefer exact size so cars do not steal truck bays.</li>
<li><strong>Strategy for pricing</strong>: <code>IPricingStrategy.Calculate(ticket)</code>. Hourly by vehicle type now; flat rates, weekend rates or first-hour-free later, each a new class.</li>
<li><strong>Factory</strong> for vehicles from the gate input ("CAR MH12AB1234") and for payment methods.</li>
<li><strong>Observer</strong>: floors raise an event when free counts change; the display board subscribes.</li>
<li><strong>Singleton?</strong> Interviewers sometimes expect <code>ParkingLot</code> as a singleton. Say you would rather have one instance injected by the container; a singleton makes tests harder.</li>
</ul>
<h4>States of a ticket</h4>
<p>Active → Paid → Closed (vehicle left). A <code>TicketStatus</code> enum with transitions checked inside <code>Ticket</code> is enough; a full State pattern is overkill here, and saying so is a plus.</p>
<h4>Walkthrough: park and unpark</h4>
<ol>
<li>Gate reads "CAR MH12AB1234"; factory creates a <code>Car</code>.</li>
<li><code>ParkingLot.ParkVehicle</code> asks the allocation strategy for a spot; strategy walks floors and asks each spot <code>vehicle.CanFitIn(spot.Size)</code> and <code>!spot.IsOccupied</code>.</li>
<li>Spot is marked occupied, ticket created, display updated through the event.</li>
<li>On exit, <code>UnparkVehicle(ticketId, PaymentMethod.Card)</code> computes the fee via pricing strategy, processes payment, frees the spot, closes the ticket.</li>
</ol>
<h4>Concurrency: the last spot</h4>
<p>Two gates may call <code>ParkVehicle</code> at the same moment. The find-and-occupy must be atomic. Options: a lock per floor (simple; floors are independent), or <code>Interlocked.CompareExchange</code> on the spot's occupied flag so that only one thread wins. In a database-backed version, an atomic conditional UPDATE (<code>WHERE IsOccupied = 0</code>) is the guard.</p>
<h4>Data structures for speed</h4>
<p>Scanning every spot is O(spots). Keep per floor a queue (or sorted set) of free spot ids per size. Finding a spot becomes O(1): try the exact size first, then larger sizes the vehicle fits in. Free the spot by pushing it back.</p>
<div class="callout warn"><p>Do not store "free count" as a separate number you update by hand in five places. Derive it from the free-spot collections, or update it in exactly one method.</p></div>` },
    { name: 'Expert', body: `<h4>Extension questions and how to answer</h4>
<table><thead><tr><th>Interviewer asks</th><th>Design move</th></tr></thead>
<tbody><tr><td>Multiple entry and exit gates</td><td>Gates are thin clients of the same ParkingLot service; concurrency handled per floor; ticket ids are globally unique (GUID or sequence).</td></tr>
<tr><td>Electric vehicles need charging spots</td><td>New spot size/feature flag and a vehicle capability; allocation strategy prefers charging spots for EVs; pricing adds energy cost.</td></tr>
<tr><td>Reservations</td><td>A Reservation entity holds a spot for a time window; allocation skips reserved spots; a background job releases no-shows.</td></tr>
<tr><td>Monthly pass holders</td><td>IPricingStrategy returns 0 for valid passes; a PassRepository is consulted at exit.</td></tr>
<tr><td>Lost ticket</td><td>Lookup by licence plate (camera at entry stores plate on ticket); a penalty pricing strategy.</td></tr>
<tr><td>Make it a SaaS for many lots</td><td>TenantId/LotId on every entity; the in-memory floors become rows; a service layer with repositories.</td></tr></tbody></table>
<h4>Persistence and the invariant</h4>
<p>Spot occupancy is the invariant that must never break. With a database: <code>UPDATE Spots SET IsOccupied = 1, VehicleId = @v WHERE SpotId = @s AND IsOccupied = 0</code>; rows affected = 0 means someone else won, pick another spot. A unique filtered index on active tickets per spot is the final safety net.</p>
<h4>Events out of the core</h4>
<p><code>VehicleParked</code> and <code>VehicleLeft</code> events feed the display board now, and later a message queue for analytics, licence-plate alerts, or a mobile app's "where is my car". The core never knows who listens.</p>
<h4>Testing the design</h4>
<ul>
<li>Allocation: truck rejected when only compact spots are free; motorcycle takes a motorcycle spot before a car spot.</li>
<li>Pricing: 61 minutes bills as 2 hours; truck rate differs from car rate.</li>
<li>Concurrency: 100 parallel ParkVehicle calls with 10 spots produce exactly 10 tickets and 90 "lot full" results.</li>
</ul>
<h4>Trade-offs to say out loud</h4>
<ul>
<li>Lock per floor is simpler than per spot and almost never contended; choose simple.</li>
<li>Per-size free queues are fast but make "nearest to entrance" harder; a sorted set by distance fixes it at O(log n).</li>
<li>Putting fit rules on Vehicle is clean until rules depend on both vehicle and lot policy; then a policy object owns them.</li>
</ul>
<div class="callout idea"><p>If the interviewer pushes toward HLD ("10,000 lots, mobile app"), pivot: the ParkingLot class becomes a service with a database, gates become clients, and events go to a queue. The class design you built is still the domain model inside that service.</p></div>` }
  ],
  flow: {
    title: 'A car enters and leaves',
    steps: [
      { title: 'Gate input', desc: 'Camera or operator sends "CAR MH12AB1234". VehicleFactory creates a Car object.' },
      { title: 'Find a spot', desc: 'Allocation strategy walks floors; for each floor it checks free queues for sizes the car can fit in (Compact, then Large).' },
      { title: 'Occupy atomically', desc: 'Under the floor lock, pop the spot from the free queue and mark it occupied with the vehicle.' },
      { title: 'Issue ticket', desc: 'Ticket gets an id, the spot, the vehicle and the entry time. The floor raises VehicleParked and the display updates.' },
      { title: 'Exit request', desc: 'Kiosk sends the ticket id. ParkingLot loads the ticket and sets the exit time.' },
      { title: 'Price it', desc: 'IPricingStrategy computes the fee: hours rounded up times the rate for the vehicle type.' },
      { title: 'Pay', desc: 'Payment processor handles cash or card; ticket becomes Paid.' },
      { title: 'Free the spot', desc: 'Spot is cleared and pushed back to the free queue; VehicleLeft event updates the display; ticket is Closed.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Part 1: vehicles, spots, floors (with per-size free queues) and tickets', code: `public enum SpotSize { Motorcycle = 0, Compact = 1, Large = 2 }
public enum VehicleType { Motorcycle, Car, Truck }

public abstract class Vehicle
{
    public string Plate { get; }
    public abstract VehicleType Type { get; }
    protected Vehicle(string plate) => Plate = plate;
    public abstract bool CanFitIn(SpotSize size);            // the fit rule lives on the vehicle
    public abstract IEnumerable<SpotSize> PreferredSizes();  // smallest acceptable first
}
public class Motorcycle : Vehicle
{
    public Motorcycle(string p) : base(p) { }
    public override VehicleType Type => VehicleType.Motorcycle;
    public override bool CanFitIn(SpotSize s) => true;
    public override IEnumerable<SpotSize> PreferredSizes() => new[] { SpotSize.Motorcycle, SpotSize.Compact, SpotSize.Large };
}
public class Car : Vehicle
{
    public Car(string p) : base(p) { }
    public override VehicleType Type => VehicleType.Car;
    public override bool CanFitIn(SpotSize s) => s >= SpotSize.Compact;
    public override IEnumerable<SpotSize> PreferredSizes() => new[] { SpotSize.Compact, SpotSize.Large };
}
public class Truck : Vehicle
{
    public Truck(string p) : base(p) { }
    public override VehicleType Type => VehicleType.Truck;
    public override bool CanFitIn(SpotSize s) => s == SpotSize.Large;
    public override IEnumerable<SpotSize> PreferredSizes() => new[] { SpotSize.Large };
}

public static class VehicleFactory
{
    public static Vehicle Create(string type, string plate) => type.ToUpperInvariant() switch
    {
        "BIKE" or "MOTORCYCLE" => new Motorcycle(plate),
        "CAR" => new Car(plate),
        "TRUCK" => new Truck(plate),
        _ => throw new ArgumentException("Unknown vehicle type " + type)
    };
}

public class ParkingSpot
{
    public string Id { get; }
    public SpotSize Size { get; }
    public int Floor { get; }
    public Vehicle? Vehicle { get; private set; }
    public bool IsOccupied => Vehicle != null;
    public ParkingSpot(string id, SpotSize size, int floor) { Id = id; Size = size; Floor = floor; }
    internal void Occupy(Vehicle v) { if (IsOccupied) throw new InvalidOperationException("Spot " + Id + " taken"); Vehicle = v; }
    internal void Vacate() => Vehicle = null;
}

public class ParkingFloor
{
    public int Number { get; }
    private readonly Dictionary<string, ParkingSpot> _spots = new();
    private readonly Dictionary<SpotSize, Queue<ParkingSpot>> _free = new();
    private readonly object _gate = new();                     // one lock per floor: simple, rarely contended
    public event Action<ParkingFloor>? Changed;                 // Observer hook for the display board

    public ParkingFloor(int number)
    {
        Number = number;
        foreach (SpotSize s in Enum.GetValues<SpotSize>()) _free[s] = new Queue<ParkingSpot>();
    }
    public void AddSpot(ParkingSpot spot) { _spots[spot.Id] = spot; _free[spot.Size].Enqueue(spot); }
    public int FreeCount(SpotSize size) { lock (_gate) return _free[size].Count; }

    // Atomic find-and-occupy. Returns null if nothing fits.
    public ParkingSpot? TryOccupy(Vehicle v)
    {
        lock (_gate)
        {
            foreach (var size in v.PreferredSizes())
            {
                if (_free[size].Count == 0) continue;
                var spot = _free[size].Dequeue();
                spot.Occupy(v);
                Changed?.Invoke(this);
                return spot;
            }
            return null;
        }
    }
    public void Release(ParkingSpot spot)
    {
        lock (_gate) { spot.Vacate(); _free[spot.Size].Enqueue(spot); }
        Changed?.Invoke(this);
    }
}

public enum TicketStatus { Active, Paid, Closed }
public class Ticket
{
    public string Id { get; } = Guid.NewGuid().ToString("N")[..10].ToUpperInvariant();
    public Vehicle Vehicle { get; }
    public ParkingSpot Spot { get; }
    public DateTime EntryAt { get; }
    public DateTime? ExitAt { get; private set; }
    public decimal Fee { get; private set; }
    public TicketStatus Status { get; private set; } = TicketStatus.Active;
    public Ticket(Vehicle v, ParkingSpot s, DateTime entryAt) { Vehicle = v; Spot = s; EntryAt = entryAt; }
    internal void MarkPaid(DateTime exitAt, decimal fee)
    { if (Status != TicketStatus.Active) throw new InvalidOperationException("Ticket not active"); ExitAt = exitAt; Fee = fee; Status = TicketStatus.Paid; }
    internal void Close() { if (Status != TicketStatus.Paid) throw new InvalidOperationException("Ticket not paid"); Status = TicketStatus.Closed; }
}` },
    { lang: 'csharp', title: 'Part 2: allocation strategy, pricing strategy, payments and the ParkingLot facade', code: `using System.Collections.Concurrent;

public interface ISpotAllocationStrategy { ParkingSpot? Allocate(IReadOnlyList<ParkingFloor> floors, Vehicle v); }

public class LowestFloorFirst : ISpotAllocationStrategy
{
    public ParkingSpot? Allocate(IReadOnlyList<ParkingFloor> floors, Vehicle v)
    {
        foreach (var floor in floors.OrderBy(f => f.Number))
        {
            var spot = floor.TryOccupy(v);
            if (spot != null) return spot;
        }
        return null;
    }
}

public interface IPricingStrategy { decimal Calculate(Ticket t, DateTime exitAt); }

public class HourlyByVehicleType : IPricingStrategy
{
    private readonly Dictionary<VehicleType, decimal> _ratePerHour;
    public HourlyByVehicleType(Dictionary<VehicleType, decimal> rates) => _ratePerHour = rates;
    public decimal Calculate(Ticket t, DateTime exitAt)
    {
        var hours = (int)Math.Ceiling((exitAt - t.EntryAt).TotalMinutes / 60.0);   // round up, min 1 hour
        return Math.Max(1, hours) * _ratePerHour[t.Vehicle.Type];
    }
}
public class FirstHourFree : IPricingStrategy                  // decorator-style extension, no core change
{
    private readonly IPricingStrategy _inner;
    public FirstHourFree(IPricingStrategy inner) => _inner = inner;
    public decimal Calculate(Ticket t, DateTime exitAt)
        => (exitAt - t.EntryAt) <= TimeSpan.FromHours(1) ? 0m : _inner.Calculate(t, exitAt);
}

public enum PaymentMethod { Cash, Card }
public record Payment(string TicketId, decimal Amount, PaymentMethod Method, DateTime PaidAt, bool Success);

public interface IPaymentProcessor { Payment Pay(Ticket t, decimal amount, PaymentMethod method); }
public class SimplePaymentProcessor : IPaymentProcessor
{
    public Payment Pay(Ticket t, decimal amount, PaymentMethod method)
        => new(t.Id, amount, method, DateTime.UtcNow, Success: true);   // a real one calls a card gateway here
}

public class ParkingException : Exception { public ParkingException(string m) : base(m) { } }

public class ParkingLot
{
    private readonly List<ParkingFloor> _floors = new();
    private readonly ConcurrentDictionary<string, Ticket> _tickets = new();
    private readonly ConcurrentDictionary<string, string> _ticketByPlate = new();   // lost-ticket lookup
    private readonly ISpotAllocationStrategy _allocation;
    private readonly IPricingStrategy _pricing;
    private readonly IPaymentProcessor _payments;
    private readonly Func<DateTime> _clock;
    public event Action<Ticket>? VehicleParked;
    public event Action<Ticket>? VehicleLeft;

    public ParkingLot(ISpotAllocationStrategy allocation, IPricingStrategy pricing, IPaymentProcessor payments, Func<DateTime>? clock = null)
    { _allocation = allocation; _pricing = pricing; _payments = payments; _clock = clock ?? (() => DateTime.UtcNow); }

    public void AddFloor(ParkingFloor f) => _floors.Add(f);
    public IReadOnlyList<ParkingFloor> Floors => _floors;

    public Ticket ParkVehicle(Vehicle v)
    {
        if (_ticketByPlate.ContainsKey(v.Plate)) throw new ParkingException("Vehicle " + v.Plate + " is already parked");
        var spot = _allocation.Allocate(_floors, v) ?? throw new ParkingException("Lot full for " + v.Type);
        var ticket = new Ticket(v, spot, _clock());
        _tickets[ticket.Id] = ticket;
        _ticketByPlate[v.Plate] = ticket.Id;
        VehicleParked?.Invoke(ticket);
        return ticket;
    }

    public (Ticket ticket, Payment payment) UnparkVehicle(string ticketId, PaymentMethod method)
    {
        var ticket = _tickets.GetValueOrDefault(ticketId) ?? throw new ParkingException("Unknown ticket " + ticketId);
        var exitAt = _clock();
        var fee = _pricing.Calculate(ticket, exitAt);
        var payment = _payments.Pay(ticket, fee, method);
        if (!payment.Success) throw new ParkingException("Payment failed");
        ticket.MarkPaid(exitAt, fee);
        _floors[ticket.Spot.Floor].Release(ticket.Spot);
        ticket.Close();
        _ticketByPlate.TryRemove(ticket.Vehicle.Plate, out _);
        VehicleLeft?.Invoke(ticket);
        return (ticket, payment);
    }

    public Ticket? FindByPlate(string plate)
        => _ticketByPlate.TryGetValue(plate, out var id) ? _tickets[id] : null;
}` },
    { lang: 'csharp', title: 'Part 3: display board, demo, and a concurrency test for the last spot', code: `public class DisplayBoard
{
    public DisplayBoard(ParkingLot lot)
    {
        foreach (var f in lot.Floors) f.Changed += Render;
    }
    private void Render(ParkingFloor f)
        => Console.WriteLine("Floor " + f.Number + " | bike " + f.FreeCount(SpotSize.Motorcycle)
                           + " | compact " + f.FreeCount(SpotSize.Compact) + " | large " + f.FreeCount(SpotSize.Large));
}

public static class Demo
{
    public static void Run()
    {
        var now = new DateTime(2026, 11, 5, 10, 0, 0, DateTimeKind.Utc);
        var lot = new ParkingLot(
            new LowestFloorFirst(),
            new HourlyByVehicleType(new() { [VehicleType.Motorcycle] = 10m, [VehicleType.Car] = 30m, [VehicleType.Truck] = 60m }),
            new SimplePaymentProcessor(),
            () => now);

        for (int f = 0; f < 2; f++)
        {
            var floor = new ParkingFloor(f);
            floor.AddSpot(new ParkingSpot("F" + f + "-M1", SpotSize.Motorcycle, f));
            floor.AddSpot(new ParkingSpot("F" + f + "-C1", SpotSize.Compact, f));
            floor.AddSpot(new ParkingSpot("F" + f + "-C2", SpotSize.Compact, f));
            floor.AddSpot(new ParkingSpot("F" + f + "-L1", SpotSize.Large, f));
            lot.AddFloor(floor);
        }
        var board = new DisplayBoard(lot);

        var t1 = lot.ParkVehicle(VehicleFactory.Create("CAR", "MH12AB1234"));    // F0-C1
        var t2 = lot.ParkVehicle(VehicleFactory.Create("TRUCK", "MH14XY0001")); // F0-L1
        var t3 = lot.ParkVehicle(VehicleFactory.Create("CAR", "MH12CD5678"));    // F0-C2
        var t4 = lot.ParkVehicle(VehicleFactory.Create("CAR", "MH12EF9999"));    // F1-C1 (F0 compact full, F0 large taken)
        Console.WriteLine(t1.Spot.Id + " " + t2.Spot.Id + " " + t3.Spot.Id + " " + t4.Spot.Id);

        try { lot.ParkVehicle(VehicleFactory.Create("TRUCK", "MH14ZZ0002")); }   // F1-L1 free -> ok
        catch (ParkingException e) { Console.WriteLine(e.Message); }

        now = now.AddMinutes(125);                                               // 2h05 -> bills 3 hours
        var (ticket, payment) = lot.UnparkVehicle(t1.Id, PaymentMethod.Card);
        Console.WriteLine("Car fee " + ticket.Fee + " paid by " + payment.Method);  // Car fee 90 paid by Card
    }
}

// xUnit: 100 parallel cars, 10 compact spots -> exactly 10 tickets, 90 "lot full"
public class ParkingLotConcurrencyTests
{
    [Fact]
    public void Only_one_car_wins_each_spot()
    {
        var lot = new ParkingLot(new LowestFloorFirst(),
            new HourlyByVehicleType(new() { [VehicleType.Car] = 30m, [VehicleType.Motorcycle] = 10m, [VehicleType.Truck] = 60m }),
            new SimplePaymentProcessor());
        var floor = new ParkingFloor(0);
        for (int i = 0; i < 10; i++) floor.AddSpot(new ParkingSpot("C" + i, SpotSize.Compact, 0));
        lot.AddFloor(floor);

        int parked = 0, rejected = 0;
        Parallel.For(0, 100, i =>
        {
            try { lot.ParkVehicle(new Car("PL" + i)); Interlocked.Increment(ref parked); }
            catch (ParkingException) { Interlocked.Increment(ref rejected); }
        });

        Assert.Equal(10, parked);
        Assert.Equal(90, rejected);
        Assert.Equal(0, floor.FreeCount(SpotSize.Compact));
    }
}` }
  ],
  pitfalls: [
    'A giant switch in ParkingLot deciding which vehicle fits where. Put CanFitIn and PreferredSizes on the vehicle.',
    'Finding a spot and then occupying it in two separate steps without a lock. Two cars get the same spot.',
    'Scanning every spot on every entry. Keep per-size free queues per floor.',
    'Hard-coding prices inside UnparkVehicle. Pricing is the rule most likely to change; make it a strategy.',
    'Making ParkingLot a static singleton. It blocks tests and multi-lot support; inject one instance instead.',
    'Forgetting the vehicle-already-parked and unknown-ticket cases. Interviewers try them first.'
  ],
  quiz: [
    { q: 'Where should the rule "a truck only fits in a Large spot" live?', options: ['In a switch on vehicle type inside ParkingLot', 'On the Vehicle class (CanFitIn / PreferredSizes)', 'In the display board, next to the free-spot counts', 'In the payment processor, checked at exit time'], answer: 1, why: 'The vehicle knows what it needs. Putting the rule on Vehicle keeps ParkingLot free of type switches and makes new vehicle types a single new class.' },
    { q: 'Why keep per-size free-spot queues on each floor?', options: ['To keep a history of every vehicle that used each spot', 'So finding a spot is O(1) instead of scanning every spot', 'Because Queue is thread-safe by default, so no lock is needed', 'To store ticket history for the pricing strategy'], answer: 1, why: 'Dequeue from the queue for the preferred size is constant time; scanning all spots is linear in lot size.' },
    { q: 'What prevents two cars from getting the same last spot?', options: ['A code comment telling gates to take turns', 'An atomic find-and-occupy under a per-floor lock', 'Sorting the spots by id before every search', 'A slower gate so that cars never arrive together'], answer: 1, why: 'The lock makes dequeue + occupy one indivisible step; the second thread sees an empty queue.' },
    { q: 'Which pattern makes "first hour free" a five-minute change?', options: ['A Singleton ParkingLot with a static price field', 'IPricingStrategy wrapped by a FirstHourFree class', 'A new TicketStatus enum value called FreeHour', 'Changing the Ticket constructor to take a discount flag'], answer: 1, why: 'Pricing is a strategy; wrapping the existing one with a new class adds the rule without touching UnparkVehicle.' },
    { q: 'How does a database-backed version guard spot occupancy?', options: ['By reading the row first, then writing it back in a second query', 'With UPDATE ... WHERE IsOccupied = 0 and checking rows affected', 'By using a GUID as the spot id so that collisions cannot happen', 'By disabling indexes on the Spots table during busy hours'], answer: 1, why: 'A conditional update is atomic in the database; zero rows affected means another gate won, so pick another spot.' },
    { q: 'A car enters at 10:00 and leaves at 12:05 with a rate of 30 per hour rounded up. What is the fee?', options: ['60', '62.5', '90', '30'], answer: 2, why: '2 hours and 5 minutes rounds up to 3 hours; 3 x 30 = 90.' }
  ],
  takeaways: [
    'Entities: Lot, Floor, Spot, Vehicle (abstract), Ticket, Payment; fit rules live on Vehicle.',
    'Strategies for allocation and pricing; events for the display; factory for vehicles.',
    'Per-floor lock plus per-size free queues gives atomic, O(1) allocation.',
    'Ticket status transitions are checked inside Ticket; no full State pattern needed.',
    'Extensions (EV spots, reservations, passes, lost tickets) each map to one new class or entity.',
    'A database version uses a conditional UPDATE and a filtered unique index as the invariant guard.'
  ],
  interview: [
    { q: 'Walk me through your parking lot classes in two minutes.', a: '<p>ParkingLot is the facade: ParkVehicle and UnparkVehicle. It holds floors; each floor holds spots and per-size free queues under one lock. Vehicle subclasses know which sizes they fit. An allocation strategy picks a spot; a pricing strategy computes the fee; a payment processor handles cash or card. Ticket tracks entry, exit, fee and status. Floors raise Changed events that the display board subscribes to.</p>' },
    { q: 'How do you handle two cars arriving at the last spot at the same time?', a: '<p>Find-and-occupy is one atomic step under the floor lock, so the second caller sees no free spot and gets a "lot full" result. With a database, an UPDATE with WHERE IsOccupied = 0 and a check on rows affected does the same, backed by a unique index on active tickets per spot.</p>' },
    { q: 'How would you add reservations?', a: '<p>A Reservation entity (spot, plate, start, end). The allocation strategy skips spots with an active reservation unless the arriving plate matches. A background job releases reservations after a grace period. Pricing can add a reservation fee through the strategy.</p>' },
    { q: 'Would you make ParkingLot a singleton?', a: '<p>I would keep one instance per lot and inject it, rather than a static singleton. That allows multiple lots in one process and makes tests easy. If the interviewer insists on the pattern, I would mention that a DI container\'s singleton lifetime gives the same guarantee without global state.</p>' }
  ]
};
