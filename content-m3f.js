// DevPath content: Module 3 part F (HLD) — replication & sharding, microservices, queues, API design, real-life systems.
window.CONTENT = window.CONTENT || {};

/* ───────────────────────── m3-replication-sharding ───────────────────────── */
window.CONTENT['m3-replication-sharding'] = {
  hook: `One database server can only get so big and can only die once. Replication gives you copies so you survive a crash; sharding gives you pieces so you survive growth.`,
  intro: `<p>When an app is small, one database does everything. Every read and every write goes to the same machine. That works until two things happen: the machine fails, or the machine becomes too busy. <span class="term">Replication</span> and <span class="term">sharding</span> are the two answers.</p>
<p><strong>Replication</strong> means keeping the <em>same</em> data on more than one server. If one copy dies, another is still there. Extra copies can also answer read queries, so reads get faster.</p>
<p><strong>Sharding</strong> means splitting the data into <em>different</em> pieces (shards) and putting each piece on its own server. No single server holds everything, so you can keep growing by adding servers.</p>
<p>Both sound simple. The hard parts are the moments in between: the few milliseconds a copy is behind, the hour a server is dead, the day you need to move data to a new shard. This lesson is about those moments.</p>`,
  realLife: {
    title: 'The library with photocopies and branch buildings',
    body: `<p>Imagine a city library. At first there is one building with every book. People queue, and if the building floods, every book is gone.</p>
<p>The library makes <strong>photocopies</strong> of every book and opens reading rooms across town. That is replication. Anyone can read in any room. But only the main building accepts new books, and it takes a little time for the copies to reach the reading rooms. If you donate a book and run to a reading room, it may not be there yet. That delay is <em>replication lag</em>.</p>
<p>Later the collection becomes too big for any one building. The library splits it: A–H goes to the north branch, I–P to the east, Q–Z to the south. That is sharding. Finding one book is easy if you know its title. Finding "every book published in 1999" means visiting all three branches. That is a <em>cross-shard query</em>.</p>
<p>Where real companies use this: Instagram shards user data by user id into thousands of logical shards spread over PostgreSQL servers; many banks with a .NET back end run SQL Server with read replicas (Always On availability groups) so reports do not slow down payments; Azure Cosmos DB and MongoDB shard automatically by a key you choose.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Why one database is not enough</h4>
<p>A single database server has three limits: it can store only so much, it can handle only so many queries per second, and it can crash. Replication attacks the second and third limits. Sharding attacks the first and second.</p>
<h4>Replication in pictures</h4>
<p>The most common setup is <span class="term">leader-follower</span> (also called primary-replica, or the older master-slave). One server is the <strong>leader</strong>. All writes go to it. The leader sends every change to one or more <strong>followers</strong>, which apply the same changes in the same order. Followers can serve reads.</p>
<ul>
  <li><strong>Write:</strong> app → leader → copied to followers.</li>
  <li><strong>Read:</strong> app → any follower (or the leader if you need the very latest data).</li>
  <li><strong>Failure:</strong> if the leader dies, one follower is promoted to leader. This is called <span class="term">failover</span>.</li>
</ul>
<h4>Sync or async copying?</h4>
<p>With <strong>synchronous</strong> replication the leader waits until a follower confirms the write before telling the app "done". Nothing is ever lost, but every write is slower and if the follower is down, writes stop. With <strong>asynchronous</strong> replication the leader answers right away and copies in the background. It is fast, but if the leader dies in that gap the latest writes are lost. Most systems use one sync follower plus several async followers.</p>
<h4>Sharding in pictures</h4>
<p>You pick a <span class="term">shard key</span>, a column that decides which server a row lives on. A common choice is the user id. Rows for user 17 always go to the same shard. The app (or a router in front of the databases) looks at the key and sends the query to the right place.</p>
<div class="callout tip"><p>Rule of thumb: replicate first, shard last. Replication is a configuration change. Sharding changes how your application code thinks about data and is hard to undo.</p></div>
<h4>Words you will hear</h4>
<table><thead><tr><th>Word</th><th>Means</th></tr></thead><tbody>
<tr><td>Replica</td><td>A copy of the data on another server</td></tr>
<tr><td>Lag</td><td>How far behind a replica is (milliseconds to minutes)</td></tr>
<tr><td>Failover</td><td>Switching to a replica when the leader dies</td></tr>
<tr><td>Shard / partition</td><td>One slice of the data, stored separately</td></tr>
<tr><td>Hot shard</td><td>One shard getting far more traffic than the others</td></tr>
</tbody></table>` },
    { name: 'Intermediate', body: `<h4>Living with replication lag</h4>
<p>Async replicas are behind by some amount, usually milliseconds, sometimes seconds under load. That creates three classic bugs:</p>
<ul>
  <li><strong>Read-your-writes:</strong> a user saves their profile, the page reloads from a replica, and the old name appears. Fix: after a write, read from the leader for that user for a few seconds, or route by "last write time" stored in the user's session.</li>
  <li><strong>Monotonic reads:</strong> the user refreshes twice, hits two different replicas, and sees new data then old data (time appears to go backwards). Fix: pin a user to one replica (hash the user id to choose the replica).</li>
  <li><strong>Consistent prefix:</strong> replies appear before the question they answer. Fix: keep causally related rows on the same shard/replica stream.</li>
</ul>
<h4>Multi-leader replication</h4>
<p>Sometimes writes must be accepted in two regions (say India and Europe) so each is fast locally. Both act as leaders and copy to each other. The price is <span class="term">write conflicts</span>: both regions update the same row at the same time. You need a rule: last-writer-wins by timestamp (loses data silently), merge by field, or ask the application to resolve. Use multi-leader only when you truly need multi-region writes.</p>
<h4>Choosing a shard key</h4>
<p>The key decides everything. A good key spreads load evenly, keeps data that is queried together on the same shard, and rarely changes.</p>
<div class="compare"><div><h5>Range sharding</h5><p>Shard 1 holds ids 1–1M, shard 2 holds 1M–2M. Range queries are cheap ("orders from last week" if sharded by date). Danger: new rows all land on the last shard, creating a hot spot.</p></div><div><h5>Hash sharding</h5><p>Shard = hash(key) mod N. Load spreads evenly. Danger: range queries must hit every shard, and changing N remaps almost every row (see the Consistent Hashing lesson for the fix).</p></div></div>
<h4>Cross-shard operations</h4>
<p>A query without the shard key ("find all orders over 10,000") must be sent to every shard and the results merged: <span class="term">scatter-gather</span>. It works, but it is N times the cost. A transaction touching two shards needs two-phase commit or a saga (see Transactions in Distributed Systems). Design the schema so the common path stays on one shard: keep a customer and their orders together, sharded by customer id.</p>
<h4>SQL Server and .NET specifics</h4>
<p>SQL Server's <strong>Always On availability groups</strong> give you one primary and readable secondaries with automatic failover. In a connection string, <code>ApplicationIntent=ReadOnly</code> asks the listener to route the connection to a secondary. In EF Core, a simple pattern is two DbContexts (or two connection strings): one for writes, one for reads. Azure SQL Database offers read scale-out the same way. For sharding, Elastic Database tools (shard map manager) exist, but many teams shard at the application layer instead.</p>
<div class="callout warn"><p>Never put a report that joins ten tables on the primary. That is exactly what readable secondaries are for.</p></div>` },
    { name: 'Expert', body: `<h4>How replication actually moves data</h4>
<p>Three mechanisms exist. <strong>Statement-based</strong> ships the SQL text; it breaks on non-deterministic functions like NOW(). <strong>Write-ahead log (WAL) shipping</strong> ships the physical log bytes; exact, but ties leader and follower to the same engine version. <strong>Logical (row-based)</strong> replication ships "row X changed from A to B"; flexible, supports different versions and selective tables, and is what change-data-capture tools (Debezium) tap into. SQL Server availability groups ship transaction log blocks; PostgreSQL offers both physical and logical.</p>
<h4>Failover is where data is lost</h4>
<p>Automatic failover has to answer "is the leader dead, or just slow?" A timeout that is too short causes needless failovers under load; too long means minutes of downtime. After promotion, the old leader may come back with writes the new leader never saw. These are usually discarded (data loss) unless you used sync replication. A worse case is <span class="term">split brain</span>: two servers both believe they are leader and accept writes. Fencing (shut the old leader down, revoke its credentials) and quorum (a majority of nodes must agree) prevent it. This is why availability groups need an odd number of voters or a witness.</p>
<h4>Quorum reads and writes</h4>
<p>Leaderless systems (Cassandra, DynamoDB-style) write to W replicas and read from R replicas out of N total. If W + R &gt; N, every read overlaps at least one up-to-date copy. Typical: N=3, W=2, R=2. You tune W and R per request to trade latency for consistency.</p>
<h4>Resharding without downtime</h4>
<p>You cannot stop the world to move data. The usual approach uses many more logical partitions than physical servers (say 4096 virtual shards on 16 servers). Moving a virtual shard: start double-writing to old and new location, copy history in the background, verify counts and checksums, flip reads, stop writing to the old location. Consistent hashing or a directory service (a lookup table: shard id → server) makes this possible. Directory-based routing is the most flexible and the most common at scale; the directory itself must be highly available and cached.</p>
<h4>Hot shards and celebrity keys</h4>
<p>Hashing spreads keys, not traffic. One user with 50 million followers overloads whichever shard they land on. Fixes: salt the key for hot entities (split one key into "key#1".."key#10" and merge on read), cache the hot rows aggressively, or move hot keys to dedicated shards. Monitor per-shard p99 latency, not just averages.</p>
<h4>Global secondary indexes</h4>
<p>Looking up a user by email when the shard key is user id requires either scatter-gather or a separate index table sharded by email that maps email → user id. That index is itself a sharded table with its own consistency problem (updated asynchronously, so a moment of staleness). DynamoDB and Cosmos DB build this for you; with SQL you build it yourself.</p>
<div class="callout idea"><p>Interview angle: "How would you shard this?" is really asking "what is the access pattern?" Start by listing the top three queries, pick the key that keeps each on one shard, then explain what you do about the queries that cannot.</p></div>
<h4>Failure modes to name in a design review</h4>
<ul>
  <li>Replica lag spikes during bulk loads: reads see stale data for minutes.</li>
  <li>Failover during a deployment: connection pools hold dead connections; need retry with fresh connections.</li>
  <li>Shard key chosen on tenant id: one huge tenant becomes a hot shard.</li>
  <li>Cross-shard joins creep into code "just this once" and become the slowest endpoint.</li>
</ul>` }
  ],
  flow: {
    title: 'A write and a read in a leader-follower setup',
    steps: [
      { title: 'App sends write', desc: 'The API updates a user profile. The connection string points at the leader, so the UPDATE goes there.' },
      { title: 'Leader commits', desc: 'The leader writes the change to its transaction log and (with async replication) tells the app "done" immediately.' },
      { title: 'Log shipped', desc: 'The log record is streamed to each follower over the network. This takes a few milliseconds.' },
      { title: 'Followers apply', desc: 'Each follower replays the change in the same order. Until it does, the follower is "behind" — that gap is replication lag.' },
      { title: 'App sends read', desc: 'The profile page loads. The read connection uses ApplicationIntent=ReadOnly and is routed to a follower.' },
      { title: 'Stale or fresh?', desc: 'If the follower already applied the change, the user sees the new name. If not, they see the old one — the read-your-writes problem.' },
      { title: 'Fix applied', desc: 'For a few seconds after a write, this user’s reads are sent to the leader. After that, followers are safe again.' },
      { title: 'Leader dies', desc: 'Health checks fail. The most up-to-date follower is promoted, the listener points at it, and apps reconnect. Un-replicated writes are lost.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Read/write splitting with EF Core and read-your-writes routing', code: `using Microsoft.EntityFrameworkCore;

// Two contexts over the same model: one for writes (primary), one for reads (replica).
public sealed class WriteDbContext(DbContextOptions<WriteDbContext> o) : AppDbContextBase(o) { }
public sealed class ReadDbContext(DbContextOptions<ReadDbContext> o) : AppDbContextBase(o)
{
    protected override void OnConfiguring(DbContextOptionsBuilder b)
        => b.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking); // reads never save
}

// Program.cs
// builder.Services.AddDbContext<WriteDbContext>(o => o.UseSqlServer(cfg["Db:Primary"]));
// builder.Services.AddDbContext<ReadDbContext>(o => o.UseSqlServer(cfg["Db:Replica"]));
// Replica connection string ends with: ;ApplicationIntent=ReadOnly   (Always On listener routes it)

// Remembers who wrote recently so their next reads go to the primary.
public sealed class RecentWriterTracker
{
    private readonly Dictionary<int, DateTime> _lastWrite = new();
    private static readonly TimeSpan Window = TimeSpan.FromSeconds(5); // > typical replica lag
    private readonly object _lock = new();

    public void MarkWrote(int userId) { lock (_lock) _lastWrite[userId] = DateTime.UtcNow; }
    public bool WroteRecently(int userId)
    {
        lock (_lock)
            return _lastWrite.TryGetValue(userId, out var t) && DateTime.UtcNow - t < Window;
    }
}

public sealed class ProfileService(WriteDbContext write, ReadDbContext read, RecentWriterTracker tracker)
{
    public async Task RenameAsync(int userId, string newName)
    {
        var user = await write.Users.SingleAsync(u => u.Id == userId);
        user.Name = newName;
        await write.SaveChangesAsync();
        tracker.MarkWrote(userId);                 // this user must read from primary for a while
    }

    public Task<UserDto?> GetProfileAsync(int userId)
    {
        // Pick the context that is guaranteed fresh enough for THIS user.
        IQueryable<User> source = tracker.WroteRecently(userId) ? write.Users : read.Users;
        return source.Where(u => u.Id == userId)
                     .Select(u => new UserDto(u.Id, u.Name))
                     .SingleOrDefaultAsync();
    }
}

public record UserDto(int Id, string Name);` },
    { lang: 'csharp', title: 'Application-level shard routing (hash + directory)', code: `// A tiny shard router. Real systems add: a cached directory, health checks, and migration state.
public sealed class ShardRouter
{
    private readonly string[] _connectionStrings;           // physical servers
    private readonly int[] _virtualToPhysical;              // 4096 virtual shards -> server index

    public ShardRouter(string[] connectionStrings, int virtualShards = 4096)
    {
        _connectionStrings = connectionStrings;
        _virtualToPhysical = new int[virtualShards];
        for (int v = 0; v < virtualShards; v++)
            _virtualToPhysical[v] = v % connectionStrings.Length; // initial even spread
    }

    // Stable hash: never use string.GetHashCode() for routing — it changes per process in .NET Core.
    private static uint Fnv1a(string key)
    {
        uint h = 2166136261;
        foreach (char c in key) { h ^= c; h *= 16777619; }
        return h;
    }

    public int VirtualShardOf(string shardKey) => (int)(Fnv1a(shardKey) % (uint)_virtualToPhysical.Length);

    public string ConnectionStringFor(string shardKey)
        => _connectionStrings[_virtualToPhysical[VirtualShardOf(shardKey)]];

    // Resharding: move ONE virtual shard to another server (after its data has been copied).
    public void MoveVirtualShard(int virtualShard, int newPhysicalIndex)
        => _virtualToPhysical[virtualShard] = newPhysicalIndex;
}

// Usage: every query that knows the customer id goes to exactly one database.
// var cs = router.ConnectionStringFor(customerId.ToString());
// await using var conn = new SqlConnection(cs);
// Queries WITHOUT the shard key must fan out to all servers and merge (scatter-gather):
// var tasks = allConnectionStrings.Select(cs => QueryBigOrdersAsync(cs));
// var merged = (await Task.WhenAll(tasks)).SelectMany(x => x).OrderByDescending(o => o.Total);` },
    { lang: 'text', title: 'Capacity sketch: when do you need to shard?', code: `Example: order system, SQL Server on one large VM

Writes:   2,000 orders/sec peak  x 3 rows each (order, items, payment)  = 6,000 row writes/sec
Reads:   20,000 reads/sec peak (10:1 read/write ratio is common)
Storage:  2,000/sec x 86,400 sec/day x ~2 KB per order ~= 345 GB/day of raw data at peak rate
          (real average is lower; say 5 TB/year after indexes)

Single primary can usually sustain tens of thousands of simple ops/sec,
so step 1 is NOT sharding:

  1. Add 2-3 readable secondaries  -> reads leave the primary (20k reads/sec spread out)
  2. Add a cache in front (Redis)   -> hot reads never reach a database
  3. Archive old orders (> 2 years) to cheap storage -> working set stays small

Shard only when ONE of these is true:
  - write rate exceeds what one primary can commit (log write throughput is the ceiling)
  - working data no longer fits in RAM + fast disk of the biggest box you can buy
  - a single failure domain is not acceptable for the business (regulatory / regional)

If you shard: key = CustomerId (orders, items, payments all share it),
              4096 virtual shards, start with 4 physical servers, each with its own replicas.
Cross-shard: reporting goes to a separate warehouse fed by CDC, never to the shards.` }
  ],
  pitfalls: [
    'Reading from a replica right after a write and wondering why the data is "missing". Route post-write reads to the primary for a few seconds.',
    'Choosing a shard key that changes (like country or email). Moving a row between shards is a migration, not an update.',
    'Range sharding by date or auto-increment id. Every new row lands on the last shard; it melts while the others sit idle.',
    'Assuming failover is instant and lossless. Async replicas can lose the last writes; connection pools keep dead connections until retried.',
    'Letting cross-shard joins into application code "temporarily". They become the slowest, most fragile endpoints.',
    'Using string.GetHashCode() for routing in .NET. It is randomized per process, so two servers route the same key to different shards.'
  ],
  quiz: [
    { q: 'A user updates their name, the page refreshes and shows the old name. There is no cache in this system. The most likely cause is?', options: ['The write went to a follower, which silently threw it away', 'The read went to an async replica that had not applied it yet', 'The shard key was wrong, so the row moved to another shard', 'The leader rolled the write back after the page reloaded'], answer: 1, why: 'This is the read-your-writes problem: async replicas lag the leader by a little, and a read that lands there sees old data.' },
    { q: 'Which choice avoids a hot spot on the newest data?', options: ['Range sharding by order date', 'Hash sharding by customer id', 'Putting all shards on one server', 'Sync replication'], answer: 1, why: 'Hashing spreads keys evenly. Range sharding by date sends every new row to the last range, so one shard gets all the writes.' },
    { q: 'Synchronous replication mainly trades what for what?', options: ['More storage on every follower in return for faster reads', 'Slower writes and lower availability for no data loss on failover', 'Slower reads on the leader in return for faster follower writes', 'Weaker consistency in return for a lower hosting cost'], answer: 1, why: 'The leader waits for a follower to confirm, so writes are slower and stop if that follower is down, but nothing committed can be lost.' },
    { q: 'Why use many more virtual shards than physical servers?', options: ['It makes the hash function faster because the numbers are smaller', 'So you can move small slices without rehashing every key', 'It reduces total storage because empty shards take no disk space', 'Databases refuse to start with fewer than 1024 shards'], answer: 1, why: 'Moving one virtual shard to a new server changes only that slice. With a plain hash mod N, changing N would move almost every key.' },
    { q: 'What is split brain?', options: ['A query that has to be sent to two shards and then merged', 'Two servers both acting as leader and accepting writes', 'A replica that has applied only half of the leader log', 'A migration that stopped halfway between two shards'], answer: 1, why: 'After a bad failover both nodes may believe they are leader. Fencing and quorum voting prevent it.' },
    { q: 'A query that does not include the shard key must usually…', options: ['Fail with an error until the caller adds the key', 'Go to the leader, which knows where every row lives', 'Be sent to every shard and have results merged', 'Run inside a two-phase commit transaction'], answer: 2, why: 'Without the key the router cannot pick one shard, so it scatters the query to all shards and gathers the results.' }
  ],
  takeaways: [
    'Replication = same data on more servers (survive failure, serve more reads). Sharding = different data on different servers (survive growth).',
    'Async replicas lag. Design for read-your-writes and monotonic reads, or your users will see time go backwards.',
    'Failover is never free: decide up front how much data loss and downtime you can accept, then pick sync vs async.',
    'The shard key is the whole design. Pick it from your top queries, and keep data that is read together on one shard.',
    'Use virtual shards and a directory so you can rebalance without rehashing everything.',
    'Replicate and cache first; shard only when a single primary truly cannot keep up with writes or storage.'
  ],
  interview: [
    { q: 'What is replication lag and how do you handle it?', a: `<p>Lag is the delay between a write committing on the leader and appearing on a follower. Handle it by routing reads that need freshness (right after a write, or for the writing user) to the leader, pinning a user to one replica for monotonic reads, and monitoring lag so you can stop sending reads to a replica that falls too far behind.</p>` },
    { q: 'How do you choose a shard key?', a: `<p>List the most frequent queries and transactions. Choose a key that appears in all of them, spreads load evenly (high cardinality, no celebrity values), and never changes. For most B2C systems that is user or customer id; for B2B it may be tenant id with care for huge tenants.</p>` },
    { q: 'How do you add a shard without downtime?', a: `<p>Use virtual shards mapped to physical servers. Double-write to old and new, backfill the slice in the background, verify, switch reads, then stop writing to the old location. Consistent hashing or a directory table makes the mapping change cheap.</p>` },
    { q: 'Sync vs async replication: which would you choose for payments?', a: `<p>At least one synchronous replica so a committed payment can never be lost on failover, with additional async replicas for read scaling. Accept the extra write latency; losing a payment record is worse than a slower confirmation.</p>` }
  ]
};
/* ───────────────────────── m3-microservices ───────────────────────── */
window.CONTENT['m3-microservices'] = {
  hook: `Microservices do not make a system simpler. They move the complexity from inside one program to the network between many programs. Sometimes that trade is worth it. Often it is not.`,
  intro: `<p>A <span class="term">monolith</span> is one application: one codebase, one deployment, usually one database. A <span class="term">microservice</span> architecture splits that application into several small services, each owning one part of the business (orders, payments, catalog), each running as its own process, each talking to the others over the network.</p>
<p>People move to microservices for independence: team A can deploy the catalog ten times a day without waiting for team B's payment change. Each service can scale on its own and even use a different language or database.</p>
<p>The cost is that every function call that used to be in-memory becomes a network call that can be slow, can fail, and can time out. Data that lived in one database with one transaction now lives in several. You need new tools just to see what happened when a request crosses six services.</p>
<p>This lesson explains the shapes (monolith, modular monolith, microservices), how services talk, the patterns that stop one failure from spreading, and most importantly, when to say no.</p>`,
  realLife: {
    title: 'The restaurant that split its kitchen',
    body: `<p>A small restaurant has one kitchen. The chef cooks everything and knows where everything is. Orders are fast to coordinate because everyone is in the same room. That is a monolith.</p>
<p>The restaurant grows into a food court. Now there is a pizza counter, a sushi bar and a dessert stand. Each has its own staff, own fridge and own opening hours. Pizza can hire more cooks on Friday without touching sushi. That independence is the point of microservices.</p>
<p>But your order of "pizza, sushi and ice cream" now needs a runner to walk between counters, and if the dessert stand is closed, the runner has to decide whether to give you the rest or cancel everything. Nobody in the food court can see the whole order on one screen unless someone builds that screen. Those runners, rules and screens are the API gateway, sagas and distributed tracing of this lesson.</p>
<p>Where real companies use this: Netflix and Amazon famously run thousands of services; Uber split by domain (riders, drivers, payments). On the other side, companies like Shopify and Stack Overflow run large, well-structured monoliths on purpose, and Amazon's own Prime Video team published that merging some microservices back into one process cut their costs by about 90% for one workload.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Three shapes of an application</h4>
<table><thead><tr><th>Shape</th><th>What it is</th><th>Good for</th></tr></thead><tbody>
<tr><td>Monolith</td><td>One deployable program, one database</td><td>Small teams, new products, fast change</td></tr>
<tr><td>Modular monolith</td><td>One deployable program, but code split into strict modules with clear boundaries</td><td>Growing teams who want structure without network calls</td></tr>
<tr><td>Microservices</td><td>Many deployable programs, each owning its data, talking over the network</td><td>Many teams, parts that scale very differently, independent release schedules</td></tr>
</tbody></table>
<h4>What makes a service "micro"?</h4>
<p>Not lines of code. A service is the right size when one small team can own it fully, it has one clear business responsibility (a <span class="term">bounded context</span> such as "Billing"), and it can be changed and deployed without asking other teams.</p>
<h4>How services talk</h4>
<ul>
  <li><strong>Synchronous:</strong> service A calls service B and waits for the answer. Usually HTTP/REST or gRPC. Simple to understand, but if B is slow, A is slow.</li>
  <li><strong>Asynchronous:</strong> service A publishes an event ("OrderPlaced") to a message broker and moves on. Service B reads it whenever it is ready. A does not wait, and B can be down for a minute without A noticing.</li>
</ul>
<h4>One database per service</h4>
<p>Each service owns its tables. No other service reads them directly. If Shipping needs an order, it asks the Order service (or listens to its events). This rule is what makes services independent; break it and you have a "distributed monolith", the worst of both worlds.</p>
<h4>The front door: API gateway</h4>
<p>Clients should not know there are twenty services. An <span class="term">API gateway</span> is one entry point that routes requests to the right service, checks the login token, and applies rate limits. In .NET, YARP (Yet Another Reverse Proxy) is a common gateway; Azure API Management and Kong are managed options.</p>
<div class="callout tip"><p>If you are one team with one product, start with a modular monolith. You get clean boundaries now and can carve out a service later when a real need appears.</p></div>` },
    { name: 'Intermediate', body: `<h4>Finding the boundaries</h4>
<p>Boundaries come from the business, not from the database tables. In <span class="term">domain-driven design</span> a bounded context is an area where words mean one thing: "Customer" in Billing (a payer with an address) is not the same object as "Customer" in Marketing (a lead with preferences). Draw contexts first, then services. A service that constantly needs data from three others is probably cut at the wrong place.</p>
<h4>Sync vs async, concretely</h4>
<div class="compare"><div><h5>REST / gRPC (sync)</h5><p>Use for queries and for commands where the caller needs the result now (validate a coupon at checkout). gRPC is faster and strongly typed (protobuf contracts) and is common for service-to-service calls inside the cluster; REST/JSON stays at the public edge.</p></div><div><h5>Events (async)</h5><p>Use for "something happened" that other services react to (OrderPlaced → Shipping, Email, Analytics). The producer does not know who listens. Needs a broker (RabbitMQ, Kafka, Azure Service Bus) and idempotent consumers, because messages can arrive twice.</p></div></div>
<h4>Service discovery and configuration</h4>
<p>Services move: containers restart on new IPs. <span class="term">Service discovery</span> gives each service a stable name. In Kubernetes that is built-in DNS (http://orders/). In .NET, <strong>Aspire</strong> (formerly called .NET Aspire) wires service names, connection strings and health checks for local development and generates the deployment manifest, so "orders" resolves correctly on your laptop and in the cloud.</p>
<h4>Resilience: stopping the domino effect</h4>
<p>When Payments is slow, Checkout threads pile up waiting, Checkout becomes slow, and the Gateway queues up. One sick service makes the whole site sick. The standard patterns, all available in .NET through <code>Microsoft.Extensions.Http.Resilience</code> (built on Polly):</p>
<ul>
  <li><strong>Timeout:</strong> never wait forever. Every outbound call has a deadline.</li>
  <li><strong>Retry with backoff and jitter:</strong> retry transient failures a few times, waiting longer each time, with randomness so a thousand clients do not retry in the same second.</li>
  <li><strong>Circuit breaker:</strong> after N failures, stop calling the sick service for a while and fail fast. Try one request later to see if it recovered.</li>
  <li><strong>Bulkhead:</strong> cap how many concurrent calls one dependency may use, so a slow dependency cannot eat every thread.</li>
  <li><strong>Fallback:</strong> return cached or default data ("recommendations unavailable") instead of an error page.</li>
</ul>
<h4>Seeing across services: distributed tracing</h4>
<p>One user request becomes ten service calls. A <span class="term">trace id</span> is created at the gateway and passed in a header (W3C <code>traceparent</code>) through every call and every message. Each hop records a span (start, end, status). Tools like Jaeger, Zipkin, Azure Monitor / Application Insights and Grafana Tempo draw the whole request as a timeline. .NET emits this automatically through OpenTelemetry with <code>System.Diagnostics.Activity</code>.</p>
<h4>Data that spans services</h4>
<p>Checkout needs Orders, Payments and Inventory to agree. There is no single transaction. Use a <span class="term">saga</span>: a sequence of local transactions with compensating actions (refund, restock) if a later step fails. The outbox pattern makes "save to my database AND publish an event" atomic by writing the event into the same database transaction and publishing it afterwards.</p>
<div class="callout warn"><p>Two services sharing one database table is not two services. It is one service deployed twice with extra network hops.</p></div>` },
    { name: 'Expert', body: `<h4>The real costs, in numbers you can defend</h4>
<p>An in-process method call costs nanoseconds. A service call inside one data centre costs roughly 0.5–2 ms plus serialization, and p99 is far worse than the median. A request that fans out to 10 services serially adds tens of milliseconds and multiplies failure probability: ten dependencies at 99.9% availability each give about 99% for the whole request, which is more than 7 hours of errors per month. Every split must buy enough independence to pay for that.</p>
<h4>When to split (and when not)</h4>
<ul>
  <li><strong>Split</strong> when teams block each other on deploys, when one part needs 50× the scale of the rest (image processing vs admin UI), when a part has different security or compliance needs, or when a part must be rewritten in another stack.</li>
  <li><strong>Do not split</strong> for a team under about eight people, for a product whose domain is still changing weekly, or because "that is how Netflix does it". You need automated deployment, centralized logging, tracing and on-call before the first split, not after.</li>
</ul>
<h4>Versioning and compatibility</h4>
<p>Services deploy independently, so at any moment two versions of a contract are live. Rules: only add fields, never rename or remove; consumers ignore unknown fields (tolerant reader); events carry a schema version; breaking changes mean a new endpoint or a new event type running alongside the old one until all consumers migrate. Consumer-driven contract tests (Pact-style) catch breaks before deploy.</p>
<h4>The strangler fig migration</h4>
<p>Nobody rewrites a monolith in one go. Put a gateway in front of the monolith, pick one capability with a clean seam (say, notifications), build it as a service, route that traffic to the new service, and repeat. The monolith shrinks over months while the business keeps running. Data is the hard part: use change-data-capture to stream the monolith's tables into the new service's store until the cut-over.</p>
<h4>Observability as a requirement, not a nice-to-have</h4>
<p>You need three signals per service: structured logs with the trace id, metrics (request rate, error rate, duration — the RED method) and traces. Plus a correlation id on every message. Without these, a 2 a.m. incident across twelve services is unsolvable. OpenTelemetry is the vendor-neutral standard; .NET's built-in meters and activities feed it with almost no code.</p>
<h4>Security between services</h4>
<p>The network inside the cluster is not trusted. Use mutual TLS between services (service mesh like Istio/Linkerd, or Dapr sidecars), short-lived tokens for service identity, and pass the user's identity claims along so authorization happens in each service, not only at the gateway.</p>
<h4>Failure modes seen in production</h4>
<ul>
  <li><strong>Retry storms:</strong> three layers each try a call 3 times; one failure becomes 27 calls. Retry at one layer only, with a budget.</li>
  <li><strong>Chatty services:</strong> a page needs 40 calls. Fix with a backend-for-frontend that aggregates, or by redrawing boundaries.</li>
  <li><strong>Shared libraries that become shared deployments:</strong> a common "core" package forces lock-step upgrades. Keep shared code thin.</li>
  <li><strong>Event storms and loops:</strong> service A reacts to B which reacts to A. Document event flows; add idempotency keys.</li>
  <li><strong>Cascading timeouts:</strong> gateway timeout 30 s, service timeout 60 s. Inner timeouts must be shorter than outer ones.</li>
</ul>
<div class="callout idea"><p>Interview angle: the strong answer to "monolith or microservices?" is a decision procedure (team size, deploy friction, scale asymmetry, maturity of ops), not a preference.</p></div>` }
  ],
  flow: {
    title: 'A checkout request crossing services (with a failure)',
    steps: [
      { title: 'Client → Gateway', desc: 'The Angular app calls POST /checkout on the API gateway. The gateway validates the JWT, applies a rate limit and creates a trace id.' },
      { title: 'Gateway → Checkout', desc: 'The request is routed to the Checkout service with the traceparent header. Checkout starts a saga for this order.' },
      { title: 'Checkout → Inventory (gRPC)', desc: 'Synchronous call: reserve stock. Timeout 500 ms, 2 retries with jitter. Inventory replies "reserved".' },
      { title: 'Checkout → Payments (REST)', desc: 'Synchronous call: charge the card with an idempotency key, so a retry cannot double-charge.' },
      { title: 'Payments is down', desc: 'Three calls fail in a row. The circuit breaker opens; further calls fail instantly for 30 s instead of hanging threads.' },
      { title: 'Compensate', desc: 'The saga runs its compensating action: Checkout tells Inventory to release the reservation. The user sees "payment unavailable, try again".' },
      { title: 'Happy path: publish event', desc: 'When payment succeeds, Checkout saves the order and an OrderPlaced event in one transaction (outbox), then a relay publishes it to the broker.' },
      { title: 'Consumers react', desc: 'Shipping, Email and Analytics each consume OrderPlaced independently. If Email is down for a minute, the message waits; nothing else is affected.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Resilient service-to-service HTTP call in .NET (timeout, retry, circuit breaker)', code: `// dotnet add package Microsoft.Extensions.Http.Resilience
using Microsoft.Extensions.Http.Resilience;
using Polly;
using Polly.CircuitBreaker;   // BrokenCircuitException lives here

var builder = WebApplication.CreateBuilder(args);

// A typed client for the Payments service. The "standard" handler bundles:
// total timeout, retry with backoff + jitter, circuit breaker, per-attempt timeout.
builder.Services.AddHttpClient<PaymentsClient>(c =>
    {
        // With .NET Aspire / Kubernetes DNS, "payments" resolves to the service.
        c.BaseAddress = new Uri("http://payments");
    })
    .AddStandardResilienceHandler(o =>
    {
        o.AttemptTimeout.Timeout = TimeSpan.FromMilliseconds(800);   // each try
        o.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(3);    // all tries together
        o.Retry.MaxRetryAttempts = 2;
        o.Retry.BackoffType = DelayBackoffType.Exponential;
        o.Retry.UseJitter = true;
        o.CircuitBreaker.FailureRatio = 0.5;                        // open when half of calls fail
        o.CircuitBreaker.MinimumThroughput = 10;                     // ...over at least 10 calls
        o.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(30);
        o.CircuitBreaker.BreakDuration = TimeSpan.FromSeconds(30);   // fail fast for 30 s
    });

var app = builder.Build();

app.MapPost("/checkout", async (CheckoutRequest req, PaymentsClient payments, ILogger<Program> log) =>
{
    try
    {
        // Idempotency key: a retry (ours or the gateway's) can never charge twice.
        var result = await payments.ChargeAsync(req.OrderId, req.AmountMinor, idempotencyKey: req.OrderId.ToString());
        return Results.Ok(new { status = "paid", result.TransactionId });
    }
    catch (BrokenCircuitException)
    {
        // Fallback: do not hang the user; degrade honestly.
        log.LogWarning("Payments circuit open for order {OrderId}", req.OrderId);
        return Results.Json(new { status = "payment_unavailable" }, statusCode: 503);
    }
});

app.Run();

public sealed class PaymentsClient(HttpClient http)
{
    public async Task<ChargeResult> ChargeAsync(Guid orderId, long amountMinor, string idempotencyKey)
    {
        using var msg = new HttpRequestMessage(HttpMethod.Post, "/charges")
        {
            Content = JsonContent.Create(new { orderId, amountMinor })
        };
        msg.Headers.Add("Idempotency-Key", idempotencyKey);
        var res = await http.SendAsync(msg);
        res.EnsureSuccessStatusCode();
        return (await res.Content.ReadFromJsonAsync<ChargeResult>())!;
    }
}
public record CheckoutRequest(Guid OrderId, long AmountMinor);
public record ChargeResult(string TransactionId);` },
    { lang: 'csharp', title: 'Transactional outbox: save data and event atomically, publish later', code: `// Problem: "SaveChanges() then Publish()" can save and crash before publishing (lost event),
// or publish and fail to save (ghost event). Outbox fixes it with one database transaction.

public sealed class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = "";        // e.g. "OrderPlaced"
    public string Payload { get; set; } = "";     // JSON
    public DateTime CreatedUtc { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedUtc { get; set; }
}

public sealed class OrderService(AppDbContext db)
{
    public async Task PlaceOrderAsync(Order order)
    {
        db.Orders.Add(order);
        db.Outbox.Add(new OutboxMessage
        {
            Type = "OrderPlaced",
            Payload = System.Text.Json.JsonSerializer.Serialize(new { order.Id, order.CustomerId, order.Total })
        });
        await db.SaveChangesAsync();   // ONE transaction: order row + outbox row, or neither
    }
}

// A background relay publishes unpublished rows. Runs every second; safe to run on many instances
// if you lock rows (UPDLOCK/READPAST in SQL Server) or use a lease column.
public sealed class OutboxRelay(IServiceScopeFactory scopes, IMessageBus bus) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            using var scope = scopes.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var batch = await db.Outbox.Where(m => m.PublishedUtc == null)
                                       .OrderBy(m => m.CreatedUtc).Take(100).ToListAsync(ct);
            foreach (var m in batch)
            {
                await bus.PublishAsync(m.Type, m.Payload, messageId: m.Id, ct); // broker dedupes by Id
                m.PublishedUtc = DateTime.UtcNow;
            }
            await db.SaveChangesAsync(ct);
            await Task.Delay(TimeSpan.FromSeconds(1), ct);
        }
    }
}
public interface IMessageBus { Task PublishAsync(string type, string json, Guid messageId, CancellationToken ct); }` },
    { lang: 'text', title: 'Decision sheet: should we split this into services?', code: `Score each line 0 (no) / 1 (somewhat) / 2 (strongly yes). Total below 6 -> stay a (modular) monolith.

[ ] Teams: more than ~8 engineers regularly waiting on each other's deploys
[ ] Scale asymmetry: one part needs >10x the compute/memory of the rest
[ ] Release cadence: one part must ship daily while another ships quarterly (regulated)
[ ] Fault isolation: a bug in part X taking down part Y is unacceptable to the business
[ ] Tech divergence: a part needs a different runtime (ML in Python, real-time in Go)
[ ] Data ownership: domains are stable and boundaries are clear (DDD contexts agreed)

Prerequisites (ALL required before the first split, or you will regret it):
  - CI/CD that deploys any service in minutes, automatically
  - Central structured logs + metrics + distributed tracing (OpenTelemetry)
  - On-call rotation and runbooks
  - Contract tests between producer and consumer
  - A gateway (YARP / API Management) so clients never see topology

Typical first split candidates: notifications/email, file processing, search indexing, reporting.
Worst first split candidates: anything on the checkout/payment critical path.` }
  ],
  pitfalls: [
    'Splitting by technical layer (a "database service", a "validation service") instead of by business capability. Every request then touches every service.',
    'Two services reading the same tables. You now have a distributed monolith: all of the network cost, none of the independence.',
    'Retries at every layer without a budget. One slow dependency turns into a self-inflicted denial of service.',
    'Inner timeouts longer than outer ones. The gateway gives up at 30 s while the service keeps working for 60 s on a request nobody is waiting for.',
    'No tracing on day one. The first cross-service incident becomes a multi-day guessing game.',
    'Starting with microservices for a brand-new product whose domain changes every sprint. Boundaries drawn today will be wrong next month and moving them across services is expensive.'
  ],
  quiz: [
    { q: 'What is the main technical price of microservices?', options: ['Each service needs far more lines of code than a module would', 'In-memory calls become network calls that can fail', 'You must run everything on Kubernetes with a service mesh', 'Every database grows because rows are copied to all services'], answer: 1, why: 'Every boundary crossing adds latency and a new failure mode. Everything else (tracing, sagas, gateways) exists to manage that.' },
    { q: 'A circuit breaker does what?', options: ['Retries failed calls forever until the service answers', 'Stops calling a failing service for a while and fails fast', 'Encrypts traffic between services so errors cannot spread', 'Splits the database so one slow query cannot block others'], answer: 1, why: 'After enough failures it opens, so callers fail immediately instead of hanging threads on a sick dependency, then probes later to see if it recovered.' },
    { q: 'Why is "one database per service" a rule?', options: ['Databases are cheap, so sharing one would save no money anyway', 'So a service can change its schema without breaking others', 'A SQL database cannot accept connections from two services', 'It is only about security: each team hides its own passwords'], answer: 1, why: 'If another service reads your tables directly, you cannot change them without coordinating; you have lost the independence that justified the split.' },
    { q: 'The outbox pattern solves which problem?', options: ['Slow queries that join tables owned by other services', 'Saving data and publishing an event atomically', 'Finding the network address of another service', 'Limiting how many requests one client may send'], answer: 1, why: 'The event is written to an outbox table in the same transaction as the data, and a relay publishes it afterwards, so you never get a saved order without its event or an event without its order.' },
    { q: 'Which is the best first candidate to carve out of a monolith?', options: ['Checkout and payment', 'The user table', 'Email notifications', 'Authentication'], answer: 2, why: 'Notifications has a clean seam, tolerates async delivery and is off the critical path, so mistakes are cheap. Payment and auth are the riskiest places to start.' },
    { q: 'Ten services each at 99.9% availability, called serially, give roughly what availability?', options: ['99.9%', '99%', '90%', '99.99%'], answer: 1, why: '0.999 to the power 10 is about 0.99. Each extra dependency on the path lowers the total; that is the math behind "do not split without a reason".' }
  ],
  takeaways: [
    'Monolith → modular monolith → microservices is a progression driven by team size and deploy friction, not by fashion.',
    'Draw boundaries from business capabilities (bounded contexts); each service owns its data.',
    'Sync (REST/gRPC) when the caller needs the answer now; async events when others merely react.',
    'Every outbound call gets a timeout, bounded retries with jitter, a circuit breaker and a fallback. In .NET that is one AddStandardResilienceHandler call.',
    'Trace ids across every hop and message are not optional; without them incidents are unsolvable.',
    'Use the outbox pattern and sagas for data that spans services; there is no distributed transaction that is both fast and safe.'
  ],
  interview: [
    { q: 'How would you break a monolith into microservices?', a: `<p>Strangler fig: put a gateway in front, pick a capability with a clean seam and low risk (notifications, search), build it as a service with its own data store fed by change-data-capture, route that traffic to it, verify, repeat. Invest in CI/CD, logging, tracing and contract tests before the first cut.</p>` },
    { q: 'Sync or async communication between services?', a: `<p>Sync for queries and commands where the caller needs the result immediately (validate coupon, reserve stock). Async events for notifications of facts others react to (OrderPlaced). Async decouples availability and smooths load spikes; sync is simpler to reason about. Most systems use both.</p>` },
    { q: 'How do you keep data consistent across services?', a: `<p>Accept eventual consistency and use sagas: a chain of local transactions with compensating actions. Make "save plus publish" atomic with the outbox pattern. Make consumers idempotent because messages can be delivered more than once.</p>` },
    { q: 'What stops one slow service taking down the whole system?', a: `<p>Timeouts shorter at the inner layers than the outer, bounded retries with backoff and jitter, circuit breakers that fail fast, bulkheads that cap concurrency per dependency, and fallbacks that degrade gracefully. Plus load shedding at the gateway.</p>` }
  ]
};
/* ───────────────────────── m3-queues ───────────────────────── */
window.CONTENT['m3-queues'] = {
  hook: `A queue is a waiting line for work. It lets the part that produces work and the part that does it run at different speeds, and survive each other being down.`,
  intro: `<p>A <span class="term">message queue</span> is a place where one program (the <strong>producer</strong>) drops a message and another program (the <strong>consumer</strong>) picks it up later. The two never talk directly. The queue sits in the middle, stores messages safely, and hands them out in order.</p>
<p>Why not just call the other service? Because a direct call needs the other side to be up, fast and ready right now. A queue removes "right now". If the email service is restarting, the "send welcome email" message waits two minutes and nothing else notices. If 10,000 orders arrive in one second during a sale, the queue holds them and the order processor works through them at its own pace.</p>
<p>The queue also answers a hard question: what happens if a message is lost, or handled twice? The words <span class="term">at-most-once</span>, <span class="term">at-least-once</span> and <span class="term">exactly-once</span> describe those guarantees, and most of this lesson is about living with "at least once".</p>
<p>The three systems you will meet are RabbitMQ (classic broker with smart routing), Apache Kafka (a distributed log built for huge volume and replay), and Azure Service Bus (managed broker common in .NET shops).</p>`,
  realLife: {
    title: 'The coffee shop ticket rail',
    body: `<p>At a busy coffee shop the cashier does not make your drink. She writes it on a ticket and clips it to a rail. The barista takes tickets from the rail in order. The cashier can take the next order immediately even if the barista is slow. That rail is a queue.</p>
<p>If the barista goes on break, tickets pile up but none are lost. If it gets busy, the shop adds a second barista who takes tickets from the same rail. That is a consumer group. If one barista drops a ticket on the floor and picks it up again, you might get two lattes. That is at-least-once delivery, and "check the ticket number before making it" is idempotency.</p>
<p>Where real companies use this: LinkedIn built Kafka to move activity data at millions of messages per second; every e-commerce checkout you use puts "order placed" on a queue so email, warehouse and fraud checks run in parallel; .NET teams on Azure typically use Service Bus queues for commands and topics for events.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The three roles</h4>
<ul>
  <li><strong>Producer:</strong> creates a message ("OrderPlaced, order 8841") and sends it to the broker.</li>
  <li><strong>Broker:</strong> the server that stores messages durably and delivers them. RabbitMQ, Kafka, Azure Service Bus, Amazon SQS.</li>
  <li><strong>Consumer:</strong> receives messages and does the work. Several consumers can share one queue to go faster.</li>
</ul>
<h4>Queue vs topic</h4>
<div class="compare"><div><h5>Queue (point-to-point)</h5><p>Each message is handled by exactly one consumer. Good for commands: "resize this image", "charge this card".</p></div><div><h5>Topic (publish/subscribe)</h5><p>Each message is copied to every subscriber. Good for events: "OrderPlaced" goes to Shipping AND Email AND Analytics.</p></div></div>
<h4>Why queues help</h4>
<ul>
  <li><strong>Decoupling:</strong> producer and consumer can be deployed, scaled and restarted separately.</li>
  <li><strong>Buffering:</strong> spikes are absorbed by the queue instead of crashing the consumer.</li>
  <li><strong>Reliability:</strong> the broker keeps the message until a consumer confirms it finished (an <span class="term">acknowledgement</span>, or "ack").</li>
  <li><strong>Fan-out:</strong> one event, many independent reactions.</li>
</ul>
<h4>Delivery guarantees in one table</h4>
<table><thead><tr><th>Guarantee</th><th>What can happen</th><th>How</th></tr></thead><tbody>
<tr><td>At-most-once</td><td>A message may be lost, never duplicated</td><td>Consumer acks before doing the work</td></tr>
<tr><td>At-least-once</td><td>Never lost, may be duplicated</td><td>Consumer acks after the work; a crash in between causes a redelivery</td></tr>
<tr><td>Exactly-once</td><td>Neither lost nor duplicated (within limits)</td><td>At-least-once + consumer deduplicates by message id</td></tr>
</tbody></table>
<div class="callout tip"><p>Almost every real system is at-least-once with idempotent consumers. "Exactly-once" is something you build at the edges, not something the broker gives you for free.</p></div>
<h4>Dead-letter queue</h4>
<p>If a message fails again and again (bad data, bug), redelivering it forever blocks everything behind it. After N attempts the broker moves it to a <span class="term">dead-letter queue</span> (DLQ) where a human or a repair job can look at it.</p>` },
    { name: 'Intermediate', body: `<h4>RabbitMQ: exchanges and routing</h4>
<p>In RabbitMQ a producer never sends to a queue directly. It sends to an <span class="term">exchange</span>, which routes copies into queues based on rules (<em>bindings</em>). Exchange types: <strong>direct</strong> (routing key must match exactly), <strong>topic</strong> (pattern match like <code>order.*.eu</code>), <strong>fanout</strong> (copy to every bound queue), <strong>headers</strong>. Consumers prefetch a limited number of messages (the <code>prefetch</code> count) and ack each one. Messages are deleted once acked. Great for work queues, request/reply and routing; not built for replaying old messages.</p>
<h4>Kafka: a partitioned log</h4>
<p>Kafka does not delete messages when they are read. A <span class="term">topic</span> is split into <span class="term">partitions</span>, each an append-only file. Producers choose a partition by key (same key → same partition → order preserved for that key). Consumers in a <span class="term">consumer group</span> split the partitions between them: with 6 partitions and 3 consumers, each consumer owns 2. Each consumer remembers its <em>offset</em> (position) per partition; commit the offset after processing. Because data stays for days (retention), you can replay from any offset: rebuild a cache, fix a bug and reprocess. Max parallelism = number of partitions, so choose it up front.</p>
<h4>Azure Service Bus</h4>
<p>A managed broker with queues, topics with subscriptions (filters per subscriber), sessions for ordered processing per key, scheduled messages, duplicate detection by MessageId within a window, and automatic dead-lettering. Peek-lock mode gives at-least-once: you receive, process, then complete; if the lock expires the message is redelivered.</p>
<h4>Ordering</h4>
<p>Total ordering across a system is slow and rarely needed. What you need is ordering per key: all events for order 8841 in order. Kafka gives that by partition key; Service Bus by session id; RabbitMQ by a single queue with one consumer (or consistent-hash exchange). Multiple consumers on one queue break ordering unless keyed.</p>
<h4>Backpressure</h4>
<p>If producers are faster than consumers forever, the queue grows until the broker runs out of disk. Signs: rising queue depth, rising consumer lag. Responses: scale consumers out (more partitions/instances), slow producers down (bounded in-memory channel, HTTP 429), drop or sample low-value messages, or set TTLs. Monitor <em>lag</em> (Kafka) or <em>active message count</em> (Service Bus) as a first-class alert.</p>
<h4>Idempotent consumers in practice</h4>
<p>Store processed message ids in a table (or Redis set) with a TTL and check before processing, or make the operation naturally idempotent ("set status = shipped" instead of "increment shipped count"). Combine with the outbox pattern on the producer side and you get effectively-once end to end.</p>
<h4>.NET libraries</h4>
<p><code>RabbitMQ.Client</code>, <code>Confluent.Kafka</code> and <code>Azure.Messaging.ServiceBus</code> are the official clients. <strong>MassTransit</strong> and NServiceBus sit above them with one API for all brokers, plus retries, outbox, sagas and consumer scaling built in.</p>
<div class="callout warn"><p>Never ack (or commit the offset) before the work is finished and saved. That turns at-least-once into at-most-once and you silently lose messages during restarts.</p></div>` },
    { name: 'Expert', body: `<h4>Durability internals</h4>
<p>A broker is only as durable as its disk and replication. Kafka writes to the partition leader and replicates to followers; a producer with <code>acks=all</code> and <code>min.insync.replicas=2</code> only gets success when at least two replicas have the record, which survives a single broker loss. RabbitMQ quorum queues use Raft consensus across nodes for the same reason. Service Bus premium replicates within the region and can geo-replicate. Set these explicitly; defaults often favour speed.</p>
<h4>Kafka exactly-once semantics (EOS)</h4>
<p>Kafka offers idempotent producers (deduplicating retries by producer id and sequence) and transactions that atomically write to several partitions and commit consumer offsets. This gives exactly-once <em>inside</em> Kafka (read-process-write pipelines, Kafka Streams). The moment your consumer writes to SQL Server or calls an HTTP API, you are back to needing idempotency on that side.</p>
<h4>Partition design</h4>
<p>Partitions are the unit of parallelism and ordering. Too few: consumers cannot scale. Too many: more open files, longer leader elections, more memory. A rule of thumb is to size for the target throughput per partition (tens of MB/s each) and to over-provision moderately, since adding partitions later changes the key → partition mapping and breaks ordering for existing keys. Watch for hot keys (one tenant's events all on one partition); salt or split them.</p>
<h4>Consumer rebalancing and poison messages</h4>
<p>When a consumer joins or leaves a group, partitions are reassigned; during a rebalance the group stops consuming (cooperative rebalancing reduces this). A Kafka handler that takes longer than <code>max.poll.interval.ms</code> between polls is treated as dead and its partitions get reassigned while it works, causing duplicates (on Service Bus the same thing happens when the message lock expires). A poison message that crashes the consumer causes a crash loop; cap retries, dead-letter after N, and never block the partition for a single bad record.</p>
<h4>Schema evolution</h4>
<p>Messages outlive code. Use a schema (Avro/Protobuf/JSON Schema) with a registry, only add optional fields, never reuse field numbers, and version the event type when semantics change. Consumers must tolerate unknown fields.</p>
<h4>Choosing a broker</h4>
<table><thead><tr><th>Need</th><th>Lean towards</th></tr></thead><tbody>
<tr><td>Work queues, request/reply, complex routing, modest volume</td><td>RabbitMQ or Azure Service Bus</td></tr>
<tr><td>Very high throughput, replay, stream processing, event sourcing</td><td>Kafka (or Azure Event Hubs, Kafka-compatible)</td></tr>
<tr><td>Managed, .NET-first, sessions, scheduled delivery, dedupe</td><td>Azure Service Bus</td></tr>
<tr><td>Simple, serverless, cheap</td><td>Amazon SQS / Azure Storage Queues</td></tr>
</tbody></table>
<h4>Failure modes to plan for</h4>
<ul>
  <li><strong>Unbounded queue growth</strong> during a consumer outage, then a thundering herd when consumers return. Rate-limit catch-up.</li>
  <li><strong>Duplicate side effects</strong> (two emails, two charges) from redelivery. Idempotency keys end to end.</li>
  <li><strong>Lost messages</strong> from ack-before-work, or from producers that fire-and-forget without waiting for broker confirmation.</li>
  <li><strong>Ordering broken</strong> by retries: message 2 succeeds while message 1 is retrying. Use per-key sessions/partitions and retry in place.</li>
  <li><strong>Clock and TTL surprises:</strong> scheduled messages and TTLs rely on broker time, not yours.</li>
</ul>
<div class="callout idea"><p>Interview angle: when asked "Kafka or RabbitMQ?", answer with the access pattern: do you need replay and massive parallel ordered streams (Kafka), or flexible routing and per-message acks for work (RabbitMQ / Service Bus)?</p></div>` }
  ],
  flow: {
    title: 'One OrderPlaced event, at-least-once, with a duplicate',
    steps: [
      { title: 'Producer publishes', desc: 'Checkout writes the order and an outbox row in one transaction. The relay publishes OrderPlaced with MessageId = order id and key = customer id.' },
      { title: 'Broker stores', desc: 'The broker appends the message to the partition for that key and replicates it to another node before confirming to the producer.' },
      { title: 'Consumer receives', desc: 'The Email consumer, one of three in its group, owns this partition and receives the message with a lock (or at offset 1042).' },
      { title: 'Work done', desc: 'The consumer renders and sends the welcome email, then records "message 8841 processed" in its own database.' },
      { title: 'Crash before ack', desc: 'The consumer pod is killed before it acks (or commits the offset). The broker never heard "done".' },
      { title: 'Redelivery', desc: 'The lock expires (or a new consumer picks up from offset 1042). The same message arrives again — at-least-once in action.' },
      { title: 'Idempotency check', desc: 'The consumer looks up message 8841 in its processed table, finds it, and acks immediately without sending a second email.' },
      { title: 'Poison path', desc: 'A different message with broken JSON fails 5 times. The broker moves it to the dead-letter queue; an alert fires; the partition keeps flowing.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Azure Service Bus: producer + idempotent consumer (peek-lock, DLQ after retries)', code: `// dotnet add package Azure.Messaging.ServiceBus
using Azure.Messaging.ServiceBus;
using System.Text.Json;

public record OrderPlaced(Guid OrderId, int CustomerId, decimal Total);

// ---------- Producer ----------
public sealed class OrderEventPublisher(ServiceBusClient client)
{
    private readonly ServiceBusSender _sender = client.CreateSender("order-events"); // a topic

    public async Task PublishAsync(OrderPlaced evt, CancellationToken ct)
    {
        var msg = new ServiceBusMessage(JsonSerializer.Serialize(evt))
        {
            MessageId = evt.OrderId.ToString(),   // broker-side duplicate detection uses this
            SessionId = evt.CustomerId.ToString(),// groups one customer's messages; ordered only on a session-enabled subscription
            Subject = "OrderPlaced",
            ContentType = "application/json"
        };
        await _sender.SendMessageAsync(msg, ct);   // waits for broker confirmation
    }
}

// ---------- Consumer (subscription "email" on the topic) ----------
public sealed class EmailOrderConsumer(ServiceBusClient client, IProcessedStore processed, IEmailSender email)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        // Plain processor: no per-customer ordering (emails do not need it). For strict order per SessionId,
        // enable sessions on the subscription and use client.CreateSessionProcessor(...) instead.
        var processor = client.CreateProcessor("order-events", "email", new ServiceBusProcessorOptions
        {
            MaxConcurrentCalls = 8,
            AutoCompleteMessages = false,          // WE decide when it is done (at-least-once)
            PrefetchCount = 16
        });

        processor.ProcessMessageAsync += async args =>
        {
            var evt = JsonSerializer.Deserialize<OrderPlaced>(args.Message.Body.ToString())!;

            // Idempotency: have we already handled this message id?
            if (await processed.ExistsAsync(args.Message.MessageId))
            {
                await args.CompleteMessageAsync(args.Message);   // ack duplicate, do nothing
                return;
            }

            await email.SendOrderConfirmationAsync(evt.CustomerId, evt.OrderId);
            await processed.MarkAsync(args.Message.MessageId, ttl: TimeSpan.FromDays(7));
            await args.CompleteMessageAsync(args.Message);        // ack AFTER the work
        };

        processor.ProcessErrorAsync += args =>
        {
            // Log; after MaxDeliveryCount (set on the subscription, e.g. 5) the broker dead-letters it.
            Console.Error.WriteLine("Consumer error: " + args.Exception.Message);
            return Task.CompletedTask;
        };

        await processor.StartProcessingAsync(ct);
        try { await Task.Delay(Timeout.Infinite, ct); } catch (OperationCanceledException) { }
        await processor.StopProcessingAsync();
    }
}

public interface IProcessedStore
{
    Task<bool> ExistsAsync(string messageId);
    Task MarkAsync(string messageId, TimeSpan ttl);
}
public interface IEmailSender { Task SendOrderConfirmationAsync(int customerId, Guid orderId); }` },
    { lang: 'csharp', title: 'Kafka with Confluent.Kafka: keyed producer and a consumer group with manual commits', code: `// dotnet add package Confluent.Kafka
using Confluent.Kafka;

// ---------- Producer: key = customerId keeps one customer's events in order ----------
var producerConfig = new ProducerConfig
{
    BootstrapServers = "kafka-1:9092,kafka-2:9092",
    Acks = Acks.All,                 // wait for in-sync replicas: survives a broker loss
    EnableIdempotence = true,        // broker dedupes producer retries
    LingerMs = 5                     // tiny batching for throughput
};
using var producer = new ProducerBuilder<string, string>(producerConfig).Build();

var result = await producer.ProduceAsync("order-events",
    new Message<string, string> { Key = "customer-42", Value = "{\\"orderId\\":\\"8841\\",\\"total\\":1299}" });
Console.WriteLine("Written to partition " + result.Partition.Value + " at offset " + result.Offset.Value);

// ---------- Consumer: one member of the "email" group ----------
var consumerConfig = new ConsumerConfig
{
    BootstrapServers = "kafka-1:9092",
    GroupId = "email",
    AutoOffsetReset = AutoOffsetReset.Earliest,   // new group starts from the beginning
    EnableAutoCommit = false,                     // commit only after work is saved
    MaxPollIntervalMs = 300000                    // handler must finish within 5 min or be kicked
};
using var consumer = new ConsumerBuilder<string, string>(consumerConfig).Build();
consumer.Subscribe("order-events");

var cts = new CancellationTokenSource();
try
{
    while (!cts.IsCancellationRequested)
    {
        var cr = consumer.Consume(cts.Token);          // blocks until a record arrives
        try
        {
            // Idempotent handler: dedupe by (topic, partition, offset) or by a business id in the value.
            await HandleAsync(cr.Message.Key, cr.Message.Value);
            consumer.Commit(cr);                         // at-least-once: commit AFTER handling
        }
        catch (Exception ex)
        {
            // Do not block the partition forever: after N failures, send to a dead-letter topic.
            await SendToDeadLetterAsync(cr, ex);
            consumer.Commit(cr);
        }
    }
}
finally { consumer.Close(); }

static Task HandleAsync(string key, string value) => Task.CompletedTask;
static Task SendToDeadLetterAsync(ConsumeResult<string, string> cr, Exception ex) => Task.CompletedTask;` },
    { lang: 'text', title: 'Sizing sketch: partitions, consumers and lag', code: `Workload: 5,000 order events/sec peak, 1 KB each  -> 5 MB/s
Handler:  Email consumer takes ~40 ms per message (template render + SMTP call)

Consumer throughput per instance (single-threaded) = 1000 ms / 40 ms = 25 msg/s
Instances needed at peak = 5000 / 25 = 200   <- too many; make the handler concurrent
With 16 concurrent handlers per instance    = 400 msg/s per instance -> 13 instances

Kafka partitions: must be >= max consumer instances you ever want => choose 32
  (headroom for 2.5x growth; per-partition load ~ 160 KB/s, far below limits)
Retention: 7 days x 5 MB/s x 86,400 s ~= 3 TB per topic replica; x3 replication = 9 TB
  -> set retention to 3 days unless replay beyond that is a real requirement

Alerts:
  consumer lag > 60 s of production rate (300k messages)    -> page
  dead-letter count rising                                   -> ticket
  producer error rate > 0.1%                                 -> page
Backpressure if lag keeps growing: scale consumers (up to 32), then rate-limit producers.` }
  ],
  pitfalls: [
    'Acking or committing the offset before the work is saved. A restart in the gap loses messages for good.',
    'Assuming messages arrive once. Redelivery after a crash, a lock expiry or a rebalance is normal; consumers must be idempotent.',
    'Expecting global ordering with several consumers on one queue. Order is only preserved per key (partition or session).',
    'Too few Kafka partitions. You cannot add consumers beyond the partition count, and adding partitions later breaks key ordering.',
    'No dead-letter handling. One malformed message blocks everything behind it in a crash loop.',
    'Fire-and-forget publishing without waiting for the broker ack, then wondering where the events went during a broker failover.'
  ],
  quiz: [
    { q: 'A consumer acks a message, then crashes while sending the email. Which guarantee were you running?', options: ['At-least-once', 'At-most-once', 'Exactly-once', 'Ordered delivery'], answer: 1, why: 'Acking before the work means a crash loses the message: it may be processed at most once, possibly zero times.' },
    { q: 'How does Kafka preserve ordering for one customer’s events?', options: ['A global lock makes all producers write one at a time', 'All events with the same key go to the same partition', 'The broker sorts every topic by timestamp before delivery', 'Consumers in the group sort the events among themselves'], answer: 1, why: 'The producer hashes the key to pick a partition; within a partition records are strictly ordered, and only one consumer in a group reads a partition at a time.' },
    { q: 'What is a dead-letter queue for?', options: ['Deleted messages that producers may want to restore later', 'Messages that failed too many times, parked for inspection', 'Expired login tokens that consumers must check again', 'Backup copies of every message in case the broker fails'], answer: 1, why: 'After N failed deliveries the broker moves the message aside so the rest of the queue keeps flowing and someone can investigate.' },
    { q: 'Which is NOT a valid response to growing consumer lag?', options: ['Add consumer instances up to the partition count', 'Commit offsets before processing to go faster', 'Rate-limit producers', 'Make the handler concurrent'], answer: 1, why: 'Committing early does not speed up work; it just turns lost-message risk on. The other three actually increase throughput or reduce input.' },
    { q: 'Why is exactly-once "within limits" even with Kafka transactions?', options: ['Kafka transactions are unreliable and often lose records', 'The guarantee ends when the consumer writes to an external system', 'It only works when the topic has exactly one partition', 'It needs a second broker such as RabbitMQ to confirm each write'], answer: 1, why: 'Kafka can make read-process-write inside Kafka atomic. A write to an outside database or email API can still be repeated after a crash, so that side needs idempotency.' },
    { q: 'Topic vs queue: OrderPlaced must reach Shipping, Email and Analytics. Use…', options: ['One queue shared by three consumers', 'A topic with three subscriptions', 'Three producers', 'A database table'], answer: 1, why: 'A queue hands each message to one consumer. A topic copies it to every subscription, so each service gets its own copy.' }
  ],
  takeaways: [
    'Queues decouple speed and availability: producers and consumers can run, scale and fail independently.',
    'Real systems are at-least-once. Ack after the work, and make consumers idempotent by message id.',
    'Ordering is per key: Kafka partitions, Service Bus sessions. Global ordering does not scale.',
    'RabbitMQ/Service Bus for work queues and routing; Kafka for huge throughput, replay and streams.',
    'Dead-letter queues, retry caps and lag alerts are part of the design, not operations afterthoughts.',
    'Pair the outbox pattern on the producer with idempotent consumers to get effectively-once end to end.'
  ],
  interview: [
    { q: 'Explain at-least-once vs exactly-once delivery.', a: `<p>At-least-once: the broker redelivers until a consumer acks after finishing, so duplicates are possible but nothing is lost. Exactly-once as users mean it is achieved by at-least-once plus deduplication (message id store or naturally idempotent operations), or inside Kafka by idempotent producers and transactions.</p>` },
    { q: 'Kafka vs RabbitMQ?', a: `<p>Kafka is a replicated, partitioned log: very high throughput, retention and replay, ordering per key, parallelism bounded by partitions. RabbitMQ is a smart broker: flexible routing via exchanges, per-message acks, low-latency work queues, request/reply; messages are removed when consumed. Choose by whether you need replay and stream processing or routing and task distribution.</p>` },
    { q: 'How do you handle a poison message?', a: `<p>Cap delivery attempts, move the message to a dead-letter queue with the error attached, alert, and keep the main queue flowing. Provide a tool to inspect, fix and requeue dead letters.</p>` },
    { q: 'How would you make sure an event is published whenever an order is saved?', a: `<p>Transactional outbox: write the event into an outbox table in the same database transaction as the order; a relay publishes unpublished rows and marks them. Combined with broker duplicate detection by message id and idempotent consumers, you get reliable, effectively-once delivery.</p>` }
  ]
};
/* ───────────────────────── m3-api-design ───────────────────────── */
window.CONTENT['m3-api-design'] = {
  hook: `An API is a promise. Once someone builds on it, every change you make is either kept or broken. Good API design is the art of making promises you can keep for years.`,
  intro: `<p>An <span class="term">API</span> (application programming interface) is how one program asks another to do something. For web systems that usually means HTTP endpoints that return JSON. When a mobile app, a partner company and your own Angular front end all call the same endpoints, the API becomes a contract that is very hard to change.</p>
<p>"At scale" adds three pressures. Many clients: you cannot ask them all to update at once, so you need versioning and backwards compatibility. Many requests: you need pagination, caching and rate limits so one client cannot flood you. Many failures: you need one clear error format and safe retries so clients can recover without creating duplicate orders.</p>
<p>This lesson covers REST resource design, versioning, pagination, filtering, idempotency, rate limiting, errors, documentation, and when to pick GraphQL or gRPC instead.</p>`,
  realLife: {
    title: 'The restaurant menu that never changes shape',
    body: `<p>A good restaurant menu is an API. Dishes have stable names, prices are listed in one place, and the waiter never surprises you with a different format. If the chef adds a dish, the menu gets a line; old dishes do not vanish without warning. If you order the same thing twice by mistake, a good waiter checks: "you already ordered that, did you want two?" That check is idempotency.</p>
<p>Now imagine the restaurant serves 10,000 customers an hour. The menu is split into pages (pagination), the kitchen limits how many orders one table can place per minute (rate limiting), and every complaint comes on the same form so the manager can handle them quickly (a standard error format).</p>
<p>Where real companies use this: Stripe is the reference example of a stable, versioned API with idempotency keys on every POST; GitHub's REST API paginates long lists with Link headers and returns clear rate-limit headers; Microsoft publishes REST API guidelines that most Azure services follow.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Resources, not actions</h4>
<p>REST thinks in <span class="term">resources</span> (nouns) and uses HTTP methods as the verbs. Instead of <code>/getOrder?id=5</code> and <code>/cancelOrder</code>, you have <code>GET /orders/5</code> and <code>POST /orders/5/cancellations</code> (or <code>PATCH /orders/5</code> with a status change).</p>
<table><thead><tr><th>Method</th><th>Meaning</th><th>Safe?</th><th>Idempotent?</th></tr></thead><tbody>
<tr><td>GET</td><td>Read</td><td>Yes</td><td>Yes</td></tr>
<tr><td>POST</td><td>Create / do something</td><td>No</td><td>No (unless you add an idempotency key)</td></tr>
<tr><td>PUT</td><td>Replace the whole thing</td><td>No</td><td>Yes</td></tr>
<tr><td>PATCH</td><td>Change part of it</td><td>No</td><td>Not guaranteed (depends on the patch)</td></tr>
<tr><td>DELETE</td><td>Remove</td><td>No</td><td>Yes</td></tr>
</tbody></table>
<p><em>Safe</em> means it changes nothing. <em>Idempotent</em> means doing it twice has the same result as once, which matters because networks retry.</p>
<h4>Naming rules that age well</h4>
<ul>
  <li>Plural nouns: <code>/customers</code>, <code>/customers/42/orders</code>.</li>
  <li>Lower-case, hyphens, no verbs, no file extensions.</li>
  <li>Nest only one level; beyond that use query filters: <code>/orders?customerId=42</code>.</li>
  <li>Use the right status code: 200 ok, 201 created, 204 no content, 400 bad input, 401 not logged in, 403 not allowed, 404 not found, 409 conflict, 422 validation failed, 429 too many requests, 500 our fault, 503 try later.</li>
</ul>
<h4>One error shape</h4>
<p>Every error should look the same so clients can handle it generically. ASP.NET Core supports <span class="term">Problem Details</span> (RFC 9457): a JSON object with <code>type</code>, <code>title</code>, <code>status</code>, <code>detail</code> and optional <code>errors</code> for field validation. Never return a raw stack trace.</p>
<h4>Pagination from day one</h4>
<p>Never return "all orders". Return a page and a way to get the next one. Even if there are 20 rows today, there will be 2 million later, and adding pagination afterwards breaks every client.</p>
<div class="callout tip"><p>Write the API docs (OpenAPI / Swagger) before the code. If an endpoint is hard to describe, it is probably badly designed.</p></div>` },
    { name: 'Intermediate', body: `<h4>Versioning</h4>
<p>You will need to change things. Options: version in the URL (<code>/v2/orders</code>, most visible, easiest to route), in a header (<code>Api-Version: 2024-06-01</code>, cleaner URLs, Stripe-style dated versions), or in the media type (rare). Whichever you pick, the real rule is: <strong>additive changes do not need a new version</strong>. Adding a field, a new endpoint or a new optional parameter is safe. Removing or renaming a field, changing a type or a default, or tightening validation is breaking and needs a new version plus a deprecation period with a sunset date announced in headers.</p>
<h4>Offset vs cursor pagination</h4>
<div class="compare"><div><h5>Offset: ?page=50&amp;size=20</h5><p>Easy, lets users jump to page 50. But the database must skip 1,000 rows (slow on big tables) and if a row is inserted while paging, items shift and the client sees duplicates or gaps.</p></div><div><h5>Cursor: ?after=eyJpZCI6ODg0MX0&amp;size=20</h5><p>The cursor encodes the last item's sort key (for example id or created-at + id). The query is <code>WHERE (createdAt, id) &lt; (…) ORDER BY … LIMIT 20</code>, uses the index, and stays stable under inserts. No "jump to page N". Use it for feeds and large lists.</p></div></div>
<h4>Filtering, sorting, field selection</h4>
<p>Keep a small, documented set: <code>?status=shipped&amp;minTotal=100&amp;sort=-createdAt,total&amp;fields=id,total</code>. Validate every parameter against an allow-list; never pass sort column names straight into SQL. Return the applied filters in the response so clients can confirm what they got.</p>
<h4>Idempotency keys</h4>
<p>A client sends <code>POST /payments</code>, the network drops the response, the client retries, and the customer is charged twice. The fix: the client generates a unique <code>Idempotency-Key</code> header per operation. The server stores key → response for 24 hours. A retry with the same key returns the stored response without doing the work again. Store the key and the result in the same transaction as the side effect; return 422 if the same key arrives with a different body.</p>
<h4>Rate limiting</h4>
<p>Protects you from one noisy client. Common algorithms: fixed window (simple, bursty at edges), sliding window, token bucket (allows short bursts, smooth average). ASP.NET Core has built-in rate limiting middleware with all three plus concurrency limits. Return 429 with <code>Retry-After</code>, and expose the budget: <code>RateLimit-Limit</code>, <code>RateLimit-Remaining</code>, <code>RateLimit-Reset</code> headers (names from an IETF draft that is still changing; many APIs use X-RateLimit-* equivalents). Limit per API key or user, not per IP alone (many users share one IP behind NAT).</p>
<h4>Caching and conditional requests</h4>
<p>GET responses can carry <code>ETag</code> and <code>Cache-Control</code>. A client sends <code>If-None-Match</code> and gets 304 Not Modified with no body when nothing changed. For updates, <code>If-Match</code> with the ETag gives optimistic concurrency: a stale update returns 412 instead of overwriting someone else's change.</p>
<h4>Documentation</h4>
<p>OpenAPI is the contract: ASP.NET Core generates it from your endpoints (built-in in .NET 9+, or Swashbuckle/NSwag). Generate client SDKs from it (Angular client via openapi-generator or NSwag) so the front end never hand-writes a URL.</p>
<div class="callout warn"><p>HATEOAS (links inside responses that tell clients what they can do next) is part of "pure" REST but rarely used in full. Include a few useful links (next page, self) and move on.</p></div>` },
    { name: 'Expert', body: `<h4>Compatibility rules you can enforce</h4>
<ul>
  <li>Never remove or rename a field; mark it deprecated and keep returning it.</li>
  <li>Never change a field's type or meaning. Add a new field instead.</li>
  <li>Never make an optional input required or tighten validation on an existing version.</li>
  <li>Enums: clients must treat unknown values as "other"; document that up front.</li>
  <li>Defaults are part of the contract: changing a default page size is a breaking change.</li>
  <li>Automate it: diff the OpenAPI document in CI and fail the build on breaking changes.</li>
</ul>
<h4>Idempotency at scale</h4>
<p>The key store must be fast and shared (Redis or the primary database), scoped per client (two clients can reuse the same key), and the check-and-reserve must be atomic: insert the key with status "in progress" first (unique constraint), do the work, then update with the response. A concurrent duplicate hits the unique constraint and either waits or returns 409 "in progress". Expire keys after 24–72 hours. Store a hash of the request body to detect key reuse with different payloads.</p>
<h4>Rate limiting internals</h4>
<p>Token bucket: capacity C, refill rate R per second. Each request takes a token; none left means 429. For a fleet of API servers the bucket must live in a shared store; a Redis Lua script does "refill then take" atomically in one round trip. Alternatively, limit locally per instance and accept small over-admission, or push limits to the gateway. Separate limits for reads vs writes, and a global emergency switch (load shedding) when p99 latency rises.</p>
<h4>Long-running operations</h4>
<p>Do not hold an HTTP request open for a 5-minute report. Return <code>202 Accepted</code> with a <code>Location: /operations/123</code>; the client polls (with <code>Retry-After</code>) or receives a webhook. The operation resource has a status, progress and, when done, a link to the result.</p>
<h4>Bulk and batch</h4>
<p>Offer <code>POST /orders:batch</code> (or <code>/batches</code>) with per-item results and status codes (207-style), a size cap, and partial-success semantics documented clearly. Do not let clients issue 10,000 single calls.</p>
<h4>REST vs GraphQL vs gRPC</h4>
<table><thead><tr><th>Choose</th><th>When</th><th>Watch out</th></tr></thead><tbody>
<tr><td>REST/JSON</td><td>Public APIs, simple resources, HTTP caching matters, broad client support</td><td>Over/under-fetching, many round trips for nested data</td></tr>
<tr><td>GraphQL</td><td>Many front ends needing different shapes of the same graph; mobile bandwidth</td><td>No HTTP caching by URL, N+1 queries (needs DataLoader), query cost limits, complex auth per field</td></tr>
<tr><td>gRPC</td><td>Service-to-service inside the cluster, streaming, strict contracts, low latency</td><td>Browser support needs gRPC-Web, binary payloads are harder to debug, HTTP/2 required</td></tr>
</tbody></table>
<h4>Security on the contract</h4>
<p>Authentication (OAuth 2 / OpenID Connect bearer tokens) is table stakes. Beyond that: authorize per resource (user 42 may not GET /orders/7), reject unknown fields in strict mode for sensitive endpoints to prevent mass assignment, cap page sizes and body sizes, and log the API key with every request for abuse tracing. Public APIs need a sandbox environment and rotating keys.</p>
<h4>Failure modes</h4>
<ul>
  <li>Offset pagination on a 50-million-row table: page 10,000 times out.</li>
  <li>POST without idempotency keys behind a retrying gateway: duplicate orders at 2 a.m.</li>
  <li>Rate limit by IP only: an entire office behind one NAT gets blocked by one bad script.</li>
  <li>Error bodies that differ per endpoint: every client writes bespoke parsing and gets it wrong.</li>
  <li>Breaking change shipped as a "fix": partner integrations fail with no deprecation notice.</li>
</ul>
<div class="callout idea"><p>Interview angle: "Design the API for X" is graded on resource modelling, pagination and error handling, idempotency on writes, versioning strategy, and rate limiting. Say those five words early.</p></div>` }
  ],
  flow: {
    title: 'A safe POST at scale: idempotency, rate limit, errors',
    steps: [
      { title: 'Client builds request', desc: 'The mobile app generates a UUID as Idempotency-Key and sends POST /v1/orders with a bearer token.' },
      { title: 'Gateway rate check', desc: 'Token bucket for this API key: 100 requests/minute. A token is taken; headers RateLimit-Remaining: 57 are added. No tokens → 429 with Retry-After.' },
      { title: 'Validation', desc: 'The body is validated. A bad field returns 422 Problem Details with an errors map naming each field, never a stack trace.' },
      { title: 'Reserve the key', desc: 'The server inserts (clientId, key, bodyHash, status=in_progress) with a unique constraint. A duplicate insert means a retry or a concurrent call.' },
      { title: 'Do the work once', desc: 'The order is created in the same transaction that updates the key row to status=done with the stored response and 201 Created + Location header.' },
      { title: 'Network drops the reply', desc: 'The client never sees the 201 and retries with the same key.' },
      { title: 'Replay the stored response', desc: 'The server finds the key with status=done and the same body hash and returns the saved 201 without creating anything. A different body hash would return 422.' },
      { title: 'Client reads the list', desc: 'GET /v1/orders?after=<cursor>&size=20 uses cursor pagination so the list is fast and stable even while new orders arrive.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'ASP.NET Core minimal API: cursor pagination, Problem Details, rate limiting, ETag', code: `using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();                  // consistent RFC 9457 error bodies
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddTokenBucketLimiter("per-key", opt =>
    {
        opt.TokenLimit = 100;                           // burst capacity
        opt.TokensPerPeriod = 100;                      // refill...
        opt.ReplenishmentPeriod = TimeSpan.FromMinutes(1); // ...per minute
        opt.QueueLimit = 0;
    });
    // In production partition by API key / user: o.GlobalLimiter = PartitionedRateLimiter.Create(...)
});
builder.Services.AddDbContext<AppDbContext>(/* UseSqlServer(...) */);

var app = builder.Build();
app.UseExceptionHandler();                             // unhandled -> 500 Problem Details
app.UseStatusCodePages();
app.UseRateLimiter();

var v1 = app.MapGroup("/v1").RequireRateLimiting("per-key");

// GET /v1/orders?after=<cursor>&size=20&status=shipped&sort=-createdAt
v1.MapGet("/orders", async (AppDbContext db, string? after, int size = 20, string? status = null) =>
{
    if (size is < 1 or > 100)
        return Results.Problem(statusCode: 400, title: "Invalid page size", detail: "size must be 1..100");

    var query = db.Orders.AsNoTracking().AsQueryable();
    if (status is not null) query = query.Where(o => o.Status == status);

    // Cursor = (createdAt, id) of the last item, base64-encoded "ticks:id". Stable under inserts.
    if (Cursor.TryDecode(after, out var cAt, out var cId))
        query = query.Where(o => o.CreatedAt < cAt || (o.CreatedAt == cAt && o.Id < cId));

    var page = await query.OrderByDescending(o => o.CreatedAt).ThenByDescending(o => o.Id)
                          .Take(size + 1)                                   // +1 to know if there is more
                          .Select(o => new OrderDto(o.Id, o.Status, o.Total, o.CreatedAt))
                          .ToListAsync();

    var hasMore = page.Count > size;
    if (hasMore) page.RemoveAt(size);
    var next = hasMore ? Cursor.Encode(page[^1].CreatedAt, page[^1].Id) : null;

    return Results.Ok(new { items = page, nextCursor = next });
});

// GET /v1/orders/{id} with ETag for caching and optimistic concurrency
v1.MapGet("/orders/{id:int}", async (int id, AppDbContext db, HttpContext ctx) =>
{
    var o = await db.Orders.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
    if (o is null) return Results.Problem(statusCode: 404, title: "Order not found");

    var etag = "\\"" + Convert.ToBase64String(o.RowVersion) + "\\"";
    if (ctx.Request.Headers.IfNoneMatch == etag) return Results.StatusCode(304);
    ctx.Response.Headers.ETag = etag;
    ctx.Response.Headers.CacheControl = "private, max-age=30";
    return Results.Ok(new OrderDto(o.Id, o.Status, o.Total, o.CreatedAt));
});

app.Run();

public record OrderDto(int Id, string Status, decimal Total, DateTime CreatedAt);
public static class Cursor
{
    public static string Encode(DateTime at, int id)
        => Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(at.Ticks + ":" + id));
    public static bool TryDecode(string? s, out DateTime at, out int id)
    {
        at = default; id = 0;
        if (string.IsNullOrEmpty(s)) return false;
        try
        {
            var parts = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(s)).Split(':');
            at = new DateTime(long.Parse(parts[0]), DateTimeKind.Utc); id = int.Parse(parts[1]); return true;
        }
        catch { return false; }
    }
}` },
    { lang: 'csharp', title: 'Idempotency-Key middleware for POST endpoints', code: `using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;   // DbUpdateException

