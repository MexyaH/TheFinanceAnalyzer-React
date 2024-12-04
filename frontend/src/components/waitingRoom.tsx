import React, { useState, useEffect, useContext } from 'react';

const WaitingRoom: React.FC = () => {
    const [isTurn, setIsTurn] = useState(false);
    const [peopleAhead, setPeopleAhead] = useState(0);


    return (
        <div className="waiting-room">
            {isTurn ? (
                <h1>Welcome to the Website!</h1>
            ) : (
                <div className="waiting-message">
                    <h1>Please wait for your turn...</h1>
                    <p>You have {peopleAhead} people ahead of you.</p>
                    <p>You will be redirected once it's your turn.</p>
                </div>
            )}
        </div>
    );
};

export default WaitingRoom;