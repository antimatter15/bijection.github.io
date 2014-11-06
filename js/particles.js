var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
	ctx.globalCompositeOperation = "source-under";
var bg = document.getElementById("bg");
var bgctx = bg.getContext("2d");
var controls = document.getElementById("controls")

var lines = true;
var pichurs = false;
var dots = true;
var opa = 1;
console.log(opa)
var lw = 0;
var lh = 0;
var W = 1900; var H = 700;

var xgrav = .0;
var ygrav = .0;

var visc = .05;
var push = 25;//21
var pull = 25;//24
var mult = 0.000042//.002;
var bounce = .1;
var dist = push+pull;//console.log(dist);
var fric = 1;
var rad = 4;
var wfric = .5;

var nump = 200;

var mouseX, mouseY;
var times = 0;
var avgtime = 0;

var rdist = 50;
var rectdist = rdist;

var particles = [];
var connections = [];
var drag = [];

// var lol = new Image();
// lol.src = "nogap.png";//ctx.getImageData(0,0,1,1);

//canvas.width = W; 
//canvas.height = H;

function create_particle()
{
	this.x = Math.random()*(W-rectdist)+rectdist/2;
	this.y = Math.random()*(H-rectdist)+rectdist/2;

	this.c = 1;
	this.c1= 1;
	
	this.vx = 0;
	this.vy = 0;
	this.ax = 0;
	this.ay = 0;
	this.mass = Math.random()*2-1
	
	var imj = ctx.getImageData(this.x-rectdist/2,this.y-rectdist/2,rectdist,rectdist);
	var data = imj.data;
	var width = imj.width;
	var height = imj.height;

	for(var y = 0; y < height-1; y++) {
	// loop through each column
		for(var x = 0; x < width-1; x++) {
			var d = Math.sqrt((x-width/2)*(x-width/2)+(y-height/2)*(y-height/2));
			var r = rectdist/2-5;
			if(d>r)
			{
				data[(height * 4 * y) + (x * 4) + 3] = 0;
			}
		}
	}
	imj.data = data;

	bg.width = width;
	bg.height = height;
	bgctx.putImageData(imj,0,0,0,0,width-1,height-1)
	//console.log(im)
	//ctx.putImageData(imj,0,0);
	var image = new Image(width, height);
	image.src = bg.toDataURL();

	console.log(image.width,image.height)
	this.im = image;

	this.color = "rgba(0,0,0,1)";
	
	this.radius = 4;
}

function connection(p1,p2,dx,dy,dvx,dvy,dot,f,d) {
	this.p1=p1;
	this.p2=p2;
	this.dx=dx;
	this.dy=dy;
	this.dvx=dvx;
	this.dvy=dvy; 
	this.dot=dot;
	this.f=f;
	this.d=d;
}


function getWidth() {
    if (self.innerWidth) {
       return self.innerWidth;
    }
    if (document.documentElement && document.documentElement.clientHeight){
        return document.documentElement.clientWidth;
    }
    if (document.body) {
        return document.body.clientWidth;
    }
    return 0;
}

function getHeight() {
    if (self.innerWidth) {
       return self.innerHeight;
    }
    if (document.documentElement && document.documentElement.clientHeight){
        return document.documentElement.clientHeight;
    }
    if (document.body) {
        return document.body.clientHeight;
    }
    return 0;
}


function calc(){
	W=getWidth()+2;
	H=getHeight();
	addvels();
	connections = [];
	for(var t = 0; t < particles.length; t++){
		var p = particles[t];	
		/*var v = Math.sqrt(p.vx*p.vx+p.vy*p.vy);
		if(v>dist/2){
			p.vx*=dist/(2*v);
			p.vy*=dist/(2*v);
		}//*/	
		for(var k = t+1; k < particles.length; k++)
		{
			var j = particles[k];
			var dx = (p.x-j.x);
			//var dx=Math.min(ddx,(W-ddx));
			var dy = (p.y-j.y);
			//dy=Math.min(dy,(H-dy));
			//var d = Math.sqrt(dx*dx+dy*dy);
			var d = Math.sqrt(dx*dx+dy*dy);
			if(d<dist){
				p.c+=1/(d*d*d*d+10);
				j.c+=1/(d*d*d*d+10);
				/*if (d<p.radius) {
					p.vx*=0.1;
					p.vy*=0.1;
					j.vx*=0.1;
					j.vy*=0.1;
				};//*/
				var dvx = p.vx-j.vx;
				var dvy = p.vy-j.vy;
				var dot = (dx*dvx+dy*dvy)/d;
				var f=mult*(dist-d)*(push-d)/d;
				connections.push(new connection(p,j,dx,dy,dvx,dvy,dot,f,d));
				/*var fx=dx*f+visc*(dvx-dot*dx)/(d*d);
				var fy=dy*f+visc*(dvy-dot*dy)/(d*d);
				p.vx+=fx;
				p.vy+=fy;
				j.vx-=fx;
				j.vy-=fy;//*/
			}
		}		
		/*if(p.x < p.radius) {p.x=2*p.radius-p.x; p.vx *= -1;}
		if(p.y < p.radius) {p.y=2*p.radius-p.y; p.vy *= -1;}
		if(p.x > W-p.radius) {p.x-=1.1*(p.x-(H-p.radius)); p.vx *= -1;}
		if(p.y > H-p.radius) {p.y-=1.1*(p.y-(H-p.radius)); p.vy *= -1;}//*/
	}
	//setTimeout("calc()",0);
}

