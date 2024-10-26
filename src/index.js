
var MD_LocalTournament = null;
let recompute_results = false;

const tournament_localStorage_prefix = "BT_";
const emptyTournamentValues = {
    name : "BadTournament",
    date : new Date(),
    round : 1
};

function tournamentLocalStorageKey(trnmt){
    let date = trnmt.date.toISOString().substring(0, 10);
    return `${tournament_localStorage_prefix}${trnmt.name}_${trnmt.in_year_number}_${date}`;
}

var toMovePlayer = -1;

document.getElementById('btn-show-players').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('all-player-div').style.display = '';
    document.getElementById('matches-div').style.display = 'none';
    document.getElementById('order-div').style.display = 'none';    
});

document.getElementById('btn-show-matches').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('all-player-div').style.display = 'none';
    document.getElementById('matches-div').style.display = '';
    document.getElementById('order-div').style.display = 'none';
});

document.getElementById('btn-show-order').addEventListener('click', function(event) {
    event.preventDefault();
    document.getElementById('all-player-div').style.display = 'none';
    document.getElementById('matches-div').style.display = 'none';
    document.getElementById('order-div').style.display = '';

    renderOrder();
});

function recomputeResult(){
    MD_LocalTournament.recount_allResults();
    recompute_results = false;
}

document.getElementById('tournament-confirm-settings').addEventListener('click', function(event) {
    event.preventDefault();
    handleTournamentConfirmation();
});

document.getElementById('tournament-edit-settings').addEventListener('click', function(event) {
    event.preventDefault();
    handleEditTournamentSettings();
});

document.getElementById('matches-draw').addEventListener('click', function(event) {
    event.preventDefault();
    handleTournamentDraw();
});

document.getElementById('player-add').addEventListener('click', function(event) {
    event.preventDefault();
    handleAddPlayer();
});

/* TODO: clear/inspect this code...  */
document.getElementById('tournament-clear').addEventListener('click', function(event) {
    event.preventDefault();
    // Display a confirmation dialog
    var result = window.confirm("Are you sure you want to clear whole tournament? This will erase all players and tournament info from memory and will be no longer retrievable.");
    // Check the user's choice
    if (result === true) {
        clearLocalStorage(MD_LocalTournament);
        updateTournament(true);
    }
    
});

function updateTournament(edit=false){
    let storedTournaments = renderSelectTournaments_localStored();

    if(storedTournaments.length === 1){
        MD_LocalTournament = getLocalStoredTournament(`${tournament_localStorage_prefix}${storedTournaments[0]}`);
    }

    renderTournament(edit);
}
// Load tournament information from local storage on page load or render and store empty tournament
window.addEventListener('load', updateTournament);

function matchValue_toHTMLString(match, set, player){
    return match.isUnplayed() ? '' : match.score.md_values[set].md_values[player];
}

