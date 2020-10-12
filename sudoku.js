const MAX = 9;
let stats = {backtracks:0, iterations:0, time:0};
let cells = [];

class Cell {
	constructor(x, y, node) {
		this.value = 0;
		this.x = x;
		this.y = y;
		this.avail = [];
		this.node = node;
	}

	countAvail() {
		/*
			get values available for this cell
			based on column, row and block values
		*/
		let free = [1,1,1,1,1,1,1,1,1,1]; // MAX+1 values

		for (let i=0;i<MAX;i++) { // row
			free[cells[i][this.y].value] = 0;
		}

		for (let j=0;j<MAX;j++) { // column
			free[cells[this.x][j].value] = 0;
		}

		// block - more difficult
		let start_x = (this.x < 3 ? 0 : this.x > 5 ? 6 : 3);
		let start_y = (this.y < 3 ? 0 : this.y > 5 ? 6 : 3);
		let end_x = start_x+3;
		let end_y = start_y+3;
		for (let i=start_x;i<end_x;i++)
			for (let j=start_y;j<end_y;j++) {
				free[cells[i][j].value] = 0;
			}

		// finish
		this.avail = [];
		for (let i=1;i<=MAX;i++) {
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

	let cell = get_free_candidate();
	if (!cell) { return true; } // no free cell to fill - victory

	let len = cell.avail.length; // this many options
	if (!len) {
		stats.backtracks++;
		return false; // backtrack
	}

	for (let i=0;i<len;i++) {
		cell.value = cell.avail[i];
		let solved = solve();
		if (solved) { return true; }
	}

	cell.value = 0; // return zero before leaving
	return false;
}

function get_free_candidate() {
	let best_cell = null;
	let best = MAX+1;
	for (let i=0;i<MAX;i++) {
		for (let j=0;j<MAX;j++) {
			let cell = cells[i][j];
			if (cell.value) { continue; }

			cell.countAvail();
			if (cell.avail.length < best) {
				best = cell.avail.length;
				best_cell = cell;
			}
		}
	}
	return best_cell;
}

function start_solving() {
	html2cells(); /* get input */

	let t1 = performance.now();
	let solved = solve();
	let t2 = performance.now();

	if (solved) {
		cells2html();
		stats.time = (t2-t1)/1000;
		alert(`BENCHMARK: ${Math.round(stats.iterations/stats.time)} ips

	iterations: ${stats.iterations}
	backtracks: ${stats.backtracks}
	time: ${stats.time} s`);
	} else {
		alert("No solution possible.");
	}
}

function attach_edit(node) {
	node.style.cursor = "pointer";
	node.addEventListener("click", () => {
		let inp = document.createElement("input");
		inp.size = 1;
		inp.type = "text";
		inp.style.width = "20px";
		inp.style.border = "1px solid #000";
		inp.style.textAlign = "center";
		inp.value = node.textContent;
		node.innerHTML = "";
		node.appendChild(inp);
		inp.focus();

		function done() {
			node.innerHTML = "";
			node.textContent = inp.value;
			document.removeEventListener("mousedown", done);
		}
		document.addEventListener("mousedown", done);
	});
}

function init() {
	const table = document.querySelector("tbody");
	for (let j=0;j<MAX;j++) {
		let tr = table.insertRow();
		let row = [];
		cells.push(row);

		for (let i=0;i<MAX;i++) {
			let td = tr.insertCell();

			if (i==3) { td.classList.add("left"); }
			if (i==5) { td.classList.add("right"); }
			if (j==3) { td.classList.add("top"); }
			if (j==5) { td.classList.add("bottom"); }

			attach_edit(td);

			row.push(new Cell(j, i, td));
		}
	}
}

function cells2html() {
	for (let i=0;i<MAX;i++) {
		for (let j=0;j<MAX;j++) {
			cells[i][j].node.textContent = (cells[i][j].value ? cells[i][j].value : "");
		}
	}
}

function html2cells() {
	for (let i=0;i<MAX;i++) {
		for (let j=0;j<MAX;j++) {
			let cell = cells[i][j];
			let val = Number(cell.node.textContent);
			cells[i][j].value = (isNaN(val) ? 0 : val);
		}
	}
	cells2html();
}

function load_defaults() {
	// pre-made sudoku
	cells[0][1].value = 2;
	cells[0][5].value = 8;
	cells[0][8].value = 3;
	cells[1][4].value = 4;
	cells[2][2].value = 4;
	cells[2][3].value = 9;
	cells[2][6].value = 6;
	cells[2][7].value = 1;

	cells[3][3].value = 6;
	cells[3][4].value = 1;
	cells[3][6].value = 4;
	cells[4][6].value = 9;
	cells[4][8].value = 5;
	cells[5][1].value = 9;
	cells[5][2].value = 3;
	cells[5][8].value = 1;

	cells[6][2].value = 6;
	cells[6][3].value = 7;
	cells[6][7].value = 2;
	cells[6][8].value = 9;
	cells[7][1].value = 1;
	cells[8][0].value = 3;
	cells[8][4].value = 5;
	cells[8][6].value = 7;
}

init();
load_defaults();
cells2html();
