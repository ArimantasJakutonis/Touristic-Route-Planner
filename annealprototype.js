var fs = require('fs');




//Initial array of all touristic locations
var allLocations = [];
var initialSolution = [];
var difference = [];
var alpha = 0.95;
var temperature = 10;
let bestSolution;

function generateLocations(amount){
    for(var i = 0; i < amount; i++){
        allLocations[i] = {x: (Math.random() * 100), y: (Math.random() * 100)};
        console.log(allLocations[i]);
    }
    return allLocations;
}

// console.log(allLocations.length);

// Function to create an initial solution;
function getInitialSolution(a){
    //Copy allLocations
    let tempArray = a.slice();

    // Choose how many locations to include
    var howMany = Math.ceil((Math.random() * tempArray.length));
    // console.log(howMany);

    // Choose the order of them
    let counter = tempArray.length;
    while(counter > 0) {
        let index = Math.floor(Math.random() * counter);
        counter--;
        let temp = tempArray[counter];
        tempArray[counter] = tempArray[index];
        tempArray[index] = temp;
    }
    return tempArray.slice(0,howMany);
}

// First, we define a function to find which locations have not been included into our solution
function getDifference(fullArr, subArr){
    return fullArr.filter(d => !subArr.includes(d));
}

//Now we define 3 options to modify current solution

// Function 1: Add a new random touristic point to the end, takes array of unused locatiosn as an argument
function addPoint(differenceArr, arr){
    let temp = Math.floor(Math.random() * differenceArr.length);
    arr.push(differenceArr[temp]);
}

// Function 2: Remove a random point
function removePoint(arr){
    let temp = Math.floor(Math.random() * arr.length);
    arr.splice(temp,1);
}

// Function 3: Swap an existing point
function swapPoint(differenceArr, arr){
    let tempDiff = Math.floor(Math.random() * differenceArr.length);
    let temp = Math.floor(Math.random() * arr.length);

    arr[temp] = differenceArr[tempDiff];
}

function getTotalDistance(arr){
    console.log(arr.length);
    var initial = Math.sqrt((arr[0].x * arr[0].x) + (arr[0].y * arr[0].y));
    var totalDist = 0;
    totalDist += initial;
    console.log('\n' + '************************'+ '\n');
    console.log('0,0 to first point distance:' + totalDist + '\n');
    if(arr.length > 1){
        for(var i = 1; i < arr.length; i++){
            totalDist += Math.sqrt(Math.pow(Math.abs(arr[i].x-arr[i-1].x),2) + 
            Math.pow(Math.abs(arr[i].y-arr[i-1].y),2));
            console.log('distance to next point:' + totalDist + '\n');
        }
    }
    totalDist += Math.sqrt(Math.pow(Math.abs(arr[arr.length-1].x-100),2) + 
    Math.pow(Math.abs(arr[arr.length-1].y-100),2));
    console.log('Last point to 100,100: ' + totalDist + '\n');

    return totalDist;
}

function isFeasible(arr,maxDistance){
    if(getTotalDistance(arr) > maxDistance){
        return false;
    } else {
        return true;
    }
}

function getQuality(arr){
    return arr.length;
}

function generateNeighbour(arr,differenceArr){
    let temparray = arr.slice();
    var length = temparray.length;
    var differenceLength = differenceArr.length;

    if(length === 0 || length == 1){
        addPoint(differenceArr,temparray);
        console.log('\n' + 'Point added' + '\n');
        difference = getDifference(allLocations,temparray);
    } else if (differenceLength === 0){
        removePoint(temparray);
        console.log('\n' + 'Point removed' + '\n');
        difference = getDifference(allLocations,temparray);
    } else {
        switch(Math.floor(Math.random()*3)){
            case 0:
                swapPoint(differenceArr,temparray);
                console.log('\n' + 'Point swapped' + '\n');
                difference = getDifference(allLocations,temparray);
                break;
            case 1:
                removePoint(temparray);
                console.log('\n' + 'Point removed' + '\n');
                difference = getDifference(allLocations,temparray);
                break;
            case 2:
                addPoint(differenceArr,temparray);
                console.log('\n' + 'Point added' + '\n');
                difference = getDifference(allLocations,temparray);
                break;
            default:
                console.log('Error');
                break;
        }
    }
    return temparray;
}

