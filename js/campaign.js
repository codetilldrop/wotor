var game;

function campaign(context) {
  game = new Phaser.Game(800,
    600,
    Phaser.AUTO,
    context.viewElement,
    { preload: preload, create: create, update: update});

    this.game.stage.scale.pageAlignHorizontally = true;
    this.game.stage.scale.pageAlignVertically = true;
    this.game.stage.scale.refresh();
}

function preload () {
  // All the necessary assets for my game so far
  game.load.image('sky', 'assets/space.png');
  game.load.spritesheet('ship', 'assets/spaceship.png', 50, 68, 2);
  game.load.image('bullet', 'assets/playerbullet.png');
  game.load.spritesheet('enemy', 'assets/enemyship.png', 43, 65, 2);
  game.load.spritesheet('explosion', 'assets/explosion.png', 64, 64, 18);
  game.load.image('asteroid', 'assets/asteroid.png');
  game.load.image('enemyBullet', 'assets/enemyBullet.png');
}

// List of necessary global variables
var player1;
var cursors;
var bullets;
var score = 0;
var scoreText;
var totalScoreText;
var restartText;
var enemies;
var asteroids;
var creatingEnemyLoop;
var creatingAsteroidLoop;
var enemyBullets;
var gameOverText;
var waspace;
var bulletTime = 0;
var enemyBulletTime = 0;

// Create world
function create () {
  // Sprites
  game.add.sprite(0, 0, 'sky');
  player1 = game.add.sprite(400, 450, 'ship');

  // My game will use the Phaser Arcade Physics System
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.enable(player1);

  enemies = game.add.group();
  asteroids = game.add.group();

  // The group of bullets for player one and its setup
  bullets = game.add.group();
  bullets.enableBody = true;
  bullets.physicsBodyType = Phaser.Physics.ARCADE;
  bullets.createMultiple(30, 'bullet');
  bullets.setAll('anchor.x', 0.5);
  bullets.setAll('anchor.y', 1);
  bullets.setAll('outOfBoundsKill', true);
  bullets.setAll('checkWorldBounds', true);

  enemyBullets = game.add.group();
  enemyBullets.enableBody = true;
  enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
  enemyBullets.createMultiple(30, 'enemyBullet');
  enemyBullets.setAll('anchor.x', 0.5);
  enemyBullets.setAll('anchor.y', 1);
  enemyBullets.setAll('outOfBoundsKill', true);
  enemyBullets.setAll('checkWorldBounds', true);

  // Keys that will be used for the game
  cursors = game.input.keyboard.createCursorKeys();
  waspace = {
    space: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
  };

  // Create the element to display the score as text
  scoreText = game.add.text(16, 16, 'Score: 0', { font: '32px Tahoma', fill: '#999' });

  // Create the element to say Game Over as text
  gameOverText = game.add.text(200, 175, 'Game Over', {font: '64px Tahoma', fill: '#999'});
  gameOverText.visible = false;

  // Create the element to display the total score at the end of the game
  totalScoreText = game.add.text(160, 250, 'Your Final Score was ', {font: '32px Tahoma', fill: '#999' });
  totalScoreText.visible = false;

  // Create the element that displays the message to click anywhere to restart
  restartText = game.add.text(120, 290, 'Click Anywhere to Restart the Game', {font: '32px Tahoma', fill: '#999'});
  restartText.visible = false;

  // Create our emission animations for our characters
  player1.animations.add('emissionsP1');
  player1.animations.play('emissionsP1', 50, true);

  // Set a time loop so that every second, the createEnemy function is called to create an enemy
  creatingEnemyLoop = game.time.events.loop(Phaser.Timer.SECOND, createEnemy, this);

  // Set a time loop so that every second, the createAsteroid function is called to create an asteroid
  creatingAsteroidLoop = game.time.events.loop(Phaser.Timer.SECOND * 4, createAsteroid, this);
}

function update () {
  // The following blocks will have to do with getting input from the keys
  player1.body.velocity.x = 0;

  if (cursors.left.isDown) {
    player1.body.velocity.x = -200;
  } else if (cursors.right.isDown) {
    player1.body.velocity.x = 200;
  } else {
    player1.frame = 4;
  }

  // If the space bar is pressed, it will launch the functions to fire each player 1s bullets
  if (waspace.space.isDown) {
    fireBullet();
  }

  // The following block of code deals with if their is a collision between specific game objects
  game.physics.arcade.overlap(player1, enemyBullets, playerOneDeath, null, this);
  game.physics.arcade.overlap(bullets, enemies, enemyDeath, null, this);
  game.physics.arcade.overlap(player1, enemies, playerOneDeath, null, this);
  game.physics.arcade.overlap(player1, asteroids, playerOneDeath, null, this);
  game.physics.arcade.overlap(asteroids, bullets, asteroidExplosion, null, this);
}

