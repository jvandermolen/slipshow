let myQueryAll = (root, selector, avoid) => {
    avoid = avoid || ".slip";
    if (!root.id)
	root.id = '_' + Math.random().toString(36).substr(2, 15);;
    let allElem = Array.from(root.querySelectorAll(selector));
    let other = Array.from(root.querySelectorAll("#"+root.id+" " + avoid + " " +selector));
    return allElem.filter(value => !other.includes(value));
};

function cloneNoSubslip (elem) {
    let newElem = elem.cloneNode(false);
    elem.childNodes.forEach((child) => {
	if(child.classList && child.classList.contains("slip")){
	    let placeholder = document.createElement(child.tagName);
	    placeholder.classList.add("toReplace");
	    newElem.appendChild(placeholder);
	}
	else
	    newElem.appendChild(cloneNoSubslip(child));
    });
    return newElem;
}
function replaceSubslips(clone, subslips) {
    let placeholders = myQueryAll(clone, ".toReplace");
    subslips.forEach((subslip, index) => {
	placeholders[index].replaceWith(subslip);
    });
}



let Engine = function(root) {

    function prepareRoot (rootElem) {
	let container = document.createElement("div");
	container.innerHTML = 
	    '	<div id="open-window">\
	    <div class="format-container">\
	    <div class="rotate-container">\
		<div class="scale-container">\
		    <div class="universe movable" id="universe">\
			<div width="10000" height="10000" class="fog"></div>\
                        <div class="placeHolder"></div>\
		    </div>\
		</div>\
		</div>\
	    </div>\
	</div>\
	<div class="cpt-slip">0</div>\
	<div class="toc-slip" style="display:none;"></div>';
	rootElem.replaceWith(container);
	container.querySelector(".placeHolder").replaceWith(rootElem);
	rootElem.querySelectorAll(".slip").forEach((slipElem) => {
	    setTimeout(() => {
		var scaleContainer = document.createElement('div');
		var slipContainer = document.createElement('div');
		scaleContainer.classList.add("slip-scale-container");
		slipContainer.classList.add("slip-container");
		let fChild;
		while((fChild = slipElem.firstChild)) {
		    slipContainer.appendChild(fChild);
		}
		scaleContainer.appendChild(slipContainer);
		slipElem.appendChild(scaleContainer);
	    },0);
	});
	rootElem.style.width = "unset";
	rootElem.style.height = "unset";
	document.querySelectorAll(".background-canvas").forEach((elem)=> {elem.addEventListener("click", (ev) => { console.log("vous avez cliquez aux coordonnées : ", ev.layerX, ev.layerY); });});	
    }
    prepareRoot(root);

    // Constants
    document.body.style.cursor = "auto";
    let timeOutIds = [];
    document.body.addEventListener("mousemove", (ev) => {
	timeOutIds.forEach((id) => { clearTimeout(id); });
	document.body.style.cursor = "auto";
	timeOutIds.push(setTimeout(() => { document.body.style.cursor = "none";}, 5000));
    });
    let openWindow = document.querySelector("#open-window");
    let universe = document.querySelector("#universe");
    let slips = universe.querySelectorAll(".slip:not(.root)");
    let browserHeight, openWindowWidth;
    let browserWidth, openWindowHeight;
    this.getOpenWindowHeight = () => openWindowHeight;
    this.getOpenWindowWidth = () => openWindowWidth;

    let winX, winY;
    let currentScale, currentRotate;
    this.getCoord = () => { return {x: winX, y: winY, scale: currentScale};};
    this.moveWindow = function (x, y, scale, rotate, delay) {
	console.log("move to", x, y, "with scale, rotate, delay", scale, rotate, delay);
	currentScale = scale;
	currentRotate = rotate;
	winX = x ;
	winY = y;
	console.log(x,y);
	setTimeout(() => {
	    document.querySelector(".scale-container").style.transitionDuration = delay+"s";
	    document.querySelector(".rotate-container").style.transitionDuration = delay+"s";
	    universe.style.transitionDuration = delay+"s, "+delay+ "s"; 
	    universe.style.left = -(x*1440 - 1440/2)+"px";
	    universe.style.top = -(y*1080 - 1080/2)+"px";
	    document.querySelector(".scale-container").style.transform = "scale("+(1/scale)+")";
	    document.querySelector(".rotate-container").style.transform = "rotate("+(rotate)+"deg)";
	},0);
    };
    this.moveWindowRelative = function(dx, dy, dscale, drotate, delay) {
	this.moveWindow(winX+dx, winY+dy, currentScale+dscale, currentRotate+drotate, delay);
    };
    this.placeSlip = function(slip) {
	// console.log("debug Previous (slip)", slip);
	// let posX = 0.5;
	// let posY = 0.5;
	// let x=parseFloat(slip.getAttribute("pos-x")), y=parseFloat(slip.getAttribute("pos-y"));
	let scale = parseFloat(slip.getAttribute("scale"));
	// // console.log(slip);
	let slipScaleContainer = slip.querySelector(".slip-scale-container");
	// let rotate = 0;
	scale = isNaN(scale) ? 1 : scale ;
	// x = (isNaN(x) ? posX : x);
	// y = (isNaN(y) ? posY : y);
	// slip.setAttribute("pos-x", x);
	// slip.setAttribute("pos-y", y);
	// slip.setAttribute("scale", scale);
	// slip.setAttribute("rotate", rotate);
	// posX = x + 1;
	// posY = y;
	// slip.style.top = (y*1080 - 1080/2)+"px";
	// slip.style.left = (x*1440 - 1440/2)+"px";
	// if(!slip.classList.contains("permanent"))
	// 	slip.style.zIndex = "-1";
	// slip.style.transformOrigin = "50% 50%";
	slipScaleContainer.style.transform = "scale("+scale+")";
	slip.style.width = (Math.max(slipScaleContainer.offsetWidth, 1440))*scale+"px";
	slip.style.height = (Math.max(slipScaleContainer.offsetHeight, 1080))*scale+"px";	
    };
    this.placeSlips = function () {
	// let posX = 0.5;
	// let posY = 0.5;
	let depth = function (elem) {
	    console.log("debug depth (elem)", elem);
	    let subslips = myQueryAll(elem, ".slip");
	    console.log("debug depth (subslips)", elem);
	    return 1+subslips.map(depth).reduce((a,b) => Math.max(a,b),0);
	};
	let rootDepth = depth(document.body);
	console.log("debug", rootDepth);
	for(let i= 0; i<rootDepth; i++)
	    slips.forEach(this.placeSlip);	
    };
    setTimeout(() => {
	this.placeSlips();
    },000);
    this.placeOpenWindow = function () {
	browserHeight = window.innerHeight;
	browserWidth = window.innerWidth;
	if(browserHeight/3 < browserWidth/4) {
	    openWindowWidth = Math.floor((browserHeight*4)/3);
	    openWindowHeight = browserHeight;
	    openWindow.style.left = ((window.innerWidth - openWindowWidth) /2)+"px";
	    openWindow.style.right = ((window.innerWidth - openWindowWidth) /2)+"px";
	    openWindow.style.width = (openWindowWidth)+"px";
	    openWindow.style.top = "0";
	    openWindow.style.bottom = "0";
	    openWindow.style.height = (openWindowHeight)+"px";
	}
	else {
	    openWindowHeight = Math.floor((browserWidth*3)/4);
	    openWindowWidth = browserWidth;
	    openWindow.style.top = ((window.innerHeight - openWindowHeight) /2)+"px";
	    openWindow.style.bottom = ((window.innerHeight - openWindowHeight) /2)+"px";
	    openWindow.style.height = (openWindowHeight)+"px";
	    openWindow.style.right = "0";
	    openWindow.style.left = "0";
	    openWindow.style.width = openWindowWidth+"px";
	}
	document.querySelector(".scale-container").style.transformOrigin = (1440/2)+"px "+(1080/2)+"px";
	document.querySelector(".rotate-container").style.transformOrigin = (1440/2)+"px "+(1080/2)+"px";
	document.querySelector(".format-container").style.transform = "scale("+(openWindowWidth/1440)+")";
	document.querySelector(".cpt-slip").style.right =  (parseInt(openWindow.style.left)) + "px";
	document.querySelector(".cpt-slip").style.bottom =  "0";
	document.querySelector(".cpt-slip").style.zIndex =  "10";
    };
    this.placeOpenWindow();
    window.addEventListener("resize", (ev) => {
	this.placeOpenWindow();
	this.moveWindow(winX, winY, currentScale, currentRotate, 0);
    });

    // Taken from https://selftaughtjs.com/algorithm-sundays-converting-roman-numerals
    // Use in showing roman numbers for slip number
    function counterToString(num, depth) {
	if(depth == 1 || depth > 3)
	    return num.toString();
	let result = '';
	let decimal = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
	let roman;
	if(depth == 0)
	    roman = ["M", "CM","D","CD","C", "XC", "L", "XL", "X","IX","V","IV","I"];
	else
	    roman = ["m", "cm","d","cd","c", "xc", "l", "xl", "x","ix","v","iv","i"];
	for (var i = 0;i<=decimal.length;i++) {
	    while (num%decimal[i] < num) {     
		result += roman[i];
		num -= decimal[i];
	    }
	}
	return result;
    }
    this.updateCounter = function () {
	let counters = stack.map((slip) => slip.getActionIndex());
	let res = '';
	res += counterToString(counters[0]+1, 0);
	for(let i = 1; i < stack.length; i++)
	    res += "." + counterToString(counters[i]+1, i);
	document.querySelector(".cpt-slip").innerHTML = res;	
    };
    this.next = () => {
	if(document.querySelector(".toc-slip").innerHTML == "")
	    this.showToC();
	// return true if and only if the stack changed
	let currentSlide = this.getCurrentSlip();
	let n = currentSlide.next();
	this.updateCounter();
	if(n instanceof Slip) {
	    this.gotoSlip(n);
	    this.push(n);
	    this.next();
	    // this.showToC();
	    return true;
	}
	else if(!n) {
	    this.pop();
	    let newCurrentSlide = this.getCurrentSlip();
	    this.gotoSlip(newCurrentSlide);
	    // newCurrentSlide.incrIndex();
	    if(stack.length > 1 || newCurrentSlide.getActionIndex() < newCurrentSlide.getMaxNext())
		this.next();
	    // this.showToC();
	    return true;
	    // console.log(stack);
	}
	// this.showToC();
	return false;
    };
    this.nextSlip = function () {
	// Do this.next() untill the stack change
	while(!this.next()) {}
    };
    this.previous = () => {
	let currentSlip = this.getCurrentSlip();
	let n = currentSlip.previous();
	console.log("debug previous (currentSlip, n)", currentSlip, n);
	if(n instanceof Slip) {
	    this.gotoSlip(n);
	    this.push(n);
	    // this.showToC();
	    return true;
	}
	else if(!n) {
	    this.pop();
	    let newCurrentSlide = this.getCurrentSlip();
	    this.gotoSlip(newCurrentSlide);
	    // newCurrentSlide.incrIndex();
	    if(stack.length > 1 || newCurrentSlide.getActionIndex() > -1)
		this.previous();
	    // console.log(stack);
	    // this.showToC();
	    return true;
	}
	// this.showToC();
	return false;
	// console.log("returned", n);
    };
    this.previousSlip = function () {
	// Do this.previous() untill the stack change
	while(!this.previous()) {}
    };

    this.getCoordinateInUniverse = function (elem) {
	console.log("debug getcoord elem", elem);
	let getCoordInParen = (elem) => {
	    return {x: elem.offsetLeft, y:elem.offsetTop};	    
	};
	let globalScale = 1;
	let parseScale = function(transform) {
	    if (transform == "none")
		return 1;
	    return parseFloat(transform.split("(")[1].split(",")[0]);
	};
	let getCoordIter = (elem) => {
	    let cInParent = getCoordInParen(elem);
	    if(elem.offsetParent.classList.contains("universe"))
	    {
		console.log("universe", cInParent);
		return cInParent;
	    }
	    let cParent = getCoordIter(elem.offsetParent);
	    let style = window.getComputedStyle(elem.offsetParent);
	    // console.log(style);
	    let scale;
	    // console.log("style", style.transform);
	    // if (style.transform == "none")
	    // 	scale = 1;
	    // else
	    // 	scale = parseFloat(style.transform.split("(")[1].split(",")[0]);
	    scale = parseScale(style.transform);
	    // console.log(style.transform);
	    // console.log("scale", scale);
	    // console.log("globalScale", globalScale);
	    globalScale *= scale;
	    // let scale = 1 ; // Has to parse/compute the scale, for now always 1
	    // console.log("at step",  "cParent.x", cParent.x, "cInParen.x", cInParent.x, "scale", scale);
	    return {x:cParent.x+cInParent.x*globalScale, y:cParent.y+cInParent.y*globalScale };
	};
	let c = getCoordIter(elem);
	let style = window.getComputedStyle(elem);
	let scale = parseScale(style.transform);
	globalScale *= scale;
	console.log("getCoord", {x:c.x/1440+0.5, y:c.y/1080+0.5}, "globalScale", globalScale, style.transform, scale);
	let ret = { x: c.x/1440,
		    y: c.y/1080,
		    centerX:c.x/1440+0.5*elem.offsetWidth/1440*globalScale,
		    centerY:c.y/1080+0.5*elem.offsetHeight/1080*globalScale,
		    width: elem.offsetWidth/1440*globalScale,
		    height: elem.offsetHeight/1080*globalScale,
		    scale: globalScale };
	console.log(ret);
	return ret;
	// return {x:c.x/1440+elem*globalScale*scale, y:c.y/1080+0.5*globalScale*scale, scale: globalScale*scale};
	// return {x: this.element.offsetLeft/1440+0.5, y:this.element.offsetTop/1080+0.5};
    };
    this.moveToElement = function(element, options) {
	let coord = this.getCoordinateInUniverse(element);
	let actualSize = {width: element.offsetWidth*coord.scale, height: element.offsetHeight*coord.scale};
	if(options)
	this.moveWindow(coord.x, coord.y, coord.scale, 0, options.delay ? options.delay : 1);
    };
    this.gotoSlip = function(slip, options) {
	console.log("we goto slip");
	options = options ? options : {};
	console.log("options is ", options);
	if(slip.element.classList.contains("slip"))
	    setTimeout(() => {
		let coord = slip.findSlipCoordinate();
		if(typeof slip.currentX != "undefined" && typeof slip.currentY != "undefined")
		    this.moveWindow(slip.currentX, slip.currentY, coord.scale, slip.rotate, options.delay ? options.delay : slip.delay);
		else
		    this.moveWindow(coord.x, coord.y, coord.scale, slip.rotate, options.delay ? options.delay : slip.delay);
	    },0);
	else
	    setTimeout(() => {
		console.log("debug slip element", slip.element);
		let coord = this.getCoordinateInUniverse(slip.element);
		this.moveWindow(coord.centerX, coord.centerY, Math.max(coord.width, coord.height), 0, options.delay ? options.delay : slip.delay);
	    },0);
    };
    let rootSlip = new Slip(root.id, "Presentation", [], this, {});
    let stack = [rootSlip];

    // Stack Management:
    this.push = function (n) {
	stack.push(n);
	return ;
    };
    this.pop = function () {
	let n = stack.pop();
	if(stack.length == 0)
	    stack.push(n);
	return n;
    };
    this.getCurrentSlip = function () {
	return stack[stack.length -1];
    };
    this.getSlipTree = function (slip) {
	slip = slip || rootSlip;
	if(slip instanceof Slip) 
	    return {name: slip.name, slip: slip, subslips: slip.getActionList().map((e) => this.getSlipTree(e))};
	return {function: true};
    };

    this.goToState = function(state) {
	let iter = (state) => {
	    if(state.length == 0)
		return;
	    iter(state[0]);
	    while(state[1].getActionIndex()<state[2])
		this.next();
	};
	stack = [rootSlip];
	rootSlip.refreshAll();
	iter(state);
	this.gotoSlip(state[1]);
    };

    this.showToC = function () {
	console.log("debug showtoc");
	let toc = document.querySelector(".toc-slip");
	// let innerHTML = "";
	let globalElem = document.createElement("div");
	let tree = this.getSlipTree();
	// let before = true;
	let displayTree = (tree, stackWithNumbers) => {
	    console.log("debug treee", tree);
	    let containerElement = document.createElement("div");
	    let nameElement = document.createElement("div");
	    // if(before)
	    // 	nameElement.style.color = "blue";
	    // else
	    // 	nameElement.style.color = "yellow";
	    // if(tree.slip == this.getCurrentSlip()) {
	    // 	nameElement.style.color = "red";
	    // 	before = false;
	    // }
		
	    nameElement.innerText = tree.slip.fullName ? tree.slip.fullName : tree.slip.name ; //+ " (" + (tree.slip.getActionIndex()+1) + "/" + (tree.slip.getMaxNext()+1) + ")";
	    containerElement.appendChild(nameElement);
	    // innerHTML += "<div>"+tree.name+"</div>";
	    if(tree.subslips.length > 0) {
		let ulElement = document.createElement("ul");
		// innerHTML += "<ul>";
		tree.subslips.forEach((subtree, index) => {
		    let newStackWithNumbers = [stackWithNumbers, tree.slip, index];
		    let liElement = document.createElement("li");
		    // innerHTML += "<li>";
		    if(subtree.function) {
			liElement.innerText = ""+(index+1);
			liElement.classList.add("toc-function");
		    } else
			liElement.appendChild(displayTree(subtree, newStackWithNumbers));
		    liElement.addEventListener("click", (ev) => {
		    	if(ev.target == liElement) {
		    	    this.goToState(newStackWithNumbers);
		    	    console.log(newStackWithNumbers);
		    	}
		    });
		    ulElement.appendChild(liElement);
		    
		    // innerHTML += "</li>";
		});
		containerElement.appendChild(ulElement);
		tree.slip.setTocElem(containerElement);
		// innerHTML += "</ul>";
	    }
	    console.log("debug tree, will return", containerElement);
	    // containerElement.addEventListener("click", () => { console.log(stackWithNumbers);});
	    return containerElement;
	};
	toc.innerHTML = "";
	// toc.innerHTML = innerHTML;
	toc.appendChild(displayTree(tree, []));
    };
    
    // this.getRootSlip = () => rootSlip;
    this.setRootSlip = (root) => {
	rootSlip = root;
	stack = [rootSlip];
    };
    this.getRootSlip = () => rootSlip;
};

