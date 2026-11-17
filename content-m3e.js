// Module 3 — HLD part 1: distributed fundamentals, load balancing, consistent hashing, caching, distributed transactions, SQL vs NoSQL.
window.CONTENT = window.CONTENT || {};

window.CONTENT['m3-distributed-fundamentals'] = {
  hook: `One computer can be made bigger. A thousand computers can be made to agree. Only the second one keeps a website alive when a data centre loses power.`,
  intro: `<p>A <span class="term">distributed system</span> is a group of computers that work together and look like one system to the user. When you open Instagram, your request may touch twenty different machines. You never notice. That is the goal.</p>
<p>Why not just use one very big computer? Three reasons. First, one machine has a limit: you can only buy so much RAM. Second, one machine is a single point of failure: when it dies, everything dies. Third, your users live all over the world, and a server in Mumbai is slow for someone in Toronto.</p>
<p>The price of using many machines is that they must talk over a network, and networks are slow, lossy and sometimes split in two. Almost every hard problem in system design comes from that one fact. This topic gives you the vocabulary and the mental tools to reason about it: scaling, latency, availability, consistency, and the quick maths (called <span class="term">back-of-envelope estimation</span>) that interviewers love.</p>`,
  realLife: { title: 'A dosa stall that becomes a chain', body: `<p>Imagine a single dosa stall with one cook. When the queue grows, you have two choices. You can hire a faster cook with a bigger pan (that is <strong>vertical scaling</strong>: a bigger machine). Or you can open five stalls across the city with the same menu (that is <strong>horizontal scaling</strong>: more machines).</p>
<p>Five stalls bring new problems. If the price of a masala dosa changes, all five menus must update. If one stall runs out of batter, customers must be sent to another. If two stalls both sell the "last" dosa to two customers, someone goes hungry. Those are consistency, failover and coordination problems, and they are exactly what companies like Swiggy, Netflix and Amazon solve every day with tens of thousands of servers.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Two ways to grow</h4>
<p><span class="term">Vertical scaling</span> (scale up) means a bigger machine: more CPU, more RAM, faster disk. It is simple and needs no code changes, but it has a ceiling and the biggest machines cost a lot. <span class="term">Horizontal scaling</span> (scale out) means more machines. There is no ceiling in theory, and losing one machine is fine, but now your code must work on many boxes at once.</p>
<h4>The three numbers everyone measures</h4>
<ul>
<li><strong>Latency</strong> is how long one request takes. Think "how many seconds until my page loads". Measured in milliseconds, usually as p50 / p95 / p99 (the median, and the slow 5% and 1% of requests).</li>
<li><strong>Throughput</strong> is how many requests you can handle per second (RPS or QPS). Think "how many customers per hour".</li>
<li><strong>Availability</strong> is the share of time the system is working. "Three nines" (99.9%) means about 8.7 hours of downtime per year. "Four nines" (99.99%) is about 52 minutes. "Five nines" is about 5 minutes.</li>
</ul>
<table><thead><tr><th>Availability</th><th>Downtime per year</th><th>Downtime per month</th></tr></thead>
<tbody><tr><td>99%</td><td>3.65 days</td><td>7.3 hours</td></tr><tr><td>99.9%</td><td>8.76 hours</td><td>43.8 minutes</td></tr><tr><td>99.99%</td><td>52.6 minutes</td><td>4.4 minutes</td></tr><tr><td>99.999%</td><td>5.3 minutes</td><td>26 seconds</td></tr></tbody></table>
<h4>The network is not your friend</h4>
<p>Inside one machine, a function call takes nanoseconds and never "gets lost". Between two machines, a call takes milliseconds and can time out, arrive twice, or arrive out of order. A cable can be cut so the left half of your servers cannot reach the right half. This is called a <span class="term">network partition</span>, and it will happen to you.</p>
<div class="callout tip"><p>Rule of thumb for memory: reading from RAM is about 100 ns, reading from an SSD is about 100 µs (1,000× slower), and a round trip across the internet is about 100 ms (another 1,000× slower). Every design decision is about avoiding the slow trips.</p></div>
<h4>What "consistent" means here</h4>
<p>If you write a value on one machine and immediately read from another, do you see the new value? If yes, the system is <span class="term">strongly consistent</span>. If "yes, but maybe after a short delay", it is <span class="term">eventually consistent</span>. Your bank balance needs strong consistency. The like count on a post does not.</p>` },
    { name: 'Intermediate', body: `<h4>CAP, explained without the drama</h4>
<p>The <span class="term">CAP theorem</span> says: when a network partition happens (and it will), you must choose between <strong>Consistency</strong> (every read sees the latest write) and <strong>Availability</strong> (every request gets a non-error answer). You cannot have both during a partition. So real systems are either CP (refuse to answer rather than answer wrong) or AP (always answer, even if slightly stale).</p>
<p><span class="term">PACELC</span> adds the normal case: if there is a <strong>P</strong>artition, choose <strong>A</strong> or <strong>C</strong>; <strong>E</strong>lse, choose between low <strong>L</strong>atency and <strong>C</strong>onsistency. Even with no failure, making every replica agree before answering costs time. Cassandra and DynamoDB lean AP/L; a single-leader SQL database with synchronous replicas leans CP/C.</p>
<h4>Consistency models you will actually meet</h4>
<ul>
<li><strong>Strong (linearizable):</strong> reads always return the latest write. Simple to reason about, expensive to provide.</li>
<li><strong>Read-your-writes:</strong> after you update your profile, <em>you</em> see it immediately, even if others see it a second later. Usually done by routing a user's reads to the replica that took the write for a short while.</li>
<li><strong>Monotonic reads:</strong> you never see time go backwards (a newer value, then an older one).</li>
<li><strong>Eventual:</strong> if writes stop, all replicas converge. Great for feeds, counters and caches.</li>
</ul>
<h4>Idempotency: the superpower of retries</h4>
<p>An operation is <span class="term">idempotent</span> when doing it twice has the same effect as doing it once. "Set balance to 500" is idempotent. "Add 100 to balance" is not. Networks lose replies, so clients retry, so every write API you design should accept an <strong>idempotency key</strong> (a unique id the client sends) and ignore duplicates. Stripe, Razorpay and every payment API work this way.</p>
<h4>Timeouts, retries and backoff</h4>
<p>Never wait forever. Set a timeout on every network call. On failure, retry a small number of times with <span class="term">exponential backoff</span> (wait 100 ms, then 200, then 400) plus <span class="term">jitter</span> (a random extra wait) so that a thousand clients do not all retry at the same instant and knock the server down again. A <span class="term">circuit breaker</span> stops calling a service that keeps failing, and tries again after a cool-down. In .NET, the <code>Polly</code> library and <code>Microsoft.Extensions.Http.Resilience</code> give you all three in a few lines.</p>
<div class="callout warn"><p>Retrying a non-idempotent call is how customers get charged twice. Make the write idempotent first, then add retries.</p></div>
<h4>Back-of-envelope estimation</h4>
<p>Interviewers ask: "Design a photo-sharing app for 10 million daily users." Before drawing boxes, do the maths. Suppose each user uploads 2 photos a day, 500 KB each. That is 20 million photos per day, or 10 TB of new storage per day, or 3.6 PB per year. 20 million uploads over 86,400 seconds is about 230 uploads per second on average, and maybe 5× that at peak, so around 1,200 per second. Reads are usually 10–100× writes; at 50× that is about 11,500 reads per second on average and close to 60,000 at peak. Now you know you need a CDN, object storage and many app servers, not a single SQL table of blobs.</p>` },
    { name: 'Expert', body: `<h4>The fallacies and the failure modes</h4>
<p>Peter Deutsch's "fallacies of distributed computing" are still the best checklist: the network is reliable, latency is zero, bandwidth is infinite, the network is secure, topology does not change, there is one administrator, transport cost is zero, the network is homogeneous. Every outage post-mortem you read breaks one of them.</p>
<p>Real failures are rarely clean. A machine can be <strong>slow</strong> rather than dead (a "grey failure"), which is worse because health checks pass while users wait. Clocks drift, so "which write came first" is not a simple question; systems use logical clocks (Lamport, vector clocks) or hybrid clocks, and Google's Spanner uses GPS and atomic clocks to bound the error. Partial failure means a request can succeed on the server and still look like a failure to the client (the reply was lost). Design every write as if the client will retry it.</p>
<h4>Tail latency and fan-out</h4>
<p>If one call has a p99 of 100 ms and your page fans out to 100 backend calls in parallel, about 63% of pages (1 − 0.99^100) hit at least one slow call, so the page's p50 becomes 100 ms or worse. Google calls this the tail-at-scale problem. Fixes: hedged requests (send the same request to a second replica after a short wait and take the first answer), request deadlines passed along the call chain, and cutting fan-out with caching and denormalisation.</p>
<h4>Consensus in one paragraph</h4>
<p>When machines must agree on one value (who is leader, what is the next log entry), they use a <span class="term">consensus</span> protocol such as Raft or Paxos. Raft elects a leader; writes go to the leader, which replicates them to followers and commits once a majority (a <strong>quorum</strong>) has them. A cluster of 2n+1 nodes can tolerate n failures. This is why etcd, ZooKeeper and Kafka's KRaft run with 3 or 5 nodes, never 2 or 4. Quorum reads and writes (W + R &gt; N) are also how Dynamo-style stores tune consistency per request.</p>
<h4>Availability is a product, not a sum</h4>
<p>Two services in series, each 99.9%, give 99.8% together (0.999 × 0.999). Ten in series give 99%. That is why microservice chains need higher per-service targets, or must degrade gracefully (show the page without recommendations rather than show an error). Two independent replicas in parallel give 1 − (0.001 × 0.001) = 99.9999%, which is why redundancy works so well, as long as the failures really are independent (same rack, same power supply, same bug: not independent).</p>
<h4>Interview angle</h4>
<ul>
<li>Start every design with numbers: users, QPS, storage, read/write ratio, latency targets.</li>
<li>State the consistency you need per data type, not per system. Orders: strong. Feed: eventual.</li>
<li>Name the failure you are protecting against and how you will detect it (health checks, timeouts, alerts).</li>
<li>Say "idempotency key" out loud when you draw any write path with retries.</li>
</ul>
<div class="callout idea"><p>The best senior engineers are not the ones who know the most patterns. They are the ones who ask "what happens when this box dies in the middle of that arrow?" for every box and every arrow.</p></div>` }
  ],
  flow: { title: 'What happens when a request crosses the network and something goes wrong', steps: [
    { title: 'Client sends', desc: 'Your Angular app calls POST /orders with an Idempotency-Key header and starts a 2-second timeout.' },
    { title: 'Server writes', desc: 'The API saves the order to the database. The write succeeds.' },
    { title: 'Reply is lost', desc: 'A network blip drops the HTTP response. The client never sees the 201 Created.' },
    { title: 'Timeout fires', desc: 'After 2 seconds the client gives up and schedules a retry with backoff: wait 300 ms plus random jitter.' },
    { title: 'Client retries', desc: 'The same request is sent again with the same Idempotency-Key.' },
    { title: 'Server recognises', desc: 'The API finds the key already stored, skips the insert, and returns the original order. No duplicate.' },
    { title: 'Client succeeds', desc: 'The user sees one order. The whole dance was invisible to them, which is the point.' }
  ] },
  code: [
    { lang: 'csharp', title: 'Resilient HttpClient: timeout, retry with backoff + jitter, circuit breaker', code: `// dotnet add package Microsoft.Extensions.Http.Resilience
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http.Resilience;
using Polly;
using System.Net.Http.Json;   // JsonContent

var services = new ServiceCollection();

services.AddHttpClient("inventory", c => c.BaseAddress = new Uri("https://inventory.internal/"))
    .AddResilienceHandler("inventory-pipeline", builder =>
    {
        // Order matters: the first strategy added is the outermost one.
        // 1. Retry transient failures with exponential backoff and jitter
        builder.AddRetry(new HttpRetryStrategyOptions
        {
            MaxRetryAttempts = 3,
            Delay = TimeSpan.FromMilliseconds(200),
            BackoffType = DelayBackoffType.Exponential,   // 200, 400, 800 ms
            UseJitter = true                               // spread retries out
        });

        // 2. Stop hammering a service that keeps failing
        builder.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
        {
            FailureRatio = 0.5,                 // open if half the calls fail...
            MinimumThroughput = 20,             // ...out of at least 20 calls...
            SamplingDuration = TimeSpan.FromSeconds(30),
            BreakDuration = TimeSpan.FromSeconds(15)       // then try again after 15 s
        });

        // 3. Never wait forever on a single attempt (added last = innermost, so it applies to each try)
        builder.AddTimeout(TimeSpan.FromSeconds(2));
    });

var provider = services.BuildServiceProvider();
var factory = provider.GetRequiredService<IHttpClientFactory>();
var client = factory.CreateClient("inventory");

// Idempotency key: the server must store this and ignore duplicates
var request = new HttpRequestMessage(HttpMethod.Post, "reservations")
{
    Content = JsonContent.Create(new { Sku = "DOSA-01", Qty = 2 })
};
request.Headers.Add("Idempotency-Key", Guid.NewGuid().ToString());

var response = await client.SendAsync(request);
Console.WriteLine(response.StatusCode);` },
    { lang: 'csharp', title: 'Server side: honouring an Idempotency-Key with EF Core', code: `// Table: IdempotencyKeys(Key PK, ResponseJson, CreatedAt). Keep rows for ~24 h.
app.MapPost("/orders", async (CreateOrder dto, HttpRequest req, AppDbContext db) =>
{
    var key = req.Headers["Idempotency-Key"].FirstOrDefault();
    if (string.IsNullOrEmpty(key))
        return Results.BadRequest("Idempotency-Key header is required");

    // Fast path: we have seen this key, return the same answer as before
    var seen = await db.IdempotencyKeys.FindAsync(key);
    if (seen is not null)
        return Results.Content(seen.ResponseJson, "application/json", statusCode: 201);

    // Id is a Guid created here, so it is known before the save (a database identity would still be 0)
    var order = new Order { Id = Guid.NewGuid(), CustomerId = dto.CustomerId, Total = dto.Total };
    db.Orders.Add(order);

    // Lower-case names so the stored JSON matches what Results.Created sends (camelCase)
    var json = System.Text.Json.JsonSerializer.Serialize(new { id = order.Id, total = order.Total });
    db.IdempotencyKeys.Add(new IdempotencyKey { Key = key, ResponseJson = json, CreatedAt = DateTime.UtcNow });

    try
    {
        await db.SaveChangesAsync();   // both rows commit together
    }
    catch (DbUpdateException)
    {
        // Two retries raced: the other one won. Return its stored answer.
        db.ChangeTracker.Clear();
        var winner = await db.IdempotencyKeys.FindAsync(key);
        return Results.Content(winner!.ResponseJson, "application/json", statusCode: 201);
    }

    return Results.Created("/orders/" + order.Id, new { order.Id, order.Total });
});` },
    { lang: 'text', title: 'Back-of-envelope worksheet (photo app, 10M daily users)', code: `ASSUMPTIONS
  Daily active users (DAU)        10,000,000
  Uploads per user per day        2
  Average photo size              500 KB
  Read : write ratio              50 : 1
  Peak factor                     5x average

WRITES
  Photos per day   = 10M x 2            = 20,000,000
  Writes per sec   = 20M / 86,400       = ~230 /s average
  Peak writes      = 230 x 5            = ~1,200 /s

STORAGE
  Per day          = 20M x 500 KB       = 10 TB / day
  Per year         = 10 TB x 365        = ~3.6 PB / year
  5 years          =                      ~18 PB  (plus 3x replication = ~54 PB)

READS
  Reads per sec    = 230 x 50           = ~11,500 /s average
  Peak reads       = 11,500 x 5         = ~58,000 /s
  Bandwidth (peak) = 58,000 x 500 KB    = ~29 GB/s  -> needs a CDN, not app servers

METADATA
  One row per photo, ~500 bytes         = 20M x 500 B = 10 GB / day
  Fits in SQL for a year; shard by user_id after that

HANDY NUMBERS
  1 day ~ 86,400 s ~ 10^5 s   |  1M requests/day ~ 12/s
  RAM read ~100 ns  |  SSD read ~100 us  |  same-DC round trip ~0.5 ms  |  cross-continent ~100 ms` }
  ],
  pitfalls: [
    'Treating a remote call like a local function call. It can be slow, fail, or succeed without telling you. Always set a timeout.',
    'Retrying writes that are not idempotent, which creates duplicate orders and double charges.',
    'Reading "99.9% availability" as "basically always up". It is almost 9 hours of downtime a year, and chaining services makes it worse.',
    'Picking "strong consistency everywhere" without noticing the latency cost, or "eventual everywhere" and then losing money on a double-spend.',
    'Skipping the numbers. A design for 100 users and one for 100 million users look nothing alike, and only estimation tells you which one you are building.',
    'Assuming two replicas fail independently when they share a rack, a power supply, a region, or the same bug.'
  ],
  quiz: [
    { q: 'Your product team wants "four nines" availability. Roughly how much downtime per year is that?', options: ['About 3.65 days', 'About 8.76 hours', 'About 52 minutes', 'About 5 minutes'], answer: 2, why: '99.99% leaves 0.01% of the year, which is about 52.6 minutes. Three nines is 8.7 hours; five nines is 5.3 minutes.' },
    { q: 'During a network partition, a CP system will most likely…', options: ['Answer every request, even if some answers are a little stale', 'Refuse or delay some requests rather than return wrong data', 'Move all traffic to one bigger server until the network heals', 'Drop all stored idempotency keys so retries can go through'], answer: 1, why: 'CP means consistency is kept during a partition, so the side that cannot confirm it has the latest data will error or wait instead of answering.' },
    { q: 'Which operation is idempotent?', options: ['Add 100 to the customer account balance', 'Append one more line to the audit log file', 'Set the shipping address to "12 MG Road"', 'Increment the page view counter by one'], answer: 2, why: 'Setting a value to a fixed result gives the same end state no matter how many times it runs. Adds, appends and increments change the result on every repeat.' },
    { q: 'Why add jitter to retry delays?', options: ['So each retry reaches the server faster than the one before it', 'So many clients do not all retry at the same instant', 'So the system stays consistent during a network partition', 'So retries show up in the logs in a predictable order'], answer: 1, why: 'Without jitter, every client that failed at the same moment retries at the same moment, creating a "thundering herd". Random spread smooths the load.' },
    { q: 'Service A (99.9%) calls Service B (99.9%) on every request. Availability of the combined path is about…', options: ['99.9%', '99.95%', '99.8%', '199.8%'], answer: 2, why: 'In series you multiply: 0.999 × 0.999 ≈ 0.998, so 99.8%. Each extra hop in the chain lowers it further.' },
    { q: 'A system serves 20 million uploads per day. About how many per second on average?', options: ['About 23', 'About 230', 'About 2,300', 'About 23,000'], answer: 1, why: '20,000,000 ÷ 86,400 seconds ≈ 231 per second. Remember a day is roughly 10^5 seconds.' }
  ],
  takeaways: [
    'Scale up is simple but has a ceiling; scale out has no ceiling but makes every call a network call.',
    'Measure latency as p50/p95/p99, throughput as requests per second, availability as nines.',
    'CAP: during a partition you pick consistency or availability. PACELC: even without one, you trade latency for consistency.',
    'Every write that can be retried must be idempotent. Use an idempotency key.',
    'Timeouts, retries with backoff and jitter, and circuit breakers are the seatbelts of distributed calls.',
    'Do the back-of-envelope maths first: users → QPS → storage → bandwidth. The numbers choose the architecture.'
  ],
  interview: [
    { q: 'Explain the CAP theorem in simple words and give one CP and one AP example.', a: `<p>When the network splits, a system must either keep answering (availability) or keep answers correct (consistency); it cannot do both for the nodes that are cut off. A bank ledger on a single-leader database with synchronous replicas is CP: it would rather fail a request than show a wrong balance. A shopping-cart service on a Dynamo-style store is AP: it always accepts your "add to cart" and merges conflicts later.</p>` },
    { q: 'What is idempotency and how would you implement it for a payment API?', a: `<p>Idempotent means repeating the call has no extra effect. The client sends a unique Idempotency-Key per logical payment. The server stores the key with the result in the same transaction as the payment. On a repeat, it returns the stored result instead of charging again. A unique constraint on the key protects against two concurrent retries.</p>` },
    { q: 'How do you estimate the capacity needed for a new feature?', a: `<p>Start from daily active users and actions per user to get requests per day, divide by 86,400 for average QPS, multiply by a peak factor (3–5×). Multiply by payload size for bandwidth and storage, then by retention and replication factor. State assumptions out loud; the method matters more than the exact numbers.</p>` },
    { q: 'What goes wrong if you retry without a circuit breaker?', a: `<p>A failing dependency receives even more traffic from retries, which slows it further, which causes more timeouts and more retries: a retry storm. A circuit breaker opens after a failure threshold, fails fast for a cool-down period, then lets a few trial calls through. It protects both the caller (fast failures) and the dependency (time to recover).</p>` }
  ]
};

