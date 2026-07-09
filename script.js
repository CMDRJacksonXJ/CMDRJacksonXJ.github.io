// This is a game about gaining a lot of points. Really quickly.
// As is right now, pretty horribly optimized. Ah, whatever. Let's hope it doesn't bite me in the ass later.
// Dev note: it bit me in the ass later. I now have to put all of the variables in a JSON and rewrite a good chunk of the game...
// let totalHoursSpentDeveloping = 16;
// if anyone sees this, thanks to galaxy's Oversight committee for helping me identify what was wrong in the game

// Define game variables
initialGameState = {
    points: 0,
    pointsPerClick: 1,
    pointsPerSecond: 0,
    upgrade1Cost: 20,
    upgrade1Bought: 0,
    upgrade2Cost: 500,
    upgrade2Bought: 0,
    upgrade3Cost: 1000000,
    upgrade3Bought: 0,
    upgrade3Cap: 10,
    multUpgrade1Cost: 100000,
    multUpgrade1Bought: 0,
    upgradeUnlockMultiplierBought: false,
    multUpgradePointBoostBought: false,
    multiplier: 1.000,
    multiplierPerSecond: 0.001,
    prestigeUnlockThresholdReached: false,

    electrons: 0,
    electronUpgradeTripler: false,
    electronUpgradeM2Improvement: false,
    electronUpgradePersistence: false,
    electronUpgradeAutomation: false,
    electronUpgradeUpgradeAutomation: false,
    electronUpgradeUpgradeAutomationEnabled: false,
    electronUpgrade4Cost: 10,
    electronUpgrade4Bought: 0,
    electronUpgrade4Cap: 12,
    electronUpgrade5Cost: 50,
    electronUpgrade5Bought: 0,
    electronUpgrade5Cap: 5,
    electronPrestiged: false,
    ranksUnlocked: false,

    rank: 0,
    sacrificedElectrons: 0,
    progress: 0,
    progressRequirement: 200000000,
    multUpgrade1BoughtEver: 0,
    upgrade3BoughtEver: 0,
    timeSinceLastElectronReset: 0,
    timeSinceLastUpgradeOrReset: 0
};

gameState = initialGameState;

let ticks = 0;

// Define HTML elements

const pointsText = document.getElementById("points-text");
const passiveText = document.getElementById("pps-text");
const pointsButton = document.getElementById("pointsButton");
const upgrade1Button = document.getElementById("upgrade1Button");
const upgrade2Button = document.getElementById("upgrade2Button");
const upgrade3Button = document.getElementById("upgrade3Button");
const multiplierButton = document.getElementById("multUnlockButton");
const multiplierText = document.getElementById("multiplier-text");
const passiveMultText = document.getElementById("mps-text");
const multUpgrade1Button = document.getElementById("multUpgrade1Button");
const multUpgrade2Button = document.getElementById("multUpgrade2Button");
const electronText = document.getElementById("electrons-text");
const electronBoostText = document.getElementById("electrons-boost-text");
const resetButton = document.getElementById("resetButton");
const electronWarningText = document.getElementById("electron-warning");
const electronUpgrade1Button = document.getElementById("electronUpgrade1Button");
const electronUpgrade2Button = document.getElementById("electronUpgrade2Button");
const electronUpgrade3Button = document.getElementById("electronUpgrade3Button");
const electronUpgradeAButton = document.getElementById("electronUpgradeAButton");
const electronUpgrade4Button = document.getElementById("electronUpgrade4Button");
const electronUpgrade5Button = document.getElementById("electronUpgrade5Button");
const electronUpgradeXButton = document.getElementById("electronUpgradeXButton");

const prestigeContainer1 = document.getElementById("prestige-base");
const prestigeContainer2 = document.getElementById("prestige-upgrades");
const rankContainer = document.getElementById("ranks");

const rankText = document.getElementById("rank-text");
const progressText = document.getElementById("progress");
const electronsSacrificedText = document.getElementById("sacrificed-text");
const rankBoostText1 = document.getElementById("rank-boost-text1");
const rankBoostText2 = document.getElementById("rank-boost-text2");
const rankBoostText3 = document.getElementById("rank-boost-text3");
const rankBoostText4 = document.getElementById("rank-boost-text4");

