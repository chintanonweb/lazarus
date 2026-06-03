// graveyard.js - find my dead repos
// built this at like 2am during a hackathon weekend, never finished it lol
// usage: node graveyard.js <username>

const user = process.argv[2] || "torvalds";

fetch("https://api.github.com/users/" + user + "/repos?per_page=100")
  .then((r) => r.json())
  .then((repos) => {
    console.log("\n  THE GRAVEYARD of " + user + "\n");

    let dead = 0;
    for (const repo of repos) {
      const last = new Date(repo.pushed_at);
      const days = Math.floor((Date.now() - last) / 86400000);

      // TODO: make this threshold configurable maybe?
      if (days > 180 && !repo.fork) {
        dead++;
        console.log("  RIP " + repo.name + " - last touched " + days + " days ago");
      }
    }

    console.log("\n  " + dead + " dead repos found. rip.\n");
    // TODO: epitaphs? a UI? something that isnt ugly? ...finish later
  })
  .catch((e) => console.log("uh oh", e.message));
