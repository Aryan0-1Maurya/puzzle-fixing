/* 

    #############################################################
      
          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

(   By ~Aryan Maurya Mr.perfect https://amsrportfolio.netlify.app  )

          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

    #############################################################

*/

X = undefined;

function main(){
    var board = canvasObject(getEl("board"));
    var cover = getEl("cover");
    var info = getEl("info"),
        score = getEl("score");
    
    var size = 8; // looks better if factor of 2400
    var game = new Game(board, size);
    var graph = new Graph(game);
    
    game.start();
    var scores = 0;
    
    // events
    place = (e, obj) => {
        var touch = new Position(
                    [Math.round(
                    (e.x - obj.offsetLeft)
                     /obj.offsetWidth
                     *obj.width),
                     Math.round(
                     (e.y - obj.offsetTop)
                     /obj.offsetHeight
                     *obj.height)])
        //info.innerText = touch;
        
        if(Math.abs(touch.x-1500)<1200 &&
           Math.abs(touch.y-1500)<1200){
            var pos = touch.toArray().map(
                (i) => Math.floor((i-300)/(2400/game.size))
            );
            //info.innerText += "/" + pos;
            
            var blc = game.place(new Position(pos));
            var check = graph.checkfrom(blc);
            if(check[2].length===0){
                cover.style.display = "block";
                findLoops(check);
            }
        }
    }
    
    function findLoops(check){
        var loops = Graph.allLoopsFrom (check);
        var llen = loops.length;
        var i = 0;
        
        var show = setInterval(()=>{
            if(i<llen){
                var len = loops[i].length;
                var sc = i?(len*(len-1))/2:len*2-2;
                drawLoop(loops[i++]);
                score.innerText += " +"+sc;
            } else {
                setTimeout(last, 100);
                clearInterval(show);
            }
        }, 100);
        
        
        // draw loop
        function drawLoop(loop){
            for(var n of range (loop.length-1)){
                var dx = loop[n+1].ref.pos.x - loop[n].ref.pos.x,
                    dy = loop[n+1].ref.pos.y - loop[n].ref.pos.y;
                // draw edges
                if(dx===0&&dy===-1){ //up
                    game.put(loop[n].ref, false, true, false, "up",1);
                    game.put(loop[n+1].ref, false, true, true, "down",1);
                }else if(dx===-1 && dy===0){ //left
                    game.put(loop[n].ref, false, true, false, "left",1);
                    game.put(loop[n+1].ref, false, true, true, "right",1);
                }else if(dx===0 && dy===1){ //down
                    game.put(loop[n].ref, false, true, false, "down",1);
                    game.put(loop[n+1].ref, false, true, true, "up",1);
                }else if(dx===1&&dy===0){ //right
                    game.put(loop[n].ref, false, true, false, "right",1);
                    game.put(loop[n+1].ref, false, true, true, "left",1);
                }
            }
        }
        
        // get score, clear looped blocks
        function last(){
            setTimeout(()=>{
                score.innerText = eval(score.innerText);
                for(var blc of check[0])
                    game.clear(blc.pos. toArray());
                cover.style.display = "none";
            }, 200);
        }
    }
}






// ------------ Classes ------------

class Game{
    constructor(cv, size){
        this.cv = cv;
        this.size = size;
        this.data = X;
        this.nexts = [];
        
        this.initialize();
    }
    
    initialize(){
        this.cv.draw.rect (300,300,2410,2410);
        
        var size = this.size;
        var gs = 2400/size;
        for(var r of range(size))
            for(var c of range(size))
                this.cv.clear.rect(
                    310+gs*r, 310+gs*c,
                    gs-10, gs-10);
        
        this.data = range(size).map(
            () => new Array(size)
        );
        
        for(var _ of range(5)){
            this.cv.draw.rect (300+600*_, 2950, 500, 500, "black");
            this.cv.clear.rect (310+600*_, 2960, 480, 480);
        }
    }
    
    
    // start game
    start(){
        this.nexts = range(5).map (Block.random);
        for(var _ of range(5))
            this.putnext(_, this.nexts[_]);
    }
    
    
    // blocks on board
    place(pos){
        var blc = this.pushnext();
        blc.pos = pos;
        this.put(blc);
        return blc;
    }
    
