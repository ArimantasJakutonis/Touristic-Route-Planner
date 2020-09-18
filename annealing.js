var fs = require('fs');

let allLocations = [];
let difference = [];
let currentSolution = [];
let candidate = [];

let lat1 = 53.027;
let lon1 = -2.19722;
let lat2 = 52.652;
let lon2 = -1.529;
const GOOGLE_KEY = 'Please enter your google map api key here'

function getCentreLat(lat1,lat2){
    return (lat1 + lat2) / 2;
}

function getCentreLng(lon1,lon2){
    return (lon1 + lon2) / 2;
}

function getDistance(lat1, lon1, lat2, lon2)
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d; // convert to meters
}

// Converts numeric degrees to radians
function toRad(Value)
{
    return Value * Math.PI / 180;
}

function get_data_from_url(link){
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();
    xhr.open("GET",link,false);
    xhr.send(null);
    return xhr.responseText;
}


function generateAllLocations(lat1,lon1,lat2,lon2){
    console.log(getCentreLat(lat1,lat2));
    console.log(getCentreLng(lon1,lon2));
    console.log(getDistance(lat1,lon1,lat2,lon2));

    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' +
    getCentreLat(lat1,lat2) + ',' + getCentreLng(lon1,lon2)+ '&radius=' +
    getDistance(lat1,lon1,lat2,lon2) / 2 * 1000 + '&type=tourist_attraction&key=' + GOOGLE_KEY;

    console.log(url);

    var locationsRaw = JSON.parse(get_data_from_url(url));
    for(let i = 0; i < locationsRaw.results.length; i++){
        allLocations[i] = locationsRaw.results[i].geometry.location;
        allLocations[i].name = locationsRaw.results[i].name;
    }

    return allLocations;
}

//Generates initial solution which is a random subset of all locations and shuffled
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

function getTotalDistance(arr){
    let totalDistance = 0;
    totalDistance += getDistance(lat1,lon1,arr[0].lat,arr[0].lng);
    // console.log('Distance to first point: ' + totalDistance + '\n');
    if(arr.length > 1){
        for(let i = 1; i < arr.length; i++){
            totalDistance += getDistance(arr[i-1].lat,arr[i-1].lng,arr[i].lat,arr[i].lng);
            // console.log('Distance to n-th point: ' + totalDistance + '\n');
        }
    }
    totalDistance += getDistance(arr[arr.length-1].lat,arr[arr.length-1].lng,lat2,lon2);
    console.log('Distance to last point: ' + totalDistance + '\n');
    return totalDistance;
}

// Finds unused locations in the solution
function getDifference(fullArr, subArr){
    return fullArr.filter(d => !subArr.includes(d));
}

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

    if(length === 0 || length === 1){
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

function anneal(alpha, temperature, maxDistance,coord00,coord01,coord10,coord11){
    lat1 = coord00;
    lon1 = coord01;
    lat2 = coord10;
    lon2 = coord11;
    
    console.log('All locations: ' + '\n');
    generateAllLocations(lat1,lon1,lat2,lon2);
    console.log('All locations: ' + '\n');
    

    const initialSolution = getInitialSolution(allLocations);

    let probability;
    let randNeighbour;
    let count = 500;

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

    return bestSolution;
}



// anneal(0.975,10,190,54.68,25.285,54.898, 23.911);

exports.anneal = anneal;
exports.getDistance = getDistance;