function calcProbability(temperature, currentSolution, randomNeighbour){
    return Math.pow(Math.E, (getQuality(randomNeighbour) - getQuality(currentSolution)) / temperature);
}





function anneal(alpha, temperature, nLocations, maxDistance){
    console.log('All locations: ' + '\n');
    const allLocations = generateLocations(nLocations);
    const initialSolution = getInitialSolution(allLocations);

    let probability;
    let randNeighbour;
    let count = 2000;

    let difference = getDifference(allLocations,initialSolution);
    let currentSolution = initialSolution.slice();
    console.log('\n');
    console.log(currentSolution);

    // Finding first feasible solution
    let iterations = 100; 
    while(iterations > 0){
        if(!isFeasible(currentSolution,maxDistance)){
            console.log('Not feasible, generating new solution...');
            currentSolution = getInitialSolution(allLocations).slice();
            difference = getDifference(allLocations,currentSolution).slice();
            console.log(currentSolution);
        } else {
            console.log('Feasible!' + '\n');
            break;
        }
        iterations--;
    }

    console.log(currentSolution);
    let candidateSolution = currentSolution.slice();
    bestSolution = currentSolution.slice();

   
    while(count > 0){
    randNeighbour = generateNeighbour(candidateSolution,difference).slice();
    console.log('New random neighbour: ' + '\n');
    console.log(randNeighbour);
    
    
    if(randNeighbour.length > 0){
        let iterator = 1000;
        while(iterator > 0){
            if(!randNeighbour.length > 0){
                console.log('Neighbour is feasible!');
                break;
            }
            if(!isFeasible(randNeighbour,maxDistance)){
                console.log('Unfeasable neighbour! Generating another one...')
                randNeighbour = generateNeighbour(candidateSolution,difference).slice();
                if(randNeighbour.length < 1) { break;}
            } else {
                console.log('Neighbour is feasable!')
                break;
            }
            iterator--;
        }
    } 

    console.log(randNeighbour);

    if(getQuality(randNeighbour) < getQuality(candidateSolution)){
        console.log('Neighbour is worse' + '\n');
        probability = calcProbability(temperature,candidateSolution,randNeighbour);
        console.log('Probability to accept worse neighbour: ' + probability);

        if(Math.random() < probability){
            console.log('Accepting worse neighbour!' + '\n')
            candidateSolution = randNeighbour.slice();
            difference = getDifference(allLocations,candidateSolution);
        }
        
    } else if(((getQuality(randNeighbour) === getQuality(candidateSolution)) && (
        getTotalDistance(randNeighbour) < getTotalDistance(candidateSolution)))
        || (getQuality(randNeighbour) > getQuality(candidateSolution))){
        
        console.log('Neighbour is better');
        candidateSolution = randNeighbour.slice();
        difference = getDifference(allLocations,candidateSolution);
    }

    console.log('Selected solution is: ' + '\n')
    console.log(candidateSolution);

    console.log('\n' + 'Quality of this solution: ' + candidateSolution.length + '\n' )

    // console.log('\n' + 'Total distance of this solution: ' + getTotalDistance(candidateSolution) + '\n' )


    fs.appendFile('log.txt', 'Quality: ' + candidateSolution.length + '        Temperature: ' +
     temperature  + '            Total distance: ' + getTotalDistance(candidateSolution) + '\n', function(err){
        if(err){
            return console.log(err);
        } 
    });

    if(bestSolution.length < candidateSolution.length){
        bestSolution = candidateSolution.slice();
    } else if (bestSolution.length === candidateSolution.length && 
        getTotalDistance(bestSolution) > getTotalDistance(candidateSolution)){   
            bestSolution = candidateSolution.slice();
    }

    temperature *= alpha;
    count--;
    }
    console.log('Best solution is: ' + '\n');
    console.log(bestSolution);
    console.log('\n' + 'Quality of this solution: ' + bestSolution.length + '\n' );
    console.log('\n' + 'Distance of this solution: ' + getTotalDistance(bestSolution) + '\n' );


}


// Test

console.log('\n' + 'Annealing test:' + '\n');
// anneal(0.99,70,15,200);



