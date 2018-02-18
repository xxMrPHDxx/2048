import {color} from './main.js';

Array.prototype.random = function(){
	return this[Math.random() * this.length | 0];
}

export default class Grid{
	constructor(row=4,col=4){
		this.row = row;
		this.col = col;
		this.cell = Array(row).fill().map(() => Array(col).fill(0));

		this.padding = 5;
		this.size = 100 - this.padding * 2;

		this.spawnTime = false;
		this.spawnTimer = 300;
		this.spawnCount = 300;
		this.newSpawn = [];

		window.newSpawn = this.newSpawn;

		this.tile = document.createElement('img');
		fetch('img/tile.png').then(res => this.tile.src = res.url);

		this.spawn(2,[2]);
	}

	forEach(callback){
		this.cell.forEach((row,i) => {
			row.forEach((cell,j) => {
				callback(cell,i,j,this.cell);
			});
		});
	}

	spawn(total=1){
		let zeros = [];
		this.forEach((cell,row,col) => {
			if(cell === 0){
				zeros.push({row,col});
			}
		});

		if(zeros.length <= 0) return;

		for(let i=0;i<total;i++){
			let r = zeros.random();
			this.cell[r.row][r.col] = [2,4].random();
			zeros.splice(i,1);
		}
	}

	slideHorizontally(right=true){
		const history = Array(this.row).fill().map(() => Array(this.col).fill(0));
		this.forEach((val,row,col) => history[row][col] = val);

		this.cell.forEach((row,i) => {
			const nonzero = row.filter((val) => val !== 0);

			for(let n=0;n<nonzero.length;n++){
				const index = right ? nonzero.length-1-n : n;
				const condition = right ? nonzero.length-1 : 0;
				const next = right ? 1 : -1;

				if(index === condition) continue;
				
				if(nonzero[index] === nonzero[index+next]){
					nonzero[index + next] *= 2;
					nonzero[index] = 0;
					this.spawnTime = true;
					this.newSpawn.push({row:i,col:index+next});
					n++;
				}
			}

			const nnonzero = nonzero.filter(value => value !== 0);
			const zero = Array(this.col - nnonzero.length).fill(0);

			if(right){
				this.cell[i] = zero.concat(nnonzero);
			}else{
				this.cell[i] = nnonzero.concat(zero);
			}
		});

		this.forEach((val,row,col) => {
			if(val !== history[row][col]){
				this.spawnTime = true;
			}
		});
	}

	slideVertically(down=true){
		const history = Array(this.row).fill().map(() => Array(this.col).fill(0));
		this.forEach((val,row,col) => history[row][col] = val);

		let cw = Array(this.col).fill().map(() => Array(this.row).fill(0));
		let ccw = Array(this.col).fill().map(() => Array(this.row).fill(0));
		this.forEach((value,col,row) => {
			cw[row][col] = value;
			ccw[row][col] = value;
		});

		if(down){
			ccw.forEach(col => col.reverse());
		}else{
			cw.forEach(row => row.reverse());
		}

		let grid = (down) ? cw : ccw;

		grid.forEach((row,i) => {
			const nonzero = row.filter((val) => val !== 0);

			for(let n=0;n<nonzero.length;n++){
				const index = down ? nonzero.length-1-n : n;
				const condition = down ? nonzero.length-1 : 0;
				const next = down ? 1 : -1;

				if(index === condition) continue;
				
				if(nonzero[index] === nonzero[index+next]){
					nonzero[index + next] *= 2;
					nonzero[index] = 0;
					this.spawnTime= true;
					this.newSpawn.push({row:index+next,col:i});
					n++;
				}
			}

			const nnonzero = nonzero.filter(value => value !== 0);
			const zero = Array(this.col - nnonzero.length).fill(0);

			if(down){
				grid[i] = zero.concat(nnonzero);
			}else{
				grid[i] = nnonzero.concat(zero);
			}
		});

		this.forEach((cell,row,col) => {
			this.cell[row][col] = grid[col][row];
		});
		
		this.forEach((val,row,col) => {
			if(val !== history[row][col]){
				this.spawnTime = true;
			}
		});
	}

	update(){
		if(this.spawnTimer < this.spawnCount){
			this.spawnTimer += 30;
		}

		if(this.spawnTime){
			this.spawnTimer = 0;
			this.spawn(Math.random() * 2 | 0 + 1);
			this.spawnTime = !this.spawnTime;
		}
	}

	draw(ctx){
		this.update();

		this.forEach((cell,row,col) => {
			const x = col * 100 + this.padding;
			const y = row * 100 + this.padding;
			const cx = col * 100 + 50;
			const cy = row * 100 + 50;
			const normalSize = this.size - this.padding / 2;
			const nSize = (this.size - this.padding / 2) * this.spawnTimer / this.spawnCount;

			let special = false;
			let index = false;
			this.newSpawn.forEach(spawn => {
				if(spawn.row === row && spawn.col === col){
					special = true;
				}
			});
			if(special){
				ctx.drawImage(this.tile,cx - nSize / 2,cy - nSize / 2,nSize,nSize);
				this.newSpawn.splice(index,1);
			}else{
				ctx.drawImage(this.tile,cx - normalSize / 2,cy - normalSize / 2,normalSize,normalSize);
			}

			if(cell === 0) return;

			const size = 65 - 3 * log(2,cell);
			const r = cell 	* 64 % 255;
			const g = cell 	* 512 % 255;
			const b = cell 	* 2048 % 255;
			ctx.fillStyle = color(r,g,b);
			ctx.font = `${size}px Arial`;
			ctx.textAlign = 'center';
			ctx.fillText(cell,x + this.size / 2,y + 3 * this.size / 4 - (64 - size) / 3);
		});
	}
}

function log(base,num){
	return Math.log(num) / Math.log(base);
}