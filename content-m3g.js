// DevPath content: Module 3, System Design Case Studies (chess, Hotstar, Netflix frontend, WhatsApp Web frontend, e-commerce)
window.CONTENT = window.CONTENT || {};

window.CONTENT['m3-case-chess'] = {
  hook: `Two players, one board, and a server that must never let a knight move like a queen, even if a hacker rewrites the browser.`,
  intro: `<p>This case study walks through designing an online chess website like chess.com or lichess. Two people play each other live. Each move must show up on the other screen within a fraction of a second. Thousands of games run at the same time, and people watch the big ones.</p>
<p>It is a favourite interview question because it mixes three hard things: <span class="term">real-time</span> communication (messages pushed to the browser the moment they happen, instead of the browser asking again and again), <span class="term">server-side validation</span> (the server, not the browser, decides if a move is legal), and <span class="term">state</span> (the exact position of every game must survive crashes and reconnects).</p>
<p>We will go in the order an interviewer expects: requirements, rough numbers, API, data model, high-level architecture, then the deep dives (matchmaking, moves, reconnection, spectators, ratings, anti-cheat), and finally how to present it all in 45 minutes.</p>`,
  realLife: { title: 'A referee who never blinks', body: `<p>Think of a chess club where every game has a referee sitting at the table. Players do not move pieces themselves. They say "knight to f3", and the referee checks the rulebook, moves the piece, writes the move in a notebook, and tells both players. If a player steps out for a coffee, the notebook still has the full game, so they can come back and continue.</p>
<p>Our server is that referee. The browser only <em>asks</em> to move. The server checks, records, and broadcasts. The notebook is the move list in the database. That single decision (the referee owns the truth) is what makes cheating hard and reconnecting easy.</p>
<p>Lichess, a real open-source chess site, runs millions of games a day on a surprisingly small number of servers using exactly this idea: tiny messages over WebSockets, and the server as the only source of truth.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Step 1: Requirements (say them out loud)</h4>
<p><strong>Functional</strong> (what it does): sign up and log in; find an opponent (matchmaking) or invite a friend; play a game with a clock; see the opponent's move instantly; resign, offer a draw, claim a timeout; see game history; watch other people's games; have a rating that goes up and down.</p>
<p><strong>Non-functional</strong> (how well it does it): a move should reach the opponent in under 200 ms; a game must never be lost if a server restarts; the site should handle, say, 100,000 games at the same time; the rules must be enforced on the server so nobody can cheat by editing the web page.</p>
<h4>Step 2: Rough numbers (back-of-the-envelope)</h4>
<ul>
<li>Peak: 100,000 live games = 200,000 connected players, plus maybe 50,000 spectators.</li>
<li>A chess game has about 40 moves per side, over about 10 minutes. That is 80 moves per game per 10 minutes, so roughly 100,000 × 80 / 600 s ≈ 13,000 moves per second at peak.</li>
<li>A move message is tiny: about 50 bytes. So traffic is small, under 1 MB per second. The challenge is the <em>number of open connections</em>, not bandwidth.</li>
<li>Storage: one game record is about 2 KB (move list plus metadata). 10 million games a day ≈ 20 GB a day. Easy for a database, but we will archive old games to cheap storage.</li>
</ul>
<h4>Step 3: The simplest shape</h4>
<p>Browser ⇄ Game server (WebSocket) ⇄ Database. The browser sends "I want to move e2 to e4". The game server checks the rules, saves the move, and pushes it to the opponent. That is the whole idea; everything after this is about doing it for many games at once without losing data.</p>
<div class="callout tip"><p>In an interview, write the functional and non-functional lists on the board in the first 5 minutes. Interviewers mark you down most for skipping this step, not for a weak deep dive.</p></div>
<h4>What makes chess special</h4>
<ul>
<li>Low bandwidth but <strong>latency-sensitive</strong>: a 2-second delay in a 1-minute "bullet" game is unplayable.</li>
<li><strong>Turn-based</strong>: only one player can act at a time. This makes the state machine simple compared with a shooter game.</li>
<li>Rules are fully known, so the server can validate every move exactly.</li>
</ul>` },
    { name: 'Intermediate', body: `<h4>API design</h4>
<p>Two kinds of API. Regular HTTP for things that do not need to be instant, and a WebSocket channel for the live game.</p>
<table><thead><tr><th>Endpoint</th><th>Type</th><th>Purpose</th></tr></thead><tbody>
<tr><td>POST /api/auth/login</td><td>HTTP</td><td>Returns a JWT used for both HTTP and WebSocket</td></tr>
<tr><td>POST /api/matchmaking/join {timeControl}</td><td>HTTP</td><td>Join a queue; server replies when a game is found (via WebSocket)</td></tr>
<tr><td>GET /api/games/{id}</td><td>HTTP</td><td>Full game state (used on page load and reconnect)</td></tr>
<tr><td>GET /api/users/{id}/games?page=</td><td>HTTP</td><td>History</td></tr>
<tr><td>ws: Move {gameId, from, to, promotion}</td><td>WebSocket</td><td>Request a move</td></tr>
<tr><td>ws: MoveApplied {gameId, san, fen, clocks}</td><td>WebSocket</td><td>Broadcast to both players and spectators</td></tr>
<tr><td>ws: Resign / OfferDraw / AcceptDraw</td><td>WebSocket</td><td>Game actions</td></tr>
</tbody></table>
<h4>Data model</h4>
<p>Keep the <em>live</em> state in memory (fast) and the <em>durable</em> state in a database (safe).</p>
<ul>
<li><strong>Game</strong>: Id, WhiteUserId, BlackUserId, TimeControl, Status (Waiting, Active, Finished), Result, StartedAt, EndedAt, FinalFen.</li>
<li><strong>Move</strong>: GameId, Ply (move number counting each side), San ("Nf3"), Uci ("g1f3"), ClockAfterMs, PlayedAt. Append-only.</li>
<li><strong>User</strong>: Id, Name, Rating per time control, GamesPlayed.</li>
</ul>
<p>Because moves are append-only, the move table is an <span class="term">event log</span>: you can rebuild any position by replaying moves from the start. That is how reconnect and spectating "from the beginning" work.</p>
<h4>High-level architecture</h4>
<ul>
<li><strong>Load balancer</strong> with sticky routing for WebSockets (a connection must stay on one server).</li>
<li><strong>Game servers</strong> (ASP.NET Core + SignalR): hold active games in memory, validate moves, run clocks, broadcast.</li>
<li><strong>Redis</strong>: shared state so any server can find which server owns a game, and a pub/sub <span class="term">backplane</span> so a message sent on server A reaches a spectator connected to server B.</li>
<li><strong>SQL database</strong> (SQL Server or PostgreSQL): games and moves, written as they happen.</li>
<li><strong>Matchmaking service</strong>: queues keyed by time control, pairs players with close ratings.</li>
<li><strong>Rating service</strong>: updates Elo after each finished game (can be a background job reading a queue).</li>
</ul>
<h4>Deep dive: the move flow</h4>
<ol>
<li>Browser sends Move over the WebSocket.</li>
<li>Server loads the game from memory (or Redis if this server does not own it, then forwards).</li>
<li>Server checks: is it your turn? is the move legal for this position? is your clock still above zero?</li>
<li>Server applies the move, updates clocks, appends to the move list, writes to the database.</li>
<li>Server broadcasts MoveApplied to the game group (both players and spectators).</li>
<li>If checkmate, stalemate, or timeout: mark the game finished, publish a GameFinished event for the rating service.</li>
</ol>
<div class="callout warn"><p>Never trust the FEN (board position string) sent by the browser. The server keeps its own position and only accepts a from/to square. The browser is just a remote control.</p></div>
<h4>Deep dive: reconnection</h4>
<p>Phones lose signal. When the socket drops, the client reconnects with the game id and the last ply it saw. The server sends every move after that ply. Clocks keep running on the server during the gap, which is fair and simple. Give a short grace period (for example 15 seconds) before a disconnect counts as a loss in rated games.</p>` },
    { name: 'Expert', body: `<h4>Scaling the game servers</h4>
<p>Each game is a small state machine. The cleanest scaling model is <strong>shard by game id</strong>: a consistent-hash ring maps game ids to servers, so one server owns a game for its whole life. No two servers ever write the same game, which removes locking and race conditions. If a server dies, the games it owned are rebuilt on another server by replaying moves from the database (or from a Redis copy of the last state), then players reconnect.</p>
<p>With about 100 KB of memory per game (position, move history, clocks, player info), a single server with 16 GB can comfortably hold tens of thousands of games. Connections are the real limit; tune the OS for many open sockets and keep messages tiny.</p>
<h4>Clocks and fairness</h4>
<p>Clocks run on the server. The client shows a local countdown for smoothness but the server's time is the truth. To be fair to players with slow networks, many sites add <span class="term">lag compensation</span>: measure round-trip time and refund a small amount per move, capped so it cannot be abused.</p>
<h4>Spectators and fan-out</h4>
<p>A game between two grandmasters may have 50,000 viewers. Do not send 50,000 individual messages from the owning server. Publish one MoveApplied event to Redis pub/sub (or Kafka); every game server that has spectators of that game subscribed forwards it to its own local connections. For very large audiences, spectators can receive updates over a slightly delayed CDN-backed stream rather than the live socket, which also makes cheating-by-watching harder.</p>
<h4>Ratings (Elo and Glicko)</h4>
<p>Elo: expected score E = 1 / (1 + 10^((Rb - Ra) / 400)). New rating = Ra + K × (S - E), where S is 1 for a win, 0.5 draw, 0 loss, and K is 10 to 40. Glicko adds a "rating deviation" (how unsure the system is about your rating) so new players move faster; Glicko-2 also tracks how steady your results are. Run rating updates in a background worker from a GameFinished queue; it keeps the move path fast and makes recomputation possible if a bug is found.</p>
<h4>Anti-cheat basics</h4>
<ul>
<li><strong>Server-side rules</strong> block illegal moves outright.</li>
<li><strong>Engine detection</strong>: compare a player's moves with a chess engine's top choices across many games; humans rarely match 95%+ for long. Also look at move-time patterns (an engine user spends the same time on easy and hard moves).</li>
<li><strong>Rate limits</strong> per connection to stop message floods.</li>
<li><strong>Account signals</strong>: new account, sudden rating jump, many reports.</li>
</ul>
<h4>Consistency and durability trade-offs</h4>
<div class="compare"><div><h5>Write move to DB before broadcast</h5><p>Safer: a crash never loses an acknowledged move. Adds 2 to 5 ms per move. Good default for rated games.</p></div><div><h5>Broadcast first, write async</h5><p>Faster feel, but a crash can lose the last move. Acceptable for casual games if Redis also holds the state.</p></div></div>
<h4>Failure modes to mention</h4>
<ul>
<li>Redis backplane down: live play continues per server, spectators on other servers stop updating. Degrade, do not crash.</li>
<li>Database slow: queue writes with backpressure; if the queue grows too much, stop starting new games before you stop finishing existing ones.</li>
<li>Split brain (two servers think they own a game): prevent with a lease in Redis (SET NX with expiry) per game id.</li>
</ul>
<h4>How to present in 45 minutes</h4>
<p>5 min requirements and numbers, 5 min API and data model, 10 min high-level diagram, 15 min deep dives (pick move flow and scaling; mention reconnect, spectators, ratings), 5 min failure modes and trade-offs, 5 min questions. Say what you are skipping and why.</p>` }
  ],
  flow: { title: 'One move, from click to the opponent\'s screen', steps: [
    { title: 'Click', desc: 'The player drags a piece from e2 to e4. The browser sends a tiny Move message over the open WebSocket. It does not update the board yet, or it shows the move greyed-out as "pending".' },
    { title: 'Route', desc: 'The load balancer keeps this socket on the same game server. If that server does not own the game, it forwards the request to the owner found in Redis.' },
    { title: 'Validate', desc: 'The server checks: correct player, their turn, legal move for the current position, clock above zero. Anything wrong returns a Rejected message and nothing changes.' },
    { title: 'Apply', desc: 'The server updates the board, computes the new FEN, switches the turn, subtracts time from the clock and adds the increment.' },
    { title: 'Persist', desc: 'The move is appended to the Move table (ply, SAN, clock). Redis gets a copy of the latest state as a fast backup.' },
    { title: 'Broadcast', desc: 'A MoveApplied event goes to the game group: the opponent, the mover (to confirm), and spectators on any server via the Redis backplane.' },
    { title: 'Finish?', desc: 'If it is checkmate, stalemate, repetition or a flag fall, the game is marked finished and a GameFinished event is queued for the rating worker.' }
  ] },
  code: [
    { lang: 'csharp', title: 'Server-side move validation (knight, bishop, basic turn and clock checks)', code: `// A small slice of a chess rules engine. Real engines also handle
// check, castling, en passant and promotion. The important idea:
// the server validates; the browser only asks.
public enum Color { White, Black }
public record Piece(char Type, Color Color);          // 'K','Q','R','B','N','P'
public record MoveRequest(string From, string To, char? Promotion);

public sealed class GameState
{
    public Piece?[,] Board { get; } = new Piece?[8, 8];
    public Color SideToMove { get; private set; } = Color.White;
    public long WhiteClockMs { get; set; }
    public long BlackClockMs { get; set; }
    public List<string> Moves { get; } = new();

    public (bool ok, string reason) TryMove(Color player, MoveRequest req, long elapsedMs)
    {
        if (player != SideToMove) return (false, "Not your turn");
        var clock = player == Color.White ? WhiteClockMs : BlackClockMs;
        if (clock - elapsedMs <= 0) return (false, "Flag fell");

        var (fr, fc) = Square(req.From);
        var (tr, tc) = Square(req.To);
        var piece = Board[fr, fc];
        if (piece is null || piece.Color != player) return (false, "No piece of yours there");
        if (Board[tr, tc]?.Color == player) return (false, "Cannot capture own piece");
        if (!IsLegalShape(piece, fr, fc, tr, tc)) return (false, "Illegal move for " + piece.Type);

        // Apply
        Board[tr, tc] = piece; Board[fr, fc] = null;
        if (player == Color.White) WhiteClockMs -= elapsedMs; else BlackClockMs -= elapsedMs;
        SideToMove = player == Color.White ? Color.Black : Color.White;
        Moves.Add(req.From + req.To);
        return (true, "");
    }

    private bool IsLegalShape(Piece p, int fr, int fc, int tr, int tc)
    {
        int dr = tr - fr, dc = tc - fc;
        switch (p.Type)
        {
            case 'N': return (Math.Abs(dr) == 2 && Math.Abs(dc) == 1) || (Math.Abs(dr) == 1 && Math.Abs(dc) == 2);
            case 'B': return Math.Abs(dr) == Math.Abs(dc) && dr != 0 && PathClear(fr, fc, tr, tc);
            case 'R': return (dr == 0 || dc == 0) && (dr != 0 || dc != 0) && PathClear(fr, fc, tr, tc);
            case 'Q': return ((dr == 0 || dc == 0) || Math.Abs(dr) == Math.Abs(dc)) && (dr != 0 || dc != 0) && PathClear(fr, fc, tr, tc);
            case 'K': return Math.Abs(dr) <= 1 && Math.Abs(dc) <= 1 && (dr != 0 || dc != 0);
            case 'P':
                int dir = p.Color == Color.White ? 1 : -1;
                bool capture = Board[tr, tc] is not null;
                if (!capture && dc == 0 && dr == dir) return true;
                if (!capture && dc == 0 && dr == 2 * dir && fr == (p.Color == Color.White ? 1 : 6) && Board[fr + dir, fc] is null) return true;
                if (capture && Math.Abs(dc) == 1 && dr == dir) return true;
                return false;
        }
        return false;
    }

    private bool PathClear(int fr, int fc, int tr, int tc)
    {
        int sr = Math.Sign(tr - fr), sc = Math.Sign(tc - fc);
        for (int r = fr + sr, c = fc + sc; r != tr || c != tc; r += sr, c += sc)
            if (Board[r, c] is not null) return false;
        return true;
    }

    private static (int row, int col) Square(string s) => (s[1] - '1', s[0] - 'a');   // "e2" -> (1,4)
}` },
    { lang: 'csharp', title: 'SignalR hub: join a game, move, broadcast, reconnect', code: `using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

[Authorize]
public class GameHub : Hub
{
    private readonly IGameRegistry _games;      // in-memory games owned by this server (+ Redis lookup)
    private readonly IMoveStore _store;         // append-only move table
    public GameHub(IGameRegistry games, IMoveStore store) { _games = games; _store = store; }

    // Called on page load AND after a reconnect. lastPlySeen lets us send only what was missed.
    public async Task JoinGame(string gameId, int lastPlySeen)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "game:" + gameId);
        var missed = await _store.GetMovesAfterAsync(gameId, lastPlySeen);
        var state = _games.Get(gameId).State;
        await Clients.Caller.SendAsync("Sync", new { moves = missed, state.WhiteClockMs, state.BlackClockMs, state.SideToMove });
    }

    public async Task Move(string gameId, string from, string to, char? promotion)
    {
        var userId = Context.UserIdentifier!;
        var game = _games.Get(gameId);
        var player = game.ColorOf(userId);            // throws if not a player (spectators cannot move)
        var elapsed = game.MillisSinceLastMove();

        var (ok, reason) = game.State.TryMove(player, new MoveRequest(from, to, promotion), elapsed);
        if (!ok) { await Clients.Caller.SendAsync("Rejected", reason); return; }

        var ply = game.State.Moves.Count;
        await _store.AppendAsync(gameId, ply, from + to, game.State.WhiteClockMs, game.State.BlackClockMs);

        // Redis backplane (services.AddSignalR().AddStackExchangeRedis(...)) makes this reach
        // spectators connected to other servers too.
        await Clients.Group("game:" + gameId).SendAsync("MoveApplied", new
        {
            ply, uci = from + to, game.State.WhiteClockMs, game.State.BlackClockMs, sideToMove = game.State.SideToMove
        });

        if (game.IsOver(out var result))
            await _games.FinishAsync(gameId, result);   // publishes GameFinished for the rating worker
    }

    public override async Task OnDisconnectedAsync(Exception? ex)
    {
        // Do not forfeit immediately. Start a grace timer; the clock keeps running server-side.
        _games.NoteDisconnect(Context.UserIdentifier!, graceSeconds: 15);
        await base.OnDisconnectedAsync(ex);
    }
}` },
    { lang: 'text', title: 'Architecture sketch to draw on the whiteboard', code: `[Browser / Mobile]
   |  HTTPS (login, history, join queue)          |  WebSocket (moves, clocks, chat)
   v                                              v
[API gateway / Load balancer]  --sticky sessions-->  [Game servers x N  (ASP.NET Core + SignalR)]
   |                                                   |   owns games by consistent hash(gameId)
   |                                                   |   in-memory state + clocks
   v                                                   v
[Matchmaking svc] <--queue per time control-->     [Redis]  (game->server map, leases, pub/sub backplane, last state)
   |                                                   |
   v                                                   v
[Rating worker] <--GameFinished events (queue)--   [SQL DB]  Games, Moves (append-only), Users, Ratings
                                                       |
                                                       v
                                               [Cold storage / archive]  games older than N days (PGN files)` }
  ],
  pitfalls: [
    'Letting the browser send the whole board position. The server must keep its own position and accept only from/to squares.',
    'Running the clock in the browser. Clocks live on the server; the browser only animates.',
    'Forfeiting a player the moment the socket drops. Give a short grace period and let them resync by last ply seen.',
    'Fanning out big-game broadcasts from one server to every spectator directly. Use a pub/sub backplane and local fan-out.',
    'Updating ratings inside the move request. Do it in a background worker from a GameFinished event.',
    'Forgetting sticky routing for WebSockets behind a load balancer, which causes random disconnects.'
  ],
  quiz: [
    { q: 'Why must move validation happen on the server and not in the browser?', options: ['Browsers are too slow to run chess rules for a full game', 'Anyone can edit browser code, so only the server can be trusted', 'JavaScript cannot represent a chess board or the piece positions on it', 'Servers have more memory to hold the board'], answer: 1, why: 'The browser is under the user\'s control. Only the server can be trusted to enforce the rules.' },
    { q: 'What is the main scaling limit for a chess site: bandwidth or connections?', options: ['Bandwidth, because each move message carries the whole board as an image', 'Connections, because moves are tiny but many sockets stay open', 'Disk space, because finished games fill the database within a day', 'CPU, because the server renders every board as a picture'], answer: 1, why: 'A move is about 50 bytes. The hard part is keeping a huge number of long-lived connections open and routed correctly.' },
    { q: 'What does a Redis backplane do for SignalR?', options: ['Stores user passwords and login sessions for the hubs', 'Relays messages so clients on other servers also receive them', 'Validates chess moves before the hub method runs', 'Replaces the SQL database as the durable store for games'], answer: 1, why: 'The backplane relays group messages between servers so spectators on server B see moves made on server A.' },
    { q: 'A player loses their connection for 10 seconds. What should happen?', options: ['They lose the game immediately, because the server cannot wait', 'The game and both clocks pause for everyone until they come back', 'Their clock keeps running; on reconnect they get the missed moves', 'The game is deleted and both players are sent back to the queue'], answer: 2, why: 'Server-side clocks plus a sync-by-last-ply reconnect keep the game fair and simple.' },
    { q: 'Why store moves as an append-only log instead of only the current board?', options: ['It uses less space than storing one board position per game', 'You can replay it to rebuild any position, even after a crash', 'SQL databases cannot store a board, only rows of moves', 'It makes each new move faster for the server to validate than a board does'], answer: 1, why: 'An event log of moves is the durable truth; the current board is just a cache you can rebuild.' },
    { q: 'How should a server make sure it is the only owner of a game?', options: ['Ask every other server over HTTP before each move', 'Take a lease in Redis with SET NX and an expiry', 'Lock the whole Games table for the life of the game', 'Use a bigger server so no other server is needed'], answer: 1, why: 'A lease (a key that only one server can create, with a timeout) prevents two servers from writing the same game.' }
  ],
  takeaways: [
    'Start with functional and non-functional requirements and rough numbers; chess is connection-heavy, not bandwidth-heavy.',
    'The server is the referee: it validates moves, runs clocks and owns the truth. The browser is a remote control.',
    'Moves are an append-only event log; the board is a cache you can rebuild.',
    'Shard games by id so one server owns a game; use Redis leases to prevent two owners.',
    'Use a pub/sub backplane for spectators and background workers for ratings.',
    'Design for reconnects and partial failures: grace periods, sync-by-last-ply, degrade instead of crash.'
  ],
  interview: [
    { q: 'Why WebSockets instead of polling for a chess game?', a: '<p>Polling makes every client ask the server many times a second even when nothing happened, which wastes resources and adds delay. A WebSocket is one open connection where the server pushes a move the instant it happens. Moves are small and frequent, so push is both cheaper and faster.</p>' },
    { q: 'How would you handle a server crash in the middle of 10,000 games?', a: '<p>Games are sharded by id, so only that server\'s games are affected. Another server picks up ownership (lease expires), rebuilds each game by replaying the move log from the database or loading the last state snapshot from Redis, and clients reconnect and sync from their last seen ply. Clocks resume from the persisted values, with a small pause credited to both players.</p>' },
    { q: 'How do you detect cheating with an engine?', a: '<p>Statistically. Compare a player\'s moves against engine top choices over many games and look at move-time patterns. Humans vary their thinking time and make small mistakes; engine users match top moves at an unusual rate with flat timing. Combine with account signals and human review before banning.</p>' },
    { q: 'Where would you put matchmaking and why?', a: '<p>In a separate service with a queue per time control. It pairs players by rating range that widens with wait time. Keeping it separate means the game servers stay simple and matchmaking can be tuned or restarted without touching live games.</p>' }
  ]
};

