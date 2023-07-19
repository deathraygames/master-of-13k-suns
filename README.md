# Master of 13000 Suns

*An incremental space game in a procedural galaxy in 13kb*
*Made for JS13k Games 2021*

## Play

* Latest build on the `main` branch: https://deathraygames.github.io/master-of-13k-suns/dist/ (this is the best version)

## JS13k

* [JS13k Rules](http://2021.js13kgames.com/#rules): Make a game with a package size less than 13k (13,312 bytes) in one month (8/13 to 9/13).
* Theme for 2021: *"Space"*
* [Entry for this game on js13kgames.com](https://js13kgames.com/entries/)
* See all the entries for the competition at http://2021.js13kgames.com/

## Post Mortem

I didn't have too much time to work on this game during the jam's month, so I went with simple design based off a previous game [Master of a Thousand Suns](https://deathraygames.com/play-online/master-of-1k-suns/) (which is even more simple). My general goals were: 

* 4x gameplay: Explore, Expand, Exploit, Exterminate
* Slow incremental gameplay - easy to begin, but takes forever to complete
* Mobile-friendly
* Of course: Fit it all into 13kb!

### Compression

Rather than using webpack for compression like last year, instead I used vite - mainly because I was already using it for a quick and easy dev server, but also because the build process was super easy. I didn't do any minimizing of my code by hand (i.e., code golf, Xem-style js) because fortunately I wasn't close to the limit.

* Source: ~44.9 KB
	* js scripts: ~36.8 KB
		* `Empire.js`: 16.1 KB
		* `game.js`: 11.8 KB
		* All others: ~9 KB (but not all were really used)
	* html/css: 7.95 KB
* Minified: 26.2 KB
	* js: 18.3 KB
	* html/css: 7.98 KB (it actually went up a tiny amount)
* Zipped: **8.95** KB (Plenty of extra space!)

### Feedback

* Shortest (impatient) play-thru possible: https://youtu.be/uF1W_mfcCN8?t=369
* "Nice layout. I would definitely have benefited from a short tutorial and/or a way to speed up time"