// Table: IdempotencyKeys(ClientId, Key) PK, BodyHash, Status, StatusCode, ResponseBody, CreatedUtc
public sealed class IdempotencyMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext ctx, AppDbContext db)
    {
        if (ctx.Request.Method != HttpMethods.Post || !ctx.Request.Headers.TryGetValue("Idempotency-Key", out var keyValues))
        { await next(ctx); return; }

        var key = keyValues.ToString();
        var clientId = ctx.User.FindFirst("client_id")?.Value ?? "anonymous";

        ctx.Request.EnableBuffering();
        using var reader = new StreamReader(ctx.Request.Body, leaveOpen: true);
        var body = await reader.ReadToEndAsync();
        ctx.Request.Body.Position = 0;
        var bodyHash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(body)));

        var existing = await db.IdempotencyKeys.FindAsync(clientId, key);
        if (existing is not null)
        {
            if (existing.BodyHash != bodyHash)
            { ctx.Response.StatusCode = 422; await ctx.Response.WriteAsJsonAsync(new { title = "Idempotency-Key reused with a different body" }); return; }
            if (existing.Status == "in_progress")
            { ctx.Response.StatusCode = 409; await ctx.Response.WriteAsJsonAsync(new { title = "Request already in progress" }); return; }

            ctx.Response.StatusCode = existing.StatusCode;              // replay saved response
            ctx.Response.ContentType = "application/json";
            await ctx.Response.WriteAsync(existing.ResponseBody);
            return;
        }

        // Reserve the key (unique PK makes a concurrent duplicate fail here)
        db.IdempotencyKeys.Add(new IdempotencyKey { ClientId = clientId, Key = key, BodyHash = bodyHash, Status = "in_progress", CreatedUtc = DateTime.UtcNow });
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException) { ctx.Response.StatusCode = 409; return; }

        // Capture the real response
        var original = ctx.Response.Body;
        using var buffer = new MemoryStream();
        ctx.Response.Body = buffer;
        await next(ctx);
        buffer.Position = 0;
        var responseBody = await new StreamReader(buffer).ReadToEndAsync();
        buffer.Position = 0;
        await buffer.CopyToAsync(original);
        ctx.Response.Body = original;

        var row = await db.IdempotencyKeys.FindAsync(clientId, key);
        row!.Status = "done"; row.StatusCode = ctx.Response.StatusCode; row.ResponseBody = responseBody;
        await db.SaveChangesAsync();
        // A background job deletes rows older than 24h.
    }
}
public sealed class IdempotencyKey
{
    public string ClientId { get; set; } = ""; public string Key { get; set; } = "";
    public string BodyHash { get; set; } = ""; public string Status { get; set; } = "";
    public int StatusCode { get; set; } public string ResponseBody { get; set; } = "";
    public DateTime CreatedUtc { get; set; }
}` },
    { lang: 'json', title: 'Problem Details error body (RFC 9457) with validation errors', code: `{
  "type": "https://api.example.com/problems/validation",
  "title": "One or more validation errors occurred.",
  "status": 422,
  "detail": "Fix the listed fields and retry.",
  "instance": "/v1/orders",
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
  "errors": {
    "items[0].quantity": ["Must be at least 1."],
    "shippingAddress.postalCode": ["Required."]
  }
}` }
  ],
  pitfalls: [
    'Shipping an endpoint without pagination "because the list is small". It will not stay small, and adding it later breaks clients.',
    'POST endpoints without idempotency keys behind retrying gateways or flaky mobile networks: duplicate orders and double charges.',
    'Renaming or removing a JSON field in place. Add the new field, deprecate the old one, remove it only in the next major version after a sunset period.',
    'Rate limiting by IP only. Offices, universities and mobile carriers put thousands of users behind one address.',
    'Passing sort or filter parameters straight into SQL. Allow-list every column and operator.',
    'Different error shapes per endpoint. Use Problem Details everywhere, including from the gateway.'
  ],
  quiz: [
    { q: 'Which change does NOT require a new API version?', options: ['Renaming the "total" field to "amount" in every response', 'Adding an optional "currency" field to the response', 'Changing the "id" field from a number to a string', 'Making the "email" field required when creating a user'], answer: 1, why: 'Adding an optional field is additive; existing clients ignore it. The others change or remove something clients already depend on.' },
    { q: 'Why prefer cursor pagination for a large activity feed?', options: ['It lets users jump straight to page 50 without earlier pages', 'It stays stable under inserts and uses the index, not row skipping', 'It needs no sorting, so the database can return rows in any order', 'It returns fewer bytes because the cursor compresses each page'], answer: 1, why: 'A cursor says "give me items after this key", which is an indexed range query and does not shift when new rows arrive. Offset must skip N rows and drifts as data changes.' },
    { q: 'An idempotency key arrives again with a different request body. The server should…', options: ['Process it as a new request, since the body is new', 'Return the stored response and ignore the new body', 'Reject it (409/422), because the key was misused', 'Overwrite the stored response with the new result'], answer: 2, why: 'Same key means "same operation". A different body is a client bug; replaying or reprocessing would hide it and risk wrong side effects.' },
    { q: 'A client gets HTTP 429. What should it do?', options: ['Retry immediately in a tight loop until a request gets through', 'Wait for the Retry-After period, then retry with backoff', 'Switch the request to GET, because GET is never rate limited', 'Change its IP address so the server sees a new client'], answer: 1, why: '429 means the rate limit was hit; Retry-After tells the client when its budget refills. Immediate retries just burn more budget.' },
    { q: 'Which protocol fits a browser-facing public API best by default?', options: ['gRPC over HTTP/2 with protobuf', 'REST/JSON over HTTPS', 'Raw TCP sockets with a custom format', 'SOAP with XML envelopes'], answer: 1, why: 'REST/JSON works in every browser and client, caches by URL, and is easy to debug. gRPC shines for internal service-to-service traffic and needs gRPC-Web in browsers.' },
    { q: 'What does an ETag with If-Match give you on a PUT?', options: ['Compression: the server shrinks the body using the ETag', 'Optimistic concurrency: a stale update is rejected with 412', 'Authentication: the ETag proves which user sent it', 'Faster writes: the server skips validation on a match'], answer: 1, why: 'The client sends the version it read; if the resource changed since, the server refuses, so two users cannot silently overwrite each other.' }
  ],
  takeaways: [
    'Model resources as plural nouns, use HTTP methods and status codes for what they mean, and return one error shape (Problem Details) everywhere.',
    'Paginate every list from day one; prefer cursors for big or fast-changing data.',
    'Every non-idempotent POST gets an Idempotency-Key so retries are safe.',
    'Additive changes are free; removals and renames need a new version plus a deprecation window.',
    'Rate limit per client with token buckets, return 429 + Retry-After, and show the budget in headers.',
    'OpenAPI is the contract: generate it, diff it in CI, generate clients from it.'
  ],
  interview: [
    { q: 'How would you version a public REST API?', a: `<p>Prefer URL or header versioning with a clear policy: additive changes stay in the current version; breaking changes get a new major version. Run old versions in parallel with a published sunset date, Deprecation/Sunset headers, and usage monitoring so you know when it is safe to retire them.</p>` },
    { q: 'Explain idempotency keys.', a: `<p>The client sends a unique key with a POST. The server atomically reserves the key, performs the operation once, stores the response against the key, and replays that response on retries. Same key with a different body is rejected. Keys expire after about a day.</p>` },
    { q: 'Offset vs cursor pagination?', a: `<p>Offset is simple and allows random page access but gets slower with depth and drifts when data changes. Cursor pagination encodes the last seen sort key, turning each page into an indexed range query that is stable under inserts; it does not support jumping to arbitrary pages.</p>` },
    { q: 'How do you rate limit across many API servers?', a: `<p>Keep the bucket state in a shared store (Redis) and update it atomically with a Lua script, or enforce at the gateway. Partition limits by API key or user, keep separate budgets for reads and writes, return 429 with Retry-After, and expose remaining budget in headers.</p>` }
  ]
};
/* ───────────────────────── m3-real-systems ───────────────────────── */
window.CONTENT['m3-real-systems'] = {
  hook: `Every system design interview is the same seven steps in a different costume. Learn the steps on three classic systems and you can walk into any of them.`,
  intro: `<p>A <span class="term">high-level design</span> (HLD) describes a whole system: which parts exist, how they talk, where data lives, and how it survives growth and failure. It is the diagram on the whiteboard, not the code inside each box.</p>
