# Master of 13000 Suns

*An incremental space game in a procedural galaxy in 13kb*
*Made for JS13k Games 2021*

## Play

* Latest main branch: https://deathraygames.github.io/master-of-13k-suns/

## JS13k

* [JS13k Rules](http://2021.js13kgames.com/#rules): Make a game with a package size less than 13k (13,312 bytes) in one month (8/13 to 9/13).
* Theme for 2021: *"Space"*
* [Entry for this game on js13kgames.com](https://js13kgames.com/entries/)
* See all the entries for the competition at http://2021.js13kgames.com/

## Post Mortem

### Compression

Rather than using webpack for compression like last year, instead I used vite - mainly because I was already using it for a quick and easy dev server, but also because the build process was super easy. I didn't do any minimizing of my code by hand (i.e., code golf, Xem-style js) because fortunately I wasn't close to the limit.

* Source: ~44.7 KB
	* js scripts: ~36.8 KB
		* `Empire.js`: 15.9 KB
		* `game.js`: 11.8 KB
		* All others: ~9 KB (but not all was really used)
	* html/css: 7.95 KB
* Minified
	* js: 19.4 KB
	* html/css: 7.98 KB (it actually went up a tiny amount)
* Zipped: **9.42** KB (Plenty of extra space!)
