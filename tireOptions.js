// tireOptions.js
// Text Input Recovery Extension
// Chuck Baker

window.addEventListener('load', tireOptionsInit);
var saveButton, storageButton, clearButton, checkInterval;
var tireTable, tireDeleteSelected, tireSelectAll, highlightFields, highlightColor, showButton, showTooltips, savePasswords, showButtonAlways, showButtonHover, hoverDelay;
var supportForumButton, homepageButton, highlightOnMouseover, mouseoverHighlightColor;


function tireOptionsInit(){
	saveButton = document.getElementById('saveButton');
	saveButton.addEventListener('click',tireSave);
	clearButton = document.getElementById('clearButton');
	clearButton.addEventListener('click',tireClear);
	storageButton = document.getElementById('storageButton');
	storageButton.addEventListener('click',tireShow);
	tireReloadButton = document.getElementById('tireReload');
	tireReloadButton.addEventListener('click',buildTable);
	highlightFields = document.getElementById('highlightFields');
	highlightColor = document.getElementById("highlightColor");
	highlightOnMouseover = document.getElementById('highlightOnMouseover');
	mouseoverHighlightColor = document.getElementById("mouseoverHighlightColor");
	showButton = document.getElementById("showButton");
	showTooltips = document.getElementById("showTooltips");
	savePasswords = document.getElementById("savePasswords");
	showButtonAlways = document.getElementById("showButtonAlways");
	showButtonAlways.addEventListener('click',setShowButton);
	showButtonHover = document.getElementById("showButtonHover");
	showButtonHover.addEventListener('click',setShowButton);

	supportForumButton = document.getElementById('supportForumButton'); 
	supportForumButton.addEventListener('click',supportLink);

	homepageButton = document.getElementById('homepageButton');
	homepageButton.addEventListener('click',homepageLink);

	
	tireDeleteSelected = document.getElementById('tireDeleteSelected');
	tireDeleteSelected.addEventListener('click', deleteSelected);
	tireDeleteSelected.disabled = true;
	tireSelectAll = document.getElementById('tireSelectAll');
	tireSelectAll.addEventListener('click', selectAll);
	tireTable = document.getElementById('tireTable');
	
	getVersion();
	
	checkInterval = document.getElementById('checkInterval');
	hoverDelay = document.getElementById('hoverDelay');
	tireOptionsLoad();
	return true;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
	if(request.activeTab){
		activeTab = request.activeTab;
	}
});

function tireUnload(){
	tireSave();
	return true;
}

function tireSave(){
	// Save tireData to storage
	tireData.checkIntervalTime = checkInterval.value;
	tireData.highlightFields = highlightFields.checked;
	tireData.highlightColor = highlightColor.value;
	tireData.highlightOnMouseover = highlightOnMouseover.checked;
	tireData.mouseoverHighlightColor = mouseoverHighlightColor.value;
	tireData.showButtons = showButton.checked;
	tireData.showTooltips = showTooltips.checked;
	tireData.savePasswords = savePasswords.checked;
	if(showButtonAlways.checked) tireData.showButtonType = "always";
	if(showButtonHover.checked) tireData.showButtonType = "hover";
	tireData.hoverDelay = hoverDelay.value;
	saveToStorage(function(){
		chrome.runtime.sendMessage({type: 'highlightFields', checked: tireData.highlightFields}, function(response){});
		chrome.runtime.sendMessage({type: 'showButtons', checked: tireData.showButtons}, function(response){});
	});
	return true;
}

function tireClear(){
	// Clear storage
	chrome.storage.local.clear(function(){
		initGlobalData();
		saveToStorage(function(){
			tireOptionsInit();
			buildTable();
			tireShow();
		});
	});
	return true;
}

function tireExit(){
	window.close();
	return true;
}

function tireOptionsLoad(){
	loadFromStorage(function(){
		checkInterval.value = tireData.checkIntervalTime;
		hoverDelay.value = tireData.hoverDelay;
		highlightFields.checked = tireData.highlightFields;
		highlightColor.value = tireData.highlightColor;
		highlightOnMouseover.checked = tireData.highlightOnMouseover;
		mouseoverHighlightColor.value = tireData.mouseoverHighlightColor;
		showButton.checked = tireData.showButtons;
		showTooltips.checked = tireData.showTooltips;
		savePasswords.checked = tireData.savePasswords;
		if(tireData.showButtonType == "always") showButtonAlways.checked = true;
		if(tireData.showButtonType == "hover") showButtonHover.checked = true;
		buildTable();
	});
	return true;
}

function tireShow(){
	var msgBox = document.getElementById('storageBox')
	loadFromStorage(function(){
		//log("Storage",tireData)
		msgBox.value = JSON.stringify(tireData,null,'\t');
	});
	return true;
}

