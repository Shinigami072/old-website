
var BG,Actor
var script
var context
var elem
function loadWindow(file,id){
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", "json/"+file+"?t="+ (new Date().getTime()), false);
	xhttp.send();
		elem = document.getElementById(id);

	if (xhttp.readyState == 4 && xhttp.status == 200)
	{
		try{
			script = JSON.parse(xhttp.responseText);
		}catch(e)
		{
			script = {
			meta:{bg:"blackboard",current:0,actor:"planet0"},
			scenes:[
			{
				events:[
				{	type:"question",
					name:"I AM JSON ERROR",time:1000,timepadding:0,
					text:"You Dun guffed.File is broken."
				}],
				options:[{target:0,text:"HTTP STATUS: "+xhttp.status+"HTTP readystate"+xhttp.readyState},
				{target:0,text:"Error: "+e,height:3}]
			}
			]
			}
		}
	}
	else
	{
		var wnd = window.open("about:blank", "", "_blank");
		wnd.document.write(xhttp.responseText);
		script = {
			meta:{bg:"blackboard",current:0,actor:"planet0"},
			scenes:[
			{
				events:[
				{	type:"question",
					name:"I AM XHHTP ERROR",time:1000,timepadding:0,
					text:"You Dun guffed.File is lost?"
				}],
				options:[{target:0,text:"HTTP STATUS: "+xhttp.status+" HTTP readystate"+xhttp.readyState},
				{target:0,text:"HTTP response:"+xhttp.status==404?"File Not Found":xhttp.status>=500?"Server Error":"I Dunno",height:3}]
			}
			]
			}
	}
	
	BG=script.meta.bg
	Actor=script.meta.actor;
	currentscene=script.meta.current;
    context = elem.getContext('2d');
	context.mozImageSmoothingEnabled = false;
	context.webkitImageSmoothingEnabled = false;
	context.msImageSmoothingEnabled = false;
	context.imageSmoothingEnabled = false;
	if(elem == undefined)
	{
		console.log("no canvas")
	return;
	}
	
	addMouseListener(elem)
	renderWindow(0)
	window.requestAnimationFrame(renderWindow);
}
function clear(){
	context.fillStyle="grey";
	context.fillRect(0, 0, elem.width, elem.height);
	context.fill();
}

var currentscene;
var change = -1;
var currentEvt=0;
var EntTime=null;
var renderData = {type:"none",progress:0,time:0,override:false}
function processEvent(progress){
	if(!EntTime){EntTime=progress}
		
	if(change>=0)
	{

		currentscene= change>=0? change :currentscene;
		if(change>=0){change=-1}
		
		EntTime=null
		currentEvt= 0
		renderData = {type:"none",progress:0,time:0,override:false}
		return;
	}
	
	if(currentEvt>=script.scenes[currentscene].events.length)
	return;
	
	var evt =script.scenes[currentscene].events[currentEvt]
	var isOver = progress-EntTime>evt.time
	if(evt.type =="dialog")
	{
		isOver = progress-EntTime>(evt.time-evt.timepadding)*option.speed+evt.timepadding
	}
	if(isOver && !renderData.override || !checkReq(currentEvt.req))
	{
	currentEvt++
	EntTime=null
	renderData = {type:"none",progress:0,time:0,override:false}
	return;
	}
	switch(evt.type)
	{			
		case "change":
			change=evt.target;
		break;	
		case "dialog":
			renderData.type="dialog"
			renderData.name=handleText(evt.name);
			renderData.progress=progress-EntTime;
			renderData.text=handleText(evt.text)
			renderData.time=(evt.time-evt.timepadding)*option.speed
			renderData.timepadding=evt.timepadding
			renderData.color=evt.color
			renderData.override=progress-EntTime<(evt.time-evt.timepadding)*option.speed+evt.timepadding
		break;
		case "give":
			renderData.type="give"
			renderData.item=evt.item
			renderData.progress=progress-EntTime;
			renderData.time=evt.time
			addItem(renderData.item);
		break;
		case "question":
			renderData.type="question"
			renderData.name=handleText(evt.name);
			renderData.progress=progress-EntTime;
			renderData.text=handleText(evt.text)
			renderData.time=evt.time
			renderData.color=evt.color
			renderData.override=true
		break;
		
		case "changeActor":
			renderData.type="changeActor"
			renderData.progress=progress-EntTime;
			renderData.time=evt.time
			Actor=evt.actor
		break;
	}
	
}