window.CONTENT['m3-case-hotstar'] = {
  hook: `Twenty-five million people press play on the same cricket ball. Your job is to make sure none of them see a spinning wheel.`,
  intro: `<p>This case study designs a live video streaming service like Hotstar (JioHotstar), YouTube Live or Twitch, with the extra twist that India's biggest cricket matches have pulled in more than 50 million viewers at the same time. Live is harder than on-demand video (Netflix) because the content is being created <em>right now</em>: you cannot pre-process it days ahead, and everybody wants the same seconds of video at the same moment.</p>
<p>Three words carry this design. <span class="term">Transcoding</span>: converting the one high-quality camera feed into several sizes so a phone on 3G and a TV on fibre both get something that plays. <span class="term">Segmenting</span>: cutting the video into small files (2 to 6 seconds each) so it can be delivered over plain HTTP. <span class="term">CDN</span> (content delivery network): thousands of cache servers near users that serve those small files so our origin servers are not crushed.</p>
<p>We will cover requirements, numbers, the pipeline from camera to screen, the API, data model, deep dives (adaptive bitrate, latency tiers, pre-scaling, DRM, real-time stats), and what to do when things break during the final over.</p>`,
  realLife: { title: 'A newspaper printed every two seconds', body: `<p>Imagine a newspaper that comes out every two seconds. The newsroom (the stadium) writes one master copy. A print shop (the transcoder) makes a big-print edition, a normal one and a pocket one. Vans (the CDN) carry stacks of each edition to kiosks in every town. Readers walk to the nearest kiosk and pick the size that fits their bag. Nobody drives to the newsroom.</p>
<p>That is live streaming. The master feed is cut into tiny two-second files in several qualities, pushed to edge caches across the country, and players fetch the next file from the nearest cache. If a kiosk runs out, it asks a regional depot, not the newsroom. The newsroom only ever prints one copy of each edition.</p>
<p>Hotstar famously prepared for the cricket World Cup by load-testing to tens of millions of concurrent users months in advance, pre-warming servers before each match, and building "panic modes" that turn off non-essential features so the video keeps playing.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Requirements</h4>
<p><strong>Functional</strong>: watch a live match with a few seconds of delay; pick or auto-select quality; pause and rewind a little (DVR); see live score and commentary; get notified when a wicket falls; log in and check subscription; watch the replay afterwards.</p>
<p><strong>Non-functional</strong>: 25 to 50 million concurrent viewers at peak; start-up time under 2 seconds; rebuffering (the spinning wheel) under 0.5% of watch time; delay behind real life of about 10 to 30 seconds for normal mode and under 5 seconds for a "low latency" mode; content must be protected (DRM) and only shown to paying users; the system must survive sudden spikes when a famous player walks in.</p>
<h4>Numbers that shape the design</h4>
<ul>
<li>50 million viewers × an average 3 Mbps stream = 150 Tbps. No single data centre can send that. This number alone tells you that the CDN does almost all the delivery.</li>
<li>Video segments are 4 seconds long at, say, 5 quality levels. The origin produces only 5 small files every 4 seconds per match. Tiny output, massive fan-out.</li>
<li>Spikes: viewers can double in two minutes when a star batter comes out. Scaling must be done <em>before</em> it happens, not after.</li>
</ul>
<h4>The pipeline, in plain words</h4>
<ol>
<li><strong>Ingest</strong>: the stadium sends one high-quality feed (over a protocol such as SRT or RTMP) to two or more ingest servers in different regions.</li>
<li><strong>Transcode</strong>: machines with GPUs turn it into a ladder of qualities: 240p, 480p, 720p, 1080p, 4K.</li>
<li><strong>Package</strong>: each quality is cut into 2 to 6 second segments and a playlist (manifest) lists them. Formats: HLS (.m3u8) and DASH (.mpd).</li>
<li><strong>Origin + shield</strong>: segments are written to an origin store; a shield cache in front of it protects it.</li>
<li><strong>CDN edge</strong>: thousands of edge servers cache segments near users.</li>
<li><strong>Player</strong>: the app downloads the manifest, then keeps fetching the next segment, switching quality as the network changes.</li>
</ol>
<div class="callout tip"><p>Say early: "Delivery is a CDN problem, the hard parts for us are the pipeline, the control plane (auth, entitlements, stats) and surviving spikes." That shows you understand where the real work is.</p></div>` },
    { name: 'Intermediate', body: `<h4>API design (control plane)</h4>
<table><thead><tr><th>Endpoint</th><th>Purpose</th></tr></thead><tbody>
<tr><td>POST /api/auth/login</td><td>JWT for the app</td></tr>
<tr><td>GET /api/events/live</td><td>List of live matches with thumbnails and viewer counts (cached heavily)</td></tr>
<tr><td>POST /api/playback/{eventId}/session</td><td>Checks subscription and region, returns a short-lived signed manifest URL + DRM licence token</td></tr>
<tr><td>GET https://cdn.../{eventId}/master.m3u8</td><td>Manifest listing quality variants (CDN)</td></tr>
<tr><td>GET https://cdn.../{eventId}/720p/seg_104523.ts</td><td>A video segment (CDN)</td></tr>
<tr><td>GET /api/events/{id}/score (or SSE/WebSocket)</td><td>Live score & commentary</td></tr>
<tr><td>POST /api/playback/heartbeat</td><td>Every 30 s: position, quality, rebuffer count (for stats and concurrency limits)</td></tr>
</tbody></table>
<h4>Data model</h4>
<ul>
<li><strong>Event</strong>: Id, Title, StartsAt, Status (Scheduled, Live, Ended), IngestUrls, Ladder (list of qualities), DrmKeyId.</li>
<li><strong>Entitlement</strong>: UserId, PlanId, Region, ExpiresAt, MaxConcurrentStreams.</li>
<li><strong>PlaybackSession</strong>: Id, UserId, EventId, DeviceId, StartedAt, LastHeartbeat (in Redis with TTL, not SQL).</li>
<li><strong>Segment metadata</strong> is not in a database at all: it lives in the manifest files on the origin and CDN.</li>
</ul>
<h4>High-level architecture</h4>
<ul>
<li><strong>Ingest layer</strong> (2+ regions, redundant feeds).</li>
<li><strong>Transcoding farm</strong> (GPU containers, one job per event, hot spare per event).</li>
<li><strong>Packager</strong> producing HLS and DASH with 2 to 6 s segments; <span class="term">CMAF</span> lets one set of files serve both.</li>
<li><strong>Origin storage</strong> (object store) + origin shield cache.</li>
<li><strong>Multi-CDN</strong>: two or three CDN providers with a steering service that sends each viewer to the healthiest one.</li>
<li><strong>Control plane services</strong>: auth, entitlement, playback session, stats, notifications. Stateless, behind an API gateway, heavily cached.</li>
<li><strong>Real-time layer</strong>: a pub/sub fan-out for scores and notifications (WebSocket or SSE servers, or push notifications).</li>
</ul>
<h4>Deep dive: adaptive bitrate (ABR)</h4>
<p>The player measures how fast the last segments downloaded and how much video it has buffered. If the buffer is shrinking, it drops to a lower quality for the next segment; if the buffer is full and bandwidth is high, it steps up. Because all qualities share the same segment boundaries, switching has no visible glitch. The ladder is designed so that neighbouring steps are about 1.5x to 2x apart in bitrate.</p>
<h4>Deep dive: latency tiers</h4>
<div class="compare"><div><h5>Standard latency (15 to 30 s)</h5><p>6-second segments, player buffers 3 segments. Very stable, cheapest, best for most viewers.</p></div><div><h5>Low latency (2 to 5 s)</h5><p>LL-HLS or LL-DASH: segments are split into sub-second parts and delivered as they are produced. Harder to cache, more rebuffering risk, used for betting-sensitive or "spoiler-free" experiences.</p></div></div>
<h4>Deep dive: pre-scaling for a big match</h4>
<p>Autoscaling reacts in minutes; a wicket brings millions in seconds. So capacity is planned, not reacted to: pre-warm control-plane servers and CDN caches hours before, pre-fetch the first segments to edges, use a traffic forecast per match, and run a "game day" load test to the expected peak times 1.5.</p>` },
    { name: 'Expert', body: `<h4>Why the control plane is the real bottleneck</h4>
<p>The CDN serves video. But every one of 50 million viewers hits <em>our</em> API when they open the app, log in, request a playback session, and send heartbeats. 50 million session requests in a 2-minute spike is roughly 400,000 requests per second on the control plane. Techniques:</p>
<ul>
<li><strong>Cache everything readable</strong> (event list, manifests, score) at the CDN and in Redis, with short TTLs (1 to 5 s). A 2-second TTL at 400k rps turns into a few hundred origin hits.</li>
<li><strong>Make tokens self-validating</strong>: signed JWTs carrying entitlement claims, so the playback session check does not need a database read. Short expiry plus a revocation list in Redis for the rare cancellation.</li>
<li><strong>Heartbeats to a write-optimised path</strong>: Kafka first, aggregated later. Never a synchronous SQL insert per heartbeat.</li>
<li><strong>Request shedding with priority</strong>: when overloaded, drop analytics and recommendations before you drop playback session calls.</li>
</ul>
<h4>Panic mode (graceful degradation)</h4>
<p>Build feature flags you can flip during a match: turn off personalised home page (serve a static one), turn off comments, extend cache TTLs, cap the top quality to 720p, switch low-latency viewers to standard latency. The order matters: things that save the most capacity with the least user pain go first. Rehearse flipping them.</p>
<h4>DRM and anti-piracy</h4>
<p>Segments are encrypted (AES-128 or CENC). The key is never in the manifest; the player gets a licence from a DRM server (Widevine on Android/Chrome, FairPlay on Apple, PlayReady on Windows/Edge) after proving the user is entitled. Add forensic watermarking on premium streams so a leaked copy can be traced to an account. Signed, expiring CDN URLs stop link sharing.</p>
<h4>Multi-CDN steering</h4>
<p>No single CDN can be trusted with the final of a World Cup. A steering service measures real client performance (from heartbeats) per CDN and region and tells each new session which CDN host to use, with mid-stream failover supported by the player (the manifest can list multiple base URLs). Commercial contracts usually commit capacity per CDN ahead of time.</p>
<h4>Real-time stats and notifications</h4>
<p>Scores change every ball; a notification "WICKET!" must reach millions within seconds. Use a tiered fan-out: one publisher writes to a topic; regional fan-out servers each hold a few hundred thousand WebSocket/SSE connections and relay; mobile push goes through the platform services (APNs, FCM) in batches. Concurrent viewer counts are computed from heartbeats using approximate counting (HyperLogLog in Redis), because exact counts are not worth the cost.</p>
<h4>Chaos and failure modes</h4>
<ul>
<li><strong>Ingest feed dies</strong>: automatic switch to the redundant feed in the other region; the player sees at most one segment of glitch.</li>
<li><strong>Transcoder crash</strong>: hot spare already running on the same feed produces identical segment names so the CDN does not notice.</li>
<li><strong>One CDN degrades</strong>: steering shifts new sessions within a minute; players retry on the alternate base URL.</li>
<li><strong>Origin overloaded</strong>: the shield cache plus request collapsing means one fetch per segment per quality, however many edges ask.</li>
<li><strong>Database down</strong>: playback must keep working because tokens are self-validating and manifests are on the CDN; only sign-ups and plan changes stop.</li>
</ul>
<h4>Trade-offs to state out loud</h4>
<p>Longer segments = more stable, more delay. More qualities = better fit per device, more transcoding cost and CDN cache spread. Exact concurrency = expensive; approximate = cheap and good enough. Low latency = nicer, but fragile at 50 million.</p>
<h4>45-minute plan</h4>
<p>5 min requirements and the 150 Tbps number, 5 min pipeline (camera to player), 5 min API and data model, 10 min architecture diagram incl. multi-CDN and control plane, 10 min deep dives (ABR, pre-scaling, panic mode), 5 min DRM and real-time, 5 min failure modes and questions.</p>` }
  ],
  flow: { title: 'From the stadium camera to 50 million screens', steps: [
    { title: 'Ingest', desc: 'The broadcast truck sends one high-quality feed to two ingest servers in different regions, so one failure does not stop the match.' },
    { title: 'Transcode', desc: 'GPU servers convert that feed into a ladder of qualities: 240p for weak mobile data up to 4K for big TVs. A hot spare runs in parallel.' },
    { title: 'Package', desc: 'Each quality is cut into 4-second segments. A manifest file lists the latest segments. Segments are encrypted for DRM.' },
    { title: 'Origin + shield', desc: 'Segments land in origin storage. A shield cache in front answers CDN requests, so each segment is fetched from origin once, not thousands of times.' },
    { title: 'CDN edge', desc: 'Edge servers near users cache the segments. Multi-CDN steering sends each viewer to the healthiest provider for their region.' },
    { title: 'Entitle', desc: 'The app asks our API for a playback session. A signed token proves the user may watch; the DRM server issues a licence to decrypt.' },
    { title: 'Play + adapt', desc: 'The player fetches segment after segment, measuring speed and buffer, stepping quality up or down so the video never stalls.' },
    { title: 'Heartbeat + react', desc: 'Every 30 s the player reports quality and rebuffers. Those numbers drive CDN steering, live viewer counts and panic-mode decisions.' }
  ] },
  code: [
    { lang: 'csharp', title: 'Playback session endpoint: entitlement check, signed CDN URL, concurrency cap', code: `// Minimal API in ASP.NET Core. The heavy video traffic never touches this service;
// it only hands out short-lived, signed URLs after checking the user may watch.
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using StackExchange.Redis;

app.MapPost("/api/playback/{eventId}/session", [Authorize] async (
    string eventId, HttpContext http, IEntitlementCache entitlements, IConnectionMultiplexer redis, ICdnSteering steering) =>
{
    var userId = http.User.FindFirst("sub")!.Value;   // needs MapInboundClaims = false in AddJwtBearer; by default "sub" is renamed to ClaimTypes.NameIdentifier
    var region = http.User.FindFirst("region")?.Value ?? "IN";

    // 1. Entitlement: claims in the JWT + a tiny Redis revocation check. No SQL on the hot path.
    var ent = await entitlements.GetAsync(userId);                  // cached, TTL ~60 s
    if (ent is null || ent.ExpiresAt < DateTime.UtcNow) return Results.StatusCode(402);
    if (!ent.Regions.Contains(region)) return Results.StatusCode(451);

    // 2. Concurrency cap: count this user's sessions seen in the last 90 s (the heartbeat consumer refreshes each session's score)
    var db = redis.GetDatabase();
    var sessionKey = "sess:" + userId;
    var active = await db.SortedSetLengthAsync(sessionKey, DateTimeOffset.UtcNow.AddSeconds(-90).ToUnixTimeSeconds(), double.PositiveInfinity);
    if (active >= ent.MaxConcurrentStreams) return Results.Conflict(new { error = "too_many_streams" });

    var sessionId = Guid.NewGuid().ToString("N");
    await db.SortedSetAddAsync(sessionKey, sessionId, DateTimeOffset.UtcNow.ToUnixTimeSeconds());
    await db.KeyExpireAsync(sessionKey, TimeSpan.FromMinutes(5));

    // 3. Pick a CDN and sign a URL that expires in 10 minutes (the player refreshes it in the background)
    var cdnHost = steering.PickHost(region, eventId);
    var expires = DateTimeOffset.UtcNow.AddMinutes(10).ToUnixTimeSeconds();
    var path = "/live/" + eventId + "/master.m3u8";
    var signature = Sign(path + expires, app.Configuration["Cdn:SigningKey"]!);
    var manifestUrl = "https://" + cdnHost + path + "?exp=" + expires + "&sig=" + signature;

    return Results.Ok(new { sessionId, manifestUrl, drmLicenseUrl = "/api/drm/license/" + sessionId, heartbeatSeconds = 30 });
});

static string Sign(string data, string key)
{
    using var h = new HMACSHA256(Encoding.UTF8.GetBytes(key));
    return Convert.ToHexString(h.ComputeHash(Encoding.UTF8.GetBytes(data))).ToLowerInvariant();
}

// Heartbeat: write-optimised. Enqueue to Kafka; a consumer updates Redis counters and steering stats.
app.MapPost("/api/playback/heartbeat", [Authorize] async (Heartbeat hb, IEventProducer producer, IConnectionMultiplexer redis) =>
{
    await producer.ProduceAsync("playback-heartbeats", hb);                       // fire and forget style
    var minute = DateTimeOffset.UtcNow.ToUnixTimeSeconds() / 60;                  // one counter per minute, so it means "watching now", not "ever watched"
    await redis.GetDatabase().HyperLogLogAddAsync("viewers:" + hb.EventId + ":" + minute, hb.SessionId);   // approximate live count
    return Results.Accepted();
});

public record Heartbeat(string SessionId, string EventId, string Cdn, int QualityKbps, int RebufferMs, double PositionSec);` },
    { lang: 'text', title: 'Architecture sketch: the whiteboard version', code: `STADIUM ---SRT/RTMP---> [Ingest A (region 1)]      [Ingest B (region 2)]   (redundant feeds)
                              |                           |
                              v                           v
                     [Transcoder farm (GPU) + hot spare] -> ladder: 240p ... 4K
                              |
                              v
                     [Packager: HLS/DASH (CMAF), 4 s segments, AES/CENC encryption]
                              |
                              v
                     [Origin store] <- [Origin shield cache]  (one fetch per segment, request collapsing)
                              |
          +-------------------+-------------------+
          v                   v                   v
      [CDN provider 1]    [CDN provider 2]    [CDN provider 3]      <- multi-CDN steering by real client metrics
          \\                  |                  /
           +------ thousands of edge caches -----+
                              |
                              v
                        [Players: mobile, web, TV]   ABR: pick quality per segment
                              |
          control plane (HTTPS, small requests, huge count):
          [API gateway] -> [Auth] [Entitlement (JWT claims + Redis)] [Playback session] [DRM licence]
                        -> [Heartbeats -> Kafka -> stats, steering, viewer counts (HyperLogLog)]
                        -> [Score/notification fan-out: pub/sub -> regional WebSocket/SSE -> apps; APNs/FCM push]
          feature flags: PANIC MODE (static home, longer TTLs, cap 720p, disable comments)` },
    { lang: 'csharp', title: 'Panic-mode feature flags: shed load in the right order', code: `// A tiny "degradation ladder". Each level turns off something that costs capacity.
// Ops flips the level from a dashboard during a spike; code reads it from Redis every few seconds.
public enum PanicLevel { Normal = 0, Light = 1, Heavy = 2, VideoOnly = 3 }

public sealed class DegradationPolicy
{
    private readonly IConnectionMultiplexer _redis;
    private PanicLevel _cached = PanicLevel.Normal;
    private DateTime _lastRead = DateTime.MinValue;
    public DegradationPolicy(IConnectionMultiplexer redis) => _redis = redis;

    public async Task<PanicLevel> LevelAsync()
    {
        if (DateTime.UtcNow - _lastRead < TimeSpan.FromSeconds(5)) return _cached;
        var v = await _redis.GetDatabase().StringGetAsync("panic:level");
        _cached = v.HasValue ? (PanicLevel)(int)v : PanicLevel.Normal;
        _lastRead = DateTime.UtcNow;
        return _cached;
    }

    public bool PersonalisedHome(PanicLevel l) => l < PanicLevel.Light;      // first thing to go
    public bool Comments(PanicLevel l)         => l < PanicLevel.Heavy;
    public int  MaxQualityKbps(PanicLevel l)   => l >= PanicLevel.Heavy ? 3000 : int.MaxValue;   // cap at ~720p
    public TimeSpan ManifestTtl(PanicLevel l)  => l >= PanicLevel.Light ? TimeSpan.FromSeconds(6) : TimeSpan.FromSeconds(2);
    public bool LowLatencyAllowed(PanicLevel l)=> l < PanicLevel.VideoOnly;  // last resort: everyone on standard latency
}

// Usage in the home endpoint:
// var level = await policy.LevelAsync();
// return policy.PersonalisedHome(level) ? await recs.ForUser(userId) : StaticHome.Cached;` }
  ],
  pitfalls: [
    'Trying to serve video from your own servers. At tens of millions of viewers only a CDN (ideally several) can carry it.',
    'Reacting to spikes with autoscaling. Pre-scale by forecast, pre-warm caches and rehearse the big match.',
    'Putting a database read on the playback-session path. Make tokens self-validating and cache entitlements.',
    'Writing each heartbeat straight into SQL. Stream them through Kafka and aggregate.',
    'One ingest feed, one transcoder. Everything in the pipeline needs a hot spare in another region.',
    'Putting the DRM key in the manifest or a plain URL. Keys come from a licence server after entitlement.'
  ],
  quiz: [
    { q: 'Why does a live streaming service rely so heavily on a CDN?', options: ['CDNs transcode the camera feed into every quality level', 'Delivery bandwidth is far beyond any single data centre', 'CDNs store the user accounts and subscription records', 'CDNs are the only place where DRM licences can be issued'], answer: 1, why: '50 million viewers at 3 Mbps is about 150 Tbps. Only a distributed network of edge caches can deliver that.' },
    { q: 'What does adaptive bitrate (ABR) do?', options: ['Compresses only the audio so that the video can stay sharp', 'Lets the player switch quality per segment as the network changes', 'Encrypts each segment with a different key for every viewer', 'Lowers the number of viewers allowed in during a spike'], answer: 1, why: 'All qualities share segment boundaries, so the player can step up or down without a glitch.' },
    { q: 'Why is the control plane (login, playback session) a bottleneck even though video goes through the CDN?', options: ['It is written in a slower language than the CDN software', 'Every viewer hits it at the same moment during a spike', 'It stores the video segments before the CDN copies them', 'It runs the transcoders, which need GPUs'], answer: 1, why: 'A wicket can bring millions of app opens within a minute; each needs auth and a session.' },
    { q: 'What is the right response when a sudden spike overloads the system?', options: ['Show an error page to everyone until the traffic drops again', 'Flip panic-mode flags: drop extras and keep the video playing', 'Restart all servers at once to clear their queues', 'Stop all new logins for the rest of the match'], answer: 1, why: 'Graceful degradation sheds the least-important features first so the core (video) keeps working.' },
    { q: 'Why use an origin shield cache?', options: ['To encrypt segments before they reach the CDN edges', 'So many edges asking for a new segment cause one origin fetch', 'To store user heartbeats until Kafka is ready to read them', 'To speed up transcoding by caching the camera feed near the GPUs'], answer: 1, why: 'The shield collapses duplicate requests, protecting the origin from the whole CDN asking at once.' },
    { q: 'How should live viewer counts be computed at this scale?', options: ['Exactly, with a SQL COUNT that runs on every single heartbeat', 'Approximately, with HyperLogLog fed by heartbeats', 'By asking the CDN how many segments it served today', 'By counting logins since the match started'], answer: 1, why: 'An approximate count is cheap and accurate enough; an exact count per heartbeat would melt the database.' }
  ],
  takeaways: [
    'Numbers first: 50M × 3 Mbps shows that the CDN is the delivery layer and the control plane is your bottleneck.',
    'Pipeline: ingest (redundant) → transcode (hot spare) → package (short encrypted segments) → origin + shield → multi-CDN → player with ABR.',
    'Pre-scale by forecast and rehearsal; autoscaling is too slow for a wicket.',
    'Self-validating tokens, aggressive short-TTL caching and Kafka-backed heartbeats keep the control plane alive.',
    'Build and rehearse panic mode: a ladder of features to turn off while video keeps playing.',
    'DRM licences, signed expiring URLs and watermarking protect premium content.'
  ],
  interview: [
    { q: 'What is the difference between live and on-demand streaming design?', a: '<p>On-demand content is processed once, ahead of time, and cached for a long time; the hard part is catalogue size and personalisation. Live content is produced now, everyone wants the same seconds at once, and spikes are sudden. So live design focuses on a redundant real-time pipeline, short-TTL caching, pre-scaling and graceful degradation.</p>' },
    { q: 'How do you keep latency low for live sports?', a: '<p>Shorter segments (2 s) or LL-HLS/LL-DASH partial segments, smaller player buffers, and CDNs that support chunked transfer. The trade-off is more rebuffering risk; many services keep a stable standard mode and offer low latency only on good networks.</p>' },
    { q: 'How would you protect the content from piracy?', a: '<p>Encrypt segments and deliver keys through a DRM licence server (Widevine, FairPlay, PlayReady) after an entitlement check; sign CDN URLs with short expiry; cap concurrent streams per account; add forensic watermarks to trace leaks; monitor for restreams.</p>' },
    { q: 'How do you handle a failure of the main CDN during the final over?', a: '<p>Multi-CDN with a steering service: client metrics show the degradation within a minute, new sessions are sent to other providers, and players already playing fail over to the alternate base URL listed in the manifest. Capacity on each CDN was reserved in advance.</p>' }
  ]
};

