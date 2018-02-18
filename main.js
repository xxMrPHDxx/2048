import Grid from './grid.js';

const canvas = document.querySelector('canvas#Game');
const ctx = canvas.getContext('2d');

export function color(...args){
	return args.length === 1 ? `rgb(${args[0]},${args[0]},${args[0]})` :
			args.length === 3 ? `rgb(${args[0]},${args[1]},${args[2]})` : '#000000';
}

let grid = new Grid();

function update(){
	ctx.fillStyle = color(51);
	ctx.fillRect(0,0,canvas.width,canvas.height);

	grid.draw(ctx);

	requestAnimationFrame(update);
}
update();

window.onkeydown = function(e){
	const code = e.code;
	if(code === 'KeyD'){
		grid.slideHorizontally();
	}else if(code === 'KeyA'){
		grid.slideHorizontally(false);
	}else if(code === 'KeyW'){
		grid.slideVertically(false);
	}else if(code === 'KeyS'){
		grid.slideVertically();
	}
}