window.CONTENT['m3-load-balancing'] = {
  hook: `A load balancer is the person at the bank entrance who says "counter 4 is free". Remove that person and everyone crowds one counter while three others sit idle.`,
  intro: `<p>A <span class="term">load balancer</span> (LB) is a server that sits in front of your application servers and spreads incoming requests across them. Clients talk to one address; the LB decides which real server answers. It is the first thing you add when you move from one server to many.</p>
<p>It does three jobs. It <strong>distributes</strong> traffic so no single server is overloaded. It <strong>hides failures</strong>: if a server stops answering, the LB stops sending it traffic and users never notice. And it gives you a single place to <strong>terminate TLS</strong>, add headers, and apply rules.</p>
<p>In this topic you will learn the two kinds of load balancer (layer 4 and layer 7), the algorithms they use to pick a server, how health checks work, what "sticky sessions" are and why they bite, and how global load balancing sends a user in Pune to a data centre in Mumbai rather than Virginia. You will also build a small layer-7 load balancer in .NET with YARP.</p>`,
  realLife: { title: 'The airport check-in hall', body: `<p>Walk into a busy airport. A staff member at the front of the queue watches twenty counters and points each passenger to the next free one. That is round robin with a twist: she skips counters where the agent went for a break (health checks) and sends business-class passengers to dedicated counters (routing rules). If a counter's computer freezes, she stops sending people there within seconds.</p>
<p>Now imagine she also looks at your ticket and sends domestic flyers left and international flyers right. That is a <strong>layer-7</strong> load balancer: it reads the content of the request. A guard who only counts bodies and alternates "left, right, left, right" without looking at tickets is a <strong>layer-4</strong> load balancer. Netflix, Amazon and every bank you use put several layers of both between you and their servers.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>What problem it solves</h4>
<p>One server can handle, say, 2,000 requests per second. You have 10,000. You buy five servers. But the browser only knows one address, <code>api.myshop.com</code>. The load balancer owns that address and forwards each request to one of the five servers. If server 3 crashes, the LB sends its share to the other four.</p>
<h4>Layer 4 vs layer 7</h4>
<p>The "layers" come from the OSI network model (covered in Module 6). You only need the practical difference:</p>
<table><thead><tr><th></th><th>Layer 4 (transport)</th><th>Layer 7 (application)</th></tr></thead>
<tbody>
<tr><td>Looks at</td><td>IP address and port only</td><td>The HTTP request: URL, headers, cookies</td></tr>
<tr><td>Can do</td><td>Forward TCP/UDP packets very fast</td><td>Route /api to one pool and /images to another, rewrite headers, terminate TLS, compress</td></tr>
<tr><td>Speed</td><td>Fastest, millions of connections</td><td>Slower per request (it parses HTTP), but far more useful</td></tr>
<tr><td>Examples</td><td>AWS Network Load Balancer, Azure Load Balancer</td><td>AWS Application Load Balancer, Azure Application Gateway, NGINX, HAProxy, YARP</td></tr>
</tbody></table>
<h4>How it picks a server</h4>
<ul>
<li><strong>Round robin:</strong> 1, 2, 3, 4, 5, 1, 2… Simple and fair when all servers and requests are similar.</li>
<li><strong>Weighted round robin:</strong> a bigger server gets more turns (weight 3 vs weight 1).</li>
<li><strong>Least connections:</strong> send to the server with the fewest open requests right now. Better when some requests are slow.</li>
<li><strong>IP hash:</strong> hash the client's IP so the same client always lands on the same server. Useful when the server keeps something in memory for that client.</li>
<li><strong>Random / power of two choices:</strong> pick two at random, send to the less busy one. Surprisingly good at scale.</li>
</ul>
<h4>Health checks</h4>
<p>Every few seconds the LB asks each server "are you ok?" (usually an HTTP GET to <code>/health</code>). Two failed answers in a row and the server is marked unhealthy and skipped. Two good answers and it is back. Your .NET app should expose <code>/health</code> with <code>app.MapHealthChecks("/health")</code>.</p>
<div class="callout tip"><p>Make your health check cheap and honest. It should return 503 if the database is unreachable, so the LB stops sending traffic that would fail anyway.</p></div>` },
    { name: 'Intermediate', body: `<h4>Sticky sessions and why to avoid them</h4>
<p>If your app stores the user's login or shopping cart in server memory, the user must keep hitting the same server. The LB can do this with a cookie (<span class="term">sticky session</span>). It works until that server dies and the cart vanishes, or until one server gets all the heavy users. The fix is to make servers <strong>stateless</strong>: put session data in Redis or a database, and keep JWTs in the client. Then any server can handle any request and sticky sessions are unnecessary.</p>
<h4>TLS termination and the X-Forwarded headers</h4>
<p>Most L7 load balancers decrypt HTTPS and talk plain HTTP to the servers behind them. The app then sees the LB's IP, not the user's. The LB adds <code>X-Forwarded-For</code> (original client IP) and <code>X-Forwarded-Proto</code> (https). In ASP.NET Core, call <code>app.UseForwardedHeaders()</code> with the LB's IP trusted so <code>HttpContext.Connection.RemoteIpAddress</code> and redirects behave correctly.</p>
<h4>Global load balancing (GSLB)</h4>
<p>You have data centres in Mumbai, Frankfurt and Virginia. A user in Pune should hit Mumbai. This is done at the DNS level or with <span class="term">anycast</span>: the same IP is announced from many places and the internet routes to the nearest. Azure Front Door, AWS Global Accelerator and Cloudflare do this. The rule is: <strong>global</strong> LB picks the region, <strong>regional</strong> L7 LB picks the service, and a <strong>service</strong> L4/L7 LB picks the instance.</p>
<h4>Load balancer as a single point of failure</h4>
<p>If the LB dies, everything dies. Cloud LBs are already redundant. If you run your own (NGINX, HAProxy), run two with a floating virtual IP (keepalived/VRRP) so one takes over the address when the other fails.</p>
<h4>YARP: a load balancer written in .NET</h4>
<p><span class="term">YARP</span> (Yet Another Reverse Proxy) is Microsoft's library for building reverse proxies and L7 load balancers inside an ASP.NET Core app. You configure routes (match this path or host) and clusters (these destinations, this policy). It supports round robin, least requests, power of two choices, random, first alphabetical, plus active and passive health checks and session affinity. It is used inside Azure App Service and is a great way to learn how L7 balancing really works. See the code tab.</p>
<h4>Where it fits with other pieces</h4>
<ul>
<li>An <strong>API gateway</strong> is an L7 LB plus auth, rate limiting, and API versioning.</li>
<li>A <strong>reverse proxy</strong> is an L7 LB for one or few backends, often also serving cache and static files.</li>
<li>A <strong>service mesh</strong> (Istio, Linkerd) moves client-side load balancing into a sidecar next to every microservice.</li>
</ul>` },
    { name: 'Expert', body: `<h4>Connection draining and zero-downtime deploys</h4>
<p>When you deploy, you take servers out one at a time. The LB must stop sending <em>new</em> requests to a server but let in-flight ones finish (<span class="term">connection draining</span>, usually 30–300 s). Your app must also handle SIGTERM gracefully: ASP.NET Core's <code>IHostApplicationLifetime</code> and <code>ShutdownTimeout</code> do this. Rolling, blue/green and canary deployments are all choreographed through the LB's target pools.</p>
<h4>Algorithms under real load</h4>
<p>Round robin assumes equal cost per request, which is false for APIs where one endpoint takes 5 ms and another 5 s. Least connections tracks real load but needs per-backend state; across many LB instances that state is partial, so each LB only sees its own connections. "Power of two random choices" avoids the herding problem (all LBs choosing the same "least loaded" server at once) and is close to optimal with almost no coordination; it is the default in many modern systems. Consistent hashing (next topic) is the choice when you want the same key to land on the same server for cache locality.</p>
<h4>Layer 4 at huge scale</h4>
<p>Hyperscalers use software L4 balancers (Google Maglev, Facebook Katran) running on commodity servers with ECMP routing so that hundreds of machines share one virtual IP. They use consistent hashing on the 5-tuple (src IP, src port, dst IP, dst port, protocol) so a connection keeps going to the same backend even if an LB instance dies; otherwise every long-lived TCP connection would reset during a failover. Direct Server Return (DSR) lets the backend reply directly to the client, so the LB only handles the small inbound packets.</p>
<h4>Health checks that lie</h4>
<p>A server can pass <code>/health</code> and still be useless: GC pauses, a full thread pool, a deadlocked dependency. Pair <strong>active</strong> checks (the LB polls) with <strong>passive</strong> checks (the LB watches real responses: 5xx rate, timeouts) and eject backends that fail real traffic (outlier detection). Also watch for the opposite bug: a health check that depends on five downstream services fails whenever any of them hiccups, and the LB kills a perfectly good server. Separate <em>liveness</em> (is the process alive) from <em>readiness</em> (can it take traffic right now).</p>
<h4>Interview angle</h4>
<ul>
<li>Place LBs at three levels in your diagram: global (DNS/anycast), regional (L7), service (L4/L7 or client-side in a mesh).</li>
<li>Say "stateless servers" before anyone asks about sticky sessions.</li>
<li>Mention draining when discussing deploys, and liveness vs readiness when discussing health.</li>
<li>Know that the LB itself must be redundant and that it can become the bottleneck for TLS handshakes (offload to dedicated hardware or use session resumption).</li>
</ul>
<div class="callout idea"><p>The load balancer is the one component that sees every request. That makes it the natural home for metrics, rate limits, WAF rules and A/B routing, and the worst place to put business logic.</p></div>` }
  ],
  flow: { title: 'A request through a layer-7 load balancer', steps: [
    { title: 'DNS lookup', desc: 'The browser resolves api.myshop.com. Global load balancing returns the IP of the nearest healthy region.' },
    { title: 'TLS terminated', desc: 'The L7 load balancer decrypts HTTPS once, so backend servers can talk plain HTTP inside the private network.' },
    { title: 'Route matched', desc: 'The LB reads the path. /api/orders goes to the orders cluster; /images goes to the static cluster.' },
    { title: 'Healthy targets filtered', desc: 'Server 3 failed its last two health checks, so it is left out of the choice.' },
    { title: 'Algorithm picks', desc: 'Least connections: server 1 has 40 open requests, server 2 has 25. Server 2 wins.' },
    { title: 'Headers added', desc: 'X-Forwarded-For carries the real client IP; X-Forwarded-Proto says https. The request is forwarded.' },
    { title: 'Response relayed', desc: 'Server 2 answers; the LB records the status and latency (passive health) and sends the reply back encrypted.' }
  ] },
  code: [
    { lang: 'csharp', title: 'A working L7 load balancer in .NET with YARP (Program.cs)', code: `// dotnet add package Yarp.ReverseProxy
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Our own health endpoint, so a LB in front of THIS proxy can check it too
builder.Services.AddHealthChecks();

var app = builder.Build();
app.MapHealthChecks("/health");
app.MapReverseProxy();
app.Run();` },
    { lang: 'json', title: 'appsettings.json: routes, clusters, policy, health checks, affinity', code: `{
  "ReverseProxy": {
    "Routes": {
      "orders-route": {
        "ClusterId": "orders",
        "Match": { "Path": "/api/orders/{**catch-all}" },
        "Transforms": [ { "RequestHeader": "X-Forwarded-Proto", "Set": "https" } ]
      },
      "static-route": {
        "ClusterId": "static",
        "Match": { "Path": "/images/{**catch-all}" }
      }
    },
    "Clusters": {
      "orders": {
        "LoadBalancingPolicy": "LeastRequests",
        "HealthCheck": {
          "Active": { "Enabled": true, "Interval": "00:00:05", "Timeout": "00:00:02", "Policy": "ConsecutiveFailures", "Path": "/health/ready" },
          "Passive": { "Enabled": true, "Policy": "TransportFailureRate", "ReactivationPeriod": "00:00:30" }
        },
        "Metadata": { "ConsecutiveFailuresHealthPolicy.Threshold": "2" },
        "Destinations": {
          "orders-1": { "Address": "http://10.0.1.11:8080/" },
          "orders-2": { "Address": "http://10.0.1.12:8080/" },
          "orders-3": { "Address": "http://10.0.1.13:8080/" }
        }
      },
      "static": {
        "LoadBalancingPolicy": "RoundRobin",
        "SessionAffinity": { "Enabled": false },
        "Destinations": {
          "static-1": { "Address": "http://10.0.2.11:8080/" },
          "static-2": { "Address": "http://10.0.2.12:8080/" }
        }
      }
    }
  }
}` },
    { lang: 'csharp', title: 'Backend app: honest health checks, forwarded headers, graceful shutdown', code: `using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// Separate liveness (process alive) from readiness (can take traffic)
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"])
    .AddCheck<DatabaseHealthCheck>("database", tags: ["ready"]);

// Let in-flight requests finish when the LB drains us (default is 30 s)
builder.Host.ConfigureHostOptions(o => o.ShutdownTimeout = TimeSpan.FromSeconds(45));

var app = builder.Build();

// Trust X-Forwarded-* only from our load balancer's network
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto,
    KnownNetworks = { new Microsoft.AspNetCore.HttpOverrides.IPNetwork(System.Net.IPAddress.Parse("10.0.0.0"), 8) }
});

app.MapHealthChecks("/health/live",  new() { Predicate = r => r.Tags.Contains("live") });
app.MapHealthChecks("/health/ready", new() { Predicate = r => r.Tags.Contains("ready") });

app.MapGet("/whoami", (HttpContext ctx) => new
{
    Server = Environment.MachineName,
    ClientIp = ctx.Connection.RemoteIpAddress?.ToString(),   // real client, thanks to forwarded headers
    Scheme = ctx.Request.Scheme
});

app.Run();

public class DatabaseHealthCheck : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        // Replace with a real cheap query, e.g. SELECT 1 through your connection
        await Task.Delay(5, ct);
        return HealthCheckResult.Healthy();
    }
}` }
  ],
  pitfalls: [
    'Keeping user state in server memory and "fixing" it with sticky sessions. The state dies with the server. Move it to Redis or the client.',
    'A health check that returns 200 no matter what. The LB keeps sending traffic to a server whose database connection is gone.',
    'A health check that depends on everything. One flaky downstream service makes the LB eject every healthy server at once.',
    'Forgetting UseForwardedHeaders, so logs show the load balancer IP for every user and HTTPS redirects loop.',
    'Deploying without connection draining, so users mid-checkout get connection resets.',
    'Treating the LB as "just infrastructure" and never making it redundant. It is the one box everything depends on.'
  ],
  quiz: [
    { q: 'Which load balancer type can route /api to one server pool and /images to another?', options: ['Layer 4, because it is faster and sees every packet', 'Layer 7, because it reads the HTTP request', 'Either one, because DNS decides the path', 'Neither; only an API gateway can do that'], answer: 1, why: 'Routing by path needs to parse HTTP, which only a layer-7 balancer does. Layer 4 sees only IPs and ports.' },
    { q: 'Some API calls take 5 ms and some take 5 seconds. Which algorithm spreads load best?', options: ['Round robin', 'IP hash', 'Least connections', 'Alphabetical by hostname'], answer: 2, why: 'Round robin counts requests, not work. Least connections sends new requests to the server with the fewest in-flight requests, so slow calls do not pile up on one box.' },
    { q: 'Why are sticky sessions a problem?', options: ['They add a lookup to every request, so they are far slower than round robin', 'They force every server to keep a full copy of every user’s session', 'If the chosen server dies, that user’s in-memory state is lost', 'They stop working once the load balancer terminates HTTPS'], answer: 2, why: 'Stickiness ties a user to one server. When it fails, the user’s session is gone, and heavy users can cluster on one machine. Stateless servers remove the need.' },
    { q: 'What is the purpose of the X-Forwarded-For header?', options: ['To tell the backend the original client IP', 'To forward the request on to a second load balancer', 'To tell the LB which server holds the session', 'To ask the backend to compress the response'], answer: 0, why: 'After TLS termination and proxying, the backend sees the LB as the client. X-Forwarded-For carries the real client address so logging, rate limiting and geo rules still work.' },
    { q: 'What should "connection draining" do during a deploy?', options: ['Close every open connection at once so the deploy can start', 'Stop new requests to the server but let in-flight ones finish', 'Restart the load balancer so it forgets the old server list', 'Send the server extra traffic to empty its queue before shutdown'], answer: 1, why: 'Draining removes the server from the pool for new traffic while allowing existing requests to complete, which is what makes zero-downtime deploys possible.' }
  ],
  takeaways: [
    'A load balancer spreads traffic, hides failed servers, and gives you one place for TLS and routing.',
    'Layer 4 is fast and blind; layer 7 reads HTTP and can route by path, host, header or cookie.',
    'Round robin for uniform work, least connections for mixed work, hashing when the same client must hit the same server.',
    'Make servers stateless so you never need sticky sessions.',
    'Health checks must be cheap and honest; separate liveness from readiness.',
    'Global LB picks the region, regional L7 picks the service, service LB picks the instance, and all of them must be redundant.'
  ],
  interview: [
    { q: 'What is the difference between a layer-4 and a layer-7 load balancer?', a: `<p>Layer 4 forwards based on IP and port and never looks inside the packet, so it is very fast and protocol-agnostic. Layer 7 understands HTTP, so it can route by URL, host or header, terminate TLS, rewrite headers and do smarter health checks, at the cost of more CPU per request. Most architectures use an L4 or anycast layer in front and L7 behind it.</p>` },
    { q: 'How would you achieve zero-downtime deployments with a load balancer?', a: `<p>Take instances out of the pool one at a time: mark readiness as failing, wait for connection draining so in-flight requests complete, deploy, pass the readiness check, re-add, and move on. Blue/green swaps the whole pool; canary shifts a small percentage of traffic to the new version and watches error rates before increasing it.</p>` },
    { q: 'Where would you put rate limiting: in the load balancer or in the app?', a: `<p>Coarse protection (per-IP floods, global limits) belongs at the edge LB or gateway because it sees all traffic and can drop requests before they cost CPU. Fine-grained limits (per user, per API key, per plan) usually live in the app or gateway with a shared store like Redis so the count is consistent across instances.</p>` },
    { q: 'What happens to the load balancer if it is a single machine?', a: `<p>It becomes the single point of failure and the bottleneck. Cloud load balancers are distributed by design. For self-hosted ones, run at least two with a floating virtual IP and health checks between them, or front them with DNS/anycast so clients can reach a survivor.</p>` }
  ]
};