<p>The reliable way to produce one is a fixed order of steps: <strong>requirements</strong> (what it must do and how big it is), <strong>estimates</strong> (requests per second, storage, bandwidth), <strong>API</strong> (the few calls clients make), <strong>data model</strong> (tables or key-value shapes), <strong>architecture</strong> (boxes and arrows), <strong>deep dives</strong> (the two or three hard parts), and <strong>bottlenecks</strong> (what breaks first and what you do about it).</p>
<p>This lesson walks that path three times: a URL shortener (small data, enormous read volume), a chat system (real-time, ordering, delivery), and a news feed (fan-out and ranking). Each one teaches a different muscle, and the numbers matter more than the names of products.</p>`,
  realLife: {
    title: 'Three shops on one street',
    body: `<p>Think of three shops. A <strong>key-cutting kiosk</strong> gets thousands of quick visits a day; each visit is identical and tiny. That is the URL shortener: make a key once, hand out copies all day. Speed and never losing a key are everything.</p>
<p>A <strong>post office</strong> moves letters between specific people and must deliver them in order, confirm delivery, and hold mail when you are away. That is the chat system.</p>
<p>A <strong>newspaper</strong> has to decide, for every reader, which stories go on their front page, and it has to print millions of personalised copies before breakfast. That is the news feed: deciding whether to assemble each copy when it is printed or when it is read is the whole design.</p>
<p>Where real companies use this: bit.ly and TinyURL are shorteners; WhatsApp, Slack and Microsoft Teams are chat systems; Twitter/X, Instagram and LinkedIn feeds all went through the fan-out-on-write vs fan-out-on-read decision in public engineering talks.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The seven steps, in plain words</h4>
<ol>
  <li><strong>Requirements:</strong> what must it do (functional) and how well (non-functional: fast, always up, consistent?). Ask about scale: how many users, how many actions per day.</li>
  <li><strong>Estimates:</strong> turn users and actions into numbers per second and bytes. This tells you whether one server is enough or you need hundreds.</li>
  <li><strong>API:</strong> the three to five calls clients make. Writing them down forces clarity.</li>
  <li><strong>Data model:</strong> the main tables or key-value shapes and which database type fits.</li>
  <li><strong>Architecture:</strong> clients → load balancer → app servers → cache → database, plus queues and workers where work can wait.</li>
  <li><strong>Deep dives:</strong> the two or three hard problems unique to this system.</li>
  <li><strong>Bottlenecks:</strong> what fails first, single points of failure, and how to fix each.</li>