function playerOneDeath (player1, bullet) {
  // Create an explosion
  player1.loadTexture('explosion');
  player1.animations.add('kaboom');
  player1.animations.play('kaboom', 35, false, true);

  // Destroy all the groups
  enemies.destroy();
  asteroids.destroy();
  enemyBullets.destroy();
  bullets.destroy();

  enemies.destroyChildren = true;

  // Set the visibility of specific text elements to true
  gameOverText.visible = true;
  scoreText.visible = false;
  totalScoreText.text = "Your Final Score was " + score + " Points";
  totalScoreText.visible = true;
  restartText.visible = true;

  // Stop loops creating enemies and asteroids
  game.time.events.remove(creatingEnemyLoop);
  game.time.events.remove(creatingAsteroidLoop);

  // Call the restart function once any part of the game has been clicked
  game.input.onTap.addOnce(restart, this);
}

function enemyDeath (bullet, enemy) {
  // Deactivate the enemies basic abilities. E.g: Gravity
  enemy.body.moves = false;

  // Create an explosion
  enemy.loadTexture('explosion');
  enemy.animations.add('kaboom');
  enemy.animations.play('kaboom', 35, false, true);

  // Deal with putting up the score by 100
  score += 100;
  scoreText.text = 'Score: ' + score;

  // Kill the bullet and enemies
  bullet.kill();
}

function asteroidExplosion (asteroid, bullet) {
  // Deactivate the asteroids basic abilities. E.g: Gravity
  asteroid.body.moves = false;

  // Create an explosion
  asteroid.loadTexture('explosion');
  asteroid.animations.add('kaboom');
  asteroid.animations.play('kaboom', 35, false, true);

  // Deal with putting up the score by 50
  score += 50;
  scoreText.text = 'Score: ' + score;

  // Kill the bullet
  bullet.kill();
}

function createEnemy () {
  // Add our sprite here with a random x co-ordinate
  var enemy = game.add.sprite(Math.floor(Math.random() * 750, 10), -60, 'enemy');

  // Activate the physics system and set gravity on it to 250
  game.physics.arcade.enable(enemy);
  enemy.body.gravity.y = 250;
  enemy.checkWorldBounds = true;
  enemy.outOfBoundsKill = true;

  enemies.add(enemy);


  var emissionsEnemy = enemy.animations.add('emissionsEnemy');
  enemy.animations.play('emissionsEnemy', 50, true);

  // Makes the enemy fire their bullet 1 second after spawn
  setTimeout(function() {
    fireEnemyBullet(enemy);
}, 0);
}

function createAsteroid () {
  // Uses the same process for adding the enemies with a random x coordinate except it does it with the asteroid sprite
  var asteroid = game.add.sprite(Math.floor(Math.random() * 750, 10), -60, 'asteroid');

  // Activate the physics system and set gravity on it to 250
  game.physics.arcade.enable(asteroid);
  asteroid.body.gravity.y = 250;
  asteroid.outOfBoundsKill = true;

  asteroids.add(asteroid);
}

// Let's shoot something
function fireBullet () {
  if (game.time.now > bulletTime) {
    // Retrieving the first bullet from the pool
    var bullet = bullets.getFirstExists(false);

    // And Fire!
    if (bullet) {
      bullet.reset(player1.x + 23, player1.y + 8);
      bullet.body.velocity.y = -400;
      bulletTime = game.time.now + 200;
    }
  }
}

// Fires an enemy bullet exactly like player one and two except it is called differently. Scroll up to see
function fireEnemyBullet (enemy) {
    if (game.time.now > enemyBulletTime) {
      var bullet = enemyBullets.getFirstExists(false);

      if (bullet) {
        bullet.reset(enemy.x + 40, enemy.y + 8);
        bullet.body.velocity.y = 400;
        enemyBulletTime = game.time.now + 200;
      }
    }
}

// Note this function is the same as create accept it does a few different things
function restart () {
  score = 0;
  this.create();
}