window.CONTENT['m3-consistent-hashing'] = {
  hook: `Add one server to a cache cluster of ten and, with the naive approach, 90% of your cached data is suddenly on the wrong machine. Consistent hashing drops that to 9%.`,
  intro: `<p><span class="term">Consistent hashing</span> is a way to decide which server owns which key (a user id, a cache key, a file name) so that when you add or remove a server, only a small share of keys move. It is the reason distributed caches and databases can grow and shrink without a traffic meltdown.</p>
<p>The naive approach is <code>server = hash(key) % N</code>. It is perfect while N never changes. The moment N becomes N+1, almost every key gets a different answer, so almost every cache lookup misses and your database takes the full load. That is called a <span class="term">cache stampede</span>, and it has taken real sites down.</p>
<p>Consistent hashing fixes this by placing both servers and keys on a circle (the <span class="term">hash ring</span>) and giving each key to the next server clockwise. Adding a server only steals keys from its one neighbour. You will understand the ring, see why "virtual nodes" are needed, and build a complete, working implementation in C#.</p>`,
  realLife: { title: 'Lockers at a swimming pool', body: `<p>A pool has 10 locker attendants, and you get your attendant by "ticket number mod 10". When an 11th attendant joins, the rule becomes "mod 11" and almost everybody is now assigned to a different attendant than the one holding their clothes. Chaos.</p>
<p>Now imagine the attendants stand at fixed spots around a circular hall, and the rule is "walk clockwise from your ticket's spot until you meet an attendant". A new attendant standing between two existing ones only takes over the customers in that one gap. Everyone else keeps their attendant. That circular hall is the hash ring. Amazon's DynamoDB, Apache Cassandra, Akamai's CDN and Discord's chat servers all use this idea to decide which machine holds which data.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>The problem with mod N</h4>
<p>You have 4 cache servers. Key "user:42" hashes to 1,234,567. Using <code>1234567 % 4 = 3</code>, it lives on server 3. Now you add a fifth server: <code>1234567 % 5 = 2</code>. The key moved. Do that for every key and roughly 80% of them move. Every moved key is a cache miss, and every miss hits the database at once.</p>
<h4>The ring</h4>
<p>Picture a clock face numbered 0 to 2³²−1 instead of 1 to 12. Hash each <strong>server</strong> name and place it on the clock at that number. Hash each <strong>key</strong> and place it too. The rule: a key belongs to the first server you meet walking clockwise. If you pass the end, wrap around to 0.</p>
<h4>Why adding a server is cheap now</h4>
<p>Say servers A, B, C sit at 3 o'clock, 7 o'clock and 11 o'clock. Keys between 11 and 3 belong to A, between 3 and 7 to B, between 7 and 11 to C. Add server D at 5 o'clock. Only keys between 3 and 5 move (from B to D). Everything else stays. On average, adding one server to N moves only 1/(N+1) of the keys.</p>
<h4>Removing a server is cheap too</h4>
<p>If B dies, keys between 3 and 7 now walk on to C. Only B's keys move, and they all go to one place: B's clockwise neighbour.</p>
<h4>The catch: uneven gaps</h4>
<p>With only 3 servers, their random spots on the ring might be very close together, leaving one server with a huge arc of keys. The fix is in the next level: <span class="term">virtual nodes</span>.</p>
<div class="callout tip"><p>"Consistent" does not mean "consistent data". It means the mapping from key to server stays mostly the same as servers come and go.</p></div>` },
    { name: 'Intermediate', body: `<h4>Virtual nodes</h4>
<p>Instead of placing each server at one spot, place it at 100 or 200 spots: hash "serverA#0", "serverA#1", … "serverA#149". Now each physical server owns many small arcs scattered around the ring. Two benefits. First, the load evens out: with 150 virtual nodes per server each server is typically within about 10% of the average (more virtual nodes make it tighter). Second, when a server is removed, its keys are spread across <em>all</em> other servers instead of dumped on one neighbour. You can also give a bigger server more virtual nodes to send it more traffic.</p>
<h4>Finding the owner fast</h4>
<p>Keep the virtual node positions in a sorted array. To find a key's owner, hash the key and binary-search for the first position ≥ the hash; if none, wrap to index 0. That is O(log V) where V is the number of virtual nodes. In C#, a <code>SortedDictionary&lt;uint, string&gt;</code> works but a sorted <code>List&lt;uint&gt;</code> with <code>BinarySearch</code> is faster for lookups. See the code tab for a complete implementation.</p>
<h4>Choosing the hash function</h4>
<p>You want a fast hash with good spread, not a cryptographic one. MurmurHash3, xxHash and FNV-1a are common. <code>string.GetHashCode()</code> in .NET is randomised per process, so two servers would disagree: never use it for this. The code uses a small FNV-1a implementation plus a final mixing step (plain FNV-1a gives similar names like "cache-1#0" and "cache-1#1" positions that sit too close together, which makes the ring uneven); in production use <code>System.IO.Hashing.XxHash32</code>.</p>
<h4>Replication on the ring</h4>
<p>Databases like Cassandra store each key on N servers: the owner plus the next N−1 <em>distinct physical</em> servers clockwise. When walking the ring you skip virtual nodes that belong to a physical server you already picked. This is how a key survives a node failure.</p>
<h4>Where it is used</h4>
<ul>
<li><strong>Distributed caches:</strong> Memcached clients (Ketama), Redis Cluster uses a related idea with 16,384 fixed hash slots assigned to nodes.</li>
<li><strong>Databases:</strong> DynamoDB, Cassandra, Riak, CockroachDB (ranges rather than a ring, same goal).</li>
<li><strong>Load balancers and CDNs:</strong> route the same user or URL to the same backend for cache locality.</li>
<li><strong>Chat and game servers:</strong> Discord assigns guilds to servers this way.</li>
</ul>
<div class="callout warn"><p>Keys that are hot (a celebrity's profile) still land on one server. Consistent hashing balances key <em>count</em>, not key <em>traffic</em>. Hot keys need extra copies or local caching.</p></div>` },
    { name: 'Expert', body: `<h4>Bounded loads and hot spots</h4>
<p>Plain consistent hashing can still overload a node when traffic per key is skewed. "Consistent hashing with bounded loads" (Mirrokni, Thorup, Zadimoghaddam; used by Google and Vimeo) adds a capacity cap per server of (1 + ε) × average load. If the clockwise owner is full, the key moves on to the next server. This keeps the "few keys move" property while guaranteeing no server exceeds the cap. HAProxy supports it as <code>hash-balance-factor</code>.</p>
<h4>Alternatives: jump hash, rendezvous hash, Maglev</h4>
<ul>
<li><strong>Jump consistent hash</strong> (Google, 2014) maps a key to one of N buckets in O(log N) time with zero memory and perfect balance, but it only supports adding/removing the <em>last</em> bucket, so it fits numbered shards, not arbitrary server names.</li>
<li><strong>Rendezvous (highest random weight) hashing:</strong> for each key compute hash(key, server) for every server and pick the highest. Simple, no ring, perfect balance, minimal movement; cost is O(N) per lookup, fine for small N.</li>
<li><strong>Maglev hashing:</strong> Google's L4 balancer builds a large lookup table with each backend taking turns filling slots; O(1) lookup, very even, slightly more movement on change.</li>
</ul>
<h4>Rebalancing in practice</h4>
<p>Moving a key's <em>ownership</em> is instant; moving the <em>data</em> is not. Databases run a background "streaming" step: the new owner pulls its ranges from the old owners while both answer reads, with a cut-over once the copy is complete. Cassandra's token ranges, DynamoDB's partition splits and Redis Cluster's slot migration (MIGRATING/IMPORTING states) are all versions of this. Design the client to tolerate a short window where a key may be served by either node.</p>
<h4>Membership: who is on the ring?</h4>
<p>Every client must agree on the server list, or two clients send the same key to different servers. Options: a config service (ZooKeeper/etcd/Consul) that pushes membership, a gossip protocol (Cassandra), or a proxy that owns the ring so clients stay simple (Twemproxy, Envoy). Add new nodes gradually with hysteresis so a flapping node does not cause repeated remapping.</p>
<h4>Interview angle</h4>
<ul>
<li>State the mod-N problem with a number: "adding 1 server to 10 remaps ~91% of keys with mod-N, ~9% with the ring."</li>
<li>Draw the ring, then immediately add virtual nodes and explain why.</li>
<li>Mention hot keys and that the ring balances count, not load; propose bounded loads or key-splitting (append a suffix 0–9 to a hot key).</li>
<li>Know Redis Cluster's 16,384 slots as the common real-world variant.</li>
</ul>` }
  ],
  flow: { title: 'Adding a cache server without a stampede', steps: [
    { title: 'Ring exists', desc: 'Servers A, B and C each own 150 virtual nodes scattered around a 32-bit ring. Keys go to the first virtual node clockwise.' },
    { title: 'New server D joins', desc: 'D is hashed into 150 positions. Each position sits inside an arc that currently belongs to A, B or C.' },
    { title: 'Only neighbours affected', desc: 'For each of D’s positions, the keys between the previous virtual node and D’s position now belong to D. Roughly 25% of all keys, spread evenly from A, B and C.' },
    { title: 'Everyone else unchanged', desc: 'The other 75% of keys still map to the same server, so their cache entries stay valid. No stampede.' },
    { title: 'Data warms up', desc: 'D starts empty. Its first lookups miss and fill from the database, a gentle 25% extra load, not 100%.' },
    { title: 'Server B dies later', desc: 'B’s 150 positions vanish. Each of its arcs is absorbed by the next virtual node clockwise, which belongs to A, C or D, spreading B’s load across all survivors.' }
  ] },
  code: [
    { lang: 'csharp', title: 'Consistent hash ring with virtual nodes (complete, runnable)', code: `using System.Text;

public sealed class ConsistentHashRing
{
    private readonly int _virtualNodes;
    private readonly List<uint> _points = new();                 // sorted ring positions
    private readonly Dictionary<uint, string> _owner = new();    // position -> physical node
    private readonly HashSet<string> _nodes = new();

    public ConsistentHashRing(int virtualNodes = 150) => _virtualNodes = virtualNodes;

    public IReadOnlyCollection<string> Nodes => _nodes;

    public void AddNode(string node)
    {
        if (!_nodes.Add(node)) return;
        for (int i = 0; i < _virtualNodes; i++)
        {
            uint p = Hash(node + "#" + i);
            if (_owner.ContainsKey(p)) continue;       // rare collision: skip this replica
            _owner[p] = node;
            int idx = _points.BinarySearch(p);
            _points.Insert(idx < 0 ? ~idx : idx, p);   // keep the list sorted
        }
    }

    public void RemoveNode(string node)
    {
        if (!_nodes.Remove(node)) return;
        for (int i = 0; i < _virtualNodes; i++)
        {
            uint p = Hash(node + "#" + i);
            if (_owner.TryGetValue(p, out var o) && o == node)
            {
                _owner.Remove(p);
                int idx = _points.BinarySearch(p);
                if (idx >= 0) _points.RemoveAt(idx);
            }
        }
    }

    // O(log V): first ring point >= hash(key), wrapping to the start
    public string GetNode(string key)
    {
        if (_points.Count == 0) throw new InvalidOperationException("Ring is empty");
        uint h = Hash(key);
        int idx = _points.BinarySearch(h);
        if (idx < 0) idx = ~idx;                 // insertion point = first greater element
        if (idx == _points.Count) idx = 0;       // wrap around
        return _owner[_points[idx]];
    }

    // Owner plus the next (replicas-1) DISTINCT physical nodes clockwise
    public List<string> GetNodes(string key, int replicas)
    {
        var result = new List<string>();
        if (_points.Count == 0) return result;
        uint h = Hash(key);
        int idx = _points.BinarySearch(h);
        if (idx < 0) idx = ~idx;
        for (int n = 0; n < _points.Count && result.Count < replicas; n++)
        {
            var node = _owner[_points[(idx + n) % _points.Count]];
            if (!result.Contains(node)) result.Add(node);
        }
        return result;
    }

    // FNV-1a 32-bit: fast, deterministic across processes (string.GetHashCode is NOT)
    private static uint Hash(string s)
    {
        const uint offset = 2166136261, prime = 16777619;
        uint h = offset;
        foreach (byte b in Encoding.UTF8.GetBytes(s)) { h ^= b; h *= prime; }
        // Final mix (from MurmurHash3): without it, names that differ only in the last
        // characters ("cache-1#0", "cache-1#1") land close together and the ring is uneven
        h ^= h >> 16; h *= 0x85ebca6b; h ^= h >> 13; h *= 0xc2b2ae35; h ^= h >> 16;
        return h;
    }
}` },
    { lang: 'csharp', title: 'Demo: measure how many keys move with mod-N vs the ring', code: `var keys = Enumerable.Range(0, 100_000).Select(i => "user:" + i).ToList();

// ---- naive mod-N ----
static int ModN(string key, int n)
{
    uint h = 2166136261;
    foreach (byte b in System.Text.Encoding.UTF8.GetBytes(key)) { h ^= b; h *= 16777619; }
    return (int)(h % (uint)n);
}
int movedMod = keys.Count(k => ModN(k, 10) != ModN(k, 11));
Console.WriteLine("mod-N  10 -> 11 servers: " + (100.0 * movedMod / keys.Count).ToString("F1") + "% of keys moved");

// ---- consistent hashing ----
var ring = new ConsistentHashRing(virtualNodes: 150);
for (int i = 1; i <= 10; i++) ring.AddNode("cache-" + i);
var before = keys.ToDictionary(k => k, k => ring.GetNode(k));

ring.AddNode("cache-11");
int movedRing = keys.Count(k => ring.GetNode(k) != before[k]);
Console.WriteLine("ring   10 -> 11 servers: " + (100.0 * movedRing / keys.Count).ToString("F1") + "% of keys moved");

// ---- balance check ----
var load = keys.GroupBy(k => ring.GetNode(k)).ToDictionary(g => g.Key, g => g.Count());
Console.WriteLine("min/max keys per node: " + load.Values.Min() + " / " + load.Values.Max());

// ---- replication ----
Console.WriteLine("user:42 lives on: " + string.Join(", ", ring.GetNodes("user:42", 3)));

// Output (the hash is deterministic, so you should see the same numbers):
// mod-N  10 -> 11 servers: 91.0% of keys moved
// ring   10 -> 11 servers: 8.7% of keys moved      (theory: 1/11 = 9.1%)
// min/max keys per node: 8267 / 9943               (average 9,091; within ~10% with 150 vnodes)
// user:42 lives on: cache-2, cache-5, cache-7` }
  ],
  pitfalls: [
    'Using hash(key) % N for anything where N can change. One scaling event becomes a database stampede.',
    'Using string.GetHashCode() as the ring hash. It differs per process in .NET, so clients disagree on owners.',
    'Skipping virtual nodes. With a handful of servers, the arcs are wildly uneven and one server takes most of the load.',
    'Assuming balance means safety. A single hot key still lands on one server; split or replicate hot keys.',
    'Forgetting that ownership changes instantly but data moves slowly. Plan the migration window and let clients tolerate it.',
    'Letting every client keep its own server list. If the lists disagree, the same key is written to two places.'
  ],
  quiz: [
    { q: 'With naive hash(key) % N, you grow from 10 to 11 servers. Roughly what share of keys change server?', options: ['About 9%', 'About 50%', 'About 91%', 'None; the hash is consistent'], answer: 2, why: 'Only keys where hash % 10 happens to equal hash % 11 stay, about 1 in 11. Around 91% move. The ring reduces this to about 1/11 ≈ 9%.' },
    { q: 'On a hash ring, which server owns a key?', options: ['The server whose hash is closest to the key in either direction', 'The first server found walking clockwise from the key', 'The server with the smallest hash on the whole ring', 'A random server, weighted by how many keys it holds'], answer: 1, why: 'The rule is "walk clockwise until you meet a server", wrapping around at the end. That is what makes only one neighbour’s keys move when a server is added.' },
    { q: 'Why use virtual nodes?', options: ['To make the ring hash cryptographically secure against attackers', 'To even out load and spread a failed node’s keys widely', 'To cut the memory the ring needs, since each node stores less', 'To avoid keeping a sorted list of positions for lookups'], answer: 1, why: 'Many points per server smooth out random gaps on the ring, and when a server leaves, its scattered arcs are absorbed by many different neighbours instead of one.' },
    { q: 'Consistent hashing balances…', options: ['The traffic each key receives', 'The number of keys per server', 'The CPU usage of every server', 'The network latency per request'], answer: 1, why: 'It spreads keys evenly by hash. A single very popular key still lands on one server, so hot keys need separate handling.' },
    { q: 'What is the lookup cost for a key with V virtual nodes in a sorted array?', options: ['O(1)', 'O(log V)', 'O(V)', 'O(V log V)'], answer: 1, why: 'Binary search over the sorted positions finds the first point at or after the key’s hash in O(log V).' }
  ],
  takeaways: [
    'mod-N breaks the moment N changes; consistent hashing moves only about 1/N of keys per change.',
    'Place servers and keys on a ring; a key belongs to the first server clockwise.',
    'Virtual nodes (100–200 per server) make the load even and spread failures across all survivors.',
    'Use a fast, deterministic hash (xxHash, Murmur, FNV), never string.GetHashCode().',
    'Replicate by walking on to the next distinct physical servers on the ring.',
    'It balances key count, not traffic: handle hot keys separately, or use bounded-load hashing.'
  ],
  interview: [
    { q: 'Why does adding a server with consistent hashing move so few keys?', a: `<p>A key’s owner is the next server clockwise on the ring. A new server inserted at some position only takes the keys between the previous server position and itself. All other arcs are untouched, so on average only 1/(N+1) of keys change owner, versus almost all of them with mod-N.</p>` },
    { q: 'How does Redis Cluster differ from a classic hash ring?', a: `<p>Redis Cluster uses 16,384 fixed hash slots (CRC16(key) mod 16384) and assigns ranges of slots to nodes. Rebalancing moves whole slots between nodes with explicit MIGRATING/IMPORTING states. It gives the same "only some keys move" property with simpler bookkeeping and supports hash tags ({user:42}) to keep related keys on one node.</p>` },
    { q: 'What would you do about a hot key such as a celebrity profile?', a: `<p>Hashing balances counts, not traffic. Options: cache the hot key locally in each app server with a short TTL, replicate it to several nodes by appending a suffix (profile:42:0 … :9) and reading a random copy, or use consistent hashing with bounded loads so an overloaded node forwards to the next one.</p>` },
    { q: 'Where is consistent hashing used besides caches?', a: `<p>Partitioning data in Cassandra, DynamoDB and Riak; load balancer session affinity (HAProxy, Envoy ring hash); CDNs mapping URLs to edge servers; sharding chat rooms or game lobbies across servers; and distributing work in stream processors.</p>` }
  ]
};