</ol>
<h4>Numbers you should carry in your head</h4>
<table><thead><tr><th>Fact</th><th>Rough value</th></tr></thead><tbody>
<tr><td>Seconds in a day</td><td>86,400 (≈ 100,000 for mental math)</td></tr>
<tr><td>1 million requests/day</td><td>≈ 12 per second average, plan for 2–5× at peak</td></tr>
<tr><td>Memory read</td><td>~100 ns; SSD read ~100 µs; network round trip in a data centre ~0.5 ms; across continents ~100+ ms</td></tr>
<tr><td>One modern server</td><td>Thousands of simple requests/sec; a database, thousands of simple queries/sec</td></tr>
<tr><td>Storage</td><td>A short text row ≈ 100 bytes–1 KB; a photo ≈ 200 KB–2 MB</td></tr>
</tbody></table>
<h4>URL shortener in one paragraph</h4>
<p>Users give a long URL and get a short code like <code>abc123</code>. Visiting the short link redirects to the long URL. Writes are rare, reads are enormous (one link shared on TV gets millions of clicks). So: generate a unique code, store code → URL, cache the popular ones, and redirect fast.</p>
<h4>Chat in one paragraph</h4>
<p>Users send messages to people or groups and see them instantly. The hard parts are keeping a live connection open to each phone, delivering in order, storing messages until the receiver is online, and showing "delivered" and "read" ticks.</p>
<h4>News feed in one paragraph</h4>
<p>Users follow others and see a list of recent posts from everyone they follow. The hard part is that a post by someone with 10 million followers must appear in 10 million feeds. Do you copy it into every feed when it is posted, or assemble each feed when it is opened?</p>
<div class="callout tip"><p>In any design conversation, say the numbers out loud. "That is 1,200 writes per second, which one database handles, but 40,000 reads per second, so we need a cache" is the sentence that shows you can design.</p></div>` },
    { name: 'Intermediate', body: `<h4>System 1: URL shortener</h4>