    put(blc, newblock=true, halfonly=false, right=true, assign="", trim=false){
        var x,y,gs;
        gs = 2400/this.size;
        [x,y] = blc.pos.toArray();
        
        if(newblock){
            this.clear([x,y]); // clear first
            this.data[x][y] = blc;
        
            this.cv.draw.rect
                 (305+gs*x, 305+gs*y,
                    gs, gs, "sienna");
        }
        
        var pathcolor = newblock?"yellow":"magenta";
        // up
        if(blc.up && ["", "u", "up", 0].includes(assign))
        this.cv.draw.rect
             (305+gs*(x+.4 +.1*(halfonly && right)), 305+gs*y,
                gs*.2/(1+halfonly), gs*(.6-.1*trim), pathcolor);
        // right
        if(blc.right && ["", "r", "right", 3].includes(assign))
        this.cv.draw.rect
             (305+gs*(x+.4+.1*trim), 305+gs*(y+.4 +.1*(halfonly && right)),
                gs*(.6-.1*trim), gs*.2/(1+halfonly), pathcolor);
        // down
        if(blc.down && ["", "d", "down", 2].includes(assign))
        this.cv.draw.rect
             (305+gs*(x+.4 +.1*(halfonly && !right)), 305+gs*(y+.4+.1*trim),
                gs*.2/(1+halfonly), gs*(.6-.1*trim), pathcolor);
        // left
        if(blc.left && ["", "l", "left", 1].includes(assign))
        this.cv.draw.rect
             (305+gs*x, 305+gs*(y+.4 +.1*(halfonly && !right)),
                gs*(.6-.1*trim), gs*.2/(1+halfonly), pathcolor);
    }
    
    clear(pos){
        var x = pos[0], y = pos[1];
        var gs = 2400/this.size;
        
        this.data[x][y] = X;
        
        this.cv.draw.rect
             (305+gs*x, 305+gs*y,
              gs, gs, "black");
        this.cv.clear.rect(
              310+gs*x, 310+gs*y,
              gs-10, gs-10);
    }
    
    
    // next blocks 1~5
    pushnext(){
        var push = this.nexts[0];
        this.nexts = this.nexts.splice(-4);
        this.nexts.push(Block.random());
        for(var _ of range(5))
            this.putnext(_, this.nexts[_]);
        return push;
    }
    
    putnext(order, blc, markonly=false){
        var x=order, gs=490;
        
        this.cv.draw.rect
             (305+600*x, 2955,
                gs, gs, "sienna");
        // up
        if(blc.up)
        this.cv.draw.rect
             (305+600*x+gs*.4, 2955,
                gs*.2, gs*.6, "yellow");
        // right
        if(blc.right)
        this.cv.draw.rect
             (305+600*x+gs*.4, 2955+gs*.4,
                gs*.6, gs*.2, "yellow");
        // down
        if(blc.down)
        this.cv.draw.rect
             (305+600*x+gs*.4, 2955+gs*.4,
                gs*.2, gs*.6, "yellow");
        // left
        if(blc.left)
        this.cv.draw.rect
             (305+600*x, 2955+gs*.4,
                gs*.6, gs*.2, "yellow");
    }
    
    clearnext(order){
        var x = order, gs = 490;
        
        this.cv.draw.rect
             (305+gs*x, 2955,
              gs, gs, "black");
        this.cv.clear.rect(
              310+gs*x, 2960,
              gs-10, gs-10);
    }
}

class Block{
    constructor(pos, conns){
        if(pos.constructor===Position)
            this.pos = pos;
        else
            this.pos = new Position(pos);
        
        // uldr
        this.connections = bin(conns).ljust(4, "0");
    }
    
    equals(blc){
        return this.pos.equals(blc.pos) && this.connections==blc.connections;
    }
    
    get up(){
        return this.connections[3] === "1";
    }
    get left(){
        return this.connections[2] === "1";
    }
    get down(){
        return this.connections[1] === "1";
    }
    get right(){
        return this.connections[0] === "1";
    }
    
    static random(){
        return new Block([], randfrom (range(1,16).exclude([1,2,4,8])));
    }
}

/* 

    #############################################################
      
          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

(   By ~Aryan Maurya Mr.perfect https://amsrportfolio.netlify.app  )

          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

    #############################################################

*/

// Graph Analysis

class Node{
    constructor(blc){
        this.ref = blc;
        if(blc.up)
            this.up = null;
        if(blc.left)
            this.left = null;
        if(blc.down)
            this.down = null;
        if(blc.right)
            this.right = null;
    }
    