window.CONTENT['m3-caching'] = {
  hook: `There are only two hard things in computer science: cache invalidation and naming things. This topic is about the first one, and why a cache is both the cheapest speed-up you will ever add and the most common source of "but it shows the old value".`,
  intro: `<p>A <span class="term">cache</span> is a small, fast copy of data that is slow or expensive to fetch. Reading a product from RAM takes 100 nanoseconds; reading it from a database across the network takes a few milliseconds, ten thousand times longer. If the same product is read a million times an hour, caching it saves a million slow trips.</p>
<p>Caches exist at every layer: the browser caches images, a CDN caches whole pages near the user, your API caches query results in memory or in Redis, and the database caches disk pages in RAM. Each layer answers the same two questions: <strong>when do I fill the cache</strong> (the write policy) and <strong>when do I throw things out</strong> (expiry and eviction).</p>
<p>The hard part is not speed. It is correctness: a stale cache shows the user a price that changed five minutes ago. This topic covers the patterns (cache-aside, read-through, write-through, write-behind), the eviction rules (LRU, LFU, TTL), the famous failure (cache stampede) and how to do all of this in .NET with <code>IMemoryCache</code>, <code>IDistributedCache</code>, <code>HybridCache</code> and Redis.</p>`,
  realLife: { title: 'The kitchen counter and the warehouse', body: `<p>A restaurant keeps salt, oil and the day's vegetables on the kitchen counter, and the rest in a warehouse across town. The counter is the cache: tiny, instant, holds what is needed most. Nobody drives to the warehouse for every pinch of salt.</p>
<p>The rules matter. What goes on the counter (the popular items). When it is restocked (on first use, or every morning). What happens when a supplier changes the menu (the counter has yesterday's labels: a stale cache). And what happens on a festival day when the counter runs out and twenty cooks all drive to the warehouse at the same moment (a stampede). Amazon's product pages, Instagram's feed and Zomato's restaurant listings are all mostly served from caches; the database only sees a small fraction of reads.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Hit, miss, and the hit rate</h4>
<p>You ask the cache for key <code>product:42</code>. If it is there, that is a <span class="term">hit</span>. If not, a <span class="term">miss</span>: you fetch from the database, store the result in the cache, and return it. The share of requests that hit is the <span class="term">hit rate</span>. A 95% hit rate means the database only sees 5% of reads.</p>
<h4>Where caches live</h4>
<table><thead><tr><th>Layer</th><th>Example</th><th>Good for</th></tr></thead>
<tbody>
<tr><td>Browser</td><td>Cache-Control headers, service workers</td><td>Images, scripts, API responses that rarely change</td></tr>
<tr><td>CDN / edge</td><td>Cloudflare, Akamai, Azure Front Door</td><td>Static files and public pages, close to the user</td></tr>
<tr><td>Application (in-process)</td><td>IMemoryCache in .NET</td><td>Hot data, fastest, but each server has its own copy</td></tr>
<tr><td>Distributed</td><td>Redis, Memcached</td><td>Shared across all servers, survives app restarts</td></tr>
<tr><td>Database</td><td>Buffer pool, query cache</td><td>Automatic; you mostly tune memory size</td></tr>
</tbody></table>
<h4>Time to live (TTL)</h4>
<p>The simplest way to avoid stale data: every entry has an expiry. "Keep this product for 5 minutes." After that, the next read misses and refreshes it. Short TTL means fresher data and more misses; long TTL means faster but staler. Pick per data type: exchange rates 1 minute, product descriptions 1 hour, country list 1 day.</p>
<h4>Eviction: the cache is full</h4>
<p>RAM is limited, so the cache must throw something out. <span class="term">LRU</span> (least recently used) removes the entry nobody has touched for the longest time. <span class="term">LFU</span> (least frequently used) removes the entry with the fewest hits. LRU is the common default; Redis uses an approximate LRU or LFU depending on config.</p>
<div class="callout tip"><p>Start with cache-aside plus a TTL. It covers 80% of real cases, and you can add smarter invalidation later.</p></div>` },
    { name: 'Intermediate', body: `<h4>The four write patterns</h4>
<div class="compare"><div><h5>Cache-aside (lazy loading)</h5><p>The app checks the cache; on a miss it reads the DB and writes the result to the cache. On update, the app writes the DB and <strong>deletes</strong> the cache key. Most common. Cache holds only data that was actually read.</p></div><div><h5>Read-through</h5><p>The cache itself knows how to load from the DB. The app only talks to the cache. Same behaviour as cache-aside with less code in the app; .NET's HybridCache GetOrCreateAsync is this pattern.</p></div></div>
<div class="compare"><div><h5>Write-through</h5><p>Every write goes to the cache and the DB together, synchronously. Cache is never stale, but writes are slower and you cache data that may never be read.</p></div><div><h5>Write-behind (write-back)</h5><p>Writes go to the cache now and to the DB later in batches. Fastest writes, but data is lost if the cache dies before flushing. Used for counters, view counts, metrics.</p></div></div>
<h4>Invalidation strategies</h4>
<ul>
<li><strong>TTL only:</strong> simplest, accepts staleness up to the TTL.</li>
<li><strong>Delete on write:</strong> after updating the DB, delete the key. The next read refills it. Prefer delete over update-the-cache, because two concurrent updates can write the cache in the wrong order.</li>
<li><strong>Event-based:</strong> publish "product 42 changed" to a message bus; every server drops its local copy. This is how in-process caches stay consistent across many instances.</li>
<li><strong>Versioned keys:</strong> include a version in the key (<code>product:42:v7</code>); bump the version on change and old entries age out by TTL.</li>
</ul>
<h4>Cache stampede (dog-pile)</h4>
<p>A popular key expires. In the next 50 ms, 2,000 requests all miss and all run the same expensive query at once. The database falls over, which makes every other request slow, which creates more misses. Fixes:</p>
<ul>
<li><strong>Request coalescing / single-flight:</strong> only one caller computes the value; the others wait for it. HybridCache does this for you.</li>
<li><strong>Early refresh:</strong> refresh in the background shortly before expiry, so the entry never actually expires under load.</li>
<li><strong>Jittered TTLs:</strong> add a random few seconds so many keys do not expire together.</li>
<li><strong>Serve stale while revalidating:</strong> return the old value immediately and refresh in the background.</li>
</ul>
<h4>.NET choices</h4>
<ul>
<li><code>IMemoryCache</code>: in-process, fastest, per server. Supports size limits, sliding and absolute expiry, eviction callbacks.</li>
<li><code>IDistributedCache</code>: byte[] API over Redis, SQL Server or in-memory; shared across servers; you serialise yourself.</li>
<li><code>HybridCache</code> (.NET 9+, also on .NET 8 via package): two levels at once (L1 memory + L2 Redis), stampede protection, tags for group invalidation, built-in serialisation. The recommended default for new apps.</li>
<li><strong>Output caching</strong> (<code>app.UseOutputCache()</code>) caches whole HTTP responses server-side; <strong>response caching</strong> sets headers so browsers and CDNs cache.</li>
</ul>` },
    { name: 'Expert', body: `<h4>Consistency windows you cannot see</h4>
<p>Cache-aside with delete-on-write still has a race: request A misses, reads the DB (old value); request B updates the DB and deletes the key; request A then writes its old value into the cache. Now the cache is stale until the TTL. It is rare (the read must be slow and land between B's two steps) but at scale "rare" happens hourly. Mitigations: short TTLs as a safety net, a <strong>delayed double delete</strong> (delete again after ~500 ms), versioned writes (store a DB row version with the value and reject older writes), or routing invalidation through the DB's change stream (CDC) so the cache is updated from the single source of truth in order.</p>
<h4>Redis as a distributed cache: what to know</h4>
<ul>
<li>Single-threaded command execution means one slow command (KEYS *, a huge SMEMBERS) blocks everyone. Use SCAN, keep values small (&lt; 100 KB), pipeline round trips.</li>
<li>Eviction policy: <code>allkeys-lru</code> for a pure cache; <code>volatile-ttl</code> if some keys must never be evicted.</li>
<li>Persistence (RDB/AOF) is optional for a cache; turning it off makes Redis faster but a restart means a cold cache and a database spike. Warm the cache or ramp traffic.</li>
<li>Redis Cluster shards by 16,384 slots; multi-key operations need hash tags to co-locate keys.</li>
<li>Connection handling in .NET: StackExchange.Redis uses one multiplexed connection; create it once (singleton) or you will exhaust sockets.</li>
</ul>
<h4>Negative caching and the "missing key" attack</h4>
<p>If a key does not exist in the DB, cache that fact ("product 999 = NOT FOUND") with a short TTL. Otherwise every request for a non-existent id goes straight to the database, which is both a performance hole and a denial-of-service vector (cache penetration). For huge key spaces, a Bloom filter in front of the cache answers "definitely not there" without a lookup.</p>
<h4>Hot keys and local L1</h4>
<p>A single key read 100,000 times a second will saturate one Redis shard's network. Add an in-process L1 cache with a very short TTL (1–5 s) in front of Redis; HybridCache does exactly this. Accept that different servers may see the value a few seconds apart.</p>
<h4>Measuring</h4>
<p>Track hit rate, miss latency, eviction rate and memory per key family. A hit rate below ~80% usually means the TTL is too short, the key space is too wide (caching per-user results that are never re-read), or the cache is too small and evicting hot data. Caching is an optimisation; measure before and after, and log cache failures as warnings while falling back to the source, never as errors that break the request.</p>
<h4>Interview angle</h4>
<ul>
<li>Name the pattern (cache-aside) and the invalidation (delete on write + TTL) in one breath.</li>
<li>Bring up stampede and single-flight before the interviewer does.</li>
<li>Explain the read/delete race and why TTL is the safety net.</li>
<li>Know what not to cache: anything per-request, anything you cannot invalidate, anything that must be exact right now (account balance at checkout).</li>
</ul>` }
  ],
  flow: { title: 'Cache-aside read and write, with a stampede averted', steps: [
    { title: 'Read: check cache', desc: 'GET product:42 from Redis. It is a miss; the key expired 10 ms ago.' },
    { title: 'Single-flight lock', desc: '500 requests miss at once. HybridCache lets only the first one compute; the other 499 wait on the same task instead of hitting the database.' },
    { title: 'Load from source', desc: 'One query runs: SELECT … FROM Products WHERE Id = 42. Result arrives in 8 ms.' },
    { title: 'Fill cache', desc: 'SET product:42 with a TTL of 5 minutes plus random jitter of up to 30 s. All 500 waiting requests receive the value.' },
    { title: 'Write: update source', desc: 'An admin changes the price. The API writes the new price to the database first.' },
    { title: 'Invalidate', desc: 'The API deletes product:42 from Redis (not "update it"), and publishes a "product changed" event so in-process L1 copies drop too.' },
    { title: 'Next read refills', desc: 'The next GET misses, loads the fresh price and fills the cache again. The staleness window was a few milliseconds.' }
  ] },
  code: [
    { lang: 'csharp', title: 'HybridCache in ASP.NET Core: L1 memory + L2 Redis, stampede-safe, tag invalidation', code: `// dotnet add package Microsoft.Extensions.Caching.Hybrid
// dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
using Microsoft.Extensions.Caching.Hybrid;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddStackExchangeRedisCache(o =>
    o.Configuration = builder.Configuration.GetConnectionString("Redis"));   // L2, shared

builder.Services.AddHybridCache(o =>
{
    o.DefaultEntryOptions = new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(5),        // L2 (Redis) lifetime
        LocalCacheExpiration = TimeSpan.FromSeconds(30) // L1 (in-process) lifetime, shorter
    };
});

var app = builder.Build();

// READ: cache-aside / read-through. Concurrent misses for the same key share ONE factory call.
app.MapGet("/products/{id:int}", async (int id, HybridCache cache, ProductRepository repo, CancellationToken ct) =>
{
    var product = await cache.GetOrCreateAsync(
        "product:" + id,
        async token => await repo.GetByIdAsync(id, token),     // runs only on a miss
        tags: ["products", "product:" + id],
        cancellationToken: ct);

    return product is null ? Results.NotFound() : Results.Ok(product);
});

// WRITE: update the source of truth first, then invalidate (delete), never "update the cache".
app.MapPut("/products/{id:int}/price", async (int id, decimal price, HybridCache cache, ProductRepository repo, CancellationToken ct) =>
{
    await repo.UpdatePriceAsync(id, price, ct);
    await cache.RemoveAsync("product:" + id, ct);
    return Results.NoContent();
});

// Bulk invalidation by tag, e.g. after a catalogue import
app.MapPost("/admin/catalogue/reload", async (HybridCache cache, CancellationToken ct) =>
{
    await cache.RemoveByTagAsync("products", ct);
    return Results.Accepted();
});

app.Run();` },
    { lang: 'csharp', title: 'IMemoryCache by hand: TTL with jitter, size limit, and a single-flight guard', code: `using Microsoft.Extensions.Caching.Memory;
using System.Collections.Concurrent;

public sealed class ProductCache
{
    private readonly IMemoryCache _cache;
    private readonly ProductRepository _repo;
    private readonly ConcurrentDictionary<string, Lazy<Task<Product?>>> _inFlight = new();

    public ProductCache(IMemoryCache cache, ProductRepository repo) { _cache = cache; _repo = repo; }

    public async Task<Product?> GetAsync(int id, CancellationToken ct)
    {
        string key = "product:" + id;
        if (_cache.TryGetValue(key, out Product? hit)) return hit;

        // Single-flight: the first caller creates the task, everyone else awaits the same one
        var lazy = _inFlight.GetOrAdd(key, _ => new Lazy<Task<Product?>>(() => LoadAndStoreAsync(key, id, ct)));
        try   { return await lazy.Value; }
        finally { _inFlight.TryRemove(key, out _); }
    }

    private async Task<Product?> LoadAndStoreAsync(string key, int id, CancellationToken ct)
    {
        var product = await _repo.GetByIdAsync(id, ct);

        // Jitter: 5 min plus up to 30 s so a batch of keys does not expire together
        var ttl = TimeSpan.FromMinutes(5) + TimeSpan.FromSeconds(Random.Shared.Next(0, 30));

        var options = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = ttl,
            Size = 1                                   // counts against SizeLimit below
        };
        options.RegisterPostEvictionCallback((k, v, reason, state) =>
            Console.WriteLine("Evicted " + k + " because " + reason));

        // Negative caching: remember "not found" briefly so bad ids do not hammer the DB
        if (product is null) options.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30);

        _cache.Set(key, product, options);
        return product;
    }

    public void Invalidate(int id) => _cache.Remove("product:" + id);
}

// Registration: cap the cache so it cannot eat all the RAM
// builder.Services.AddMemoryCache(o => o.SizeLimit = 10_000);
// builder.Services.AddSingleton<ProductCache>();` },
    { lang: 'text', title: 'Cheat sheet: which pattern, which TTL', code: `PATTERN            WHEN TO USE                                   RISK
cache-aside        default for reads; you control everything     read/delete race -> keep a TTL
read-through       same, with less app code (HybridCache)        same as above
write-through      cache must never be stale (config, prices)    slower writes; caches unread data
write-behind       high write rate, loss tolerable (counters)    data loss if cache dies

INVALIDATION       HOW                                           NOTE
TTL                expire after N seconds                        add jitter; it is the safety net
delete on write    DB write, then DEL key                        prefer DELETE over SET
event/pub-sub      publish "X changed"; all servers drop L1      needed for in-process caches
tags / versions    RemoveByTag("products") or product:42:v8      bulk invalidation

TTL GUIDE (starting points, tune with hit-rate metrics)
  static reference data (countries, categories)   1 - 24 h
  product details / descriptions                  5 - 60 min
  prices, stock levels                            10 - 60 s  (or write-through)
  user session / profile                          sliding 20 - 30 min
  search results                                  1 - 5 min
  "not found" (negative cache)                    10 - 60 s
  never cache: account balance at checkout, OTPs, anything per-request`
    }
  ],
  pitfalls: [
    'Updating the cache on write instead of deleting it. Two concurrent updates can land in the wrong order and leave the newer value overwritten by the older.',
    'No TTL "because we invalidate correctly". You do not. The TTL is the safety net for the bug you have not found yet.',
    'Letting a cache miss stampede the database. Use single-flight (HybridCache does it) and jittered TTLs.',
    'Using an in-process cache on 10 servers and wondering why users see different data on each refresh. Either share (Redis) or broadcast invalidations.',
    'Creating a new Redis connection per request. StackExchange.Redis is a singleton multiplexer.',
    'Caching per-user, never-repeated results. Low hit rate, wasted memory. Cache what is read many times.'
  ],
  quiz: [
    { q: 'In cache-aside, what happens on a cache miss?', options: ['The cache returns null, so the request fails with an error', 'The app reads the database, fills the cache, and returns the value', 'The cache loads the value from the database itself, without the app', 'The cache asks a neighbouring cache server for its copy'], answer: 1, why: 'Cache-aside means the application does the work: check cache, on miss load from the source, write to cache, return. The cache itself is passive.' },
    { q: 'After updating a product price in the database, the safest cache action is to…', options: ['Write the new price into the cache straight away', 'Delete the cache key so the next read reloads it', 'Do nothing, because the TTL will fix it eventually', 'Clear the whole cache so nothing can be stale'], answer: 1, why: 'Deleting avoids ordering races between concurrent updates. The next read fills the fresh value. TTL alone leaves the old price visible for the whole TTL.' },
    { q: 'What is a cache stampede?', options: ['Many servers write the same key to the cache at once and overwrite each other', 'A hot key expires and many requests rebuild it from the database at once', 'The cache runs out of memory and evicts its most popular entries', 'Redis restarts and every client has to reconnect at the same time'], answer: 1, why: 'When a popular entry expires, every concurrent request misses and recomputes the same value, which can overload the source. Single-flight and early refresh prevent it.' },
    { q: 'Which eviction policy removes the entry that has not been accessed for the longest time?', options: ['FIFO', 'LFU', 'LRU', 'TTL'], answer: 2, why: 'LRU = least recently used. LFU looks at access count, FIFO at insertion order, and TTL is an expiry time rather than an eviction policy.' },
    { q: 'Why add jitter to TTLs?', options: ['To make popular keys expire sooner so they stay fresh', 'To stop many keys from expiring at the same moment', 'To spread keys more evenly across the cache servers', 'To meet the hash slot rules of Redis Cluster'], answer: 1, why: 'Keys filled together (e.g. after a deploy) would expire together. A random offset spreads their expiry over time and smooths the load on the source.' },
    { q: 'Which .NET type gives you a two-level cache (memory + Redis) with stampede protection built in?', options: ['IMemoryCache', 'IDistributedCache', 'HybridCache', 'ResponseCache'], answer: 2, why: 'HybridCache combines an in-process L1 with a distributed L2, coalesces concurrent misses for the same key, and supports tags. IMemoryCache and IDistributedCache are single-level and leave stampede handling to you.' }
  ],
  takeaways: [
    'A cache is a fast copy of slow data; the hit rate decides how much load reaches the source.',
    'Cache-aside with TTL is the default pattern; write-through when staleness is unacceptable; write-behind for high-volume, loss-tolerant writes.',
    'Invalidate by deleting, not updating; keep a TTL as the safety net; broadcast invalidations for in-process caches.',
    'Prevent stampedes with single-flight, early refresh and jittered TTLs.',
    'In .NET, start with HybridCache (L1 + L2 + stampede protection + tags); keep the Redis multiplexer a singleton.',
    'Cache what is read often and can tolerate a short staleness window; never cache what must be exact right now.'
  ],
  interview: [
    { q: 'Explain cache-aside and its main failure mode.', a: `<p>The app checks the cache, loads from the DB on a miss and fills the cache; on writes it updates the DB and deletes the key. The failure mode is a race: a slow read can write an old value into the cache just after a concurrent update deleted the key, leaving stale data until the TTL. Short TTLs, delayed double-delete, or versioned entries limit the damage.</p>` },
    { q: 'How would you prevent a cache stampede for a very popular key?', a: `<p>Coalesce concurrent misses so one caller computes and the rest wait (single-flight), refresh the entry in the background before it expires, add jitter to TTLs so keys do not expire together, and consider serving the stale value while revalidating. For truly hot keys, add a short-TTL in-process cache in front of Redis.</p>` },
    { q: 'When would you choose write-through over cache-aside?', a: `<p>When reads must never see stale data and the write rate is modest: feature flags, pricing rules, configuration. Write-through keeps the cache correct at the cost of slower writes and caching items that may never be read. For most read-heavy data, cache-aside with delete-on-write is cheaper.</p>` },
    { q: 'What is negative caching and why does it matter?', a: `<p>Caching the fact that a key does not exist, with a short TTL. Without it, every request for a missing id bypasses the cache and hits the database, which is both slow and an easy way for an attacker to overload the system (cache penetration). A Bloom filter can answer "definitely absent" for very large key spaces.</p>` }
  ]
};

