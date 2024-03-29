const tournament_localStorage_prefix = "BT_";
function emptyTournamentValues(){
    return {
        informations:
            {
                name : "BadTournament",
                date : new Date(),
                round : 1
            },
        players : []
    };
}

function tournamentLocalStorageKey(trnmt){
    let info = trnmt.informations;
    let date = info.date.toISOString().substring(0, 10);
    return `${tournament_localStorage_prefix}${info.name}_${info.round}_${date}`;
}

var toMovePlayer = -1;

var tournament = emptyTournamentValues();

document.getElementById('tournament-confirm-settings').addEventListener('click', function(event) {
    event.preventDefault();
    handleTournamentConfirmation();
});

document.getElementById('tournament-edit-settings').addEventListener('click', function(event) {
    event.preventDefault();
    handleEditTournamentSettings();
});

document.getElementById('tournament-draw').addEventListener('click', function(event) {
    event.preventDefault();
    handleTournamentDraw();
});

document.getElementById('player-add').addEventListener('click', function(event) {
    event.preventDefault();
    handleAddPlayer();
});

document.getElementById('tournament-clear').addEventListener('click', function(event) {
    event.preventDefault();
    // Display a confirmation dialog
    var result = window.confirm("Are you sure you want to clear whole tournament? This will erase all players and tournament info from memory and will be no longer retrievable.");
    // Check the user's choice
    if (result === true) {
        clearLocalStorage(tournament);
    }
    
});

// Load tournament information from local storage on page load or render and store empty tournament
window.addEventListener('load', function() {
    let storedTournaments = renderSelectTournaments_localStored();

    if(storedTournaments.length === 1){
        let trnmt = getLocalStoredTournament(storedTournaments[0]);
        if (trnmt) {
            tournament = trnmt;
        }
    }

    renderTournament(tournament);
});


function handleTournamentDraw(){

}


// Function to retrieve items from localStorage by prefix
function getTournamentsByPrefix(prefix) {
  let items = [];
  let prefixLength = prefix.length;
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    if (key.startsWith(prefix)) {
      items.push(key.substring(prefixLength));
    }
  }
  return items;
}

function renderSelectTournaments_localStored(){
    let storedTournaments = getTournamentsByPrefix(tournament_localStorage_prefix);
    renderSelectTournaments(storedTournaments);
    return storedTournaments;
}

// Function to present items to the user for selection
function renderSelectTournaments(items) {
  // Create a select element
  let select = document.getElementById("form-tournament-select");
  select.innerHTML = ""; // Clear previous content

  let placeholderOption = document.createElement("option");
  placeholderOption.value = ""; // Set value to empty string
  placeholderOption.text = "Select tournament"; // Set text to indicate selection
  placeholderOption.disabled = true; // Make it non-selectable
  placeholderOption.selected = true; // Make it initially selected
  select.appendChild(placeholderOption);
  
  // Add options for each item
  items.forEach(function(item) {
    let option = document.createElement("option");
    option.value = item;
    option.text = item;
    select.appendChild(option);
  });
  
  // Add change event listener to handle selection
  select.addEventListener("change", function() {
    let selectedKey = select.value;
    tournament = getLocalStoredTournament(`${tournament_localStorage_prefix}${selectedKey}`);
    if (!tournament){
        tournament = emptyTournamentValues();
    }
    fillTournamentInfo(tournament.informations);
    displayTournamentInfo(true);
    renderPlayerList(tournament.players);
  });
}


function renderTournament(trnmt){
    fillTournamentInfo(trnmt.informations);
    displayTournamentInfo(false);
    renderPlayerList(trnmt.players);
}

function fillTournamentInfo(tournamentInfo){
    document.title = `${tournamentInfo.name} | BadTournament`;

    document.getElementById('info-tournament-name').textContent = tournamentInfo.name;
    document.getElementById('info-tournament-date').textContent = tournamentInfo.date.toLocaleDateString();
    document.getElementById('info-tournament-round').textContent = `Round: ${tournamentInfo.round}`;

    document.getElementById('form-tournament-name').value = tournamentInfo.name;
    document.getElementById('form-tournament-date').value = tournamentInfo.date.toISOString().substring(0, 10);
    document.getElementById('form-tournament-round').value = tournamentInfo.round;
}

function displayTournamentInfo(edit){
    if(edit){
        document.getElementById('tournament-form').style.display = 'grid';
        document.getElementById('tournament-info').style.display = 'none';
    }else{
        document.getElementById('tournament-form').style.display = 'none';
        document.getElementById('tournament-info').style.display = 'grid';
    }    
}

function handleTournamentConfirmation() {
    /* retrieve values */
    var tournamentName = document.getElementById('form-tournament-name').value;
    var tournamentDate = document.getElementById('form-tournament-date').value;
    var roundNumber = document.getElementById('form-tournament-round').value;

    tournament.informations =
        {
            name: tournamentName,
            date: new Date(tournamentDate),
            round: roundNumber,
        };
        /* let players as they are */

    storeLocalStoredTournament(tournament);
    renderSelectTournaments_localStored();

    /* display updated info */
    fillTournamentInfo(tournament.informations);
    displayTournamentInfo(false);     
}

