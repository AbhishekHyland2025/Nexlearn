// DevPath content — Module 3 / LLD part 1: OOPS & SOLID, creational, structural, behavioral patterns, UML.
window.CONTENT = window.CONTENT || {};

/* ───────────────────────── m3-oops-solid ───────────────────────── */
window.CONTENT['m3-oops-solid'] = {
  hook: `Good object-oriented code reads like a well-run kitchen: every station knows its job, nobody reaches into another station's drawer, and you can swap the pastry chef without retraining the grill.`,
  intro: `<p><span class="term">Object-Oriented Programming (OOP)</span> is a way of organising code around <em>things</em> (objects) instead of around steps. A <span class="term">class</span> is the blueprint. An <span class="term">object</span> is one real thing built from that blueprint. A class <code>Car</code> describes what every car has (wheels, colour) and can do (start, stop). Your red Honda is an object.</p>
<p>OOP gives you four tools, often called the four pillars: <strong>encapsulation</strong> (hide the insides), <strong>abstraction</strong> (show only what matters), <strong>inheritance</strong> (reuse by "is-a"), and <strong>polymorphism</strong> (many shapes, one call). You already use all four every day in .NET: <code>List&lt;T&gt;</code> hides its array, <code>Stream</code> is an abstraction, <code>Exception</code> types inherit, and <code>ToString()</code> is polymorphic.</p>
<p><span class="term">SOLID</span> is a set of five habits that keep OOP code easy to change. They were collected by Robert C. Martin. Each letter is one rule. None of them is a law; they are warnings about pain you will feel later if you ignore them. Interviewers for LLD rounds expect you to know all five with an example, and to explain <em>why</em> each one matters.</p>`,
  realLife: {
    title: 'A restaurant kitchen',
    body: `<p>Think about a busy restaurant. The menu is the <strong>abstraction</strong>: you order "pasta", you do not tell the chef how to boil water. The kitchen door is <strong>encapsulation</strong>: customers cannot walk in and change the oven settings. A "Pasta Chef" and a "Grill Chef" both <strong>inherit</strong> from "Chef": they share training (clock in, wash hands) but cook different things. When the manager shouts "cook!", each chef does their own version. That is <strong>polymorphism</strong>: one message, many behaviours.</p>
<p>Now imagine one chef who takes orders, cooks, washes dishes and does the accounts. When they fall sick, the restaurant stops. That is a class that breaks the <strong>Single Responsibility Principle</strong>. SOLID is simply the set of staffing rules that keep the kitchen running when people change.</p>
<p>At real companies this shows up in code review every day. Teams at banks, e-commerce firms and SaaS companies reject pull requests where a controller talks directly to the database, or where adding a new payment method means editing a 900-line <code>switch</code>. Those reviews are SOLID in action.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Classes and objects</h4>
<p>A class is a recipe. An object is the cake you baked from it. You can bake many cakes from one recipe, and each cake can have its own flavour (its own field values).</p>
<pre><code>public class BankAccount
{
    private decimal _balance;            // hidden inside (encapsulation)
    public string Owner { get; }

    public BankAccount(string owner) { Owner = owner; }

    public void Deposit(decimal amount)
    {
        if (amount &lt;= 0) throw new ArgumentException("Deposit must be positive");
        _balance += amount;
    }
    public decimal Balance =&gt; _balance;
}</code></pre>
<p>Nobody outside can write <code>account._balance = -1000</code>. They must go through <code>Deposit</code>, which checks the rules. That is the whole point of <span class="term">encapsulation</span>: keep the data and the rules that protect it in one place.</p>
<h4>The four pillars in one table</h4>
<table><thead><tr><th>Pillar</th><th>In one line</th><th>Everyday analogy</th><th>C# tool</th></tr></thead>
<tbody>
<tr><td>Encapsulation</td><td>Hide the insides, expose safe doors</td><td>ATM: you press buttons, you never touch the cash drawer</td><td><code>private</code>, properties</td></tr>
<tr><td>Abstraction</td><td>Show what it does, not how</td><td>Car pedals: you don't see the engine</td><td><code>interface</code>, <code>abstract class</code></td></tr>
<tr><td>Inheritance</td><td>Child "is a" parent and reuses it</td><td>A Dog is an Animal</td><td><code>class Dog : Animal</code></td></tr>
<tr><td>Polymorphism</td><td>Same call, different behaviour</td><td>"Speak!" → dog barks, cat meows</td><td><code>virtual</code>/<code>override</code>, interfaces</td></tr>
</tbody></table>
<h4>Interface vs abstract class</h4>
<ul>
<li>An <span class="term">interface</span> is a contract: a list of things a class promises to do. No fields. A class can follow many interfaces.</li>
<li>An <span class="term">abstract class</span> is a half-finished class. It can hold shared code and fields, but you cannot create it directly. A class can inherit only one.</li>
<li>Rule of thumb: use an interface to describe a <em>capability</em> (<code>IPrintable</code>, <code>IRepository</code>). Use an abstract class when children share real code.</li>
</ul>
<h4>SOLID in plain words</h4>
<ul>
<li><strong>S</strong>ingle Responsibility: a class should have one reason to change.</li>
<li><strong>O</strong>pen/Closed: add new behaviour by adding code, not by editing old code.</li>
<li><strong>L</strong>iskov Substitution: a child class must work anywhere the parent is expected.</li>
<li><strong>I</strong>nterface Segregation: many small interfaces beat one fat one.</li>
<li><strong>D</strong>ependency Inversion: depend on interfaces, not on concrete classes.</li>
</ul>
<div class="callout tip">You do not need to memorise definitions. Remember the pain each rule prevents: "I changed one thing and five others broke" (S, O), "the subclass crashed where the base worked" (L), "I had to implement methods I don't need" (I), "I can't unit test this because it news up a database" (D).</div>` },
    { name: 'Intermediate', body: `<h4>Each SOLID rule: before and after</h4>
<p><strong>Single Responsibility.</strong> Before: an <code>InvoiceService</code> that calculates totals, saves to SQL and sends email. Three reasons to change. After: <code>InvoiceCalculator</code>, <code>InvoiceRepository</code>, <code>InvoiceMailer</code>. Each has one job and one test file.</p>
<p><strong>Open/Closed.</strong> Before: a <code>switch (paymentType)</code> in one method. Adding UPI means editing and re-testing that method. After: an <code>IPaymentMethod</code> interface with <code>CardPayment</code>, <code>UpiPayment</code>. Adding a new one is a new class and one DI registration. The old code stays untouched.</p>
<p><strong>Liskov Substitution.</strong> The classic trap: <code>Square : Rectangle</code>. Setting <code>Width</code> on a square silently changes <code>Height</code>, so code written for rectangles gets wrong areas. If a child must throw <code>NotSupportedException</code> for a base method, the inheritance is wrong. Prefer a shared interface like <code>IShape { double Area(); }</code>.</p>
<p><strong>Interface Segregation.</strong> Before: <code>IWorker { Work(); Eat(); Sleep(); }</code> and a <code>RobotWorker</code> that must fake <code>Eat()</code>. After: <code>IWorkable</code>, <code>IFeedable</code>. Classes implement only what they truly do.</p>
<p><strong>Dependency Inversion.</strong> Before: <code>OrderService</code> does <code>new SqlOrderRepository()</code> inside. You cannot test it without a database. After: it takes <code>IOrderRepository</code> in its constructor. ASP.NET Core's DI container injects the real one in production and you inject a fake in tests.</p>
<h4>Composition over inheritance</h4>
<p>Inheritance is tight coupling: the child depends on every detail of the parent. Deep trees (<code>Vehicle → Car → ElectricCar → TeslaModel3</code>) become brittle. <span class="term">Composition</span> means building a class out of smaller parts it <em>has</em>: a <code>Car</code> has an <code>IEngine</code> and an <code>IGearbox</code>. You can swap parts at runtime and test each part alone.</p>
<div class="compare"><div><h5>Inheritance ("is-a")</h5><ul><li>Reuse by extending</li><li>One parent only in C#</li><li>Changes in the base ripple down</li><li>Good for true hierarchies (Exception types)</li></ul></div><div><h5>Composition ("has-a")</h5><ul><li>Reuse by combining</li><li>Any number of parts</li><li>Parts are swappable and mockable</li><li>Good for behaviour that varies</li></ul></div></div>
<h4>Code smells that tell you a rule is broken</h4>
<ul>
<li><strong>God class</strong>: 1,500 lines, 40 methods, imports everything. (S)</li>
<li><strong>Shotgun surgery</strong>: one feature change touches 12 files. (S, O)</li>
<li><strong>Type checks</strong>: <code>if (x is Dog) ... else if (x is Cat)</code>. Polymorphism should do this. (O, L)</li>
<li><strong>Refused bequest</strong>: a subclass overrides a method with an empty body or a throw. (L)</li>
<li><strong>Fat interface</strong>: implementations full of <code>throw new NotImplementedException()</code>. (I)</li>
<li><strong>Hidden <code>new</code></strong>: services creating their own dependencies. (D)</li>
</ul>
<div class="callout warn">SOLID can be overdone. Ten interfaces for a 50-line script is worse than the script. Apply the rules where change is likely: business rules, integrations, payment and notification channels. Leave stable glue code alone.</div>` },
    { name: 'Expert', body: `<h4>What the principles really protect</h4>
<p>All five rules protect the same thing: the <span class="term">cost of change</span>. In a long-lived codebase, reading and changing code costs far more than writing it. SOLID shrinks the blast radius of a change. In interviews, show that you understand this trade-off rather than quoting definitions. A senior answer sounds like: "I would split this because the pricing rules change monthly while the persistence code has not changed in a year."</p>
<h4>Dependency Inversion at the architecture level</h4>
<p>DIP is the engine behind Clean Architecture and Onion Architecture. The domain layer defines interfaces (<code>IOrderRepository</code>), and the infrastructure layer implements them. The dependency arrow points <em>inward</em>, toward the business rules. Infrastructure can be replaced (SQL Server → Cosmos DB) without touching the domain. The DI container (<code>Microsoft.Extensions.DependencyInjection</code>) is simply the place where the arrows get wired at startup.</p>
<h4>Liskov, formally</h4>
<p>A subtype must keep three things: <em>preconditions</em> cannot get stricter (if the base accepts any positive number, the child cannot demand even numbers), <em>postconditions</em> cannot get weaker (if the base promises a sorted list, so must the child), and <em>invariants</em> must hold (a rectangle's width and height stay independent). C# cannot check these; code review and tests must. A practical test: write the base class's unit tests once and run them against every subclass.</p>
<h4>Open/Closed without over-engineering</h4>
<p>You cannot be closed to <em>all</em> change. Decide which axis of change you expect and close only that one. A tax calculator expects new countries, so countries become plug-ins; it does not expect a new concept of "tax", so that stays hard-coded. This is called <em>strategic closure</em>. Extension points cost complexity; add them when the second variant arrives, not before. (Some teams wait for the third copy before they generalise; that stricter habit is the "rule of three".)</p>
<h4>Modern C# features that help</h4>
<ul>
<li><code>record</code> types give value-based equality and immutability, which kills a whole class of encapsulation bugs.</li>
<li><code>init</code>-only setters and <code>required</code> members make invalid objects impossible to construct.</li>
<li>Default interface methods let you add to an interface without breaking implementers (use sparingly).</li>
<li><code>sealed</code> by default on classes that are not designed for inheritance prevents accidental misuse and lets the JIT devirtualise calls.</li>
<li>Pattern matching makes the few legitimate type switches (visitor-style over a closed set) short and safe.</li>
</ul>
<h4>Interview angle</h4>
<p>Expect: "Explain SOLID with examples", "Interface vs abstract class", "When would you break SRP on purpose?", and a refactoring exercise where they show a god class and ask you to split it. Narrate your reasoning: identify reasons to change, draw boundaries, introduce interfaces only at those boundaries, keep the public behaviour identical, add tests first.</p>
<div class="callout idea">Ask yourself for any class: "If the product manager changes the requirement that most often changes, how many files do I open?" If the answer is more than two, something is coupled.</div>` }
  ],
  flow: {
    title: 'Refactoring a god class with SOLID',
    steps: [
      { title: 'Spot the smell', desc: 'OrderService is 900 lines: it validates, prices, saves to SQL, calls the payment gateway and sends emails. Every sprint touches it.' },
      { title: 'List reasons to change', desc: 'Pricing rules change monthly. Email templates change weekly. The database almost never changes. Each reason is a candidate class (SRP).' },
      { title: 'Draw boundaries', desc: 'Split into PricingEngine, OrderRepository, PaymentGateway and OrderNotifier. OrderService becomes a thin coordinator.' },
      { title: 'Introduce interfaces', desc: 'IPricingEngine, IOrderRepository, IPaymentGateway, IOrderNotifier. OrderService depends only on these (DIP).' },
      { title: 'Plug in variants', desc: 'New payment method? Add UpiGateway : IPaymentGateway and register it. OrderService is untouched (OCP).' },
      { title: 'Check substitutability', desc: 'Run the same gateway contract tests against CardGateway and UpiGateway. Any throw of NotSupported means the abstraction is wrong (LSP).' },
      { title: 'Trim interfaces', desc: 'If INotifier has SendSms but only email exists, split it. Implementers should never fake methods (ISP).' },
      { title: 'Wire with DI', desc: 'Register everything in Program.cs. Tests inject fakes. Production injects real ones. Same OrderService code in both.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Four pillars in one small program', code: `using System;
using System.Collections.Generic;

// Abstraction: the contract says WHAT a shape can do, not HOW.
public interface IShape
{
    double Area();
    string Name { get; }
}

// Abstract class: shared code + a hole the child must fill.
public abstract class Shape : IShape
{
    public abstract double Area();           // child must implement
    public abstract string Name { get; }
    public override string ToString() => Name + " with area " + Area().ToString("F2");
}

// Inheritance + encapsulation: radius is private, validated once.
public class Circle : Shape
{
    private readonly double _radius;
    public Circle(double radius)
    {
        if (radius <= 0) throw new ArgumentException("Radius must be positive");
        _radius = radius;
    }
    public override double Area() => Math.PI * _radius * _radius;
    public override string Name => "Circle";
}

public class Rectangle : Shape
{
    private readonly double _w, _h;
    public Rectangle(double w, double h) { _w = w; _h = h; }
    public override double Area() => _w * _h;
    public override string Name => "Rectangle";
}

public static class Program
{
    public static void Main()
    {
        // Polymorphism: one list, one call, different behaviour per object.
        List<IShape> shapes = new() { new Circle(1), new Rectangle(2, 3) };
        double total = 0;
        foreach (var s in shapes)
        {
            Console.WriteLine(s);        // Circle with area 3.14 / Rectangle with area 6.00
            total += s.Area();
        }
        Console.WriteLine("Total: " + total.ToString("F2"));   // 9.14
    }
}` },
    { lang: 'csharp', title: 'SRP + OCP + DIP: before and after', code: `// ---------- BEFORE: one class, three reasons to change, untestable ----------
public class OrderServiceBefore
{
    public void Place(Order order, string paymentType)
    {
        // pricing rule
        decimal total = 0;
        foreach (var line in order.Lines) total += line.Price * line.Qty;
        if (order.Coupon == "SAVE10") total *= 0.9m;

        // payment: switch grows with every new method (breaks OCP)
        switch (paymentType)
        {
            case "card": /* call card API */ break;
            case "upi":  /* call UPI API */  break;
            default: throw new NotSupportedException(paymentType);
        }

        // persistence: hidden new = cannot unit test (breaks DIP)
        var repo = new SqlOrderRepository("Server=prod;...");
        repo.Save(order, total);

        // notification
        new SmtpClient().Send("shop@example.com", order.Email, "Thanks!", "Total " + total);
    }
}

// ---------- AFTER ----------
public interface IPricingEngine   { decimal Total(Order order); }
public interface IPaymentGateway  { string Method { get; } Task PayAsync(decimal amount); }
public interface IOrderRepository { Task SaveAsync(Order order, decimal total); }
public interface IOrderNotifier   { Task NotifyAsync(Order order, decimal total); }

public class CardGateway : IPaymentGateway
{
    public string Method => "card";
    public Task PayAsync(decimal amount) { /* card API */ return Task.CompletedTask; }
}
public class UpiGateway : IPaymentGateway            // NEW method = NEW class, no edits elsewhere
{
    public string Method => "upi";
    public Task PayAsync(decimal amount) { /* UPI API */ return Task.CompletedTask; }
}

public class OrderService
{
    private readonly IPricingEngine _pricing;
    private readonly IReadOnlyDictionary<string, IPaymentGateway> _gateways;
    private readonly IOrderRepository _repo;
    private readonly IOrderNotifier _notifier;

    // Dependencies come in from outside (DIP). Tests pass fakes.
    public OrderService(IPricingEngine pricing, IEnumerable<IPaymentGateway> gateways,
                        IOrderRepository repo, IOrderNotifier notifier)
    {
        _pricing = pricing;
        _gateways = gateways.ToDictionary(g => g.Method);
        _repo = repo;
        _notifier = notifier;
    }

    public async Task PlaceAsync(Order order, string paymentType)
    {
        if (!_gateways.TryGetValue(paymentType, out var gateway))
            throw new ArgumentException("Unknown payment method: " + paymentType);

        var total = _pricing.Total(order);
        await gateway.PayAsync(total);
        await _repo.SaveAsync(order, total);
        await _notifier.NotifyAsync(order, total);
    }
}

// Program.cs wiring:
// builder.Services.AddScoped<IPricingEngine, StandardPricing>();
// builder.Services.AddScoped<IPaymentGateway, CardGateway>();
// builder.Services.AddScoped<IPaymentGateway, UpiGateway>();
// builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();
// builder.Services.AddScoped<IOrderNotifier, EmailNotifier>();
// builder.Services.AddScoped<OrderService>();` },
    { lang: 'csharp', title: 'LSP and ISP: the square/rectangle trap and fat interfaces', code: `// ---------- LSP violation ----------
public class Rect
{
    public virtual int Width { get; set; }
    public virtual int Height { get; set; }
    public int Area() => Width * Height;
}

public class Square : Rect
{
    // Keeping the sides equal breaks the parent's promise that
    // Width and Height are independent.
    public override int Width  { get => base.Width;  set { base.Width = value; base.Height = value; } }
    public override int Height { get => base.Height; set { base.Width = value; base.Height = value; } }
}

public static class LspDemo
{
    // Written for Rect. Should work for ANY Rect, including Square.
    public static void Check(Rect r)
    {
        r.Width = 4; r.Height = 5;
        Console.WriteLine(r.Area());   // Rect: 20   Square: 25  <-- surprise, LSP broken
    }
}

// Fix: no inheritance between them. Share a capability instead.
public interface IHasArea { int Area(); }
public record RectShape(int Width, int Height) : IHasArea { public int Area() => Width * Height; }
public record SquareShape(int Side) : IHasArea { public int Area() => Side * Side; }

// ---------- ISP violation ----------
public interface IWorker
{
    void Work();
    void Eat();     // a robot cannot eat
    void Sleep();   // a robot does not sleep
}

// Fix: small, focused interfaces. Implement only what is true.
public interface IWorkable  { void Work(); }
public interface IFeedable  { void Eat(); }
public interface IRestable  { void Sleep(); }

public class Human : IWorkable, IFeedable, IRestable
{
    public void Work()  => Console.WriteLine("typing");
    public void Eat()   => Console.WriteLine("lunch");
    public void Sleep() => Console.WriteLine("zzz");
}
public class Robot : IWorkable
{
    public void Work() => Console.WriteLine("welding");
}

// A manager that only needs workers depends only on IWorkable:
public class Shift
{
    public void Run(IEnumerable<IWorkable> crew) { foreach (var w in crew) w.Work(); }
}` }
  ],
  pitfalls: [
    'Using inheritance for code reuse alone. If "Child is-a Parent" sounds wrong when said aloud, use composition instead.',
    'Making everything public "for convenience". Once a field is public, every caller can break your invariants and you can never make it private again without a breaking change.',
    'Creating an interface for every class, even ones with a single implementation that will never change. Interfaces are for variation points and test seams, not decoration.',
    'Treating SOLID as a checklist for a code review instead of a tool for reducing change cost. Ask "what is likely to change?" before splitting anything.',
    'Overriding a base method with an empty body or a throw. That is a Liskov violation and will surprise every caller of the base type.',
    'Hiding dependencies with static classes or service locators. Constructor injection makes dependencies visible and testable.'
  ],
  quiz: [
    { q: 'A class has private fields and exposes them only through methods that check rules. Which pillar is this?', options: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Abstraction'], answer: 1, why: 'Encapsulation means hiding the data and keeping the rules that protect it together in one place.' },
    { q: 'You add a new payment method by creating a new class and registering it, without editing existing code. Which principle are you following?', options: ['Single Responsibility', 'Liskov Substitution', 'Open/Closed', 'Interface Segregation'], answer: 2, why: 'Open/Closed means open for extension (new class) but closed for modification (old code untouched).' },
    { q: 'Square inherits Rectangle and setting Width also changes Height. Code written for Rectangle now gets wrong areas. Which principle is broken?', options: ['Dependency Inversion', 'Liskov Substitution', 'Single Responsibility', 'Open/Closed'], answer: 1, why: 'A subtype must behave correctly wherever the base type is expected. Square changes the base promise that width and height are independent.' },
    { q: 'When should you choose an abstract class over an interface?', options: ['When a class must implement several contracts', 'When children share real code or fields', 'Never; interfaces are always better', 'When you need multiple inheritance'], answer: 1, why: 'An abstract class can hold shared implementation and state. An interface is only a contract. C# allows one base class but many interfaces.' },
    { q: 'OrderService creates new SqlRepository() inside its constructor. What is the main practical problem?', options: ['It runs slower because new is a costly keyword', 'It cannot be unit tested without a database', 'It uses too much memory on every single call', 'It breaks the Liskov Substitution Principle'], answer: 1, why: 'A hidden new ties the class to a concrete dependency. Dependency Inversion says depend on an interface injected from outside so tests can supply a fake.' },
    { q: 'Which is a sign of an Interface Segregation problem?', options: ['A class that exposes only a single public method', 'Implementations full of NotImplementedException', 'A sealed class that nobody can inherit from', 'A record type used as a plain data carrier'], answer: 1, why: 'When implementers must fake methods they do not need, the interface is too fat and should be split.' }
  ],
  takeaways: [
    'Encapsulation hides data behind rules; abstraction hides how behind what; inheritance reuses by is-a; polymorphism lets one call behave many ways.',
    'SOLID is about lowering the cost of change, not about following rules for their own sake.',
    'Split classes by reasons to change (SRP) and depend on interfaces injected from outside (DIP).',
    'Add behaviour with new classes, not by editing old switch statements (OCP).',
    'A subclass must honour every promise of its base; if it must throw, the hierarchy is wrong (LSP).',
    'Prefer composition over inheritance for behaviour that varies; keep interfaces small (ISP).'
  ],
  interview: [
    { q: 'Explain the difference between abstraction and encapsulation.', a: '<p>Encapsulation is about <em>protection</em>: hiding data behind methods that enforce rules (private fields, validated setters). Abstraction is about <em>simplification</em>: exposing only what a caller needs to know (an abstract type like Stream with Read and Write, hiding whether it is a file, a socket or memory). Encapsulation is implemented with access modifiers; abstraction with interfaces and abstract classes.</p>' },
    { q: 'When would you deliberately break the Single Responsibility Principle?', a: '<p>In small scripts, prototypes or throwaway tools where the cost of extra classes is higher than the cost of future change. Also in very stable code that has not changed in years. SRP pays off where change is frequent; applying it everywhere adds indirection without benefit.</p>' },
    { q: 'How does Dependency Inversion relate to Dependency Injection?', a: '<p>Dependency Inversion is the <em>principle</em>: high-level code depends on abstractions, and low-level code implements them. Dependency Injection is one <em>technique</em> to achieve it: dependencies are passed in (usually through the constructor) instead of created inside. ASP.NET Core ships a DI container that does the passing-in automatically at startup.</p>' },
    { q: 'Give a real example of composition over inheritance in .NET.', a: '<p>ASP.NET Core middleware. Instead of a deep inheritance tree of request handlers, each middleware is a small component that holds a reference to the next one. Behaviour is built by composing them in a pipeline. Similarly, Stream decorators (GZipStream wrapping a FileStream) compose behaviour rather than inheriting it.</p>' }
  ]
};

/* ───────────────────────── m3-patterns-creational ───────────────────────── */
window.CONTENT['m3-patterns-creational'] = {
  hook: `The hardest line of code to change later is "new Something()". Creational patterns are the ways to stop writing it everywhere.`,
  intro: `<p>A <span class="term">design pattern</span> is a named, reusable solution to a problem that keeps coming back. Patterns are not libraries. They are shapes of code that experienced developers recognise, like a chess opening. Knowing the names lets a team say "use a Builder here" instead of explaining for ten minutes.</p>
<p><span class="term">Creational patterns</span> are about <em>how objects get created</em>. Creating an object sounds trivial (<code>new Car()</code>), but in real systems creation is where coupling hides: which concrete class, with which settings, how many instances, built in which order. The five classic creational patterns are Singleton, Factory Method, Abstract Factory, Builder and Prototype.</p>
<p>In .NET you meet these daily without noticing: <code>StringBuilder</code> is a Builder, <code>IHttpClientFactory</code> is a factory, <code>Task.Factory</code> is a factory, <code>MemberwiseClone</code> is Prototype, and the DI container's <code>AddSingleton</code> is Singleton done properly. This topic gives you each pattern, a short C# version, and the honest advice on when it is overkill.</p>`,
  realLife: {
    title: 'Ordering a custom laptop',
    body: `<p>You visit a laptop maker's website. You never assemble the laptop yourself; you pick options and a <strong>factory</strong> builds the right model. The configuration page where you choose RAM, SSD and screen one step at a time, then press "Build", is a <strong>Builder</strong>. The company has one support hotline number for the whole country: a <strong>Singleton</strong>. When the designer wants a second prototype that is "the same as the last one but in silver", they copy the existing design instead of starting from a blank sheet: a <strong>Prototype</strong>. And a brand that sells a matched family of products (laptop, charger, bag that all fit together) is an <strong>Abstract Factory</strong>: you pick the family, and every piece matches.</p>
<p>At real companies: payment platforms use factories to pick the gateway for a country; cloud SDKs use builders for request objects with twenty optional fields; game studios use prototypes to clone enemies; and nearly every ASP.NET Core app uses singletons for configuration and caches.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Why "new" is a problem</h4>
<p>Every <code>new SqlRepository()</code> inside a class glues that class to one concrete type. If you have thirty of them and the database changes, you edit thirty files. Creational patterns move the decision of <em>which class</em> and <em>how configured</em> into one place.</p>
<h4>The five patterns in one table</h4>
<table><thead><tr><th>Pattern</th><th>Problem it solves</th><th>Everyday picture</th><th>.NET example</th></tr></thead>
<tbody>
<tr><td>Singleton</td><td>Exactly one instance, shared</td><td>One national support hotline</td><td>AddSingleton, Configuration</td></tr>
<tr><td>Factory Method</td><td>Let a method decide which subclass to create</td><td>"Give me a vehicle for 4 people" → Car</td><td>WebRequest.Create, Task.Factory</td></tr>
<tr><td>Abstract Factory</td><td>Create matched families of objects</td><td>Pick a brand; all parts fit together</td><td>DbProviderFactory</td></tr>
<tr><td>Builder</td><td>Build complex objects step by step</td><td>Configure a laptop option by option</td><td>StringBuilder, HostBuilder, UriBuilder</td></tr>
<tr><td>Prototype</td><td>Copy an existing object</td><td>"Same as last one, but silver"</td><td>MemberwiseClone, record with</td></tr>
</tbody></table>
<h4>Singleton, the simple idea</h4>
<p>Some things should exist once: a settings object, a connection pool, a cache. A Singleton class keeps its only instance in a static field and gives it out through a static property. The catch: static state is hard to test and hidden from callers. That is why in modern .NET we usually let the DI container own the single instance (<code>services.AddSingleton&lt;ICache, MemoryCache&gt;()</code>) and inject it. Same effect, no hidden static.</p>
<h4>Factory, the simple idea</h4>
<p>A factory is just a method whose job is to create things. Callers say what they need ("a notifier for channel X"); the factory decides the concrete class. Add a new channel and only the factory changes.</p>
<h4>Builder, the simple idea</h4>
<p>When an object has many optional settings, a constructor with twelve parameters becomes unreadable. A Builder lets you set options one at a time with readable method names, then call <code>Build()</code>. <code>new StringBuilder().Append("a").Append("b").ToString()</code> is the pattern you already use.</p>
<div class="callout tip">You do not need all five in every project. Most apps need the DI container (Singleton done right), one or two factories at real variation points, and Builders for complex request or configuration objects.</div>` },
    { name: 'Intermediate', body: `<h4>Singleton done safely</h4>
<p>The classic hand-written Singleton has thread-safety traps: two threads can both see <code>_instance == null</code> and create two objects. The easy, correct C# answer is <code>Lazy&lt;T&gt;</code>, which is thread-safe by default. The better answer in an ASP.NET Core app is to not write the pattern at all: register the type as a singleton in DI and the container guarantees one instance per application and injects it where needed. This keeps the class testable because tests can register a different instance.</p>
<div class="callout warn">A Singleton that holds mutable state shared across requests is a classic source of production bugs (one user's data leaking into another's request). Keep singletons immutable or protect state with proper synchronisation.</div>
<h4>Factory Method vs Abstract Factory</h4>
<ul>
<li><strong>Factory Method</strong>: one method, one product type, the subclass or a switch decides the concrete class. Example: <code>INotifier Create(string channel)</code>. (Strictly, the Gang of Four Factory Method is a creation method that <em>subclasses override</em>. One class that picks by a key or a switch is called a <em>Simple Factory</em>. Most teams call both "a factory", but know the difference for interviews.)</li>
<li><strong>Abstract Factory</strong>: an interface with several create-methods that produce a matched <em>family</em>. Example: <code>IUiFactory { CreateButton(); CreateTextBox(); }</code> with <code>WindowsUiFactory</code> and <code>MacUiFactory</code>. Switching the factory switches the whole family at once.</li>
</ul>
<p>In ASP.NET Core, <code>IHttpClientFactory</code> is the practical factory you should use instead of <code>new HttpClient()</code>; it manages handler lifetimes and avoids socket exhaustion.</p>
<h4>Builder: fluent and safe</h4>
<p>A good Builder returns <code>this</code> from each step (fluent), validates in <code>Build()</code>, and produces an immutable result. <code>Host.CreateDefaultBuilder()</code> and <code>WebApplication.CreateBuilder()</code> are builders: you add services and configuration step by step, then <code>Build()</code> freezes everything. Builders also solve the <em>telescoping constructor</em> smell: five overloads of a constructor with growing parameter lists.</p>
<h4>Prototype: cloning</h4>
<p>Prototype copies an existing object instead of building from scratch. Useful when construction is expensive (loaded from a file or database) or when you want "the same but slightly different". C# gives you two tools: <code>MemberwiseClone()</code> (shallow copy) and <code>record</code> types with the <code>with</code> expression (<code>var silver = laptop with { Colour = "silver" }</code>). Watch for shallow vs deep copy: a shallow copy shares nested objects with the original.</p>
<h4>Choosing</h4>
<table><thead><tr><th>Situation</th><th>Use</th></tr></thead><tbody>
<tr><td>Need one shared, stateless service</td><td>DI AddSingleton</td></tr>
<tr><td>Concrete type chosen at runtime from input</td><td>Factory Method</td></tr>
<tr><td>Several objects must match each other</td><td>Abstract Factory</td></tr>
<tr><td>Many optional settings, validation before use</td><td>Builder</td></tr>
<tr><td>Copy with small changes, expensive construction</td><td>Prototype / record with</td></tr>
</tbody></table>` },
    { name: 'Expert', body: `<h4>Lifetimes are the modern Singleton question</h4>
<p>In DI-based apps the real design choice is <em>lifetime</em>: Singleton (one per app), Scoped (one per request), Transient (new every time). Mistakes here cause the hardest bugs: injecting a Scoped <code>DbContext</code> into a Singleton service creates a <em>captive dependency</em>, where one DbContext lives forever and is shared across requests. ASP.NET Core can detect this in development (<code>ValidateScopes</code>), but you should know the rule: a service may only depend on services with an equal or longer lifetime.</p>
<h4>Factories and the DI container</h4>
<p>When the concrete type depends on runtime data (tenant, country, feature flag), the container alone cannot choose. Patterns that work well:</p>
<ul>
<li>Register all implementations of <code>IPaymentGateway</code>, inject <code>IEnumerable&lt;IPaymentGateway&gt;</code>, pick by a <code>Key</code> property. Simple and testable.</li>
<li>Keyed services (<code>AddKeyedScoped</code>, <code>[FromKeyedServices]</code>) in recent .NET versions give this built in.</li>
<li>Inject <code>Func&lt;string, IPaymentGateway&gt;</code> or a small factory class that uses <code>IServiceProvider</code> internally. Keep <code>IServiceProvider</code> out of business code; it is the service locator anti-pattern when used widely.</li>
</ul>
<h4>Builder internals and validation</h4>
<p>Builders are where you enforce invariants <em>before</em> an object exists. Required fields are checked in <code>Build()</code>; the product has no public setters. For many optional parameters, C# also offers optional parameters and object initialisers with <code>required</code> and <code>init</code>, which cover simple cases without a Builder. Reach for a Builder when construction has ordering rules, derived values, or multiple representations (the same steps produce JSON or XML, which is the original Gang of Four motivation).</p>
<h4>Prototype and deep copies</h4>
<p><code>MemberwiseClone</code> copies fields bit by bit: value types are copied, references are shared. For a deep copy you either write a copy constructor, serialize and deserialize (slow, but simple), or use records with <code>with</code> while making nested data immutable so sharing is safe. Immutability makes Prototype trivial: if nothing can change, a shallow copy <em>is</em> a deep copy.</p>
<h4>Trade-offs interviewers probe</h4>
<ul>
<li>"Why is Singleton considered an anti-pattern?" Hidden global state, hard to test, tight coupling, lifetime hidden from callers. DI singletons avoid most of this.</li>
<li>"Factory vs DI?" DI is a general factory for the composition root; hand-written factories are for runtime decisions inside the app.</li>
<li>"Builder vs object initializer?" Initializers are enough when there are no cross-field rules; Builders when validation or steps matter.</li>
</ul>
<div class="callout idea">Count the <code>new</code> keywords in your business logic. Each one that creates a service (not a plain data object) is a seam you cannot test and a decision you cannot change without editing that file.</div>` }
  ],
  flow: {
    title: 'Picking a creational pattern for a notification feature',
    steps: [
      { title: 'Requirement', desc: 'Send order confirmations by email now, SMS and WhatsApp later. Each channel needs its own client with different settings.' },
      { title: 'Spot the variation', desc: 'The concrete notifier changes per channel and per customer preference, chosen at runtime. That is a Factory Method job.' },
      { title: 'Define the product interface', desc: 'INotifier with SendAsync(message). Each channel implements it. Callers never see concrete classes.' },
      { title: 'Build the factory', desc: 'NotifierFactory.Create(channel) returns the right INotifier. All implementations are registered in DI and looked up by key.' },
      { title: 'Complex message object', desc: 'Messages have subject, body, attachments, priority, retry policy. A fluent MessageBuilder sets them step by step and validates in Build().' },
      { title: 'Shared, expensive client', desc: 'The SMS provider client should be created once. Register it as a Singleton in DI instead of a hand-written static instance.' },
      { title: 'Templates', desc: 'Marketing wants variants of the same message. Keep an immutable record template and clone with "with" (Prototype).' },
      { title: 'Review', desc: 'Adding WhatsApp later = one new class + one registration. No existing code changes. The patterns paid for themselves.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Singleton three ways: naive (broken), Lazy<T>, and DI', code: `using System;
using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;

// 1) NAIVE: not thread-safe. Two threads can both pass the null check.
public class NaiveConfig
{
    private static NaiveConfig? _instance;
    public static NaiveConfig Instance => _instance ??= new NaiveConfig();   // race condition
    private NaiveConfig() { }
}

// 2) Lazy<T>: thread-safe by default, created on first use.
public sealed class AppClock
{
    private static readonly Lazy<AppClock> _lazy = new(() => new AppClock());
    public static AppClock Instance => _lazy.Value;
    private AppClock() { StartedAt = DateTime.UtcNow; }
    public DateTime StartedAt { get; }
}

// 3) DI SINGLETON: the modern default. No static, fully testable.
public interface IRateTable { decimal GetRate(string currency); }

public sealed class CachedRateTable : IRateTable
{
    private readonly Dictionary<string, decimal> _rates = new() { ["USD"] = 83.2m, ["EUR"] = 90.1m };
    public decimal GetRate(string currency) => _rates.TryGetValue(currency, out var r) ? r : 1m;
}

public static class Demo
{
    public static void Main()
    {
        var services = new ServiceCollection();
        services.AddSingleton<IRateTable, CachedRateTable>();   // one instance for the whole app
        var provider = services.BuildServiceProvider();

        var a = provider.GetRequiredService<IRateTable>();
        var b = provider.GetRequiredService<IRateTable>();
        Console.WriteLine(ReferenceEquals(a, b));               // True
        Console.WriteLine(AppClock.Instance.StartedAt == AppClock.Instance.StartedAt); // True
    }
}
// Lifetime rule: a Singleton must not depend on a Scoped service (captive dependency).` },
    { lang: 'csharp', title: 'Factory Method and Abstract Factory', code: `using System;
using System.Collections.Generic;
using System.Linq;

// ---------- Factory Method, simple-factory style: pick ONE product by key ----------
// (The strict Gang of Four form puts Create in a base class and lets subclasses override it.)
public interface INotifier { string Channel { get; } void Send(string to, string msg); }

public class EmailNotifier : INotifier
{
    public string Channel => "email";
    public void Send(string to, string msg) => Console.WriteLine("EMAIL to " + to + ": " + msg);
}
public class SmsNotifier : INotifier
{
    public string Channel => "sms";
    public void Send(string to, string msg) => Console.WriteLine("SMS to " + to + ": " + msg);
}

public class NotifierFactory
{
    private readonly Dictionary<string, INotifier> _byChannel;
    // In ASP.NET Core, IEnumerable<INotifier> is injected automatically
    // when every implementation is registered with AddScoped<INotifier, ...>().
    public NotifierFactory(IEnumerable<INotifier> all) => _byChannel = all.ToDictionary(n => n.Channel);

    public INotifier Create(string channel) =>
        _byChannel.TryGetValue(channel, out var n)
            ? n
            : throw new ArgumentException("No notifier for channel " + channel);
}

// ---------- Abstract Factory: a FAMILY of matching products ----------
public interface IButton { string Render(); }
public interface ITextBox { string Render(); }

public interface IUiFactory          // the abstract factory
{
    IButton CreateButton();
    ITextBox CreateTextBox();
}

public class DarkUiFactory : IUiFactory
{
    public IButton CreateButton() => new DarkButton();
    public ITextBox CreateTextBox() => new DarkTextBox();
}
public class LightUiFactory : IUiFactory
{
    public IButton CreateButton() => new LightButton();
    public ITextBox CreateTextBox() => new LightTextBox();
}
public class DarkButton : IButton   { public string Render() => "[dark button]"; }
public class DarkTextBox : ITextBox { public string Render() => "[dark textbox]"; }
public class LightButton : IButton  { public string Render() => "[light button]"; }
public class LightTextBox : ITextBox{ public string Render() => "[light textbox]"; }

public static class Program
{
    public static void Main()
    {
        var factory = new NotifierFactory(new INotifier[] { new EmailNotifier(), new SmsNotifier() });
        factory.Create("sms").Send("+91-98xxxx", "Your order shipped");

        IUiFactory ui = DateTime.Now.Hour > 18 ? new DarkUiFactory() : new LightUiFactory();
        // Whole screen is consistent because every part comes from the same family.
        Console.WriteLine(ui.CreateButton().Render() + " " + ui.CreateTextBox().Render());
    }
}` },
    { lang: 'csharp', title: 'Fluent Builder with validation, and Prototype with records', code: `using System;
using System.Collections.Generic;

// ---------- Product: immutable, no public setters ----------
public sealed class EmailMessage
{
    public string To { get; }
    public string Subject { get; }
    public string Body { get; }
    public IReadOnlyList<string> Cc { get; }
    public int Priority { get; }

    internal EmailMessage(string to, string subject, string body, List<string> cc, int priority)
    { To = to; Subject = subject; Body = body; Cc = cc; Priority = priority; }

    public override string ToString() => "To " + To + " [" + Subject + "] p=" + Priority + " cc=" + Cc.Count;
}

// ---------- Builder: readable steps, rules checked once in Build() ----------
public sealed class EmailBuilder
{
    private string? _to, _subject, _body;
    private readonly List<string> _cc = new();
    private int _priority = 3;

    public EmailBuilder To(string to)            { _to = to; return this; }
    public EmailBuilder Subject(string s)        { _subject = s; return this; }
    public EmailBuilder Body(string b)           { _body = b; return this; }
    public EmailBuilder Cc(string address)       { _cc.Add(address); return this; }
    public EmailBuilder Urgent()                 { _priority = 1; return this; }

    public EmailMessage Build()
    {
        if (string.IsNullOrWhiteSpace(_to))      throw new InvalidOperationException("To is required");
        if (string.IsNullOrWhiteSpace(_subject)) throw new InvalidOperationException("Subject is required");
        if (_cc.Count > 10)                      throw new InvalidOperationException("Max 10 Cc");
        return new EmailMessage(_to!, _subject!, _body ?? string.Empty, new List<string>(_cc), _priority);
    }
}

// ---------- Prototype: copy an existing object, change a little ----------
public record LaptopSpec(string Model, int RamGb, int SsdGb, string Colour);

public class Enemy
{
    public string Kind = "orc"; public int Hp = 100; public List<string> Loot = new() { "coin" };
    public Enemy ShallowClone() => (Enemy)MemberwiseClone();          // Loot list is SHARED
    public Enemy DeepClone() => new Enemy { Kind = Kind, Hp = Hp, Loot = new List<string>(Loot) };
}

public static class Program
{
    public static void Main()
    {
        var mail = new EmailBuilder().To("ops@example.com").Subject("Disk 90%").Body("Clean up logs").Cc("lead@example.com").Urgent().Build();
        Console.WriteLine(mail);   // To ops@example.com [Disk 90%] p=1 cc=1

        var basic = new LaptopSpec("X1", 16, 512, "black");
        var silver = basic with { Colour = "silver", RamGb = 32 };   // Prototype via record
        Console.WriteLine(silver);  // LaptopSpec { Model = X1, RamGb = 32, SsdGb = 512, Colour = silver }

        var orc = new Enemy();
        var copy = orc.ShallowClone();
        copy.Loot.Add("sword");
        Console.WriteLine(orc.Loot.Count);   // 2  <-- shared list! Use DeepClone when nested data must be independent.
    }
}` }
  ],
  pitfalls: [
    'Writing a static Singleton when the DI container already gives you one per app with AddSingleton. The static version hides the dependency and breaks tests.',
    'Injecting a Scoped service (like DbContext) into a Singleton. The scoped object is captured forever and shared across requests.',
    'Creating a Factory for a type that has one implementation and no planned variants. That is indirection with no benefit.',
    'Builders that allow Build() to succeed with missing required fields. Validate in Build() so an invalid object can never exist.',
    'Assuming MemberwiseClone gives an independent copy. Nested lists and objects are shared; mutate one and both change.',
    'Using new HttpClient() per request instead of IHttpClientFactory, which leads to socket exhaustion under load.'
  ],
  quiz: [
    { q: 'In an ASP.NET Core app, what is the recommended way to get exactly one shared instance of a stateless service?', options: ['A static Instance property', 'services.AddSingleton', 'A global variable', 'ThreadStatic field'], answer: 1, why: 'The DI container guarantees one instance per app and injects it, which keeps the class testable and the dependency visible.' },
    { q: 'You must create matching Button, TextBox and Menu objects for either a dark or light theme. Which pattern fits best?', options: ['Singleton', 'Factory Method', 'Abstract Factory', 'Prototype'], answer: 2, why: 'Abstract Factory produces a family of related objects that are guaranteed to match each other.' },
    { q: 'A constructor has 12 parameters, most optional, with rules between them. Which pattern helps most?', options: ['Factory Method', 'Builder', 'Singleton', 'Abstract Factory'], answer: 1, why: 'A Builder sets options step by step with readable names and validates the combination once in Build().' },
    { q: 'What does MemberwiseClone do with a List field inside the object?', options: ['Copies the list and every item inside it', 'Shares the same list with the original', 'Sets the field to null in the new copy', 'Throws an exception for reference fields'], answer: 1, why: 'MemberwiseClone is a shallow copy: reference fields point to the same objects.' },
    { q: 'Why is a hand-written static Singleton often called an anti-pattern?', options: ['It is slow because static calls skip the JIT', 'It hides global state and is hard to test', 'It uses too much memory for a single object', 'C# does not really support static fields'], answer: 1, why: 'Static state is invisible to callers, cannot be swapped in tests, and its lifetime is not managed.' },
    { q: 'Which .NET type is the practical Factory you should use instead of new HttpClient()?', options: ['HttpClientBuilder', 'IHttpClientFactory', 'WebClient', 'HttpContext'], answer: 1, why: 'IHttpClientFactory manages handler lifetimes and avoids socket exhaustion and stale DNS issues.' }
  ],
  takeaways: [
    'Creational patterns move the decision of which class and how configured into one place.',
    'Prefer DI AddSingleton over hand-written static Singletons; use Lazy<T> if you must write one.',
    'Factory Method creates one product and lets a subclass (or, in the simple-factory style, a key) pick the class; Abstract Factory builds a matching family.',
    'Builder makes complex construction readable and validates before the object exists.',
    'Prototype copies existing objects; records with the with-expression are the C# way, and beware shallow copies.',
    'Add a pattern when a second variant appears, not before.'
  ],
  interview: [
    { q: 'Explain Singleton and why DI is preferred in .NET.', a: '<p>Singleton ensures one instance of a class. A hand-written one uses a static field, which hides global state, complicates tests and threading. In .NET, registering with AddSingleton gives the same guarantee while keeping the dependency injected, visible and swappable in tests. If you must write one, use Lazy&lt;T&gt; for thread safety.</p>' },
    { q: 'Factory Method vs Abstract Factory?', a: '<p>Factory Method creates one product and lets a method or subclass decide the concrete type. Abstract Factory is an interface with several creation methods that produce a family of related products that must be used together. Switching the abstract factory switches the whole family.</p>' },
    { q: 'When is a Builder better than object initialisers?', a: '<p>When construction has rules across fields, required ordering, derived values, or must produce an immutable object that is validated before it exists. For plain data with independent optional fields, object initialisers with required and init members are enough.</p>' },
    { q: 'What is a captive dependency?', a: '<p>When a longer-lived service (Singleton) holds a reference to a shorter-lived one (Scoped or Transient). The short-lived object is kept alive beyond its intended lifetime and shared across requests, which causes data leaks and thread-safety bugs. A service may only depend on services with equal or longer lifetimes.</p>' }
  ]
};

/* ───────────────────────── m3-patterns-structural ───────────────────────── */
window.CONTENT['m3-patterns-structural'] = {
  hook: `You rarely get to rewrite the classes you have. Structural patterns are how you make existing pieces fit together without touching them.`,
  intro: `<p><span class="term">Structural patterns</span> are about <em>how objects are connected</em>. Creational patterns decide how objects are born; structural patterns decide how they stand next to each other: who wraps whom, who delegates to whom, how a mismatch between two shapes is bridged.</p>
<p>The seven classic ones are Adapter (make a foreign interface fit yours), Decorator (add behaviour by wrapping), Facade (one simple door to a messy subsystem), Proxy (a stand-in that controls access), Composite (treat one item and a group the same way), Bridge (separate what from how so both can change), and Flyweight (share the heavy common part of many small objects).</p>
<p>Most of them are variations of one trick: an object that holds another object with the same interface and forwards calls, adding something along the way. Once you see that trick, the names stop being scary. .NET uses them everywhere: <code>GZipStream</code> wraps a <code>Stream</code> (Decorator), ASP.NET Core middleware is a chain of decorators, <code>string</code> interning is Flyweight, and EF Core lazy-loading proxies are Proxies.</p>`,
  realLife: {
    title: 'Travelling abroad with your phone charger',
    body: `<p>Your Indian charger plug does not fit a UK wall socket. You buy a travel <strong>adapter</strong>: it changes the shape, not the electricity. Your phone case with a built-in battery is a <strong>decorator</strong>: same phone, more capability, and you can stack another case on top. The hotel concierge is a <strong>facade</strong>: one person who books taxis, restaurants and tours so you never deal with twelve phone numbers. Your travel agent is a <strong>proxy</strong>: they stand between you and the airline, check your passport before letting you book, and cache seat maps so they do not call the airline for every question. A folder on your laptop that contains files and other folders is a <strong>composite</strong>: "delete" works the same on a file and a folder. And every text message you send shares the same font file instead of carrying its own copy: a <strong>flyweight</strong>.</p>
<p>At real companies: payment teams write adapters so five bank APIs look like one interface; API gateways are facades; caching proxies sit in front of slow services; UI trees (Angular components, HTML DOM) are composites; and game engines use flyweights for thousands of identical trees or bullets.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>One trick, many names</h4>
<p>Picture a box that holds another box and has the same buttons on the outside. When you press a button, the outer box may do something extra, then presses the same button on the inner box. Decorator, Proxy and Adapter are all this picture, differing only in <em>why</em> the outer box exists.</p>
<table><thead><tr><th>Pattern</th><th>Why the wrapper exists</th><th>Same interface as inner?</th><th>Everyday picture</th></tr></thead><tbody>
<tr><td>Adapter</td><td>Inner has the wrong shape</td><td>No, it converts</td><td>Travel plug</td></tr>
<tr><td>Decorator</td><td>Add behaviour, stackable</td><td>Yes</td><td>Phone battery case</td></tr>
<tr><td>Proxy</td><td>Control access: lazy, cache, permission</td><td>Yes</td><td>Travel agent</td></tr>
<tr><td>Facade</td><td>Hide many objects behind one simple API</td><td>New, simpler</td><td>Hotel concierge</td></tr>
<tr><td>Composite</td><td>Treat one and many the same</td><td>Yes, tree</td><td>Folders and files</td></tr>
<tr><td>Bridge</td><td>Split abstraction from implementation</td><td>Two hierarchies</td><td>Remote control and TV brand</td></tr>
<tr><td>Flyweight</td><td>Share heavy common data</td><td>n/a</td><td>One font file for all messages</td></tr>
</tbody></table>
<h4>Adapter</h4>
<p>You have an <code>IPaymentGateway</code> interface. A new bank gives you a class with different method names and shapes. You do not change the bank's class (you cannot) and you do not change your code (you should not). You write a small <code>BankXAdapter : IPaymentGateway</code> that translates calls.</p>
<h4>Decorator</h4>
<p>You want logging around a repository, then caching, then retries. Instead of editing the repository, you wrap it: <code>new RetryRepo(new CachingRepo(new LoggingRepo(realRepo)))</code>. Each wrapper has the same interface and forwards to the next. Remove one by not wrapping.</p>
<h4>Facade</h4>
<p>Placing an order touches inventory, pricing, payment and shipping. A <code>CheckoutFacade.PlaceOrder()</code> calls them in the right order so the controller makes one call. The subsystems still exist; the facade just hides the choreography.</p>
<div class="callout tip">If you remember only one thing: wrapping is cheaper than editing. Wrappers let you add behaviour to code you do not own, and remove it again by unwrapping.</div>` },
    { name: 'Intermediate', body: `<h4>Decorators in .NET you already use</h4>
<p><code>Stream</code> is the textbook example. <code>FileStream</code> reads bytes. Wrap it in <code>GZipStream</code> and you read compressed bytes. Wrap that in <code>BufferedStream</code> and you read fewer times. Every layer is a Stream wrapping a Stream. (A <code>StreamReader</code> on top turns the bytes into text. It wraps a Stream too, but it is a <code>TextReader</code>, not a Stream.)</p>
<p>ASP.NET Core <strong>middleware</strong> is Decorator applied to request handling: each middleware receives the next delegate, does something before, calls next, does something after. Authentication, logging, compression and exception handling are all decorators around the endpoint. (It is also a Chain of Responsibility, which you will meet in behavioral patterns; the two overlap.)</p>
<p>With DI, you can register a decorator by hand: register the real repository, then register the interface as a factory that wraps it. Libraries like Scrutor add a <code>Decorate&lt;IRepo, CachingRepo&gt;()</code> helper.</p>
<h4>Proxy flavours</h4>
<ul>
<li><strong>Virtual proxy</strong>: delay creating an expensive object until first use. <code>Lazy&lt;T&gt;</code> is a tiny one.</li>
<li><strong>Caching proxy</strong>: remember results. A memory-cached repository is a proxy.</li>
<li><strong>Protection proxy</strong>: check permissions before forwarding.</li>
<li><strong>Remote proxy</strong>: a local object that talks to a service over the network. gRPC-generated clients and <code>HttpClient</code> wrappers are remote proxies. EF Core lazy-loading proxies are virtual proxies for navigation properties.</li>
</ul>
<p>Proxy and Decorator have the same shape. The difference is intent: a Decorator adds behaviour the caller wants; a Proxy controls <em>access</em> to the real object, often invisibly.</p>
<h4>Composite</h4>
<p>Define one interface (<code>IFileSystemItem { long Size(); }</code>). A <code>File</code> returns its size. A <code>Folder</code> holds a list of items and returns the sum. The caller asks for <code>Size()</code> without caring whether it holds a file or a tree of a million files. UI trees, organisation charts, expression trees and menu systems are all composites.</p>
<h4>Bridge</h4>
<p>Suppose you have shapes (circle, square) and renderers (SVG, Canvas). Inheritance would need CircleSvg, CircleCanvas, SquareSvg, SquareCanvas: a class explosion. Bridge gives <code>Shape</code> a reference to an <code>IRenderer</code>. Now shapes and renderers grow independently: 3 shapes + 2 renderers = 5 classes instead of 6, and 10 + 10 = 20 instead of 100.</p>
<h4>Flyweight</h4>
<p>When you have thousands of objects that share heavy data (font glyphs, tile textures, tree models in a forest), keep the shared part (<em>intrinsic</em> state) in one object and pass the varying part (<em>extrinsic</em>: position, colour) as parameters. .NET string interning (<code>string.Intern</code>) and the shared <code>char</code> cache in some runtimes are flyweights.</p>
<div class="callout warn">Decorator chains can be hard to debug: a stack trace shows six wrappers before the real call. Name wrappers clearly and keep each one small.</div>` },
    { name: 'Expert', body: `<h4>Decorator vs inheritance at scale</h4>
<p>Decorators give you combinatorial behaviour at runtime without a class per combination. With 4 cross-cutting concerns (logging, caching, retry, metrics) inheritance would need up to 16 classes to cover every mix; decorators need 4. The cost is indirection and the loss of identity: <code>repo is SqlRepo</code> is false once wrapped, and reflection-based code may break. Keep decorators stateless or make their state thread-safe when the inner object is a singleton.</p>
<h4>Facade as a boundary</h4>
<p>A Facade is the natural place for a <em>module boundary</em> in a modular monolith: the facade is the only public type of the module, everything behind it is internal. This gives you microservice-like boundaries without network calls, and it makes extracting a service later a mechanical change. Facades should be thin: orchestration only, no business rules.</p>
<h4>Proxy and transparency</h4>
<p>Transparent proxies (the caller cannot tell) are powerful and dangerous. EF Core lazy-loading proxies look like plain navigation properties but trigger a database query on access, which creates N+1 query problems in loops. Remote proxies hide latency and partial failure; a method that looks local can time out. Senior engineers make the cost visible: async signatures, explicit <code>Include</code>, cancellation tokens.</p>
<h4>Composite and the Visitor connection</h4>
<p>Composites are trees, and operations on trees multiply: size, render, validate, export. Adding each as a method on every node class bloats the hierarchy. The Visitor pattern (behavioral) moves operations out of the tree. In C#, pattern matching with <code>switch</code> expressions over a <em>sealed</em> set of node records is often the simpler visitor.</p>
<h4>Bridge and dependency injection</h4>
<p>Bridge is what you get naturally when a class takes an interface in its constructor and both sides have multiple implementations. In DI-based code you often have Bridges without naming them. Name it in design discussions when two axes of variation show up ("notification type" and "delivery provider"), because it stops people from building a NxM class grid.</p>
<h4>Flyweight and memory</h4>
<p>Flyweight is a memory pattern. Profile first: measure object counts and sizes with a memory profiler. Then split intrinsic from extrinsic state, intern the intrinsic part through a factory with a dictionary, and make it immutable so sharing is safe. <code>ArrayPool&lt;T&gt;</code> and <code>ObjectPool&lt;T&gt;</code> are cousins (pooling) that reduce allocations for short-lived objects.</p>
<div class="callout idea">Interview framing: "Which structural pattern would you use to add caching to a third-party SDK you cannot modify?" Answer: an Adapter to fit your interface, then a caching Proxy/Decorator around the adapter, injected through DI so tests can skip the cache.</div>` }
  ],
  flow: {
    title: 'Adding caching and logging to a third-party weather SDK',
    steps: [
      { title: 'Foreign shape', desc: 'The vendor SDK exposes FetchJson(cityCode) returning a raw string. Your app wants IWeatherService.GetTempAsync(city).' },
      { title: 'Adapter', desc: 'VendorWeatherAdapter : IWeatherService translates city names to codes, calls FetchJson, parses the JSON. Your code never sees the SDK.' },
      { title: 'Decorator: logging', desc: 'LoggingWeatherService wraps any IWeatherService, logs the call and duration, then forwards.' },
      { title: 'Proxy: caching', desc: 'CachedWeatherService wraps the logger, returns a remembered answer for 10 minutes, otherwise forwards.' },
      { title: 'Compose in DI', desc: 'Register the adapter, then wrap it: cache(log(adapter)). Controllers only depend on IWeatherService.' },
      { title: 'Facade for the UI', desc: 'DashboardFacade.GetHomeData() calls weather, news and calendar services so the page controller makes one call.' },
      { title: 'Swap or remove', desc: 'A new vendor? New adapter. Debugging the cache? Unwrap it in tests. Nothing else changes.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Adapter + Decorator + Proxy around one interface', code: `using System;
using System.Collections.Concurrent;
using System.Diagnostics;
using System.Threading.Tasks;

// What OUR app wants
public interface IWeatherService { Task<double> GetTempAsync(string city); }

// Third-party SDK we cannot change (different shape)
public sealed class VendorSdk
{
    public string FetchJson(int cityCode) => "{\\"temp\\":" + (20 + cityCode % 10) + "}";
}

// ---------- ADAPTER: converts the foreign shape to ours ----------
public sealed class VendorWeatherAdapter : IWeatherService
{
    private readonly VendorSdk _sdk;
    public VendorWeatherAdapter(VendorSdk sdk) => _sdk = sdk;

    public Task<double> GetTempAsync(string city)
    {
        int code = city.ToLowerInvariant() switch { "pune" => 11, "delhi" => 12, _ => 10 };
        string json = _sdk.FetchJson(code);
        // Real code: System.Text.Json. Kept tiny here.
        double temp = double.Parse(json.Split(':')[1].TrimEnd('}'));
        return Task.FromResult(temp);
    }
}

// ---------- DECORATOR: same interface, adds logging, forwards ----------
public sealed class LoggingWeatherService : IWeatherService
{
    private readonly IWeatherService _inner;
    public LoggingWeatherService(IWeatherService inner) => _inner = inner;

    public async Task<double> GetTempAsync(string city)
    {
        var sw = Stopwatch.StartNew();
        var result = await _inner.GetTempAsync(city);
        Console.WriteLine("weather(" + city + ") = " + result + " in " + sw.ElapsedMilliseconds + "ms");
        return result;
    }
}

// ---------- PROXY: controls access (here: caching) ----------
public sealed class CachedWeatherService : IWeatherService
{
    private readonly IWeatherService _inner;
    private readonly ConcurrentDictionary<string, (double temp, DateTime at)> _cache = new();
    private readonly TimeSpan _ttl = TimeSpan.FromMinutes(10);
    public CachedWeatherService(IWeatherService inner) => _inner = inner;

    public async Task<double> GetTempAsync(string city)
    {
        if (_cache.TryGetValue(city, out var hit) && DateTime.UtcNow - hit.at < _ttl)
            return hit.temp;                                   // served without touching the inner service
        var temp = await _inner.GetTempAsync(city);
        _cache[city] = (temp, DateTime.UtcNow);
        return temp;
    }
}

public static class Program
{
    public static async Task Main()
    {
        // Compose: cache( log( adapter(sdk) ) ). In ASP.NET Core do this in DI registration.
        IWeatherService svc = new CachedWeatherService(new LoggingWeatherService(new VendorWeatherAdapter(new VendorSdk())));
        Console.WriteLine(await svc.GetTempAsync("Pune"));   // logs, 21
        Console.WriteLine(await svc.GetTempAsync("Pune"));   // no log line: cache hit
    }
}` },
    { lang: 'csharp', title: 'Facade over a messy checkout subsystem, and DI registration of decorators', code: `using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

// Subsystems (each has its own complexity)
public class InventoryService { public Task<bool> ReserveAsync(int sku, int qty) { Console.WriteLine("reserve " + sku); return Task.FromResult(true); } }
public class PricingService   { public decimal Quote(int sku, int qty) => 499m * qty; }
public class PaymentService   { public Task<string> ChargeAsync(decimal amount) { Console.WriteLine("charge " + amount); return Task.FromResult("TXN-1"); } }
public class ShippingService  { public Task ScheduleAsync(int sku, string address) { Console.WriteLine("ship " + sku + " to " + address); return Task.CompletedTask; } }

// ---------- FACADE: one simple door, orchestration only ----------
public class CheckoutFacade
{
    private readonly InventoryService _inv; private readonly PricingService _price;
    private readonly PaymentService _pay;  private readonly ShippingService _ship;

    public CheckoutFacade(InventoryService inv, PricingService price, PaymentService pay, ShippingService ship)
    { _inv = inv; _price = price; _pay = pay; _ship = ship; }

    public async Task<string> PlaceOrderAsync(int sku, int qty, string address)
    {
        if (!await _inv.ReserveAsync(sku, qty)) throw new InvalidOperationException("Out of stock");
        var total = _price.Quote(sku, qty);
        var txn = await _pay.ChargeAsync(total);
        await _ship.ScheduleAsync(sku, address);
        return txn;
    }
}

// ---------- Registering a decorator chain in DI (no extra library) ----------
public interface IRepo { string Get(int id); }
public class SqlRepo : IRepo { public string Get(int id) => "row " + id; }
public class LoggingRepo : IRepo
{
    private readonly IRepo _inner; public LoggingRepo(IRepo inner) => _inner = inner;
    public string Get(int id) { Console.WriteLine("get " + id); return _inner.Get(id); }
}

public static class Program
{
    public static async Task Main()
    {
        var services = new ServiceCollection();
        services.AddSingleton<InventoryService>(); services.AddSingleton<PricingService>();
        services.AddSingleton<PaymentService>();   services.AddSingleton<ShippingService>();
        services.AddSingleton<CheckoutFacade>();

        services.AddSingleton<SqlRepo>();
        services.AddSingleton<IRepo>(sp => new LoggingRepo(sp.GetRequiredService<SqlRepo>()));  // wrap here
        // With the Scrutor package this is: services.Decorate<IRepo, LoggingRepo>();

        var sp = services.BuildServiceProvider();
        var txn = await sp.GetRequiredService<CheckoutFacade>().PlaceOrderAsync(42, 2, "Pune");
        Console.WriteLine(txn);                                // TXN-1
        Console.WriteLine(sp.GetRequiredService<IRepo>().Get(7));  // "get 7" then "row 7"
    }
}` },
    { lang: 'csharp', title: 'Composite (file tree), Bridge (shapes x renderers), Flyweight (shared glyphs)', code: `using System;
using System.Collections.Generic;

// ---------- COMPOSITE ----------
public interface IFsItem { string Name { get; } long Size(); void Print(string indent); }

public sealed class FileItem : IFsItem
{
    public string Name { get; } private readonly long _bytes;
    public FileItem(string name, long bytes) { Name = name; _bytes = bytes; }
    public long Size() => _bytes;
    public void Print(string indent) => Console.WriteLine(indent + Name + " (" + _bytes + ")");
}
public sealed class Folder : IFsItem
{
    public string Name { get; } private readonly List<IFsItem> _children = new();
    public Folder(string name) => Name = name;
    public Folder Add(IFsItem item) { _children.Add(item); return this; }
    public long Size() { long s = 0; foreach (var c in _children) s += c.Size(); return s; }   // recursion over the tree
    public void Print(string indent) { Console.WriteLine(indent + Name + "/ (" + Size() + ")"); foreach (var c in _children) c.Print(indent + "  "); }
}

// ---------- BRIDGE ----------
public interface IRenderer { string Circle(double r); string Square(double s); }
public sealed class SvgRenderer : IRenderer
{
    public string Circle(double r) => "<circle r='" + r + "'/>";
    public string Square(double s) => "<rect width='" + s + "'/>";
}
public sealed class TextRenderer : IRenderer
{
    public string Circle(double r) => "circle radius " + r;
    public string Square(double s) => "square side " + s;
}
public abstract class Shape          // abstraction holds a reference to the implementation
{
    protected readonly IRenderer R;
    protected Shape(IRenderer r) => R = r;
    public abstract string Draw();
}
public sealed class Circle : Shape { private readonly double _r; public Circle(IRenderer r, double rad) : base(r) => _r = rad; public override string Draw() => R.Circle(_r); }
public sealed class Square : Shape { private readonly double _s; public Square(IRenderer r, double s) : base(r) => _s = s; public override string Draw() => R.Square(_s); }

// ---------- FLYWEIGHT ----------
public sealed class Glyph                  // intrinsic (shared) state: heavy
{
    public char Char { get; } public byte[] Outline { get; }
    public Glyph(char c) { Char = c; Outline = new byte[2048]; }   // pretend: expensive font data
}
public static class GlyphFactory
{
    private static readonly Dictionary<char, Glyph> _pool = new();
    public static Glyph Get(char c) { if (!_pool.TryGetValue(c, out var g)) { g = new Glyph(c); _pool[c] = g; } return g; }
    public static int PoolSize => _pool.Count;
}
public readonly record struct PlacedChar(Glyph Glyph, int X, int Y);   // extrinsic state: light

public static class Program
{
    public static void Main()
    {
        var root = new Folder("src").Add(new FileItem("a.cs", 120)).Add(new Folder("lib").Add(new FileItem("b.cs", 300)).Add(new FileItem("c.cs", 80)));
        root.Print("");                 // src/ (500) ... lib/ (380) ...

        Shape[] shapes = { new Circle(new SvgRenderer(), 2), new Square(new TextRenderer(), 3) };
        foreach (var s in shapes) Console.WriteLine(s.Draw());

        var text = "hello hello hello";
        var placed = new List<PlacedChar>();
        for (int i = 0; i < text.Length; i++) placed.Add(new PlacedChar(GlyphFactory.Get(text[i]), i * 10, 0));
        Console.WriteLine(placed.Count + " chars share " + GlyphFactory.PoolSize + " glyphs");   // 17 chars share 5 glyphs
    }
}` }
  ],
  pitfalls: [
    'Confusing Adapter with Decorator. Adapter changes the interface; Decorator keeps it and adds behaviour.',
    'Letting a Facade grow business rules. A facade orchestrates; rules belong in the services behind it.',
    'Stacking so many decorators that stack traces and performance suffer. Keep each wrapper small and named for what it does.',
    'Hidden costs behind transparent proxies, such as EF Core lazy loading triggering a query per loop iteration (N+1).',
    'Using Flyweight before measuring. It adds complexity; only worth it when a profiler shows thousands of duplicated objects.',
    'Making decorators stateful without thread safety when the wrapped service is a singleton used by many requests.'
  ],
  quiz: [
    { q: 'A vendor SDK has method FetchJson(int) but your app expects IWeatherService.GetTempAsync(string). Which pattern bridges the gap?', options: ['Decorator', 'Adapter', 'Facade', 'Flyweight'], answer: 1, why: 'Adapter converts one interface into another so existing code can work with a class it was not written for.' },
    { q: 'GZipStream wrapping a FileStream, both being Streams, is an example of which pattern?', options: ['Proxy', 'Composite', 'Decorator', 'Bridge'], answer: 2, why: 'Decorator keeps the same interface and adds behaviour (compression) by wrapping, and wrappers can stack.' },
    { q: 'Which pattern lets you call Size() on a single file or a whole folder tree the same way?', options: ['Composite', 'Facade', 'Adapter', 'Proxy'], answer: 0, why: 'Composite gives leaves and containers the same interface so callers treat one and many uniformly.' },
    { q: 'You have 10 shapes and 10 rendering backends. Which pattern avoids writing 100 classes?', options: ['Flyweight', 'Bridge', 'Singleton', 'Decorator'], answer: 1, why: 'Bridge separates the abstraction (shape) from the implementation (renderer) so each can vary independently: 10 + 10 classes.' },
    { q: 'What is the main difference in intent between Proxy and Decorator?', options: ['Proxy changes the interface; Decorator keeps it', 'Decorator controls access; Proxy adds features', 'Proxy controls access; Decorator adds behaviour', 'There is no difference in code or intent'], answer: 2, why: 'They share the same shape. Proxy exists to control access (lazy, cache, permission, remote); Decorator exists to add responsibilities.' },
    { q: 'Thousands of characters on screen share one Glyph object per distinct letter. Which pattern is this?', options: ['Prototype', 'Flyweight', 'Facade', 'Composite'], answer: 1, why: 'Flyweight shares the heavy intrinsic state and passes light extrinsic state (position) separately.' }
  ],
  takeaways: [
    'Most structural patterns are a wrapper that holds an object with the same interface and forwards calls.',
    'Adapter converts shape; Decorator adds behaviour; Proxy controls access; Facade simplifies.',
    'Composite lets one item and a tree of items share an interface.',
    'Bridge prevents class explosions when two things vary independently.',
    'Flyweight shares heavy common data; measure before using it.',
    'ASP.NET Core middleware and .NET Streams are decorators you use every day.'
  ],
  interview: [
    { q: 'How would you add caching to a repository without modifying it?', a: '<p>Write a CachingRepository that implements the same interface, holds the real repository, checks a cache first and forwards on a miss. Register it in DI so the real one is wrapped. This is a caching Proxy (or Decorator). Tests can inject the unwrapped repository.</p>' },
    { q: 'Is ASP.NET Core middleware a Decorator or a Chain of Responsibility?', a: '<p>Both descriptions fit. Each middleware wraps the next delegate and can run code before and after it (Decorator). Each can also decide to stop the chain and handle the request itself (Chain of Responsibility). Interviewers accept either if you explain the mechanism: a pipeline of RequestDelegate functions built at startup.</p>' },
    { q: 'When is a Facade a bad idea?', a: '<p>When it starts holding business logic, becoming a god class in disguise, or when it hides failures of subsystems so callers cannot react. A facade should orchestrate, stay thin, and surface errors clearly.</p>' },
    { q: 'Explain Bridge with a real example from your stack.', a: '<p>A NotificationSender abstraction (order shipped, password reset) that holds an IMessageChannel implementation (email, SMS, push). New notification types and new channels are added independently, each as one class. Without Bridge, each combination would need its own class.</p>' }
  ]
};

/* ───────────────────────── m3-patterns-behavioral ───────────────────────── */
window.CONTENT['m3-patterns-behavioral'] = {
  hook: `Every big if/else about "what should happen next" is a behavioral pattern waiting to be named.`,
  intro: `<p><span class="term">Behavioral patterns</span> are about <em>how objects talk to each other and share work</em>. Creational patterns build objects; structural patterns connect them; behavioral patterns decide who does what, in which order, and how they tell each other.</p>
<p>This topic covers the nine you will actually meet: Strategy (swap an algorithm), Observer (tell everyone who cares), Command (turn an action into an object), State (behaviour changes with state), Template Method (fixed skeleton, flexible steps), Chain of Responsibility (pass along until someone handles it), Iterator (walk a collection without knowing its insides), Mediator (talk through a hub) and Visitor (add operations to a tree without changing it).</p>
<p>C# has language support for several of them, which is why they feel invisible: <code>event</code> and <code>IObservable&lt;T&gt;</code> are Observer, <code>IEnumerable&lt;T&gt;</code> with <code>yield return</code> is Iterator, <code>Func&lt;&gt;</code> delegates are tiny Strategies, and ASP.NET Core middleware is a Chain of Responsibility. The MediatR library that many .NET teams use for CQRS is a Mediator.</p>`,
  realLife: {
    title: 'A food delivery app, behind the scenes',
    body: `<p>Open a food delivery app. The delivery fee is calculated differently on rainy days, at peak hours, or for premium members: the app swaps the pricing rule, which is <strong>Strategy</strong>. When your order status changes, the rider app, your phone and the restaurant screen all update: <strong>Observer</strong>. "Cancel order" is a button that can be queued, retried, logged and undone: <strong>Command</strong>. An order moves from Placed to Accepted to Cooking to Delivered, and "cancel" means something different in each stage: <strong>State</strong>. Every restaurant onboarding follows the same checklist with different details per cuisine: <strong>Template Method</strong>. A refund request goes to the bot, then a junior agent, then a manager, until someone can approve it: <strong>Chain of Responsibility</strong>. The rider, restaurant and customer do not call each other directly; everything goes through the dispatch system: <strong>Mediator</strong>.</p>
<p>At real companies: ride-hailing pricing engines are Strategy; stock trading platforms are Observer-heavy; text editors and banking systems use Command for undo and audit; order and subscription services are state machines; approval workflows are chains; and large .NET backends use MediatR as a mediator between controllers and handlers.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The nine in one table</h4>
<table><thead><tr><th>Pattern</th><th>Question it answers</th><th>Everyday picture</th><th>C# / .NET form</th></tr></thead><tbody>
<tr><td>Strategy</td><td>Which algorithm now?</td><td>Pick a route: fastest, cheapest, scenic</td><td>Interface + DI, or Func&lt;&gt;</td></tr>
<tr><td>Observer</td><td>Who needs to know this happened?</td><td>Subscribe to a YouTube channel</td><td>event, IObservable, Rx</td></tr>
<tr><td>Command</td><td>Can I store, queue or undo this action?</td><td>Restaurant order ticket</td><td>ICommand objects, MediatR requests</td></tr>
<tr><td>State</td><td>What does "do X" mean in this state?</td><td>Traffic light</td><td>State classes or switch on enum</td></tr>
<tr><td>Template Method</td><td>Same steps, different details?</td><td>Recipe with "add your filling"</td><td>abstract base with virtual hooks</td></tr>
<tr><td>Chain of Responsibility</td><td>Who handles this request?</td><td>Customer support escalation</td><td>Middleware pipeline</td></tr>
<tr><td>Iterator</td><td>How do I walk this without knowing its insides?</td><td>Flipping pages</td><td>IEnumerable, yield return</td></tr>
<tr><td>Mediator</td><td>How do many objects talk without a tangle?</td><td>Air traffic control</td><td>MediatR, a hub class</td></tr>
<tr><td>Visitor</td><td>How do I add operations to a tree?</td><td>Tax inspector visiting each shop</td><td>Accept/Visit, or pattern matching</td></tr>
</tbody></table>
<h4>Strategy, the one you will use most</h4>
<p>You have a method with a big <code>if</code> choosing between ways of doing the same job (shipping cost by carrier, discount by customer type). Put each way in its own class behind one interface. The caller receives the strategy and calls it. New way = new class.</p>
<h4>Observer: events</h4>
<p>One object changes; others want to react without the first one knowing who they are. In C# you declare an <code>event</code>, others subscribe with <code>+=</code>, and you raise it. The publisher never references the subscribers' types.</p>
<h4>Command: actions as objects</h4>
<p>Instead of calling <code>Cancel()</code> directly, you create a <code>CancelOrderCommand</code> object. Because it is an object, you can put it in a queue, log it, retry it, or keep it in a list to undo it later.</p>
<h4>State: behaviour that depends on where you are</h4>
<p>An order's <code>Cancel()</code> is allowed when Placed, refunds money when Paid, and is impossible when Delivered. Instead of a growing <code>switch</code> inside every method, give each state its own class that knows what each action means.</p>
<div class="callout tip">Most behavioral patterns replace a conditional. When you see a switch on the same enum in five methods, that is State. When you see a switch choosing an algorithm, that is Strategy. When you see a switch choosing a handler, that is Chain of Responsibility.</div>` },
    { name: 'Intermediate', body: `<h4>Strategy with DI</h4>
<p>Register all <code>IDiscountStrategy</code> implementations, inject <code>IEnumerable&lt;IDiscountStrategy&gt;</code> and select by a key or by a <code>CanApply(context)</code> method. For tiny strategies, a <code>Func&lt;Order, decimal&gt;</code> is enough; the interface version is better when strategies need their own dependencies.</p>
<h4>Observer: events vs IObservable</h4>
<ul>
<li><code>event</code>: simple, synchronous, in-process. Beware of memory leaks: a subscriber that never unsubscribes keeps itself alive as long as the publisher lives.</li>
<li><code>IObservable&lt;T&gt;</code> / Reactive Extensions (Rx): streams of events with operators (filter, throttle, combine). Angular developers know this as RxJS.</li>
<li>Across services, Observer becomes publish/subscribe over a message broker (Kafka, RabbitMQ, Azure Service Bus).</li>
</ul>
<h4>Command and CQRS</h4>
<p>In many .NET backends, every request becomes a command or query object (<code>CreateOrderCommand</code>) handled by one handler class. MediatR dispatches them. Benefits: thin controllers, one handler per use case, easy cross-cutting behaviours (validation, logging, transactions) through pipeline behaviours. Undo is implemented by storing the inverse command or a memento of the previous state.</p>
<h4>State machines</h4>
<p>For small cases, an enum and a transition table (<code>Dictionary&lt;(State, Trigger), State&gt;</code>) is clean. For rich behaviour per state, use State classes. Libraries like Stateless give you a declarative state machine with guards and entry/exit actions. Always make illegal transitions throw clearly; silent wrong states are the worst bugs.</p>
<h4>Template Method vs Strategy</h4>
<p>Template Method uses <em>inheritance</em>: a base class defines the skeleton (<code>Import()</code> calls <code>Open()</code>, <code>Parse()</code>, <code>Save()</code>) and children override steps. Strategy uses <em>composition</em>: the varying step is an injected object. Prefer Strategy when steps vary independently or need testing in isolation; Template Method is fine for a small, stable family.</p>
<h4>Chain of Responsibility</h4>
<p>Each handler holds the next. It either handles the request or passes it on. ASP.NET Core middleware, authorization handlers and exception filters are chains. Build chains at startup, keep handlers stateless, and make sure something at the end handles the "nobody handled it" case.</p>
<h4>Iterator and yield</h4>
<p><code>yield return</code> turns a method into a lazy iterator: items are produced one at a time, only when asked. This lets you walk huge files or infinite sequences with constant memory, and compose with LINQ. Remember that each <code>foreach</code> re-runs the method; cache with <code>ToList()</code> if you need to enumerate twice.</p>
<h4>Mediator</h4>
<p>When N objects all call each other, you get N² links. A mediator is one hub they all talk to. In UI code, the form or component is the mediator between its controls. In backends, MediatR routes requests to handlers and notifications to many handlers. The cost: the hub can become a god object if it holds logic instead of routing.</p>
<h4>Visitor</h4>
<p>Visitor adds operations (export, validate, price) to a fixed set of node types without editing them: each node has <code>Accept(visitor)</code> that calls <code>visitor.Visit(this)</code>. In modern C#, a <code>switch</code> expression with type patterns over a sealed set of records often replaces the ceremony and is easier to read.</p>
<div class="callout warn">Event handlers that throw will break the publisher's raising code and may skip later subscribers. Wrap handler bodies, or use a dispatcher that isolates failures.</div>` },
    { name: 'Expert', body: `<h4>Strategy selection and the Open/Closed boundary</h4>
<p>The classic smell is a strategy <em>selector</em> that is itself a growing switch. Push selection into the strategies (<code>bool CanHandle(ctx)</code> plus an ordered list) or into configuration (a dictionary from key to type), so adding a strategy touches only the new class and a registration line. For performance-sensitive loops, resolve the strategy once outside the loop; virtual calls are cheap but DI lookups per iteration are not.</p>
<h4>Observer at scale: delivery guarantees</h4>
<p>In-process events are synchronous and lost on crash. Once observers live in other services, you face the real questions: at-least-once vs at-most-once delivery, ordering, idempotent handlers, and the <em>outbox pattern</em> (write the event in the same transaction as the data, publish it afterwards) to avoid dual-write inconsistencies. Interviewers love this escalation from <code>event</code> to Kafka.</p>
<h4>Command sourcing and event sourcing</h4>
<p>Storing commands gives an audit log and replay; storing resulting <em>events</em> (event sourcing) gives the full history of state and lets you rebuild projections. Both rely on Command objects being serialisable and immutable. Undo in collaborative systems is not a simple inverse; it needs conflict rules.</p>
<h4>State machines and correctness</h4>
<p>Explicit state machines make illegal states unrepresentable, which is the heart of domain-driven design aggregates. Model transitions as a table, test the table exhaustively (every state × every trigger), and version the machine when business rules change so old persisted entities still load. Long-running workflows (order fulfilment across days) move to durable orchestrators (Azure Durable Functions, Temporal) that persist state between steps.</p>
<h4>Chain vs pipeline vs middleware</h4>
<p>Chains that <em>stop</em> at the first handler are routing (a refund approval chain, or middleware that short-circuits the request). Chains that <em>all run</em> are pipelines (MediatR behaviours: validation → logging → transaction → handler). Order matters and must be explicit. Document it, and test the composition, not just each link.</p>
<h4>Iterator internals</h4>
<p>The compiler turns a <code>yield</code> method into a state machine class with <code>MoveNext()</code>. Side effects inside run lazily, exceptions surface on enumeration, not on call, and <code>IAsyncEnumerable&lt;T&gt;</code> brings the same to async streams (ideal for streaming LLM tokens or database rows).</p>
<h4>Mediator critique</h4>
<p>MediatR-style mediation gives uniform cross-cutting behaviour and thin controllers, but at the cost of indirection: "where is this handled?" requires tooling. Keep handlers discoverable by naming convention and folder structure, and do not route trivial in-process calls through the mediator just for uniformity.</p>
<h4>Visitor and double dispatch</h4>
<p>Visitor exists because C# dispatches on the runtime type of the receiver only (single dispatch). <code>Accept</code> + <code>Visit</code> achieves double dispatch. Pattern matching over a small, closed set of node types is often the better engineering choice today. One catch: C# cannot prove that a class hierarchy is closed, so the compiler does not check that a type switch covers every node type. Keep a default arm that throws, as the code below does. A classic Visitor does give a compile error in every visitor when a new node type is added.</p>
<div class="callout idea">Interview framing: pick one real feature you built and name three behavioral patterns inside it. Concrete beats textbook every time.</div>` }
  ],
  flow: {
    title: 'An order travels through behavioral patterns',
    steps: [
      { title: 'Request arrives', desc: 'POST /orders becomes a CreateOrderCommand object (Command) and is sent to the mediator.' },
      { title: 'Pipeline runs', desc: 'Validation, logging and transaction behaviours each wrap the next (Chain of Responsibility / pipeline) before the handler.' },
      { title: 'Handler picks pricing', desc: 'The handler asks the pricing engine, which selects a DiscountStrategy by customer type (Strategy).' },
      { title: 'State transition', desc: 'The Order aggregate moves Draft → Placed. Its State object decides what Cancel means from now on (State).' },
      { title: 'Event published', desc: 'OrderPlaced is raised. Inventory, notifications and analytics subscribe without the order code knowing them (Observer).' },
      { title: 'Export job', desc: 'A nightly job walks the order tree (Composite) with an InvoiceVisitor to produce PDFs and a TaxVisitor for reports (Visitor).' },
      { title: 'Streaming report', desc: 'A report endpoint uses yield return to stream order lines one by one with constant memory (Iterator).' },
      { title: 'Undo', desc: 'Support cancels by mistake; the stored inverse command restores the previous state (Command undo).' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Strategy, Observer (events) and Command with undo', code: `using System;
using System.Collections.Generic;
using System.Linq;

// ---------- STRATEGY ----------
public record Order(string CustomerType, decimal Subtotal);
public interface IDiscountStrategy { bool CanApply(Order o); decimal Discount(Order o); }
public class NoDiscount : IDiscountStrategy      { public bool CanApply(Order o) => true; public decimal Discount(Order o) => 0; }
public class PremiumDiscount : IDiscountStrategy { public bool CanApply(Order o) => o.CustomerType == "premium"; public decimal Discount(Order o) => o.Subtotal * 0.10m; }
public class BulkDiscount : IDiscountStrategy    { public bool CanApply(Order o) => o.Subtotal > 5000; public decimal Discount(Order o) => 250m; }

public class PricingEngine
{
    private readonly List<IDiscountStrategy> _strategies;   // ordered: first match wins; NoDiscount last
    public PricingEngine(IEnumerable<IDiscountStrategy> strategies) => _strategies = strategies.ToList();
    public decimal Total(Order o) => o.Subtotal - _strategies.First(s => s.CanApply(o)).Discount(o);
}

// ---------- OBSERVER ----------
public class OrderTracker
{
    public event EventHandler<string>? StatusChanged;          // publisher knows nothing about subscribers
    private string _status = "Placed";
    public void Advance(string next) { _status = next; StatusChanged?.Invoke(this, next); }
}

// ---------- COMMAND with undo ----------
public interface ICommand { void Execute(); void Undo(); }
public class Wallet { public decimal Balance; }
public class DepositCommand : ICommand
{
    private readonly Wallet _w; private readonly decimal _amt;
    public DepositCommand(Wallet w, decimal amt) { _w = w; _amt = amt; }
    public void Execute() => _w.Balance += _amt;
    public void Undo()    => _w.Balance -= _amt;
}
public class CommandHistory
{
    private readonly Stack<ICommand> _done = new();
    public void Run(ICommand c) { c.Execute(); _done.Push(c); }
    public void UndoLast() { if (_done.Count > 0) _done.Pop().Undo(); }
}

public static class Program
{
    public static void Main()
    {
        var pricing = new PricingEngine(new IDiscountStrategy[] { new PremiumDiscount(), new BulkDiscount(), new NoDiscount() });
        Console.WriteLine(pricing.Total(new Order("premium", 1000)));   // 900.00
        Console.WriteLine(pricing.Total(new Order("regular", 6000)));   // 5750

        var tracker = new OrderTracker();
        tracker.StatusChanged += (s, st) => Console.WriteLine("SMS: order is " + st);
        tracker.StatusChanged += (s, st) => Console.WriteLine("Dashboard: " + st);
        tracker.Advance("Cooking");                                      // both subscribers run

        var wallet = new Wallet(); var history = new CommandHistory();
        history.Run(new DepositCommand(wallet, 500));
        history.Run(new DepositCommand(wallet, 200));
        history.UndoLast();
        Console.WriteLine(wallet.Balance);                                // 500
    }
}` },
    { lang: 'csharp', title: 'State pattern and Template Method', code: `using System;

// ---------- STATE: each state knows what each action means ----------
public interface IOrderState
{
    string Name { get; }
    IOrderState Pay(OrderCtx o);
    IOrderState Ship(OrderCtx o);
    IOrderState Cancel(OrderCtx o);
}
public class OrderCtx
{
    public IOrderState State { get; private set; } = new PlacedState();
    public bool Refunded { get; set; }
    public void Pay()    => State = State.Pay(this);
    public void Ship()   => State = State.Ship(this);
    public void Cancel() => State = State.Cancel(this);
}
public class PlacedState : IOrderState
{
    public string Name => "Placed";
    public IOrderState Pay(OrderCtx o) => new PaidState();
    public IOrderState Ship(OrderCtx o) => throw new InvalidOperationException("Pay first");
    public IOrderState Cancel(OrderCtx o) => new CancelledState();
}
public class PaidState : IOrderState
{
    public string Name => "Paid";
    public IOrderState Pay(OrderCtx o) => throw new InvalidOperationException("Already paid");
    public IOrderState Ship(OrderCtx o) => new ShippedState();
    public IOrderState Cancel(OrderCtx o) { o.Refunded = true; return new CancelledState(); }   // cancel means refund here
}
public class ShippedState : IOrderState
{
    public string Name => "Shipped";
    public IOrderState Pay(OrderCtx o) => throw new InvalidOperationException("Already paid");
    public IOrderState Ship(OrderCtx o) => throw new InvalidOperationException("Already shipped");
    public IOrderState Cancel(OrderCtx o) => throw new InvalidOperationException("Cannot cancel after shipping");
}
public class CancelledState : IOrderState
{
    public string Name => "Cancelled";
    public IOrderState Pay(OrderCtx o) => throw new InvalidOperationException("Order is cancelled");
    public IOrderState Ship(OrderCtx o) => throw new InvalidOperationException("Order is cancelled");
    public IOrderState Cancel(OrderCtx o) => this;
}

// ---------- TEMPLATE METHOD: fixed skeleton, overridable steps ----------
public abstract class DataImporter
{
    public void Import(string path)                 // the template: order is fixed
    {
        var raw = Open(path);
        var rows = Parse(raw);
        Validate(rows);                            // hook with a default
        Save(rows);
        Console.WriteLine(GetType().Name + " imported " + rows.Length + " rows");
    }
    protected virtual string Open(string path) => "a,b\\n1,2\\n3,4";     // default step
    protected abstract string[] Parse(string raw);                        // required step
    protected virtual void Validate(string[] rows) { }                    // optional hook
    protected abstract void Save(string[] rows);
}
public class CsvImporter : DataImporter
{
    protected override string[] Parse(string raw) => raw.Split('\\n');
    protected override void Validate(string[] rows) { if (rows.Length == 0) throw new Exception("empty"); }
    protected override void Save(string[] rows) { /* bulk insert */ }
}

public static class Program
{
    public static void Main()
    {
        var o = new OrderCtx();
        o.Pay(); o.Cancel();
        Console.WriteLine(o.State.Name + " refunded=" + o.Refunded);   // Cancelled refunded=True
        try { o.Ship(); } catch (InvalidOperationException e) { Console.WriteLine(e.Message); }

        new CsvImporter().Import("orders.csv");                         // CsvImporter imported 3 rows
    }
}` },
    { lang: 'csharp', title: 'Chain of Responsibility, Iterator with yield, Mediator, Visitor', code: `using System;
using System.Collections.Generic;

using System.Linq;

// ---------- CHAIN OF RESPONSIBILITY ----------
public record Refund(decimal Amount);
public abstract class Approver
{
    private Approver? _next;
    public Approver Then(Approver next) { _next = next; return next; }
    public string Handle(Refund r) => CanApprove(r) ? GetType().Name + " approved " + r.Amount
                                    : _next?.Handle(r) ?? "Nobody can approve " + r.Amount;
    protected abstract bool CanApprove(Refund r);
}
public class Bot : Approver     { protected override bool CanApprove(Refund r) => r.Amount <= 100; }
public class Agent : Approver   { protected override bool CanApprove(Refund r) => r.Amount <= 1000; }
public class Manager : Approver { protected override bool CanApprove(Refund r) => r.Amount <= 10000; }

// ---------- ITERATOR: lazy, constant memory ----------
public static class Seq
{
    public static IEnumerable<int> Evens(int max)
    {
        for (int i = 0; i <= max; i += 2)
        {
            Console.Write("[gen " + i + "]");
            yield return i;                       // produced only when the consumer asks
        }
    }
}

// ---------- MEDIATOR: a hub instead of N^2 links ----------
public interface IChatRoom { void Send(string from, string msg); }
public class ChatRoom : IChatRoom
{
    private readonly List<User> _users = new();
    public void Join(User u) { _users.Add(u); u.Room = this; }
    public void Send(string from, string msg) { foreach (var u in _users) if (u.Name != from) u.Receive(from, msg); }
}
public class User
{
    public string Name { get; } public IChatRoom? Room { get; set; }
    public User(string n) => Name = n;
    public void Say(string msg) => Room?.Send(Name, msg);
    public void Receive(string from, string msg) => Console.WriteLine(Name + " got from " + from + ": " + msg);
}

// ---------- VISITOR (classic) and the pattern-matching alternative ----------
public interface IVisitor<T> { T VisitFile(FileNode f); T VisitDir(DirNode d); }
public abstract record Node { public abstract T Accept<T>(IVisitor<T> v); }
public record FileNode(string Name, long Size) : Node { public override T Accept<T>(IVisitor<T> v) => v.VisitFile(this); }
public record DirNode(string Name, List<Node> Children) : Node { public override T Accept<T>(IVisitor<T> v) => v.VisitDir(this); }

public class SizeVisitor : IVisitor<long>
{
    public long VisitFile(FileNode f) => f.Size;
    public long VisitDir(DirNode d) { long s = 0; foreach (var c in d.Children) s += c.Accept(this); return s; }
}
public static class NodeOps
{
    // Modern C#: a switch over a closed set does the same job with less ceremony.
    public static int Count(Node n) => n switch
    {
        FileNode => 1,
        DirNode d => 1 + d.Children.Sum(Count),
        _ => throw new ArgumentOutOfRangeException(nameof(n))
    };
}

public static class Program
{
    public static void Main()
    {
        var chain = new Bot(); chain.Then(new Agent()).Then(new Manager());
        Console.WriteLine(chain.Handle(new Refund(750)));      // Agent approved 750
        Console.WriteLine(chain.Handle(new Refund(50000)));    // Nobody can approve 50000

        foreach (var e in Seq.Evens(6)) { Console.WriteLine(" use " + e); if (e == 4) break; }  // stops generating after 4

        var room = new ChatRoom(); var a = new User("Asha"); var b = new User("Ben");
        room.Join(a); room.Join(b); a.Say("hi");               // Ben got from Asha: hi

        var tree = new DirNode("src", new() { new FileNode("a", 10), new DirNode("lib", new() { new FileNode("b", 20) }) });
        Console.WriteLine(tree.Accept(new SizeVisitor()) + " bytes, " + NodeOps.Count(tree) + " nodes");   // 30 bytes, 4 nodes
    }
}` }
  ],
  pitfalls: [
    'Subscribing to events and never unsubscribing, which keeps subscribers alive and leaks memory in long-running apps.',
    'Strategy selectors that grow into a new switch statement. Let strategies declare CanApply or use keyed registration.',
    'Spreading state checks across many methods instead of one state machine, so a new state means hunting through the codebase.',
    'Template Method hierarchies that grow deep; prefer Strategy when steps vary independently.',
    'Chains with no terminal handler, so unhandled requests silently do nothing.',
    'Enumerating a yield-based sequence twice and re-running expensive work; materialise with ToList when needed.'
  ],
  quiz: [
    { q: 'Shipping cost is calculated differently per carrier, chosen at runtime. Which pattern replaces the big if/else?', options: ['Observer', 'Strategy', 'Visitor', 'Iterator'], answer: 1, why: 'Strategy puts each algorithm behind one interface so the caller picks one without a conditional.' },
    { q: 'In C#, the event keyword is language support for which pattern?', options: ['Command', 'Mediator', 'Observer', 'State'], answer: 2, why: 'Events let a publisher notify any number of subscribers without knowing their types.' },
    { q: 'You need undo, retry and an audit log for user actions. Which pattern turns actions into objects you can store?', options: ['Command', 'Template Method', 'Chain of Responsibility', 'Facade'], answer: 0, why: 'Command wraps an action in an object with Execute and Undo so it can be queued, logged and reversed.' },
    { q: 'Cancel() behaves differently when an order is Placed, Paid or Shipped, and the same switch appears in five methods. Which pattern fixes this?', options: ['Strategy', 'State', 'Iterator', 'Proxy'], answer: 1, why: 'State gives each state its own class that defines what every action means, removing repeated switches.' },
    { q: 'What does yield return give you that building a List does not?', options: ['Faster sorting of the finished sequence', 'Items produced lazily, one at a time', 'Thread safety across multiple readers', 'Automatic caching of every result'], answer: 1, why: 'A yield iterator produces items only when asked, so you can stream huge or infinite sequences.' },
    { q: 'ASP.NET Core middleware, where each piece can handle the request or pass it on, is an example of which pattern?', options: ['Visitor', 'Mediator', 'Chain of Responsibility', 'Model-View-Controller'], answer: 2, why: 'Each handler holds the next and decides whether to handle or forward, which is the chain of responsibility.' }
  ],
  takeaways: [
    'Behavioral patterns replace conditionals: Strategy for algorithms, State for state-dependent behaviour, Chain for handler selection.',
    'C# events and IObservable are Observer; yield return is Iterator; delegates are tiny Strategies.',
    'Command turns actions into objects you can queue, log, retry and undo; MediatR requests are commands.',
    'Template Method uses inheritance for a fixed skeleton; prefer Strategy when steps vary independently.',
    'Mediator removes N² links but can become a god object if it holds logic.',
    'Visitor adds operations to a tree; pattern matching over sealed records is often the simpler modern choice.'
  ],
  interview: [
    { q: 'Strategy vs State: they look the same in code. What is the difference?', a: '<p>Same shape (interface + swappable classes), different intent. Strategy is chosen by the client and usually does not change during an operation. State is chosen by the object itself and changes as the object transitions; states often know about each other and return the next state.</p>' },
    { q: 'How do you avoid memory leaks with C# events?', a: '<p>Unsubscribe with -= when the subscriber is disposed, use weak event patterns, or prefer scoped lifetimes so publisher and subscriber die together. The leak happens because the publisher holds a delegate referencing the subscriber, keeping it alive.</p>' },
    { q: 'How does MediatR relate to the Mediator and Command patterns?', a: '<p>Requests (commands and queries) are Command objects. MediatR is the Mediator that routes each request to exactly one handler and each notification to many handlers, and its pipeline behaviours form a chain around the handler for validation, logging and transactions.</p>' },
    { q: 'When would you use Visitor instead of pattern matching?', a: '<p>When the node types live in a library you cannot change but you can add Accept once, when you need double dispatch in a language without pattern matching, or when many unrelated operations must be added by different teams. In modern C# with a small hierarchy you control, a switch expression is usually simpler, but the compiler cannot check that it covers every node type, so keep a default arm that throws.</p>' }
  ]
};

/* ───────────────────────── m3-uml ───────────────────────── */
window.CONTENT['m3-uml'] = {
  hook: `A whiteboard sketch that your whole team reads the same way is worth more than a thousand lines of perfectly written code nobody can explain.`,
  intro: `<p><span class="term">UML</span> stands for Unified Modeling Language. It is a set of standard drawings for software, so that a box, an arrow or a diamond means the same thing to every engineer. You do not need all fourteen diagram types. In real work and in LLD interviews, five do almost everything: the <strong>class diagram</strong> (what things exist and how they relate), the <strong>sequence diagram</strong> (who calls whom, in what order), the <strong>use-case diagram</strong> (what users can do), the <strong>activity diagram</strong> (a flowchart of steps and decisions) and the <strong>state diagram</strong> (how an object moves between states).</p>
<p>UML is a communication tool, not a contract. A good diagram shows one idea at the right zoom level and leaves out everything else. Interviewers use it to see how you think: can you name the main classes, show which one owns which, and walk through a request step by step?</p>
<p>This lesson teaches the notation you must know (the arrows are the whole trick), how to draw fast on a whiteboard, and how to write the same diagrams as text with Mermaid so they live next to your code and render in docs and pull requests.</p>`,
  realLife: {
    title: 'Architects, builders and the floor plan',
    body: `<p>When a family builds a house, the architect does not hand the builders a novel. They hand over a <strong>floor plan</strong> (rooms and how they connect: a class diagram), a <strong>wiring diagram</strong> (how power flows from the meter to each socket: a sequence diagram), a list of what the house must let the family do (cook, sleep, park: use cases), a construction schedule with decision points (if the soil is soft, add piles: an activity diagram) and the rules for the smart lock (locked → unlocked → auto-locks after 30 seconds: a state diagram). Every tradesperson reads the same symbols.</p>
<p>At real companies, UML lives in design docs and RFCs before a feature is built, in onboarding wikis, and in LLD interview rounds at product companies, where candidates are expected to draw a class diagram for "design a parking lot" and a sequence diagram for "a car enters". Teams increasingly write diagrams as Mermaid text in Markdown so they are versioned with the code and reviewed in pull requests.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Class diagram: boxes and the five arrows</h4>
<p>A class is a box with three parts: name, fields (attributes), methods (operations). A <code>+</code> means public, <code>-</code> private, <code>#</code> protected. The relationships between boxes are what matter, and there are only five you need:</p>
<table><thead><tr><th>Relationship</th><th>Read as</th><th>Drawn as</th><th>Example</th></tr></thead><tbody>
<tr><td>Association</td><td>A knows about / uses B</td><td>Plain line, optional arrowhead</td><td>Customer places Order</td></tr>
<tr><td>Aggregation</td><td>A has B, but B can live without A</td><td>Line with a hollow (white) diamond at A</td><td>Team has Players; a player survives the team closing</td></tr>
<tr><td>Composition</td><td>A owns B; B dies with A</td><td>Line with a filled (black) diamond at A</td><td>Order owns OrderLines; delete the order, lines go too</td></tr>
<tr><td>Inheritance / Realisation</td><td>B is a kind of A / B implements A</td><td>Line with a hollow triangle pointing at A (dashed for interface)</td><td>Circle is a Shape; SqlRepo implements IRepo</td></tr>
<tr><td>Dependency</td><td>A temporarily uses B (parameter, local)</td><td>Dashed arrow A → B</td><td>OrderService uses IPaymentGateway</td></tr>
</tbody></table>
<p>Numbers at the ends of a line are <span class="term">multiplicity</span>: <code>1</code>, <code>0..1</code>, <code>*</code> (many), <code>1..*</code> (at least one). "One Customer places many Orders" is written <code>1</code> at Customer and <code>*</code> at Order.</p>
<p>The same diagram as Mermaid text (this renders in the app):</p>
<pre class="mermaid">classDiagram
    class Customer {
        +int Id
        +string Email
        +PlaceOrder()
    }
    class Order {
        +int Id
        +decimal Total
        +Cancel()
    }
    class OrderLine {
        +int Qty
        +decimal Price
    }
    class IPaymentGateway {
        &lt;&lt;interface&gt;&gt;
        +PayAsync(amount)
    }
    class CardGateway
    Customer "1" --> "*" Order : places
    Order *-- OrderLine : owns
    Order o-- Address : ships to
    IPaymentGateway &lt;|.. CardGateway : implements
    OrderService ..> IPaymentGateway : uses</pre>
<h4>Sequence diagram: who calls whom</h4>
<p>Vertical lines are objects (lifelines). Time runs downward. A solid arrow is a call, a dashed arrow is the reply. Read it top to bottom like a script. It is the best diagram for explaining a request end to end.</p>
<pre class="mermaid">sequenceDiagram
    participant U as User
    participant C as OrdersController
    participant S as OrderService
    participant P as PaymentGateway
    participant D as Database
    U->>C: POST /orders
    C->>S: PlaceAsync(order)
    S->>P: PayAsync(total)
    P-->>S: transactionId
    S->>D: Save(order)
    D-->>S: ok
    S-->>C: orderId
    C-->>U: 201 Created</pre>
<div class="callout tip">On a whiteboard, draw the class diagram first (nouns), then one sequence diagram for the most important flow (verbs). That pair answers most LLD questions.</div>` },
    { name: 'Intermediate', body: `<h4>Use-case diagram</h4>
<p>Stick figures are <span class="term">actors</span> (user roles or external systems). Ovals are use cases (goals). Lines connect actors to the use cases they can perform. Two extras: <code>&lt;&lt;include&gt;&gt;</code> means a use case always calls another (Place Order includes Pay), <code>&lt;&lt;extend&gt;&gt;</code> means an optional add-on (Apply Coupon extends Place Order). Use it to agree scope with product managers before designing classes.</p>
<h4>Activity diagram</h4>
<p>A flowchart with UML symbols: rounded rectangles are actions, diamonds are decisions with guards in brackets (<code>[in stock]</code>), a thick bar is a fork/join for parallel work, and swimlanes split actions by who does them (Customer, System, Warehouse). Good for business processes and for explaining algorithms with branches.</p>
<pre class="mermaid">flowchart TD
    A([Start checkout]) --> B{Items in stock?}
    B -- no --> C[Show out-of-stock]
    C --> Z([End])
    B -- yes --> D[Calculate total]
    D --> E[Charge payment]
    E --> F{Payment ok?}
    F -- no --> G[Show error, keep cart]
    G --> Z
    F -- yes --> H[Create order]
    H --> I[Send confirmation]
    I --> Z</pre>
<h4>State diagram</h4>
<p>Rounded boxes are states, arrows are transitions labelled <code>trigger [guard] / action</code>. A filled circle is the start; a bullseye is the end. State diagrams pair with the State pattern and with domain aggregates: every arrow is an allowed transition, everything missing is forbidden.</p>
<pre class="mermaid">stateDiagram-v2
    [*] --> Placed
    Placed --> Paid : pay
    Placed --> Cancelled : cancel
    Paid --> Shipped : ship
    Paid --> Cancelled : cancel / refund
    Shipped --> Delivered : deliver
    Delivered --> [*]
    Cancelled --> [*]</pre>
<h4>Choosing the diagram</h4>
<table><thead><tr><th>Question</th><th>Diagram</th></tr></thead><tbody>
<tr><td>What are the main things and how do they relate?</td><td>Class</td></tr>
<tr><td>What happens, in order, when X is called?</td><td>Sequence</td></tr>
<tr><td>What can each kind of user do?</td><td>Use case</td></tr>
<tr><td>What are the steps and decisions of a process?</td><td>Activity</td></tr>
<tr><td>How does one object's lifecycle work?</td><td>State</td></tr>
<tr><td>How are services deployed and connected?</td><td>Component / deployment (HLD)</td></tr>
</tbody></table>
<h4>Diagrams as code</h4>
<p>Mermaid, PlantUML and Structurizr let you write diagrams as text. Benefits: version control, code review, no drawing tool, and the diagram stays next to the code it describes. GitHub, Azure DevOps wikis and most docs tools render Mermaid directly. Keep diagrams small; a diagram with 40 boxes communicates nothing.</p>
<div class="callout warn">Do not try to draw the whole system. One diagram, one question. If a reader needs to scroll, split it.</div>` },
    { name: 'Expert', body: `<h4>Aggregation vs composition: does the distinction matter?</h4>
<p>In practice, composition (filled diamond) is the one that carries design meaning: it tells the reader "this child is created, saved and deleted with the parent". That maps directly to cascade deletes in EF Core, to owned entities, and to aggregate boundaries in domain-driven design. Aggregation is weak and often debated; many senior engineers draw a plain association with multiplicity instead and reserve the diamond for true ownership.</p>
<h4>Interfaces, abstract classes and generics in class diagrams</h4>
<p>Mark interfaces with <code>&lt;&lt;interface&gt;&gt;</code> and abstract members in italics (or <code>*</code> in Mermaid). Realisation is a dashed line with a hollow triangle. Generics are written as <code>Repository~T~</code> in Mermaid or <code>Repository&lt;T&gt;</code> elsewhere. Keep the diagram at the level of the abstraction a caller sees; implementation classes can go in a second diagram.</p>
<h4>Sequence diagrams for async and failures</h4>
<p>Show <code>alt</code> / <code>else</code> fragments for branches (payment ok vs failed), <code>loop</code> for retries, <code>par</code> for parallel calls, and open arrowheads for asynchronous messages (events to a queue). Reviewers look for the unhappy paths; a sequence diagram with only the happy path hides the hardest design decisions (timeouts, compensation, idempotency).</p>
<h4>The C4 model as the modern alternative for HLD</h4>
<p>For system-level views, the C4 model (Context, Container, Component, Code) has largely replaced UML component and deployment diagrams. Level 1 shows the system and its users and neighbours, level 2 shows deployable containers (API, SPA, database, queue), level 3 shows components inside a container, and level 4 is a UML class diagram. Interviewers for HLD rounds expect something like C4 levels 1–2; LLD rounds expect level 4 plus sequence and state.</p>
<h4>Whiteboard technique for interviews</h4>
<ol>
<li>Write the requirements as a short list and confirm them. Underline the nouns (candidate classes) and verbs (candidate methods).</li>
<li>Draw 5–8 boxes with names only. Add the arrows: inheritance first, then ownership (composition), then uses (dependency to interfaces).</li>
<li>Add only the fields and methods that matter to the question. Skip getters, ids and constructors.</li>
<li>Pick the one flow the interviewer cares about and draw its sequence diagram. Narrate while drawing.</li>
<li>If the object has a lifecycle, draw a tiny state diagram and name the forbidden transitions.</li>
<li>Say what you left out and why. That shows judgement.</li>
</ol>
<h4>Keeping diagrams honest</h4>
<p>Diagrams rot. Generate class diagrams from code where possible (tools exist for .NET), keep hand-drawn ones at the stable abstraction level, and review them in the same pull request as the code they describe. Add a date and an owner to any architecture diagram in a wiki.</p>
<div class="callout idea">A senior signal in interviews: when you draw an arrow, say its meaning aloud ("Order owns its lines, so deleting an order deletes them"). Notation only matters because it carries decisions.</div>` }
  ],
  flow: {
    title: 'From a requirement to a whiteboard design in six moves',
    steps: [
      { title: 'Read the requirement', desc: '"Customers place orders with several items, pay by card or UPI, and can cancel before shipping."' },
      { title: 'Underline nouns and verbs', desc: 'Nouns: Customer, Order, OrderLine, Product, Payment. Verbs: place, pay, cancel, ship. Nouns become classes, verbs become methods or transitions.' },
      { title: 'Draw boxes and arrows', desc: 'Customer 1→* Order (association). Order owns OrderLine (composition). IPaymentGateway with CardGateway and UpiGateway (realisation). OrderService uses IPaymentGateway (dependency).' },
      { title: 'Add only key members', desc: 'Order: Total, Status, Cancel(). OrderService: PlaceAsync(). Skip ids, getters and plumbing.' },
      { title: 'Draw the main sequence', desc: 'User → Controller → OrderService → PaymentGateway → Database, with the reply arrows. Add an alt block for payment failure.' },
      { title: 'Draw the lifecycle', desc: 'State diagram: Placed → Paid → Shipped → Delivered, with Cancel allowed only from Placed and Paid.' },
      { title: 'Write it as Mermaid', desc: 'Put the three diagrams in the design doc as text so they are versioned and reviewed with the code.' }
    ]
  },
  code: [
    { lang: 'text', title: 'Mermaid class diagram (paste into any Markdown that supports Mermaid)', code: `classDiagram
    class Customer {
        +int Id
        +string Email
        +PlaceOrder(cart) Order
    }
    class Order {
        +int Id
        +OrderStatus Status
        +decimal Total
        +Cancel()
    }
    class OrderLine {
        +int ProductId
        +int Qty
        +decimal Price
    }
    class OrderService {
        +PlaceAsync(order) Task
    }
    class IPaymentGateway {
        <<interface>>
        +PayAsync(amount) Task
    }
    class CardGateway
    class UpiGateway

    Customer "1" --> "*" Order : places
    Order "1" *-- "1..*" OrderLine : owns
    Order o-- Address : ships to
    IPaymentGateway <|.. CardGateway
    IPaymentGateway <|.. UpiGateway
    OrderService ..> IPaymentGateway : uses
    OrderService ..> Order : creates

%% Arrow cheat sheet
%% A --> B    association (A knows B)
%% A o-- B    aggregation (A has B, B outlives A)   hollow diamond at A
%% A *-- B    composition (A owns B)                 filled diamond at A
%% A <|-- B   inheritance (B is an A)                hollow triangle at A
%% A <|.. B   realisation (B implements interface A) dashed + triangle
%% A ..> B    dependency (A uses B briefly)          dashed arrow` },
    { lang: 'text', title: 'Mermaid sequence diagram with alt / loop fragments', code: `sequenceDiagram
    autonumber
    participant U as User (browser)
    participant C as OrdersController
    participant S as OrderService
    participant P as IPaymentGateway
    participant R as IOrderRepository
    participant Q as Message bus

    U->>C: POST /api/orders {cart}
    C->>S: PlaceAsync(order)
    S->>S: total = pricing.Total(order)
    loop up to 3 attempts
        S->>P: PayAsync(total)
        P-->>S: result
    end
    alt payment succeeded
        S->>R: SaveAsync(order, total)
        R-->>S: orderId
        S-)Q: publish OrderPlaced (async, no reply)
        S-->>C: orderId
        C-->>U: 201 Created {orderId}
    else payment failed
        S-->>C: PaymentFailed
        C-->>U: 402 Payment Required
    end` },
    { lang: 'text', title: 'Mermaid state diagram and use-case sketch', code: `stateDiagram-v2
    [*] --> Placed
    Placed --> Paid : pay [amount == total]
    Placed --> Cancelled : cancel
    Paid --> Shipped : ship
    Paid --> Cancelled : cancel / refund
    Shipped --> Delivered : deliver
    Delivered --> [*]
    Cancelled --> [*]

%% Use-case diagrams are not native in Mermaid; a flowchart does the job.
%% This is a second, separate diagram: paste it into its own Mermaid block.
flowchart LR
    customer([Customer])
    admin([Admin])
    uc1(Place order)
    uc2(Pay)
    uc3(Cancel order)
    uc4(Manage products)
    customer --- uc1
    customer --- uc3
    admin --- uc4
    uc1 -. include .-> uc2` },
    { lang: 'csharp', title: 'The code the class diagram describes (so the arrows map to C#)', code: `using System;
using System.Collections.Generic;
using System.Threading.Tasks;

public enum OrderStatus { Placed, Paid, Shipped, Delivered, Cancelled }

public record Address(string Line1, string City);          // aggregation: can exist on its own (customer address book)

public class OrderLine                                     // composition: created and deleted with its Order
{
    public int ProductId { get; init; }
    public int Qty { get; init; }
    public decimal Price { get; init; }
}

public class Order
{
    public int Id { get; init; }
    public OrderStatus Status { get; private set; } = OrderStatus.Placed;
    private readonly List<OrderLine> _lines = new();        // *-- OrderLine (owned)
    public IReadOnlyList<OrderLine> Lines => _lines;
    public Address ShipTo { get; init; } = default!;        // o-- Address
    public decimal Total { get { decimal t = 0; foreach (var l in _lines) t += l.Qty * l.Price; return t; } }

    public void AddLine(OrderLine line) => _lines.Add(line);
    public void MarkPaid() => Status = Status == OrderStatus.Placed ? OrderStatus.Paid : throw new InvalidOperationException();
    public void Cancel()
    {
        if (Status is OrderStatus.Shipped or OrderStatus.Delivered) throw new InvalidOperationException("Too late to cancel");
        Status = OrderStatus.Cancelled;
    }
}

public class Customer                                      // "1" --> "*" Order (association)
{
    public int Id { get; init; }
    public string Email { get; init; } = "";
    public List<Order> Orders { get; } = new();
}

public interface IPaymentGateway { Task<bool> PayAsync(decimal amount); }     // <<interface>>
public class CardGateway : IPaymentGateway { public Task<bool> PayAsync(decimal a) => Task.FromResult(true); }   // <|..
public class UpiGateway  : IPaymentGateway { public Task<bool> PayAsync(decimal a) => Task.FromResult(true); }

public class OrderService                                  // ..> IPaymentGateway (drawn as a dependency; strict UML calls a reference kept in a field an association)
{
    private readonly IPaymentGateway _gateway;
    public OrderService(IPaymentGateway gateway) => _gateway = gateway;

    public async Task<int> PlaceAsync(Order order)
    {
        if (!await _gateway.PayAsync(order.Total)) throw new InvalidOperationException("Payment failed");
        order.MarkPaid();
        return order.Id;
    }
}` }
  ],
  pitfalls: [
    'Mixing up the diamonds: filled diamond means the child dies with the parent (composition); hollow means it can live on (aggregation).',
    'Pointing the inheritance triangle the wrong way. The hollow triangle always sits at the parent or interface.',
    'Drawing every class and every field. A readable diagram has 5 to 10 boxes and only the members that matter to the question.',
    'Sequence diagrams with only the happy path. Add alt blocks for failures; that is where the design decisions live.',
    'Treating the diagram as the source of truth forever. Diagrams rot; keep them as text next to the code and review them with changes.',
    'Spending interview time on perfect notation instead of narrating decisions. Say what each arrow means as you draw it.'
  ],
  quiz: [
    { q: 'An Order owns its OrderLines; deleting the order deletes the lines. Which relationship and symbol is this?', options: ['Aggregation, hollow diamond', 'Composition, filled diamond', 'Dependency, dashed arrow', 'Inheritance, hollow triangle'], answer: 1, why: 'Composition means strong ownership with shared lifetime, drawn as a filled diamond at the owner.' },
    { q: 'Which diagram best shows the order of calls between a controller, a service and a database for one request?', options: ['Class diagram', 'Use-case diagram', 'Sequence diagram', 'State diagram'], answer: 2, why: 'Sequence diagrams show lifelines and messages in time order, which is exactly a request flow.' },
    { q: 'In a class diagram, a dashed line with a hollow triangle pointing at IRepository from SqlRepository means:', options: ['SqlRepository owns IRepository', 'SqlRepository implements IRepository', 'IRepository depends on SqlRepository', 'They are the same class'], answer: 1, why: 'A dashed line with a hollow triangle is realisation: the class implements the interface the triangle points to.' },
    { q: 'What does multiplicity "1" at Customer and "*" at Order mean?', options: ['Each order can have many customers', 'Each customer has exactly one order', 'One customer can have many orders', 'Orders and customers are unrelated'], answer: 2, why: 'Multiplicity is read at the far end: a customer relates to * orders; an order relates to 1 customer.' },
    { q: 'Which diagram would you use to show that an order can be cancelled only before shipping?', options: ['State diagram', 'Use-case diagram', 'Class diagram', 'Deployment diagram'], answer: 0, why: 'A state diagram shows allowed transitions; the absence of a Shipped → Cancelled arrow expresses the rule.' },
    { q: 'Why do many teams write diagrams as Mermaid text instead of drawing tools?', options: ['Mermaid draws prettier pictures than any tool', 'Text diagrams are versioned with the code', 'The UML standard requires diagrams as text', 'Drawing tools are not allowed in agile teams'], answer: 1, why: 'Diagrams as code live in the repository, get code review, and are less likely to rot.' }
  ],
  takeaways: [
    'Five diagrams cover real work: class, sequence, use case, activity and state.',
    'The five class-diagram arrows: association (line), aggregation (hollow diamond), composition (filled diamond), inheritance/realisation (hollow triangle), dependency (dashed arrow).',
    'Composition is the one that carries design meaning: shared lifetime, cascade delete, aggregate boundary.',
    'Sequence diagrams explain one flow top to bottom; include failure branches with alt.',
    'State diagrams make forbidden transitions visible by leaving them out.',
    'Write diagrams as Mermaid text, keep them small, and review them with the code.'
  ],
  interview: [
    { q: 'What is the difference between aggregation and composition?', a: '<p>Both are "has-a". Composition is strong ownership: the part is created and destroyed with the whole (Order and OrderLine), drawn with a filled diamond. Aggregation is weak: the part can exist independently and be shared (Team and Player), drawn with a hollow diamond. In code, composition usually means the parent creates the children and cascades deletes.</p>' },
    { q: 'How would you approach drawing the design for "a parking lot" in 10 minutes?', a: '<p>Confirm requirements (vehicle types, spot sizes, multiple floors, payment). Underline nouns: ParkingLot, Floor, Spot, Vehicle, Ticket, Payment. Draw boxes with inheritance for Vehicle types and Spot sizes, composition from Lot to Floors to Spots, and a Ticket associated with a Vehicle and a Spot. Then draw a sequence diagram for "vehicle enters": Gate → Lot.FindSpot → Spot.Assign → Ticket issued. Finish with a Ticket state diagram: Active → Paid → Closed.</p>' },
    { q: 'When would you use a sequence diagram over an activity diagram?', a: '<p>Sequence diagrams show interactions between specific objects or services over time, ideal for request flows and API calls. Activity diagrams show the logic of a process with decisions and parallel steps, independent of which object does it, ideal for business workflows and algorithms.</p>' },
    { q: 'How do you keep architecture diagrams from going stale?', a: '<p>Store them as text (Mermaid, PlantUML, Structurizr) in the repository, update them in the same pull request as code changes, keep them at a stable abstraction level, generate low-level ones from code where tools allow, and add an owner and date to each wiki diagram.</p>' }
  ]
};
