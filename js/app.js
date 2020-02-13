/*
  Файл по работе с функциональностью дивов на странице
  Предназначен для правого меню и работы со списком пользователей и выходом из
  комнаты / приостановлении игры на паузу, работой с таймером
*/

const people = [
  {
    name: "TVBlackman1",
    description: "Нечистый на руку",
    img: "images/people/TVBlackman1.png",
    color: "rgb(101, 187, 241)"
  },
  {
    name: "Siilas",
    description: "Модальное окно",
    img: "images/people/Siilas.png",
    color: "rgb(101, 241, 124)"
  },
  {
    name: "Racoon",
    description: "Ананас??!",
    img: "images/people/Racoon.png",
    color: "rgb(241, 101, 193)"
  }
];

const achievements = [
  {
    name: "Жестоко отплати",
    description: "Вернуть долг монетами",
    img: "images/achievements/first.png",
    color: "rgb(125, 241, 101)"
  },
  {
    name: "Узнал новое слово",
    description: "Модальное окно это, глупые?!",
    img: "images/achievements/second.png",
    color: "rgb(221, 241, 101)"
  },
  {
    name: "Подать годные идеи",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(242, 88, 61)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  },
  {
    name: "NONAME",
    description: "Не вместилось сори никита =(",
    img: "images/achievements/third.png",
    color: "rgb(177, 177, 177)"
  }
];

new Vue({
  el: '#right-menu',
  data: {
    people: people,
    achievements: achievements,
    current_time: "17:40"
  }
});