    equals(node){
        return this.ref.equals(node.ref);
    }
    
    trylink(node){
        var dx = node.ref.pos.x
               - this.ref.pos.x,
            dy = node.ref.pos.y
               - this.ref.pos.y;
        
        if(dx===0&&dy===-1 &&
          this.ref.up && node.ref.down){
            this.up = node;
            node.down = this;
        } else if(dx===-1&&dy===0 &&
          this.ref.left && node.ref.right){
            this.left = node;
            node.right = this;
        } else if(dx===0&&dy===1 &&
          this.ref.down && node.ref.up){
            this.down = node;
            node.up = this;
        } else if(dx===1&&dy===0 &&
          this.ref.right && node.ref.left){
            this.right = node;
            node.left = this;
        } else {
            return false; // failed
        }
        return true;
    }
    
    delinks(){
        if(this.up){
            this.up.down = null;
            this.up = null;
        }
        if(this.left){
            this.left.right = null;
            this.left = null;
        }
        if(this.down){
            this.down.up = null;
            this.down = null;
        }
        if(this.right){
            this.right.left = null;
            this.right = null;
        }
    }
}

class Graph{
    constructor(map){
        this.ref = map;
    }
    
    checkfrom(blc){
        var ref = this.ref;
        var start = new Node(blc);
        var blcrec = [blc],
            nodrec = [start],
            nulrec = [];
        
        function explore(node){
            var checks = [
                [node.up   , [ 0,-1]],
                [node.left , [-1, 0]],
                [node.down , [ 0, 1]],
                [node.right, [ 1, 0]]
            ];
            var nextexplores = [];
            for(var _ of checks)
            if(_[0]===null){// need up
                // get upper block
                var c = ref.data
                  [node.ref.pos.x+_[1][0]];
                if(c)
                    c = c
                  [node.ref.pos.y+_[1][1]];
                
                if(c){// upper exists
                    // get upper node
                    var nod;
                    if(blcrec.includes(c))
                        // from blcrec
                        nod = nodrec [blcrec.indexOf(c)];
                    else
                        // new Node
                        nod = new Node(c);
                    // check linkable
                    var suc = node.trylink (nod);
                    if(suc){
                        if(!nodrec. includes(nod)){
                            blcrec.push(c);
                            nodrec.push (nod);
                            nextexplores. push(nod);
                        }
                    } else if(!nulrec. includes(node)) // unlinkable and not recorded
                        nulrec.push(node);
                } else if(!nulrec. includes(node)) // not exist and not recorded
                    nulrec.push(node);
            }
            
            for(var _ of nextexplores)
                explore(_);
        }
        
        explore(start);
        
        return [blcrec,nodrec,nulrec];
    }
    
    static allLoopsFrom(checks){
        // [blcrec,nodrec,nulrec]
        // currently only for nulrec=[]
        
        // get gate amount of a block
        function gates(node){
            return node.ref.connections. replace(/0/g, "").length;
        }
        
        //start with most bottom-right
        function first(nodes){
            var br = nodes[0];
            for(var n of nodes)
                if(n.ref.pos.y>br.ref.pos.y
              ||(n.ref.pos.y===br.ref.pos.y
              &&n.ref.pos.x>br.ref.pos.x))
                    br = n;
            return br;
        }
        
        // all nodes have amounts as gates
        var nodes = [];
        for(var node of checks[1])
            for(var _ of range(gates(node)))
                nodes.push(node);
        
        // start finding all loops
        var loops = [];
        
        function getLoops(dirfrom, dirto){
        var node = first(nodes);
        var direc = (dirfrom+3)%4; //0u~3r
        var currloop = [node];
        var count=0; // avoid infinite bug
        while(++count<100){
            for(var d of range(direc+5, direc+2,-1)){ // left, front, right
                var next = [node.up,
                            node.left,
                            node.down,
                            node.right][d%4];
                if(next){
                    currloop.push(next);
                    node = next;
                    direc = d%4;
                    break;
                }
            }
            
            if(node.equals(currloop[0]) && direc===dirto){ // back to first
                loops.push(currloop);
                for(var n of range(currloop.length-1))
                    nodes.splice (nodes.indexOf(currloop[n]), 1);
                break;
            }
            //console.log("continue");
        }
        }
        
        
        // first with leftwards
        getLoops(1,2);
        while(nodes[0])
            getLoops(0,3);
        
        return loops;
    }
}





