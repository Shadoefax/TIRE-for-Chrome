// tireCommon.js
// Text Input Recovery Extension
// Chuck Baker

window.addEventListener("load", tireInit);

// Global variables
var tireData = {};
var TireDb = TAFFY();	// TireDb: url, title, id, text
var checkIntervalTime = new Number();
var checkIntervalPID = new Number(0);
var inputTags = [];
var thisURL = document.URL;
var pageHasInputs = false;	// Does the page have any input or textarea fields?
var tireOnFile = false;	// Is there a saved record for the current URL?
var addedID = 0;	// If an html element does not have an id, assign it one starting with zero
var focusedElm = null;	// The focused element
var origBgColor = [];		// Array of original elmement background colors
var curBgColor = "";		// Current background color of input field
var buttonFocused = false;	// Does a TIRE button have focus?

function tireInit(){
	//initTIREdata(true);
	return true;
}

function log(){
	var arg = arguments;
	try{
		console.log(arg);
	}catch(er){;;}
	
	try{
		if(console != chrome.extension.getBackgroundPage().console){
			chrome.extension.getBackgroundPage().console.log(arg)
		}
	}catch(er){;;}
	return true;
}

function initGlobalData(){
	TireDb = TAFFY();
 	tireData = {};
	tireData.TireDbData = [];
	tireData.checkIntervalTime = 5000;
	tireData.initialized = true;
	tireData.highlightFields = false;
	tireData.highlightColor = "#e6e6fa";
	tireData.highlightOnMouseover = false;
	tireData.mouseoverHighlightColor = "#fa8072";
	tireData.savePasswords = false;
	tireData.showTooltips = false;
	//tireData.hoverShowButons = false;
	//tireData.alwaysShowButtons = false;
	tireData.showButtons = false;
	tireData.showButtonType = "always";
	tireData.hoverDelay = 2000;
	return true;
}


function loadFromStorage(callback){
 	chrome.storage.local.get(null, function(saveData){
		if(saveData.initialized != true){
			initGlobalData();
			saveToStorage();
		}else{
			tireData = saveData;
		}
		if(tireData.TireDbData.length == 0){
			TireDb = TAFFY();
			tireData.TireDbData = TireDb().get();	// TireDb: url, title, id, text
		}else{
			TireDb = TAFFY(tireData.TireDbData);	
		}	
		if(callback) callback();
	});	
	return true;
}

function saveToStorage(callback){
	// Save the data to storage
	// TireDb: url, title, id, text
	tireData.TireDbData = TireDb().get();
	chrome.storage.local.set(tireData, function(){
		if(chrome.runtime.lastError){
			var msg = "TIRE: Could not save sync data!";
			alert(msg)
		}
		if(callback) callback();
//log("Saved to storage",tireData)
	});
	return true;
}

//log("tireCommon.js loaded")