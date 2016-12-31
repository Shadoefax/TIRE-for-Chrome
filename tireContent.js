// tireContent.js
// Text Input Recovery Extension
// Chuck Baker

window.addEventListener('load', init);

/* log("Adding DOMContentLoaded event listener")
document.addEventListener("DOMContentLoaded", function(event){
	log("DOMContentLoaded fired");
	getElements();
	log("DOM fully loaded and parsed");
},false);
 */
initTIREdata();
inputTags = [];
origBgColor = [];
	
function init(){
	loadFromStorage(function(){
//log(document.URL,"Page loaded",document.title,document)
		getElements();
		addListeners();
		checkFill();		
		highlightFields();
		showButtons();
		addButton();
	});
	return true;
}

function addButton(){
/*	var mainBody = document.getElementsByTagName('body')[0];
	log("mainBody",mainBody)
 	// select the target node
	var target = mainBody;
	 
	// create an observer instance
	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			log(mutation.type);
		});    
	});
	 
	// configuration of the observer:
	var config = { attributes: true, childList: true, characterData: true };
	 
	// pass in the target node, as well as the observer options
	observer.observe(target, config);
	 
	// later, you can stop observing
	//observer.disconnect();
	return true
 */	
	var button = document.createElement("button");
	button.innerHTML = "Click";
	button.addEventListener('click',function(event){
		//log("Button clicked",document)
		//getElements();
		//var mainBody = document.getElementsByTagName('body')[0];
		//var x = document.getElementsByClassName("cke_editable")
		//var x = document.getElementsByTagName('body');
		//var x = mainBody.querySelectorAll("body");
		//log(document)
		//for(var i=0; i<x.length; i++){
			//var elm = x[i];
			//if(elm.getAttribute('contentdocument')) log(elm)
			//log(elm)
		//}
		//log("contentDocument elements",x)
		getElements()
	});
	document.body.appendChild(button);
	return true;
}

function addListeners(){

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
		//log("Received message",request)
		switch(request.type){
			case 'fill':
				tireFill();
				break;
			case 'highlightFields':
				loadFromStorage(function(){
					highlightFields();
				});
				break;
			case 'showButtons':
				loadFromStorage(function(){
					showButtons();
				});
				break;
		}
	});	

	
	// Don't add listeners to TIRE  or 'chrome' pages
	if(thisURL.substr(0, 6) == "chrome") return true;	// Ignore chrome urls
	
	//getElements();
/*  	log("Adding DOMContentLoaded event listener")
	document.addEventListener("DOMContentLoaded", function(event){
		log("DOMContentLoaded fired");
		getElements();
		log("DOM fully loaded and parsed");
	},false);
 */
	window.addEventListener('focus',pageFocus);
	window.addEventListener('blur',pageBlur);
	
		
	pageFocus();
}

function getElements(){
	//var allElms = document.getElementsByTagName('*');
	var allElms = document.querySelectorAll("*");
log("allElms",allElms)
	for(var i=0; i<allElms.length; i++){
		var elm = allElms[i];
		var ok = testElement(elm);
log("Testing",elm,ok)
//ok = false;
		if(ok){
			addID(elm);
			inputTags.push(elm);
			origBgColor[elm.id] = elm.style.background;
		}
		
 		if(elm.tagName == "IFRAME") testIframes(elm);
 }
//log(inputTags)
	return true;
}

function testIframes(elm){
	var cd = elm.contentDocument;
	var cdElms = cd.all;
//log("cdElms",cdElms)
	for(var j = 0; j<cdElms.length; j++){
		var cdElm = cdElms[j];
log("Testing",cdElm,elm.isContentEditable)
		if(cdElm.tagName == "IFRAME"){
			testIframes(cdElm);
		}
		ok = testElement(cdElm);
		if(ok){
//log(cdElm)
			addID(elm);
			inputTags.push(elm);
			origBgColor[elm.id] = elm.style.background;
		}	
	}
	return true;
}

function testElement(elm){
	// The only valid elements are INPUT (that don't have a 'type' listed the invalidTypes array)
	// or any element that has a 'contenteditable' attribute that resolves to 'true'.
	// any iframes are tested separatley
	var ok = false;
	var tagName = elm.tagName;
	if(tagName == 'IFRAME') return ok;
	var isInvalid = false;
	if(tagName == 'INPUT'){
		if(elm.type == 'password' && !tireData.savePasswords){
			isInvalid = true;
		}else{
			for(var i=0; i<invalidTypes.length; i++){
				if(elm.type == invalidTypes[i]){
					isInvalid = true;
					break;
				}
			}
		}
		ok = !isInvalid;
	}
log("testElement",elm)	
	if(isEditable(elm)) ok = true;
	if(tagName == 'TEXTAREA') ok = true;
	return ok;
}