let Controller = function (ng) {
    let engine = ng;
    this.getEngine = () => this.engine;
    this.setEngine = (ng) => this.engine = ng;

    // let mainSlip = mainS;
    // this.getMainSlip = () => mainSlip;
    // this.setMainSlip = (slip) => mainSlip = slip;

    let speedMove=1;
    document.addEventListener("keypress", (ev) => {
	if(ev.key == "f") { speedMove = (speedMove + 4)%30+1; }    
	if(ev.key == "r") { engine.getCurrentSlip().refresh(); }    
	if(ev.key == "#") {
	    document.querySelectorAll(".slip").forEach((slip) => {slip.style.zIndex = "-1";});
	    document.querySelectorAll(".background-canvas").forEach((canvas) => {canvas.style.zIndex = "1";});
	}    
    });
    document.addEventListener("keydown", (ev) => {
	let openWindowHeight = engine.getOpenWindowHeight();
	let openWindowWidth = engine.getOpenWindowWidth();
	if(ev.key == "l") { engine.moveWindowRelative( 0                          ,  (speedMove)/openWindowHeight, 0, 0, 0.1); }   // Bas
	if(ev.key == "o") { engine.moveWindowRelative( 0                          , -(speedMove)/openWindowHeight, 0, 0, 0.1); }  // Haut
	if(ev.key == "k") { engine.moveWindowRelative(-(speedMove)/openWindowWidth,  0                           , 0, 0, 0.1); }   // Gauche
	if(ev.key == "m") { engine.moveWindowRelative( (speedMove)/openWindowWidth,  0                           , 0, 0, 0.1); }   // Droite
	if(ev.key == "i") { engine.moveWindowRelative(0, 0,  0   ,  1, 0.1); }                             // Rotate 
	if(ev.key == "p") { engine.moveWindowRelative(0, 0,  0   , -1, 0.1); }                             // Unrotate
	if(ev.key == "z") { engine.moveWindowRelative(0, 0,  0.01,  0, 0.1); }                          // Zoom
	if(ev.key == "Z") { engine.moveWindowRelative(0, 0, -0.01,  0, 0.1); }                          // Unzoom
	if(ev.key == "T") {
	    engine.showToC();
	    // document.querySelector(".toc-slip").style.display = document.querySelector(".toc-slip").style.display == "none" ? "block" : "none"; 
	}   
	if(ev.key == "t") {
	    // engine.showToC();
	    document.querySelector(".toc-slip").style.display = document.querySelector(".toc-slip").style.display == "none" ? "block" : "none"; 
	}   
	if(ev.key == "ArrowRight") {
	    console.log(ev);
	    if(ev.shiftKey)
		engine.nextSlip();
	    else    
		engine.next();
	}
	else if (ev.key == "ArrowLeft") {
	    if(ev.shiftKey)
		engine.previousSlip();
	    else    
		engine.previous();
	}
	else if (ev.key == "ArrowUp") {
	    engine.pop();
	}
    });  
    
};


