let myRobot;
let backgroundImg;
let bidons = [];
let spuiten = [];
let score;
let timeLeft = 20;
let restartButton;
let gameSound;
let startButton;
let gameOn = false;

let windstoten = [];
let windRichting;
let weatherData;
let windSnelheid;
let windDirection;

let level = 1;
let nextLevelButton;

//weerdata ophalen en windsnelheid obv windstoten en angle obv degree
function gotWeatherData(data) {
    weatherData = data;
    if (weatherData) {
        windSnelheid = weatherData.wind.gust;
        windDirection = weatherData.wind.deg;
        windRichting = windDirection;
    }
}

function preload() {
    backgroundImg = loadImage('data/cobbles.jpg');
    soundFormats('MP3');
    gameSound = loadSound('data/Rodania.mp3');
    winningSound = loadSound('data/TomBoonen.mp3');
    bidonSound = loadSound('data/bidonsound.mp3');
    spuitSound = loadSound('data/spuitsound.mp3');
    //Load current weatherdata in Kortrijk
    loadJSON('https://api.openweathermap.org/data/2.5/weather?q=Kortrijk,be&appid=276a00d1cf36f1c2b52ae48758fce6ea', gotWeatherData);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    backgroundImg.resize(width, height);
    myRobot = new robot(70, -70, 5);
    myRobot.yPos = height - 50;
    score = 0;

    startButton = createButton("Play!");
    startButton.mouseClicked(gameStarted);
    startButton.size(100, 50);
    startButton.style("font-family", "Arial");
    startButton.style("font-size", "20px");
    startButton.position(width / 2 - 50, height / 2 + 50);

    restartButton = createButton("Replay!");
    restartButton.mouseClicked(restart);
    restartButton.size(100, 50);
    restartButton.style("font-family", "Arial");
    restartButton.style("font-size", "20px");
    restartButton.position(width / 2 - 50, height / 2 + 50);
    restartButton.hide();

    nextLevelButton = createButton("Next Level!");
    nextLevelButton.mouseClicked(nextLevel);
    nextLevelButton.size(100, 50);
    nextLevelButton.style("font-family", "Arial");
    nextLevelButton.style("font-size", "20px");
    nextLevelButton.position(width / 2 - 50, height / 2 + 150);
    nextLevelButton.hide();

    // Generate raindrops
    for (let i = 0; i < 100; i++) {
        let x = random(width);
        let y = random(height);
        let windSpeed = windSnelheid;
        windstoten.push(new windStoot(x, y, windRichting, windSpeed));
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    backgroundImg.resize(width, height);
}

function draw() {
    image(backgroundImg, 0, 0);
    myRobot.display(); //teken robot

    // Update and display each raindrop
    for (let i = 0; i < windstoten.length; i++) {
        let vlagen = windstoten[i];
        vlagen.update();
        vlagen.display();
    }

    if (gameOn) {
        //teken bidons
        for (let i = bidons.length - 1; i >= 0; i--) {
            let bidon = bidons[i];
            bidon.update();
            bidon.display();

            // kijken of bidon gepakt is
            if (myRobot.isRaak(bidon)) {
                score++;
                bidons.splice(i, 1);
                bidonSound.play();
            }

            // kijken of bidon gemist is
            if (bidon.yPos > height) {
                bidons.splice(i, 1);
            }
        }

        //teken spuiten
        for (let i = spuiten.length - 1; i >= 0; i--) {
            let spuit = spuiten[i];
            spuit.update();
            spuit.display();

            //kijken of spuit gepakt is
            if (myRobot.isRaak(spuit)) {
                score--;
                spuiten.splice(i, 1);
                spuitSound.play();
            }

            //kijken of spuit gemist is
            if (spuit.yPos > height) {
                spuiten.splice(i, 1);
            }
        }

        // Voeg nieuwe bidon of spuit toe elke seconde
        if (frameCount % 60 == 0) {
            if (level == 1) {
                if (random(1) < 0.5) {
                    bidons.push(new bidon(random(width), 0, random(3, 7), color(200), 0.3));
                }
                else {
                    spuiten.push(new spuit(random(width), 0, random(3, 7), color(200), 0.5));
                }
            }
            if (level == 2) {
                if (random(1) < 0.5) {
                    bidons.push(new bidon(random(width), 0, random(7, 11), color(200), 0.3));
                }
                else {
                    spuiten.push(new spuit(random(width), 0, random(7, 11), color(200), 0.5));
                }
            }
            if (level == 3) {
                if (random(1) < 0.5) {
                    bidons.push(new bidon(random(width), 0, random(11, 15), color(200), 0.3));
                }
                else {
                    spuiten.push(new spuit(random(width), 0, random(11, 15), color(200), 0.5));
                }
            }
        }

        // Toon score, time left en level
        fill(255);
        textSize(20);
        text('Score = ' + score, 20, 30);
        text('Time left: ' + timeLeft, width - 140, 30);
        text('Level ' + level, width / 2, 30);
        // Verminder time left
        timeLeft -= 1 / 60;

        //beëindig spel als de tijd op is
        if (timeLeft <= 0) {
            noLoop();
            gameSound.stop();
            winningSound.play();
            textSize(30);
            text('Game over! Your score is ' + score, width / 2 - 170, height / 2);
            restartButton.show();
            if (level < 3) {
                nextLevelButton.show();
            }
        }
    }
}
function gameStarted() {
    gameOn = true;
    gameSound.play();
    loop();
    startButton.hide();
}

function restart() {
    score = 0;
    timeLeft = 20;
    bidons = [];
    spuiten = [];
    winningSound.stop();
    gameSound.play();
    level = 1;
    loop();
    restartButton.hide();
    gameOn = true;
}

function nextLevel() {
    level += 1;
    score = 0;
    timeLeft = 20;
    bidons = [];
    spuiten = [];
    winningSound.stop();
    gameSound.play();
    loop();
    nextLevelButton.hide();
    restartButton.hide();
    gameOn = true;
}
