const canvas = document.getElementById("myCanvas"); //<canvas>の要素への参照をcanvasに保存
const ctx = canvas.getContext("2d");                //2D描画コンテキストを保存

//ボールを動かす
//Ⅰ 描画ループの定義　Ⅱ　ボール動かす
let x = canvas.width / 2;
let y = canvas.height -30;
let dx = 2;                                       //描画するごとに動いているx軸方向
let dy = -2;                                      //描画するごとに動いているy軸方向
let ballRadius = 10;                              //円の半径保持
let paddleHeight = 10;                            //パドル高さ
let paddleWidth = 75;                             //パドル幅
let paddleX = (canvas.width - paddleWidth) /2;    //x軸上の開始地点
let rightPressed = false;
let leftPressed  = false;                         //パドルを右また左を押しているかどうかの判定する変数

/**
 * ブロックの行と列の数、幅と高さ、ブロックがくっつかないようにするブロック間の隙間
 * キャンバスの端に描画されないようにするための上端、左端からの相対位置を定義
 */
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

let score = 0;                                   //点数記録
var lives = 3;

let gameStarted = false;                         // ゲームが開始されたかどうかのフラグ

/**
 * 行と列を通してループし、新しいブロックを作る(衝突検出のためにも使われる)
 */
var bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0,status:1 };
  }
}

document.addEventListener("keydown",keyDownHandler,false); //キーを押したとき検知
document.addEventListener("keyup",keyUpHandler,false);     //キーを離したとき検知
document.addEventListener("mousemove", mouseMoveHandler, false); //マウスを動かしたとき反応
/**
 * イベント関数　E/Edge に対応するために、 Left と Rightも確認する必要がある
 */

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
      rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
      leftPressed = false;
    }
  }
function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
      paddleX = relativeX - paddleWidth / 2;
    }
}

function drawStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア
    ctx.font = "22px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.textAlign = "center";
   // テキスト行の配列を作成
    const lines = [
     "Enter を押してスタート!!",
     "残機が減るほどボールが速くなります",
     "(The fewer lives left, the faster the ball will go.)"
    ];

    // 各行の描画位置を計算
    const lineHeight = 30; // 行間の高さ
    const startX = canvas.width / 2;
    let startY = canvas.height / 2 - (lines.length * lineHeight) / 2; // テキストを画面の中央に配置

    // 各行を描画
    lines.forEach(line => {
        ctx.fillText(line, startX, startY);
        startY += lineHeight; // 次の行のために位置を更新
    });
}


document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !gameStarted) {
        gameStarted = true;
    } else if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
});

document.addEventListener("keyup", function (e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
});
/**
 * 毎フレーム描画されるたびに全てのブロックを通してループして
 * ひとつひとつのブロックの位置をボールの座標と比較する衝突検出関数
 * 
 * ボールの向きを変える条件
 * ボールの x 座標がブロックの x 座標より大きい
 * ボールの x 座標がブロックの x 座標とその幅の和より小さい
 * ボールの y 座標がブロックの y 座標より大きい
 * ボールの y 座標がブロックの y 座標とその高さの和より小さい
 */
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
        if (b.status == 1) {  //当たったらブロックを画面に表示しないようにする
            if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                dy = -dy;
                b.status = 0;
                score++;
                if (score === brickRowCount * brickColumnCount) {
                    alert("Game Clear!!");
                    document.location.reload();
                    clearInterval(interval);  //ゲームを終わらせるためにInterval解除
                }
            }

        }
       }
    }
}

function drawScore() {
    ctx.font = "16px Arial";            //文字の大きさとフォントの種類設定
    ctx.fillStyle = "#0095DD";          
    ctx.fillText(`Score: ${score}`, 60, 20);   //キャンパス上に配置される文字
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Lives: "+lives, canvas.width-65, 20);
}

/**
 * ボールが存在する関数
 * 
 * @author Y.Maekawa
 */

function drawBall(){
    //ctx.clearRect(0, 0, canvas.width, canvas.height); //各フレームの前にキャンバスを削除(ブロックの生成が1回限りのためいらない)
    ctx.beginPath();
    ctx.arc(x,y,ballRadius,0,Math.PI*2); //ボールを描画している(ctx.arc(x,y,radius,startAngle,endAngle,(countClockWise)))
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
}

/**
 * パドル生成関数
 */

function drawPaddle(){
    ctx.beginPath();     //描画を始める合図
    ctx.rect(paddleX,canvas.height - paddleHeight , paddleWidth , paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();    //始点と終点をつなげる(描画終了)
}
/**
 * ブロックを画面上に描画
 */

function drawBricks() {
    for(let c=0; c<brickColumnCount; c++) {
        for(let r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status === 1){
            var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft; //ブロックは正しい行、列に間隔を空けて置かれ、左上端から一定の位置に描画
            var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop; //こっちが列
            bricks[c][r].x = brickX;
            bricks[c][r].y = brickY;
            ctx.beginPath();
            ctx.rect(brickX, brickY, brickWidth, brickHeight);
            ctx.fillStyle = "#0095DD";
            ctx.fill();
            ctx.closePath();
            }
        }
    }
}

/**
 * 10ms毎にボールが描かれる関数
 * if文は 上辺に当たったら反射、下辺に当たったらゲームオーバー表示
 */
function draw(){
    if (!gameStarted) {
        drawStartScreen();
        return;
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);    //前に描画されたボールを消す
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();
    if(x + dx >canvas.width-ballRadius || x + dx <ballRadius){   //画面縁に触れたら反射(x軸)
       dx = -dx;
    }
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth){   //ボールの当たり判定(パドルの端までをボールの中心が当たると跳ね返る)
            dy = -dy;
        }
        else {
            lives--;
            if(!lives) {
              alert("GAME OVER");
              document.location.reload();
            }
            else {
              x = canvas.width/2;
              y = canvas.height-30;
              dx = dx+1;
              dy = dy+1;
              paddleX = (canvas.width-paddleWidth)/2;
            }
      }
}
    if(rightPressed) {
        paddleX += 7;
        if (paddleX + paddleWidth > canvas.width){
            paddleX = canvas.width - paddleWidth;
        }
    }
    else if(leftPressed) {
        paddleX -= 7;
        if (paddleX < 0){
            paddleX = 0;
        }
    }
    x += dx;
    y += dy;
}

var interval =  setInterval(draw,10);                                       //draw関数(関数名,ミリ秒)
















/*//キャンバスを作って描画(例)

ctx.beginPath();
ctx.rect(20,40,50,50);                              //四角形定義
ctx.fillStyle = "FF0000";                           //赤色
ctx.fill();
ctx.closePath();

ctx.beginPath();
ctx.arc(240,160,20,0,Math.PI *2 , false);           //円定義
ctx.fillStyle = "green";
ctx.fill();
ctx.closePath();

ctx.beginPath();
ctx.rect(160,10,100,40);                            
ctx.strokeStyle = "rgba(0,0,255,0.5)"                //青く縁どられた四角形を描画
ctx.strokeStyle();
ctx.closePath();

//ボールを動かす
*/


/** この課題で新しく学んだこと
 * ◇HTML
 * Canvas グラフィックやアニメーションを描画する要素
 * (lang) en-US アメリカ英語
 * ◇JS 
 * 型　const   定数定義
 * 命令は　beginPath()　と　closePath() で囲む
 * 
 * 
 * 
*/