window.CONTENT['m3-distributed-transactions'] = {
  hook: `Inside one database, "all or nothing" is a single keyword: COMMIT. Across three services, there is no such keyword, and pretending there is has cost companies real money.`,
  intro: `<p>A <span class="term">transaction</span> is a group of changes that must all happen or none happen. In one SQL database this is easy: BEGIN, do the work, COMMIT. If anything fails, ROLLBACK undoes it all. That guarantee is called <span class="term">atomicity</span>.</p>
<p>Now split your app into services. Placing an order touches the Orders service, the Payments service and the Inventory service, each with its own database. If payment succeeds but inventory fails, you have charged a customer for something you cannot ship. There is no single COMMIT that spans all three. This is the <span class="term">distributed transaction</span> problem.</p>
<p>There are two families of answers. <strong>Two-phase commit (2PC)</strong> tries to keep "all or nothing" by having a coordinator ask every participant to prepare, then commit. It works but it is slow and fragile. The <strong>saga</strong> pattern gives up on instant atomicity: each service commits locally, and if a later step fails, earlier steps are undone with <span class="term">compensating actions</span> (refund the payment). The system is <span class="term">eventually consistent</span>. You will learn both, plus the two patterns that make sagas reliable: the <strong>outbox</strong> and <strong>idempotent consumers</strong>.</p>`,
  realLife: { title: 'Booking a holiday: flight, hotel, taxi', body: `<p>You book a flight, a hotel and an airport taxi from three different companies. There is no magic button that confirms all three at once. You book the flight (committed). You book the hotel (committed). The taxi company says no cars that day. What now? You cannot "un-happen" the flight; you cancel it and pay a cancellation fee. That cancellation is a compensating action, and the whole sequence is a saga.</p>
<p>Alternatively, a travel agent could phone all three, ask "can you hold this for me?", wait for three yeses, then say "confirm" to all three. That is two-phase commit. It works, but while the agent waits, three seats are blocked for everyone else, and if the agent's phone dies after the holds, the seats stay blocked until someone times them out. Amazon, Uber and every bank's payments team chose sagas for cross-service flows for exactly this reason.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Why one COMMIT is not enough</h4>
<p>Each microservice owns its own database (that is the point of microservices). A SQL transaction only covers one database. So "create order + take payment + reserve stock" is three separate transactions in three places, and any of them can fail after the others succeeded. The network between them can also fail, so a service may have committed without the caller ever hearing about it.</p>
<h4>Two-phase commit in plain words</h4>
<ol>
<li><strong>Prepare:</strong> a coordinator asks every participant "can you commit this?" Each one does all the work, locks the rows, writes to its log, and replies yes or no.</li>
<li><strong>Commit:</strong> if everyone said yes, the coordinator tells all of them "commit". If anyone said no, it tells all "abort".</li>
</ol>
<p>The problem: between prepare and commit, every participant holds locks and waits. If the coordinator crashes at that moment, they wait forever (a <span class="term">blocking</span> protocol). 2PC also needs every participant to support it, which Redis, Kafka, HTTP APIs and most cloud services do not.</p>
<h4>Sagas in plain words</h4>
<p>A <span class="term">saga</span> is a sequence of local transactions. Each step commits in its own database and then triggers the next step. If step 3 fails, the saga runs <strong>compensating transactions</strong> for steps 2 and 1, in reverse order, to undo their effect. "Undo" rarely means "delete"; it means a new action that cancels the business effect: refund, release stock, mark order as cancelled.</p>
<table><thead><tr><th>Step</th><th>Action</th><th>Compensation</th></tr></thead>
<tbody><tr><td>1</td><td>Create order (PENDING)</td><td>Mark order CANCELLED</td></tr><tr><td>2</td><td>Reserve stock</td><td>Release stock</td></tr><tr><td>3</td><td>Charge card</td><td>Refund card</td></tr><tr><td>4</td><td>Mark order CONFIRMED</td><td>(none; last step)</td></tr></tbody></table>
<h4>Eventual consistency</h4>
<p>During the saga, the system is briefly inconsistent: stock is reserved but the order is not yet confirmed. That is fine as long as the saga always finishes (forward or backward) and the UI shows honest states like "Processing". <span class="term">Eventual consistency</span> means: given enough time, everything agrees.</p>
<div class="callout tip"><p>Design compensations before you design the happy path. If a step cannot be compensated (an email was sent, a SMS went out), put it last.</p></div>` },
    { name: 'Intermediate', body: `<h4>Choreography vs orchestration</h4>
<div class="compare"><div><h5>Choreography</h5><p>No central brain. Each service publishes an event ("OrderCreated"), and the next service reacts ("InventoryReserved"), and so on. Simple for 2–3 steps, loosely coupled. Hard to follow once there are 6 steps and 4 failure paths: nobody can see the whole flow.</p></div><div><h5>Orchestration</h5><p>A saga orchestrator (a small state machine) tells each service what to do and tracks the state: "step 2 done, waiting for step 3". Easier to understand, test and monitor; adds one component that must be reliable. Tools: MassTransit sagas, NServiceBus, Temporal, Azure Durable Functions.</p></div></div>
<h4>The dual-write problem</h4>
<p>Step 1 writes the order to its database and then publishes "OrderCreated" to a message broker. Two writes, two systems. If the process dies between them, the order exists but no event was sent: the saga never starts and the order is stuck forever. Or you publish first and the DB write fails: downstream services act on an order that does not exist. This is the <span class="term">dual-write problem</span>, and it is the most common bug in event-driven systems.</p>
<h4>The transactional outbox</h4>
<p>Fix: write the event into an <code>Outbox</code> table <strong>in the same database transaction</strong> as the order. One COMMIT, both rows or neither. A separate background publisher reads unsent outbox rows, publishes them to the broker, and marks them sent. If the publisher crashes after publishing but before marking, it will publish again on restart, so messages are delivered <strong>at least once</strong>. That leads to the next pattern. (Debezium and SQL Server CDC can read the outbox from the transaction log instead of polling.)</p>
<h4>Idempotent consumers</h4>
<p>Because delivery is at-least-once, every consumer must handle the same message twice without doing the work twice. Store each processed message id in an <code>InboxMessages</code> (or ProcessedMessages) table in the consumer's database, inside the same transaction as the work. On a duplicate, the insert fails and you skip. Together, outbox + inbox give you effectively-once processing without any distributed transaction.</p>
<h4>Timeouts and the pending state</h4>
<p>What if the payment service never replies? The orchestrator must have a timeout per step and a decision: retry, compensate, or park the saga for a human. Every saga needs a "stuck" alert. Never leave an order in PENDING with no clock running.</p>
<div class="callout warn"><p>Compensations can fail too. They must be retried until they succeed (they should be idempotent), and if they keep failing, a person must be paged. "Refund failed silently" is how you end up in the news.</p></div>` },
    { name: 'Expert', body: `<h4>Where 2PC still lives</h4>
<p>2PC is not dead; it is just hidden. Inside a single distributed database (Spanner, CockroachDB, YugabyteDB) 2PC runs between shards, with Paxos/Raft replicating the coordinator's decision so it cannot be lost: that removes the blocking problem. Kafka's transactional producer uses a 2PC-like protocol between the producer, the transaction coordinator and partitions. The rule: 2PC is fine <em>inside</em> one system that controls all participants and their failure handling; it is a poor fit <em>between</em> independently deployed services.</p>
<h4>Isolation: what sagas give up</h4>
<p>ACID transactions give isolation: no one sees your half-done work. Sagas do not. Another request can read "stock reserved" before the order is confirmed, or a second saga can act on data a first saga will later compensate (a "dirty read" at the business level). Countermeasures from the literature (Garcia-Molina & Salem 1987, and later Richardson): <strong>semantic locks</strong> (a PENDING flag others must respect), <strong>commutative updates</strong> (design steps so order does not matter), <strong>pessimistic view</strong> (reorder steps so the risky one is last), <strong>re-read before write</strong>, and <strong>version files</strong> (record operations so they can be reordered).</p>
<h4>Exactly-once is a lie; effectively-once is a design</h4>
<p>No network protocol delivers exactly once. What you can build is: at-least-once delivery (outbox + broker acks) combined with idempotent processing (inbox table or natural idempotency keys). Kafka's "exactly-once semantics" is this same combination packaged inside Kafka Streams; the moment you call an external HTTP API from a consumer, you are back to needing an idempotency key on that call.</p>
<h4>Ordering and causality</h4>
<p>Events for the same order must be processed in order (Reserved before Released). Partition the broker by order id so one consumer handles one order's events sequentially (Kafka partitions, Azure Service Bus sessions). Across different orders, order does not matter. For choreographed sagas, include a correlation id and a causation id in every message so you can rebuild the story during an incident.</p>
<h4>Observability for sagas</h4>
<p>Give every saga an id, log every state transition with that id, expose a "sagas stuck for more than N minutes" metric, and build an admin page that shows a saga's timeline and lets an operator retry or compensate a step. Companies that run sagas at scale (Uber with Cadence/Temporal, Netflix with Conductor) treat the workflow engine as the source of truth for in-progress business processes.</p>
<h4>Interview angle</h4>
<ul>
<li>Say why 2PC is blocking and why it does not fit heterogeneous services; then propose a saga.</li>
<li>Pick orchestration for anything with more than three steps and explain the state machine.</li>
<li>Draw the outbox table and the publisher; name the dual-write problem it solves.</li>
<li>State "at-least-once + idempotent consumer = effectively once" and show the inbox table.</li>
<li>Mention the isolation gap and one countermeasure (semantic lock via PENDING status).</li>
</ul>` }
  ],
  flow: { title: 'An orchestrated order saga with one failure and a compensation', steps: [
    { title: 'Order created', desc: 'Orders service inserts the order with status PENDING and an OrderCreated row in its Outbox table, in one local transaction.' },
    { title: 'Outbox published', desc: 'A background publisher reads the outbox row, sends OrderCreated to the broker, marks it sent. The saga orchestrator receives it.' },
    { title: 'Reserve stock', desc: 'Orchestrator sends ReserveStock to Inventory. Inventory checks its Inbox for the message id (new), reserves 2 units, records the id, commits, and replies StockReserved.' },
    { title: 'Charge card', desc: 'Orchestrator sends ChargeCard with an idempotency key. The payment provider declines: insufficient funds. Payments replies PaymentFailed.' },
    { title: 'Compensate in reverse', desc: 'Orchestrator sends ReleaseStock to Inventory (idempotent; safe if delivered twice). Inventory releases the 2 units and replies StockReleased.' },
    { title: 'Order cancelled', desc: 'Orchestrator sends CancelOrder to Orders. Status becomes CANCELLED with reason "payment declined". The saga ends in a consistent state.' },
    { title: 'Customer informed', desc: 'A notification is sent last, because an email cannot be compensated. The user sees "Payment declined, nothing was charged".' }
  ] },
  code: [
    { lang: 'csharp', title: 'Transactional outbox with EF Core: one commit for the order and its event', code: `using System.Text.Json;
using Microsoft.EntityFrameworkCore;

public sealed class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = "";          // e.g. "OrderCreated"
    public string Payload { get; set; } = "";       // JSON
    public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? SentAtUtc { get; set; }        // null = not yet published
}

public sealed class OrdersDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OutboxMessage> Outbox => Set<OutboxMessage>();
    public OrdersDbContext(DbContextOptions<OrdersDbContext> o) : base(o) { }
}

public sealed class OrderService
{
    private readonly OrdersDbContext _db;
    public OrderService(OrdersDbContext db) => _db = db;

    public async Task<Guid> CreateAsync(Guid customerId, decimal total, CancellationToken ct)
    {
        var order = new Order { Id = Guid.NewGuid(), CustomerId = customerId, Total = total, Status = "PENDING" };
        _db.Orders.Add(order);

        // Same DbContext, same transaction: the event cannot exist without the order, or vice versa
        _db.Outbox.Add(new OutboxMessage
        {
            Type = "OrderCreated",
            Payload = JsonSerializer.Serialize(new { order.Id, order.CustomerId, order.Total })
        });

        await _db.SaveChangesAsync(ct);   // ONE commit
        return order.Id;
    }
}

// Background publisher: polls the outbox, publishes, marks sent. At-least-once by design.
public sealed class OutboxPublisher : BackgroundService
{
    private readonly IServiceScopeFactory _scopes;
    private readonly IMessageBus _bus;      // your Kafka / Service Bus / RabbitMQ wrapper
    public OutboxPublisher(IServiceScopeFactory scopes, IMessageBus bus) { _scopes = scopes; _bus = bus; }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            using var scope = _scopes.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<OrdersDbContext>();

            var batch = await db.Outbox
                .Where(m => m.SentAtUtc == null)
                .OrderBy(m => m.OccurredAtUtc)
                .Take(100)
                .ToListAsync(ct);

            foreach (var msg in batch)
            {
                await _bus.PublishAsync(msg.Type, msg.Payload, messageId: msg.Id, ct);  // broker dedupes on Id if supported
                msg.SentAtUtc = DateTime.UtcNow;   // if we crash before this line, we re-send: consumers must be idempotent
            }
            await db.SaveChangesAsync(ct);

            await Task.Delay(batch.Count == 0 ? 1000 : 50, ct);
        }
    }
}` },
    { lang: 'csharp', title: 'Idempotent consumer with an inbox table (Inventory service)', code: `public sealed class InboxMessage
{
    public Guid MessageId { get; set; }             // primary key = broker message id
    public DateTime ProcessedAtUtc { get; set; }
}

public sealed class ReserveStockHandler
{
    private readonly InventoryDbContext _db;
    private readonly IMessageBus _bus;
    public ReserveStockHandler(InventoryDbContext db, IMessageBus bus) { _db = db; _bus = bus; }

    public async Task HandleAsync(Guid messageId, ReserveStock cmd, CancellationToken ct)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);

        // 1. Have we seen this message? Unique PK makes the check race-safe.
        _db.Inbox.Add(new InboxMessage { MessageId = messageId, ProcessedAtUtc = DateTime.UtcNow });
        try { await _db.SaveChangesAsync(ct); }
        catch (DbUpdateException) { return; }       // duplicate delivery: already processed, do nothing

        // 2. Do the real work in the SAME transaction
        var item = await _db.Items.SingleAsync(i => i.Sku == cmd.Sku, ct);
        bool ok = item.Available >= cmd.Qty;
        if (ok) { item.Available -= cmd.Qty; item.Reserved += cmd.Qty; }

        // 3. Reply through OUR outbox (same transaction again)
        _db.Outbox.Add(new OutboxMessage
        {
            Type = ok ? "StockReserved" : "StockRejected",
            Payload = System.Text.Json.JsonSerializer.Serialize(new { cmd.OrderId, cmd.Sku, cmd.Qty })
        });

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
    }

    // Compensation: must also be idempotent. Releasing twice must not double the stock.
    public async Task ReleaseAsync(Guid messageId, ReleaseStock cmd, CancellationToken ct)
    {
        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        _db.Inbox.Add(new InboxMessage { MessageId = messageId, ProcessedAtUtc = DateTime.UtcNow });
        try { await _db.SaveChangesAsync(ct); } catch (DbUpdateException) { return; }

        var item = await _db.Items.SingleAsync(i => i.Sku == cmd.Sku, ct);
        var toRelease = Math.Min(cmd.Qty, item.Reserved);   // guard against over-release
        item.Reserved -= toRelease; item.Available += toRelease;

        // Reply through the outbox so the orchestrator knows the compensation is done
        _db.Outbox.Add(new OutboxMessage
        {
            Type = "StockReleased",
            Payload = System.Text.Json.JsonSerializer.Serialize(new { cmd.OrderId, cmd.Sku, cmd.Qty })
        });

        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);
    }
}

public record ReserveStock(Guid OrderId, string Sku, int Qty);
public record ReleaseStock(Guid OrderId, string Sku, int Qty);` },
    { lang: 'csharp', title: 'A tiny saga orchestrator as a state machine (persisted per order)', code: `public enum SagaState { Started, StockReserved, Paid, Completed, Compensating, Cancelled }

public sealed class OrderSaga
{
    public Guid OrderId { get; set; }
    public SagaState State { get; set; } = SagaState.Started;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public string? FailureReason { get; set; }
}

public sealed class OrderSagaOrchestrator
{
    private readonly SagaDbContext _db;   // holds OrderSaga rows + its own Outbox
    public OrderSagaOrchestrator(SagaDbContext db) => _db = db;

    public async Task OnAsync(string eventType, Guid orderId, string payload, CancellationToken ct)
    {
        var saga = await _db.Sagas.FindAsync([orderId], ct);
        if (saga is null)
        {
            saga = new OrderSaga { OrderId = orderId };
            _db.Sagas.Add(saga);            // first event for this order: INSERT a new row
        }
        if (saga.State is SagaState.Completed or SagaState.Cancelled) return;   // terminal: ignore late events

        switch (eventType, saga.State)
        {
            case ("OrderCreated", SagaState.Started):
                Send("ReserveStock", payload); break;

            case ("StockReserved", SagaState.Started):
                saga.State = SagaState.StockReserved; Send("ChargeCard", payload); break;

            case ("StockRejected", SagaState.Started):
                saga.State = SagaState.Cancelled; saga.FailureReason = "out of stock"; Send("CancelOrder", payload); break;

            case ("PaymentSucceeded", SagaState.StockReserved):
                saga.State = SagaState.Completed; Send("ConfirmOrder", payload); break;

            case ("PaymentFailed", SagaState.StockReserved):
                saga.State = SagaState.Compensating; saga.FailureReason = "payment declined";
                Send("ReleaseStock", payload); break;                // compensation, reverse order

            case ("StockReleased", SagaState.Compensating):
                saga.State = SagaState.Cancelled; Send("CancelOrder", payload); break;

            default:
                // Unexpected (event, state) pair: log it, do not crash the consumer
                break;
        }

        saga.UpdatedAtUtc = DateTime.UtcNow;   // EF Core tracks the saga, so changes are saved without calling Update
        await _db.SaveChangesAsync(ct);     // saga state + outgoing commands commit together

        void Send(string command, string body) =>
            _db.Outbox.Add(new OutboxMessage { Type = command, Payload = body });
    }
}

// A separate timer job finds sagas with UpdatedAtUtc older than e.g. 10 minutes in a non-terminal
// state, and either retries the pending command or raises an alert for a human.` }
  ],
  pitfalls: [
    'Writing to the database and then publishing an event as two separate operations. If the process dies in between, the saga never starts. Use an outbox.',
    'Assuming the broker delivers each message exactly once. It does not. Every consumer needs an inbox table or a natural idempotency check.',
    'Compensations that are not idempotent, so a retried "ReleaseStock" releases twice and inventory shows more than exists.',
    'No timeout on a step. Orders sit in PENDING forever and nobody is alerted.',
    'Putting a non-compensatable action (email, SMS, third-party shipment) in the middle of the saga instead of at the end.',
    'Reaching for 2PC between heterogeneous services (SQL + Redis + HTTP API). Most of them cannot take part, and the ones that can will block on coordinator failure.'
  ],
  quiz: [
    { q: 'Why is two-phase commit called a "blocking" protocol?', options: ['It blocks every read on every participant until the transaction ends', 'Prepared participants hold locks and wait if the coordinator crashes', 'The coordinator can only run one transaction at a time across the system', 'It blocks network partitions from splitting the participants'], answer: 1, why: 'After voting yes in the prepare phase, a participant cannot decide alone. If the coordinator disappears, it keeps its locks and waits, possibly for a long time.' },
    { q: 'In a saga, what is a compensating transaction?', options: ['A retry of the failed step with a longer timeout until it succeeds', 'A new action that cancels the effect of a completed step', 'A database ROLLBACK that removes the rows the step wrote', 'A payment to the customer for the inconvenience'], answer: 1, why: 'Completed steps are already committed and cannot be rolled back. A compensation (refund, release stock, cancel order) undoes their effect with a new committed action.' },
    { q: 'What problem does the transactional outbox solve?', options: ['Slow database writes: events are batched so the commit is faster', 'Out-of-order delivery: consumers receive events in the wrong order', 'Dual writes: saving data and publishing its event atomically', 'Duplicate processing: a consumer handles the same message twice'], answer: 2, why: 'By writing the event into an outbox table in the same transaction as the business data, both commit or neither. A separate publisher then sends it to the broker.' },
    { q: 'Outbox publishing gives at-least-once delivery. What must consumers do?', options: ['Nothing, because the broker removes every duplicate before delivery', 'Record each message id with the work and skip ids already seen', 'Reject any message whose timestamp is older than the last one seen', 'Run a two-phase commit with the broker for every message'], answer: 1, why: 'Duplicates will happen. An inbox table keyed by message id, written in the same transaction as the business change, makes reprocessing a no-op.' },
    { q: 'Which saga style has a central component that tracks the state and tells each service what to do?', options: ['Choreography', 'Orchestration', 'Two-phase commit', 'Event sourcing'], answer: 1, why: 'Orchestration uses a coordinator (state machine) that issues commands and reacts to replies. Choreography has no central brain; services react to each other’s events.' },
    { q: 'Where should a step that sends a confirmation email go in a saga?', options: ['First, so the user hears about the order quickly', 'Anywhere, because email is not part of the saga', 'Last, because it cannot be compensated', 'In parallel with payment, to save time'], answer: 2, why: 'You cannot un-send an email. Non-compensatable (or embarrassing-to-compensate) steps belong at the end, after all steps that might fail.' }
  ],
  takeaways: [
    'A single COMMIT only covers one database. Across services you need 2PC or a saga, and sagas are the practical choice.',
    '2PC keeps atomicity but blocks on coordinator failure and needs every participant to support it; it lives inside distributed databases, not between microservices.',
    'A saga is a chain of local transactions with compensating actions run in reverse on failure; orchestration scales better than choreography beyond a few steps.',
    'Fix the dual-write problem with a transactional outbox; accept at-least-once delivery.',
    'Make every consumer idempotent with an inbox table; outbox + inbox = effectively-once.',
    'Put timeouts on every step, alert on stuck sagas, and place non-compensatable actions last.'
  ],
  interview: [
    { q: 'How would you handle an order that needs payment and inventory in two different services?', a: `<p>With a saga, ideally orchestrated: create order PENDING, reserve stock, charge card, confirm; on any failure run compensations in reverse (refund, release, cancel). Each service commits locally and communicates via events written through a transactional outbox; consumers are idempotent via an inbox table. A timeout job watches for stuck sagas.</p>` },
    { q: 'What is the dual-write problem and how do you solve it?', a: `<p>Writing to your database and publishing to a broker are two separate systems; a crash between them leaves one done and the other not. The transactional outbox solves it: write the event to an outbox table in the same DB transaction, and have a background publisher (or CDC such as Debezium) forward it to the broker with at-least-once semantics.</p>` },
    { q: 'Can you guarantee exactly-once processing?', a: `<p>Not at the delivery level. You combine at-least-once delivery with idempotent processing: record each message id in the consumer’s database within the same transaction as the business change, and skip duplicates. The effect is exactly-once; the mechanism is "at least once plus dedupe".</p>` },
    { q: 'What do sagas lose compared to ACID transactions, and how do you mitigate it?', a: `<p>Isolation. Other requests can see intermediate states, and two sagas can interleave. Mitigations: semantic locks (a PENDING status others must respect), commutative operations, ordering risky steps last, re-reading before writing, and partitioning event streams by aggregate id to keep per-entity ordering.</p>` }
  ]
};