function addvels() {
	for(var i = 0; i < connections.length; i++)
	{
		var m=connections[i];
		var p1 = m.p1;
		var p2 = m.p2;
		var fx=m.dx*m.f;
		var fy=m.dy*m.f;
		p1.ax+=(fx*p2.c+visc*(m.dvx-m.dot*m.dx)/(m.d))/p1.c;
		p1.ay+=(fy*p2.c+visc*(m.dvy-m.dot*m.dy)/(m.d))/p1.c;
		p2.ax-=(fx*p1.c+visc*(m.dvx-m.dot*m.dx)/(m.d))/p2.c;
		p2.ay-=(fy*p1.c+visc*(m.dvy-m.dot*m.dy)/(m.d))/p2.c;
	}//*/
	for(var i = 0; i < drag.length; i++){
		var m=drag[i];
		var d = (mouseX-m.x)*(mouseX-m.x)+(mouseY-m.y)*(mouseY-m.y);
		m.ax+=.5*(mouseX-m.x)/(1000*m.c);
		m.ay+=.5*(mouseY-m.y)/(1000*m.c);
	}
	for(var i = 0; i<particles.length; i++){
		var p=particles[i];
		p.c1=p.c-1;
		p.c=1;
		p.vx+=p.ax;
		p.vy+=p.ay;
		p.ax=0;
		p.ay=0;
		p.vx*=fric;
		p.vy*=fric;
		p.vy+=ygrav*p.mass;
		p.vx+=xgrav*p.mass;
		p.x += p.vx;
		p.y += p.vy;
		//if(p.x < 0) {p.x+=W;}
		//else if(p.x > W) {p.x=0;}
		//if(p.y < 0) {p.y=H;}
		//else if(p.y > H) {p.y=0;}
		if(p.x < p.radius) {p.x+=1.1*(p.radius-p.x); p.vx *= -bounce; p.vy *= wfric}
		else if(p.x > W-p.radius) {p.x-=1.1*(p.x-(W-p.radius)); p.vx *= -bounce; p.vy *= wfric}
		if(p.y < p.radius) {p.y+=1.1*(p.radius-p.y); p.vy *= -bounce; p.vx *= wfric}
		else if(p.y > H-p.radius) {p.y-=1.1*(p.y-(H-p.radius)); p.vy *= -bounce; p.vx *= wfric}//*/
	}
}

//var img=document.getElementById("pic");
//img.crossOrigin = '';
//ctx.drawImage(img,10,10);


var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
window.requestAnimationFrame = requestAnimationFrame;

var v;

function init() {
  v = document.getElementById('v');
  navigator.webkitGetUserMedia({video:true}, callbackStreamIsReady, function(){console.log('err')});
}

function callbackStreamIsReady(stream) {
  v.src = URL.createObjectURL(stream);
  v.play();
  console.log("wolo")
}



function draw()
{	
	
	//console.log(pic);
	if(lw != W || lh != H){
		canvas.width = W; 
		canvas.height = H;
		lw=W;
		lh=H;
		//console.log(lw+W+lh+H)
	}
//	ctx.fillStyle = "rgba(255, 0, 255, 1)";
	//ctx.drawImage(lol,0,0,W,H);
	//ctx.fillRect(0, 0, W, H);
	//ctx.drawImage(pic,200,400);
//	console.log(pic);
	ctx.fillStyle = "rgba(255, 255, 255, "+opa+")";
	ctx.fillRect(0, 0, W, H);
	if(pichurs){
		for(var t = 0; t < particles.length; t++)
		{
			var p = particles[t];
			//pic = ctx.getImageData(0,0,50,50);
			ctx.drawImage(p.im,p.x-rectdist/2,p.y-rectdist/2);
	//		ctx.beginPath();
	//		ctx.fillStyle = "black";
	//		ctx.moveTo(p.x, p.y);
	//		ctx.arc(p.x, p.y, p.radius, Math.PI*2, false);
	//		//console.log(p.c1);
	//		ctx.fill();
		}
	}
	if(dots){
		for(var t = 0; t < particles.length; t++){
			var p = particles[t];
			ctx.fillStyle = "black";
			ctx.moveTo(p.x, p.y);
			ctx.beginPath();
			ctx.arc(p.x, p.y, p.radius, Math.PI*2, false);
			ctx.fill();
		}
	}
	if(lines){
		for(var t = 0; t < connections.length; t++)
		{
			m=connections[t];
			var p = m.p1;
			var j = m.p2;
			ctx.strokeStyle = "black";
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(j.x, j.y);
			ctx.stroke();
		}//*/
	}
}

function calc1(){
	console.time('calc timer');
	calc();
	console.timeEnd('calc timer');
}

setInterval(calc, 5);
//calc();
setInterval(draw, 1000/30);


setTimeout("reset()",100);
// setTimeout('$( "#controls" ).toggle( "drop" , {}, 500 );',100);



function reset(){
	rectdist = rdist;
	ctx.drawImage(v,0,0,W,H);
	particles=[];
	for(var i = 0; i < nump; i++)
	{
		particles.push(new create_particle());
	}	
}


canvas.addEventListener("mousedown", startdrag, false);
canvas.addEventListener("mouseup", enddrag, false);
canvas.addEventListener("mousemove", mouseMove, false);

document.addEventListener("keypress", showcont, false);

function showcont(e){
	if (e.keyCode == 111){
		controls.toggle( "drop" , {}, 500 );
	}
}


function mouseMove(e)
{
    if(e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if(e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }
}


function startdrag(event)
{
  var x = event.x;
  var y = event.y;
  getdots([x,y], 200);
  //console.log(drag);

}

function enddrag(event)
{
	drag=[];
}

function getdots(p,r){
	drag = [];
	for(var k = 0; k < particles.length; k++)
	{
		var j = particles[k];
		var dx = (p[0]-j.x);
		var dy = (p[1]-j.y);
		var d = Math.sqrt(dx*dx+dy*dy);
		if(d<r){
			drag.push(j);
		}
	}
}
