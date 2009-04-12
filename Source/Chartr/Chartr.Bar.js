/*
	Chartr.Bar.js
	
	A bar chart implementation to work with the Chartr library
		
	Credits
	-------
	Initial version by Ryan Mitchell (ryan@rtnetworks.net)
	Inspired by Plootr http://utils.softr.net/plootr/
	
	Copyright
	---------
 	Copyright 2009 Ryan Mitchell (ryan@rtnetworks.net)
	
*/
Chartr.Types.Bar = new Class({
							 
	Implements: [Options,Events],
	
	options: {
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
		colors: ['#cc0000','#00cc00','#0000cc'],
		hovercolor: '#000000', // color on mouseover
		animate: true, // do we animate?
		animateperiod: 600 // over what period?
	},
	
	initialize: function(el,parent,options){
		this.el = el;
		this.parent = parent;
		this.setOptions(options);
		this.data = {points:[]};
		this.parent.addEvent('mousemove', function() {
			this.redraw(false);
		}.bind(this));
	},
	
	/*
	*	plot the data
	*/
	plot: function(data){
		this.data = data;
		this.animatepercent = (this.options.animate) ? 0 : 100;
		this.plotData(true);
		
	},
	
	plotData: function(redrawAxis){
		
		if(!this.options.animate || this.animatepercent == 100) this.fireEvent('beforeAxesDrawn',this.parent);
		
		// do we need to redraw the axis?
		if(redrawAxis){
			
	    	var cx = this.el.getContext('2d');
			cx.strokeStyle = this.options.axisColor;
			cx.lineWidth = this.options.axisWidth;
					
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
					display:'block'
				});
				this.area.h = this.area.h - d.getSize().y - 10;
			}
			
			// show y label?
			if(this.options.yLabel != ''){
				var d = new Element('div',{html:this.options.yLabel}).addClass(this.parent.options.cssclass).addClass(this.parent.options.cssclass+'label-y').setStyle('display','none');
				this.parent.container.adopt(d);
				d.setStyles({
					position:'absolute',
					left: this.area.x + 'px',
					top: this.area.y + 'px',
					display:'block'
				});
				this.area.h = this.area.h - d.getSize().y - 15;
				this.area.y = this.area.y + d.getSize().y + 15;
			}
			
			if(this.options.showXAxisMarkerValues || this.options.showYAxisMarkerValues){
				this.area.x += 20;
				this.area.w -= 20;
			}
			
			// work out how much to space out ticks by
			this.xspacing = this.area.w / this.data.points.length;
			this.yspacing = this.area.h / ((this.options.maxY - this.options.minY) / this.options.deltaY);
			
			// work out the spacing between each point
			this.xpointspacing = this.area.w / this.data.points.length;
			this.ypointspacing = this.area.h / (this.options.maxY - this.options.minY);
			
			// work out where our origin is
			this.origin = [0,0];
			
			// draw x axis
			var xcount = 0;
			this.data.points.each(function(p){
				var x = this.area.x + (xcount * this.xspacing);
				var y = this.area.y + this.area.h - this.origin[1];
				cx.beginPath();
				cx.moveTo(x+0.5,y+0.5+(this.options.axisMarkerSize/2));
				cx.lineTo(x+0.5,y+0.5-(this.options.axisMarkerSize/2));
				cx.closePath();
				cx.stroke();
				if(this.options.showXAxisMarkerValues){
					var label = new Element('span',{html:p[0]}).addClass(this.parent.options.cssclass).addClass(this.parent.options.cssclass+'axis-x');
					this.parent.container.adopt(label);
					label.setStyles({
						top: y + parseInt(this.el.getStyle('padding-top')) + this.options.axisMarkerSize + 'px',
						left: x + parseInt(this.el.getStyle('padding-left')) + this.xspacing/2 - (label.getSize().x/3) + 'px'
					});
				}
				xcount++;
			},this);
			
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
				if(this.options.showYAxisMarkerValues){
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
			
			if(this.animatepercent == 100) this.fireEvent('axesDrawn',this.parent);
			
		}
			
		if(!this.options.animate || this.animatepercent == 100) this.fireEvent('beforeDataPlotted',this.parent);
				
	    var cx = this.el.getContext('2d');
					
		var xcount = 0;
		this.data.points.each(function(c){
			if(($type(c)=='array') && (c.length > 1)){
				
				var mouseon = false;
								
				// is the mouse over me?
				if((this.parent.mouse.x >= (this.area.x + (xcount*this.xspacing))) && (this.parent.mouse.x <= (this.area.x + (xcount+1)*this.xspacing))){
					if((this.parent.mouse.y >= (this.area.y + this.area.h - (c[1]*this.ypointspacing))) && (this.parent.mouse.y <= (this.area.y + this.area.h))){
						mouseon = true;
						if(c.length > 2) { 
							this.parent.showTip(c[2]);
						}
					}
				}
								
				cx.beginPath();
				cx.fillStyle = (mouseon) ? this.options.hovercolor : this.options.colors[xcount%this.options.colors.length];
				cx.rect(this.area.x + (xcount*this.xspacing),this.area.y + this.area.h - (c[1]*this.ypointspacing*(this.animatepercent/100)),this.xspacing,(c[1]*this.ypointspacing*(this.animatepercent/100)));	
				cx.fill();
				
				xcount++;
								
			}
		},this);
				
		if(this.animatepercent == 100) this.fireEvent('dataPlotted',this.parent);
		
		if(this.options.animate && (this.animatepercent < 100)){
			this.animatepercent += 4;
			this.redraw.delay(this.options.animateperiod/25,this,[false]);
		}	
	},
	
	/*
	*	unplot
	*
	*/
	unplot: function(){
		this.data = {points:[]};
		this.redraw();
	},
		
	/*
	*	redraw the canvas
	*
	*	called on mouse movement, so we can simulate mouse over behaviour
	*/
	redraw: function(redrawAxis){
		if(redrawAxis==null) redrawAxis = true;
		if(redrawAxis){
			this.el.getContext('2d').clearRect(0,0,this.el.getSize().x,this.el.getSize().y);
			this.parent.cleanup();
		} else {
			this.el.getContext('2d').clearRect(this.area.x+this.options.strokewidth,this.area.y+this.options.strokewidth,this.area.w,this.area.h);
		}
		this.plotData(redrawAxis);
	}
							 
});