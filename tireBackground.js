// tireBackground.js
// Text Input Recovery Extension
// Chuck Baker

window.addEventListener("load", tireBgInit);

/* document.addEventListener("DOMContentLoaded", function(event){
	//log("DOMContentLoaded fired");
	getElementsBG();
	log("DOM fully loaded and parsed");
},false);
 */
function getElementsBG(){
	var allElms = document.getElementsByTagName('*');
	for(var i=0; i<allElms.length; i++){
		var elm = allElms[i];
		var ok = false;
		var tagName = elm.tagName;
		var isInvalid = false;
		if(tagName == 'INPUT'){
			if(elm.type == 'password' && !tireData.savePasswords){
				isInvalid = true;
			}else{
				for(var j=0; j<invalidTypes.length; j++){
					if(elm.type == invalidTypes[j]){
						isInvalid = true;
						break;
					}
				}
			}
			if(isInvalid) continue;
			ok = true;
		}
log(tagName,elm,isEditable(elm))
		if(isEditable(elm)) ok = true;
		if(tagName == 'TEXTAREA') ok = true;
		
		if(ok){
			addID(elm);
			inputTags.push(elm);
			origBgColor[elm.id] = elm.style.background;
		}
//log(elm,ok)
	}
	return true;
}

function tireBgInit(){
	loadFromStorage(function(){
		chrome.contextMenus.update("tireIconCtxMenuHighlightFields",{
			checked: tireData.highlightFields
		});	
	});
		chrome.contextMenus.update("tireIconCtxMenuShowButtons",{
			checked: tireData.showButtons
		});	
	return true;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
//log("Received msg",request)
	switch(request.type){
		case 'setIconBadge':
			chrome.browserAction.setBadgeText({text: request.text});
			break;
		case 'highlightFields':
			chrome.contextMenus.update("tireIconCtxMenuHighlightFields",{
				checked: request.checked
			});	
			break;
		case 'showButtons':
			chrome.contextMenus.update("tireIconCtxMenuShowButtons",{
				checked: request.checked
			});	
			break;
	}
});	

chrome.browserAction.onClicked.addListener(function(){
	var obj = {};
	obj.type = 'fill';
	//log("Sending message",obj)
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var tabId = tabs[0].id;
		chrome.tabs.sendMessage(tabId, obj);
	});

});

chrome.contextMenus.create({
	id: "tireIconCtxMenuHighlightFields",
	title: "Hightlight saveable fields",
	contexts:["browser_action"],
	type: "checkbox",
	checked: tireData.highlightFields
});	

chrome.contextMenus.create({
	id: "tireIconCtxMenuShowButtons",
	title: "Show TIRE button on saved fields",
	contexts:["browser_action"],
	type: "checkbox",
	checked: tireData.showButtons
});	

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	//log(info,tab)
  switch (info.menuItemId) {
    case "tireIconCtxMenuHighlightFields":
			tireData.highlightFields = info.checked;
			saveToStorage();
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				var obj = {};
				obj.type = 'highlightFields';
				var tabId = tabs[0].id;
				chrome.tabs.sendMessage(tabId, obj);
			});
      break;
    case "tireIconCtxMenuShowButtons":
			tireData.showButtons = info.checked;
			saveToStorage();
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				var obj = {};
				obj.type = 'showButtons';
				var tabId = tabs[0].id;
				chrome.tabs.sendMessage(tabId, obj);
			});
      break;

  }
});

chrome.tabs.onActivated.addListener(function(e){
	//log("onActivated",e)
	chrome.tabs.sendMessage(
		e.tabId, 
		{type: 'highlightFields'}
	);
});


function encryptIt(str, pwd) {
	var prand = "";
	for(var i=0; i<pwd.length; i++) {
		prand += pwd.charCodeAt(i).toString();
	}
	var sPos = Math.floor(prand.length / 5);
	var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos*2) + prand.charAt(sPos*3) + prand.charAt(sPos*4) + prand.charAt(sPos*5));
	var incr = Math.ceil(pwd.length / 2);
	var modu = Math.pow(2, 31) - 1;
	if(mult < 2){return null;}
	var salt = Math.round(Math.random() * 1000000000) % 100000000;
	prand += salt;
	while(prand.length > 10) {
		prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
	}
	prand = (mult * prand + incr) % modu;
	var enc_chr = "";
	var enc_str = "";
	for(var i=0; i<str.length; i++) {
	enc_chr = parseInt(str.charCodeAt(i) ^ Math.floor((prand / modu) * 255));
	if(enc_chr < 16) {
		enc_str += "0" + enc_chr.toString(16);
	} else enc_str += enc_chr.toString(16);
		prand = (mult * prand + incr) % modu;
	}
	salt = salt.toString(16);
	while(salt.length < 8)salt = "0" + salt;
	enc_str += salt;
	return enc_str;
}

function decryptIt(str, pwd){
	var prand = "";
	for(var i=0; i<pwd.length; i++) {
		prand += pwd.charCodeAt(i).toString();
	}
	var sPos = Math.floor(prand.length / 5);
	var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos*2) + prand.charAt(sPos*3) + prand.charAt(sPos*4) + prand.charAt(sPos*5));
	var incr = Math.round(pwd.length / 2);
	var modu = Math.pow(2, 31) - 1;
	var salt = parseInt(str.substring(str.length - 8, str.length), 16);
	str = str.substring(0, str.length - 8);
	prand += salt;
	while(prand.length > 10) {
		prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
	}
	prand = (mult * prand + incr) % modu;
	var enc_chr = "";
	var enc_str = "";
	for(var i=0; i<str.length; i+=2) {
		enc_chr = parseInt(parseInt(str.substring(i, i+2), 16) ^ Math.floor((prand / modu) * 255));
		enc_str += String.fromCharCode(enc_chr);
		prand = (mult * prand + incr) % modu;
	}
	return enc_str;
}


function makeKey(){
	// Return encryption key - generate if non-existent
	var key = "";
	for(var i=1; i!=64; i++){
		var r = parseInt(33+Math.random()*(126-33))
		key += String.fromCharCode(r);
	}
	return key;
}