window.CONTENT['m3-case-netflix-frontend'] = {
  hook: `A Netflix-style home page can hold 2,000 posters, yet it has to load in about a second on a cheap TV. The trick is that it only ever draws about forty.`,
  intro: `<p>Frontend system design interviews ask you to design the <em>client side</em> of a big product: how the screen is built from components, how data is fetched and cached, how it stays fast on slow devices, and how teams ship changes safely. Here we design the Netflix-style browse page: rows ("rails") of movie posters, a hero banner, hover previews, and a video player.</p>
<p>The key ideas are <span class="term">virtualization</span> (render only what is on screen), <span class="term">prefetching</span> (load what the user will probably need next, before they ask), image delivery through a CDN with the right sizes, and a strict <span class="term">performance budget</span> (a number, like "first content in 1.5 s on a mid-range phone", that the team is not allowed to break).</p>
<p>Examples use Angular with signals and standalone components, but the design is the same in React or Vue.</p>`,
  realLife: { title: 'A shop window, not a warehouse', body: `<p>A shop does not put every product in the window. It shows a few, arranged well, and keeps the rest in the back. As you walk along the street, the window changes to what you are looking at. If the shop tried to put all 2,000 products in the window, it would take an hour to set up and you would not find anything anyway.</p>
<p>The browse page works the same way. The browser only "sets up" (renders) the rows and posters near your scroll position. As you scroll, it swaps posters in and out, reusing the same few DOM elements. Images arrive at exactly the size of the poster box, from a server close to you, and the next row's images start loading while you are still looking at this one.</p>
<p>Netflix engineers have written about taking a heavy client-side framework off their sign-up landing page and using plain JavaScript there, which made the page ready to use much sooner. On TVs they draw the screen with a light custom rendering layer, because on slow hardware every extra bit of work is felt as a delay on the remote.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Requirements</h4>
<p><strong>Functional</strong>: a home page with a hero banner and many horizontal rows of posters, each row scrollable; hover or focus shows a short preview; clicking opens details and the player; search; profiles; "continue watching" with saved position; works on web, phones and TVs (remote control navigation).</p>
<p><strong>Non-functional</strong>: first meaningful content within 1.5 s on a mid-range phone on 4G; scrolling at 60 frames per second; works when the network is flaky (shows cached content); accessible by keyboard and screen reader; safe to ship changes several times a day to millions of users; measurable (we must know if a release made things slower).</p>
<h4>Component tree (the shape of the page)</h4>
<ul>
<li><strong>AppShell</strong>: header, profile menu, router outlet. Loads first and stays.</li>
<li><strong>BrowsePage</strong>: fetches the list of rows (just titles and ids, not the posters).</li>
<li><strong>HeroBanner</strong>: one big image and an autoplay preview.</li>
<li><strong>Rail</strong> (one per row): a horizontally scrolling list; only renders the visible posters plus a few on each side.</li>
<li><strong>PosterCard</strong>: image, title, hover state. Tiny and dumb.</li>
<li><strong>PreviewOverlay</strong>: appears on hover/focus with a muted video clip.</li>
<li><strong>Player</strong>: lazy-loaded route, big and separate.</li>
</ul>
<h4>How data flows</h4>
<ol>
<li>App loads a small shell. The home API returns the row list in one call (about 20 rows, 10 KB).</li>
<li>Each visible rail asks for its posters (ids, titles, image keys). Rails below the fold wait.</li>
<li>Poster images are built from the image key plus the size needed: /img/{key}?w=300. The CDN returns a cached resized version.</li>
<li>User scrolls: rails that come into view load; rails far away unload their DOM but keep their data cached.</li>
</ol>
<div class="callout tip"><p>The interviewer wants to hear: "I split data into shape (rows) and content (posters), load shape first, and content only for what is visible."</p></div>
<h4>What makes TVs special</h4>
<p>TV browsers are slow and have little memory. Navigation is by arrow keys, so <em>focus</em> is the main interaction, not the mouse. The design must keep a "focused card" state and move it with the keys, scrolling rails as it goes.</p>` },
    { name: 'Intermediate', body: `<h4>API design (what the client needs)</h4>
<table><thead><tr><th>Call</th><th>Returns</th><th>Notes</th></tr></thead><tbody>
<tr><td>GET /api/browse/home?profile=</td><td>Row list: id, title, type, first 10 item ids</td><td>Cached 60 s per profile; small</td></tr>
<tr><td>GET /api/rows/{id}/items?offset=&limit=</td><td>Posters: id, title, imageKey, progress</td><td>Paged, as the user scrolls sideways</td></tr>
<tr><td>GET /api/titles/{id}</td><td>Details + preview clip URL</td><td>Prefetched on hover intent</td></tr>
<tr><td>GET https://img.cdn/{key}?w=300&fmt=avif</td><td>Resized image</td><td>Width from the poster box; AVIF/WebP with JPEG fallback</td></tr>
<tr><td>POST /api/progress</td><td>Save play position</td><td>Batched every 10 s, sendBeacon on unload</td></tr>
</tbody></table>
<h4>State management</h4>
<p>Three kinds of state, kept apart:</p>
<ul>
<li><strong>Server cache</strong>: rows and posters, keyed by id, with a timestamp. Lives in a service with signals; re-used across pages so going back is instant.</li>
<li><strong>UI state</strong>: scroll positions, focused card, open overlay. Local to components or a small store; restored when the user returns to Browse.</li>
<li><strong>Session state</strong>: profile, auth token, feature flags. App-wide, loaded once.</li>
</ul>
<h4>Deep dive: rail virtualization</h4>
<p>A rail may hold 200 posters, but the viewport fits about 8. Render index range [first - 3, last + 3], position them with CSS transforms, and recycle elements as the range moves. Use the Angular CDK virtual scroll for vertical rails-of-rails, and a small custom horizontal virtualizer per rail (fixed card width makes the maths trivial: index = scrollLeft / cardWidth).</p>
<h4>Deep dive: images</h4>
<ul>
<li>Request exactly the width the layout needs (and 2x for high-density screens).</li>
<li>Use the HTML <code>srcset</code>/<code>sizes</code> attributes or compute the URL from the measured box.</li>
<li>Lazy-load with <code>loading="lazy"</code> or an IntersectionObserver; give every image a fixed aspect-ratio box so the page does not jump (no layout shift).</li>
<li>Show a tiny blurred placeholder (a 20-pixel-wide version inlined as base64) while the real one loads.</li>
</ul>
<h4>Deep dive: prefetching</h4>
<p>Prefetch the <em>next</em> rail's posters when the user scrolls within one rail of it. Prefetch title details on "hover intent" (mouse rests on a card for 300 ms). Prefetch the Player route chunk after the home page is idle (requestIdleCallback). Never prefetch on a metered connection if the browser says so (navigator.connection.saveData).</p>
<h4>Deep dive: offline and caching</h4>
<p>A service worker caches the app shell and the last home response. If the network fails, the page still renders yesterday's rows with a small "offline" banner. Images already seen come from the HTTP cache with long max-age because their URLs contain a content hash.</p>
<h4>Accessibility</h4>
<p>Rails are lists with aria-label; cards are buttons with accessible names (title, year, "resume at 45 min"); a roving tabindex keeps one focusable card per rail; previews do not autoplay for users who prefer reduced motion; captions and audio descriptions are player features, not afterthoughts.</p>` },
    { name: 'Expert', body: `<h4>Performance budgets and how to enforce them</h4>
<p>Write the budget as numbers in the repo: JavaScript for the home route under 200 KB compressed; Largest Contentful Paint under 1.5 s on a mid-range phone; Interaction to Next Paint under 200 ms; zero layout shift. Enforce with a CI step that fails the build when a bundle grows past the limit, Lighthouse CI on every pull request, and real-user monitoring (RUM) that reports Web Vitals from production, split by device class and country. A budget nobody enforces is a wish.</p>
<h4>Rendering strategy</h4>
<p>Server-side render (Angular SSR) the shell and the first two rails with their poster URLs, so the first paint has real content before JavaScript runs. Hydrate incrementally: the hero and first rails first, lower rails only when they scroll into view (Angular's <code>@defer (on viewport)</code> blocks are built for exactly this). On TVs with weak CPUs, prefer fewer, simpler DOM nodes over clever animations.</p>
<h4>A/B testing and feature flags on the client</h4>
<p>Experiments are assigned on the server per profile and sent as a small map of flags with the home response, so the client never flickers between variants. The client reports which variant it rendered along with the metrics (click-through on a row, time to first play). Flags also act as kill switches: if a new rail component misbehaves, ops turns it off without a release.</p>
<h4>Player integration</h4>
<p>The player is a separate lazily loaded module. It uses Media Source Extensions with an ABR library (HLS/DASH), encrypted media extensions for DRM, and reports playback quality events. On hover previews, use a short pre-muxed MP4 clip, not the full ABR stack, because dozens of previews may start and stop per minute. Keep at most one preview playing at a time.</p>
<h4>Observability on the frontend</h4>
<ul>
<li>Web Vitals and custom marks (time to first poster, time to first play) via the Performance API, sampled and sent in batches.</li>
<li>Error tracking with source maps, grouped by release version; a release is rolled back automatically if its error rate exceeds the previous one by a margin.</li>
<li>Staged rollouts: 1% → 10% → 50% → 100% of profiles, watching metrics between steps.</li>
</ul>
<h4>Trade-offs to state</h4>
<div class="compare"><div><h5>Thin client, smart server</h5><p>Server decides rows and ordering; client just renders. Simpler client, easier experiments, more server load, less offline ability.</p></div><div><h5>Smart client</h5><p>Client fetches a catalogue and assembles rows itself. Richer offline, more client code and memory, harder to run experiments consistently.</p></div></div>
<p>Netflix-style products lean thin-client: personalisation is a server concern; the client's job is to render fast and measure well.</p>
<h4>Failure modes</h4>
<ul>
<li>Image CDN slow: posters show blurred placeholders and titles as text; the page stays usable.</li>
<li>Home API down: service worker serves the last cached home; a retry with backoff runs in the background.</li>
<li>A row's API fails: that rail renders an error state and the rest of the page is unaffected (errors are isolated per component).</li>
<li>Memory pressure on a TV: unload offscreen rails fully, keep only data; cap image cache size.</li>
</ul>
<h4>45-minute plan</h4>
<p>5 min requirements and budgets, 5 min component tree and data flow, 5 min API and state, 15 min deep dives (virtualization, images, prefetch), 5 min SSR and A/B, 5 min observability and failures, 5 min questions.</p>` }
  ],
  flow: { title: 'What happens when the browse page opens', steps: [
    { title: 'Shell', desc: 'The server sends pre-rendered HTML for the header, hero and first two rails, with poster URLs already in it. The user sees real content before any JavaScript runs.' },
    { title: 'Hydrate', desc: 'Angular attaches behaviour to the visible parts first. Lower rails are deferred until they scroll into view.' },
    { title: 'Rows', desc: 'The home API returns the row list (ids, titles, first few item ids). It is small and cached per profile.' },
    { title: 'Visible posters', desc: 'Each rail in the viewport fetches its posters and renders only the 8 to 12 cards that fit, plus a few on each side.' },
    { title: 'Images', desc: 'Poster images are requested at the exact width needed from the image CDN, in AVIF or WebP, with a blurred placeholder shown until they land.' },
    { title: 'Prefetch', desc: 'While the user looks at the hero, the next rail\'s posters and the Player route chunk are fetched in the background during idle time.' },
    { title: 'Interact', desc: 'Hovering 300 ms on a card prefetches its details and plays a short muted preview. Arrow keys move focus on TVs. Scroll stays at 60 fps because the DOM stays small.' },
    { title: 'Measure', desc: 'Web Vitals and custom timings are sampled and sent with the release version and experiment flags, so a bad release is caught and rolled back.' }
  ] },
  code: [
    { lang: 'typescript', title: 'Virtualized horizontal rail (Angular, signals, fixed card width)', code: `import { Component, ElementRef, computed, input, signal, viewChild, AfterViewInit } from '@angular/core';

export interface Poster { id: string; title: string; imageKey: string; }

@Component({
  selector: 'app-rail',
  standalone: true,
  template:
    '<h2 class="rail-title">{{ title() }}</h2>' +
    '<div #viewport class="viewport" (scroll)="onScroll()" role="list" [attr.aria-label]="title()">' +
    '  <div class="track" [style.width.px]="items().length * cardWidth">' +
    '    @for (v of visible(); track v.item.id) {' +
    '      <button class="card" role="listitem" [style.transform]="translate(v.index)" (click)="open.emit(v.item)">' +
    '        <img [src]="imgUrl(v.item.imageKey)" [alt]="v.item.title" loading="lazy" width="300" height="169">' +
    '      </button>' +
    '    }' +
    '  </div>' +
    '</div>',
  styles: ['.viewport{overflow-x:auto;position:relative;height:190px}.track{position:relative;height:100%}.card{position:absolute;top:0;left:0;width:300px;height:169px;padding:0;border:0}']
})
export class RailComponent implements AfterViewInit {
  title = input.required<string>();
  items = input.required<Poster[]>();
  open = new EventEmitterLike<Poster>();   // use @Output / output() in your app

  readonly cardWidth = 310;                 // 300px card + 10px gap
  private viewport = viewChild.required<ElementRef<HTMLDivElement>>('viewport');
  private scrollLeft = signal(0);
  private viewportWidth = signal(1200);

  // Only the cards that fit on screen, plus 3 on each side, are in the DOM.
  visible = computed(() => {
    const first = Math.max(0, Math.floor(this.scrollLeft() / this.cardWidth) - 3);
    const count = Math.ceil(this.viewportWidth() / this.cardWidth) + 6;
    const last = Math.min(this.items().length, first + count);
    const out: { index: number; item: Poster }[] = [];
    for (let i = first; i < last; i++) out.push({ index: i, item: this.items()[i] });
    return out;
  });

  ngAfterViewInit() { this.viewportWidth.set(this.viewport().nativeElement.clientWidth); }
  onScroll() { this.scrollLeft.set(this.viewport().nativeElement.scrollLeft); }
  translate(i: number) { return 'translateX(' + (i * this.cardWidth) + 'px)'; }

  // Ask the image CDN for exactly the size we draw (2x for sharp screens), modern format first.
  imgUrl(key: string) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    return 'https://img.example-cdn.com/' + key + '?w=' + (300 * dpr) + '&fmt=avif';
  }
}

// Minimal stand-in so the sample is self-contained; real code uses Angular's output().
class EventEmitterLike<T> { private fns: ((v: T) => void)[] = []; emit(v: T) { this.fns.forEach(f => f(v)); } subscribe(f: (v: T) => void) { this.fns.push(f); } }` },
    { lang: 'typescript', title: 'Browse data service: cache, prefetch next rail, hover-intent prefetch', code: `import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Poster } from './rail.component';   // the Poster interface from the rail sample

export interface Row { id: string; title: string; }

@Injectable({ providedIn: 'root' })
export class BrowseService {
  rows = signal<Row[]>([]);
  private posters = new Map<string, Poster[]>();            // rowId -> posters (server cache, survives navigation)
  private inflight = new Map<string, Promise<Poster[]>>();  // dedupe concurrent requests
  private details = new Map<string, Promise<unknown>>();

  constructor(private http: HttpClient) {}

  async loadHome(profileId: string) {
    const rows = await firstValueFrom(this.http.get<Row[]>('/api/browse/home?profile=' + profileId));
    this.rows.set(rows);
  }

  // Called by a rail when it enters the viewport.
  getPosters(rowId: string): Promise<Poster[]> {
    const cached = this.posters.get(rowId);
    if (cached) return Promise.resolve(cached);
    const existing = this.inflight.get(rowId);
    if (existing) return existing;
    const p = firstValueFrom(this.http.get<Poster[]>('/api/rows/' + rowId + '/items?offset=0&limit=40'))
      .then(list => { this.posters.set(rowId, list); return list; })
      .finally(() => { this.inflight.delete(rowId); });     // also after a failure, so a later call can try again
    this.inflight.set(rowId, p);
    return p;
  }

  // Prefetch the row after the one that just became visible, but never on a metered connection.
  prefetchAfter(rowId: string) {
    const nav = navigator as any;
    if (nav.connection && nav.connection.saveData) return;
    const rows = this.rows();
    const idx = rows.findIndex(r => r.id === rowId);
    const next = rows[idx + 1];
    if (!next) return;
    const idle = (window as any).requestIdleCallback || ((fn: () => void) => setTimeout(fn, 200));
    idle(() => { this.getPosters(next.id).catch(() => {}); });   // a failed prefetch is not an error
  }

  // Hover intent: the pointer rested on a card for 300 ms, so details are likely to be needed.
  private hoverTimer: any;
  onCardHover(titleId: string) {
    clearTimeout(this.hoverTimer);
    this.hoverTimer = setTimeout(() => {
      if (!this.details.has(titleId))
        this.details.set(titleId, firstValueFrom(this.http.get('/api/titles/' + titleId))
          .catch(() => { this.details.delete(titleId); }));   // forget a failed prefetch so it can be tried again
    }, 300);
  }
  onCardLeave() { clearTimeout(this.hoverTimer); }
}` },
    { lang: 'text', title: 'Frontend architecture sketch + performance budget', code: `[Browser / TV app]
  AppShell (SSR, hydrated first)
   |- Header / ProfileMenu
   |- Router outlet
       |- BrowsePage  --GET /api/browse/home--> rows (ids + titles, 10 KB, cached 60 s)
       |    |- HeroBanner (SSR, preload image, preview autoplay only if not reduced-motion)
       |    |- @defer (on viewport) Rail x N  --GET /api/rows/{id}/items--> posters (paged)
       |         |- virtualized PosterCard x ~14  --img.cdn/{key}?w=600&fmt=avif--> images (hash URLs, 1 year cache)
       |         |- PreviewOverlay (one at a time, short MP4 clip)
       |- @defer (on idle) Player route chunk (MSE + ABR + EME/DRM)
  Service worker: caches shell + last home response (offline fallback)
  Telemetry: Web Vitals + custom marks -> batched -> /api/telemetry (with release + experiment ids)

Performance budget (enforced in CI + RUM):
  home route JS       <= 200 KB gzip
  LCP (mid phone, 4G) <= 1.5 s
  INP                 <= 200 ms
  CLS                 == 0 (fixed aspect-ratio boxes for every image)
  scroll              60 fps (DOM nodes on screen <= ~300)` }
  ],
  pitfalls: [
    'Rendering every poster in every row. Virtualize: only what is near the viewport goes in the DOM.',
    'Loading full-size images and letting CSS shrink them. Request the exact width from the image CDN.',
    'Images without a reserved box, causing the page to jump while loading (layout shift).',
    'Prefetching everything. Prefetch the next thing only, during idle time, and not on data-saver connections.',
    'Assigning A/B variants on the client, which causes flicker and inconsistent data. Assign on the server.',
    'Shipping without a performance budget and real-user metrics; you will not notice the slow release until users leave.'
  ],
  quiz: [
    { q: 'What does virtualization mean for a rail of 200 posters?', options: ['The posters are stored and rendered inside a virtual machine', 'Only the posters near the viewport are in the DOM at any time', 'The posters load in a random order to spread out the requests', 'The posters are rendered on the server only, never in the browser'], answer: 1, why: 'Keeping the DOM small is what keeps scrolling at 60 fps on weak devices.' },
    { q: 'Why request images at the exact width the layout needs?', options: ['Image CDNs refuse to serve any size that is not exact', 'It saves bandwidth and decode time on every poster', 'Browsers cannot shrink an image that is too large', 'It is required for DRM to protect the artwork'], answer: 1, why: 'Decoding and downloading oversized images is one of the biggest causes of slow pages.' },
    { q: 'Where should A/B test variants be assigned, and why?', options: ['In the browser at random, because that is the fastest place to decide', 'On the server per profile, to avoid flicker and mixed data', 'In the CDN, because it already sees every image request', 'In the service worker, so that it also works offline'], answer: 1, why: 'Server assignment means the client renders one variant from the start and metrics line up with the assignment.' },
    { q: 'What is a performance budget?', options: ['The money the team may spend on servers and CDN traffic each month', 'Numeric limits such as bundle size and LCP, enforced in CI', 'A list of the slowest pages, reviewed by the team once a quarter', 'The time each developer may spend on tuning per sprint'], answer: 1, why: 'A budget is only useful when the build fails or alerts fire when it is broken.' },
    { q: 'How should the page behave if one row\'s API call fails?', options: ['Show a full-page error so the user knows something is wrong', 'That rail shows an error state; the rest of the page works', 'Reload the whole page until every row has loaded', 'Log the user out and ask them to sign in again'], answer: 1, why: 'Isolating failures per component keeps the product usable.' },
    { q: 'Why render the first rails on the server (SSR)?', options: ['Servers have better fonts and colours than a TV browser does', 'Real content appears before JavaScript downloads and runs', 'It removes the need for a CDN in front of the images', 'It makes the poster images smaller'], answer: 1, why: 'SSR plus incremental hydration gives a fast first view, especially on TVs and low-end phones.' }
  ],
  takeaways: [
    'Split data into shape (rows) and content (posters); load shape first, content only for what is visible.',
    'Virtualize rails, reserve image boxes, request exact image sizes from a CDN in modern formats.',
    'Prefetch the next thing during idle time; respect data-saver settings.',
    'Keep server cache, UI state and session state separate; restore scroll and focus when navigating back.',
    'SSR the first view and hydrate incrementally; defer lower rails and the player.',
    'Write a numeric performance budget, enforce it in CI, and watch real-user metrics per release and experiment.'
  ],
  interview: [
    { q: 'How would you make the browse page fast on a low-end smart TV?', a: '<p>SSR the first screen, keep the DOM tiny through virtualization, avoid heavy animations, use fixed-size cards so layout is cheap, request small images, unload offscreen rails completely, and manage focus with the arrow keys instead of relying on mouse events. Measure on real TV hardware, not a laptop.</p>' },
    { q: 'How do you avoid layout shift with lazy-loaded images?', a: '<p>Give every image a box with a fixed aspect ratio (width/height attributes or CSS aspect-ratio) so space is reserved before the image arrives, and show a blurred low-resolution placeholder in that box.</p>' },
    { q: 'How do you ship safely to millions of users several times a day?', a: '<p>Feature flags for kill switches, staged rollouts by percentage of profiles, automated rollback when error rate or Web Vitals regress compared with the previous release, source-mapped error tracking, and CI gates for bundle size and Lighthouse scores.</p>' },
    { q: 'Thin client or smart client for a streaming home page?', a: '<p>Thin client. Personalisation and row ordering are server concerns and change often; keeping the client a fast renderer makes experiments consistent and the app small. The client still caches responses and handles offline fallback.</p>' }
  ]
};

