// propsConsole.js
// Chuck Baker
// Display all properties, functions, and objects of an object

	function logMsg(msg) {
		msg = "TIRE MSG: "+msg;
		console.log(msg);
		return true;
	}
		
	function propsConsole(obj,title,ignoreProperties,ignoreFunctions,ignoreObjects,expandObjs,sort){
		if(title != null){
			title = "("+title+")";
		}else{
			title = "";
		}
		if (obj === null) {
			logMsg("propsConsole called with null argument: "+title+"\n");
			return false;
		}
		if (obj === undefined) {
			logMsg("propsConsole called with undefined argument: "+title+"\n");
			return false;
		}
		var tmp, line, pVal, type, msg, attrb = [], func = [], objects = [];
		msg = "propsConsole: "+title+"\ntypeof '"+obj+"': ("+typeof obj+"), "+((sort) ? "Sorted" : "Unsorted")+"\n";
		for(var property in obj){
			line = property;
			try{
				pVal = obj[property];
			}catch(err){
				pVal = "(Unreachable)  "+err;
			}
			try{
				type = typeof obj[property];
			}catch(e){
				type = "Unknown";
			}
			try{
				tmp = line + " = "+pVal;
			}catch(e){
				tmp = "(Unreachable)";
			}
			switch(type){
				case 'function':
					if(!ignoreFunctions) func.push(tmp);
					break;
				case 'object':
					if(ignoreObjects) continue;
					try{
						var props = JSON.stringify(obj[property]);
						if(expandObjs && props != "null") tmp += " --> "+props;
					}catch(err){;;}
					objects.push(tmp);
					break;
				default:
					if(!ignoreProperties) attrb.push(tmp);
					break;
			}
		} 
		if(func.length == 0) func.push("(none)");
		if(objects.length == 0) objects.push("(none)");
		if(attrb.length == 0) attrb.push("(none)");

		if(sort){
			attrb.sort();
			func.sort();
			objects.sort();
		}

		if(!ignoreProperties){
			msg += "\n*** PROPERTIES/ATTRIBUTES ***\n";
			for(var i in attrb){
				msg += attrb[i]+"\n";
			}
		}
		
		if(!ignoreFunctions){
			msg += "\n*** FUNCTIONS ***\n";
			for(var i in func){
				msg += func[i]+"\n";
			}
		}
		
		if(!ignoreObjects){
			msg += "\n*** OBJECTS ***\n";
			for(var i in objects){
				msg += objects[i]+"\n";
			}
		}
		logMsg(msg);
		return true;
	}
