/*
	Chartr 
	v0.1

	Chartr is a javascript class for creating in-browser charts bases on the MooTools javascript library.
		
	Credits
	-------
	Initial version by Ryan Mitchell (ryan@rtnetworks.net)
	Inspired by Plootr http://utils.softr.net/plootr/
	
	Copyright
	---------
 	Copyright 2009 Ryan Mitchell (ryan@rtnetworks.net)
	
*/

Chartr = new Class({
					 
	// we need options and events
	Implements: [Options,Events],
	
	// default options
	options: {
		cssclass: 'chartr-',
		type: 'Line',
		padding: {
			top: 5,
			right: 5,
			bottom: 5,
			left: 5
		}
	},
	
	/*
	* Sets up the class
	* 
	* @param {Element} el			Reference to the canvas element to use
	* @param {Object} options		Options to over-ride the defaults
	* @return {Chartr) this		Chartr reference
	*/
	initialize: function(el,options){
		this.setOptions(options);
		if($defined(Chartr.Types[this.options.type])){
			this.el = $(el);
			if(this.el.get('tag') != 'canvas'){
				throw 'Chartr(): Element is not a canvas element';	
			} else {
				this.container = new Element('div').setStyles({position:'relative',width:this.el.getSize().x,height:this.el.getSize().y});
				this.container.wraps(this.el);
				if(this.prepareCanvas()){
					this.el.store('Chartr',this);
					this.tip = new Element('div').addClass(this.options.cssclass).addClass(this.options.cssclass+'tooltip').setStyle('display','none');
					this.container.adopt(this.tip);
					this.mouse = {x:0,y:0};
					this.el.addEvent('mousemove', this.mouseMove.bind(this));
					this.el.addEvent('mouseout', this.mouseOut.bind(this));
					this.el.addEvent('mouseon', this.mouseOn.bind(this));
					this.chart = new Chartr.Types[this.options.type](this.el,this,options);
				}
			}
		} else {
			throw 'Chartr(): Chartr.Types.'+this.options.type+' is not defined!';	
		}
	},

	/*
	* Sets up the class
	* 
	* @return {Element) this.el		Reference to the element with the chart init
	*/
	toElement: function(){
		return this.el;
	},

	/*
	* set up the canvas element for a chart to be drawn
	* 
	* @return {Boolean)				Are we set up?
	*/
	prepareCanvas: function(){
		
		// give IE some canvas action
		if(Browser.Engine.trident){
			if($defined(G_vmlCanvasManager)){
				this.maxTries = 20;
				this.renderStack = new Hash();
				this.el = G_vmlCanvasManager.initElement(this.el);	
			} else {
				throw 'Chartr.prepareCanvas(): exCanvas is not defined';	
				return false;
			}
		}
		
		// set up drawing area
		this.area = {
 	        x: this.options.padding.left,
 	        y: this.options.padding.top,
 	        w: this.el.width - this.options.padding.left - this.options.padding.right,
 	        h: this.el.height - this.options.padding.top - this.options.padding.bottom
 	    };
		
		this.fireEvent('canvasPrepared',this);
		
		return true;
	},
	
	/*
	* call a sub-class method
	* 
	* @param {string} method	name of method to call
	* @param {array} args		arguments to pass to method
	*/
	call: function(method,args){
		try{
			this.chart[method].run(args,this.chart);
		} catch(e){
			throw 'Chartr.call('+method+'): ' + e;		
		}
	},
	
	/*
	* show the tooltip
	* 
	* @param {string} html	HTML to insert into tooltip
	* @return {void)
	*/
	showTip: function(html){
		this.tip.set('html',html);
		this.tip.setStyles({
			display:'block',
			'z-index':1000,
			left: this.mouse.x + 10 + 'px',
			top: this.mouse.y - 20 + 'px'
		});
		this.fireEvent('showTip',this);
	},
	
	/*
	* hide the tooltip
	* 
	* @return {void)
	*/
	hideTip: function(){
		this.tip.setStyle('display','none');	
		this.fireEvent('hideTip',this);
	},
	
	/*
	* cleanup divs and spans
	* 
	* @return {void)
	*/
	cleanup: function(){
		this.container.getElements('div').each(function(el){
			if(el != this.tip) el.dispose();												
		},this);
		this.container.getElements('span').dispose();
	},
	
	/*
	* tracks where the mouse is
	* 
	* @return {void)
	*/
	mouseMove: function(e){
		var pos = this.el.getCoordinates();
		this.mouse.x = e.page.x - pos.left;
		this.mouse.y = e.page.y - pos.top;
		this.hideTip();
		this.fireEvent('mousemove',this);
	},
	
	/*
	* called when the mouse is over the canvas
	* 
	* @return {void)
	*/
	mouseOn: function(e){
		this.fireEvent('mouseon',this);	
	},
	
	/*
	* called when the mouse moves off the canvas
	* 
	* @return {void)
	*/
	mouseOut: function(e){
		this.hideTip();
		this.fireEvent('mouseout',this);	
	}
	
});

Chartr.Types = {};