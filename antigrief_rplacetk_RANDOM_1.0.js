let colorArray = ["6d001a","be0039","ff4500","ffa800","ffd635","fff8b8","00a368","00cc78","7eed56","00756f","009eaa","00ccc0","2450a4","3690ea","51e9f4","493ac1","6a5Cff","94b3ff","811e9f","b44ac0","e4abff","de107f","ff3881","ff99aa","6d482f","9c6926","ffb470","000000","515252","898d90","d4d7d9","ffffff"];

let selection_xy1 = [481, 430];
let selection_xy2 = [786, 475];

let last_attempt = Date.now() - 5000;

function getColorDistance(hex1, hex2) {
	let dist = 0;
	dist += Math.abs(parseInt(hex1.substr(0,2),16) - parseInt(hex2.substr(0,2),16));
	dist += Math.abs(parseInt(hex1.substr(2,2),16) - parseInt(hex2.substr(2,2),16));
	dist += Math.abs(parseInt(hex1.substr(4,2),16) - parseInt(hex2.substr(4,2),16));
	return dist;
}

function getColorFromHex(hex) {
  let mindist = -1;
  let minval = -1;
  for (var i in colorArray) {
    if (colorArray[i] === hex) {
      return i;
    }
	let dist = getColorDistance(colorArray[i],hex);
	if( mindist === -1 || dist < mindist ) {
		mindist = dist;
		minval = i;
	}
  }
  console.log(hex);
  console.log(minval);
  return minval;
}


String.prototype.convertToRGB = function () {
  let str = this.replace("#", "");
  if (str.length != 6) {
    throw "Only six-digit hex colors are allowed.";
  }
  var aRgbHex = str.match(/.{1,2}/g);
  var aRgb = [
    parseInt(aRgbHex[0], 16),
    parseInt(aRgbHex[1], 16),
    parseInt(aRgbHex[2], 16),
  ];
  return aRgb;
};

function getRnd(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function automate(yourX, yourY, colorID) {
	navigate(yourX, yourY);
	colorPick(colorID);
	put();
}

function navigate(yourX, yourY) {
	x = yourX;
	y = yourY;
	transform();
	zoomIn();
	showPalette();
}

function colorPick(colorID){
	target = document.getElementById("colors").children[colorID]
	let i = [...document.getElementById("colors").children].indexOf(target)
	if(i<0)return
	let el = document.getElementById("colors").children[PEN]
	if(el){
		el.classList.remove('sel')
	}
	PEN = i
	audios.selectColor.run()
	canvselect.style.background = target.style.background
	target.classList.add('sel')
	pok.classList.add('enabled')
	canvselect.children[0].style.display='none';
	canvselect.style.outline='8px white solid';
	canvselect.style.boxShadow='0px 2px 4px 0px rgb(0 0 0 / 50%)';
}

function getColorXY(yourX, yourY) {
	return board[yourY*2000 + yourX];
}

function placePixelAntiGrief(xy1) {
  let xl = getRnd(0, x_length);
  let yl = getRnd(0, y_length);
  console.log(xl);
  console.log(yl);
  let toHex = plan[yl][xl];
  let fromHex = getColorXY(xl + xy1[0], yl + xy1[1]);
  // look for places randomly and find one that is off template
  from = fromHex;
  fix = getColorFromHex(toHex);
  while (fix == from || fix === -1) {
    xl = getRnd(0, x_length);
    yl = getRnd(0, y_length);
    toHex = plan[yl][xl];
    fromHex = getColorXY(xl + xy1[0], yl + xy1[1]);
	from = fromHex;
    fix = getColorFromHex(toHex);
  }
  automate(xl + xy1[0], yl + xy1[1], parseInt(fix));
  // success message
  console.log(`Placed: ${colorArray[fix]} (${[fix]})`);
  console.log(`Replaced: ${colorArray[from]} (${[from]})`);
  console.log(`coordinates: [${xl + selection_xy1[0]},${yl + selection_xy1[1]}]`);
}

function debugNext(xy1) {
  let xl = getRnd(0, x_length);
  let yl = getRnd(0, y_length);
  console.log(xl);
  console.log(yl);
  let toHex = plan[yl][xl];
  let fromHex = getColorXY(xl + xy1[0], yl + xy1[1]);
  // look for places randomly and find one that is off template
  from = fromHex;
  fix = getColorFromHex(toHex);
  while (fix == from || fix === -1) {
    xl = getRnd(0, x_length);
    yl = getRnd(0, y_length);
    toHex = plan[yl][xl];
    fromHex = getColorXY(xl + xy1[0], yl + xy1[1]);
	from = fromHex;
    fix = getColorFromHex(toHex);
  }
  navigate(xl + xy1[0], yl + xy1[1]);
  zoomIn();
  showPalette();
  colorPick(parseInt(fix));

  // success message
  console.log(`Placed: ${colorArray[fix]} (${[fix]})`);
  console.log(`Replaced: ${colorArray[from]} (${[from]})`);
  console.log(`coordinates: [${xl + selection_xy1[0]},${yl + selection_xy1[1]}]`);
}

function getPixel(canvas2, yourX, yourY) {
  return canvas2.getContext("2d").getImageData(yourX, yourY, 1, 1).data;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function pixelToHex(pixel) {
  return rgbToHex(pixel[0], pixel[1], pixel[2]);
}

var x_rs = 1444;
var x_re = 2361;

var y_rs = 1291;
var y_re = 1431;

var x_length = parseInt((x_re - x_rs) / 3);
var y_length = parseInt((y_re - y_rs) / 3);

var plan = new Array(y_length);

for (var yourY = 0; yourY < y_length; yourY++) {
  plan[yourY] = new Array(x_length);
}

var canvas2 = document.createElement("canvas");
canvas2.id = "canvas2";
document.body.append(canvas2);
var img = new Image();

function refresh() {
  img.src =
    "https://raw.githubusercontent.com/Ender0112/Transgender-Flag-Template/main/place.png";
  img.crossOrigin = "Anonymous";
  return img;
}

function reload() {
  canvas2.width = img.width;
  canvas2.height = img.height;
  canvas2.getContext("2d").drawImage(img, 0, 0, img.width, img.height);
  for (var yourY = 0; yourY < y_length; yourY++) {
    for (var yourX = 0; yourX < x_length; yourX++) {
      plan[yourY][yourX] = pixelToHex(getPixel(canvas2, x_rs + yourX * 3, y_rs + yourY * 3));
    }
  }

  placePixelAntiGrief(selection_xy1, selection_xy2);
}

img.addEventListener("load", reload);

async function Main() {
  while (true) {
    await new Promise((resolve, reject) => setTimeout(resolve, 1000));
    if (Date.now() - last_attempt > 10000) {
      sleep(getRnd(1000, 2000));
      last_attempt = Date.now();
      img = refresh();
    }
  }
}

Main();