var startWin = null
function renderWindow(timestamp){
	if(!Assets.loaded){window.requestAnimationFrame(renderWindow);return}
	if (!startWin && mouse.isOver && mouse.target==elem){ startWin = timestamp;}
	//if(!startWin) {window.requestAnimationFrame(renderWindow); return}
	var progress = Math.round(timestamp - startWin);
	clear();
	if(startWin)
	processEvent(progress);
	//draw BG
	context.drawImage(Assets.img[BG],		
		0,0,		
		elem.width,Assets.img[BG].height/Assets.img[BG].width*elem.width);
	//draw personalbar
	context.drawImage(Assets.img[Actor],(elem.width-Assets.img[Actor].width)/2,10);
	
	if(renderData.type=="dialog"||renderData.type=="question"){
	drawDialog(renderData.name,renderData.text,renderData.time,renderData.progress)

	}
	
	
	
	if(renderData.type=="give"){
		if(renderData.progress<1000)
		context.drawImage(Assets.img["GUIclosedchest"],elem.width-68-20,renderData.progress/1000*68-68);
		else if(renderData.progress<3000){
		context.drawImage(Assets.img["GUIopenchest"],elem.width-68-20,0);

		var scale = Math.sin((renderData.progress-1000)/750)
		context.drawImage(Assets.img[Assets.items[renderData.item].icon],
		elem.width/2-34*scale + ((renderData.progress-1000)/2000*(elem.width/2-68)), 34-34*scale+(elem.height-150)-((renderData.progress-1000)/2000*elem.height-150),
		68*scale,68*scale);
		}
		else if(renderData.progress<4500)
		context.drawImage(Assets.img["GUIclosedchest"],elem.width-68-20,-((renderData.progress-3000)/1500*68));

	}
	
	
	//drawGUIBack
	context.drawImage(Assets.img["GUIback"],0,elem.height-150);

	//drawButtons
	context.font = "16px Aclonica"
	context.textBaseline = "top";
	context.textAlign="left"; 
	
	var x = 0;
	for(var i=0;i<script.scenes[currentscene].options.length;i++)
	{
		
		if(script.scenes[currentscene].options[i]!= undefined){
		var req =  checkReq(script.scenes[currentscene].options[i].req);	
		
		var color = script.scenes[currentscene].options[i].color &&renderData.type=="question"? 
			req.enabled ? script.scenes[currentscene].options[i].color.active : script.scenes[currentscene].options[i].color.inactive 
			: req.enabled?"white":"gray";
			
		var height = script.scenes[currentscene].options[i].height
		height=height?height:1;
		height=x+height>4?4-x:height;
		
		}	
		
		drawButtonBG(30,elem.height-140+35*x,640,30*height+5*(height-1),req.enabled && renderData.progress>=renderData.time+x*150 && renderData.type=="question" &&i<script.scenes[currentscene].options.length,choice,i)
		
		if(renderData.progress>=renderData.time+x*150 && renderData.type=="question" && script.scenes[currentscene].options[i]!= undefined)
		{
			context.fillStyle=color
			context.wrapText( req.prefix + (req.enabled? (handleText(script.scenes[currentscene].options[i].text)):"???"),35,elem.height-140+35*x+9,630,16)
		}	
		x+=height;		
	}
	for(;x<4;x++)
	{				
		drawButtonBG(30,elem.height-140+35*x,640,30,false)				
	}
	context.fill();
	
	window.requestAnimationFrame(renderWindow);
}


function choice(id){
	change=script.scenes[currentscene].options[id].target
}