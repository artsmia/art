This is the code behind [Mia's collection website](http://collections.artsmia.org).

# Required Software to run sass
Install: sassc -lm sass/main.scss css/main.css
Install: npm install -g rewatch
Run when you npm start for code to watch for changes: npm run watchSass

# Usage

To start the server locally, you (1) need passing familiarity with
`node`. (2) `npm install` to download all this project's dependencies.
(3) `npm start` should start the webserver and begin to update the
javascript bundle.

To compile the sass, install `libsass` and `sassc` (`brew install sassc`) and run `sassc -lm sass/main.scss css/main.css`

# Companion code

It pulls information from many different places:

* [collection-elasticsearch](https://github.com/artsmia/collection-elasticsearch) manages indexing and searching with ElasticSearch
* [collection-info](https://github.com/artsmia/collection-info) hosts editable text for many of the pages on this site
* [collection-links](https://github.com/artsmia/collection-links) connects artworks with related content (audio, blog posts, …)
* [artwork-dimensions](https://github.com/artsmia/artwork-dimensions)
  parses the dimension data for an artwork and builds a graphic referencing the size of a tennis ball.
* [museumTileLayer](https://github.com/kjell/museumTileLayer)
  adds a few features to [Leaflet](https://github.com/Leaflet/Leaflet) to display high-resolution photography

# Deployment

Deploying the code happens in two steps:

1. Deploying the bundled frontend javascript and CSS

`make build deploy target=<ssh alias for the server> ENV=production NODE_ENV=production` will build the CSS and JS and deploy it over SSH to the desired server.

This requires a pre-configured alias in `~/.ssh/config` and asssumes you have ssh access to that server:

```
Host collections
  HostName <host domain name or IP>
  User <username>
  Port 3456
  ForwardAgent yes
```

2. Updating the code on the server and restarting the node process.

Sometimes deploying the new bundle is enough, but because this react app is both server- and client-rendered, most of the time both should be updated. At this point, each must be done separately. 

Updating the codebase for the server consists of manually pulling down the latest commits from github, testing that the new code builds successfully in the server's environment (keep an eye out for missing dependencies and/or features that might work with the newest version of node, but that aren't supported by a potentially older version installed on the server!)

To upgrade the server code, `ssh` in to the deployment server and navigate to the code directory. Check what branch is currently checked out (`git branch`) and that there aren't any renegade code changes to git-tracked files (`git status`).

`git fetch`/`git pull` down the newest code, and test that `node` interprets it correctly and that the server starts up.

```
PORT=1315 node server.babel.js
```
Here we start the server with the ENV variable `1315` which is importantly a DIFFERENT port than what the live server reverse-proxied by nginx runs on. Starting the process on an unused port only serves to check that the code doesn't crash immediately (which if it did, you wouldn't want to deploy!). If the output of that command is `👌 1315` then things are going well.`^C` (control-c) will stop the running process and return to the command line prompt.

Next, restart the actual running server. There are two ways to do this - either using Ubuntu's `init.d` service, or by checking for the server running inside of `tmux`.

`init.d` is easy - `sudo stop collections; sudo start collections` will stop and re-start the server. Check the configuration file `/etc/init/collections.conf` to get an idea of what's happening here.

Sometimes when testing things out, it's easier to run the node process by hand in a long-lasting terminal multiplexer (`tmux`). A clue that the server is running outside of `init.d` is if you run the above `sudo stop <...>` command and see an error message like "`stop: Unknown instance:`" or "`start: Job failed to start`".

This is a bit more advanced, but worth knowing how to do. First, if there's a tmux session already running on the server, `tmux attach` will connect to it. You'll see a "status bar" on the bottom of your terminal window with something like:

```
[0] 0:node- 1:node  4:bash*
```

That means that there are three virtual "windows": window #0, running a node process; window #1, also running node; and #4, this one running bash. The `*` in `4:bash*` means tmux is currently showing window 4, the bash process. To connect to window #0, press <control-b> and then the window number, here `0`. The screen will refresh and you'll be on the screen with a node process running. You can tell if this is the collections site based on the messages logged to the screen. (They'll look just like what you see when running the server in your local environment!)

If this is the correct tmux window - <control-C> will quit the process, at which point you can restart it either by running `PORT=<desired port> node-supervisor server.babel.js`, or by hitting the up arrow at the empty bash prompt which will bring back the last command which should most likely be the command that was used to start the previous server process.