function Slip (name, fullName, actionL, ng, options) {
    let engine = ng;
    this.fullName = fullName;
    this.name = name;
    
    this.getEngine = () => engine;
    this.setEngine = (ng) => engine = ng;
    
    // let presentation = present;
    // this.getPresentation = () => presentation;
    // this.setPresentation = (present) => presentation = present;
    
    this.element = document.querySelector("#"+name);
    console.log(this.element);
    let initialHTML = this.element.outerHTML;
    let clonedElement;
    MathJax.startup.promise.then(() => {
        // console.log('MathJax initial typesetting complete');
	setTimeout(() => {clonedElement = cloneNoSubslip(this.element);},0);
      });
    let innerHTML = this.element.innerHTML;
    this.getCloned = () => clonedElement;
    this.setCloned = (c) => clonedElement = c;
    
    this.findSlipCoordinate = () => { // rename to getCoordInUniverse
	let coord = engine.getCoordinateInUniverse(this.element);
	console.log("debug findslipcoordinate", coord);
	coord.scale *= this.scale;
	coord.y = coord.y + 0.5*coord.scale;
	coord.x = coord.centerX;
	console.log("debug findslipcoordinate", coord);
	return coord;
    };
    
    this.scale = parseFloat(this.element.getAttribute("scale"));
    if(typeof this.scale == "undefined" || isNaN(this.scale)) this.scale = 1;
    this.rotate = parseFloat(this.element.getAttribute("rotate"));
    this.delay = isNaN(parseFloat(this.element.getAttribute("delay"))) ? 0 : (parseFloat(this.element.getAttribute("delay")));
    
    let coord = this.findSlipCoordinate();
    console.log(coord);
    this.x = coord.x;
    this.y = coord.y;
    
    this.queryAll = (quer) => {
	let allElem = Array.from(this.element.querySelectorAll(quer));
	// console.log("allElem", allElem);
	let other = Array.from(this.element.querySelectorAll("#"+name+" .slip "+quer));
	// console.log("other", other, ".slide "+quer);
	return allElem.filter(value => !other.includes(value));
    };
    this.query = (quer) => {
	return this.queryAll(quer)[0];
    };
    let actionList = actionL;
    let actionIndex = -1;
    // let actionIndex=-1;
    this.setActionIndex = (actionI) => actionIndex = actionI;
    this.getActionIndex = () => actionIndex;
    this.setAction = (actionL) => {actionList = actionL;};
    this.getActionList = () => {
	let ret = [];
	for(let i = 0;i <= this.getMaxNext(); i++) {
	    if(typeof actionList[i] == "function" || actionList[i] instanceof Slip)
		ret[i] = actionList[i];
	    else
		ret[i] = () => {};
	}
	return ret;
    };
    this.setNthAction = (n,action) => {actionList[n] = action;};

    this.getSubSlipList = function () {
	return actionList.filter((action) => action instanceof Slip);
    };
    
    this.doAttributes = () => {
	this.queryAll("*[mk-hidden-at]").forEach((elem) => {
	    let hiddenAt = elem.getAttribute("mk-hidden-at").split(" ").map((str) => parseInt(str));
	    if(hiddenAt.includes(actionIndex))
		elem.style.opacity = "0";});	
	this.queryAll("*[mk-visible-at]").forEach((elem) => {
	    let visibleAt = elem.getAttribute("mk-visible-at").split(" ").map((str) => parseInt(str));
	    if(visibleAt.includes(actionIndex))
		elem.style.opacity = "1";});	
	this.queryAll("*[mk-emphasize-at]").forEach((elem) => {
	    let emphAt = elem.getAttribute("mk-emphasize-at").split(" ").map((str) => parseInt(str));
	    if(emphAt.includes(actionIndex))
		elem.classList.add("emphasize");});	
	this.queryAll("*[mk-unemphasize-at]").forEach((elem) => {
	    let unemphAt = elem.getAttribute("mk-unemphasize-at").split(" ").map((str) => parseInt(str));
	    if(unemphAt.includes(actionIndex))
		elem.classList.remove("emphasize");});	
	this.queryAll("*[emphasize-at]").forEach((elem) => {
	    let emphAt = elem.getAttribute("emphasize-at").split(" ").map((str) => parseInt(str));
	    if(emphAt.includes(actionIndex))
		elem.classList.add("emphasize");
	    else
		elem.classList.remove("emphasize");
	});	
	this.queryAll("*[chg-visib-at]").forEach((elem) => {
	    let visibAt = elem.getAttribute("chg-visib-at").split(" ").map((str) => parseInt(str));
	    if(visibAt.includes(actionIndex))
		elem.style.opacity = "1";
	    if(visibAt.includes(-actionIndex))
		elem.style.opacity = "0";
	});	
	this.queryAll("*[static-at]").forEach((elem) => {
	    let staticAt = elem.getAttribute("static-at").split(" ").map((str) => parseInt(str));
	    if(staticAt.includes(-actionIndex)){
		elem.style.position = "absolute";
		elem.style.visibility = "hidden";
	    }
	    if(staticAt.includes(actionIndex)) {
		elem.style.position = "static";
		elem.style.visibility = "visible";
	    }
	});	    
	this.queryAll("*[down-at]").forEach((elem) => {
	    let goDownTo = elem.getAttribute("down-at").split(" ").map((str) => parseInt(str));
	    if(goDownTo.includes(actionIndex))
		this.moveDownTo(elem, 1);
	});
	this.queryAll("*[up-at]").forEach((elem) => {
	    let goTo = elem.getAttribute("up-at").split(" ").map((str) => parseInt(str));
	    if(goTo.includes(actionIndex))
		this.moveUpTo(elem, 1);});
	this.queryAll("*[center-at]").forEach((elem) => {
	    let goDownTo = elem.getAttribute("center-at").split(" ").map((str) => parseInt(str));
	    if(goDownTo.includes(actionIndex))
		this.moveCenterTo(elem, 1);});	
    };

    this.setTocElem = (tocElem) => {this.tocElem = tocElem;};
    this.updateToC = () => {
	if(!this.tocElem)
	    return;
	let list = myQueryAll(this.tocElem, "li", "li");
	console.log("debug updateToc", this.name, list);
	let i;
	for(i=0;i<this.getActionIndex(); i++) {
	    console.log("debug updateToc, before with i=", i);
	    list[i].classList.remove("before", "after", "current");
	    list[i].classList.add("before");	    
	}
	// if(i!=0) i++;
	if(i<=this.getActionIndex()) {
	    console.log("debug updateToc, current with i=", i);
	    list[i].classList.remove("before", "after", "current");
	    list[i].classList.add("current");
	    i++;
	}
	for(i;i<=this.getMaxNext(); i++) {
	    console.log("debug updateToc, after with i=", i);
	    list[i].classList.remove("before", "after", "current");
	    list[i].classList.add("after");
	}	
    };
    this.incrIndex = () => {
	console.log("incrIndex");
	actionIndex = actionIndex+1;
	this.doAttributes();
	this.updateToC();
	// if(this.tocElem)
	//     this.tocElem.innerText = actionIndex;
	// this.hideAndShow();
    };
    
    this.next = function () {
	// if(actionIndex == -1) {
	//     this.incrIndex();
	//     this.firstVisit();
	//     return true;
	// }
	if(actionIndex >= this.getMaxNext())
	    return false;
	this.incrIndex();
	// console.log(actionList);
	if(typeof actionList[actionIndex] == "function") {
	    // console.log("here");
	    actionList[actionIndex](this);
	}
	if(actionList[actionIndex] instanceof Slip){
	    // if(!actionList[actionIndex].next()) {
	    // 	// actionIndex += 1;
	    // 	this.incrIndex();
	    // }
	    return actionList[actionIndex];
	}
	// else
	//     this.incrIndex();
	// }, 0);
	// this.incrIndex();
	return true;
    };
    this.previous = () => {
	let savedActionIndex = this.getActionIndex();
	this.doRefresh();
	if(savedActionIndex == -1)
	    // this.previousSlip();
	    return false;
 	let toReturn;
	while(this.getActionIndex()<savedActionIndex-1)
	    toReturn = this.next();
	return toReturn;
	// this.setCpt();
    };

    this.firstVisit = () => {
	this.updateToC();
	if(options.firstVisit)
	    options.firstVisit(this);
    };
    this.init = () => {
	this.queryAll("*[chg-visib-at]").forEach((elem) => {
	    elem.style.opacity = "0";
	});	
	this.queryAll("*[static-at]").forEach((elem) => {
	    elem.style.position = "absolute";
	    elem.style.visibility = "hidden";
	});	
	this.doAttributes();
	if(options.init)
	    options.init(this);
    };
    this.whenLeaving = () => {
	if(options.whenLeaving)
	    options.whenLeaving(this);
    };
	
    this.refresh = () => {
	if(actionList[actionIndex] instanceof Slip)
	    actionList[actionIndex].refresh();
	else
	    this.doRefresh();
    };
    this.refreshAll = () => {
	actionList.filter((elem) => elem instanceof Slip).forEach((subslip) => { subslip.refreshAll();});
	this.doRefresh();
    };
    this.doRefresh = () => {
	this.setActionIndex(-1);
	let subSlipList = myQueryAll(this.element, ".slip");;
	let clone = clonedElement.cloneNode(true);
	replaceSubslips(clone, subSlipList);
	this.element.replaceWith(clone);
	this.element = clone;
	// if(typeof hljs != "undefined")
	//     document.querySelectorAll('pre code').forEach((block) => {
	// 	hljs.highlightBlock(block);
	//     });
	// if(MathJax && typeof MathJax.typeset == "function")
	//     MathJax.typeset();
	// else if (MathJax && MathJax.Hub && typeof MathJax.Hub.Typeset == "function")
	//     MathJax.Hub.Typeset();
	this.init();
	this.firstVisit();
	delete(this.currentX);
	delete(this.currentY);
	engine.gotoSlip(this);
	// console.log("ai", actionIndex);
    };
    this.init(this, engine);
    this.moveUpTo = (selector, delay,  offset) => {
	setTimeout(() => {
	    let elem;
	    if(typeof selector == "string") elem = this.query(selector);
	    else elem = selector;
	    if (typeof offset == "undefined") offset = 0.0125;
	    let coord = this.findSlipCoordinate();
	    let d = ((elem.offsetTop)/1080-offset)*coord.scale;
	    this.currentX = coord.x;
	    this.currentY = coord.y+d;
	    engine.moveWindow(coord.x, coord.y+d, coord.scale, this.rotate, delay);
	},0);
    };
    this.moveDownTo = (selector, delay, offset) => {
	setTimeout(() => {
	    let elem;
	    if(typeof selector == "string") elem = this.query(selector);
	    else elem = selector;
	    if (typeof offset == "undefined") offset = 0.0125;
	    let coord = this.findSlipCoordinate();
	    let d = ((elem.offsetTop+elem.offsetHeight)/1080 - 1 + offset)*coord.scale;
	    this.currentX = coord.x;
	    this.currentY = coord.y+d;
	    engine.moveWindow(coord.x, coord.y+d, coord.scale, this.rotate, delay);
	},0);
    };
    this.moveCenterTo = (selector, delay, offset) => {
	setTimeout(() => {
	    let elem;
	    if(typeof selector == "string") elem = this.query(selector);
	    else elem = selector;
	    if (typeof offset == "undefined") offset = 0;
	    let coord = this.findSlipCoordinate();
	    let d = ((elem.offsetTop+elem.offsetHeight/2)/1080-1/2+offset)*coord.scale;
	    this.currentX = coord.x;
	    this.currentY = coord.y+d;
	    engine.moveWindow(coord.x, coord.y+d, coord.scale, this.rotate, delay);
	},0);
    };
    this.reveal = (selector) => {
	this.query(selector).style.opacity = "1";
    };
    this.revealAll = (selector) => {
	this.queryAll(selector).forEach((elem) => { elem.style.opacity = "1";});
    };
    this.hide = (selector) => {
	this.query(selector).style.opacity = "0";
    };
    this.hideAll = (selector) => {
	this.queryAll(selector).forEach((elem) => { elem.style.opacity = "0";});
    };
    this.getMaxNext = () => {
	let maxTemp = actionList.length;
	["mk-visible-at",
	 "mk-hidden-at",
	 "mk-emphasize-at",
	 "mk-unemphasize-at",
	 "emphasize-at",
	 "chg-visib-at",
	 "up-at",
	 "down-at",
	 "center-at",
	 "static-at",
	].forEach((attr) => {
	     this.queryAll("*["+attr+"]").forEach((elem) => {
		 elem.getAttribute(attr).split(" ").forEach((strMax) => {
		     maxTemp = Math.max(Math.abs(parseInt(strMax)),maxTemp);
		 });
	     });
	 });
	return maxTemp;	
    };
}