function renderMatches(){
    if(!MD_LocalTournament){
        return;
    }
    let singletons_div = document.getElementById("matches-singletons");
    singletons_div.innerHTML = `<p>
    ${MD_LocalTournament.overall_singletons.map(sngl => {
        return `${sngl.name} (${sngl.id})`;
    }).join(", ")}
    </p>`;

    let matches_div = document.getElementById("matches-all_matches");
    matches_div.innerHTML = "";

    MD_LocalTournament.matches.forEach(match => {
        var matchDiv = document.createElement('div');
        matchDiv.classList.add('match-div');
        matchDiv.innerHTML = `
            <span><p>${match.participants[0].name} (${match.participants[0].id})</p></span>
            <span><p>${match.participants[1].name} (${match.participants[1].id})</p></span>                    
        `;
        

        var form = document.createElement("form");
        form.classList.add("match-score");
        form.innerHTML = `
            <input type="number" id="match_0_0" name="0_0" value="${matchValue_toHTMLString(match, 0, 0)}" required>
            <input type="number" id="match_0_1" name="0_1" value="${matchValue_toHTMLString(match, 0, 1)}" required> </br>

            <input type="number" id="match_1_0" name="1_0" value="${matchValue_toHTMLString(match, 1, 0)}" required>
            <input type="number" id="match_1_1" name="1_1" value="${matchValue_toHTMLString(match, 1, 1)}" required> </br>
            
            <button type="submit" class="btn-match">Confirm Score</button>       
        `;
        // <button class="btn-match-remove" onclick="removeMatch(${match.md_id})">Remove match</button> 
        if(!match.isUnplayed()){
            form.classList.add("score-stored");
        }

        matchDiv.appendChild(form);
        matches_div.insertBefore(matchDiv, matches_div.firstChild);

        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent form submission
            const formData = new FormData(form); // Get form data

            var MD_match = MD_LocalTournament.getMatch_byMDid(match.id);                
            MD_LocalTournament.setScoreValuesOfMatch( MD_match,
                [[parseInt(formData.get('0_0')), parseInt(formData.get('0_1'))],
                [parseInt(formData.get('1_0')), parseInt(formData.get('1_1'))]]);
            MD_LocalTournament.add_matchToResults(MD_match);
            form.classList.add("score-stored");
            storeLocalStoredTournament();
        });

        form.addEventListener('change', function(event) {
            event.preventDefault(); // Prevent form submission
                form.classList.remove("score-stored");  
                recompute_results = true;      
        });        
    });
}


function handleTournamentDraw(){
    if(!MD_LocalTournament){return;}

        // MD_LocalTournament = new MatchDraw.Tournament_Swiss_Radon({            
        //     md_id:1,
        //     md_name: tournament.informations.name,
        //     md_date: tournament.informations.date,
        //     in_year_number: tournament.informations.round,
        // });
        // tournament.players.forEach((player, index) => {
        //     MD_LocalTournament.addParticipant(new MatchDraw.Participant_Radon({
        //         md_id: player.id,
        //         md_name: player.name,
        //         club: player.club,
        //         birth: player.birthyear
        //     }));
        // });
    if(recompute_results){
        recomputeResult();
    }
    MD_LocalTournament.draw();
    storeLocalStoredTournament();

    renderMatches();    
}

// function removeMatch(matchID){
//     let mtch_idx = MD_LocalTournament.md_matches.findIndex(mtch => mtch.md_id === matchID);
//     if (mtch_idx === -1){return;}

//     let mtch = MD_LocalTournament.md_matches[mtch_idx];
//     MD_LocalTournament.addSingletons.push(mtch.participants);

//     MD_LocalTournament.md_matches.splice(mtch_idx, 1);
//     renderMatches();
//     recompute_results = true;
// }

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
    MD_LocalTournament = getLocalStoredTournament(`${tournament_localStorage_prefix}${selectedKey}`);
    renderTournament(true);
  });
}


function renderTournament(edit=false){
    fillTournamentInfo();
    displayTournamentInfo(edit);
    renderPlayerList();
    renderOrder();
    renderMatches();
}

function fillTournamentInfo(){
    let name, date, round;
    if(MD_LocalTournament){
        name = MD_LocalTournament.name;
        date = MD_LocalTournament.date;
        round = MD_LocalTournament.in_year_number;
    }else{
        name = emptyTournamentValues.name;
        date = emptyTournamentValues.date;
        round = emptyTournamentValues.round;
    }
    document.title = `${name} | BadTournament`;

    document.getElementById('info-tournament-name').textContent = name;
    document.getElementById('info-tournament-date').textContent = date.toLocaleDateString();
    document.getElementById('info-tournament-round').textContent = `Round: ${round}`;

    document.getElementById('form-tournament-name').value = name;
    document.getElementById('form-tournament-date').value = date.toISOString().substring(0, 10);
    document.getElementById('form-tournament-round').value = round;
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
    var tournamentDate = new Date(document.getElementById('form-tournament-date').value);
    var roundNumber = document.getElementById('form-tournament-round').value;

    if (MD_LocalTournament &&
        MD_LocalTournament.name === tournamentName &&
        MD_LocalTournament.date.getTime() === tournamentDate.getTime() &&
        MD_LocalTournament.in_year_number === roundNumber
    ){
        displayTournamentInfo(false); 
        return;
    }

    MD_LocalTournament = new MatchDraw.Tournament_Elo_Radon({            
        id:1,
        name: tournamentName,
        date: tournamentDate,
        in_year_number: roundNumber
    });

    storeLocalStoredTournament();
    renderSelectTournaments_localStored();

    /* display updated info */
    renderTournament(false);    
}

