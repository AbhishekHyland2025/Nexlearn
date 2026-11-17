// DevPath content: Module 6, Optimizations (m6-dotnet-performance, m6-sql-optimization, m6-angular-optimization, m6-profiling-tools)
window.CONTENT = window.CONTENT || {};

window.CONTENT['m6-dotnet-performance'] = {
  hook: `Most slow .NET code is not slow because the CPU is busy. It is slow because it makes the garbage collector clean up a mess it never needed to make.`,
  intro: `<p>Performance work in .NET is mostly about two things: <span class="term">allocations</span> (how many objects you create on the heap) and <span class="term">waiting</span> (how often a thread sits idle when it could do other work). The CPU itself is rarely the problem for a web API.</p>
<p>Every object you create with <code>new</code> on the heap must later be cleaned up by the <span class="term">garbage collector (GC)</span>. The GC is the part of the runtime that finds objects nobody uses any more and frees their memory. It is fast, but it is not free. When it runs, it pauses some or all of your threads. Fewer allocations means fewer pauses.</p>
<p>This lesson walks through the tools .NET gives you to allocate less (structs, <code>Span&lt;T&gt;</code>, <code>ArrayPool</code>, <code>StringBuilder</code>), to wait better (<code>async</code> done right, <code>ValueTask</code>, <code>IAsyncEnumerable</code>), and to prove your changes with numbers (<span class="term">BenchmarkDotNet</span>, a library that measures code accurately). The golden rule throughout: measure first, change second, measure again.</p>`,
  realLife: { title: 'The restaurant kitchen that kept washing plates', body: `<p>Imagine a restaurant where every dish is served on a brand-new plate, and after each bite the plate is thrown in the sink. A dishwasher (the GC) has to keep up. When the pile gets too big, the whole kitchen stops while he catches up. The cooks are not slow. The dishwashing is the bottleneck.</p>
<p>A smart kitchen reuses plates (object pooling), serves small things on the tray itself instead of a plate (structs and stack memory), and does not wash a plate twice (avoids copying data). That is exactly what high-performance .NET code does.</p>
<p>Where you see this for real: Microsoft rewrote large parts of ASP.NET Core and Kestrel around <code>Span&lt;T&gt;</code>, pooled buffers and <code>ValueTask</code>. That work is a big reason ASP.NET Core sits near the top of the TechEmpower web framework benchmarks. Teams running high-traffic APIs at companies like Stack Overflow have written for years about cutting allocations to lower GC pauses and server counts.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>What the GC actually does</h4>
<p>.NET splits the heap into <span class="term">generations</span>. Gen 0 holds brand-new objects. If an object survives a Gen 0 collection, it is promoted to Gen 1, then Gen 2. The idea is simple: most objects die young (a request's DTO, a temporary string), so the GC checks Gen 0 very often and cheaply, and checks Gen 2 rarely because it is big and full of long-lived things like caches and singletons.</p>
<ul>
<li><strong>Gen 0 collection</strong>: tiny, happens constantly, usually under a millisecond.</li>
<li><strong>Gen 2 collection</strong>: walks the whole heap. Can pause for tens of milliseconds or more on a big heap.</li>
<li><strong>Large Object Heap (LOH)</strong>: objects of 85,000 bytes or more (big arrays, huge strings) go straight here. It is collected only with Gen 2, so allocating large arrays in a loop is a classic way to cause expensive pauses.</li>
</ul>
<h4>Stack vs heap in one minute</h4>
<p>A <code>class</code> instance lives on the heap and must be garbage collected. A <code>struct</code> is a value: when it is a local variable it lives on the stack (or inside its container) and simply disappears when the method returns. No GC involved. That is why small, short-lived data (a point, a pair of ints, a date range) is often a <code>readonly record struct</code> in performance-sensitive code.</p>
<div class="callout warn"><p>Do not turn every class into a struct. Large structs get copied on every assignment and method call, which can be slower than one heap allocation. The usual advice: keep structs small (around 16 bytes or less) and immutable.</p></div>
<h4>Strings are the biggest hidden allocator</h4>
<p>Strings in .NET cannot change. <code>a + b</code> creates a third string. Doing that inside a loop creates a new string on every pass and copies all the previous characters again, so building a 10,000-part string that way is O(n²) work and thousands of allocations. Use <code>StringBuilder</code> for loops, string interpolation (<code>$"..."</code>) for one-off formatting, and <code>string.Join</code> or <code>string.Concat</code> for collections.</p>
<h4>Async: waiting without blocking</h4>
<p>When your API calls a database, the thread does not need to sit and wait. <code>await</code> frees that thread to serve another request and resumes your code when the data arrives. The number one beginner mistake is <code>.Result</code> or <code>.Wait()</code> on a task, which blocks the thread anyway and can even deadlock. The rule is "async all the way": if one method awaits, every caller above it should await too.</p>
<div class="callout tip"><p>You can see allocations without any special tool: run <code>dotnet-counters monitor</code> against your process and watch "GC Heap Size" and "Gen 0 GC Count" (apps on .NET 9 or newer list the same data under names like <code>dotnet.gc.last_collection.heap.size</code> and <code>dotnet.gc.collections</code>). If Gen 0 count climbs by hundreds per second under load, you are allocating a lot.</p></div>` },
    { name: 'Intermediate', body: `<h4>Span&lt;T&gt;: a window onto memory, not a copy</h4>
<p><code>Span&lt;T&gt;</code> is a small struct that points at a piece of memory (an array, a string, stack memory, or unmanaged memory) plus a length. Slicing a span gives you a new window with no copy and no allocation. <code>ReadOnlySpan&lt;char&gt;</code> lets you parse a string piece by piece without creating substrings. It is a <span class="term">ref struct</span>, which means it can only live on the stack: you cannot store it in a class field or use it across an <code>await</code>. For those cases there is <code>Memory&lt;T&gt;</code>, which can be stored and later turned into a span with <code>.Span</code>.</p>
<h4>ArrayPool: rent, use, return</h4>
<p>When you need a temporary buffer (reading a file, encoding, building a response), do not allocate a new array each time. <code>ArrayPool&lt;byte&gt;.Shared.Rent(size)</code> hands you a buffer that may be bigger than you asked for; you use it and then call <code>Return</code>. This keeps large buffers off the LOH and out of the GC's way. Always return in a <code>finally</code> block, and never use the array after returning it.</p>
<h4>ValueTask and IAsyncEnumerable</h4>
<p>A <code>Task&lt;T&gt;</code> is a class, so every async method that returns one allocates, even if it finishes synchronously (for example, a cache hit). <code>ValueTask&lt;T&gt;</code> is a struct that avoids the allocation when the result is already available. Use it for hot methods that usually complete synchronously, like a cache lookup. Do not await a ValueTask twice and do not store it.</p>
<p><code>IAsyncEnumerable&lt;T&gt;</code> streams items one at a time with <code>await foreach</code>. Instead of loading 100,000 rows into a list and then returning them, you yield each row as it arrives. Memory stays flat and the first bytes reach the client sooner. EF Core's <code>AsAsyncEnumerable()</code> and ASP.NET Core endpoints both support it directly.</p>
<h4>Source-generated JSON</h4>
<p><code>System.Text.Json</code> normally uses reflection on first use for each type, which costs startup time and allocations. With a <code>JsonSerializerContext</code> marked <code>[JsonSerializable(typeof(Order))]</code>, the serializer code is generated at compile time. Faster startup, less memory, and it is required for Native AOT.</p>
<h4>ReadyToRun and Native AOT in one paragraph</h4>
<p>Normally .NET compiles IL to machine code at run time (JIT). <span class="term">ReadyToRun</span> pre-compiles most of it at publish time, so startup is faster, while keeping the JIT for the rest. <span class="term">Native AOT</span> compiles everything ahead of time into a single native executable with no JIT at all: tiny startup, small memory, but no reflection-heavy libraries. AOT is great for CLI tools, serverless functions and sidecars; for a typical EF Core web API, ReadyToRun plus tiered compilation is the usual sweet spot.</p>
<table><thead><tr><th>Problem</th><th>Tool</th><th>Typical win</th></tr></thead><tbody>
<tr><td>String building in loops</td><td>StringBuilder / string.Create</td><td>10-100x fewer allocations</td></tr>
<tr><td>Parsing text</td><td>ReadOnlySpan&lt;char&gt; slicing</td><td>Zero substrings</td></tr>
<tr><td>Temporary big buffers</td><td>ArrayPool&lt;T&gt;</td><td>No LOH churn</td></tr>
<tr><td>Hot async cache hits</td><td>ValueTask&lt;T&gt;</td><td>No Task allocation</td></tr>
<tr><td>Huge result sets</td><td>IAsyncEnumerable&lt;T&gt;</td><td>Flat memory, faster first byte</td></tr>
<tr><td>Serializer startup</td><td>JSON source generator</td><td>Faster cold start, AOT ready</td></tr>
</tbody></table>
<div class="callout idea"><p>Before applying any of these, ask: is this code on a hot path? A helper called once at startup gains nothing from Span. Optimize the 3% of code that runs 97% of the time, and find that 3% with a profiler, not a guess.</p></div>` },
    { name: 'Expert', body: `<h4>GC modes and configuration</h4>
<p><strong>Workstation GC</strong> is tuned for desktop apps and low latency on few cores. <strong>Server GC</strong> (the default for ASP.NET Core) creates one heap and one GC thread per core and collects in parallel; it trades higher memory for throughput. Both can be <strong>concurrent</strong> (background Gen 2 collections that do not stop the world for the whole duration). In containers, be aware that Server GC reserves memory per core, so a 16-core node running a pod with a 512 MB limit can get OOM-killed. Set <code>DOTNET_GCHeapHardLimit</code> or use <code>DOTNET_gcServer=0</code> and <code>GCHeapCount</code> to match your real limits. .NET 8+ also has <strong>DATAS</strong> (dynamic adaptation to application sizes), which grows and shrinks heap count based on load and is on by default from .NET 9 for Server GC.</p>
<h4>Reading the allocation story</h4>
<p>Allocation rate matters more than heap size. A service allocating 1 GB/s will spend a large share of CPU in Gen 0 collections even if its live heap is only 50 MB. Measure it with <code>dotnet-counters</code> ("Allocation Rate"), capture a <code>dotnet-trace collect --profile gc-verbose</code> and open it in PerfView or Visual Studio to see which types and call stacks allocate most. The usual top offenders: LINQ chains on hot paths (each <code>Where</code>/<code>Select</code> allocates an iterator and a closure), <code>string.Format</code> with boxing of value types, <code>params</code> arrays, lambdas capturing locals, and <code>async</code> state machines that could have been synchronous.</p>
<h4>Async internals and the traps</h4>
<p>Each <code>async</code> method compiles into a state machine struct. On the synchronous path it stays a struct; on the first real await it is boxed to the heap along with captured locals. <code>ValueTask</code> helps only on the synchronous path. <code>ConfigureAwait(false)</code> matters in libraries (not ASP.NET Core apps, which have no synchronization context) to avoid capturing contexts. Thread pool starvation is the silent killer: blocking calls (<code>.Result</code>, <code>lock</code> around I/O, <code>Task.Run</code> for CPU work inside a web request) eat pool threads, and the pool injects new threads only slowly, so latency spikes while CPU looks idle. Diagnose with <code>dotnet-counters</code> "ThreadPool Queue Length" and "ThreadPool Thread Count" climbing together.</p>
<h4>Span and the JIT</h4>
<p>The JIT removes bounds checks when it can prove the index is in range (loops of the form <code>for (int i = 0; i &lt; span.Length; i++)</code>). It also uses hardware intrinsics (SSE/AVX on x64, NEON on ARM) in <code>Span</code> helpers like <code>IndexOf</code>, <code>SequenceEqual</code> and in <code>System.Linq</code> and <code>Enumerable.Sum</code> on arrays, so the built-in helpers usually beat hand-written loops. <code>string.Create</code> lets you write directly into the final string's buffer once, instead of building then copying. <code>stackalloc</code> with <code>Span&lt;T&gt;</code> gives small stack buffers with no GC cost; keep them under a few hundred bytes to avoid stack overflow on deep recursion.</p>
<h4>Tiered compilation and PGO</h4>
<p>Methods start at Tier 0 (fast compile, slow code). Hot methods are recompiled at Tier 1 with full optimization. <strong>Dynamic PGO</strong> (on by default since .NET 8) records which types actually flow through virtual calls and which branches are taken, then devirtualizes and inlines accordingly. Practical consequence: benchmarks must warm up (BenchmarkDotNet does this), and the first few hundred requests after a deploy are slower, which is why health checks should hit real code paths before a pod receives traffic.</p>
<h4>How interviewers probe this</h4>
<ul>
<li>"Why is my API's P99 latency spiky while average is fine?" Expect: Gen 2/LOH collections, thread pool starvation, or sync-over-async.</li>
<li>"When would you not use Span?" Across awaits, in class fields, in public APIs where callers would be confused; use Memory or arrays.</li>
<li>"Struct or class?" Small, immutable, short-lived, many instances: struct. Otherwise class. Mention defensive copies on readonly struct members.</li>
<li>"How do you prove an optimization helped?" BenchmarkDotNet with MemoryDiagnoser for micro, load test plus dotnet-counters for macro, and compare P95 not averages.</li>
</ul>
<div class="callout warn"><p>Never ship an optimization you cannot explain with a measurement. Clever code that saves 2% CPU but costs a weekend of debugging for the next developer is a net loss.</p></div>` }
  ],
  flow: { title: 'What happens to an object from new to garbage', steps: [
    { title: 'new Order()', desc: 'The runtime bumps a pointer in Gen 0 and hands you the memory. Allocation itself is very fast.' },
    { title: 'Gen 0 fills up', desc: 'After a few MB of allocations, Gen 0 is full and a collection starts. Threads pause briefly.' },
    { title: 'Mark live objects', desc: 'The GC starts from roots (stack variables, statics) and follows references. Anything it cannot reach is garbage.' },
    { title: 'Compact survivors', desc: 'Survivors are moved together and promoted to Gen 1. The freed space becomes Gen 0 again. Dead objects cost nothing.' },
    { title: 'Promote again', desc: 'Objects that survive a Gen 1 collection move to Gen 2, where caches and singletons live for the app lifetime.' },
    { title: 'Large objects', desc: 'Arrays of 85 KB or more skip the generations and go straight to the LOH, collected only during a Gen 2 run.' },
    { title: 'Gen 2 collection', desc: 'Rare but expensive: walks the full heap. Reducing allocations and LOH churn is how you keep these rare and short.' }
  ] },
  code: [
    { lang: 'csharp', title: 'Before and after: strings, LINQ and buffers on a hot path', code: `using System.Buffers;
using System.Text;

public static class CsvLine
{
    // BEFORE: allocates an array plus a substring for every field,
    // and a LINQ iterator per line. Fine once; terrible 100k times/sec.
    public static int SumThirdColumnSlow(string[] lines)
    {
        int total = 0;
        foreach (var line in lines)
        {
            var parts = line.Split(',');                 // array + N substrings
            total += int.Parse(parts.Skip(2).First());   // LINQ iterator object
        }
        return total;
    }

    // AFTER: zero allocations. Slice the span instead of creating substrings.
    public static int SumThirdColumnFast(string[] lines)
    {
        int total = 0;
        foreach (var line in lines)
        {
            ReadOnlySpan<char> s = line;
            int first = s.IndexOf(',');
            int second = s.Slice(first + 1).IndexOf(',') + first + 1;
            ReadOnlySpan<char> third = s.Slice(second + 1);
            int end = third.IndexOf(',');
            if (end >= 0) third = third.Slice(0, end);
            total += int.Parse(third);                   // parses a span directly
        }
        return total;
    }

    // Building a big string: StringBuilder, or string.Create when you know the size.
    public static string JoinIds(int[] ids)
    {
        var sb = new StringBuilder(ids.Length * 6);
        for (int i = 0; i < ids.Length; i++)
        {
            if (i > 0) sb.Append(',');
            sb.Append(ids[i]);                           // no boxing, no temp string
        }
        return sb.ToString();
    }

    // Temporary buffer: rent from the pool, always return in finally.
    public static async Task<int> CountBytesAsync(Stream stream)
    {
        byte[] buffer = ArrayPool<byte>.Shared.Rent(64 * 1024);
        try
        {
            int total = 0, read;
            while ((read = await stream.ReadAsync(buffer.AsMemory(0, buffer.Length))) > 0)
                total += read;
            return total;
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(buffer);
        }
    }
}` },
    { lang: 'csharp', title: 'Async done right: ValueTask cache, IAsyncEnumerable streaming, no sync-over-async', code: `using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;

public sealed class PriceService(AppDbContext db)
{
    private readonly ConcurrentDictionary<int, decimal> _cache = new();

    // Hot path: usually a cache hit, so ValueTask avoids allocating a Task on every call.
    public ValueTask<decimal> GetPriceAsync(int productId, CancellationToken ct)
    {
        if (_cache.TryGetValue(productId, out var cached))
            return ValueTask.FromResult(cached);          // synchronous, no allocation
        return LoadAsync(productId, ct);                  // real async path
    }

    private async ValueTask<decimal> LoadAsync(int productId, CancellationToken ct)
    {
        var price = await db.Products.Where(p => p.Id == productId)
                                     .Select(p => p.Price)
                                     .SingleAsync(ct);
        _cache[productId] = price;
        return price;
    }

    // Streaming: memory stays flat no matter how many rows. The endpoint can
    // return this directly and ASP.NET Core writes JSON as rows arrive.
    public async IAsyncEnumerable<OrderRow> ExportOrdersAsync(
        DateOnly since, [EnumeratorCancellation] CancellationToken ct)
    {
        var query = db.Orders.AsNoTracking()
                             .Where(o => o.OrderDate >= since)
                             .OrderBy(o => o.Id)
                             .Select(o => new OrderRow(o.Id, o.CustomerId, o.Total));
        await foreach (var row in query.AsAsyncEnumerable().WithCancellation(ct))
            yield return row;
    }
}

public record OrderRow(int Id, int CustomerId, decimal Total);

// WRONG: blocks a thread pool thread while waiting, can deadlock in some hosts,
// and under load starves the pool so every request gets slow.
//   var price = priceService.GetPriceAsync(1, ct).Result;
// RIGHT:
//   var price = await priceService.GetPriceAsync(1, ct);

// Source-generated JSON: no reflection at startup, required for Native AOT.
[System.Text.Json.Serialization.JsonSerializable(typeof(OrderRow))]
[System.Text.Json.Serialization.JsonSerializable(typeof(List<OrderRow>))]
public partial class AppJsonContext : System.Text.Json.Serialization.JsonSerializerContext { }

// In Program.cs:
// builder.Services.ConfigureHttpJsonOptions(o =>
//     o.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonContext.Default));` },
    { lang: 'csharp', title: 'Prove it with BenchmarkDotNet (dotnet add package BenchmarkDotNet)', code: `using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;

// Run with: dotnet run -c Release
// Never benchmark in Debug: the JIT skips optimizations and numbers are meaningless.
[MemoryDiagnoser]                 // adds Allocated bytes and Gen0/1/2 columns
[RankColumn]
public class StringBuildBenchmarks
{
    private int[] _ids = null!;

    [Params(10, 1_000)]           // runs every benchmark for each size
    public int Count;

    [GlobalSetup]
    public void Setup() => _ids = Enumerable.Range(1, Count).ToArray();

    [Benchmark(Baseline = true)]
    public string Concat()
    {
        string s = "";
        foreach (var id in _ids) s += id + ",";   // O(n^2) copies
        return s;
    }

    [Benchmark]
    public string Builder()
    {
        var sb = new System.Text.StringBuilder(Count * 6);
        foreach (var id in _ids) sb.Append(id).Append(',');
        return sb.ToString();
    }

    [Benchmark]
    public string Join() => string.Join(',', _ids);
}

public static class Program
{
    public static void Main() => BenchmarkRunner.Run<StringBuildBenchmarks>();
}

/* Typical shape of the output (your numbers will differ):
| Method  | Count | Mean        | Ratio | Allocated | Alloc Ratio |
|-------- |------ |------------:|------:|----------:|------------:|
| Concat  | 1000  | 190.000 us  | 1.00  | 3,900 KB  | 1.000       |
| Builder | 1000  |   8.000 us  | 0.04  |    12 KB  | 0.003       |
| Join    | 1000  |   6.000 us  | 0.03  |     8 KB  | 0.002       |
Read the Allocated column first. A 300x drop in allocations is what makes the
GC quiet in production, even more than the time column. */` }
  ],
  pitfalls: [
    'Optimizing without a profile. You will spend a day on code that runs 0.1% of the time. Use dotnet-trace or BenchmarkDotNet to find the real hot spot first.',
    'Benchmarking in Debug mode or with a Stopwatch around a single call. Use BenchmarkDotNet in Release, which handles warm-up, JIT tiering and statistics for you.',
    'Using .Result or .Wait() "just this once". Under load it starves the thread pool and the whole API slows down, with CPU looking idle.',
    'Returning a rented ArrayPool buffer twice, or keeping a reference after returning it. Both corrupt data in another part of the app in ways that are very hard to trace.',
    'Turning big classes into structs. Large structs copy on every pass and can be slower than a single heap allocation. Keep structs small and immutable.',
    'Awaiting a ValueTask more than once or storing it in a field. ValueTask is single-use; convert with .AsTask() if you need to await it twice.'
  ],
  quiz: [
    { q: 'Why does the GC check Gen 0 much more often than Gen 2?', options: ['Gen 0 is stored on the stack, so checking it does not need a real collection', 'Most objects die young, so Gen 0 is small and cheap to collect', 'Gen 2 is never collected until the process is about to run out of memory', 'Gen 0 objects are all structs, and structs are faster to scan'], answer: 1, why: 'The generational idea is a bet that most objects are short-lived. Checking the young generation often finds lots of garbage cheaply; the old generation is big and rarely has garbage.' },
    { q: 'What goes on the Large Object Heap?', options: ['Any object whose class declares more than 10 fields', 'Objects of 85,000 bytes or more, such as big arrays', 'Every string, because strings are immutable', 'Static fields and singletons that live for the whole app'], answer: 1, why: 'Objects at or above 85 KB are placed on the LOH, which is collected only with Gen 2. Allocating big arrays repeatedly causes expensive collections.' },
    { q: 'Which statement about Span<T> is correct?', options: ['It copies the data it points at so it is safe to store anywhere', 'It is a stack-only window onto existing memory and cannot cross an await', 'It only works with arrays of bytes, so text must be converted to bytes first', 'It is slower than a List<T> because every access does two bounds checks'], answer: 1, why: 'Span is a ref struct holding a pointer and a length. Slicing is free, but it cannot be stored on the heap or survive an await; use Memory<T> for that.' },
    { q: 'When does ValueTask<T> actually save an allocation?', options: ['Always, in every async method, because it is a struct', 'Only when the method completes synchronously, for example a cache hit', 'Only when the method throws an exception before its first await', 'Never; it is just a naming convention'], answer: 1, why: 'On the synchronous path the struct holds the result directly. If the method really awaits, a state machine still gets boxed, so the benefit is only on the fast path.' },
    { q: 'Your API shows low CPU, rising latency and a growing ThreadPool queue. Most likely cause?', options: ['The GC is compacting the LOH on every request, which keeps all cores busy', 'Thread pool starvation from blocking calls like .Result or sync I/O', 'Too many structs are being copied between methods on the hot path', 'JSON source generation is enabled'], answer: 1, why: 'Blocking calls hold pool threads while waiting, so work queues up although the CPU is idle. The fix is async all the way and no blocking in request paths.' },
    { q: 'What is the first thing to do before optimizing a slow endpoint?', options: ['Convert all classes to structs so nothing is allocated on the heap', 'Add ConfigureAwait(false) to every await so no thread is ever blocked', 'Measure with a profiler or benchmark to see where time actually goes', 'Switch to Native AOT'], answer: 2, why: 'Guesses about hot spots are usually wrong. A profile shows the real bottleneck and gives you a baseline to prove the fix.' }
  ],
  takeaways: [
    'Allocations drive GC pauses. Fewer allocations on hot paths is the single biggest .NET performance lever.',
    'Gen 0 is cheap and frequent, Gen 2 and the LOH are rare and expensive. Keep big arrays out of loops; pool them.',
    'Span<T> slices without copying, ArrayPool reuses buffers, StringBuilder and string.Join beat + in loops.',
    'Async all the way: never .Result or .Wait() in a request path. Use ValueTask for hot sync-mostly methods and IAsyncEnumerable for big result sets.',
    'JSON source generation and ReadyToRun speed up startup; Native AOT is for tools and functions, not reflection-heavy apps.',
    'Measure, change, measure again. BenchmarkDotNet for micro, load tests plus dotnet-counters for the whole service, compare P95 not averages.'
  ],
  interview: [
    { q: 'Explain the difference between Workstation and Server GC and when you would change the default.', a: `<p>Workstation GC uses one heap and runs collections on the user thread, tuned for responsiveness on few cores. Server GC creates a heap and a dedicated GC thread per core and collects in parallel, giving higher throughput at the cost of more memory. ASP.NET Core defaults to Server GC. You would switch to Workstation (or cap GCHeapCount / set a hard heap limit) in small containers where the per-core heaps would exceed the memory limit, or for many small services sharing one node.</p>` },
    { q: 'What is the difference between Span<T> and Memory<T>?', a: `<p>Both represent a slice of memory without copying. Span&lt;T&gt; is a ref struct: stack-only, fastest, but it cannot be a class field, cannot be captured by a lambda, and cannot cross an await. Memory&lt;T&gt; is a normal struct that can be stored and passed through async code; you call .Span on it when you need to actually read or write. Rule of thumb: Span inside synchronous methods, Memory at async boundaries and in fields.</p>` },
    { q: 'How would you find what is allocating in a production service?', a: `<p>Start with dotnet-counters to confirm a high allocation rate and frequent Gen 0/Gen 2 collections. Then capture a trace with dotnet-trace using the gc-verbose profile (or an allocation-sampling profile) for a minute under load and open it in PerfView or Visual Studio to see allocations grouped by type and call stack. Typical findings are LINQ on hot paths, string concatenation, boxing in logging calls, and oversized buffers. Fix the top one, redeploy, compare the counters.</p>` },
    { q: 'What is sync-over-async and why is it so harmful in ASP.NET Core?', a: `<p>Sync-over-async is blocking on an asynchronous operation with .Result, .Wait() or GetAwaiter().GetResult(). The thread sits idle but occupied, so under load the thread pool runs out of threads; the pool adds new ones slowly (roughly one or two per second), so request latency climbs while CPU stays low. In some contexts it can also deadlock. The fix is to make the whole call chain async and pass CancellationTokens through.</p>` }
  ]
};