function handleEditTournamentSettings() {
    displayTournamentInfo(true);
}

function getLocalStoredTournament(localStorageKey){
    let trnmt = JSON.parse(localStorage.getItem(localStorageKey));
    if (trnmt){
        trnmt.informations.date = new Date(trnmt.informations.date);
    }
    return trnmt;
}

function storeLocalStoredTournament(trnmt){
    localStorage.setItem(tournamentLocalStorageKey(trnmt), JSON.stringify(trnmt));
}

function handleAddPlayer(){
    /* Retrieve values */
    var playerName = document.getElementById('form-add-player-name').value;
    var playerId = document.getElementById('form-add-player-id').value;
    var playerBirthyear = document.getElementById('form-add-player-birthyear').value;
    var playerClub = document.getElementById('form-add-player-club').value;

    var playerData = {
        name: playerName,
        id: playerId,
        birthyear: playerBirthyear,
        club: playerClub
    };
    addPlayer(playerData);
}

function addPlayer(playerData) {
    tournament.players.unshift(playerData); /* add to first place to show up on top */

    // Save updated player data back to local storage
    storeLocalStoredTournament(tournament)

    // Render the player list
    renderPlayerList(tournament.players);

    // Clear input fields after adding player
    //document.getElementById('player-form').reset();
}

// Function to edit a player based on the given index
// function editPlayer(index) {
//     // Your logic here to edit the player with the given index
//     console.log("Editing player with index:", index);
// }

function removePlayer(index){
    var result = window.confirm("Are you sure you want to remove player?");
    if (result === true) {
        tournament.players.splice(index, 1); 

        storeLocalStoredTournament(tournament);
        renderPlayerList(tournament.players);
    }
}

function movePlayer(index){
    // Show cancel button
    document.getElementById('cancelMoveButton').style.display = 'inline';
    toMovePlayer = index;
    renderPlayerList(tournament.players, true);
}

function movePlayerHere(index){
    if (index === toMovePlayer){return;} /* same position */
    if(index > toMovePlayer){index--;} /* player will be removed from position before the goal one */

    var player = tournament.players.splice(toMovePlayer, 1)[0];
    tournament.players.splice(index, 0, player); 

    storeLocalStoredTournament(tournament);
    renderPlayerList(tournament.players);
}

function cancelMoving(){
    toMovePlayer = -1;
    renderPlayerList(tournament.players);    
}

// Retrieve and render player information from local storage
function renderPlayerList(players, with_move_button=false) {
    function includeMoveButton(index, parent){
        if(with_move_button && !(index == toMovePlayer || index == toMovePlayer+1)){
            var move_button = document.createElement('button');
            move_button.onclick = function() {
                movePlayerHere(index);
            };
            move_button.className = 'btn-move-here';
            move_button.textContent = 'Move here';
            parent.appendChild(move_button);
        }
    }

    document.getElementById('cancelMoveButton').style.display = with_move_button ? "" : 'none';

    var playerList = document.getElementById('player-list');
    playerList.innerHTML = '';

    players.forEach((player, index) => {
        includeMoveButton(index, playerList);        

        var playerDiv = document.createElement('div');
        playerDiv.classList.add('player-div');
        if (with_move_button && index == toMovePlayer){
            playerDiv.classList.add('player-to-move');
        }

        var playerInfoDiv = document.createElement('div');
        playerInfoDiv.classList.add('info-div');

        /* <button id="player-edit" onclick="editPlayer(${index})">Edit Player</button> */
        var playerInfo = `
        <div class="info two-column-info">
            <div class="info-order">
                <p>${index+1}.</p>
            </div>
            <div class="info-rest">
                <p>${player.name} (${player.id})</p>
                <p>${player.birthyear}</p>
                <p>${player.club}</p>
            </div>
        </div>
        <div class="actions">     
            <button class="btn-player-remove" onclick="removePlayer(${index})">Remove Player</button>
            <button class="btn-player-move" onclick="movePlayer(${index})">Move Player</button>
        </div>
        `;
        playerInfoDiv.innerHTML = playerInfo;
        playerDiv.appendChild(playerInfoDiv);

        playerList.appendChild(playerDiv);
    });    
    includeMoveButton(players.length, playerList);  
}

function clearLocalStorage(trnmt) {
    let localStorageKey = tournamentLocalStorageKey(trnmt);
    if (localStorage.getItem(localStorageKey) !== null){
        localStorage.removeItem(localStorageKey);
    }
    tournament = emptyTournamentValues();
    renderSelectTournaments_localStored();
    fillTournamentInfo(tournament.informations);
    renderPlayerList(tournament.players);
}