window.CONTENT['m3-case-whatsapp-frontend'] = {
  hook: `You press send on a train going through a tunnel. The message shows one grey tick, then two, then blue, and you never once think about the network. That is the design.`,
  intro: `<p>This case study designs the client side of a chat app like WhatsApp Web: a list of conversations, a message thread, typing indicators, read receipts, media, and it must feel instant even when the connection is bad. The server side (message routing, storage) is a separate HLD question; here the interviewer wants to see how the <em>browser</em> part is built.</p>
<p>The ideas that matter most: a <span class="term">WebSocket</span> connection that reconnects by itself with <span class="term">exponential backoff</span> (waiting longer after each failed try so you do not hammer the server); <span class="term">optimistic UI</span> (show the message as sent immediately, confirm later); a local database in the browser (IndexedDB) so history opens instantly and works offline; <span class="term">virtual scrolling</span> for threads with 50,000 messages; and <span class="term">end-to-end encryption</span>, explained at a high level.</p>
<p>Examples are in Angular and TypeScript.</p>`,
  realLife: { title: 'A post office with a notebook', body: `<p>Imagine you hand a letter to a clerk and immediately write "sent" in your notebook, then walk away. The clerk stamps it when it leaves the building (one tick), the receiving post office stamps it on arrival (two ticks), and the reader signs for it (blue ticks). Your notebook is updated as each stamp comes back. If the clerk is on a break, your letter waits in a tray and goes out when they return; you never had to stand there.</p>
<p>The chat client is that notebook. It writes every message locally first, shows it to you straight away, and updates the ticks as confirmations arrive. The tray is the outbox: messages that have not reached the server yet. Opening a conversation reads from your notebook, not from the post office, which is why it is instant even with no signal.</p>
<p>WhatsApp Web keeps a local copy of your chats in the browser, syncs changes over one long-lived connection, and encrypts messages on your device so even its own servers cannot read them.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Requirements</h4>
<p><strong>Functional</strong>: list of chats with last message and unread count; open a chat and scroll through history; send text, images, files; see delivered and read ticks; typing indicator; search chats and messages; notifications for new messages; works in several browser tabs; link a device by QR code.</p>
<p><strong>Non-functional</strong>: sending feels instant (under 100 ms to appear); messages are never lost or duplicated even with flaky networks; opening a chat with 50,000 messages stays smooth; works offline for reading and queues sends; messages are encrypted end to end; memory stays reasonable with hundreds of chats.</p>
<h4>The main pieces</h4>
<ul>
<li><strong>Connection manager</strong>: owns the WebSocket, reconnects with backoff, tells the rest of the app whether we are online.</li>
<li><strong>Local store</strong>: IndexedDB holds chats and messages; an in-memory cache (signals) holds what is on screen.</li>
<li><strong>Sync engine</strong>: on connect, asks the server "what changed since sequence number N?" and applies the answer.</li>
<li><strong>Outbox</strong>: messages waiting to be sent; retried in order; each has a unique client id so retries never make duplicates.</li>
<li><strong>UI</strong>: ChatList, ChatThread (virtual scroll), Composer, MediaViewer.</li>
<li><strong>Crypto</strong>: encrypts before sending, decrypts after receiving, keys stored on the device.</li>
</ul>
<h4>Message states (the ticks)</h4>
<table><thead><tr><th>State</th><th>Meaning</th><th>Shown as</th></tr></thead><tbody>
<tr><td>pending</td><td>In the outbox, not yet accepted by the server</td><td>clock icon</td></tr>
<tr><td>sent</td><td>Server has it</td><td>one grey tick</td></tr>
<tr><td>delivered</td><td>Recipient's device has it</td><td>two grey ticks</td></tr>
<tr><td>read</td><td>Recipient opened the chat</td><td>two blue ticks</td></tr>
<tr><td>failed</td><td>Gave up after retries (user can retry)</td><td>red icon</td></tr>
</tbody></table>
<div class="callout tip"><p>Say: "Every message gets a client-generated id before it leaves the browser. The server uses it to deduplicate. That one id makes retries safe."</p></div>
<h4>Why one connection, not many requests</h4>
<p>Chat is two-way and constant. A WebSocket gives the server a way to push new messages, receipts and typing events instantly, and gives the client one place to send. Polling would be slower and waste battery.</p>` },
    { name: 'Intermediate', body: `<h4>Protocol over the WebSocket (client view)</h4>
<table><thead><tr><th>Direction</th><th>Message</th><th>Fields</th></tr></thead><tbody>
<tr><td>client → server</td><td>send</td><td>clientId, chatId, ciphertext, type, replyTo</td></tr>
<tr><td>server → client</td><td>ack</td><td>clientId, serverId, serverTs, seq</td></tr>
<tr><td>server → client</td><td>message</td><td>serverId, chatId, senderId, ciphertext, serverTs, seq</td></tr>
<tr><td>both</td><td>receipt</td><td>serverId, status (delivered/read), by, ts</td></tr>
<tr><td>both</td><td>typing</td><td>chatId, userId, isTyping (not persisted)</td></tr>
<tr><td>client → server</td><td>sync</td><td>sinceSeq</td></tr>
<tr><td>server → client</td><td>batch</td><td>events[] since that seq, plus the newest seq</td></tr>
</tbody></table>
<p>Every server event carries a <span class="term">sequence number</span> that only goes up. The client stores the last one it applied. After any reconnect it sends sync(sinceSeq) and receives exactly what it missed. No guessing, no duplicates.</p>
<h4>Local data model (IndexedDB)</h4>
<ul>
<li><strong>chats</strong>: id, title, lastMessageTs, unreadCount, members. Index on lastMessageTs for the list order.</li>
<li><strong>messages</strong>: id (serverId or clientId while pending), chatId, senderId, text (decrypted), status, ts, seq. Compound index [chatId, ts] for paging a thread.</li>
<li><strong>outbox</strong>: clientId, chatId, payload, attempts, nextTryAt.</li>
<li><strong>meta</strong>: lastSeq, deviceKeys, settings.</li>
</ul>
<h4>Deep dive: reconnect with backoff and jitter</h4>
<p>On close or error, wait 1 s, then 2, 4, 8, up to 30 s, each with a random extra 0 to 1 s (jitter) so thousands of clients do not reconnect in the same instant after an outage. Reset the delay on a successful connect. Also reconnect immediately when the browser fires the <code>online</code> event or the tab becomes visible again.</p>
<h4>Deep dive: optimistic send</h4>
<ol>
<li>User presses send. Create the message with a clientId (UUID), status pending, local timestamp.</li>
<li>Write it to IndexedDB (messages + outbox) and to the in-memory thread. The UI shows it immediately.</li>
<li>If connected, send now; otherwise it waits in the outbox.</li>
<li>On ack, replace clientId with serverId, set status sent, remove from outbox.</li>
<li>Receipts later move it to delivered and read.</li>
</ol>
<h4>Deep dive: virtual scrolling in a thread</h4>
<p>Messages have different heights, so use the Angular CDK's virtual scroll with an auto-size strategy, or render a window of about 60 messages around the current position and measure heights as they render. Load older messages in pages of 50 when the user nears the top, and keep the scroll position stable by adjusting scrollTop by the height of the inserted block. New incoming messages auto-scroll only if the user is already at the bottom.</p>
<h4>Deep dive: multi-tab</h4>
<p>Only one tab should own the WebSocket, or the server sees many connections and receipts get sent twice. Elect a leader with the Web Locks API or a BroadcastChannel heartbeat; other tabs read from IndexedDB and receive changes through BroadcastChannel from the leader. If the leader tab closes, another takes over.</p>
<h4>Notifications</h4>
<p>If the tab is hidden, show a browser Notification (with permission) for new messages; clicking it focuses the tab and opens the chat. Mute per chat, and never notify for your own messages from other devices.</p>` },
    { name: 'Expert', body: `<h4>End-to-end encryption, at a high level</h4>
<p>Each device has a long-term identity key pair and a set of one-time "prekeys" uploaded to the server. To start a chat, your device fetches the other side's prekey bundle and derives a shared secret (X3DH). From then on, a <em>ratchet</em> (the Double Ratchet algorithm, as in the Signal protocol) produces a fresh key for every single message, so stealing one key exposes only one message. The server only ever sees ciphertext and routing metadata. Group chats use a sender key per member so a message is encrypted once, not once per recipient.</p>
<p>For the frontend this means: encryption happens in the client before send; decryption on receive before storing plaintext locally; keys live in IndexedDB (ideally wrapped with a non-exportable WebCrypto key); search over messages must run locally because the server cannot read them; and linking a new device means transferring keys to it, usually via a QR code and an encrypted channel from the phone.</p>
<h4>Ordering, duplicates and clocks</h4>
<ul>
<li>Order by server timestamp and sequence, not by local clock; local clocks are wrong by minutes on many machines.</li>
<li>Deduplicate on serverId and clientId; a retry after a lost ack must be harmless.</li>
<li>A "pending" message is shown at the bottom until acked, then moved to its server position (usually the same spot).</li>
</ul>
<h4>Memory and storage</h4>
<p>Hundreds of chats with media can reach gigabytes. Keep only the most recent N messages per chat in memory, page the rest from IndexedDB, and store media as blobs with a size cap and least-recently-used eviction. Use <code>navigator.storage.persist()</code> to ask the browser not to evict the database, and handle the case where it does (full resync from the server with the user's keys).</p>
<h4>Sync protocol details</h4>
<p>On first login, a full snapshot is too big; fetch chats first, then the latest page per chat lazily. On every reconnect, sync(sinceSeq) returns a bounded batch; if the gap is too large (the client was offline for weeks), the server responds "resnapshot" and the client reloads chat summaries and marks message history as needing backfill per chat.</p>
<h4>Performance budgets</h4>
<p>Send-to-render under 50 ms; thread open under 200 ms from local data; scroll at 60 fps with media placeholders; decryption of a batch of 500 messages under 1 s (use WebCrypto, run in a Web Worker so the UI thread stays free).</p>
<h4>Failure modes</h4>
<ul>
<li>Server rejects a message (blocked, too large): mark failed with a reason, do not retry automatically.</li>
<li>IndexedDB unavailable (private mode): fall back to memory-only with a warning; nothing persists.</li>
<li>Clock skew: never use local time for ordering or receipts; display times from the server.</li>
<li>Key mismatch (contact reinstalled): show a security-code-changed notice and re-establish the session.</li>
<li>Leader tab frozen (sleeping laptop): heartbeat timeout triggers a new leader election.</li>
</ul>
<h4>Trade-offs</h4>
<div class="compare"><div><h5>Local-first (store everything in the browser)</h5><p>Instant, offline, private. Costs storage, sync complexity, and device linking work.</p></div><div><h5>Server-rendered history</h5><p>Simple client, nothing to sync. Slower, useless offline, and impossible with end-to-end encryption.</p></div></div>
<h4>45-minute plan</h4>
<p>5 min requirements and message states, 5 min components and protocol, 5 min local data model, 15 min deep dives (connection + backoff, optimistic send + outbox, virtual scroll), 5 min E2E encryption, 5 min multi-tab and failures, 5 min questions.</p>` }
  ],
  flow: { title: 'Sending a message on a bad connection', steps: [
    { title: 'Compose', desc: 'The user types and presses Enter. The client creates a message with a new UUID clientId and status "pending".' },
    { title: 'Store locally', desc: 'The message is written to IndexedDB (messages table and outbox) and pushed into the in-memory thread. The UI shows it instantly with a clock icon.' },
    { title: 'Encrypt', desc: 'The plaintext is encrypted with the next ratchet key for this chat. Only ciphertext ever leaves the device.' },
    { title: 'Try to send', desc: 'If the WebSocket is open, the "send" frame goes out. If it is closed, the outbox keeps it and the connection manager retries with backoff: 1 s, 2 s, 4 s... plus jitter.' },
    { title: 'Reconnect + sync', desc: 'When the socket reopens, the client first sends sync(sinceSeq) to catch up on missed events, then flushes the outbox in order.' },
    { title: 'Ack', desc: 'The server answers ack with a serverId and sequence. The client swaps ids, sets status "sent" (one tick) and removes the outbox row. A duplicate send is ignored by the server thanks to clientId.' },
    { title: 'Receipts', desc: 'Later, "delivered" and "read" receipts arrive over the socket and update the ticks. Other open tabs get the change through BroadcastChannel.' }
  ] },
  code: [
    { lang: 'typescript', title: 'Connection manager: WebSocket with backoff, jitter, sync-on-connect', code: `import { Injectable, signal } from '@angular/core';

type ServerEvent = { type: string; seq?: number; [k: string]: unknown };

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  online = signal(false);
  private ws: WebSocket | null = null;
  private attempt = 0;
  private closedByUs = false;
  private token = '';
  private timer: any;                                    // the pending reconnect, if any
  private lastSeq = 0;                                  // loaded from IndexedDB meta on startup
  private handlers: ((e: ServerEvent) => void)[] = [];

  constructor() {
    window.addEventListener('online', () => this.connectNow());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.connectNow(); });
  }

  onEvent(fn: (e: ServerEvent) => void) { this.handlers.push(fn); }
  setLastSeq(seq: number) { this.lastSeq = seq; }

  connect(token: string) {
    this.token = token;
    clearTimeout(this.timer);
    this.closedByUs = false;
    const url = 'wss://chat.example.com/ws?token=' + encodeURIComponent(token);
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onopen = () => {
      this.attempt = 0;
      this.online.set(true);
      // First thing after connecting: ask for everything we missed.
      ws.send(JSON.stringify({ type: 'sync', sinceSeq: this.lastSeq }));
    };
    ws.onmessage = (m) => {
      const e = JSON.parse(m.data) as ServerEvent;
      if (typeof e.seq === 'number' && e.seq > this.lastSeq) this.lastSeq = e.seq;
      this.handlers.forEach(h => h(e));
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;                        // an old socket that was already replaced
      this.online.set(false);
      if (!this.closedByUs) this.scheduleReconnect(token);
    };
    ws.onerror = () => ws.close();
  }

  send(frame: object): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) { this.ws.send(JSON.stringify(frame)); return true; }
    return false;                                        // caller keeps it in the outbox
  }

  private scheduleReconnect(token: string) {
    const base = Math.min(30000, 1000 * Math.pow(2, this.attempt));   // 1s, 2s, 4s ... 30s cap
    const jitter = Math.random() * 1000;                               // spread clients out after an outage
    this.attempt++;
    this.timer = setTimeout(() => this.connect(token), base + jitter);
  }

  // Network or tab came back: do not wait for the backoff timer, try again right now.
  private connectNow() {
    if (this.closedByUs || !this.token || this.online()) return;
    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) return;
    this.attempt = 0;
    this.connect(this.token);                            // connect() cancels the pending timer
  }

  disconnect() { this.closedByUs = true; clearTimeout(this.timer); this.ws && this.ws.close(); }
}` },
    { lang: 'typescript', title: 'Optimistic send with an IndexedDB outbox and ack handling', code: `import { Inject, Injectable, InjectionToken, signal } from '@angular/core';
import { ConnectionService } from './connection.service';

export type MsgStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
export interface Message { id: string; clientId: string; chatId: string; senderId: string; text: string; status: MsgStatus; ts: number; seq?: number; }

// Angular cannot inject an interface or a plain string by type, so each one gets a token.
export const LOCAL_DB = new InjectionToken<LocalDb>('LocalDb');
export const CHAT_CRYPTO = new InjectionToken<ChatCrypto>('ChatCrypto');
export const MY_USER_ID = new InjectionToken<string>('MyUserId');

@Injectable({ providedIn: 'root' })
export class MessageService {
  // What is on screen for the open chat. The full history lives in IndexedDB.
  thread = signal<Message[]>([]);

  constructor(private conn: ConnectionService, @Inject(LOCAL_DB) private db: LocalDb,
              @Inject(CHAT_CRYPTO) private crypto: ChatCrypto, @Inject(MY_USER_ID) private me: string) {
    conn.onEvent(e => this.handle(e));
  }

  async send(chatId: string, text: string) {
    const msg: Message = { id: '', clientId: globalThis.crypto.randomUUID(), chatId, senderId: this.me, text, status: 'pending', ts: Date.now() };
    msg.id = msg.clientId;                                     // temporary id until the server acks

    await this.db.putMessage(msg);                             // 1. local first
    await this.db.putOutbox({ clientId: msg.clientId, chatId, text, attempts: 0 });
    this.thread.update(list => [...list, msg]);                // 2. show immediately

    await this.flushOutbox();                                  // 3. try to send now
  }

  async flushOutbox() {
    const items = await this.db.outboxInOrder();
    for (const item of items) {
      const ciphertext = await this.crypto.encrypt(item.chatId, item.text);
      const ok = this.conn.send({ type: 'send', clientId: item.clientId, chatId: item.chatId, ciphertext });
      if (!ok) return;                                         // offline: stop, keep order, retry on reconnect
      await this.db.bumpAttempts(item.clientId);
    }
  }

  private async handle(e: any) {
    switch (e.type) {
      case 'ack': {                                            // server accepted our message
        await this.db.markSent(e.clientId, e.serverId, e.serverTs, e.seq);
        await this.db.removeOutbox(e.clientId);
        this.patch(m => m.clientId === e.clientId, { id: e.serverId, status: 'sent', ts: e.serverTs, seq: e.seq });
        break;
      }
      case 'message': {                                        // someone else's message (or ours from another device)
        if (await this.db.hasMessage(e.serverId)) return;      // dedupe
        const text = await this.crypto.decrypt(e.chatId, e.ciphertext);
        const msg: Message = { id: e.serverId, clientId: '', chatId: e.chatId, senderId: e.senderId, text, status: 'delivered', ts: e.serverTs, seq: e.seq };
        await this.db.putMessage(msg);
        if (this.isOpenChat(e.chatId)) this.thread.update(list => [...list, msg]);
        this.conn.send({ type: 'receipt', serverId: e.serverId, status: 'delivered' });
        break;
      }
      case 'receipt': {
        await this.db.setStatus(e.serverId, e.status);
        this.patch(m => m.id === e.serverId, { status: e.status });
        break;
      }
      case 'batch': {                                          // sync response after reconnect
        for (const ev of e.events) await this.handle(ev);
        await this.db.setLastSeq(e.latestSeq);
        this.conn.setLastSeq(e.latestSeq);
        await this.flushOutbox();                              // now safe to resend pending messages
        break;
      }
    }
  }

  private patch(match: (m: Message) => boolean, changes: Partial<Message>) {
    this.thread.update(list => list.map(m => match(m) ? { ...m, ...changes } : m));
  }
  private isOpenChat(chatId: string) { const first = this.thread()[0]; return !!first && first.chatId === chatId; }
}

// Interfaces the sample relies on (implement with the idb library and WebCrypto):
export interface LocalDb { putMessage(m: Message): Promise<void>; hasMessage(id: string): Promise<boolean>; putOutbox(o: any): Promise<void>; outboxInOrder(): Promise<any[]>; bumpAttempts(id: string): Promise<void>; removeOutbox(id: string): Promise<void>; markSent(clientId: string, serverId: string, ts: number, seq: number): Promise<void>; setStatus(id: string, s: MsgStatus): Promise<void>; setLastSeq(n: number): Promise<void>; }
export interface ChatCrypto { encrypt(chatId: string, text: string): Promise<string>; decrypt(chatId: string, ciphertext: string): Promise<string>; }` },
    { lang: 'text', title: 'Client architecture sketch', code: `[Tab A (leader)]                                   [Tab B, Tab C (followers)]
  ConnectionService ---- one WebSocket ---- server     read IndexedDB, listen on BroadcastChannel
  SyncEngine (sync sinceSeq -> batch)                  no socket of their own
  MessageService (optimistic send, outbox, acks, receipts)
  ChatCrypto (X3DH session setup, Double Ratchet per chat, WebCrypto in a Worker)
  LocalDb (IndexedDB): chats | messages [chatId, ts] | outbox | meta(lastSeq, keys) | media blobs (LRU cap)
  UI: ChatList (signals) | ChatThread (CDK virtual scroll, page older on near-top) | Composer | MediaViewer
  NotificationService (hidden tab -> browser Notification; mute per chat)
  Leader election: Web Locks API ("chat-leader") or BroadcastChannel heartbeat

Message lifecycle: pending (clock) -> sent (1 tick) -> delivered (2 ticks) -> read (2 blue) | failed (retry)
Reconnect: 1s, 2s, 4s, 8s ... 30s + jitter; immediate on 'online' / tab visible; sync first, then flush outbox` }
  ],
  pitfalls: [
    'Waiting for the server before showing a sent message. Write locally first, show immediately, confirm later.',
    'Retrying sends without a client-generated id, which creates duplicate messages after a lost ack.',
    'Reconnecting instantly in a tight loop. Use exponential backoff with jitter and a cap.',
    'Rendering the whole 50,000-message thread. Virtualize and page from IndexedDB.',
    'Opening a WebSocket per tab. Elect one leader tab; others follow via BroadcastChannel.',
    'Ordering by the local clock. Use server timestamps and sequence numbers.'
  ],
  quiz: [
    { q: 'What makes it safe to retry sending a message after the connection drops?', options: ['Sending it twice is fine because users ignore repeats', 'A client-generated unique id lets the server ignore duplicates', 'Deleting the message locally before each new attempt', 'Waiting 10 minutes so the first attempt has surely failed'], answer: 1, why: 'The clientId is the deduplication key; a retry with the same id is harmless.' },
    { q: 'Why add jitter to reconnect delays?', options: ['To make the app feel less robotic to the person using it', 'So thousands of clients do not all reconnect at the same moment', 'Because jitter encrypts the handshake of the new connection', 'Because browsers reject reconnects that use a fixed, regular delay'], answer: 1, why: 'A random offset spreads the reconnect storm out, protecting the server.' },
    { q: 'What is the first thing the client should do after reconnecting?', options: ['Flush the outbox so pending messages go out at once', 'Send sync(sinceSeq) to fetch everything missed', 'Reload the page to get a clean state', 'Ask the user to log in again'], answer: 1, why: 'Catching up first keeps order and state correct; then pending messages can be sent safely.' },
    { q: 'Why can message search not be done on the server in an end-to-end encrypted app?', options: ['Servers are too slow to search billions of messages', 'The server only has ciphertext, so it cannot read the text', 'Search inside private chats is not allowed by app stores', 'Browsers block search requests sent over a WebSocket'], answer: 1, why: 'With E2E encryption, only devices hold plaintext, so search must run locally over the IndexedDB copy.' },
    { q: 'How should new incoming messages affect scroll position?', options: ['Always jump to the bottom so that nothing new is ever missed', 'Auto-scroll only if the user is already at the bottom', 'Never scroll; the user must always scroll down by hand', 'Reload the thread from IndexedDB and start at the top'], answer: 1, why: 'Yanking the view away while someone reads old messages is a classic chat UI bug.' },
    { q: 'Why should only one browser tab hold the WebSocket?', options: ['Browsers allow only one WebSocket per site across all tabs', 'To avoid duplicate receipts and extra server connections', 'A second socket would make the user scan the QR code again', 'Tabs cannot share cookies, so only one can log in'], answer: 1, why: 'Leader election keeps one connection per user per browser and a single source of truth locally.' }
  ],
  takeaways: [
    'Local-first: write to IndexedDB and render immediately; the network confirms later.',
    'One WebSocket with backoff + jitter, reconnect on online/visible, and sync(sinceSeq) before flushing the outbox.',
    'Client ids make retries safe; server sequence numbers make ordering and catch-up exact.',
    'Message states drive the ticks: pending → sent → delivered → read, or failed with manual retry.',
    'Virtualize long threads, page history, auto-scroll only at the bottom.',
    'End-to-end encryption means encrypt before send, decrypt before store, search locally, and link devices by transferring keys.'
  ],
  interview: [
    { q: 'How do you make sending feel instant on a slow network?', a: '<p>Optimistic UI: assign a client id, store the message locally with status pending, render it at once, then send. Acks and receipts update the status later. The outbox persists across reloads so nothing is lost if the tab closes before the ack.</p>' },
    { q: 'How do you avoid missing or duplicating messages across reconnects?', a: '<p>Every server event has a monotonic sequence number; the client stores the last applied one and asks for everything after it on reconnect. Deduplicate incoming events by server id and outgoing by client id.</p>' },
    { q: 'Explain end-to-end encryption to a product manager.', a: '<p>Each phone has its own secret keys. When two people chat, their devices agree on a shared secret that the server never sees, and change the key for every message. The server moves sealed envelopes; only the two devices can open them. The cost is that the server cannot search, back up or moderate message text.</p>' },
    { q: 'How would you handle a thread with 100,000 messages?', a: '<p>Keep only a window of about 60 rendered with virtual scrolling, page older messages in blocks of 50 from IndexedDB as the user scrolls up, correct scrollTop after inserting a block so the view does not jump, and keep media as lazily loaded blobs with placeholders.</p>' }
  ]
};

