$( document ).ready(function(){
    const intervalId = window.setInterval(function(){ updateClock();}, 100);

    // updateClock();

}); 


function describeArc(x, y, radius, startAngle, endAngle){
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [  "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
    return d;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
}


const fullDayMilli = 86400000;
const halfDayMilli = fullDayMilli/2;


function updateClock(){

    const nowMilli = Date.now();
    const midnightDate = new Date();
    midnightDate.setHours(0);
    midnightDate.setMinutes(0);
    midnightDate.setSeconds(0);
    midnightDate.setMilliseconds(0);
    const midnightMilli = midnightDate.getTime();

    const timeMilliRaw = nowMilli-midnightMilli+halfDayMilli;
    const timeMilli = timeMilliRaw>fullDayMilli 
            ? timeMilliRaw-fullDayMilli : timeMilliRaw;
    const hourRot = timeMilli/fullDayMilli * 360;

    const timeMillBlue = nowMilli-midnightMilli;
    updateBlueFace(timeMillBlue);


    const decOfDayOut = roundTo(timeMilli/fullDayMilli, 5, 7 );
    const percentOfDayOut = roundTo( timeMilli/fullDayMilli *100, 3, 6 )  +"%";



    $(".decOfDay").text( decOfDayOut );
    $(".percentOfDay").text( percentOfDayOut );

    const onePentour = fullDayMilli/5;
    const onePenite = onePentour/125;
    const onePentec = onePenite/125;

    const currPentour = timeMilli/onePentour;
    $(".pentour").text( roundTo(currPentour, 3, 5 ) );
    const currPentite = timeMilli/onePenite %125;
    $(".pentite").text( roundTo(currPentite, 3, 6 ) );
    const currPentec = (timeMilli/onePentec) %125;
    $(".pentec").text( roundTo(currPentec, 1, 5 ) );

    updateDigital(currPentour,currPentite, currPentec);
    const hourHand = $(".green .hour-hand");
    hourHand.attr( "transform", `rotate(${hourRot})` );
    const minuteHand = $(".green .minute-hand");
    const minuteRot = currPentite/125*360;
    minuteHand.attr( "transform", `rotate(${minuteRot})` );
    const secondHand = $(".green .second-hand");
    const secondRot = ~~(currPentec) * 2.88;
    secondHand.attr( "transform", `rotate(${secondRot})` );
}


function updateBlueFace( timeInMillis ){
    // gotta handle am/pm
    if( timeInMillis > 43200000 )
    timeInMillis = timeInMillis-43200000;
    const oneHourMilli = 3600000;
    const hourRot = timeInMillis/halfDayMilli*360;
    $(".blue .hour-hand").attr("transform", `rotate(${ hourRot })` );


    const currTime = new Date();
    const currMinute = currTime.getMinutes();
    const currSeconds = currTime.getSeconds();

    const minRot = getBlueRot( currMinute, 60 );
    const secRot = getBlueRot( currSeconds, 60 );

    $(".blue .minute-hand").attr("transform", `rotate(${ minRot })` );
    $(".blue .second-hand").attr("transform", `rotate(${ secRot })` );




    // const oneMinuteMilli = 60000;
    // const currMinuteMilli = timeInMillis % oneMinuteMilli;
    // const minRot = currMinuteMilli/oneHourMilli*360;

    // console.log( timeInMillis, minRot  );

    // $(".blue .minute-hand").attr("transform", `rotate(${ minRot })` );

    // const secNum = now.getSeconds();
    // $(".blue .second-hand").attr("transform",
    //         `rotate(${getBlueRot(secNum,60)})` );
}

function getBlueRot( count, max ){
    if( count <= 0 ) return 0;
    if( max <= 0 ) return 0;
    return ~~(count / max *360);
}





const HOUR_CHARS = ["P", "Æ", "R", "D", "A"];
function updateDigital( hour, minute, sec ){
    const hourInt = ~~(hour);
    const hourChar = HOUR_CHARS[hourInt];
    const minInt = ~~(minute);
    const secInt = ~~(sec);
    const minText = ( "000"+minInt ).slice( -3 );
    const secText = ( "000"+secInt ).slice( -3 );
    $( ".digital" ).text( `${hourChar}:${minText}:${secText}`);
    $(".main-num text").removeClass( "curr" );
    $(".num"+hourInt).addClass( "curr" );
}




function roundTo( val, places, padTo ){
    const out = Math.round( val * Math.pow(10,places) )  /Math.pow(10,places);
    if( !out ) return "0";
    if( !padTo ) return out;
    if( out.length >= padTo ) return out;

    const padded = out +"000000000000000000";
    return padded.substring( 0, padTo );
}