<p><strong>Requirements:</strong> shorten, redirect, optional custom alias and expiry, click analytics. 100 million new URLs per month, 10:1 read/write (really more), links kept 5 years.</p>
<p><strong>Estimates:</strong> 100M/month ≈ 40 writes/sec; reads ≈ 400+/sec average, tens of thousands at peak. Storage: 100M × 12 months × 5 years = 6 billion rows × ~500 bytes ≈ 3 TB. Cache: 20% of daily reads cover 80% of traffic; a few GB of Redis.</p>
<p><strong>API:</strong> <code>POST /urls {longUrl, alias?, expiresAt?} → {shortUrl}</code>; <code>GET /{code} → 302 Location: longUrl</code>; <code>GET /urls/{code}/stats</code>.</p>
<p><strong>Data model:</strong> <code>Urls(code PK, longUrl, ownerId, createdAt, expiresAt)</code>. Code is the lookup key, so any key-value store or a SQL table with a clustered index on code works. Analytics go to a separate append-only store (events → Kafka → warehouse), never into the hot table.</p>
<p><strong>Key generation:</strong> 7 characters of base62 (a–z, A–Z, 0–9) gives 62⁷ ≈ 3.5 trillion codes. Options: (a) hash the long URL (MD5/SHA) and take the first 7 chars, handle collisions by appending a counter; (b) a global counter encoded in base62, issued in ranges to each server (a Key Generation Service hands out blocks of 100,000 ids so servers never coordinate per request); (c) pre-generate random keys into a pool. Counter-based is simplest and collision-free; predictable codes are the trade-off.</p>
<p><strong>301 vs 302:</strong> 301 (permanent) lets browsers cache the redirect, so you never see repeat clicks and lose analytics; 302 (or 307) keeps every click going through you. Choose 302 if analytics matter.</p>
<p><strong>Deep dives:</strong> read path = CDN/edge cache → Redis (code → URL) → database; expiry handled lazily on read plus a nightly sweep; rate-limit creation per user; validate and block malicious URLs.</p>
<h4>System 2: Chat (WhatsApp-style)</h4>
<p><strong>Requirements:</strong> 1:1 and group chat (up to a few hundred members), online presence, delivered/read receipts, message history, media. 500M daily users, 50 messages each per day.</p>
<p><strong>Estimates:</strong> 25 billion messages/day ≈ 290k/sec average, ~1M/sec peak. Each message ~200 bytes of text plus metadata → ~5 TB/day of text; media is far bigger and goes to object storage with a CDN, the message only carries a URL.</p>
<p><strong>Connections:</strong> HTTP request/response cannot push to a phone. Each online device keeps one <span class="term">WebSocket</span> open to a chat server. A server holds maybe 100k–1M idle connections; 500M users → a fleet of a thousand or more chat servers plus a <em>session registry</em> (user → which server) in Redis so a message for user B can be routed to B's server.</p>
<p><strong>API (over the socket):</strong> <code>send {clientMsgId, to, text}</code>, <code>ack {serverMsgId}</code>, <code>receipt {msgId, delivered|read}</code>; HTTP for history: <code>GET /conversations/{id}/messages?before=cursor</code>.</p>
<p><strong>Data model:</strong> messages partitioned by conversation id, ordered by a time-based id (Snowflake-style: timestamp + machine + sequence), so one conversation is one contiguous range: Cassandra/ScyllaDB or HBase suit this write-heavy, range-read pattern. Inbox table per user for "unread since".</p>
<p><strong>Flow:</strong> A sends → A's server assigns id, persists to message store, enqueues → looks up B's server in the registry → pushes over B's socket → B's device acks → "delivered" receipt flows back to A. If B is offline, the message waits in B's inbox and a push notification (APNs/FCM) is sent; it is delivered on reconnect.</p>
<p><strong>Groups:</strong> one write, then fan-out to each member's server; for 500-member groups that is 500 pushes per message, fine; for "channels" with millions, switch to pull.</p>
<h4>System 3: News feed</h4>
<p><strong>Requirements:</strong> post, follow, view a feed of recent posts from followed users, ranked. 300M daily users, each opens the feed 10 times a day; 1 in 10 posts daily.</p>
<p><strong>Estimates:</strong> feed reads: 3 billion/day ≈ 35k/sec (peaks 100k+). Posts: 30M/day ≈ 350/sec. Reads dominate by 100:1, so the design optimises reads.</p>
<p><strong>Fan-out on write (push):</strong> when a user posts, a worker appends the post id to the cached feed list of every follower (Redis list per user, capped at ~1,000 ids). Reading a feed is one Redis call plus hydrating post bodies from a post cache. Cost: a celebrity with 20M followers triggers 20M writes per post.</p>
<p><strong>Fan-out on read (pull):</strong> when a user opens the feed, fetch recent posts from each followed user and merge-sort. No work on post, but a user following 1,000 accounts triggers 1,000 lookups per open and the feed is slow.</p>
<p><strong>Hybrid (what big feeds do):</strong> push for normal users, pull for accounts above a follower threshold (say 100k), and merge the two at read time. Inactive users (not seen in 30 days) are skipped during push and rebuilt lazily.</p>
<p><strong>Ranking:</strong> candidate posts (a few hundred) are scored by a model using recency, affinity with the author, engagement predictions; the top N are returned with a cursor. Scoring runs in a separate service with strict latency budget (tens of ms).</p>
<div class="callout warn"><p>Every one of these systems keeps media (images, video, voice notes) out of the main database. Media goes to object storage behind a CDN; the row stores only a URL.</p></div>` },
    { name: 'Expert', body: `<h4>What separates a senior answer</h4>