window.CONTENT['m6-sql-optimization'] = {
  hook: `The database does not run the query you wrote. It runs the plan it chose for your query, and a tiny change in how you write a WHERE clause can turn a 2 ms index seek into a 20 second table scan.`,
  intro: `<p>When you send SQL to SQL Server or PostgreSQL, the <span class="term">query optimizer</span> looks at your query, the available indexes and its <span class="term">statistics</span> (a summary of how values are spread in each column) and picks an <span class="term">execution plan</span>: the step-by-step recipe to get the rows. Query optimization is mostly about helping the optimizer pick a good plan and giving it the indexes it needs.</p>
<p>The two words you will hear most are <span class="term">seek</span> and <span class="term">scan</span>. A seek uses an index to jump straight to the rows you want, like opening a book at the right page using the index at the back. A scan reads every row (or every index entry) from start to finish, like reading the whole book to find one name. Scans are fine on small tables and terrible on big ones.</p>
<p>This lesson shows you how to read a plan, which patterns stop the optimizer using your indexes (a property called <span class="term">SARGability</span>), what parameter sniffing is, why statistics matter, and the before/after fixes for the most common slow queries, including the SQL that EF Core generates for you.</p>`,
  realLife: { title: 'The warehouse picker who read every shelf', body: `<p>A warehouse has 2 million items. A new picker gets an order for item 48213. With no map, she walks every aisle reading every label until she finds it: a scan. An experienced picker checks the location board, which says "aisle 12, shelf C", and walks straight there: a seek. Now imagine the order sheet says "find the item whose label, with the first two letters removed, equals 213". The board is useless, because the board is sorted by the full label. She is back to walking every aisle. That is what <code>WHERE SUBSTRING(Code, 3, 3) = '213'</code> does to an index.</p>
<p>Where this matters in real companies: almost every "the site is down" incident caused by a database is one query that picked a bad plan after data grew or statistics got stale. Teams running SQL Server at scale (banks, e-commerce, SaaS) rely on Query Store to spot plan regressions and force the good plan while they fix the query.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>How to see what the database is doing</h4>
<p>In SQL Server Management Studio, press "Include Actual Execution Plan" (Ctrl+M) and run the query. The MSSQL extension for Visual Studio Code has a similar button (Azure Data Studio, which also had one, was retired in 2026). In PostgreSQL run <code>EXPLAIN (ANALYZE, BUFFERS) SELECT ...</code>. You get a tree of operators. Read it right to left (SQL Server) or inside out (PostgreSQL): the leaves read tables and indexes, the parents join, sort and aggregate.</p>
<ul>
<li><strong>Index Seek</strong>: good. The engine jumped to matching rows.</li>
<li><strong>Index Scan / Clustered Index Scan / Seq Scan</strong>: it read everything. Fine on 1,000 rows, slow on 10 million.</li>
<li><strong>Key Lookup / RID Lookup</strong>: the index found the row but had to go back to the table for other columns. Many lookups add up.</li>
<li><strong>Sort</strong>: often means a missing index that would have delivered rows already ordered.</li>
<li><strong>Thick arrows</strong>: many rows flowing. Hover to see actual vs estimated row counts; a big mismatch means stale statistics or a bad guess.</li>
</ul>
<h4>What an index is, in one picture</h4>
<p>An index is a sorted copy of one or more columns with pointers back to the rows, kept as a <span class="term">B-tree</span> (a wide, shallow tree where every lookup takes only three or four page reads). The <strong>clustered index</strong> is the table itself, sorted by its key (usually the primary key). A <strong>nonclustered index</strong> is a separate sorted structure. Each index speeds reads on its columns and slows every INSERT/UPDATE/DELETE a little, because it must be maintained.</p>
<h4>The three beginner fixes</h4>
<ol>
<li><strong>Stop selecting everything.</strong> <code>SELECT *</code> drags columns you do not need across the network and forces lookups. Name the columns.</li>
<li><strong>Index what you filter and join on.</strong> If every query says <code>WHERE CustomerId = @id</code>, there should be an index on CustomerId.</li>
<li><strong>Do not wrap indexed columns in functions.</strong> <code>WHERE YEAR(OrderDate) = 2026</code> cannot use an index on OrderDate. <code>WHERE OrderDate &gt;= '2026-01-01' AND OrderDate &lt; '2027-01-01'</code> can.</li>
</ol>
<div class="callout tip"><p>SQL Server shows a green "Missing Index" hint at the top of many plans. It is a decent starting point, but it suggests an index per query, so read it, then design one index that serves several queries instead of blindly creating all of them.</p></div>` },
    { name: 'Intermediate', body: `<h4>SARGable predicates</h4>
<p><span class="term">SARGable</span> means "Search ARGument able": the WHERE clause is written so the engine can use an index seek. The rule: the column must stand alone on one side of the comparison. Non-SARGable patterns and their fixes:</p>
<table><thead><tr><th>Slow (scan)</th><th>Fast (seek)</th></tr></thead><tbody>
<tr><td>WHERE YEAR(OrderDate) = 2026</td><td>WHERE OrderDate &gt;= '20260101' AND OrderDate &lt; '20270101'</td></tr>
<tr><td>WHERE UPPER(Email) = 'A@B.COM'</td><td>Use a case-insensitive collation, or store normalized email and index it</td></tr>
<tr><td>WHERE Name LIKE '%son'</td><td>LIKE 'John%' seeks; a leading wildcard scans. Use full-text search for contains</td></tr>
<tr><td>WHERE Total * 1.18 &gt; 1000</td><td>WHERE Total &gt; 1000 / 1.18</td></tr>
<tr><td>WHERE ISNULL(Status, 'X') = 'Open'</td><td>WHERE Status = 'Open' (or OR Status IS NULL if you really mean it)</td></tr>
<tr><td>WHERE CAST(Id AS varchar) = '42'</td><td>WHERE Id = 42 (match the parameter type to the column type)</td></tr>
</tbody></table>
<h4>Covering indexes and included columns</h4>
<p>If a query filters on CustomerId and returns OrderDate and Total, an index on (CustomerId) INCLUDE (OrderDate, Total) answers the whole query from the index with no key lookups. Column order in the key matters: put equality columns first, then range columns, and the index can only seek on a leading prefix. An index on (A, B) helps <code>WHERE A = 1</code> and <code>WHERE A = 1 AND B &gt; 5</code>, but not <code>WHERE B = 5</code> alone.</p>
<h4>Parameter sniffing</h4>
<p>SQL Server compiles a plan for a parameterized query the first time it runs, using the first parameter values it sees, and caches it. If the first call was for a customer with 3 orders, it picks a lookup-heavy plan that is awful later for a customer with 3 million orders. Signs: the same query is fast for some values and slow for others, and fast again after a restart or <code>DBCC FREEPROCCACHE</code>. Fixes, from gentle to heavy: <code>OPTION (RECOMPILE)</code> on the one query, <code>OPTIMIZE FOR UNKNOWN</code>, splitting very different cases into different queries, or in SQL Server 2022+ relying on Parameter Sensitive Plan optimization. PostgreSQL has a similar effect with prepared statements switching to a generic plan after five executions.</p>
<h4>Statistics</h4>
<p>Statistics are histograms of column values. If they say a column has 100 distinct values when it now has 10 million rows and 2 million values, the estimated row counts are wrong and the plan is wrong. Auto-update exists but triggers late on big tables. After bulk loads, run <code>UPDATE STATISTICS TableName</code> (SQL Server) or <code>ANALYZE tablename</code> (PostgreSQL). Any plan where "Estimated rows" and "Actual rows" differ by 10x or more is a statistics or SARGability problem.</p>
<h4>Pagination and batching</h4>
<p><code>OFFSET 100000 ROWS FETCH NEXT 20 ROWS ONLY</code> still reads and throws away 100,000 rows. Keyset pagination (<code>WHERE Id &gt; @lastId ORDER BY Id</code>) seeks straight to the next page. For big updates and deletes, work in batches of a few thousand rows inside a loop: smaller transactions, shorter locks, log file stays small.</p>
<h4>Temp tables vs table variables</h4>
<p>In SQL Server, a <code>#TempTable</code> has statistics and can be indexed, so the optimizer makes good decisions with large row counts. A <code>@TableVariable</code> historically had no statistics and was estimated as 1 row (improved by deferred compilation in 2019+). Rule of thumb: table variables for a handful of rows, temp tables for anything bigger or anything you join.</p>
<div class="callout warn"><p>EF Core writes the SQL for you, so review it. Turn on logging (or use <code>query.ToQueryString()</code>) and run the generated SQL with the actual plan. Common surprises: an unintended cartesian explosion from multiple Includes (fix with <code>AsSplitQuery()</code>), client-side evaluation, and string comparisons that add collation conversions.</p></div>` },
    { name: 'Expert', body: `<h4>Reading plans like an engineer</h4>
<p>Beyond seek vs scan, look at: the <strong>join type</strong> (Nested Loops is right for small outer inputs with an indexed inner side; Hash Match is right for large unsorted inputs; Merge Join needs both sides sorted and is excellent when they are), <strong>memory grants</strong> (a huge grant from a bad estimate can block other queries; a grant too small spills sorts and hashes to tempdb, visible as warnings on the operator), <strong>parallelism</strong> (Gather Streams means the query went parallel; great for reports, suspicious for a 5-row OLTP lookup, and tune with cost threshold for parallelism rather than MAXDOP 1 everywhere), and <strong>implicit conversions</strong> (a yellow warning on the SELECT operator; an nvarchar parameter against a varchar column converts every row and kills the seek).</p>
<h4>Query Store and plan regressions</h4>
<p>Query Store (SQL Server 2016+, on by default from 2022; Azure SQL has it on) records every query, its plans and runtime stats. When a deploy or a statistics update makes a query regress, the Regressed Queries report shows the old plan and the new one side by side, and you can force the good plan with one click or <code>sp_query_store_force_plan</code> while you fix the root cause. PostgreSQL's equivalent habit is <code>pg_stat_statements</code> plus <code>auto_explain</code> for slow queries.</p>
<h4>Index design at scale</h4>
<ul>
<li><strong>Fewer, wider indexes</strong> beat many narrow ones. Each index costs writes, space and plan-choice confusion. Review usage with <code>sys.dm_db_index_usage_stats</code> and drop indexes with zero seeks and many updates.</li>
<li><strong>Filtered indexes</strong> for the hot subset: <code>CREATE INDEX IX_Orders_Open ON Orders(CustomerId) WHERE Status = 'Open'</code> is tiny and perfect for a "my open orders" screen.</li>
<li><strong>Columnstore</strong> for analytics: batch-mode execution and 10x compression make GROUP BY over millions of rows fast; a nonclustered columnstore on an OLTP table gives real-time reporting.</li>
<li><strong>Ascending key hot spots</strong> and the "ascending key problem" with stale stats on the newest rows: trace flag 2371 / modern auto-stats thresholds help; after a big load, update stats explicitly.</li>
<li><strong>Fill factor and fragmentation</strong> matter less on SSDs than folklore says; rebuilding indexes nightly mostly refreshes statistics, which you can do cheaply on its own.</li>
</ul>
<h4>Locking and isolation as a performance issue</h4>
<p>Slow queries are not only about I/O. Long-running reads under READ COMMITTED block writers and vice versa. Read Committed Snapshot Isolation (RCSI) lets readers see the last committed version from tempdb instead of waiting; most OLTP systems should run with it on. Watch for lock escalation (over roughly 5,000 locks the engine takes a table lock), which batching avoids. Use <code>sys.dm_exec_requests</code> and the blocked process report to find the head blocker.</p>
<h4>Interview angle</h4>
<p>Interviewers ask: "A query was fast yesterday and slow today, nothing changed. What do you check?" The expected answer in order: parameter sniffing or a plan change (Query Store), statistics after data growth, blocking, and then hardware/tempdb. Also: "Explain a covering index", "Why does OFFSET pagination get slower", and "When is a scan the right choice?" (when the query needs most of the table, a scan is cheaper than millions of seeks; the optimizer's tipping point is usually a small percentage of rows).</p>
<div class="callout idea"><p>Treat SQL like code: keep slow-query budgets (for example, no endpoint query above 50 ms at P95), review generated SQL in pull requests for anything that touches a big table, and keep Query Store or pg_stat_statements open during load tests.</p></div>` }
  ],
  flow: { title: 'From a slow query to a fixed one', steps: [
    { title: 'Find it', desc: 'Query Store, pg_stat_statements or APM shows the top query by total duration or by CPU. Fix the top one, not the one you suspect.' },
    { title: 'Capture the actual plan', desc: 'Run it with Include Actual Execution Plan or EXPLAIN ANALYZE, with realistic parameters.' },
    { title: 'Spot the expensive operator', desc: 'Look for scans on big tables, thick arrows, key lookups, sorts, spills, and estimated vs actual row mismatches.' },
    { title: 'Check SARGability', desc: 'Is the column wrapped in a function, converted, or compared to a wildcard-first LIKE? Rewrite the predicate.' },
    { title: 'Check indexes and stats', desc: 'Is there an index with the right leading column? Would INCLUDE remove lookups? Are statistics stale after a load?' },
    { title: 'Change one thing', desc: 'Rewrite the query, add or adjust one index, or update statistics. One change at a time so you know what worked.' },
    { title: 'Measure again', desc: 'Compare logical reads (SET STATISTICS IO ON) and duration before and after. Keep the change only if the numbers improved.' },
    { title: 'Guard it', desc: 'Add the query to a load test, watch Query Store for regressions, and note the index in the migration so it ships with the code.' }
  ] },
  code: [
    { lang: 'sql', title: 'Before and after: SARGability, SELECT *, pagination (T-SQL, with PostgreSQL notes)', code: `-- Setup to measure. Logical reads are the fairest "how much work" number.
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

-- 1) BEFORE: function on the column -> clustered index scan of all Orders
SELECT * FROM Orders WHERE YEAR(OrderDate) = 2026 AND MONTH(OrderDate) = 10;

-- AFTER: open range on the raw column -> index seek, and only the columns we need
SELECT Id, CustomerId, OrderDate, Total
FROM Orders
WHERE OrderDate >= '20261001' AND OrderDate < '20261101';

-- Covering index so the AFTER query never touches the table (no key lookups)
CREATE NONCLUSTERED INDEX IX_Orders_OrderDate
    ON Orders (OrderDate)
    INCLUDE (CustomerId, Total);
-- PostgreSQL: CREATE INDEX ix_orders_orderdate ON orders (orderdate) INCLUDE (customerid, total);

-- 2) BEFORE: implicit conversion. Email is varchar(200), parameter is nvarchar -> scan
DECLARE @email NVARCHAR(200) = N'ana@example.com';
SELECT Id FROM Customers WHERE Email = @email;

-- AFTER: match the type. In C#/Dapper/EF map the parameter as DbType.AnsiString
DECLARE @email2 VARCHAR(200) = 'ana@example.com';
SELECT Id FROM Customers WHERE Email = @email2;

-- 3) BEFORE: leading wildcard cannot seek
SELECT Id, Name FROM Products WHERE Name LIKE '%phone%';
-- AFTER: prefix search seeks; for real "contains" use full-text search
SELECT Id, Name FROM Products WHERE Name LIKE 'phone%';
-- CREATE FULLTEXT INDEX ... ; SELECT ... WHERE CONTAINS(Name, 'phone');

-- 4) BEFORE: deep OFFSET reads and discards 200,000 rows every page
SELECT Id, OrderDate, Total FROM Orders
ORDER BY Id
OFFSET 200000 ROWS FETCH NEXT 20 ROWS ONLY;

-- AFTER: keyset pagination seeks straight to the next page
DECLARE @lastId INT = 200000;
SELECT TOP (20) Id, OrderDate, Total
FROM Orders
WHERE Id > @lastId
ORDER BY Id;
-- PostgreSQL: ... WHERE id > $1 ORDER BY id LIMIT 20;

-- 5) BEFORE: one giant DELETE holds locks for minutes and bloats the log
DELETE FROM AuditLog WHERE CreatedAt < DATEADD(DAY, -90, SYSUTCDATETIME());

-- AFTER: batches of 5,000 keep locks short and let other work through
DECLARE @rows INT = 1;
WHILE @rows > 0
BEGIN
    DELETE TOP (5000) FROM AuditLog
    WHERE CreatedAt < DATEADD(DAY, -90, SYSUTCDATETIME());
    SET @rows = @@ROWCOUNT;
END;` },
    { lang: 'sql', title: 'Parameter sniffing, statistics, temp tables vs table variables, finding missing/unused indexes', code: `-- PARAMETER SNIFFING: same procedure, wildly different data sizes per customer
CREATE OR ALTER PROCEDURE GetCustomerOrders @CustomerId INT
AS
BEGIN
    SELECT Id, OrderDate, Total
    FROM Orders
    WHERE CustomerId = @CustomerId
    ORDER BY OrderDate DESC
    OPTION (RECOMPILE);   -- cheapest fix for one hot query: fresh plan per call
    -- Alternatives:
    --   OPTION (OPTIMIZE FOR UNKNOWN)   -> average plan for everyone
    --   OPTION (OPTIMIZE FOR (@CustomerId = 42)) -> tune for a typical value
    --   SQL Server 2022+: Parameter Sensitive Plan optimization may handle it
END;
GO   -- end the batch here, or every statement below becomes part of the procedure

-- STATISTICS: estimated vs actual rows far apart? refresh them.
UPDATE STATISTICS Orders WITH FULLSCAN;      -- after bulk loads
-- Look at a histogram to understand what the optimizer believes:
DBCC SHOW_STATISTICS ('Orders', 'IX_Orders_OrderDate') WITH HISTOGRAM;
-- PostgreSQL: ANALYZE orders;  SELECT * FROM pg_stats WHERE tablename = 'orders';

-- TEMP TABLE vs TABLE VARIABLE
-- Table variable: fine for a few rows, no statistics, estimated as very small.
DECLARE @ids TABLE (Id INT PRIMARY KEY);
-- Temp table: has statistics, can be indexed, right choice for joins / thousands of rows.
CREATE TABLE #RecentOrders (Id INT PRIMARY KEY, CustomerId INT, Total DECIMAL(18,2));
INSERT INTO #RecentOrders (Id, CustomerId, Total)
SELECT Id, CustomerId, Total FROM Orders WHERE OrderDate >= DATEADD(DAY, -7, SYSUTCDATETIME());
CREATE INDEX IX_Recent_Customer ON #RecentOrders (CustomerId);

SELECT c.Name, SUM(r.Total) AS WeekTotal
FROM #RecentOrders r
JOIN Customers c ON c.Id = r.CustomerId
GROUP BY c.Name;

-- MISSING INDEXES the engine wished it had (treat as hints, then design one index for many queries)
SELECT TOP (20)
    migs.avg_user_impact, migs.user_seeks,
    mid.statement AS TableName, mid.equality_columns, mid.inequality_columns, mid.included_columns
FROM sys.dm_db_missing_index_group_stats migs
JOIN sys.dm_db_missing_index_groups mig ON mig.index_group_handle = migs.group_handle
JOIN sys.dm_db_missing_index_details mid ON mid.index_handle = mig.index_handle
ORDER BY migs.avg_user_impact * migs.user_seeks DESC;

-- UNUSED INDEXES that only cost writes
SELECT OBJECT_NAME(i.object_id) AS TableName, i.name,
       s.user_seeks, s.user_scans, s.user_lookups, s.user_updates
FROM sys.indexes i
LEFT JOIN sys.dm_db_index_usage_stats s
       ON s.object_id = i.object_id AND s.index_id = i.index_id AND s.database_id = DB_ID()
WHERE i.type_desc = 'NONCLUSTERED' AND OBJECTPROPERTY(i.object_id, 'IsUserTable') = 1
  AND ISNULL(s.user_seeks, 0) + ISNULL(s.user_scans, 0) + ISNULL(s.user_lookups, 0) = 0
ORDER BY s.user_updates DESC;

-- QUERY STORE: most expensive queries by total duration in the last day (SQL Server 2016+)
SELECT TOP (10) q.query_id, qt.query_sql_text,
       rs.avg_duration / 1000.0 AS avg_ms, rs.count_executions
FROM sys.query_store_query q
JOIN sys.query_store_query_text qt ON qt.query_text_id = q.query_text_id
JOIN sys.query_store_plan p ON p.query_id = q.query_id
JOIN sys.query_store_runtime_stats rs ON rs.plan_id = p.plan_id
WHERE rs.last_execution_time > DATEADD(DAY, -1, SYSUTCDATETIME())
ORDER BY rs.avg_duration * rs.count_executions DESC;` },
    { lang: 'csharp', title: 'Reviewing and fixing EF Core generated SQL', code: `using Microsoft.EntityFrameworkCore;

public sealed class OrderQueries(AppDbContext db, ILogger<OrderQueries> log)
{
    // BEFORE: three problems hidden behind friendly LINQ.
    public async Task<List<Order>> SlowAsync(int customerId, int year)
    {
        return await db.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)   // 1) one wide JOIN: order + customer columns repeat on every item row
            .Include(o => o.Customer)
            .Where(o => o.CustomerId == customerId
                     && o.OrderDate.Year == year)               // 2) translates to DATEPART(year, ...) = @p -> scan
            .ToListAsync();                                      // 3) tracks every entity, loads every column
    }

    // AFTER: open date range, split query, projection, no tracking.
    public async Task<List<OrderSummary>> FastAsync(int customerId, int year, CancellationToken ct)
    {
        var from = new DateTime(year, 1, 1);
        var to = from.AddYears(1);

        var query = db.Orders
            .AsNoTracking()
            .Where(o => o.CustomerId == customerId
                     && o.OrderDate >= from && o.OrderDate < to)  // SARGable: index seek on (CustomerId, OrderDate)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new OrderSummary(
                o.Id, o.OrderDate, o.Total,
                o.Items.Count,                                    // becomes a correlated COUNT, no row explosion
                o.Customer.Name));

        // Always look at what will run. Paste it into SSMS with the actual plan.
        log.LogDebug("SQL: {Sql}", query.ToQueryString());

        return await query.ToListAsync(ct);
    }

    // When you really need the child collections, split them into separate SELECTs
    // instead of one JOIN that multiplies rows.
    public Task<List<Order>> WithItemsAsync(int customerId, CancellationToken ct) =>
        db.Orders.AsNoTracking()
                 .Where(o => o.CustomerId == customerId)
                 .Include(o => o.Items)
                 .AsSplitQuery()
                 .ToListAsync(ct);

    // Keyset pagination in LINQ: seeks, never OFFSET.
    public Task<List<OrderSummary>> PageAsync(int afterId, int size, CancellationToken ct) =>
        db.Orders.AsNoTracking()
                 .Where(o => o.Id > afterId)
                 .OrderBy(o => o.Id)
                 .Take(size)
                 .Select(o => new OrderSummary(o.Id, o.OrderDate, o.Total, o.Items.Count, o.Customer.Name))
                 .ToListAsync(ct);

    // Bulk update without loading entities (EF Core 7+): one UPDATE statement.
    public Task<int> CloseStaleAsync(DateTime before, CancellationToken ct) =>
        db.Orders.Where(o => o.Status == "Open" && o.OrderDate < before)
                 .ExecuteUpdateAsync(s => s.SetProperty(o => o.Status, "Closed"), ct);
}

public record OrderSummary(int Id, DateTime OrderDate, decimal Total, int ItemCount, string CustomerName);

// Index to support FastAsync (PageAsync already seeks on the primary key), declared in OnModelCreating so it ships in a migration:
// modelBuilder.Entity<Order>()
//     .HasIndex(o => new { o.CustomerId, o.OrderDate })
//     .IncludeProperties(o => new { o.Total, o.Status });
// Tip: map string columns as varchar when the DB column is varchar
// (HasColumnType("varchar(200)") or .IsUnicode(false)) so parameters do not force implicit conversions.` }
  ],
  pitfalls: [
    'Wrapping the indexed column in a function (YEAR(), UPPER(), ISNULL(), CAST()). The index is ignored and the whole table is scanned. Rewrite the predicate around the raw column.',
    'Parameter type mismatch: an nvarchar parameter against a varchar column (the default for .NET strings) causes an implicit conversion on every row. Map the parameter type correctly.',
    'Creating every "missing index" the engine suggests. You end up with 15 overlapping indexes that slow writes. Design a few covering indexes that serve many queries.',
    'Using OFFSET pagination on big tables. Page 5,000 reads and discards 100,000 rows. Use keyset (seek) pagination on an indexed column.',
    'Trusting EF Core blindly. Multiple Includes can multiply rows into millions; DateTime.Year or string methods can become non-SARGable SQL. Log ToQueryString() and check the plan.',
    'Fixing a plan regression by restarting the server. It works until the bad plan is sniffed again. Find the cause with Query Store and fix the query or statistics.'
  ],
  quiz: [
    { q: 'Which WHERE clause lets the engine use an index on OrderDate?', options: ['WHERE YEAR(OrderDate) = 2026', 'WHERE CONVERT(varchar(10), OrderDate, 120) = \'2026-10-01\'', 'WHERE OrderDate >= \'20261001\' AND OrderDate < \'20261002\'', 'WHERE DATEDIFF(day, OrderDate, GETDATE()) < 30'], answer: 2, why: 'Only the open range keeps the column bare on one side of the comparison, so the index seek applies. Every function-wrapped version forces a scan.' },
    { q: 'What is a covering index?', options: ['An index that holds every column of the table, in the same order as the table', 'An index that contains all the columns a query needs, so the table is never read', 'Another name for the clustered index, because it stores the full rows', 'An index the engine creates automatically for a slow query'], answer: 1, why: 'With the filter columns in the key and the returned columns in INCLUDE, the engine answers the query entirely from the index, with no key lookups.' },
    { q: 'A stored procedure is fast for most customers but takes 30 seconds for one big customer, and fast again after a restart. What is this?', options: ['A deadlock: two sessions each wait for a lock the other one holds', 'Index fragmentation: the index pages are out of order on disk', 'Parameter sniffing: a cached plan built for a different value', 'A missing primary key'], answer: 2, why: 'The plan was compiled for the first parameter seen and cached. OPTION (RECOMPILE), OPTIMIZE FOR, or splitting the query are the fixes.' },
    { q: 'Estimated rows is 10 but actual rows is 2,000,000 on an operator. What should you suspect first?', options: ['The server is out of memory, so it cannot count rows correctly', 'Stale statistics, or a predicate the optimizer cannot estimate', 'Too many indexes, so the optimizer counts the same rows several times', 'The query uses a CTE'], answer: 1, why: 'Big estimate vs actual gaps mean the optimizer had bad information. Update statistics, and check for functions on columns or table variables with no statistics.' },
    { q: 'Why is keyset pagination faster than OFFSET on page 5,000?', options: ['It returns fewer columns, so each page is smaller on the network', 'OFFSET reads and discards every skipped row; a seek on the key does not', 'OFFSET cannot use any index, so every page is a full scan plus a sort', 'Keyset pagination caches earlier pages in memory on the server'], answer: 1, why: 'OFFSET work grows with the page number. A seek predicate on the sort key does the same amount of work for every page.' },
    { q: 'In SQL Server, when should you prefer a #temp table over a @table variable?', options: ['Never; the optimizer treats both exactly the same way', 'When it holds many rows or is joined, because temp tables have statistics', 'Only inside triggers and functions, where table variables are not allowed', 'When the data must survive after the session that created it ends'], answer: 1, why: 'Table variables have no statistics and are estimated as tiny, which leads to bad plans with many rows. Temp tables behave like real tables for the optimizer.' }
  ],
  takeaways: [
    'Read the actual plan: seeks good, scans on big tables bad, watch thick arrows, key lookups, sorts and estimated vs actual rows.',
    'Keep predicates SARGable: no functions, casts or leading wildcards on indexed columns; match parameter types to column types.',
    'Design few, covering indexes with equality columns first, then ranges, then INCLUDE the returned columns.',
    'Parameter sniffing and stale statistics explain most "fast yesterday, slow today" incidents. Query Store finds plan regressions.',
    'Paginate by keyset, update and delete in batches, name your columns, and review EF Core SQL with ToQueryString().',
    'Change one thing at a time and compare logical reads and duration before and after.'
  ],
  interview: [
    { q: 'How do you approach a slow query in production?', a: `<p>Confirm which query is actually the problem using Query Store, pg_stat_statements or APM, ordered by total duration. Capture the actual execution plan with realistic parameters. Look for scans on large tables, lookups, sorts, spills and estimate mismatches. Check SARGability and parameter types, then indexes and statistics. Make one change, measure logical reads and duration, and keep it only if it improved. Finally protect it with a load test and Query Store monitoring.</p>` },
    { q: 'What makes a predicate non-SARGable and why does it matter?', a: `<p>A predicate is non-SARGable when the indexed column is transformed before comparison: wrapped in a function, cast to another type, used in arithmetic, or compared to a pattern with a leading wildcard. The index is ordered by the raw values, so the engine cannot seek on transformed ones and must scan every row. Rewriting as a range or comparison on the bare column restores the seek.</p>` },
    { q: 'Explain parameter sniffing and three ways to handle it.', a: `<p>SQL Server compiles a parameterized plan using the first parameter values it sees and reuses that plan. If data is skewed, the cached plan is wrong for other values. Options: OPTION (RECOMPILE) for a hot query to get a fresh plan each time; OPTIMIZE FOR UNKNOWN or a representative value for a stable average plan; or restructure, such as separate code paths for small and large customers. SQL Server 2022's Parameter Sensitive Plan optimization can keep multiple plans automatically.</p>` },
    { q: 'When is a table scan the correct plan?', a: `<p>When the query needs a large fraction of the table, such as a monthly report over most rows or a count with few filters. Seeking millions of rows through a nonclustered index with lookups costs more random I/O than one sequential scan. The optimizer's tipping point is typically a small percentage of rows; above it, a scan wins. The goal is the cheapest plan for the question, not seeks everywhere.</p>` }
  ]
};