window.CONTENT['m3-sql-vs-nosql'] = {
  hook: `"Should we use MongoDB or SQL Server?" is the wrong question. The right one is: what shape is the data, how will it be read, and what happens when it grows a hundred times?`,
  intro: `<p>A <span class="term">relational database</span> (SQL Server, PostgreSQL, MySQL) stores data in tables with fixed columns, links tables with foreign keys, and lets you ask any question with SQL joins. <span class="term">NoSQL</span> is a loose family name for everything else: document stores, key-value stores, wide-column stores, graph databases and time-series databases. Each one gives up something relational databases offer (usually joins, strict schema, or cross-row transactions) to gain something else (usually horizontal scale, flexible shape, or speed for one access pattern).</p>
<p>Neither side is "modern" or "legacy". Relational databases run the world's banks and also most startups; NoSQL stores run Netflix's viewing history, Discord's messages and Amazon's shopping carts. Big systems use several at once, which is called <span class="term">polyglot persistence</span>.</p>
<p>This topic gives you a clear picture of each family, when it fits, how each one scales, and a decision checklist you can use in a design interview or a real architecture meeting.</p>`,
  realLife: { title: 'A library, a post office, and a family tree', body: `<p>A <strong>library catalogue</strong> is relational: every book has the same fields (title, author, ISBN, shelf), books link to authors and to borrowers, and the librarian can answer odd questions like "which authors have books borrowed by members who joined last year?" by joining the cards. Integrity matters: a book cannot be lent to a member who does not exist.</p>
<p>A <strong>post office's parcel lockers</strong> are key-value: locker number in, parcel out, nothing else. Blazing fast, no questions about contents. A <strong>family tree</strong> is a graph: the interesting queries are "who are my second cousins?", which is painful in tables and natural in a graph. A <strong>hospital monitor</strong> producing one heart-rate reading per second is time-series: append-only, queried by time range, compressed heavily. Real companies mix them: a large online shop typically keeps orders in a relational store, the product catalogue in a document store, sessions in Redis, and recommendations in a graph.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>The families, in one table</h4>
<table><thead><tr><th>Type</th><th>Data looks like</th><th>Examples</th><th>Great at</th><th>Weak at</th></tr></thead>
<tbody>
<tr><td>Relational (SQL)</td><td>Tables, rows, foreign keys</td><td>SQL Server, PostgreSQL, MySQL</td><td>Joins, transactions, any ad-hoc query, integrity</td><td>Scaling writes across many machines</td></tr>
<tr><td>Document</td><td>JSON documents in collections</td><td>MongoDB, Cosmos DB, Couchbase</td><td>Flexible shape, whole-object reads, fast development</td><td>Cross-document joins and transactions</td></tr>
<tr><td>Key-value</td><td>key → blob</td><td>Redis, DynamoDB (basic use), Memcached</td><td>Very fast lookups by key, caches, sessions</td><td>Any query that is not "by key"</td></tr>
<tr><td>Wide-column</td><td>Rows with many sparse columns, partitioned by key</td><td>Cassandra, HBase, ScyllaDB, Bigtable</td><td>Huge write volume, time-ordered data per key, multi-region</td><td>Ad-hoc queries; you design tables per query</td></tr>
<tr><td>Graph</td><td>Nodes and edges</td><td>Neo4j, Amazon Neptune, Cosmos DB Gremlin</td><td>Relationship queries many hops deep</td><td>Bulk scans, simple CRUD at scale</td></tr>
<tr><td>Time-series</td><td>Timestamped measurements</td><td>InfluxDB, TimescaleDB, Prometheus</td><td>Append, compress, range queries, downsampling</td><td>Updating old rows, relationships</td></tr>
<tr><td>Search</td><td>Inverted index over text</td><td>Elasticsearch, OpenSearch, Azure AI Search</td><td>Full-text search, facets, relevance</td><td>Being the source of truth</td></tr>
</tbody></table>
<h4>Schema: fixed or flexible?</h4>
<p>Relational tables have a fixed schema: every row has the same columns, and the database refuses data that does not fit. That protects you from bad data. Document stores let each document have its own shape, which is fast when requirements change weekly, but moves the job of "what does a product look like?" into your code, where it is easier to forget.</p>
<h4>Transactions</h4>
<p>Relational databases give ACID transactions across many rows and tables. Most NoSQL stores give atomic updates to one document or one key, and some (MongoDB, Cosmos DB, DynamoDB) now offer multi-item transactions with limits. If your core flow is "move money from A to B", relational is the safe default.</p>
<div class="callout tip"><p>If you are unsure, start with PostgreSQL or SQL Server. Both handle JSON columns, full-text search and hundreds of GB without drama. Add a specialised store when you have a specific pain, not before.</p></div>` },
    { name: 'Intermediate', body: `<h4>How each one scales</h4>
<p><strong>Relational:</strong> scale reads with replicas (one primary takes writes, N replicas serve reads). Writes scale vertically until you shard by hand (split customers A–M and N–Z across servers), which breaks cross-shard joins and transactions. Newer "distributed SQL" databases (CockroachDB, YugabyteDB, Spanner, Azure SQL Hyperscale to a degree) shard automatically while keeping SQL and transactions, at the cost of higher write latency.</p>
<p><strong>Document and wide-column:</strong> built for sharding from day one. You choose a <span class="term">partition key</span> (customer id, device id); the store hashes it to a node. Queries that include the partition key are fast; queries that do not must fan out to every node (a "scatter-gather") and are slow. Choosing the partition key is the single most important design decision, and changing it later means migrating data.</p>
<p><strong>Key-value:</strong> consistent hashing (earlier topic) spreads keys across nodes; near-linear scale for get/set.</p>
<p><strong>Graph:</strong> hardest to shard, because edges cross machines. Most graph stores scale up, or replicate the whole graph for reads.</p>
<h4>Modelling differences that bite</h4>
<ul>
<li><strong>Normalise vs embed.</strong> Relational: one Orders table, one OrderItems table, join on read. Document: one order document with its items embedded. Embedding gives one-read access but duplicates data (a product name copied into 10,000 orders). Rule: embed what is read together and changes together; reference what is shared and changes independently.</li>
<li><strong>Query-first design.</strong> In Cassandra you create one table per query ("messages by conversation ordered by time", "conversations by user"). Writes go to all of them. This feels wrong to a SQL developer and is correct for that engine.</li>
<li><strong>Unbounded growth.</strong> A document that grows forever (a user with all their events embedded) hits size limits (16 MB in MongoDB, 2 MB in Cosmos DB). Split time-ordered data into bucketed documents.</li>
</ul>
<h4>Consistency settings</h4>
<p>Many NoSQL stores let you choose per request: DynamoDB has eventually consistent (cheaper) and strongly consistent reads; Cassandra has tunable consistency (ONE, QUORUM, ALL); Cosmos DB offers five levels from strong to eventual, with "session" (read-your-writes) as the common default. Relational databases are strongly consistent on the primary and eventually consistent on async replicas, which surprises people who read from a replica just after writing.</p>
<h4>The .NET angle</h4>
<ul>
<li>EF Core for SQL Server/PostgreSQL; EF Core also has a Cosmos DB provider.</li>
<li>MongoDB.Driver with POCOs and LINQ support; Redis via StackExchange.Redis; Cassandra via CassandraCSharpDriver.</li>
<li>PostgreSQL <code>jsonb</code> and SQL Server JSON functions let one relational database hold semi-structured data with indexes, which removes the need for a document store in many apps.</li>
</ul>` },
    { name: 'Expert', body: `<h4>Storage engines underneath</h4>
<p>Relational databases and MongoDB mostly use <strong>B-tree</strong> storage: great for reads and point updates, with write amplification on random inserts. Cassandra, HBase, RocksDB and the databases built on RocksDB-style engines (CockroachDB, YugabyteDB, TiKV) use <strong>LSM trees</strong>: writes go to an in-memory table and are flushed as sorted immutable files, then compacted in the background. LSM gives very high write throughput and good compression but slower reads (multiple files to check, mitigated by Bloom filters) and compaction spikes. When someone says "Cassandra handles a million writes a second", the LSM tree is why; when they say "reads got slow after a year", compaction tuning is where to look.</p>
<h4>What "schemaless" really costs</h4>
<p>Schema does not disappear; it moves from the database to every reader. Five services reading the same collection must agree on what fields mean and handle every historical shape. Mature teams version documents (a <code>schemaVersion</code> field), run migrations lazily on read, and validate with JSON Schema at the database (MongoDB supports it). Relational migrations are more work up front and far less work three years later.</p>
<h4>Multi-region and conflict resolution</h4>
<p>Globally distributed stores (Cosmos DB multi-write, DynamoDB global tables, Cassandra multi-DC) accept writes in several regions and must resolve conflicts: last-writer-wins by timestamp (simple, silently drops data), custom merge procedures, or CRDTs (data types designed to merge without conflict: counters, sets, Riak and Redis Enterprise have them). Relational multi-primary is rare and painful; most use one writable region with failover.</p>
<h4>Cost and operations</h4>
<p>Managed NoSQL is often priced per request unit (Cosmos DB RUs, DynamoDB RCU/WCU) which punishes scatter-gather queries and rewards good partition keys. Relational managed services price by instance size and storage. A hidden cost of polyglot persistence is operational: every extra engine needs backups, monitoring, upgrades, access control and someone who understands its failure modes at 3 a.m.</p>
<h4>Decision checklist</h4>
<ol>
<li>What are the top 5 queries? Write them down with expected QPS.</li>
<li>Do you need transactions across entities? If yes, relational (or a distributed SQL).</li>
<li>Is the data shape stable? Unstable → document store or JSONB.</li>
<li>Write volume above what one primary can take (roughly tens of thousands of writes/s sustained)? → wide-column or sharded store, with a partition key that appears in every hot query.</li>
<li>Are relationships the query (friends-of-friends, fraud rings)? → graph.</li>
<li>Is it measurements over time? → time-series.</li>
<li>Full-text search with ranking? → a search engine beside the source of truth.</li>
<li>Can you operate it? Prefer the managed service your cloud offers.</li>
</ol>
<h4>Interview angle</h4>
<p>Name the data types in the system and assign each one a store with a reason: orders → relational (transactions), product catalogue → document (varied attributes), sessions and carts → key-value (speed, TTL), messages at huge scale → wide-column keyed by conversation id (write volume, time ordering), recommendations → graph, metrics → time-series, search → Elasticsearch fed from the source of truth via events. Then say how they stay in sync (outbox events, CDC) and which one is the system of record.</p>` }
  ],
  flow: { title: 'Choosing a store for each piece of an e-commerce system', steps: [
    { title: 'List the data', desc: 'Orders, payments, products, carts, sessions, reviews, search, recommendations, click metrics.' },
    { title: 'Mark what needs transactions', desc: 'Orders and payments move money and stock together. They go to a relational database: SQL Server or PostgreSQL.' },
    { title: 'Mark what has a changing shape', desc: 'Products have different attributes per category (shoe size vs laptop RAM). A document store, or JSONB in PostgreSQL, fits.' },
    { title: 'Mark what is key-only and short-lived', desc: 'Carts and sessions are read by user id, expire, and must be fast. Redis with a TTL.' },
    { title: 'Mark what is huge and append-only', desc: 'Click events and metrics: millions per hour, queried by time. A time-series store or a wide-column store partitioned by day.' },
    { title: 'Mark what is about relationships', desc: '"People who bought X also bought Y" and fraud rings are graph queries. A graph store, fed from orders.' },
    { title: 'Choose a source of truth and sync', desc: 'Orders DB is the system of record. Changes flow out as events (outbox/CDC) to search, graph and analytics. Each store is rebuildable from the source.' }
  ] },
  code: [
    { lang: 'csharp', title: 'Same order, three stores: EF Core (SQL), MongoDB (document), Redis (key-value)', code: `// ---------- Relational: normalised, transactional ----------
// Tables: Orders(Id, CustomerId, Total, Status), OrderItems(OrderId, Sku, Qty, Price)
public async Task PlaceOrderSqlAsync(OrdersDbContext db, Guid customerId, List<(string Sku, int Qty, decimal Price)> items)
{
    await using var tx = await db.Database.BeginTransactionAsync();
    var order = new Order { Id = Guid.NewGuid(), CustomerId = customerId, Status = "PENDING" };
    foreach (var (sku, qty, price) in items)
        order.Items.Add(new OrderItem { Sku = sku, Qty = qty, Price = price });
    order.Total = order.Items.Sum(i => i.Qty * i.Price);
    db.Orders.Add(order);
    await db.SaveChangesAsync();
    await tx.CommitAsync();           // order + items commit together; FK guarantees items belong to a real order
}

// ---------- Document: embedded items, one read returns the whole order ----------
// dotnet add package MongoDB.Driver   (add "using MongoDB.Driver;" for Find / SortByDescending / ToListAsync)
// Guid fields need a format. Once at startup:
// BsonSerializer.RegisterSerializer(new GuidSerializer(GuidRepresentation.Standard));
public sealed class OrderDoc
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;   // a random Guid id cannot sort by time
    public string Status { get; set; } = "PENDING";
    public decimal Total { get; set; }
    public List<OrderItemDoc> Items { get; set; } = new();   // embedded: read/written with the order
    public int SchemaVersion { get; set; } = 1;              // plan for shape changes from day one
}
public sealed class OrderItemDoc { public string Sku { get; set; } = ""; public int Qty { get; set; } public decimal Price { get; set; } }

public async Task PlaceOrderMongoAsync(MongoDB.Driver.IMongoCollection<OrderDoc> orders, OrderDoc doc)
{
    await orders.InsertOneAsync(doc);      // atomic for this one document
}

public async Task<List<OrderDoc>> RecentOrdersAsync(MongoDB.Driver.IMongoCollection<OrderDoc> orders, Guid customerId)
{
    // Needs an index on { CustomerId: 1, CreatedAtUtc: -1 } or this scans the collection
    var filter = MongoDB.Driver.Builders<OrderDoc>.Filter.Eq(o => o.CustomerId, customerId);
    return await orders.Find(filter).SortByDescending(o => o.CreatedAtUtc).Limit(20).ToListAsync();
}

// ---------- Key-value: cart by user id, expires on its own ----------
// dotnet add package StackExchange.Redis
public async Task SaveCartAsync(StackExchange.Redis.IDatabase redis, Guid customerId, object cart)
{
    var json = System.Text.Json.JsonSerializer.Serialize(cart);
    await redis.StringSetAsync("cart:" + customerId, json, expiry: TimeSpan.FromDays(7));
}
public async Task<string?> LoadCartAsync(StackExchange.Redis.IDatabase redis, Guid customerId)
    => await redis.StringGetAsync("cart:" + customerId);` },
    { lang: 'sql', title: 'Relational with JSON: PostgreSQL jsonb and SQL Server JSON for flexible attributes', code: `-- PostgreSQL: fixed columns for what every product has, jsonb for the rest
CREATE TABLE products (
    id          bigserial PRIMARY KEY,
    sku         text NOT NULL UNIQUE,
    name        text NOT NULL,
    price       numeric(12,2) NOT NULL,
    attributes  jsonb NOT NULL DEFAULT '{}'::jsonb      -- {"size": 42, "colour": "red"} or {"ram_gb": 16}
);
CREATE INDEX ix_products_attrs ON products USING GIN (attributes);   -- indexes every key/value

-- Query inside the JSON (the @> containment query uses the GIN index)
SELECT sku, name FROM products WHERE attributes @> '{"colour": "red"}';
-- A range comparison like this one does NOT use the GIN index; add an expression index if it is hot
SELECT sku, attributes->>'ram_gb' AS ram FROM products WHERE (attributes->>'ram_gb')::int >= 16;

-- SQL Server equivalent: nvarchar(max) + JSON functions + a computed column you can index
CREATE TABLE Products (
    Id          bigint IDENTITY PRIMARY KEY,
    Sku         nvarchar(50) NOT NULL UNIQUE,
    Name        nvarchar(200) NOT NULL,
    Price       decimal(12,2) NOT NULL,
    Attributes  nvarchar(max) NOT NULL CONSTRAINT CK_Attributes_Json CHECK (ISJSON(Attributes) = 1),
    Colour AS JSON_VALUE(Attributes, '$.colour') PERSISTED            -- promote a hot key to a column
);
CREATE INDEX IX_Products_Colour ON Products(Colour);

SELECT Sku, Name FROM Products WHERE JSON_VALUE(Attributes, '$.colour') = 'red';
SELECT Sku, JSON_VALUE(Attributes, '$.ram_gb') AS RamGb FROM Products WHERE CAST(JSON_VALUE(Attributes, '$.ram_gb') AS int) >= 16;` },
    { lang: 'text', title: 'Decision matrix: data type → store → why', code: `DATA                      STORE                      WHY                                   PARTITION / KEY
orders, payments          SQL Server / PostgreSQL    multi-row transactions, integrity     (single primary; shard by customer later)
product catalogue         document store or JSONB    attributes vary by category           product id; index on category + attrs
cart, session             Redis                      key lookup, TTL, sub-ms               "cart:{userId}"
chat / event history      Cassandra / wide-column    huge writes, time-ordered per key     (conversationId, time DESC)
metrics, IoT readings     TimescaleDB / InfluxDB     append-only, range queries, compress  (deviceId, time)
"also bought", fraud      graph DB                   multi-hop relationship queries        node id
search box                Elasticsearch / AI Search  relevance, facets, typo tolerance     fed by events from the source of truth
files, images             object storage (S3/Blob)   cheap bytes, CDN in front             path/key

RED FLAGS
  - a query that does not include the partition key on a sharded store  -> scatter-gather, slow and expensive
  - a document that grows without bound                                  -> bucket it by time
  - two stores and no event stream keeping them in sync                 -> they will drift
  - "we chose NoSQL for scale" at 50 requests/second                    -> you chose complexity for nothing` }
  ],
  pitfalls: [
    'Choosing NoSQL "for scale" before measuring. Most apps never outgrow one well-indexed relational database.',
    'Picking a partition key that is not in your hottest query. Every read becomes a fan-out across all nodes.',
    'Embedding everything in one document until it hits the size limit or copies the same product name into a million orders.',
    'Expecting multi-document transactions to behave like SQL ones. They exist but have limits and costs; design around single-document atomicity.',
    'Reading from an async SQL replica right after writing and reporting a bug that "the save did not work".',
    'Running four database engines with one DBA. Each engine needs backups, upgrades, monitoring and someone who knows its failure modes.'
  ],
  quiz: [
    { q: 'Your core feature moves money between accounts and must never half-complete. Which store is the safest default?', options: ['A key-value store, because lookups by key are fastest', 'A document store, because the schema is flexible', 'A relational database with ACID transactions', 'A time-series database, because transfers have timestamps'], answer: 2, why: 'Multi-row, multi-table atomic transactions with strong consistency are exactly what relational databases are built for.' },
    { q: 'In a wide-column or document store, which decision most affects query performance?', options: ['The name of the collection', 'The partition key', 'The number of indexes', 'The driver language'], answer: 1, why: 'Data is spread across nodes by partition key. Queries that include it hit one node; queries that do not must ask every node.' },
    { q: 'Which store is the best fit for "find all friends-of-friends who work at the same company"?', options: ['Relational', 'Key-value', 'Graph', 'Time-series'], answer: 2, why: 'Multi-hop relationship traversal is the natural query of a graph database. In SQL it becomes several self-joins that get slower with each hop.' },
    { q: 'What does "schemaless" actually mean in practice?', options: ['The data has no structure at all, so readers need no rules', 'Your code enforces the structure instead of the database', 'The database cannot build indexes because fields are unknown', 'All documents in a collection must have identical fields'], answer: 1, why: 'The schema still exists; the database just stops checking it. Every reader must handle every shape that was ever written, so versioning documents matters.' },
    { q: 'Why do LSM-tree stores like Cassandra handle very high write rates?', options: ['They skip durability and only keep recent writes in memory', 'Writes go to memory, then flush to disk as sorted files', 'They update rows in place on disk, so nothing is rewritten later', 'They compress every network packet between client and node'], answer: 1, why: 'LSM trees turn random writes into sequential appends plus background compaction. The trade-off is more work on reads, softened by Bloom filters.' },
    { q: 'What is polyglot persistence?', options: ['Writing the same SQL queries in several programming languages', 'Using different databases for different data in one system', 'Replicating one database to many regions around the world', 'Storing data in several formats inside one table'], answer: 1, why: 'Each data type goes to the store that fits it (relational for orders, Redis for sessions, search engine for search), kept in sync by events from a single source of truth.' }
  ],
  takeaways: [
    'Relational: fixed schema, joins, ACID across tables; scales reads with replicas, writes by sharding (hard) or distributed SQL.',
    'Document: flexible JSON, embed what is read together; key-value: fastest by key, nothing else; wide-column: massive writes, one table per query; graph: relationships; time-series: measurements.',
    'The partition key is the most important design decision in any sharded store.',
    'Schemaless moves the schema into your code; version your documents.',
    'Start with PostgreSQL or SQL Server (both handle JSON); add specialised stores for specific pain.',
    'Pick one system of record and sync the others with events; every extra engine is an operational cost.'
  ],
  interview: [
    { q: 'When would you choose a document database over a relational one?', a: `<p>When the entity is naturally a self-contained object read and written as a whole, its shape varies or changes often, cross-entity transactions are rare, and you need easy horizontal scaling by a clear partition key. A product catalogue with category-specific attributes is the classic case. For orders and money, relational stays the default.</p>` },
    { q: 'How do you scale a relational database when one server is not enough?', a: `<p>First vertically and with indexes and caching. Then read replicas for read traffic. Then split by function (orders DB, catalogue DB). Then shard by a key such as customer id, accepting the loss of cross-shard joins and transactions, or move to a distributed SQL engine that shards automatically at higher write latency.</p>` },
    { q: 'What is the trade-off of tunable consistency in Cassandra or DynamoDB?', a: `<p>Strong (quorum) reads cost more latency and capacity and may fail during partitions; eventual reads are cheaper and always available but can return stale data. You choose per request: strong for "did my payment go through", eventual for "show my feed".</p>` },
    { q: 'Describe a system using polyglot persistence and how the stores stay consistent.', a: `<p>Orders in SQL Server (source of truth), catalogue in Cosmos DB or JSONB, carts in Redis, search in Elasticsearch, recommendations in a graph. The orders service writes events through a transactional outbox; consumers update search, graph and analytics idempotently. Secondary stores are rebuildable from the source, and lag between them is monitored.</p>` }
  ]
};

