var menu;
var elem,context;
var boss = {health:1,healthMax:9,state:"idle",heroHp:1,heroHpMax:4}
var battlescript
var currentscene=0;
function loadConfu(file,id){
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", "json/"+file+"?t="+ (new Date().getTime()), false);
	xhttp.send();
	elem = document.getElementById(id);
	if (xhttp.readyState == 4 && xhttp.status == 200)
	{
		try{
	battlescript = JSON.parse(xhttp.responseText);
		}catch(e)
		{
			battlescript = {
			meta:{bg:"blackboard",current:0,actor:"planet0", music:[]},
			scenes:[
			{
				events:[
				{	type:"question",
					time:1000,timepadding:0,
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
		elem.parentNode.innerHTML=xhttp.responseText
	}
	boss.health=battlescript.meta.bossmaxhp
	boss.healthMax=battlescript.meta.bossmaxhp
	boss.heroHp=battlescript.meta.heromaxhp
	boss.heroHpMax=battlescript.meta.heromaxhp


    context = elem.getContext('2d');
	context.mozImageSmoothingEnabled = true;
	context.webkitImageSmoothingEnabled = true;
	context.msImageSmoothingEnabled = true;
	context.imageSmoothingEnabled = true;
	if(elem == undefined)
	{
		console.log("no canvas")
	return;
	}
	console.log(battlescript.meta.music)
	//console.log(battlescript.meta.music[ Math.round(battlescript.meta.music.length*Math.random())])
	audio = new Audio('music/'+battlescript.meta.music[ Math.round((battlescript.meta.music.length-1)*Math.random())] );
	audio.loop = true;	
	
	addMouseListener(elem)
	
	window.requestAnimationFrame(renderConfu);
}

function clear(){
	context.fillStyle="grey";
	context.fillRect(0, 0, elem.width, elem.height);
	context.fill();
}

var audio
var start = null;
var change,changeEvt;

function renderConfu(timestamp){
	if (!start && mouse.isOver && mouse.target==elem){ start = timestamp; audio.play();}
	if(!start || !Assets.loaded) {window.requestAnimationFrame(renderConfu); return}
	var progress = Math.round(timestamp - start);
	clear();
	
	audio.volume = option.volume / 100;
	if(mouse.target==elem && mouse.isOver)
		audio.play()
	else
		audio.pause();
	//console.log(audio.volume)
	processEvent(progress);
	drawBackground(progress);
	drawConfutest(progress);
	
	if(renderData.type=="dialog"||renderData.type=="question")
		drawDialog("Confutius",renderData.text,renderData.time,renderData.progress,renderData.skipmode)

	//drawGUIBAck
	context.drawImage(Assets.img["GUIback"],0,elem.height-150);
	

		
	
	//drawButtons
	/*context.font = "16px Aclonica"
	context.textBaseline = "top";
	context.textAlign="left"; 
		
	for(var i=0;i<4;i++)
	{
		if(battlescript.scenes[currentscene].options[i]!= undefined){
		var req =  checkReq(battlescript.scenes[currentscene].options[i].req);		
		var color = battlescript.scenes[currentscene].options[i].color &&renderData.type=="question"? 
			req.enabled ? battlescript.scenes[currentscene].options[i].color.active : battlescript.scenes[currentscene].options[i].color.inactive 
			: req.enabled?"white":"gray";
		}	
		drawButtonBG(30,elem.height-140+35*i,640,30,req.enabled && renderData.progress>=renderData.time+i*150 && renderData.type=="question",select,i)
		
		if(renderData.progress>=renderData.time+i*150 && renderData.type=="question" && battlescript.scenes[currentscene].options[i]!= undefined)
		{
			context.fillStyle=color
			context.fillText( req.prefix + (req.enabled? (handleText(battlescript.scenes[currentscene].options[i].text)):"???"),35,elem.height-140+35*i+9)
		}		
	}
	context.fill();*/
	//drawButtons
	context.font = "16px Aclonica"
	context.textBaseline = "top";
	context.textAlign="left"; 

	var x = 0;
	for(var i=0;i<battlescript.scenes[currentscene].options.length;i++)
	{
		
		if(battlescript.scenes[currentscene].options[i]!= undefined){
		var req =  checkReq(battlescript.scenes[currentscene].options[i].req);	
		
		var color = battlescript.scenes[currentscene].options[i].color &&renderData.type=="question"? 
			req.enabled ? battlescript.scenes[currentscene].options[i].color.active : battlescript.scenes[currentscene].options[i].color.inactive 
			: req.enabled?"white":"gray";
			
		var height = battlescript.scenes[currentscene].options[i].height
		height=height?height:1;
		height=x+height>4?4-x:height;
		
		}	
		
		drawButtonBG(30,elem.height-140+35*x,640,30*height+5*(height-1),
		
		req.enabled && (renderData.progress>=renderData.time+x*150+600 || (renderData.skipmode>0 && renderData.progress-renderData.skipTime>200+x*150+600))
		&& renderData.type=="question" && battlescript.scenes[currentscene].options[i]!= undefined
		,select,i)
		
		if((renderData.progress>=renderData.time+x*150 || (renderData.skipmode>0 && renderData.progress-renderData.skipTime>200+x*150)) && renderData.type=="question" && battlescript.scenes[currentscene].options[i]!= undefined)
		{
			context.fillStyle=color
			context.wrapText( req.prefix + (req.enabled? (handleText(battlescript.scenes[currentscene].options[i].text)):"???"),35,elem.height-140+35*x+9,630,16)
		}	
		x+=height;		
	}
	for(;x<4;x++)
	{				
		drawButtonBG(30,elem.height-140+35*x,640,30,false)

	}
	context.fill();

	
	
	//todo: wrap name into this function
	drawHPBar((elem.width-(2*28+boss.healthMax*67-4))/2,20,boss.health,boss.healthMax,progress);
	
	context.fillStyle="white"
	context.font = "16px Aclonica"
	context.textBaseline = "top";
	context.textAlign="center"; 
	context.fillText("Confutest lv.999",elem.width/2,30)
	
	drawHPBar((elem.width-(2*28+boss.heroHpMax*67-4))/2,elem.height-180,boss.heroHp,boss.heroHpMax,progress);
	context.fillStyle="white"
	context.font = "16px Aclonica"
	context.textBaseline = "top";
	context.textAlign="center"; 
	context.fillText(handleText("[playerName] lv.[playerLvl]"),elem.width/2,elem.height-170)
	context.fill();
	
	if(renderData.type=="showBoss")
	{
		context.fillStyle="rgba(255,255,255,"+(1-(renderData.progress/renderData.time))+")"
		context.fillRect(0, 0, elem.width, elem.height);
		context.fill();
	}
	
	if(renderData.type=="hideBoss")
	{
		context.fillStyle="rgba(255,255,255,"+(renderData.progress/renderData.time)+")"
		context.fillRect(0, 0, elem.width, elem.height);
		context.fill();
		
		if(renderData.progress/renderData.time>0.9)
		{
		audio.loop=false;
		audio.currentTime=audio.duration
		audio.pause()
		audio.muted=true;
		}
	}
	if(renderData.type=="unlockAch")
	unlockAchievment(renderData.ach);

	window.requestAnimationFrame(renderConfu);
	
}
var currentEvt=0;
var EntTime=null;
var renderData = {type:"none",progress:0,time:0,skipmode:0,override:false}
function processEvent(progress){

	if(!EntTime){EntTime=progress}
	
	if(boss.health<=0 && currentscene!=1)
	change= 1;
	if( boss.heroHp<=0 && currentscene!=2)
	change= 2;	
	

	//anti break
	if(currentEvt>=battlescript.scenes[currentscene].events.length)
	return;
	
	var evt =battlescript.scenes[currentscene].events[currentEvt]
	var isOver = progress-EntTime>evt.time && !(change>=0) 
	
	if(evt.type =="dialog")
	{
		isOver = progress-EntTime>(evt.time-evt.timepadding)/option.speed + evt.timepadding*option.wait && option.autoskip
	}
		
	//skip to next
	if((isOver && !renderData.override || (renderData.skipmode==2 && (evt.type =="dialog")) ) || !checkReq(evt.req).enabled)
	{
		if(renderData.skipmode==2){renderData.skipmode=0}
	change = currentscene
	changeEvt=currentEvt+1;

	}
	//backskip
	if(renderData.skipmode==-1)
	{
		change=0;
		boss.health=battlescript.meta.bossmaxhp
		boss.healthMax=battlescript.meta.bossmaxhp
		boss.heroHp=battlescript.meta.heromaxhp
		boss.heroHpMax=battlescript.meta.heromaxhp
		audio.loop=false;
		audio.currentTime=audio.duration
		audio.pause();
		audio = new Audio('music/'+battlescript.meta.music[ Math.round((battlescript.meta.music.length-1)*Math.random())] );
		audio.loop = true;	
		audio.play();
	}
	
	//general change
	if(change>=0)
	{
		currentscene= change>=0? change :currentscene;
		if(change>=0){change=-1}
		
		EntTime=null
		currentEvt= changeEvt>=0? changeEvt: 0;
		if(changeEvt>=0){changeEvt=-1}
		renderData = {type:"none",progress:0,skipmode:0,time:0,override:false}
		return;
	}
	
	switch(evt.type)
	{
		case "showBoss":
			renderData.type="showBoss"
			renderData.progress=progress-EntTime;
			renderData.time=evt.time
		break;
		
		case "hideBoss":
			renderData.type="hideBoss"
			renderData.progress=progress-EntTime;
			renderData.time=evt.time
			renderData.override=true
		break;
		
		case "change":
			change=evt.target;
			changeEvt=0;
		break;
		case "pause":
		break;
		
		case "audio":
			renderData.type="audio";
			renderData.command=evt.command;
		break;
		
		case "dialog":
			renderData.type="dialog"
			renderData.progress=progress-EntTime;
			renderData.time=(evt.time-evt.timepadding)/option.speed
			renderData.timepadding=evt.timepadding*option.wait
			renderData.text=handleText(evt.text)
			renderData.color=evt.color
			renderData.override=progress-EntTime<(evt.time-evt.timepadding)/option.speed+evt.timepadding*option.wait
			if(renderData.progress>=renderData.time)
				renderData.skipmode=1;
		break;
		
		case "question":
			renderData.type="question"
			renderData.progress=progress-EntTime;
			renderData.time=evt.time*option.speed
			renderData.arm=evt.arm
			renderData.text=handleText(evt.text)
			renderData.color=evt.color
			renderData.override=true
			if(renderData.progress>=renderData.time)
				renderData.skipmode=1;
		break;
		
		case "unlockAch":
			renderData.type="unlockAch"
			renderData.progress=progress-EntTime;
			renderData.time=4200;
			renderData.ach= evt.ach;
			if(player.achievements.indexOf(evt.ach)>=0 && renderData.progress==0)
				EntTime-=(4200-(progress-EntTime))
		break;
	}
}

function drawHPBar(x,y,current,max,progress){
	context.fillStyle="rgb("+Math.round(205+(Math.sin(progress/2000)*40))+",0,0)"
	context.fillRect(x+29,y+8,current*67,16)	
	context.fill()
	
	context.drawImage(Assets.img["GUIhpBar"],
		0, 0,
		30,Assets.img["GUIhpBar"].height,		
		x,y,		
		30,Assets.img["GUIhpBar"].height);
	for(var i=0;i<max-1;i++){	
	context.drawImage(Assets.img["GUIhpBar"],
		30, 0,
		68,Assets.img["GUIhpBar"].height,		
		x+30+i*68,y,		
		68,Assets.img["GUIhpBar"].height);
	}
	context.drawImage(Assets.img["GUIhpBar"],
		Assets.img["GUIhpBar"].width-89, 0,
		89,Assets.img["GUIhpBar"].height,		
		x+30+(max-1)*68,y,		
		89,Assets.img["GUIhpBar"].height);
}
function drawBackground(progress){
	

    context.drawImage(Assets.img["background-parallax"],		
		0,0,		
		elem.width,Assets.img["background-parallax"].height/Assets.img["background-parallax"].width*elem.width);
		
	context.drawImage(Assets.img["stars-parallax"],	
		-(progress/45)%elem.width,0,		
		elem.width,Assets.img["background-parallax"].height/Assets.img["background-parallax"].width*elem.width);	
	context.drawImage(Assets.img["stars-parallax"],	
		-(progress/45)%elem.width+elem.width,0,		
		elem.width,Assets.img["background-parallax"].height/Assets.img["background-parallax"].width*elem.width);	
	
	context.drawImage(Assets.img["planets-parallax"],	
		-(progress/33)%elem.width,0,		
		elem.width,Assets.img["background-parallax"].height/Assets.img["background-parallax"].width*elem.width);	
	context.drawImage(Assets.img["planets-parallax"],	
		-(progress/33)%elem.width+elem.width,0,		
		elem.width,Assets.img["background-parallax"].height/Assets.img["background-parallax"].width*elem.width);	

	if(!showplanet)
		{
		showplanet=Math.random()*10000<20;
		scale = Math.random()*2+2;
		position = Math.random();
		variant = Math.round(Math.random()*3)
		}
		
		if(showplanet)
		drawplanet(progress,Assets.img["background-parallax"].height/Assets.img["background-parallax"].width*elem.width)
}

function drawConfutest(progress){
	var frame = Math.floor(progress/90);
	var i = Math.abs(Math.round(Math.sin(frame/16)*9))
	
    context.drawImage(Assets.img["confu"],
		(frame%4)*Assets.img["confu"].width/4, (Math.floor(frame/4)%2)*Assets.img["confu"].height/2,
		Assets.img["confu"].width/4,Assets.img["confu"].height/2,		
		(elem.width-(Assets.img["confu"].width/3))/2+Math.cos(progress/290)*4,50+Math.sin(progress/500)*15,		
		Assets.img["confu"].width/3,Assets.img["confu"].height/3*2);
	
	
		context.drawImage(Assets.img["book"],
		(elem.width-(Assets.img["confu"].width/2))+70+Math.cos(progress/270)*9,150-Math.sin(progress/300)*8,
		68,68);
	if(renderData.type=="question")
	{
		switch(renderData.arm){
			case "sword":
				if(renderData.progress<=1000){
				
					context.setTransform(renderData.progress/1000, 0, 0, renderData.progress/1000, elem.width/2-100*(renderData.progress/1000),105+75*(renderData.progress/1000)+15*Math.sin(renderData.progress/250) );
					
					context.drawImage(Assets.img["sword"],
						-43,-43,
					86,86);
					context.setTransform(1, 0, 0, 1, 0, 0);
				}
				else if(renderData.progress<=1500){
				
					context.setTransform(1, 0, 0, 1, elem.width/2-100,180+15*Math.sin(renderData.progress/250) );
					
					context.drawImage(Assets.img["sword"],
						-43,-43,
					86,86);
					context.setTransform(1, 0, 0, 1, 0, 0);
				}
				else if(renderData.progress<=2500){
				
					context.setTransform(1, 0, 0, 1, elem.width/2-100,180+15*Math.sin(renderData.progress/250) );
					
					context.rotate((Math.PI*135/180+Math.atan((elem.height-150-180)/100))*(renderData.progress-1500)/1000);
					context.drawImage(Assets.img["sword"],
						-43,-43,
					86,86);
					context.setTransform(1, 0, 0, 1, 0, 0);
				}
				else if(renderData.progress<=3500){
				
					context.setTransform(1, 0, 0, 1, elem.width/2-100+100*(renderData.progress-2500)/1000,180 -150*(renderData.progress-2500)/1000+15*Math.sin(renderData.progress/250) );
					
					context.rotate((Math.PI*135/180)+Math.atan((elem.height-150-180+150*(renderData.progress-2500)/1000)/(100-100*(renderData.progress-2500)/1000)));
					context.drawImage(Assets.img["sword"],
						-43,-43,
					86,86);
					context.setTransform(1, 0, 0, 1, 0, 0);
				}
				else if(renderData.progress<=4000){
				
					context.setTransform(1, 0, 0, 1, elem.width/2,30+15*Math.sin(renderData.progress/250) );
					
					context.rotate((Math.PI*225/180));
					context.drawImage(Assets.img["sword"],
						-43,-43,
					86,86);
					context.setTransform(1, 0, 0, 1, 0, 0);
				}
				else if(renderData.progress<=5000){
				
					for(var i=-2;i<=2;i++){
					context.setTransform(1, 0, 0, 1, 0, 0);
					
					context.setTransform(1, 0, 0, 1, elem.width/2,elem.height-150 );
					context.rotate((Math.PI*20*i/180)*(renderData.progress-4000)/1000);
					context.translate(0 , -elem.height+150+30+15*Math.sin(renderData.progress/250));
					context.rotate((Math.PI*225/180));
					context.drawImage(Assets.img["sword"],
						-43,-43,
					86,86);
					}
					context.setTransform(1, 0, 0, 1, 0, 0);
				}
				else if(renderData.progress<=5500){
				
					for(var i=-2;i<=2;i++){
					context.setTransform(1, 0, 0, 1, 0, 0);
					
					context.setTransform(1, 0, 0, 1, elem.width/2,elem.height-150 );
					context.rotate((Math.PI*20*i/180));
					context.translate(0 , -elem.height+150+30+15*Math.sin(renderData.progress/250));
					context.rotate((Math.PI*225/180));
					context.drawImage(Assets.img["sword"],
						-43,-43,
					86,86);
					}
					context.setTransform(1, 0, 0, 1, 0, 0);
				}
				else{
				
					for(var i=-2;i<=2;i++){
					context.setTransform(1, 0, 0, 1, 0, 0);
					
					context.setTransform(1, 0, 0, 1, elem.width/2,elem.height-150 );
					context.rotate((Math.PI*20*i/180));
					context.translate(0 , (-elem.height+150+30)-(-elem.height+150+30)*(renderData.progress-5500)/500);
					context.rotate((Math.PI*225/180));
					context.drawImage(Assets.img["sword"],
						-43,-43,
					86,86);
					}
					context.setTransform(1, 0, 0, 1, 0, 0);
				}
			break;
			
			case "book":
				if(renderData.progress<=1000){
				
				context.setTransform(renderData.progress/1000, 0, 0, renderData.progress/1000, (elem.width-(Assets.img["confu"].width/2))+70+Math.cos(progress/270)*9+34,150-Math.sin(progress/300)*8+34-(100/1000*renderData.progress));
				context.rotate(2*Math.PI*progress/3000);
				context.drawImage(Assets.img["magicbolt"],
					-34,-34,
				68,68);
				context.setTransform(1, 0, 0, 1, 0, 0);
				}
				else if(renderData.progress<=1500){
				
				context.setTransform(1, 0, 0, 1, (elem.width-(Assets.img["confu"].width/2))+70+34,84);
				context.rotate(2*Math.PI*progress /2000);
				context.drawImage(Assets.img["magicbolt"], 
					-34,-34,
				68,68);
				context.setTransform(1, 0, 0, 1, 0, 0);
				}
				else{
				
				context.setTransform(1, 0, 0, 1, (elem.width-(Assets.img["confu"].width/2))+70+34-(104/700*(renderData.progress-1500)),84+(((elem.height-170-84))/700)*(renderData.progress-1500));
				context.rotate(2*Math.PI*progress/1500);
				context.drawImage(Assets.img["magicbolt"],
					-34,-34,
				68,68);
				context.setTransform(1, 0, 0, 1, 0, 0);
				}
			break;
		}

	}
}
function select(id){
		if(battlescript.scenes[currentscene].options[id].consequence != undefined)
		{
			if(battlescript.scenes[currentscene].options[id].consequence.bosshp)
			boss.health += battlescript.scenes[currentscene].options[id].consequence.bosshp
			if(battlescript.scenes[currentscene].options[id].consequence.herohp)
			boss.heroHp += battlescript.scenes[currentscene].options[id].consequence.herohp
			mouse.buttons = 0;
		}
	change=battlescript.scenes[currentscene].options[id].target
}



var showplanet = false;
var planetshown = null;
var scale  = 1;
var position =0;
var variant =1;
function drawplanet(progress,hei){
	var traveltime = (17000/scale);

	if (!planetshown) planetshown = progress;
	
	if(planetshown+traveltime<=progress)
	{
		planetshown=null;
		showplanet=false;
		return
	}
	context.drawImage(	Assets.img["planet"+variant],
	
		-((progress-planetshown)/traveltime)*(elem.width+Assets.img["planet"+variant].width*scale)+elem.width,position*(hei-Assets.img["planet"+variant].width*scale),		
			Assets.img["planet"+variant].width*scale,
			Assets.img["planet"+variant].height*scale);	
}

		