window.CONTENT['m6-angular-optimization'] = {
  hook: `Users do not care how clean your Angular code is. They care that the page shows something in under two seconds on a cheap phone on a slow network, and that scrolling never stutters.`,
  intro: `<p>Angular performance has two halves. The first is <span class="term">load performance</span>: how many bytes the browser must download and run before the user sees something useful. The second is <span class="term">runtime performance</span>: how much work Angular does every time something changes (a click, a keystroke, an HTTP response) and whether that work keeps the page at a smooth 60 frames per second.</p>
<p>For load, the levers are smaller bundles, lazy loading (downloading a feature only when the user goes there), <code>@defer</code> (loading a part of a page only when it is needed), optimized images and server-side rendering. For runtime, the levers are <span class="term">change detection</span> control (OnPush and signals, which tell Angular exactly what changed instead of checking everything), <code>track</code> in <code>@for</code>, virtual scrolling for long lists, and keeping heavy work out of templates.</p>
<p>Everything here is measurable. <span class="term">Lighthouse</span> (built into Chrome DevTools) scores load performance and tells you what to fix. The Performance tab shows exactly which code runs during a slow interaction. Measure before and after every change, just like on the backend.</p>`,
  realLife: { title: 'The menu that was a 40-page book', body: `<p>You walk into a café and ask for a coffee. The waiter hands you a 40-page book covering breakfast, lunch, dinner, the wine list and the catering options, and says "find the coffee". That is an app that ships one giant bundle. A good café hands you the one-page drinks menu now and brings the dessert menu only if you ask: lazy loading and @defer.</p>
<p>Then imagine that every time anyone in the café orders anything, the waiter re-reads every table's order to check whether yours changed. That is the old default ("eager") change detection on a big page. OnPush and signals mean the waiter only re-checks the table that actually ordered.</p>
<p>Where this shows up for real: e-commerce teams publish numbers like "100 ms faster page load = roughly 1% more conversions". Google folds Core Web Vitals (LCP, INP, CLS) into search ranking, so a slow Angular storefront literally shows up lower in results. Angular's own team built @defer, hydration and signals mostly in response to these pressures.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>First, see your bundle</h4>
<p>Run <code>ng build</code> and look at the output table: the "Initial total" is what every user downloads before the app can start. Add <code>--stats-json</code> and open the stats in a bundle analyzer (for example, esbuild's analyzer or the <code>source-map-explorer</code> package) to see which libraries take the most space. A typical surprise is a charting library or moment.js that only one screen needs but every user downloads.</p>
<h4>Lazy load routes</h4>
<p>Each major feature (admin, reports, settings) should be its own lazy route with <code>loadComponent</code> or <code>loadChildren</code>. The code for that feature is downloaded only when the user navigates there. This is the single biggest load-time win in most Angular apps and takes ten minutes to set up.</p>
<h4>@defer for parts of a page</h4>
<p>Angular's <code>@defer</code> block delays loading a piece of a template until a trigger happens: when it scrolls into view (<code>on viewport</code>), when the browser is idle (<code>on idle</code>), after a timer, on hover, or when a condition becomes true. The heavy comments section or chart at the bottom of a page should not block the top from appearing. @defer also splits that component's code into its own chunk automatically.</p>
<h4>Images</h4>
<p>Images are usually the largest bytes on a page. Use <code>NgOptimizedImage</code> (<code>ngSrc</code> instead of <code>src</code>): it enforces width and height (so the layout does not jump), lazy loads images below the fold, marks the main image as high priority, and warns you when an image is oversized. Serve modern formats (WebP or AVIF) and the right size for the screen through a CDN or image service.</p>
<h4>Measure with Lighthouse</h4>
<p>Open DevTools, Lighthouse tab, run with "Mobile" and throttling on. Look at three numbers: <strong>LCP</strong> (how long until the biggest visible element shows; aim under 2.5 s), <strong>INP</strong> (how fast the page responds to a tap or key; aim under 200 ms; a page-load run cannot tap anything, so Lighthouse shows Total Blocking Time, TBT, as its stand-in), and <strong>CLS</strong> (how much the layout shifts; aim under 0.1). The report lists the exact files and images that hurt each one.</p>
<div class="callout tip"><p>Always test a production build (<code>ng build</code> then serve the dist folder). The dev server is unminified, unoptimized and much slower, so measuring it tells you nothing about what users get.</p></div>` },
    { name: 'Intermediate', body: `<h4>Change detection: the default and the fix</h4>
<p>In apps built before Angular 22 (and in any component still set to the <code>Eager</code> strategy, which used to be called <code>Default</code>), after any browser event, HTTP response or timer, Angular walks the whole component tree and re-checks every binding in every template. On a small app this is invisible; on a page with a 500-row table it is a visible lag on every keystroke. Two tools fix it:</p>
<ul>
<li><strong>OnPush</strong>: set <code>changeDetection: ChangeDetectionStrategy.OnPush</code> on a component (from Angular 22 it is already the default) and Angular only re-checks it when an @Input reference changes, an event fires inside it, or a signal it reads changes. This forces you to treat data as immutable (replace the array, do not push into it), which is good practice anyway.</li>
<li><strong>Signals</strong>: a <code>signal()</code> holds a value, <code>computed()</code> derives from it, and templates that read signals are updated precisely when those signals change. With signals plus OnPush, a keystroke in one input re-renders one input, not the page.</li>
</ul>
<h4>track in @for</h4>
<p>Without a proper track expression, Angular cannot tell "the same product, moved" from "a new product", so on every list change it destroys and recreates all the DOM rows. <code>@for (p of products(); track p.id)</code> lets it move or update only the rows that changed. Never use <code>track $index</code> for lists that reorder or filter; use a stable id.</p>
<h4>Keep functions out of templates</h4>
<p><code>{{ total(order) }}</code> in a template runs on every change detection pass, so a 1,000-row table calls it thousands of times per keystroke. Precompute in a <code>computed()</code> signal or a pure pipe (pipes are memoized: same input, cached output). The same applies to <code>filter</code> or <code>sort</code> calls inside templates.</p>
<h4>Virtual scrolling</h4>
<p>A list of 10,000 rows creates 10,000 DOM nodes even if only 20 are on screen. <code>cdk-virtual-scroll-viewport</code> from the Angular CDK renders only the visible rows plus a small buffer and reuses them as you scroll. Memory and scroll performance stay flat no matter the list size.</p>
<h4>Debounce user input</h4>
<p>A search box that calls the API on every keystroke sends 12 requests for "optimization" and shows results out of order. Use RxJS <code>debounceTime(300)</code>, <code>distinctUntilChanged()</code> and <code>switchMap</code> (which cancels the previous request) on the input stream. Fewer requests, no stale results.</p>
<h4>Web workers for heavy CPU work</h4>
<p>Parsing a 50 MB CSV or running a big calculation on the main thread freezes the page. <code>ng generate web-worker</code> sets up a worker; post the data to it, do the work off the main thread, post the result back. The UI stays responsive.</p>
<table><thead><tr><th>Symptom</th><th>Likely cause</th><th>Fix</th></tr></thead><tbody>
<tr><td>Slow first paint, big initial bundle</td><td>No lazy routes, heavy libs in main chunk</td><td>loadComponent, @defer, analyzer</td></tr>
<tr><td>Typing lags on a big page</td><td>Eager (old default) change detection re-checking everything</td><td>OnPush + signals, functions out of templates</td></tr>
<tr><td>List flickers / slow updates</td><td>Missing or wrong track</td><td>track item.id</td></tr>
<tr><td>Scrolling a long list stutters</td><td>Thousands of DOM nodes</td><td>CDK virtual scroll</td></tr>
<tr><td>Layout jumps while loading</td><td>Images without dimensions</td><td>NgOptimizedImage with width/height</td></tr>
<tr><td>Search feels laggy / wrong results</td><td>Request per keystroke, race</td><td>debounceTime + switchMap</td></tr>
</tbody></table>` },
    { name: 'Expert', body: `<h4>SSR, hydration and the critical path</h4>
<p>With Angular SSR, the server renders the HTML for the first view so the user sees content before the JavaScript arrives. <span class="term">Hydration</span> then attaches Angular to that existing DOM instead of throwing it away and re-rendering, which removes the flash and the duplicate work. <strong>Incremental hydration</strong> (Angular 19+) combines SSR with @defer: parts of the page stay as static HTML until a trigger (viewport, interaction) hydrates them, so a long product page ships almost no JavaScript for the parts the user never touches. Event replay captures clicks that happen before hydration finishes and replays them, so the "page looks ready but ignores me" problem goes away. SSR is a win for public, content-heavy pages; for an internal dashboard behind a login it adds server cost for little benefit.</p>
<h4>Zoneless Angular</h4>
<p>Zone.js is the library that patches browser APIs so Angular knows when "something happened" and should check for changes. It costs bundle size and makes change detection coarse. With signals everywhere, Angular can run <strong>zoneless</strong> (turned on with <code>provideZonelessChangeDetection()</code> in Angular 20; from Angular 21 it is the default for new apps, so check the current docs for your version): no patching, change detection scheduled only by signal writes, markForCheck or events. Migrating requires that every piece of state the template reads is a signal or an input, and that third-party code that mutates state outside Angular notifies it explicitly.</p>
<h4>Bundle budgets and build settings</h4>
<p>In <code>angular.json</code>, budgets fail the build when the initial bundle grows past a limit (for example, warning at 500 kB, error at 1 MB). This turns bundle size into a test. The esbuild-based application builder tree-shakes well, but watch for: barrel files (<code>index.ts</code> re-exporting everything) that defeat tree-shaking, libraries without ES module builds, locale data for every language, and polyfills you no longer need. Use <code>ng build --stats-json</code> in CI and diff the sizes per pull request.</p>
<h4>Runtime profiling</h4>
<p>Angular DevTools (browser extension) has a Profiler tab that records change detection cycles and shows which components took the time and why they were checked. The Chrome Performance tab, with CPU throttling at 4x, shows long tasks (over 50 ms) that hurt INP; the flame chart tells you whether it is your code, Angular, or a third-party script. For memory, take heap snapshots before and after navigating away from a page: a growing retained size means subscriptions or event listeners are leaking (fix with <code>takeUntilDestroyed()</code>, <code>DestroyRef</code>, or the async pipe).</p>
<h4>Caching and network</h4>
<p>HTTP interceptors can cache GET responses in memory with a short TTL and dedupe identical in-flight requests. Use <code>TransferState</code> with SSR so the browser does not refetch data the server already fetched. Preload lazy routes the user is likely to visit next with <code>PreloadAllModules</code> or a custom strategy that preloads on idle. Serve the app behind a CDN with long cache headers on hashed files and a short one on index.html.</p>
<h4>Interview angle</h4>
<p>Expect: "Explain OnPush and what breaks when you turn it on" (mutated arrays stop updating; fix with immutability or signals), "What does track do in @for", "How would you render 100k rows", "SSR vs CSR trade-offs", "How do you keep the bundle from growing" (budgets, analyzer, lazy routes), and "What is INP and how do you improve it" (break long tasks, defer non-critical work, avoid heavy template functions).</p>
<div class="callout idea"><p>Set a performance budget as a team rule, not a one-time cleanup: initial bundle under X kB, LCP under 2.5 s on throttled mobile, no change detection cycle over 16 ms on the heaviest page. Check it in CI and on every release.</p></div>` }
  ],
  flow: { title: 'What happens between a URL and a usable page', steps: [
    { title: 'index.html arrives', desc: 'Tiny file. With SSR it already contains rendered HTML so the user sees content now; without SSR it is empty until JavaScript runs.' },
    { title: 'Initial bundle downloads', desc: 'main.js plus polyfills. Everything not lazy loaded is in here. Size decides how long the user waits on a slow network.' },
    { title: 'Angular boots', desc: 'The browser parses and runs the bundle, creates the root component and renders the first view (or hydrates the SSR HTML).' },
    { title: 'Deferred pieces load', desc: '@defer blocks fetch their chunks on their triggers: idle, viewport, interaction. The visible part of the page is not blocked by them.' },
    { title: 'User interacts', desc: 'A click or keystroke fires. Angular runs change detection: everything (Eager, the old default) or only what changed (OnPush + signals).' },
    { title: 'DOM updates', desc: 'With track on @for, only changed rows are touched. Virtual scroll keeps the DOM small. Pure pipes return cached values.' },
    { title: 'Navigate to a feature', desc: 'Lazy route chunk downloads on demand (or earlier via a preload strategy), then renders. Previous page subscriptions are cleaned up.' }
  ] },
  code: [
    { lang: 'typescript', title: 'Lazy routes, @defer, NgOptimizedImage and bundle budgets', code: `// app.routes.ts: every feature is its own chunk, downloaded only when visited.
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
  { path: 'products', loadChildren: () => import('./products/products.routes').then(m => m.PRODUCT_ROUTES) },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canMatch: [() => true /* replace with an auth guard */] },
];

// app.config.ts: preload lazy chunks when the browser is idle after first render.
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes, withPreloading(PreloadAllModules))],
};

// product-page.component.ts: heavy parts load only when needed.
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ReviewsComponent } from './reviews.component';
import { PriceHistoryComponent } from './price-history.component';
import { SpinnerComponent } from '../shared/spinner.component';

@Component({
  selector: 'app-product-page',
  standalone: true,
  // Reviews and PriceHistory are used only inside @defer blocks, so the compiler puts them in lazy chunks.
  imports: [NgOptimizedImage, ReviewsComponent, PriceHistoryComponent, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
    '<h1>{{ product().name }}</h1>' +
    // priority = this is the LCP image; width/height prevent layout shift.
    '<img [ngSrc]="product().imageUrl" width="800" height="600" priority alt="{{ product().name }}">' +
    '<p>{{ product().description }}</p>' +

    // Reviews are below the fold: load their chunk when they scroll into view.
    '@defer (on viewport) {' +
    '  <app-reviews [productId]="product().id" />' +
    '} @placeholder (minimum 300ms) {' +
    '  <div class="skeleton">Reviews load when you scroll here</div>' +
    '} @loading {' +
    '  <app-spinner />' +
    '}' +

    // A chart library is big: only download it when the browser is idle.
    '@defer (on idle; prefetch on idle) {' +
    '  <app-price-history [productId]="product().id" />' +
    '}',
})
export class ProductPageComponent {
  product = input.required<{ id: number; name: string; imageUrl: string; description: string }>();
}

/* angular.json: make bundle size a build failure, not a surprise.
"configurations": {
  "production": {
    "budgets": [
      { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
      { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
    ]
  }
}
Then: ng build --stats-json   and open dist/.../stats.json in a bundle analyzer. */` },
    { lang: 'typescript', title: 'Before and after: OnPush + signals, track, no functions in templates, debounced search', code: `import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs';
import { ProductApi, Product } from './product.api';

// BEFORE (typical slow version):
//  - eager (old default) change detection: every keystroke re-checks the whole table
//  - total(p) in the template runs for every row on every pass
//  - no track: list changes rebuild every <tr>
//  - API call on every keystroke, results can arrive out of order
//
// template: '<input [(ngModel)]="query" (input)="search()">' +
//           '<tr *ngFor="let p of products"><td>{{ p.name }}</td><td>{{ total(p) }}</td></tr>'

@Component({
  selector: 'app-product-table',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],   // DecimalPipe provides the "number" pipe
  changeDetection: ChangeDetectionStrategy.OnPush,
  template:
    '<input [formControl]="query" placeholder="Search products">' +
    '<p>{{ rows().length }} products, total {{ grandTotal() | number:"1.2-2" }}</p>' +
    '<table>' +
    '  @for (r of rows(); track r.id) {' +
    '    <tr><td>{{ r.name }}</td><td>{{ r.total }}</td></tr>' +
    '  } @empty {' +
    '    <tr><td colspan="2">No products match.</td></tr>' +
    '  }' +
    '</table>',
})
export class ProductTableComponent {
  private api = inject(ProductApi);

  query = new FormControl('', { nonNullable: true });

  // One request per pause in typing; switchMap cancels the previous one.
  private results = toSignal(
    this.query.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => this.api.search(q))
    ),
    { initialValue: [] as Product[] }
  );

  // Derived data is computed once per change, not once per row per check.
  rows = computed(() =>
    this.results().map(p => ({ id: p.id, name: p.name, total: p.price * p.qty }))
  );

  grandTotal = computed(() => this.rows().reduce((sum, r) => sum + r.total, 0));

  // Immutable update: replace the array so OnPush sees a new reference / signal change.
  selected = signal<number[]>([]);
  toggle(id: number) {
    this.selected.update(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  }
}` },
    { lang: 'typescript', title: 'Virtual scroll for huge lists, a web worker for heavy CPU work, and cleaning up subscriptions', code: `import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';

// 1) VIRTUAL SCROLL: 100,000 rows, about 20 DOM nodes.
@Component({
  selector: 'app-log-viewer',
  standalone: true,
  imports: [ScrollingModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: ['cdk-virtual-scroll-viewport { height: 480px; } .row { height: 32px; }'],
  template:
    '<cdk-virtual-scroll-viewport itemSize="32">' +
    '  <div class="row" *cdkVirtualFor="let line of lines(); trackBy: trackById">' +
    '    {{ line.id }} {{ line.text }}' +
    '  </div>' +
    '</cdk-virtual-scroll-viewport>',
})
export class LogViewerComponent {
  lines = signal<{ id: number; text: string }[]>([]);
  trackById = (_: number, l: { id: number }) => l.id;
}

// 2) WEB WORKER: ng generate web-worker csv-parser  ->  csv-parser.worker.ts
// --- csv-parser.worker.ts ---
// addEventListener('message', (e: MessageEvent<string>) => {
//   const rows = e.data.split('\\n').map(line => line.split(','));
//   postMessage({ count: rows.length, header: rows[0] });
// });

@Component({ selector: 'app-csv-import', standalone: true, template: '<p>{{ status() }}</p>' })
export class CsvImportComponent {
  status = signal('Idle');

  parse(file: File) {
    this.status.set('Parsing on a background thread...');
    const worker = new Worker(new URL('./csv-parser.worker', import.meta.url));
    worker.onmessage = (e: MessageEvent<{ count: number }>) => {
      this.status.set('Parsed ' + e.data.count + ' rows');   // UI never froze
      worker.terminate();
    };
    file.text().then(text => worker.postMessage(text));
  }
}

// 3) NO LEAKS: subscriptions die with the component.
@Component({ selector: 'app-clock', standalone: true, template: '<span>{{ seconds() }}</span>' })
export class ClockComponent {
  private destroyRef = inject(DestroyRef);
  seconds = signal(0);

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))   // unsubscribed automatically on destroy
      .subscribe(n => this.seconds.set(n));
  }
}

// 4) MEASURE: production build, then Lighthouse on a throttled mobile profile.
//   ng build
//   npx http-server dist/my-app/browser -p 8080
//   Chrome DevTools -> Lighthouse -> Mobile -> Analyze page load
// Angular DevTools -> Profiler: record a keystroke, read which components were checked and why.` }
  ],
  pitfalls: [
    'Measuring the dev server. It is unminified and unoptimized. Always profile a production build served as static files.',
    'Turning on OnPush and then mutating arrays in place (push, splice). The view silently stops updating. Replace the array or use signals.',
    'Using track $index on lists that reorder, filter or insert. Angular reuses the wrong DOM rows, causing flicker, wrong focus and lost input state.',
    'Calling functions or pipes with side effects in templates. They run on every change detection pass; a 1,000-row table turns a keystroke into thousands of calls.',
    'Importing a whole library for one function (all of lodash or a full chart suite in the main bundle). Import the specific function or @defer the component that needs it.',
    'Forgetting to unsubscribe. Each visit to a page adds another live subscription; memory grows and old handlers keep firing. Use takeUntilDestroyed, the async pipe or toSignal.'
  ],
  quiz: [
    { q: 'What does OnPush change detection do?', options: ['Makes Angular re-check the component after every browser event, timer and HTTP response', 'Checks the component only on a new input, an event inside it, or a signal change', 'Turns off change detection for the whole app until the page is reloaded', 'Moves rendering to a web worker'], answer: 1, why: 'OnPush skips the component unless Angular has a reason to believe it changed. That is why mutating objects in place breaks it: the reference is the same.' },
    { q: 'Why does @for need a good track expression?', options: ['So Angular can cache the list in the browser between page visits', 'So Angular can match old and new items and touch only the rows that changed', 'So Angular can sort the list by that key before it renders the rows', 'So Angular can lazy load each row only when that row scrolls into the viewport'], answer: 1, why: 'Without a stable identity, Angular cannot tell a moved item from a new one, so it destroys and recreates DOM for the whole list on each change.' },
    { q: 'Which @defer trigger loads a block only when it scrolls into view?', options: ['on idle', 'on interaction', 'on viewport', 'on hover'], answer: 2, why: 'on viewport uses an IntersectionObserver to load the block when its placeholder becomes visible. on idle loads when the browser has spare time.' },
    { q: 'A search box sends a request on every keystroke and sometimes shows results for an older query. What is the fix?', options: ['Increase the API timeout so slow responses have time to arrive in order', 'debounceTime, distinctUntilChanged and switchMap on the input stream', 'Move the HTTP calls into a web worker so they cannot overlap', 'Add OnPush so the old results are never rendered'], answer: 1, why: 'Debounce waits for a pause in typing, distinctUntilChanged skips repeats, and switchMap drops the stale in-flight request so only the latest result is shown.' },
    { q: 'What is hydration in Angular SSR?', options: ['Downloading the JavaScript bundle in the background while the page is shown', 'Attaching Angular to the server-rendered DOM instead of re-rendering it from scratch', 'Caching the server HTTP responses so the browser does not fetch them again', 'Compressing images'], answer: 1, why: 'Hydration reuses the HTML the server sent, avoiding the flash and double work of a full client re-render; incremental hydration does it per @defer block.' },
    { q: 'Which Core Web Vital measures how quickly the page responds to a tap or key press?', options: ['LCP', 'CLS', 'INP', 'TTFB'], answer: 2, why: 'INP (Interaction to Next Paint) tracks input responsiveness. Long change detection passes and heavy template functions are the common Angular causes of a bad INP.' }
  ],
  takeaways: [
    'Load: lazy routes, @defer for below-the-fold and heavy components, NgOptimizedImage, bundle budgets in CI.',
    'Runtime: OnPush plus signals so a change re-renders only what depends on it; replace arrays instead of mutating.',
    'track item.id in @for, pure pipes or computed() instead of functions in templates, virtual scroll for long lists.',
    'debounceTime + distinctUntilChanged + switchMap for search; web workers for heavy CPU work; takeUntilDestroyed for cleanup.',
    'SSR with hydration helps public content pages; incremental hydration and zoneless cut JavaScript further.',
    'Measure a production build with Lighthouse (LCP, INP, CLS) and Angular DevTools Profiler before and after every change.'
  ],
  interview: [
    { q: 'How would you speed up an Angular app whose first load takes 8 seconds?', a: `<p>Build for production and analyze the bundle to find what is in the initial chunk. Move features behind lazy routes and heavy components behind @defer. Remove or replace oversized libraries, make sure tree-shaking works (no giant barrel files), and set bundle budgets. Optimize images with NgOptimizedImage and a CDN. For a public page, add SSR with hydration so content shows before JavaScript. Verify with Lighthouse on a throttled mobile profile and keep the budget in CI.</p>` },
    { q: 'Explain the difference between default change detection, OnPush and signals.', a: `<p>Default (renamed Eager in Angular 22, where OnPush became the built-in default): after any event, Angular checks every binding in every component. OnPush: a component is checked only when an input reference changes, an event originates inside it, an observable through the async pipe emits, or a signal it reads changes. Signals: fine-grained reactive values; when a signal changes, Angular marks exactly the views that read it, which is what enables zoneless Angular. OnPush plus signals is the modern default for performance.</p>` },
    { q: 'How do you render a table with 200,000 rows without freezing the browser?', a: `<p>Never put 200,000 DOM nodes on the page. Use CDK virtual scrolling so only the visible rows exist, with a fixed row height for fast math, trackBy on a stable id, and OnPush. Page or stream the data from the API instead of loading it all. Do filtering and sorting once in a computed signal (or in a web worker for very large sets), not in the template.</p>` },
    { q: 'When would you not use server-side rendering?', a: `<p>For internal apps behind a login, dashboards with highly personalized data, or apps where the first view is mostly interactive controls rather than content. SSR adds server cost and complexity (no window on the server, hydration constraints) and the SEO and first-paint benefits are small there. For public marketing, product and content pages, SSR with hydration is usually worth it.</p>` }
  ]
};