// ------------ Position ------------
class Position{
    constructor(pos){
        this.x = pos[0];
        this.y = pos[1];
    }
    
    equals(pos){
        return this.x===pos.x && this.y===pos.y;
    }
    
    toString(){
        return "("+this.x+", "+this.y+")";
    }
    
    toArray(){
        return [this.x, this.y];
    }
    
    copy(){
        return new Position (this.toArray());
    }
}





//    -----------  canvas  -----------

function canvasObject(canvas){
    var obj = {cv: canvas};
    obj.ctx = obj.cv.getContext("2d");
    obj.draw = draw(obj.cv);
    obj.clear = clear(obj.cv);
    return obj;

  // inner functions
  function draw(canvas){
    var ctx = canvas.getContext("2d");
    var rect = function(x,y,w,h,c){
        ctx.fillStyle = c || ctx.fillStyle;
        ctx.beginPath();
        ctx.rect(x,y,w,h);
        ctx.fill();
    };
    var circ = function(x,y,r,c){
        ctx.fillStyle = c || ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fill();
    };
    return {rect:rect, circ:circ};}

  function clear(canvas){
    var ctx = canvas.getContext("2d");
    var all = function(){
        ctx.clearRect (0,0,canvas.width,canvas.height);
    };
    var rect= function(x,y,w,h){
        ctx.clearRect(x,y,w,h);
    };
    var circ= function(x,y,r){
        for(var j=-r;j<=r;j++){
            var hw = Math.sqrt(r*r-j*j);
            rect(x-hw,y-j,hw*2+1,1);
        }
    };
    return {all:all, rect:rect, circ:circ};}
}



//  ------------ objects -------------







// ------------ tools ------------


function getColor(context, x, y){
    var data = context.getImageData(x,y,1,1).data;
    return {r:data[0], g:data[1], b:data[2], a:data[3], color: "rgba("+data.join(",")+")", colorCode: "#" + Array.from(data).map(c=>c.toString(16). padEnd(2, "0").toUpperCase()).join("")};
}

function getEl(el){
    return document.getElementById(el);
}

function randint(dl,ul){
    return Math.floor(Math.random()*(ul-dl+1))+dl;
}

function randfrom(arr){
    return arr[randint(0,arr.length-1)];
}

function shuffle(arr){
    var l = arr.length;
    while(--l>0){
        var rd = randint(0,l);
        [arr[rd],arr[l]]=[arr[l],arr[rd]];
    }
}

function range(start, stop, step){
    if (stop===X)
        stop=start, start=0, step=1;
    else if (step===0 || step===X)
        step = (stop>start)? 1: -1;
    var list = [];
    while ((start-step-stop)*(stop-start)<0){
        list.push(start);
        start += step;
    }
    
    return list;
}





function bin(n){
    return n.toString(2);
}

function ljust(s, n, c=" "){
    return (range(n).map(()=>c).join("")+s).slice(-n);
}


// prototypes

String.prototype.ljust = function (n, c=" "){
    return ljust(this, n, c);
};

Array.prototype.exclude = function (arr){
    for(var _ of range(this.length-1,-1,-1))
        if(arr.includes(this[_]))
            this.splice(_, 1);
    return this;
}

Array.prototype.toSet = function (){
    var tmp = [];
    for(var a of this)
        if(tmp.indexOf(a)<0)
            tmp.push(a);
    return tmp;
}


function timeStart(){
    function timefrom(start){
        var t = Date.now() - start;
        var ms= (""+t%1000).ljust(3, "0");
        t = Math.floor(t/1000);
        var sec= (""+t%60).ljust(2, "0");
        t = Math.floor(t/60);
        var min= (""+t%60).ljust(2, "0");
        t = Math.floor(t/60);
        var hr = t;
        return [hr,min,sec].join(":") + "." + ms;
    }
    var starttime = Date.now();
    setInterval(()=>{
        getEl("time").innerText = timefrom(starttime);
    }, 10);
}

/* 

    #############################################################
      
          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

(   By ~Aryan Maurya Mr.perfect https://amsrportfolio.netlify.app  )

          @@@@@@@@@@    &&&&&&&&&&&&&&&&&&&    %%%%%%%%%%

    #############################################################

*/