// DevPath content: Module 6 — Operating Systems (m6-processes-threads … m6-linux). See SPEC.md.
window.CONTENT = window.CONTENT || {};

window.CONTENT['m6-processes-threads'] = {
  hook: `Your laptop runs hundreds of programs at once on only a handful of CPU cores. The trick is a very fast game of musical chairs, and this lesson shows you the rules.`,
  intro: `<p>A <span class="term">process</span> is a program that is running. The file on disk (say, <code>MyApp.exe</code>) is just a recipe. When you start it, the operating system (OS) copies the recipe into memory, gives it its own private space, and starts cooking. That running copy is the process.</p>
<p>Inside a process, the actual work is done by one or more <span class="term">threads</span>. A thread is the smallest thing the CPU can run: a single line of execution that walks through your code one instruction at a time. Every process starts with one thread (the main thread) and can create more.</p>
<p>Your CPU has a fixed number of cores, maybe 4 or 8. But you have hundreds of threads waiting for a turn. The OS switches between them so quickly (thousands of times a second) that it looks like everything runs at the same time. This switching is the heart of the operating system, and it is why your .NET app can serve many web requests at once.</p>`,
  realLife: { title: 'A restaurant kitchen', body: `<p>Think of a restaurant. Each <strong>restaurant</strong> is a process: it has its own kitchen, its own fridge, its own ingredients. One restaurant cannot reach into another restaurant's fridge. That is memory isolation.</p>
<p>Inside one restaurant, the <strong>cooks</strong> are threads. They all share the same kitchen and fridge. Two cooks can work on two dishes at once, which is fast, but if both grab the same pan at the same moment, there is trouble. That is why threads need coordination (the next lessons cover locks).</p>
<p>Where you see this at work: an ASP.NET Core server is one process (one restaurant). Each incoming HTTP request is cooked by a thread from the thread pool (a cook from a shared pool of cooks). Microsoft's IIS runs each website in its own worker process so that one crashing site does not take down the others.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Program vs process</h4>
<p>A <strong>program</strong> is a file sitting on disk. It does nothing by itself. A <strong>process</strong> is that program after you double-click it: now it has memory, a place in the CPU queue, and an id number (the PID you see in Task Manager). Open Notepad three times and you get three processes from one program.</p>
<h4>What a process owns</h4>
<ul>
<li><strong>Its own memory</strong>: code, data, a heap and one stack per thread. Another process cannot read it. This is why a crash in Chrome does not corrupt Excel.</li>
<li><strong>Open files and network sockets</strong>: handles the OS gave it.</li>
<li><strong>At least one thread</strong>: the thing that actually runs instructions.</li>
</ul>
<p>The OS keeps a little record card for each process called the <span class="term">Process Control Block (PCB)</span>. It stores the PID, the state (running, waiting, ready), where the process was when it was paused, which files it has open, and its priority. When the OS pauses a process and later resumes it, it reads this card to pick up exactly where it left off.</p>
<h4>Process states</h4>
<p>A process is always in one of a few states: <strong>New</strong> (being created), <strong>Ready</strong> (wants the CPU, waiting in line), <strong>Running</strong> (on a CPU core right now), <strong>Waiting</strong> (blocked, for example waiting for a file read or a network reply), and <strong>Terminated</strong> (finished). Most of the time most processes are Waiting: they are asleep until something happens.</p>
<h4>Threads: workers inside a process</h4>
<p>A thread is one path of execution. If a process is a restaurant, threads are the cooks. All threads in a process share the same memory (the same kitchen) but each has its own stack (its own notepad of what it is doing right now). Creating a thread is cheap compared to creating a process, and threads can talk to each other by simply reading the same variables.</p>
<div class="callout tip"><p>Simple rule: <strong>processes isolate, threads share</strong>. Use processes when you want safety between unrelated programs. Use threads when parts of the same program need to work together.</p></div>
<h4>Why this matters to a .NET developer</h4>
<p>When you write <code>Task.Run(...)</code> or handle a web request, you are using threads from the .NET thread pool. Understanding that these are real OS threads, that there are only so many cores, and that a blocked thread is a wasted cook, is the base for every performance conversation you will have.</p>` },
    { name: 'Intermediate', body: `<h4>The context switch</h4>
<p>When the OS moves a core from thread A to thread B it performs a <span class="term">context switch</span>: it saves A's registers, program counter and stack pointer into A's record, loads B's values, and jumps to B's next instruction. This takes a few microseconds, but it also throws away the CPU caches that A had warmed up, so the real cost is higher. Switch too often and the CPU spends its time swapping instead of working.</p>
<h4>User mode vs kernel mode</h4>
<p>The CPU has two privilege levels. Your code runs in <strong>user mode</strong> and cannot touch hardware or other processes' memory directly. The OS kernel runs in <strong>kernel mode</strong> and can do anything. When your program needs something only the kernel can do (read a file, open a socket, create a thread), it makes a <span class="term">system call</span>. The CPU switches to kernel mode, the kernel does the work, then switches back. Every <code>File.ReadAllText</code> in C# ends in a system call like <code>read()</code> on Linux or <code>ReadFile</code> on Windows.</p>
<h4>How .NET maps onto OS threads</h4>
<ul>
<li><code>new Thread(...)</code> creates a real OS thread. Each one reserves about 1 MB of stack by default, so thousands of them is a bad idea.</li>
<li>The <strong>thread pool</strong> keeps a set of ready OS threads. <code>Task.Run</code>, <code>async</code> continuations and ASP.NET Core requests all borrow pool threads for short bursts and return them.</li>
<li><code>await</code> on I/O does <em>not</em> hold a thread. The thread goes back to the pool while the OS waits for the disk or network, and a (possibly different) pool thread resumes your method when the data arrives. This is how one server handles thousands of connections with a few dozen threads.</li>
</ul>
<h4>Process creation</h4>
<p>On Windows, <code>CreateProcess</code> builds a new process from an executable. On Linux, <code>fork()</code> clones the current process and <code>exec()</code> replaces its program. From C#, <code>Process.Start</code> hides both. Child processes get their own memory, so they cannot share variables with you; you talk to them through standard input/output, files, pipes or sockets. This is called <span class="term">inter-process communication (IPC)</span>.</p>
<div class="callout warn"><p>A common mistake: starting a child process with <code>Process.Start</code> and reading its output only after it exits. If the child prints a lot, its output buffer fills, it blocks, and both of you wait forever. Read the output asynchronously while it runs.</p></div>
<h4>Thread-safety in one sentence</h4>
<p>Because threads share memory, two threads changing the same variable at the same time can corrupt it. The concurrency lesson (m6-concurrency) covers locks; for now, remember that sharing is powerful and dangerous.</p>` },
    { name: 'Expert', body: `<h4>Thread pool internals in .NET</h4>
<p>The pool has a global queue plus a local work-stealing queue per worker thread. Work queued from a pool thread goes to its local queue (LIFO for cache locality); idle workers steal from others (FIFO) to balance load. A hill-climbing algorithm adjusts the number of threads by measuring throughput, and a starvation detector injects threads when queued work is not completing. Blocking pool threads (<code>.Result</code>, <code>.Wait()</code>, <code>Thread.Sleep</code>) fights this algorithm: it adds threads slowly (about one or two per second), so a burst of blocking calls causes <strong>thread pool starvation</strong>, the classic cause of a .NET service that suddenly stops responding under load.</p>
<h4>Kernel scheduling entities</h4>
<p>On Linux, threads and processes are both "tasks" created with <code>clone()</code>; the flags decide what is shared (memory, file table, signal handlers). A thread is a task that shares everything with its parent. Windows separates the two concepts explicitly: a process is a container for resources, a thread is the schedulable unit. Both OSes schedule threads, not processes.</p>
<h4>Costs you should know by heart</h4>
<table><thead><tr><th>Operation</th><th>Rough cost</th><th>Why</th></tr></thead><tbody>
<tr><td>Function call</td><td>nanoseconds</td><td>stays in user mode</td></tr>
<tr><td>System call</td><td>~100 ns to 1 µs</td><td>mode switch, kernel work</td></tr>
<tr><td>Thread context switch</td><td>~1 to 5 µs plus cache misses</td><td>save/restore state, cold caches</td></tr>
<tr><td>Create a thread</td><td>tens of µs plus 1 MB stack reserve</td><td>kernel object plus memory</td></tr>
<tr><td>Create a process</td><td>milliseconds</td><td>new address space, loader, runtime init</td></tr>
</tbody></table>
<h4>Isolation as a design tool</h4>
<p>Processes are the OS's strongest safety boundary, which is why browsers put each tab in its own process and why Kubernetes uses containers (process trees with namespaces and cgroups). In .NET, <code>AssemblyLoadContext</code> gives weak isolation inside one process; if you need a plugin that can crash without killing you, run it as a separate process and talk over named pipes or gRPC.</p>
<h4>Failure modes to recognize</h4>
<ul>
<li><strong>Zombie processes</strong> (Linux): a child exited but the parent never read its exit code; the PCB lingers. Always wait for children.</li>
<li><strong>Handle leaks</strong>: forgetting to dispose <code>Process</code> or file handles exhausts the per-process handle table.</li>
<li><strong>Too many threads</strong>: memory is fine but context switching dominates; throughput drops as you add threads. Measure with <code>dotnet-counters</code> (ThreadPool Thread Count, Queue Length).</li>
</ul>
<div class="callout idea"><p>Interview angle: "Why is async better than one thread per request?" Answer with numbers: a waiting thread costs 1 MB of stack and a context switch per wake-up; an awaiting task costs a few hundred bytes of heap and no thread at all.</p></div>` }
  ],
  flow: { title: 'What happens when you run dotnet MyApp.dll', steps: [
    { title: 'Load', desc: 'The OS creates a new process: a fresh address space, a PCB record, a PID, and loads the .NET host into it.' },
    { title: 'Main thread', desc: 'One thread is created and starts running the runtime, which JIT-compiles and calls your Main method.' },
    { title: 'Ready queue', desc: 'The thread is marked Ready and placed in the scheduler queue, waiting for a free CPU core.' },
    { title: 'Running', desc: 'The scheduler picks it; the core loads its registers and executes instructions in user mode.' },
    { title: 'System call', desc: 'Your code calls File.ReadAllText. The CPU switches to kernel mode and the kernel asks the disk for data.' },
    { title: 'Waiting', desc: 'The disk is slow, so the thread is marked Waiting and the core is given to another thread (a context switch).' },
    { title: 'Wake up', desc: 'Data arrives, the thread moves back to Ready, gets a core again, and continues right after the call.' },
    { title: 'Exit', desc: 'Main returns, the runtime shuts down, the OS frees memory and handles, and the PID is released.' }
  ] },
  code: [
    { lang: 'csharp', title: 'Processes: start a child, read its output, inspect yourself', code: `using System.Diagnostics;

// --- Who am I? ---
var me = Process.GetCurrentProcess();
Console.WriteLine("PID " + me.Id + ", threads: " + me.Threads.Count
    + ", working set: " + me.WorkingSet64 / (1024 * 1024) + " MB");

// --- Start a child process and read its output WHILE it runs ---
var psi = new ProcessStartInfo
{
    FileName = "dotnet",
    Arguments = "--list-runtimes",
    RedirectStandardOutput = true,   // we want to read what it prints
    RedirectStandardError = true,
    UseShellExecute = false,         // required for redirection
    CreateNoWindow = true
};

using var child = Process.Start(psi)!;

// Reading asynchronously avoids the classic deadlock where the child's
// output buffer fills up and it blocks before we ever call WaitForExit.
var stdoutTask = child.StandardOutput.ReadToEndAsync();
var stderrTask = child.StandardError.ReadToEndAsync();

await child.WaitForExitAsync();
Console.WriteLine("Child exited with code " + child.ExitCode);
Console.WriteLine(await stdoutTask);

// --- List other processes (like a tiny Task Manager) ---
foreach (var p in Process.GetProcesses().OrderByDescending(p => p.WorkingSet64).Take(5))
{
    try { Console.WriteLine(p.ProcessName + " " + p.WorkingSet64 / (1024 * 1024) + " MB"); }
    catch (Exception) { /* some system processes refuse access */ }
}` },
    { lang: 'csharp', title: 'Threads vs thread pool vs async: see the difference', code: `using System.Diagnostics;

// 1. A raw OS thread: you own it, it has its own 1 MB stack.
var worker = new Thread(() =>
{
    Console.WriteLine("Raw thread id " + Environment.CurrentManagedThreadId
        + ", background=" + Thread.CurrentThread.IsBackground);
});
worker.IsBackground = true;   // do not keep the process alive for this thread
worker.Start();
worker.Join();                // wait for it to finish

// 2. Thread pool: borrow a ready thread for a short CPU job.
ThreadPool.GetMinThreads(out int minWorkers, out int minIo);
Console.WriteLine("Pool min worker threads = " + minWorkers + " (usually = CPU cores: "
    + Environment.ProcessorCount + ")");

var cpuJobs = Enumerable.Range(1, 4).Select(i => Task.Run(() =>
{
    long sum = 0;
    for (int k = 0; k < 50_000_000; k++) sum += k % 7;
    return "job " + i + " on pool thread " + Environment.CurrentManagedThreadId;
}));
foreach (var line in await Task.WhenAll(cpuJobs)) Console.WriteLine(line);

// 3. Async I/O: NO thread is held while we wait.
var sw = Stopwatch.StartNew();
Console.WriteLine("Before await on thread " + Environment.CurrentManagedThreadId);
await Task.Delay(500);        // models a disk or network wait; the thread goes back to the pool
Console.WriteLine("After  await on thread " + Environment.CurrentManagedThreadId
    + " (may differ), waited " + sw.ElapsedMilliseconds + " ms");

// 4. The anti-pattern: blocking a pool thread. Never do this in a server.
// var result = SomeAsyncMethod().Result;   // holds a thread, risks starvation and deadlock` }
  ],
  pitfalls: [
    'Creating a new Thread per task. Threads cost ~1 MB of stack each and context switches; use the thread pool (Task.Run) or async instead.',
    'Blocking inside async code with .Result or .Wait(). It ties up a pool thread and can starve the whole server.',
    'Assuming two processes can share a static variable. They cannot; each process has private memory. Use a database, a file, a pipe or a queue.',
    'Reading a child process’s output only after WaitForExit. If the child prints more than the buffer size, both sides deadlock.',
    'Forgetting that the main thread exiting ends the process. Foreground threads keep it alive; background threads are killed.',
    'Thinking more threads always means more speed. Past the number of cores, CPU-bound work gets slower because of switching.'
  ],
  quiz: [
    { q: 'What is the difference between a program and a process?', options: ['They are the same thing; both words mean the running copy in memory', 'A program is a file on disk; a process is that program running with its own memory','A process is the file on disk; a program is the running copy with its own memory', 'A program is the source code; a process is the same code after it is compiled'], answer: 1, why: 'The program is the recipe on disk. The process is the running copy with memory, handles and at least one thread.' },
    { q: 'Which statement about threads in the same process is true?', options: ['Each thread has its own private heap and its own copy of the globals', 'Threads cannot see each other’s variables at all','Threads share the process memory but each has its own stack', 'Threads are more isolated from each other than two processes are'], answer: 2, why: 'All threads of a process share its memory (heap, code, globals). Each thread only has its own stack for local variables and call frames.' },
    { q: 'What happens when a thread calls File.ReadAllText and the disk is slow?', options: ['The CPU core spins in a loop until the data arrives from the disk', 'The thread is marked Waiting and the core is given to another thread','The whole process is paused, including all of its other threads', 'The OS creates a new thread that reads the file in the background'], answer: 1, why: 'The thread blocks in a system call. The scheduler context-switches the core to another ready thread, so no CPU time is wasted.' },
    { q: 'Why is "await" cheaper than a blocked thread when waiting for the network?', options: ['Because await uses a faster network driver inside the kernel', 'Because the thread goes back to the pool, so no thread is held', 'Because await runs the wait in kernel mode, where threads are free', 'Because await skips the system call and reads the socket directly'], answer: 1, why: 'Awaiting an I/O operation releases the thread. Only a small state object stays in memory until the OS signals completion.' },
    { q: 'What is a context switch?', options: ['Changing the value of a variable that two threads share', 'The OS saving one thread’s CPU state and loading another’s', 'Moving a running process from one computer to another computer', 'Compiling the same code again for a different kind of CPU'], answer: 1, why: 'A context switch saves registers and the program counter of the running thread and restores those of the next one.' },
    { q: 'Your .NET API becomes unresponsive under load; thread count climbs slowly and requests queue. The most likely cause is:', options: ['Too much free memory, so the GC never runs','Thread pool starvation from blocking calls like .Result', 'The garbage collector is disabled, so memory fills up and stalls', 'Too many CPU cores, so the scheduler cannot choose between them'], answer: 1, why: 'Blocking pool threads makes the pool add threads slowly while queued work waits. Replace blocking calls with await.' }
  ],
  takeaways: [
    'A process is a running program with its own private memory, handles and PID; a thread is a path of execution inside it.',
    'Processes isolate, threads share. Threads share the heap but each has its own stack.',
    'The OS keeps a PCB per process and switches threads with context switches thousands of times a second.',
    'System calls move the CPU into kernel mode; every file or network operation ends in one.',
    'In .NET, prefer the thread pool and async over raw threads; await releases the thread while I/O waits.',
    'Blocking pool threads causes starvation; measure with dotnet-counters before guessing.'
  ],
  interview: [
    { q: 'Process vs thread: what is the difference and when do you use each?', a: `<p>A process has its own address space and resources; a thread runs inside a process and shares its memory. Use processes for isolation (a crash or security boundary), threads for parallel work inside one program that needs shared data. Process creation is expensive; thread creation is cheap but not free.</p>` },
    { q: 'What is a context switch and why is it expensive?', a: `<p>The OS saves the CPU state (registers, program counter, stack pointer) of the running thread and loads another thread’s state. The direct cost is a few microseconds, but the indirect cost is larger: CPU caches and the TLB were warmed by the old thread and are now cold for the new one.</p>` },
    { q: 'How does ASP.NET Core serve thousands of concurrent requests with a few threads?', a: `<p>Through asynchronous I/O. A request runs on a pool thread until it awaits a database or network call; the thread returns to the pool while the OS completes the I/O. A completion signal queues the continuation back onto the pool. Threads are only busy during CPU work, so a few dozen can serve thousands of in-flight requests.</p>` },
    { q: 'What is the difference between user mode and kernel mode?', a: `<p>User mode is the restricted level where applications run; they cannot touch hardware or other processes’ memory. Kernel mode is the privileged level of the OS. Applications ask the kernel for services through system calls, which switch the mode, perform the work, and switch back.</p>` }
  ]
};