window.CONTENT['m6-profiling-tools'] = {
  hook: `Every senior engineer has a story about the week they spent optimizing the wrong thing. A profiler would have told them in ten minutes.`,
  intro: `<p>A <span class="term">profiler</span> is a tool that watches your program run and tells you where the time and memory actually go: which functions run longest, which lines allocate most, which queries wait on locks. It replaces guessing with evidence. The first rule of performance work is "measure first", and profilers are how you measure.</p>
<p>There are different tools for different layers. For a .NET process you have the <code>dotnet-counters</code>, <code>dotnet-trace</code> and <code>dotnet-dump</code> command line tools, PerfView and the Visual Studio profiler for deep analysis, and BenchmarkDotNet for measuring small pieces of code precisely. For SQL Server you have Query Store, Extended Events and the actual execution plan. For the browser you have Chrome DevTools (Performance, Memory and Network tabs) and Lighthouse. For the whole system under load you have <span class="term">load testing</span> tools like k6, which simulate hundreds of users and report latency percentiles.</p>
<p>This lesson teaches what each tool is for, how to run it, how to read its output, and a repeatable investigation playbook you can follow the next time someone says "production is slow".</p>`,
  realLife: { title: 'The doctor who does not guess', body: `<p>You tell a doctor "I feel tired". A bad doctor guesses and prescribes vitamins. A good doctor runs a blood test (counters: is anything out of range?), then an ECG or scan on the suspicious organ (a trace: where exactly is the problem?), then treats one cause and checks the numbers again. Profiling a slow system works the same way: broad cheap signals first, then a detailed trace on the suspect, then one fix, then re-measure.</p>
<p>Where real teams use this: Stack Overflow's engineers have published many write-ups on using MiniProfiler and dotnet traces to find hot paths; Microsoft's own .NET team runs BenchmarkDotNet and PerfView continuously to catch regressions between releases. Any company with an on-call rotation keeps a "performance runbook" that is basically the playbook at the end of this lesson.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Three questions, three kinds of tools</h4>
<ul>
<li><strong>Is something wrong right now, and where?</strong> Counters and dashboards: CPU, memory, GC count, request rate, error rate, P95 latency. Cheap, always on. Tools: <code>dotnet-counters</code>, Application Insights / Grafana, Task Manager in a pinch.</li>
<li><strong>Which code is responsible?</strong> Profilers and traces: a recording of what the process did for 30 seconds, broken down by function. Tools: <code>dotnet-trace</code>, Visual Studio Profiler, PerfView, Chrome Performance tab, SQL execution plans.</li>
<li><strong>Did my fix help, and by how much?</strong> Benchmarks and load tests: run the same work before and after and compare numbers. Tools: BenchmarkDotNet, k6, Lighthouse.</li>
</ul>
<h4>Your first profiling session in five commands</h4>
<p>Install each tool once: <code>dotnet tool install -g dotnet-counters</code>, then the same command for <code>dotnet-trace</code> and <code>dotnet-dump</code> (it takes one tool at a time). Run your API, find its process id with <code>dotnet-counters ps</code>, then <code>dotnet-counters monitor -p &lt;pid&gt;</code>. You will see live numbers: CPU usage, working set, GC heap size, Gen 0/1/2 collection counts, exception count, thread pool queue length. Hit the API with some requests and watch what moves. A GC count that climbs fast means lots of allocations. A growing thread pool queue with low CPU means blocking calls.</p>
<h4>Reading a trace for the first time</h4>
<p>Run <code>dotnet-trace collect -p &lt;pid&gt; --duration 00:00:30</code> while the slow thing happens. Open the resulting .nettrace file in Visual Studio (just double-click it) or PerfView. You get a <span class="term">flame graph</span> or a call tree: wide bars are functions that took a lot of time, including everything they called. Look for the widest bar that is your own code, not the framework. That is where to start.</p>
<h4>Browser side</h4>
<p>In Chrome DevTools, the <strong>Network</strong> tab shows every file and request with size and time: sort by size to find the heavy bundle or image. The <strong>Lighthouse</strong> tab gives a score and a list of fixes. The <strong>Performance</strong> tab records a few seconds of activity and shows long tasks (red corners) that make the page feel stuck.</p>
<div class="callout tip"><p>Profile in Release mode and on realistic data. A Debug build or an empty test database will send you after problems that do not exist in production and hide the ones that do.</p></div>` },
    { name: 'Intermediate', body: `<h4>dotnet-counters: the always-available health check</h4>
<p>Key counters and what they mean: <code>cpu-usage</code> (sustained high = compute bound or spinning), <code>gc-heap-size</code> and <code>gen-2-gc-count</code> (growing heap plus frequent Gen 2 = leak or LOH churn), <code>alloc-rate</code> (bytes allocated per second; hundreds of MB/s on a modest API is a warning), <code>threadpool-queue-length</code> and <code>threadpool-thread-count</code> (queue growing while threads creep up = starvation from blocking), <code>exception-count</code> (exceptions are expensive; thousands per second is a hidden cost), and for ASP.NET Core, <code>requests-per-second</code>, <code>current-requests</code>, <code>failed-requests</code>. Use <code>--counters System.Runtime,Microsoft.AspNetCore.Hosting</code> to pick providers. These short runtime names are the ones used by apps on .NET 8 or older; for apps on .NET 9 or newer the tool shows the same runtime data under new names such as <code>dotnet.gc.collections</code>, <code>dotnet.gc.heap.total_allocated</code> and <code>dotnet.thread_pool.queue.length</code>.</p>
<h4>dotnet-trace profiles</h4>
<p><code>--profile dotnet-sampled-thread-time</code> (part of the default; older versions of the tool called it <code>cpu-sampling</code>) records what every thread is running about every millisecond: best for "why is CPU high". <code>--profile gc-verbose</code> records every GC and a sample of allocations: best for "what is allocating". You can also pass <code>--providers</code> for custom EventSource or OpenTelemetry events. Keep traces short (20-60 seconds) during the problem; long traces are huge and slow to open.</p>
<h4>dotnet-dump: memory leaks and hangs</h4>
<p><code>dotnet-dump collect -p &lt;pid&gt;</code> snapshots the whole process. Then <code>dotnet-dump analyze dump.dmp</code> gives you an SOS shell: <code>dumpheap -stat</code> lists types by total size, biggest last (the leak is usually near the bottom), <code>gcroot &lt;address&gt;</code> shows who is holding an object alive, <code>clrstack -all</code> shows what every thread is doing (a hang is often every thread waiting on the same lock). For leaks, take two dumps ten minutes apart and compare counts; the type that only grows is your suspect. <code>dotnet-gcdump</code> is a lighter alternative that captures only the heap graph.</p>
<h4>Visual Studio Profiler and PerfView</h4>
<p>Visual Studio (Debug menu, Performance Profiler) has CPU Usage, .NET Object Allocation, Memory Usage, Database (shows every EF Core/ADO.NET query with duration) and Async tools, with a friendly UI and source links. PerfView is free, ugly and the most powerful: it opens any .nettrace or ETW file, shows GC pause times per collection (GCStats view), allocation stacks, and lets you group and fold call stacks to find patterns. Learn PerfView's "By Name" and "Callers" views and you can diagnose almost anything.</p>
<h4>SQL Server tools</h4>
<p><strong>Query Store</strong>: enable it once (on by default in newer versions), then use the Top Resource Consuming Queries and Regressed Queries reports. <strong>Extended Events</strong> replaced SQL Profiler: create a session that captures <code>sql_statement_completed</code> with a duration filter (for example, over 500 ms) and read it live. SQL Profiler still works for quick looks but is deprecated and heavy. <strong>Actual execution plan</strong> for a single query, with <code>SET STATISTICS IO, TIME ON</code> to get logical reads and CPU. <strong>sys.dm_exec_requests</strong> joined to <code>sys.dm_exec_sql_text</code> to see what is running and blocking right now. For PostgreSQL: <code>pg_stat_statements</code>, <code>pg_stat_activity</code>, <code>EXPLAIN (ANALYZE, BUFFERS)</code> and <code>auto_explain</code>.</p>
<h4>Load testing with k6</h4>
<p>k6 scripts are JavaScript: define virtual users, ramp them up, hit endpoints, assert on status and latency. It reports P90/P95/P99 latency, throughput and error rate. Run it against a staging environment with production-like data while watching dotnet-counters and Query Store on the server; that combination tells you both "it gets slow at 300 users" and "because the thread pool starves on the orders query". Always set thresholds (for example, P95 under 300 ms) so a load test in CI can fail.</p>
<div class="callout warn"><p>Never run a load test against production without a plan and approval. It looks exactly like a denial-of-service attack to everyone else, and it can be one.</p></div>` },
    { name: 'Expert', body: `<h4>Production-safe profiling</h4>
<p>Sampling profilers (<code>dotnet-trace</code> with its sampling profile, continuous profilers in Datadog, Application Insights Profiler, Pyroscope) add a few percent overhead and are safe to run in production for short windows or continuously at low sample rates. Allocation tracing and <code>gc-verbose</code> are heavier; use them in staging or for a minute at a time. Full dumps freeze the process briefly and can be gigabytes; prefer <code>dotnet-gcdump</code> for leaks. In containers, run the diagnostics tools in a sidecar or use the <code>DOTNET_DiagnosticPorts</code> setting so the tools can connect from outside the pod; bake <code>dotnet-monitor</code> into the base image to expose counters, traces and dumps over an authenticated HTTP endpoint.</p>
<h4>OpenTelemetry as the glue</h4>
<p>Counters tell you something is slow; traces tell you where in the code; but across services you need <strong>distributed tracing</strong>. ASP.NET Core, HttpClient, EF Core and SqlClient emit Activity spans that OpenTelemetry exports to Jaeger, Tempo, Application Insights or any OTLP backend. A single request shows as a waterfall: 2 ms in the gateway, 180 ms waiting on the orders service, which spent 170 ms in one SQL query. That one picture ends most "whose fault is it" arguments. Add custom spans around business steps and tag them with ids you can search on.</p>
<h4>Benchmark discipline</h4>
<p>BenchmarkDotNet handles warm-up, outlier removal and statistics, but you still own the design: isolate the thing you measure, avoid dead-code elimination (return or consume results), use <code>[MemoryDiagnoser]</code> and look at allocations before time, and compare against a baseline. Keep micro-benchmarks for library-level choices; for an API, the truth is a load test with realistic data because caches, connection pools and GC behave differently under concurrency. Watch out for measurement noise: run on a quiet machine, pin versions, and treat differences under about 5% as noise unless repeated.</p>
<h4>Finding the needle: a few expert patterns</h4>
<ul>
<li><strong>High CPU, flat throughput</strong>: sampling trace; look for regex without compiled/NonBacktracking, JSON of huge objects, LINQ in loops, or lock contention showing as spinning in <code>Monitor.Enter</code>.</li>
<li><strong>Latency spikes every few minutes</strong>: PerfView GCStats; Gen 2 or LOH compaction pauses. Fix allocations, consider Server GC settings or <code>GCConserveMemory</code>.</li>
<li><strong>Slow only under load</strong>: thread pool starvation (queue length), connection pool exhaustion (SqlClient "timeout expired, pool max reached"), or a lock. Dump during the incident and run <code>clrstack -all</code>.</li>
<li><strong>Memory grows forever</strong>: two gcdumps, diff by type; typical roots are static caches without eviction, event handlers never removed, HttpClient instances created per request, or IMemoryCache without size limits.</li>
<li><strong>Database is fine, API is fine, users complain</strong>: the browser. Chrome Performance with 4x CPU throttling, long tasks, oversized bundles, layout thrash from reading and writing the DOM in a loop.</li>
</ul>
<h4>Interview angle</h4>
<p>Expect: "Walk me through diagnosing a slow endpoint" (the playbook below), "How do you find a memory leak in a .NET service" (dumps or gcdumps over time, dumpheap -stat, gcroot), "What is the difference between sampling and instrumenting profilers" (sampling peeks periodically with low overhead; instrumenting hooks every call with exact counts but heavy overhead), and "How do you make sure a performance fix does not regress" (benchmark or load test with thresholds in CI, Query Store alerts, dashboards with SLOs).</p>
<div class="callout idea"><p>Write down every investigation: symptom, what the counters showed, what the trace showed, the fix, the before/after numbers. After a year that document is your team's most valuable runbook.</p></div>` }
  ],
  flow: { title: 'The performance investigation playbook', steps: [
    { title: 'Define "slow"', desc: 'Which endpoint or page, for which users, since when, and what number would count as fixed (for example P95 under 300 ms). No target, no finish line.' },
    { title: 'Reproduce safely', desc: 'Recreate it in staging with production-like data and a load test, or capture it in production with low-overhead tools during the real event.' },
    { title: 'Read the cheap signals', desc: 'dotnet-counters, APM dashboards, Query Store. CPU? GC? Thread pool queue? One slow query? Pick the layer before you dig.' },
    { title: 'Trace the suspect layer', desc: 'dotnet-trace or Visual Studio for code, actual execution plan for SQL, Chrome Performance for the browser. Find the widest bar that is yours.' },
    { title: 'Form one hypothesis', desc: '"The orders query scans because of the YEAR() predicate" or "the export allocates 2 GB of strings". Specific enough to be wrong.' },
    { title: 'Change one thing', desc: 'One query rewrite, one index, one pooled buffer, one lazy route. Not five changes at once.' },
    { title: 'Measure again', desc: 'Same benchmark or load test as before. Keep the change only if the target number moved. Record before and after.' },
    { title: 'Guard against regression', desc: 'Add a threshold to CI, a Query Store or dashboard alert, and a note in the runbook. Then go back to step 3 for the next biggest cost.' }
  ] },
  code: [
    { lang: 'bash', title: '.NET diagnostics from the command line: counters, trace, dump, gcdump', code: `# One-time install of the diagnostic tools (the command takes one tool at a time)
dotnet tool install -g dotnet-counters
dotnet tool install -g dotnet-trace
dotnet tool install -g dotnet-dump
dotnet tool install -g dotnet-gcdump

# Find the process
dotnet-counters ps

# 1) Live health: CPU, GC, thread pool, ASP.NET Core request counters (refresh every second)
dotnet-counters monitor -p 12345 --refresh-interval 1 \
  --counters System.Runtime,Microsoft.AspNetCore.Hosting,Microsoft.AspNetCore.Http.Connections
# Watch for: gen-2-gc-count climbing, alloc-rate in the hundreds of MB/s,
#            threadpool-queue-length > 0 while cpu-usage is low (starvation)
# (.NET 9+ apps show these as dotnet.gc.collections, dotnet.gc.heap.total_allocated,
#  dotnet.thread_pool.queue.length and dotnet.process.cpu.time)

# Save counters to a file during a load test for later comparison
dotnet-counters collect -p 12345 --format csv -o counters-before.csv --duration 00:02:00

# 2) Where does the CPU go? 30-second sampling trace, then open the .nettrace in
#    Visual Studio (double-click) or PerfView. Also converts to speedscope for a browser flame graph.
#    (Older versions of the tool named this profile cpu-sampling.)
dotnet-trace collect -p 12345 --duration 00:00:30 --profile dotnet-sampled-thread-time,dotnet-common -o cpu.nettrace
dotnet-trace convert cpu.nettrace --format speedscope     # open at speedscope.app (offline tool)

# 3) What is allocating? Heavier; keep it short and prefer staging.
dotnet-trace collect -p 12345 --duration 00:00:20 --profile gc-verbose -o alloc.nettrace

# 4) Memory leak: two lightweight heap snapshots ten minutes apart, compare by type
dotnet-gcdump collect -p 12345 -o heap1.gcdump
sleep 600
dotnet-gcdump collect -p 12345 -o heap2.gcdump
# Open both in Visual Studio -> Diagnostic Tools, or PerfView, and diff.

# 5) Hang or full investigation: complete dump, then analyze
dotnet-dump collect -p 12345 -o hang.dmp
dotnet-dump analyze hang.dmp
#   > dumpheap -stat            # types sorted by total size (leak suspects at the bottom)
#   > dumpheap -mt <MethodTable> # instances of one type
#   > gcroot <address>          # who keeps this object alive
#   > clrstack -all             # every thread's stack: are they all waiting on one lock?
#   > syncblk                   # which locks are held and by whom
#   > threadpool                # queue length and thread counts at the moment of the dump

# 6) In Docker / Kubernetes: let tools connect from a sidecar via a diagnostic port
#   ENV DOTNET_DiagnosticPorts=/diag/app.sock,nosuspend
#   (nosuspend lets the app start normally; plain "suspend" makes it wait until a tool connects)
# or run dotnet-monitor as a sidecar to expose /metrics, /trace, /dump over HTTP.` },
    { lang: 'sql', title: 'SQL Server: find what is slow or blocking right now, and set up a lightweight Extended Events session', code: `-- What is running right now, how long, and who is blocking whom
SELECT r.session_id, r.blocking_session_id, r.status, r.wait_type, r.wait_time,
       r.cpu_time, r.total_elapsed_time, r.logical_reads,
       SUBSTRING(t.text, (r.statement_start_offset / 2) + 1,
         ((CASE r.statement_end_offset WHEN -1 THEN DATALENGTH(t.text)
           ELSE r.statement_end_offset END - r.statement_start_offset) / 2) + 1) AS running_statement
FROM sys.dm_exec_requests r
CROSS APPLY sys.dm_exec_sql_text(r.sql_handle) t
WHERE r.session_id > 50 AND r.session_id <> @@SPID
ORDER BY r.total_elapsed_time DESC;

-- Who is blocked and by whom. The head blocker is the blocking_session_id
-- that does not itself appear as a blocked session_id in this list.
SELECT session_id, blocking_session_id, wait_type, wait_resource
FROM sys.dm_exec_requests
WHERE blocking_session_id <> 0;

-- Top queries by total CPU from the plan cache (cheap, no Query Store needed)
SELECT TOP (20)
    qs.total_worker_time / 1000 AS total_cpu_ms,
    qs.execution_count,
    qs.total_logical_reads,
    (qs.total_elapsed_time / qs.execution_count) / 1000 AS avg_ms,
    SUBSTRING(t.text, 1, 200) AS query_text
FROM sys.dm_exec_query_stats qs
CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) t
ORDER BY qs.total_worker_time DESC;

-- Lightweight Extended Events session: capture statements slower than 500 ms
-- (the modern replacement for SQL Profiler)
CREATE EVENT SESSION SlowQueries ON SERVER
ADD EVENT sqlserver.sql_statement_completed (
    ACTION (sqlserver.sql_text, sqlserver.client_app_name, sqlserver.database_name)
    WHERE duration > 500000      -- microseconds
)
ADD TARGET package0.event_file (SET filename = N'SlowQueries.xel', max_file_size = 50)
WITH (MAX_MEMORY = 4096 KB, EVENT_RETENTION_MODE = ALLOW_SINGLE_EVENT_LOSS, STARTUP_STATE = ON);
ALTER EVENT SESSION SlowQueries ON SERVER STATE = START;

-- Read the captured events
SELECT
    e.value('(@timestamp)[1]', 'datetime2') AS at_utc,
    e.value('(data[@name="duration"]/value)[1]', 'bigint') / 1000 AS duration_ms,
    e.value('(action[@name="sql_text"]/value)[1]', 'nvarchar(max)') AS sql_text
FROM (SELECT CAST(event_data AS XML) AS x
      FROM sys.fn_xe_file_target_read_file('SlowQueries*.xel', NULL, NULL, NULL)) f
CROSS APPLY f.x.nodes('/event') n(e)
ORDER BY at_utc DESC;

-- Query Store: enable once, then use the built-in reports in SSMS
ALTER DATABASE CURRENT SET QUERY_STORE = ON
    (OPERATION_MODE = READ_WRITE, QUERY_CAPTURE_MODE = AUTO, MAX_STORAGE_SIZE_MB = 1024);

-- Measure a single query precisely (run with Include Actual Execution Plan)
SET STATISTICS IO ON; SET STATISTICS TIME ON;
SELECT Id, OrderDate, Total FROM Orders WHERE CustomerId = 42 ORDER BY OrderDate DESC;
SET STATISTICS IO OFF; SET STATISTICS TIME OFF;
-- Compare "logical reads" and "CPU time" before and after any change.` },
    { lang: 'typescript', title: 'k6 load test with thresholds that can fail CI, plus how to read it with the server tools', code: `// load-test.js  (run with: k6 run load-test.js)
// k6 scripts are plain JavaScript executed by the k6 binary.
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Ramp to 200 virtual users, hold, ramp down. Shape matters: find the knee.
  stages: [
    { duration: '1m', target: 50 },
    { duration: '2m', target: 200 },
    { duration: '3m', target: 200 },
    { duration: '1m', target: 0 },
  ],
  // Thresholds make the run pass or fail, so this can gate a release pipeline.
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<800'],   // ms
    http_req_failed: ['rate<0.01'],                   // under 1% errors
    'http_req_duration{name:orders}': ['p(95)<400'],
  },
};

const BASE = __ENV.BASE_URL || 'https://staging.example.com';
const TOKEN = __ENV.TOKEN;

export default function () {
  const headers = { Authorization: 'Bearer ' + TOKEN };
  const customerId = Math.floor(Math.random() * 10000) + 1;

  const list = http.get(BASE + '/api/orders?customerId=' + customerId + '&size=20',
    { headers: headers, tags: { name: 'orders' } });
  check(list, { 'orders 200': r => r.status === 200 });

  if (list.status === 200 && list.json().length > 0) {
    const id = list.json()[0].id;
    const one = http.get(BASE + '/api/orders/' + id, { headers: headers, tags: { name: 'order' } });
    check(one, { 'order 200': r => r.status === 200 });
  }

  sleep(1);   // think time: real users pause between clicks
}

/* How to use the result:
   1. k6 prints avg, p(90), p(95), request rate and error rate, plus the measured
      value for every threshold (so p(99) and the tagged orders endpoint show up too).
   2. While it runs, watch the server:  dotnet-counters monitor -p <pid>
      - queue length rising + low CPU  -> blocking / sync-over-async
      - gen-2 GC climbing              -> allocation problem, take a gc-verbose trace
      - CPU pinned at 100%             -> sampling trace (dotnet-trace), find the hot method
   3. And the database: Query Store "Top Resource Consumers" for the same window.
   4. Fix one thing, re-run the identical script, compare the percentiles.

   Browser side, measure the same release:
     ng build && npx http-server dist/app/browser
     npx lighthouse http://localhost:8080 --preset=perf --form-factor=mobile --view
   Lighthouse reports LCP, INP (lab proxy: TBT), CLS and the files responsible. */` }
  ],
  pitfalls: [
    'Profiling a Debug build or the dev server. The numbers are meaningless; always measure a Release/production build with realistic data.',
    'Trusting averages. A 50 ms average can hide a 5 second P99 that 1% of users hit on every request. Report P95 and P99.',
    'Capturing minute-long allocation traces or full dumps on a busy production box. They can stall the process and fill the disk; use sampling, gcdump, and short windows.',
    'Changing five things, seeing improvement, and not knowing which one mattered. One change per measurement.',
    'Running load tests without thresholds. A green run that proves nothing. Define P95 and error-rate limits so the test can fail.',
    'Fixing what the profiler shows at the top without asking whether it is on the user-facing path. A slow nightly job is not the cause of slow checkout.'
  ],
  quiz: [
    { q: 'Which tool gives you live GC, CPU and thread pool numbers for a running .NET process with almost no overhead?', options: ['dotnet-dump', 'dotnet-counters', 'BenchmarkDotNet', 'k6'], answer: 1, why: 'dotnet-counters reads EventCounters from the runtime and prints them live. It is the cheap first look before any trace.' },
    { q: 'You suspect a memory leak in a service that grows 100 MB per hour. Best first step?', options: ['Restart it every hour with a scheduled job so memory never builds up', 'Take two gcdumps some time apart and compare object counts by type', 'Run a k6 load test and compare P95 latency before and after', 'Switch to Workstation GC'], answer: 1, why: 'Comparing heap snapshots shows which type keeps growing; gcroot then shows what holds those objects alive. Restarting hides the bug instead of finding it.' },
    { q: 'What is the difference between a sampling and an instrumenting profiler?', options: ['Sampling only works in Debug builds; instrumenting works in Release builds too', 'Sampling peeks at thread stacks now and then; instrumenting hooks every call', 'Instrumenting adds no overhead, so it is the safer choice for production', 'There is no difference'], answer: 1, why: 'Sampling (dotnet-trace, PerfView) is safe in production; instrumenting profilers change timing so much they are mainly for development.' },
    { q: 'Which SQL Server feature replaced SQL Profiler for capturing slow statements with low overhead?', options: ['Database Tuning Advisor', 'Extended Events', 'SQL Agent', 'Maintenance Plans'], answer: 1, why: 'Extended Events sessions capture events like sql_statement_completed with filters and minimal overhead; Profiler is deprecated and heavy.' },
    { q: 'Why should a load test define thresholds like p(95)<300?', options: ['k6 refuses to start any test that has no thresholds defined in options', 'So the run can pass or fail and block a release that got slower', 'So k6 can skip the slow requests and make the test run faster', 'Because thresholds lower the load that k6 puts on the server'], answer: 1, why: 'Without thresholds a load test is just a report nobody reads. With them it becomes an automated gate like a unit test.' },
    { q: 'The API shows low CPU, a rising thread pool queue, and P95 latency climbing during a load test. Which trace or view confirms the cause?', options: ['A gc-verbose allocation trace showing which types are allocated most', 'A dump with clrstack -all showing threads blocked in .Result / Wait or sync I/O', 'A Lighthouse report showing long tasks on the main thread of the page', 'The Query Store Regressed Queries report for the last hour'], answer: 1, why: 'Thread pool starvation shows up as many threads blocked on synchronous waits. The stacks in a dump name the exact call to make async.' }
  ],
  takeaways: [
    'Measure first: counters for "is something wrong", traces for "which code", benchmarks and load tests for "did the fix help".',
    'dotnet-counters, dotnet-trace, dotnet-dump and dotnet-gcdump cover live health, CPU and allocation hot spots, hangs and leaks.',
    'Visual Studio Profiler for a friendly UI; PerfView for deep GC and allocation analysis; BenchmarkDotNet for precise micro-measurements in Release.',
    'SQL: Query Store, Extended Events, dm_exec_requests and the actual execution plan with STATISTICS IO. PostgreSQL: pg_stat_statements and EXPLAIN ANALYZE.',
    'Browser: Chrome Performance tab for long tasks, Network tab for heavy files, Lighthouse for LCP/INP/CLS on a production build.',
    'Follow the playbook: define slow, reproduce, cheap signals, trace, one hypothesis, one change, re-measure, guard with thresholds.'
  ],
  interview: [
    { q: 'Walk me through how you would diagnose an endpoint whose P95 went from 100 ms to 2 s after a release.', a: `<p>First confirm scope with dashboards: which endpoint, all users or some, exactly when it started. Compare the release diff for touched code and queries. Check dotnet-counters or APM for CPU, GC, thread pool queue and error rate. Check Query Store for regressed queries in the same window; a changed query or a new plan is the most common cause. If the database is clean, capture a sampling trace with dotnet-trace during the slowness and find the hottest path in our code. Form one hypothesis, apply one fix, and compare P95 with the same load test. Then add a threshold or alert so it cannot silently return.</p>` },
    { q: 'How do you find a memory leak in a long-running .NET service?', a: `<p>Confirm it with gc-heap-size growing across Gen 2 collections rather than just working set. Take a gcdump (or full dump) at two points in time and compare dumpheap -stat by type; the type whose count only grows is the suspect. Use gcroot on an instance to see the chain keeping it alive. Typical culprits are static caches without eviction, event handlers never unsubscribed, captured closures in long-lived timers, and unbounded IMemoryCache. Fix, redeploy, and watch the heap flatten over the same period.</p>` },
    { q: 'When would you use BenchmarkDotNet versus a load test?', a: `<p>BenchmarkDotNet for small, isolated pieces of code where you compare implementations: a parser, a serializer choice, a LINQ versus loop decision. It gives precise timing and allocation numbers in Release with proper warm-up. A load test (k6, NBomber) for the whole service under concurrency, where connection pools, caches, GC and the database interact; it reports latency percentiles and throughput at a given user count. Micro-benchmarks guide code decisions; load tests decide whether the release is good.</p>` },
    { q: 'What would you put on a performance dashboard for an ASP.NET Core API?', a: `<p>Request rate, error rate and latency P50/P95/P99 per endpoint; CPU and memory per instance; GC counts by generation and GC pause time; thread pool queue length and thread count; database query duration P95 and connection pool usage; cache hit ratio; and external dependency latency. Add SLO lines (for example P95 under 300 ms) and alerts on sustained breaches, not single spikes.</p>` }
  ]
};
