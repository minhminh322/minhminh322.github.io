var AM = new AssetManager();
var villager_death = false;
function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Background.prototype.update = function () {
};

function DarkSaber(game) {
    this.walk_animation = new Animation(AM.getAsset("./img/darksaber_walk.png"), 0, 0, 502, 497, 0.02, 39, true, false);
    this.hit_animation = new Animation(AM.getAsset("./img/darksaber_hit.png"), 0, 0, 758, 523, 0.05, 26, true, false);
    this.howl_animation = new Animation(AM.getAsset("./img/darksaber_howl.png"), 0, 0, 577, 547, 0.1, 20, true, false);
    this.moving = true;
    this.attacking = false;
    this.howling = false;
    this.speed = 100;
    this.ctx = game.ctx;
    Entity.call(this, game, 0, 300);
}

DarkSaber.prototype = new Entity();
DarkSaber.prototype.constructor = DarkSaber;

DarkSaber.prototype.update = function () {
    if (this.moving) {
        this.x += this.game.clockTick * this.speed;
        if (this.x > 330) {
            this.moving = false;
            this.attacking = true;
        }
    }
        
    if (villager_death) {
        this.attacking = false;
        this.howling = true;
    }
    Entity.prototype.update.call(this);
}

DarkSaber.prototype.draw = function () {
    if (this.moving) {
        this.walk_animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.5);
    } 
    if (this.attacking) {
        this.hit_animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.5);
    }
    if (this.howling) {
        this.howl_animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 0.5);
    }
    Entity.prototype.draw.call(this);
}

function Villager(game) {
    this.walk_animation = new Animation(AM.getAsset("./img/villager_walk.png"), 0, 0, 93, 163, 0.15, 15, true, false);
    this.dead_animation = new Animation(AM.getAsset("./img/villager_dead.png"), 0, 0, 225, 198, 0.1, 16, false, false);
    this.moving = true;
    this.dead = false;
    this.speed = 150;
    this.ctx = game.ctx;
    Entity.call(this, game, 1000, 300);
}

Villager.prototype = new Entity();
Villager.prototype.constructor = DarkSaber;

Villager.prototype.update = function () {
    if (this.moving) {
        this.x -= this.game.clockTick * this.speed;
        if (this.x < 500) {
            this.moving = false;
            this.dead = true;
        }
    }
        
    if (this.dead) {
        if (this.dead_animation.isDone()) {
            villager_death = true;
        }
    }
    Entity.prototype.update.call(this);
}

Villager.prototype.draw = function () {
    if (this.moving) {
        this.walk_animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 1.5);
    } else {
        this.dead_animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y, 1.5);
    }
    Entity.prototype.draw.call(this);
}

AM.queueDownload("./img/background.jpg");
AM.queueDownload("./img/darksaber_walk.png");
AM.queueDownload("./img/darksaber_hit.png");
AM.queueDownload("./img/darksaber_howl.png");

AM.queueDownload("./img/villager_walk.png");
AM.queueDownload("./img/villager_dead.png");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.jpg")));
    // gameEngine.addEntity(new WalkingMale(gameEngine, AM.getAsset("./img/walk_male.png")));
    // gameEngine.addEntity(new AttackFemale(gameEngine, AM.getAsset("./img/attack_female_flipped.png")));
    gameEngine.addEntity(new DarkSaber(gameEngine));
    gameEngine.addEntity(new Villager(gameEngine));

    console.log("All Done!");
});