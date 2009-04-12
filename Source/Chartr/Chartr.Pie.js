/*
	Chartr.Pie.js
	
	A pie chart implementation to work with the Chartr library
		
	Credits
	-------
	Initial version by Ryan Mitchell (ryan@rtnetworks.net)
	Inspired by Plootr http://utils.softr.net/plootr/
	
	Copyright
	---------
 	Copyright 2009 Ryan Mitchell (ryan@rtnetworks.net)
	
*/

Chartr.Types.Pie = new Class({
							 
	Implements: [Options,Events],
	
	options: {
		colors: ['#cc0000','#00cc00','#0000cc','#ffcc00'],
		hovercolor: '#000000', // color on mouseover
		animate: true, // do we animate?
		animateperiod: 600 // over what period?
	},
	
	initialize: function(el,parent,options){
		this.el = el;
		this.parent = parent;
		this.setOptions(options);
		this.mousex = this.mousey = 0;
		this.data = {slices:[]};
		this.parent.addEvent('mousemove', function(){
			this.mousex = this.parent.mouse.x - this.centerx;
			this.mousey = this.centery - this.parent.mouse.y;	
			this.redraw();
		}.bind(this));
		this.parent.addEvent('mouseout',function(){
			this.redraw();	
			this.parent.hideTip();
		}.bind(this));
	},
	
	/*
	*	plot the data
	*/
	plot: function(data){
		// sum up our data
		var sum = 0;
		data.slices.each(function(s){
			sum += s[1];					  
		},this);
		// assign values to slices
		var angle = 0;
		data.slices.each(function(s){
			if(s[1] > 0){
				fraction = s[1]/sum;
				if(s.length == 2) s.push(null);
				s.push(2 * angle * Math.PI);
				s.push(2 * (angle+fraction) * Math.PI)
				angle += fraction;
			}
		},this);
		this.data = data;
		this.animatepercent = (this.options.animate) ? 0 : 100;
		this.plotData();
	},
	
	plotData: function(){
		
		this.fireEvent('beforeAxesDrawn',this.parent);
		
	    var cx = this.el.getContext('2d');
				
		// work out how much space we have
		this.area = {
			x:parseInt(this.el.getStyle('padding-left')) + 10,
			y:parseInt(this.el.getStyle('padding-top')) + 10,
			w:this.parent.area.w - parseInt(this.el.getStyle('padding-left')) - parseInt(this.el.getStyle('padding-right')) - 20,
			h:this.parent.area.h - parseInt(this.el.getStyle('padding-top')) - parseInt(this.el.getStyle('padding-bottom')) - 20
		};
		
		// work out where to put our pie
		this.centerx = this.area.x + (this.area.w * 0.5);
    	this.centery = this.area.y + (this.area.h * 0.5);
		this.radius = Math.min(this.area.w * 0.5, this.area.h * 0.5);
		
		this.fireEvent('axesDrawn',this.parent);
			
		this.fireEvent('beforeDataPlotted',this.parent);
				
	    var cx = this.el.getContext('2d');
		this.data.slices.each(function(s,i){
			
			if(s.length > 4){
						
				if(Math.abs(s[4] - s[3]) > 0.001){
					
					// work out if mouse is inside this one
					var mouseon = false;
					var div = this.mousex/this.mousey;
					var div2 = this.mousey/this.mousex;
					var startdeg = (s[3] * 180) / Math.PI;
					var enddeg = (s[4] * 180) / Math.PI;
					
					// needs to be inside the circle!
					if(Math.sqrt((this.mousex*this.mousex) + (this.mousey*this.mousey)) <= (this.radius)){
					
						// (1) if start,end < 90 or start,end > 270
						if((this.mousex > 0) && (this.mousey > 0)){
							if(((startdeg < 90) && (enddeg < 90)) || ((startdeg > 270) && (enddeg > 270))){
								if((Math.tan(s[3]) < div) && (Math.tan(s[4]) > div)){
									mouseon = true;
								}
							}
						}
						
						// (2) if start > 90 and end < 270
						if(this.mousey < 0){
							if((startdeg > 90) && (enddeg < 270) && (enddeg >= 90)){
								if((Math.tan(s[4]) < div) && (Math.tan(s[3]) > div)){
									mouseon = true;
								}
							}
						}
						
						// (3) if start < 90 and 90 < end < 270
						if((startdeg < 90) && (enddeg < 270) && (enddeg >= 90)){
							if(this.mousey < 0){
								if(Math.tan(s[4]) > div) mouseon = true;	
							} else {
								if(Math.tan(s[3]) < div) mouseon = true;		
							}
						}
						
						// (4) if 90 < start < 270 and end > 270
						if((startdeg >= 90) && (startdeg < 270) && (enddeg >= 270)){
							if(this.mousey < 0){
								if(Math.tan(s[3]) < div) mouseon = true;	
							} else {
								if(Math.tan(s[4]) > div) mouseon = true;	
							}
						}
						
						// (5) if 90 > start and end > 270
						if((startdeg < 90) && (enddeg >= 270)){
							if(this.mousex > 0){
								if(this.mousey > 0){
									if(Math.tan(s[3]) < div) mouseon = true;	
								} else {
									mouseon = true;
								}
							} else {
								if(this.mousey < 0){
									mouseon = true;	
								} else {
									if(Math.tan(s[4]) > div) mouseon = true;
								}
							}
						}
						
						// (6) if start > 270 and end > 270
						if((startdeg >= 270) && (enddeg >= 270)){
							if((this.mousex < 0) && (this.mousey > 0)){
								if(Math.tan(s[3]) < div) mouseon = true;
							}
						}
						
						// show tooltip
						if(mouseon){
							if(s[2] != null){
								this.parent.showTip(s[2]);
							}
						}
						
					}
					
					var diff = ((s[4] - s[3]) * (100-this.animatepercent)) / 100;
											
					cx.fillStyle = (mouseon) ? this.options.hovercolor : this.options.colors[i%this.options.colors.length];
					cx.beginPath();
					cx.moveTo(this.centerx, this.centery);
					cx.arc(this.centerx, this.centery, this.radius, 
							s[3] - Math.PI/2,
							s[4] - diff - Math.PI/2,
							false);
					cx.lineTo(this.centerx, this.centery);
					cx.closePath();
					cx.fill();
						
				}
			
			}
			
		},this);
		
		if(this.options.animate && (this.animatepercent < 100)){
			this.animatepercent += 4;
			this.redraw.delay(this.options.animateperiod/25,this,[false]);
		}	
			
		this.fireEvent('dataPlotted',this.parent);
	
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
	redraw: function(){
		var cx = this.el.getContext('2d');
		cx.clearRect(0,0,this.el.getSize().x,this.el.getSize().y);
		this.parent.cleanup();
		this.plotData();
	}
							 
});