const unlocksTextPoints = document.getElementById("unlocks-points");
const unlocksTextMulti = document.getElementById("unlocks-multiplier");
const unlocksTextElectrons = document.getElementById("unlocks-electrons");

let savedData = localStorage.getItem('IGAGMPSave');

if (savedData) {
    gameState = JSON.parse(savedData);
    for (let element_initial in initialGameState) {
        if (!gameState.element_initial) {
            gameState.element_initial = initialGameState.element_initial;
        }
    }
}

setInterval(game, 20);


// Formats numbers

function formatNumber(number, decimals) {
    if (number < 1000000) {
        return Intl.NumberFormat('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals}).format(number);
    } else if (number < 1000000000) {
        return (number / 1000000).toFixed(3) + " million";
    } else if (number < 1000000000000) {
        return (number / 1000000000).toFixed(3) + " billion";
    } else if (number < 1000000000000000) {
        return (number / 1000000000000).toFixed(3) + " trillion";
    } else {
        return (number / Math.pow(10, Math.floor(Math.log10(number)))).toFixed(3) + "e" + Math.floor(Math.log10(number));
    }
    
}

// Calculates prestige gains on electron reset given current points, multiplier, and EU5 purchases

function calculateElectronGain(points_e, multiplier_e, eu5bought) {
    return Math.pow(points_e / 10000000000, 0.5 + (0.03 * eu5bought)) * Math.pow(multiplier_e, (100 + (eu5bought * 16)) / 600);
}

// Calculates the boost to points given a certain number of electrons

function calculateElectronBoost(electrons_c) {
    return Math.pow(electrons_c + 1, (2/3));
}

// Calculates the boost to progress gain given a certain number of sacrificed electrons and multiplier

function calculateProgressGainPerSecond(electrons_sac, multiplier_cur) {
    return Math.pow(multiplier_cur, (1/3)) * Math.pow(electrons_sac, (4/3)) / 100;
}


// Update and hide things when needed

function game() {
    gameState.pointsPerClick = (1 + gameState.upgrade1Bought) * gameState.multiplier * Math.pow(2, gameState.upgrade3Bought) * Math.pow(1.5, gameState.electronUpgrade4Bought) * calculateElectronBoost(gameState.electrons);

    gameState.pointsPerSecond = gameState.pointsPerClick * 0.5 * gameState.upgrade2Bought * (1 + (gameState.multUpgrade1BoughtEver * (gameState.rank * 0.003))) * (1 + (gameState.timeSinceLastElectronReset * (gameState.rank * 0.001)));

    let EU1multiplier = 1;
    if (gameState.electronUpgradeTripler) {
        EU1multiplier = 3;
    } else {
        EU1multiplier = 1;
    }
    if (gameState.multUpgradePointBoostBought) {
        if (gameState.electronUpgradeM2Improvement) {
            gameState.multiplierPerSecond = (0.001 + (0.001 * gameState.multUpgrade1Bought)) * Math.log(gameState.points + 1) * (2/3) * EU1multiplier * (1 + (gameState.upgrade3BoughtEver * (gameState.rank * 0.003))) * (1 + (gameState.timeSinceLastElectronReset * (gameState.rank * 0.001)));
        } else {
            gameState.multiplierPerSecond = (0.001 + (0.001 * gameState.multUpgrade1Bought)) * Math.log10(gameState.points + 1) * EU1multiplier * (1 + (gameState.upgrade3BoughtEver * (gameState.rank * 0.003))) * (1 + (gameState.timeSinceLastElectronReset * (gameState.rank * 0.001)));
        }
        
    } else {
        gameState.multiplierPerSecond = (0.001 + (0.001 * gameState.multUpgrade1Bought)) * EU1multiplier * (1 + (gameState.upgrade3BoughtEver * (gameState.rank * 0.003))) * (1 + (gameState.timeSinceLastElectronReset * (gameState.rank * 0.001)));
    }
    gameState.points += gameState.pointsPerSecond / 50;

    if (gameState.timeSinceLastElectronReset % 10 > 9.99 || gameState.timeSinceLastElectronReset % 10 < 0.01) {
        saveGame();
    }

    gameState.timeSinceLastElectronReset += 0.02;
    gameState.timeSinceLastUpgradeOrReset += 0.02;
    ticks += 1;

    if (gameState.electronUpgradeUpgradeAutomation && gameState.electronUpgradeUpgradeAutomationEnabled && ticks % 5 == 0) {
        upgrade1Buy();
        upgrade2Buy();
        upgrade3Buy();
        multUnlockBuy();
        multUpgrade1Buy();
        multUpgrade2Buy();
    }

    if (gameState.upgradeUnlockMultiplierBought) {
        gameState.multiplier += gameState.multiplierPerSecond / 50;
    }

    if (gameState.electronUpgradeAutomation) {
        gameState.electrons += Math.pow(calculateElectronGain(gameState.points, gameState.multiplier, gameState.electronUpgrade5Bought) / 1000, Math.min(1 + (gameState.rank * 0.00000004 * gameState.timeSinceLastUpgradeOrReset), 1.25)) / 50;
    }

    if (gameState.points > 10000000000 && gameState.multUpgradePointBoostBought) {
        gameState.prestigeUnlockThresholdReached = true;
    }

    if (gameState.electrons > 100000 && gameState.electronUpgradeAutomation) {
        gameState.ranksUnlocked = true;
    }

    if (gameState.rank > 1000) {
        gameState.rank = 1000;
    }


    if (gameState.ranksUnlocked) {
        gameState.progress += calculateProgressGainPerSecond(gameState.sacrificedElectrons, gameState.multiplier) / 50;
        if (gameState.progress > gameState.progressRequirement && gameState.rank != 1000) {
            gameState.progress -= gameState.progressRequirement;
            gameState.rank++;
            gameState.progressRequirement = 200000000 * (1 + Math.pow(gameState.rank, (1 + (Math.min(gameState.rank, 500) / 15))));
        }
    }

    pointsText.textContent = "points: " + formatNumber(gameState.points, 2);
    passiveText.textContent = "per second: " + formatNumber(gameState.pointsPerSecond, 2);
    if (gameState.upgrade1Bought < 10) {
        unlocksTextPoints.textContent = "next upgrade at 10 purchases of [B1]";
    } else if (gameState.pointsPerSecond < 500) {
        unlocksTextPoints.textContent = "next feature at 500 points per second";
    } else if (gameState.multUpgrade1Bought < 15) {
        unlocksTextPoints.textContent = "next upgrade at 15 purchases of [M1] (unlock multiplier first)";
    } else {
        unlocksTextPoints.textContent = "all stage 1a features unlocked";
    }
    pointsButton.textContent = "+" + formatNumber(gameState.pointsPerClick, 2) + " points";
    upgrade1Button.textContent = "[B1] +1 base points per click - cost: " + formatNumber(gameState.upgrade1Cost, 2) + ", bought: " + gameState.upgrade1Bought;
    upgrade2Button.textContent = "[B2] +50% of your click in points every second - cost: " + formatNumber(gameState.upgrade2Cost, 2)  + ", bought: " + gameState.upgrade2Bought;
    if (gameState.upgrade3Bought < gameState.upgrade3Cap) {
        upgrade3Button.textContent = "[B3] (" + gameState.upgrade3Bought + " / 10) double total point gain - cost: " + formatNumber(gameState.upgrade3Cost, 2);
        upgrade3Button.style.backgroundColor = 'lightblue';
    } else {
        upgrade3Button.textContent = "[B3] (10 / 10) double total point gain - maxed!";
        upgrade3Button.style.backgroundColor = 'lightseagreen';
    }
    multiplierText.textContent = "multiplier: " + formatNumber(gameState.multiplier, 3) + "×";
    passiveMultText.textContent = "per second: +" + formatNumber(gameState.multiplierPerSecond, 3) + "×";
    if (gameState.multiplier < 5) {
        unlocksTextMulti.textContent = "next upgrade at 5.000× multiplier";
    } else if (!gameState.prestigeUnlockThresholdReached || !gameState.multUpgradePointBoostBought) {
        unlocksTextMulti.textContent = "next feature at 10.000 billion points and after buying [M2]";
    } else {
        unlocksTextMulti.textContent = "all stage 1b features unlocked";
    }
    multUpgrade1Button.textContent = "[M1] +0.001× per second - cost: " + formatNumber(gameState.multUpgrade1Cost, 2)  + ", bought: " + gameState.multUpgrade1Bought;
    electronText.textContent = "electrons: " + formatNumber(gameState.electrons, 2);
    electronBoostText.textContent = "currently boosting points by " + formatNumber(calculateElectronBoost(gameState.electrons), 3) + "×";
    if ((gameState.electronUpgrade4Bought != gameState.electronUpgrade4Cap || gameState.electronUpgrade5Bought != gameState.electronUpgrade5Cap)) {
        unlocksTextElectrons.textContent = "next upgrade after maxing out [E4] and [E5]";
    } else if (gameState.ranksUnlocked || !gameState.electronUpgradeAutomation) {
        unlocksTextElectrons.textContent = "next upgrade after buying [EX] and reaching 100,000.00 electrons";
    } else {
        unlocksTextElectrons.textContent = "all stage 2 features unlocked";
    }
    resetButton.textContent = "reset all progress so far for " + formatNumber(calculateElectronGain(gameState.points, gameState.multiplier, gameState.electronUpgrade5Bought), 2) + " electrons";

    if (gameState.electronUpgradeUpgradeAutomation) {
        if (gameState.electronUpgradeUpgradeAutomationEnabled) {
            electronUpgradeAButton.textContent = "[EA] upgrade automation ON";
        } else {
            electronUpgradeAButton.textContent = "[EA] upgrade automation OFF";
        }
    }
    
    if (gameState.electronUpgrade4Bought < gameState.electronUpgrade4Cap) {
        electronUpgrade4Button.textContent = "[E4] (" + gameState.electronUpgrade4Bought + " / " + gameState.electronUpgrade4Cap + ") 1.5× total point gain - cost: " + formatNumber(gameState.electronUpgrade4Cost, 2) + " e";
        electronUpgrade4Button.style.backgroundColor = 'magenta';
    } else {
        electronUpgrade4Button.textContent = "[E4] (" + gameState.electronUpgrade4Bought + " / " + gameState.electronUpgrade4Cap + ") 1.5× total point gain - maxed!";
        electronUpgrade4Button.style.backgroundColor = 'purple';
    }
    if (gameState.electronUpgrade5Bought < gameState.electronUpgrade5Cap) {
        electronUpgrade5Button.textContent = "[E5] (" + gameState.electronUpgrade5Bought + " / " + gameState.electronUpgrade5Cap + ") improve the prestige formula - cost: " + formatNumber(gameState.electronUpgrade5Cost, 2) + " e";
        electronUpgrade5Button.style.backgroundColor = 'magenta';
    } else {
        electronUpgrade5Button.textContent = "[E5] (" + gameState.electronUpgrade5Bought + " / " + gameState.electronUpgrade5Cap + ") improve the prestige formula - maxed!";
        electronUpgrade5Button.style.backgroundColor = 'purple';
    }

    if (gameState.rank < 1000) {
        rankText.textContent = "rank: " + gameState.rank;
    } else {
        rankText.textContent = "rank: 1000 (MAX)"
    }
    progressText.textContent = "progress: " + formatNumber(gameState.progress, 2) +" / " + formatNumber(gameState.progressRequirement, 2) + " (" + formatNumber(calculateProgressGainPerSecond(gameState.sacrificedElectrons, gameState.multiplier), 2) + " per second)"
    electronsSacrificedText.textContent = "you have sacrificed " + formatNumber(gameState.sacrificedElectrons, 2) + " electrons, granting a " + formatNumber(Math.pow(gameState.sacrificedElectrons, (4/3)), 3) + "× multiplier to progress"
    rankBoostText1.textContent = "your rank is currently giving a +" + formatNumber(gameState.rank * 0.3, 1) + "% boost to points per second for every [M1] you've ever bought (currently " + formatNumber(1 + (gameState.rank * 0.003 * gameState.multUpgrade1BoughtEver), 3) + "×)"
    rankBoostText2.textContent = "as well as a +" + formatNumber(gameState.rank * 0.3, 1) + "% boost to multiplier for every [B3] you've ever bought (currently " + formatNumber(1 + (gameState.rank * 0.003 * gameState.upgrade3BoughtEver), 3) + "×)"
    rankBoostText3.textContent = "as well as a +" + formatNumber(gameState.rank * 0.1, 1) + "% boost to both for every second spent in this electron reset (currently " + formatNumber(1 + (gameState.rank * 0.001 * gameState.timeSinceLastElectronReset), 3) + "×)"
    rankBoostText4.textContent = "and finally a ^+" + formatNumber(gameState.rank * 0.00000004, 8) + " boost to passive electron gain for every second spent without purchasing an upgrade in this electron reset (currently ^" + formatNumber(Math.min(1 + (gameState.rank * 0.00000004 * gameState.timeSinceLastUpgradeOrReset), 1.25), 8) + ", capped at ^1.25000000)"

    if (gameState.upgrade1Bought < 10) {
        upgrade2Button.style.display = 'none';
    } else {
        upgrade2Button.style.display = 'inline-block';
    }
    if (gameState.upgrade2Bought == 0) {
        passiveText.style.display = 'none';
    } else {
        passiveText.style.display = 'block';
    }
    if (gameState.multUpgrade1Bought < 15) {
        upgrade3Button.style.display = 'none';
    } else {
        upgrade3Button.style.display = 'inline-block';
    }
    if (gameState.pointsPerSecond < 500 || gameState.upgradeUnlockMultiplierBought) {
        multiplierButton.style.display = 'none';
    } else {
        multiplierButton.style.display = 'inline-block';
    }
    if (!gameState.upgradeUnlockMultiplierBought) {
        multiplierText.style.display = 'none';
        passiveMultText.style.display = 'none';
        multUpgrade1Button.style.display = 'none';
        multUpgrade2Button.style.display = 'none';
    } else {
        multiplierText.style.display = 'block';
        passiveMultText.style.display = 'block';
        multUpgrade1Button.style.display = 'inline-block';
        if (gameState.multiplier < 5 || gameState.multUpgradePointBoostBought) {
            multUpgrade2Button.style.display = 'none';
        } else {
            multUpgrade2Button.style.display = 'inline-block';
        }
    }

    if (!gameState.prestigeUnlockThresholdReached) {
        prestigeContainer1.style.display = 'none';
    } else {
        prestigeContainer1.style.display = 'block';
    }
    if (!gameState.electronPrestiged) {
        prestigeContainer2.style.display = 'none';
        electronWarningText.style.display = 'block';
    } else {
        prestigeContainer2.style.display = 'block';
        electronWarningText.style.display = 'none';
    }
    if (gameState.electronUpgradeTripler) {
        electronUpgrade1Button.style.display = 'none';
    } else {
        electronUpgrade1Button.style.display = 'block';
    }
    if (gameState.electronUpgradeM2Improvement) {
        electronUpgrade2Button.style.display = 'none';
    } else {
        electronUpgrade2Button.style.display = 'block';
    }
    if (gameState.electronUpgradePersistence) {
        electronUpgrade3Button.style.display = 'none';
    } else {
        electronUpgrade3Button.style.display = 'block';
    }
    if ((gameState.electronUpgrade4Bought != gameState.electronUpgrade4Cap || gameState.electronUpgrade5Bought != gameState.electronUpgrade5Cap) || gameState.electronUpgradeAutomation) {
        electronUpgradeXButton.style.display = 'none';
    } else {
        electronUpgradeXButton.style.display = 'block';
    }
    if (!gameState.ranksUnlocked) {
        rankContainer.style.display = 'none';
    } else {
        rankContainer.style.display = 'block';
    }
    if (!gameState.upgradeUnlockMultiplierBought) {
        unlocksTextMulti.style.display = 'none';
    } else {
        unlocksTextMulti.style.display = 'block';
    }
}

function saveGame() {
    localStorage.setItem('IGAGMPSave', JSON.stringify(gameState));
    console.log('Game saved!');
}


function gainPoint() {
    gameState.points += gameState.pointsPerClick;
}

function upgrade1Buy() {
    if (gameState.points >= gameState.upgrade1Cost) {
        gameState.points -= gameState.upgrade1Cost;
        gameState.upgrade1Cost *= 1.085;
        gameState.upgrade1Bought++;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
}

function upgrade2Buy() {
    if (gameState.points >= gameState.upgrade2Cost) {
        gameState.points -= gameState.upgrade2Cost;
        gameState.upgrade2Cost *= 1.12;
        gameState.upgrade2Bought++;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
}

function upgrade3Buy() {
    if (gameState.points >= gameState.upgrade3Cost && gameState.upgrade3Bought < gameState.upgrade3Cap) {
        gameState.points -= gameState.upgrade3Cost;
        gameState.upgrade3Cost *= 7;
        gameState.upgrade3Bought++;
        gameState.upgrade3BoughtEver++;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
}

function multUnlockBuy() {
    if (gameState.points >= 100000 && !gameState.upgradeUnlockMultiplierBought) {
        gameState.points -= 100000;
        gameState.upgradeUnlockMultiplierBought = true;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
}

function multUpgrade1Buy() {
    if (gameState.points >= gameState.multUpgrade1Cost) {
        gameState.points -= gameState.multUpgrade1Cost;
        gameState.multUpgrade1Cost *= 1.15;
        gameState.multUpgrade1Bought++;
        gameState.multUpgrade1BoughtEver++;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
}

function multUpgrade2Buy() {
    if (gameState.points >= 25000000 && !gameState.multUpgradePointBoostBought) {
        gameState.points -= 25000000;
        gameState.multUpgradePointBoostBought = true;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
}

function resetGame() {
    gameState.electrons += calculateElectronGain(gameState.points, gameState.multiplier, gameState.electronUpgrade5Bought);
    gameState.electronPrestiged = true;
    gameState.points = 0;
    gameState.pointsPerClick = 1;
    gameState.pointsPerSecond = 0;
    gameState.upgrade1Cost = 20;
    gameState.upgrade1Bought = 0;
    gameState.upgrade2Cost = 500;
    gameState.upgrade2Bought = 0;
    gameState.upgrade3Cost = 1000000;
    gameState.upgrade3Bought = 0;
    gameState.multUpgrade1Cost = 100000;
    gameState.multUpgrade1Bought = 0;
    if (!gameState.electronUpgradePersistence) {
        gameState.upgradeUnlockMultiplierBought = false;
    }
    gameState.multUpgradePointBoostBought = false;
    gameState.multiplier = 1.000;
    gameState.multiplierPerSecond = 0.001;
    gameState.timeSinceLastElectronReset = 0;
    gameState.timeSinceLastUpgradeOrReset = 0;
}

function electronUpgrade1Buy() {
    if (gameState.electrons >= 5) {
        gameState.electrons -= 5;
        gameState.electronUpgradeTripler = true;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
}

function electronUpgrade2Buy() {
    if (gameState.electrons >= 15) {
        gameState.electrons -= 15;
        gameState.electronUpgradeM2Improvement = true;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
}

function electronUpgrade3Buy() {
    if (gameState.electrons >= 25) {
        gameState.electrons -= 25;
        gameState.electronUpgradePersistence = true;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
}

function electronUpgradeABuy() {
    if (gameState.electrons >= 200 && !gameState.electronUpgradeUpgradeAutomation) {
        gameState.electrons -= 200;
        gameState.electronUpgradeUpgradeAutomation = true;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
    if (gameState.electronUpgradeUpgradeAutomation) {
        gameState.electronUpgradeUpgradeAutomationEnabled = !gameState.electronUpgradeUpgradeAutomationEnabled;
    }
}
function electronUpgrade4Buy() {
    if (gameState.electrons >= gameState.electronUpgrade4Cost && gameState.electronUpgrade4Bought < gameState.electronUpgrade4Cap) {
        gameState.electrons -= gameState.electronUpgrade4Cost;
        gameState.electronUpgrade4Cost *= 1.7;
        gameState.electronUpgrade4Bought++;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
}

function electronUpgrade5Buy() {
    if (gameState.electrons >= gameState.electronUpgrade5Cost && gameState.electronUpgrade5Bought < gameState.electronUpgrade5Cap) {
        gameState.electrons -= gameState.electronUpgrade5Cost;
        gameState.electronUpgrade5Cost *= 2.5;
        gameState.electronUpgrade5Bought++;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
}

function electronUpgradeXBuy() {
    if (gameState.electrons >= 16000) {
        gameState.electrons -= 16000;
        gameState.electronUpgradeAutomation = true;
        gameState.timeSinceLastUpgradeOrReset = 0;
    }
}

function sacrificeElectrons(fraction_of) {
    gameState.sacrificedElectrons += gameState.electrons * fraction_of
    gameState.electrons -= gameState.electrons * fraction_of
}