function buttonCheck(){
	// Enable 'tireDeleteSelected' if at least one select box is checked
	tireDeleteSelected.disabled = true;
	var selections = tireTable.getElementsByTagName('input');
	for(var i=0; i<selections.length; i++){
		var chkbox = selections[i];
		if(chkbox.checked){
			tireDeleteSelected.disabled = false;
			break;
		}
	}		
	return true;
}

function deleteSelected(){
	var selections = tireTable.getElementsByTagName('input');
	for(var i=0; i<selections.length; i++){
		var chkbox = selections[i];
		if(chkbox.checked){
			TireDb({url: chkbox.url}).remove();
		}
	}
	tireDeleteSelected.disabled = true;
	saveToStorage(function(){	
		clearTable();
		buildTable();
	});
	return true;
}

function selectAll(){
	var selections = tireTable.getElementsByTagName('input');
	var which;
	
	// Toggle button text
	if(tireSelectAll.innerText == 'Select all'){
		which = true;
		tireSelectAll.innerText = 'Deselect all';
	}else{
		which = false;
		tireSelectAll.innerText = 'Select all';
	}
	for(var i=0; i<selections.length; i++){
		var chkbox = selections[i];
		chkbox.checked = which;
	}	
	tireDeleteSelected.disabled = false;	
	return true;
}

function clearTable(){
	// Remove existing rows
	var rows = tireTable.getElementsByTagName("tr");
	while(rows.length >1){
		var last = tireTable.lastElementChild;
//log("Removing",last)
		tireTable.removeChild(last);
	}
	return true;
}

function buildTable(){
	clearTable();
	// TireDb: url, title, id, text
	var pages = TireDb().order('title').distinct('url','title');
	var tot = 0;
	for(var i=0; i<pages.length; i++){
		var tireArr = pages[i];
		var url = tireArr[0];
		var title = tireArr[1];
		if(title == '') title = "(Untitled)";
		var cnt = TireDb({url: url}).count();
		
		var row = document.createElement('tr');
		row.className = "tireTabelRow";
		
		var cell1 = document.createElement('td');	// Title
		cell1.id = "cell1-"+i.toString();
		cell1.className = "tireTabelTitle";
		var maxChars = 85;
		if(title.length > maxChars) title = title.substr(0,maxChars/2)+"..."+title.substr(-1 * (maxChars/2));
		//cell1.innerText = title;
		cell1.title = url;
		var link = document.createElement('a');
		link.addEventListener('click',function(e){
			window.top.chrome.tabs.create({url: this.href});
			e.preventDefault();
		});
		link.className = "tireLink";
		link.href = url;
		link.innerText = title;
		cell1.appendChild(link);
		row.appendChild(cell1);
		
		var cell2 = document.createElement('td');	// Count
		cell2.id = "cell2-"+i.toString();
		cell2.className = "tireTabelCnt";
		cell2.innerText = cnt.toString();
		row.appendChild(cell2);
		
		var cell3 = document.createElement('td');	// Select checkbox
		cell3.id = "cell3-"+i.toString();
		cell3.className = "tireTabelSelect";
		var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
		checkbox.url = url;
		checkbox.checked = false;
		checkbox.addEventListener('click',function(){
			buttonCheck();
		});
		checkbox.addEventListener('mouseenter',function(event){
			var titleCell = event.relatedTarget.parentNode.childNodes[0];
			titleCell.style.textDecoration = 'underline';
		});
		checkbox.addEventListener('mouseleave',function(event){
			var titleCell = event.relatedTarget.parentNode.childNodes[0];
			titleCell.style.textDecoration = 'none';
		});

		cell3.appendChild(checkbox);
		row.appendChild(cell3);
		
		tireTable.appendChild(row);
		tot++;
	}
	var totCnt = document.getElementById('totCnt');
	totCnt.innerText = totCnt.innerText = "Total pages: "+tot.toString();
	return true;
}

function setShowButton(){
	if(showButtonAlways.checked) tireData.showButtonType = "always";
	if(showButtonHover.checked) tireData.showButtonType = "hover";
//log("tireData.showButtonType",tireData.showButtonType)	
	return true;
}

function supportLink(){
	window.top.chrome.tabs.create({url: 'http://www.customsoftwareconsult.com/forum/viewforum.php?f=19&sid=a111f40feb799db3999c0395d04184ab'});
	return true;
}

function homepageLink(){
	window.top.chrome.tabs.create({url: 'http://softwarebychuck.com/TIRE/TIREhomepage.html'});
	return true;
}

function getVersion(){
	// Display currently installed version number
	var manifest = new XMLHttpRequest();
	manifest.open("get", "/manifest.json", true);
	manifest.onreadystatechange = function(e){
		if (manifest.readyState == 4){
			document.getElementById('installedVersion').innerHTML = JSON.parse(manifest.responseText).version; 
		} 
	};
	manifest.send({});
	return true;
}