function isEditable(elm){
	// Only allow 'body' and 'span' elements with contentEditable, otherwise all children of the body will be flagged as editable including '<br>', '<script>', etc.
//log("isEditable",elm)
	var ok = false;
	if(elm.tagName == 'BODY' || elm.tagName == 'SPAN'){
		ok = elm.isContentEditable;
	}
//log(elm,"isEditable",ok);
	return ok;
}

function addID(elm){
	// Add ID to input field if it doesn't already exist
	if(elm.tagName == 'IFRAME') return false;
	elm.addEventListener('focus',function(event){
		focusedElm = this;
		makeTT(focusedElm);
		//log("Focused element",focusedElm)
	});
	
	elm.addEventListener('blur',function(event){
		makeTT(this);
		focusedElm = null;
		checkForChanges();
	});
log("In addID",elm,elm.id,!elm.id)

	if(!elm.id){
		elm.id = "TIREid"+addedID.toString();
log("Adding id",elm,elm.id)
		addedID++;
	}else{
log("Already has id",elm,elm.id)
	}
	
	makeTT(elm);
	return true;
}

function makeTT(elm){
	// Add a Tooltip to element
	if(!tireData.showTooltips){
		elm.removeEventListener('focus',function(event){
			focusedElm = this;
			makeTT(focusedElm);
			//log("Focused element",focusedElm)
		});
		
		elm.removeEventListener('blur',function(event){
			makeTT(this);
			focusedElm = null;
			checkForChanges();
		});
		return true;
	} 
	elm.title = "id: '"+elm.id+"', type: '"+elm.type+", tagName: "+elm.tagName;
	elm.title += "\n"+thisURL;
	elm.title += "\nComputed style - height: "+window.getComputedStyle(elm, null).getPropertyValue("height")+", width: "+window.getComputedStyle(elm, null).getPropertyValue("width");
	elm.title += "\nzIndex: "+getZindex(elm);
	elm.title += "\nisEditable? "+isEditable(elm)
	var value = elm.value;
	if(isEditable(elm)) value = elm.innerText;
	elm.title += "\ncurrent value '"+value+"'";
	var saveData = TireDb({url:encodeURI(thisURL), id:elm.id}).get();
	if(saveData.length != 0){
		elm.title += "\nsaved value '"+saveData[0].text+"'";
	}else{
		elm.title += "\nsaved value: none";
	}
	return true;
}

function highlightFields(){
	var color = tireData.highlightColor;
//log("highlightFields",tireData.highlightFields,typeof tireData.highlightFields)
	for(var i=0; i<inputTags.length; i++){
		var elm = inputTags[i];
		if(tireData.highlightFields){
			elm.style.background = color;
		}else{
			elm.style.background = origBgColor[elm.id];
		}
	}
	return true;
}

function showButtons(){
//log("showButtons",tireData.showButtons,"showButtonType",tireData.showButtonType)
	for(var i=0; i<inputTags.length; i++){
		var elm = inputTags[i];
		//log("Removing mouseover event",elm)
		elm.removeEventListener('mouseover',function(event){
			makeTireButton(elm,true);
		});
		elm.removeEventListener('mouseout',function(event){
			makeTireButton(elm,false);
		});


		if(tireData.showButtons){
			if(tireData.showButtonType == 'always'){
				//log("Making permanent button")
				makeTireButton(elm,true);
			}else{
 				//log("Adding mouseover",elm)
				elm.addEventListener('mouseover',evlFieldMouseover);
				//elm.addEventListener('mouseout',evlFieldMouseout);
			}
		}else{
			//log("showButtons is false - removing event",elm)
			makeTireButton(elm,false);
		}
	}
	return true;
}