window.CONTENT['m6-cpu-scheduling'] = {
  hook: `One CPU core, twenty programs that all want it right now. Who goes first, and for how long? The answer decides whether your app feels snappy or sluggish.`,
  intro: `<p>A CPU core can run only one thread at a time. When many threads are Ready, something has to decide which one gets the core next and for how long. That decision-maker is the <span class="term">scheduler</span>, and the rules it follows are called <span class="term">scheduling algorithms</span>.</p>
<p>There is no single best rule. If you always run the shortest job first, long jobs may never run. If you give everyone equal turns, important work waits behind unimportant work. Each algorithm makes a trade-off between fairness, responsiveness and total throughput.</p>
<p>You will not write a scheduler at work, but you will feel its decisions every day: why a background job slows down your API, why a UI freezes when one thread hogs the core, and why priorities can backfire. This lesson gives you the vocabulary and the intuition.</p>`,
  realLife: { title: 'The bank counter queue', body: `<p>Picture one bank teller and a line of customers. <strong>First come, first served</strong> is fair but if the first customer has a 40-minute mortgage application, everyone with a 2-minute deposit waits. <strong>Shortest job first</strong> serves the quick deposits first, so most people leave happy, but the mortgage customer may never be served if deposits keep arriving. <strong>Round robin</strong> gives each person 5 minutes, then sends them to the back of the line; nobody waits forever, but the teller spends time switching between customers.</p>
<p>Operating systems face the exact same trade-offs. Linux's default scheduler (CFS, the Completely Fair Scheduler) tries to give every runnable thread an equal share of CPU time, weighted by priority. Windows uses priority levels with time slices and temporarily boosts threads that own a window the user is interacting with, so the UI stays responsive even when a build is running in the background.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>The words you need</h4>
<ul>
<li><strong>Burst time</strong>: how long a thread needs the CPU before it waits for something (I/O) or finishes.</li>
<li><strong>Arrival time</strong>: when the thread became Ready.</li>
<li><strong>Waiting time</strong>: total time spent in the Ready queue, not running.</li>
<li><strong>Turnaround time</strong>: finish time minus arrival time (the whole experience from the thread's point of view).</li>
<li><strong>Preemptive</strong>: the scheduler can take the CPU away from a running thread. <strong>Non-preemptive</strong>: a thread runs until it blocks or finishes.</li>
</ul>
<h4>The classic algorithms</h4>
<p><strong>FCFS (First Come, First Served)</strong>: a plain queue. Simple and fair in order, but a long job at the front delays everyone (the "convoy effect").</p>
<p><strong>SJF (Shortest Job First)</strong>: run the job with the smallest burst time next. This gives the lowest possible average waiting time, but you need to know burst times in advance, which a real OS cannot. Long jobs can starve.</p>
<p><strong>SRTF (Shortest Remaining Time First)</strong>: the preemptive version of SJF. If a new, shorter job arrives, it interrupts the running one.</p>
<p><strong>Priority scheduling</strong>: each thread has a priority number; the highest runs. Danger: a low-priority thread may wait forever. The fix is <span class="term">aging</span>: slowly raise the priority of anything that has waited a long time.</p>
<p><strong>Round Robin (RR)</strong>: each thread gets a fixed slice of time (a <span class="term">quantum</span>, often a few milliseconds). When it expires, the thread goes to the back of the queue. Nobody starves and interactive programs feel responsive.</p>
<h4>A small worked example (FCFS vs SJF)</h4>
<p>Three jobs arrive at time 0 with burst times A=8, B=2, C=4.</p>
<table><thead><tr><th>Algorithm</th><th>Order (Gantt)</th><th>Waiting times</th><th>Average wait</th></tr></thead><tbody>
<tr><td>FCFS</td><td>A(0-8) B(8-10) C(10-14)</td><td>A=0, B=8, C=10</td><td>6.0</td></tr>
<tr><td>SJF</td><td>B(0-2) C(2-6) A(6-14)</td><td>B=0, C=2, A=6</td><td>2.67</td></tr>
</tbody></table>
<p>Same total work, same finish time for the whole batch, but SJF makes the average person wait less than half as long.</p>
<div class="callout tip"><p>The scheduler is deciding between <em>threads</em>, not processes. A process with 8 threads gets more chances to run than one with 1 thread (unless the OS weights by process, which Linux can do with control groups).</p></div>` },
    { name: 'Intermediate', body: `<h4>Round robin in detail</h4>
<p>The quantum size is the whole game. Too small (say 1 ms) and the CPU spends a big share of its time on context switches. Too large (say 500 ms) and RR turns into FCFS: a typing user waits half a second for a keystroke to echo. Real systems use roughly 1 to 20 ms and adapt. A good rule of thumb: the quantum should be longer than about 80% of CPU bursts, so most interactive bursts finish inside one slice.</p>
<p>Example with quantum = 3 and jobs A=8, B=2, C=4 (all arrive at 0): Gantt is A(0-3) B(3-5) C(5-8) A(8-11) C(11-12) A(12-14). Waiting: A = 14 - 8 = 6, B = 3, C = 12 - 4 = 8. Average 5.67, worse than SJF but nobody waited behind the whole of A.</p>
<h4>Multilevel queues</h4>
<p>Real schedulers do not pick one algorithm. They keep several queues: a high-priority queue for interactive and system threads (round robin with a short quantum), a lower one for batch work (longer quantum or FCFS). A <strong>multilevel feedback queue</strong> moves threads between levels based on behaviour: a thread that keeps using its whole quantum is probably CPU-bound and is demoted; a thread that blocks early for I/O is probably interactive and is promoted. This automatically favours the kind of work that users notice.</p>
<h4>Linux CFS, in simple words</h4>
<p>CFS tracks, for every runnable thread, a <span class="term">virtual runtime</span>: how much CPU it has received, scaled by its weight (nice value). It always picks the thread with the smallest virtual runtime, stored in a red-black tree so the pick is quick and putting a thread back costs O(log n). Instead of a fixed quantum, it divides a target period (a few milliseconds) among the runnable threads. The result: every thread gets its fair share, and a thread that slept (an interactive one) has a low virtual runtime, so it runs almost immediately when it wakes. Newer kernels replace CFS with EEVDF, which keeps the same fairness idea but adds deadlines for latency-sensitive tasks.</p>
<h4>Windows scheduling</h4>
<p>Windows uses 32 priority levels. The highest-priority ready thread always runs, with round robin among equals. To avoid starvation it uses boosts: a thread that just finished I/O, or that owns the foreground window, temporarily gets a higher priority. The .NET <code>Thread.Priority</code> property maps onto these levels; changing it is almost never the right fix.</p>
<h4>What you can control from .NET</h4>
<ul>
<li><code>Process.PriorityClass</code>: lower a batch job to BelowNormal so it does not compete with your API on the same box.</li>
<li>Thread pool size: do not raise it to "fix" starvation; fix the blocking code.</li>
<li><code>Task.Yield()</code> / <code>await</code> points: give the scheduler a chance to run other work in long CPU loops.</li>
</ul>
<div class="callout warn"><p>Setting a thread to Highest priority to make it faster usually makes the whole machine slower: it starves the threads your thread is waiting for (a priority inversion).</p></div>` },
    { name: 'Expert', body: `<h4>Priority inversion and how OSes solve it</h4>
<p>Low-priority thread L holds a lock. High-priority H wants the lock and blocks. Medium-priority M, which needs no lock, preempts L forever, so H waits on M indirectly. This bug famously caused repeated system resets on the Mars Pathfinder lander in 1997. Solutions: <strong>priority inheritance</strong> (L temporarily gets H's priority while holding the lock; used by Linux RT mutexes) and <strong>priority ceiling</strong> (a lock carries the highest priority of any thread that can take it). Windows uses random priority boosts for threads that have been starved to break the pattern.</p>
<h4>Multi-core scheduling</h4>
<p>With many cores the scheduler also decides <em>where</em> to run a thread. Moving a thread to a different core costs its cache contents, so schedulers prefer <strong>affinity</strong> (keep it where it was) and only migrate for balance. NUMA machines add another layer: memory attached to the other socket is slower, so threads should stay near their memory. In .NET you can pin with <code>ProcessThread.ProcessorAffinity</code>, but this is mainly for specialised low-latency systems.</p>
<h4>Real-time scheduling</h4>
<p>Real-time does not mean fast; it means predictable. <strong>Rate-monotonic</strong> scheduling gives the shortest-period task the highest fixed priority and is optimal among fixed-priority schemes. <strong>Earliest-deadline-first</strong> picks the task whose deadline is closest and can reach 100% utilisation. Linux exposes SCHED_FIFO and SCHED_RR policies for this; a misconfigured SCHED_FIFO thread in an infinite loop will lock up the machine.</p>
<h4>Scheduling inside your runtime</h4>
<p>There are two schedulers in a .NET process: the OS schedules threads, and the thread pool schedules tasks onto those threads. The two can fight. Example: 100 tasks are queued, pool threads equal core count, and each task blocks on a lock. The OS sees idle cores, the pool sees busy threads; the hill-climber slowly injects more threads; throughput collapses. The remedy is cooperative: avoid blocking, use async locks (<code>SemaphoreSlim.WaitAsync</code>), and keep tasks short.</p>
<h4>Measuring scheduler problems</h4>
<ul>
<li>Linux: <code>top</code> load average (runnable threads), <code>vmstat</code> cs column (context switches/sec), <code>perf sched</code>.</li>
<li>Windows: PerfMon "Context Switches/sec", "Processor Queue Length"; a queue length consistently above 2 x cores means CPU contention.</li>
<li>.NET: <code>dotnet-counters</code> ThreadPool Queue Length and Thread Count; a growing queue with a flat thread count is starvation.</li>
</ul>
<table><thead><tr><th>Algorithm</th><th>Preemptive</th><th>Starvation</th><th>Best for</th></tr></thead><tbody>
<tr><td>FCFS</td><td>No</td><td>No</td><td>Simple batch systems</td></tr>
<tr><td>SJF / SRTF</td><td>No / Yes</td><td>Yes (long jobs)</td><td>Theory; minimal average wait</td></tr>
<tr><td>Priority</td><td>Either</td><td>Yes without aging</td><td>Real-time, system threads</td></tr>
<tr><td>Round robin</td><td>Yes</td><td>No</td><td>Interactive time-sharing</td></tr>
<tr><td>Multilevel feedback</td><td>Yes</td><td>Controlled</td><td>General-purpose OS</td></tr>
</tbody></table>
<div class="callout idea"><p>Interview angle: explain why SJF is optimal for average waiting time (exchange argument: swapping a longer job ahead of a shorter one only increases total wait) and why it cannot be implemented exactly (burst time is unknown; the OS estimates it from history with exponential averaging).</p></div>` }
  ],
  flow: { title: 'One round-robin cycle on a single core', steps: [
    { title: 'Timer tick', desc: 'A hardware timer interrupts the CPU every few milliseconds, handing control to the kernel.' },
    { title: 'Quantum check', desc: 'The scheduler checks whether the running thread has used up its time slice.' },
    { title: 'Save state', desc: 'If it has, the thread’s registers and program counter are saved into its control block.' },
    { title: 'Back of queue', desc: 'The thread is marked Ready and placed at the end of the ready queue.' },
    { title: 'Pick next', desc: 'The thread at the front of the queue (or the smallest virtual runtime in CFS) is chosen.' },
    { title: 'Restore state', desc: 'Its saved registers are loaded and the CPU jumps to its next instruction.' },
    { title: 'Run', desc: 'The new thread runs until it blocks, finishes, or the next timer tick ends its slice.' }
  ] },
  code: [
    { lang: 'csharp', title: 'Simulate FCFS, SJF and Round Robin and compare waiting times', code: `// A tiny scheduler simulator. All jobs arrive at time 0 for clarity.
static void Fcfs(List<Job> jobs)
{
    int time = 0; double totalWait = 0;
    Console.Write("FCFS  Gantt: ");
    foreach (var j in jobs)
    {
        Console.Write(j.Name + "(" + time + "-" + (time + j.Burst) + ") ");
        totalWait += time;          // waited from 0 until it started
        time += j.Burst;
    }
    Console.WriteLine(" avg wait = " + (totalWait / jobs.Count).ToString("0.00"));
}

static void Sjf(List<Job> jobs) => Fcfs(jobs.OrderBy(j => j.Burst).ToList()); // SJF = FCFS on sorted bursts

static void RoundRobin(List<Job> jobs, int quantum)
{
    var remaining = jobs.ToDictionary(j => j.Name, j => j.Burst);
    var finish = new Dictionary<string, int>();
    var queue = new Queue<Job>(jobs);
    int time = 0;
    Console.Write("RR(q=" + quantum + ") Gantt: ");
    while (queue.Count > 0)
    {
        var j = queue.Dequeue();
        int run = Math.Min(quantum, remaining[j.Name]);
        Console.Write(j.Name + "(" + time + "-" + (time + run) + ") ");
        time += run;
        remaining[j.Name] -= run;
        if (remaining[j.Name] > 0) queue.Enqueue(j);   // not done: back of the line
        else finish[j.Name] = time;                    // done: record finish time
    }
    // waiting time = finish - burst (all arrived at 0)
    double avg = jobs.Average(j => finish[j.Name] - j.Burst);
    Console.WriteLine(" avg wait = " + avg.ToString("0.00"));
}

var jobs = new List<Job> { new("A", 8), new("B", 2), new("C", 4) };
Fcfs(jobs);              // avg wait 6.00
Sjf(jobs);               // avg wait 2.67
RoundRobin(jobs, 3);     // avg wait 5.67
RoundRobin(jobs, 1);     // more switches, see how the Gantt chart fragments

// In a top-level program, type declarations must come after the statements.
record Job(string Name, int Burst);` },
    { lang: 'csharp', title: 'Priority with aging: a scheduler that never starves anyone', code: `// Each tick we pick the highest priority (lowest number). Jobs that wait
// get "older" and their priority improves, so nothing waits forever.
static void PriorityWithAging(List<PJob> jobs, int agingEvery)
{
    int time = 0;
    while (jobs.Any(j => j.Remaining > 0))
    {
        // pick the best ready job; ties broken by who waited longest
        var pick = jobs.Where(j => j.Remaining > 0)
                       .OrderBy(j => j.Priority)
                       .ThenByDescending(j => j.WaitedTicks)
                       .First();

        pick.Remaining--;                               // run 1 tick
        Console.Write(pick.Name);
        time++;

        foreach (var j in jobs.Where(j => j != pick && j.Remaining > 0))
        {
            j.WaitedTicks++;
            if (j.WaitedTicks % agingEvery == 0 && j.Priority > 1)
                j.Priority--;                           // aging: waited long, bump it up
        }
    }
    Console.WriteLine("  finished at t=" + time);
}

var jobs = new List<PJob>
{
    new() { Name = "H", Priority = 1, Remaining = 6 },   // high priority, long
    new() { Name = "L", Priority = 5, Remaining = 2 },   // low priority, short
    new() { Name = "M", Priority = 3, Remaining = 3 },
};
// Without aging L would run last no matter what. With aging every 2 ticks,
// L climbs the ladder and gets its turn before H finishes.
PriorityWithAging(jobs, agingEvery: 2);

// In real code you rarely set priorities. If you must, lower a batch
// process instead of raising your own:
// System.Diagnostics.Process.GetCurrentProcess().PriorityClass =
//     System.Diagnostics.ProcessPriorityClass.BelowNormal;

// In a top-level program, type declarations must come after the statements.
class PJob
{
    public string Name = "";
    public int Priority;      // 1 = most important
    public int Remaining;
    public int WaitedTicks;
}` }
  ],
  pitfalls: [
    'Raising your thread’s priority to "make it faster". It starves the threads it depends on and can trigger priority inversion.',
    'Choosing a tiny round-robin quantum in a simulation or a real-time config: context-switch overhead dominates.',
    'Assuming shortest-job-first is usable in practice: the OS cannot know burst times, it can only estimate from history.',
    'Confusing turnaround time with waiting time. Turnaround includes the running time; waiting does not.',
    'Running a CPU-heavy batch job at Normal priority on the same machine as a latency-sensitive API.',
    'Blocking inside a tight loop with no await or yield point, so other tasks on the pool never get scheduled.'
  ],
  quiz: [
    { q: 'Jobs A=8, B=2, C=4 arrive at time 0. Which algorithm gives the lowest average waiting time?', options: ['FCFS in order A, B, C', 'Shortest Job First', 'Round robin with quantum 3', 'They are all equal'], answer: 1, why: 'SJF runs B, C, A giving waits of 0, 2, 6 (average 2.67). FCFS gives 6.0 and RR(3) gives 5.67.' },
    { q: 'What problem does aging solve?', options: ['Memory leaks in old threads','Starvation of low-priority threads', 'Slow context switches between threads', 'Cache misses after a thread migrates'], answer: 1, why: 'Aging slowly raises the priority of threads that have waited a long time, so even low-priority work eventually runs.' },
    { q: 'What happens if the round-robin quantum is made very large?', options: ['It behaves like FCFS', 'It behaves like SJF', 'Context switches increase', 'Short jobs get the CPU sooner'], answer: 0, why: 'With a huge quantum each thread runs to completion before the next starts, which is exactly first come, first served.' },
    { q: 'In Linux CFS, which runnable thread is picked next?', options: ['The one with the highest nice value', 'The one that arrived most recently', 'The one with the smallest virtual runtime', 'A random one, so that every thread gets a chance'], answer: 2, why: 'CFS keeps threads in a red-black tree ordered by virtual runtime and always picks the leftmost (smallest), which is the one that has had the least CPU share.' },
    { q: 'Priority inversion is:', options: ['A high-priority thread waiting on a lock a low-priority thread holds', 'Two threads swapping their priorities with each other every time slice', 'A kernel bug where the priority numbers are stored upside down', 'Running the lowest-priority thread first on purpose, to be fair to it'], answer: 0, why: 'A medium-priority thread keeps preempting the low-priority lock holder, so the high-priority thread is stuck. Priority inheritance fixes it.' },
    { q: 'Preemptive scheduling means:', options: ['Each thread decides for itself when it will give up the CPU', 'The scheduler can take the CPU away from a running thread', 'Only one thread ever runs until the machine is restarted', 'Jobs are sorted by length before any of them may start'], answer: 1, why: 'With preemption, a timer interrupt or a higher-priority arrival can interrupt the running thread. Non-preemptive schedulers wait for the thread to block or finish.' }
  ],
  takeaways: [
    'The scheduler decides which Ready thread gets a core and for how long; every algorithm trades fairness against throughput.',
    'FCFS is simple but suffers the convoy effect; SJF minimises average wait but needs unknown burst times and can starve long jobs.',
    'Round robin gives time slices so nobody starves; the quantum size balances responsiveness against switch overhead.',
    'Priority scheduling needs aging to prevent starvation and priority inheritance to prevent inversion.',
    'Real OSes use multilevel feedback queues (Windows) or fair-share virtual runtime (Linux CFS/EEVDF).',
    'From .NET, lower batch priorities rather than raising yours, and keep pool tasks non-blocking so the two schedulers cooperate.'
  ],
  interview: [
    { q: 'Explain round robin and how you would choose the time quantum.', a: `<p>Each ready thread gets a fixed slice; when it expires the thread goes to the back of the queue. A small quantum improves responsiveness but increases context-switch overhead; a large one approaches FCFS. Pick it so that most interactive CPU bursts complete within one slice, typically a few milliseconds.</p>` },
    { q: 'Why is SJF optimal, and why can’t the OS use it directly?', a: `<p>By an exchange argument, placing a shorter job before a longer one never increases total waiting time, so sorting by burst minimises the average. The OS does not know future burst lengths, so it approximates with an exponential average of past bursts, which is what multilevel feedback queues effectively do.</p>` },
    { q: 'What is starvation and how do schedulers prevent it?', a: `<p>Starvation is a runnable thread never getting the CPU because others always rank higher. Prevention: aging (raise priority over time), fair-share scheduling (CFS), or round robin which guarantees a turn.</p>` },
    { q: 'How does the .NET thread pool interact with the OS scheduler?', a: `<p>The pool schedules tasks onto a small set of OS threads that the OS in turn schedules onto cores. If tasks block, pool threads sit idle from the OS’s view but busy from the pool’s view; the pool injects threads slowly, so throughput drops. Non-blocking async code keeps both schedulers efficient.</p>` }
  ]
};

