// This is a game about gaining a lot of points. Really quickly.
// As is right now, pretty horribly optimized in code space.
// let totalHoursSpentDeveloping = 7;

// Define game variables

let points = 0;
let pointsPerClick = 1;
let pointsPerSecond = 0;
let upgrade1Cost = 20;
let upgrade1Bought = 0;
let upgrade2Cost = 500;
let upgrade2Bought = 0;
let upgrade3Cost = 1000000;
let upgrade3Bought = 0;
let multUpgrade1Cost = 100000;
let multUpgrade1Bought = 0;
let upgradeUnlockMultiplierBought = false;
let multUpgradePointBoostBought = false;
let multiplier = 1.000;
let multiplierPerSecond = 0.001;
let prestigeUnlockThresholdReached = false;

// Variables for prestige layer I (electrons)

let electrons = 0;
let electronUpgradeTripler = false;
let electronUpgradeM2Improvement = false;
let electronUpgradePersistence = false;
let electronUpgrade4Cost = 10;
let electronUpgrade4Bought = 0;
let electronUpgrade5Cost = 50;
let electronUpgrade5Bought = 0;
let electronPrestiged = false;

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
const electronUpgrade1Button = document.getElementById("electronUpgrade1Button");
const electronUpgrade2Button = document.getElementById("electronUpgrade2Button");
const electronUpgrade3Button = document.getElementById("electronUpgrade3Button");
const electronUpgrade4Button = document.getElementById("electronUpgrade4Button");
const electronUpgrade5Button = document.getElementById("electronUpgrade5Button");

const prestigeContainer1 = document.getElementById("prestige-base");
const prestigeContainer2 = document.getElementById("prestige-upgrades");


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


// Update and hide things when needed

function game() {
    pointsPerClick = (1 + upgrade1Bought) * multiplier * Math.pow(2, upgrade3Bought) * Math.pow(1.5, electronUpgrade4Bought) * calculateElectronBoost(electrons);
    pointsPerSecond = pointsPerClick * 0.5 * upgrade2Bought;
    let EU1multiplier = 1;
    if (electronUpgradeTripler) {
        EU1multiplier = 3;
    } else {
        EU1multiplier = 1;
    }
    if (multUpgradePointBoostBought) {
        if (electronUpgradeM2Improvement) {
            multiplierPerSecond = (0.001 + (0.001 * multUpgrade1Bought)) * Math.log(points + 1) * (2/3) * EU1multiplier;
        } else {
            multiplierPerSecond = (0.001 + (0.001 * multUpgrade1Bought)) * Math.log10(points + 1) * EU1multiplier;
        }
        
    } else {
        multiplierPerSecond = (0.001 + (0.001 * multUpgrade1Bought)) * EU1multiplier;
    }
    points += pointsPerSecond * 50;

    if (upgradeUnlockMultiplierBought) {
        multiplier += multiplierPerSecond * 50;
    }

    if (points > 10000000000) {
        prestigeUnlockThresholdReached = true;
    }

    pointsText.textContent = "points: " + formatNumber(points, 2);
    passiveText.textContent = "per second: " + formatNumber(pointsPerSecond, 2);
    pointsButton.textContent = "+" + formatNumber(pointsPerClick, 2) + " points";
    upgrade1Button.textContent = "[B1] +1 base points per click - cost: " + formatNumber(upgrade1Cost, 2);
    upgrade2Button.textContent = "[B2] +50% of your click in points every second - cost: " + formatNumber(upgrade2Cost, 2);
    upgrade3Button.textContent = "[B3] double total point gain - cost: " + formatNumber(upgrade3Cost, 2);
    multiplierText.textContent = "multiplier: " + formatNumber(multiplier, 3) + "×";
    passiveMultText.textContent = "per second: +" + formatNumber(multiplierPerSecond, 3) + "×";
    multUpgrade1Button.textContent = "[M1] +0.001× per second - cost: " + formatNumber(multUpgrade1Cost, 2);
    electronText.textContent = "electrons: " + formatNumber(electrons, 2);
    electronBoostText.textContent = "currently boosting points by " + formatNumber(calculateElectronBoost(electrons), 3) + "×";
    resetButton.textContent = "reset all progress so far for " + formatNumber(calculateElectronGain(points, multiplier, electronUpgrade5Bought), 2) + " electrons";
    electronUpgrade4Button.textContent = "[E4] 1.5× total point gain - cost: " + formatNumber(electronUpgrade4Cost, 2) + " e";
    if (electronUpgrade5Bought < 5) {
        electronUpgrade5Button.textContent = "[E5] (" + electronUpgrade5Bought + " / 5) improve the prestige formula - cost: " + formatNumber(electronUpgrade5Cost, 2) + " e";
        electronUpgrade5Button.style.backgroundColor = 'magenta';
    } else {
        electronUpgrade5Button.textContent = "[E5] (5 / 5) improve the prestige formula - maxed!";
        electronUpgrade5Button.style.backgroundColor = 'purple';
    }

    if (upgrade1Bought < 10) {
        upgrade2Button.style.display = 'none';
    } else {
        upgrade2Button.style.display = 'inline-block';
    }
    if (upgrade2Bought == 0) {
        passiveText.style.display = 'none';
    } else {
        passiveText.style.display = 'block';
    }
    if (multUpgrade1Bought < 15) {
        upgrade3Button.style.display = 'none';
    } else {
        upgrade3Button.style.display = 'inline-block';
    }
    if (pointsPerSecond < 500 || upgradeUnlockMultiplierBought) {
        multiplierButton.style.display = 'none';
    } else {
        multiplierButton.style.display = 'inline-block';
    }
    if (!upgradeUnlockMultiplierBought) {
        multiplierText.style.display = 'none';
        passiveMultText.style.display = 'none';
        multUpgrade1Button.style.display = 'none';
        multUpgrade2Button.style.display = 'none';
    } else {
        multiplierText.style.display = 'block';
        passiveMultText.style.display = 'block';
        multUpgrade1Button.style.display = 'inline-block';
        if (multiplier < 5 || multUpgradePointBoostBought) {
            multUpgrade2Button.style.display = 'none';
        } else {
            multUpgrade2Button.style.display = 'inline-block';
        }
    }

    if (!prestigeUnlockThresholdReached) {
        prestigeContainer1.style.display = 'none';
    } else {
        prestigeContainer1.style.display = 'block';
    }
    if (!electronPrestiged) {
        prestigeContainer2.style.display = 'none';
    } else {
        prestigeContainer2.style.display = 'block';
    }
    if (electronUpgradeTripler) {
        electronUpgrade1Button.style.display = 'none';
    } else {
        electronUpgrade1Button.style.display = 'block';
    }
    if (electronUpgradeM2Improvement) {
        electronUpgrade2Button.style.display = 'none';
    } else {
        electronUpgrade2Button.style.display = 'block';
    }
    if (electronUpgradePersistence) {
        electronUpgrade3Button.style.display = 'none';
    } else {
        electronUpgrade3Button.style.display = 'block';
    }
}