function makeTireButton(elm,create){
//log("makeTireButton",elm,create)
	// If 'create' is true, create the element, else remove it
	var id = elm.id+"TireButton";
	var button = document.getElementById(id);
	if(!create){
//log("Deleting button from",elm,"because create is",create)
		if(button) button.parentNode.removeChild(button);
		return true;
	}

	// See if there is any save data for the field
	var tireObj = {};
	tireObj.url = encodeURI(thisURL);
	tireObj.id = elm.id;
	var values = TireDb({url:tireObj.url, id:tireObj.id}).get();
//log(elm,elm.id,values)
	if(values.length == 0){
//log("No data on file ... removing button from",button.parentNode)
		if(button) button.parentNode.removeChild(button);
		return true;
	} 

	// If it already exists, don't recreate it
	if(button){
//log("Button already exists",button)
		return true;
	}
	var elemRect = elm.getBoundingClientRect();
	var button = document.createElement("img");
	button.id = id;
	button.name = "Tire Button";
	button.className = "TIREbutton";
	button.src = chrome.extension.getURL("TIREbutton.png");
	button.style.width = "16px";
	button.style.height = "16px";
	button.style.position = "absolute";
	button.style.left = (elemRect.right - 17).toString()+'px';
	button.style.top = (elemRect.top + 2).toString()+'px';
	button.style.width = "16px";
	button.style.height = "16px";
	//button.style.zIndex = 5;
	button.style.zIndex = getZindex(elm) + 1;
	//button.title = values[0].text;
	button.addEventListener('click',evlButtonClick)
 	button.addEventListener('mouseover',evlButtonMouseover);
	button.addEventListener('mouseout',evlButtonMouseout);
	//log("Adding button",button)
	getZindex(elm)
	document.body.appendChild(button);
	tireButtonTooltip(button,elm.id)
//log("Adding button to",document.body,button)
	//log("Parents",button.parentElement.style,button.parentNode.style)
	if(tireData.showButtonType == 'hover' && tireData.hoverDelay != 0){
		setTimeout(function(){
			//log("setTimeout fired",button)
			button.parentNode.removeChild(button);
		},tireData.hoverDelay,button);
	}
	return true;
}

function tireButtonTooltip(button,elmId){
	var tireObj = {};
	tireObj.url = encodeURI(thisURL);
	tireObj.id = elmId;
	var values = TireDb({url:tireObj.url, id:tireObj.id}).get();
	button.title = values[0].text+" : "+elmId;
//log("Adding tooltip",values[0].text,"to",button,elmId)
	return true;
}

function getZindex(elm){   
	// Calculate a z-index for the button
//log("getZindex",elm)
	var z = window.getComputedStyle(elm, null).getPropertyValue('z-index');
	if (isNaN(z)) z = getZindex(elm.parentNode);
	z = parseInt(z,10);
	if(z == 0) z = 99;	// If no z-index is present, set it to a high number
	z++;	// Make the z-index one higher than the element the button is located on
//log("zIndex",elm,z)
	return z; 
}

function evlButtonMouseover(){
	// TIRE field button mouseover listener
	this.focus();
	buttonFocused = true;
	//var fromElm = event.fromElement;
	if(tireData.highlightOnMouseover){
		var target = targetId(event.target.id);
//log("target",target.id)
		if(!target) return false
		var bgColor = tireData.mouseoverHighlightColor;
		curBgColor = target.style.backgroundColor;
		target.style.backgroundColor = bgColor;
//log("mouseover: Adding tooltip to",this,target.id)
		tireButtonTooltip(this,target.id);
	}
}

function evlButtonMouseout(){
	// TIRE field button mouseover listener
	var fromElm = event.fromElement;
	fromElm.addEventListener('mouseout',evlFieldMouseout);
	fromElm.focus();
	buttonFocused = false;
	if(tireData.highlightOnMouseover){
		var target = targetId(event.target.id);
		if(!target) return false
		var bgColor = curBgColor;
		target.style.backgroundColor = bgColor;
//log("mouseout",bgColor)
	}

	//log("Button mouseout",buttonFocused)
}

function evlButtonClick(){
	// TIRE field button click listener
log("ev1ButtonClick",event.target)
	var target = targetId(event.target.id);
//log("Button clicked: target",target)
	focusedElm = target;
	tireFill();
	return true;
}

function evlFieldMouseover(){
	// Input field mouserover listener
	//log("Field mouseover - make button",buttonFocused)
	makeTireButton(event.srcElement,true);
}

function evlFieldMouseout(){
	// Input field mouseout listener
	//log("Field mouseout - remove button",buttonFocused)
	//if(buttonFocused) return true;
	var ev = event;
	//log("evlFieldMouseout",ev)
	setTimeout(function(){
		//log("setTimeout fired",ev)
		makeTireButton(ev.srcElement,false);
	},1000,ev);
	//ev.srcElement.removeEventListener('mouseout',evlFieldMouseout);
	//makeTireButton(event.srcElement,false);	
}