window.CONTENT['m6-memory-management'] = {
  hook: `Your program thinks it owns 128 TB of memory. Your laptop has 16 GB. Nobody is lying; the operating system is running the best magic trick in computing.`,
  intro: `<p>Every process believes it has its own huge, private, continuous block of memory starting at address 0. In reality, physical RAM is small, shared by everyone, and full of holes. The layer that makes the illusion work is called <span class="term">virtual memory</span>.</p>
<p>The OS and the CPU work together: your program uses <strong>virtual addresses</strong>, and a piece of hardware called the <span class="term">MMU</span> (memory management unit) translates each one into a <strong>physical address</strong> in real RAM, using a lookup table maintained by the OS. If the data is not in RAM at all, the OS fetches it from disk first.</p>
<p>This lesson walks from the two kinds of memory inside your program (stack and heap), through pages and page tables, to what happens when RAM runs out. Along the way you will see where the .NET garbage collector fits, because the GC manages the heap <em>inside</em> the virtual memory the OS hands it.</p>`,
  realLife: { title: 'The library with a small reading room', body: `<p>A big library has millions of books in the basement (the disk) but only a small reading room with 200 desks (RAM). You never go to the basement yourself. You ask the librarian for a book by its catalogue number (a virtual address). The librarian checks a card index (the page table): if the book is already on a desk, you get it at once. If not, that is a <strong>page fault</strong>: the librarian walks to the basement, brings the book up, and if every desk is full, sends the least recently used book back down first.</p>
<p>Every reader has their own catalogue numbering (their own virtual address space), so two readers can both ask for "book 1" and get different books. Where this shows up at work: a database server like SQL Server deliberately keeps as much data as possible on the desks (its buffer pool) because a trip to the basement is 100,000 times slower; cloud providers oversell RAM the same way airlines oversell seats, betting that not everyone needs all their memory at once.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Two kinds of memory inside your program</h4>
<p>The <strong>stack</strong> is a neat pile of boxes. Every time you call a method, a box (a stack frame) is placed on top holding its local variables and the return address. When the method returns, the box is removed. It is fast because allocation is just moving a pointer, and memory is freed automatically in reverse order. Each thread has its own stack (about 1 MB in .NET by default). Call too deep (endless recursion) and you get a <code>StackOverflowException</code>.</p>
<p>The <strong>heap</strong> is a big open storage area. Objects created with <code>new</code> (classes, arrays, strings) live here, and they can outlive the method that created them. Something has to clean up objects nobody uses any more: in C or C++ you do it by hand with <code>free</code>; in .NET the <span class="term">garbage collector (GC)</span> does it for you.</p>
<table><thead><tr><th></th><th>Stack</th><th>Heap</th></tr></thead><tbody>
<tr><td>Holds</td><td>Local variables, parameters, return addresses, structs by value</td><td>Objects created with new</td></tr>
<tr><td>Lifetime</td><td>Until the method returns</td><td>Until no one references it (GC)</td></tr>
<tr><td>Speed</td><td>Very fast</td><td>Fast, but cleanup costs later</td></tr>
<tr><td>Size</td><td>Small (1 MB per thread)</td><td>Large (GBs)</td></tr>
</tbody></table>
<h4>Why virtual memory exists</h4>
<ul>
<li><strong>Protection</strong>: one process cannot read another's memory because its addresses simply do not map there.</li>
<li><strong>Simplicity</strong>: every program is compiled as if it starts at the same address; the OS relocates it for free.</li>
<li><strong>More room</strong>: you can use more memory than physical RAM; rarely used parts are parked on disk.</li>
<li><strong>Sharing</strong>: one copy of a DLL in RAM can be mapped into many processes.</li>
</ul>
<h4>Pages: memory in fixed-size chunks</h4>
<p>Memory is divided into <span class="term">pages</span>, usually 4 KB each. Virtual pages map to physical page frames through a <strong>page table</strong>. The mapping does not need to be continuous: virtual pages 1, 2, 3 can live in physical frames 900, 17 and 5000. The program never notices.</p>
<div class="callout tip"><p>When Task Manager shows your app using "300 MB", that is its <em>working set</em>: the pages currently in physical RAM. The virtual size (everything the process has reserved) is usually much larger and mostly empty.</p></div>` },
    { name: 'Intermediate', body: `<h4>Address translation step by step</h4>
<p>A 64-bit virtual address is split into a page number and an offset. The MMU looks up the page number in the page table to find the physical frame, then adds the offset. Because a flat table for a 48-bit address space would be gigabytes, real systems use <strong>multi-level page tables</strong> (4 or 5 levels on x86-64): a tree where unused branches simply do not exist.</p>
<p>Walking four levels for every memory access would be far too slow, so the CPU caches recent translations in the <span class="term">TLB</span> (translation lookaside buffer). A TLB hit costs nothing; a miss costs a page-table walk (tens to hundreds of cycles). This is one reason a context switch is expensive: switching address spaces flushes or re-tags the TLB.</p>
<h4>Page faults</h4>
<p>Each page table entry has a <strong>present bit</strong>. If it is clear, the access raises a <span class="term">page fault</span>, a trap into the kernel. The kernel then decides:</p>
<ul>
<li><strong>Minor fault</strong>: the page is valid but not yet backed (first touch of freshly allocated memory, or a shared library page already in RAM). Map it and continue; cheap.</li>
<li><strong>Major fault</strong>: the page lives in the swap file or a file on disk. Read it in (milliseconds on HDD, tens of microseconds on NVMe), then continue.</li>
<li><strong>Invalid</strong>: the address is not mapped at all. The process gets a segmentation fault (Linux) or access violation (Windows); in .NET you see <code>NullReferenceException</code> for address 0 or <code>AccessViolationException</code> for unsafe code.</li>
</ul>
<h4>Replacement: who leaves when RAM is full</h4>
<p>If a page must be brought in and no frame is free, the OS evicts one. The ideal is to evict the page that will not be used for the longest time (impossible to know), so OSes approximate <strong>LRU</strong> with the <strong>clock algorithm</strong>: each frame has an "accessed" bit set by hardware; a hand sweeps around clearing bits and evicts the first frame whose bit was already clear. Dirty pages (modified) must be written back first, so clean pages are preferred.</p>
<h4>Thrashing</h4>
<p>When processes together need more pages than RAM holds, every page brought in evicts one that is needed soon. The CPU sits idle waiting for disk; throughput collapses. The symptoms: high disk activity, low CPU, everything crawls. The cure is fewer processes, more RAM, or a smaller working set. Container memory limits make this concrete: exceed the cgroup limit and the kernel kills the process (OOM kill, exit code 137).</p>
<h4>Segmentation, briefly</h4>
<p>Older systems split memory into variable-sized segments (code, data, stack) each with a base and a limit. Segments matched how programs are organised but caused external fragmentation. Modern x86-64 keeps segments only as a vestige; paging does the real work. The word survives in "segmentation fault".</p>
<h4>Where the .NET GC sits</h4>
<p>The runtime asks the OS for large ranges of virtual memory (reserve) and commits pages as the heap grows. Inside that range the GC manages generations 0, 1, 2 and the large object heap. A <strong>Gen 0 collection</strong> is cheap because it looks only at young objects; a <strong>Gen 2 collection</strong> walks everything. When the GC releases memory it may decommit pages, which is when the process's working set shrinks in Task Manager.</p>
<div class="callout warn"><p>"Memory usage keeps growing" is not always a leak. The GC may simply not have run a full collection because there is no pressure. A real leak shows Gen 2 size growing after repeated forced collections.</p></div>` },
    { name: 'Expert', body: `<h4>Huge pages and the TLB</h4>
<p>A 4 KB page size means a 64 GB heap needs 16 million page table entries, and the TLB (a few thousand entries) covers only a few MB. Databases and large .NET heaps benefit from <strong>huge pages</strong> (2 MB or 1 GB on x86-64): far fewer entries, far fewer TLB misses. Linux offers transparent huge pages automatically; SQL Server and the .NET GC (via <code>GCLargePages</code>) can request them explicitly. The cost is coarser memory accounting and potential internal fragmentation.</p>
<h4>Copy-on-write and memory-mapped files</h4>
<p><code>fork()</code> on Linux is fast because the child shares the parent's pages marked read-only; a write by either side triggers a fault and a private copy of just that page (<span class="term">copy-on-write</span>). The same trick lets the OS share one physical copy of a DLL across every process. Memory-mapped files extend the idea: a file's pages are mapped into your address space and the page cache <em>is</em> your buffer, so reading is a pointer dereference. .NET exposes this with <code>MemoryMappedFile</code>; it is how large read-mostly datasets and inter-process shared memory are done efficiently.</p>
<h4>Overcommit and the OOM killer</h4>
<p>Linux lets processes reserve more virtual memory than RAM plus swap exist, betting most will never be touched. When the bet fails, the OOM killer picks a victim by a badness score (mostly resident size). Windows refuses to overcommit: a commit must be backed by RAM or page file, so <code>VirtualAlloc</code> with MEM_COMMIT can fail instead. For services this matters: a .NET app in a container should set <code>DOTNET_GCHeapHardLimit</code> (or rely on the runtime's cgroup awareness) so the GC collects before the kernel kills it.</p>
<h4>Memory ordering and caches (the layer below pages)</h4>
<p>Each core has private L1/L2 caches in 64-byte lines. Two threads writing to different variables in the same line cause <strong>false sharing</strong>: the line ping-pongs between cores and performance drops ten-fold. Pad hot per-thread counters to separate lines. The CPU may also reorder loads and stores; <code>volatile</code>, <code>Interlocked</code> and locks insert the memory barriers that make writes visible across cores in the order you expect.</p>
<h4>NUMA</h4>
<p>On multi-socket servers each socket has local RAM; remote RAM is 30 to 100% slower. The OS allocates pages on the node where the faulting thread runs ("first touch"). A heap initialised by one thread and consumed by threads on another socket pays the remote penalty forever. The .NET server GC creates one heap per core and is NUMA-aware; still, pinning latency-critical services to one node is common.</p>
<h4>Diagnosing memory in .NET</h4>
<ul>
<li><code>dotnet-counters</code>: GC heap size, Gen 0/1/2 counts, % time in GC, working set.</li>
<li><code>dotnet-gcdump</code>: heap snapshot showing which types hold the bytes; diff two snapshots to find leaks.</li>
<li><code>dotnet-dump</code> plus <code>dumpheap -stat</code> and <code>gcroot</code>: why is this object still alive?</li>
<li>Linux: <code>/proc/PID/status</code> (VmRSS, VmSwap), <code>pmap</code>, <code>vmstat</code> si/so columns for swapping.</li>
</ul>
<div class="callout idea"><p>Interview angle: "What is the difference between reserved, committed and resident memory?" Reserved = virtual range claimed; committed = backed by RAM or page file, counts against limits; resident (working set) = currently in physical RAM.</p></div>` }
  ],
  flow: { title: 'From a C# variable read to a physical RAM cell', steps: [
    { title: 'Virtual address', desc: 'Your code reads customer.Name. The JIT-compiled instruction uses a 64-bit virtual address.' },
    { title: 'Split', desc: 'The MMU splits it into a page number (high bits) and an offset inside the page (low 12 bits).' },
    { title: 'TLB lookup', desc: 'The CPU checks the TLB cache for a recent translation of that page number. Hit: skip to step 6.' },
    { title: 'Page table walk', desc: 'Miss: the MMU walks the multi-level page table in RAM to find the entry.' },
    { title: 'Present?', desc: 'If the present bit is clear, a page fault traps into the kernel, which loads the page from disk or maps a fresh one, then retries.' },
    { title: 'Physical address', desc: 'Frame number plus offset gives the physical address; the TLB caches the translation.' },
    { title: 'Cache & RAM', desc: 'The CPU checks L1/L2/L3 caches for that line; on a miss it reads 64 bytes from RAM into cache.' },
    { title: 'Value', desc: 'The register receives the reference to the string, and your code continues. All of this took nanoseconds, or milliseconds on a major fault.' }
  ] },
  code: [
    { lang: 'csharp', title: 'Watch stack vs heap, working set and the GC in action', code: `using System.Diagnostics;
using System.Runtime;

static void Report(string label)
{
    var p = Process.GetCurrentProcess();
    p.Refresh();
    Console.WriteLine(label.PadRight(28)
        + " working set " + (p.WorkingSet64 / 1_048_576).ToString().PadLeft(5) + " MB"
        + " | GC heap " + (GC.GetTotalMemory(false) / 1_048_576).ToString().PadLeft(5) + " MB"
        + " | Gen0/1/2 collections " + GC.CollectionCount(0) + "/" + GC.CollectionCount(1) + "/" + GC.CollectionCount(2));
}

// --- Stack: a struct lives inline, no heap allocation at all ---
static long SumOnStack(int n)
{
    Span<int> buffer = stackalloc int[256];     // 1 KB on this thread's stack
    for (int i = 0; i < buffer.Length; i++) buffer[i] = i % n;
    long s = 0; foreach (var v in buffer) s += v;
    return s;                                   // buffer disappears when we return
}

Report("start");
Console.WriteLine("stack sum = " + SumOnStack(7));
Report("after stack work");

// --- Heap: allocate 200 MB of arrays we keep referencing ---
var keep = new List<byte[]>();
for (int i = 0; i < 200; i++)
{
    var block = new byte[1_048_576];            // 1 MB, lands on the Large Object Heap
    block[0] = 1; block[^1] = 1;                // touch first and last page: pages get committed
    keep.Add(block);
}
Report("200 MB live on heap");

// --- Drop the references: memory is garbage but not yet collected ---
keep.Clear();
Report("references dropped");

GC.Collect();
GC.WaitForPendingFinalizers();
Report("after GC.Collect()");

// --- Deep recursion shows the stack limit (each frame costs bytes) ---
static int Depth(int d) => d > 10_000 ? d : Depth(d + 1);   // fine
Console.WriteLine("recursion depth ok: " + Depth(0));
// static int Forever(int d) => Forever(d + 1);  // would end in StackOverflowException, which cannot be caught

// Settings you can read: server vs workstation GC, latency mode
Console.WriteLine("Server GC: " + GCSettings.IsServerGC + ", latency mode: " + GCSettings.LatencyMode);` },
    { lang: 'csharp', title: 'Memory-mapped file: let the OS page cache be your buffer', code: `using System.IO.MemoryMappedFiles;

// Create a 64 MB file and map it. The OS loads pages on demand (page faults),
// so touching one byte does not read the whole file.
const long size = 64L * 1024 * 1024;
string path = Path.Combine(Path.GetTempPath(), "devpath-mmap.bin");

// The map name ("devpath") works on Windows only; on Linux/macOS pass null instead.
using (var mmf = MemoryMappedFile.CreateFromFile(path, FileMode.Create, "devpath", size))
using (var view = mmf.CreateViewAccessor(0, size))
{
    // Write an int every 4 KB: one write per page, so exactly 16,384 pages get touched.
    for (long offset = 0; offset < size; offset += 4096)
        view.Write(offset, (int)(offset / 4096));

    // Random reads: the first touch of a page is a (minor or major) page fault,
    // later touches hit RAM. The OS, not your code, decides what stays resident.
    var rnd = new Random(1);
    long sum = 0;
    for (int i = 0; i < 1000; i++)
    {
        long page = rnd.NextInt64(size / 4096);
        sum += view.ReadInt32(page * 4096);
    }
    Console.WriteLine("checksum " + sum);
}

// Another process on the same machine can open the SAME mapping by name
// ("devpath") and read the bytes: this is shared memory, the fastest IPC there is.
// using var shared = MemoryMappedFile.OpenExisting("devpath");   // Windows only by name

File.Delete(path);` }
  ],
  pitfalls: [
    'Reading "memory usage" from Task Manager and calling it a leak. Working set includes shared DLL pages and memory the GC has not released yet.',
    'Allocating many large arrays (over 85 KB) in a loop. They go to the Large Object Heap, which is collected only in Gen 2 and fragments.',
    'Deep recursion on the default 1 MB thread stack. Convert to iteration or use an explicit stack for big inputs.',
    'Running a .NET service in a container without a heap limit; the kernel OOM-kills it (exit 137) before the GC has a chance to collect.',
    'Calling GC.Collect() in production code to "free memory". It forces an expensive Gen 2 pause and usually makes things worse.',
    'Ignoring swap activity. If vmstat shows si/so (swap in/out) or Windows shows hard faults/sec climbing, you are thrashing, not CPU-bound.'
  ],
  quiz: [
    { q: 'What does the page table store?', options: ['The list of files and sockets each process has open', 'The mapping from virtual page numbers to physical frames', 'The priority and state of every thread in the process', 'The GC generations and the objects that belong to each of them'], answer: 1, why: 'The page table maps each virtual page to a physical frame (or marks it not present). The MMU consults it, with the TLB as a cache.' },
    { q: 'A method allocates a 500-element struct array with stackalloc. Where does it live and when is it freed?', options: ['Heap, freed by the GC in a later collection', 'Stack, freed when the method returns', 'Disk, freed when the process exits', 'TLB, freed on context switch'], answer: 1, why: 'stackalloc reserves space in the current stack frame. It vanishes automatically when the frame is popped, with no GC involvement.' },
    { q: 'What is a major page fault?', options: ['An access to an invalid address that crashes the process', 'An access to a page that must be read from disk', 'A TLB miss that needs a page-table walk', 'A GC Gen 2 collection'], answer: 1, why: 'Major faults require disk I/O (swap or file). Minor faults just need a mapping; invalid accesses raise an access violation.' },
    { q: 'Thrashing happens when:', options: ['The CPU stays 100% busy running threads that never wait for I/O', 'Needed pages exceed RAM, so pages are constantly swapped in and out','So many threads are created that their stacks fill the heap', 'A thread recurses so deeply that its stack keeps overflowing'], answer: 1, why: 'When RAM cannot hold the pages everyone needs, each fault evicts a page that is needed soon, and the system spends its time on disk I/O.' },
    { q: 'Why does the TLB exist?', options: ['To store the GC roots so collections can start quickly', 'To cache recent virtual-to-physical address translations', 'To hold the list of processes that are ready to run next', 'To protect each process’s memory from all other processes'], answer: 1, why: 'A multi-level page table walk costs many memory accesses. The TLB caches recent translations so the common case is free.' },
    { q: 'Which statement about the .NET GC and virtual memory is correct?', options: ['The GC replaces the OS page table with its own generation map', 'The GC manages objects inside virtual memory the OS gave the process', 'The GC runs in kernel mode so that it can move physical pages', 'The GC only manages thread stacks; the heap is freed by the OS itself'], answer: 1, why: 'The runtime reserves virtual ranges from the OS, commits pages as the heap grows, and the GC organises objects into generations within them.' }
  ],
  takeaways: [
    'Stack = per-thread, fast, freed on return; heap = shared, long-lived, cleaned by the GC in .NET.',
    'Virtual memory gives every process a private, continuous address space; the MMU and page tables map it onto scattered physical frames.',
    'Pages (usually 4 KB) are the unit of mapping; the TLB caches translations; a miss costs a page-table walk.',
    'Page faults load pages on demand; major faults hit disk; thrashing is when faults never stop.',
    'Working set is what is in RAM now; committed is what is guaranteed; reserved is what is claimed.',
    'The .NET GC lives inside the process’s virtual memory; diagnose with dotnet-counters and gcdump, not Task Manager alone.'
  ],
  interview: [
    { q: 'Explain virtual memory to a junior developer.', a: `<p>Each process gets its own pretend address space. The OS keeps a map (page table) from the process’s addresses to real RAM in fixed-size pages, and the CPU translates every access through it. Pages that are not in RAM live on disk and are loaded when touched (a page fault). This gives isolation, lets programs use more memory than RAM, and lets the OS share one copy of common code.</p>` },
    { q: 'What is the difference between a minor and a major page fault?', a: `<p>Both mean the page table entry was not present. Minor: the page can be satisfied without disk (first touch of new memory, or the page is already in the page cache); microseconds. Major: the page must be read from swap or a file; milliseconds on spinning disk. Many major faults per second means the system is swapping.</p>` },
    { q: 'How would you find a memory leak in a .NET service?', a: `<p>Confirm it is a leak: after repeated full collections, Gen 2 or LOH size keeps rising. Take two gcdump snapshots minutes apart and diff by type to see what grows. Use gcroot on a sample object to find who holds it; common culprits are static caches, event handlers never unsubscribed, and long-lived collections capturing request objects.</p>` },
    { q: 'What is false sharing?', a: `<p>Two cores writing to different variables that share the same 64-byte cache line. The line bounces between the cores’ caches on every write, so independent work becomes serialised. Fix by padding or placing hot per-thread data on separate lines.</p>` }
  ]
};

