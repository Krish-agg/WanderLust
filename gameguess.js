const max=prompt("Enterr the max number");
const random=Math.floor(Math.random()*max)+1;
console.log("Game Started");
let guess=prompt("Guess the number");
while(true){
    
    if(guess==random){
        console.log("you guess the right number",random);
        break;
    }
    else if(guess=="quit"){
        console.log("Game Exited")
        break;
    }
    else if(guess<random){
        guess=prompt("Your guess is too small,please try again");
    }
    else if(guess>random){
        guess=prompt("Your guess is too large,please try again");
    }
    else{
        guess=prompt("Wrong guess,please try again");
    }
    
}
