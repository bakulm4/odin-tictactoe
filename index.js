const landingPage = document.querySelector('.landing');
const playGamePage = document.querySelector('main');

/** Player Factory function */
const Player = (type,name)=>{
    let _score = 0;
    const _playerSpots = new Set();
    let _type = type;
    let _name=name;

    const getName = ()=> _name;
    const setName = (name)=>{_name = name};
    const getType = ()=> _type;
    const setType = (type)=>{_type = type};

    const incrementScore = ()=> _score += 1;
    const getScore = ()=> _score;
    const addSpot = index => {
        //console.log(`Adding spot # ${index} to Player ${_name} `);
        _playerSpots.add(parseInt(index));
    }
    const clearSpots = () => _playerSpots.clear();
    const getSpots = () => _playerSpots;

    const reset = ()=>{
        _name = '';
        _type = '';
        _score = 0;
        _playerSpots.clear();
    }
    return { getName, setName, getType, setType, incrementScore, getScore, addSpot, clearSpots, getSpots, reset};
};

/** Game module */
const game =  (function(){

    const player1 = Player(1);
    const player2 = Player(2);
    let _turn = 1;
    let _running = false;
    const player1Element = document.querySelector('.player1');
    const player2Element = document.querySelector('.player2');
    const resetButton = document.querySelector('.reset');
    const cancelButton = document.querySelector('.cancel');
    
    /** Initialize players */
    function initPlayers(){
        //console.log(`Init Players called`);
        /** If Players' names have not been set before set them, else clear their spots occupied list.. */
        //console.log(`Player1 name: ${player1.getName()}, Player2 name: ${player2.getName()}`);
        if(!player1.getName()){
            player1.setName(selectPlayType.getPlayers().player1.name);
            player1.setType(selectPlayType.getPlayers().player1.type)
            player1Element.querySelector('.player-name').innerText=player1.getName();
        }else{
            player1.clearSpots();
        }

        if(!player2.getName()){
            player2.setName(selectPlayType.getPlayers().player2.name);
            player2.setType(selectPlayType.getPlayers().player2.type);
            player2Element.querySelector('.player-name').innerText=player2.getName();
        }else{
            player2.clearSpots();
        }
    };

    /** Start a new game */

    const startGame = ()=> {
         _running = true;
         _turn = 1;

        initPlayers();

        if(player2Element.classList.contains('playing'))
            player2Element.classList.remove('playing');
        if(!player1Element.classList.contains('playing'))
            player1Element.classList.add('playing');
        
        displayController.setMessage(`${player1.getName()}'s turn`);
        gameBoard.initBoard();

        if(player1.getType()==='computer'){
            playTurn();
        }
    };

    const getTurn = ()=>_turn;

    /** Record the current player's selection and check if game is done, else toggle turn to other player */
    const playTurn = function(cellIndex){
        const player = _turn ===1 ? player1 : player2;
        //console.log(`PlayTurn called for ${player.getName()} of type ${player.getType()}, with spot# ${cellIndex}`);
        const emptyCells = gameBoard.getEmptyCells();
        //console.log(`Empty Spots in gameboard: `,gameBoard.getEmptyCells());
        const index = player.getType()==='human'? cellIndex : emptyCells[Math.floor(Math.random()*emptyCells.length)];
        //console.log(`PlayTurn: index: `, index);
        if(player.getType()==='computer'){
            gameBoard.fillCell(index,_turn);
        }

        player.addSpot(index);
            //console.log(`${player.getName()}'s spots: `, player.getSpots());
            if(isGameOver()){
                resetButton.innerText='Play Again';
                _running = false;
            }else{
                toggleTurn();     
            }   
    }

    /** Set current player to the next player */
    const toggleTurn = ()=>{
        _turn = _turn === 1? 2 :1;
        //console.log(`ToggleTurn: It's ${_turn ===1 ? player1.getName():player2.getName()}'s turn `);
        displayController.setMessage(`${_turn ===1 ? player1.getName():player2.getName()}'s turn`);
        const player = _turn ===1 ? player1 : player2;
        if(_turn===1){
            player1Element.classList.add('playing');
            player2Element.classList.remove('playing');
        }else{
            player2Element.classList.add('playing');
            player1Element.classList.remove('playing');
        }

        if(player.getType()==='computer')
            playTurn();
    };

/** Check if input set of Spots are in a row */
    function threeInARow(set){
        //console.log('Three in a row called for ', set.values());
        if((set.has(0)&&set.has(1)&&set.has(2))){
            gameBoard.highlightCells(0,1,2);
            return true;
        }else if((set.has(3)&&set.has(4)&&set.has(5))){
            gameBoard.highlightCells(3,4,5);
            return true;
        }else if((set.has(6)&&set.has(7)&&set.has(8))){
            gameBoard.highlightCells(6,7,8);
            return true;
        }
        return false;
    }

    /** Check if input set of spots are in a column */
    function threeInAColumn(set){
        //console.log('Three in a column called for ', set.values());

        if((set.has(0)&&set.has(3)&&set.has(6))){
            gameBoard.highlightCells(0,3,6);
            return true;
        }else if((set.has(1)&&set.has(4)&&set.has(7))){
            gameBoard.highlightCells(1,4,7);
            return true;
        }else if((set.has(2)&&set.has(5)&&set.has(8))){
            gameBoard.highlightCells(2,5,8);
            return true;
        }
        return false;

    }

    /** Check if input set of spots are across */
    function threeAcross(set){
        //console.log('Three across called for ', set.values());

        if((set.has(0)&&set.has(4)&&set.has(8))){
            gameBoard.highlightCells(0,4,8);
            return true;
        }else if((set.has(2)&&set.has(4)&&set.has(6))){
            gameBoard.highlightCells(2,4,6);
            return true;
        }
        return false;
    }

    /** Check if player has 3 in a row or column, or across */
    function hasPlayerWon(player){
        const playerSpots = player.getSpots();
        if(playerSpots.size >=3 &&(threeInARow(playerSpots) || threeInAColumn(playerSpots)||threeAcross(playerSpots)))
            return true;
        return false;
    }

    /** Check is any player has won or all spots are filled. */
    function isGameOver(){
        //console.log('CheckIfGameOver is called');
        let gameOver = false;

        let winningPlayer = hasPlayerWon(player1) ? player1 : hasPlayerWon(player2) ? player2 : undefined;
        let winningPlayerElement = winningPlayer === player1 ? player1Element : winningPlayer === player2 ? player2Element : undefined ;

        if(winningPlayer){
            displayController.setMessage(`${winningPlayer.getName()} won!! 🎊 🎉 👏`);
            winningPlayer.incrementScore();
            displayController.displayScore(winningPlayer,winningPlayerElement);
            gameOver = true;
        }

        if(!gameOver && gameBoard.isBoardFull()){
            gameOver = true;
            displayController.setMessage(`It's a tie !!`);
        }
            
        //console.log(`check if game over returning ${gameOver}`);
        return gameOver;
    }

    /** Add event listener to reset button */
    resetButton.addEventListener('click',()=>{
        if(resetButton.innerText==='Play Again'){
            resetButton.innerText='Reset';
        }
        gameBoard.resetBoard();
        startGame();
    });

    /** Add event listerner to Go Back button */
    cancelButton.addEventListener('click',()=>{
        landingPage.style.display='initial';
        playGamePage.style.display='none';
        selectPlayType.resetPlayerTypes();
        player1.reset();
        player2.reset();

        player1Element.querySelector('.player-name').innerText='';
        player2Element.querySelector('.player-name').innerText='';
      
        gameBoard.resetBoard();
        displayController.displayScore(player1,player1Element);
        displayController.displayScore(player2,player2Element);
    });

    return {getTurn,startGame, playTurn};
})();