window.CONTENT['m3-case-ecommerce'] = {
  hook: `A customer clicks "Pay" twice because the page was slow. If your system charges them twice, no amount of pretty UI will save you.`,
  intro: `<p>This is the full-stack case study: an online shop like Amazon or Flipkart, built with Angular on the front, ASP.NET Core on the back, SQL Server for data, Redis for speed and a message queue for the slow work. It covers catalog and search, cart, checkout, orders, payments, inventory, and the login and security pieces that every real shop needs.</p>
<p>The words you need: <span class="term">idempotency</span> (doing the same request twice has the same effect as doing it once, which is how we stop double charges); <span class="term">webhook</span> (the payment provider calling <em>our</em> API to tell us a payment finished); <span class="term">refresh token</span> (a long-lived token used to get new short-lived access tokens without logging in again); and <span class="term">PCI scope</span> (the parts of your system that touch card numbers and therefore must follow strict rules; the goal is to have none).</p>
<p>We go requirements → numbers → API → data model → architecture → deep dives (checkout, payments, inventory, auth, security) → deployment → trade-offs.</p>`,
  realLife: { title: 'A shop with a till, a stockroom and a bank next door', body: `<p>Picture a physical shop. The shelves are the catalog. Your basket is the cart. The till is checkout. The stockroom clerk reserves the item for you the moment you reach the till, so two people cannot buy the last one. The shop never touches your card: it sends you to the bank next door, the bank calls back "paid", and only then does the clerk hand over the bag. If you walk back and say "pay" again with the same receipt number, the bank says "already done" instead of charging you twice.</p>
<p>Every part of our design maps to that picture: product service (shelves), cart in Redis (basket), order service (till), inventory reservation (stockroom), hosted payment page plus webhooks (bank next door), and an idempotency key (receipt number).</p>
<p>Large retailers run exactly this split as separate services, with the checkout path protected most heavily, because every minute of checkout downtime is lost revenue.</p>` },
  levels: [
    { name: 'Beginner', body: `<h4>Requirements</h4>
<p><strong>Functional</strong>: browse categories and product pages; search with filters; add to cart (also as a guest); register, log in, reset password; checkout with address and payment; order history and status; admin can add products and see orders; email confirmations.</p>
<p><strong>Non-functional</strong>: product pages under 1 s; checkout must never double-charge or oversell; secure (passwords hashed, tokens short-lived, card data never stored by us); scale for a sale day with 10x normal traffic; recoverable from a server crash without losing orders.</p>
<h4>Rough numbers</h4>
<ul>
<li>Normal day: 5 million product page views, 50,000 orders. Sale day: 50 million views, 500,000 orders.</li>
<li>Reads (browse, search) outnumber writes (orders) by about 100 to 1. So: cache reads hard, protect writes carefully.</li>
<li>Catalog: 1 million products × 5 KB ≈ 5 GB. Fits one database with good indexes; images go to blob storage + CDN.</li>
</ul>
<h4>Pages and what they need (Angular)</h4>
<ul>
<li><strong>Home / Category / Search</strong>: read-only, cached, fast.</li>
<li><strong>Product detail</strong>: product data, stock status, reviews.</li>
<li><strong>Cart</strong>: a drawer that works for guests (cart id in a cookie) and logged-in users (merged on login).</li>
<li><strong>Checkout</strong>: address, delivery, payment step with a hosted payment form from the provider.</li>
<li><strong>Account</strong>: orders, addresses, profile.</li>
<li><strong>Admin</strong>: product and order management, behind the Admin role.</li>
</ul>
<h4>Backend services (ASP.NET Core)</h4>
<p>Start as one well-structured application (a "modular monolith") with clear modules: Catalog, Search, Cart, Orders, Payments, Inventory, Identity, Notifications. Split into separate services later only where load or team size demands it. Interviewers respect this answer more than "microservices from day one".</p>
<div class="callout tip"><p>The two sentences to say early: "Reads are cached and can be a little stale. Writes on the checkout path are transactional, idempotent and queued for anything slow."</p></div>` },
    { name: 'Intermediate', body: `<h4>API design</h4>
<table><thead><tr><th>Endpoint</th><th>Auth</th><th>Notes</th></tr></thead><tbody>
<tr><td>GET /api/products?category=&page=</td><td>none</td><td>Cached 60 s (Redis + CDN)</td></tr>
<tr><td>GET /api/products/{slug}</td><td>none</td><td>Cached; stock fetched separately and live</td></tr>
<tr><td>GET /api/search?q=&filters=</td><td>none</td><td>Backed by a search index (Azure AI Search / Elasticsearch / SQL full-text to start)</td></tr>
<tr><td>GET/POST/DELETE /api/cart/items</td><td>guest cookie or JWT</td><td>Cart in Redis, 30-day TTL; merged into user cart on login</td></tr>
<tr><td>POST /api/checkout/quote</td><td>JWT</td><td>Prices, taxes, delivery options, validated server-side</td></tr>
<tr><td>POST /api/orders</td><td>JWT + Idempotency-Key header</td><td>Creates order (Pending), reserves stock, returns payment session</td></tr>
<tr><td>POST /api/payments/webhook</td><td>provider signature</td><td>Marks order Paid or Failed; must be idempotent</td></tr>
<tr><td>GET /api/orders/{id}</td><td>JWT (owner or Admin)</td><td>Status, items, tracking</td></tr>
<tr><td>POST /api/auth/register, /login, /refresh, /logout</td><td>—</td><td>Access JWT 15 min; refresh token in HttpOnly cookie, rotated</td></tr>
<tr><td>POST /api/admin/products</td><td>JWT role=Admin</td><td>Writes invalidate catalog cache</td></tr>
</tbody></table>
<h4>Data model (SQL Server)</h4>
<ul>
<li><strong>Products</strong>(Id, Slug, Name, Description, Price, CategoryId, IsActive, RowVersion) and <strong>ProductImages</strong>.</li>
<li><strong>Inventory</strong>(ProductId, Available, Reserved, RowVersion) — separate from Products because it changes constantly.</li>
<li><strong>Orders</strong>(Id, UserId, Status, Subtotal, Tax, Shipping, Total, Currency, IdempotencyKey UNIQUE per user, CreatedAt) and <strong>OrderItems</strong>(OrderId, ProductId, Qty, UnitPrice snapshot).</li>
<li><strong>Payments</strong>(Id, OrderId, Provider, ProviderRef, Status, Amount, RawEventId UNIQUE).</li>
<li><strong>Users</strong>(Id, Email UNIQUE, PasswordHash, Roles) and <strong>RefreshTokens</strong>(Hash, UserId, ExpiresAt, RevokedAt, ReplacedBy).</li>
<li><strong>Carts</strong> live in Redis as a hash per cart id; only persisted to SQL when converted to an order.</li>
</ul>
<h4>Deep dive: checkout and payment flow</h4>
<ol>
<li>Client gets a quote (server recalculates every price; the client's numbers are never trusted).</li>
<li>Client generates an idempotency key (UUID) and POSTs /api/orders with it.</li>
<li>Server, in one database transaction: insert Order (Pending) with the key; for each item, UPDATE Inventory SET Reserved = Reserved + qty WHERE Available - Reserved >= qty; if any row is not affected, roll back and return "out of stock".</li>
<li>Server creates a payment session with the provider (Stripe, Razorpay, Adyen...) for the order total and returns its client secret / redirect URL.</li>
<li>Client shows the provider's hosted card form. Card numbers go straight to the provider; our servers never see them (this keeps almost all of our system out of PCI scope; the shop still fills in the shortest PCI self-check form).</li>
<li>Provider calls our webhook: payment succeeded. We verify the signature, check we have not processed this event id before, mark Order Paid, convert Reserved into a real deduction, and publish OrderPaid to the queue.</li>
<li>Queue consumers send the confirmation email, notify the warehouse, and update analytics. None of this blocks the customer.</li>
<li>A background job cancels Pending orders older than 15 minutes and releases their reservations.</li>
</ol>
<h4>Deep dive: authentication</h4>
<p>Passwords hashed with a slow algorithm (ASP.NET Core Identity uses PBKDF2; Argon2 or bcrypt are also fine). Login returns a short-lived access JWT (15 minutes, in memory on the client) and a refresh token in an HttpOnly, Secure, SameSite cookie. /refresh rotates the refresh token and revokes the old one; reuse of an old token revokes the whole family (theft detection). Roles (Customer, Admin) are claims in the JWT and checked with policies on the API.</p>
<h4>Caching plan</h4>
<ul>
<li>CDN: images, static assets, and anonymous GET /api/products responses for 60 s.</li>
<li>Redis: product details, category pages, search results (short TTL), carts, rate-limit counters, sessions for refresh-token checks.</li>
<li>Invalidate by key when an admin edits a product; accept staleness of up to a minute for prices on listing pages, but always recompute at checkout.</li>
</ul>` },
    { name: 'Expert', body: `<h4>Correctness on the money path</h4>
<p>Three guarantees, each with a mechanism:</p>
<ul>
<li><strong>No double orders</strong>: unique index on Orders.IdempotencyKey. A retry with the same key returns the existing order (same response) instead of inserting a second.</li>
<li><strong>No overselling</strong>: a conditional UPDATE on inventory inside the order transaction (or optimistic concurrency with RowVersion and a retry loop). For flash sales, move the counter to Redis with a Lua script (atomic decrement if enough) and reconcile to SQL asynchronously.</li>
<li><strong>No lost payments</strong>: webhooks are idempotent (unique RawEventId) and retried by the provider; a reconciliation job compares provider records with our Payments table nightly and fixes gaps.</li>
</ul>
<h4>Outbox pattern</h4>
<p>Marking an order Paid and publishing OrderPaid to the queue must both happen or neither. Write the event into an Outbox table in the same transaction as the order update, and have a background publisher read the outbox and push to the queue (RabbitMQ, Azure Service Bus or Kafka), marking rows as sent. Consumers must also be idempotent because the publisher may send twice.</p>
<h4>Search</h4>
<p>SQL full-text search is enough to start. At scale, a dedicated index (Azure AI Search, Elasticsearch, OpenSearch) fed by product change events gives facets, typo tolerance and relevance tuning. Keep the search index read-only from the app's point of view; SQL stays the source of truth.</p>
<h4>Security checklist (OWASP-minded)</h4>
<ul>
<li>Input validation on every endpoint (FluentValidation or data annotations); parameterised queries only (EF Core does this; never string-concatenate SQL).</li>
<li>Authorization at the resource level: a user can read only their own orders (check UserId in the query, not just the role).</li>
<li>Rate limiting on login, register, password reset and checkout (ASP.NET Core rate limiter + Redis for multi-instance).</li>
<li>CSRF: the API uses bearer tokens for state-changing calls, and the refresh cookie is SameSite=Strict; the refresh endpoint also checks a custom header.</li>
<li>XSS: Angular escapes by default; never use bypassSecurityTrust on user content; set a Content Security Policy.</li>
<li>Secrets in Key Vault / environment, not in appsettings; TLS everywhere; security headers (HSTS, X-Content-Type-Options, frame-ancestors).</li>
<li>Audit log for admin actions and refunds; alerts on unusual order patterns (fraud basics: velocity checks, address and card country mismatch, provider risk scores).</li>
<li>PCI: hosted payment fields or provider SDK so card data never touches our servers or logs. Mask everything else (last 4 digits only).</li>
</ul>
<h4>Scaling for a sale day</h4>
<p>Scale read replicas and cache TTLs up before the event; put the product and category pages fully on the CDN; pre-compute search pages for top queries; enable a virtual waiting room (queue page) in front of checkout if orders per second exceed what inventory and payment capacity can handle; keep the admin panel on a separate instance so it does not compete with customers.</p>
<h4>Deployment outline</h4>
<ul>
<li>Angular built to static files, served by Azure Static Web Apps or a CDN-backed storage account; API on Azure App Service or AKS (containers), at least 2 instances per region behind a load balancer.</li>
<li>SQL Server (Azure SQL) with automated backups and a read replica; Redis (Azure Cache); Service Bus or RabbitMQ; Blob Storage + CDN for images; Key Vault for secrets; Application Insights for logs, traces and metrics.</li>
<li>CI/CD: build, unit and integration tests, container image, deploy to staging, smoke tests, blue/green or slot swap to production, with database migrations run as a separate, reviewed step.</li>
<li>Health checks (/health/live, /health/ready) wired to the load balancer; dashboards for order rate, payment failures, p95 latency, queue depth.</li>
</ul>
<h4>Trade-offs to state</h4>
<div class="compare"><div><h5>Modular monolith first</h5><p>One deployable, one database, simple transactions across cart/orders/inventory. Faster to build and reason about; scale by instances and caches.</p></div><div><h5>Microservices</h5><p>Independent scaling and teams; but cross-service consistency (orders vs inventory) needs sagas/outbox and more operations work. Earn it when the monolith hurts.</p></div></div>
<h4>45-minute plan</h4>
<p>5 min requirements and numbers, 5 min pages and API, 5 min data model, 10 min architecture, 10 min checkout + payment deep dive (idempotency, reservation, webhook, outbox), 5 min auth and security, 5 min deployment and trade-offs.</p>` }
  ],
  flow: { title: 'From "Pay" click to a confirmed order', steps: [
    { title: 'Quote', desc: 'The Angular checkout asks the API for a quote. The server recalculates every price, tax and delivery charge from its own data; client-side numbers are ignored.' },
    { title: 'Create order', desc: 'The client sends POST /api/orders with an Idempotency-Key header. If this key was seen before, the server returns the existing order instead of creating another.' },
    { title: 'Reserve stock', desc: 'In one SQL transaction the order is inserted as Pending and each item\'s inventory is reserved with a conditional UPDATE. If any item is short, everything rolls back and the user sees "out of stock".' },
    { title: 'Payment session', desc: 'The API asks the payment provider for a session for the order total and returns its client secret. Card details go straight from the browser to the provider; our servers never see them.' },
    { title: 'Webhook', desc: 'The provider calls /api/payments/webhook. The API verifies the signature, ignores event ids it has already processed, and marks the order Paid in the same transaction as writing an OrderPaid row to the outbox.' },
    { title: 'Publish + consume', desc: 'The outbox publisher pushes OrderPaid to the queue. Consumers send the email, notify the warehouse and update analytics, each idempotently.' },
    { title: 'Clean up', desc: 'A background job cancels Pending orders older than 15 minutes and releases their reservations, so abandoned checkouts never block stock.' }
  ] },
  code: [
    { lang: 'csharp', title: 'Create order: idempotency key + stock reservation in one transaction', code: `using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

app.MapPost("/api/orders", [Authorize] async (CreateOrderRequest req, HttpContext http, ShopDbContext db, IPaymentGateway payments) =>
{
    // Needs MapInboundClaims = false in AddJwtBearer; by default "sub" is renamed to ClaimTypes.NameIdentifier.
    var userId = Guid.Parse(http.User.FindFirst("sub")!.Value);
    var key = http.Request.Headers["Idempotency-Key"].ToString();
    if (string.IsNullOrWhiteSpace(key)) return Results.BadRequest(new { error = "Idempotency-Key header required" });

    // 1. Same key seen before? Return the same answer. No second order, no second charge.
    var existing = await db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.IdempotencyKey == key && o.UserId == userId);
    if (existing is not null) return Results.Ok(new { orderId = existing.Id, paymentClientSecret = existing.PaymentClientSecret });

    // 2. Server-side pricing. Never trust prices from the browser.
    var productIds = req.Items.Select(i => i.ProductId).ToList();
    var products = await db.Products.Where(p => productIds.Contains(p.Id) && p.IsActive).ToDictionaryAsync(p => p.Id);
    if (products.Count != productIds.Count) return Results.BadRequest(new { error = "Unknown or inactive product" });

    var order = new Order { Id = Guid.NewGuid(), UserId = userId, IdempotencyKey = key, Status = OrderStatus.Pending, CreatedAt = DateTime.UtcNow };
    foreach (var item in req.Items)
        order.Items.Add(new OrderItem { ProductId = item.ProductId, Qty = item.Qty, UnitPrice = products[item.ProductId].Price });
    order.Total = order.Items.Sum(i => i.Qty * i.UnitPrice);

    await using var tx = await db.Database.BeginTransactionAsync();
    try
    {
        db.Orders.Add(order);
        await db.SaveChangesAsync();                       // unique index on IdempotencyKey catches a race between two retries

        // 3. Conditional reservation: only succeeds if enough free stock. 0 rows affected = out of stock.
        foreach (var item in order.Items)
        {
            var affected = await db.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE Inventory SET Reserved = Reserved + {item.Qty} WHERE ProductId = {item.ProductId} AND Available - Reserved >= {item.Qty}");
            if (affected == 0) { await tx.RollbackAsync(); return Results.Conflict(new { error = "out_of_stock", productId = item.ProductId }); }
        }

        // 4. Payment session with the provider. Card data never touches us.
        var session = await payments.CreateSessionAsync(order.Id, order.Total, "INR");
        order.PaymentClientSecret = session.ClientSecret;
        await db.SaveChangesAsync();
        await tx.CommitAsync();
    }
    catch (DbUpdateException ex) when (ex.InnerException?.Message.Contains("IX_Orders_IdempotencyKey") == true)
    {
        await tx.RollbackAsync();                           // the other retry won; return its result
        var winner = await db.Orders.AsNoTracking().FirstAsync(o => o.IdempotencyKey == key && o.UserId == userId);
        return Results.Ok(new { orderId = winner.Id, paymentClientSecret = winner.PaymentClientSecret });
    }

    return Results.Created("/api/orders/" + order.Id, new { orderId = order.Id, paymentClientSecret = order.PaymentClientSecret });
});

public record CreateOrderRequest(List<CreateOrderItem> Items, Guid AddressId);
public record CreateOrderItem(Guid ProductId, int Qty);` },
    { lang: 'csharp', title: 'Payment webhook: verify signature, dedupe, mark paid + outbox in one transaction', code: `app.MapPost("/api/payments/webhook", async (HttpContext http, ShopDbContext db, IPaymentGateway payments) =>
{
    using var reader = new StreamReader(http.Request.Body);
    var body = await reader.ReadToEndAsync();
    var signature = http.Request.Headers["X-Provider-Signature"].ToString();

    // 1. Only accept events the provider really sent (HMAC over the raw body with our shared secret).
    if (!payments.VerifySignature(body, signature)) return Results.Unauthorized();
    var evt = payments.ParseEvent(body);                 // { EventId, Type, OrderId, Amount, ProviderRef }

    await using var tx = await db.Database.BeginTransactionAsync();

    // 2. Idempotent: the same event may be delivered more than once. Unique index on Payments.RawEventId.
    if (await db.Payments.AnyAsync(p => p.RawEventId == evt.EventId)) { await tx.RollbackAsync(); return Results.Ok(); }

    var order = await db.Orders.Include(o => o.Items).FirstOrDefaultAsync(o => o.Id == evt.OrderId);
    if (order is null) return Results.Ok();              // acknowledge so the provider stops retrying; log for investigation

    db.Payments.Add(new Payment { Id = Guid.NewGuid(), OrderId = order.Id, RawEventId = evt.EventId, ProviderRef = evt.ProviderRef, Amount = evt.Amount, Status = evt.Type });

    if (evt.Type == "payment.succeeded" && order.Status == OrderStatus.Pending && evt.Amount == order.Total)
    {
        order.Status = OrderStatus.Paid;
        foreach (var item in order.Items)                // reservation becomes a real deduction
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE Inventory SET Available = Available - {item.Qty}, Reserved = Reserved - {item.Qty} WHERE ProductId = {item.ProductId}");

        // 3. Outbox: the event row commits with the order, so "paid but never emailed" cannot happen.
        db.Outbox.Add(new OutboxMessage { Id = Guid.NewGuid(), Type = "OrderPaid", Payload = System.Text.Json.JsonSerializer.Serialize(new { order.Id, order.UserId, order.Total }), CreatedAt = DateTime.UtcNow });
    }
    else if (evt.Type == "payment.failed" && order.Status == OrderStatus.Pending)
    {
        order.Status = OrderStatus.PaymentFailed;
        foreach (var item in order.Items)                // release the reservation
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE Inventory SET Reserved = Reserved - {item.Qty} WHERE ProductId = {item.ProductId}");
    }

    await db.SaveChangesAsync();
    await tx.CommitAsync();
    return Results.Ok();                                  // 2xx tells the provider: delivered, stop retrying
});

// Background publisher (IHostedService): every second, read unsent Outbox rows, publish to the queue, mark Sent.
// Consumers (email, warehouse, analytics) are idempotent on OutboxMessage.Id.` },
    { lang: 'sql', title: 'Core schema (SQL Server) with the indexes that make the guarantees real', code: `CREATE TABLE Products (
  Id UNIQUEIDENTIFIER PRIMARY KEY, Slug NVARCHAR(120) NOT NULL UNIQUE, Name NVARCHAR(200) NOT NULL,
  Description NVARCHAR(MAX) NULL, Price DECIMAL(12,2) NOT NULL, CategoryId INT NOT NULL,
  IsActive BIT NOT NULL DEFAULT 1, RowVersion ROWVERSION
);
CREATE INDEX IX_Products_Category ON Products(CategoryId, IsActive) INCLUDE (Name, Price, Slug);

CREATE TABLE Inventory (                -- separate from Products: it changes on every order
  ProductId UNIQUEIDENTIFIER PRIMARY KEY REFERENCES Products(Id),
  Available INT NOT NULL CHECK (Available >= 0),
  Reserved  INT NOT NULL DEFAULT 0 CHECK (Reserved >= 0),
  RowVersion ROWVERSION
);

CREATE TABLE Orders (
  Id UNIQUEIDENTIFIER PRIMARY KEY, UserId UNIQUEIDENTIFIER NOT NULL,
  Status TINYINT NOT NULL,              -- 0 Pending, 1 Paid, 2 PaymentFailed, 3 Cancelled, 4 Shipped, 5 Delivered
  Total DECIMAL(12,2) NOT NULL, Currency CHAR(3) NOT NULL DEFAULT 'INR',
  IdempotencyKey NVARCHAR(64) NOT NULL, PaymentClientSecret NVARCHAR(200) NULL,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE UNIQUE INDEX IX_Orders_IdempotencyKey ON Orders(UserId, IdempotencyKey);   -- the "no double order" guarantee (a key belongs to one user)
CREATE INDEX IX_Orders_User ON Orders(UserId, CreatedAt DESC);
CREATE INDEX IX_Orders_Pending ON Orders(CreatedAt) WHERE Status = 0;        -- for the 15-minute cleanup job

CREATE TABLE OrderItems (
  OrderId UNIQUEIDENTIFIER NOT NULL REFERENCES Orders(Id), ProductId UNIQUEIDENTIFIER NOT NULL REFERENCES Products(Id),
  Qty INT NOT NULL CHECK (Qty > 0), UnitPrice DECIMAL(12,2) NOT NULL,         -- price snapshot at purchase time
  PRIMARY KEY (OrderId, ProductId)
);

CREATE TABLE Payments (
  Id UNIQUEIDENTIFIER PRIMARY KEY, OrderId UNIQUEIDENTIFIER NOT NULL REFERENCES Orders(Id),
  Provider NVARCHAR(40) NOT NULL DEFAULT 'stripe', ProviderRef NVARCHAR(100) NULL,
  RawEventId NVARCHAR(100) NOT NULL, Amount DECIMAL(12,2) NOT NULL, Status NVARCHAR(40) NOT NULL,
  ReceivedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE UNIQUE INDEX IX_Payments_RawEventId ON Payments(RawEventId);        -- the "webhook is idempotent" guarantee

CREATE TABLE Outbox (
  Id UNIQUEIDENTIFIER PRIMARY KEY, Type NVARCHAR(60) NOT NULL, Payload NVARCHAR(MAX) NOT NULL,
  CreatedAt DATETIME2 NOT NULL, SentAt DATETIME2 NULL
);
CREATE INDEX IX_Outbox_Unsent ON Outbox(CreatedAt) WHERE SentAt IS NULL;

CREATE TABLE Users (
  Id UNIQUEIDENTIFIER PRIMARY KEY, Email NVARCHAR(256) NOT NULL UNIQUE,
  PasswordHash NVARCHAR(500) NOT NULL, Roles NVARCHAR(200) NOT NULL DEFAULT 'Customer', CreatedAt DATETIME2 NOT NULL
);
CREATE TABLE RefreshTokens (
  TokenHash CHAR(64) PRIMARY KEY, UserId UNIQUEIDENTIFIER NOT NULL REFERENCES Users(Id),
  ExpiresAt DATETIME2 NOT NULL, RevokedAt DATETIME2 NULL, ReplacedByHash CHAR(64) NULL, FamilyId UNIQUEIDENTIFIER NOT NULL
);
-- Carts are NOT here: they live in Redis (hash per cart id, 30-day TTL) until they become orders.` },
    { lang: 'text', title: 'Full-stack architecture + deployment sketch', code: `[Angular SPA]  static files on CDN (Azure Static Web Apps)   access JWT in memory, refresh token in HttpOnly cookie
     |  HTTPS /api/*
     v
[CDN + WAF]  caches anonymous GET /api/products* for 60 s; blocks common attacks; rate limits by IP
     |
     v
[API gateway / Load balancer] -> [ASP.NET Core API x N instances]  (modular monolith: Catalog | Search | Cart | Orders | Payments | Inventory | Identity)
     |                 |                 |                    |                       |
     v                 v                 v                    v                       v
[Azure SQL]      [Redis]            [Search index]      [Blob storage + CDN]     [Payment provider]
 Products,        carts, product     Azure AI Search /    product images            hosted card fields (PCI stays with them)
 Inventory,       cache, rate        Elasticsearch,                                   -> webhook -> /api/payments/webhook
 Orders,          limits, refresh    fed by product
 Payments,        token checks       change events
 Outbox, Users
     |
     v  Outbox publisher (hosted service)
[Queue: Service Bus / RabbitMQ]  -> [Email worker] [Warehouse worker] [Analytics worker] [Pending-order cleanup job]

Observability: Application Insights (traces, logs, metrics); dashboards: orders/min, payment failure %, p95 latency, queue depth
CI/CD: build -> tests -> container -> staging -> smoke tests -> slot swap to prod; migrations as a reviewed step
Secrets: Key Vault; TLS everywhere; HSTS, CSP, SameSite cookies; audit log for admin and refunds` }
  ],
  pitfalls: [
    'Trusting prices or totals sent from the browser. Recalculate everything on the server at checkout.',
    'Creating orders without an idempotency key; a double click or a retry becomes a double order.',
    'Checking stock with a SELECT and then an UPDATE. Use one conditional UPDATE (or optimistic concurrency) so two buyers cannot both take the last unit.',
    'Marking an order paid on the client redirect instead of the signed webhook. The redirect can be faked or never arrive.',
    'Handling card numbers in your own forms or logs. Use the provider\'s hosted fields and stay out of PCI scope.',
    'Publishing OrderPaid to the queue outside the database transaction. Use the outbox pattern.'
  ],
  quiz: [
    { q: 'What does an idempotency key on POST /api/orders achieve?', options: ['Faster inserts, because the key acts as a clustered index', 'A retried request returns the same order, not a second one', 'Encryption of the order details on the way to the API', 'Automatic discounts for repeat customers'], answer: 1, why: 'A unique index on the key makes the second attempt find the first order instead of inserting again.' },
    { q: 'Why should the order be marked Paid from the webhook and not from the browser redirect?', options: ['Webhooks always arrive before the browser redirect does', 'The webhook is signed and retried; a redirect can be faked or lost', 'Browsers cannot call APIs after returning from a payment page', 'Redirects are deprecated and blocked by most modern browsers'], answer: 1, why: 'Only a verified, server-to-server message from the provider is trustworthy proof of payment.' },
    { q: 'How do you prevent overselling the last unit when two people check out at once?', options: ['Show a warning that asks users not to buy at the same time', 'A conditional UPDATE that only succeeds if enough stock is free', 'A bigger database server, so both updates finish sooner', 'Read the stock count from the cache, then write the new value back'], answer: 1, why: 'The database serialises the two updates; the second sees no free stock and affects 0 rows.' },
    { q: 'Where should card numbers be handled?', options: ['In our API, encrypted with a key that we keep safely in Key Vault', 'In our database, in a column only admins can read', 'Only by the payment provider, via hosted fields or their SDK', 'In Redis, with a short TTL so they vanish after checkout'], answer: 2, why: 'Never touching card data is the simplest way to be both secure and compliant.' },
    { q: 'What problem does the outbox pattern solve?', options: ['Slow emails, by sending them from the web request in parallel', 'The order update and its queued event commit together', 'Large images, by moving them out of the database', 'Password storage, by keeping hashes in a separate table'], answer: 1, why: 'Writing the event in the same transaction and publishing it afterwards guarantees at-least-once delivery.' },
    { q: 'Why keep the access token short-lived and use a refresh token?', options: ['To log users out often, which makes them choose better passwords', 'A stolen access token only works for a few minutes', 'Refresh tokens are faster for the API to check than JWTs', 'JWTs expire on their own anyway'], answer: 1, why: 'Short access tokens limit damage; rotated refresh tokens let you detect theft and revoke sessions.' }
  ],
  takeaways: [
    'Reads are cached and may be slightly stale; checkout writes are transactional, idempotent and queue anything slow.',
    'Never trust client prices; always re-quote on the server.',
    'Idempotency key (unique index) stops double orders; conditional UPDATE stops overselling; signed, deduped webhooks stop lost or fake payments.',
    'Outbox pattern ties the database change and the queued event together.',
    'Auth: slow password hashing, 15-minute access JWT, rotated HttpOnly refresh tokens, resource-level authorization, rate limits.',
    'Start as a modular monolith with Redis, a queue, a search index and a CDN; split services only when load or teams demand it.'
  ],
  interview: [
    { q: 'Walk me through what happens when a user clicks Pay.', a: '<p>Quote recalculated on the server; POST /api/orders with an idempotency key; one transaction inserts the Pending order and reserves stock with conditional updates; a payment session is created with the provider; the browser uses the provider\'s hosted form; the provider\'s signed webhook marks the order Paid and writes an outbox event; workers send the email and notify the warehouse; a job cancels unpaid orders after 15 minutes.</p>' },
    { q: 'How would you handle a flash sale with 100,000 people wanting 1,000 units?', a: '<p>Move the counter for that SKU to Redis and decrement atomically with a Lua script; reject instantly when it hits zero; put a virtual waiting room in front of checkout to smooth the burst; reconcile Redis to SQL asynchronously; cache product pages fully on the CDN so browsing does not touch the database.</p>' },
    { q: 'Monolith or microservices for this shop?', a: '<p>Modular monolith to start: one deployable with clear module boundaries and one database, so cart, order and inventory changes can share a transaction. Extract services (search, notifications, then maybe orders) only when a module needs independent scaling or a separate team. Microservices from day one add sagas and operational cost before you have the traffic to justify them.</p>' },
    { q: 'How do you secure the login flow?', a: '<p>Hash passwords with PBKDF2/Argon2, rate-limit attempts, short-lived access JWTs kept in memory, refresh tokens in HttpOnly Secure SameSite cookies with rotation and family revocation on reuse, resource-level authorization checks, and audit logging. Optionally add MFA for admins.</p>' }
  ]
};