<p>Junior answers list components. Senior answers name the trade-off at each step, pick a side, and say what would make them change their mind. Below are the trade-offs that interviewers probe on these three systems.</p>
<h4>URL shortener, the hard questions</h4>
<ul>
  <li><strong>Consistency of the write:</strong> a user creates a link and clicks it one second later. With async replicas the redirect may 404. Read-your-writes: route the first reads to the primary, or write to the cache at creation time.</li>
  <li><strong>Hot links:</strong> one code gets 100k clicks/sec. Redis handles it, but one shard holds that key. Replicate reads across replicas, or push the redirect map to the CDN/edge (edge workers can serve 302s without touching your servers).</li>
  <li><strong>Key service availability:</strong> if the counter service is down, nobody can create links. Pre-allocate ranges per app server (100k ids each, stored locally), so the service can be down for minutes with no impact. Ranges lost on crash are simply skipped.</li>
  <li><strong>Analytics at scale:</strong> never write a click row synchronously on the redirect path. Emit an event to a queue; aggregate in a stream processor; store counts in a time-series or columnar store.</li>
  <li><strong>Abuse:</strong> rate limits, URL reputation checks, and the ability to disable a code instantly (cache invalidation path must exist).</li>
</ul>
<h4>Chat, the hard questions</h4>
<ul>
  <li><strong>Ordering:</strong> two messages from different senders in a group may arrive in different orders on different devices. Assign the authoritative order on the server at persist time (per-conversation sequence number) and have clients sort by it, showing "sending…" until the server id arrives.</li>
  <li><strong>Exactly-once appearance:</strong> the client retries sends over flaky mobile networks; the server deduplicates by <code>clientMsgId</code> per sender. Receipts are idempotent too.</li>
  <li><strong>Connection churn:</strong> phones switch networks constantly. Keep a short reconnect backoff, resume from the last acked message id, and treat presence as "last seen" with heartbeats every ~30 s rather than exact online/offline.</li>
  <li><strong>Server failover:</strong> a chat server dies with 500k connections. Clients reconnect to other servers (load balancer with least-connections); the session registry entries expire via TTL; undelivered messages are safe in the store and inbox, not in server memory.</li>
  <li><strong>End-to-end encryption:</strong> the server routes ciphertext it cannot read; key exchange (Signal protocol style) and multi-device key handling become the deep dive. Server-side search is then impossible; search happens on device.</li>
  <li><strong>Storage layout:</strong> partition key = conversation id, clustering = message id descending. Avoid unbounded partitions for very old, very active groups by bucketing by month.</li>