function targetId(id){
	// Return the element that is assigned to the TIRE button
	var index = id.lastIndexOf('TireButton');
	var tId = id.substr(0, index);
	var elm = document.getElementById(tId);
	return elm;
}

function pageFocus(){
	//log("Page focus",thisURL,tireData.highlightFields)
	highlightFields();
	
	window.clearInterval(checkIntervalPID);
	var checkIntervalTime = tireData.checkIntervalTime
	pageHasInputs = (inputTags.length == 0) ? false : true;
	if(!pageHasInputs) return false;
	var dbRecs = TireDb({url:thisURL}).get();
	
	checkIntervalPID = window.setInterval(checkForChanges, checkIntervalTime);
	
	return true;
}

function checkForChanges(){
	for(var i=0; i<inputTags.length; i++){
		var elm = inputTags[i];			
		var tireObj = {};
		tireObj.url = encodeURI(thisURL);
		tireObj.title = document.title;
		tireObj.id = elm.id;
		tireObj.text = "";
		var saveData = TireDb({url:tireObj.url, id:tireObj.id}).get();
		var onFile = false;
		if(saveData.length != 0){
			tireObj = saveData[0];
			onFile = true;
		}
		var dbUpdated = false;
		var value = elm.value;
		if(isEditable(elm)) value = elm.innerText;
		if(isNonBlank(value)){
			if(onFile){
				// Db record is on file, value entered is different than the one file field, so update it
				if(value != tireObj.text){
					tireObj.text = value;
//log("Updating",tireObj,"was",tireObj.text,"changed to",value)
					TireDb({url:tireObj.url, id:tireObj.id}).update(tireObj);
					dbUpdated = true;
				}
			}else{
				// Db record not on file, non-blank value entered, so insert db record
				tireObj.text = value;
				tireObj.title = document.title;
//log("Adding",tireObj)
				TireDb.insert(tireObj);
				dbUpdated = true;
			}
		}
		if(dbUpdated) saveTire(tireObj);
	}
	return true;
}

function isNonBlank(str){
	// Test to see if string is not empty and not just whitespace
	if(typeof str == 'undefined') return false;
	if(str.length == 0) return false;
	return (/\S/.test(str)); 			
}

function pageBlur(){
	window.clearInterval(checkIntervalPID);
	saveTire()
	return true;
}

function saveTire(){
	//setBadge('Save');
	saveToStorage(function(){
		showButtons();
		checkFill();
	});
	return true;
}

function checkFill(){
	// Set the icon badge to "Fill" if there are values on file for the current url
	setBadge("");
	var tireObj = {};
	tireObj.url = encodeURI(thisURL);
	var pageValues = TireDb({url:tireObj.url}).get();
	if(pageValues.length != 0) setBadge("Fill");
	return true;
}

function tireFill(){
log("tireFill",focusedElm)
	var tireObj = {};
	tireObj.url = encodeURI(thisURL);
	if(!focusedElm){
		// Fill the whole page
		var pageValues = TireDb({url:tireObj.url}).get();
		for(var i=0; i<pageValues.length; i++){
			tireObj = pageValues[i];
			var id = tireObj.id;
			var value = tireObj.text;
			fillElm(id,value);
		}
	}else{
		// Just fill the focused element
		var elmValues = TireDb({url:tireObj.url, id:focusedElm.id}).get();
if(elmValues.length == 0){log("elmValues is empty for",focusedElm.id)}
		if(elmValues.length != 0){
			tireObj = elmValues[0];
//log("Filling",focusedElm.id,"with",tireObj.text)
			fillElm(focusedElm.id,tireObj.text)
		}
	}
	return true;
}

function fillElm(id,value){
	var elm = document.getElementById(id);
	if(isEditable(elm)){
		elm.innerText = value;
	}else{
		elm.value = value;
	}
	return true;
}

function initTIREdata(){
	invalidTypes = [];
	invalidTypes.push('button');
	invalidTypes.push('checkbox');
	invalidTypes.push('color');
	invalidTypes.push('file');
	invalidTypes.push('hidden');
	invalidTypes.push('image');
	invalidTypes.push('radio');
	invalidTypes.push('range');
	invalidTypes.push('reset');
	invalidTypes.push('submit');
	return true;
}

function setBadge(txt){
	// Set the icon badge
	chrome.runtime.sendMessage({type: 'setIconBadge', text: txt}, function(response){});
	return true;
}