window.CONTENT['m6-concurrency'] = {
  hook: `Two threads both add 1 to a counter that reads 5. The result is 6, not 7. No exception, no log line, just silently wrong. Welcome to concurrency.`,
  intro: `<p><span class="term">Concurrency</span> means several things are in progress at the same time. It is what makes servers fast and user interfaces responsive. It is also the source of the hardest bugs you will ever meet, because the same code passes a thousand times and fails on the thousand-and-first, only in production, only under load.</p>
<p>The root problem is simple: threads share memory, and operations that look like one step in C# are actually several steps for the CPU. <code>count++</code> is read, add, write. If two threads interleave those steps, one update is lost. This is a <span class="term">race condition</span>: the result depends on who wins the race.</p>
<p>The tools to fix it are locks, atomic operations and message passing. The skill is knowing which one, and knowing the three ways locks themselves go wrong: deadlock, livelock and starvation. This lesson covers all of it with C# you can run.</p>`,
  realLife: { title: 'One bathroom, many roommates', body: `<p>A shared flat has one bathroom. Without a rule, two people walk in at once: a race condition. So you add a lock on the door: a <strong>mutex</strong>. Only one person inside at a time; others wait. Now imagine two bathrooms and a sign-in sheet that allows two people at once: a <strong>semaphore</strong> with count 2.</p>
<p>Deadlock: Alice is in the bathroom and needs the hair dryer that Bob has in his room; Bob is in his room and needs the bathroom to return the dryer. Both wait forever. Livelock: both step aside in the hallway to let the other pass, at the same time, again and again. Starvation: the polite roommate always lets others go first and never gets in.</p>
<p>At work: a bank's transfer service locks two accounts; if one request locks A then B and another locks B then A, the service deadlocks under load. SQL Server detects this and kills one transaction (error 1205). Payment companies solve it by always locking accounts in a fixed order, which is exactly the rule this lesson teaches.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>The race condition, step by step</h4>
<p>Thread 1 reads <code>count</code> (5). Thread 2 reads <code>count</code> (5). Thread 1 writes 6. Thread 2 writes 6. One increment vanished. The code that reads and writes shared data is called the <span class="term">critical section</span>, and the rule is: only one thread may be inside a critical section at a time. This property is called <strong>mutual exclusion</strong>.</p>
<h4>The lock keyword</h4>
<p>In C#, <code>lock (obj) { ... }</code> is the simplest way to guard a critical section. The first thread to arrive takes the lock; others wait at the door until it leaves. Rules of thumb:</p>
<ul>
<li>Lock on a private object made for the purpose (<code>private readonly object _gate = new();</code> or, in .NET 9+, <code>private readonly Lock _gate = new();</code>). Never lock on <code>this</code>, a string, or a type: other code might lock on the same thing.</li>
<li>Keep the locked region short. Do not do I/O or call unknown code while holding a lock.</li>
<li>Every read and write of the shared data must go through the same lock. Guarding only the writes is a classic mistake.</li>
</ul>
<h4>Three kinds of waiting tools</h4>
<table><thead><tr><th>Tool</th><th>Lets in</th><th>C#</th><th>Use when</th></tr></thead><tbody>
<tr><td>Mutex / Monitor</td><td>1 thread</td><td><code>lock</code>, <code>Monitor</code>, <code>Mutex</code> (cross-process)</td><td>Protecting shared state</td></tr>
<tr><td>Semaphore</td><td>N threads</td><td><code>SemaphoreSlim</code></td><td>Limiting parallelism (max 10 downloads at once)</td></tr>
<tr><td>Atomic operation</td><td>No waiting at all</td><td><code>Interlocked.Increment</code></td><td>Counters and flags</td></tr>
</tbody></table>
<h4>Deadlock: the four conditions</h4>
<p>A deadlock can only happen when all four hold: (1) <strong>mutual exclusion</strong>: resources cannot be shared; (2) <strong>hold and wait</strong>: a thread holds one resource while waiting for another; (3) <strong>no preemption</strong>: a resource cannot be taken away; (4) <strong>circular wait</strong>: A waits for B, B waits for A. Break any one and deadlock is impossible. The easiest to break is circular wait: always take locks in the same global order.</p>
<div class="callout tip"><p>If you can avoid sharing, do. Give each thread its own data and merge results at the end. The fastest lock is the one you never take.</p></div>
<h4>Async is not the same as parallel</h4>
<p><strong>Parallel</strong> means several threads run at the same time on several cores (CPU-bound work). <strong>Async</strong> means not blocking a thread while waiting for I/O; it may use a single thread. You need locks for parallel code touching shared state; async code on one thread still needs care, because an <code>await</code> lets other work run in the middle of your method.</p>` },
    { name: 'Intermediate', body: `<h4>Interlocked: lock-free counters</h4>
<p><code>Interlocked.Increment(ref count)</code> compiles to a single CPU instruction with a lock prefix: the read-add-write happens atomically in hardware. It is ten times cheaper than a lock and cannot deadlock. <code>Interlocked.CompareExchange</code> is the building block of lock-free structures: "set the value to X only if it is still Y", retried in a loop. Use it for counters, flags and simple one-value updates; use a lock when you must update several fields together.</p>
<h4>Monitor: lock plus signalling</h4>
<p><code>lock</code> is sugar for <code>Monitor.Enter</code>/<code>Exit</code>. Monitor also offers <code>Wait</code> and <code>Pulse</code> so a thread can release the lock and sleep until another thread signals that the state changed (for example, "the queue is no longer empty"). This is the classic producer-consumer pattern. In modern .NET you rarely write it by hand because <code>BlockingCollection&lt;T&gt;</code> and <code>Channel&lt;T&gt;</code> do it for you.</p>
<h4>Producer-consumer done right</h4>
<p><code>Channel&lt;T&gt;</code> (System.Threading.Channels) is an async-friendly queue: producers <code>WriteAsync</code>, consumers <code>ReadAllAsync</code>, and a bounded channel applies <strong>backpressure</strong> by making producers wait when it is full. That bound is what stops a fast producer from eating all your memory. <code>BlockingCollection&lt;T&gt;</code> is the older, thread-blocking version for pure CPU pipelines.</p>
<h4>SemaphoreSlim as an async lock</h4>
<p>You cannot <code>await</code> inside a <code>lock</code>. For async code that needs mutual exclusion, use <code>SemaphoreSlim(1,1)</code> with <code>await sem.WaitAsync()</code> and release in <code>finally</code>. For "at most N at once" (throttling outbound HTTP calls), use <code>SemaphoreSlim(N)</code>.</p>
<h4>Readers and writers</h4>
<p>When reads vastly outnumber writes, <code>ReaderWriterLockSlim</code> lets many readers in at once and gives writers exclusive access. Even better: use immutable snapshots. Readers grab a reference to the current immutable object; a writer builds a new one and swaps the reference atomically. No reader ever waits.</p>
<h4>Deadlock avoidance in practice</h4>
<ul>
<li><strong>Lock ordering</strong>: assign every lock a rank; always acquire in ascending rank. For two accounts, lock the lower id first.</li>
<li><strong>Timeouts</strong>: <code>Monitor.TryEnter(obj, timeout)</code>; if it fails, release what you hold and retry (breaks hold-and-wait).</li>
<li><strong>One lock</strong>: coarse locking is slower but cannot deadlock with itself.</li>
<li><strong>No callbacks under lock</strong>: calling user code (events, virtual methods) while locked is how unrelated locks get entangled.</li>
</ul>
<h4>Async deadlock: the .NET special</h4>
<p>In a UI app or old ASP.NET, calling <code>.Result</code> on a task that needs to come back to the captured context deadlocks: the context thread waits for the task, the task waits for the context thread. The fix is async all the way, or <code>ConfigureAwait(false)</code> in library code. ASP.NET Core has no synchronization context, so this specific deadlock is gone, but <code>.Result</code> still causes thread pool starvation.</p>
<div class="callout warn"><p>Thread-safe collections (<code>ConcurrentDictionary</code>) make each operation atomic, not sequences of them. "If key missing then add" needs <code>GetOrAdd</code>, not <code>ContainsKey</code> followed by <code>Add</code>.</p></div>` },
    { name: 'Expert', body: `<h4>Memory model: why volatile exists</h4>
<p>The compiler, the JIT and the CPU may reorder reads and writes as long as a single thread cannot tell. Another thread can. A flag set by thread A (<code>done = true</code>) after filling a buffer may become visible to thread B <em>before</em> the buffer writes do. Locks and <code>Interlocked</code> operations are <strong>full fences</strong>: everything before them is visible before everything after. <code>volatile</code> gives acquire/release semantics on a single field: enough for a simple "is it ready" flag, not enough to protect multi-step updates. <code>Volatile.Read</code>/<code>Write</code> are the explicit forms. If you are not sure, use a lock; the cost of a correct lock is nanoseconds, the cost of a memory-ordering bug is weeks.</p>
<h4>Lock-free structures and the ABA problem</h4>
<p>A lock-free stack pops by reading the head, computing the next node, then <code>CompareExchange</code>-ing the head only if it is still the same reference. Between the read and the swap, another thread could pop A, pop B, and push A back: the head is A again, the swap succeeds, but "next" is stale. Garbage-collected languages mostly dodge ABA because a referenced A cannot be reused; in C++ you need tagged pointers or hazard pointers. .NET's <code>ConcurrentQueue</code> and <code>ConcurrentStack</code> are production-grade lock-free implementations; write your own only for a measured reason.</p>
<h4>Spinning vs blocking</h4>
<p>Blocking (a lock that puts the thread to sleep) costs two context switches. If the lock is held for nanoseconds, spinning (busy-waiting a few hundred cycles) is cheaper. <code>SpinLock</code> and <code>SpinWait</code> exist for this; the framework's <code>lock</code> already spins briefly before blocking, so the default is usually right. Never spin on a single-core machine or while holding another lock.</p>
<h4>Deadlock detection in the wild</h4>
<p>Databases build a wait-for graph and abort a victim when they find a cycle. Application code rarely does; instead you detect after the fact: a process with growing request latency, all pool threads in <code>Monitor.Enter</code>. Capture a dump (<code>dotnet-dump collect</code>) and run <code>syncblk</code> and <code>clrstack -all</code> to see who holds what. Prevention through lock ordering beats detection every time.</p>
<h4>Structured concurrency and cancellation</h4>
<p>Modern designs limit lifetimes: a parent operation owns child tasks, waits for all of them, and a single <code>CancellationToken</code> flows down. <code>Parallel.ForEachAsync</code> with a <code>MaxDegreeOfParallelism</code>, <code>Task.WhenAll</code> with a shared token, and <code>IAsyncEnumerable</code> pipelines fit this model. Fire-and-forget tasks are where leaked exceptions and zombie work come from.</p>
<h4>The dining philosophers</h4>
<p>Five philosophers, five forks, each needs two to eat. If everyone picks up the left fork at once, deadlock. Solutions map to the four conditions: number the forks and always take the lower first (breaks circular wait); allow at most four at the table via a semaphore (also breaks circular wait: at least one philosopher can always get both forks); or take both forks atomically under one lock (breaks hold-and-wait). The code block below implements the ordering fix.</p>
<table><thead><tr><th>Problem</th><th>Symptom</th><th>Root cause</th><th>Fix</th></tr></thead><tbody>
<tr><td>Race condition</td><td>Wrong values, sporadic</td><td>Unprotected shared state</td><td>Lock, Interlocked, immutability</td></tr>
<tr><td>Deadlock</td><td>Threads hang forever</td><td>Circular wait</td><td>Lock ordering, timeouts</td></tr>
<tr><td>Livelock</td><td>Threads busy, no progress</td><td>Over-polite retry</td><td>Randomised backoff</td></tr>
<tr><td>Starvation</td><td>One thread never runs</td><td>Unfair scheduling or lock</td><td>Fair locks, queues, aging</td></tr>
</tbody></table>
<div class="callout idea"><p>Interview angle: be ready to write a thread-safe singleton (use <code>Lazy&lt;T&gt;</code>), a bounded buffer (use <code>Channel</code>), and to explain why <code>ConcurrentDictionary.GetOrAdd</code> may invoke the factory more than once (it runs outside the lock; use <code>Lazy&lt;T&gt;</code> values if that matters).</p></div>` }
  ],
  flow: { title: 'How a lost update happens, and how a lock prevents it', steps: [
    { title: 'Shared state', desc: 'Variable count = 5 lives on the heap. Two threads are about to run count++.' },
    { title: 'Thread 1 reads', desc: 'Thread 1 loads 5 into a CPU register.' },
    { title: 'Switch', desc: 'The scheduler preempts Thread 1 before it writes. Thread 2 runs.' },
    { title: 'Thread 2 reads & writes', desc: 'Thread 2 loads 5, adds 1, stores 6. Memory says 6.' },
    { title: 'Thread 1 writes', desc: 'Thread 1 resumes with its stale register (5), adds 1, stores 6. One increment is lost.' },
    { title: 'Add a lock', desc: 'Now count++ sits inside lock(gate). Thread 1 takes the lock before reading.' },
    { title: 'Thread 2 waits', desc: 'Thread 2 reaches the lock and blocks at the door until Thread 1 exits the block.' },
    { title: 'Correct result', desc: 'Thread 1 writes 6 and releases; Thread 2 reads 6, writes 7. Mutual exclusion kept the steps together.' }
  ] },
  code: [
    { lang: 'csharp', title: 'Race condition, then three fixes: lock, Interlocked, per-thread partials', code: `using System.Diagnostics;

const int Threads = 8, PerThread = 1_000_000;

// 1. The bug: unprotected shared counter
int unsafeCount = 0;
RunAll(() => { for (int i = 0; i < PerThread; i++) unsafeCount++; });
Console.WriteLine("unsafe   : " + unsafeCount + " (expected " + Threads * PerThread + ")"); // almost always less

// 2. lock: correct, simplest, fine for most code
int lockedCount = 0; var gate = new object();
RunAll(() => { for (int i = 0; i < PerThread; i++) lock (gate) lockedCount++; });
Console.WriteLine("lock     : " + lockedCount);

// 3. Interlocked: correct and ~10x cheaper for a single value
int atomicCount = 0;
RunAll(() => { for (int i = 0; i < PerThread; i++) Interlocked.Increment(ref atomicCount); });
Console.WriteLine("atomic   : " + atomicCount);

// 4. Share nothing: each thread counts privately, merge once at the end (fastest)
int merged = 0;
RunAll(() =>
{
    int local = 0;
    for (int i = 0; i < PerThread; i++) local++;
    Interlocked.Add(ref merged, local);           // one atomic op per thread instead of a million
});
Console.WriteLine("partials : " + merged);

static void RunAll(Action body)
{
    var sw = Stopwatch.StartNew();
    var ts = Enumerable.Range(0, Threads).Select(_ => new Thread(() => body())).ToList();
    ts.ForEach(t => t.Start());
    ts.ForEach(t => t.Join());
    Console.Write("  " + sw.ElapsedMilliseconds + " ms  ");
}

// Async code cannot use lock across an await. Use SemaphoreSlim(1,1):
// private static readonly SemaphoreSlim _sem = new(1, 1);
// await _sem.WaitAsync(); try { await UpdateAsync(); } finally { _sem.Release(); }` },
    { lang: 'csharp', title: 'Deadlock on purpose, then the lock-ordering fix (bank transfer)', code: `// BROKEN: locks in the order the caller passed them. A->B and B->A at the same time = deadlock.
static void TransferDeadlocky(Account from, Account to, decimal amount)
{
    lock (from.Gate)
    {
        Thread.Sleep(10);              // widen the window so the deadlock shows up reliably
        lock (to.Gate)
        {
            from.Withdraw(amount); to.Deposit(amount);
        }
    }
}

// FIXED: always lock the lower Id first, so every thread agrees on the order.
// This breaks the "circular wait" condition, so deadlock is impossible.
static void TransferSafe(Account from, Account to, decimal amount)
{
    var first  = from.Id < to.Id ? from : to;
    var second = from.Id < to.Id ? to : from;
    lock (first.Gate)
    lock (second.Gate)
    {
        if (from.Balance < amount) throw new InvalidOperationException("insufficient funds");
        from.Withdraw(amount); to.Deposit(amount);
    }
}

var a = new Account(1, 1000m); var b = new Account(2, 1000m);

var t1 = new Thread(() => { for (int i = 0; i < 100; i++) TransferSafe(a, b, 1m); });
var t2 = new Thread(() => { for (int i = 0; i < 100; i++) TransferSafe(b, a, 1m); });
t1.Start(); t2.Start(); t1.Join(); t2.Join();
Console.WriteLine("safe: a=" + a.Balance + " b=" + b.Balance + " total=" + (a.Balance + b.Balance));

// To see the deadlock, swap TransferSafe for TransferDeadlocky above: both threads hang.
// Alternative when ordering is impossible: Monitor.TryEnter with a timeout, release and retry
// with random backoff (also avoids livelock because the retries desynchronise).

// In a top-level program, type declarations must come after the statements.
class Account
{
    public int Id { get; }
    public decimal Balance { get; private set; }
    public readonly object Gate = new();
    public Account(int id, decimal balance) { Id = id; Balance = balance; }
    public void Deposit(decimal a) => Balance += a;
    public void Withdraw(decimal a) => Balance -= a;
}` },
    { lang: 'csharp', title: 'Producer-consumer with a bounded Channel, plus dining philosophers', code: `using System.Threading.Channels;

// ---------- Bounded channel: backpressure keeps memory flat ----------
var channel = Channel.CreateBounded<string>(new BoundedChannelOptions(100)
{
    FullMode = BoundedChannelFullMode.Wait      // producer awaits when 100 items are queued
});

var producer = Task.Run(async () =>
{
    for (int i = 0; i < 1000; i++)
        await channel.Writer.WriteAsync("job-" + i);   // waits if the consumer is slow
    channel.Writer.Complete();                          // no more items
});

var consumers = Enumerable.Range(1, 3).Select(id => Task.Run(async () =>
{
    await foreach (var job in channel.Reader.ReadAllAsync())
    {
        await Task.Delay(1);                            // pretend to work
        if (job.EndsWith("00")) Console.WriteLine("consumer " + id + " did " + job);
    }
})).ToArray();

await producer; await Task.WhenAll(consumers);
Console.WriteLine("pipeline done");

// ---------- Dining philosophers with lock ordering ----------
int n = 5;
var forks = Enumerable.Range(0, n).Select(_ => new object()).ToArray();
int[] meals = new int[n];

var philosophers = Enumerable.Range(0, n).Select(p => new Thread(() =>
{
    int left = p, right = (p + 1) % n;
    int first = Math.Min(left, right), second = Math.Max(left, right);   // lower-numbered fork first
    for (int meal = 0; meal < 50; meal++)
    {
        lock (forks[first])
        lock (forks[second])
        {
            meals[p]++;                                  // eating
        }
        Thread.Yield();                                  // thinking
    }
})).ToList();

philosophers.ForEach(t => t.Start());
philosophers.ForEach(t => t.Join());
Console.WriteLine("meals: " + string.Join(",", meals));   // 50,50,50,50,50 and no deadlock

// Without the Min/Max ordering (each takes left then right), five threads can each
// hold their left fork and wait forever for the right one: the textbook deadlock.` }
  ],
  pitfalls: [
    'Guarding writes with a lock but reading without one. Readers can see torn or stale values; every access to shared state goes through the same lock.',
    'Locking on this, a string literal, or typeof(X). Other code can lock the same object and you get accidental deadlocks.',
    'Check-then-act on a concurrent collection (ContainsKey then Add). Use the atomic methods: GetOrAdd, TryAdd, AddOrUpdate.',
    'Awaiting inside a lock block (the compiler forbids it) or blocking with .Result inside async code (starvation and, in UI apps, deadlock).',
    'Calling event handlers or virtual methods while holding a lock. Unknown code may take another lock in the opposite order.',
    'Using Thread.Sleep as a "fix" for a race. It hides the bug on your machine and ships it to production.'
  ],
  quiz: [
    { q: 'Why can count++ lose updates when two threads run it?', options: ['Because the ++ operator is not allowed on variables shared by threads', 'Because it is three steps (read, add, write) that can interleave', 'Because integers are immutable in .NET','Because the GC may move the variable while the two threads are writing it'], answer: 1, why: 'The CPU reads the value into a register, adds, and writes back. If both threads read before either writes, one increment disappears.' },
    { q: 'Which of the four deadlock conditions does "always lock accounts in ascending id order" break?', options: ['Mutual exclusion', 'Hold and wait', 'No preemption', 'Circular wait'], answer: 3, why: 'With a global order, a cycle A waits for B while B waits for A cannot form, because whoever holds the lower lock always gets the higher one.' },
    { q: 'You need "at most 5 concurrent calls" to a slow external API from async code. Which tool fits?', options: ['A lock block around each call', 'A named Mutex shared by all callers', 'SemaphoreSlim(5) with WaitAsync', 'Interlocked.Increment on a counter'], answer: 2, why: 'A semaphore lets N callers through. SemaphoreSlim supports WaitAsync so you do not block threads while waiting.' },
    { q: 'What is livelock?', options: ['A lock that is taken once and then never released by its owner', 'Threads keep running and reacting to each other but make no progress','A thread that is always scheduled ahead of every other thread', 'A lock that is still held when the method reaches an await'], answer: 1, why: 'Like two people stepping aside in a hallway in sync, livelocked threads are busy, not blocked, yet nothing gets done. Random backoff breaks the symmetry.' },
    { q: 'Interlocked.Increment is preferred over lock for a simple counter because:', options: ['It is the only thread-safe way to change an int in .NET', 'It is an atomic CPU instruction: cheaper and cannot deadlock', 'It works across processes, so other programs see the count too', 'It also protects the other fields of the same object for free'], answer: 1, why: 'Interlocked maps to a hardware atomic. It protects only that one operation, which is exactly right for a counter.' },
    { q: 'A bounded Channel with FullMode = Wait gives you:', options: ['Faster producers, because their writes never have to wait', 'Backpressure: producers wait when the queue is full', 'Guaranteed processing order across all of the consumers', 'Automatic retries of failed items'], answer: 1, why: 'The bound caps how far the producer can get ahead. Without it a fast producer can queue millions of items and exhaust memory.' }
  ],
  takeaways: [
    'A race condition is unprotected shared state plus interleaving; the fix is mutual exclusion around the whole read-modify-write.',
    'lock for multi-field updates, Interlocked for single values, SemaphoreSlim for async mutual exclusion and throttling.',
    'Deadlock needs all four conditions; break circular wait with a global lock order and you are safe.',
    'Livelock and starvation are the other two lock failures; randomised backoff and fair queues fix them.',
    'Prefer sharing nothing: immutable snapshots, per-thread partials, and Channels for producer-consumer.',
    'Async is about not blocking; parallel is about many cores. Both need care around shared state, and never block inside async code.'
  ],
  interview: [
    { q: 'What are the necessary conditions for deadlock, and how do you prevent it?', a: `<p>Mutual exclusion, hold and wait, no preemption, circular wait. Prevent by breaking one: acquire all locks at once or in a fixed global order (most common), use lock timeouts and retry with backoff, or avoid nested locks altogether.</p>` },
    { q: 'Difference between a mutex and a semaphore?', a: `<p>A mutex allows one holder and has ownership: only the thread that took it may release it. A semaphore holds a count and allows up to N holders; any thread can release. Use a mutex (lock) for protecting state, a semaphore for limiting concurrency. In .NET, Mutex also works across processes; SemaphoreSlim is in-process and async-friendly.</p>` },
    { q: 'Is ConcurrentDictionary enough to make my cache thread-safe?', a: `<p>Each call is atomic, but composite logic is not. Use GetOrAdd instead of ContainsKey plus Add. Note GetOrAdd may run the value factory more than once under contention; wrap values in Lazy&lt;T&gt; if the factory is expensive or has side effects.</p>` },
    { q: 'Explain the difference between asynchronous and parallel programming.', a: `<p>Parallel: multiple threads execute simultaneously on multiple cores to finish CPU work faster (Parallel.For, Task.Run). Asynchronous: a single logical operation yields the thread while waiting for I/O so the thread can do other work (async/await). A web server is mostly asynchronous; image processing is parallel; they combine with Parallel.ForEachAsync.</p>` }
  ]
};

