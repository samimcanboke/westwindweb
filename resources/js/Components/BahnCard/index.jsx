import React, { useEffect,useState } from 'react';
import moment from 'moment';

const BahnCard = ({bahnCard, user}) => {
    const cardStyle = {
        width: '350px',
        height: '200px',
        backgroundColor: '#333',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        position: 'relative',
    };

   const dbNameStyle = {
    position: 'absolute',
    top: '80px',
    left: '10px',
    fontSize: '32px',
    fontWeight: '900',
    color: '#fff',
   }

   const dbNameStyle2 = {
    position: 'absolute',
    top: '120px',
    left: '10px',
    fontSize: '12px',
    color: 'grey',
   }

    const cardNumberStyle = {
        position: 'absolute',
        top: '130px',
        left: '10px',
        fontSize: '15px',
        marginTop: '20px',
        letterSpacing: '1px',
    };

    const nameStyle = {
        position: 'absolute',
        top: '140px',
        left: '10px',
        fontSize: '14px',
        marginTop: '30px',
    };

    const firstClass = {
        position: 'absolute',
        top: '20px',
        left: '10px',
        fontSize: '24px',
        marginTop: '30px',
        color: 'grey',
    }
    const dbLogo = {
        width: '40px',
        height: '40px',
        position: 'absolute',
        top: '20px',
        right: '20px'
    }

    const validityStyle = {
        position: 'absolute',
        top: '143px',
        right: '10px',
        marginTop: '10px',
        fontSize: '12px',
        maxWidth: '170px',
        textAlign: 'right'

    };
    const bis = {
        fontSize: '18px',
        fontWeight: 'bold',
        color: 'lightgrey'
    }

    const [userBahnCard, setUserBahnCard] = useState(null);


    const getUserBahnCards = () => {
        axios.get(route("bahn-cards-show-user", user.id)).then((res) => {
            setUserBahnCard(res.data.data[0]);
            console.log(res.data.data[0]);
        });
    };


    useEffect(()=>{
        if(user.id){
            getUserBahnCards()
        }
    },[user.id])

    return (
            <div style={cardStyle}>
                {userBahnCard && (
                    <>
                <div style={dbLogo}>
                    <img  id="img1"
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZ0AAAEhCAMAAACTCY2eAAAAAXNSR0IB2cksfwAAAPxQTFRFAAAA/v/6///9//////7//v/////7/f/8/PTy/v7+/PXw//78//38/v78//3//v7//v/9//79/fPy/v35/P/9/P///fP0+///+//+//3+//Lw/v/7/PLy//39/vTy+/T0///6/f/+/vLy/f7//v3//fPx/PPy/vTz+//6//z///77+/Xy+//8//Ty//Lz/fT1//z9/v/5//P1/fP2+/L0+f///vL0/f/6+v/+/PLu+fPz//76/vL2/fLz//H1/vT1+vXy//Ly+//7/PL0+v7//P79//Px//Xx+vDr//36/P/7+vXw/vz9+//9/f39/vz//f3/+fXx//v//fLyHme6EAAAAFR0Uk5TAP////////+y/2X/////////mf///8z///9l/5n/suX//7L//3+ZzP///7L/spnl///MzLL/sv//TMz/spl/5ZmZ/7L//39/Mv//Zf//////f/+ZNBUKRgAAH7JJREFUeJztXflzI8d17tdz4JgZEBfBXYsEubKO+MrpyEcpsuxKUiWrUv4h/2dSSWxX7CrHiu34duJYFV9ytEuQipbExQUGN6ZfusHliiTm6CEwAAY7n2p3Rc6g0cA3/fq91+8AEgAAEH+xoPsShAOqMMWgbxX8LqZhvMT5JHAB6H2/q96XNJYe+JKXYBlAOvW85vX1K0QfUwQnoSda0NQQAJnjftX926cEsqRPiTpN9ptoQRnSLN/bu64LyI2dIlOeEE4oUdDsRjy75x2AlGC+RbEI5y5X53+1M55gdsjKrXQvpfWin+BzDYoZHJahYdgE58XbHDsfO997DMTsIjH7WGivZIrPMfjenm+aAydn0yncP7119TY7CiqIlFXOgFDDBpLsO9GCqwTclkwPQWxASG7tPrfY2bFXN7EELrgp3W6ys/vEQ7VLsCLAjdVzg52DRuIbWDOAXd9LrrOjMauTWJ/rhdXDa6vnGhuU/3/FRelOsEJQJzP6iJ6P2Ek5Zs/hakOCdYIrbpb9jJ5n7OwMFM1WEr/amiEUawZXutkVG9UPuMzrEj1RC9YMnUwZ2T++/OGKHWVt00lwHVCYKhfwwqOnP13+k0+8nRuC6glTEA8ezX64ZOfFWqINbAYQqhdPSm24XxM/XbKj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"/>
                </div>

                <div>
                    {userBahnCard.class == 1 && <h3 style={firstClass}>1.st Klasse</h3>}
                    <h2 style={dbNameStyle}>BahnCard 100</h2>
                    <p style={dbNameStyle2}>inkl. Deutschland-Ticket</p>
                </div>
                <div style={cardNumberStyle}>
                    {userBahnCard.number}
                </div>
                <div style={nameStyle}>
                   {user.name}
                </div>
                <div style={validityStyle}>
                    GÜLTIG VOM {userBahnCard.valid_from && moment(userBahnCard.valid_from).format('DD.MM.YYYY')} BIS <span style={bis}>{ userBahnCard.valid_to && moment(userBahnCard.valid_to).format('DD.MM.YYYY')}</span>
                </div>
                </>
                )
                }
            </div>
        ) 
}

export default BahnCard;