/** Select Play Type */
const selectPlayType = (()=>{
    let player1={ 
        name:'',
        type:''
    };
    let player2={
        name:'',
        type:''
    };

    const playerTypesSelectList = document.querySelectorAll('#player1Type,#player2Type') ;
    const startPlayButton = document.querySelector('.start-play');
    const playerNameInputList = document.querySelectorAll('.playerInput input');
  

    function getPlayers(){
        return {
            player1,player2
        }
    }

    /** Reset players and trigger change event on Select elements. */
    function resetPlayerTypes(){
        //console.log('Reset Players called');
        player1.name='';
        player2.name='';
        player1.type='';
        player2.type='';

        startPlayButton.disabled = true;
        playerTypesSelectList.forEach(selectElement=>{
            selectElement.value='select';
            selectElement.dispatchEvent(new Event('change'));
        });
    }

    /** Check type of player selected and show input to enter player name if type is human */

    playerTypesSelectList.forEach(selectElement=>{
        selectElement.addEventListener('change',(event)=>{
            //console.log(`Select option event target value`,event.target.value);
            const player = event.target.name==='player1Type'?player1:player2;
            const playerNameInput = event.target.parentElement.nextElementSibling;

            if(event.target.value==='human'){
                if(getComputedStyle(playerNameInput).getPropertyValue('display')==='none')
                 playerNameInput.style.display='flex';
                player.type = 'human';
                player.name = '';
                playerNameInput.querySelector('input').value='';
                startPlayButton.disabled=true;
            } else {
                if(getComputedStyle(playerNameInput).getPropertyValue('display')==='flex')
                    playerNameInput.style.display='none';
                    if(event.target.value==='computer'){
                        player.type = 'computer';
                        player.name='Computer';
                        if(canStartPlay())
                            startPlayButton.disabled=false;
                    }
            }
        }
    )});

    /** Check if player name has been entered and game can be started */
    playerNameInputList.forEach(playerNameInput => {
        playerNameInput.addEventListener('change',(event)=>{
           // console.log(event.target.id);
            const player = event.target.id==='player1'?player1:player2;
            player.name=event.target.value;
            if(canStartPlay())
                startPlayButton.disabled=false;
            else
                startPlayButton.disabled=true;
        });
    });

    /** Check if game can be started */
    function canStartPlay(){
        //console.log(`canStartPlay(): Player1 name: ${player1.name}, Player2 name: ${player2.name}`)
        return player1.name!=='' && player2.name!=='';

    }

    /** Add event listener for Start Game button */
    startPlayButton.addEventListener('click',()=>{
        landingPage.style.display='none';
        playGamePage.style.display='grid';
        game.startGame();
    });

    return {getPlayers, resetPlayerTypes};

})();