window.CONTENT['m6-file-systems-io'] = {
  hook: `File.ReadAllText looks like one line. Under it: a system call, a cache lookup, a queue in the kernel, a disk controller, and sometimes a 10 ms wait. Knowing that chain is what separates a fast service from a slow one.`,
  intro: `<p>A <span class="term">file system</span> is the part of the OS that turns a flat disk of numbered blocks into the names, folders and files you see. It decides where bytes go, remembers which blocks belong to which file, and keeps the metadata: size, owner, permissions, timestamps.</p>
<p><span class="term">I/O</span> (input/output) is how your program moves data in and out: files, network sockets, pipes, the console. I/O is slow compared to the CPU (a disk read is a million times slower than an addition), so the OS and your runtime use buffers, caches and asynchronous completion to hide that slowness.</p>
<p>This lesson explains the file system model (directories, inodes, permissions), how a read actually travels through the kernel, why buffering matters, the difference between synchronous, asynchronous, blocking and non-blocking I/O, and how ASP.NET Core's Kestrel server uses all of this to serve requests fast.</p>`,
  realLife: { title: 'The warehouse and its index cards', body: `<p>Imagine a warehouse of numbered shelves (disk blocks). Nobody remembers that "invoice-2024.pdf" is on shelves 4081, 4082 and 9900. So the warehouse keeps an index card per item (an <strong>inode</strong>) listing its shelves, size, owner and who may open it. A folder is just a list of names pointing to index cards. Renaming a file changes a name on the folder list; the card and the shelves do not move, which is why renames are instant even for huge files.</p>
<p>Fetching from the far shelves is slow, so the warehouse keeps a staging area near the door (the <strong>page cache</strong>) with recently requested boxes. Ask for the same file twice and the second time it comes from the staging area in microseconds. Where you see this at work: Kafka writes everything to append-only log files and relies on the OS page cache instead of its own cache, which is why it can push gigabytes per second through plain files. SQL Server does the opposite: it bypasses the OS cache and manages its own buffer pool because it knows its access patterns better.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Files, directories, inodes</h4>
<p>On Linux (ext4, xfs) each file has an <span class="term">inode</span>: a record holding the metadata and the list of disk blocks. The file's name is <em>not</em> in the inode; it is in the directory, which is itself a small file mapping names to inode numbers. Consequences: one inode can have several names (hard links), deleting a file just removes a name and the data goes away only when the last name and the last open handle are gone, and you can delete a file that a process has open (Linux) while Windows usually refuses.</p>
<p>Windows NTFS uses a Master File Table with a similar idea: a record per file, small files stored right inside the record, large ones as lists of runs. The user-facing differences you will hit from .NET: path separators (<code>Path.Combine</code> handles it), case sensitivity (Linux: yes, Windows: no), and locking (Windows locks open files; Linux does not).</p>
<h4>Permissions</h4>
<p>Linux files carry three sets of read/write/execute bits: owner, group, everyone. <code>rw-r--r--</code> means the owner can read and write, everyone else can read. Execute on a directory means "you may enter it". Windows uses access control lists (ACLs) with finer-grained entries. From .NET, <code>UnauthorizedAccessException</code> is what either one looks like.</p>
<h4>The journey of a read</h4>
<ol>
<li>Your code calls <code>File.ReadAllText</code>; .NET calls the OS (<code>read</code> or <code>ReadFile</code>) with a file handle, a buffer and a length.</li>
<li>The kernel checks the <span class="term">page cache</span>: a chunk of RAM holding recently used file blocks. Hit: copy to your buffer, done in microseconds.</li>
<li>Miss: the kernel asks the disk driver, which queues a request to the device. Your thread sleeps.</li>
<li>The disk (NVMe: ~20 to 100 µs; HDD: ~5 to 10 ms) delivers the block into the page cache, the kernel copies it to your buffer and wakes your thread.</li>
</ol>
<h4>Buffering: fewer, bigger trips</h4>
<p>A system call costs about a microsecond. Reading a file one byte at a time with a system call per byte would be absurd. So .NET's <code>FileStream</code> keeps an internal buffer (4 KB by default): one system call fills it, then your reads are served from memory. <code>StreamReader</code> adds another buffer for decoding text. Writes work the same way in reverse: <code>Write</code> fills the buffer, <code>Flush</code> or <code>Dispose</code> pushes it to the OS. Forget to dispose and the last few KB never reach the file.</p>
<div class="callout warn"><p>Even after Flush, the data may still be only in the OS page cache, not on the physical disk. Only <code>FileStream.Flush(flushToDisk: true)</code> (fsync) guarantees it survives a power cut. Databases call fsync on every commit; that is why commits are "slow".</p></div>` },
    { name: 'Intermediate', body: `<h4>Four words that get mixed up</h4>
<table><thead><tr><th>Term</th><th>Meaning</th><th>Example</th></tr></thead><tbody>
<tr><td>Synchronous</td><td>The call returns when the work is done</td><td><code>stream.Read(buf)</code></td></tr>
<tr><td>Asynchronous</td><td>The call returns immediately; completion is signalled later</td><td><code>await stream.ReadAsync(buf)</code></td></tr>
<tr><td>Blocking</td><td>The thread sleeps until data is available</td><td>Classic sync read on a socket</td></tr>
<tr><td>Non-blocking</td><td>The call returns "not ready yet" instead of sleeping</td><td>Linux socket with O_NONBLOCK plus epoll</td></tr>
</tbody></table>
<p>In .NET you only choose between the first two; the runtime picks the OS mechanism. On Windows, <code>ReadAsync</code> uses <strong>overlapped I/O</strong> and an <strong>I/O completion port</strong>: the kernel does the work and later posts a completion that a thread pool I/O thread picks up. On Linux, sockets use <strong>epoll</strong> (readiness notification) and the runtime does the read when the socket is ready; regular files on Linux have no true async interface, so file reads are quietly done on pool threads.</p>
<h4>Why async file I/O still matters</h4>
<p>Even where the OS fakes it, <code>await</code> keeps request threads free in a server. The rule: in ASP.NET Core, never call <code>File.ReadAllText</code> or <code>stream.Read</code> on the request path; use the Async versions and pass the request's <code>CancellationToken</code>. Open <code>FileStream</code> with <code>FileOptions.Asynchronous</code> (or <code>useAsync: true</code>) so Windows actually uses overlapped I/O instead of emulating it.</p>
<h4>Streaming instead of loading</h4>
<p><code>File.ReadAllBytes</code> on a 2 GB upload allocates 2 GB. Streams let you process a chunk at a time with a fixed buffer. Copy with <code>await source.CopyToAsync(dest)</code>, hash with <code>SHA256.HashDataAsync(stream)</code>, parse with <code>StreamReader.ReadLineAsync</code>. For HTTP, return <code>Results.File(stream)</code> or <code>Results.Stream</code> so Kestrel streams to the client without buffering the whole file.</p>
<h4>Memory-mapped files</h4>
<p>Mapping a file puts its pages directly into your address space; the page cache <em>is</em> your buffer, with no copy into user space. Great for large random-access read-mostly data (indexes, dictionaries) and for sharing memory between processes. Not great for sequential streaming (plain reads are as fast and simpler) or for files that grow.</p>
<h4>Directory operations and atomicity</h4>
<p>Writing a config file safely: write to a temp file in the same directory, flush to disk, then <code>File.Move(temp, target, overwrite: true)</code>. Rename is atomic on both OSes, so readers see either the old or the new file, never a half-written one. <code>Directory.EnumerateFiles</code> streams entries; <code>GetFiles</code> loads them all. Use <code>FileSystemWatcher</code> for change notifications, but expect duplicate and missed events under load.</p>
<h4>How Kestrel does I/O</h4>
<p>Kestrel accepts sockets through a small set of transport threads using epoll/IOCP, reads bytes into <code>System.IO.Pipelines</code> buffers (pooled memory, no per-request allocation), and hands parsed requests to the thread pool. The response is written back through the same pipes. No thread ever blocks on a socket, which is why one process serves tens of thousands of connections.</p>
<div class="callout tip"><p>If you need a server that pushes large files, enable response compression only for text and serve them with the static file middleware: <code>UseStaticFiles</code> already streams from disk in chunks and supports range requests.</p></div>` },
    { name: 'Expert', body: `<h4>Journaling and crash consistency</h4>
<p>A file write touches several blocks: the data, the inode, the block bitmap, the directory. Crash in the middle and the file system is inconsistent. Journaling file systems (ext4, NTFS, xfs) first write an intent record to a journal, then apply the changes, then mark the record done. On reboot the journal is replayed or discarded. ext4 journals metadata by default (data=ordered): metadata is consistent, but recently written data may be lost. Applications that need durability must fsync; those that need atomic multi-file updates must build their own write-ahead log, which is exactly what databases do.</p>
<h4>The write path and fsync semantics</h4>
<p><code>write()</code> copies into the page cache and returns. Dirty pages are flushed by background writeback (every few seconds) or by <code>fsync()</code>. fsync on a file does not guarantee the directory entry is durable; a new file needs an fsync on the directory too. On consumer SSDs, fsync may return before data hits non-volatile media unless the drive honours flush commands. This is why cloud databases run on provisioned disks with write-through guarantees and why "it was fast in dev" is sometimes "it was not durable in dev".</p>
<h4>Direct I/O and bypassing the cache</h4>
<p>Databases and log engines often open files with <code>O_DIRECT</code> (Linux) or <code>FILE_FLAG_NO_BUFFERING</code> (Windows) to skip the page cache: they manage their own cache with better knowledge of access patterns and avoid double caching. The cost is strict alignment rules (buffers and offsets aligned to 4 KB) and losing the kernel's read-ahead. .NET exposes this only through P/Invoke or <code>FileOptions.WriteThrough</code> (which is write-through, not no-buffering).</p>
<h4>io_uring and the future of async</h4>
<p>Linux's io_uring provides true asynchronous submission and completion queues shared between user space and kernel, for both files and sockets, with batching and almost no system calls. It is what high-performance proxies and databases are moving to. The .NET runtime does not use it by default yet; keep an eye on transport options if you run latency-critical services on Linux.</p>
<h4>Zero-copy</h4>
<p>Serving a file over a socket normally copies disk → page cache → user buffer → socket buffer. <code>sendfile</code> / <code>TransmitFile</code> let the kernel move pages straight from the page cache to the network card. Web servers such as nginx use this for static files; Kestrel's <code>SendFileAsync</code> currently copies the file through its own buffers instead. Kafka's famous throughput comes from the same call.</p>
<h4>Performance checklist for file-heavy .NET code</h4>
<ul>
<li>Buffer size: 64 KB to 1 MB for sequential bulk copies; the 4 KB default is for general use.</li>
<li>Use <code>RandomAccess.ReadAsync(handle, buffer, offset)</code> (.NET 6+) for positional reads without a shared stream position.</li>
<li>Pool buffers with <code>ArrayPool&lt;byte&gt;.Shared</code> to avoid Gen 2 and LOH churn.</li>
<li>Avoid many small files: directory lookups and inode churn dominate. Batch into larger files or a database.</li>
<li>Measure: <code>iostat -x</code> (await, %util), Windows Resource Monitor disk queue length, and .NET event counters for I/O thread pool usage.</li>
</ul>
<div class="callout idea"><p>Interview angle: "How do you write a file so a crash cannot leave it half-written?" Temp file in the same directory → write → fsync → atomic rename → fsync the directory. Then explain why the same-directory rule matters (rename across file systems is a copy, not atomic).</p></div>` }
  ],
  flow: { title: 'What happens inside await stream.ReadAsync(buffer)', steps: [
    { title: 'Buffer check', desc: 'FileStream first checks its own in-memory buffer. If it holds enough bytes, they are copied and the method completes synchronously.' },
    { title: 'System call', desc: 'Otherwise the runtime issues an asynchronous read to the OS (overlapped I/O on Windows, a pool thread or epoll on Linux).' },
    { title: 'Page cache', desc: 'The kernel checks whether the needed blocks are already cached in RAM.' },
    { title: 'Disk request', desc: 'On a miss, the request is queued to the storage driver; the device fetches the blocks (microseconds on NVMe, milliseconds on HDD).' },
    { title: 'Thread released', desc: 'Meanwhile your thread is back in the pool serving other work; only a small state object remembers where to resume.' },
    { title: 'Completion', desc: 'The device raises an interrupt; the kernel copies data into your buffer and posts a completion to the I/O completion port.' },
    { title: 'Resume', desc: 'A pool thread picks up the completion and runs the code after your await, with the bytes ready.' }
  ] },
  code: [
    { lang: 'csharp', title: 'Reading and writing files the right way: async, streaming, atomic replace', code: `using System.Security.Cryptography;
using System.Text;

string dir = Path.Combine(Path.GetTempPath(), "devpath-io");
Directory.CreateDirectory(dir);
string big = Path.Combine(dir, "big.log");

// --- Write a large file with a buffered stream (one syscall per 64 KB, not per line) ---
await using (var fs = new FileStream(big, FileMode.Create, FileAccess.Write, FileShare.None,
                                     bufferSize: 64 * 1024, FileOptions.Asynchronous))
await using (var writer = new StreamWriter(fs, Encoding.UTF8))
{
    for (int i = 0; i < 200_000; i++)
        await writer.WriteLineAsync("2026-11-05 line " + i + " status=OK");
}   // Dispose flushes the buffers; without it the tail of the file would be missing

Console.WriteLine("size: " + new FileInfo(big).Length / 1024 + " KB");

// --- Stream through it with a fixed buffer: memory stays flat no matter the file size ---
long okCount = 0;
await using (var fs = new FileStream(big, FileMode.Open, FileAccess.Read, FileShare.Read,
                                     bufferSize: 64 * 1024, FileOptions.Asynchronous | FileOptions.SequentialScan))
using (var reader = new StreamReader(fs))
{
    while (await reader.ReadLineAsync() is { } line)
        if (line.EndsWith("status=OK")) okCount++;
}
Console.WriteLine("ok lines: " + okCount);

// --- Hash without loading the whole file ---
await using (var fs = File.OpenRead(big))
{
    var hash = await SHA256.HashDataAsync(fs);
    Console.WriteLine("sha256: " + Convert.ToHexString(hash)[..16] + "...");
}

// --- Atomic replace: readers never see a half-written config ---
static async Task WriteAtomicAsync(string target, string content)
{
    string temp = Path.Combine(Path.GetDirectoryName(target)!, Path.GetRandomFileName());
    await using (var fs = new FileStream(temp, FileMode.CreateNew, FileAccess.Write, FileShare.None,
                                         4096, FileOptions.WriteThrough))
    {
        await fs.WriteAsync(Encoding.UTF8.GetBytes(content));
        fs.Flush(flushToDisk: true);           // fsync: survives a power cut
    }
    File.Move(temp, target, overwrite: true);  // rename is atomic on the same volume
}
await WriteAtomicAsync(Path.Combine(dir, "config.json"), "{ \\"featureX\\": true }");
Console.WriteLine(await File.ReadAllTextAsync(Path.Combine(dir, "config.json")));

// --- Positional reads without a stream position (great for parallel readers) ---
using (var handle = File.OpenHandle(big, FileMode.Open, FileAccess.Read, FileShare.Read, FileOptions.Asynchronous))
{
    var buf = new byte[32];
    int n = await RandomAccess.ReadAsync(handle, buf, fileOffset: 1024);
    Console.WriteLine("bytes at 1024: " + Encoding.UTF8.GetString(buf, 0, n).Replace("\\n", "|"));
}` },
    { lang: 'csharp', title: 'Streaming a large download in ASP.NET Core without buffering it in memory', code: `using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

string storage = Path.Combine(AppContext.BaseDirectory, "storage");
Directory.CreateDirectory(storage);

// GET /files/report.pdf  -> streams the file; supports Range requests (resume, video seek)
app.MapGet("/files/{name}", (string name, HttpContext ctx) =>
{
    // never trust the name: strip paths so ../../etc/passwd cannot escape the folder
    string safeName = Path.GetFileName(name);
    string path = Path.Combine(storage, safeName);
    if (!File.Exists(path)) return Results.NotFound();

    var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read,
                                bufferSize: 64 * 1024, FileOptions.Asynchronous | FileOptions.SequentialScan);

    // Results.File disposes the stream, sets Content-Length, and copies the file to
    // the response in chunks, so memory stays flat. enableRangeProcessing
    // turns on HTTP 206 partial responses.
    return Results.File(stream, "application/octet-stream", safeName, enableRangeProcessing: true);
});

// POST /files/report.pdf  -> streams the upload straight to disk; memory stays flat for multi-GB uploads
app.MapPost("/files/{name}", async (string name, HttpRequest req, CancellationToken ct) =>
{
    string path = Path.Combine(storage, Path.GetFileName(name));
    await using var dest = new FileStream(path, FileMode.Create, FileAccess.Write, FileShare.None,
                                          64 * 1024, FileOptions.Asynchronous);
    await req.Body.CopyToAsync(dest, ct);      // chunk by chunk, honours client disconnect via ct
    return Results.Created("/files/" + Path.GetFileName(name), new { size = dest.Length });
}).DisableAntiforgery();

app.Run();

// Rules this code follows:
//  * Async all the way: the request thread is never parked on disk I/O.
//  * Fixed buffers: a 5 GB file uses 64 KB of RAM.
//  * CancellationToken: a client that disconnects stops the copy.
//  * Path.GetFileName: blocks path traversal attacks.` }
  ],
  pitfalls: [
    'Forgetting to dispose or flush a FileStream/StreamWriter: the buffered tail of the file is silently lost.',
    'Calling File.ReadAllBytes or ReadAllText on user uploads or large logs inside a web request: huge allocations and LOH churn. Stream instead.',
    'Assuming Flush means "on disk". Only Flush(flushToDisk: true) / fsync survives power loss.',
    'Writing a file in place. A crash mid-write leaves it corrupt; write a temp file and rename atomically.',
    'Building paths by string concatenation and trusting client file names: path traversal (../) escapes your folder.',
    'Opening FileStream without FileOptions.Asynchronous on Windows and then calling ReadAsync: the runtime emulates async on a pool thread.'
  ],
  quiz: [
    { q: 'Where is a file’s name stored on a Linux file system?', options: ['Inside the inode, next to the size','In the directory entry that points to the inode', 'In the first data block of the file, before the content', 'In the page cache only, until the file is closed'], answer: 1, why: 'The inode holds metadata and block pointers; the directory maps names to inode numbers. That is why hard links and instant renames work.' },
    { q: 'Why does FileStream keep an internal buffer?', options: ['To encrypt the data before it is handed over to the operating system', 'To turn many small reads/writes into fewer, larger system calls', 'To compress the data so that files take less room on the disk', 'To stop other processes from reading the file while it is open'], answer: 1, why: 'A system call costs about a microsecond. Buffering lets one call move 4 KB or more instead of a few bytes.' },
    { q: 'After stream.Flush() returns, where may the data still be?', options: ['Only on the physical disk', 'In the OS page cache, not yet on disk', 'Still in the buffer inside the FileStream object', 'Nowhere: Flush discards whatever was not yet written'], answer: 1, why: 'Flush pushes the user-space buffer to the kernel. The kernel writes dirty pages later unless you fsync (Flush(flushToDisk: true)).' },
    { q: 'What makes "write temp file, then File.Move over the target" safe?', options: ['Temp files are written faster because they skip the page cache', 'Rename is atomic, so readers see the old or the new file', 'Move compresses the file, so the write finishes sooner', 'The OS locks the target so that no reader can open it again'], answer: 1, why: 'Rename swaps a directory entry in one step. Combined with fsync of the temp file, a crash never leaves a partial target file.' },
    { q: 'In a Kestrel request handler, why use ReadAsync instead of Read on a file?', options: ['Read is not allowed on Linux, so only ReadAsync works there', 'ReadAsync frees the request thread while the disk does the work','ReadAsync makes the disk itself return the bytes faster', 'Read can corrupt a file when two requests arrive together'], answer: 1, why: 'Disk latency is the same either way; the win is that the thread goes back to the pool instead of sleeping, which is what lets one process serve many connections.' },
    { q: 'Non-blocking I/O means:', options: ['The call returns "not ready" at once instead of sleeping', 'The call always succeeds because the kernel waits for you', 'The file is read by a separate helper process','The data is cached in RAM forever, so nothing ever waits'], answer: 0, why: 'Non-blocking calls never put the thread to sleep; combined with readiness notification (epoll) they are the basis of high-concurrency servers.' }
  ],
  takeaways: [
    'Directories map names to inodes; inodes hold metadata and block pointers. Renames are atomic and instant.',
    'A read travels: your buffer ← FileStream buffer ← page cache ← disk. Each hop is orders of magnitude slower.',
    'Buffering turns many small operations into few system calls; always dispose streams so the buffer is flushed.',
    'Flush is not durability; fsync (Flush(flushToDisk: true)) is. Write temp + fsync + rename for crash-safe files.',
    'Async I/O frees threads while devices work; in web servers use the Async APIs with cancellation tokens and stream large data.',
    'Kestrel never blocks on sockets: epoll/IOCP plus Pipelines is why it scales.'
  ],
  interview: [
    { q: 'Explain what happens when a program reads a file.', a: `<p>The program calls the OS with a handle, buffer and length. The kernel checks the page cache; on a miss it queues a request to the storage driver and puts the thread to sleep (or, for async I/O, returns and signals completion later). When the device delivers the blocks they are copied into the page cache and then into the program’s buffer. Runtime-level buffering (FileStream) sits on top so that small reads do not each cost a system call.</p>` },
    { q: 'Blocking vs non-blocking vs asynchronous I/O?', a: `<p>Blocking: the thread sleeps until the operation completes. Non-blocking: the call returns immediately with "would block" and the program polls or uses readiness notification (epoll/select). Asynchronous: the program submits the operation and is notified on completion (IOCP, io_uring). .NET’s async/await exposes the asynchronous model and maps it to whatever the OS offers.</p>` },
    { q: 'How do you make a file write crash-safe?', a: `<p>Write the full content to a temporary file in the same directory, flush to disk with fsync, then atomically rename it over the target, and fsync the directory on Linux for a new file. Never modify the target in place.</p>` },
    { q: 'What is a memory-mapped file and when would you use one?', a: `<p>The OS maps a file’s pages into the process address space, so reads are memory accesses backed by the page cache with no extra copy. Use it for large random-access read-mostly data and for sharing memory between processes. Avoid it for sequential streaming or files that grow frequently.</p>` }
  ]
};

