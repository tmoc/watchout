// start slingin' some d3 here.

var width = 700,
    height = 450,
    nEnemies = 30,
    padding = 2;

var gameOptions = {
    height: 450,
    width: 700,
    nEnemies: 30,
    padding: 20
};



var score = 0,
    bestScore = 0;
    collisions = 0;

var xAxis = d3.scale.linear().domain([0,100]).range([0,gameOptions.width]);
var yAxis = d3.scale.linear().domain([0,100]).range([0,gameOptions.height]);

var gameBoard = d3.select(".gameboard").append("svg")
    .attr("width", gameOptions.width)
    .attr("height", gameOptions.height);

var updateScore = function () {
  d3.select('.current').text(score.toString());
};

var updateBestScore = function () {
  bestScore = _.max([bestScore, score]);
  d3.select('.high').text(bestScore.toString());
};

var updateCollisions = function(){
  collisions++;
  d3.select('.collision').text(collisions.toString());
};

var createEnemies = function(){
  var results= [];

  _.range(0,gameOptions.nEnemies).map(function(i){
     results.push({id: i, x:Math.random()*100, y:Math.random()*100});
  });

  return results;

};

var render = function(enemy_data){

  var enemies = gameBoard.selectAll('circle.enemy')
    .data(enemy_data, function(d){ return d.id});

   enemies.enter()
    .append('svg:circle')
      .attr('class', 'enemy')
      .attr('cx', function(enemy){ return xAxis(enemy.x)})
      .attr('cy', function(enemy){ return yAxis(enemy.y)})
      .attr('r', 0);

      enemies.exit()
        .remove();
};

var tweenWithCollisionDetection = function (endData) {
  var enemy = d3.select(this);
  var startPosX = parseFloat(enemy.attr('cx'));
  var startPosY = parseFloat(enemy.attr('cy'));

  var endPosX = xAxis(endData.x);
  var endPosY = yAxis(endData.y);

  return function (t) {
    checkCollision(enemy, onCollision);
    enemyNextPosX = startPosX + (endPosX - startPosX)*t;
    enemyNextPosY = startPosY + (endPosY - startPosY)*t;

    enemy.attr('cx', enemyNextPosX)
      .attr('cy', enemyNextPosY);
  };



};

var checkCollision = function(enemy, collidedCallback){
  _(players).each(function(player){
      var radiusSum = parseFloat(enemy.attr('r')) + player.r;
      var xDiff = parseFloat(enemy.attr('cx')) - player.x;
      var yDiff = parseFloat(enemy.attr('cy')) - player.y

      var separation = Math.sqrt(Math.pow(xDiff,2) + Math.pow(yDiff,2));
      if (separation < radiusSum){
        collidedCallback(player,enemy);
      }

   });

};

var onCollision = function(){

  updateCollisions();
  updateBestScore();
  score = 0;
  updateScore();

};



var Player = function(gameOptions){

this.gameOptions = gameOptions;
this.path = 'm-7.5,1.62413c0,-5.04095 4.08318,-9.12413 9.12414,-9.12413c5.04096,0 9.70345,5.53145 11.87586,9.12413c-2.02759,2.72372 -6.8349,9.12415 -11.87586,9.12415c-5.04096,0 -9.12414,-4.08318 -9.12414,-9.12415z';
this.fill = '#ff6600';
this.x = 0;
this.y = 0;
this.angle = 0;
this.r = 5;

};

Player.prototype.render = function(to){
  this.el = to.append('svg:path')
    .attr('d', this.path)
    .attr('fill',this.fill);

    this.transform({x: this.gameOptions.width * 0.5, y: this.gameOptions.height * 0.5});
    this.setUpDragging();
    return this;
};

Player.prototype.getX = function () {
  return this.x;
};

Player.prototype.setX = function (x) {
  var minX = this.gameOptions.padding;
  var maxX = this.gameOptions.width - this.gameOptions.padding;
  if (x <= minX) {
    x = minX;
  }
  if (x >= maxX) {
    x = maxX;
  }
  this.x = x;
};

Player.prototype.getY = function () {
  return this.y;
};

Player.prototype.setY = function (y) {
  var minY = this.gameOptions.padding;
  var maxY = this.gameOptions.height - this.gameOptions.padding;
  if (y <= minY) {
    y = minY;
  }
  if (y >= maxY) {
    y = maxY;
  }
  this.y = y;
};

Player.prototype.transform = function (opts) {
  this.angle = opts.angle || this.angle;
  this.setX(opts.x || this.x);
  this.setY(opts.y || this.y);

  this.el.attr('transform', 'rotate(' + this.angle + ',' + this.getX()
    + ',' + this.getY() + ') ' + 'translate(' + this.getX() + ',' + this.getY() + ')');
};

Player.prototype.moveAbsolute = function (x, y) {
  this.transform({x: this.x, y: this.y});
};

Player.prototype.moveRelative = function(dx,dy){
  this.transform(
    {
      x: this.getX()+dx,
      y: this.getY()+dy,
      angle: 360 * (Math.atan2(dy, dx) / (Math.PI * 2))
    });
};

Player.prototype.setUpDragging = function(){
  var _this = this;
  var dragMove = function(){
    return _this.moveRelative(d3.event.dx, d3.event.dy);
  };
  var drag = d3.behavior.drag()
    .on('drag', dragMove);
    this.el.call(drag);
};

var players = [];
players.push(new Player(gameOptions).render(gameBoard));


var play = function(){

  var gameTurn = function () {
    newEnemyPositions = createEnemies();
    render(newEnemyPositions);
    d3.selectAll('.enemy')
    .transition()
    .duration(500)
    .attr('r', 10)
    .transition()
    .duration(2000)
    .tween('custom', tweenWithCollisionDetection);
  };

  var increaseScore = function(){
    score ++;
    updateScore();
  };


  gameTurn();
  setInterval(function () {gameTurn();}, 2000);

  setInterval(increaseScore, 50);

};


play();