function gainPoint() {
    points += pointsPerClick;
}

function upgrade1Buy() {
    if (points >= upgrade1Cost) {
        points -= upgrade1Cost;
        upgrade1Cost *= 1.085;
        upgrade1Bought++;
    }
}

function upgrade2Buy() {
    if (points >= upgrade2Cost) {
        points -= upgrade2Cost;
        upgrade2Cost *= 1.12;
        upgrade2Bought++;
    }
}

function upgrade3Buy() {
    if (points >= upgrade3Cost) {
        points -= upgrade3Cost;
        upgrade3Cost *= 7;
        upgrade3Bought++;
    }
}

function multUnlockBuy() {
    if (points >= 400000) {
        points -= 400000;
        upgradeUnlockMultiplierBought = true;
    }
}

function multUpgrade1Buy() {
    if (points >= multUpgrade1Cost) {
        points -= multUpgrade1Cost;
        multUpgrade1Cost *= 1.15;
        multUpgrade1Bought++;
    }
}

function multUpgrade2Buy() {
    if (points >= 25000000) {
        points -= 25000000;
        multUpgradePointBoostBought = true;
    }
}

function resetGame() {
    electrons += calculateElectronGain(points, multiplier, electronUpgrade5Bought);
    electronPrestiged = true;
    points = 0;
    pointsPerClick = 1;
    pointsPerSecond = 0;
    upgrade1Cost = 20;
    upgrade1Bought = 0;
    upgrade2Cost = 500;
    upgrade2Bought = 0;
    upgrade3Cost = 1000000;
    upgrade3Bought = 0;
    multUpgrade1Cost = 100000;
    multUpgrade1Bought = 0;
    if (!electronUpgradePersistence) {
        upgradeUnlockMultiplierBought = false;
    }
    multUpgradePointBoostBought = false;
    multiplier = 1.000;
    multiplierPerSecond = 0.001;
}

function electronUpgrade1Buy() {
    if (electrons >= 5) {
        electrons -= 5;
        electronUpgradeTripler = true;
    }
}

function electronUpgrade2Buy() {
    if (electrons >= 15) {
        electrons -= 15;
        electronUpgradeM2Improvement = true;
    }
}

function electronUpgrade3Buy() {
    if (electrons >= 25) {
        electrons -= 25;
        electronUpgradePersistence = true;
    }
}

function electronUpgrade4Buy() {
    if (electrons >= electronUpgrade4Cost) {
        electrons -= electronUpgrade4Cost;
        electronUpgrade4Cost *= 1.7;
        electronUpgrade4Bought++;
    }
}

function electronUpgrade5Buy() {
    if (electrons >= electronUpgrade5Cost && electronUpgrade5Bought < 5) {
        electrons -= electronUpgrade5Cost;
        electronUpgrade5Cost *= 2.5;
        electronUpgrade5Bought++;
    }
}