</ul>
<h4>News feed, the hard questions</h4>
<ul>
  <li><strong>Celebrity problem:</strong> the hybrid approach. State the threshold, explain that it is tuned from write amplification measurements, and that the read path merges the pushed list with pulled celebrity posts and re-ranks.</li>
  <li><strong>Feed staleness vs cost:</strong> pushing to 300M feeds for every post is wasteful when most users will not open the app today. Push only to users active in the last N days; rebuild on demand for the rest.</li>
  <li><strong>Deletes and edits:</strong> a deleted post is already in millions of cached feeds. Store only ids in feeds and filter at hydration time against the post store, so deletion is a single flag.</li>
  <li><strong>Ranking latency:</strong> candidate generation (hundreds) → lightweight scoring → heavy model on the top 50. Timeouts fall back to chronological order rather than an empty feed.</li>
  <li><strong>Pagination:</strong> cursor by (score, post id) snapshot; a user scrolling must not see repeats as new posts arrive. Freeze the candidate set for a session or dedupe by seen-ids on the client.</li>
  <li><strong>Consistency:</strong> a user posts and expects to see it at the top immediately. Insert into the author's own feed synchronously; everything else is eventual.</li>
</ul>
<h4>Cross-cutting: what breaks first</h4>
<table><thead><tr><th>System</th><th>First bottleneck</th><th>Fix</th></tr></thead><tbody>
<tr><td>Shortener</td><td>Database reads on redirect</td><td>Cache + CDN edge redirects; read replicas</td></tr>
<tr><td>Chat</td><td>Connection count per server; message store write rate</td><td>Horizontal chat servers + registry; partition by conversation; async receipts</td></tr>
<tr><td>Feed</td><td>Fan-out write amplification; ranking latency</td><td>Hybrid push/pull; precomputed candidates; strict ranking budgets with fallback</td></tr>
</tbody></table>
<div class="callout idea"><p>Interview angle: finish every deep dive with a sentence of the form "if X grew 10×, I would change Y". It shows you understand which assumption the design depends on.</p></div>` }
  ],
  flow: {
    title: 'The seven-step method, applied to a URL shortener',
    steps: [
      { title: '1. Requirements', desc: 'Shorten, redirect, expiry, analytics. 100M new links a month, reads far outnumber writes, codes must never collide, redirects must be fast everywhere.' },
      { title: '2. Estimates', desc: '~40 writes/sec, 400–40,000 reads/sec, ~3 TB over 5 years, a few GB of hot cache. Conclusion: one database is fine for writes; reads need a cache.' },
      { title: '3. API', desc: 'POST /urls → shortUrl; GET /{code} → 302; GET /urls/{code}/stats. Three calls, documented before any code.' },
      { title: '4. Data model', desc: 'Urls(code, longUrl, ownerId, createdAt, expiresAt). Lookup by code only, so a key-value store or a SQL table with code as the clustered key.' },
      { title: '5. Architecture', desc: 'Client → CDN → load balancer → stateless API servers → Redis (code→URL) → database with replicas. Key Generation Service hands out id ranges. Click events → queue → analytics store.' },
      { title: '6. Deep dives', desc: 'Base62 keys from pre-allocated counter ranges; 302 not 301 to keep analytics; cache fill at creation to avoid 404 on first click; lazy expiry.' },
      { title: '7. Bottlenecks', desc: 'Hot codes → edge redirects; key service down → local ranges; abuse → rate limits and instant disable with cache invalidation.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'URL shortener: base62 codes from pre-allocated id ranges, cached redirect', code: `using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

