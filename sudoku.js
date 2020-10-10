var MAX = 9;

var done = 0;
var stats = {"backtracks":0,"iterations":0,"time":0};

var free_cell = false; /* this is the cell we are working at */

function Cell(x,y) {
	this.value = 0;
	this.x = x;
	this.y = y;
	this.avail = [];
	this.countAvail = function() {
		/* 
			get values available for this cell
			based on column, row and block values
		*/
		var free = [1,1,1,1,1,1,1,1,1,1]; /* MAX+1 values */
		this.avail = [];
		for (var i=0;i<MAX;i++) {
			free[cells[i][this.y].value] = 0;
		} /* row */
		for (var j=0;j<MAX;j++) {
			free[cells[this.x][j].value] = 0;
		} /* column */
		/* block - more difficult */
		var start_x = (this.x < 3 ? 0 : this.x > 5 ? 6 : 3);
		var start_y = (this.y < 3 ? 0 : this.y > 5 ? 6 : 3);
		var end_x = start_x+3;
		var end_y = start_y+3;
		for (var i=start_x;i<end_x;i++)
			for (var j=start_y;j<end_y;j++) {
				free[cells[i][j].value] = 0;
			}
		
		/* finish */
		for (var i=1;i<=MAX;i++) {
			if (free[i]) { this.avail.push(i); }
		}
	}
	
}

function solve() {
/*
alert(free_cell.x+' '+free_cell.y+' '+free_cell.avail.length);
return;
*/
	stats.iterations++;
	/* main recursive routine */
	if (!free_cell) { done = 1; } /* no free cell to fill - victory */
	if (done) { return; } /* shut down after successful run */
	
	var cell = free_cell; /* work with this cell */
	var len = cell.avail.length; /* this many options */
	if (!len) {
		stats.backtracks++;
		return; /* backtrack */
	}
	
	for (var i=0;i<len;i++) {
		cell.value = cell.avail[i];
		get_free_candidate();
		solve();
		if (done) return;
	}
	cell.value = 0; /* return zero before leaving */
}

function get_free_candidate() {
	free_cell = false;
	var min = MAX+1;
	for (var i=0;i<MAX;i++) 
		for (var j=0;j<MAX;j++) {
			if(!(cells[i][j].value)) { 
				cells[i][j].countAvail();
				if (cells[i][j].avail.length < min) {
					min = cells[i][j].avail.length;
					free_cell = cells[i][j];
				} /* if is lowest */
			} /* if is empty */
		} /* for all cells */
}

function start_solving() {
	done = 0;
	html2cells(); /* get input */
	
	var d1 = new Date();
	var t1 = d1.getTime();

	get_free_candidate();
	solve();
	
	if (done) {
		/* stats */
		var d2 = new Date();
		var t2 = d2.getTime();
		cells2html();
		stats.time = (t2-t1)/1000;
		var t = stats.time / 1000; /* seconds */
		var score = stats.iterations / stats.time;
		alert("BENCHMARK: "+Math.round(score*100)/100+" ips\n\n"+
			  "iterations: "+stats.iterations+"\n"+
			  "backtracks: "+stats.backtracks+"\n"+
			  "time: "+stats.time+" s");
	} else {
		alert('No solution possible.');
	}
}

var cells = {};

function attach(element,event,callback) {
	if (element.addEventListener) {
		/* gecko */
		element.addEventListener(event,callback,false);
	} else if (element.attachEvent) {
		/* ie */
		element.attachEvent("on"+event,callback);
	} else {
		/* ??? */
		element["on"+event] = callback;
	}
}

function detach(element,event,callback) {
	if (element.removeEventListener) {
		/* gecko */
		element.removeEventListener(event,callback,false);
	} else if (element.detachEvent) {
		/* ie */
		element.detachEvent("on"+event,callback);
	} else {
		/* ??? */
		element["on"+event] = false;
	}
}

function attach_edit(elm) {
	var ref = function() {
		var inp = document.createElement("input");
		inp.setAttribute("size","1");
		inp.setAttribute("type","number");
		inp.setAttribute("min","1");
		inp.setAttribute("max","9");
		inp.classList.add("edit");
		inp.value = elm.innerHTML;
		while (elm.firstChild) { elm.removeChild(elm.firstChild); }
		elm.appendChild(inp);
		inp.focus();
		inp.select()
		var callback = function(event) {
			var val = inp.value;
			elm.removeChild(inp);
			elm.innerHTML = val;
			detach(document,"mousedown",callback);
		}
		attach(document,"mousedown",callback);
	}
	elm.style.cursor = "pointer";
	attach(elm,"click",ref);
}

function init() {
	for (var i=0;i<MAX;i++) {
		cells[i] = [];
		for (var j=0;j<MAX;j++) {
			cells[i][j] = new Cell(i,j);
		}
	}
}

function cells2html() {
	for (var i=0;i<MAX;i++)
		for (var j=0;j<MAX;j++) {
			var id = i+"_"+j;
			document.getElementById(id).innerHTML = (cells[i][j].value ? cells[i][j].value : "");
		}
}

function html2cells() {
	for (var i=0;i<MAX;i++)
		for (var j=0;j<MAX;j++) {
			var id=i+"_"+j;
			var val = document.getElementById(id).innerHTML;
			var newval = parseInt(val);
			cells[i][j].value = ( isNaN(newval) ? 0 : newval);
		}
	cells2html();
}

function init_page() {
	init(); /* cells */
	var table = document.getElementsByTagName("tbody")[0];
	for (var j=0;j<MAX;j++) {
		var tr = document.createElement("tr");
		for (var i=0;i<MAX;i++) {
			var id = i+"_"+j;
			var td = document.createElement("td");
			/* border stuff */
			if (i==3) { td.className += " left "; }
			if (i==5) { td.className += " right "; }
			if (j==3) { td.className += " top "; }
			if (j==5) { td.className += " bottom "; }
			td.id = id;
			attach_edit(td);
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}
	load_defaults();
	cells2html();
}

function load_defaults() {
	/* pre-made sudoku */
	

	
	cells[1][0].value = 2;
	cells[5][0].value = 8;
	cells[8][0].value = 3;
	cells[4][1].value = 4;
	cells[2][2].value = 4;
	cells[3][2].value = 9;
	cells[6][2].value = 6;
	cells[7][2].value = 1;
	
	cells[3][3].value = 6;
	cells[4][3].value = 1;
	cells[6][3].value = 4;
	cells[6][4].value = 9;
	cells[8][4].value = 5;
	cells[1][5].value = 9;
	cells[2][5].value = 3;
	cells[8][5].value = 1;

	cells[2][6].value = 6;
	cells[3][6].value = 7;
	cells[7][6].value = 2;
	cells[8][6].value = 9;
	cells[1][7].value = 1;
	cells[0][8].value = 3;
	cells[4][8].value = 5;
	cells[6][8].value = 7;
	
}
