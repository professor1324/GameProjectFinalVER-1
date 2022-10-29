/*

- Copy your game project code into this file
- for the p5.Sound library look here https://p5js.org/reference/#/libraries/p5.sound
- for finding cool sounds perhaps look here
https://freesound.org/

--------------------
FINAL GAME PROJECT - MIAO FUKAI
--------------------

*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var clouds;
var mountain;
var canyon;
var trees_x;
var collectable;

var game_score;
var flagpole;
var lives;
var lifeToken;
var gameover;
var gameDiode;
var platforms;
var enemies;

var BGM;
var charDieSound;
var gameoverSound;
var jumpSound;
var collectSound;
var LevelcompleteSound;
var gotHitSound;

function preload()
{
    soundFormats('mp3','wav');
    
    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
    collectSound = loadSound('assets/smb_collect.wav');
    collectSound.setVolume(0.18);
    LevelcompleteSound = loadSound('assets/smb_stage_clear.wav');
    LevelcompleteSound.setVolume(0.3);
    BGM = loadSound('assets/BGM.mp3');
    BGM.setVolume(0.08);
    charDieSound = loadSound('assets/smb_CharDie.wav');
    charDieSound.setVolume(0.18);
    gameoverSound = loadSound('assets/smb_gameover.wav');
    gameoverSound.setVolume(0.3);
    gotHitSound = loadSound('assets/gotHit.mp3');
    gotHitSound.setVolume(0.2);
}


function setup()
{
	createCanvas(1024, 576);
    floorPos_y = height * 3/4;
	startGame();
	lives = 3;
    BGM.loop();
    gameover = false
    gameDiode = false
}

function draw()
{
	background(100, 155, 255); // fill the sky blue

	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height/4); // draw some green ground

	//moving effect
	push();
	translate(scrollPos,0);

	// Draw clouds.
	drawClouds();
	animateClouds();

	// Draw mountains.
	drawMountains();

	// Draw trees.
	drawTrees();

	// Draw canyons.
	for ( var i = 0; i < canyon.length; i++ )
	{
		checkCanyon(canyon[i]);

		drawCanyon(canyon[i]);
	};

	// Draw collectable items.
	for ( var i = 0; i < collectable.length; i++ )
	{
		if (collectable[i].isFound == false)
		{
			drawCollectable(collectable[i]);
			checkCollectable(collectable[i]);
		}
	};

	// Draw Flagpole.
	renderFlagpole();

    // Draw Platforms
    for(i = 0; i < platforms.length; i++)
    {
        platforms[i].draw();
    }

    for(i = 0; i< enemies.length; i++)
    {
        enemies[i].draw();
        var isContact = enemies[i].checkContact(gameChar_world_x,gameChar_y);

        if(isContact)
        {
            if(lives > 0)
            {
                lives -= 1;
                gotHitSound.play();
                startGame();
                break;
            }
        }
    }

	strokeWeight();	
	pop();

	// Draw game character.
	
	drawGameChar();

	// Score Counter

	noStroke();
	if(game_score > 5)
	{
		fill(0,255,0);
		textSize(20);
		text("Score: " + game_score + " Full Loot!", random(19,21), random(19,21));
	}
	else 
	{
		fill(255);
		textSize(16);
		text("Score: " + game_score, 20, 20);
	}

	// Lives Counter && Life Token

	if(lives < 2 && lives > 0)
	{
		fill(255,22,122);
		textSize(20);
		text("Lives: " + lives + " Careful!", random(width - 191, width - 189), random(19, 21));
		drawLifeToken(random(lifeToken[1].x_pos - 2, lifeToken[1].x_pos + 2), random(lifeToken[1].y_pos - 2, lifeToken[1].y_pos + 2), lifeToken[1].size);
	}
	else if(lives > 1 && lives < 3)
	{
		fill(255);
		textSize(16);
		text("Lives: " + lives, width - 70, 20);

		fill(200,100,100);
		for ( var i = 1; i < lifeToken.length; i++)
		{
			drawLifeToken(lifeToken[i].x_pos, lifeToken[i].y_pos, lifeToken[i].size);
		}
	}
	else if(lives > 2)
	{
		fill(255);
		textSize(16);
		text("Lives: " + lives, width - 70, 20);

		fill(200,100,100);
		for ( var i = 0; i < lifeToken.length; i++)
		{
			drawLifeToken(lifeToken[i].x_pos, lifeToken[i].y_pos, lifeToken[i].size);
		}
	}

	// Game Over

	if(lives < 1)
	{
		fill(255,22,122);
		textSize(20);
		text("Lives: " + lives + ". Out Of Lives!", random(width - 241, width - 239), random(19, 21));

		fill(80);
		textSize(40);
		text("Game over. Press space to continue.", width*0.15, height*0.40);

        BGM.stop();

        gameover = true
        
        if(gameover == true && gameDiode == false)
        {
            gameoverSound.play();
            gameDiode = true
        }

		return;
	}

	// Level Complete
	if(flagpole.isReached)
	{
		fill(80);
		textSize(40);
		text("Level complete. Press space to continue.", width*0.15, height*0.40);

        BGM.stop();

		return;
	}

	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.

    if(isPlummeting == true)
    {
        gameChar_y += 10;
    }
	if(gameChar_y < floorPos_y)
    {
        var isContact = false
        for(i = 0; i < platforms.length; i++)
        {
            if(platforms[i].checkContact(gameChar_world_x, gameChar_y))
            {
                isContact = true;
                isFalling = false;
                break;
            }
        }
        if(isContact == false)
        {
            gameChar_y += 4;
		    isFalling = true;
    	}
    }
	else 
    {
		isFalling = false;
	}

	// Flagpole Mechanics

	if(flagpole.isReached == false)
	{
		checkFlagpole();
	}

	checkPlayerDie();

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{

	console.log("press" + keyCode);
	console.log("press" + key);

    if(flagpole.isReached && keyCode == 32)
    {
        nextLevel();
    }
    else if(lives < 1 && keyCode == 32)
    {
        returnToStart();
    }

	if(key == 'A' || keyCode == 37){
		console.log("left arrow");
		isLeft = true;
	}
	else if(key == 'D' || keyCode == 39){
		console.log("right arrow");
		isRight = true;
	}
	else if(key == 'W' || keyCode == 32){

        if(!isFalling)
        {
            console.log("jump");
		    gameChar_y -= 140;
            jumpSound.play();
        }
	}

}

function keyReleased()
{

	console.log("release" + keyCode);
	console.log("release" + key);

	if(key == 'A' || keyCode == 37){
		console.log("left arrow");
		isLeft = false;
	}
	else if(key == 'D' || keyCode == 39){
		console.log("right arrow");
		isRight = false;
	}
	else if(keyCode == 32){
		console.log("jump");
		isPlummeting = false;
	}

}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.
function drawGameChar()
{
	// draw game character
	if(isLeft && isFalling)
	{
		// add your jumping-left code
		fill(250,128,114);
		ellipse(gameChar_x,gameChar_y - 36, 46, 40);

		fill(0);
		ellipse(gameChar_x - 20,gameChar_y - 36,5,10);

		fill(250,128,114);
		stroke(1)
		ellipse(gameChar_x,gameChar_y-28,10,5);

		fill(0);
		ellipse(gameChar_x,gameChar_y-5,7,14);

	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code
		fill(250,128,114);
		ellipse(gameChar_x,gameChar_y - 36, 46, 40);

		fill(0);
		ellipse(gameChar_x + 20,gameChar_y - 36,5,10);

		fill(250,128,114);
		stroke(1)
		ellipse(gameChar_x,gameChar_y-28,10,5);

		fill(0);
		ellipse(gameChar_x,gameChar_y-5,7,14);

	}
	else if(isLeft)
	{
		// add your walking left code
		fill(250,128,114);
		ellipse(gameChar_x,gameChar_y - 20, 46, 40);

		fill(0);
		ellipse(gameChar_x - 20,gameChar_y - 20,5,10);

		fill(250,128,114);
		stroke(1)
		ellipse(gameChar_x,gameChar_y-12,10,5);

		fill(0);
		ellipse(gameChar_x,gameChar_y-1,14,7);


	}
	else if(isRight)
	{
		// add your walking right code
		fill(250,128,114);
		ellipse(gameChar_x,gameChar_y - 20, 46, 40);

		fill(0);
		ellipse(gameChar_x + 20,gameChar_y - 20,5,10);

		fill(250,128,114);
		stroke(1)
		ellipse(gameChar_x,gameChar_y-12,10,5);

		fill(0);
		ellipse(gameChar_x,gameChar_y-1,14,7);

	}
	else if(isFalling || isPlummeting)
	{
		// add your jumping facing forwards code
		fill(250,128,114);
		ellipse(gameChar_x,gameChar_y - 36, 46, 40);

		fill(0);
		ellipse(gameChar_x - 10,gameChar_y - 32,5,10);
		fill(0);
		ellipse(gameChar_x + 10,gameChar_y - 32,5,10);

		fill(0);
		triangle(gameChar_x,gameChar_y - 27,gameChar_x -5,gameChar_y -22,gameChar_x +5,gameChar_y -22);

		fill(0);
		ellipse(gameChar_x-10,gameChar_y-5,7,14);
		ellipse(gameChar_x+10,gameChar_y-5,7,14);


	}
	else
	{
		// add your standing front facing code
		fill(250,128,114);
		ellipse(gameChar_x,gameChar_y - 20, 46, 40);

		fill(0);
		ellipse(gameChar_x - 10,gameChar_y - 20,5,10);
		fill(0);
		ellipse(gameChar_x + 10,gameChar_y - 20,5,10);

		fill(0);
		triangle(gameChar_x,gameChar_y - 15,gameChar_x -5,gameChar_y -10,gameChar_x +5,gameChar_y -10);

		fill(0);
		ellipse(gameChar_x-10,gameChar_y-1,14,7);
		ellipse(gameChar_x+10,gameChar_y-1,14,7);

	}

}

// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.

	//shape of cloud function
	function drawCloud(cloud){
		fill(255,255,255);
		ellipse(cloud.x_pos, cloud.y_pos + 100, cloud.size + 20, cloud.size + 20);
		ellipse(cloud.x_pos + 20, cloud.y_pos + 100, cloud.size + 30, cloud.size + 30);
		ellipse(cloud.x_pos + 40, cloud.y_pos + 100, cloud.size + 20, cloud.size +20);
	}
	//animate clouds function
	function animateClouds(){

		for(var i = 0;i<8;i++){
			//conditional statements for repeating animated clouds
			if(clouds[i].x_pos>width+3400)
			{
				// clouds[i].x_pos = negative left background; cloud goes from left to right.
				// setting different cloud spawn area after first cycle
				clouds[0].x_pos = random(-2324, -1310), clouds[0].y_pos=random(0,30), clouds[0].size = random(10,35);
				clouds[1].x_pos = random(-2150, -1310), clouds[1].y_pos=random(0,30), clouds[1].size = random(10,35);
				clouds[2].x_pos = random(-1800, -1310), clouds[2].y_pos=random(0,30), clouds[2].size = random(10,35);
				clouds[3].x_pos = random(-2324, -1310), clouds[3].y_pos=random(0,30), clouds[3].size = random(10,35);
				clouds[4].x_pos = random(-2150, -1310), clouds[4].y_pos=random(0,30), clouds[4].size = random(10,35);
				clouds[5].x_pos = random(-1800, -1310), clouds[5].y_pos=random(0,30), clouds[5].size = random(10,35);
				clouds[6].x_pos = random(-2324, -1310), clouds[6].y_pos=random(0,30), clouds[6].size = random(10,35);
				clouds[7].x_pos = random(-2150, -1310), clouds[7].y_pos=random(0,30), clouds[7].size = random(10,35);
				clouds[8].x_pos = random(-1800, -1310), clouds[8].y_pos=random(0,30), clouds[8].size = random(10,35);
			}else{
				//slow-clouds group 1
				clouds[0].x_pos = clouds[0].x_pos + 0.6;
				clouds[1].x_pos = clouds[1].x_pos + 0.6;
				clouds[2].x_pos = clouds[2].x_pos + 0.6;
				//slow-cloud group 2
				clouds[3].x_pos = clouds[3].x_pos + 0.7;
				clouds[4].x_pos = clouds[4].x_pos + 0.7;
				clouds[5].x_pos = clouds[5].x_pos + 0.7;
				//fast-cloud
				clouds[6].x_pos = clouds[6].x_pos + 1.1;
				clouds[7].x_pos = clouds[7].x_pos + 1.1;
				clouds[8].x_pos = clouds[8].x_pos + 1.1;
			}
		}
	}
	//draw clouds function
	function drawClouds(){

		for(var i = 0;i<clouds.length;i++){
			drawCloud(clouds[i]);
		}
	}

// Function to draw mountains objects.

	function drawMountains(){
		for ( var i = 0; i < mountain.length; i++ )
		{
				//mountain outline
			fill(150,150,150);
			beginShape();
			vertex(mountain[i].x_pos, mountain[i].y_pos);
			vertex(mountain[i].x_pos + mountain[i].size * 1.40, mountain[i].y_pos - mountain[i].size * 4.00);
			vertex(mountain[i].x_pos + mountain[i].size * 2.40, mountain[i].y_pos - mountain[i].size * 2.20);
			vertex(mountain[i].x_pos + mountain[i].size * 3.40, mountain[i].y_pos - mountain[i].size * 5.20);
			vertex(mountain[i].x_pos + mountain[i].size * 5.00, mountain[i].y_pos);
			vertex(mountain[i].x_pos, mountain[i].y_pos);
			endShape();

				//tall peak shade
			fill(0,50);
			beginShape();
			vertex(mountain[i].x_pos + mountain[i].size * 3.40, mountain[i].y_pos - mountain[i].size * 5.20);
			vertex(mountain[i].x_pos + mountain[i].size * 2.40, mountain[i].y_pos - mountain[i].size * 2.20);
			vertex(mountain[i].x_pos + mountain[i].size * 2.80, mountain[i].y_pos - mountain[i].size * 0.64);
			endShape();

				//snow cap
			fill(238,238,238);
			beginShape();
			vertex(mountain[i].x_pos + mountain[i].size * 3.40, mountain[i].y_pos - mountain[i].size * 5.20);
			vertex(mountain[i].x_pos + mountain[i].size * 3.64, mountain[i].y_pos - mountain[i].size * 4.40);
			vertex(mountain[i].x_pos + mountain[i].size * 3.42, mountain[i].y_pos - mountain[i].size * 4.24);
			vertex(mountain[i].x_pos + mountain[i].size * 3.30, mountain[i].y_pos - mountain[i].size * 4.36);
			vertex(mountain[i].x_pos + mountain[i].size * 2.93, mountain[i].y_pos - mountain[i].size * 3.80);
			vertex(mountain[i].x_pos + mountain[i].size * 3.40, mountain[i].y_pos - mountain[i].size * 5.20);
			endShape();

				//low peak shade
			fill(180, 180, 180);
			triangle(mountain[i].x_pos + mountain[i].size * 1.40, mountain[i].y_pos - mountain[i].size * 4.00, mountain[i].x_pos + mountain[i].size * 3.62, mountain[i].y_pos, mountain[i].x_pos + mountain[i].size * 2, mountain[i].y_pos);
		}
	}

// Function to draw trees objects.

	function drawTrees(){
		for ( var i = 0; i < trees_x.length; i++ )
		{
		fill(120,100,40);
		rect(trees_x[i], floorPos_y * 2/3, 40, 144);

		//branches
		fill(0,100,0);
		triangle(trees_x[i] - 50, floorPos_y * 2/3 + 110, trees_x[i] + 20, floorPos_y * 2/3 + 10, trees_x[i] + 90, floorPos_y * 2/3 + 110);
		fill(34,139,34);
		triangle(trees_x[i] - 50, floorPos_y * 2/3 + 80, trees_x[i] + 20, floorPos_y * 2/3 - 20, trees_x[i] + 90, floorPos_y * 2/3 + 80);
		fill(60,179,113);
		triangle(trees_x[i] - 50, floorPos_y * 2/3 + 55, trees_x[i] + 20, floorPos_y * 2/3 - 45, trees_x[i] + 90, floorPos_y * 2/3 + 55);
		fill(127,255,212);
		triangle(trees_x[i] - 50, floorPos_y * 2/3 + 35, trees_x[i] + 20, floorPos_y * 2/3 - 65, trees_x[i] + 90, floorPos_y * 2/3 + 35);
		fill(190,250,255);
		triangle(trees_x[i] - 50, floorPos_y * 2/3 + 18, trees_x[i] + 20, floorPos_y * 2/3 - 82, trees_x[i] + 90, floorPos_y * 2/3 + 18);
		}
	}


// ---------------------------------
// Canyon render, Check functions, Platforms functions and Enemies.
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
	fill(222,184,135);
	rect(t_canyon.x_pos + 40, 432, t_canyon.width, 144);

	fill(85,107,47);
	triangle(t_canyon.x_pos + 40, 432, t_canyon.x_pos, 432, t_canyon.x_pos + 40, 576);
	triangle(t_canyon.x_pos + 40 + t_canyon.width, 432, t_canyon.x_pos + 80 + t_canyon.width, 432, t_canyon.x_pos + 40 + t_canyon.width, 576);
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{
	if(gameChar_world_x > t_canyon.x_pos + 40 && gameChar_world_x < t_canyon.x_pos + 40 + t_canyon.width && gameChar_y >= 432)
	{
		isPlummeting = true;

	};
}

// Flagpole + Check Flagpole

function renderFlagpole()
{
	push();
	strokeWeight(5);
	stroke(180);
	line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 250);
	strokeWeight();
	fill(150, 17, 180);

	if(flagpole.isReached)
	{
		rect(flagpole.x_pos, floorPos_y - 250, 100, 60);
	}
	else
	{
		rect(flagpole.x_pos, floorPos_y - 60, 100, 60);
	}
	pop();
}

function checkFlagpole()
{
	var d = abs(gameChar_world_x - flagpole.x_pos);

	if(d < 15){
		flagpole.isReached = true;
        LevelcompleteSound.play();
	}
     
}

// Lives

function checkPlayerDie()
{
	if(gameChar_y > 650 && lives > 0)
	{
		lives -= 1
        charDieSound.play();
		startGame();
	}

}

function drawLifeToken(x, y, size) 
{
	beginShape();
	vertex(x, y);
	bezierVertex(x - size / 2, y - size / 2, x - size, y + size / 3, x, y + size);
	bezierVertex(x + size, y + size / 3, x + size / 2, y - size / 2, x, y);
	endShape(CLOSE);
}

// Platforms

function createPlatforms(x, y, length)
{
    var p = {
        x: x,
        y: y,
        length: length,
        draw: function(){
            fill(255,0,255);
            rect(this.x, this.y, this.length, 10);
        },
        checkContact: function(gc_x, gc_y)
        {
            if(gc_x > this.x && gc_x < this.x + this.length)
            {
                var d = this.y - gc_y;
                if(d >= 0 && d < 5)
                {
                    return true;
                }
            }
            return false;
        }
    }
    return p;

}

// Enemy

function enemy(x, y, range)
{
    this.x = x;
    this.y = y;
    this.range = range;

    this.currentX = x;
    this.inc = 1;

    this.update = function()
    {
        this.currentX += this.inc;
        if(this.currentX >= this.x + this.range)
        {
            this.inc = -1;
        }
        else if(this.currentX < this.x)
        {
            this.inc = 1;
        }
    }
    this.draw = function()
    {
        this.update();
        fill(255,0,0)
        rectMode(CENTER);
        rect(this.currentX, this.y, 45, 45);
    }
    this.checkContact = function(gc_x, gc_y)
    {
        var d = dist(gc_x, gc_y, this.currentX, this.y)

        if(d < 45)
        {
            return true;
        }
        return false;
    }
}

// ----------------------------------
// START GAME FUNCTION
// ----------------------------------

function startGame()
{

	gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.

	trees_x = [-1200, -950, -520, -30, 500, 800, 1000, 1400, 1600, 1800];

	clouds = [
		//animated slow-cloud group 1
		{x_pos:random(10,500), y_pos:random(0,30),size:random(10,35)},
		{x_pos:random(10,850), y_pos:random(0,30),size:random(10,35)},
		{x_pos:random(10,1024), y_pos:random(0,30),size:random(10,35)},
		//animated slow-cloud group 2
		{x_pos:random(500,1024), y_pos:random(0,30),size:random(10,35)},
		{x_pos:random(700,1200), y_pos:random(0,30),size:random(10,35)},
		{x_pos:random(800,1200), y_pos:random(0,30),size:random(10,35)},
		//animated fast-cloud
		{x_pos:random(500,1024), y_pos:random(0,30),size:random(10,35)},
		{x_pos:random(700,1200), y_pos:random(0,30),size:random(10,35)},
		{x_pos:random(800,1200), y_pos:random(0,30),size:random(10,35)},
		//non-animated
		{x_pos:random(10,500), y_pos:random(0,100),size:random(10,35)},
		{x_pos:random(10,850), y_pos:random(0,100),size:random(10,35)},
		{x_pos:random(10,1024), y_pos:random(0,100),size:random(10,35)},

		{x_pos:random(400,1024), y_pos:random(0,100),size:random(10,35)},
		{x_pos:random(600,1400), y_pos:random(0,100),size:random(10,35)},
		{x_pos:random(1024,1624), y_pos:random(0,100),size:random(10,35)},

		{x_pos:random(-500,-10), y_pos:random(0,100),size:random(10,35)},
		{x_pos:random(-850,-10), y_pos:random(0,100),size:random(10,35)},
		{x_pos:random(-1024,-10), y_pos:random(0,100),size:random(10,35)},

		{x_pos:random(-1024,-400), y_pos:random(0,100),size:random(10,35)},
		{x_pos:random(-1400,-600), y_pos:random(0,100),size:random(10,35)},
		{x_pos:random(-1624,-1024), y_pos:random(0,100),size:random(10,35)}];

	mountain = [
		{x_pos: 250, y_pos: 432, size: 50},
		{x_pos: 600, y_pos: 432, size: 75},
		{x_pos: 1300, y_pos: 432, size: 60},
		{x_pos: 1650, y_pos: 432, size: 120},
		{x_pos: -250, y_pos: 432, size: 50},
		{x_pos: -1050, y_pos: 432, size: 100},
		{x_pos: -1550, y_pos: 432, size: 110},]

	canyon = [
		{x_pos: 20, width: 100},
		{x_pos: -440, width: 110},
		{x_pos: 1100, width: 120},
        {x_pos: -1840, width: 610}]

	collectable = [
		{x_pos: 100, y_pos: 100, size: 40, isFound: false},
		{x_pos: 400, y_pos: 400, size: 40, isFound: false},
		{x_pos: 1300, y_pos: 380, size: 40, isFound: false},
		//EASTER EGG, 3 collectables in 1 spot!
		{x_pos: -1100, y_pos: 370, size: 40, isFound: false},
		{x_pos: -1200, y_pos: 370, size: 40, isFound: false},
		{x_pos: -1500, y_pos: 120, size: 40, isFound: false}]

	game_score = 0;

	flagpole = {isReached: false, x_pos: 1500};

	lifeToken = [
		{x_pos: width - 190, y_pos: 500, size: 20},
		{x_pos: width - 150, y_pos: 500, size: 20},
		{x_pos: width - 110, y_pos: 500, size: 20}]

    platforms = [];

    platforms.push(createPlatforms(10,floorPos_y - 100, 90));
    platforms.push(createPlatforms(130,floorPos_y - 190, 90));
    platforms.push(createPlatforms(-1340,floorPos_y - 80, 120));
    platforms.push(createPlatforms(-1420,floorPos_y - 160, 120));
    platforms.push(createPlatforms(-1540,floorPos_y - 240, 160));

    enemies = [];

    enemies.push(new enemy(800, floorPos_y - 20, 600));

}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
	strokeWeight(3);
		stroke(139, 0, 0);
		fill(220,20,60);
		beginShape();
		vertex(t_collectable.x_pos, t_collectable.y_pos);
		vertex(t_collectable.x_pos + t_collectable.size, t_collectable.y_pos);
		vertex(t_collectable.x_pos + t_collectable.size * 1.5, t_collectable.y_pos + t_collectable.size / 2);
		vertex(t_collectable.x_pos + t_collectable.size / 2, t_collectable.y_pos + t_collectable.size * 1.5);
		vertex(t_collectable.x_pos - t_collectable.size / 2, t_collectable.y_pos + t_collectable.size / 2);
		vertex(t_collectable.x_pos, t_collectable.y_pos);
		endShape();

		noFill();
		beginShape();
		vertex(t_collectable.x_pos + t_collectable.size / 4, t_collectable.y_pos);
		vertex(t_collectable.x_pos, t_collectable.y_pos + t_collectable.size / 2);
		vertex(t_collectable.x_pos + t_collectable.size / 2, t_collectable.y_pos + t_collectable.size * 1.5);  
		endShape();
		beginShape();
		vertex(t_collectable.x_pos + t_collectable.size * 0.75, t_collectable.y_pos);
		vertex(t_collectable.x_pos + t_collectable.size, t_collectable.y_pos + t_collectable.size / 2);
		vertex(t_collectable.x_pos + t_collectable.size / 2, t_collectable.y_pos + t_collectable.size * 1.5);
		endShape(); 

		line(t_collectable.x_pos - t_collectable.size / 2, t_collectable.y_pos + t_collectable.size / 2, t_collectable.x_pos + t_collectable.size * 1.5, t_collectable.y_pos + t_collectable.size / 2);
}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
	if(dist(gameChar_world_x, gameChar_y - 20, t_collectable.x_pos + t_collectable.size/2, t_collectable.y_pos + t_collectable.size/2) < 40)
	{
		t_collectable.isFound = true;

		game_score += 1

        collectSound.play();

	}
}