// ---- Key generation: each server leases a range of ids, so no per-request coordination ----
public sealed class RangeKeyGenerator(IKeyRangeService rangeService)
{
    private long _next, _end;                       // current leased range [_next, _end)
    private readonly SemaphoreSlim _lock = new(1, 1);

    public async Task<string> NextCodeAsync()
    {
        await _lock.WaitAsync();
        try
        {
            if (_next >= _end) (_next, _end) = await rangeService.LeaseAsync(size: 100_000); // one DB call per 100k codes
            return Base62.Encode(_next++);
        }
        finally { _lock.Release(); }
    }
}

public static class Base62
{
    private const string Alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    public static string Encode(long n)
    {
        if (n == 0) return "0";
        var chars = new Stack<char>();
        while (n > 0) { chars.Push(Alphabet[(int)(n % 62)]); n /= 62; }
        return new string(chars.ToArray());        // 62^7 = 3.5 trillion codes in 7 chars
    }
}

public interface IKeyRangeService { Task<(long start, long end)> LeaseAsync(int size); }
// SQL version: UPDATE Counter SET Value = Value + @size OUTPUT deleted.Value, inserted.Value;

// ---- Endpoints ----
// POST /urls
// var code = await gen.NextCodeAsync();
// await db.Urls.AddAsync(new UrlRow(code, req.LongUrl, userId, DateTime.UtcNow, req.ExpiresAt)); await db.SaveChangesAsync();
// await cache.StringSetAsync("u:" + code, req.LongUrl, TimeSpan.FromDays(1)); // warm cache: first click never misses
// return Results.Created("/" + code, new { shortUrl = baseUrl + "/" + code });

public sealed class RedirectHandler(IDatabase cache, AppDbContext db, IClickEvents events)
{
    public async Task<IResult> HandleAsync(string code, HttpContext ctx)
    {
        string? target = await cache.StringGetAsync("u:" + code);   // ~1 ms
        if (target is null)
        {
            var row = await db.Urls.AsNoTracking().FirstOrDefaultAsync(u => u.Code == code);
            if (row is null || (row.ExpiresAt is not null && row.ExpiresAt < DateTime.UtcNow))
                return Results.NotFound();
            target = row.LongUrl;
            await cache.StringSetAsync("u:" + code, target, TimeSpan.FromDays(1));
        }

        // Analytics off the hot path: fire an event, never a synchronous INSERT.
        events.Enqueue(new ClickEvent(code, DateTime.UtcNow, ctx.Request.Headers.UserAgent.ToString(), ctx.Request.Headers.Referer.ToString()));

        // 302/307 (temporary) so browsers do not cache the redirect and every click is counted.
        return Results.Redirect(target, permanent: false);
    }
}
public record UrlRow(string Code, string LongUrl, int OwnerId, DateTime CreatedAt, DateTime? ExpiresAt);
public record ClickEvent(string Code, DateTime At, string UserAgent, string Referer);
public interface IClickEvents { void Enqueue(ClickEvent e); }` },
    { lang: 'csharp', title: 'News feed: hybrid fan-out on write with a celebrity threshold', code: `using StackExchange.Redis;

// Feed = Redis list of post ids per user, newest first, capped. Celebrities are pulled at read time.
public sealed class FeedService(IDatabase redis, IFollowGraph graph, IPostStore posts, IRanker ranker)
{
    private const int CelebrityThreshold = 100_000;   // tuned from write-amplification measurements
    private const int FeedCap = 1000;

    // Called by a background worker when a post is created (via queue, not inline in the HTTP request).
    public async Task FanOutAsync(long postId, int authorId)
    {
        var followerCount = await graph.FollowerCountAsync(authorId);
        if (followerCount > CelebrityThreshold) return;      // celebrity: followers pull instead

        var activeFollowers = await graph.ActiveFollowersAsync(authorId, activeWithinDays: 30);
        var batch = redis.CreateBatch();
        var tasks = new List<Task>();
        foreach (var followerId in activeFollowers)
        {
            var key = "feed:" + followerId;
            tasks.Add(batch.ListLeftPushAsync(key, postId));
            tasks.Add(batch.ListTrimAsync(key, 0, FeedCap - 1));
        }
        batch.Execute();
        await Task.WhenAll(tasks);
    }

    // Read path: pushed ids + pulled celebrity posts -> rank -> hydrate.
    public async Task<IReadOnlyList<PostDto>> GetFeedAsync(int userId, int take = 20)
    {
        var pushedIds = (await redis.ListRangeAsync("feed:" + userId, 0, 300)).Select(v => (long)v);

        var celebs = await graph.FollowedCelebritiesAsync(userId, CelebrityThreshold);
        var pulledIds = new List<long>();
        foreach (var c in celebs)
            pulledIds.AddRange(await posts.RecentPostIdsAsync(c, limit: 20));

        var candidates = pushedIds.Concat(pulledIds).Distinct().ToList();
        var ranked = await ranker.RankAsync(userId, candidates, budget: TimeSpan.FromMilliseconds(50)); // falls back to recency on timeout

        var hydrated = await posts.GetManyAsync(ranked.Take(take));      // deleted posts are filtered here
        return hydrated;
    }
}

public interface IFollowGraph
{
    Task<int> FollowerCountAsync(int userId);
    Task<IReadOnlyList<int>> ActiveFollowersAsync(int userId, int activeWithinDays);
    Task<IReadOnlyList<int>> FollowedCelebritiesAsync(int userId, int threshold);
}
public interface IPostStore
{
    Task<IReadOnlyList<long>> RecentPostIdsAsync(int authorId, int limit);
    Task<IReadOnlyList<PostDto>> GetManyAsync(IEnumerable<long> ids);
}
public interface IRanker { Task<IReadOnlyList<long>> RankAsync(int userId, IReadOnlyList<long> candidateIds, TimeSpan budget); }
public record PostDto(long Id, int AuthorId, string Text, DateTime CreatedAt);` },
    { lang: 'text', title: 'Chat system: architecture sketch and capacity estimate', code: `REQUIREMENTS   1:1 + groups (<=512), presence, delivered/read receipts, history, media
SCALE          500M DAU x 50 msgs/day = 25B msgs/day ~= 290k/s avg, ~1M/s peak
               text msg ~200 B + metadata -> ~5 TB/day; media via object storage + CDN (URL only in message)

ARCHITECTURE
  Phone --WebSocket--> [LB: least-connections] --> Chat Server (holds ~500k idle sockets, ~1,000+ servers)
                                                      |            |
                               Session Registry (Redis: userId -> serverId, TTL 60s heartbeat)
                                                      |
                             Message Store (Cassandra/Scylla: partition=conversationId, cluster=msgId desc)
                                                      |
                               Inbox / Unread (per user)   Push Service (APNs/FCM) for offline users
                                                      |
                               Media: upload to object storage via presigned URL, CDN for download

SEND FLOW (A -> B)
  1. A sends {clientMsgId, convId, text} over socket
  2. Server assigns msgId = Snowflake(timestamp, server, seq); dedupe on (A, clientMsgId)
  3. Persist to Message Store; append to B's inbox; ack A with msgId  ("sent" tick)
  4. Lookup B in registry -> server S_B -> push over B's socket (or push notification if offline)
  5. B's device acks -> "delivered" receipt routed back to A; later "read" when B opens the chat

ORDERING        per-conversation sequence assigned at persist time; clients sort by it
IDEMPOTENCY     (senderId, clientMsgId) unique for 24h; receipts idempotent
FAILOVER        server dies -> clients reconnect elsewhere, resume from last acked msgId; registry TTL expires
GROUPS          1 write, fan-out push to each member's server; >10k members -> switch to pull on open

ESTIMATE CHECK  1M msgs/s peak / ~20k writes/s per Cassandra node ~= 50+ nodes (plus replication x3)
                socket fleet: 500M online-ish / 500k per server ~= 1,000 servers (plus headroom)
FIRST BOTTLENECK registry lookups (1M/s): shard Redis by userId, cache locally on the sender's server` }
  ],
  pitfalls: [
    'Jumping to boxes before numbers. Without requests/sec and bytes you cannot justify a cache, a queue or a shard.',
    'Using a 301 redirect in a shortener and then wondering why click counts are far too low (browsers cached the redirect).',
    'Writing analytics or receipts synchronously on the hot path. Emit events; aggregate elsewhere.',
    'Fan-out on write for every author. One celebrity post becomes millions of writes; use a hybrid with a threshold.',
    'Storing media or message bodies in a relational row. Put blobs in object storage and keep only URLs/ids in the database.',
    'Keeping undelivered chat messages only in server memory. A crash loses them; persist first, push second.'
  ],
  quiz: [
    { q: 'For a URL shortener with click analytics, which redirect status should you return?', options: ['301 Moved Permanently', '302/307 temporary redirect', '200 OK with the page in an iframe', '404 Not Found'], answer: 1, why: 'A 301 is cached by browsers, so repeat clicks never reach your servers and analytics undercount. A temporary redirect keeps every click flowing through you.' },
    { q: 'Why do large feeds use a hybrid of fan-out on write and on read?', options: ['Redis cannot store lists longer than a few hundred post ids', 'Push is cheap for normal users but explodes for celebrities', 'Pull is always faster, and push is kept only as a backup path', 'Push is always faster, and pull is kept only for deleted posts'], answer: 1, why: 'Pushing one post into 20M feeds is enormous write amplification; pulling for everyone makes reads slow. The hybrid keeps both costs bounded.' },
    { q: 'In a chat system, who decides the final order of messages in a group?', options: ['Each phone’s clock, using the time the message was typed', 'The server, with a per-conversation sequence number', 'The sender, by numbering its own messages before sending', 'The load balancer, in the order connections were opened'], answer: 1, why: 'Device clocks differ and networks reorder. A server-assigned sequence per conversation gives every device the same order to sort by.' },
    { q: 'Why hand out id ranges to shortener servers instead of a global counter call per request?', options: ['Ranges make the codes shorter, so links are easier to type and share', 'It removes a network call and a failure point from each create', 'A counter value cannot be stored safely in a database row', 'Base62 encoding only works on numbers that come in blocks'], answer: 1, why: 'Each server leases 100k ids once and generates locally; the key service can be down for minutes without affecting creates. Skipped ids on crash are harmless.' },
    { q: 'A message arrives for an offline chat user. Correct handling is…', options: ['Drop it and ask the sender to try again when the user is online', 'Hold it in the chat server memory until the user reconnects', 'Persist it, send a push notification, deliver on reconnect', 'Email the full text to the user and delete it from the system'], answer: 2, why: 'Persisted messages survive server crashes; the push notification wakes the app; delivery resumes from the last acked id when the socket reconnects.' },
    { q: 'What is the first thing to do in a design interview after hearing the problem?', options: ['Draw the database tables and their indexes on the whiteboard', 'Clarify requirements and estimate scale with numbers', 'Pick the message broker, since everything depends on it', 'Name the cloud provider and its managed services'], answer: 1, why: 'Every later decision (cache, queue, sharding) is justified by requirements and numbers. Without them you are guessing.' }
  ],
  takeaways: [
    'Same seven steps every time: requirements → estimates → API → data model → architecture → deep dives → bottlenecks.',
    'Say the numbers. Requests per second and bytes decide whether you need a cache, a queue or a shard.',
    'Shortener: base62 keys from leased ranges, cache-first redirects, 302 for analytics, events for clicks.',
    'Chat: one WebSocket per device, a session registry, persist-then-push, server-assigned ordering, idempotent sends and receipts.',
    'Feed: hybrid fan-out with a celebrity threshold, ids in feeds and bodies in a post cache, ranking with a strict budget and a chronological fallback.',
    'Media never lives in the main database; object storage plus CDN, with only URLs in rows.'
  ],
  interview: [
    { q: 'Design a URL shortener.', a: `<p>Clarify scale and analytics. Estimate ~40 writes/s and up to tens of thousands of reads/s. API: create, redirect, stats. Store code→URL with the code as key. Generate 7-char base62 codes from leased counter ranges. Read path: CDN/edge → Redis → DB replicas; warm the cache on create. Use 302 to keep analytics, emit click events to a queue. Discuss hot links, key service availability and abuse.</p>` },
    { q: 'How does WhatsApp deliver a message to an offline user?', a: `<p>The server persists the message and appends it to the recipient's inbox, sends a push notification through APNs/FCM, and when the device reconnects it resumes from its last acknowledged message id and receives the backlog in server-assigned order. Receipts flow back as the device acks and reads.</p>` },
    { q: 'Fan-out on write or on read for a news feed?', a: `<p>Hybrid. Push post ids into followers' cached feeds for normal authors (bounded cost, fast reads); for authors above a follower threshold, followers pull their recent posts at read time and the two lists are merged and ranked. Skip inactive followers during push and rebuild lazily.</p>` },
    { q: 'How do you keep messages ordered in a group chat?', a: `<p>Assign a per-conversation sequence number on the server when the message is persisted and have every client sort by it. Show the message optimistically as "sending" until the server id arrives. Dedupe retries by (sender, clientMsgId).</p>` }
  ]
};