window.CONTENT['m6-linux'] = {
  hook: `Your .NET app will spend most of its life in a Linux container you never see. Forty commands are enough to feel at home there, and this lesson gives you exactly those.`,
  intro: `<p><span class="term">Linux</span> is the operating system that runs most servers, nearly every container, and every Docker image you will ever build for .NET. Even if you develop on Windows, the thing that actually serves your users is probably Linux. Being able to open a shell on it and find out what is wrong is a core skill, not an optional one.</p>
<p>The <span class="term">shell</span> is a text program (usually <code>bash</code>) that takes commands you type, runs programs, and shows their output. Its power comes from a simple idea: every program reads from an input stream and writes to an output stream, and you can chain them with the pipe symbol <code>|</code>. Small tools, combined, solve big problems.</p>
<p>This lesson covers navigating the file system, permissions, processes, searching and transforming text, environment variables, services with systemd, SSH, and the specifics of running .NET on Linux. Every command here is one you will actually use.</p>`,
  realLife: { title: 'Debugging production at 2 a.m.', body: `<p>An alert fires: the orders API in Kubernetes returns 503s. You open a shell into the pod. <code>ps aux</code> shows the dotnet process alive. <code>top</code> shows it at 100% CPU. <code>df -h</code> shows the disk at 100% because a log file grew to 40 GB. <code>tail -n 200 /app/logs/app.log | grep -i exception</code> shows the same error repeating. <code>du -sh /app/logs/*</code> finds the culprit, <code>truncate -s 0</code> frees the disk, and the service recovers while you file the real fix for the morning. Total time: four minutes, all of it in the shell.</p>
<p>Where this matters at work: every Dockerfile for .NET starts from a Linux image; every CI runner, Azure App Service for Linux, Azure Container Apps and AKS node runs these same commands. Many teams that moved their .NET stack from Windows servers to Linux containers value how direct the tooling for diagnosing a running server is.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Moving around</h4>
<p>The file system is one tree starting at <code>/</code>. Important folders: <code>/home/you</code> (your files, also written <code>~</code>), <code>/etc</code> (configuration), <code>/var/log</code> (logs), <code>/tmp</code> (scratch), <code>/usr/bin</code> (programs), <code>/proc</code> (a live view of running processes). <code>pwd</code> prints where you are, <code>ls -la</code> lists everything with details, <code>cd folder</code> moves, <code>cd ..</code> goes up, <code>cd -</code> goes back.</p>
<h4>Files</h4>
<ul>
<li><code>cat file</code> prints a file; <code>less file</code> pages through it (q to quit, / to search).</li>
<li><code>head -n 20 file</code> and <code>tail -n 20 file</code> show the start or end; <code>tail -f app.log</code> follows a growing log live.</li>
<li><code>cp a b</code>, <code>mv a b</code> (move or rename), <code>rm file</code>, <code>rm -r folder</code> (careful: no recycle bin), <code>mkdir -p a/b/c</code>, <code>touch file</code>.</li>
<li><code>nano file</code> is a friendly editor; <code>vim</code> is everywhere but needs practice (press i to type, Esc then :wq to save and quit).</li>
</ul>
<h4>Reading permissions</h4>
<p><code>ls -l</code> shows something like <code>-rwxr-x---  1 app app 1234 Nov 5 app.sh</code>. The first character is the type (<code>-</code> file, <code>d</code> directory). Then three groups of three: owner (<code>rwx</code>), group (<code>r-x</code>), others (<code>---</code>). Change with <code>chmod</code>: <code>chmod +x script.sh</code> makes it runnable; <code>chmod 640 secret.txt</code> uses numbers (4 read, 2 write, 1 execute, added per group: 6 = rw, 4 = r, 0 = nothing). <code>chown app:app file</code> changes owner and group. <code>sudo</code> runs one command as the administrator (root).</p>
<h4>Getting help and not getting stuck</h4>
<p><code>man ls</code> opens the manual; <code>ls --help</code> is shorter. Tab completes names. Up arrow recalls commands; <code>history | grep docker</code> searches them. Ctrl+C stops the running command; Ctrl+D closes the shell. <code>which dotnet</code> shows where a program lives.</p>
<div class="callout tip"><p>Three commands cover 80% of "what is going on": <code>top</code> (what is using CPU and memory), <code>df -h</code> (is the disk full), <code>tail -f</code> on the log. Learn them first.</p></div>` },
    { name: 'Intermediate', body: `<h4>Pipes and redirection</h4>
<p>Every program has standard input (0), standard output (1) and standard error (2). <code>&gt;</code> sends output to a file (overwrite), <code>&gt;&gt;</code> appends, <code>2&gt;</code> redirects errors, <code>2&gt;&amp;1</code> merges errors into output, <code>&lt;</code> feeds a file as input. The pipe <code>|</code> connects one program's output to the next one's input. <code>ps aux | grep dotnet | grep -v grep</code> lists processes, keeps lines with "dotnet", drops the grep itself.</p>
<h4>The search and transform toolkit</h4>
<table><thead><tr><th>Tool</th><th>What it does</th><th>Example</th></tr></thead><tbody>
<tr><td><code>grep</code></td><td>Find lines matching a pattern</td><td><code>grep -rn "TODO" src/</code>, <code>grep -i error app.log</code></td></tr>
<tr><td><code>find</code></td><td>Find files by name, size, age</td><td><code>find . -name "*.csproj"</code>, <code>find /var/log -size +100M</code></td></tr>
<tr><td><code>awk</code></td><td>Work with columns</td><td><code>awk '{print $1, $4}' access.log</code></td></tr>
<tr><td><code>sed</code></td><td>Edit text in a stream</td><td><code>sed -i 's/Debug/Release/g' build.sh</code></td></tr>
<tr><td><code>sort</code>, <code>uniq -c</code></td><td>Count occurrences</td><td><code>sort | uniq -c | sort -rn | head</code></td></tr>
<tr><td><code>wc -l</code></td><td>Count lines</td><td><code>grep -c 500 access.log</code> is faster for one pattern</td></tr>
<tr><td><code>xargs</code></td><td>Turn lines into arguments</td><td><code>find . -name "*.tmp" | xargs rm</code></td></tr>
<tr><td><code>jq</code></td><td>Query JSON</td><td><code>curl -s localhost:8080/health | jq .status</code></td></tr>
</tbody></table>
<h4>Processes</h4>
<p><code>ps aux</code> lists all processes with PID, CPU, memory. <code>top</code> (or the nicer <code>htop</code>) is live. <code>kill PID</code> sends SIGTERM (please stop); <code>kill -9 PID</code> sends SIGKILL (stop now, no cleanup; .NET's graceful shutdown will not run). <code>pgrep -f MyApi</code> finds a PID by name. <code>nohup cmd &amp;</code> runs something in the background that survives logout; in practice use systemd or a container instead. <code>lsof -i :8080</code> shows who holds a port; <code>ss -tlnp</code> lists listening sockets.</p>
<h4>Environment variables and configuration</h4>
<p><code>export ASPNETCORE_ENVIRONMENT=Production</code> sets a variable for this shell and its children. <code>env</code> lists them; <code>echo $HOME</code> prints one. ASP.NET Core reads configuration from environment variables with <code>__</code> standing for <code>:</code>, so <code>ConnectionStrings__Default</code> overrides <code>ConnectionStrings:Default</code>. Put persistent exports in <code>~/.bashrc</code> or, for services, in the systemd unit or the container spec, never in the image.</p>
<h4>systemd: running your app as a service</h4>
<p>On a VM, systemd starts your app at boot, restarts it on crash, and captures its output in the journal. You write a small unit file in <code>/etc/systemd/system/myapi.service</code>, then <code>sudo systemctl enable --now myapi</code>. <code>systemctl status myapi</code> shows state; <code>journalctl -u myapi -f</code> follows its logs. The code block below has a complete unit for a .NET API.</p>
<h4>SSH</h4>
<p><code>ssh user@host</code> opens a remote shell; keys (<code>ssh-keygen</code>, <code>ssh-copy-id</code>) replace passwords. <code>scp file user@host:/path</code> copies files; <code>ssh -L 5432:localhost:5432 user@host</code> tunnels a remote database port to your machine. In Kubernetes the equivalent is <code>kubectl exec -it pod -- bash</code>.</p>
<div class="callout warn"><p>Windows line endings (CRLF) in a shell script copied from Windows give the confusing error "bad interpreter: /bin/bash^M". Fix with <code>sed -i 's/\\r$//' script.sh</code> or set Git to check out LF for .sh files.</p></div>` },
    { name: 'Expert', body: `<h4>Running .NET on Linux: what is different</h4>
<ul>
<li><strong>Case-sensitive paths</strong>: <code>Views/Index.cshtml</code> and <code>views/index.cshtml</code> are different files. Most "works on my machine" Linux bugs are this.</li>
<li><strong>Ports below 1024 need root</strong>: run on 8080 behind a reverse proxy (nginx, YARP, the cloud load balancer) rather than on 80 as root.</li>
<li><strong>Signals</strong>: SIGTERM triggers <code>IHostApplicationLifetime.ApplicationStopping</code>; Kubernetes waits a grace period (30 s default) then SIGKILLs. Keep shutdown work under that.</li>
<li><strong>Data protection keys</strong> and <strong>HTTPS certificates</strong> are not in the Windows store; mount a volume and configure Data Protection explicitly or you get cookie decryption failures after each restart.</li>
<li><strong>Globalization</strong>: the <code>-alpine</code> and chiseled images ship invariant culture by default; set <code>DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false</code> and install ICU if you need culture-specific formatting.</li>
<li><strong>Diagnostics</strong>: <code>dotnet-counters</code>, <code>dotnet-trace</code>, <code>dotnet-dump</code> all work on Linux; in a container, install them in a sidecar or use <code>kubectl cp</code> to pull dumps out.</li>
</ul>
<h4>Containers are Linux processes</h4>
<p>A container is an ordinary process tree with namespaces (its own PID 1, network, mounts) and cgroups (CPU and memory limits). <code>docker exec -it c bash</code> drops you into that namespace; <code>ps</code> there shows only the container's processes, and the dotnet process is usually PID 1, which means it must handle SIGTERM itself (the .NET host does). <code>cat /sys/fs/cgroup/memory.max</code> shows the memory limit the GC will respect. Run as a non-root user (<code>USER app</code> in the Dockerfile; the official images create one) so a compromised app cannot modify the image.</p>
<h4>Reading the live system</h4>
<p><code>/proc</code> is a window into the kernel: <code>/proc/PID/status</code> (memory, threads), <code>/proc/PID/fd</code> (open files and sockets; count them to catch handle leaks), <code>/proc/loadavg</code>, <code>/proc/meminfo</code>. <code>vmstat 1</code> prints a line per second with runnable threads, swap activity, and CPU split (us/sy/id/wa: user, system, idle, waiting on I/O). High <code>wa</code> means disk-bound; high <code>sy</code> often means too many system calls or context switches; a run queue (r) above the core count means CPU contention.</p>
<h4>Shell scripting for CI</h4>
<p>Scripts should start with <code>set -euo pipefail</code>: exit on error, on unset variable, and on failure anywhere in a pipeline. Quote variables (<code>"$VAR"</code>) so spaces do not split them. Use <code>trap 'cleanup' EXIT</code> for temp files. Prefer <code>$(cmd)</code> over backticks. Check scripts with <code>shellcheck</code>. For anything beyond 50 lines, consider a C# script or a PowerShell Core script, both of which run on Linux.</p>
<h4>Security hygiene</h4>
<ul>
<li>Never store secrets in the image or in <code>~/.bashrc</code>; use mounted secrets or a vault.</li>
<li><code>chmod 600 ~/.ssh/id_ed25519</code>; SSH refuses keys that others can read.</li>
<li>Keep the base image patched (<code>apt-get update &amp;&amp; apt-get upgrade</code> in a rebuild, not at runtime).</li>
<li>Use <code>ufw</code> or security groups to expose only the proxy port.</li>
</ul>
<div class="callout idea"><p>Interview angle: "Your Linux service is slow, how do you investigate?" Walk the USE method: for each resource (CPU, memory, disk, network) check Utilisation, Saturation, Errors with top/vmstat, free, iostat, ss; then narrow into the process with dotnet-counters and a trace.</p></div>` }
  ],
  flow: { title: 'Diagnosing a sick .NET service from the shell', steps: [
    { title: 'Get in', desc: 'ssh user@host or kubectl exec -it pod -- bash. You are now a shell inside the machine or container.' },
    { title: 'Is it alive?', desc: 'systemctl status myapi or ps aux | grep dotnet. No process means a crash loop; check journalctl -u myapi -n 100.' },
    { title: 'Resources', desc: 'top for CPU and memory, df -h for disk, free -h for RAM. A full disk or swapping explains most sudden slowness.' },
    { title: 'Logs', desc: 'tail -n 500 /var/log/myapi/app.log | grep -iE "error|exception" | sort | uniq -c | sort -rn | head to see which error dominates.' },
    { title: 'Network', desc: 'ss -tlnp to confirm the port is listening; curl -s localhost:8080/health to test the app directly, bypassing the load balancer.' },
    { title: 'Deeper', desc: 'dotnet-counters monitor -p PID for thread pool queue, GC, exceptions per second; dotnet-dump collect if it looks hung.' },
    { title: 'Fix & record', desc: 'Restart with systemctl restart or let Kubernetes roll the pod, then write down what you saw so the real fix lands in code.' }
  ] },
  code: [
    { lang: 'bash', title: 'The 40 commands: navigate, inspect, search, process control', code: `# ---- where am I, what is here ----
pwd                         # current folder
ls -la                      # list all, long format (permissions, owner, size, date)
cd /var/log && ls           # move and list; cd - goes back, cd ~ goes home
du -sh /var/log/*           # size of each item; df -h shows free disk per volume
free -h                     # RAM and swap

# ---- files ----
cat appsettings.json        # print a file
less app.log                # page through (q quit, /text search, G end)
head -n 20 app.log; tail -n 50 app.log
tail -f app.log             # follow live; Ctrl+C to stop
cp -r src backup-src        # copy folder
mv old.txt new.txt          # rename or move
rm -rf build/               # delete folder; there is no undo
mkdir -p logs/archive       # create nested folders
touch .env                  # create empty file / update timestamp

# ---- permissions ----
ls -l run.sh                # -rw-r--r-- app app ...
chmod +x run.sh             # make executable
chmod 600 id_ed25519        # owner read/write only (ssh insists on this)
chown app:app -R /app       # owner:group, recursively
sudo systemctl restart nginx   # run one command as root

# ---- searching and text ----
grep -rn "ConnectionString" /app/        # recursive, with line numbers
grep -iE "error|exception" app.log | wc -l
find . -name "*.csproj" -not -path "*/bin/*"
find /var/log -type f -size +100M -mtime -1  # big files changed in the last day
awk '{print $9}' access.log | sort | uniq -c | sort -rn | head   # top status codes
sed -n '100,120p' app.log                # print lines 100-120
sed -i 's/Warning/Information/' appsettings.json   # in-place replace (first match per line)
cut -d',' -f2 data.csv | sort -u         # unique values of column 2
curl -s http://localhost:8080/health | jq .

# ---- processes and ports ----
ps aux | grep '[d]otnet'    # the [d] trick hides the grep line itself
top                         # live; press M to sort by memory, P by CPU, q to quit
pgrep -f MyApi.dll          # pid by command line
kill 12345                  # SIGTERM: graceful shutdown (ASP.NET Core handles it)
kill -9 12345               # SIGKILL: last resort, no cleanup
ss -tlnp                    # listening TCP ports and their processes
lsof -i :8080               # who is on port 8080
nohup dotnet MyApi.dll > out.log 2>&1 &   # background, survives logout (prefer systemd)

# ---- redirection and pipes ----
dotnet build > build.log 2>&1            # stdout and stderr into one file
dotnet test | tee test.log               # see it AND save it
sort < names.txt | uniq > unique.txt

# ---- environment ----
export ASPNETCORE_ENVIRONMENT=Production
export ConnectionStrings__Default="Server=db;Database=shop;User Id=app;Password=secret"
env | grep -i dotnet
echo "$HOME $SHELL $PATH"

# ---- remote ----
ssh-keygen -t ed25519 && ssh-copy-id app@server
ssh app@server 'systemctl status myapi'
scp ./publish.zip app@server:/tmp/
ssh -L 1433:localhost:1433 app@server    # tunnel SQL Server to your laptop` },
    { lang: 'bash', title: 'Publish and run a .NET API on a Linux VM as a systemd service', code: `# On your machine: build a self-contained, single-file publish for linux-x64
dotnet publish ./src/MyApi -c Release -r linux-x64 --self-contained true \\
  -p:PublishSingleFile=true -o ./publish

# Copy it to the server and set up a dedicated non-root user
scp -r ./publish app@server:/tmp/myapi
ssh app@server 'sudo mkdir -p /opt/myapi && sudo cp -r /tmp/myapi/* /opt/myapi/ \\
  && sudo useradd --system --no-create-home myapi 2>/dev/null; \\
  sudo chown -R myapi:myapi /opt/myapi && sudo chmod +x /opt/myapi/MyApi'

# The unit file. Save as /etc/systemd/system/myapi.service
sudo tee /etc/systemd/system/myapi.service > /dev/null <<'UNIT'
[Unit]
Description=My ASP.NET Core API
After=network.target

[Service]
WorkingDirectory=/opt/myapi
ExecStart=/opt/myapi/MyApi
User=myapi
Restart=always
RestartSec=5
KillSignal=SIGTERM
TimeoutStopSec=30
SyslogIdentifier=myapi
Environment=ASPNETCORE_ENVIRONMENT=Production
Environment=ASPNETCORE_URLS=http://0.0.0.0:8080
Environment=DOTNET_PRINT_TELEMETRY_MESSAGE=false
# Secrets: load from a root-only file instead of putting them here
EnvironmentFile=-/etc/myapi/secrets.env

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload            # tell systemd about the new unit
sudo systemctl enable --now myapi       # start now and on every boot
systemctl status myapi                  # is it running?
journalctl -u myapi -f                  # follow its logs (Ctrl+C to stop)
curl -s localhost:8080/health           # test directly, bypassing any proxy

# Put nginx in front on port 80/443 so the app never needs root:
#   location / { proxy_pass http://127.0.0.1:8080; proxy_set_header Host $host; }
# Then: sudo nginx -t && sudo systemctl reload nginx

# A safe deploy script (set -euo pipefail stops on the first error)
cat > deploy.sh <<'SH'
#!/usr/bin/env bash
set -euo pipefail
trap 'echo "deploy failed on line $LINENO"' ERR
sudo systemctl stop myapi
sudo cp -r /tmp/myapi/* /opt/myapi/
sudo chown -R myapi:myapi /opt/myapi
sudo systemctl start myapi
sleep 2
curl -fsS localhost:8080/health > /dev/null && echo "healthy"
SH
chmod +x deploy.sh` },
    { lang: 'bash', title: 'Inside a container: see limits, signals, open files, and the live kernel view', code: `# Drop into a running container (Docker) or pod (Kubernetes)
docker exec -it orders-api bash          # or sh on alpine/chiseled images without bash
kubectl exec -it orders-api-7d9f -- bash

# Which process is PID 1? In a .NET image it is dotnet itself, so it must handle SIGTERM.
ps -o pid,user,etime,cmd -p 1

# Limits the kernel enforces (the .NET GC reads these to size the heap)
cat /sys/fs/cgroup/memory.max            # bytes, or "max" if unlimited
cat /sys/fs/cgroup/cpu.max               # "quota period", e.g. 200000 100000 = 2 CPUs
nproc                                    # CPUs the process believes it has

# Live process facts from /proc
PID=$(pgrep -f 'dotnet' | head -n 1)
grep -E 'VmRSS|Threads' /proc/$PID/status   # resident memory and thread count
ls /proc/$PID/fd | wc -l                 # open handles: watch this for leaks
cat /proc/loadavg                        # 1/5/15-minute run queue averages
vmstat 1 5                               # r=runnable, si/so=swap, wa=waiting on I/O

# Network from inside
ss -tlnp                                 # what is listening
ss -s                                    # socket summary (TIME_WAIT storms show here)
curl -s -o /dev/null -w '%{http_code} %{time_total}s\\n' http://localhost:8080/health

# Graceful shutdown test: SIGTERM should finish in-flight requests, then exit 0
kill -TERM 1                             # the container stops, and this shell closes with it
# Then, from the host, read the exit code: docker inspect -f '{{.State.ExitCode}}' orders-api

# .NET diagnostics inside the container (install once in the image or a debug sidecar)
dotnet-counters monitor -p $PID --counters System.Runtime,Microsoft.AspNetCore.Hosting
dotnet-dump collect -p $PID -o /tmp/core.dmp   # then kubectl cp it out and analyse locally

# Common gotchas
#  * Case-sensitive paths: "Views/index.cshtml" is not "Views/Index.cshtml"
#  * CRLF scripts: sed -i 's/\\r$//' entrypoint.sh
#  * Port < 1024 as non-root fails: use 8080 behind a proxy or set CAP_NET_BIND_SERVICE
#  * Invariant globalization in alpine/chiseled images: install icu-libs if you need cultures` }
  ],
  pitfalls: [
    'rm -rf with a variable that is empty or has a trailing slash wrong (rm -rf "$DIR/") can delete far more than intended. Quote variables and double-check paths.',
    'Using kill -9 as the default. It skips graceful shutdown, so in-flight requests fail and files may be left half-written. Send SIGTERM first.',
    'Case-sensitive file names: a view or static file that works on Windows 404s on Linux because the casing differs.',
    'Putting secrets in environment variables inside the Docker image or in ~/.bashrc; anyone with image access can read them.',
    'Running the app as root in a container. Use the non-root user the official .NET images provide.',
    'Shell scripts without set -euo pipefail: a failing step is ignored and the deploy "succeeds" with a broken app.'
  ],
  quiz: [
    { q: 'What does chmod 640 secret.txt do?', options: ['Owner, group and others can all read and write', 'Owner read+write, group read, others nothing', 'Owner read+write+execute, group read, others read', 'Owner read, group read+write, others nothing'], answer: 1, why: '6 = 4 (read) + 2 (write) for the owner, 4 = read for the group, 0 = nothing for others.' },
    { q: 'Which command follows a log file as it grows?', options: ['cat -f app.log', 'less app.log', 'tail -f app.log', 'grep -f app.log'], answer: 2, why: 'tail -f keeps the file open and prints new lines as they are written. Press Ctrl+C to stop.' },
    { q: 'What is the difference between kill PID and kill -9 PID?', options: ['No difference: both send SIGKILL and stop the process at once', 'kill sends SIGTERM (graceful); -9 sends SIGKILL (immediate)', 'kill -9 is slower because it waits for nine cleanup steps', 'kill stops one thread; kill -9 stops the whole process tree'], answer: 1, why: 'SIGTERM lets ASP.NET Core run its shutdown logic. SIGKILL cannot be caught; the process just vanishes.' },
    { q: 'In ASP.NET Core, which environment variable overrides ConnectionStrings:Default?', options: ['ConnectionStrings:Default', 'ConnectionStrings__Default', 'CONNECTIONSTRINGS-DEFAULT', 'connection_strings.default'], answer: 1, why: 'A colon is not valid in many shells, so the configuration provider maps a double underscore to the colon separator.' },
    { q: 'What does 2>&1 do in "dotnet build > build.log 2>&1"?', options: ['Runs the build twice and keeps only the output of the first run', 'Sends standard error to the same place as standard output', 'Limits the build to 2 CPU cores and writes 1 log file', 'Deletes the log file after the build has finished one run'], answer: 1, why: 'File descriptor 2 is stderr, 1 is stdout. 2>&1 redirects stderr to wherever stdout currently points, which is the file.' },
    { q: 'Why run a .NET API on port 8080 behind nginx rather than directly on port 80?', options: ['.NET cannot listen on port 80 on Linux, only on ports above 5000', 'Ports below 1024 need root; the proxy lets the app run unprivileged', 'Port 8080 is faster because the kernel gives high ports more buffers', 'nginx compiles the C# code faster than the .NET runtime does'], answer: 1, why: 'Binding a privileged port needs root (or a capability). Keeping the app unprivileged limits the damage if it is compromised; nginx also handles TLS and static files.' }
  ],
  takeaways: [
    'Everything is a file in one tree from /; ls, cd, cat, less, tail -f, grep and find cover most daily work.',
    'Permissions are owner/group/others with rwx bits; chmod and chown change them; sudo runs one command as root.',
    'Pipes chain small tools; redirection (>, >>, 2>&1) controls where output goes.',
    'ps, top, kill (SIGTERM first), ss and lsof are how you see and control processes and ports.',
    'systemd runs your app as a service with restarts and journald logs; containers are just namespaced processes with cgroup limits.',
    '.NET on Linux: case-sensitive paths, non-root users, port 8080 behind a proxy, honour SIGTERM, use dotnet-counters/dump for diagnostics.'
  ],
  interview: [
    { q: 'How would you find which process is using port 8080 on Linux?', a: `<p><code>ss -tlnp | grep 8080</code> or <code>lsof -i :8080</code>. Both show the PID and command. Then <code>ps -p PID -o cmd</code> for details.</p>` },
    { q: 'Explain file permissions and what chmod 755 means.', a: `<p>Three sets of read (4), write (2), execute (1) for owner, group and others. 755 = owner rwx, group r-x, others r-x: typical for scripts and directories that everyone may run or enter but only the owner may change.</p>` },
    { q: 'A .NET service is slow on a Linux box. What do you check first?', a: `<p>top for CPU and memory, df -h for a full disk, vmstat for swapping or I/O wait, tail of the logs for repeated errors, then dotnet-counters for thread pool queue length and GC pressure. Full disk and thread pool starvation are the two most common findings.</p>` },
    { q: 'What happens when Kubernetes stops your pod?', a: `<p>It sends SIGTERM to PID 1 (the dotnet process), which triggers IHostApplicationLifetime.ApplicationStopping so in-flight requests can finish. After the grace period (30 seconds by default) it sends SIGKILL. Shutdown work must complete within that window.</p>` }
  ]
};
