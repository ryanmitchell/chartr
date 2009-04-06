Chartr
===========

About
-----
A simple canvas charting application written in [MooTools](http://mootools.net/).

Features
--------

* Extendable - easy to add your own chart types
* Simple to use
* Works in Internet Explorer 6/7/8 with excanvas plugin

Requirements
------------

[Mootools 1.2.1 Core](http://mootools.net/download), with minimum requirements of:

* Class.Extras
* Element.Event
* Element.Style
* Element.Dimensions
* Selectors

Examples
--------

The basic code:

	window.addEvent('domready', function(){
		new Chartr("line-chart",{ type:'Line'}).call('plot',[{points:[...]}]);
	});

