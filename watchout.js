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

var xAxis = d3.scale.linear().domain([0,100]).range([0,gameOptions.width]);
var yAxis = d3.scale.linear().domain([0,100]).range([0,gameOptions.height]);

var gameBoard = d3.select(".gameboard").append("svg")
    .attr("width", gameOptions.width)
    .attr("height", gameOptions.height);

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
    enemyNextPosX = startPosX + (endPosX - startPosX)*t;
    enemyNextPosY = startPosY + (endPosY - startPosY)*t;

    enemy.attr('cx', enemyNextPosX)
      .attr('cy', enemyNextPosY);
  };



};

var Player = function(){

this.path = 'm-7.5,1.62413c0,-5.04095 4.08318,-9.12413 9.12414,-9.12413c5.04096,0 9.70345,5.53145 11.87586,9.12413c-2.02759,2.72372 -6.8349,9.12415 -11.87586,9.12415c-5.04096,0 -9.12414,-4.08318 -9.12414,-9.12415z';
this.fill = '#ff6600';
this.x = 0;
this.y = 0;
this.angle = 0;
this.r = 5;

};

Player.prototype.gameOptions = gameOptions;

Player.prototype.render = function(to){
  this.el = to.append('svg:path')
    .attr('d', this.path)
    .attr('fill',this.fill)

    this.transform = {x: this.gameOptions.width * 0.5, y: this.gameOptions.height * 0.5};
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
    this.x = minX;
  }
  if (x >= maxX) {
    this.x = maxX;
  }
};

Player.prototype.getY = function () {
  return this.y;
};

Player.prototype.setY = function (x) {
  var minY = this.gameOptions.padding;
  var maxY = this.gameOptions.height - this.gameOptions.padding;
  if (y <= minY) {
    this.y = minY;
  }
  if (y >= maxY) {
    this.y = maxY;
  }
};

Player.prototype.transform = function (opts) {
  this.angle = opts.angle || this.angle;
  this.setX(opts.x || this.x);
  this.setY(opts.y || this.y);

  this.el.attr('transform', 'rotate(#{@angle},#{@getX()},#{@getY()})' + 'translate(#{@getX()},#{@getY()})');
};

Player.prototype.moveAbsolute = function (x, y) {
  this.transform({x: this.x, y: this.y});
};

Player.prototype.moveRelative = function(dx,dy){
  debugger;
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
}






gameTurn();
setInterval(function () {gameTurn();}, 2000);