function handleEditTournamentSettings() {
    displayTournamentInfo(true);
}

function getLocalStoredTournament(localStorageKey){
    return MatchDraw.Tournament_Swiss_Radon.fromJSON(
        JSON.parse(localStorage.getItem(localStorageKey))
    );
}

function storeLocalStoredTournament(){
    if(!MD_LocalTournament){return;}

    localStorage.setItem(
        tournamentLocalStorageKey(MD_LocalTournament),
        JSON.stringify(MD_LocalTournament.toJSON())
    );
}

function handleAddPlayer(){
    /* Retrieve values */
    var playerName = document.getElementById('form-add-player-name').value;
    var playerId = document.getElementById('form-add-player-id').value;
    var playerBirthyear = document.getElementById('form-add-player-birthyear').value;
    var playerClub = document.getElementById('form-add-player-club').value;

    if(!(playerName && playerId && playerBirthyear && playerClub)){
        return;
    }

    if(!MD_LocalTournament){handleTournamentConfirmation();}

    MD_LocalTournament.addParticipant(
        new MatchDraw.Participant_Radon({
            id: playerId,
            name: playerName,
            club: playerClub,
            birth: new Date(playerBirthyear)
        })
    );

    // Save updated player data back to local storage
    storeLocalStoredTournament();
    // Render the player list
    renderPlayerList();
    // Clear input fields after adding player
    document.getElementById('form-add-player-name').value = "";

}

// Function to edit a player based on the given index
// function editPlayer(index) {
//     // Your logic here to edit the player with the given index
//     console.log("Editing player with index:", index);
// }

function removePlayer(index){
    var result = window.confirm("Are you sure you want to remove player?");
    if (result === true) {
        MD_LocalTournament.participants_results.splice(index, 1); 

        storeLocalStoredTournament();
        renderPlayerList();
    }
}

function movePlayer(index){
    // Show cancel button
    document.getElementById('cancelMoveButton').style.display = 'inline';
    toMovePlayer = index;
    renderPlayerList(true);
}

function movePlayerHere(index){
    if (index === toMovePlayer){return;} /* same position */
    if(index > toMovePlayer){index--;} /* player will be removed from position before the goal one */

    var player = MD_LocalTournament.participants_results.splice(toMovePlayer, 1)[0];
    MD_LocalTournament.participants_results.splice(index, 0, player); 

    storeLocalStoredTournament();
    renderPlayerList();
}

function cancelMoving(){
    toMovePlayer = -1;
    renderPlayerList();    
}

// Retrieve and render player information from local storage
function renderPlayerList(with_move_button=false) {
    if(!MD_LocalTournament){return;}
    let players = MD_LocalTournament.participants_results.map(pr => {return pr.participant;});

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
                <p>${player.birth.getFullYear()}</p>
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

function renderOrder(){
    let orderDiv = document.getElementById("order-div");
    orderDiv.innerHTML = "<h1>Actual order</h1>";

    if(!MD_LocalTournament){return;}

    if(recompute_results){
        recomputeResult();
    }

    MD_LocalTournament.sortResults();
    MD_LocalTournament.participants_results.forEach((pr, index) => {
        let onePart = document.createElement("p");
        onePart.innerHTML = `${index+1}# ${pr.toString()}`;
        orderDiv.appendChild(onePart);
    }); 
}

function clearLocalStorage() {
    if(!MD_LocalTournament){return;}
    let localStorageKey = tournamentLocalStorageKey(MD_LocalTournament);
    if (localStorage.getItem(localStorageKey) !== null){
        localStorage.removeItem(localStorageKey);
        MD_LocalTournament = null;
    }
}