//Change user exp
const expTable = {
  comment: 300,
  favorite: 100,
  dailycheck: 200
}

export const changeExp = (actionType, exp = 0, role) => {
  //Change exp based on action type
  let expGain = expTable[actionType] + exp;
  if(role === 'VIP reader') {
    expGain += expTable[actionType]; // VIP readers gain 100% more exp
  }

  return expGain;
}

const levelThreshold = [500, 2000, 5000, 10000, 20000]
const rankTable = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']

export const checkLevelChange = (exp = 0) => {
  //Check if user level up
  let level = 0;
  let rank = 'Bronze';

  for (let i = 0; i < levelThreshold.length; i++) {
    if (exp >= levelThreshold[i]) {
      level = i + 1;
      rank = rankTable[i + 1];
    } else {
      break;
    }
  }
  return { level, rank };
}