/** Display Controller  */
const displayController = (function(){
    const _messageElement = document.querySelector('.message');

    const setMessage = msg => {
        //console.log('displayController.setMessage() called with message: ', msg);
        _messageElement.innerText = msg;
    }

    const displayScore = (player,playerElement) => {
        playerElement.querySelector('h3').innerText = player.getScore();
    }

    setMessage(`Player ${game.getTurn()}'s turn`);

    return {setMessage,displayScore};
})();

/** Game Board */
const gameBoard = (()=>{
    const _cells = new Array(9);  
    const _cellList = document.querySelectorAll('.cell');

    /** Set up board to have all empty spots. */
    function initBoard(){
        _cells.fill(false);
        _cellList.forEach((cell)=>{
            cell.addEventListener('click',handleCellClick)});
    }

    /** Event listener to handle reset board */
    function resetBoard(){
        _cellList.forEach((cell)=>{
            cell.removeEventListener('click',handleCellClick)});

        _cellList.forEach((cell)=>{
            cell.innerText='';
            if(cell.classList.contains('highlight'))
                cell.classList.remove('highlight');
        });
    }

    /** Return current set of empty spots in the board */
    function getEmptyCells(){
        return _cells.reduce((result,cell,index)=>{
            if(cell === false)
                result.push(index);
            return result;
        },[])
    }
    
    /** Event listener to handle clicking on a spot on the board */
    function handleCellClick(event){
        const index = parseInt(event.target.dataset.index);
        //console.log(`Calling fillcell on index ${index}`);
        fillCell(index,game.getTurn());
        game.playTurn(index);
    }

    /** Fill the current cell with X or O depending on whose turn it is. */
    function fillCell(index,turn){
        //console.log(_cellList);
        // console.log(`Fill cell called for Player ${turn} with index ${index}`);
        // console.log(`_cells[index] = ${_cells[index]}`)
            if(!_cells[index]){
                _cellList[index].innerText = turn === 1? 'X':'O';
                _cells[index]=true;   
            }
    }

    /** Highlight the cells corresponding to indices passed as argument. */
    function highlightCells(...cellIndices){
        cellIndices.forEach(cellIndex =>{
            _cellList[cellIndex].classList.add('highlight');
        });
    }

    /** Check if all spots of board are filled. */
    function isBoardFull(){
        return _cells.every(val => val===true);
    }

    return { fillCell,resetBoard,initBoard,isBoardFull,highlightCells, getEmptyCells};
})();
