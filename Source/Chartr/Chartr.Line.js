/*
	Chartr.Line.js

	A line chart implementation to work with the Chartr library
		
	Credits
	-------
	Initial version by Ryan Mitchell (ryan@rtnetworks.net)
	Inspired by Plootr http://utils.softr.net/plootr/
	
	Copyright
	---------
 	Copyright 2009 Ryan Mitchell (ryan@rtnetworks.net)
	
*/

Chartr.Types.Line = new Class({
									
	Implements: [Options,Events],
	
	options: {
		minX: 0, // lowest x value
		maxX: 100, // highest x value
		deltaX: 10, // show x value every ..
		minY: 0, // lowest y value
		maxY: 100, // highest y value
		deltaY: 10, // show y value every ..
		axisColor: '#000000', // color of the axes
		axisWidth: 1, // width of axis
		axisMarkerSize: 5,
		showXAxisMarkerValues: true,
		showYAxisMarkerValues: true,
		xLabel: '', // html contents of label for x axis
		yLabel: '', // html content of label for y axis
		joinPoints: true,
		animate: true,
		animateperiod: 600,
		redrawAxes: true // redraw the axes - allows you to change them dynamically
	},
	
	initialize: function(el,parent,options){
		this.el = el;
		this.parent = parent;
		this.setOptions(options);
		this.drawAxes();
		this.plotted = [];
		this.plottedbackup = [];
		this.parent.addEvent('mousemove',function(){ 
			this.redraw(); 
		}.bind(this));
	},
	
	/*
	*	draw the x and y axes
	*/
	drawAxes: function(){
		
		this.fireEvent('beforeAxesDrawn',this.parent);
		
	    var cx = this.el.getContext('2d');
	    cx.strokeStyle = this.options.axisColor;
	    cx.lineWidth = this.options.axisWidth;
	    
	    var drawLabels = (this.parent.container.getElements('span').length > 0) ? false : true;
	    drawLabels = drawLabels || this.options.redrawAxes;
				
		// work out how much space we have
		this.area = {
			x:parseInt(this.el.getStyle('padding-left')) + 10,
			y:parseInt(this.el.getStyle('padding-top')) + 10,
			w:this.parent.area.w - parseInt(this.el.getStyle('padding-left')) - parseInt(this.el.getStyle('padding-right')) - 20,
			h:this.parent.area.h - parseInt(this.el.getStyle('padding-top')) - parseInt(this.el.getStyle('padding-bottom')) - 20
		};
				
		// show x label?
		if(this.options.xLabel != ''){
			var d = new Element('div',{html:this.options.xLabel}).addClass(this.parent.options.cssclass).addClass(this.parent.options.cssclass+'label-x').setStyle('display','none');
			this.parent.container.adopt(d);
			d.setStyles({
				position:'absolute',
				right:this.area.x + 'px',
				top:this.area.h - d.getSize().y + 'px',
				display:'block',
				'z-index':'1000'
			});
			this.area.h = this.area.h - d.getSize().y - 10;
			if(!drawLabels) d.dispose();
		}
		
		// show y label?
		if(this.options.yLabel != ''){
			var d = new Element('div',{html:this.options.yLabel}).addClass(this.parent.options.cssclass).addClass(this.parent.options.cssclass+'label-y').setStyle('display','none');
			this.parent.container.adopt(d);
			d.setStyles({
				position:'absolute',
				left: this.area.x + 'px',
				top: this.area.y + 'px',
				display:'block',
				'z-index':'1000'
			});
			this.area.h = this.area.h - d.getSize().y - 15;
			this.area.y = this.area.y + d.getSize().y + 15;
			if(!drawLabels) d.dispose();
		}
				
		if(this.options.showXAxisMarkerValues || this.options.showYAxisMarkerValues){
			this.area.x += 20;
			this.area.w -= 20;
		}
		
		// work out how much to space out ticks by
		this.xspacing = this.area.w / ((this.options.maxX - this.options.minX) / this.options.deltaX);
		this.yspacing = this.area.h / ((this.options.maxY - this.options.minY) / this.options.deltaY);
		
		// work out the spacing between each point
		this.xpointspacing = this.area.w / (this.options.maxX - this.options.minX);
		this.ypointspacing = this.area.h / (this.options.maxY - this.options.minY);
		
		// work out where our origin is
		this.origin = [0,0];
		if((this.options.minX < 0) && (this.options.maxX > 0)) this.origin[0] = (0 - this.options.minX) * this.xpointspacing;
		if((this.options.minY < 0) && (this.options.maxY > 0)) this.origin[1] = (0 - this.options.minY) * this.ypointspacing;
		
		// draw x axis
		var xcount = 0;
		for(i=this.options.minX;i<=this.options.maxX;i=i+this.options.deltaX){
			var x = this.area.x + (xcount * this.xspacing);
			var y = this.area.y + this.area.h - this.origin[1];
			cx.beginPath();
			cx.moveTo(x+0.5,y+0.5+(this.options.axisMarkerSize/2));
			cx.lineTo(x+0.5,y+0.5-(this.options.axisMarkerSize/2));
			cx.closePath();
			cx.stroke();
			if(this.options.showXAxisMarkerValues && drawLabels){
				var label = new Element('span',{html:i}).addClass(this.parent.options.cssclass).addClass(this.parent.options.cssclass+'axis-x');
				this.parent.container.adopt(label);
				label.setStyles({
					top: y + parseInt(this.el.getStyle('padding-top')) + this.options.axisMarkerSize + 'px',
					left: x + parseInt(this.el.getStyle('padding-left')) - (label.getSize().x/3) + 'px'
				});
			}
			xcount++;
		}
		
		cx.beginPath();
		cx.moveTo(this.area.x+0.5, this.area.y + this.area.h + 0.5 - this.origin[1]);
		cx.lineTo(this.area.x + this.area.w + 0.5, this.area.y + this.area.h + 0.5 - this.origin[1]);
		cx.closePath();
		cx.stroke();
				
		// draw y axis
		var ycount = 0;
		for(i=this.options.maxY;i>=this.options.minY;i=i-this.options.deltaY){
			var y = this.area.y + (ycount * this.yspacing);
			var x = this.area.x + this.origin[0];
			cx.beginPath();
			cx.moveTo(x+0.5+(this.options.axisMarkerSize/2),y+0.5);
			cx.lineTo(x+0.5-(this.options.axisMarkerSize/2),y+0.5);
			cx.closePath();
			cx.stroke();
			if(this.options.showYAxisMarkerValues && drawLabels){
				var label = new Element('span',{html:i}).addClass(this.parent.options.cssclass).addClass(this.parent.options.cssclass+'axis-y');
				this.parent.container.adopt(label);
				label.setStyles({
					top: y + parseInt(this.el.getStyle('padding-top')) - (label.getSize().y / 3) + 'px',
					left: x + parseInt(this.el.getStyle('padding-left')) - this.options.axisMarkerSize - label.getSize().x + 'px'
				});
			}
			ycount++;
		}
				
		cx.beginPath();
		cx.moveTo(this.area.x+this.origin[0]+0.5, this.area.y + 0.5);
		cx.lineTo(this.area.x+this.origin[0]+0.5, this.area.y + this.area.h + 0.5);
		cx.closePath();
		cx.stroke();
						
		this.fireEvent('axesDrawn',this.parent);
	
	},
	
	/*
	*	unplot
	*	remove data from this.plotted
	*
	* @param {String} ref			The reference to unplot
	*/
	unplot: function(ref){
		this.plotted.each(function(r){ 
			if(r.ref == ref){
				this.plotted.erase(r);	
			}					   
		},this);
		this.plottedbackup.each(function(r){ 
			if(r.ref == ref){
				this.plotted.erase(r);	
			}					   
		},this);
		this.redraw();
	},
	
	/*
	*	unplotall
	*	remove all plotted data
	*
	*/
	unplotall: function(){
		this.plotted = [];
		this.plottedbackup = [];
		this.redraw();
	},
	
	/*
	*	showall
	*	show all plotted data
	*
	*/
	showall: function(){
		this.plotted = $A(this.plottedbackup);
		this.plottedbackup = [];
		this.redraw();
	},
	
	
	/*
	*	hideall
	*	hide all plotted data, but keep the data for later user
	*
	*/
	hideall: function(){
		if(this.plottedbackup.length == 0) this.plottedbackup = $A(this.plotted);
		this.plotted = [];
		this.redraw()
	},
	
	/*
	*	showonly
	*	show only the data from the references in the passed array
	*
	*/
	showonly: function(ar){
		if(this.plottedbackup.length == 0) this.plottedbackup = $A(this.plotted);
		this.plotted = [];
		if($type(ar) != 'array') ar = [];
		this.plottedbackup.each(function(r){ 
			if(ar.contains(r.ref)){
				this.plotted.push(r);	
			}					   
		},this);		
		this.redraw();
	},
	
	/*
	*	hideonly
	*	hide only the data from the references in the passed array
	*
	*/
	hideonly: function(ar){
		if(this.plottedbackup == []) this.plottedbackup = $A(this.plotted);
		this.plotted = [];
		if($type(ar) != 'array') ar = [];
		this.plottedbackup.each(function(r){ 
			if(!ar.contains(r.ref)){
				this.plotted.push(r);	
			}					   
		},this);		
		this.redraw();
	},
	
	/*
	*	plot the data
	*	this one gets called externally as it adds the data to this.plotted
	*
	* @param {Array} data			The points in array format ... eg [[1,2],[3,4]]
	* @param {Object} scheme		Colour scheme object { pointColor: .., pointType:.., pointSize:.., lineColor: .., lineWidth:.. }
	* @param {String} ref			User defined reference for this set of data
	*/
	plot: function(data,scheme,ref){
		if(!scheme) scheme = {};
		var scheme = $extend({ 
			pointColor: '#ff0000',
			pointType: 'square', // circle or square
			pointSize: 4, // radius of circle/ width + length of square
			lineColor: '#cccccc',
			lineSize: 1					 
		},scheme);
		this.plotted.push({
			data: data,
			scheme: scheme,
			ref: ref
		});
		if(this.plottedbackup != []){
			this.plottedbackup.push({
				data: data,
				scheme: scheme,
				ref: ref
			});
		}
		this.animatepercent = (this.options.animate) ? 0 : 100;
		this.plotData(data,scheme);
	},
	
	/*
	*	plot the data
	*
	* @param {Array} data			The points in array format ... eg [[1,2],[3,4]]
	* @param {Object} scheme		Colour scheme object { pointColor: .., pointType:.., pointSize:.., lineColor: .., lineWidth:.. }
	*/
	plotData: function(data,scheme){
	
		if(!this.options.animate || (this.animatepercent == 0)) this.fireEvent('beforeDataPlotted',this.parent);
				
	    var cx = this.el.getContext('2d');
		cx.fillStyle = scheme.pointColor;
		cx.strokeStyle = scheme.lineColor;
		cx.lineWidth = scheme.lineSize;
				
		var lastPoint = [];
		var counter = 0;
		var pointsToShow = Math.floor(data.points.length * (this.animatepercent/100));
		data.points.each(function(c){
			if(($type(c)=='array') && (c.length > 1)){
				
				counter++;
				
				if(counter <= pointsToShow){
								
					// are we drawing a line between points?
					if(this.options.joinPoints){
						if(lastPoint.length>1){
							cx.beginPath();
							cx.moveTo(this.area.x + this.origin[0] + (lastPoint[0] * this.xpointspacing) + (scheme.pointSize/2),this.area.y - this.origin[1] + this.area.h  - (lastPoint[1] * this.ypointspacing));
							cx.lineTo(this.area.x + this.origin[0] + (c[0] * this.xpointspacing) - (scheme.pointSize/2),this.area.y - this.origin[1] + this.area.h - (c[1] * this.ypointspacing));
							cx.stroke();
						}
						lastPoint = c;			
					}
									
					// points on canvas
					var pointx = this.area.x + this.origin[0] + (c[0] * this.xpointspacing) - (scheme.pointSize / 2);
					var pointy = this.area.y - this.origin[1] + this.area.h - (scheme.pointSize / 2) - (c[1] * this.ypointspacing);
					
					// is the mouse over me?
					if((this.parent.mouse.x >= pointx) && (this.parent.mouse.x <= pointx + scheme.pointSize)){
						if((this.parent.mouse.y >= pointy) && (this.parent.mouse.y <= pointy + scheme.pointSize)){
							if(c.length > 2) { 
								this.parent.showTip(c[2]);
							}
						}
					}
					
					cx.beginPath();
					
					// what do we draw?
					if(scheme.pointType == 'circle'){
						cx.arc(pointx,pointy,scheme.pointSize,0,Math.PI+(Math.PI*3)/2,false);
					} else {
						cx.rect(pointx,pointy,scheme.pointSize,scheme.pointSize);	
					}
	
					cx.fill();
				
				}
								
			}
		},this);
			
		if(this.animatepercent == 100) this.fireEvent('dataPlotted',this.parent);
		
		if(this.options.animate && (this.animatepercent < 100)){
			this.animatepercent += 4;
			this.redraw.delay(this.options.animateperiod/25,this,[false]);
		}	
	
	},
	
	/*
	*	redraw the canvas
	*
	*	called on mouse movement, so we can simulate mouse over behaviour
	*/
	redraw: function(){
		var cx = this.el.getContext('2d');
		cx.clearRect(0,0,this.el.getSize().x,this.el.getSize().y);
		if(this.options.redrawAxes) this.parent.cleanup();
		this.drawAxes();
		this.plotted.each(function(d){ this.plotData(d.data,d.scheme); },this);
	}
										
});